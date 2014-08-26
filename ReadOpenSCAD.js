//Community
//Description-Read an OpenSCAD File and create a Fusion 360 Parametric Model from it
/*globals adsk*/
(function () {

    "use strict";

    if (adsk.debug === true) {
        /*jslint debug: true*/
        debugger;
        /*jslint debug: false*/
    }

    var ui;
    try {
        
        var app = adsk.core.Application.get();
        ui = app.userInterface;
        
        var design = adsk.fusion.Design(app.activeProduct);
        var title = 'Import OpenSCAD';
        if (!design) {
            ui.messageBox('No active design', title);
            adsk.terminate();
            return;
        }
        
        var dlg = ui.createFileDialog();
        dlg.title = 'Import OpenSCAD';
        dlg.filter = 'Comma Separated Values (*.scad);;All Files (*.*)';
        if (dlg.showOpen() !== adsk.core.DialogResults.DialogOK) {
            adsk.terminate();
            return;
        }
        var filename = dlg.filename;
        
        var buffer = adsk.readFile(filename);
        if (!buffer) {
            ui.messageBox('Failed to open ' + filename);
            adsk.terminate();
            return;
        }
        var data = adsk.utf8ToString(buffer);
        
        ui.messageBox(data);
        
    } 
    catch(e) {
        if (ui) {
            ui.messageBox('Failed : ' + (e.description ? e.description : e));
        }
    }

    adsk.terminate();
}());
