// ============================================================
// MT AUTO SCRIPT - BOX
// ============================================================
// For every open Illustrator document:
//
// 1. Duplicate selected artwork in front
// 2. Image Trace duplicate with preset "BOX"
// 3. Ignore White
// 4. Expand trace
// 5. Convert traced fill into stroke
// 6. Set stroke to specified CMYK red
// 7. Set stroke to 0.25 pt
// 8. Create/find "Layer 2"
// 9. Move resulting artwork to Layer 2
// 10. Ungroup first group in Layer 1
//
// No DRAW BOX action
// No IMAGE TRACE action
// No BOX PART 2 action
// ============================================================


for (var d = 0; d < app.documents.length; d++) {

    var doc = app.documents[d];

    try {

        app.activeDocument = doc;


        // ====================================================
        // 1. MAKE SURE SOMETHING IS SELECTED
        // ====================================================

        if (doc.selection.length === 0) {

            $.writeln(
                "Skipped " + doc.name +
                " - nothing selected."
            );

            continue;
        }


        // ====================================================
        // 2. COPY + PASTE IN FRONT
        // ====================================================

        app.copy();
        app.executeMenuCommand("pasteFront");

        redraw();


        // ====================================================
        // 3. STORE PASTED SELECTION
        // ====================================================

        var pastedItems = [];

        for (var i = 0; i < doc.selection.length; i++) {
            pastedItems.push(doc.selection[i]);
        }


        // ====================================================
        // 4. IMAGE TRACE WITH "BOX" PRESET
        // ====================================================

        var tracedItems = [];

        for (var i = 0; i < pastedItems.length; i++) {

            try {

                var item = pastedItems[i];
                var traced;


                // Already a tracing object
                if (
                    item.typename === "PluginItem" &&
                    item.tracing
                ) {

                    traced = item;

                } else {

                    // Start Image Trace
                    traced = item.trace();
                }


                // Apply BOX preset
                traced.tracing.tracingOptions.loadFromPreset(
                    "BOX"
                );


                // Ignore white
                traced.tracing.tracingOptions.ignoreWhite = true;


                tracedItems.push(traced);


            } catch (traceError) {

                $.writeln(
                    "Trace failed in " +
                    doc.name +
                    ": " +
                    traceError
                );
            }
        }


        // Allow Illustrator to finish updating trace
        redraw();


        // ====================================================
        // 5. EXPAND IMAGE TRACE
        // ====================================================

        var expandedItems = [];


        for (var i = 0; i < tracedItems.length; i++) {

            try {

                var traced = tracedItems[i];


                // expandTracing() returns the expanded group
                var expanded =
                    traced.tracing.expandTracing();


                if (expanded) {
                    expandedItems.push(expanded);
                }


            } catch (expandError) {

                $.writeln(
                    "Expand failed in " +
                    doc.name +
                    ": " +
                    expandError
                );
            }
        }


        redraw();


        // ====================================================
        // 6. CREATE STROKE COLOR
        // ====================================================

        var boxColor = new CMYKColor();

        boxColor.cyan    = 0.08;
        boxColor.magenta = 97.38;
        boxColor.yellow  = 96.93;
        boxColor.black   = 0.06;


        // ====================================================
        // 7. FORMAT EXPANDED PATHS
        //
        // Equivalent to:
        // Swap Fill/Stroke
        // Set stroke color
        // Set stroke weight
        // Butt Cap
        // Miter Join
        // Miter Limit 10
        // No dashes
        // ====================================================

        for (var i = 0; i < expandedItems.length; i++) {

            formatArtwork(
                expandedItems[i],
                boxColor
            );
        }


        redraw();


        // ====================================================
        // 8. FIND OR CREATE "Layer 2"
        // ====================================================

        var targetLayer = getLayerByName(
            doc,
            "Layer 2"
        );


        if (targetLayer === null) {

            targetLayer = doc.layers.add();
            targetLayer.name = "Layer 2";
        }


        // Make sure destination layer can accept artwork
        targetLayer.locked = false;
        targetLayer.visible = true;


        // ====================================================
        // 9. MOVE EXPANDED ARTWORK TO LAYER 2
        // ====================================================

        for (var i = 0; i < expandedItems.length; i++) {

            try {

                expandedItems[i].move(
                    targetLayer,
                    ElementPlacement.PLACEATBEGINNING
                );

            } catch (moveError) {

                $.writeln(
                    "Move to Layer 2 failed in " +
                    doc.name +
                    ": " +
                    moveError
                );
            }
        }


        // ====================================================
        // 10. SELECT RESULTING ARTWORK
        // ====================================================

        doc.selection = null;


        for (var i = 0; i < expandedItems.length; i++) {

            try {
                expandedItems[i].selected = true;
            } catch (e) {}
        }


        // ====================================================
        // 11. UNGROUP FIRST GROUP IN LAYER 1
        // ====================================================

        var layer1 = getLayerByName(
            doc,
            "Layer 1"
        );


        if (
            layer1 !== null &&
            layer1.groupItems.length > 0
        ) {

            try {

                var group =
                    layer1.groupItems[0];


                while (
                    group.pageItems.length > 0
                ) {

                    group.pageItems[0].move(
                        layer1,
                        ElementPlacement.PLACEATEND
                    );
                }


                group.remove();


            } catch (ungroupError) {

                $.writeln(
                    "Ungroup failed in " +
                    doc.name +
                    ": " +
                    ungroupError
                );
            }
        }


        redraw();


    } catch (e) {

        alert(
            "Error in document:\n" +
            doc.name +
            "\n\n" +
            e +
            "\n\nLine: " +
            e.line
        );
    }
}



