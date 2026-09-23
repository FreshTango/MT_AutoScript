main();

function main() {

    var doc = app.activeDocument;
    var ab = doc.artboards[doc.artboards.getActiveArtboardIndex()];
    var r = ab.artboardRect;

    // ------------------------------------
    // USER INPUTS
    // ------------------------------------

    var horizontalGapInches = prompt(
        "HORIZONTAL gap between objects (inches):",
        "0.2"
    );

    if (horizontalGapInches === null) return;

    var verticalGapInches = prompt(
        "VERTICAL gap between objects (inches):",
        "0.2"
    );

    if (verticalGapInches === null) return;

    var maxTiles = prompt(
        "Maximum number of tiles:",
        "99"
    );

    if (maxTiles === null) return;

    horizontalGapInches = parseFloat(horizontalGapInches);
    verticalGapInches = parseFloat(verticalGapInches);
    maxTiles = parseInt(maxTiles, 10);

    if (
        isNaN(horizontalGapInches) ||
        isNaN(verticalGapInches) ||
        isNaN(maxTiles)
    ) {
        alert("Invalid input.");
        return;
    }

    // Convert inches to points
    var horizontalGap = horizontalGapInches * 72;
    var verticalGap = verticalGapInches * 72;

    // ------------------------------------
    // VERIFY SELECTION
    // ------------------------------------

    app.executeMenuCommand("selectall");

    if (doc.selection.length === 0) {
        alert("Please select artwork first.");
        return;
    }

    // ------------------------------------
    // GROUP SELECTION
    // ------------------------------------

    app.executeMenuCommand("group");

    var obj = doc.selection[0];

    var b = obj.visibleBounds;

    var objW = b[2] - b[0];
    var objH = b[1] - b[3];

    // ------------------------------------
    // CALCULATE TILES PER ROW
    // ------------------------------------

    var left  = r[0];
    var right = r[2];

    var usableWidth = (right - left) - (horizontalGap * 2);

    var tilesPerRow = Math.floor(
        (usableWidth + horizontalGap) /
        (objW + horizontalGap)
    );

    if (tilesPerRow < 1) {
        tilesPerRow = 1;
    }

    // ------------------------------------
    // MAX ROWS PROMPT
    // ------------------------------------

    var maxRows = prompt(
        "Tiles per row: " + tilesPerRow +
        "\n----------------------\n" +
        "Maximum number of rows:\n",
        "99"
    );

    if (maxRows === null) return;

    maxRows = parseInt(maxRows, 10);

    if (isNaN(maxRows)) {
        alert("Invalid row count.");
        return;
    }

    // ------------------------------------
    // ARTBOARD BOUNDS
    // ------------------------------------

    var top    = r[1];
    var bottom = r[3];

    // ------------------------------------
    // START POSITION
    // ------------------------------------

    var startX = left + horizontalGap;
    var startY = top - verticalGap;

    obj.position = [startX, startY];

    var count = 1;
    var rowCount = 0;

    var y = startY;

    // ------------------------------------
    // TILE OBJECTS
    // ------------------------------------

    while (
        (y - objH > bottom + verticalGap) &&
        (count < maxTiles) &&
        (rowCount < maxRows)
    ) {

        var x = startX;
        var col = 0;

        while (
            (x + objW < right - horizontalGap) &&
            (count < maxTiles)
        ) {

            if (!(rowCount === 0 && col === 0)) {

                var dup = obj.duplicate();

                dup.position = [x, y];

                count++;
            }

            // HORIZONTAL spacing
            x += objW + horizontalGap;
            col++;
        }

        // VERTICAL spacing
        y -= objH + verticalGap;
        rowCount++;
    }

    // ------------------------------------
    // REPORT RESULTS
    // ------------------------------------

    alert(
        "Tiled " + count +
        " objects\n\n" +
        "Tiles Per Row: " + tilesPerRow +
        "\nRows Used: " + rowCount +
        "\n\nHorizontal Gap: " + horizontalGapInches + " in" +
        "\nVertical Gap: " + verticalGapInches + " in"
    );

    // ------------------------------------
    // MOVE EVERYTHING FROM LAYER 2
    // TO LAYER 1
    // ------------------------------------

    try {

        var layer1 = null;
        var layer2 = null;

        // Find Layer 1 and Layer 2
        for (var i = 0; i < doc.layers.length; i++) {

            if (doc.layers[i].name === "Layer 1") {
                layer1 = doc.layers[i];
            }

            if (doc.layers[i].name === "Layer 2") {
                layer2 = doc.layers[i];
            }
        }

        // Only run if both layers exist
        if (layer1 !== null && layer2 !== null) {

            // Unlock and show both layers
            layer1.locked = false;
            layer1.visible = true;

            layer2.locked = false;
            layer2.visible = true;

            // Move all top-level artwork from Layer 2 to Layer 1
            while (layer2.pageItems.length > 0) {

                layer2.pageItems[0].move(
                    layer1,
                    ElementPlacement.PLACEATEND
                );
            }

            // Move any sublayers from Layer 2 to Layer 1
            while (layer2.layers.length > 0) {

                layer2.layers[0].move(
                    layer1,
                    ElementPlacement.PLACEATEND
                );
            }

            // Remove the now-empty Layer 2
            layer2.remove();

            // Make Layer 1 active
            doc.activeLayer = layer1;

            app.redraw();
        }

    } catch (e) {

        alert(
            "Error moving Layer 2 to Layer 1:\n\n" +
            e
        );
    }

        // ====================================================
    // FIND CUTLINES AND MOVE THEM TO NEW LAYER 2
    // Cutline RGB: 237, 40, 39
    // ====================================================

    try {

        // ------------------------------------
        // FIND LAYER 1
        // ------------------------------------

        var layer1 = null;

        for (var i = 0; i < doc.layers.length; i++) {

            if (doc.layers[i].name === "Layer 1") {
                layer1 = doc.layers[i];
                break;
            }
        }

        if (layer1 === null) {
            throw new Error("Layer 1 was not found.");
        }

        layer1.locked = false;
        layer1.visible = true;

        // ------------------------------------
        // CREATE NEW LAYER 2
        // ------------------------------------

        var layer2 = doc.layers.add();
        layer2.name = "Layer 2";

        layer2.locked = false;
        layer2.visible = true;

        // Move Layer 2 directly above Layer 1
        layer2.move(
            layer1,
            ElementPlacement.PLACEBEFORE
        );

        // ------------------------------------
        // CUTLINE COLOR
        // ------------------------------------

        var CUT_R = 237;
        var CUT_G = 40;
        var CUT_B = 39;

        var cutlines = [];

        // ------------------------------------
        // CHECK IF PATH IS CUTLINE
        // ------------------------------------

        function isCutline(item) {

            try {

                // Must be a path
                if (item.typename !== "PathItem") {
                    return false;
                }

                // Must have a stroke
                if (!item.stroked) {
                    return false;
                }

                var color = item.strokeColor;

                // Must be RGB
                if (color.typename !== "RGBColor") {
                    return false;
                }

                // Match RGB 237 / 40 / 39
                if (
                    Math.round(color.red) === CUT_R &&
                    Math.round(color.green) === CUT_G &&
                    Math.round(color.blue) === CUT_B
                ) {
                    return true;
                }

            } catch (e) {
            }

            return false;
        }

        // ------------------------------------
        // RECURSIVELY SEARCH GROUPS
        // ------------------------------------

        function findCutlines(container) {

            for (
                var i = container.pageItems.length - 1;
                i >= 0;
                i--
            ) {

                var item = container.pageItems[i];

                // ----------------------------
                // NORMAL PATH
                // ----------------------------

                if (item.typename === "PathItem") {

                    if (isCutline(item)) {
                        cutlines.push(item);
                    }
                }

                // ----------------------------
                // GROUP
                // ----------------------------

                else if (item.typename === "GroupItem") {

                    findCutlines(item);
                }

                // ----------------------------
                // COMPOUND PATH
                // ----------------------------

                else if (
                    item.typename === "CompoundPathItem"
                ) {

                    for (
                        var p = 0;
                        p < item.pathItems.length;
                        p++
                    ) {

                        if (
                            isCutline(
                                item.pathItems[p]
                            )
                        ) {

                            /*
                                Move the whole compound path
                                rather than breaking it apart.
                            */

                            cutlines.push(item);

                            break;
                        }
                    }
                }
            }
        }

        // ------------------------------------
        // SEARCH LAYER 1
        // ------------------------------------

        findCutlines(layer1);

        // ------------------------------------
        // MOVE CUTLINES TO LAYER 2
        // ------------------------------------

        var movedCount = 0;

        for (
            var c = cutlines.length - 1;
            c >= 0;
            c--
        ) {

            try {

                var cutline = cutlines[c];

                cutline.locked = false;
                cutline.hidden = false;

                cutline.move(
                    layer2,
                    ElementPlacement.PLACEATEND
                );

                movedCount++;

            } catch (moveError) {
            }
        }

        // ------------------------------------
        // MAKE LAYER 2 ACTIVE
        // ------------------------------------

        doc.activeLayer = layer2;

        app.redraw();

        // ------------------------------------
        // REPORT
        // ------------------------------------

        alert(
            "Cutlines moved to Layer 2: " +
            movedCount
        );

    } catch (e) {

        alert(
            "Error moving cutlines to Layer 2:\n\n" +
            e
        );
    }
        // ------------------------------------
    // REGISTRATION MARKS
    // ------------------------------------

    var addRegMarks = confirm(
        "Would you like to add registration marks?"
    );

    if (addRegMarks) {

        try {

            var scriptFolder = File($.fileName).parent;
            var regScript = new File(
                scriptFolder + "/MT_RegMarks.jsx"
            );

            if (regScript.exists) {

                $.evalFile(regScript);

            } else {

                alert(
                    "MT_RegMarks.jsx was not found in:\n\n" +
                    scriptFolder.fsName
                );

            }

        } catch (e) {

            alert(
                "Error running MT_RegMarks.jsx:\n\n" +
                e
            );

        }
    }
}