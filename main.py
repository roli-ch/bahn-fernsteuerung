# Programm name:    bahn-fernsteuerung
# Sender mit Rotation
# V1 Basis  13.5.2026
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
# select                Button A
# stop                  Button B
# 
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

remCtrl = 0
vor_Kreis = [1, 0,1]
ein_Kreis = [0, 0, 0]
sel_Kreis = [0, 0, 0, 0, 0]
speed_Kreis = [20, 40, 80]
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
        if sel_Kreis[0]:
            speed_Kreis[0] = setSpeed(speed_Kreis[0])
            showSpeed(0)
            print("speed K1: "+speed_Kreis[0])
        if sel_Kreis[1]:
            speed_Kreis[1] = setSpeed(speed_Kreis[1])
            showSpeed(1)
            print("speed K2: "+speed_Kreis[1])
        if sel_Kreis[2]:
            speed_Kreis[2] = setSpeed(speed_Kreis[2])
            showSpeed(2)
            print("speed K3: "+speed_Kreis[2])

    elif mode == "dir":
        print("A: dir")
    elif mode == "ea":
        print("A: ea")
    else:
        print("mode Fehler")
    #showStatus()
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
def showStatus():
    print("----------")
    print("showStatus")
    print("remCtrl"+remCtrl)
    i = 0
    for on1 in vor_Kreis[:]:
        #print("on: "+on+" i1: "+ i1)
        print("vor_Kreis"+(i+1)+": "+on1)
        i += 1
    i = 0
    for on2 in ein_Kreis[:]:
        print("ein_Kreis "+(i+1)+" "+on2)
        i += 1
    i = 0
    for on3 in sel_Kreis[:]:
        print("sel_Kreis "+(i+1)+" "+on3)
        i += 1
    i = 0
    for on4 in speed_Kreis[:]:
        print("speed_Kreis "+(i+1)+" "+on4)
        i += 1

    print("speedlim1: "+speedlim1)
    print("speedlim2: "+speedlim2)
    print("speedlim3: "+speedlim3)
    print("receive: "+receive)
    print("mode: "+mode)
    
# -------------------------
def showRichtung():
    for i in vor_Kreis[:]:
        if vor_Kreis[i]:
            led.plot(vor_Kreis[i], 0)
        else:
            led.unplot(vor_Kreis[i], 0)

# -------------------------
# Daten Senden
def sendData():
    global send_request
    # trigger = 1
    if trigger == 1:
        # Daten anzeigen
        i = 0
        serial.write_value("speed", speed_Kreis[i])
        # Senden
        radio.send_number(1)
        radio.set_transmit_serial_number(True)
        radio.send_value("speed", speed_Kreis[i])
        trigger = 0


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
# Daten Empfangen
# set_led_remote(0)

def on_received_value(name, value):
    global remCtrl
    serial.write_value("daten empfangen: " + name, value)
    if name == "remCtrl":
        remCtrl = value
    # set_led_remote(1)
    if remCtrl:
        pass
    else:
        pass
radio.on_received_value(on_received_value)

def showSpeed(kreis):
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
        showSpeed(0)
        setRichtung()
        showRichtung()
        sendData()
    else:
        showSpeed(0)
        showRichtung()
basic.forever(on_forever)
