import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { readLeadData } from './userslogger.util.js';

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure download directory exists
const dataDir = path.join(__dirname, '../download');
await fs.mkdir(dataDir, { recursive: true });

/**
 * Convert text log file to CSV format
 * @returns {Promise<string>} Path to the generated CSV file
 */
const convertTxtToCsv = async () => {
    try {
        // Read the text file
        const txtData = await readLeadData();

        if (!txtData.trim()) {
            throw new Error('No lead data found in text file');
        }

        // Split into lines
        const lines = txtData.trim().split('\n');

        // Create CSV header (now includes cta_url)
        let csvContent = 'ip_address,country,timestamp,cta_type,cta_url\n';

        // Convert each line to CSV format
        lines.forEach(line => {
            const parts = line.split(' | ');
            if (parts.length === 5) {
                // Escape any commas or quotes in the data
                const escapedParts = parts.map(part => {
                    if (part.includes(',') || part.includes('"')) {
                        return `"${part.replace(/"/g, '""')}"`;
                    }
                    return part;
                });
                csvContent += escapedParts.join(',') + '\n';
            }
        });

        // Write CSV file (overwrites existing file)
        const csvFilePath = path.join(dataDir, 'lead_data.csv');
        await fs.writeFile(csvFilePath, csvContent, 'utf8');

        console.log(`CSV file generated successfully at: ${csvFilePath}`);
        return csvFilePath;
    } catch (error) {
        console.error('Error converting TXT to CSV:', error.message);
        throw error;
    }
};

/**
 * Get CSV file path
 * @returns {string} Path to CSV file
 */
const getCsvFilePath = () => {
    return path.join(dataDir, 'lead_data.csv');
};

/**
 * Check if CSV file exists
 * @returns {Promise<boolean>} Whether CSV file exists
 */
const csvFileExists = async () => {
    try {
        await fs.access(getCsvFilePath());
        return true;
    } catch {
        return false;
    }
};

/**
 * Get stats for the CSV file
 */
const getCsvFileStats = async () => {
    try {
        return await fs.stat(getCsvFilePath());
    } catch {
        return null;
    }
};


export {
    convertTxtToCsv,
    getCsvFilePath,
    csvFileExists,
    getCsvFileStats
};
