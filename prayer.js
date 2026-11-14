(function(){
const rd=x=>x*Math.PI/180,fh=h=>((h%24)+24)%24;
const PM={mwl:['Muslim World League',18,17],isna:['ISNA (North America)',15,15],egypt:['Egyptian Authority',19.5,17.5],makkah:['Umm al-Qura (Makkah)',18.5,'90'],karachi:['Karachi (Univ. of Islamic Sciences)',18,18]};
const CITIES={'Makkah':[21.4225,39.8262],'Madinah':[24.4686,39.6142],'Riyadh':[24.7136,46.6753],'Dubai':[25.2048,55.2708],'Hyderabad (IN)':[17.385,78.4867],'Mumbai':[19.076,72.8777],'Delhi':[28.6139,77.209],'Chennai':[13.0827,80.2707],'Kolkata':[22.5726,88.3639],'Bengaluru':[12.9716,77.5946],'Dhaka':[23.8103,90.4125],'Karachi':[24.8607,67.0011],'Lahore':[31.5204,74.3587],'Istanbul':[41.0082,28.9784],'Cairo':[30.0444,31.2357],'Kuala Lumpur':[3.139,101.6869],'Jakarta':[-6.2088,106.8456],'London':[51.5072,-0.1276],'New York':[40.7128,-74.006]};
const NAMES=['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'];
function calc(date,lat,lng,mk,hf){
 const jd=Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())/864e5+2440587.5-lng/360,D=jd-2451545,g=(357.529+0.98560028*D)%360,q=(280.459+0.98564736*D)%360,
 L=(q+1.915*Math.sin(rd(g))+0.02*Math.sin(rd(2*g)))%360,e=23.439-3.6e-7*D,
 RA=fh(Math.atan2(Math.cos(rd(e))*Math.sin(rd(L)),Math.cos(rd(L)))*180/Math.PI/15),dec=Math.asin(Math.sin(rd(e))*Math.sin(rd(L)))*180/Math.PI;
 let eqt=q/15-RA;eqt=((eqt+12)%24+24)%24-12;
 const noon=12-date.getTimezoneOffset()/60-lng/15-eqt;
 const A=(a,ccw)=>{const c=(-Math.sin(rd(a))-Math.sin(rd(dec))*Math.sin(rd(lat)))/(Math.cos(rd(dec))*Math.cos(rd(lat)));if(!(c>=-1&&c<=1))return NaN;const t=Math.acos(c)*180/Math.PI/15;return ccw?noon-t:noon+t};
 const m=PM[mk]||PM.mwl,asrA=-Math.atan(1/((hf?2:1)+Math.tan(rd(Math.abs(lat-dec)))))*180/Math.PI,ss=A(0.833,false);
 const o={Fajr:A(m[1],true),Sunrise:A(0.833,true),Dhuhr:noon+2/60,Asr:A(asrA,false),Maghrib:ss,Isha:m[2]==='90'?ss+1.5:A(m[2],false)};
 for(const k in o){const v=o[k];o[k]=isNaN(v)?'':pad(Math.floor(Math.round(fh(v)*60)%1440/60))+':'+pad(Math.round(fh(v)*60)%60)}return o}
const SS=()=>S.set,LOC=()=>SS().loc;
function times(d){const l=LOC();return l?calc(d,l.lat,l.lng,SS().pm||'mwl',SS().hanafi):null}
function syncPrayers(){const t=times(new Date());if(!t)return;let ch=0;S.acts.forEach(a=>{if(a.cat==='prayer'&&t[a.name]&&a.s!==t[a.name]){a.s=t[a.name];ch=1}});save();if(ch)try{nativeSync(false)}catch(e){}}
function nextPrayer(){const n=new Date(),t=times(n);if(!t)return null;const nowM=n.getHours()*60+n.getMinutes()+n.getSeconds()/60;
 for(const k of ['Fajr','Dhuhr','Asr','Maghrib','Isha'])if(t[k]&&mm(t[k])>nowM)return{name:k,time:t[k],left:(mm(t[k])-nowM)*60};
 const tm=times(new Date(n.getTime()+864e5));return tm&&tm.Fajr?{name:'Fajr',time:tm.Fajr,left:(1440+mm(tm.Fajr)-nowM)*60}:null}
const cd=s=>{s=Math.max(0,Math.floor(s));return pad(Math.floor(s/3600))+':'+pad(Math.floor(s%3600/60))+':'+pad(s%60)};
function hijri(d){try{return new Intl.DateTimeFormat('en-u-ca-islamic-umalqura',{day:'numeric',month:'long',year:'numeric'}).format(d)}catch(e){return''}}
function qibla(){const l=LOC();if(!l)return'';const a=rd(l.lat),b=rd(21.4225),dl=rd(39.8262-l.lng);return Math.round((Math.atan2(Math.sin(dl),Math.cos(a)*Math.tan(b)-Math.sin(a)*Math.cos(dl))*180/Math.PI+360)%360)}
window.prayerMini=function(){const n=nextPrayer();if(!n)return'<div class="card glow" onclick="tab(\'prayer\')"><b>🕌 Prayer times</b><div class="sub">Tap to set your location for automatic prayer times →</div></div>';return'<div class="card glow" onclick="tab(\'prayer\')"><div class="bar"><div><div class="sub">NEXT PRAYER</div><b style="font-size:20px">🕌 '+n.name+' · '+f12(n.time)+'</b></div><div class="bigmini" data-pcd>'+cd(n.left)+'</div></div></div>'};
window.setLoc=function(v){const c=CITIES[v];if(c){SS().loc={lat:c[0],lng:c[1],name:v};syncPrayers();render()}};
window.setManual=function(){const la=parseFloat($('#plat').value),ln=parseFloat($('#plng').value);if(isNaN(la)||isNaN(ln)||Math.abs(la)>90||Math.abs(ln)>180){alert('Enter valid latitude (-90..90) and longitude (-180..180).');return}SS().loc={lat:la,lng:ln,name:'Custom'};syncPrayers();render()};
window.locate=function(){if(!navigator.geolocation){alert('Location is not available. Pick a city instead.');return}navigator.geolocation.getCurrentPosition(p=>{SS().loc={lat:+p.coords.latitude.toFixed(4),lng:+p.coords.longitude.toFixed(4),name:'My location'};syncPrayers();render()},e=>alert('Could not get location ('+e.message+'). Allow location permission or pick a city below.'),{timeout:15000,maximumAge:36e5})};
window.pSet=function(k,v){SS()[k]=v;if(SS().loc)syncPrayers();render()};
window.prayerView=function(){const l=LOC(),t=times(new Date()),n=nextPrayer(),E=t?prayerEnds(new Date(),t):{};
 if(!l&&!window._pAsk){window._pAsk=1;setTimeout(locate,400)}
 let h='<div class="hero"><div class="sub">'+esc(hijri(new Date()))+'</div><h1 style="font-size:26px">'+(n?'🕌 '+n.name+' at '+f12(n.time):'🕌 Prayer times')+'</h1>'+(n?'<div class="bigtime" data-pcd>'+cd(n.left)+'</div>':'<p>Allow location or choose a city to see automatic prayer times.</p>')+curP(t,E)+(l?'<div class="sub">📍 '+esc(l.name)+' · Qibla '+qibla()+'° from North</div>':'')+'</div>';
 h+='<div class="card"><b>📍 Location & method</b><div class="acts"><button class="b p" onclick="locate()">Use my location</button></div><label>Or choose a city<select onchange="setLoc(this.value)"><option value="">Select…</option>'+Object.keys(CITIES).map(c=>'<option'+(l&&l.name===c?' selected':'')+'>'+c+'</option>').join('')+'</select></label><div class="acts"><input id="plat" placeholder="Latitude" value="'+(l?l.lat:'')+'" style="flex:1"><input id="plng" placeholder="Longitude" value="'+(l?l.lng:'')+'" style="flex:1"><button class="b" onclick="setManual()">Set</button></div><label>Calculation method<select onchange="pSet(\'pm\',this.value)">'+Object.keys(PM).map(k=>'<option value="'+k+'"'+((SS().pm||'mwl')===k?' selected':'')+'>'+PM[k][0]+'</option>').join('')+'</select></label><label style="display:flex;gap:8px;align-items:center"><input type="checkbox" style="width:auto" '+(SS().hanafi?'checked':'')+' onchange="pSet(\'hanafi\',this.checked)">Hanafi Asr (later Asr time)</label><div class="sub">Calculated on your phone, no internet needed. Your prayer reminders update automatically each time you open the app. Check against your local mosque timetable.</div></div>';
 if(t){h+='<div class="card"><b>Today · start → end</b>'+NAMES.map(k=>'<div class="row'+(n&&n.name===k?' nx':'')+'"><span>'+(k==='Sunrise'?'🌅':'🕌')+' '+k+'</span><b>'+f12(t[k])+(E[k]?' → '+f12(E[k]):'')+'</b></div>').join('')+'<div class="sub">Each prayer ends when the next begins (Fajr ends at sunrise, Isha at Islamic midnight).</div><div class="acts"><button class="b p" onclick="syncPrayers();alert(\'Prayer reminders updated.\')">Sync to my routine</button></div></div>';
 h+='<div class="card"><b>30-day timetable</b><div class="wk"><table><tr><th>Date</th>'+NAMES.map(k=>'<th>'+k.slice(0,4)+'</th>').join('')+'</tr>';
 for(let i=0;i<30;i++){const d=new Date();d.setDate(d.getDate()+i);const x=times(d);h+='<tr'+(i?'':' class="nx"')+'><td class="n">'+d.toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short'})+'</td>'+NAMES.map(k=>'<td>'+f12(x[k]).replace(' ','<br>')+'</td>').join('')+'</tr>'}
 h+='</table></div></div>'}return h};
// ---------- AI (on-device smart assistant) ----------
const QUOTES=['Small steps every day beat big bursts once a month.','Start with 10 minutes. Starting is the hardest part.','Consistency makes you unstoppable.','One focused hour is worth three distracted ones.','Rest is part of the plan, not a break from it.','Your future self is cheering for this session.','Progress, not perfection.'];
function week7(){const o=[];for(let i=0;i<7;i++){const d=new Date();d.setDate(d.getDate()-i);o.push(dayStats(ymd(d)))}return o}
function subjMins(){const m={};week7().forEach(s=>{for(const k in s.subj)m[k]=(m[k]||0)+s.subj[k]});return m}
function insights(){const w=week7(),act=w.filter(x=>x.tot),avg=act.length?Math.round(act.reduce((a,x)=>a+x.pct,0)/act.length):0,st=w.reduce((a,x)=>a+x.study,0),pr=w.reduce((a,x)=>a+x.pr,0),prT=w.reduce((a,x)=>a+x.prT,0),sm=subjMins(),ks=Object.keys(sm).sort((a,b)=>sm[a]-sm[b]),L=[];
 L.push('📈 Average completion this week: <b>'+avg+'%</b>'+(avg>=80?' – excellent!':avg>=50?' – good, push a little more.':' – try fewer, smaller tasks per day.'));
 L.push('📚 Study time (7 days): <b>'+dur(st)+'</b>'+(ks.length?'. Most-studied: <b>'+esc(ks[ks.length-1])+'</b>'+(ks.length>1?'; needs more time: <b>'+esc(ks[0])+'</b>':''):'. Start a focus session to track it.'));
 if(prT)L.push('🕌 Prayers on time: <b>'+pr+'/'+prT+'</b>'+(pr/prT>=.9?' – ماشاءالله, keep it up!':' – set reminders and keep them with your study blocks.'));
 const h=new Date().getHours();L.push(h>=22||h<4?'😴 It is late – sleep now so tomorrow\'s focus is sharper.':h<12?'🌤 Mornings are great for your hardest subject.':'🌙 Evening: review today\'s notes for 15 minutes.');return L}
function plan(){const now=new Date(),busy=items(today).filter(x=>x.r.st!=='resched').map(x=>{const s=mm(x.s),e=x.e?mm(x.e):s+30,p=(x.r.rc||x.a.cat)==='prayer';return[s-(p?10:0),e+(p?20:0)]});
 const sm=subjMins(),names=[...new Set(S.acts.filter(a=>a.cat==='study').map(a=>a.name.replace(/^Study\s+/i,'')))];if(!names.length)names.push('Revision','Homework');names.sort((a,b)=>(sm['Study '+a]||sm[a]||0)-(sm['Study '+b]||sm[b]||0));
 let t=Math.max(7*60,Math.ceil((now.getHours()*60+now.getMinutes()+10)/5)*5),out=[],i=0;
 while(t+45<=22*60&&out.length<4){if(!busy.some(b=>t<b[1]&&t+45>b[0])){out.push({name:'Study '+names[i++%names.length],s:pad(Math.floor(t/60))+':'+pad(t%60),e:pad(Math.floor((t+45)/60))+':'+pad((t+45)%60)});t+=55}else t+=5}return out}
window.aiPlan=function(){const p=plan();window._plan=p;$('#aiOut').innerHTML=p.length?'<div class="card"><b>✨ Suggested study blocks</b><div class="sub">Placed around your prayers and meals, weakest subject first.</div>'+p.map(x=>'<div class="row"><span>📚 '+esc(x.name)+'</span><b>'+f12(x.s)+' – '+f12(x.e)+'</b></div>').join('')+'<div class="acts"><button class="b p" onclick="aiAdd()">Add to today</button></div></div>':'<div class="card">No free 45-minute gaps left today. Try tomorrow! 🌙</div>'};
window.aiAdd=function(){(window._plan||[]).forEach((x,i)=>S.acts.push({id:'p'+Date.now()+i,name:x.name,cat:'study',date:today,s:x.s,e:x.e,rem:5,rep:[],pri:'normal',notes:'AI planned'}));window._plan=[];try{nativeSync(false)}catch(e){}tab('today')};
let reply=function(q){q=q.toLowerCase();const n=nextPrayer();
 if(/pray|salah|namaz|azan|adhan/.test(q))return n?'Next prayer is <b>'+n.name+'</b> at <b>'+f12(n.time)+'</b> (in '+cd(n.left)+'). I schedule study blocks around it.':'Set your location in the Prayer tab and I will track prayer times for you.';
 if(/plan|schedule|timetable/.test(q)){aiPlan();return'Here is a plan for your free time today 👇'}
 if(/tired|sleep|sleepy|lazy/.test(q))return'Try a 5-minute walk and water, then one 15-minute focus sprint. If it is very late, sleeping is the best study tool.';
 if(/exam|test|revis/.test(q))return'Exam plan: 1) list topics by difficulty, 2) hardest first in the morning, 3) revise at 1 day, 3 days and 7 days, 4) finish with past questions. Use the planner button for today\'s blocks.';
 if(/focus|distract|phone|concentrat/.test(q))return'Use the Focus timer: phone away, 25 minutes, 5-minute break. Rain sound helps many students.';
 if(/sad|stress|anx|worry|scared|demotiv|motiv/.test(q))return'It is okay to feel this way. Pick the smallest task, do 10 minutes, then reassess. Talk to a parent or teacher you trust if it feels heavy. '+QUOTES[new Date().getDate()%QUOTES.length];
 const i=insights();return'Quick check-in: '+i[0]+'. Ask me about prayer times, exams, focus, tiredness, or tap Plan my day.'}
window.aiAsk=function(){const el=$('#aiQ'),q=el.value.trim();if(!q)return;const c=$('#aiChat');c.innerHTML+='<div class="msg me">'+esc(q)+'</div>';const r=reply(q);c.innerHTML+='<div class="msg bot">'+r+'</div>';el.value='';c.scrollTop=c.scrollHeight};
window.aiView=function(){return'<div class="hero"><div class="sub">SMART ASSISTANT</div><h1 style="font-size:26px">✨ AI study hub</h1><p>'+QUOTES[new Date().getDate()%QUOTES.length]+'</p><div class="acts"><button class="b" onclick="tab(\'study\')">🎯 Exam plan</button><button class="b" onclick="startFocus()">🎧 Start focus</button><button class="b" onclick="tab(\'tutor\')">🎓 AI Tutor</button><button class="b" onclick="tomorrowPlanner()">📅 Plan tomorrow & class</button></div></div><div id="aiOut"></div><div class="card"><b>📊 Smart insights</b>'+insights().map(x=>'<div class="ins">'+x+'</div>').join('')+'<div class="sub">Runs on your phone from your own data. Nothing is sent online.</div></div>'};

// ---------- Tomorrow planner (after Sleep) ----------
const tmr=()=>{const d=new Date();d.setDate(d.getDate()+1);return d};
const hm=m=>pad(Math.floor(m/60))+':'+pad(m%60);
window.tomorrowPlanner=function(){const T=ymd(tmr()),L=SS().lastClass||{};
 modal('🌙 Your plan for tomorrow',[{k:'cls',l:'Do you have class tomorrow?',t:'select',o:[['y','Yes, I have class'],['n','No class']],v:L.cls||'y'},{k:'cs',l:'Class starts at',t:'time',v:L.cs||'09:00'},{k:'ce',l:'Class ends at',t:'time',v:L.ce||'15:00'},{k:'ex',l:'Exam / test coming? (subject, optional)',v:''},{k:'ot',l:'Any other plan? e.g. "football 5pm" (optional)',v:''},{k:'hrs',l:'Study time you want',t:'select',o:[['1','1 hour'],['2','2 hours'],['3','3 hours'],['4','4 hours']],v:L.hrs||'2'}],v=>{
  if(v.cls==='y'&&(!v.cs||!v.ce||mm(v.ce)<=mm(v.cs))){alert('Please enter valid class start and end times.');return false}
  SS().lastClass={cls:v.cls,cs:v.cs,ce:v.ce,hrs:v.hrs};
  S.acts=S.acts.filter(a=>!(a.date===T&&a.notes&&a.notes.indexOf('AI planned')===0));
  const busy=items(T).map(x=>{const s=mm(x.s),e=x.e?mm(x.e):s+30,p=(x.r.rc||x.a.cat)==='prayer';return[s-(p?10:0),e+(p?20:0)]}),made=[];
  const add=(name,cat,s,e,rem)=>{S.acts.push({id:'t'+Date.now()+made.length,name,cat,date:T,s:hm(s),e:hm(e),rem,rep:[],pri:'normal',notes:'AI planned for tomorrow'});made.push(name+' '+f12(hm(s)))};
  const free=(s,d)=>!busy.some(b=>s<b[1]&&s+d>b[0]);
  const place=(d,from,to)=>{for(let t=from;t+d<=to;t+=5)if(free(t,d)){busy.push([t,t+d]);return t}return -1};
  let cs=0,ce=0;
  if(v.cls==='y'){cs=mm(v.cs);ce=mm(v.ce);busy.push([cs-30,ce+20]);add('Class','class',cs,ce,30);
    const rv=cs-45;if(rv>=300&&free(rv,25)){busy.push([rv,rv+25]);add('Quick revision before class','study',rv,rv+25,5)}}
  const ot=v.ot.trim();if(ot){const m=ot.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);let t=-1;if(m){let hh=+m[1];const mi=+(m[2]||0),ap=(m[3]||'').toLowerCase();if(ap==='pm'&&hh<12)hh+=12;if(ap==='am'&&hh===12)hh=0;if(!ap&&hh<7)hh+=12;if(hh<24&&mi<60){t=hh*60+mi;if(free(t,60))busy.push([t,t+60]);else t=-1}}
    if(t<0)t=place(60,16*60,21*60);if(t>=0)add(ot.replace(/\s*\d{1,2}(:\d{2})?\s*(am|pm)?\s*$/i,'')||ot,'personal',t,t+60,10)}
  const names=[...new Set(S.acts.filter(a=>a.cat==='study'&&!(a.notes||'').startsWith('AI planned')).map(a=>a.name.replace(/^Study\s+/i,'')))];if(!names.length)names.push('Revision');
  const sm=subjMins();names.sort((a,b)=>(sm['Study '+a]||sm[a]||0)-(sm['Study '+b]||sm[b]||0));
  const ex=v.ex.trim();const q=[];if(ex)q.push(ex);const blocks=Math.max(1,Math.round(+v.hrs*60/45));
  if(v.cls==='y')q.unshift('Homework & class notes');let i=0;while(q.length<blocks)q.push(names[i++%names.length]);
  const start0=v.cls==='y'?ce+30:7*60+30;let first=true;
  q.slice(0,blocks).forEach(n=>{let t=place(45,start0,22*60);if(t<0)t=place(45,7*60,22*60);if(t>=0)add((/^Homework/.test(n)?'':'Study ')+n+(ex&&n===ex?' (exam prep)':''),'study',t,t+45,5)});
  save();try{nativeSync(false)}catch(e){}
  cur=T;view='today';render();alert('Tomorrow is planned ✨\n\n'+made.join('\n')+'\n\nSleep well. Change anything with the ✏ button.');
 },'Make my plan')};
const _act=window.act;window.act=function(k,id){_act(k,id);const a=S.acts.find(x=>x.id===id);if(a&&a.cat==='sleep'&&!/wake/i.test(a.name)&&['start','done','late'].includes(k)&&R(cur,id).st!=='todo'&&false)0};
const _pm=window.prayerMini;window.prayerMini=function(){const T=ymd(tmr()),planned=S.acts.some(a=>a.date===T&&(a.notes||'').indexOf('AI planned')===0);return _pm()};
const _rp=reply;reply=function(q){return /tomorrow|class/i.test(q)?(setTimeout(tomorrowPlanner,200),'Let\'s plan tomorrow 🌙 – fill in your class time in the form.'):_rp(q)};
const _set=window.settings;window.settings=function(){return _set()+'<div class="card"><b>🔒 Strict focus</b><label style="display:flex;gap:8px;align-items:center"><input type="checkbox" style="width:auto" '+(S.set.pin!==false?'checked':'')+' onchange="S.set.pin=this.checked;save()">Pin this app during focus timer (blocks other apps, no risky permission)</label><div class="sub">Android will ask to pin the app when the timer starts. Unpin by holding Back + Overview, or finish the timer.</div></div>'};

const _pm2=window.prayerMini;window.prayerMini=function(){return _pm2()};
(function(){const t=document.querySelector('.tab'),bs=t.querySelectorAll('button');if(bs[2]&&!t.querySelector('.sp')){const s=document.createElement('div');s.className='sp';t.insertBefore(s,bs[2])}})();
window.addEventListener('error',e=>{let t=document.getElementById('toast');if(!t){t=document.createElement('div');t.id='toast';document.body.appendChild(t)}t.textContent='⚠ '+(e.message||'Error')+(e.lineno?' (line '+e.lineno+')':'');clearTimeout(window._tt);window._tt=setTimeout(()=>t.remove(),6000)});
if(S.set.tv4!==1){S.set.tv4=1;save()}
if(!S.set.welcomed)(function sw(){if(document.getElementById('boot'))return setTimeout(sw,300);const w=document.createElement('div');w.id='wel';w.innerHTML='<div class="wc"><div class="ill"><svg viewBox="0 0 220 190" width="190"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7c5cff"/><stop offset="1" stop-color="#19c3a6"/></linearGradient></defs><circle cx="110" cy="95" r="70" fill="#fff" opacity=".6"/><path d="M128 40a52 52 0 1 0 28 88 42 42 0 1 1-28-88z" fill="url(#g1)"/><rect x="48" y="118" width="124" height="46" rx="10" fill="#fff"/><path d="M110 118v46" stroke="#cfc6f7" stroke-width="3"/><rect x="58" y="128" width="42" height="5" rx="2.5" fill="#cfc6f7"/><rect x="58" y="140" width="34" height="5" rx="2.5" fill="#cfc6f7"/><rect x="120" y="128" width="42" height="5" rx="2.5" fill="#d9f2ec"/><rect x="120" y="140" width="30" height="5" rx="2.5" fill="#d9f2ec"/><circle cx="170" cy="46" r="5" fill="#f6c453"/><circle cx="52" cy="70" r="4" fill="#f6c453"/></svg></div><h2>Build your best day</h2><p>Prayer, study, sleep and meals in one calm place. Small habits every day make a strong routine.</p><button onclick="S.set.welcomed=1;save();document.getElementById(\'wel\').remove()">Get Started</button></div>';document.body.appendChild(w)})();

// ---------- Boot intro (video) ----------
(function(){const b=document.createElement('div');b.id='boot';b.innerHTML='<canvas id="bc"></canvas><div class="bw"><div class="bl">📚</div><h1>Daily Routine<br>Tracker</h1><div class="bt">PRAYER · STUDY · FOCUS</div><div class="bp"><i></i></div></div>';document.body.appendChild(b);
 const c=b.querySelector('canvas'),x=c.getContext('2d');c.width=innerWidth;c.height=innerHeight;const P=Array.from({length:70},()=>({x:Math.random()*c.width,y:Math.random()*c.height,r:Math.random()*2+.4,v:Math.random()*.6+.2}));let go=1;
 (function f(){if(!go)return;x.clearRect(0,0,c.width,c.height);P.forEach(p=>{p.y-=p.v;if(p.y<0)p.y=c.height;x.fillStyle='rgba(255,230,160,'+(.3+p.r/4)+')';x.beginPath();x.arc(p.x,p.y,p.r,0,7);x.fill()});requestAnimationFrame(f)})();
 const end=()=>{go=0;b.classList.add('out');setTimeout(()=>b.remove(),700)};
 const v=document.createElement('video');v.src='intro.mp4';v.muted=true;v.setAttribute('playsinline','');v.autoplay=true;v.className='iv';let tm=setTimeout(end,2800);v.onerror=()=>v.remove();v.onplaying=()=>{clearTimeout(tm);tm=setTimeout(end,7000)};v.onended=end;b.appendChild(v);
 const sk=document.createElement('button');sk.className='skip';sk.textContent='Skip ›';sk.onclick=end;b.appendChild(sk);try{const pp=v.play();pp&&pp.catch&&pp.catch(()=>{})}catch(e){}})();
// ---------- Real AI tutor (own API key) ----------
const mdw=t=>esc(t).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/^#+\s*(.+)$/gm,'<b>$1</b>').replace(/\n/g,'<br>');
async function aiCall(system,user,max){const endpoint=String(S.set.openAiEndpoint||'').trim().replace(/\/+$/,'');if(!endpoint)throw new Error('Set the secure OpenAI Worker URL in Settings first.');const r=await fetch(endpoint+'/api/chat',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({message:user,history:[],research:false,context:system})});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||('AI service error '+r.status));return j.text||''}
window.tutorProv=function(v){S.set.aiProv=v;save();render()};
window.tutorKey=function(){const pv=$('#tprov').value,k=$('#tk').value.trim(),m=$('#tm').value.trim();S.set.aiProv=pv;if(pv==='gemini'){if(k)S.set.gKey=k;S.set.gModel=m||'gemini-3.5-flash'}else{if(k)S.set.aiKey=k;S.set.aiModel=m||'claude-sonnet-5-5'}save();alert('Saved ✓');render()};
window.tutorGo=async function(mode){const q=$('#tq').value.trim(),o=$('#tout');if(!q){alert('Type a topic, question or paste your notes first.');return}
 o.innerHTML='<div class="card">⏳ Thinking…</div>';
 try{
  if(mode==='quiz'){const t=await aiCall('Reply with ONLY a JSON array of 5 multiple-choice questions, no other text: [{"q":"...","o":["A","B","C","D"],"a":0,"why":"short reason"}] where a is the index of the correct option.','Make a quiz on: '+q,1800);
   const m=t.match(/\[[\s\S]*\]/);window._qz={q:JSON.parse(m[0]),i:0,s:0};return quizShow()}
  const sys={explain:'Explain the topic step by step with a simple example, then give a 2-line recap.',sum:'Summarize the notes into short bullet points with key terms in bold, then list 3 likely exam questions.',plan:'Today is '+today+'. Make a day-by-day revision timetable up to the exam, balancing the subjects mentioned, with short daily goals. Keep it compact.'}[mode];
  const t=await aiCall(sys,q,mode==='plan'?2000:1500);o.innerHTML='<div class="card aiout">'+mdw(t)+'</div>'}
 catch(e){o.innerHTML='<div class="card">⚠ '+esc(e.message||String(e))+'<div class="sub">Check your key, internet and model name.</div></div>'}};
