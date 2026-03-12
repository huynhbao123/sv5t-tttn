import { apiClient } from './apiClient';
import { StudentProfile, CriterionType, Evidence, FieldVerification, FeaturedFace } from '../types';
import { mapBackendStudentToFrontend } from '../utils/mapper';

export const adminService = {
  getProfiles: async (): Promise<StudentProfile[]> => {
    const response = await apiClient.get('/api/admin/students/');
    return response.data.map(mapBackendStudentToFrontend);
  },

  updateProfileStatus: async (studentId: string, status: StudentProfile['status'], feedback?: string): Promise<StudentProfile> => {
    const response = await apiClient.put(`/api/admin/students/${studentId}/status/`, { status, feedback });
    return mapBackendStudentToFrontend(response.data);
  },

  updateEvidenceStatus: async (studentId: string, evidenceId: string, type: CriterionType, status: Evidence['status'], feedback?: string): Promise<StudentProfile> => {
    const response = await apiClient.put(`/api/admin/students/${studentId}/evidences/${evidenceId}/status/`, { type, status, feedback });
    return mapBackendStudentToFrontend(response.data);
  },

  updateFieldStatus: async (studentId: string, fieldId: keyof StudentProfile['verifications'], status: FieldVerification['status'], feedback?: string): Promise<StudentProfile> => {
    const response = await apiClient.put(`/api/admin/students/${studentId}/fields/${fieldId}/status/`, { status, feedback });
    return mapBackendStudentToFrontend(response.data);
  },

  addFace: async (face: Omit<FeaturedFace, 'id'>): Promise<FeaturedFace> => {
    const payload = {
      TenSinhVien: face.name,
      ThanhTich: face.achievement,
      NoiDung: face.content,
      // If we support actual image files, we would use FormData here
    };
    const response = await apiClient.post('/api/featured/', payload);
    const d = response.data;
    return { id: String(d.id), name: d.TenSinhVien, achievement: d.ThanhTich, content: d.NoiDung, image: d.HinhAnhUrl || d.HinhAnh || '' };
  },

  updateFace: async (id: string, face: Partial<FeaturedFace>): Promise<FeaturedFace> => {
    const payload: any = {};
    if (face.name) payload.TenSinhVien = face.name;
    if (face.achievement) payload.ThanhTich = face.achievement;
    if (face.content) payload.NoiDung = face.content;
    const response = await apiClient.put(`/api/featured/${id}/`, payload);
    const d = response.data;
    return { id: String(d.id), name: d.TenSinhVien, achievement: d.ThanhTich, content: d.NoiDung, image: d.HinhAnhUrl || d.HinhAnh || '' };
  },

  deleteFace: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/featured/${id}/`);
  },

  getPosts: async (): Promise<any[]> => {
    const response = await apiClient.get('/api/admin/posts/');
    return response.data.map((p: any) => ({
      ...p,
      id: String(p.id),
      title: p.TieuDe,
      date: p.NgayDang,
      status: p.TrangThai
    }));
  },

  addPost: async (post: any): Promise<any> => {
    const response = await apiClient.post('/api/posts/', { TieuDe: post.title, NoiDung: post.content || '', TrangThai: post.status });
    const p = response.data;
    return { ...p, id: String(p.id), title: p.TieuDe, date: p.NgayDang, status: p.TrangThai };
  },

  updatePost: async (id: string, post: any): Promise<any> => {
    const payload: any = {};
    if (post.title) payload.TieuDe = post.title;
    if (post.status) payload.TrangThai = post.status;
    const response = await apiClient.put(`/api/posts/${id}/`, payload);
    const p = response.data;
    return { ...p, id: String(p.id), title: p.TieuDe, date: p.NgayDang, status: p.TrangThai };
  },

  deletePost: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/posts/${id}/`);
  },

  getUsers: async (): Promise<any[]> => {
    const response = await apiClient.get('/api/auth/accounts/');
    return response.data.map((u: any) => ({
      id: String(u.id),
      name: u.HoTen || u.TenDangNhap,
      email: u.Email,
      role: u.VaiTro === 'SinhVien' ? 'SINH VIÊN' : 
            u.VaiTro === 'Admin' ? 'ADMIN' : 
            u.VaiTro === 'ThuKy' ? 'THƯ KÝ' : 'THẨM ĐỊNH VIÊN'
    }));
  }
};

export const publicService = {
  getFaces: async (): Promise<FeaturedFace[]> => {
    const response = await apiClient.get('/api/featured/');
    return response.data.map((d: any) => ({
      id: String(d.id),
      name: d.TenSinhVien,
      achievement: d.ThanhTich,
      content: d.NoiDung,
      image: d.HinhAnh || ''
    }));
  }
};
