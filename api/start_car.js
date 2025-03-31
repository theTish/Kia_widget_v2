import bluelinky from 'bluelinky';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${process.env.SECRET_KEY}`) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const { login } = bluelinky;

    const client = await login({
      username: process.env.KIA_USERNAME,
      password: process.env.KIA_PASSWORD,
      pin: process.env.KIA_PIN,
      region: process.env.KIA_REGION || 'CA',
      brand: 'kia',
    });

    const vehicles = await client.getVehicles();
    const vehicle = vehicles[0];

    const result = await vehicle.startClimate({
      airCtrl: true,
      heating: true,
      defrost: true,
      temp: 22,
      duration: 10
    });

    res.status(200).json({ status: 'Vehicle started', result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
