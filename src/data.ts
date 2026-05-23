import { Invoice, InvestorAllocation, LineItem } from './types';

const genericColors = ['#2563EB', '#16A34A', '#D97706', '#DC2626', '#7C3AED', '#0891B2', '#4F46E5', '#EA580C'];

const generateLineItems = (total: number, sector: string): LineItem[] => {
  const descriptions = {
    'Manufacturing': ['Q2 Bulk Fasteners Order', 'Industrial Supply - Part A', 'Machinery Upgrades', 'Tooling Setup Fee'],
    'Logistics': ['Cross-border Freight', 'Cold Chain Transport', 'Warehousing Services', 'Import Duties'],
    'Technology': ['Cloud Infrastructure Services', 'Hardware Procurement', 'Software Licensing Q3', 'Consulting Retainer'],
    'Energy': ['Solar Panel Modules', 'Site Preparation', 'Inverter Hardware', 'Engineering Assessment'],
    'Commodities': ['Grade A Export Timber', 'Customs Handling', 'Shipping Insurance', 'Inspection Fees'],
    'Healthcare': ['Medical Equipment - Tranche 1', 'Diagnostic Supplies', 'PPE Bulk Order', 'Research Grants'],
    'Retail': ['Q4 Inventory Restock', 'POS System Upgrades', 'Store Fixtures', 'Marketing Services'],
    'Agriculture': ['Fertilizer Bulk Order', 'Harvesting Equipment Lease', 'Distribution Services', 'Packaging Materials'],
    'Robotics': ['Automation Sensors', 'Servo Motors Batch', 'Integration Consulting', 'Software Calibration'],
    'Aerospace': ['Aviation Components', 'Material Testing', 'Specialized Tooling', 'Quality Assurance']
  } as Record<string, string[]>;
  
  const options = descriptions[sector] || descriptions['Manufacturing'];
  const count = Math.floor(Math.random() * 2) + 2; // 2 or 3 items
  let remaining = total;
  
  const items: LineItem[] = [];
  for (let i = 0; i < count - 1; i++) {
    const amount = Math.floor(total * (Math.random() * 0.3 + 0.2)); // 20-50%
    remaining -= amount;
    items.push({
      id: `li-${Math.random().toString(36).substr(2, 9)}`,
      description: options[i % options.length],
      quantity: 1,
      unitPrice: amount
    });
  }
  
  items.push({
    id: `li-${Math.random().toString(36).substr(2, 9)}`,
    description: options[count - 1] || 'Additional Services',
    quantity: 1,
    unitPrice: remaining
  });
  
  return items;
};

