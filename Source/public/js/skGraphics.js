//-------------------------------------------------
//
//	skGraphicsManager
//
//-------------------------------------------------

function skGraphicsManager () {
	
	// set up paper with canvas
	//
	paper.install(window);
	paper.setup('drawing_canvas');	
	clipDrawingArea();
	
	// graphics manager properties and methods
	//
	this._paths = [];
	this._tempPath = null;
	
	this.tempPath = function() {
		return this._tempPath;
	}
	
	this.setTempPath = function(path) {
		this._tempPath = path;
	}
	
	this.removeTempPath = function() {
		if (this._tempPath !== null) {
			this._tempPath.remove();
			this._tempPath = null;
		}			
	}
	
	this.addPath = function(path) {
		this._paths.push(path);
	}
	
	// set up mouse event
	//
	var tool = new Tool();
	
	tool.onMouseDrag = function(event) {
		var pt1 = event.downPoint;
		var pt2 = event.point;
		rnGraphicsMgr.removeTempPath();
		rnGraphicsMgr.setTempPath(createPath(pt1, pt2));			
	}
	
	tool.onMouseUp = function(event) {
		var pt1 = event.downPoint;
		var pt2 = event.point;
		if (pt1.equals(pt2)) {						// give shapes a default size when user just clicks the mouse
			var c = new skGraphicsConstant();
			pt2 = pt1.add(c.defaultPtOffsetX(), c.defaultPtOffsetY());
		}			
		
		rnGraphicsMgr.removeTempPath();
		rnGraphicsMgr.addPath(createPath(pt1, pt2));
		
		var mPt1 = new skMPoint(pt1.x, pt1.y);
		var mPt2 = new skMPoint(pt2.x, pt2.y);
		rnApp.addElement(rnApp.createElement(mPt1, mPt2));
	}
	
	function createPath(pt1, pt2) {
		
		var createGeomType = rnApp.createGeomType();
		var path;
		if (createGeomType == kLineSegment) {
			path = new Path.Line(pt1, pt2);			
		}
		else if (createGeomType == kOval) {
			var enclosingRect = new Rectangle(pt1, pt2);
			path = new Path.Oval(enclosingRect, false);
		}
		else
			return null;
		
		path.strokeColor = 'black';	
		return path;
	}
	
	function clipDrawingArea() {
		// draw a white rectangle as the suggested drawing area (but like Google doc and MS power-point, we can still draw outside)
	    //
		var c = new skGraphicsConstant();
		var path = new Path.Rectangle(new Point(c.backgroundPt1X(), c.backgroundPt1Y()), new Point(c.backgroundPt2X(), c.backgroundPt2Y()));
		path.fillColor = 'white';
		path.shadowColor = '#101010';
		path.shadowBlur = 30;
		view.draw();
	}
	
}

//-------------------------------------------------
//
//	define a function to get all constant so they're not in global space
//
//-------------------------------------------------

function skGraphicsConstant() {
	this.defaultPtOffsetX = function() {
		return 80;
	}
	
	this.defaultPtOffsetY = function() {
		return 80;
	}
	
	this.backgroundPt1X = function() {
		return 50;
	}
	
	this.backgroundPt1Y = function() {
		return 20;
	}
	
	this.backgroundPt2X = function() {
		return 950;
	}
	
	this.backgroundPt2Y = function() {
		return 620;
	}
}

