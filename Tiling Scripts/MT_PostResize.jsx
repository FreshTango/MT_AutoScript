#target illustrator

try {

    if (app.documents.length === 0) {
        throw new Error("No document is open.");
    }

    var doc = app.activeDocument;
    var ab = doc.artboards[doc.artboards.getActiveArtboardIndex()];

    var rect = ab.artboardRect; // [left, top, right, bottom]

    // Illustrator uses points (72 pts = 1 inch)

    // Width increase: 1.5" total
    var halfWidth = (1.5 * 72) / 2; // 54 pts each side

    // Height increase: 3.75" total
    var halfHeight = (3.75 * 72) / 2; // 135 pts each side

    // Expand equally on all sides
    rect[0] -= halfWidth;   // left
    rect[2] += halfWidth;   // right
    rect[1] += halfHeight;  // top
    rect[3] -= halfHeight;  // bottom

    ab.artboardRect = rect;

} catch (e) {

    alert("Error: " + e.message);

}