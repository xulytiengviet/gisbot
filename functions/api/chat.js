const fail=(error,status=400)=>Response.json({error},{status,headers:{"Cache-Control":"no-store"}});
const eq=(a,b)=>{if(typeof a!=="string"||typeof b!=="string"||a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;};
export async function onRequestPost({request,env}){
  const origin=request.headers.get("Origin");if(origin&&origin!==new URL(request.url).origin)return fail("Yêu cầu không cùng nguồn.",403);
  if(!request.headers.get("Content-Type")?.includes("application/json"))return fail("Cần JSON.",415);
  if(Number(request.headers.get("Content-Length")||0)>18000)return fail("Dữ liệu quá lớn.",413);
  let v;try{v=await request.json();}catch{return fail("JSON không hợp lệ.");}
  if(!Array.isArray(v?.messages)||v.messages.length<1||v.messages.length>12)return fail("Tối đa 12 tin nhắn.");
  if(!v.messages.every(x=>x&&["user","assistant"].includes(x.role)&&typeof x.content==="string"&&x.content.length>0&&x.content.length<=3000))return fail("Tin nhắn không hợp lệ.");
  const provided=typeof v.providerKey==="string"?v.providerKey.trim():"";
  if(provided&&!/^sk-or-[a-zA-Z0-9-_]{12,180}$/.test(provided))return fail("Định dạng khóa OpenRouter không hợp lệ.");
  const token=request.headers.get("Authorization")?.replace(/^Bearer\s+/i,"")||"";
  const allow=Boolean(env.OPENROUTER_API_KEY&&env.GISBOT_ACCESS_TOKEN&&eq(token,env.GISBOT_ACCESS_TOKEN));
  const key=provided||(allow?env.OPENROUTER_API_KEY:"");
  if(!key)return fail("Cần khóa OpenRouter riêng hoặc mã truy cập máy chủ.",503);
  const model=typeof v.model==="string"&&/^[\w./-]{3,100}$/.test(v.model)?v.model:"openai/gpt-4o-mini";
  const loc=v.location;
  const locationContext=loc&&Number.isFinite(loc.lat)&&Number.isFinite(loc.lon)&&Math.abs(loc.lat)<=90&&Math.abs(loc.lon)<=180?" Tâm bản đồ WGS84: "+loc.lat.toFixed(5)+", "+loc.lon.toFixed(5)+". Không suy đoán đây là vị trí người dùng.":"";
  const system="Bạn là GISBot. Trả lời bằng tiếng Việt về GIS, địa lý, tọa độ và bản đồ. Phân biệt dữ liệu đã kiểm chứng với suy luận. Không tự nhận có thông tin thời gian thực, không ra lệnh điều khiển thiết bị."+locationContext;
  try{
    const r=await fetch("https://openrouter.ai/api/v1/chat/completions",{method:"POST",
      headers:{"Authorization":"Bearer "+key,"Content-Type":"application/json","HTTP-Referer":"https://github.com/xulytiengviet/gisbot","X-Title":"GISBot"},
      body:JSON.stringify({model,messages:[{role:"system",content:system},...v.messages],temperature:0.3,max_tokens:800}),
      signal:AbortSignal.timeout(30000)});
    if(!r.ok)return fail(r.status===402?"Không đủ hạn mức của nhà cung cấp AI.":"OpenRouter HTTP "+r.status,r.status===429?429:502);
    const data=await r.json();const answer=data?.choices?.[0]?.message?.content;
    if(typeof answer!=="string"||!answer.trim())return fail("Mô hình không trả về văn bản.",502);
    return Response.json({answer:answer.slice(0,12000),model:data.model||model},{headers:{"Cache-Control":"no-store"}});
  }catch{return fail("Không thể kết nối tới OpenRouter.",502);}
}
export function onRequestGet(){return fail("Chỉ hỗ trợ POST.",405);}
