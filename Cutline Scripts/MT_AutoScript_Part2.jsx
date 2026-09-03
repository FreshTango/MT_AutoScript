// Iterate through all open Illustrator documents
for (var d = 0; d < app.documents.length; d++) {
    var doc = app.documents[d];
    app.activeDocument = doc;

    // -------------------------------------------------
    // 1. Run the "BLEED" action
    // -------------------------------------------------
    try {
        // SELECT ONLY THE BOTTOM <Compound Path>

        var layer = doc.layers.getByName("Layer 1");

        // Clear selection
        app.activeDocument.selection = null;

        // Get all page items in visible stacking order
        var items = layer.pageItems;

        // Select the bottom-most item,
        // then every 3rd item above it

        var foundBottom = false;
        var layerCount = 0;
        var startIndex = -1;

        // Find bottom-most valid item
        for (var i = items.length - 1; i >= 0; i--) {

            if (
                !items[i].locked &&
                !items[i].hidden &&
                (
                    items[i].typename === "PathItem" ||
                    items[i].typename === "CompoundPathItem"
                )
            ) {

                startIndex = i;
                foundBottom = true;
                break;

            }

        }

        // Select it + every 3rd item above it
        if (foundBottom) {

            for (var j = startIndex; j >= 0; j -= 3) {

                if (!items[j].locked && !items[j].hidden) {

                    items[j].selected = true;
                    layerCount++;
                }

            }

        }
        layerCount++;


       // PUT THE SEGMENT HERE.
// -------------------------------------------------
// Change selected cutlines to BLACK and send them
// to the VERY BOTTOM of Layer 1
// -------------------------------------------------

var black = new RGBColor();
black.red = 0;
black.green = 0;
black.blue = 0;

for (var k = startIndex; k >= 0; k -= 3) {

    if (!items[k].locked && !items[k].hidden) {

        try {

            var cutline = items[k];

            // -----------------------------------------
            // CHANGE FILL TO BLACK
            // -----------------------------------------

            if (cutline.typename === "CompoundPathItem") {

                // A Compound Path contains PathItems
                for (var p = 0; p < cutline.pathItems.length; p++) {

                    cutline.pathItems[p].filled = true;
                    cutline.pathItems[p].fillColor = black;
                    cutline.pathItems[p].stroked = false;

                }

            } else if (cutline.typename === "PathItem") {

                cutline.stroked = false;
                cutline.filled = true;
                cutline.fillColor = black;

            }


            // -----------------------------------------
            // SEND CUTLINE TO VERY BOTTOM
            // -----------------------------------------

            cutline.zOrder(ZOrderMethod.SENDTOBACK);

        } catch (e) {
            // Ignore items that don't support these operations
        }

    }

}

    } catch (e) {
        alert("Could not run BLEED action in document: " + doc.name + "\n" + e);
        continue;
    }


    // -------------------------------------------------
    // Find and select the item named "<Image>"
    // -------------------------------------------------

    var layer1 = doc.activeLayer;

    var targetIndex = layer1.pageItems.length - layerCount;

    if (
        targetIndex >= 0 &&
        targetIndex < layer1.pageItems.length
    ) {

        layer1.pageItems[targetIndex].selected = true;

    }

    app.executeMenuCommand("group");

    doc.selection = null;

    var items = app.activeDocument.activeLayer.pageItems;

    for (var i = items.length - 3; i >= 0; i -= 2) {

        if (!items[i].locked && !items[i].hidden) {
            items[i].remove();
        }

    }


    // -------------------------------------------------
    // 4. Select the <Image> item inside the group
    // -------------------------------------------------

    var items = app.activeDocument.activeLayer.pageItems;

    function findImage(items) {

        for (var i = 0; i < items.length; i++) {

            var item = items[i];

            if (
                item.typename === "RasterItem" ||
                item.typename === "PlacedItem"
            ) {

                item.selected = true;
                return true;

            }

            // Search inside groups
            if (item.typename === "GroupItem") {

                if (findImage(item.pageItems))
                    return true;

            }

        }

        return false;

    }

    findImage(items);
}
