!function(t){var e={};function s(a){if(e[a])return e[a].exports;var i=e[a]={i:a,l:!1,exports:{}};return t[a].call(i.exports,i,i.exports,s),i.l=!0,i.exports}s.m=t,s.c=e,s.d=function(t,e,a){s.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:a})},s.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},s.t=function(t,e){if(1&e&&(t=s(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var a=Object.create(null);if(s.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var i in t)s.d(a,i,function(e){return t[e]}.bind(null,i));return a},s.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return s.d(e,"a",e),e},s.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},s.p="",s(s.s=0)}([function(t,e,s){"use strict";const a=self;a.addEventListener("message",async t=>{if(t.data.url){const e=t.data.url;Fetcher.initialize(e)}null!=t.data.userId&&(await Fetcher.selectUser(t.data.userId),a.postMessage({loaded:!0}))});class Fetcher{static async initialize(t){if(this.url=t,this.activeRequests++,!await this.fetchNames())throw new Error("Unable to load names!");this.activeRequests--,setTimeout(this.backgroundLoad.bind(this),this.requestInterval)}static async selectUser(t){this.loadStatuses[t]==i.None&&(this.activeRequests++,this.loadStatuses[t]=i.Requested,await this.fetchSessions(t)&&(this.loadStatuses[t]=i.Loaded),this.activeRequests--),setTimeout((async()=>{this.loadStatuses[t]!=i.Full&&(this.activeRequests++,await this.fetchSessions(t,!0)&&(this.loadStatuses[t]=i.Full),this.activeRequests--)}).bind(this),this.requestInterval)}static async fetchSessions(t,e=!1){var s,a;let i,n=null;const o=this.ids[t],c=fetch(`${this.url}/api/sessions/get/${o}/${e?"30":"0/30"}`),u=await caches.match(`${o}/${e?"all":"30"}`);u&&(i=null===(s=n=await u.json())||void 0===s?void 0:s.sessions.length,await this.call("gotsessions",n,t));try{const s=await c;(await caches.open("api-cache")).put(`${o}/${e?"all":"30"}`,s.clone()),(null===(a=n=await s.json())||void 0===a?void 0:a.sessions.length)!=i&&await this.call("gotsessions",n,t)}catch(t){}return n}static async fetchNames(){let t,e=null;const s=fetch(this.url+"/api/users/name/all"),a=await caches.match("names");a&&(e=await a.json(),this.ids=e.map(t=>t.id),this.loadStatuses=e.map(()=>i.None),t=e.length,await this.call("gotnames",e));try{const a=await s;(await caches.open("api-cache")).put("names",a.clone()),e=await a.json(),this.ids=e.map(t=>t.id),this.loadStatuses=e.map(()=>i.None),e.length!=t&&await this.call("gotnames",e)}catch(t){}return e}static async fetchMap(){let t=null;const e=fetch(this.url+"/api/sessions/map"),s=await caches.match("map");s&&(t=await s.json(),await this.call("gotmap",t));try{const s=await e;(await caches.open("api-cache")).put("map",s.clone()),t=await s.json(),await this.call("gotmap",t)}catch(t){}return t}static async backgroundLoad(t){if(null==t)this.activeRequests++,this.fetchMap().then(()=>{this.activeRequests--}),setTimeout(()=>{this.backgroundLoad(0)},this.requestInterval);else{if(t>=this.ids.length)return void(this.loadStatuses.every(t=>t!=i.None)||setTimeout(()=>{this.backgroundLoad(0)},this.requestInterval));if(this.activeRequests>=this.maxRequests)return void setTimeout(()=>{this.backgroundLoad(t)},this.requestInterval);if(this.loadStatuses[t]!=i.None)return void setTimeout(()=>{this.backgroundLoad(t+1)},this.requestInterval);this.activeRequests++,this.loadStatuses[t]=i.Requested,this.fetchSessions(t).then(e=>{this.loadStatuses[t]=i.Loaded,this.activeRequests--}),setTimeout(()=>{this.backgroundLoad(t+1)},this.requestInterval)}}static call(t,...e){a.postMessage({event:t,args:e})}}var i;Fetcher.maxRequests=3,Fetcher.requestInterval=200,Fetcher.activeRequests=0,function(t){t[t.None=0]="None",t[t.Requested=1]="Requested",t[t.Loaded=2]="Loaded",t[t.Full=3]="Full"}(i||(i={}))}]);