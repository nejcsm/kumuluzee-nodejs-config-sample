import express from 'express';

import { restConfig } from './config.js';

const server = express();

server.get('/v1/config', (req, res) => {
  res.status(200).json(restConfig);
});

server.all('*', (req, res) => {
  res.status(404).json({
    message: 'This route does not exist!',
  });
});

server.listen(process.env.PORT || 8080, () => {
  console.info(`Server is listening on port ${process.env.PORT || 8080}`);
});
