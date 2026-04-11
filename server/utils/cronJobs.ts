// Campus Pace - Stable Upload & Sync Update - 2026-04-11
import cron from 'node-cron';
import { supabase } from '../../src/lib/supabase';
import { sendEmail, templates } from '../services/emailService';

// Run every day at 6:00 PM
export const initCronJobs = () => {
  cron.schedule('0 18 * * *', async () => {
    console.log("Running daily attendance scan...");
    try {
      // Find students with warning or critical risk levels who haven't been notified recently
      const { data: defaulters, error } = await supabase
        .from('attendance_analytics_cache')
        .select(`
          *,
          auth_users:student_id (
            name,
            email
          ),
          subject_class_mapping:mapping_id (
            subject_name
          )
        `)
        .in('risk_level', ['warning', 'critical']);

      if (error) throw error;

      console.log(`Found ${defaulters.length} students at risk.`);

      for (const record of defaulters) {
        if (!record.auth_users?.email) continue;
        
        const templateInfo = record.risk_level === 'critical' 
          ? templates.criticalAlert(
              record.auth_users.name, 
              record.subject_class_mapping.subject_name,
              record.attendance_percentage,
              record.lectures_needed_for_75,
              record.total_lectures_conducted // Approximate remaining as total for now, or you'd calculate it
            )
          : templates.defaulterWarning(
              record.auth_users.name, 
              record.subject_class_mapping.subject_name,
              record.attendance_percentage,
              record.lectures_needed_for_75,
              record.total_lectures_conducted
            );

        // Send email (In real production, check if we already emailed them today)
        await sendEmail(
          record.auth_users.email,
          templateInfo.subject,
          templateInfo.html,
          templateInfo.text
        );
      }
      
      console.log("Daily attendance scan completed.");
    } catch (error) {
      console.error("Error running daily cron job:", error);
    }
  });
  
  console.log("Cron jobs initialized.");
};
