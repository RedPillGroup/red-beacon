import { RedBeacon } from './index';

const beacon = new RedBeacon();

beacon.setShutdownHandler(async () => {
    // shutdown
    console.log('Shutting down...');

    await new Promise<void>((resolve) => {
        setTimeout(() => {
            console.log('Good bye !');
            resolve(); 
        }, 5000);
    });
});

setTimeout(() => {
    console.log('Ready !');
    beacon.signalReady();
}, 10000);

setTimeout(() => {
    console.log('Occupied !');
    beacon.signalNotReady();
}, 20000);

setTimeout(() => {
    console.log('Dead !');
    beacon.signalDead();
}, 30000);

setTimeout(() => {
    process.kill(process.pid, 'SIGTERM');
}, 40000);