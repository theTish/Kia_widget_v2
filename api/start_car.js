// api/start_car.js - Try functional call with bluelinky version "8.3.1"

const bluelinky = require('bluelinky');

// *** Assume functional call needed even for v8 with require ***
let loginFunction = null;
if (typeof bluelinky === 'function') {
    console.log('Using main bluelinky import as login function (for v8.3.1).');
    loginFunction = bluelinky;
} else if (bluelinky && typeof bluelinky.login === 'function') {
    // Less likely based on previous tests, but check just in case
    console.log('Using bluelinky.login method (for v8.3.1).');
    loginFunction = bluelinky.login;
}

module.exports = async (req, res) => {
  // ... Auth checks ...
  if (req.method !== 'POST') { return res.status(405).json({ error: 'Method Not Allowed' }); }
  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${process.env.SECRET_KEY}`) { return res.status(403).json({ error: 'Unauthorized' }); }

  try {
    console.log('Authorization successful. Preparing Bluelinky login (v8.3.1)...');
    // ... Env Var logs ...

    if (!loginFunction) {
         console.error('CRITICAL ERROR: No valid Bluelinky login function identified (v8.3.1).');
         return res.status(500).json({ error: 'Failed to load Bluelinky library correctly (v8.3.1).' });
    }
    console.log('Attempting Bluelinky login using identified function (v8.3.1)...');

    // *** Call the identified function (NOT as a constructor) ***
    const client = await loginFunction({
        username: process.env.KIA_USERNAME,
        password: process.env.KIA_PASSWORD,
        pin: process.env.KIA_PIN,
        region: process.env.KIA_REGION || 'CA',
        brand: 'kia',
    });

    // Check if login returned a valid client object
    if (!client || typeof client.getVehicles !== 'function') {
        console.error('Bluelinky login function did not return a valid client object (v8.3.1).');
        return res.status(500).json({ error: 'Bluelinky login failed to return client (v8.3.1).' });
    }

    console.log('Bluelinky login call returned (v8.3.1), fetching vehicles...');
    const vehicles = await client.getVehicles();
     if (!vehicles || vehicles.length === 0) {
        console.error('No vehicles found for this account.');
        return res.status(500).json({ error: 'No vehicles found' });
    }
    const vehicle = vehicles[0];
     console.log(`Found vehicle VIN: ${vehicle.vin}`);

     console.log('Attempting to start climate control (v8.3.1)...');
    // Use climate parameters expected for v5+ (assuming v8 is similar)
    const result = await vehicle.startClimate({
      climate: true,
      heating: true,
      defrost: true,
      temp: 22,
      duration: 10
    });

     console.log('Climate control command sent successfully (v8.3.1).');
     res.status(200).json({ status: 'Vehicle climate start initiated (v8.3.1)', result });

  } catch (err) {
     console.error('ERROR during Bluelinky operation (v8.3.1):', err); // *** What error occurs here? _events? Something new? ***
    res.status(500).json({
        error: 'Internal Server Error during Bluelinky operation.',
        details: err.message,
        stack: err.stack
    });
  }
};
