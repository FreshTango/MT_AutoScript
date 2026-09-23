#NoEnv
#SingleInstance Force

; ==========================================================
; REGISTRATION MARKS
; ==========================================================

; Give Illustrator focus
WinActivate, ahk_exe Illustrator.exe
WinWaitActive, ahk_exe Illustrator.exe,, 5

Sleep, 250


; ==========================================================
; OPEN CUTTING MASTER 4 > REGISTRATION MARKS
; ==========================================================

; Open File menu
SendInput !f

Sleep, 150

; Down 17 times
SendInput {Down 17}

Sleep, 150

; Open Cutting Master 4 submenu
SendInput {Right}

Sleep, 150

; Down once to Registration Marks
SendInput {Down}
Send {Enter}

Sleep, 300


; ==========================================================
; REGISTRATION MARKS DIALOG
; ==========================================================

TabCount := 5

Loop, %TabCount%
{
    Send {Tab}
    Sleep, 150
}

; Select existing value
Send ^a

Sleep, 150

; Enter new X Step
Send 16.64

Sleep, 200

; Accept dialog
Send {Enter}


; ==========================================================
; WAIT FOR REGISTRATION MARKS TO FINISH
; ==========================================================

Sleep, 2000


; ==========================================================
; RUN AfterRegMarks.jsx
; Must be in same folder as this AHK file
; ==========================================================

jsxFile := A_ScriptDir . "\MT_AfterRegMarks.jsx"

; Connect to currently running Illustrator
ai := ComObjActive("Illustrator.Application")

; Execute AfterRegMarks.jsx
ai.DoJavaScriptFile(jsxFile)


; ==========================================================
; FINISH
; ==========================================================

ExitApp