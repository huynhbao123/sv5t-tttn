import React from 'react';
import { StudentProfile } from '../../types';

interface TopStudentsModalProps {
  show: boolean;
  students: StudentProfile[];
  onClose: () => void;
  onSelectStudent: (id: string) => void;
  onStartReview: () => void;
}

const TopStudentsModal: React.FC<TopStudentsModalProps> = ({ show, students, onClose, onSelectStudent, onStartReview }) => {
  if (!show) return null;

  const topStudentsFull = [...students]
    .filter(s => s.status !== 'Rejected')
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 100);

  return (
    <div className="fixed inset-0 z-[1200] bg-blue-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl border border-gray-100 overflow-hidden animate-fade-up flex flex-col max-h-[90vh]">
        <div className="px-8 py-6 bg-blue-900 text-white flex justify-between items-center flex-shrink-0">
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight">Top 100 Hồ sơ xuất sắc</h3>
            <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mt-1">Sắp xếp theo tổng điểm xét duyệt cao nhất</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"><i className="fas fa-times"></i></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-white z-10 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b">
              <tr>
                <th className="px-6 py-4 w-16">Hạng</th>
                <th className="px-6 py-4">Sinh viên</th>
                <th className="px-6 py-4 text-center">Lớp</th>
                <th className="px-6 py-4 text-center">Tổng điểm</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topStudentsFull.map((s, i) => (
                <tr key={s.id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <span className={`text-sm font-black ${i < 3 ? 'text-orange-500' : 'text-gray-400'}`}>{i + 1}.</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="block font-black text-blue-900 uppercase text-xs">{s.fullName}</span>
                    <span className="block text-[9px] text-gray-400 font-bold uppercase mt-0.5">{s.studentId}</span>
                  </td>
                  <td className="px-6 py-5 text-center text-[11px] font-bold text-gray-500 uppercase">{s.class}</td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-lg font-black text-blue-900 font-formal">{s.totalScore}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => { onSelectStudent(s.id); onStartReview(); onClose(); }}
                      className="px-4 py-2 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-600 hover:text-white transition-all border border-blue-100 group-hover:border-blue-200"
                    >
                      <i className="fas fa-eye mr-1.5"></i>Xem hồ sơ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-gray-50 border-t flex justify-end flex-shrink-0">
           <button onClick={onClose} className="px-10 py-3 bg-blue-900 text-white font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-orange-600 transition-all">Đóng</button>
        </div>
      </div>
    </div>
  );
};

export default TopStudentsModal;
