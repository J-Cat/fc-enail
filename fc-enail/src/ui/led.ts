import { Gpio } from 'onoff';

export class LED {
    private led?: Gpio;
    private state: number = 1;
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
        if (!this.led) {
            return;
        }

        this.state = 1;
        this.led.write(1, () => {});
    }

    off = () => {
        if (!this.led) {
            return;
        }

        this.state = 0;
        this.led.write(0, () => {});
    }

    toggle = () => {
        if (!this.led) {
            return;
        }

        this.state = (this.state * -1) + 1;
        this.setLedState(this.state);
    }

    setLedState = (state: number) => {
        if (!this.led) {
            return;
        }
        
        this.led.write(state, () => {});
    }

    flash = (rate: number) => {
        this.rate = rate;
        if (rate === 0) {
            this.setLedState(this.state);
        }

        setTimeout(this.internalFlash.bind(this, this.state), rate * 1000);
    }

    private internalFlash = (flashState: number) => {
        if (this.rate === 0) {
            this.setLedState(this.state);
        } else {
            const newState = (flashState * -1) +1;
            this.setLedState(newState);
            setTimeout(this.internalFlash.bind(this, newState), this.rate * 1000);
        }
    }
}

const led = new LED();
export default led;
