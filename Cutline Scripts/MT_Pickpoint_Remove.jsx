#target illustrator

(function () {

    // ============================================================
    // SETTINGS
    // ============================================================

    // Delete enclosed shapes whose longest dimension
    // is 0.1 inches or smaller.
    var MAX_PICKPOINT_LENGTH_INCHES = 0.1;

    // 72 Illustrator points = 1 inch
    var MAX_PICKPOINT_LENGTH_PT =
        MAX_PICKPOINT_LENGTH_INCHES * 72;


    // ============================================================
    // DOCUMENT CHECK
    // ============================================================

    if (app.documents.length === 0) {
        alert("No Illustrator document is open.");
        return;
    }

    var doc = app.activeDocument;


    // ============================================================
    // CUTLINE = CURRENTLY SELECTED OBJECT
    // ============================================================

    if (doc.selection.length !== 1) {

        alert(
            "Please select the cutline first.\n\n" +
            "Only the cutline should be selected."
        );

        return;
    }

    var cutline = doc.selection[0];


    // ============================================================
    // VALIDATE CUTLINE
    // ============================================================

    if (
        cutline.typename !== "PathItem" &&
        cutline.typename !== "CompoundPathItem"
    ) {

        alert(
            "The selected object is not a Path or Compound Path."
        );

        return;
    }


    // ============================================================
    // CUTLINE BOUNDS
    // ============================================================

    var cutlineBounds = getGeometricBounds(cutline);

    if (!cutlineBounds) {

        alert(
            "Could not determine the cutline bounds."
        );

        return;
    }


    // ============================================================
    // COLLECT ALL PATHS IN DOCUMENT
    // ============================================================

    var allPaths = [];

    collectPaths(doc, allPaths);


    // ============================================================
    // FIND PICKPOINTS
    // ============================================================

    var deleteList = [];

    for (var i = 0; i < allPaths.length; i++) {

        var item = allPaths[i];


        // --------------------------------------------------------
        // NEVER DELETE CUTLINE
        // --------------------------------------------------------

        if (item === cutline) {
            continue;
        }


        // --------------------------------------------------------
        // SKIP LOCKED / HIDDEN
        // --------------------------------------------------------

        try {

            if (item.locked || item.hidden) {
                continue;
            }

        } catch (e) {
            continue;
        }


        // --------------------------------------------------------
        // MUST BE CLOSED
        // --------------------------------------------------------

        if (!itemIsClosed(item)) {
            continue;
        }


        // --------------------------------------------------------
        // GET GEOMETRIC BOUNDS
        // --------------------------------------------------------

        var bounds = getGeometricBounds(item);

        if (!bounds) {
            continue;
        }


        var left = bounds[0];
        var top = bounds[1];
        var right = bounds[2];
        var bottom = bounds[3];


        // --------------------------------------------------------
        // LONGEST DIMENSION
        // --------------------------------------------------------

        var width = Math.abs(right - left);
        var height = Math.abs(top - bottom);

        var longestDimension =
            Math.max(width, height);


        // --------------------------------------------------------
        // MUST BE 0.1" OR SMALLER
        // --------------------------------------------------------

        if (
            longestDimension >
            MAX_PICKPOINT_LENGTH_PT
        ) {
            continue;
        }


        // --------------------------------------------------------
        // QUICK CUTLINE BOUNDS CHECK
        // --------------------------------------------------------

        if (
            left < cutlineBounds[0] ||
            top > cutlineBounds[1] ||
            right > cutlineBounds[2] ||
            bottom < cutlineBounds[3]
        ) {
            continue;
        }


        // --------------------------------------------------------
        // TEST MULTIPLE POINTS
        //
        // This is much more reliable for triangles and
        // irregular pickpoints than testing only the center.
        // --------------------------------------------------------

        if (!shapeIsInsideCutline(item, cutline)) {
            continue;
        }


        // --------------------------------------------------------
        // ADD TO DELETE LIST
        // --------------------------------------------------------

        deleteList.push(item);
    }


    // ============================================================
    // DELETE PICKPOINTS
    // ============================================================

    var deleted = 0;

    for (
        var d = deleteList.length - 1;
        d >= 0;
        d--
    ) {

        try {

            deleteList[d].remove();
            deleted++;

        } catch (e) {}
    }


    // ============================================================
    // RESTORE CUTLINE SELECTION
    // ============================================================

    try {

        doc.selection = null;
        cutline.selected = true;

    } catch (e) {}


    // ============================================================
    // DONE
    // ============================================================

    alert(
        "Pickpoint cleanup complete.\n\n" +
        "Maximum length: " +
        MAX_PICKPOINT_LENGTH_INCHES +
        " inches\n\n" +
        "Pickpoints removed: " +
        deleted
    );


    // ============================================================
    // FUNCTIONS
    // ============================================================


    // ------------------------------------------------------------
    // COLLECT PATHS RECURSIVELY
    // ------------------------------------------------------------

    function collectPaths(container, array) {

        var items;

        try {
            items = container.pageItems;
        } catch (e) {
            return;
        }


        for (var i = 0; i < items.length; i++) {

            var item = items[i];


            if (
                item.typename === "PathItem" ||
                item.typename === "CompoundPathItem"
            ) {

                array.push(item);
            }


            // Search inside groups
            if (item.typename === "GroupItem") {

                collectPaths(item, array);
            }
        }
    }


    // ------------------------------------------------------------
    // GET GEOMETRIC BOUNDS
    // ------------------------------------------------------------

    function getGeometricBounds(item) {

        try {
            return item.geometricBounds;
        } catch (e) {

            try {
                return item.visibleBounds;
            } catch (e2) {
                return null;
            }
        }
    }


    // ------------------------------------------------------------
    // CHECK CLOSED
    // ------------------------------------------------------------

    function itemIsClosed(item) {

        if (item.typename === "PathItem") {

            try {
                return item.closed;
            } catch (e) {
                return false;
            }
        }


        if (item.typename === "CompoundPathItem") {

            try {

                if (item.pathItems.length === 0) {
                    return false;
                }

                for (
                    var i = 0;
                    i < item.pathItems.length;
                    i++
                ) {

                    if (
                        item.pathItems[i].closed
                    ) {
                        return true;
                    }
                }

            } catch (e) {}
        }


        return false;
    }


    // ============================================================
    // CHECK WHETHER SHAPE IS INSIDE CUTLINE
    // ============================================================

    function shapeIsInsideCutline(
        shape,
        cutline
    ) {

        var testPoints =
            getTestPoints(shape);


        // --------------------------------------------------------
        // At least one point must exist
        // --------------------------------------------------------

        if (testPoints.length === 0) {
            return false;
        }


        // --------------------------------------------------------
        // EVERY TEST POINT MUST BE INSIDE CUTLINE
        // --------------------------------------------------------

        for (
            var i = 0;
            i < testPoints.length;
            i++
        ) {

            var point = testPoints[i];


            if (
                !pointInsideCutline(
                    cutline,
                    point[0],
                    point[1]
                )
            ) {

                return false;
            }
        }


        return true;
    }


    // ============================================================
    // GET TEST POINTS
    //
    // Uses the actual anchor points plus the center of the bounds.
    // ============================================================

    function getTestPoints(item) {

        var points = [];


        // --------------------------------------------------------
        // NORMAL PATH
        // --------------------------------------------------------

        if (item.typename === "PathItem") {

            try {

                for (
                    var i = 0;
                    i < item.pathPoints.length;
                    i++
                ) {

                    points.push(
                        item.pathPoints[i].anchor
                    );
                }

            } catch (e) {}
        }


        // --------------------------------------------------------
        // COMPOUND PATH
        // --------------------------------------------------------

        else if (
            item.typename ===
            "CompoundPathItem"
        ) {

            try {

                for (
                    var p = 0;
                    p < item.pathItems.length;
                    p++
                ) {

                    var sub =
                        item.pathItems[p];

                    for (
                        var s = 0;
                        s < sub.pathPoints.length;
                        s++
                    ) {

                        points.push(
                            sub.pathPoints[s].anchor
                        );
                    }
                }

            } catch (e2) {}
        }


        // --------------------------------------------------------
        // ADD BOUNDING BOX CORNERS
        // --------------------------------------------------------

        var b = getGeometricBounds(item);

        if (b) {

            var left = b[0];
            var top = b[1];
            var right = b[2];
            var bottom = b[3];

            points.push([
                left,
                top
            ]);

            points.push([
                right,
                top
            ]);

            points.push([
                right,
                bottom
            ]);

            points.push([
                left,
                bottom
            ]);


            // Center

            points.push([
                (left + right) / 2,
                (top + bottom) / 2
            ]);
        }


        return points;
    }


    // ============================================================
    // POINT INSIDE CUTLINE
    // ============================================================

    function pointInsideCutline(
        cutline,
        x,
        y
    ) {

        if (
            cutline.typename ===
            "PathItem"
        ) {

            return pointInsidePath(
                cutline,
                x,
                y
            );
        }


        if (
            cutline.typename ===
            "CompoundPathItem"
        ) {

            var inside = false;

            try {

                for (
                    var i = 0;
                    i < cutline.pathItems.length;
                    i++
                ) {

                    if (
                        pointInsidePath(
                            cutline.pathItems[i],
                            x,
                            y
                        )
                    ) {

                        inside = !inside;
                    }
                }

            } catch (e) {}

            return inside;
        }


        return false;
    }


    // ============================================================
    // POINT IN PATH
    // ============================================================

    function pointInsidePath(
        path,
        x,
        y
    ) {

        var points;

        try {
            points = path.pathPoints;
        } catch (e) {
            return false;
        }


        if (points.length < 3) {
            return false;
        }


        var inside = false;

        var j = points.length - 1;


        for (
            var i = 0;
            i < points.length;
            i++
        ) {

            var a =
                points[i].anchor;

            var b =
                points[j].anchor;


            var xi = a[0];
            var yi = a[1];

            var xj = b[0];
            var yj = b[1];


            var intersect =
                (
                    (yi > y) !==
                    (yj > y)
                ) &&
                (
                    x <
                    (xj - xi) *
                    (y - yi) /
                    (yj - yi) +
                    xi
                );


            if (intersect) {
                inside = !inside;
            }


            j = i;
        }


        return inside;
    }

})();