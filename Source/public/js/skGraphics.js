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

    this.setPathItem = function (newPathItem) {
        if (this._pathItem)
            this._pathItem.remove();

        this._pathItem = newPathItem;
        newPathItem.dispElement = this;
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

    this.copy = function (rect) {
        var tempPathItem = new Path.Oval(rect, b);
        tempPathItem.style = {
                fillColor: '#C5E6EA',
                strokeColor: '#385D8A',
                strokeWidth: 1,
                opacity: 0.5
        };

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
    var sz = 8;
    var r = sz / 2;

    var pathItem = displayElement.pathItem();
    var skelement = displayElement.skElement();

    this.createPathItems = function () {
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
            var pathItem = new Path.Line(this._anchorPts[startPtIndex], this._anchorPts[endPtIndex]);
            this._items.push(pathItem);

        }
        this._handleEdge = new Path.Line(handleStart, handleEnd);
        this._items.push(this._handleEdge);

        // create corner points
        //
        for (i = 0; i < this._anchorPts.length; i += 2) {
            var pathItem = new Path.Circle(this._anchorPts[i], r);
            pathItem.owningBBox = this;
            pathItem.anchorIndex = i;
            this._items.push(pathItem);
        }

        this._handleEnd = new Path.Circle(handleEnd, r);
        this._handleEnd.owningBBox = this;
        this._handleEnd.isA = "handleEnd";
        this._items.push(this._handleEnd);

        // create mid points
        //
        for (i = 1; i < this._anchorPts.length; i += 2) {
            var pt = this._anchorPts[i];
            var pathItem = new Path.Rectangle(pt.x - r, pt.y - r, sz, sz);
            pathItem.owningBBox = this;
            pathItem.anchorIndex = i;
            this._items.push(pathItem);
        }

        // assign drawing style
        //
        for (i = 0; i < this._items.length; i++) {
            this._items[i].style = {
                fillColor: '#C5E6EA',
                strokeColor: '#385D8A',
                strokeWidth: 1
            };
        }

        this._handleEnd.fillColor = '#8BE73D';
    }

    if (skelement.geomType() === kLineSegment) {
        this._anchorPts[0] = pathItem.firstSegment.point;
        this._anchorPts[1] = pathItem.lastSegment.point;

        var i;
        for (i = 0; i < this._anchorPts.length; i++) {
            var pathItem = new Path.Circle(this._anchorPts[i], r);
            pathItem.owningBBox = this;
            pathItem.anchorIndex = i;
            pathItem.style = {
                fillColor: '#C5E6EA',
                strokeColor: '#385D8A',
                strokeWidth: 1
            };
            this._items.push(pathItem);
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

        this.createPathItems();
    }

    this.updatePathItems = function () {
        this.clearPathItems();
        this.createPathItems();
    }

    this.clearPathItems =  function() {
        var i;
        for (i = 0; i <this._items.length; i++) {
            this._items[i].remove();
        }
    }

    this.getAnchorPointVector = function (anchorPtIndex) {
        var vec;
        if (this.isCornerAnchorPt(anchorPtIndex)) { 
            vec = this.getCornerPointVector(anchorPtIndex);
        }
        else if (this.isEdgeAnchorPt(anchorPtIndex)) { 
            vec = this.getEdgePointVector(anchorPtIndex);
        }
        return vec;
    }

    this.isCornerAnchorPt = function (anchorPtIndex) {
        return (anchorPtIndex % 2 === 0) ? true : false;
    }

    this.isEdgeAnchorPt = function (anchorPtIndex) {
        return (anchorPtIndex % 2 !== 0) ? true : false;
    }

    this.modOffset = function (index, offset, length) {
        var i = (index - offset) % length;
        if (i < 0)
            i += length;
        return i;
    }

    this.getCornerPointVector = function (anchorPtIndex) {
        var self = anchorPtIndex;
        var pre = this.modOffset(self, -2, this._anchorPts.length);
        var next = this.modOffset(self, 2, this._anchorPts.length);
        var cornerPt = this._anchorPts[self];
        var neighborPt1 = this._anchorPts[pre];
        var neighborPt2 = this._anchorPts[next];

        var vec1 = neighborPt1.subtract(cornerPt).normalize();
        var vec2 = neighborPt2.subtract(cornerPt).normalize();
        var pt1 = cornerPt.add(vec1);
        var pt2 = cornerPt.add(vec2);
        var mid = pt1.add(pt2).multiply(0.5);
        var vec = cornerPt.subtract(mid).normalize();
        return vec;
    }

    this.getEdgePointVector = function (anchorPtIndex) {
        var self = anchorPtIndex;
        var opposite = this.modOffset(self, 4, this._anchorPts.length);
        var edgePt = this._anchorPts[self];
        var oppEdgePt = this._anchorPts[opposite];

        var vec = edgePt.subtract(oppEdgePt).normalize();
        return vec;
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

    this.rect = function () {
        return new Rectangle(this._anchorPts[0], this._anchorPts[4]);
    }

    this.editByMovingAnchorPoint = function (anchorPtIndex, delta) {
        if (this.isCornerAnchorPt(anchorPtIndex)) {
            this.editByMovingCornerAnchorPoint(anchorPtIndex, delta);
        }
        else if (this.isEdgeAnchorPt(anchorPtIndex)) {
            this.editByMovingEdgeAnchorPoint(anchorPtIndex, delta);
        }
    }

    this.editByMovingEdgeAnchorPoint = function (midAnchorIndex, delta) {
        var oppositeEdgePtIndex = this.modOffset(midAnchorIndex, 4, this._anchorPts.length);
        var n = this._anchorPts[midAnchorIndex].subtract(this._anchorPts[oppositeEdgePtIndex]).normalize();
        var moveVec = n.multiply(n.dot(delta));

        var neighborCorner1Index = this.modOffset(midAnchorIndex, 1, this._anchorPts.length);
        var neighborCorner2Index = this.modOffset(midAnchorIndex, -1, this._anchorPts.length);
        this._anchorPts[neighborCorner1Index] = this._anchorPts[neighborCorner1Index].add(moveVec);
        this._anchorPts[neighborCorner2Index] = this._anchorPts[neighborCorner2Index].add(moveVec);
    }

    this.editByMovingCornerAnchorPoint = function (cornerAnchorIndex, delta) {
        var edgeNeighbor1Index = this.modOffset(cornerAnchorIndex, 1, this._anchorPts.length);
        var edgeNeighbor2Index = this.modOffset(cornerAnchorIndex, -1, this._anchorPts.length);
        this.editByMovingEdgeAnchorPoint(edgeNeighbor1Index, delta);
        this.editByMovingEdgeAnchorPoint(edgeNeighbor2Index, delta);
    }
}

