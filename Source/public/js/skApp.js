var kDefaultOffsetX = 10;
var kDefaultOffsetY = kDefaultOffsetX;
//-------------------------------------------------
//
//	skApp
//
//-------------------------------------------------

function skApp() {
	this._elements = [];
	this._constraints = [];
	this._createElementType = kUnknown;
	
	this.setCreateElementtype = function(type) {
		this._createElementType = type;
	}
	
	this.createGeomType = function() {
		return this._createElementType;
	}
	
	this.createElement = function (pt1, pt2) {
		if (pt1 === pt2)
			pt2 = new skMPoint(pt1.x() + kDefaultOffsetX, pt1.y() + kDefaultOffsetY);
		
		var element;
		if (this._createElementType == kLineSegment) {
			element = new skLineSegment(new skMLineSegment(pt1, pt2));
		}
		else if (this._createElementType = kOval) {
			element = new skOval(new skMOval(new skMRect(pt1, pt2), false));
		}
						
		return element;
	}
	
	this.addElement = function (element) {
		this._elements.push(element);
	}
	
	this.addConstraint = function(constraint) {
		this._constraints.push(constraint);
	}
	
}