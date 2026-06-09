const crypto = require('crypto');
const user = require('../../database/models/user');
const { numberFormat } = require('../../utils/functions');
const { SlashCommandBuilder } = require('discord.js');

const multipliers = Array.from({ length: 100 }, (_, i) => ({
  name: `${i + 1}x`,
  value: i + 1
}));

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coinflip")
    .setDescription("Flip a coin")
    .addIntegerOption((option) => option
      .setName("amount")
      .setDescription("How much vincy")
      .setRequired(true)
      .setMinValue(1))
    .addStringOption((option) => option
      .setName("side")
      .setDescription("Choose side")
      .addChoices({ name: "Heads", value: "heads" }, { name: "Tails", value: "tails" }))
    .addIntegerOption((option) => option
      .setName("multiplier")
      .setDescription("Choose multiplier")
      .setAutocomplete(true)),
  async autocomplete(interaction) {  
    const focused = interaction.options.getFocused(true);
    const query = focused.value.toLowerCase();

    const matches = multipliers
      .filter((choice) => choice.name.toLowerCase().startsWith(query))
      .slice(0, 25)
      .map((choice) => ({ name: choice.name, value: choice.value }));

    await interaction.respond(matches);
  },
  async execute(interaction) {
    const hash = crypto.createHash("sha256").update(interaction.user.id).digest("hex");
    const data = await user.findOne({ where: { id: hash } });

    if (!data || data.new) return interaction.reply('you are not registered yet, please `/register` first! :3');

    const amount = interaction.options.getInteger("amount");
    if (amount > data.vincy) return interaction.reply('you dont have enough vincy to flip a coin! :\'3');
    
    const side = interaction.options.getString("side") ?? 'heads';
    const multiplier = interaction.options.getInteger("multiplier") ?? 1;

    
    const reward = numberFormat((amount / 100) * multiplier, 2);
    const chance = 1 / (1 + multiplier);
    const chance_text = chance.toFixed(3);

    await interaction.reply(`flip flip...\n-# your potential reward is \`$${reward}\` vincy with a ${chance_text} chance of winning`);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const is_win = Math.random() < chance;
    const result_side = is_win ? side : (side === 'heads' ? 'tails' : 'heads');
    const final_amount = is_win ? (amount / 100) * multiplier : amount / 100;

    data.vincy += is_win ? amount * multiplier : -amount;
    await data.save();

    const landed = result_side.charAt(0).toUpperCase() + result_side.slice(1);
    const result = is_win ? 'you won' : 'you lost';
    const vincy = numberFormat(final_amount, 2);
    const emoji = is_win ? "🎉🎉" : "🥀🥀";

    return interaction.editReply(`the coin landed on **${landed}**!\n${result} \`$${vincy}\` vincy ${emoji}`);
  },
};