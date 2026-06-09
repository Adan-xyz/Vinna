const crypto = require('crypto');
const user = require('../../database/models/user');
const { progressBar, numberFormat } = require('../../utils/functions');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View your profile'),
  async execute(interaction) {
    const hash = crypto.createHash('sha256').update(interaction.user.id).digest('hex');
    const data = await user.findOne({ where: { id: hash } });

    if (!data || data.new) return interaction.reply({ content: 'you are not registered yet, please `/register` first! :3' });

    const name = interaction.user.displayName;
    const level = data.level;
    const id = interaction.user.id;

    const progress = progressBar(data.exp_value, data.exp_max, true);
    const exp = `${data.exp_value}/${data.exp_max}`;
    const vincy = numberFormat(data.vincy / 100, 2);
    const energy = data.energy;
    
    const description = `${name} \`(Lvl ${level})\`\n${id}`;
    
    const fields = [{ name: 'Progress', value: `\`${progress}\``, inline: true },
                    { name: 'EXP', value: `${exp}`, inline: true },
                    { name: '\u200b', value: '\u200b', inline: true },
                    { name: 'Vincy', value: `\`$${vincy}\``, inline: true },
                    { name: 'Energy', value: `${energy}%`, inline: true },
                    { name: '\u200b', value: '\u200b', inline: true }];

    const embed = new EmbedBuilder()
      .setColor('Random')
      .setTitle('Profile')
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .setDescription(description)
      .addFields(...fields);

    await interaction.reply({ embeds: [embed] });
  },
};