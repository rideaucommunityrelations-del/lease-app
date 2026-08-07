const path = require('path');
const Database = require('better-sqlite3');

const db = new Database(path.join(__dirname, 'leases.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS leases (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    lease_type    TEXT NOT NULL,
    resident_name TEXT NOT NULL,
    suite_number  TEXT NOT NULL,
    start_date    TEXT NOT NULL,
    end_date      TEXT,
    current_date  TEXT NOT NULL,
    total_amount  REAL,
    deposit       REAL,
    pdf_filename  TEXT NOT NULL,
    docx_filename TEXT NOT NULL,
    fields_json   TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

const insertLeaseStmt = db.prepare(`
  INSERT INTO leases (
    lease_type, resident_name, suite_number, start_date, end_date,
    current_date, total_amount, deposit, pdf_filename, docx_filename, fields_json
  ) VALUES (
    @lease_type, @resident_name, @suite_number, @start_date, @end_date,
    @current_date, @total_amount, @deposit, @pdf_filename, @docx_filename, @fields_json
  )
`);

function insertLease(lease) {
  const info = insertLeaseStmt.run({
    end_date: null,
    total_amount: null,
    deposit: null,
    ...lease,
    fields_json: JSON.stringify(lease.fields_json),
  });
  return info.lastInsertRowid;
}

function listLeases() {
  return db
    .prepare('SELECT * FROM leases ORDER BY created_at DESC, id DESC')
    .all();
}

module.exports = { db, insertLease, listLeases };
