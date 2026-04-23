import React, { useState } from 'react';
import { StudentProfile } from '../../types';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

interface ProfileListProps {
  students: StudentProfile[];
  onSelectStudent: (id: string) => void;
  onStartReview: () => void;
  onShowConfirm: (config: { show: boolean; type: 'Approved' | 'Rejected' | 'NeedsExplanation'; title: string; message: string; requireFeedback: boolean; onSubmit: (feedback?: string) => void }) => void;
}

const ProfileList: React.FC<ProfileListProps> = ({ students, onSelectStudent, onStartReview, onShowConfirm }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = students.filter(s => {
    const matchesSearch = s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || s.studentId.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
          <input type="text" placeholder="Tìm kiếm theo tên hoặc mã SV..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-3 border border-gray-100 rounded-xl text-sm font-medium focus:border-blue-500 outline-none transition-all" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-3 border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest focus:border-blue-500 outline-none bg-white">
          <option value="all">Tất cả trạng thái</option>
          <option value="Submitted">Chờ thẩm định</option>
          <option value="Processing">Đang giải trình</option>
          <option value="Approved">Đã duyệt</option>
          <option value="Rejected">Từ chối</option>
        </select>
      </div>
      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#fcfdfe] text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">
            <tr><th className="px-6 py-4">Sinh viên</th><th className="px-6 py-4">Lớp</th><th className="px-6 py-4 text-center">Trạng thái</th><th className="px-6 py-4 text-center">Điểm</th><th className="px-6 py-4"></th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(s => (
              <tr key={s.id} className="hover:bg-blue-50/50 transition-colors cursor-pointer" onClick={() => { onSelectStudent(s.id); onStartReview(); }}>
                <td className="px-6 py-5">
                  <span className="block font-black text-blue-900 uppercase text-sm">{s.fullName}</span>
                  <span className="block text-[9px] text-gray-400 font-bold uppercase mt-0.5">{s.studentId}</span>
                </td>
                <td className="px-6 py-5 text-xs font-bold text-gray-500">{s.class}</td>
                <td className="px-6 py-5 text-center">
                  <div className={`px-3 py-1.5 text-[8px] font-black uppercase tracking-widest inline-block rounded-full ${s.status === 'Approved' ? 'bg-green-100 text-green-700' : s.status === 'Rejected' ? 'bg-red-100 text-red-600' : s.status === 'Processing' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                    {s.status === 'Submitted' ? 'Chờ thẩm định' : s.status === 'Processing' ? 'Đang giải trình' : s.status === 'Approved' ? 'Đã duyệt' : s.status === 'Rejected' ? 'Từ chối' : s.status}
                  </div>
                </td>
                <td className="px-6 py-5 text-center text-xl font-black text-blue-900 font-formal">{s.totalScore}</td>
                <td className="px-6 py-5">
                  <div className="flex items-center justify-end gap-3">
                    {(s.status === 'Submitted' || s.status === 'Processing') && (Object.values(s.verifications).some((v: any) => v.explanation) || Object.values(s.evidences).flat().some((e: any) => e.studentExplanation)) ? (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[8px] font-black uppercase rounded flex items-center gap-1">
                        <i className="fas fa-comment-dots"></i> Đã giải trình
                      </span>
                    ) : null}
                    <button 
                      onClick={() => { onSelectStudent(s.id); onStartReview(); }} 
                      className="w-[110px] flex items-center justify-center py-2.5 bg-blue-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-orange-600 transition-all border border-blue-950 shadow-sm"
                    >
                      <i className="fas fa-eye mr-1.5"></i>Thẩm định
                    </button>
                    
                    {/* Khung chứa cố định 36px cho nút Thùng rác */}
                    <div className="w-9 h-9 flex items-center justify-center">
                      {s.status === 'Rejected' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onShowConfirm({
                              show: true,
                              type: 'Rejected',
                              title: 'XÓA VĨNH VIỄN HỒ SƠ',
                              message: `Bạn có chắc chắn muốn xóa vĩnh viễn hồ sơ của sinh viên ${s.fullName}? Hành động này không thể hoàn tác.`,
                              requireFeedback: false,
                              onSubmit: async () => {
                                try {
                                  await adminService.deleteStudent(s.id);
                                  toast.success(`Đã xóa hồ sơ ${s.fullName}`);
                                  onShowConfirm({ show: false, type: 'Rejected', title: '', message: '', requireFeedback: false, onSubmit: () => {} });
                                  window.location.reload();
                                } catch { 
                                  toast.error('Xóa thất bại'); 
                                }
                              }
                            });
                          }}
                          className="w-full h-full rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-200"
                          title="Xóa hồ sơ bị từ chối"
                        >
                          <i className="fas fa-trash text-[10px]"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">Không tìm thấy hồ sơ nào</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProfileList;
