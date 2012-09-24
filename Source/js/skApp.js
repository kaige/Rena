// geometry type
//
var kUnknown = 0;
var kLine = 1;
var kOval = 2;

//-------------------------------------------------
//
//	skApp
//
//-------------------------------------------------

function skApp() {
	this._elements = [];
	this._constraints = [];
	this._createGeomtype = kUnknown;
	
	this.setCreateGeomtype = function(type) {
		this._createGeomtype = type;
	}
	
	this.createGeom = function (pt1, pt2) {
		
	}
	
}