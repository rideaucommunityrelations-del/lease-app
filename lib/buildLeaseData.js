const { calculateGuestRespite, calculatePermanent } = require('./calculations');
const { formatDate, formatMoney } = require('./formatters');

class ValidationError extends Error {}

function requireFields(body, fields) {
  const missing = fields.filter((f) => !body[f] || String(body[f]).trim() === '');
  if (missing.length) {
    throw new ValidationError(`Missing required field(s): ${missing.join(', ')}`);
  }
}

const GUEST_RESPITE_REQUIRED = [
  'resident_name',
  'suite_number',
  'start_date',
  'end_date',
  'current_date',
  'deposit',
  'daily_rate',
];

/** Shared by Guest and Respite — identical field set. */
function buildGuestRespiteData(leaseType, body) {
  requireFields(body, GUEST_RESPITE_REQUIRED);

  const raw = {
    resident_name: body.resident_name.trim(),
    suite_number: body.suite_number.trim(),
    start_date: body.start_date,
    end_date: body.end_date,
    current_date: body.current_date,
    deposit: body.deposit,
    daily_rate: body.daily_rate,
    parking_space: (body.parking_space || '').trim(),
    parking_fee: body.parking_fee || '',
    scooter_space: (body.scooter_space || '').trim(),
    scooter_fee: body.scooter_fee || '',
    second_person_name: (body.second_person_name || '').trim(),
    second_person_start: body.second_person_start || '',
    second_person_end: body.second_person_end || '',
    second_person_rate: body.second_person_rate || '',
  };

  const calc = calculateGuestRespite(raw);

  const templateData = {
    resident_name: raw.resident_name,
    suite_number: raw.suite_number,
    start_date: formatDate(raw.start_date),
    end_date: formatDate(raw.end_date),
    current_date: formatDate(raw.current_date),
    deposit: formatMoney(raw.deposit),
    daily_rate: formatMoney(raw.daily_rate),
    nights: calc.nights,
    resident_total: formatMoney(calc.resident_total),
    parking_space: raw.parking_space,
    parking_fee: formatMoney(raw.parking_fee),
    scooter_space: raw.scooter_space,
    scooter_fee: formatMoney(raw.scooter_fee),
    second_person_name: raw.second_person_name,
    second_person_start: formatDate(raw.second_person_start),
    second_person_end: formatDate(raw.second_person_end),
    second_person_rate: formatMoney(raw.second_person_rate),
    second_person_days: calc.second_person_days || '',
    second_person_total: formatMoney(calc.second_person_total),
    grand_total: formatMoney(calc.grand_total),
  };

  const dbRow = {
    lease_type: leaseType,
    resident_name: raw.resident_name,
    suite_number: raw.suite_number,
    start_date: raw.start_date,
    end_date: raw.end_date,
    current_date: raw.current_date,
    total_amount: calc.grand_total,
    deposit: Number(raw.deposit),
    fields_json: { ...raw, ...calc },
  };

  return { templateData, dbRow };
}

const PERMANENT_REQUIRED = [
  'resident_name',
  'suite_number',
  'start_date',
  'current_date',
  'monthly_rate',
];

function buildPermanentData(body) {
  requireFields(body, PERMANENT_REQUIRED);

  const raw = {
    resident_name: body.resident_name.trim(),
    suite_number: body.suite_number.trim(),
    start_date: body.start_date,
    current_date: body.current_date,
    monthly_rate: body.monthly_rate,
    resident2_name: (body.resident2_name || '').trim(),
    resident2_amount: body.resident2_amount || '',
  };

  const calc = calculatePermanent(raw);

  const templateData = {
    resident_name: raw.resident_name,
    suite_number: raw.suite_number,
    start_date: formatDate(raw.start_date),
    current_date: formatDate(raw.current_date),
    monthly_rate: formatMoney(raw.monthly_rate),
    deposit: formatMoney(calc.deposit),
    resident2_name: raw.resident2_name,
    // Template has no literal "$" before this placeholder, unlike the other
    // money fields, so it's added here when a second resident is present.
    resident2_amount: raw.resident2_amount
      ? `$${formatMoney(raw.resident2_amount)}`
      : '',
  };

  const dbRow = {
    lease_type: 'permanent',
    resident_name: raw.resident_name,
    suite_number: raw.suite_number,
    start_date: raw.start_date,
    end_date: null,
    current_date: raw.current_date,
    total_amount: Number(raw.monthly_rate),
    deposit: calc.deposit,
    fields_json: { ...raw, ...calc },
  };

  return { templateData, dbRow };
}

function buildLeaseData(leaseType, body) {
  switch (leaseType) {
    case 'guest':
      return buildGuestRespiteData('guest', body);
    case 'respite':
      return buildGuestRespiteData('respite', body);
    case 'permanent':
      return buildPermanentData(body);
    default:
      throw new ValidationError(`Unknown lease type: ${leaseType}`);
  }
}

module.exports = { buildLeaseData, ValidationError };
