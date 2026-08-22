import { getStore } from "@netlify/blobs";
import crypto from "node:crypto";
const json=(x,s=200)=>new Response(JSON.stringify(x),{status:s,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store,max-age=0"}});
const clean=(v,n=180)=>String(v||"").trim().slice(0,n);
const adminOK=req=>String(req.headers.get("x-ejeride-pin")||"")===String(process.env.EJERIDE_ADMIN_PIN||"__none__");
const alphabet="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const code=()=>"ER-"+Array.from(crypto.randomBytes(5),b=>alphabet[b%alphabet.length]).join("");
async function newCode(store){for(let i=0;i<8;i++){const c=code();if(!await store.get("code/"+c,{type:"json",consistency:"strong"}))return c}return "ER-"+Date.now().toString(36).toUpperCase().slice(-6)}
export default async(request)=>{
  const store=getStore({name:"ejeride-wa-location",consistency:"strong"});const url=new URL(request.url);
  if(request.method==="GET"&&url.searchParams.get("admin")==="1"){
    if(!adminOK(request))return json({error:"PIN incorrect"},401);
    const list=await store.list({prefix:"session/"});const rows=[];const now=Date.now();
    for(const b of list.blobs.slice(-120)){const x=await store.get(b.key,{type:"json",consistency:"strong"});if(!x)continue;if(new Date(x.expiresAt||0).getTime()<now&&!x.location)continue;if(x.waId||x.location||x.source==="admin")rows.push(x)}
    rows.sort((a,b)=>String(b.updatedAt||b.createdAt).localeCompare(String(a.updatedAt||a.createdAt)));return json({sessions:rows.slice(0,50)});
  }
  if(request.method!=="POST")return json({error:"Method not allowed"},405);
  let b={};try{b=await request.json()}catch{}
  const action=b.action||"create";
  if(action==="create"){
    const token=crypto.randomBytes(16).toString("hex"),c=await newCode(store),now=new Date(),expires=new Date(Date.now()+2*60*60*1000);
    const session={token,code:c,status:"waiting_whatsapp",source:b.admin&&adminOK(request)?"admin":"public",waId:null,customerName:null,location:null,createdAt:now.toISOString(),updatedAt:now.toISOString(),expiresAt:expires.toISOString(),completedAt:null};
    await store.setJSON("session/"+token,session);await store.setJSON("code/"+c,{token,expiresAt:session.expiresAt});
    const phone=String(process.env.EJERIDE_WHATSAPP||"573001234567").replace(/\D/g,"");
    const lang=clean(b.lang,5)||"es";
    const msg=lang==="fr"?`Bonjour EjeRide 👋 Code ${c}. Je souhaite partager mon point de prise en charge. Après avoir envoyé ce message, appuyez sur + → Localisation → Envoyer votre position actuelle.`:lang==="en"?`Hello EjeRide 👋 Code ${c}. I want to share my pickup point. After sending this message, tap + → Location → Send your current location.`:`Hola EjeRide 👋 Código ${c}. Quiero compartir mi punto de recogida. Después de enviar este mensaje, toca + → Ubicación → Enviar tu ubicación actual.`;
    return json({session:{token,c,status:session.status,expiresAt:session.expiresAt},whatsappUrl:`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`});
  }
  if(!adminOK(request))return json({error:"PIN incorrect"},401);
  const token=clean(b.token,80);if(!token)return json({error:"Missing token"},400);const s=await store.get("session/"+token,{type:"json",consistency:"strong"});if(!s)return json({error:"Not found"},404);
  if(action==="complete"||action==="delete"){
    s.status="completed";s.completedAt=new Date().toISOString();s.updatedAt=s.completedAt;
    if(s.waId){const m=await store.get("phone/"+s.waId,{type:"json",consistency:"strong"});if(m?.token===token)await store.delete("phone/"+s.waId)}
    if(action==="delete"){
      await store.delete("session/"+token);
      if(s.code)await store.delete("code/"+s.code);
      return json({deleted:true});
    }
    await store.setJSON("session/"+token,s);
    return json({session:s});
  }
  return json({error:"Invalid action"},400);
};
