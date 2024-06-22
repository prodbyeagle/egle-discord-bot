require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');
const { debug } = require('../func/debug');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function connectToDatabase() {
   try {
      // debug('Connecting to MongoDB...', 'info');
      await client.connect();
      // debug('Connected to MongoDB', 'info');
   } catch (error) {
      debug(`Error connecting to MongoDB: ${error.message}`, 'error');
      console.error('Error connecting to MongoDB:', error);
      process.exit(1);
   }
}

async function getDatabase() {
   return client.db('EGLEDB');
}

async function getActiveEvent() {
   const database = client.db('EGLEDB');
   const events = database.collection('events');
   const event = await events.findOne({ active: true });
   if (event) {
      debug(`Active event found: ${event.name}`, 'info');
   } else {
      debug('No active event found', 'info');
   }
   return event;
}

async function saveActiveEvent(activeEvent) {
   const database = await getDatabase();
   const events = database.collection('events');

   const newEventId = new ObjectId();

   try {
      await events.insertOne({ ...activeEvent, _id: newEventId });

      debug(`Active event saved: ${activeEvent.name}`, 'info');
      debug('Other Events Cleared', 'info');

      await events.deleteMany({ _id: { $ne: newEventId } });
   } catch (error) {
      debug('Error saving active event', 'error');
      console.error('Error saving active event:', error);
      throw error;
   }
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
   debug('Giveaways saved to database', 'info');
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

   debug('Giveaways loaded from database', 'info');
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
   debug('Ended giveaways cleared from database', 'info');
}

module.exports = { connectToDatabase, getActiveEvent, saveActiveEvent, getDatabase, saveGiveaways, loadGiveaways, clearEndedGiveaways };
