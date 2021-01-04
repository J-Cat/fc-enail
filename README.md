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
* Button w/ 3V LED
* Rotary Encoder (Quadrature Encoder), with button
* Class D Mono Amplifier and 1-3W speaker (eg. Adafruit PAM8303A)
* 128x64 I2C OLED Display
* RS-485 to UART converter w/ auto direction control (ie. something w/ a MAX13487E chip)
* 5V Power Supply, 500mA
* Raspbeery Pi Pin Configuration:

  Button
  - button: PIN 39 (GPIO 5)
  - led: PIN 31 (GPIO 6)
  - grounds: 30, 39

  Speaker
  - PIN 32 (GPIO 12)
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

1. Update d:\config.txt

    start_x=0
    enable_uart=1
    dtoverlay=disable-bt
    gpio=15,16,18,22=pu
    dtoverlay=audremap
    audio_pwm_mode=2
    hdmi_ignore_edid_audio=1
    
2. Create d:\wpa_supplicant.conf

    ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
    update_config=1
    country=CA
    
    network={
     ssid="<SSID>"
     psk="<password>"
    }
    
3. Boot and run raspi-config
    a. Hostname: fcenail
    b. Set localization options: America/Toronto, en-US
    c. Enable SPI, I2C
    d. Disable serial console, enable serial

4. Install NodeJS

   * Download unnofficial distribution for ARMv6
   * Create folder: /usr/local/lib/nodejs
   * Uncompress to /usr/local/lib/nodejs
   * Create symbolic link to /usr/local/lib/nodejs/current
   * Update profile/path (Add to /etc/profile)
     NODE_PATH=/usr/local/lib/nodejs/current
     PATH=$NODE_PATH/bin:$PATH
   * Run visudo and remove "secure_path"
   * Create symbolic links for node, npm, and npx:
     ````
     sudo ln -s /usr/local/lib/nodejs/current/bin/node /usr/local/bin/node
     sudo ln -s /usr/local/lib/nodejs/current/bin/npm /usr/local/bin/npm
     sudo ln -s /usr/local/lib/nodejs/current/bin/npx /usr/local/bin/npx
     ````

5. Install NetworkManager

   sudo apt-get install network-manager

   Create connections, wifi-wlan0 and Hotspot:

   * /etc/NetworkManager/system-connections/wifi-wlan0.nmconnection
     ````
     [connection]
     id=wifi-wlan0
     uuid=ccaac89e-a2db-4412-ba51-b551d75712f0
     type=wifi
     autoconnect-priority=100
     autoconnect-retries=3
     interface-name=wlan0
     permissions=
     timestamp=1608730297
     
     [wifi]
     mac-address-blacklist=
     mode=infrastructure
     seen-bssids=74:83:C2:3A:E3:AA;74:83:C2:2D:62:6E;
     ssid=Linamar
     
     [wifi-security]
     key-mgmt=wpa-psk
     psk=L1n@m@r+23
     
     [ipv4]
     dns-search=
     method=auto
     
     [ipv6]
     addr-gen-mode=stable-privacy
     dns-search=
     method=ignore
     ````

   * /etc/NetworkManager/system-connections/Hotspot.nmconnection
     ````
     [connection]
     id=Hotspot
     uuid=9be42a41-2c0a-42f4-a646-c9bd3b380874
     type=wifi
     autoconnect-priority=1
     interface-name=wlan0
     permissions=
     timestamp=1608320053
     
     [wifi]
     mac-address-blacklist=
     mode=ap
     seen-bssids=B8:27:EB:24:83:71;
     ssid=fcenail
     
     [wifi-security]
     key-mgmt=wpa-psk
     psk=1234567890
     
     [ipv4]
     address1=10.20.30.1/24
     dns-search=
     method=shared
     
     [ipv6]
     addr-gen-mode=stable-privacy
     dns-search=
     method=ignore
     ````

   ````
   sudo nmcli c add type wifi con-name wifi-wlan0 ifname wlan0 ssid <ssid> wifi-sec.key-mgmt wpa-psk wifi-sec.psk <password> 
   ````

   Edit /etc/NetworkManager/NetworkManager.conf

   `````
   [main]
   plugins=ifupdown,keyfile
   dhcp=internal
   
   [ifupdown]
   managed=true
   ````

   Reboot and add hotspot
   
   nmcli c add type wifi ifname wlan0 con-name Hotspot autoconnect no ssid hotspot-ssid
       
   set priorities to 100 and 1 for wifi-wlan0 and Hotspot respectively.
   eg. sudo nmcli c mod wifi-wlan0 device.autoconnect-priority 100

6. Install Git

   sudo apt-get install git

7. Install fcenail

   sudo npm install -g fcenail --unsafe


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
