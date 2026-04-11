// Campus Pace - Stable Upload & Sync Update - 2026-04-11
import { supabase } from '../../src/lib/supabase';

/**
 * Attendance Intelligence Calculation Engine
 */

export const calculateAttendancePercentage = async (studentId: string, mappingId: string) => {
  // 1. Get total conducted lectures for this subject
  const { count: total, error: condError } = await supabase
    .from('lectures_conducted')
    .select('*', { count: 'exact', head: true })
    .eq('mapping_id', mappingId);

  if (condError) throw condError;

  // 2. Get attended lectures for this student (For the given mapping)
  const { data: lectures } = await supabase
    .from('lectures_conducted')
    .select('id')
    .eq('mapping_id', mappingId);
  
  const lectureIds = lectures?.map(l => l.id) || [];

  const { count: attended, error: attError } = await supabase
    .from('attendance_records')
    .select('id', { count: 'exact', head: true })
    .eq('student_id', studentId)
    .eq('status', 'present')
    .in('lecture_id', lectureIds.length > 0 ? lectureIds : ['uuid-placeholder']);

  if (attError && lectureIds.length > 0) throw attError;

  const totalCount = total || 0;
  const attendedCount = attended || 0;
  const percentage = totalCount > 0 ? (attendedCount / totalCount) * 100 : 100;

  return { total: totalCount, attended: attendedCount, absent: totalCount - attendedCount, percentage };
};

export const calculateLecturesNeeded = (attended: number, totalSoFar: number, totalPlanned: number) => {
  // Goal is 75%
  const target = 0.75;
  const remaining = totalPlanned - totalSoFar;
  
  // Formula: (attended + X) / (totalSoFar + X) >= 0.75
  // X >= (0.75 * totalSoFar - attended) / 0.25
  const needed = Math.ceil((target * totalSoFar - attended) / (1 - target));
  const finalNeeded = Math.max(0, needed);

  if (finalNeeded > remaining) {
    const maxPossible = ((attended + remaining) / totalPlanned) * 100;
    return { 
      possible: false, 
      needed: finalNeeded, 
      maxPossiblePercentage: maxPossible,
      message: `Critical: Even with 100% attendance, your max is ${maxPossible.toFixed(1)}%` 
    };
  }

  return { 
    possible: true, 
    needed: finalNeeded, 
    remaining,
    canMiss: Math.floor(remaining - finalNeeded),
    message: `Attend ${finalNeeded} more lectures to reach 75%`
  };
};

export const getRiskLevel = (percentage: number) => {
  if (percentage >= 85) return 'excellent';
  if (percentage >= 75) return 'safe';
  if (percentage >= 65) return 'warning';
  return 'critical';
};

export const refreshAnalyticsCache = async (studentId: string, mappingId: string, totalPlanned: number = 40) => {
  const stats = await calculateAttendancePercentage(studentId, mappingId);
  const prediction = calculateLecturesNeeded(stats.attended, stats.total, totalPlanned);
  const risk = getRiskLevel(stats.percentage);

  const { error } = await supabase
    .from('attendance_analytics_cache')
    .upsert({
      student_id: studentId,
      mapping_id: mappingId,
      total_lectures_conducted: stats.total,
      lectures_attended: stats.attended,
      attendance_percentage: stats.percentage,
      lectures_needed_for_75: prediction.needed,
      risk_level: risk,
      last_updated: new Date().toISOString()
    }, { onConflict: 'student_id,mapping_id' });

  if (error) console.error("Cache update failed:", error);
  return { stats, prediction, risk };
};
