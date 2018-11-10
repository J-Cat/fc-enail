/**
 * Javascript ALSA aplay wrapper for Node.js
 *
 * @mantainedBy Rocco Musolino - @roccomuso
 * @author Patrik Melander (lotAballs) node-aplay module
 * @originalAuthor Maciej Sopyło @ KILLAHFORGE.
 *
 * Dependencies: sudo apt-get install alsa-base alsa-utils
 * MIT License
 */

import * as os from 'os';
import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';

const aplayExec: string = os.platform() === 'darwin' ? 'afplay' : 'aplay'

export interface APlayOptions {
    channel?: string;
    basePath?: string;
}

export class APlay extends EventEmitter {
    private options?: APlayOptions;
    private stopped: boolean = false;
    private process?: ChildProcess;
    private ch?: string;
    private fileName?: string;
    private basePath?: string;

    init(options?: APlayOptions) {
        this.options = options || {};
        if (!!this.options.channel) {
            this.ch = this.options.channel;
        } else {
            delete(this.ch);
        }
        if (!!this.options.basePath) {
            this.basePath = this.options.basePath;
            if (!this.basePath.endsWith('/')) {
                this.basePath += '/';
            }
        } else {
          delete(this.basePath);    
        }
    }

    public play = (fileName: string) => {
        if (this.options === undefined) {
            return;
        }
        this.fileName = fileName;
        if (!this.fileName.toLowerCase().endsWith('.wav')) {
            this.fileName += '.wav';
        }
        this.stopped = false
        if (!!this.process) {
            this.process.kill('SIGTERM') // avoid multiple play for the same istance
            delete(this.process);
        }
        let args: string[] = [];
        if (this.ch) {
            args = args.concat(['-c ' + this.ch]);
        }

        if (args.length > 0) {
            console.log(args[args.length-1]);
        }
        args = args.concat([`${!!this.options.basePath ? this.options.basePath : ''}${this.fileName}`]);
        this.process = spawn(aplayExec, args);

        const self = this
        this.process.on('exit', (code, sig) => {
          if (code !== null && sig === null) {
            self.emit('complete');
          }
        });
    }

    public stop = () => {
        if (this.process) {
          this.stopped = true;
          this.process.kill('SIGTERM');
          this.emit('stop');
        }
    }
     
    public pause = () => {
        if (this.process) {
          if (this.stopped) {
              return;
          }
          this.process.kill('SIGSTOP');
          this.emit('pause');
        }
    }
     
    public resume = () => {
        if (this.process) {
          if (this.stopped) {
              if (!!this.fileName) {
                this.play(this.fileName);
              }
          }
          this.process.kill('SIGCONT');
          this.emit('resume');
        }
    }
     
    public channel = (ch: string) => {
        this.ch = ch;
    }
}

const aplay = new APlay()
export default aplay;