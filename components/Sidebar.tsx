import React, { useState } from 'react';
import { LayoutDashboard, Database, History, Package, ShoppingCart, Cpu, ExternalLink, Sparkles, Users, CreditCard, Users2, LogOut, Clock, Sun, Moon, ChevronRight } from 'lucide-react';
import { PageType } from '../App';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { N8N_FORM_URLS } from '../constants';

interface SidebarProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
}

// 메뉴별 색상 설정
const menuColors: Record<string, { icon: string; active: string; border: string }> = {
  dashboard: { icon: 'text-cyan-400', active: 'bg-cyan-500/10', border: 'border-cyan-500' },
  stockMaster: { icon: 'text-cyan-400', active: 'bg-cyan-500/10', border: 'border-cyan-500' },
  newItems: { icon: 'text-emerald-400', active: 'bg-emerald-500/10', border: 'border-emerald-500' },
  dealHistory: { icon: 'text-orange-400', active: 'bg-orange-500/10', border: 'border-orange-500' },
  activityLogs: { icon: 'text-rose-400', active: 'bg-rose-500/10', border: 'border-rose-500' },
  teamContacts: { icon: 'text-cyan-400', active: 'bg-cyan-500/10', border: 'border-cyan-500' },
  contacts: { icon: 'text-violet-400', active: 'bg-violet-500/10', border: 'border-violet-500' },
  receivables: { icon: 'text-amber-400', active: 'bg-amber-500/10', border: 'border-amber-500' },
};

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const { user, logout, hasRole } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  
  // viewer가 아닌 경우에만 Quick Actions 표시
  const canEdit = hasRole(['admin', 'manager']);
  
  // 서브메뉴 열림 상태
  const [openSubmenu, setOpenSubmenu] = useState<'inventory' | 'deal' | null>(null);
  
  const inventoryMenuItems = [
    { id: 'dashboard' as PageType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'stockMaster' as PageType, label: 'Stock Master', icon: Database },
    { id: 'newItems' as PageType, label: 'New Items', icon: Sparkles },
    { id: 'dealHistory' as PageType, label: 'Deal History', icon: History },
  ];

  const customerMenuItems = [
    { id: 'teamContacts' as PageType, label: 'Team Contacts', icon: Users2 },
    { id: 'contacts' as PageType, label: 'Sales Contacts', icon: Users },
    { id: 'receivables' as PageType, label: 'Receivables', icon: CreditCard },
  ];

  const openForm = (formType: 'inventory' | 'deal' | 'ecobInventory' | 'ecobDeal') => {
    const width = 520;
    const height = 750;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    // 테마 파라미터를 URL에 추가
    const themeParam = isDark ? 'dark' : 'light';
    const url = `${N8N_FORM_URLS[formType]}?theme=${themeParam}`;
    
    window.open(
      url,
      `${formType}Form`,
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );
    
    // 서브메뉴 닫기
    setOpenSubmenu(null);
  };
  
  // 서브메뉴 토글
  const toggleSubmenu = (menu: 'inventory' | 'deal') => {
    setOpenSubmenu(openSubmenu === menu ? null : menu);
  };

  const getMenuStyle = (id: string, isActive: boolean) => {
    const colors = menuColors[id] || menuColors.dashboard;
    if (isActive) {
      return `${colors.active} text-white border-l-2 ${colors.border}`;
    }
    return 'text-zinc-500 hover:text-white hover:bg-zinc-900 border-l-2 border-transparent';
  };

  const getIconColor = (id: string, isActive: boolean) => {
    const colors = menuColors[id] || menuColors.dashboard;
    return isActive ? colors.icon : '';
  };

  return (
    <aside className="h-full bg-bg-sidebar border-r border-border px-3 pt-5 pb-4 flex flex-col">
      <div className="pb-3 border-b border-border mb-5">
        <div className="flex items-center gap-2.5 mt-[25px] font-mono font-extrabold text-sm tracking-wide">
          <div className="w-7 h-7 rounded-lg bg-agent-cyan flex items-center justify-center text-black shadow-[0_0_10px_rgba(6,182,212,0.2)]">
            <Cpu size={14} strokeWidth={2.5} />
          </div>
          <span className="text-agent-cyan">K1 Solution</span>
        </div>
      </div>

      <nav className="flex-1">
        <div className="mb-5">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block mb-3 px-1">
            Inventory Control
          </span>
          <ul className="space-y-0.5">
            {inventoryMenuItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onPageChange(item.id)}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all ${getMenuStyle(item.id, isActive)}`}
                  >
                    <item.icon size={14} />
                    <span className="text-xs font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
            {/* Activity Logs - admin만 표시 */}
            {hasRole(['admin']) && (
              <li>
                <button
                  onClick={() => onPageChange('activityLogs')}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all ${getMenuStyle('activityLogs', currentPage === 'activityLogs')}`}
                >
                  <Clock size={14} />
                  <span className="text-xs font-medium">Activity Logs</span>
                </button>
              </li>
            )}
          </ul>
        </div>

        <div className="mb-5">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block mb-3 px-1">
            Message Control
          </span>
          <ul className="space-y-0.5">
            {customerMenuItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onPageChange(item.id)}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all ${getMenuStyle(item.id, isActive)}`}
                  >
                    <item.icon size={14} />
                    <span className="text-xs font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Quick Actions - admin, manager만 표시 */}
        {canEdit && (
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block mb-3 px-1">
              Quick Actions
            </span>
            <ul className="space-y-0.5">
              {/* 재고 등록 (서브메뉴) */}
              <li className="relative">
                <button 
                  onClick={() => toggleSubmenu('inventory')}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all ${
                    openSubmenu === 'inventory' 
                      ? 'bg-cyan-500/10 text-cyan-400' 
                      : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <Package size={14} className="text-zinc-500" />
                  <span className="text-xs font-medium">New Stock</span>
                  <ChevronRight size={12} className={`ml-auto transition-transform ${openSubmenu === 'inventory' ? 'rotate-90' : ''}`} />
                </button>
                {/* 서브메뉴 */}
                {openSubmenu === 'inventory' && (
                  <div className="ml-4 mt-1 space-y-0.5 border-l border-border pl-2">
                    <button 
                      onClick={() => openForm('inventory')}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all text-xs"
                    >
                      <Package size={10} className="text-emerald-500" />
                      K1
                      <ExternalLink size={9} className="ml-auto opacity-50" />
                    </button>
                    <button 
                      onClick={() => openForm('ecobInventory')}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-zinc-400 hover:text-pink-400 hover:bg-pink-500/5 transition-all text-xs"
                    >
                      <Package size={10} className="text-pink-500" />
                      EcoB
                      <ExternalLink size={9} className="ml-auto opacity-50" />
                    </button>
                  </div>
                )}
              </li>
              
              {/* 거래 등록 (서브메뉴) */}
              <li className="relative">
                <button 
                  onClick={() => toggleSubmenu('deal')}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all ${
                    openSubmenu === 'deal' 
                      ? 'bg-cyan-500/10 text-cyan-400' 
                      : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <ShoppingCart size={14} className="text-zinc-500" />
                  <span className="text-xs font-medium">New Deal</span>
                  <ChevronRight size={12} className={`ml-auto transition-transform ${openSubmenu === 'deal' ? 'rotate-90' : ''}`} />
                </button>
                {/* 서브메뉴 */}
                {openSubmenu === 'deal' && (
                  <div className="ml-4 mt-1 space-y-0.5 border-l border-border pl-2">
                    <button 
                      onClick={() => openForm('deal')}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-zinc-400 hover:text-orange-400 hover:bg-orange-500/5 transition-all text-xs"
                    >
                      <ShoppingCart size={10} className="text-orange-500" />
                      K1
                      <ExternalLink size={9} className="ml-auto opacity-50" />
                    </button>
                    <button 
                      onClick={() => openForm('ecobDeal')}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-zinc-400 hover:text-blue-400 hover:bg-blue-500/5 transition-all text-xs"
                    >
                      <ShoppingCart size={10} className="text-blue-500" />
                      EcoB
                      <ExternalLink size={9} className="ml-auto opacity-50" />
                    </button>
                  </div>
                )}
              </li>
            </ul>
          </div>
        )}

      </nav>

      <div className="mt-auto space-y-2">
        {/* 테마 토글 - 슬라이더 스타일 */}
        <div 
          onClick={toggleTheme}
          className="flex items-center bg-zinc-800 border border-border rounded-full p-0.5 cursor-pointer relative"
          style={{ width: '52px' }}
        >
          {/* 슬라이딩 인디케이터 */}
          <div 
            className={`absolute w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ease-in-out ${
              isDark ? 'left-0.5' : 'left-[calc(100%-26px)]'
            }`}
          />
          {/* 달 아이콘 (다크) */}
          <div className={`w-6 h-6 flex items-center justify-center z-10 transition-colors duration-300 ${
            isDark ? 'text-zinc-800' : 'text-zinc-400'
          }`}>
            <Moon size={12} />
          </div>
          {/* 해 아이콘 (라이트) */}
          <div className={`w-6 h-6 flex items-center justify-center z-10 transition-colors duration-300 ${
            !isDark ? 'text-amber-500' : 'text-zinc-500'
          }`}>
            <Sun size={12} />
          </div>
        </div>

        {/* 사용자 정보 */}
        {user && (
          <div className="bg-white/5 border border-border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] text-white font-medium truncate">{user.email}</span>
              <span className="text-[9px] text-zinc-500">
                {user.role === 'admin' ? '관리자' : user.role === 'manager' ? '매니저' : '뷰어'}
              </span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-rose-400 transition-colors"
            >
              <LogOut size={10} />
              <span>로그아웃</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
