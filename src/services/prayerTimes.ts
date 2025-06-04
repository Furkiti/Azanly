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

// Ankara'nın varsayılan koordinatları
const DEFAULT_LOCATION = {
  latitude: 39.9334,
  longitude: 32.8597,
  city: 'Ankara',
  district: 'Çankaya'
};

async function getLocationInfo(latitude: number, longitude: number) {
  try {
    // Mountain View koordinatlarını kontrol et (Android Emülatör varsayılanı)
    const isMountainView = Math.abs(latitude - 37.4220) < 0.01 && 
                          Math.abs(longitude + 122.0841) < 0.01;

    if (isMountainView) {
      console.log('Emülatör varsayılan konumu tespit edildi, Ankara konumuna geçiliyor');
      return DEFAULT_LOCATION;
    }

    console.log('Calling Nominatim API with coordinates:', { latitude, longitude });
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

    console.log('Nominatim API raw response:', response.data);
    const address = response.data.address;
    
    // Türkiye'de olup olmadığını kontrol et
    const isInTurkey = address.country === 'Türkiye' || 
                      address.country === 'Turkey' || 
                      address.country_code === 'tr';

    if (!isInTurkey) {
      console.log('Konum Türkiye dışında, varsayılan konuma geçiliyor');
      return DEFAULT_LOCATION;
    }
    
    const locationInfo = {
      city: address.city || address.town || address.state || address.county || 'Ankara',
      district: address.suburb || address.neighbourhood || address.district || 'Merkez',
    };
    
    console.log('Parsed location info:', locationInfo);
    return locationInfo;
  } catch (error) {
    console.error('Error fetching location info:', error);
    if (axios.isAxiosError(error)) {
      console.error('Nominatim API error details:', {
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    // Hata durumunda varsayılan konumu kullan
    console.log('Konum bilgisi alınamadı, varsayılan konuma geçiliyor');
    return DEFAULT_LOCATION;
  }
}

export async function fetchPrayerTimes(
  latitude: number,
  longitude: number
): Promise<PrayerTimesResponse> {
  try {
    if (!latitude || !longitude) {
      console.log('Geçersiz koordinatlar, varsayılan konuma geçiliyor');
      latitude = DEFAULT_LOCATION.latitude;
      longitude = DEFAULT_LOCATION.longitude;
    }

    // Mountain View kontrolü
    const isMountainView = Math.abs(latitude - 37.4220) < 0.01 && 
                          Math.abs(longitude + 122.0841) < 0.01;
    
    if (isMountainView) {
      console.log('Emülatör varsayılan konumu tespit edildi, Ankara konumuna geçiliyor');
      latitude = DEFAULT_LOCATION.latitude;
      longitude = DEFAULT_LOCATION.longitude;
    }

    console.log('Starting prayer times fetch with coordinates:', { latitude, longitude });
    const locationInfo = await getLocationInfo(latitude, longitude);

    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    const params = {
      latitude: latitude.toFixed(6),
      longitude: longitude.toFixed(6),
      method: 13, // Turkey Presidency of Religious Affairs
      tune: '0,0,0,0,0,0,0,0,0',
      school: 1,
      midnightMode: 0,
      date: formattedDate,
      timezone: 'Europe/Istanbul',
      timezonestring: 'Europe/Istanbul',
    };

    console.log('Calling Aladhan API with params:', params);
    const response = await axios.get(ALADHAN_API_BASE_URL, {
      params,
      headers: {
        'User-Agent': 'Namazio Prayer Times App'
      }
    });

    console.log('Aladhan API raw response:', JSON.stringify(response.data, null, 2));

    if (!response.data.data?.timings) {
      console.error('Invalid API response structure:', response.data);
      throw new Error('Namaz vakitleri alınamadı: API yanıtı geçersiz');
    }

    const timings = response.data.data.timings;
    const prayerTimes = {
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

    console.log('Final prayer times data:', prayerTimes);
    return prayerTimes;
  } catch (error) {
    console.error('Error in fetchPrayerTimes:', error);
    if (axios.isAxiosError(error)) {
      console.error('API error details:', {
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    throw error;
  }
}
