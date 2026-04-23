import React from 'react';
import { StudentProfile } from '../../types';

interface ApprovedViewProps {
  student: StudentProfile;
}

const ApprovedView: React.FC<ApprovedViewProps> = ({ student }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in space-y-10 font-sans">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-10 text-white border border-white/10 rounded-lg">
        <div className="flex items-center gap-6 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl"><i className="fas fa-award"></i></div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight">Chúc mừng! Hồ sơ đã được duyệt</h2>
            <p className="text-green-100 text-sm font-medium mt-1">Bạn đã được công nhận danh hiệu "Sinh viên 5 Tốt"</p>
          </div>
        </div>
      </div>
      <div className="bg-white border rounded-lg p-8 text-center space-y-6">
        <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
          <i className="fas fa-check-circle text-green-600 text-4xl"></i>
        </div>
        <h3 className="text-xl font-black text-blue-900 uppercase">{student.fullName}</h3>
        <p className="text-gray-400 text-sm">Mã SV: {student.studentId} • {student.faculty}</p>
        <div className="bg-blue-50 rounded-lg p-6 inline-block">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Tổng điểm tích lũy</p>
          <p className="text-5xl font-black text-blue-900 font-formal">{student.totalScore}</p>
        </div>
      </div>
    </div>
  );
};

export default ApprovedView;
