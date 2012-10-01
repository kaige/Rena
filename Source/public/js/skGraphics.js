//-------------------------------------------------
//
//	skGraphicsManager
//
//-------------------------------------------------

function skGraphicsManager() {

    var CONST = {
        defaultOffSet:  { x: 80, y: 80 }
    };

    var hitOptions = {
        segments: true,
        stroke: true,
        fill: true,
        tolerance: 5
    };
	
	// set up paper with canvas
	//
	paper.install(window);
	paper.setup('drawing_canvas');	

	// set up mouse event
	//
	var tool = new Tool();

	tool.onKeyDown = function (event) {
	    if (Key.isDown('escape')) {
	        rnController.setCommandMode(skCmdMode.kNone);
	        rnView.deSelectAllButtons();
	        project.deselectAll();
	        view.draw();
	    }
	}

	tool.onMouseDown = function (event) {
	    if (rnController.commandMode() == skCmdMode.kNone) {
	        project.deselectAll();
	        var hitResult = project.hitTest(event.point, hitOptions);
	        if (hitResult) {
	            hitResult.item.selected = true;
	            project.activeLayer.addChild(hitResult.item);	            
	        }
	        view.draw();
	    }
	}
	
	tool.onMouseDrag = function (event) {
	    if (rnController.commandMode() == skCmdMode.kCreateGeom) {
	        var pt1 = event.downPoint;
	        var pt2 = event.point;
	        var type = rnController.createGeomType();
	        var tempPath = createPath(type, pt1, pt2);
	        tempPath.removeOnDrag();
	        tempPath.removeOnUp();
	    }
	    else if (rnController.commandMode() == skCmdMode.kNone) {
	        if (project.selectedItems.length > 0) {
	            var i;
	            for (i = 0; i < project.selectedItems.length; i++) {
	                project.selectedItems[i].translate(event.delta);
	            }
	            view.draw();
	        }
	    }
	}
	
	tool.onMouseUp = function (event) {
	    if (rnController.commandMode() == skCmdMode.kCreateGeom) {
	        var pt1 = event.downPoint;
	        var pt2 = event.point;
	        if (pt1.equals(pt2)) {						// give shapes a default size when user just clicks the mouse
	            pt2 = pt1.add(CONST.defaultOffSet.x, CONST.defaultOffSet.y);
	        }

	        var type = rnController.createGeomType();

	        project.deselectAll();
	        var newPath = createPath(type, pt1, pt2);
	        newPath.selected = true;
	        view.draw();

	        var mPt1 = new skMPoint(pt1.x, pt1.y);
	        var mPt2 = new skMPoint(pt2.x, pt2.y);
	        rnApp.addElement(type, mPt1, mPt2);
	    }
	}
	
	function createPath(type, pt1, pt2) {		
		var path;
		if (type === kLineSegment) {
			path = new Path.Line(pt1, pt2);			
		}
		else if (type === kOval) {
			var enclosingRect = new Rectangle(pt1, pt2);
			path = new Path.Oval(enclosingRect, false);
		}
		else
			return null;
		
		path.strokeColor = 'black';
		path.fillColor = 'white';
		return path;
	}	
}


