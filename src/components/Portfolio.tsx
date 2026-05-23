import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { UserInvestment } from '../types';
import { formatCurrency, MOCK_INVOICES } from '../data';
import { PieChart as PieChartIcon, TrendingUp, Calendar, ArrowRight, ArrowUpRight, Database, Eye } from 'lucide-react';
import { BusinessLogo } from './InvoiceList';

const getStatus = (maturityDate: string) => {
  const now = new Date();
  const date = new Date(maturityDate);
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { label: 'Settled', color: 'bg-gray-100 text-gray-800 border-gray-200', dot: 'bg-gray-400' };
  if (diffDays <= 14) return { label: 'Maturity Approaching', color: 'bg-orange-50 text-orange-800 border-orange-200', dot: 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]' };
  return { label: 'Active', color: 'bg-blue-50 text-blue-800 border-blue-200', dot: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' };
};

export const Portfolio = ({ 
  portfolio, 
  watchedBorrowers = [], 
  onViewBorrower, 
  onBrowse, 
  onSelectInvestment 
}: { 
  portfolio: UserInvestment[], 
  watchedBorrowers?: string[], 
  onViewBorrower?: (name: string) => void, 
  onBrowse: () => void, 
  onSelectInvestment: (id: string) => void 
}) => {
  const totalInvested = portfolio.reduce((acc, curr) => acc + curr.totalCost, 0);
  const totalExpectedReturn = portfolio.reduce((acc, curr) => acc + curr.expectedReturn, 0);
  const totalShares = portfolio.reduce((acc, curr) => acc + curr.shares, 0);

  const timeline = [...portfolio].sort((a, b) => new Date(a.maturityDate).getTime() - new Date(b.maturityDate).getTime());

  const sectorData = useMemo(() => {
    const dataMap: Record<string, number> = {};
    for (const inv of portfolio) {
      const invoice = MOCK_INVOICES.find(i => i.id === inv.invoiceId);
      const sector = invoice?.sector || 'Other';
      dataMap[sector] = (dataMap[sector] || 0) + inv.totalCost;
    }
    return Object.entries(dataMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [portfolio]);

  const COLORS = ['#2563EB', '#16A34A', '#D97706', '#DC2626', '#7C3AED', '#0891B2', '#4F46E5', '#EA580C', '#475569'];

  if (portfolio.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-500">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">My Portfolio</h1>
        <div className="bg-white rounded-xl border border-gray-200 text-center py-20 px-4 shadow-sm mb-8">
          <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
             <PieChartIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">No active investments</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto leading-relaxed">
            You haven't purchased any invoice tokens yet. Browse the marketplace to find high-yield institutional opportunities on chain.
          </p>
          <button 
            onClick={onBrowse}
            className="inline-flex items-center px-4 py-2 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors shadow-sm"
          >
             Browse Marketplace
             <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>

        {watchedBorrowers && watchedBorrowers.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 max-w-7xl mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Eye className="h-5 w-5 mr-2 text-blue-500" />
              Watched Borrowers
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {watchedBorrowers.map(name => {
                const bInvoices = MOCK_INVOICES.filter(i => i.borrowerName === name);
                const firstInvoice = bInvoices[0];
                const active = bInvoices.filter(i => i.status === 'Funding' || i.status === 'Tokenized').length;
                return (
                  <div 
                    key={name}
                    onClick={() => onViewBorrower?.(name)}
                    className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-gray-900 hover:shadow-sm transition-all flex items-center justify-between group bg-white"
                  >
                     <div className="flex items-center space-x-3">
                        <BusinessLogo name={name} sector={firstInvoice?.sector} color={firstInvoice?.logoColor} className="h-10 w-10 text-sm rounded-lg" />
                        <div>
                           <h4 className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{name}</h4>
                           <p className="text-xs text-gray-500">{firstInvoice?.sector} • {active} open {active === 1 ? 'facility' : 'facilities'}</p>
                        </div>
                     </div>
                     <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-900 transition-colors" />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">My Portfolio</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of your active tokenized invoice investments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center text-sm font-medium text-gray-500 mb-4">
            <PieChartIcon className="h-4 w-4 mr-2" /> Total Invested
          </div>
          <div className="text-3xl font-mono font-medium text-gray-900">{formatCurrency(totalInvested)}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center text-sm font-medium text-gray-500 mb-4">
            <TrendingUp className="h-4 w-4 mr-2" /> Expected Interest Gain
          </div>
          <div className="text-3xl font-mono font-medium text-green-600">+{formatCurrency(totalExpectedReturn)}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center text-sm font-medium text-gray-500 mb-4">
            <Database className="h-4 w-4 mr-2" /> Token Holdings
          </div>
          <div className="text-3xl font-mono font-medium text-gray-900">{totalShares} <span className="text-lg text-gray-500 font-sans">Shares</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col">
          <h3 className="text-sm font-semibold text-gray-900 mb-6 flex items-center">
            <PieChartIcon className="h-4 w-4 mr-2 text-gray-400" />
            Sector Allocation
          </h3>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sectorData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 shrink-0">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-gray-500" />
              Maturity Timeline
            </h3>
          </div>
          <div className="divide-y divide-gray-200 overflow-y-auto w-full lg:max-h-[380px]">
          {timeline.map((inv) => {
             const status = getStatus(inv.maturityDate);
             return (
               <div 
                 key={inv.id} 
                 onClick={() => onSelectInvestment(inv.invoiceId)}
                 className="p-6 hover:bg-gray-50 transition-colors cursor-pointer group"
               >
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div className="flex items-start mb-4 sm:mb-0">
                      <div className={`mt-1.5 h-3 w-3 rounded-full mr-4 shrink-0 ${status.dot}`}></div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="text-sm font-mono text-gray-500">{inv.maturityDate}</div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <div className="text-lg font-medium text-gray-900">{inv.borrowerName}</div>
                        <div className="text-sm text-gray-500 mt-0.5"><span className="font-mono">{inv.shares}</span> tokens • {inv.invoiceId}</div>
                      </div>
                    </div>
                  <div className="text-left sm:text-right ml-7 sm:ml-0 flex items-center justify-end">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Principal + Yield</div>
                      <div className="text-lg font-mono font-medium text-gray-900 mb-1">{formatCurrency(inv.totalCost + inv.expectedReturn)}</div>
                      <div className="text-xs font-semibold text-green-700 bg-green-50/80 border border-green-200 inline-block px-2 py-1 rounded-md shadow-sm">
                         <span className="flex items-center"><ArrowUpRight className="h-3 w-3 mr-1" />+{formatCurrency(inv.expectedReturn)}</span>
                      </div>
                    </div>
                    <div className="ml-6 text-gray-300 group-hover:text-gray-900 transition-colors opacity-0 group-hover:opacity-100 hidden sm:block">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  </div>
               </div>
             </div>
           );
          })}
        </div>
      </div>
      </div>

      {/* Watched Borrowers Section */}
      {watchedBorrowers && watchedBorrowers.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Eye className="h-5 w-5 mr-2 text-blue-500" />
            Watched Borrowers
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {watchedBorrowers.map(name => {
              const bInvoices = MOCK_INVOICES.filter(i => i.borrowerName === name);
              const firstInvoice = bInvoices[0];
              const active = bInvoices.filter(i => i.status === 'Funding' || i.status === 'Tokenized').length;
              return (
                <div 
                  key={name}
                  onClick={() => onViewBorrower?.(name)}
                  className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-gray-900 hover:shadow-sm transition-all flex items-center justify-between group bg-white"
                >
                   <div className="flex items-center space-x-3">
                      <BusinessLogo name={name} sector={firstInvoice?.sector} color={firstInvoice?.logoColor} className="h-10 w-10 text-sm rounded-lg" />
                      <div>
                         <h4 className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{name}</h4>
                         <p className="text-xs text-gray-500">{firstInvoice?.sector} • {active} open {active === 1 ? 'facility' : 'facilities'}</p>
                      </div>
                   </div>
                   <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-900 transition-colors" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Transaction History Section */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <svg className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Transaction History
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {portfolio.map((inv) => (
             <div key={inv.id} className="p-4 sm:px-6 hover:bg-gray-50 transition-colors">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                 <div>
                   <div className="flex items-center space-x-2 text-sm text-gray-900 font-medium mb-1">
                     <span>Investment Execution</span>
                     <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                       inv.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                     }`}>
                       {inv.status}
                     </span>
                   </div>
                   <div className="text-xs text-gray-500 mb-1">
                     {new Date(inv.timestamp).toLocaleString()}
                   </div>
                   <div className="text-xs font-mono text-gray-500 truncate w-full sm:w-64 md:w-96">
                     TxHash: {inv.txHash}
                   </div>
                 </div>
                 <div className="text-left sm:text-right mt-2 sm:mt-0">
                   <div className="text-sm font-medium text-gray-900">{inv.shares} Tokens</div>
                   <div className="text-xs text-gray-500">{formatCurrency(inv.totalCost)} USD</div>
                 </div>
               </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};
