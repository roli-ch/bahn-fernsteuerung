# Programm name:    bahn-fernsteuerung
# Sender mit Rotation
# V1 Basis  13.5.2026
# 

# LED Anzeigen:
# ein_K1    0,0         Senden
# ein_K1    1,0         Senden
# ein_K1    2,0         Senden
# Speed K1  0,1 - 0,4   Senden
# Speed K2  1,1 - 1,4   Senden
# Speed K3  2,1 - 2,4   Senden
# vor_K1    3,0         Senden
# vor_K1    3,1         Senden
# vor_K1    3,2         Senden
# Remote    4,4         Empfangen
# sel_K1    4,0
# sel_K1    4,1
# sel_K1    4,2
# select                Button A
# stop                  Button B

# Init
# =========================
radio.set_group(1)
radio.set_transmit_power(7)

ein_K1 = 1
vor_K1 = 0
sel_K1 = 0
ein_K2 = 0
vor_K2 = 0
sel_K2 = 0
ein_K3 = 0
vor_K3 = 0
sel_K3 = 0

remCtrl = 0
speed = 0   # 0-100%

basic.show_leds("""
    . . . . .
    . # # # .
    . # . # .
    . # # # .
    . . . . .
    """)
basic.pause(1000)
basic.clear_screen()

# Buttons
# =====================================

# A: on/off, on: LED 0,4
def on_button_pressed_a():
    print("A: select")
    global sel_K1, sel_K2, sel_K3
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

# B: Stop
def on_button_pressed_b():
    print("B: stop")
    ein_K1 = 0
    ein_K2 = 0
    ein_K3 = 0
input.on_button_pressed(Button.B, on_button_pressed_b)

# Funktionen
# ===================================

# Leds ein/aus
# -------------------
# remoteControl
def set_keis_ein (kreisNr, on):
    pos = (0,0)
    if on:
        led.plot(pos[0],pos[1])
    else:
        led.unplot(pos[0],pos[1])

# fahren
def set_led_fahren(on):
    pos = (0,4)
    if on:
        led.plot(pos[0],pos[1])
    else:
        led.unplot(pos[0],pos[1])

# stop
def set_led_stop(on):
    pos = (2,2)
    if on:
        led.plot(pos[0],pos[1])
    else:
        led.unplot(pos[0],pos[1])

# licht
def set_led_licht(on):
    pos = (4,4)
    if on:
        led.plot(pos[0],pos[1])
    else:
        led.unplot(pos[0],pos[1])


# Daten Senden
def sendData():
    global ein_K1
    #trigger = 1
    if trigger == 1:
        # Daten anzeigen
        serial.write_value("speed", speed)
        serial.write_value("richtung", richtung)
        # Senden
        radio.send_number(1)
        radio.set_transmit_serial_number(True)
        radio.send_value("speed", speed)
        radio.send_value("richtung", richtung)

        trigger = 0
        
# Daten Empfangen
def on_received_value(name, value):
    global remCtrl
    music.play(music.tone_playable(Note.C, music.beat(BeatFraction.WHOLE)), music.PlaybackMode.UNTIL_DONE)
    serial.write_value("daten empfangen: "+name, value)
    if name == "remCtrl":
        remCtrl = value
    if remCtrl:
        pass
        # set_led_remote(1)
    else:
        pass
        # set_led_remote(0)
radio.on_received_value(on_received_value)

def setSpeed():
    global speed
    speedRoh = input.rotation(Rotation.PITCH) * -1
    if speedRoh > 0:
        speedDir = 1
    else:
        speedDir = -1
    #speed = Math.constrain(abs(speedRoh) - s0, 0, 100)
    #speed = min(100, speed / 2 * 10) * speedDir
    speed = min (100, abs(speedRoh * 1)) * speedDir
    speedAbs = abs(speed)
    if abs(speedAbs - speedOld) > hyst:
        trigger = 1
        #serial.write_value("speedAbs", speedAbs)
        #serial.write_value("speedOld", speedOld)
        speedOld = speedAbs

def setRichtung():
    global vor_K1
    if vor_K1:
        richtungDir = 1
    else:
        richtungDir = -1

def showSpeed():
    if speed > 0:
        if speed > s2:
            led.plot(2, 0)
            led.plot(2, 1)
            led.plot(2, 2)
        else:
            led.unplot(2, 0)
            led.plot(2, 1)
    elif speed < 0:
        if speed < -1 * s2:
            led.plot(2, 2)
            led.plot(2, 3)
            led.plot(2, 4)
        else:
            led.plot(2, 3)
            led.unplot(2, 4)
    elif speed == 0:
        led.unplot(2, 0)
        led.unplot(2, 1)
        led.plot(2, 2)
        led.unplot(2, 3)
        led.unplot(2, 4)

def showRichtung():
    if richtung > 0:
        if richtung > r2:
            led.plot(2, 2)
            led.plot(3, 2)
            led.plot(4, 2)
        else:
            led.unplot(4, 2)
            led.plot(3, 2)
    elif richtung < 0:
        if richtung < -1 * r2:
            led.plot(0, 2)
            led.plot(1, 2)
            led.plot(2, 2)
        else:
            led.plot(1, 2)
            led.unplot(0, 2)
    elif richtung == 0:
        led.unplot(0, 2)
        led.unplot(1, 2)
        led.plot(2, 2)
        led.unplot(3, 2)
        led.unplot(4, 2)


# Time Loop 1s
# =====================================
def onEvery_interval():
    # Daten Anzeigen
    print("===========")
    print("interval 1s; Zeit: "+ control.millis()/1000)
    print("speed: " + speed)
    print("richtung: "+ richtung)
    print("Fahren: "+ fahren)
    print("Licht: "+ licht_on)
loops.every_interval(1000, onEvery_interval)

# Main Loop
# =====================================
def on_forever():
    global trigger
    if fahren == 1:
        set_led_fahren(1)
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