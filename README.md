# red-beacon

## Introduction

This package provide an abstraction for readiness/liveness probe (targetting Kubernetes) and provide a framework for graceful shutdown.

## Basic usage

```js
const { RedBeacon } = require('./index');
const express = require('express');
const app = express();
const port = 3000;

// Make a new HttpProbe server running on 8888
const beacon = new RedBeacon();

app.get('/', (req, res) => {
  res.send('Hello World!');
})

const server = app.listen(port, () => {
    // Tell k8s that our app is ready to handle request
    beacon.signalReady();
    console.log(`Example app listening at http://localhost:${port}`);
})

// There's only one shutdownHandler per RedBeacon instance
// This method override it
beacon.setShutdownHandler( /* could be async */ () => {
    // shutdown
    console.log('Shutting down...');
    server.close();

    // Do not call process.exit()
});
```
