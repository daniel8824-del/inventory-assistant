import React from 'react';
import { LayoutDashboard, Database, History, MessageCircle, MoreHorizontal, Sparkles, Users, CreditCard, Users2, Package, ShoppingCart, ExternalLink, X } from 'lucide-react';
import { PageType } from '../App';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { N8N_FORM_URLS } from '../constants';

interface MobileTabBarProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  onChatToggle: () => void;
  isChatOpen: boolean;
}

const MobileTabBar: React.FC<MobileTabBarProps> = ({ currentPage, onPageChange, onChatToggle, isChatOpen }) => {
  const [isMoreOpen, setIsMoreOpen] = React.useState(false);
  const { hasRole } = useAuth();
  const { isDark } = useTheme();
  
  // viewer가 아닌 경우에만 Quick Actions, 챗봇 사용 가능
  const canEdit = hasRole(['admin', 'manager']);

  const mainTabs = [
    { id: 'dashboard' as PageType, label: '대시보드', icon: LayoutDashboard },
    { id: 'stockMaster' as PageType, label: '재고', icon: Database },
    { id: 'dealHistory' as PageType, label: '거래', icon: History },
  ];

  const moreTabs = [
    { id: 'newItems' as PageType, label: 'New Items', icon: Sparkles, color: 'text-emerald-400' },
    { id: 'teamContacts' as PageType, label: 'Team Contacts', icon: Users2, color: 'text-violet-400' },
    { id: 'contacts' as PageType, label: 'Sales Contacts', icon: Users, color: 'text-violet-400' },
    { id: 'receivables' as PageType, label: 'Receivables', icon: CreditCard, color: 'text-violet-400' },
  ];

  const openForm = (formType: 'inventory' | 'deal') => {
    const themeParam = isDark ? 'dark' : 'light';
    const url = `${N8N_FORM_URLS[formType]}?theme=${themeParam}`;
    window.open(url, '_blank');
    setIsMoreOpen(false);
  };

  const handlePageChange = (page: PageType) => {
    onPageChange(page);
    setIsMoreOpen(false);
  };

  return (
    <>
      {/* More Menu Overlay */}
      {isMoreOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsMoreOpen(false)}
        />
      )}

      {/* More Menu Panel */}
      {isMoreOpen && (
        <div className="fixed bottom-16 left-0 right-0 bg-bg-sidebar border-t border-border rounded-t-2xl z-50 lg:hidden animate-slide-up">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">메뉴</span>
              <button 
                onClick={() => setIsMoreOpen(false)}
                className="p-1 text-zinc-500 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Pages */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {moreTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handlePageChange(tab.id)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                    currentPage === tab.id
                      ? 'bg-agent-cyan/10 text-agent-cyan'
                      : 'text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  <tab.icon size={20} className={currentPage === tab.id ? 'text-agent-cyan' : tab.color} />
                  <span className="text-[10px] font-medium text-center leading-tight">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Quick Actions - admin, manager만 표시 */}
            {canEdit && (
              <div className="border-t border-border pt-4">
                <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-3 block">빠른 작업</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => openForm('inventory')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  >
                    <Package size={18} />
                    <span className="text-sm font-medium">재고 등록</span>
                    <ExternalLink size={12} />
                  </button>
                  <button 
                    onClick={() => openForm('deal')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/30"
                  >
                    <ShoppingCart size={18} />
                    <span className="text-sm font-medium">거래 등록</span>
                    <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-bg-sidebar/95 backdrop-blur-lg border-t border-border z-40 lg:hidden safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {mainTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handlePageChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all ${
                currentPage === tab.id
                  ? 'text-agent-cyan'
                  : 'text-zinc-500'
              }`}
            >
              <tab.icon size={22} strokeWidth={currentPage === tab.id ? 2.5 : 2} />
              <span className={`text-[10px] font-medium ${currentPage === tab.id ? 'font-bold' : ''}`}>
                {tab.label}
              </span>
              {currentPage === tab.id && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-agent-cyan" />
              )}
            </button>
          ))}

          {/* Chat Button - 모든 사용자에게 표시 */}
          <button
            onClick={onChatToggle}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all ${
              isChatOpen ? 'text-agent-cyan' : 'text-zinc-500'
            }`}
          >
            <div className="relative">
              <MessageCircle size={22} strokeWidth={isChatOpen ? 2.5 : 2} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-agent-cyan rounded-full animate-pulse" />
            </div>
            <span className={`text-[10px] font-medium ${isChatOpen ? 'font-bold' : ''}`}>
              채팅
            </span>
          </button>

          {/* More Button */}
          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all ${
              isMoreOpen ? 'text-agent-cyan' : 'text-zinc-500'
            }`}
          >
            <MoreHorizontal size={22} strokeWidth={isMoreOpen ? 2.5 : 2} />
            <span className={`text-[10px] font-medium ${isMoreOpen ? 'font-bold' : ''}`}>
              더보기
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default MobileTabBar;

