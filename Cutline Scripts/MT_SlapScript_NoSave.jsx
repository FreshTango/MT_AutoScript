// Iterate through all open Illustrator files
for (var d = 0; d < app.documents.length; d++) {

    var doc = app.documents[d];
    app.activeDocument = doc;

    // Find first placed/raster image
    function findImage(items) {

        for (var i = 0; i < items.length; i++) {

            var item = items[i];

            if (
                item.typename === "PlacedItem" ||
                item.typename === "RasterItem"
            ) {
                return item;
            }

            if (item.typename === "GroupItem") {

                var found = findImage(item.pageItems);

                if (found)
                    return found;

            }

        }

        return null;

    }

    var img = findImage(doc.activeLayer.pageItems);

    if (img) {

        var b = img.visibleBounds;

        var left   = b[0];
        var top    = b[1];
        var width  = b[2] - b[0];
        var height = b[1] - b[3];

        // -------------------------------------------------
        // CUTLINE RECTANGLE
        // -------------------------------------------------

        var rect = doc.activeLayer.pathItems.rectangle(
            top,
            left,
            width,
            height
        );

        rect.name = "CUTLINE";

        rect.filled = false;
        rect.stroked = true;

        var strokeColor = new RGBColor();
        strokeColor.red = 237;
        strokeColor.green = 40;
        strokeColor.blue = 39;

        rect.strokeColor = strokeColor;

        // Run actions
        app.doScript("SLAP OFFSET", "PRELIMINARY");
        app.doScript("SLAP OFFSET", "PRELIMINARY");

        // Delete original CUTLINE
        var items = doc.activeLayer.pageItems;

        for (var i = items.length - 1; i >= 0; i--) {

            if (items[i].name === "CUTLINE") {

                items[i].remove();
                break;

            }

        }
        // -------------------------------------------------
        // BLACK BLEED RECTANGLE
        // (+0.05in total size)
        // -------------------------------------------------

        var bleed = 4; // 0.05in = 3.6pt

        var bleedRect = doc.activeLayer.pathItems.rectangle(
            top + bleed / 2,
            left - bleed / 2,
            width + bleed,
            height + bleed
        );

        bleedRect.stroked = false;
        bleedRect.filled = true;

        var black = new RGBColor();
        black.red = 0;
        black.green = 0;
        black.blue = 0;

        bleedRect.fillColor = black;

        // Put black rectangle underneath image
        bleedRect.zOrder(ZOrderMethod.SENDTOBACK);

        // Move resulting path to top CUTLINE layer
        var items = doc.activeLayer.pageItems;

        for (var i = 0; i < items.length; i++) {

            if (
                items[i].typename === "PathItem" &&
                items[i] !== bleedRect
            ) {

                var l = doc.layers.add();

                l.name = "CUTLINE";
                l.zOrder(ZOrderMethod.BRINGTOFRONT);

                items[i].move(l, ElementPlacement.PLACEATBEGINNING);

                break;

            }

        }

    }

}