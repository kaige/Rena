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
	    if (Key.isDown('escape')) {
	        rnController.setActiveCommand(new skSelectGeomCommand());
	    }	    
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
        return new skMRectangle(this.toMathPoint(rect.topLeft), this.toMathPoint(rect.bottomRight));
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

    if (this._skElement)
        this._skElement.addListener(this);

    this.skElement = function () {
        return this._skElement;
    }

    this.pathItem = function() {
        return this._pathItem;
    }

    this.boundingBox = function () {
        return this._boundingBox;
    }

    this.setIsSelected = function (b) {
        this._isSelected = b;
        this.boundingBox().setVisible(b);
    }

    this.isSelected = function () {
        return this._isSelected;
    }

    this.setDrawingStyle = function (pathItem, skElement) {
        pathItem.style = {
            fillColor: skElement.fillColor(),
            strokeColor: skElement.strokeColor(),
            strokeWidth: skElement.strokeWidth()
        };
    }

    this.init = function () {
        var pathItem = this.createPathItem();
        this._pathItem = pathItem;
        this._pathItem.dispElement = this;                  // add a property for path item
        this._boundingBox = new skBoundingBox(this);
        this.setDrawingStyle(pathItem, this.skElement());
    }

    this.notify = function (event) {
        if (event.message = "geometry changed") {
            this.regenerate();   
        }
    }
    
    this.regenerate = function () {
        if (this._pathItem) {
            this._pathItem.remove();
        }
        
        if (this._boundingBox) {
            this._boundingBox.removePathItems();
            this._boundingBox = null;
        }
        
        this.init();
    }
}

//-------------------------------------------------
//
//	skDispLineSegment
//
//-------------------------------------------------

function skDispLineSegment(lnSeg) {
    skDispElement.call(this, lnSeg);
    
    this.createPathItem = function () {
        var lnSeg = this.skElement();
        var pt1 = skConv.toPaperPoint(lnSeg.geom().startPt());
        var pt2 = skConv.toPaperPoint(lnSeg.geom().endPt());
        var pathItem = new Path.Line(pt1, pt2);
        return pathItem;
    }

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
    
    this.createPathItem = function () {
        var oval = this.skElement();
        var rect = skConv.toPaperRect(oval.geom().rect());
        var b = oval.geom().circum();
        var pathItem = new Path.Oval(rect, b);
        return pathItem;
    }

    this.init();

    this.clonePathItem = function (rect) {
        var tempPathItem = new Path.Oval(rect, this.skElement().geom().circum());
        this.setDrawingStyle(tempPathItem, this.skElement());
        return tempPathItem;
    }
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
    this._anchorPts = new skLinkedList();

    var pathItem = displayElement.pathItem();
    var skelement = displayElement.skElement();

    this.add = function (pathItem) {
        this._items.push(pathItem)
    }

    if (skelement.geomType() === kLineSegment) {
        this._anchorPts.push(new skBBoxLineEndPt(pathItem.firstSegment.point, this));
        this._anchorPts.push(new skBBoxLineEndPt(pathItem.lastSegment.point, this));
    }
    else {
        // calculate point positions
        //
        var rect = pathItem.bounds;
        var tl = rect.point;
        var tr = tl.add(rect.width, 0);
        var ll = tl.add(0, rect.height);
        var lr = tl.add(rect.width, rect.height);

        // calculate the mid points
        //
        var leftmid = tl.add(ll).multiply(0.5);
        var lowermid = ll.add(lr).multiply(0.5);
        var rightmid = lr.add(tr).multiply(0.5);
        var topmid = tr.add(tl).multiply(0.5);

        var handleLength = 20;
        var handleStart = tl.add(tr).multiply(0.5);
        var handleEnd = handleStart.add(0, -handleLength);

        // create edges
        //
        new skBBoxEdge(tl, ll, this);
        new skBBoxEdge(ll, lr, this);
        new skBBoxEdge(lr, tr, this);
        new skBBoxEdge(tr, tl, this);
        new skBBoxEdge(handleStart, handleEnd, this);
        
        // create handle end point
        //
        new skBBoxHandleEndPt(handleEnd, this);

        // create corner points and mid points
        //
        this._anchorPts.push(new skBBoxCornerPt(tl, this));
        this._anchorPts.push(new skBBoxEdgeMidPt(leftmid, this));
        this._anchorPts.push(new skBBoxCornerPt(ll, this));
        this._anchorPts.push(new skBBoxEdgeMidPt(lowermid, this));
        this._anchorPts.push(new skBBoxCornerPt(lr, this));
        this._anchorPts.push(new skBBoxEdgeMidPt(rightmid, this));
        this._anchorPts.push(new skBBoxCornerPt(tr, this));
        this._anchorPts.push(new skBBoxEdgeMidPt(topmid, this));
    }

    this.removePathItems =  function() {
        var i;
        for (i = 0; i <this._items.length; i++) {
            this._items[i].remove();
        }
    }
    
    this.setVisible = function (b) {
        var i;
        for (i = 0; i < this._items.length; i++) {
            this._items[i].visible = b;
        }
    }

    this.rect = function () {
        var topleft = this._anchorPts.head().position;
        var lowerright = this._anchorPts.nextNode(this._anchorPts.head(), 4).position;
        return new Rectangle(topleft, lowerright);
    }
    
    this.anchorPts = function () {
        return this._anchorPts;
    }
}

