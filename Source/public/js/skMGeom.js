//-------------------------------------------------
//
//	math vector type
//
//-------------------------------------------------

function skMVector(x, y) {
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
	
	this.move = function(dx, dy) {
	    this._x += dx;
	    this._y += dy;
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
	
	this.move = function(dx, dy) {
	    this._startPt.move(dx, dy);
	    this._endPt.move(dx, dy);
	}
	
	this.reset = function (pt1, pt2) {
	    this._startPt = pt1;
	    this._endPt = pt2;
	}	
}

//-------------------------------------------------
//
//	math rectangle type
//
//-------------------------------------------------

function skMRectangle(pt1, pt2) {
	this._topLeft = pt1;
	this._bottomRight = pt2;
	
	this.topLeft = function() {
		return this._topLeft;
	}
	
	this.bottomRight = function() {
		return this._bottomRight;
	}
	
	this.setTopLeft = function(pt) {
		this._topLeft = pt;
	}
	
	this.setBottomRight = function(pt) {
		this._bottomRight = pt;
	}
	
	this.move = function (dx, dy) {
	    this._topLeft.move(dx, dy);
	    this._bottomRight.move(dx, dy);
	}
	
	this.reset = function (pt1, pt2) {
	    this._topLeft = pt1;
	    this._bottomRight = pt2;
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
	
	this.move = function (dx, dy) {
	    this._rect.move(dx, dy);
	}
	
	this.reset = function (pt1, pt2) {
	    this._rect.reset(pt1, pt2);
	}	
}