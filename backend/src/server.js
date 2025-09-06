import dotenv from 'dotenv';
dotenv.config();

import { createServer } from 'http';
import app from './app.js';

const port = process.env.PORT || 8080;

const server = createServer(app);

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on port ${port}`);
});

