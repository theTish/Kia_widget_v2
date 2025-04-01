// api/start_car.js - Use this with bluelinky version "5.0.0"

// Try the documented class-based import again with v5.0.0
const { Bluelinky } = require('bluelinky');

module.exports = async (req, res) => {
  // ... (Keep Auth checks) ...
  if (req.method !== 'POST') { return res.status(405).json({ error: 'Method Not Allowed' }); }
  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${process.env.SECRET_KEY}`) { return res.status(403).json({ error: 'Unauthorized' }); }

  try {
    console.log('Authorization successful. Preparing Bluelinky login (v5.0.0)...');
    // ... (Keep Env Var logs if desired) ...

    // --- Check if Bluelinky is a constructor with v5.0.0 ---
    if (typeof Bluelinky !== 'function') {
        console.error('CRITICAL ERROR: Bluelinky (from require) is still not a function/constructor even with version 5.0.0. Value:', Bluelinky);
        // If this happens, we are truly stuck on how v5 exports for CJS
        return res.status(500).json({ error: 'Failed to load Bluelinky library correctly (v5.0.0). Named export is not a constructor.' });
    }
    console.log('Attempting Bluelinky class instantiation using named export (v5.0.0)...');
    // --- End Check ---

    // *** Instantiate using the named export (as per docs) ***
    const client = new Bluelinky({
        username: process.env.KIA_USERNAME,
        password: process.env.KIA_PASSWORD,
        pin: process.env.KIA_PIN,
        region: process.env.KIA_REGION || 'CA',
        brand: 'kia',
    });

    // Assuming no separate .login() needed for v5.0.0 either

    console.log('Bluelinky client created (v5.0.0), fetching vehicles...');
    const vehicles = await client.getVehicles();
     if (!vehicles || vehicles.length === 0) {
        console.error('No vehicles found for this account.');
        return res.status(500).json({ error: 'No vehicles found' });
    }
    const vehicle = vehicles[0];
     console.log(`Found vehicle VIN: ${vehicle.vin}`);

     console.log('Attempting to start climate control (v5.0.0)...');
    // Using corrected climate params
    const result = await vehicle.startClimate({
      climate: true,
      heating: true,
      defrost: true,
      temp: 22,
      duration: 10
    });

     console.log('Climate control command sent successfully (v5.0.0).');
     res.status(200).json({ status: 'Vehicle climate start initiated (v5.0.0)', result });

  } catch (err) {
     console.error('ERROR during Bluelinky operation (v5.0.0):', err);
    res.status(500).json({
        error: 'Internal Server Error during Bluelinky operation.',
        details: err.message,
        stack: err.stack
    });
  }
};
