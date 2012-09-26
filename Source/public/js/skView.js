//-------------------------------------------------
//
//	global variables and functions
//
//-------------------------------------------------

var rnView, rnApp, rnGraphicsMgr;

window.addEventListener('load', onLoad, false);

function onLoad() {
	rnView = new skView();
	rnApp = new skApp();
	rnGraphicsMgr = new skGraphicsManager();
}

//-------------------------------------------------
//
//	skView
//
//-------------------------------------------------

function skView() {
	this._createGeomBtnGrp = new skRadioButtonGroup();
	this._createGeomBtnGrp.addRadioButton(new skImgButton("line_btn", "img\\line.png", "img\\line_highlight.png", "img\\line_select.png"));
	this._createGeomBtnGrp.addRadioButton(new skImgButton("oval_btn", "img\\oval.png", "img\\oval_highlight.png", "img\\oval_select.png"));
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
		
		rnApp.setCreateElementtype(getGeomTypeById(that._id));
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