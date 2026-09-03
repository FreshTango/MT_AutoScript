var doc = app.activeDocument;
var ab = doc.artboards[doc.artboards.getActiveArtboardIndex()];
var r = ab.artboardRect;

// ------------------------------------
// GLOBAL VARIABLES
// ------------------------------------

// 0.2 inch spacing
var gap = 14.4; // points

// Maximum number of objects to create
var maxTiles = 99;

// ------------------------------------

// Artboard bounds
var left   = r[0];
var top    = r[1];
var right  = r[2];
var bottom = r[3];
app.executeMenuCommand("selectall");
// Group selected artwork
if (doc.selection.length > 0) {

    app.executeMenuCommand("group");

    var obj = doc.selection[0];

    var b = obj.visibleBounds;

    var objW = b[2] - b[0];
    var objH = b[1] - b[3];

    // Starting position
    var startX = left + gap;
    var startY = top - gap;

    // Move original object
    obj.position = [startX, startY];

    var count = 1; // original object

    // Tile across artboard
    var y = startY;

    while (y - objH > bottom + gap && count < maxTiles) {

        var x = startX;

        while (x + objW < right - gap && count < maxTiles) {

            // Skip first object
            if (!(x === startX && y === startY)) {

                var dup = obj.duplicate();

                dup.position = [x, y];

                count++;

            }

            x += objW + gap;

        }

        y -= objH + gap;

    }

    var scriptFolder = File($.fileName).parent;

    // Run Script 1
    $.evalFile(File(scriptFolder + "/MT_RegMarks.jsx"));
    redraw();

}