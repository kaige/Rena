//-------------------------------------------------
//
//	skConstraint: the constraints and dimensions
//
//-------------------------------------------------

function skConstraint(element1, geom1, element2, geom2, offset) {
    this._element1 = element1;
    this._geom1 = geom1;
    this._element2 = element2;
    this._geom2 = geom2;
    this._offset = offset;

    this.geom1 = function () {
        return this._geom1;
    }

    this.geom2 = function () {
        return this._geom2;
    }

    this.element1 = function () {
        return this._element1;
    }

    this.element2 = function () {
        return this._element2;
    }

    this.offset = function () {
        return this._offset;
    }

    this.setOffset = function (v) {
        this._offset = v;
    }

    this.setGeom1 = function (g1) {
        this._geom1 = g1;
    }

    this.setGeom2 = function (g2) {
        this._geom2 = g2;
    }

    this.load = function (solveContext) { }
    this.onEditOffsetValue = function () { }
    this.afterEditOffsetValue = function () { }
}

//-------------------------------------------------
//
//	skDimension
//
//-------------------------------------------------

function skDimension(element1, geom1, element2, geom2, offset) {
    skConstraint.call(this, element1, geom1, element2, geom2, offset);
}

skDimension.prototype = new skConstraint();

//-------------------------------------------------
//
//	skLinearDimension
//
//-------------------------------------------------

function skLinearDimension(element1, geom1, element2, geom2, offset) {
    skDimension.call(this, element1, geom1, element2, geom2, offset);
}

skLinearDimension.prototype = new skDimension();

//-------------------------------------------------
//
//	skDistPtLn
//
//-------------------------------------------------

function skDistPtLn(element1, geom1, element2, geom2, offset) {
    skLinearDimension.call(this, element1, geom1, element2, geom2, offset);

    this._tempGroundElements = [];

    this.load = function (solveContext) {
        var gcSolver = solveContext.solver();

        var sPt = gcSolver.createPoint(this.geom1());
        sPt.setIsGrounded(this.element1().grounded());
        solveContext.addElementToGeometryMap(this.element1(), sPt);

        var sLn = gcSolver.createLine(this.geom2().getLine());
        sLn.setIsGrounded(this.element2().grounded());
        solveContext.addElementToGeometryMap(this.element2(), sLn);

        var con = gcSolver.createDistPtLn(sPt, sLn, this.offset());
    }

    this.onEditOffsetValue = function () {
        if (!this.element1().grounded() && !this.element2().grounded()) {
            this.element2().setGrounded(true);
            this._tempGroundElements.push(this.element2());
        }
    }

    this.afterEditOffsetValue = function () {
        var i;
        for (i = 0; i < this._tempGroundElements.length; i++)
            this._tempGroundElements[i].setGrounded(false);
    }
}

skDistPtLn.prototype = new skLinearDimension();

//-------------------------------------------------
//
//	skDistPtPt
//
//-------------------------------------------------

function skDistPtPt() {
    skLinearDimension.call(this);
}

skDistPtPt.prototype = new skLinearDimension();

//-------------------------------------------------
//
//	skDistLnLn
//
//-------------------------------------------------

function skDistLnLn() {
    skLinearDimension.call(this);
}

skDistLnLn.prototype = new skLinearDimension();

//-------------------------------------------------
//
//	skAngularDimension
//
//-------------------------------------------------

function skAngularDimension() {
    skDimension.call(this);
}

skAngularDimension.prototype = new skDimension();

//-------------------------------------------------
//
//	skAngLnLn
//
//-------------------------------------------------

function skAngLnLn() {
    skAngularDimension.call(this);
}

skAngLnLn.prototype = new skAngularDimension();

//-------------------------------------------------
//
//	skGeomConstraint
//
//-------------------------------------------------

function skGeomConstraint() {
    skConstraint.call(this);
}

skGeomConstraint.prototype = new skConstraint();



//-------------------------------------------------
//
//	skConstraintSolveContext
//
//-------------------------------------------------

function skConstraintSolveContext(skapp) {
    this._skApp = skapp;
    this._elementToGeomMap = new skElementToGeometryMap();
    this._gcSolver = new skGCSolver();

    this.solver = function () {
        return this._gcSolver;
    }

    this.loadConstraints = function () {
        var i;
        var cons = this._skApp.constraints();
        for (i = 0; i < cons.length; i++)
            cons[i].load(this);
    }

    this.solve = function () {
        this.cacheElementsOldPos();
        this._gcSolver.solve();
    }

    this.translateSolution = function () {
        var allEntries = this._elementToGeomMap.entries();
        var i;
        for (i = 0; i < allEntries.length; i++) {
            var element = allEntries[i].skElement();
            var oldPos = allEntries[i].oldPos();
            var newPos = allEntries[i].firstSolverGeometry().pos();
            var delta = newPos.subtract(oldPos);
            element.move(delta.x(), delta.y());
        }
    }

    this.cacheElementsOldPos = function () {
        var allEntries = this._elementToGeomMap.entries();
        var i;
        for (i = 0; i < allEntries.length; i++)
            allEntries[i].setOldPos(allEntries[i].firstSolverGeometry().pos());
    }

    this.addElementToGeometryMap = function (element, sgeom) {
        this._elementToGeomMap.add(element, sgeom);
    }
}

function skElementToGeometryMapEntry(element) {
    this._skElement = element;
    this._oldPos = null;
    this._solverGeometries = [];

    this.skElement = function () {
        return this._skElement;
    }

    this.solverGeometries = function () {
        return this._solverGeometries;
    }

    this.addSolverGeometry = function (g) {
        this._solverGeometries.push(g);
    }

    this.oldPos = function () {
        return this._oldPos;
    }

    this.setOldPos = function (pos) {
        this._oldPos = pos;
    }

    this.firstSolverGeometry = function() {
        return this._solverGeometries[0];
    }
}

function skElementToGeometryMap() {
    this._map = [];

    this.add = function (element, solverGeometry) {
        var entry = this.getEntry(element);
        if (!entry)
            entry = this.createNewEntry(element);

        entry.addSolverGeometry(solverGeometry);
    }

    this.getEntry = function (element) {
        var entry = null;
        var i;
        for (i = 0; i < this._map.length; i++) {
            if (this._map[i].skElement() === element) {
                entry = this._map[i];
                break;
            }
        }
        return entry;
    }

    this.createNewEntry = function (element) {
        var newEntry = new skElementToGeometryMapEntry(element);
        this._map.push(newEntry);
        return newEntry;
    }

    this.entries = function () {
        return this._map;
    }

}