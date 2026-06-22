//  Programm name:    bahn-fernsteuerung
//  Sender mit Rotation
//  V1 Basis  20.5.2026
//  V2 22.6.2026
// 
//  LED Anzeigen: (x,y)
//  vorK1    0,0         Senden
//  vorK1    1,0         Senden
//  vorK1    2,0         Senden
//  einK1    0,1         Senden
//  einK1    1,1         Senden
//  einK1    2,1         Senden
//  Speed K1  0,2 - 0,4   Senden
//  Speed K2  1,2 - 1,4   Senden
//  Speed K3  2,2 - 2,4   Senden
//  Remote    4,4         Empfangen
//  selK1    3,0
//  selK2    3,1
//  selK2    3,2
//  sel_speed 3,4
//  change selection      Button A
//  stop                  Button B
//  select                Button A&B
/** 
Bedienung:
    Button B: x 

        sel sp  vr  ea  rem 
mode    0,0 1,0 2,0 3,0 3,0
        K1  K2  K3  
sel     0,1 1,1 2,1 3,1 3,1
        vr  ea  >30 >60 >90
K3      2,0 2,1 2,2 2,3 2,4
K2      1,0 1,1 1,2 1,3 1,4
K1      0,0 0,1 0,2 0,3 0,4
    
    Button A: sel, speed, vr, ea 

    Button AB: mode: select/speed/dir/ea

 */
