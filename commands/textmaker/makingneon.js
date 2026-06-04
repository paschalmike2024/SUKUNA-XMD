const { makeTextmakerCommand } = require('../../lib/textmakerFetch');
module.exports = makeTextmakerCommand({
    name: 'makingneon',
    endpoint: '/makingneon',
    label: 'Making Neon',
    emoji: '💖',
});
