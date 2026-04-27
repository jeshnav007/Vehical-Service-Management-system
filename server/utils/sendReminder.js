import ServiceRecord from '../models/serviceRecordModel.js';
import { createNotification } from '../controllers/notificationController.js';

/**
 * sendReminder Utility
 * Synthesizes mock timelines calculating exactly 6 months past completion
 * Dispatches automated Native Tracker schemas
 */
const sendReminders = async () => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const overdueRecords = await ServiceRecord.find({
      status: 'Completed',
      completedAt: { $lte: sixMonthsAgo }
    }).populate('vehicle');

    let count = 0;
    
    for (const record of overdueRecords) {
      if (record.vehicle && record.vehicle.user) {
        await createNotification(
          record.vehicle.user,
          'Service Reminder',
          `Your vehicle (${record.vehicle.make} ${record.vehicle.model}) is due for routine maintenance. It has been over 6 months since your last repair.`,
          'Reminder' // Type
        );
        count++;
      }
    }

    console.log(`[Automated Cron Hook] Dispatched ${count} maintenance reminders successfully.`);
  } catch (error) {
    console.error(`Reminder Generation Error: ${error.message}`);
  }
};

export default sendReminders;
