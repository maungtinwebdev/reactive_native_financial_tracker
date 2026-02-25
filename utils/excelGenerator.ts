import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import XLSX from 'xlsx';
import { Transaction } from '@/store/transactionStore';
import { formatCurrency } from './format';
import i18n from '@/i18n';
import { format } from 'date-fns';

export const generateExcel = async (title: string, transactions: Transaction[], summary: { income: number; expense: number; balance: number }) => {
  try {
    console.log('Starting Excel generation...');
    
    // Create workbook
    const wb = XLSX.utils.book_new();

    // Create summary worksheet
    const summaryData = [
      [i18n.t('analytics.title'), title],
      [''],
      [i18n.t('analytics.totalIncome'), formatCurrency(summary.income)],
      [i18n.t('analytics.totalExpense'), formatCurrency(summary.expense)],
      [i18n.t('dashboard.totalBalance'), formatCurrency(summary.balance)],
      ['']
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, i18n.t('analytics.summary'));

    // Create transactions worksheet
    const headers = [
      i18n.t('transactions.date'),
      i18n.t('transactions.type'),
      i18n.t('transactions.category'),
      i18n.t('transactions.description'),
      i18n.t('transactions.amount')
    ];

    const transactionsData = [
      headers,
      ...transactions.map(t => [
        format(new Date(t.date), 'yyyy-MM-dd'),
        i18n.t(`transactions.${t.type}`),
        i18n.t(`categories.${t.category}`),
        t.description || '',
        t.type === 'income' ? `+${formatCurrency(Number(t.amount))}` : `-${formatCurrency(Number(t.amount))}`
      ])
    ];

    const wsTransactions = XLSX.utils.aoa_to_sheet(transactionsData);
    
    // Auto-size columns
    const colWidths = [
      { wch: 15 }, // Date
      { wch: 15 }, // Type
      { wch: 20 }, // Category
      { wch: 30 }, // Description
      { wch: 15 }, // Amount
    ];
    wsTransactions['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(wb, wsTransactions, i18n.t('analytics.transactions'));

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    const fileName = `${title.replace(/[^a-z0-9]/gi, '_')}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    
    console.log('Generated Excel buffer, length:', excelBuffer.length);
    console.log('File name:', fileName);
    
    // Try different directory approaches
    let fileUri: string;
    try {
      // Try new API first
      const cacheDir = FileSystem.Paths.cache.uri;
      fileUri = `${cacheDir}${fileName}`;
      console.log('Using new API, fileUri:', fileUri);
    } catch (dirError: any) {
      console.log('New API failed, trying fallback:', dirError);
      // Fallback to simple URI construction
      fileUri = `file://${fileName}`;
      console.log('Using fallback, fileUri:', fileUri);
    }

    // Write file
    try {
      await FileSystem.writeAsStringAsync(fileUri, excelBuffer);
      console.log('File written successfully');
    } catch (writeError: any) {
      console.error('Error writing file:', writeError);
      throw new Error(`Failed to write Excel file: ${writeError?.message || writeError}`);
    }

    // Share file
    try {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: `${title} - ${i18n.t('analytics.excel')}`,
        UTI: 'com.microsoft.excel.xlsx'
      });
      console.log('File shared successfully');
    } catch (shareError: any) {
      console.error('Error sharing file:', shareError);
      throw new Error(`Failed to share Excel file: ${shareError?.message || shareError}`);
    }

  } catch (error) {
    console.error('Error generating Excel:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw error;
  }
};
