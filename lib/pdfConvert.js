const { execFile } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const SOFFICE_BIN = process.env.SOFFICE_BIN || 'soffice';

/**
 * Converts a .docx file to .pdf in the same directory using LibreOffice headless.
 * Each call gets its own UserInstallation profile dir so concurrent conversions
 * don't collide on LibreOffice's single-instance lock.
 */
function convertDocxToPdf(docxPath, outDir) {
  return new Promise((resolve, reject) => {
    const profileDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'soffice-profile-')
    );

    const args = [
      `-env:UserInstallation=file://${profileDir}`,
      '--headless',
      '--norestore',
      '--convert-to',
      'pdf',
      '--outdir',
      outDir,
      docxPath,
    ];

    execFile(SOFFICE_BIN, args, { timeout: 60000 }, (err, stdout, stderr) => {
      fs.rm(profileDir, { recursive: true, force: true }, () => {});

      if (err) {
        reject(new Error(`LibreOffice conversion failed: ${err.message}\n${stderr}`));
        return;
      }

      const pdfPath = path.join(
        outDir,
        path.basename(docxPath, path.extname(docxPath)) + '.pdf'
      );

      if (!fs.existsSync(pdfPath)) {
        reject(new Error(`LibreOffice did not produce expected PDF: ${pdfPath}\n${stdout}\n${stderr}`));
        return;
      }

      resolve(pdfPath);
    });
  });
}

module.exports = { convertDocxToPdf };
