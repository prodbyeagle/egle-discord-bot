const { getDatabase, connectToDatabase } = require('../func/connectDB');

async function checkEventTime() {
   let database;
   try {
      await connectToDatabase();
      database = await getDatabase();
      const events = database.collection('events');

      const currentTime = new Date();
      const activeEvent = await events.findOne({ active: true });

      if (activeEvent) {
         const eventEndTime = new Date(activeEvent.createdAt);
         eventEndTime.setHours(eventEndTime.getHours() + activeEvent.duration);

         if (currentTime > eventEndTime) {
            await events.updateOne({ _id: activeEvent._id }, { $set: { active: false } });
            // console.log(`Event ${activeEvent.name} has ended and status updated.`);
         } else {
            // console.log(`Event ${activeEvent.name} is still active.`);
         }
      } else {
         // console.log('No active events found.');
      }
   } catch (error) {
      console.error('Error checking event time:', error);
   } finally {
      if (database) {
         try {
            await database.client.close();
         } catch (error) {
            console.error('Error closing database connection:', error);
         }
      }
   }
}

module.exports = { checkEventTime };