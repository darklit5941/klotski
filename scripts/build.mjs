import {mkdir,copyFile,cp,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const version=content=>createHash('sha256').update(content).digest('hex').slice(0,12);
await mkdir('dist',{recursive:true});
const engine=await readFile('engine.js','utf8');
const style=await readFile('style.css','utf8');
// Include the engine version in app.js so dependency changes update both URLs.
const app=(await readFile('app.js','utf8')).replace("'./engine.js'",`'./engine.js?v=${version(engine)}'`);
const template=await readFile('index.html','utf8');
const buildVersion=version(JSON.stringify([template,style,app,engine]));
const html=template
  .replace('本機開發版',`v${buildVersion}`)
  .replace('href="style.css"',`href="style.css?v=${version(style)}"`)
  .replace('src="app.js"',`src="app.js?v=${version(app)}"`);
for(const [file,content] of Object.entries({'index.html':html,'style.css':style,'app.js':app,'engine.js':engine}))await writeFile(`dist/${file}`,content);
await cp('data','dist/data',{recursive:true});
await copyFile('.nojekyll','dist/.nojekyll');
console.log(`Static site ready in dist/ — v${buildVersion}`);
