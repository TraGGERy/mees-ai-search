import { NextRequest, NextResponse } from 'next/server';

type Region = 'europe' | 'north_america' | 'africa' | 'asia' | 'other';

interface GeolocationResponse {
  region: Region;
  pricingDetails: {
    currency: string;
    monthlyPrice: number;
    weeklyPrice: number;
    lifetimePrice: number;
    monthlyPriceId: string;
    weeklyPriceId: string;
    lifetimePriceId: string;
  };
}

// This function determines region based on country code
function getRegionFromCountryCode(countryCode: string): Region {
  console.log('Detecting region for country code:', countryCode);
  
  // For localhost or private IPs, default to Europe
  if (!countryCode || countryCode === 'XX' || countryCode === '127.0.0.1' || countryCode === 'localhost') {
    console.log('Using default region: europe');
    return 'europe';
  }
  
  // European countries
  const europeanCountries = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 
    'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 
    'SE', 'GB', 'UK', 'CH', 'NO', 'IS', 'LI'
  ];
  
  // North American countries
  const northAmericanCountries = ['US', 'CA', 'MX'];
  
  // African countries (sample, not exhaustive)
  const africanCountries = [
    'DZ', 'AO', 'BJ', 'BW', 'BF', 'BI', 'CM', 'CV', 'CF', 'TD', 'KM', 'CD', 'DJ', 
    'EG', 'GQ', 'ER', 'ET', 'GA', 'GM', 'GH', 'GN', 'GW', 'CI', 'KE', 'LS', 'LR', 
    'LY', 'MG', 'MW', 'ML', 'MR', 'MU', 'MA', 'MZ', 'NA', 'NE', 'NG', 'RW', 'ST', 
    'SN', 'SC', 'SL', 'SO', 'ZA', 'SS', 'SD', 'SZ', 'TZ', 'TG', 'TN', 'UG', 'ZM', 'ZW'
  ];
  
  // Asian countries (sample, not exhaustive)
  const asianCountries = [
    'AF', 'AM', 'AZ', 'BH', 'BD', 'BT', 'BN', 'KH', 'CN', 'CY', 'GE', 'HK', 'IN', 
    'ID', 'IR', 'IQ', 'IL', 'JP', 'JO', 'KZ', 'KW', 'KG', 'LA', 'LB', 'MO', 'MY', 
    'MV', 'MN', 'MM', 'NP', 'KP', 'OM', 'PK', 'PS', 'PH', 'QA', 'SA', 'SG', 'KR', 
    'LK', 'SY', 'TW', 'TJ', 'TH', 'TL', 'TR', 'TM', 'AE', 'UZ', 'VN', 'YE'
  ];
  
  if (europeanCountries.includes(countryCode)) {
    console.log('Detected region: europe');
    return 'europe';
  }
  if (northAmericanCountries.includes(countryCode)) {
    console.log('Detected region: north_america');
    return 'north_america';
  }
  if (africanCountries.includes(countryCode)) {
    console.log('Detected region: africa');
    return 'africa';
  }
  if (asianCountries.includes(countryCode)) {
    console.log('Detected region: asia');
    return 'asia';
  }
  
  console.log('Unknown country code, defaulting to europe');
  return 'europe'; // Default to Europe for unknown country codes
}

// Helper function for the Euro symbol
function getFormattedCurrency(currency: string | undefined, defaultValue: string): string {
  if (!currency) return defaultValue;
  
  // Replace HTML entities and encoded Euro symbols with the actual Euro symbol
  if (currency === '&euro;' || 
      currency === '\u0026euro;' || 
      currency === 'â¬' || 
      currency === '\u20AC' ||
      currency === 'EUR') {
    return '€';
  }
  
  return currency;
}

// Helper function to parse environment variables
function parseEnvVar(value: string | undefined, defaultValue: number | string): number | string {
  if (value === undefined) return defaultValue;
  
  // If the value is meant to be a number
  if (typeof defaultValue === 'number') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  
  return value;
}

