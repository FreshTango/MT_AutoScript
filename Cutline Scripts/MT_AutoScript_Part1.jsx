// ======================================================
// Adobe Illustrator ExtendScript
//
// PROCESS:
// 1. Embed linked image(s)
// 2. Run action: RGB TONAL CORRECTION TRACE
// 3. Target bottom layer artwork
// 3.5 Target group "<Group>"
// 4. Run action: IMAGE TRACE
// 5. Apply Image Trace preset: LINEART (125)
// 6. Expand tracing
// 7. Run action: AFTER IMAGE TRACING
// 8. Run action: CUTLINE MASTERED
// ======================================================

var actionSet = "PRELIMINARY";

var tonalAction = "RGB TONAL CORRECTION TRACE";
var imageTraceAction = "IMAGE TRACE";
var afterTraceAction = "AFTER IMAGE TRACING";
var cutlineAction = "CUTLINE MASTERED";
var bleedAction = "BLEED";

if (app.documents.length === 0) {

    alert("No open documents.");

} else {

    for (var d = 0; d < app.documents.length; d++) {

        var doc = app.documents[d];
        app.activeDocument = doc;

        try {

            // ======================================
            // STEP 1 — EMBED ALL LINKED FILES
            // ======================================

            for (var i = doc.placedItems.length - 1; i >= 0; i--) {

                var placed = doc.placedItems[i];

                if (!placed.embedded) {
                    placed.embed();
                }
            }

            // ======================================
            // STEP 2 — RUN TONAL CORRECTION
            // ======================================

            app.doScript(tonalAction, actionSet);

            // ======================================
            // STEP 3 — TARGET BOTTOM ITEM IN LAYER 1
            // ======================================

            doc.selection = null;

            var layer1 = doc.layers.getByName("Layer 1");
            var targetItem = layer1.pageItems[layer1.pageItems.length - 1];

            if (targetItem) {
                targetItem.selected = true;
            } else {
                alert("Could not find target item in " + doc.name);
            }

            // ======================================
            // STEP 4 — RUN IMAGE TRACE ACTION
            // ======================================

            app.doScript(imageTraceAction, actionSet);

            // ======================================
            // STEP 5 — APPLY PRESET + EXPAND
            // ======================================

            if (doc.selection.length > 0) {

                for (var s = 0; s < doc.selection.length; s++) {

                    try {
                        $.sleep(200)
                        var item = doc.selection[s];

                        item.tracing.tracingOptions.loadFromPreset("LINEART (175)");
                        item.tracing.tracingOptions.ignoreWhite = true;

                        item.tracing.expandTracing();

                    } catch (e) {
                        $.writeln("Trace step failed: " + e);
                    }
                }
            }

            var layer = doc.layers.getByName("Layer 1");

            // Clear selection
            app.activeDocument.selection = null;

            // Get the first group item (<Group>)
            var targetGroup = layer.groupItems[0];

            // Select it
            targetGroup.selected = true;

            // ======================================
            // STEP 6 — RUN AFTER IMAGE TRACING
            // ======================================
            app.doScript(afterTraceAction, actionSet);
            $.sleep(250)
            app.doScript(cutlineAction, actionSet);

            $.sleep(500)
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