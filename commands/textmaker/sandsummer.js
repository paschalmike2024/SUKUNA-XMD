const { makeTextmakerCommand } = require('../../lib/textmakerFetch');
module.exports = makeTextmakerCommand({
    name: 'sandsummer',
    endpoint: '/sandsummer',
    label: 'Sand Summer',
    emoji: '🏖️',
});
