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
