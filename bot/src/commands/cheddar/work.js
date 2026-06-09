const crypto = require('crypto');
const user = require('../../database/models/user');
const { numberFormat, randomInt } = require('../../utils/functions');
const { SlashCommandBuilder } = require('discord.js');

const jobs = ['Cashier', 'Homeless', 'Janitor', 'Maid', 'Streamer', 'Thief'].map(job => ({ name: job, value: job.toLocaleLowerCase() }));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('Work to earn vincy')
    .addStringOption(option => option
      .setName('job')
      .setDescription('Choose job')
      .addChoices(jobs)),
  async execute(interaction) {
    const hash = crypto.createHash('sha256').update(interaction.user.id).digest('hex');
    const data = await user.findOne({ where: { id: hash } });

    const job = interaction.options.getString('job') ?? jobs[Math.floor(Math.random() * jobs.length)].name;

    if (!data || data.new) return interaction.reply({ content: 'you are not registered yet, please `/register` first! :3' });
    
    const cost_energy = randomInt(1, 10);
    if (data.energy < cost_energy) return interaction.reply({ content: 'you dont have enough energy to work! \':3' });
    
    await interaction.reply({ content: `work working working...` });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const earn = randomInt(100 * data.level, 1000 * data.level);
    data.vincy += earn;
    data.energy -= cost_energy;
    await data.save();

    const text = job.replace(job[0], job[0].toUpperCase());
    const earned = numberFormat(earn / 100, 2);
  
    await interaction.editReply({ content: `you worked as a **${text}** and earned \`$${earned}\` vincy!` });
  },
};