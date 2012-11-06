//-------------------------------------------------
//
//	global variables and functions
//
//-------------------------------------------------

var rnApp, rnView, rnController, rnGraphicsManager;

window.addEventListener('load', onLoad, false);

function onLoad() {
    rnApp = new skApp();                            // MVC-model
    rnGraphicsManager = new skGraphicsManager();    // MVC-view (graphics area)
    rnView = new skView();                          // MVC-view (menu, tool bar, buttons)
    rnController = new skController();              // MVC-controller
}

//-------------------------------------------------
//
//	skView: the tool-bars, buttons
//
//-------------------------------------------------

function skView() {
	this._createGeomBtnGrp = new skRadioButtonGroup();
	this._createGeomBtnGrp.addRadioButton(new skImgButton("line_btn", "img\\line.png", "img\\line_highlight.png", "img\\line_select.png"));
	this._createGeomBtnGrp.addRadioButton(new skImgButton("oval_btn", "img\\oval.png", "img\\oval_highlight.png", "img\\oval_select.png"));

	this.deSelectAllButtons = function () {
	    // this is a temporary implementation
	    //
	    this._createGeomBtnGrp.onSetSelected(null);
	}
}

//-------------------------------------------------
//
//	skRadioButtonGroup: a group of radio buttons
//
//-------------------------------------------------

function skRadioButtonGroup() {
	this._radioButtons = [];
	
	this.addRadioButton = function(btn) {
		btn._parentGroup = this;
		this._radioButtons.push(btn);
	}
	
	this.onSetSelected = function(selectedBtn) {
		var i;
		for (i = 0; i < this._radioButtons.length; i++) {
			var btn = this._radioButtons[i];
			if (btn !== selectedBtn) {
				btn.setSelected(false);
				btn.init();
			}			
		}			
	}
}


//-------------------------------------------------
//
//	skImgButton: a button with image
//
//-------------------------------------------------

function skImgButton (id, normalImg, highlightImg, selectImg) {
	this._id = id;
	this._obj = document.getElementById(id);
	this._normalImg = normalImg;
	this._highlightImg = highlightImg;
	this._selectImg = selectImg;
	this._isSelected = false;
	
	var that = this;
	
	this.obj = function () {
		return this._obj;
	}
	
	this.setSelected = function(p) {
		this._isSelected = p;
	}
	
	this.init = function () {
		if (!that._isSelected)
			that._obj.src = that._normalImg;
		else
			that._obj.src = that._selectImg;			
	}
	
	this.onMouseOver = function() {
		if (!that._isSelected)
			that._obj.src = that._highlightImg;
	}
	
	this.onMouseOut = function() {
		if (!that._isSelected)
			that._obj.src = that._normalImg;
	}
	
	this.onMouseClick = function() {
		if (!that._isSelected) {
			that._obj.src = that._selectImg;
			that._isSelected = true;
			that._parentGroup.onSetSelected(that);
		}
		
		var command;
		if (id == "line_btn")
		    command = new skCreateLineSegmentCommand();
		else if (id == "oval_btn")
		    command = new skCreateOvalCommand();
        
		rnController.setActiveCommand(command);
	}
	
	this._obj.onmouseover = this.onMouseOver;
	this._obj.onmouseout = this.onMouseOut;
	this._obj.onclick = this.onMouseClick;
}

//-------------------------------------------------
//
//	skController: define the state of the view
//
//-------------------------------------------------

function skController() {
    this._activeCommand = new skSelectGeomCommand();

    this.setActiveCommand = function (cmd) {
        this._activeCommand = cmd;
    }

    this.activeCommand = function () {
        return this._activeCommand;
    }

    this.deselectAll = function () {
        var allDispElements = rnGraphicsManager.dispElements();
        var i;
        for (i = 0; i < allDispElements.length; i++)
            allDispElements[i].setIsSelected(false);
    }

    this.selectedDispElements = function () {
        var selected = [];
        var all = rnGraphicsManager.dispElements();
        var i = 0;
        for (i = 0; i < all.length; i++) {
            if (all[i].isSelected()) {
                selected.push(all[i]);
            }
        }
        return selected;
    }
}

//-------------------------------------------------
//
//	skCommand
//
//-------------------------------------------------

function skCommand() {
    this.onMouseDown = function (event) { }
    this.onMouseDrag = function (event) { }
    this.onMouseUp = function (event) { }
    this.onMouseMove = function (event) { }
}

