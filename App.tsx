
import React, { useState, useEffect } from 'react';
import { CriterionType, Evidence, StudentProfile, EvidenceLevel, EvidenceType, FeaturedFace, FieldVerification } from './types';
import { SUB_CRITERIA, FACES_OF_THE_YEAR as INITIAL_FACES } from './constants';
import Layout from './components/Layout';
import EvidenceForm from './components/EvidenceForm';

const POINT_MATRIX: Record<EvidenceLevel, Record<EvidenceType, number>> = {
  [EvidenceLevel.KHOA]: { [EvidenceType.NO_DECISION]: 0.1, [EvidenceType.WITH_DECISION]: 0.1, [EvidenceType.GK]: 0.1 },
  [EvidenceLevel.TRUONG]: { [EvidenceType.NO_DECISION]: 0.2, [EvidenceType.WITH_DECISION]: 0.3, [EvidenceType.GK]: 0.4 },
  [EvidenceLevel.DHDN]: { [EvidenceType.NO_DECISION]: 0.3, [EvidenceType.WITH_DECISION]: 0.4, [EvidenceType.GK]: 0.5 },
  [EvidenceLevel.TINH_TP]: { [EvidenceType.NO_DECISION]: 0.4, [EvidenceType.WITH_DECISION]: 0.5, [EvidenceType.GK]: 0.6 },
  [EvidenceLevel.TW]: { [EvidenceType.NO_DECISION]: 0.5, [EvidenceType.WITH_DECISION]: 0.6, [EvidenceType.GK]: 0.7 },
};

const STEPS = [
  'HARD_CRITERIA' as const,
  CriterionType.ETHICS,
  CriterionType.ACADEMIC,
  CriterionType.PHYSICAL,
  CriterionType.VOLUNTEER,
  CriterionType.INTEGRATION,
  'SUBMIT' as const
];

const STEP_LABELS: Record<string, string> = {
  'HARD_CRITERIA': 'Tiêu chí cứng',
  [CriterionType.ETHICS]: 'MC Đạo đức',
  [CriterionType.ACADEMIC]: 'MC Học tập',
  [CriterionType.PHYSICAL]: 'MC Thể lực',
  [CriterionType.VOLUNTEER]: 'MC Tình nguyện',
  [CriterionType.INTEGRATION]: 'MC Hội nhập',
  'SUBMIT': 'Gửi hồ sơ',
};

const checkHardMet = (cat: CriterionType, student: StudentProfile) => {
  const evs = student.evidences[cat] || [];
  const approvedEvs = evs.filter(e => e.status === 'Approved' || e.status === 'Pending');

  switch (cat) {
    case CriterionType.ETHICS:
      return student.trainingPoints >= 80 && student.noViolation;
    case CriterionType.ACADEMIC:
      return student.gpa >= 3.2 && student.gpa <= 4.0;
    case CriterionType.PHYSICAL:
      return student.peScore >= 7.0 || approvedEvs.some(e => e.subCriterionId === 'phy_hard_2');
    case CriterionType.VOLUNTEER: {
      const hasMainCamp = approvedEvs.some(e => ['vol_hard_1', 'vol_hard_3'].includes(e.subCriterionId));
      const hasBlood = approvedEvs.some(e => e.subCriterionId === 'vol_hard_4');
      const dayCount = approvedEvs.filter(e => e.subCriterionId === 'vol_hard_2').length;
      return hasMainCamp || dayCount >= 3 || hasBlood;
    }
    case CriterionType.INTEGRATION:
      return (
        (((['B1', 'B2'].includes(student.englishLevel) || student.englishGpa >= 3.0) && (student.englishGpa <= 4.0)) ||
          approvedEvs.some(e => ['int_hard_3', 'int_hard_4', 'int_hard_5'].includes(e.subCriterionId)))
      );
    default:
      return false;
  }
};

