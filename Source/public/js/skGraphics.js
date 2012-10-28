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
    this._anchorPts = [];

    var pathItem = displayElement.pathItem();
    var skelement = displayElement.skElement();

    this.add = function (pathItem) {
        this._items.push(pathItem)
    }

    if (skelement.geomType() === kLineSegment) {
        this._anchorPts[0] = pathItem.firstSegment.point;
        this._anchorPts[1] = pathItem.lastSegment.point;

        var i;
        for (i = 0; i < this._anchorPts.length; i++) {
            var anchorPt = new skBBoxLineEndPt(this._anchorPts[i], this);
            anchorPt.setIndex(i);
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

        this._anchorPts[0] = tl;
        this._anchorPts[2] = ll;
        this._anchorPts[4] = lr;
        this._anchorPts[6] = tr;

        // create the mid points
        //
        this._anchorPts[1] = this._anchorPts[0].add(this._anchorPts[2]).multiply(0.5);
        this._anchorPts[3] = this._anchorPts[2].add(this._anchorPts[4]).multiply(0.5);
        this._anchorPts[5] = this._anchorPts[4].add(this._anchorPts[6]).multiply(0.5);
        this._anchorPts[7] = this._anchorPts[6].add(this._anchorPts[0]).multiply(0.5);

        var tl = this._anchorPts[0];
        var tr = this._anchorPts[6];
        var handleLength = 20;
        var handleStart = tl.add(tr).multiply(0.5);
        var handleEnd = handleStart.add(0, -handleLength);

        // create edges
        //
        var i;
        for (i = 0; i < this._anchorPts.length; i += 2) {
            var startPtIndex = i;
            var endPtIndex = (i + 2) % this._anchorPts.length;
            var edge = new skBBoxEdge(this._anchorPts[startPtIndex], this._anchorPts[endPtIndex], this);
        }

        var edge = new skBBoxEdge(handleStart, handleEnd, this);

        // create corner points
        //
        for (i = 0; i < this._anchorPts.length; i += 2) {
            var anchorPt = new skBBoxCornerPt(this._anchorPts[i], this);
            anchorPt.setIndex(i);
        }

        // create handle end point
        //
        var anchorPt = new skBBoxHandleEndPt(handleEnd, this);

        // create mid points
        //
        for (i = 1; i < this._anchorPts.length; i += 2) {
            var anchorPt = new skBBoxEdgeMidPt(this._anchorPts[i], this);
            anchorPt.setIndex(i);
        }
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
        return new Rectangle(this._anchorPts[0], this._anchorPts[4]);
    }

    this.anchorPts = function () {
        return this._anchorPts;
    }

    this.getPathItemByAnchorPtIndex = function (index) {
        var i;
        for (i = 0; i < this._items.length; i++) {
            if (this._items[i].anchorIndex === index)
                return this._items[i];
        }

    }
}

//-------------------------------------------------
//
//	skAnchorPoint: the anchor point on bounding box used to resize the bounding box
//
//-------------------------------------------------

function skBBoxElement() {

    this.setIndex = function (index) {
        this._pathItem.anchorIndex = index;
    }

    this.setBoundingBox = function (bbox) {
        this._pathItem.owningBBox = bbox;
        bbox.add(this._pathItem);
    }

    this.r = function () {
        return 4;
    }

    this.init = function (pathItem, bbox) {
        this._pathItem = pathItem;
        this._pathItem.owningBBoxElement = this;
        this.setBoundingBox(bbox);
    }

    this.modOffset = function (index, offset, length) {
        var i = (index - offset) % length;
        if (i < 0)
            i += length;
        return i;
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

    this.init(pathItem, bbox);

    this.setCursorStyle = function () {
        var pathItem = this._pathItem;
        var pt1 = pathItem.owningBBox._anchorPts[0];
        var pt2 = pathItem.owningBBox._anchorPts[1];
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

    this.init(pathItem, bbox);

    this.setCursorStyle = function () {
        var vec = this.getVector(this._pathItem.anchorIndex);
        this.setCursorStyleByVec(vec);
    }

    this.getVector = function (anchorPtIndex) {
        var allAnchorPts = this._pathItem.owningBBox.anchorPts();
        var self = anchorPtIndex;
        var pre = this.modOffset(self, -2, allAnchorPts.length);
        var next = this.modOffset(self, 2, allAnchorPts.length);
        var cornerPt = allAnchorPts[self];
        var neighborPt1 = allAnchorPts[pre];
        var neighborPt2 = allAnchorPts[next];

        var vec1 = neighborPt1.subtract(cornerPt).normalize();
        var vec2 = neighborPt2.subtract(cornerPt).normalize();
        var pt1 = cornerPt.add(vec1);
        var pt2 = cornerPt.add(vec2);
        var mid = pt1.add(pt2).multiply(0.5);
        var vec = cornerPt.subtract(mid).normalize();
        return vec;
    }

    this.move = function (delta) {
        var selfIndex = this._pathItem.anchorIndex;
        var allAnchorPts = this._pathItem.owningBBox.anchorPts();
        var edgeNeighbor1Index = this.modOffset(selfIndex, 1, allAnchorPts.length);
        var edgeNeighbor2Index = this.modOffset(selfIndex, -1, allAnchorPts.length);
        var edgeNeighbor1 = this._pathItem.owningBBox.getPathItemByAnchorPtIndex(edgeNeighbor1Index).owningBBoxElement;
        var edgeNeighbor2 = this._pathItem.owningBBox.getPathItemByAnchorPtIndex(edgeNeighbor2Index).owningBBoxElement;        
        edgeNeighbor1.move(delta);
        edgeNeighbor2.move(delta);
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

    this.init(pathItem, bbox);

    this.setCursorStyle = function () {
        var vec = this.getVector(this._pathItem.anchorIndex);
        this.setCursorStyleByVec(vec);
    }

    this.getVector = function (anchorPtIndex) {
        var allAnchorPts = this._pathItem.owningBBox.anchorPts();
        var self = anchorPtIndex;
        var opposite = this.modOffset(self, 4, allAnchorPts.length);
        var edgePt = allAnchorPts[self];
        var oppEdgePt = allAnchorPts[opposite];

        var vec = edgePt.subtract(oppEdgePt).normalize();
        return vec;
    }

    this.move = function (delta) {
        var selfIndex = this._pathItem.anchorIndex;
        var allAnchorPts = this._pathItem.owningBBox.anchorPts();
        var oppositeEdgePtIndex = this.modOffset(selfIndex, 4, allAnchorPts.length);
        var n = allAnchorPts[selfIndex].subtract(allAnchorPts[oppositeEdgePtIndex]).normalize();
        var moveVec = n.multiply(n.dot(delta));

        var neighborCorner1Index = this.modOffset(selfIndex, 1, allAnchorPts.length);
        var neighborCorner2Index = this.modOffset(selfIndex, -1, allAnchorPts.length);
        allAnchorPts[neighborCorner1Index] = allAnchorPts[neighborCorner1Index].add(moveVec);
        allAnchorPts[neighborCorner2Index] = allAnchorPts[neighborCorner2Index].add(moveVec);
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

    this.init(pathItem, bbox);

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

    this.init(pathItem, bbox);

    this.setCursorStyle = function () {
        // none-op
    }
}

skBBoxEdge.prototype = new skBBoxElement();