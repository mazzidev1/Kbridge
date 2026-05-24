import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { InvoiceList } from './components/InvoiceList';
import { InvoiceDetail } from './components/InvoiceDetail';
import { Portfolio } from './components/Portfolio';
import { ConnectWallet } from './components/ConnectWallet';
import { MockLogin } from './components/MockLogin';
import { BorrowerProfile } from './components/BorrowerProfile';
import { MOCK_INVOICES } from './data';
import { UserInvestment } from './types';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [currentView, setCurrentView] = useState<'marketplace' | 'portfolio' | 'borrower'>('marketplace');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [selectedBorrowerName, setSelectedBorrowerName] = useState<string | null>(null);
  
  // Seed default holdings so the user has assets to sell immediately!
  const [userPortfolio, setUserPortfolio] = useState<UserInvestment[]>(() => {
    try {
      const saved = localStorage.getItem('user_portfolio_investments_v2');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    
    return [
      {
        id: 'user-inv-1',
        invoiceId: 'INV-2026-8921',
        borrowerName: 'Acme Nuts & Bolts Manufacturing',
        shares: 15000,
        totalCost: 30000,
        expectedReturn: 369.86,
        maturityDate: '2026-08-21',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        txHash: '0x32a189f21ab29c48ea92a10bf34800e289c922afbcde289a4ff12e2cde132bc9',
        status: 'Confirmed'
      },
      {
        id: 'user-inv-2',
        invoiceId: 'INV-2026-8922',
        borrowerName: 'Global Timber Exports Ltd.',
        shares: 8000,
        totalCost: 40000,
        expectedReturn: 946.85,
        maturityDate: '2026-11-15',
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        txHash: '0x88f192b4fa34ca1e165de992be1658c42a19ffa12bc780ad91be802e21c6ba2c',
        status: 'Confirmed'
      }
    ];
  });

  const [availableBalance, setAvailableBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('user_balance');
      return saved ? Number(saved) : 1500000;
    } catch (e) {
      return 1500000;
    }
  });

  const [userListings, setUserListings] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('user_secondary_listings_v2');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [watchedBorrowers, setWatchedBorrowers] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('watched_borrowers');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('user_portfolio_investments_v2', JSON.stringify(userPortfolio));
    } catch (e) {}
  }, [userPortfolio]);

  useEffect(() => {
    try {
      localStorage.setItem('user_secondary_listings_v2', JSON.stringify(userListings));
    } catch (e) {}
  }, [userListings]);

  const handleToggleWatch = (borrowerName: string) => {
    setWatchedBorrowers(prev => {
      const updated = prev.includes(borrowerName)
        ? prev.filter(name => name !== borrowerName)
        : [...prev, borrowerName];
      try {
        localStorage.setItem('watched_borrowers', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const selectedInvoice = selectedInvoiceId 
    ? MOCK_INVOICES.find(i => i.id === selectedInvoiceId) 
    : null;

  const handleInvest = (investment: Omit<UserInvestment, 'id' | 'timestamp' | 'txHash' | 'status'>) => {
    const newInvestment: UserInvestment = {
      ...investment,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      txHash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''),
      status: 'Confirmed'
    };
    setUserPortfolio([newInvestment, ...userPortfolio]);
    
    setAvailableBalance(prev => {
      const nextBalance = Math.max(0, prev - investment.totalCost);
      try {
        localStorage.setItem('user_balance', String(nextBalance));
      } catch (e) {}
      return nextBalance;
    });
  };

  const handleSellSharesExecution = (
    investmentId: string,
    sharesToSell: number,
    proceedsGot: number,
    mode: 'instant' | 'listing',
    askingPrice: number,
    invoiceId: string
  ) => {
    setUserPortfolio(prev => {
      return prev.map(inv => {
        if (inv.id === investmentId) {
          const remShares = inv.shares - sharesToSell;
          if (remShares <= 0) {
            return null; // completely sold out lot
          }
          const ratio = remShares / inv.shares;
          return {
            ...inv,
            shares: remShares,
            totalCost: inv.totalCost * ratio,
            expectedReturn: inv.expectedReturn * ratio
          };
        }
        return inv;
      }).filter(Boolean) as UserInvestment[];
    });

    if (mode === 'instant') {
      setAvailableBalance(prev => {
        const nextBalance = prev + proceedsGot;
        try {
          localStorage.setItem('user_balance', String(nextBalance));
        } catch (e) {}
        return nextBalance;
      });
    } else {
      // mode === 'listing' - Create limit order item
      const newListing = {
        id: `user-list-${Math.random().toString(36).substring(7)}`,
        invoiceId: invoiceId,
        seller: walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}` : '0xMine',
        shares: sharesToSell,
        price: askingPrice,
        isBuying: false,
        isBought: false,
        isUserListing: true,
        timestamp: new Date().toISOString()
      };
      
      setUserListings(prev => [newListing, ...prev]);
    }
  };

  const handleCancelUserListing = (listingId: string) => {
    const listing = userListings.find(l => l.id === listingId);
    if (!listing) return;

    setUserPortfolio(prev => {
      const existing = prev.find(inv => inv.invoiceId === listing.invoiceId);
      if (existing) {
        return prev.map(inv => {
          if (inv.invoiceId === listing.invoiceId) {
            const originalInv = MOCK_INVOICES.find(i => i.id === inv.invoiceId);
            const tokenPrice = originalInv?.tokenPrice || 2;
            const extraReturn = (listing.shares * tokenPrice * (originalInv?.yieldRate || 5.0) / 100) * ((originalInv?.termDays || 90) / 365);
            return {
              ...inv,
              shares: inv.shares + listing.shares,
              totalCost: inv.totalCost + (listing.shares * tokenPrice),
              expectedReturn: inv.expectedReturn + extraReturn,
            };
          }
          return inv;
        });
      } else {
        const originalInv = MOCK_INVOICES.find(i => i.id === listing.invoiceId);
        const tokenPrice = originalInv?.tokenPrice || 2;
        const totalCost = listing.shares * tokenPrice;
        const expectedReturn = (totalCost * (originalInv?.yieldRate || 5.0) / 100) * ((originalInv?.termDays || 90) / 365);
        const newInv: UserInvestment = {
          id: `user-inv-${Math.random().toString(36).substring(7)}`,
          invoiceId: listing.invoiceId,
          borrowerName: originalInv?.borrowerName || 'Invoice Token',
          shares: listing.shares,
          totalCost: totalCost,
          expectedReturn: expectedReturn,
          maturityDate: originalInv?.maturityDate || '2026-09-01',
          timestamp: new Date().toISOString(),
          txHash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''),
          status: 'Confirmed'
        };
        return [newInv, ...prev];
      }
    });

    setUserListings(prev => prev.filter(l => l.id !== listingId));
  };

  const handleSimulateListingFill = (listingId: string) => {
    const listing = userListings.find(l => l.id === listingId);
    if (!listing) return;

    const proceeds = listing.shares * listing.price;
    setAvailableBalance(prev => {
      const nextBalance = prev + proceeds;
      try {
        localStorage.setItem('user_balance', String(nextBalance));
      } catch (e) {}
      return nextBalance;
    });

    setUserListings(prev => prev.filter(l => l.id !== listingId));
  };

  if (!isAuthenticated) {
    return <MockLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      <Header 
        walletAddress={walletAddress}
        availableBalance={availableBalance}
        onConnectClick={() => setShowWalletModal(true)}
        onDisconnect={() => setWalletAddress(null)}
        currentView={currentView}
        onNavigateView={setCurrentView}
      />
      
      <main className="flex-1">
        {selectedInvoice ? (
          <InvoiceDetail 
            key={selectedInvoice.id}
            invoice={selectedInvoice} 
            availableBalance={availableBalance}
            onBack={() => {
               if (currentView === 'borrower') {
                 setSelectedInvoiceId(null);
               } else {
                 setSelectedInvoiceId(null);
               }
            }}
            onViewBorrower={(name) => {
               setSelectedBorrowerName(name);
               setCurrentView('borrower');
               setSelectedInvoiceId(null);
            }}
            walletAddress={walletAddress}
            onConnect={() => setShowWalletModal(true)}
            onInvest={handleInvest}
            backText={currentView === 'borrower' ? 'Back to Borrower' : (currentView === 'portfolio' ? 'Back to Portfolio' : 'Back to Marketplace')}
            userListings={userListings}
          />
        ) : currentView === 'borrower' && selectedBorrowerName ? (
           <BorrowerProfile 
             borrowerName={selectedBorrowerName} 
             isWatched={watchedBorrowers.includes(selectedBorrowerName)}
             onToggleWatch={handleToggleWatch}
             onBack={() => {
                setCurrentView('marketplace');
                setSelectedBorrowerName(null);
             }}
             onSelectInvoice={(id) => setSelectedInvoiceId(id)}
           />
        ) : currentView === 'portfolio' ? (
           <Portfolio 
             portfolio={userPortfolio} 
             watchedBorrowers={watchedBorrowers}
             userListings={userListings}
             onCancelListing={handleCancelUserListing}
             onSellInvestment={handleSellSharesExecution}
              onSimulateListingFill={handleSimulateListingFill}
             onViewBorrower={(name) => {
               setSelectedBorrowerName(name);
               setCurrentView('borrower');
             }}
             onBrowse={() => setCurrentView('marketplace')} 
             onSelectInvestment={(id) => setSelectedInvoiceId(id)} 
             walletAddress={walletAddress}
           />
        ) : (
          <InvoiceList 
            onSelectInvoice={(id) => setSelectedInvoiceId(id)} 
            onSelectBorrower={(name) => {
              setSelectedBorrowerName(name);
              setCurrentView('borrower');
            }}
          />
        )}
      </main>

      {showWalletModal && (
        <ConnectWallet 
          onClose={() => setShowWalletModal(false)}
          onConnect={(address) => {
            setWalletAddress(address);
            setShowWalletModal(false);
          }}
        />
      )}
    </div>
  );
}

