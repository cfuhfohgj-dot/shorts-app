const SAMPLES=[
 {src:"https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4",user:"@نور_الصحراء",caption:"أرنوب كسلان في الصباح 🐰☀️ مين زيه يوم الجمعة؟ #كسل",likes:12400,comments:342,c:"#e8a33d"},
 {src:"https://test-videos.co.uk/vids/jellyfish/mp4/h264/360/Jellyfish_360_10s_1MB.mp4",user:"@بحر_وأمواج",caption:"قناديل البحر بترقص في الأزرق الهادي 🌊✨ #طبيعة",likes:8900,comments:211,c:"#2ec4b6"},
 {src:"https://test-videos.co.uk/vids/sintel/mp4/h264/360/Sintel_360_10s_1MB.mp4",user:"@مغامرات_سلمى",caption:"رحلة طويلة وهدف واحد، متوقفش أبدًا 💪 #تحفيز",likes:25100,comments:1203,c:"#e63946"},
 {src:"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",user:"@زهرة_القاهرة",caption:"النحلة والزهرة، أجمل لقطة النهاردة 🌼🐝 #ماكرو",likes:5300,comments:98,c:"#f4a261"},
 {src:"https://test-videos.co.uk/vids/sintel/mp4/h264/720/Sintel_720_10s_2MB.mp4",user:"@كرتون_بلس",caption:"المشهد ده بقى ترند، شوفته كام مرة؟ 😂 #ضحك",likes:41800,comments:2650,c:"#8338ec"},
 {src:"https://test-videos.co.uk/vids/jellyfish/mp4/h264/720/Jellyfish_720_10s_2MB.mp4",user:"@عالم_المحيط",caption:"أعماق المحيط فيها أسرار كتير 🐠 اتابعني للمزيد",likes:17600,comments:487,c:"#3a86ff"},
 {src:"https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_2MB.mp4",user:"@ليالي_الجيزة",caption:"فيبّ المساء مع الأرنب الشقي 🌙🎶 #مزاج",likes:9700,comments:156,c:"#ff006e"},
 {src:"https://test-videos.co.uk/vids/jellyfish/mp4/h264/360/Jellyfish_360_10s_2MB.mp4",user:"@حديقة_الصباح",caption:"لحظة هدوء وسط الزحمة 🌿 خدلك نفس عميق #هدوء",likes:3200,comments:64,c:"#06d6a0"}
];
const fmt=n=>n>=1e6?(n/1e6).toFixed(1)+"م":n>=1000?(n/1000).toFixed(1).replace(".0","")+"ألف":String(n);
const ico={
 heart:'<svg viewBox="0 0 24 24"><path d="M12 21s-8-5.3-8-11a4.7 4.7 0 0 1 8-3.4A4.7 4.7 0 0 1 20 10c0 5.7-8 11-8 11z"/></svg>',
 comment:'<svg viewBox="0 0 24 24"><path d="M4 3h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/></svg>',
 share:'<svg viewBox="0 0 24 24"><path d="M14 3v5C7 9 3 13 2 20c2.5-3.5 6-5 12-5v5l8-8.5z"/></svg>',
 on:'<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>',
 off:'<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9zm13.6 3 2.4-2.4-1.4-1.4-2.4 2.4-2.4-2.4-1.4 1.4 2.4 2.4-2.4 2.4 1.4 1.4 2.4-2.4 2.4 2.4 1.4-1.4z"/></svg>',
 play:'<svg viewBox="0 0 24 24"><path d="M7 4v16l13-8z"/></svg>'
};
const feed=document.getElementById("feed"),toast=document.getElementById("toast");
const $=id=>document.getElementById(id);
let muted=true,panelOpen=false,clips=[];
const mine=[];
function say(t){toast.textContent=t;toast.classList.add("show");clearTimeout(say.t);say.t=setTimeout(()=>toast.classList.remove("show"),1800)}
const esc=s=>String(s).replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));

