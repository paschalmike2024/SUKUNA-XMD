const { makeTextmakerCommand } = require('../../lib/textmakerFetch');
module.exports = makeTextmakerCommand({
    name: 'underwatertext',
    endpoint: '/underwatertext',
    label: 'Underwater Text',
    emoji: '🌊',
});
