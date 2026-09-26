const list=[["vietbot_client","Android / ESP32 / Python / Widget"],["vietbot_server","MQTT, STT/TTS"],["vietbot_offline","Raspberry Pi / trợ lý offline"],["custom_components","Home Assistant / TTS"]];
export async function onRequestGet(){
  const sources=await Promise.all(list.map(async([name,role])=>{
    const base={name,role,url:"https://github.com/phanmemkhoinghiep/"+name,available:false,branch:null,license:null};
    try{
      const r=await fetch("https://api.github.com/repos/phanmemkhoinghiep/"+name,{headers:{"Accept":"application/vnd.github+json","User-Agent":"GISBot/1.0"},cf:{cacheTtl:900,cacheEverything:true},signal:AbortSignal.timeout(11000)});
      if(!r.ok)return base;const d=await r.json();
      return {...base,available:true,branch:d.default_branch||null,license:d.license?.spdx_id||null,description:d.description||role,updatedAt:d.updated_at||null};
    }catch{return base;}
  }));
  return Response.json({sources,fetchedAt:new Date().toISOString()},{headers:{"Cache-Control":"public, max-age=300"}});
}