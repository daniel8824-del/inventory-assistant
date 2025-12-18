import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import DashboardHeader from './components/DashboardHeader';
import CategorySummary from './components/CategorySummary';
import StockTable from './components/StockTable';
import NewItemsTable from './components/NewItemsTable';
import DealHistoryTable from './components/DealHistoryTable';
import ChatPanel from './components/ChatPanel';
import { StockItem, DealItem } from './types';
import { fetchStockData, fetchDealData, fetchGoogleSheetData, fetchInternalContacts, DataSourceType, ContactItem, InternalContact, subscribeToStockChanges, subscribeToDealChanges, unsubscribeChannel } from './services/api';
import ContactsTable from './components/ContactsTable';
import ReceivablesTable from './components/ReceivablesTable';
import InternalContactsTable from './components/InternalContactsTable';
import { GET_MOCK_DATA } from './constants';
import { RealtimeChannel } from '@supabase/supabase-js';

export type PageType = 'dashboard' | 'stockMaster' | 'dealHistory' | 'newItems' | 'contacts' | 'receivables' | 'teamContacts';

export default function App() {
  const [stockData, setStockData] = useState<StockItem[]>([]);
  const [dealData, setDealData] = useState<DealItem[]>([]);
  const [contactData, setContactData] = useState<ContactItem[]>([]);
  const [internalContactData, setInternalContactData] = useState<InternalContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [dealLoading, setDealLoading] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [internalContactLoading, setInternalContactLoading] = useState(false);
  const [dataSource, setDataSource] = useState<DataSourceType>('SIMULATION');
  const [dealDataSource, setDealDataSource] = useState<DataSourceType>('SIMULATION');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');

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

  // Realtime 채널 refs
  const stockChannelRef = useRef<RealtimeChannel | null>(null);
  const dealChannelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    fetchData();
    
    // Realtime 구독 시작
    stockChannelRef.current = subscribeToStockChanges(() => {
      console.log("[App] 🔄 Stock data updated via Realtime!");
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
    };
  }, []);

  // Deal History 페이지 진입 시 데이터 로드 및 Realtime 구독
  useEffect(() => {
    if (currentPage === 'dealHistory') {
      if (dealData.length === 0) {
        fetchDeals();
      }
      
      // Deal History 페이지에서만 deal_data 구독
      if (!dealChannelRef.current) {
        dealChannelRef.current = subscribeToDealChanges(() => {
          console.log("[App] 🔄 Deal data updated via Realtime!");
          fetchDeals();
        });
      }
    }
  }, [currentPage]);

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

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg-body text-zinc-100 font-sans">
      {/* Sidebar - Hidden on mobile, visible on lg */}
      <div className="hidden lg:block w-[260px] flex-shrink-0">
        <Sidebar 
          currentPage={currentPage} 
          onPageChange={setCurrentPage} 
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[radial-gradient(circle_at_50%_0%,#0c0c0e_0%,#020203_100%)]">
          <DashboardHeader lastUpdated={lastUpdated} onRefresh={fetchData} toggleChat={() => setIsMobileChatOpen(!isMobileChatOpen)} />
          
          {/* Page Content based on currentPage */}
          {currentPage === 'dashboard' && (
            <div className="space-y-8">
              {/* 22 Category Financial Overview */}
              <section>
                <CategorySummary data={stockData} loading={loading} />
              </section>
            </div>
          )}

          {currentPage === 'stockMaster' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Stock Master</h2>
                <p className="text-sm text-zinc-500">전체 재고 품목 상세 목록</p>
              </div>
              <StockTable data={stockData} loading={loading} dataSource={dataSource} />
            </div>
          )}

          {currentPage === 'newItems' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">New Items</h2>
                <p className="text-sm text-zinc-500">신규 등록 품목 (기존 목록에 없던 품목)</p>
              </div>
              <NewItemsTable data={stockData} loading={loading} dataSource={dataSource} />
            </div>
          )}

          {currentPage === 'dealHistory' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Deal History</h2>
                <p className="text-sm text-zinc-500">입출고 거래 내역</p>
              </div>
              <DealHistoryTable data={dealData} loading={dealLoading} dataSource={dealDataSource} />
            </div>
          )}

          {currentPage === 'contacts' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Sales Contacts</h2>
                <p className="text-sm text-zinc-500">영업 거래처 담당자 연락처</p>
              </div>
              <ContactsTable data={contactData} loading={contactLoading} />
            </div>
          )}

          {currentPage === 'receivables' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Receivables</h2>
                <p className="text-sm text-zinc-500">매출 채권 및 미수금 관리</p>
              </div>
              <ReceivablesTable data={contactData} loading={contactLoading} />
            </div>
          )}

          {currentPage === 'teamContacts' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Team Contacts</h2>
                <p className="text-sm text-zinc-500">품목별 내부 담당자 연락처</p>
              </div>
              <InternalContactsTable data={internalContactData} loading={internalContactLoading} />
            </div>
          )}
        </div>
      </main>

      {/* Chat Panel - Sidebar on right for desktop, Slide-over for mobile */}
      <div className={`
        fixed inset-y-0 right-0 w-full sm:w-[440px] bg-bg-sidebar border-l border-border transform transition-transform duration-300 z-50
        lg:relative lg:transform-none lg:block
        ${isMobileChatOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
         <div className="lg:hidden absolute top-4 left-4 z-50">
            <button onClick={() => setIsMobileChatOpen(false)} className="bg-bg-card border border-border p-2 rounded-full text-zinc-400">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
         </div>
        <ChatPanel />
      </div>
    </div>
  );
}