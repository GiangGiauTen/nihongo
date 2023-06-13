const { FulfillmentError } = require('monochrome-bot');

/**
* Send a message as the bot.
* Syntax: }broadcast [channel_id] [announcement]
*/
module.exports = {
  commandAliases: ['broadcast', 'b'],
  botAdminOnly: true,
  shortDescription: 'Send a message as me.',
  usageExample: '}broadcast [channelId] Hello!',
  hidden: true,
  uniqueId: 'broadcast',
  action(bot, msg, suffix) {
    if (!suffix || suffix.indexOf(' ') === -1) {
      throw new FulfillmentError({
        publicMessage: 'Say \'}broadcast [channel_id] [announcement]\' to broadcast a message.',
        logDescription: 'Invalid sytax',
      });
    }
    const spaceIndex = suffix.indexOf(' ');
    const channelId = suffix.substring(0, spaceIndex);
    const announcement = suffix.substring(spaceIndex + 1);
    return bot.createMessage(channelId, announcement);
  },
};
