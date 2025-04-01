// api/start_car.js (ESM - Attempting with direct getVehicle by VIN)

import bluelinkyImportObject from 'bluelinky';
const Bluelinky = bluelinkyImportObject.BlueLinky;

export default async function handler(req, res) {
  // ... Method Check ...
  // ... Auth Check ...

  // --- Add Check for KIA_VIN environment variable ---
  if (!process.env.KIA_VIN) {
    console.error("CRITICAL ERROR: KIA_VIN environment variable is not set.");
    return res.status(500).json({ error: 'Server configuration error: VIN not set.' });
  }
  // --- End Check ---

  try {
    console.log('Authorization successful. Preparing Bluelinky login (v8.3.1 - ESM class access)...');
    console.log(`Using KIA_USERNAME: ${process.env.KIA_USERNAME}`);
    console.log(`Using KIA_PIN: [${process.env.KIA_PIN ? 'Exists and has length ' + process.env.KIA_PIN.length : 'MISSING or empty'}]`);
    const regionToUse = process.env.KIA_REGION || 'CA';
    console.log(`Using region: ${regionToUse}`);
    console.log(`Using brand: kia`);
    console.log(`Using KIA_VIN: ${process.env.KIA_VIN}`); // Log the VIN being used

    if (typeof Bluelinky !== 'function') { /* ... Error handling ... */ }
    console.log('Attempting Bluelinky class instantiation...');

    const client = new Bluelinky({
        username: process.env.KIA_USERNAME,
        password: process.env.KIA_PASSWORD,
        pin: process.env.KIA_PIN,
        region: regionToUse,
        brand: 'kia',
        // NOTE: VIN is typically NOT passed in constructor
    });

    console.log('Bluelinky client created. Attempting direct getVehicle by VIN...');

    // *** Skip getVehicles(), try getVehicle(vin) directly ***
    const vehicle = await client.getVehicle(process.env.KIA_VIN);

     // Check if a valid vehicle object was returned
     if (!vehicle || !vehicle.vin) {
        console.error(`No vehicle found using direct getVehicle for VIN: ${process.env.KIA_VIN}`);
        return res.status(500).json({ error: 'No vehicle found for specified VIN' });
    }
    // If vehicle IS found...
     console.log(`Found vehicle directly via VIN: ${vehicle.vin}`);

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
     console.error('ERROR during Bluelinky operation (v8.3.1 - ESM direct getVehicle):', err);
     return res.status(500).json({
        error: 'Internal Server Error during Bluelinky operation.',
        details: err.message,
        stack: err.stack
    });
  }
}
