// -------------------------------------------------
// Process ALL open Illustrator documents
// -------------------------------------------------

for (var d = 0; d < app.documents.length; d++) {

    try {

        var doc = app.documents[d];
        app.activeDocument = doc;

        // -------------------------------------------------
        // 1. Run actions
        // -------------------------------------------------
        app.doScript("DRAW BOX", "PRELIMINARY");
        app.doScript("IMAGE TRACE", "PRELIMINARY");

        // -------------------------------------------------
        // 2. Apply Image Trace preset "BOX"
        // -------------------------------------------------

        if (doc.selection.length > 0) {

            // Store selection first
            var selectedItems = [];

            for (var s = 0; s < doc.selection.length; s++) {
                selectedItems.push(doc.selection[s]);
            }

            for (var i = 0; i < selectedItems.length; i++) {

                try {

                    var item = selectedItems[i];

                    // Works on tracing objects
                    if (item.tracing) {

                        item.tracing.tracingOptions.loadFromPreset("BOX");
                        item.tracing.tracingOptions.ignoreWhite = true;

                    } else {

                        // Create trace if needed
                        var traced = item.trace();

                        traced.tracing.tracingOptions.loadFromPreset("BOX");
                        traced.tracing.tracingOptions.ignoreWhite = true;
                    }

                } catch (e) {

                    $.writeln("Trace step failed in " + doc.name + ": " + e);
                }
            }
        }

        // -------------------------------------------------
        // 3. Run BOX PART 2
        // -------------------------------------------------
        app.doScript("BOX PART 2", "PRELIMINARY");

        // -------------------------------------------------
        // 4. Move ALL selected artwork to "Layer 2"
        // -------------------------------------------------

        var targetLayer = null;

        // Find Layer 2
        for (var l = 0; l < doc.layers.length; l++) {

            if (doc.layers[l].name === "Layer 2") {
                targetLayer = doc.layers[l];
                break;
            }
        }

        if (targetLayer && doc.selection.length > 0) {

            // Copy selection before moving
            var itemsToMove = [];

            for (var m = 0; m < doc.selection.length; m++) {
                itemsToMove.push(doc.selection[m]);
            }

            // Move all selected art
            for (var n = 0; n < itemsToMove.length; n++) {

                itemsToMove[n].move(
                    targetLayer,
                    ElementPlacement.PLACEATBEGINNING
                );
            }

        } else {

            $.writeln(
                "Layer 2 not found or nothing selected in: " + doc.name
            );
        }

    var layer = app.activeDocument.layers.getByName("Layer 1");

if (layer.groupItems.length > 0) {

    var group = layer.groupItems[0];

    while (group.pageItems.length > 0) {
        group.pageItems[0].move(layer, ElementPlacement.PLACEATEND);
    }

    group.remove();
}

    } catch (e) {

        alert("Error in document " + doc.name + ":\n" + e);
    }
}