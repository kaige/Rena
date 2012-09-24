function skMPoint(x, y) {
	this._x = x;
	this._y = y;
}

function skMLineSegment(pt1, pt2) {
	this._startPt = pt1;
	this._endPt = pt2;
}

function skMRectangle(pt1, pt2) {
	this._ulPt = pt1;
	this._lrPt = pt2;
}

function skMOval(rect, circumscribed) {
	this._rect = rect;
	this._circum = circumscribed;	// true: rectangle fits into oval; false: oval fits into rectangle
}

function skMCircle(pt, r) {
	this._center = pt;
	this._radius = r;
}