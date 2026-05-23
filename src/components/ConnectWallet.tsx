import React, { useState } from 'react';
import { X, Wallet, Shield } from 'lucide-react';

export const ConnectWallet = ({ onClose, onConnect }: { onClose: () => void, onConnect: (addr: string) => void }) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    setIsConnecting(true);
    setTimeout(() => {
      onConnect('0x71C...' + Math.floor(Math.random() * 10000).toString(16));
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold flex items-center">
            <Wallet className="h-5 w-5 mr-2" /> Connect Wallet
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-500 mb-6 text-center text-balance">
            Securely connect your wallet to interact with the kbridge portal.
          </p>
          
          <button 
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-black hover:bg-gray-50 transition-colors group mb-4"
          >
            <div className="flex items-center">
              <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center mr-3 shadow-sm border border-gray-200 p-1">
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="h-full w-full object-contain" />
              </div>
              <span className="font-semibold text-gray-900">MetaMask</span>
            </div>
            {isConnecting ? (
              <span className="text-xs font-medium text-gray-500 flex items-center bg-gray-100 px-2 py-1 rounded">
                <svg className="animate-spin mr-2 h-3.5 w-3.5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Connecting...
              </span>
            ) : (
              <span className="text-xs font-semibold text-gray-400 group-hover:text-black">Connect</span>
            )}
          </button>
          
          <button 
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-black hover:bg-gray-50 transition-colors group disabled:opacity-50"
          >
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full flex items-center justify-center mr-3 shadow-sm border border-gray-200 bg-white">
                <svg viewBox="0 0 120 120" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none">
                  <rect width="120" height="120" rx="30" fill="#3396FF"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M37.756 46.126C49.983 34.137 69.757 34.024 82.115 46.126L83.948 47.923C85.111 49.063 85.127 50.925 83.985 52.083L77.712 58.455C77.106 59.07 76.108 59.073 75.498 58.463L73.919 56.884C66.196 49.16 53.676 49.16 45.952 56.883L44.373 58.462C43.764 59.072 42.766 59.07 42.159 58.454L35.886 52.083C34.745 50.924 34.76 49.06 35.923 47.922L37.756 46.126ZM20.763 65.656C19.576 66.864 19.585 68.847 20.783 70.043L27.671 76.923C28.288 77.539 29.294 77.536 29.907 76.917L44.208 62.484C45.395 61.285 45.395 59.342 44.208 58.143L36.326 50.278C35.139 49.092 33.218 49.092 32.031 50.278L20.763 61.644V61.656ZM87.842 50.278L79.948 58.156C78.761 59.342 78.761 61.285 79.948 62.484L94.249 76.901C94.862 77.519 95.868 77.523 96.485 76.906L103.376 70.024C104.57 68.829 104.579 66.85 103.393 65.641L92.112 50.278C90.925 49.092 89.016 49.092 87.829 50.278H87.842Z" fill="white"/>
                </svg>
              </div>
              <span className="font-semibold text-gray-900">WalletConnect</span>
            </div>
            <span className="text-xs font-semibold text-gray-400 group-hover:text-black">Connect</span>
          </button>
        </div>
      </div>
    </div>
  );
};
