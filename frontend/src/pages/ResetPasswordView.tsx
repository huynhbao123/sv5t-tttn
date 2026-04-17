import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';

const ResetPasswordView: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 6) {
      setErrorMsg('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.resetPassword(token, password);
      setMessage(result);
      setIsSuccess(true);
    } catch (err: any) {
      const detail = err.response?.data?.detail || 'Có lỗi xảy ra. Vui lòng thử lại.';
      setErrorMsg(detail);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center bg-gray-50 py-12 px-4 animate-fade-in font-sans">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl p-10 border border-gray-200 space-y-6">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto text-2xl">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h2 className="text-lg font-black text-[#002b5c] uppercase">Link không hợp lệ</h2>
            <p className="text-sm text-gray-500">Link đặt lại mật khẩu bị thiếu token. Vui lòng yêu cầu link mới.</p>
            <button
              onClick={() => onNavigate('/forgot-password')}
              className="px-8 py-3 bg-[#002b5c] text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-orange-600 transition-all"
            >
              Yêu cầu link mới
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-gray-50 py-12 px-4 animate-fade-in font-sans">
      <div className="max-w-md w-full">
        <button onClick={() => onNavigate('/login')} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-[#0054a6] transition-colors font-bold text-xs uppercase tracking-widest">
          <i className="fas fa-arrow-left"></i> Quay lại đăng nhập
        </button>

        <div className="bg-white rounded-2xl p-8 border border-gray-200">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl">
              <i className="fas fa-lock-open"></i>
            </div>
            <h2 className="text-xl font-black text-[#002b5c] uppercase tracking-tight">
              Đặt mật khẩu mới
            </h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">
              Nhập mật khẩu mới cho tài khoản của bạn
            </p>
          </div>

          {isSuccess ? (
            <div className="space-y-6 animate-fade-in">
              <div className="p-5 bg-green-50 border border-green-200 rounded-xl text-center">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
                  <i className="fas fa-check-circle"></i>
                </div>
                <p className="text-sm font-bold text-green-700 mb-1">Thành công!</p>
                <p className="text-xs text-green-600">{message}</p>
              </div>
              <button
                onClick={() => onNavigate('/login')}
                className="w-full py-4 bg-[#002b5c] text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
              >
                <i className="fas fa-sign-in-alt"></i>
                Đăng nhập ngay
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
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-12 py-3.5 border border-gray-200 rounded-xl text-sm font-bold focus:border-[#0054a6] outline-none transition-all placeholder:text-gray-300 placeholder:font-medium"
                      placeholder="Tối thiểu 6 ký tự"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <i className="fas fa-shield-alt absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full pl-11 pr-4 py-3.5 border rounded-xl text-sm font-bold focus:border-[#0054a6] outline-none transition-all placeholder:text-gray-300 placeholder:font-medium ${confirmPassword && password !== confirmPassword ? 'border-red-300 bg-red-50/30' : 'border-gray-200'}`}
                      placeholder="Nhập lại mật khẩu"
                    />
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-[9px] text-red-500 font-bold ml-1 flex items-center gap-1">
                      <i className="fas fa-times-circle"></i> Mật khẩu không khớp
                    </p>
                  )}
                  {confirmPassword && password === confirmPassword && password.length >= 6 && (
                    <p className="text-[9px] text-green-600 font-bold ml-1 flex items-center gap-1">
                      <i className="fas fa-check-circle"></i> Mật khẩu khớp
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || password.length < 6 || password !== confirmPassword}
                  className={`w-full py-4 bg-[#002b5c] text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-orange-600 transition-all hover:-translate-y-0.5 flex justify-center items-center gap-2 ${(isLoading || password.length < 6 || password !== confirmPassword) ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading && <i className="fas fa-spinner fa-spin"></i>}
                  Đặt lại mật khẩu
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

export default ResetPasswordView;