/* ---------- backend (Supabase) ---------- */
const SB_URL=window.SUPABASE_URL||"",SB_KEY=window.SUPABASE_ANON_KEY||"";
let sb=null;
try{if(window.supabase&&SB_URL&&SB_KEY)sb=window.supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:false}})}catch(e){console.warn("supabase init failed",e)}
const DEVICE=(()=>{try{let d=localStorage.getItem("shorts_device");if(!d){d="d_"+Math.random().toString(36).slice(2,10)+Date.now().toString(36);localStorage.setItem("shorts_device",d)}return d}catch(e){return "d_anon"}})();
const PALETTE=["#fe2c55","#3a86ff","#06d6a0","#8338ec","#ff006e","#f4a261","#2ec4b6","#e8a33d"];
const colorFor=s=>PALETTE[Math.abs([...String(s)].reduce((a,c)=>a*31+c.charCodeAt(0)|0,7))%PALETTE.length];
const likedSet=new Set();
function rowToClip(r){
 return{id:r.id,src:r.video_url,user:r.handle,caption:r.caption||"",likes:(r.base_likes||0)+(r.likes_count||0),base:r.base_likes||0,comments:r.comments_count||0,c:r.color||colorFor(r.handle),server:true,seed:!!r.seed,device:r.device_id||null,mine:!!r.device_id&&r.device_id===DEVICE,ts:Date.parse(r.created_at)||0};
}

const io=new IntersectionObserver(es=>{es.forEach(en=>{
 const c=en.target,vid=c.querySelector("video");
 if(en.isIntersecting&&en.intersectionRatio>=.6&&!panelOpen){
  vid.muted=muted;c.classList.remove("paused");
  if(!c.classList.contains("cur")){c.classList.remove("enter");void c.offsetWidth;c.classList.add("enter");c.classList.add("cur")}
  clearTimeout(c._pt);
  c._pt=setTimeout(()=>{if(c.classList.contains("cur")&&!panelOpen)vid.play().catch(()=>{vid.muted=true;vid.play().catch(()=>{})})},matchMedia("(prefers-reduced-motion: reduce)").matches?0:140);
  const n=c.nextElementSibling;if(n)n.querySelector("video").preload="auto";
 }else{clearTimeout(c._pt);if(en.intersectionRatio<.6)c.classList.remove("cur");vid.pause();if(en.intersectionRatio<.2){vid.currentTime=0;c.classList.remove("enter")}}
})},{root:feed,threshold:[0,.2,.6,.9]});
function makeCard(v){
 const el=document.createElement("section");el.className="card";
 v.state=v.state||{liked:likedSet.has(v.id),likes:v.likes};
 el.innerHTML=`<video src="${v.src}" muted loop playsinline webkit-playsinline preload="auto"></video>
 <div class="shade"></div><div class="playicon">${ico.play}</div>
 <button class="mute" aria-label="الصوت">${muted?ico.off:ico.on}</button>
 <div class="side">
  <div class="avatar" style="background:${v.c}">${esc(v.user[1])}</div>
  <button class="like${v.state.liked?" on":""}">${ico.heart}<span>${fmt(v.state.likes)}</span></button>
  <button class="cm">${ico.comment}<span>${fmt(v.comments)}</span></button>
  <button class="sh">${ico.share}<span>شارك</span></button>
 </div>
 <div class="info"><b>${esc(v.user)}</b><p>${esc(v.caption)}</p></div>
 <div class="bar"><i></i></div>`;
 v.el=el;el._v=v;
 const vid=el.querySelector("video"),mb=el.querySelector(".mute"),lk=el.querySelector(".like"),bar=el.querySelector(".bar i");
 vid.addEventListener("timeupdate",()=>{bar.style.width=(vid.currentTime/(vid.duration||1)*100)+"%"});
 el.addEventListener("click",e=>{
  if(e.target.closest("button"))return;
  if(vid.paused){vid.play().catch(()=>{});el.classList.remove("paused")}else{vid.pause();el.classList.add("paused")}
 });
 mb.onclick=()=>{muted=!muted;document.querySelectorAll(".card").forEach(c=>{c.querySelector("video").muted=muted;c.querySelector(".mute").innerHTML=muted?ico.off:ico.on});if(!muted)say("الصوت شغال 🔊")};
 lk.onclick=()=>toggleLike(v,lk);
 el.querySelector(".cm").onclick=()=>say("التعليقات قريبًا 💬");
 el.querySelector(".sh").onclick=async()=>{
  const d={title:"شورتس",text:v.caption,url:location.href};
  if(navigator.share){try{await navigator.share(d)}catch(e){}}
  else{try{await navigator.clipboard.writeText(location.href);say("تم نسخ الرابط 🔗")}catch(e){say("الرابط: "+location.href)}}
 };
 el.addEventListener("dblclick",()=>{if(!v.state.liked)lk.click()});
 io.observe(el);
 return el;
}
async function toggleLike(v,lk){
 const s=v.state,want=!s.liked;
 const paint=()=>{lk.classList.toggle("on",s.liked);lk.querySelector("span").textContent=fmt(s.likes)};
 s.liked=want;s.likes+=want?1:-1;paint();
 if(want)likedSet.add(v.id);else likedSet.delete(v.id);
 v._localUntil=Date.now()+3000;
 if(!v.server||!sb)return;
 try{
  if(want){
   const r=await sb.from("likes").insert({video_id:v.id,device_id:DEVICE});
   if(r.error&&String(r.error.code||"")!=="23505")throw r.error;
  }else{
   const r=await sb.from("likes").delete().eq("video_id",v.id).eq("device_id",DEVICE);
   if(r.error)throw r.error;
  }
 }catch(e){
  console.warn("like failed",e);
  s.liked=!want;s.likes+=want?-1:1;paint();
  if(s.liked)likedSet.add(v.id);else likedSet.delete(v.id);
  say("الإعجاب مش اتحفظ، جرّب تاني");
 }
}
function addClip(v,top){
 v.state={liked:likedSet.has(v.id),likes:v.likes};
 const el=makeCard(v);
 if(top){feed.insertBefore(el,feed.firstChild);clips.unshift(v)}else{feed.appendChild(el);clips.push(v)}
 refreshMine();
 return v;
}
function refreshMine(){mine.length=0;clips.filter(v=>v.mine).sort((a,b)=>(b.ts||0)-(a.ts||0)).forEach(v=>mine.push(v))}
function useFallback(){SAMPLES.forEach(v=>addClip({src:v.src,user:v.user,caption:v.caption,likes:v.likes,comments:v.comments,c:v.c,ts:0,server:false}))}
function goTo(v,smooth){closePanels();requestAnimationFrame(()=>{feed.scrollTo({top:v.el.offsetTop,behavior:smooth?"smooth":"auto"});setTimeout(playCurrent,smooth?500:60)})}
function playCurrent(){if(panelOpen)return;const i=Math.round(feed.scrollTop/feed.clientHeight);const c=feed.children[i];if(c){const vid=c.querySelector("video");vid.muted=muted;vid.play().catch(()=>{vid.muted=true;vid.play().catch(()=>{})})}}
document.querySelectorAll(".tab").forEach(t=>t.onclick=()=>{
 document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===t));
 if(t.dataset.tab==="following")say("تابع ناس عشان تظهر فيديوهاتهم هنا");
});

