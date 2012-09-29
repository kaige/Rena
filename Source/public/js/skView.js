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
		
		var command = new skCreateGeomCommand(getGeomTypeById(that._id));
		command.execute();
	}
	
	function getGeomTypeById(id) {
		if (id === "line_btn")
			return kLineSegment;
		else if (id === "oval_btn")
			return kOval;
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
var skCmdMode = {
    kNone: 0,
    kCreateGeom: 1
};

function skController () {
    this._commandMode = skCmdMode.kNone;
    this._createGeomType = kUnknown;

    this.setCommandMode = function (mode) {
        this._commandMode = mode;
    }

    this.commandMode = function () {
        return this._commandMode;
    }

    this.setCreateGeomtype = function (type) {
        this._createGeomType = type;
    }

    this.createGeomType = function () {
        return this._createGeomType;
    }
}

//-------------------------------------------------
//
//	skCommand
//
//-------------------------------------------------

function skCommand() {

}

function skCreateGeomCommand(geomType) {

    this._createGeomtype = geomType;

    this.execute = function() {
        rnController.setCommandMode(skCmdMode.kCreateGeom);
        rnController.setCreateGeomtype(geomType);
    }
}
