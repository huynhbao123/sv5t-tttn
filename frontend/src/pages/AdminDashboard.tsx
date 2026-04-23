import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { CriterionType, Evidence, StudentProfile, FeaturedFace, FieldVerification, Post, EvidenceType } from '../types';
import { adminService } from '../services/adminService';
import { useNavigate, useParams } from 'react-router-dom';
import { SystemConfig } from '../types';

// Sub-components
import AdminSidebar from '../components/admin/AdminSidebar';
import ProfileList from '../components/admin/ProfileList';
import StatsOverview from '../components/admin/StatsOverview';
import CriteriaManager from '../components/admin/CriteriaManager';
import UserManager from '../components/admin/UserManager';
import PostManager from '../components/admin/PostManager';
import FaceManager from '../components/admin/FaceManager';
import SettingsPanel from '../components/admin/SettingsPanel';
import ProfileReviewModal from '../components/admin/ProfileReviewModal';
import FeedbackModal from '../components/admin/FeedbackModal';
import TopStudentsModal from '../components/admin/TopStudentsModal';

const SIDEBAR_ITEMS = [
  { key: 'profiles', icon: 'fa-folder-open', label: 'Quản lý hồ sơ' },
  { key: 'stats', icon: 'fa-chart-bar', label: 'Thống kê' },
  { key: 'criteria', icon: 'fa-list-check', label: 'Quản lý tiêu chí' },
  { key: 'users', icon: 'fa-users', label: 'Quản lý người dùng' },
  { key: 'posts', icon: 'fa-newspaper', label: 'Quản lý bài viết' },
  { key: 'faces', icon: 'fa-award', label: 'Vinh danh' },
  { key: 'settings', icon: 'fa-cog', label: 'Cấu hình hệ thống' },
];

type CriterionItem = { id: string; description: string; isHard: boolean; points?: number; levelPoints: Record<string, number>; hasDecisionNumber: boolean; allowNoDecision: boolean; minQty?: number };

