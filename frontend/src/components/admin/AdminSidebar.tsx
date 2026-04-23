import React from 'react';
import { useNavigate } from 'react-router-dom';

interface SidebarItem {
  key: string;
  icon: string;
  label: string;
}

interface AdminSidebarProps {
  activeTab: string;
  items: SidebarItem[];
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, items }) => {
  const navigate = useNavigate();

  return (
    <div className="w-64 bg-[#0a1628] flex-shrink-0 flex flex-col h-full border-r border-white/5">
      <div className="px-6 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black text-sm">A</div>
          <div>
            <p className="text-white font-black text-sm">Admin</p>
            <p className="text-blue-300/40 text-[9px] font-bold uppercase tracking-widest">Ban thư ký HSV DUE</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {items.map(item => (
          <button
            key={item.key}
            onClick={() => navigate(`/admin/${item.key}`)}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-left transition-all text-[11px] font-bold
              ${activeTab === item.key
                ? 'bg-blue-600/20 text-white border border-blue-500/20'
                : 'text-blue-200/50 hover:bg-white/5 hover:text-blue-200'
              }`}
          >
            <i className={`fas ${item.icon} w-5 text-center text-xs ${activeTab === item.key ? 'text-orange-400' : ''}`}></i>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="px-6 py-4 border-t border-white/5">
        <p className="text-blue-300/30 text-[8px] font-bold uppercase tracking-widest">SV5T System v2.0</p>
      </div>
    </div>
  );
};

export default AdminSidebar;
