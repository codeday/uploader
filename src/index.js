require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const config = require('./config');
const upload = require('./upload');

const app = express();
app.use(multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
}).single('file'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.contentType('json');

  // Validate the secret, if any
  if (config.secret && config.secret !== req.query.secret) {
    return res.status(401).send({ error: 'authentication required' });
  }

  if (req.path !== '/status' && !req.file) {
    return res.status(400).send({ error: 'missing file' });
  }

  try {
    return next();
  } catch (ex) {
    return res.status(500).send({ error: true });
  }
});

app.get('/status', (_, res) => res.send({ status: 'ok' }));

app.post('/', async (req, res) => {
  res.send(await upload.file(req.file));
});

app.post('/video', async (req, res) => {
  res.send(await upload.video(req.file));
});

app.post('/image', async (req, res) => {
  res.send(await upload.image(req.file));
});

app.listen(config.port, () => {
  console.log(`🚀  To the moon! https://0.0.0.0/${config.port}`);
});
