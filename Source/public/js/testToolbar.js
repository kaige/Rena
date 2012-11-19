
// Decorate the third toolbar.	
    var t3 = new goog.ui.Toolbar();
    t3.decorate(goog.dom.getElement('t3'));

    // Have the alignment buttons be controlled by a selection model.
    var selectionModel = new goog.ui.SelectionModel();
    selectionModel.setSelectionHandler(function(button, select) {
      if (button) {
        button.setChecked(select);
      }
    });