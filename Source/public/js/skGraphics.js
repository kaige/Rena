//-------------------------------------------------
//
//	skGraphicsManager
//
//-------------------------------------------------

function skGraphicsManager() {
	
	// set up paper with canvas
	//
	paper.install(window);
	paper.setup('drawing_canvas');	

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
}


