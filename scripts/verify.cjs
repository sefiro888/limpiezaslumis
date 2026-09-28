const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');
const { JSDOM } = require('./.qa/node_modules/jsdom');
const postcss = require('./.qa/node_modules/postcss');
const root = path.resolve(__dirname, '..');
const pages = fs.readdirSync(root).filter(f => f.endsWith('.html'));
const js = fs.readFileSync(path.join(root,'assets/js/main.js'),'utf8');
const css = fs.readFileSync(path.join(root,'assets/css/styles.css'),'utf8');
postcss.parse(css);
const titles = new Set();
const documents = new Map(pages.map(file => [file,new JSDOM(fs.readFileSync(path.join(root,file),'utf8')).window.document]));
let links = 0, images = 0, comparisons = 0;
for (const [file, doc] of documents) {
 assert.equal(doc.querySelectorAll('h1').length,1,file+' H1');
 assert.ok(doc.querySelector('meta[name="description"]')?.content,file+' description');
 assert.ok(!titles.has(doc.title),file+' unique title'); titles.add(doc.title);
 assert.equal(doc.querySelectorAll('.mega-links a').length,16,file+' menu services');
 assert.equal(doc.querySelectorAll('header').length,1,file+' one header');
 assert.equal(doc.querySelectorAll('footer').length,1,file+' one footer');
 for(const element of doc.querySelectorAll('[src],[href]')) {
  const value = element.getAttribute('src') || element.getAttribute('href');
  if(/^(https?:|tel:|mailto:)/.test(value)) {
   if(value.startsWith('https://wa.me/')) { const u = new URL(value); assert.equal(u.pathname,'/34652609338'); assert.ok(u.searchParams.get('text')); }
   continue;
  }
  const [pathname, hash] = value.split('#'); const local = pathname.split('?')[0];
  const target = local || file;
  assert.ok(fs.existsSync(path.join(root,target)),file+' missing '+value);
  if(hash && documents.has(target)) assert.ok(documents.get(target).getElementById(hash),file+' missing anchor '+value);
  links++;
 }
 for(const img of doc.querySelectorAll('img')) {
  assert.ok(img.hasAttribute('alt'),file+' image alt');images++;
  for(const candidate of (img.getAttribute('srcset')||'').split(',').filter(Boolean)) assert.ok(fs.existsSync(path.join(root,candidate.trim().split(' ')[0])));
 }
 comparisons += doc.querySelectorAll('[data-compare]').length;
}
assert.equal(pages.length,17); assert.equal(comparisons,7);
function instance(file, mobile=false, reduce=false) {
 const dom=new JSDOM(fs.readFileSync(path.join(root,file),'utf8'),{runScripts:'outside-only',url:'https://lumis.test/'+file});
 dom.window.matchMedia=q=>({matches:q.includes('760px')?mobile:reduce,addEventListener(){}});
 dom.window.eval(js);
 return dom;
}
for(const isMobile of [false,true]) {
 const dom=instance('index.html',isMobile);const w=dom.window;const d=w.document;
 const button=d.querySelector('.menu-toggle');const nav=d.querySelector('.nav');const menu=d.querySelector('.nav-services');const backdrop=d.querySelector('.menu-backdrop');
 button.click();assert.equal(button.getAttribute('aria-expanded'),'true');assert.ok(nav.classList.contains('open'));
 if(isMobile)assert.equal(backdrop.hidden,false);
 d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert.equal(button.getAttribute('aria-expanded'),'false');assert.ok(!nav.classList.contains('open'));
 menu.open=true;menu.dispatchEvent(new w.Event('toggle'));assert.equal(backdrop.hidden,false);backdrop.click();assert.equal(menu.open,false);
 const expected={todos:16,hogar:4,exterior:3,profesional:5,superficies:4};
 for(const [category,count] of Object.entries(expected)) {
  const filter=d.querySelector(`[data-filter="${category}"]`);filter.click();
  assert.equal([...d.querySelectorAll('.service-card')].filter(card=>!card.hidden).length,count);
  assert.equal(d.querySelectorAll('[data-filter][aria-pressed="true"]').length,1);
  assert.equal(filter.getAttribute('aria-pressed'),'true');
 }
 dom.window.close();
}
for(const file of pages) {
 const dom=instance(file);const w=dom.window;
 for(const box of w.document.querySelectorAll('[data-compare]')) {
  const input=box.querySelector('input');input.value='73';input.dispatchEvent(new w.Event('input'));
  assert.equal(box.style.getPropertyValue('--split'),'73%');assert.equal(input.getAttribute('aria-valuetext'),'73% antes, 27% después');
  input.getBoundingClientRect=()=>({left:20,width:500});input.setPointerCapture=()=>{};input.hasPointerCapture=()=>false;
  for(const pointerType of ['mouse','touch']) {
   const event=new w.MouseEvent('pointerdown',{clientX:145,button:0,bubbles:true,cancelable:true});
   Object.defineProperties(event,{pointerId:{value:1},pointerType:{value:pointerType}});input.dispatchEvent(event);
   assert.equal(input.value,'25');assert.equal(box.style.getPropertyValue('--split'),'25%');
  }
 }
 dom.window.close();
}
const report={pages:pages.length,localReferences:links,imageElements:images,comparisons,css:'parsed',navigation:'desktop/mobile state passed',filters:'all 5 categories passed',comparators:'range input and mouse/touch pointer handlers passed',limitation:'DOM checks only; no visual browser or physical touch/keyboard validation.'};
fs.writeFileSync(path.join(root,'scripts/verification.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
