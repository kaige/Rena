//-------------------------------------------------
//
//	solver geometry type
//
//-------------------------------------------------

function skGCSolverGeom(mathGeometry, solver) {
    this._geom = mathGeometry;
    this._solver = solver;
    this._isGrounded = false;

    this.geom = function () {
        return this._geom;
    }

    this.setIsGrounded = function (b) {
        this._isGrounded = b;
    }

    this.isGrounded = function () {
        return this._isGrounded;
    }

    this.getIndex = function () {
        return this._solver.getIndex(this);
    }
}

//-------------------------------------------------
//
//	point geometry
//
//-------------------------------------------------

function skSPoint(mPt, solver) {
    skGCSolverGeom.call(this, mPt, solver);

    this.numberOfVariables = function () {
        return 2;   // (x, y)
    }

    this.setVariables = function (x) {
        this._geom.setX(x[x.index++]);
        this._geom.setY(x[x.index++]);
    }

    this.getVariables = function (x) {
        x[x.index++] = this._geom.x();
        x[x.index++] = this._geom.y();
    }
}

skSPoint.prototype = new skGCSolverGeom();

//-------------------------------------------------
//
//	line geometry
//
//-------------------------------------------------

function skSLine(mLn, solver) {
    skGCSolverGeom.call(this, mLn, solver);

    this.numberOfVariables = function () {
        return 2;   // start point (x, y). for now we don't consider the rotational DOF
    }

    this.setVariables = function (x) {
        this._geom.startPt().setX(x[x.index++]);
        this._geom.startPt().setY(x[x.index++]);
    }

    this.getVariables = function (x) {
        x[x.index++] = this._geom.startPt().x();
        x[x.index++] = this._geom.startPt().y();
    }
}

skSLine.prototype = new skGCSolverGeom();

//-------------------------------------------------
//
//	solver constraint type
//
//-------------------------------------------------

function skGCSolverCon() {

}

//-------------------------------------------------
//
//	distance-point-line constraint
//
//-------------------------------------------------

function skGCSDistPtLn(pt, ln, offset) {
    skGCSolverCon.call(this);

    this._func = 0;
    this._deriv = new Array(4);
    
    this.numberOfFunctions = function () {
        return 1;
    }

    this.evaluateFuncsAndDerivatives = function () {
        var lnPt = ln.geom().startPt();
        var lnVec = ln.geom().direction();

        var q = pt.geom().subtract(lnPt);
        var lateral = q.dot(lnVec);
        var dist = Math.sqrt(q.dot(q) - lateral * lateral);

        this._func = dist - offset;

        var fac = 1 / (dist);
        this._deriv[0] = fac * (q.x() - lateral * lnVec.x());
        this._deriv[1] = fac * (q.y() - lateral * lnVec.y());
        this._deriv[2] = -this._deriv[0];
        this._deriv[3] = -this._deriv[1];
    }

    this.setFunc = function (funcs) {
        funcs[funcs.index] = this._func;
        funcs.index ++;
    }

    this.setJacobian = function (jacobian) {
        var r = jacobian.index;
        var i;
        for (i = 0; i < jacobian[r].length; i++)
            jacobian[r][i] = 0;

        if (!pt.isGrounded()) {
            var ptIndex = pt.getIndex();
            jacobian[r][ptIndex] = this._deriv[0];
            jacobian[r][ptIndex + 1] = this._deriv[1];
        }

        if (!ln.isGrounded()) {
            var lnIndex = ln.getIndex();
            jacobian[r][lnIndex] = this._deriv[2];
            jacobian[r][lnIndex + 1] = this._deriv[3];
        }

        jacobian.index++;
    }
}

skGCSDistPtLn.prototype = new skGCSolverCon();

//-------------------------------------------------
//
//	solver 
//
//-------------------------------------------------

function skGCSolver() {
    this._geoms = [];
    this._cons = [];
    this._cacheX = [];

    var that = this;

    this.addGeometry = function (g) {
        this._geoms.push(g);
    }

    this.addConstraint = function (c) {
        this._cons.push(c);
    }

    this.getIndex = function (g) {
        var i;
        var index = 0;
        for (i = 0; i < this._geoms.length; i++) {
            if (this._geoms[i] === g)
                return index;
            else {
                if (!this._geoms[i].isGrounded())
                    index += this._geoms[i].numberOfVariables();
            }
        }

        return -1;
    }

    this.createPoint = function (mpt) {
        var sPt = new skSPoint(mpt, this);
        this.addGeometry(sPt);
        return sPt;
    }

    this.createLine = function (mLn) {
        var sLn = new skSLine(mLn, this);
        this.addGeometry(sLn);
        return sLn;
    }

    this.createDistPtLn = function (pt, ln, dist) {
        var con = new skGCSDistPtLn(pt, ln, dist);
        this.addConstraint(con);
        return con;
    }

    this.numberOfVariables = function () {
        var n = 0;
        var i;
        for (i = 0; i < this._geoms.length; i++) {
            if (!this._geoms[i].isGrounded())
                n += this._geoms[i].numberOfVariables();
        }

        return n;
    }

    this.numberOfFunctions = function () {
        var n = 0;
        var i;
        for (i = 0; i < this._cons.length; i++)
            n += this._cons[i].numberOfFunctions();

        return n;
    }

    this.setVariables = function (x) {
        x.index = 0;
        var i = 0;
        for (i = 0; i < this._geoms.length; i++) {
            if (!this._geoms[i].isGrounded()) {
                this._geoms[i].setVariables(x);
            }
        }
    }

    this.getVariables = function (x) {
        x.index = 0;
        var i = 0;
        for (i = 0; i < this._geoms.length; i++) {
            if (!this._geoms[i].isGrounded()) {
                this._geoms[i].getVariables(x);
            }
        }
    }

    this.update = function (x) {
        if (!skSolverUtil.isArrayEqual(this._cacheX, x)) { 
            skSolverUtil.assignArray(this._cacheX, x);      // cache to avoid re-update

            // update geometries
            //
            this.setVariables(x);

            // update constraints
            //
            var i;
            for (i = 0; i < this._cons.length; i++) {
                this._cons[i].evaluateFuncsAndDerivatives();
            }
        }
    }

    this.funcs = function (x) {
        that.update(x);

        var funcs = new Array(that.numberOfFunctions());
        funcs.index = 0;
        var i;
        for (i = 0; i < that._cons.length; i++) {
            that._cons[i].setFunc(funcs);
        }

        return funcs;
    }

    this.jacobian = function (x) {
        that.update(x);

        var jacobianMatrix = new Array(that.numberOfFunctions());
        var i = 0;
        for (i = 0; i < jacobianMatrix.length; i++)
            jacobianMatrix[i] = new Array(x.length);

        jacobianMatrix.index = 0;
        for (i = 0; i < that._cons.length; i++)
            that._cons[i].setJacobian(jacobianMatrix);

        return jacobianMatrix;
    }

    this.solve = function () {
        var x = new Array(this.numberOfVariables());
        this.getVariables(x);
        newton_solve(this.funcs, this.jacobian, x);
    }
}

var skSolverUtil = new (function () {
    this.isArrayEqual = function (array1, array2) {
        if (array1.length === array2.length) {
            var i;
            for (i = 0; i < array1.length; i++) {
                if (array1[i] !== array2[i])
                    return false;
            }
            return true;
        }
        else
            return false;
    }

    this.assignArray = function (array1, array2) {      // array1 <-- array2
        array1.splice(0, array1.length);
        var i;
        for (i = 0; i < array2.length; i++) {
            array1.push(array2[i]);
        }
    }
});