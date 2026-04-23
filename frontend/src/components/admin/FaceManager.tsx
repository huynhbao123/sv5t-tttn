import React, { useState } from 'react';
import { FeaturedFace } from '../../types';

interface FaceManagerProps {
  faces: FeaturedFace[];
  onAddFace: (face: Omit<FeaturedFace, 'id'>) => void;
  onUpdateFace: (id: string, face: Partial<FeaturedFace>) => void;
  onDeleteFace: (id: string) => void;
  onShowConfirm: (config: { show: boolean; type: 'Approved' | 'Rejected' | 'NeedsExplanation'; title: string; message: string; requireFeedback: boolean; onSubmit: (feedback?: string) => void }) => void;
}

const FaceManager: React.FC<FaceManagerProps> = ({ faces, onAddFace, onUpdateFace, onDeleteFace, onShowConfirm }) => {
  const [faceForm, setFaceForm] = useState<{ mode: 'add' | 'edit', id?: string, name: string, achievement: string, content: string, image: string, imageFile?: File } | null>(null);

  const openAddFace = () => setFaceForm({ mode: 'add', name: '', achievement: '', content: '', image: '' });
  const openEditFace = (face: FeaturedFace) => setFaceForm({ mode: 'edit', id: face.id, name: face.name, achievement: face.achievement, content: face.content, image: face.image });

  const handleSaveFace = () => {
    if (!faceForm) return;
    const faceData = {
      name: faceForm.name,
      achievement: faceForm.achievement,
      content: faceForm.content,
      image: faceForm.image,
      imageFile: faceForm.imageFile
    };

    if (faceForm.mode === 'add') {
      onAddFace(faceData);
    } else if (faceForm.id) {
      onUpdateFace(faceForm.id, faceData);
    }
    setFaceForm(null);
  };

  const handleDeleteFace = (id: string) => {
    onShowConfirm({
      show: true,
      type: 'Rejected',
      title: 'XÓA GƯƠNG MẶT',
      message: 'Bạn có chắc chắn muốn xóa gương mặt này? Hành động này không thể hoàn tác.',
      requireFeedback: false,
      onSubmit: () => {
        onDeleteFace(id);
        onShowConfirm({ show: false, type: 'Rejected', title: '', message: '', requireFeedback: false, onSubmit: () => {} });
      }
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-black text-blue-900 uppercase">Quản lý Gương mặt tiêu biểu</h2>
        <button onClick={openAddFace} className="px-5 py-2.5 bg-blue-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-orange-600 transition-all border border-blue-950">
          <i className="fas fa-plus mr-2"></i>Thêm gương mặt
        </button>
      </div>

      {faceForm && (
        <div className="bg-white border-2 border-blue-900/10 rounded-xl p-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center"><i className="fas fa-user-edit"></i></div>
            <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest">{faceForm.mode === 'add' ? 'Thêm gương mặt mới' : 'Chỉnh sửa thông tin'}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên sinh viên</label>
              <input type="text" value={faceForm.name} onChange={e => setFaceForm({ ...faceForm, name: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-900 outline-none text-sm font-bold" placeholder="VD: Nguyễn Văn A" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Thành tích nổi bật</label>
              <input type="text" value={faceForm.achievement} onChange={e => setFaceForm({ ...faceForm, achievement: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-900 outline-none text-sm font-bold" placeholder="VD: Giải Nhất NCKH Cấp Quốc gia" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tiêu đề / Trích dẫn</label>
              <textarea value={faceForm.content} onChange={e => setFaceForm({ ...faceForm, content: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-900 outline-none text-sm font-medium h-24" placeholder="VD: Gương mặt sinh viên xuất sắc tiêu biểu của nhà trường." />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hình ảnh vinh danh</label>
              <div className="flex gap-4 items-center">
                <label className="flex-1 cursor-pointer">
                  <div className="px-4 py-3 bg-gray-50 border border-dashed border-gray-200 rounded-xl hover:border-blue-900 hover:bg-white transition-all flex items-center justify-center gap-3">
                    <i className="fas fa-cloud-upload-alt text-gray-400"></i>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{faceForm.imageFile ? faceForm.imageFile.name : 'Chọn ảnh từ máy tính'}</span>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFaceForm({ ...faceForm, image: reader.result as string, imageFile: file });
                        };
                        reader.readAsDataURL(file);
                      }
                    }} 
                  />
                </label>
                {(faceForm.image || faceForm.imageFile) && (
                  <div className="relative group w-14 h-14 bg-gray-100 rounded-xl border-2 border-blue-900/10 overflow-hidden">
                    <img src={faceForm.image} className="w-full h-full object-cover" alt="Preview" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
            <button onClick={() => setFaceForm(null)} className="px-6 py-3 border text-gray-400 font-bold text-[9px] uppercase tracking-widest rounded-lg hover:bg-gray-50">Hủy bỏ</button>
            <button onClick={handleSaveFace} disabled={!faceForm.name || !faceForm.achievement} className="px-8 py-3 bg-blue-900 text-white font-black text-[9px] uppercase tracking-widest rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-all border border-blue-950">Lưu thông tin</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {faces.map(face => (
          <div key={face.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden group transition-all relative">
            <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
              <img src={face.image} className="w-full h-full object-cover" alt={face.name} />
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                <button onClick={() => openEditFace(face)} className="w-8 h-8 bg-white/90 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all border border-gray-100"><i className="fas fa-pen text-[10px]"></i></button>
                <button onClick={() => handleDeleteFace(face.id)} className="w-8 h-8 bg-white/90 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-600 hover:text-white transition-all border border-gray-100"><i className="fas fa-trash text-[10px]"></i></button>
              </div>
            </div>
            <div className="p-6">
              <h4 className="text-sm font-black text-blue-900 uppercase mb-1 font-formal">{face.name}</h4>
              <p className="text-orange-600 font-black text-[9px] uppercase tracking-widest mb-3">{face.achievement}</p>
              <p className="text-xs text-gray-400 italic line-clamp-2">"{face.content}"</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FaceManager;
