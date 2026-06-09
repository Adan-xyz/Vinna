const crypto = require('crypto');
const user = require('../../database/models/user');
const { SlashCommandBuilder } = require('discord.js');

const sizes = Array.from({ length: 9 }, (_, i) => ({
  name: `${16 << i} px`,
  value: 16 << i
}));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('banner')
    .setDescription('Get banner')
    .addUserOption(option => option
      .setName('who')
      .setDescription('Mention or paste ID'))
    .addIntegerOption(option => option
      .setName('size')
      .setDescription('Size of banner')
      .addChoices(sizes)),
  async execute(interaction) {
    const hash = crypto.createHash('sha256').update(interaction.user.id).digest('hex');
    const data = await user.findOne({ where: { id: hash } });

    if (!data || data.new) return interaction.reply({ content: 'you are not registered yet, please `/register` first! :3' });
    
    const who = interaction.options.getUser('who') ?? interaction.user;
    const size = interaction.options.getInteger('size') ?? undefined;

    const fetch = await who.fetch();
    const banner = fetch.bannerURL({ dynamic: true, size: size });

    if (!banner) {
      return interaction.reply({ content: 'this uh... no banner!' });
    };

    await interaction.reply(banner);
  },
};