window.quizShow=function(){const z=window._qz,o=$('#tout');if(z.i>=z.q.length){o.innerHTML='<div class="card"><b>🏁 Score: '+z.s+' / '+z.q.length+'</b><div class="sub">'+(z.s>=4?'Excellent!':z.s>=3?'Good, review the ones you missed.':'Keep practising, try Explain on this topic.')+'</div></div>';return}
 const k=z.q[z.i];o.innerHTML='<div class="card"><div class="sub">Question '+(z.i+1)+' of '+z.q.length+'</div><b>'+esc(k.q)+'</b>'+k.o.map((t,j)=>'<button class="opt" onclick="quizPick('+j+')">'+esc(t)+'</button>').join('')+'<div id="qw"></div></div>'};
window.quizPick=function(j){const z=window._qz,k=z.q[z.i],bs=document.querySelectorAll('.opt');bs.forEach((b,n)=>{b.disabled=true;if(n===k.a)b.classList.add('ok');else if(n===j)b.classList.add('no')});if(j===k.a)z.s++;$('#qw').innerHTML='<p>'+(j===k.a?'✅ Correct! ':'❌ Not quite. ')+esc(k.why||'')+'</p><button class="b p" onclick="_qz.i++;quizShow()">Next →</button>'};
window.tutorView=function(){const pv=S.set.aiProv||'gemini',has=pv==='gemini'?!!S.set.gKey:!!S.set.aiKey,mv=pv==='gemini'?(S.set.gModel||'gemini-3.5-flash'):(S.set.aiModel||'claude-sonnet-5-5');return'<div class="hero"><div class="sub">REAL AI</div><h1>🎓 AI Tutor</h1><p>Ask anything about your subjects.</p></div><div class="card"><textarea id="tq" class="tq" placeholder="Type a topic, a question, your notes, or exam date + subjects…"></textarea><div class="acts"><button class="b p" onclick="tutorGo(\'explain\')">💡 Explain</button><button class="b" onclick="tutorGo(\'quiz\')">📝 Quiz me</button><button class="b" onclick="tutorGo(\'sum\')">📄 Summarize</button><button class="b" onclick="tutorGo(\'plan\')">📅 Study plan</button></div></div><div id="tout"></div><div class="card"><b>🔑 AI settings '+(has?'✓':'')+'</b><label>AI provider<select id="tprov" onchange="tutorProv(this.value)"><option value="gemini"'+(pv==='gemini'?' selected':'')+'>Gemini (free key, no billing)</option><option value="claude"'+(pv==='claude'?' selected':'')+'>Claude (paid key)</option></select></label><label>API key<input id="tk" type="password" placeholder="'+(has?'saved (type to replace)':pv==='gemini'?'AIza…':'sk-ant-…')+'"></label><label>Model<input id="tm" value="'+esc(mv)+'"></label><div class="acts"><button class="b p" onclick="tutorKey()">Save</button></div><div class="sub">'+(pv==='gemini'?'Get a free key at aistudio.google.com → Get API key. No card needed. Free-tier limits apply, and on the free tier Google may use your prompts to improve its models, so do not type private information.':'Get a key at console.anthropic.com (needs billing credit).')+' Your key stays on this phone. Do not share the APK with your key inside.</div></div>'};

