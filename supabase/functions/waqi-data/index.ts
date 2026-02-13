const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WAQIStation {
  uid: number;
  aqi: string;
  lat: number;
  lon: number;
  station: {
    name: string;
    time: string;
  };
}

// Demo data for Almaty when API key is invalid
const getDemoStations = () => {
  const now = new Date().toISOString();
  return [
    { uid: 1, aqi: 75, lat: 43.238949, lng: 76.945465, name: 'Алматы - Центр', time: now },
    { uid: 2, aqi: 128, lat: 43.255, lng: 76.92, name: 'ТЭЦ-2 (Промзона)', time: now },
    { uid: 3, aqi: 65, lat: 43.22, lng: 76.96, name: 'Бостандыкский район', time: now },
    { uid: 4, aqi: 89, lat: 43.27, lng: 76.88, name: 'Алмалинский район', time: now },
    { uid: 5, aqi: 145, lat: 43.21, lng: 76.85, name: 'Ауэзовский район', time: now },
    { uid: 6, aqi: 52, lat: 43.25, lng: 77.02, name: 'Медеуский район', time: now },
    { uid: 7, aqi: 98, lat: 43.28, lng: 76.95, name: 'Турксибский район', time: now },
    { uid: 8, aqi: 42, lat: 43.18, lng: 76.98, name: 'Горный район (Каменка)', time: now },
    { uid: 9, aqi: 110, lat: 43.30, lng: 76.90, name: 'Жетысуский район', time: now },
    { uid: 10, aqi: 78, lat: 43.23, lng: 76.87, name: 'Наурызбайский район', time: now },
    { uid: 11, aqi: 168, lat: 43.32, lng: 76.85, name: 'Промзона Север', time: now },
    { uid: 12, aqi: 55, lat: 43.16, lng: 77.05, name: 'Предгорье Алатау', time: now },
  ];
};

const getDemoStationDetails = (lat: number, lng: number) => {
  // Find closest demo station
  const stations = getDemoStations();
  let closest = stations[0];
  let minDist = Infinity;
  
  for (const s of stations) {
    const dist = Math.sqrt((s.lat - lat) ** 2 + (s.lng - lng) ** 2);
    if (dist < minDist) {
      minDist = dist;
      closest = s;
    }
  }
  
  // Generate realistic pollutant data based on AQI
  const aqi = closest.aqi;
  const pm25 = Math.round(aqi * 0.8 + Math.random() * 20);
  const pm10 = Math.round(aqi * 1.2 + Math.random() * 30);
  
  return {
    aqi: closest.aqi,
    city: closest.name,
    time: new Date().toLocaleString('ru-RU'),
    pollutants: {
      pm25,
      pm10,
      o3: Math.round(20 + Math.random() * 40),
      no2: Math.round(15 + Math.random() * 50),
      so2: Math.round(5 + Math.random() * 20),
      co: Math.round(2 + Math.random() * 8) / 10,
    },
    weather: {
      temperature: Math.round(-5 + Math.random() * 10),
      humidity: Math.round(40 + Math.random() * 30),
      pressure: Math.round(1010 + Math.random() * 20),
      wind: Math.round(1 + Math.random() * 8),
    },
    forecast: null,
  };
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiToken = Deno.env.get('WAQI_API_TOKEN');
    const { action, lat, lng, bounds, city } = await req.json();

    // Try real API first, fallback to demo
    if (action === 'getStationsInBounds' && bounds) {
      const { north, south, east, west } = bounds;
      
      if (apiToken) {
        const url = `https://api.waqi.info/v2/map/bounds?latlng=${south},${west},${north},${east}&token=${apiToken}`;
        console.log('Fetching stations in bounds:', url.replace(apiToken, 'HIDDEN'));
        
        try {
          const response = await fetch(url);
          const data = await response.json();
          
          if (data.status === 'ok') {
            const stations = data.data.map((station: WAQIStation) => ({
              uid: station.uid,
              aqi: parseInt(station.aqi) || 0,
              lat: station.lat,
              lng: station.lon,
              name: station.station?.name || 'Unknown Station',
              time: station.station?.time || new Date().toISOString(),
            }));

            console.log(`Found ${stations.length} stations from WAQI API`);
            
            return new Response(
              JSON.stringify({ success: true, data: stations, source: 'waqi' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          } else {
            console.warn('WAQI API error, using demo data:', data);
          }
        } catch (fetchError) {
          console.error('Failed to fetch from WAQI:', fetchError);
        }
      }
      
      // Fallback to demo data
      console.log('Using demo data for Almaty');
      const demoStations = getDemoStations().filter(s => 
        s.lat >= south && s.lat <= north && s.lng >= west && s.lng <= east
      );
      
      return new Response(
        JSON.stringify({ success: true, data: demoStations, source: 'demo' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'getStationDetails' && lat && lng) {
      if (apiToken) {
        const url = `https://api.waqi.info/feed/geo:${lat};${lng}/?token=${apiToken}`;
        console.log('Fetching station details');
        
        try {
          const response = await fetch(url);
          const data = await response.json();
          
          if (data.status === 'ok') {
            const stationData = {
              aqi: data.data.aqi,
              city: data.data.city?.name || 'Unknown',
              time: data.data.time?.s || new Date().toISOString(),
              pollutants: {
                pm25: data.data.iaqi?.pm25?.v,
                pm10: data.data.iaqi?.pm10?.v,
                o3: data.data.iaqi?.o3?.v,
                no2: data.data.iaqi?.no2?.v,
                so2: data.data.iaqi?.so2?.v,
                co: data.data.iaqi?.co?.v,
              },
              weather: {
                temperature: data.data.iaqi?.t?.v,
                humidity: data.data.iaqi?.h?.v,
                pressure: data.data.iaqi?.p?.v,
                wind: data.data.iaqi?.w?.v,
              },
              forecast: data.data.forecast?.daily || null,
            };

            return new Response(
              JSON.stringify({ success: true, data: stationData, source: 'waqi' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } catch (fetchError) {
          console.error('Failed to fetch details from WAQI:', fetchError);
        }
      }
      
      // Fallback to demo
      const demoDetails = getDemoStationDetails(lat, lng);
      return new Response(
        JSON.stringify({ success: true, data: demoDetails, source: 'demo' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'searchCity' && city) {
      if (apiToken) {
        const url = `https://api.waqi.info/feed/${encodeURIComponent(city)}/?token=${apiToken}`;
        console.log('Searching city:', city);
        
        try {
          const response = await fetch(url);
          const data = await response.json();
          
          if (data.status === 'ok') {
            return new Response(
              JSON.stringify({ 
                success: true, 
                data: {
                  aqi: data.data.aqi,
                  city: data.data.city?.name,
                  lat: data.data.city?.geo?.[0],
                  lng: data.data.city?.geo?.[1],
                }
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } catch (fetchError) {
          console.error('Failed to search city:', fetchError);
        }
      }
      
      // Fallback for Almaty
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: {
            aqi: 78,
            city: 'Almaty, Kazakhstan',
            lat: 43.238949,
            lng: 76.945465,
          },
          source: 'demo'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in waqi-data function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
