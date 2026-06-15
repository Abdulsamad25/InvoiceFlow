import { CURRENCY_SYMBOLS } from './constants';

export const formatCurrency = (amount, currency = 'NGN') => {
  const symbol = CURRENCY_SYMBOLS[currency] || '₦';
  const formattedAmount = Math.round(amount || 0).toLocaleString('en-NG');
  return `${symbol}${formattedAmount}`;
};


export const parseCurrency = (formattedAmount) => {
  if (!formattedAmount) return 0;
  const numericValue = formattedAmount.toString().replace(/[^0-9.-]+/g, '');
  return parseFloat(numericValue) || 0;
};
