import {mkdir,copyFile,cp} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
for(const file of ['index.html','style.css','app.js','engine.js'])await copyFile(file,`dist/${file}`);
await cp('data','dist/data',{recursive:true});
await copyFile('.nojekyll','dist/.nojekyll');
console.log('Static site ready in dist/');
