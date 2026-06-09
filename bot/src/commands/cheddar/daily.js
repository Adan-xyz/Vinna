const crypto = require('crypto');
const user = require('../../database/models/user.js');
const { numberFormat, randomInt } = require('../../utils/functions');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Claim your daily reward'),
  async execute(interaction) {
    const hash = crypto.createHash('sha256').update(interaction.user.id).digest('hex');
    const data = await user.findOne({ where: { id: hash } });
    
    if (!data || data.new) return interaction.reply({ content: 'you are not registered yet, please `/register` first! :3' });

    const now = Date.now();
    const timeLeft = data.cooldown_daily - now;
    const expiredTimestamp = Math.round(data.cooldown_daily / 1000) + 1;

    if (timeLeft > 0) {
      return interaction.reply({ content: `you have already claimed your daily reward!\nplease wait and claim again <t:${expiredTimestamp}:R>` });
    }

    const vincy = randomInt(Math.max(5000, 5000 * data.level), Math.max(10000, 10000 * data.level));
    
    data.cooldown_daily = now + 86400000;
    data.vincy += vincy;
    data.energy = 100;
    data.streak_daily += 1;
    await data.save();

    const name = interaction.user.displayName;
    const reward = numberFormat(vincy / 100, 2);
    const streak = data.streak_daily;

    const text_1 = `**${name}**, here's your daily reward!\n`
    const text_2 = `\`$${reward}\` vincy\n\`energy\` restored to full\n`;
    const text_3 = `-# youre on a **${streak}** daily streak!`;

    await interaction.reply({ content: text_1 + text_2 + text_3 });
  },
};