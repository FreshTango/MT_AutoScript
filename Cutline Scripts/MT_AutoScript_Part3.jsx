#target illustrator

// ============================================================
// MT AUTO SCRIPT - BOX
// ============================================================
//
// MULTI-DOCUMENT VERSION
//
// FOR EACH OPEN DOCUMENT:
//
// 1. Save/restore that document's starting selection
// 2. Protect Spot1
// 3. Copy + Paste in Front
// 4. Image Trace using preset "BOX"
// 5. Ignore White
// 6. Expand
// 7. Convert trace to red 0.25 pt stroke
// 8. Create/find Layer 2
// 9. Move BOX trace to Layer 2
// 10. Ungroup first group in Layer 1
// 11. Find target Path/Compound Path below Spot1, or top path if Spot1 is absent
// 12. Find ALL direct Layer 1 Path / Compound Path objects
//     with the same appearance as that seed
//     (equivalent to Select Similar Objects -> All)
// 13. Move all matching objects to Layer 2
// 14. Unlock Spot1
//
// ============================================================



// ============================================================
// CAPTURE STARTING SELECTION FOR EVERY DOCUMENT
// ============================================================

var documentJobs = [];


for (
    var captureD = 0;
    captureD < app.documents.length;
    captureD++
) {

    var captureDoc =
        app.documents[captureD];


    app.activeDocument =
        captureDoc;


    var savedSelection = [];


    try {

        if (
            captureDoc.selection != null
        ) {

            for (
                var captureI = 0;
                captureI < captureDoc.selection.length;
                captureI++
            ) {

                savedSelection.push(
                    captureDoc.selection[captureI]
                );
            }
        }

    } catch (e) {}


    documentJobs.push({
        doc: captureDoc,
        selection: savedSelection
    });
}



// ============================================================
// PROCESS EACH DOCUMENT
// ============================================================