/* ---------- storage (IndexedDB) ---------- */
let dbp=null;
function db(){if(dbp)return dbp;dbp=new Promise((res,rej)=>{
 if(!window.indexedDB)return rej(new Error("no idb"));
 const r=indexedDB.open("shorts",1);
 r.onupgradeneeded=()=>r.result.createObjectStore("clips",{keyPath:"id"});
 r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);
});return dbp}
async function dbPut(rec){try{const d=await db();return new Promise((res,rej)=>{const t=d.transaction("clips","readwrite");t.objectStore("clips").put(rec);t.oncomplete=res;t.onerror=()=>rej(t.error)})}catch(e){return false}}
async function dbAll(){try{const d=await db();return await new Promise((res,rej)=>{const q=d.transaction("clips").objectStore("clips").getAll();q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)})}catch(e){return[]}}
async function dbDel(id){try{const d=await db();d.transaction("clips","readwrite").objectStore("clips").delete(id)}catch(e){}}

/* ---------- boot: feed from the server ---------- */
async function boot(){
 let rows=[];
 if(sb){
  try{
   const r=await sb.from("videos").select("*").order("created_at",{ascending:true});
   if(r.error)console.warn("videos load failed",r.error);else rows=r.data||[];
   const lk=await sb.from("likes").select("video_id").eq("device_id",DEVICE);
   if(!lk.error)(lk.data||[]).forEach(x=>likedSet.add(x.video_id));
  }catch(e){console.warn("backend unreachable",e)}
 }
 if(rows.length){
  const ups=rows.filter(r=>!r.seed).sort((a,b)=>(Date.parse(b.created_at)||0)-(Date.parse(a.created_at)||0));
  const seeds=rows.filter(r=>r.seed);
  ups.concat(seeds).map(rowToClip).forEach(c=>addClip(c,false));
 }else{useFallback()}
 // clips recorded on this device that never reached the server
 const all=(await dbAll()).sort((a,b)=>a.ts-b.ts);
 all.filter(r=>!r.uploaded).forEach(r=>{
  addClip({id:r.id,src:URL.createObjectURL(r.blob),user:"@أنت",caption:r.caption||"فيديو جديد 🎬",likes:0,comments:0,c:"#fe2c55",mine:true,ts:r.ts,server:false},true);
 });
 refreshMine();renderProfile();
 if(sb){
  try{
   sb.channel("videos-live").on("postgres_changes",{event:"UPDATE",schema:"public",table:"videos"},p=>{
    const row=p.new||{};const v=clips.find(c=>c.id===row.id);
    if(!v||!v.server||!v.state)return;
    if(v._localUntil&&Date.now()<v._localUntil)return;
    const n=(row.base_likes||0)+(row.likes_count||0);
    v.state.likes=n;v.likes=n;
    const sp=v.el&&v.el.querySelector(".like span");if(sp)sp.textContent=fmt(n);
   }).subscribe();
  }catch(e){}
 }
}

