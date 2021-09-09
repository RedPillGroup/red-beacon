import http from 'http';
import { SignalHandler } from './utils';

interface ShutdownHandler {
    (): void | Promise<void>
};

interface ProbeSet<Type> {
    ready: Type;
    live: Type;

    [index: string]: Type;
}

interface ProbeContext extends ProbeSet<boolean> {

};

/**
 * Define a probe interface
 */
interface Probe {
    serve(context: ProbeContext): void,
    shutdown(): void
};

/**
 * 
 */
interface HttpProbeOpts {
    port: number;
    path: ProbeSet<string>;
}


/**
 * A simple HTTP ProbeServer
 */
class HttpProbe implements Probe {
    private context: ProbeContext;
    private server: http.Server;
    private opts: any;

    constructor(opts: HttpProbeOpts = { port: 8888, path: { ready: '/ready', live: '/live' } }) {
        this.context = { ready: false, live: true };
        this.opts = opts;

        this.server = http.createServer((req, res) => {
            const route = Object
                .entries(this.opts.path)
                .find(([, path]) => {
                    return path === req.url
                });

            if (route != undefined) {
                const [key, ] = route;

                if (this.context[key]) {
                    res.statusCode = 200;
                } else {
                    res.statusCode = 500;
                }

                res.end();
            } else {
                res.statusCode = 404;
                res.end();
            }
        });
    }

    serve(context: ProbeContext) {
        this.context = context;
        this.server.listen(this.opts.port);
    }

    shutdown() {
        this.server.close();
    }
}

class RedBeacon {
    private probeContext: ProbeContext;
    private probe: Probe;
    private shutdownHandler: ShutdownHandler;
    private signalHandler: SignalHandler;

    /**
     * Construct an instance of RedBeacon
     * @param opts Options
     * @param probe A probe implementation (defaults to HTTP on port 8888 with /live and /ready paths)
     */
    constructor(opts = {
        shutdownHandler: () => { }
    },
        probe: Probe = new HttpProbe({
            port: 8888,
            path: { ready: '/ready', live: '/live' }
        })) {
        this.probe = probe;
        this.probeContext = { ready: false, live: true };
        this.shutdownHandler = opts.shutdownHandler;

        this.probe.serve(this.probeContext);

        this.signalHandler = new SignalHandler('SIGTERM', async () => {
            this.probeContext.ready = false;
            await this.shutdownHandler();
            this.cleanup();
        });
    }

    /**
     * Put the ready probe up
     */
    signalReady() {
        this.probeContext.ready = true;
    }

    /**
     * Put the ready probe down
     * As soon as k8s catch the state of the probe,
     * ingress traffic will stop being routed to this pod.
     */
    signalNotReady() {
        this.probeContext.ready = false;
    }

    /**
     * Put the live probe down (pod will not recover)
     */
    signalDead() {
        this.probeContext.live = false;
    }

    /**
     * Setup the shutdown handler (callback) to handle shutdown gracefully
     * @param shutdownHandler A callback to wait/shutdown every service before shutdown.
     */
    setShutdownHandler(shutdownHandler: ShutdownHandler) {
        this.shutdownHandler = shutdownHandler;
    }

    /**
     * Cleanup probes
     */
    cleanup() {
        this.signalHandler.destroy();
        this.probe.shutdown();
    }
};

export type { Probe, ProbeContext, ShutdownHandler, HttpProbeOpts };

export { RedBeacon, HttpProbe };
