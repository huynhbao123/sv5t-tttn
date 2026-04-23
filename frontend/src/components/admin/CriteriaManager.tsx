import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

type CriterionItem = { id: string; description: string; isHard: boolean; points?: number; levelPoints: Record<string, number>; hasDecisionNumber: boolean; allowNoDecision: boolean; minQty?: number };

const LEVELS = ['Cấp Khoa/CLB', 'Cấp Trường/Phường/Xã', 'Cấp ĐHĐN', 'Cấp Tỉnh/Thành phố', 'Cấp Trung ương'];
const LEVEL_KEYS = ['khoa', 'truong', 'dhdn', 'tinh', 'tw'];

interface CriteriaManagerProps {
  criteriaGroups: any[];
  setCriteriaGroups: React.Dispatch<React.SetStateAction<any[]>>;
  managedCriteria: Record<string, CriterionItem[]>;
  setManagedCriteria: React.Dispatch<React.SetStateAction<Record<string, CriterionItem[]>>>;
  onShowConfirm: (config: { show: boolean; type: 'Approved' | 'Rejected' | 'NeedsExplanation'; title: string; message: string; requireFeedback: boolean; onSubmit: (feedback?: string) => void }) => void;
}

const CriteriaManager: React.FC<CriteriaManagerProps> = ({ criteriaGroups, setCriteriaGroups, managedCriteria, setManagedCriteria, onShowConfirm }) => {
  const [criteriaForm, setCriteriaForm] = useState<{
    mode: 'add' | 'edit';
    cat: string;
    id?: string;
    description: string;
    isHard: boolean;
    hasDecisionNumber: boolean;
    allowNoDecision: boolean;
    levelPoints: Record<string, number>;
  } | null>(null);

  const openAddCriterion = (cat: string) => {
    setCriteriaForm({ mode: 'add', cat, description: '', isHard: false, hasDecisionNumber: false, allowNoDecision: true, levelPoints: { khoa: 0, truong: 0, dhdn: 0, tinh: 0, tw: 0 } });
  };

  const openEditCriterion = (cat: string, id: string) => {
    const sub = managedCriteria[cat]?.find(s => s.id === id);
    if (sub) {
      setCriteriaForm({ mode: 'edit', cat, id, description: sub.description, isHard: sub.isHard, hasDecisionNumber: sub.hasDecisionNumber, allowNoDecision: sub.allowNoDecision, levelPoints: { ...sub.levelPoints } });
    }
  };

  const saveCriteriaForm = async () => {
    if (!criteriaForm) return;
    
    try {
      const group = criteriaGroups.find(g => g.TenNhom === criteriaForm.cat);
      if (!group) throw new Error("Category not found on backend");

      const payload = {
        NhomTieuChi: group.id,
        MoTa: criteriaForm.description.trim(),
        LoaiTieuChi: criteriaForm.isHard ? 'Cung' : 'Cong',
        Diem: 0,
        CoSoQuyetDinh: criteriaForm.hasDecisionNumber === true,
        KhongSoQuyetDinh: criteriaForm.allowNoDecision === true,
        SoLuongToiThieu: 1,
        ThuTu: 1
      };

      console.log('[saveCriteria] payload:', JSON.stringify(payload));

      if (criteriaForm.mode === 'add') {
        const newTc = await adminService.addTieuChi(payload);
        for (const [key, val] of Object.entries(criteriaForm.levelPoints)) {
          const capDo = key === 'khoa' ? 'Cấp Khoa/CLB' :
                        key === 'truong' ? 'Cấp Trường/Phường/Xã' :
                        key === 'dhdn' ? 'Cấp ĐHĐN' :
                        key === 'tinh' ? 'Cấp Tỉnh/Thành phố' : 'Cấp Trung ương';
          await adminService.updateTieuChiScore(newTc.id, { CapDo: capDo, Diem: val as number });
        }
      } else if (criteriaForm.id) {
        await adminService.updateTieuChi(Number(criteriaForm.id), payload);
        for (const [key, val] of Object.entries(criteriaForm.levelPoints)) {
          const capDo = key === 'khoa' ? 'Cấp Khoa/CLB' :
                        key === 'truong' ? 'Cấp Trường/Phường/Xã' :
                        key === 'dhdn' ? 'Cấp ĐHĐN' :
                        key === 'tinh' ? 'Cấp Tỉnh/Thành phố' : 'Cấp Trung ương';
          await adminService.updateTieuChiScore(Number(criteriaForm.id), { CapDo: capDo, Diem: val as number });
        }
      }

      const updatedGroups = await adminService.getCriteriaGroups();
      setCriteriaGroups(updatedGroups);
      setCriteriaForm(null);
      toast.success('Đã cập nhật tiêu chí thành công!');
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi cập nhật tiêu chí!');
    }
  };

  const handleDeleteCriterion = async (cat: string, id: string) => {
    onShowConfirm({
      show: true,
      type: 'Rejected',
      title: 'XÓA TIÊU CHÍ',
      message: 'Bạn có chắc chắn muốn xóa tiêu chí này?',
      requireFeedback: false,
      onSubmit: async () => {
        try {
          await adminService.deleteTieuChi(Number(id));
          const updatedGroups = await adminService.getCriteriaGroups();
          setCriteriaGroups(updatedGroups);
          toast.success('Đã xóa tiêu chí!');
          onShowConfirm({ show: false, type: 'Rejected', title: '', message: '', requireFeedback: false, onSubmit: () => {} });
        } catch (error) {
          toast.error('Lỗi khi xóa tiêu chí!');
        }
      }
    });
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
          {/* CÓ SQĐ / KHÔNG SQĐ: 2 checkbox ĐỘC LẬP - có thể chọn cả hai cùng lúc */}
          <div className="flex flex-col gap-1">
            <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Hình thức nộp minh chứng <span className="text-blue-500">(chọn một hoặc cả hai)</span>:</p>
            <div className="flex gap-2">
              <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase border-2 cursor-pointer transition-all select-none
                ${criteriaForm.allowNoDecision ? 'bg-gray-700 text-white border-gray-700' : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'}`}>
                <input
                  type="checkbox"
                  className="w-3 h-3 accent-white"
                  checked={criteriaForm.allowNoDecision}
                  onChange={e => setCriteriaForm(prev => prev ? { ...prev, allowNoDecision: e.target.checked } : prev)}
                />
                <i className="fas fa-ban text-[8px]"></i> Không SQĐ
              </label>
              <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase border-2 cursor-pointer transition-all select-none
                ${criteriaForm.hasDecisionNumber ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'}`}>
                <input
                  type="checkbox"
                  className="w-3 h-3 accent-white"
                  checked={criteriaForm.hasDecisionNumber}
                  onChange={e => setCriteriaForm(prev => prev ? { ...prev, hasDecisionNumber: e.target.checked } : prev)}
                />
                <i className="fas fa-file-alt text-[8px]"></i> Có SQĐ
              </label>
            </div>
            {criteriaForm.allowNoDecision && criteriaForm.hasDecisionNumber && (
              <p className="text-[7px] text-green-600 font-bold uppercase tracking-wide flex items-center gap-1">
                <i className="fas fa-check-circle"></i> Sinh viên có thể nộp với hoặc không có SQĐ
              </p>
            )}
            {!criteriaForm.allowNoDecision && !criteriaForm.hasDecisionNumber && (
              <p className="text-[7px] text-red-500 font-bold uppercase tracking-wide flex items-center gap-1">
                <i className="fas fa-exclamation-triangle"></i> Vui lòng chọn ít nhất một hình thức
              </p>
            )}
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
          <button
            onClick={saveCriteriaForm}
            disabled={!criteriaForm.description.trim() || (!criteriaForm.allowNoDecision && !criteriaForm.hasDecisionNumber)}
            className={`px-5 py-2 text-[9px] font-black uppercase rounded-lg transition-all ${criteriaForm.description.trim() && (criteriaForm.allowNoDecision || criteriaForm.hasDecisionNumber) ? 'bg-blue-900 text-white hover:bg-orange-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            {criteriaForm.mode === 'add' ? 'Thêm' : 'Lưu'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-black text-blue-900 uppercase">Danh sách tiêu chí</h2>
      </div>
      {(Object.entries(managedCriteria) as [string, CriterionItem[]][]).map(([cat, subs]) => (
        <div key={cat} className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-6">
          <div className="bg-[#fcfdfe] px-6 py-4 border-b border-gray-100 flex items-center justify-between">
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
          <div className="divide-y divide-gray-100">
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
                        <span className="text-xs font-semibold text-gray-700">{sub.description}</span>
                        <div className="flex gap-2.5 ml-2">
                          {sub.hasDecisionNumber && (
                            <span className="px-2 py-0.5 rounded bg-green-100 text-green-600 text-[8px] font-black uppercase flex items-center gap-1">
                              <i className="fas fa-file-contract"></i> Chấp nhận SQĐ
                            </span>
                          )}
                          {sub.allowNoDecision && (
                            <span className="px-2 py-0.5 rounded bg-slate-700 text-white text-[8px] font-black uppercase flex items-center gap-1">
                              <i className="fas fa-ban"></i> Chấp nhận KHÔNG SQĐ
                            </span>
                          )}
                        </div>
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
};

export default CriteriaManager;
