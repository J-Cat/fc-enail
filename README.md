# fc-enail

This project is inspired by the FC Community and a desire to have a better E-Nail product, with ease of use and advanced features.

## Highlights

* rotary control of the temperature for quick adjustments
* easy on/off of heater
* ability to run scripts for up-temp and down-temp procedures and the like
* ability to save/load custom settings (PID) for different nails (profiles)
* mobile app to control advanced features more easily, etc.

## Getting Started

### Prerequisites

* Omron E5CC-QX2ASM-802
* Raspberry Pi Zero running Raspbian
* misc modules/components - I need to document the components and schematic/assembly instructions and required hardware in detail.  I may eventually provide a pre-built kit for the hardware to make people's lives easier, depending if I can get the circuit board built in such a way to make everything pluggable and quick to assemble.

### Installing

* npm install
* node_modules\.bin\tsc

## Deployment

* copy files to Raspberry Pi
* npm install
* node build/app.js

## Built With

* Typescript
* Redux
* Raspberry Pi
* Omron E5CC-QX2ASM-802


## Authors

J-Cat

## License

[http://creativecommons.org/licenses/by-nc/4.0/]This work is licensed under a Creative Commons Attribution-NonCommercial 4.0 International License.
 
## Acknowledgments

* Thanks to Rocco Musolino, Patrik Melander, Maciej Sopyło for the ALSA aplay module being used here-in.
