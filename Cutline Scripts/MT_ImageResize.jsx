#target photoshop

// ============================================================
// ASK USER FOR RESIZE DIMENSION
// ============================================================

var dimensionChoice = prompt(
    "Resize artwork by:\n\n" +
    "Enter H for HEIGHT\n" +
    "Enter W for WIDTH",
    "H"
);

if (dimensionChoice === null) {
    exit();
}

dimensionChoice = dimensionChoice.toUpperCase();

while (dimensionChoice !== "H" && dimensionChoice !== "W") {

    dimensionChoice = prompt(
        "Please enter H for HEIGHT or W for WIDTH.",
        "H"
    );

    if (dimensionChoice === null) {
        exit();
    }

    dimensionChoice = dimensionChoice.toUpperCase();
}


// ============================================================
// ASK FOR SIZE IN INCHES
// ============================================================

var targetInches = prompt(
    "Enter the desired " +
    (dimensionChoice === "H" ? "HEIGHT" : "WIDTH") +
    " in inches:",
    "10"
);

if (targetInches === null) {
    exit();
}

targetInches = parseFloat(targetInches);

while (isNaN(targetInches) || targetInches <= 0) {

    targetInches = prompt(
        "Please enter a valid size in inches:",
        "10"
    );

    if (targetInches === null) {
        exit();
    }

    targetInches = parseFloat(targetInches);
}


// ============================================================
// PROCESS EVERY OPEN PHOTOSHOP DOCUMENT
// ============================================================

for (var i = 0; i < app.documents.length; i++) {

    var doc = app.documents[i];
    app.activeDocument = doc;

    try {

        // --------------------------------------------------------
        // MAKE SURE THERE IS A LAYER
        // --------------------------------------------------------

        if (doc.layers.length === 0) {
            continue;
        }


        // --------------------------------------------------------
        // SELECT THE EXISTING ARTWORK LAYER
        // --------------------------------------------------------

        var layer = doc.layers[0];
        doc.activeLayer = layer;


        // --------------------------------------------------------
        // CLEAR EXISTING SELECTION
        // --------------------------------------------------------

        doc.selection.deselect();


        // --------------------------------------------------------
        // SELECT PIXELS OF THE ACTIVE LAYER
        //
        // Equivalent to:
        // Right Click Layer -> Select Pixels
        // --------------------------------------------------------

        var idsetd = charIDToTypeID("setd");
        var desc = new ActionDescriptor();

        var idnull = charIDToTypeID("null");

        var selectionRef = new ActionReference();

        selectionRef.putProperty(
            charIDToTypeID("Chnl"),
            charIDToTypeID("fsel")
        );

        desc.putReference(
            idnull,
            selectionRef
        );

        var idT = charIDToTypeID("T   ");

        var transparencyRef = new ActionReference();

        transparencyRef.putEnumerated(
            charIDToTypeID("Chnl"),
            charIDToTypeID("Chnl"),
            charIDToTypeID("Trsp")
        );

        desc.putReference(
            idT,
            transparencyRef
        );

        executeAction(
            idsetd,
            desc,
            DialogModes.NO
        );


        // --------------------------------------------------------
        // CROP TO THE SELECTED ARTWORK
        // --------------------------------------------------------

        doc.crop(doc.selection.bounds);


        // --------------------------------------------------------
        // DESELECT
        // --------------------------------------------------------

        doc.selection.deselect();


        // ========================================================
        // GET CURRENT PIXEL DIMENSIONS
        // ========================================================

        var currentWidthPx = doc.width.as("px");
        var currentHeightPx = doc.height.as("px");


        // ========================================================
        // GET CURRENT RESOLUTION
        // ========================================================

        var currentDPI = doc.resolution;


        // ========================================================
        // DETERMINE ASPECT RATIO
        // ========================================================

        var aspectRatio = currentWidthPx / currentHeightPx;


        // ========================================================
        // CALCULATE TARGET PHYSICAL DIMENSIONS
        // ========================================================

        var targetWidthInches;
        var targetHeightInches;

        if (dimensionChoice === "W") {

            // User specified WIDTH
            targetWidthInches = targetInches;

            // Maintain aspect ratio
            targetHeightInches =
                targetWidthInches / aspectRatio;

        } else {

            // User specified HEIGHT
            targetHeightInches = targetInches;

            // Maintain aspect ratio
            targetWidthInches =
                targetHeightInches * aspectRatio;
        }


        // ========================================================
        // DETERMINE WHICH PHYSICAL DIMENSION IS SMALLEST
        // ========================================================

        var smallestPhysicalDimension =
            Math.min(
                targetWidthInches,
                targetHeightInches
            );


        // ========================================================
        // CALCULATE DPI REQUIRED FOR MINIMUM 2000 PIXELS
        //
        // Example:
        //
        // Smallest dimension = 5 inches
        //
        // 2000 / 5 = 400 DPI
        //
        // Therefore minimum resolution = 400 DPI
        // ========================================================

        var minimumRequiredDPI =
            2000 / smallestPhysicalDimension;


        // ========================================================
        // KEEP EXISTING DPI IF IT ALREADY PRODUCES
        // AT LEAST 2000 PIXELS ON THE SMALLEST SIDE
        // OTHERWISE INCREASE IT.
        // ========================================================

        var finalDPI =
            Math.max(
                currentDPI,
                minimumRequiredDPI
            );


        // ========================================================
        // RESIZE IMAGE
        //
        // Width and height are specified in INCHES.
        // Aspect ratio is preserved.
        // Resolution is automatically adjusted.
        // ========================================================

        doc.resizeImage(
            UnitValue(targetWidthInches, "in"),
            UnitValue(targetHeightInches, "in"),
            finalDPI,
            ResampleMethod.BICUBIC
        );


        // ========================================================
        // FINAL SAFETY CHECK
        //
        // Make absolutely sure the smallest dimension
        // is at least 2000 pixels.
        // ========================================================

        var finalWidthPx = doc.width.as("px");
        var finalHeightPx = doc.height.as("px");

        var smallestPixelDimension =
            Math.min(
                finalWidthPx,
                finalHeightPx
            );


        // If somehow below 2000, increase resolution again
        if (smallestPixelDimension < 2000) {

            var correctionFactor =
                2000 / smallestPixelDimension;

            finalDPI = finalDPI * correctionFactor;

            doc.resizeImage(
                UnitValue(targetWidthInches, "in"),
                UnitValue(targetHeightInches, "in"),
                finalDPI,
                ResampleMethod.BICUBIC
            );
        }

    app.doAction("Canvas Spacing", "FreshTango Actions");


    } catch (e) {

        // --------------------------------------------------------
        // ERROR HANDLING
        // --------------------------------------------------------

        try {
            doc.selection.deselect();
        } catch (ignore) {}

        alert(
            "Could not process:\n\n" +
            doc.name +
            "\n\nError:\n" +
            e.message
        );
    }
}


// ============================================================
// DONE
// ============================================================

alert(
    "Finished processing all open documents.\n\n" +
    "Artwork was cropped and resized to " +
    targetInches +
    "\" " +
    (dimensionChoice === "H" ? "height" : "width") +
    ".\n\n" +
    "Minimum artwork dimension: 2000 pixels."
);