// ============================================================
// FUNCTIONS
// ============================================================


// ------------------------------------------------------------
// Find layer by name
// Returns null if it does not exist
// ------------------------------------------------------------

function getLayerByName(doc, layerName) {

    for (var i = 0; i < doc.layers.length; i++) {

        if (doc.layers[i].name === layerName) {
            return doc.layers[i];
        }
    }

    return null;
}



// ------------------------------------------------------------
// Format expanded Image Trace artwork
// ------------------------------------------------------------

function formatArtwork(item, strokeColor) {


    // ========================================================
    // GROUP
    // ========================================================

    if (item.typename === "GroupItem") {

        for (
            var i = item.pageItems.length - 1;
            i >= 0;
            i--
        ) {

            formatArtwork(
                item.pageItems[i],
                strokeColor
            );
        }

        return;
    }



    // ========================================================
    // COMPOUND PATH
    // ========================================================

    if (item.typename === "CompoundPathItem") {

        for (
            var i = item.pathItems.length - 1;
            i >= 0;
            i--
        ) {

            formatPath(
                item.pathItems[i],
                strokeColor
            );
        }

        return;
    }



    // ========================================================
    // NORMAL PATH
    // ========================================================

    if (item.typename === "PathItem") {

        formatPath(
            item,
            strokeColor
        );

        return;
    }
}



// ------------------------------------------------------------
// Apply BOX stroke formatting
// ------------------------------------------------------------

function formatPath(path, strokeColor) {

    try {

        // ----------------------------------------------------
        // Equivalent result of "Swap Fill and Stroke"
        //
        // Image Trace creates filled shapes.
        // We want the shape outline instead.
        // ----------------------------------------------------

        path.filled = false;
        path.stroked = true;


        // ----------------------------------------------------
        // Stroke color
        // ----------------------------------------------------

        path.strokeColor = strokeColor;


        // ----------------------------------------------------
        // Stroke weight
        // ----------------------------------------------------

        path.strokeWidth = 0.25;


        // ----------------------------------------------------
        // Butt Cap
        // ----------------------------------------------------

        path.strokeCap =
            StrokeCap.BUTTENDCAP;


        // ----------------------------------------------------
        // Miter Join
        // ----------------------------------------------------

        path.strokeJoin =
            StrokeJoin.MITERENDJOIN;


        // ----------------------------------------------------
        // Miter Limit
        // ----------------------------------------------------

        path.strokeMiterLimit = 10;


        // ----------------------------------------------------
        // No dashed line
        // ----------------------------------------------------

        path.strokeDashes = [];


    } catch (e) {

        $.writeln(
            "Could not format path: " +
            e
        );
    }
}