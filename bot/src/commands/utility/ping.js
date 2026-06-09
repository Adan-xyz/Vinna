const crypto = require('crypto');
const user = require('../../database/models/user');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with pong'),
  async execute(interaction) {
    const hash = crypto.createHash('sha256').update(interaction.user.id).digest('hex');
    const data = await user.findOne({ where: { id: hash } });

    if (!data || data.new) return interaction.reply({ content: 'you are not registered yet, please `/register` first! :3' });
    const ping = Date.now() - interaction.createdTimestamp;
    await interaction.reply(`Pong! \`${ping}ms\``);
  },
};