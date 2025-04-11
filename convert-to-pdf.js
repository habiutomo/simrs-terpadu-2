import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file's directory with ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function convertHTMLToPDF(htmlFile, pdfFile) {
  // Check if the HTML file exists
  if (!fs.existsSync(htmlFile)) {
    console.error(`HTML file not found: ${htmlFile}`);
    return;
  }

  console.log(`Converting ${htmlFile} to PDF...`);
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Load the HTML file
    const htmlContent = fs.readFileSync(htmlFile, 'utf8');
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Set page dimensions to A4
    await page.pdf({
      path: pdfFile,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1cm',
        right: '1cm',
        bottom: '1cm',
        left: '1cm'
      }
    });

    console.log(`Successfully created PDF: ${pdfFile}`);
  } catch (error) {
    console.error('Error converting HTML to PDF:', error);
  } finally {
    await browser.close();
  }
}

async function main() {
  // Convert user guide
  await convertHTMLToPDF(
    path.join(__dirname, 'user-guide.html'),
    path.join(__dirname, 'SIMRS_User_Guide.pdf')
  );
  
  // Convert technical manual
  await convertHTMLToPDF(
    path.join(__dirname, 'technical-manual.html'),
    path.join(__dirname, 'SIMRS_Technical_Manual.pdf')
  );
  
  console.log('Conversion completed!');
}

main().catch(console.error);