import { format, parseISO, isValid } from 'date-fns';

export const formatDate = (date, formatString = 'MMM dd, yyyy') => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

export const formatDateTime = (date) => {
  return formatDate(date, 'MMM dd, yyyy HH:mm');
};

export const formatDateForInput = (date) => {
  return formatDate(date, 'yyyy-MM-dd');
};

export const getDateDaysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

export const isDateOverdue = (dueDate) => {
  if (!dueDate) return false;
  const due = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  return due < new Date();
};