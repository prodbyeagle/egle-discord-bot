const { getDatabase, connectToDatabase } = require('../func/connectDB');
const { addXP } = require('./addXP');
const { debug } = require('../func/debug');

async function getUserByUsername(username) {
   try {
      debug(`Fetching user by username: ${username}`, 'info');
      await connectToDatabase();
      const database = await getDatabase();
      const users = database.collection('users');

      const user = await users.findOne({ username });

      if (user) {
         debug(`User found: ${JSON.stringify(user)}`, 'info');
      } else {
         debug(`User not found: ${username}`, 'warn');
      }

      return user;
   } catch (error) {
      debug(`Error fetching user by username: ${error.message}`, 'error');
      console.error('Error fetching user by username:', error);
      throw error;
   }
}

async function giveXP(username, xp_value) {
   try {
      debug(`Giving XP to user: ${username}, XP: ${xp_value}`, 'info');
      await connectToDatabase();
      const database = await getDatabase();
      const users = database.collection('users');

      const user = await getUserByUsername(username);

      if (!user) {
         debug(`User with username ${username} not found`, 'warn');
         throw new Error(`User with username ${username} not found.`);
      }

      const userId = user.userId;
      const member = null;

      await addXP(userId, xp_value, username, member);

      debug(`XP given to user ${username} (${userId}): ${xp_value} XP`, 'info');
      return user;
   } catch (error) {
      debug(`Error giving XP to user ${username}: ${error.message}`, 'error');
      console.error('Error giving XP:', error);
      throw error;
   }
}

module.exports = { giveXP, getUserByUsername };