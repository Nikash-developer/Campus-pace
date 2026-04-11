// Campus Pace - Stable Upload & Sync Update - 2026-04-11
import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Mail, Phone, ExternalLink, Download } from 'lucide-react';
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import toast from 'react-hot-toast';

interface Defaulter {
  student_id: string;
  attendance_percentage: number;
  lectures_attended: number;
  total_lectures_conducted: number;
  risk_level: string;
  auth_users?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

interface DefaulterListProps {
  defaulters: Defaulter[];
  subjectName: string;
  theme: any;
}

export const DefaulterList: React.FC<DefaulterListProps> = ({
  defaulters,
  subjectName,
  theme: t
}) => {
  const exportCSV = () => {
    const data = defaulters.map(d => ({
      Name: d.auth_users?.name || 'Unknown',
      Email: d.auth_users?.email || 'N/A',
      Attendance: `${d.attendance_percentage.toFixed(1)}%`,
      Lectures: `${d.lectures_attended}/${d.total_lectures_conducted}`,
      Risk: d.risk_level.toUpperCase()
    }));

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Defaulter_List_${subjectName.replace(/\s+/g, '_')}.csv`;
    link.click();
    toast.success('CSV Exported');
  };

  const exportPDF = () => {
    const doc = new jsPDF() as any;
    doc.setFontSize(18);
    doc.text(`Defaulter List - ${subjectName}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 28);

    const body = defaulters.map(d => [
      d.auth_users?.name || 'Unknown',
      d.auth_users?.email || 'N/A',
      `${d.attendance_percentage.toFixed(1)}%`,
      `${d.lectures_attended}/${d.total_lectures_conducted}`,
      d.risk_level.toUpperCase()
    ]);

    doc.autoTable({
      head: [['Name', 'Email', 'Attendance', 'Lectures', 'Risk Level']],
      body: body,
      startY: 35,
      theme: 'grid',
      headStyles: { fillColor: [34, 197, 94] }
    });

    doc.save(`Defaulter_List_${subjectName.replace(/\s+/g, '_')}.pdf`);
    toast.success('PDF Exported');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-red-50 p-4 rounded-2xl border border-red-100">
        <div className="flex items-center gap-3">
          <AlertTriangle className="text-red-500" size={20} />
          <div>
            <p className="text-sm font-black text-red-900">Attendance Alert</p>
            <p className="text-[10px] text-red-700 font-bold uppercase tracking-wider">
              {defaulters.length} students are below 75% threshold
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="p-2 bg-white text-slate-600 rounded-xl hover:bg-slate-50 transition-all border border-slate-200"
            title="Export CSV"
          >
            <Download size={16} />
          </button>
          <button
            onClick={exportPDF}
            className="p-2 bg-white text-slate-600 rounded-xl hover:bg-slate-50 transition-all border border-slate-200"
            title="Export PDF"
          >
            <ExternalLink size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {defaulters.map((d, idx) => (
          <motion.div
            key={d.student_id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`p-4 rounded-2xl border ${t.card} ${t.border} flex items-center justify-between group hover:shadow-md transition-all`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-100">
                <img src={d.auth_users?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${d.auth_users?.name}`} alt="" />
              </div>
              <div>
                <h4 className={`text-sm font-black ${t.heading}`}>{d.auth_users?.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                    d.risk_level === 'critical' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                  }`}>
                    {d.risk_level}
                  </span>
                  <span className={`text-[10px] font-bold ${t.muted}`}>• {d.attendance_percentage.toFixed(1)}% Attendance</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.location.href = `mailto:${d.auth_users?.email}`}
                className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
              >
                <Mail size={16} />
              </button>
              <button className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 transition-all">
                <Phone size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
