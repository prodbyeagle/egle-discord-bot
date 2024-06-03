require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
   const command = require(`./commands/${file}`);
   client.commands.set(command.data.name, command);
   console.log(`⚙️  Command: /${command.data.name} added`);
}

client.once("ready", async () => {
   console.log(`🗝️  Logged in as ${client.user.tag}`);

   client.user.setPresence({
      activities: [{ name: "・Online" }],
      status: "online",
   });
});

client.on('interactionCreate', async interaction => {
   if (interaction.isCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) return;

      try {
         await command.execute(interaction);
      } catch (error) {
         console.error(error);
         await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
      }
   } else if (interaction.isAutocomplete()) {
      const focusedOption = interaction.options.getFocused(true);

      switch (interaction.commandName) {
         case "unjail":
            if (focusedOption.name === "user") {
               const guild = interaction.guild;
               const mutedRole = guild.roles.cache.get("1243678246755766404");
               if (!mutedRole) return interaction.reply("Die angegebene Rollen-ID existiert nicht in diesem Server.");

               const membersWithMutedRole = mutedRole.members.map(member => ({
                  name: member.user.username,
                  value: member.user.id
               }));

               await interaction.respond(membersWithMutedRole);
            }
            break;
      }
   } else if (interaction.isModalSubmit()) {
      if (interaction.customId === 'applicationModal') {
         const { handleApplicationModalSubmit } = require('./scripts');
         await handleApplicationModalSubmit(interaction, client);
      } else if (interaction.customId.endsWith('ReasonModal')) {
         const { handleReasonModalSubmit } = require('./scripts');
         await handleReasonModalSubmit(interaction);
      }
   } else if (interaction.isButton()) {
      const { handleButtonInteraction } = require('./scripts');
      await handleButtonInteraction(interaction);
   }
});

client.login(process.env.DISCORD_TOKEN);
