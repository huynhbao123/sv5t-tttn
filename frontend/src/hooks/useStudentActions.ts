import React, { useCallback } from 'react';
import toast from 'react-hot-toast';
import { studentService } from '../services/studentService';
import { StudentProfile, Evidence, CriterionType } from '../types';

export const useStudentActions = (
  student: StudentProfile,
  setStudents: React.Dispatch<React.SetStateAction<StudentProfile[]>>,
  userRole: string
) => {
  const addEvidence = useCallback(async (type: CriterionType, ev: Evidence) => {
    setStudents(prev => prev.map(s => s.id === student.id ? {
      ...s,
      evidences: {
        ...s.evidences,
        [type]: [...(s.evidences[type] || []), ev]
      }
    } : s));
    
    try {
      const updatedProfile = await studentService.addEvidence(type, ev);
      setStudents(prev => prev.map(s => s.id === updatedProfile.id ? updatedProfile : s));
      toast.success(`Đã thêm minh chứng: ${ev.name}`);
    } catch (err) {
      toast.error('Lỗi khi thêm minh chứng');
    }
  }, [student.id, setStudents]);

  const removeEvidence = useCallback(async (type: CriterionType, id: string) => {
    try {
      const updatedProfile = await studentService.removeEvidence(type, id);
      setStudents(prev => prev.map(s => s.id === updatedProfile.id ? updatedProfile : s));
      toast.success('Đã xóa minh chứng');
    } catch (err) {
      toast.error('Lỗi khi xóa minh chứng');
    }
  }, [setStudents]);

  const handleSubmit = useCallback(async () => {
    try {
      const updatedProfile = await studentService.submitProfile();
      setStudents([updatedProfile]);
      toast.success('Hồ sơ của bạn đã được nộp thành công!', { duration: 5000 });
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Bạn chưa đạt đủ các chuẩn cứng cơ bản để nộp hồ sơ.";
      toast.error(msg, { duration: 6000 });
    }
  }, [setStudents]);

  const handleUnsubmit = useCallback(async () => {
    if (window.confirm("Bạn có chắc chắn muốn hủy nộp hồ sơ để chỉnh sửa lại không?")) {
      try {
        const updatedProfile = await studentService.unsubmitProfile();
        setStudents([updatedProfile]);
        toast.success("Đã hủy nộp hồ sơ!");
      } catch (err) {
        toast.error("Lỗi khi hủy nộp hồ sơ");
      }
    }
  }, [setStudents]);

  const handleResubmit = useCallback(async () => {
    try {
      const updatedProfile = await studentService.submitProfile();
      setStudents([updatedProfile]);
      toast.success("Đã nộp lại giải trình!");
    } catch (err) {
      toast.error("Lỗi khi nộp lại");
    }
  }, [setStudents]);

  const updateProfile = useCallback(async (data: Partial<StudentProfile>) => {
    setStudents(prev => prev.map(s => s.id === student.id ? { ...s, ...data } : s));
    try {
      const updatedProfile = await studentService.updateProfile(data);
      setStudents(prev => prev.map(s => s.id === updatedProfile.id ? updatedProfile : s));
      toast.success("Đã cập nhật thông tin");
    } catch (err) {
      toast.error("Lỗi khi cập nhật thông tin");
    }
  }, [student.id, setStudents]);

  const handleUpdateEvidence = useCallback(async (type: CriterionType, id: string, updatedEv: Evidence) => {
    try {
      const updatedProfile = await studentService.updateEvidence(type, id, updatedEv);
      setStudents(prev => prev.map(s => s.id === updatedProfile.id ? updatedProfile : s));
      toast.success("Đã cập nhật minh chứng");
    } catch (err) {
      toast.error("Lỗi khi cập nhật minh chứng");
    }
  }, [setStudents]);

  const updateEvidenceExplanation = useCallback(async (type: CriterionType, id: string, explanation: string, file?: File) => {
    try {
      const updatedProfile = await studentService.explainEvidence(type, id, explanation, file);
      setStudents(prev => prev.map(s => s.id === updatedProfile.id ? updatedProfile : s));
      toast.success("Đã gửi giải trình minh chứng");
    } catch (err) {
      toast.error("Lỗi khi gửi giải trình");
    }
  }, [setStudents]);

  const updateFieldExplanation = useCallback(async (field: keyof StudentProfile['verifications'], explanation: string, file?: File) => {
    try {
      const updatedProfile = await studentService.explainField(field, explanation, file);
      setStudents(prev => prev.map(s => s.id === updatedProfile.id ? updatedProfile : s));
      toast.success("Đã gửi giải trình chuẩn");
    } catch (err) {
      toast.error("Lỗi khi gửi giải trình chuẩn");
    }
  }, [setStudents]);

  return { 
    addEvidence, removeEvidence, handleSubmit, handleUnsubmit, handleResubmit, 
    updateProfile, handleUpdateEvidence, updateEvidenceExplanation, updateFieldExplanation 
  };
};
