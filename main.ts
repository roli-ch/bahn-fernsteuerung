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
let vor_Kreis = [1, 0, 1]
let ein_Kreis = [0, 0, 0]
let sel_Kreis = [0, 0, 0, 0, 0]
let speed_Kreis = [20, 40, 80]
let speed_up = 1
let receive = 0
let mode = "sel"
//  sel / speed / dir / ea
//  enum Mode {"sel", "speed"}        // JavaScript
let show_interval = 0
let send_request = 0
basic.showLeds(`
    . . . . .
    . # # # .
    . # . # .
    . # # # .
    . . . . .
    `)
basic.pause(1000)
basic.clearScreen()
console.log("Init")
// showStatus()
// 
//  Buttons
//  =====================================
//  A: select / speed +
// showStatus()
input.onButtonPressed(Button.A, function on_button_pressed_a() {
    // led.plot(0,0)
    // led.unplot(4,4)
    if (mode == "sel") {
        console.log("A: select")
        kreisSelection()
    } else if (mode == "speed") {
        console.log("A: speed")
        if (sel_Kreis[0]) {
            speed_Kreis[0] = setSpeed(speed_Kreis[0])
            showSpeed(0)
            console.log("speed K1: " + speed_Kreis[0])
        }
        
        if (sel_Kreis[1]) {
            speed_Kreis[1] = setSpeed(speed_Kreis[1])
            showSpeed(1)
            console.log("speed K2: " + speed_Kreis[1])
        }
        
        if (sel_Kreis[2]) {
            speed_Kreis[2] = setSpeed(speed_Kreis[2])
            showSpeed(2)
            console.log("speed K3: " + speed_Kreis[2])
        }
        
    } else if (mode == "dir") {
        console.log("A: dir")
    } else if (mode == "ea") {
        console.log("A: ea")
    } else {
        console.log("mode Fehler")
    }
    
})
//  B: select / speed -
//  -------------------------
input.onButtonPressed(Button.B, function on_button_pressed_b() {
    console.log("B:")
    // led.plot(4,4)
    // led.unplot(0,0)
    showStatus()
})
//  A&B: Umschalten mode select/speed/dir/ea
//  -------------------------
// showStatus()
input.onButtonPressed(Button.AB, function on_button_pressed_ab() {
    
    console.log("AB: select/speed/dir/ea")
    if (mode == "sel") {
        mode = "speed"
        led.plot(4, 1)
        led.unplot(4, 0)
    } else if (mode == "speed") {
        mode = "dir"
        led.plot(4, 2)
        led.unplot(4, 1)
    } else if (mode == "dir") {
        mode = "ea"
        led.plot(4, 3)
        led.unplot(4, 2)
    } else if (mode == "ea") {
        mode = "sel"
        led.plot(4, 0)
        led.unplot(4, 3)
    } else {
        console.log("fehler")
    }
    
    console.log(mode)
})
// 
//  Funktionen
//  =========================
//  
//  -------------------------
function kreisSelection() {
    
    console.log("kreisSelection")
    if (sel_Kreis[0]) {
        sel_Kreis[0] = 0
        sel_Kreis[1] = 1
    } else if (sel_Kreis[1]) {
        sel_Kreis[1] = 0
        sel_Kreis[2] = 1
    } else if (sel_Kreis[2]) {
        sel_Kreis[2] = 0
        sel_Kreis[3] = 1
    } else if (sel_Kreis[3]) {
        sel_Kreis[3] = 0
        sel_Kreis[4] = 1
    } else if (sel_Kreis[4]) {
        sel_Kreis[4] = 0
        sel_Kreis[0] = 1
    } else {
        sel_Kreis[0] = 1
    }
    
    console.log("Selection: " + sel_Kreis[0] + sel_Kreis[1] + sel_Kreis[2] + sel_Kreis[3] + sel_Kreis[4])
    showSelLED()
}

//  -------------------------
function showSelLED() {
    console.log("showSelLED")
    let i = 0
    for (let sel of sel_Kreis.slice(0)) {
        // print("i: "+i+" sel_Kreis"+i+ "  sel "+sel)
        if (sel) {
            led.plot(3, i)
        } else {
            led.unplot(3, i)
        }
        
        i += 1
    }
}

//  -------------------------
function showStatus() {
    console.log("----------")
    console.log("showStatus")
    console.log("remCtrl" + remCtrl)
    let i = 0
    for (let on1 of vor_Kreis.slice(0)) {
        // print("on: "+on+" i1: "+ i1)
        console.log("vor_Kreis" + (i + 1) + ": " + on1)
        i += 1
    }
    i = 0
    for (let on2 of ein_Kreis.slice(0)) {
        console.log("ein_Kreis " + (i + 1) + " " + on2)
        i += 1
    }
    i = 0
    for (let on3 of sel_Kreis.slice(0)) {
        console.log("sel_Kreis " + (i + 1) + " " + on3)
        i += 1
    }
    i = 0
    for (let on4 of speed_Kreis.slice(0)) {
        console.log("speed_Kreis " + (i + 1) + " " + on4)
        i += 1
    }
    console.log("speedlim1: " + speedlim1)
    console.log("speedlim2: " + speedlim2)
    console.log("speedlim3: " + speedlim3)
    console.log("receive: " + receive)
    console.log("mode: " + mode)
}

//  -------------------------
function showRichtung() {
    for (let i of vor_Kreis.slice(0)) {
        if (vor_Kreis[i]) {
            led.plot(vor_Kreis[i], 0)
        } else {
            led.unplot(vor_Kreis[i], 0)
        }
        
    }
}

//  -------------------------
//  Daten Senden
function sendData() {
    let i: number;
    let trigger: number;
    
    //  trigger = 1
    if (trigger == 1) {
        //  Daten anzeigen
        i = 0
        serial.writeValue("speed", speed_Kreis[i])
        //  Senden
        radio.sendNumber(1)
        radio.setTransmitSerialNumber(true)
        radio.sendValue("speed", speed_Kreis[i])
        trigger = 0
    }
    
}

function setSpeed(speed: number): number {
    
    let step = 10
    if (speed_up) {
        if (speed < 100) {
            speed += step
        } else {
            speed_up = 0
        }
        
    } else if (speed > 0) {
        speed -= step
    } else {
        speed_up = 1
    }
    
    console.log("Speed : " + speed + " up= " + speed_up)
    return speed
}

function setRichtung() {
    let richtungDir: number;
    if (vor_Kreis) {
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
function showSpeed(kreis: number) {
    if (speed_Kreis[kreis] > speedlim1) {
        led.plot(kreis, 2)
    } else {
        led.unplot(kreis, 2)
    }
    
    if (speed_Kreis[kreis] > speedlim2) {
        led.plot(kreis, 3)
    } else {
        led.unplot(kreis, 3)
    }
    
    if (speed_Kreis[kreis] > speedlim3) {
        led.plot(kreis, 4)
    } else {
        led.unplot(kreis, 4)
    }
    
}

//  Time Loop 1s
//  =====================================
loops.everyInterval(1000, function on_every_interval() {
    let i: number;
    if (show_interval) {
        i = 0
        console.log("===========")
        console.log("interval 1s; Zeit: " + ("" + ("" + control.millis() / 1000)))
        console.log("speed: " + ("" + ("" + speed_Kreis[i])))
    }
    
})
//  Main Loop
//  =====================================
basic.forever(function on_forever() {
    let changed = 0
    if (changed) {
        // setSpeed()
        showSpeed(0)
        setRichtung()
        showRichtung()
        sendData()
    } else {
        showSpeed(0)
        showRichtung()
    }
    
})
