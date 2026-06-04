const { makeTextmakerCommand } = require('../../lib/textmakerFetch');
module.exports = makeTextmakerCommand({
    name: 'glitchtext',
    endpoint: '/glitchtext',
    label: 'Glitch Text',
    emoji: '🌀',
});
