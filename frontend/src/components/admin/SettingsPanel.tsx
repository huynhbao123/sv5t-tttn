import React from 'react';
import systemService from '../../services/systemService';
import toast from 'react-hot-toast';
import { SystemConfig } from '../../types';

interface SettingsPanelProps {
  systemSettings: SystemConfig | null;
  setSystemSettings: React.Dispatch<React.SetStateAction<SystemConfig | null>>;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ systemSettings, setSystemSettings }) => {
  const isSettingsLoading = !systemSettings;

  const handleSaveSettings = async (data: Partial<SystemConfig>) => {
    if (!systemSettings) return;
    const newStart = data.ThoiGianBatDau || systemSettings.ThoiGianBatDau;
    const newEnd = data.ThoiGianKetThuc || systemSettings.ThoiGianKetThuc;

    if (newStart && newEnd) {
      if (new Date(newEnd) < new Date(newStart)) {
        toast.error("Lỗi: Ngày kết thúc không thể trước ngày bắt đầu!");
        systemService.getSettings().then(setSystemSettings).catch(console.error);
        return;
      }
    }

    try {
      const updated = await systemService.updateSettings(data);
      setSystemSettings(updated);
      toast.success("Đã lưu cài đặt hệ thống!");
    } catch (error) {
      toast.error("Lỗi khi lưu cài đặt!");
    }
  };

  if (isSettingsLoading) return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
      <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Đang tải cài đặt hệ thống...</p>
    </div>
  );
  if (!systemSettings) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-fade-in pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-white p-8 border border-gray-200 rounded-2xl space-y-6 transition-all hover:bg-gray-50/50">
            <div className="flex items-center gap-4 mb-4">
               <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600"><i className="fas fa-calendar-alt"></i></div>
               <div>
                  <h4 className="text-[11px] font-black text-blue-900 uppercase tracking-widest">Khung thời gian nộp</h4>
                  <p className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter">Thời gian tự động áp dụng</p>
               </div>
            </div>
            
            <div className="space-y-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ngày bắt đầu</label>
                  <input 
                     type="datetime-local" 
                     value={systemSettings.ThoiGianBatDau ? systemSettings.ThoiGianBatDau.substring(0, 16) : ''} 
                     onChange={e => setSystemSettings({ ...systemSettings, ThoiGianBatDau: e.target.value })}
                     onBlur={() => handleSaveSettings({ ThoiGianBatDau: systemSettings.ThoiGianBatDau })}
                     className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm font-bold focus:border-blue-500 transition-all outline-none"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ngày kết thúc</label>
                  <input 
                     type="datetime-local" 
                     value={systemSettings.ThoiGianKetThuc ? systemSettings.ThoiGianKetThuc.substring(0, 16) : ''} 
                     onChange={e => setSystemSettings({ ...systemSettings, ThoiGianKetThuc: e.target.value })}
                     onBlur={() => handleSaveSettings({ ThoiGianKetThuc: systemSettings.ThoiGianKetThuc })}
                     className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm font-bold focus:border-blue-500 transition-all outline-none"
                  />
               </div>
            </div>
         </div>

         <div className="bg-white p-8 border border-gray-200 rounded-2xl space-y-6 transition-all hover:bg-gray-50/50">
            <div className="flex items-center gap-4 mb-4">
               <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600"><i className="fas fa-power-off"></i></div>
               <div>
                  <h4 className="text-[11px] font-black text-blue-900 uppercase tracking-widest">Trạng thái cổng</h4>
                  <p className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter">Bật/tắt thủ công ngay lập tức</p>
               </div>
            </div>

            <div className={`p-6 rounded-2xl flex items-center justify-between border-2 transition-all ${systemSettings.TrangThaiMo ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
               <div>
                  <p className={`text-[13px] font-black uppercase tracking-tight ${systemSettings.TrangThaiMo ? 'text-green-600' : 'text-red-500'}`}>
                     {systemSettings.TrangThaiMo ? 'Cổng đang MỞ' : 'Cổng đang ĐÓNG'}
                  </p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Ghi đè tất cả cài đặt thời gian</p>
               </div>
               <button 
                 onClick={() => handleSaveSettings({ TrangThaiMo: !systemSettings.TrangThaiMo })}
                 className={`w-14 h-8 rounded-full p-1 transition-all duration-500 group ${systemSettings.TrangThaiMo ? 'bg-green-500' : 'bg-gray-300'}`}
               >
                  <div className={`w-6 h-6 bg-white rounded-full transition-all duration-500 transform border border-gray-200 ${systemSettings.TrangThaiMo ? 'translate-x-6 rotate-180' : 'translate-x-0'}`}></div>
               </button>
            </div>

            <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 italic text-[11px] font-bold text-blue-800/60 leading-relaxed flex gap-3">
               <i className="fas fa-info-circle mt-1"></i>
               <span>Lưu ý: Ngay cả khi cổng đóng, các hồ sơ đang trong trạng thái <span className="text-orange-600 uppercase tracking-tighter">[Đang giải trình]</span> vẫn có thể chỉnh sửa.</span>
            </div>
         </div>
      </div>

      <div className="bg-white p-10 border border-gray-200 rounded-3xl space-y-8 relative overflow-hidden group transition-all">
         <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 opacity-50 group-hover:scale-110 transition-transform"></div>
         <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
            <div className="w-12 h-12 bg-blue-900 rounded-2xl flex items-center justify-center text-white"><i className="fas fa-bullhorn animate-bounce"></i></div>
            <div>
               <h4 className="text-sm font-black text-blue-900 uppercase tracking-[0.2em]">Thông tin thông báo</h4>
               <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 tracking-widest">Nội dung sẽ hiển thị trên Dashboard sinh viên</p>
            </div>
         </div>

         <div className="space-y-8">
            <div className="space-y-3">
               <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Thông báo khi cổng mở</label>
                  <span className="px-2 py-0.5 bg-green-100 text-green-600 text-[8px] font-black uppercase rounded">Mặc định</span>
               </div>
               <textarea 
                  value={systemSettings.ThongBaoHieuLuc} 
                  onChange={e => setSystemSettings({ ...systemSettings, ThongBaoHieuLuc: e.target.value })}
                  onBlur={() => handleSaveSettings({ ThongBaoHieuLuc: systemSettings.ThongBaoHieuLuc })}
                  className="w-full px-6 py-5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:border-blue-600 transition-all outline-none min-h-[120px]" 
                  placeholder="VD: Cổng nộp hồ sơ đang mở. Hạn chót đến 23:59 ngày..."
               />
            </div>
            <div className="space-y-3">
               <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Thông báo khi cổng đóng</label>
                  <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[8px] font-black uppercase rounded">Mặc định</span>
               </div>
               <textarea 
                  value={systemSettings.ThongBaoHetHan} 
                  onChange={e => setSystemSettings({ ...systemSettings, ThongBaoHetHan: e.target.value })}
                  onBlur={() => handleSaveSettings({ ThongBaoHetHan: systemSettings.ThongBaoHetHan })}
                  className="w-full px-6 py-5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:border-red-500 transition-all outline-none min-h-[120px]" 
                  placeholder="VD: Cổng nộp hồ sơ hiện đã đóng. Vui lòng liên hệ Admin nếu có thắc mắc."
               />
            </div>
         </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
