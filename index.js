const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const Handlebars = require('handlebars');

// Read and parse the CSV file
const csvFilePath = path.join(__dirname, './files/example2.csv');
const csvData = fs.readFileSync(csvFilePath, 'utf8');

const parsedData = Papa.parse(csvData, {
    header: true,
    skipEmptyLines: true
}).data;

// Read and compile the HTML template
const templatePath = path.join(__dirname, 'template.html');
const templateHtml = fs.readFileSync(templatePath, 'utf8');
const template = Handlebars.compile(templateHtml);

// Folder where PDFs will be saved
const pdfFolderPath = path.join(__dirname, 'generated_pdfs');

// Create the folder if it doesn't exist
if (!fs.existsSync(pdfFolderPath)) {
    fs.mkdirSync(pdfFolderPath, { recursive: true });
}

// Function to create PDF
async function createPdf(html, filename) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    await page.pdf({ path: filename, format: 'A4' });
    await browser.close();
}

// Generate PDF for each employer
async function generatePdfs() {
    for (const [index, employer] of parsedData.entries()) {
        const html = template({ employers: [employer] });
        const filename = path.join(pdfFolderPath, `${index + 1}_${employer.Name}_Feedback.pdf`);
        await createPdf(html, filename);
    }
    console.log('PDFs generated successfully!');
}

generatePdfs();