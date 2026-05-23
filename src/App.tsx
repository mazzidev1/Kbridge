import React, { useState } from 'react';
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
  
  const [userPortfolio, setUserPortfolio] = useState<UserInvestment[]>([]);
  const [availableBalance, setAvailableBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('user_balance');
      return saved ? Number(saved) : 1500000;
    } catch (e) {
      return 1500000;
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
             onViewBorrower={(name) => {
               setSelectedBorrowerName(name);
               setCurrentView('borrower');
             }}
             onBrowse={() => setCurrentView('marketplace')} 
             onSelectInvestment={(id) => setSelectedInvoiceId(id)} 
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

