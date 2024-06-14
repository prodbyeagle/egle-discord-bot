const { getDatabase } = require('../func/connectDB');

async function checkEventTime() {
   let database;
   try {
      database = await getDatabase();
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
            // event still on
         }
      } else {
            //no events
      }
   } catch (error) {
      console.error('Error checking event time:', error);
   } finally {
      if (database) {
         await database.client.close();
      }
   }
}

module.exports = { checkEventTime };