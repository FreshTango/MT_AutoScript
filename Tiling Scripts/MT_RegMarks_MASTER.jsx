try {

    // Get folder containing this master script
    var scriptFolder = File($.fileName).parent;

    // ======================================================
    // 1. RUN REGMARKS
    // ======================================================

    var regMarksFile = new File(
        scriptFolder + "/MT_RegMarks.jsx"
    );

    if (!regMarksFile.exists) {
        throw new Error("RegMarks.jsx not found.");
    }

    $.evalFile(regMarksFile);


    // ======================================================
    // 2. RUN AFTER REGMARKS
    // ======================================================

    var afterRegMarksFile = new File(
        scriptFolder + "/MT_AfterRegMarks.jsx"
    );

    if (!afterRegMarksFile.exists) {
        throw new Error("AfterRegMarks.jsx not found.");
    }

    $.evalFile(afterRegMarksFile);


} catch (e) {

    alert(
        "Master Script Error:\n" +
        e.message
    );

}