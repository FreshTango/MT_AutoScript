// ======================================================
// Optimized for slower computers
// ======================================================

var ACTION_DELAY = 600;
var TRACE_DELAY = 500;
var MOVE_DELAY = 250;

function pause(ms) {
    app.redraw();
    $.sleep(ms);
}

// -------------------------------------------------
// Process ALL open Illustrator documents
// -------------------------------------------------

if (app.documents.length === 0) {

    alert("No open documents.");

} else {

    for (var d = 0; d < app.documents.length; d++) {

        var doc = app.documents[d];
        app.activeDocument = doc;

        try {

            //-------------------------------------------------
            // 1. DRAW BOX
            //-------------------------------------------------

            app.doScript("DRAW BOX", "PRELIMINARY");
            pause(ACTION_DELAY);

            //-------------------------------------------------
            // 2. IMAGE TRACE
            //-------------------------------------------------

            app.doScript("IMAGE TRACE", "PRELIMINARY");
            pause(ACTION_DELAY);

            //-------------------------------------------------
            // 3. Apply BOX preset
            //-------------------------------------------------

            if (doc.selection.length > 0) {

                var selectedItems = [];

                for (var s = 0; s < doc.selection.length; s++) {
                    selectedItems.push(doc.selection[s]);
                }

                for (var i = 0; i < selectedItems.length; i++) {

                    var item = selectedItems[i];

                    try {

                        var tracedItem = item;

                        if (!item.tracing) {

                            tracedItem = item.trace();
                            pause(TRACE_DELAY);

                        }

                        var success = false;

                        for (var attempt = 0; attempt < 10; attempt++) {

                            try {

                                tracedItem.tracing.tracingOptions.loadFromPreset("BOX");
                                tracedItem.tracing.tracingOptions.ignoreWhite = true;

                                success = true;
                                break;

                            } catch (err) {

                                pause(300);

                            }

                        }

                        if (!success) {

                            $.writeln("Couldn't apply BOX preset in " + doc.name);

                        }

                    } catch (e) {

                        $.writeln("Trace failed in " + doc.name + ": " + e);

                    }

                }

            }

            pause(300);

            //-------------------------------------------------
            // 4. BOX PART 2
            //-------------------------------------------------

            app.doScript("BOX PART 2", "PRELIMINARY");
            pause(ACTION_DELAY);

            //-------------------------------------------------
            // 5. Move selected artwork to Layer 2
            //-------------------------------------------------

            var targetLayer = null;

            for (var l = 0; l < doc.layers.length; l++) {

                if (doc.layers[l].name === "Layer 2") {

                    targetLayer = doc.layers[l];
                    break;

                }

            }

            if (targetLayer && doc.selection.length > 0) {

                var itemsToMove = [];

                for (var m = 0; m < doc.selection.length; m++) {

                    itemsToMove.push(doc.selection[m]);

                }

                for (var n = 0; n < itemsToMove.length; n++) {

                    try {

                        itemsToMove[n].move(
                            targetLayer,
                            ElementPlacement.PLACEATBEGINNING
                        );

                        pause(MOVE_DELAY);

                    } catch (e) {

                        $.writeln(e);

                    }

                }

            } else {

                $.writeln("Layer 2 not found or nothing selected in " + doc.name);

            }

            pause(400);

            //-------------------------------------------------
            // 6. Ungroup first group in Layer 1
            //-------------------------------------------------

            var layer = doc.layers.getByName("Layer 1");

            if (layer.groupItems.length > 0) {

                var group = layer.groupItems[0];

                while (group.pageItems.length > 0) {

                    group.pageItems[0].move(
                        layer,
                        ElementPlacement.PLACEATEND
                    );

                    pause(100);

                }

                pause(200);

                group.remove();

            }

            pause(500);

        } catch (e) {

            alert(
                "Error in document:\n\n" +
                doc.name +
                "\n\n" +
                e
            );

        }

    }

}