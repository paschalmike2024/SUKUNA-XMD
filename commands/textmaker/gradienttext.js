const { makeTextmakerCommand } = require('../../lib/textmakerFetch');
module.exports = makeTextmakerCommand({
    name: 'gradienttext',
    endpoint: '/gradienttext',
    label: 'Gradient Text',
    emoji: '🌈',
});
