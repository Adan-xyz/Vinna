const crypto = require('crypto');
const user = require('../../database/models/user');
const { Op } = require('sequelize-cockroachdb');
const { numberFormat } = require('../../utils/functions');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const cache_ttl = 60_000;
const cache = new Map();

async function getLeaderboardData(type) {
  const entry = cache.get(type);
  if (entry && Date.now() - entry.timestamp < cache_ttl) return entry.data;

  const [top_10, total_users] = await Promise.all([
    user.findAll({ order: [[type, 'DESC']], limit: 10 }),
    user.count({ where: { new: false } }),
  ]);

  const data = { top_10, total_users };
  cache.set(type, { data, timestamp: Date.now() });
  return data;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Shows the leaderboard')
    .addStringOption((option) => option
      .setName('type')
      .setDescription('Choose type')
      .setRequired(true)
      .addChoices({ name: 'Vincy', value: 'vincy' }, { name: 'Level', value: 'level' })),
  async execute(interaction) {
    const hash = crypto.createHash('sha256').update(interaction.user.id).digest('hex');
    const type = interaction.options.getString('type');

    const [data, lb_data] = await Promise.all([user.findOne({ where: { id: hash } }), getLeaderboardData(type)]);

    if (!data || data.new) return interaction.reply('you are not registered yet, please `/register` first! :3');

    const { top_10, total_users } = lb_data;

    const your_rank = await user.count({ where: { [type]: { [Op.gt]: data[type] } } }) + 1;
    const your_top = Math.floor((your_rank / total_users) * 100);

    const rank_col = top_10.map((_, i) => `${i + 1}`).join('\n');
    const name_col = top_10.map((u) => u.name).join('\n');

    let value_col, your_value, title, value_label;

    if (type === 'vincy') {
      value_col = top_10.map((u) => `\`$${numberFormat(u.vincy / 100, 2)}\``).join('\n');
      your_value = `\`$${numberFormat(data.vincy / 100, 2)}\``;
      title = 'Leaderboard - Global - Vincy';
      value_label = 'Vincy';
    } else {
      value_col = top_10.map((u) => `\`${u.level}\``).join('\n');
      your_value = `\`${data.level}\``;
      title = 'Leaderboard - Global - Level';
      value_label = 'Level';
    }

    const text_1 = `> **${interaction.user.displayName}**\n>`;
    const text_2 = `> **Rank:** ${your_rank}/${total_users} (*Top ${your_top}%*)\n`;
    const text_3 = `> **${value_label}:** ${your_value}`;
    
    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(text_1 + text_2 + text_3)
      .setColor('Random')
      .addFields([{ name: 'Rank', value: rank_col, inline: true },
                  { name: 'Name', value: name_col, inline: true },
                  { name: value_label, value: value_col, inline: true }]);

    return interaction.reply({ embeds: [embed] });
  },
};