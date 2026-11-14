const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {status, headers: {'content-type':'application/json; charset=utf-8', 'cache-control':'no-store', ...headers}});
function allowedOrigin(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = String(env.ALLOWED_ORIGINS || 'capacitor://localhost,http://localhost,https://localhost').split(',').map(x=>x.trim()).filter(Boolean);
  return allowed.includes(origin) ? origin : '';
}
function cors(request, env) {
  const origin = allowedOrigin(request, env);
  return origin ? {'access-control-allow-origin':origin,'access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'Content-Type','vary':'Origin'} : {};
}
function outputText(data) {
  const chunks=[];
  for (const item of (data.output || [])) {
    if (item.type !== 'message' || item.role !== 'assistant') continue;
    for (const part of (item.content || [])) if (part.type === 'output_text' && part.text) chunks.push(part.text);
  }
  return chunks.join('\n\n').trim();
}
function collectSources(data) {
  const all=[];
  for (const item of (data.output || [])) {
    if (item.type === 'message') for (const part of (item.content || [])) for (const a of (part.annotations || [])) {
      const c=a.url_citation || a; if (c.url && /^https:\/\//i.test(c.url)) all.push({title:c.title || c.url, url:c.url});
    }
    if (item.type === 'web_search_call') for (const s of ((item.action || {}).sources || [])) if (s.url && /^https:\/\//i.test(s.url)) all.push({title:s.title || s.url,url:s.url});
  }
  const seen=new Set();return all.filter(s=>{if(seen.has(s.url))return false;seen.add(s.url);return true}).slice(0,12);
}
export default {
 async fetch(request, env) {
  const headers=cors(request,env), origin=request.headers.get('Origin')||'';
  if(request.method==='OPTIONS') return new Response(null,{status:204,headers});
  const url=new URL(request.url);
  if(url.pathname==='/api/version' && request.method==='GET') return json({version:env.APP_VERSION||'3.3.0',androidUrl:env.ANDROID_APK_URL||'',iosUrl:env.IOS_APP_URL||'',releaseNotes:env.RELEASE_NOTES||''},200,headers);
  if(url.pathname!=='/api/chat' || request.method!=='POST') return json({error:'Not found'},404,headers);
  if(!allowedOrigin(request,env)) return json({error:'This app origin is not allowed. Add it to ALLOWED_ORIGINS in Worker settings.'},403);
  if(!env.OPENAI_API_KEY) return json({error:'The OpenAI API key is not configured on the secure server.'},503,headers);
  let body;try{body=await request.json()}catch{return json({error:'Invalid JSON request.'},400,headers)}
  const message=String(body.message||'').trim();if(!message)return json({error:'Please enter a question.'},400,headers);if(message.length>6000)return json({error:'Message is too long. Please keep it under 6,000 characters.'},413,headers);
  const history=Array.isArray(body.history)?body.history.slice(-10).filter(x=>['user','assistant'].includes(x.role)&&typeof x.content==='string').map(x=>({role:x.role,content:[{type:'input_text',text:x.content.slice(0,6000)}]})):[];
  const instructions='You are the advanced Daily Routine Tracker learning and research assistant. Act as an expert tutor, study coach, and careful research analyst for school and university learners. Teach concepts from first principles; diagnose misconceptions; solve problems step by step; show formulas, units, assumptions, and checks; create revision plans, quizzes, flashcards, and structured summaries when asked. Adapt explanations to the learner's level and use clear examples. For coding questions, explain the design, provide complete runnable code when appropriate, identify dependencies and setup steps, and avoid fabricated APIs. When web research is enabled, search for current authoritative sources, compare evidence, and cite links; never invent citations. State uncertainty honestly. Keep formatting readable on a phone. '+String(body.context||'').slice(0,1200);
  const payload={model:env.OPENAI_MODEL||'gpt-6-astra',instructions,input:[...history,{role:'user',content:[{type:'input_text',text:message}]}],max_output_tokens:4200};
  if(body.research===true) payload.tools=[{type:'web_search'}];
  let upstream;try{upstream=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'authorization':'Bearer '+env.OPENAI_API_KEY,'content-type':'application/json'},body:JSON.stringify(payload)})}catch{return json({error:'Could not reach the OpenAI API. Check the Worker network.'},502,headers)}
  const data=await upstream.json().catch(()=>({}));if(!upstream.ok)return json({error:(data.error&&data.error.message)||('OpenAI API error '+upstream.status)},upstream.status,headers);
  const text=outputText(data);if(!text)return json({error:'OpenAI returned no text. Please try again.'},502,headers);
  return json({text,sources:collectSources(data)},200,headers);
 }
};
