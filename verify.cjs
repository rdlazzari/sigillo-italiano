const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname,'dist');
const files = fs.readdirSync(root).filter(f=>f.endsWith('.html'));
const issues = [];
for(const file of files){
 const html=fs.readFileSync(path.join(root,file),'utf8');
 if((html.match(/<h1(?:\s|>)/g)||[]).length!==1)issues.push(file+': H1');
 for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  const ref=match[1];if(/^https?:/.test(ref))continue;
  const [target,fragment]=ref.split('#');
  const targetFile=path.join(root,target||file);
  if(!fs.existsSync(targetFile)){issues.push(file+': missing '+ref);continue;}
  if(fragment && targetFile.endsWith('.html') && !fs.readFileSync(targetFile,'utf8').includes('id="'+fragment+'"'))issues.push(file+': missing anchor '+ref);
 }
 if(/inteligência artificial|futuras edições digitais/i.test(html))issues.push(file+': unwanted public copy');
 if(!html.includes('aria-current="page"'))issues.push(file+': missing navigation state');
 for(const link of html.matchAll(/<a\b[^>]*href="https?:[^"]+"[^>]*>/g)) {
  if(!link[0].includes('target="_blank"') || !link[0].includes('noopener'))issues.push(file+': external link does not preserve reader tab');
 }
 if(['mantova.html','viajar-de-trem-na-italia.html','comida-italiana-por-regiao.html'].includes(file) && !html.includes('<iframe'))issues.push(file+': missing map');
}
console.log(JSON.stringify({pages:files.length,issues},null,2));
if(issues.length)process.exitCode=1;
