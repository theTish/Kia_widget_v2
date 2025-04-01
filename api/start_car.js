// api/start_car.js
const { Bluelinky } = require('bluelinky'); // Correct import based on docs

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${process.env.SECRET_KEY}`) {
    console.log('Authorization failed!');
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    // Keep these logs for verification on the first run
    console.log('Authorization successful. Preparing Bluelinky login...');
    console.log('KIA_USERNAME:', process.env.KIA_USERNAME ? 'Exists' : 'MISSING/UNDEFINED');
    console.log('KIA_PASSWORD:', process.env.KIA_PASSWORD ? 'Exists' : 'MISSING/UNDEFINED');
    console.log('KIA_PIN:', process.env.KIA_PIN ? 'Exists' : 'MISSING/UNDEFINED');
    console.log('KIA_REGION:', process.env.KIA_REGION || 'CA (defaulted)');

    console.log('Attempting Bluelinky class instantiation...');

    // Correct initialization based on docs
    const client = new Bluelinky({
      username: process.env.KIA_USERNAME,
      password: process.env.KIA_PASSWORD,
      pin: process.env.KIA_PIN,
      region: process.env.KIA_REGION || 'CA',
      brand: 'kia', // Assuming 'kia' brand is correct for your vehicle/region
    });

    // No separate client.login() needed based on docs examples

    console.log('Bluelinky client created, fetching vehicles...');
    const vehicles = await client.getVehicles();
    if (!vehicles || vehicles.length === 0) {
        console.error('No vehicles found for this account.');
        return res.status(500).json({ error: 'No vehicles found' });
    }
    const vehicle = vehicles[0]; // Use the first vehicle found
    console.log(`Found vehicle VIN: ${vehicle.vin}`);

    console.log('Attempting to start climate control...');

    // Adjusted startClimate parameters based on docs examples
    // Using 'climate: true' instead of 'airCtrl'. Trying 'temp' first.
    // Set heating/defrost as desired.
    const result = await vehicle.startClimate({
      climate: true,          // Use 'climate' instead of 'airCtrl'
      heating: true,          // Set as desired
      defrost: true,          // Set as desired
      temp: 22,               // Keep 'temp' for now, check if it works (Docs use tempCode)
      duration: 10            // Duration in minutes
    });

    console.log('Climate control command sent successfully.');
    res.status(200).json({ status: 'Vehicle climate start initiated', result });

  } catch (err) {
    console.error('ERROR during Bluelinky operation:', err);
    res.status(500).json({
        error: 'Internal Server Error during Bluelinky operation.',
        details: err.message,
        stack: err.stack
    });
  }
};
