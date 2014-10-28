#Author-Autodesk Inc.
#Description-Create a bottle.

import adsk.core, adsk.fusion, traceback, math

# scale of the bottle size
scale = 2.0

# unit - cm
height = 21
topWidth = 2.8
topHight = 1.9
bodyTopWidth = 0.4
bottomWidth = 3.2
upperArcCenterToTop = 4.5
upperArcRadius = 16
lowerArcRadius = 15
filletRadius = 0.5
thickness = 0.3

# used for direct modeling
upperArcMidPtXOffset = -0.18
upperArcMidPtYOffset = -4.1
upperArcEndPtXOffset = 0.46
upperArcEndPtYOffset = -7.2
lowerArcMidPtXOffsetFromOriginPt = 4.66
lowerArcMidPtYOffsetFromOriginPt = 5.9

bottomCenter = adsk.core.Point3D.create(0, 0, 0)
bottleMaterial = 'Glass'
bottleAppearance = 'Glass (Green)'
materialLibName = 'Fusion 360 Material Library'
appearanceLibName = 'Fusion 360 Appearance Library'

nearZero = 0.000001

app = adsk.core.Application.get()
ui  = app.userInterface

def createBottle():
    product = app.activeProduct
    design = adsk.fusion.Design.cast(product)
    currentDesignType = design.designType
    # scale the size
    global height, topWidth, topHight, bodyTopWidth, bottomWidth, upperArcCenterToTop, upperArcRadius, lowerArcRadius, filletRadius, thickness
    height = height * scale
    topWidth = topWidth * scale
    topHight = topHight * scale
    bodyTopWidth = bodyTopWidth * scale
    bottomWidth = bottomWidth * scale
    upperArcCenterToTop = upperArcCenterToTop * scale
    upperArcRadius = upperArcRadius * scale
    lowerArcRadius = lowerArcRadius * scale
    filletRadius = filletRadius * scale
    thickness = thickness * scale

    if currentDesignType == adsk.fusion.DesignTypes.DirectDesignType:
        global upperArcMidPtXOffset, upperArcMidPtYOffset, upperArcEndPtXOffset, upperArcEndPtYOffset, lowerArcMidPtXOffsetFromOriginPt, lowerArcMidPtYOffsetFromOriginPt
        upperArcMidPtXOffset = upperArcMidPtXOffset * scale
        upperArcMidPtYOffset = upperArcMidPtYOffset * scale
        upperArcEndPtXOffset = upperArcEndPtXOffset * scale
        upperArcEndPtYOffset = upperArcEndPtYOffset * scale
        lowerArcMidPtXOffsetFromOriginPt = lowerArcMidPtXOffsetFromOriginPt * scale
        lowerArcMidPtYOffsetFromOriginPt = lowerArcMidPtYOffsetFromOriginPt * scale

    comp = product.rootComponent

    # add sketch
    sketches = comp.sketches
    sketch = sketches.add(comp.xYConstructionPlane)

    # add sketch curves
    sketchlines = sketch.sketchCurves.sketchLines

    endPt = bottomCenter.copy() #start from bottomCenter
    endPt.y = bottomCenter.y + height
    heightLine = sketchlines.addByTwoPoints(bottomCenter, endPt)

    endPt.x = endPt.x + topWidth
    topLine = sketchlines.addByTwoPoints(heightLine.endSketchPoint, endPt)

    endPt.y = endPt.y - topHight
    topHightLine = sketchlines.addByTwoPoints(topLine.endSketchPoint, endPt)

    endPt.x = endPt.x + bodyTopWidth
    topBodyLine = sketchlines.addByTwoPoints(topHightLine.endSketchPoint, endPt)

    sketchArcs = sketch.sketchCurves.sketchArcs

    if currentDesignType == adsk.fusion.DesignTypes.DirectDesignType:
        endPt.x = topBodyLine.endSketchPoint.geometry.x + upperArcEndPtXOffset
        endPt.y = topBodyLine.endSketchPoint.geometry.y + upperArcEndPtYOffset
        ptOnArc = adsk.core.Point3D.create(topBodyLine.endSketchPoint.geometry.x + upperArcMidPtXOffset, topBodyLine.endSketchPoint.geometry.y + upperArcMidPtYOffset)
        upperArc = sketchArcs.addByThreePoints(topBodyLine.endSketchPoint, ptOnArc, endPt)

        endPt = bottomCenter.copy()
        endPt.x = bottomWidth
        ptOnArc = adsk.core.Point3D.create(lowerArcMidPtXOffsetFromOriginPt, lowerArcMidPtYOffsetFromOriginPt)
    else:
        deltPos = 0.1
        endPt.x = topWidth + bodyTopWidth + bodyTopWidth
        endPt.y = height / 2
        ptOnArc = adsk.core.Point3D.create(endPt.x - deltPos, endPt.y + deltPos)
        upperArc = sketchArcs.addByThreePoints(topBodyLine.endSketchPoint, ptOnArc, endPt)

        endPt = bottomCenter.copy()
        endPt.x = bottomWidth
        ptOnArc = adsk.core.Point3D.create(endPt.x + deltPos, endPt.y + deltPos)

    lowerArc = sketchArcs.addByThreePoints(upperArc.endSketchPoint, ptOnArc, endPt)
    buttomLine = sketchlines.addByTwoPoints(lowerArc.startSketchPoint, heightLine.startSketchPoint)

    # add constraints
    heightLine.startSketchPoint.isFixed = True
    sketchConstraints = sketch.geometricConstraints
    sketchConstraints.addHorizontal(buttomLine)
    sketchConstraints.addPerpendicular(buttomLine, heightLine)
    sketchConstraints.addPerpendicular(heightLine, topLine)
    sketchConstraints.addPerpendicular(topLine, topHightLine)
    sketchConstraints.addPerpendicular(topHightLine, topBodyLine)

    # add dimensions
    sketchDims = sketch.sketchDimensions

    startPt = heightLine.startSketchPoint.geometry
    endPt = heightLine.endSketchPoint.geometry
    textPos = adsk.core.Point3D.create((startPt.x + endPt.x) / 2, (startPt.y + endPt.y) / 2, 0)
    textPos.x = textPos.x - 1
    sketchDims.addDistanceDimension(heightLine.startSketchPoint, heightLine.endSketchPoint, adsk.fusion.DimensionOrientations.AlignedDimensionOrientation, textPos)

    startPt = topLine.startSketchPoint.geometry
    endPt = topLine.endSketchPoint.geometry
    textPos = adsk.core.Point3D.create((startPt.x + endPt.x) / 2, (startPt.y + endPt.y) / 2, 0)
    textPos.y = textPos.y + 1
    sketchDims.addDistanceDimension(topLine.startSketchPoint, topLine.endSketchPoint, adsk.fusion.DimensionOrientations.AlignedDimensionOrientation, textPos)

    startPt = topHightLine.startSketchPoint.geometry
    endPt = topHightLine.endSketchPoint.geometry
    textPos = adsk.core.Point3D.create((startPt.x + endPt.x) / 2, (startPt.y + endPt.y) / 2, 0)
    textPos.x = textPos.x + 1
    sketchDims.addDistanceDimension(topHightLine.startSketchPoint, topHightLine.endSketchPoint, adsk.fusion.DimensionOrientations.AlignedDimensionOrientation, textPos)

    startPt = topBodyLine.startSketchPoint.geometry
    endPt = topBodyLine.endSketchPoint.geometry
    textPos = adsk.core.Point3D.create((startPt.x + endPt.x) / 2, (startPt.y + endPt.y) / 2, 0)
    textPos.y = textPos.y + 1
    sketchDims.addDistanceDimension(topBodyLine.startSketchPoint, topBodyLine.endSketchPoint, adsk.fusion.DimensionOrientations.AlignedDimensionOrientation, textPos)

    startPt = buttomLine.startSketchPoint.geometry
    endPt = buttomLine.endSketchPoint.geometry
    textPos = adsk.core.Point3D.create((startPt.x + endPt.x) / 2, (startPt.y + endPt.y) / 2, 0)
    textPos.y = textPos.y - 1
    sketchDims.addDistanceDimension(buttomLine.startSketchPoint, buttomLine.endSketchPoint, adsk.fusion.DimensionOrientations.AlignedDimensionOrientation, textPos)

    startPt = topLine.endSketchPoint.geometry
    endPt = upperArc.centerSketchPoint.geometry
    textPos = adsk.core.Point3D.create((startPt.x + endPt.x) / 2, (startPt.y + endPt.y) / 2, 0)
    if currentDesignType == adsk.fusion.DesignTypes.DirectDesignType:
        sketchDims.addDistanceDimension(topLine.endSketchPoint, upperArc.centerSketchPoint, adsk.fusion.DimensionOrientations.VerticalDimensionOrientation, textPos)
    else:
        distDim = sketchDims.addDistanceDimension(topLine.endSketchPoint, upperArc.centerSketchPoint, adsk.fusion.DimensionOrientations.VerticalDimensionOrientation, textPos)
        distDim.parameter.value = upperArcCenterToTop

        startPt = upperArc.centerSketchPoint.geometry
        textPos = adsk.core.Point3D.create(startPt.x + deltPos, startPt.y, 0)
        radialArc = sketchDims.addRadialDimension(upperArc, textPos)
        radialArc.parameter.value = upperArcRadius

        startPt = lowerArc.centerSketchPoint.geometry
        textPos = adsk.core.Point3D.create(startPt.x + deltPos, startPt.y, 0)
        radialArc = sketchDims.addRadialDimension(lowerArc, textPos)
        radialArc.parameter.value = lowerArcRadius

    # create revolve
    revolveFeats = comp.features.revolveFeatures

    revolveInput = revolveFeats.createInput(sketch.profiles[0], heightLine, adsk.fusion.FeatureOperations.NewBodyFeatureOperation)
    revolveInput.setAngleExtent(True, adsk.core.ValueInput.createByReal(2 * math.pi))
    revolveFeat = revolveFeats.add(revolveInput)

    # create fillets
    filletFeats = comp.features.filletFeatures

    # select the edges to do fillets
    faces = revolveFeat.faces
    body = faces[0].body
    edgeCol = adsk.core.ObjectCollection.create()
    for edge in body.edges:
        circle = edge.geometry
        if math.fabs(circle.radius - bottomWidth) < nearZero or math.fabs(circle.radius - topWidth - bodyTopWidth) < nearZero:
            edgeCol.add(edge)

    filletInput = filletFeats.createInput()
    filletInput.addConstantRadiusEdgeSet(edgeCol, adsk.core.ValueInput.createByReal(filletRadius), True)
    filletFeats.add(filletInput)

    # create shell
    shellFeats = comp.features.shellFeatures

    # select the faces to remove
    faceCol = adsk.core.ObjectCollection.create()
    for face in faces:
        # find the top face
        if face.geometry.surfaceType == adsk.core.SurfaceTypes.PlaneSurfaceType:
            edge0 = face.edges[0]
            if edge0.geometry.center.isEqualTo(heightLine.endSketchPoint.worldGeometry):
                faceCol.add(face)
                break

    shellInput = shellFeats.createInput(faceCol)
    shellInput.insideThickness = adsk.core.ValueInput.createByReal(thickness)
    shellFeats.add(shellInput)

    # set material
    materialLibs = app.materialLibraries
    materials = materialLibs.itemByName(materialLibName).materials
    appearances = materialLibs.itemByName(appearanceLibName).appearances

    body.material = materials.itemByName(bottleMaterial)
    body.appearance = appearances.itemByName(bottleAppearance)

    app.activeViewport.refresh()

def main():
    try:
        createBottle();

    except:
        if ui:
            ui.messageBox('Failed:\n{}'.format(traceback.format_exc()))

main()
