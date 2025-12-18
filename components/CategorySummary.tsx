import React, { useMemo } from 'react';
import { StockItem } from '../types';
import { TARGET_CATEGORIES } from '../constants';
import { Wallet, Package, AlertCircle, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CategorySummaryProps {
  data: StockItem[];
  loading: boolean;
}

const CategorySummary: React.FC<CategorySummaryProps> = ({ data, loading }) => {
  // Aggregate data for the 22 categories
  // 사용자 요청 반영: DB에 이미 "신천등기구_조립", "세종&교은모듈" 등 표준화된 이름이 있으므로
  // 복잡한 정규식 변환 없이 있는 그대로(Exact Match) 비교합니다.
  const categoryStats = useMemo(() => {
    // 🔍 디버깅: DB에 있는 모든 구분명과 TARGET_CATEGORIES 비교
    const dbCategories: string[] = Array.from(new Set(data.map(item => item.구분명))) as string[];
    
    TARGET_CATEGORIES.forEach(target => {
      const found = dbCategories.includes(target);
      if (!found) {
        console.warn(`[CategorySummary] ❌ TARGET에 있지만 DB에 없음: "${target}"`);
        // 유사한 항목 찾기
        const similar = dbCategories.filter(db => 
          db.includes(target.substring(0, 4)) || target.includes(db.substring(0, 4))
        );
        if (similar.length > 0) {
          console.warn(`[CategorySummary]    → 유사 항목: ${similar.join(', ')}`);
        }
      }
    });
    
    dbCategories.forEach(db => {
      if (!TARGET_CATEGORIES.includes(db)) {
        console.warn(`[CategorySummary] ⚠️ DB에 있지만 TARGET에 없음: "${db}"`);
      }
    });

    return TARGET_CATEGORIES.map(categoryName => {
      // 공백 실수 방지를 위해 앞뒤 공백만 제거(trim)하고 비교
      const targetName = categoryName.trim();
      
      const items = data.filter(item => {
        // DB에서 가져온 구분명
        const dbCategoryName = (item.구분명 || "").trim();
        
        // 1:1 정확한 매칭 (DB 데이터 신뢰)
        return dbCategoryName === targetName;
      });
      
      const totalAmount = items.reduce((sum, item) => sum + (item.금액 || 0), 0);
      const totalQty = items.reduce((sum, item) => sum + (item.현재수량 || 0), 0);
      const itemCount = items.length;
      const riskCount = items.filter(item => item.상태 && item.상태.includes('위험')).length;

      // 🔍 디버깅: 각 카테고리별 매칭 결과
      if (itemCount === 0) {
        console.log(`[CategorySummary] "${categoryName}" → 매칭 0건`);
      }

      return {
        name: categoryName,
        totalAmount,
        totalQty,
        itemCount,
        riskCount
      };
    });
  }, [data]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('ko-KR', { 
      style: 'currency', 
      currency: 'KRW',
      maximumFractionDigits: 0
    }).format(val);
  };

  // 차트 Y축 - 만단위, 억단위 표시
  const formatAmount = (val: number) => {
    if (val >= 100000000) return `${(val / 100000000).toFixed(0)}억`;  // 1억 이상 → 억 단위
    if (val >= 10000) return `${(val / 10000).toLocaleString()}만`;    // 1만 이상 → 만 단위
    return val.toLocaleString();
  };

  const totalAssetValue = categoryStats.reduce((acc, curr) => acc + curr.totalAmount, 0);

  // 차트 데이터 (금액이 있는 것만, 금액 순 정렬)
  const chartData = useMemo(() => {
    return categoryStats
      .filter(stat => stat.totalAmount > 0)
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .map(stat => ({
        name: stat.name.length > 8 ? stat.name.substring(0, 8) + '...' : stat.name,
        fullName: stat.name,
        금액: stat.totalAmount,
      }));
  }, [categoryStats]);

  // 카테고리별 색상
  const CHART_COLORS = [
    '#E879F9', '#92400E', '#EF4444', '#3B82F6', '#FACC15',
    '#84CC16', '#F97316', '#6B7280', '#8B5CF6', '#10B981',
    '#EC4899', '#14B8A6', '#F59E0B', '#6366F1', '#22C55E',
    '#0EA5E9', '#A855F7', '#F43F5E', '#06B6D4', '#EAB308',
    '#7C3AED', '#2DD4BF'
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-32 bg-bg-card border border-border rounded-xl"></div>
        ))}
      </div>
    );
  }

  // 차트 툴팁 커스텀
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-xl">
          <p className="text-sm font-bold text-white mb-1">{payload[0].payload.fullName}</p>
          <p className="text-agent-cyan font-mono text-lg">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-end pb-4 border-b border-border">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Wallet className="text-agent-cyan" size={20} />
            Category Financial Overview
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            22개 주요 카테고리별 재고 자산 현황
          </p>
        </div>
        <div className="mt-4 md:mt-0 text-right">
             <span className="text-xs text-zinc-500 block mb-1">TOTAL ASSETS</span>
             <span className="text-3xl font-mono font-bold text-agent-cyan">
                {formatCurrency(totalAssetValue)}
             </span>
        </div>
      </div>

      {/* 구분명별 총금액 차트 */}
      <div className="bg-bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="text-agent-cyan" size={18} />
          <h3 className="text-sm font-bold text-zinc-300">구분명별 재고 금액</h3>
        </div>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 60 }}>
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#71717a', fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                interval={0}
                height={60}
              />
              <YAxis 
                tick={{ fill: '#71717a', fontSize: 10 }}
                tickFormatter={formatAmount}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar dataKey="금액" radius={[4, 4, 0, 0]}>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
        {categoryStats.map((stat, idx) => (
          <div 
            key={idx} 
            className={`
              bg-bg-card border rounded-xl p-5 flex flex-col justify-between transition-all hover:bg-[#121214]
              ${stat.riskCount > 0 ? 'border-status-risk/30 shadow-[0_0_10px_rgba(244,63,94,0.05)]' : 'border-border hover:border-agent-cyan/30'}
              ${stat.totalQty === 0 ? 'opacity-60' : 'opacity-100'}
            `}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-sm font-bold text-zinc-200 break-keep leading-snug min-h-[2.5em]">
                {stat.name}
              </h3>
              {stat.riskCount > 0 && (
                <div className="flex items-center gap-1 text-[10px] text-status-risk bg-status-risk/10 px-2 py-0.5 rounded-full">
                  <AlertCircle size={10} />
                  <span>위험 {stat.riskCount}</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="text-xl font-mono font-bold text-white tracking-tight">
                {formatCurrency(stat.totalAmount)}
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono">
                <span className="flex items-center gap-1">
                    <Package size={12} />
                    Qty: {stat.totalQty.toLocaleString()}
                </span>
                <span className="w-px h-3 bg-zinc-700"></span>
                <span>Items: {stat.itemCount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategorySummary;