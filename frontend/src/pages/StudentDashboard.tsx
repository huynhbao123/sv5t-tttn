import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { CriterionType, Evidence, StudentProfile, EvidenceLevel, EvidenceType, FieldVerification, SystemConfig } from '../types';
import EvidenceForm from '../components/EvidenceForm';

// Sub-components
import DeadlineClosedView from '../components/student/DeadlineClosedView';
import SubmittedView from '../components/student/SubmittedView';
import ApprovedView from '../components/student/ApprovedView';
import RejectedView from '../components/student/RejectedView';
import ProcessingView from '../components/student/ProcessingView';
import UnsubmitModal from '../components/student/UnsubmitModal';
import StudentStepProgress from '../components/student/StudentStepProgress';
import DraftingView from '../components/student/DraftingView';
import SubmissionSummary from '../components/student/SubmissionSummary';

const STEPS = [
  CriterionType.ETHICS,
  CriterionType.ACADEMIC,
  CriterionType.PHYSICAL,
  CriterionType.VOLUNTEER,
  CriterionType.INTEGRATION,
  'SUBMIT' as const
];

export const checkHardMet = (cat: CriterionType, student: StudentProfile, criteriaGroups: any[]) => {
  const group = criteriaGroups.find(g => {
    const catMap: Record<string, CriterionType> = {
      'Đạo đức tốt': CriterionType.ETHICS,
      'Học tập tốt': CriterionType.ACADEMIC,
      'Thể lực tốt': CriterionType.PHYSICAL,
      'Tình nguyện tốt': CriterionType.VOLUNTEER,
      'Hội nhập tốt': CriterionType.INTEGRATION
    };
    return catMap[g.TenNhom] === cat;
  });

  if (!group) return false;

  const evs = student.evidences[cat] || [];
  const approvedEvs = evs.filter(e => e.status === 'Approved' || e.status === 'Pending');

  const hardCriteria = group.tieu_chi.filter((tc: any) => tc.LoaiTieuChi === 'Cung');
  
  if (hardCriteria.length === 0) {
    if (cat === CriterionType.ETHICS) return student.trainingPoints >= 80 && student.noViolation;
    if (cat === CriterionType.ACADEMIC) return student.gpa >= 3.2 && student.gpa <= 4.0;
    return true;
  }

  const isVolunteer = cat === CriterionType.VOLUNTEER;
  const results = hardCriteria.map((tc: any) => {
    const slug = tc.MaTieuChi;
    
    if (slug === 'eth_hard_1') return student.trainingPoints >= 80 && approvedEvs.some(e => e.subCriterionId === slug);
    if (slug === 'eth_hard_2') return student.noViolation;
    if (slug === 'aca_hard_1') return student.gpa >= 3.2 && approvedEvs.some(e => e.subCriterionId === slug);
    if (slug === 'phy_hard_1') return student.peScore >= 7.0 && approvedEvs.some(e => e.subCriterionId === slug);
    
    if (slug === 'int_hard_1' || slug === 'int_hard_2') {
       const profileMet = (['B1', 'B2', 'C1', 'C2'].includes(student.englishLevel) || student.englishGpa >= 3.0);
       return profileMet && approvedEvs.some(e => e.subCriterionId === slug);
    }

    if (slug === 'phy_hard_2') {
       return student.peScore >= 7.0 || approvedEvs.some(e => e.subCriterionId === tc.MaTieuChi);
    }
    
    if (isVolunteer) {
      const matchingEvs = approvedEvs.filter(e => e.subCriterionId === slug);
      const totalQty = matchingEvs.reduce((sum, e) => sum + (e.qty || 1), 0);
      
      if (slug === 'vol_hard_1') return totalQty >= 1;
      if (slug === 'vol_hard_2') return totalQty >= 3;
      if (slug === 'vol_hard_3') {
        const validGK = matchingEvs.filter(e => e.type === EvidenceType.GK && e.level !== EvidenceLevel.KHOA);
        const gkQty = validGK.reduce((sum, e) => sum + (e.qty || 1), 0);
        return gkQty >= 1;
      }
      if (slug === 'vol_hard_4') {
        const atDueEvs = matchingEvs.filter(e => e.level === EvidenceLevel.TRUONG);
        const atDueQty = atDueEvs.reduce((sum, e) => sum + (e.qty || 1), 0);
        return atDueQty >= 2 || totalQty >= 3;
      }
      return totalQty >= 1;
    }

    return approvedEvs.some(e => e.subCriterionId === tc.MaTieuChi);
  });

  if (cat === CriterionType.ETHICS || cat === CriterionType.ACADEMIC) {
    return results.every(res => res === true);
  }
  return results.some(res => res === true);
};

