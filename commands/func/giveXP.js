require('dotenv').config();
const { MongoClient } = require('mongodb');
const { addXP } = require('./addXP');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function getUserByUsername(username) {
   await client.connect();

   const database = client.db('EGLEDB');
   const users = database.collection('users');

   const user = await users.findOne({ username });

   return user;
}

async function giveXP(username, xp_value) {
   try {
      const user = await getUserByUsername(username);

      if (!user) {
         throw new Error(`User with username ${username} not found.`);
      }

      const userId = user.userId;
      const member = null; // Assuming no member object is available here

      await addXP(userId, xp_value, username, member);

      return user;
   } catch (error) {
      console.error('Error giving XP:', error);
      throw error;
   } finally {
      await client.close();
   }
}

module.exports = { giveXP, getUserByUsername };
