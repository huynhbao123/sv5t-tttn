import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

interface UserManagerProps {
  onShowConfirm: (config: { show: boolean; type: 'Approved' | 'Rejected' | 'NeedsExplanation'; title: string; message: string; requireFeedback: boolean; onSubmit: (feedback?: string) => void }) => void;
}

const UserManager: React.FC<UserManagerProps> = ({ onShowConfirm }) => {
  const [managedUsers, setManagedUsers] = useState<any[]>([]);
  const [userForm, setUserForm] = useState<{
    show: boolean;
    data: { TenDangNhap: string; MatKhau: string; HoTen: string; VaiTro: string; Email: string; Lop: string; Khoa: string; }
  }>({
    show: false,
    data: { TenDangNhap: '', MatKhau: '', HoTen: '', VaiTro: 'SinhVien', Email: '', Lop: '', Khoa: '' }
  });

  const refreshUsers = () => {
    adminService.getUsers().then(setManagedUsers).catch(console.error);
  };

  useEffect(() => { refreshUsers(); }, []);

  const handleAddUser = () => {
    setUserForm({
      show: true,
      data: { TenDangNhap: '', MatKhau: '', HoTen: '', VaiTro: 'SinhVien', Email: '', Lop: '', Khoa: '' }
    });
  };

  const handleSaveUser = async () => {
    const { data } = userForm;
    if (!data.TenDangNhap || !data.MatKhau || !data.HoTen) {
      toast.error("Vui lòng nhập đầy đủ Tên đăng nhập, Mật khẩu và Họ tên.");
      return;
    }

    const payload = {
      ...data,
      Lop: data.Lop.trim() || 'Chưa cập nhật',
      Khoa: data.Khoa.trim() || 'Chưa cập nhật',
      Email: data.Email.trim() || '',
    };

    try {
      await adminService.addUser(payload);
      setUserForm({ ...userForm, show: false });
      refreshUsers();
      toast.success('Đã thêm người dùng thành công!');
    } catch (e: any) {
      console.error('Add user error:', e.response?.data);
      const errData = e.response?.data;
      let msg = 'Lỗi không xác định';
      if (errData) {
        if (typeof errData === 'string') {
          msg = errData;
        } else if (errData.detail) {
          msg = errData.detail;
        } else {
          msg = Object.entries(errData)
            .map(([field, errors]) => {
              const fieldName: Record<string, string> = {
                TenDangNhap: 'Tên đăng nhập',
                MatKhau: 'Mật khẩu',
                HoTen: 'Họ tên',
                Email: 'Email',
                VaiTro: 'Vai trò',
                non_field_errors: 'Dữ liệu',
              };
              const label = fieldName[field] || field;
              const detail = Array.isArray(errors) ? errors.join(', ') : String(errors);
              return `${label}: ${detail}`;
            })
            .join(' | ');
        }
      }
      toast.error('Lỗi tạo tài khoản — ' + msg);
    }
  };

  const handleDeleteUser = async (id: string) => {
    onShowConfirm({
      show: true,
      type: 'Rejected',
      title: 'XÓA NGƯỜI DÙNG',
      message: 'Bạn có chắc chắn muốn xóa người dùng này? Tài khoản và dữ liệu liên quan sẽ bị gỡ bỏ.',
      requireFeedback: false,
      onSubmit: async () => {
        try {
          await adminService.deleteUser(id);
          toast.success('Đã xóa người dùng!');
          refreshUsers();
          onShowConfirm({ show: false, type: 'Rejected', title: '', message: '', requireFeedback: false, onSubmit: () => {} });
        } catch (e: any) {
          toast.error("Lỗi khi xóa người dùng!");
        }
      }
    });
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-black text-blue-900 uppercase">Quản lý người dùng</h2>
          <button onClick={handleAddUser} className="px-5 py-2.5 bg-blue-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-orange-600 transition-all border border-blue-950">
            <i className="fas fa-user-plus mr-1.5"></i>Thêm người dùng
          </button>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#fcfdfe] text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] border-b border-gray-100">
              <tr><th className="px-6 py-4">Họ tên</th><th className="px-6 py-4">Email</th><th className="px-6 py-4">Vai trò</th><th className="px-6 py-4"></th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {managedUsers.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-black text-sm">{u.name.charAt(0)}</div>
                      <div>
                        <span className="block text-sm font-bold text-gray-800">{u.name}</span>
                        <span className="block text-[10px] text-gray-400 font-medium uppercase tracking-wider">{u.username}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">{u.email || 'N/A'}</td>
                  <td className="px-6 py-4"><span className="text-[9px] font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-full uppercase">{u.role}</span></td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDeleteUser(u.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-all ml-auto"><i className="fas fa-trash text-[10px]"></i></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Management Modal */}
      {userForm.show && (
        <div className="fixed inset-0 z-[1200] bg-blue-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl border border-gray-100 overflow-hidden animate-fade-up">
            <div className="px-8 py-6 bg-blue-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight">Thêm người dùng mới</h3>
                <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mt-1">Khởi tạo tài khoản và hồ sơ</p>
              </div>
              <button onClick={() => setUserForm({ ...userForm, show: false })} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"><i className="fas fa-times"></i></button>
            </div>

            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Role Selection */}
              <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                {[
                  { key: 'SinhVien', label: 'Sinh viên' },
                  { key: 'Admin', label: 'Admin' }
                ].map(r => (
                  <button
                    key={r.key}
                    onClick={() => setUserForm({ ...userForm, data: { ...userForm.data, VaiTro: r.key } })}
                    className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${userForm.data.VaiTro === r.key ? 'bg-white text-blue-900 border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tên đăng nhập {userForm.data.VaiTro === 'SinhVien' ? '(Mã SV)' : ''}</label>
                  <input
                    type="text"
                    value={userForm.data.TenDangNhap}
                    onChange={e => setUserForm({ ...userForm, data: { ...userForm.data, TenDangNhap: e.target.value } })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:border-blue-600 outline-none transition-all"
                    placeholder="VD: 20123456"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mật khẩu khởi tạo</label>
                  <input
                    type="password"
                    value={userForm.data.MatKhau}
                    onChange={e => setUserForm({ ...userForm, data: { ...userForm.data, MatKhau: e.target.value } })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:border-blue-600 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Họ và tên</label>
                <input
                  type="text"
                  value={userForm.data.HoTen}
                  onChange={e => setUserForm({ ...userForm, data: { ...userForm.data, HoTen: e.target.value } })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm font-bold focus:border-blue-900 outline-none transition-all uppercase"
                  placeholder="VD: NGUYỄN VĂN A"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                <input
                  type="email"
                  value={userForm.data.Email}
                  onChange={e => setUserForm({ ...userForm, data: { ...userForm.data, Email: e.target.value } })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm font-medium focus:border-blue-900 outline-none transition-all"
                  placeholder={userForm.data.VaiTro === 'SinhVien' ? 'Để trống nếu dùng email mặc định' : 'VD: admin@due.udn.vn'}
                />
              </div>

              {userForm.data.VaiTro === 'SinhVien' && (
                <div className="grid grid-cols-2 gap-4 animate-fade-in">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Lớp sinh hoạt</label>
                    <input
                      type="text"
                      value={userForm.data.Lop}
                      onChange={e => setUserForm({ ...userForm, data: { ...userForm.data, Lop: e.target.value } })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:border-blue-600 outline-none transition-all"
                      placeholder="VD: 47K12.1"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Khoa / Đơn vị</label>
                    <input
                      type="text"
                      value={userForm.data.Khoa}
                      onChange={e => setUserForm({ ...userForm, data: { ...userForm.data, Khoa: e.target.value } })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:border-blue-600 outline-none transition-all"
                      placeholder="VD: Khoa Công nghệ thông tin"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 bg-gray-50 flex justify-end gap-3 border-t">
              <button 
                onClick={() => setUserForm({ ...userForm, show: false })}
                className="px-6 py-3 text-gray-400 font-black text-[9px] uppercase tracking-widest hover:text-gray-600 transition-all"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleSaveUser}
                className="px-10 py-3 bg-blue-900 text-white font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-orange-600 transition-all"
              >
                Tạo tài khoản
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserManager;
