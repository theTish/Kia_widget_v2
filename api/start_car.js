// api/start_car.js (ESM Version - Attempt 2: Default Import + Functional Call)

// Use ESM default import for CJS module interoperability
import bluelinky from 'bluelinky';

// Use export default for the Vercel handler function
export default async function handler(req, res) {
  // Method Check
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Authorization Check
  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${process.env.SECRET_KEY}`) {
    console.log('Authorization failed!');
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    console.log('Authorization successful. Preparing Bluelinky login (v8.3.1 - ESM default import)...');
    // Optional: Log env vars
    console.log('KIA_USERNAME:', process.env.KIA_USERNAME ? 'Exists' : 'MISSING/UNDEFINED');
    console.log('KIA_PIN:', process.env.KIA_PIN ? 'Exists' : 'MISSING/UNDEFINED');
    console.log('KIA_REGION:', process.env.KIA_REGION || 'CA (defaulted)');

    // --- Check if the default import is a function ---
    if (typeof bluelinky !== 'function') {
        console.error('CRITICAL ERROR: Default import "bluelinky" is not a function (v8.3.1 - ESM). Type:', typeof bluelinky);
        // Log its structure if it's not a function
        console.log('Structure of default import:', bluelinky);
        return res.status(500).json({ error: 'Failed to load Bluelinky library correctly (v8.3.1 - ESM). Default import is not a function.' });
    }
    console.log('Attempting Bluelinky login using default import as function (v8.3.1 - ESM)...');
    // --- End Check ---

    // *** Call the default import directly as a function ***
    const client = await bluelinky({
        username: process.env.KIA_USERNAME,
        password: process.env.KIA_PASSWORD,
        pin: process.env.KIA_PIN,
        region: process.env.KIA_REGION || 'CA',
        brand: 'kia',
    });

    // Check if login returned a valid client object
    if (!client || typeof client.getVehicles !== 'function') {
        console.error('Bluelinky default import function did not return a valid client object (v8.3.1 - ESM).');
        return res.status(500).json({ error: 'Bluelinky login failed to return client (v8.3.1 - ESM).' });
    }

    console.log('Bluelinky login call returned (v8.3.1 - ESM), fetching vehicles...');
    const vehicles = await client.getVehicles();
     if (!vehicles || vehicles.length === 0) {
        console.error('No vehicles found for this account.');
        return res.status(500).json({ error: 'No vehicles found' });
    }
    const vehicle = vehicles[0];
     console.log(`Found vehicle VIN: ${vehicle.vin}`);

     console.log('Attempting to start climate control (v8.3.1 - ESM)...');
    // Using corrected climate params based on v5+ docs
    const result = await vehicle.startClimate({
      climate: true,
      heating: true,
      defrost: true,
      temp: 22,
      duration: 10
    });

     console.log('Climate control command sent successfully (v8.3.1 - ESM).');
     return res.status(200).json({ status: 'Vehicle climate start initiated (v8.3.1 - ESM)', result });

  } catch (err) {
     console.error('ERROR during Bluelinky operation (v8.3.1 - ESM functional call):', err); // *** Check this error carefully ***
     return res.status(500).json({
        error: 'Internal Server Error during Bluelinky operation.',
        details: err.message,
        stack: err.stack
    });
  }
} // End of export default function
