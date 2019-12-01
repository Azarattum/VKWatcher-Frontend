!function(t){var e={};function s(n){if(e[n])return e[n].exports;var r=e[n]={i:n,l:!1,exports:{}};return t[n].call(r.exports,r,r.exports,s),r.l=!0,r.exports}s.m=t,s.c=e,s.d=function(t,e,n){s.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},s.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},s.t=function(t,e){if(1&e&&(t=s(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(s.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var r in t)s.d(n,r,function(e){return t[e]}.bind(null,r));return n},s.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return s.d(e,"a",e),e},s.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},s.p="",s(s.s=14)}([function(t,e,s){"use strict";s.d(e,"a",(function(){return DateUtils}));class DateUtils{static getDaysBetween(t,e){t=new Date(t),e=new Date(e),t=this.normalizeDateUp(t),e=this.normalizeDateUp(e);const s=Math.abs(+t-+e);return Math.round(s/864e5)}static normalizeDateUp(t){return(t=new Date(+t)).setHours(0),t.setMinutes(0),t.setSeconds(0),t.setMilliseconds(0),t}static normalizeDateDown(t){return(t=new Date(+t)).setHours(23),t.setMinutes(59),t.setSeconds(59),t.setMilliseconds(499),t}static getGlobalDay(t){return this.getDaysBetween(new Date(0),+t)}static getDateFromGlobalDay(t){return this.normalizeDateUp(new Date(864e5*t))}static combineDate(t,e){const s=new Date(+t);return s.setHours(e.getHours()),s.setMinutes(e.getMinutes()),s.setSeconds(e.getSeconds()),s.setMilliseconds(e.getMilliseconds()),s}static getReadableDuration(t){const e=Math.floor(t/60/60),s=Math.floor((t-3600*e)/60);return(e>0?e+" h, ":"")+(s>0?s+" min, ":"")+Math.floor(t-3600*e-60*s)+" sec"}}},function(t,e,s){"use strict";s.d(e,"a",(function(){return EmptyFilter}));var n=s(3);class EmptyFilter extends n.a{constructor(){super(...arguments),this.type="empty"}passDay(t){return 0!=t.sessions.length}passSession(t){return!0}}},function(t,e,s){"use strict";s.d(e,"b",(function(){return Session})),s.d(e,"a",(function(){return n}));var n,r=s(0);class Session{constructor(t,e=t,s=n.unknown){t instanceof Date&&(t=Math.round(+t/1e3)),e instanceof Date&&(e=Math.round(+e/1e3)),t>=e&&(t=e-15),this.from=new Date(1e3*t),this.to=new Date(1e3*Math.max(t,e)),this.platform=s,this.inSleep=!1}get length(){return Math.round((+this.to-+this.from)/1e3)}isCovered(t,e=!0){const s=e?+r.a.normalizeDateUp(this.from):+this.from,n=e?+r.a.normalizeDateDown(this.to):+this.to;return+t>=s&&+t<=n}isOverNight(){return this.from.getDate()!==this.to.getDate()||this.from.getMonth()!==this.to.getMonth()||this.from.getFullYear()!==this.to.getFullYear()}splitOverNights(){const t=[];if(!this.isOverNight())return[this];let e=new Date(+this.from),s=new Date(+this.from);s=r.a.normalizeDateDown(s),t.push(new Session(e,s,this.platform));const n=r.a.getDaysBetween(this.from,this.to)-1;for(let i=0;i<n;i++)e.setDate(e.getDate()+1),s.setDate(s.getDate()+1),e=r.a.normalizeDateUp(e),s=r.a.normalizeDateDown(s),t.push(new Session(e,s,this.platform));return e=new Date(+this.to),s=new Date(+this.to),+(e=r.a.normalizeDateUp(e))!=+s&&t.push(new Session(e,s,this.platform)),t}toObject(){return Object.assign({},this)}}!function(t){t[t.unknown=0]="unknown",t[t.mobile=1]="mobile",t[t.iphone=2]="iphone",t[t.ipad=3]="ipad",t[t.android=4]="android",t[t.wphone=5]="wphone",t[t.windows=6]="windows",t[t.web=7]="web"}(n||(n={}))},function(t,e,s){"use strict";s.d(e,"a",(function(){return Filter}));class Filter{constructor(t){this.enabled=!0,this.id=t}toggle(t){this.enabled=null==t?!this.enabled:t}toObject(){return Object.assign({},this)}}},function(t,e,s){"use strict";s.d(e,"a",(function(){return Day}));var n=s(0);class Day{constructor(t,e=[]){this.date=n.a.normalizeDateUp(t),this.sessions=e}addSession(t){if(t instanceof Array)for(const e of t)this.addSession(e);else this.sessions.push(t)}getSession(t,e=!1){let s=null,n=1/0;for(const r of this.sessions){if(r.isCovered(t,!1))return r;if(e){const e=Math.min(Math.abs(+r.from-+t),Math.abs(+r.to-+t));e<n&&(n=e,s=r)}}return s}applySessionsFilter(t){if(!t.enabled)return new Day(new Date(+this.date),this.sessions.slice(0));const e=new Day(this.date),s=this.sessions.filter(e=>t.passSession(e));return e.addSession(s),e}applyFilter(t){const e=new Day(new Date(+this.date),this.sessions.slice(0));return t.enabled?t.passDay(e)?e:null:e}toObject(){const t=Object.assign({},this);t.sessions=[];for(const e in this.sessions)t.sessions.push(this.sessions[e].toObject());return t}}},function(t,e,s){"use strict";s.d(e,"a",(function(){return DeviceFilter}));var n=s(3),r=s(2);class DeviceFilter extends n.a{constructor(t,e=null){super(t),this.type="device",this.platform=e}passDay(t){return!0}passSession(t,e=null){return null==(e=e||this.platform)||-1==e||(Array.isArray(e)?e.some(e=>this.passSession(t,e)):"string"==typeof e?r.a[t.platform]==e.toLowerCase():!!Number.isFinite(e)&&t.platform==e)}}},function(t,e,s){"use strict";s.d(e,"a",(function(){return PeriodFilter}));var n=s(3),r=s(0);class PeriodFilter extends n.a{constructor(t,e=-1/0,s=1/0){super(t),this.type="period",this.from=e,this.to=Math.max(s,e)}passDay(t){const e=r.a.getGlobalDay(t.date);return e>=this.from&&e<=this.to}passSession(t){return!0}}},function(t,e,s){"use strict";s.d(e,"a",(function(){return PeriodAnalyzer}));class PeriodAnalyzer{constructor(t=!0){this.description="Prefered "+(t?"Online":"Offline")+" Periods",this.isOnline=t}async analyze(t){const e=[],s=Array(...Array(48)).map(t=>0),n=[];t.getDays().forEach(t=>n.push(...t.sessions));for(const t of n){let e=2*t.from.getHours()+(t.from.getMinutes()>=30?1:0),n=t.length,r=60*((e%2?60:30)-t.from.getMinutes())-t.from.getSeconds();for(;n>r;)s[e]+=r,n-=r,r=1800,e++;s[e]+=n}let r=[];for(let t=0;t<3;t++){const t=[];let e=this.isOnline?Math.max(...s):Math.min(...s);const n=s.indexOf(e);for(let r=n;r<2*s.length;r++){const n=s[r%s.length]/e;if(!(e<=0||n>.7&&n<1.3))break;t.push(r%s.length),e<=0&&(e=s[r%s.length])}e=this.isOnline?Math.max(...s):Math.min(...s);for(let r=n-1;r>=0;r--){const n=s[r%s.length]/e;if(!(0==e||n>.7&&n<1.3))break;t.unshift(r%s.length),e<=0&&(e=s[r%s.length])}r.push(...t);for(const e of t)s[e]=1/0*(this.isOnline?-1:1)}r=r.filter((t,e,s)=>s.indexOf(t)===e),this.isOnline||r.sort((t,e)=>t>e?1:-1);let i=0;for(let t=0;t<r.length;t++)t>0&&1!=Math.abs(r[t]-r[t-1])&&47!=Math.abs(r[t]-r[t-1])&&i++,e[i]||(e[i]=[]),e[i].push(r[t]);for(const t in e)e[t]=e[t][0]+(1==e[t].length?"":" "+e[t][e[t].length-1]);return e.format="period",e}}},function(t,e,s){"use strict";s.d(e,"a",(function(){return AnalyzersManager}));class AnalyzersManager{constructor(t){this.callback=t,this.analyzers=[]}addAnalyzer(t){this.analyzers.push(t)}async analyze(t){let e=0;for(const s of this.analyzers)s.analyze(t).then(t=>{e++,this.callback(t,s.description,e>=this.analyzers.length)})}}},function(t,e,s){"use strict";s.d(e,"a",(function(){return DurationAnalyzer}));class DurationAnalyzer{constructor(){this.description="Session Duration"}async analyze(t){const e={},s=[];return t.getDays().forEach(t=>s.push(...t.sessions.map(t=>t.length))),s.length<=0?[]:(e.min=Math.min(...s),e.max=Math.max(...s),e.avg=s.reduce((t,e)=>t+e)/s.length,e.format="time",e)}}},function(t,e,s){"use strict";s.d(e,"a",(function(){return User}));var n=s(0),r=s(4),i=s(2),a=s(1),o=s(5),l=s(6);class User{constructor(t,e){this.days={},this.filters=[],this.id=e,this.name=t}getDays(t=!0){const e=[],s=this.getDaysEnumenator(t);let n=null;for(;null!=(n=s());)e.push(n);return e}getDaysEnumenator(t=!0){const e=Object.keys(this.days),s=+e[e.length-1];let n=+e[0];return()=>{if(n>s)return null;{let e=null;for(;null==e;){if(void 0===(e=this.days[n]))return e;if(n++,t){for(const t of this.filters)e=e.applySessionsFilter(t);for(const t of this.filters){if(null===e)break;e=e.applyFilter(t)}}}return e}}}addSession(t){if(t.isOverNight()){for(const e of t.splitOverNights())this.addSession(e);return}const e=n.a.getGlobalDay(t.from);if(void 0===this.days[e]){const s=Object.keys(this.days);if(s.length>0){const t=+s[0],i=+s[s.length-1];for(let s=e+1;s<t;s++)this.days[s]=new r.a(n.a.getDateFromGlobalDay(s));for(let t=e-1;t>i;t--)this.days[t]=new r.a(n.a.getDateFromGlobalDay(t))}this.days[e]=new r.a(t.from)}this.days[e].addSession(t)}addFilter(t){this.filters.push(t)}getFilter(t){return this.filters.find(e=>e.id==t)}clearFilters(){this.filters=[]}toObject(){const t=Object.assign({},this);t.days={};for(const e in this.days)t.days[e]=this.days[e].toObject();t.filters=[];for(const e in this.filters)t.filters.push(this.filters[e].toObject());return t}static fromObject(t){const e=new User(t.name,+t.id);if(t.sessions)for(const s of t.sessions)void 0!==s.from&&e.addSession(new i.b(s.from,s.to,s.platform));else if(t.days)for(const s of Object.values(t.days))if(s.sessions)for(const t of s.sessions)void 0!==t.from&&e.addSession(new i.b(t.from,t.to,t.platform));if(t.filters){t.filters.forEach(t=>{switch((t=Object.assign({},t)).type){case"empty":t.__proto__=a.a.prototype;break;case"device":t.__proto__=o.a.prototype;break;case"period":t.__proto__=l.a.prototype}e.addFilter(t)})}else{const t=new a.a("empty"),s=new o.a("device"),n=new l.a("period"),r=Object.keys(e.days);t.toggle(!1),n.from=+r[0],n.to=+r[r.length-1],e.addFilter(t),e.addFilter(s),e.addFilter(n)}return e}}},function(t,e,s){"use strict";s.d(e,"a",(function(){return ActivityAnalyzer}));var n=s(1);class ActivityAnalyzer{constructor(){this.description="Time Per Day"}async analyze(t){const e={},s=[];return t.addFilter(new n.a(0)),t.getDays().forEach(t=>s.push(t.sessions.reduce((t,e)=>t+e.length,0))),s.length<=0?[]:(e.min=Math.min(...s),e.max=Math.max(...s),e.avg=s.reduce((t,e)=>t+e)/s.length,e.format="time",e)}}},function(t,e,s){"use strict";s.d(e,"a",(function(){return PickupsAnalyzer}));var n=s(1);class PickupsAnalyzer{constructor(){this.description="Sessions Per Day"}async analyze(t){const e={},s=[];return t.addFilter(new n.a(0)),t.getDays().forEach(t=>s.push(t.sessions.length)),s.length<=0?[]:(e.min=Math.min(...s),e.max=Math.max(...s),e.avg=s.reduce((t,e)=>t+e)/s.length,e)}}},function(t,e,s){"use strict";s.d(e,"a",(function(){return PlatformAnalyzer}));var n=s(1),r=s(2);class PlatformAnalyzer{constructor(){this.description="Prefered Platforms"}async analyze(t){const e=Array(...Array(Object.keys(r.a).length)).map(t=>0);return t.addFilter(new n.a(0)),t.getDays().forEach(t=>t.sessions.forEach(t=>{e[t.platform]+=+t.length})),e.slice().sort((t,e)=>t>e?-1:1).filter(t=>t>0).map(t=>r.a[e.indexOf(t)]).slice(0,3)}}},function(t,e,s){"use strict";s.r(e);var n=s(8),r=s(9),i=s(10),a=s(11),o=s(12),l=s(13),c=s(7);const u=self,f=new n.a((function(t,e,s){u.postMessage({result:t,description:e,done:s})}));u.addEventListener("message",(function(t){const e=i.a.fromObject(t.data.user);f.analyze(e)}));const h=new r.a,d=new a.a,y=new l.a,p=new o.a,m=new c.a(!0),g=new c.a(!1);f.addAnalyzer(h),f.addAnalyzer(d),f.addAnalyzer(p),f.addAnalyzer(y),f.addAnalyzer(m),f.addAnalyzer(g)}]);