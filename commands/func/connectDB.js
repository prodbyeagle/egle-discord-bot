require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function connectToDatabase() {
   try {
      await client.connect();
      console.log('Connected to MongoDB');
   } catch (error) {
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
   return event;
}

module.exports = { connectToDatabase, getDatabase, getActiveEvent };