//-------------------------------------------------
//
//	skCreateGeomCommand
//
//-------------------------------------------------

function skCreateGeomCommand() {
    skCommand.call(this);

    this.onMouseDrag = function (event) {
        var tempPath = this.createPath(event.downPoint, event.point);
        tempPath.strokeColor = 'black';
        tempPath.fillColor = 'white';
        tempPath.removeOnDrag();
        tempPath.removeOnUp();
    }

    this.onMouseUp = function (event) {
        rnController.deselectAll();

        // give shapes a default size when user just clicks the mouse
        //
        var CONST = {
            defaultOffSet: { x: 100, y: 100 }
        };

        var pt1 = event.downPoint;
        var pt2 = event.point;
        if (pt1.equals(pt2)) {
            pt2 = pt1.add(CONST.defaultOffSet.x, CONST.defaultOffSet.y);
        }

        var mpt1 = skConv.toMathPoint(pt1);
        var mpt2 = skConv.toMathPoint(pt2);
        var skelement = this.createSkElement(mpt1, mpt2);
        var dispElement = this.populateDispElement(skelement);
        
        rnController.setActiveCommand(new skSelectGeomCommand());
        dispElement.setIsSelected(true);

        view.draw();
    }
}

skCreateGeomCommand.prototype = new skCommand();

//-------------------------------------------------
//
//	skCreateLineSegmentCommand
//
//-------------------------------------------------

function skCreateLineSegmentCommand() {
    skCreateGeomCommand.call(this);

    this.createPath = function (pt1, pt2) {
        return new Path.Line(pt1, pt2);
    }

    this.createSkElement = function (mpt1, mpt2) {
        var element = new skLineSegment(new skMLineSegment(mpt1, mpt2));
        rnApp.addElement(element);
        return element;
    }

    this.populateDispElement = function (skelement) {
        var dispElement = new skDispLineSegment(skelement);
        rnGraphicsManager.addDispElement(dispElement);
        return dispElement;
    }

}

skCreateLineSegmentCommand.prototype = new skCreateGeomCommand();

//-------------------------------------------------
//
//	skCreateOvalCommand
//
//-------------------------------------------------

function skCreateOvalCommand() {
    skCreateGeomCommand.call(this);

    this.createPath = function (pt1, pt2) {
        var enclosingRect = new Rectangle(pt1, pt2);
        var path = new Path.Oval(enclosingRect, false);
        return path;
    }

    this.createSkElement = function (mpt1, mpt2) {
        var element = new skOval(new skMOval(new skMRectangle(mpt1, mpt2), true));
        rnApp.addElement(element);
        return element;
    }

    this.populateDispElement = function (skelement) {
        var dispElement = new skDispOval(skelement);
        rnGraphicsManager.addDispElement(dispElement);
        return dispElement;
    }

}

skCreateOvalCommand.prototype = new skCreateGeomCommand();

//-------------------------------------------------
//
//	skSelectGeomCommand
//
//-------------------------------------------------

function skSelectGeomCommand() {
    skCommand.call(this);

    rnView.deSelectAllButtons();
    if (rnController) {                 // when loading, the 'rnController' is not created yet
        rnController.deselectAll();
    }
    view.draw();

    var hitOptions = {
        segments: true,
        stroke: true,
        fill: true,
        tolerance: 5
    };

    this.onMouseDown = function (event) {
        var hitResult = project.hitTest(event.point, hitOptions);        

        if (hitResult && hitResult.item && hitResult.item.dispElement) {
            if (!hitResult.item.dispElement.isSelected()) {
                rnController.deselectAll();
                hitResult.item.dispElement.setIsSelected(true);
                rnController.setActiveCommand(new skMoveGeomCommand(hitResult.item));
            }
            else if (hitResult.item.owningBBoxElement && hitResult.item.owningBBoxElement.isHandlePt) {
                rnController.setActiveCommand(new skRotateGeomCommand(hitResult.item));
            }
            else if (hitResult.item.owningBBoxElement && hitResult.item.owningBBoxElement.isAnchorPt) {
                rnController.setActiveCommand(new skResizeGeomCommand(hitResult.item));
            }
            else {
                rnController.setActiveCommand(new skMoveGeomCommand(hitResult.item));
            }
        }
        else {
            rnController.deselectAll();
        }


        view.draw();
    }
   
    this.onMouseMove = function (event) {
        var hitResult = project.hitTest(event.point, hitOptions);
        if (hitResult) {
            if (hitResult.item.owningBBoxElement) {                 
                if (hitResult.item.dispElement.isSelected()) {
                    hitResult.item.owningBBoxElement.setCursorStyle();
                }
            }
            else if (hitResult.item.dispElement) {
                rnGraphicsManager.drawingCanvas().style.cursor = "move";
            }
        }
        else {
            rnGraphicsManager.drawingCanvas().style.cursor = "default";
        }
    }
}

