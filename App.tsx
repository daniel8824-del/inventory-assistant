import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import DashboardHeader from './components/DashboardHeader';
import CategorySummary from './components/CategorySummary';
import StockTable from './components/StockTable';
import NewItemsTable from './components/NewItemsTable';
import DealHistoryTable from './components/DealHistoryTable';
import AssemblyTable from './components/AssemblyTable';
import ChatPanel from './components/ChatPanel';
import MobileTabBar from './components/MobileTabBar';
import LoginPage from './components/LoginPage';
import { StockItem, DealItem, AuditLog } from './types';
import { 
  fetchStockData, fetchDealData, fetchGoogleSheetData, fetchInternalContacts, fetchAuditLogs, 
  DataSourceType, ContactItem, InternalContact, 
  subscribeToStockChanges, subscribeToDealChanges, unsubscribeChannel,
  // 에코비 관련
  fetchEcobStockData, fetchEcobDealData, subscribeToEcobStockChanges, subscribeToEcobDealChanges
} from './services/api';
import ContactsTable from './components/ContactsTable';
import ReceivablesTable from './components/ReceivablesTable';
import InternalContactsTable from './components/InternalContactsTable';
import AuditLogsTable from './components/AuditLogsTable';
import { GET_MOCK_DATA } from './constants';
import { RealtimeChannel } from '@supabase/supabase-js';
import { realtimeLogger } from './utils/logger';
import { useAuth } from './contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export type PageType = 'dashboard' | 'stockMaster' | 'dealHistory' | 'newItems' | 'contacts' | 'receivables' | 'teamContacts' | 'activityLogs';