// Get pricing details based on region using environment variables
function getPricingDetails(region: Region) {
  switch (region) {
    case 'europe':
      return {
        currency: '€',
        monthlyPrice: parseEnvVar(process.env.NEXT_PUBLIC_EUROPE_MONTHLY_PRICE, 12) as number,
        weeklyPrice: parseEnvVar(process.env.NEXT_PUBLIC_EUROPE_WEEKLY_PRICE, 2.99) as number,
        lifetimePrice: parseEnvVar(process.env.NEXT_PUBLIC_EUROPE_LIFETIME_PRICE, 49) as number,
        monthlyPriceId: process.env.NEXT_PUBLIC_EUROPE_MONTHLY_PRICE_ID || '',
        weeklyPriceId: process.env.NEXT_PUBLIC_EUROPE_WEEKLY_PRICE_ID || '',
        lifetimePriceId: process.env.NEXT_PUBLIC_EUROPE_LIFETIME_PRICE_ID || ''
      };
    case 'north_america':
      return {
        currency: getFormattedCurrency(
          process.env.NEXT_PUBLIC_NORTH_AMERICA_CURRENCY as string, 
          '$'
        ),
        monthlyPrice: parseEnvVar(process.env.NEXT_PUBLIC_NORTH_AMERICA_MONTHLY_PRICE, 12) as number,
        weeklyPrice: parseEnvVar(process.env.NEXT_PUBLIC_NORTH_AMERICA_WEEKLY_PRICE, 2.99) as number,
        lifetimePrice: parseEnvVar(process.env.NEXT_PUBLIC_NORTH_AMERICA_LIFETIME_PRICE, 49) as number,
        monthlyPriceId: process.env.NEXT_PUBLIC_NORTH_AMERICA_MONTHLY_PRICE_ID || '',
        weeklyPriceId: process.env.NEXT_PUBLIC_NORTH_AMERICA_WEEKLY_PRICE_ID || '',
        lifetimePriceId: process.env.NEXT_PUBLIC_NORTH_AMERICA_LIFETIME_PRICE_ID || ''
      };
    case 'africa':
      return {
        currency: getFormattedCurrency(
          process.env.NEXT_PUBLIC_AFRICA_CURRENCY as string, 
          '$'
        ),
        monthlyPrice: parseEnvVar(process.env.NEXT_PUBLIC_AFRICA_MONTHLY_PRICE, 7) as number,
        weeklyPrice: parseEnvVar(process.env.NEXT_PUBLIC_AFRICA_WEEKLY_PRICE, 1.99) as number,
        lifetimePrice: parseEnvVar(process.env.NEXT_PUBLIC_AFRICA_LIFETIME_PRICE, 29) as number,
        monthlyPriceId: process.env.NEXT_PUBLIC_AFRICA_MONTHLY_PRICE_ID || '',
        weeklyPriceId: process.env.NEXT_PUBLIC_AFRICA_WEEKLY_PRICE_ID || '',
        lifetimePriceId: process.env.NEXT_PUBLIC_AFRICA_LIFETIME_PRICE_ID || ''
      };
    case 'asia':
      return {
        currency: getFormattedCurrency(
          process.env.NEXT_PUBLIC_ASIA_CURRENCY as string, 
          '$'
        ),
        monthlyPrice: parseEnvVar(process.env.NEXT_PUBLIC_ASIA_MONTHLY_PRICE, 8) as number,
        weeklyPrice: parseEnvVar(process.env.NEXT_PUBLIC_ASIA_WEEKLY_PRICE, 2.49) as number,
        lifetimePrice: parseEnvVar(process.env.NEXT_PUBLIC_ASIA_LIFETIME_PRICE, 39) as number,
        monthlyPriceId: process.env.NEXT_PUBLIC_ASIA_MONTHLY_PRICE_ID || '',
        weeklyPriceId: process.env.NEXT_PUBLIC_ASIA_WEEKLY_PRICE_ID || '',
        lifetimePriceId: process.env.NEXT_PUBLIC_ASIA_LIFETIME_PRICE_ID || ''
      };
    default:
      return {
        currency: getFormattedCurrency(
          process.env.NEXT_PUBLIC_DEFAULT_CURRENCY as string, 
          '$'
        ),
        monthlyPrice: parseEnvVar(process.env.NEXT_PUBLIC_DEFAULT_MONTHLY_PRICE, 10) as number,
        weeklyPrice: parseEnvVar(process.env.NEXT_PUBLIC_DEFAULT_WEEKLY_PRICE, 2.99) as number,
        lifetimePrice: parseEnvVar(process.env.NEXT_PUBLIC_DEFAULT_LIFETIME_PRICE, 45) as number,
        monthlyPriceId: process.env.NEXT_PUBLIC_DEFAULT_MONTHLY_PRICE_ID || '',
        weeklyPriceId: process.env.NEXT_PUBLIC_DEFAULT_WEEKLY_PRICE_ID || '',
        lifetimePriceId: process.env.NEXT_PUBLIC_DEFAULT_LIFETIME_PRICE_ID || ''
      };
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get IP from X-Forwarded-For header or fallback to requesting IP
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1';
    
    // Basic error handling for multiple IPs in header
    const clientIp = ip.split(',')[0].trim();
    
    console.log('Detected IP:', clientIp);
    
    // API to get geolocation data (limited to country info for privacy)
    const response = await fetch(`https://ipapi.co/${clientIp}/json/`);
    let geoData;
    
    if (response.ok) {
      geoData = await response.json();
      console.log('Geolocation data:', JSON.stringify(geoData));
    } else {
      // Default to EU if geolocation fails
      console.log('Geolocation API failed, defaulting to DE');
      geoData = { country_code: 'DE' };
    }
    
    const region = getRegionFromCountryCode(geoData.country_code);
    console.log('Detected region:', region);
    
    const pricingDetails = getPricingDetails(region);
    console.log('Pricing details:', JSON.stringify(pricingDetails));
    
    const result: GeolocationResponse = {
      region,
      pricingDetails
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Geolocation error:', error);
    
    // Default response on error
    const defaultResult: GeolocationResponse = {
      region: 'other',
      pricingDetails: {
        currency: getFormattedCurrency(
          process.env.NEXT_PUBLIC_DEFAULT_CURRENCY as string, 
          '$'
        ),
        monthlyPrice: parseEnvVar(process.env.NEXT_PUBLIC_DEFAULT_MONTHLY_PRICE, 10) as number,
        weeklyPrice: parseEnvVar(process.env.NEXT_PUBLIC_DEFAULT_WEEKLY_PRICE, 2.99) as number,
        lifetimePrice: parseEnvVar(process.env.NEXT_PUBLIC_DEFAULT_LIFETIME_PRICE, 45) as number,
        monthlyPriceId: process.env.NEXT_PUBLIC_DEFAULT_MONTHLY_PRICE_ID || '',
        weeklyPriceId: process.env.NEXT_PUBLIC_DEFAULT_WEEKLY_PRICE_ID || '',
        lifetimePriceId: process.env.NEXT_PUBLIC_DEFAULT_LIFETIME_PRICE_ID || ''
      }
    };
    
    return NextResponse.json(defaultResult);
  }
} 