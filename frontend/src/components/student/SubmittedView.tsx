import React from 'react';
import { CriterionType, StudentProfile } from '../../types';
import { checkHardMet } from '../../pages/StudentDashboard';

interface SubmittedViewProps {
  student: StudentProfile;
  isSubmissionOpen: boolean;
  isReviewed: boolean;
  canEdit: boolean;
  criteriaGroups: any[];
  systemSettings: any;
  onShowUnsubmitModal: () => void;
}

const SubmittedView: React.FC<SubmittedViewProps> = ({ student, isSubmissionOpen, isReviewed, canEdit, criteriaGroups, systemSettings, onShowUnsubmitModal }) => {
  const isApproved = student.status === 'Approved';
  const isRejected = student.status === 'Rejected';
  const isProcessing = student.status === 'Processing';

  return (
    <>
      {/* Submission Window Banner */}
      {!isSubmissionOpen && !isApproved && !isRejected && (
        <div className="bg-red-600 text-white px-4 py-3 flex items-center justify-center gap-4 animate-pulse-slow">
          <i className="fas fa-exclamation-triangle"></i>
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">
            {systemSettings?.ThongBaoHetHan || "Cổng nộp hồ sơ hiện đã đóng. Bạn không thể nộp hoặc chỉnh sửa hồ sơ mới."}
          </span>
          {!isProcessing && <div className="px-3 py-1 bg-white/20 rounded border border-white/30 text-[8px]">READ ONLY</div>}
        </div>
      )}
      {isSubmissionOpen && !isApproved && !isRejected && systemSettings?.ThongBaoHieuLuc && (
         <div className="bg-blue-600 text-white px-4 py-2 flex items-center justify-center gap-4 animate-fade-in text-[9px] font-bold uppercase tracking-widest">
            <i className="fas fa-bullhorn"></i>
            <span>{systemSettings.ThongBaoHieuLuc}</span>
         </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in space-y-10 font-sans">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-10 text-white border border-white/10 rounded-lg">
        <div className="flex items-center gap-6 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
            <i className="fas fa-paper-plane animate-pulse"></i>
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tight font-formal">Hồ sơ đã được nộp</h2>
            <p className="text-blue-100 font-bold uppercase text-[10px] tracking-widest mt-1">Trạng thái: Đang chờ thẩm định</p>
          </div>
        </div>
        <p className="text-sm font-medium leading-relaxed opacity-90 max-w-2xl">
          Hồ sơ của bạn đã được gửi lên hệ thống và đang chờ Ban thư ký Hội Sinh viên thẩm định. Trong thời gian này, các tính năng chỉnh sửa sẽ tạm khóa để đảm bảo tính toàn vẹn của dữ liệu.
        </p>
        <div className="mt-8 pt-8 border-t border-white/10 flex flex-wrap gap-4">
          {/* Chỉ cho Hủy nộp khi: cổng mở + Admin CHƯA tác động hồ sơ */}
          {canEdit && student.status === 'Submitted' && !isReviewed && (
            <button
              onClick={onShowUnsubmitModal}
              className="px-8 py-3 bg-white text-blue-600 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-orange-500 hover:text-white transition-all active:scale-95 border border-gray-100"
            >
              Hủy nộp để chỉnh sửa
            </button>
          )}
          {/* Admin đã xem/tác động → khóa vĩnh viễn, không cho hủy nộp dù cổng còn mở */}
          {canEdit && student.status === 'Submitted' && isReviewed && (
            <div className="px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
              <i className="fas fa-lock text-orange-400"></i> Admin đã thẩm định — Không thể hủy nộp
            </div>
          )}
          {!canEdit && student.status === 'Submitted' && (
             <div className="px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                <i className="fas fa-lock"></i> Hiện đã hết hạn chỉnh sửa
             </div>
          )}
          <button 
            onClick={() => window.print()}
            className="px-8 py-3 bg-blue-700/50 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all border border-white/20"
          >
            Xem & In hồ sơ (PDF)
          </button>
        </div>
      </div>

      {/* Thông tin thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Tổng điểm tích lũy', val: student.totalScore, icon: 'fa-star', color: 'text-orange-500' },
          { label: 'Tiêu chí đạt', val: Object.values(CriterionType).filter(c => checkHardMet(c as CriterionType, student, criteriaGroups)).length + '/5', icon: 'fa-check-circle', color: 'text-green-500' },
          { label: 'Minh chứng đính kèm', val: Object.values(student.evidences).flat().length, icon: 'fa-file-alt', color: 'text-blue-500' },
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-lg ${item.color}`}><i className={`fas ${item.icon}`}></i></div>
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</p>
              <p className="text-xl font-black text-gray-900 font-formal">{item.val}</p>
            </div>
          </div>
        ))}
      </div>
      </div>
    </>
  );
};

export default SubmittedView;