// ---------- Exam-focused study plan (adjustable, auto at 9 PM) ----------
if(!S.set.autoRemoved){S.acts=S.acts.filter(a=>!a.autoStudy&&!(a.name==='Study Biology'&&a.cat==='study'&&a.s==='09:00'&&a.e==='10:00'&&!a.planAuto));S.set.autoRemoved=1;save()}
const daysTo=(a,b)=>Math.round((new Date(b+'T00:00:00')-new Date(a+'T00:00:00'))/864e5);
const phase=d=>d<=1?'Final revision':d<=3?'Revise':d<=14?'Practice':'Learn';
function planSubs(T){const ex=(S.set.exams||[]).map(e=>({s:e.subject,d:daysTo(T,e.date)})).filter(e=>e.d>=1);
 if(ex.length)return ex.map(e=>({s:e.s,d:e.d,w:1/(e.d+1)}));
 const sm=subjMins();return subjectsForProfile().slice().sort((a,b)=>(sm['Study '+a]||sm[a]||0)-(sm['Study '+b]||sm[b]||0)).map(s=>({s,d:null,w:1}))}
function genPlan(T,auto){
 if(auto&&items(T).some(x=>(x.r.rc||x.a.cat)==='study'&&!x.a.planAuto))return[];
 S.acts=S.acts.filter(a=>!(a.planAuto&&a.date===T&&!a.planEdited&&!DONEST.includes(R(T,a.id).st)));
 const subs=planSubs(T);if(!subs.length)return[];
 const n=Math.max(1,Math.min(8,Math.round((+S.set.planHours||2)*60/45))),W=subs.reduce((a,x)=>a+x.w,0);
 const al=subs.map(x=>({s:x.s,d:x.d,w:x.w,n:Math.floor(n*x.w/W),r:(n*x.w/W)%1}));let left=n-al.reduce((a,x)=>a+x.n,0);
 al.slice().sort((a,b)=>b.r-a.r).forEach(x=>{if(left>0){x.n++;left--}});
 al.sort((a,b)=>(a.d==null?99:a.d)-(b.d==null?99:b.d));
 if(al[0]&&al[0].n===0){al[0].n=1;const m=al.reduce((m,x)=>x.n>m.n?x:m,al[0]);if(m!==al[0]&&m.n>1)m.n--}
 const seq=[];while(seq.length<n&&al.some(x=>x.n>0))al.forEach(x=>{if(x.n>0){seq.push({s:x.s,d:x.d});x.n--}});
 const busy=items(T).map(x=>{const s=mm(x.s),p=(x.r.rc||x.a.cat)==='prayer',e=x.e?mm(x.e):s+(p?15:30);return[s-(p?5:0),e+(p?5:0)]}),made=[];
 const free=(s,d)=>!busy.some(b=>s<b[1]&&s+d>b[0]);
 const place=(d,from,to)=>{for(let t=from;t+d<=to;t+=5)if(free(t,d)){busy.push([t,t+d]);return t}return -1};
 const st=mm(S.set.planStart||'16:00');
 seq.forEach((x,i)=>{let t=place(45,st,22*60);if(t<0)t=place(45,6*60+30,22*60);if(t<0)return;
  const name=x.d!=null?'Study '+x.s+' · '+phase(x.d)+' ('+x.d+' day'+(x.d>1?'s':'')+' to exam)':'Study '+x.s;
  S.acts.push({id:'sp'+Date.now()+i+Math.floor(Math.random()*999),name,cat:'study',date:T,s:hm(t),e:hm(t+45),rem:5,rep:[],pri:'normal',notes:'Auto study plan - you can change this',planAuto:true});made.push({name,s:hm(t),e:hm(t+45)})});
 return made}
