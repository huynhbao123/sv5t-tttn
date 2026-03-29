import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

interface AuthCallbackProps {
  onLogin: (role: 'student' | 'admin', studentId?: string) => void;
  onNavigate: (page: string) => void;
}

const AuthCallback: React.FC<AuthCallbackProps> = ({ onLogin, onNavigate }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const hasExchanged = React.useRef(false);

  useEffect(() => {
    if (hasExchanged.current) return;

    const code = searchParams.get('code');
    const err = searchParams.get('error');

    if (err) {
      setError(`Lỗi xác thực Microsoft: ${searchParams.get('error_description') || err}`);
      return;
    }

    if (!code) {
      setError('Mã xác thực không hợp lệ. Vui lòng thử lại.');
      return;
    }

    const exchangeCode = async () => {
      hasExchanged.current = true;
      try {
        const { user } = await authService.microsoftLogin(code);
        onLogin(user.role as 'student' | 'admin', user.studentId);
        onNavigate(user.role === 'admin' ? 'admin' : 'profile');
      } catch (err: any) {
        console.error('Lỗi khi đổi mã token:', err);
        setError(err.response?.data?.detail || err.message || 'Đăng nhập thất bại.');
      }
    };

    exchangeCode();
  }, [searchParams, onLogin, onNavigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 w-full max-w-md text-center">
        {error ? (
          <>
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              <i className="fas fa-times"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Đăng nhập thất bại</h2>
            <p className="text-sm text-red-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 bg-[#002b5c] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:-translate-y-0.5 transition-all w-full"
            >
              Quay lại trang Đăng nhập
            </button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 border-4 border-[#002b5c]/20 border-t-[#002b5c] rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Đang xác thực bảo mật...</h2>
            <p className="text-sm text-gray-500">Xin chờ một chút, hệ thống đang kết nối với máy chủ DUE.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