/* ---------- panels ---------- */
const panels={search:$("p-search"),notif:$("p-notif"),profile:$("p-profile")};
function setActive(n){document.querySelectorAll(".nav").forEach(b=>b.classList.toggle("active",b.dataset.nav===n))}
function closePanels(){Object.values(panels).forEach(p=>p.hidden=true);panelOpen=false;document.body.classList.remove("pan");setActive("home")}
function openPanel(n){
 closePanels();panelOpen=true;document.body.classList.add("pan");panels[n].hidden=false;setActive(n);
 document.querySelectorAll(".card video").forEach(v=>v.pause());
 if(n==="search"){renderSearch();setTimeout(()=>$("q").focus(),50)}
 if(n==="profile")renderProfile();
}
function renderSearch(){
 const q=$("q").value.trim().toLowerCase();
 const list=clips.filter(v=>!q||(v.user+" "+v.caption).toLowerCase().includes(q));
 $("results").innerHTML=list.length?"":'<div class="none">ما فيش نتائج 🔍</div>';
 list.forEach(v=>{const b=document.createElement("button");b.className="res";
  b.innerHTML=`<div class="avatar" style="background:${v.c}">${esc(v.user[1])}</div><p><b>${esc(v.user)}</b><small>${esc(v.caption)}</small></p>`;
  b.onclick=()=>goTo(v,false);$("results").appendChild(b)});
}
$("q").addEventListener("input",renderSearch);
function renderProfile(){
 const g=$("grid");g.innerHTML="";
 mine.forEach(v=>{const b=document.createElement("button");b.innerHTML=`<video src="${v.src}#t=0.1" muted playsinline preload="metadata"></video>`;b.onclick=()=>goTo(v,false);g.appendChild(b)});
 $("empty").style.display=mine.length?"none":"block";
 $("mecount").textContent=mine.length+" فيديو";
}
document.querySelectorAll(".nav").forEach(n=>n.onclick=()=>{
 const k=n.dataset.nav;
 if(k==="home"){if(panelOpen){closePanels();setTimeout(playCurrent,60)}feed.scrollTo({top:0,behavior:"smooth"});setTimeout(playCurrent,600)}
 else if(k==="plus")openCam();
 else if(panels[k].hidden)openPanel(k);else{closePanels();setTimeout(playCurrent,60)}
});

