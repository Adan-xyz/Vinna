const { Events, ActivityType } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    const servers = client.guilds.cache.size;
    const members = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
    
    const status = [{ name: ':3', type: ActivityType.Playing },
                    { name: `${servers} servers & ${members} members`, type: ActivityType.Watching }];

    setInterval(() => {
      const random = Math.floor(Math.random() * status.length);
      client.user.setActivity(status[random]);
    }, 10000);
  },
};