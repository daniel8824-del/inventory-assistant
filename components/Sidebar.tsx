import React from 'react';
import { LayoutDashboard, Database, History, Package, ShoppingCart, Cpu, ExternalLink, Sparkles, Users, CreditCard, Users2 } from 'lucide-react';
import { PageType } from '../App';

interface SidebarProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
}

const FORM_URLS = {
  inventory: 'https://daniel8824.app.n8n.cloud/form/inventory',
  deal: 'https://daniel8824.app.n8n.cloud/form/deal',
};

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const inventoryMenuItems = [
    { id: 'dashboard' as PageType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'stockMaster' as PageType, label: 'Stock Master', icon: Database },
    { id: 'newItems' as PageType, label: 'New Items', icon: Sparkles },
    { id: 'dealHistory' as PageType, label: 'Deal History', icon: History },
  ];

  const customerMenuItems = [
    { id: 'teamContacts' as PageType, label: 'Team Contacts', icon: Users2 },
    { id: 'contacts' as PageType, label: 'Sales Contacts', icon: Users },
    { id: 'receivables' as PageType, label: 'Receivables', icon: CreditCard },
  ];

  const openForm = (formType: 'inventory' | 'deal') => {
    const width = 520;
    const height = 750;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    window.open(
      FORM_URLS[formType],
      `${formType}Form`,
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );
  };

  return (
    <aside className="h-full bg-bg-sidebar border-r border-border p-6 flex flex-col">
      <div className="flex items-center gap-3 pb-8 border-b border-border mb-8 text-agent-cyan font-mono font-extrabold text-base tracking-wide">
        <Cpu size={20} />
        <span>K1 Solution</span>
      </div>

      <nav className="flex-1">
        <div className="mb-6">
          <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-semibold block mb-4 px-2">
            Inventory Control
          </span>
          <ul className="space-y-1">
            {inventoryMenuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onPageChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    currentPage === item.id
                      ? 'bg-agent-cyan/10 text-white border-l-2 border-agent-cyan'
                      : 'text-zinc-500 hover:text-white hover:bg-zinc-900 border-l-2 border-transparent'
                  }`}
                >
                  <item.icon size={16} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-6">
          <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-semibold block mb-4 px-2">
            Customer Management
          </span>
          <ul className="space-y-1">
            {customerMenuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onPageChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    currentPage === item.id
                      ? 'bg-violet-500/10 text-white border-l-2 border-violet-500'
                      : 'text-zinc-500 hover:text-white hover:bg-zinc-900 border-l-2 border-transparent'
                  }`}
                >
                  <item.icon size={16} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-semibold block mb-4 px-2">
            Quick Actions
          </span>
          <ul className="space-y-1">
            <li>
              <button 
                onClick={() => openForm('inventory')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900 transition-all group"
              >
                <Package size={16} className="text-emerald-500" />
                <span className="text-sm font-medium">New Stock</span>
                <ExternalLink size={12} className="ml-auto opacity-50" />
              </button>
            </li>
            <li>
              <button 
                onClick={() => openForm('deal')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900 transition-all group"
              >
                <ShoppingCart size={16} className="text-orange-500" />
                <span className="text-sm font-medium">New Deal</span>
                <ExternalLink size={12} className="ml-auto opacity-50" />
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <div className="mt-auto">
        <div className="bg-white/5 border border-border rounded-xl p-4">
          <div className="text-[10px] text-zinc-500 font-bold mb-1">CONNECTED DB</div>
          <div className="font-mono text-xs text-agent-cyan">Datawave Supabase</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;