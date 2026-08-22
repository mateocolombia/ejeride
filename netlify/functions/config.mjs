export default async () => new Response(JSON.stringify({
  whatsapp: process.env.EJERIDE_WHATSAPP || "573001234567",
  googleReviewUrl: process.env.EJERIDE_GOOGLE_REVIEW_URL || "",
  driverName: process.env.EJERIDE_DRIVER_NAME || "EjeRide",
  vehicle: process.env.EJERIDE_VEHICLE || "Tesla Model 3"
}), { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=300" } });