//-------------------------------------------------
//
//	skAnchorPoint: the anchor point on bounding box used to resize the bounding box
//
//-------------------------------------------------

function skBBoxElement() {
    this.position = null;

    this.setBoundingBox = function (bbox) {
        this._pathItem.owningBBox = bbox;
        bbox.add(this._pathItem);
    }

    this.r = function () {
        return 4;
    }

    this.init = function (pt, pathItem, bbox) {
        this.position = pt;
        this._pathItem = pathItem;
        this._pathItem.owningBBoxElement = this;
        this.setBoundingBox(bbox);
    }

    this.setCursorStyleByVec = function (vec) {
        var canvas = rnGraphicsManager.drawingCanvas();

        // flip vectors in 2nd/3rd quadrant to 1st/4th quadrant
        //
        if (vec.x < 0) {
            vec.set(-vec.x, -vec.y);
        }

        // determine cursor style
        //
        if (vec.x < 0.382683) {     //sin(22.5 deg) == 0.382683
            canvas.style.cursor = "n-resize";
        }
        else if (vec.x > 0.92388) {     //cos(22.5 deg) == 0.92388
            canvas.style.cursor = "e-resize";
        }
        else if (vec.y > 0) {
            canvas.style.cursor = "se-resize";
        }
        else
            canvas.style.cursor = "ne-resize";
    }
}

//-------------------------------------------------
//
//	skLineEndAnchorPoint
//
//-------------------------------------------------

function skBBoxLineEndPt(pt, bbox) {
    skBBoxElement.call(this);

    var pathItem = Path.Circle(pt, this.r());
    pathItem.style = {
        fillColor: '#C5E6EA',
        strokeColor: '#385D8A',
        strokeWidth: 1
    };

    this.init(pt,pathItem, bbox);

    this.setCursorStyle = function () {
        var pt1 = this.position;
        var pt2 = this.prev.position;
        var vec = pt1.subtract(pt2);
        var mul = vec.x * vec.y;
        if (mul > 0)        // note the canvas coordinate system is y-flip with normal orthogonal system
            rnGraphicsManager.drawingCanvas().style.cursor = "se-resize";
        else
            rnGraphicsManager.drawingCanvas().style.cursor = "ne-resize";
    }

}

skBBoxLineEndPt.prototype = new skBBoxElement();

//-------------------------------------------------
//
//	skBoundingBoxCornerAnchorPoint
//
//-------------------------------------------------

