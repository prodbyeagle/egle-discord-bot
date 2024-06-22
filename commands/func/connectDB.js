require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function connectToDatabase() {
   try {
      await client.connect();
   } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      process.exit(1);
   }
}

async function getDatabase() {
   return client.db('EGLEDB');
}

async function saveGiveaways(giveawaysMap) {
   const database = await getDatabase();
   const collection = database.collection('giveaways');

   await collection.deleteMany({});

   const giveawayArray = [...giveawaysMap.entries()].map(([id, giveaway]) => ({
      messageId: id,
      ...giveaway,
      participants: [...giveaway.participants],
   }));

   await collection.insertMany(giveawayArray);
}

async function loadGiveaways() {
   const database = await getDatabase();
   const collection = database.collection('giveaways');
   const giveawayArray = await collection.find({}).toArray();
   const giveawaysMap = new Map(giveawayArray.map(giveaway => [
      giveaway.messageId,
      {
         prize: giveaway.prize,
         endTime: giveaway.endTime,
         participants: new Set(giveaway.participants),
         winnersCount: giveaway.winnersCount,
         messageId: giveaway.messageId
      }
   ]));

   return giveawaysMap;
}

async function clearEndedGiveaways() {
   const database = await getDatabase();
   const collection = database.collection('giveaways');
   const latestActiveGiveaway = [...giveaways.entries()].find(g => g.endTime > Date.now());

   if (latestActiveGiveaway) {
      await collection.deleteMany({ messageId: { $ne: latestActiveGiveaway.messageId } });
   } else {
      await collection.deleteMany({});
   }
}

module.exports = { connectToDatabase, getDatabase, saveGiveaways, loadGiveaways, clearEndedGiveaways };
