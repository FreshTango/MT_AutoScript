#target illustrator

var processAll = confirm(
    "Process all open Illustrator files?\n\n" +
    "Yes = All Open Files\n" +
    "No = Active File Only"
);

if (processAll) {

    var processed = 0;

    for (var d = 0; d < app.documents.length; d++) {

        app.activeDocument = app.documents[d];

        try {

            processDocument(app.activeDocument);
            processed++;

            // Wait 5 seconds before next file
            if (d < app.documents.length - 1) {
                $.sleep(250);
            }

        } catch (e) {

            alert(
                "Error in file:\n" +
                app.activeDocument.name +
                "\n\n" +
                e
            );
        }
    }

    alert(
        "Finished processing " +
        processed +
        " document(s)."
    );

} else {

    processDocument(app.activeDocument);

}

function processDocument(doc) {

    var ab = doc.artboards[
        doc.artboards.getActiveArtboardIndex()
    ];

    var r = ab.artboardRect;

    // ------------------------------------
    // GLOBAL VARIABLES
    // ------------------------------------

    var gap = 14.4; // 0.2 inches
    var maxTiles = 99;

    // ------------------------------------

    var left   = r[0];
    var top    = r[1];
    var right  = r[2];
    var bottom = r[3];

    app.executeMenuCommand("selectall");

    if (doc.selection.length === 0) {
        throw new Error("No artwork selected.");
    }

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

    var count = 1;

    // Tile across artboard
    var y = startY;

    while (
        y - objH > bottom + gap &&
        count < maxTiles
    ) {

        var x = startX;

        while (
            x + objW < right - gap &&
            count < maxTiles
        ) {

            if (!(x === startX && y === startY)) {

                var dup = obj.duplicate();

                dup.position = [x, y];

                count++;
            }

            x += objW + gap;
        }

        y -= objH + gap;
    }
}