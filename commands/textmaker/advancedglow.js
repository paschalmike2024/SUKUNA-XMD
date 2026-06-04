const { makeTextmakerCommand } = require('../../lib/textmakerFetch');
module.exports = makeTextmakerCommand({
    name: 'advancedglow',
    endpoint: '/advancedglow',
    label: 'Advanced Glow',
    emoji: '🌟',
});
