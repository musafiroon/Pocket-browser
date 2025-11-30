import { Buffer } from 'buffer';

export const handler = async (event, context) => {
  // 1. CORS Configuration
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  const headers = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // 2. Parse the Incoming Request
  // event.path looks like: /.netlify/functions/tmdb/movie/550
  // We want to extract: /movie/550
  const pathPrefix = '/api/tmdb'; // Must match your netlify.toml redirect
  
  // Strip the function path or the redirect path to get the "real" TMDB path
  let tmdbPath = event.path.replace('/.netlify/functions/tmdb', '');
  tmdbPath = tmdbPath.replace(pathPrefix, '');

  // 3. Determine Upstream URL (API vs Image)
  let upstreamUrl;
  const isImage = tmdbPath.startsWith('/t/p/'); // TMDB images usually start with /t/p/w500/...

  if (isImage) {
    // Image Request: https://image.tmdb.org/t/p/w500/key.jpg
    upstreamUrl = `https://image.tmdb.org${tmdbPath}`;
  } else {
    // API Request: https://api.themoviedb.org/3/movie/550
    // Ensure we don't double slash if path is empty
    const cleanPath = tmdbPath.startsWith('/') ? tmdbPath : `/${tmdbPath}`;
    upstreamUrl = `https://api.themoviedb.org/3${cleanPath}`;
  }

  // 4. Construct Query Parameters (Securely add API Key)
  const queryParams = new URLSearchParams(event.queryStringParameters);
  
  // If using the older API Key query param method:
  if (!process.env.TMDB_API_READ_ACCESS_TOKEN && process.env.TMDB_API_KEY) {
    queryParams.append('api_key', process.env.TMDB_API_KEY);
  }

  const finalUrl = `${upstreamUrl}?${queryParams.toString()}`;

  // 5. Fetch from TMDB
  try {
    const requestHeaders = {
      'Accept': 'application/json, image/*',
    };

    // If using Bearer Token (Newer/Cleaner method)
    if (process.env.TMDB_API_READ_ACCESS_TOKEN) {
      requestHeaders['Authorization'] = `Bearer ${process.env.TMDB_API_READ_ACCESS_TOKEN}`;
    }

    const response = await fetch(finalUrl, { headers: requestHeaders });

    // 6. Handle Binary Data (Images) vs JSON
    if (isImage) {
      // Get the image buffer
      const buffer = await response.arrayBuffer();
      // Convert to Base64
      const base64 = Buffer.from(buffer).toString('base64');
      
      return {
        statusCode: response.status,
        headers: {
          ...headers,
          'Content-Type': response.headers.get('content-type') || 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000, immutable', // Cache images aggressively
        },
        body: base64,
        isBase64Encoded: true,
      };
    } 
    
    // 7. Handle standard JSON API responses
    const data = await response.json();

    return {
      statusCode: response.status,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        // Forward TMDB's cache control if present, or set a default
        'Cache-Control': response.headers.get('cache-control') || 'public, max-age=3600', 
      },
      body: JSON.stringify(data),
    };

  } catch (error) {
    console.error('TMDB Proxy Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch data from TMDB', details: error.message }),
    };
  }
};