// All money math is done in integer cents to avoid floating point drift,
// then converted back to a rounded 2-decimal number for display/storage.

function parseDateUTC(dateStr) {
  // Expects "YYYY-MM-DD" (HTML date input format). Parsed as UTC midnight
  // so day-count math isn't affected by local timezone/DST.
  const [y, m, d] = dateStr.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

function daysInclusive(startStr, endStr) {
  const start = parseDateUTC(startStr);
  const end = parseDateUTC(endStr);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((end - start) / msPerDay) + 1;
}

function toCents(amount) {
  return Math.round(Number(amount) * 100);
}

function centsToAmount(cents) {
  return Math.round(cents) / 100;
}

/**
 * Guest / Respite calculations.
 * nights = (end_date - start_date) + 1, inclusive of both ends.
 * Second-person block is optional: pass second_person_rate falsy/blank to omit it.
 */
function calculateGuestRespite(fields) {
  const {
    start_date,
    end_date,
    daily_rate,
    second_person_start,
    second_person_end,
    second_person_rate,
  } = fields;

  const nights = daysInclusive(start_date, end_date);
  const residentTotalCents = nights * toCents(daily_rate);

  let second_person_days = 0;
  let second_person_total = 0;
  const hasSecondPerson =
    second_person_start && second_person_end && second_person_rate;

  if (hasSecondPerson) {
    second_person_days = daysInclusive(second_person_start, second_person_end);
    const secondTotalCents = second_person_days * toCents(second_person_rate);
    second_person_total = centsToAmount(secondTotalCents);
  }

  const grandTotalCents =
    residentTotalCents + toCents(second_person_total);

  return {
    nights,
    resident_total: centsToAmount(residentTotalCents),
    second_person_days,
    second_person_total,
    grand_total: centsToAmount(grandTotalCents),
  };
}

/**
 * Permanent (month-to-month) calculations.
 * deposit is always half the monthly rate — never manually entered.
 */
function calculatePermanent(fields) {
  const { monthly_rate } = fields;
  const depositCents = Math.round(toCents(monthly_rate) / 2);
  return {
    deposit: centsToAmount(depositCents),
  };
}

module.exports = {
  daysInclusive,
  calculateGuestRespite,
  calculatePermanent,
};