//  Konstanten
//  =========================
let speedLim1 = 40
let speedLim2 = 70
// 
//  Init
//  =========================
radio.on()
radio.setGroup(1)
radio.setTransmitPower(7)
let remCtrl = 0
//  Gegenstation ist für empfang freigegeben azeige led(4.4)
let vorKreis = [0, 0, 0]
let einKreis = [0, 0, 0]
let selKreis = [0, 0, 0]
let speedKreis = [0, 0, 0]
let speedUp = 1
let receive = 0
let mode = "sel"
//  sel / speed / dir / ea
//  enum Mode {"sel", "speed"}        // JavaScript
let showInterval = 0
let sendRequest = 0
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
            if (selKreis[kreis]) {
                speedKreis[kreis] = setSpeed(speedKreis[kreis])
                // print("speed K"+(kreis+1)+": "+speedKreis[kreis])
                if (kreis == 0) {
                    radio.sendValue("speedK1", speedKreis[0])
                    console.log("speedK1: " + speedKreis[0])
                }
                
                if (kreis == 1) {
                    radio.sendValue("speedK2", speedKreis[1])
                    console.log("speedK2: " + speedKreis[1])
                }
                
                if (kreis == 2) {
                    radio.sendValue("speedK3", speedKreis[2])
                    console.log("speedK3: " + speedKreis[1])
                }
                
            }
            
        }
        showSpeedLEDs()
    } else if (mode == "dir") {
        console.log("A: Send direction")
        for (kreis = 0; kreis < 3; kreis++) {
            // print("kreis: "+kreis)
            if (selKreis[kreis]) {
                console.log("sel: " + kreis)
                if (vorKreis[kreis] == 0) {
                    vorKreis[kreis] = 1
                    led.plot(kreis, 0)
                } else {
                    vorKreis[kreis] = 0
                    led.unplot(kreis, 0)
                }
                
                console.log("vorK" + (kreis + 1) + ": " + vorKreis[kreis])
                if (kreis == 0) {
                    radio.sendValue("vorK1", vorKreis[0])
                }
                
                if (kreis == 1) {
                    radio.sendValue("vorK2", vorKreis[1])
                }
                
                if (kreis == 2) {
                    radio.sendValue("vorK3", vorKreis[2])
                }
                
            }
            
        }
    } else if (mode == "ea") {
        console.log("A: ea")
        for (kreis = 0; kreis < 3; kreis++) {
            if (selKreis[kreis]) {
                if (einKreis[kreis] == 0) {
                    einKreis[kreis] = 1
                    led.plot(kreis, 1)
                } else {
                    einKreis[kreis] = 0
                    led.unplot(kreis, 1)
                }
                
                console.log("einK" + (kreis + 1) + ": " + einKreis[kreis])
                if (kreis == 0) {
                    radio.sendValue("einK1", einKreis[0])
                }
                
                if (kreis == 1) {
                    radio.sendValue("einK2", einKreis[1])
                }
                
                if (kreis == 2) {
                    radio.sendValue("einK3", einKreis[2])
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
    if (name == "einK1") {
        einKreis[idx] = value
    } else if (name == "vorK1") {
        vorKreis[idx] = value
    } else if (name == "uIstK1") {
        speedKreis[idx] = value
    }
    
    //  Kreis 2
    idx = 1
    if (name == "einK2") {
        einKreis[idx] = value
    } else if (name == "vorK2") {
        vorKreis[idx] = value
    } else if (name == "uIstK2") {
        speedKreis[idx] = value
    }
    
    //  Kreis 3
    idx = 2
    if (name == "einK3") {
        einKreis[idx] = value
    } else if (name == "vorK3") {
        vorKreis[idx] = value
    } else if (name == "uIstK3") {
        speedKreis[idx] = value
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
    global sendRequest
    if sendRequest == 1:
        # Daten senden Kreis 1
        i = 0
        serial.write_value("speed", speedKreis[i])
        #radio.send_number(1)
        #radio.set_transmit_serial_number(True)
        radio.send_value("speedK1", speedKreis[i])
        # Daten senden Kreis 1
        i = 1
        serial.write_value("speedK2", speedKreis[i])
        #radio.send_number(2)
        #radio.set_transmit_serial_number(True)
        radio.send_value("speedK2", speedKreis[i])
        # Daten senden Kreis 1
        i = 2
        serial.write_value("speedK3", speedKreis[i])
        #radio.send_number(2)
        #radio.set_transmit_serial_number(True)
        radio.send_value("speedK3", speedKreis[i])

        sendRequest = 0

 */
// 
//  Funktionen
//  =========================
// 
//  -------------------------
function kreisSelection() {
    
    console.log("kreisSelection")
    if (selKreis[0]) {
        selKreis[0] = 0
        selKreis[1] = 1
    } else if (selKreis[1]) {
        selKreis[1] = 0
        selKreis[2] = 1
    } else if (selKreis[2]) {
        selKreis[2] = 0
        selKreis[0] = 1
    } else {
        selKreis[0] = 1
    }
    
    console.log("Selection: " + selKreis[0] + selKreis[1] + selKreis[2])
    showSelLED()
}

//  -------------------------
function showSelLED() {
    console.log("showSelLED")
    let i = 0
    for (let sel of selKreis.slice(0)) {
        console.log("i: " + i + " selKreis" + i + "  sel " + sel)
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
        br1 = Math.min(speed / speedLim2, 1) * br_max
        led.plotBrightness(kreis, 2, br1)
        led.plotBrightness(kreis, 3, 0)
        led.plotBrightness(kreis, 4, 0)
        console.log("K" + (kreis + 1) + " br1: " + br1)
    }
    
    if (speed > speedLim1) {
        br2 = Math.min((speed - speedLim1) / (speedLim2 - speedLim1), 1) * br_max
        led.plotBrightness(kreis, 2, br_max)
        led.plotBrightness(kreis, 3, br2)
        led.plotBrightness(kreis, 4, 0)
        console.log("K" + (kreis + 1) + " br2: " + br2)
    }
    
    if (speed > speedLim2) {
        br3 = Math.min((speed - speedLim2) / (100 - speedLim2), 1) * br_max
        led.plotBrightness(kreis, 2, br_max)
        led.plotBrightness(kreis, 3, br_max)
        led.plotBrightness(kreis, 4, br3)
        console.log("K" + (kreis + 1) + " br3: " + br3)
    }
    
}

function showSpeedLEDs() {
    for (let kreis = 0; kreis < 3; kreis++) {
        showSpeedLED(kreis, speedKreis[kreis])
        /** 
        if speedKreis[kreis] > speedLim1:
            led.plot_brightness(kreis, 2, 25)
        else:
            led.unplot(kreis, 2)
        if speedKreis[kreis] > speedLim2:
            led.plot(kreis, 3)
        else:
            led.unplot(kreis, 3)
        if speedKreis[kreis] > speedLim3:
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
        if (vorKreis[kreis] == 1) {
            led.plot(kreis, 0)
        } else {
            led.unplot(kreis, 0)
        }
        
    }
    //  ea, Ein/Aus
    for (kreis = 0; kreis < 3; kreis++) {
        if (einKreis[kreis] == 1) {
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
        console.log("selKreis" + (kreis + 1) + ": " + selKreis[kreis])
        console.log("vorKreis" + (kreis + 1) + ": " + vorKreis[kreis])
        console.log("einKreis" + (kreis + 1) + ": " + einKreis[kreis])
        console.log("speedKreis" + (kreis + 1) + ": " + speedKreis[kreis])
    }
    console.log("speedLim1: " + speedLim1)
    console.log("speedLim2: " + speedLim2)
    console.log("receive: " + receive)
    console.log("mode: " + mode)
}

function setSpeed(speed: number): number {
    
    let step = 10
    if (speedUp) {
        if (speed < 100) {
            speed += step
            if (speed > 100) {
                speed = 100
            }
            
        } else {
            speedUp = 0
        }
        
    } else if (speed > 0) {
        speed -= step
        if (speed < 0) {
            speed = 0
        }
        
    } else {
        speedUp = 1
    }
    
    console.log("Speed : " + speed + " up= " + speedUp)
    return speed
}

function setRichtung() {
    let richtungDir: number;
    if (vorKreis) {
        richtungDir = 1
    } else {
        richtungDir = -1
    }
    
}

//  Time Loop 1s
//  =====================================
loops.everyInterval(1000, function on_every_interval() {
    let i: number;
    if (showInterval) {
        i = 0
        console.log("===========")
        console.log("interval 1s; Zeit: " + ("" + ("" + control.millis() / 1000)))
        console.log("speed: " + ("" + ("" + speedKreis[i])))
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
