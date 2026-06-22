# Programm name:    bahn-fernsteuerung
# Sender mit Rotation
# V1 Basis  20.5.2026
# V2 22.6.2026
#
# LED Anzeigen: (x,y)
# vorK1    0,0         Senden
# vorK1    1,0         Senden
# vorK1    2,0         Senden
# einK1    0,1         Senden
# einK1    1,1         Senden
# einK1    2,1         Senden
# Speed K1  0,2 - 0,4   Senden
# Speed K2  1,2 - 1,4   Senden
# Speed K3  2,2 - 2,4   Senden
# Remote    4,4         Empfangen
# selK1    3,0
# selK2    3,1
# selK2    3,2
# sel_speed 3,4
# change selection      Button A
# stop                  Button B
# select                Button A&B
"""
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
"""

# Konstanten
# =========================
speedLim1 = 40
speedLim2 = 70
#
# Init
# =========================
radio.on()
radio.set_group(1)
radio.set_transmit_power(7)

remCtrl = 0     # Gegenstation ist für empfang freigegeben azeige led(4.4)
vorKreis = [0, 0, 0]
einKreis = [0, 0, 0]
selKreis = [0, 0, 0]
speedKreis = [0, 0, 0]
speedUp = 1
receive = 0

mode = "sel"   # sel / speed / dir / ea

# enum Mode {"sel", "speed"}        // JavaScript

showInterval = 0
sendRequest = 0

basic.show_leds("""
    . . . . .
    . # # # .
    . # . # .
    . # # # .
    . . . . .
    """)
basic.pause(1000)
basic.clear_screen()

kreisSelection()

print("Init")
#showStatus()
#
# Buttons
# =====================================
# A: select / speed +
def on_button_pressed_a():
    #led.plot(0,0)
    #led.unplot(4,4)
    if mode == "sel":
        print("A: select")
        kreisSelection()
    elif mode == "speed":
        print("A: Send speed")
        for kreis in range(0,3):
            if selKreis[kreis]:
                speedKreis[kreis] = setSpeed(speedKreis[kreis])
                #print("speed K"+(kreis+1)+": "+speedKreis[kreis])
                if kreis == 0:
                    radio.send_value("speedK1", speedKreis[0])
                    print("speedK1: "+ speedKreis[0])

                if kreis == 1:
                    radio.send_value("speedK2", speedKreis[1])
                    print("speedK2: "+ speedKreis[1])
                if kreis == 2:
                    radio.send_value("speedK3", speedKreis[2])
                    print("speedK3: "+speedKreis[1])
        showSpeedLEDs()
    elif mode == "dir":
        print("A: Send direction")    
        for kreis in range(0,3):
            print("kreis: "+kreis)

            if selKreis[kreis]:
                print("sel: "+kreis)
                if vorKreis[kreis] == 0:
                    vorKreis[kreis] = 1
                    led.plot(kreis,0)
                else:
                    vorKreis[kreis] = 0
                    led.unplot(kreis,0)
                print("vor K"+(kreis+1)+": "+vorKreis[kreis])
                if kreis == 0:
                    radio.send_value("vorK1", vorKreis[0])
                if kreis == 1:
                    radio.send_value("vorK2", vorKreis[1])
                if kreis == 2:
                    radio.send_value("vorK3", vorKreis[2])

    elif mode == "ea":
        print("A: ea")
        for kreis in range(0,3):
            if selKreis[kreis]:
                if einKreis[kreis] == 0:
                    einKreis[kreis] = 1
                    led.plot(kreis,1)
                else:
                    einKreis[kreis] = 0
                    led.unplot(kreis,1)
                print("ein K"+(kreis+1)+": "+einKreis[kreis])
                if kreis == 0:
                    radio.send_value("einK1", einKreis[0])
                if kreis == 1:
                    radio.send_value("einK2", einKreis[1])
                if kreis == 2:
                    radio.send_value("einK3", einKreis[2])
    else:
        print("mode Fehler")
input.on_button_pressed(Button.A, on_button_pressed_a)

# B: select / speed -
# -------------------------
def on_button_pressed_b():
    print("B:")
    #led.plot(4,4)
    #led.unplot(0,0)
    print("Radio send")
    radio.send_number(2)
    radio.send_value("name", 0)
    radio.send_string("xxxx")
    showStatus()
input.on_button_pressed(Button.B, on_button_pressed_b)

# A&B: Umschalten mode select/speed/dir/ea
# -------------------------
def on_button_pressed_ab():
    global mode
    print("AB: select/speed/dir/ea")
    if mode == "sel":
        mode = "speed"
        led.plot(4,1)
        led.unplot(4,0)
    elif mode == "speed":
        mode = "dir"
        led.plot(4,2)
        led.unplot(4,1)
    elif mode == "dir":
        mode = "ea"
        led.plot(4,3)
        led.unplot(4,2)
    elif mode == "ea":
        mode = "sel"
        led.plot(4,0)
        led.unplot(4,3)
    else:
        print("fehler")
    print(mode)
    #showStatus()

input.on_button_pressed(Button.AB, on_button_pressed_ab)

# -------------------------
# Daten Empfangen
# set_led_remote(0)

