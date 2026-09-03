#NoEnv
#SingleInstance Force

; Give Illustrator focus
WinActivate, ahk_exe Illustrator.exe
WinWaitActive, ahk_exe Illustrator.exe,, 5

Sleep, 250

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

; Finished with Registration Marks

; Open File menu
SendInput !f

Sleep, 150

; Down 17 times
SendInput {Down 20}

Sleep, 150

; Open Cutting Master 4 submenu
SendInput {Right}

Sleep, 150

; Down once to Registration Marks
SendInput {Down 4}
Send {Enter}
