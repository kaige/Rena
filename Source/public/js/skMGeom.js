//-------------------------------------------------
//
//	math utilities
//
//-------------------------------------------------

var skMath = new (function () {
    var tol = 0.00001;

    this.isEqual = function (v1, v2) {
        if (Math.abs(v1 - v2) < tol)
            return true;
        else
            return false;
    }
});

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

	this.normalize = function () {
	    var len = Math.sqrt(this._x * this._x + this._y * this._y);
	    this._x = this._x / len;
	    this._y = this._y / len;
	}

	this.dot = function (vec) {
	    var dot = this._x * vec._x + this._y * vec._y;
	    return dot;
	}

	this.multiply = function (d) {
	    return new skMVector(this._x * d, this._y * d);
	}

	this.length = function () {
	    return Math.sqrt(this._x * this._x + this._y * this._y);
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

	this.subtract = function (pt) {
	    return new skMVector(this._x - pt._x, this._y - pt._y);
	}

	this.add = function (vec) {
	    return new skMPoint(this._x + vec._x, this._y + vec._y);
	}

	this.distance = function (pt) {
	    var dx = this._x - pt._x;
	    var dy = this._y - pt._y;
	    return Math.sqrt(dx * dx + dy * dy);
	}

	this.mid = function (pt) {
	    return new skMPoint(0.5*(this._x + pt._x), 0.5*(this._y + pt._y));
	}
}

//-------------------------------------------------
//
//	math line type
//
//-------------------------------------------------

function skMLine(pt, vec) {
    this._startPt = pt;
    this._direction = vec;
    this._direction.normalize();

    this.startPt = function () {
        return this._startPt;
    }

    this.direction = function () {
        return this._direction;
    }

    this.distance = function (pt) {
        var q = pt.subtract(this._startPt);
        var lateral = q.dot(this._direction);
        var dist = Math.sqrt(q.dot(q) - lateral * lateral);
        return dist;
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

	this.getLine = function () {
	    var vec = this._endPt.subtract(this._startPt);
	    return new skMLine(this._startPt, vec);
	}

	this.length = function () {
	    return this._startPt.distance(this._endPt);
	}

	this.mid = function () {
	    return this._startPt.mid(this._endPt);
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
	this._angle = 0.0;
	
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

	this.angle = function () {
	    return this._angle;
	}

	this.setAngle = function (ang) {
	    this._angle = ang;
	}

	this.center = function () {
	    return this._topLeft.mid(this._bottomRight);
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

	this.angle = function () {
	    return this._rect.angle();
	}

	this.setAngle = function (ang) {
	    this._rect.setAngle(ang);
	}

	this.center = function () {
	    return this._rect.center();
	}
}