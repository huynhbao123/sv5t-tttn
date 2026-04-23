import React from 'react';
import { StudentProfile } from '../../types';

interface RejectedViewProps {
  student: StudentProfile;
}

const RejectedView: React.FC<RejectedViewProps> = ({ student }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in space-y-10 font-sans">
      <div className="bg-gradient-to-r from-red-600 to-rose-600 p-10 text-white border border-white/10 rounded-lg">
        <div className="flex items-center gap-6 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
            <i className="fas fa-times-circle"></i>
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight">Hồ sơ không được duyệt</h2>
            <p className="text-red-100 text-sm font-medium mt-1">Rất tiếc, hồ sơ của bạn chưa đạt yêu cầu xét duyệt</p>
          </div>
        </div>
        {student.feedback && (
          <p className="text-sm font-medium border-l-4 border-white/40 pl-6 py-2 italic opacity-90 mt-4">
            Lý do: "{student.feedback}"
          </p>
        )}
      </div>
      <div className="bg-white border rounded-lg p-8 text-center space-y-6">
        <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
          <i className="fas fa-file-excel text-red-500 text-4xl"></i>
        </div>
        <h3 className="text-xl font-black text-blue-900 uppercase">{student.fullName}</h3>
        <p className="text-gray-400 text-sm">Mã SV: {student.studentId} • {student.faculty}</p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 max-w-md mx-auto">
          <p className="text-xs text-amber-700 font-medium">
            <i className="fas fa-info-circle mr-2"></i>
            Vui lòng liên hệ Ban cán sự lớp hoặc Đoàn - Hội Sinh viên để được hướng dẫn thêm.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RejectedView;
