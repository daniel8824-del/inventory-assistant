import React, { useState, useMemo } from 'react';
import { StockItem } from '../types';
import { Loader2, Cloud, Cpu, Search, Filter, ChevronDown, X, Calendar, Sparkles } from 'lucide-react';
import { DataSourceType } from '../services/api';
import { ITEM_ORDER } from '../data/itemOrder';
import { getCategoryOrder } from '../constants';

interface NewItemsTableProps {
  data: StockItem[];
  loading: boolean;
  dataSource: DataSourceType;
}

type SortField = '구분명' | '품목명[규격]' | '단가' | '전월수량' | '현재수량' | '금액' | 'updated_at';
type SortOrder = 'asc' | 'desc';

// 월 옵션 생성 (최근 12개월)
const getMonthOptions = () => {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
    options.push({ value, label });
  }
  
  return options;
};

const NewItemsTable: React.FC<NewItemsTableProps> = ({ data, loading, dataSource }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  // 기본값: 현재 월
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());
  const [sortField, setSortField] = useState<SortField>('updated_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMonthFilterOpen, setIsMonthFilterOpen] = useState(false);

  const monthOptions = useMemo(() => getMonthOptions(), []);

  // 신규 품목만 필터링 (ITEM_ORDER에 없는 유니크키)
  const newItemsOnly = useMemo(() => {
    return data.filter(item => {
      const uniqueKey = item.유니크키 || item["품목명[규격]"];
      return !(uniqueKey in ITEM_ORDER);
    });
  }, [data]);

  // 고유 카테고리 목록 추출
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(newItemsOnly.map(item => item.구분명))].filter(Boolean) as string[];
    return uniqueCategories.sort((a, b) => getCategoryOrder(a) - getCategoryOrder(b));
  }, [newItemsOnly]);

  // 필터링 및 정렬된 데이터
  const filteredData = useMemo(() => {
    let result = [...newItemsOnly];

    // 월별 필터 (항상 적용)
    // updated_at이 없으면 현재 월로 간주하여 포함
    result = result.filter(item => {
      if (!item.updated_at) return true; // updated_at 없으면 항상 표시
      const itemMonth = item.updated_at.substring(0, 7); // "YYYY-MM"
      return itemMonth === selectedMonth;
    });

    // 카테고리 필터
    if (selectedCategory !== 'all') {
      result = result.filter(item => item.구분명 === selectedCategory);
    }

    // 검색 필터
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        item["품목명[규격]"]?.toLowerCase().includes(term) ||
        item.구분명?.toLowerCase().includes(term) ||
        item.유니크키?.toLowerCase().includes(term)
      );
    }

    // 정렬
    result.sort((a, b) => {
      let comparison = 0;

      if (sortField === 'updated_at') {
        const aVal = a.updated_at || '';
        const bVal = b.updated_at || '';
        comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
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
  }, [newItemsOnly, selectedCategory, selectedMonth, searchTerm, sortField, sortOrder]);

  const formatAmount = (amount: number | undefined) => {
    if (amount === undefined) return '-';
    return amount.toLocaleString('ko-KR');
  };

  const formatPrice = (price: number | undefined) => {
    if (price === undefined) return '-';
    return price.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '-';
    // "2025-12-18 11:54:07.30382" → "2025-12-18" (날짜만 표시)
    return dateStr.split(' ')[0].split('T')[0];
  };

  const getBadgeStyle = (status: string) => {
    if (status.includes('위험')) return 'bg-status-risk/10 text-status-risk';
    if (status.includes('안전')) return 'bg-status-safe/10 text-status-safe';
    return 'bg-zinc-700/20 text-zinc-400';
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
      setSortOrder(field === 'updated_at' ? 'desc' : 'asc');
    }
  };

  const SortIndicator = ({ field }: { field: SortField }) => (
    <span className={`ml-1 text-[10px] ${sortField === field ? 'text-amber-400' : 'text-zinc-600'}`}>
      {sortField === field ? (sortOrder === 'asc' ? '▲' : '▼') : '○'}
    </span>
  );

  const selectedMonthLabel = monthOptions.find(m => m.value === selectedMonth)?.label || selectedMonth;

  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden flex flex-col h-full min-h-[500px]">
      {/* Header */}
      <div className="p-4 border-b border-border bg-bg-card/50 space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-amber-400" />
              <h3 className="text-base font-semibold text-zinc-200">New Items</h3>
            </div>
            {getSourceIndicator()}
            <div className="flex items-center gap-2 text-[10px] font-mono bg-amber-500/10 text-amber-400 px-2 py-1 rounded border border-amber-500/20">
              <span>신규 {newItemsOnly.length}개</span>
            </div>
          </div>
          <div className="text-xs text-zinc-500 font-mono">
            {filteredData.length.toLocaleString()} / {newItemsOnly.length.toLocaleString()} 품목
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="품목명 검색..."
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

          {/* Month Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsMonthFilterOpen(!isMonthFilterOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-colors ${
                selectedMonth !== 'all' 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                  : 'bg-bg-body border-border text-zinc-400 hover:border-zinc-600'
              }`}
            >
              <Calendar size={14} />
              <span className="max-w-[120px] truncate">{selectedMonthLabel}</span>
              <ChevronDown size={14} className={`transition-transform ${isMonthFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {isMonthFilterOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 max-h-80 overflow-y-auto bg-bg-sidebar border border-border rounded-lg shadow-xl z-50">
                {monthOptions.map((month) => (
                  <button
                    key={month.value}
                    onClick={() => { setSelectedMonth(month.value); setIsMonthFilterOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors ${
                      selectedMonth === month.value ? 'text-amber-400 bg-amber-500/5' : 'text-zinc-300'
                    }`}
                  >
                    {month.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-colors ${
                selectedCategory !== 'all' 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
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
                    selectedCategory === 'all' ? 'text-amber-400 bg-amber-500/5' : 'text-zinc-300'
                  }`}
                >
                  전체 구분명 ({newItemsOnly.length})
                </button>
                <div className="border-t border-border" />
                {categories.map((cat) => {
                  const count = newItemsOnly.filter(item => item.구분명 === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => { setSelectedCategory(cat); setIsFilterOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors flex justify-between items-center ${
                        selectedCategory === cat ? 'text-amber-400 bg-amber-500/5' : 'text-zinc-300'
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

          {/* Clear Filters */}
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
          <div className="absolute inset-0 z-10 bg-bg-card/80 flex items-center justify-center backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2 text-zinc-400">
              <Loader2 className="animate-spin text-amber-400" size={24} />
              <span className="text-sm font-medium">데이터를 불러오는 중...</span>
            </div>
          </div>
        )}
        
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-bg-card z-10">
            <tr className="bg-white/[0.02] border-b border-border">
              <th 
                onClick={() => handleSort('updated_at')}
                className="py-3 px-3 text-[11px] font-mono text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-300 transition-colors whitespace-nowrap"
              >
                등록일 <SortIndicator field="updated_at" />
              </th>
              <th 
                onClick={() => handleSort('구분명')}
                className="py-3 px-3 text-[11px] font-mono text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-300 transition-colors whitespace-nowrap"
              >
                구분명 <SortIndicator field="구분명" />
              </th>
              <th 
                onClick={() => handleSort('품목명[규격]')}
                className="py-3 px-3 text-[11px] font-mono text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-300 transition-colors whitespace-nowrap"
              >
                품목명[규격] <SortIndicator field="품목명[규격]" />
              </th>
              <th 
                onClick={() => handleSort('단가')}
                className="py-3 px-3 text-[11px] font-mono text-zinc-500 uppercase tracking-wider text-right cursor-pointer hover:text-zinc-300 transition-colors whitespace-nowrap"
              >
                단가 <SortIndicator field="단가" />
              </th>
              <th 
                onClick={() => handleSort('전월수량')}
                className="py-3 px-3 text-[11px] font-mono text-zinc-500 uppercase tracking-wider text-right cursor-pointer hover:text-zinc-300 transition-colors whitespace-nowrap"
              >
                전월수량 <SortIndicator field="전월수량" />
              </th>
              <th 
                onClick={() => handleSort('현재수량')}
                className="py-3 px-3 text-[11px] font-mono text-zinc-500 uppercase tracking-wider text-right cursor-pointer hover:text-zinc-300 transition-colors whitespace-nowrap"
              >
                현재수량 <SortIndicator field="현재수량" />
              </th>
              <th 
                onClick={() => handleSort('금액')}
                className="py-3 px-3 text-[11px] font-mono text-zinc-500 uppercase tracking-wider text-right cursor-pointer hover:text-zinc-300 transition-colors whitespace-nowrap"
              >
                재고금액 <SortIndicator field="금액" />
              </th>
              <th className="py-3 px-3 text-[11px] font-mono text-zinc-500 uppercase tracking-wider text-center whitespace-nowrap">
                재고회전
              </th>
              <th className="py-3 px-3 text-[11px] font-mono text-zinc-500 uppercase tracking-wider text-center whitespace-nowrap">
                상태
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filteredData.length === 0 && !loading ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-zinc-500 text-sm">
                  {searchTerm || selectedCategory !== 'all'
                    ? '검색 결과가 없습니다.' 
                    : `${selectedMonthLabel}에 신규 등록된 품목이 없습니다.`}
                </td>
              </tr>
            ) : (
              filteredData.map((item, idx) => {
                return (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors text-sm group">
                    <td className="py-2.5 px-3 font-mono text-xs text-amber-400/80">
                      {formatDate(item.updated_at)}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-400 text-xs">
                      <span className="inline-block px-2 py-0.5 bg-zinc-800/50 rounded text-zinc-400">
                        {item.구분명 || '-'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-zinc-200 group-hover:text-amber-400 transition-colors max-w-[280px]">
                      <div className="truncate" title={item["품목명[규격]"]}>{item["품목명[규격]"]}</div>
                      {item.품목코드 && (
                        <div className="text-[10px] text-zinc-500 mt-0.5 font-mono truncate" title={item.품목코드}>
                          {item.품목코드}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-zinc-400 text-right whitespace-nowrap">
                      {formatPrice(item.단가)}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-zinc-500 text-right whitespace-nowrap">
                      {item.전월수량.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-zinc-300 text-right whitespace-nowrap">
                      {item.현재수량.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-zinc-300 text-right whitespace-nowrap">
                      {formatAmount(item.금액)}
                    </td>
                    <td className="py-2.5 px-3 text-center text-xs text-zinc-400">
                      {item.재고회전 || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${getBadgeStyle(item.상태)}`}>
                        {item.상태 || '-'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Stats */}
      <div className="p-3 border-t border-border bg-bg-card/50 flex flex-wrap justify-between items-center gap-2 text-xs text-zinc-500">
        <div className="flex items-center gap-4">
          <span>총 수량: <span className="text-zinc-300 font-mono">{filteredData.reduce((sum, item) => sum + (item.현재수량 || 0), 0).toLocaleString()}</span></span>
          <span>총 금액: <span className="text-amber-400 font-mono">{formatAmount(filteredData.reduce((sum, item) => sum + (item.금액 || 0), 0))}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-amber-400">{selectedMonthLabel}</span>
          {selectedCategory !== 'all' && (
            <span className="text-amber-400">• {selectedCategory}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewItemsTable;

