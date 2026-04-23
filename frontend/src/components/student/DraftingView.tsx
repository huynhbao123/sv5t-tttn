import React from 'react';
import { CriterionType, StudentProfile, EvidenceType, EvidenceLevel, Evidence } from '../../types';
import EvidenceItem from './EvidenceItem';

interface DraftingViewProps {
  cat: CriterionType;
  student: StudentProfile;
  currentStepIdx: number;
  totalSteps: number;
  isHardMet: boolean;
  isLocked: boolean;
  canEdit: boolean;
  isProcessing: boolean;
  criteriaGroups: any[];
  localData: any;
  handleLocalChange: (field: string, value: any) => void;
  handleBlur: (field: string, isFloat?: boolean, maxVal?: number) => void;
  removeEvidence: (cat: CriterionType, id: string) => void;
  setAddingTo: (config: any) => void;
}

const DraftingView: React.FC<DraftingViewProps> = ({
  cat, student, currentStepIdx, totalSteps, isHardMet, isLocked, canEdit, isProcessing, criteriaGroups,
  localData, handleLocalChange, handleBlur, removeEvidence, setAddingTo
}) => {
  const catIcons: Record<string, string> = {
    [CriterionType.ETHICS]: 'fa-heart',
    [CriterionType.ACADEMIC]: 'fa-book-open',
    [CriterionType.PHYSICAL]: 'fa-running',
    [CriterionType.VOLUNTEER]: 'fa-hands-helping',
    [CriterionType.INTEGRATION]: 'fa-globe-asia',
  };

  const groups: Record<string, any> = {};
  criteriaGroups.forEach(g => {
    const catMap: Record<string, CriterionType> = {
      'Đạo đức tốt': CriterionType.ETHICS,
      'Học tập tốt': CriterionType.ACADEMIC,
      'Thể lực tốt': CriterionType.PHYSICAL,
      'Tình nguyện tốt': CriterionType.VOLUNTEER,
      'Hội nhập tốt': CriterionType.INTEGRATION
    };
    groups[catMap[g.TenNhom]] = g;
  });

  const currentGroup = groups[cat];
  const hardSubsRaw = currentGroup?.tieu_chi?.filter((tc: any) => tc.LoaiTieuChi === 'Cung') || [];
  const softSubsRaw = currentGroup?.tieu_chi?.filter((tc: any) => tc.LoaiTieuChi === 'Cong') || [];

  const profileInputSlugs = ['eth_hard_1', 'eth_hard_2', 'aca_hard_1', 'phy_hard_1', 'int_hard_1', 'int_hard_2'];
  const noEvidenceSlugs = ['eth_hard_2', 'eth_point_5', 'aca_point_7'];
  
  const hardProfileSlugs = hardSubsRaw.filter((tc: any) => profileInputSlugs.includes(tc.MaTieuChi));
  const hardUploads = hardSubsRaw.filter((tc: any) => !noEvidenceSlugs.includes(tc.MaTieuChi));

  return (
    <div className="animate-fade-in space-y-8">
      {/* Category Header */}
      <div className="bg-white border-2 border-gray-100 rounded-lg p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <i className={`fas ${catIcons[cat]} text-blue-600 text-lg`}></i>
          </div>
          <div>
            <h2 className="text-lg font-black text-blue-900 uppercase tracking-tight">{cat}</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Tiêu chí {currentStepIdx + 1}/{totalSteps - 1}</p>
          </div>
        </div>
        <span className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-full cursor-help ${isHardMet ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
          {isHardMet ? '✓ Đạt tiêu chí cứng' : '✗ Chưa đạt tiêu chí cứng'}
        </span>
      </div>

      {/* Section 1: MANDATORY CRITERIA (Hard) */}
      <div className="space-y-6">
        <h3 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.2em] border-b-2 border-blue-900 pb-2 inline-block">
          <i className="fas fa-exclamation-circle mr-2"></i>Tiêu chí bắt buộc (Phải đạt)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hard Profile Fields */}
          {hardProfileSlugs.length > 0 && (
            <div className="bg-gray-50/50 p-6 rounded-lg border border-gray-100 space-y-4">
              {cat === CriterionType.ETHICS && (
                <>
                  {hardProfileSlugs.some((tc: any) => tc.MaTieuChi === 'eth_hard_1') && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Điểm rèn luyện <span className="text-red-400">*</span></label>
                      <input 
                         disabled={isLocked && (!isProcessing || student.verifications.trainingPoints?.status !== 'NeedsExplanation')} 
                         type="number" max="100" value={localData.trainingPoints === 0 ? '' : localData.trainingPoints} onChange={(e) => handleLocalChange('trainingPoints', e.target.value)} onBlur={() => handleBlur('trainingPoints', false, 100)} className="w-full px-4 py-3 border-2 border-gray-100 rounded-lg focus:border-blue-600 outline-none font-bold text-sm transition-all" />
                    </div>
                  )}
                  {hardProfileSlugs.some((tc: any) => tc.MaTieuChi === 'eth_hard_2') && (
                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-100 bg-white hover:bg-gray-50 transition-all">
                      <input 
                        disabled={isLocked && (!isProcessing || student.verifications.noViolation?.status !== 'NeedsExplanation')} 
                        type="checkbox" checked={!!localData.noViolation} onChange={(e) => handleLocalChange('noViolation', e.target.checked)} className="w-4 h-4 accent-blue-600 rounded" />
                      <span className="text-[11px] font-bold text-gray-700">Cam kết không vi phạm nội quy</span>
                    </label>
                  )}
                </>
              )}
              {cat === CriterionType.ACADEMIC && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">GPA Hệ 4.0 <span className="text-red-400">*</span></label>
                  <input 
                    disabled={isLocked && (!isProcessing || student.verifications.gpa?.status !== 'NeedsExplanation')} 
                    type="number" step="0.01" max="4.0" value={localData.gpa === 0 ? '' : localData.gpa} onChange={(e) => handleLocalChange('gpa', e.target.value)} onBlur={() => handleBlur('gpa', true, 4.0)} className="w-full px-4 py-3 border-2 border-gray-100 rounded-lg focus:border-blue-600 outline-none font-bold text-sm transition-all" />
                </div>
              )}
              {cat === CriterionType.PHYSICAL && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Điểm Thể dục <span className="text-red-400">*</span></label>
                  <input 
                    disabled={isLocked && (!isProcessing || student.verifications.peScore?.status !== 'NeedsExplanation')} 
                    type="number" step="0.1" max="10" value={localData.peScore === 0 ? '' : localData.peScore} onChange={(e) => handleLocalChange('peScore', e.target.value)} onBlur={() => handleBlur('peScore', true, 10.0)} className="w-full px-4 py-3 border-2 border-gray-100 rounded-lg focus:border-blue-600 outline-none font-bold text-sm transition-all" />
                </div>
              )}
              {cat === CriterionType.INTEGRATION && (
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Ngoại ngữ <span className="text-red-400">*</span></label>
                     <select 
                      disabled={isLocked && (!isProcessing || student.verifications.english?.status !== 'NeedsExplanation')} 
                      value={localData.englishLevel} onChange={(e) => handleLocalChange('englishLevel', e.target.value)} className="w-full px-3 py-3 border-2 border-gray-100 rounded-lg font-bold text-[11px] transition-all focus:border-blue-600 outline-none">
                       <option value="None">Chưa có</option>
                       <option value="B1">B1</option>
                       <option value="B2">B2+</option>
                     </select>
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">GPA NN <span className="text-red-400">*</span></label>
                     <input 
                       disabled={isLocked && (!isProcessing || student.verifications.englishGpa?.status !== 'NeedsExplanation')} 
                       type="number" step="0.01" max="4" value={localData.englishGpa === 0 ? '' : localData.englishGpa} onChange={(e) => handleLocalChange('englishGpa', e.target.value)} onBlur={() => handleBlur('englishGpa', true, 4.0)} className="w-full px-3 py-3 border-2 border-gray-100 rounded-lg font-bold text-sm transition-all focus:border-blue-600 outline-none" />
                   </div>
                 </div>
              )}
            </div>
          )}

          {/* Hard Evidence (Uploads) */}
          <div className={`space-y-4 ${hardProfileSlugs.length === 0 ? 'md:col-span-2' : ''}`}>
             {hardUploads.length === 0 && hardProfileSlugs.length === 0 && (
               <div className="p-4 bg-gray-50 border border-dashed text-center rounded-lg">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Không có tiêu chí cứng bổ sung</p>
               </div>
             )}
             {hardUploads.map((sub: any) => {
                const subEvs = student.evidences[cat].filter(e => e.subCriterionId === sub.MaTieuChi);
                return (
                  <div key={sub.MaTieuChi} className={`p-4 bg-white border rounded-lg transition-all ${subEvs.length > 0 ? 'border-blue-200 bg-blue-50/10' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <span className="text-[8px] font-black uppercase px-2 py-0.5 text-white bg-blue-600 rounded inline-block mb-1">Bắt buộc</span>
                        <p className="text-xs font-bold text-gray-800 leading-tight">{sub.MoTa}</p>
                      </div>
                      {!isLocked && canEdit && (
                        <button 
                          onClick={() => setAddingTo({ type: cat, isHard: true, subName: sub.MoTa, subId: sub.MaTieuChi })} 
                          disabled={isProcessing && !subEvs.some(e => e.status === 'NeedsExplanation')}
                          className={`px-4 py-2 font-black text-[9px] uppercase tracking-widest rounded-lg transition-all whitespace-nowrap 
                            ${isProcessing && !subEvs.some(e => e.status === 'NeedsExplanation') 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
                              : (subEvs.length > 0 ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-blue-50 text-blue-700 hover:bg-blue-100')}`}
                        >
                          {subEvs.length > 0 ? <><i className="fas fa-check-circle mr-1"></i>Đã nộp</> : <><i className="fas fa-upload mr-1"></i>Tải lên</>}
                        </button>
                      )}
                      {!isLocked && !canEdit && (
                         <button disabled className="px-4 py-2 bg-gray-200 text-gray-400 text-[9px] font-black uppercase tracking-widest rounded-lg cursor-not-allowed flex items-center gap-1.5">
                            <i className="fas fa-lock text-[8px]"></i> Khóa
                         </button>
                      )}
                    </div>
                    {subEvs.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {subEvs.map(ev => (
                          <EvidenceItem 
                            key={ev.id} evidence={ev} isLocked={isLocked} canEdit={canEdit} 
                            onEdit={() => setAddingTo({ type: cat, isHard: true, subName: sub.MoTa, subId: sub.MaTieuChi, editingEvidence: ev })} 
                            onRemove={() => removeEvidence(cat, ev.id)} 
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
             })}
          </div>
        </div>
      </div>

      {/* Section 2: OPTIONAL CRITERIA (Soft/Points) */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] border-b-2 border-orange-400 pb-2 inline-block">
          <i className="fas fa-plus-circle mr-2"></i>Tiêu chí cộng điểm (Tùy chọn)
        </h3>
        
        {!isHardMet && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <i className="fas fa-exclamation-triangle text-amber-500 mt-0.5"></i>
            <p className="text-xs text-amber-700 font-medium italic">Bạn cần đạt các <span className="text-blue-600 font-black uppercase">Tiêu chí cứng</span> bên trên trước khi có thể nộp minh chứng cộng điểm cho mục này.</p>
          </div>
        )}

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${!isHardMet ? 'opacity-40 pointer-events-none' : ''}`}>
          {softSubsRaw.length === 0 ? (
             <div className="md:col-span-2 text-center py-6 bg-gray-50 border-2 border-dashed border-gray-100 rounded-lg">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Không có tiêu chí cộng điểm nào</p>
             </div>
          ) : (
            softSubsRaw.filter((sub: any) => !['eth_point_5', 'aca_point_7'].includes(sub.MaTieuChi)).map((sub: any) => {
            const subEvs = (student.evidences[cat] || []).filter(e => e.subCriterionId === sub.MaTieuChi);
              return (
                <div key={sub.MaTieuChi} className={`p-4 border transition-all bg-white rounded-lg ${subEvs.length > 0 ? 'border-orange-200 bg-orange-50/10' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <span className="text-[8px] font-black uppercase px-2 py-0.5 text-white bg-orange-500 rounded inline-block mb-1">Cộng</span>
                      <p className="text-[11px] font-bold text-gray-800 leading-snug">{sub.MoTa}</p>
                    </div>
                    {!isLocked && canEdit && (
                      <button 
                        onClick={() => setAddingTo({ type: cat, isHard: false, subName: sub.MoTa, subId: sub.MaTieuChi })} 
                        className={`px-3 py-1.5 font-black text-[9px] uppercase tracking-widest rounded-lg transition-all whitespace-nowrap ${subEvs.length > 0 ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-orange-50 text-orange-700 hover:bg-orange-100'}`}
                      >
                        {subEvs.length > 0 ? <><i className="fas fa-check-circle mr-1"></i>Đã nộp</> : <><i className="fas fa-upload mr-1"></i>Tải lên</>}
                      </button>
                    )}
                    {!isLocked && !canEdit && (
                       <div className="px-3 py-1.5 bg-gray-100 text-gray-400 text-[8px] font-black uppercase rounded text-center">
                          <i className="fas fa-lock"></i>
                       </div>
                    )}
                  </div>
                  {subEvs.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {subEvs.map(ev => (
                        <EvidenceItem 
                          key={ev.id} evidence={ev} isLocked={isLocked} canEdit={canEdit} 
                          onEdit={() => setAddingTo({ type: cat, isHard: false, subName: sub.MoTa, subId: sub.MaTieuChi, editingEvidence: ev })} 
                          onRemove={() => removeEvidence(cat, ev.id)} 
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default DraftingView;