skSelectGeomCommand.prototype = new skCommand();

//-------------------------------------------------
//
//	skEditGeomCommand
//
//-------------------------------------------------

function skEditGeomCommand(pathItem) {
    skCommand.call(this);

    this.onMouseDrag = function (event) {
        this.editBoundingBox(event);
        this.editSkElement(event);
        var dispElement = pathItem.dispElement;
        var tempPath = dispElement.clonePathItemByBBox();
        tempPath.opacity = 0.5;
        tempPath.removeOnDrag();
        tempPath.removeOnUp();
    }

    this.onMouseUp = function (event) {
        var BBox = pathItem.dispElement.boundingBox();
        var skElement = pathItem.dispElement.skElement();
        var dispElement = pathItem.dispElement;
        skElement.reset(skConv.toMathPoint(BBox.defPt1()), skConv.toMathPoint(BBox.defPt2()));
        rnController.setActiveCommand(new skSelectGeomCommand());
        dispElement.setIsSelected(true);
    }

    this.editBoundingBox = function (event) { }
    this.editSkElement = function (event) { }
}

skEditGeomCommand.prototype = new skCommand();


//-------------------------------------------------
//
//	skResizeGeomCommand
//
//-------------------------------------------------

function skResizeGeomCommand(anchorPtPathItem) {
    skEditGeomCommand.call(this, anchorPtPathItem);

    var canvas = rnGraphicsManager.drawingCanvas();
    canvas.style.cursor = "crosshair";

    this.editBoundingBox = function (event) {
        var BBoxElement = anchorPtPathItem.owningBBoxElement;
        BBoxElement.move(event.delta);
    }

}

skResizeGeomCommand.prototype = new skEditGeomCommand();

//-------------------------------------------------
//
//	skMoveGeomCommand
//
//-------------------------------------------------

function skMoveGeomCommand(pathItem) {
    skEditGeomCommand.call(this, pathItem);

    var canvas = rnGraphicsManager.drawingCanvas();
    canvas.style.cursor = "move";

    this.editBoundingBox = function (event) {
        var BBox = pathItem.dispElement.boundingBox();
        BBox.move(event.delta);
    }
}

skMoveGeomCommand.prototype = new skEditGeomCommand();

//-------------------------------------------------
//
//	skRotateGeomCommand
//
//-------------------------------------------------

function skRotateGeomCommand(handlePtPathItem) {
    skEditGeomCommand.call(this, handlePtPathItem);

    var canvas = rnGraphicsManager.drawingCanvas();
    canvas.style.cursor = "url(\"img\\\\cursor_rotate_pressed.cur\") 10 10, crosshair";     //"url(cursor_rotate_pressed.cur)" doesn't work

    var oldAngle = handlePtPathItem.dispElement.skElement().angle();

    this.editSkElement = function (event) {
        var skElement = handlePtPathItem.dispElement.skElement();
        var BBox = handlePtPathItem.dispElement.boundingBox();
        var deltaAngle = this.determineRotateAngle(event.downPoint, event.point, BBox.center());
        skElement.setAngle(oldAngle + deltaAngle);
    }
	
	this.onMouseMove = function (event) {
		// do nothing to prevent cursor style inadvertently changed by others
	}

    this.determineRotateAngle = function (ptOld, ptNew, center) {
        var vec1 = ptOld.subtract(center).normalize();
        var vec2 = ptNew.subtract(center).normalize();
        var angle = Math.acos(vec1.dot(vec2));
        angle = angle / Math.PI * 180;

        var sign = vec1.cross(vec2);
        if (sign < 0)
            angle = -angle;

        return angle;
    }

}

skRotateGeomCommand.prototype = new skEditGeomCommand();

