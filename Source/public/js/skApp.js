//-------------------------------------------------
//
//	skApp
//
//-------------------------------------------------

function skApp() {
	this._elements = [];
	this._constraints = [];

	this.addElement = function (type, pt1, pt2) {
		var element;
		if (type === kLineSegment) {
			element = new skLineSegment(new skMLineSegment(pt1, pt2));
		}
		else if (type === kOval) {
			element = new skOval(new skMOval(new skMRectangle(pt1, pt2), false));
		}
						
		return element;
	}
	
	this.addConstraint = function(constraint) {
		this._constraints.push(constraint);
	}
	
}