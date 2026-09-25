/**
 * FreshFind - Core Engine
 * Provides centralized business logic for:
 * - isMarketOpen(market, [date])
 * - getNextOpenTime(market, [date])
 * - calculateDistance(lat1, lon1, lat2, lon2)
 * - getCurrentSeason([date])
 */

(function (window) {
  "use strict";

  const FreshFind = window.FreshFind || (window.FreshFind = {});

  const DAYS_ORDER = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  /**
   * Helper to parse time string like "08:00 AM", "2:30 PM", "9:00 AM" into minutes from midnight
   */
  function parseTimeToMinutes(timeStr) {
    if (!timeStr || typeof timeStr !== "string") return null;
    const cleaned = timeStr.trim().toUpperCase();
    const match = cleaned.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/);
    if (!match) return null;

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const meridiem = match[3];

    if (meridiem === "PM" && hours < 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }

  /**
   * Parses time range string like "08:00 AM – 03:00 PM" or "8:00 AM - 2:00 PM"
   */
  function parseTimeRange(rangeStr) {
    if (!rangeStr) return null;
    const parts = rangeStr.split(/[-–—]/);
    if (parts.length < 2) return null;
    const openMin = parseTimeToMinutes(parts[0]);
    const closeMin = parseTimeToMinutes(parts[1]);
    if (openMin === null || closeMin === null) return null;
    return { openMin, closeMin, openStr: parts[0].trim(), closeStr: parts[1].trim() };
  }

  /**
   * Determines open/closed status for a given market at a specific date/time.
   * Return:
   * {
   *   status: "OPEN NOW" | "OPENS SOON" | "CLOSED" | "CLOSED TODAY",
   *   code: "open" | "soon" | "closed" | "closed_today",
   *   icon: "🟢" | "🟡" | "🔴" | "⚪",
   *   badgeText: string,
   *   todaySchedule: object | null
   * }
   */
  function isMarketOpen(market, testDate) {
    const now = testDate ? new Date(testDate) : new Date();
    const currentDayName = DAYS_ORDER[now.getDay()];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let todayEntry = null;

    // Check detailed schedule first
    if (Array.isArray(market.schedule)) {
      todayEntry = market.schedule.find(
        (s) => s.day && s.day.toLowerCase() === currentDayName.toLowerCase()
      );
    }

    // Check operatingDays array fallback
    const operatesToday =
      (todayEntry && todayEntry.isOpen) ||
      (Array.isArray(market.operatingDays) &&
        market.operatingDays.some(
          (d) => d.toLowerCase() === currentDayName.toLowerCase()
        ));

    if (!operatesToday) {
      return {
        status: "CLOSED TODAY",
        code: "closed_today",
        icon: "⚪",
        badgeText: "Closed Today",
        todaySchedule: null
      };
    }

    // Determine hours today
    let openMin = null;
    let closeMin = null;

    if (todayEntry && todayEntry.open && todayEntry.open !== "—" && todayEntry.close && todayEntry.close !== "—") {
      openMin = parseTimeToMinutes(todayEntry.open);
      closeMin = parseTimeToMinutes(todayEntry.close);
    } else if (market.operatingHours || market.time) {
      const parsed = parseTimeRange(market.operatingHours || market.time);
      if (parsed) {
        openMin = parsed.openMin;
        closeMin = parsed.closeMin;
      }
    }

    // If hours cannot be parsed, return OPEN based on day
    if (openMin === null || closeMin === null) {
      return {
        status: "OPEN TODAY",
        code: "open",
        icon: "🟢",
        badgeText: "Open Today",
        todaySchedule: todayEntry
      };
    }

    // Check if Opens Soon (within 60 minutes before opening)
    if (currentMinutes < openMin) {
      const diff = openMin - currentMinutes;
      if (diff <= 60) {
        return {
          status: "OPENS SOON",
          code: "soon",
          icon: "🟡",
          badgeText: `Opens in ${diff} min`,
          todaySchedule: todayEntry
        };
      } else {
        return {
          status: "CLOSED",
          code: "closed",
          icon: "🔴",
          badgeText: `Opens at ${todayEntry ? todayEntry.open : "scheduled time"}`,
          todaySchedule: todayEntry
        };
      }
    }

    // Currently in operating hours
    if (currentMinutes >= openMin && currentMinutes <= closeMin) {
      return {
        status: "OPEN NOW",
        code: "open",
        icon: "🟢",
        badgeText: "Open Now",
        todaySchedule: todayEntry
      };
    }

    // Past closing time
    return {
      status: "CLOSED",
      code: "closed",
      icon: "🔴",
      badgeText: "Closed for Today",
      todaySchedule: todayEntry
    };
  }

  /**
   * Calculates next opening day and time for a market.
   * E.g. "Saturday 08:00 AM", "Tomorrow at 09:00 AM", or "Today at 08:00 AM"
   */
  function getNextOpenTime(market, testDate) {
    const now = testDate ? new Date(testDate) : new Date();
    const currentDayIdx = now.getDay();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Look through next 7 days
    for (let offset = 0; offset < 7; offset++) {
      const checkDayIdx = (currentDayIdx + offset) % 7;
      const checkDayName = DAYS_ORDER[checkDayIdx];

      let entry = null;
      if (Array.isArray(market.schedule)) {
        entry = market.schedule.find(
          (s) => s.day && s.day.toLowerCase() === checkDayName.toLowerCase()
        );
      }

      const isOpenDay =
        (entry && entry.isOpen && entry.open && entry.open !== "—") ||
        (Array.isArray(market.operatingDays) &&
          market.operatingDays.some(
            (d) => d.toLowerCase() === checkDayName.toLowerCase()
          ));

      if (isOpenDay) {
        let openTimeStr = entry && entry.open && entry.open !== "—" ? entry.open : null;
        if (!openTimeStr && (market.operatingHours || market.time)) {
          const parsed = parseTimeRange(market.operatingHours || market.time);
          if (parsed) openTimeStr = parsed.openStr;
        }
        if (!openTimeStr) openTimeStr = "08:00 AM";

        const openMin = parseTimeToMinutes(openTimeStr) || 8 * 60;

        if (offset === 0) {
          // Today: only valid if not yet closed
          if (currentMinutes < openMin) {
            return `Today at ${openTimeStr}`;
          }
        } else if (offset === 1) {
          return `Tomorrow at ${openTimeStr}`;
        } else {
          return `${checkDayName} at ${openTimeStr}`;
        }
      }
    }

    return "Next schedule pending";
  }

  /**
   * Calculates distance in kilometers between two geo-coordinates using Haversine formula
   */
  function calculateDistance(lat1, lon1, lat2, lon2) {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
      return null;
    }
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return parseFloat(d.toFixed(1));
  }

  /**
   * Returns current season based on standard meteorological calendar:
   * Spring: March - May (Months 2, 3, 4)
   * Summer: June - August (Months 5, 6, 7)
   * Autumn: September - November (Months 8, 9, 10)
   * Winter: December - February (Months 11, 0, 1)
   */
  function getCurrentSeason(testDate) {
    const now = testDate ? new Date(testDate) : new Date();
    const month = now.getMonth(); // 0-indexed

    if (month >= 2 && month <= 4) {
      return { name: "Spring", icon: "🌸", color: "#5e8c62", description: "Fresh greens, tender herbs & sweet spring berries" };
    } else if (month >= 5 && month <= 7) {
      return { name: "Summer", icon: "☀️", color: "#d77a3e", description: "Ripe vine tomatoes, juicy mangoes & crisp cucumbers" };
    } else if (month >= 8 && month <= 10) {
      return { name: "Autumn", icon: "🍂", color: "#c6702e", description: "Crisp orchard apples, sweet root carrots & farm potatoes" };
    } else {
      return { name: "Winter", icon: "❄️", color: "#486b7a", description: "Dark hearty spinach, sweet citrus & winter warming greens" };
    }
  }

  // Export to namespace
  FreshFind.isMarketOpen = isMarketOpen;
  FreshFind.getNextOpenTime = getNextOpenTime;
  FreshFind.calculateDistance = calculateDistance;
  FreshFind.getCurrentSeason = getCurrentSeason;

})(window);
