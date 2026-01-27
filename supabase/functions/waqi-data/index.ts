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

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiToken = Deno.env.get('WAQI_API_TOKEN');
    if (!apiToken) {
      console.error('WAQI_API_TOKEN not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'WAQI API token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, lat, lng, bounds } = await req.json();

    if (action === 'getStationsInBounds' && bounds) {
      // Get stations within map bounds
      const { north, south, east, west } = bounds;
      const url = `https://api.waqi.info/v2/map/bounds?latlng=${south},${west},${north},${east}&token=${apiToken}`;
      
      console.log('Fetching stations in bounds:', url.replace(apiToken, 'HIDDEN'));
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status !== 'ok') {
        console.error('WAQI API error:', data);
        return new Response(
          JSON.stringify({ success: false, error: data.message || 'WAQI API error' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Transform data for our frontend
      const stations = data.data.map((station: WAQIStation) => ({
        uid: station.uid,
        aqi: parseInt(station.aqi) || 0,
        lat: station.lat,
        lng: station.lon,
        name: station.station?.name || 'Unknown Station',
        time: station.station?.time || new Date().toISOString(),
      }));

      console.log(`Found ${stations.length} stations`);
      
      return new Response(
        JSON.stringify({ success: true, data: stations }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'getStationDetails' && lat && lng) {
      // Get detailed data for a specific location
      const url = `https://api.waqi.info/feed/geo:${lat};${lng}/?token=${apiToken}`;
      
      console.log('Fetching station details');
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status !== 'ok') {
        console.error('WAQI API error:', data);
        return new Response(
          JSON.stringify({ success: false, error: data.message || 'WAQI API error' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

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
        JSON.stringify({ success: true, data: stationData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'searchCity') {
      const { city } = await req.json();
      const url = `https://api.waqi.info/feed/${encodeURIComponent(city)}/?token=${apiToken}`;
      
      console.log('Searching city:', city);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status !== 'ok') {
        return new Response(
          JSON.stringify({ success: false, error: data.message || 'City not found' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

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
