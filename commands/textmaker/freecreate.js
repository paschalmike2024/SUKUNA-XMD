const { makeTextmakerCommand } = require('../../lib/textmakerFetch');
module.exports = makeTextmakerCommand({
    name: 'freecreate',
    endpoint: '/freecreate',
    label: 'Free Create',
    emoji: '🎨',
});
