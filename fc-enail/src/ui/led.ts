import { Gpio } from 'onoff';
import Debug from 'debug';
const debug = Debug('fc-enail:led');

export class LED {
    private led?: Gpio;
    private state: number = -1;
    private rate = 0;

    init = (gpio: number, initialState = 1) => {
        this.led = new Gpio(gpio, 'out');
        if (initialState === 1) {
            this.on();
        } else {
            this.off();
        }
    }

    on = () => {
        if (!this.led || this.state === 1) {
            return;
        }

        debug('on');
        this.state = 1;
        this.led.write(1, () => {});
    }

    off = () => {
        if (!this.led || this.state === 0) {
            return;
        }

        debug('off');
        this.state = 0;
        this.led.write(0, () => {});
    }

    toggle = () => {
        if (!this.led) {
            return;
        }

        debug('toggle');
        this.state = (this.state * -1) + 1;
        this.setLedState(this.state);
    }

    setLedState = (state: number) => {
        if (!this.led) {
            return;
        }
        
        debug(`set state = ${state}`);
        this.led.write(state, () => {});
    }

    flash = (rate: number) => {
        debug('start flash');
        this.rate = rate;

        setTimeout(this.internalFlash.bind(this, this.state), rate * 1000);
    }

    private internalFlash = (flashState: number) => {
        debug('internal flash');
        if (this.rate === 0) {
            this.setLedState(this.state);
        } else {
            const newState = (flashState * -1) + 1;
            debug(`new state = ${newState}`);
            this.setLedState(newState);
            setTimeout(this.internalFlash.bind(this, newState), this.rate * 1000);
        }
    }
}

const led = new LED();
export default led;
