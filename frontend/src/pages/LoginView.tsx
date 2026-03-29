import React, { useState } from 'react';
import { authService } from '../services/authService';

const LoginView: React.FC<{ onLogin: (role: 'student' | 'admin', studentId?: string) => void, onNavigate: (page: string) => void }> = ({ onLogin, onNavigate }) => {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      // Đăng nhập (Mặc định truyền 'admin' làm role dummy vì backend tự xác định vai trò từ token)
      const { user } = await authService.login(studentId, password, 'admin');
      onLogin(user.role as 'student' | 'admin', user.studentId);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || err.message || 'Sai tên đăng nhập hoặc mật khẩu!');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-gray-50 py-12 px-4 animate-fade-in font-sans">
      <div className="max-w-md w-full">
        {/* Back button */}
        <button onClick={() => onNavigate('home')} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-[#0054a6] transition-colors font-bold text-xs uppercase tracking-widest">
          <i className="fas fa-arrow-left"></i> Quay lại trang chủ
        </button>

        <div className="bg-white rounded-2xl p-8 border border-gray-200">
          <div className="text-center mb-8">
            <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <img 
                src="https://tse3.mm.bing.net/th/id/OIP.Odk0Vk_H8Tfz70lpKj4FQAHaG8?pid=Api&P=0&h=180" 
                alt="DUE Logo" 
                className="w-full h-auto"
              />
            </div>
            <h2 className="text-2xl font-black text-[#002b5c] uppercase font-formal tracking-tight">
              Hệ thống Sinh viên 5 Tốt
            </h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Đăng nhập để tiếp tục</p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-2">
              <i className="fas fa-exclamation-circle"></i>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-between">
                <span>Tài khoản / Mã sinh viên</span>
              </label>
              <div className="relative">
                <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                <input
                  type="text"
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm font-bold focus:border-[#0054a6] outline-none transition-all placeholder:text-gray-300 placeholder:font-medium bg-gray-50/10"
                  placeholder="Nhập tên đăng nhập hoặc MSV"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mật khẩu</label>
                <a href="#" className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:text-orange-500 transition-colors">Quên mật khẩu?</a>
              </div>
              <div className="relative">
                <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm font-bold focus:border-[#0054a6] outline-none transition-all placeholder:text-gray-300 placeholder:font-medium bg-gray-50/10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 bg-[#002b5c] text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-orange-600 transition-all hover:-translate-y-0.5 flex justify-center items-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading && <i className="fas fa-spinner fa-spin"></i>}
              Đăng nhập hệ thống
            </button>

            <div className="relative mt-6 mb-4 flex items-center justify-center">
              <div className="border-t border-gray-200 w-full absolute"></div>
              <span className="bg-white px-3 text-[10px] font-black tracking-widest text-gray-400 uppercase relative z-10">hoặc dùng công thư học đường</span>
            </div>
            
            <button
              type="button"
              onClick={() => { window.location.href = authService.getMicrosoftLoginUrl(); }}
              className="w-full py-4 bg-white border border-gray-200 text-gray-700 font-black text-[10px] uppercase tracking-[0.1em] rounded-xl hover:bg-gray-50 transition-all hover:-translate-y-0.5 flex justify-center items-center gap-3 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21" className="w-5 h-5">
                <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
              </svg>
              Xác thực bằng Microsoft (@due.udn.vn)
            </button>
          </form>
        </div>

        <div className="text-center mt-8">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Hệ thống cấp Trường</p>
          <p className="text-xs font-black text-gray-500 uppercase mt-1">Đại học Kinh tế - ĐHĐN</p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
