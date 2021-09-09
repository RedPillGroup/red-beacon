import { RedBeacon } from '../src/index';
import { SignalHandler } from '../src/utils';

import type { Probe, ProbeContext } from '../src/index';

class DummyProbe implements Probe {
    serve(context: ProbeContext) {

    }

    shutdown() {

    }
}

describe('RedBeacon tests', () => {
    it('should be instanciable', () => {
        const beacon = new RedBeacon();

        beacon.cleanup();
    });

    it('should accept other implementation of probe', () => {
        const beacon = new RedBeacon({ shutdownHandler: () => {} }, new DummyProbe);

        beacon.cleanup();
    });


});