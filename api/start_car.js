// api/start_car.js (ESM - Attempting without region)

import bluelinkyImportObject from 'bluelinky';
const Bluelinky = bluelinkyImportObject.BlueLinky;

export default async function handler(req, res) {
  // ... Method Check ...
  // ... Auth Check ...

  try {
    console.log('Authorization successful. Preparing Bluelinky login (v8.3.1 - ESM class access - NO REGION)...');
    // ... Env Var logs ...

    if (typeof Bluelinky !== 'function') { /* ... Error handling ... */ }
    console.log('Attempting Bluelinky class instantiation (NO REGION)...');

    // *** Instantiate WITHOUT region ***
    const client = new Bluelinky({
        username: process.env.KIA_USERNAME,
        password: process.env.KIA_PASSWORD,
        pin: process.env.KIA_PIN,
        // region: process.env.KIA_REGION || 'CA', // <-- REMOVE OR COMMENT OUT THIS LINE
        brand: 'kia', // Keep brand for now
    });

    console.log('Bluelinky client created, fetching vehicles...');
    const vehicles = await client.getVehicles();
     if (!vehicles || vehicles.length === 0) {
        console.error('No vehicles found for this account (NO REGION attempt).');
        // Return the error if no vehicles found
        return res.status(500).json({ error: 'No vehicles found (no region specified)' });
    }
    // If vehicles ARE found, proceed...
    const vehicle = vehicles[0];
     console.log(`Found vehicle VIN: ${vehicle.vin}`);

     console.log('Attempting to start climate control (v8.3.1 - ESM)...');
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
     console.error('ERROR during Bluelinky operation (v8.3.1 - ESM class access - NO REGION):', err);
     return res.status(500).json({
        error: 'Internal Server Error during Bluelinky operation.',
        details: err.message,
        stack: err.stack
    });
  }
}
