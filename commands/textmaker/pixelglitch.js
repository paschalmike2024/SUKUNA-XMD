const { makeTextmakerCommand } = require('../../lib/textmakerFetch');
module.exports = makeTextmakerCommand({
    name: 'pixelglitch',
    endpoint: '/pixelglitch',
    label: 'Pixel Glitch',
    emoji: '👾',
});