const generateMockInvoices = (): Invoice[] => {
  const baseInvoices: Invoice[] = [
    {
      id: 'INV-2026-8921',
      borrowerName: 'Acme Nuts & Bolts Manufacturing',
      borrowerDetails: 'Leading supplier of industrial fasteners in the Midwest region. Operating since 2012 with a solid track record of fulfillment.',
      logoColor: '#DC2626',
      originator: 'Credable',
      sector: 'Manufacturing',
      invoiceAmount: 100000,
      yieldRate: 5.0,
      interestTotal: 10000,
      maturityDate: '2026-08-21',
      termDays: 90,
      tokenPrice: 1000,
      totalTokens: 100,
      availableTokens: 42,
      technologyFeeRate: 0.005,
      status: 'Funding',
      lineItems: [
        { id: 'li-1', description: 'Wholesale Order Formulation - Batch A', quantity: 1, unitPrice: 60000 },
        { id: 'li-2', description: 'Logistics and Forwarding Services', quantity: 1, unitPrice: 40000 }
      ],
      documents: [
        { id: 'd1', name: 'Original Invoice #9921', type: 'PDF', size: '1.2 MB', url: '#' },
        { id: 'd2', name: 'Purchase Order', type: 'PDF', size: '0.8 MB', url: '#' },
        { id: 'd3', name: 'Bill of Lading', type: 'PDF', size: '2.1 MB', url: '#' },
      ],
      recentInvestors: [
        { id: 'i1', address: '0x71C...3a9B', shares: 5, timestamp: '10 mins ago', value: 5000, txHash: '0x32a1...bc29', status: 'Confirmed' },
        { id: 'i2', address: '0x992...b4f1', shares: 12, timestamp: '2 hours ago', value: 12000, txHash: '0x4f12...e131', status: 'Confirmed' },
        { id: 'i3', address: '0x1A4...e88c', shares: 20, timestamp: '5 hours ago', value: 20000, txHash: '0x5bb4...8a9c', status: 'Confirmed' },
        { id: 'i4', address: '0x4F0...d722', shares: 2, timestamp: '1 day ago', value: 2000, txHash: '0x629c...1d24', status: 'Confirmed' },
      ]
    },
    {
      id: 'INV-2026-8922',
      borrowerName: 'Global Timber Exports Ltd.',
      borrowerDetails: 'International distributor of specialized timber products. Main export market is Western Europe.',
      logoColor: '#16A34A',
      originator: 'Finverity',
      sector: 'Commodities',
      invoiceAmount: 250000,
      yieldRate: 7.2,
      interestTotal: 36000,
      maturityDate: '2026-11-15',
      termDays: 120,
      tokenPrice: 5000,
      totalTokens: 50,
      availableTokens: 10,
      technologyFeeRate: 0.005,
      status: 'Funding',
      lineItems: [
        { id: 'li-3', description: 'Grade A Pine Lumber - Q3 Delivery', quantity: 2, unitPrice: 100000 },
        { id: 'li-4', description: 'Container Freight and Tariffs', quantity: 1, unitPrice: 50000 }
      ],
      documents: [
        { id: 'd4', name: 'Master Export Agreement', type: 'PDF', size: '3.4 MB', url: '#' },
        { id: 'd5', name: 'Customs Declaration', type: 'PDF', size: '1.1 MB', url: '#' },
      ],
      recentInvestors: [
        { id: 'i5', address: '0x2B1...8c4A', shares: 15, timestamp: '30 mins ago', value: 75000, txHash: '0x88f1...ca34', status: 'Confirmed' },
        { id: 'i6', address: '0x88C...a19f', shares: 25, timestamp: '2 days ago', value: 125000, txHash: '0x992b...e165', status: 'Confirmed' },
      ]
    }
  ];

  const genericCompanyNames = ['Peak ', 'Nova ', 'Oasis ', 'Vertex ', 'Quantum ', 'Nexus '];
  const genericCompanySurnames = ['Healthcare', 'Logistics', 'Retail', 'Agriculture', 'Robotics', 'Energy', 'Aerospace'];
  
  const additional = Array.from({ length: 23 }).map((_, i) => {
    const id = `INV-2026-${9000 + i}`;
    const originator = i % 3 === 0 ? 'Finverity' : 'Credable';
    const sector = genericCompanySurnames[i % genericCompanySurnames.length];
    const borrowerName = `${genericCompanyNames[i % genericCompanyNames.length]}${sector} Inc.`;
    const invoiceAmount = Math.floor(Math.random() * 80 + 20) * 10000;
    const tokenPrice = invoiceAmount >= 500000 ? 5000 : 1000;
    const totalTokens = invoiceAmount / tokenPrice;
    const logoColor = genericColors[i % genericColors.length];
    
    // Some are fully funded, some have missing tokens
    const isFunded = Math.random() > 0.8; 
    const availableTokens = isFunded ? 0 : Math.floor(Math.random() * totalTokens);
    
    // Random dates
    const date = new Date(2026, 6 + Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1);
    const maturityDate = date.toISOString().split('T')[0];
    const termDays = [30, 45, 60, 90, 120, 180][Math.floor(Math.random() * 6)];
    const yieldRate = +(4.0 + Math.random() * 5.0).toFixed(1);
    
    const docId = `doc-${i}`;
    
    const numInvestors = isFunded ? Math.floor(Math.random() * 5) + 3 : Math.floor(Math.random() * 3);
    const recentInvestors: InvestorAllocation[] = Array.from({ length: numInvestors }).map((_, idx) => ({
      id: `i-${i}-${idx}`,
      address: '0x' + Math.random().toString(16).substring(2, 6).toUpperCase() + '...' + Math.random().toString(16).substring(2, 6).toUpperCase(),
      shares: Math.floor(Math.random() * 10) + 1,
      timestamp: isFunded ? `${Math.floor(Math.random() * 5 + 1)} days ago` : `${Math.floor(Math.random() * 10 + 1)} hours ago`,
      value: Math.floor(Math.random() * 50000) + 5000,
      txHash: '0x' + Array.from({length: 8}, () => Math.floor(Math.random()*16).toString(16)).join(''),
      status: 'Confirmed'
    }));
    
    return {
      id,
      borrowerName,
      borrowerDetails: `Established ${sector} provider specializing in enterprise solutions and large scale integration.`,
      logoColor,
      originator,
      sector,
      lineItems: generateLineItems(invoiceAmount, sector),
      invoiceAmount,
      yieldRate,
      interestTotal: (invoiceAmount * yieldRate / 100) * (termDays / 365),
      maturityDate,
      termDays,
      tokenPrice,
      totalTokens,
      availableTokens,
      technologyFeeRate: 0.005,
      status: isFunded ? 'Funded' : 'Funding',
      documents: [
        { id: docId, name: `Invoice #${10000+i}`, type: 'PDF', size: '1.4 MB', url: '#' },
      ],
      recentInvestors
    } as Invoice;
  });

  return [...baseInvoices, ...additional];
};

export const MOCK_INVOICES: Invoice[] = generateMockInvoices();

export const formatCurrency = (amount: number) => {
  return amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' USDC';
};

export const formatPercent = (rate: number) => {
  return new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 3 }).format(rate / 100);
};