def on_received_value(name, value):
    global remCtrl
    print("daten empfangen: " +name+ " = "+value)
    
    # Kreis 1
    idx = 0
    if name == "einK1":
        einKreis[idx] = value
    elif name == "vorK1":
        vorKreis[idx] = value
    elif name == "uIstK1":
        speedKreis[idx] = value
    # Kreis 2
    idx = 1
    if name == "einK2":
        einKreis[idx] = value
    elif name == "vorK2":
        vorKreis[idx] = value
    elif name == "uIstK2":
        speedKreis[idx] = value
    # Kreis 3
    idx = 2
    if name == "einK3":
        einKreis[idx] = value
    elif name == "vorK3":
        vorKreis[idx] = value
    elif name == "uIstK3":
        speedKreis[idx] = value
        
    showKreisLEDs()
    # remCtrl
    if name == "remCtrl":
        remCtrl = value
    if remCtrl:
        led.plot(4, 4)
    else:
        led.unplot(4, 4)
    # led remCtrl blinkt, wenn Daten Empfangen
    for i in range(0,5):
        led.plot(4, 4)
        pause(100)
        led.unplot(4, 4)
        pause(100)

radio.on_received_value(on_received_value)

# -------------------------
# Daten Senden
"""
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
"""

#
# Funktionen
# =========================
#
# -------------------------
def kreisSelection():
    global selKreis
    print("kreisSelection")
    if selKreis[0]:
        selKreis[0] = 0
        selKreis[1] = 1
    elif selKreis[1]:
        selKreis[1] = 0
        selKreis[2] = 1
    elif selKreis[2]:
        selKreis[2] = 0
        selKreis[0] = 1
    else:
        selKreis[0] = 1
    print("Selection: "+selKreis[0]+selKreis[1]+selKreis[2])
    showSelLED()

# -------------------------
def showSelLED():
    print("showSelLED")
    i = 0
    for sel in selKreis[:]:
        print("i: "+i+" selKreis"+i+ "  sel "+sel)
        if sel:
            led.plot(3, i)
        else:
            led.unplot(3, i)
        i += 1

# -------------------------
def showSpeedLED(kreis, speed):
    br_max = 50
    br1 = 0
    br2 = 0
    br3 = 0
    if speed >= 0:
        br1 = min((speed / speedLim2),1) * br_max
        led.plot_brightness(kreis, 2, br1)
        led.plot_brightness(kreis, 3, 0)
        led.plot_brightness(kreis, 4, 0)
        print("K"+(kreis+1)+" br1: "+br1)

    if speed > speedLim1:
        br2 = min((speed-speedLim1) / (speedLim2-speedLim1),1) * br_max
        led.plot_brightness(kreis, 2, br_max)
        led.plot_brightness(kreis, 3, br2)
        led.plot_brightness(kreis, 4, 0)
        print("K"+(kreis+1)+" br2: "+br2)

    if speed > speedLim2:
        br3 = min((speed-speedLim2) / (100-speedLim2),1) * br_max
        led.plot_brightness(kreis, 2, br_max)
        led.plot_brightness(kreis, 3, br_max)
        led.plot_brightness(kreis, 4, br3)
        print("K"+(kreis+1)+" br3: "+br3)

def showSpeedLEDs():
    for kreis in range(0,3):
        showSpeedLED(kreis, speedKreis[kreis])
        """
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
"""
# -------------------------
def showKreisLEDs():
    # dir, direction
    for kreis in range(0,3):
        if vorKreis[kreis] == 1:
            led.plot(kreis,0)
        else:
            led.unplot(kreis,0)
    # ea, Ein/Aus
    for kreis in range(0, 3):
        if einKreis[kreis] == 1:
            led.plot(kreis,1)
        else:
            led.unplot(kreis,1)
        
# -------------------------
def showStatus():
    print("----------")
    print("showStatus")
    print("remCtrl"+remCtrl)
    for kreis in range(0,3):
        print("selKreis"+(kreis+1)+": "+selKreis[kreis])
        print("vorKreis"+(kreis+1)+": "+vorKreis[kreis])
        print("einKreis"+(kreis+1)+": "+einKreis[kreis])
        print("speedKreis"+(kreis+1)+": "+speedKreis[kreis])
    print("speedLim1: "+speedLim1)
    print("speedLim2: "+speedLim2)
    print("receive: "+receive)
    print("mode: "+mode)
    
def setSpeed(speed):
    global speedKreis, speedUp
    step = 10
    if speedUp:
        if speed < 100:
            speed += step
            if speed > 100:
                speed =100
        else:
            speedUp = 0
    else:
        if speed > 0:
            speed -= step
            if speed < 0:
                speed = 0
        else:
            speedUp = 1
    print("Speed : "+speed+" up= "+speedUp)
    return speed

def setRichtung():
    if vorKreis:
        richtungDir = 1
    else:
        richtungDir = -1



# Time Loop 1s
# =====================================
def on_every_interval():
    if showInterval:
        i = 0
        print("===========")
        print("interval 1s; Zeit: " + ("" + str(control.millis() / 1000)))
        print("speed: " + ("" + str(speedKreis[i] )))
loops.every_interval(1000, on_every_interval)

# Main Loop
# =====================================
def on_forever():
    changed = 0
    if changed:
        #setSpeed()
        showSpeedLEDs()
        setRichtung()
        #showRichtung()
        #sendData()
    else:
        pass
        #showSpeedLEDs()
        #showRichtung()
basic.forever(on_forever)
