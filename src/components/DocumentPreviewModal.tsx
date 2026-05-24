import React from 'react';
import { X, Download, FileText } from 'lucide-react';
import { Document, Invoice } from '../types';
import { formatCurrency } from '../data';
import { BusinessLogo } from './InvoiceList';

export const DocumentPreviewModal = ({ 
  invoice, 
  document, 
  onClose,
  onDownload
}: { 
  invoice: Invoice;
  document: Document;
  onClose: () => void;
  onDownload: () => void;
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center animate-in fade-in duration-200 p-4 sm:p-6">
      <div className="bg-gray-100 rounded-xl shadow-xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-white border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-red-50 p-2 rounded text-red-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">{document.name}</h2>
              <p className="text-xs text-gray-500">{invoice.borrowerName} • {document.size} • {document.type}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={onDownload}
              className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors flex items-center shadow-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </button>
            <div className="h-6 w-px bg-gray-200"></div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-900 transition-colors bg-gray-50 p-2 rounded-md hover:bg-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Fake PDF Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 flex justify-center bg-gray-200/50">
          <div className="bg-white w-full max-w-4xl min-h-[800px] shadow-sm border border-gray-200 flex flex-col p-8 sm:p-12">
             {/* Mock Invoice Visual */}
             <div className="flex justify-between items-start mb-16">
               <div>
                 <h1 className="text-4xl font-bold text-gray-900 mb-4">INVOICE</h1>
                 <p className="text-gray-500 text-sm font-mono">{document.name}</p>
                 <p className="text-gray-500 text-sm font-mono mt-1">Date:  {new Date().toLocaleDateString('en-GB')}</p>
               </div>
               <div className="flex items-center space-x-3 text-right">
                 <div className="text-right">
                   <div className="text-2xl font-bold text-gray-900">{invoice.borrowerName}</div>
                   <div className="text-sm text-gray-500 mt-2 font-medium">123 Corporate Blvd<br/>Suite 400<br/>Business District, 10001</div>
                 </div>
                 <BusinessLogo name={invoice.borrowerName} sector={invoice.sector} color={invoice.logoColor} className="h-16 w-16 text-2xl shadow-none border border-gray-200 ml-4 rounded-xl" />
               </div>
             </div>

             <div className="grid grid-cols-2 gap-8 mb-12">
               <div>
                 <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Billed To</h3>
                 <div className="text-base font-medium text-gray-900">National Retail Conglomerate</div>
                 <div className="text-sm text-gray-500 max-w-[200px] mt-1 font-medium">456 Enterprise Way<br/>Commerce City, 90210</div>
               </div>
               <div className="text-right">
                 <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Terms</h3>
                 <div className="text-sm text-gray-900 font-mono">Net  {invoice.termDays}</div>
                 <div className="text-sm text-gray-900 mt-1 font-mono">Due:  {invoice.maturityDate}</div>
               </div>
             </div>

             <div className="border border-gray-200 rounded-lg mb-12">
               <table className="w-full text-left font-sans text-sm">
                 <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                   <tr>
                     <th className="px-4 py-3 font-medium">Description</th>
                     <th className="px-4 py-3 font-medium text-center">Qty</th>
                     <th className="px-4 py-3 font-medium text-right">Unit Price</th>
                     <th className="px-4 py-3 font-medium text-right">Total</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100 font-mono text-gray-900">
                   {invoice.lineItems.map(item => (
                     <tr key={item.id}>
                       <td className="px-4 py-3 font-sans">{item.description}</td>
                       <td className="px-4 py-3 text-center">{item.quantity}</td>
                       <td className="px-4 py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                       <td className="px-4 py-3 text-right">{formatCurrency(item.unitPrice * item.quantity)}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>

             <div className="flex justify-end mb-8">
               <div className="w-72">
                 <div className="flex justify-between mb-4 text-sm font-medium">
                   <span className="text-gray-500">Subtotal</span>
                   <span className="font-mono text-gray-900">{formatCurrency(invoice.invoiceAmount)}</span>
                 </div>
                 <div className="flex justify-between mb-6 text-sm font-medium">
                   <span className="text-gray-500">Tax (0%)</span>
                   <span className="font-mono text-gray-900">0 USDC</span>
                 </div>
                 <div className="flex justify-between items-end pt-5 border-t-2 border-gray-900">
                   <span className="font-bold text-gray-900 text-lg">Total Due</span>
                   <span className="text-2xl font-bold font-mono text-gray-900">{formatCurrency(invoice.invoiceAmount)}</span>
                 </div>
               </div>
             </div>

             <div className="mt-auto pt-16 text-center text-xs text-gray-400">
               <p>This invoice is electronically generated and represents a legally binding agreement.</p>
               <p>Verified on KBridge Ledger • Token ID: {invoice.id}</p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};
