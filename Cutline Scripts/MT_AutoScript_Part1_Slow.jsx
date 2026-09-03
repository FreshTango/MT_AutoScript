// ======================================================
// Adobe Illustrator ExtendScript
// Optimized for slower computers
// ======================================================

var actionSet = "PRELIMINARY";

var tonalAction      = "RGB TONAL CORRECTION TRACE";
var imageTraceAction = "IMAGE TRACE";
var afterTraceAction = "AFTER IMAGE TRACING";
var cutlineAction    = "CUTLINE MASTERED";

//------------------------------------------------------
// Timing (adjust if needed)
//------------------------------------------------------

var EMBED_DELAY    = 250;
var ACTION_DELAY   = 500;
var RETRY_DELAY    = 250;
var MAX_RETRIES    = 40;

//------------------------------------------------------

function pause(ms) {
    app.redraw();
    $.sleep(ms);
}

// Wait until tracing exists
function waitForTracing(item) {

    for (var i = 0; i < MAX_RETRIES; i++) {

        try {

            if (item.tracing) {
                return true;
            }

        } catch (e) {}

        pause(RETRY_DELAY);
    }

    return false;
}

//------------------------------------------------------
// Main
//------------------------------------------------------

if (app.documents.length === 0) {

    alert("No open documents.");

} else {

    for (var d = 0; d < app.documents.length; d++) {

        var doc = app.documents[d];
        app.activeDocument = doc;

        try {

            //--------------------------------------------------
            // STEP 1 - Embed linked artwork
            //--------------------------------------------------

            for (var i = doc.placedItems.length - 1; i >= 0; i--) {

                try {

                    if (!doc.placedItems[i].embedded) {

                        doc.placedItems[i].embed();
                        pause(EMBED_DELAY);

                    }

                } catch (e) {}
            }

            pause(500);

            //--------------------------------------------------
            // STEP 2 - Tonal Correction
            //--------------------------------------------------

            app.doScript(tonalAction, actionSet);

            pause(ACTION_DELAY);

            //--------------------------------------------------
            // STEP 3 - Select bottom artwork
            //--------------------------------------------------

            doc.selection = null;

            var layer = doc.layers.getByName("Layer 1");

            if (layer.pageItems.length === 0)
                throw new Error("Layer 1 contains no artwork.");

            var targetItem = layer.pageItems[layer.pageItems.length - 1];

            targetItem.selected = true;

            pause(300);

            //--------------------------------------------------
            // STEP 4 - Image Trace
            //--------------------------------------------------

            app.doScript(imageTraceAction, actionSet);

            pause(300);

            //--------------------------------------------------
            // STEP 5 - Wait for trace and apply preset
            //--------------------------------------------------

            if (doc.selection.length > 0) {

                var selectionCopy = [];

                for (var s = 0; s < doc.selection.length; s++) {
                    selectionCopy.push(doc.selection[s]);
                }

                for (var s = 0; s < selectionCopy.length; s++) {

                    var item = selectionCopy[s];

                    if (!waitForTracing(item)) {

                        $.writeln("Tracing never became ready in " + doc.name);
                        continue;

                    }

                    try {

                        item.tracing.tracingOptions.loadFromPreset("LINEART (175)");
                        item.tracing.tracingOptions.ignoreWhite = true;

                        pause(250);

                        item.tracing.expandTracing();

                        pause(500);

                    }

                    catch (e) {

                        $.writeln("Expand failed: " + e);

                    }

                }

            }

            //--------------------------------------------------
            // STEP 6 - Select first group
            //--------------------------------------------------

            doc.selection = null;

            pause(300);

            if (layer.groupItems.length === 0)
                throw new Error("No groups found in Layer 1.");

            layer.groupItems[0].selected = true;

            pause(300);

            //--------------------------------------------------
            // STEP 7 - AFTER IMAGE TRACING
            //--------------------------------------------------

            app.doScript(afterTraceAction, actionSet);

            pause(ACTION_DELAY);

            //--------------------------------------------------
            // STEP 8 - CUTLINE MASTERED
            //--------------------------------------------------

            app.doScript(cutlineAction, actionSet);

            pause(700);

        }

        catch (e) {

            alert(
                "Error processing:\n\n" +
                doc.name +
                "\n\n" +
                e
            );

        }

    }

}