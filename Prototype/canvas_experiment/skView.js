// global variables
//
var tempCanvas, tempCtx, drawingCanvas, drawingCtx;
var lineBtn, circleBtn, testBtn, selectedBtn;
var firstPtSelected = false;
var firstPtX = 0;
var firstPtY = 0;


// skView: event handlers
//
var skApp = new skApp();
window.addEventListener('load', eventLoad, false);

function onMouseDownCanvas(e) {
    if (!firstPtSelected) {
        firstPtSelected = true;
        firstPtX = e.pageX;
        firstPtY = e.pageY;
    }
    else {
        var secondPtX = e.pageX;
        var secondPtY = e.pageY;
        firstPtSelected = false;

        var pt1 = new skPoint(firstPtX, firstPtY);
		var pt2 = new skPoint(secondPtX, secondPtY);
		var element = skApp.createGeomElement(pt1, pt2);
		skApp.append(element);
		element.draw(tempCtx);
    }
}

function onMouseMoveCanvas(e) {
    if (firstPtSelected) {

        var tempPtX = e.pageX;
        var tempPtY = e.pageY;

        // clear old canvas
        //
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

        // draw new line
        //
        var pt1 = new skPoint(firstPtX, firstPtY);
		var pt2 = new skPoint(tempPtX, tempPtY);
		var element = skApp.createGeomElement(pt1, pt2);
		element.draw(tempCtx);
    }
}

function onMouseUpCanvas(e) {
    drawingCtx.drawImage(tempCanvas, 0, 0);
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
}

function onMouseOverLnBtn() {
    if (selectedBtn !== lineBtn)
		lineBtn.src = "img\\line_highlight.png";
}

function onMouseOutLnBtn() {
	if (selectedBtn !== lineBtn)
		lineBtn.src = "img\\line.png";
}

function onClickLnBtn(e) {
    if (selectedBtn !== lineBtn) {
		selectedBtn = lineBtn;
		lineBtn.src = "img\\line_select.png";
		circleBtn.src = "img\\circle.png";
		skApp.setCreateGeomType(kLine);
	}
}

function onMouseOverCirBtn() {
	if (selectedBtn !== circleBtn)
		circleBtn.src = "img\\circle_highlight.png";
}

function onMouseOutCirBtn() {
    if (selectedBtn !== circleBtn)
		circleBtn.src = "img\\circle.png";
}

function onClickCirBtn() {
    if (selectedBtn !== circleBtn) {
		selectedBtn = circleBtn;
		circleBtn.src = "img\\circle_select.png";
		lineBtn.src = "img\\line.png";
		skApp.setCreateGeomType(kCircle);
	}
}

function onClickTestBtn() {
	skApp.testFunc(drawingCtx);
}

function eventLoad() {
    tempCanvas = document.getElementById('tempCanvas');
    tempCtx = tempCanvas.getContext('2d');
    drawingCanvas = document.getElementById('drawingCanvas');
    drawingCtx = drawingCanvas.getContext('2d');

    tempCanvas.addEventListener('mousedown', onMouseDownCanvas, false);
    tempCanvas.addEventListener('mousemove', onMouseMoveCanvas, false);
    tempCanvas.addEventListener('mouseup', onMouseUpCanvas, false);

    lineBtn = document.getElementById('line_btn');
    lineBtn.onmouseover = onMouseOverLnBtn;
    lineBtn.onmouseout = onMouseOutLnBtn;
    lineBtn.onclick = onClickLnBtn;

    circleBtn = document.getElementById('circle_btn');
    circleBtn.onmouseover = onMouseOverCirBtn;
    circleBtn.onmouseout = onMouseOutCirBtn;
    circleBtn.onclick = onClickCirBtn;
	
	testBtn = document.getElementById('test_btn');
	testBtn.onclick = onClickTestBtn;
}
