const crypto = require('crypto');
const user = require('../database/models/user');
const { numberFormat, randomInt, withRetry } = require('../utils/functions');
const { Events } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    const hash = crypto.createHash('sha256').update(interaction.user.id).digest('hex');

    await withRetry(async () => {
      const [data] = await user.findOrCreate({ where: { id: hash } });
      if (data.name !== interaction.user.displayName) data.name = interaction.user.displayName;
      if (data.new) { await data.save(); return; }

      data.exp_value += randomInt(1, 10);

      if (data.exp_value >= data.exp_max) {
        data.vincy += 10000 * Math.max(1, data.level);
        data.level += 1;
        data.exp_value = 0;
        data.exp_max = Math.floor(data.exp_max * 1.1) + 100;

        try {
          const channel = interaction.channel ?? await interaction.client.channels.fetch(interaction.channelId).catch(() => null);
          if (channel) {
            const text_1 = `congratulations, **${interaction.user.displayName}**! 🎉🎉\n`;
            const text_2 = `you have leveled up to level \`${data.level}\` and received \`$${numberFormat(10000 * data.level / 100, 2)}\` vincy!`;
            await channel.send(text_1 + text_2);
          }
        } catch {}
      }
      
      await data.save();
    });
  },
};