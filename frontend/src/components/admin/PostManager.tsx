import React, { useState } from 'react';
import { Post } from '../../types';
import toast from 'react-hot-toast';

interface PostManagerProps {
  posts: Post[];
  onAddPost: (post: { title: string, content: string, status: string, imageFile?: File }) => void;
  onUpdatePost: (id: string, post: { title?: string, content?: string, status?: string, imageFile?: File }) => void;
  onDeletePost: (id: string) => void;
  onShowConfirm: (config: { show: boolean; type: 'Approved' | 'Rejected' | 'NeedsExplanation'; title: string; message: string; requireFeedback: boolean; onSubmit: (feedback?: string) => void }) => void;
}

const PostManager: React.FC<PostManagerProps> = ({ posts, onAddPost, onUpdatePost, onDeletePost, onShowConfirm }) => {
  const [articleForm, setArticleForm] = useState<{ mode: 'add' | 'edit', id?: string, title: string, content: string, status: string, image: string, imageFile?: File } | null>(null);

  const handleAddPost = () => {
    setArticleForm({ mode: 'add', title: '', content: '', status: 'published', image: '' });
  };

  const handleEditPost = (post: any) => {
    setArticleForm({ mode: 'edit', id: post.id, title: post.title, content: post.content, status: post.status, image: post.image || '' });
  };

  const handleSaveArticle = async () => {
    if (!articleForm) return;
    try {
      if (articleForm.mode === 'add') {
        await onAddPost({ title: articleForm.title, content: articleForm.content, status: articleForm.status, imageFile: articleForm.imageFile });
      } else if (articleForm.id) {
        await onUpdatePost(articleForm.id, { title: articleForm.title, content: articleForm.content, status: articleForm.status, imageFile: articleForm.imageFile });
      }
      setArticleForm(null);
    } catch (e) {
      // Errors handled by hook toasts
    }
  };

  const handleTogglePostStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'draft' ? 'published' : 'draft';
      await onUpdatePost(id, { status: newStatus });
    } catch (e) {
      toast.error("Đổi trạng thái thất bại!");
    }
  };

  const handleDeletePost = async (id: string) => {
    onShowConfirm({
      show: true,
      type: 'Rejected',
      title: 'XÓA BÀI VIẾT',
      message: 'Bạn có chắc chắn muốn xóa bài viết này?',
      requireFeedback: false,
      onSubmit: async () => {
        try {
          await onDeletePost(id);
          onShowConfirm({ show: false, type: 'Rejected', title: '', message: '', requireFeedback: false, onSubmit: () => {} });
        } catch(e) {}
      }
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-black text-blue-900 uppercase">Quản lý bài viết</h2>
        <button onClick={handleAddPost} className="px-5 py-2.5 bg-blue-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-orange-600 transition-all border border-blue-950">
          <i className="fas fa-plus mr-1.5"></i>Thêm bài viết
        </button>
      </div>

      {articleForm && (
        <div className="bg-white border-2 border-blue-900/10 rounded-xl p-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center"><i className="fas fa-file-edit"></i></div>
            <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest">{articleForm.mode === 'add' ? 'Thêm bài viết mới' : 'Chỉnh sửa bài viết'}</h3>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tiêu đề bài viết</label>
              <input type="text" value={articleForm.title} onChange={e => setArticleForm({ ...articleForm, title: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-900 outline-none text-sm font-bold" placeholder="Nhập tiêu đề..." />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nội dung bài viết</label>
              <textarea value={articleForm.content} onChange={e => setArticleForm({ ...articleForm, content: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-900 outline-none text-sm font-medium h-48" placeholder="Nhập nội dung chi tiết..." />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hình ảnh bài viết</label>
              <div className="flex gap-4 items-center">
                <label className="flex-1 cursor-pointer">
                  <div className="px-4 py-3 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-900 hover:bg-white transition-all flex items-center justify-center gap-3">
                    <i className="fas fa-cloud-upload-alt text-gray-400"></i>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{articleForm.imageFile ? articleForm.imageFile.name : 'Chọn ảnh bài viết'}</span>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setArticleForm({ ...articleForm, image: reader.result as string, imageFile: file });
                      reader.readAsDataURL(file);
                    }
                  }} />
                </label>
                {(articleForm.image || articleForm.imageFile) && (
                  <div className="relative group w-20 h-20 bg-gray-100 rounded-xl border-2 border-blue-900/10 overflow-hidden">
                    <img src={articleForm.image} className="w-full h-full object-cover" alt="Preview" />
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng thái</label>
              <select value={articleForm.status} onChange={e => setArticleForm({ ...articleForm, status: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-900 outline-none text-sm font-bold">
                <option value="draft">Bản nháp</option>
                <option value="published">Đã đăng</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
            <button onClick={() => setArticleForm(null)} className="px-6 py-3 border text-gray-400 font-bold text-[9px] uppercase tracking-widest rounded-lg hover:bg-gray-50">Hủy bỏ</button>
            <button onClick={handleSaveArticle} disabled={!articleForm.title} className="px-8 py-3 bg-blue-900 text-white font-black text-[9px] uppercase tracking-widest rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-all border border-blue-950">Lưu bài viết</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {posts.map(p => (
          <div key={p.id} className="bg-white border border-gray-100 rounded-lg p-5 flex items-center justify-between transition-all">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-16 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border">
                {p.image ? (
                  <img src={p.image} className="w-full h-full object-cover" alt="" />
                ) : (
                  <i className="fas fa-file-alt text-blue-500"></i>
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800 line-clamp-1">{p.title}</h4>
                <p className="text-[9px] text-gray-400 font-bold mt-0.5"><i className="far fa-calendar mr-1"></i>{p.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => handleTogglePostStatus(p.id, p.status)} 
                className={`text-[8px] font-black uppercase px-3 py-1 rounded-full border cursor-pointer hover:opacity-80 transition-all ${p.status === 'published' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}
              >
                {p.status === 'published' ? 'Đã đăng' : 'Bản nháp'}
              </button>
              <button onClick={() => handleEditPost(p)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-all"><i className="fas fa-pen text-[10px]"></i></button>
              <button onClick={() => handleDeletePost(p.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-all"><i className="fas fa-trash text-[10px]"></i></button>
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <div className="py-12 text-center text-gray-400 text-xs font-bold uppercase tracking-widest border-2 border-dashed rounded-lg">Chưa có bài viết nào</div>
        )}
      </div>
    </div>
  );
};

export default PostManager;
