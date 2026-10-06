#target illustrator

var processed = 0;
var failed = 0;


// ======================================================
// HELPER — FIND PAGE ITEM NAMED "Spot1"
// Searches the ENTIRE document
// ======================================================

function findSpot1(doc) {

    for (var i = 0; i < doc.pageItems.length; i++) {

        try {

            if (doc.pageItems[i].name == "Spot1") {
                return doc.pageItems[i];
            }

        } catch (e) {}
    }

    return null;
}


// ======================================================
// PROCESS EACH DOCUMENT
// ======================================================

for (var d = 0; d < app.documents.length; d++) {

    try {

        var doc = app.documents[d];
        app.activeDocument = doc;


        // ==================================================
        // STEP 1 — GET / CREATE LAYER 1
        // ==================================================

        var layer1;

        try {

            layer1 = doc.layers.getByName("Layer 1");

        } catch (e) {

            layer1 = doc.layers.add();
            layer1.name = "Layer 1";
        }

        layer1.locked = false;
        layer1.visible = true;


        // ==================================================
        // STEP 2 — MOVE OTHER LAYERS INTO LAYER 1
        // ==================================================

        for (var i = doc.layers.length - 1; i >= 0; i--) {

            var lyr = doc.layers[i];

            if (lyr == layer1) {
                continue;
            }

            try {
                lyr.locked = false;
                lyr.visible = true;
            } catch (e) {}


            while (lyr.pageItems.length > 0) {

                var moveItem = lyr.pageItems[0];

                try {
                    moveItem.locked = false;
                } catch (e) {}

                moveItem.move(
                    layer1,
                    ElementPlacement.PLACEATEND
                );
            }


            try {
                lyr.remove();
            } catch (e) {}
        }


        // ==================================================
        // STEP 3 — EMBED ALL LINKED FILES
        // ==================================================

        while (doc.placedItems.length > 0) {

            var placed = doc.placedItems[0];

            doc.selection = null;

            try {
                placed.locked = false;
            } catch (e) {}

            placed.selected = true;

            placed.embed();

            $.sleep(250);
        }


        // Illustrator refresh
        app.redraw();

        $.sleep(250);


        // ==================================================
        // STEP 4 — FIND Spot1 IMMEDIATELY AFTER EMBEDDING
        // ==================================================

        var spot1Item = findSpot1(doc);


        // ==================================================
        // STEP 5 — MOVE Spot1 DIRECTLY INTO LAYER 1
        // AND PUT IT ABOVE EVERYTHING
        // ==================================================

        if (spot1Item != null) {

            try {

                spot1Item.locked = false;
                spot1Item.hidden = false;


                // ------------------------------------------
                // IMPORTANT:
                //
                // PLACEATBEGINNING puts Spot1 at the TOP
                // of Layer 1's object stack.
                // ------------------------------------------

                spot1Item.move(
                    layer1,
                    ElementPlacement.PLACEATBEGINNING
                );


                // Lock Spot1
                spot1Item.locked = true;


                $.writeln(
                    "Spot1 found after embed, moved to top, locked."
                );

            } catch (spotErr) {

                $.writeln(
                    "Could not move Spot1: " +
                    spotErr
                );
            }

        } else {

            $.writeln(
                "WARNING: Spot1 not found after embedding in " +
                doc.name
            );
        }


        // ==================================================
        // STEP 6 — UNGROUP EVERYTHING EXCEPT Spot1
        // ==================================================

        function ungroupAll(container) {

            for (
                var g = container.groupItems.length - 1;
                g >= 0;
                g--
            ) {

                var grp = container.groupItems[g];


                // ------------------------------------------
                // NEVER TOUCH Spot1
                // ------------------------------------------

                try {

                    if (grp.name == "Spot1") {
                        continue;
                    }

                } catch (e) {}


                // ------------------------------------------
                // If Spot1 is inside this group,
                // pull Spot1 out FIRST.
                // ------------------------------------------

                var protectedSpot = null;

                for (
                    var x = 0;
                    x < grp.pageItems.length;
                    x++
                ) {

                    try {

                        if (grp.pageItems[x].name == "Spot1") {

                            protectedSpot =
                                grp.pageItems[x];

                            break;
                        }

                    } catch (e) {}
                }


                if (protectedSpot != null) {

                    try {

                        protectedSpot.locked = false;

                        protectedSpot.move(
                            layer1,
                            ElementPlacement.PLACEATBEGINNING
                        );

                        protectedSpot.locked = true;

                        spot1Item = protectedSpot;

                    } catch (e) {}
                }


                // ------------------------------------------
                // Process nested groups
                // ------------------------------------------

                ungroupAll(grp);


                // ------------------------------------------
                // Move remaining contents to Layer 1
                // ------------------------------------------

                while (grp.pageItems.length > 0) {

                    var child = grp.pageItems[0];


                    // NEVER move Spot1 through this loop
                    try {

                        if (child.name == "Spot1") {

                            child.locked = false;

                            child.move(
                                layer1,
                                ElementPlacement.PLACEATBEGINNING
                            );

                            child.locked = true;

                            spot1Item = child;

                            continue;
                        }

                    } catch (e) {}


                    try {
                        child.locked = false;
                    } catch (e) {}


                    child.move(
                        layer1,
                        ElementPlacement.PLACEATEND
                    );
                }


                // ------------------------------------------
                // Remove empty group
                // ------------------------------------------

                try {

                    if (grp.pageItems.length === 0) {
                        grp.remove();
                    }

                } catch (e) {}
            }
        }


        ungroupAll(layer1);


        // ==================================================
        // STEP 7 — FIND Spot1 AGAIN
        // ==================================================

        spot1Item = findSpot1(doc);


        // ==================================================
        // STEP 8 — FINAL FORCED POSITION
        //
        // THIS IS THE IMPORTANT PART.
        // ==================================================

        if (spot1Item != null) {

            try {

                // Unlock temporarily
                spot1Item.locked = false;

                spot1Item.hidden = false;


                // ------------------------------------------
                // FORCE Spot1 DIRECTLY INTO Layer 1
                // AT THE VERY TOP
                // ------------------------------------------

                spot1Item.move(
                    layer1,
                    ElementPlacement.PLACEATBEGINNING
                );


                // ------------------------------------------
                // LOCK Spot1
                // ------------------------------------------

                spot1Item.locked = true;


                $.writeln(
                    "FINAL: Spot1 is top-level, top-most, and locked."
                );

            } catch (finalErr) {

                $.writeln(
                    "FINAL Spot1 operation failed: " +
                    finalErr
                );
            }

        } else {

            $.writeln(
                "FINAL WARNING: Spot1 could not be found."
            );
        }


        // ==================================================
        // STEP 9 — MAKE LAYER 1 ACTIVE
        // ==================================================

        try {

            doc.activeLayer = layer1;

        } catch (e) {}


        // ==================================================
        // STEP 10 — SELECT ARTWORK BELOW Spot1
        // ==================================================

        doc.selection = null;


        for (
            var p = 0;
            p < layer1.pageItems.length;
            p++
        ) {

            var artwork = layer1.pageItems[p];

            try {

                if (artwork.name != "Spot1") {

                    if (!artwork.locked) {

                        artwork.selected = true;

                        break;
                    }
                }

            } catch (e) {}
        }


        // ==================================================
        // FINAL REDRAW
        // ==================================================

        app.redraw();

        processed++;

        $.sleep(1000);


    } catch (err) {

        failed++;

        $.writeln(
            "FAILED: " +
            doc.name +
            " — " +
            err
        );
    }
}