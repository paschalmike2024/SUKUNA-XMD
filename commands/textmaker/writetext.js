const { makeTextmakerCommand } = require('../../lib/textmakerFetch');
module.exports = makeTextmakerCommand({
    name: 'writetext',
    endpoint: '/writetext',
    label: 'Write Text',
    emoji: '✍️',
});