/* ---------- camera ---------- */
let stream=null,facing="user",rec=null,chunks=[],timer=null,t0=0,recording=false;
const cam=$("cam"),camv=$("camv");
function camErr(t){$("camerrt").textContent=t;$("camerr").hidden=false}
function stopStream(){if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}camv.srcObject=null}
async function startStream(){
 stopStream();
 if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia||!window.MediaRecorder){camErr("المتصفح ده مش بيدعم التصوير. جرّب Chrome أو Safari حديث.");return false}
 if(!window.isSecureContext){camErr("الكاميرا بتشتغل بس على اتصال آمن (https).");return false}
 try{
  stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:facing,width:{ideal:720},height:{ideal:1280}},audio:true});
 }catch(e){
  const n=e&&e.name;
  if(n==="NotAllowedError"||n==="SecurityError")camErr("ما قدرناش نفتح الكاميرا لأن الصلاحية مرفوضة. اسمح للموقع بالوصول للكاميرا والميكروفون من إعدادات المتصفح وجرّب تاني.");
  else if(n==="NotFoundError"||n==="OverconstrainedError")camErr("ما لقيناش كاميرا في الجهاز ده.");
  else if(n==="NotReadableError")camErr("الكاميرا مشغولة في تطبيق تاني. اقفله وجرّب تاني.");
  else camErr("حصلت مشكلة في فتح الكاميرا. جرّب تاني.");
  return false;
 }
 camv.srcObject=stream;camv.classList.toggle("mirror",facing==="user");camv.play().catch(()=>{});
 return true;
}
async function openCam(){
 panelOpen=true;document.querySelectorAll(".card video").forEach(v=>v.pause());
 $("camerr").hidden=true;$("capt").value="";cam.hidden=false;$("rectime").hidden=true;$("rec").classList.remove("on");
 await startStream();
}
function closeCam(){
 if(recording){rec.onstop=null;try{rec.stop()}catch(e){}recording=false;clearInterval(timer)}
 stopStream();cam.hidden=true;
 if(!Object.values(panels).some(p=>!p.hidden)){panelOpen=false;setTimeout(playCurrent,60)}
}
$("camx").onclick=closeCam;$("camok").onclick=closeCam;
$("camflip").onclick=async()=>{if(recording){say("وقّف التسجيل الأول");return}facing=facing==="user"?"environment":"user";await startStream()};
function pickMime(){const l=["video/webm;codecs=vp9,opus","video/webm;codecs=vp8,opus","video/webm","video/mp4"];return l.find(m=>MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(m))||""}
$("rec").onclick=()=>{
 if(!stream)return;
 if(!recording){
  chunks=[];const mt=pickMime();
  try{rec=new MediaRecorder(stream,mt?{mimeType:mt}:undefined)}catch(e){camErr("المتصفح ده مش بيدعم تسجيل الفيديو.");return}
  rec.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};
  rec.onstop=onRecorded;
  rec.start(250);recording=true;t0=Date.now();
  $("rec").classList.add("on");$("rectime").hidden=false;
  timer=setInterval(()=>{const s=Math.floor((Date.now()-t0)/1000);$("rectime").textContent=Math.floor(s/60)+":"+String(s%60).padStart(2,"0");if(s>=60)$("rec").click()},250);
 }else{
  recording=false;clearInterval(timer);$("rec").classList.remove("on");rec.stop();
 }
};
async function onRecorded(){
 const type=(rec&&rec.mimeType)||(chunks[0]&&chunks[0].type)||"video/webm";
 const blob=new Blob(chunks,{type});
 if(Date.now()-t0<600||blob.size<500){say("الفيديو قصير قوي، جرّب تاني");return}
 const caption=$("capt").value.trim()||"فيديو جديد 🎬";
 const id="c"+Date.now();
 const localRec={id,blob,caption,ts:Date.now(),uploaded:false};
 const ok=await dbPut(localRec);
 stopStream();cam.hidden=true;panelOpen=false;
 let clip=null;
 if(sb){
  say("جاري رفع الفيديو… ⬆️");
  try{
   const ext=type.indexOf("mp4")>=0?"mp4":"webm";
   const path=DEVICE+"/"+id+"."+ext;
   const up=await sb.storage.from("videos").upload(path,blob,{contentType:type||"video/webm",upsert:false,cacheControl:"3600"});
   if(up.error)throw up.error;
   const pub=sb.storage.from("videos").getPublicUrl(path);
   const ins=await sb.from("videos").insert({handle:"@أنت",caption,video_url:pub.data.publicUrl,seed:false,color:"#fe2c55",device_id:DEVICE}).select().single();
   if(ins.error)throw ins.error;
   localRec.uploaded=true;await dbPut(localRec);
   clip=rowToClip(ins.data);clip.mine=true;
  }catch(e){console.warn("upload failed",e)}
 }
 if(!clip)clip={id,src:URL.createObjectURL(blob),user:"@أنت",caption,likes:0,comments:0,c:"#fe2c55",mine:true,ts:Date.now(),server:false};
 addClip(clip,true);renderProfile();
 feed.scrollTo({top:0});setTimeout(playCurrent,80);
 say(clip.server?"تم النشر ✅ الفيديو بقى على السيرفر":"اتحفظ على جهازك، الرفع فشل — جرّب تاني");
}
boot();
