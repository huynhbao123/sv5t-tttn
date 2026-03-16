import React, { useCallback } from 'react';
import toast from 'react-hot-toast';
import { adminService } from '../services/adminService';
import { FeaturedFace } from '../types';

export const useContentActions = (
  setFaces: React.Dispatch<React.SetStateAction<FeaturedFace[]>>,
  setPosts: React.Dispatch<React.SetStateAction<any[]>>
) => {
  // --- Faces ---
  const handleAddFace = useCallback(async (face: Omit<FeaturedFace, 'id'>) => {
    try {
      const newFace = await adminService.addFace(face);
      setFaces(prev => [...prev, newFace]);
      toast.success('Đã thêm gương mặt tiêu biểu');
    } catch (err) {
      toast.error('Lỗi khi thêm gương mặt');
    }
  }, [setFaces]);

  const handleUpdateFace = useCallback(async (id: string, face: Partial<FeaturedFace>) => {
    try {
      const updatedFace = await adminService.updateFace(id, face);
      setFaces(prev => prev.map(f => f.id === id ? updatedFace : f));
      toast.success('Đã cập nhật gương mặt');
    } catch (err) {
      toast.error('Lỗi khi cập nhật gương mặt');
    }
  }, [setFaces]);

  const handleDeleteFace = useCallback(async (id: string) => {
    try {
      await adminService.deleteFace(id);
      setFaces(prev => prev.filter(f => f.id !== id));
      toast.success('Đã xóa gương mặt');
    } catch (err) {
      toast.error('Lỗi khi xóa gương mặt');
    }
  }, [setFaces]);

  // --- Posts ---
  const onAddPost = useCallback(async (post: { title: string, content: string, status: string, imageFile?: File }) => {
    try {
      const newPost = await adminService.addPost(post);
      setPosts(prev => [newPost, ...prev]);
      toast.success('Đã đăng bài viết');
    } catch (err) {
      toast.error('Lỗi khi đăng bài viết');
    }
  }, [setPosts]);

  const onUpdatePost = useCallback(async (id: string, post: { title?: string, content?: string, status?: string, imageFile?: File }) => {
    try {
      const updatedPost = await adminService.updatePost(id, post);
      setPosts(prev => prev.map(p => p.id === id ? updatedPost : p));
      toast.success('Đã cập nhật bài viết');
    } catch (err) {
      toast.error('Lỗi khi cập nhật bài viết');
    }
  }, [setPosts]);

  const onDeletePost = useCallback(async (id: string) => {
    try {
      await adminService.deletePost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
      toast.success('Đã xóa bài viết');
    } catch (err) {
      toast.error('Lỗi khi xóa bài viết');
    }
  }, [setPosts]);

  return { 
    handleAddFace, handleUpdateFace, handleDeleteFace,
    onAddPost, onUpdatePost, onDeletePost 
  };
};
