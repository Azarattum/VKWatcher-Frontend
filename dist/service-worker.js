if(!self.define){const e=async e=>{if("require"!==e&&(e+=".js"),!s[e]&&(await new Promise(async r=>{if("document"in self){const s=document.createElement("script");s.src=e,document.head.appendChild(s),s.onload=r}else importScripts(e),r()}),!s[e]))throw new Error(`Module ${e} didn’t register its module`);return s[e]},r=async(r,s)=>{const i=await Promise.all(r.map(e));s(1===i.length?i[0]:i)};r.toUrl=e=>`./${e}`;const s={require:Promise.resolve(r)};self.define=(r,i,c)=>{s[r]||(s[r]=new Promise(async s=>{let o={};const n={uri:location.origin+r.slice(1)},f=await Promise.all(i.map(r=>"exports"===r?o:"module"===r?n:e(r))),d=c(...f);o.default||(o.default=d),s(o)}))}}define("./service-worker.js",["./workbox-7c85bfc1"],(function(e){"use strict";self.addEventListener("message",e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()}),e.precacheAndRoute([{url:"0.bundle.js",revision:"16e40c79ebbbefbe574fcb6fa2e61e91"},{url:"1.bundle.js",revision:"20c477e340fe4147f274379115800d5b"},{url:"53f9b441cc2d3a7398f2.worker.js",revision:"c2d0fdc8e33be4a20fd60af8b6bbf745"},{url:"bundle.js",revision:"6d30554861b0d75630e5e01be349b97f"},{url:"c1c33535fdf16acf9f15.worker.js",revision:"fd7b1c0bbf3e218327d96716d76fd38f"},{url:"index.html",revision:"72dc863768db152e4b6817ec8ca04d60"}],{})}));
