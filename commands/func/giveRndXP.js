require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function giveRndXP(numMembers, totalXP, guild) {
   try {
      await client.connect();

      const database = client.db('EGLEDB');
      const users = database.collection('users');

      // Fetch all members
      const members = await guild.members.fetch();
      const nonBotMembers = Array.from(members.values()).filter(member => !member.user.bot);

      if (nonBotMembers.length === 0) {
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

      // Distribute XP
      for (const member of selectedMembers) {
         const userId = member.user.id;
         let user = await users.findOne({ userId });

         if (!user) {
            user = { userId, xp: 0, level: 0 };
            await users.insertOne(user);
         }

         user.xp += totalXP;

         const requiredXP = 100 * Math.pow(1.1, user.level);
         if (user.xp >= requiredXP) {
            user.level += 1;
            user.xp -= requiredXP;
         }

         await users.updateOne({ userId }, { $set: { xp: user.xp, level: user.level } });
      }
   } finally {
      // Close the MongoDB client
      await client.close();
   }
}

module.exports = { giveRndXP };