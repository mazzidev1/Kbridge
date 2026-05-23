import React, { useMemo } from 'react';
import { Invoice } from '../types';
import { formatCurrency, formatPercent, MOCK_INVOICES } from '../data';
import { ArrowLeft, Building2, ExternalLink, TrendingUp, Bookmark } from 'lucide-react';
import { BusinessLogo } from './InvoiceList';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';

interface BorrowerProfileProps {
  borrowerName: string;
  onBack: () => void;
  onSelectInvoice: (id: string) => void;
  isWatched?: boolean;
  onToggleWatch?: (name: string) => void;
}

export const BorrowerProfile: React.FC<BorrowerProfileProps> = ({ 
  borrowerName, 
  onBack, 
  onSelectInvoice,
  isWatched = false,
  onToggleWatch
}) => {
  const invoices = MOCK_INVOICES.filter(inv => inv.borrowerName === borrowerName);
  const firstInvoice = invoices[0];

  const totalFunded = invoices.filter(i => !['Pending', 'Tokenized', 'Funding'].includes(i.status)).reduce((acc, curr) => acc + curr.invoiceAmount, 0);
  const activeAmount = invoices.filter(i => ['Funding', 'Tokenized'].includes(i.status)).reduce((acc, curr) => acc + curr.invoiceAmount, 0);
  const avgYield = invoices.reduce((acc, curr) => acc + curr.yieldRate, 0) / (invoices.length || 1);

  // Generate some mock historical yield data to make the chart look nice
  const mockHistoricalYield = useMemo(() => {
    const baseYield = avgYield * 100;
    const data = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Generate 6 months of data ending in current month
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (new Date().getMonth() - i + 12) % 12;
      // Add some random variance (-0.5% to +0.5%)
      const variance = (Math.random() - 0.5);
      data.push({
        month: months[monthIndex],
        yield: Number((baseYield + variance).toFixed(2))
      });
    }
    return data;
  }, [avgYield]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <button 
        onClick={onBack}
        className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </button>

      <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <BusinessLogo name={borrowerName} sector={firstInvoice?.sector} color={firstInvoice?.logoColor} className="h-20 w-20 sm:h-24 sm:w-24 text-3xl sm:text-4xl rounded-xl sm:rounded-2xl shrink-0" />
          <div className="flex-1 w-full">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-xs font-mono font-medium text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded border border-gray-200 uppercase tracking-wider">
                {firstInvoice?.sector}
              </span>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-800 border border-green-100">
                Verified Borrower
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{borrowerName}</h1>
              <button
                onClick={() => onToggleWatch?.(borrowerName)}
                className={`inline-flex items-center justify-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors shadow-sm select-none shrink-0 ${
                  isWatched 
                    ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100/80' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Bookmark className={`h-4 w-4 mr-2 ${isWatched ? 'fill-amber-500 text-amber-500 font-bold' : 'text-gray-400'}`} />
                {isWatched ? 'Watching Borrower' : 'Watch Borrower'}
              </button>
            </div>
            <p className="text-gray-600 text-base max-w-3xl leading-relaxed">
              {firstInvoice?.borrowerDetails}
            </p>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-gray-100 pt-8">
              <div>
                <div className="text-sm text-gray-500 mb-1">Total Facilities</div>
                <div className="text-xl font-semibold text-gray-900">{invoices.length}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Historical Funded</div>
                <div className="text-xl font-mono font-medium text-gray-900">{formatCurrency(totalFunded)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Currently Seeking</div>
                <div className="text-xl font-mono font-medium text-blue-600">{formatCurrency(activeAmount)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Avg Historical Yield</div>
                <div className="text-xl font-medium text-green-600">{formatPercent(avgYield)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Active & Historical Facilities</h2>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden h-[400px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Facility ID</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yield & Term</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-4 relative"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="text-sm font-mono text-gray-900">{inv.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono font-medium text-gray-900">{formatCurrency(inv.invoiceAmount)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatPercent(inv.yieldRate)} APY</div>
                      <div className="text-xs text-gray-500 mt-1">{inv.termDays} days • {inv.maturityDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <InvoiceStatusBadge status={inv.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => onSelectInvoice(inv.id)}
                        className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-900 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        View
                        <ExternalLink className="h-4 w-4 ml-1" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 text-transparent select-none hidden lg:block">Chart</h2>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 h-[400px] flex flex-col">
            <h3 className="text-sm font-semibold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
              Historical APY Trend
            </h3>
            <div className="flex-1 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockHistoricalYield} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16A34A" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#16A34A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    width={50}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    domain={['dataMin - 0.5', 'auto']}
                    tickFormatter={(value) => `${value.toFixed(1)}%`}
                  />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value: number) => [`${value.toFixed(2)}%`, 'Yield (APY)']}
                    labelStyle={{ color: '#374151', fontWeight: 600, marginBottom: '4px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="yield" 
                    stroke="#16A34A" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorYield)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
