import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, ShieldCheck, Tag, Zap, ArrowRightLeft, Check, Compass, Landmark, Wallet, AlertCircle } from 'lucide-react';
import { formatCurrency, formatPercent } from '../data';
import { UserInvestment, Invoice } from '../types';

interface SellSharesModalProps {
  isOpen: boolean;
  onClose: () => void;
  investment: UserInvestment;
  invoice: Invoice;
  onSellSuccess: (
    shares: number,
    totalProceeds: number,
    mode: 'instant' | 'listing',
    askingPrice: number
  ) => void;
}

export const SellSharesModal = ({
  isOpen,
  onClose,
  investment,
  invoice,
  onSellSuccess
}: SellSharesModalProps) => {
  const [sharesToSell, setSharesToSell] = useState<number>(Math.floor(investment.shares / 2));
  const [askingPrice, setAskingPrice] = useState<number>(invoice.tokenPrice);
  const [sellMode, setSellMode] = useState<'instant' | 'listing'>('instant');
  const [step, setStep] = useState<'config' | 'sign' | 'success'>('config');

  const handleSharesInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      setSharesToSell(0);
      return;
    }
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed)) {
      setSharesToSell(Math.min(investment.shares, parsed));
    }
  };
  const [signProgress, setSignProgress] = useState<number>(0);
  const [txHash, setTxHash] = useState<string>('');

  // Auto-cap shares to sell if it exceeds current holding
  useEffect(() => {
    if (sharesToSell > investment.shares) {
      setSharesToSell(investment.shares);
    }
  }, [investment.shares]);

  // Handle preset relative price discounts / premiums
  const handlePricePreset = (percentOffset: number) => {
    const calculated = invoice.tokenPrice * (1 + percentOffset / 100);
    setAskingPrice(parseFloat(calculated.toFixed(2)));
  };

  if (!isOpen) return null;

  // Calculators
  const originalCost = sharesToSell * invoice.tokenPrice;
  const instantProceeds = originalCost * 0.985; // 1.5% slippage discount
  const p2pProceeds = sharesToSell * askingPrice;
  
  // Buyer APY: if selling at discount, APY is higher
  // APY = original yield * (original price / custom price)
  const buyerYield = (invoice.yieldRate * invoice.tokenPrice) / (askingPrice || invoice.tokenPrice);

  const handleStartTransaction = () => {
    setStep('sign');
    setSignProgress(1);

    // Simulate authorization phase
    setTimeout(() => {
      setSignProgress(2);
      // Simulate cryptographic message signing phase
      setTimeout(() => {
        setSignProgress(3);
        const hash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        setTxHash(hash);
        
        // Let it display Success!
        setTimeout(() => {
          setStep('success');
        }, 1200);
      }, 1500);
    }, 1500);
  };

  const handleCompleteFlow = () => {
    const proceeds = sellMode === 'instant' ? instantProceeds : p2pProceeds;
    onSellSuccess(sharesToSell, proceeds, sellMode, askingPrice);
    onClose();
    // Default modal states backup
    setStep('config');
    setSignProgress(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div>
            <h2 className="text-base font-semibold text-gray-900 flex items-center">
              <ArrowRightLeft className="h-4.5 w-4.5 text-blue-600 mr-2" />
              Secondary Market Sale Flow
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Liquidate or List your {invoice.borrowerName} shares</p>
          </div>
          {step !== 'sign' && (
            <button 
              onClick={onClose} 
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Outer scroll area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {step === 'config' && (
            <div className="space-y-5">
              {/* Asset Holding Snapshot Card */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex justify-between items-center text-xs">
                <div>
                  <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Your Position Holding</div>
                  <div className="text-sm font-semibold text-gray-900 mt-1">{investment.borrowerName}</div>
                  <div className="font-mono text-gray-500 mt-0.5">{investment.shares.toLocaleString()} Shares Owned</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">Par Token Price</span>
                  <span className="text-sm font-mono font-bold text-gray-950 mt-1 inline-block bg-white border border-gray-200 px-2 py-0.5 rounded shadow-xs">
                    {formatCurrency(invoice.tokenPrice)}
                  </span>
                </div>
              </div>

              {/* Mode Selection Tab */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl border border-gray-200/50">
                <button
                  type="button"
                  onClick={() => setSellMode('instant')}
                  className={`py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                    sellMode === 'instant'
                      ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Zap className={`h-3.5 w-3.5 mr-1.5 ${sellMode === 'instant' ? 'text-amber-500' : 'text-gray-400'}`} />
                  Instant Liquidity
                </button>
                <button
                  type="button"
                  onClick={() => setSellMode('listing')}
                  className={`py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                    sellMode === 'listing'
                      ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Tag className={`h-3.5 w-3.5 mr-1.5 ${sellMode === 'listing' ? 'text-blue-500' : 'text-gray-400'}`} />
                  P2P Limit Listing
                </button>
              </div>

              {/* Slider for Shares to Sell */}
              <div className="space-y-4 border border-gray-200 rounded-xl p-4.5 bg-white shadow-xs">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-medium">Fractional Lot Size to Sell</span>
                  <div className="relative flex items-center max-w-[155px]">
                    <input
                      type="number"
                      min="1"
                      max={investment.shares}
                      value={sharesToSell === 0 ? '' : sharesToSell}
                      onChange={handleSharesInputChange}
                      onBlur={() => {
                        if (sharesToSell < 1) {
                          setSharesToSell(1);
                        }
                      }}
                      className="w-full text-right py-1.5 pl-3 pr-14 text-xs font-mono font-bold border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-black focus:border-black bg-gray-50/80"
                    />
                    <span className="absolute right-3 text-[10px] uppercase font-bold text-gray-400 font-sans pointer-events-none select-none">Shares</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-0.5">
                  <input
                    type="range"
                    min="1"
                    max={investment.shares}
                    value={sharesToSell || 1}
                    onChange={(e) => setSharesToSell(parseInt(e.target.value) || 1)}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                    style={{ 
                      background: `linear-gradient(to right, #000000 0%, #000000 ${investment.shares > 1 ? ((sharesToSell - 1) / (investment.shares - 1)) * 100 : 0}%, #e5e7eb ${investment.shares > 1 ? ((sharesToSell - 1) / (investment.shares - 1)) * 100 : 0}%, #e5e7eb 100%)` 
                    }}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-gray-400 font-mono font-semibold">
                  <span>1 Share</span>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setSharesToSell(Math.max(1, Math.floor(investment.shares * 0.25)))} 
                      className="hover:text-black cursor-pointer bg-gray-50 hover:bg-gray-100 px-2 py-0.5 rounded border border-gray-200 text-[10px]"
                    >
                      25%
                    </button>
                    <button 
                      onClick={() => setSharesToSell(Math.max(1, Math.floor(investment.shares * 0.50)))} 
                      className="hover:text-black cursor-pointer bg-gray-50 hover:bg-gray-100 px-2 py-0.5 rounded border border-gray-200 text-[10px]"
                    >
                      50%
                    </button>
                    <button 
                      onClick={() => setSharesToSell(Math.max(1, Math.floor(investment.shares * 0.75)))} 
                      className="hover:text-black cursor-pointer bg-gray-50 hover:bg-gray-100 px-2 py-0.5 rounded border border-gray-200 text-[10px]"
                    >
                      75%
                    </button>
                    <button 
                      onClick={() => setSharesToSell(investment.shares)} 
                      className="hover:text-black cursor-pointer bg-gray-50 hover:bg-gray-100 px-2 py-0.5 rounded border border-gray-200 text-[10px]"
                    >
                      MAX
                    </button>
                  </div>
                  <span>{investment.shares.toLocaleString()} Shares</span>
                </div>
              </div>

              {/* Detailed configuration options based on Sell Mode */}
              {sellMode === 'listing' ? (
                <div className="space-y-3 p-4 bg-blue-50/40 border border-blue-100 rounded-xl">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center text-blue-900 font-medium">
                      <Tag className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                      P2P Limit Sale Price
                    </div>
                    <span className="font-mono text-gray-500 text-[11px]">Par: {formatCurrency(invoice.tokenPrice)}</span>
                  </div>

                  {/* Ask Price Input */}
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0.1"
                      className="w-full text-right p-2.5 pr-14 text-sm font-mono border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-black bg-white"
                      value={askingPrice}
                      onChange={(e) => setAskingPrice(Math.max(0.01, parseFloat(e.target.value) || 0))}
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-bold text-gray-400 font-mono select-none">USDC</span>
                  </div>

                  {/* Discount/Premium Presets */}
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => handlePricePreset(-3)}
                      className="flex-1 py-1 text-center bg-white border border-gray-200 text-red-700 hover:border-red-300 rounded text-[10px] font-semibold cursor-pointer"
                    >
                      -3% Discount
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePricePreset(-1.5)}
                      className="flex-1 py-1 text-center bg-white border border-gray-200 text-red-600 hover:border-red-300 rounded text-[10px] font-semibold cursor-pointer"
                    >
                      -1.5% Discount
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePricePreset(0)}
                      className="flex-1 py-1 text-center bg-black border border-black text-white rounded text-[10px] font-semibold cursor-pointer"
                    >
                      Par Value
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePricePreset(1.5)}
                      className="flex-1 py-1 text-center bg-white border border-gray-200 text-green-700 hover:border-green-300 rounded text-[10px] font-semibold cursor-pointer"
                    >
                      +1.5% Premium
                    </button>
                  </div>

                  {/* Dynamic APY and Yield calculation for buyer */}
                  <div className="pt-2 border-t border-gray-150 flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium flex items-center">
                      Dynamic Buyer Yield (APY)
                      <span className="ml-1 text-[9px] bg-blue-100 text-blue-800 px-1 rounded font-bold uppercase select-none">Calculated</span>
                    </span>
                    <span className="font-mono font-bold text-blue-700">
                      {formatPercent(buyerYield)}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400.5 leading-normal">
                    Setting a discount increases the buyer's yield rate, meaning your listing is highly likely to execute much faster.
                  </p>
                </div>
              ) : (
                /* Instant Sell description card */
                <div className="p-4 bg-amber-50/50 border border-amber-200/60 rounded-xl space-y-2">
                  <div className="flex items-center text-xs font-semibold text-amber-950">
                    <Zap className="h-4 w-4 mr-1.5 text-amber-500" />
                    Liquidity Vault swap option selected
                  </div>
                  <p className="text-[11px] text-amber-900/80 leading-normal">
                    Swap your position immediately using the smart-pool liquidity backing reserves. Immediate escrow payout has a standard <b>1.5% liquidity provision discount fee</b>.
                  </p>
                </div>
              )}

              {/* Summary Proceeds Card */}
              <div className="border border-gray-150 rounded-xl p-4 space-y-2.5 bg-gray-50/60 font-medium text-xs">
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">Financial Summary</span>
                
                <div className="flex justify-between items-center text-gray-600">
                  <span>Gross Token Value</span>
                  <span className="font-mono text-gray-900 font-semibold">{formatCurrency(originalCost)}</span>
                </div>

                {sellMode === 'instant' ? (
                  <div className="flex justify-between items-center text-gray-600">
                    <span className="flex items-center">
                      Protocol Liquidity Fee (1.5%)
                    </span>
                    <span className="font-mono text-red-600 font-semibold">-{formatCurrency(originalCost * 0.015)}</span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Broker Listing Fee</span>
                    <span className="font-mono text-green-600 font-bold">0.00 USDC</span>
                  </div>
                )}

                <div className="pt-2.5 border-t border-gray-200 flex justify-between items-center text-sm font-semibold">
                  <span className="text-gray-950">Estimated Proceeds Payback</span>
                  <span className="font-mono text-lg text-emerald-600 font-extrabold">
                    {formatCurrency(sellMode === 'instant' ? instantProceeds : p2pProceeds)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {step === 'sign' && (
            <div className="py-8 text-center space-y-6">
              <div className="relative h-16 w-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 animate-spin"></div>
                <ArrowRightLeft className="absolute inset-0 m-auto h-6 w-6 text-blue-500 animate-pulse" />
              </div>

              <div className="space-y-2 max-w-sm mx-auto">
                <h3 className="text-base font-semibold text-gray-900">Cryptographic Signing in progress</h3>
                <p className="text-xs text-gray-500">Sign non-custodial token release requests securely from your Web3 wallet address.</p>
              </div>

              {/* Progress Steps Indicators */}
              <div className="max-w-xs mx-auto border border-gray-150 rounded-xl bg-gray-50 p-4 space-y-3 text-left">
                <div className="flex items-start space-x-3 text-xs">
                  <div className={`mt-0.5 h-4 w-4 rounded-full flex items-center justify-center border font-mono text-[9px] font-bold ${
                    signProgress >= 2 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'border-blue-500 text-blue-600 bg-blue-50'
                  }`}>
                    {signProgress >= 2 ? '✓' : '1'}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Approve Token Allowance</div>
                    <p className="text-[10px] text-gray-400 leading-normal">Permit KBridge Escrow pool to coordinate {sharesToSell.toLocaleString()} tokens.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-xs pt-1.5 border-t border-gray-200/50">
                  <div className={`mt-0.5 h-4 w-4 rounded-full flex items-center justify-center border font-mono text-[9px] font-bold ${
                    signProgress >= 3 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : signProgress === 2
                        ? 'border-blue-500 text-blue-600 bg-blue-50 animate-pulse'
                        : 'border-gray-250 text-gray-400 bg-white'
                  }`}>
                    {signProgress >= 3 ? '✓' : '2'}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Sign Off-chain Limit Order</div>
                    <p className="text-[10px] text-gray-400 leading-normal">EIP-712 non-custodial structural hash signed with your private keys.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-8 text-center space-y-6 animate-in fade-in duration-300">
              <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
                <Check className="h-8 w-8" />
              </div>

              <div className="space-y-2 max-w-sm mx-auto">
                <h3 className="text-xl font-bold text-gray-900">
                  {sellMode === 'instant' ? 'Liquidation Success!' : 'Listing Published!'}
                </h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                  {sellMode === 'instant' 
                    ? `Your secondary shares have been swapped. ${formatCurrency(instantProceeds)} has been paid directly inside your active wallet.`
                    : `Your limit order lot of ${sharesToSell.toLocaleString()} shares has been put on active ledger. Other marketplace participants can now buy it.`
                  }
                </p>
              </div>

              <div className="border border-gray-150 rounded-xl bg-gray-50/70 p-4.5 text-xs text-left max-w-sm mx-auto space-y-2.5">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Method</span>
                  <span className="font-semibold text-gray-900 uppercase tracking-wider text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded shadow-xs">
                    {sellMode === 'instant' ? 'Instant AMM' : 'P2P Orderbook'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Sold Out Lot</span>
                  <span className="font-mono text-gray-900 font-bold">{sharesToSell.toLocaleString()} Shares</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Credited Value</span>
                  <span className="font-mono text-emerald-600 font-extrabold">
                    {formatCurrency(sellMode === 'instant' ? instantProceeds : p2pProceeds)}
                  </span>
                </div>
                {txHash && (
                  <div className="pt-2 border-t border-gray-200 flex flex-col gap-1 text-[11px] font-mono">
                    <span className="text-gray-400 font-sans font-medium text-[10px] uppercase">Transaction Ledger Hash</span>
                    <span className="text-blue-600 shrink-0 select-all truncate">{txHash}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end bg-gray-50/50 shrink-0">
          {step === 'config' ? (
            <div className="flex space-x-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-150 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={sharesToSell < 1 || sharesToSell > investment.shares}
                onClick={handleStartTransaction}
                className="flex-1 sm:flex-initial px-5 py-2 bg-black hover:bg-gray-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed animate-in fade-in duration-200"
              >
                {sellMode === 'instant' ? 'Confirm Instant Sale' : 'Confirm Order Offer'}
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </button>
            </div>
          ) : step === 'success' ? (
            <button
              type="button"
              onClick={handleCompleteFlow}
              className="w-full sm:w-auto px-6 py-2 bg-black hover:bg-gray-900 text-white rounded-lg text-xs font-bold shadow-sm cursor-pointer"
            >
              Done & Return
            </button>
          ) : (
            /* Silent placeholder during tx sign */
            <div className="text-xs text-gray-400 font-mono">
              Signing on chain...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
