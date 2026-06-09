const crypto = require('crypto');
const user = require('../../database/models/user');
const { SlashCommandBuilder } = require('discord.js');
const { numberFormat, withRetry } = require('../../utils/functions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('register')
    .setDescription('Register your account'),
  async execute(interaction) {
    await interaction.deferReply();

    let registered = false;
    
    await withRetry(async () => {
      const hash = crypto.createHash('sha256').update(interaction.user.id).digest('hex');
      const [data] = await user.findOrCreate({ where: { id: hash } });

      if (!data.new) { registered = false; return; }

      data.vincy += 100000;
      data.exp_value += 100;
      data.new = false;

      let leveled_up = false;
      
      if (data.exp_value >= data.exp_max) {
        data.level += 1;
        data.vincy += 10000 * data.level;
        data.exp_value = 0;
        data.exp_max = Math.floor(data.exp_max * 1.1) + 100;
        leveled_up = true;
      }

      await data.save();
      
      registered = true;

      if (leveled_up) {
        try {
          const channel = interaction.channel ?? await interaction.client.channels.fetch(interaction.channelId).catch(() => null);
          if (channel) {
            const name = interaction.user.displayName;
            const level = data.level;
            const vincy = numberFormat(10000 * level / 100, 2);
            
            const text_1 = `congratulations, **${name}**! 🎉🎉\n`;
            const text_2 = `you have leveled up to level \`${level}\` and received \`$${vincy}\` vincy!`;
            await channel.send(text_1 + text_2);
          }
        } catch {}
      }
    });

    if (!registered) return interaction.editReply({ content: 'you already registered! ;3' });

    const name = interaction.user.displayName;
    const vincy = numberFormat(100000 / 100, 2);
    
    const text_1 = `welcome **${name}**!\n`;
    const text_2 = 'thank you for registering your account, here is some rules and rewards for you:\n';
    const text_3 = '> **1.** be nice\n> **2.** be a good person\n> **3.** dont be a bad person\n';
    const text_4 = `-# rewards: \`$${vincy}\` vincy & \`100\` exp\n`;
    const text_5 = 'my english is bad, so please dont mind it :3';

    await interaction.editReply({ content: text_1 + text_2 + text_3 + text_4 + text_5 });
  },
};