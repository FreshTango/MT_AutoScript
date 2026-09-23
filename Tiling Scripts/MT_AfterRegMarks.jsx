try {
    if (app.documents.length === 0) {
        throw new Error("No document is open.");
    }

    var doc = app.activeDocument;
    var ab = doc.artboards[0];

    var rect = ab.artboardRect;

    // ======================================================
    // Add 1.5" TOTAL width
    // 0.75" on each side
    // ======================================================

    var widthIncrease = 1.5 * 72;
    var halfWidthIncrease = widthIncrease / 2;

    rect[0] -= halfWidthIncrease;
    rect[2] += halfWidthIncrease;

    // ======================================================
    // Add 3.75" TOTAL height
    // 1.875" top and bottom
    // ======================================================

    var heightIncrease = 3.75 * 72;
    var halfHeightIncrease = heightIncrease / 2;

    rect[1] += halfHeightIncrease;
    rect[3] -= halfHeightIncrease;

    ab.artboardRect = rect;

} catch (e) {
    alert("Resize Error: " + e.message);
}