function planReady(made){if(!made.length)return;const w=document.createElement('div');w.id='sgate';w.innerHTML='<div><div class="big">📅</div><h1>Tomorrow\'s study plan</h1><p>'+made.map(m=>esc(m.name)+'<br><b>'+f12(m.s)+' – '+f12(m.e)+'</b>').join('<br><br>')+'</p><button class="go" id="prOk">👍 Looks good</button><button class="lt" id="prAdj">✏ Adjust it</button></div>';document.body.appendChild(w);$('#prOk').onclick=()=>w.remove();$('#prAdj').onclick=()=>{w.remove();tab('study')}}
window.autoPlanCheck=function(){if(S.set.autoPlan===false)return;if(new Date().getHours()<21)return;if(document.getElementById('sgate')||document.getElementById('boot')||document.getElementById('wel')||document.querySelector('.ov'))return;
 const T=ymd(tmr());if(S.set.planGenFor===T)return;S.set.planGenFor=T;const made=genPlan(T,true);save();try{nativeSync(false)}catch(e){}if(made.length){planReady(made);if(view==='study'||view==='today')render()}};
setInterval(autoPlanCheck,30000);setTimeout(autoPlanCheck,4500);document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(autoPlanCheck,600)});
function examLine(){const ex=(S.set.exams||[]).map(e=>({s:e.subject,d:daysTo(today,e.date)})).filter(e=>e.d>=0).sort((a,b)=>a.d-b.d).slice(0,2);return ex.length?'<div class="card" onclick="tab(\'study\')">'+ex.map(e=>'🎯 <b>'+esc(e.s)+'</b> exam '+(e.d===0?'<b>today</b>':'in <b>'+e.d+' day'+(e.d>1?'s':'')+'</b>')).join('<br>')+'</div>':''}
window.examAdd=function(){modal('Add exam',[{k:'subject',l:'Subject',v:''},{k:'date',l:'Exam date',t:'date',v:ymd(tmr())}],v=>{if(!v.subject.trim()){alert('Enter the subject.');return false}if(!v.date||v.date<today){alert('Pick a future exam date.');return false}
 (S.set.exams=S.set.exams||[]).push({id:'ex'+Date.now(),subject:v.subject.trim(),date:v.date});save();render()},'Add exam')};
