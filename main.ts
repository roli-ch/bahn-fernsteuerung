//  Programm name:    bahn-fernsteuerung
//  Sender mit Rotation
//  V1 Basis  20.5.2026
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
//  change selection      Button A
//  stop                  Button B
//  select                Button A&B
//  Konstanten
//  =========================
let speedlim1 = 40
let speedlim2 = 70
// 
//  Init
//  =========================
radio.on()
radio.setGroup(1)
radio.setTransmitPower(7)
let remCtrl = 0
//  Gegenstation ist für empfang freigegeben azeige led(4.4)
let vor_Kreis = [0, 0, 0]
let ein_Kreis = [0, 0, 0]
let sel_Kreis = [0, 0, 0, 0, 0]
let speed_Kreis = [0, 0, 0]
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
kreisSelection()
console.log("Init")
// showStatus()
// 
//  Buttons
//  =====================================
//  A: select / speed +
input.onButtonPressed(Button.A, function on_button_pressed_a() {
    let kreis: number;
    // led.plot(0,0)
    // led.unplot(4,4)
    if (mode == "sel") {
        console.log("A: select")
        kreisSelection()
    } else if (mode == "speed") {
        console.log("A: Send speed")
        for (kreis = 0; kreis < 3; kreis++) {
            if (sel_Kreis[kreis]) {
                speed_Kreis[kreis] = setSpeed(speed_Kreis[kreis])
                // print("speed K"+(kreis+1)+": "+speed_Kreis[kreis])
                if (kreis == 0) {
                    radio.sendValue("speed_K1", speed_Kreis[0])
                    console.log("speed_K1: " + speed_Kreis[0])
                }
                
                if (kreis == 1) {
                    radio.sendValue("speed_K2", speed_Kreis[1])
                    console.log("speed_K2: " + speed_Kreis[1])
                }
                
                if (kreis == 2) {
                    radio.sendValue("speed_K3", speed_Kreis[2])
                    console.log("speed_K3: " + speed_Kreis[1])
                }
                
            }
            
        }
        showSpeedLEDs()
    } else if (mode == "dir") {
        console.log("A: Send direction")
        for (kreis = 0; kreis < 3; kreis++) {
            console.log("kreis: " + kreis)
            if (sel_Kreis[kreis]) {
                console.log("sel: " + kreis)
                if (vor_Kreis[kreis] == 0) {
                    vor_Kreis[kreis] = 1
                    led.plot(kreis, 0)
                } else {
                    vor_Kreis[kreis] = 0
                    led.unplot(kreis, 0)
                }
                
                console.log("vor K" + (kreis + 1) + ": " + vor_Kreis[kreis])
                if (kreis == 0) {
                    radio.sendValue("vor_K1", vor_Kreis[0])
                }
                
                if (kreis == 1) {
                    radio.sendValue("vor_K2", vor_Kreis[1])
                }
                
                if (kreis == 2) {
                    radio.sendValue("vor_K3", vor_Kreis[2])
                }
                
            }
            
        }
    } else if (mode == "ea") {
        console.log("A: ea")
        for (kreis = 0; kreis < 3; kreis++) {
            if (sel_Kreis[kreis]) {
                if (ein_Kreis[kreis] == 0) {
                    ein_Kreis[kreis] = 1
                    led.plot(kreis, 1)
                } else {
                    ein_Kreis[kreis] = 0
                    led.unplot(kreis, 1)
                }
                
                console.log("ein K" + (kreis + 1) + ": " + ein_Kreis[kreis])
                if (kreis == 0) {
                    radio.sendValue("ein_K1", ein_Kreis[0])
                }
                
                if (kreis == 1) {
                    radio.sendValue("ein_K2", ein_Kreis[1])
                }
                
                if (kreis == 2) {
                    radio.sendValue("ein_K3", ein_Kreis[2])
                }
                
            }
            
        }
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
    console.log("Radio send")
    radio.sendNumber(2)
    radio.sendValue("name", 0)
    radio.sendString("xxxx")
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
//  -------------------------
//  Daten Empfangen
//  set_led_remote(0)
radio.onReceivedValue(function on_received_value(name: string, value: number) {
    
    console.log("daten empfangen: " + name + " = " + value)
    //  Kreis 1
    let idx = 0
    if (name == "ein_K1") {
        ein_Kreis[idx] = value
    } else if (name == "vor_K1") {
        vor_Kreis[idx] = value
    } else if (name == "u_ist_K1") {
        speed_Kreis[idx] = value
    }
    
    //  Kreis 2
    idx = 1
    if (name == "ein_K2") {
        ein_Kreis[idx] = value
    } else if (name == "vor_K2") {
        vor_Kreis[idx] = value
    } else if (name == "u_ist_K2") {
        speed_Kreis[idx] = value
    }
    
    //  Kreis 3
    idx = 2
    if (name == "ein_K3") {
        ein_Kreis[idx] = value
    } else if (name == "vor_K3") {
        vor_Kreis[idx] = value
    } else if (name == "u_ist_K3") {
        speed_Kreis[idx] = value
    }
    
    showKreisLEDs()
    //  remCtrl
    if (name == "remCtrl") {
        remCtrl = value
    }
    
    if (remCtrl) {
        led.plot(4, 4)
    } else {
        led.unplot(4, 4)
    }
    
    //  led remCtrl blinkt, wenn Daten Empfangen
    for (let i = 0; i < 5; i++) {
        led.plot(4, 4)
        pause(100)
        led.unplot(4, 4)
        pause(100)
    }
})
//  -------------------------
//  Daten Senden
/** 
def sendData():
    global send_request
    if send_request == 1:
        # Daten senden Kreis 1
        i = 0
        serial.write_value("speed", speed_Kreis[i])
        #radio.send_number(1)
        #radio.set_transmit_serial_number(True)
        radio.send_value("speed_K1", speed_Kreis[i])
        # Daten senden Kreis 1
        i = 1
        serial.write_value("speed_K2", speed_Kreis[i])
        #radio.send_number(2)
        #radio.set_transmit_serial_number(True)
        radio.send_value("speed_K2", speed_Kreis[i])
        # Daten senden Kreis 1
        i = 2
        serial.write_value("speed_K3", speed_Kreis[i])
        #radio.send_number(2)
        #radio.set_transmit_serial_number(True)
        radio.send_value("speed_K3", speed_Kreis[i])

        send_request = 0

 */
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
        console.log("i: " + i + " sel_Kreis" + i + "  sel " + sel)
        if (sel) {
            led.plot(3, i)
        } else {
            led.unplot(3, i)
        }
        
        i += 1
    }
}

//  -------------------------
function showSpeedLED(kreis: number, speed: number) {
    let br_max = 50
    let br1 = 0
    let br2 = 0
    let br3 = 0
    if (speed >= 0) {
        br1 = Math.min(speed / speedlim2, 1) * br_max
        led.plotBrightness(kreis, 2, br1)
        led.plotBrightness(kreis, 3, 0)
        led.plotBrightness(kreis, 4, 0)
        console.log("K" + (kreis + 1) + " br1: " + br1)
    }
    
    if (speed > speedlim1) {
        br2 = Math.min((speed - speedlim1) / (speedlim2 - speedlim1), 1) * br_max
        led.plotBrightness(kreis, 2, br_max)
        led.plotBrightness(kreis, 3, br2)
        led.plotBrightness(kreis, 4, 0)
        console.log("K" + (kreis + 1) + " br2: " + br2)
    }
    
    if (speed > speedlim2) {
        br3 = Math.min((speed - speedlim2) / (100 - speedlim2), 1) * br_max
        led.plotBrightness(kreis, 2, br_max)
        led.plotBrightness(kreis, 3, br_max)
        led.plotBrightness(kreis, 4, br3)
        console.log("K" + (kreis + 1) + " br3: " + br3)
    }
    
}

function showSpeedLEDs() {
    for (let kreis = 0; kreis < 3; kreis++) {
        showSpeedLED(kreis, speed_Kreis[kreis])
        /** 
        if speed_Kreis[kreis] > speedlim1:
            led.plot_brightness(kreis, 2, 25)
        else:
            led.unplot(kreis, 2)
        if speed_Kreis[kreis] > speedlim2:
            led.plot(kreis, 3)
        else:
            led.unplot(kreis, 3)
        if speed_Kreis[kreis] > speedlim3:
            led.plot(kreis, 4)
        else:
            led.unplot(kreis, 4)

 */
    }
}

//  -------------------------
function showKreisLEDs() {
    let kreis: number;
    //  dir, direction
    for (kreis = 0; kreis < 3; kreis++) {
        if (vor_Kreis[kreis] == 1) {
            led.plot(kreis, 0)
        } else {
            led.unplot(kreis, 0)
        }
        
    }
    //  ea, Ein/Aus
    for (kreis = 0; kreis < 3; kreis++) {
        if (ein_Kreis[kreis] == 1) {
            led.plot(kreis, 1)
        } else {
            led.unplot(kreis, 1)
        }
        
    }
}

//  -------------------------
function showStatus() {
    console.log("----------")
    console.log("showStatus")
    console.log("remCtrl" + remCtrl)
    for (let kreis = 0; kreis < 3; kreis++) {
        console.log("sel_Kreis" + (kreis + 1) + ": " + sel_Kreis[kreis])
        console.log("vor_Kreis" + (kreis + 1) + ": " + vor_Kreis[kreis])
        console.log("ein_Kreis" + (kreis + 1) + ": " + ein_Kreis[kreis])
        console.log("speed_Kreis" + (kreis + 1) + ": " + speed_Kreis[kreis])
    }
    console.log("speedlim1: " + speedlim1)
    console.log("speedlim2: " + speedlim2)
    console.log("receive: " + receive)
    console.log("mode: " + mode)
}

function setSpeed(speed: number): number {
    
    let step = 10
    if (speed_up) {
        if (speed < 100) {
            speed += step
            if (speed > 100) {
                speed = 100
            }
            
        } else {
            speed_up = 0
        }
        
    } else if (speed > 0) {
        speed -= step
        if (speed < 0) {
            speed = 0
        }
        
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
// showSpeedLEDs()
// showRichtung()
basic.forever(function on_forever() {
    let changed = 0
    if (changed) {
        // setSpeed()
        showSpeedLEDs()
        setRichtung()
    } else {
        // showRichtung()
        // sendData()
        
    }
    
})
