import axios from 'axios';

interface PrayerTimesResponse {
  times: {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
  };
  location: {
    city: string;
    district?: string;
  };
}

const ALADHAN_API_BASE_URL = 'https://api.aladhan.com/v1/timings';
const NOMINATIM_API_BASE_URL = 'https://nominatim.openstreetmap.org/reverse';

async function getLocationInfo(latitude: number, longitude: number) {
  try {
    const response = await axios.get(NOMINATIM_API_BASE_URL, {
      params: {
        format: 'json',
        lat: latitude,
        lon: longitude,
        'accept-language': 'tr',
      },
      headers: {
        'User-Agent': 'Namazio Prayer Times App'
      }
    });

    const address = response.data.address;
    return {
      city: address.city || address.town || address.state || address.county,
      district: address.suburb || address.neighbourhood || address.district,
    };
  } catch (error) {
    console.error('Error fetching location info:', error);
    throw new Error('Konum bilgisi alınamadı');
  }
}

export async function fetchPrayerTimes(
  latitude: number,
  longitude: number
): Promise<PrayerTimesResponse> {
  try {
    console.log('Fetching location info for:', { latitude, longitude });
    const locationInfo = await getLocationInfo(latitude, longitude);
    console.log('Location info received:', locationInfo);

    console.log('Fetching prayer times from Aladhan API...');
    const response = await axios.get(ALADHAN_API_BASE_URL, {
      params: {
        latitude,
        longitude,
        method: 13, // Turkey Presidency of Religious Affairs
        tune: '0,0,0,0,0,0,0,0,0',
        school: 1,
        midnightMode: 0,
        timezonestring: 'Europe/Istanbul',
      },
    });

    console.log('Aladhan API response:', response.data);

    if (!response.data.data?.timings) {
      console.error('No timings in response:', response.data);
      throw new Error('Namaz vakitleri alınamadı');
    }

    const timings = response.data.data.timings;
    console.log('Parsed timings:', timings);

    return {
      times: {
        Fajr: timings.Fajr,
        Sunrise: timings.Sunrise,
        Dhuhr: timings.Dhuhr,
        Asr: timings.Asr,
        Maghrib: timings.Maghrib,
        Isha: timings.Isha,
      },
      location: locationInfo,
    };
  } catch (error: any) {
    console.error('Error fetching prayer times:', {
      error,
      message: error.message,
      response: error.response?.data,
    });
    if (axios.isAxiosError(error)) {
      throw new Error(`Namaz vakitleri alınamadı: ${error.response?.data?.message || error.message}`);
    }
    throw new Error('Namaz vakitleri alınamadı');
  }
}