for (
    var d = 0;
    d < documentJobs.length;
    d++
) {

    var doc =
        documentJobs[d].doc;


    try {

        // ====================================================
        // ACTIVATE DOCUMENT
        // ====================================================

        app.activeDocument =
            doc;



        // ====================================================
        // RESTORE THIS DOCUMENT'S ORIGINAL SELECTION
        // ====================================================

        doc.selection =
            null;


        var startingSelection =
            documentJobs[d].selection;


        for (
            var restoreI = 0;
            restoreI < startingSelection.length;
            restoreI++
        ) {

            try {

                var restoreItem =
                    startingSelection[restoreI];


                if (
                    !isSpot1(restoreItem) &&
                    !restoreItem.locked &&
                    !restoreItem.hidden
                ) {

                    restoreItem.selected =
                        true;
                }

            } catch (e) {}
        }


        redraw();



        // ====================================================
        // FIND Spot1
        // ====================================================

        var spot1Item =
            findSpot1(doc);


        // ====================================================
        // PROTECT Spot1
        // ====================================================

        if (
            spot1Item !== null
        ) {

            try {
                spot1Item.selected = false;
            } catch (e) {}


            try {
                spot1Item.locked = true;
            } catch (e) {}
        }



        // ====================================================
        // VERIFY WE HAVE SOMETHING TO TRACE
        // ====================================================

        if (
            doc.selection == null ||
            doc.selection.length === 0
        ) {

            $.writeln(
                "Skipped " +
                doc.name +
                " - nothing selected."
            );


            unlockSpot1(doc);

            continue;
        }



        // ====================================================
        // COPY + PASTE IN FRONT
        // ====================================================

        app.copy();


        app.executeMenuCommand(
            "pasteFront"
        );


        redraw();



        // ====================================================
        // STORE PASTED ITEMS
        // ====================================================

        var pastedItems = [];


        for (
            var i = 0;
            i < doc.selection.length;
            i++
        ) {

            var pastedItem =
                doc.selection[i];


            if (
                !isSpot1(pastedItem)
            ) {

                pastedItems.push(
                    pastedItem
                );
            }
        }



        // ====================================================
        // IMAGE TRACE WITH BOX PRESET
        // ====================================================

        var tracedItems = [];


        for (
            var i = 0;
            i < pastedItems.length;
            i++
        ) {

            try {

                var item =
                    pastedItems[i];


                var traced;


                // --------------------------------------------
                // EXISTING TRACING OBJECT
                // --------------------------------------------

                if (
                    item.typename === "PluginItem" &&
                    item.tracing
                ) {

                    traced =
                        item;

                } else {

                    // ----------------------------------------
                    // START IMAGE TRACE
                    // ----------------------------------------

                    traced =
                        item.trace();
                }


                // --------------------------------------------
                // BOX PRESET
                // --------------------------------------------

                traced.tracing.tracingOptions.loadFromPreset(
                    "BOX"
                );


                // --------------------------------------------
                // IGNORE WHITE
                // --------------------------------------------

                traced.tracing.tracingOptions.ignoreWhite =
                    true;


                tracedItems.push(
                    traced
                );


            } catch (traceError) {

                $.writeln(
                    "Trace failed in " +
                    doc.name +
                    ": " +
                    traceError
                );
            }
        }


        redraw();



        // ====================================================
        // EXPAND IMAGE TRACE
        // ====================================================

        var expandedItems = [];


        for (
            var i = 0;
            i < tracedItems.length;
            i++
        ) {

            try {

                var traced =
                    tracedItems[i];


                var expanded =
                    traced.tracing.expandTracing();


                if (
                    expanded
                ) {

                    expandedItems.push(
                        expanded
                    );
                }


            } catch (expandError) {

                $.writeln(
                    "Expand failed in " +
                    doc.name +
                    ": " +
                    expandError
                );
            }
        }


        redraw();



        // ====================================================
        // BOX STROKE COLOR
        // ====================================================

        var boxColor =
            new CMYKColor();


        boxColor.cyan =
            0.08;

        boxColor.magenta =
            97.38;

        boxColor.yellow =
            96.93;

        boxColor.black =
            0.06;



        // ====================================================
        // FORMAT EXPANDED TRACE
        // ====================================================

        for (
            var i = 0;
            i < expandedItems.length;
            i++
        ) {

            formatArtwork(
                expandedItems[i],
                boxColor
            );
        }


        redraw();



        // ====================================================
        // FIND / CREATE Layer 2
        // ====================================================

        var targetLayer =
            getLayerByName(
                doc,
                "Layer 2"
            );


        if (
            targetLayer === null
        ) {

            targetLayer =
                doc.layers.add();


            targetLayer.name =
                "Layer 2";
        }


        targetLayer.locked =
            false;


        targetLayer.visible =
            true;



        // ====================================================
        // MOVE BOX TRACE TO Layer 2
        // ====================================================

        for (
            var i = 0;
            i < expandedItems.length;
            i++
        ) {

            try {

                expandedItems[i].move(
                    targetLayer,
                    ElementPlacement.PLACEATBEGINNING
                );


            } catch (moveError) {

                $.writeln(
                    "Move BOX artwork failed in " +
                    doc.name +
                    ": " +
                    moveError
                );
            }
        }


        redraw();



        // ====================================================
        // GET Layer 1
        // ====================================================

        var layer1 =
            getLayerByName(
                doc,
                "Layer 1"
            );


        if (
            layer1 === null
        ) {

            throw new Error(
                'Could not find "Layer 1".'
            );
        }



        // ====================================================
        // UNGROUP FIRST GROUP IN Layer 1
        // ====================================================

        if (
            layer1.groupItems.length > 0
        ) {

            try {

                var group =
                    layer1.groupItems[0];


                while (
                    group.pageItems.length > 0
                ) {

                    var groupItem =
                        group.pageItems[0];


                    // ----------------------------------------
                    // Spot1
                    // ----------------------------------------

                    if (
                        isSpot1(groupItem)
                    ) {

                        try {
                            groupItem.locked = false;
                        } catch (e) {}


                        groupItem.move(
                            layer1,
                            ElementPlacement.PLACEATBEGINNING
                        );


                        try {
                            groupItem.locked = true;
                        } catch (e) {}


                        spot1Item =
                            groupItem;

                    } else {

                        // ------------------------------------
                        // NORMAL UNGROUP
                        // ------------------------------------

                        groupItem.move(
                            layer1,
                            ElementPlacement.PLACEATEND
                        );
                    }
                }


                group.remove();


            } catch (ungroupError) {

                $.writeln(
                    "Ungroup failed in " +
                    doc.name +
                    ": " +
                    ungroupError
                );
            }
        }


        redraw();



        // ====================================================
        // FIND Spot1 AGAIN AFTER UNGROUP
        // ====================================================

        spot1Item =
            findSpot1(doc);



        // ====================================================
        // MAKE SURE Spot1 IS DIRECTLY IN Layer 1
        // ====================================================

        if (
            spot1Item !== null
        ) {

            try {
                spot1Item.locked = false;
            } catch (e) {}


            try {

                if (
                    spot1Item.parent !== layer1
                ) {

                    spot1Item.move(
                        layer1,
                        ElementPlacement.PLACEATBEGINNING
                    );
                }

            } catch (spotMoveError) {

                $.writeln(
                    "Could not position Spot1 in " +
                    doc.name +
                    ": " +
                    spotMoveError
                );
            }


            try {
                spot1Item.locked = true;
            } catch (e) {}
        }


        redraw();



        // ====================================================
        // FIND SEED PATH DIRECTLY BELOW Spot1
        //
        // Works with:
        //
        // Spot1
        // <Path>
        //
        // OR
        //
        // Spot1
        // <Compound Path>
        //
        // ====================================================

        var seedItem =
            null;


        // Always get Layer 1 items.
        // If Spot1 exists, use the first direct Path/Compound Path below it.
        // If Spot1 does NOT exist, use the first/top direct Path/Compound Path
        // in Layer 1 as the seed.
        var layer1Items =
            layer1.pageItems;


        if (
            spot1Item !== null
        ) {

            var spotIndex =
                -1;


            // =================================================
            // FIND Spot1 INDEX
            // =================================================

            for (
                var si = 0;
                si < layer1Items.length;
                si++
            ) {

                try {

                    if (
                        isSpot1(layer1Items[si]) &&
                        layer1Items[si].parent === layer1
                    ) {

                        spotIndex =
                            si;

                        break;
                    }

                } catch (e) {}
            }


            // =================================================
            // FIND FIRST PATH / COMPOUND PATH BELOW Spot1
            // =================================================

            if (
                spotIndex >= 0
            ) {

                for (
                    var ci = spotIndex + 1;
                    ci < layer1Items.length;
                    ci++
                ) {

                    var candidate =
                        layer1Items[ci];


                    try {

                        if (
                            candidate.parent === layer1 &&
                            isPathLike(candidate)
                        ) {

                            seedItem =
                                candidate;

                            break;
                        }

                    } catch (e) {}
                }
            }

        } else {

            // =================================================
            // NO Spot1 FALLBACK
            //
            // Expected structure:
            // Layer 1
            //     <Path / Compound Path>  <-- USE THIS
            //     <Image>
            //     <Path / Compound Path>
            //
            // Use the first/top DIRECT Path or Compound Path.
            // =================================================

            for (
                var ni = 0;
                ni < layer1Items.length;
                ni++
            ) {

                var noSpotCandidate =
                    layer1Items[ni];


                try {

                    if (
                        noSpotCandidate.parent === layer1 &&
                        isPathLike(noSpotCandidate)
                    ) {

                        seedItem =
                            noSpotCandidate;

                        break;
                    }

                } catch (e) {}
            }
        }


        // ====================================================
        // SELECT SIMILAR OBJECTS -> ALL
        //
        // Instead of relying on Illustrator's toolbar command,
        // reproduce the matching directly.
        // ====================================================

        var similarItems =
            [];


        if (
            seedItem !== null
        ) {

            // =================================================
            // SELECT THE SEED FIRST
            // =================================================

            doc.selection =
                null;


            try {
                seedItem.locked = false;
            } catch (e) {}


            try {
                seedItem.hidden = false;
            } catch (e) {}


            try {
                seedItem.selected = true;
            } catch (e) {}


            redraw();



            // =================================================
            // GET SEED APPEARANCE SIGNATURE
            // =================================================

            var seedSignature =
                getAppearanceSignature(
                    seedItem
                );



            // =================================================
            // FIND ALL SIMILAR DIRECT OBJECTS IN Layer 1
            // =================================================

            var searchItems =
                layer1.pageItems;


            for (
                var simI = 0;
                simI < searchItems.length;
                simI++
            ) {

                var simCandidate =
                    searchItems[simI];


                try {

                    // -----------------------------------------
                    // ONLY DIRECT Layer 1 OBJECTS
                    // -----------------------------------------

                    if (
                        simCandidate.parent !== layer1
                    ) {

                        continue;
                    }


                    // -----------------------------------------
                    // NEVER Spot1
                    // -----------------------------------------

                    if (
                        isSpot1(simCandidate)
                    ) {

                        continue;
                    }


                    // -----------------------------------------
                    // ONLY PATH / COMPOUND PATH
                    // -----------------------------------------

                    if (
                        !isPathLike(simCandidate)
                    ) {

                        continue;
                    }


                    // -----------------------------------------
                    // COMPARE FULL APPEARANCE
                    // -----------------------------------------

                    var candidateSignature =
                        getAppearanceSignature(
                            simCandidate
                        );


                    if (
                        signaturesMatch(
                            seedSignature,
                            candidateSignature
                        )
                    ) {

                        similarItems.push(
                            simCandidate
                        );


                        try {

                            simCandidate.selected =
                                true;

                        } catch (e) {}
                    }


                } catch (e) {}
            }


            redraw();
        }



        // ====================================================
        // FALLBACK
        //
        // Seed must always move even if Illustrator's
        // appearance information is unusual.
        // ====================================================

        if (
            seedItem !== null &&
            !arrayContainsItem(
                similarItems,
                seedItem
            )
        ) {

            similarItems.push(
                seedItem
            );
        }



        // ====================================================
        // MOVE ALL SIMILAR OBJECTS TO Layer 2
        // ====================================================

        for (
            var moveI = 0;
            moveI < similarItems.length;
            moveI++
        ) {

            try {

                var itemToMove =
                    similarItems[moveI];


                // --------------------------------------------
                // SAFETY
                // --------------------------------------------

                if (
                    isSpot1(itemToMove)
                ) {

                    continue;
                }


                try {
                    itemToMove.locked = false;
                } catch (e) {}


                try {
                    itemToMove.hidden = false;
                } catch (e) {}


                itemToMove.move(
                    targetLayer,
                    ElementPlacement.PLACEATBEGINNING
                );


            } catch (similarMoveError) {

                $.writeln(
                    "Could not move similar object in " +
                    doc.name +
                    ": " +
                    similarMoveError
                );
            }
        }


        redraw();



        // ====================================================
        // FINAL Spot1 STATE = UNLOCKED
        // ====================================================

        spot1Item =
            findSpot1(doc);


        if (
            spot1Item !== null
        ) {

            try {
                spot1Item.selected = false;
            } catch (e) {}


            try {
                spot1Item.locked = false;
            } catch (e) {}
        }


        redraw();



    } catch (e) {

        // ====================================================
        // SAFETY:
        // DON'T LEAVE Spot1 LOCKED
        // ====================================================

        unlockSpot1(doc);


        alert(
            "Error in document:\n" +
            doc.name +
            "\n\n" +
            e +
            "\n\nLine: " +
            e.line
        );
    }
}



