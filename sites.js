// Maps hostnames to display names for the multi-site checkout backend.
const SITES = {
  'speedybanner.com':         'SpeedyBanner.com',
  'www.speedybanner.com':     'SpeedyBanner.com',
  'onehourbanner.com':        'OneHourBanner.com',
  'www.onehourbanner.com':    'OneHourBanner.com',
  '1hourbanner.com':          '1HourBanner.com',
  'www.1hourbanner.com':      '1HourBanner.com',
  'lexingtonsign.com':        'LexingtonSign.com',
  'www.lexingtonsign.com':    'LexingtonSign.com',
  'twohourbanner.com':        'TwoHourBanner.com',
  'www.twohourbanner.com':    'TwoHourBanner.com',
  'anysizebanner.com':        'AnySizeBanner.com',
  'www.anysizebanner.com':    'AnySizeBanner.com',
  'holyprinter.com':          'HolyPrinter.com',
  'www.holyprinter.com':      'HolyPrinter.com',
    'varsitybanner.com': 'VarsityBanner.com',
    'www.varsitybanner.com': 'VarsityBanner.com',
};

const DEFAULT_SITE = 'SpeedyBanner.com';

function siteNameFromOrigin(origin) {
  if (!origin) return DEFAULT_SITE;
  try {
    const hostname = new URL(origin).hostname;
    return SITES[hostname] || DEFAULT_SITE;
  } catch {
    return DEFAULT_SITE;
  }
}

const allowedOrigins = Object.keys(SITES).map(h => `https://${h}`);

// Where customer replies to order confirmation emails should land, per site.
// Sites not listed here fall back to info@speedybanner.com.
const REPLY_TO_EMAIL = {
  'OneHourBanner.com': 'info@onehourbanner.com',
};

function replyToForSite(siteName) {
  return REPLY_TO_EMAIL[siteName] || 'info@speedybanner.com';
}

module.exports = { SITES, DEFAULT_SITE, siteNameFromOrigin, allowedOrigins, replyToForSite };
