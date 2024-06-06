require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function addXP(userId, xp, username) {
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
         await client.close();
         console.log('User is banned and XP cannot be added.');
         return;
      } else if (!user.username) {
         await users.updateOne({ userId }, { $set: { username: username } });
      }

      user.xp += xp;

      let requiredXP = Math.floor(100 * Math.pow(1.1, user.level));

      while (user.xp >= requiredXP) {
         user.level += 1;
         user.xp -= requiredXP;
         requiredXP = Math.floor(100 * Math.pow(1.1, user.level));
      }

      user.xp = Math.floor(user.xp);

      await users.updateOne({ userId }, { $set: { xp: user.xp, level: user.level, username: username, banned: false } });
      await client.close();
   } catch (error) {
      console.error('Error adding XP:', error);
   }
}

module.exports = { addXP };