import { apiClient } from './apiClient';
import { StudentProfile, CriterionType, Evidence, FieldVerification } from '../types';
import { mapBackendStudentToFrontend } from '../utils/mapper';

export const studentService = {
  getProfile: async (studentId?: string): Promise<StudentProfile> => {
    // We pass studentId as a query param just for mocking ease in the MSW setup right now
    const url = studentId ? `/api/students/me/?studentId=${studentId}` : '/api/students/me/';
    const response = await apiClient.get(url);
    return mapBackendStudentToFrontend(response.data);
  },

  updateProfile: async (data: Partial<StudentProfile>, studentId?: string): Promise<StudentProfile> => {
    const url = studentId ? `/api/students/me/?studentId=${studentId}` : '/api/students/me/';
    
    // Map frontend fields to backend names
    const payload: any = {};
    if (data.fullName !== undefined) payload.HoTen = data.fullName;
    if (data.class !== undefined) payload.Lop = data.class;
    if (data.faculty !== undefined) payload.Khoa = data.faculty;
    if (data.gpa !== undefined) payload.DiemTBC = data.gpa;
    if (data.trainingPoints !== undefined) payload.DiemRenLuyen = data.trainingPoints;
    if (data.peScore !== undefined) payload.DiemTheDuc = data.peScore;
    if (data.englishLevel !== undefined) payload.TrinhDoNgoaiNgu = data.englishLevel;
    if (data.englishGpa !== undefined) payload.GPANgoaiNgu = data.englishGpa;
    if (data.isPartyMember !== undefined) payload.LaDangVien = data.isPartyMember;
    if (data.noViolation !== undefined) payload.KhongViPham = data.noViolation;

    const response = await apiClient.put(url, payload);
    return mapBackendStudentToFrontend(response.data);
  },

  addEvidence: async (type: CriterionType, evidence: Evidence, studentId?: string): Promise<StudentProfile> => {
    // Backend evidences endpoint
    const url = '/api/evidences/';
    
    // Multipart/form-data payload
    const formData = new FormData();
    // Backend expects slug MaTieuChi, FE đang dùng subCriterionId (eth_hard_1, vol_hard_2, ...)
    formData.append('TieuChi', evidence.subCriterionId);
    formData.append('TenMinhChung', evidence.name);
    formData.append('CapDo', evidence.level);
    formData.append('LoaiMinhChung', evidence.type);
    if (evidence.decisionNumber) formData.append('SoQuyetDinh', evidence.decisionNumber);
    if (evidence.qty !== undefined) formData.append('SoLuong', String(evidence.qty));
    if (evidence.file) formData.append('DuongDanFile', evidence.file);
    formData.append('TenFile', evidence.fileName);
    // category chỉ dùng phía FE, backend không cần

    await apiClient.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    // Sau khi thêm minh chứng, lấy lại hồ sơ đầy đủ
    return studentService.getProfile(studentId);
  },

  removeEvidence: async (type: CriterionType, guid: string, studentId?: string): Promise<StudentProfile> => {
    const url = `/api/evidences/${guid}/`;
    await apiClient.delete(url);
    return studentService.getProfile(studentId);
  },

  explainEvidence: async (type: CriterionType, guid: string, explanation: string, studentId?: string): Promise<StudentProfile> => {
    const url = `/api/evidences/${guid}/explain/`;
    await apiClient.post(url, { GiaiTrinhSV: explanation });
    return studentService.getProfile(studentId);
  },

  explainField: async (key: string, explanation: string, studentId?: string): Promise<StudentProfile> => {
    const url = `/api/students/me/fields/${key}/explain/`;
    await apiClient.post(url, { GiaiTrinhSV: explanation });
    return studentService.getProfile(studentId);
  },

  submitProfile: async (studentId?: string): Promise<StudentProfile> => {
    const url = studentId ? `/api/students/me/submit/?studentId=${studentId}` : '/api/students/me/submit/';
    await apiClient.post(url);
    return studentService.getProfile(studentId);
  },

  unsubmitProfile: async (studentId?: string): Promise<StudentProfile> => {
    const url = studentId ? `/api/students/me/unsubmit/?studentId=${studentId}` : '/api/students/me/unsubmit/';
    await apiClient.post(url);
    return studentService.getProfile(studentId);
  }
};
