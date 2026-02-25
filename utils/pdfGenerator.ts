import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Transaction } from '@/store/transactionStore';
import { formatCurrency } from './format';
import i18n from '@/i18n';

export const generatePDF = async (title: string, transactions: Transaction[], summary: { income: number; expense: number; balance: number }) => {
  const html = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; color: #333; margin-bottom: 20px; }
          .summary { display: flex; justify-content: space-around; margin-bottom: 30px; border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; background-color: #f9fafb; }
          .summary-item { text-align: center; }
          .label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
          .value { font-size: 20px; font-weight: bold; margin-top: 5px; }
          .income { color: #10b981; }
          .expense { color: #ef4444; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
          th, td { border-bottom: 1px solid #e5e7eb; padding: 12px 8px; text-align: left; }
          th { background-color: #f3f4f6; color: #374151; font-weight: 600; }
          tr:last-child td { border-bottom: none; }
          .amount { text-align: right; font-weight: 500; }
          .date { color: #6b7280; width: 100px; }
          .category { font-weight: 500; color: #111827; }
          .note { color: #9ca3af; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        
        <div class="summary">
          <div class="summary-item">
            <div class="label">${i18n.t('analytics.totalIncome')}</div>
            <div class="value income">${formatCurrency(summary.income)}</div>
          </div>
          <div class="summary-item">
            <div class="label">${i18n.t('analytics.totalExpense')}</div>
            <div class="value expense">${formatCurrency(summary.expense)}</div>
          </div>
          <div class="summary-item">
            <div class="label">${i18n.t('dashboard.totalBalance')}</div>
            <div class="value">${formatCurrency(summary.balance)}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>${i18n.t('transactions.date')}</th>
              <th>${i18n.t('transactions.category')}</th>
              <th class="amount">${i18n.t('transactions.amount')}</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.map(t => `
              <tr>
                <td class="date">${new Date(t.date).toLocaleDateString(i18n.language === 'mm' ? 'my-MM' : i18n.language === 'jp' ? 'ja-JP' : 'en-US')}</td>
                <td>
                  <div class="category">${i18n.t(`categories.${t.category}`)}</div>
                  ${t.description ? `<div class="note">${t.description}</div>` : ''}
                </td>
                <td class="amount" style="color: ${t.type === 'income' ? '#10b981' : '#ef4444'}">
                  ${t.type === 'income' ? '+' : '-'}${formatCurrency(Number(t.amount))}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};
