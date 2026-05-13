# Programm name:    bahn-fernsteuerung
# Sender mit Rotation
# V1 Basis  13.5.2026
# 

# LED Anzeigen:
# Remote    0,0          Empfangen
# Speed     2,0 - 2,4    Senden 
# richtung  0,2 - 0,4    Senden puls 1 = vor
# on        0,4          Button A
# stop                   Button B

# Buttons
# =====================================

# A: on/off, on: LED 0,4
def on_button_pressed_a():
    global fahren, speed, richtung, trigger
    if fahren == 0:
        fahren = 1
        set_led_fahren(1)
        #led.plot(0, 0)
        music.play(music.builtin_playable_sound_effect(soundExpression.hello), music.PlaybackMode.UNTIL_DONE)
    else:
        fahren = 0
        speed = 0
        richtung = 0
        trigger = 1
        sendData()
        set_led_fahren(0)
        # led.unplot(0, 0)
        music.play(music.create_sound_expression(WaveShape.SINE,
            5000,
            0,
            255,
            0,
            1000,
            SoundExpressionEffect.NONE,
            InterpolationCurve.LINEAR),
        music.PlaybackMode.UNTIL_DONE)
    radio.send_value("fahren", fahren)
input.on_button_pressed(Button.A, on_button_pressed_a)

# B: Licht on/off, on: LED xy44
def on_button_pressed_b():
    global licht_on
    if licht_on == 0:
        licht_on = 1
        set_led_licht(1)
        # led.plot(4, 0)
    else:
        licht_on = 0
        sendData()
        set_led_licht(0)
        #led.unplot(4, 0)
    radio.send_value("licht_on", licht_on)
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
    global trigger, speed, richtung, licht_on
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
        radio.send_value("licht_on", licht_on)
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
    global speedRoh, speed, speedAbs, trigger, speedOld, hyst
    speedRoh = input.rotation(Rotation.PITCH) * -1
    if speedRoh > 0:
        speedDir = 1
    else:
        speedDir = -1
    #speed = Math.constrain(abs(speedRoh) - s0, 0, 100)
    #speed = min(100, speed / 2 * 10) * speedDir
    speed = min (100, abs(speedRoh * speedFaktor)) * speedDir
    speedAbs = abs(speed)
    if abs(speedAbs - speedOld) > hyst:
        trigger = 1
        #serial.write_value("speedAbs", speedAbs)
        #serial.write_value("speedOld", speedOld)
        speedOld = speedAbs

def setRichtung():
    global richtung
    if richtung:
        richtungDir = 1
    else:
        richtungDir = -1
    #richtung = Math.constrain(abs(richtungRoh) - r0, 0, 100)
    #richtung = min(100, richtung / 2 * 10) * richtungDir
    richtungAbs = abs(richtung)
    if abs(richtungAbs - richtungOld) > hyst:
        trigger = 1
        richtungOld = richtungAbs

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

# Init
# =========================
radio.set_group(1)
radio.set_transmit_power(7)

richtung = 0
licht_on = 0
speedRoh = 0
speedOld = 0
speedAbs = 0
speedFaktor = 2
remCtrl = 0
speed = 0
fahren = 0
trigger = 0
hyst = 5
s0 = 10
s2 = 80
r0 = 10
r2 = 80
basic.show_leds("""
    . . . . .
    . # # # .
    . # . # .
    . # # # .
    . . . . .
    """)
basic.pause(1000)
basic.clear_screen()

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