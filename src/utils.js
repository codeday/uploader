const stream = require('stream');
const path = require('path');
const { generate: randomString } = require('randomstring');

exports.asyncStream = async (s) => new Promise((resolve, reject) => s
  .on('end', resolve)
  .on('finish', resolve)
  .on('error', reject));

exports.bufferToStream = (buffer) => {
  const bufferStream = new stream.PassThrough();
  return bufferStream.end(buffer);
};

exports.makeFileName = (file) => {
  const { originalname } = file;
  const originalExt = path.extname(originalname).toLowerCase();
  const randomName = randomString({
    charset: '123456789abcdefghijkmnopqrstuvwxyz',
    length: 66,
  });

  return `${randomName[0]}/${randomName[1]}/${randomName}${originalExt}`;
};
