import geoip from 'geoip-lite';
import { saveLeadToDB, getAllLeadsFromDB } from '../services/lead.services.js';

/**
 * Track lead interaction when CTA is clicked
 */
const trackLead = async (req, res) => {
    try {
        const { ctaType, ctaUrl } = req.body;
        const ipAddress = req.clientIp || req.ip;

        // Validate input
        if (!ctaType) {
            return res.status(400).json({ error: 'CTA type is required' });
        }

        if (!ctaUrl) {
            return res.status(400).json({ error: 'CTA URL is required' });
        }

        // Get location data from IP
        const location = getLocationFromIP(ipAddress);

        // Prepare lead data
        const leadData = {
            ip: ipAddress,
            country: location.country,
            city: location.city || 'Unknown',
            region: location.region || 'Unknown',
            timestamp: new Date().toISOString(),
            ctaType: ctaType,
            ctaUrl: ctaUrl
        };

        // Save to MongoDB
        await saveLeadToDB(leadData);

        res.json({
            success: true,
            message: 'Lead tracked successfully'
        });

    } catch (error) {
        console.error('Error tracking lead:', error.message);
        res.status(500).json({ error: 'Failed to track lead' });
    }
};

/**
 * Get location data from IP address

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
        console.error('Error getting location from IP:', error.message);
        return {
            country: 'Unknown',
            region: 'Unknown',
            city: 'Unknown',
            timezone: 'Unknown'
        };
    }
};

/**
 * Export leads as CSV and send as download
 */
const handleCsvExport = async (req, res) => {
    try {
        // Get all leads from MongoDB
        const leads = await getAllLeadsFromDB();

        // Generate CSV content
        let csvContent = 'ip_address,country,city,region,timestamp,cta_type,cta_url\n';

        leads.forEach(lead => {
            // Escape any commas or quotes in the data
            const escapedFields = [
                lead.ip,
                lead.country,
                lead.city,
                lead.region,
                lead.timestamp,
                lead.ctaType,
                lead.ctaUrl
            ].map(field => {
                if (typeof field === 'string' && (field.includes(',') || field.includes('"'))) {
                    return `"${field.replace(/"/g, '""')}"`;
                }
                return field;
            });

            csvContent += escapedFields.join(',') + '\n';
        });

        // Set headers for file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="lead_data.csv"');

        // Send CSV content
        res.send(csvContent);

    } catch (error) {
        console.error('CSV export error:', error.message);
        res.status(500).json({ error: 'Failed to generate CSV' });
    }
};



/**
 * Get lead tracking health status
 */
const getLeadHealth = async (req, res) => {
    try {
        res.json({
            status: 'OK',
            message: 'Lead service is operational',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("Lead Health error:", error.message);
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