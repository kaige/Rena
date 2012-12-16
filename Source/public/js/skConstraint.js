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
        this._element1;
    }

    this.element2 = function () {
        this._element2;
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