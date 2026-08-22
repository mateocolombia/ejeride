export default async () => new Response(JSON.stringify({
  whatsapp: process.env.EJERIDE_WHATSAPP || "573001234567",
  driverName: process.env.EJERIDE_DRIVER_NAME || "EjeRide",
  vehicle: process.env.EJERIDE_VEHICLE || "Tesla Model 3",
  mapStyle: "https://tiles.openfreemap.org/styles/liberty"
}), { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=300" } });
