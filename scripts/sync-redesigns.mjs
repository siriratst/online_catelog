import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import path from 'node:path';
const source=path.resolve('../redesigned');
const progress=JSON.parse((await readFile(path.join(source,'progress.json'),'utf8')).replace(/^\uFEFF/,''));
const manifest=[];
for(const entry of progress.filter(p=>p.status==='reviewed'&&p.output)){
  const target=path.resolve('redesigns',entry.output);
  const allowed=path.resolve('redesigns')+path.sep;
  if(!target.startsWith(allowed))throw new Error('Invalid redesign path');
  await mkdir(path.dirname(target),{recursive:true});
  await copyFile(path.join(source,entry.output),target);
  manifest.push({category:entry.category,file:entry.file,output:entry.output});
}
await writeFile('redesigns/manifest.json',JSON.stringify(manifest,null,2));
console.log(`Synced ${manifest.length} reviewed designs.`);
