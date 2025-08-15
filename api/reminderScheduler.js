import cron from 'node-cron';
import Doctor from './models/Doctor.js';
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import moment from 'moment-timezone';

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendReminderEmail = async (email, name, time, doctor, hours) => {
  const msg = {
    to: email,
    from: process.env.SENDGRID_EMAIL,
    subject: `⏰ Reminder: Appointment in ${hours} hours`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f0f4f8; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <div style="background-color: #4CAF50; color: white; padding: 20px 30px; text-align: center;">
            <h2 style="margin: 0;">📅 Upcoming Appointment</h2>
          </div>
          <div style="padding: 30px; color: #333;">
            <p style="font-size: 16px;">Dear <strong>${name}</strong>,</p>
            <p style="font-size: 16px;">This is a friendly reminder about your appointment with <strong>Dr. ${doctor}</strong>.</p>
            <p style="font-size: 16px;"><strong>📍 Date & Time:</strong> <span style="color: #4CAF50;">${moment(time).tz('Asia/Kolkata').format('dddd, MMMM Do YYYY, h:mm A')}</span></p>
            <p style="font-size: 16px;">⏰ This reminder was sent <strong>${hours}</strong> hour(s) in advance.</p>
          </div>
          <div style="background-color: #e9ecef; padding: 15px; text-align: center; font-size: 13px; color: #555;">
            <p style="margin: 0;">Need to reschedule or cancel? Please contact your clinic directly.</p>
          </div>
        </div>
      </div>
    `
  };
  try {
    await sgMail.send(msg);
    console.log(`✅ ${hours}hr reminder sent to ${email}`);
  } catch (err) {
    console.error('❌ Email error:', err);
  }
};

const reminderScheduler = () => {
  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_EMAIL) {
    console.warn('⚠️ Reminder scheduler disabled: missing SENDGRID envs');
    return;
  }
  cron.schedule('* * * * *', async () => {
    const now = moment().tz('Asia/Kolkata');

    const doctors = await Doctor.find();

    for (let doc of doctors) {
      let updated = false;

      for (let appt of doc.appointments) {
        if (!appt.appointmentTime) continue;

        const apptTime = moment(appt.appointmentTime).tz('Asia/Kolkata');
        const diff = apptTime.diff(now, 'hours', true); // fractional hours

        console.log(`🔍 Checking appointment for ${appt.patientName}: ${diff.toFixed(2)} hours remaining`);

        if (diff > 23.5 && diff < 24.5 && !appt.notifiedTwentyFourHours) {
          await sendReminderEmail(appt.patientContact, appt.patientName, apptTime, doc.name, 24);
          appt.notifiedTwentyFourHours = true;
          updated = true;
        }

        if (diff > 0.5 && diff < 1.5 && !appt.notifiedOneHour) {
          await sendReminderEmail(appt.patientContact, appt.patientName, apptTime, doc.name, 1);
          appt.notifiedOneHour = true;
          updated = true;
        }
      }

      if (updated) {
        await doc.save();
      }
    }
  });

  console.log('🔁 Appointment reminder cron started (IST)');
};

export default reminderScheduler;
