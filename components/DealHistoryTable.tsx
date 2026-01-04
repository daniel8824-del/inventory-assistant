import React, { useState, useMemo } from 'react';
import { DealItem } from '../types';
import { Loader2, Cloud, Cpu, Search, X, ArrowDownCircle, ArrowUpCircle, TrendingUp, History } from 'lucide-react';
import { DataSourceType } from '../services/api';
import { getCategoryOrder, TARGET_CATEGORIES, ECOB_TARGET_CATEGORIES, getEcobCategoryOrder } from '../constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DealHistoryTableProps {
  data: DealItem[];
  loading: boolean;
  dataSource: DataSourceType;
  sourceType?: 'k1' | 'ecob'; // K1 또는 에코비 구분
}

type SortField = '제출일시' | '거래일자' | '구분명' | '품목명[규격]' | '거래구분' | '거래수량' | '단가' | '금액' | '거래처명';
type SortOrder = 'asc' | 'desc';

const DealHistoryTable: React.FC<DealHistoryTableProps> = ({ data, loading, dataSource, sourceType = 'k1' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());  // 다중 선택
  const [selectedDealTypes, setSelectedDealTypes] = useState<Set<string>>(new Set());    // 입고/출고/생산 다중 선택
  const [sortField, setSortField] = useState<SortField>('제출일시');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  
  // sourceType에 따라 카테고리 목록 및 정렬 함수 선택
  const targetCategories = sourceType === 'ecob' ? ECOB_TARGET_CATEGORIES : TARGET_CATEGORIES;
  const categoryOrderFn = sourceType === 'ecob' ? getEcobCategoryOrder : getCategoryOrder;
  
  // 기간 필터
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<string>(String(now.getFullYear()));
  const [selectedQuarter, setSelectedQuarter] = useState<string>('');  // Q1, Q2, Q3, Q4 (월과 상호 배타)
  const [selectedMonth, setSelectedMonth] = useState<string>(String(now.getMonth() + 1).padStart(2, '0'));  // 01~12 (분기와 상호 배타)

  // 연도 목록 (2025, 2026만)
  const availableYears = ['2026', '2025'];

  // 분기 선택 (월 해제)
  const handleQuarterSelect = (q: string) => {
    if (selectedQuarter === q) {
      setSelectedQuarter('');
    } else {
      setSelectedQuarter(q);
      setSelectedMonth(''); // 월 해제
    }
  };

  // 월 선택 (분기 해제)
  const handleMonthSelect = (m: string) => {
    if (selectedMonth === m) {
      setSelectedMonth('');
    } else {
      setSelectedMonth(m);
      setSelectedQuarter(''); // 분기 해제
    }
  };

  // 거래구분 토글
  const toggleDealType = (type: string) => {
    const newSet = new Set(selectedDealTypes);
    if (newSet.has(type)) {
      newSet.delete(type);
    } else {
      newSet.add(type);
    }
    setSelectedDealTypes(newSet);
  };

  // 카테고리 토글
  const toggleCategory = (cat: string) => {
    const newSet = new Set(selectedCategories);
    if (newSet.has(cat)) {
      newSet.delete(cat);
    } else {
      newSet.add(cat);
    }
    setSelectedCategories(newSet);
  };

  // 기간 필터 적용 함수
  const matchesPeriodFilter = (item: DealItem): boolean => {
    const date = item.거래일자 || item.제출일시;
    if (!date || date.length < 7) return false;

    const itemYear = date.substring(0, 4);
    const itemMonth = parseInt(date.substring(5, 7));
    
    // 연도 필터
    if (selectedYear && itemYear !== selectedYear) return false;
    
    // 분기 필터 (Q1, Q2, Q3, Q4)
    if (selectedQuarter) {
      const q = parseInt(selectedQuarter.replace('Q', ''));
      const quarterStart = (q - 1) * 3 + 1;
      const quarterEnd = q * 3;
      if (itemMonth < quarterStart || itemMonth > quarterEnd) return false;
    }
    
    // 월 필터
    if (selectedMonth) {
      const m = parseInt(selectedMonth);
      if (itemMonth !== m) return false;
    }
    
    return true;
  };

  // 필터링 및 정렬된 데이터
  const filteredData = useMemo(() => {
    let result = [...data];

    // 기간 필터
    result = result.filter(matchesPeriodFilter);

    // 카테고리 필터 (선택된 것만, 없으면 전체)
    if (selectedCategories.size > 0) {
      result = result.filter(item => selectedCategories.has(item.구분명 || ''));
    }

    // 거래구분 필터 (선택된 것만, 없으면 전체)
    if (selectedDealTypes.size > 0) {
      result = result.filter(item => selectedDealTypes.has(item.거래구분 || ''));
    }

    // 검색 필터
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        item["품목명[규격]"]?.toLowerCase().includes(term) ||
        item.구분명?.toLowerCase().includes(term) ||
        item.거래처명?.toLowerCase().includes(term) ||
        item.담당자?.toLowerCase().includes(term)
      );
    }

    // 정렬
    result.sort((a, b) => {
      let comparison = 0;

      if (sortField === '제출일시') {
        comparison = (a.제출일시 || '').localeCompare(b.제출일시 || '');
      } else if (sortField === '거래일자') {
        comparison = (a.거래일자 || '').localeCompare(b.거래일자 || '');
      } else if (sortField === '구분명') {
        const catOrderA = categoryOrderFn(a.구분명 || '');
        const catOrderB = categoryOrderFn(b.구분명 || '');
        comparison = catOrderA - catOrderB;
      } else if (sortField === '거래수량' || sortField === '금액' || sortField === '단가') {
        const aVal = a[sortField] || 0;
        const bVal = b[sortField] || 0;
        comparison = aVal - bVal;
      } else {
        const aVal = a[sortField] || '';
        const bVal = b[sortField] || '';
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [data, selectedYear, selectedQuarter, selectedMonth, selectedCategories, selectedDealTypes, searchTerm, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === '제출일시' || field === '거래일자' ? 'desc' : 'asc');
    }
  };

  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="text-zinc-600 ml-1">↕</span>;
    return <span className="text-agent-cyan ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  // 합계 계산
  const totals = useMemo(() => {
    const totalIn = filteredData.filter(d => d.거래구분 === '입고').reduce((sum, d) => sum + d.거래수량, 0);
    const totalOut = filteredData.filter(d => d.거래구분 === '출고').reduce((sum, d) => sum + d.거래수량, 0);
    const totalAmount = filteredData.reduce((sum, d) => sum + Math.abs(d.금액), 0);
    return { totalIn, totalOut, totalAmount };
  }, [filteredData]);

  // 구분명별 매출(출고) 차트 데이터 - 현재 필터 기간 기준
  const categorySalesData = useMemo(() => {
    // 현재 필터 기간에 해당하는 출고 데이터만 필터링
    const salesData = filteredData.filter(d => d.거래구분 === '출고');
    
    // 구분명별로 그룹핑
    const categoryMap: { [category: string]: number } = {};
    
    salesData.forEach(item => {
      const category = item.구분명 || '기타';
      const amount = Math.abs(item.금액 || 0);
      
      if (!categoryMap[category]) categoryMap[category] = 0;
      categoryMap[category] += amount;
    });

    // 차트 데이터로 변환 (전체 카테고리 표시, 금액 없으면 0)
    return targetCategories
      .map(cat => ({
        name: cat.length > 10 ? cat.substring(0, 10) + '...' : cat,
        fullName: cat,
        금액: categoryMap[cat] || 0,
      }));
  }, [filteredData, targetCategories]);

  // 카테고리별 색상 (차트용)
  const CHART_COLORS: { [key: string]: string } = useMemo(() => {
    const colors = [
      '#E879F9', '#92400E', '#EF4444', '#3B82F6', '#FACC15',
      '#84CC16', '#F97316', '#6B7280', '#8B5CF6', '#10B981',
      '#EC4899', '#14B8A6', '#F59E0B', '#6366F1', '#22C55E',
      '#0EA5E9', '#A855F7', '#F43F5E', '#06B6D4', '#EAB308',
      '#7C3AED', '#2DD4BF'
    ];
    const colorMap: { [key: string]: string } = {};
    targetCategories.forEach((cat, idx) => {
      colorMap[cat] = colors[idx % colors.length];
    });
    return colorMap;
  }, [targetCategories]);

  const formatNumber = (num: number) => num.toLocaleString('ko-KR');
  const formatPrice = (num: number) => num.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatAmount = (num: number) => Math.abs(num).toLocaleString('ko-KR');
  
  // 제출일시 포맷팅 (2025-12-17T21:19:00 → { date: '2025-12-17', time: '21:19' })
  const formatDateTime = (dateStr: string | undefined) => {
    if (!dateStr) return { date: '-', time: '' };
    const parts = dateStr.replace('T', ' ').substring(0, 16).split(' ');
    return { date: parts[0] || '-', time: parts[1] || '' };
  };

  // 차트 Y축 - 만단위, 억단위 표시
  const formatChartAmount = (val: number) => {
    if (val >= 100000000) return `${(val / 100000000).toFixed(0)}억`;
    if (val >= 10000) return `${(val / 10000).toLocaleString()}만`;
    return val.toLocaleString('ko-KR');
  };

  // 차트 툴팁
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-xl">
          <p className="text-sm font-bold text-white mb-1">{payload[0].payload.fullName}</p>
          <p className="text-orange-400 font-mono text-lg">{payload[0].value.toLocaleString('ko-KR')}원</p>
        </div>
      );
    }
    return null;
  };

  // 현재 필터 기간 라벨
  const getPeriodLabel = () => {
    let label = selectedYear + '년';
    if (selectedQuarter) label += ' ' + selectedQuarter;
    if (selectedMonth) label += ' ' + parseInt(selectedMonth) + '월';
    return label;
  };

  // 필터 초기화
  const resetFilters = () => {
    setSelectedCategories(new Set());
    setSelectedDealTypes(new Set());
    setSelectedYear(String(now.getFullYear()));
    setSelectedQuarter('');
    setSelectedMonth(String(now.getMonth() + 1).padStart(2, '0'));
    setSearchTerm('');
  };

  // 활성 필터 개수 (기본 상태: 현재 연도, 현재 월, 분기 없음, 거래구분/구분명 없음)
  const defaultYear = String(now.getFullYear());
  const defaultMonth = String(now.getMonth() + 1).padStart(2, '0');
  
  const activeFilterCount = 
    (selectedYear !== defaultYear ? 1 : 0) +
    (selectedQuarter ? 1 : 0) +  // 분기가 선택되었으면
    (selectedMonth && selectedMonth !== defaultMonth ? 1 : 0) +  // 월이 기본값이 아니면
    selectedCategories.size + 
    selectedDealTypes.size;

  if (loading) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-agent-cyan animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. 검색 및 필터 패널 (맨 위) */}
      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border bg-bg-card/50 space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold text-orange-400">Deal History</h3>
              <span className="flex items-center gap-1.5 text-[10px] text-zinc-400 bg-zinc-800/50 px-2 py-1 rounded border border-border">
                <History size={10} className="text-orange-400" />
                DEAL
              </span>
              <span className="text-[10px] font-medium bg-orange-500/20 text-orange-400 px-2 py-1 rounded border border-orange-500/30">
                거래 {filteredData.length.toLocaleString()}건
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="품목, 거래처, 담당자 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-bg-body border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-agent-cyan"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Filter Panel (항상 표시) */}
        <div className="p-4 space-y-3">
            {/* 기간 필터 - 1행: 연도 + 분기 + 월 */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-zinc-400 font-medium">기간</span>
              
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="appearance-none bg-bg-card border border-border rounded-lg px-3 py-1.5 pr-8 text-sm text-zinc-100 focus:outline-none focus:border-agent-cyan cursor-pointer"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}년</option>
                ))}
              </select>

              <div className="flex items-center gap-1">
                {['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
                  <button
                    key={q}
                    onClick={() => handleQuarterSelect(q)}
                    className={`px-2 py-1 text-xs rounded-md transition-all ${
                      selectedQuarter === q
                        ? 'bg-agent-cyan text-black font-bold'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>

              <div className="h-4 w-px bg-zinc-700"></div>

              <div className="flex items-center gap-1">
                {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(m => (
                  <button
                    key={m}
                    onClick={() => handleMonthSelect(m)}
                    className={`px-1.5 py-1 text-xs rounded-md transition-all ${
                      selectedMonth === m
                        ? 'bg-orange-500 text-white font-bold'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    {parseInt(m)}월
                  </button>
                ))}
              </div>
            </div>

            {/* 거래구분 필터 */}
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-xs text-zinc-400 font-medium w-16">거래구분</span>
              <div className="flex gap-2">
                {(sourceType === 'ecob' ? ['입고', '출고'] : ['입고', '출고', '생산']).map(type => (
                  <button
                    key={type}
                    onClick={() => toggleDealType(type)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-all flex items-center gap-1.5 ${
                      selectedDealTypes.has(type)
                        ? type === '입고' 
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                          : type === '출고'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                          : 'bg-green-500/20 text-green-400 border border-green-500/50'
                        : 'bg-zinc-800/50 text-zinc-500 border border-zinc-700 hover:border-zinc-600'
                    }`}
                  >
                    {type === '입고' && <ArrowDownCircle size={12} />}
                    {type === '출고' && <ArrowUpCircle size={12} />}
                    {type === '생산' && <span className="text-xs">⚙</span>}
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* 구분명 필터 */}
            <div className="flex flex-wrap items-start gap-4">
              <span className="text-xs text-zinc-400 font-medium w-16 pt-1">구분명</span>
              <div className="flex-1">
                <div className="flex flex-wrap gap-1.5">
                  {targetCategories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-2 py-1 text-xs rounded-md transition-all ${
                        selectedCategories.has(cat)
                          ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                          : 'bg-zinc-800/50 text-zinc-500 border border-zinc-700/50 hover:border-zinc-600'
                      }`}
                    >
                      {cat.length > 12 ? cat.substring(0, 12) + '..' : cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          {/* 필터 초기화 */}
          {activeFilterCount > 0 && (
            <div className="flex justify-end pt-2 border-t border-border/50">
              <button
                onClick={resetFilters}
                className="text-xs text-agent-cyan hover:text-white transition-colors flex items-center gap-1"
              >
                <X size={12} />
                필터 초기화
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Deal History 테이블 */}
      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-bg-body/50 text-xs">
              <th 
                className="px-2 py-2 font-semibold text-zinc-400 text-center cursor-pointer hover:text-white whitespace-nowrap"
                onClick={() => handleSort('제출일시')}
              >
                제출일시<SortIndicator field="제출일시" />
              </th>
              <th 
                className="px-2 py-2 font-semibold text-zinc-400 text-center cursor-pointer hover:text-white whitespace-nowrap"
                onClick={() => handleSort('거래일자')}
              >
                거래일자<SortIndicator field="거래일자" />
              </th>
              <th 
                className="px-2 py-2 font-semibold text-zinc-400 text-center cursor-pointer hover:text-white whitespace-nowrap"
                onClick={() => handleSort('거래구분')}
              >
                구분<SortIndicator field="거래구분" />
              </th>
              <th 
                className="px-2 py-2 font-semibold text-zinc-400 text-left cursor-pointer hover:text-white whitespace-nowrap"
                onClick={() => handleSort('구분명')}
              >
                구분명<SortIndicator field="구분명" />
              </th>
              <th 
                className="px-2 py-2 font-semibold text-zinc-400 text-left cursor-pointer hover:text-white"
                onClick={() => handleSort('품목명[규격]')}
              >
                품목명[규격]<SortIndicator field="품목명[규격]" />
              </th>
              <th 
                className="px-2 py-2 font-semibold text-zinc-400 text-center cursor-pointer hover:text-white whitespace-nowrap"
                onClick={() => handleSort('거래처명')}
              >
                거래처<SortIndicator field="거래처명" />
              </th>
              <th className="px-2 py-2 font-semibold text-zinc-400 text-center whitespace-nowrap">
                담당자
              </th>
              <th 
                className="px-2 py-2 font-semibold text-zinc-400 text-center cursor-pointer hover:text-white whitespace-nowrap"
                onClick={() => handleSort('거래수량')}
              >
                수량<SortIndicator field="거래수량" />
              </th>
              <th 
                className="px-2 py-2 font-semibold text-zinc-400 text-center cursor-pointer hover:text-white whitespace-nowrap"
                onClick={() => handleSort('단가')}
              >
                단가<SortIndicator field="단가" />
              </th>
              <th 
                className="px-2 py-2 font-semibold text-zinc-400 text-center cursor-pointer hover:text-white whitespace-nowrap"
                onClick={() => handleSort('금액')}
              >
                금액<SortIndicator field="금액" />
              </th>
              <th className="px-2 py-2 font-semibold text-zinc-400 text-center whitespace-nowrap">
                재고변동
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredData.length > 0 ? (
              filteredData.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-zinc-900/50 transition-colors align-middle">
                  <td className="px-2 py-2 font-mono text-[9px] text-zinc-500 text-center" style={{ width: '75px' }}>
                    <div>{formatDateTime(item.제출일시).date}</div>
                    <div className="text-zinc-600">{formatDateTime(item.제출일시).time}</div>
                  </td>
                  <td className="px-2 py-2 font-mono text-[9px] text-zinc-400 text-center whitespace-nowrap">
                    {item.거래일자}
                  </td>
                  <td className="px-2 py-2 text-center whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                      item.거래구분 === '입고' 
                        ? 'bg-blue-500/10 text-blue-400' 
                        : 'bg-orange-500/10 text-orange-400'
                    }`}>
                      {item.거래구분 === '입고' 
                        ? <ArrowDownCircle size={10} /> 
                        : <ArrowUpCircle size={10} />
                      }
                      {item.거래구분}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-left whitespace-nowrap">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 whitespace-nowrap">
                      {item.구분명}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-zinc-100 text-xs text-left max-w-[280px]">
                    <div className="line-clamp-3 leading-snug break-keep" title={item["품목명[규격]"]}>
                      {item["품목명[규격]"]}
                    </div>
                    {item.품목코드 && (
                      <div className="text-[9px] text-zinc-600 truncate mt-0.5">
                        {item.품목코드}
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-2 text-zinc-300 text-[10px] text-center max-w-[100px]">
                    <div className="truncate">{item.거래처명}</div>
                    {item.적요 && (
                      <div className="text-[9px] text-zinc-600 truncate" title={item.적요}>
                        {item.적요}
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-2 text-zinc-400 text-[10px] text-center whitespace-nowrap">
                    {item.담당자 || '-'}
                  </td>
                  <td className="px-2 py-2 text-center font-mono text-xs">
                    <span className={item.거래구분 === '입고' ? 'text-blue-400' : 'text-orange-400'}>
                      {item.거래구분 === '입고' ? '+' : '-'}{formatNumber(item.거래수량)}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-center font-mono text-xs text-zinc-500 whitespace-nowrap">
                    {formatPrice(item.단가)}
                  </td>
                  <td className="px-2 py-2 text-center font-mono text-xs text-zinc-300 whitespace-nowrap">
                    {formatAmount(item.금액)}
                  </td>
                  <td className="px-2 py-2 text-center text-[9px] font-mono whitespace-nowrap">
                    <span className="text-zinc-600">{item["거래 전 재고"]}</span>
                    <span className="text-zinc-700 mx-0.5">→</span>
                    <span className="text-agent-cyan">{item["거래 후 재고"]}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={11} className="px-4 py-12 text-center text-zinc-500">
                  {data.length === 0 ? '거래 내역이 없습니다.' : '검색 결과가 없습니다.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

        {/* Footer - Totals */}
        {filteredData.length > 0 && (
          <div className="p-4 border-t border-border bg-bg-body/30 flex flex-wrap gap-6 justify-end text-sm">
            <div className="flex items-center gap-2">
              <ArrowDownCircle size={14} className="text-blue-400" />
              <span className="text-zinc-500">입고:</span>
              <span className="font-mono text-blue-400">+{formatNumber(totals.totalIn)}</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowUpCircle size={14} className="text-orange-400" />
              <span className="text-zinc-500">출고:</span>
              <span className="font-mono text-orange-400">-{formatNumber(totals.totalOut)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">총 거래금액:</span>
              <span className="font-mono text-white font-bold">{formatAmount(totals.totalAmount)}</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. 구분명별 매출 차트 (하단) */}
      <div className="bg-bg-card border border-border rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-orange-400" size={18} />
            <h3 className="text-sm font-bold text-zinc-300">구분명별 매출 현황 (출고)</h3>
            <span className="text-xs text-orange-400/80 font-medium bg-orange-500/10 px-2 py-0.5 rounded">{getPeriodLabel()}</span>
          </div>
          <span className="text-xs text-zinc-500">
            총 <span className="text-orange-400 font-mono font-bold">{categorySalesData.reduce((sum, d) => sum + d.금액, 0).toLocaleString()}</span>원
          </span>
        </div>
        
        {categorySalesData.length > 0 ? (
          <div className="h-[400px] overflow-x-auto">
            <div style={{ minWidth: categorySalesData.length * 50 + 100 }}>
              <ResponsiveContainer width="100%" height={380}>
                <BarChart 
                  data={categorySalesData} 
                  margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                >
                  <XAxis 
                    dataKey="name"
                    tick={{ fill: '#a1a1aa', fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                    height={80}
                  />
                  <YAxis 
                    tick={{ fill: '#71717a', fontSize: 10 }}
                    tickFormatter={formatChartAmount}
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={false} />
                  <Bar 
                    dataKey="금액" 
                    radius={[4, 4, 0, 0]}
                  >
                    {categorySalesData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={CHART_COLORS[entry.fullName] || '#6B7280'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-zinc-500 text-sm">
            선택한 기간에 출고 데이터가 없습니다
          </div>
        )}
      </div>
    </div>
  );
};

export default DealHistoryTable;

