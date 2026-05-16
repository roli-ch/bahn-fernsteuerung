# Programm name:    bahn-fernsteuerung
# Sender mit Rotation
# V1 Basis  16.5.2026
#
# LED Anzeigen: (x,y)
# vor_K1    0,0         Senden
# vor_K1    1,0         Senden
# vor_K1    2,0         Senden
# ein_K1    0,1         Senden
# ein_K1    1,1         Senden
# ein_K1    2,1         Senden
# Speed K1  0,2 - 0,4   Senden
# Speed K2  1,2 - 1,4   Senden
# Speed K3  2,2 - 2,4   Senden
# Remote    4,4         Empfangen
# sel_K1    3,0
# sel_K2    3,1
# sel_K2    3,2
# sel_speed 3,4
# change selection      Button A
# stop                  Button B
# select                Button A&B

# Konstanten
# =========================
speedlim1 = 30
speedlim2 = 60
speedlim3 = 90
#
# Init
# =========================
radio.set_group(1)
radio.set_transmit_power(7)

remCtrl = 0     # Gegenstation ist für empfang freigegeben azeige led(4.4)
vor_Kreis = [0, 0, 0]
ein_Kreis = [0, 0, 0]
sel_Kreis = [0, 0, 0, 0, 0]
speed_Kreis = [0, 0, 0]
speed_up = 1
receive = 0

mode = "sel"   # sel / speed / dir / ea

# enum Mode {"sel", "speed"}        // JavaScript

show_interval = 0
send_request = 0

basic.show_leds("""
    . . . . .
    . # # # .
    . # . # .
    . # # # .
    . . . . .
    """)
basic.pause(1000)
basic.clear_screen()

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
        print("A: speed")
        for kreis in range(0,3):
            if sel_Kreis[kreis]:
                speed_Kreis[kreis] = setSpeed(speed_Kreis[kreis])
                print("speed K"+(kreis+1)+": "+speed_Kreis[kreis])
        showSpeedLEDs()
        radio.send_value("speed_K1", speed_Kreis[0])
        radio.send_value("speed_K2", speed_Kreis[1])
        radio.send_value("speed_K3", speed_Kreis[2])
    elif mode == "dir":
        print("A: dir")
        for kreis in range(0,3):
            print("kreis: "+kreis)

            if sel_Kreis[kreis]:
                print("sel: "+kreis)
                if vor_Kreis[kreis] == 0:
                    vor_Kreis[kreis] = 1
                    led.plot(kreis,0)
                else:
                    vor_Kreis[kreis] = 0
                    led.unplot(kreis,0)
                print("vor K"+(kreis+1)+": "+vor_Kreis[kreis])
        radio.send_value("vor_K1", vor_Kreis[0])
        radio.send_value("vor_K2", vor_Kreis[1])
        radio.send_value("vor_K3", vor_Kreis[2])
    elif mode == "ea":
        print("A: ea")
        for kreis in range(0,3):
            if sel_Kreis[kreis]:
                if ein_Kreis[kreis] == 0:
                    ein_Kreis[kreis] = 1
                    led.plot(kreis,1)
                else:
                    ein_Kreis[kreis] = 0
                    led.unplot(kreis,1)
                print("ein K"+(kreis+1)+": "+ein_Kreis[kreis])
        radio.send_value("ein_K1", ein_Kreis[0])
        radio.send_value("ein_K2", ein_Kreis[1])
        radio.send_value("ein_K3", ein_Kreis[2])
    else:
        print("mode Fehler")
input.on_button_pressed(Button.A, on_button_pressed_a)

# B: select / speed -
# -------------------------
def on_button_pressed_b():
    print("B:")
    #led.plot(4,4)
    #led.unplot(0,0)
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

