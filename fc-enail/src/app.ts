/*
 * File: c:\fc-enail\fc-enail\src\app.ts
 * Project: c:\fc-enail\fc-enail
 * Created Date: Thursday November 8th 2018
 * Author: J-Cat
 * -----
 * Last Modified:
 * Modified By:
 * -----
 * License: 
 *    This work is licensed under a Creative Commons Attribution-NonCommercial 4.0 
 *    International License (http://creativecommons.org/licenses/by-nc/4.0/).
 * -----
 * Copyright (c) 2018
 */
import * as readline from 'readline';
import { Gpio } from 'onoff';

import { RotaryDial } from './ui/rotaryDial';
import APlay from './aplay';
import e5cc from './e5cc/e5cc';
import store from './store/createStore';
import { connect, increaseSP, decreaseSP, toggleState } from './reducers/enailReducer';
import oledUi from './ui/oledUi';

const OLED_ADDRESS = 0x3C;

const rl = readline.createInterface(process.stdin, process.stdout);

const displayHelp = () => {
    console.log('Commands:\n\n\t- read <address>\n\t- write <address> <value>\n\t- run <command>\n\n');
    console.log('Examples:\n\n\t- read 0x2103\n\t- write 0x2103 50\n\t- run 0x0101\n\n');
}

const initDial = () => {
    const dial = new RotaryDial(22, 23, 24);
    dial.onButton.subscribe(() => {
    });

    dial.onClockwise.subscribe((sender: RotaryDial) => {
        store.dispatch(increaseSP());
    });

    dial.onCounterClockwise.subscribe((sender: RotaryDial) => {
        store.dispatch(decreaseSP());
    });
}

const initButton = async () => {
    const button = new Gpio(25, 'in', 'rising', {debounceTimeout: 10, activeLow: true});

    // const running = store.getState().enail.running;
    // led.write(running ? 1 : 0, () => {});

    button.watch(async (err: Error, value: number) => {
        if (err) {
            return;
        }
        if (value === 1) {
            store.dispatch<any>(toggleState());
//            led.write((await e5cc.toggleState()) ? 1 : 0, () => {});
        }
    });
}

const initClient = () => {
    rl.setPrompt('command>');
    rl.prompt();
    rl.on('line', (line: string) => {
        const cmd = line.split(' ');
        switch (cmd[0].toLowerCase()) {
            case 'read': {
                if (cmd.length < 2) {
                    console.log('Invalid # of arguments specified.\n');
                    displayHelp();
                    rl.prompt();
                    break;
                }
                
                const address = parseInt(cmd[1]);
                if (isNaN(address)) {
                    console.log(`Invalid address specified: ${cmd[1]}\n`);
                    displayHelp();
                    rl.prompt();
                    break;
                }

                e5cc.read(address).then(value => {
                    console.log(`Value: ${value}`);
                    rl.prompt();
                }).catch(e => {
                    console.log(`Error: ${e}`);
                    rl.prompt();
                });
                break;
            }

            case 'write': {
                if (cmd.length < 3) {
                    console.log('Invalid # of arguments specified.\n');
                    displayHelp();
                    rl.prompt();
                    break;
                }

                const address = parseInt(cmd[1]);
                if (isNaN(address)) {
                    console.log(`Invalid address specified: ${cmd[1]}\n`);
                    displayHelp();
                    rl.prompt();
                    break;
                }

                const newValue = parseInt(cmd[2]);
                if (isNaN(newValue)) {
                    console.log(`Invalid value specified: ${cmd[2]}\n`);
                    displayHelp();
                    rl.prompt();
                    break;
                }

                e5cc.write(address, newValue).then(result => {
                    if (result) {
                        console.log('Updated variable.');
                    } else {
                        console.log(`Failed to update variable`);
                    }
                    rl.prompt();
                });
                break;
            }

            case 'run': {
                if (cmd.length < 2) {
                    console.log('Invalid # of arguments specified.\n');
                    displayHelp();
                    rl.prompt();
                    break;
                }

                const command = parseInt(cmd[1]);
                if (isNaN(command)) {
                    console.log(`Invalid command specified: ${cmd[1]}\n`);
                    displayHelp();
                    rl.prompt();
                    break;
                }

                e5cc.run(command).then(result => {
                    if (result) {
                        console.log('Executed command.');
                    } else {
                        console.log(`Failed to execute command.`);
                    }
                    rl.prompt();
                });
                break;
            }

            case 'exit': case 'quit': case 'e': case 'q': {
                console.log('\n');
                e5cc.close().then(() => {
                    process.exit();
                });
                break;
            }

            case '?': case 'help': {
                displayHelp();
                rl.prompt();
                break;
            }

            default: {
                console.log('Invalid command.  Valid commands: read/write/run\n\n');
                displayHelp();
                rl.prompt();
            }
        }    
    }).on('close', () => {
        e5cc.close().then(() => {
            process.exit();
        });
    });
}

store.dispatch<any>(connect());

initClient();
initDial();
initButton();
oledUi.start(OLED_ADDRESS);
oledUi.render();

const aplay = new APlay({
    basePath: `${__dirname}/assets/sounds/`
});
aplay.play('appear');
