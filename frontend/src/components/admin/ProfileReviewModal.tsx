import React, { useState } from 'react';
import { CriterionType, Evidence, StudentProfile, FieldVerification, EvidenceType } from '../../types';
import { formatUrl } from '../../utils/mapper';

type CriterionItem = { id: string; description: string; isHard: boolean; points?: number; levelPoints: Record<string, number>; hasDecisionNumber: boolean; allowNoDecision: boolean; minQty?: number };

interface ProfileReviewModalProps {
  show: boolean;
  selectedStudent: StudentProfile;
  managedCriteria: Record<string, CriterionItem[]>;
  onClose: () => void;
  onAction: (status: StudentProfile['status']) => void;
  onEvidenceAction: (cat: CriterionType, id: string, action: 'Approved' | 'Rejected' | 'NeedsExplanation') => void;
  onManualDataVerify: (action: 'Approved' | 'Rejected' | 'NeedsExplanation', fieldKey: keyof StudentProfile['verifications'], context: string) => void;
  getExplanationCount: () => number;
  hasRejectedHardCriteria: () => boolean;
  hasPendingEvidences: () => boolean;
}

const ProfileReviewModal: React.FC<ProfileReviewModalProps> = ({
  show, selectedStudent, managedCriteria, onClose,
  onAction, onEvidenceAction, onManualDataVerify,
  getExplanationCount, hasRejectedHardCriteria, hasPendingEvidences
}) => {
  const [activeReviewTab, setActiveReviewTab] = useState<CriterionType>(CriterionType.ETHICS);

  if (!show || !selectedStudent) return null;

  return (
    <div className="fixed inset-0 z-[1100] bg-[#0a1628]/95 backdrop-blur-md animate-fade-in flex flex-col">
      {/* Header Area */}
      <div className="px-8 py-4 bg-[#0a1628] flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white text-lg font-black">{selectedStudent.fullName.charAt(0)}</div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-tight text-white">{selectedStudent.fullName}</h3>
            <p className="text-[9px] font-bold text-blue-300/40 uppercase mt-0.5 tracking-widest">{selectedStudent.studentId} • {selectedStudent.class}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 mr-6 bg-white/5 px-4 py-2 rounded-xl">
            <span className="text-[9px] font-bold text-blue-300/40 uppercase">Tổng điểm:</span>
            <span className="text-orange-400 font-black text-sm">{selectedStudent.totalScore}</span>
          </div>
          <button onClick={() => onAction('Rejected')} className="px-4 py-2 border border-red-400/20 text-red-400 font-black text-[9px] uppercase tracking-widest rounded-lg hover:bg-red-500/20 transition-all">Từ chối</button>
          {getExplanationCount() > 0 && <button onClick={() => onAction('Processing')} className="px-4 py-2 bg-orange-500/80 text-white font-black text-[9px] uppercase tracking-widest rounded-lg hover:bg-orange-500 transition-all">YC Giải trình ({getExplanationCount()})</button>}
           <button 
            onClick={() => onAction('Approved')} 
            disabled={hasRejectedHardCriteria() || hasPendingEvidences()}
            title={hasRejectedHardCriteria() ? "Không thể duyệt hồ sơ vì có tiêu chí cứng bị từ chối" : hasPendingEvidences() ? "Vui lòng thẩm định tất cả các minh chứng" : "Phê duyệt hồ sơ"}
            className={`px-5 py-2 font-black text-[9px] uppercase tracking-widest rounded-lg transition-all ${hasRejectedHardCriteria() || hasPendingEvidences() ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`}
          >
            Duyệt hồ sơ
          </button>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-red-500/30 text-white/40 hover:text-white flex items-center justify-center transition-all ml-2"><i className="fas fa-times text-sm"></i></button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Split Sidebar */}
        <div className="w-80 border-r border-white/5 p-6 space-y-2 overflow-y-auto">
          <div className="mb-6">
            <p className="text-[9px] font-black text-blue-300/30 uppercase tracking-[0.2em] mb-4">Danh mục tiêu chí</p>
            {Object.values(CriterionType).map((cat) => {
              const evs = selectedStudent.evidences[cat] || [];
              const pendingCount = evs.filter(e => e.status === 'Pending').length;
              const rejectCount = evs.filter(e => e.status === 'Rejected').length;
              const explainCount = evs.filter(e => e.status === 'NeedsExplanation').length;
              
              const icons: Record<string, string> = {
                [CriterionType.ETHICS]: 'fa-heart',
                [CriterionType.ACADEMIC]: 'fa-book-open',
                [CriterionType.PHYSICAL]: 'fa-running',
                [CriterionType.VOLUNTEER]: 'fa-hands-helping',
                [CriterionType.INTEGRATION]: 'fa-globe-asia',
              };

              return (
                <button
                  key={cat}
                  onClick={() => setActiveReviewTab(cat)}
                  className={`w-full group flex items-center justify-between p-4 rounded-xl transition-all mb-2
                    ${activeReviewTab === cat 
                      ? 'bg-blue-600/20 ring-1 ring-blue-500/20' 
                      : 'hover:bg-white/5'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-colors
                      ${activeReviewTab === cat ? 'bg-blue-500 text-white' : 'bg-white/5 text-blue-300/40 group-hover:text-blue-200'}`}>
                      <i className={`fas ${icons[cat]}`}></i>
                    </div>
                    <span className={`text-[11px] font-bold text-left transition-colors
                      ${activeReviewTab === cat ? 'text-white' : 'text-blue-300/40 group-hover:text-blue-200'}`}>
                      {cat}
                    </span>
                  </div>
                    <div className="flex gap-1 items-center">
                    {(() => {
                      const hasEvidenceExplanation = evs.some(e => e.studentExplanation);
                      let hasFieldExplanation = false;
                      if (cat === CriterionType.ETHICS) {
                        hasFieldExplanation = !!(selectedStudent.verifications.trainingPoints?.explanation || selectedStudent.verifications.partyMember?.explanation);
                      } else if (cat === CriterionType.ACADEMIC) {
                        hasFieldExplanation = !!selectedStudent.verifications.gpa?.explanation;
                      } else if (cat === CriterionType.PHYSICAL) {
                        hasFieldExplanation = !!selectedStudent.verifications.peScore?.explanation;
                      } else if (cat === CriterionType.INTEGRATION) {
                        hasFieldExplanation = !!selectedStudent.verifications.english?.explanation;
                      }
                      
                      if (hasEvidenceExplanation || hasFieldExplanation) {
                        return <i className="fas fa-comment-dots text-blue-500 text-[10px] animate-pulse mr-1"></i>;
                      }
                      return null;
                    })()}
                    {pendingCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 border border-blue-400/50"></span>}
                    {explainCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 border border-orange-400/50"></span>}
                    {rejectCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-red-500 border border-red-400/50"></span>}
                    {evs.length > 0 && pendingCount === 0 && explainCount === 0 && rejectCount === 0 && <i className="fas fa-check-circle text-green-500 text-[10px]"></i>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Split Content */}
        <div className="flex-1 bg-gray-50 overflow-y-auto p-12">
          <div className="max-w-4xl mx-auto space-y-12">
            {(() => {
              const cat = activeReviewTab;
              const list = selectedStudent.evidences[cat] || [];
              let dataValue = "", contextName = "", fieldKey: keyof StudentProfile['verifications'] | null = null;
              if (cat === CriterionType.ETHICS) { dataValue = `${selectedStudent.trainingPoints}`; contextName = "Điểm rèn luyện"; fieldKey = "trainingPoints"; }
              if (cat === CriterionType.ACADEMIC) { dataValue = `${selectedStudent.gpa}`; contextName = "GPA"; fieldKey = "gpa"; }
              if (cat === CriterionType.PHYSICAL) { dataValue = `${selectedStudent.peScore}`; contextName = "Điểm Thể dục"; fieldKey = "peScore"; }
              if (cat === CriterionType.INTEGRATION) { 
                dataValue = selectedStudent.englishLevel !== 'None' 
                  ? `${selectedStudent.englishLevel}${selectedStudent.englishGpa > 0 ? ` (GPA: ${selectedStudent.englishGpa})` : ''}`
                  : (selectedStudent.englishGpa > 0 ? `GPA: ${selectedStudent.englishGpa}` : 'None');
                contextName = "Ngoại ngữ"; 
                fieldKey = "english"; 
              }
              
              const verification = fieldKey ? selectedStudent.verifications[fieldKey] : { status: 'Pending' };

              return (
                <div className="animate-fade-up">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h4 className="text-2xl font-black text-blue-900 uppercase font-formal tracking-tight">{cat}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Xác thực thông tin và minh chứng bổ sung</p>
                        <div className="flex gap-3 bg-white/50 px-3 py-1 rounded-lg border border-gray-100 text-[7px] font-black uppercase tracking-tighter">
                           <div className="flex items-center gap-1.5 text-red-500"><i className="fas fa-exclamation-triangle"></i> Cứng: Phải đạt</div>
                           <div className="flex items-center gap-1.5 text-blue-500"><i className="fas fa-plus-circle"></i> Cộng: Thêm điểm</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 items-center">
                      {fieldKey && (
                        <div className={`px-4 py-2 rounded-xl flex items-center gap-3 border-2 transition-all ${verification?.status === 'Approved' ? 'bg-green-50 border-green-200' : verification?.status === 'NeedsExplanation' ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100'}`}>
                          <span className="text-[9px] font-black text-gray-400 uppercase">{contextName}: <span className="text-orange-600 text-sm ml-2">{dataValue}</span></span>
                        </div>
                      )}
                      {cat === CriterionType.ETHICS && selectedStudent.isPartyMember && (
                        <div className={`px-4 py-2 rounded-xl flex items-center gap-3 border-2 transition-all ${selectedStudent.verifications.partyMember?.status === 'Approved' ? 'bg-green-50 border-green-200' : selectedStudent.verifications.partyMember?.status === 'NeedsExplanation' ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100'}`}>
                          <span className="text-[9px] font-black text-gray-400 uppercase">Đối tượng: <span className="text-blue-600 text-[10px] ml-2 font-black">ĐẢNG VIÊN</span></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Display Explanations for General Fields */}
                  {(() => {
                    const renderFieldExplanation = (fKey: keyof StudentProfile['verifications'], cName: string, dVal: string, ver: any) => {
                      if (!ver?.explanation && !ver?.fileUrl) return null;
                      return (
                        <div className="mb-6 p-6 bg-blue-50 border-2 border-blue-200 rounded-2xl animate-fade-in relative overflow-hidden">
                          <div className="absolute top-0 right-0 px-3 py-1 bg-blue-600 text-white text-[7px] font-black uppercase rounded-bl-xl">Giải trình của SV</div>
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">{cName} ({dVal})</p>
                                <span className="px-1.5 py-0.5 bg-red-50 text-red-500 text-[6px] font-black uppercase rounded border border-red-100 shrink-0">Bắt buộc</span>
                              </div>
                              <p className="text-sm text-gray-700 font-bold leading-relaxed italic">"{ver.explanation || '(Không có nội dung văn bản)'}"</p>
                              {ver.explanationDate && (
                                <p className="text-[9px] font-black text-blue-300 uppercase mt-2">
                                  <i className="far fa-clock mr-1.5"></i>
                                  Giải trình lúc: {new Date(ver.explanationDate).toLocaleString('vi-VN')}
                                </p>
                              )}
                            </div>
                            {ver.fileUrl && (
                              <button 
                                onClick={() => window.open(formatUrl(ver.fileUrl), '_blank')}
                                className="px-4 py-2 bg-blue-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-orange-600 transition-all border border-blue-950 flex items-center gap-2"
                              >
                                <i className="fas fa-file-download"></i> Xem file
                              </button>
                            )}
                          </div>
                          {ver.evidenceDate && (
                            <div className="text-[10px] text-purple-600 font-bold bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100 mb-3 w-fit flex items-center gap-2">
                              <i className="far fa-calendar-alt"></i>
                              Ngảy cấp/thực hiện: {ver.evidenceDate}
                            </div>
                          )}
                          <div className="flex gap-2 justify-end border-t border-blue-100 pt-4">
                             <button onClick={() => onManualDataVerify('Approved', fKey, cName)} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${ver?.status === 'Approved' ? 'bg-green-600 text-white' : 'bg-white text-green-600 border border-green-200 hover:bg-green-50'}`}>Đạt</button>
                             <button onClick={() => onManualDataVerify('NeedsExplanation', fKey, cName)} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${ver?.status === 'NeedsExplanation' ? 'bg-orange-500 text-white' : 'bg-white text-orange-500 border border-orange-200 hover:bg-orange-50'}`}>Cần giải trình</button>
                             <button onClick={() => onManualDataVerify('Rejected', fKey, cName)} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${ver?.status === 'Rejected' ? 'bg-red-600 text-white' : 'bg-white text-red-600 border border-red-200 hover:bg-red-50'}`}>Không đạt</button>
                          </div>
                        </div>
                      );
                    };
                    return (
                      <>
                        {fieldKey && renderFieldExplanation(fieldKey, contextName, dataValue, verification)}
                        {cat === CriterionType.ETHICS && selectedStudent.isPartyMember && 
                          renderFieldExplanation('partyMember', 'Xác nhận Đảng viên', 'Hồ sơ Đảng', selectedStudent.verifications.partyMember)
                        }
                      </>
                    );
                  })()}

                  <div className="space-y-4">
                    {list.length > 0 ? (
                      list.map(ev => {
                      const criterion = managedCriteria[cat]?.find(c => c.id === ev.subCriterionId);
                      const isSimpleEvidence = ['eth_hard_1', 'aca_hard_1', 'int_hard_1', 'eth_point_1', 'phy_hard_1', 'aca_point_2', 'int_hard_2'].includes(ev.subCriterionId);
                      const hasLevelPoints = criterion && Object.keys(criterion.levelPoints).length > 0;
                      
                      const showLevel = !isSimpleEvidence && (hasLevelPoints || (ev.type && ev.type !== EvidenceType.NO_DECISION));
                      const showDecisionNumber = !!ev.decisionNumber;
                       const showQty = (ev.qty !== undefined && ev.qty > 1) || (criterion?.minQty !== undefined && criterion.minQty > 0) || ev.subCriterionId === 'vol_hard_2';

                      return (
                        <div key={ev.id} className={`group bg-white p-5 border rounded-2xl flex gap-6 items-center transition-all ${ev.status === 'Approved' ? 'border-green-500/30 bg-green-50/20' : ev.status === 'Rejected' ? 'border-red-500/30 bg-red-50/20' : ev.status === 'NeedsExplanation' ? 'border-orange-500/40 bg-orange-50/30' : 'border-gray-200'}`}>
                              {/* Image Preview */}
                              {ev.fileUrl && (ev.fileUrl.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) || ev.fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/)) ? (
                                <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden border cursor-pointer">
                                  <img src={ev.fileUrl} alt={ev.name} className="w-full h-full object-cover hover:scale-105 transition-transform" onClick={() => window.open(ev.fileUrl, '_blank')} />
                                </div>
                              ) : (
                                <div className="w-20 h-20 flex-shrink-0 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 text-blue-400">
                                  <i className="fas fa-file-pdf text-2xl"></i>
                                </div>
                              )}

                               <div className="flex-1 min-w-0">
                                 <div className="flex justify-between items-start mb-1">
                                   <div className="max-w-[70%]">
                                     <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                       <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest truncate">{ev.subCriterionName}</p>
                                       {ev.isHardCriterion ? (
                                         <span className="px-1 py-0.5 bg-red-100 text-red-600 text-[6px] font-black uppercase rounded border border-red-200 flex items-center gap-1 shrink-0" title="Bắt buộc đạt">
                                           <i className="fas fa-exclamation-triangle"></i> Cứng
                                         </span>
                                       ) : (
                                         <span className="px-1 py-0.5 bg-blue-100 text-blue-600 text-[6px] font-black uppercase rounded border border-blue-200 flex items-center gap-1 shrink-0" title="Cộng điểm">
                                           <i className="fas fa-plus-circle"></i> Cộng
                                         </span>
                                       )}
                                     </div>
                                     <h5 className="text-[13px] font-black text-gray-900 uppercase truncate" title={ev.name}>{ev.name}</h5>
                                   </div>
                                   <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest shrink-0 ${ev.status === 'Approved' ? 'bg-green-500 text-white' : ev.status === 'Rejected' ? 'bg-red-500 text-white' : ev.status === 'NeedsExplanation' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'}`}>{ev.status}</span>
                                 </div>
                                 <div className="flex items-center gap-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                   {showDecisionNumber && (
                                     <>
                                       <span title="Số quyết định" className="text-gray-500">
                                         <i className="fas fa-hashtag mr-1"></i>
                                         SQĐ: {ev.decisionNumber}
                                       </span>
                                       <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                     </>
                                   )}
                                   {showQty && (
                                     <>
                                       <span title="Số lượng / Ngày tình nguyện / Lần" className="text-green-600">
                                         <i className="fas fa-layer-group mr-1"></i>
                                         SL: {ev.qty}
                                       </span>
                                       <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                     </>
                                   )}
                                   {showLevel && (
                                     <>
                                       <span>{ev.level}</span>
                                       <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                     </>
                                   )}
                                    {ev.evidenceDate && (
                                      <>
                                        <span className="text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100 flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                                          <i className="far fa-calendar-alt"></i>
                                          {ev.evidenceDate}
                                        </span>
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                      </>
                                    )}
                                   <button onClick={() => window.open(ev.fileUrl, '_blank')} className="text-blue-500 hover:text-orange-500 transition-colors flex items-center gap-1"><i className="fas fa-eye"></i> Xem file</button>
                                 </div>
                               {ev.studentExplanation && (
                                 <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl relative overflow-hidden animate-fade-in ">
                                   <div className="absolute top-0 right-0 px-2 py-0.5 bg-blue-600 text-white text-[6px] font-black uppercase rounded-bl-lg">Giải trình SV</div>
                                   <p className="text-[11px] font-bold text-gray-800 leading-relaxed italic"><i className="fas fa-comment-dots mr-2 text-blue-500"></i>"{ev.studentExplanation}"</p>
                                   {ev.explanationDate && (
                                     <p className="text-[9px] font-black text-blue-400 uppercase mt-2">
                                       <i className="far fa-clock mr-1.5"></i>
                                       Nộp giải trình lúc: {new Date(ev.explanationDate).toLocaleString('vi-VN')}
                                     </p>
                                   )}
                                 </div>
                               )}
                               {ev.adminFeedback && <p className="text-[10px] italic text-orange-700 mt-2 font-medium">Lưu ý: {ev.adminFeedback}</p>}
                            </div>

                            <div className="flex flex-col gap-1">
                              <button onClick={() => onEvidenceAction(cat, ev.id, 'Approved')} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${ev.status === 'Approved' ? 'bg-green-600 text-white border border-green-500' : 'bg-gray-50 text-green-600 hover:bg-green-100'}`} title="Đạt"><i className="fas fa-check text-[10px]"></i></button>
                              <button onClick={() => onEvidenceAction(cat, ev.id, 'NeedsExplanation')} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${ev.status === 'NeedsExplanation' ? 'bg-orange-500 text-white border border-orange-400' : 'bg-gray-50 text-orange-500 hover:bg-orange-100'}`} title="Yêu cầu giải trình"><i className="fas fa-comment-dots text-[10px]"></i></button>
                              <button onClick={() => onEvidenceAction(cat, ev.id, 'Rejected')} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${ev.status === 'Rejected' ? 'bg-red-600 text-white border border-red-500' : 'bg-gray-50 text-red-600 hover:bg-red-100'}`} title="Không đạt"><i className="fas fa-times text-[10px]"></i></button>
                            </div>
                          </div>
                        );
                      })) : (
                          <div className="py-20 text-center space-y-4 bg-white rounded-3xl border border-dashed border-gray-200">
                             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200 text-2xl"><i className="fas fa-folder-open"></i></div>
                             <p className="text-[11px] font-black text-gray-300 uppercase tracking-widest">Không có minh chứng bổ sung</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
  );
};

export default ProfileReviewModal;
