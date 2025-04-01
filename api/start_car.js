// api/start_car.js
const bluelinky = require('bluelinky'); // Import the whole module object

// ---- Log the imported object structure AGAIN ----
console.log('--- Bluelinky Import Debug ---');
const bluelinkyType = typeof bluelinky;
console.log('Type of imported object (bluelinky):', bluelinkyType); // Log the type
console.log('Does it have a .default property?', bluelinky.hasOwnProperty('default')); // Should be false
console.log('Does it have a .login property?', bluelinky.hasOwnProperty('login')); // Check for explicit login method
console.log('--- End Bluelinky Import Debug ---');
// ---- End Bluelinky Import Debug ----

// *** Determine the login function ***
let loginFunction = null;
if (bluelinkyType === 'function') {
    // If the import itself is the function to call
    console.log('Using the main bluelinky import directly as the login function.');
    loginFunction = bluelinky;
} else if (bluelinky && typeof bluelinky.login === 'function') {
    // If there's an explicit .login method on the imported object
    console.log('Using the bluelinky.login method.');
    loginFunction = bluelinky.login;
    // If using bluelinky.login, does it need to be bound? e.g., bluelinky.login.bind(bluelinky) ? Unlikely but possible.
} else {
    // If neither of the above, we don't know what to call
    console.error('Could not identify a valid login function from the bluelinky import.');
    // We'll let it proceed and likely fail in the try block, but the error is logged.
}


module.exports = async (req, res) => {
    // ... (Keep Auth checks) ...
    if (req.method !== 'POST') { /* ... */ }
    const auth = req.headers.authorization;
    if (!auth || auth !== `Bearer ${process.env.SECRET_KEY}`) { /* ... */ }

    try {
        // ... (Keep Env Var logs) ...
        console.log('Authorization successful. Preparing Bluelinky login...');
        // ... (KIA_USERNAME, etc. logs) ...

        // --- Check if we found a login function ---
        if (!loginFunction) {
             console.error('CRITICAL ERROR: No valid Bluelinky login function was identified during import.');
             return res.status(500).json({ error: 'Failed to load Bluelinky library correctly. Could not find login function.' });
        }
        console.log('Attempting Bluelinky login using the identified function...');
        // --- End Check ---

        // *** Call the identified function (NOT using 'new') ***
        const client = await loginFunction({
            username: process.env.KIA_USERNAME,
            password: process.env.KIA_PASSWORD,
            pin: process.env.KIA_PIN,
            region: process.env.KIA_REGION || 'CA',
            brand: 'kia',
        });

        // If this succeeds, great! If it fails, note the error (is it '_events' again?)
        console.log('Bluelinky login call seems to have returned, fetching vehicles...');

        // ... (Rest of the code: getVehicles, startClimate with corrected params) ...
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
        // *** Pay close attention to the error here ***
        console.error('ERROR during Bluelinky operation:', err);
        res.status(500).json({
            error: 'Internal Server Error during Bluelinky operation.',
            details: err.message,
            stack: err.stack // Crucial for seeing where it fails
        });
    }
};
