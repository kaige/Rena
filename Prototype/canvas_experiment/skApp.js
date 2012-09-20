//----------------------------------------
//	skApp, the sketcher application object
//----------------------------------------

// application state types
//
var kNull = 0;
var kCreate = 1;
var kEdit = 2;

// create geometry types
//
var kNullGeom = 0;
var kLine = 1;
var kCircle = 2;

function skApp() {
    // attributes
    //
    this._createGeomType = kNullGeom;
	this._elements = [];
	
	this.createGeomType = function () {
		return this._createGeomType;
	}
	
	this.setCreateGeomType = function (type) {
		this._createGeomType = type;
	}
	
	this.createGeomElement = function (pt1, pt2) {
		var element;
		if (this._createGeomType === kLine) {
			element = new skLine(pt1, pt2);
		}
		else if (this._createGeomType === kCircle) {
			var dx = pt1.x() - pt2.x();
			var dy = pt1.y() - pt2.y();
			var dist = Math.sqrt(dx*dx + dy*dy);
			element = new skCircle(pt1, dist);
		}
		return element;
	}
	
	this.append = function(element) {
		this._elements.push(element);
	}

	this.testFunc = function (ctx) {
		var element = this._elements.pop();
		element.erase(ctx);	
		alert("last element erased!");
	}

}

//-------------------------------------------------
//
//	skElement
//
//-------------------------------------------------
function skElement() {

	this.erase = function(ctx) {
		ctx.save();
		ctx.lineWidth = 3;
		ctx.strokeStyle = "FFFFFF";		
		this.draw(ctx);		
		ctx.restore();
	}
	
	this.draw = function(ctx) {
	}
}



//-------------------------------------------------
//
//	skPoint
//
//-------------------------------------------------
function skPoint(x, y) {
	this._x = x;
	this._y = y;
	
	this.x = function() {return this._x; }
	this.y = function() {return this._y; }	
	
	this.setX = function(x) {this._x = x;}
	this.setY = function(y) {this._y = y;}
}

//-------------------------------------------------
//
//	skLine
//
//-------------------------------------------------
function skLine(pt1, pt2) {
	skElement.call(this);			// inherit properties
	
	this._startPt = pt1;
	this._endPt = pt2;
	
	this.startPt = function() { return this._startPt; }
	this.endPt = function() {return this._endPt; }
	
	this.draw = function(ctx) {
		ctx.beginPath();
		ctx.moveTo(this._startPt.x(), this._startPt.y());
		ctx.lineTo(this._endPt.x(), this._endPt.y());
		ctx.stroke();
		ctx.closePath();
	}

}

skLine.prototype = new skElement();			// inherit methods

//-------------------------------------------------
//
//	skCircle
//
//-------------------------------------------------
function skCircle(pt, r) {
	skElement.call(this);		// inherit properties
	
	this._center = pt;
	this._radius = r;
	
	this.center = function() {return this._center; }
	this.radius = function() {return this._radius; }
	
	this.draw = function(ctx) {
		ctx.beginPath();
		ctx.arc(this._center.x(), this._center.y(), this._radius, 0, 2.0*Math.PI);
		ctx.stroke();
		ctx.closePath();
	}
}

skCircle.prototype = new skElement();		// inherit methods




