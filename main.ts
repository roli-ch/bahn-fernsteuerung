//  Programm name:    bahn-fernsteuerung
//  Sender mit Rotation
//  V1 Basis  13.5.2026
//  
//  LED Anzeigen:
//  Remote    0,0          Empfangen
//  Speed     2,0 - 2,4    Senden 
//  richtung  0,2 - 0,4    Senden puls 1 = vor
//  on        0,4          Button A
//  stop                   Button B
//  Init
//  =========================
radio.setGroup(1)
radio.setTransmitPower(7)
let richtung = 0
let licht_on = 0
let speedRoh = 0
let speedOld = 0
let speedAbs = 0
let speedFaktor = 2
let remCtrl = 0
let speed = 0
let fahren = 0
let trigger = 0
let hyst = 5
let s0 = 10
let s2 = 80
let r0 = 10
let r2 = 80
basic.showLeds(`
    . . . . .
    . # # # .
    . # . # .
    . # # # .
    . . . . .
    `)
basic.pause(1000)
basic.clearScreen()
//  Buttons
//  =====================================
//  A: on/off, on: LED 0,4
input.onButtonPressed(Button.A, function on_button_pressed_a() {
    
    if (fahren == 0) {
        fahren = 1
        set_led_fahren(1)
        // led.plot(0, 0)
        music.play(music.builtinPlayableSoundEffect(soundExpression.hello), music.PlaybackMode.UntilDone)
    } else {
        fahren = 0
        speed = 0
        richtung = 0
        trigger = 1
        sendData()
        set_led_fahren(0)
        //  led.unplot(0, 0)
        music.play(music.createSoundExpression(WaveShape.Sine, 5000, 0, 255, 0, 1000, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.UntilDone)
    }
    
    radio.sendValue("fahren", fahren)
})
//  B: Licht on/off, on: LED xy44
input.onButtonPressed(Button.B, function on_button_pressed_b() {
    
    if (licht_on == 0) {
        licht_on = 1
        set_led_licht(1)
    } else {
        //  led.plot(4, 0)
        licht_on = 0
        sendData()
        set_led_licht(0)
    }
    
    // led.unplot(4, 0)
    radio.sendValue("licht_on", licht_on)
})
//  Funktionen
//  ===================================
//  Leds ein/aus
//  -------------------
//  remoteControl
function set_keis_ein(kreisNr: any, on: any) {
    let pos = [0, 0]
    if (on) {
        led.plot(pos[0], pos[1])
    } else {
        led.unplot(pos[0], pos[1])
    }
    
}

//  fahren
function set_led_fahren(on: number) {
    let pos = [0, 4]
    if (on) {
        led.plot(pos[0], pos[1])
    } else {
        led.unplot(pos[0], pos[1])
    }
    
}

//  stop
function set_led_stop(on: number) {
    let pos = [2, 2]
    if (on) {
        led.plot(pos[0], pos[1])
    } else {
        led.unplot(pos[0], pos[1])
    }
    
}

//  licht
function set_led_licht(on: number) {
    let pos = [4, 4]
    if (on) {
        led.plot(pos[0], pos[1])
    } else {
        led.unplot(pos[0], pos[1])
    }
    
}

//  Daten Senden
function sendData() {
    
    // trigger = 1
    if (trigger == 1) {
        //  Daten anzeigen
        serial.writeValue("speed", speed)
        serial.writeValue("richtung", richtung)
        //  Senden
        radio.sendNumber(1)
        radio.setTransmitSerialNumber(true)
        radio.sendValue("speed", speed)
        radio.sendValue("richtung", richtung)
        radio.sendValue("licht_on", licht_on)
        trigger = 0
    }
    
}

//  Daten Empfangen
//  set_led_remote(0)
radio.onReceivedValue(function on_received_value(name: string, value: number) {
    
    music.play(music.tonePlayable(Note.C, music.beat(BeatFraction.Whole)), music.PlaybackMode.UntilDone)
    serial.writeValue("daten empfangen: " + name, value)
    if (name == "remCtrl") {
        remCtrl = value
    }
    
    if (remCtrl) {
        
    } else {
        //  set_led_remote(1)
        
    }
    
})
function setSpeed() {
    let speedDir: number;
    
    speedRoh = input.rotation(Rotation.Pitch) * -1
    if (speedRoh > 0) {
        speedDir = 1
    } else {
        speedDir = -1
    }
    
    // speed = Math.constrain(abs(speedRoh) - s0, 0, 100)
    // speed = min(100, speed / 2 * 10) * speedDir
    speed = Math.min(100, Math.abs(speedRoh * speedFaktor)) * speedDir
    speedAbs = Math.abs(speed)
    if (Math.abs(speedAbs - speedOld) > hyst) {
        trigger = 1
        // serial.write_value("speedAbs", speedAbs)
        // serial.write_value("speedOld", speedOld)
        speedOld = speedAbs
    }
    
}

function setRichtung() {
    let richtungDir: number;
    let trigger: number;
    let richtungOld: number;
    
    if (richtung) {
        richtungDir = 1
    } else {
        richtungDir = -1
    }
    
    // richtung = Math.constrain(abs(richtungRoh) - r0, 0, 100)
    // richtung = min(100, richtung / 2 * 10) * richtungDir
    let richtungAbs = Math.abs(richtung)
    if (Math.abs(richtungAbs - richtungOld) > hyst) {
        trigger = 1
        richtungOld = richtungAbs
    }
    
}

function showSpeed() {
    if (speed > 0) {
        if (speed > s2) {
            led.plot(2, 0)
            led.plot(2, 1)
            led.plot(2, 2)
        } else {
            led.unplot(2, 0)
            led.plot(2, 1)
        }
        
    } else if (speed < 0) {
        if (speed < -1 * s2) {
            led.plot(2, 2)
            led.plot(2, 3)
            led.plot(2, 4)
        } else {
            led.plot(2, 3)
            led.unplot(2, 4)
        }
        
    } else if (speed == 0) {
        led.unplot(2, 0)
        led.unplot(2, 1)
        led.plot(2, 2)
        led.unplot(2, 3)
        led.unplot(2, 4)
    }
    
}

function showRichtung() {
    if (richtung > 0) {
        if (richtung > r2) {
            led.plot(2, 2)
            led.plot(3, 2)
            led.plot(4, 2)
        } else {
            led.unplot(4, 2)
            led.plot(3, 2)
        }
        
    } else if (richtung < 0) {
        if (richtung < -1 * r2) {
            led.plot(0, 2)
            led.plot(1, 2)
            led.plot(2, 2)
        } else {
            led.plot(1, 2)
            led.unplot(0, 2)
        }
        
    } else if (richtung == 0) {
        led.unplot(0, 2)
        led.unplot(1, 2)
        led.plot(2, 2)
        led.unplot(3, 2)
        led.unplot(4, 2)
    }
    
}

//  Time Loop 1s
//  =====================================
loops.everyInterval(1000, function onEvery_interval() {
    //  Daten Anzeigen
    console.log("===========")
    console.log("interval 1s; Zeit: " + control.millis() / 1000)
    console.log("speed: " + speed)
    console.log("richtung: " + richtung)
    console.log("Fahren: " + fahren)
    console.log("Licht: " + licht_on)
})
//  Main Loop
//  =====================================
basic.forever(function on_forever() {
    
    if (fahren == 1) {
        set_led_fahren(1)
        setSpeed()
        showSpeed()
        setRichtung()
        showRichtung()
        sendData()
    } else {
        showSpeed()
        showRichtung()
        set_led_stop(1)
    }
    
})
