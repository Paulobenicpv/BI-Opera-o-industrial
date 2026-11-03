const fs=require('fs');const esbuild=require('esbuild');const less=require('less');
(async()=>{const js=esbuild.buildSync({entryPoints:['src/preview.ts'],bundle:true,write:false,minify:true,format:'iife',target:'es2022'}).outputFiles[0].text;
const css=(await less.render(fs.readFileSync('style/visual.less','utf8'))).css;
fs.writeFileSync('../PREVIA_FABRICA_3D.html','<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Fábrica 3D — prévia</title><style>html,body,#app{margin:0;width:100%;height:100%;}'+css+'</style><div id="app"></div><script>'+js.replace(/<\/script/gi,'<\\/script')+'</script></html>');})();
