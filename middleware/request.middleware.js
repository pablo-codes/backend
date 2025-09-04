import logger from "../utils/logger.util.js";
import requestIp from "request-ip";
import geoip from "geoip-lite";

export const requestLogger = (req, res, next) => {

    try {
        const clientIp = requestIp.getClientIp(req);

        console.log(clientIp)
        // Lookup geo info

        const geo = geoip.lookup(clientIp);

        console.log(geo)
        logger.debug(
            {
                method: req.method,
                url: req.url,
                ip: clientIp,
                userAgent: req.get("User-Agent"),
                location: geo
                    ? {
                        country: geo.country,
                        region: geo.region,
                        city: geo.city,
                        ll: geo.ll, // [latitude, longitude]
                    }
                    :
                    {
                        country: "Unknown",
                        region: "Unknown",
                        city: "Unknown",
                        ll: "Unknown",
                    }
            },
            "Incoming request"
        );

    } catch (error) {
        logger.error(error, "Request Logger error")
    }

    next();
};
