import React, { useState, useMemo } from 'react';
import { Loader2, Users, Search, X, Phone, Mail, ExternalLink } from 'lucide-react';
import { ContactItem } from '../services/api';

interface ContactsTableProps {
  data: ContactItem[];
  loading: boolean;
}

const ContactsTable: React.FC<ContactsTableProps> = ({ data, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // 고유 거래처별로 그룹화 (가장 최근 데이터 기준)
  const uniqueContacts = useMemo(() => {
    const contactMap = new Map<string, ContactItem>();
    
    data.forEach(item => {
      if (item.거래처명 && item.담당자) {
        const key = `${item.거래처명}-${item.담당자}`;
        if (!contactMap.has(key)) {
          contactMap.set(key, item);
        }
      }
    });
    
    return Array.from(contactMap.values());
  }, [data]);

  // 검색 필터링
  const filteredData = useMemo(() => {
    if (!searchTerm) return uniqueContacts;
    
    const term = searchTerm.toLowerCase();
    return uniqueContacts.filter(item =>
      item.거래처명?.toLowerCase().includes(term) ||
      item.담당자?.toLowerCase().includes(term) ||
      item.담당자연락처?.includes(term) ||
      item.담당자이메일?.toLowerCase().includes(term)
    );
  }, [uniqueContacts, searchTerm]);

  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden flex flex-col h-full min-h-[500px]">
      {/* Header */}
      <div className="p-4 border-b border-border bg-bg-card/50 space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-violet-400" />
              <h3 className="text-base font-semibold text-zinc-200">Sales Contacts</h3>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono bg-violet-500/10 text-violet-400 px-2 py-1 rounded border border-violet-500/20">
              <span>{uniqueContacts.length}개 거래처</span>
            </div>
          </div>
          <div className="text-xs text-zinc-500 font-mono">
            {filteredData.length} / {uniqueContacts.length} 연락처
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="거래처명, 담당자, 연락처 검색..."
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
                    <p className="text-xs text-zinc-500 mt-0.5">{contact.적요품목}</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <Users size={14} className="text-violet-400" />
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="text-zinc-500 text-xs w-12">담당자</span>
                    <span className="font-medium">{contact.담당자}</span>
                  </div>
                  
                  {contact.담당자연락처 && (
                    <div className="flex items-center gap-2">
                      <Phone size={12} className="text-zinc-500" />
                      <a 
                        href={`tel:${contact.담당자연락처}`}
                        className="text-violet-400 hover:text-violet-300 text-xs font-mono"
                      >
                        {contact.담당자연락처}
                      </a>
                    </div>
                  )}
                  
                  {contact.담당자이메일 && (
                    <div className="flex items-center gap-2">
                      <Mail size={12} className="text-zinc-500" />
                      <a 
                        href={`mailto:${contact.담당자이메일}`}
                        className="text-violet-400 hover:text-violet-300 text-xs truncate"
                      >
                        {contact.담당자이메일}
                      </a>
                    </div>
                  )}
                </div>

                {contact.미수잔액 > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500">미수잔액</span>
                      <span className="text-rose-400 font-mono font-semibold">
                        {contact.미수잔액.toLocaleString()}원
                      </span>
                    </div>
                  </div>
                )}
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

