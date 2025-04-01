// api/start_car.js
const bluelinkyImport = require('bluelinky'); // Import the whole module object

// ---- Log the imported object structure ----
// These logs will help if the .default approach also fails
console.log('--- Bluelinky Import Debug ---');
console.log('Type of imported object (bluelinkyImport):', typeof bluelinkyImport);
console.log('Does it have a .default property?', bluelinkyImport.hasOwnProperty('default'));
if (bluelinkyImport.default) {
    console.log('Type of bluelinkyImport.default:', typeof bluelinkyImport.default);
} else {
    console.log('bluelinkyImport.default is missing or undefined.');
}
console.log('--- End Bluelinky Import Debug ---');
// ---- End logging ----

// *** Use the .default property as the constructor ***
const Bluelinky = bluelinkyImport.default;

module.exports = async (req, res) => {
  // ... (Keep Authorization checks) ...
  if (req.method !== 'POST') { /* ... */ }
  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${process.env.SECRET_KEY}`) { /* ... */ }

  try {
    // ... (Keep Env Var logs) ...
    console.log('Authorization successful. Preparing Bluelinky login...');
    // ... (KIA_USERNAME, etc. logs) ...

    // --- Add a Check ---
    // Verify that what we assigned to Bluelinky is actually usable as a constructor
    if (typeof Bluelinky !== 'function') {
        console.error('CRITICAL ERROR: bluelinkyImport.default is not a function/constructor. Value:', Bluelinky);
        return res.status(500).json({ error: 'Failed to load Bluelinky library correctly. The .default export was not a constructor.' });
    }
    console.log('Attempting Bluelinky instantiation using the .default export...');
    // --- End Check ---

    // *** Instantiate using the .default export ***
    const client = new Bluelinky({
        username: process.env.KIA_USERNAME,
        password: process.env.KIA_PASSWORD,
        pin: process.env.KIA_PIN,
        region: process.env.KIA_REGION || 'CA',
        brand: 'kia',
    });

    // ... (Rest of the code remains the same - getVehicles, startClimate with corrected params) ...
    console.log('Bluelinky client created, fetching vehicles...');
    const vehicles = await client.getVehicles();
     if (!vehicles || vehicles.length === 0) {
        console.error('No vehicles found for this account.');
        return res.status(500).json({ error: 'No vehicles found' });
    }
    const vehicle = vehicles[0];
    console.log(`Found vehicle VIN: ${vehicle.vin}`);

    console.log('Attempting to start climate control...');
    const result = await vehicle.startClimate({ // Using corrected params
      climate: true,
      heating: true,
      defrost: true,
      temp: 22,
      duration: 10
    });

     console.log('Climate control command sent successfully.');
     res.status(200).json({ status: 'Vehicle climate start initiated', result });

  } catch (err) {
    // ... (Keep detailed error logging) ...
    console.error('ERROR during Bluelinky operation:', err);
    res.status(500).json({
        error: 'Internal Server Error during Bluelinky operation.',
        details: err.message,
        stack: err.stack
    });
  }
};
