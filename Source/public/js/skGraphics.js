//-------------------------------------------------
//
//	skGraphicsManager
//
//-------------------------------------------------

function skGraphicsManager() {

    this._dispElements = [];
	
	// set up paper with canvas
	//
	paper.install(window);
	this._drawingCanvas = document.getElementById('drawing_canvas');
	paper.setup(this._drawingCanvas);

	// set up mouse event
	//
	var tool = new Tool();

	tool.onKeyDown = function (event) {
	    var command;
	    if (Key.isDown('escape')) {
	        command = new skSelectGeomCommand();
	    }
	    rnController.setActiveCommand(command);
	}

	tool.onMouseDown = function (event) {
	    rnController.activeCommand().onMouseDown(event);
	}
	
	tool.onMouseDrag = function (event) {
	    rnController.activeCommand().onMouseDrag(event);
	}
	
	tool.onMouseUp = function (event) {
	    rnController.activeCommand().onMouseUp(event);
	}
	
	tool.onMouseMove = function (event) {
	    rnController.activeCommand().onMouseMove(event);
	}

    // graphics manager methods
    //
	this.dispElements = function () {
	    return this._dispElements;
	}

	this.addDispElement = function (dispElement) {
	    this._dispElements.push(dispElement);
	}
	
	this.drawingCanvas = function () {
	    return this._drawingCanvas;
	}
}

//-------------------------------------------------
//
//	data type conversion utilities
//
//-------------------------------------------------

var skConv = new (function () {
    this.toPaperPoint = function (mpt) {
        return new Point(mpt.x(), mpt.y());
    }

    this.toPaperRect = function (mrect) {
        return new Rectangle(this.toPaperPoint(mrect.topLeft()), this.toPaperPoint(mrect.bottomRight()));
    }

    this.toMathPoint = function (pt) {
        return new skMPoint(pt.x, pt.y);
    }

    this.toMathRect = function (rect) {
        return new skMRectangle(rect.topLeft, rect.bottomRight);
    }
});


//-------------------------------------------------
//
//	skDispElement
//
//-------------------------------------------------

function skDispElement(element) {
    this._isSelected = false;
    this._skElement = element;
    this._pathItem = null;
    this._boundingBox = null;

    this.skElement = function () {
        return this._skElement;
    }

    this.pathItem = function() {
        return this._pathItem;
    }

    this.boundingBox = function () {
        if (!this._boundingBox) {
            this._boundingBox = new skBoundingBox(this);
        }
        return this._boundingBox;
    }

    this.setIsSelected = function (b) {
        this._isSelected = b;
        this.boundingBox().setVisible(b);
    }

    this.isSelected = function () {
        return this._isSelected;
    }

    this.init = function () {
        var pathItem = this._pathItem;
        var skelement = this._skElement;
        if (pathItem) {
            pathItem.strokeColor = skelement.strokeColor();
            pathItem.fillColor = skelement.fillColor();
            pathItem.strokeWidth = skelement.strokeWidth();
            pathItem.dispElement = this;        // add a property to pathItem
        }

        skelement.addListener(this);
    }

    this.notify = function (event) {
        if (event.message = "geometry moved") {
            var delta = new Point(event.dx, event.dy);
            this._pathItem.translate(delta);
            if (this._boundingBox)
                this._boundingBox.translate(delta);
        }
    }
}

//-------------------------------------------------
//
//	skDispLineSegment
//
//-------------------------------------------------

function skDispLineSegment(lnSeg) {
    skDispElement.call(this, lnSeg);

    var pt1 = skConv.toPaperPoint(lnSeg.geom().startPt());
    var pt2 = skConv.toPaperPoint(lnSeg.geom().endPt());

    this._pathItem = new Path.Line(pt1, pt2);
    this.init();
}

skDispLineSegment.prototype = new skDispElement();

//-------------------------------------------------
//
//	skDispOval
//
//-------------------------------------------------

function skDispOval(oval) {
    skDispElement.call(this, oval);

    var rect = skConv.toPaperRect(oval.geom().rect());
    var b = oval.geom().circum();

    this._pathItem = new Path.Oval(rect, b);
    this.init();
}

skDispOval.prototype = new skDispElement();

//-------------------------------------------------
//
//	skBoundingBox: a group of path items forming the bounding box of the input path
//
//-------------------------------------------------