window.examDel=function(id){if(!confirm('Remove this exam?'))return;S.set.exams=(S.set.exams||[]).filter(e=>e.id!==id);save();render()};
window.planOpt=function(k,v){S.set[k]=k==='planHours'?+v:v;save();render()};
window.planNow=function(){const T=ymd(tmr()),m=genPlan(T,false);save();try{nativeSync(false)}catch(e){}alert(m.length?'Tomorrow planned: '+m.length+' study blocks.':'No free time found tomorrow. Check your activities.');render()};
window.examBuild=function(){const ex=(S.set.exams||[]).filter(e=>daysTo(today,e.date)>=1);if(!ex.length){alert('Add your exams first.');return}
 const last=ex.reduce((m,e)=>e.date>m?e.date:m,'0');let d=tmr(),c=0;while(ymd(d)<last&&c<80){c+=genPlan(ymd(d),false).length;d.setDate(d.getDate()+1)}
 S.set.planGenFor=ymd(tmr());save();try{nativeSync(false)}catch(e){}alert('Plan ready: '+c+' study blocks until your last exam. Tap any block to change or delete it.');render()};
window.blockModal=function(id,date){const a=id?S.acts.find(x=>x.id===id):null;if(id&&!a)return;const dt=a?a.date:date;
 const f=[{k:'name',l:'Subject / topic',v:a?a.name.replace(/^Study:?\s*/,''):''},{k:'date',l:'Date',t:'date',v:dt},{k:'s',l:'Start time',t:'time',v:a?a.s:nextFreeStart(dt,45)},{k:'e',l:'End time',t:'time',v:a?a.e:''}];
 if(a)f.push({k:'del',l:'Remove this block?',t:'select',o:[['n','No, keep it'],['y','Yes, delete it']],v:'n'});
 modal(a?'Edit study block':'New study block',f,v=>{if(a&&v.del==='y'){S.acts=S.acts.filter(x=>x.id!==a.id)}else{
  if(!v.name.trim()||!v.s){alert('Enter the subject and start time.');return false}
  const e=v.e||hm(mm(v.s)+45);if(mm(e)<=mm(v.s)){alert('End time must be after start time.');return false}
  const nm=a&&v.name.trim()===a.name.replace(/^Study:?\s*/,'')?a.name:'Study '+v.name.trim();
  if(a){Object.assign(a,{name:nm,date:v.date,s:v.s,e,planEdited:true})}else S.acts.push({id:'sb'+Date.now(),name:nm,cat:'study',date:v.date,s:v.s,e,rem:5,rep:[],pri:'normal',notes:'Study block',planAuto:true,planEdited:true})}
  save();try{nativeSync(false)}catch(e){}render()},a?'Save':'Add block')};
