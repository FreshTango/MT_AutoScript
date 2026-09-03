#target illustrator

try {
    if (app.documents.length === 0) {
        throw new Error("No document is open.");
    }

    var doc = app.activeDocument;
    app.executeMenuCommand("selectall");
    if (doc.selection.length === 0) {
        throw new Error("Please select artwork first.");
    }

    // Fit artboard to selected artwork
    doc.fitArtboardToSelectedArt(0);

    var ab = doc.artboards[0];
    var rect = ab.artboardRect; // [left, top, right, bottom]

    // Illustrator uses points (72 pts = 1 inch)
    var totalIncrease = 0.75 * 72; // 54 pts
    var halfIncrease = totalIncrease / 2; // 27 pts

    // Add equally to top and bottom
    rect[1] += halfIncrease; // move top up
    rect[3] -= halfIncrease; // move bottom down

    ab.artboardRect = rect;

    var scriptFolder = File($.fileName).parent;
    var exeFile = new File(scriptFolder + "/RegMarks.ahk");

    exeFile.execute();


} catch (e) {
    alert("Error: " + e.message);
}