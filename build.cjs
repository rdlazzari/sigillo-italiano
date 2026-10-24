const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const out = path.join(root, 'dist');
fs.mkdirSync(out, { recursive: true });
const articles = JSON.parse(fs.readFileSync(path.join(root, 'content.json'), 'utf8'));
const esc = s => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const names = { 'Lugares':'lugares', 'Memória':'memoria', 'Ofícios':'cultura-do-fazer' };
const category = a => a.category === 'Ofícios' ? 'Cultura do fazer' : a.category;
const url = a => a.id + '.html';
const head = (title, description) => '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(title)+' | Sigillo Italiano</title><meta name="description" content="'+esc(description)+'"><link rel="stylesheet" href="style.css"><link rel="stylesheet" href="journal.css"><link rel="stylesheet" href="edition.css"><link rel="icon" href="assets/sigillo-italiano-mark.svg"></head><body><a class="skip" href="#conteudo">Ir ao conteúdo</a>';
const header = '<div class="issue-bar"><span>Journal independente de cultura</span><span>Brasil / Itália</span><span>Português</span></div><header><a class="brand" href="index.html">Sigillo <i>Italiano</i><span>JOURNAL</span></a><nav aria-label="Principal"><a href="index.html">Capa</a><a href="lugares.html">Lugares</a><a href="memoria.html">Memória</a><a href="cultura-do-fazer.html">Cultura do fazer</a><a href="sobre.html">Sobre</a></nav></header>';
const footer = '<footer><div class="footer-wordmark">Sigillo Italiano</div><p>Journal independente de cultura<br>Brasil — Itália</p><a href="sobre.html">Sobre e critérios editoriais</a><a href="#conteudo">Voltar ao início ↑</a></footer></body></html>';
const photo = (a, eager = false) => a.image ? '<figure class="editorial-photo"><img src="'+esc(a.image.src)+'" alt="'+esc(a.image.alt)+'" '+(eager ? 'fetchpriority="high"' : 'loading="lazy"')+' width="1600" height="900"><figcaption><a href="'+esc(a.image.page)+'">'+esc(a.image.credit)+'</a> · <a href="'+esc(a.image.license)+'">Licença</a> · Enquadramento editorial</figcaption></figure>' : '';
const card = a => '<article class="reading">'+(a.id === 'hospedaria' ? photo(a) : '')+'<p class="eyebrow">'+category(a)+' / '+a.country+'</p><h2><a href="'+url(a)+'">'+esc(a.title)+'</a></h2><p>'+esc(a.description)+'</p><a class="text-link" href="'+url(a)+'">Ler o texto ↗</a></article>';
const write = (file, content) => {
 const active = file === 'index.html' ? file : (names[articles.find(a => url(a) === file)?.category] ? names[articles.find(a => url(a) === file).category] + '.html' : file);
 content = content.replace('href="' + active + '">' , 'href="' + active + '" aria-current="page">');
 content = content.replace('</head>', '<link rel="stylesheet" href="refinement.css"><link rel="stylesheet" href="visual.css"></head>');
 content = content.replace('</head>', '<meta property="og:type" content="' + (articles.some(a=>url(a)===file) ? 'article' : 'website') + '"><meta property="og:title" content="' + esc(file === 'index.html' ? 'Sigillo Italiano — Journal' : (articles.find(a=>url(a)===file)?.title || 'Sigillo Italiano')) + '"><meta name="robots" content="noindex,follow"></head>');
 if (process.argv.includes('--production')) {
  const canonical = 'https://www.sigilloitaliano.org/' + (file === 'index.html' ? '' : file);
  content = content.replace('content="noindex,follow"', 'content="index,follow"');
  content = content.replace('</head>', '<link rel="canonical" href="' + canonical + '"><meta property="og:url" content="' + canonical + '"><meta property="og:locale" content="pt_BR"></head>');
 }
 fs.writeFileSync(path.join(out,file),content);
};
for(const a of articles) {
 const words = (a.intro+' '+a.sections.map(s=>s.join(' ')).join(' ')).split(/\s+/).length;
 const body = '<main id="conteudo"><article class="article article-full"><div class="article-heading"><a class="back" href="'+names[a.category]+'.html">'+category(a)+' / '+a.country+'</a><h1>'+esc(a.title)+'</h1><p class="intro">'+esc(a.intro)+'</p><div class="article-meta">Sigillo Italiano · '+esc(a.format)+' · '+Math.max(1,Math.ceil(words/200))+' min de leitura</div></div>'+photo(a,true)+'<div class="reading-layout '+(words < 400 ? 'short-reading' : '')+'"><aside class="article-index"><span class="eyebrow">Nesta leitura</span>'+a.sections.map((s,i)=>'<a href="#parte-'+i+'">'+esc(s[0])+'</a>').join('')+'</aside><div class="article-body">'+a.sections.map((s,i)=>'<section id="parte-'+i+'"><h2>'+esc(s[0])+'</h2><p>'+s[1].split('\n\n').map(esc).join('</p><p>')+'</p></section>').join('')+'<div class="sources"><h2>Referências</h2><a href="'+a.source+'">'+esc(a.sourceName)+'</a><p>Leitura editorial baseada na documentação indicada. Consulte a fonte para aprofundamento.</p></div></div></div></article><section class="related"><p class="eyebrow">Continue a leitura</p><div class="related-grid">'+articles.filter(b=>b.id!==a.id).map(card).join('')+'</div></section></main>';
 write(url(a),head(a.title,a.description)+header+body+footer);
}
for (const [name,slug] of Object.entries(names)) {
 const intros={'Lugares':'Cidades e territórios como formas de ler a cultura.','Memória':'Deslocamentos, documentos e histórias entre gerações.','Ofícios':'Os gestos, os saberes e a transmissão do fazer.'};
 const label=name==='Ofícios'?'Cultura do fazer':name;
 write(slug+'.html',head(label,intros[name])+header+'<main id="conteudo"><section class="category-heading"><p class="eyebrow">Editoria</p><h1>'+label+'</h1><p>'+intros[name]+'</p></section><section class="category-readings" aria-label="Leituras da editoria">'+articles.filter(a=>a.category===name).map(card).join('')+'</section></main>'+footer);
}
write('sobre.html',head('Sobre o journal','Uma publicação independente dedicada às relações culturais entre Itália e Brasil.')+header+'<main id="conteudo"><article class="article"><p class="eyebrow">O journal</p><h1>Duas geografias.<br>Muitas histórias.</h1><p class="intro">Sigillo Italiano acompanha as relações culturais entre Itália e Brasil através de seus lugares, memórias e modos de fazer.</p><h2>Um olhar editorial</h2><p>Interessa-nos o que circula entre os dois países: saberes, ideias, formas e experiências. Cada leitura procura oferecer contexto e abrir caminhos de descoberta.</p><h2>Fontes e critérios</h2><p>Os textos documentais identificam as referências utilizadas. Interpretações editoriais não representam entrevistas ou reportagem presencial. Imagens de atmosfera são indicadas como tal; não substituem documentação do assunto.</p><h2>Privacidade</h2><p>Esta edição não possui cadastro, pagamentos ou rastreadores próprios. Fotografias e fontes tipográficas externas recebem os dados técnicos necessários à conexão.</p></article></main>'+footer);
const first=articles[0];
let home=head('Journal de cultura entre Itália e Brasil','Lugares, memória e cultura do fazer entre Itália e Brasil.')+header+'<main id="conteudo"><section class="opening"><p class="eyebrow">Cultura, memória e pertencimento</p><p class="journal-intro">Um olhar entre Itália e Brasil.</p></section><section class="visual-cover"><div class="cover-lead"><div class="cover-lead-image">'+photo(first,true)+'</div><div class="cover-lead-copy"><p class="eyebrow">Ensaio de abertura · Lugares / Itália</p><h1><a href="'+url(first)+'">A cidade como<br><i>pensamento.</i></a></h1><p>Mantova e Sabbioneta. Duas maneiras de imaginar a cidade, uma nova forma de olhar para o que permanece.</p><a class="text-link" href="'+url(first)+'">Entrar na história ↗</a></div></div></section><section class="journal-selection"><div class="selection-heading"><p class="eyebrow">Outras perspectivas</p><h2>Do lugar ao gesto.</h2></div><div class="selection-grid">'+articles.slice(1).map(card).join('')+'</div></section><section class="editorial-paths"><p class="eyebrow">Explore as editorias</p>'+Object.entries(names).map(([name,slug],i)=>'<a href="'+slug+'.html"><span>0'+(i+1)+'</span><h2>'+(name==='Ofícios'?'Cultura do fazer':name)+'</h2><span aria-hidden="true">↗</span></a>').join('')+'</section></main>'+footer;
write('index.html',home);
for(const file of ['style.css','journal.css','edition.css','refinement.css','visual.css'])fs.copyFileSync(path.join(root,file),path.join(out,file));
fs.mkdirSync(path.join(out,'assets'),{recursive:true});
const localMark = path.join(root,'assets/sigillo-italiano-mark.svg');
fs.copyFileSync(fs.existsSync(localMark) ? localMark : path.join(root,'../assets/sigillo-italiano-mark.svg'),path.join(out,'assets/sigillo-italiano-mark.svg'));
console.log('Built 8 static HTML pages. All article text is available without JavaScript.');
if (process.argv.includes('--production')) {
 const pages = fs.readdirSync(out).filter(f=>f.endsWith('.html'));
 fs.writeFileSync(path.join(out,'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+pages.map(f=>'<url><loc>https://www.sigilloitaliano.org/'+(f==='index.html'?'':f)+'</loc></url>').join('')+'</urlset>');
 fs.writeFileSync(path.join(out,'robots.txt'), 'User-agent: *\nAllow: /\nSitemap: https://www.sigilloitaliano.org/sitemap.xml\n');
}
