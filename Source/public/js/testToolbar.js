

var g_toolbarButtons = [];

var skToolbarBtn = function (name, tooltip, classname) {
    this.name = name;
    this.tooltip = tooltip;
	this.classname = classname;
}

var addToolbarButton = function (name, tooltip, classname) {
    var btn = new skToolbarBtn(name, tooltip, classname);
	g_toolbarButtons.push(btn);
}

var initToolbar = function () {

	var toolbar = new goog.ui.Toolbar();

    addToolbarButton("Point", "point", "icon toolbar-point");
	addToolbarButton("Line", "line", "icon toolbar-line");
	addToolbarButton("Circle", "circle", "icon toolbar-circle");
	addToolbarButton("Rectangle", "rectangle", "icon toolbar-rectangle");

    goog.array.forEach(g_toolbarButtons, function (btn, index, array) {
		var tbtn = new goog.ui.ToolbarToggleButton(goog.dom.createDom('div',
        btn.classname));
		
		tbtn.setTooltip(btn.tooltip);
        toolbar.addChild(tbtn, true);
    });	
	
	// toolbar.addChild(new goog.ui.ToolbarButton('test button'), true);
	toolbar.render(goog.dom.getElement('tool_bar_group1_div'));
	toolbar.render(goog.dom.getElement('tool_bar_group2_div'));
	toolbar.render(goog.dom.getElement('tool_bar_group3_div'));
}

initToolbar();
