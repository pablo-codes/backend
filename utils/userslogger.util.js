import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../data');
await fs.mkdir(dataDir, { recursive: true });

const leadDataFile = process.env.LEAD_DATA_FILE || path.join(dataDir, 'lead_data.txt');

export const logLeadData = async ({ ip, country, timestamp, ctaType, ctaUrl }) => {
    if (!ip || !country || !timestamp || !ctaType || !ctaUrl) {
        throw new Error('Invalid lead data');
    }
    const entry = `${ip} | ${country} | ${timestamp} | ${ctaType} | ${ctaUrl}\n`;
    await fs.appendFile(leadDataFile, entry);
};

export const readLeadData = async () => {
    try {
        return await fs.readFile(leadDataFile, 'utf8');
    } catch {
        return '';
    }
};

export const clearLeadDataFile = async () => {
    await fs.writeFile(leadDataFile, '');
};
export const getLeadDataFilePath = () => {
    return leadDataFile;
};

export const getTxtFileStats = async () => {
    try {
        return await fs.stat(getLeadDataFilePath());
    } catch {
        return null;
    }
};
