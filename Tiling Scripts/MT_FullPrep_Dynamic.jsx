main();

function main() {

    var doc = app.activeDocument;
    var ab = doc.artboards[doc.artboards.getActiveArtboardIndex()];
    var r = ab.artboardRect;

    // ------------------------------------
    // USER INPUTS
    // ------------------------------------

    var gapInches = prompt(
        "Gap between objects (inches):",
        "0.2"
    );

    if (gapInches === null) return;

    var maxTiles = prompt(
        "Maximum number of tiles:",
        "99"
    );

    if (maxTiles === null) return;

    gapInches = parseFloat(gapInches);
    maxTiles = parseInt(maxTiles, 10);

    if (
        isNaN(gapInches) ||
        isNaN(maxTiles)
    ) {
        alert("Invalid input.");
        return;
    }

    // Convert inches to points
    var gap = gapInches * 72;

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

    var usableWidth = (right - left) - (gap * 2);

    var tilesPerRow = Math.floor(
        (usableWidth + gap) /
        (objW + gap)
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

    var startX = left + gap;
    var startY = top - gap;

    obj.position = [startX, startY];

    var count = 1;
    var rowCount = 0;

    var tiledItems = [];
    tiledItems.push(obj);

    var y = startY;

    // ------------------------------------
    // TILE OBJECTS
    // ------------------------------------

    while (
        (y - objH > bottom + gap) &&
        (count < maxTiles) &&
        (rowCount < maxRows)
    ) {

        var x = startX;
        var col = 0;

        while (
            (x + objW < right - gap) &&
            (count < maxTiles)
        ) {

            if (!(rowCount === 0 && col === 0)) {

                var dup = obj.duplicate();

                dup.position = [x, y];

                tiledItems.push(dup);

                count++;
            }

            x += objW + gap;
            col++;
        }

        y -= objH + gap;
        rowCount++;
    }

    // ------------------------------------
    // SELECT ALL TILES
    // ------------------------------------

    doc.selection = null;

    for (var i = 0; i < tiledItems.length; i++) {
        tiledItems[i].selected = true;
    }

    // ------------------------------------
    // GROUP ALL TILES
    // ------------------------------------

    app.executeMenuCommand("group");

    // ------------------------------------
    // REPORT RESULTS
    // ------------------------------------

    alert(
        "Tiled " + count +
        " objects\n\n" +
        "Tiles Per Row: " + tilesPerRow +
        "\nRows Used: " + rowCount + "",
    );

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