import React from 'react';
import { StudentProfile } from '../../types';

interface SubmissionSummaryProps {
  student: StudentProfile;
  allHardMet: boolean;
  isLocked: boolean;
  canEdit: boolean;
  onSubmit: () => void;
}

const SubmissionSummary: React.FC<SubmissionSummaryProps> = ({ student, allHardMet, isLocked, canEdit, onSubmit }) => {
  return (
    <div className="animate-fade-in space-y-10 text-center py-6">
      <div className="max-w-md mx-auto space-y-6">
        <div className={`w-20 h-20 mx-auto flex items-center justify-center rounded-full ring-4 transition-all ${allHardMet ? 'bg-green-100 ring-green-50' : 'bg-red-100 ring-red-50'}`}>
          <i className={`fas ${allHardMet ? 'fa-check text-green-600' : 'fa-times text-red-600'} text-3xl`}></i>
        </div>
        <h2 className="text-2xl font-black text-[#0054a6] uppercase font-formal">{allHardMet ? 'Sẵn sàng nộp hồ sơ' : 'Chưa đủ điều kiện'}</h2>
      </div>
      <div className="bg-[#002b5c] p-12 text-white border border-white/20 rounded-lg">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] mb-2 text-orange-400">Tổng điểm tích lũy dự kiến</p>
        <h3 className="text-6xl font-bold mb-10 font-formal">{student.totalScore}</h3>

        <button disabled={isLocked || !allHardMet || !canEdit} onClick={onSubmit} className={`px-16 py-5 font-bold text-[10px] uppercase tracking-[0.3em] transition-all border-2 rounded-lg ${isLocked || !allHardMet || !canEdit ? 'border-gray-600 text-gray-600 cursor-not-allowed bg-transparent' : 'bg-orange-600 text-white hover:bg-white hover:text-blue-900 border-transparent active:scale-95'}`}>
          {isLocked ? 'HỒ SƠ ĐANG CHỜ DUYỆT' : (!canEdit ? 'HẾT HẠN NỘP HỒ SƠ' : 'GỬI XÉT DUYỆT CHÍNH THỨC')}
        </button>
      </div>
    </div>
  );
};

export default SubmissionSummary;
