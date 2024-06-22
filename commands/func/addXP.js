require('dotenv').config();
const { getDatabase, getActiveEvent, connectToDatabase } = require('../func/connectDB');
const { debug } = require('../func/debug');

async function addXP(userId, xp, username, member) {
   try {
      debug(`Connecting to database for user ${userId}`, 'info');
      await connectToDatabase();
      const database = await getDatabase();
      const users = database.collection('users');

      let user = await users.findOne({ userId });

      if (!user) {
         user = { userId, username: username, xp: 0, level: 0, banned: false, xpHistory: [] };
         await users.insertOne(user);
         debug(`New user created: ${username} (${userId})`, 'info');
      } else if (user.banned) {
         debug(`User ${username} (${userId}) is banned`, 'warn');
         if (!user.username) {
            await users.updateOne({ userId }, { $set: { username: username } });
         }
         return null;
      } else if (!user.username) {
         await users.updateOne({ userId }, { $set: { username: username } });
      }

      let multiplier = 1;
      const clanMemberRoleId = '1243691838301274213';

      if (member && member.roles && member.roles.cache) {
         member.roles.cache.forEach(role => {
            if (role.id === clanMemberRoleId) {
               multiplier *= 1.05;
            }
         });
      } else {
         debug(`Member object or roles cache is undefined for user ${userId}`, 'error');
      }

      const now = new Date();
      const isWeekend = (now.getDay() === 6) || (now.getDay() === 0);
      if (isWeekend) {
         multiplier *= 1.1;
         debug(`Weekend multiplier applied for user ${userId}`, 'info');
      } else {
         debug(`Not weekend yet for user ${userId}`, 'info');
      }

      const activeEvent = await getActiveEvent();
      if (activeEvent) {
         multiplier *= activeEvent.multiplier;
         debug(`Active event multiplier applied for user ${userId}`, 'info');
      }

      const gainedXP = Math.floor(xp * multiplier);
      user.xp += gainedXP;
      let requiredXP = Math.floor(100 * Math.pow(1.1, user.level));

      while (user.xp >= requiredXP) {
         user.level += 1;
         user.xp -= requiredXP;
         requiredXP = Math.floor(100 * Math.pow(1.1, user.level));
         debug(`User ${userId} leveled up to ${user.level}`, 'info');
      }

      user.xp = Math.floor(user.xp);

      await users.updateOne(
         { userId },
         {
            $set: { xp: user.xp, level: user.level, username: username },
            $push: { xpHistory: { xp: gainedXP, timestamp: now } }
         }
      );

      debug(`XP updated for user ${userId}: ${gainedXP} XP gained`, 'info');
      return user;

   } catch (error) {
      debug(`Error adding XP for user ${userId}: ${error.message}`, 'error');
      console.error('Error adding XP:', error);
      return null;
   }
}

module.exports = { addXP };