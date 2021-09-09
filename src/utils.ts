import process from 'process';

export class SignalHandler {
    private signal: string;
    private handler: (signal: string) => void;

    constructor(signal: string, handler: (signal: string) => void) {
        this.signal = signal;
        this.handler = handler;

        process.on(this.signal, this.handler);
    }

    destroy() {
        process.off(this.signal, this.handler);
    }
};