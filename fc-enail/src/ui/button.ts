import { Gpio } from 'onoff';
import { SimpleEventDispatcher, ISimpleEvent } from "strongly-typed-events";

const DOUBLE_CLICK_RATE = 750;


// const running = store.getState().enail.running;
// led.write(running ? 1 : 0, () => {});
export class Button {
    private button?: Gpio; 
    private timer?: NodeJS.Timeout;
    private clickCount = 0;

    protected _onClick: SimpleEventDispatcher<Button> = new SimpleEventDispatcher<Button>();
    get onClick(): ISimpleEvent<Button> {
        return this._onClick.asEvent();
    }

    protected _onDoubleClick: SimpleEventDispatcher<Button> = new SimpleEventDispatcher<Button>();
    get onDoubleClick(): ISimpleEvent<Button> {
        return this._onDoubleClick.asEvent();
    }

    init = (gpioNumber: number) => {    
        this.button = new Gpio(gpioNumber, 'in', 'rising', {debounceTimeout: 10, activeLow: true});
        this.button.watch(async (err: Error, value: number) => {
            if (err) {
                return;
            }

            if (value === 1) {
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
        });
    }
}
const button = new Button();

export default button;