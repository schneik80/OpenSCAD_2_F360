//Author-Autodesk Inc.
//Description-Create a bottle.
/*globals adsk*/
(function () {

    "use strict";

    // scale of the bottle size
    var scale = 1.0;

    // unit - cm
    var height = 21;
    var topWidth = 2.8;
    var topHight = 1.9;
    var bodyTopWidth = 0.4;
    var bottomWidth = 3.2;
    var upperArcCenterToTop = 4.5;
    var upperArcRadius = 16;
    var lowerArcRadius = 15;
    var filletRadius = 0.5;
    var thickness = 0.3;

    // used for direct modeling
    var upperArcMidPtXOffset = -0.18;
    var upperArcMidPtYOffset = -4.1;
    var upperArcEndPtXOffset = 0.46;
    var upperArcEndPtYOffset = -7.2;
    var lowerArcMidPtXOffsetFromOriginPt = 4.66;
    var lowerArcMidPtYOffsetFromOriginPt = 5.9;

    var bottomCenter = adsk.core.Point3D.create(0, 0, 0);
    var bottleMaterial = 'Glass';
    var bottleAppearance = 'Glass (Green)';
    var materialLibName = 'Fusion 360 Material Library';
    var appearanceLibName = 'Fusion 360 Appearance Library';

    var nearZero = 0.000001;
    var app = adsk.core.Application.get(), ui;
    if (app) {
        ui = app.userInterface;
    }

    var createBottle = function(){
        var product = app.activeProduct;
        var design = adsk.fusion.Design.cast(product);
        var currentDesignType = design.designType;
        // scale the size
        height = height * scale;
        topWidth = topWidth * scale;
        topHight = topHight * scale;
        bodyTopWidth = bodyTopWidth * scale;
        bottomWidth = bottomWidth * scale;
        upperArcCenterToTop = upperArcCenterToTop * scale;
        upperArcRadius = upperArcRadius * scale;
        lowerArcRadius = lowerArcRadius * scale;
        filletRadius = filletRadius * scale;
        thickness = thickness * scale;

        if (currentDesignType === adsk.fusion.DesignTypes.DirectDesignType) {
            upperArcMidPtXOffset = upperArcMidPtXOffset * scale;
            upperArcMidPtYOffset = upperArcMidPtYOffset * scale;
            upperArcEndPtXOffset = upperArcEndPtXOffset * scale;
            upperArcEndPtYOffset = upperArcEndPtYOffset * scale;
            lowerArcMidPtXOffsetFromOriginPt = lowerArcMidPtXOffsetFromOriginPt * scale;
            lowerArcMidPtYOffsetFromOriginPt = lowerArcMidPtYOffsetFromOriginPt * scale;
        }

        var comp = product.rootComponent;

        // add sketch
        var sketches = comp.sketches;
        var sketch = sketches.add(comp.xYConstructionPlane);

        // add sketch curves
        var sketchlines = sketch.sketchCurves.sketchLines;

        var endPt = bottomCenter.copy();//start from bottomCenter
        endPt.y = bottomCenter.y + height;
        var heightLine = sketchlines.addByTwoPoints(bottomCenter, endPt);

        endPt.x = endPt.x + topWidth;
        var topLine = sketchlines.addByTwoPoints(heightLine.endSketchPoint, endPt);

        endPt.y = endPt.y - topHight;
        var topHightLine = sketchlines.addByTwoPoints(topLine.endSketchPoint, endPt);

        endPt.x = endPt.x + bodyTopWidth;
        var topBodyLine = sketchlines.addByTwoPoints(topHightLine.endSketchPoint, endPt);

        var sketchArcs = sketch.sketchCurves.sketchArcs;

        var upperArc, ptOnArc, deltPos;
        if (currentDesignType === adsk.fusion.DesignTypes.DirectDesignType ) {
            endPt.x = topBodyLine.endSketchPoint.geometry.x + upperArcEndPtXOffset;
            endPt.y = topBodyLine.endSketchPoint.geometry.y + upperArcEndPtYOffset;
            ptOnArc = adsk.core.Point3D.create(topBodyLine.endSketchPoint.geometry.x + upperArcMidPtXOffset, topBodyLine.endSketchPoint.geometry.y + upperArcMidPtYOffset);
            upperArc = sketchArcs.addByThreePoints(topBodyLine.endSketchPoint, ptOnArc, endPt);

            endPt = bottomCenter.copy();
            endPt.x = bottomWidth;
            ptOnArc = adsk.core.Point3D.create(lowerArcMidPtXOffsetFromOriginPt, lowerArcMidPtYOffsetFromOriginPt);
        } else {
            deltPos = 0.1;
            endPt.x = topWidth + bodyTopWidth + bodyTopWidth;
            endPt.y = height / 2;
            ptOnArc = adsk.core.Point3D.create(endPt.x - deltPos, endPt.y + deltPos);
            upperArc = sketchArcs.addByThreePoints(topBodyLine.endSketchPoint, ptOnArc, endPt);

            endPt = bottomCenter.copy();
            endPt.x = bottomWidth;
            ptOnArc = adsk.core.Point3D.create(endPt.x + deltPos, endPt.y + deltPos);
            
        }
        var lowerArc = sketchArcs.addByThreePoints(upperArc.endSketchPoint, ptOnArc, endPt);
        var buttomLine = sketchlines.addByTwoPoints(lowerArc.startSketchPoint, heightLine.startSketchPoint);

        // add constraints
        heightLine.startSketchPoint.isFixed = true;
        var sketchConstraints = sketch.geometricConstraints;
        sketchConstraints.addHorizontal(buttomLine);
        sketchConstraints.addPerpendicular(buttomLine, heightLine);
        sketchConstraints.addPerpendicular(heightLine, topLine);
        sketchConstraints.addPerpendicular(topLine, topHightLine);
        sketchConstraints.addPerpendicular(topHightLine, topBodyLine);
        
        // add dimensions
        var sketchDims = sketch.sketchDimensions;
        
        var startPt = heightLine.startSketchPoint.geometry;
        endPt = heightLine.endSketchPoint.geometry;
        var textPos = adsk.core.Point3D.create((startPt.x + endPt.x) / 2, (startPt.y + endPt.y) / 2, 0);
        textPos.x = textPos.x - 1;
        sketchDims.addDistanceDimension(heightLine.startSketchPoint, heightLine.endSketchPoint, adsk.fusion.DimensionOrientations.AlignedDimensionOrientation, textPos);
        
        startPt = topLine.startSketchPoint.geometry;
        endPt = topLine.endSketchPoint.geometry;
        textPos = adsk.core.Point3D.create((startPt.x + endPt.x) / 2, (startPt.y + endPt.y) / 2, 0);
        textPos.y = textPos.y + 1;
        sketchDims.addDistanceDimension(topLine.startSketchPoint, topLine.endSketchPoint, adsk.fusion.DimensionOrientations.AlignedDimensionOrientation, textPos);
        
        startPt = topHightLine.startSketchPoint.geometry;
        endPt = topHightLine.endSketchPoint.geometry;
        textPos = adsk.core.Point3D.create((startPt.x + endPt.x) / 2, (startPt.y + endPt.y) / 2, 0);
        textPos.x = textPos.x + 1;
        sketchDims.addDistanceDimension(topHightLine.startSketchPoint, topHightLine.endSketchPoint, adsk.fusion.DimensionOrientations.AlignedDimensionOrientation, textPos);

        startPt = topBodyLine.startSketchPoint.geometry;
        endPt = topBodyLine.endSketchPoint.geometry;
        textPos = adsk.core.Point3D.create((startPt.x + endPt.x) / 2, (startPt.y + endPt.y) / 2, 0);
        textPos.y = textPos.y + 1;
        sketchDims.addDistanceDimension(topBodyLine.startSketchPoint, topBodyLine.endSketchPoint, adsk.fusion.DimensionOrientations.AlignedDimensionOrientation, textPos);

        startPt = buttomLine.startSketchPoint.geometry;
        endPt = buttomLine.endSketchPoint.geometry;
        textPos = adsk.core.Point3D.create((startPt.x + endPt.x) / 2, (startPt.y + endPt.y) / 2, 0);
        textPos.y = textPos.y - 1;
        sketchDims.addDistanceDimension(buttomLine.startSketchPoint, buttomLine.endSketchPoint, adsk.fusion.DimensionOrientations.AlignedDimensionOrientation, textPos);

        startPt = topLine.endSketchPoint.geometry;
        endPt = upperArc.centerSketchPoint.geometry;
        textPos = adsk.core.Point3D.create((startPt.x + endPt.x) / 2, (startPt.y + endPt.y) / 2, 0);
        if (currentDesignType === adsk.fusion.DesignTypes.DirectDesignType) {
            sketchDims.addDistanceDimension(topLine.endSketchPoint, upperArc.centerSketchPoint, adsk.fusion.DimensionOrientations.VerticalDimensionOrientation, textPos);
        } else {
            var distDim = sketchDims.addDistanceDimension(topLine.endSketchPoint, upperArc.centerSketchPoint, adsk.fusion.DimensionOrientations.VerticalDimensionOrientation, textPos);
            distDim.parameter.value = upperArcCenterToTop;

            startPt = upperArc.centerSketchPoint.geometry;
            textPos = adsk.core.Point3D.create(startPt.x + deltPos, startPt.y, 0);
            var radialArc = sketchDims.addRadialDimension(upperArc, textPos);
            radialArc.parameter.value = upperArcRadius;

            startPt = lowerArc.centerSketchPoint.geometry;
            textPos = adsk.core.Point3D.create(startPt.x + deltPos, startPt.y, 0);
            radialArc = sketchDims.addRadialDimension(lowerArc, textPos);
            radialArc.parameter.value = lowerArcRadius;
        }

        // create revolve
        var revolveFeats = comp.features.revolveFeatures;
        
        var revolveInput = revolveFeats.createInput(sketch.profiles.item(0), heightLine, adsk.fusion.FeatureOperations.NewBodyFeatureOperation);
        revolveInput.setAngleExtent(true, adsk.core.ValueInput.createByReal(2 * Math.PI));
        var revolveFeat = revolveFeats.add(revolveInput);
        
        // create fillets
        var filletFeats = comp.features.filletFeatures;
        
        // select the edges to do fillets
        var faces = revolveFeat.faces;
        var body = faces.item(0).body;
        var edgeCol = adsk.core.ObjectCollection.create();
        for(var j = 0; j < body.edges.count; j++){
            var edge = body.edges.item(j);
            var circle = edge.geometry;
            if(Math.abs(circle.radius - bottomWidth) < nearZero ||
               Math.abs(circle.radius - topWidth - bodyTopWidth) < nearZero){
                edgeCol.add(edge);
            }
        }
        
        var filletInput = filletFeats.createInput();
        filletInput.addConstantRadiusEdgeSet(edgeCol, adsk.core.ValueInput.createByReal(filletRadius), true);
        filletFeats.add(filletInput);
        
        // create shell
        var shellFeats = comp.features.shellFeatures;
        
        // select the faces to remove
        var faceCol = adsk.core.ObjectCollection.create();
        for(var i = 0; i < faces.count; i++){
            // find the top face;
            var face = faces.item(i);
            if(face.geometry.surfaceType == adsk.core.SurfaceTypes.PlaneSurfaceType){
                var edge0 = face.edges.item(0);
                if(edge0.geometry.center.isEqualTo(heightLine.endSketchPoint.worldGeometry)){
                    faceCol.add(face);
                    break;
                }
            }
        }
        
        var shellInput = shellFeats.createInput(faceCol);
        shellInput.insideThickness = adsk.core.ValueInput.createByReal(thickness);
        shellFeats.add(shellInput);
        
        //set material
        var materialLibs = app.materialLibraries;
        var materials = materialLibs.itemByName(materialLibName).materials;
        var appearances = materialLibs.itemByName(appearanceLibName).appearances;
        
        body.material = materials.itemByName(bottleMaterial);
        body.appearance = appearances.itemByName(bottleAppearance);
        
        app.activeViewport.refresh();
    };
    
    try {
        if (adsk.debug === true) {
            /*jslint debug: true*/
            debugger;
            /*jslint debug: false*/
        }
        
        createBottle();
    }
    catch(e) {
        if (ui) {
            ui.messageBox('Failed : ' + (e.description ? e.description : e));
        }
    }
    
    adsk.terminate();
}());