function skBBoxCornerPt(pt, bbox) {
    skBBoxElement.call(this);

    var pathItem = Path.Circle(pt, this.r());
    pathItem.style = {
        fillColor: '#C5E6EA',
        strokeColor: '#385D8A',
        strokeWidth: 1
    };

    this.init(pt,pathItem, bbox);

    this.setCursorStyle = function () {
        var vec = this.getVector();
        this.setCursorStyleByVec(vec);
    }

    this.getVector = function () {
        var cornerPt = this.position;
        var neighborPt1 = this.prev.position;
        var neighborPt2 = this.next.position;

        var vec1 = neighborPt1.subtract(cornerPt).normalize();
        var vec2 = neighborPt2.subtract(cornerPt).normalize();
        var pt1 = cornerPt.add(vec1);
        var pt2 = cornerPt.add(vec2);
        var mid = pt1.add(pt2).multiply(0.5);
        var vec = cornerPt.subtract(mid).normalize();
        return vec;
    }

    this.move = function (delta) {  
        this.prev.move(delta);
        this.next.move(delta);
    }
}

skBBoxCornerPt.prototype = new skBBoxElement();

//-------------------------------------------------
//
//	skBBoundingBoxEdgeMidPoint
//
//-------------------------------------------------

function skBBoxEdgeMidPt(pt, bbox) {
    skBBoxElement.call(this);

    var pathItem = new Path.Rectangle(pt.x - this.r(), pt.y - this.r(), 2*this.r(), 2*this.r());
    pathItem.style = {
        fillColor: '#C5E6EA',
        strokeColor: '#385D8A',
        strokeWidth: 1
    };

    this.init(pt,pathItem, bbox);

    this.setCursorStyle = function () {
        var vec = this.getVector();
        this.setCursorStyleByVec(vec);
    }

    this.getVector = function (anchorPtIndex) {
        var allAnchorPts = this._pathItem.owningBBox.anchorPts();
        var edgePt = this.position;
        var oppEdgePt = allAnchorPts.nextNode(this, 4).position;

        var vec = edgePt.subtract(oppEdgePt).normalize();
        return vec;
    }

    this.move = function (delta) {
        var allAnchorPts = this._pathItem.owningBBox.anchorPts();
        var edgePt = this.position;
        var oppEdgePt = allAnchorPts.nextNode(this, 4).position;
        var n = edgePt.subtract(oppEdgePt).normalize();
        var moveVec = n.multiply(n.dot(delta));

        this.prev.position = this.prev.position.add(moveVec);
        this.next.position = this.next.position.add(moveVec);
    }
}

skBBoxEdgeMidPt.prototype = new skBBoxElement();

//-------------------------------------------------
//
//	skBBoundingBoxHandleEndPoint
//
//-------------------------------------------------

function skBBoxHandleEndPt(pt, bbox) {
    skBBoxElement.call(this);

    var pathItem = Path.Circle(pt, this.r());
    pathItem.style = {
        fillColor: '#8BE73D',
        strokeColor: '#385D8A',
        strokeWidth: 1
    };

    this.init(pt,pathItem, bbox);

    this.setCursorStyle = function () {
        rnGraphicsManager.drawingCanvas().style.cursor = "crosshair";
    }
}

skBBoxHandleEndPt.prototype = new skBBoxElement();

//-------------------------------------------------
//
//	skBoundingBoxEdge
//
//-------------------------------------------------

function skBBoxEdge(pt1, pt2, bbox) {
    skBBoxElement.call(this);

    var pathItem = new Path.Line(pt1, pt2);
    pathItem.style = {
        strokeColor: '#385D8A',
        strokeWidth: 1
    };

    this.init(pt1, pathItem, bbox);

    this.setCursorStyle = function () {
        // none-op
    }
}

skBBoxEdge.prototype = new skBBoxElement();


//-------------------------------------------------
//
//	skLinkedList: a simple double circuit linked list
//
//-------------------------------------------------

function skLinkedList() {
    this._head = null;
    this._tail = null;
    
    this.head = function() {
        return this._head;
    }
    
    this.push = function (node) {
        node.owningLinkedList = this;
        if (!this._head) {
            this._head = node;
            this._tail = node;
            node.prev = node;
            node.next = node;
        }
        else {
            this._tail.next = node;
            node.prev = this._tail;
            node.next = this._head;
            this._head.prev = node;
            
            this._tail = node;
        }
    }
    
    this.nextNode = function(node, offset) {
        var target = node;
        var i;
        for (i = 0; i < offset; i++) {
            target = target.next;
        }
        return target;
    }
}