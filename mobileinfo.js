// Vercel Serverless Function का मुख्य handler
export default async function handler(request, response) {
  // 1. Mobile number को URL query parameter से निकालना
  const { mobile } = request.query;

  // 2. CORS headers सेट करना
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS request को संभालना
  if (request.method === 'OPTIONS') {
    return response.status(204).end();
  }

  // 3. Input validation
  if (!mobile) {
    return response.status(400).json({
      status: 'error',
      message: 'Mobile number query parameter is required. Use: ?mobile=XXXXXXXXXX'
    });
  }
  
  let database = [];
  try {
    // 4. Vercel पर डिप्लॉय की गई db.json फाइल को Fetch करना
    // Vercel में, URL हमेशा '/' से शुरू होता है
    const dbUrl = 'https://' + request.headers.host + '/db.json';
    const dbResponse = await fetch(dbUrl);

    if (!dbResponse.ok) {
        throw new Error(`Failed to fetch db.json: ${dbResponse.statusText}`);
    }

    database = await dbResponse.json();

  } catch (error) {
    // Error agar db.json fetch ya parse nahi ho paya
    console.error("DB Fetch Error:", error);
    return response.status(500).json({
        status: 'error',
        message: 'Could not load data for search: ' + error.message
    });
  }

  // 5. डेटाबेस में मोबाइल नंबर सर्च करना
  const foundUser = database.find(user => user.mobile === mobile);

  // 6. Response भेजना
  if (foundUser) {
    // Success: 200 OK
    return response.status(200).json({
      status: 'success',
      query: mobile,
      data: foundUser
    });
  } else {
    // Not Found: 404
    return response.status(404).json({
      status: 'error',
      query: mobile,
      message: `Mobile number ${mobile} database में नहीं मिला।`
    });
  }
}
