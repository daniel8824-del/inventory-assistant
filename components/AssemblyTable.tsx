import React, { useMemo, useState } from 'react';
import { StockItem } from '../types';
import { DataSourceType } from '../services/api';
import { ASSEMBLY_SETS } from '../data/assemblyItems';
import { Loader2, Wrench, Search, X } from 'lucide-react';

interface AssemblyTableProps {
  data: StockItem[];
  loading: boolean;
  dataSource: DataSourceType;
}

interface ProcessedSet {
  id: number;
  items: {
    name: string;
    currentStock: number | null;
    isBottleneck: boolean;
  }[];
  assemblyQty: number | null;
}

const AssemblyTable: React.FC<AssemblyTableProps> = ({ data: k1StockData, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // 품목명 → 현재수량 맵 생성
  const stockMap = useMemo(() => {
    return new Map(k1StockData.map(item => [item["품목명[규격]"], item.현재수량]));
  }, [k1StockData]);

  // 각 세트 처리
  const processedSets = useMemo((): ProcessedSet[] => {
    return ASSEMBLY_SETS.map(set => {
      const items = set.items.map(item => ({
        name: item.name,
        currentStock: stockMap.get(item.name) ?? null,
        isBottleneck: false
      }));

      let assemblyQty: number | null = null;
      
      if (set.csvAssemblyQty !== null) {
        const allFound = items.every(item => item.currentStock !== null);
        
        if (allFound) {
          let minQty = Infinity;
          let bottleneckIdx = -1;
          
          items.forEach((item, idx) => {
            if (item.currentStock !== null && item.currentStock < minQty) {
              minQty = item.currentStock;
              bottleneckIdx = idx;
            }
          });
          
          if (minQty !== Infinity) {
            assemblyQty = minQty;
            if (bottleneckIdx >= 0) {
              items[bottleneckIdx].isBottleneck = true;
            }
          }
        }
      }

      return { id: set.id, items, assemblyQty };
    });
  }, [stockMap]);

  // 통계
  const stats = useMemo(() => {
    const complete = processedSets.filter(s => s.assemblyQty !== null && s.assemblyQty > 0).length;
    const incomplete = processedSets.filter(s => s.assemblyQty === null).length;
    const total = processedSets.length;
    return { complete, incomplete, total };
  }, [processedSets]);

  // 검색 필터링
  const filteredSets = useMemo(() => {
    if (!searchTerm.trim()) return processedSets;
    const term = searchTerm.toLowerCase();
    return processedSets.filter(set => 
      set.items.some(item => item.name.toLowerCase().includes(term))
    );
  }, [processedSets, searchTerm]);

  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden flex flex-col h-full min-h-[500px] max-w-full">
      {/* Header */}
      <div className="p-4 border-b border-border bg-bg-card/50 space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-agent-cyan">Stock Master</h3>
            <span className="flex items-center gap-1.5 text-[10px] text-zinc-400 bg-zinc-800/50 px-2 py-1 rounded border border-border">
              <Wrench size={10} className="text-agent-cyan" />
              ASSEMBLY
            </span>
            <span className="text-[10px] font-medium bg-agent-cyan/20 text-agent-cyan px-2 py-1 rounded border border-agent-cyan/30">
              {stats.total}개 세트
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
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
        
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 bg-bg-card z-10">
            <tr className="bg-bg-body/50 border-b border-border">
              <th className="px-2 py-2 font-semibold text-zinc-400 text-left whitespace-nowrap">
                품목명
              </th>
              <th className="px-2 py-2 font-semibold text-zinc-400 text-center whitespace-nowrap" style={{ width: '80px' }}>
                현재수량
              </th>
              <th className="px-2 py-2 font-semibold text-zinc-400 text-center whitespace-nowrap" style={{ width: '100px' }}>
                조립가능수량
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredSets.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-10 text-center text-zinc-500 text-sm">
                  {searchTerm ? '검색 결과가 없습니다.' : '데이터가 없습니다.'}
                </td>
              </tr>
            ) : (
              filteredSets.map((processedSet, setIndex) => (
                <React.Fragment key={`set-${processedSet.id}`}>
                  {processedSet.items.map((item, itemIndex) => (
                    <tr 
                      key={`${processedSet.id}-${itemIndex}`}
                      className={`hover:bg-white/[0.02] transition-colors ${
                        itemIndex === processedSet.items.length - 1 && setIndex < filteredSets.length - 1
                          ? 'border-b border-border'
                          : ''
                      }`}
                    >
                      <td className="py-2 px-2 font-medium text-zinc-200 text-left text-xs">
                        {item.name}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span className={`text-xs font-mono ${
                          item.isBottleneck 
                            ? 'text-red-400 font-semibold' 
                            : item.currentStock === null
                            ? 'text-zinc-600'
                            : 'text-zinc-300'
                        }`}>
                          {item.currentStock !== null ? item.currentStock.toLocaleString() : '-'}
                        </span>
                      </td>
                      {itemIndex === 0 && (
                        <td 
                          rowSpan={processedSet.items.length}
                          className="py-2 px-2 text-center align-middle"
                        >
                          <span className={`text-xs font-mono ${
                            processedSet.assemblyQty !== null 
                              ? 'text-amber-400 font-semibold' 
                              : 'text-zinc-600'
                          }`}>
                            {processedSet.assemblyQty !== null ? processedSet.assemblyQty.toLocaleString() : '-'}
                          </span>
                        </td>
                      )}
                    </tr>
                  ))}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssemblyTable;