// ============================================================
// FUNCTIONS
// ============================================================



// ------------------------------------------------------------
// IS Spot1?
// ------------------------------------------------------------

function isSpot1(item) {

    try {

        return (
            item.name === "Spot1"
        );

    } catch (e) {

        return false;
    }
}



// ------------------------------------------------------------
// FIND Spot1
// ------------------------------------------------------------

function findSpot1(doc) {

    try {

        for (
            var i = 0;
            i < doc.pageItems.length;
            i++
        ) {

            try {

                if (
                    doc.pageItems[i].name === "Spot1"
                ) {

                    return doc.pageItems[i];
                }

            } catch (e) {}
        }

    } catch (e) {}


    return null;
}



// ------------------------------------------------------------
// UNLOCK Spot1
// ------------------------------------------------------------

function unlockSpot1(doc) {

    var spot =
        findSpot1(doc);


    if (
        spot !== null
    ) {

        try {
            spot.selected = false;
        } catch (e) {}


        try {
            spot.locked = false;
        } catch (e) {}
    }
}



// ------------------------------------------------------------
// FIND LAYER
// ------------------------------------------------------------

function getLayerByName(
    doc,
    layerName
) {

    for (
        var i = 0;
        i < doc.layers.length;
        i++
    ) {

        if (
            doc.layers[i].name === layerName
        ) {

            return doc.layers[i];
        }
    }


    return null;
}