#
# Funktionen
# =========================
#
# -------------------------
def kreisSelection():
    global sel_Kreis

    print("kreisSelection")
    if sel_Kreis[0]:
        sel_Kreis[0] = 0
        sel_Kreis[1] = 1
    elif sel_Kreis[1]:
        sel_Kreis[1] = 0
        sel_Kreis[2] = 1
    elif sel_Kreis[2]:
        sel_Kreis[2] = 0
        sel_Kreis[3] = 1
    elif sel_Kreis[3]:
        sel_Kreis[3] = 0
        sel_Kreis[4] = 1
    elif sel_Kreis[4]:
        sel_Kreis[4] = 0
        sel_Kreis[0] = 1
    else:
        sel_Kreis[0] = 1
    print("Selection: "+sel_Kreis[0]+sel_Kreis[1]+sel_Kreis[2]+sel_Kreis[3]+sel_Kreis[4])
    showSelLED()

# -------------------------
def showSelLED():
    print("showSelLED")
    i = 0
    for sel in sel_Kreis[:]:
        #print("i: "+i+" sel_Kreis"+i+ "  sel "+sel)
        if sel:
            led.plot(3, i)
        else:
            led.unplot(3, i)
        i += 1

# -------------------------
def showSpeedLEDs():
    for kreis in range(0,3):
        if speed_Kreis[kreis] > speedlim1:
            led.plot(kreis, 2)
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

# -------------------------
def showKreisLEDs():
    # dir, direction
    for kreis in range(0,3):
        if vor_Kreis[kreis] == 1:
            led.plot(kreis,0)
        else:
            led.unplot(kreis,0)
    # ea, Ein/Aus
    for kreis in range(0, 3):
        if ein_Kreis[kreis] == 1:
            led.plot(kreis,1)
        else:
            led.unplot(kreis,1)
        
# -------------------------
def showStatus():
    print("----------")
    print("showStatus")
    print("remCtrl"+remCtrl)
    for kreis in range(0,3):
        print("sel_Kreis"+(kreis+1)+": "+sel_Kreis[kreis])
        print("vor_Kreis"+(kreis+1)+": "+vor_Kreis[kreis])
        print("ein_Kreis"+(kreis+1)+": "+ein_Kreis[kreis])
        print("speed_Kreis"+(kreis+1)+": "+speed_Kreis[kreis])
    print("speedlim1: "+speedlim1)
    print("speedlim2: "+speedlim2)
    print("speedlim3: "+speedlim3)
    print("receive: "+receive)
    print("mode: "+mode)
    
# -------------------------
# Daten Empfangen
# set_led_remote(0)

def on_received_value(name, value):
    global remCtrl
    print("daten empfangen: " +name+ " = "+value)
    
    # Kreis 1
    idx = 0
    if name == "ein_K1":
        ein_Kreis[idx] = value
    elif name == "vor_K1":
        vor_Kreis[idx] = value
    elif name == "u_ist_K1":
        speed_Kreis[idx] = value
    # Kreis 2
    idx = 1
    if name == "ein_K2":
        ein_Kreis[idx] = value
    elif name == "vor_K2":
        vor_Kreis[idx] = value
    elif name == "u_ist_K2":
        speed_Kreis[idx] = value
    # Kreis 3
    idx = 2
    if name == "ein_K3":
        ein_Kreis[idx] = value
    elif name == "vor_K3":
        vor_Kreis[idx] = value
    elif name == "u_ist_K3":
        speed_Kreis[idx] = value
        
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

def setSpeed(speed):
    global speed_Kreis, speed_up
    step = 10
    if speed_up:
        if speed < 100:
            speed += step
        else:
            speed_up = 0
    else:
        if speed > 0:
            speed -= step
        else:
            speed_up = 1
    print("Speed : "+speed+" up= "+speed_up)
    return speed

def setRichtung():
    if vor_Kreis:
        richtungDir = 1
    else:
        richtungDir = -1



# Time Loop 1s
# =====================================
def on_every_interval():
    if show_interval:
        i = 0
        print("===========")
        print("interval 1s; Zeit: " + ("" + str(control.millis() / 1000)))
        print("speed: " + ("" + str(speed_Kreis[i] )))
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
        sendData()
    else:
        showSpeedLEDs()
        #showRichtung()
basic.forever(on_forever)
