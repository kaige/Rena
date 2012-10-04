//-------------------------------------------------
//
//	global variables and functions
//
//-------------------------------------------------

var rnApp, rnView, rnController, rnGraphicsMgr;

window.addEventListener('load', onLoad, false);

function onLoad() {
    rnApp = new skApp();                        // MVC-model
    rnView = new skView();                      // MVC-view
    rnController = new skController();          // MVC-controller
	rnGraphicsMgr = new skGraphicsManager();    // part of MVC-view
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
    this._activeCommand = null;

    this.setActiveCommand = function (cmd) {
        this._activeCommand = cmd;
    }

    this.activeCommand = function () {
        return this._activeCommand;
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
        project.deselectAll();

        // give shapes a default size when user just clicks the mouse
        //
        var CONST = {
            defaultOffSet: { x: 80, y: 80 }
        };

        var pt1 = event.downPoint;
        var pt2 = event.point;
        if (pt1.equals(pt2)) {
            pt2 = pt1.add(CONST.defaultOffSet.x, CONST.defaultOffSet.y);
        }

        var newPath = this.createPath(pt1, pt2);
        newPath.selected = true;
        newPath.strokeColor = 'black';
        newPath.fillColor = 'white';
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
    project.deselectAll();
    view.draw();

    var hitOptions = {
        segments: true,
        stroke: true,
        fill: true,
        tolerance: 5
    };

    this.onMouseDown = function (event) {
        project.deselectAll();
        var hitResult = project.hitTest(event.point, hitOptions);
        if (hitResult) {
            hitResult.item.selected = true;
        }
        view.draw();
    }

    this.onMouseDrag = function (event) {
        if (project.selectedItems.length > 0) {
            var i;
            for (i = 0; i < project.selectedItems.length; i++) {
                project.selectedItems[i].translate(event.delta);
            }
            view.draw();
        }
    }
}
