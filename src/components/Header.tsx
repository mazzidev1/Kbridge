import React, { useState } from 'react';
import { Bell, Activity, Clock, LogOut, CheckCircle2, Wallet, User as UserIcon, Menu, X } from 'lucide-react';

export const KundaLogo = () => (
  <div className="flex items-center justify-center bg-white text-black font-medium text-xl md:text-2xl h-7 w-7 md:h-8 md:w-8 border border-black select-none">
    K
  </div>
);



interface HeaderProps {
  walletAddress: string | null;
  availableBalance?: number;
  onConnectClick: () => void;
  onDisconnect?: () => void;
  currentView: 'marketplace' | 'portfolio' | 'borrower';
  onNavigateView: (view: 'marketplace' | 'portfolio') => void;
}

export const Header: React.FC<HeaderProps> = ({ walletAddress, availableBalance = 1500000, onConnectClick, onDisconnect, currentView, onNavigateView }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mockNotifications = [
    { id: 1, text: "Acme Nuts & Bolts invoice INV-2026-8921 is 80% funded.", time: "10m ago", read: false },
    { id: 2, text: "Smart Contract executed for Global Timber Exports.", time: "1h ago", read: true },
    { id: 3, text: "New yield payment received from Nexus Tech.", time: "2h ago", read: true },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            {/* Mobile Menu Button */}
            <div className="md:hidden mr-2">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1 text-gray-500 hover:text-gray-900">
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-3 cursor-pointer" onClick={() => onNavigateView('marketplace')}>
              <KundaLogo />
              <span className="text-lg md:text-xl font-medium tracking-tight text-gray-900 md:border-r md:border-gray-300 pr-0 md:pr-6">kbridge</span>
            </div>
            
            <div className="hidden md:flex space-x-1 ml-6">
              <button 
                onClick={() => onNavigateView('marketplace')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentView === 'marketplace' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Marketplace
              </button>
              {walletAddress && (
                <button 
                  onClick={() => onNavigateView('portfolio')}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentView === 'portfolio' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  Portfolio
                </button>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-1.5 md:p-2 text-gray-400 hover:text-gray-900 transition-colors relative"
              >
                <Bell className="h-5 w-5 md:h-5 md:w-5" />
                <span className="absolute top-1.5 right-1.5 md:top-1.5 md:right-1.5 block h-2 w-2 rounded-full border border-white bg-red-500"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-[-40px] md:right-0 mt-2 w-72 md:w-80 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <span className="font-semibold text-sm text-gray-900">Notifications</span>
                    <button className="text-xs text-blue-600 hover:text-blue-800">Mark all as read</button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {mockNotifications.map(notif => (
                      <div key={notif.id} className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${notif.read ? 'opacity-70' : ''}`}>
                        <div className="flex space-x-3">
                          <div className="mt-0.5">
                            {notif.read ? <CheckCircle2 className="h-4 w-4 text-gray-400" /> : <Clock className="h-4 w-4 text-blue-500" />}
                          </div>
                          <div>
                            <p className="text-sm text-gray-800">{notif.text}</p>
                            <p className="text-xs text-gray-400 mt-1 font-mono">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {walletAddress ? (
              <div className="relative z-50">
                <button 
                  onClick={() => setShowWalletMenu(!showWalletMenu)}
                  className="flex items-center space-x-1.5 md:space-x-3 bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200 rounded-md px-2 py-1 md:px-3 md:py-1.5 shadow-sm max-w-[200px] sm:max-w-none overflow-hidden"
                >
                  <div className="hidden sm:flex items-center text-sm font-medium text-gray-900 border-r border-gray-200 pr-3">
                    {new Intl.NumberFormat('en-US').format(availableBalance)} <span className="text-gray-500 ml-1 text-xs">USDC</span>
                  </div>
                  <div className="flex items-center space-x-1.5 md:space-x-2">
                    <div className="h-5 w-5 md:h-6 md:w-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-inner shrink-0">
                       <UserIcon className="h-3 w-3 md:h-3 md:w-3 text-white" />
                    </div>
                    <span className="text-xs md:text-sm font-mono font-medium text-gray-700 truncate">{walletAddress.substring(0,6)}...{walletAddress.substring(38)}</span>
                  </div>
                </button>
                {showWalletMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-20">
                    <button 
                      onClick={() => {
                        setShowWalletMenu(false);
                        onConnectClick();
                      }}
                      className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100 transition-colors"
                    >
                      <Wallet className="h-4 w-4 mr-2 text-gray-400" />
                      Change Wallet
                    </button>
                    <button 
                      onClick={() => {
                        setShowWalletMenu(false);
                        onDisconnect?.();
                        onNavigateView('marketplace');
                      }}
                      className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Disconnect Wallet
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={onConnectClick}
                className="flex items-center bg-black hover:bg-gray-800 text-white px-2.5 py-1.5 md:px-4 md:py-2 rounded-md text-xs md:text-sm font-medium transition-colors shadow-sm"
              >
                <Wallet className="h-3.5 w-3.5 md:h-4 md:w-4 mr-0 sm:mr-2" />
                <span className="hidden sm:inline">Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Content */}
      {mobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 top-[64px] bg-black/20 backdrop-blur-sm z-40 md:hidden" 
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute top-[64px] left-0 right-0 z-50 md:hidden border-b border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <button 
                onClick={() => { onNavigateView('marketplace'); setMobileMenuOpen(false); }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${currentView === 'marketplace' ? 'bg-gray-50 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                Marketplace
              </button>
              {walletAddress && (
                <button 
                  onClick={() => { onNavigateView('portfolio'); setMobileMenuOpen(false); }}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${currentView === 'portfolio' ? 'bg-gray-50 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  Portfolio
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
};
