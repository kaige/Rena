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

    // Create toolbar buttons
    this._createGeomBtnGrp.addRadioButton(new skCmdDefCreatePoint());
    this._createGeomBtnGrp.addRadioButton(new skCmdDefCreateLineSegment());
    //this._createGeomBtnGrp.addRadioButton(new skCmdDefCreateCircle());
    this._createGeomBtnGrp.addRadioButton(new skCmdDefCreateOval());
    this._createGeomBtnGrp.addRadioButton(new skCmdDefCreateRectangle());
    this._createGeomBtnGrp.addRadioButton(new skCmdDefCreateDimension());

    // Initial toolbar
    this._toolbar = new goog.ui.Toolbar();
    var toolbartemp = this._toolbar;
    goog.array.forEach(this._createGeomBtnGrp._radioButtons, function (btn, index, array) {
        btn.createButton(toolbartemp);
    });
    this._toolbar.render(goog.dom.getElement('tool_bar_group1_div'));

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

    this.addRadioButton = function (btn) {
        btn._parentGroup = this;
        this._radioButtons.push(btn);
    }

    this.onSetSelected = function (selectedBtn) {
        var i;
        for (i = 0; i < this._radioButtons.length; i++) {
            var btn = this._radioButtons[i];
            if (btn !== selectedBtn) {
                btn.setSelected(false);
            }
        }
    }
}

//-------------------------------------------------
//
//	skCmdDef: command definition
//  (name, tooltip, classname, and related command)
//
//-------------------------------------------------
function skCmdDef(id, tooltip, classname) {
    this._id = id;
    this._obj = document.getElementById(id);
    this._tooltip = tooltip;
    this._classname = classname;
    this._btn = null;

    var that = this;

    this.obj = function () {
        return that._obj;
    }

    this.setSelected = function (p) {
        that._btn.setChecked(p);
    }

    this.createButton = function (toolbar) {
        that._btn = new goog.ui.ToolbarToggleButton(goog.dom.createDom('div', that._classname));
        that._btn.setTooltip(that._tooltip);
        toolbar.addChild(that._btn, true);

        goog.events.listen(that._btn, goog.ui.Component.EventType.ACTION, that.onMouseClickEX);
    }
    this.createCommand = function () {
        prompt("Sorry, haven't implemented yet");
        return null;
    }

    this.onMouseClickEX = function () {
        if (rnController.activeCommand() != that) {
            that._parentGroup.onSetSelected(that);
        }
        var cmd = that.createCommand();
        rnController.setActiveCommand(cmd);
    }
}

function skCmdDefCreatePoint() {
    skCmdDef.call(this, "Point", "point", "icon toolbar-point");

    this.createCommand = function () {
        return new skCreatePointCommand();
    }
}
skCmdDefCreatePoint.prototype = new skCmdDef();

function skCmdDefCreateLineSegment() {
    skCmdDef.call(this, "Line", "Line", "icon toolbar-line");

    this.createCommand = function () {
        return new skCreateLineSegmentCommand();
    }
}
skCmdDefCreateLineSegment.prototype = new skCmdDef();

function skCmdDefCreateCircle() {
    skCmdDef.call(this, "Circle", "Circle", "icon toolbar-circle");

    this.createCommand = function () {
        return new skCreateCircleCommand();
    }
}
skCmdDefCreateCircle.prototype = new skCmdDef();

function skCmdDefCreateOval() {
    skCmdDef.call(this, "Oval", "Oval", "icon toolbar-ellipse");

    this.createCommand = function () {
        return new skCreateOvalCommand();
    }
}
skCmdDefCreateOval.prototype = new skCmdDef();

function skCmdDefCreateRectangle() {
    skCmdDef.call(this, "Rectangle", "Rectangle", "icon toolbar-rectangle");

    this.createCommand = function () {
        return new skCreateRectangleCommand();
    }
}
skCmdDefCreateRectangle.prototype = new skCmdDef();

