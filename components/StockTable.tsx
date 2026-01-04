import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { StockItem } from '../types';
import { Loader2, Cloud, Cpu, Search, Filter, ChevronDown, X, Package, TrendingUp, Calendar, Hash, DollarSign, Layers, Database } from 'lucide-react';
import { DataSourceType } from '../services/api';
import { getItemOrder } from '../data/itemOrder';
import { getCategoryOrder } from '../constants';

interface StockTableProps {
  data: StockItem[];
  loading: boolean;
  dataSource: DataSourceType;
}

type SortField = 'No' | '구분명' | '품목명[규격]' | '단가' | '전월수량' | '현재수량' | '금액';
type SortOrder = 'asc' | 'desc';

const StockTable: React.FC<StockTableProps> = ({ data, loading, dataSource }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('No');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedItem) {
        setSelectedItem(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem]);

  // 고유 카테고리 목록 추출
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(data.map(item => item.구분명))].filter(Boolean) as string[];
    return uniqueCategories.sort((a, b) => getCategoryOrder(a) - getCategoryOrder(b));
  }, [data]);

  const getNoValue = (item: StockItem): number => {
    const uniqueKey = item.유니크키;
    if (!uniqueKey) return 999999;
    return getItemOrder(uniqueKey);
  };

  // 필터링 및 정렬된 데이터
  const filteredData = useMemo(() => {
    let result = [...data];

    if (selectedCategory !== 'all') {
      result = result.filter(item => item.구분명 === selectedCategory);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        item["품목명[규격]"]?.toLowerCase().includes(term) ||
        item.구분명?.toLowerCase().includes(term) ||
        item.유니크키?.toLowerCase().includes(term)
      );
    }

    result.sort((a, b) => {
      let comparison = 0;

      if (sortField === 'No') {
        const catOrderA = getCategoryOrder(a.구분명 || '');
        const catOrderB = getCategoryOrder(b.구분명 || '');
        comparison = catOrderA - catOrderB;
        if (comparison === 0) {
          comparison = getNoValue(a) - getNoValue(b);
        }
      } else if (sortField === '구분명') {
        const catOrderA = getCategoryOrder(a.구분명 || '');
        const catOrderB = getCategoryOrder(b.구분명 || '');
        comparison = catOrderA - catOrderB;
      } else if (sortField === '현재수량' || sortField === '금액' || sortField === '단가' || sortField === '전월수량') {
        const aVal = a[sortField] || 0;
        const bVal = b[sortField] || 0;
        comparison = aVal - bVal;
      } else {
        const aVal = a[sortField] || '';
        const bVal = b[sortField] || '';
        comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [data, selectedCategory, searchTerm, sortField, sortOrder]);

  const getBadgeStyle = (status: string) => {
    if (status.includes('위험')) return 'bg-status-risk/10 text-status-risk';
    if (status.includes('안전')) return 'bg-status-safe/10 text-status-safe';
    return 'bg-zinc-700/20 text-zinc-400';
  };

  const formatAmount = (amount: number | undefined) => {
    if (amount === undefined) return '-';
    return amount.toLocaleString('ko-KR');
  };

  const formatPrice = (price: number | undefined) => {
    if (price === undefined) return '-';
    return price.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getSourceIndicator = () => {
    if (dataSource === 'SUPABASE') {
      return (
        <div className="flex items-center gap-2 text-[10px] font-mono bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded border border-indigo-500/20">
          <Cloud size={10} />
          <span>LIVE: SUPABASE</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-[10px] font-mono bg-amber-500/10 text-amber-500 px-2 py-1 rounded border border-amber-500/20">
        <Cpu size={10} />
        <span>SIMULATION</span>
      </div>
    );
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return <span className="text-agent-cyan ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  const handleRowClick = useCallback((item: StockItem) => {
    setSelectedItem(item);
  }, []);

  // 테이블 행 렌더링 (메모이제이션)
  const tableRows = useMemo(() => {
    if (filteredData.length === 0) {
      return (
        <tr>
          <td colSpan={8} className="py-10 text-center text-zinc-500 text-sm">
            {searchTerm || selectedCategory !== 'all' 
              ? '검색 결과가 없습니다.' 
              : '데이터가 없습니다.'}
          </td>
        </tr>
      );
    }
    
    return filteredData.map((item, idx) => (
      <tr 
        key={item.유니크키 || idx} 
        onClick={() => handleRowClick(item)}
        className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
      >
        <td className="py-2 px-2 text-zinc-400 text-xs text-left">
          <span className="inline-block px-1.5 py-0.5 bg-zinc-800/50 rounded text-zinc-400 text-[10px] break-keep">
            {item.구분명 || '-'}
          </span>
        </td>
        <td className="py-2 px-2 font-medium text-zinc-200 group-hover:text-agent-cyan transition-colors text-xs text-left">
          <div className="line-clamp-2 leading-snug" title={item["품목명[규격]"]}>{item["품목명[규격]"]}</div>
          {item.품목코드 && (
            <div className="text-[9px] text-zinc-500 mt-0.5 font-mono truncate" title={item.품목코드}>
              {item.품목코드}
            </div>
          )}
        </td>
        <td className="py-2 px-2 font-mono text-zinc-400 text-center whitespace-nowrap text-xs">
          {formatPrice(item.단가)}
        </td>
        <td className="py-2 px-2 font-mono text-zinc-500 text-center whitespace-nowrap text-xs">
          {item.전월수량.toLocaleString()}
        </td>
        <td className="py-2 px-2 font-mono text-zinc-300 text-center whitespace-nowrap text-xs">
          {item.현재수량.toLocaleString()}
        </td>
        <td className="py-2 px-2 font-mono text-zinc-300 text-center whitespace-nowrap text-xs">
          {formatAmount(item.금액)}
        </td>
        <td className="py-2 px-2 text-center text-[10px] text-zinc-400">
          {item.재고회전 || '-'}
        </td>
        <td className="py-2 px-2 text-center whitespace-nowrap">
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${getBadgeStyle(item.상태)}`}>
            {item.상태 || '-'}
    </span>
        </td>
      </tr>
    ));
  }, [filteredData, searchTerm, selectedCategory, handleRowClick]);

  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden flex flex-col h-full min-h-[500px] max-w-full">
      {/* Header */}
      <div className="p-4 border-b border-border bg-bg-card/50 space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-agent-cyan">Stock Master</h3>
            <span className="flex items-center gap-1.5 text-[10px] text-zinc-400 bg-zinc-800/50 px-2 py-1 rounded border border-border">
              <Database size={10} className="text-agent-cyan" />
              STOCK
            </span>
            <span className="text-[10px] font-medium bg-agent-cyan/20 text-agent-cyan px-2 py-1 rounded border border-agent-cyan/30">
              {filteredData.length.toLocaleString()}개 품목
            </span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="품목명 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-bg-body border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-agent-cyan/50"
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

          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-colors ${
                selectedCategory !== 'all' 
                  ? 'bg-agent-cyan/10 border-agent-cyan/30 text-agent-cyan' 
                  : 'bg-bg-body border-border text-zinc-400 hover:border-zinc-600'
              }`}
            >
              <Filter size={14} />
              <span className="max-w-[150px] truncate">
                {selectedCategory === 'all' ? '전체 구분명' : selectedCategory}
              </span>
              <ChevronDown size={14} className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {isFilterOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 max-h-80 overflow-y-auto bg-bg-sidebar border border-border rounded-lg shadow-xl z-50">
                <button
                  onClick={() => { setSelectedCategory('all'); setIsFilterOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors ${
                    selectedCategory === 'all' ? 'text-agent-cyan bg-agent-cyan/5' : 'text-zinc-300'
                  }`}
                >
                  전체 구분명 ({data.length})
                </button>
                <div className="border-t border-border" />
                {categories.map((cat) => {
                  const count = data.filter(item => item.구분명 === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => { setSelectedCategory(cat); setIsFilterOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors flex justify-between items-center ${
                        selectedCategory === cat ? 'text-agent-cyan bg-agent-cyan/5' : 'text-zinc-300'
                      }`}
                    >
                      <span className="truncate">{cat}</span>
                      <span className="text-xs text-zinc-500 ml-2">{count}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {(selectedCategory !== 'all' || searchTerm) && (
            <button
              onClick={() => { setSelectedCategory('all'); setSearchTerm(''); }}
              className="flex items-center gap-1 px-3 py-2 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <X size={12} />
              필터 초기화
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1 relative">
        {loading && (
          <div className="absolute inset-0 z-10 bg-bg-card/80 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-zinc-400">
              <Loader2 className="animate-spin text-agent-cyan" size={24} />
              <span className="text-sm font-medium">데이터를 불러오는 중...</span>
            </div>
          </div>
        )}
        
        <table className="w-full text-left border-collapse text-xs" style={{ minWidth: '800px' }}>
          <thead className="sticky top-0 bg-bg-card z-10">
            <tr className="bg-bg-body/50 border-b border-border">
              <th 
                onClick={() => handleSort('구분명')}
                className="px-2 py-2 font-semibold text-zinc-400 text-left cursor-pointer hover:text-white whitespace-nowrap"
                style={{ width: '110px' }}
              >
                구분명<SortIndicator field="구분명" />
              </th>
              <th 
                onClick={() => handleSort('품목명[규격]')}
                className="px-2 py-2 font-semibold text-zinc-400 text-left cursor-pointer hover:text-white whitespace-nowrap"
              >
                품목명[규격]<SortIndicator field="품목명[규격]" />
              </th>
              <th 
                onClick={() => handleSort('단가')}
                className="px-2 py-2 font-semibold text-zinc-400 text-center cursor-pointer hover:text-white whitespace-nowrap"
                style={{ width: '80px' }}
              >
                단가<SortIndicator field="단가" />
              </th>
              <th 
                onClick={() => handleSort('전월수량')}
                className="px-2 py-2 font-semibold text-zinc-400 text-center cursor-pointer hover:text-white whitespace-nowrap"
                style={{ width: '70px' }}
              >
                전월수량<SortIndicator field="전월수량" />
              </th>
              <th 
                onClick={() => handleSort('현재수량')}
                className="px-2 py-2 font-semibold text-zinc-400 text-center cursor-pointer hover:text-white whitespace-nowrap"
                style={{ width: '70px' }}
              >
                현재수량<SortIndicator field="현재수량" />
              </th>
              <th 
                onClick={() => handleSort('금액')}
                className="px-2 py-2 font-semibold text-zinc-400 text-center cursor-pointer hover:text-white whitespace-nowrap"
                style={{ width: '90px' }}
              >
                금액<SortIndicator field="금액" />
              </th>
              <th 
                className="px-2 py-2 font-semibold text-zinc-400 text-center whitespace-nowrap"
                style={{ width: '70px' }}
              >
                재고회전
              </th>
              <th 
                className="px-2 py-2 font-semibold text-zinc-400 text-center whitespace-nowrap"
                style={{ width: '50px' }}
              >
                상태
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {!loading && tableRows}
          </tbody>
        </table>
      </div>

      {/* Footer Stats */}
      <div className="p-3 border-t border-border bg-bg-card/50 flex flex-wrap justify-between items-center gap-2 text-xs text-zinc-500">
        <div className="flex items-center gap-4">
          <span>총 수량: <span className="text-zinc-300 font-mono">{filteredData.reduce((sum, item) => sum + (item.현재수량 || 0), 0).toLocaleString()}</span></span>
          <span>총 금액: <span className="text-agent-cyan font-mono">{formatAmount(filteredData.reduce((sum, item) => sum + (item.금액 || 0), 0))}</span></span>
        </div>
        <div>
          {selectedCategory !== 'all' && (
            <span className="text-agent-cyan">필터: {selectedCategory}</span>
          )}
        </div>
      </div>

      {/* 상세 정보 모달 */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="bg-bg-sidebar border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border bg-gradient-to-r from-agent-cyan/10 to-transparent">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Package size={16} className="text-agent-cyan flex-shrink-0" />
                    <span className="text-xs px-2 py-0.5 bg-zinc-800 rounded text-zinc-400">
                      {selectedItem.구분명}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white leading-tight">
                    {selectedItem["품목명[규격]"]}
                  </h3>
                  {selectedItem.품목코드 && (
                    <p className="text-xs text-zinc-500 font-mono mt-1">{selectedItem.품목코드}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors flex-shrink-0"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">재고 상태</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getBadgeStyle(selectedItem.상태)}`}>
                  {selectedItem.상태 || '-'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-bg-body rounded-xl p-3 border border-border">
                  <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
                    <Calendar size={12} />
                    전월 수량
                  </div>
                  <p className="text-xl font-mono text-zinc-400">{selectedItem.전월수량.toLocaleString()}</p>
                </div>
                <div className="bg-bg-body rounded-xl p-3 border border-agent-cyan/30">
                  <div className="flex items-center gap-2 text-agent-cyan text-xs mb-1">
                    <Layers size={12} />
                    현재 수량
                  </div>
                  <p className="text-xl font-mono text-agent-cyan font-bold">{selectedItem.현재수량.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-bg-body rounded-xl p-3 border border-border">
                  <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
                    <Hash size={12} />
                    단가
                  </div>
                  <p className="text-lg font-mono text-zinc-300">{formatPrice(selectedItem.단가)}</p>
                </div>
                <div className="bg-bg-body rounded-xl p-3 border border-orange-500/30">
                  <div className="flex items-center gap-2 text-orange-400 text-xs mb-1">
                    <DollarSign size={12} />
                    재고 금액
                  </div>
                  <p className="text-lg font-mono text-orange-400 font-bold">{formatAmount(selectedItem.금액)}</p>
                </div>
              </div>

              <div className="bg-bg-body rounded-xl p-3 border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-500 text-xs">
                    <TrendingUp size={12} />
                    재고 회전
                  </div>
                  <p className="text-sm font-medium text-zinc-300">{selectedItem.재고회전 || '-'}</p>
                </div>
              </div>

              {selectedItem.유니크키 && (
                <div className="text-xs text-zinc-600 font-mono text-center pt-2 border-t border-border/50">
                  ID: {selectedItem.유니크키}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border bg-bg-body/50">
              <button
                onClick={() => setSelectedItem(null)}
                className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-colors"
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

export default StockTable;
