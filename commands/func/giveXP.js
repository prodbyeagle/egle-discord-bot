const { getDatabase } = require('../func/connectDB');
const { addXP } = require('./addXP');

async function getUserByUsername(username) {
   try {
      const database = await getDatabase();
      const users = database.collection('users');

      const user = await users.findOne({ username });

      return user;
   } catch (error) {
      console.error('Error fetching user by username:', error);
      throw error;
   }
}

async function giveXP(username, xp_value) {
   try {
      const database = await getDatabase();
      const users = database.collection('users');

      const user = await getUserByUsername(username);

      if (!user) {
         throw new Error(`User with username ${username} not found.`);
      }

      const userId = user.userId;
      const member = null;

      await addXP(userId, xp_value, username, member);

      return user;
   } catch (error) {
      console.error('Error giving XP:', error);
      throw error;
   }
}

module.exports = { giveXP, getUserByUsername };