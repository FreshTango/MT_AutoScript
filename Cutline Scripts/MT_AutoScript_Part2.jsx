#target illustrator

// ======================================================
// PROCESS ALL OPEN ILLUSTRATOR DOCUMENTS
//
// Spot1 PROTECTION:
// - Spot1 is never selected
// - Spot1 is never changed to black
// - Spot1 is never sent to back
// - Spot1 is never deleted
// - Spot1 is skipped by findImage()
// - Spot1 stays locked
// ======================================================


// ======================================================
// HELPER — CHECK IF ITEM IS Spot1
// ======================================================

function isSpot1(item) {

    try {

        return item.name === "Spot1";

    } catch (e) {

        return false;

    }
}


// ======================================================
// HELPER — FIND Spot1 ANYWHERE IN DOCUMENT
// ======================================================

function findSpot1(doc) {

    for (var i = 0; i < doc.pageItems.length; i++) {

        try {

            if (doc.pageItems[i].name === "Spot1") {
                return doc.pageItems[i];
            }

        } catch (e) {}
    }

    return null;
}


// ======================================================
// ITERATE THROUGH ALL OPEN DOCUMENTS
// ======================================================

for (var d = 0; d < app.documents.length; d++) {

    var doc = app.documents[d];

    app.activeDocument = doc;


    // ==================================================
    // GET Layer 1
    // ==================================================

    var layer = null;

    try {

        layer = doc.layers.getByName("Layer 1");

    } catch (e) {

        alert(
            'Could not find "Layer 1" in document: ' +
            doc.name
        );

        continue;
    }


    // ==================================================
    // FIND Spot1 AND MAKE SURE IT IS LOCKED
    // ==================================================

    var spot1Item = findSpot1(doc);

    if (spot1Item != null) {

        try {

            spot1Item.selected = false;

        } catch (e) {}


        try {

            spot1Item.locked = true;

        } catch (e) {}
    }


    // -------------------------------------------------
    // 1. BLEED SELECTION / PROCESSING
    // -------------------------------------------------

    try {

        // SELECT ONLY THE BOTTOM <Compound Path>

        // Clear selection
        doc.selection = null;


        // Get all page items in visible stacking order
        var items = layer.pageItems;


        // Select the bottom-most item,
        // then every 3rd item above it

        var foundBottom = false;
        var layerCount = 0;
        var startIndex = -1;


        // ==================================================
        // FIND BOTTOM-MOST VALID ITEM
        //
        // Spot1 is explicitly excluded.
        // ==================================================

        for (
            var i = items.length - 1;
            i >= 0;
            i--
        ) {

            if (
                !isSpot1(items[i]) &&
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


        // ==================================================
        // SELECT BOTTOM ITEM + EVERY 3RD ITEM ABOVE IT
        //
        // Spot1 can NEVER be selected here.
        // ==================================================

        if (foundBottom) {

            for (
                var j = startIndex;
                j >= 0;
                j -= 3
            ) {

                if (
                    !isSpot1(items[j]) &&
                    !items[j].locked &&
                    !items[j].hidden
                ) {

                    items[j].selected = true;

                    layerCount++;
                }
            }
        }


        layerCount++;


        // ==================================================
        // CHANGE SELECTED CUTLINES TO BLACK
        // AND SEND THEM TO BOTTOM
        // ==================================================

        var black = new RGBColor();

        black.red = 0;
        black.green = 0;
        black.blue = 0;


        for (
            var k = startIndex;
            k >= 0;
            k -= 3
        ) {

            // ==================================================
            // Spot1 PROTECTION
            // ==================================================

            if (
                !isSpot1(items[k]) &&
                !items[k].locked &&
                !items[k].hidden
            ) {

                try {

                    var cutline = items[k];


                    // -----------------------------------------
                    // CHANGE FILL TO BLACK
                    // -----------------------------------------

                    if (
                        cutline.typename ===
                        "CompoundPathItem"
                    ) {

                        // Compound Path contains PathItems

                        for (
                            var p = 0;
                            p < cutline.pathItems.length;
                            p++
                        ) {

                            cutline.pathItems[p].filled = true;

                            cutline.pathItems[p].fillColor =
                                black;

                            cutline.pathItems[p].stroked =
                                false;
                        }

                    } else if (
                        cutline.typename === "PathItem"
                    ) {

                        cutline.stroked = false;

                        cutline.filled = true;

                        cutline.fillColor = black;
                    }


                    // -----------------------------------------
                    // SEND CUTLINE TO VERY BOTTOM
                    // -----------------------------------------

                    cutline.zOrder(
                        ZOrderMethod.SENDTOBACK
                    );


                } catch (e) {

                    // Ignore unsupported items

                }
            }
        }


    } catch (e) {

        alert(
            "Could not run BLEED processing in document: " +
            doc.name +
            "\n" +
            e
        );

        continue;
    }


    // ==================================================
    // RE-LOCK Spot1 AFTER BLEED PROCESSING
    // ==================================================

    spot1Item = findSpot1(doc);

    if (spot1Item != null) {

        try {
            spot1Item.selected = false;
        } catch (e) {}

        try {
            spot1Item.locked = true;
        } catch (e) {}
    }


    // -------------------------------------------------
    // 2. FIND AND SELECT TARGET ITEM
    // -------------------------------------------------

    var layer1 = doc.activeLayer;

    var targetIndex =
        layer1.pageItems.length - layerCount;


    if (
        targetIndex >= 0 &&
        targetIndex < layer1.pageItems.length
    ) {

        var targetItem =
            layer1.pageItems[targetIndex];


        // ==================================================
        // NEVER SELECT Spot1
        // ==================================================

        if (
            !isSpot1(targetItem) &&
            !targetItem.locked &&
            !targetItem.hidden
        ) {

            targetItem.selected = true;
        }
    }


    // ==================================================
    // 3. GROUP CURRENT SELECTION
    // ==================================================

    try {

        // Spot1 is locked and unselected,
        // so it cannot enter this group.

        app.executeMenuCommand("group");

    } catch (e) {

        // Ignore if grouping isn't possible

    }


    doc.selection = null;


    // ==================================================
    // RE-LOCK Spot1 AFTER GROUPING
    // ==================================================

    spot1Item = findSpot1(doc);

    if (spot1Item != null) {

        try {
            spot1Item.selected = false;
        } catch (e) {}

        try {
            spot1Item.locked = true;
        } catch (e) {}
    }


    // ==================================================
    // 4. REMOVE EVERY OTHER ITEM
    //
    // IMPORTANT:
    // Spot1 is NEVER removed.
    // ==================================================

    var items =
        app.activeDocument.activeLayer.pageItems;


    for (
        var i = items.length - 3;
        i >= 0;
        i -= 2
    ) {

        try {

            if (
                !isSpot1(items[i]) &&
                !items[i].locked &&
                !items[i].hidden
            ) {

                items[i].remove();
            }

        } catch (e) {}
    }


    // ==================================================
    // RE-LOCK Spot1 AFTER CLEANUP
    // ==================================================

    spot1Item = findSpot1(doc);

    if (spot1Item != null) {

        try {
            spot1Item.selected = false;
        } catch (e) {}

        try {
            spot1Item.locked = true;
        } catch (e) {}
    }


    // -------------------------------------------------
    // 5. SELECT THE <Image> ITEM INSIDE THE GROUP
    // -------------------------------------------------

    var items =
        app.activeDocument.activeLayer.pageItems;


    function findImage(items) {

        for (
            var i = 0;
            i < items.length;
            i++
        ) {

            var item = items[i];


            // ==================================================
            // NEVER ENTER OR SELECT Spot1
            // ==================================================

            if (isSpot1(item)) {
                continue;
            }


            // ==================================================
            // SKIP LOCKED / HIDDEN ITEMS
            // ==================================================

            try {

                if (
                    item.locked ||
                    item.hidden
                ) {
                    continue;
                }

            } catch (e) {}


            // ==================================================
            // IMAGE FOUND
            // ==================================================

            if (
                item.typename === "RasterItem" ||
                item.typename === "PlacedItem"
            ) {

                try {

                    item.selected = true;

                    return true;

                } catch (e) {

                    continue;
                }
            }


            // ==================================================
            // SEARCH INSIDE GROUPS
            // ==================================================

            if (
                item.typename === "GroupItem"
            ) {

                if (
                    findImage(item.pageItems)
                ) {
                    return true;
                }
            }
        }


        return false;
    }


    findImage(items);


    // ==================================================
    // FINAL Spot1 PROTECTION
    // ==================================================

    spot1Item = findSpot1(doc);

    if (spot1Item != null) {

        try {

            spot1Item.selected = false;

        } catch (e) {}


        try {

            spot1Item.locked = true;

        } catch (e) {}
    }
}