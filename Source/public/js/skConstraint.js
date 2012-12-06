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

    this.offset = function () {
        return this._offset;
    }

    this.setOffset = function (offset) {
        this._offset = v;
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