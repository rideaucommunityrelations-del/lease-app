// Templates already contain a literal "$" before money placeholders,
// so these formatters output bare numbers — no currency symbol.

function formatDate(isoStr) {
  if (!isoStr) return '';
  const [y, m, d] = isoStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function formatMoney(amount) {
  if (amount === undefined || amount === null || amount === '') return '';
  return Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

module.exports = { formatDate, formatMoney };
