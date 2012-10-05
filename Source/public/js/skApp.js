//-------------------------------------------------
//
//	skApp
//
//-------------------------------------------------

function skApp() {
	this._elements = [];
	this._constraints = [];

	this.addElement = function (element) {
	    this._elements.push(element);
	}
	
	this.addConstraint = function(constraint) {
		this._constraints.push(constraint);
	}

	this.elements = function () {
	    return this._elements;
	}
	
}