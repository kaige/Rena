// element type
//
var kUnknown = 0;
var kLineSegment = 1;
var kRectangle = 2;
var kOval = 3;
var kCircle = 4;

//-------------------------------------------------
//
//	skElement: the base class storing line-width, color, ..., etc
//
//-------------------------------------------------

function skElement() {
	this._lineWidth = 1;
	this._color = "#000000";
	this._text = "";
	this._connectors = [];
	this._geom = null;
	
	this.setLineWidth = function(w) {
		this._lineWidth = w;
	}
	
	this.lineWidth = function () {
		return this._lineWidth;
	}
	
	this.setColor = function(color) {
		this._color = color;
	}
	
	this.color = function() {
		return this._color;
	}
	
	this.setText = function(text) {
		this._text = text;
	}
	
	this.text = function() {
		return this._text;
	}
	
	this.geom = function() {
		return this._geom;
	}
}

//-------------------------------------------------
//
//	skPoint
//
//-------------------------------------------------

function skPoint (point) {
	skElement.call(this);		// inherit properties
	
	this._geom = point;
	
}

skPoint.prototype = new skElement();			// inherit methods

//-------------------------------------------------
//
//	skLineSegment
//
//-------------------------------------------------

function skLineSegment (lineSegment) {
	skElement.call(this);			// inherit properties
	
	this._geom = lineSegment;
	
	this.geomType = function() {
		return kLineSegment;
	}
}

skLineSegment.prototype = new skElement();			// inherit methods

//-------------------------------------------------
//
//	skRectangle
//
//-------------------------------------------------

function skRectangle (rectangle) {
	skElement.call(this);		// inherit properties
	
	this._geom = rectangle;
	
	this.geomType = function() {
		return kRectangle;
	}
}

skRectangle.prototype = new skElement();			// inherit methods

//-------------------------------------------------
//
//	skOval
//
//-------------------------------------------------

function skOval (oval) {
	skElement.call(this);		// inherit properties
	
	this._geom = oval;
	
	this.geomType = function() {
		return kOval;
	}
}

skOval.prototype = new skElement();			// inherit methods

//-------------------------------------------------
//
//	skCircle
//
//-------------------------------------------------

function skCircle (circle) {
	skElement.call(this);		// inherit properties
	
	this._geom = circle;
	
	this.geomType = function() {
		return kCircle;
	}
}

skCircle.prototype = new skElement();			// inherit methods