window.examCards=function(){const ex=(S.set.exams||[]).slice().sort((a,b)=>a.date<b.date?-1:1),hrs=+S.set.planHours||2;
 let h='<div class="card"><div class="bar"><h2>🎯 Exam plan</h2><button class="b p" onclick="examAdd()">+ Add exam</button></div>';
 h+=ex.length?ex.map(e=>{const d=daysTo(today,e.date);return'<div class="row"><span>'+esc(e.subject)+'<div class="sub">'+new Date(e.date+'T00:00:00').toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short'})+'</div></span><b style="color:'+(d>=0&&d<=3?'var(--bad)':'var(--ac)')+'">'+(d<0?'Finished':d===0?'Today!':d+' day'+(d>1?'s':'')+' left')+'</b><button class="chip" onclick="examDel(\''+e.id+'\')">🗑</button></div>'}).join(''):'<div class="empty">Add your exams with dates. The app then builds an exact day-by-day plan.</div>';
 h+='<label>Study time per day<select onchange="planOpt(\'planHours\',this.value)">'+[1,2,3,4,5].map(n=>'<option value="'+n+'"'+(hrs===n?' selected':'')+'>'+n+' hour'+(n>1?'s':'')+'</option>').join('')+'</select></label><label>Study starts around<input type="time" value="'+(S.set.planStart||'16:00')+'" onchange="planOpt(\'planStart\',this.value)"></label><label style="display:flex;gap:8px;align-items:center"><input type="checkbox" style="width:auto" '+(S.set.autoPlan!==false?'checked':'')+' onchange="planOpt(\'autoPlan\',this.checked)">Auto-plan tomorrow at 9:00 PM</label><div class="acts"><button class="b p" onclick="examBuild()">🧠 Build full exam plan</button><button class="b" onclick="planNow()">↻ Replan tomorrow</button></div><div class="sub">Closer exams get more time and the last days switch to revision. Tap any block below to change, move or delete it.</div></div>';
 let u='<div class="card"><div class="bar"><h2>📅 Study blocks</h2></div>';
 for(let i=0;i<8;i++){const d=new Date();d.setDate(d.getDate()+i);const ds=ymd(d),L=items(ds).filter(x=>(x.r.rc||x.a.cat)==='study');
  u+='<div class="bar" style="margin-top:10px"><b>'+(i===0?'Today':i===1?'Tomorrow':d.toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short'}))+'</b><button class="b" onclick="blockModal(null,\''+ds+'\')">+ Block</button></div>';
  u+=L.length?L.map(x=>'<div class="row" style="cursor:pointer" onclick="blockModal(\''+x.a.id+'\',\''+ds+'\')"><span>'+esc(x.r.rn||x.a.name)+'</span><b>'+({'done':'✓ Done','late':'🕐 Late'}[x.r.st]||f12(x.s)+(x.e?' – '+f12(x.e):''))+'</b></div>').join(''):'<div class="sub">No study blocks.</div>'}
 return h};

// ---------- v17: study timetable, focus-on-select, prayer ends ----------
const DN=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const sbase=n=>String(n).replace(/^Study:?\s*/i,'').split(' · ')[0];
const sshort=n=>sbase(n).replace(/\s+/g,'').slice(0,3).toUpperCase();
const shue=n=>{let x=0;for(const c of sbase(n))x=(x*31+c.charCodeAt(0))%360;return x};
function weekDates(){return[0,1,2,3,4,5,6].map(i=>{const d=new Date();d.setDate(d.getDate()+i);return ymd(d)})}
const isStudy=x=>(x.r.rc||x.a.cat)==='study'&&x.r.st!=='resched';
window.study=function(){const wd=weekDates(),cols=wd.map(ds=>items(ds).filter(isStudy)),keys={};
 cols.forEach(c=>c.forEach(x=>{keys[x.s+'|'+(x.e||'')]=1}));const rows=Object.keys(keys).sort((a,b)=>mm(a.split('|')[0])-mm(b.split('|')[0]));
 let h='<div class="hero"><div class="sub">STUDY TIMETABLE</div><h1 style="font-size:26px">📚 Your weekly study plan</h1><p>Add study blocks, then tap a block to start the full-screen focus timer.</p></div>';
 h+='<div class="card"><div class="bar"><h2>🗓 Timetable</h2><button class="b p" onclick="blockModal(null,\''+today+'\')">+ Add study block</button></div>';
 if(!rows.length)h+='<div class="empty">No study blocks yet. Tap “+ Add study block”, choose the subject, time and days (all days or only some), and your timetable appears here.</div>';
 else{h+='<div class="wk"><table class="tt"><tr><th></th>'+wd.map((ds,i)=>'<th class="'+(ds===today?'tn':'')+'">'+(ds===today?'Today':DN[(pd(ds).getDay()+6)%7])+'<small>'+ds.slice(8)+'</small></th>').join('')+'</tr>';
  rows.forEach(k=>{const[s,e]=k.split('|');h+='<tr><td class="tm">'+f12(s).replace(' ','<br>')+'</td>'+wd.map((ds,i)=>{const L=cols[i].filter(x=>x.s+'|'+(x.e||'')===k);return'<td class="'+(ds===today?'tn':'')+'">'+L.map(x=>'<button class="tc'+(['done','late'].includes(x.r.st)?' dn':'')+'" style="--h:'+shue(x.r.rn||x.a.name)+'" onclick="blockMenu(\''+x.a.id+'\',\''+ds+'\')">'+esc(sshort(x.r.rn||x.a.name))+'</button>').join('')+'</td>'}).join('')+'</tr>'});
  const seen={};cols.forEach(c=>c.forEach(x=>{seen[sbase(x.r.rn||x.a.name)]=1}));h+='</table></div><div style="display:flex;flex-wrap:wrap;gap:6px;margin:8px 0">'+Object.keys(seen).map(n=>'<span class="tc" style="--h:'+shue(n)+';width:auto;display:inline-block;padding:4px 8px">'+esc(sshort(n))+' = '+esc(n)+'</span>').join('')+'</div><div class="sub">Tap a block: start the focus timer, or edit it.</div>'}
 h+='</div>';
 const T=cols[wd.indexOf(today)]||[];
 h+='<div class="card"><b>⏱ Today’s study</b>'+(T.length?T.map(x=>'<div class="row"><span>'+esc(sbase(x.r.rn||x.a.name))+'<div class="sub">'+f12(x.s)+(x.e?' – '+f12(x.e):'')+(x.e?' · '+dur(mm(x.e)-mm(x.s)):'')+'</div></span>'+(['done','late'].includes(x.r.st)?'<b>✓ Done</b>':'<button class="b p" onclick="startStudyFocus(\''+x.a.id+'\',\''+today+'\')">▶ Focus</button>')+'</div>').join(''):'<div class="empty">No study planned today.</div>')+'</div>';
 return h+examCards()};
window.blockMenu=function(id,date){const a=S.acts.find(x=>x.id===id);if(!a)return;const x=items(date).find(y=>y.a.id===id)||{s:a.s,e:a.e,r:{}};
 const o=document.createElement('div');o.className='ov';o.innerHTML='<div class="mo"><h2>'+esc(sbase(x.r.rn||a.name))+'</h2><div class="sub">'+f12(x.s)+(x.e?' – '+f12(x.e):'')+' · '+(a.rep&&a.rep.length?(a.rep.length===7?'every day':a.rep.map(d=>DN[(d+6)%7]).sort((p,q)=>DN.indexOf(p)-DN.indexOf(q)).join(', ')):date)+'</div><div class="acts" style="flex-direction:column"><button class="b p" id="bmGo">▶ Start focus timer</button><button class="b" id="bmEd">✏ Edit time / days / delete</button><button class="b" id="bmX">Close</button></div></div>';
 document.body.appendChild(o);const c=()=>o.remove();$('#bmX').onclick=c;o.onclick=e=>{if(e.target===o)c()};$('#bmGo').onclick=()=>{c();startStudyFocus(id,date)};$('#bmEd').onclick=()=>{c();blockModal(id,date)}};
window.startStudyFocus=function(id,date){const a=S.acts.find(x=>x.id===id);if(!a)return;date=date||today;const x=items(date).find(y=>y.a.id===id)||{s:a.s,e:a.e,r:{}};
 let m=x.e?mm(x.e)-mm(x.s):0;if(!(m>0))m=+S.set.focusMinutes||25;
 try{if(date===today&&cur===today&&!['done','late','start'].includes((x.r||{}).st))act('start',id)}catch(e){}
 focusState.seconds=m*60;focusState.left=focusState.seconds;focusState.running=false;focusState.started=0;focusState.end=0;focusState.ambient=false;focusState.label='📚 '+sbase(x.r.rn||a.name);
 showFocus();toggleFocus()};
window.blockModal=function(id,date){const a=id?S.acts.find(x=>x.id===id):null;if(id&&!a)return;const dt=date||today;
 const s0=a?a.s:nextFreeStart(dt,45),e0=a?a.e:hm(Math.min(1439,mm(s0)+45));
 const f=[{k:'name',l:'Subject / topic',v:a?a.name.replace(/^Study:?\s*/,''):''},{k:'s',l:'Start time',t:'time',v:s0},{k:'e',l:'End time',t:'time',v:e0},{k:'rep',l:'Repeat on (all ticked = every day, none = only the date below)',t:'days',v:a?a.rep:[0,1,2,3,4,5,6]},{k:'date',l:'Date (when it starts, or the single day)',t:'date',v:a?a.date:dt}];
 if(a)f.push({k:'del',l:'Delete?',t:'select',o:[['n','No, keep it']].concat(a.rep&&a.rep.length?[['d','Only on '+dt],['y','The whole block (all days)']]:[['y','Yes, delete it']]),v:'n'});
 modal(a?'Edit study block':'New study block',f,v=>{
  if(a&&v.del==='y'){S.acts=S.acts.filter(x=>x.id!==a.id);save();try{nativeSync(false)}catch(e){}render();return}
  if(a&&v.del==='d'){(a.xd=a.xd||[]).push(dt);save();try{nativeSync(false)}catch(e){}render();return}
  if(!v.name.trim()||!v.s){alert('Enter the subject and start time.');return false}
  const e=v.e||hm(Math.min(1439,mm(v.s)+45));if(mm(e)<=mm(v.s)){alert('End time must be after the start time.');return false}
  const chk=v.rep&&v.rep.length?(v.rep.includes(pd(v.date||dt).getDay())?(v.date||dt):dt):(v.date||dt);
  const hit=items(chk).filter(x=>!a||x.a.id!==a.id).find(x=>mm(v.s)<(x.e?mm(x.e):mm(x.s)+30)&&mm(e)>mm(x.s));
  if(hit&&!confirm('This overlaps "'+(hit.r.rn||hit.a.name)+'" ('+f12(hit.s)+'). Keep your chosen time anyway?'))return false;
  const nm=a&&v.name.trim()===a.name.replace(/^Study:?\s*/,'')?a.name:'Study '+v.name.trim();
  if(a)Object.assign(a,{name:nm,s:v.s,e,rep:v.rep||[],date:v.date||a.date,planEdited:true});
  else S.acts.push({id:'sb'+Date.now(),name:nm,cat:'study',date:v.date||dt,s:v.s,e,rem:5,rep:v.rep||[],pri:'normal',notes:'Study block'});
  save();try{nativeSync(false)}catch(e){}render()},a?'Save':'Add block')};
window.prayerEnds=function(d,t){const n=new Date(d);n.setDate(n.getDate()+1);const t2=times(n)||{},E={Fajr:t.Sunrise,Dhuhr:t.Asr,Asr:t.Maghrib,Maghrib:t.Isha};
 if(t.Maghrib&&t2.Fajr){const m=mm(t.Maghrib),f=mm(t2.Fajr)+1440,mid=Math.round(m+(f-m)/2)%1440;E.Isha=pad(Math.floor(mid/60))+':'+pad(mid%60)}return E};
window.curP=function(t,E){if(!t)return'';const n=new Date(),now=n.getHours()*60+n.getMinutes();
 for(const k of['Fajr','Dhuhr','Asr','Maghrib','Isha']){if(!t[k]||!E[k])continue;const s=mm(t[k]);let e=mm(E[k]);if(e<=s)e+=1440;if(now>=s&&now<e)return'<div class="sub">⏳ '+k+' time ends at <b>'+f12(E[k])+'</b> (in '+dur(e-now)+')</div>'}return''};
function studyGateCheck(){if(['sgate','focusScreen','boot','wel'].some(i=>document.getElementById(i))||document.querySelector('.ov'))return;
 const n=new Date(),nm=n.getHours()*60+n.getMinutes();window._sgSeen=window._sgSeen||{};
 const x=items(today).find(y=>isStudy(y)&&!['done','late','skip','start'].includes(y.r.st)&&!window._sgSeen[today+y.a.id]&&nm>=mm(y.s)&&nm<mm(y.s)+10);
 if(!x)return;window._sgSeen[today+x.a.id]=1;const w=document.createElement('div');w.id='sgate';
 w.innerHTML='<div><div class="big">📚</div><h1>Study time!</h1><p><b>'+esc(sbase(x.r.rn||x.a.name))+'</b><br>'+f12(x.s)+(x.e?' – '+f12(x.e):'')+'</p><button class="go" id="sgGo">▶ Start focus timer</button><button class="lt" id="sgLater">Remind me in 5 min</button></div>';document.body.appendChild(w);
 $('#sgGo').onclick=()=>{w.remove();startStudyFocus(x.a.id,today)};$('#sgLater').onclick=()=>{w.remove();setTimeout(()=>{delete window._sgSeen[today+x.a.id]},3e5)}}
setInterval(studyGateCheck,20000);setTimeout(studyGateCheck,3500);document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(studyGateCheck,500)});
window.syncPrayers=syncPrayers;
S.set.tv2=1;S.set.tv3=1;S.set.tv4=1;
if(LOC())syncPrayers();
setInterval(()=>{const n=nextPrayer();document.querySelectorAll('[data-pcd]').forEach(e=>e.textContent=n?cd(n.left):'')},1000);
applyTheme();render();
})();