const StudentDashboard: React.FC<{
  student: StudentProfile;
  addEvidence: (type: CriterionType, ev: Evidence) => void;
  removeEvidence: (type: CriterionType, id: string) => void;
  updateProfile: (data: Partial<StudentProfile>) => void;
  updateEvidenceExplanation: (cat: CriterionType, id: string, explanation: string) => void;
  updateFieldExplanation: (field: keyof StudentProfile['verifications'], explanation: string) => void;
  onSubmit: () => void;
  onResubmit: () => void;
}> = ({ student, addEvidence, removeEvidence, updateProfile, updateEvidenceExplanation, updateFieldExplanation, onSubmit, onResubmit }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [addingTo, setAddingTo] = useState<{ type: CriterionType, isHard: boolean, subName: string } | null>(null);

  const isLocked = student.status === 'Approved' || student.status === 'Submitted' || student.status === 'Rejected';
  const isProcessing = student.status === 'Processing';
  const isApproved = student.status === 'Approved';
  const isRejected = student.status === 'Rejected';

  // Lấy danh sách các mục bị Admin bắt lỗi
  const flaggedEvidences: { cat: CriterionType, ev: Evidence }[] = [];
  Object.entries(student.evidences).forEach(([cat, list]) => {
    (list as Evidence[]).forEach(ev => {
      if (ev.status === 'NeedsExplanation') flaggedEvidences.push({ cat: cat as CriterionType, ev });
    });
  });

  const flaggedFields: { key: keyof StudentProfile['verifications'], label: string, val: any }[] = [];
  if (student.verifications.trainingPoints.status === 'NeedsExplanation') flaggedFields.push({ key: 'trainingPoints', label: 'Điểm rèn luyện', val: student.trainingPoints });
  if (student.verifications.gpa.status === 'NeedsExplanation') flaggedFields.push({ key: 'gpa', label: 'GPA Học tập', val: student.gpa });
  if (student.verifications.peScore.status === 'NeedsExplanation') flaggedFields.push({ key: 'peScore', label: 'Điểm Thể dục', val: student.peScore });
  if (student.verifications.english.status === 'NeedsExplanation') flaggedFields.push({ key: 'english', label: 'Ngoại ngữ', val: `${student.englishLevel}` });

  // GIAO DIỆN KHI HỒ SƠ ĐÃ ĐƯỢC DUYỆT
  if (isApproved) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in space-y-10 font-sans">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-10 text-white shadow-2xl rounded-lg">
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
  }

  // GIAO DIỆN KHI HỒ SƠ BỊ TỪ CHỐI
  if (isRejected) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in space-y-10 font-sans">
        <div className="bg-gradient-to-r from-red-600 to-rose-600 p-10 text-white shadow-2xl rounded-lg">
          <div className="flex items-center gap-6 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl"><i className="fas fa-times-circle"></i></div>
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
            <p className="text-xs text-amber-700 font-medium"><i className="fas fa-info-circle mr-2"></i>Vui lòng liên hệ Ban cán sự lớp hoặc Đoàn - Hội Sinh viên để được hướng dẫn thêm.</p>
          </div>
        </div>
      </div>
    );
  }

  // GIAO DIỆN CHỈ HIỂN THỊ KHI ĐANG GIẢI TRÌNH
  if (isProcessing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in space-y-10 font-sans">
        <div className="bg-[#f26522] p-10 text-white shadow-2xl rounded-sm">
          <div className="flex items-center gap-6 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl"><i className="fas fa-exclamation-circle"></i></div>
            <h2 className="text-2xl font-black uppercase tracking-tight">Chế độ Giải trình Hồ sơ</h2>
          </div>
          <p className="text-sm font-medium border-l-4 border-white/40 pl-6 py-2 italic opacity-90">
            " {student.feedback || "Vui lòng phản hồi các nội dung sau để Hội đồng tiếp tục xét duyệt."} "
          </p>
        </div>

        <div className="space-y-8">
          <h3 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.4em] border-b-2 border-blue-900 pb-2 inline-block">Danh sách mục cần phản hồi</h3>

          {/* Loop qua các trường thông tin chung bị lỗi */}
          {flaggedFields.map(field => (
            <div key={field.key} className="bg-white border-2 border-orange-200 p-8 shadow-lg rounded-sm space-y-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <h4 className="text-base font-black text-blue-900 uppercase">{field.label}: <span className="text-orange-600 font-formal text-xl">{field.val}</span></h4>
                <span className="bg-orange-100 text-orange-700 text-[9px] font-black px-3 py-1 uppercase tracking-widest">Dữ liệu chung</span>
              </div>
              <div className="bg-orange-50/50 p-5 rounded border-l-4 border-orange-400">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Lý do từ Admin:</p>
                <p className="text-xs text-gray-700 font-medium italic">"{student.verifications[field.key].feedback}"</p>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-blue-900 uppercase tracking-widest">Nội dung giải trình của bạn:</label>
                <textarea
                  className="w-full p-4 border-2 border-gray-100 focus:border-orange-500 outline-none text-sm min-h-[120px] transition-all bg-gray-50/30"
                  placeholder="Nhập giải trình tại đây..."
                  value={student.verifications[field.key].feedback || ''}
                  onChange={(e) => updateFieldExplanation(field.key, e.target.value)}
                />
              </div>
            </div>
          ))}

          {/* Loop qua các minh chứng bị lỗi */}
          {flaggedEvidences.map(({ cat, ev }) => (
            <div key={ev.id} className="bg-white border-2 border-orange-200 p-8 shadow-lg rounded-sm space-y-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <div>
                  <span className="text-[9px] font-black text-orange-600 uppercase tracking-[0.2em] mb-1 block">{cat}</span>
                  <h4 className="text-base font-black text-blue-900 uppercase">{ev.name}</h4>
                </div>
                <button onClick={() => window.open(ev.fileUrl, '_blank')} className="px-5 py-2.5 bg-blue-900 text-white text-[9px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-md">Mở Minh chứng</button>
              </div>
              <div className="bg-orange-50/50 p-5 rounded border-l-4 border-orange-400">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Lý do từ Admin:</p>
                <p className="text-xs text-gray-700 font-medium italic">"{ev.adminFeedback}"</p>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-blue-900 uppercase tracking-widest">Nội dung giải trình của bạn:</label>
                <textarea
                  className="w-full p-4 border-2 border-gray-100 focus:border-orange-500 outline-none text-sm min-h-[120px] transition-all bg-gray-50/30"
                  placeholder="Giải trình lý do hoặc bổ sung thông tin..."
                  value={ev.studentExplanation || ''}
                  onChange={(e) => updateEvidenceExplanation(cat, ev.id, e.target.value)}
                />
              </div>
            </div>
          ))}

          {flaggedFields.length === 0 && flaggedEvidences.length === 0 && (
            <div className="text-center py-24 bg-gray-100 border-2 border-dashed border-gray-200">
              <i className="fas fa-check-circle text-green-500 text-4xl mb-4"></i>
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Mọi yêu cầu đã được phản hồi. Bạn có thể gửi đi!</p>
            </div>
          )}
        </div>

        <div className="py-16 text-center border-t border-gray-100">
          <button
            onClick={onResubmit}
            className="px-20 py-6 bg-blue-900 text-white font-black text-xs uppercase tracking-[0.5em] hover:bg-[#f26522] transition-all shadow-2xl active:scale-95"
          >
            GỬI PHẢN HỒI GIẢI TRÌNH
          </button>
        </div>
      </div>
    );
  }

  // GIAO DIỆN NỘP MỚI (CHỈ HIỆN KHI LÀ DRAFT)
  const currentStep = STEPS[currentStepIdx];
  const isHardCriteriaStep = currentStep === 'HARD_CRITERIA';
  const isReviewStep = currentStep === 'SUBMIT';
  const isEvidenceStep = !isHardCriteriaStep && !isReviewStep;
  const catStatus = {
    [CriterionType.ETHICS]: checkHardMet(CriterionType.ETHICS, student),
    [CriterionType.ACADEMIC]: checkHardMet(CriterionType.ACADEMIC, student),
    [CriterionType.PHYSICAL]: checkHardMet(CriterionType.PHYSICAL, student),
    [CriterionType.VOLUNTEER]: checkHardMet(CriterionType.VOLUNTEER, student),
    [CriterionType.INTEGRATION]: checkHardMet(CriterionType.INTEGRATION, student),
  };
  const allHardMet = Object.values(catStatus).filter(v => v).length === 5;
  const metCount = Object.values(catStatus).filter(v => v).length;

  // ====== PHASE 1: TRANG TIÊU CHÍ CỨNG ======
  const renderHardCriteriaPage = () => {
    const criteriaCards: { cat: CriterionType; icon: string; label: string; color: string }[] = [
      { cat: CriterionType.ETHICS, icon: 'fa-heart', label: 'Đạo đức tốt', color: 'rose' },
      { cat: CriterionType.ACADEMIC, icon: 'fa-book-open', label: 'Học tập tốt', color: 'blue' },
      { cat: CriterionType.PHYSICAL, icon: 'fa-running', label: 'Thể lực tốt', color: 'emerald' },
      { cat: CriterionType.INTEGRATION, icon: 'fa-globe-asia', label: 'Hội nhập tốt', color: 'violet' },
    ];

    return (
      <div className="animate-fade-in space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#002b5c] to-[#003d7a] p-8 text-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">
                <i className="fas fa-clipboard-check text-2xl text-orange-400"></i>
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight">Bước 1 — Thông tin tiêu chí cứng</h2>
                <p className="text-blue-200/70 text-sm font-medium mt-1">Nhập đầy đủ thông tin các tiêu chí bắt buộc để đủ điều kiện xét duyệt</p>
              </div>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-[9px] font-black uppercase tracking-widest text-orange-400 mb-1">Tiêu chí đạt</p>
              <p className="text-3xl font-black font-formal">{metCount}<span className="text-lg text-white/40">/5</span></p>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Đạo đức */}
          <div className={`bg-white border-2 rounded-lg shadow-sm overflow-hidden transition-all ${catStatus[CriterionType.ETHICS] ? 'border-green-200' : 'border-gray-100'}`}>
            <div className={`px-6 py-4 flex items-center justify-between ${catStatus[CriterionType.ETHICS] ? 'bg-green-50' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${catStatus[CriterionType.ETHICS] ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                  <i className="fas fa-heart text-sm"></i>
                </div>
                <h3 className="text-sm font-black text-blue-900 uppercase tracking-tight">Đạo đức tốt</h3>
              </div>
              <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full ${catStatus[CriterionType.ETHICS] ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {catStatus[CriterionType.ETHICS] ? '✓ Đạt' : '✗ Chưa đạt'}
              </span>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Điểm rèn luyện học kỳ (0-100) <span className="text-red-400">*</span></label>
                <input disabled={isLocked} type="number" max="100" value={student.trainingPoints || ''} onChange={(e) => updateProfile({ trainingPoints: Math.min(100, parseInt(e.target.value) || 0) })} className="w-full px-4 py-3 border-2 border-gray-100 rounded-lg focus:border-blue-600 outline-none font-bold text-sm transition-all" placeholder="Nhập từ 80 trở lên" />
              </div>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-all">
                  <input disabled={isLocked} type="checkbox" checked={student.noViolation} onChange={(e) => updateProfile({ noViolation: e.target.checked })} className="w-4 h-4 accent-blue-600 rounded" />
                  <span className="text-xs font-bold text-gray-700">Cam kết không vi phạm nội quy</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-all">
                  <input disabled={isLocked} type="checkbox" checked={student.isPartyMember} onChange={(e) => updateProfile({ isPartyMember: e.target.checked })} className="w-4 h-4 accent-blue-600 rounded" />
                  <span className="text-xs font-bold text-gray-700">Là Đảng viên Cộng sản Việt Nam <span className="text-orange-500 font-black">(+0.4đ)</span></span>
                </label>
              </div>
            </div>
          </div>

          {/* Học tập */}
          <div className={`bg-white border-2 rounded-lg shadow-sm overflow-hidden transition-all ${catStatus[CriterionType.ACADEMIC] ? 'border-green-200' : 'border-gray-100'}`}>
            <div className={`px-6 py-4 flex items-center justify-between ${catStatus[CriterionType.ACADEMIC] ? 'bg-green-50' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${catStatus[CriterionType.ACADEMIC] ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                  <i className="fas fa-book-open text-sm"></i>
                </div>
                <h3 className="text-sm font-black text-blue-900 uppercase tracking-tight">Học tập tốt</h3>
              </div>
              <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full ${catStatus[CriterionType.ACADEMIC] ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {catStatus[CriterionType.ACADEMIC] ? '✓ Đạt' : '✗ Chưa đạt'}
              </span>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">GPA Học tập tích lũy (Hệ 4.0) <span className="text-red-400">*</span></label>
                <input disabled={isLocked} type="number" step="0.01" max="4.0" value={student.gpa || ''} onChange={(e) => updateProfile({ gpa: Math.min(4.0, parseFloat(e.target.value) || 0) })} className="w-full px-4 py-3 border-2 border-gray-100 rounded-lg focus:border-blue-600 outline-none font-bold text-sm transition-all" placeholder="Nhập từ 3.2 trở lên" />
              </div>
            </div>
          </div>

          {/* Thể lực */}
          <div className={`bg-white border-2 rounded-lg shadow-sm overflow-hidden transition-all ${catStatus[CriterionType.PHYSICAL] ? 'border-green-200' : 'border-gray-100'}`}>
            <div className={`px-6 py-4 flex items-center justify-between ${catStatus[CriterionType.PHYSICAL] ? 'bg-green-50' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${catStatus[CriterionType.PHYSICAL] ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                  <i className="fas fa-running text-sm"></i>
                </div>
                <h3 className="text-sm font-black text-blue-900 uppercase tracking-tight">Thể lực tốt</h3>
              </div>
              <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full ${catStatus[CriterionType.PHYSICAL] ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {catStatus[CriterionType.PHYSICAL] ? '✓ Đạt' : '✗ Chưa đạt'}
              </span>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Điểm TB môn Thể dục (Thang 10) <span className="text-red-400">*</span></label>
                <input disabled={isLocked} type="number" step="0.1" max="10" value={student.peScore || ''} onChange={(e) => updateProfile({ peScore: Math.min(10, parseFloat(e.target.value) || 0) })} className="w-full px-4 py-3 border-2 border-gray-100 rounded-lg focus:border-blue-600 outline-none font-bold text-sm transition-all" placeholder="Nhập từ 7.0 trở lên" />
              </div>
            </div>
          </div>

          {/* Hội nhập */}
          <div className={`bg-white border-2 rounded-lg shadow-sm overflow-hidden transition-all ${catStatus[CriterionType.INTEGRATION] ? 'border-green-200' : 'border-gray-100'}`}>
            <div className={`px-6 py-4 flex items-center justify-between ${catStatus[CriterionType.INTEGRATION] ? 'bg-green-50' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${catStatus[CriterionType.INTEGRATION] ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                  <i className="fas fa-globe-asia text-sm"></i>
                </div>
                <h3 className="text-sm font-black text-blue-900 uppercase tracking-tight">Hội nhập tốt</h3>
              </div>
              <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full ${catStatus[CriterionType.INTEGRATION] ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {catStatus[CriterionType.INTEGRATION] ? '✓ Đạt' : '✗ Chưa đạt'}
              </span>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chứng chỉ ngoại ngữ <span className="text-red-400">*</span></label>
                  <select disabled={isLocked} value={student.englishLevel} onChange={(e) => updateProfile({ englishLevel: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-100 rounded-lg font-bold text-xs transition-all focus:border-blue-600 outline-none">
                    <option value="None">Chưa có</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2 trở lên</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">GPA ngoại ngữ <span className="text-red-400">*</span></label>
                  <input disabled={isLocked} type="number" step="0.01" max="4" value={student.englishGpa || ''} onChange={(e) => updateProfile({ englishGpa: Math.min(4.0, parseFloat(e.target.value) || 0) })} className="w-full px-4 py-3 border-2 border-gray-100 rounded-lg font-bold text-sm transition-all focus:border-blue-600 outline-none" placeholder="≥ 3.0" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tình nguyện note */}
        <div className={`bg-white border-2 rounded-lg shadow-sm overflow-hidden transition-all ${catStatus[CriterionType.VOLUNTEER] ? 'border-green-200' : 'border-gray-100'}`}>
          <div className={`px-6 py-4 flex items-center justify-between ${catStatus[CriterionType.VOLUNTEER] ? 'bg-green-50' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${catStatus[CriterionType.VOLUNTEER] ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                <i className="fas fa-hands-helping text-sm"></i>
              </div>
              <h3 className="text-sm font-black text-blue-900 uppercase tracking-tight">Tình nguyện tốt</h3>
            </div>
            <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full ${catStatus[CriterionType.VOLUNTEER] ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
              {catStatus[CriterionType.VOLUNTEER] ? '✓ Đạt' : '✗ Chưa đạt'}
            </span>
          </div>
          <div className="p-6">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <i className="fas fa-info-circle text-blue-500 mt-0.5"></i>
              <p className="text-xs text-blue-700 font-medium leading-relaxed">
                Tiêu chí Tình nguyện được xác nhận qua <strong>minh chứng hoạt động</strong>. Vui lòng nhấn "Tiếp theo" để nộp minh chứng tham gia chiến dịch, hoạt động tình nguyện, hiến máu nhân đạo, v.v.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ====== PHASE 2: TRANG MINH CHỨNG BỔ SUNG ======
  const renderEvidencePage = (cat: CriterionType) => {
    const isHardMet = catStatus[cat];
    const profileBasedCriteria = ['eth_hard_1', 'eth_hard_2', 'eth_point_1', 'eth_point_5', 'aca_hard_1', 'aca_point_7', 'phy_hard_1', 'int_hard_1', 'int_hard_2'];
    const hardSubs = SUB_CRITERIA[cat].filter(sub => sub.isHard && !profileBasedCriteria.includes(sub.id));
    const softSubs = SUB_CRITERIA[cat].filter(sub => !sub.isHard && !profileBasedCriteria.includes(sub.id));

    const catIcons: Record<string, string> = {
      [CriterionType.ETHICS]: 'fa-heart',
      [CriterionType.ACADEMIC]: 'fa-book-open',
      [CriterionType.PHYSICAL]: 'fa-running',
      [CriterionType.VOLUNTEER]: 'fa-hands-helping',
      [CriterionType.INTEGRATION]: 'fa-globe-asia',
    };

    return (
      <div className="animate-fade-in space-y-8">
        {/* Header */}
        <div className="bg-white border-2 border-gray-100 rounded-lg p-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <i className={`fas ${catIcons[cat]} text-blue-600 text-lg`}></i>
            </div>
            <div>
              <h2 className="text-lg font-black text-blue-900 uppercase tracking-tight">{cat}</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Bước {currentStepIdx + 1}/{STEPS.length} — Minh chứng bổ sung</p>
            </div>
          </div>
          <span className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-full ${isHardMet ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
            {isHardMet ? '✓ Đạt tiêu chí cứng' : '✗ Chưa đạt tiêu chí cứng'}
          </span>
        </div>

        {/* Hard evidence subs (cần upload minh chứng) */}
        {hardSubs.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.2em] border-b-2 border-blue-900 pb-2 inline-block">
              <i className="fas fa-shield-alt mr-2"></i>Minh chứng tiêu chí cứng
            </h3>
            {hardSubs.map(sub => {
              const subEvs = student.evidences[cat].filter(e => e.subCriterionId === sub.id);
              return (
                <div key={sub.id} className={`p-5 border-l-4 transition-all bg-white rounded-lg shadow-sm ${subEvs.length > 0 ? 'border-blue-600' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <span className="text-[8px] font-black uppercase px-2 py-0.5 text-white bg-blue-600 rounded inline-block mb-1">Cứng</span>
                      <p className="text-xs font-bold text-gray-800 leading-snug">{sub.description}</p>
                    </div>
                    {!isLocked && (
                      <button onClick={() => setAddingTo({ type: cat, isHard: true, subName: sub.description })} className="px-4 py-2 bg-blue-50 text-blue-700 font-black text-[9px] uppercase tracking-widest rounded-lg hover:bg-blue-100 transition-all whitespace-nowrap">
                        <i className="fas fa-upload mr-1.5"></i>Tải lên
                      </button>
                    )}
                  </div>
                  {subEvs.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {subEvs.map(ev => (
                        <div key={ev.id} className="p-3 bg-gray-50 border rounded-lg flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-900">{ev.name}</span>
                            <span className="text-[8px] font-bold text-gray-400 uppercase">{ev.level} • {ev.status}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] font-black text-blue-700 bg-blue-50 px-2 py-1 rounded">+{ev.points}đ</span>
                            {!isLocked && <button onClick={() => removeEvidence(cat, ev.id)} className="text-gray-300 hover:text-red-500 transition-colors"><i className="fas fa-trash-alt text-[10px]"></i></button>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Soft evidence subs (điểm cộng) */}
        {softSubs.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] border-b-2 border-orange-400 pb-2 inline-block">
              <i className="fas fa-plus-circle mr-2"></i>Minh chứng tiêu chí cộng điểm
            </h3>
            {!isHardMet && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <i className="fas fa-exclamation-triangle text-amber-500 mt-0.5"></i>
                <p className="text-xs text-amber-700 font-medium">Bạn cần đạt tiêu chí cứng trước khi nộp minh chứng cộng điểm cho tiêu chí này.</p>
              </div>
            )}
            {isHardMet && softSubs.map(sub => {
              const subEvs = student.evidences[cat].filter(e => e.subCriterionId === sub.id);
              return (
                <div key={sub.id} className={`p-5 border-l-4 transition-all bg-white rounded-lg shadow-sm ${subEvs.length > 0 ? 'border-orange-500' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <span className="text-[8px] font-black uppercase px-2 py-0.5 text-white bg-orange-500 rounded inline-block mb-1">Cộng</span>
                      <p className="text-xs font-bold text-gray-800 leading-snug">{sub.description}</p>
                    </div>
                    {!isLocked && (
                      <button onClick={() => setAddingTo({ type: cat, isHard: false, subName: sub.description })} className="px-4 py-2 bg-orange-50 text-orange-700 font-black text-[9px] uppercase tracking-widest rounded-lg hover:bg-orange-100 transition-all whitespace-nowrap">
                        <i className="fas fa-upload mr-1.5"></i>Tải lên
                      </button>
                    )}
                  </div>
                  {subEvs.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {subEvs.map(ev => (
                        <div key={ev.id} className="p-3 bg-gray-50 border rounded-lg flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-900">{ev.name}</span>
                            <span className="text-[8px] font-bold text-gray-400 uppercase">{ev.level} • {ev.status}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] font-black text-orange-600 bg-orange-50 px-2 py-1 rounded">+{ev.points}đ</span>
                            {!isLocked && <button onClick={() => removeEvidence(cat, ev.id)} className="text-gray-300 hover:text-red-500 transition-colors"><i className="fas fa-trash-alt text-[10px]"></i></button>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {hardSubs.length === 0 && softSubs.length === 0 && (
          <div className="text-center py-16 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg">
            <i className="fas fa-check-circle text-green-400 text-3xl mb-4"></i>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Tiêu chí này được xác nhận qua dữ liệu đã nhập ở Bước 1</p>
          </div>
        )}
      </div>
    );
  };

  // ====== PHASE 3: SUBMIT ======
  const renderSubmitStep = () => {
    return (
      <div className="animate-fade-in space-y-10 text-center py-6">
        <div className="max-w-md mx-auto space-y-6">
          <div className={`w-20 h-20 mx-auto flex items-center justify-center rounded-full ring-4 transition-all ${allHardMet ? 'bg-green-100 ring-green-50' : 'bg-red-100 ring-red-50'}`}>
            <i className={`fas ${allHardMet ? 'fa-check text-green-600' : 'fa-times text-red-600'} text-3xl`}></i>
          </div>
          <h2 className="text-2xl font-black text-[#0054a6] uppercase font-formal">{allHardMet ? 'Sẵn sàng nộp hồ sơ' : 'Chưa đủ điều kiện'}</h2>
        </div>
        <div className="bg-[#002b5c] p-12 text-white border-4 border-white shadow-xl rounded-lg">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] mb-2 text-orange-400">Tổng điểm tích lũy dự kiến</p>
          <h3 className="text-6xl font-bold mb-10 font-formal">{student.totalScore}</h3>

          <button disabled={isLocked || !allHardMet} onClick={onSubmit} className={`px-16 py-5 font-bold text-[10px] uppercase tracking-[0.3em] transition-all border-2 rounded-lg ${isLocked || !allHardMet ? 'border-gray-600 text-gray-600 cursor-not-allowed bg-transparent' : 'bg-orange-600 text-white hover:bg-white hover:text-blue-900 border-transparent active:scale-95'}`}>
            {isLocked ? 'HỒ SƠ ĐANG CHỜ DUYỆT' : 'GỬI XÉT DUYỆT CHÍNH THỨC'}
          </button>
        </div>
      </div>
    );
  };

  // ====== RENDER CHÍNH ======
  const renderCurrentStep = () => {
    if (isHardCriteriaStep) return renderHardCriteriaPage();
    if (isReviewStep) return renderSubmitStep();
    return renderEvidencePage(currentStep as CriterionType);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-in space-y-10 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b pb-8">
        <div className="flex-1">
          <h1 className="text-3xl font-black text-[#0054a6] uppercase font-formal tracking-tighter">{student.fullName}</h1>
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mt-1 italic">Mã sinh viên: {student.studentId} • {student.faculty}</p>
          {/* Step progress */}
          <div className="flex items-center gap-1.5 mt-6">
            {STEPS.map((s, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentStepIdx(idx)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer
                    ${idx === currentStepIdx
                      ? 'bg-blue-900 text-white shadow-md'
                      : idx < currentStepIdx
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                >
                  {idx < currentStepIdx && <i className="fas fa-check text-[7px]"></i>}
                  <span className="hidden sm:inline">{STEP_LABELS[s] || s}</span>
                  <span className="sm:hidden">{idx + 1}</span>
                </button>
                {idx < STEPS.length - 1 && <div className={`w-3 h-0.5 ${idx < currentStepIdx ? 'bg-blue-300' : 'bg-gray-200'}`}></div>}
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { if (currentStepIdx > 0) setCurrentStepIdx(currentStepIdx - 1); }}
            disabled={currentStepIdx === 0}
            className={`px-6 py-3 font-black text-[9px] uppercase tracking-widest border rounded-lg transition-all flex items-center gap-2 ${currentStepIdx === 0 ? 'border-gray-100 text-gray-200' : 'border-blue-200 text-blue-700 hover:bg-blue-50'}`}
          >
            <i className="fas fa-arrow-left text-[8px]"></i> Quay lại
          </button>
          <button
            onClick={() => { if (currentStepIdx < STEPS.length - 1) setCurrentStepIdx(currentStepIdx + 1); }}
            disabled={currentStepIdx === STEPS.length - 1}
            className={`px-6 py-3 font-black text-[9px] uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 ${currentStepIdx === STEPS.length - 1 ? 'bg-gray-100 text-gray-300' : 'bg-blue-900 text-white hover:bg-orange-600 shadow-md'}`}
          >
            Tiếp theo <i className="fas fa-arrow-right text-[8px]"></i>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">{renderCurrentStep()}</div>

      {/* Evidence Upload Modal */}
      {addingTo && !isLocked && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-blue-950/90 backdrop-blur-sm p-4 animate-fade-in">
          <EvidenceForm criterionType={addingTo.type} isHard={addingTo.isHard} subCriterionName={addingTo.subName} onAdd={(ev) => { addEvidence(addingTo.type, { ...ev, points: POINT_MATRIX[ev.level][ev.type] }); setAddingTo(null); }} onCancel={() => setAddingTo(null)} />
        </div>
      )}
    </div>
  );
};

const AdminDashboard: React.FC<{
  student: StudentProfile,
  onUpdateStatus: (status: StudentProfile['status'], feedback?: string) => void,
  onUpdateEvidenceStatus: (cat: CriterionType, id: string, status: Evidence['status'], feedback?: string) => void,
  onUpdateFieldVerification: (field: keyof StudentProfile['verifications'], action: FieldVerification['status'], feedback?: string) => void,
  faces: FeaturedFace[],
  onUpdateFaces: (faces: FeaturedFace[]) => void
}> = ({ student, onUpdateStatus, onUpdateEvidenceStatus, onUpdateFieldVerification, faces, onUpdateFaces }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profiles' | 'criteria' | 'users' | 'posts' | 'stats' | 'faces'>('profiles');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const isSelected = selectedId === student.id;

  // State for CRUD
  const LEVELS = ['Cấp Khoa/CLB', 'Cấp Trường/Phường/Xã', 'Cấp ĐHĐN', 'Cấp Tỉnh/Thành phố', 'Cấp Trung ương'];
  const LEVEL_KEYS = ['khoa', 'truong', 'dhdn', 'tinh', 'tw'];
  type CriterionItem = { id: string; description: string; isHard: boolean; points?: number; levelPoints: Record<string, number>; hasDecisionNumber: boolean };
  const [managedCriteria, setManagedCriteria] = useState(() => {
    const init: Record<string, CriterionItem[]> = {};
    Object.entries(SUB_CRITERIA).forEach(([cat, subs]) => {
      init[cat] = subs.map(s => ({
        ...s,
        levelPoints: { khoa: 0.1, truong: 0.2, dhdn: 0.3, tinh: 0.4, tw: 0.5 },
        hasDecisionNumber: false
      }));
    });
    return init;
  });
  const [managedUsers, setManagedUsers] = useState([
    { id: '1', name: 'Admin Chính', role: 'Admin', email: 'admin@due.udn.vn' },
    { id: '2', name: 'Nguyễn Văn Ban', role: 'Thư ký', email: 'ban.nv@due.udn.vn' },
    { id: '3', name: 'Trần Thị Cẩm', role: 'Thẩm định viên', email: 'cam.tt@due.udn.vn' },
  ]);
  const [managedPosts, setManagedPosts] = useState([
    { id: '1', title: 'Thông báo đăng ký xét duyệt SV5T năm 2024', date: '15/03/2024', status: 'published' },
    { id: '2', title: 'Hướng dẫn nộp minh chứng hoạt động tình nguyện', date: '10/03/2024', status: 'published' },
    { id: '3', title: 'Kết quả xét duyệt đợt 1 năm 2024', date: '01/03/2024', status: 'draft' },
  ]);

  const handleAction = (status: StudentProfile['status']) => {
    const actionTxt = status === 'Approved' ? 'CÔNG NHẬN DANH HIỆU' : status === 'Processing' ? 'GỬI YÊU CẦU GIẢI TRÌNH' : 'TỪ CHỐI HỒ SƠ';
    if (!window.confirm(`Xác nhận thực hiện hành động: ${actionTxt}?`)) return;
    let fb = '';
    if (status === 'Rejected') { fb = prompt('Lý do hồ sơ KHÔNG ĐẠT:') || ''; if (!fb) return; }
    else if (status === 'Processing') { fb = prompt(`Nhập lời nhắn giải trình gửi đến SV ${student.fullName}:`) || 'Vui lòng kiểm tra và giải trình các mục Admin đã đánh dấu.'; }
    onUpdateStatus(status, fb);
    if (status === 'Processing') alert(`✅ Đã gửi yêu cầu giải trình đến sinh viên ${student.fullName} thành công!`);
    else if (status === 'Approved') alert(`🌟 Đã công nhận danh hiệu cho SV ${student.fullName}.`);
    setSelectedId(null);
  };

  const handleEvidenceAction = (cat: CriterionType, id: string, action: 'Approved' | 'Rejected' | 'NeedsExplanation') => {
    let feedback = '';
    if (action === 'Rejected' || action === 'NeedsExplanation') { feedback = prompt(action === 'Rejected' ? 'Lý do từ chối:' : 'Nội dung cần giải trình:') || ''; if (!feedback && action === 'Rejected') return; }
    onUpdateEvidenceStatus(cat, id, action, feedback);
  };

  const handleManualDataVerify = (action: 'Approved' | 'Rejected' | 'NeedsExplanation', fieldKey: keyof StudentProfile['verifications'], context: string) => {
    let feedback = '';
    if (action === 'Rejected' || action === 'NeedsExplanation') { feedback = prompt(`Lý do phản hồi cho [${context}]:`) || ''; if (!feedback && action === 'Rejected') return; }
    onUpdateFieldVerification(fieldKey, action, feedback);
  };

  const getExplanationCount = () => {
    let count = 0;
    (Object.values(student.verifications) as FieldVerification[]).forEach(v => { if (v.status === 'NeedsExplanation') count++; });
    (Object.values(student.evidences) as Evidence[][]).forEach(list => list.forEach(e => { if (e.status === 'NeedsExplanation') count++; }));
    return count;
  };

  const SIDEBAR_ITEMS: { key: typeof activeTab, icon: string, label: string }[] = [
    { key: 'profiles', icon: 'fa-folder-open', label: 'Quản lý hồ sơ' },
    { key: 'stats', icon: 'fa-chart-bar', label: 'Thống kê' },
    { key: 'criteria', icon: 'fa-list-check', label: 'Quản lý tiêu chí' },
    { key: 'users', icon: 'fa-users', label: 'Quản lý người dùng' },
    { key: 'posts', icon: 'fa-newspaper', label: 'Quản lý bài viết' },
    { key: 'faces', icon: 'fa-award', label: 'Vinh danh' },
  ];

  // ====== RENDER CONTENT AREAS ======
  const renderProfiles = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
          <input type="text" placeholder="Tìm kiếm theo tên hoặc mã SV..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-3 border-2 border-gray-100 rounded-lg text-sm font-medium focus:border-blue-500 outline-none transition-all" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-3 border-2 border-gray-100 rounded-lg text-xs font-bold uppercase tracking-widest focus:border-blue-500 outline-none">
          <option value="all">Tất cả trạng thái</option>
          <option value="Submitted">Chờ thẩm định</option>
          <option value="Processing">Đang giải trình</option>
          <option value="Approved">Đã duyệt</option>
          <option value="Rejected">Từ chối</option>
        </select>
      </div>
      {/* Table */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] border-b">
            <tr><th className="px-6 py-4">Sinh viên</th><th className="px-6 py-4">Lớp</th><th className="px-6 py-4 text-center">Trạng thái</th><th className="px-6 py-4 text-center">Điểm</th><th className="px-6 py-4"></th></tr>
          </thead>
          <tbody className="divide-y">
            <tr className="hover:bg-blue-50/50 transition-colors">
              <td className="px-6 py-5">
                <span className="block font-black text-blue-900 uppercase text-sm">{student.fullName}</span>
                <span className="block text-[9px] text-gray-400 font-bold uppercase mt-0.5">{student.studentId}</span>
              </td>
              <td className="px-6 py-5 text-xs font-bold text-gray-500">{student.class}</td>
              <td className="px-6 py-5 text-center">
                <div className={`px-3 py-1.5 text-[8px] font-black uppercase tracking-widest inline-block rounded-full ${student.status === 'Approved' ? 'bg-green-100 text-green-700' : student.status === 'Rejected' ? 'bg-red-100 text-red-600' : student.status === 'Processing' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                  {student.status === 'Submitted' ? 'Chờ thẩm định' : student.status === 'Processing' ? 'Đang giải trình' : student.status === 'Approved' ? 'Đã duyệt' : student.status === 'Rejected' ? 'Từ chối' : student.status}
                </div>
              </td>
              <td className="px-6 py-5 text-center text-xl font-black text-blue-900 font-formal">{student.totalScore}</td>
              <td className="px-6 py-5 text-right">
                <button onClick={() => setSelectedId(student.id)} className="px-5 py-2.5 bg-blue-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-orange-600 transition-all shadow-sm">
                  <i className="fas fa-eye mr-1.5"></i>Thẩm định
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Tổng hồ sơ', val: '128', icon: 'fa-file-alt', color: 'bg-blue-500', bg: 'bg-blue-50' },
          { label: 'Đã duyệt', val: '42', icon: 'fa-check-circle', color: 'bg-green-500', bg: 'bg-green-50' },
          { label: 'Đang giải trình', val: '15', icon: 'fa-clock', color: 'bg-orange-500', bg: 'bg-orange-50' },
          { label: 'Từ chối', val: '8', icon: 'fa-times-circle', color: 'bg-red-500', bg: 'bg-red-50' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} p-6 rounded-xl border flex items-center gap-5`}>
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white text-lg shadow-md`}><i className={`fas ${stat.icon}`}></i></div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-blue-900 font-formal">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white border rounded-xl p-8 space-y-6">
        <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest">Phân bố trạng thái hồ sơ</h3>
        <div className="flex items-end gap-3 h-48">
          {[
            { label: 'Chờ', pct: 50, color: 'bg-blue-500' },
            { label: 'Giải trình', pct: 12, color: 'bg-orange-500' },
            { label: 'Đã duyệt', pct: 33, color: 'bg-green-500' },
            { label: 'Từ chối', pct: 6, color: 'bg-red-500' },
          ].map((bar, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-black text-gray-500">{bar.pct}%</span>
              <div className={`w-full ${bar.color} rounded-t-lg transition-all`} style={{ height: `${bar.pct * 1.6}%` }}></div>
              <span className="text-[8px] font-bold text-gray-400 uppercase">{bar.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Criteria form modal state
  const [criteriaForm, setCriteriaForm] = useState<{ mode: 'add' | 'edit'; cat: string; id?: string; description: string; isHard: boolean; hasDecisionNumber: boolean; levelPoints: Record<string, number> } | null>(null);

  const openAddCriterion = (cat: string) => {
    setCriteriaForm({ mode: 'add', cat, description: '', isHard: false, hasDecisionNumber: false, levelPoints: { khoa: 0.1, truong: 0.2, dhdn: 0.3, tinh: 0.4, tw: 0.5 } });
  };
  const openEditCriterion = (cat: string, id: string) => {
    const sub = managedCriteria[cat]?.find(s => s.id === id);
    if (!sub) return;
    setCriteriaForm({ mode: 'edit', cat, id, description: sub.description, isHard: sub.isHard, hasDecisionNumber: sub.hasDecisionNumber, levelPoints: { ...sub.levelPoints } });
  };
  const saveCriteriaForm = () => {
    if (!criteriaForm || !criteriaForm.description.trim()) return;
    if (criteriaForm.mode === 'add') {
      setManagedCriteria(prev => ({
        ...prev, [criteriaForm.cat]: [...(prev[criteriaForm.cat] || []), {
          id: `new_${Date.now()}`, description: criteriaForm.description, isHard: criteriaForm.isHard,
          levelPoints: criteriaForm.levelPoints, hasDecisionNumber: criteriaForm.hasDecisionNumber
        }]
      }));
    } else {
      setManagedCriteria(prev => ({ ...prev, [criteriaForm.cat]: prev[criteriaForm.cat].map(s => s.id === criteriaForm.id ? { ...s, description: criteriaForm.description, isHard: criteriaForm.isHard, hasDecisionNumber: criteriaForm.hasDecisionNumber, levelPoints: criteriaForm.levelPoints } : s) }));
    }
    setCriteriaForm(null);
  };
  const handleDeleteCriterion = (cat: string, id: string) => {
    if (!window.confirm('Xác nhận xóa tiêu chí này?')) return;
    setManagedCriteria(prev => ({ ...prev, [cat]: prev[cat].filter(s => s.id !== id) }));
  };
  const handleAddUser = () => {
    const name = prompt('Họ tên người dùng:'); if (!name) return;
    const email = prompt('Email:'); if (!email) return;
    const role = prompt('Vai trò (Admin / Thư ký / Thẩm định viên):') || 'Thẩm định viên';
    setManagedUsers(prev => [...prev, { id: `u_${Date.now()}`, name, email, role }]);
    alert('✅ Đã thêm người dùng!');
  };
  const handleDeleteUser = (id: string) => {
    if (!window.confirm('Xác nhận xóa người dùng này?')) return;
    setManagedUsers(prev => prev.filter(u => u.id !== id));
  };
  const handleAddPost = () => {
    const title = prompt('Tiêu đề bài viết:'); if (!title) return;
    const today = new Date().toLocaleDateString('vi-VN');
    setManagedPosts(prev => [...prev, { id: `p_${Date.now()}`, title, date: today, status: 'draft' }]);
    alert('✅ Đã thêm bài viết!');
  };
  const handleEditPost = (id: string) => {
    const post = managedPosts.find(p => p.id === id); if (!post) return;
    const title = prompt('Chỉnh sửa tiêu đề:', post.title); if (!title) return;
    setManagedPosts(prev => prev.map(p => p.id === id ? { ...p, title } : p));
    alert('✅ Đã cập nhật bài viết!');
  };
  const handleDeletePost = (id: string) => {
    if (!window.confirm('Xác nhận xóa bài viết này?')) return;
    setManagedPosts(prev => prev.filter(p => p.id !== id));
  };

  const renderCriteriaInlineForm = () => {
    if (!criteriaForm) return null;
    return (
      <div className="bg-blue-50/50 border-2 border-blue-200 rounded-xl p-5 space-y-4 animate-fade-in">
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{criteriaForm.mode === 'add' ? 'Thêm tiêu chí mới' : 'Chỉnh sửa tiêu chí'}</span>
          <button onClick={() => setCriteriaForm(null)} className="w-7 h-7 rounded-lg bg-gray-200 hover:bg-red-100 text-gray-400 hover:text-red-500 flex items-center justify-center transition-all"><i className="fas fa-times text-[10px]"></i></button>
        </div>
        <textarea value={criteriaForm.description} onChange={e => setCriteriaForm({ ...criteriaForm, description: e.target.value })} rows={2} className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 resize-none" placeholder="Mô tả tiêu chí..." />
        <div className="flex gap-3 flex-wrap">
          <div className="flex gap-1.5">
            <button onClick={() => setCriteriaForm({ ...criteriaForm, isHard: true })} className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase border-2 transition-all ${criteriaForm.isHard ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-400 border-gray-200'}`}>Cứng</button>
            <button onClick={() => setCriteriaForm({ ...criteriaForm, isHard: false })} className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase border-2 transition-all ${!criteriaForm.isHard ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-400 border-gray-200'}`}>Cộng</button>
          </div>
          <div className="flex gap-1.5">
            <button onClick={() => setCriteriaForm({ ...criteriaForm, hasDecisionNumber: false })} className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase border-2 transition-all ${!criteriaForm.hasDecisionNumber ? 'bg-gray-700 text-white border-gray-700' : 'bg-white text-gray-400 border-gray-200'}`}>Không Sqđ</button>
            <button onClick={() => setCriteriaForm({ ...criteriaForm, hasDecisionNumber: true })} className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase border-2 transition-all ${criteriaForm.hasDecisionNumber ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-400 border-gray-200'}`}>Có Sqđ</button>
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {LEVELS.map((lvl, i) => (
            <div key={lvl} className="flex items-center gap-1 bg-white border rounded-md px-2 py-1">
              <span className="text-[7px] font-bold text-gray-400 w-16 truncate">{lvl}</span>
              <input type="number" step="0.1" min="0" value={criteriaForm.levelPoints[LEVEL_KEYS[i]] || 0} onChange={e => setCriteriaForm({ ...criteriaForm, levelPoints: { ...criteriaForm.levelPoints, [LEVEL_KEYS[i]]: parseFloat(e.target.value) || 0 } })} className="w-12 text-center text-[10px] font-black text-orange-600 bg-white border border-orange-200 rounded outline-none focus:border-orange-500 py-0.5" />
              <span className="text-[7px] text-gray-300">đ</span>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button onClick={() => setCriteriaForm(null)} className="px-4 py-2 border border-gray-200 text-gray-400 text-[9px] font-black uppercase rounded-lg hover:bg-gray-100 transition-all">Hủy</button>
          <button onClick={saveCriteriaForm} disabled={!criteriaForm.description.trim()} className={`px-5 py-2 text-[9px] font-black uppercase rounded-lg transition-all ${criteriaForm.description.trim() ? 'bg-blue-900 text-white hover:bg-orange-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>{criteriaForm.mode === 'add' ? 'Thêm' : 'Lưu'}</button>
        </div>
      </div>
    );
  };

  const renderCriteria = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-black text-blue-900 uppercase">Danh sách tiêu chí</h2>
      </div>
      {(Object.entries(managedCriteria) as [string, CriterionItem[]][]).map(([cat, subs]) => (
        <div key={cat} className="bg-white border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
            <h3 className="text-sm font-black text-blue-900 uppercase">{cat}</h3>
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-bold text-gray-400">{subs.length} tiêu chí</span>
              <button onClick={() => openAddCriterion(cat)} className="px-3 py-1.5 bg-blue-900 text-white text-[8px] font-black uppercase tracking-widest rounded-lg hover:bg-orange-600 transition-all"><i className="fas fa-plus mr-1"></i>Thêm</button>
            </div>
          </div>
          {/* Inline form when adding to this category */}
          {criteriaForm && criteriaForm.mode === 'add' && criteriaForm.cat === cat && (
            <div className="px-6 py-4 border-b">{renderCriteriaInlineForm()}</div>
          )}
          <div className="divide-y">
            {subs.map(sub => (
              <div key={sub.id}>
                {/* Show inline form if editing this criterion */}
                {criteriaForm && criteriaForm.mode === 'edit' && criteriaForm.id === sub.id ? (
                  <div className="px-6 py-4">{renderCriteriaInlineForm()}</div>
                ) : (
                  <div className="px-6 py-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className={`text-[7px] font-black uppercase px-2 py-0.5 text-white rounded flex-shrink-0 ${sub.isHard ? 'bg-blue-600' : 'bg-orange-500'}`}>{sub.isHard ? 'Cứng' : 'Cộng'}</span>
                        <span className="text-xs font-medium text-gray-700">{sub.description}</span>
                        <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded flex-shrink-0 ${sub.hasDecisionNumber ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>{sub.hasDecisionNumber ? 'Có Sqđ' : 'Không Sqđ'}</span>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => openEditCriterion(cat, sub.id)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-all"><i className="fas fa-pen text-[10px]"></i></button>
                        <button onClick={() => handleDeleteCriterion(cat, sub.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-all"><i className="fas fa-trash text-[10px]"></i></button>
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      {LEVELS.map((lvl, i) => (
                        <div key={lvl} className="flex items-center gap-1 bg-gray-50 border rounded-md px-2 py-1">
                          <span className="text-[7px] font-bold text-gray-400 w-16 truncate">{lvl}</span>
                          <input type="number" step="0.1" min="0" value={sub.levelPoints[LEVEL_KEYS[i]] || 0} onChange={e => { const val = parseFloat(e.target.value) || 0; setManagedCriteria(prev => ({ ...prev, [cat]: prev[cat].map(s => s.id === sub.id ? { ...s, levelPoints: { ...s.levelPoints, [LEVEL_KEYS[i]]: val } } : s) })); }} className="w-12 text-center text-[10px] font-black text-orange-600 bg-white border border-orange-200 rounded outline-none focus:border-orange-500 py-0.5" />
                          <span className="text-[7px] text-gray-300">đ</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-black text-blue-900 uppercase">Quản lý người dùng</h2>
        <button onClick={handleAddUser} className="px-5 py-2.5 bg-blue-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-orange-600 transition-all shadow-sm">
          <i className="fas fa-user-plus mr-1.5"></i>Thêm người dùng
        </button>
      </div>
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] border-b">
            <tr><th className="px-6 py-4">Họ tên</th><th className="px-6 py-4">Email</th><th className="px-6 py-4">Vai trò</th><th className="px-6 py-4"></th></tr>
          </thead>
          <tbody className="divide-y">
            {managedUsers.map(u => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-black text-sm">{u.name.charAt(0)}</div>
                    <span className="text-sm font-bold text-gray-800">{u.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-gray-500">{u.email}</td>
                <td className="px-6 py-4"><span className="text-[9px] font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-full uppercase">{u.role}</span></td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDeleteUser(u.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-all ml-auto"><i className="fas fa-trash text-[10px]"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPosts = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-black text-blue-900 uppercase">Quản lý bài viết</h2>
        <button onClick={handleAddPost} className="px-5 py-2.5 bg-blue-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-orange-600 transition-all shadow-sm">
          <i className="fas fa-plus mr-1.5"></i>Thêm bài viết
        </button>
      </div>
      <div className="space-y-4">
        {managedPosts.map(p => (
          <div key={p.id} className="bg-white border rounded-lg p-5 flex items-center justify-between hover:shadow-md transition-all">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center"><i className="fas fa-file-alt text-blue-500"></i></div>
              <div>
                <h4 className="text-sm font-bold text-gray-800">{p.title}</h4>
                <p className="text-[9px] text-gray-400 font-bold mt-0.5"><i className="far fa-calendar mr-1"></i>{p.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full ${p.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{p.status === 'published' ? 'Đã đăng' : 'Bản nháp'}</span>
              <button onClick={() => handleEditPost(p.id)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-all"><i className="fas fa-pen text-[10px]"></i></button>
              <button onClick={() => handleDeletePost(p.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-all"><i className="fas fa-trash text-[10px]"></i></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'profiles': return renderProfiles();
      case 'stats': return renderStats();
      case 'criteria': return renderCriteria();
      case 'users': return renderUsers();
      case 'posts': return renderPosts();
      default: return null;
    }
  };

  return (
    <div className="flex min-h-screen animate-fade-in font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-[#0a1628] flex-shrink-0 flex flex-col">
        <div className="px-6 py-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black text-sm">A</div>
            <div>
              <p className="text-white font-black text-sm">Admin</p>
              <p className="text-blue-300/40 text-[9px] font-bold uppercase tracking-widest">Ban thư ký HSV DUE</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {SIDEBAR_ITEMS.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-left transition-all text-[11px] font-bold
                ${activeTab === item.key
                  ? 'bg-blue-600/20 text-white shadow-sm'
                  : 'text-blue-200/50 hover:bg-white/5 hover:text-blue-200'
                }`}
            >
              <i className={`fas ${item.icon} w-5 text-center text-xs ${activeTab === item.key ? 'text-orange-400' : ''}`}></i>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-white/5">
          <p className="text-blue-300/30 text-[8px] font-bold uppercase tracking-widest">SV5T System v2.0</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="bg-white px-8 py-5 border-b flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-blue-900 uppercase tracking-tight">{SIDEBAR_ITEMS.find(i => i.key === activeTab)?.label}</h1>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Hệ thống Xét duyệt Sinh viên 5 Tốt</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-xl bg-gray-100 text-gray-400 hover:bg-gray-200 flex items-center justify-center transition-all"><i className="fas fa-bell text-sm"></i></button>
            <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center font-black text-sm">A</div>
          </div>
        </div>
        {/* Content */}
        <div className="flex-1 p-8">{activeTab === 'faces' ? null : renderContent()}</div>
      </div>


      {/* Profile Review Modal - Full screen */}
      {isSelected && (
        <div className="fixed inset-0 z-[1100] bg-white animate-fade-in overflow-y-auto">
          <div className="bg-white w-full min-h-full">
            <div className="px-8 py-5 bg-gradient-to-r from-[#002b5c] to-[#003d7a] flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white text-xl font-formal italic">{student.fullName.charAt(0)}</div>
                <div>
                  <h3 className="text-xl font-black uppercase font-formal tracking-tight text-white">{student.fullName}</h3>
                  <p className="text-[10px] font-bold text-blue-200/60 uppercase mt-0.5 tracking-widest">{student.studentId} • {student.class} • {student.faculty}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-bold text-blue-200/50 uppercase">Điểm: <span className="text-orange-400 font-black text-sm">{student.totalScore}</span></span>
                <button onClick={() => handleAction('Rejected')} className="px-4 py-2 border border-red-400/40 text-red-300 font-black text-[9px] uppercase tracking-widest rounded-lg hover:bg-red-500/20 transition-all">Từ chối</button>
                {getExplanationCount() > 0 && <button onClick={() => handleAction('Processing')} className="px-4 py-2 bg-orange-500/80 text-white font-black text-[9px] uppercase tracking-widest rounded-lg hover:bg-orange-500 transition-all animate-pulse">Giải trình ({getExplanationCount()})</button>}
                <button onClick={() => handleAction('Approved')} className="px-5 py-2 bg-green-500 text-white font-black text-[9px] uppercase tracking-widest rounded-lg hover:bg-green-600 transition-all shadow-md">Duyệt</button>
                <button onClick={() => setSelectedId(null)} className="w-10 h-10 rounded-lg bg-white/10 hover:bg-red-500/30 text-white/60 hover:text-white flex items-center justify-center transition-all ml-2"><i className="fas fa-times text-sm"></i></button>
              </div>
            </div>

            <div className="p-8 space-y-8 bg-gray-50">
              {Object.values(CriterionType).map((cat) => {
                const list = student.evidences[cat] || [];
                const isHardMet = checkHardMet(cat, student);
                let dataValue = "", contextName = "", fieldKey: keyof StudentProfile['verifications'] | null = null;
                if (cat === CriterionType.ETHICS) { dataValue = `${student.trainingPoints}`; contextName = "Điểm rèn luyện"; fieldKey = "trainingPoints"; }
                if (cat === CriterionType.ACADEMIC) { dataValue = `${student.gpa}`; contextName = "GPA"; fieldKey = "gpa"; }
                if (cat === CriterionType.PHYSICAL) { dataValue = `${student.peScore}`; contextName = "Điểm Thể dục"; fieldKey = "peScore"; }
                if (cat === CriterionType.INTEGRATION) { dataValue = `${student.englishLevel}`; contextName = "Ngoại ngữ"; fieldKey = "english"; }
                const verification = fieldKey ? student.verifications[fieldKey] : { status: 'Pending' };

                return (
                  <div key={cat} className={`bg-white border rounded-lg shadow-sm overflow-hidden transition-all duration-300 ${verification.status === 'NeedsExplanation' ? 'ring-2 ring-orange-500' : verification.status === 'Rejected' ? 'ring-2 ring-red-500' : ''}`}>
                    <div className="bg-gray-50/50 p-6 border-b flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="flex-1">
                        <h4 className="text-lg font-black text-blue-900 uppercase font-formal mb-2">{cat}</h4>
                        {fieldKey && (
                          <div className="flex flex-col md:flex-row md:items-center gap-8">
                            <div className="flex flex-col">
                              <span className="text-[9px] font-black text-gray-400 uppercase mb-1">{contextName}:</span>
                              <span className="text-3xl font-black text-orange-600 font-formal">{dataValue}</span>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => fieldKey && handleManualDataVerify('Approved', fieldKey, contextName)} className={`px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-2 rounded-lg ${verification.status === 'Approved' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-green-600 border-green-600 hover:bg-green-50'}`}>Đạt</button>
                              <button onClick={() => fieldKey && handleManualDataVerify('NeedsExplanation', fieldKey, contextName)} className={`px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-2 rounded-lg ${verification.status === 'NeedsExplanation' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-orange-500 border-orange-500 hover:bg-orange-50'}`}>Giải trình</button>
                              <button onClick={() => fieldKey && handleManualDataVerify('Rejected', fieldKey, contextName)} className={`px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-2 rounded-lg ${verification.status === 'Rejected' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-red-600 border-red-600 hover:bg-red-50'}`}>Không đạt</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      {list.map(ev => (
                        <div key={ev.id} className={`p-5 border flex flex-col md:flex-row gap-6 items-start md:items-center rounded-lg ${ev.status === 'Approved' ? 'bg-green-50 border-green-200' : ev.status === 'Rejected' ? 'bg-red-50 border-red-200' : ev.status === 'NeedsExplanation' ? 'bg-orange-50 border-orange-300' : 'bg-white'}`}>
                          <div className="flex-1 space-y-2">
                            <div className="flex justify-between items-start">
                              <h5 className="text-sm font-black text-gray-900 uppercase">{ev.name}</h5>
                              <button onClick={() => window.open(ev.fileUrl, '_blank')} className="text-blue-600 hover:text-orange-600 transition-colors"><i className="fas fa-external-link-alt text-xs"></i></button>
                            </div>
                            <p className="text-[8px] font-bold text-gray-400 uppercase">{ev.level} • {ev.status}</p>
                            {ev.adminFeedback && <p className="text-[10px] italic text-orange-700 mt-2">Phản hồi: {ev.adminFeedback}</p>}
                            {ev.studentExplanation && <p className="text-[10px] italic text-blue-700 font-bold">Giải trình của SV: {ev.studentExplanation}</p>}
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleEvidenceAction(cat, ev.id, 'Approved')} className={`px-4 py-2.5 text-[8px] font-black uppercase tracking-widest border-2 rounded-lg ${ev.status === 'Approved' ? 'bg-green-600 text-white border-green-600' : 'text-green-600 border-green-600 hover:bg-green-50'}`}>Đạt</button>
                            <button onClick={() => handleEvidenceAction(cat, ev.id, 'NeedsExplanation')} className={`px-4 py-2.5 text-[8px] font-black uppercase tracking-widest border-2 rounded-lg ${ev.status === 'NeedsExplanation' ? 'bg-orange-500 text-white border-orange-500' : 'text-orange-500 border-orange-500 hover:bg-orange-50'}`}>Giải trình</button>
                            <button onClick={() => handleEvidenceAction(cat, ev.id, 'Rejected')} className={`px-4 py-2.5 text-[8px] font-black uppercase tracking-widest border-2 rounded-lg ${ev.status === 'Rejected' ? 'bg-red-600 text-white border-red-600' : 'text-red-600 border-red-600 hover:bg-red-50'}`}>Không đạt</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const HomeView: React.FC<{ faces: FeaturedFace[], onNavigate: (page: 'home' | 'profile' | 'admin') => void }> = ({ faces, onNavigate }) => {
  return (
    <div className="font-sans">
      <section className="bg-blue-900 text-white py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(242,101,34,0.4),transparent_70%)]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-12 relative z-10 flex flex-col md:flex-row items-center justify-between gap-16">
          <div className="flex-1">
            <span className="text-orange-500 font-black text-[10px] uppercase tracking-[0.6em] mb-6 block">DUE - UNIVERSITY OF ECONOMICS</span>
            <h1 className="text-7xl font-black uppercase leading-[0.9] tracking-tighter mb-10 font-formal">
              SINH VIÊN <br />
              <span className="text-orange-500">5 TỐT</span> <br />
              <span className="text-4xl tracking-normal">NIÊN KHÓA 2024</span>
            </h1>
            <p className="text-blue-100 text-lg mb-12 font-medium max-w-xl leading-relaxed opacity-80">
              Hệ thống quản lý và xét duyệt danh hiệu cao quý nhất dành cho sinh viên Việt Nam. Tự hào tôn vinh những cá nhân xuất sắc toàn diện.
            </p>
            <div className="flex gap-6">
              <button onClick={() => onNavigate('profile')} className="px-12 py-6 bg-orange-600 text-white font-black text-[10px] uppercase tracking-[0.4em] hover:bg-white hover:text-blue-900 transition-all shadow-2xl active:scale-95">Bắt đầu nộp hồ sơ</button>
              <button className="px-12 py-6 border-2 border-white/20 text-white font-black text-[10px] uppercase tracking-[0.4em] hover:bg-white/10 transition-all">Quy chế xét duyệt</button>
            </div>
          </div>
          <div className="hidden lg:block w-96 h-96 border-8 border-orange-500/20 rounded-full relative">
            <div className="absolute inset-4 border-4 border-white/10 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <i className="fas fa-award text-9xl text-orange-500 opacity-50"></i>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-[#fcfcfc]">
        <div className="max-w-7xl mx-auto px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-32">
            {[
              { label: 'Đạo đức', icon: 'fa-heart', desc: 'Rèn luyện tư tưởng, lối sống mẫu mực' },
              { label: 'Học tập', icon: 'fa-book-open', desc: 'Thành tích học tập và NCKH xuất sắc' },
              { label: 'Thể lực', icon: 'fa-running', desc: 'Sức khỏe tốt, tinh thần minh mẫn' },
              { label: 'Tình nguyện', icon: 'fa-hands-helping', desc: 'Cống hiến vì cộng đồng và xã hội' },
            ].map((item, i) => (
              <div key={i} className="bg-white p-10 border shadow-sm hover:shadow-xl transition-all group">
                <div className="w-14 h-14 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center text-xl mb-6 group-hover:bg-blue-900 group-hover:text-white transition-all"><i className={`fas ${item.icon}`}></i></div>
                <h4 className="text-lg font-black text-blue-900 uppercase mb-3 font-formal">{item.label}</h4>
                <p className="text-xs text-gray-400 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-end mb-16 border-b-2 border-blue-900 pb-8">
            <div>
              <span className="text-orange-500 font-black text-[10px] uppercase tracking-[0.5em] mb-3 block">Bản tin vinh danh</span>
              <h2 className="text-5xl font-black text-blue-900 uppercase tracking-tighter font-formal">Gương mặt tiêu biểu</h2>
            </div>
            <button className="text-[10px] font-black text-blue-900 uppercase tracking-widest border-b-2 border-blue-900 pb-1 hover:text-orange-600 hover:border-orange-600 transition-all">Xem tất cả</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {faces.map(face => (
              <div key={face.id} className="group cursor-pointer">
                <div className="relative aspect-[3/4] overflow-hidden mb-8 shadow-2xl bg-gray-100 border-8 border-white">
                  <img src={face.image} alt={face.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-8">
                    <p className="text-white text-xs font-medium italic">"{face.content}"</p>
                  </div>
                </div>
                <h3 className="text-xl font-black text-blue-900 uppercase tracking-tight mb-2 font-formal">{face.name}</h3>
                <p className="text-orange-600 font-black text-[10px] uppercase tracking-[0.3em]">{face.achievement}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-blue-950 py-32 text-white">
        <div className="max-w-4xl mx-auto px-12 text-center space-y-12">
          <h2 className="text-4xl font-black uppercase font-formal tracking-tight">Sẵn sàng để trở thành <span className="text-orange-500">Sinh viên 5 Tốt</span>?</h2>
          <p className="text-blue-200 text-lg opacity-70">Gia nhập cộng đồng những sinh viên ưu tú nhất DUE và khẳng định bản thân.</p>
          <button onClick={() => onNavigate('profile')} className="px-16 py-6 bg-white text-blue-900 font-black text-[10px] uppercase tracking-[0.5em] hover:bg-orange-600 hover:text-white transition-all shadow-2xl">Nộp hồ sơ ngay</button>
        </div>
      </section>
    </div>
  );
};

const LoginView: React.FC<{ onLogin: (role: 'student' | 'admin') => void, onNavigate: (page: any) => void }> = ({ onLogin, onNavigate }) => {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const logoUrl = "https://tse3.mm.bing.net/th/id/OIP.Odk0Vk_H8Tfz70lpKj4FQAHaG8?pid=Api&P=0&h=180";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      if (studentId.toLowerCase().includes('admin')) {
        onLogin('admin');
      } else {
        onLogin('student');
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 font-sans">
      <div className="max-w-5xl w-full bg-white shadow-2xl rounded-3xl overflow-hidden flex flex-col md:flex-row min-h-[600px] ring-1 ring-black/5">
        {/* Left Side: Branding */}
        <div className="md:w-[45%] bg-gradient-to-br from-[#002b5c] to-[#001a3a] relative p-12 md:p-14 flex flex-col justify-between overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-[#f26522] opacity-15 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-blue-400 opacity-10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <img src={logoUrl} alt="DUE Logo" className="h-12 w-auto brightness-0 invert" />
              <div className="h-10 w-px bg-white/20"></div>
              <span className="text-white/80 font-bold text-[9px] uppercase tracking-[0.3em]">Trường ĐH Kinh tế<br />Đà Nẵng</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-white uppercase leading-[0.95] tracking-tight mb-6 font-formal">
              Hệ thống <br />
              <span className="text-orange-400">Xét duyệt</span> <br />
              Sinh viên <br />
              <span className="text-orange-400">5 Tốt</span>
            </h1>

            <p className="text-blue-200/60 text-sm font-medium max-w-xs leading-relaxed">
              Cổng thông tin chính thức dành cho sinh viên DUE tham gia phong trào "Sinh viên 5 Tốt" các cấp.
            </p>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex gap-8">
              {[
                { icon: 'fa-heart', label: 'Đạo đức' },
                { icon: 'fa-book-open', label: 'Học tập' },
                { icon: 'fa-running', label: 'Thể lực' },
                { icon: 'fa-hands-helping', label: 'Tình nguyện' },
                { icon: 'fa-globe-asia', label: 'Hội nhập' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 group">
                  <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-orange-500/30 transition-all duration-300">
                    <i className={`fas ${item.icon} text-white/70 text-xs group-hover:text-orange-300 transition-all`}></i>
                  </div>
                  <span className="text-[7px] font-bold text-white/40 uppercase tracking-wider">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Abstract Shapes */}
          <div className="absolute right-[-20%] top-[15%] w-80 h-80 border-[30px] border-white/[0.03] rounded-full"></div>
          <div className="absolute right-[-8%] top-[35%] w-52 h-52 border-[15px] border-orange-500/[0.06] rounded-full"></div>
        </div>

        {/* Right Side: Login Form */}
        <div className="md:w-[55%] p-12 md:p-16 flex flex-col justify-center bg-white">
          <div className="max-w-sm mx-auto w-full">
            {/* Welcome Icon */}
            <div className="w-16 h-16 bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-900/20">
              <i className="fas fa-user-graduate text-white text-xl"></i>
            </div>

            <h2 className="text-2xl font-black text-blue-900 uppercase font-formal tracking-tight mb-2">Đăng nhập</h2>
            <p className="text-gray-400 text-sm font-medium mb-10">Nhập mã số sinh viên để truy cập hệ thống xét duyệt.</p>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mã số sinh viên</label>
                <div className="relative group">
                  <i className="fas fa-id-card absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-900 transition-colors text-sm"></i>
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="VD: 20123456"
                    className="w-full pl-12 pr-5 py-4 bg-gray-50/80 border-2 border-gray-100 focus:border-blue-900 focus:bg-white outline-none transition-all font-bold text-sm rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mật khẩu</label>
                <div className="relative group">
                  <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-900 transition-colors text-sm"></i>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-4 bg-gray-50/80 border-2 border-gray-100 focus:border-blue-900 focus:bg-white outline-none transition-all font-bold text-sm rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-blue-900 transition-colors"
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4.5 bg-gradient-to-r from-blue-900 to-blue-800 text-white font-black text-[10px] uppercase tracking-[0.35em] hover:from-orange-600 hover:to-orange-500 transition-all shadow-xl shadow-blue-900/20 hover:shadow-orange-500/20 active:scale-[0.98] rounded-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      Đang xác thực...
                    </>
                  ) : (
                    <>
                      Đăng nhập hệ thống
                      <i className="fas fa-arrow-right text-[10px]"></i>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-10 pt-8 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                Chưa có tài khoản? <button onClick={() => alert('Vui lòng liên hệ Ban cán sự lớp hoặc Đoàn - Hội Sinh viên để được cấp tài khoản.')} className="text-orange-600 font-bold hover:underline ml-1">Liên hệ cấp tài khoản</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'profile' | 'admin' | 'login'>('home');
  const [userRole, setUserRole] = useState<'student' | 'admin' | 'guest'>('guest');
  const [faces, setFaces] = useState<FeaturedFace[]>(INITIAL_FACES.map((f, i) => ({ ...f, id: i.toString(), content: 'Gương mặt sinh viên xuất sắc tiêu biểu của nhà trường.' })));

  const [student, setStudent] = useState<StudentProfile>({
    id: 'SV001', fullName: 'Lê Thanh Bình', studentId: '20123456', class: 'K20.CNTT', faculty: 'Khoa Công nghệ thông tin',
    gpa: 0, peScore: 0, trainingPoints: 0, englishLevel: 'None', englishGpa: 0, isPartyMember: false, noViolation: true, status: 'Draft',
    evidences: { [CriterionType.ETHICS]: [], [CriterionType.ACADEMIC]: [], [CriterionType.PHYSICAL]: [], [CriterionType.VOLUNTEER]: [], [CriterionType.INTEGRATION]: [] },
    totalScore: 0,
    verifications: {
      gpa: { status: 'Pending' },
      trainingPoints: { status: 'Pending' },
      peScore: { status: 'Pending' },
      english: { status: 'Pending' },
      partyMember: { status: 'Pending' }
    }
  });

  useEffect(() => {
    let score = 0;
    (Object.values(student.evidences) as Evidence[][]).forEach(list => {
      list.forEach(ev => {
        // Nếu là Admin hoặc hồ sơ đã duyệt, chỉ tính điểm đã duyệt
        // Nếu là Sinh viên đang làm hồ sơ, tính cả điểm đang chờ duyệt (dự kiến)
        if (ev.status === 'Approved' || (student.status === 'Draft' || student.status === 'Submitted' || student.status === 'Processing')) {
          score += ev.points;
        }
      });
    });
    if (student.isPartyMember) score += 0.4;
    if (student.gpa >= 3.4) score += 0.1;
    if (student.trainingPoints >= 90) score += 0.1;
    setStudent(prev => ({ ...prev, totalScore: Number(score.toFixed(1)) }));
  }, [student.evidences, student.isPartyMember, student.gpa, student.trainingPoints, student.status]);

  const addEvidence = (type: CriterionType, ev: Evidence) => setStudent(prev => ({ ...prev, evidences: { ...prev.evidences, [type]: [...prev.evidences[type], { ...ev, status: 'Pending' }] } }));
  const removeEvidence = (type: CriterionType, id: string) => setStudent(prev => ({ ...prev, evidences: { ...prev.evidences, [type]: prev.evidences[type].filter(ev => ev.id !== id) } }));
  const updateProfile = (data: Partial<StudentProfile>) => setStudent(prev => ({ ...prev, ...data }));
  const updateEvidenceExplanation = (cat: CriterionType, id: string, explanation: string) => {
    setStudent(prev => {
      const updated = { ...prev.evidences };
      updated[cat] = updated[cat].map(ev => ev.id === id ? { ...ev, studentExplanation: explanation } : ev);
      return { ...prev, evidences: updated };
    });
  };
  const updateFieldExplanation = (field: keyof StudentProfile['verifications'], explanation: string) => {
    setStudent(prev => ({
      ...prev,
      verifications: {
        ...prev.verifications,
        [field]: { ...prev.verifications[field], feedback: explanation }
      }
    }));
  };
  const handleAdminUpdateStatus = (status: StudentProfile['status'], feedback?: string) => setStudent(prev => ({ ...prev, status, feedback }));
  const handleAdminUpdateEvidenceStatus = (cat: CriterionType, id: string, status: Evidence['status'], feedback?: string) => {
    setStudent(prev => {
      const updated = { ...prev.evidences };
      updated[cat] = updated[cat].map(ev => ev.id === id ? { ...ev, status, adminFeedback: feedback } : ev);
      return { ...prev, evidences: updated };
    });
  };
  const handleUpdateFieldVerification = (field: keyof StudentProfile['verifications'], status: FieldVerification['status'], feedback?: string) => {
    setStudent(prev => ({
      ...prev,
      verifications: {
        ...prev.verifications,
        [field]: { status, feedback }
      }
    }));
  };

  const handleResubmitExplanation = () => {
    if (window.confirm("Bạn xác nhận gửi phản hồi giải trình?")) {
      setStudent(p => ({ ...p, status: 'Submitted' }));
      alert("Đã gửi phản hồi giải trình thành công!");
    }
  };

  return (
    <Layout userType={userRole} onNavigate={(p: any) => setCurrentPage(p)}>
      {currentPage === 'home' && <HomeView faces={faces} onNavigate={(p) => setCurrentPage(p)} />}
      {currentPage === 'login' && (
        <LoginView
          onLogin={(role) => {
            setUserRole(role);
            setCurrentPage(role === 'admin' ? 'admin' : 'profile');
          }}
          onNavigate={(p) => setCurrentPage(p)}
        />
      )}
      {currentPage === 'profile' && (
        <StudentDashboard
          student={student}
          addEvidence={addEvidence}
          removeEvidence={removeEvidence}
          updateProfile={updateProfile}
          updateEvidenceExplanation={updateEvidenceExplanation}
          updateFieldExplanation={updateFieldExplanation}
          onSubmit={() => {
            if (Object.values(CriterionType).every(cat => checkHardMet(cat, student))) {
              setStudent(p => ({ ...p, status: 'Submitted' })); alert('Hồ sơ đã gửi thành công!');
            } else alert('Bạn chưa đạt đủ các chuẩn cứng cơ bản.');
          }}
          onResubmit={handleResubmitExplanation}
        />
      )}
      {currentPage === 'admin' && (
        <AdminDashboard
          student={student}
          onUpdateStatus={handleAdminUpdateStatus}
          onUpdateEvidenceStatus={handleAdminUpdateEvidenceStatus}
          onUpdateFieldVerification={handleUpdateFieldVerification}
          faces={faces}
          onUpdateFaces={setFaces}
        />
      )}

      <div className="fixed bottom-12 right-12 flex bg-white border shadow-2xl z-[100] p-1 ring-1 ring-black/5 rounded-full">
        <button onClick={() => { setUserRole('student'); setCurrentPage('profile'); }} className={`px-6 py-2 text-[9px] font-bold uppercase transition-all rounded-full ${userRole === 'student' ? 'bg-blue-900 text-white' : 'text-gray-400'}`}>SV</button>
        <button onClick={() => { setUserRole('admin'); setCurrentPage('admin'); }} className={`px-6 py-2 text-[9px] font-bold uppercase transition-all rounded-full ${userRole === 'admin' ? 'bg-orange-600 text-white' : 'text-gray-400'}`}>Admin</button>
      </div>
    </Layout>
  );
};

export default App;
