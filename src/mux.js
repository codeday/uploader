const Mux = require('@mux/mux-node');
const config = require('./config');

const mux = new Mux(config.mux.accessToken, config.mux.secretKey);

exports.createVideo = async (url) => {
  const asset = await mux.Video.Assets.create({
    playback_policy: 'public',
    input: url,
  });
  return asset.playback_ids[0].id;
};
