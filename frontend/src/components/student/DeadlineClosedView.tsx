import React from 'react';

interface DeadlineClosedViewProps {
  message?: string;
}

const DeadlineClosedView: React.FC<DeadlineClosedViewProps> = ({ message }) => {
  return (
    <div className="fixed inset-0 z-[2000] bg-slate-50 flex items-center justify-center p-6 animate-fade-in overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative w-full max-w-2xl">
        <div className="bg-white/70 backdrop-blur-2xl border border-white p-12 rounded-[40px] shadow-2xl shadow-blue-900/10 text-center space-y-8 animate-scale-up relative overflow-hidden">
          {/* Accent bar */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-orange-500 to-blue-600"></div>
          
          <div className="relative">
            <div className="w-24 h-24 bg-orange-50 text-orange-600 rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-lg shadow-orange-200 rotate-12 transition-transform hover:rotate-0 duration-500">
              <i className="fas fa-hourglass-end"></i>
            </div>
            {/* Pulsing ring */}
            <div className="absolute inset-0 w-24 h-24 border-4 border-orange-500/20 rounded-3xl mx-auto scale-125 animate-ping opacity-20"></div>
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl font-black text-blue-950 uppercase tracking-tighter leading-tight">
              Cổng nộp hồ sơ <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 italic">Hiện đang đóng</span>
            </h2>
            <div className="max-w-md mx-auto">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] leading-relaxed">
                  {message || "Hiện tại không còn nằm trong khung thời gian quy định hoặc Admin đã đóng hệ thống xét duyệt."}
                </p>
            </div>
          </div>

          <div className="pt-8 flex flex-col items-center gap-4">
            <a 
              href="/"
              className="px-10 py-5 bg-blue-950 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-orange-600 hover:shadow-xl hover:shadow-orange-200 transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-3 active:scale-95"
            >
              <i className="fas fa-home text-xs"></i> Quay lại trang chủ
            </a>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Gặp sự cố? Liên hệ Liên chi đoàn khoa của bạn
            </p>
          </div>
        </div>

        {/* Floating decor */}
        <div className="absolute -top-6 -right-6 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-blue-900 animate-bounce duration-3000 delay-500 border border-slate-100">
            <i className="fas fa-lock text-[10px]"></i>
        </div>
      </div>
    </div>
  );
};

export default DeadlineClosedView;
