import geoip from 'geoip-lite';
import { logLeadData, getTxtFileStats, clearLeadDataFile } from '../utils/userslogger.util.js';
import logger from '../utils/logger.util.js';
import { convertTxtToCsv, getCsvFileStats } from '../utils/csv.util.js';


/**
 * Track lead interaction when CTA is clicked
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const trackLead = async (req, res) => {
    try {
        const { ctaType, ctaUrl } = req.body;
        const ipAddress = req.clientIp || req.ip;

        // Validate input
        if (!ctaType) {
            return res.status(400).json({ error: 'CTA type is required' });
        }

        // Get location data from IP
        const location = getLocationFromIP(ipAddress);

        // Prepare lead data
        const leadData = {
            ip: ipAddress,
            country: location.country,
            timestamp: new Date().toISOString(),
            ctaType: ctaType,
            ctaUrl: ctaUrl
        };

        // Log to file
        await logLeadData(leadData);

        res.json({
            success: true,
            message: 'Lead tracked successfully'
        });

    } catch (error) {
        logger.error(error.message, 'Error tracking lead:');
        res.status(500).json({ error: 'Failed to track lead' });
    }
};

/**
 * Get location data from IP address
 * @param {string} ipAddress - IP address to lookup
 * @returns {Object} Location data
 */
const getLocationFromIP = (ipAddress) => {
    try {
        // Look up location data from IP
        const geo = geoip.lookup(ipAddress);

        if (geo) {
            return {
                country: geo.country,
                region: geo.region,
                city: geo.city,
                timezone: geo.timezone
            };
        }

        return {
            country: 'Unknown',
            region: 'Unknown',
            city: 'Unknown',
            timezone: 'Unknown'
        };
    } catch (error) {
        logger.error(error.message, 'Error getting location from IP:');
        return {
            country: 'Unknown',
            region: 'Unknown',
            city: 'Unknown',
            timezone: 'Unknown'
        };
    }
};




const TEN_MINUTES = 10 * 60 * 1000;

const handleCsvExport = async (req, res) => {
    try {
        const [csvStats, txtStats] = await Promise.all([
            getCsvFileStats(),
            getTxtFileStats()
        ]);

        let regenerate = false;

        if (txtStats && csvStats) {
            // TXT is newer than CSV
            if (txtStats.mtime > csvStats.mtime) {
                const diff = Date.now() - txtStats.mtime.getTime();
                if (diff > TEN_MINUTES) {
                    regenerate = true;
                }
            }
        } else if (txtStats && !csvStats) {
            // No CSV file exists, but TXT does
            regenerate = true;
        }

        if (regenerate) {
            await convertTxtToCsv();
            await clearLeadDataFile();
        }

        // Return file link regardless
        res.json({
            message: 'CSV ready',
            url: '/download/lead_data.csv'
        });
    } catch (error) {
        logger.error(error, 'CSV export error:');
        res.status(500).json({ error: 'Failed to generate CSV' });
    }
};

const getLeadHealth = async (req, res) => {
    try {
        res.json({
            status: 'OK',
            message: 'Lead service is operational',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error(error, "Lead Health error")
        res.status(500).json({
            status: 'ERROR',
            message: 'Lead service health check failed',
            error: error.message
        });
    }
};

export {
    trackLead,
    handleCsvExport,
    getLeadHealth
};