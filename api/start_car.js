// api/start_car.js (ESM Version)

// Use ESM import syntax
import { Bluelinky } from 'bluelinky';

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
    console.log('Authorization successful. Preparing Bluelinky login (v8.3.1 - ESM)...');
    // Optional: Log env vars to confirm they load
    console.log('KIA_USERNAME:', process.env.KIA_USERNAME ? 'Exists' : 'MISSING/UNDEFINED');
    console.log('KIA_PIN:', process.env.KIA_PIN ? 'Exists' : 'MISSING/UNDEFINED');
    console.log('KIA_REGION:', process.env.KIA_REGION || 'CA (defaulted)');

    // Check if Bluelinky imported correctly (less likely to fail silently in ESM)
    if (typeof Bluelinky !== 'function') {
        // This check might be redundant if import fails earlier, but good sanity check
        console.error('CRITICAL ERROR: Imported Bluelinky is not a function/constructor (v8.3.1 - ESM). Value:', Bluelinky);
        return res.status(500).json({ error: 'Failed to load Bluelinky library correctly (v8.3.1 - ESM). Named import is not a constructor.' });
    }
    console.log('Attempting Bluelinky class instantiation using named import (v8.3.1 - ESM)...');

    // *** Instantiate using the named import (as per docs) ***
    const client = new Bluelinky({
        username: process.env.KIA_USERNAME,
        password: process.env.KIA_PASSWORD, // Ensure password env var exists
        pin: process.env.KIA_PIN,
        region: process.env.KIA_REGION || 'CA',
        brand: 'kia',
    });

    // Assuming no separate .login() needed

    console.log('Bluelinky client created (v8.3.1 - ESM), fetching vehicles...');
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
      temp: 22, // Still trying temp first, docs used tempCode
      duration: 10
    });

     console.log('Climate control command sent successfully (v8.3.1 - ESM).');
     return res.status(200).json({ status: 'Vehicle climate start initiated (v8.3.1 - ESM)', result });

  } catch (err) {
     console.error('ERROR during Bluelinky operation (v8.3.1 - ESM):', err);
     return res.status(500).json({
        error: 'Internal Server Error during Bluelinky operation.',
        details: err.message,
        stack: err.stack // Consider removing stack in production
    });
  }
} // End of export default function