export default function App() {
  // 인증 상태
  const { user, loading: authLoading, login, isAuthenticated, hasRole } = useAuth();
  
  // viewer가 아닌 경우에만 챗봇 사용 가능
  const canUseChat = hasRole(['admin', 'manager']);
  const [stockData, setStockData] = useState<StockItem[]>([]);
  const [dealData, setDealData] = useState<DealItem[]>([]);
  const [contactData, setContactData] = useState<ContactItem[]>([]);
  const [internalContactData, setInternalContactData] = useState<InternalContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [dealLoading, setDealLoading] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [internalContactLoading, setInternalContactLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [dataSource, setDataSource] = useState<DataSourceType>('SIMULATION');
  const [dealDataSource, setDealDataSource] = useState<DataSourceType>('SIMULATION');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  
  // 에코비 상태
  const [ecobStockData, setEcobStockData] = useState<StockItem[]>([]);
  const [ecobDealData, setEcobDealData] = useState<DealItem[]>([]);
  const [ecobStockLoading, setEcobStockLoading] = useState(false);
  const [ecobDealLoading, setEcobDealLoading] = useState(false);
  const [ecobStockDataSource, setEcobStockDataSource] = useState<DataSourceType>('SIMULATION');
  const [ecobDealDataSource, setEcobDealDataSource] = useState<DataSourceType>('SIMULATION');
  
  // 탭 상태 (K1 / 미조립 / 에코비)
  const [stockTab, setStockTab] = useState<'k1' | 'assembly' | 'ecob'>('k1');
  const [dealTab, setDealTab] = useState<'k1' | 'ecob'>('k1');
  const [newItemsTab, setNewItemsTab] = useState<'k1' | 'ecob'>('k1');
  const [logsTab, setLogsTab] = useState<'k1' | 'ecob'>('k1');
  
  // Activity Logs 필터링 (K1 / 에코비)
  const filteredAuditLogs = logsTab === 'k1'
    ? auditLogs.filter(log => log.table_name === 'current_stock' || log.table_name === 'deal_data')
    : auditLogs.filter(log => log.table_name === 'ecob_stock' || log.table_name === 'ecob_deal');

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await fetchStockData();
      setStockData(result.data);
      setDataSource(result.source);
    } catch (error) {
      console.error("Critical Data Error:", error);
      setStockData(GET_MOCK_DATA());
      setDataSource('SIMULATION');
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  };

  const fetchDeals = async () => {
    setDealLoading(true);
    try {
      const result = await fetchDealData();
      setDealData(result.data);
      setDealDataSource(result.source);
    } catch (error) {
      console.error("Deal Data Error:", error);
      setDealData([]);
      setDealDataSource('SIMULATION');
    } finally {
      setDealLoading(false);
    }
  };

  const fetchContacts = async () => {
    setContactLoading(true);
    try {
      const data = await fetchGoogleSheetData();
      setContactData(data);
    } catch (error) {
      console.error("Contact Data Error:", error);
      setContactData([]);
    } finally {
      setContactLoading(false);
    }
  };

  const fetchTeamContacts = async () => {
    setInternalContactLoading(true);
    try {
      const data = await fetchInternalContacts();
      setInternalContactData(data);
    } catch (error) {
      console.error("Internal Contact Data Error:", error);
      setInternalContactData([]);
    } finally {
      setInternalContactLoading(false);
    }
  };

  const fetchAuditLogsData = async () => {
    setAuditLoading(true);
    try {
      const data = await fetchAuditLogs(200);
      setAuditLogs(data);
    } catch (error) {
      console.error("Audit Logs Error:", error);
      setAuditLogs([]);
    } finally {
      setAuditLoading(false);
    }
  };

  // 에코비 재고 데이터 로드
  const fetchEcobStock = async () => {
    setEcobStockLoading(true);
    try {
      const result = await fetchEcobStockData();
      setEcobStockData(result.data);
      setEcobStockDataSource(result.source);
    } catch (error) {
      console.error("Ecob Stock Error:", error);
      setEcobStockData([]);
      setEcobStockDataSource('SIMULATION');
    } finally {
      setEcobStockLoading(false);
    }
  };

  // 에코비 거래 데이터 로드
  const fetchEcobDeals = async () => {
    setEcobDealLoading(true);
    try {
      const result = await fetchEcobDealData();
      setEcobDealData(result.data);
      setEcobDealDataSource(result.source);
    } catch (error) {
      console.error("Ecob Deal Error:", error);
      setEcobDealData([]);
      setEcobDealDataSource('SIMULATION');
    } finally {
      setEcobDealLoading(false);
    }
  };

  // Realtime 채널 refs
  const stockChannelRef = useRef<RealtimeChannel | null>(null);
  const dealChannelRef = useRef<RealtimeChannel | null>(null);
  const ecobStockChannelRef = useRef<RealtimeChannel | null>(null);
  const ecobDealChannelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    fetchData();
    
    // Realtime 구독 시작
    stockChannelRef.current = subscribeToStockChanges(() => {
      realtimeLogger.info("Stock data updated!");
      fetchData();
    });

    // 클린업: 컴포넌트 언마운트 시 구독 해제
    return () => {
      if (stockChannelRef.current) {
        unsubscribeChannel(stockChannelRef.current);
      }
      if (dealChannelRef.current) {
        unsubscribeChannel(dealChannelRef.current);
      }
      if (ecobStockChannelRef.current) {
        unsubscribeChannel(ecobStockChannelRef.current);
      }
      if (ecobDealChannelRef.current) {
        unsubscribeChannel(ecobDealChannelRef.current);
      }
    };
  }, []);

  // Deal History 페이지 진입 시 데이터 로드 및 Realtime 구독
  useEffect(() => {
    if (currentPage === 'dealHistory') {
      // K1 탭일 때
      if (dealTab === 'k1') {
      if (dealData.length === 0) {
        fetchDeals();
      }
      if (!dealChannelRef.current) {
        dealChannelRef.current = subscribeToDealChanges(() => {
            realtimeLogger.info("Deal data updated!");
          fetchDeals();
          });
        }
      }
      // 에코비 탭일 때
      if (dealTab === 'ecob') {
        if (ecobDealData.length === 0) {
          fetchEcobDeals();
        }
        if (!ecobDealChannelRef.current) {
          ecobDealChannelRef.current = subscribeToEcobDealChanges(() => {
            realtimeLogger.info("Ecob deal data updated!");
            fetchEcobDeals();
          });
        }
      }
    }
  }, [currentPage, dealTab]);

  // Stock Master / New Items 페이지에서 에코비 탭 선택 시 데이터 로드
  useEffect(() => {
    const needsEcobStock = 
      (currentPage === 'stockMaster' && stockTab === 'ecob') ||
      (currentPage === 'newItems' && newItemsTab === 'ecob');
      
    if (needsEcobStock) {
      if (ecobStockData.length === 0) {
        fetchEcobStock();
      }
      if (!ecobStockChannelRef.current) {
        ecobStockChannelRef.current = subscribeToEcobStockChanges(() => {
          realtimeLogger.info("Ecob stock data updated!");
          fetchEcobStock();
        });
      }
    }
  }, [currentPage, stockTab, newItemsTab]);

  // Contacts/Receivables 페이지 진입 시 Google Sheets 데이터 로드
  useEffect(() => {
    if (currentPage === 'contacts' || currentPage === 'receivables') {
      if (contactData.length === 0) {
        fetchContacts();
      }
    }
  }, [currentPage]);

  // Team Contacts 페이지 진입 시 내부 담당자 데이터 로드
  useEffect(() => {
    if (currentPage === 'teamContacts') {
      if (internalContactData.length === 0) {
        fetchTeamContacts();
      }
    }
  }, [currentPage]);

  // Activity Logs 페이지 진입 시 로그 데이터 로드
  useEffect(() => {
    if (currentPage === 'activityLogs') {
      fetchAuditLogsData();
    }
  }, [currentPage]);

  // 인증 로딩 중
  if (authLoading) {
    return (
      <div className="min-h-screen bg-bg-body flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-agent-cyan animate-spin" />
          <span className="text-zinc-500 text-sm">로딩 중...</span>
        </div>
      </div>
    );
  }

  // 로그인 필요
  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />;
  }

  // 메인 앱
  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg-body text-zinc-100 font-sans">
      {/* Sidebar - Hidden on mobile, visible on lg */}
      <div className="hidden lg:block w-[220px] flex-shrink-0">
        <Sidebar 
          currentPage={currentPage} 
          onPageChange={setCurrentPage} 
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col h-full overflow-hidden relative">
        <div className="flex-1 overflow-y-scroll p-4 md:p-8 pb-20 lg:pb-8 bg-[radial-gradient(circle_at_50%_0%,#0c0c0e_0%,#020203_100%)]" style={{ scrollbarGutter: 'stable' }}>
          <DashboardHeader lastUpdated={lastUpdated} onRefresh={fetchData} toggleChat={() => setIsMobileChatOpen(!isMobileChatOpen)} />
          
          {/* Page Content based on currentPage */}
          {currentPage === 'dashboard' && (
            <div className="space-y-6 min-w-0">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Category Financial Overview</h2>
                <p className="text-sm text-zinc-500">22개 주요 카테고리별 재고 자산 현황</p>
              </div>
                <CategorySummary data={stockData} loading={loading} />
            </div>
          )}

          {currentPage === 'stockMaster' && (
            <div className="space-y-6 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-1">Stock Master</h2>
                <p className="text-sm text-zinc-500">전체 재고 품목 상세 목록</p>
                </div>
                {/* K1 / 에코비 / 미조립 탭 - 시안 (Stock Master 고유색) */}
                <div className="flex items-center bg-bg-card border border-border rounded-md p-0.5 flex-shrink-0">
                  <button
                    onClick={() => setStockTab('k1')}
                    className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                      stockTab === 'k1'
                        ? 'bg-cyan-500 text-black'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    K1
                  </button>
                  <button
                    onClick={() => setStockTab('ecob')}
                    className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                      stockTab === 'ecob'
                        ? 'bg-cyan-500 text-black'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    EcoB
                  </button>
                  <button
                    onClick={() => setStockTab('assembly')}
                    className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                      stockTab === 'assembly'
                        ? 'bg-cyan-500 text-black'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    미조립
                  </button>
                </div>
              </div>
              {stockTab === 'k1' && (
              <StockTable data={stockData} loading={loading} dataSource={dataSource} />
              )}
              {stockTab === 'assembly' && (
                <AssemblyTable data={stockData} loading={loading} dataSource={dataSource} />
              )}
              {stockTab === 'ecob' && (
                <StockTable data={ecobStockData} loading={ecobStockLoading} dataSource={ecobStockDataSource} />
              )}
            </div>
          )}

          {currentPage === 'newItems' && (
            <div className="space-y-6 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-1">New Items</h2>
                <p className="text-sm text-zinc-500">신규 등록 품목 (기존 목록에 없던 품목)</p>
                </div>
                {/* K1 / 에코비 탭 - 녹색 (New Items 고유색) */}
                <div className="flex items-center bg-bg-card border border-border rounded-md p-0.5 flex-shrink-0">
                  <button
                    onClick={() => setNewItemsTab('k1')}
                    className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                      newItemsTab === 'k1'
                        ? 'bg-emerald-500 text-black'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    K1
                  </button>
                  <button
                    onClick={() => setNewItemsTab('ecob')}
                    className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                      newItemsTab === 'ecob'
                        ? 'bg-emerald-500 text-black'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    EcoB
                  </button>
                </div>
              </div>
              {newItemsTab === 'k1' ? (
                <NewItemsTable data={stockData} loading={loading} dataSource={dataSource} sourceType="k1" />
              ) : (
                <NewItemsTable data={ecobStockData} loading={ecobStockLoading} dataSource={ecobStockDataSource} sourceType="ecob" />
              )}
            </div>
          )}

          {currentPage === 'dealHistory' && (
            <div className="space-y-6 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-1">Deal History</h2>
                <p className="text-sm text-zinc-500">입출고 거래 내역</p>
                </div>
                {/* K1 / 에코비 탭 - 주황 (Deal History 고유색) */}
                <div className="flex items-center bg-bg-card border border-border rounded-md p-0.5 flex-shrink-0">
                  <button
                    onClick={() => setDealTab('k1')}
                    className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                      dealTab === 'k1'
                        ? 'bg-orange-500 text-white'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    K1
                  </button>
                  <button
                    onClick={() => setDealTab('ecob')}
                    className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                      dealTab === 'ecob'
                        ? 'bg-orange-500 text-white'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    EcoB
                  </button>
                </div>
              </div>
              {dealTab === 'k1' ? (
                <DealHistoryTable data={dealData} loading={dealLoading} dataSource={dealDataSource} sourceType="k1" />
              ) : (
                <DealHistoryTable data={ecobDealData} loading={ecobDealLoading} dataSource={ecobDealDataSource} sourceType="ecob" />
              )}
            </div>
          )}

          {currentPage === 'contacts' && (
            <div className="space-y-6 min-w-0">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Sales Contacts</h2>
                <p className="text-sm text-zinc-500">영업 거래처 담당자 연락처</p>
              </div>
              <ContactsTable data={contactData} loading={contactLoading} />
            </div>
          )}

          {currentPage === 'receivables' && (
            <div className="space-y-6 min-w-0">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Receivables</h2>
                <p className="text-sm text-zinc-500">매출 채권 및 미수금 관리</p>
              </div>
              <ReceivablesTable data={contactData} loading={contactLoading} />
            </div>
          )}

          {currentPage === 'teamContacts' && (
            <div className="space-y-6 min-w-0">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Team Contacts</h2>
                <p className="text-sm text-zinc-500">품목별 내부 담당자 연락처</p>
              </div>
              <InternalContactsTable data={internalContactData} loading={internalContactLoading} />
            </div>
          )}

          {currentPage === 'activityLogs' && (
            <div className="space-y-6 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-1">Activity Logs</h2>
                  <p className="text-sm text-zinc-500">시스템 활동 기록 (관리자 전용)</p>
                </div>
                {/* K1 / 에코비 탭 - 로즈 (Activity Logs 고유색) */}
                <div className="flex items-center bg-bg-card border border-border rounded-md p-0.5 flex-shrink-0">
                  <button
                    onClick={() => setLogsTab('k1')}
                    className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                      logsTab === 'k1'
                        ? 'bg-rose-500 text-white'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    K1
                  </button>
                  <button
                    onClick={() => setLogsTab('ecob')}
                    className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                      logsTab === 'ecob'
                        ? 'bg-rose-500 text-white'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    EcoB
                  </button>
                </div>
              </div>
              <AuditLogsTable data={filteredAuditLogs} loading={auditLoading} onRefresh={fetchAuditLogsData} />
            </div>
          )}
        </div>
      </main>

      {/* Chat Panel - 모든 사용자에게 표시, viewer는 입력만 제한 */}
      <div className={`
        fixed inset-y-0 right-0 w-full sm:w-[360px] bg-bg-sidebar border-l border-border transform transition-transform duration-300 z-50
        lg:relative lg:w-[360px] lg:flex-shrink-0
        ${isMobileChatOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
         <div className="lg:hidden absolute top-4 left-4 z-50">
            <button onClick={() => setIsMobileChatOpen(false)} className="bg-bg-card border border-border p-2 rounded-full text-zinc-400">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
         </div>
        <ChatPanel canSendMessage={canUseChat} />
      </div>

      {/* Mobile Tab Bar - Only visible on mobile */}
      <MobileTabBar 
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onChatToggle={() => setIsMobileChatOpen(!isMobileChatOpen)}
        isChatOpen={isMobileChatOpen}
      />
    </div>
  );
}