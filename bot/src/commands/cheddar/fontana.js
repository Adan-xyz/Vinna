const crypto = require('crypto');
const user = require('../../database/models/user');
const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require('discord.js');

const wishes = ["may your day be filled with sunshine!", "good luck is heading your way!", "may all your dreams come true!",
                "the stars align in your favor!", "may fortune smile upon you!", "your kindness will return tenfold!"];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fontana')
    .setDescription('Make a wish'),
  async execute(interaction) {
    const hash = crypto.createHash('sha256').update(interaction.user.id).digest('hex');
    const data = await user.findOne({ where: { id: hash } });

    if (!data || data.new) return interaction.reply({ content: 'you are not registered yet, please `/register` first! :3' });

    const now = Date.now();
    const timeLeft = data.cooldown_fontana - now;
    const expiredTimestamp = Math.round(data.cooldown_fontana / 1000) + 1;

    if (timeLeft > 0) {
      return interaction.reply({ content: `you have already made a wish today!\nplease wait and you can make a wish again <t:${expiredTimestamp}:R>` });
    }

    if (data.vincy < 1) {
      return interaction.reply({ content: 'you dont have enough vincy to throw a coin, please come back later! :3' });
    };
    
    data.cooldown_fontana = now + 86400000;
    await data.save();

    const text_1 = 'this is a fountain where you can make a wish... ✨\n';
    const text_2 = 'take a moment to make your wish~\n';
    const text_3 = '-# you have 15 seconds, then click the button to throw your coin';

    const throw_button = new ButtonBuilder()
      .setCustomId('throw_coin')
      .setLabel('throw coin')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder()
      .addComponents(throw_button);

    const reply = await interaction.reply({ content: text_1 + text_2 + text_3, components: [row], withResponse: true });

    const filter = (i) => i.user.id === interaction.user.id;

    try {
      const button_interaction = await reply.resource.message.awaitMessageComponent({ filter, componentType: ComponentType.Button, time: 15_000 });

      if (button_interaction.customId === 'throw_coin') {
        data.vincy -= 1;
        await data.save();

        await button_interaction.update({ content: `*throw a coin...*`, components: [] });
        await new Promise((resolve) => setTimeout(resolve, 3500));
        await interaction.editReply({ content: `**"your wish has been sent to the stars!"**\n-# see you tomorrow~` });
      }
    } catch (error) {
      data.vincy -= 1;
      await data.save();

      const random_wish = wishes[Math.floor(Math.random() * wishes.length)];
      
      await interaction.editReply({ content: 'not sure what to wish for? dont worry :3', components: [] });
      await new Promise((resolve) => setTimeout(resolve, 4000));
      await interaction.editReply({ content: '*Vinna throws your coin...*' });
      await new Promise((resolve) => setTimeout(resolve, 3500));
      await interaction.editReply({ content: `***"${random_wish}"***\n-# see you tomorrow~` });
    }
  },
};