// api/start_car.js
const bluelinky = require('bluelinky');
const login = bluelinky.default || bluelinky;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${process.env.SECRET_KEY}`) {
    console.log('Authorization failed!'); // Added log
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    // ---- Start Added Logs ----
    console.log('Authorization successful. Preparing Bluelinky login...');
    console.log('KIA_USERNAME:', process.env.KIA_USERNAME ? 'Exists' : 'MISSING/UNDEFINED');
    // IMPORTANT: Do NOT log the actual password!
    console.log('KIA_PASSWORD:', process.env.KIA_PASSWORD ? 'Exists' : 'MISSING/UNDEFINED');
    console.log('KIA_PIN:', process.env.KIA_PIN ? 'Exists' : 'MISSING/UNDEFINED');
    console.log('KIA_REGION:', process.env.KIA_REGION || 'CA (defaulted)');
    console.log('Attempting Bluelinky login call...');
    // ---- End Added Logs ----

    const client = await login({ // This is likely around line 15 relative to the start of the module.exports function
      username: process.env.KIA_USERNAME,
      password: process.env.KIA_PASSWORD,
      pin: process.env.KIA_PIN,
      region: process.env.KIA_REGION || 'CA', // Keep default just in case
      brand: 'kia',
    });

    // If login succeeds, this will run
    console.log('Bluelinky login successful, fetching vehicles...');
    const vehicles = await client.getVehicles();
    const vehicle = vehicles[0];

    console.log('Starting climate control...'); // Added log
    const result = await vehicle.startClimate({
      airCtrl: true,
      heating: true,
      defrost: true,
      temp: 22,
      duration: 10
    });

    console.log('Climate control command sent.'); // Added log
    res.status(200).json({ status: 'Vehicle climate started', result });

  } catch (err) {
    // ---- Improved Error Logging ----
    console.error('ERROR during Bluelinky operation:', err); // Log the full error object
    // Send more detailed error info back in the response for debugging
    res.status(500).json({
        error: 'Internal Server Error during Bluelinky operation.',
        details: err.message,
        stack: err.stack // Include stack trace in response (useful for debugging)
    });
    // ---- End Improved Error Logging ----
  }
};
