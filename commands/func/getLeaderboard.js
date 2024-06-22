require('dotenv').config();
const { getDatabase } = require('../func/connectDB');
const { debug } = require('../func/debug');

function formatXPValue(xp) {
   if (xp >= 1e12) {
      return (xp / 1e12).toFixed(1) + 'T';
   } else if (xp >= 1e9) {
      return (xp / 1e9).toFixed(1) + 'B';
   } else if (xp >= 1e6) {
      return (xp / 1e6).toFixed(1) + 'M';
   } else if (xp >= 1e3) {
      return (xp / 1e3).toFixed(1) + 'k';
   } else {
      return xp.toString();
   }
}

async function getLeaderboard(period) {
   let database;
   try {
      debug(`Fetching ${period} leaderboard`, 'info');
      database = await getDatabase();
      const users = database.collection('users');

      const now = new Date();
      let startDate;

      if (period === 'daily') {
         startDate = new Date(now.setDate(now.getDate() - 1));
      } else if (period === 'weekly') {
         startDate = new Date(now.setDate(now.getDate() - 7));
      } else if (period === 'monthly') {
         startDate = new Date(now.setMonth(now.getMonth() - 1));
      }

      const leaderboard = await users.aggregate([
         { $unwind: '$xpHistory' },
         { $match: { 'xpHistory.timestamp': { $gte: startDate } } },
         {
            $group: {
               _id: '$userId',
               totalXP: { $sum: '$xpHistory.xp' },
               username: { $first: '$username' }
            }
         },
         { $sort: { totalXP: -1 } },
         { $limit: 10 }
      ]).toArray();

      leaderboard.forEach(user => {
         user.totalXP = formatXPValue(user.totalXP);
      });

      debug(`Fetched ${leaderboard.length} entries for ${period} leaderboard`, 'info');
      return leaderboard;
   } catch (error) {
      debug(`Error fetching ${period} leaderboard: ${error.message}`, 'error');
      console.error('Error fetching leaderboard:', error);
      throw error;
   }
}

module.exports = { getLeaderboard };