// ------------------------------------------------------------
// IS PATH OR COMPOUND PATH?
// ------------------------------------------------------------

function isPathLike(item) {

    try {

        return (
            item.typename === "PathItem" ||
            item.typename === "CompoundPathItem"
        );

    } catch (e) {

        return false;
    }
}



// ------------------------------------------------------------
// FORMAT EXPANDED IMAGE TRACE ARTWORK
// ------------------------------------------------------------

function formatArtwork(
    item,
    strokeColor
) {

    // ========================================================
    // GROUP
    // ========================================================

    if (
        item.typename === "GroupItem"
    ) {

        for (
            var i = item.pageItems.length - 1;
            i >= 0;
            i--
        ) {

            formatArtwork(
                item.pageItems[i],
                strokeColor
            );
        }


        return;
    }



    // ========================================================
    // COMPOUND PATH
    // ========================================================

    if (
        item.typename === "CompoundPathItem"
    ) {

        for (
            var i = item.pathItems.length - 1;
            i >= 0;
            i--
        ) {

            formatPath(
                item.pathItems[i],
                strokeColor
            );
        }


        return;
    }



    // ========================================================
    // PATH
    // ========================================================

    if (
        item.typename === "PathItem"
    ) {

        formatPath(
            item,
            strokeColor
        );


        return;
    }
}



