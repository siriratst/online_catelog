import {mkdir,readdir,readFile,writeFile,cp} from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd();
await mkdir('dist',{recursive:true});
await cp('web','dist',{recursive:true});
await cp('products','dist/products',{recursive:true});
const categories=[];
async function images(dir){let result=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())result.push(...await images(p));else if(/\.(jpe?g|png|webp|gif)$/i.test(e.name))result.push(p);}return result.sort((a,b)=>a.localeCompare(b,'th',{numeric:true}));}
for(const dir of (await readdir('products',{withFileTypes:true})).filter(x=>x.isDirectory()).sort((a,b)=>a.name.localeCompare(b.name,'th',{numeric:true}))){const files=await images(path.join('products',dir.name));categories.push({name:dir.name,items:files.map(p=>({name:path.basename(p,path.extname(p)),src:p.split(path.sep).map(encodeURIComponent).join('/')}))});}
await writeFile('dist/catalog.json',JSON.stringify(categories));
let redesigns=[];
try { redesigns=JSON.parse(await readFile('redesigns/manifest.json','utf8')); } catch(error) { if(error.code!=='ENOENT')throw error; }
if(redesigns.length){
  await cp('redesigns','dist/redesigns',{recursive:true});
  for(const redesign of redesigns){
    const category=categories.find(c=>c.name===redesign.category);
    const original=['products',redesign.category,redesign.file].map(encodeURIComponent).join('/');
    const item=category?.items.find(i=>i.src===original);
    if(!item)throw new Error(`Redesign source missing: ${original}`);
    item.originalSrc=item.src;
    item.src=['redesigns',...redesign.output.split('/')].map(encodeURIComponent).join('/');
  }
  await writeFile('dist/catalog.json',JSON.stringify(categories));
}
console.log(`Built ${categories.length} categories and ${categories.reduce((n,c)=>n+c.items.length,0)} product images.`);
