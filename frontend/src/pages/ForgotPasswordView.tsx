import React, { useState } from 'react';
import { authService } from '../services/authService';

const ForgotPasswordView: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [resetLink, setResetLink] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setMessage('');
    setResetLink('');
    setIsLoading(true);

    try {
      const result = await authService.forgotPassword(email);
      setMessage(result.detail);
      if (result.reset_link) setResetLink(result.reset_link);
      setIsSuccess(true);
    } catch (err: any) {
      const detail = err.response?.data?.detail || 'Có lỗi xảy ra. Vui lòng thử lại sau.';
      setErrorMsg(detail);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-gray-50 py-12 px-4 animate-fade-in font-sans">
      <div className="max-w-md w-full">
        <button onClick={() => onNavigate('/login')} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-[#0054a6] transition-colors font-bold text-xs uppercase tracking-widest">
          <i className="fas fa-arrow-left"></i> Quay lại đăng nhập
        </button>

        <div className="bg-white rounded-2xl p-8 border border-gray-200">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl">
              <i className="fas fa-key"></i>
            </div>
            <h2 className="text-xl font-black text-[#002b5c] uppercase tracking-tight">Quên mật khẩu</h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">
              Nhập email để nhận liên kết đặt lại mật khẩu
            </p>
          </div>

          {isSuccess ? (
            <div className="space-y-4 animate-fade-in">
              {/* Thông báo */}
              <div className={`p-4 rounded-xl border text-center ${resetLink ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
                <div className={`w-11 h-11 rounded-full flex items-center justify-center mx-auto mb-3 text-lg ${resetLink ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                  <i className={`fas ${resetLink ? 'fa-link' : 'fa-check-circle'}`}></i>
                </div>
                <p className={`text-xs font-bold ${resetLink ? 'text-amber-700' : 'text-green-700'}`}>{message}</p>
              </div>

              {/* Chế độ Demo: hiển thị link bấm trực tiếp */}
              {resetLink && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
                  <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest flex items-center gap-2">
                    <i className="fas fa-magic"></i> Liên kết đặt lại mật khẩu
                  </p>
                  <a
                    href={resetLink}
                    className="block w-full py-3 bg-[#002b5c] text-white text-center font-black text-[10px] uppercase tracking-[0.15em] rounded-xl hover:bg-orange-600 transition-all"
                  >
                    <i className="fas fa-lock-open mr-2"></i>Bấm vào đây để đặt lại mật khẩu
                  </a>
                  <p className="text-[9px] text-blue-500 font-bold text-center">
                    <i className="fas fa-clock mr-1"></i>Link có hiệu lực trong 15 phút
                  </p>
                </div>
              )}

              {/* Chế độ thật: nhắc kiểm tra hộp thư */}
              {!resetLink && (
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wide flex items-center gap-2">
                    <i className="fas fa-info-circle"></i>
                    Kiểm tra hộp thư đến và thư mục Spam. Link có hiệu lực trong 15 phút.
                  </p>
                </div>
              )}

              <button
                onClick={() => onNavigate('/login')}
                className="w-full py-3.5 bg-gray-100 text-gray-600 font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-gray-200 transition-all"
              >
                Quay lại đăng nhập
              </button>
            </div>
          ) : (
            <>
              {errorMsg && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-2">
                  <i className="fas fa-exclamation-circle"></i>
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Địa chỉ Email</label>
                  <div className="relative">
                    <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm font-bold focus:border-[#0054a6] outline-none transition-all placeholder:text-gray-300 placeholder:font-medium bg-gray-50/10"
                      placeholder="example@due.udn.vn"
                    />
                  </div>
                  <p className="text-[9px] text-gray-400 font-medium mt-1 ml-1">
                    <i className="fas fa-info-circle mr-1"></i>
                    Nhập email đã đăng ký với tài khoản của bạn
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className={`w-full py-4 bg-[#002b5c] text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-orange-600 transition-all hover:-translate-y-0.5 flex justify-center items-center gap-2 ${(isLoading || !email) ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading && <i className="fas fa-spinner fa-spin"></i>}
                  Gửi liên kết đặt lại mật khẩu
                </button>
              </form>
            </>
          )}
        </div>

        <div className="text-center mt-8">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Hệ thống cấp Trường</p>
          <p className="text-xs font-black text-gray-500 uppercase mt-1">Đại học Kinh tế - ĐHĐN</p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordView;
