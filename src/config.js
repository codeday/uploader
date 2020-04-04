const { join } = require('path');

exports.port = process.env.PORT || 80;
exports.secret = process.env.SECRET;
exports.maxSize = process.env.MAX_SIZE || 100;
exports.google = {
  bucket: {
    files: process.env.FILE_BUCKET,
    images: process.env.IMAGE_BUCKET,
  },
  urlBase: {
    files: process.env.FILE_URL_BASE,
    images: {
      original: process.env.IMAGE_URL_ORIGINAL_BASE,
      cropped: process.env.IMAGE_URL_CROPPED_BASE,
    },
  },
  project: process.env.GOOGLE_PROJECT,
  keyPath: process.env.GOOGLE_APPLICATION_CREDENTIALS || join(process.cwd(), 'google.json'),
};
exports.mux = {
  accessToken: process.env.MUX_ACCESS_TOKEN,
  secretKey: process.env.MUX_SECRET_KEY,
};
