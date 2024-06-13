const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function checkEventTime() {
   try {
      await client.connect();
      const database = client.db('EGLEDB');
      const events = database.collection('events');

      const currentTime = new Date();
      const activeEvent = await events.findOne({ active: true });

      if (activeEvent) {
         const eventEndTime = new Date(activeEvent.createdAt);
         eventEndTime.setHours(eventEndTime.getHours() + activeEvent.duration);

         if (currentTime > eventEndTime) {
            await events.updateOne({ _id: activeEvent._id }, { $set: { active: false } });
            console.log(`Event ${activeEvent.name} has ended and status updated.`);
         } else {
            console.log(`Event ${activeEvent.name} is still active.`);
         }
      } else {
         console.log('No active event found.');
      }
   } catch (error) {
      console.error('Error checking event time:', error);
   } finally {
      await client.close();
   }
}

module.exports = { checkEventTime };
