const crypto = require('crypto');
const user = require('../../database/models/user');
const { numberFormat, randomInt } = require('../../utils/functions');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slot')
    .setDescription('Play slot machine')
    .addIntegerOption(option => option
      .setName('bet')
      .setDescription('Bet amount')
      .setRequired(true)
      .setMinValue(1)),
  async execute(interaction) {
    const hash = crypto.createHash('sha256').update(interaction.user.id).digest('hex');
    const data = await user.findOne({ where: { id: hash } });

    if (!data || data.new) return interaction.reply({ content: 'you are not registered yet, please `/register` first! :3' });

    const bet = interaction.options.getInteger('bet');
    if (bet > data.vincy) return interaction.reply({ content: 'you don\'t have enough vincy to bet that much!' });

    const slot = ['🍒', '🍋', '🍊', '🍇', '🍉', '🍍', '🍓', '🍑'];
    const payouts = { '🍒': 10, '🍋': 15, '🍊': 20, '🍇': 25, '🍉': 30, '🍍': 35, '🍓': 40, '🍑': 50 };
    
    const result_1 = slot[randomInt(0, slot.length - 1)];
    const result_2 = slot[randomInt(0, slot.length - 1)];
    const result_3 = slot[randomInt(0, slot.length - 1)];

    await interaction.reply(`spinning...\n[ 🎰 | 🎰 | 🎰 ]`);
    await new Promise(resolve => setTimeout(resolve, 10));

    for (let i = 0; i < 15; i++) {
      let random_1 = slot[randomInt(0, slot.length - 1)];
      let random_2 = slot[randomInt(0, slot.length - 1)];
      let random_3 = slot[randomInt(0, slot.length - 1)];
      
      await interaction.editReply(`spinning...\n[ ${random_1} | ${random_2} | ${random_3} ]`);
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    const reels = `[ ${result_1} | ${result_2} | ${result_3} ]`;

    const is_jackpot = result_1 === result_2 && result_2 === result_3;
    const is_pair = result_1 === result_2 || result_2 === result_3 || result_1 === result_3;

    let winnings, result_text, emoji;

    if (is_jackpot) {
      const multiplier = payouts[result_1];
      winnings = bet * multiplier;
      data.vincy += winnings;
      result_text = `jackpot! you won \`$${numberFormat(winnings / 100, 2)}\` vincy (${multiplier}x)`;
      emoji = '🎉🎉';
    } else if (is_pair) {
      winnings = Math.floor(bet / 2);
      data.vincy += winnings;
      result_text = `two of a kind! you won back \`$${numberFormat(winnings / 100, 2)}\` vincy`;
      emoji = '✨✨';
    } else {
      data.vincy -= bet;
      result_text = `no match. you lost \`$${numberFormat(bet / 100, 2)}\` vincy`;
      emoji = '🥀🥀';
    }

    await data.save();

    return interaction.editReply(`${reels}\n${result_text} ${emoji}`);
  },
};