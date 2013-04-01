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
	this._strokeWidth = 1;
	this._strokeColor = "#000000";
	this._fillColor = "#FFFFFF";
	this._text = "";
	this._connectors = [];
	this._geom = null;
	this._listeners = [];
	this._grounded = false;
	
	var geomChangeEvent = {message: "geometry changed"};
	
	this.setStrokeWidth = function(w) {
		this._strokeWidth = w;
	}
	
	this.strokeWidth = function () {
		return this._strokeWidth;
	}
	
	this.setStrokeColor = function(color) {
		this._strokeColor = color;
	}
	
	this.strokeColor = function() {
		return this._strokeColor;
	}

	this.setFillColor = function (color) {
	    this._fillColor = color;
	}

	this.fillColor = function () {
	    return this._fillColor;
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
	
	this.move = function (dx, dy) {
	    this._geom.move(dx, dy);
	    this.notify(geomChangeEvent);
	}
	
	this.reset = function (pt1, pt2) {
	    this._geom.reset(pt1, pt2);
	    this.notify(geomChangeEvent);
	}

	this.angle = function () {
	    return this._geom.angle();
	}

	this.setAngle = function (ang) {
	    this._geom.setAngle(ang);
	}

	this.notify = function (event) {
	    var i;
	    for (i = 0; i < this._listeners.length; i++) {
	        this._listeners[i].notify(event);
	    }
	}

	this.addListener = function (listener) {
	    this._listeners.push(listener);
	}

	this.removeListener = function (listener) {
	    var i = this._listeners.indexOf(listener);
	    this._listeners.splice(i, 1);
	}

	this.grounded = function () {
	    return this._grounded;
	}

	this.setGrounded = function (b) {
	    this._grounded = b;
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