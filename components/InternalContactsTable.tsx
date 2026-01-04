import React, { useState, useMemo } from 'react';
import { Loader2, Users2, Search, X, Phone, Mail, Building2 } from 'lucide-react';
import { InternalContact } from '../services/api';

interface InternalContactsTableProps {
  data: InternalContact[];
  loading: boolean;
}

const InternalContactsTable: React.FC<InternalContactsTableProps> = ({ data, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');

  // 부서 목록
  const departments = useMemo(() => {
    const depts = [...new Set(data.map(item => item.부서).filter(Boolean))];
    return depts.sort();
  }, [data]);

  // 검색 필터링
  const filteredData = useMemo(() => {
    let result = [...data];

    // 부서 필터
    if (selectedDept !== 'all') {
      result = result.filter(item => item.부서 === selectedDept);
    }

    // 검색 필터
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item =>
        item.부서?.toLowerCase().includes(term) ||
        item.직급?.toLowerCase().includes(term) ||
        item.담당자?.toLowerCase().includes(term) ||
        item.연락처?.includes(term) ||
        item.이메일?.toLowerCase().includes(term)
      );
    }

    return result;
  }, [data, selectedDept, searchTerm]);

  // 부서별 색상
  const getDeptColor = (dept: string) => {
    const colors: Record<string, string> = {
      '자재구매팀': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      '생산관리팀': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      '외주관리팀': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      '영업팀': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
      '경영지원팀': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      '품질관리팀': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    };
    return colors[dept] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
  };

  // 직급별 색상 (통일: 회색)
  const getPositionColor = (_position: string) => {
    return 'text-zinc-400';
  };

  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden flex flex-col h-full min-h-[500px]">
      {/* Header */}
      <div className="p-4 border-b border-border bg-bg-card/50 space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-cyan-400">Team Contacts</h3>
            <span className="flex items-center gap-1.5 text-[10px] text-zinc-400 bg-zinc-800/50 px-2 py-1 rounded border border-border">
              <Users2 size={10} className="text-cyan-400" />
              TEAM
            </span>
            <span className="text-[10px] font-medium bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded border border-cyan-500/30">
              담당자 {data.length}명
            </span>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="부서, 직급, 담당자, 연락처 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-bg-body border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Department Filter */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedDept('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedDept === 'all'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-bg-body border border-border text-zinc-400 hover:text-white'
              }`}
            >
              전체
            </button>
            {departments.map(dept => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedDept === dept
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-bg-body border border-border text-zinc-400 hover:text-white'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2 text-zinc-400">
              <Loader2 className="animate-spin text-cyan-400" size={24} />
              <span className="text-sm font-medium">담당자 정보를 불러오는 중...</span>
            </div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
            {searchTerm || selectedDept !== 'all' ? '검색 결과가 없습니다.' : '담당자 데이터가 없습니다.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredData.map((contact, idx) => (
              <div 
                key={idx}
                className="bg-bg-body border border-border rounded-xl p-4 hover:border-cyan-500/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white text-sm">{contact.담당자}</h4>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${getDeptColor(contact.부서)}`}>
                        {contact.부서}
                      </span>
                      {contact.직급 && (
                        <span className={`text-[10px] font-medium ${getPositionColor(contact.직급)}`}>
                          {contact.직급}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center ml-2">
                    <Building2 size={14} className="text-cyan-400" />
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  {contact.연락처 && (
                    <div className="flex items-center gap-2">
                      <Phone size={12} className="text-zinc-500" />
                      <a 
                        href={`tel:${contact.연락처}`}
                        className="text-white hover:text-zinc-300 text-xs font-mono"
                      >
                        {contact.연락처}
                      </a>
                    </div>
                  )}
                  
                  {contact.이메일 && (
                    <div className="flex items-center gap-2">
                      <Mail size={12} className="text-zinc-500" />
                      <a 
                        href={`mailto:${contact.이메일}`}
                        className="text-white hover:text-zinc-300 text-xs truncate"
                      >
                        {contact.이메일}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border bg-bg-card/50 text-xs text-zinc-500">
        <span>데이터 출처: </span>
        <a 
          href="https://docs.google.com/spreadsheets/d/1uMNcJWCN4CEF5_g5KqrgqlRhiLutk18Ousb9I8RgKJs/edit?gid=185225430"
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300"
        >
          케이원솔루션 연락처 시트
        </a>
      </div>
    </div>
  );
};

export default InternalContactsTable;
