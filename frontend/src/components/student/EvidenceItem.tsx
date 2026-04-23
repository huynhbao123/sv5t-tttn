import React from 'react';
import { Evidence } from '../../types';

interface EvidenceItemProps {
  evidence: Evidence;
  isLocked: boolean;
  canEdit: boolean;
  onEdit: () => void;
  onRemove: () => void;
}

const EvidenceItem: React.FC<EvidenceItemProps> = ({ evidence, isLocked, canEdit, onEdit, onRemove }) => {
  return (
    <div className="p-3 bg-gray-50 border rounded-lg space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-gray-900 truncate max-w-[200px]">{evidence.name}</span>
        <div className="flex items-center gap-2">
          {!isLocked && canEdit && evidence.status !== 'Approved' && (
            <>
              <button onClick={onEdit} className="text-gray-400 hover:text-blue-500 transition-colors">
                <i className="fas fa-edit text-[9px]"></i>
              </button>
              <button onClick={onRemove} className="text-gray-400 hover:text-red-500 transition-colors">
                <i className="fas fa-trash-alt text-[9px]"></i>
              </button>
            </>
          )}
          
          {evidence.status === 'Approved' && (
            <span className="flex items-center gap-1 text-[9px] font-black uppercase text-green-700 bg-green-100 px-2 py-1 rounded-md border border-green-200 shadow-sm" title="Hồ sơ đã được thẩm định, không thể thay đổi">
              <i className="fas fa-lock"></i> Đã duyệt
            </span>
          )}
          {evidence.status === 'NeedsExplanation' && (
            <span className="flex items-center gap-1 text-[9px] font-black uppercase text-orange-700 bg-orange-50 px-2 py-1 rounded-md border border-orange-200 shadow-sm">
              <i className="fas fa-exclamation-triangle"></i> Cần giải trình
            </span>
          )}
          {evidence.status === 'Rejected' && (
            <span className="flex items-center gap-1 text-[9px] font-black uppercase text-red-700 bg-red-50 px-2 py-1 rounded-md border border-red-200 shadow-sm">
              <i className="fas fa-times-circle"></i> Từ chối
            </span>
          )}
          
          {!isLocked && !canEdit && (
             <i className="fas fa-lock text-[10px] text-gray-300" title="Hết hạn chỉnh sửa"></i>
          )}
        </div>
      </div>
      {evidence.evidenceDate && (
        <div className="flex items-center gap-1.5 text-[10px] text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100 mb-2 w-fit">
          <i className="far fa-calendar-alt"></i>
          Ngay cấp/thực hiện: {evidence.evidenceDate}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {evidence.danh_sach_file && evidence.danh_sach_file.length > 0 ? (
          evidence.danh_sach_file.map((f, fIdx) => (
            <a key={fIdx} href={f.FileUrl} target="_blank" rel="noreferrer" className="text-[9px] text-blue-600 hover:underline flex items-center gap-1 bg-white px-2 py-1 border rounded">
              <i className="fas fa-file-image"></i> {f.TenFile.length > 15 ? f.TenFile.substring(0, 12) + '...' : f.TenFile}
            </a>
          ))
        ) : (
          <a href={evidence.fileUrl} target="_blank" rel="noreferrer" className="text-[9px] text-blue-600 hover:underline flex items-center gap-1">
            <i className="fas fa-file-image"></i> {evidence.fileName || 'Xem file'}
          </a>
        )}
      </div>
    </div>
  );
};

export default EvidenceItem;
