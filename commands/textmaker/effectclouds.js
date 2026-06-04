const { makeTextmakerCommand } = require('../../lib/textmakerFetch');
module.exports = makeTextmakerCommand({
    name: 'effectclouds',
    endpoint: '/effectclouds',
    label: 'Effect Clouds',
    emoji: '☁️',
});
