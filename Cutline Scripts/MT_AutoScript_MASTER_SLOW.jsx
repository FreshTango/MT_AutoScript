// -------------------------------------------------
// MASTER SCRIPT LOADER
// Runs multiple Illustrator scripts in order
// -------------------------------------------------

try {

    var scriptFolder = File($.fileName).parent;

    // Run Script 1
    $.evalFile(File(scriptFolder + "/MT_AutoScript_Part1_Slow.jsx"));
    redraw();
  
    // Run Script 2
    $.evalFile(File(scriptFolder + "/MT_AutoScript_Part2_Slow.jsx"));
    redraw();

    // Run Script 3
    $.evalFile(File(scriptFolder + "/MT_AutoScript_Part3.jsx"));
    redraw();

    alert("Formatting completed for all open documents.");

} catch (e) {

    alert("Master Script Error:\n" + e);
}