import React from 'react';
import { InvoiceStatus } from '../types';
import { HelpCircle } from 'lucide-react';

const STATUS_DETAILS: Record<InvoiceStatus, { label: string; description: string; bg: string; text: string; dot: string }> = {
  Pending: {
    label: 'Pending',
    description: 'Invoice received from originator, not yet tokenized',
    bg: 'bg-slate-100 border-slate-200 text-slate-700',
    text: 'text-slate-700',
    dot: 'bg-slate-400'
  },
  Tokenized: {
    label: 'Tokenized',
    description: 'Token minted on Hedera, available for investment',
    bg: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    text: 'text-indigo-700',
    dot: 'bg-indigo-500'
  },
  Funding: {
    label: 'Funding',
    description: 'Partially funded, still accepting investors',
    bg: 'bg-amber-50 border-amber-200 text-amber-700',
    text: 'text-amber-700',
    dot: 'bg-amber-500'
  },
  'Fully Funded': {
    label: 'Fully Funded',
    description: '100% of invoice funded by investors',
    bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500'
  },
  Active: {
    label: 'Active',
    description: 'Fully funded, awaiting maturity date',
    bg: 'bg-blue-50 border-blue-200 text-blue-700',
    text: 'text-blue-700',
    dot: 'bg-blue-500'
  },
  Matured: {
    label: 'Matured',
    description: 'Due date reached, awaiting repayment confirmation',
    bg: 'bg-purple-50 border-purple-200 text-purple-700',
    text: 'text-purple-700',
    dot: 'bg-purple-500'
  },
  Settled: {
    label: 'Settled',
    description: 'Buyer paid, USDC distributed to investors, tokens burned',
    bg: 'bg-green-50 border-green-200 text-green-700',
    text: 'text-green-700',
    dot: 'bg-green-500'
  },
  Defaulted: {
    label: 'Defaulted',
    description: 'Buyer failed to pay, recovery process initiated',
    bg: 'bg-red-50 border-red-200 text-red-700',
    text: 'text-red-700',
    dot: 'bg-red-500'
  }
};

export const InvoiceStatusBadge: React.FC<{ status: InvoiceStatus; className?: string }> = ({ status, className = "" }) => {
  const details = STATUS_DETAILS[status] || STATUS_DETAILS.Pending;
  
  return (
    <div className={`relative inline-block group select-none ${className}`} id={`status-badge-${status.replace(/\s+/g, '-').toLowerCase()}`}>
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${details.bg} shadow-xs cursor-help transition-all duration-200 hover:brightness-95`}>
        <span className={`h-1.5 w-1.5 rounded-full ${details.dot} mr-2 ${status === 'Funding' ? 'animate-pulse' : ''}`}></span>
        {details.label}
        <HelpCircle className="h-3 w-3 ml-1.5 opacity-40 group-hover:opacity-80 transition-opacity" />
      </span>
      
      {/* Floating Tooltip with nice entrance transition */}
      <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-950 text-white rounded-lg text-xs leading-relaxed shadow-xl border border-gray-800 opacity-0 invisible scale-95 origin-bottom group-hover:opacity-100 group-hover:visible group-hover:scale-100 transition-all duration-300 pointer-events-none whitespace-normal">
        <div className="font-bold text-gray-200 mb-1 flex items-center justify-between">
          <span>{details.label} Status</span>
          <span className="text-[10px] uppercase font-mono px-1 py-0.2 bg-gray-800 text-gray-400 rounded">Definition</span>
        </div>
        <div className="text-gray-300 font-normal border-t border-gray-800/40 mt-1.5 pt-1.5 leading-normal">
          {details.description}
        </div>
        {/* Tooltip caret */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-950"></div>
      </div>
    </div>
  );
};
