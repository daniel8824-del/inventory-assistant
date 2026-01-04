import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { StockItem } from '../types';
import { Loader2, Cloud, Cpu, Search, Filter, ChevronDown, X, Calendar, Sparkles, Package, Layers, Hash, DollarSign, TrendingUp } from 'lucide-react';
import { DataSourceType } from '../services/api';
import { ITEM_ORDER } from '../data/itemOrder';
import { ECOB_ITEM_ORDER } from '../data/ecobItemOrder';
import { getCategoryOrder, getEcobCategoryOrder } from '../constants';

interface NewItemsTableProps {
  data: StockItem[];
  loading: boolean;
  dataSource: DataSourceType;
  sourceType?: 'k1' | 'ecob'; // K1 또는 에코비 구분
}

type SortField = '구분명' | '품목명[규격]' | '단가' | '전월수량' | '현재수량' | '금액' | 'updated_at';
type SortOrder = 'asc' | 'desc';

// 월 옵션 생성 (최근 12개월 - 최신이 위)
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

const NewItemsTable: React.FC<NewItemsTableProps> = ({ data, loading, dataSource, sourceType = 'k1' }) => {
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
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedItem(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleRowClick = useCallback((item: StockItem) => {
    setSelectedItem(item);
  }, []);

  const monthOptions = useMemo(() => getMonthOptions(), []);

  // 신규 품목만 필터링 (ITEM_ORDER에 없는 유니크키)
  // sourceType에 따라 K1 또는 에코비 ITEM_ORDER 사용
  const itemOrderMap = sourceType === 'ecob' ? ECOB_ITEM_ORDER : ITEM_ORDER;
  
  const newItemsOnly = useMemo(() => {
    return data.filter(item => {
      const uniqueKey = item.유니크키 || item["품목명[규격]"];
      return !(uniqueKey in itemOrderMap);
    });
  }, [data, itemOrderMap]);

  // 카테고리 정렬 함수 선택 (K1 또는 에코비)
  const categoryOrderFn = sourceType === 'ecob' ? getEcobCategoryOrder : getCategoryOrder;
  
  // 고유 카테고리 목록 추출
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(newItemsOnly.map(item => item.구분명))].filter(Boolean) as string[];
    return uniqueCategories.sort((a, b) => categoryOrderFn(a) - categoryOrderFn(b));
  }, [newItemsOnly, categoryOrderFn]);

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
        const catOrderA = categoryOrderFn(a.구분명 || '');
        const catOrderB = categoryOrderFn(b.구분명 || '');
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
  }, [newItemsOnly, selectedCategory, selectedMonth, searchTerm, sortField, sortOrder, categoryOrderFn]);

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

  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return <span className="text-emerald-400 ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  const selectedMonthLabel = monthOptions.find(m => m.value === selectedMonth)?.label || selectedMonth;

  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden flex flex-col h-full min-h-[500px]">
      {/* Header */}
      <div className="p-4 border-b border-border bg-bg-card/50 space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-emerald-400">New Items</h3>
            <span className="flex items-center gap-1.5 text-[10px] text-zinc-400 bg-zinc-800/50 px-2 py-1 rounded border border-border">
              <Sparkles size={10} className="text-emerald-400" />
              NEW
            </span>
            <span className="text-[10px] font-medium bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded border border-emerald-500/30">
              신규 {filteredData.length}개
            </span>
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
              className="w-full bg-bg-body border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
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
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
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
                      selectedMonth === month.value ? 'text-emerald-400 bg-emerald-500/5' : 'text-zinc-300'
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
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
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
                    selectedCategory === 'all' ? 'text-emerald-400 bg-emerald-500/5' : 'text-zinc-300'
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
                        selectedCategory === cat ? 'text-emerald-400 bg-emerald-500/5' : 'text-zinc-300'
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
              <Loader2 className="animate-spin text-emerald-400" size={24} />
              <span className="text-sm font-medium">데이터를 불러오는 중...</span>
            </div>
          </div>
        )}
        
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 bg-bg-card z-10">
            <tr className="bg-bg-body/50 border-b border-border">
              <th 
                onClick={() => handleSort('updated_at')}
                className="px-2 py-2 font-semibold text-zinc-400 text-center cursor-pointer hover:text-white whitespace-nowrap"
              >
                등록일<SortIndicator field="updated_at" />
              </th>
              <th 
                onClick={() => handleSort('구분명')}
                className="px-2 py-2 font-semibold text-zinc-400 text-left cursor-pointer hover:text-white whitespace-nowrap"
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
              >
                단가<SortIndicator field="단가" />
              </th>
              <th 
                onClick={() => handleSort('전월수량')}
                className="px-2 py-2 font-semibold text-zinc-400 text-center cursor-pointer hover:text-white whitespace-nowrap"
              >
                전월수량<SortIndicator field="전월수량" />
              </th>
              <th 
                onClick={() => handleSort('현재수량')}
                className="px-2 py-2 font-semibold text-zinc-400 text-center cursor-pointer hover:text-white whitespace-nowrap"
              >
                현재수량<SortIndicator field="현재수량" />
              </th>
              <th 
                onClick={() => handleSort('금액')}
                className="px-2 py-2 font-semibold text-zinc-400 text-center cursor-pointer hover:text-white whitespace-nowrap"
              >
                금액<SortIndicator field="금액" />
              </th>
              <th className="px-2 py-2 font-semibold text-zinc-400 text-center whitespace-nowrap">
                재고회전
              </th>
              <th className="px-2 py-2 font-semibold text-zinc-400 text-center whitespace-nowrap">
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
                  <tr 
                    key={idx} 
                    className="hover:bg-white/[0.02] transition-colors text-xs group cursor-pointer"
                    onClick={() => handleRowClick(item)}
                  >
                    <td className="px-2 py-2 font-mono text-[10px] text-white text-center">
                      {formatDate(item.updated_at)}
                    </td>
                    <td className="px-2 py-2 text-zinc-400 text-xs text-left">
                      <span className="inline-block px-1.5 py-0.5 bg-zinc-800/50 rounded text-zinc-400 text-[10px]">
                        {item.구분명 || '-'}
                      </span>
                    </td>
                    <td className="px-2 py-2 font-medium text-zinc-200 group-hover:text-emerald-400 transition-colors text-left max-w-[280px]">
                      <div className="truncate text-xs" title={item["품목명[규격]"]}>{item["품목명[규격]"]}</div>
                      {item.품목코드 && (
                        <div className="text-[10px] text-zinc-500 mt-0.5 font-mono truncate" title={item.품목코드}>
                          {item.품목코드}
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-2 font-mono text-xs text-zinc-400 text-center whitespace-nowrap">
                      {formatPrice(item.단가)}
                    </td>
                    <td className="px-2 py-2 font-mono text-xs text-zinc-500 text-center whitespace-nowrap">
                      {item.전월수량.toLocaleString()}
                    </td>
                    <td className="px-2 py-2 font-mono text-xs text-zinc-300 text-center whitespace-nowrap">
                      {item.현재수량.toLocaleString()}
                    </td>
                    <td className="px-2 py-2 font-mono text-xs text-zinc-300 text-center whitespace-nowrap">
                      {formatAmount(item.금액)}
                    </td>
                    <td className="px-2 py-2 text-center text-xs text-zinc-400">
                      {item.재고회전 || '-'}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${getBadgeStyle(item.상태)}`}>
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
          <span>총 금액: <span className="text-emerald-400 font-mono">{formatAmount(filteredData.reduce((sum, item) => sum + (item.금액 || 0), 0))}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-400">{selectedMonthLabel}</span>
          {selectedCategory !== 'all' && (
            <span className="text-emerald-400">• {selectedCategory}</span>
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
            <div className="p-4 border-b border-border bg-gradient-to-r from-emerald-500/10 to-transparent">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Package size={16} className="text-emerald-400 flex-shrink-0" />
                    <span className="text-xs px-2 py-0.5 bg-zinc-800 rounded text-zinc-400">
                      {selectedItem.구분명}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-emerald-500/20 rounded text-emerald-400">
                      신규
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
                <div className="bg-bg-body rounded-xl p-3 border border-emerald-500/30">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs mb-1">
                    <Layers size={12} />
                    현재 수량
                  </div>
                  <p className="text-xl font-mono text-emerald-400 font-bold">{selectedItem.현재수량.toLocaleString()}</p>
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

              {selectedItem.updated_at && (
                <div className="text-xs text-zinc-600 font-mono text-center pt-2 border-t border-border/50">
                  등록일: {formatDate(selectedItem.updated_at)}
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

export default NewItemsTable;

