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
          name: 'first',
          type: 'number',
        },
        secondProperty: {
          name: 'second',
          type: 'number',
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

restConfig.initialize({ extension: 'etcd' });

export { restConfig };
