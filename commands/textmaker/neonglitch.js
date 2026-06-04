const { makeTextmakerCommand } = require('../../lib/textmakerFetch');
module.exports = makeTextmakerCommand({
    name: 'neonglitch',
    endpoint: '/neonglitch',
    label: 'Neon Glitch',
    emoji: '💡',
});
