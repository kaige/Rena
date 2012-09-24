//-------------------------------------------------
//
//	skElement: the base class storing line-width, color, ..., etc
//
//-------------------------------------------------

function skElement() {
	this._lineWidth = 1;
	this._color = #000000;
	this._text = "";
	this._connectors = [];
	this._selected = false;
	
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
	
	this.setSelected = function(selected) {
		this._selected = selected;
	}
	
	this.selected = function() {
		return this._selected;
	}
}

//-------------------------------------------------
//
//	skPoint
//
//-------------------------------------------------

function skPoint (point) {
	skElement.call(this);		// inherit properties
	
	this._point = point;
}

skPoint..prototype = new skElement();			// inherit methods

//-------------------------------------------------
//
//	skLineSegment
//
//-------------------------------------------------

function skLineSegment (lineSegment) {
	skElement.call(this);			// inherit properties
	
	this._lineSegment = lineSegment;
}

skLineSegment.prototype = new skElement();			// inherit methods

//-------------------------------------------------
//
//	skRectangle
//
//-------------------------------------------------

function skRectangle (rectangle) {
	skElement.call(this);		// inherit properties
	
	this._rectangle = rectangle;
}

skRectangle.prototype = new skElement();			// inherit methods

//-------------------------------------------------
//
//	skOval
//
//-------------------------------------------------

function skOval (oval) {
	skElement.call(this);		// inherit properties
	
	this._oval = oval;
}

skOval.prototype = new skElement();			// inherit methods

//-------------------------------------------------
//
//	skCircle
//
//-------------------------------------------------

function skCircle (circle) {
	skElement.call(this);		// inherit properties
	
	this._circle = circle;
}

skCircle.prototype = new skElement();			// inherit methods