# KumuluzEE Node.js Config Sample

Purpose of this sample is to show how to develop a microservice that uses KumuluzEE Node.js Config library to access configuration properties stored in Consul and etcd.

## Requirements

Node version >= 8.x
```
$ node --version
```
Note: if you are running service on Debian operating system, you will need to install `nodejs-legacy`:

```
$ sudo apt-get install nodejs-legacy
```


## Prerequisites



**Running Consul**

First you should check if you have installed Consul, by typing following command:
```
$ consul version
```

Note that such setup with Consul running in development mode is not viable for production environments, but only for developing purposes. Here is an example on how to quickly run a local Consul agent in development mode:
```
 $ consul agent -dev -ui
```

**Running etcd**

Note that such setup with only one etcd node is not viable for production environments, but only for developing purposes. Here is an example on how to quickly run an etcd instance with docker:
```
 $ docker run -d -p 2379:2379 \
     --name etcd \
     --volume=/tmp/etcd-data:/etcd-data \
     quay.io/coreos/etcd:latest \
     /usr/local/bin/etcd \
     --name my-etcd-1 \
     --data-dir /etcd-data \
     --listen-client-urls http://0.0.0.0:2379 \
     --advertise-client-urls http://0.0.0.0:2379 \
     --listen-peer-urls http://0.0.0.0:2380 \
     --initial-advertise-peer-urls http://0.0.0.0:2380 \
     --initial-cluster my-etcd-1=http://0.0.0.0:2380 \
     --initial-cluster-token my-etcd-token \
     --initial-cluster-state new \
     --auto-compaction-retention 1 \
     -cors="*"
```

## Usage

Install dependencies using npm:

```
$ npm install
```


### Implement the service

Define KumuluzEE configuration as well as your custom configuration properties in a  `config.yml`  configuration file:

```yml
kumuluzee:
  name: rest-service
  version: 1.0.0
  port: 3000
  env:
    name: dev
  config:
    start-retry-delay-ms: 500
    max-retry-delay-ms: 900000
    etcd:
      hosts: http://localhost:2379

rest-config:
  string-property: Monday
  boolean-property: true
  int: 23
  object-property:
    first: 1
      second: 2
  array-property:
      - first
      - second
      - third
  array-object-property:
      - http: foo
        port: 1234
      - http: bar
        port: 2345
```

Note: when connecting to Consul, property `kumuluzee.config.etcd.hosts` is ignored.

Then you have to import `ConfigBundle` and creates new object which will automatically load and hold configuration properties. Function accepts object with described properties. After that you must call `initalize`, which connects to given extension and populates values.

```javascript
import ConfigBundle from 'kumuluzee-nodejs-config';

const restConfig = new ConfigBundle({
  prefixKey: 'rest-config',
  type: 'object',
  fields: {
    stringProperty: {
      type: 'string',
      watch: true,
    },
    booleanProperty: {
      type: 'boolean',
    },
    integerProperty: {
      type: 'number',
      name: 'int',
      watch: true,
    },
    objectProperty: {
      type: 'object',
      watch: true,
      fields: {
        firstProperty: {
          type: 'number',
          name: 'first',
        },
        secondProperty: {
          type: 'number',
          name: 'second',
        },
      },
    },
    arrayProperty: {
      type: 'array',
    },
    arrayObjectProperty: {
      type: 'array',
      fields: {
        http: {
          type: 'string',
        },
        port: {
          type: 'number',
        },
      },
    },
  },
});

restConfig.initialize({ extension: 'etcd' }); // or 'consul'

export { restConfig };
```

Property with `watch` option set to `true` will monitor the changes of this key in etcd (or Consul) and automatically update the value in `restConfig` object.

Implement simple `express` server that will return configuration properties:

```javascript
import express from 'express';

import { restConfig } from './config.js';

const server = express();

server.get('/config', (req, res) => {
  res.status(200).json(restConfig);
});

server.all('*', (req, res) => {
  res.status(404).json({
    message: 'This route does not exist!',
  });
});

server.listen(3000, () => {
  console.info(`Server is listening on port 3000`);
});
```

Finally run the service using command:

```
$ npm run start
```


Since you have not defined any configuration properties in etcd (or Consul), GET [http://localhost:3000/config](http://localhost:3000/config) will return configuration properties from configuration file. For example you can now dynamically update value on the filed `stringProperty`.

**Updating value in Consul**

We can add a value to Consul from the user interface, which can be accessed at  `http://localhost:8500`.

To set a value, navigate to  `KEY/VALUE`  tab and create key  `environments/dev/services/rest-service/1.0.0/config/rest-config/string-property`  with a value of your own choosing.


**Updating value in etcd**

We can add a value to etcd with the following command:
```
 $ docker exec etcd etcdctl --endpoints //localhost:2379 set /environments/dev/services/rest-service/1.0.0/config/rest-config/string-property test_string
```

Access the config endpoint again and you will get an updated value from additional configuration source.