const AdminDashboard: React.FC<{
  students: StudentProfile[],
  selectedStudent: StudentProfile,
  onSelectStudent: (id: string) => void,
  onUpdateStatus: (status: StudentProfile['status'], feedback?: string) => void,
  onUpdateEvidenceStatus: (cat: CriterionType, id: string, status: Evidence['status'], feedback?: string) => void,
  onUpdateFieldVerification: (field: keyof StudentProfile['verifications'], action: FieldVerification['status'], feedback?: string) => void,
  faces: FeaturedFace[],
  onAddFace: (face: Omit<FeaturedFace, 'id'>) => void,
  onUpdateFace: (id: string, face: Partial<FeaturedFace>) => void,
  onDeleteFace: (id: string) => void,
  criteriaGroups: any[],
  setCriteriaGroups: React.Dispatch<React.SetStateAction<any[]>>,
  posts: Post[],
  onAddPost: (post: { title: string, content: string, status: string, imageFile?: File }) => void,
  onUpdatePost: (id: string, post: { title?: string, content?: string, status?: string, imageFile?: File }) => void,
  onDeletePost: (id: string) => void,
  systemSettings: SystemConfig | null,
  setSystemSettings: React.Dispatch<React.SetStateAction<SystemConfig | null>>
}> = ({ students, selectedStudent, onSelectStudent, onUpdateStatus, onUpdateEvidenceStatus, onUpdateFieldVerification, faces, onAddFace, onUpdateFace, onDeleteFace, criteriaGroups, setCriteriaGroups, posts, onAddPost, onUpdatePost, onDeletePost, systemSettings, setSystemSettings }) => {
  const navigate = useNavigate();
  const { activeTab: urlTab } = useParams<{ activeTab: string }>();
  const activeTab = urlTab || 'profiles';
  
  const [isReviewing, setIsReviewing] = useState(false);
  const [isTopExpanded, setIsTopExpanded] = useState(false);

  // Lock body scroll for dashboard
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  // Criteria state
  const [managedCriteria, setManagedCriteria] = useState<Record<string, CriterionItem[]>>({});

  useEffect(() => {
    const init: Record<string, CriterionItem[]> = {};
    criteriaGroups.forEach(group => {
      init[group.TenNhom] = group.tieu_chi.map((tc: any) => {
        const lp: Record<string, number> = {};
        if (tc.diem_cap_do && tc.diem_cap_do.length > 0) {
          tc.diem_cap_do.forEach((d: any) => {
            const levelKey = d.CapDo === 'Cấp Khoa/CLB' ? 'khoa' :
                             d.CapDo === 'Cấp Trường/Phường/Xã' ? 'truong' :
                             d.CapDo === 'Cấp ĐHĐN' ? 'dhdn' :
                             d.CapDo === 'Cấp Tỉnh/Thành phố' ? 'tinh' :
                             d.CapDo === 'Cấp Trung ương' ? 'tw' : null;
            if (levelKey) lp[levelKey] = Number(d.Diem);
          });
        }
        return {
          id: String(tc.id),
          description: tc.MoTa,
          isHard: tc.LoaiTieuChi === 'Cung',
          points: Number(tc.Diem || 0),
          levelPoints: lp,
          hasDecisionNumber: Boolean(tc.CoSoQuyetDinh),
          allowNoDecision: Boolean(tc.KhongSoQuyetDinh),
          minQty: tc.SoLuongToiThieu
        };
      });
    });
    setManagedCriteria(init);
  }, [criteriaGroups]);

  // Feedback Modal State
  const [feedbackModal, setFeedbackModal] = useState<{
    show: boolean;
    type: 'Approved' | 'Rejected' | 'NeedsExplanation';
    title: string;
    message: string;
    requireFeedback: boolean;
    onSubmit: (feedback?: string) => void;
  }>({
    show: false, type: 'Approved', title: '', message: '', requireFeedback: false, onSubmit: () => {}
  });

  // Helper functions
  const getExplanationCount = () => {
    let count = 0;
    if (!selectedStudent) return 0;
    (Object.values(selectedStudent.verifications) as FieldVerification[]).forEach(v => { if (v.status === 'NeedsExplanation') count++; });
    (Object.values(selectedStudent.evidences) as Evidence[][]).forEach(list => list.forEach(e => { if (e.status === 'NeedsExplanation') count++; }));
    return count;
  };

  const hasRejectedHardCriteria = () => {
    if (!selectedStudent) return false;
    const rejectedVerifications = (Object.values(selectedStudent.verifications) as FieldVerification[]).some(v => v.status === 'Rejected');
    if (rejectedVerifications) return true;
    const rejectedHardEvidences = (Object.values(selectedStudent.evidences) as Evidence[][]).flat().some(e => e.isHardCriterion && e.status === 'Rejected');
    return rejectedHardEvidences;
  };

  const hasPendingEvidences = () => {
    if (!selectedStudent) return false;
    const pendingEvidences = (Object.values(selectedStudent.evidences) as Evidence[][]).flat().some(e => e.status === 'Pending');
    return pendingEvidences;
  };

  // Action handlers
  const handleAction = (status: StudentProfile['status']) => {
    const actionTxt = status === 'Approved' ? 'CÔNG NHẬN DANH HIỆU' : status === 'Processing' ? 'GỬI YÊU CẦU GIẢI TRÌNH' : 'TỪ CHỐI HỒ SƠ';
    
    setFeedbackModal({
      show: true,
      type: status as any,
      title: actionTxt,
      message: `Bạn đang thực hiện hành động: ${actionTxt} cho sinh viên ${selectedStudent.fullName}.`,
      requireFeedback: status === 'Rejected' || status === 'Processing',
      onSubmit: (feedback) => {
        if (status === 'Approved' && (hasRejectedHardCriteria() || hasPendingEvidences())) {
          const message = hasPendingEvidences() 
            ? "Vui lòng thẩm định tất cả các minh chứng trước khi duyệt hồ sơ."
            : "Không thể duyệt hồ sơ vì có tiêu chí cứng bị từ chối.";
          toast.error(message);
          return;
        }
        const needsExplanationCount = getExplanationCount();
        if (status === 'Processing' && needsExplanationCount === 0) {
          toast.error("Vui lòng đánh dấu ít nhất một mục cần giải trình trước khi gửi yêu cầu.");
          return;
        }
        onUpdateStatus(status, feedback);
        setIsReviewing(false);
        setFeedbackModal(prev => ({ ...prev, show: false }));
        
        if (status === 'Processing') {
          toast.success(`Hồ sơ ${selectedStudent.fullName} đã chuyển sang mục [Đang giải trình]`, { duration: 5000 });
        }
      }
    });
  };

  const handleEvidenceAction = (cat: CriterionType, id: string, action: 'Approved' | 'Rejected' | 'NeedsExplanation') => {
    const currentEv = (selectedStudent.evidences[cat] || []).find(e => e.id === id);
    if (currentEv && currentEv.status === action) {
      onUpdateEvidenceStatus(cat, id, 'Pending');
      return;
    }
    if (action === 'Approved' || action === 'Rejected') {
      onUpdateEvidenceStatus(cat, id, action);
      return;
    }
    setFeedbackModal({
      show: true,
      type: action,
      title: 'YÊU CẦU GIẢI TRÌNH',
      message: `Bạn đang thực hiện hành động: YÊU CẦU GIẢI TRÌNH.`,
      requireFeedback: true,
      onSubmit: (feedback) => {
        onUpdateEvidenceStatus(cat, id, action, feedback);
        setFeedbackModal(prev => ({ ...prev, show: false }));
      }
    });
  };

  const handleManualDataVerify = (action: 'Approved' | 'Rejected' | 'NeedsExplanation', fieldKey: keyof StudentProfile['verifications'], context: string) => {
    const currentStatus = selectedStudent.verifications[fieldKey]?.status;
    if (currentStatus === action) {
      onUpdateFieldVerification(fieldKey, 'Pending');
      return;
    }
    if (action === 'Approved' || action === 'Rejected') {
      onUpdateFieldVerification(fieldKey, action);
      return;
    }
    setFeedbackModal({
      show: true,
      type: action,
      title: 'YÊU CẦU GIẢI TRÌNH',
      message: `Cập nhật trạng thái xác minh cho mục [${context}].`,
      requireFeedback: true,
      onSubmit: (feedback) => {
        onUpdateFieldVerification(fieldKey, action, feedback);
        setFeedbackModal(prev => ({ ...prev, show: false }));
      }
    });
  };

  // Render active tab content
  const renderContent = () => {
    switch (activeTab) {
      case 'profiles': 
        return <ProfileList students={students} onSelectStudent={onSelectStudent} onStartReview={() => setIsReviewing(true)} onShowConfirm={setFeedbackModal} />;
      case 'stats': 
        return <StatsOverview students={students} onSelectStudent={onSelectStudent} onStartReview={() => setIsReviewing(true)} onExpandTop={() => setIsTopExpanded(true)} />;
      case 'criteria': 
        return <CriteriaManager criteriaGroups={criteriaGroups} setCriteriaGroups={setCriteriaGroups} managedCriteria={managedCriteria} setManagedCriteria={setManagedCriteria} onShowConfirm={setFeedbackModal} />;
      case 'users': 
        return <UserManager onShowConfirm={setFeedbackModal} />;
      case 'posts': 
        return <PostManager posts={posts} onAddPost={onAddPost} onUpdatePost={onUpdatePost} onDeletePost={onDeletePost} onShowConfirm={setFeedbackModal} />;
      case 'faces': 
        return <FaceManager faces={faces} onAddFace={onAddFace} onUpdateFace={onUpdateFace} onDeleteFace={onDeleteFace} onShowConfirm={setFeedbackModal} />;
      case 'settings': 
        return <SettingsPanel systemSettings={systemSettings} setSystemSettings={setSystemSettings} />;
      default: return null;
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] overflow-hidden animate-fade-in font-sans">
      {/* Sidebar */}
      <AdminSidebar activeTab={activeTab} items={SIDEBAR_ITEMS} />

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 flex flex-col h-full overflow-y-auto">
        {/* Top bar */}
        <div className="bg-white px-8 py-5 border-b border-gray-100 flex items-center justify-between">
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
        <div className="flex-1 p-8">{renderContent()}</div>
      </div>

      {/* Profile Review Modal */}
      <ProfileReviewModal
        show={isReviewing && !!selectedStudent}
        selectedStudent={selectedStudent}
        managedCriteria={managedCriteria}
        onClose={() => setIsReviewing(false)}
        onAction={handleAction}
        onEvidenceAction={handleEvidenceAction}
        onManualDataVerify={handleManualDataVerify}
        getExplanationCount={getExplanationCount}
        hasRejectedHardCriteria={hasRejectedHardCriteria}
        hasPendingEvidences={hasPendingEvidences}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        show={feedbackModal.show}
        type={feedbackModal.type}
        title={feedbackModal.title}
        message={feedbackModal.message}
        requireFeedback={feedbackModal.requireFeedback}
        onSubmit={feedbackModal.onSubmit}
        onClose={() => setFeedbackModal(prev => ({ ...prev, show: false }))}
      />

      {/* Top Students Modal */}
      <TopStudentsModal
        show={isTopExpanded}
        students={students}
        onClose={() => setIsTopExpanded(false)}
        onSelectStudent={onSelectStudent}
        onStartReview={() => setIsReviewing(true)}
      />
    </div>
  );
};

export default AdminDashboard;
