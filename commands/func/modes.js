const { ActivityType } = require('discord.js');

const Modes = {
   DEBUG: 'debug',
   MAINTENANCE: 'maintenance',
   ONLINE: 'online'
};

async function setBotPresence(client, mode) {
   switch (mode) {
      case Modes.DEBUG:
         await client.user.setPresence({
            status: 'idle',
            activities: [{
               type: ActivityType.Custom,
               name: "DEBUG Mode",
               state: "🔧 Debug"
            }]
         });
         break;
      case Modes.MAINTENANCE:
         await client.user.setPresence({
            status: 'idle',
            activities: [{
               type: ActivityType.Custom,
               name: "Maintenance Mode",
               state: "💔 Maintenance"
            }]
         });
         break;
      case Modes.ONLINE:
         await client.user.setPresence({
            activities: [{
               type: ActivityType.Custom,
               name: "EGLE",
               state: "🦅 EGLE"
            }]
         });
         break;
      default:
         console.warn(`Unknown mode "${mode}". Using default Online mode.`);
         await setBotPresence(client, Modes.ONLINE);
         break;
   }
}

module.exports = {
   Modes,
   setBotPresence
};