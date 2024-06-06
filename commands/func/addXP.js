require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function getActiveEvent() {
   await client.connect();
   const database = client.db('EGLEDB');
   const events = database.collection('events');
   const event = await events.findOne({ active: true });
   return event;
}

async function addXP(userId, xp, username, member) {
   try {
      await client.connect();

      const database = client.db('EGLEDB');
      const users = database.collection('users');

      let user = await users.findOne({ userId });

      if (!user) {
         user = { userId, username: username, xp: 0, level: 0, banned: false };
         await users.insertOne(user);

      } else if (user.banned) {
         if (!user.username) {
            await users.updateOne({ userId }, { $set: { username: username } });
         }

         return;
      } else if (!user.username) {
         await users.updateOne({ userId }, { $set: { username: username } });
      }

      let multiplier = 1;

      // const clanMemberRoleId = '1243678249037594755';

      // if (member && member.roles) {
      //    member.roles.cache.forEach(role => {
      //       if (role.id === clanMemberRoleId) {
      //          multiplier *= 1.05;
      //       }
      //    });
      // } else {
      //    console.error('Member object is undefined or does not have roles property.');
      // }

      const now = new Date();
      const isWeekend = (now.getDay() === 6) || (now.getDay() === 0);
      if (isWeekend) {
         multiplier *= 1.1;
      }

      const activeEvent = await getActiveEvent();
      if (activeEvent) {
         multiplier *= activeEvent.multiplier;
      }

      user.xp += Math.floor(xp * multiplier);
      let requiredXP = Math.floor(100 * Math.pow(1.1, user.level));

      while (user.xp >= requiredXP) {
         user.level += 1;
         user.xp -= requiredXP;
         requiredXP = Math.floor(100 * Math.pow(1.1, user.level));
      }

      user.xp = Math.floor(user.xp);

      await users.updateOne({ userId }, { $set: { xp: user.xp, level: user.level, username: username } });
   } catch (error) {
      console.error('Error adding XP:', error);
   } finally {
      await client.close();
   }
}

module.exports = { addXP };
