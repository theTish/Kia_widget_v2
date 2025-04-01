// api/start_car.js (ESM - Reverting to include region)

import bluelinkyImportObject from 'bluelinky';
const Bluelinky = bluelinkyImportObject.BlueLinky;

export default async function handler(req, res) {
  // ... Method Check ...
  // ... Auth Check ...

  try {
    console.log('Authorization successful. Preparing Bluelinky login (v8.3.1 - ESM class access - WITH REGION)...');
    // Log exact values being used (except password/PIN)
    console.log(`Using KIA_USERNAME: ${process.env.KIA_USERNAME}`);
    console.log(`Using KIA_PIN: [${process.env.KIA_PIN ? 'Exists and has length ' + process.env.KIA_PIN.length : 'MISSING or empty'}]`); // Verify PIN exists and check length
    const regionToUse = process.env.KIA_REGION || 'CA';
    console.log(`Using region: ${regionToUse}`);
    console.log(`Using brand: kia`);

    if (typeof Bluelinky !== 'function') {
        console.error('CRITICAL ERROR: Accessed Bluelinky is not a function/constructor (v8.3.1 - ESM). Value:', Bluelinky);
        return res.status(500).json({ error: 'Failed to load Bluelinky library correctly (v8.3.1 - ESM). Could not access constructor.' });
    }
    console.log('Attempting Bluelinky class instantiation using accessed constructor (WITH REGION)...');

    // *** Instantiate WITH region ***
    const client = new Bluelinky({
        username: process.env.KIA_USERNAME,
        password: process.env.KIA_PASSWORD, // Assumed correct from web login
        pin: process.env.KIA_PIN,           // *** ENSURE THIS IS CORRECT ***
        region: regionToUse,                // Put region back
        brand: 'kia',
    });

    console.log('Bluelinky client created, fetching vehicles...');
    const vehicles = await client.getVehicles();
     if (!vehicles || vehicles.length === 0) {
        // If this error still happens, PIN or Primary Account are highly suspect
        console.error('No vehicles found for this account (WITH REGION attempt). CHECK PIN AND PRIMARY ACCOUNT STATUS.');
        return res.status(500).json({ error: 'No vehicles found (region specified, check PIN/Account)' });
    }
    // If vehicles ARE found...
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
     console.error('ERROR during Bluelinky operation (v8.3.1 - ESM class access - WITH REGION):', err);
     return res.status(500).json({
        error: 'Internal Server Error during Bluelinky operation.',
        details: err.message,
        stack: err.stack
    });
  }
}
