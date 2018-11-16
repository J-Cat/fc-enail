import * as readline from 'readline';
import e5cc from '../e5cc/e5cc';
import store from '../store/createStore';

export class ConsoleUi {
    private displayHelp = () => {
        console.log('Commands:\n\n\t- read <address>\n\t- write <address> <value>\n\t- run <command>\n\n');
        console.log('Examples:\n\n\t- read 0x2103\n\t- write 0x2103 50\n\t- run 0x0101\n\n');
    }

    init() {
        const rl = readline.createInterface(process.stdin, process.stdout);

        rl.setPrompt('command>');
        rl.prompt();
        rl.on('line', (line: string) => {
            const cmd = line.split(' ');
            switch (cmd[0].toLowerCase()) {
                case 'state': {
                    if (cmd.length > 1) {
                        try {
                            const path = cmd[1].split('/');
                            let obj = store.getState().enail as any;
                            for (let p of path) {
                                obj = obj[p];
                            }
                            console.log(JSON.stringify(obj, undefined, 3));
                        } catch {
                            console.log(JSON.stringify(store.getState().enail, undefined, 3));
                        }
                    } else {
                        console.log(JSON.stringify(store.getState().enail, undefined, 3));
                    }
                    rl.prompt();
                    break;
                }
                case 'read': {
                    if (cmd.length < 2) {
                        console.log('Invalid # of arguments specified.\n');
                        this.displayHelp();
                        rl.prompt();
                        break;
                    }
                    
                    const address = parseInt(cmd[1]);
                    if (isNaN(address)) {
                        console.log(`Invalid address specified: ${cmd[1]}\n`);
                        this.displayHelp();
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
                        this.displayHelp();
                        rl.prompt();
                        break;
                    }

                    const address = parseInt(cmd[1]);
                    if (isNaN(address)) {
                        console.log(`Invalid address specified: ${cmd[1]}\n`);
                        this.displayHelp();
                        rl.prompt();
                        break;
                    }

                    const newValue = parseInt(cmd[2]);
                    if (isNaN(newValue)) {
                        console.log(`Invalid value specified: ${cmd[2]}\n`);
                        this.displayHelp();
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
                        this.displayHelp();
                        rl.prompt();
                        break;
                    }

                    const command = parseInt(cmd[1]);
                    if (isNaN(command)) {
                        console.log(`Invalid command specified: ${cmd[1]}\n`);
                        this.displayHelp();
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
                        process.exit(0);
                    });
                    break;
                }

                case '?': case 'help': {
                    this.displayHelp();
                    rl.prompt();
                    break;
                }

                default: {
                    console.log('Invalid command.  Valid commands: read/write/run\n\n');
                    this.displayHelp();
                    rl.prompt();
                }
            }    
        }).on('close', () => {
            e5cc.close().then(() => {
                process.exit();
            });
        });
    }
}

const consoleUi = new ConsoleUi();
export default consoleUi;