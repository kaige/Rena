//-------------------------------------------------
//
//	math point type
//
//-------------------------------------------------

function skMPoint(x, y) {
	this._x = x;
	this._y = y;
	
	this.x = function() {
		return this._x;
	}
	
	this.y = function() {
		return this._y;
	}
	
	this.setX = function(xval) {
		this._x = xval;
	}
	
	this.setY = function(yval) {
		this._y = yval;
	}
}

//-------------------------------------------------
//
//	math line segment type
//
//-------------------------------------------------

function skMLineSegment(pt1, pt2) {
	this._startPt = pt1;
	this._endPt = pt2;
	
	this.startPt = function() {
		return this._startPt;
	}
	
	this.endPt = function() {
		return this._endPt;
	}
	
	this.setStartPt = function(pt) {
		this._startPt = pt;
	}
	
	this.setEndPt = function(pt) {
		this._endPt = pt;
	}
}

//-------------------------------------------------
//
//	math rectangle type
//
//-------------------------------------------------

function skMRectangle(pt1, pt2) {
	this._ulPt = pt1;
	this._lrPt = pt2;
	
	this.ulPt = function() {
		return this._ulPt;
	}
	
	this.lrPt = function() {
		return this._lrPt;
	}
	
	this.setUlPt = function(pt) {
		this._ulPt = pt;
	}
	
	this.setLrPt = function(pt) {
		this._lrPt = pt;
	}
}

//-------------------------------------------------
//
//	math oval type
//
//-------------------------------------------------

function skMOval(rect, circumscribed) {
	this._rect = rect;
	this._circum = circumscribed;	// true: rectangle fits into oval; false: oval fits into rectangle
	
	this.rect = function() {
		return this._rect;
	}
	
	this.circum = function() {
		return this._circum;
	}
	
	this.setRect = function(rect) {
		this._rect = rect;
	}
	
	this.setCircum = function(b) {
		this._circum = b;
	}
}

//-------------------------------------------------
//
//	math circle type
//
//-------------------------------------------------

function skMCircle(pt, r) {
	this._center = pt;
	this._radius = r;
	
	this.center = function() {
		return this._center;
	}
	
	this.radius = function() {
		return this._radius;
	}
	
	this.setCenter = function(pt) {
		this._center = pt;
	}
	
	this.setRadius = function(r) {
		this._radius = r;
	}
}