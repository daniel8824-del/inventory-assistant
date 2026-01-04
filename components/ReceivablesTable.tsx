import React, { useState, useMemo, useEffect } from 'react';
import { Loader2, Search, X, MessageSquare, CreditCard } from 'lucide-react';
import { ContactItem } from '../services/api';

interface ReceivablesTableProps {
  data: ContactItem[];
  loading: boolean;
}

const ReceivablesTable: React.FC<ReceivablesTableProps> = ({ data, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMemo, setSelectedMemo] = useState<{ 거래처명: string; 품명: string; 비고: string } | null>(null);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedMemo) {
        setSelectedMemo(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedMemo]);

  // 검색 필터링
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    const term = searchTerm.toLowerCase();
    return data.filter(item =>
      item.거래처명?.toLowerCase().includes(term) ||
      item.품명?.toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  // 통계
  const stats = useMemo(() => {
    const uniqueCustomers = new Set(data.map(item => item.거래처명)).size;
    const totalSupply = data.reduce((sum, item) => sum + (item.공급가액 || 0), 0);
    const totalAmount = data.reduce((sum, item) => sum + (item.합계금액 || 0), 0);
    return { uniqueCustomers, totalSupply, totalAmount, count: data.length };
  }, [data]);

  const formatAmount = (amount: number) => {
    if (!amount) return '-';
    return amount.toLocaleString('ko-KR');
  };

  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden flex flex-col h-full min-h-[500px]">
      {/* Header */}
      <div className="p-4 border-b border-border bg-bg-card/50 space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-amber-400">Receivables</h3>
            <span className="flex items-center gap-1.5 text-[10px] text-zinc-400 bg-zinc-800/50 px-2 py-1 rounded border border-border">
              <CreditCard size={10} className="text-amber-400" />
              RECEIVABLE
            </span>
            <span className="text-[10px] font-medium bg-amber-500/20 text-amber-400 px-2 py-1 rounded border border-amber-500/30">
              미수금 {stats.count}건
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-bg-body border border-border rounded-lg p-3">
            <div className="text-[10px] text-zinc-500 mb-1">거래처수</div>
            <div className="text-sm font-mono font-semibold text-zinc-200">{stats.uniqueCustomers}개</div>
          </div>
          <div className="bg-bg-body border border-border rounded-lg p-3">
            <div className="text-[10px] text-zinc-500 mb-1">거래건수</div>
            <div className="text-sm font-mono font-semibold text-zinc-200">{stats.count}건</div>
          </div>
          <div className="bg-bg-body border border-border rounded-lg p-3">
            <div className="text-[10px] text-zinc-500 mb-1">총 공급가액</div>
            <div className="text-sm font-mono font-semibold text-zinc-200">{formatAmount(stats.totalSupply)}원</div>
          </div>
          <div className="bg-bg-body border border-amber-500/30 rounded-lg p-3">
            <div className="text-[10px] text-zinc-500 mb-1">총 미수금 (합계)</div>
            <div className="text-sm font-mono font-semibold text-amber-400">{formatAmount(stats.totalAmount)}원</div>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="거래처명, 품명 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-bg-body border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-500/50"
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

      {/* Table */}
      <div className="overflow-x-auto flex-1 relative">
        {loading && (
          <div className="absolute inset-0 z-10 bg-bg-card/80 flex items-center justify-center backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2 text-zinc-400">
              <Loader2 className="animate-spin text-amber-400" size={24} />
              <span className="text-sm font-medium">데이터를 불러오는 중...</span>
            </div>
          </div>
        )}
        
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 bg-bg-card z-10">
            <tr className="bg-bg-body/50 border-b border-border">
              <th className="px-3 py-2 font-semibold text-zinc-400 text-center whitespace-nowrap">거래일</th>
              <th className="px-3 py-2 font-semibold text-zinc-400 text-center whitespace-nowrap">계산서일자</th>
              <th className="px-3 py-2 font-semibold text-zinc-400 text-center whitespace-nowrap w-[80px]">거래처</th>
              <th className="px-3 py-2 font-semibold text-zinc-400 text-left max-w-[250px]">품명</th>
              <th className="px-3 py-2 font-semibold text-zinc-400 text-center whitespace-nowrap">공급가액</th>
              <th className="px-3 py-2 font-semibold text-zinc-400 text-center whitespace-nowrap">합계금액</th>
              <th className="px-3 py-2 font-semibold text-zinc-400 text-center min-w-[80px]">비고</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filteredData.length === 0 && !loading ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-zinc-500 text-sm">
                  {searchTerm ? '검색 결과가 없습니다.' : '미수금 데이터가 없습니다.'}
                </td>
              </tr>
            ) : (
              filteredData.map((item, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors text-xs">
                  <td className="px-3 py-2 font-mono text-xs text-zinc-500 text-center whitespace-nowrap">
                    {item.거래일시 || '-'}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-zinc-500 text-center whitespace-nowrap">
                    {item.계산서일자 || '-'}
                  </td>
                  <td className="px-3 py-2 font-medium text-zinc-200 text-center whitespace-nowrap w-[80px]">
                    {item.거래처명 || '-'}
                  </td>
                  <td className="px-3 py-2 text-zinc-300 text-left max-w-[250px]">
                    <div className="leading-snug">
                      {item.품명 ? item.품명.split(',').map((part, i) => (
                        <div key={i}>{part.trim()}</div>
                      )) : '-'}
                    </div>
                  </td>
                  <td className="px-3 py-2 font-mono text-zinc-300 text-center whitespace-nowrap">
                    {formatAmount(item.공급가액)}
                  </td>
                  <td className="px-3 py-2 font-mono text-rose-400 text-center whitespace-nowrap font-semibold">
                    {formatAmount(item.합계금액)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {item.비고 ? (
                      <button
                        onClick={() => setSelectedMemo({ 거래처명: item.거래처명, 품명: item.품명, 비고: item.비고 })}
                        className="p-1 rounded hover:bg-amber-500/20 transition-colors"
                        title="비고 보기"
                      >
                        <MessageSquare size={12} className="text-amber-400" />
                      </button>
                    ) : (
                      <span className="text-zinc-600">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border bg-bg-card/50 text-xs text-zinc-500">
        <span>데이터 출처: </span>
        <a 
          href="https://docs.google.com/spreadsheets/d/1uMNcJWCN4CEF5_g5KqrgqlRhiLutk18Ousb9I8RgKJs/edit?gid=0"
          target="_blank"
          rel="noopener noreferrer"
          className="text-rose-400 hover:text-rose-300"
        >
          케이원솔루션 미수금 시트
        </a>
      </div>

      {/* 비고 모달 */}
      {selectedMemo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setSelectedMemo(null)}
        >
          <div 
            className="bg-bg-sidebar border border-border rounded-xl w-full max-w-md shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border bg-gradient-to-r from-amber-500/10 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-amber-400" />
                  <span className="text-sm font-semibold text-white">비고</span>
                </div>
                <button
                  onClick={() => setSelectedMemo(null)}
                  className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <div className="text-[10px] text-zinc-500 mb-1">거래처</div>
                <div className="text-sm text-zinc-200">{selectedMemo.거래처명}</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500 mb-1">품명</div>
                <div className="text-xs text-zinc-300 leading-relaxed">
                  {selectedMemo.품명?.split(',').map((part, i) => (
                    <div key={i}>{part.trim()}</div>
                  ))}
                </div>
              </div>
              <div className="pt-2 border-t border-border">
                <div className="text-[10px] text-amber-400 mb-1">비고 내용</div>
                <div className="text-sm text-white bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 whitespace-pre-line">
                  {(() => {
                    let text = selectedMemo.비고
                      ?.replace(/차감,\s*/g, '차감,\n')
                      ?.replace(/잔액/g, '\n잔액')
                      ?.replace(/\n\s*\n/g, '\n');
                    if (!text) return null;
                    const lastIdx = text.lastIndexOf('잔액');
                    if (lastIdx === -1) return text;
                    const before = text.slice(0, lastIdx);
                    const after = text.slice(lastIdx);
                    return (
                      <>
                        {before}
                        <span className="text-rose-400 font-semibold">{after}</span>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-border bg-bg-body/50">
              <button
                onClick={() => setSelectedMemo(null)}
                className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceivablesTable;
