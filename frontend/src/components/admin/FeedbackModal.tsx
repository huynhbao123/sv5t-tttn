import React, { useState } from 'react';

interface FeedbackModalProps {
  show: boolean;
  type: 'Approved' | 'Rejected' | 'NeedsExplanation';
  title: string;
  message: string;
  requireFeedback: boolean;
  onSubmit: (feedback?: string) => void;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ show, type, title, message, requireFeedback, onSubmit, onClose }) => {
  const [modalFeedback, setModalFeedback] = useState('');

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[2000] bg-blue-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md border border-gray-100 overflow-hidden animate-fade-up">
        <div className={`px-8 py-6 text-white flex justify-between items-center ${type === 'Approved' ? 'bg-green-600' : type === 'Rejected' ? 'bg-red-600' : 'bg-orange-500'}`}>
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight">{title}</h3>
            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mt-1">Xác nhận hành động quản trị</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"><i className="fas fa-times"></i></button>
        </div>

        <div className="p-8 space-y-6">
          <p className="text-sm font-medium text-gray-600 leading-relaxed">{message}</p>
          
          {requireFeedback && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Lý do / Nội dung phản hồi</label>
              <textarea 
                autoFocus
                value={modalFeedback}
                onChange={e => setModalFeedback(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm font-medium focus:border-blue-900 outline-none transition-all h-32"
                placeholder="Nhập nội dung tại đây..."
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button 
              onClick={onClose}
              className="px-6 py-3 text-gray-400 font-black text-[9px] uppercase tracking-widest hover:text-gray-600 transition-all"
            >
              Hủy bỏ
            </button>
            <button 
              onClick={() => onSubmit(modalFeedback)}
              className={`px-10 py-3 text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-all ${type === 'Approved' ? 'bg-green-600 hover:bg-green-700' : type === 'Rejected' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-500 hover:bg-orange-600'}`}
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
