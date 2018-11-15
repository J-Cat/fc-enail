import { Gpio } from 'onoff';
import { SimpleEventDispatcher, ISimpleEvent } from "strongly-typed-events";

const DOUBLE_CLICK_RATE = 1000;
const LONG_CLICK_TIMEOUT = 10000;
const MEDIUM_CLICK_TIMEOUT = 5000;

// const running = store.getState().enail.running;
// led.write(running ? 1 : 0, () => {});
export class Button {
    private button?: Gpio; 
    private timer?: NodeJS.Timeout;
    private clickCount = 0;
    private startTime = Date.now();

    protected _onClick: SimpleEventDispatcher<Button> = new SimpleEventDispatcher<Button>();
    get onClick(): ISimpleEvent<Button> {
        return this._onClick.asEvent();
    }

    protected _onDoubleClick: SimpleEventDispatcher<Button> = new SimpleEventDispatcher<Button>();
    get onDoubleClick(): ISimpleEvent<Button> {
        return this._onDoubleClick.asEvent();
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
                if ((now - this.startTime) > LONG_CLICK_TIMEOUT) {
                    this._onReallyLongClick.dispatch(this);
                } else if ((now - this.startTime) > MEDIUM_CLICK_TIMEOUT) {
                    this._onLongClick.dispatch(this);
                } else {
                    
                    if (this.timer) {
                        clearTimeout(this.timer);
                        this.clickCount += 1;
                    }

                    this.timer = setTimeout((() => {
                        if (this.clickCount > 1) {
                            this._onDoubleClick.dispatch(this);
                        } else {
                            this._onClick.dispatch(this);
                        }
                        this.clickCount = 0;
                    }).bind(this), 500);
                }
            }
        });
    }
}
const button = new Button();

export default button;