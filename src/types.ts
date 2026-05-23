export interface InvestorAllocation {
  id: string;
  address: string;
  shares: number;
  timestamp: string;
  value: number;
  txHash?: string;
  status?: string;
}

export interface UserInvestment {
  id: string;
  invoiceId: string;
  borrowerName: string;
  shares: number;
  totalCost: number;
  expectedReturn: number;
  maturityDate: string;
  timestamp: string;
  txHash: string;
  status: 'Pending' | 'Confirmed';
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  url: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export type InvoiceStatus = 'Pending' | 'Tokenized' | 'Funding' | 'Fully Funded' | 'Active' | 'Matured' | 'Settled' | 'Defaulted';

export interface Invoice {
  id: string;
  borrowerName: string;
  borrowerDetails: string;
  logoColor: string;
  lineItems: LineItem[];
  originator: string;
  sector: string;
  invoiceAmount: number;
  yieldRate: number; // e.g. 5.0 for 5%
  interestTotal: number;
  maturityDate: string;
  termDays: number;
  tokenPrice: number; 
  totalTokens: number;
  availableTokens: number;
  technologyFeeRate: number; // e.g. 0.005
  status: InvoiceStatus;
  documents: Document[];
  recentInvestors: InvestorAllocation[];
}
