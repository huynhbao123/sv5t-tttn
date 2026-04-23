import React from 'react';
import { StudentProfile, CriterionType, Evidence, FieldVerification } from '../../types';
import { formatUrl } from '../../utils/mapper';

interface ProcessingViewProps {
  student: StudentProfile;
  canEdit: boolean;
  isResubmitting: boolean;
  localFieldExplanations: Record<string, string>;
  setLocalFieldExplanations: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  localEvidenceExplanations: Record<string, string>;
  setLocalEvidenceExplanations: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  localFieldFiles: Record<string, File>;
  setLocalFieldFiles: React.Dispatch<React.SetStateAction<Record<string, File>>>;
  localEvidenceFiles: Record<string, File>;
  setLocalEvidenceFiles: React.Dispatch<React.SetStateAction<Record<string, File>>>;
  handleFinalSubmitExplanation: () => Promise<void>;
  onFileSelect: (type: 'field' | 'evidence', key: string, file: File) => void;
}

const ProcessingView: React.FC<ProcessingViewProps> = ({
  student, canEdit, isResubmitting,
  localFieldExplanations, setLocalFieldExplanations,
  localEvidenceExplanations, setLocalEvidenceExplanations,
  localFieldFiles, localEvidenceFiles,
  handleFinalSubmitExplanation, onFileSelect
}) => {
  // Lấy danh sách các mục bị Admin bắt lỗi
  const flaggedEvidences: { cat: CriterionType, ev: Evidence }[] = [];
  Object.entries(student.evidences).forEach(([cat, list]) => {
    (list as Evidence[]).forEach(ev => {
      if (ev.status === 'NeedsExplanation') flaggedEvidences.push({ cat: cat as CriterionType, ev });
    });
  });

  const flaggedFields: { key: keyof StudentProfile['verifications'], label: string, val: any }[] = [];
  if (student.verifications.trainingPoints?.status === 'NeedsExplanation') flaggedFields.push({ key: 'trainingPoints', label: 'Điểm rèn luyện', val: student.trainingPoints });
  if (student.verifications.gpa?.status === 'NeedsExplanation') flaggedFields.push({ key: 'gpa', label: 'GPA Học tập', val: student.gpa });
  if (student.verifications.peScore?.status === 'NeedsExplanation') flaggedFields.push({ key: 'peScore', label: 'Điểm Thể dục', val: student.peScore });
  if (student.verifications.english?.status === 'NeedsExplanation') flaggedFields.push({ key: 'english', label: 'Ngoại ngữ', val: `${student.englishLevel}` });
  if (student.verifications.partyMember?.status === 'NeedsExplanation') flaggedFields.push({ key: 'partyMember', label: 'Đảng viên', val: student.isPartyMember ? 'Có' : 'Không' });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in space-y-10 font-sans">
      <div className="bg-[#f26522] p-10 text-white rounded-sm relative overflow-hidden border border-orange-600">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
              <i className="fas fa-exclamation-triangle animate-bounce-slow"></i>
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tight">Chế độ Giải trình Hồ sơ</h2>
              <p className="text-orange-100 text-[10px] font-bold uppercase tracking-widest mt-1 opacity-80">Hội đồng đang chờ phản hồi từ bạn</p>
            </div>
          </div>
        </div>
        
        <div className="mt-10 p-8 bg-white/10 rounded-xl border border-white/20 backdrop-blur-sm">
          <h4 className="text-[10px] font-black uppercase tracking-widest mb-3 text-orange-100 italic">Ý kiến phản hồi từ Hội đồng:</h4>
          <p className="text-xl font-medium leading-relaxed font-formal italic">
            " {student.feedback || "Vui lòng phản hồi các nội dung sau để Hội đồng tiếp tục xét duyệt."} "
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <h3 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.4em] border-b-2 border-blue-900 pb-2 inline-block">Danh sách mục cần phản hồi</h3>

        {/* Loop qua các trường thông tin chung bị lỗi */}
        {flaggedFields.map(field => (
          <div key={field.key} className="bg-white border border-orange-200 p-8 rounded-sm space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <h4 className="text-base font-black text-blue-900 uppercase">{field.label}: <span className="text-orange-600 font-formal text-xl">{field.val}</span></h4>
              <span className="bg-orange-100 text-orange-700 text-[9px] font-black px-3 py-1 uppercase tracking-widest">Dữ liệu chung</span>
            </div>
            <div className="bg-orange-50/50 p-5 rounded border-l-4 border-orange-400">
              <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Lý do từ Admin:</p>
              <p className="text-xs text-gray-700 font-medium italic">"{student.verifications[field.key]?.feedback}"</p>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-blue-900 uppercase tracking-widest">Nội dung giải trình của bạn:</label>
              <textarea
                className="w-full p-4 border-2 border-gray-100 focus:border-orange-500 outline-none text-sm min-h-[120px] transition-all bg-gray-50/30"
                placeholder="Nhập giải trình tại đây..."
                value={localFieldExplanations[field.key] || ''}
                onChange={(e) => setLocalFieldExplanations(prev => ({ ...prev, [field.key]: e.target.value }))}
              />

              <div className="flex flex-col gap-2 pt-2">
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    id={`field-file-upload-${field.key}`}
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onFileSelect('field', field.key, file);
                    }}
                  />
                  <label htmlFor={`field-file-upload-${field.key}`} className={`px-4 py-2 border-2 border-dashed rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${localFieldFiles[field.key] ? 'border-green-500 text-green-600 bg-green-50' : 'border-gray-300 text-gray-500 hover:border-blue-500 hover:text-blue-600'}`}>
                    <i className={localFieldFiles[field.key] ? "fas fa-check-circle" : "fas fa-paperclip"}></i>
                    {localFieldFiles[field.key] ? `Đã chọn: ${localFieldFiles[field.key].name}` : "Tải lên file Hình ảnh/PDF mới"}
                  </label>
                  <span className="text-[10px] text-gray-400 italic">Chọn file minh chứng bổ sung cho {field.label.toLowerCase()}.</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Loop qua các minh chứng bị lỗi */}
        {flaggedEvidences.map(({ cat, ev }) => (
          <div key={ev.id} className="bg-white border border-orange-200 p-8 rounded-sm space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div>
                <span className="text-[9px] font-black text-orange-600 uppercase tracking-[0.2em] mb-1 block">{cat}</span>
                <h4 className="text-base font-black text-blue-900 uppercase">{ev.name}</h4>
              </div>
              <button 
                onClick={() => {
                   if (!ev.fileUrl) return;
                   window.open(formatUrl(ev.fileUrl), '_blank');
                }} 
                className="px-5 py-2.5 bg-blue-900 text-white text-[9px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all border border-blue-950"
              >
                 Mở Minh chứng
              </button>
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
                value={localEvidenceExplanations[ev.id] || ''}
                onChange={(e) => setLocalEvidenceExplanations(prev => ({ ...prev, [ev.id]: e.target.value }))}
              />
              
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    id={`file-upload-${ev.id}`}
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onFileSelect('evidence', ev.id, file);
                    }}
                  />
                  <label htmlFor={`file-upload-${ev.id}`} className={`px-4 py-2 border-2 border-dashed rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${localEvidenceFiles[ev.id] ? 'border-green-500 text-green-600 bg-green-50' : 'border-gray-300 text-gray-500 hover:border-blue-500 hover:text-blue-600'}`}>
                    <i className={localEvidenceFiles[ev.id] ? "fas fa-check-circle" : "fas fa-paperclip"}></i>
                    {localEvidenceFiles[ev.id] ? `Đã chọn: ${localEvidenceFiles[ev.id].name}` : "Tải lên file Hình ảnh/PDF mới"}
                  </label>
                  <span className="text-[10px] text-gray-400 italic">Chọn file để thay thế hoặc bổ sung minh chứng.</span>
                </div>
              </div>
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
          onClick={handleFinalSubmitExplanation}
          disabled={isResubmitting || !canEdit}
          className={`px-20 py-6 font-black text-xs uppercase tracking-[0.5em] transition-all border border-orange-500 active:scale-95 flex items-center gap-4 mx-auto
            ${(isResubmitting || !canEdit) ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-900 text-white hover:bg-[#f26522]'}`}
        >
          {isResubmitting && <i className="fas fa-spinner fa-spin"></i>}
          {canEdit ? 'GỬI PHẢN HỒI GIẢI TRÌNH' : 'HẾT HẠN GIẢI TRÌNH'}
        </button>
      </div>
    </div>
  );
};

export default ProcessingView;
