//-------------------------------------------------
//
//	skGraphicsManager
//
//-------------------------------------------------

function skGraphicsManager () {
	this._items = [];
	this._tempItem = null;
	
	this.tempItem = function() {
		return this._tempItem;
	}
	
	this.setTempItem = function(item) {
		this._tempItem = item;
	}
	
	this.removeTempItem = function() {
		if (this._tempItem === null)
			return;
		
		this._tempItem.remove();
	}
	
	this.addItem = function(item) {
		this._items.push(item);
	}
	
	function createGraphicsItem(event) {
		var createGeomType = rnApp.createGeomType();
		var item;
		if (createGeomType == kLineSegment) {
			item = new Path.Line(event.downPoint, event.point);
		}
		else if (createGeomType == kOval) {
			item = new Path.Oval(new Path.Rectangle(event.downPoint, event.point), false);
		}
		return item;
	}
	
	var tool = new Tool();
	
	tool.onMouseDrag = function(event) {
		rnGraphicsMgr.removeTempItem();
		rnGraphicsMgr.setTempItem(createGraphicsItem(event));	
		view.draw();
	}
	
	tool.onMouseUP = function(event) {
		rnGraphicsMgr.removeTempItem();
		rnGraphicsMgr.addItem(createGraphicsItem(event));
		view.draw();
		
		var pt1 = new skMPoint(event.downPoint.x, event.downPoint.y);
		var pt2 = new skMPoint(event.point.x, event.point.y);
		rnApp.addElement(rnApp.createElement(pt1, pt2));
	}
	
}

