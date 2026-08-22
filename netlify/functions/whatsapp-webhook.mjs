import { getStore } from "@netlify/blobs";
import crypto from "node:crypto";
const textResponse=(t,s=200)=>new Response(String(t),{status:s,headers:{"content-type":"text/plain; charset=utf-8","cache-control":"no-store"}});
const json=(x,s=200)=>new Response(JSON.stringify(x),{status:s,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}});
const clean=(v,n=180)=>String(v||"").trim().slice(0,n);
function validSignature(raw,header){const secret=process.env.EJERIDE_META_APP_SECRET;if(!secret)return true;if(!header?.startsWith("sha256="))return false;const expected="sha256="+crypto.createHmac("sha256",secret).update(raw).digest("hex");const a=Buffer.from(expected),b=Buffer.from(header);return a.length===b.length&&crypto.timingSafeEqual(a,b)}
async function sendText(to,body){const token=process.env.EJERIDE_META_ACCESS_TOKEN,id=process.env.EJERIDE_META_PHONE_NUMBER_ID;if(!token||!id)return;const version=process.env.EJERIDE_META_GRAPH_VERSION||"v23.0";try{await fetch(`https://graph.facebook.com/${version}/${id}/messages`,{method:"POST",headers:{"Authorization":`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify({messaging_product:"whatsapp",recipient_type:"individual",to,type:"text",text:{preview_url:false,body}})})}catch{}}
async function createIncoming(store,from,name){const token=crypto.randomBytes(16).toString("hex"),now=new Date().toISOString(),c="WA-"+crypto.randomBytes(3).toString("hex").toUpperCase();const s={token,code:c,status:"waiting_location",source:"whatsapp",waId:from,customerName:name||null,location:null,createdAt:now,updatedAt:now,expiresAt:new Date(Date.now()+12*60*60*1000).toISOString(),completedAt:null};await store.setJSON("session/"+token,s);await store.setJSON("phone/"+from,{token,updatedAt:now});return s}
export default async(request)=>{
  const url=new URL(request.url);
  if(request.method==="GET"){
    const mode=url.searchParams.get("hub.mode"),token=url.searchParams.get("hub.verify_token"),challenge=url.searchParams.get("hub.challenge");
    if(mode==="subscribe"&&token&&token===process.env.EJERIDE_META_VERIFY_TOKEN)return textResponse(challenge||"");
    return textResponse("Forbidden",403);
  }
  if(request.method!=="POST")return json({error:"Method not allowed"},405);
  const raw=await request.text();if(!validSignature(raw,request.headers.get("x-hub-signature-256")))return json({error:"Invalid signature"},401);
  let payload;try{payload=JSON.parse(raw)}catch{return json({ok:true})}
  const store=getStore({name:"ejeride-wa-location",consistency:"strong"});
  for(const entry of payload.entry||[])for(const change of entry.changes||[]){const value=change.value||{};const names=new Map((value.contacts||[]).map(c=>[c.wa_id,c.profile?.name||""]));for(const m of value.messages||[]){
    const from=clean(m.from,40);if(!from)continue;const name=clean(names.get(from),80);const now=new Date().toISOString();
    if(m.type==="text"){
      const body=clean(m.text?.body,500),match=body.toUpperCase().match(/\bER-[A-Z2-9]{5}\b/);if(match){const c=match[0],ref=await store.get("code/"+c,{type:"json",consistency:"strong"});if(ref?.token){const s=await store.get("session/"+ref.token,{type:"json",consistency:"strong"});if(s&&new Date(s.expiresAt).getTime()>Date.now()){s.waId=from;s.customerName=name||s.customerName;s.status=s.location?"location_received":"waiting_location";s.updatedAt=now;await store.setJSON("session/"+s.token,s);await store.setJSON("phone/"+from,{token:s.token,updatedAt:now});await sendText(from,"EjeRide ✓ Código recibido. Ahora toca + → Ubicación → Enviar tu ubicación actual.");}}}
    }
    if(m.type==="location"&&m.location){let map=await store.get("phone/"+from,{type:"json",consistency:"strong"}),s=map?.token?await store.get("session/"+map.token,{type:"json",consistency:"strong"}):null;if(!s||s.status==="completed"||new Date(s.expiresAt||0).getTime()<Date.now())s=await createIncoming(store,from,name);
      const lat=Number(m.location.latitude),lng=Number(m.location.longitude);if(Number.isFinite(lat)&&Number.isFinite(lng)){s.waId=from;s.customerName=name||s.customerName;s.location={lat,lng,name:clean(m.location.name,120)||null,address:clean(m.location.address,220)||null};s.status="location_received";s.updatedAt=now;await store.setJSON("session/"+s.token,s);await store.setJSON("phone/"+from,{token:s.token,updatedAt:now});await sendText(from,"📍 Ubicación recibida. Gracias. Te confirmo por este chat.");}
    }
  }}
  return json({ok:true});
};