function skCmdDefCreateDimension() {
    skCmdDef.call(this, "Dimension", "Create dimension", "icon toolbar-dimension");

    this.createCommand = function () {
        return new skCreateDimensionCommand();
    }
}
skCmdDefCreateDimension.prototype = new skCmdDef();

//-------------------------------------------------
//
//	skController: define the state of the view
//
//-------------------------------------------------

function skController() {
    this._activeCommand = new skSelectGeomCommand();

    this.setActiveCommand = function (cmd) {
        if (this._activeCommand)
            this._activeCommand.terminate();

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
    this.terminate = function () { }
}

//-------------------------------------------------
//
//	skCreateGeomCommand
//
//-------------------------------------------------

function skCreateGeomCommand() {
    skCommand.call(this);

    this.onMouseMove = function (event) {
        var canvas = rnGraphicsManager.drawingCanvas();
        canvas.style.cursor = "crosshair";
    }

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
//	skCreatePointCommand
//
//-------------------------------------------------

function skCreatePointCommand() {
    skCreateGeomCommand.call(this);

    this.createPath = function (pt) {
        return new Path.Circle(pt, 4);
    }

    this.createSkElement = function (mpt) {
        var element = new skPoint(mpt);
        rnApp.addElement(element);
        return element;
    }

    this.populateDispElement = function (skelement) {
        var dispElement = new skDispPoint(skelement);
        rnGraphicsManager.addDispElement(dispElement);
        return dispElement;
    }
}

skCreatePointCommand.prototype = new skCreateGeomCommand();

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
//	skCreateCircleCommand
//
//-------------------------------------------------

function skCreateCircleCommand() {
    skCreateGeomCommand.call(this);

    this.createPath = function (pt1, pt2) {
        //var enclosingRect = new Circle(pt1, pt2);
        //var path = new Path.Circle(enclosingRect, false);
        //return path;
    }

    this.createSkElement = function (mpt1, mpt2) {
        //var element = new skCircle(new skMOval(new skMCircle(mpt1, mpt2), true));
        //rnApp.addElement(element);
        //return element;
    }

    this.populateDispElement = function (skelement) {
        // var dispElement = new skDispCircle(skelement);
        // rnGraphicsManager.addDispElement(dispElement);
        // return dispElement;
    }
}
skCreateCircleCommand.prototype = new skCreateGeomCommand();

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
//	skCreateOvalCommand
//
//-------------------------------------------------

function skCreateRectangleCommand() {
    skCreateGeomCommand.call(this);

    this.createPath = function (pt1, pt2) {
        var path = new Path.Rectangle(pt1, pt2);
        return path;
    }

    this.createSkElement = function (mpt1, mpt2) {
        var element = new skRectangle(new skMRectangle(mpt1, mpt2));
        rnApp.addElement(element);
        return element;
    }

    this.populateDispElement = function (skelement) {
        var dispElement = new skDispRectangle(skelement);
        rnGraphicsManager.addDispElement(dispElement);
        return dispElement;
    }
}

skCreateRectangleCommand.prototype = new skCreateGeomCommand();

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

    this._hitPathItem = null;

    this.onMouseDown = function (event) {
        var hitPathItem = this._hitPathItem;

        if (hitPathItem && hitPathItem.dispElement) {
            if (!hitPathItem.dispElement.isSelected()) {
                rnController.deselectAll();
                hitPathItem.dispElement.setIsSelected(true);
                rnController.setActiveCommand(new skMoveGeomCommand(hitPathItem));
            }
            else if (hitPathItem.owningBBoxElement && hitPathItem.owningBBoxElement.isHandlePt) {
                rnController.setActiveCommand(new skRotateGeomCommand(hitPathItem));
            }
            else if (hitPathItem.owningBBoxElement && hitPathItem.owningBBoxElement.isAnchorPt) {
                rnController.setActiveCommand(new skResizeGeomCommand(hitPathItem));
            }
            else {
                rnController.setActiveCommand(new skMoveGeomCommand(hitPathItem));
            }
        }
        else if (hitPathItem && hitPathItem.dispDimText) {
            rnController.setActiveCommand(new skEditDispDimensionCommand(hitPathItem.dispDimension, this));
        }
        else {
            rnController.deselectAll();
        }


        view.draw();
    }

    this.onMouseMove = function (event) {
        // firstly we try to hit the path items
        //
        var hitOptions = {
            segments: true,
            stroke: true,
            fill: true,
            tolerance: 5
        };
        var hitResult = project.hitTest(event.point, hitOptions);

        if (hitResult && hitResult.item) {
            this._hitPathItem = hitResult.item;
            var hitPathItem = this._hitPathItem;
            if (hitPathItem.owningBBoxElement) {
                if (hitPathItem.dispElement.isSelected()) {
                    hitPathItem.owningBBoxElement.setCursorStyle();
                }
            }
            else if (hitPathItem.dispElement) {
                rnGraphicsManager.drawingCanvas().style.cursor = "move";
            }
            return;
        }

        // then we try to hit the text item:  this still doesn't work, paper.js seems can't hit test text
        //
        //var hitOptions2 = { type: TextItem, tolerance: 5 };
        //var hitResult = project.hitTest(event.point, hitOptions2);
        //if (hitResult && hitResult.item) { this._hitPathItem = hitResult.item;  return; }

        // default case:
        //
        this._hitPathItem = null;
        rnGraphicsManager.drawingCanvas().style.cursor = "default";
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

//-------------------------------------------------
//
//	skCreateDimensionCommand
//
//-------------------------------------------------

function skCreateDimensionCommand() {
    skCommand.call(this);

    this._selectedHighlightGeoms = [];
    this._highlightGeom = null;

    var canvas = rnGraphicsManager.drawingCanvas();
    canvas.style.cursor = "default";

    this.addSelectedHighlightGeom = function (g) {
        this._selectedHighlightGeoms.push(g);
    }

    this.cleanDispGeoms = function () {
        var i;
        for (i = 0; i < this._selectedHighlightGeoms.length; i++)
            this._selectedHighlightGeoms[i].pathItem().remove();
    }

    this.clear = function () {
        this._selectedHighlightGeoms.splice(0, this._selectedHighlightGeoms.length);
        this._highlightGeom = null;
    }

    this.isOKToBeSelected = function (geom) {
        if (this._selectedHighlightGeoms.length == 0)
            return true;
        else if (this._selectedHighlightGeoms.length == 1) {
            var firstGeom = this._selectedHighlightGeoms[0].mathGeom();
            // filters of the allowed types of geometries to be selected
            //
            if (firstGeom instanceof skMPoint && geom instanceof skMLineSegment ||  //distance-point-line
                firstGeom instanceof skMLineSegment && geom instanceof skMPoint)
                return true;
            else
                return false;
        }
        else if (this._selectedHighlightGeoms.length == 2)
            return false;

        return false;
    }

    this.makeDimension = function (element1, mgeom1, element2, mgeom2) {
        var newDim;
        var newDispDim;

        // distance-point-line
        //
        if (mgeom1 instanceof skMPoint && mgeom2 instanceof skMLineSegment) {
            var offset = mgeom2.getLine().distance(mgeom1);
            newDim = new skDistPtLn(element1, mgeom1, element2, mgeom2, offset);
            newDispDim = new skDispDistPtLn(newDim);
        }
        else if (mgeom2 instanceof skMPoint && mgeom1 instanceof skMLineSegment) {
            var offset = mgeom1.getLine().distance(mgeom2);
            newDim = new skDistPtLn(element1, mgeom2, element1, mgeom1, offset);
            newDispDim = new skDispDistPtLn(newDim);
        }
        // distance-point-point
        //

        // distance-line-line

        return newDispDim;
    }

    var hitOptions = {
        segments: false,
        stroke: true,
        fill: true,
        tolerance: 5
    };

    this.onMouseMove = function (event) {
        this._highlightGeom = null;

        var hitResult = project.hitTest(event.point, hitOptions);
        if (hitResult && hitResult.item && hitResult.item.dispElement) {
            var dispElement = hitResult.item.dispElement;
            var geom = dispElement.getConstrainableGeometry(hitResult.item, event.point)
            if (geom && this.isOKToBeSelected(geom)) {
                this._highlightGeom = new skHighlightGeometry(geom, dispElement.skElement(), hitResult.item);
                this._highlightGeom.setAsHighlightedColor();
                this._highlightGeom.pathItem().removeOnMove();
            }
        }
    }

    this.onMouseDown = function (event) {
        if (this._highlightGeom) {
            var selectedHighlightGeom = new skHighlightGeometry(this._highlightGeom.mathGeom(),
                                                        this._highlightGeom.skElement(),
                                                        this._highlightGeom.originalHitPathItem())
            selectedHighlightGeom.setAsSelectedColor();
            this.addSelectedHighlightGeom(selectedHighlightGeom);

            if (this._selectedHighlightGeoms.length == 2) {
                // create the dimension object
                var newDispDim = this.makeDimension(this._selectedHighlightGeoms[0].skElement(),
                                                    this._selectedHighlightGeoms[0].mathGeom(),
                                                    this._selectedHighlightGeoms[1].skElement(),
                                                    this._selectedHighlightGeoms[1].mathGeom());

                newDispDim.addOrgSelPathItem(this._selectedHighlightGeoms[0].originalHitPathItem());
                newDispDim.addOrgSelPathItem(this._selectedHighlightGeoms[1].originalHitPathItem());
                newDispDim.addHighlightPathItem(this._selectedHighlightGeoms[0].pathItem());
                newDispDim.addHighlightPathItem(this._selectedHighlightGeoms[1].pathItem());

                this.clear();

                rnController.setActiveCommand(new skEditDispDimensionCommand(newDispDim, this));
            }
        }
        else {      // edit the value of the dimension
            var hitResult = project.hitTest(event.point, hitOptions);
            if (hitResult && hitResult.item && hitResult.item.dispDimText) {
                var dispDim = hitResult.item.dispDimension;
                var pos = hitResult.item.position;

                var editBoxHandler = function (response) {
                    if (response !== null) {
                        dispDim.skConstraint().setOffset(new Number(response));
                        dispDim.draw(dispDim.textPos());
                        view.draw();
                    }
                }

                var editBox = new goog.ui.Prompt('edit dimension value ', 'd= ', editBoxHandler);
                editBox.setDefaultValue(dispDim.skConstraint().offset().toFixed(2));
                editBox.setVisible(true);

                // set dialog's position, we add a "magic" offset number here,
                // which are actually the canvas's position in the window.
                // In the future we should use code to calculate this number
                //
                goog.style.setPosition(editBox.getDialogElement(), pos.x - 10, pos.y + 75);
            }
        }
    }

    this.terminate = function () {
        this.cleanDispGeoms();
    }

}

skCreateDimensionCommand.prototype = new skCommand();

//-------------------------------------------------
//
//	skEditDispDimensionCommand
//
//-------------------------------------------------

function skEditDispDimensionCommand(dispDim, prevCommand) {
    skCommand.call(this);

    this._dispDim = dispDim;
    this._prevCommand = prevCommand;

    this.onMouseMove = function (event) {
        this._dispDim.draw(event.point);

        var pathItems = this._dispDim.pathItems();
        var i;
        for (i = 0; i < pathItems.length; i++) {
            pathItems[i].removeOnMove();
            pathItems[i].removeOnUp();
        }
        this._dispDim.clearPathItems();
    }

    this.onMouseDown = function (event) {
        this._dispDim.draw(event.point);
        this._dispDim.removeHighlightPathItems();
        rnController.setActiveCommand(this._prevCommand);
    }

}

skEditDispDimensionCommand.prototype = new skCommand();