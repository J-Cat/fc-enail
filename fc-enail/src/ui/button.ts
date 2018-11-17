import { Gpio } from 'onoff';
import { SimpleEventDispatcher, ISimpleEvent } from "strongly-typed-events";
import { config } from '../config';

const MEDIUM_CLICK_TIMEOUT = config.options.click.medium;
const LONG_CLICK_TIMEOUT = config.options.click.long;
const REALLY_LONG_CLICK_TIMEOUT = config.options.click.reallyLong;

// const running = store.getState().enail.running;
// led.write(running ? 1 : 0, () => {});
export class Button {
    private button?: Gpio; 
    private startTime = 0;

    protected _onClick: SimpleEventDispatcher<Button> = new SimpleEventDispatcher<Button>();
    get onClick(): ISimpleEvent<Button> {
        return this._onClick.asEvent();
    }

    protected _onMediumClick: SimpleEventDispatcher<Button> = new SimpleEventDispatcher<Button>();
    get onMediumClick(): ISimpleEvent<Button> {
        return this._onMediumClick.asEvent();
    }

    protected _onLongClick: SimpleEventDispatcher<Button> = new SimpleEventDispatcher<Button>();
    get onLongClick(): ISimpleEvent<Button> {
        return this._onLongClick.asEvent();
    }

    protected _onReallyLongClick: SimpleEventDispatcher<Button> = new SimpleEventDispatcher<Button>();
    get onReallyLongLick(): ISimpleEvent<Button> {
        return this._onReallyLongClick.asEvent();
    }

    init = (gpioNumber: number) => {    
        this.button = new Gpio(gpioNumber, 'in', 'both', {debounceTimeout: 10, activeLow: true});
        
        this.button.watch(async (err: Error, value: number) => {
            if (err) {
                return;
            }

            if (value === 1) {
                this.startTime = Date.now();
            }

            if (value === 0) {
                const now = Date.now();
                if ((this.startTime !== 0) && ((now - this.startTime) > REALLY_LONG_CLICK_TIMEOUT)) {
                    this.startTime = 0;
                    this._onReallyLongClick.dispatch(this);
                } else if ((this.startTime !== 0) && ((now - this.startTime) > LONG_CLICK_TIMEOUT)) {
                    this.startTime = 0;
                    this._onLongClick.dispatch(this);
                } else if ((this.startTime !== 0) && ((now - this.startTime) > MEDIUM_CLICK_TIMEOUT)) {
                    this.startTime = 0;
                    this._onMediumClick.dispatch(this);
                } else {               
                    this.startTime = 0;     
                    this._onClick.dispatch(this);
                }
            }
        });
    }
}
const button = new Button();

export default button;