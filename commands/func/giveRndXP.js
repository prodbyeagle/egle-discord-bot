const { getDatabase, connectToDatabase } = require('./connectDB');
const { debug } = require('../func/debug');

async function giveRndXP(numMembers, totalXP, guild, usernames) {
   try {
      debug('Connecting to database...', 'info');
      await connectToDatabase();
      const database = await getDatabase();
      const users = database.collection('users');

      const members = await guild.members.fetch();
      const nonBotMembers = Array.from(members.values()).filter(member => !member.user.bot);

      if (nonBotMembers.length === 0) {
         debug('No members found to give XP', 'warn');
         throw new Error('No members found.');
      }

      // Select random members
      const selectedMembers = [];
      while (selectedMembers.length < numMembers && selectedMembers.length < nonBotMembers.length) {
         const randomIndex = Math.floor(Math.random() * nonBotMembers.length);
         const selectedMember = nonBotMembers[randomIndex];
         if (!selectedMembers.includes(selectedMember)) {
            selectedMembers.push(selectedMember);
         }
      }

      for (let i = 0; i < selectedMembers.length; i++) {
         const member = selectedMembers[i];
         const userId = member.user.id;
         const username = usernames[i]; // Get username corresponding to the member

         let user = await users.findOne({ userId });

         if (!user) {
            user = { userId, xp: 0, level: 0, username }; // Add username when creating new user
            await users.insertOne(user);
            debug(`New user created: ${userId}`, 'info');
         }

         user.xp += totalXP;

         const requiredXP = 100 * Math.pow(1.1, user.level);
         if (user.xp >= requiredXP) {
            user.level += 1;
            user.xp -= requiredXP;
            debug(`User ${userId} leveled up to ${user.level}`, 'info');
         }

         // Update user including username
         await users.updateOne({ userId }, { $set: { xp: user.xp, level: user.level, username } });
         debug(`XP updated for user ${userId}: ${totalXP} XP added`, 'info');
      }
   } catch (error) {
      debug(`Error giving random XP: ${error.message}`, 'error');
      console.error('Error giving random XP:', error);
   }
}

module.exports = { giveRndXP };