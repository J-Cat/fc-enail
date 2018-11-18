import { Button } from './button';
import { config } from '../config';
import { RotaryDial } from './rotaryDial';
import { send } from 'process';
import { EnailMode } from '../models/IEnailState';

const button = new Button();

const dial = new RotaryDial();
dial.onChange.subscribe((source, { offset, step }) => {
    if (process.send) {
        process.send({ type: 'ROTATION', offset, step });
    }
});

dial.onClick.subscribe(source => {
    if (send) {
        send({ type: 'ROTARYCLICK' });
    }
});

button.onClick.subscribe(() => {
    if (send) {
        send({ type: 'CLICK' });
    }
});

button.onMediumClick.subscribe(() => {
    if (send) {
        send({ type: 'MEDIUMCLICK' });
    }
});

button.onLongClick.subscribe(() => {
    if (send) {
        send({ type: 'LONGCLICK' });
    }
});

button.onReallyLongLick.subscribe(() => {
    if (send) {
        send({ type: 'REALLYLONGCLICK' });
    }
});

process.on('message', m => {
    switch (m.type) {
        case 'MODE': {
            dial.setMode(m.mode as EnailMode);
            break;
        }
    }
})

button.init(config.options.hardware.button);

dial.init(
    config.options.hardware.dial.A, 
    config.options.hardware.dial.B, 
    config.options.hardware.dial.C
);