// ------------------------------------------------------------
// FORMAT PATH
// ------------------------------------------------------------

function formatPath(
    path,
    strokeColor
) {

    try {

        path.filled =
            false;


        path.stroked =
            true;


        path.strokeColor =
            strokeColor;


        path.strokeWidth =
            0.25;


        path.strokeCap =
            StrokeCap.BUTTENDCAP;


        path.strokeJoin =
            StrokeJoin.MITERENDJOIN;


        path.strokeMiterLimit =
            10;


        path.strokeDashes =
            [];


    } catch (e) {

        $.writeln(
            "Could not format path: " +
            e
        );
    }
}



// ============================================================
// APPEARANCE MATCHING
// ============================================================



// ------------------------------------------------------------
// GET REPRESENTATIVE PATH
//
// For CompoundPathItem, use first PathItem.
// ------------------------------------------------------------

function getRepresentativePath(item) {

    try {

        if (
            item.typename === "PathItem"
        ) {

            return item;
        }


        if (
            item.typename === "CompoundPathItem" &&
            item.pathItems.length > 0
        ) {

            return item.pathItems[0];
        }

    } catch (e) {}


    return null;
}



// ------------------------------------------------------------
// CREATE APPEARANCE SIGNATURE
//
// Used as our equivalent of:
//
// Select Similar Objects -> All
// ------------------------------------------------------------

