import React, { useState, useMemo } from 'react';
import { Loader2, Users, Search, X, Phone, Mail, User } from 'lucide-react';
import { ContactItem } from '../services/api';

interface ContactsTableProps {
  data: ContactItem[];
  loading: boolean;
}

// 거래처별 그룹화 데이터 타입
interface GroupedContact {
  거래처명: string;
  위치: string;
  담당자: string;
  담당자연락처: string;
  담당자이메일: string;
  총합계금액: number;
}

const ContactsTable: React.FC<ContactsTableProps> = ({ data, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // 거래처명별로 그룹화하고 합계금액 합산
  const uniqueContacts = useMemo(() => {
    const contactMap = new Map<string, GroupedContact>();
    
    data.forEach(item => {
      if (item.거래처명) {
        const key = item.거래처명;
        if (contactMap.has(key)) {
          // 기존 거래처가 있으면 합계금액 합산
          const existing = contactMap.get(key)!;
          existing.총합계금액 += item.합계금액 || 0;
          // 담당자 정보가 없으면 새로 채우기
          if (!existing.담당자 && item.담당자) existing.담당자 = item.담당자;
          if (!existing.담당자연락처 && item.담당자연락처) existing.담당자연락처 = item.담당자연락처;
          if (!existing.담당자이메일 && item.담당자이메일) existing.담당자이메일 = item.담당자이메일;
          if (!existing.위치 && item.위치) existing.위치 = item.위치;
        } else {
          // 새 거래처 추가
          contactMap.set(key, {
            거래처명: item.거래처명,
            위치: item.위치 || '',
            담당자: item.담당자 || '',
            담당자연락처: item.담당자연락처 || '',
            담당자이메일: item.담당자이메일 || '',
            총합계금액: item.합계금액 || 0,
          });
        }
      }
    });
    
    // 거래처명 기준 정렬
    return Array.from(contactMap.values()).sort((a, b) => a.거래처명.localeCompare(b.거래처명));
  }, [data]);

  // 검색 필터링
  const filteredData = useMemo(() => {
    if (!searchTerm) return uniqueContacts;
    
    const term = searchTerm.toLowerCase();
    return uniqueContacts.filter(item =>
      item.거래처명?.toLowerCase().includes(term) ||
      item.위치?.toLowerCase().includes(term) ||
      item.담당자?.toLowerCase().includes(term) ||
      item.담당자연락처?.includes(term) ||
      item.담당자이메일?.toLowerCase().includes(term)
    );
  }, [uniqueContacts, searchTerm]);

  // 금액 포맷
  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ko-KR');
  };

  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden flex flex-col h-full min-h-[500px]">
      {/* Header */}
      <div className="p-4 border-b border-border bg-bg-card/50 space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-violet-400">Sales Contacts</h3>
            <span className="flex items-center gap-1.5 text-[10px] text-zinc-400 bg-zinc-800/50 px-2 py-1 rounded border border-border">
              <Users size={10} className="text-violet-400" />
              SALES
            </span>
            <span className="text-[10px] font-medium bg-violet-500/20 text-violet-400 px-2 py-1 rounded border border-violet-500/30">
              거래처 {uniqueContacts.length}개
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="거래처명, 위치, 담당자, 연락처 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-bg-body border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50"
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
      </div>

      {/* Cards Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2 text-zinc-400">
              <Loader2 className="animate-spin text-violet-400" size={24} />
              <span className="text-sm font-medium">연락처를 불러오는 중...</span>
            </div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
            {searchTerm ? '검색 결과가 없습니다.' : '연락처 데이터가 없습니다.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredData.map((contact, idx) => (
              <div 
                key={idx}
                className="bg-bg-body border border-border rounded-xl p-4 hover:border-violet-500/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-white text-sm">{contact.거래처명}</h4>
                    {contact.위치 && (
                      <p className="text-xs text-zinc-400 mt-0.5">{contact.위치}</p>
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <Users size={14} className="text-violet-400" />
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <User size={12} className="text-zinc-500" />
                    <span className="font-medium">{contact.담당자 || '-'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone size={12} className="text-zinc-500" />
                    {contact.담당자연락처 ? (
                      <a 
                        href={`tel:${contact.담당자연락처}`}
                        className="text-white hover:text-zinc-300 text-xs font-mono"
                      >
                        {contact.담당자연락처}
                      </a>
                    ) : (
                      <span className="text-zinc-500 text-xs">-</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Mail size={12} className="text-zinc-500" />
                    {contact.담당자이메일 ? (
                      <a 
                        href={`mailto:${contact.담당자이메일}`}
                        className="text-white hover:text-zinc-300 text-xs truncate"
                      >
                        {contact.담당자이메일}
                      </a>
                    ) : (
                      <span className="text-zinc-500 text-xs">-</span>
                    )}
                  </div>
                </div>

                {/* 총 합계금액 */}
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">총 합계금액</span>
                    <span className="text-violet-400 font-mono font-semibold">
                      {formatAmount(contact.총합계금액)}원
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer - 데이터 출처 */}
      <div className="p-3 border-t border-border bg-bg-card/50 text-xs text-zinc-500">
        <span>데이터 출처: </span>
        <a 
          href="https://docs.google.com/spreadsheets/d/1uMNcJWCN4CEF5_g5KqrgqlRhiLutk18Ousb9I8RgKJs/edit?gid=0"
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-400 hover:text-violet-300"
        >
          케이원솔루션 미수금 시트
        </a>
      </div>
    </div>
  );
};

export default ContactsTable;

