import React from 'react';

interface UnsubmitModalProps {
  show: boolean;
  isUnsubmittingAction: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const UnsubmitModal: React.FC<UnsubmitModalProps> = ({ show, isUnsubmittingAction, onClose, onConfirm }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[2000] bg-blue-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden animate-fade-up border border-gray-100">
        <div className="px-8 py-6 bg-orange-500 text-white flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight">Xác nhận hủy nộp</h3>
            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mt-1">Thay đổi trạng thái hồ sơ</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"><i className="fas fa-times"></i></button>
        </div>

        <div className="p-8 space-y-6">
          <p className="text-sm font-medium text-gray-600 leading-relaxed">
            Bạn có chắc chắn muốn hủy nộp hồ sơ để chỉnh sửa lại không? Sau khi xác nhận, hồ sơ sẽ quay về trạng thái nháp và bạn có thể thay đổi các minh chứng.
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button 
              onClick={onClose}
              className="px-6 py-3 text-gray-400 font-black text-[9px] uppercase tracking-widest hover:text-gray-600 transition-all"
            >
              Quay lại
            </button>
            <button 
              disabled={isUnsubmittingAction}
              onClick={onConfirm}
              className={`px-10 py-3 bg-orange-500 text-white font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-orange-600 transition-all ${isUnsubmittingAction ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isUnsubmittingAction ? <i className="fas fa-spinner fa-spin mr-2"></i> : null}
              Xác nhận hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnsubmitModal;