const StudentDashboard: React.FC<{
  student: StudentProfile;
  addEvidence: (type: CriterionType, ev: Evidence) => void;
  removeEvidence: (type: CriterionType, id: string) => void;
  updateEvidence: (type: CriterionType, id: string, ev: Evidence) => void;
  updateProfile: (data: Partial<StudentProfile>) => void;
  updateEvidenceExplanation: (cat: CriterionType, id: string, explanation: string, file?: File) => void;
  updateFieldExplanation: (field: keyof StudentProfile['verifications'], explanation: string, file?: File) => void;
  onSubmit: () => void;
  onResubmit: () => void;
  onUnsubmit: () => void;
  criteriaGroups: any[];
  systemSettings: SystemConfig | null;
  isLoading?: boolean;
}> = ({ student, addEvidence, removeEvidence, updateEvidence, updateProfile, updateEvidenceExplanation, updateFieldExplanation, onSubmit, onResubmit, onUnsubmit, criteriaGroups, systemSettings, isLoading }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [addingTo, setAddingTo] = useState<{ type: CriterionType, isHard: boolean, subName: string, subId: string, editingEvidence?: Evidence } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [showUnsubmitModal, setShowUnsubmitModal] = useState(false);
  const [isUnsubmittingAction, setIsUnsubmittingAction] = useState(false);

  // Local state for form inputs to prevent typing glitches
  const [localData, setLocalData] = useState({
    trainingPoints: student?.trainingPoints || 0,
    gpa: student?.gpa || 0,
    peScore: student?.peScore || 0,
    englishGpa: student?.englishGpa || 0,
    englishLevel: student?.englishLevel || 'None',
    noViolation: student?.noViolation || false,
    isPartyMember: student?.isPartyMember || false,
  });

  // Local state for explanations
  const [localFieldExplanations, setLocalFieldExplanations] = useState<Record<string, string>>({});
  const [localEvidenceExplanations, setLocalEvidenceExplanations] = useState<Record<string, string>>({});
  const [localFieldFiles, setLocalFieldFiles] = useState<Record<string, File>>({});
  const [localEvidenceFiles, setLocalEvidenceFiles] = useState<Record<string, File>>({});

  // Sync localData ONLY when student ID changes
  useEffect(() => {
    if (student) {
      setLocalData({
        trainingPoints: student.trainingPoints || 0,
        gpa: student.gpa || 0,
        peScore: student.peScore || 0,
        englishGpa: student.englishGpa || 0,
        englishLevel: student.englishLevel || 'None',
        noViolation: student.noViolation || false,
        isPartyMember: student.isPartyMember || false,
      });

      const fieldExps: Record<string, string> = {};
      Object.entries(student.verifications).forEach(([k, v]) => {
        const fieldVer = v as FieldVerification;
        if (fieldVer.explanation) fieldExps[k] = fieldVer.explanation;
      });
      setLocalFieldExplanations(fieldExps);

      const evExps: Record<string, string> = {};
      Object.values(student.evidences).flat().forEach(val => {
        const ev = val as Evidence;
        if (ev.studentExplanation) evExps[ev.id] = ev.studentExplanation;
      });
      setLocalEvidenceExplanations(evExps);
    }
  }, [student?.id]);

  const isLocked = ['Submitted', 'Pending', 'Approved', 'Processing'].includes(student?.status || '');
  const isProcessing = student?.status === 'Processing';
  const isApproved = student?.status === 'Approved';
  const isRejected = student?.status === 'Rejected';

  const isReviewed = useMemo(() => {
    if (!student) return false;
    return student.daXemXet === true ||
      ['Processing', 'Approved', 'Rejected'].includes(student.status) ||
      Object.values(student.verifications).some((v: any) => (v?.status && v.status !== 'Pending') || !!v?.adminFeedback || !!v?.explanation) ||
      Object.values(student.evidences).flat().some((e: any) => (e?.status && e.status !== 'Pending') || !!e?.adminFeedback || !!e?.studentExplanation);
  }, [student]);

  const isSubmissionOpen = useMemo(() => {
    if (!systemSettings) return true;
    if (!systemSettings.TrangThaiMo) return false;
    const now = new Date();
    const start = systemSettings.ThoiGianBatDau ? new Date(systemSettings.ThoiGianBatDau) : null;
    const end = systemSettings.ThoiGianKetThuc ? new Date(systemSettings.ThoiGianKetThuc) : null;
    if (start && now < start) return false;
    if (end && now > end) return false;
    return true;
  }, [systemSettings]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-blue-900/10 border-t-blue-900 rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest animate-pulse">Đang tải hồ sơ...</p>
      </div>
    );
  }

  if (!isSubmissionOpen && !isProcessing) {
    return <DeadlineClosedView message={systemSettings?.ThongBaoHetHan || student?.submission_msg} />;
  }

  if (!student) return <div className="text-center py-20 font-black text-blue-900 uppercase tracking-widest">Không tìm thấy thông tin sinh viên</div>;

  const handleFinalSubmitExplanation = async () => {
    try {
      setIsResubmitting(true);
      for (const [key, exp] of Object.entries(localFieldExplanations)) {
        const file = localFieldFiles[key];
        const originalExp = (student.verifications[key] as FieldVerification)?.explanation || '';
        if (exp !== originalExp || file) await updateFieldExplanation(key as any, exp, file);
      }
      for (const [id, exp] of Object.entries(localEvidenceExplanations)) {
        const file = localEvidenceFiles[id];
        let originalEv: Evidence | undefined;
        let category: CriterionType | null = null;
        for (const [cat, evs] of Object.entries(student.evidences)) {
          const found = (evs as Evidence[]).find(e => e.id === id);
          if (found) { originalEv = found; category = cat as CriterionType; break; }
        }
        const originalExp = originalEv?.studentExplanation || '';
        if (category && (exp !== originalExp || file)) await updateEvidenceExplanation(category, id, exp, file);
      }
      await onResubmit();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (e) {
      toast.error("Có lỗi xảy ra khi gửi giải trình. Vui lòng thử lại.");
    } finally {
      setIsResubmitting(false);
    }
  };

  const handleLocalChange = (field: string, value: any) => {
    const finalValue = field === 'noViolation' && typeof value === 'string' ? value === 'true' : value;
    setLocalData(prev => ({ ...prev, [field]: finalValue }));
    if (typeof finalValue === 'boolean' || field === 'englishLevel') {
      updateProfile({ [field]: finalValue });
    }
  };

  const handleBlur = (field: string, isFloat = false, maxVal = 100) => {
    const valStr = String((localData as any)[field]);
    if (valStr.trim() === '') {
       setLocalData(prev => ({ ...prev, [field]: 0 }));
       updateProfile({ [field]: 0 });
       return;
    }
    let num = isFloat ? parseFloat(valStr) : parseInt(valStr, 10);
    if (isNaN(num)) num = 0;
    num = Math.min(maxVal, Math.max(0, num));
    setLocalData(prev => ({ ...prev, [field]: num }));
    updateProfile({ [field]: num });
  };

  const handleSaveEvidence = (ev: Evidence) => {
    if (addingTo?.editingEvidence) {
      updateEvidence(addingTo.type, addingTo.editingEvidence.id, ev);
    } else {
      addEvidence(addingTo!.type, ev);
    }
    setAddingTo(null);
  };

  const currentStudentDataForCheck = { ...student, ...localData };
  const catStatus = {
    [CriterionType.ETHICS]: checkHardMet(CriterionType.ETHICS, currentStudentDataForCheck, criteriaGroups),
    [CriterionType.ACADEMIC]: checkHardMet(CriterionType.ACADEMIC, currentStudentDataForCheck, criteriaGroups),
    [CriterionType.PHYSICAL]: checkHardMet(CriterionType.PHYSICAL, currentStudentDataForCheck, criteriaGroups),
    [CriterionType.VOLUNTEER]: checkHardMet(CriterionType.VOLUNTEER, currentStudentDataForCheck, criteriaGroups),
    [CriterionType.INTEGRATION]: checkHardMet(CriterionType.INTEGRATION, currentStudentDataForCheck, criteriaGroups),
  };
  const allHardMet = Object.values(catStatus).every(v => v);

  // Status-based conditional rendering
  if (student.status === 'Submitted') {
    return (
      <>
        <SubmittedView student={student} isSubmissionOpen={isSubmissionOpen} isReviewed={isReviewed} canEdit={isSubmissionOpen || isProcessing} criteriaGroups={criteriaGroups} systemSettings={systemSettings} onShowUnsubmitModal={() => setShowUnsubmitModal(true)} />
        <UnsubmitModal show={showUnsubmitModal} isUnsubmittingAction={isUnsubmittingAction} onClose={() => setShowUnsubmitModal(false)} onConfirm={async () => {
          setIsUnsubmittingAction(true);
          try { await onUnsubmit(); setShowUnsubmitModal(false); } catch (e) {} finally { setIsUnsubmittingAction(false); }
        }} />
      </>
    );
  }
  if (isApproved) return <ApprovedView student={student} />;
  if (isRejected) return <RejectedView student={student} />;
  if (isProcessing) {
    return (
      <ProcessingView 
        student={student} canEdit={isSubmissionOpen || isProcessing} isResubmitting={isResubmitting}
        localFieldExplanations={localFieldExplanations} setLocalFieldExplanations={setLocalFieldExplanations}
        localEvidenceExplanations={localEvidenceExplanations} setLocalEvidenceExplanations={setLocalEvidenceExplanations}
        localFieldFiles={localFieldFiles} setLocalFieldFiles={setLocalFieldFiles}
        localEvidenceFiles={localEvidenceFiles} setLocalEvidenceFiles={setLocalEvidenceFiles}
        handleFinalSubmitExplanation={handleFinalSubmitExplanation}
        onFileSelect={(type, key, file) => {
          if (type === 'field') setLocalFieldFiles(prev => ({ ...prev, [key]: file }));
          else setLocalEvidenceFiles(prev => ({ ...prev, [key]: file }));
          toast.success("Đã chọn file: " + file.name + ". File sẽ được gửi khi bạn bấm nút GỬI PHẢN HỒI.");
        }}
      />
    );
  }

  // Drafting View
  const currentStep = STEPS[currentStepIdx];
  const isReviewStep = currentStep === 'SUBMIT';
  const canEdit = isSubmissionOpen || isProcessing;

  return (
    <div className="pb-24 font-sans">
      <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-in space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b pb-8">
          <div className="flex-1">
            <h1 className="text-3xl font-black text-[#0054a6] uppercase font-formal tracking-tighter">{student.fullName}</h1>
            <StudentStepProgress steps={STEPS as string[]} currentStepIdx={currentStepIdx} catStatus={catStatus} allHardMet={allHardMet} onStepClick={setCurrentStepIdx} />
          </div>
          <div className="flex gap-3">
            <button onClick={() => currentStepIdx > 0 && setCurrentStepIdx(currentStepIdx - 1)} disabled={currentStepIdx === 0} className={`px-6 py-3 font-black text-[9px] uppercase tracking-widest border rounded-lg transition-all flex items-center gap-2 ${currentStepIdx === 0 ? 'border-gray-100 text-gray-200' : 'border-blue-200 text-blue-700 hover:bg-blue-50'}`}>
              <i className="fas fa-arrow-left text-[8px]"></i> Quay lại
            </button>
            <button onClick={() => currentStepIdx < STEPS.length - 1 && setCurrentStepIdx(currentStepIdx + 1)} disabled={currentStepIdx === STEPS.length - 1} className={`px-6 py-3 font-black text-[9px] uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 ${currentStepIdx === STEPS.length - 1 ? 'bg-gray-100 text-gray-300' : 'bg-blue-900 text-white hover:bg-orange-600'}`}>
              Tiếp theo <i className="fas fa-arrow-right text-[8px]"></i>
            </button>
          </div>
        </div>

        <div className="min-h-[400px]">
          {isReviewStep ? (
            <SubmissionSummary student={student} allHardMet={allHardMet} isLocked={isLocked} canEdit={canEdit} onSubmit={onSubmit} />
          ) : (
            <DraftingView 
              cat={currentStep as CriterionType} student={student} currentStepIdx={currentStepIdx} totalSteps={STEPS.length} isHardMet={catStatus[currentStep as CriterionType]} isLocked={isLocked} canEdit={canEdit} isProcessing={isProcessing} criteriaGroups={criteriaGroups} localData={localData} handleLocalChange={handleLocalChange} handleBlur={handleBlur} removeEvidence={removeEvidence} setAddingTo={setAddingTo}
            />
          )}
        </div>

        {addingTo && !isLocked && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-blue-950/90 backdrop-blur-sm p-4 animate-fade-in">
            <EvidenceForm criterionType={addingTo.type} isHard={addingTo.isHard} subCriterionName={addingTo.subName} subCriterionId={addingTo.subId} initialData={addingTo.editingEvidence} criteriaGroups={criteriaGroups} onAdd={handleSaveEvidence} onCancel={() => setAddingTo(null)} />
          </div>
        )}
        
        {showSuccess && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-blue-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white p-12 rounded-3xl border border-green-500/30 scale-110 animate-scale-up text-center space-y-6">
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-4xl"><i className="fas fa-check"></i></div>
              <div>
                <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tight">GỬI THÀNH CÔNG!</h2>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">Phản hồi của bạn đã được gửi đến Admin xử lý.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
