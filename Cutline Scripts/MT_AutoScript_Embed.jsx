#target illustrator

var processed = 0;
var failed = 0;


//--------------------------------------------------
// Process each document
//--------------------------------------------------
for (var d = 0; d < app.documents.length; d++) {

    try {

        var doc = app.documents[d];
        app.activeDocument = doc;


        //--------------------------------------------------
        // Get/Create Layer 1
        //--------------------------------------------------
        var layer1;

        try {
            layer1 = doc.layers.getByName("Layer 1");
        } catch (e) {
            layer1 = doc.layers.add();
            layer1.name = "Layer 1";
        }


        //--------------------------------------------------
        // Move all other layers into Layer 1
        //--------------------------------------------------
        for (var i = doc.layers.length - 1; i >= 0; i--) {

            var lyr = doc.layers[i];

            if (lyr != layer1) {

                while (lyr.pageItems.length > 0) {
                    lyr.pageItems[0].move(layer1, ElementPlacement.PLACEATBEGINNING);
                }

                lyr.remove();
            }
        }


        //--------------------------------------------------
        // Embed all linked files
        //--------------------------------------------------
        while (doc.placedItems.length > 0) {

            var placed = doc.placedItems[0];

            doc.selection = null;
            placed.selected = true;
            placed.embed();
        }


        //--------------------------------------------------
        // Remove all group nesting
        //--------------------------------------------------
        function ungroupAll(container) {

            for (var i = container.groupItems.length - 1; i >= 0; i--) {

                var grp = container.groupItems[i];

                ungroupAll(grp);

                while (grp.pageItems.length > 0) {
                    grp.pageItems[0].move(layer1, ElementPlacement.PLACEATBEGINNING);
                }

                if (grp.pageItems.length === 0) {
                    grp.remove();
                }
            }
        }


        ungroupAll(layer1);


        //--------------------------------------------------
        // Force remaining artwork directly into Layer 1
        //--------------------------------------------------
        for (var j = layer1.pageItems.length - 1; j >= 0; j--) {

            var item = layer1.pageItems[j];

            if (item.parent.typename != "Layer") {
                item.move(layer1, ElementPlacement.PLACEATBEGINNING);
            }
        }


        //--------------------------------------------------
        // Select artwork
        //--------------------------------------------------
        doc.selection = null;

        if (layer1.pageItems.length > 0) {
            layer1.pageItems[0].selected = true;
        }


        processed++;


        // Optional delay between files
        $.sleep(1000);


    } catch (err) {

        failed++;

    }
}
