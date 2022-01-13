require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const config = require('./config');
const upload = require('./upload');

const app = express();
app.use(multer({
  storage: multer.diskStorage({}),
  limits: {
    fileSize: config.maxSize * 1024 * 1024,
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
  console.log('file');
  try {
    const result = await upload.file(req.file);
    console.log(`file:${result.id}`);
    res.send(result);
  } catch (ex) {
    console.error(ex);
    res.send({ error: 'unknown' });
  }
});

app.post('/video', async (req, res) => {
  console.log('video');
  try {
    const result = await upload.video(req.file);
    console.log(`video:${result.id}`);
    res.send(result);
  } catch (ex) {
    console.error(ex);
    res.send({ error: 'unknown' });
  }
});

app.post('/image', async (req, res) => {
  console.log('image');
  try {
    const result = await upload.image(req.file);
    console.log(`image:${result.id}`);
    res.send(result);
  } catch (ex) {
    console.error(ex);
    res.send({ error: 'unknown' });
  }
});

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀  To the moon! https://0.0.0.0/${config.port}`);
});
