const reply=(value,status=200)=>Response.json(value,{status,headers:{"Cache-Control":status===200?"public, max-age=600":"no-store"}});
export async function onRequestGet({request}){
  const q=(new URL(request.url).searchParams.get("q")||"").trim();
  if(q.length<2||q.length>120)return reply({error:"Tên địa điểm phải dài 2–120 ký tự."},400);
  const cache=globalThis.caches?.default;
  const key=new Request("https://gisbot.internal/geocode?q="+encodeURIComponent(q.toLowerCase()));
  const cached=await cache?.match(key);if(cached)return cached;
  try {
    const url="https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&addressdetails=0&q="+encodeURIComponent(q);
    const r=await fetch(url,{headers:{"Accept":"application/json","Accept-Language":"vi","User-Agent":"GISBot/1.0 (+https://github.com/xulytiengviet/gisbot)"},signal:AbortSignal.timeout(12000)});
    if(!r.ok)return reply({error:"Dịch vụ địa danh trả HTTP "+r.status},502);
    const data=await r.json();
    if(!Array.isArray(data))return reply({error:"Phản hồi địa danh không hợp lệ."},502);
    const results=data.slice(0,5).filter(x=>Number.isFinite(Number(x.lat))&&Number.isFinite(Number(x.lon))).map(x=>({name:String(x.display_name||"").slice(0,300),lat:Number(x.lat),lon:Number(x.lon)}));
    const out=reply({results,attribution:"© OpenStreetMap contributors / Nominatim"});
    await cache?.put(key,out.clone());return out;
  }catch{return reply({error:"Không thể kết nối dịch vụ địa danh."},502);}
}