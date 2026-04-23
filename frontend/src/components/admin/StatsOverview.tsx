import React from 'react';
import { StudentProfile, CriterionType } from '../../types';

interface StatsOverviewProps {
  students: StudentProfile[];
  onSelectStudent: (id: string) => void;
  onStartReview: () => void;
  onExpandTop: () => void;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ students, onSelectStudent, onStartReview, onExpandTop }) => {
  const total = students.length;
  const approved = students.filter(s => s.status === 'Approved').length;
  const processing = students.filter(s => s.status === 'Processing').length;
  const rejected = students.filter(s => s.status === 'Rejected').length;

  // Top students: Only show fully APPROVED profiles
  const topStudents = [...students]
    .filter(s => s.status === 'Approved')
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Tổng hồ sơ', val: total, icon: 'fa-file-alt', color: 'bg-blue-500', bg: 'bg-blue-50' },
          { label: 'Đã duyệt', val: approved, icon: 'fa-check-circle', color: 'bg-green-500', bg: 'bg-green-50' },
          { label: 'Cần giải trình', val: processing, icon: 'fa-clock', color: 'bg-orange-500', bg: 'bg-orange-50' },
          { label: 'Từ chối', val: rejected, icon: 'fa-times-circle', color: 'bg-red-500', bg: 'bg-red-50' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} p-6 rounded-2xl border border-gray-100 flex items-center gap-5 transition-transform hover:scale-[1.02] duration-300`}>
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white text-lg border border-white/20`}><i className={`fas ${stat.icon}`}></i></div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-blue-900 font-formal">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-[#fcfdfe] flex justify-between items-center">
            <h3 className="text-xs font-black text-blue-900 uppercase tracking-[0.2em]">Top hồ sơ xuất sắc</h3>
            <button 
              onClick={onExpandTop}
              className="text-[9px] font-black text-blue-600 uppercase hover:text-orange-600 transition-colors flex items-center gap-1.5"
            >
              Xem tất cả <i className="fas fa-external-link-alt text-[8px]"></i>
            </button>
          </div>
          <div className="p-0">
            {topStudents.map((s, i) => (
              <div key={s.id} className="px-6 py-4 flex items-center justify-between hover:bg-orange-50/30 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-4">
                  <span className={`text-xs font-black ${i === 0 ? 'text-orange-500' : 'text-gray-400'}`}>{i + 1}.</span>
                  <div>
                    <p className="text-[10px] font-black text-blue-900 uppercase">{s.fullName}</p>
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{s.class}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-blue-900 font-formal">{s.totalScore}</p>
                  <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest">Điểm xét duyệt</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-8 space-y-6">
        <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest">Tiến độ xét duyệt chung</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Hoàn tất', val: approved, total: total, color: 'bg-green-500' },
            { label: 'Chờ xử lý', val: total - approved - rejected, total: total, color: 'bg-blue-500' },
            { label: 'Từ chối', val: rejected, total: total, color: 'bg-red-500' },
            { label: 'Mục tiêu', val: total, total: total, color: 'bg-orange-500' },
          ].map((circle, i) => (
            <div key={i} className="flex flex-col items-center gap-4">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                  <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray={251.2} strokeDashoffset={251.2 * (1 - circle.val / circle.total)} className={`${circle.color.replace('bg-', 'text-')} transition-all duration-1000`} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-black text-blue-900">{Math.round((circle.val / circle.total) * 100)}%</span>
                </div>
              </div>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{circle.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;
