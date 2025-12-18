import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface DashboardHeaderProps {
  lastUpdated: Date;
  onRefresh: () => void;
  toggleChat?: () => void;  // Optional - used by MobileTabBar now
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ lastUpdated, onRefresh }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    // 한국 시간으로 포맷팅
    return date.toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\. /g, '-').replace('.', '').replace(' ', ' ');
  };

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-4 mb-6 md:mb-8">
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white mb-0.5 md:mb-1">Inventory Assistant</h1>
        <p className="text-xs md:text-sm text-zinc-500">LED 조명 부품 재고 관리 시스템</p>
      </div>

      <div className="flex flex-col items-start md:items-end gap-2 md:gap-3">
        <div className="flex items-center gap-3">
          <div className="hidden md:block font-mono text-xs text-agent-cyan bg-agent-cyan/5 px-4 py-1.5 rounded-full border border-agent-cyan/10">
            {formatDate(currentTime)} KST
          </div>
        </div>
        <div className="text-[10px] text-zinc-600 font-mono flex items-center gap-2">
          <span className="hidden sm:inline">LAST SYNC:</span>
          <span className="sm:hidden">SYNC:</span>
          {formatDate(lastUpdated)}
          <button onClick={onRefresh} className="hover:text-agent-cyan transition-colors p-1">
            <RefreshCw size={12} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;