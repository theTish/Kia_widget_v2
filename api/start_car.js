// api/start_car.js - Use this code AFTER changing package.json to "bluelinky": "8.3.1"

// Use the documented class-based import for v8
const { Bluelinky } = require('bluelinky');

module.exports = async (req, res) => {
  // ... Auth checks ...
  if (req.method !== 'POST') { return res.status(405).json({ error: 'Method Not Allowed' }); }
  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${process.env.SECRET_KEY}`) { return res.status(403).json({ error: 'Unauthorized' }); }

  try {
    console.log('Authorization successful. Preparing Bluelinky login (v8.3.1)...');
    // ... Env Var logs ...

    // --- Check if Bluelinky is a constructor (v8.3.1) ---
    if (typeof Bluelinky !== 'function') {
        console.error('CRITICAL ERROR: Bluelinky (from require) is not a function/constructor with version 8.3.1. Value:', Bluelinky);
         return res.status(500).json({ error: 'Failed to load Bluelinky library correctly (v8.3.1). Named export is not a constructor.' });
    }
    console.log('Attempting Bluelinky class instantiation using named export (v8.3.1)...');
    // --- End Check ---

    // *** Instantiate using the named export (as per docs) ***
    const client = new Bluelinky({
        username: process.env.KIA_USERNAME,
        password: process.env.KIA_PASSWORD,
        pin: process.env.KIA_PIN,
        region: process.env.KIA_REGION || 'CA', // Assuming 'CA' region string is valid
        brand: 'kia', // Assuming 'kia' brand string is valid
    });

    // Assuming no separate .login() needed based on docs

    console.log('Bluelinky client created (v8.3.1), fetching vehicles...');
    const vehicles = await client.getVehicles();
     if (!vehicles || vehicles.length === 0) {
        console.error('No vehicles found for this account.');
        return res.status(500).json({ error: 'No vehicles found' });
    }
    const vehicle = vehicles[0];
     console.log(`Found vehicle VIN: ${vehicle.vin}`);

     console.log('Attempting to start climate control (v8.3.1)...');
    // Using corrected climate params based on v5+ docs
    const result = await vehicle.startClimate({
      climate: true,
      heating: true,
      defrost: true,
      temp: 22, // Still trying temp first, docs used tempCode
      duration: 10
    });

     console.log('Climate control command sent successfully (v8.3.1).');
     res.status(200).json({ status: 'Vehicle climate start initiated (v8.3.1)', result });

  } catch (err) {
     console.error('ERROR during Bluelinky operation (v8.3.1):', err);
    res.status(500).json({
        error: 'Internal Server Error during Bluelinky operation.',
        details: err.message,
        stack: err.stack
    });
  }
};
