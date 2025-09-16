import { getDistance } from "geolib";

/**
 * تحسب المسافة بين الفني والطلب بوحدة متر أو كيلومتر مع الترجمة
 * @param {Object} providerLocation - { latitude, longitude }
 * @param {Object} orderLocation - { latitude, longitude }
 * @param {Function} t - دالة الترجمة من useTranslation
 * @returns {string|null} distance (مثال: "500 متر" أو "2.34 كم")
 */
export const getDistanceKm = (providerLocation, orderLocation, t) => {
    if (
        !providerLocation?.latitude ||
        !providerLocation?.longitude ||
        !orderLocation?.latitude ||
        !orderLocation?.longitude
    ) {
        return null;
    }

    const distanceInMeters = getDistance(
        { latitude: providerLocation.latitude, longitude: providerLocation.longitude },
        { latitude: orderLocation.latitude, longitude: orderLocation.longitude }
    );

    if (distanceInMeters < 1000) {
        return `${distanceInMeters} ${t("m")}`; // أقل من 1 كم → متر
    }

    return `${(Math.round((distanceInMeters / 1000) * 10) / 10)} ${t("km")}`; // 1 كم أو أكثر → كيلومتر
};