function getAppearanceSignature(item) {

    var sig = {
        valid: false,
        filled: false,
        fillColor: "",
        stroked: false,
        strokeColor: "",
        strokeWidth: 0,
        opacity: 100
    };


    try {

        var path =
            getRepresentativePath(item);


        if (
            path === null
        ) {

            return sig;
        }


        sig.valid =
            true;


        // --------------------------------------------
        // FILL
        // --------------------------------------------

        sig.filled =
            path.filled;


        if (
            path.filled
        ) {

            sig.fillColor =
                colorToString(
                    path.fillColor
                );
        }


        // --------------------------------------------
        // STROKE
        // --------------------------------------------

        sig.stroked =
            path.stroked;


        if (
            path.stroked
        ) {

            sig.strokeColor =
                colorToString(
                    path.strokeColor
                );


            sig.strokeWidth =
                roundValue(
                    path.strokeWidth
                );
        }


        // --------------------------------------------
        // OPACITY
        // --------------------------------------------

        try {

            sig.opacity =
                roundValue(
                    item.opacity
                );

        } catch (e) {

            sig.opacity =
                100;
        }


    } catch (e) {}


    return sig;
}



// ------------------------------------------------------------
// COMPARE APPEARANCE SIGNATURES
// ------------------------------------------------------------

function signaturesMatch(
    a,
    b
) {

    if (
        !a.valid ||
        !b.valid
    ) {

        return false;
    }


    if (
        a.filled !==
        b.filled
    ) {

        return false;
    }


    if (
        a.filled &&
        a.fillColor !==
        b.fillColor
    ) {

        return false;
    }


    if (
        a.stroked !==
        b.stroked
    ) {

        return false;
    }


    if (
        a.stroked
    ) {

        if (
            a.strokeColor !==
            b.strokeColor
        ) {

            return false;
        }


        if (
            a.strokeWidth !==
            b.strokeWidth
        ) {

            return false;
        }
    }


    if (
        a.opacity !==
        b.opacity
    ) {

        return false;
    }


    return true;
}



// ------------------------------------------------------------
// COLOR -> COMPARABLE STRING
// ------------------------------------------------------------

function colorToString(color) {

    if (
        color === null ||
        color === undefined
    ) {

        return "NONE";
    }


    try {

        // ====================================================
        // RGB
        // ====================================================

        if (
            color.typename === "RGBColor"
        ) {

            return (
                "RGB:" +
                roundValue(color.red) +
                "," +
                roundValue(color.green) +
                "," +
                roundValue(color.blue)
            );
        }



        // ====================================================
        // CMYK
        // ====================================================

        if (
            color.typename === "CMYKColor"
        ) {

            return (
                "CMYK:" +
                roundValue(color.cyan) +
                "," +
                roundValue(color.magenta) +
                "," +
                roundValue(color.yellow) +
                "," +
                roundValue(color.black)
            );
        }



        // ====================================================
        // GRAY
        // ====================================================

        if (
            color.typename === "GrayColor"
        ) {

            return (
                "GRAY:" +
                roundValue(color.gray)
            );
        }



        // ====================================================
        // SPOT
        // ====================================================

        if (
            color.typename === "SpotColor"
        ) {

            return (
                "SPOT:" +
                color.spot.name +
                ":" +
                roundValue(color.tint)
            );
        }



        // ====================================================
        // NO COLOR
        // ====================================================

        if (
            color.typename === "NoColor"
        ) {

            return "NONE";
        }



        // ====================================================
        // FALLBACK
        // ====================================================

        return (
            "TYPE:" +
            color.typename
        );


    } catch (e) {

        return "UNKNOWN";
    }
}



// ------------------------------------------------------------
// ROUND VALUE FOR STABLE COMPARISON
// ------------------------------------------------------------

function roundValue(value) {

    try {

        return (
            Math.round(
                value * 1000
            ) / 1000
        );

    } catch (e) {

        return value;
    }
}



// ------------------------------------------------------------
// CHECK WHETHER ARRAY ALREADY CONTAINS ITEM
// ------------------------------------------------------------

function arrayContainsItem(
    array,
    item
) {

    for (
        var i = 0;
        i < array.length;
        i++
    ) {

        try {

            if (
                array[i] === item
            ) {

                return true;
            }

        } catch (e) {}
    }


    return false;
}