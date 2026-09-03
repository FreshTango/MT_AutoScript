// -------------------------------------------------
// MASTER SCRIPT LOADER
// Runs multiple Illustrator scripts in order
// -------------------------------------------------

try {

    var scriptFolder = File($.fileName).parent;


    // -------------------------------------------------
    // ASK IF THIS IS A PSD
    // -------------------------------------------------

    var isPSD = confirm(
        "Are these documents PSD files?"
    );


    // -------------------------------------------------
    // PSD SCRIPT
    // -------------------------------------------------

    if (isPSD) {

        $.evalFile(
            File(
                scriptFolder +
                "/MT_AutoScript_Embed.jsx"
            )
        );

        redraw();
    }


    // -------------------------------------------------
    // Run Script 1
    // -------------------------------------------------

    $.evalFile(
        File(
            scriptFolder +
            "/MT_AutoScript_Part1.jsx"
        )
    );

    redraw();


    // -------------------------------------------------
    // Run Script 2
    // -------------------------------------------------

    $.evalFile(
        File(
            scriptFolder +
            "/MT_AutoScript_Part2.jsx"
        )
    );

    redraw();


    // -------------------------------------------------
    // Run Script 3
    // -------------------------------------------------

    $.evalFile(
       File(
           scriptFolder +
           "/MT_AutoScript_Part3.jsx"
       )
    );
    
    redraw();


    // -------------------------------------------------
    // COMPLETE
    // -------------------------------------------------

    alert(
        "Formatting completed for all open documents."
    );


} catch (e) {

    alert(
        "Master Script Error:\n" +
        e
    );
}