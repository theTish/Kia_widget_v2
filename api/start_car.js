// api/start_car.js (ESM Version - Attempt 3: Default Import + Class Access)

// Use ESM default import to get the wrapper object
import bluelinkyImportObject from 'bluelinky';

// Access the actual class constructor from the imported object's 'BlueLinky' property
const Bluelinky = bluelinkyImportObject.BlueLinky;

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
    console.log('Authorization successful. Preparing Bluelinky login (v8.3.1 - ESM class access)...');
    // Optional: Log env vars
    console.log('KIA_USERNAME:', process.env.KIA_USERNAME ? 'Exists' : 'MISSING/UNDEFINED');
    console.log('KIA_PIN:', process.env.KIA_PIN ? 'Exists' : 'MISSING/UNDEFINED');
    console.log('KIA_REGION:', process.env.KIA_REGION || 'CA (defaulted)');

    // --- Check if we accessed the Bluelinky class correctly ---
    if (typeof Bluelinky !== 'function') {
        // This shouldn't happen now, but keep as a safeguard
        console.error('CRITICAL ERROR: Accessed Bluelinky is not a function/constructor (v8.3.1 - ESM). Value:', Bluelinky);
        console.log('Imported object was:', bluelinkyImportObject);
        return res.status(500).json({ error: 'Failed to load Bluelinky library correctly (v8.3.1 - ESM). Could not access constructor.' });
    }
    console.log('Attempting Bluelinky class instantiation using accessed constructor (v8.3.1 - ESM)...');
    // --- End Check ---

    // *** Instantiate using the accessed class constructor ***
    const client = new Bluelinky({
        username: process.env.KIA_USERNAME,
        password: process.env.KIA_PASSWORD,
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
     console.error('ERROR during Bluelinky operation (v8.3.1 - ESM class access):', err); // *** Check error here if instantiation succeeds but operation fails ***
     return res.status(500).json({
        error: 'Internal Server Error during Bluelinky operation.',
        details: err.message,
        stack: err.stack
    });
  }
} // End of export default function
