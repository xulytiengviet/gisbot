export function onRequestGet({env}) {
  return Response.json({ok:true,service:"GISBot",runtime:"Cloudflare Pages Functions",
    aiShared:Boolean(env.OPENROUTER_API_KEY&&env.GISBOT_ACCESS_TOKEN),
    aiByok:true,geocoding:true,sources:true,time:new Date().toISOString()},
    {headers:{"Cache-Control":"no-store"}});
}