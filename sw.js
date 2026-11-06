/* Cache offline do app ÍRIS: depois de aberto uma vez, funciona sem internet. */
const V='iris-v25';   // trocar a versão a cada publicação para os celulares atualizarem
const ARQ=['./','index.html','img/brasao.png','img/dig_ALAN.png','img/dig_TIAGO.png','img/dig_TATIANA.png','img/dig_ARTHUR.png','img/inv04.jpg','img/manual.jpg','img/croqui.jpg','img/fx/baloes.webp','img/fx/hud.jpg','img/fx/logo_exit.webp','img/fx/revista.webp','img/fx/polaroid.webp','fonts/BarlowCondensed-SemiBold.ttf','fonts/BarlowCondensed-Bold.ttf','fonts/IBMPlexMono-Regular.ttf','fonts/IBMPlexMono-SemiBold.ttf','fonts/IBMPlexSans-Regular.ttf','fonts/IBMPlexSans-SemiBold.ttf',
 'audio/iris_1.mp3','audio/iris_2.mp3','audio/iris_3.mp3','audio/iris_4.mp3','audio/iris_5.mp3','audio/iris_6.mp3','audio/pista.mp3','audio/tempos.json','videos/CAM01.mp4','videos/CAM02.mp4','videos/CAM03.mp4'];
const CEN=[];['ALFA','BRAVO','CHARLIE','DELTA'].forEach(q=>{for(let n=1;n<=7;n++)CEN.push('img/central/'+q+'_'+n+'.jpg')});   // caderno das Centrais offline
const MUS='iris-trilhas';   // músicas: só a TV baixa (cache separado, não é apagado na troca de versão)
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(ARQ.concat(CEN).map(u=>c.add(new Request(u,{cache:'reload'})).catch(()=>null)))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!==MUS).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
async function faixa(req){   // sem internet: entrega o pedaço pedido do vídeo/áudio guardado (206, como o iPhone exige)
  const r=await caches.match(req.url,{ignoreSearch:true});if(!r)return Response.error();
  const buf=await r.arrayBuffer(),tot=buf.byteLength,m=/bytes=(\d*)-(\d*)/.exec(req.headers.get('range')||'');
  let a=m&&m[1]?+m[1]:0,b=m&&m[2]?+m[2]:tot-1;if(m&&!m[1]&&m[2]){a=tot-(+m[2]);b=tot-1}b=Math.min(b,tot-1);
  return new Response(buf.slice(a,b+1),{status:206,headers:{'Content-Type':r.headers.get('Content-Type')||'video/mp4','Content-Range':'bytes '+a+'-'+b+'/'+tot,'Content-Length':String(b-a+1),'Accept-Ranges':'bytes'}})}
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  if(e.request.headers.has('range')){e.respondWith(caches.match(e.request.url,{ignoreSearch:true}).then(r=>r?faixa(e.request):fetch(e.request)));return}   // vídeo/áudio por faixas (iPhone): rede primeiro, cache sem internet
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).then(res=>{
    if(res.ok&&new URL(e.request.url).origin===location.origin){const cl=res.clone();caches.open(V).then(c=>c.put(e.request,cl))}
    return res}).catch(()=>caches.match('index.html'))));
});
