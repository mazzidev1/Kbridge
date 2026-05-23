import React, { useState } from 'react';
import { Invoice } from '../types';
import { formatCurrency, formatPercent, MOCK_INVOICES } from '../data';
import { Download, FileSpreadsheet, Building2, ChevronRight, FileText, Search, Filter, X, ArrowRight, ArrowUpRight } from 'lucide-react';

interface InvoiceListProps {
  onSelectInvoice: (id: string) => void;
  onSelectBorrower?: (name: string) => void;
}

export const BusinessLogo = ({ name, color, className = "h-10 w-10 text-gray-500 bg-gray-100" }: { name?: string, color?: string, sector?: string, className?: string }) => {
  return (
    <div className={`flex-shrink-0 flex items-center justify-center rounded-md ${className}`}>
      <Building2 className="h-1/2 w-1/2" />
    </div>
  );
};

export const InvoiceList: React.FC<InvoiceListProps> = ({ onSelectInvoice, onSelectBorrower }) => {
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [comparedInvoiceIds, setComparedInvoiceIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const handleToggleCompare = (id: string) => {
    setComparedInvoiceIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      if (prev.length >= 2) {
        return [prev[0], id];
      }
      return [...prev, id];
    });
  };
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [showSectorDropdown, setShowSectorDropdown] = useState(false);
  const [selectedYields, setSelectedYields] = useState<string[]>([]);
  const [showYieldDropdown, setShowYieldDropdown] = useState(false);

  const availableSectors = Array.from(new Set(MOCK_INVOICES.map(i => i.sector)));
  const yieldOptions = ['< 5%', '5% - 7%', '> 7%'];

  const filteredInvoices = MOCK_INVOICES.filter(inv => {
    const matchesSearch = inv.borrowerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inv.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = selectedSectors.length === 0 || selectedSectors.includes(inv.sector);
    
    let matchesYield = selectedYields.length === 0;
    if (!matchesYield) {
      if (selectedYields.includes('< 5%') && inv.yieldRate < 5) matchesYield = true;
      if (selectedYields.includes('5% - 7%') && inv.yieldRate >= 5 && inv.yieldRate <= 7) matchesYield = true;
      if (selectedYields.includes('> 7%') && inv.yieldRate > 7) matchesYield = true;
    }

    return matchesSearch && matchesSector && matchesYield;
  });

  const handleExport = (type: 'PDF' | 'Excel') => {
    setExportMessage(`Exporting report to ${type}...`);
    setTimeout(() => setExportMessage(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Marketplace</h1>
          <p className="text-sm text-gray-500 mt-1">Browse and invest in institutional-grade invoice facilities.</p>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-3 w-full md:w-auto">
          {exportMessage && (
            <span className="hidden sm:flex text-sm text-green-600 font-medium mr-4 items-center bg-green-50 px-3 py-1 rounded-full border border-green-200">
              {exportMessage}
            </span>
          )}
          <button 
            onClick={() => handleExport('PDF')}
            className="flex-1 sm:flex-none flex items-center justify-center px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm transition-colors whitespace-nowrap"
          >
            <FileText className="h-4 w-4 mr-1.5 sm:mr-2 text-gray-500" />
            PDF
          </button>
          <button 
            onClick={() => handleExport('Excel')}
            className="flex-1 sm:flex-none flex items-center justify-center px-3 sm:px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 shadow-sm transition-colors whitespace-nowrap"
          >
            <FileSpreadsheet className="h-4 w-4 mr-1.5 sm:mr-2" />
            Excel
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative">
        <div className="flex-1 flex flex-col sm:flex-row gap-3 w-full">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <button 
                onClick={() => {
                  setShowSectorDropdown(!showSectorDropdown);
                  setShowYieldDropdown(false);
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="truncate">{selectedSectors.length === 0 ? 'All Sectors' : `${selectedSectors.length} Sectors`}</span>
              </button>
              
              {showSectorDropdown && (
                <div className="absolute top-12 left-0 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-2">
                  <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase">Sector</span>
                    {selectedSectors.length > 0 && (
                       <button onClick={() => setSelectedSectors([])} className="text-xs text-blue-600 hover:underline">Clear</button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {availableSectors.map(sector => (
                      <label key={sector} className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-black focus:ring-black mr-3"
                          checked={selectedSectors.includes(sector)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSectors([...selectedSectors, sector]);
                            } else {
                              setSelectedSectors(selectedSectors.filter(s => s !== sector));
                            }
                          }}
                        />
                        <span className="text-sm text-gray-700">{sector}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative flex-1 sm:flex-none">
              <button 
                onClick={() => {
                  setShowYieldDropdown(!showYieldDropdown);
                  setShowSectorDropdown(false);
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="truncate">{selectedYields.length === 0 ? 'Any Yield' : `${selectedYields.length} Yields`}</span>
              </button>
              
              {showYieldDropdown && (
                <div className="absolute top-12 left-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-2">
                  <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase">Yield Rate</span>
                    {selectedYields.length > 0 && (
                       <button onClick={() => setSelectedYields([])} className="text-xs text-blue-600 hover:underline">Clear</button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {yieldOptions.map(y => (
                      <label key={y} className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-black focus:ring-black mr-3"
                          checked={selectedYields.includes(y)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedYields([...selectedYields, y]);
                            } else {
                              setSelectedYields(selectedYields.filter(s => s !== y));
                            }
                          }}
                        />
                        <span className="text-sm text-gray-700">{y}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-12">Compare</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice Details</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Originator</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yield & Term</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 relative"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-black focus:ring-black h-4 w-4 cursor-pointer"
                      checked={comparedInvoiceIds.includes(inv.id)}
                      onChange={() => handleToggleCompare(inv.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div 
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={(e) => {
                           e.stopPropagation();
                           if (onSelectBorrower) onSelectBorrower(inv.borrowerName);
                        }}
                      >
                        <BusinessLogo name={inv.borrowerName} sector={inv.sector} color={inv.logoColor} />
                      </div>
                      <div className="ml-4">
                        <div 
                          className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={(e) => {
                             e.stopPropagation();
                             if (onSelectBorrower) onSelectBorrower(inv.borrowerName);
                          }}
                        >
                          {inv.borrowerName}
                        </div>
                        <div className="text-sm font-mono text-gray-500 mt-0.5">{inv.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono font-medium text-gray-900">{formatCurrency(inv.invoiceAmount)}</div>
                    <div className="text-xs text-gray-500 mt-1">{inv.sector}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-100">
                      {inv.originator}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatPercent(inv.yieldRate)} APY</div>
                    <div className="text-xs text-gray-500 mt-1">{inv.termDays} days • {inv.maturityDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full max-w-[120px]">
                      <div className="flex justify-between text-xs mb-1">
                        <span className={`font-medium ${inv.status === 'Funded' ? 'text-green-600' : 'text-gray-700'}`}>
                          {inv.status}
                        </span>
                        <span className="font-mono text-gray-500">
                          {inv.totalTokens - inv.availableTokens}/{inv.totalTokens}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${inv.status === 'Funded' ? 'bg-green-500' : 'bg-black'}`}
                          style={{ width: `${((inv.totalTokens - inv.availableTokens) / inv.totalTokens) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => onSelectInvoice(inv.id)}
                      className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-900 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Invest
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating compare selector bar */}
      {comparedInvoiceIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white border border-gray-200 shadow-2xl rounded-2xl z-40 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 w-[90%] max-w-3xl animate-in slide-in-from-bottom-8 duration-300">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-semibold text-gray-900">Compare:</span>
            <div className="flex flex-wrap gap-2">
              {comparedInvoiceIds.map(id => {
                return (
                  <div key={id} className="bg-gray-100/90 text-xs px-2.5 py-1 rounded-md border border-gray-200 flex items-center space-x-1.5 font-mono shadow-sm">
                    <span className="font-semibold text-gray-800">{id}</span>
                    <button 
                      onClick={() => handleToggleCompare(id)} 
                      className="text-gray-400 hover:text-gray-700 font-bold ml-1 text-base leading-none transition-colors"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button 
              onClick={() => setShowCompareModal(true)}
              disabled={comparedInvoiceIds.length < 2}
              className="px-5 py-2.5 bg-black text-white hover:bg-gray-800 text-sm font-semibold rounded-lg disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-sm shrink-0 flex items-center"
            >
              Compare Side-by-Side
              <ChevronRight className="h-4 w-4 ml-1 shrink-0" />
            </button>
            <button 
              onClick={() => setComparedInvoiceIds([])} 
              className="text-xs text-gray-500 hover:text-gray-900 font-medium whitespace-nowrap"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Compare Modal Backdrop */}
      {showCompareModal && comparedInvoiceIds.length === 2 && (() => {
        const invA = MOCK_INVOICES.find(i => i.id === comparedInvoiceIds[0])!;
        const invB = MOCK_INVOICES.find(i => i.id === comparedInvoiceIds[1])!;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCompareModal(false)}></div>
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-4xl w-full z-10 max-h-[90vh] overflow-hidden flex flex-col animate-in scale-in duration-300">
              
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Side-by-Side Comparison</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Direct tabular mapping between selected facility tokens</p>
                </div>
                <button 
                  onClick={() => setShowCompareModal(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Grid content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <table className="min-w-full text-sm divide-y divide-gray-200 border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">Metric</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-900 border-l border-gray-100 w-3/8">
                         <div className="font-mono text-gray-500 font-normal mb-1">{invA.id}</div>
                         <div className="font-bold flex items-center space-x-2 text-sm">
                            <BusinessLogo name={invA.borrowerName} color={invA.logoColor} className="h-6 w-6 rounded shrink-0 mr-1.5" />
                            <span>{invA.borrowerName}</span>
                         </div>
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-900 border-l border-gray-100 w-3/8">
                         <div className="font-mono text-gray-500 font-normal mb-1">{invB.id}</div>
                         <div className="font-bold flex items-center space-x-2 text-sm">
                            <BusinessLogo name={invB.borrowerName} color={invB.logoColor} className="h-6 w-6 rounded shrink-0 mr-1.5" />
                            <span>{invB.borrowerName}</span>
                         </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    
                    <tr>
                      <td className="px-6 py-4 font-semibold text-gray-700 bg-gray-50/20">Sector</td>
                      <td className="px-6 py-4 border-l border-gray-100">
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-mono bg-gray-100 text-gray-700 uppercase">{invA.sector}</span>
                      </td>
                      <td className="px-6 py-4 border-l border-gray-100">
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-mono bg-gray-100 text-gray-700 uppercase">{invB.sector}</span>
                      </td>
                    </tr>

                    <tr>
                      <td className="px-6 py-4 font-semibold text-gray-700 bg-gray-50/20">Yield / APY</td>
                      <td className="px-6 py-4 border-l border-gray-100 text-green-600 font-bold font-mono text-base">
                        {formatPercent(invA.yieldRate)}
                      </td>
                      <td className="px-6 py-4 border-l border-gray-100 text-green-600 font-bold font-mono text-base">
                        {formatPercent(invB.yieldRate)}
                      </td>
                    </tr>

                    <tr>
                      <td className="px-6 py-4 font-semibold text-gray-700 bg-gray-50/20">Term Duration</td>
                      <td className="px-6 py-4 border-l border-gray-100 font-medium">
                        {invA.termDays} Days
                      </td>
                      <td className="px-6 py-4 border-l border-gray-100 font-medium">
                        {invB.termDays} Days
                      </td>
                    </tr>

                    <tr>
                      <td className="px-6 py-4 font-semibold text-gray-700 bg-gray-50/20">Maturity Date</td>
                      <td className="px-6 py-4 border-l border-gray-100 text-gray-600 font-medium">
                        {invA.maturityDate}
                      </td>
                      <td className="px-6 py-4 border-l border-gray-100 text-gray-600 font-medium">
                        {invB.maturityDate}
                      </td>
                    </tr>

                    <tr>
                      <td className="px-6 py-4 font-semibold text-gray-700 bg-gray-50/20">Invoice Amount</td>
                      <td className="px-6 py-4 border-l border-gray-100 font-mono text-gray-950 font-semibold text-sm">
                        {formatCurrency(invA.invoiceAmount)}
                      </td>
                      <td className="px-6 py-4 border-l border-gray-100 font-mono text-gray-950 font-semibold text-sm">
                        {formatCurrency(invB.invoiceAmount)}
                      </td>
                    </tr>

                    <tr>
                      <td className="px-6 py-4 font-semibold text-gray-700 bg-gray-50/20">Originator / Custodian</td>
                      <td className="px-6 py-4 border-l border-gray-100">
                         <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-100">{invA.originator}</span>
                      </td>
                      <td className="px-6 py-4 border-l border-gray-100">
                         <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-100">{invB.originator}</span>
                      </td>
                    </tr>

                    <tr>
                      <td className="px-6 py-4 font-semibold text-gray-700 bg-gray-50/20">Progress Funded</td>
                      <td className="px-6 py-4 border-l border-gray-100">
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="font-semibold text-gray-900">
                            {Math.round(((invA.totalTokens - invA.availableTokens) / invA.totalTokens) * 100)}%
                          </span>
                          <span className="font-mono text-gray-500">
                            ({invA.totalTokens - invA.availableTokens}/{invA.totalTokens} tokens)
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 border border-gray-200 rounded-full h-1.5 mt-1.5 overflow-hidden">
                          <div 
                            className={`h-full ${invA.status === 'Funded' ? 'bg-green-500' : 'bg-black'}`}
                            style={{ width: `${((invA.totalTokens - invA.availableTokens) / invA.totalTokens) * 100}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 border-l border-gray-100">
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="font-semibold text-gray-900">
                            {Math.round(((invB.totalTokens - invB.availableTokens) / invB.totalTokens) * 100)}%
                          </span>
                          <span className="font-mono text-gray-500">
                            ({invB.totalTokens - invB.availableTokens}/{invB.totalTokens} tokens)
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 border border-gray-200 rounded-full h-1.5 mt-1.5 overflow-hidden">
                          <div 
                            className={`h-full ${invB.status === 'Funded' ? 'bg-green-500' : 'bg-black'}`}
                            style={{ width: `${((invB.totalTokens - invB.availableTokens) / invB.totalTokens) * 100}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td className="px-6 py-4 font-semibold text-gray-700 bg-gray-50/20"></td>
                      <td className="px-6 py-4 border-l border-gray-100">
                         <button
                           onClick={() => {
                             setShowCompareModal(false);
                             onSelectInvoice(invA.id);
                           }}
                           className="w-full py-2 bg-black hover:bg-gray-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                         >
                           View & Invest in {invA.id}
                         </button>
                      </td>
                      <td className="px-6 py-4 border-l border-gray-100">
                         <button
                           onClick={() => {
                             setShowCompareModal(false);
                             onSelectInvoice(invB.id);
                           }}
                           className="w-full py-2 bg-black hover:bg-gray-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                         >
                           View & Invest in {invB.id}
                         </button>
                      </td>
                    </tr>

                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end shrink-0">
                 <button 
                   onClick={() => setShowCompareModal(false)}
                   className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 font-semibold text-sm rounded-lg text-gray-700 transition-colors"
                 >
                   Close
                 </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
};
