import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatPercent, MOCK_INVOICES } from '../data';
import { ArrowLeft, Clock, Building2, ShieldCheck, Download, Link as LinkIcon, Database, Check, Wallet, Eye, FileText, AlertTriangle, X, Info, TrendingUp, ArrowRightLeft, Users, Tag } from 'lucide-react';
import { InvestorAllocation, UserInvestment, Document, Invoice } from '../types';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { BusinessLogo } from './InvoiceList';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';

interface InvoiceDetailProps {
  invoice: Invoice;
  onBack: () => void;
  walletAddress: string | null;
  onConnect: () => void;
  onInvest: (inv: Omit<UserInvestment, 'id' | 'timestamp' | 'txHash' | 'status'>) => void;
  backText: string;
  onViewBorrower: (name: string) => void;
  availableBalance?: number;
  userListings?: any[];
}

export const InvoiceDetail: React.FC<InvoiceDetailProps> = ({ 
  invoice, 
  onBack, 
  walletAddress, 
  onConnect, 
  onInvest, 
  backText, 
  onViewBorrower,
  availableBalance = 1500000,
  userListings = []
}) => {
  const [sharesToBuy, setSharesToBuy] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [liveInvestors, setLiveInvestors] = useState<InvestorAllocation[]>(invoice.recentInvestors);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showContractPreview, setShowContractPreview] = useState(false);

  // Secondary Market listings for sold out invoices
  const [secondaryListings, setSecondaryListings] = useState<{
    id: string;
    seller: string;
    shares: number;
    price: number;
    isBuying: boolean;
    isBought: boolean;
  }[]>([]);

  useEffect(() => {
    // Generate some highly realistic secondary listings in the 50,000 range
    // when primary tokens are sold out (availableTokens === 0)
    if (invoice.availableTokens === 0) {
      setSecondaryListings([
        {
          id: `${invoice.id}-sec-1`,
          seller: '0x71C8...' + invoice.id.substring(2) + '3A9B',
          shares: 12500,
          price: invoice.tokenPrice,
          isBuying: false,
          isBought: false,
        },
        {
          id: `${invoice.id}-sec-2`,
          seller: '0x992A...' + invoice.id.substring(2) + 'B4F1',
          shares: 8400,
          price: invoice.tokenPrice,
          isBuying: false,
          isBought: false,
        },
        {
          id: `${invoice.id}-sec-3`,
          seller: '0x4F05...' + invoice.id.substring(2) + 'D722',
          shares: 14000,
          price: invoice.tokenPrice,
          isBuying: false,
          isBought: false,
        }
      ]);
    } else {
      setSecondaryListings([]);
    }
  }, [invoice]);

  // Merge user's listings of this invoice into the listings
  const listingsToDisplay = useMemo(() => {
    const currentInvoiceUserListings = userListings
      .filter((l: any) => l.invoiceId === invoice.id)
      .map((l: any) => ({
        id: l.id,
        seller: l.seller,
        shares: l.shares,
        price: l.price,
        isBuying: l.isBuying,
        isBought: l.isBought,
        isUserListing: true,
      }));
    
    // Show user listings prominently at the top of secondary options!
    return [...currentInvoiceUserListings, ...secondaryListings];
  }, [userListings, secondaryListings, invoice.id]);

  const handleBuySecondary = (listingId: string) => {
    if (!walletAddress) {
      onConnect();
      return;
    }

    const listing = listingsToDisplay.find(l => l.id === listingId);
    if (!listing) return;

    const cost = listing.shares * listing.price;
    if (cost > availableBalance) {
      alert(`Insufficient balance. This P2P purchase requires ${formatCurrency(cost)} USDC but your wallet only holds ${formatCurrency(availableBalance)} USDC.`);
      return;
    }

    // Set buying state to true for this listing
    setSecondaryListings(prev => prev.map(l => l.id === listingId ? { ...l, isBuying: true } : l));

    setTimeout(() => {
      // Execute the purchase
      const secondaryExpectedReturn = (cost * (invoice.yieldRate / 100)) * (invoice.termDays / 365);
      onInvest({
        invoiceId: invoice.id,
        borrowerName: `${invoice.borrowerName} (Secondary)`,
        shares: listing.shares,
        totalCost: cost,
        expectedReturn: secondaryExpectedReturn,
        maturityDate: invoice.maturityDate,
      });

      setSecondaryListings(prev => prev.map(l => l.id === listingId ? { ...l, isBuying: false, isBought: true } : l));
      
      // Update our simulation's local recent investors
      const newInvestor: InvestorAllocation = {
         id: Math.random().toString(36).substring(7),
         address: walletAddress,
         shares: listing.shares,
         timestamp: 'Just now',
         value: cost,
         txHash: '0x' + Array.from({length: 8}, () => Math.floor(Math.random()*16).toString(16)).join(''),
         status: 'Confirmed'
      };
      setLiveInvestors(prev => [newInvestor, ...prev.slice(0, 4)]);
    }, 1500);
  };

  // Deriving values based on user input
  const totalCost = sharesToBuy * invoice.tokenPrice;
  // If total interest is 'interestTotal', and yielding rate determines the investor's cut, let's simplify return for the mock
  // E.g. Investor return = (totalCost * yieldRate / 100) * (termDays / 365)
  const expectedReturn = (totalCost * (invoice.yieldRate / 100)) * (invoice.termDays / 365);
  
  const similarInvoices = MOCK_INVOICES.filter(inv => inv.sector === invoice.sector && inv.id !== invoice.id).slice(0, 3);

  const historicalData = useMemo(() => {
    const currentMonthIdx = new Date().getMonth();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return Array.from({length: 12}).map((_, i) => {
      const monthIdx = (currentMonthIdx - 11 + i + 12) % 12;
      const ranOffset = (Math.random() - 0.5) * 1.5;
      return {
        month: months[monthIdx],
        yield: Number((invoice.yieldRate + ranOffset).toFixed(2))
      };
    });
  }, [invoice.id, invoice.yieldRate]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  // Simulate live network ledger updates
  useEffect(() => {
    if (invoice.status !== 'Funding' && invoice.status !== 'Tokenized') return;
    
    let isMounted = true;
    const interval = setInterval(() => {
       if (!isMounted) return;
       // 35% chance to simulate a live investment every 3.5 seconds
       if (Math.random() < 0.35) {
          const randomShares = Math.floor(Math.random() * 5) + 1;
          const newValue = randomShares * invoice.tokenPrice;
          const newInvestor: InvestorAllocation = {
             id: Math.random().toString(36).substring(7),
             address: '0x' + Math.random().toString(16).substring(2, 6).toUpperCase() + '...' + Math.random().toString(16).substring(2, 6).toUpperCase(),
             shares: randomShares,
             timestamp: 'Just now',
             value: newValue,
             txHash: '0x' + Array.from({length: 8}, () => Math.floor(Math.random()*16).toString(16)).join(''),
             status: 'Confirmed'
          };
          setLiveInvestors(prev => [newInvestor, ...prev.slice(0, 4)]);
       }
    }, 3500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [invoice]);

  const handleInvestClick = () => {
    if (!walletAddress) {
       onConnect();
       return;
    }
    setShowConfirm(true);
  };

  const handleInvestConfirm = () => {
    setShowConfirm(false);
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      onInvest({
         invoiceId: invoice.id,
         borrowerName: invoice.borrowerName,
         shares: sharesToBuy,
         totalCost,
         expectedReturn,
         maturityDate: invoice.maturityDate,
      });

      const newInvestor: InvestorAllocation = {
             id: Math.random().toString(36).substring(7),
             address: walletAddress,
             shares: sharesToBuy,
             timestamp: 'Just now',
             value: totalCost,
             txHash: '0x' + Array.from({length: 8}, () => Math.floor(Math.random()*16).toString(16)).join(''),
             status: 'Confirmed'
      };
      setLiveInvestors(prev => [newInvestor, ...prev.slice(0, 4)]);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={onBack}
        className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {backText}
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Details */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex-1 space-y-6">
          {/* Header Card */}
          <motion.div variants={itemVariants} className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="cursor-pointer shrink-0" onClick={() => onViewBorrower(invoice.borrowerName)}>
                <BusinessLogo name={invoice.borrowerName} sector={invoice.sector} color={invoice.logoColor} className="h-14 w-14 sm:h-16 sm:w-16 text-xl sm:text-2xl rounded-xl hover:opacity-80 transition-opacity" />
              </div>
              <div className="w-full">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                  <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200" id={`detail-id-${invoice.id}`}>
                    {invoice.id}
                  </span>
                  <InvoiceStatusBadge status={invoice.status} />
                </div>
                <h1 
                  className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => onViewBorrower(invoice.borrowerName)}
                >
                  {invoice.borrowerName}
                </h1>
                <p className="text-gray-500 mt-2 text-sm leading-relaxed max-w-2xl">
                  {invoice.borrowerDetails}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-6 border-t border-gray-100">
              <div className="group relative">
                <div className="text-sm text-gray-500 mb-1 flex items-center cursor-help">
                  Total Commitment
                  <Info className="h-3.5 w-3.5 ml-1 text-gray-400" />
                </div>
                <div className="absolute top-6 left-0 bg-gray-900 text-white text-xs p-2 rounded w-48 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 z-10 shadow-lg">
                  The full face value of the invoice verified on the network.
                </div>
                <div className="text-lg font-mono font-semibold text-gray-900">{formatCurrency(invoice.invoiceAmount)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Term & Maturity</div>
                <div className="text-lg font-medium text-gray-900">{invoice.termDays} Days</div>
                <div className="text-xs text-gray-500 mt-0.5">{invoice.maturityDate}</div>
              </div>
              <div className="group relative">
                <div className="text-sm text-gray-500 mb-1 flex items-center cursor-help">
                  Yield (APY)
                  <Info className="h-3.5 w-3.5 ml-1 text-gray-400" />
                </div>
                <div className="absolute top-6 left-0 bg-gray-900 text-white text-xs p-2 rounded w-48 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 z-10 shadow-lg">
                  Annual Percentage Yield. The annualized return received by token holders.
                </div>
                <div className="text-lg font-medium text-green-600">{formatPercent(invoice.yieldRate)}</div>
              </div>
              <div className="group relative">
                <div className="text-sm text-gray-500 mb-1 flex items-center cursor-help">
                  Tech Fee
                  <Info className="h-3.5 w-3.5 ml-1 text-gray-400" />
                </div>
                <div className="absolute right-0 top-6 md:left-0 md:right-auto bg-gray-900 text-white text-xs p-2 rounded w-48 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 z-10 shadow-lg">
                  Protocol facilitation fee charged continuously against the yield.
                </div>
                <div className="text-lg font-medium text-gray-900">{formatPercent(invoice.technologyFeeRate)}</div>
              </div>
            </div>
          </motion.div>

          {/* Blockchain Ledger & Documents Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Documents */}
            <motion.div variants={itemVariants} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center mb-4">
                <ShieldCheck className="h-4 w-4 mr-2 text-gray-400" />
                Verified Documents
              </h3>
              <ul className="space-y-3">
                {invoice.documents.map(doc => (
                  <li 
                    key={doc.id} 
                    onClick={() => setPreviewDoc(doc)}
                    className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center">
                      <div className="bg-red-50 p-2 rounded mr-3 text-red-600">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors flex items-center">
                           {doc.name}
                        </div>
                        <div className="text-xs text-gray-500">{doc.type} • {doc.size}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all">
                      <span className="text-xs font-medium">Preview</span>
                      <Eye className="h-4 w-4" />
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Network Ledger */}
            <motion.div variants={itemVariants} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                  <Database className="h-4 w-4 mr-2 text-gray-400" />
                  Network Ledger
                </h3>
                {invoice.status === 'Funding' ? (
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200 flex items-center">
                    <div className="h-1.5 w-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
                    Live
                  </span>
                ) : (
                  <span className="text-xs text-gray-600 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-200 flex items-center">
                    <Check className="h-3 w-3 mr-1" />
                    Confirmed
                  </span>
                )}
              </div>
              <ul className="space-y-3">
                {liveInvestors.length > 0 ? liveInvestors.map(inv => (
                  <li key={inv.id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div>
                      <div className="font-mono text-gray-900">{inv.address}</div>
                      <div className="text-xs text-gray-500 flex items-center mt-0.5">
                        <Clock className="h-3 w-3 mr-1" /> {inv.timestamp}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-medium">{inv.shares} shares</div>
                      <div className="text-xs text-gray-500">{formatCurrency(inv.value)}</div>
                    </div>
                  </li>
                )) : (
                  <li className="text-sm text-gray-500 py-4 text-center">No investments yet.</li>
                )}
              </ul>
            </motion.div>
          </div>

          {/* Historical Data & Analysis */}
          <motion.div variants={itemVariants} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-gray-400" />
              12-Month Historical Yield Average ({invoice.borrowerName})
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(val) => `${val}%`} dx={-10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value: number) => [`${value}%`, 'Yield']}
                  />
                  <Line type="monotone" dataKey="yield" stroke="#2563EB" strokeWidth={2} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Comparative Table */}
          {similarInvoices.length > 0 && (
            <motion.div variants={itemVariants} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                <Database className="h-4 w-4 mr-2 text-gray-400" />
                Comparable Market Facilities ({invoice.sector})
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 font-medium">Borrower</th>
                      <th className="px-4 py-3 font-medium text-right">Yield</th>
                      <th className="px-4 py-3 font-medium text-right">Term</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {similarInvoices.map((sim) => (
                      <tr key={sim.id} className="hover:bg-gray-50">
                        <td 
                          className="px-4 py-3 font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => onViewBorrower(sim.borrowerName)}
                        >
                          {sim.borrowerName}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-green-600">{formatPercent(sim.yieldRate)}</td>
                        <td className="px-4 py-3 text-right">{sim.termDays} days</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

        </motion.div>

        {/* Right Column - Investment Widget */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full lg:w-96 shrink-0">
          <motion.div variants={itemVariants} className="bg-white border border-gray-200 rounded-xl shadow-xl sticky top-24 overflow-hidden">
            <div className="bg-gray-900 p-6 text-white">
              <h2 className="text-lg font-semibold mb-1">Purchase Tokens</h2>
              <p className="text-gray-400 text-sm">Secure your position on chain.</p>
            </div>
            
            <div className="p-6 space-y-6">
              {isSuccess ? (
                <div className="text-center py-8">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="relative h-16 w-16 mx-auto mb-4"
                  >
                    <motion.div 
                      animate={{ 
                        boxShadow: ["0px 0px 0px 0px rgba(34,197,94,0.4)", "0px 0px 0px 15px rgba(34,197,94,0)"] 
                      }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                      className="h-full w-full bg-green-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm absolute inset-0 z-10"
                    >
                      <Check className="h-8 w-8 text-green-600" />
                    </motion.div>
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Investment Confirmed</h3>
                  <p className="text-sm text-gray-500 mb-6 text-balance">
                    Your {sharesToBuy} token(s) have been successfully written to the ledger.
                  </p>
                  <button 
                    onClick={() => onBack()}
                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium transition-colors"
                  >
                    Return to Marketplace
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500">Available Tokens</span>
                      <span className="font-mono font-medium">{invoice.availableTokens} / {invoice.totalTokens}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-black h-2 rounded-full" 
                        style={{ width: `${((invoice.totalTokens - invoice.availableTokens) / invoice.totalTokens) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {invoice.availableTokens > 0 ? (
                    <>
                      <div>
                        <div className="flex justify-between items-center mb-2 animate-in fade-in duration-300">
                          <label className="block text-sm font-medium text-gray-700">Number of Tokens</label>
                          {walletAddress && (
                            <span className="text-xs text-gray-500 font-medium">
                              Bal: <span className="font-mono font-bold text-gray-950">{formatCurrency(availableBalance)}</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-black focus-within:border-transparent">
                          <button 
                            className="px-4 py-3 bg-gray-50 text-gray-500 hover:bg-gray-100 border-r border-gray-300 font-semibold select-none"
                            onClick={() => setSharesToBuy(Math.max(1, sharesToBuy - 1))}
                            disabled={sharesToBuy <= 1}
                          >-</button>
                          <input 
                            type="number" 
                            className="flex-1 text-center font-mono font-medium outline-none py-3"
                            value={sharesToBuy}
                            min={1}
                            max={invoice.availableTokens}
                            onChange={(e) => setSharesToBuy(Math.min(invoice.availableTokens, Math.max(1, parseInt(e.target.value) || 1)))}
                          />
                          <button 
                            className="px-4 py-3 bg-gray-50 text-gray-500 hover:bg-gray-100 border-l border-gray-300 font-semibold select-none"
                            onClick={() => setSharesToBuy(Math.min(invoice.availableTokens, sharesToBuy + 1))}
                            disabled={sharesToBuy >= invoice.availableTokens}
                          >+</button>
                        </div>
                        <input 
                          type="range"
                          min="1"
                          max={invoice.availableTokens}
                          value={sharesToBuy}
                          onChange={(e) => setSharesToBuy(parseInt(e.target.value))}
                          className="w-full mt-4 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                        />
                        <div className="text-right text-xs text-gray-500 mt-1">@ {formatCurrency(invoice.tokenPrice)} / token</div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Total Commitment</span>
                          <span className={`font-mono font-medium transition-colors duration-200 ${walletAddress && totalCost > availableBalance ? 'text-red-600 font-bold' : 'text-gray-950 shadow-sm'}`}>{formatCurrency(totalCost)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Est. Return ({invoice.termDays}d)</span>
                          <span className="font-mono font-medium text-green-600">+{formatCurrency(expectedReturn)}</span>
                        </div>
                      </div>

                      {walletAddress && totalCost > availableBalance && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2 animate-in fade-in duration-300">
                          <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                          <p className="text-xs text-red-800 leading-relaxed">
                            This investment exceeds your available wallet balance of <span className="font-mono font-bold">{formatCurrency(availableBalance)}</span>. Please acquire more USDC or decrease token count.
                          </p>
                        </div>
                      )}

                      <button 
                        onClick={handleInvestClick}
                        disabled={isProcessing || (walletAddress !== null && totalCost > availableBalance)}
                        className={`w-full py-4 text-white rounded-lg font-medium transition-colors flex justify-center items-center disabled:opacity-70 ${
                          !walletAddress 
                            ? 'bg-blue-600 hover:bg-blue-700' 
                            : (totalCost > availableBalance)
                              ? 'bg-red-600 hover:bg-red-700 disabled:opacity-80'
                              : 'bg-black hover:bg-gray-800'
                        }`}
                      >
                        {isProcessing ? (
                          <div className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Confirming via Smart Contract...
                          </div>
                        ) : !walletAddress ? (
                          <>
                            <Wallet className="h-4 w-4 mr-2" />
                            Connect Wallet to Invest
                          </>
                        ) : totalCost > availableBalance ? (
                          'Insufficient Balance'
                        ) : (
                          'Execute Investment'
                        )}
                      </button>
                    </>
                  ) : (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-gray-500 text-sm font-semibold">Primary Offering Sold Out</div>
                        <div className="text-xs text-gray-400 mt-1">100% of tokens have been minted and allocated.</div>
                      </div>

                      {/* Secondary Market section */}
                      <div className="border-t border-gray-150 pt-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-900 flex items-center uppercase tracking-wider">
                            <ArrowRightLeft className="h-4 w-4 mr-1.5 text-blue-600" />
                            Secondary Market Resales
                          </span>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-50 text-green-700 border border-green-200 shrink-0">
                            P2P LIVE
                          </span>
                        </div>
                        
                        <p className="text-[11px] text-gray-500 leading-normal">
                          Purchase fractionalized share lots listed by early asset holders looking for immediate liquidity.
                        </p>

                        <div className="space-y-3 mt-2">
                          {listingsToDisplay.map(listing => {
                            const isUserListing = (listing as any).isUserListing;
                            const lotCost = listing.shares * listing.price;
                            const isAffordable = availableBalance >= lotCost;
                            
                            return (
                              <div 
                                key={listing.id} 
                                className={`border rounded-xl p-3.5 transition-all text-xs flex flex-col justify-between ${
                                  listing.isBought 
                                    ? 'bg-green-50/50 border-green-200 opacity-90' 
                                    : isUserListing
                                      ? 'bg-blue-50/40 border-blue-200 shadow-xs'
                                      : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                                }`}
                              >
                                <div className="flex justify-between items-center mb-2.5">
                                  <div className="flex flex-col">
                                    <span className="text-[10px] font-mono text-gray-400 font-semibold uppercase flex items-center">
                                      <Users className="h-3 w-3 mr-1" />
                                      {isUserListing ? (
                                        <span className="text-blue-600 font-bold bg-blue-50/80 px-1.5 py-0.5 rounded border border-blue-100 flex items-center">
                                          Your Active Listing
                                        </span>
                                      ) : (
                                        `Holder ${listing.seller}`
                                      )}
                                    </span>
                                    <span className="font-mono text-sm font-bold text-gray-900 mt-1.5">
                                      {listing.shares.toLocaleString()} Shares
                                    </span>
                                  </div>
                                  <div className="text-right flex flex-col">
                                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wide font-medium">Price lot</span>
                                    <span className="font-mono text-sm font-semibold text-gray-900 mt-0.5">
                                      {formatCurrency(lotCost)}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-gray-100/70 mt-1">
                                  <span className="text-[10px] text-gray-500 font-mono font-medium">
                                    @ {formatCurrency(listing.price)}/share
                                  </span>
                                  {listing.isBought ? (
                                    <span className="inline-flex items-center text-xs font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-lg">
                                      <Check className="h-3 w-3 mr-1" />
                                      Purchased
                                    </span>
                                  ) : isUserListing ? (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 select-none">
                                      Listed Order
                                    </span>
                                  ) : (
                                    <button
                                      disabled={listing.isBuying || (walletAddress !== null && !isAffordable)}
                                      onClick={() => handleBuySecondary(listing.id)}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center cursor-pointer ${
                                        listing.isBuying 
                                          ? 'bg-blue-100 text-blue-700' 
                                          : !walletAddress 
                                            ? 'bg-black text-white hover:bg-gray-800'
                                            : !isAffordable
                                              ? 'bg-red-50 text-red-700 border border-red-100 cursor-not-allowed'
                                              : 'bg-blue-600 text-white hover:bg-blue-700'
                                      }`}
                                    >
                                      {listing.isBuying ? (
                                        <div className="flex items-center space-x-1">
                                          <svg className="animate-spin h-3 w-3 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                          </svg>
                                          <span>Escrowing...</span>
                                        </div>
                                      ) : !walletAddress ? (
                                        'Connect Wallet'
                                      ) : !isAffordable ? (
                                        'Over Balance'
                                      ) : (
                                        'Buy Lot'
                                      )}
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start bg-blue-50 p-3 rounded-md border border-blue-100">
                    <LinkIcon className="h-4 w-4 text-blue-500 mr-2 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800 leading-relaxed">
                      Transactions are immutable and verifiable on the public ledger. You bear the counterparty risk of the originating entity.
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
      
      {previewDoc && (
        <DocumentPreviewModal 
          invoice={invoice} 
          document={previewDoc} 
          onClose={() => setPreviewDoc(null)} 
          onDownload={() => {
            alert('Downloading ' + previewDoc.name);
            setPreviewDoc(null);
          }} 
        />
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold flex items-center text-gray-900">
                Confirm Investment
              </h2>
              <button onClick={() => setShowConfirm(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-lg flex mb-6">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0" />
                <p className="text-sm text-yellow-800">
                  You are about to execute a blockchain transaction to purchase <span className="font-semibold">{sharesToBuy} token(s)</span> of <span className="font-semibold">{invoice.id}</span>.
                </p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Asset Value:</span>
                  <span className="font-mono text-gray-900">{formatCurrency(totalCost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Expected Yield:</span>
                  <span className="font-mono text-green-600">+{formatCurrency(expectedReturn)}</span>
                </div>
              </div>
              
              <div className="mb-8 overflow-hidden">
                <button 
                  onClick={() => setShowContractPreview(!showContractPreview)} 
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium mb-2 flex items-center"
                >
                  {showContractPreview ? "Hide Contract Preview" : "View Contract Preview"}
                </button>
                {showContractPreview && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
                    <pre className="text-[10px] font-mono text-gray-600 bg-gray-50 border border-gray-100 p-3 rounded-lg overflow-x-auto">
{JSON.stringify({
  action: "purchase_tokens",
  contract_address: `0x${invoice.id.split('-').pop()}F091Bc...7B3c`,
  payload: {
    invoice_id: invoice.id,
    token_quantity: sharesToBuy,
    total_cost_usdc: totalCost,
    expected_yield: expectedReturn,
    maturity_date: invoice.maturityDate
  },
  signature_required: true
}, null, 2)}
                    </pre>
                  </motion.div>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-900 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleInvestConfirm}
                  className="flex-1 py-2.5 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Confirm & Sign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
