//  Programm name:    bahn-fernsteuerung
//  Sender mit Rotation
//  V1 Basis  13.5.2026
// 
//  LED Anzeigen: (x,y)
//  vor_K1    0,0         Senden
//  vor_K1    1,0         Senden
//  vor_K1    2,0         Senden
//  ein_K1    0,1         Senden
//  ein_K1    1,1         Senden
//  ein_K1    2,1         Senden
//  Speed K1  0,2 - 0,4   Senden
//  Speed K2  1,2 - 1,4   Senden
//  Speed K3  2,2 - 2,4   Senden
//  Remote    4,4         Empfangen
//  sel_K1    3,0
//  sel_K2    3,1
//  sel_K2    3,2
//  sel_speed 3,4
//  select                Button A
//  stop                  Button B
//  
//  Konstanten
//  =========================
let speedlim1 = 30
let speedlim2 = 60
let speedlim3 = 90
// 
//  Init
//  =========================
radio.setGroup(1)
radio.setTransmitPower(7)
let remCtrl = 0
let speedAbs = 0
let speedRoh = 0
let sel_K3 = 0
let sel_K2 = 0
let sel_K1 = 0
let pos3 : number[] = []
let vor_K1 = 0
let mode = ""
speedlim2 = 0
speedlim1 = 0
let speed = 0
let receive = 0
let vor_K3 = 0
let ein_K3 = 0
let vor_K2 = 0
let ein_K2 = 0
let ein_K32 = 0
let ein_K22 = 0
let ein_K12 = 0
let ein_K1 = 1
mode = "sel"
//  enum Mode {"sel", "speed"}        // JavaScript
let show_interval = 0
basic.showLeds(`
    . . . . .
    . # # # .
    . # . # .
    . # # # .
    . . . . .
    `)
basic.pause(1000)
basic.clearScreen()
// 
// 
//  Funktionen
//  =========================
//  
//  -------------------------
function showRichtung() {
    if (vor_K1) {
        led.plot(2, 2)
        led.plot(3, 2)
        led.plot(4, 2)
    } else {
        led.unplot(4, 2)
        led.plot(3, 2)
    }
    
}

//  -------------------------
function set_led_stop(on3: number) {
    
    pos3 = [2, 2]
    if (true) {
        led.plot(pos3[0], pos3[1])
    } else {
        led.unplot(pos3[0], pos3[1])
    }
    
}

//  -------------------------
//  Daten Senden
function sendData() {
    let trigger: number;
    //  trigger = 1
    if (trigger == 1) {
        //  Daten anzeigen
        serial.writeValue("speed", speed)
        //  Senden
        radio.sendNumber(1)
        radio.setTransmitSerialNumber(true)
        radio.sendValue("speed", speed)
        trigger = 0
    }
    
}

//  Buttons
//  =====================================
//  A: select / speed +
input.onButtonPressed(Button.A, function on_button_pressed_a() {
    
    if (mode == "sel") {
        console.log("A: select")
        if (sel_K1) {
            sel_K1 = 0
            sel_K2 = 1
        } else if (sel_K2) {
            sel_K2 = 0
            sel_K3 = 1
        } else if (sel_K3) {
            sel_K3 = 0
            sel_K1 = 1
        }
        
    }
    
})
//  B: select / speed -
//  -------------------------
input.onButtonPressed(Button.B, function on_button_pressed_b() {
    console.log("B: stop")
})
//  A&B: Umschalten select/speed
//  -------------------------
input.onButtonPressed(Button.AB, function on_button_pressed_ab() {
    console.log("AB: select/speed")
})
function setSpeed() {
    let speedDir: number;
    
    speedRoh = input.rotation(Rotation.Pitch) * -1
    if (speedRoh > 0) {
        speedDir = 1
    } else {
        speedDir = -1
    }
    
    //  speed = Math.constrain(abs(speedRoh) - s0, 0, 100)
    //  speed = min(100, speed / 2 * 10) * speedDir
    speed = Math.min(100, Math.abs(speedRoh * 1)) * speedDir
    speedAbs = Math.abs(speed)
}

function setRichtung() {
    let richtungDir: number;
    if (vor_K1) {
        richtungDir = 1
    } else {
        richtungDir = -1
    }
    
}

//  Daten Empfangen
//  set_led_remote(0)
radio.onReceivedValue(function on_received_value(name: string, value: number) {
    
    serial.writeValue("daten empfangen: " + name, value)
    if (name == "remCtrl") {
        remCtrl = value
    }
    
    //  set_led_remote(1)
    if (remCtrl) {
        
    } else {
        
    }
    
})
function showSpeed() {
    if (speed > speedlim1) {
        led.plot(2, 0)
        led.plot(2, 1)
        led.plot(2, 2)
    } else {
        led.unplot(2, 0)
        led.plot(2, 1)
    }
    
    if (speed > speedlim2) {
        led.plot(2, 2)
        led.plot(2, 3)
        led.plot(2, 4)
    } else {
        led.plot(2, 3)
        led.unplot(2, 4)
    }
    
}

function set_keis_ein(kreisNr: any, on: any) {
    let pos = [0, 0]
    if (on) {
        led.plot(pos[0], pos[1])
    } else {
        led.unplot(pos[0], pos[1])
    }
    
}

function set_led_fahren(on2: any) {
    let pos2 = [0, 4]
    if (on2) {
        led.plot(pos2[0], pos2[1])
    } else {
        led.unplot(pos2[0], pos2[1])
    }
    
}

function set_led_licht(on4: any) {
    let pos4 = [4, 4]
    if (on4) {
        led.plot(pos4[0], pos4[1])
    } else {
        led.unplot(pos4[0], pos4[1])
    }
    
}

//  Time Loop 1s
//  =====================================
loops.everyInterval(1000, function on_every_interval() {
    if (show_interval) {
        console.log("===========")
        console.log("interval 1s; Zeit: " + ("" + ("" + control.millis() / 1000)))
        console.log("speed: " + ("" + ("" + speed)))
    }
    
})
//  Main Loop
//  =====================================
basic.forever(function on_forever() {
    let changed = 0
    if (changed) {
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
