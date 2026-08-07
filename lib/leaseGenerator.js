const fs = require('fs');
const path = require('path');
const { fillTemplate } = require('./templateFill');
const { convertDocxToPdf } = require('./pdfConvert');

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');
const OUTPUT_DIR = path.join(__dirname, '..', 'output');

const TEMPLATE_FILES = {
  guest: 'Guest_TEMPLATE.docx',
  respite: 'Respite_TEMPLATE.docx',
  permanent: 'Permanent_TEMPLATE.docx',
};

function slugify(str) {
  return String(str)
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'resident';
}

/**
 * Fills the docx template for `leaseType` with `templateData`, converts it to
 * PDF, and returns the generated filenames (relative to output/).
 */
async function generateLease(leaseType, templateData, residentName) {
  const templateFile = TEMPLATE_FILES[leaseType];
  if (!templateFile) {
    throw new Error(`Unknown lease type: ${leaseType}`);
  }

  const templatePath = path.join(TEMPLATES_DIR, templateFile);
  const docxBuffer = fillTemplate(templatePath, templateData);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const baseName = `${leaseType}_${slugify(residentName)}_${timestamp}`;
  const docxFilename = `${baseName}.docx`;
  const docxPath = path.join(OUTPUT_DIR, docxFilename);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(docxPath, docxBuffer);

  const pdfPath = await convertDocxToPdf(docxPath, OUTPUT_DIR);
  const pdfFilename = path.basename(pdfPath);

  return { docxFilename, pdfFilename };
}

module.exports = { generateLease, TEMPLATE_FILES };
