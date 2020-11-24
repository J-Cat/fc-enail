# fc-enail

This project is inspired by the FC Community and a desire to have a better E-Nail product, with ease of use, advanced features, and wireless connectivity.

## Highlights

* Easy temperature adjustments with rotary dial
* Easy on/off of heater both on device and remotely
* Quick temps from mobile screen to go to a temperature with 1-click
* Save/Load profiles (PID settings) for different devices (can use auto-tune to generate)
* Run scripts for fancy up-temp procedures and the like
* Full mobile access including:
  * Remotely start, adjust temperatures, and monitor
  * Run scripts
  * Manage/create/edit scripts with the script editor (drag/drop GUI)
  * Manage profiles and launch auto-tune to generate
* Ability to connect device to WiFi network through device UI
* Automatic discovery of device on local networks, but ability to configure if not found or on different subnets

![Device](https://raw.githubusercontent.com/J-Cat/fc-enail/master/pictures/device1.jpg)

![Mobile App - Home Screen](https://raw.githubusercontent.com/J-Cat/fc-enail/master/pictures/mobile1.png) ![Mobile App - Settings](https://raw.githubusercontent.com/J-Cat/fc-enail/master/pictures/mobile2.png) ![Mobile App - Script Editor](https://raw.githubusercontent.com/J-Cat/fc-enail/master/pictures/mobile3.png) ![Mobile App - Script Editor 2](https://raw.githubusercontent.com/J-Cat/fc-enail/master/pictures/mobile4.png)

## Getting Started

### Prerequisites

* Omron E5CC-QX2ASM-802
* Raspberry Pi Zero running Raspbian
* misc modules/components - I need to document the components and schematic/assembly instructions and required hardware in detail.  I may eventually provide a pre-built kit for the hardware to make people's lives easier, depending if I can get the circuit board built in such a way to make everything pluggable and quick to assemble.
* Raspbeery Pi Pin Configuration:

  Button
  - button: PIN 31 (GPIO 6)
  - led: PIN 29 (GPIO 5)
  - grounds: 30, 39

  Speaker
  - PIN 33 (GPIO 13)
  - 5V or 3.3V (PIN 2)
  - ground: 34

  OLED:
  - 3.3V (PIN 1)
  - SDA (PIN 3, GPIO 2)
  - SCL (PIN 5, GPIO 3)
  - ground: 9

  RS-485
  - 3.3V (PIN 17)
  - ground: PIN 14
  - TXD (PIN 10, UART0 RX)
  - RXD (PIN 8, UART0 TX)

  Rotary Encoder
  - 5V (PIN 2)
  - Channel A: PIN 18 (GPIO 24)
  - Channel B: PIN 16 (GPIO 23)
  - ground: PIN 20
  - Button: PIN 15 (GPIO 22), GROUND PIN: 25


### Installing

* install Raspbian
* install NodeJS 14.x
* npm install -g fcenail --unsafe
* fcenail --install

## Built With

* Typescript
* ReactJS/Redux
* Raspberry Pi
* Omron E5CC-QX2ASM-802

## Authors

J-Cat

## License

This work is licensed under a [Creative Commons Attribution-NonCommercial 4.0 International License](http://creativecommons.org/licenses/by-nc/4.0/)
 
## Acknowledgments

* Thanks to Rocco Musolino, Patrik Melander, Maciej Sopyło for the ALSA aplay module being used here-in.
