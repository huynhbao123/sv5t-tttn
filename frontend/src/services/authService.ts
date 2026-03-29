import { apiClient } from './apiClient';

export interface UserPayload {
  id: number;
  studentId?: string;
  role: 'student' | 'admin' | 'ThuKy' | 'ThamDinh';
  fullName?: string;
  username: string;
}

export interface AuthResponse {
  token: string;
  refresh?: string;
  user: UserPayload;
}

export const authService = {
  login: async (identifier: string, password: string, roleInput: 'student' | 'admin'): Promise<AuthResponse> => {
    // Gọi API của backend Django
    const response = await apiClient.post('/api/auth/login/', {
      TenDangNhap: identifier,
      MatKhau: password
    });

    const data = response.data;
    
    // Convert dữ liệu backend trả về thành format frontend đang mong đợi
    const backendUser = data.user;
    
    // Lưu Token thật vào localStorage
    localStorage.setItem('token', data.access);
    if (data.refresh) {
      localStorage.setItem('refresh', data.refresh);
    }
    
    // Ánh xạ vai trò từ DB sang Frontend Role
    let frontendRole: 'student' | 'admin' = 'student';
    if (backendUser.VaiTro === 'Admin' || backendUser.VaiTro === 'ThuKy' || backendUser.VaiTro === 'ThamDinh') {
      frontendRole = 'admin';
    } else {
      frontendRole = 'student';
    }

    const payload: UserPayload = {
      id: backendUser.id,
      studentId: backendUser.VaiTro === 'SinhVien' ? backendUser.TenDangNhap : undefined,
      role: frontendRole,
      fullName: backendUser.profile?.HoTen || backendUser.profile?.HoTen || '',
      username: backendUser.TenDangNhap
    };

    localStorage.setItem('user', JSON.stringify(payload));

    return { 
      token: data.access, 
      refresh: data.refresh,
      user: payload 
    };
  },

  register: async (identifier: string, password: string, fullName: string, role: 'student' | 'admin' = 'student'): Promise<AuthResponse> => {
    // Đăng ký tài khoản mới qua API của Admin (Hiện tại hệ thống backend chưa làm API tự đăng ký mở, 
    // Sinh viên thường được cấp sẵn tài khoản hoặc Admin tạo, vì vậy hàm này tạm thời gọi tới tạo Account nếu cần, 
    // nhưng tốt nhất là throw Error báo người dùng liên hệ Admin)
    throw new Error('Tính năng đăng ký đang tạm khóa. Vui lòng liên hệ BCN Khoa / Trường để được cấp tài khoản bằng Mã Sinh Viên.');
  },

  logout: () => {
    authService.handleUnauthorized();
  },

  handleUnauthorized: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
  },

  refreshToken: async (): Promise<string> => {
    const refresh = localStorage.getItem('refresh');
    if (!refresh) {
      authService.handleUnauthorized();
      throw new Error('No refresh token available');
    }

    try {
      const response = await apiClient.post('/api/auth/refresh/', { refresh });
      const { access } = response.data;
      localStorage.setItem('token', access);
      return access;
    } catch (error) {
      authService.handleUnauthorized();
      throw error;
    }
  },

  getCurrentUser: (): UserPayload | null => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  getMicrosoftLoginUrl: () => {
    const clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID;
    const tenantId = import.meta.env.VITE_MICROSOFT_TENANT_ID;
    const redirectUri = window.location.origin + '/auth/callback';
    const scope = 'openid profile email User.Read';
    
    return `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&response_mode=query&scope=${encodeURIComponent(scope)}&prompt=select_account`;
  },

  microsoftLogin: async (code: string): Promise<AuthResponse> => {
    const redirectUri = window.location.origin + '/auth/callback';
    const response = await apiClient.post('/api/auth/microsoft/', { 
      code,
      redirect_uri: redirectUri 
    });

    const data = response.data;
    localStorage.setItem('token', data.access);
    if (data.refresh) localStorage.setItem('refresh', data.refresh);

    const backendUser = data.user;
    let frontendRole: 'student' | 'admin' = 'student';
    if (['Admin', 'ThuKy', 'ThamDinh'].includes(backendUser.VaiTro)) {
      frontendRole = 'admin';
    }

    const payload: UserPayload = {
      id: backendUser.id,
      studentId: backendUser.VaiTro === 'SinhVien' ? backendUser.TenDangNhap : undefined,
      role: frontendRole,
      fullName: backendUser.profile?.HoTen || '',
      username: backendUser.TenDangNhap
    };

    localStorage.setItem('user', JSON.stringify(payload));
    return { token: data.access, refresh: data.refresh, user: payload };
  }
};