function skBoundingBox(displayElement) {
    this.dispElement = displayElement;      // add a property for bounding box
    this._items = [];
    var sz = 8;
    var r = sz / 2;

    var pathItem = displayElement.pathItem();
    var skelement = displayElement.skElement();

    if (skelement.geomType() === kLineSegment) {
        this._startPt = new Path.Circle(pathItem.firstSegment.point, r);
        this._startPt.owningBBox = this;

        this._endPt = new Path.Circle(pathItem.lastSegment.point, r);
        this._endPt.owningBBox = this;

        this._items.push(this._startPt);
        this._items.push(this._endPt);
        
        var i;
        for (i = 0; i < this._items.length; i++) {
            this._items[i].style = {
                fillColor: '#C5E6EA',
                strokeColor: '#385D8A',
                strokeWidth: 1
            }; 
        }
    }
    else {
        // calculate point positions
        //
        var rect = pathItem.bounds;
        var tl = rect.point;
        var tr = tl.add(rect.width, 0);
        var ll = tl.add(0, rect.height);
        var lr = tl.add(rect.width, rect.height);

        var leftmid = tl.add(0, rect.height / 2);
        var lowmid = ll.add(rect.width / 2, 0);
        var rightmid = tr.add(0, rect.height / 2);
        var topmid = tl.add(rect.width / 2, 0);

        var handleLength = 20;
        var handleStart = topmid;
        var handleEnd = handleStart.add(0, -handleLength);

        // create paths
        //
        this._leftEdge = new Path.Line(tl, ll);
        this._lowEdge = new Path.Line(ll, lr);
        this._rightEdge = new Path.Line(lr, tr);
        this._topEdge = new Path.Line(tr, tl);
        this._handleEdge = new Path.Line(handleStart, handleEnd);

        this._tlCorner = new Path.Circle(tl, r);
        this._tlCorner.owningBBox = this;       // add a property for path item
        this._tlCorner.isA = "tlCorner";

        this._trCorner = new Path.Circle(tr, r);
        this._trCorner.owningBBox = this;
        this._trCorner.isA = "trCorner";

        this._llCorner = new Path.Circle(ll, r);
        this._llCorner.owningBBox = this;
        this._llCorner.isA = "llCorner";

        this._lrCorner = new Path.Circle(lr, r);
        this._lrCorner.owningBBox = this;
        this._lrCorner.isA = "lrCorner";

        this._handleEnd = new Path.Circle(handleEnd, r);
        this._handleEnd.owningBBox = this;
        this._handleEnd.isA = "handleEnd";

        this._leftMid = new Path.Rectangle(leftmid.x - r, leftmid.y - r, sz, sz);
        this._leftMid.owningBBox = this;
        this._leftMid.isA = "leftMid";

        this._lowMid = new Path.Rectangle(lowmid.x - r, lowmid.y - r, sz, sz);
        this._lowMid.owningBBox = this;
        this._lowMid.isA = "lowMid";

        this._rightMid = new Path.Rectangle(rightmid.x - r, rightmid.y - r, sz, sz);
        this._rightMid.owningBBox = this;
        this._rightMid.isA = "rightMid";

        this._topMid = new Path.Rectangle(topmid.x - r, topmid.y - r, sz, sz);
        this._topMid.owningBBox = this;
        this._topMid.isA = "topMid";

        this._items.push(this._leftEdge);
        this._items.push(this._lowEdge);
        this._items.push(this._rightEdge);
        this._items.push(this._topEdge);
        this._items.push(this._handleEdge);
        this._items.push(this._tlCorner);
        this._items.push(this._trCorner);
        this._items.push(this._llCorner);
        this._items.push(this._lrCorner);
        this._items.push(this._handleEnd);
        this._items.push(this._leftMid);
        this._items.push(this._lowMid);
        this._items.push(this._rightMid);
        this._items.push(this._topMid);

        var i;
        for (i = 0; i < this._items.length; i++) {
            this._items[i].style = {
                fillColor: '#C5E6EA',
                strokeColor: '#385D8A',
                strokeWidth: 1
            };
        }

        this._handleEnd.fillColor = '#8BE73D';
    }

    this.setVisible = function (b) {
        var i;
        for (i = 0; i < this._items.length; i++) {
            this._items[i].visible = b;
        }
    }

    this.translate = function (delta) {
        var i;
        for (i = 0; i < this._items.length; i++) {
            this._items[i].translate(delta);
        }
    }
}

