import { getStore } from "@netlify/blobs";
const DEFAULT_STATE={status:"offline",minutes:0,availableAt:null,updatedAt:null};
const json=(x,s=200)=>new Response(JSON.stringify(x),{status:s,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store,max-age=0"}});
export default async (request)=>{
  const store=getStore({name:"ejeride-live-status",consistency:"strong"});
  if(request.method==="GET") return json(await store.get("current",{type:"json",consistency:"strong"})||DEFAULT_STATE);
  if(request.method!=="POST") return json({error:"Method not allowed"},405);
  let b;try{b=await request.json()}catch{return json({error:"Invalid JSON"},400)}
  if(String(b.pin||"")!==String(process.env.EJERIDE_ADMIN_PIN||"__none__")) return json({error:"PIN incorrect"},401);
  const allowed=new Set(["available","busy","offline"]);const status=allowed.has(b.status)?b.status:"offline";
  const minutes=status==="busy"?Math.min(360,Math.max(1,Number(b.minutes)||30)):0;const now=Date.now();
  const state={status,minutes,availableAt:status==="busy"?now+minutes*60000:null,updatedAt:now};
  await store.setJSON("current",state);return json(state);
};
