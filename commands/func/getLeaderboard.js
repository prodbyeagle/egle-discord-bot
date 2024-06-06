const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function getLeaderboard(period) {
   await client.connect();
   const database = client.db('EGLEDB');
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

   await client.close();
   return leaderboard;
}

module.exports = { getLeaderboard };