// ======================================================
// Optimized for slower computers
// ======================================================

var ACTION_DELAY = 600;
var GROUP_DELAY = 400;
var DELETE_DELAY = 300;

function pause(ms) {
    app.redraw();
    $.sleep(ms);
}

if (app.documents.length === 0) {

    alert("No open documents.");

} else {

    // -------------------------------------------------
    // Iterate through all open Illustrator documents
    // -------------------------------------------------

    for (var d = 0; d < app.documents.length; d++) {

        var doc = app.documents[d];
        app.activeDocument = doc;

        try {

            //-------------------------------------------------
            // Find Layer 1
            //-------------------------------------------------

            var layer = doc.layers.getByName("Layer 1");

            doc.selection = null;
            pause(200);

            //-------------------------------------------------
            // Select bottom path + every 3rd above it
            //-------------------------------------------------

            var items = layer.pageItems;

            var startIndex = -1;
            var layerCount = 0;

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
                    break;

                }

            }

            if (startIndex < 0) {
                throw new Error("No valid PathItem or CompoundPathItem found.");
            }

            for (var j = startIndex; j >= 0; j -= 3) {

                if (!items[j].locked && !items[j].hidden) {

                    items[j].selected = true;
                    layerCount++;

                }

            }

            pause(250);

            //-------------------------------------------------
            // Run BLEED action
            //-------------------------------------------------

            app.doScript("BLEED", "PRELIMINARY");

            pause(ACTION_DELAY);

            //-------------------------------------------------
            // Select target item
            //-------------------------------------------------

            var layer1 = doc.activeLayer;

            var targetIndex = layer1.pageItems.length - (layerCount + 1);

            if (
                targetIndex >= 0 &&
                targetIndex < layer1.pageItems.length
            ) {

                doc.selection = null;
                pause(150);

                layer1.pageItems[targetIndex].selected = true;

            } else {

                $.writeln("Target item not found in " + doc.name);

            }

            pause(250);

            //-------------------------------------------------
            // Group selected artwork
            //-------------------------------------------------

            app.executeMenuCommand("group");

            pause(GROUP_DELAY);

            //-------------------------------------------------
            // Delete every other item
            //-------------------------------------------------

            doc.selection = null;

            pause(200);

            items = doc.activeLayer.pageItems;

            for (var k = items.length - 3; k >= 0; k -= 2) {

                if (!items[k].locked && !items[k].hidden) {

                    try {

                        items[k].remove();
                        pause(DELETE_DELAY);

                    } catch (err) {

                        $.writeln(err);

                    }

                }

            }

            pause(300);

            //-------------------------------------------------
            // Find first RasterItem or PlacedItem
            //-------------------------------------------------

            function findImage(pageItems) {

                for (var n = 0; n < pageItems.length; n++) {

                    var item = pageItems[n];

                    if (
                        item.typename === "RasterItem" ||
                        item.typename === "PlacedItem"
                    ) {

                        doc.selection = null;
                        item.selected = true;
                        return true;

                    }

                    if (item.typename === "GroupItem") {

                        if (findImage(item.pageItems)) {
                            return true;
                        }

                    }

                }

                return false;

            }

            if (!findImage(doc.activeLayer.pageItems)) {

                $.writeln("No image found in " + doc.name);

            }

            pause(300);

        } catch (e) {

            alert(
                "Error processing:\n\n" +
                doc.name +
                "\n\n" +
                e
            );

        }

    }

}