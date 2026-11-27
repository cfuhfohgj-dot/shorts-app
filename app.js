const VIDEOS=[
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
let muted=true;
const state=VIDEOS.map(v=>({liked:false,likes:v.likes}));
function say(t){toast.textContent=t;toast.classList.add("show");clearTimeout(say.t);say.t=setTimeout(()=>toast.classList.remove("show"),1600)}
VIDEOS.forEach((v,i)=>{
 const el=document.createElement("section");el.className="card";
 el.innerHTML=`<video src="${v.src}" muted loop playsinline webkit-playsinline preload="${i<2?'auto':'metadata'}"></video>
 <div class="shade"></div><div class="playicon">${ico.play}</div>
 <button class="mute" aria-label="الصوت">${ico.off}</button>
 <div class="side">
  <div class="avatar" style="background:${v.c}">${v.user[1]}</div>
  <button class="like">${ico.heart}<span>${fmt(v.likes)}</span></button>
  <button class="cm">${ico.comment}<span>${fmt(v.comments)}</span></button>
  <button class="sh">${ico.share}<span>شارك</span></button>
 </div>
 <div class="info"><b>${v.user}</b><p>${v.caption}</p></div>
 <div class="bar"><i></i></div>`;
 feed.appendChild(el);
 const vid=el.querySelector("video"),mb=el.querySelector(".mute"),lk=el.querySelector(".like"),bar=el.querySelector(".bar i");
 vid.addEventListener("timeupdate",()=>{bar.style.width=(vid.currentTime/(vid.duration||1)*100)+"%"});
 el.addEventListener("click",e=>{
  if(e.target.closest("button"))return;
  if(vid.paused){vid.play().catch(()=>{});el.classList.remove("paused")}else{vid.pause();el.classList.add("paused")}
 });
 mb.onclick=()=>{muted=!muted;document.querySelectorAll(".card").forEach(c=>{c.querySelector("video").muted=muted;c.querySelector(".mute").innerHTML=muted?ico.off:ico.on});if(!muted)say("الصوت شغال 🔊")};
 lk.onclick=()=>{const s=state[i];s.liked=!s.liked;s.likes+=s.liked?1:-1;lk.classList.toggle("on",s.liked);lk.querySelector("span").textContent=fmt(s.likes)};
 el.querySelector(".cm").onclick=()=>say("التعليقات قريبًا 💬");
 el.querySelector(".sh").onclick=async()=>{
  const d={title:"شورتس",text:v.caption,url:location.href};
  if(navigator.share){try{await navigator.share(d)}catch(e){}}
  else{try{await navigator.clipboard.writeText(location.href);say("تم نسخ الرابط 🔗")}catch(e){say("الرابط: "+location.href)}}
 };
 el.addEventListener("dblclick",e=>{if(!state[i].liked)lk.click()});
});
const cards=[...document.querySelectorAll(".card")];
const io=new IntersectionObserver(es=>{es.forEach(en=>{
 const c=en.target,vid=c.querySelector("video");
 if(en.isIntersecting&&en.intersectionRatio>=.6){
  vid.muted=muted;c.classList.remove("paused");
  vid.play().catch(()=>{vid.muted=true;vid.play().catch(()=>{})});
  const n=cards[cards.indexOf(c)+1];if(n)n.querySelector("video").preload="auto";
 }else{vid.pause();if(en.intersectionRatio<.2)vid.currentTime=0}
})},{root:feed,threshold:[0,.2,.6,.9]});
cards.forEach(c=>io.observe(c));
document.querySelectorAll(".tab").forEach(t=>t.onclick=()=>{
 document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===t));
 if(t.dataset.tab==="following")say("تابع ناس عشان تظهر فيديوهاتهم هنا");
});
document.querySelectorAll(".nav").forEach(n=>n.onclick=()=>{if(!n.classList.contains("active"))say("قريبًا ✨")});
