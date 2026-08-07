const express = require('express');
const router = express.Router();

const { buildLeaseData, ValidationError } = require('../lib/buildLeaseData');
const { generateLease } = require('../lib/leaseGenerator');
const { insertLease, listLeases } = require('../db/db');

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

router.get('/', (req, res) => {
  res.render('index', { error: null, success: null, today: todayISO() });
});

router.post('/generate', async (req, res) => {
  const { lease_type } = req.body;

  try {
    const { templateData, dbRow } = buildLeaseData(lease_type, req.body);
    const { docxFilename, pdfFilename } = await generateLease(
      lease_type,
      templateData,
      dbRow.resident_name
    );

    insertLease({
      ...dbRow,
      pdf_filename: pdfFilename,
      docx_filename: docxFilename,
    });

    res.render('index', {
      error: null,
      today: todayISO(),
      success: {
        resident_name: dbRow.resident_name,
        lease_type,
        pdf_filename: pdfFilename,
        docx_filename: docxFilename,
      },
    });
  } catch (err) {
    const status = err instanceof ValidationError ? 400 : 500;
    if (status === 500) console.error(err);
    res.status(status).render('index', {
      error: err.message,
      success: null,
      today: todayISO(),
    });
  }
});

router.get('/history', (req, res) => {
  const leases = listLeases();
  res.render('history', { leases });
});

module.exports = router;
