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
speedAbs = 0
speedRoh = 0
sel_K3 = 0
sel_K2 = 0
sel_K1 = 0
pos3: List[number] = []
vor_K1 = 0
mode = ""
speedlim2 = 0
speedlim1 = 0
speed = 0
receive = 0
vor_K3 = 0
ein_K3 = 0
vor_K2 = 0
ein_K2 = 0
ein_K32 = 0
ein_K22 = 0
ein_K12 = 0

ein_K1 = 1
mode = "sel"
# enum Mode {"sel", "speed"}        // JavaScript
show_interval = 0

basic.show_leds("""
    . . . . .
    . # # # .
    . # . # .
    . # # # .
    . . . . .
    """)
basic.pause(1000)
basic.clear_screen()
#
#
# Funktionen
# =========================
# 
# -------------------------
def showRichtung():
    if vor_K1:
        led.plot(2, 2)
        led.plot(3, 2)
        led.plot(4, 2)
    else:
        led.unplot(4, 2)
        led.plot(3, 2)

# -------------------------
def set_led_stop(on3: number):
    global pos3
    pos3 = [2, 2]
    if True:
        led.plot(pos3[0], pos3[1])
    else:
        led.unplot(pos3[0], pos3[1])

# -------------------------
# Daten Senden
def sendData():
    # trigger = 1
    if trigger == 1:
        # Daten anzeigen
        serial.write_value("speed", speed)
        # Senden
        radio.send_number(1)
        radio.set_transmit_serial_number(True)
        radio.send_value("speed", speed)
        trigger = 0

# Buttons
# =====================================
# A: select / speed +
def on_button_pressed_a():
    global sel_K1, sel_K2, sel_K3
    if mode == "sel":
        print("A: select")
        if sel_K1:
            sel_K1 = 0
            sel_K2 = 1
        elif sel_K2:
            sel_K2 = 0
            sel_K3 = 1
        elif sel_K3:
            sel_K3 = 0
            sel_K1 = 1
input.on_button_pressed(Button.A, on_button_pressed_a)

# B: select / speed -
# -------------------------
def on_button_pressed_b():
    print("B: stop")
input.on_button_pressed(Button.B, on_button_pressed_b)

# A&B: Umschalten select/speed
# -------------------------
def on_button_pressed_ab():
    print("AB: select/speed")
input.on_button_pressed(Button.AB, on_button_pressed_ab)


def setSpeed():
    global speedRoh, speed, speedAbs
    speedRoh = input.rotation(Rotation.PITCH) * -1
    if speedRoh > 0:
        speedDir = 1
    else:
        speedDir = -1
    # speed = Math.constrain(abs(speedRoh) - s0, 0, 100)
    # speed = min(100, speed / 2 * 10) * speedDir
    speed = min(100, abs(speedRoh * 1)) * speedDir
    speedAbs = abs(speed)

def setRichtung():
    if vor_K1:
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

def showSpeed():
    if speed > speedlim1:
        led.plot(2, 0)
        led.plot(2, 1)
        led.plot(2, 2)
    else:
        led.unplot(2, 0)
        led.plot(2, 1)
    if speed > speedlim2:
        led.plot(2, 2)
        led.plot(2, 3)
        led.plot(2, 4)
    else:
        led.plot(2, 3)
        led.unplot(2, 4)


def set_keis_ein(kreisNr: any, on: any):
    pos = [0, 0]
    if on:
        led.plot(pos[0], pos[1])
    else:
        led.unplot(pos[0], pos[1])
def set_led_fahren(on2: any):
    pos2 = [0, 4]
    if on2:
        led.plot(pos2[0], pos2[1])
    else:
        led.unplot(pos2[0], pos2[1])
def set_led_licht(on4: any):
    pos4 = [4, 4]
    if on4:
        led.plot(pos4[0], pos4[1])
    else:
        led.unplot(pos4[0], pos4[1])

# Time Loop 1s
# =====================================
def on_every_interval():
    if show_interval:
        print("===========")
        print("interval 1s; Zeit: " + ("" + str(control.millis() / 1000)))
        print("speed: " + ("" + str(speed)))
loops.every_interval(1000, on_every_interval)

# Main Loop
# =====================================
def on_forever():
    changed = 0
    if changed:
        setSpeed()
        showSpeed()
        setRichtung()
        showRichtung()
        sendData()
    else:
        showSpeed()
        showRichtung()
        set_led_stop(1)
basic.forever(on_forever)
