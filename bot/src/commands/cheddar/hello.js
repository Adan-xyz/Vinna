const crypto = require('crypto');
const user = require('../../database/models/user');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hello')
    .setDescription('Say hello to Vinna!'),
  async execute(interaction) {
    const hash = crypto.createHash('sha256').update(interaction.user.id).digest('hex');
    const data = await user.findOne({ where: { id: hash } });

    if (!data || data.new) return interaction.reply({ content: 'you are not registered yet, please `/register` first! :3' });

    await interaction.deferReply();

    await new Promise(resolve => setTimeout(resolve, 1500));

    await interaction.editReply(`hi ${interaction.user.displayName}! :3`);
  },
};