"use strict";var p8=Object.create;var El=Object.defineProperty;var f8=Object.getOwnPropertyDescriptor;var h8=Object.getOwnPropertyNames;var g8=Object.getPrototypeOf,m8=Object.prototype.hasOwnProperty;var yn=(t,e)=>()=>(t&&(e=t(t=0)),e);var An=(t,e)=>()=>(e||t((e={exports:{}}).exports,e),e.exports),wi=(t,e)=>{for(var n in e)El(t,n,{get:e[n],enumerable:!0})},mh=(t,e,n,i)=>{if(e&&typeof e=="object"||typeof e=="function")for(let a of h8(e))!m8.call(t,a)&&a!==n&&El(t,a,{get:()=>e[a],enumerable:!(i=f8(e,a))||i.enumerable});return t};var Le=(t,e,n)=>(n=t!=null?p8(g8(t)):{},mh(e||!t||!t.__esModule?El(n,"default",{value:t,enumerable:!0}):n,t)),y8=t=>mh(El({},"__esModule",{value:!0}),t);var id={};wi(id,{buildRequest:()=>Hs,chat:()=>Cl,createProviderHttpError:()=>Us,extractStreamDelta:()=>ed,parseResponse:()=>Sl,streamChat:()=>nd,summarizeProviderErrorBody:()=>xh,validateConfig:()=>ga});function ga(t){return t.provider?t.provider!=="ollama"&&(!t.apiKey||t.apiKey.trim()==="")?{valid:!1,error:"AI Provider API Key \u672A\u914D\u7F6E"}:!t.model||t.model.trim()===""?{valid:!1,error:"AI Provider \u6A21\u578B\u672A\u914D\u7F6E"}:{valid:!0}:{valid:!1,error:"AI Provider \u7C7B\u578B\u7F3A\u5931"}}function v8(t){return t.replace(/sk-[a-zA-Z0-9_-]{20,}/g,"sk-***").replace(/Bearer\s+[a-zA-Z0-9._\-+=]+/gi,"Bearer ***").replace(/x-api-key:\s*\S+/gi,"x-api-key: ***")}function xh(t){let e;try{let a=JSON.parse(t);e=a.error?.message||a.message||""}catch{e=t}let i=String(e).trim().replace(/\n/g," ").slice(0,x8);return i?v8(i):"(empty response)"}async function Us(t){let e=await t.text().catch(()=>""),n=xh(e);return new Error(`AI Provider \u8BF7\u6C42\u5931\u8D25 (HTTP ${t.status}): ${n}`)}function Hs(t,e){let n=e.find(a=>a.role==="system"),i=e.filter(a=>a.role!=="system");switch(t.provider){case"openai":{let a=(t.baseUrl||"https://api.openai.com").replace(/\/+$/,""),r=a.endsWith("/v1")?"/chat/completions":"/v1/chat/completions",s=t.reasoningEffort||(t.enableThinking?"high":void 0),o={model:t.model,messages:e};return s&&(o.reasoning_effort=s),{url:`${a}${r}`,method:"POST",headers:{Authorization:`Bearer ${t.apiKey}`,"Content-Type":"application/json"},body:JSON.stringify(o)}}case"anthropic":{let a={model:t.model,system:n?.content,messages:i.map(r=>({role:r.role,content:r.content}))};return(t.enableThinking||t.reasoningEffort)&&(a.thinking={type:"adaptive",effort:t.reasoningEffort||"high"}),{url:t.baseUrl||"https://api.anthropic.com/v1/messages",method:"POST",headers:{"x-api-key":t.apiKey,"anthropic-version":"2023-06-01","Content-Type":"application/json"},body:JSON.stringify(a)}}default:{let r=(t.baseUrl||(t.provider==="ollama"?"http://localhost:11434":"")).replace(/\/+$/,""),s=r.endsWith("/v1")?"/chat/completions":"/v1/chat/completions",o=t.reasoningEffort||(t.enableThinking?"high":void 0),l={model:t.model,messages:e};return o&&(l.reasoning_effort=o),{url:`${r}${s}`,method:"POST",headers:{"Content-Type":"application/json",...t.apiKey?{Authorization:`Bearer ${t.apiKey}`}:{}},body:JSON.stringify(l)}}}}async function Cl(t,e){let n=ga(e);if(!n.valid)throw new Error(n.error);let i=Hs(e,t),a=await fetch(i.url,{method:i.method||"POST",headers:i.headers,body:i.body});if(!a.ok)throw await Us(a);let r=await a.json();return{content:Sl(e.provider,r).content}}function ed(t,e){if(!e.startsWith("data: "))return"";let n=e.slice(6).trim();if(!n||n==="[DONE]")return"";try{let i=JSON.parse(n);if(t==="anthropic")return i.type==="content_block_delta"&&i.delta?.text?i.delta.text:"";let a=i.choices;return a&&a.length>0&&a[0].delta?.content?a[0].delta.content:""}catch{return""}}async function nd(t,e,n){let i=ga(e);if(!i.valid){n.onError(new Error(i.error));return}try{let a=Hs(e,t),r=JSON.parse(a.body||"{}");r.stream=!0;let s={...a.headers,Accept:"text/event-stream"},o=await fetch(a.url,{method:a.method||"POST",headers:s,body:JSON.stringify(r)});if(!o.ok)throw await Us(o);if(!o.body)throw new Error("Response body is null \u2014 streaming not supported");let l=o.body.getReader(),c=new TextDecoder,u="",d="";for(;;){let{done:p,value:f}=await l.read();if(p)break;d+=c.decode(f,{stream:!0});let y=d.split(`
`);d=y.pop()||"";for(let x of y){let E=x.trim();if(!E)continue;let v=ed(e.provider,E);v&&(u+=v,n.onDelta(v))}}if(d.trim()){let p=ed(e.provider,d.trim());p&&(u+=p,n.onDelta(p))}n.onDone(u)}catch(a){n.onError(a)}}function Sl(t,e){switch(t){case"openai":{let n=e.choices;if(!n||n.length===0)throw new Error("Empty response from OpenAI");return{role:"assistant",content:n[0].message.content}}case"anthropic":{let n=e.content;if(!n||n.length===0)throw new Error("Empty response from Anthropic");return{role:"assistant",content:n[0].text}}default:{let n=e.choices;if(!n||n.length===0)throw new Error("Empty response from AI provider");return{role:"assistant",content:n[0].message.content}}}}var x8,Ci=yn(()=>{"use strict";x8=200});function Eh(t){let e=require("fs");try{return e.readdirSync(t,{withFileTypes:!0}).filter(n=>n.isDirectory()).map(n=>`${t}/${n.name}`)}catch{return[]}}function k8(t){let e=`${t}/.nvm/versions/node`,n=`${t}/.local/share/fnm/node-versions`,i=Eh(e).map(r=>`${r}/bin`),a=Eh(n).map(r=>`${r}/installation/bin`);return wh([...i,...a,`${t}/.asdf/shims`,`${t}/.local/share/mise/shims`])}function E8(){let{homedir:t}=require("os"),e=t();return[`${e}/.opencode/bin`,`${e}/.local/bin`,`${e}/.npm-global/bin`,`${e}/.bun/bin`,`${e}/.yarn/bin`,`${e}/.volta/bin`,`${e}/Library/pnpm`,...k8(e),"/opt/homebrew/bin","/usr/local/bin","/usr/bin","/bin","/usr/sbin","/sbin"]}function wh(t){return[...new Set(t.map(e=>e.trim()).filter(Boolean))]}function w8(t){return`'${t.replace(/'/g,"'\\''")}'`}function C8(){let{execSync:t}=require("child_process"),e=process.env.SHELL||"/bin/zsh";try{return t('printf "%s" "$PATH"',{encoding:"utf-8",timeout:3e3,shell:e,env:process.env}).trim()}catch{return""}}function S8(t){return[...new Set([...(t||"").split(":").filter(Boolean),...C8().split(":").filter(Boolean),...E8()])].join(":")}function ad(t){let e={...process.env,...t};return e.PATH=S8(e.PATH),e}async function ge(t){let{execSync:e}=require("child_process"),n=ad(),i=n.PATH.split(":").map(s=>`${s}/${t}`),a=process.env.SHELL||"/bin/zsh";try{let s=e(`command -v ${w8(t)}`,{encoding:"utf-8",timeout:5e3,shell:a,env:n}).trim().split(/\r?\n/)[0];if(s)return s}catch{}let r=[...i,t];for(let s of wh(r))try{return e(`"${s}" --version 2>&1`,{encoding:"utf-8",timeout:5e3,env:n}),s}catch{continue}return null}var mr=yn(()=>{"use strict"});var Sh={};wi(Sh,{claudeCodeProvider:()=>rd});var A8,T8,Ch,M8,rd,sd=yn(()=>{"use strict";mr();({spawn:A8}=require("child_process")),T8=require("readline"),Ch="claude",M8=600*1e3,rd={name:"Claude Code",description:"Anthropic \u51FA\u54C1\u7684\u672C\u5730 AI \u7F16\u7A0B agent\uFF0C\u901A\u8FC7 claude CLI \u8C03\u7528",async detect(){let t=await ge(Ch);if(!t)return!1;try{let{execSync:e}=require("child_process"),n=e(`"${t}" --version 2>&1`,{encoding:"utf-8",timeout:1e4});return/[Cc]laude|[0-9]+\.[0-9]+\.[0-9]+/.test(n)}catch{return!1}},execute(t,e){let n=null,i=!1,a=null,r=null,s=null,o=Date.now(),l=e?.timeoutMs||M8;return(async()=>{try{let u=await ge(Ch);if(!u){let h=new Error("\u627E\u4E0D\u5230 claude CLI\uFF0C\u8BF7\u786E\u8BA4\u5DF2\u5B89\u88C5 Claude Code");s?.(h),r?.({status:"failed",output:"",error:h.message,durationMs:Date.now()-o});return}let d=["-p","--output-format","stream-json","--input-format","stream-json","--verbose"];e?.model&&d.push("--model",e.model);let p={...process.env};if(e?.env&&Object.assign(p,e.env),n=A8(u,d,{env:p,cwd:e?.cwd||process.cwd(),stdio:["pipe","pipe","pipe"]}),i){n.kill();return}n.on("error",h=>{s?.(h),r?.({status:"failed",output:"",error:h.message,durationMs:Date.now()-o})});let f=setTimeout(()=>{n&&!n.killed&&(n.kill(),r?.({status:"timeout",output:"",error:"\u6267\u884C\u8D85\u65F6",durationMs:Date.now()-o}))},l),y=T8.createInterface({input:n.stdout,crlfDelay:1/0}),x="",E="";y.on("line",h=>{if(h.trim())try{let b=JSON.parse(h);switch(b.type){case"system":b.session_id&&(x=b.session_id),b.subtype==="init"&&a?.({type:"status",content:"running",sessionId:x});break;case"assistant":{let j=b.message?.content||[];for(let T of j)T.type==="text"&&T.text?(E+=T.text,a?.({type:"text",content:T.text})):T.type==="tool_use"&&a?.({type:"tool-use",toolName:T.name,toolInput:T.input});break}case"user":{let j=b.message?.content||[];for(let T of j)T.type==="tool_use"&&T.name&&a?.({type:"tool-result",toolName:T.name});break}case"result":clearTimeout(f);let w=b.is_error||b.subtype==="error_during_execution",B=b.output||E;r?.({status:w?"failed":"completed",output:B,error:w?b.output||"\u672A\u77E5\u9519\u8BEF":void 0,durationMs:Date.now()-o});break}}catch{}}),y.on("close",()=>{clearTimeout(f),i||r?.({status:"completed",output:E,durationMs:Date.now()-o})});let v=JSON.stringify({type:"user",message:{role:"user",content:t}});n.stdin.write(v+`
`),n.stdin.end()}catch(u){s?.(u),r?.({status:"failed",output:"",error:u.message,durationMs:Date.now()-o})}})(),{set onMessage(u){a=u},get onMessage(){return a},set onDone(u){r=u},get onDone(){return r},set onError(u){s=u},get onError(){return s},abort(){i=!0,n&&!n.killed&&n.kill()}}}}});var _h={};wi(_h,{hermesProvider:()=>od});var D8,I8,Mh,F8,od,ld=yn(()=>{"use strict";mr();({spawn:D8}=require("child_process")),I8=require("readline"),Mh="hermes",F8=600*1e3,od={name:"Hermes",description:"\u5F00\u6E90 AI agent \u6846\u67B6\uFF0C\u652F\u6301\u591A provider\uFF0C\u901A\u8FC7 hermes CLI \u8C03\u7528",async detect(){let t=await ge(Mh);if(!t)return!1;try{let{execSync:e}=require("child_process"),n=e(`${t} --version 2>&1`,{encoding:"utf-8",timeout:1e4});return/Hermes Agent/i.test(n)}catch{return!1}},execute(t,e){let n=null,i=!1,a=null,r=null,s=null,o=Date.now();return(async()=>{try{let c=await ge(Mh);if(!c){let E=new Error("\u627E\u4E0D\u5230 hermes CLI\uFF0C\u8BF7\u786E\u8BA4\u5DF2\u5B89\u88C5 Hermes Agent");s?.(E),r?.({status:"failed",output:"",error:E.message,durationMs:Date.now()-o});return}let u=["-z",t];e?.model&&u.unshift("-m",e.model);let d={...process.env,...e?.env};if(n=D8(c,u,{env:d,cwd:e?.cwd||process.cwd(),stdio:["ignore","pipe","pipe"]}),i){n.kill();return}n.on("error",E=>{s?.(E),r?.({status:"failed",output:"",error:E.message,durationMs:Date.now()-o})});let p=setTimeout(()=>{n&&!n.killed&&(n.kill(),r?.({status:"timeout",output:"",error:"\u6267\u884C\u8D85\u65F6",durationMs:Date.now()-o}))},e?.timeoutMs||F8),f="",y=I8.createInterface({input:n.stdout,crlfDelay:1/0});y.on("line",E=>{f+=E+`
`,a?.({type:"text",content:E+`
`})}),y.on("close",()=>{clearTimeout(p),r?.({status:"completed",output:f.trim(),durationMs:Date.now()-o})});let x="";n.stderr&&n.stderr.on("data",E=>{x+=E.toString()}),n.on("close",E=>{clearTimeout(p),E!==0&&f===""&&r?.({status:"failed",output:"",error:`hermes \u9000\u51FA\u7801 ${E}: ${x.slice(0,500)}`,durationMs:Date.now()-o})})}catch(c){s?.(c),r?.({status:"failed",output:"",error:c.message,durationMs:Date.now()-o})}})(),{set onMessage(c){a=c},get onMessage(){return a},set onDone(c){r=c},get onDone(){return r},set onError(c){s=c},get onError(){return s},abort(){i=!0,n&&!n.killed&&n.kill()}}}}});async function xr(t,e){if(!t.vault.getAbstractFileByPath(e))try{await t.vault.createFolder(e)}catch(i){if(!i.message?.includes("already exists"))throw i}}async function Ne(t,e){let n=e.split("/");if(n.length<2)return;let i=n.slice(0,-1),a="";for(let r of i)a=a?`${a}/${r}`:r,await xr(t,a)}var Hn=yn(()=>{"use strict"});function Gs(t){switch(t.type){case"diary_source":case"entity_source":case"material_source":return"source";case"user_reply":case"agent_reply":return"response";case"user_note":return t.data?.replyToBlockId?"response":"thinking";case"insight":return t.data?.replyToBlockId||t.data?.userReplyBlockId?"response":"thinking";case"output":case"task":case"decision":case"experiment":return"output";case"error":case"warning":return"system";default:return"thinking"}}var gd=yn(()=>{"use strict"});function wt(){return`block-${Date.now()}-${++i7}`}function ce(t){return{id:t.id||wt(),category:t.category||Gs({type:t.type,data:t.data}),type:t.type,title:t.title,summary:t.summary,bullets:t.bullets,detail:t.detail,sourceRefs:t.sourceRefs,agentRunId:t.agentRunId,position:t.position||{x:0,y:0},size:t.size||{...Ee},data:t.data}}var i7,Ee,le,qs=yn(()=>{"use strict";gd();i7=0,Ee={width:216,height:120},le={width:190,height:104}});var Vh={};wi(Vh,{diaryBlockToSource:()=>Yh,diaryBlocksToSources:()=>r7,parseDiaryDateFromPath:()=>Uh});function Uh(t){return t?(t.match(/(?:^|\/)(\d{4}-\d{2}-\d{2})(?:\.md)?$/)||t.match(/(\d{4}-\d{2}-\d{2})/))?.[1]:void 0}function Hh(t){return t.sourceDate||Uh(t.sourcePath)}function a7(t){let e=Hh(t);return e&&t.timestamp?`\u65E5\u8BB0\uFF1A${e} ${t.timestamp}`:e?`\u65E5\u8BB0\uFF1A${e}`:t.timestamp?`\u65E5\u8BB0\uFF1A${t.timestamp}`:"\u65E5\u8BB0"}function Yh(t,e){let n=Hh(t);return ce({type:"diary_source",category:"source",title:a7(t),summary:t.content.slice(0,120),detail:t.content,data:{diaryBlockId:t.id,sourceDate:n,sourcePath:t.sourcePath,timestamp:t.timestamp,parentId:t.parentId},position:{x:100,y:100+e*180},size:{...Ee}})}function r7(t){return t.map((e,n)=>Yh(e,n))}var Gh=yn(()=>{"use strict";qs()});var qh={};wi(qh,{createExplorationSession:()=>s7});function s7(t){let e=t.now||new Date().toISOString();return{id:t.id,title:t.title,canvasPath:t.canvasPath,createdAt:e,updatedAt:e,blocks:t.blocks||[],edges:[],groups:[],exportHistory:[]}}var Xh=yn(()=>{"use strict"});function Xs(t){let e=t;return e?.tracemind?.kind==="exploration_canvas"&&Array.isArray(e.nodes)&&Array.isArray(e.edges)}function md(t){let e=[`## ${t.title}`];return t.summary&&e.push("",t.summary),t.bullets?.length&&e.push("",...t.bullets.slice(0,3).map(n=>`- ${n}`)),e.join(`
`)}function Kh(t){return{nodes:[...t.blocks.map(e=>({id:e.id,type:e.type.endsWith("_source")&&typeof e.data?.filePath=="string"?"file":"text",x:e.position.x,y:e.position.y,width:e.size.width,height:e.size.height,text:md(e),file:typeof e.data?.filePath=="string"?e.data.filePath:void 0,tracemind:{version:"0.1",category:e.category||Gs(e),blockType:e.type,title:e.title,summary:e.summary,bullets:e.bullets,detail:e.detail,sourceRefs:e.sourceRefs,agentRunId:e.agentRunId,edited:e.edited,versions:e.versions,data:e.data}})),...(t.groups||[]).map(e=>({id:e.id,type:"group",x:e.position.x,y:e.position.y,width:e.size.width,height:e.size.height,label:e.title,tracemind:{version:"0.1",nodeType:"group",title:e.title,blockIds:e.blockIds,createdAt:e.createdAt}}))],edges:t.edges.map(e=>({id:e.id,fromNode:e.from,toNode:e.to,label:e.label,tracemind:{edgeType:e.type,agentRunId:e.agentRunId}})),tracemind:{kind:"exploration_canvas",version:"0.1",renderer:"blocksuite-edgeless",sessionId:t.id,title:t.title}}}function Zh(t){if(!Xs(t))throw new Error("Not a TraceMind exploration canvas");let e=t.nodes.filter(r=>r.type!=="group").map(r=>{let s=r.tracemind||{};return{id:r.id,type:s.blockType||"user_note",category:s.category||Gs({type:s.blockType||"user_note",data:s.data}),title:s.title||r.text?.split(`
`)[0]?.replace(/^##\s*/,"")||r.id,summary:s.summary,bullets:s.bullets,detail:s.detail,sourceRefs:s.sourceRefs,agentRunId:s.agentRunId,edited:s.edited,versions:s.versions,position:{x:r.x,y:r.y},size:{width:r.width,height:r.height},data:s.data}}),n=t.edges.map(r=>({id:r.id,from:r.fromNode,to:r.toNode,type:r.tracemind?.edgeType||"references",label:r.label,agentRunId:r.tracemind?.agentRunId})),i=new Date().toISOString(),a=t.nodes.filter(r=>r.type==="group").map(r=>{let s=r.tracemind||{};return{id:r.id,title:s.title||r.label||"\u5206\u7EC4",blockIds:Array.isArray(s.blockIds)?s.blockIds:[],position:{x:r.x,y:r.y},size:{width:r.width,height:r.height},createdAt:s.createdAt||i}});return{id:t.tracemind?.sessionId||`exploration-${Date.now()}`,title:t.tracemind?.title||"\u672A\u547D\u540D\u63A2\u7D22",canvasPath:"",createdAt:i,updatedAt:i,blocks:e,edges:n,groups:a,exportHistory:[]}}var Ml=yn(()=>{"use strict";gd()});var Qh={};wi(Qh,{loadExplorationSession:()=>xd,saveExplorationSession:()=>yd});async function yd(t,e){let n=Kh(e),i=JSON.stringify(n,null,2);await Ne(t,e.canvasPath);let a=t.vault.getFileByPath(e.canvasPath);a?await t.vault.modify(a,i):await t.vault.create(e.canvasPath,i)}async function xd(t,e){let n=t.vault.getFileByPath(e);if(!n)return null;try{let i=await t.vault.read(n),a=JSON.parse(i);if(!Xs(a))return null;let r=Zh(a);return r.canvasPath=e,r}catch{return null}}var vd=yn(()=>{"use strict";Ml();Hn()});var Dg=An(K=>{"use strict";var Bd=Symbol.for("react.transitional.element"),A7=Symbol.for("react.portal"),T7=Symbol.for("react.fragment"),M7=Symbol.for("react.strict_mode"),_7=Symbol.for("react.profiler"),B7=Symbol.for("react.consumer"),R7=Symbol.for("react.context"),D7=Symbol.for("react.forward_ref"),I7=Symbol.for("react.suspense"),F7=Symbol.for("react.memo"),Ag=Symbol.for("react.lazy"),O7=Symbol.for("react.activity"),Eg=Symbol.iterator;function z7(t){return t===null||typeof t!="object"?null:(t=Eg&&t[Eg]||t["@@iterator"],typeof t=="function"?t:null)}var Tg={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},Mg=Object.assign,_g={};function kr(t,e,n){this.props=t,this.context=e,this.refs=_g,this.updater=n||Tg}kr.prototype.isReactComponent={};kr.prototype.setState=function(t,e){if(typeof t!="object"&&typeof t!="function"&&t!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,t,e,"setState")};kr.prototype.forceUpdate=function(t){this.updater.enqueueForceUpdate(this,t,"forceUpdate")};function Bg(){}Bg.prototype=kr.prototype;function Rd(t,e,n){this.props=t,this.context=e,this.refs=_g,this.updater=n||Tg}var Dd=Rd.prototype=new Bg;Dd.constructor=Rd;Mg(Dd,kr.prototype);Dd.isPureReactComponent=!0;var wg=Array.isArray;function _d(){}var Mt={H:null,A:null,T:null,S:null},Rg=Object.prototype.hasOwnProperty;function Id(t,e,n){var i=n.ref;return{$$typeof:Bd,type:t,key:e,ref:i!==void 0?i:null,props:n}}function L7(t,e){return Id(t.type,e,t.props)}function Fd(t){return typeof t=="object"&&t!==null&&t.$$typeof===Bd}function N7(t){var e={"=":"=0",":":"=2"};return"$"+t.replace(/[=:]/g,function(n){return e[n]})}var Cg=/\/+/g;function Md(t,e){return typeof t=="object"&&t!==null&&t.key!=null?N7(""+t.key):e.toString(36)}function P7(t){switch(t.status){case"fulfilled":return t.value;case"rejected":throw t.reason;default:switch(typeof t.status=="string"?t.then(_d,_d):(t.status="pending",t.then(function(e){t.status==="pending"&&(t.status="fulfilled",t.value=e)},function(e){t.status==="pending"&&(t.status="rejected",t.reason=e)})),t.status){case"fulfilled":return t.value;case"rejected":throw t.reason}}throw t}function br(t,e,n,i,a){var r=typeof t;(r==="undefined"||r==="boolean")&&(t=null);var s=!1;if(t===null)s=!0;else switch(r){case"bigint":case"string":case"number":s=!0;break;case"object":switch(t.$$typeof){case Bd:case A7:s=!0;break;case Ag:return s=t._init,br(s(t._payload),e,n,i,a)}}if(s)return a=a(t),s=i===""?"."+Md(t,0):i,wg(a)?(n="",s!=null&&(n=s.replace(Cg,"$&/")+"/"),br(a,e,n,"",function(c){return c})):a!=null&&(Fd(a)&&(a=L7(a,n+(a.key==null||t&&t.key===a.key?"":(""+a.key).replace(Cg,"$&/")+"/")+s)),e.push(a)),1;s=0;var o=i===""?".":i+":";if(wg(t))for(var l=0;l<t.length;l++)i=t[l],r=o+Md(i,l),s+=br(i,e,n,r,a);else if(l=z7(t),typeof l=="function")for(t=l.call(t),l=0;!(i=t.next()).done;)i=i.value,r=o+Md(i,l++),s+=br(i,e,n,r,a);else if(r==="object"){if(typeof t.then=="function")return br(P7(t),e,n,i,a);throw e=String(t),Error("Objects are not valid as a React child (found: "+(e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)+"). If you meant to render a collection of children, use an array instead.")}return s}function Ll(t,e,n){if(t==null)return t;var i=[],a=0;return br(t,i,"","",function(r){return e.call(n,r,a++)}),i}function j7(t){if(t._status===-1){var e=t._result;e=e(),e.then(function(n){(t._status===0||t._status===-1)&&(t._status=1,t._result=n)},function(n){(t._status===0||t._status===-1)&&(t._status=2,t._result=n)}),t._status===-1&&(t._status=0,t._result=e)}if(t._status===1)return t._result.default;throw t._result}var Sg=typeof reportError=="function"?reportError:function(t){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var e=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof t=="object"&&t!==null&&typeof t.message=="string"?String(t.message):String(t),error:t});if(!window.dispatchEvent(e))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",t);return}console.error(t)},$7={map:Ll,forEach:function(t,e,n){Ll(t,function(){e.apply(this,arguments)},n)},count:function(t){var e=0;return Ll(t,function(){e++}),e},toArray:function(t){return Ll(t,function(e){return e})||[]},only:function(t){if(!Fd(t))throw Error("React.Children.only expected to receive a single React element child.");return t}};K.Activity=O7;K.Children=$7;K.Component=kr;K.Fragment=T7;K.Profiler=_7;K.PureComponent=Rd;K.StrictMode=M7;K.Suspense=I7;K.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=Mt;K.__COMPILER_RUNTIME={__proto__:null,c:function(t){return Mt.H.useMemoCache(t)}};K.cache=function(t){return function(){return t.apply(null,arguments)}};K.cacheSignal=function(){return null};K.cloneElement=function(t,e,n){if(t==null)throw Error("The argument must be a React element, but you passed "+t+".");var i=Mg({},t.props),a=t.key;if(e!=null)for(r in e.key!==void 0&&(a=""+e.key),e)!Rg.call(e,r)||r==="key"||r==="__self"||r==="__source"||r==="ref"&&e.ref===void 0||(i[r]=e[r]);var r=arguments.length-2;if(r===1)i.children=n;else if(1<r){for(var s=Array(r),o=0;o<r;o++)s[o]=arguments[o+2];i.children=s}return Id(t.type,a,i)};K.createContext=function(t){return t={$$typeof:R7,_currentValue:t,_currentValue2:t,_threadCount:0,Provider:null,Consumer:null},t.Provider=t,t.Consumer={$$typeof:B7,_context:t},t};K.createElement=function(t,e,n){var i,a={},r=null;if(e!=null)for(i in e.key!==void 0&&(r=""+e.key),e)Rg.call(e,i)&&i!=="key"&&i!=="__self"&&i!=="__source"&&(a[i]=e[i]);var s=arguments.length-2;if(s===1)a.children=n;else if(1<s){for(var o=Array(s),l=0;l<s;l++)o[l]=arguments[l+2];a.children=o}if(t&&t.defaultProps)for(i in s=t.defaultProps,s)a[i]===void 0&&(a[i]=s[i]);return Id(t,r,a)};K.createRef=function(){return{current:null}};K.forwardRef=function(t){return{$$typeof:D7,render:t}};K.isValidElement=Fd;K.lazy=function(t){return{$$typeof:Ag,_payload:{_status:-1,_result:t},_init:j7}};K.memo=function(t,e){return{$$typeof:F7,type:t,compare:e===void 0?null:e}};K.startTransition=function(t){var e=Mt.T,n={};Mt.T=n;try{var i=t(),a=Mt.S;a!==null&&a(n,i),typeof i=="object"&&i!==null&&typeof i.then=="function"&&i.then(_d,Sg)}catch(r){Sg(r)}finally{e!==null&&n.types!==null&&(e.types=n.types),Mt.T=e}};K.unstable_useCacheRefresh=function(){return Mt.H.useCacheRefresh()};K.use=function(t){return Mt.H.use(t)};K.useActionState=function(t,e,n){return Mt.H.useActionState(t,e,n)};K.useCallback=function(t,e){return Mt.H.useCallback(t,e)};K.useContext=function(t){return Mt.H.useContext(t)};K.useDebugValue=function(){};K.useDeferredValue=function(t,e){return Mt.H.useDeferredValue(t,e)};K.useEffect=function(t,e){return Mt.H.useEffect(t,e)};K.useEffectEvent=function(t){return Mt.H.useEffectEvent(t)};K.useId=function(){return Mt.H.useId()};K.useImperativeHandle=function(t,e,n){return Mt.H.useImperativeHandle(t,e,n)};K.useInsertionEffect=function(t,e){return Mt.H.useInsertionEffect(t,e)};K.useLayoutEffect=function(t,e){return Mt.H.useLayoutEffect(t,e)};K.useMemo=function(t,e){return Mt.H.useMemo(t,e)};K.useOptimistic=function(t,e){return Mt.H.useOptimistic(t,e)};K.useReducer=function(t,e,n){return Mt.H.useReducer(t,e,n)};K.useRef=function(t){return Mt.H.useRef(t)};K.useState=function(t){return Mt.H.useState(t)};K.useSyncExternalStore=function(t,e,n){return Mt.H.useSyncExternalStore(t,e,n)};K.useTransition=function(){return Mt.H.useTransition()};K.version="19.2.6"});var xa=An((AT,Ig)=>{"use strict";Ig.exports=Dg()});var Hg=An(Ft=>{"use strict";function Nd(t,e){var n=t.length;t.push(e);t:for(;0<n;){var i=n-1>>>1,a=t[i];if(0<Nl(a,e))t[i]=e,t[n]=a,n=i;else break t}}function Mn(t){return t.length===0?null:t[0]}function jl(t){if(t.length===0)return null;var e=t[0],n=t.pop();if(n!==e){t[0]=n;t:for(var i=0,a=t.length,r=a>>>1;i<r;){var s=2*(i+1)-1,o=t[s],l=s+1,c=t[l];if(0>Nl(o,n))l<a&&0>Nl(c,o)?(t[i]=c,t[l]=n,i=l):(t[i]=o,t[s]=n,i=s);else if(l<a&&0>Nl(c,n))t[i]=c,t[l]=n,i=l;else break t}}return e}function Nl(t,e){var n=t.sortIndex-e.sortIndex;return n!==0?n:t.id-e.id}Ft.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?(Fg=performance,Ft.unstable_now=function(){return Fg.now()}):(Od=Date,Og=Od.now(),Ft.unstable_now=function(){return Od.now()-Og});var Fg,Od,Og,qn=[],Ai=[],U7=1,Je=null,ue=3,Pd=!1,Ws=!1,to=!1,jd=!1,Ng=typeof setTimeout=="function"?setTimeout:null,Pg=typeof clearTimeout=="function"?clearTimeout:null,zg=typeof setImmediate<"u"?setImmediate:null;function Pl(t){for(var e=Mn(Ai);e!==null;){if(e.callback===null)jl(Ai);else if(e.startTime<=t)jl(Ai),e.sortIndex=e.expirationTime,Nd(qn,e);else break;e=Mn(Ai)}}function $d(t){if(to=!1,Pl(t),!Ws)if(Mn(qn)!==null)Ws=!0,wr||(wr=!0,Er());else{var e=Mn(Ai);e!==null&&Ud($d,e.startTime-t)}}var wr=!1,eo=-1,jg=5,$g=-1;function Ug(){return jd?!0:!(Ft.unstable_now()-$g<jg)}function zd(){if(jd=!1,wr){var t=Ft.unstable_now();$g=t;var e=!0;try{t:{Ws=!1,to&&(to=!1,Pg(eo),eo=-1),Pd=!0;var n=ue;try{e:{for(Pl(t),Je=Mn(qn);Je!==null&&!(Je.expirationTime>t&&Ug());){var i=Je.callback;if(typeof i=="function"){Je.callback=null,ue=Je.priorityLevel;var a=i(Je.expirationTime<=t);if(t=Ft.unstable_now(),typeof a=="function"){Je.callback=a,Pl(t),e=!0;break e}Je===Mn(qn)&&jl(qn),Pl(t)}else jl(qn);Je=Mn(qn)}if(Je!==null)e=!0;else{var r=Mn(Ai);r!==null&&Ud($d,r.startTime-t),e=!1}}break t}finally{Je=null,ue=n,Pd=!1}e=void 0}}finally{e?Er():wr=!1}}}var Er;typeof zg=="function"?Er=function(){zg(zd)}:typeof MessageChannel<"u"?(Ld=new MessageChannel,Lg=Ld.port2,Ld.port1.onmessage=zd,Er=function(){Lg.postMessage(null)}):Er=function(){Ng(zd,0)};var Ld,Lg;function Ud(t,e){eo=Ng(function(){t(Ft.unstable_now())},e)}Ft.unstable_IdlePriority=5;Ft.unstable_ImmediatePriority=1;Ft.unstable_LowPriority=4;Ft.unstable_NormalPriority=3;Ft.unstable_Profiling=null;Ft.unstable_UserBlockingPriority=2;Ft.unstable_cancelCallback=function(t){t.callback=null};Ft.unstable_forceFrameRate=function(t){0>t||125<t?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):jg=0<t?Math.floor(1e3/t):5};Ft.unstable_getCurrentPriorityLevel=function(){return ue};Ft.unstable_next=function(t){switch(ue){case 1:case 2:case 3:var e=3;break;default:e=ue}var n=ue;ue=e;try{return t()}finally{ue=n}};Ft.unstable_requestPaint=function(){jd=!0};Ft.unstable_runWithPriority=function(t,e){switch(t){case 1:case 2:case 3:case 4:case 5:break;default:t=3}var n=ue;ue=t;try{return e()}finally{ue=n}};Ft.unstable_scheduleCallback=function(t,e,n){var i=Ft.unstable_now();switch(typeof n=="object"&&n!==null?(n=n.delay,n=typeof n=="number"&&0<n?i+n:i):n=i,t){case 1:var a=-1;break;case 2:a=250;break;case 5:a=1073741823;break;case 4:a=1e4;break;default:a=5e3}return a=n+a,t={id:U7++,callback:e,priorityLevel:t,startTime:n,expirationTime:a,sortIndex:-1},n>i?(t.sortIndex=n,Nd(Ai,t),Mn(qn)===null&&t===Mn(Ai)&&(to?(Pg(eo),eo=-1):to=!0,Ud($d,n-i))):(t.sortIndex=a,Nd(qn,t),Ws||Pd||(Ws=!0,wr||(wr=!0,Er()))),t};Ft.unstable_shouldYield=Ug;Ft.unstable_wrapCallback=function(t){var e=ue;return function(){var n=ue;ue=e;try{return t.apply(this,arguments)}finally{ue=n}}}});var Vg=An((MT,Yg)=>{"use strict";Yg.exports=Hg()});var qg=An(ye=>{"use strict";var H7=xa();function Gg(t){var e="https://react.dev/errors/"+t;if(1<arguments.length){e+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function Ti(){}var me={d:{f:Ti,r:function(){throw Error(Gg(522))},D:Ti,C:Ti,L:Ti,m:Ti,X:Ti,S:Ti,M:Ti},p:0,findDOMNode:null},Y7=Symbol.for("react.portal");function V7(t,e,n){var i=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:Y7,key:i==null?null:""+i,children:t,containerInfo:e,implementation:n}}var no=H7.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function $l(t,e){if(t==="font")return"";if(typeof e=="string")return e==="use-credentials"?e:""}ye.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=me;ye.createPortal=function(t,e){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)throw Error(Gg(299));return V7(t,e,null,n)};ye.flushSync=function(t){var e=no.T,n=me.p;try{if(no.T=null,me.p=2,t)return t()}finally{no.T=e,me.p=n,me.d.f()}};ye.preconnect=function(t,e){typeof t=="string"&&(e?(e=e.crossOrigin,e=typeof e=="string"?e==="use-credentials"?e:"":void 0):e=null,me.d.C(t,e))};ye.prefetchDNS=function(t){typeof t=="string"&&me.d.D(t)};ye.preinit=function(t,e){if(typeof t=="string"&&e&&typeof e.as=="string"){var n=e.as,i=$l(n,e.crossOrigin),a=typeof e.integrity=="string"?e.integrity:void 0,r=typeof e.fetchPriority=="string"?e.fetchPriority:void 0;n==="style"?me.d.S(t,typeof e.precedence=="string"?e.precedence:void 0,{crossOrigin:i,integrity:a,fetchPriority:r}):n==="script"&&me.d.X(t,{crossOrigin:i,integrity:a,fetchPriority:r,nonce:typeof e.nonce=="string"?e.nonce:void 0})}};ye.preinitModule=function(t,e){if(typeof t=="string")if(typeof e=="object"&&e!==null){if(e.as==null||e.as==="script"){var n=$l(e.as,e.crossOrigin);me.d.M(t,{crossOrigin:n,integrity:typeof e.integrity=="string"?e.integrity:void 0,nonce:typeof e.nonce=="string"?e.nonce:void 0})}}else e==null&&me.d.M(t)};ye.preload=function(t,e){if(typeof t=="string"&&typeof e=="object"&&e!==null&&typeof e.as=="string"){var n=e.as,i=$l(n,e.crossOrigin);me.d.L(t,n,{crossOrigin:i,integrity:typeof e.integrity=="string"?e.integrity:void 0,nonce:typeof e.nonce=="string"?e.nonce:void 0,type:typeof e.type=="string"?e.type:void 0,fetchPriority:typeof e.fetchPriority=="string"?e.fetchPriority:void 0,referrerPolicy:typeof e.referrerPolicy=="string"?e.referrerPolicy:void 0,imageSrcSet:typeof e.imageSrcSet=="string"?e.imageSrcSet:void 0,imageSizes:typeof e.imageSizes=="string"?e.imageSizes:void 0,media:typeof e.media=="string"?e.media:void 0})}};ye.preloadModule=function(t,e){if(typeof t=="string")if(e){var n=$l(e.as,e.crossOrigin);me.d.m(t,{as:typeof e.as=="string"&&e.as!=="script"?e.as:void 0,crossOrigin:n,integrity:typeof e.integrity=="string"?e.integrity:void 0})}else me.d.m(t)};ye.requestFormReset=function(t){me.d.r(t)};ye.unstable_batchedUpdates=function(t,e){return t(e)};ye.useFormState=function(t,e,n){return no.H.useFormState(t,e,n)};ye.useFormStatus=function(){return no.H.useHostTransitionStatus()};ye.version="19.2.6"});var Zg=An((BT,Kg)=>{"use strict";function Xg(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Xg)}catch(t){console.error(t)}}Xg(),Kg.exports=qg()});var l5=An(pu=>{"use strict";var Xt=Vg(),Ey=xa(),G7=Zg();function _(t){var e="https://react.dev/errors/"+t;if(1<arguments.length){e+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function wy(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)}function Ho(t){var e=t,n=t;if(t.alternate)for(;e.return;)e=e.return;else{t=e;do e=t,(e.flags&4098)!==0&&(n=e.return),t=e.return;while(t)}return e.tag===3?n:null}function Cy(t){if(t.tag===13){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function Sy(t){if(t.tag===31){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function Qg(t){if(Ho(t)!==t)throw Error(_(188))}function q7(t){var e=t.alternate;if(!e){if(e=Ho(t),e===null)throw Error(_(188));return e!==t?null:t}for(var n=t,i=e;;){var a=n.return;if(a===null)break;var r=a.alternate;if(r===null){if(i=a.return,i!==null){n=i;continue}break}if(a.child===r.child){for(r=a.child;r;){if(r===n)return Qg(a),t;if(r===i)return Qg(a),e;r=r.sibling}throw Error(_(188))}if(n.return!==i.return)n=a,i=r;else{for(var s=!1,o=a.child;o;){if(o===n){s=!0,n=a,i=r;break}if(o===i){s=!0,i=a,n=r;break}o=o.sibling}if(!s){for(o=r.child;o;){if(o===n){s=!0,n=r,i=a;break}if(o===i){s=!0,i=r,n=a;break}o=o.sibling}if(!s)throw Error(_(189))}}if(n.alternate!==i)throw Error(_(190))}if(n.tag!==3)throw Error(_(188));return n.stateNode.current===n?t:e}function Ay(t){var e=t.tag;if(e===5||e===26||e===27||e===6)return t;for(t=t.child;t!==null;){if(e=Ay(t),e!==null)return e;t=t.sibling}return null}var Rt=Object.assign,X7=Symbol.for("react.element"),Ul=Symbol.for("react.transitional.element"),uo=Symbol.for("react.portal"),_r=Symbol.for("react.fragment"),Ty=Symbol.for("react.strict_mode"),Ep=Symbol.for("react.profiler"),My=Symbol.for("react.consumer"),ei=Symbol.for("react.context"),xf=Symbol.for("react.forward_ref"),wp=Symbol.for("react.suspense"),Cp=Symbol.for("react.suspense_list"),vf=Symbol.for("react.memo"),Mi=Symbol.for("react.lazy"),Sp=Symbol.for("react.activity"),K7=Symbol.for("react.memo_cache_sentinel"),Jg=Symbol.iterator;function io(t){return t===null||typeof t!="object"?null:(t=Jg&&t[Jg]||t["@@iterator"],typeof t=="function"?t:null)}var Z7=Symbol.for("react.client.reference");function Ap(t){if(t==null)return null;if(typeof t=="function")return t.$$typeof===Z7?null:t.displayName||t.name||null;if(typeof t=="string")return t;switch(t){case _r:return"Fragment";case Ep:return"Profiler";case Ty:return"StrictMode";case wp:return"Suspense";case Cp:return"SuspenseList";case Sp:return"Activity"}if(typeof t=="object")switch(t.$$typeof){case uo:return"Portal";case ei:return t.displayName||"Context";case My:return(t._context.displayName||"Context")+".Consumer";case xf:var e=t.render;return t=t.displayName,t||(t=e.displayName||e.name||"",t=t!==""?"ForwardRef("+t+")":"ForwardRef"),t;case vf:return e=t.displayName||null,e!==null?e:Ap(t.type)||"Memo";case Mi:e=t._payload,t=t._init;try{return Ap(t(e))}catch{}}return null}var po=Array.isArray,V=Ey.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,ht=G7.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Ca={pending:!1,data:null,method:null,action:null},Tp=[],Br=-1;function In(t){return{current:t}}function Wt(t){0>Br||(t.current=Tp[Br],Tp[Br]=null,Br--)}function At(t,e){Br++,Tp[Br]=t.current,t.current=e}var Dn=In(null),_o=In(null),Pi=In(null),kc=In(null);function Ec(t,e){switch(At(Pi,e),At(_o,t),At(Dn,null),e.nodeType){case 9:case 11:t=(t=e.documentElement)&&(t=t.namespaceURI)?ry(t):0;break;default:if(t=e.tagName,e=e.namespaceURI)e=ry(e),t=X6(e,t);else switch(t){case"svg":t=1;break;case"math":t=2;break;default:t=0}}Wt(Dn),At(Dn,t)}function Xr(){Wt(Dn),Wt(_o),Wt(Pi)}function Mp(t){t.memoizedState!==null&&At(kc,t);var e=Dn.current,n=X6(e,t.type);e!==n&&(At(_o,t),At(Dn,n))}function wc(t){_o.current===t&&(Wt(Dn),Wt(_o)),kc.current===t&&(Wt(kc),jo._currentValue=Ca)}var Hd,Wg;function ba(t){if(Hd===void 0)try{throw Error()}catch(n){var e=n.stack.trim().match(/\n( *(at )?)/);Hd=e&&e[1]||"",Wg=-1<n.stack.indexOf(`
    at`)?" (<anonymous>)":-1<n.stack.indexOf("@")?"@unknown:0:0":""}return`
`+Hd+t+Wg}var Yd=!1;function Vd(t,e){if(!t||Yd)return"";Yd=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var i={DetermineComponentFrameRoot:function(){try{if(e){var d=function(){throw Error()};if(Object.defineProperty(d.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(d,[])}catch(f){var p=f}Reflect.construct(t,[],d)}else{try{d.call()}catch(f){p=f}t.call(d.prototype)}}else{try{throw Error()}catch(f){p=f}(d=t())&&typeof d.catch=="function"&&d.catch(function(){})}}catch(f){if(f&&p&&typeof f.stack=="string")return[f.stack,p.stack]}return[null,null]}};i.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var a=Object.getOwnPropertyDescriptor(i.DetermineComponentFrameRoot,"name");a&&a.configurable&&Object.defineProperty(i.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var r=i.DetermineComponentFrameRoot(),s=r[0],o=r[1];if(s&&o){var l=s.split(`
`),c=o.split(`
`);for(a=i=0;i<l.length&&!l[i].includes("DetermineComponentFrameRoot");)i++;for(;a<c.length&&!c[a].includes("DetermineComponentFrameRoot");)a++;if(i===l.length||a===c.length)for(i=l.length-1,a=c.length-1;1<=i&&0<=a&&l[i]!==c[a];)a--;for(;1<=i&&0<=a;i--,a--)if(l[i]!==c[a]){if(i!==1||a!==1)do if(i--,a--,0>a||l[i]!==c[a]){var u=`
`+l[i].replace(" at new "," at ");return t.displayName&&u.includes("<anonymous>")&&(u=u.replace("<anonymous>",t.displayName)),u}while(1<=i&&0<=a);break}}}finally{Yd=!1,Error.prepareStackTrace=n}return(n=t?t.displayName||t.name:"")?ba(n):""}function Q7(t,e){switch(t.tag){case 26:case 27:case 5:return ba(t.type);case 16:return ba("Lazy");case 13:return t.child!==e&&e!==null?ba("Suspense Fallback"):ba("Suspense");case 19:return ba("SuspenseList");case 0:case 15:return Vd(t.type,!1);case 11:return Vd(t.type.render,!1);case 1:return Vd(t.type,!0);case 31:return ba("Activity");default:return""}}function tm(t){try{var e="",n=null;do e+=Q7(t,n),n=t,t=t.return;while(t);return e}catch(i){return`
Error generating stack: `+i.message+`
`+i.stack}}var _p=Object.prototype.hasOwnProperty,bf=Xt.unstable_scheduleCallback,Gd=Xt.unstable_cancelCallback,J7=Xt.unstable_shouldYield,W7=Xt.unstable_requestPaint,He=Xt.unstable_now,t9=Xt.unstable_getCurrentPriorityLevel,_y=Xt.unstable_ImmediatePriority,By=Xt.unstable_UserBlockingPriority,Cc=Xt.unstable_NormalPriority,e9=Xt.unstable_LowPriority,Ry=Xt.unstable_IdlePriority,n9=Xt.log,i9=Xt.unstable_setDisableYieldValue,Yo=null,Ye=null;function Fi(t){if(typeof n9=="function"&&i9(t),Ye&&typeof Ye.setStrictMode=="function")try{Ye.setStrictMode(Yo,t)}catch{}}var Ve=Math.clz32?Math.clz32:s9,a9=Math.log,r9=Math.LN2;function s9(t){return t>>>=0,t===0?32:31-(a9(t)/r9|0)|0}var Hl=256,Yl=262144,Vl=4194304;function ka(t){var e=t&42;if(e!==0)return e;switch(t&-t){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return t&261888;case 262144:case 524288:case 1048576:case 2097152:return t&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return t&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return t}}function Zc(t,e,n){var i=t.pendingLanes;if(i===0)return 0;var a=0,r=t.suspendedLanes,s=t.pingedLanes;t=t.warmLanes;var o=i&134217727;return o!==0?(i=o&~r,i!==0?a=ka(i):(s&=o,s!==0?a=ka(s):n||(n=o&~t,n!==0&&(a=ka(n))))):(o=i&~r,o!==0?a=ka(o):s!==0?a=ka(s):n||(n=i&~t,n!==0&&(a=ka(n)))),a===0?0:e!==0&&e!==a&&(e&r)===0&&(r=a&-a,n=e&-e,r>=n||r===32&&(n&4194048)!==0)?e:a}function Vo(t,e){return(t.pendingLanes&~(t.suspendedLanes&~t.pingedLanes)&e)===0}function o9(t,e){switch(t){case 1:case 2:case 4:case 8:case 64:return e+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function Dy(){var t=Vl;return Vl<<=1,(Vl&62914560)===0&&(Vl=4194304),t}function qd(t){for(var e=[],n=0;31>n;n++)e.push(t);return e}function Go(t,e){t.pendingLanes|=e,e!==268435456&&(t.suspendedLanes=0,t.pingedLanes=0,t.warmLanes=0)}function l9(t,e,n,i,a,r){var s=t.pendingLanes;t.pendingLanes=n,t.suspendedLanes=0,t.pingedLanes=0,t.warmLanes=0,t.expiredLanes&=n,t.entangledLanes&=n,t.errorRecoveryDisabledLanes&=n,t.shellSuspendCounter=0;var o=t.entanglements,l=t.expirationTimes,c=t.hiddenUpdates;for(n=s&~n;0<n;){var u=31-Ve(n),d=1<<u;o[u]=0,l[u]=-1;var p=c[u];if(p!==null)for(c[u]=null,u=0;u<p.length;u++){var f=p[u];f!==null&&(f.lane&=-536870913)}n&=~d}i!==0&&Iy(t,i,0),r!==0&&a===0&&t.tag!==0&&(t.suspendedLanes|=r&~(s&~e))}function Iy(t,e,n){t.pendingLanes|=e,t.suspendedLanes&=~e;var i=31-Ve(e);t.entangledLanes|=e,t.entanglements[i]=t.entanglements[i]|1073741824|n&261930}function Fy(t,e){var n=t.entangledLanes|=e;for(t=t.entanglements;n;){var i=31-Ve(n),a=1<<i;a&e|t[i]&e&&(t[i]|=e),n&=~a}}function Oy(t,e){var n=e&-e;return n=(n&42)!==0?1:kf(n),(n&(t.suspendedLanes|e))!==0?0:n}function kf(t){switch(t){case 2:t=1;break;case 8:t=4;break;case 32:t=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:t=128;break;case 268435456:t=134217728;break;default:t=0}return t}function Ef(t){return t&=-t,2<t?8<t?(t&134217727)!==0?32:268435456:8:2}function zy(){var t=ht.p;return t!==0?t:(t=window.event,t===void 0?32:r5(t.type))}function em(t,e){var n=ht.p;try{return ht.p=t,e()}finally{ht.p=n}}var Ji=Math.random().toString(36).slice(2),ne="__reactFiber$"+Ji,_e="__reactProps$"+Ji,rs="__reactContainer$"+Ji,Bp="__reactEvents$"+Ji,c9="__reactListeners$"+Ji,u9="__reactHandles$"+Ji,nm="__reactResources$"+Ji,qo="__reactMarker$"+Ji;function wf(t){delete t[ne],delete t[_e],delete t[Bp],delete t[c9],delete t[u9]}function Rr(t){var e=t[ne];if(e)return e;for(var n=t.parentNode;n;){if(e=n[rs]||n[ne]){if(n=e.alternate,e.child!==null||n!==null&&n.child!==null)for(t=uy(t);t!==null;){if(n=t[ne])return n;t=uy(t)}return e}t=n,n=t.parentNode}return null}function ss(t){if(t=t[ne]||t[rs]){var e=t.tag;if(e===5||e===6||e===13||e===31||e===26||e===27||e===3)return t}return null}function fo(t){var e=t.tag;if(e===5||e===26||e===27||e===6)return t.stateNode;throw Error(_(33))}function $r(t){var e=t[nm];return e||(e=t[nm]={hoistableStyles:new Map,hoistableScripts:new Map}),e}function Jt(t){t[qo]=!0}var Ly=new Set,Ny={};function Fa(t,e){Kr(t,e),Kr(t+"Capture",e)}function Kr(t,e){for(Ny[t]=e,t=0;t<e.length;t++)Ly.add(e[t])}var d9=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),im={},am={};function p9(t){return _p.call(am,t)?!0:_p.call(im,t)?!1:d9.test(t)?am[t]=!0:(im[t]=!0,!1)}function sc(t,e,n){if(p9(e))if(n===null)t.removeAttribute(e);else{switch(typeof n){case"undefined":case"function":case"symbol":t.removeAttribute(e);return;case"boolean":var i=e.toLowerCase().slice(0,5);if(i!=="data-"&&i!=="aria-"){t.removeAttribute(e);return}}t.setAttribute(e,""+n)}}function Gl(t,e,n){if(n===null)t.removeAttribute(e);else{switch(typeof n){case"undefined":case"function":case"symbol":case"boolean":t.removeAttribute(e);return}t.setAttribute(e,""+n)}}function Xn(t,e,n,i){if(i===null)t.removeAttribute(n);else{switch(typeof i){case"undefined":case"function":case"symbol":case"boolean":t.removeAttribute(n);return}t.setAttributeNS(e,n,""+i)}}function tn(t){switch(typeof t){case"bigint":case"boolean":case"number":case"string":case"undefined":return t;case"object":return t;default:return""}}function Py(t){var e=t.type;return(t=t.nodeName)&&t.toLowerCase()==="input"&&(e==="checkbox"||e==="radio")}function f9(t,e,n){var i=Object.getOwnPropertyDescriptor(t.constructor.prototype,e);if(!t.hasOwnProperty(e)&&typeof i<"u"&&typeof i.get=="function"&&typeof i.set=="function"){var a=i.get,r=i.set;return Object.defineProperty(t,e,{configurable:!0,get:function(){return a.call(this)},set:function(s){n=""+s,r.call(this,s)}}),Object.defineProperty(t,e,{enumerable:i.enumerable}),{getValue:function(){return n},setValue:function(s){n=""+s},stopTracking:function(){t._valueTracker=null,delete t[e]}}}}function Rp(t){if(!t._valueTracker){var e=Py(t)?"checked":"value";t._valueTracker=f9(t,e,""+t[e])}}function jy(t){if(!t)return!1;var e=t._valueTracker;if(!e)return!0;var n=e.getValue(),i="";return t&&(i=Py(t)?t.checked?"true":"false":t.value),t=i,t!==n?(e.setValue(t),!0):!1}function Sc(t){if(t=t||(typeof document<"u"?document:void 0),typeof t>"u")return null;try{return t.activeElement||t.body}catch{return t.body}}var h9=/[\n"\\]/g;function an(t){return t.replace(h9,function(e){return"\\"+e.charCodeAt(0).toString(16)+" "})}function Dp(t,e,n,i,a,r,s,o){t.name="",s!=null&&typeof s!="function"&&typeof s!="symbol"&&typeof s!="boolean"?t.type=s:t.removeAttribute("type"),e!=null?s==="number"?(e===0&&t.value===""||t.value!=e)&&(t.value=""+tn(e)):t.value!==""+tn(e)&&(t.value=""+tn(e)):s!=="submit"&&s!=="reset"||t.removeAttribute("value"),e!=null?Ip(t,s,tn(e)):n!=null?Ip(t,s,tn(n)):i!=null&&t.removeAttribute("value"),a==null&&r!=null&&(t.defaultChecked=!!r),a!=null&&(t.checked=a&&typeof a!="function"&&typeof a!="symbol"),o!=null&&typeof o!="function"&&typeof o!="symbol"&&typeof o!="boolean"?t.name=""+tn(o):t.removeAttribute("name")}function $y(t,e,n,i,a,r,s,o){if(r!=null&&typeof r!="function"&&typeof r!="symbol"&&typeof r!="boolean"&&(t.type=r),e!=null||n!=null){if(!(r!=="submit"&&r!=="reset"||e!=null)){Rp(t);return}n=n!=null?""+tn(n):"",e=e!=null?""+tn(e):n,o||e===t.value||(t.value=e),t.defaultValue=e}i=i??a,i=typeof i!="function"&&typeof i!="symbol"&&!!i,t.checked=o?t.checked:!!i,t.defaultChecked=!!i,s!=null&&typeof s!="function"&&typeof s!="symbol"&&typeof s!="boolean"&&(t.name=s),Rp(t)}function Ip(t,e,n){e==="number"&&Sc(t.ownerDocument)===t||t.defaultValue===""+n||(t.defaultValue=""+n)}function Ur(t,e,n,i){if(t=t.options,e){e={};for(var a=0;a<n.length;a++)e["$"+n[a]]=!0;for(n=0;n<t.length;n++)a=e.hasOwnProperty("$"+t[n].value),t[n].selected!==a&&(t[n].selected=a),a&&i&&(t[n].defaultSelected=!0)}else{for(n=""+tn(n),e=null,a=0;a<t.length;a++){if(t[a].value===n){t[a].selected=!0,i&&(t[a].defaultSelected=!0);return}e!==null||t[a].disabled||(e=t[a])}e!==null&&(e.selected=!0)}}function Uy(t,e,n){if(e!=null&&(e=""+tn(e),e!==t.value&&(t.value=e),n==null)){t.defaultValue!==e&&(t.defaultValue=e);return}t.defaultValue=n!=null?""+tn(n):""}function Hy(t,e,n,i){if(e==null){if(i!=null){if(n!=null)throw Error(_(92));if(po(i)){if(1<i.length)throw Error(_(93));i=i[0]}n=i}n==null&&(n=""),e=n}n=tn(e),t.defaultValue=n,i=t.textContent,i===n&&i!==""&&i!==null&&(t.value=i),Rp(t)}function Zr(t,e){if(e){var n=t.firstChild;if(n&&n===t.lastChild&&n.nodeType===3){n.nodeValue=e;return}}t.textContent=e}var g9=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function rm(t,e,n){var i=e.indexOf("--")===0;n==null||typeof n=="boolean"||n===""?i?t.setProperty(e,""):e==="float"?t.cssFloat="":t[e]="":i?t.setProperty(e,n):typeof n!="number"||n===0||g9.has(e)?e==="float"?t.cssFloat=n:t[e]=(""+n).trim():t[e]=n+"px"}function Yy(t,e,n){if(e!=null&&typeof e!="object")throw Error(_(62));if(t=t.style,n!=null){for(var i in n)!n.hasOwnProperty(i)||e!=null&&e.hasOwnProperty(i)||(i.indexOf("--")===0?t.setProperty(i,""):i==="float"?t.cssFloat="":t[i]="");for(var a in e)i=e[a],e.hasOwnProperty(a)&&n[a]!==i&&rm(t,a,i)}else for(var r in e)e.hasOwnProperty(r)&&rm(t,r,e[r])}function Cf(t){if(t.indexOf("-")===-1)return!1;switch(t){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var m9=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),y9=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function oc(t){return y9.test(""+t)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":t}function ni(){}var Fp=null;function Sf(t){return t=t.target||t.srcElement||window,t.correspondingUseElement&&(t=t.correspondingUseElement),t.nodeType===3?t.parentNode:t}var Dr=null,Hr=null;function sm(t){var e=ss(t);if(e&&(t=e.stateNode)){var n=t[_e]||null;t:switch(t=e.stateNode,e.type){case"input":if(Dp(t,n.value,n.defaultValue,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name),e=n.name,n.type==="radio"&&e!=null){for(n=t;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll('input[name="'+an(""+e)+'"][type="radio"]'),e=0;e<n.length;e++){var i=n[e];if(i!==t&&i.form===t.form){var a=i[_e]||null;if(!a)throw Error(_(90));Dp(i,a.value,a.defaultValue,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name)}}for(e=0;e<n.length;e++)i=n[e],i.form===t.form&&jy(i)}break t;case"textarea":Uy(t,n.value,n.defaultValue);break t;case"select":e=n.value,e!=null&&Ur(t,!!n.multiple,e,!1)}}}var Xd=!1;function Vy(t,e,n){if(Xd)return t(e,n);Xd=!0;try{var i=t(e);return i}finally{if(Xd=!1,(Dr!==null||Hr!==null)&&(lu(),Dr&&(e=Dr,t=Hr,Hr=Dr=null,sm(e),t)))for(e=0;e<t.length;e++)sm(t[e])}}function Bo(t,e){var n=t.stateNode;if(n===null)return null;var i=n[_e]||null;if(i===null)return null;n=i[e];t:switch(e){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(i=!i.disabled)||(t=t.type,i=!(t==="button"||t==="input"||t==="select"||t==="textarea")),t=!i;break t;default:t=!1}if(t)return null;if(n&&typeof n!="function")throw Error(_(231,e,typeof n));return n}var oi=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),Op=!1;if(oi)try{Cr={},Object.defineProperty(Cr,"passive",{get:function(){Op=!0}}),window.addEventListener("test",Cr,Cr),window.removeEventListener("test",Cr,Cr)}catch{Op=!1}var Cr,Oi=null,Af=null,lc=null;function Gy(){if(lc)return lc;var t,e=Af,n=e.length,i,a="value"in Oi?Oi.value:Oi.textContent,r=a.length;for(t=0;t<n&&e[t]===a[t];t++);var s=n-t;for(i=1;i<=s&&e[n-i]===a[r-i];i++);return lc=a.slice(t,1<i?1-i:void 0)}function cc(t){var e=t.keyCode;return"charCode"in t?(t=t.charCode,t===0&&e===13&&(t=13)):t=e,t===10&&(t=13),32<=t||t===13?t:0}function ql(){return!0}function om(){return!1}function Be(t){function e(n,i,a,r,s){this._reactName=n,this._targetInst=a,this.type=i,this.nativeEvent=r,this.target=s,this.currentTarget=null;for(var o in t)t.hasOwnProperty(o)&&(n=t[o],this[o]=n?n(r):r[o]);return this.isDefaultPrevented=(r.defaultPrevented!=null?r.defaultPrevented:r.returnValue===!1)?ql:om,this.isPropagationStopped=om,this}return Rt(e.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=ql)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=ql)},persist:function(){},isPersistent:ql}),e}var Oa={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(t){return t.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Qc=Be(Oa),Xo=Rt({},Oa,{view:0,detail:0}),x9=Be(Xo),Kd,Zd,ao,Jc=Rt({},Xo,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Tf,button:0,buttons:0,relatedTarget:function(t){return t.relatedTarget===void 0?t.fromElement===t.srcElement?t.toElement:t.fromElement:t.relatedTarget},movementX:function(t){return"movementX"in t?t.movementX:(t!==ao&&(ao&&t.type==="mousemove"?(Kd=t.screenX-ao.screenX,Zd=t.screenY-ao.screenY):Zd=Kd=0,ao=t),Kd)},movementY:function(t){return"movementY"in t?t.movementY:Zd}}),lm=Be(Jc),v9=Rt({},Jc,{dataTransfer:0}),b9=Be(v9),k9=Rt({},Xo,{relatedTarget:0}),Qd=Be(k9),E9=Rt({},Oa,{animationName:0,elapsedTime:0,pseudoElement:0}),w9=Be(E9),C9=Rt({},Oa,{clipboardData:function(t){return"clipboardData"in t?t.clipboardData:window.clipboardData}}),S9=Be(C9),A9=Rt({},Oa,{data:0}),cm=Be(A9),T9={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},M9={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},_9={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function B9(t){var e=this.nativeEvent;return e.getModifierState?e.getModifierState(t):(t=_9[t])?!!e[t]:!1}function Tf(){return B9}var R9=Rt({},Xo,{key:function(t){if(t.key){var e=T9[t.key]||t.key;if(e!=="Unidentified")return e}return t.type==="keypress"?(t=cc(t),t===13?"Enter":String.fromCharCode(t)):t.type==="keydown"||t.type==="keyup"?M9[t.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Tf,charCode:function(t){return t.type==="keypress"?cc(t):0},keyCode:function(t){return t.type==="keydown"||t.type==="keyup"?t.keyCode:0},which:function(t){return t.type==="keypress"?cc(t):t.type==="keydown"||t.type==="keyup"?t.keyCode:0}}),D9=Be(R9),I9=Rt({},Jc,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),um=Be(I9),F9=Rt({},Xo,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Tf}),O9=Be(F9),z9=Rt({},Oa,{propertyName:0,elapsedTime:0,pseudoElement:0}),L9=Be(z9),N9=Rt({},Jc,{deltaX:function(t){return"deltaX"in t?t.deltaX:"wheelDeltaX"in t?-t.wheelDeltaX:0},deltaY:function(t){return"deltaY"in t?t.deltaY:"wheelDeltaY"in t?-t.wheelDeltaY:"wheelDelta"in t?-t.wheelDelta:0},deltaZ:0,deltaMode:0}),P9=Be(N9),j9=Rt({},Oa,{newState:0,oldState:0}),$9=Be(j9),U9=[9,13,27,32],Mf=oi&&"CompositionEvent"in window,mo=null;oi&&"documentMode"in document&&(mo=document.documentMode);var H9=oi&&"TextEvent"in window&&!mo,qy=oi&&(!Mf||mo&&8<mo&&11>=mo),dm=" ",pm=!1;function Xy(t,e){switch(t){case"keyup":return U9.indexOf(e.keyCode)!==-1;case"keydown":return e.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Ky(t){return t=t.detail,typeof t=="object"&&"data"in t?t.data:null}var Ir=!1;function Y9(t,e){switch(t){case"compositionend":return Ky(e);case"keypress":return e.which!==32?null:(pm=!0,dm);case"textInput":return t=e.data,t===dm&&pm?null:t;default:return null}}function V9(t,e){if(Ir)return t==="compositionend"||!Mf&&Xy(t,e)?(t=Gy(),lc=Af=Oi=null,Ir=!1,t):null;switch(t){case"paste":return null;case"keypress":if(!(e.ctrlKey||e.altKey||e.metaKey)||e.ctrlKey&&e.altKey){if(e.char&&1<e.char.length)return e.char;if(e.which)return String.fromCharCode(e.which)}return null;case"compositionend":return qy&&e.locale!=="ko"?null:e.data;default:return null}}var G9={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function fm(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e==="input"?!!G9[t.type]:e==="textarea"}function Zy(t,e,n,i){Dr?Hr?Hr.push(i):Hr=[i]:Dr=i,e=Hc(e,"onChange"),0<e.length&&(n=new Qc("onChange","change",null,n,i),t.push({event:n,listeners:e}))}var yo=null,Ro=null;function q9(t){V6(t,0)}function Wc(t){var e=fo(t);if(jy(e))return t}function hm(t,e){if(t==="change")return e}var Qy=!1;oi&&(oi?(Kl="oninput"in document,Kl||(Jd=document.createElement("div"),Jd.setAttribute("oninput","return;"),Kl=typeof Jd.oninput=="function"),Xl=Kl):Xl=!1,Qy=Xl&&(!document.documentMode||9<document.documentMode));var Xl,Kl,Jd;function gm(){yo&&(yo.detachEvent("onpropertychange",Jy),Ro=yo=null)}function Jy(t){if(t.propertyName==="value"&&Wc(Ro)){var e=[];Zy(e,Ro,t,Sf(t)),Vy(q9,e)}}function X9(t,e,n){t==="focusin"?(gm(),yo=e,Ro=n,yo.attachEvent("onpropertychange",Jy)):t==="focusout"&&gm()}function K9(t){if(t==="selectionchange"||t==="keyup"||t==="keydown")return Wc(Ro)}function Z9(t,e){if(t==="click")return Wc(e)}function Q9(t,e){if(t==="input"||t==="change")return Wc(e)}function J9(t,e){return t===e&&(t!==0||1/t===1/e)||t!==t&&e!==e}var qe=typeof Object.is=="function"?Object.is:J9;function Do(t,e){if(qe(t,e))return!0;if(typeof t!="object"||t===null||typeof e!="object"||e===null)return!1;var n=Object.keys(t),i=Object.keys(e);if(n.length!==i.length)return!1;for(i=0;i<n.length;i++){var a=n[i];if(!_p.call(e,a)||!qe(t[a],e[a]))return!1}return!0}function mm(t){for(;t&&t.firstChild;)t=t.firstChild;return t}function ym(t,e){var n=mm(t);t=0;for(var i;n;){if(n.nodeType===3){if(i=t+n.textContent.length,t<=e&&i>=e)return{node:n,offset:e-t};t=i}t:{for(;n;){if(n.nextSibling){n=n.nextSibling;break t}n=n.parentNode}n=void 0}n=mm(n)}}function Wy(t,e){return t&&e?t===e?!0:t&&t.nodeType===3?!1:e&&e.nodeType===3?Wy(t,e.parentNode):"contains"in t?t.contains(e):t.compareDocumentPosition?!!(t.compareDocumentPosition(e)&16):!1:!1}function t2(t){t=t!=null&&t.ownerDocument!=null&&t.ownerDocument.defaultView!=null?t.ownerDocument.defaultView:window;for(var e=Sc(t.document);e instanceof t.HTMLIFrameElement;){try{var n=typeof e.contentWindow.location.href=="string"}catch{n=!1}if(n)t=e.contentWindow;else break;e=Sc(t.document)}return e}function _f(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e&&(e==="input"&&(t.type==="text"||t.type==="search"||t.type==="tel"||t.type==="url"||t.type==="password")||e==="textarea"||t.contentEditable==="true")}var W9=oi&&"documentMode"in document&&11>=document.documentMode,Fr=null,zp=null,xo=null,Lp=!1;function xm(t,e,n){var i=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;Lp||Fr==null||Fr!==Sc(i)||(i=Fr,"selectionStart"in i&&_f(i)?i={start:i.selectionStart,end:i.selectionEnd}:(i=(i.ownerDocument&&i.ownerDocument.defaultView||window).getSelection(),i={anchorNode:i.anchorNode,anchorOffset:i.anchorOffset,focusNode:i.focusNode,focusOffset:i.focusOffset}),xo&&Do(xo,i)||(xo=i,i=Hc(zp,"onSelect"),0<i.length&&(e=new Qc("onSelect","select",null,e,n),t.push({event:e,listeners:i}),e.target=Fr)))}function va(t,e){var n={};return n[t.toLowerCase()]=e.toLowerCase(),n["Webkit"+t]="webkit"+e,n["Moz"+t]="moz"+e,n}var Or={animationend:va("Animation","AnimationEnd"),animationiteration:va("Animation","AnimationIteration"),animationstart:va("Animation","AnimationStart"),transitionrun:va("Transition","TransitionRun"),transitionstart:va("Transition","TransitionStart"),transitioncancel:va("Transition","TransitionCancel"),transitionend:va("Transition","TransitionEnd")},Wd={},e2={};oi&&(e2=document.createElement("div").style,"AnimationEvent"in window||(delete Or.animationend.animation,delete Or.animationiteration.animation,delete Or.animationstart.animation),"TransitionEvent"in window||delete Or.transitionend.transition);function za(t){if(Wd[t])return Wd[t];if(!Or[t])return t;var e=Or[t],n;for(n in e)if(e.hasOwnProperty(n)&&n in e2)return Wd[t]=e[n];return t}var n2=za("animationend"),i2=za("animationiteration"),a2=za("animationstart"),tv=za("transitionrun"),ev=za("transitionstart"),nv=za("transitioncancel"),r2=za("transitionend"),s2=new Map,Np="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");Np.push("scrollEnd");function bn(t,e){s2.set(t,e),Fa(e,[t])}var Ac=typeof reportError=="function"?reportError:function(t){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var e=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof t=="object"&&t!==null&&typeof t.message=="string"?String(t.message):String(t),error:t});if(!window.dispatchEvent(e))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",t);return}console.error(t)},We=[],zr=0,Bf=0;function tu(){for(var t=zr,e=Bf=zr=0;e<t;){var n=We[e];We[e++]=null;var i=We[e];We[e++]=null;var a=We[e];We[e++]=null;var r=We[e];if(We[e++]=null,i!==null&&a!==null){var s=i.pending;s===null?a.next=a:(a.next=s.next,s.next=a),i.pending=a}r!==0&&o2(n,a,r)}}function eu(t,e,n,i){We[zr++]=t,We[zr++]=e,We[zr++]=n,We[zr++]=i,Bf|=i,t.lanes|=i,t=t.alternate,t!==null&&(t.lanes|=i)}function Rf(t,e,n,i){return eu(t,e,n,i),Tc(t)}function La(t,e){return eu(t,null,null,e),Tc(t)}function o2(t,e,n){t.lanes|=n;var i=t.alternate;i!==null&&(i.lanes|=n);for(var a=!1,r=t.return;r!==null;)r.childLanes|=n,i=r.alternate,i!==null&&(i.childLanes|=n),r.tag===22&&(t=r.stateNode,t===null||t._visibility&1||(a=!0)),t=r,r=r.return;return t.tag===3?(r=t.stateNode,a&&e!==null&&(a=31-Ve(n),t=r.hiddenUpdates,i=t[a],i===null?t[a]=[e]:i.push(e),e.lane=n|536870912),r):null}function Tc(t){if(50<To)throw To=0,sf=null,Error(_(185));for(var e=t.return;e!==null;)t=e,e=t.return;return t.tag===3?t.stateNode:null}var Lr={};function iv(t,e,n,i){this.tag=t,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=e,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=i,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function $e(t,e,n,i){return new iv(t,e,n,i)}function Df(t){return t=t.prototype,!(!t||!t.isReactComponent)}function ai(t,e){var n=t.alternate;return n===null?(n=$e(t.tag,e,t.key,t.mode),n.elementType=t.elementType,n.type=t.type,n.stateNode=t.stateNode,n.alternate=t,t.alternate=n):(n.pendingProps=e,n.type=t.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=t.flags&65011712,n.childLanes=t.childLanes,n.lanes=t.lanes,n.child=t.child,n.memoizedProps=t.memoizedProps,n.memoizedState=t.memoizedState,n.updateQueue=t.updateQueue,e=t.dependencies,n.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext},n.sibling=t.sibling,n.index=t.index,n.ref=t.ref,n.refCleanup=t.refCleanup,n}function l2(t,e){t.flags&=65011714;var n=t.alternate;return n===null?(t.childLanes=0,t.lanes=e,t.child=null,t.subtreeFlags=0,t.memoizedProps=null,t.memoizedState=null,t.updateQueue=null,t.dependencies=null,t.stateNode=null):(t.childLanes=n.childLanes,t.lanes=n.lanes,t.child=n.child,t.subtreeFlags=0,t.deletions=null,t.memoizedProps=n.memoizedProps,t.memoizedState=n.memoizedState,t.updateQueue=n.updateQueue,t.type=n.type,e=n.dependencies,t.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext}),t}function uc(t,e,n,i,a,r){var s=0;if(i=t,typeof t=="function")Df(t)&&(s=1);else if(typeof t=="string")s=sb(t,n,Dn.current)?26:t==="html"||t==="head"||t==="body"?27:5;else t:switch(t){case Sp:return t=$e(31,n,e,a),t.elementType=Sp,t.lanes=r,t;case _r:return Sa(n.children,a,r,e);case Ty:s=8,a|=24;break;case Ep:return t=$e(12,n,e,a|2),t.elementType=Ep,t.lanes=r,t;case wp:return t=$e(13,n,e,a),t.elementType=wp,t.lanes=r,t;case Cp:return t=$e(19,n,e,a),t.elementType=Cp,t.lanes=r,t;default:if(typeof t=="object"&&t!==null)switch(t.$$typeof){case ei:s=10;break t;case My:s=9;break t;case xf:s=11;break t;case vf:s=14;break t;case Mi:s=16,i=null;break t}s=29,n=Error(_(130,t===null?"null":typeof t,"")),i=null}return e=$e(s,n,e,a),e.elementType=t,e.type=i,e.lanes=r,e}function Sa(t,e,n,i){return t=$e(7,t,i,e),t.lanes=n,t}function tp(t,e,n){return t=$e(6,t,null,e),t.lanes=n,t}function c2(t){var e=$e(18,null,null,0);return e.stateNode=t,e}function ep(t,e,n){return e=$e(4,t.children!==null?t.children:[],t.key,e),e.lanes=n,e.stateNode={containerInfo:t.containerInfo,pendingChildren:null,implementation:t.implementation},e}var vm=new WeakMap;function rn(t,e){if(typeof t=="object"&&t!==null){var n=vm.get(t);return n!==void 0?n:(e={value:t,source:e,stack:tm(e)},vm.set(t,e),e)}return{value:t,source:e,stack:tm(e)}}var Nr=[],Pr=0,Mc=null,Io=0,en=[],nn=0,Xi=null,_n=1,Bn="";function Wn(t,e){Nr[Pr++]=Io,Nr[Pr++]=Mc,Mc=t,Io=e}function u2(t,e,n){en[nn++]=_n,en[nn++]=Bn,en[nn++]=Xi,Xi=t;var i=_n;t=Bn;var a=32-Ve(i)-1;i&=~(1<<a),n+=1;var r=32-Ve(e)+a;if(30<r){var s=a-a%5;r=(i&(1<<s)-1).toString(32),i>>=s,a-=s,_n=1<<32-Ve(e)+a|n<<a|i,Bn=r+t}else _n=1<<r|n<<a|i,Bn=t}function If(t){t.return!==null&&(Wn(t,1),u2(t,1,0))}function Ff(t){for(;t===Mc;)Mc=Nr[--Pr],Nr[Pr]=null,Io=Nr[--Pr],Nr[Pr]=null;for(;t===Xi;)Xi=en[--nn],en[nn]=null,Bn=en[--nn],en[nn]=null,_n=en[--nn],en[nn]=null}function d2(t,e){en[nn++]=_n,en[nn++]=Bn,en[nn++]=Xi,_n=e.id,Bn=e.overflow,Xi=t}var ie=null,Bt=null,ut=!1,ji=null,sn=!1,Pp=Error(_(519));function Ki(t){var e=Error(_(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw Fo(rn(e,t)),Pp}function bm(t){var e=t.stateNode,n=t.type,i=t.memoizedProps;switch(e[ne]=t,e[_e]=i,n){case"dialog":it("cancel",e),it("close",e);break;case"iframe":case"object":case"embed":it("load",e);break;case"video":case"audio":for(n=0;n<No.length;n++)it(No[n],e);break;case"source":it("error",e);break;case"img":case"image":case"link":it("error",e),it("load",e);break;case"details":it("toggle",e);break;case"input":it("invalid",e),$y(e,i.value,i.defaultValue,i.checked,i.defaultChecked,i.type,i.name,!0);break;case"select":it("invalid",e);break;case"textarea":it("invalid",e),Hy(e,i.value,i.defaultValue,i.children)}n=i.children,typeof n!="string"&&typeof n!="number"&&typeof n!="bigint"||e.textContent===""+n||i.suppressHydrationWarning===!0||q6(e.textContent,n)?(i.popover!=null&&(it("beforetoggle",e),it("toggle",e)),i.onScroll!=null&&it("scroll",e),i.onScrollEnd!=null&&it("scrollend",e),i.onClick!=null&&(e.onclick=ni),e=!0):e=!1,e||Ki(t,!0)}function km(t){for(ie=t.return;ie;)switch(ie.tag){case 5:case 31:case 13:sn=!1;return;case 27:case 3:sn=!0;return;default:ie=ie.return}}function Sr(t){if(t!==ie)return!1;if(!ut)return km(t),ut=!0,!1;var e=t.tag,n;if((n=e!==3&&e!==27)&&((n=e===5)&&(n=t.type,n=!(n!=="form"&&n!=="button")||df(t.type,t.memoizedProps)),n=!n),n&&Bt&&Ki(t),km(t),e===13){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(_(317));Bt=cy(t)}else if(e===31){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(_(317));Bt=cy(t)}else e===27?(e=Bt,Wi(t.type)?(t=gf,gf=null,Bt=t):Bt=e):Bt=ie?ln(t.stateNode.nextSibling):null;return!0}function _a(){Bt=ie=null,ut=!1}function np(){var t=ji;return t!==null&&(Te===null?Te=t:Te.push.apply(Te,t),ji=null),t}function Fo(t){ji===null?ji=[t]:ji.push(t)}var jp=In(null),Na=null,ii=null;function Bi(t,e,n){At(jp,e._currentValue),e._currentValue=n}function ri(t){t._currentValue=jp.current,Wt(jp)}function $p(t,e,n){for(;t!==null;){var i=t.alternate;if((t.childLanes&e)!==e?(t.childLanes|=e,i!==null&&(i.childLanes|=e)):i!==null&&(i.childLanes&e)!==e&&(i.childLanes|=e),t===n)break;t=t.return}}function Up(t,e,n,i){var a=t.child;for(a!==null&&(a.return=t);a!==null;){var r=a.dependencies;if(r!==null){var s=a.child;r=r.firstContext;t:for(;r!==null;){var o=r;r=a;for(var l=0;l<e.length;l++)if(o.context===e[l]){r.lanes|=n,o=r.alternate,o!==null&&(o.lanes|=n),$p(r.return,n,t),i||(s=null);break t}r=o.next}}else if(a.tag===18){if(s=a.return,s===null)throw Error(_(341));s.lanes|=n,r=s.alternate,r!==null&&(r.lanes|=n),$p(s,n,t),s=null}else s=a.child;if(s!==null)s.return=a;else for(s=a;s!==null;){if(s===t){s=null;break}if(a=s.sibling,a!==null){a.return=s.return,s=a;break}s=s.return}a=s}}function os(t,e,n,i){t=null;for(var a=e,r=!1;a!==null;){if(!r){if((a.flags&524288)!==0)r=!0;else if((a.flags&262144)!==0)break}if(a.tag===10){var s=a.alternate;if(s===null)throw Error(_(387));if(s=s.memoizedProps,s!==null){var o=a.type;qe(a.pendingProps.value,s.value)||(t!==null?t.push(o):t=[o])}}else if(a===kc.current){if(s=a.alternate,s===null)throw Error(_(387));s.memoizedState.memoizedState!==a.memoizedState.memoizedState&&(t!==null?t.push(jo):t=[jo])}a=a.return}t!==null&&Up(e,t,n,i),e.flags|=262144}function _c(t){for(t=t.firstContext;t!==null;){if(!qe(t.context._currentValue,t.memoizedValue))return!0;t=t.next}return!1}function Ba(t){Na=t,ii=null,t=t.dependencies,t!==null&&(t.firstContext=null)}function ae(t){return p2(Na,t)}function Zl(t,e){return Na===null&&Ba(t),p2(t,e)}function p2(t,e){var n=e._currentValue;if(e={context:e,memoizedValue:n,next:null},ii===null){if(t===null)throw Error(_(308));ii=e,t.dependencies={lanes:0,firstContext:e},t.flags|=524288}else ii=ii.next=e;return n}var av=typeof AbortController<"u"?AbortController:function(){var t=[],e=this.signal={aborted:!1,addEventListener:function(n,i){t.push(i)}};this.abort=function(){e.aborted=!0,t.forEach(function(n){return n()})}},rv=Xt.unstable_scheduleCallback,sv=Xt.unstable_NormalPriority,Yt={$$typeof:ei,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function Of(){return{controller:new av,data:new Map,refCount:0}}function Ko(t){t.refCount--,t.refCount===0&&rv(sv,function(){t.controller.abort()})}var vo=null,Hp=0,Qr=0,Yr=null;function ov(t,e){if(vo===null){var n=vo=[];Hp=0,Qr=s1(),Yr={status:"pending",value:void 0,then:function(i){n.push(i)}}}return Hp++,e.then(Em,Em),e}function Em(){if(--Hp===0&&vo!==null){Yr!==null&&(Yr.status="fulfilled");var t=vo;vo=null,Qr=0,Yr=null;for(var e=0;e<t.length;e++)(0,t[e])()}}function lv(t,e){var n=[],i={status:"pending",value:null,reason:null,then:function(a){n.push(a)}};return t.then(function(){i.status="fulfilled",i.value=e;for(var a=0;a<n.length;a++)(0,n[a])(e)},function(a){for(i.status="rejected",i.reason=a,a=0;a<n.length;a++)(0,n[a])(void 0)}),i}var wm=V.S;V.S=function(t,e){A6=He(),typeof e=="object"&&e!==null&&typeof e.then=="function"&&ov(t,e),wm!==null&&wm(t,e)};var Aa=In(null);function zf(){var t=Aa.current;return t!==null?t:Ct.pooledCache}function dc(t,e){e===null?At(Aa,Aa.current):At(Aa,e.pool)}function f2(){var t=zf();return t===null?null:{parent:Yt._currentValue,pool:t}}var ls=Error(_(460)),Lf=Error(_(474)),nu=Error(_(542)),Bc={then:function(){}};function Cm(t){return t=t.status,t==="fulfilled"||t==="rejected"}function h2(t,e,n){switch(n=t[n],n===void 0?t.push(e):n!==e&&(e.then(ni,ni),e=n),e.status){case"fulfilled":return e.value;case"rejected":throw t=e.reason,Am(t),t;default:if(typeof e.status=="string")e.then(ni,ni);else{if(t=Ct,t!==null&&100<t.shellSuspendCounter)throw Error(_(482));t=e,t.status="pending",t.then(function(i){if(e.status==="pending"){var a=e;a.status="fulfilled",a.value=i}},function(i){if(e.status==="pending"){var a=e;a.status="rejected",a.reason=i}})}switch(e.status){case"fulfilled":return e.value;case"rejected":throw t=e.reason,Am(t),t}throw Ta=e,ls}}function Ea(t){try{var e=t._init;return e(t._payload)}catch(n){throw n!==null&&typeof n=="object"&&typeof n.then=="function"?(Ta=n,ls):n}}var Ta=null;function Sm(){if(Ta===null)throw Error(_(459));var t=Ta;return Ta=null,t}function Am(t){if(t===ls||t===nu)throw Error(_(483))}var Vr=null,Oo=0;function Ql(t){var e=Oo;return Oo+=1,Vr===null&&(Vr=[]),h2(Vr,t,e)}function ro(t,e){e=e.props.ref,t.ref=e!==void 0?e:null}function Jl(t,e){throw e.$$typeof===X7?Error(_(525)):(t=Object.prototype.toString.call(e),Error(_(31,t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)))}function g2(t){function e(v,h){if(t){var b=v.deletions;b===null?(v.deletions=[h],v.flags|=16):b.push(h)}}function n(v,h){if(!t)return null;for(;h!==null;)e(v,h),h=h.sibling;return null}function i(v){for(var h=new Map;v!==null;)v.key!==null?h.set(v.key,v):h.set(v.index,v),v=v.sibling;return h}function a(v,h){return v=ai(v,h),v.index=0,v.sibling=null,v}function r(v,h,b){return v.index=b,t?(b=v.alternate,b!==null?(b=b.index,b<h?(v.flags|=67108866,h):b):(v.flags|=67108866,h)):(v.flags|=1048576,h)}function s(v){return t&&v.alternate===null&&(v.flags|=67108866),v}function o(v,h,b,w){return h===null||h.tag!==6?(h=tp(b,v.mode,w),h.return=v,h):(h=a(h,b),h.return=v,h)}function l(v,h,b,w){var B=b.type;return B===_r?u(v,h,b.props.children,w,b.key):h!==null&&(h.elementType===B||typeof B=="object"&&B!==null&&B.$$typeof===Mi&&Ea(B)===h.type)?(h=a(h,b.props),ro(h,b),h.return=v,h):(h=uc(b.type,b.key,b.props,null,v.mode,w),ro(h,b),h.return=v,h)}function c(v,h,b,w){return h===null||h.tag!==4||h.stateNode.containerInfo!==b.containerInfo||h.stateNode.implementation!==b.implementation?(h=ep(b,v.mode,w),h.return=v,h):(h=a(h,b.children||[]),h.return=v,h)}function u(v,h,b,w,B){return h===null||h.tag!==7?(h=Sa(b,v.mode,w,B),h.return=v,h):(h=a(h,b),h.return=v,h)}function d(v,h,b){if(typeof h=="string"&&h!==""||typeof h=="number"||typeof h=="bigint")return h=tp(""+h,v.mode,b),h.return=v,h;if(typeof h=="object"&&h!==null){switch(h.$$typeof){case Ul:return b=uc(h.type,h.key,h.props,null,v.mode,b),ro(b,h),b.return=v,b;case uo:return h=ep(h,v.mode,b),h.return=v,h;case Mi:return h=Ea(h),d(v,h,b)}if(po(h)||io(h))return h=Sa(h,v.mode,b,null),h.return=v,h;if(typeof h.then=="function")return d(v,Ql(h),b);if(h.$$typeof===ei)return d(v,Zl(v,h),b);Jl(v,h)}return null}function p(v,h,b,w){var B=h!==null?h.key:null;if(typeof b=="string"&&b!==""||typeof b=="number"||typeof b=="bigint")return B!==null?null:o(v,h,""+b,w);if(typeof b=="object"&&b!==null){switch(b.$$typeof){case Ul:return b.key===B?l(v,h,b,w):null;case uo:return b.key===B?c(v,h,b,w):null;case Mi:return b=Ea(b),p(v,h,b,w)}if(po(b)||io(b))return B!==null?null:u(v,h,b,w,null);if(typeof b.then=="function")return p(v,h,Ql(b),w);if(b.$$typeof===ei)return p(v,h,Zl(v,b),w);Jl(v,b)}return null}function f(v,h,b,w,B){if(typeof w=="string"&&w!==""||typeof w=="number"||typeof w=="bigint")return v=v.get(b)||null,o(h,v,""+w,B);if(typeof w=="object"&&w!==null){switch(w.$$typeof){case Ul:return v=v.get(w.key===null?b:w.key)||null,l(h,v,w,B);case uo:return v=v.get(w.key===null?b:w.key)||null,c(h,v,w,B);case Mi:return w=Ea(w),f(v,h,b,w,B)}if(po(w)||io(w))return v=v.get(b)||null,u(h,v,w,B,null);if(typeof w.then=="function")return f(v,h,b,Ql(w),B);if(w.$$typeof===ei)return f(v,h,b,Zl(h,w),B);Jl(h,w)}return null}function y(v,h,b,w){for(var B=null,j=null,T=h,P=h=0,D=null;T!==null&&P<b.length;P++){T.index>P?(D=T,T=null):D=T.sibling;var I=p(v,T,b[P],w);if(I===null){T===null&&(T=D);break}t&&T&&I.alternate===null&&e(v,T),h=r(I,h,P),j===null?B=I:j.sibling=I,j=I,T=D}if(P===b.length)return n(v,T),ut&&Wn(v,P),B;if(T===null){for(;P<b.length;P++)T=d(v,b[P],w),T!==null&&(h=r(T,h,P),j===null?B=T:j.sibling=T,j=T);return ut&&Wn(v,P),B}for(T=i(T);P<b.length;P++)D=f(T,v,P,b[P],w),D!==null&&(t&&D.alternate!==null&&T.delete(D.key===null?P:D.key),h=r(D,h,P),j===null?B=D:j.sibling=D,j=D);return t&&T.forEach(function(q){return e(v,q)}),ut&&Wn(v,P),B}function x(v,h,b,w){if(b==null)throw Error(_(151));for(var B=null,j=null,T=h,P=h=0,D=null,I=b.next();T!==null&&!I.done;P++,I=b.next()){T.index>P?(D=T,T=null):D=T.sibling;var q=p(v,T,I.value,w);if(q===null){T===null&&(T=D);break}t&&T&&q.alternate===null&&e(v,T),h=r(q,h,P),j===null?B=q:j.sibling=q,j=q,T=D}if(I.done)return n(v,T),ut&&Wn(v,P),B;if(T===null){for(;!I.done;P++,I=b.next())I=d(v,I.value,w),I!==null&&(h=r(I,h,P),j===null?B=I:j.sibling=I,j=I);return ut&&Wn(v,P),B}for(T=i(T);!I.done;P++,I=b.next())I=f(T,v,P,I.value,w),I!==null&&(t&&I.alternate!==null&&T.delete(I.key===null?P:I.key),h=r(I,h,P),j===null?B=I:j.sibling=I,j=I);return t&&T.forEach(function(Et){return e(v,Et)}),ut&&Wn(v,P),B}function E(v,h,b,w){if(typeof b=="object"&&b!==null&&b.type===_r&&b.key===null&&(b=b.props.children),typeof b=="object"&&b!==null){switch(b.$$typeof){case Ul:t:{for(var B=b.key;h!==null;){if(h.key===B){if(B=b.type,B===_r){if(h.tag===7){n(v,h.sibling),w=a(h,b.props.children),w.return=v,v=w;break t}}else if(h.elementType===B||typeof B=="object"&&B!==null&&B.$$typeof===Mi&&Ea(B)===h.type){n(v,h.sibling),w=a(h,b.props),ro(w,b),w.return=v,v=w;break t}n(v,h);break}else e(v,h);h=h.sibling}b.type===_r?(w=Sa(b.props.children,v.mode,w,b.key),w.return=v,v=w):(w=uc(b.type,b.key,b.props,null,v.mode,w),ro(w,b),w.return=v,v=w)}return s(v);case uo:t:{for(B=b.key;h!==null;){if(h.key===B)if(h.tag===4&&h.stateNode.containerInfo===b.containerInfo&&h.stateNode.implementation===b.implementation){n(v,h.sibling),w=a(h,b.children||[]),w.return=v,v=w;break t}else{n(v,h);break}else e(v,h);h=h.sibling}w=ep(b,v.mode,w),w.return=v,v=w}return s(v);case Mi:return b=Ea(b),E(v,h,b,w)}if(po(b))return y(v,h,b,w);if(io(b)){if(B=io(b),typeof B!="function")throw Error(_(150));return b=B.call(b),x(v,h,b,w)}if(typeof b.then=="function")return E(v,h,Ql(b),w);if(b.$$typeof===ei)return E(v,h,Zl(v,b),w);Jl(v,b)}return typeof b=="string"&&b!==""||typeof b=="number"||typeof b=="bigint"?(b=""+b,h!==null&&h.tag===6?(n(v,h.sibling),w=a(h,b),w.return=v,v=w):(n(v,h),w=tp(b,v.mode,w),w.return=v,v=w),s(v)):n(v,h)}return function(v,h,b,w){try{Oo=0;var B=E(v,h,b,w);return Vr=null,B}catch(T){if(T===ls||T===nu)throw T;var j=$e(29,T,null,v.mode);return j.lanes=w,j.return=v,j}}}var Ra=g2(!0),m2=g2(!1),_i=!1;function Nf(t){t.updateQueue={baseState:t.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function Yp(t,e){t=t.updateQueue,e.updateQueue===t&&(e.updateQueue={baseState:t.baseState,firstBaseUpdate:t.firstBaseUpdate,lastBaseUpdate:t.lastBaseUpdate,shared:t.shared,callbacks:null})}function $i(t){return{lane:t,tag:0,payload:null,callback:null,next:null}}function Ui(t,e,n){var i=t.updateQueue;if(i===null)return null;if(i=i.shared,(ft&2)!==0){var a=i.pending;return a===null?e.next=e:(e.next=a.next,a.next=e),i.pending=e,e=Tc(t),o2(t,null,n),e}return eu(t,i,e,n),Tc(t)}function bo(t,e,n){if(e=e.updateQueue,e!==null&&(e=e.shared,(n&4194048)!==0)){var i=e.lanes;i&=t.pendingLanes,n|=i,e.lanes=n,Fy(t,n)}}function ip(t,e){var n=t.updateQueue,i=t.alternate;if(i!==null&&(i=i.updateQueue,n===i)){var a=null,r=null;if(n=n.firstBaseUpdate,n!==null){do{var s={lane:n.lane,tag:n.tag,payload:n.payload,callback:null,next:null};r===null?a=r=s:r=r.next=s,n=n.next}while(n!==null);r===null?a=r=e:r=r.next=e}else a=r=e;n={baseState:i.baseState,firstBaseUpdate:a,lastBaseUpdate:r,shared:i.shared,callbacks:i.callbacks},t.updateQueue=n;return}t=n.lastBaseUpdate,t===null?n.firstBaseUpdate=e:t.next=e,n.lastBaseUpdate=e}var Vp=!1;function ko(){if(Vp){var t=Yr;if(t!==null)throw t}}function Eo(t,e,n,i){Vp=!1;var a=t.updateQueue;_i=!1;var r=a.firstBaseUpdate,s=a.lastBaseUpdate,o=a.shared.pending;if(o!==null){a.shared.pending=null;var l=o,c=l.next;l.next=null,s===null?r=c:s.next=c,s=l;var u=t.alternate;u!==null&&(u=u.updateQueue,o=u.lastBaseUpdate,o!==s&&(o===null?u.firstBaseUpdate=c:o.next=c,u.lastBaseUpdate=l))}if(r!==null){var d=a.baseState;s=0,u=c=l=null,o=r;do{var p=o.lane&-536870913,f=p!==o.lane;if(f?(ot&p)===p:(i&p)===p){p!==0&&p===Qr&&(Vp=!0),u!==null&&(u=u.next={lane:0,tag:o.tag,payload:o.payload,callback:null,next:null});t:{var y=t,x=o;p=e;var E=n;switch(x.tag){case 1:if(y=x.payload,typeof y=="function"){d=y.call(E,d,p);break t}d=y;break t;case 3:y.flags=y.flags&-65537|128;case 0:if(y=x.payload,p=typeof y=="function"?y.call(E,d,p):y,p==null)break t;d=Rt({},d,p);break t;case 2:_i=!0}}p=o.callback,p!==null&&(t.flags|=64,f&&(t.flags|=8192),f=a.callbacks,f===null?a.callbacks=[p]:f.push(p))}else f={lane:p,tag:o.tag,payload:o.payload,callback:o.callback,next:null},u===null?(c=u=f,l=d):u=u.next=f,s|=p;if(o=o.next,o===null){if(o=a.shared.pending,o===null)break;f=o,o=f.next,f.next=null,a.lastBaseUpdate=f,a.shared.pending=null}}while(!0);u===null&&(l=d),a.baseState=l,a.firstBaseUpdate=c,a.lastBaseUpdate=u,r===null&&(a.shared.lanes=0),Qi|=s,t.lanes=s,t.memoizedState=d}}function y2(t,e){if(typeof t!="function")throw Error(_(191,t));t.call(e)}function x2(t,e){var n=t.callbacks;if(n!==null)for(t.callbacks=null,t=0;t<n.length;t++)y2(n[t],e)}var Jr=In(null),Rc=In(0);function Tm(t,e){t=di,At(Rc,t),At(Jr,e),di=t|e.baseLanes}function Gp(){At(Rc,di),At(Jr,Jr.current)}function Pf(){di=Rc.current,Wt(Jr),Wt(Rc)}var Xe=In(null),on=null;function Ri(t){var e=t.alternate;At(Pt,Pt.current&1),At(Xe,t),on===null&&(e===null||Jr.current!==null||e.memoizedState!==null)&&(on=t)}function qp(t){At(Pt,Pt.current),At(Xe,t),on===null&&(on=t)}function v2(t){t.tag===22?(At(Pt,Pt.current),At(Xe,t),on===null&&(on=t)):Di(t)}function Di(){At(Pt,Pt.current),At(Xe,Xe.current)}function je(t){Wt(Xe),on===t&&(on=null),Wt(Pt)}var Pt=In(0);function Dc(t){for(var e=t;e!==null;){if(e.tag===13){var n=e.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||ff(n)||hf(n)))return e}else if(e.tag===19&&(e.memoizedProps.revealOrder==="forwards"||e.memoizedProps.revealOrder==="backwards"||e.memoizedProps.revealOrder==="unstable_legacy-backwards"||e.memoizedProps.revealOrder==="together")){if((e.flags&128)!==0)return e}else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return null;e=e.return}e.sibling.return=e.return,e=e.sibling}return null}var li=0,Q=null,kt=null,Ut=null,Ic=!1,Gr=!1,Da=!1,Fc=0,zo=0,qr=null,cv=0;function zt(){throw Error(_(321))}function jf(t,e){if(e===null)return!1;for(var n=0;n<e.length&&n<t.length;n++)if(!qe(t[n],e[n]))return!1;return!0}function $f(t,e,n,i,a,r){return li=r,Q=e,e.memoizedState=null,e.updateQueue=null,e.lanes=0,V.H=t===null||t.memoizedState===null?Z2:Jf,Da=!1,r=n(i,a),Da=!1,Gr&&(r=k2(e,n,i,a)),b2(t),r}function b2(t){V.H=Lo;var e=kt!==null&&kt.next!==null;if(li=0,Ut=kt=Q=null,Ic=!1,zo=0,qr=null,e)throw Error(_(300));t===null||Vt||(t=t.dependencies,t!==null&&_c(t)&&(Vt=!0))}function k2(t,e,n,i){Q=t;var a=0;do{if(Gr&&(qr=null),zo=0,Gr=!1,25<=a)throw Error(_(301));if(a+=1,Ut=kt=null,t.updateQueue!=null){var r=t.updateQueue;r.lastEffect=null,r.events=null,r.stores=null,r.memoCache!=null&&(r.memoCache.index=0)}V.H=Q2,r=e(n,i)}while(Gr);return r}function uv(){var t=V.H,e=t.useState()[0];return e=typeof e.then=="function"?Zo(e):e,t=t.useState()[0],(kt!==null?kt.memoizedState:null)!==t&&(Q.flags|=1024),e}function Uf(){var t=Fc!==0;return Fc=0,t}function Hf(t,e,n){e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~n}function Yf(t){if(Ic){for(t=t.memoizedState;t!==null;){var e=t.queue;e!==null&&(e.pending=null),t=t.next}Ic=!1}li=0,Ut=kt=Q=null,Gr=!1,zo=Fc=0,qr=null}function xe(){var t={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Ut===null?Q.memoizedState=Ut=t:Ut=Ut.next=t,Ut}function jt(){if(kt===null){var t=Q.alternate;t=t!==null?t.memoizedState:null}else t=kt.next;var e=Ut===null?Q.memoizedState:Ut.next;if(e!==null)Ut=e,kt=t;else{if(t===null)throw Q.alternate===null?Error(_(467)):Error(_(310));kt=t,t={memoizedState:kt.memoizedState,baseState:kt.baseState,baseQueue:kt.baseQueue,queue:kt.queue,next:null},Ut===null?Q.memoizedState=Ut=t:Ut=Ut.next=t}return Ut}function iu(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function Zo(t){var e=zo;return zo+=1,qr===null&&(qr=[]),t=h2(qr,t,e),e=Q,(Ut===null?e.memoizedState:Ut.next)===null&&(e=e.alternate,V.H=e===null||e.memoizedState===null?Z2:Jf),t}function au(t){if(t!==null&&typeof t=="object"){if(typeof t.then=="function")return Zo(t);if(t.$$typeof===ei)return ae(t)}throw Error(_(438,String(t)))}function Vf(t){var e=null,n=Q.updateQueue;if(n!==null&&(e=n.memoCache),e==null){var i=Q.alternate;i!==null&&(i=i.updateQueue,i!==null&&(i=i.memoCache,i!=null&&(e={data:i.data.map(function(a){return a.slice()}),index:0})))}if(e==null&&(e={data:[],index:0}),n===null&&(n=iu(),Q.updateQueue=n),n.memoCache=e,n=e.data[e.index],n===void 0)for(n=e.data[e.index]=Array(t),i=0;i<t;i++)n[i]=K7;return e.index++,n}function ci(t,e){return typeof e=="function"?e(t):e}function pc(t){var e=jt();return Gf(e,kt,t)}function Gf(t,e,n){var i=t.queue;if(i===null)throw Error(_(311));i.lastRenderedReducer=n;var a=t.baseQueue,r=i.pending;if(r!==null){if(a!==null){var s=a.next;a.next=r.next,r.next=s}e.baseQueue=a=r,i.pending=null}if(r=t.baseState,a===null)t.memoizedState=r;else{e=a.next;var o=s=null,l=null,c=e,u=!1;do{var d=c.lane&-536870913;if(d!==c.lane?(ot&d)===d:(li&d)===d){var p=c.revertLane;if(p===0)l!==null&&(l=l.next={lane:0,revertLane:0,gesture:null,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null}),d===Qr&&(u=!0);else if((li&p)===p){c=c.next,p===Qr&&(u=!0);continue}else d={lane:0,revertLane:c.revertLane,gesture:null,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null},l===null?(o=l=d,s=r):l=l.next=d,Q.lanes|=p,Qi|=p;d=c.action,Da&&n(r,d),r=c.hasEagerState?c.eagerState:n(r,d)}else p={lane:d,revertLane:c.revertLane,gesture:c.gesture,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null},l===null?(o=l=p,s=r):l=l.next=p,Q.lanes|=d,Qi|=d;c=c.next}while(c!==null&&c!==e);if(l===null?s=r:l.next=o,!qe(r,t.memoizedState)&&(Vt=!0,u&&(n=Yr,n!==null)))throw n;t.memoizedState=r,t.baseState=s,t.baseQueue=l,i.lastRenderedState=r}return a===null&&(i.lanes=0),[t.memoizedState,i.dispatch]}function ap(t){var e=jt(),n=e.queue;if(n===null)throw Error(_(311));n.lastRenderedReducer=t;var i=n.dispatch,a=n.pending,r=e.memoizedState;if(a!==null){n.pending=null;var s=a=a.next;do r=t(r,s.action),s=s.next;while(s!==a);qe(r,e.memoizedState)||(Vt=!0),e.memoizedState=r,e.baseQueue===null&&(e.baseState=r),n.lastRenderedState=r}return[r,i]}function E2(t,e,n){var i=Q,a=jt(),r=ut;if(r){if(n===void 0)throw Error(_(407));n=n()}else n=e();var s=!qe((kt||a).memoizedState,n);if(s&&(a.memoizedState=n,Vt=!0),a=a.queue,qf(S2.bind(null,i,a,t),[t]),a.getSnapshot!==e||s||Ut!==null&&Ut.memoizedState.tag&1){if(i.flags|=2048,Wr(9,{destroy:void 0},C2.bind(null,i,a,n,e),null),Ct===null)throw Error(_(349));r||(li&127)!==0||w2(i,e,n)}return n}function w2(t,e,n){t.flags|=16384,t={getSnapshot:e,value:n},e=Q.updateQueue,e===null?(e=iu(),Q.updateQueue=e,e.stores=[t]):(n=e.stores,n===null?e.stores=[t]:n.push(t))}function C2(t,e,n,i){e.value=n,e.getSnapshot=i,A2(e)&&T2(t)}function S2(t,e,n){return n(function(){A2(e)&&T2(t)})}function A2(t){var e=t.getSnapshot;t=t.value;try{var n=e();return!qe(t,n)}catch{return!0}}function T2(t){var e=La(t,2);e!==null&&Me(e,t,2)}function Xp(t){var e=xe();if(typeof t=="function"){var n=t;if(t=n(),Da){Fi(!0);try{n()}finally{Fi(!1)}}}return e.memoizedState=e.baseState=t,e.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:ci,lastRenderedState:t},e}function M2(t,e,n,i){return t.baseState=n,Gf(t,kt,typeof i=="function"?i:ci)}function dv(t,e,n,i,a){if(su(t))throw Error(_(485));if(t=e.action,t!==null){var r={payload:a,action:t,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(s){r.listeners.push(s)}};V.T!==null?n(!0):r.isTransition=!1,i(r),n=e.pending,n===null?(r.next=e.pending=r,_2(e,r)):(r.next=n.next,e.pending=n.next=r)}}function _2(t,e){var n=e.action,i=e.payload,a=t.state;if(e.isTransition){var r=V.T,s={};V.T=s;try{var o=n(a,i),l=V.S;l!==null&&l(s,o),Mm(t,e,o)}catch(c){Kp(t,e,c)}finally{r!==null&&s.types!==null&&(r.types=s.types),V.T=r}}else try{r=n(a,i),Mm(t,e,r)}catch(c){Kp(t,e,c)}}function Mm(t,e,n){n!==null&&typeof n=="object"&&typeof n.then=="function"?n.then(function(i){_m(t,e,i)},function(i){return Kp(t,e,i)}):_m(t,e,n)}function _m(t,e,n){e.status="fulfilled",e.value=n,B2(e),t.state=n,e=t.pending,e!==null&&(n=e.next,n===e?t.pending=null:(n=n.next,e.next=n,_2(t,n)))}function Kp(t,e,n){var i=t.pending;if(t.pending=null,i!==null){i=i.next;do e.status="rejected",e.reason=n,B2(e),e=e.next;while(e!==i)}t.action=null}function B2(t){t=t.listeners;for(var e=0;e<t.length;e++)(0,t[e])()}function R2(t,e){return e}function Bm(t,e){if(ut){var n=Ct.formState;if(n!==null){t:{var i=Q;if(ut){if(Bt){e:{for(var a=Bt,r=sn;a.nodeType!==8;){if(!r){a=null;break e}if(a=ln(a.nextSibling),a===null){a=null;break e}}r=a.data,a=r==="F!"||r==="F"?a:null}if(a){Bt=ln(a.nextSibling),i=a.data==="F!";break t}}Ki(i)}i=!1}i&&(e=n[0])}}return n=xe(),n.memoizedState=n.baseState=e,i={pending:null,lanes:0,dispatch:null,lastRenderedReducer:R2,lastRenderedState:e},n.queue=i,n=q2.bind(null,Q,i),i.dispatch=n,i=Xp(!1),r=Qf.bind(null,Q,!1,i.queue),i=xe(),a={state:e,dispatch:null,action:t,pending:null},i.queue=a,n=dv.bind(null,Q,a,r,n),a.dispatch=n,i.memoizedState=t,[e,n,!1]}function Rm(t){var e=jt();return D2(e,kt,t)}function D2(t,e,n){if(e=Gf(t,e,R2)[0],t=pc(ci)[0],typeof e=="object"&&e!==null&&typeof e.then=="function")try{var i=Zo(e)}catch(s){throw s===ls?nu:s}else i=e;e=jt();var a=e.queue,r=a.dispatch;return n!==e.memoizedState&&(Q.flags|=2048,Wr(9,{destroy:void 0},pv.bind(null,a,n),null)),[i,r,t]}function pv(t,e){t.action=e}function Dm(t){var e=jt(),n=kt;if(n!==null)return D2(e,n,t);jt(),e=e.memoizedState,n=jt();var i=n.queue.dispatch;return n.memoizedState=t,[e,i,!1]}function Wr(t,e,n,i){return t={tag:t,create:n,deps:i,inst:e,next:null},e=Q.updateQueue,e===null&&(e=iu(),Q.updateQueue=e),n=e.lastEffect,n===null?e.lastEffect=t.next=t:(i=n.next,n.next=t,t.next=i,e.lastEffect=t),t}function I2(){return jt().memoizedState}function fc(t,e,n,i){var a=xe();Q.flags|=t,a.memoizedState=Wr(1|e,{destroy:void 0},n,i===void 0?null:i)}function ru(t,e,n,i){var a=jt();i=i===void 0?null:i;var r=a.memoizedState.inst;kt!==null&&i!==null&&jf(i,kt.memoizedState.deps)?a.memoizedState=Wr(e,r,n,i):(Q.flags|=t,a.memoizedState=Wr(1|e,r,n,i))}function Im(t,e){fc(8390656,8,t,e)}function qf(t,e){ru(2048,8,t,e)}function fv(t){Q.flags|=4;var e=Q.updateQueue;if(e===null)e=iu(),Q.updateQueue=e,e.events=[t];else{var n=e.events;n===null?e.events=[t]:n.push(t)}}function F2(t){var e=jt().memoizedState;return fv({ref:e,nextImpl:t}),function(){if((ft&2)!==0)throw Error(_(440));return e.impl.apply(void 0,arguments)}}function O2(t,e){return ru(4,2,t,e)}function z2(t,e){return ru(4,4,t,e)}function L2(t,e){if(typeof e=="function"){t=t();var n=e(t);return function(){typeof n=="function"?n():e(null)}}if(e!=null)return t=t(),e.current=t,function(){e.current=null}}function N2(t,e,n){n=n!=null?n.concat([t]):null,ru(4,4,L2.bind(null,e,t),n)}function Xf(){}function P2(t,e){var n=jt();e=e===void 0?null:e;var i=n.memoizedState;return e!==null&&jf(e,i[1])?i[0]:(n.memoizedState=[t,e],t)}function j2(t,e){var n=jt();e=e===void 0?null:e;var i=n.memoizedState;if(e!==null&&jf(e,i[1]))return i[0];if(i=t(),Da){Fi(!0);try{t()}finally{Fi(!1)}}return n.memoizedState=[i,e],i}function Kf(t,e,n){return n===void 0||(li&1073741824)!==0&&(ot&261930)===0?t.memoizedState=e:(t.memoizedState=n,t=M6(),Q.lanes|=t,Qi|=t,n)}function $2(t,e,n,i){return qe(n,e)?n:Jr.current!==null?(t=Kf(t,n,i),qe(t,e)||(Vt=!0),t):(li&42)===0||(li&1073741824)!==0&&(ot&261930)===0?(Vt=!0,t.memoizedState=n):(t=M6(),Q.lanes|=t,Qi|=t,e)}function U2(t,e,n,i,a){var r=ht.p;ht.p=r!==0&&8>r?r:8;var s=V.T,o={};V.T=o,Qf(t,!1,e,n);try{var l=a(),c=V.S;if(c!==null&&c(o,l),l!==null&&typeof l=="object"&&typeof l.then=="function"){var u=lv(l,i);wo(t,e,u,Ge(t))}else wo(t,e,i,Ge(t))}catch(d){wo(t,e,{then:function(){},status:"rejected",reason:d},Ge())}finally{ht.p=r,s!==null&&o.types!==null&&(s.types=o.types),V.T=s}}function hv(){}function Zp(t,e,n,i){if(t.tag!==5)throw Error(_(476));var a=H2(t).queue;U2(t,a,e,Ca,n===null?hv:function(){return Y2(t),n(i)})}function H2(t){var e=t.memoizedState;if(e!==null)return e;e={memoizedState:Ca,baseState:Ca,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:ci,lastRenderedState:Ca},next:null};var n={};return e.next={memoizedState:n,baseState:n,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:ci,lastRenderedState:n},next:null},t.memoizedState=e,t=t.alternate,t!==null&&(t.memoizedState=e),e}function Y2(t){var e=H2(t);e.next===null&&(e=t.alternate.memoizedState),wo(t,e.next.queue,{},Ge())}function Zf(){return ae(jo)}function V2(){return jt().memoizedState}function G2(){return jt().memoizedState}function gv(t){for(var e=t.return;e!==null;){switch(e.tag){case 24:case 3:var n=Ge();t=$i(n);var i=Ui(e,t,n);i!==null&&(Me(i,e,n),bo(i,e,n)),e={cache:Of()},t.payload=e;return}e=e.return}}function mv(t,e,n){var i=Ge();n={lane:i,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},su(t)?X2(e,n):(n=Rf(t,e,n,i),n!==null&&(Me(n,t,i),K2(n,e,i)))}function q2(t,e,n){var i=Ge();wo(t,e,n,i)}function wo(t,e,n,i){var a={lane:i,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null};if(su(t))X2(e,a);else{var r=t.alternate;if(t.lanes===0&&(r===null||r.lanes===0)&&(r=e.lastRenderedReducer,r!==null))try{var s=e.lastRenderedState,o=r(s,n);if(a.hasEagerState=!0,a.eagerState=o,qe(o,s))return eu(t,e,a,0),Ct===null&&tu(),!1}catch{}if(n=Rf(t,e,a,i),n!==null)return Me(n,t,i),K2(n,e,i),!0}return!1}function Qf(t,e,n,i){if(i={lane:2,revertLane:s1(),gesture:null,action:i,hasEagerState:!1,eagerState:null,next:null},su(t)){if(e)throw Error(_(479))}else e=Rf(t,n,i,2),e!==null&&Me(e,t,2)}function su(t){var e=t.alternate;return t===Q||e!==null&&e===Q}function X2(t,e){Gr=Ic=!0;var n=t.pending;n===null?e.next=e:(e.next=n.next,n.next=e),t.pending=e}function K2(t,e,n){if((n&4194048)!==0){var i=e.lanes;i&=t.pendingLanes,n|=i,e.lanes=n,Fy(t,n)}}var Lo={readContext:ae,use:au,useCallback:zt,useContext:zt,useEffect:zt,useImperativeHandle:zt,useLayoutEffect:zt,useInsertionEffect:zt,useMemo:zt,useReducer:zt,useRef:zt,useState:zt,useDebugValue:zt,useDeferredValue:zt,useTransition:zt,useSyncExternalStore:zt,useId:zt,useHostTransitionStatus:zt,useFormState:zt,useActionState:zt,useOptimistic:zt,useMemoCache:zt,useCacheRefresh:zt};Lo.useEffectEvent=zt;var Z2={readContext:ae,use:au,useCallback:function(t,e){return xe().memoizedState=[t,e===void 0?null:e],t},useContext:ae,useEffect:Im,useImperativeHandle:function(t,e,n){n=n!=null?n.concat([t]):null,fc(4194308,4,L2.bind(null,e,t),n)},useLayoutEffect:function(t,e){return fc(4194308,4,t,e)},useInsertionEffect:function(t,e){fc(4,2,t,e)},useMemo:function(t,e){var n=xe();e=e===void 0?null:e;var i=t();if(Da){Fi(!0);try{t()}finally{Fi(!1)}}return n.memoizedState=[i,e],i},useReducer:function(t,e,n){var i=xe();if(n!==void 0){var a=n(e);if(Da){Fi(!0);try{n(e)}finally{Fi(!1)}}}else a=e;return i.memoizedState=i.baseState=a,t={pending:null,lanes:0,dispatch:null,lastRenderedReducer:t,lastRenderedState:a},i.queue=t,t=t.dispatch=mv.bind(null,Q,t),[i.memoizedState,t]},useRef:function(t){var e=xe();return t={current:t},e.memoizedState=t},useState:function(t){t=Xp(t);var e=t.queue,n=q2.bind(null,Q,e);return e.dispatch=n,[t.memoizedState,n]},useDebugValue:Xf,useDeferredValue:function(t,e){var n=xe();return Kf(n,t,e)},useTransition:function(){var t=Xp(!1);return t=U2.bind(null,Q,t.queue,!0,!1),xe().memoizedState=t,[!1,t]},useSyncExternalStore:function(t,e,n){var i=Q,a=xe();if(ut){if(n===void 0)throw Error(_(407));n=n()}else{if(n=e(),Ct===null)throw Error(_(349));(ot&127)!==0||w2(i,e,n)}a.memoizedState=n;var r={value:n,getSnapshot:e};return a.queue=r,Im(S2.bind(null,i,r,t),[t]),i.flags|=2048,Wr(9,{destroy:void 0},C2.bind(null,i,r,n,e),null),n},useId:function(){var t=xe(),e=Ct.identifierPrefix;if(ut){var n=Bn,i=_n;n=(i&~(1<<32-Ve(i)-1)).toString(32)+n,e="_"+e+"R_"+n,n=Fc++,0<n&&(e+="H"+n.toString(32)),e+="_"}else n=cv++,e="_"+e+"r_"+n.toString(32)+"_";return t.memoizedState=e},useHostTransitionStatus:Zf,useFormState:Bm,useActionState:Bm,useOptimistic:function(t){var e=xe();e.memoizedState=e.baseState=t;var n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return e.queue=n,e=Qf.bind(null,Q,!0,n),n.dispatch=e,[t,e]},useMemoCache:Vf,useCacheRefresh:function(){return xe().memoizedState=gv.bind(null,Q)},useEffectEvent:function(t){var e=xe(),n={impl:t};return e.memoizedState=n,function(){if((ft&2)!==0)throw Error(_(440));return n.impl.apply(void 0,arguments)}}},Jf={readContext:ae,use:au,useCallback:P2,useContext:ae,useEffect:qf,useImperativeHandle:N2,useInsertionEffect:O2,useLayoutEffect:z2,useMemo:j2,useReducer:pc,useRef:I2,useState:function(){return pc(ci)},useDebugValue:Xf,useDeferredValue:function(t,e){var n=jt();return $2(n,kt.memoizedState,t,e)},useTransition:function(){var t=pc(ci)[0],e=jt().memoizedState;return[typeof t=="boolean"?t:Zo(t),e]},useSyncExternalStore:E2,useId:V2,useHostTransitionStatus:Zf,useFormState:Rm,useActionState:Rm,useOptimistic:function(t,e){var n=jt();return M2(n,kt,t,e)},useMemoCache:Vf,useCacheRefresh:G2};Jf.useEffectEvent=F2;var Q2={readContext:ae,use:au,useCallback:P2,useContext:ae,useEffect:qf,useImperativeHandle:N2,useInsertionEffect:O2,useLayoutEffect:z2,useMemo:j2,useReducer:ap,useRef:I2,useState:function(){return ap(ci)},useDebugValue:Xf,useDeferredValue:function(t,e){var n=jt();return kt===null?Kf(n,t,e):$2(n,kt.memoizedState,t,e)},useTransition:function(){var t=ap(ci)[0],e=jt().memoizedState;return[typeof t=="boolean"?t:Zo(t),e]},useSyncExternalStore:E2,useId:V2,useHostTransitionStatus:Zf,useFormState:Dm,useActionState:Dm,useOptimistic:function(t,e){var n=jt();return kt!==null?M2(n,kt,t,e):(n.baseState=t,[t,n.queue.dispatch])},useMemoCache:Vf,useCacheRefresh:G2};Q2.useEffectEvent=F2;function rp(t,e,n,i){e=t.memoizedState,n=n(i,e),n=n==null?e:Rt({},e,n),t.memoizedState=n,t.lanes===0&&(t.updateQueue.baseState=n)}var Qp={enqueueSetState:function(t,e,n){t=t._reactInternals;var i=Ge(),a=$i(i);a.payload=e,n!=null&&(a.callback=n),e=Ui(t,a,i),e!==null&&(Me(e,t,i),bo(e,t,i))},enqueueReplaceState:function(t,e,n){t=t._reactInternals;var i=Ge(),a=$i(i);a.tag=1,a.payload=e,n!=null&&(a.callback=n),e=Ui(t,a,i),e!==null&&(Me(e,t,i),bo(e,t,i))},enqueueForceUpdate:function(t,e){t=t._reactInternals;var n=Ge(),i=$i(n);i.tag=2,e!=null&&(i.callback=e),e=Ui(t,i,n),e!==null&&(Me(e,t,n),bo(e,t,n))}};function Fm(t,e,n,i,a,r,s){return t=t.stateNode,typeof t.shouldComponentUpdate=="function"?t.shouldComponentUpdate(i,r,s):e.prototype&&e.prototype.isPureReactComponent?!Do(n,i)||!Do(a,r):!0}function Om(t,e,n,i){t=e.state,typeof e.componentWillReceiveProps=="function"&&e.componentWillReceiveProps(n,i),typeof e.UNSAFE_componentWillReceiveProps=="function"&&e.UNSAFE_componentWillReceiveProps(n,i),e.state!==t&&Qp.enqueueReplaceState(e,e.state,null)}function Ia(t,e){var n=e;if("ref"in e){n={};for(var i in e)i!=="ref"&&(n[i]=e[i])}if(t=t.defaultProps){n===e&&(n=Rt({},n));for(var a in t)n[a]===void 0&&(n[a]=t[a])}return n}function J2(t){Ac(t)}function W2(t){console.error(t)}function t6(t){Ac(t)}function Oc(t,e){try{var n=t.onUncaughtError;n(e.value,{componentStack:e.stack})}catch(i){setTimeout(function(){throw i})}}function zm(t,e,n){try{var i=t.onCaughtError;i(n.value,{componentStack:n.stack,errorBoundary:e.tag===1?e.stateNode:null})}catch(a){setTimeout(function(){throw a})}}function Jp(t,e,n){return n=$i(n),n.tag=3,n.payload={element:null},n.callback=function(){Oc(t,e)},n}function e6(t){return t=$i(t),t.tag=3,t}function n6(t,e,n,i){var a=n.type.getDerivedStateFromError;if(typeof a=="function"){var r=i.value;t.payload=function(){return a(r)},t.callback=function(){zm(e,n,i)}}var s=n.stateNode;s!==null&&typeof s.componentDidCatch=="function"&&(t.callback=function(){zm(e,n,i),typeof a!="function"&&(Hi===null?Hi=new Set([this]):Hi.add(this));var o=i.stack;this.componentDidCatch(i.value,{componentStack:o!==null?o:""})})}function yv(t,e,n,i,a){if(n.flags|=32768,i!==null&&typeof i=="object"&&typeof i.then=="function"){if(e=n.alternate,e!==null&&os(e,n,a,!0),n=Xe.current,n!==null){switch(n.tag){case 31:case 13:return on===null?jc():n.alternate===null&&Lt===0&&(Lt=3),n.flags&=-257,n.flags|=65536,n.lanes=a,i===Bc?n.flags|=16384:(e=n.updateQueue,e===null?n.updateQueue=new Set([i]):e.add(i),mp(t,i,a)),!1;case 22:return n.flags|=65536,i===Bc?n.flags|=16384:(e=n.updateQueue,e===null?(e={transitions:null,markerInstances:null,retryQueue:new Set([i])},n.updateQueue=e):(n=e.retryQueue,n===null?e.retryQueue=new Set([i]):n.add(i)),mp(t,i,a)),!1}throw Error(_(435,n.tag))}return mp(t,i,a),jc(),!1}if(ut)return e=Xe.current,e!==null?((e.flags&65536)===0&&(e.flags|=256),e.flags|=65536,e.lanes=a,i!==Pp&&(t=Error(_(422),{cause:i}),Fo(rn(t,n)))):(i!==Pp&&(e=Error(_(423),{cause:i}),Fo(rn(e,n))),t=t.current.alternate,t.flags|=65536,a&=-a,t.lanes|=a,i=rn(i,n),a=Jp(t.stateNode,i,a),ip(t,a),Lt!==4&&(Lt=2)),!1;var r=Error(_(520),{cause:i});if(r=rn(r,n),Ao===null?Ao=[r]:Ao.push(r),Lt!==4&&(Lt=2),e===null)return!0;i=rn(i,n),n=e;do{switch(n.tag){case 3:return n.flags|=65536,t=a&-a,n.lanes|=t,t=Jp(n.stateNode,i,t),ip(n,t),!1;case 1:if(e=n.type,r=n.stateNode,(n.flags&128)===0&&(typeof e.getDerivedStateFromError=="function"||r!==null&&typeof r.componentDidCatch=="function"&&(Hi===null||!Hi.has(r))))return n.flags|=65536,a&=-a,n.lanes|=a,a=e6(a),n6(a,t,n,i),ip(n,a),!1}n=n.return}while(n!==null);return!1}var Wf=Error(_(461)),Vt=!1;function ee(t,e,n,i){e.child=t===null?m2(e,null,n,i):Ra(e,t.child,n,i)}function Lm(t,e,n,i,a){n=n.render;var r=e.ref;if("ref"in i){var s={};for(var o in i)o!=="ref"&&(s[o]=i[o])}else s=i;return Ba(e),i=$f(t,e,n,s,r,a),o=Uf(),t!==null&&!Vt?(Hf(t,e,a),ui(t,e,a)):(ut&&o&&If(e),e.flags|=1,ee(t,e,i,a),e.child)}function Nm(t,e,n,i,a){if(t===null){var r=n.type;return typeof r=="function"&&!Df(r)&&r.defaultProps===void 0&&n.compare===null?(e.tag=15,e.type=r,i6(t,e,r,i,a)):(t=uc(n.type,null,i,e,e.mode,a),t.ref=e.ref,t.return=e,e.child=t)}if(r=t.child,!t1(t,a)){var s=r.memoizedProps;if(n=n.compare,n=n!==null?n:Do,n(s,i)&&t.ref===e.ref)return ui(t,e,a)}return e.flags|=1,t=ai(r,i),t.ref=e.ref,t.return=e,e.child=t}function i6(t,e,n,i,a){if(t!==null){var r=t.memoizedProps;if(Do(r,i)&&t.ref===e.ref)if(Vt=!1,e.pendingProps=i=r,t1(t,a))(t.flags&131072)!==0&&(Vt=!0);else return e.lanes=t.lanes,ui(t,e,a)}return Wp(t,e,n,i,a)}function a6(t,e,n,i){var a=i.children,r=t!==null?t.memoizedState:null;if(t===null&&e.stateNode===null&&(e.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),i.mode==="hidden"){if((e.flags&128)!==0){if(r=r!==null?r.baseLanes|n:n,t!==null){for(i=e.child=t.child,a=0;i!==null;)a=a|i.lanes|i.childLanes,i=i.sibling;i=a&~r}else i=0,e.child=null;return Pm(t,e,r,n,i)}if((n&536870912)!==0)e.memoizedState={baseLanes:0,cachePool:null},t!==null&&dc(e,r!==null?r.cachePool:null),r!==null?Tm(e,r):Gp(),v2(e);else return i=e.lanes=536870912,Pm(t,e,r!==null?r.baseLanes|n:n,n,i)}else r!==null?(dc(e,r.cachePool),Tm(e,r),Di(e),e.memoizedState=null):(t!==null&&dc(e,null),Gp(),Di(e));return ee(t,e,a,n),e.child}function ho(t,e){return t!==null&&t.tag===22||e.stateNode!==null||(e.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),e.sibling}function Pm(t,e,n,i,a){var r=zf();return r=r===null?null:{parent:Yt._currentValue,pool:r},e.memoizedState={baseLanes:n,cachePool:r},t!==null&&dc(e,null),Gp(),v2(e),t!==null&&os(t,e,i,!0),e.childLanes=a,null}function hc(t,e){return e=zc({mode:e.mode,children:e.children},t.mode),e.ref=t.ref,t.child=e,e.return=t,e}function jm(t,e,n){return Ra(e,t.child,null,n),t=hc(e,e.pendingProps),t.flags|=2,je(e),e.memoizedState=null,t}function xv(t,e,n){var i=e.pendingProps,a=(e.flags&128)!==0;if(e.flags&=-129,t===null){if(ut){if(i.mode==="hidden")return t=hc(e,i),e.lanes=536870912,ho(null,t);if(qp(e),(t=Bt)?(t=Z6(t,sn),t=t!==null&&t.data==="&"?t:null,t!==null&&(e.memoizedState={dehydrated:t,treeContext:Xi!==null?{id:_n,overflow:Bn}:null,retryLane:536870912,hydrationErrors:null},n=c2(t),n.return=e,e.child=n,ie=e,Bt=null)):t=null,t===null)throw Ki(e);return e.lanes=536870912,null}return hc(e,i)}var r=t.memoizedState;if(r!==null){var s=r.dehydrated;if(qp(e),a)if(e.flags&256)e.flags&=-257,e=jm(t,e,n);else if(e.memoizedState!==null)e.child=t.child,e.flags|=128,e=null;else throw Error(_(558));else if(Vt||os(t,e,n,!1),a=(n&t.childLanes)!==0,Vt||a){if(i=Ct,i!==null&&(s=Oy(i,n),s!==0&&s!==r.retryLane))throw r.retryLane=s,La(t,s),Me(i,t,s),Wf;jc(),e=jm(t,e,n)}else t=r.treeContext,Bt=ln(s.nextSibling),ie=e,ut=!0,ji=null,sn=!1,t!==null&&d2(e,t),e=hc(e,i),e.flags|=4096;return e}return t=ai(t.child,{mode:i.mode,children:i.children}),t.ref=e.ref,e.child=t,t.return=e,t}function gc(t,e){var n=e.ref;if(n===null)t!==null&&t.ref!==null&&(e.flags|=4194816);else{if(typeof n!="function"&&typeof n!="object")throw Error(_(284));(t===null||t.ref!==n)&&(e.flags|=4194816)}}function Wp(t,e,n,i,a){return Ba(e),n=$f(t,e,n,i,void 0,a),i=Uf(),t!==null&&!Vt?(Hf(t,e,a),ui(t,e,a)):(ut&&i&&If(e),e.flags|=1,ee(t,e,n,a),e.child)}function $m(t,e,n,i,a,r){return Ba(e),e.updateQueue=null,n=k2(e,i,n,a),b2(t),i=Uf(),t!==null&&!Vt?(Hf(t,e,r),ui(t,e,r)):(ut&&i&&If(e),e.flags|=1,ee(t,e,n,r),e.child)}function Um(t,e,n,i,a){if(Ba(e),e.stateNode===null){var r=Lr,s=n.contextType;typeof s=="object"&&s!==null&&(r=ae(s)),r=new n(i,r),e.memoizedState=r.state!==null&&r.state!==void 0?r.state:null,r.updater=Qp,e.stateNode=r,r._reactInternals=e,r=e.stateNode,r.props=i,r.state=e.memoizedState,r.refs={},Nf(e),s=n.contextType,r.context=typeof s=="object"&&s!==null?ae(s):Lr,r.state=e.memoizedState,s=n.getDerivedStateFromProps,typeof s=="function"&&(rp(e,n,s,i),r.state=e.memoizedState),typeof n.getDerivedStateFromProps=="function"||typeof r.getSnapshotBeforeUpdate=="function"||typeof r.UNSAFE_componentWillMount!="function"&&typeof r.componentWillMount!="function"||(s=r.state,typeof r.componentWillMount=="function"&&r.componentWillMount(),typeof r.UNSAFE_componentWillMount=="function"&&r.UNSAFE_componentWillMount(),s!==r.state&&Qp.enqueueReplaceState(r,r.state,null),Eo(e,i,r,a),ko(),r.state=e.memoizedState),typeof r.componentDidMount=="function"&&(e.flags|=4194308),i=!0}else if(t===null){r=e.stateNode;var o=e.memoizedProps,l=Ia(n,o);r.props=l;var c=r.context,u=n.contextType;s=Lr,typeof u=="object"&&u!==null&&(s=ae(u));var d=n.getDerivedStateFromProps;u=typeof d=="function"||typeof r.getSnapshotBeforeUpdate=="function",o=e.pendingProps!==o,u||typeof r.UNSAFE_componentWillReceiveProps!="function"&&typeof r.componentWillReceiveProps!="function"||(o||c!==s)&&Om(e,r,i,s),_i=!1;var p=e.memoizedState;r.state=p,Eo(e,i,r,a),ko(),c=e.memoizedState,o||p!==c||_i?(typeof d=="function"&&(rp(e,n,d,i),c=e.memoizedState),(l=_i||Fm(e,n,l,i,p,c,s))?(u||typeof r.UNSAFE_componentWillMount!="function"&&typeof r.componentWillMount!="function"||(typeof r.componentWillMount=="function"&&r.componentWillMount(),typeof r.UNSAFE_componentWillMount=="function"&&r.UNSAFE_componentWillMount()),typeof r.componentDidMount=="function"&&(e.flags|=4194308)):(typeof r.componentDidMount=="function"&&(e.flags|=4194308),e.memoizedProps=i,e.memoizedState=c),r.props=i,r.state=c,r.context=s,i=l):(typeof r.componentDidMount=="function"&&(e.flags|=4194308),i=!1)}else{r=e.stateNode,Yp(t,e),s=e.memoizedProps,u=Ia(n,s),r.props=u,d=e.pendingProps,p=r.context,c=n.contextType,l=Lr,typeof c=="object"&&c!==null&&(l=ae(c)),o=n.getDerivedStateFromProps,(c=typeof o=="function"||typeof r.getSnapshotBeforeUpdate=="function")||typeof r.UNSAFE_componentWillReceiveProps!="function"&&typeof r.componentWillReceiveProps!="function"||(s!==d||p!==l)&&Om(e,r,i,l),_i=!1,p=e.memoizedState,r.state=p,Eo(e,i,r,a),ko();var f=e.memoizedState;s!==d||p!==f||_i||t!==null&&t.dependencies!==null&&_c(t.dependencies)?(typeof o=="function"&&(rp(e,n,o,i),f=e.memoizedState),(u=_i||Fm(e,n,u,i,p,f,l)||t!==null&&t.dependencies!==null&&_c(t.dependencies))?(c||typeof r.UNSAFE_componentWillUpdate!="function"&&typeof r.componentWillUpdate!="function"||(typeof r.componentWillUpdate=="function"&&r.componentWillUpdate(i,f,l),typeof r.UNSAFE_componentWillUpdate=="function"&&r.UNSAFE_componentWillUpdate(i,f,l)),typeof r.componentDidUpdate=="function"&&(e.flags|=4),typeof r.getSnapshotBeforeUpdate=="function"&&(e.flags|=1024)):(typeof r.componentDidUpdate!="function"||s===t.memoizedProps&&p===t.memoizedState||(e.flags|=4),typeof r.getSnapshotBeforeUpdate!="function"||s===t.memoizedProps&&p===t.memoizedState||(e.flags|=1024),e.memoizedProps=i,e.memoizedState=f),r.props=i,r.state=f,r.context=l,i=u):(typeof r.componentDidUpdate!="function"||s===t.memoizedProps&&p===t.memoizedState||(e.flags|=4),typeof r.getSnapshotBeforeUpdate!="function"||s===t.memoizedProps&&p===t.memoizedState||(e.flags|=1024),i=!1)}return r=i,gc(t,e),i=(e.flags&128)!==0,r||i?(r=e.stateNode,n=i&&typeof n.getDerivedStateFromError!="function"?null:r.render(),e.flags|=1,t!==null&&i?(e.child=Ra(e,t.child,null,a),e.child=Ra(e,null,n,a)):ee(t,e,n,a),e.memoizedState=r.state,t=e.child):t=ui(t,e,a),t}function Hm(t,e,n,i){return _a(),e.flags|=256,ee(t,e,n,i),e.child}var sp={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function op(t){return{baseLanes:t,cachePool:f2()}}function lp(t,e,n){return t=t!==null?t.childLanes&~n:0,e&&(t|=Ue),t}function r6(t,e,n){var i=e.pendingProps,a=!1,r=(e.flags&128)!==0,s;if((s=r)||(s=t!==null&&t.memoizedState===null?!1:(Pt.current&2)!==0),s&&(a=!0,e.flags&=-129),s=(e.flags&32)!==0,e.flags&=-33,t===null){if(ut){if(a?Ri(e):Di(e),(t=Bt)?(t=Z6(t,sn),t=t!==null&&t.data!=="&"?t:null,t!==null&&(e.memoizedState={dehydrated:t,treeContext:Xi!==null?{id:_n,overflow:Bn}:null,retryLane:536870912,hydrationErrors:null},n=c2(t),n.return=e,e.child=n,ie=e,Bt=null)):t=null,t===null)throw Ki(e);return hf(t)?e.lanes=32:e.lanes=536870912,null}var o=i.children;return i=i.fallback,a?(Di(e),a=e.mode,o=zc({mode:"hidden",children:o},a),i=Sa(i,a,n,null),o.return=e,i.return=e,o.sibling=i,e.child=o,i=e.child,i.memoizedState=op(n),i.childLanes=lp(t,s,n),e.memoizedState=sp,ho(null,i)):(Ri(e),tf(e,o))}var l=t.memoizedState;if(l!==null&&(o=l.dehydrated,o!==null)){if(r)e.flags&256?(Ri(e),e.flags&=-257,e=cp(t,e,n)):e.memoizedState!==null?(Di(e),e.child=t.child,e.flags|=128,e=null):(Di(e),o=i.fallback,a=e.mode,i=zc({mode:"visible",children:i.children},a),o=Sa(o,a,n,null),o.flags|=2,i.return=e,o.return=e,i.sibling=o,e.child=i,Ra(e,t.child,null,n),i=e.child,i.memoizedState=op(n),i.childLanes=lp(t,s,n),e.memoizedState=sp,e=ho(null,i));else if(Ri(e),hf(o)){if(s=o.nextSibling&&o.nextSibling.dataset,s)var c=s.dgst;s=c,i=Error(_(419)),i.stack="",i.digest=s,Fo({value:i,source:null,stack:null}),e=cp(t,e,n)}else if(Vt||os(t,e,n,!1),s=(n&t.childLanes)!==0,Vt||s){if(s=Ct,s!==null&&(i=Oy(s,n),i!==0&&i!==l.retryLane))throw l.retryLane=i,La(t,i),Me(s,t,i),Wf;ff(o)||jc(),e=cp(t,e,n)}else ff(o)?(e.flags|=192,e.child=t.child,e=null):(t=l.treeContext,Bt=ln(o.nextSibling),ie=e,ut=!0,ji=null,sn=!1,t!==null&&d2(e,t),e=tf(e,i.children),e.flags|=4096);return e}return a?(Di(e),o=i.fallback,a=e.mode,l=t.child,c=l.sibling,i=ai(l,{mode:"hidden",children:i.children}),i.subtreeFlags=l.subtreeFlags&65011712,c!==null?o=ai(c,o):(o=Sa(o,a,n,null),o.flags|=2),o.return=e,i.return=e,i.sibling=o,e.child=i,ho(null,i),i=e.child,o=t.child.memoizedState,o===null?o=op(n):(a=o.cachePool,a!==null?(l=Yt._currentValue,a=a.parent!==l?{parent:l,pool:l}:a):a=f2(),o={baseLanes:o.baseLanes|n,cachePool:a}),i.memoizedState=o,i.childLanes=lp(t,s,n),e.memoizedState=sp,ho(t.child,i)):(Ri(e),n=t.child,t=n.sibling,n=ai(n,{mode:"visible",children:i.children}),n.return=e,n.sibling=null,t!==null&&(s=e.deletions,s===null?(e.deletions=[t],e.flags|=16):s.push(t)),e.child=n,e.memoizedState=null,n)}function tf(t,e){return e=zc({mode:"visible",children:e},t.mode),e.return=t,t.child=e}function zc(t,e){return t=$e(22,t,null,e),t.lanes=0,t}function cp(t,e,n){return Ra(e,t.child,null,n),t=tf(e,e.pendingProps.children),t.flags|=2,e.memoizedState=null,t}function Ym(t,e,n){t.lanes|=e;var i=t.alternate;i!==null&&(i.lanes|=e),$p(t.return,e,n)}function up(t,e,n,i,a,r){var s=t.memoizedState;s===null?t.memoizedState={isBackwards:e,rendering:null,renderingStartTime:0,last:i,tail:n,tailMode:a,treeForkCount:r}:(s.isBackwards=e,s.rendering=null,s.renderingStartTime=0,s.last=i,s.tail=n,s.tailMode=a,s.treeForkCount=r)}function s6(t,e,n){var i=e.pendingProps,a=i.revealOrder,r=i.tail;i=i.children;var s=Pt.current,o=(s&2)!==0;if(o?(s=s&1|2,e.flags|=128):s&=1,At(Pt,s),ee(t,e,i,n),i=ut?Io:0,!o&&t!==null&&(t.flags&128)!==0)t:for(t=e.child;t!==null;){if(t.tag===13)t.memoizedState!==null&&Ym(t,n,e);else if(t.tag===19)Ym(t,n,e);else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break t;for(;t.sibling===null;){if(t.return===null||t.return===e)break t;t=t.return}t.sibling.return=t.return,t=t.sibling}switch(a){case"forwards":for(n=e.child,a=null;n!==null;)t=n.alternate,t!==null&&Dc(t)===null&&(a=n),n=n.sibling;n=a,n===null?(a=e.child,e.child=null):(a=n.sibling,n.sibling=null),up(e,!1,a,n,r,i);break;case"backwards":case"unstable_legacy-backwards":for(n=null,a=e.child,e.child=null;a!==null;){if(t=a.alternate,t!==null&&Dc(t)===null){e.child=a;break}t=a.sibling,a.sibling=n,n=a,a=t}up(e,!0,n,null,r,i);break;case"together":up(e,!1,null,null,void 0,i);break;default:e.memoizedState=null}return e.child}function ui(t,e,n){if(t!==null&&(e.dependencies=t.dependencies),Qi|=e.lanes,(n&e.childLanes)===0)if(t!==null){if(os(t,e,n,!1),(n&e.childLanes)===0)return null}else return null;if(t!==null&&e.child!==t.child)throw Error(_(153));if(e.child!==null){for(t=e.child,n=ai(t,t.pendingProps),e.child=n,n.return=e;t.sibling!==null;)t=t.sibling,n=n.sibling=ai(t,t.pendingProps),n.return=e;n.sibling=null}return e.child}function t1(t,e){return(t.lanes&e)!==0?!0:(t=t.dependencies,!!(t!==null&&_c(t)))}function vv(t,e,n){switch(e.tag){case 3:Ec(e,e.stateNode.containerInfo),Bi(e,Yt,t.memoizedState.cache),_a();break;case 27:case 5:Mp(e);break;case 4:Ec(e,e.stateNode.containerInfo);break;case 10:Bi(e,e.type,e.memoizedProps.value);break;case 31:if(e.memoizedState!==null)return e.flags|=128,qp(e),null;break;case 13:var i=e.memoizedState;if(i!==null)return i.dehydrated!==null?(Ri(e),e.flags|=128,null):(n&e.child.childLanes)!==0?r6(t,e,n):(Ri(e),t=ui(t,e,n),t!==null?t.sibling:null);Ri(e);break;case 19:var a=(t.flags&128)!==0;if(i=(n&e.childLanes)!==0,i||(os(t,e,n,!1),i=(n&e.childLanes)!==0),a){if(i)return s6(t,e,n);e.flags|=128}if(a=e.memoizedState,a!==null&&(a.rendering=null,a.tail=null,a.lastEffect=null),At(Pt,Pt.current),i)break;return null;case 22:return e.lanes=0,a6(t,e,n,e.pendingProps);case 24:Bi(e,Yt,t.memoizedState.cache)}return ui(t,e,n)}function o6(t,e,n){if(t!==null)if(t.memoizedProps!==e.pendingProps)Vt=!0;else{if(!t1(t,n)&&(e.flags&128)===0)return Vt=!1,vv(t,e,n);Vt=(t.flags&131072)!==0}else Vt=!1,ut&&(e.flags&1048576)!==0&&u2(e,Io,e.index);switch(e.lanes=0,e.tag){case 16:t:{var i=e.pendingProps;if(t=Ea(e.elementType),e.type=t,typeof t=="function")Df(t)?(i=Ia(t,i),e.tag=1,e=Um(null,e,t,i,n)):(e.tag=0,e=Wp(null,e,t,i,n));else{if(t!=null){var a=t.$$typeof;if(a===xf){e.tag=11,e=Lm(null,e,t,i,n);break t}else if(a===vf){e.tag=14,e=Nm(null,e,t,i,n);break t}}throw e=Ap(t)||t,Error(_(306,e,""))}}return e;case 0:return Wp(t,e,e.type,e.pendingProps,n);case 1:return i=e.type,a=Ia(i,e.pendingProps),Um(t,e,i,a,n);case 3:t:{if(Ec(e,e.stateNode.containerInfo),t===null)throw Error(_(387));i=e.pendingProps;var r=e.memoizedState;a=r.element,Yp(t,e),Eo(e,i,null,n);var s=e.memoizedState;if(i=s.cache,Bi(e,Yt,i),i!==r.cache&&Up(e,[Yt],n,!0),ko(),i=s.element,r.isDehydrated)if(r={element:i,isDehydrated:!1,cache:s.cache},e.updateQueue.baseState=r,e.memoizedState=r,e.flags&256){e=Hm(t,e,i,n);break t}else if(i!==a){a=rn(Error(_(424)),e),Fo(a),e=Hm(t,e,i,n);break t}else for(t=e.stateNode.containerInfo,t.nodeType===9?t=t.body:t=t.nodeName==="HTML"?t.ownerDocument.body:t,Bt=ln(t.firstChild),ie=e,ut=!0,ji=null,sn=!0,n=m2(e,null,i,n),e.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling;else{if(_a(),i===a){e=ui(t,e,n);break t}ee(t,e,i,n)}e=e.child}return e;case 26:return gc(t,e),t===null?(n=py(e.type,null,e.pendingProps,null))?e.memoizedState=n:ut||(n=e.type,t=e.pendingProps,i=Yc(Pi.current).createElement(n),i[ne]=e,i[_e]=t,re(i,n,t),Jt(i),e.stateNode=i):e.memoizedState=py(e.type,t.memoizedProps,e.pendingProps,t.memoizedState),null;case 27:return Mp(e),t===null&&ut&&(i=e.stateNode=Q6(e.type,e.pendingProps,Pi.current),ie=e,sn=!0,a=Bt,Wi(e.type)?(gf=a,Bt=ln(i.firstChild)):Bt=a),ee(t,e,e.pendingProps.children,n),gc(t,e),t===null&&(e.flags|=4194304),e.child;case 5:return t===null&&ut&&((a=i=Bt)&&(i=qv(i,e.type,e.pendingProps,sn),i!==null?(e.stateNode=i,ie=e,Bt=ln(i.firstChild),sn=!1,a=!0):a=!1),a||Ki(e)),Mp(e),a=e.type,r=e.pendingProps,s=t!==null?t.memoizedProps:null,i=r.children,df(a,r)?i=null:s!==null&&df(a,s)&&(e.flags|=32),e.memoizedState!==null&&(a=$f(t,e,uv,null,null,n),jo._currentValue=a),gc(t,e),ee(t,e,i,n),e.child;case 6:return t===null&&ut&&((t=n=Bt)&&(n=Xv(n,e.pendingProps,sn),n!==null?(e.stateNode=n,ie=e,Bt=null,t=!0):t=!1),t||Ki(e)),null;case 13:return r6(t,e,n);case 4:return Ec(e,e.stateNode.containerInfo),i=e.pendingProps,t===null?e.child=Ra(e,null,i,n):ee(t,e,i,n),e.child;case 11:return Lm(t,e,e.type,e.pendingProps,n);case 7:return ee(t,e,e.pendingProps,n),e.child;case 8:return ee(t,e,e.pendingProps.children,n),e.child;case 12:return ee(t,e,e.pendingProps.children,n),e.child;case 10:return i=e.pendingProps,Bi(e,e.type,i.value),ee(t,e,i.children,n),e.child;case 9:return a=e.type._context,i=e.pendingProps.children,Ba(e),a=ae(a),i=i(a),e.flags|=1,ee(t,e,i,n),e.child;case 14:return Nm(t,e,e.type,e.pendingProps,n);case 15:return i6(t,e,e.type,e.pendingProps,n);case 19:return s6(t,e,n);case 31:return xv(t,e,n);case 22:return a6(t,e,n,e.pendingProps);case 24:return Ba(e),i=ae(Yt),t===null?(a=zf(),a===null&&(a=Ct,r=Of(),a.pooledCache=r,r.refCount++,r!==null&&(a.pooledCacheLanes|=n),a=r),e.memoizedState={parent:i,cache:a},Nf(e),Bi(e,Yt,a)):((t.lanes&n)!==0&&(Yp(t,e),Eo(e,null,null,n),ko()),a=t.memoizedState,r=e.memoizedState,a.parent!==i?(a={parent:i,cache:i},e.memoizedState=a,e.lanes===0&&(e.memoizedState=e.updateQueue.baseState=a),Bi(e,Yt,i)):(i=r.cache,Bi(e,Yt,i),i!==a.cache&&Up(e,[Yt],n,!0))),ee(t,e,e.pendingProps.children,n),e.child;case 29:throw e.pendingProps}throw Error(_(156,e.tag))}function Kn(t){t.flags|=4}function dp(t,e,n,i,a){if((e=(t.mode&32)!==0)&&(e=!1),e){if(t.flags|=16777216,(a&335544128)===a)if(t.stateNode.complete)t.flags|=8192;else if(R6())t.flags|=8192;else throw Ta=Bc,Lf}else t.flags&=-16777217}function Vm(t,e){if(e.type!=="stylesheet"||(e.state.loading&4)!==0)t.flags&=-16777217;else if(t.flags|=16777216,!t5(e))if(R6())t.flags|=8192;else throw Ta=Bc,Lf}function Wl(t,e){e!==null&&(t.flags|=4),t.flags&16384&&(e=t.tag!==22?Dy():536870912,t.lanes|=e,ts|=e)}function so(t,e){if(!ut)switch(t.tailMode){case"hidden":e=t.tail;for(var n=null;e!==null;)e.alternate!==null&&(n=e),e=e.sibling;n===null?t.tail=null:n.sibling=null;break;case"collapsed":n=t.tail;for(var i=null;n!==null;)n.alternate!==null&&(i=n),n=n.sibling;i===null?e||t.tail===null?t.tail=null:t.tail.sibling=null:i.sibling=null}}function _t(t){var e=t.alternate!==null&&t.alternate.child===t.child,n=0,i=0;if(e)for(var a=t.child;a!==null;)n|=a.lanes|a.childLanes,i|=a.subtreeFlags&65011712,i|=a.flags&65011712,a.return=t,a=a.sibling;else for(a=t.child;a!==null;)n|=a.lanes|a.childLanes,i|=a.subtreeFlags,i|=a.flags,a.return=t,a=a.sibling;return t.subtreeFlags|=i,t.childLanes=n,e}function bv(t,e,n){var i=e.pendingProps;switch(Ff(e),e.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return _t(e),null;case 1:return _t(e),null;case 3:return n=e.stateNode,i=null,t!==null&&(i=t.memoizedState.cache),e.memoizedState.cache!==i&&(e.flags|=2048),ri(Yt),Xr(),n.pendingContext&&(n.context=n.pendingContext,n.pendingContext=null),(t===null||t.child===null)&&(Sr(e)?Kn(e):t===null||t.memoizedState.isDehydrated&&(e.flags&256)===0||(e.flags|=1024,np())),_t(e),null;case 26:var a=e.type,r=e.memoizedState;return t===null?(Kn(e),r!==null?(_t(e),Vm(e,r)):(_t(e),dp(e,a,null,i,n))):r?r!==t.memoizedState?(Kn(e),_t(e),Vm(e,r)):(_t(e),e.flags&=-16777217):(t=t.memoizedProps,t!==i&&Kn(e),_t(e),dp(e,a,t,i,n)),null;case 27:if(wc(e),n=Pi.current,a=e.type,t!==null&&e.stateNode!=null)t.memoizedProps!==i&&Kn(e);else{if(!i){if(e.stateNode===null)throw Error(_(166));return _t(e),null}t=Dn.current,Sr(e)?bm(e,t):(t=Q6(a,i,n),e.stateNode=t,Kn(e))}return _t(e),null;case 5:if(wc(e),a=e.type,t!==null&&e.stateNode!=null)t.memoizedProps!==i&&Kn(e);else{if(!i){if(e.stateNode===null)throw Error(_(166));return _t(e),null}if(r=Dn.current,Sr(e))bm(e,r);else{var s=Yc(Pi.current);switch(r){case 1:r=s.createElementNS("http://www.w3.org/2000/svg",a);break;case 2:r=s.createElementNS("http://www.w3.org/1998/Math/MathML",a);break;default:switch(a){case"svg":r=s.createElementNS("http://www.w3.org/2000/svg",a);break;case"math":r=s.createElementNS("http://www.w3.org/1998/Math/MathML",a);break;case"script":r=s.createElement("div"),r.innerHTML="<script><\/script>",r=r.removeChild(r.firstChild);break;case"select":r=typeof i.is=="string"?s.createElement("select",{is:i.is}):s.createElement("select"),i.multiple?r.multiple=!0:i.size&&(r.size=i.size);break;default:r=typeof i.is=="string"?s.createElement(a,{is:i.is}):s.createElement(a)}}r[ne]=e,r[_e]=i;t:for(s=e.child;s!==null;){if(s.tag===5||s.tag===6)r.appendChild(s.stateNode);else if(s.tag!==4&&s.tag!==27&&s.child!==null){s.child.return=s,s=s.child;continue}if(s===e)break t;for(;s.sibling===null;){if(s.return===null||s.return===e)break t;s=s.return}s.sibling.return=s.return,s=s.sibling}e.stateNode=r;t:switch(re(r,a,i),a){case"button":case"input":case"select":case"textarea":i=!!i.autoFocus;break t;case"img":i=!0;break t;default:i=!1}i&&Kn(e)}}return _t(e),dp(e,e.type,t===null?null:t.memoizedProps,e.pendingProps,n),null;case 6:if(t&&e.stateNode!=null)t.memoizedProps!==i&&Kn(e);else{if(typeof i!="string"&&e.stateNode===null)throw Error(_(166));if(t=Pi.current,Sr(e)){if(t=e.stateNode,n=e.memoizedProps,i=null,a=ie,a!==null)switch(a.tag){case 27:case 5:i=a.memoizedProps}t[ne]=e,t=!!(t.nodeValue===n||i!==null&&i.suppressHydrationWarning===!0||q6(t.nodeValue,n)),t||Ki(e,!0)}else t=Yc(t).createTextNode(i),t[ne]=e,e.stateNode=t}return _t(e),null;case 31:if(n=e.memoizedState,t===null||t.memoizedState!==null){if(i=Sr(e),n!==null){if(t===null){if(!i)throw Error(_(318));if(t=e.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(_(557));t[ne]=e}else _a(),(e.flags&128)===0&&(e.memoizedState=null),e.flags|=4;_t(e),t=!1}else n=np(),t!==null&&t.memoizedState!==null&&(t.memoizedState.hydrationErrors=n),t=!0;if(!t)return e.flags&256?(je(e),e):(je(e),null);if((e.flags&128)!==0)throw Error(_(558))}return _t(e),null;case 13:if(i=e.memoizedState,t===null||t.memoizedState!==null&&t.memoizedState.dehydrated!==null){if(a=Sr(e),i!==null&&i.dehydrated!==null){if(t===null){if(!a)throw Error(_(318));if(a=e.memoizedState,a=a!==null?a.dehydrated:null,!a)throw Error(_(317));a[ne]=e}else _a(),(e.flags&128)===0&&(e.memoizedState=null),e.flags|=4;_t(e),a=!1}else a=np(),t!==null&&t.memoizedState!==null&&(t.memoizedState.hydrationErrors=a),a=!0;if(!a)return e.flags&256?(je(e),e):(je(e),null)}return je(e),(e.flags&128)!==0?(e.lanes=n,e):(n=i!==null,t=t!==null&&t.memoizedState!==null,n&&(i=e.child,a=null,i.alternate!==null&&i.alternate.memoizedState!==null&&i.alternate.memoizedState.cachePool!==null&&(a=i.alternate.memoizedState.cachePool.pool),r=null,i.memoizedState!==null&&i.memoizedState.cachePool!==null&&(r=i.memoizedState.cachePool.pool),r!==a&&(i.flags|=2048)),n!==t&&n&&(e.child.flags|=8192),Wl(e,e.updateQueue),_t(e),null);case 4:return Xr(),t===null&&o1(e.stateNode.containerInfo),_t(e),null;case 10:return ri(e.type),_t(e),null;case 19:if(Wt(Pt),i=e.memoizedState,i===null)return _t(e),null;if(a=(e.flags&128)!==0,r=i.rendering,r===null)if(a)so(i,!1);else{if(Lt!==0||t!==null&&(t.flags&128)!==0)for(t=e.child;t!==null;){if(r=Dc(t),r!==null){for(e.flags|=128,so(i,!1),t=r.updateQueue,e.updateQueue=t,Wl(e,t),e.subtreeFlags=0,t=n,n=e.child;n!==null;)l2(n,t),n=n.sibling;return At(Pt,Pt.current&1|2),ut&&Wn(e,i.treeForkCount),e.child}t=t.sibling}i.tail!==null&&He()>Nc&&(e.flags|=128,a=!0,so(i,!1),e.lanes=4194304)}else{if(!a)if(t=Dc(r),t!==null){if(e.flags|=128,a=!0,t=t.updateQueue,e.updateQueue=t,Wl(e,t),so(i,!0),i.tail===null&&i.tailMode==="hidden"&&!r.alternate&&!ut)return _t(e),null}else 2*He()-i.renderingStartTime>Nc&&n!==536870912&&(e.flags|=128,a=!0,so(i,!1),e.lanes=4194304);i.isBackwards?(r.sibling=e.child,e.child=r):(t=i.last,t!==null?t.sibling=r:e.child=r,i.last=r)}return i.tail!==null?(t=i.tail,i.rendering=t,i.tail=t.sibling,i.renderingStartTime=He(),t.sibling=null,n=Pt.current,At(Pt,a?n&1|2:n&1),ut&&Wn(e,i.treeForkCount),t):(_t(e),null);case 22:case 23:return je(e),Pf(),i=e.memoizedState!==null,t!==null?t.memoizedState!==null!==i&&(e.flags|=8192):i&&(e.flags|=8192),i?(n&536870912)!==0&&(e.flags&128)===0&&(_t(e),e.subtreeFlags&6&&(e.flags|=8192)):_t(e),n=e.updateQueue,n!==null&&Wl(e,n.retryQueue),n=null,t!==null&&t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(n=t.memoizedState.cachePool.pool),i=null,e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(i=e.memoizedState.cachePool.pool),i!==n&&(e.flags|=2048),t!==null&&Wt(Aa),null;case 24:return n=null,t!==null&&(n=t.memoizedState.cache),e.memoizedState.cache!==n&&(e.flags|=2048),ri(Yt),_t(e),null;case 25:return null;case 30:return null}throw Error(_(156,e.tag))}function kv(t,e){switch(Ff(e),e.tag){case 1:return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 3:return ri(Yt),Xr(),t=e.flags,(t&65536)!==0&&(t&128)===0?(e.flags=t&-65537|128,e):null;case 26:case 27:case 5:return wc(e),null;case 31:if(e.memoizedState!==null){if(je(e),e.alternate===null)throw Error(_(340));_a()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 13:if(je(e),t=e.memoizedState,t!==null&&t.dehydrated!==null){if(e.alternate===null)throw Error(_(340));_a()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 19:return Wt(Pt),null;case 4:return Xr(),null;case 10:return ri(e.type),null;case 22:case 23:return je(e),Pf(),t!==null&&Wt(Aa),t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 24:return ri(Yt),null;case 25:return null;default:return null}}function l6(t,e){switch(Ff(e),e.tag){case 3:ri(Yt),Xr();break;case 26:case 27:case 5:wc(e);break;case 4:Xr();break;case 31:e.memoizedState!==null&&je(e);break;case 13:je(e);break;case 19:Wt(Pt);break;case 10:ri(e.type);break;case 22:case 23:je(e),Pf(),t!==null&&Wt(Aa);break;case 24:ri(Yt)}}function Qo(t,e){try{var n=e.updateQueue,i=n!==null?n.lastEffect:null;if(i!==null){var a=i.next;n=a;do{if((n.tag&t)===t){i=void 0;var r=n.create,s=n.inst;i=r(),s.destroy=i}n=n.next}while(n!==a)}}catch(o){vt(e,e.return,o)}}function Zi(t,e,n){try{var i=e.updateQueue,a=i!==null?i.lastEffect:null;if(a!==null){var r=a.next;i=r;do{if((i.tag&t)===t){var s=i.inst,o=s.destroy;if(o!==void 0){s.destroy=void 0,a=e;var l=n,c=o;try{c()}catch(u){vt(a,l,u)}}}i=i.next}while(i!==r)}}catch(u){vt(e,e.return,u)}}function c6(t){var e=t.updateQueue;if(e!==null){var n=t.stateNode;try{x2(e,n)}catch(i){vt(t,t.return,i)}}}function u6(t,e,n){n.props=Ia(t.type,t.memoizedProps),n.state=t.memoizedState;try{n.componentWillUnmount()}catch(i){vt(t,e,i)}}function Co(t,e){try{var n=t.ref;if(n!==null){switch(t.tag){case 26:case 27:case 5:var i=t.stateNode;break;case 30:i=t.stateNode;break;default:i=t.stateNode}typeof n=="function"?t.refCleanup=n(i):n.current=i}}catch(a){vt(t,e,a)}}function Rn(t,e){var n=t.ref,i=t.refCleanup;if(n!==null)if(typeof i=="function")try{i()}catch(a){vt(t,e,a)}finally{t.refCleanup=null,t=t.alternate,t!=null&&(t.refCleanup=null)}else if(typeof n=="function")try{n(null)}catch(a){vt(t,e,a)}else n.current=null}function d6(t){var e=t.type,n=t.memoizedProps,i=t.stateNode;try{t:switch(e){case"button":case"input":case"select":case"textarea":n.autoFocus&&i.focus();break t;case"img":n.src?i.src=n.src:n.srcSet&&(i.srcset=n.srcSet)}}catch(a){vt(t,t.return,a)}}function pp(t,e,n){try{var i=t.stateNode;$v(i,t.type,n,e),i[_e]=e}catch(a){vt(t,t.return,a)}}function p6(t){return t.tag===5||t.tag===3||t.tag===26||t.tag===27&&Wi(t.type)||t.tag===4}function fp(t){t:for(;;){for(;t.sibling===null;){if(t.return===null||p6(t.return))return null;t=t.return}for(t.sibling.return=t.return,t=t.sibling;t.tag!==5&&t.tag!==6&&t.tag!==18;){if(t.tag===27&&Wi(t.type)||t.flags&2||t.child===null||t.tag===4)continue t;t.child.return=t,t=t.child}if(!(t.flags&2))return t.stateNode}}function ef(t,e,n){var i=t.tag;if(i===5||i===6)t=t.stateNode,e?(n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n).insertBefore(t,e):(e=n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n,e.appendChild(t),n=n._reactRootContainer,n!=null||e.onclick!==null||(e.onclick=ni));else if(i!==4&&(i===27&&Wi(t.type)&&(n=t.stateNode,e=null),t=t.child,t!==null))for(ef(t,e,n),t=t.sibling;t!==null;)ef(t,e,n),t=t.sibling}function Lc(t,e,n){var i=t.tag;if(i===5||i===6)t=t.stateNode,e?n.insertBefore(t,e):n.appendChild(t);else if(i!==4&&(i===27&&Wi(t.type)&&(n=t.stateNode),t=t.child,t!==null))for(Lc(t,e,n),t=t.sibling;t!==null;)Lc(t,e,n),t=t.sibling}function f6(t){var e=t.stateNode,n=t.memoizedProps;try{for(var i=t.type,a=e.attributes;a.length;)e.removeAttributeNode(a[0]);re(e,i,n),e[ne]=t,e[_e]=n}catch(r){vt(t,t.return,r)}}var ti=!1,Ht=!1,hp=!1,Gm=typeof WeakSet=="function"?WeakSet:Set,Qt=null;function Ev(t,e){if(t=t.containerInfo,cf=Xc,t=t2(t),_f(t)){if("selectionStart"in t)var n={start:t.selectionStart,end:t.selectionEnd};else t:{n=(n=t.ownerDocument)&&n.defaultView||window;var i=n.getSelection&&n.getSelection();if(i&&i.rangeCount!==0){n=i.anchorNode;var a=i.anchorOffset,r=i.focusNode;i=i.focusOffset;try{n.nodeType,r.nodeType}catch{n=null;break t}var s=0,o=-1,l=-1,c=0,u=0,d=t,p=null;e:for(;;){for(var f;d!==n||a!==0&&d.nodeType!==3||(o=s+a),d!==r||i!==0&&d.nodeType!==3||(l=s+i),d.nodeType===3&&(s+=d.nodeValue.length),(f=d.firstChild)!==null;)p=d,d=f;for(;;){if(d===t)break e;if(p===n&&++c===a&&(o=s),p===r&&++u===i&&(l=s),(f=d.nextSibling)!==null)break;d=p,p=d.parentNode}d=f}n=o===-1||l===-1?null:{start:o,end:l}}else n=null}n=n||{start:0,end:0}}else n=null;for(uf={focusedElem:t,selectionRange:n},Xc=!1,Qt=e;Qt!==null;)if(e=Qt,t=e.child,(e.subtreeFlags&1028)!==0&&t!==null)t.return=e,Qt=t;else for(;Qt!==null;){switch(e=Qt,r=e.alternate,t=e.flags,e.tag){case 0:if((t&4)!==0&&(t=e.updateQueue,t=t!==null?t.events:null,t!==null))for(n=0;n<t.length;n++)a=t[n],a.ref.impl=a.nextImpl;break;case 11:case 15:break;case 1:if((t&1024)!==0&&r!==null){t=void 0,n=e,a=r.memoizedProps,r=r.memoizedState,i=n.stateNode;try{var y=Ia(n.type,a);t=i.getSnapshotBeforeUpdate(y,r),i.__reactInternalSnapshotBeforeUpdate=t}catch(x){vt(n,n.return,x)}}break;case 3:if((t&1024)!==0){if(t=e.stateNode.containerInfo,n=t.nodeType,n===9)pf(t);else if(n===1)switch(t.nodeName){case"HEAD":case"HTML":case"BODY":pf(t);break;default:t.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if((t&1024)!==0)throw Error(_(163))}if(t=e.sibling,t!==null){t.return=e.return,Qt=t;break}Qt=e.return}}function h6(t,e,n){var i=n.flags;switch(n.tag){case 0:case 11:case 15:Qn(t,n),i&4&&Qo(5,n);break;case 1:if(Qn(t,n),i&4)if(t=n.stateNode,e===null)try{t.componentDidMount()}catch(s){vt(n,n.return,s)}else{var a=Ia(n.type,e.memoizedProps);e=e.memoizedState;try{t.componentDidUpdate(a,e,t.__reactInternalSnapshotBeforeUpdate)}catch(s){vt(n,n.return,s)}}i&64&&c6(n),i&512&&Co(n,n.return);break;case 3:if(Qn(t,n),i&64&&(t=n.updateQueue,t!==null)){if(e=null,n.child!==null)switch(n.child.tag){case 27:case 5:e=n.child.stateNode;break;case 1:e=n.child.stateNode}try{x2(t,e)}catch(s){vt(n,n.return,s)}}break;case 27:e===null&&i&4&&f6(n);case 26:case 5:Qn(t,n),e===null&&i&4&&d6(n),i&512&&Co(n,n.return);break;case 12:Qn(t,n);break;case 31:Qn(t,n),i&4&&y6(t,n);break;case 13:Qn(t,n),i&4&&x6(t,n),i&64&&(t=n.memoizedState,t!==null&&(t=t.dehydrated,t!==null&&(n=Rv.bind(null,n),Kv(t,n))));break;case 22:if(i=n.memoizedState!==null||ti,!i){e=e!==null&&e.memoizedState!==null||Ht,a=ti;var r=Ht;ti=i,(Ht=e)&&!r?Jn(t,n,(n.subtreeFlags&8772)!==0):Qn(t,n),ti=a,Ht=r}break;case 30:break;default:Qn(t,n)}}function g6(t){var e=t.alternate;e!==null&&(t.alternate=null,g6(e)),t.child=null,t.deletions=null,t.sibling=null,t.tag===5&&(e=t.stateNode,e!==null&&wf(e)),t.stateNode=null,t.return=null,t.dependencies=null,t.memoizedProps=null,t.memoizedState=null,t.pendingProps=null,t.stateNode=null,t.updateQueue=null}var Ot=null,Ae=!1;function Zn(t,e,n){for(n=n.child;n!==null;)m6(t,e,n),n=n.sibling}function m6(t,e,n){if(Ye&&typeof Ye.onCommitFiberUnmount=="function")try{Ye.onCommitFiberUnmount(Yo,n)}catch{}switch(n.tag){case 26:Ht||Rn(n,e),Zn(t,e,n),n.memoizedState?n.memoizedState.count--:n.stateNode&&(n=n.stateNode,n.parentNode.removeChild(n));break;case 27:Ht||Rn(n,e);var i=Ot,a=Ae;Wi(n.type)&&(Ot=n.stateNode,Ae=!1),Zn(t,e,n),Mo(n.stateNode),Ot=i,Ae=a;break;case 5:Ht||Rn(n,e);case 6:if(i=Ot,a=Ae,Ot=null,Zn(t,e,n),Ot=i,Ae=a,Ot!==null)if(Ae)try{(Ot.nodeType===9?Ot.body:Ot.nodeName==="HTML"?Ot.ownerDocument.body:Ot).removeChild(n.stateNode)}catch(r){vt(n,e,r)}else try{Ot.removeChild(n.stateNode)}catch(r){vt(n,e,r)}break;case 18:Ot!==null&&(Ae?(t=Ot,oy(t.nodeType===9?t.body:t.nodeName==="HTML"?t.ownerDocument.body:t,n.stateNode),as(t)):oy(Ot,n.stateNode));break;case 4:i=Ot,a=Ae,Ot=n.stateNode.containerInfo,Ae=!0,Zn(t,e,n),Ot=i,Ae=a;break;case 0:case 11:case 14:case 15:Zi(2,n,e),Ht||Zi(4,n,e),Zn(t,e,n);break;case 1:Ht||(Rn(n,e),i=n.stateNode,typeof i.componentWillUnmount=="function"&&u6(n,e,i)),Zn(t,e,n);break;case 21:Zn(t,e,n);break;case 22:Ht=(i=Ht)||n.memoizedState!==null,Zn(t,e,n),Ht=i;break;default:Zn(t,e,n)}}function y6(t,e){if(e.memoizedState===null&&(t=e.alternate,t!==null&&(t=t.memoizedState,t!==null))){t=t.dehydrated;try{as(t)}catch(n){vt(e,e.return,n)}}}function x6(t,e){if(e.memoizedState===null&&(t=e.alternate,t!==null&&(t=t.memoizedState,t!==null&&(t=t.dehydrated,t!==null))))try{as(t)}catch(n){vt(e,e.return,n)}}function wv(t){switch(t.tag){case 31:case 13:case 19:var e=t.stateNode;return e===null&&(e=t.stateNode=new Gm),e;case 22:return t=t.stateNode,e=t._retryCache,e===null&&(e=t._retryCache=new Gm),e;default:throw Error(_(435,t.tag))}}function tc(t,e){var n=wv(t);e.forEach(function(i){if(!n.has(i)){n.add(i);var a=Dv.bind(null,t,i);i.then(a,a)}})}function Ce(t,e){var n=e.deletions;if(n!==null)for(var i=0;i<n.length;i++){var a=n[i],r=t,s=e,o=s;t:for(;o!==null;){switch(o.tag){case 27:if(Wi(o.type)){Ot=o.stateNode,Ae=!1;break t}break;case 5:Ot=o.stateNode,Ae=!1;break t;case 3:case 4:Ot=o.stateNode.containerInfo,Ae=!0;break t}o=o.return}if(Ot===null)throw Error(_(160));m6(r,s,a),Ot=null,Ae=!1,r=a.alternate,r!==null&&(r.return=null),a.return=null}if(e.subtreeFlags&13886)for(e=e.child;e!==null;)v6(e,t),e=e.sibling}var vn=null;function v6(t,e){var n=t.alternate,i=t.flags;switch(t.tag){case 0:case 11:case 14:case 15:Ce(e,t),Se(t),i&4&&(Zi(3,t,t.return),Qo(3,t),Zi(5,t,t.return));break;case 1:Ce(e,t),Se(t),i&512&&(Ht||n===null||Rn(n,n.return)),i&64&&ti&&(t=t.updateQueue,t!==null&&(i=t.callbacks,i!==null&&(n=t.shared.hiddenCallbacks,t.shared.hiddenCallbacks=n===null?i:n.concat(i))));break;case 26:var a=vn;if(Ce(e,t),Se(t),i&512&&(Ht||n===null||Rn(n,n.return)),i&4){var r=n!==null?n.memoizedState:null;if(i=t.memoizedState,n===null)if(i===null)if(t.stateNode===null){t:{i=t.type,n=t.memoizedProps,a=a.ownerDocument||a;e:switch(i){case"title":r=a.getElementsByTagName("title")[0],(!r||r[qo]||r[ne]||r.namespaceURI==="http://www.w3.org/2000/svg"||r.hasAttribute("itemprop"))&&(r=a.createElement(i),a.head.insertBefore(r,a.querySelector("head > title"))),re(r,i,n),r[ne]=t,Jt(r),i=r;break t;case"link":var s=hy("link","href",a).get(i+(n.href||""));if(s){for(var o=0;o<s.length;o++)if(r=s[o],r.getAttribute("href")===(n.href==null||n.href===""?null:n.href)&&r.getAttribute("rel")===(n.rel==null?null:n.rel)&&r.getAttribute("title")===(n.title==null?null:n.title)&&r.getAttribute("crossorigin")===(n.crossOrigin==null?null:n.crossOrigin)){s.splice(o,1);break e}}r=a.createElement(i),re(r,i,n),a.head.appendChild(r);break;case"meta":if(s=hy("meta","content",a).get(i+(n.content||""))){for(o=0;o<s.length;o++)if(r=s[o],r.getAttribute("content")===(n.content==null?null:""+n.content)&&r.getAttribute("name")===(n.name==null?null:n.name)&&r.getAttribute("property")===(n.property==null?null:n.property)&&r.getAttribute("http-equiv")===(n.httpEquiv==null?null:n.httpEquiv)&&r.getAttribute("charset")===(n.charSet==null?null:n.charSet)){s.splice(o,1);break e}}r=a.createElement(i),re(r,i,n),a.head.appendChild(r);break;default:throw Error(_(468,i))}r[ne]=t,Jt(r),i=r}t.stateNode=i}else gy(a,t.type,t.stateNode);else t.stateNode=fy(a,i,t.memoizedProps);else r!==i?(r===null?n.stateNode!==null&&(n=n.stateNode,n.parentNode.removeChild(n)):r.count--,i===null?gy(a,t.type,t.stateNode):fy(a,i,t.memoizedProps)):i===null&&t.stateNode!==null&&pp(t,t.memoizedProps,n.memoizedProps)}break;case 27:Ce(e,t),Se(t),i&512&&(Ht||n===null||Rn(n,n.return)),n!==null&&i&4&&pp(t,t.memoizedProps,n.memoizedProps);break;case 5:if(Ce(e,t),Se(t),i&512&&(Ht||n===null||Rn(n,n.return)),t.flags&32){a=t.stateNode;try{Zr(a,"")}catch(y){vt(t,t.return,y)}}i&4&&t.stateNode!=null&&(a=t.memoizedProps,pp(t,a,n!==null?n.memoizedProps:a)),i&1024&&(hp=!0);break;case 6:if(Ce(e,t),Se(t),i&4){if(t.stateNode===null)throw Error(_(162));i=t.memoizedProps,n=t.stateNode;try{n.nodeValue=i}catch(y){vt(t,t.return,y)}}break;case 3:if(xc=null,a=vn,vn=Vc(e.containerInfo),Ce(e,t),vn=a,Se(t),i&4&&n!==null&&n.memoizedState.isDehydrated)try{as(e.containerInfo)}catch(y){vt(t,t.return,y)}hp&&(hp=!1,b6(t));break;case 4:i=vn,vn=Vc(t.stateNode.containerInfo),Ce(e,t),Se(t),vn=i;break;case 12:Ce(e,t),Se(t);break;case 31:Ce(e,t),Se(t),i&4&&(i=t.updateQueue,i!==null&&(t.updateQueue=null,tc(t,i)));break;case 13:Ce(e,t),Se(t),t.child.flags&8192&&t.memoizedState!==null!=(n!==null&&n.memoizedState!==null)&&(ou=He()),i&4&&(i=t.updateQueue,i!==null&&(t.updateQueue=null,tc(t,i)));break;case 22:a=t.memoizedState!==null;var l=n!==null&&n.memoizedState!==null,c=ti,u=Ht;if(ti=c||a,Ht=u||l,Ce(e,t),Ht=u,ti=c,Se(t),i&8192)t:for(e=t.stateNode,e._visibility=a?e._visibility&-2:e._visibility|1,a&&(n===null||l||ti||Ht||wa(t)),n=null,e=t;;){if(e.tag===5||e.tag===26){if(n===null){l=n=e;try{if(r=l.stateNode,a)s=r.style,typeof s.setProperty=="function"?s.setProperty("display","none","important"):s.display="none";else{o=l.stateNode;var d=l.memoizedProps.style,p=d!=null&&d.hasOwnProperty("display")?d.display:null;o.style.display=p==null||typeof p=="boolean"?"":(""+p).trim()}}catch(y){vt(l,l.return,y)}}}else if(e.tag===6){if(n===null){l=e;try{l.stateNode.nodeValue=a?"":l.memoizedProps}catch(y){vt(l,l.return,y)}}}else if(e.tag===18){if(n===null){l=e;try{var f=l.stateNode;a?ly(f,!0):ly(l.stateNode,!1)}catch(y){vt(l,l.return,y)}}}else if((e.tag!==22&&e.tag!==23||e.memoizedState===null||e===t)&&e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break t;for(;e.sibling===null;){if(e.return===null||e.return===t)break t;n===e&&(n=null),e=e.return}n===e&&(n=null),e.sibling.return=e.return,e=e.sibling}i&4&&(i=t.updateQueue,i!==null&&(n=i.retryQueue,n!==null&&(i.retryQueue=null,tc(t,n))));break;case 19:Ce(e,t),Se(t),i&4&&(i=t.updateQueue,i!==null&&(t.updateQueue=null,tc(t,i)));break;case 30:break;case 21:break;default:Ce(e,t),Se(t)}}function Se(t){var e=t.flags;if(e&2){try{for(var n,i=t.return;i!==null;){if(p6(i)){n=i;break}i=i.return}if(n==null)throw Error(_(160));switch(n.tag){case 27:var a=n.stateNode,r=fp(t);Lc(t,r,a);break;case 5:var s=n.stateNode;n.flags&32&&(Zr(s,""),n.flags&=-33);var o=fp(t);Lc(t,o,s);break;case 3:case 4:var l=n.stateNode.containerInfo,c=fp(t);ef(t,c,l);break;default:throw Error(_(161))}}catch(u){vt(t,t.return,u)}t.flags&=-3}e&4096&&(t.flags&=-4097)}function b6(t){if(t.subtreeFlags&1024)for(t=t.child;t!==null;){var e=t;b6(e),e.tag===5&&e.flags&1024&&e.stateNode.reset(),t=t.sibling}}function Qn(t,e){if(e.subtreeFlags&8772)for(e=e.child;e!==null;)h6(t,e.alternate,e),e=e.sibling}function wa(t){for(t=t.child;t!==null;){var e=t;switch(e.tag){case 0:case 11:case 14:case 15:Zi(4,e,e.return),wa(e);break;case 1:Rn(e,e.return);var n=e.stateNode;typeof n.componentWillUnmount=="function"&&u6(e,e.return,n),wa(e);break;case 27:Mo(e.stateNode);case 26:case 5:Rn(e,e.return),wa(e);break;case 22:e.memoizedState===null&&wa(e);break;case 30:wa(e);break;default:wa(e)}t=t.sibling}}function Jn(t,e,n){for(n=n&&(e.subtreeFlags&8772)!==0,e=e.child;e!==null;){var i=e.alternate,a=t,r=e,s=r.flags;switch(r.tag){case 0:case 11:case 15:Jn(a,r,n),Qo(4,r);break;case 1:if(Jn(a,r,n),i=r,a=i.stateNode,typeof a.componentDidMount=="function")try{a.componentDidMount()}catch(c){vt(i,i.return,c)}if(i=r,a=i.updateQueue,a!==null){var o=i.stateNode;try{var l=a.shared.hiddenCallbacks;if(l!==null)for(a.shared.hiddenCallbacks=null,a=0;a<l.length;a++)y2(l[a],o)}catch(c){vt(i,i.return,c)}}n&&s&64&&c6(r),Co(r,r.return);break;case 27:f6(r);case 26:case 5:Jn(a,r,n),n&&i===null&&s&4&&d6(r),Co(r,r.return);break;case 12:Jn(a,r,n);break;case 31:Jn(a,r,n),n&&s&4&&y6(a,r);break;case 13:Jn(a,r,n),n&&s&4&&x6(a,r);break;case 22:r.memoizedState===null&&Jn(a,r,n),Co(r,r.return);break;case 30:break;default:Jn(a,r,n)}e=e.sibling}}function e1(t,e){var n=null;t!==null&&t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(n=t.memoizedState.cachePool.pool),t=null,e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(t=e.memoizedState.cachePool.pool),t!==n&&(t!=null&&t.refCount++,n!=null&&Ko(n))}function n1(t,e){t=null,e.alternate!==null&&(t=e.alternate.memoizedState.cache),e=e.memoizedState.cache,e!==t&&(e.refCount++,t!=null&&Ko(t))}function xn(t,e,n,i){if(e.subtreeFlags&10256)for(e=e.child;e!==null;)k6(t,e,n,i),e=e.sibling}function k6(t,e,n,i){var a=e.flags;switch(e.tag){case 0:case 11:case 15:xn(t,e,n,i),a&2048&&Qo(9,e);break;case 1:xn(t,e,n,i);break;case 3:xn(t,e,n,i),a&2048&&(t=null,e.alternate!==null&&(t=e.alternate.memoizedState.cache),e=e.memoizedState.cache,e!==t&&(e.refCount++,t!=null&&Ko(t)));break;case 12:if(a&2048){xn(t,e,n,i),t=e.stateNode;try{var r=e.memoizedProps,s=r.id,o=r.onPostCommit;typeof o=="function"&&o(s,e.alternate===null?"mount":"update",t.passiveEffectDuration,-0)}catch(l){vt(e,e.return,l)}}else xn(t,e,n,i);break;case 31:xn(t,e,n,i);break;case 13:xn(t,e,n,i);break;case 23:break;case 22:r=e.stateNode,s=e.alternate,e.memoizedState!==null?r._visibility&2?xn(t,e,n,i):So(t,e):r._visibility&2?xn(t,e,n,i):(r._visibility|=2,Tr(t,e,n,i,(e.subtreeFlags&10256)!==0||!1)),a&2048&&e1(s,e);break;case 24:xn(t,e,n,i),a&2048&&n1(e.alternate,e);break;default:xn(t,e,n,i)}}function Tr(t,e,n,i,a){for(a=a&&((e.subtreeFlags&10256)!==0||!1),e=e.child;e!==null;){var r=t,s=e,o=n,l=i,c=s.flags;switch(s.tag){case 0:case 11:case 15:Tr(r,s,o,l,a),Qo(8,s);break;case 23:break;case 22:var u=s.stateNode;s.memoizedState!==null?u._visibility&2?Tr(r,s,o,l,a):So(r,s):(u._visibility|=2,Tr(r,s,o,l,a)),a&&c&2048&&e1(s.alternate,s);break;case 24:Tr(r,s,o,l,a),a&&c&2048&&n1(s.alternate,s);break;default:Tr(r,s,o,l,a)}e=e.sibling}}function So(t,e){if(e.subtreeFlags&10256)for(e=e.child;e!==null;){var n=t,i=e,a=i.flags;switch(i.tag){case 22:So(n,i),a&2048&&e1(i.alternate,i);break;case 24:So(n,i),a&2048&&n1(i.alternate,i);break;default:So(n,i)}e=e.sibling}}var go=8192;function Ar(t,e,n){if(t.subtreeFlags&go)for(t=t.child;t!==null;)E6(t,e,n),t=t.sibling}function E6(t,e,n){switch(t.tag){case 26:Ar(t,e,n),t.flags&go&&t.memoizedState!==null&&ob(n,vn,t.memoizedState,t.memoizedProps);break;case 5:Ar(t,e,n);break;case 3:case 4:var i=vn;vn=Vc(t.stateNode.containerInfo),Ar(t,e,n),vn=i;break;case 22:t.memoizedState===null&&(i=t.alternate,i!==null&&i.memoizedState!==null?(i=go,go=16777216,Ar(t,e,n),go=i):Ar(t,e,n));break;default:Ar(t,e,n)}}function w6(t){var e=t.alternate;if(e!==null&&(t=e.child,t!==null)){e.child=null;do e=t.sibling,t.sibling=null,t=e;while(t!==null)}}function oo(t){var e=t.deletions;if((t.flags&16)!==0){if(e!==null)for(var n=0;n<e.length;n++){var i=e[n];Qt=i,S6(i,t)}w6(t)}if(t.subtreeFlags&10256)for(t=t.child;t!==null;)C6(t),t=t.sibling}function C6(t){switch(t.tag){case 0:case 11:case 15:oo(t),t.flags&2048&&Zi(9,t,t.return);break;case 3:oo(t);break;case 12:oo(t);break;case 22:var e=t.stateNode;t.memoizedState!==null&&e._visibility&2&&(t.return===null||t.return.tag!==13)?(e._visibility&=-3,mc(t)):oo(t);break;default:oo(t)}}function mc(t){var e=t.deletions;if((t.flags&16)!==0){if(e!==null)for(var n=0;n<e.length;n++){var i=e[n];Qt=i,S6(i,t)}w6(t)}for(t=t.child;t!==null;){switch(e=t,e.tag){case 0:case 11:case 15:Zi(8,e,e.return),mc(e);break;case 22:n=e.stateNode,n._visibility&2&&(n._visibility&=-3,mc(e));break;default:mc(e)}t=t.sibling}}function S6(t,e){for(;Qt!==null;){var n=Qt;switch(n.tag){case 0:case 11:case 15:Zi(8,n,e);break;case 23:case 22:if(n.memoizedState!==null&&n.memoizedState.cachePool!==null){var i=n.memoizedState.cachePool.pool;i!=null&&i.refCount++}break;case 24:Ko(n.memoizedState.cache)}if(i=n.child,i!==null)i.return=n,Qt=i;else t:for(n=t;Qt!==null;){i=Qt;var a=i.sibling,r=i.return;if(g6(i),i===n){Qt=null;break t}if(a!==null){a.return=r,Qt=a;break t}Qt=r}}}var Cv={getCacheForType:function(t){var e=ae(Yt),n=e.data.get(t);return n===void 0&&(n=t(),e.data.set(t,n)),n},cacheSignal:function(){return ae(Yt).controller.signal}},Sv=typeof WeakMap=="function"?WeakMap:Map,ft=0,Ct=null,at=null,ot=0,xt=0,Pe=null,zi=!1,cs=!1,i1=!1,di=0,Lt=0,Qi=0,Ma=0,a1=0,Ue=0,ts=0,Ao=null,Te=null,nf=!1,ou=0,A6=0,Nc=1/0,Pc=null,Hi=null,qt=0,Yi=null,es=null,si=0,af=0,rf=null,T6=null,To=0,sf=null;function Ge(){return(ft&2)!==0&&ot!==0?ot&-ot:V.T!==null?s1():zy()}function M6(){if(Ue===0)if((ot&536870912)===0||ut){var t=Yl;Yl<<=1,(Yl&3932160)===0&&(Yl=262144),Ue=t}else Ue=536870912;return t=Xe.current,t!==null&&(t.flags|=32),Ue}function Me(t,e,n){(t===Ct&&(xt===2||xt===9)||t.cancelPendingCommit!==null)&&(ns(t,0),Li(t,ot,Ue,!1)),Go(t,n),((ft&2)===0||t!==Ct)&&(t===Ct&&((ft&2)===0&&(Ma|=n),Lt===4&&Li(t,ot,Ue,!1)),Fn(t))}function _6(t,e,n){if((ft&6)!==0)throw Error(_(327));var i=!n&&(e&127)===0&&(e&t.expiredLanes)===0||Vo(t,e),a=i?Mv(t,e):gp(t,e,!0),r=i;do{if(a===0){cs&&!i&&Li(t,e,0,!1);break}else{if(n=t.current.alternate,r&&!Av(n)){a=gp(t,e,!1),r=!1;continue}if(a===2){if(r=e,t.errorRecoveryDisabledLanes&r)var s=0;else s=t.pendingLanes&-536870913,s=s!==0?s:s&536870912?536870912:0;if(s!==0){e=s;t:{var o=t;a=Ao;var l=o.current.memoizedState.isDehydrated;if(l&&(ns(o,s).flags|=256),s=gp(o,s,!1),s!==2){if(i1&&!l){o.errorRecoveryDisabledLanes|=r,Ma|=r,a=4;break t}r=Te,Te=a,r!==null&&(Te===null?Te=r:Te.push.apply(Te,r))}a=s}if(r=!1,a!==2)continue}}if(a===1){ns(t,0),Li(t,e,0,!0);break}t:{switch(i=t,r=a,r){case 0:case 1:throw Error(_(345));case 4:if((e&4194048)!==e)break;case 6:Li(i,e,Ue,!zi);break t;case 2:Te=null;break;case 3:case 5:break;default:throw Error(_(329))}if((e&62914560)===e&&(a=ou+300-He(),10<a)){if(Li(i,e,Ue,!zi),Zc(i,0,!0)!==0)break t;si=e,i.timeoutHandle=K6(qm.bind(null,i,n,Te,Pc,nf,e,Ue,Ma,ts,zi,r,"Throttled",-0,0),a);break t}qm(i,n,Te,Pc,nf,e,Ue,Ma,ts,zi,r,null,-0,0)}}break}while(!0);Fn(t)}function qm(t,e,n,i,a,r,s,o,l,c,u,d,p,f){if(t.timeoutHandle=-1,d=e.subtreeFlags,d&8192||(d&16785408)===16785408){d={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:ni},E6(e,r,d);var y=(r&62914560)===r?ou-He():(r&4194048)===r?A6-He():0;if(y=lb(d,y),y!==null){si=r,t.cancelPendingCommit=y(Km.bind(null,t,e,r,n,i,a,s,o,l,u,d,null,p,f)),Li(t,r,s,!c);return}}Km(t,e,r,n,i,a,s,o,l)}function Av(t){for(var e=t;;){var n=e.tag;if((n===0||n===11||n===15)&&e.flags&16384&&(n=e.updateQueue,n!==null&&(n=n.stores,n!==null)))for(var i=0;i<n.length;i++){var a=n[i],r=a.getSnapshot;a=a.value;try{if(!qe(r(),a))return!1}catch{return!1}}if(n=e.child,e.subtreeFlags&16384&&n!==null)n.return=e,e=n;else{if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return!0;e=e.return}e.sibling.return=e.return,e=e.sibling}}return!0}function Li(t,e,n,i){e&=~a1,e&=~Ma,t.suspendedLanes|=e,t.pingedLanes&=~e,i&&(t.warmLanes|=e),i=t.expirationTimes;for(var a=e;0<a;){var r=31-Ve(a),s=1<<r;i[r]=-1,a&=~s}n!==0&&Iy(t,n,e)}function lu(){return(ft&6)===0?(Jo(0,!1),!1):!0}function r1(){if(at!==null){if(xt===0)var t=at.return;else t=at,ii=Na=null,Yf(t),Vr=null,Oo=0,t=at;for(;t!==null;)l6(t.alternate,t),t=t.return;at=null}}function ns(t,e){var n=t.timeoutHandle;n!==-1&&(t.timeoutHandle=-1,Yv(n)),n=t.cancelPendingCommit,n!==null&&(t.cancelPendingCommit=null,n()),si=0,r1(),Ct=t,at=n=ai(t.current,null),ot=e,xt=0,Pe=null,zi=!1,cs=Vo(t,e),i1=!1,ts=Ue=a1=Ma=Qi=Lt=0,Te=Ao=null,nf=!1,(e&8)!==0&&(e|=e&32);var i=t.entangledLanes;if(i!==0)for(t=t.entanglements,i&=e;0<i;){var a=31-Ve(i),r=1<<a;e|=t[a],i&=~r}return di=e,tu(),n}function B6(t,e){Q=null,V.H=Lo,e===ls||e===nu?(e=Sm(),xt=3):e===Lf?(e=Sm(),xt=4):xt=e===Wf?8:e!==null&&typeof e=="object"&&typeof e.then=="function"?6:1,Pe=e,at===null&&(Lt=1,Oc(t,rn(e,t.current)))}function R6(){var t=Xe.current;return t===null?!0:(ot&4194048)===ot?on===null:(ot&62914560)===ot||(ot&536870912)!==0?t===on:!1}function D6(){var t=V.H;return V.H=Lo,t===null?Lo:t}function I6(){var t=V.A;return V.A=Cv,t}function jc(){Lt=4,zi||(ot&4194048)!==ot&&Xe.current!==null||(cs=!0),(Qi&134217727)===0&&(Ma&134217727)===0||Ct===null||Li(Ct,ot,Ue,!1)}function gp(t,e,n){var i=ft;ft|=2;var a=D6(),r=I6();(Ct!==t||ot!==e)&&(Pc=null,ns(t,e)),e=!1;var s=Lt;t:do try{if(xt!==0&&at!==null){var o=at,l=Pe;switch(xt){case 8:r1(),s=6;break t;case 3:case 2:case 9:case 6:Xe.current===null&&(e=!0);var c=xt;if(xt=0,Pe=null,jr(t,o,l,c),n&&cs){s=0;break t}break;default:c=xt,xt=0,Pe=null,jr(t,o,l,c)}}Tv(),s=Lt;break}catch(u){B6(t,u)}while(!0);return e&&t.shellSuspendCounter++,ii=Na=null,ft=i,V.H=a,V.A=r,at===null&&(Ct=null,ot=0,tu()),s}function Tv(){for(;at!==null;)F6(at)}function Mv(t,e){var n=ft;ft|=2;var i=D6(),a=I6();Ct!==t||ot!==e?(Pc=null,Nc=He()+500,ns(t,e)):cs=Vo(t,e);t:do try{if(xt!==0&&at!==null){e=at;var r=Pe;e:switch(xt){case 1:xt=0,Pe=null,jr(t,e,r,1);break;case 2:case 9:if(Cm(r)){xt=0,Pe=null,Xm(e);break}e=function(){xt!==2&&xt!==9||Ct!==t||(xt=7),Fn(t)},r.then(e,e);break t;case 3:xt=7;break t;case 4:xt=5;break t;case 7:Cm(r)?(xt=0,Pe=null,Xm(e)):(xt=0,Pe=null,jr(t,e,r,7));break;case 5:var s=null;switch(at.tag){case 26:s=at.memoizedState;case 5:case 27:var o=at;if(s?t5(s):o.stateNode.complete){xt=0,Pe=null;var l=o.sibling;if(l!==null)at=l;else{var c=o.return;c!==null?(at=c,cu(c)):at=null}break e}}xt=0,Pe=null,jr(t,e,r,5);break;case 6:xt=0,Pe=null,jr(t,e,r,6);break;case 8:r1(),Lt=6;break t;default:throw Error(_(462))}}_v();break}catch(u){B6(t,u)}while(!0);return ii=Na=null,V.H=i,V.A=a,ft=n,at!==null?0:(Ct=null,ot=0,tu(),Lt)}function _v(){for(;at!==null&&!J7();)F6(at)}function F6(t){var e=o6(t.alternate,t,di);t.memoizedProps=t.pendingProps,e===null?cu(t):at=e}function Xm(t){var e=t,n=e.alternate;switch(e.tag){case 15:case 0:e=$m(n,e,e.pendingProps,e.type,void 0,ot);break;case 11:e=$m(n,e,e.pendingProps,e.type.render,e.ref,ot);break;case 5:Yf(e);default:l6(n,e),e=at=l2(e,di),e=o6(n,e,di)}t.memoizedProps=t.pendingProps,e===null?cu(t):at=e}function jr(t,e,n,i){ii=Na=null,Yf(e),Vr=null,Oo=0;var a=e.return;try{if(yv(t,a,e,n,ot)){Lt=1,Oc(t,rn(n,t.current)),at=null;return}}catch(r){if(a!==null)throw at=a,r;Lt=1,Oc(t,rn(n,t.current)),at=null;return}e.flags&32768?(ut||i===1?t=!0:cs||(ot&536870912)!==0?t=!1:(zi=t=!0,(i===2||i===9||i===3||i===6)&&(i=Xe.current,i!==null&&i.tag===13&&(i.flags|=16384))),O6(e,t)):cu(e)}function cu(t){var e=t;do{if((e.flags&32768)!==0){O6(e,zi);return}t=e.return;var n=bv(e.alternate,e,di);if(n!==null){at=n;return}if(e=e.sibling,e!==null){at=e;return}at=e=t}while(e!==null);Lt===0&&(Lt=5)}function O6(t,e){do{var n=kv(t.alternate,t);if(n!==null){n.flags&=32767,at=n;return}if(n=t.return,n!==null&&(n.flags|=32768,n.subtreeFlags=0,n.deletions=null),!e&&(t=t.sibling,t!==null)){at=t;return}at=t=n}while(t!==null);Lt=6,at=null}function Km(t,e,n,i,a,r,s,o,l){t.cancelPendingCommit=null;do uu();while(qt!==0);if((ft&6)!==0)throw Error(_(327));if(e!==null){if(e===t.current)throw Error(_(177));if(r=e.lanes|e.childLanes,r|=Bf,l9(t,n,r,s,o,l),t===Ct&&(at=Ct=null,ot=0),es=e,Yi=t,si=n,af=r,rf=a,T6=i,(e.subtreeFlags&10256)!==0||(e.flags&10256)!==0?(t.callbackNode=null,t.callbackPriority=0,Iv(Cc,function(){return j6(),null})):(t.callbackNode=null,t.callbackPriority=0),i=(e.flags&13878)!==0,(e.subtreeFlags&13878)!==0||i){i=V.T,V.T=null,a=ht.p,ht.p=2,s=ft,ft|=4;try{Ev(t,e,n)}finally{ft=s,ht.p=a,V.T=i}}qt=1,z6(),L6(),N6()}}function z6(){if(qt===1){qt=0;var t=Yi,e=es,n=(e.flags&13878)!==0;if((e.subtreeFlags&13878)!==0||n){n=V.T,V.T=null;var i=ht.p;ht.p=2;var a=ft;ft|=4;try{v6(e,t);var r=uf,s=t2(t.containerInfo),o=r.focusedElem,l=r.selectionRange;if(s!==o&&o&&o.ownerDocument&&Wy(o.ownerDocument.documentElement,o)){if(l!==null&&_f(o)){var c=l.start,u=l.end;if(u===void 0&&(u=c),"selectionStart"in o)o.selectionStart=c,o.selectionEnd=Math.min(u,o.value.length);else{var d=o.ownerDocument||document,p=d&&d.defaultView||window;if(p.getSelection){var f=p.getSelection(),y=o.textContent.length,x=Math.min(l.start,y),E=l.end===void 0?x:Math.min(l.end,y);!f.extend&&x>E&&(s=E,E=x,x=s);var v=ym(o,x),h=ym(o,E);if(v&&h&&(f.rangeCount!==1||f.anchorNode!==v.node||f.anchorOffset!==v.offset||f.focusNode!==h.node||f.focusOffset!==h.offset)){var b=d.createRange();b.setStart(v.node,v.offset),f.removeAllRanges(),x>E?(f.addRange(b),f.extend(h.node,h.offset)):(b.setEnd(h.node,h.offset),f.addRange(b))}}}}for(d=[],f=o;f=f.parentNode;)f.nodeType===1&&d.push({element:f,left:f.scrollLeft,top:f.scrollTop});for(typeof o.focus=="function"&&o.focus(),o=0;o<d.length;o++){var w=d[o];w.element.scrollLeft=w.left,w.element.scrollTop=w.top}}Xc=!!cf,uf=cf=null}finally{ft=a,ht.p=i,V.T=n}}t.current=e,qt=2}}function L6(){if(qt===2){qt=0;var t=Yi,e=es,n=(e.flags&8772)!==0;if((e.subtreeFlags&8772)!==0||n){n=V.T,V.T=null;var i=ht.p;ht.p=2;var a=ft;ft|=4;try{h6(t,e.alternate,e)}finally{ft=a,ht.p=i,V.T=n}}qt=3}}function N6(){if(qt===4||qt===3){qt=0,W7();var t=Yi,e=es,n=si,i=T6;(e.subtreeFlags&10256)!==0||(e.flags&10256)!==0?qt=5:(qt=0,es=Yi=null,P6(t,t.pendingLanes));var a=t.pendingLanes;if(a===0&&(Hi=null),Ef(n),e=e.stateNode,Ye&&typeof Ye.onCommitFiberRoot=="function")try{Ye.onCommitFiberRoot(Yo,e,void 0,(e.current.flags&128)===128)}catch{}if(i!==null){e=V.T,a=ht.p,ht.p=2,V.T=null;try{for(var r=t.onRecoverableError,s=0;s<i.length;s++){var o=i[s];r(o.value,{componentStack:o.stack})}}finally{V.T=e,ht.p=a}}(si&3)!==0&&uu(),Fn(t),a=t.pendingLanes,(n&261930)!==0&&(a&42)!==0?t===sf?To++:(To=0,sf=t):To=0,Jo(0,!1)}}function P6(t,e){(t.pooledCacheLanes&=e)===0&&(e=t.pooledCache,e!=null&&(t.pooledCache=null,Ko(e)))}function uu(){return z6(),L6(),N6(),j6()}function j6(){if(qt!==5)return!1;var t=Yi,e=af;af=0;var n=Ef(si),i=V.T,a=ht.p;try{ht.p=32>n?32:n,V.T=null,n=rf,rf=null;var r=Yi,s=si;if(qt=0,es=Yi=null,si=0,(ft&6)!==0)throw Error(_(331));var o=ft;if(ft|=4,C6(r.current),k6(r,r.current,s,n),ft=o,Jo(0,!1),Ye&&typeof Ye.onPostCommitFiberRoot=="function")try{Ye.onPostCommitFiberRoot(Yo,r)}catch{}return!0}finally{ht.p=a,V.T=i,P6(t,e)}}function Zm(t,e,n){e=rn(n,e),e=Jp(t.stateNode,e,2),t=Ui(t,e,2),t!==null&&(Go(t,2),Fn(t))}function vt(t,e,n){if(t.tag===3)Zm(t,t,n);else for(;e!==null;){if(e.tag===3){Zm(e,t,n);break}else if(e.tag===1){var i=e.stateNode;if(typeof e.type.getDerivedStateFromError=="function"||typeof i.componentDidCatch=="function"&&(Hi===null||!Hi.has(i))){t=rn(n,t),n=e6(2),i=Ui(e,n,2),i!==null&&(n6(n,i,e,t),Go(i,2),Fn(i));break}}e=e.return}}function mp(t,e,n){var i=t.pingCache;if(i===null){i=t.pingCache=new Sv;var a=new Set;i.set(e,a)}else a=i.get(e),a===void 0&&(a=new Set,i.set(e,a));a.has(n)||(i1=!0,a.add(n),t=Bv.bind(null,t,e,n),e.then(t,t))}function Bv(t,e,n){var i=t.pingCache;i!==null&&i.delete(e),t.pingedLanes|=t.suspendedLanes&n,t.warmLanes&=~n,Ct===t&&(ot&n)===n&&(Lt===4||Lt===3&&(ot&62914560)===ot&&300>He()-ou?(ft&2)===0&&ns(t,0):a1|=n,ts===ot&&(ts=0)),Fn(t)}function $6(t,e){e===0&&(e=Dy()),t=La(t,e),t!==null&&(Go(t,e),Fn(t))}function Rv(t){var e=t.memoizedState,n=0;e!==null&&(n=e.retryLane),$6(t,n)}function Dv(t,e){var n=0;switch(t.tag){case 31:case 13:var i=t.stateNode,a=t.memoizedState;a!==null&&(n=a.retryLane);break;case 19:i=t.stateNode;break;case 22:i=t.stateNode._retryCache;break;default:throw Error(_(314))}i!==null&&i.delete(e),$6(t,n)}function Iv(t,e){return bf(t,e)}var $c=null,Mr=null,of=!1,Uc=!1,yp=!1,Ni=0;function Fn(t){t!==Mr&&t.next===null&&(Mr===null?$c=Mr=t:Mr=Mr.next=t),Uc=!0,of||(of=!0,Ov())}function Jo(t,e){if(!yp&&Uc){yp=!0;do for(var n=!1,i=$c;i!==null;){if(!e)if(t!==0){var a=i.pendingLanes;if(a===0)var r=0;else{var s=i.suspendedLanes,o=i.pingedLanes;r=(1<<31-Ve(42|t)+1)-1,r&=a&~(s&~o),r=r&201326741?r&201326741|1:r?r|2:0}r!==0&&(n=!0,Qm(i,r))}else r=ot,r=Zc(i,i===Ct?r:0,i.cancelPendingCommit!==null||i.timeoutHandle!==-1),(r&3)===0||Vo(i,r)||(n=!0,Qm(i,r));i=i.next}while(n);yp=!1}}function Fv(){U6()}function U6(){Uc=of=!1;var t=0;Ni!==0&&Hv()&&(t=Ni);for(var e=He(),n=null,i=$c;i!==null;){var a=i.next,r=H6(i,e);r===0?(i.next=null,n===null?$c=a:n.next=a,a===null&&(Mr=n)):(n=i,(t!==0||(r&3)!==0)&&(Uc=!0)),i=a}qt!==0&&qt!==5||Jo(t,!1),Ni!==0&&(Ni=0)}function H6(t,e){for(var n=t.suspendedLanes,i=t.pingedLanes,a=t.expirationTimes,r=t.pendingLanes&-62914561;0<r;){var s=31-Ve(r),o=1<<s,l=a[s];l===-1?((o&n)===0||(o&i)!==0)&&(a[s]=o9(o,e)):l<=e&&(t.expiredLanes|=o),r&=~o}if(e=Ct,n=ot,n=Zc(t,t===e?n:0,t.cancelPendingCommit!==null||t.timeoutHandle!==-1),i=t.callbackNode,n===0||t===e&&(xt===2||xt===9)||t.cancelPendingCommit!==null)return i!==null&&i!==null&&Gd(i),t.callbackNode=null,t.callbackPriority=0;if((n&3)===0||Vo(t,n)){if(e=n&-n,e===t.callbackPriority)return e;switch(i!==null&&Gd(i),Ef(n)){case 2:case 8:n=By;break;case 32:n=Cc;break;case 268435456:n=Ry;break;default:n=Cc}return i=Y6.bind(null,t),n=bf(n,i),t.callbackPriority=e,t.callbackNode=n,e}return i!==null&&i!==null&&Gd(i),t.callbackPriority=2,t.callbackNode=null,2}function Y6(t,e){if(qt!==0&&qt!==5)return t.callbackNode=null,t.callbackPriority=0,null;var n=t.callbackNode;if(uu()&&t.callbackNode!==n)return null;var i=ot;return i=Zc(t,t===Ct?i:0,t.cancelPendingCommit!==null||t.timeoutHandle!==-1),i===0?null:(_6(t,i,e),H6(t,He()),t.callbackNode!=null&&t.callbackNode===n?Y6.bind(null,t):null)}function Qm(t,e){if(uu())return null;_6(t,e,!0)}function Ov(){Vv(function(){(ft&6)!==0?bf(_y,Fv):U6()})}function s1(){if(Ni===0){var t=Qr;t===0&&(t=Hl,Hl<<=1,(Hl&261888)===0&&(Hl=256)),Ni=t}return Ni}function Jm(t){return t==null||typeof t=="symbol"||typeof t=="boolean"?null:typeof t=="function"?t:oc(""+t)}function Wm(t,e){var n=e.ownerDocument.createElement("input");return n.name=e.name,n.value=e.value,t.id&&n.setAttribute("form",t.id),e.parentNode.insertBefore(n,e),t=new FormData(t),n.parentNode.removeChild(n),t}function zv(t,e,n,i,a){if(e==="submit"&&n&&n.stateNode===a){var r=Jm((a[_e]||null).action),s=i.submitter;s&&(e=(e=s[_e]||null)?Jm(e.formAction):s.getAttribute("formAction"),e!==null&&(r=e,s=null));var o=new Qc("action","action",null,i,a);t.push({event:o,listeners:[{instance:null,listener:function(){if(i.defaultPrevented){if(Ni!==0){var l=s?Wm(a,s):new FormData(a);Zp(n,{pending:!0,data:l,method:a.method,action:r},null,l)}}else typeof r=="function"&&(o.preventDefault(),l=s?Wm(a,s):new FormData(a),Zp(n,{pending:!0,data:l,method:a.method,action:r},r,l))},currentTarget:a}]})}}for(ec=0;ec<Np.length;ec++)nc=Np[ec],ty=nc.toLowerCase(),ey=nc[0].toUpperCase()+nc.slice(1),bn(ty,"on"+ey);var nc,ty,ey,ec;bn(n2,"onAnimationEnd");bn(i2,"onAnimationIteration");bn(a2,"onAnimationStart");bn("dblclick","onDoubleClick");bn("focusin","onFocus");bn("focusout","onBlur");bn(tv,"onTransitionRun");bn(ev,"onTransitionStart");bn(nv,"onTransitionCancel");bn(r2,"onTransitionEnd");Kr("onMouseEnter",["mouseout","mouseover"]);Kr("onMouseLeave",["mouseout","mouseover"]);Kr("onPointerEnter",["pointerout","pointerover"]);Kr("onPointerLeave",["pointerout","pointerover"]);Fa("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));Fa("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));Fa("onBeforeInput",["compositionend","keypress","textInput","paste"]);Fa("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));Fa("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));Fa("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var No="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),Lv=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(No));function V6(t,e){e=(e&4)!==0;for(var n=0;n<t.length;n++){var i=t[n],a=i.event;i=i.listeners;t:{var r=void 0;if(e)for(var s=i.length-1;0<=s;s--){var o=i[s],l=o.instance,c=o.currentTarget;if(o=o.listener,l!==r&&a.isPropagationStopped())break t;r=o,a.currentTarget=c;try{r(a)}catch(u){Ac(u)}a.currentTarget=null,r=l}else for(s=0;s<i.length;s++){if(o=i[s],l=o.instance,c=o.currentTarget,o=o.listener,l!==r&&a.isPropagationStopped())break t;r=o,a.currentTarget=c;try{r(a)}catch(u){Ac(u)}a.currentTarget=null,r=l}}}}function it(t,e){var n=e[Bp];n===void 0&&(n=e[Bp]=new Set);var i=t+"__bubble";n.has(i)||(G6(e,t,2,!1),n.add(i))}function xp(t,e,n){var i=0;e&&(i|=4),G6(n,t,i,e)}var ic="_reactListening"+Math.random().toString(36).slice(2);function o1(t){if(!t[ic]){t[ic]=!0,Ly.forEach(function(n){n!=="selectionchange"&&(Lv.has(n)||xp(n,!1,t),xp(n,!0,t))});var e=t.nodeType===9?t:t.ownerDocument;e===null||e[ic]||(e[ic]=!0,xp("selectionchange",!1,e))}}function G6(t,e,n,i){switch(r5(e)){case 2:var a=db;break;case 8:a=pb;break;default:a=d1}n=a.bind(null,e,n,t),a=void 0,!Op||e!=="touchstart"&&e!=="touchmove"&&e!=="wheel"||(a=!0),i?a!==void 0?t.addEventListener(e,n,{capture:!0,passive:a}):t.addEventListener(e,n,!0):a!==void 0?t.addEventListener(e,n,{passive:a}):t.addEventListener(e,n,!1)}function vp(t,e,n,i,a){var r=i;if((e&1)===0&&(e&2)===0&&i!==null)t:for(;;){if(i===null)return;var s=i.tag;if(s===3||s===4){var o=i.stateNode.containerInfo;if(o===a)break;if(s===4)for(s=i.return;s!==null;){var l=s.tag;if((l===3||l===4)&&s.stateNode.containerInfo===a)return;s=s.return}for(;o!==null;){if(s=Rr(o),s===null)return;if(l=s.tag,l===5||l===6||l===26||l===27){i=r=s;continue t}o=o.parentNode}}i=i.return}Vy(function(){var c=r,u=Sf(n),d=[];t:{var p=s2.get(t);if(p!==void 0){var f=Qc,y=t;switch(t){case"keypress":if(cc(n)===0)break t;case"keydown":case"keyup":f=D9;break;case"focusin":y="focus",f=Qd;break;case"focusout":y="blur",f=Qd;break;case"beforeblur":case"afterblur":f=Qd;break;case"click":if(n.button===2)break t;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":f=lm;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":f=b9;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":f=O9;break;case n2:case i2:case a2:f=w9;break;case r2:f=L9;break;case"scroll":case"scrollend":f=x9;break;case"wheel":f=P9;break;case"copy":case"cut":case"paste":f=S9;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":f=um;break;case"toggle":case"beforetoggle":f=$9}var x=(e&4)!==0,E=!x&&(t==="scroll"||t==="scrollend"),v=x?p!==null?p+"Capture":null:p;x=[];for(var h=c,b;h!==null;){var w=h;if(b=w.stateNode,w=w.tag,w!==5&&w!==26&&w!==27||b===null||v===null||(w=Bo(h,v),w!=null&&x.push(Po(h,w,b))),E)break;h=h.return}0<x.length&&(p=new f(p,y,null,n,u),d.push({event:p,listeners:x}))}}if((e&7)===0){t:{if(p=t==="mouseover"||t==="pointerover",f=t==="mouseout"||t==="pointerout",p&&n!==Fp&&(y=n.relatedTarget||n.fromElement)&&(Rr(y)||y[rs]))break t;if((f||p)&&(p=u.window===u?u:(p=u.ownerDocument)?p.defaultView||p.parentWindow:window,f?(y=n.relatedTarget||n.toElement,f=c,y=y?Rr(y):null,y!==null&&(E=Ho(y),x=y.tag,y!==E||x!==5&&x!==27&&x!==6)&&(y=null)):(f=null,y=c),f!==y)){if(x=lm,w="onMouseLeave",v="onMouseEnter",h="mouse",(t==="pointerout"||t==="pointerover")&&(x=um,w="onPointerLeave",v="onPointerEnter",h="pointer"),E=f==null?p:fo(f),b=y==null?p:fo(y),p=new x(w,h+"leave",f,n,u),p.target=E,p.relatedTarget=b,w=null,Rr(u)===c&&(x=new x(v,h+"enter",y,n,u),x.target=b,x.relatedTarget=E,w=x),E=w,f&&y)e:{for(x=Nv,v=f,h=y,b=0,w=v;w;w=x(w))b++;w=0;for(var B=h;B;B=x(B))w++;for(;0<b-w;)v=x(v),b--;for(;0<w-b;)h=x(h),w--;for(;b--;){if(v===h||h!==null&&v===h.alternate){x=v;break e}v=x(v),h=x(h)}x=null}else x=null;f!==null&&ny(d,p,f,x,!1),y!==null&&E!==null&&ny(d,E,y,x,!0)}}t:{if(p=c?fo(c):window,f=p.nodeName&&p.nodeName.toLowerCase(),f==="select"||f==="input"&&p.type==="file")var j=hm;else if(fm(p))if(Qy)j=Q9;else{j=K9;var T=X9}else f=p.nodeName,!f||f.toLowerCase()!=="input"||p.type!=="checkbox"&&p.type!=="radio"?c&&Cf(c.elementType)&&(j=hm):j=Z9;if(j&&(j=j(t,c))){Zy(d,j,n,u);break t}T&&T(t,p,c),t==="focusout"&&c&&p.type==="number"&&c.memoizedProps.value!=null&&Ip(p,"number",p.value)}switch(T=c?fo(c):window,t){case"focusin":(fm(T)||T.contentEditable==="true")&&(Fr=T,zp=c,xo=null);break;case"focusout":xo=zp=Fr=null;break;case"mousedown":Lp=!0;break;case"contextmenu":case"mouseup":case"dragend":Lp=!1,xm(d,n,u);break;case"selectionchange":if(W9)break;case"keydown":case"keyup":xm(d,n,u)}var P;if(Mf)t:{switch(t){case"compositionstart":var D="onCompositionStart";break t;case"compositionend":D="onCompositionEnd";break t;case"compositionupdate":D="onCompositionUpdate";break t}D=void 0}else Ir?Xy(t,n)&&(D="onCompositionEnd"):t==="keydown"&&n.keyCode===229&&(D="onCompositionStart");D&&(qy&&n.locale!=="ko"&&(Ir||D!=="onCompositionStart"?D==="onCompositionEnd"&&Ir&&(P=Gy()):(Oi=u,Af="value"in Oi?Oi.value:Oi.textContent,Ir=!0)),T=Hc(c,D),0<T.length&&(D=new cm(D,t,null,n,u),d.push({event:D,listeners:T}),P?D.data=P:(P=Ky(n),P!==null&&(D.data=P)))),(P=H9?Y9(t,n):V9(t,n))&&(D=Hc(c,"onBeforeInput"),0<D.length&&(T=new cm("onBeforeInput","beforeinput",null,n,u),d.push({event:T,listeners:D}),T.data=P)),zv(d,t,c,n,u)}V6(d,e)})}function Po(t,e,n){return{instance:t,listener:e,currentTarget:n}}function Hc(t,e){for(var n=e+"Capture",i=[];t!==null;){var a=t,r=a.stateNode;if(a=a.tag,a!==5&&a!==26&&a!==27||r===null||(a=Bo(t,n),a!=null&&i.unshift(Po(t,a,r)),a=Bo(t,e),a!=null&&i.push(Po(t,a,r))),t.tag===3)return i;t=t.return}return[]}function Nv(t){if(t===null)return null;do t=t.return;while(t&&t.tag!==5&&t.tag!==27);return t||null}function ny(t,e,n,i,a){for(var r=e._reactName,s=[];n!==null&&n!==i;){var o=n,l=o.alternate,c=o.stateNode;if(o=o.tag,l!==null&&l===i)break;o!==5&&o!==26&&o!==27||c===null||(l=c,a?(c=Bo(n,r),c!=null&&s.unshift(Po(n,c,l))):a||(c=Bo(n,r),c!=null&&s.push(Po(n,c,l)))),n=n.return}s.length!==0&&t.push({event:e,listeners:s})}var Pv=/\r\n?/g,jv=/\u0000|\uFFFD/g;function iy(t){return(typeof t=="string"?t:""+t).replace(Pv,`
`).replace(jv,"")}function q6(t,e){return e=iy(e),iy(t)===e}function bt(t,e,n,i,a,r){switch(n){case"children":typeof i=="string"?e==="body"||e==="textarea"&&i===""||Zr(t,i):(typeof i=="number"||typeof i=="bigint")&&e!=="body"&&Zr(t,""+i);break;case"className":Gl(t,"class",i);break;case"tabIndex":Gl(t,"tabindex",i);break;case"dir":case"role":case"viewBox":case"width":case"height":Gl(t,n,i);break;case"style":Yy(t,i,r);break;case"data":if(e!=="object"){Gl(t,"data",i);break}case"src":case"href":if(i===""&&(e!=="a"||n!=="href")){t.removeAttribute(n);break}if(i==null||typeof i=="function"||typeof i=="symbol"||typeof i=="boolean"){t.removeAttribute(n);break}i=oc(""+i),t.setAttribute(n,i);break;case"action":case"formAction":if(typeof i=="function"){t.setAttribute(n,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof r=="function"&&(n==="formAction"?(e!=="input"&&bt(t,e,"name",a.name,a,null),bt(t,e,"formEncType",a.formEncType,a,null),bt(t,e,"formMethod",a.formMethod,a,null),bt(t,e,"formTarget",a.formTarget,a,null)):(bt(t,e,"encType",a.encType,a,null),bt(t,e,"method",a.method,a,null),bt(t,e,"target",a.target,a,null)));if(i==null||typeof i=="symbol"||typeof i=="boolean"){t.removeAttribute(n);break}i=oc(""+i),t.setAttribute(n,i);break;case"onClick":i!=null&&(t.onclick=ni);break;case"onScroll":i!=null&&it("scroll",t);break;case"onScrollEnd":i!=null&&it("scrollend",t);break;case"dangerouslySetInnerHTML":if(i!=null){if(typeof i!="object"||!("__html"in i))throw Error(_(61));if(n=i.__html,n!=null){if(a.children!=null)throw Error(_(60));t.innerHTML=n}}break;case"multiple":t.multiple=i&&typeof i!="function"&&typeof i!="symbol";break;case"muted":t.muted=i&&typeof i!="function"&&typeof i!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(i==null||typeof i=="function"||typeof i=="boolean"||typeof i=="symbol"){t.removeAttribute("xlink:href");break}n=oc(""+i),t.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",n);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":i!=null&&typeof i!="function"&&typeof i!="symbol"?t.setAttribute(n,""+i):t.removeAttribute(n);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":i&&typeof i!="function"&&typeof i!="symbol"?t.setAttribute(n,""):t.removeAttribute(n);break;case"capture":case"download":i===!0?t.setAttribute(n,""):i!==!1&&i!=null&&typeof i!="function"&&typeof i!="symbol"?t.setAttribute(n,i):t.removeAttribute(n);break;case"cols":case"rows":case"size":case"span":i!=null&&typeof i!="function"&&typeof i!="symbol"&&!isNaN(i)&&1<=i?t.setAttribute(n,i):t.removeAttribute(n);break;case"rowSpan":case"start":i==null||typeof i=="function"||typeof i=="symbol"||isNaN(i)?t.removeAttribute(n):t.setAttribute(n,i);break;case"popover":it("beforetoggle",t),it("toggle",t),sc(t,"popover",i);break;case"xlinkActuate":Xn(t,"http://www.w3.org/1999/xlink","xlink:actuate",i);break;case"xlinkArcrole":Xn(t,"http://www.w3.org/1999/xlink","xlink:arcrole",i);break;case"xlinkRole":Xn(t,"http://www.w3.org/1999/xlink","xlink:role",i);break;case"xlinkShow":Xn(t,"http://www.w3.org/1999/xlink","xlink:show",i);break;case"xlinkTitle":Xn(t,"http://www.w3.org/1999/xlink","xlink:title",i);break;case"xlinkType":Xn(t,"http://www.w3.org/1999/xlink","xlink:type",i);break;case"xmlBase":Xn(t,"http://www.w3.org/XML/1998/namespace","xml:base",i);break;case"xmlLang":Xn(t,"http://www.w3.org/XML/1998/namespace","xml:lang",i);break;case"xmlSpace":Xn(t,"http://www.w3.org/XML/1998/namespace","xml:space",i);break;case"is":sc(t,"is",i);break;case"innerText":case"textContent":break;default:(!(2<n.length)||n[0]!=="o"&&n[0]!=="O"||n[1]!=="n"&&n[1]!=="N")&&(n=m9.get(n)||n,sc(t,n,i))}}function lf(t,e,n,i,a,r){switch(n){case"style":Yy(t,i,r);break;case"dangerouslySetInnerHTML":if(i!=null){if(typeof i!="object"||!("__html"in i))throw Error(_(61));if(n=i.__html,n!=null){if(a.children!=null)throw Error(_(60));t.innerHTML=n}}break;case"children":typeof i=="string"?Zr(t,i):(typeof i=="number"||typeof i=="bigint")&&Zr(t,""+i);break;case"onScroll":i!=null&&it("scroll",t);break;case"onScrollEnd":i!=null&&it("scrollend",t);break;case"onClick":i!=null&&(t.onclick=ni);break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":break;case"innerText":case"textContent":break;default:if(!Ny.hasOwnProperty(n))t:{if(n[0]==="o"&&n[1]==="n"&&(a=n.endsWith("Capture"),e=n.slice(2,a?n.length-7:void 0),r=t[_e]||null,r=r!=null?r[n]:null,typeof r=="function"&&t.removeEventListener(e,r,a),typeof i=="function")){typeof r!="function"&&r!==null&&(n in t?t[n]=null:t.hasAttribute(n)&&t.removeAttribute(n)),t.addEventListener(e,i,a);break t}n in t?t[n]=i:i===!0?t.setAttribute(n,""):sc(t,n,i)}}}function re(t,e,n){switch(e){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":it("error",t),it("load",t);var i=!1,a=!1,r;for(r in n)if(n.hasOwnProperty(r)){var s=n[r];if(s!=null)switch(r){case"src":i=!0;break;case"srcSet":a=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(_(137,e));default:bt(t,e,r,s,n,null)}}a&&bt(t,e,"srcSet",n.srcSet,n,null),i&&bt(t,e,"src",n.src,n,null);return;case"input":it("invalid",t);var o=r=s=a=null,l=null,c=null;for(i in n)if(n.hasOwnProperty(i)){var u=n[i];if(u!=null)switch(i){case"name":a=u;break;case"type":s=u;break;case"checked":l=u;break;case"defaultChecked":c=u;break;case"value":r=u;break;case"defaultValue":o=u;break;case"children":case"dangerouslySetInnerHTML":if(u!=null)throw Error(_(137,e));break;default:bt(t,e,i,u,n,null)}}$y(t,r,o,l,c,s,a,!1);return;case"select":it("invalid",t),i=s=r=null;for(a in n)if(n.hasOwnProperty(a)&&(o=n[a],o!=null))switch(a){case"value":r=o;break;case"defaultValue":s=o;break;case"multiple":i=o;default:bt(t,e,a,o,n,null)}e=r,n=s,t.multiple=!!i,e!=null?Ur(t,!!i,e,!1):n!=null&&Ur(t,!!i,n,!0);return;case"textarea":it("invalid",t),r=a=i=null;for(s in n)if(n.hasOwnProperty(s)&&(o=n[s],o!=null))switch(s){case"value":i=o;break;case"defaultValue":a=o;break;case"children":r=o;break;case"dangerouslySetInnerHTML":if(o!=null)throw Error(_(91));break;default:bt(t,e,s,o,n,null)}Hy(t,i,a,r);return;case"option":for(l in n)n.hasOwnProperty(l)&&(i=n[l],i!=null)&&(l==="selected"?t.selected=i&&typeof i!="function"&&typeof i!="symbol":bt(t,e,l,i,n,null));return;case"dialog":it("beforetoggle",t),it("toggle",t),it("cancel",t),it("close",t);break;case"iframe":case"object":it("load",t);break;case"video":case"audio":for(i=0;i<No.length;i++)it(No[i],t);break;case"image":it("error",t),it("load",t);break;case"details":it("toggle",t);break;case"embed":case"source":case"link":it("error",t),it("load",t);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(c in n)if(n.hasOwnProperty(c)&&(i=n[c],i!=null))switch(c){case"children":case"dangerouslySetInnerHTML":throw Error(_(137,e));default:bt(t,e,c,i,n,null)}return;default:if(Cf(e)){for(u in n)n.hasOwnProperty(u)&&(i=n[u],i!==void 0&&lf(t,e,u,i,n,void 0));return}}for(o in n)n.hasOwnProperty(o)&&(i=n[o],i!=null&&bt(t,e,o,i,n,null))}function $v(t,e,n,i){switch(e){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var a=null,r=null,s=null,o=null,l=null,c=null,u=null;for(f in n){var d=n[f];if(n.hasOwnProperty(f)&&d!=null)switch(f){case"checked":break;case"value":break;case"defaultValue":l=d;default:i.hasOwnProperty(f)||bt(t,e,f,null,i,d)}}for(var p in i){var f=i[p];if(d=n[p],i.hasOwnProperty(p)&&(f!=null||d!=null))switch(p){case"type":r=f;break;case"name":a=f;break;case"checked":c=f;break;case"defaultChecked":u=f;break;case"value":s=f;break;case"defaultValue":o=f;break;case"children":case"dangerouslySetInnerHTML":if(f!=null)throw Error(_(137,e));break;default:f!==d&&bt(t,e,p,f,i,d)}}Dp(t,s,o,l,c,u,r,a);return;case"select":f=s=o=p=null;for(r in n)if(l=n[r],n.hasOwnProperty(r)&&l!=null)switch(r){case"value":break;case"multiple":f=l;default:i.hasOwnProperty(r)||bt(t,e,r,null,i,l)}for(a in i)if(r=i[a],l=n[a],i.hasOwnProperty(a)&&(r!=null||l!=null))switch(a){case"value":p=r;break;case"defaultValue":o=r;break;case"multiple":s=r;default:r!==l&&bt(t,e,a,r,i,l)}e=o,n=s,i=f,p!=null?Ur(t,!!n,p,!1):!!i!=!!n&&(e!=null?Ur(t,!!n,e,!0):Ur(t,!!n,n?[]:"",!1));return;case"textarea":f=p=null;for(o in n)if(a=n[o],n.hasOwnProperty(o)&&a!=null&&!i.hasOwnProperty(o))switch(o){case"value":break;case"children":break;default:bt(t,e,o,null,i,a)}for(s in i)if(a=i[s],r=n[s],i.hasOwnProperty(s)&&(a!=null||r!=null))switch(s){case"value":p=a;break;case"defaultValue":f=a;break;case"children":break;case"dangerouslySetInnerHTML":if(a!=null)throw Error(_(91));break;default:a!==r&&bt(t,e,s,a,i,r)}Uy(t,p,f);return;case"option":for(var y in n)p=n[y],n.hasOwnProperty(y)&&p!=null&&!i.hasOwnProperty(y)&&(y==="selected"?t.selected=!1:bt(t,e,y,null,i,p));for(l in i)p=i[l],f=n[l],i.hasOwnProperty(l)&&p!==f&&(p!=null||f!=null)&&(l==="selected"?t.selected=p&&typeof p!="function"&&typeof p!="symbol":bt(t,e,l,p,i,f));return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var x in n)p=n[x],n.hasOwnProperty(x)&&p!=null&&!i.hasOwnProperty(x)&&bt(t,e,x,null,i,p);for(c in i)if(p=i[c],f=n[c],i.hasOwnProperty(c)&&p!==f&&(p!=null||f!=null))switch(c){case"children":case"dangerouslySetInnerHTML":if(p!=null)throw Error(_(137,e));break;default:bt(t,e,c,p,i,f)}return;default:if(Cf(e)){for(var E in n)p=n[E],n.hasOwnProperty(E)&&p!==void 0&&!i.hasOwnProperty(E)&&lf(t,e,E,void 0,i,p);for(u in i)p=i[u],f=n[u],!i.hasOwnProperty(u)||p===f||p===void 0&&f===void 0||lf(t,e,u,p,i,f);return}}for(var v in n)p=n[v],n.hasOwnProperty(v)&&p!=null&&!i.hasOwnProperty(v)&&bt(t,e,v,null,i,p);for(d in i)p=i[d],f=n[d],!i.hasOwnProperty(d)||p===f||p==null&&f==null||bt(t,e,d,p,i,f)}function ay(t){switch(t){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function Uv(){if(typeof performance.getEntriesByType=="function"){for(var t=0,e=0,n=performance.getEntriesByType("resource"),i=0;i<n.length;i++){var a=n[i],r=a.transferSize,s=a.initiatorType,o=a.duration;if(r&&o&&ay(s)){for(s=0,o=a.responseEnd,i+=1;i<n.length;i++){var l=n[i],c=l.startTime;if(c>o)break;var u=l.transferSize,d=l.initiatorType;u&&ay(d)&&(l=l.responseEnd,s+=u*(l<o?1:(o-c)/(l-c)))}if(--i,e+=8*(r+s)/(a.duration/1e3),t++,10<t)break}}if(0<t)return e/t/1e6}return navigator.connection&&(t=navigator.connection.downlink,typeof t=="number")?t:5}var cf=null,uf=null;function Yc(t){return t.nodeType===9?t:t.ownerDocument}function ry(t){switch(t){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function X6(t,e){if(t===0)switch(e){case"svg":return 1;case"math":return 2;default:return 0}return t===1&&e==="foreignObject"?0:t}function df(t,e){return t==="textarea"||t==="noscript"||typeof e.children=="string"||typeof e.children=="number"||typeof e.children=="bigint"||typeof e.dangerouslySetInnerHTML=="object"&&e.dangerouslySetInnerHTML!==null&&e.dangerouslySetInnerHTML.__html!=null}var bp=null;function Hv(){var t=window.event;return t&&t.type==="popstate"?t===bp?!1:(bp=t,!0):(bp=null,!1)}var K6=typeof setTimeout=="function"?setTimeout:void 0,Yv=typeof clearTimeout=="function"?clearTimeout:void 0,sy=typeof Promise=="function"?Promise:void 0,Vv=typeof queueMicrotask=="function"?queueMicrotask:typeof sy<"u"?function(t){return sy.resolve(null).then(t).catch(Gv)}:K6;function Gv(t){setTimeout(function(){throw t})}function Wi(t){return t==="head"}function oy(t,e){var n=e,i=0;do{var a=n.nextSibling;if(t.removeChild(n),a&&a.nodeType===8)if(n=a.data,n==="/$"||n==="/&"){if(i===0){t.removeChild(a),as(e);return}i--}else if(n==="$"||n==="$?"||n==="$~"||n==="$!"||n==="&")i++;else if(n==="html")Mo(t.ownerDocument.documentElement);else if(n==="head"){n=t.ownerDocument.head,Mo(n);for(var r=n.firstChild;r;){var s=r.nextSibling,o=r.nodeName;r[qo]||o==="SCRIPT"||o==="STYLE"||o==="LINK"&&r.rel.toLowerCase()==="stylesheet"||n.removeChild(r),r=s}}else n==="body"&&Mo(t.ownerDocument.body);n=a}while(n);as(e)}function ly(t,e){var n=t;t=0;do{var i=n.nextSibling;if(n.nodeType===1?e?(n._stashedDisplay=n.style.display,n.style.display="none"):(n.style.display=n._stashedDisplay||"",n.getAttribute("style")===""&&n.removeAttribute("style")):n.nodeType===3&&(e?(n._stashedText=n.nodeValue,n.nodeValue=""):n.nodeValue=n._stashedText||""),i&&i.nodeType===8)if(n=i.data,n==="/$"){if(t===0)break;t--}else n!=="$"&&n!=="$?"&&n!=="$~"&&n!=="$!"||t++;n=i}while(n)}function pf(t){var e=t.firstChild;for(e&&e.nodeType===10&&(e=e.nextSibling);e;){var n=e;switch(e=e.nextSibling,n.nodeName){case"HTML":case"HEAD":case"BODY":pf(n),wf(n);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(n.rel.toLowerCase()==="stylesheet")continue}t.removeChild(n)}}function qv(t,e,n,i){for(;t.nodeType===1;){var a=n;if(t.nodeName.toLowerCase()!==e.toLowerCase()){if(!i&&(t.nodeName!=="INPUT"||t.type!=="hidden"))break}else if(i){if(!t[qo])switch(e){case"meta":if(!t.hasAttribute("itemprop"))break;return t;case"link":if(r=t.getAttribute("rel"),r==="stylesheet"&&t.hasAttribute("data-precedence"))break;if(r!==a.rel||t.getAttribute("href")!==(a.href==null||a.href===""?null:a.href)||t.getAttribute("crossorigin")!==(a.crossOrigin==null?null:a.crossOrigin)||t.getAttribute("title")!==(a.title==null?null:a.title))break;return t;case"style":if(t.hasAttribute("data-precedence"))break;return t;case"script":if(r=t.getAttribute("src"),(r!==(a.src==null?null:a.src)||t.getAttribute("type")!==(a.type==null?null:a.type)||t.getAttribute("crossorigin")!==(a.crossOrigin==null?null:a.crossOrigin))&&r&&t.hasAttribute("async")&&!t.hasAttribute("itemprop"))break;return t;default:return t}}else if(e==="input"&&t.type==="hidden"){var r=a.name==null?null:""+a.name;if(a.type==="hidden"&&t.getAttribute("name")===r)return t}else return t;if(t=ln(t.nextSibling),t===null)break}return null}function Xv(t,e,n){if(e==="")return null;for(;t.nodeType!==3;)if((t.nodeType!==1||t.nodeName!=="INPUT"||t.type!=="hidden")&&!n||(t=ln(t.nextSibling),t===null))return null;return t}function Z6(t,e){for(;t.nodeType!==8;)if((t.nodeType!==1||t.nodeName!=="INPUT"||t.type!=="hidden")&&!e||(t=ln(t.nextSibling),t===null))return null;return t}function ff(t){return t.data==="$?"||t.data==="$~"}function hf(t){return t.data==="$!"||t.data==="$?"&&t.ownerDocument.readyState!=="loading"}function Kv(t,e){var n=t.ownerDocument;if(t.data==="$~")t._reactRetry=e;else if(t.data!=="$?"||n.readyState!=="loading")e();else{var i=function(){e(),n.removeEventListener("DOMContentLoaded",i)};n.addEventListener("DOMContentLoaded",i),t._reactRetry=i}}function ln(t){for(;t!=null;t=t.nextSibling){var e=t.nodeType;if(e===1||e===3)break;if(e===8){if(e=t.data,e==="$"||e==="$!"||e==="$?"||e==="$~"||e==="&"||e==="F!"||e==="F")break;if(e==="/$"||e==="/&")return null}}return t}var gf=null;function cy(t){t=t.nextSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="/$"||n==="/&"){if(e===0)return ln(t.nextSibling);e--}else n!=="$"&&n!=="$!"&&n!=="$?"&&n!=="$~"&&n!=="&"||e++}t=t.nextSibling}return null}function uy(t){t=t.previousSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="$"||n==="$!"||n==="$?"||n==="$~"||n==="&"){if(e===0)return t;e--}else n!=="/$"&&n!=="/&"||e++}t=t.previousSibling}return null}function Q6(t,e,n){switch(e=Yc(n),t){case"html":if(t=e.documentElement,!t)throw Error(_(452));return t;case"head":if(t=e.head,!t)throw Error(_(453));return t;case"body":if(t=e.body,!t)throw Error(_(454));return t;default:throw Error(_(451))}}function Mo(t){for(var e=t.attributes;e.length;)t.removeAttributeNode(e[0]);wf(t)}var cn=new Map,dy=new Set;function Vc(t){return typeof t.getRootNode=="function"?t.getRootNode():t.nodeType===9?t:t.ownerDocument}var pi=ht.d;ht.d={f:Zv,r:Qv,D:Jv,C:Wv,L:tb,m:eb,X:ib,S:nb,M:ab};function Zv(){var t=pi.f(),e=lu();return t||e}function Qv(t){var e=ss(t);e!==null&&e.tag===5&&e.type==="form"?Y2(e):pi.r(t)}var us=typeof document>"u"?null:document;function J6(t,e,n){var i=us;if(i&&typeof e=="string"&&e){var a=an(e);a='link[rel="'+t+'"][href="'+a+'"]',typeof n=="string"&&(a+='[crossorigin="'+n+'"]'),dy.has(a)||(dy.add(a),t={rel:t,crossOrigin:n,href:e},i.querySelector(a)===null&&(e=i.createElement("link"),re(e,"link",t),Jt(e),i.head.appendChild(e)))}}function Jv(t){pi.D(t),J6("dns-prefetch",t,null)}function Wv(t,e){pi.C(t,e),J6("preconnect",t,e)}function tb(t,e,n){pi.L(t,e,n);var i=us;if(i&&t&&e){var a='link[rel="preload"][as="'+an(e)+'"]';e==="image"&&n&&n.imageSrcSet?(a+='[imagesrcset="'+an(n.imageSrcSet)+'"]',typeof n.imageSizes=="string"&&(a+='[imagesizes="'+an(n.imageSizes)+'"]')):a+='[href="'+an(t)+'"]';var r=a;switch(e){case"style":r=is(t);break;case"script":r=ds(t)}cn.has(r)||(t=Rt({rel:"preload",href:e==="image"&&n&&n.imageSrcSet?void 0:t,as:e},n),cn.set(r,t),i.querySelector(a)!==null||e==="style"&&i.querySelector(Wo(r))||e==="script"&&i.querySelector(tl(r))||(e=i.createElement("link"),re(e,"link",t),Jt(e),i.head.appendChild(e)))}}function eb(t,e){pi.m(t,e);var n=us;if(n&&t){var i=e&&typeof e.as=="string"?e.as:"script",a='link[rel="modulepreload"][as="'+an(i)+'"][href="'+an(t)+'"]',r=a;switch(i){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":r=ds(t)}if(!cn.has(r)&&(t=Rt({rel:"modulepreload",href:t},e),cn.set(r,t),n.querySelector(a)===null)){switch(i){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(n.querySelector(tl(r)))return}i=n.createElement("link"),re(i,"link",t),Jt(i),n.head.appendChild(i)}}}function nb(t,e,n){pi.S(t,e,n);var i=us;if(i&&t){var a=$r(i).hoistableStyles,r=is(t);e=e||"default";var s=a.get(r);if(!s){var o={loading:0,preload:null};if(s=i.querySelector(Wo(r)))o.loading=5;else{t=Rt({rel:"stylesheet",href:t,"data-precedence":e},n),(n=cn.get(r))&&l1(t,n);var l=s=i.createElement("link");Jt(l),re(l,"link",t),l._p=new Promise(function(c,u){l.onload=c,l.onerror=u}),l.addEventListener("load",function(){o.loading|=1}),l.addEventListener("error",function(){o.loading|=2}),o.loading|=4,yc(s,e,i)}s={type:"stylesheet",instance:s,count:1,state:o},a.set(r,s)}}}function ib(t,e){pi.X(t,e);var n=us;if(n&&t){var i=$r(n).hoistableScripts,a=ds(t),r=i.get(a);r||(r=n.querySelector(tl(a)),r||(t=Rt({src:t,async:!0},e),(e=cn.get(a))&&c1(t,e),r=n.createElement("script"),Jt(r),re(r,"link",t),n.head.appendChild(r)),r={type:"script",instance:r,count:1,state:null},i.set(a,r))}}function ab(t,e){pi.M(t,e);var n=us;if(n&&t){var i=$r(n).hoistableScripts,a=ds(t),r=i.get(a);r||(r=n.querySelector(tl(a)),r||(t=Rt({src:t,async:!0,type:"module"},e),(e=cn.get(a))&&c1(t,e),r=n.createElement("script"),Jt(r),re(r,"link",t),n.head.appendChild(r)),r={type:"script",instance:r,count:1,state:null},i.set(a,r))}}function py(t,e,n,i){var a=(a=Pi.current)?Vc(a):null;if(!a)throw Error(_(446));switch(t){case"meta":case"title":return null;case"style":return typeof n.precedence=="string"&&typeof n.href=="string"?(e=is(n.href),n=$r(a).hoistableStyles,i=n.get(e),i||(i={type:"style",instance:null,count:0,state:null},n.set(e,i)),i):{type:"void",instance:null,count:0,state:null};case"link":if(n.rel==="stylesheet"&&typeof n.href=="string"&&typeof n.precedence=="string"){t=is(n.href);var r=$r(a).hoistableStyles,s=r.get(t);if(s||(a=a.ownerDocument||a,s={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},r.set(t,s),(r=a.querySelector(Wo(t)))&&!r._p&&(s.instance=r,s.state.loading=5),cn.has(t)||(n={rel:"preload",as:"style",href:n.href,crossOrigin:n.crossOrigin,integrity:n.integrity,media:n.media,hrefLang:n.hrefLang,referrerPolicy:n.referrerPolicy},cn.set(t,n),r||rb(a,t,n,s.state))),e&&i===null)throw Error(_(528,""));return s}if(e&&i!==null)throw Error(_(529,""));return null;case"script":return e=n.async,n=n.src,typeof n=="string"&&e&&typeof e!="function"&&typeof e!="symbol"?(e=ds(n),n=$r(a).hoistableScripts,i=n.get(e),i||(i={type:"script",instance:null,count:0,state:null},n.set(e,i)),i):{type:"void",instance:null,count:0,state:null};default:throw Error(_(444,t))}}function is(t){return'href="'+an(t)+'"'}function Wo(t){return'link[rel="stylesheet"]['+t+"]"}function W6(t){return Rt({},t,{"data-precedence":t.precedence,precedence:null})}function rb(t,e,n,i){t.querySelector('link[rel="preload"][as="style"]['+e+"]")?i.loading=1:(e=t.createElement("link"),i.preload=e,e.addEventListener("load",function(){return i.loading|=1}),e.addEventListener("error",function(){return i.loading|=2}),re(e,"link",n),Jt(e),t.head.appendChild(e))}function ds(t){return'[src="'+an(t)+'"]'}function tl(t){return"script[async]"+t}function fy(t,e,n){if(e.count++,e.instance===null)switch(e.type){case"style":var i=t.querySelector('style[data-href~="'+an(n.href)+'"]');if(i)return e.instance=i,Jt(i),i;var a=Rt({},n,{"data-href":n.href,"data-precedence":n.precedence,href:null,precedence:null});return i=(t.ownerDocument||t).createElement("style"),Jt(i),re(i,"style",a),yc(i,n.precedence,t),e.instance=i;case"stylesheet":a=is(n.href);var r=t.querySelector(Wo(a));if(r)return e.state.loading|=4,e.instance=r,Jt(r),r;i=W6(n),(a=cn.get(a))&&l1(i,a),r=(t.ownerDocument||t).createElement("link"),Jt(r);var s=r;return s._p=new Promise(function(o,l){s.onload=o,s.onerror=l}),re(r,"link",i),e.state.loading|=4,yc(r,n.precedence,t),e.instance=r;case"script":return r=ds(n.src),(a=t.querySelector(tl(r)))?(e.instance=a,Jt(a),a):(i=n,(a=cn.get(r))&&(i=Rt({},n),c1(i,a)),t=t.ownerDocument||t,a=t.createElement("script"),Jt(a),re(a,"link",i),t.head.appendChild(a),e.instance=a);case"void":return null;default:throw Error(_(443,e.type))}else e.type==="stylesheet"&&(e.state.loading&4)===0&&(i=e.instance,e.state.loading|=4,yc(i,n.precedence,t));return e.instance}function yc(t,e,n){for(var i=n.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),a=i.length?i[i.length-1]:null,r=a,s=0;s<i.length;s++){var o=i[s];if(o.dataset.precedence===e)r=o;else if(r!==a)break}r?r.parentNode.insertBefore(t,r.nextSibling):(e=n.nodeType===9?n.head:n,e.insertBefore(t,e.firstChild))}function l1(t,e){t.crossOrigin==null&&(t.crossOrigin=e.crossOrigin),t.referrerPolicy==null&&(t.referrerPolicy=e.referrerPolicy),t.title==null&&(t.title=e.title)}function c1(t,e){t.crossOrigin==null&&(t.crossOrigin=e.crossOrigin),t.referrerPolicy==null&&(t.referrerPolicy=e.referrerPolicy),t.integrity==null&&(t.integrity=e.integrity)}var xc=null;function hy(t,e,n){if(xc===null){var i=new Map,a=xc=new Map;a.set(n,i)}else a=xc,i=a.get(n),i||(i=new Map,a.set(n,i));if(i.has(t))return i;for(i.set(t,null),n=n.getElementsByTagName(t),a=0;a<n.length;a++){var r=n[a];if(!(r[qo]||r[ne]||t==="link"&&r.getAttribute("rel")==="stylesheet")&&r.namespaceURI!=="http://www.w3.org/2000/svg"){var s=r.getAttribute(e)||"";s=t+s;var o=i.get(s);o?o.push(r):i.set(s,[r])}}return i}function gy(t,e,n){t=t.ownerDocument||t,t.head.insertBefore(n,e==="title"?t.querySelector("head > title"):null)}function sb(t,e,n){if(n===1||e.itemProp!=null)return!1;switch(t){case"meta":case"title":return!0;case"style":if(typeof e.precedence!="string"||typeof e.href!="string"||e.href==="")break;return!0;case"link":if(typeof e.rel!="string"||typeof e.href!="string"||e.href===""||e.onLoad||e.onError)break;return e.rel==="stylesheet"?(t=e.disabled,typeof e.precedence=="string"&&t==null):!0;case"script":if(e.async&&typeof e.async!="function"&&typeof e.async!="symbol"&&!e.onLoad&&!e.onError&&e.src&&typeof e.src=="string")return!0}return!1}function t5(t){return!(t.type==="stylesheet"&&(t.state.loading&3)===0)}function ob(t,e,n,i){if(n.type==="stylesheet"&&(typeof i.media!="string"||matchMedia(i.media).matches!==!1)&&(n.state.loading&4)===0){if(n.instance===null){var a=is(i.href),r=e.querySelector(Wo(a));if(r){e=r._p,e!==null&&typeof e=="object"&&typeof e.then=="function"&&(t.count++,t=Gc.bind(t),e.then(t,t)),n.state.loading|=4,n.instance=r,Jt(r);return}r=e.ownerDocument||e,i=W6(i),(a=cn.get(a))&&l1(i,a),r=r.createElement("link"),Jt(r);var s=r;s._p=new Promise(function(o,l){s.onload=o,s.onerror=l}),re(r,"link",i),n.instance=r}t.stylesheets===null&&(t.stylesheets=new Map),t.stylesheets.set(n,e),(e=n.state.preload)&&(n.state.loading&3)===0&&(t.count++,n=Gc.bind(t),e.addEventListener("load",n),e.addEventListener("error",n))}}var kp=0;function lb(t,e){return t.stylesheets&&t.count===0&&vc(t,t.stylesheets),0<t.count||0<t.imgCount?function(n){var i=setTimeout(function(){if(t.stylesheets&&vc(t,t.stylesheets),t.unsuspend){var r=t.unsuspend;t.unsuspend=null,r()}},6e4+e);0<t.imgBytes&&kp===0&&(kp=62500*Uv());var a=setTimeout(function(){if(t.waitingForImages=!1,t.count===0&&(t.stylesheets&&vc(t,t.stylesheets),t.unsuspend)){var r=t.unsuspend;t.unsuspend=null,r()}},(t.imgBytes>kp?50:800)+e);return t.unsuspend=n,function(){t.unsuspend=null,clearTimeout(i),clearTimeout(a)}}:null}function Gc(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)vc(this,this.stylesheets);else if(this.unsuspend){var t=this.unsuspend;this.unsuspend=null,t()}}}var qc=null;function vc(t,e){t.stylesheets=null,t.unsuspend!==null&&(t.count++,qc=new Map,e.forEach(cb,t),qc=null,Gc.call(t))}function cb(t,e){if(!(e.state.loading&4)){var n=qc.get(t);if(n)var i=n.get(null);else{n=new Map,qc.set(t,n);for(var a=t.querySelectorAll("link[data-precedence],style[data-precedence]"),r=0;r<a.length;r++){var s=a[r];(s.nodeName==="LINK"||s.getAttribute("media")!=="not all")&&(n.set(s.dataset.precedence,s),i=s)}i&&n.set(null,i)}a=e.instance,s=a.getAttribute("data-precedence"),r=n.get(s)||i,r===i&&n.set(null,a),n.set(s,a),this.count++,i=Gc.bind(this),a.addEventListener("load",i),a.addEventListener("error",i),r?r.parentNode.insertBefore(a,r.nextSibling):(t=t.nodeType===9?t.head:t,t.insertBefore(a,t.firstChild)),e.state.loading|=4}}var jo={$$typeof:ei,Provider:null,Consumer:null,_currentValue:Ca,_currentValue2:Ca,_threadCount:0};function ub(t,e,n,i,a,r,s,o,l){this.tag=1,this.containerInfo=t,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=qd(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=qd(0),this.hiddenUpdates=qd(null),this.identifierPrefix=i,this.onUncaughtError=a,this.onCaughtError=r,this.onRecoverableError=s,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=l,this.incompleteTransitions=new Map}function e5(t,e,n,i,a,r,s,o,l,c,u,d){return t=new ub(t,e,n,s,l,c,u,d,o),e=1,r===!0&&(e|=24),r=$e(3,null,null,e),t.current=r,r.stateNode=t,e=Of(),e.refCount++,t.pooledCache=e,e.refCount++,r.memoizedState={element:i,isDehydrated:n,cache:e},Nf(r),t}function n5(t){return t?(t=Lr,t):Lr}function i5(t,e,n,i,a,r){a=n5(a),i.context===null?i.context=a:i.pendingContext=a,i=$i(e),i.payload={element:n},r=r===void 0?null:r,r!==null&&(i.callback=r),n=Ui(t,i,e),n!==null&&(Me(n,t,e),bo(n,t,e))}function my(t,e){if(t=t.memoizedState,t!==null&&t.dehydrated!==null){var n=t.retryLane;t.retryLane=n!==0&&n<e?n:e}}function u1(t,e){my(t,e),(t=t.alternate)&&my(t,e)}function a5(t){if(t.tag===13||t.tag===31){var e=La(t,67108864);e!==null&&Me(e,t,67108864),u1(t,67108864)}}function yy(t){if(t.tag===13||t.tag===31){var e=Ge();e=kf(e);var n=La(t,e);n!==null&&Me(n,t,e),u1(t,e)}}var Xc=!0;function db(t,e,n,i){var a=V.T;V.T=null;var r=ht.p;try{ht.p=2,d1(t,e,n,i)}finally{ht.p=r,V.T=a}}function pb(t,e,n,i){var a=V.T;V.T=null;var r=ht.p;try{ht.p=8,d1(t,e,n,i)}finally{ht.p=r,V.T=a}}function d1(t,e,n,i){if(Xc){var a=mf(i);if(a===null)vp(t,e,i,Kc,n),xy(t,i);else if(hb(a,t,e,n,i))i.stopPropagation();else if(xy(t,i),e&4&&-1<fb.indexOf(t)){for(;a!==null;){var r=ss(a);if(r!==null)switch(r.tag){case 3:if(r=r.stateNode,r.current.memoizedState.isDehydrated){var s=ka(r.pendingLanes);if(s!==0){var o=r;for(o.pendingLanes|=2,o.entangledLanes|=2;s;){var l=1<<31-Ve(s);o.entanglements[1]|=l,s&=~l}Fn(r),(ft&6)===0&&(Nc=He()+500,Jo(0,!1))}}break;case 31:case 13:o=La(r,2),o!==null&&Me(o,r,2),lu(),u1(r,2)}if(r=mf(i),r===null&&vp(t,e,i,Kc,n),r===a)break;a=r}a!==null&&i.stopPropagation()}else vp(t,e,i,null,n)}}function mf(t){return t=Sf(t),p1(t)}var Kc=null;function p1(t){if(Kc=null,t=Rr(t),t!==null){var e=Ho(t);if(e===null)t=null;else{var n=e.tag;if(n===13){if(t=Cy(e),t!==null)return t;t=null}else if(n===31){if(t=Sy(e),t!==null)return t;t=null}else if(n===3){if(e.stateNode.current.memoizedState.isDehydrated)return e.tag===3?e.stateNode.containerInfo:null;t=null}else e!==t&&(t=null)}}return Kc=t,null}function r5(t){switch(t){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(t9()){case _y:return 2;case By:return 8;case Cc:case e9:return 32;case Ry:return 268435456;default:return 32}default:return 32}}var yf=!1,Vi=null,Gi=null,qi=null,$o=new Map,Uo=new Map,Ii=[],fb="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function xy(t,e){switch(t){case"focusin":case"focusout":Vi=null;break;case"dragenter":case"dragleave":Gi=null;break;case"mouseover":case"mouseout":qi=null;break;case"pointerover":case"pointerout":$o.delete(e.pointerId);break;case"gotpointercapture":case"lostpointercapture":Uo.delete(e.pointerId)}}function lo(t,e,n,i,a,r){return t===null||t.nativeEvent!==r?(t={blockedOn:e,domEventName:n,eventSystemFlags:i,nativeEvent:r,targetContainers:[a]},e!==null&&(e=ss(e),e!==null&&a5(e)),t):(t.eventSystemFlags|=i,e=t.targetContainers,a!==null&&e.indexOf(a)===-1&&e.push(a),t)}function hb(t,e,n,i,a){switch(e){case"focusin":return Vi=lo(Vi,t,e,n,i,a),!0;case"dragenter":return Gi=lo(Gi,t,e,n,i,a),!0;case"mouseover":return qi=lo(qi,t,e,n,i,a),!0;case"pointerover":var r=a.pointerId;return $o.set(r,lo($o.get(r)||null,t,e,n,i,a)),!0;case"gotpointercapture":return r=a.pointerId,Uo.set(r,lo(Uo.get(r)||null,t,e,n,i,a)),!0}return!1}function s5(t){var e=Rr(t.target);if(e!==null){var n=Ho(e);if(n!==null){if(e=n.tag,e===13){if(e=Cy(n),e!==null){t.blockedOn=e,em(t.priority,function(){yy(n)});return}}else if(e===31){if(e=Sy(n),e!==null){t.blockedOn=e,em(t.priority,function(){yy(n)});return}}else if(e===3&&n.stateNode.current.memoizedState.isDehydrated){t.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}t.blockedOn=null}function bc(t){if(t.blockedOn!==null)return!1;for(var e=t.targetContainers;0<e.length;){var n=mf(t.nativeEvent);if(n===null){n=t.nativeEvent;var i=new n.constructor(n.type,n);Fp=i,n.target.dispatchEvent(i),Fp=null}else return e=ss(n),e!==null&&a5(e),t.blockedOn=n,!1;e.shift()}return!0}function vy(t,e,n){bc(t)&&n.delete(e)}function gb(){yf=!1,Vi!==null&&bc(Vi)&&(Vi=null),Gi!==null&&bc(Gi)&&(Gi=null),qi!==null&&bc(qi)&&(qi=null),$o.forEach(vy),Uo.forEach(vy)}function ac(t,e){t.blockedOn===e&&(t.blockedOn=null,yf||(yf=!0,Xt.unstable_scheduleCallback(Xt.unstable_NormalPriority,gb)))}var rc=null;function by(t){rc!==t&&(rc=t,Xt.unstable_scheduleCallback(Xt.unstable_NormalPriority,function(){rc===t&&(rc=null);for(var e=0;e<t.length;e+=3){var n=t[e],i=t[e+1],a=t[e+2];if(typeof i!="function"){if(p1(i||n)===null)continue;break}var r=ss(n);r!==null&&(t.splice(e,3),e-=3,Zp(r,{pending:!0,data:a,method:n.method,action:i},i,a))}}))}function as(t){function e(l){return ac(l,t)}Vi!==null&&ac(Vi,t),Gi!==null&&ac(Gi,t),qi!==null&&ac(qi,t),$o.forEach(e),Uo.forEach(e);for(var n=0;n<Ii.length;n++){var i=Ii[n];i.blockedOn===t&&(i.blockedOn=null)}for(;0<Ii.length&&(n=Ii[0],n.blockedOn===null);)s5(n),n.blockedOn===null&&Ii.shift();if(n=(t.ownerDocument||t).$$reactFormReplay,n!=null)for(i=0;i<n.length;i+=3){var a=n[i],r=n[i+1],s=a[_e]||null;if(typeof r=="function")s||by(n);else if(s){var o=null;if(r&&r.hasAttribute("formAction")){if(a=r,s=r[_e]||null)o=s.formAction;else if(p1(a)!==null)continue}else o=s.action;typeof o=="function"?n[i+1]=o:(n.splice(i,3),i-=3),by(n)}}}function o5(){function t(r){r.canIntercept&&r.info==="react-transition"&&r.intercept({handler:function(){return new Promise(function(s){return a=s})},focusReset:"manual",scroll:"manual"})}function e(){a!==null&&(a(),a=null),i||setTimeout(n,20)}function n(){if(!i&&!navigation.transition){var r=navigation.currentEntry;r&&r.url!=null&&navigation.navigate(r.url,{state:r.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var i=!1,a=null;return navigation.addEventListener("navigate",t),navigation.addEventListener("navigatesuccess",e),navigation.addEventListener("navigateerror",e),setTimeout(n,100),function(){i=!0,navigation.removeEventListener("navigate",t),navigation.removeEventListener("navigatesuccess",e),navigation.removeEventListener("navigateerror",e),a!==null&&(a(),a=null)}}}function f1(t){this._internalRoot=t}du.prototype.render=f1.prototype.render=function(t){var e=this._internalRoot;if(e===null)throw Error(_(409));var n=e.current,i=Ge();i5(n,i,t,e,null,null)};du.prototype.unmount=f1.prototype.unmount=function(){var t=this._internalRoot;if(t!==null){this._internalRoot=null;var e=t.containerInfo;i5(t.current,2,null,t,null,null),lu(),e[rs]=null}};function du(t){this._internalRoot=t}du.prototype.unstable_scheduleHydration=function(t){if(t){var e=zy();t={blockedOn:null,target:t,priority:e};for(var n=0;n<Ii.length&&e!==0&&e<Ii[n].priority;n++);Ii.splice(n,0,t),n===0&&s5(t)}};var ky=Ey.version;if(ky!=="19.2.6")throw Error(_(527,ky,"19.2.6"));ht.findDOMNode=function(t){var e=t._reactInternals;if(e===void 0)throw typeof t.render=="function"?Error(_(188)):(t=Object.keys(t).join(","),Error(_(268,t)));return t=q7(e),t=t!==null?Ay(t):null,t=t===null?null:t.stateNode,t};var mb={bundleType:0,version:"19.2.6",rendererPackageName:"react-dom",currentDispatcherRef:V,reconcilerVersion:"19.2.6"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(co=__REACT_DEVTOOLS_GLOBAL_HOOK__,!co.isDisabled&&co.supportsFiber))try{Yo=co.inject(mb),Ye=co}catch{}var co;pu.createRoot=function(t,e){if(!wy(t))throw Error(_(299));var n=!1,i="",a=J2,r=W2,s=t6;return e!=null&&(e.unstable_strictMode===!0&&(n=!0),e.identifierPrefix!==void 0&&(i=e.identifierPrefix),e.onUncaughtError!==void 0&&(a=e.onUncaughtError),e.onCaughtError!==void 0&&(r=e.onCaughtError),e.onRecoverableError!==void 0&&(s=e.onRecoverableError)),e=e5(t,1,!1,null,null,n,i,null,a,r,s,o5),t[rs]=e.current,o1(t),new f1(e)};pu.hydrateRoot=function(t,e,n){if(!wy(t))throw Error(_(299));var i=!1,a="",r=J2,s=W2,o=t6,l=null;return n!=null&&(n.unstable_strictMode===!0&&(i=!0),n.identifierPrefix!==void 0&&(a=n.identifierPrefix),n.onUncaughtError!==void 0&&(r=n.onUncaughtError),n.onCaughtError!==void 0&&(s=n.onCaughtError),n.onRecoverableError!==void 0&&(o=n.onRecoverableError),n.formState!==void 0&&(l=n.formState)),e=e5(t,1,!0,e,n??null,i,a,l,r,s,o,o5),e.context=n5(null),n=e.current,i=Ge(),i=kf(i),a=$i(i),a.callback=null,Ui(n,a,i),n=i,e.current.lanes=n,Go(e,n),Fn(e),t[rs]=e.current,o1(t),new du(e)};pu.version="19.2.6"});var d5=An((DT,u5)=>{"use strict";function c5(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(c5)}catch(t){console.error(t)}}c5(),u5.exports=l5()});var i4=An(wu=>{"use strict";var ME=Symbol.for("react.transitional.element"),_E=Symbol.for("react.fragment");function n4(t,e,n){var i=null;if(n!==void 0&&(i=""+n),e.key!==void 0&&(i=""+e.key),"key"in e){n={};for(var a in e)a!=="key"&&(n[a]=e[a])}else n=e;return e=n.ref,{$$typeof:ME,type:t,key:i,ref:e!==void 0?e:null,props:n}}wu.Fragment=_E;wu.jsx=n4;wu.jsxs=n4});var yi=An((LM,a4)=>{"use strict";a4.exports=i4()});var uA={};wi(uA,{TraceMindPlugin:()=>Lu,default:()=>cA});module.exports=y8(uA);var Ke=require("obsidian");var lt=require("obsidian");var yh={providers:[],defaultProviderId:"",agentProviderMapping:{analysis:"",chat:""},localAgentEnabled:!1,exploration:{enabled:!1,availableAgents:[],defaultAgent:""},actionBoard:{enabled:!0,defaultAgent:""}};function wl(t,e){return!(!t.exploration.enabled||t.exploration.availableAgents.length===0||!t.exploration.defaultAgent||e&&!e.features.includes("exploration"))}Ci();var b8=[{test:t=>t.includes("API Key")||t.includes("Invalid API key")||t.includes("invalid x-api-key")||t.includes("Incorrect API key"),prefix:"API Key \u65E0\u6548\u6216\u672A\u914D\u7F6E\uFF0C\u8BF7\u68C0\u67E5 API Key \u662F\u5426\u6B63\u786E"},{test:t=>t.includes("401"),prefix:"\u8BA4\u8BC1\u5931\u8D25 (HTTP 401)\uFF0C\u8BF7\u68C0\u67E5 API Key \u548C\u6743\u9650"},{test:t=>t.includes("403"),prefix:"\u6743\u9650\u4E0D\u8DB3 (HTTP 403)\uFF0C\u8BF7\u68C0\u67E5 API Key \u662F\u5426\u6709\u8BBF\u95EE\u6743\u9650"},{test:t=>t.includes("429"),prefix:"\u8BF7\u6C42\u9891\u7387\u8D85\u9650 (HTTP 429)\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u6216\u68C0\u67E5 API \u989D\u5EA6"},{test:t=>t.includes("model")&&(t.includes("not found")||t.includes("does not exist")||t.includes("\u6A21\u578B")),prefix:"\u6A21\u578B\u540D\u79F0\u65E0\u6548\u6216\u4E0D\u53EF\u7528\uFF0C\u8BF7\u68C0\u67E5\u6A21\u578B\u540D\u79F0\u662F\u5426\u6B63\u786E"},{test:t=>(t.includes("fetch failed")||t.includes("Failed to fetch")||t.includes("ENOTFOUND")||t.includes("ECONNREFUSED"))&&(t.includes("localhost:11434")||t.includes("127.0.0.1:11434")),prefix:"\u65E0\u6CD5\u8FDE\u63A5 Ollama\uFF0C\u8BF7\u786E\u8BA4 Ollama \u5DF2\u542F\u52A8 (localhost:11434)"},{test:t=>t.includes("fetch failed")||t.includes("Failed to fetch")||t.includes("ENOTFOUND")||t.includes("ECONNREFUSED"),prefix:"\u7F51\u7EDC\u8FDE\u63A5\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5 Base URL \u548C\u7F51\u7EDC\u8FDE\u63A5"},{test:t=>t.includes("timeout")||t.includes("ETIMEDOUT"),prefix:"\u8FDE\u63A5\u8D85\u65F6\uFF0C\u8BF7\u68C0\u67E5\u7F51\u7EDC\u6216 Base URL \u662F\u5426\u6B63\u786E"}];function vh(t){let e=t instanceof Error?t.message:String(t);for(let n of b8)if(n.test(e))return`${n.prefix}
(${e.slice(0,150)})`;return`\u8FDE\u63A5\u5931\u8D25: ${e.slice(0,200)}`}function bh(t,e,n){let i=t.providers.map(a=>a.id===e?{...a,...n,id:e}:a);return{...t,providers:i}}function kh(t,e){let n=t.providers.filter(r=>r.id!==e),i=t.defaultProviderId;i===e&&(i=n[0]?.id||"");let a={...t.agentProviderMapping};return a.analysis===e&&(a.analysis=""),a.chat===e&&(a.chat=""),{...t,providers:n,defaultProviderId:i,agentProviderMapping:a}}sd();mr();var{spawn:_8}=require("child_process"),Ah="codex",B8=600*1e3;function R8(t,e){let n=["exec","--skip-git-repo-check"];return e?.model&&n.push("--model",e.model),n.push(t),n}var Th={name:"Codex",description:"OpenAI Codex CLI\uFF0C\u672C\u5730\u6267\u884C\u601D\u8003\u63A2\u7D22 Agent action",async detect(){return!!await ge(Ah)},execute(t,e){let n=null,i=!1,a=null,r=null,s=null,o=Date.now();return(async()=>{try{let c=await ge(Ah);if(!c){let x=new Error("\u627E\u4E0D\u5230 codex CLI\uFF0C\u8BF7\u786E\u8BA4\u5DF2\u5B89\u88C5 Codex");s?.(x),r?.({status:"failed",output:"",error:x.message,durationMs:Date.now()-o});return}let u=R8(t,e),d={...process.env,...e?.env};if(n=_8(c,u,{cwd:e?.cwd||process.cwd(),env:d,stdio:["ignore","pipe","pipe"]}),i){n.kill();return}let p=setTimeout(()=>{n&&!n.killed&&(n.kill(),r?.({status:"timeout",output:"",error:"\u6267\u884C\u8D85\u65F6",durationMs:Date.now()-o}))},e?.timeoutMs||B8),f="",y="";n.stdout?.on("data",x=>{let E=x.toString();f+=E,a?.({type:"text",content:E})}),n.stderr?.on("data",x=>{y+=x.toString()}),n.on("error",x=>{clearTimeout(p),s?.(x),r?.({status:"failed",output:f,error:x.message,durationMs:Date.now()-o})}),n.on("close",x=>{clearTimeout(p),!i&&r?.(x===0?{status:"completed",output:f.trim(),durationMs:Date.now()-o}:{status:"failed",output:f.trim(),error:`codex \u9000\u51FA\u7801 ${x}: ${y.slice(0,500)}`,durationMs:Date.now()-o})})}catch(c){s?.(c),r?.({status:"failed",output:"",error:c.message,durationMs:Date.now()-o})}})(),{set onMessage(c){a=c},get onMessage(){return a},set onDone(c){r=c},get onDone(){return r},set onError(c){s=c},get onError(){return s},abort(){i=!0,n&&!n.killed&&n.kill()}}}};ld();mr();var{spawn:O8}=require("child_process"),z8=require("readline"),Si=require("fs"),Ys=require("path"),Bh="opencode",L8=600*1e3;function N8(t,e){let n=["run","--format","json"];return e?.model&&n.push("--model",e.model),n.push(t),n}function P8(t,e,n){let i=t.trim();if(!e||cd(i))return i;if(!i){let o=j8(e,n);return o||i}let a=H8(i);if(!a)return i;let r=Ys.resolve(e,a),s=Ys.resolve(e);if(r!==s&&!r.startsWith(`${s}${Ys.sep}`)||!Si.existsSync(r)||!Si.statSync(r).isFile())return i;try{let o=Si.readFileSync(r,"utf-8").trim();return cd(o)?o:i}catch{return i}}function j8(t,e){let n=Ys.resolve(t),i=$8(n).filter(a=>U8(a)).map(a=>Ys.join(n,a)).filter(a=>{try{let r=Si.statSync(a);return r.isFile()?typeof e!="number"||r.mtimeMs>=e-1e3:!1}catch{return!1}}).sort((a,r)=>Si.statSync(r).mtimeMs-Si.statSync(a).mtimeMs);for(let a of i)try{let r=Si.readFileSync(a,"utf-8").trim();if(cd(r))return r}catch{continue}return null}function $8(t){try{return Si.readdirSync(t)}catch{return[]}}function U8(t){return/(?:^|[-_])(output|result)\.json$/i.test(t)||/^(decision_tree|brainstorm|brainstorming|mind_map|mindmap|user_map|frame_problem|tracemind)[\w.-]*\.json$/i.test(t)}function cd(t){return t.startsWith("{")||t.startsWith("```json")||t.startsWith("```")}function H8(t){return[...t.matchAll(/`([^`]+\.json)`|([\w./-]+\.json)/gi)].map(n=>n[1]||n[2]).filter(Boolean)[0]||null}function Y8(t){let e=t.part;return!e||e.type!=="text"||typeof e.text!="string"?"":e.text}var Rh={name:"OpenCode",description:"OpenCode \u672C\u5730 Agent\uFF0C\u901A\u8FC7 opencode CLI \u8C03\u7528",async detect(){return!!await ge(Bh)},execute(t,e){let n=null,i=!1,a=null,r=null,s=null,o=Date.now();return(async()=>{try{let c=await ge(Bh);if(!c){let h=new Error("\u627E\u4E0D\u5230 opencode CLI\uFF0C\u8BF7\u786E\u8BA4\u5DF2\u5B89\u88C5 OpenCode");s?.(h),r?.({status:"failed",output:"",error:h.message,durationMs:Date.now()-o});return}let u={...process.env,...e?.env},d=N8(t,e);if(n=O8(c,d,{cwd:e?.cwd||process.cwd(),env:u,stdio:["ignore","pipe","pipe"]}),i){n.kill();return}let p="",f="",y=!1,x=h=>{y||(y=!0,r?.(h))},E=setTimeout(()=>{n&&!n.killed&&n.kill(),x({status:"timeout",output:p.trim(),error:"\u6267\u884C\u8D85\u65F6",durationMs:Date.now()-o})},e?.timeoutMs||L8);z8.createInterface({input:n.stdout,crlfDelay:1/0}).on("line",h=>{let b=h.trim();if(b)try{let w=JSON.parse(b),B=Y8(w);w.sessionID&&a?.({type:"status",content:w.type||"running",sessionId:w.sessionID}),B?(p+=B,a?.({type:"text",content:B})):w.part?.type==="tool"?a?.({type:"tool-use",toolName:w.part.title||w.part.command||"opencode-tool"}):w.error&&a?.({type:"error",content:w.error})}catch{p+=h+`
`,a?.({type:"text",content:h+`
`})}}),n.stderr?.on("data",h=>{f+=h.toString()}),n.on("error",h=>{clearTimeout(E),s?.(h),x({status:"failed",output:p.trim(),error:h.message,durationMs:Date.now()-o})}),n.on("close",h=>{clearTimeout(E),!i&&x(h===0?{status:"completed",output:P8(p,e?.cwd,o),durationMs:Date.now()-o}:{status:"failed",output:p.trim(),error:`opencode \u9000\u51FA\u7801 ${h}: ${f.slice(0,500)}`,durationMs:Date.now()-o})})}catch(c){s?.(c),r?.({status:"failed",output:"",error:c.message,durationMs:Date.now()-o})}})(),{set onMessage(c){a=c},get onMessage(){return a},set onDone(c){r=c},get onDone(){return r},set onError(c){s=c},get onError(){return s},abort(){i=!0,n&&!n.killed&&n.kill()}}}};mr();var{spawn:V8}=require("child_process"),G8=require("readline"),Dh="pi",q8=600*1e3;function X8(t,e){let n=["--mode","json"];return e?.model&&n.push("--model",e.model),n.push(t),n}function K8(t){return typeof t=="string"?t:Array.isArray(t)?t.map(e=>{if(typeof e=="string")return e;if(!e||typeof e!="object")return"";let n=e;return typeof n.text=="string"?n.text:typeof n.content=="string"?n.content:""}).join(""):""}function Z8(t){let e=t.assistantMessageEvent;return t.type==="message_update"&&e?.type==="text_delta"&&typeof e.delta=="string"?e.delta:t.type==="message_update"&&typeof e?.text=="string"?e.text:(t.type==="message_end"||t.type==="turn_end")&&t.message?.role==="assistant"?K8(t.message.content):""}var Ih={name:"Pi Agent",description:"Pi minimal terminal coding harness\uFF0C\u901A\u8FC7 pi CLI JSON event stream \u8C03\u7528",async detect(){return!!await ge(Dh)},execute(t,e){let n=null,i=!1,a=null,r=null,s=null,o=Date.now();return(async()=>{try{let c=await ge(Dh);if(!c){let b=new Error("\u627E\u4E0D\u5230 pi CLI\uFF0C\u8BF7\u786E\u8BA4\u5DF2\u5B89\u88C5 Pi Agent");s?.(b),r?.({status:"failed",output:"",error:b.message,durationMs:Date.now()-o});return}let u=ad(e?.env),d=X8(t,e);if(n=V8(c,d,{cwd:e?.cwd||process.cwd(),env:u,stdio:["ignore","pipe","pipe"]}),i){n.kill();return}let p="",f="",y=!1,x=!1,E=b=>{x||(x=!0,r?.(b))},v=setTimeout(()=>{n&&!n.killed&&n.kill(),E({status:"timeout",output:p.trim(),error:"\u6267\u884C\u8D85\u65F6",durationMs:Date.now()-o})},e?.timeoutMs||q8);G8.createInterface({input:n.stdout,crlfDelay:1/0}).on("line",b=>{let w=b.trim();if(w)try{let B=JSON.parse(w);if(B.type==="session"&&B.id){a?.({type:"status",content:"session",sessionId:B.id});return}if(B.type==="agent_start"||B.type==="turn_start"){a?.({type:"status",content:B.type});return}if(B.type==="tool_execution_start"){a?.({type:"tool-use",toolName:B.toolName||"pi-tool",toolInput:B.args});return}if(B.type==="tool_execution_end"){a?.({type:B.isError?"error":"tool-result",toolName:B.toolName||"pi-tool"});return}let j=Z8(B);j&&(B.type==="message_update"?(y=!0,p+=j,a?.({type:"text",content:j})):!y&&!p.trim()&&(p+=j,a?.({type:"text",content:j}))),B.errorMessage&&a?.({type:"error",content:B.errorMessage})}catch{p+=b+`
`,a?.({type:"text",content:b+`
`})}}),n.stderr?.on("data",b=>{f+=b.toString()}),n.on("error",b=>{clearTimeout(v),s?.(b),E({status:"failed",output:p.trim(),error:b.message,durationMs:Date.now()-o})}),n.on("close",b=>{clearTimeout(v),!i&&E(b===0?{status:"completed",output:p.trim(),durationMs:Date.now()-o}:{status:"failed",output:p.trim(),error:`pi \u9000\u51FA\u7801 ${b}: ${f.slice(0,500)}`,durationMs:Date.now()-o})})}catch(c){s?.(c),r?.({status:"failed",output:"",error:c.message,durationMs:Date.now()-o})}})(),{set onMessage(c){a=c},get onMessage(){return a},set onDone(c){r=c},get onDone(){return r},set onError(c){s=c},get onError(){return s},abort(){i=!0,n&&!n.killed&&n.kill()}}}};var yr=[{key:"codex",provider:Th},{key:"claude-code",provider:rd},{key:"hermes",provider:od},{key:"opencode",provider:Rh},{key:"pi",provider:Ih}];function Fh(t){return yr.find(e=>e.key===t)?.provider||null}async function Oh(){let t=[];for(let e of yr)await e.provider.detect()&&t.push(e.key);return t}Ci();var Al=class extends lt.PluginSettingTab{plugin;constructor(e,n){super(e,n),this.plugin=n}display(){let{containerEl:e}=this;e.empty(),e.createEl("h2",{text:"TraceMind \u8BBE\u7F6E"}),e.createEl("h3",{text:"AI Provider"});let n="",i="",a="",r="",s=!1,o="",l="openai";new lt.Setting(e).setName("Provider \u7C7B\u578B").setDesc("\u9009\u62E9 API \u683C\u5F0F").addDropdown(f=>{f.addOption("openai","OpenAI-compatible").addOption("anthropic","Anthropic").addOption("ollama","Ollama").addOption("custom","Custom").setValue("openai").onChange(y=>{l=y})}),new lt.Setting(e).setName("\u540D\u79F0").setDesc("Provider \u663E\u793A\u540D\u79F0").addText(f=>{f.setPlaceholder("My GPT-4").onChange(y=>{n=y})}),new lt.Setting(e).setName("\u6A21\u578B").setDesc("\u6A21\u578B\u540D\u79F0\uFF0C\u5982 gpt-4\u3001qwen-plus").addText(f=>{f.setPlaceholder("gpt-4").onChange(y=>{i=y})}),new lt.Setting(e).setName("Base URL").setDesc("OpenAI \u517C\u5BB9 API \u5730\u5740").addText(f=>{f.setPlaceholder("https://api.openai.com/v1").onChange(y=>{a=y})}),new lt.Setting(e).setName("API Key").setDesc("API \u5BC6\u94A5").addText(f=>{f.setPlaceholder("").onChange(y=>{r=y}),f.inputEl.type="password"}),new lt.Setting(e).setName("\u601D\u8003\u6A21\u5F0F").setDesc("\u5F00\u542F\u540E\u4F1A\u6309\u5F53\u524D Provider \u7C7B\u578B\u9644\u52A0\u601D\u8003/\u63A8\u7406\u53C2\u6570\uFF1B\u4EC5\u90E8\u5206\u6A21\u578B\u652F\u6301").addToggle(f=>{f.setValue(s).onChange(y=>{s=y})}),new lt.Setting(e).setName("Reasoning Effort").setDesc("\u90E8\u5206\u6A21\u578B\u652F\u6301 high \u6216 max").addDropdown(f=>{f.addOption("","\u9ED8\u8BA4").addOption("high","high").addOption("max","max").setValue(o).onChange(y=>{o=y})}),new lt.Setting(e).addButton(f=>{f.setButtonText("\u6DFB\u52A0 Provider"),f.setCta(),f.onClick(async()=>{if(!n||!i||!a){new lt.Notice("\u8BF7\u586B\u5199\u540D\u79F0\u3001\u6A21\u578B\u548C Base URL");return}let y=`provider-${Date.now()}`;this.plugin.settings.providers.push({id:y,name:n,providerType:l,model:i,baseUrl:a,apiKey:r,enableThinking:s,reasoningEffort:o}),await this.plugin.saveSettings(),this.display(),new lt.Notice("Provider \u5DF2\u6DFB\u52A0")})});for(let f=0;f<this.plugin.settings.providers.length;f++){let y=this.plugin.settings.providers[f],x=this.plugin.settings.defaultProviderId===y.id;this.renderProviderRow(e,y,x)}this.plugin.settings.providers.length===0&&e.createEl("p",{text:"\u6682\u65E0 Provider\uFF0C\u8BF7\u6DFB\u52A0\u4E00\u4E2A",cls:"lifewiki-no-providers"}),e.createEl("h3",{text:"Agent \u914D\u7F6E"});let c=this.plugin.settings.agentProviderMapping,u={};for(let f of this.plugin.settings.providers)u[f.id]=f.name;new lt.Setting(e).setName("AI \u5206\u6790").setDesc("\u65E5\u8BB0\u5206\u6790\u4F7F\u7528\u7684 AI Provider").addDropdown(f=>{f.addOption("","\u4F7F\u7528\u9ED8\u8BA4 Provider");for(let[y,x]of Object.entries(u))f.addOption(y,x);f.setValue(c.analysis).onChange(async y=>{this.plugin.settings.agentProviderMapping.analysis=y,await this.plugin.saveSettings()})}),new lt.Setting(e).setName("AI \u804A\u5929").setDesc("\u804A\u5929\u4F7F\u7528\u7684 AI Provider").addDropdown(f=>{f.addOption("","\u4F7F\u7528\u9ED8\u8BA4 Provider");for(let[y,x]of Object.entries(u))f.addOption(y,x);f.setValue(c.chat).onChange(async y=>{this.plugin.settings.agentProviderMapping.chat=y,await this.plugin.saveSettings()})}),e.createEl("h3",{text:"\u601D\u8003\u63A2\u7D22"}),e.createEl("p",{text:"\u601D\u8003\u63A2\u7D22\u662F\u4E00\u4E2A\u6C89\u6D78\u5F0F\u767D\u677F\u5DE5\u4F5C\u7A7A\u95F4\uFF0C\u53EF\u4EE5\u4ECE\u65E5\u8BB0 block \u8FDB\u5165\uFF0C\u8BA9\u672C\u5730 Agent \u5E2E\u4F60\u8FFD\u95EE\u3001\u53D1\u6563\u548C\u63A8\u6F14\u3002",cls:"setting-item-description"});let d=null;new lt.Setting(e).setName("\u542F\u7528\u601D\u8003\u63A2\u7D22").setDesc("\u5F00\u542F\u540E\uFF0C\u5728\u65E5\u8BB0\u89C6\u56FE\u4E2D\u53EF\u9009\u62E9 block \u5E76\u8FDB\u5165\u601D\u8003\u63A2\u7D22\u767D\u677F").addToggle(f=>{f.setValue(this.plugin.settings.exploration.enabled).onChange(async y=>{this.plugin.settings.exploration.enabled=y,await this.plugin.saveSettings(),y?(d||(d=e.createEl("div",{cls:"tracemind-agent-status"})),this.detectAndShowExplorationAgents(d)):d?.empty()})}),this.plugin.settings.exploration.enabled&&(d=e.createEl("div",{cls:"tracemind-agent-status"}),this.detectAndShowExplorationAgents(d)),e.createEl("h3",{text:"\u884C\u52A8\u770B\u677F"}),e.createEl("p",{text:"\u884C\u52A8\u770B\u677F\u7528\u4E8E\u628A\u65E5\u8BB0\u548C AI \u5BF9\u8BDD\u4E2D\u7684\u60F3\u6CD5\u8F6C\u6210\u53EF\u6267\u884C\u4EFB\u52A1\uFF0C\u5E76\u53EF\u4EA4\u7ED9\u672C\u5730 Agent \u6267\u884C\u3002",cls:"setting-item-description"}),new lt.Setting(e).setName("\u542F\u7528\u884C\u52A8\u770B\u677F").setDesc("\u5F00\u542F\u540E\uFF0C\u65E5\u8BB0\u4E3B\u89C6\u56FE\u4F1A\u663E\u793A\u884C\u52A8\u770B\u677F\u5165\u53E3\uFF0CAI \u5BF9\u8BDD\u53EF\u751F\u6210\u4EFB\u52A1\u8349\u7A3F").addToggle(f=>{f.setValue(this.plugin.settings.actionBoard?.enabled??!0).onChange(async y=>{this.plugin.settings.actionBoard={...this.plugin.settings.actionBoard||{defaultAgent:""},enabled:y},await this.plugin.saveSettings()})}),new lt.Setting(e).setName("\u9ED8\u8BA4\u4EFB\u52A1\u6267\u884C Agent").setDesc("\u4EFB\u52A1\u8BE6\u60C5\u4E2D\u6267\u884C\u4EFB\u52A1\u65F6\u9ED8\u8BA4\u4F7F\u7528\u7684\u672C\u5730 Agent").addDropdown(f=>{f.addOption("","\u8DDF\u968F\u601D\u8003\u63A2\u7D22\u9ED8\u8BA4 Agent");let y=this.plugin.settings.exploration.availableAgents||[];for(let x of y){let E=yr.find(v=>v.key===x);f.addOption(x,E?.provider.name||x)}f.setValue(this.plugin.settings.actionBoard?.defaultAgent||"").onChange(async x=>{this.plugin.settings.actionBoard={enabled:this.plugin.settings.actionBoard?.enabled??!0,defaultAgent:x},await this.plugin.saveSettings()})});let p=document.createElement("style");p.textContent=`
			.tracemind-agent-status { margin: 0 0 16px 0; display: flex; flex-direction: column; gap: 6px; }
			.tracemind-agent-row { display: flex; align-items: center; gap: 8px; font-size: 13px; }
			.tracemind-agent-dot { font-size: 12px; }
			.tracemind-agent-label { color: var(--text-muted); }
			.tracemind-agent-dot.available + .tracemind-agent-label { color: var(--text-normal); }
		`,e.appendChild(p)}editingProviderId=null;editDraft=null;renderProviderRow(e,n,i){let a=this.editingProviderId===n.id,r=a?this.editDraft:n,s=new lt.Setting(e).setName(`${r.name}${i?" (\u9ED8\u8BA4)":""}`).setDesc(`[${r.providerType||"openai"}] ${r.baseUrl} / ${r.model}${r.enableThinking?" / thinking:on":""}${r.reasoningEffort?` / reasoning:${r.reasoningEffort}`:""}`);if(s.addToggle(o=>{o.setTooltip("\u8BBE\u4E3A\u9ED8\u8BA4").setValue(i).onChange(async l=>{l&&(this.plugin.settings.defaultProviderId=n.id),await this.plugin.saveSettings(),this.display()})}),a){new lt.Setting(e).setName("\u540D\u79F0").addText(l=>l.setValue(r.name).onChange(c=>{this.editDraft.name=c})),new lt.Setting(e).setName("Provider \u7C7B\u578B").addDropdown(l=>{l.addOption("openai","OpenAI-compatible").addOption("anthropic","Anthropic").addOption("ollama","Ollama").addOption("custom","Custom").setValue(r.providerType).onChange(c=>{this.editDraft.providerType=c})}),new lt.Setting(e).setName("\u6A21\u578B").addText(l=>l.setValue(r.model).onChange(c=>{this.editDraft.model=c})),new lt.Setting(e).setName("Base URL").addText(l=>l.setValue(r.baseUrl).onChange(c=>{this.editDraft.baseUrl=c})),new lt.Setting(e).setName("API Key").addText(l=>{l.setValue(r.apiKey).onChange(c=>{this.editDraft.apiKey=c}),l.inputEl.type="password"}),new lt.Setting(e).setName("\u601D\u8003\u6A21\u5F0F").addToggle(l=>l.setValue(r.enableThinking??!1).onChange(c=>{this.editDraft.enableThinking=c})),new lt.Setting(e).setName("Reasoning Effort").addDropdown(l=>{l.addOption("","\u9ED8\u8BA4").addOption("high","high").addOption("max","max").setValue(r.reasoningEffort||"").onChange(c=>{this.editDraft.reasoningEffort=c})});let o=new lt.Setting(e);o.addButton(l=>{l.setButtonText("\u4FDD\u5B58").setCta().onClick(async()=>{let c=this.editDraft;if(!c.name.trim()||!c.model.trim()||!c.baseUrl.trim()){new lt.Notice("\u540D\u79F0\u3001\u6A21\u578B\u548C Base URL \u4E0D\u80FD\u4E3A\u7A7A");return}this.plugin.settings=bh(this.plugin.settings,n.id,c),await this.plugin.saveSettings(),this.editingProviderId=null,this.editDraft=null,this.display(),new lt.Notice("Provider \u5DF2\u66F4\u65B0")})}),o.addButton(l=>{l.setButtonText("\u53D6\u6D88").onClick(()=>{this.editingProviderId=null,this.editDraft=null,this.display()})})}else s.addButton(o=>{o.setButtonText("\u7F16\u8F91").onClick(()=>{this.editingProviderId=n.id,this.editDraft={...n},this.display()})}),s.addButton(o=>{o.setButtonText("\u6D4B\u8BD5").onClick(async()=>{new lt.Notice("\u6B63\u5728\u6D4B\u8BD5...");try{let l=await Cl([{role:"user",content:"\u4F60\u597D"}],{provider:n.providerType||"openai",apiKey:n.apiKey,model:n.model,baseUrl:n.baseUrl,enableThinking:n.enableThinking,reasoningEffort:n.reasoningEffort});new lt.Notice("\u8FDE\u63A5\u6210\u529F: "+l.content.substring(0,50))}catch(l){new lt.Notice(vh(l))}})}),s.addButton(o=>{o.setButtonText("\u5220\u9664").onClick(async()=>{this.plugin.settings=kh(this.plugin.settings,n.id),await this.plugin.saveSettings(),this.display()})})}async detectAndShowExplorationAgents(e){e.empty();let n=await Oh();this.plugin.settings.exploration.availableAgents=n,this.plugin.settings.exploration.lastDetectedAt=new Date().toISOString(),await this.plugin.saveSettings();for(let i of yr){let a=n.includes(i.key),r=e.createEl("div",{cls:"tracemind-agent-row"});r.createEl("span",{cls:`tracemind-agent-dot ${a?"available":"unavailable"}`}).setText(a?"\u{1F7E2}":"\u{1F534}"),r.createEl("span",{text:`${i.provider.name} ${a?"\u2014 \u5DF2\u68C0\u6D4B\u5230":"\u2014 \u672A\u68C0\u6D4B\u5230\uFF0C\u8BF7\u786E\u8BA4\u5DF2\u5B89\u88C5"}`,cls:"tracemind-agent-label"})}if(n.length>0){let i=wl(this.plugin.settings);new lt.Setting(e).setName("\u9ED8\u8BA4\u601D\u8003\u63A2\u7D22 Agent").setDesc(i?"\u601D\u8003\u63A2\u7D22\u53EF\u7528":"\u8BF7\u9009\u62E9\u4E00\u4E2A\u9ED8\u8BA4 Agent").addDropdown(a=>{a.addOption("","\u2014 \u9009\u62E9 \u2014");for(let r of n){let s=yr.find(o=>o.key===r);a.addOption(r,s?.provider.name||r)}a.setValue(this.plugin.settings.exploration.defaultAgent||"").onChange(async r=>{this.plugin.settings.exploration.defaultAgent=r,await this.plugin.saveSettings()})})}else e.createEl("p",{text:"\u672A\u68C0\u6D4B\u5230\u672C\u5730 Agent\uFF0C\u8BF7\u5B89\u88C5 Codex\u3001Claude Code\u3001Hermes\u3001OpenCode \u6216 Pi Agent\u3002",cls:"setting-item-description"}),new lt.Setting(e).addButton(i=>{i.setButtonText("\u91CD\u65B0\u68C0\u6D4B").onClick(()=>this.detectAndShowExplorationAgents(e))})}};var ct=require("obsidian");var ud=require("obsidian"),Q8=".lifewiki/templates";async function J8(t,e){let n=`templates/${e}`,i=t.getAbstractFileByPath(n);if(i instanceof ud.TFile)return await t.read(i);let a=`${Q8}/${e}`;return i=t.getAbstractFileByPath(a),i instanceof ud.TFile?await t.read(i):null}function Vs(t,e){return e.split(".").reduce((n,i)=>n?.[i],t)}function W8(t,e){let n=t,i=/\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;n=n.replace(i,(r,s,o)=>{if(!Vs(e,s.trim())){let u=o.split(/\{\{else\}\}/);return u.length>1?u[1].trim():""}return o.split(/\{\{else\}\}/)[0].trim()});let a=/\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g;return n=n.replace(a,(r,s,o)=>{let l=Vs(e,s.trim());return!Array.isArray(l)||l.length===0?"":l.map(c=>{let u=o;return u=u.replace(/\{\{this\.([^}]+)\}\}/g,(d,p)=>Vs(c,p.trim())??""),u=u.replace(/\{\{([^#/][^}]*?)\}\}/g,(d,p)=>{let f=p.trim();return f==="this"?String(c):Vs(c,f)??""}),(typeof c=="string"||typeof c=="number")&&(u=u.replace(/\{\{this\}\}/g,String(c))),u}).join("")}),n}function t7(t,e){let n=t,i=/\{\{([^#/][^}]*?)\}\}/g;return n=n.replace(i,(a,r)=>{let s=r.trim(),o=Vs(e,s);return o==null?"":typeof o=="object"?JSON.stringify(o):String(o)}),n}async function zh(t,e,n){let i=await J8(t,e);i===null&&(console.warn(`[TemplateLoader] Template not found: ${e}, falling back to default`),i=e7(e,n));let a=W8(i,n);return a=t7(a,n),a}function e7(t,e){switch(t.replace("-template.md","")){case"journal":return`# ${e.date||"Untitled"}

> [!NOTE] \u8BB0\u5F55\uFF0C\u662FAI\u65F6\u4EE3\u7684\u4EBA\u751F\u590D\u5229\u3002

## Flow of Today\uFF1A
`;case"person":return`## \u57FA\u672C\u4FE1\u606F
{{#if metadata.company}}- **\u6240\u5C5E\u516C\u53F8**: {{metadata.company}}{{/if}}
{{#if metadata.department}}- **\u90E8\u95E8**: {{metadata.department}}{{/if}}
{{#if metadata.position}}- **\u804C\u4F4D**: {{metadata.position}}{{/if}}
{{#if metadata.relationship_to_user}}- **\u4E0E\u6211\u5173\u7CFB**: {{metadata.relationship_to_user}}{{/if}}
{{#if metadata.person_kind}}- **\u7C7B\u578B**: {{metadata.person_kind}}{{/if}}
{{#if metadata.contact_channel}}- **\u8054\u7CFB\u65B9\u5F0F**: {{metadata.contact_channel}}{{/if}}

## \u80CC\u666F
{{summary}}

## \u5173\u8054\u5B9E\u4F53
{{#if relatedEntityLinks}}
{{relatedEntityLinks}}
{{else}}
\u6682\u65E0\u5173\u8054\u5B9E\u4F53
{{/if}}

## \u4E92\u52A8\u8BB0\u5F55
{{#if interactions}}
{{#each interactions}}
- {{timestamp}} | {{type}} | {{content}}
{{/each}}
{{else}}
\u6682\u65E0\u4E92\u52A8\u8BB0\u5F55
{{/if}}

## \u8DDF\u8FDB\u4E8B\u9879
- [ ] \u8865\u5145\u5173\u952E\u80CC\u666F
`;case"project":return`## \u57FA\u672C\u4FE1\u606F
{{#if metadata.project_kind}}- **\u7C7B\u578B**: {{metadata.project_kind}}{{/if}}
{{#if metadata.client}}- **\u5BA2\u6237/\u9700\u6C42\u65B9**: {{metadata.client}}{{/if}}
{{#if metadata.owner}}- **\u8D1F\u8D23\u4EBA**: {{metadata.owner}}{{/if}}
{{#if metadata.stage}}- **\u9636\u6BB5**: {{metadata.stage}}{{/if}}
{{#if metadata.priority}}- **\u4F18\u5148\u7EA7**: {{metadata.priority}}{{/if}}
{{#if metadata.amount}}- **\u91D1\u989D**: {{metadata.amount}}{{/if}}
{{#if metadata.start_date}}- **\u5F00\u59CB\u65F6\u95F4**: {{metadata.start_date}}{{/if}}
{{#if metadata.due_date}}- **\u622A\u6B62\u65F6\u95F4**: {{metadata.due_date}}{{/if}}

## \u80CC\u666F
{{summary}}

## \u5173\u8054\u5B9E\u4F53
{{#if relatedEntityLinks}}
{{relatedEntityLinks}}
{{else}}
\u6682\u65E0\u5173\u8054\u5B9E\u4F53
{{/if}}

## \u4E92\u52A8\u8BB0\u5F55
{{#if interactions}}
{{#each interactions}}
- {{timestamp}} | {{type}} | {{content}}
{{/each}}
{{else}}
\u6682\u65E0\u4E92\u52A8\u8BB0\u5F55
{{/if}}

## \u5173\u952E\u91CC\u7A0B\u7891
- [ ] \u9700\u6C42\u786E\u8BA4
- [ ] \u65B9\u6848\u4EA4\u4ED8
- [ ] \u9879\u76EE\u9A8C\u6536

## \u8DDF\u8FDB\u4E8B\u9879
- [ ] \u8865\u5145\u4E0B\u4E00\u6B65\u52A8\u4F5C
`;case"task":return`## \u4EFB\u52A1\u8BE6\u60C5
{{summary}}

## \u57FA\u672C\u5C5E\u6027
- **\u72B6\u6001**: {{metadata.status}}
- **\u4F18\u5148\u7EA7**: {{metadata.priority}}

## \u8FDB\u5EA6\u8BB0\u5F55

## \u5907\u6CE8
`;case"thing":return`## \u57FA\u672C\u4FE1\u606F
{{#if metadata.thing_kind}}- **\u7C7B\u578B**: {{metadata.thing_kind}}{{/if}}
{{#if metadata.brand}}- **\u54C1\u724C**: {{metadata.brand}}{{/if}}
{{#if metadata.model}}- **\u578B\u53F7**: {{metadata.model}}{{/if}}
{{#if metadata.vendor}}- **\u4F9B\u5E94\u5546**: {{metadata.vendor}}{{/if}}
{{#if metadata.spec}}- **\u89C4\u683C**: {{metadata.spec}}{{/if}}
{{#if metadata.price}}- **\u4EF7\u683C**: {{metadata.price}}{{/if}}

## \u5173\u8054\u5B9E\u4F53
{{#if relatedEntityLinks}}
{{relatedEntityLinks}}
{{else}}
\u6682\u65E0\u5173\u8054\u5B9E\u4F53
{{/if}}

## \u4E92\u52A8\u8BB0\u5F55
{{#if interactions}}
{{#each interactions}}
- {{timestamp}} | {{type}} | {{content}}
{{/each}}
{{else}}
\u6682\u65E0\u4E92\u52A8\u8BB0\u5F55
{{/if}}

## \u8DDF\u8FDB\u4E8B\u9879
- [ ] \u8865\u5145\u4E0B\u4E00\u6B65\u52A8\u4F5C
`;case"idea":return`## \u57FA\u672C\u4FE1\u606F
{{#if metadata.idea_kind}}- **\u7C7B\u578B**: {{metadata.idea_kind}}{{/if}}
{{#if metadata.stage}}- **\u9636\u6BB5**: {{metadata.stage}}{{/if}}
{{#if metadata.impact}}- **\u5F71\u54CD**: {{metadata.impact}}{{/if}}
{{#if metadata.applies_to}}- **\u9002\u7528\u573A\u666F**: {{metadata.applies_to}}{{/if}}

## \u60F3\u6CD5\u6982\u8FF0
{{summary}}

## \u5173\u8054\u5B9E\u4F53
{{#if relatedEntityLinks}}
{{relatedEntityLinks}}
{{else}}
\u6682\u65E0\u5173\u8054\u5B9E\u4F53
{{/if}}

## \u4E92\u52A8\u8BB0\u5F55
{{#if interactions}}
{{#each interactions}}
- {{timestamp}} | {{type}} | {{content}}
{{/each}}
{{else}}
\u6682\u65E0\u4E92\u52A8\u8BB0\u5F55
{{/if}}

## \u5907\u6CE8
`;case"knowledge":return`## \u6458\u8981
{{summary}}

## \u57FA\u672C\u4FE1\u606F
{{#if metadata.source_type}}- **\u6765\u6E90\u7C7B\u578B**: {{metadata.source_type}}{{/if}}
{{#if metadata.topic}}- **\u4E3B\u9898**: {{metadata.topic}}{{/if}}
{{#if metadata.author}}- **\u4F5C\u8005**: {{metadata.author}}{{/if}}
{{#if metadata.published_at}}- **\u53D1\u5E03\u65F6\u95F4**: {{metadata.published_at}}{{/if}}
{{#if metadata.accessed_date}}- **\u8BBF\u95EE\u65F6\u95F4**: {{metadata.accessed_date}}{{/if}}

{{#if metadata.url}}
## \u94FE\u63A5
{{metadata.url}}
{{/if}}

{{#if metadata.source_path}}
## \u539F\u6587\u8DEF\u5F84
{{metadata.source_path}}
{{/if}}

## \u6838\u5FC3\u5185\u5BB9
{{summary}}

## \u5173\u8054\u5B9E\u4F53
{{#if relatedEntityLinks}}
{{relatedEntityLinks}}
{{else}}
\u6682\u65E0\u5173\u8054\u5B9E\u4F53
{{/if}}

## \u4E92\u52A8\u8BB0\u5F55
{{#if interactions}}
{{#each interactions}}
- {{timestamp}} | {{type}} | {{content}}
{{/each}}
{{else}}
\u6682\u65E0\u4E92\u52A8\u8BB0\u5F55
{{/if}}
`;default:return"{{content}}"}}Hn();var dd="Daily/attachments";function pd(t){return t.replace(/[\\/:*?"<>|]/g,"_").split("").filter(n=>n.charCodeAt(0)>31&&n.charCodeAt(0)!==127).join("").trim()||"attachment"}function Lh(t,e){let n=pd(t),i=n.lastIndexOf("."),a=i>0?n.slice(0,i):n,r=i>0?n.slice(i):"",s=`${dd}/${a}${r}`;if(!e(s))return s;for(let o=1;o<100;o++)if(s=`${dd}/${a}-${o}${r}`,!e(s))return s;return`${dd}/${a}-${Date.now()}${r}`}function Nh(t){return n7(t)?`[[${t}|${t}]]`:`![[${t}]]`}function fd(t){return t.replace(/!\[\[([^\]\|]+?\.md(?:#[^\]\|]+)?)(?:\|[^\]]*)?\]\]/gi,(e,n)=>`[[${n}|${n}]]`)}function n7(t){return/\.md(?:$|#)/i.test(t)}function Ph(t,e,n,i){let a=t.slice(0,n),r=t.slice(i),s=a.length>0&&a[a.length-1]!==`
`?`
`:"",o=r.length>0&&r[0]!==`
`?`
`:"",l=a+s+e+o+r,c=a.length+s.length+e.length;return{value:l,cursor:c}}var ma="tracemind-logo",jh=`
<g transform="scale(0.3921568627)">
<circle cx="127.5" cy="127.5" r="127.5" fill="#547FA6"/>
  <g fill="#F7F5F3" stroke="none" transform="translate(18 18) scale(0.86)">
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M137.969757,148.985779 
    	C131.969849,159.431412 118.475502,160.120697 112.173470,149.943390 
    	C110.771469,147.679260 111.690872,144.007645 111.427780,140.993973 
    	C111.317833,139.734589 111.339653,137.898865 110.571053,137.352097 
    	C104.933151,133.341629 102.656479,127.362358 104.650787,120.617256 
    	C108.518303,107.536659 118.419014,100.722595 130.339890,96.059631 
    	C140.076309,92.251137 150.011383,91.489182 160.486008,94.740616 
    	C160.146439,99.148735 161.113190,101.310539 165.738464,100.305710 
    	C167.047318,100.021370 168.575073,100.744705 170.002457,101.334412 
    	C170.003662,102.100937 170.004837,102.538948 169.784271,103.155502 
    	C170.041275,103.888641 170.520020,104.443253 171.179718,105.256226 
    	C172.240417,106.677757 173.120209,107.840935 173.998413,109.336853 
    	C173.996658,110.113365 173.996506,110.557137 173.646118,111.005180 
    	C172.506668,111.386368 171.717468,111.763290 170.928253,112.140213 
    	C170.155029,111.776413 169.381805,111.412621 168.076752,110.742165 
    	C165.702805,110.602928 163.860703,110.770348 162.018585,110.937775 
    	C151.649399,107.100586 141.085068,111.079170 130.632462,110.215591 
    	C129.279510,110.103821 127.841850,111.017487 126.147392,111.549019 
    	C126.540558,112.865822 126.881363,114.007271 127.276932,115.332138 
    	C120.837059,117.730362 119.885376,123.234428 118.829277,128.051163 
    	C123.733658,128.923828 128.121338,129.704544 132.809067,131.071503 
    	C133.778763,132.083939 134.448425,132.510117 135.118073,132.936295 
    	C135.118073,132.936295 135.044022,132.963196 135.147446,133.169067 
    	C135.542053,133.571045 135.833252,133.767181 136.124435,133.963303 
    	C136.124435,133.963303 136.045563,133.953217 136.059814,134.242096 
    	C136.457458,134.999161 136.840820,135.467346 137.224197,135.935547 
    	C137.224197,135.935547 137.105576,135.927063 137.067291,136.257172 
    	C136.094299,137.966385 135.159622,139.345490 133.752533,141.421631 
    	C140.012314,141.461746 136.926804,146.153091 137.969757,148.985779 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M161.142822,188.621185 
    	C147.926041,207.076736 129.924179,216.992950 107.399956,219.291656 
    	C96.118301,220.443008 85.242485,219.686371 74.729538,215.217194 
    	C70.794884,213.544525 67.191086,208.108612 67.952179,204.748688 
    	C68.953827,200.326813 71.880257,198.287659 77.520241,198.870941 
    	C83.644104,200.830795 89.214371,202.387024 95.258835,203.962601 
    	C99.089447,203.001038 103.227325,206.169968 105.992615,202.049957 
    	C106.704910,201.958221 107.417206,201.866470 108.710846,202.039841 
    	C111.949226,201.610519 115.568268,203.687805 117.051651,199.611816 
    	C122.991104,196.729172 128.930557,193.846527 135.604919,190.946747 
    	C139.887604,188.503265 143.435364,186.076904 146.350296,184.083328 
    	C149.349640,185.178024 152.152176,186.200882 155.182755,187.306976 
    	C155.636169,185.950897 155.655853,185.141800 156.062546,184.816467 
    	C157.281097,183.841705 158.650909,183.056030 159.961685,182.196564 
    	C160.453354,183.527267 161.067169,184.829361 161.388016,186.200058 
    	C161.562866,186.947037 161.240784,187.810349 161.142822,188.621185 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M45.349857,181.187790 
    	C45.349857,181.187790 45.192909,181.317154 45.054012,180.906784 
    	C42.578556,179.016129 40.241993,177.535828 37.905430,176.055542 
    	C37.905430,176.055542 37.981770,176.011002 37.947693,175.727264 
    	C37.497398,175.024780 37.081181,174.606033 36.664963,174.187286 
    	C36.664963,174.187286 36.779213,174.213196 36.804279,173.878265 
    	C36.043262,172.732498 35.257183,171.921692 34.471100,171.110886 
    	C34.215649,171.009262 34.048107,170.826889 33.963974,170.000153 
    	C33.274212,168.622803 32.588943,167.809052 31.903671,166.995316 
    	C25.255194,155.892334 21.948627,143.835114 21.886192,130.928802 
    	C21.872972,128.196259 22.623463,125.459999 23.173716,121.977768 
    	C23.245382,119.830185 23.165411,118.430290 23.085440,117.030403 
    	C22.993401,116.741631 23.028561,116.469276 23.714130,115.939011 
    	C25.913212,113.191811 27.589081,110.718933 28.585087,109.249245 
    	C28.965727,106.212303 29.144577,104.076828 29.521748,101.976990 
    	C29.892618,99.912247 30.464766,97.883652 30.948589,95.839195 
    	C32.519360,92.837578 33.744621,89.576439 35.752567,86.903198 
    	C38.016926,83.888573 42.390701,83.866486 44.920494,86.558098 
    	C47.655437,89.467972 47.285118,91.925240 44.016842,94.668915 
    	C42.018856,96.346199 40.657055,99.253883 39.921879,101.865776 
    	C38.326912,107.532265 37.317547,113.363571 35.771072,119.706635 
    	C31.517159,123.344406 36.832291,123.925552 37.037548,125.986160 
    	C37.652416,132.158981 38.639408,138.294739 39.460678,144.295395 
    	C37.522175,145.020554 35.850822,145.645798 33.276493,146.608826 
    	C35.112694,147.757584 36.084358,148.842682 36.684402,148.665970 
    	C41.841797,147.147064 41.786346,151.181183 43.311295,154.156555 
    	C45.104851,157.656021 47.830456,160.677780 50.151878,163.906693 
    	C50.151878,163.906693 50.062027,163.968658 50.054916,164.297668 
    	C51.421032,166.064865 52.794258,167.503036 54.167488,168.941193 
    	C54.490250,169.026749 54.730366,169.216751 54.951290,170.099228 
    	C56.067383,172.138596 57.120014,173.589935 58.172646,175.041275 
    	C58.221268,175.202759 58.269890,175.364258 57.817215,175.765717 
    	C56.512371,176.119400 55.049103,176.110809 55.002014,176.364777 
    	C53.899353,182.312378 49.123486,180.735748 45.349857,181.187790 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M194.051773,209.146851 
    	C192.738602,209.146851 191.425430,209.146851 188.810455,209.146851 
    	C186.970978,212.343307 185.068680,217.049500 181.950821,220.724442 
    	C177.730057,225.699371 172.816330,230.173767 167.766327,234.337006 
    	C160.512772,240.316879 151.150177,241.170807 142.485397,243.535202 
    	C137.653748,244.853653 133.834213,242.194443 132.994324,237.930267 
    	C132.253311,234.168076 135.598572,228.383759 139.284393,227.573593 
    	C151.628830,224.860245 161.945999,218.472305 171.859818,210.218384 
    	C173.283569,209.803223 174.150955,209.441452 175.018341,209.079666 
    	C175.018341,209.079666 174.982224,209.035095 175.231384,208.892792 
    	C175.669571,208.467545 175.858582,208.184586 176.047592,207.901627 
    	C176.488647,207.949066 176.929688,207.996521 177.845978,208.357178 
    	C179.235062,209.681137 180.148895,210.691895 181.623306,212.322678 
    	C182.920670,208.367416 183.963837,205.187103 185.238953,201.989792 
    	C185.735962,201.858139 186.001068,201.743500 186.266159,201.628860 
    	C186.182724,201.509781 186.099274,201.390701 186.015823,201.271637 
    	C185.675781,201.512299 185.335739,201.752960 184.660980,201.842377 
    	C183.660095,201.372147 182.993927,201.053146 182.327759,200.734161 
    	C184.129349,197.728836 185.930954,194.723511 188.220062,191.946091 
    	C190.072662,195.759460 191.437744,199.344925 193.147491,203.835678 
    	C192.782013,203.802994 193.890091,203.902100 194.999084,204.000610 
    	C195.000000,204.000000 194.999359,204.000961 195.000397,204.351410 
    	C195.015869,205.169434 195.030304,205.637009 195.044724,206.104599 
    	C195.033264,206.532211 195.021820,206.959824 194.745819,207.839005 
    	C194.238297,208.525925 194.095123,208.811340 194.051773,209.146851 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M104.315704,44.152107 
    	C90.816132,50.765358 78.228508,58.454662 69.805328,71.547447 
    	C66.372475,76.883400 63.831219,77.162186 59.142860,73.498856 
    	C60.100197,70.186882 63.519661,66.798759 60.305470,61.659756 
    	C66.592636,42.774731 83.215942,32.981079 101.479141,24.610388 
    	C102.997017,25.802864 103.969620,26.811291 105.020760,27.729849 
    	C106.313217,28.859289 107.671211,29.913742 109.000443,31.000305 
    	C109.000000,31.000000 108.999390,30.999390 108.999329,31.405289 
    	C107.237801,35.429436 105.448463,39.034805 103.761917,42.687637 
    	C103.608574,43.019764 104.115433,43.656712 104.315704,44.152107 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M155.440292,17.182730 
    	C156.563110,17.830021 157.685928,18.477312 158.941132,19.794083 
    	C160.041016,21.640163 161.008499,22.816763 161.975998,23.993361 
    	C162.041763,25.066160 162.107544,26.138962 161.730530,27.668076 
    	C160.906967,29.147398 160.526184,30.170410 160.145416,31.193420 
    	C160.145416,31.193422 160.084656,31.103916 159.870834,31.182323 
    	C159.461777,31.569641 159.266541,31.878548 159.071320,32.187454 
    	C159.071304,32.187450 159.078232,32.090519 158.685455,32.064129 
    	C153.861786,32.024864 149.430893,32.011986 144.994080,31.625374 
    	C143.740585,28.676678 142.493042,26.101719 140.881866,22.776228 
    	C136.607025,26.737850 132.780151,30.594236 128.624466,34.055901 
    	C123.600945,38.240471 117.002716,37.453781 112.778961,32.765247 
    	C111.921844,31.813812 110.279655,31.569626 108.999390,30.999390 
    	C108.999390,30.999390 109.000000,31.000000 108.843277,30.690460 
    	C108.458168,27.567253 108.229774,24.753584 108.001381,21.939919 
    	C119.711617,20.047392 131.421844,18.154865 143.578796,16.549572 
    	C144.204742,17.025251 144.383972,17.213694 144.563232,17.402142 
    	C144.717712,17.035343 144.872208,16.668543 145.026703,16.301739 
    	C145.461975,16.247929 145.897247,16.194118 146.655029,16.629276 
    	C147.579727,18.661470 148.181931,20.204697 148.784149,21.747921 
    	C150.856094,20.839264 152.928055,19.930607 155.001129,18.767162 
    	C155.001511,18.342518 155.000763,18.172661 155.131409,17.809235 
    	C155.262802,17.615665 155.440292,17.182730 155.440292,17.182730 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M230.650711,128.171219 
    	C229.845505,127.215935 229.040298,126.260651 227.719589,124.693756 
    	C227.289917,126.445198 227.023163,127.532494 227.092834,127.248520 
    	C221.058914,117.836998 214.600082,107.762718 208.292877,97.181259 
    	C211.962006,92.781662 215.479538,88.889244 219.267761,85.251060 
    	C220.381897,89.957420 221.225357,94.409538 222.285812,100.007118 
    	C224.587372,96.722893 223.175903,91.827538 228.186691,92.929169 
    	C229.128662,94.301384 230.070633,95.673607 231.037445,97.769356 
    	C232.372437,101.993752 233.682571,105.494621 234.993958,109.432205 
    	C237.393814,116.882820 234.425934,122.622841 230.650711,128.171219 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M64.069763,138.017487 
    	C63.636013,134.288681 63.202259,130.559891 63.030312,126.292175 
    	C63.528534,125.169647 63.764950,124.586037 64.371361,123.998245 
    	C68.577042,122.492882 72.060715,122.783646 74.706787,126.257004 
    	C73.670715,128.909180 73.431107,131.011139 76.876785,131.245850 
    	C77.021690,131.950836 77.240372,132.437378 77.459045,132.923920 
    	C79.832840,134.774384 81.920433,136.583725 80.069817,140.147461 
    	C79.624969,141.004105 80.280380,143.405563 81.053398,143.768539 
    	C87.792198,146.932938 88.642563,155.391235 95.094246,157.995071 
    	C93.834679,160.126724 93.018135,161.508606 92.184891,163.346954 
    	C92.168190,163.803436 91.986717,164.019379 91.735718,164.211792 
    	C90.260017,165.856339 89.035324,167.308502 87.810623,168.760651 
    	C84.419525,167.231262 80.106087,166.510956 77.873222,163.965530 
    	C75.145721,160.856232 74.182007,156.207413 72.416122,152.241913 
    	C71.930389,151.151154 71.303947,150.123062 70.447372,148.596054 
    	C73.314468,144.602814 78.844894,142.677460 77.986084,136.219040 
    	C73.546265,138.208954 66.409271,135.394714 65.737732,143.642380 
    	C65.467125,143.074677 65.196526,142.506973 64.934189,141.258652 
    	C64.651558,139.724518 64.360657,138.871002 64.069763,138.017487 
    M73.486122,147.574890 
    	C73.486122,147.574890 73.431473,147.477325 73.486122,147.574890 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M131.020462,58.089592 
    	C142.006775,54.027241 153.383698,54.347157 164.783112,55.194370 
    	C165.978806,55.283234 167.110367,56.235004 168.644211,57.276436 
    	C169.715485,59.371136 170.599548,60.923458 171.071213,62.592327 
    	C171.852463,65.356606 172.368149,68.195930 172.625397,70.996445 
    	C170.509705,71.248222 168.764374,71.507202 167.019043,71.766174 
    	C161.986923,71.472511 156.954788,71.178841 151.245148,70.694527 
    	C149.711990,70.710831 148.856339,70.917778 148.000702,71.124725 
    	C145.597244,71.248390 143.193787,71.372047 140.294601,71.239319 
    	C139.524521,70.655907 139.250168,70.328888 139.017258,69.683899 
    	C138.038437,68.936836 137.018173,68.507736 135.990295,67.706841 
    	C134.328613,64.253220 132.674545,61.171406 131.020462,58.089592 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M74.969048,126.003204 
    	C72.060715,122.783646 68.577042,122.492882 64.150055,123.999832 
    	C63.558762,124.005585 63.116180,124.007858 63.116180,124.007858 
    	C63.192421,123.543457 63.268658,123.079056 63.693359,122.216858 
    	C64.063301,121.232079 64.084778,120.645081 64.106262,120.058090 
    	C65.111717,117.485832 66.019897,114.869522 67.157784,112.357246 
    	C67.883209,110.755585 69.960487,109.091621 69.690147,107.828232 
    	C68.396797,101.783958 73.092545,97.615456 74.556137,92.135490 
    	C75.412560,91.975311 75.680756,92.010635 75.961777,92.442627 
    	C76.506180,96.428696 72.964615,100.892471 78.432373,103.868774 
    	C78.827400,102.176636 79.142029,100.828873 79.486038,99.355255 
    	C80.805580,99.594490 81.903198,99.793488 83.199371,100.243820 
    	C84.220718,100.652252 85.043488,100.809349 85.866264,100.966446 
    	C83.455307,107.979538 81.044350,114.992622 78.338181,122.600464 
    	C77.018326,124.131203 75.993690,125.067200 74.969048,126.003204 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M92.258278,163.694916 
    	C98.526558,159.923981 104.607521,163.047455 110.754738,163.756363 
    	C115.549583,164.309311 115.459198,164.132904 116.558868,169.460114 
    	C116.756966,170.419815 118.318855,171.097992 119.251266,171.905945 
    	C116.072014,178.018387 112.399643,180.230515 105.617645,178.921463 
    	C101.116081,178.052582 96.827240,176.081650 92.369797,174.092361 
    	C92.643944,172.370651 93.351768,171.132034 93.258560,169.956940 
    	C93.099899,167.956711 92.437477,165.996445 91.986717,164.019379 
    	C91.986717,164.019379 92.168190,163.803436 92.258278,163.694916 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M194.998169,204.001221 
    	C193.890091,203.902100 192.782013,203.802994 193.147491,203.835678 
    	C191.437744,199.344925 190.072662,195.759460 188.526031,191.785400 
    	C188.344498,191.396805 188.376938,191.403412 188.824921,191.544098 
    	C189.749084,189.882843 190.225266,188.080902 190.701431,186.278946 
    	C190.701431,186.278946 190.363739,186.251709 190.770905,186.090591 
    	C191.750900,185.150162 192.323730,184.370850 192.896545,183.591537 
    	C192.884247,182.631592 192.871948,181.671661 193.235962,180.331879 
    	C194.402313,179.628021 195.192368,179.304001 196.270905,179.077484 
    	C196.700073,177.446915 196.840729,175.718857 197.015869,173.713104 
    	C197.979294,173.260162 198.908249,173.084885 200.257172,172.830368 
    	C199.853714,170.240616 199.444824,167.615982 199.401550,165.001602 
    	C201.510864,167.164154 203.309143,169.275192 204.978882,171.483429 
    	C206.068207,172.924057 206.970840,174.505844 207.965912,176.353149 
    	C207.969925,177.120834 207.965118,177.559814 207.693741,178.244843 
    	C204.887772,187.775650 201.622086,196.706512 194.998169,204.001221 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M168.968552,151.001175 
    	C169.415070,151.865646 169.861603,152.730103 169.795197,153.866455 
    	C168.357971,155.577927 167.560593,157.121323 166.484818,158.437103 
    	C163.601959,161.963135 163.794296,164.826614 168.018860,167.443130 
    	C167.664459,170.569504 167.315628,173.275772 166.635635,175.836655 
    	C162.105087,173.347549 158.558075,174.338882 155.151306,177.500549 
    	C154.101273,178.475037 152.292389,178.631805 150.830963,179.162994 
    	C154.202591,169.548569 159.133377,161.077621 156.329056,150.823761 
    	C161.307434,146.798981 163.689438,146.865250 168.968552,151.001175 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M194.289017,114.828346 
    	C195.675354,116.784988 197.061691,118.741631 198.734894,121.250107 
    	C199.724655,122.511398 200.427597,123.220848 201.130524,123.930305 
    	C201.130524,123.930305 201.047882,123.970505 201.046494,124.319290 
    	C201.945267,127.265671 202.552078,130.018188 203.821121,132.420944 
    	C205.347504,135.310959 205.058304,137.667252 202.649139,140.039551 
    	C199.852036,141.692047 197.402740,143.305634 194.248581,145.383560 
    	C192.425659,141.071640 190.520355,137.272690 189.270355,133.269150 
    	C188.750717,131.604797 188.988724,129.013168 189.996796,127.696671 
    	C192.640060,124.244652 193.797775,121.235786 190.150360,117.683311 
    	C191.634628,116.533531 192.961823,115.680939 194.289017,114.828346 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M197.845001,87.076805 
    	C197.527328,87.051262 197.266006,86.916466 196.982513,86.084015 
    	C197.179474,80.050003 196.409164,75.591797 189.631638,74.394897 
    	C188.277664,74.155777 187.534668,70.456894 186.509949,68.353317 
    	C188.241333,68.497673 190.005219,68.485008 191.694122,68.834648 
    	C193.120056,69.129852 194.436966,69.933807 195.858139,70.287758 
    	C196.095627,70.346901 196.618683,69.259453 197.009796,68.701828 
    	C196.655258,67.691116 196.300735,66.680412 195.705948,64.984749 
    	C203.248032,67.320747 208.647354,71.619507 213.527252,76.693054 
    	C211.436127,78.301308 209.503372,79.530304 207.725616,80.952980 
    	C206.670044,81.797707 206.032944,83.257057 204.900589,83.894707 
    	C202.661453,85.155609 200.209167,86.037941 197.845001,87.076805 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M207.957092,176.024414 
    	C206.970840,174.505844 206.068207,172.924057 204.978882,171.483429 
    	C203.309143,169.275192 201.510864,167.164154 199.398361,164.746994 
    	C199.024963,164.312347 199.020340,164.142548 199.186859,163.737961 
    	C199.903717,163.335648 200.449417,163.168121 201.193359,163.182343 
    	C202.067856,162.757843 202.744110,162.151596 203.420380,161.545349 
    	C202.611557,161.696457 201.802719,161.847565 200.677246,161.971863 
    	C199.579086,161.629822 198.797562,161.314636 197.686890,160.993362 
    	C196.920486,161.015594 196.483231,161.043900 196.032745,160.612701 
    	C195.712921,156.568878 194.303528,152.569382 195.447327,149.531067 
    	C196.368927,147.082993 200.375519,145.796280 203.259232,144.196594 
    	C203.957596,145.147812 204.410126,145.896713 205.151352,147.123413 
    	C205.733749,145.669861 206.072311,144.824844 206.343369,144.148346 
    	C207.335342,145.210602 208.172119,146.106644 209.008896,147.002686 
    	C209.008896,147.002686 209.096573,147.388367 209.061661,148.046661 
    	C209.007645,151.149811 208.988541,153.594696 208.705414,156.285919 
    	C208.618668,158.343002 208.795959,160.153732 208.980453,162.369690 
    	C208.986710,163.855576 208.985779,164.936264 208.827789,166.103088 
    	C208.612274,166.292023 208.479462,166.449295 208.508026,166.488297 
    	C208.641006,166.669800 208.818619,166.818604 208.987061,167.392365 
    	C209.025650,168.632156 209.057480,169.458710 209.089294,170.285248 
    	C209.095413,170.675537 209.101562,171.065826 208.766159,171.978851 
    	C208.268768,173.675858 208.112930,174.850128 207.957092,176.024414 
    M203.542114,158.283859 
    	C203.281967,158.010269 203.021820,157.736679 202.761688,157.463074 
    	C202.648605,157.570938 202.431198,157.766556 202.437485,157.774033 
    	C202.680374,158.062790 202.943726,158.334335 203.542114,158.283859 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M83.000809,99.992485 
    	C81.903198,99.793488 80.805580,99.594490 79.486038,99.355255 
    	C79.142029,100.828873 78.827400,102.176636 78.432373,103.868774 
    	C72.964615,100.892471 76.506180,96.428696 76.193565,92.177505 
    	C78.508560,91.391472 80.604591,91.267250 83.211815,91.112732 
    	C81.508415,88.207764 80.459808,86.419479 79.411201,84.631195 
    	C79.411201,84.631195 79.472626,84.634102 79.854416,84.600479 
    	C80.453056,83.943909 80.669907,83.320961 80.886749,82.698006 
    	C82.311928,81.177284 83.737099,79.656563 85.778297,78.145760 
    	C86.965965,78.458839 87.749252,78.615860 88.075569,79.088425 
    	C90.549805,82.671516 96.816437,82.515274 97.089401,88.236084 
    	C95.595329,90.035202 94.101257,91.834312 91.999176,93.861183 
    	C90.081123,94.608727 88.566307,95.835373 87.496620,95.525490 
    	C82.951668,94.208824 83.021667,97.039375 83.000809,99.992485 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M156.007935,150.989044 
    	C159.133377,161.077621 154.202591,169.548569 150.830963,179.162994 
    	C152.292389,178.631805 154.101273,178.475037 155.151306,177.500549 
    	C158.558075,174.338882 162.105087,173.347549 166.534332,176.106873 
    	C166.812988,177.337463 166.861786,178.152405 166.910568,178.967361 
    	C165.186890,182.044846 163.463196,185.122345 161.441162,188.410507 
    	C161.240784,187.810349 161.562866,186.947037 161.388016,186.200058 
    	C161.067169,184.829361 160.453354,183.527267 159.961685,182.196564 
    	C158.650909,183.056030 157.281097,183.841705 156.062546,184.816467 
    	C155.655853,185.141800 155.636169,185.950897 155.182755,187.306976 
    	C152.152176,186.200882 149.349640,185.178024 146.350296,184.083328 
    	C143.435364,186.076904 139.887604,188.503265 135.937393,190.903000 
    	C144.791306,182.440659 153.487656,173.611694 154.486099,160.147629 
    	C154.700562,157.255753 154.051285,154.299820 153.842041,150.635834 
    	C153.651428,149.276489 153.418701,148.654709 153.185974,148.032928 
    	C152.594421,146.900436 152.002869,145.767944 151.391846,144.155304 
    	C152.581329,143.782608 153.790253,143.890091 154.999939,144.415375 
    	C155.336441,146.885147 155.672195,148.937088 156.007935,150.989044 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M108.999329,31.405289 
    	C110.279655,31.569626 111.921844,31.813812 112.778961,32.765247 
    	C117.002716,37.453781 123.600945,38.240471 128.624466,34.055901 
    	C132.780151,30.594236 136.607025,26.737850 140.881866,22.776228 
    	C142.493042,26.101719 143.740585,28.676678 144.994263,31.979113 
    	C145.003830,33.413982 145.007263,34.121376 145.010696,34.828770 
    	C131.348572,36.466808 117.743820,38.352921 104.671234,44.114536 
    	C104.115433,43.656712 103.608574,43.019764 103.761917,42.687637 
    	C105.448463,39.034805 107.237801,35.429436 108.999329,31.405289 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M130.741394,58.074230 
    	C132.674545,61.171406 134.328613,64.253220 135.689240,67.869705 
    	C133.264740,69.273315 131.133698,70.142258 128.999969,70.678001 
    	C128.995758,69.900528 128.994247,69.456253 129.258362,68.766464 
    	C130.607346,65.191673 128.874878,64.130104 126.371750,65.642166 
    	C124.745209,66.624725 124.054657,69.156754 122.725266,71.005249 
    	C122.505775,71.015923 122.066284,71.019142 121.800690,71.012306 
    	C121.357979,71.003960 121.180870,71.002441 120.646347,71.007248 
    	C118.195946,72.996597 116.102959,74.979622 114.009979,76.962654 
    	C112.080986,76.849899 110.064575,77.004868 108.288155,76.424828 
    	C107.875046,76.289932 108.012726,73.588730 108.353012,72.178368 
    	C109.818436,66.104607 113.948067,63.493317 120.032829,63.050262 
    	C122.217537,62.891186 124.316528,61.554840 126.916275,60.380302 
    	C128.237244,59.435047 129.096573,58.865276 129.955902,58.295509 
    	C130.124725,58.216629 130.293533,58.137749 130.741394,58.074230 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M198.018341,87.371628 
    	C200.209167,86.037941 202.661453,85.155609 204.900589,83.894707 
    	C206.032944,83.257057 206.670044,81.797707 207.725616,80.952980 
    	C209.503372,79.530304 211.436127,78.301308 213.697693,76.983139 
    	C215.661148,78.432640 217.230606,79.889839 218.902954,82.033798 
    	C219.002930,83.479317 219.000000,84.238068 218.997070,84.996819 
    	C215.479538,88.889244 211.962006,92.781662 208.150970,96.868736 
    	C204.635513,93.931076 201.413589,90.798759 198.018341,87.371628 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M203.013382,143.994308 
    	C200.375519,145.796280 196.368927,147.082993 195.447327,149.531067 
    	C194.303528,152.569382 195.712921,156.568878 196.025116,160.964401 
    	C195.674591,165.839478 195.318451,169.903351 194.634628,173.980103 
    	C193.869751,173.995163 193.432556,173.997314 192.995361,173.999481 
    	C195.893906,159.326416 193.657700,145.399124 186.681244,132.249985 
    	C185.082245,129.236191 182.875854,126.544662 181.264191,123.368736 
    	C182.213104,123.079689 182.846832,123.126732 183.480545,123.173767 
    	C183.268463,118.454231 187.477585,119.279205 189.993271,117.980499 
    	C193.797775,121.235786 192.640060,124.244652 189.996796,127.696671 
    	C188.988724,129.013168 188.750717,131.604797 189.270355,133.269150 
    	C190.520355,137.272690 192.425659,141.071640 194.248581,145.383560 
    	C197.402740,143.305634 199.852036,141.692047 202.650208,140.438965 
    	C203.003860,141.864410 203.008621,142.929367 203.013382,143.994308 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M196.555328,68.675232 
    	C196.618683,69.259453 196.095627,70.346901 195.858139,70.287758 
    	C194.436966,69.933807 193.120056,69.129852 191.694122,68.834648 
    	C190.005219,68.485008 188.241333,68.497673 186.509949,68.353317 
    	C187.534668,70.456894 188.277664,74.155777 189.631638,74.394897 
    	C196.409164,75.591797 197.179474,80.050003 196.910645,85.870468 
    	C193.688629,83.432869 190.499344,80.573334 187.215820,77.826431 
    	C185.387314,76.296768 183.401917,74.954659 181.330185,73.048813 
    	C181.117050,71.712570 181.060974,70.855522 181.002991,69.589447 
    	C180.004288,66.452759 179.007477,63.725098 177.828247,60.740559 
    	C177.098373,59.650784 176.550934,58.817890 176.003510,57.984993 
    	C179.735535,58.623272 183.086502,58.554653 185.306137,63.389366 
    	C186.597275,66.201660 192.353653,66.963943 196.555328,68.675232 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M190.150360,117.683311 
    	C187.477585,119.279205 183.268463,118.454231 183.480545,123.173767 
    	C182.846832,123.126732 182.213104,123.079689 181.236328,123.010712 
    	C178.006699,120.211143 175.120102,117.433510 172.561127,114.317902 
    	C174.259171,113.319839 175.629593,112.659767 177.242737,112.082085 
    	C177.860886,112.125793 178.236282,112.087112 178.611679,112.048431 
    	C178.073990,111.699432 177.536301,111.350426 177.000214,110.677353 
    	C178.696030,109.556992 180.390244,108.760712 182.084457,107.964424 
    	C183.033737,107.675667 184.368881,106.836807 184.869385,107.187866 
    	C188.004303,109.386726 190.953094,111.850952 194.126251,114.527847 
    	C192.961823,115.680939 191.634628,116.533531 190.150360,117.683311 
    M177.567444,114.517281 
    	C177.567444,114.517281 177.472870,114.570267 177.567444,114.517281 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M97.398308,88.064026 
    	C96.816437,82.515274 90.549805,82.671516 88.075569,79.088425 
    	C87.749252,78.615860 86.965965,78.458839 86.062134,78.009506 
    	C87.534058,76.443047 89.259941,74.906357 91.160362,73.629402 
    	C94.102341,71.652596 97.252510,69.720306 100.520844,72.908615 
    	C102.866890,75.197227 102.892471,81.539253 100.719673,84.598213 
    	C99.864594,85.802017 98.719978,86.800163 97.398308,88.064026 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M154.999191,143.997559 
    	C153.790253,143.890091 152.581329,143.782608 151.161316,143.878723 
    	C146.946228,141.280731 143.443741,138.241348 146.014282,132.508545 
    	C147.022781,133.633347 147.508240,134.819794 147.994202,136.311554 
    	C148.211380,137.158844 148.428040,137.700821 148.644714,138.242783 
    	C148.977524,137.941238 149.310349,137.639709 149.643158,137.338165 
    	C149.097473,136.890213 148.551788,136.442276 148.225052,135.712189 
    	C150.481339,133.370911 155.651810,134.993790 155.037949,129.819031 
    	C158.675766,131.571442 162.794098,132.829163 163.078217,138.546661 
    	C160.250244,140.844254 157.624710,142.420914 154.999191,143.997559 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M50.078033,163.557251 
    	C47.830456,160.677780 45.104851,157.656021 43.311295,154.156555 
    	C41.786346,151.181183 41.841797,147.147064 36.684402,148.665970 
    	C36.084358,148.842682 35.112694,147.757584 33.276493,146.608826 
    	C35.850822,145.645798 37.522175,145.020554 39.460678,144.295395 
    	C38.639408,138.294739 37.652416,132.158981 37.037548,125.986160 
    	C36.832291,123.925552 31.517159,123.344406 35.795616,120.116684 
    	C37.071598,121.238998 38.836010,122.518845 38.854614,123.823586 
    	C39.056461,137.977402 43.180164,150.960617 50.078033,163.557251 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M154.999939,144.415375 
    	C157.624710,142.420914 160.250244,140.844254 163.051178,138.909775 
    	C163.226578,138.551941 163.620605,138.715317 163.944885,139.060547 
    	C164.597626,139.535049 164.926102,139.664322 165.254578,139.793610 
    	C165.254578,139.793610 165.238556,139.714050 165.204559,140.088684 
    	C166.114365,141.974701 167.058167,143.486099 168.001984,144.997482 
    	C168.390732,146.816437 168.779480,148.635376 169.068390,150.727753 
    	C163.689438,146.865250 161.307434,146.798981 156.329056,150.823761 
    	C155.672195,148.937088 155.336441,146.885147 154.999939,144.415375 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M65.772293,143.977173 
    	C66.409271,135.394714 73.546265,138.208954 77.986084,136.219040 
    	C78.844894,142.677460 73.314468,144.602814 70.088898,148.443893 
    	C68.619034,147.278580 67.212944,145.795273 65.772293,143.977173 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M230.834381,128.501892 
    	C234.425934,122.622841 237.393814,116.882820 235.249084,109.432114 
    	C235.673019,108.994904 235.843063,108.994507 236.013107,108.994110 
    	C236.954330,114.306282 238.096115,119.592789 238.779953,124.937889 
    	C239.454071,130.207123 235.275101,131.061554 231.390945,132.466049 
    	C231.243591,131.030243 231.130829,129.931412 230.834381,128.501892 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M175.709351,57.719334 
    	C176.550934,58.817890 177.098373,59.650784 177.562897,60.975128 
    	C177.078934,63.031769 176.677917,64.596962 176.428726,65.569527 
    	C177.829315,67.307091 178.914658,68.653549 179.999084,70.381882 
    	C179.997009,71.527832 179.995865,72.291908 179.994720,73.055977 
    	C179.532654,73.088051 179.070602,73.120117 178.041931,72.801987 
    	C176.289658,72.680916 175.103989,72.910034 173.918335,73.139153 
    	C173.488098,73.137085 173.057877,73.135017 172.421631,72.795273 
    	C172.475647,71.972931 172.735687,71.488289 172.995728,71.003639 
    	C172.368149,68.195930 171.852463,65.356606 171.071213,62.592327 
    	C170.599548,60.923458 169.715485,59.371136 169.007446,57.394104 
    	C171.137161,57.165733 173.276169,57.309700 175.709351,57.719334 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M182.085037,107.595779 
    	C180.390244,108.760712 178.696030,109.556992 177.000900,110.676636 
    	C177.000000,111.000000 177.001526,110.998474 176.751450,111.000366 
    	C176.334656,111.001785 176.167938,111.001312 176.000610,111.000412 
    	C176.000000,111.000000 175.998886,110.999084 175.959381,110.679276 
    	C175.279922,109.907684 174.639969,109.455902 174.000000,109.004112 
    	C173.120209,107.840935 172.240417,106.677757 171.157990,104.958527 
    	C170.638885,103.927307 170.322464,103.452133 170.006012,102.976967 
    	C170.004837,102.538948 170.003662,102.100937 170.251038,101.110245 
    	C170.243958,99.457954 169.988312,98.358330 169.732666,97.258705 
    	C174.311127,100.010483 179.833038,101.593117 182.085037,107.595779 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M203.259232,144.196594 
    	C203.008621,142.929367 203.003860,141.864410 202.998016,140.400040 
    	C205.058304,137.667252 205.347504,135.310959 203.821121,132.420944 
    	C202.552078,130.018188 201.945267,127.265671 201.059937,124.275352 
    	C205.892181,130.635727 208.157150,138.318268 209.144531,146.709656 
    	C208.172119,146.106644 207.335342,145.210602 206.343369,144.148346 
    	C206.072311,144.824844 205.733749,145.669861 205.151352,147.123413 
    	C204.410126,145.896713 203.957596,145.147812 203.259232,144.196594 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M219.267761,85.251060 
    	C219.000000,84.238068 219.002930,83.479317 219.009399,82.341064 
    	C221.995224,85.400536 224.977539,88.839500 228.073273,92.603821 
    	C223.175903,91.827538 224.587372,96.722893 222.285812,100.007118 
    	C221.225357,94.409538 220.381897,89.957420 219.267761,85.251060 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M45.526508,181.522446 
    	C49.123486,180.735748 53.899353,182.312378 55.002014,176.364777 
    	C55.049103,176.110809 56.512371,176.119400 57.726902,176.002014 
    	C59.840504,179.876282 57.944405,182.339081 54.798641,184.194733 
    	C51.042953,186.410202 48.207516,184.693985 45.526508,181.522446 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M194.999084,204.000610 
    	C201.622086,196.706512 204.887772,187.775650 207.961060,178.247711 
    	C208.672806,178.006058 208.850662,178.007584 209.028534,178.009109 
    	C205.719513,186.104858 202.444092,194.214752 199.047546,202.273621 
    	C198.721420,203.047424 197.641785,203.503662 196.259399,204.064240 
    	C195.404327,204.014404 195.201843,204.007675 194.999359,204.000961 
    	C194.999359,204.000961 195.000000,204.000000 194.999084,204.000610 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M122.066284,71.019142 
    	C122.066284,71.019142 122.505775,71.015923 123.061684,70.884491 
    	C125.409309,70.172707 127.201035,69.592346 128.992752,69.011978 
    	C128.994247,69.456253 128.995758,69.900528 128.733887,70.869331 
    	C127.567444,72.193657 126.664360,72.993462 125.761276,73.793259 
    	C122.070351,74.910637 118.379425,76.028015 114.349243,77.054024 
    	C116.102959,74.979622 118.195946,72.996597 120.659912,71.253586 
    	C121.188919,71.752007 121.346947,72.010406 121.504982,72.268806 
    	C121.692085,71.852249 121.879189,71.435699 122.066284,71.019142 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M94.784630,203.943253 
    	C89.214371,202.387024 83.644104,200.830795 77.869263,199.028717 
    	C83.521370,196.661713 88.485558,200.138397 93.967194,201.951080 
    	C94.344620,203.011215 94.564621,203.477234 94.784630,203.943253 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M169.515991,97.067932 
    	C169.988312,98.358330 170.243958,99.457954 170.251038,100.781738 
    	C168.575073,100.744705 167.047318,100.021370 165.738464,100.305710 
    	C161.113190,101.310539 160.146439,99.148735 160.870209,94.922638 
    	C163.713562,95.375092 166.506454,96.126129 169.515991,97.067932 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M168.024429,167.023041 
    	C163.794296,164.826614 163.601959,161.963135 166.484818,158.437103 
    	C167.560593,157.121323 168.357971,155.577927 169.625824,154.063965 
    	C169.981979,155.060120 169.994598,156.130646 169.984772,157.897430 
    	C169.316345,161.403473 168.670380,164.213257 168.024429,167.023041 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M30.613407,95.982643 
    	C30.464766,97.883652 29.892618,99.912247 29.521748,101.976990 
    	C29.144577,104.076828 28.965727,106.212303 28.585087,109.249245 
    	C27.589081,110.718933 25.913212,113.191811 23.875664,115.802444 
    	C25.768732,109.335495 28.023479,102.730797 30.613407,95.982643 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M182.087570,200.929108 
    	C182.993927,201.053146 183.660095,201.372147 184.663239,201.845673 
    	C185.000198,202.000198 185.007019,202.006805 185.007019,202.006805 
    	C183.963837,205.187103 182.920670,208.367416 181.623306,212.322678 
    	C180.148895,210.691895 179.235062,209.681137 178.178528,208.381271 
    	C179.306351,205.769470 180.576859,203.446747 182.087570,200.929108 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M168.018860,167.443130 
    	C168.670380,164.213257 169.316345,161.403473 169.937836,158.149048 
    	C170.370773,159.326614 171.455307,161.068390 171.172882,162.549515 
    	C170.154907,167.887863 168.676270,173.138382 167.141098,178.694717 
    	C166.861786,178.152405 166.812988,177.337463 166.865479,176.252289 
    	C167.315628,173.275772 167.664459,170.569504 168.018860,167.443130 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M155.000000,19.021950 
    	C152.928055,19.930607 150.856094,20.839264 148.784149,21.747921 
    	C148.181931,20.204697 147.579727,18.661470 146.970337,16.733513 
    	C149.599564,16.484411 152.235962,16.620043 155.156342,16.969204 
    	C155.440292,17.182730 155.262802,17.615665 154.966797,17.899473 
    	C154.780533,18.462837 154.890274,18.742392 155.000000,19.021950 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M154.845978,129.600204 
    	C155.651810,134.993790 150.481339,133.370911 148.222000,135.715012 
    	C148.000000,136.000000 147.993698,136.006241 147.993698,136.006241 
    	C147.508240,134.819794 147.022781,133.633347 146.283478,132.232758 
    	C147.458939,130.965454 148.888245,129.912277 150.706665,129.246460 
    	C151.397385,129.944489 151.699005,130.255188 152.000610,130.565887 
    	C152.326630,130.098434 152.652649,129.630966 152.978668,129.163513 
    	C153.537125,129.236130 154.095566,129.308762 154.845978,129.600204 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M91.735718,164.211792 
    	C92.437477,165.996445 93.099899,167.956711 93.258560,169.956940 
    	C93.351768,171.132034 92.643944,172.370651 92.095024,173.881088 
    	C89.976929,173.043198 86.511192,173.373734 87.638466,169.136505 
    	C89.035324,167.308502 90.260017,165.856339 91.735718,164.211792 
    M90.586227,170.513275 
    	C90.586227,170.513275 90.483734,170.575043 90.586227,170.513275 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M79.130661,84.763550 
    	C80.459808,86.419479 81.508415,88.207764 83.211815,91.112732 
    	C80.604591,91.267250 78.508560,91.391472 76.180740,91.780823 
    	C75.680756,92.010635 75.412560,91.975311 74.742188,91.877075 
    	C75.843384,89.508080 77.346756,87.201996 79.130661,84.763550 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M138.196716,148.686707 
    	C136.926804,146.153091 140.012314,141.461746 133.752533,141.421631 
    	C135.159622,139.345490 136.094299,137.966385 137.087860,136.201370 
    	C140.918076,139.666367 139.591293,144.035095 138.196716,148.686707 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M74.706787,126.257004 
    	C75.993690,125.067200 77.018326,124.131203 78.073166,122.962021 
    	C82.025330,125.494713 77.954742,127.786392 77.481323,130.649292 
    	C77.308601,130.996841 76.950562,131.027390 76.950562,131.027390 
    	C73.431107,131.011139 73.670715,128.909180 74.706787,126.257004 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M83.199371,100.243820 
    	C83.021667,97.039375 82.951668,94.208824 87.496620,95.525490 
    	C88.566307,95.835373 90.081123,94.608727 91.751259,94.064484 
    	C90.237602,96.231468 88.363853,98.422920 86.178177,100.790405 
    	C85.043488,100.809349 84.220718,100.652252 83.199371,100.243820 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M145.457581,34.903297 
    	C145.007263,34.121376 145.003830,33.413982 145.000198,32.352852 
    	C149.430893,32.011986 153.861786,32.024864 158.730408,32.082573 
    	C155.366638,35.961285 150.591400,35.264168 145.457581,34.903297 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M126.114410,73.868317 
    	C126.664360,72.993462 127.567444,72.193657 128.736603,71.202530 
    	C131.133698,70.142258 133.264740,69.273315 135.696838,68.241516 
    	C137.018173,68.507736 138.038437,68.936836 138.641785,69.718170 
    	C134.784180,71.404564 131.343491,72.738716 127.902794,74.072876 
    	C127.424377,74.029701 126.945961,73.986534 126.114410,73.868317 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M107.654449,21.948864 
    	C108.229774,24.753584 108.458168,27.567253 108.843719,30.690765 
    	C107.671211,29.913742 106.313217,28.859289 105.020760,27.729849 
    	C103.969620,26.811291 102.997017,25.802864 101.859726,24.507343 
    	C103.589081,23.439533 105.448303,22.698673 107.654449,21.948864 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M209.448090,170.013794 
    	C209.057480,169.458710 209.025650,168.632156 208.990234,167.151978 
    	C208.986618,166.498337 208.984848,166.016953 208.984848,166.016953 
    	C208.985779,164.936264 208.986710,163.855576 208.985779,161.947250 
    	C208.979065,159.426270 208.974243,157.732910 208.969421,156.039566 
    	C208.988541,153.594696 209.007645,151.149811 209.048935,148.244019 
    	C209.530518,149.196564 210.391022,150.613312 210.379440,152.022903 
    	C210.330872,157.930573 210.021027,163.836060 209.448090,170.013794 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M128.340790,74.116570 
    	C131.343491,72.738716 134.784180,71.404564 138.600342,70.036133 
    	C139.250168,70.328888 139.524521,70.655907 139.847397,71.304779 
    	C136.190201,72.471169 132.484497,73.315720 128.340790,74.116570 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M95.258835,203.962601 
    	C94.564621,203.477234 94.344620,203.011215 94.064728,202.290985 
    	C97.694946,202.012527 101.385063,201.988251 105.533890,202.006973 
    	C103.227325,206.169968 99.089447,203.001038 95.258835,203.962601 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M235.994675,108.614517 
    	C235.843063,108.994507 235.673019,108.994904 235.247833,108.995392 
    	C233.682571,105.494621 232.372437,101.993752 231.089508,98.083328 
    	C232.736572,101.194153 234.356415,104.714531 235.994675,108.614517 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M192.828690,174.210632 
    	C193.432556,173.997314 193.869751,173.995163 194.773804,174.166901 
    	C195.820923,174.224136 196.401154,174.107452 196.981400,173.990784 
    	C196.840729,175.718857 196.700073,177.446915 196.215958,178.738098 
    	C194.913345,177.868362 193.954193,177.435532 192.995026,177.002686 
    	C192.884018,176.142380 192.773026,175.282089 192.828690,174.210632 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M38.016411,176.377457 
    	C40.241993,177.535828 42.578556,179.016129 44.965256,180.857147 
    	C42.719395,179.711700 40.423393,178.205536 38.016411,176.377457 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M116.634377,199.574402 
    	C115.568268,203.687805 111.949226,201.610519 109.070312,202.014374 
    	C111.304649,200.994873 113.760880,200.265915 116.634377,199.574402 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M177.000000,111.999695 
    	C175.629593,112.659767 174.259171,113.319839 172.532166,113.979218 
    	C171.823288,113.543327 171.471024,113.108124 171.023499,112.406570 
    	C171.717468,111.763290 172.506668,111.386368 173.979935,111.008362 
    	C175.108963,111.004555 175.553925,111.001816 175.998886,110.999084 
    	C175.998886,110.999084 176.000000,111.000000 176.113007,111.215630 
    	C176.428207,111.696808 176.686203,111.886490 177.000000,112.000153 
    	C177.000000,112.000000 177.000000,111.999695 177.000000,111.999695 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M162.278076,111.186401 
    	C163.860703,110.770348 165.702805,110.602928 167.758484,110.681244 
    	C166.160553,111.096336 164.349060,111.265686 162.278076,111.186401 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M172.625381,70.996445 
    	C172.735687,71.488289 172.475647,71.972931 172.109070,72.711716 
    	C170.570206,72.670097 169.137848,72.374352 167.362274,71.922386 
    	C168.764374,71.507202 170.509705,71.248222 172.625381,70.996445 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M54.053650,168.632782 
    	C52.794258,167.503036 51.421032,166.064865 50.074360,164.246674 
    	C51.380547,165.352570 52.660179,166.838486 54.053650,168.632782 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M174.085495,73.379578 
    	C175.103989,72.910034 176.289658,72.680916 177.712677,72.684334 
    	C176.717590,73.151253 175.485123,73.385628 174.085495,73.379578 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M190.315033,186.369736 
    	C190.225266,188.080902 189.749084,189.882843 188.830460,191.529968 
    	C188.901550,189.736938 189.415100,188.098740 190.315033,186.369736 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M58.192692,174.686462 
    	C57.120014,173.589935 56.067383,172.138596 55.013313,170.325912 
    	C56.078835,171.420258 57.145786,172.875946 58.192692,174.686462 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M167.993515,144.644852 
    	C167.058167,143.486099 166.114365,141.974701 165.244843,140.083923 
    	C166.207779,141.233765 167.096405,142.762985 167.993515,144.644852 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M209.191406,177.732651 
    	C208.850662,178.007584 208.672806,178.006058 208.227631,178.001648 
    	C207.965118,177.559814 207.969925,177.120834 207.965897,176.353149 
    	C208.112930,174.850128 208.268768,173.675858 208.685028,172.261047 
    	C209.081711,173.832413 209.218002,175.644302 209.191406,177.732651 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M161.978531,23.644676 
    	C161.008499,22.816763 160.041016,21.640163 159.077133,20.099167 
    	C160.047501,20.921843 161.014282,22.108915 161.978531,23.644676 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M192.925980,177.373657 
    	C193.954193,177.435532 194.913345,177.868362 195.927460,178.640594 
    	C195.192368,179.304001 194.402313,179.628021 193.290421,179.974319 
    	C192.931366,179.245926 192.894150,178.495270 192.925980,177.373657 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M22.969196,117.337196 
    	C23.165411,118.430290 23.245382,119.830185 23.194450,121.537102 
    	C22.993351,120.444084 22.923151,119.044037 22.969196,117.337196 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M129.599716,58.298950 
    	C129.096573,58.865276 128.237244,59.435047 127.117195,60.033092 
    	C127.652168,59.475044 128.447845,58.888718 129.599716,58.298950 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M148.215546,71.319717 
    	C148.856339,70.917778 149.711990,70.710831 150.781479,70.701591 
    	C150.140350,71.104439 149.285370,71.309570 148.215546,71.319717 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M31.888834,167.326981 
    	C32.588943,167.809052 33.274212,168.622803 33.947113,169.809875 
    	C33.247829,169.341705 32.560913,168.500168 31.888834,167.326981 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M34.579552,171.431351 
    	C35.257183,171.921692 36.043262,172.732498 36.761112,173.917847 
    	C36.024590,173.445526 35.356297,172.598663 34.579552,171.431351 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M201.067841,123.621902 
    	C200.427597,123.220848 199.724655,122.511398 199.015350,121.450348 
    	C199.674362,121.837013 200.339767,122.575256 201.067841,123.621902 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M180.224426,73.135696 
    	C179.995865,72.291908 179.997009,71.527832 180.250305,70.381660 
    	C180.669922,69.999199 180.837402,69.998833 181.004883,69.998474 
    	C181.060974,70.855522 181.117050,71.712570 181.053253,72.851395 
    	C180.933365,73.133171 180.454117,73.215424 180.224426,73.135696 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M160.456604,31.066565 
    	C160.526184,30.170410 160.906967,29.147398 161.641953,28.063866 
    	C161.586700,28.982132 161.177246,29.960920 160.456604,31.066565 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M192.468613,183.589905 
    	C192.323730,184.370850 191.750900,185.150162 190.750458,185.922424 
    	C190.895447,185.139694 191.468063,184.363983 192.468613,183.589905 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M174.664825,209.097290 
    	C174.150955,209.441452 173.283569,209.803223 172.150146,210.059753 
    	C172.693176,209.674652 173.502243,209.394791 174.664825,209.097290 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M152.657928,129.070190 
    	C152.652649,129.630966 152.326630,130.098434 152.000610,130.565887 
    	C151.699005,130.255188 151.397385,129.944489 151.053406,129.352661 
    	C151.453110,129.039963 151.895157,129.008408 152.657928,129.070190 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M63.852051,120.193665 
    	C64.084778,120.645081 64.063301,121.232079 63.824295,121.888596 
    	C63.603786,121.415169 63.600811,120.872200 63.852051,120.193665 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M76.876785,131.245850 
    	C76.950562,131.027390 77.308601,130.996841 77.488182,130.992126 
    	C77.784332,131.605423 77.900909,132.223450 77.738266,132.882690 
    	C77.240372,132.437378 77.021690,131.950836 76.876785,131.245850 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M135.012222,132.648712 
    	C134.448425,132.510117 133.778763,132.083939 133.055069,131.333450 
    	C133.636139,131.459808 134.271255,131.910477 135.012222,132.648712 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M64.018768,138.374756 
    	C64.360657,138.871002 64.651558,139.724518 64.913742,140.937515 
    	C64.579285,140.442001 64.273529,139.587021 64.018768,138.374756 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M176.065216,207.623718 
    	C175.858582,208.184586 175.669571,208.467545 175.256317,208.878571 
    	C175.158783,208.276413 175.285507,207.546188 175.412231,206.815964 
    	C175.635757,206.992584 175.859314,207.169205 176.065216,207.623718 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M144.752731,16.245026 
    	C144.872208,16.668543 144.717712,17.035343 144.563232,17.402142 
    	C144.383972,17.213694 144.204742,17.025251 143.997009,16.627438 
    	C144.138611,16.341480 144.308685,16.264894 144.752731,16.245026 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M195.000397,204.351410 
    	C195.201843,204.007675 195.404327,204.014404 195.910049,204.055756 
    	C196.016068,204.675354 195.818863,205.260315 195.333191,205.974945 
    	C195.030304,205.637009 195.015869,205.169434 195.000397,204.351410 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M80.614166,82.859535 
    	C80.669907,83.320961 80.453056,83.943909 79.884979,84.603897 
    	C79.803024,84.100975 80.072304,83.561020 80.614166,82.859535 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M153.114548,148.375519 
    	C153.418701,148.654709 153.651428,149.276489 153.848358,150.247879 
    	C153.556061,149.971039 153.299591,149.344574 153.114548,148.375519 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M62.947151,124.326797 
    	C63.116180,124.007858 63.558762,124.005585 63.780064,124.003998 
    	C63.764950,124.586037 63.528534,125.169647 63.005039,125.910400 
    	C62.738018,125.593605 62.758068,125.119667 62.947151,124.326797 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M36.710594,174.484955 
    	C37.081181,174.606033 37.497398,175.024780 37.927895,175.766769 
    	C37.546848,175.654221 37.151535,175.218430 36.710594,174.484955 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M137.188126,135.616089 
    	C136.840820,135.467346 136.457458,134.999161 136.073898,134.204910 
    	C136.433167,134.351456 136.792603,134.824036 137.188126,135.616089 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M96.710693,160.657715 
    	C96.435287,160.692108 96.330994,160.590317 96.226692,160.488541 
    	C96.445061,160.499542 96.663437,160.510529 96.710693,160.657715 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M165.169800,139.503448 
    	C164.926102,139.664322 164.597626,139.535049 164.124573,139.175446 
    	C164.348328,139.034515 164.716690,139.123901 165.169800,139.503448 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M159.341614,32.100388 
    	C159.266541,31.878548 159.461777,31.569641 159.922134,31.165176 
    	C159.995468,31.384188 159.803680,31.698751 159.341614,32.100388 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M136.025192,133.710297 
    	C135.833252,133.767181 135.542053,133.571045 135.140778,133.130249 
    	C135.329102,133.076141 135.627533,133.266708 136.025192,133.710297 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M194.306488,209.058899 
    	C194.095123,208.811340 194.238297,208.525925 194.681854,208.153412 
    	C194.775360,208.334488 194.668289,208.652725 194.306488,209.058899 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M169.784271,103.155502 
    	C170.322464,103.452133 170.638885,103.927307 170.977051,104.700165 
    	C170.520020,104.443253 170.041275,103.888641 169.784271,103.155502 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M175.959381,110.679276 
    	C175.553925,111.001816 175.108963,111.004555 174.330170,111.004105 
    	C173.996506,110.557137 173.996658,110.113365 173.998413,109.336853 
    	C174.639969,109.455902 175.279922,109.907684 175.959381,110.679276 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M184.997955,201.996918 
    	C185.335739,201.752960 185.675781,201.512299 186.015823,201.271637 
    	C186.099274,201.390701 186.182724,201.509781 186.266159,201.628860 
    	C186.001068,201.743500 185.735962,201.858139 185.238953,201.989792 
    	C185.007019,202.006805 185.000198,202.000198 184.997955,201.996918 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M155.001129,18.767162 
    	C154.890274,18.742392 154.780533,18.462837 154.835403,18.093040 
    	C155.000763,18.172661 155.001511,18.342518 155.001129,18.767162 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M73.458801,147.526108 
    	C73.431473,147.477325 73.486122,147.574890 73.458801,147.526108 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M197.015869,173.713104 
    	C196.401154,174.107452 195.820923,174.224136 195.101501,174.154022 
    	C195.318451,169.903351 195.674591,165.839478 196.038361,161.423889 
    	C196.483231,161.043900 196.920486,161.015594 197.681549,161.329895 
    	C198.342148,162.439255 198.678925,163.206009 199.015701,163.972763 
    	C199.020340,164.142548 199.024963,164.312347 199.032745,164.736740 
    	C199.444824,167.615982 199.853714,170.240616 200.257172,172.830368 
    	C198.908249,173.084885 197.979294,173.260162 197.015869,173.713104 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M200.993896,161.998688 
    	C201.802719,161.847565 202.611557,161.696457 203.420380,161.545349 
    	C202.744110,162.151596 202.067856,162.757843 201.194839,162.931870 
    	C200.996689,162.332657 200.995285,162.165665 200.993896,161.998688 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M208.705414,156.285919 
    	C208.974243,157.732910 208.979065,159.426270 208.978577,161.542053 
    	C208.795959,160.153732 208.618668,158.343002 208.705414,156.285919 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M200.677246,161.971863 
    	C200.995285,162.165665 200.996689,162.332657 200.996597,162.750122 
    	C200.449417,163.168121 199.903717,163.335648 199.186859,163.737961 
    	C198.678925,163.206009 198.342148,162.439255 198.010712,161.335968 
    	C198.797562,161.314636 199.579086,161.629822 200.677246,161.971863 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M203.373245,158.446014 
    	C202.943726,158.334335 202.680374,158.062790 202.437485,157.774033 
    	C202.431198,157.766556 202.648605,157.570938 202.761688,157.463074 
    	C203.021820,157.736679 203.281967,158.010269 203.373245,158.446014 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M208.827789,166.103088 
    	C208.984848,166.016953 208.986618,166.498337 208.983444,166.738708 
    	C208.818619,166.818604 208.641006,166.669800 208.508026,166.488297 
    	C208.479462,166.449295 208.612274,166.292023 208.827789,166.103088 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M129.258362,68.766464 
    	C127.201035,69.592346 125.409309,70.172707 123.281174,70.873825 
    	C124.054657,69.156754 124.745209,66.624725 126.371750,65.642166 
    	C128.874878,64.130104 130.607346,65.191673 129.258362,68.766464 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M121.800690,71.012306 
    	C121.879189,71.435699 121.692085,71.852249 121.504982,72.268806 
    	C121.346947,72.010406 121.188919,71.752007 121.017319,71.247261 
    	C121.180870,71.002441 121.357979,71.003960 121.800690,71.012306 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M181.002991,69.589447 
    	C180.837402,69.998833 180.669922,69.999199 180.251221,69.999786 
    	C178.914658,68.653549 177.829315,67.307091 176.428726,65.569527 
    	C176.677917,64.596962 177.078934,63.031769 177.745316,61.232010 
    	C179.007477,63.725098 180.004288,66.452759 181.002991,69.589447 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M176.999298,111.000710 
    	C177.536301,111.350426 178.073990,111.699432 178.611679,112.048431 
    	C178.236282,112.087112 177.860886,112.125793 177.242737,112.082085 
    	C177.000000,111.999695 177.000000,112.000000 176.997711,111.749695 
    	C176.997437,111.332420 176.999481,111.165451 177.001526,110.998474 
    	C177.001526,110.998474 177.000000,111.000000 176.999298,111.000710 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M177.520157,114.543777 
    	C177.472870,114.570267 177.567444,114.517281 177.520157,114.543777 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M148.003052,135.997162 
    	C148.551788,136.442276 149.097473,136.890213 149.643158,137.338165 
    	C149.310349,137.639709 148.977524,137.941238 148.644714,138.242783 
    	C148.428040,137.700821 148.211380,137.158844 147.994202,136.311554 
    	C147.993698,136.006241 148.000000,136.000000 148.003052,135.997162 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M176.751450,111.000366 
    	C176.999481,111.165451 176.997437,111.332420 176.997711,111.749847 
    	C176.686203,111.886490 176.428207,111.696808 176.113617,111.216049 
    	C176.167938,111.001312 176.334656,111.001785 176.751450,111.000366 
    z"/>
    <path fill="#F7F5F3" opacity="1" stroke="none" 
    	d="
    M90.534981,170.544159 
    	C90.483734,170.575043 90.586227,170.513275 90.534981,170.544159 
    z"/>
  </g>
</g>
`;var Tl="TraceMind\u884C\u52A8\u770B\u677F",hd="\u884C\u52A8\u770B\u677F";function $h(t){return`\u751F\u6210\u4E86\u884C\u52A8\u4EFB\u52A1\u300C${t.trim()||"\u672A\u547D\u540D\u4EFB\u52A1"}\u300D\uFF0C\u8BE6\u89C1 [[${Tl}|${hd}]]`}var Yn="tracemind-block-editor",ya="Daily",Jh="\u8BB0\u5F55\uFF0C\u662FAI\u65F6\u4EE3\u7684\u4EBA\u751F\u590D\u5229\u3002";function bd(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,t=>{let e=Math.random()*16|0;return(t==="x"?e:e&3|8).toString(16)})}function kd(t){let e=0;for(let i=0;i<t.length;i++){let a=t.charCodeAt(i);e=(e<<5)-e+a,e=e&e}let n=Math.abs(e).toString(16).padStart(8,"0");return`${n.substring(0,8)}-${n.substring(0,4)}-4${n.substring(0,3)}-${n.substring(0,4)}-${n.substring(0,12)}`}function Bl(t){let e=Array.isArray(t)?t.join(" "):t||"";return Array.from(new Set(e.split(/[\s,，#]+/).map(n=>n.trim()).filter(Boolean))).slice(0,6)}function Ed(t){return Bl(t).join(" ")||"\u5F85\u5206\u6790"}function _l(t){return Bl(t).map(e=>`#${e}`).join(" ")||"#\u5F85\u5206\u6790"}function Wh(t){return t instanceof HTMLElement?!!t.closest("a, .internal-link, [data-href], .external-link"):!1}function o7(t){if(!(t instanceof HTMLElement))return null;let e=t.closest("a, .internal-link, [data-href]");if(!e)return null;let n=e.getAttribute("data-href")||e.getAttribute("href")||e.getAttribute("aria-label")||e.textContent||"",i=decodeURIComponent(n.trim()),a=i.match(/(?:^|[/"'(\s])(explorations\/[^"'()\s#?]+\.canvas)\b/i)||i.match(/(?:^|[/"'(\s])([^/"'()\s#?]+\.canvas)\b/i);if(!a)return null;let r=a[1];return r.startsWith("explorations/")?r:`explorations/${r}`}function l7(t){if(!(t instanceof HTMLElement))return!1;let e=t.closest("a, .internal-link, [data-href]");if(!e)return!1;let n=e.getAttribute("data-href")||e.getAttribute("href")||e.getAttribute("aria-label")||e.textContent||"",i=decodeURIComponent(n.trim());return i===Tl||i===hd||i.includes(Tl)}var Ks=class extends ct.ItemView{plugin;blocks=[];selectedBlockId=null;currentDate;inputValue="";isLoading=!1;contentContainer=null;childInputEl=null;selectedBlockContent=null;inputAreaEl=null;inputTextarea=null;inputHintEl=null;inputAppendFooterEl=null;appendModeActionsEl=null;explorationSelectionMode=!1;selectedExplorationBlockIds=new Set;appendSubmitBtn=null;isAppendMode=!1;appendModeBlockId=null;isEditMode=!1;editModeBlockId=null;flowLineEl=null;constructor(e,n){super(e),this.plugin=n,this.currentDate=this.formatDate(new Date)}getBlockById(e){return this.blocks.find(n=>n.id===e)}focusBlockById(e){if(this.blocks.find(i=>i.id===e))return this.selectedBlockId=e,this.isAppendMode=!1,this.appendModeBlockId=null,this.isEditMode=!1,this.editModeBlockId=null,this.renderBlocks(),this.scrollBlockIntoView(e),!0;for(let i of this.blocks)if(i.children.find(r=>r.id===e))return this.selectedBlockId=e,this.isAppendMode=!1,this.appendModeBlockId=null,this.isEditMode=!1,this.editModeBlockId=null,this.renderBlocks(),this.scrollBlockIntoView(e,!0),!0;return!1}startAppendForBlock(e,n){let i=e;if(!this.blocks.find(r=>r.id===e)){let r=this.blocks.find(s=>s.children.some(o=>o.id===e));if(!r)return!1;i=r.id}return this.selectBlock(i),this.scrollBlockIntoView(i),n&&this.inputTextarea&&(this.inputTextarea.placeholder=n,this.inputHintEl&&(this.inputHintEl.textContent=n,this.inputHintEl.removeAttribute("style")),setTimeout(()=>this.inputTextarea?.focus(),0)),!0}async appendActionTaskChildBlock(e,n){if(!e)return!1;let i=this.blocks.find(s=>s.id===e);if(i||(i=this.blocks.find(s=>s.children.some(o=>o.id===e))),!i)return!1;let a=$h(n),r=await this.appendChildToBlock(i,a);return r?(i.children.push(r),this.renderBlocks(),!0):!1}getViewType(){return Yn}getDisplayText(){return"TraceMind \u65E5\u8BB0"}getIcon(){return ma}async setCurrentDate(e){this.currentDate=this.formatDate(e),await this.renderView()}async renderView(){let e=this.containerEl;e.empty();let n=e.createEl("div",{cls:"lifewiki-diary-container",attr:{style:"display: flex; flex-direction: column; height: 100%;"}});this.addStyles();let i=n.createEl("div",{cls:"lifewiki-diary-header"}),a=i.createEl("h1",{cls:"lifewiki-diary-date"});a.createEl("span",{text:"\u{1F4C5}",cls:"lifewiki-diary-date-icon"}),a.createEl("span",{text:this.currentDate});let r=await this.loadSlogan();i.createEl("span",{text:r,cls:"lifewiki-diary-tagline"});let s=wl(this.plugin.settings),o=n.createEl("div",{cls:"lifewiki-flow-header"});o.createEl("h2",{text:"Flow of Today\uFF1A",cls:"lifewiki-diary-section-title"});let l=this.plugin.settings.actionBoard?.enabled??!0;if(s||this.plugin.settings.exploration.enabled||l){let c=o.createEl("div",{cls:"lifewiki-flow-actions"});if(s||this.plugin.settings.exploration.enabled){let u={title:s?"\u9009\u62E9\u65E5\u8BB0 block \u8FDB\u5165\u601D\u8003\u63A2\u7D22\u767D\u677F":"\u8BF7\u5148\u5728\u8BBE\u7F6E\u4E2D\u542F\u7528\u601D\u8003\u63A2\u7D22\u5E76\u68C0\u6D4B\u672C\u5730 Agent",type:"button"};s||(u.disabled="true");let d=c.createEl("button",{cls:`lifewiki-exploration-btn${this.explorationSelectionMode?" is-active":""}`,text:this.explorationSelectionMode?"\u53D6\u6D88\u9009\u62E9":"\u601D\u8003\u63A2\u7D22",attr:u});c.createEl("span",{text:s?"\u9009\u62E9\u65E5\u8BB0\u8FDB\u5165\u601D\u8003\u63A2\u7D22\u767D\u677F\uFF0C\u8BA9 AI \u5E2E\u4F60\u8FFD\u95EE\u3001\u53D1\u6563\u548C\u63A8\u6F14\u3002":"\u8BF7\u5148\u5728\u8BBE\u7F6E\u4E2D\u542F\u7528\u601D\u8003\u63A2\u7D22\uFF0C\u5E76\u914D\u7F6E\u53EF\u7528\u7684\u672C\u5730 Agent\u3002",cls:"lifewiki-exploration-tooltip"}),s&&d.addEventListener("click",()=>this.toggleExplorationSelection())}if(l&&c.createEl("button",{cls:"lifewiki-action-board-btn",text:"\u884C\u52A8\u770B\u677F",attr:{type:"button",title:"\u67E5\u770B\u4ECE\u65E5\u8BB0\u548C AI \u5BF9\u8BDD\u751F\u6210\u7684\u884C\u52A8\u4EFB\u52A1"}}).addEventListener("click",()=>this.plugin.openActionBoard()),this.explorationSelectionMode){c.createEl("span",{text:`\u5DF2\u9009 ${this.selectedExplorationBlockIds.size} \u4E2A block`,cls:"lifewiki-exploration-count"});let u={type:"button"};this.selectedExplorationBlockIds.size===0&&(u.disabled="true"),c.createEl("button",{text:"\u8FDB\u5165\u601D\u8003\u63A2\u7D22\u767D\u677F",cls:"lifewiki-exploration-enter-btn",attr:u}).addEventListener("click",()=>this.enterExploration())}}this.contentContainer=n.createEl("div",{cls:"lifewiki-diary-content",attr:{style:"flex: 1; overflow-y: auto;"}}),await this.loadBlocks(),this.createInputArea(n),n.addEventListener("click",c=>{let u=c.target,d=u.closest(".lifewiki-block.editing, .lifewiki-block-group.editing, .lifewiki-block-child.editing"),p=u.closest(".lifewiki-block, .lifewiki-block-group, .lifewiki-block-child"),f=u.closest(".lifewiki-input-area");this.isEditMode&&!d&&this.exitEditMode(),this.isAppendMode&&!p&&!f&&this.cancelAppendMode(),!this.isAppendMode&&!this.isEditMode&&!p&&(this.selectedBlockId=null,this.plugin.getAIAnalysisView()?.clearConversation(),this.renderBlocks())})}async onOpen(){await this.plugin.ensureAIAnalysisPanelVisible(),await this.renderView()}addStyles(){let e=document.createElement("style");e.textContent=`
			/* Design System: "The Intellectual Atelier" - Light Editorial Theme */

			/* Design Tokens */
			:root {
				--surface: #f9f9f9;
				--surface-container-low: #f3f3f3;
				--surface-container-lowest: #ffffff;
				--surface-container-high: #e8e8e8;
				--surface-variant: #e2e2e2;
				--on-surface: #1a1c1c;
				--on-surface-variant: #4a4453;
				--outline-variant: rgba(204, 195, 214, 0.4);
				--outline: #7b7485;
				--primary: #5c28b8;
				--primary-container: #7546d2;
				--on-primary: #ffffff;
				--on-primary-container: #eadcff;
				--secondary: #67558e;
				--tertiary: #724100;
				--tertiary-container: #935500;
				--font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
			}

			/* Ghost Border - 15% opacity outline-variant */
			.ghost-border {
				border: 1px solid rgba(204, 195, 214, 0.15);
			}

			/* Ambient Shadow */
			.ambient-shadow {
				box-shadow: 0 10px 40px -10px rgba(26, 28, 28, 0.06);
			}

			/* Main Container */
			.lifewiki-diary-container {
				height: 100%;
				width: 100%;
				overflow: hidden;
				padding: 0;
				box-sizing: border-box;
				font-family: var(--font-body);
				background: var(--surface);
				color: var(--on-surface);
			}

			/* Header */
			.lifewiki-diary-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 20px 48px 24px;
				margin-bottom: 8px;
			}

			.lifewiki-diary-date {
				font-size: 28px;
				font-weight: 700;
				letter-spacing: -0.02em;
				margin: 0;
				color: var(--on-surface);
				font-family: var(--font-body);
				display: flex;
				align-items: center;
				gap: 10px;
			}

			.lifewiki-diary-date-icon {
				font-size: 22px;
			}

			.lifewiki-diary-tagline {
				font-size: 13px;
				color: var(--on-surface-variant);
				font-style: italic;
				font-family: var(--font-body);
			}

			/* Section Title */
				.lifewiki-diary-section-title {
					font-size: 13px;
					font-weight: 500;
					color: var(--on-surface-variant);
					margin-bottom: 20px;
				padding: 0 48px;
				letter-spacing: 0.05em;
					text-transform: uppercase;
					font-family: var(--font-body);
				}

				.lifewiki-flow-header {
					display: flex;
					align-items: center;
					justify-content: space-between;
					gap: 16px;
					padding: 0 48px;
					margin-bottom: 20px;
				}

				.lifewiki-flow-header .lifewiki-diary-section-title {
					margin: 0;
					padding: 0;
				}

				.lifewiki-flow-actions {
					display: flex;
					align-items: center;
					justify-content: flex-end;
					gap: 8px;
					margin-left: auto;
					min-width: 0;
					position: relative;
				}

				.lifewiki-exploration-btn,
				.lifewiki-exploration-enter-btn,
				.lifewiki-action-board-btn {
					appearance: none;
					display: inline-flex;
					align-items: center;
					justify-content: center;
					height: 30px;
					padding: 0 14px;
					border-radius: 999px;
					border: 1px solid rgba(204, 195, 214, 0.35);
					font-size: 12px;
					font-weight: 600;
					line-height: 1;
					font-family: var(--font-body);
					white-space: nowrap;
					cursor: pointer;
					transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease, box-shadow 0.16s ease;
				}

				.lifewiki-flow-actions .lifewiki-exploration-btn:not(:hover):not(:disabled):not(.is-active),
				.lifewiki-flow-actions .lifewiki-action-board-btn:not(:hover):not(:disabled) {
					background: var(--surface-container-high, var(--background-secondary)) !important;
					background-color: var(--surface-container-high, var(--background-secondary)) !important;
					color: var(--primary, var(--text-accent)) !important;
					border-color: rgba(204, 195, 214, 0.15) !important;
					box-shadow: 0 10px 50px -5px rgba(26, 28, 28, 0.15), 0 4px 10px -3px rgba(0, 0, 0, 0.08) !important;
				}

				.lifewiki-flow-actions .lifewiki-exploration-btn:hover:not(:disabled),
				.lifewiki-flow-actions .lifewiki-action-board-btn:hover:not(:disabled),
				.lifewiki-flow-actions .lifewiki-exploration-btn.is-active {
					border-color: transparent !important;
					background: var(--primary, var(--interactive-accent)) !important;
					background-color: var(--primary, var(--interactive-accent)) !important;
					color: var(--on-primary, var(--text-on-accent)) !important;
					box-shadow: 0 10px 26px -16px rgba(103, 85, 142, 0.5) !important;
				}

				.lifewiki-exploration-enter-btn {
					border-color: rgba(204, 195, 214, 0.35);
					background: var(--surface-container-lowest);
					color: var(--on-surface-variant);
					box-shadow: none;
				}

				.lifewiki-exploration-enter-btn:not(:disabled) {
					border-color: transparent;
					background: var(--primary);
					color: var(--on-primary);
					box-shadow: 0 10px 26px -16px rgba(103, 85, 142, 0.5);
				}

				.lifewiki-exploration-enter-btn:hover:not(:disabled) {
					filter: brightness(1.04);
				}

				.lifewiki-exploration-btn:disabled,
				.lifewiki-exploration-enter-btn:disabled {
					opacity: 0.5;
					cursor: not-allowed;
					box-shadow: none;
					filter: none;
				}

				.lifewiki-exploration-tooltip {
					position: absolute;
					right: 0;
					top: calc(100% + 8px);
					max-width: 340px;
					padding: 7px 10px;
					border-radius: 10px;
					border: 1px solid rgba(204, 195, 214, 0.36);
					background: rgba(255, 255, 255, 0.96);
					color: var(--text-muted);
					font-size: 12px;
					font-weight: 500;
					line-height: 1.45;
					white-space: nowrap;
					box-shadow: 0 14px 34px -22px rgba(26, 28, 28, 0.48), 0 4px 12px -8px rgba(26, 28, 28, 0.28);
					backdrop-filter: blur(12px);
					opacity: 0;
					transform: translateY(-3px);
					pointer-events: none;
					transition: opacity 0.15s ease, transform 0.15s ease;
					z-index: 20;
				}

				.lifewiki-exploration-btn:hover + .lifewiki-exploration-tooltip,
				.lifewiki-exploration-btn:focus-visible + .lifewiki-exploration-tooltip {
					opacity: 1;
					transform: translateY(0);
				}

				.lifewiki-exploration-count {
					color: var(--on-surface-variant);
					font-size: 12px;
					font-family: var(--font-body);
					white-space: nowrap;
				}

				/* Content Area */
				.lifewiki-diary-content {
				flex: 1;
				line-height: 1.7;
				overflow-y: auto;
				padding: 0 48px 200px;
				background: var(--surface);
				position: relative;
			}

			/* Flow Line - continuous vertical line through the diary */
			.flow-line {
				position: absolute;
				left: 70px;
				top: 0;
				width: 1px;
				background: rgba(158, 158, 158, 0.3);
				z-index: 0;
				height: 0; /* Will be set dynamically by extendFlowLine() */
			}

			/* Block Group - Parent with children */
			.lifewiki-block-group {
				position: relative;
				display: flex;
				flex-direction: column;
				margin-bottom: 16px;
				z-index: 1;
			}

			.lifewiki-block-group:last-child {
				margin-bottom: 0;
			}

			/* Remove old tree line - we use Flow Line now */

			/* Single Block */
			.lifewiki-block {
				position: relative;
				z-index: 1;
				cursor: pointer;
				transition: transform 0.2s ease;
				margin-bottom: 16px;
			}

			.lifewiki-block:last-child {
				margin-bottom: 0;
			}

			.lifewiki-block:hover {
				transform: translateY(-1px);
			}

			/* Block Card - matches design system */
				.lifewiki-block-card {
					background: var(--surface-container-lowest);
					border-radius: 8px;
					padding: 12px 16px;
					box-shadow: 0 10px 40px -10px rgba(26, 28, 28, 0.06);
					border: 1px solid rgba(204, 195, 214, 0.15);
					transition: box-shadow 0.2s ease;
					display: block;
					position: relative;
				}

				.lifewiki-block:hover .lifewiki-block-card {
					box-shadow: 0 14px 50px -10px rgba(26, 28, 28, 0.08);
				}

				.lifewiki-exploration-select-dot {
					position: absolute;
					left: -34px;
					top: 50%;
					transform: translateY(-50%);
					width: 18px;
					height: 18px;
					min-width: 18px;
					min-height: 18px;
					padding: 0;
					border-radius: 999px;
					border: 1.5px solid rgba(123, 116, 133, 0.45);
					background: var(--surface);
					box-shadow: 0 6px 18px -12px rgba(26, 28, 28, 0.45);
					cursor: pointer;
					z-index: 10;
					transition: background 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease;
				}

				.lifewiki-exploration-select-dot:hover {
					border-color: rgba(103, 85, 142, 0.7);
					box-shadow: 0 8px 20px -12px rgba(103, 85, 142, 0.7);
				}

				.lifewiki-exploration-select-dot.is-selected {
					border-color: var(--primary);
					background: var(--primary);
					box-shadow: 0 8px 20px -12px rgba(103, 85, 142, 0.8);
				}

				.lifewiki-exploration-select-dot.is-selected::after {
					content: '';
					position: absolute;
					left: 50%;
					top: 50%;
					width: 6px;
					height: 6px;
					border-radius: 999px;
					background: var(--on-primary);
					transform: translate(-50%, -50%);
				}

			.lifewiki-block.selected .lifewiki-block-card,
			.lifewiki-block-group.selected .lifewiki-block-card {
				background: var(--surface-container-high);
				border: 2px solid var(--primary);
			}

			/* Edit mode */
			.lifewiki-block.editing .lifewiki-block-card,
			.lifewiki-block-group.editing .lifewiki-block-card {
				background: var(--surface-container-high);
				border: 2px solid var(--primary);
			}

			/* Edit mode textarea - matches content span style, grid column 2 */
			.lifewiki-edit-textarea {
				width: 100%;
				min-height: 60px;
				padding: 0;
				font-size: 14px;
				line-height: 1.6;
				border: none !important;
				border-radius: 0;
				background: transparent !important;
				color: var(--on-surface);
				font-family: var(--font-body);
				resize: vertical;
				box-sizing: border-box;
				outline: none;
				box-shadow: none !important;
				grid-column: 2;
				white-space: pre-wrap;
				word-break: break-word;
			}

			.lifewiki-edit-textarea:hover,
			.lifewiki-edit-textarea:focus {
				background: transparent !important;
			}

			/* Edit mode tag input - compact pill, grid column 2 */
			.lifewiki-edit-input {
				grid-column: 2;
				width: fit-content;
				padding: 2px 8px;
				font-size: var(--tag-size, 12px);
				border: none !important;
				border-radius: var(--tag-radius, 20px);
				background: var(--tag-background, var(--background-modifier-hover));
				color: var(--tag-color, var(--text-accent));
				font-family: var(--font-body);
				font-weight: 500;
				outline: none;
				box-shadow: none;
				text-align: left;
			}

			/* Timestamp Label - inline with content */
			.lifewiki-block-timestamp {
				font-size: 12px;
				font-weight: 600;
				color: var(--on-surface-variant);
				font-family: var(--font-body);
				flex-shrink: 0;
			}

			.lifewiki-block-timestamp::before {
				content: '[';
			}

			.lifewiki-block-timestamp::after {
				content: ']';
			}

			/* Main wrapper - timestamp column + content column */
			.lifewiki-main-wrapper {
				display: grid;
				grid-template-columns: auto minmax(0, 1fr);
				column-gap: 10px;
				row-gap: 8px;
				align-items: baseline;
				width: 100%;
			}

			/* Block Content Text - takes remaining space */
			.lifewiki-block-content {
				font-size: 14px;
				color: var(--on-surface);
				line-height: 1.6;
				font-family: var(--font-body);
				flex: 1;
				white-space: pre-wrap;
				word-break: break-word;
				min-width: 0;
			}

			.lifewiki-block-tags {
				grid-column: 2;
				display: flex;
				flex-wrap: wrap;
				gap: 6px;
				align-items: center;
				min-width: 0;
			}

			.lifewiki-block-content.expanded {
				text-indent: 0;
				padding-left: 0;
			}
			.lifewiki-block-content {
				font-size: 14px;
				color: var(--on-surface);
				line-height: 1.6;
				font-family: var(--font-body);
				/* Two line limit with ellipsis */
				display: -webkit-box;
				-webkit-line-clamp: 2;
				-webkit-box-orient: vertical;
				overflow: hidden;
				text-overflow: ellipsis;
				word-break: break-word;
			}

			.lifewiki-block-content.expanded {
				display: block;
				-webkit-line-clamp: unset;
				overflow: visible;
			}

			/* Block Body - contains content and tags */
			.lifewiki-block-body {
				display: flex;
				flex-direction: column;
				gap: 4px;
			}

			/* Tag Badge - follows Obsidian theme tag variables */
			.lifewiki-block-tag {
				display: inline-flex;
				align-items: center;
				font-size: var(--tag-size, 12px);
				padding: var(--tag-padding-y, 2px) var(--tag-padding-x, 8px);
				border-radius: var(--tag-radius, 20px);
				font-weight: 500;
				font-family: var(--font-body);
				color: var(--tag-color, var(--text-accent));
				background: var(--tag-background, var(--background-modifier-hover));
				border: var(--tag-border-width, 0) solid var(--tag-border-color, transparent);
				text-decoration: none;
				white-space: nowrap;
			}

			/* Category Badge - Pill style (for header) */
			.lifewiki-block-category {
				font-size: 11px;
				padding: 3px 10px;
				border-radius: 20px;
				font-weight: 500;
				font-family: var(--font-body);
			}

			.lifewiki-block-category.\u5DE5\u4F5C {
				background: rgba(92, 40, 184, 0.1);
				color: var(--primary);
			}

			.lifewiki-block-category.\u4E2A\u4EBA {
				background: rgba(114, 65, 0, 0.1);
				color: var(--tertiary);
			}

			.lifewiki-block-category.\u5B66\u4E60 {
				background: rgba(103, 85, 142, 0.1);
				color: var(--secondary);
			}

			.lifewiki-block-category.\u5F85\u786E\u8BA4 {
				background: rgba(123, 116, 133, 0.1);
				color: var(--on-surface-variant);
			}

			/* Children Container */
			.lifewiki-block-children {
				margin-left: 70px;
				padding-left: 0;
				padding-top: 12px;
				border-left: none;
				position: relative;
				display: flex;
				flex-direction: column;
				gap: 12px;
			}

			/* Child Block */
			.lifewiki-block-child {
				position: relative;
			}

			/* Horizontal connector from child left edge, extending left */
			.lifewiki-block-child::before {
				content: '';
				position: absolute;
				left: -48px;
				top: 50%;
				width: 48px;
				height: 2px;
				background: rgba(158, 158, 158, 0.3);
			}

			/* Child Card - matches parent card style */
			.lifewiki-block-child-card {
				background: var(--surface-container-lowest);
				border-radius: 8px;
				padding: 10px 14px;
				border: 1px solid rgba(204, 195, 214, 0.15);
				box-shadow: 0 10px 40px -10px rgba(26, 28, 28, 0.06);
				display: flex;
				align-items: flex-start;
				gap: 12px;
			}

			/* Selected child block */
			.lifewiki-block-child.selected .lifewiki-block-child-card {
				background: var(--surface-container-high);
				border: 2px solid var(--primary);
			}

			/* Child edit mode */
			.lifewiki-block-child .lifewiki-edit-textarea {
				width: 100%;
				min-height: 40px;
				padding: 8px;
				font-size: 14px;
				line-height: 1.5;
				border: 1px solid rgba(204, 195, 214, 0.3);
				border-radius: 6px;
				background: var(--surface-container-lowest);
				color: var(--on-surface);
				font-family: var(--font-body);
				resize: vertical;
				box-sizing: border-box;
			}

			/* Child Header */
			.lifewiki-block-child-header {
				display: flex;
				align-items: center;
				gap: 12px;
				margin-bottom: 4px;
			}

			.lifewiki-block-child-timestamp {
				font-size: 12px;
				font-weight: 600;
				color: var(--on-surface-variant);
				font-family: var(--font-body);
				min-width: 48px;
				margin-top: 2px;
			}

			.lifewiki-block-child-timestamp::before {
				content: '[';
			}

			.lifewiki-block-child-timestamp::after {
				content: ']';
			}

			/* Child Body */
			.lifewiki-block-child-body {
				flex: 1;
			}

			.lifewiki-block-child-content {
				font-size: 14px;
				color: var(--on-surface);
				line-height: 1.6;
				font-family: var(--font-body);
			}

			/* Child Tags */
			.lifewiki-block-child-tags {
				margin-top: 4px;
				display: flex;
				gap: 6px;
				flex-wrap: wrap;
			}

			.lifewiki-block-child-tag {
				font-size: 11px;
				padding: 2px 8px;
				border-radius: 20px;
				font-weight: 500;
				font-family: var(--font-body);
			}

			/* Input Area - Fixed at bottom */
			.lifewiki-input-area {
				position: fixed;
				bottom: 0;
				left: 0;
				right: 0;
				padding: 20px 48px 28px;
				background: linear-gradient(to top, var(--surface) 80%, transparent);
				z-index: 10;
			}

			/* Input Inner Container */
			.lifewiki-input-inner {
				width: 100%;
				height: 140px;
				max-height: 140px;
				padding: 16px 20px;
				padding-bottom: 40px;
				border: 1px solid rgba(204, 195, 214, 0.15);
				border-radius: 16px;
				background: var(--surface-container-high);
				box-shadow: 0 10px 50px -5px rgba(26, 28, 28, 0.15), 0 4px 10px -3px rgba(0, 0, 0, 0.08);
				display: flex;
				flex-direction: column;
				box-sizing: border-box;
				position: relative;
			}

			/* Input Card */
			.lifewiki-input-box {
				flex: 1;
				width: 100%;
				font-size: 14px;
				line-height: 1.6;
				border: none;
				border-radius: 0;
				background: transparent !important;
				color: var(--on-surface);
				resize: none;
				font-family: var(--font-body);
				padding: 0;
				outline: none;
				box-shadow: none;
			}

			.lifewiki-input-box:focus {
				outline: none;
				box-shadow: none;
			}

			/* Input Bottom Row */
			.lifewiki-input-bottom {
				display: flex;
				justify-content: space-between;
				align-items: center;
				position: absolute;
				bottom: 12px;
				left: 20px;
				right: 20px;
			}

			/* Input Hint (normal mode) */
			.lifewiki-input-hint {
				font-size: 11px;
				color: var(--on-surface-variant);
				opacity: 0.7;
				font-family: var(--font-body);
				white-space: nowrap;
				flex-shrink: 0;
			}

			.lifewiki-input-left-actions {
				display: flex;
				align-items: center;
				gap: 8px;
				min-width: 0;
			}

			.lifewiki-input-right-actions {
				display: flex;
				align-items: center;
				gap: 8px;
				flex-shrink: 0;
			}

			.lifewiki-attachment-btn {
				width: 36px;
				height: 36px;
				border-radius: 50%;
				border: none !important;
				background: transparent !important;
				box-shadow: none !important;
				color: var(--text-muted);
				display: flex;
				align-items: center;
				justify-content: center;
				cursor: pointer;
				font-size: 24px;
				font-weight: 300;
				line-height: 0;
				padding: 0 0 2px 0;
				flex-shrink: 0;
			}

			.lifewiki-attachment-btn:hover {
				background: var(--surface-container-lowest) !important;
				color: var(--text-normal);
			}

			/* Append Mode Actions (button + cancel) */
			.lifewiki-append-mode-actions {
				display: none;
				align-items: center;
				gap: 8px;
			}

			.lifewiki-append-mode-actions.visible {
				display: flex;
			}

			/* Append Submit Button - pill shape */
			.lifewiki-append-submit-btn {
				font-size: 12px !important;
				font-weight: 600 !important;
				font-family: var(--font-body) !important;
				background: #5c28b8 !important;
				color: #ffffff !important;
				border: none !important;
				border-radius: 999px !important;
				padding: 6px 16px !important;
				cursor: pointer;
				transition: background-color 0.2s;
			}

			.lifewiki-append-submit-btn:hover {
				background: #3d1a7a !important;
			}

			/* Append Cancel Button */
			.lifewiki-append-cancel-btn {
				width: 20px;
				height: 20px;
				border-radius: 50%;
				background: var(--surface-variant);
				color: var(--on-surface-variant);
				border: none;
				display: flex;
				align-items: center;
				justify-content: center;
				cursor: pointer;
				font-size: 14px;
				line-height: 1;
				transition: background-color 0.2s;
			}

			.lifewiki-append-cancel-btn:hover {
				background: var(--outline);
				color: var(--on-primary);
			}

			/* Send Button (Circular Arrow) */
			.lifewiki-diary-send-btn {
				width: 36px;
				height: 36px;
				border-radius: 50%;
				background: var(--on-surface-variant);
				color: #ffffff;
				border: none;
				display: flex;
				align-items: center;
				justify-content: center;
				cursor: pointer;
				transition: background-color 0.2s, transform 0.2s;
			}

			.lifewiki-diary-send-btn:hover {
				transform: translateY(-1px);
			}

			/* Button highlighted when input is focused (darker primary) */
			.lifewiki-input-inner:focus-within .lifewiki-diary-send-btn {
				background: #5c28b8 !important;
				color: #ffffff !important;
			}


			.lifewiki-input-box:hover {
				background: var(--surface-container-high) !important;
			}

			.lifewiki-input-box::placeholder {
				color: var(--on-surface-variant);
				opacity: 0.6;
			}


			/* Input Hint */
			.lifewiki-input-hint {
				font-size: 11px;
				color: var(--on-surface-variant);
				opacity: 0.7;
				font-family: var(--font-body);
			}

			/* Input Box Append Mode */
			.lifewiki-input-box.append-mode {
				outline: none;
				border: none;
				box-shadow: none;
			}

			/* Append Mode Footer */
			.lifewiki-append-footer {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-top: 10px;
			}

			.lifewiki-append-hint {
				font-size: 12px;
				color: var(--primary);
				font-weight: 500;
				font-family: var(--font-body);
				background: var(--primary-container);
				padding: 4px 10px;
				border-radius: 6px;
			}

			.lifewiki-append-actions {
				display: flex;
				align-items: center;
				gap: 8px;
			}

			/* Append Button */
			.lifewiki-append-btn {
				padding: 6px 14px;
				border-radius: 8px;
				border: none;
				background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
				color: var(--on-primary);
				font-size: 12px;
				font-weight: 500;
				font-family: var(--font-body);
				cursor: pointer;
				transition: all 0.15s;
			}

			.lifewiki-append-btn:hover {
				transform: translateY(-1px);
				box-shadow: 0 4px 12px -2px rgba(92, 40, 184, 0.25);
			}

			/* Cancel Button */
			.lifewiki-cancel-btn {
				display: flex;
				align-items: center;
				justify-content: center;
				width: 24px;
				height: 24px;
				border-radius: 50%;
				border: none;
				background: var(--surface-container-high);
				color: var(--on-surface-variant);
				font-size: 14px;
				cursor: pointer;
				transition: all 0.15s;
			}

			.lifewiki-cancel-btn:hover {
				background: var(--surface-variant);
				color: var(--on-surface);
			}

			/* Child Input Area */
			.lifewiki-child-input-area {
				margin-top: 12px;
				margin-left: 64px;
				padding-left: 24px;
				border-left: 1px solid rgba(92, 40, 184, 0.2);
			}

			.lifewiki-child-input {
				width: 100%;
				padding: 10px 14px;
				font-size: 13px;
				line-height: 1.5;
				border: 1px solid rgba(204, 195, 214, 0.15);
				border-radius: 10px;
				background: var(--surface-container-lowest);
				color: var(--on-surface);
				font-family: var(--font-body);
				box-sizing: border-box;
				transition: border-color 0.2s ease, box-shadow 0.2s ease;
			}

			.lifewiki-child-input:focus {
				outline: none;
				border-color: var(--primary);
				box-shadow: 0 4px 16px -4px rgba(92, 40, 184, 0.1);
			}

			.lifewiki-child-input::placeholder {
				color: var(--on-surface-variant);
				opacity: 0.5;
			}

			/* Add Child Button */
			.lifewiki-add-child-btn {
				margin-left: 8px;
				padding: 4px 10px;
				font-size: 11px;
				border-radius: 20px;
				border: 1px dashed rgba(204, 195, 214, 0.3);
				background: transparent;
				color: var(--on-surface-variant);
				cursor: pointer;
				transition: all 0.2s ease;
				font-family: var(--font-body);
			}

			.lifewiki-add-child-btn:hover {
				border-color: var(--primary);
				border-style: solid;
				color: var(--primary);
				background: rgba(92, 40, 184, 0.05);
			}

			/* Scrollbar styling */
			.lifewiki-diary-content::-webkit-scrollbar,
			.lifewiki-input-box::-webkit-scrollbar {
				width: 6px;
			}

			.lifewiki-diary-content::-webkit-scrollbar-track,
			.lifewiki-input-box::-webkit-scrollbar-track {
				background: transparent;
			}

			.lifewiki-diary-content::-webkit-scrollbar-thumb,
			.lifewiki-input-box::-webkit-scrollbar-thumb {
				background: rgba(204, 195, 214, 0.4);
				border-radius: 3px;
			}

			.lifewiki-diary-content::-webkit-scrollbar-thumb:hover,
			.lifewiki-input-box::-webkit-scrollbar-thumb:hover {
				background: rgba(204, 195, 214, 0.6);
			}

			/* Context Menu */
			.lifewiki-context-menu {
				position: fixed;
				background: var(--surface-container-lowest);
				border: 1px solid rgba(204, 195, 214, 0.3);
				border-radius: 8px;
				box-shadow: 0 8px 24px -4px rgba(26, 28, 28, 0.15);
				padding: 6px 0;
				z-index: 1000;
				min-width: 200px;
			}

			.lifewiki-context-menu-item {
				padding: 10px 16px;
				font-size: 13px;
				cursor: pointer;
				transition: background-color 0.15s;
				display: flex;
				align-items: center;
				gap: 8px;
			}

			.lifewiki-context-menu-item:hover {
				background: var(--surface-container-high);
			}

			.lifewiki-context-menu-item.danger {
				color: #d32f2f;
			}

			.lifewiki-context-menu-item.danger:hover {
				background: rgba(211, 47, 47, 0.1);
			}

			.lifewiki-context-menu-divider {
				height: 1px;
				background: rgba(204, 195, 214, 0.3);
				margin: 6px 0;
			}
		`,this.containerEl.appendChild(e)}createInputArea(e){this.inputAreaEl=e.createEl("div",{cls:"lifewiki-input-area"});let n=this.inputAreaEl.createEl("div",{cls:"lifewiki-input-inner"});this.inputTextarea=n.createEl("textarea",{cls:"lifewiki-input-box",attr:{placeholder:"\u8BB0\u5F55\u4ECA\u5929\u7684\u751F\u6D3B..."}});let i=n.createEl("div",{cls:"lifewiki-input-bottom"}),a=i.createEl("div",{cls:"lifewiki-input-left-actions"}),r=i.createEl("input",{attr:{type:"file",style:"display:none"}});r.addEventListener("change",()=>{this.handleAttachmentSelect(r)}),a.createEl("button",{cls:"lifewiki-attachment-btn",attr:{type:"button",title:"\u6DFB\u52A0\u9644\u4EF6"},text:"+"}).addEventListener("click",()=>{r.click()}),this.inputHintEl=a.createEl("span",{cls:"lifewiki-input-hint",text:"Enter \u53D1\u9001"});let o=i.createEl("div",{cls:"lifewiki-input-right-actions"});this.appendModeActionsEl=o.createEl("div",{cls:"lifewiki-append-mode-actions"}),this.appendSubmitBtn=this.appendModeActionsEl.createEl("button",{cls:"lifewiki-append-submit-btn",text:"\u5C06\u5728 HH:mm \u8FD9\u6761\u65E5\u8BB0\u4E0B\u8FFD\u52A0"}),this.appendSubmitBtn.addEventListener("click",()=>{this.submitAppend()}),this.appendModeActionsEl.createEl("button",{cls:"lifewiki-append-cancel-btn",text:"\xD7"}).addEventListener("click",()=>{this.cancelAppendMode()});let c=o.createEl("button",{cls:"lifewiki-diary-send-btn",attr:{type:"button",title:"\u53D1\u9001\u65E5\u8BB0"}});(0,ct.setIcon)(c,"arrow-up"),c.addEventListener("click",u=>{u.preventDefault(),u.stopPropagation(),this.isAppendMode?this.submitAppend():this.inputTextarea&&this.submitBlock(this.inputTextarea)}),this.inputTextarea.addEventListener("focus",()=>{this.plugin.getAIAnalysisView()?.setMode("analysis"),this.isAppendMode||this.scrollToLastBlock()}),this.inputTextarea.addEventListener("input",()=>{if(!this.inputTextarea)return;this.inputValue=this.inputTextarea.value;let u=this.inputTextarea.value.length;this.inputHintEl.textContent=`${u}/250 \xB7 Enter \u53D1\u9001`}),this.inputTextarea.addEventListener("keydown",u=>{u.key==="Enter"&&(this.isAppendMode?u.shiftKey||(u.preventDefault(),this.submitAppend()):u.shiftKey||(u.preventDefault(),this.submitBlock(this.inputTextarea)))}),this.textarea=this.inputTextarea}async loadBlocks(){let e=`Daily/${this.currentDate}.md`,n=this.app.vault.getAbstractFileByPath(e);if((!n||!(n instanceof ct.TFile))&&(n=this.app.vault.getAbstractFileByPath(`${this.currentDate}.md`)),(!n||!(n instanceof ct.TFile))&&(n=this.app.vault.getAbstractFileByPath(`${ya}/${this.currentDate}.md`)),!n||!(n instanceof ct.TFile)){this.renderEmptyState();return}let i=await this.app.vault.read(n);this.parseBlocksFromContent(i),this.renderBlocks()}async loadSlogan(){let e=`Daily/${this.currentDate}.md`,n=this.app.vault.getAbstractFileByPath(e);if((!n||!(n instanceof ct.TFile))&&(n=this.app.vault.getAbstractFileByPath(`${this.currentDate}.md`)),(!n||!(n instanceof ct.TFile))&&(n=this.app.vault.getAbstractFileByPath(`${ya}/${this.currentDate}.md`)),!n||!(n instanceof ct.TFile))return Jh;let a=(await this.app.vault.read(n)).match(/>\s*\[!NOTE\]\s*(.+)/);return a&&a[1]?a[1].trim():Jh}toggleExplorationSelection(){this.explorationSelectionMode=!this.explorationSelectionMode,this.explorationSelectionMode||this.selectedExplorationBlockIds.clear(),this.renderView()}async enterExploration(){if(this.selectedExplorationBlockIds.size===0)return;let e=this.blocks.filter(d=>this.selectedExplorationBlockIds.has(d.id)),{diaryBlocksToSources:n}=await Promise.resolve().then(()=>(Gh(),Vh)),i=this.getCurrentDiaryFile()?.path,a=n(e.map(d=>({id:d.id,timestamp:d.timestamp,content:d.content,parentId:d.parentId,sourcePath:i}))),{createExplorationSession:r}=await Promise.resolve().then(()=>(Xh(),qh)),{saveExplorationSession:s}=await Promise.resolve().then(()=>(vd(),Qh)),o=this.currentDate,l=`${o}-\u601D\u8003\u63A2\u7D22-${e.length}\u4E2Ablock`,c=`explorations/${o}-${Date.now()}.canvas`,u=r({id:`exploration-${Date.now()}`,title:l,canvasPath:c,blocks:a});await s(this.app,u),await this.appendExplorationChildBlocks(e,c),new ct.Notice(`\u601D\u8003\u63A2\u7D22\u767D\u677F\u5DF2\u521B\u5EFA: ${l}`),this.explorationSelectionMode=!1,this.selectedExplorationBlockIds.clear(),await this.renderView(),await this.plugin.openExplorationCanvas(c),this.plugin.explorationCanvasView&&await this.plugin.explorationCanvasView.loadSession(c)}async appendExplorationChildBlocks(e,n){let i=n.split("/").pop()||n,a=`\u8FDB\u884C\u4E86\u601D\u8003\u63A2\u7D22\uFF0C\u8BE6\u89C1 [[${n}|${i}]]`;for(let r of e){let s=await this.appendChildToBlock(r,a);s&&r.children.push(s)}}getCurrentDiaryFile(){let e=[`Daily/${this.currentDate}.md`,`${this.currentDate}.md`,`${ya}/${this.currentDate}.md`];for(let n of e){let i=this.app.vault.getAbstractFileByPath(n);if(i instanceof ct.TFile)return i}return null}toggleExplorationBlockSelection(e){this.selectedExplorationBlockIds.has(e)?this.selectedExplorationBlockIds.delete(e):this.selectedExplorationBlockIds.add(e),this.renderView()}renderEmptyState(){this.contentContainer&&(this.contentContainer.empty(),this.contentContainer.createEl("div",{cls:"lifewiki-empty-state",text:`\u4ECA\u5929\u7684\u65E5\u8BB0\u8FD8\u6CA1\u6709\u5F00\u59CB\u3002
\u5728\u4E0B\u65B9\u8F93\u5165\u6846\u8BB0\u5F55\u4F60\u7684\u751F\u6D3B\u5427\u3002`}))}bindExplorationCanvasLinks(e){e.addEventListener("click",async n=>{if(l7(n.target)){n.preventDefault(),n.stopPropagation(),await this.plugin.openActionBoard();return}let i=o7(n.target);i&&(n.preventDefault(),n.stopPropagation(),await this.plugin.openExplorationCanvas(i),this.plugin.explorationCanvasView&&await this.plugin.explorationCanvasView.loadSession(i))})}parseBlocksFromContent(e){this.blocks=[];let n=e.split(`
`),i=null,a=[],r=[],s=null;for(let o of n){let l=o.match(/^### (\d{2}:\d{2}) \[([^\]]+)\]\s+(.+)$/);if(l&&(i&&(s&&(i.id=s),i.content=a.join(`
`).trim(),i.children=[...r],this.blocks.push(i),s=null),i={id:kd(l[0]),timestamp:l[1],source:l[2],category:Ed(Bl(l[3])),content:"",children:[],parentId:null},a=[],r=[]),i&&!s){let c=o.trim(),u=c.match(/^<!-- ([a-f0-9-]+) -->$/);if(u){s=u[1];continue}let d=c.match(/^<sub[^>]*>([a-f0-9-]+)<\/sub>$/i);if(d){s=d[1];continue}}if(o.startsWith("- ")&&i){let c=o.match(/^- (\d{2}:\d{2})?\s+(.+?)\s*(?:<!-- ([a-f0-9-]+) -->)?$/);if(c){let u=c[1]||"",d=(c[2]||"").replace(/<!--[\s\S]*?-->/g,"").replace(/<sub[^>]*>[\s\S]*?<\/sub>/gi,"").trim(),p=c[3]||kd(o);if(d){r.push({id:p,timestamp:u,content:d,parentId:i.id});continue}}else{let u=o.substring(2).replace(/<!--[\s\S]*?-->/g,"").replace(/<sub[^>]*>[\s\S]*?<\/sub>/gi,"").trim();u&&r.push({id:kd(o),timestamp:"",content:u,parentId:i.id});continue}}if(o.trim()&&i&&!o.startsWith("#")&&!o.startsWith(">")){let c=o.trim().replace(/<!--[\s\S]*?-->/g,"").replace(/<sub[^>]*>[\s\S]*?<\/sub>/gi,"").trim();c&&a.push(c)}}i&&(s&&(i.id=s),i.content=a.join(`
`).trim(),i.children=r,this.blocks.push(i))}renderBlocks(){if(this.contentContainer){if(this.contentContainer.empty(),this.flowLineEl=this.contentContainer.createEl("div",{cls:"flow-line"}),this.blocks.length===0){this.renderEmptyState();return}for(let e of this.blocks)this.renderBlock(e);this.extendFlowLine(),this.isAppendMode||setTimeout(()=>{this.scrollToLastBlock()},100)}}extendFlowLine(){!this.flowLineEl||!this.contentContainer||setTimeout(()=>{if(!this.flowLineEl||!this.contentContainer)return;let e=Array.from(this.contentContainer.querySelectorAll(".lifewiki-block, .lifewiki-block-group"));if(e.length===0)return;let n=0;for(let i of e){let a=i.offsetTop+i.offsetHeight;a>n&&(n=a)}this.flowLineEl.style.height=`${n+30}px`},50)}scrollToLastBlock(){this.contentContainer&&(this.contentContainer.scrollTop=this.contentContainer.scrollHeight)}scrollBlockIntoView(e,n=!1){setTimeout(()=>{let i=n?`[data-child-id="${e}"]`:`[data-block-id="${e}"]`;this.contentContainer?.querySelector(i)?.scrollIntoView({block:"center",behavior:"smooth"})},50)}renderBlock(e){if(!this.contentContainer)return;let n=e.id===this.selectedBlockId,i=e.id===this.editModeBlockId,a=e.children.length>0,r=a?"lifewiki-block-group":"lifewiki-block";n&&(r+=" selected"),i&&(r+=" editing");let s=this.contentContainer.createEl("div",{cls:r,attr:{"data-block-id":e.id}}),o=s.createEl("div",{cls:"lifewiki-block-card"});if(i){let l=o.createEl("div",{cls:"lifewiki-main-wrapper"});l.createEl("span",{text:e.timestamp,cls:"lifewiki-block-timestamp"});let c=l.createEl("textarea",{cls:"lifewiki-edit-textarea",attr:{placeholder:"\u8F93\u5165\u5185\u5BB9..."}});c.value=e.content,c.dataset.field="content";let u=l.createEl("input",{cls:"lifewiki-edit-input",attr:{value:e.category,placeholder:"#\u6807\u7B7E"}});u.dataset.field="category",this.editTagInput=u,this.editContentTextarea=c}else if(e.content){let l=o.createEl("span",{cls:"lifewiki-main-wrapper"});l.createEl("span",{text:e.timestamp,cls:"lifewiki-block-timestamp"});let c=l.createEl("span",{cls:"lifewiki-block-content"});ct.MarkdownRenderer.render(this.app,fd(e.content),c,`Daily/${this.currentDate}.md`,this),this.bindExplorationCanvasLinks(c);let u=l.createEl("div",{cls:"lifewiki-block-tags"});for(let d of Bl(e.category))u.createEl("a",{text:`#${d}`,cls:"tag lifewiki-block-tag",attr:{href:`#${d}`,"data-tag":d}})}if(a){let l=s.createEl("div",{cls:"lifewiki-block-children"});for(let c of e.children){let u=c.id===this.selectedBlockId,d=this.editingChildId===c.id,p=l.createEl("div",{cls:"lifewiki-block-child"+(u?" selected":"")+(d?" editing":""),attr:{"data-child-id":c.id}}),f=p.createEl("div",{cls:"lifewiki-block-child-card"});c.timestamp&&f.createEl("span",{text:c.timestamp,cls:"lifewiki-block-child-timestamp"});let y=f.createEl("div",{cls:"lifewiki-block-child-body"});if(d){let x=y.createEl("textarea",{cls:"lifewiki-edit-textarea",attr:{placeholder:"\u8F93\u5165\u5185\u5BB9..."}});x.value=c.content,this.editContentTextarea=x}else{let x=y.createEl("div",{cls:"lifewiki-block-child-content"});ct.MarkdownRenderer.render(this.app,fd(c.content),x,`Daily/${this.currentDate}.md`,this),this.bindExplorationCanvasLinks(x)}p.addEventListener("click",x=>{Wh(x.target)||(x.stopPropagation(),this.isEditMode||this.selectChildBlock(c.id,e.id))}),f.addEventListener("dblclick",x=>{x.stopPropagation(),this.startChildEditMode(c.id,e.id)}),p.addEventListener("contextmenu",x=>{x.preventDefault(),x.stopPropagation(),this.selectChildBlock(c.id,e.id),this.showContextMenu(c.id,e.id,!0,x.clientX,x.clientY)})}}if(n&&this.selectedBlockId===e.id&&this.childInputEl&&s.appendChild(this.childInputEl),this.explorationSelectionMode){let l=this.selectedExplorationBlockIds.has(e.id);o.createEl("button",{cls:`lifewiki-exploration-select-dot${l?" is-selected":""}`,attr:{type:"button","aria-label":l?"\u53D6\u6D88\u9009\u62E9\u8BE5\u65E5\u8BB0 block":"\u9009\u62E9\u8BE5\u65E5\u8BB0 block","aria-pressed":String(l),title:l?"\u53D6\u6D88\u9009\u62E9":"\u9009\u62E9"}}).addEventListener("click",u=>{u.stopPropagation(),this.toggleExplorationBlockSelection(e.id)})}o.addEventListener("click",l=>{if(!Wh(l.target)){if(this.explorationSelectionMode){if(l.target?.closest(".lifewiki-exploration-select-dot"))return;this.toggleExplorationBlockSelection(e.id);return}this.isEditMode||this.selectBlock(e.id)}}),o.addEventListener("dblclick",()=>{this.startEditMode(e.id)}),o.addEventListener("contextmenu",l=>{l.preventDefault(),l.stopPropagation(),this.selectBlock(e.id),this.showContextMenu(e.id,null,!1,l.clientX,l.clientY)})}async selectBlock(e){this.childInputEl=null,this.isEditMode=!1,this.editModeBlockId=null,this.selectedBlockId=e,this.isAppendMode=!0,this.appendModeBlockId=e,this.updateInputAreaForAppendMode(),this.renderBlocks();let n=this.blocks.find(i=>i.id===e);if(n){this.selectedBlockContent=n.content;let i=this.plugin.getAIAnalysisView();if(i)if(i.setMode("analysis"),n.category==="\u5F85\u5206\u6790"){let r=this.plugin.getSessionManager().getSession(n.id,null);r&&r.messages&&r.messages.length>0?i.setActiveBlock(e,n.content):await this.startAIAnalysis(n)}else i.setActiveBlock(e,n.content)}}selectChildBlock(e,n){this.childInputEl=null,this.isEditMode=!1,this.editModeBlockId=null,this.selectedBlockId=e,this.isAppendMode=!1,this.appendModeBlockId=null,this.renderBlocks();let i=this.blocks.find(a=>a.id===n);if(i){this.selectedBlockContent=i.content;let a=this.plugin.getAIAnalysisView();a&&(a.setMode("analysis"),a.setActiveBlock(e,i.content,n))}}showContextMenu(e,n,i,a,r){let s=document.querySelector(".lifewiki-context-menu");s&&s.remove();let o=document.createElement("div");o.className="lifewiki-context-menu",o.style.left=`${a}px`,o.style.top=`${r}px`;let l=this.plugin.getSessionManager(),c=n||e,u=l.getSession(c,n)!==null,d="";if(i){let y=this.blocks.find(x=>x.id===n);if(y){let x=y.children.length;d=x>1?` (\u5171 ${x} \u4E2A\u5B50Block)`:""}}else{let y=this.blocks.find(x=>x.id===e);y&&y.children.length>0&&(d=` (\u542B ${y.children.length} \u4E2A\u5B50Block)`)}let p=document.createElement("div");if(p.className="lifewiki-context-menu-item danger",p.textContent=i?"\u5220\u9664\u6B64\u5B50Block":`\u5220\u9664\u65E5\u8BB0Block${d}`,p.addEventListener("click",()=>{o.remove(),this.confirmAndDeleteBlock(e,n,i,!1)}),o.appendChild(p),u&&!i){let y=document.createElement("div");y.className="lifewiki-context-menu-item danger",y.textContent=`\u5220\u9664Block\u53CA\u4F1A\u8BDD\u8BB0\u5F55${d}`,y.addEventListener("click",()=>{o.remove(),this.confirmAndDeleteBlock(e,n,i,!0)}),o.appendChild(y)}document.body.appendChild(o);let f=y=>{o.contains(y.target)||(o.remove(),document.removeEventListener("click",f))};setTimeout(()=>document.addEventListener("click",f),0)}async confirmAndDeleteBlock(e,n,i,a){let r,s=0;if(i){let l=this.blocks.find(c=>c.id===n);l&&(s=l.children.length),r="\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u5B50Block\u5417\uFF1F",s>1&&(r+=`

\u6CE8\u610F\uFF1A\u7236Block\u8FD8\u6709 ${s-1} \u4E2A\u5B50Block\u3002`)}else{let l=this.blocks.find(c=>c.id===e);l&&(s=l.children.length),a?r="\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u65E5\u8BB0Block\u53CA\u5176\u4F1A\u8BDD\u8BB0\u5F55\u5417\uFF1F":r="\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u65E5\u8BB0Block\u5417\uFF1F",s>0&&(r+=`

\u6CE8\u610F\uFF1A\u8FD9\u5C06\u540C\u65F6\u5220\u9664\u6240\u6709 ${s} \u4E2A\u5B50Block\u3002`),a&&(r+=`

\u4F1A\u8BDD\u8BB0\u5F55\u5C06\u88AB\u6C38\u4E45\u5220\u9664\u3002`)}confirm(r)&&await this.deleteBlock(e,n,i,a)}async deleteBlock(e,n,i,a){try{if(i&&n?await this.deleteChildBlockFromFile(e,n):await this.deleteParentBlockFromFile(e,a),a){let s=this.plugin.getSessionManager(),o=n||e;await s.clearSession(o)}await this.loadBlocks(),this.renderBlocks(),this.selectedBlockId=null,this.selectedBlockContent=null;let r=this.plugin.getAIAnalysisView();r&&r.setActiveBlock(null,null)}catch(r){console.error("[LifeWiki] Error deleting block:",r),alert("\u5220\u9664\u5931\u8D25: "+(r instanceof Error?r.message:"\u672A\u77E5\u9519\u8BEF"))}}async deleteChildBlockFromFile(e,n){let i=`Daily/${this.currentDate}.md`,a=this.app.vault.getAbstractFileByPath(i);if((!a||!(a instanceof ct.TFile))&&(a=this.app.vault.getAbstractFileByPath(`${this.currentDate}.md`)),(!a||!(a instanceof ct.TFile))&&(a=this.app.vault.getAbstractFileByPath(`${ya}/${this.currentDate}.md`)),!(a instanceof ct.TFile))return;let s=(await this.app.vault.read(a)).split(`
`),o=new RegExp(`^- \\d{2}:\\d{2}\\s.+<!-- ${e} -->`),l=s.filter(u=>!u.match(o));await this.app.vault.modify(a,l.join(`
`));let c=this.blocks.find(u=>u.id===n);c&&(c.children=c.children.filter(u=>u.id!==e))}async deleteParentBlockFromFile(e,n){let i=`Daily/${this.currentDate}.md`,a=this.app.vault.getAbstractFileByPath(i);if((!a||!(a instanceof ct.TFile))&&(a=this.app.vault.getAbstractFileByPath(`${this.currentDate}.md`)),(!a||!(a instanceof ct.TFile))&&(a=this.app.vault.getAbstractFileByPath(`${ya}/${this.currentDate}.md`)),!(a instanceof ct.TFile))return;let s=(await this.app.vault.read(a)).split(`
`),o=-1,l=new RegExp("^### \\d{2}:\\d{2} \\[([^\\]]+)\\] #(\\S+)");for(let u=0;u<s.length;u++)if(s[u].match(l)){let d=this.blocks.find(p=>p.id===e);if(d&&s[u].includes(d.timestamp)){for(let p=u+1;p<Math.min(u+5,s.length);p++)if(s[p].includes(`<!-- ${e} -->`)){o=u;break}if(o!==-1)break}}if(o===-1)return;let c=s.length;for(let u=o+1;u<s.length;u++)if(s[u].match(l)){c=u;break}s.splice(o,c-o),await this.app.vault.modify(a,s.join(`
`)),this.blocks=this.blocks.filter(u=>u.id!==e)}startChildEditMode(e,n){this.isAppendMode=!1,this.appendModeBlockId=null,this.selectedBlockId=null,this.updateInputAreaForAppendMode(),this.editModeBlockId=e,this.isEditMode=!0,this.editingChildId=e,this.editingParentId=n,this.renderBlocks(),setTimeout(()=>{let i=this.contentContainer?.querySelector(".lifewiki-edit-textarea");i&&(i.focus(),i.addEventListener("keydown",this.handleChildEditKeydown.bind(this)))},0)}handleChildEditKeydown(e){e.key==="Enter"&&!e.shiftKey?(e.preventDefault(),this.saveChildEditMode()):e.key==="Escape"&&this.cancelChildEditMode()}cancelChildEditMode(){this.isEditMode=!1,this.editModeBlockId=null,this.editingChildId=null,this.editingParentId=null,this.renderBlocks()}async saveChildEditMode(){let e=this.editingChildId,n=this.editingParentId;if(!e||!n)return;let i=this.blocks.find(o=>o.id===n);if(!i)return;let a=i.children.findIndex(o=>o.id===e);if(a===-1)return;let s=this.contentContainer?.querySelector(".lifewiki-edit-textarea")?.value.trim()||"";i.children[a].content=s,await this.saveBlockToFile(i),this.isEditMode=!1,this.editModeBlockId=null,this.editingChildId=null,this.editingParentId=null,this.renderBlocks()}async handleAttachmentSelect(e){let n=e.files;if(!(!n||n.length===0)&&this.inputTextarea)try{for(let i of Array.from(n)){let a=pd(i.name),r=Lh(a,c=>this.app.vault.getAbstractFileByPath(c)!==null);await Ne(this.app,r);let s=await i.arrayBuffer();await this.app.vault.createBinary(r,s);let o=Nh(r),l=Ph(this.inputTextarea.value,o,this.inputTextarea.selectionStart,this.inputTextarea.selectionEnd);this.inputTextarea.value=l.value,this.inputTextarea.selectionStart=l.cursor,this.inputTextarea.selectionEnd=l.cursor,this.inputValue=this.inputTextarea.value,this.isAppendMode||(this.inputHintEl.textContent=`${this.inputTextarea.value.length}/250 \xB7 Enter \u53D1\u9001`)}}catch(i){new ct.Notice("\u9644\u4EF6\u4FDD\u5B58\u5931\u8D25: "+i.message)}finally{e.value=""}}updateInputAreaForAppendMode(){if(!this.inputTextarea||!this.inputHintEl||!this.appendModeActionsEl||!this.appendSubmitBtn)return;let e=this.blocks.find(n=>n.id===this.appendModeBlockId);this.isAppendMode&&e?(this.inputTextarea.addClass("append-mode"),this.inputTextarea.placeholder="\u8FFD\u52A0\u8BB0\u5F55...",this.inputHintEl.textContent=`\u5C06\u5728 ${e.timestamp} \u8BE5\u6761\u65E5\u8BB0\u4E0B\u8FFD\u52A0\u8BB0\u5F55`,this.inputHintEl.setAttribute("style","display: none;"),this.appendSubmitBtn.textContent=`\u5C06\u5728 ${e.timestamp} \u8FD9\u6761\u65E5\u8BB0\u4E0B\u8FFD\u52A0`,this.appendModeActionsEl.classList.add("visible"),this.inputTextarea.value="",this.inputValue="",setTimeout(()=>this.inputTextarea?.focus(),0)):(this.inputTextarea.removeClass("append-mode"),this.inputTextarea.placeholder="\u8BB0\u5F55\u4ECA\u5929\u7684\u751F\u6D3B...",this.inputHintEl.textContent="Enter \u53D1\u9001 \xB7 \u6700\u591A 250 \u5B57",this.inputHintEl.removeAttribute("style"),this.appendModeActionsEl.classList.remove("visible"))}cancelAppendMode(){this.isAppendMode=!1,this.appendModeBlockId=null,this.selectedBlockId=null,this.updateInputAreaForAppendMode(),this.renderBlocks()}async submitAppend(){if(!this.isAppendMode||!this.appendModeBlockId)return;let e=this.inputTextarea?.value.trim();if(!e)return;let n=this.blocks.find(a=>a.id===this.appendModeBlockId);if(!n)return;let i=await this.appendChildToBlock(n,e);i&&(n.children.push(i),this.inputTextarea.value="",this.inputValue="",this.isAppendMode=!1,this.appendModeBlockId=null,this.selectedBlockId=null,this.updateInputAreaForAppendMode(),this.renderBlocks(),await this.startAIAnalysis(i))}startEditMode(e){this.isAppendMode=!1,this.appendModeBlockId=null,this.selectedBlockId=null,this.updateInputAreaForAppendMode(),this.editModeBlockId=e,this.isEditMode=!0,this.renderBlocks(),setTimeout(()=>{let n=this.contentContainer?.querySelector(".lifewiki-edit-textarea");n&&(n.focus(),n.addEventListener("keydown",this.handleEditKeydown.bind(this)))},0)}handleEditKeydown(e){e.key==="Enter"&&!e.shiftKey?(e.preventDefault(),this.saveEditMode()):e.key==="Escape"&&this.cancelEditMode()}async saveEditMode(){if(!this.editModeBlockId)return;let e=this.blocks.find(s=>s.id===this.editModeBlockId);if(!e)return;let n=this.contentContainer?.querySelector(".lifewiki-edit-textarea"),i=this.contentContainer?.querySelector(".lifewiki-edit-input"),a=n?.value.trim()||"",r=i?.value.trim()||e.category;e.content=a,e.category=r,this.isEditMode=!1,this.editModeBlockId=null,this.renderBlocks(),await this.saveBlockToFile(e)}cancelEditMode(){this.isEditMode=!1,this.editModeBlockId=null,this.renderBlocks()}exitEditMode(){this.isEditMode&&this.saveEditMode()}async appendChildToBlock(e,n){let i=`Daily/${this.currentDate}.md`,a=this.app.vault.getAbstractFileByPath(i);if((!a||!(a instanceof ct.TFile))&&(a=this.app.vault.getAbstractFileByPath(`${this.currentDate}.md`)),(!a||!(a instanceof ct.TFile))&&(a=this.app.vault.getAbstractFileByPath(`${ya}/${this.currentDate}.md`)),!(a instanceof ct.TFile))return null;let s=(await this.app.vault.read(a)).split(`
`),o=-1;for(let f=0;f<s.length;f++){let y=s[f].trim();if(y===`<!-- ${e.id} -->`||y===`<sub>${e.id}</sub>`){for(let x=f;x>=0;x--)if(s[x].startsWith("### ")){o=x;break}break}}if(o===-1){let f=`### ${e.timestamp} [${e.source}] ${_l(e.category)}`;for(let y=0;y<s.length;y++)if(s[y].includes(f)){o=y;break}}if(o===-1)return null;let l=s.length;for(let f=o+1;f<s.length;f++)if(s[f].startsWith("### ")){l=f;break}let c=new Date,u=`${c.getHours().toString().padStart(2,"0")}:${c.getMinutes().toString().padStart(2,"0")}`,d=bd(),p=`- ${u} ${n} <!-- ${d} -->`;return s.splice(l,0,p),await this.app.vault.modify(a,s.join(`
`)),{id:d,timestamp:u,content:n,parentId:e.id}}async saveBlockToFile(e){let n=`Daily/${this.currentDate}.md`,i=this.app.vault.getAbstractFileByPath(n);if((!i||!(i instanceof ct.TFile))&&(i=this.app.vault.getAbstractFileByPath(`${this.currentDate}.md`)),(!i||!(i instanceof ct.TFile))&&(i=this.app.vault.getAbstractFileByPath(`${ya}/${this.currentDate}.md`)),!(i instanceof ct.TFile))return;let r=(await this.app.vault.read(i)).split(`
`),s=-1,o=new RegExp(`^### ${e.timestamp} \\[([^\\]]+)\\]\\s+(.+)`);for(let f=0;f<r.length;f++)if(r[f].match(o)){s=f;break}if(s===-1)return;let l=`### ${e.timestamp} [${e.source}] ${_l(e.category)}`;r[s]=l;let c=s+1;for(;c<r.length&&!(r[c].startsWith("### ")||r[c].startsWith("- ")&&r[c].match(/^- \d{2}:\d{2}\s/));){if(r[c].trim()&&!r[c].startsWith("#")){r[c]=e.content;break}c++}(c>=r.length||r[c].trim()==="")&&r.splice(s+1,0,e.content);let u=`<!-- ${e.id} -->`,d=-1;for(let f=s+1;f<r.length;f++)if(r[f].startsWith("### ")||r[f].startsWith("- ")&&r[f].match(/^- \d{2}:\d{2}\s/)){d=f;break}d===-1&&(d=r.length);let p=!1;for(let f=s+1;f<d;f++)if(r[f].trim().match(/^<!-- [a-f0-9-]+ -->$/)){r[f]=u,p=!0;break}p||r.splice(d,0,u),await this.app.vault.modify(i,r.join(`
`))}async submitBlock(e){let n=e.value.trim();if(!n||this.isLoading)return;this.isLoading=!0;let i=new Date,a=`${i.getHours().toString().padStart(2,"0")}:${i.getMinutes().toString().padStart(2,"0")}`,r={id:bd(),timestamp:a,source:"TraceMind",category:"\u5F85\u5206\u6790",content:n,children:[],parentId:null};this.blocks.push(r),e.value="",this.inputValue="",this.renderBlocks(),await this.appendBlockToFile(r),await this.startAIAnalysis(r),this.isLoading=!1}async appendBlockToFile(e){let n=`Daily/${this.currentDate}.md`,i=this.app.vault.getAbstractFileByPath(n);if(i instanceof ct.TFile||this.app.vault.getAbstractFileByPath("Daily")instanceof ct.TFolder||await this.app.vault.createFolder("Daily"),(!i||!(i instanceof ct.TFile))&&(i=this.app.vault.getAbstractFileByPath(`${this.currentDate}.md`)),!(i instanceof ct.TFile)){let o=await zh(this.app.vault,"journal-template.md",{date:this.currentDate})+`
### ${e.timestamp} [${e.source}] ${_l(e.category)}
${e.content}
<!-- ${e.id} -->
`;await this.app.vault.create(n,o);return}let a=`
### ${e.timestamp} [${e.source}] ${_l(e.category)}
${e.content}
<!-- ${e.id} -->
`,r=await this.app.vault.read(i);await this.app.vault.modify(i,r+a)}async startAIAnalysis(e){if(!e.id){let o=bd();console.warn(`[TraceMind] block-editor: block "${e.content.substring(0,30)}..." has no ID, generated ${o}`),e.id=o}let n=this.plugin.getSessionManager(),i=this.plugin.getAIAnalysisView(),a=e.parentId||null;if(!a){let o=n.getSession(e.id,a);if(o&&o.messages&&o.messages.length>0){this.selectedBlockId=e.id,this.isAppendMode=!0,this.appendModeBlockId=e.id,this.selectedBlockContent=e.content,this.updateInputAreaForAppendMode(),this.renderBlocks(),i&&(i.setMode("analysis"),i.setActiveBlock(e.id,e.content));return}}n.getOrCreateSession(e.id,a);let r,s=[];if(a){let o=this.blocks.find(l=>l.id===a);if(o)for(let l of o.children)l.id!==e.id&&s.push({id:l.id,content:l.content})}try{r=await this.plugin.getAIProvider().analyzeBlock(e.content,e.id),console.log("[TraceMind] block-editor: analyzeBlock result:",r),console.log("[TraceMind] block-editor: aiView exists:",!!i);let l=n.setSession(e.id,r,a);if(console.log("[TraceMind] block-editor: persistedSession:",l),i){let c=e.content;console.log("[TraceMind] block-editor: calling showAgentSession"),l?i.showAgentSession(e.id,c,l,a):(console.log("[TraceMind] block-editor: no persistedSession, calling startNewSession"),i.startNewSession(e.id,c,r.aiResponse||"",a))}else console.warn("[TraceMind] block-editor: aiView is null");if(!a&&e.category==="\u5F85\u5206\u6790"&&r.areas&&r.areas.length>0){let c=Ed(r.areas);e.category=c,await this.saveBlockToFile(e),this.renderBlocks()}}catch(o){if(i){let l=a&&this.blocks.find(c=>c.id===a)?.content||e.content;i.startNewSession(e.id,l,`\u9519\u8BEF: ${o.message}`)}}}async updateBlockCategory(e){try{let i=await this.plugin.getAIProvider().analyzeBlock(e.content,e.id);if(i.areas&&i.areas.length>0){let a=Ed(i.areas);e.category=a,await this.saveBlockToFile(e)}}catch{}}formatDate(e){let n=e.getFullYear(),i=String(e.getMonth()+1).padStart(2,"0"),a=String(e.getDate()).padStart(2,"0");return`${n}-${i}-${a}`}async onClose(){}};var we=require("obsidian");var tg=new Set(["search_entity","get_entity","create_entity","update_entity","list_diary","get_diary","create_task_drafts"]);function c7(t){if(!t||typeof t!="object")return!1;let e=t.action;return typeof e=="string"&&tg.has(e)}function u7(t,e){let n=0,i=!1,a=!1;for(let r=e;r<t.length;r++){let s=t[r];if(i){a?a=!1:s==="\\"?a=!0:s==='"'&&(i=!1);continue}if(s==='"')i=!0;else if(s==="{")n++;else if(s==="}"){if(n--,n===0)return r+1;if(n<0)return-1}}return-1}function d7(t,e){let n="",i=0;for(;i<t.length;){let a=t.indexOf("{",i);if(a<0){n+=t.slice(i);break}let r=u7(t,a);if(r<0){n+=t.slice(i);break}let s=t.slice(a,r);try{let o=JSON.parse(s);if(c7(o)){e.push(o),n+=t.slice(i,a),i=r;continue}}catch{}n+=t.slice(i,r),i=r}return n}function p7(t){let e={},n=/"(type|name|date|dateRange|diaryPath)"\s*:\s*"([^"]*)"/g,i;for(;(i=n.exec(t))!==null;){let a=i[1];e[a]=i[2]}return e}function f7(t,e){let n=Array.from(tg).join("|"),i=new RegExp(String.raw`\{?\s*(?:"action"\s*:\s*")?(${n})"?\s*,\s*(?:"(?:type|name|date|dateRange|diaryPath)"\s*:\s*"[^"]*"\s*,?\s*)+\}?`,"g");return t.replace(i,(a,r)=>{let s=p7(a);return e.push({action:r,...s}),""})}function eg(t){return Rl(t).text.replace(/\n?\s*```(?:json)?\s*\{[\s\S]*"action"\s*:\s*"[^"]*[\s\S]*$/i,"").replace(/\n?\s*\{[\s\S]*"action"\s*:\s*"[^"]*[\s\S]*$/i,"").replace(/\n?\s*(?:"action"\s*:\s*")?(?:search_entity|get_entity|create_entity|update_entity|list_diary|get_diary|create_task_drafts)"?\s*,[\s\S]*$/i,"").trim()}function Rl(t){let e=[],n=/\[TRACEMIND_ACTION\]\s*\n?([\s\S]*?)\n?\s*\[\/TRACEMIND_ACTION\]/g,i=t,a;for(;(a=n.exec(t))!==null;)try{let r=a[1].trim(),s=JSON.parse(r);e.push(s),i=i.replace(a[0],"")}catch{}return i=i.replace(/\[\/TRACEMIND_ACTION\]/g,""),i=i.replace(/\[TRACEMIND_ACTION\]/g,""),i=d7(i,e),i=f7(i,e),i=i.replace(/```(?:json)?\s*```/gi,""),{text:i.trim(),actions:e}}var h7={type:"person",label:"\u4EBA\u7269",commonAttributes:[{key:"company",label:"\u516C\u53F8/\u7EC4\u7EC7",priority:"P0"},{key:"role",label:"\u804C\u4F4D/\u89D2\u8272",priority:"P0"},{key:"relationship_to_user",label:"\u4E0E\u4F60\u7684\u5173\u7CFB",priority:"P0"},{key:"responsibility",label:"\u804C\u8D23",priority:"P1"},{key:"workingStyle",label:"\u534F\u4F5C\u98CE\u683C",priority:"P1",aliases:["communicationStyle"],description:"\u6BD4 communicationStyle \u66F4\u8D34\u8FD1\u65E5\u8BB0\u6D1E\u5BDF"},{key:"personality",label:"\u6027\u683C",priority:"P2"},{key:"preferences",label:"\u504F\u597D",priority:"P2"},{key:"skills",label:"\u6280\u80FD",priority:"P2"}]},wd={company:{key:"company",label:"\u516C\u53F8/\u7EC4\u7EC7",priority:"P0",hints:["\u516C\u53F8\u3001\u5BA2\u6237\u3001\u4F9B\u5E94\u5546\u3001\u5408\u4F5C\u4F19\u4F34\u3001\u673A\u6784\u7B49\u6709\u4E13\u6709\u540D\u79F0\u7684\u7EC4\u7EC7","\u5982\uFF1A\u7A79\u5F7B\u667A\u80FD\u3001\u5B57\u8282\u8DF3\u52A8\u3001\u67D0\u4F9B\u5E94\u5546"],attributes:[{key:"relationship",label:"\u4E0E\u6211\u7684\u5173\u7CFB",priority:"P0"},{key:"roleInContext",label:"\u76F8\u5173\u89D2\u8272",priority:"P0"},{key:"industry",label:"\u884C\u4E1A",priority:"P1"},{key:"contactPeople",label:"\u8054\u7CFB\u4EBA",priority:"P1"},{key:"currentStatus",label:"\u5F53\u524D\u72B6\u6001",priority:"P1"},{key:"notes",label:"\u5907\u6CE8",priority:"P2"}]},project:{key:"project",label:"\u9879\u76EE",priority:"P0",hints:["\u957F\u671F\u76EE\u6807\u5BB9\u5668\uFF0C\u6709\u660E\u786E\u76EE\u6807\u3001\u8FB9\u754C\u3001\u9636\u6BB5\u6216\u91CC\u7A0B\u7891","\u4F1A\u627F\u8F7D\u591A\u4E2A\u4E8B\u9879\u6216\u884C\u52A8\u4EFB\u52A1\uFF0C\u5982 TraceMind 2.0 \u53D1\u5E03\u3001\u4E34\u6E2F\u7B97\u529B\u5546\u4E1A\u5316\u3001910C \u9879\u76EE","\u5982\u679C\u53EA\u662F\u4E00\u6B21\u5177\u4F53\u8DDF\u8FDB\u6216\u5355\u4E2A\u5F85\u5904\u7406\u4E8B\u52A1\uFF0C\u4F18\u5148\u7528 matter"],attributes:[{key:"stage",label:"\u9636\u6BB5",priority:"P0"},{key:"owner",label:"\u8D1F\u8D23\u4EBA",priority:"P0"},{key:"deadline",label:"\u622A\u6B62\u65E5\u671F",priority:"P1"},{key:"stakeholders",label:"\u5229\u76CA\u76F8\u5173\u8005",priority:"P1"},{key:"blockers",label:"\u963B\u788D",priority:"P1"},{key:"successCriteria",label:"\u6210\u529F\u6807\u51C6",priority:"P1"},{key:"priority",label:"\u4F18\u5148\u7EA7",priority:"P2"},{key:"budget",label:"\u9884\u7B97",priority:"P2"}]},matter:{key:"matter",label:"\u4E8B\u9879",priority:"P0",hints:["\u9700\u8981\u957F\u671F\u8BB0\u5FC6\u8FFD\u8E2A\u7684\u5177\u4F53\u4E8B\u52A1\uFF0C\u6BD4\u9879\u76EE\u5C0F\uFF0C\u53EF\u80FD\u6301\u7EED\u51E0\u5929\u5230\u51E0\u5468","\u6709\u72B6\u6001\u53D8\u5316\u3001\u4E0B\u4E00\u6B65\u3001\u7ECF\u529E\u4EBA\u6216\u6240\u5C5E\u9879\u76EE\uFF0C\u4F46\u672C\u8EAB\u4E0D\u4E00\u5B9A\u6784\u6210\u9879\u76EE","\u4E0D\u8981\u628A\u53EF\u5F53\u5929\u5B8C\u6210\u7684\u77ED\u671F\u884C\u52A8\u9879\u62BD\u6210\u4E8B\u9879\uFF1B\u8FD9\u7C7B\u5185\u5BB9\u5E94\u8FDB\u5165\u884C\u52A8\u770B\u677F\u4EFB\u52A1",'\u547D\u540D\u5EFA\u8BAE\uFF1A\u5F52\u5C5E\u9879\u76EE\u540D+\u4E8B\u9879\u63CF\u8FF0\uFF08\u5982"\u884C\u52A8\u770B\u677F\u4EFB\u52A1\u751F\u547D\u5468\u671F\u4F18\u5316"\uFF09'],attributes:[{key:"taskStatus",label:"\u72B6\u6001",priority:"P0",aliases:["status"]},{key:"nextAction",label:"\u4E0B\u4E00\u6B65",priority:"P0"},{key:"dueDate",label:"\u622A\u6B62\u65E5\u671F",priority:"P1",aliases:["deadline"]},{key:"assignee",label:"\u7ECF\u529E\u4EBA",priority:"P1"},{key:"parentProject",label:"\u6240\u5C5E\u9879\u76EE",priority:"P1"},{key:"priority",label:"\u4F18\u5148\u7EA7",priority:"P2"},{key:"effort",label:"\u5DE5\u4F5C\u91CF",priority:"P2"}]},task:{key:"task",label:"\u4EFB\u52A1\uFF08\u65E7\uFF0C\u5EFA\u8BAE\u6539\u7528\u4E8B\u9879\uFF09",priority:"P0",deprecated:!0,hints:["\u65E7\u7248\u672C subtype\uFF0C\u4FDD\u7559\u7528\u4E8E\u8BFB\u53D6\u5386\u53F2\u6863\u6848\uFF1B\u65B0\u5B9E\u4F53\u8BF7\u4F7F\u7528 matter\uFF08\u4E8B\u9879\uFF09","\u77ED\u671F\u53EF\u6267\u884C\u884C\u52A8\u8BF7\u8FDB\u5165\u884C\u52A8\u770B\u677F\uFF0C\u4E0D\u8981\u6C89\u6DC0\u4E3A\u5B9E\u4F53\u6863\u6848"],attributes:[{key:"taskStatus",label:"\u72B6\u6001",priority:"P0",aliases:["status"]},{key:"nextAction",label:"\u4E0B\u4E00\u6B65",priority:"P0"},{key:"dueDate",label:"\u622A\u6B62\u65E5\u671F",priority:"P1",aliases:["deadline"]},{key:"assignee",label:"\u7ECF\u529E\u4EBA",priority:"P1"},{key:"parentProject",label:"\u6240\u5C5E\u9879\u76EE",priority:"P1"},{key:"priority",label:"\u4F18\u5148\u7EA7",priority:"P2"},{key:"effort",label:"\u5DE5\u4F5C\u91CF",priority:"P2"}]},product:{key:"product",label:"\u4EA7\u54C1",priority:"P1",attributes:[{key:"purpose",label:"\u7528\u9014",priority:"P0"},{key:"productStatus",label:"\u72B6\u6001",priority:"P0",aliases:["status"]},{key:"users",label:"\u7528\u6237",priority:"P1"},{key:"keyFeatures",label:"\u5173\u952E\u529F\u80FD",priority:"P1"},{key:"relatedProjects",label:"\u76F8\u5173\u9879\u76EE",priority:"P1"},{key:"metrics",label:"\u6307\u6807",priority:"P2"}]},technology:{key:"technology",label:"\u6280\u672F",priority:"P1",attributes:[{key:"useCase",label:"\u7528\u9014",priority:"P0"},{key:"adoptionStatus",label:"\u91C7\u7528\u72B6\u6001",priority:"P0"},{key:"techMaturity",label:"\u6210\u719F\u5EA6",priority:"P1",aliases:["maturity"]},{key:"risks",label:"\u98CE\u9669",priority:"P1"},{key:"relatedProjects",label:"\u76F8\u5173\u9879\u76EE",priority:"P1"},{key:"alternatives",label:"\u66FF\u4EE3\u65B9\u6848",priority:"P2"}]},document:{key:"document",label:"\u6587\u6863",priority:"P2",attributes:[{key:"purpose",label:"\u7528\u9014",priority:"P0"},{key:"documentStatus",label:"\u72B6\u6001",priority:"P0",aliases:["status"]},{key:"source",label:"\u6765\u6E90",priority:"P1"},{key:"linkedProject",label:"\u5173\u8054\u9879\u76EE",priority:"P1"},{key:"latestVersion",label:"\u6700\u65B0\u7248\u672C",priority:"P1"},{key:"owner",label:"\u8D1F\u8D23\u4EBA",priority:"P2"}]},location:{key:"location",label:"\u5730\u70B9",priority:"P2",attributes:[{key:"where",label:"\u5730\u70B9",priority:"P0"},{key:"whyRelevant",label:"\u4E3A\u4F55\u5173\u6CE8",priority:"P0"},{key:"associatedPeople",label:"\u5173\u8054\u4EBA\u7269",priority:"P1"},{key:"associatedEvents",label:"\u5173\u8054\u4E8B\u4EF6",priority:"P1"},{key:"notes",label:"\u5907\u6CE8",priority:"P2"}]},other:{key:"other",label:"\u5176\u4ED6",priority:"P2",attributes:[{key:"description",label:"\u63CF\u8FF0",priority:"P0"},{key:"objectStatus",label:"\u72B6\u6001",priority:"P1",aliases:["status"]},{key:"notes",label:"\u5907\u6CE8",priority:"P2"}]}},g7={type:"object",label:"\u5BA2\u4F53",commonAttributes:[{key:"subtype",label:"\u7C7B\u578B",priority:"P0"},{key:"summary",label:"\u6458\u8981",priority:"P1"},{key:"tags",label:"\u6807\u7B7E",priority:"P2"}],subtypes:wd,defaultSubtype:"other"},ng={friction:{key:"friction",label:"\u6469\u64E6",priority:"P0",hints:["\u53CD\u590D\u9047\u5230\u7684\u963B\u529B\u3001\u5361\u70B9\u3001\u8FD4\u5DE5\u3001\u4F4E\u6548\u3001\u51B2\u7A81","\u5982\uFF1A\u65B9\u5411\u53CD\u590D\u53D8\u5316\u3001\u9700\u6C42\u8FB9\u754C\u4E0D\u6E05\u3001\u4F1A\u8BAE\u6CA1\u6709\u7ED3\u8BBA"],attributes:[{key:"trigger",label:"\u89E6\u53D1\u6761\u4EF6",priority:"P0"},{key:"impact",label:"\u5F71\u54CD",priority:"P0"},{key:"frequency",label:"\u9891\u7387",priority:"P1"},{key:"possibleCause",label:"\u53EF\u80FD\u539F\u56E0",priority:"P1"},{key:"relatedEntities",label:"\u76F8\u5173\u5B9E\u4F53",priority:"P1"},{key:"candidateResolution",label:"\u5019\u9009\u89E3\u51B3\u65B9\u6848",priority:"P2"}]},goal:{key:"goal",label:"\u76EE\u6807",priority:"P0",hints:["\u6301\u7EED\u60F3\u63A8\u8FDB\u3001\u8FBE\u6210\u3001\u6539\u5584\u6216\u5EFA\u7ACB\u7684\u65B9\u5411","\u5982\uFF1A\u63D0\u5347\u8868\u8FBE\u80FD\u529B\u3001\u51CF\u5C11\u65E0\u6548\u4F1A\u8BAE\u3001\u5EFA\u7ACB\u4E2A\u4EBA\u8BB0\u5FC6\u7CFB\u7EDF"],attributes:[{key:"desiredOutcome",label:"\u671F\u671B\u7ED3\u679C",priority:"P0"},{key:"currentState",label:"\u5F53\u524D\u72B6\u6001",priority:"P0"},{key:"nextStep",label:"\u4E0B\u4E00\u6B65",priority:"P1"},{key:"blockers",label:"\u963B\u788D",priority:"P1"},{key:"deadline",label:"\u622A\u6B62\u65E5\u671F",priority:"P1"},{key:"successMetric",label:"\u6210\u529F\u6307\u6807",priority:"P2"}]},judgment:{key:"judgment",label:"\u5224\u65AD",priority:"P0",hints:["\u5BF9\u4EBA\u6216\u4E8B\u5F62\u6210\u7684\u770B\u6CD5\u3001\u8BC4\u4EF7\u3001\u7ACB\u573A","\u5982\uFF1A\u5F53\u524D\u9879\u76EE\u4EF7\u503C\u4E0D\u6E05\u6670\u3001Markdown-first \u66F4\u9002\u5408 MVP"],attributes:[{key:"claim",label:"\u4E3B\u5F20",priority:"P0"},{key:"judgmentConfidence",label:"\u786E\u4FE1\u5EA6",priority:"P0",aliases:["confidence"]},{key:"evidence",label:"\u8BC1\u636E",priority:"P1"},{key:"counterEvidence",label:"\u53CD\u8BC1",priority:"P1"},{key:"updatedAt",label:"\u66F4\u65B0\u65F6\u95F4",priority:"P2"}]},idea:{key:"idea",label:"\u60F3\u6CD5",priority:"P0",hints:["\u7075\u611F\u3001\u5174\u8DA3\u3001\u63A2\u7D22\u6B32\u3001\u53CD\u590D\u601D\u8003\u7684\u95EE\u9898","\u5982\uFF1AAI\u8BB0\u5FC6\u7CFB\u7EDF\u8BBE\u8BA1\u3001\u5982\u4F55\u8BA9\u788E\u7247\u8BB0\u5F55\u83B7\u5F97\u6D1E\u5BDF"],attributes:[{key:"coreIdea",label:"\u6838\u5FC3\u60F3\u6CD5",priority:"P0"},{key:"useCase",label:"\u5E94\u7528\u573A\u666F",priority:"P0"},{key:"nextExperiment",label:"\u4E0B\u4E00\u6B65\u5B9E\u9A8C",priority:"P1"},{key:"linkedObjects",label:"\u76F8\u5173\u5BF9\u8C61",priority:"P1"},{key:"openQuestions",label:"\u5F00\u653E\u95EE\u9898",priority:"P2"}]}},m7={type:"theme",label:"\u4E3B\u9898",commonAttributes:[{key:"subtype",label:"\u7C7B\u578B",priority:"P0"},{key:"summary",label:"\u6458\u8981",priority:"P1",aliases:["context"]},{key:"relatedEntities",label:"\u76F8\u5173\u5B9E\u4F53",priority:"P1"},{key:"trend",label:"\u8D8B\u52BF",priority:"P2"}],subtypes:ng,defaultSubtype:"friction"},Zs={person:h7,object:g7,theme:m7};function y7(){let t=new Map,e=new Map,n=["person","object","theme"];for(let i of n){let a=Zs[i],r=[...a.commonAttributes];if(a.subtypes)for(let s of Object.values(a.subtypes))r.push(...s.attributes);for(let s of r)if(s.aliases&&s.aliases.length>0){t.set(s.key,s.aliases);for(let o of s.aliases)e.set(o,s.key)}}return{canonicalToAliases:t,aliasToCanonical:e}}var{canonicalToAliases:x7,aliasToCanonical:v7}=y7();function Tn(t){return Zs[t]}function Vn(t,e){let n=Zs[t],i=e;n.subtypes&&(!i||!n.subtypes[i])&&(i=n.defaultSubtype);let a=new Set,r=[],s=[],o=[];for(let l of n.commonAttributes)a.add(l.key),l.priority==="P0"?r.push(l.key):l.priority==="P1"?s.push(l.key):o.push(l.key);if(i&&n.subtypes?.[i])for(let l of n.subtypes[i].attributes)a.has(l.key)||(a.add(l.key),l.priority==="P0"?r.push(l.key):l.priority==="P1"?s.push(l.key):o.push(l.key));return{p0:r,p1:s,p2:o}}function Qe(t,e){if(t[e]!=null)return!0;let n=x7.get(e);if(n){for(let i of n)if(t[i]!=null)return!0}return!1}function b7(t,e,n){let i=v7.get(n);if(!i)return!1;let a=Zs[t],r=e;a.subtypes&&(!r||!a.subtypes[r])&&(r=a.defaultSubtype);for(let s of a.commonAttributes)if(s.key===i)return!0;if(r&&a.subtypes?.[r]){for(let s of a.subtypes[r].attributes)if(s.key===i)return!0}return!1}function Dl(t,e,n,i){for(let a of["maturity","confidence"]){let r=n[a];r!=null&&(a in i||b7(t,e,a)&&(i[a]=r))}}function Gn(t,e,n,i){let a=i?.preserveAliases!==!1,r={...n},s=Zs[t],o=e;s.subtypes&&(!o||!s.subtypes[o])&&(o=s.defaultSubtype);let l=new Map;for(let c of s.commonAttributes)l.set(c.key,c);if(o&&s.subtypes?.[o])for(let c of s.subtypes[o].attributes)l.has(c.key)||l.set(c.key,c);for(let[,c]of l){if(!c.aliases||c.aliases.length===0)continue;let u=r[c.key],d=u!=null&&u!=="";for(let p of c.aliases){let f=r[p],y=f!=null&&f!=="";!d&&y&&(r[c.key]=f),a||delete r[p]}}return r}var k7=Object.keys(wd),E7=Object.keys(ng),ig={};for(let[t,e]of Object.entries(wd))ig[t]=e.priority;var Cd={person:{p0:["company","role","relationship_to_user"],p1:["responsibility","communicationStyle"],p2:["personality","preferences","skills"]},object:{p0:["subtype","status"],p1:["deadline","description"],p2:["priority","goals"]},theme:{p0:["subtype"],p1:["occurrenceCount","context"],p2:["context"]}};function w7(){let t={},e={},n=["person","object","theme"];for(let i of n){let a=Tn(i),r=Cd[i],s={label:a.label,p0:r.p0,p1:r.p1,p2:r.p2};if(a.subtypes){s.subtypes={};for(let[o,l]of Object.entries(a.subtypes))s.subtypes[o]={priority:l.priority,label:l.label,deprecated:l.deprecated,hints:l.hints}}t[i]=s}for(let i of n){let a=Tn(i);for(let r of a.commonAttributes)e[r.key]=r.label;if(a.subtypes)for(let r of Object.values(a.subtypes))for(let s of r.attributes)e[s.key]||(e[s.key]=s.label)}return e.communicationStyle="\u6C9F\u901A\u98CE\u683C",e.occurrenceCount="\u51FA\u73B0\u6B21\u6570",e.context="\u80CC\u666F",e.deadline="\u622A\u6B62\u65E5\u671F",e.description="\u63CF\u8FF0",e.status="\u72B6\u6001",e.goals="\u76EE\u6807",e.priority="\u4F18\u5148\u7EA7",{entityTypes:t,attributeLabels:e}}var ag=w7(),rg={...ag};function sg(){rg={...ag},console.log("[TraceMind] Loaded entity type config")}function og(){return rg}function Qs(t,e){return e&&og().entityTypes[t]?.subtypes?.[e]?.label||""}function lg(){let t=og().entityTypes,e=["\u5B9E\u4F53\u7C7B\u578B\u89C4\u5219\uFF1A"];e.push('- "person": '+t.person.label+"\uFF08\u5982 \u5F20\u4E09\u3001John Smith\uFF09");let n=t.object.subtypes||{},i=Object.entries(n).filter(([,o])=>!o.deprecated),a=i.map(([o])=>o).join("\u3001");e.push('- "object": '+t.object.label+"\uFF0C\u53EF\u7528 subtype\uFF1A"+a);for(let[o,l]of i)l.hints&&l.hints.length>0&&e.push("  - "+o+" \u8BC6\u522B\uFF1A"+l.hints.join("\uFF1B"));let r=t.theme.subtypes||{},s=Object.keys(r).join("\u3001");e.push('- "theme": '+t.theme.label+"\uFF0C\u53EF\u7528 subtype\uFF1A"+s);for(let[o,l]of Object.entries(r))l.hints&&l.hints.length>0&&e.push("  - "+o+" \u8BC6\u522B\uFF1A"+l.hints.join("\uFF1B"));return e.join(`
`)}function cg(t,e){let n=Tn(t);if(!n)return"";let i=Vn(t,e),a=[...i.p0,...i.p1],r={};for(let o of n.commonAttributes)r[o.key]=o.label;if(e&&n.subtypes?.[e])for(let o of n.subtypes[e].attributes)r[o.key]||(r[o.key]=o.label);let s=[];if(s.push("\u53EF\u7528\u5C5E\u6027\uFF1A"+a.map(o=>{let l=r[o]||o;return o+"\uFF08"+l+"\uFF09"}).join("\u3001")),n.subtypes){let o=Object.entries(n.subtypes).filter(([,l])=>!l.deprecated).map(([l,c])=>l+":"+c.label).join("/");s.push("- subtype \u53EF\u9009\u503C\uFF1A"+o)}return s.join(`
`)}function Sd(){let t=[];t.push("Vault \u7ED3\u6784\uFF1A");let n=Tn("person").commonAttributes.filter(c=>c.priority!=="P2").map(c=>c.key);t.push(`- Person/{name}.md \u2014 \u4EBA\u7269\u6863\u6848\uFF08\u5C5E\u6027: ${n.join(", ")}\uFF09`);let i=Tn("object"),a=i.subtypes?Object.keys(i.subtypes).join("/"):"",r=[];if(i.subtypes){if(i.subtypes.project){let c=i.subtypes.project.attributes.filter(u=>u.priority!=="P2").map(u=>u.key);r.push(`project: ${c.join(", ")}`)}if(i.subtypes.matter){let c=i.subtypes.matter.attributes.filter(u=>u.priority!=="P2").map(u=>u.key);r.push(`matter: ${c.join(", ")}`)}if(i.subtypes.technology){let c=i.subtypes.technology.attributes.filter(u=>u.priority!=="P2").map(u=>u.key);r.push(`technology: ${c.join(", ")}`)}}t.push(`- Object/{name}.md \u2014 \u5BA2\u4F53\u6863\u6848\uFF08\u5C5E\u6027: subtype=${a}\uFF09`),r.length>0&&t.push(`  subtype \u793A\u4F8B: ${r.join("\uFF1B")}`);let s=Tn("theme"),o=s.subtypes?Object.keys(s.subtypes).join("/"):"",l=[];if(s.subtypes){if(s.subtypes.friction){let c=s.subtypes.friction.attributes.filter(u=>u.priority!=="P2").map(u=>u.key);l.push(`friction: ${c.join(", ")}`)}if(s.subtypes.judgment){let c=s.subtypes.judgment.attributes.filter(u=>u.priority!=="P2").map(u=>u.key);l.push(`judgment: ${c.join(", ")}`)}}return t.push(`- Theme/{name}.md \u2014 \u4E3B\u9898\u6863\u6848\uFF08\u5C5E\u6027: subtype=${o}\uFF09`),l.length>0&&t.push(`  subtype \u793A\u4F8B: ${l.join("\uFF1B")}`),t.push("- Daily/YYYY-MM-DD.md \u2014 \u65E5\u8BB0"),t.join(`
`)}var C7=`\u4F60\u662F\u4E00\u4F4D\u6D1E\u5BDF\u529B\u654F\u9510\u7684\u65E5\u8BB0\u5206\u6790\u4E13\u5BB6\u3002\u7528\u6237\u6BCF\u5929\u8BB0\u5F55\u751F\u6D3B\u548C\u5DE5\u4F5C\u65E5\u8BB0\uFF0C\u4F60\u9700\u8981\u6839\u636E\u5F53\u5929\u7684\u65E5\u8BB0\u5185\u5BB9\uFF0C\u751F\u6210\u4E00\u4EFD\u7ED3\u6784\u5316\u7684"\u4ECA\u65E5\u6D1E\u5BDF"\u62A5\u544A\u3002

## \u62A5\u544A\u683C\u5F0F\u8981\u6C42

\u4E25\u683C\u6309\u7167\u4EE5\u4E0B 6 \u4E2A\u7AE0\u8282\u8F93\u51FA Markdown\uFF0C\u4E0D\u8981\u9057\u6F0F\u4EFB\u4F55\u7AE0\u8282\uFF1A

## \u4ECA\u65E5\u6982\u89C8

\u7528\u4E00\u53E5\u8BDD\u6982\u62EC\u4ECA\u5929\u7684\u6574\u4F53\u57FA\u8C03\u3002\u4F8B\u5982\uFF1A"\u4ECA\u5929\u662F\u5DE5\u4F5C\u9A71\u52A8\u7684\u4E00\u5929\uFF0C\u4E3B\u8981\u56F4\u7ED5 Q2 \u9879\u76EE\u63A8\u8FDB\u5C55\u5F00\u3002"

## \u6CE8\u610F\u529B\u5206\u5E03

\u5217\u51FA\u4ECA\u5929\u5404\u9886\u57DF\u7684\u6CE8\u610F\u529B\u5360\u6BD4\uFF08\u4EE5\u767E\u5206\u6BD4\u5448\u73B0\uFF09\uFF0C\u5E76\u5728\u5360\u6BD4\u6700\u9AD8\u7684\u9886\u57DF\u4E0B\u65B9\u52A0\u4E00\u884C\u7B80\u77ED\u7684\u6295\u5165\u65B9\u5411\u6982\u62EC\u3002\u4F8B\u5982\uFF1A
- **\u5DE5\u4F5C** 60% \u2014 \u4E3B\u8981\u96C6\u4E2D\u5728\u4F9B\u5E94\u5546\u8C08\u5224\u548C\u56E2\u961F\u7BA1\u7406
- **\u751F\u6D3B** 25%
- **\u5B66\u4E60** 15%

## \u4E3B\u7EBF\u4E0E\u53D1\u6563

\u5206\u6790\u4ECA\u5929\u7684\u8BB0\u5F55\u662F\u56F4\u7ED5\u4E00\u4E2A\u6838\u5FC3\u65B9\u5411\u5C55\u5F00\uFF0C\u8FD8\u662F\u5185\u5BB9\u6BD4\u8F83\u53D1\u6563\u3002\u5982\u679C\u56F4\u7ED5\u4E3B\u7EBF\uFF0C\u6307\u51FA\u4E3B\u7EBF\u662F\u4EC0\u4E48\u3002\u5982\u679C\u662F\u53D1\u6563\u7684\uFF0C\u8BF4\u660E\u53D1\u6563\u7684\u7279\u70B9\u3002

## \u53D8\u5316\u4E0E\u6469\u64E6

\u63D0\u53D6\u4ECA\u5929\u51FA\u73B0\u7684\u91CD\u8981\u53D8\u5316\uFF08\u65B0\u4EBA\u3001\u65B0\u9879\u76EE\u3001\u65B0\u60C5\u51B5\uFF09\u3001\u963B\u529B\u6216\u6469\u64E6\uFF08\u56F0\u96BE\u3001\u51B2\u7A81\u3001\u5EF6\u8FDF\uFF09\uFF0C\u4EE5\u53CA\u5B83\u4EEC\u53EF\u80FD\u5E26\u6765\u7684\u5F71\u54CD\u3002\u5982\u679C\u6CA1\u6709\u660E\u663E\u53D8\u5316\u6216\u6469\u64E6\uFF0C\u4E5F\u8981\u5982\u5B9E\u8BF4\u660E\u3002

## \u4E3B\u9898\u52A8\u6001

\u7ED3\u5408\u5DF2\u6709\u7684\u5B9E\u4F53\u6863\u6848\uFF08\u7279\u522B\u662F Theme \u7C7B\u578B\u7684\u5361\u7247\uFF09\uFF0C\u5206\u6790\u4ECA\u5929\u7684\u65E5\u8BB0\u4E2D\uFF1A
- **\u65B0\u589E\u4E3B\u9898**\uFF1A\u4ECA\u5929\u65B0\u51FA\u73B0\u7684\u4E3B\u9898\uFF0C\u6309 subtype \u5206\u7C7B\u5217\u51FA\uFF08\u6469\u64E6/\u76EE\u6807/\u5224\u65AD/\u60F3\u6CD5\uFF09\u3002\u547D\u540D\u8981\u5177\u4F53\uFF0C\u4E0D\u8981\u7528\u6CDB\u8BCD
- **\u5F3A\u5316\u4E3B\u9898**\uFF1A\u4E0E\u5DF2\u6709 Theme \u5361\u7247\u547C\u5E94\u3001\u88AB\u65B0\u8BC1\u636E\u5F3A\u5316\u7684\u4E3B\u9898
- **\u6D88\u9000\u4E3B\u9898**\uFF1A\u4E4B\u524D\u6D3B\u8DC3\u4F46\u6700\u8FD1\u672A\u518D\u51FA\u73B0\u7684\u4E3B\u9898

\u6BCF\u4E2A\u4E3B\u9898\u6807\u6CE8 subtype \u4E2D\u6587\u540D\uFF08\u5982"\u6469\u64E6\uFF1A\u65B9\u5411\u53CD\u590D\u53D8\u5316"\u3001"\u76EE\u6807\uFF1A\u63D0\u5347\u8868\u8FBE\u80FD\u529B"\uFF09\u3002

## \u4E0E\u524D\u65E5\u5BF9\u6BD4

\u5BF9\u6BD4\u4ECA\u5929\u548C\u524D\u4E00\u5929\u7684\u65E5\u8BB0\uFF0C\u5206\u6790\u5728\u6CE8\u610F\u529B\u65B9\u5411\u3001\u5185\u5BB9\u4E3B\u9898\u3001\u60C5\u7EEA\u57FA\u8C03\u7B49\u65B9\u9762\u7684\u53D8\u5316\u3002\u5982\u679C\u524D\u4E00\u5929\u6CA1\u6709\u65E5\u8BB0\u6216\u6570\u636E\u4E0D\u8DB3\uFF0C\u8BF4\u660E\u5373\u53EF\u3002

## \u8F93\u51FA\u89C4\u5219

- \u53EA\u8F93\u51FA\u4E0A\u8FF0 6 \u4E2A\u7AE0\u8282\u7684 Markdown\uFF0C\u4E0D\u8981\u6DFB\u52A0\u5176\u4ED6\u5185\u5BB9
- \u6BCF\u4E2A\u7AE0\u8282\u5FC5\u987B\u6709\u5B9E\u8D28\u5185\u5BB9\uFF0C\u4E0D\u80FD\u53EA\u5199"\u65E0"
- \u57FA\u4E8E\u63D0\u4F9B\u7684\u65E5\u8BB0\u5185\u5BB9\u8FDB\u884C\u5206\u6790\uFF0C\u4E0D\u8981\u7F16\u9020
- \u4F7F\u7528\u4E2D\u6587`;function ug(t){let e=[];return e.push("## \u7528\u6237\u80CC\u666F"),e.push(t.profileContext||"\u6682\u65E0\u7528\u6237\u80CC\u666F\u4FE1\u606F"),e.push(""),e.push("## \u5B9E\u4F53\u6863\u6848\u6458\u8981"),e.push(t.entityIndexSummary||"\u6682\u65E0\u5B9E\u4F53\u6863\u6848"),e.push(""),e.push("## \u4ECA\u5929\u7684\u65E5\u8BB0"),e.push(t.todayBlocks||"(\u4ECA\u5929\u8FD8\u6CA1\u6709\u5199\u65E5\u8BB0)"),e.push(""),e.push("## \u524D\u4E00\u5929\u7684\u65E5\u8BB0"),e.push(t.yesterdayBlocks||"(\u524D\u4E00\u5929\u6CA1\u6709\u65E5\u8BB0)"),[{role:"system",content:C7},{role:"user",content:e.join(`
`)}]}async function Il(t,e){let n=t+"|||"+e,a=new TextEncoder().encode(n),r=await crypto.subtle.digest("SHA-256",a);return Array.from(new Uint8Array(r)).map(o=>o.toString(16).padStart(2,"0")).join("")}function dg(t){if(t.length===0)return"\u6682\u65E0\u5B9E\u4F53\u6863\u6848";let e=new Map;for(let r of t){let s=r.cardType||r.type||"unknown";e.has(s)||e.set(s,[]),e.get(s).push(r)}let n={person:"\u4EBA\u7269",object:"\u5BA2\u4F53",theme:"\u4E3B\u9898"},i=[],a=["person","object","theme"];for(let r of a){let s=e.get(r);if(!s||s.length===0)continue;let o=[...s].sort((u,d)=>new Date(d.lastUpdated).getTime()-new Date(u.lastUpdated).getTime()).slice(0,20),l=n[r]||r,c=o.map(u=>`${u.name}(${u.maturity||"L0"})`).join(", ");i.push(`${l}(${o.length}): ${c}`)}return i.join("; ")||"\u6682\u65E0\u5B9E\u4F53\u6863\u6848"}function pg(t){return typeof t=="string"?t.trim():""}function Ad(t,e){if(t.action!=="create_task_drafts")return[];let n=Array.isArray(t.tasks)?t.tasks:[],i=[];for(let a of n){let r=a,s=pg(r.title),o=pg(r.description||r.detail||r.summary);if(!(!s||!o)&&(i.push({title:s,description:o,source:e,status:"todo"}),i.length>=8))break}return i}function S7(t){let n=(t.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]||t).trim();try{return JSON.parse(n)}catch{let i=n.indexOf("{"),a=n.lastIndexOf("}");if(i>=0&&a>i)return JSON.parse(n.slice(i,a+1));throw new Error("Agent \u8F93\u51FA\u4E2D\u672A\u627E\u5230\u6709\u6548\u4EFB\u52A1 JSON")}}function Td(t,e){let n=S7(t),i=Array.isArray(n)?n:Array.isArray(n.tasks)?n.tasks:[];return Ad({action:"create_task_drafts",tasks:i},e)}function fg(t){return["\u4F60\u662F TraceMind \u7684\u884C\u52A8\u4EFB\u52A1\u89C4\u5212\u52A9\u624B\u3002\u8BF7\u628A\u5F53\u524D\u65E5\u8BB0\u4E2D\u9002\u5408\u63A8\u8FDB\u7684\u4E8B\u9879\u6574\u7406\u6210\u884C\u52A8\u770B\u677F\u4EFB\u52A1\u8349\u7A3F\u3002","","\u8F93\u51FA\u8981\u6C42\uFF1A","- \u53EA\u8F93\u51FA\u5408\u6CD5 JSON\uFF0C\u4E0D\u8981 Markdown\uFF0C\u4E0D\u8981\u89E3\u91CA\u3002",'- JSON \u683C\u5F0F\uFF1A{"tasks":[{"title":"\u4EFB\u52A1\u6807\u9898","description":"\u4EFB\u52A1\u8BF4\u660E"}]}',"- \u4EFB\u52A1\u6570\u91CF\u63A7\u5236\u5728 1-6 \u4E2A\u3002","- title \u8981\u77ED\uFF0C\u50CF\u770B\u677F\u5361\u7247\u6807\u9898\u3002","- description \u8981\u8BF4\u660E\u76EE\u6807\u3001\u8F93\u5165\u6750\u6599\u3001\u671F\u671B\u4EA4\u4ED8\u7269\uFF1B\u5982\u679C\u6D89\u53CA\u94FE\u63A5\u3001\u9644\u4EF6\u3001\u672C\u5730\u6587\u4EF6\uFF0C\u5199\u6E05\u695A\u9700\u8981 agent \u89E3\u6790\u8FD9\u4E9B\u6750\u6599\u3002","- \u4E0D\u8981\u628A\u7EAF\u60F3\u6CD5\u3001\u60C5\u7EEA\u6216\u65E0\u9700\u884C\u52A8\u7684\u5185\u5BB9\u786C\u62C6\u6210\u4EFB\u52A1\u3002","",t.sourceTitle?`\u6765\u6E90\uFF1A${t.sourceTitle}`:"","\u5F53\u524D\u65E5\u8BB0\uFF1A",t.sourceContent||"\uFF08\u7A7A\uFF09","","\u7528\u6237\u8981\u6C42\uFF1A",t.userRequest].filter(Boolean).join(`
`)}function hg(t){return["\u4F60\u662F TraceMind \u7684\u6F5C\u5728\u4EFB\u52A1\u8BC6\u522B\u52A9\u624B\u3002\u8BF7\u4ECE\u65E5\u8BB0\u4E2D\u8BC6\u522B\u662F\u5426\u5B58\u5728\u9002\u5408\u8FDB\u5165\u884C\u52A8\u770B\u677F\u7684\u660E\u786E\u884C\u52A8\u9879\u3002","","\u5224\u65AD\u539F\u5219\uFF1A","- \u4FDD\u5B88\u8BC6\u522B\u3002\u53EA\u6709\u51FA\u73B0\u660E\u786E\u627F\u8BFA\u3001\u5F85\u529E\u3001\u4EA4\u4ED8\u7269\u3001\u8DDF\u8FDB\u4E8B\u9879\u6216\u53EF\u6267\u884C\u52A8\u4F5C\u65F6\u624D\u751F\u6210\u4EFB\u52A1\u3002","- \u4E0D\u8981\u628A\u666E\u901A\u60F3\u6CD5\u3001\u60C5\u7EEA\u3001\u611F\u53D7\u3001\u5224\u65AD\u3001\u7075\u611F\u3001\u4E8B\u5B9E\u8BB0\u5F55\u786C\u8F6C\u6210\u4EFB\u52A1\u3002","- \u5982\u679C\u53EA\u662F\u503C\u5F97\u601D\u8003\u4F46\u6CA1\u6709\u660E\u786E\u884C\u52A8\uFF0C\u4E0D\u8981\u751F\u6210\u4EFB\u52A1\u3002","- \u5982\u679C\u4EFB\u52A1\u6D89\u53CA\u7F51\u9875\u94FE\u63A5\u3001\u9644\u4EF6\u3001\u672C\u5730\u6587\u4EF6\u6216 vault \u6587\u4EF6\uFF0Cdescription \u5FC5\u987B\u5199\u660E\u9700\u8981\u89E3\u6790\u8FD9\u4E9B\u6750\u6599\u3002","- \u6BCF\u4E2A\u4EFB\u52A1\u5E94\u80FD\u88AB\u7528\u6237\u6216\u672C\u5730 Agent \u6267\u884C\uFF0C\u5E76\u6709\u6E05\u6670\u7ED3\u679C\u3002","","\u8F93\u51FA\u8981\u6C42\uFF1A","- \u53EA\u8F93\u51FA\u5408\u6CD5 JSON\uFF0C\u4E0D\u8981 Markdown\uFF0C\u4E0D\u8981\u89E3\u91CA\u3002",'- JSON \u683C\u5F0F\uFF1A{"tasks":[{"title":"\u4EFB\u52A1\u6807\u9898","description":"\u4EFB\u52A1\u8BF4\u660E"}]}','- \u6CA1\u6709\u660E\u786E\u4EFB\u52A1\u65F6\u8F93\u51FA\uFF1A{"tasks":[]}',"- \u4EFB\u52A1\u6570\u91CF\u63A7\u5236\u5728 1-4 \u4E2A\u3002","- title \u8981\u77ED\uFF0C\u50CF\u770B\u677F\u5361\u7247\u6807\u9898\u3002","- description \u8981\u8BF4\u660E\u76EE\u6807\u3001\u8F93\u5165\u6750\u6599\u3001\u671F\u671B\u4EA4\u4ED8\u7269\u3002","",t.sourceTitle?`\u6765\u6E90\uFF1A${t.sourceTitle}`:"","\u5F53\u524D\u65E5\u8BB0\uFF1A",t.sourceContent||"\uFF08\u7A7A\uFF09"].filter(Boolean).join(`
`)}function gg(){return["- create_task_drafts: \u5F53\u7528\u6237\u5E0C\u671B\u201C\u751F\u6210\u4EFB\u52A1/\u62C6\u6210\u884C\u52A8/\u8FDB\u5165\u884C\u52A8\u770B\u677F/\u5B89\u6392\u6267\u884C\u201D\u65F6\u4F7F\u7528\u3002",'  \u683C\u5F0F\uFF1A{"action":"create_task_drafts","tasks":[{"title":"\u4EFB\u52A1\u6807\u9898","description":"\u4EFB\u52A1\u8BF4\u660E\uFF0C\u5305\u542B\u76EE\u6807\u3001\u8F93\u5165\u6750\u6599\u548C\u4EA4\u4ED8\u7269"}]}',"  \u89C4\u5219\uFF1A\u53EA\u751F\u6210\u4EFB\u52A1\u8349\u7A3F\uFF0C\u4E0D\u8981\u76F4\u63A5\u4FDD\u5B58\uFF1BTraceMind \u4F1A\u5C55\u793A\u786E\u8BA4\u5361\u7247\uFF0C\u7531\u7528\u6237\u51B3\u5B9A\u662F\u5426\u52A0\u5165\u884C\u52A8\u770B\u677F\u3002"].join(`
`)}var vr="tracemind-ai-analysis",Fl=class extends we.ItemView{plugin;activeBlockId=null;activeParentId=null;mode="analysis";chatMessagesEl=null;inputAreaEl=null;inputTextarea=null;agentSelectEl=null;currentAgentKey="";detectedLocalAgents=[];sendBtnEl=null;chatModeClearBtnEl=null;modeToggleBtnEl=null;headerTitleEl=null;isLoading=!1;emptyStateEl=null;analysisTabsEl=null;blockInsightsEl=null;entityIndexEl=null;analysisTab="block";thinkingEl=null;hasTodayInsightAttention=!1;clarificationPhase="summary";clarificationQueue=[];knownEntities=[];currentEntityIndex=0;allSessionEntities=[];irrelevantKnownEntityNames=new Set;skippedEntityNames=new Set;replayingHistory=!1;constructor(e,n){super(e),this.plugin=n}getViewType(){return vr}getDisplayText(){return"TraceMind AI\u6D1E\u5BDF"}getIcon(){return ma}async onOpen(){this.plugin.aiAnalysisView=this;let e=this.containerEl;e.empty(),this.addStyles();let n=e.createEl("div",{cls:"lifewiki-ai-panel"}),i=n.createEl("div",{cls:"lifewiki-ai-header"}),a=i.createEl("div",{cls:"lifewiki-ai-header-title"});this.headerTitleEl=a.createEl("span",{text:"AI \u6D1E\u5BDF"}),this.analysisTabsEl=a.createEl("div",{cls:"lifewiki-analysis-tabs"});let r=i.createEl("div",{cls:"lifewiki-ai-header-actions"});this.modeToggleBtnEl=r.createEl("button",{cls:"lifewiki-mode-toggle-btn analysis",attr:{type:"button",title:"\u5207\u6362\u4E3A\u804A\u5929\u6A21\u5F0F"}}),this.renderModeToggleButton(),this.modeToggleBtnEl.addEventListener("click",()=>{this.mode==="analysis"?this.switchToChatMode():this.switchToAnalysisMode()}),this.chatModeClearBtnEl=r.createEl("button",{cls:"lifewiki-ai-clear-btn",attr:{title:"\u6E05\u7A7A\u804A\u5929"}}),(0,we.setIcon)(this.chatModeClearBtnEl,"trash-2");let s=this.chatModeClearBtnEl.querySelector("svg");s&&(s.setAttribute("width","20"),s.setAttribute("height","20")),this.chatModeClearBtnEl.addClass("hidden"),this.chatModeClearBtnEl.addEventListener("click",()=>{this.clearChatSession()});let o=n.createEl("div",{cls:"lifewiki-ai-scroll"});this.emptyStateEl=o.createEl("div",{cls:"lifewiki-empty-state"}),this.emptyStateEl.createEl("span",{cls:"lifewiki-empty-state-title",text:"\u9009\u62E9\u6216\u8F93\u5165\u4E00\u6761\u65E5\u8BB0"}),this.entityIndexEl=o.createEl("div",{cls:"lifewiki-entity-index"}),this.chatMessagesEl=o.createEl("div",{cls:"lifewiki-chat-messages"}),this.blockInsightsEl=o.createEl("div",{cls:"lifewiki-block-insights"});let l=n.createEl("div",{cls:"lifewiki-ai-input-area"});this.inputAreaEl=l;let c=l.createEl("div",{cls:"lifewiki-chat-input-wrapper"}),u=c.createEl("div",{cls:"lifewiki-input-row"});this.inputTextarea=u.createEl("textarea",{cls:"lifewiki-input-textarea",attr:{placeholder:"\u56DE\u7B54\u6F84\u6E05\u95EE\u9898\u6216\u8865\u5145\u80CC\u666F...",rows:"1"}}),this.inputTextarea.addEventListener("input",()=>{this.autoResizeTextarea(),this.updateSendBtnState()}),this.inputTextarea.addEventListener("keydown",p=>{p.key==="Enter"&&!p.shiftKey&&(p.preventDefault(),this.sendMessage())});let d=c.createEl("div",{cls:"lifewiki-mode-row"});this.agentSelectEl=d.createEl("select",{cls:"lifewiki-agent-select",attr:{style:"display:none"}}),this.agentSelectEl.addEventListener("change",()=>{this.currentAgentKey=this.agentSelectEl?.value||""}),this.sendBtnEl=d.createEl("button",{cls:"lifewiki-send-btn",attr:{title:"\u53D1\u9001"}}),(0,we.setIcon)(this.sendBtnEl,"arrow-up"),this.sendBtnEl.addEventListener("click",()=>{this.inputTextarea?.value.trim()&&!this.isLoading&&this.sendMessage()}),this.detectLocalAgents(),this.showEmptyState(),this.renderAnalysisTabs(),this.updateSendBtnState()}autoResizeTextarea(){if(!this.inputTextarea)return;let e=66,n=120,i=this.inputTextarea.scrollHeight;this.inputTextarea.style.height=Math.min(Math.max(i,e),n)+"px"}updateSendBtnState(){if(!this.sendBtnEl||!this.inputTextarea)return;let e=this.inputTextarea.value.trim().length>0&&!this.isLoading;this.sendBtnEl.classList.toggle("active",e),this.isLoading?(this.sendBtnEl.setAttr("disabled","true"),this.sendBtnEl.setAttr("title","\u5904\u7406\u4E2D..."),(0,we.setIcon)(this.sendBtnEl,"loader-2")):(this.sendBtnEl.removeAttribute("disabled"),this.sendBtnEl.setAttr("title","\u53D1\u9001"),(0,we.setIcon)(this.sendBtnEl,"arrow-up"))}addStyles(){let e=document.createElement("style");e.textContent=`
/* AI Analysis Panel - "The Intellectual Atelier" Design System */

:root {
	--surface: #f9f9f9;
	--surface-container-low: #f3f3f3;
	--surface-container-lowest: #ffffff;
	--surface-container-high: #e8e8e8;
	--surface-variant: #e2e2e2;
	--on-surface: #1a1c1c;
	--on-surface-variant: #4a4453;
	--outline-variant: rgba(204, 195, 214, 0.4);
	--outline: #7b7485;
	--primary: #5c28b8;
	--primary-container: #7546d2;
	--on-primary: #ffffff;
	--on-primary-container: #eadcff;
	--secondary: #67558e;
	--font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.lifewiki-ai-panel {
	height: 100%;
	display: flex;
	flex-direction: column;
	background: var(--surface-container-low);
	overflow: hidden;
	position: relative;
}

.lifewiki-ai-header {
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
	padding: 18px 20px 0;
	flex-shrink: 0;
	background: var(--surface-container-low);
	backdrop-filter: blur(16px);
	border-bottom: 1px solid var(--outline-variant);
}

.lifewiki-ai-header-title {
	display: flex;
	align-items: center;
	gap: 8px;
}

.lifewiki-ai-header-title span {
	font-family: var(--font-body);
	font-size: 14px;
	font-weight: 600;
	color: var(--primary);
	letter-spacing: 0.02em;
}

.lifewiki-ai-header-actions {
	display: flex;
	align-items: center;
	gap: 4px;
	padding-bottom: 14px;
}

.lifewiki-ai-clear-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	border-radius: 8px;
	border: none;
	background: transparent;
	color: var(--on-surface-variant);
	cursor: pointer;
	transition: background 0.15s, color 0.15s;
}

.lifewiki-ai-clear-btn:hover {
	background: rgba(239, 68, 68, 0.1);
	color: #ef4444;
}

.lifewiki-mode-toggle-btn {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	min-height: 30px;
	border-radius: 8px;
	border: 1px solid var(--outline-variant);
	padding: 5px 9px;
	font-family: var(--font-body);
	font-size: 12px;
	font-weight: 650;
	line-height: 1;
	cursor: pointer;
	transition: border-color 0.15s, background 0.15s, color 0.15s, transform 0.15s;
}

.lifewiki-mode-toggle-btn:hover {
	transform: translateY(-1px);
}

.lifewiki-mode-toggle-btn.analysis {
	background: var(--surface-container-lowest);
	color: var(--primary);
	border-color: rgba(92, 40, 184, 0.24);
}

.lifewiki-mode-toggle-btn.chat {
	background: rgba(26, 28, 28, 0.04);
	color: var(--on-surface);
	border-color: rgba(26, 28, 28, 0.16);
}

.lifewiki-mode-toggle-btn svg {
	width: 15px;
	height: 15px;
}

.lifewiki-ai-clear-btn svg {
	width: 20px !important;
	height: 20px !important;
	transform: scale(1.2);
	transform-origin: center;
}

.lifewiki-ai-scroll {
	flex: 1 1 0;
	overflow-y: auto;
	overflow-x: hidden;
	padding: 18px 16px 16px;
	padding-bottom: 24px;
	display: flex;
	flex-direction: column;
	background: var(--surface-container-low);
	min-height: 0;
}

.lifewiki-ai-scroll::-webkit-scrollbar {
	width: 6px;
}

.lifewiki-ai-scroll::-webkit-scrollbar-track {
	background: transparent;
}

.lifewiki-ai-scroll::-webkit-scrollbar-thumb {
	background: rgba(204, 195, 214, 0.4);
	border-radius: 3px;
}

.lifewiki-ai-scroll::-webkit-scrollbar-thumb:hover {
	background: rgba(204, 195, 214, 0.6);
}

.lifewiki-empty-state {
	display: none !important;
	height: 100% !important;
	text-align: center !important;
	padding: 0 !important;
	background: transparent !important;
	box-shadow: none !important;
	border: none !important;
	border-radius: 0 !important;
	outline: none !important;
}

.lifewiki-empty-state.visible {
	display: block !important;
}

.lifewiki-empty-state-title {
	font-family: var(--font-body) !important;
	font-size: 13px !important;
	color: var(--on-surface-variant) !important;
	opacity: 0.5 !important;
	background: transparent !important;
	padding: 0 !important;
	border: none !important;
	box-shadow: none !important;
}

.lifewiki-chat-messages {
	display: none;
	flex-direction: column;
	gap: 16px;
	padding-bottom: 16px;
	margin-bottom: 150px;
	background: transparent;
}

.lifewiki-chat-messages.visible {
	display: flex;
	background: transparent;
}

.lifewiki-entity-index {
	display: none;
	flex-direction: column;
	gap: 10px;
	margin-bottom: 16px;
}

.lifewiki-entity-index.visible {
	display: flex;
}

.lifewiki-entity-index-section {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.lifewiki-entity-index-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-family: var(--font-body);
	font-size: 11px;
	font-weight: 600;
	color: var(--on-surface-variant);
	text-transform: uppercase;
	letter-spacing: 0.04em;
}

.lifewiki-entity-index-count {
	font-size: 11px;
	font-weight: 500;
	color: var(--outline);
}

.lifewiki-entity-index-item {
	background: var(--surface-container-lowest);
	border: 1px solid rgba(204, 195, 214, 0.18);
	border-radius: 8px;
	padding: 10px 12px;
	box-shadow: 0 4px 16px -8px rgba(26, 28, 28, 0.08);
}

.lifewiki-entity-index-item-title {
	font-family: var(--font-body);
	font-size: 13px;
	font-weight: 600;
	line-height: 1.4;
	color: var(--on-surface);
	margin-bottom: 4px;
}

.lifewiki-entity-index-item-body {
	font-family: var(--font-body);
	font-size: 12px;
	line-height: 1.5;
	color: var(--on-surface-variant);
}

.lifewiki-entity-index-meta {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
	margin-top: 8px;
}

.lifewiki-entity-index-chip {
	font-family: var(--font-body);
	font-size: 10px;
	line-height: 1;
	color: var(--primary);
	background: rgba(92, 40, 184, 0.08);
	border-radius: 999px;
	padding: 4px 7px;
}

.lifewiki-entity-index-chip.maturity {
	color: var(--secondary);
	background: rgba(103, 85, 142, 0.08);
}

.lifewiki-entity-index-empty {
	border: 1px dashed rgba(204, 195, 214, 0.24);
	border-radius: 8px;
	padding: 9px 11px;
	font-family: var(--font-body);
	font-size: 12px;
	line-height: 1.45;
	color: var(--outline);
	background: rgba(255, 251, 255, 0.42);
}

.lifewiki-chat-msg {
	padding: 12px 16px;
	border-radius: 12px;
	font-family: var(--font-body);
	font-size: 14px;
	line-height: 1.6;
	word-wrap: break-word;
	overflow-wrap: break-word;
	animation: messageFadeIn 0.2s ease-out;
	user-select: text;
	position: relative;
	max-width: 80%;
}

@keyframes messageFadeIn {
	from { opacity: 0; transform: translateY(4px); }
	to { opacity: 1; transform: translateY(0); }
}

.lifewiki-chat-msg.assistant {
	align-self: flex-start;
	background: var(--surface-container-lowest);
	color: var(--on-surface);
	border-radius: 12px;
	border: 1px solid rgba(204, 195, 214, 0.15);
	box-shadow: 0 4px 20px -4px rgba(26, 28, 28, 0.04);
}

.lifewiki-chat-msg.user {
	align-self: flex-end;
	background: var(--surface-container-high);
	color: var(--on-surface);
	border-radius: 12px;
	border: 1px solid rgba(204, 195, 214, 0.15);
}

.lifewiki-chat-msg strong {
	color: var(--primary);
	font-weight: 600;
}

.lifewiki-chat-msg-copy-hint {
	position: absolute;
	top: 8px;
	right: 10px;
	font-size: 10px;
	color: var(--on-surface-variant);
	opacity: 0;
	transition: opacity 0.15s;
}

.lifewiki-chat-msg.assistant:hover .lifewiki-chat-msg-copy-hint {
	opacity: 1;
}

.lifewiki-chat-task-drafts {
	align-self: stretch;
	max-width: 100%;
	display: flex;
	flex-direction: column;
	gap: 10px;
	padding: 2px 0 4px;
}

.lifewiki-chat-task-drafts-title {
	font-family: var(--font-body);
	font-size: 12px;
	font-weight: 750;
	color: var(--primary);
}

.lifewiki-chat-task-draft-card {
	border: 1px solid rgba(204, 195, 214, 0.28);
	border-radius: 12px;
	background: var(--surface-container-lowest);
	padding: 12px;
	box-shadow: 0 10px 24px -22px rgba(26, 28, 28, 0.36);
}

.lifewiki-chat-task-draft-card h4 {
	margin: 0 0 6px;
	font-size: 13px;
	line-height: 1.35;
	color: var(--on-surface);
}

.lifewiki-chat-task-draft-card p {
	margin: 0;
	font-size: 12px;
	line-height: 1.55;
	color: var(--on-surface-variant);
}

.lifewiki-chat-task-draft-actions {
	margin-top: 10px;
	display: flex;
	gap: 8px;
}

.lifewiki-chat-task-draft-actions button {
	border: 1px solid rgba(204, 195, 214, 0.35);
	border-radius: 999px;
	background: var(--surface-container-low);
	color: var(--on-surface);
	padding: 6px 10px;
	font-size: 12px;
	font-weight: 650;
	cursor: pointer;
}

.lifewiki-chat-task-draft-actions button.primary {
	border-color: transparent;
	background: var(--primary);
	color: var(--on-primary);
}

/* Chat streaming pre \u2014 raw text during SSE streaming before Markdown render */
.lifewiki-chat-streaming {
	font-family: var(--font-body);
	font-size: 13px;
	line-height: 1.7;
	color: var(--on-surface);
	white-space: pre-wrap;
	word-break: break-word;
	margin: 0;
	padding: 0;
	border: none;
	background: transparent;
}

.lifewiki-thinking {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 12px 16px;
	background: var(--surface-container-lowest);
	border-radius: 12px;
	border-top-left-radius: 4px;
	border: 1px solid rgba(204, 195, 214, 0.15);
	box-shadow: 0 4px 20px -4px rgba(26, 28, 28, 0.04);
	animation: messageFadeIn 0.2s ease-out;
}

.lifewiki-thinking-dots {
	display: flex;
	gap: 6px;
}

.lifewiki-thinking-dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: var(--on-surface-variant);
	animation: thinkingPulse 1.2s ease-in-out infinite;
}

.lifewiki-thinking-dot:nth-child(2) { animation-delay: 0.15s; }
.lifewiki-thinking-dot:nth-child(3) { animation-delay: 0.3s; }

@keyframes thinkingPulse {
	0%, 100% { transform: scale(0.8); opacity: 0.5; }
	50% { transform: scale(1); opacity: 1; }
}

.lifewiki-ai-input-area {
	position: absolute;
	bottom: 32px;
	left: 16px;
	right: 16px;
	z-index: 20;
	padding: 0;
}

.lifewiki-chat-input-wrapper {
	background: var(--surface-container-lowest);
	border-radius: 16px;
	padding: 12px;
	box-shadow: 0 10px 40px -10px rgba(26, 28, 28, 0.06);
	border: 1px solid rgba(204, 195, 214, 0.15);
	display: flex;
	flex-direction: column;
	min-height: 100px;
}

.lifewiki-chat-input-wrapper:focus-within {
	border-color: rgba(204, 195, 214, 0.15);
	box-shadow: 0 10px 40px -10px rgba(26, 28, 28, 0.06);
}

.lifewiki-input-row {
	display: flex;
	align-items: stretch;
	flex: 1;
}

.lifewiki-input-textarea {
	flex: 1;
	min-height: 60px;
	max-height: 180px;
	resize: none;
	border: none !important;
	padding: 0;
	font-family: var(--font-body);
	font-size: 14px;
	line-height: 1.6;
	background: transparent;
	color: var(--on-surface);
	outline: none !important;
	box-shadow: none !important;
	overflow-y: auto;
}

.lifewiki-input-textarea:focus {
	border: none !important;
	outline: none !important;
	box-shadow: none !important;
}

.lifewiki-input-textarea::placeholder {
	color: var(--on-surface-variant);
	opacity: 0.6;
}

.lifewiki-send-btn {
	display: flex !important;
	align-items: center !important;
	justify-content: center !important;
	width: 36px !important;
	height: 36px !important;
	border: 1px solid var(--surface-container-high) !important;
	border-radius: 50% !important;
	background: var(--surface-container-high) !important;
	color: var(--on-surface-variant) !important;
	cursor: pointer;
	transition: background-color 0.2s, transform 0.2s;
	flex-shrink: 0;
}

.lifewiki-send-btn svg {
	width: 24px !important;
	height: 24px !important;
}

.lifewiki-send-btn:hover {
	transform: translateY(-1px);
}

.lifewiki-send-btn.active {
	background: #5c28b8 !important;
	color: #ffffff !important;
}

.lifewiki-chat-input-wrapper:focus-within .lifewiki-send-btn {
	background: #5c28b8 !important;
	color: #ffffff !important;
}

.lifewiki-model-select {
	background: transparent;
	border: none;
	color: var(--on-surface-variant);
	font-family: var(--font-body);
	font-size: 10px;
	font-weight: 500;
	text-transform: uppercase;
	letter-spacing: 0.05em;
	cursor: pointer;
	outline: none;
	padding: 0;
}

.lifewiki-model-select:hover {
	color: var(--primary);
}

.lifewiki-entity-confirm {
	background: var(--surface-container-lowest);
	border: 1px solid rgba(204, 195, 214, 0.15);
	border-radius: 12px;
	padding: 16px;
	margin: 8px 0;
	animation: messageFadeIn 0.2s ease-out;
	box-shadow: 0 4px 20px -4px rgba(26, 28, 28, 0.04);
}

.lifewiki-entity-confirm-title {
	font-family: var(--font-body);
	font-size: 14px;
	font-weight: 500;
	color: var(--on-surface);
	margin-bottom: 6px;
}

.lifewiki-entity-confirm-reason {
	font-family: var(--font-body);
	font-size: 12px;
	color: var(--on-surface-variant);
	margin-bottom: 12px;
	line-height: 1.5;
}

.lifewiki-entity-confirm-buttons {
	display: flex;
	gap: 8px;
}

.lifewiki-entity-confirm-btn {
	flex: 1;
	padding: 8px 14px;
	border-radius: 8px;
	border: none;
	font-family: var(--font-body);
	font-size: 12px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.15s;
}

.lifewiki-entity-confirm-btn.archive {
	background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
	color: var(--on-primary);
}

.lifewiki-entity-confirm-btn.archive:hover {
	transform: translateY(-1px);
	box-shadow: 0 4px 12px -2px rgba(92, 40, 184, 0.25);
}

.lifewiki-entity-confirm-btn.skip {
	background: transparent;
	border: 1px solid rgba(204, 195, 214, 0.3);
	color: var(--on-surface-variant);
}

.lifewiki-entity-confirm-btn.skip:hover {
	border-color: var(--primary);
	color: var(--primary);
}

.lifewiki-entity-confirm-btn.interact {
	background: var(--surface-container-low);
	color: var(--on-surface);
	border: 1px solid var(--outline-variant);
}

.lifewiki-entity-confirm-btn.interact:hover {
	border-color: var(--primary);
	color: var(--primary);
}

/* Mode row - left aligned, with send button on right */
.lifewiki-mode-row {
	display: flex;
	justify-content: flex-end;
	align-items: center;
	gap: 8px;
	margin-top: 8px;
}

/* Mode switch select */
.lifewiki-mode-select {
	display: none;
	padding: 4px 8px;
	border-radius: 6px;
	border: 1px solid var(--surface-container-high);
	background: var(--surface-container-high);
	color: var(--on-surface-variant);
	font-family: var(--font-body);
	font-size: 12px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.15s;
	outline: none;
}

.lifewiki-mode-select:focus {
	border-color: var(--surface-container-high);
}

.lifewiki-mode-select:hover {
	border-color: var(--primary);
	color: var(--primary);
}

.lifewiki-mode-select option {
	background: var(--surface-container-high);
	color: var(--on-surface);
}

/* Agent selector (left side of mode row) */
.lifewiki-agent-select {
	padding: 4px 8px;
	border-radius: 6px;
	border: 1px solid var(--surface-container-high);
	background: var(--surface-container-high);
	color: var(--on-surface-variant);
	font-family: var(--font-body);
	font-size: 12px;
	font-weight: 500;
	cursor: pointer;
	outline: none;
	max-width: 120px;
	margin-right: auto;
}

.lifewiki-agent-select:hover,
.lifewiki-agent-select:focus {
	border-color: var(--primary);
	color: var(--primary);
}

.lifewiki-agent-select option {
	background: var(--surface-container-high);
	color: var(--on-surface);
}

.lifewiki-analysis-tabs {
	display: none;
	gap: 0;
	flex-shrink: 0;
	align-items: flex-end;
	border-bottom: none;
	padding: 0;
	margin-bottom: -1px;
}

.lifewiki-analysis-tabs.visible {
	display: flex;
}

.lifewiki-analysis-tab {
	border: 1px solid var(--outline-variant);
	border-bottom-color: var(--outline-variant);
	background: var(--surface-container-high);
	color: var(--on-surface-variant);
	border-radius: 9px 9px 0 0;
	padding: 8px 14px 9px;
	margin-right: 3px;
	font-size: 12px;
	font-weight: 600;
	line-height: 1.2;
	cursor: pointer;
	position: relative;
	min-width: 72px;
	box-shadow: inset 0 -1px 0 rgba(26, 28, 28, 0.04);
	transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.lifewiki-analysis-tab:hover {
	background: var(--surface-container-lowest);
	color: var(--on-surface);
}

.lifewiki-analysis-tab.active {
	border-color: var(--outline-variant);
	border-bottom-color: var(--surface-container-low);
	color: var(--primary);
	background: var(--surface-container-low);
	box-shadow: none;
	z-index: 1;
}

.lifewiki-analysis-tab.has-attention::after {
	content: '';
	position: absolute;
	top: 3px;
	right: 4px;
	width: 7px;
	height: 7px;
	border-radius: 999px;
	background: #ef4444;
	box-shadow: 0 0 0 2px var(--surface-container-lowest);
}

.lifewiki-block-insights {
	display: none;
	padding: 0 16px 16px;
	flex-direction: column;
	gap: 0;
	margin-bottom: 150px;
	overflow-y: auto;
}

.lifewiki-block-insights.visible {
	display: flex;
}

/* Insight report body - read-only markdown display */
.lifewiki-insight-body {
	font-family: var(--font-body);
	font-size: 13px;
	line-height: 1.7;
	color: var(--on-surface);
	padding: 0;
	user-select: text;
}

.lifewiki-insight-body h2 {
	font-size: 15px;
	font-weight: 650;
	color: var(--primary);
	margin: 20px 0 8px 0;
	padding-bottom: 4px;
	border-bottom: 1px solid var(--outline-variant);
}

.lifewiki-insight-body h3 {
	font-size: 13px;
	font-weight: 600;
	color: var(--on-surface);
	margin: 14px 0 6px 0;
}

.lifewiki-insight-body p {
	margin: 6px 0;
}

.lifewiki-insight-body ul, .lifewiki-insight-body ol {
	padding-left: 18px;
	margin: 6px 0;
}

.lifewiki-insight-body li {
	margin: 3px 0;
}

.lifewiki-insight-body strong {
	color: var(--primary);
	font-weight: 600;
}

.lifewiki-insight-body em {
	color: var(--on-surface-variant);
}

.lifewiki-insight-body blockquote {
	border-left: 3px solid var(--primary);
	padding-left: 12px;
	margin: 8px 0;
	color: var(--on-surface-variant);
	font-style: italic;
}

.lifewiki-insight-body code {
	font-size: 12px;
	background: var(--surface-container-high);
	padding: 1px 5px;
	border-radius: 3px;
}

/* Streaming text area during generation */
.lifewiki-insight-streaming {
	font-family: var(--font-body);
	font-size: 13px;
	line-height: 1.7;
	color: var(--on-surface);
	white-space: pre-wrap;
	word-break: break-word;
	margin: 0;
	padding: 0;
	border: none;
	background: transparent;
}

/* Insight empty state */
.lifewiki-insight-empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100%;
	padding: 24px;
	text-align: center;
	color: var(--on-surface-variant);
	font-size: 13px;
	opacity: 0.6;
}

/* Insight generating state */
.lifewiki-insight-generating {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 16px 0;
	color: var(--on-surface-variant);
	font-size: 13px;
}

/* Insight error state */
.lifewiki-insight-error {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100%;
	padding: 24px;
	text-align: center;
	color: #ef4444;
	font-size: 13px;
	gap: 8px;
}

.lifewiki-insight-error button {
	padding: 6px 16px;
	border: 1px solid var(--outline-variant);
	border-radius: 6px;
	background: var(--surface-container-high);
	color: var(--on-surface);
	cursor: pointer;
	font-family: var(--font-body);
	font-size: 12px;
}

.lifewiki-insight-error button:hover {
	background: var(--surface-container-low);
}

.lifewiki-insight-section {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.lifewiki-insight-section-title {
	font-size: 12px;
	font-weight: 600;
	color: var(--on-surface-variant);
}

.lifewiki-confirm-card {
	border: 1px solid var(--outline-variant);
	background: var(--surface-container-lowest);
	border-radius: 8px;
	padding: 10px;
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.lifewiki-confirm-card-title {
	font-size: 13px;
	font-weight: 600;
	color: var(--on-surface);
}

.lifewiki-confirm-card-body {
	font-size: 12px;
	line-height: 1.5;
	color: var(--on-surface-variant);
	white-space: pre-wrap;
	word-break: break-word;
}

.lifewiki-confirm-card-supplement {
	border-left: 2px solid rgba(92, 40, 184, 0.2);
	padding-left: 8px;
	font-size: 12px;
	line-height: 1.5;
	color: var(--on-surface);
	white-space: pre-wrap;
}

.lifewiki-confirm-card-supplement-label {
	font-size: 11px;
	font-weight: 600;
	color: var(--primary);
	margin-bottom: 2px;
}

.lifewiki-confirm-card-editor {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.lifewiki-confirm-card-textarea {
	min-height: 64px;
	resize: vertical;
	border: 1px solid var(--outline-variant);
	border-radius: 7px;
	background: var(--surface-container-lowest);
	color: var(--on-surface);
	font-family: var(--font-body);
	font-size: 12px;
	line-height: 1.5;
	padding: 8px;
	outline: none;
}

.lifewiki-confirm-card-textarea:focus {
	border-color: var(--primary);
	box-shadow: 0 0 0 2px rgba(92, 40, 184, 0.08);
}

.lifewiki-confirm-card-meta {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
}

.lifewiki-confirm-chip {
	font-size: 11px;
	line-height: 1;
	padding: 4px 7px;
	border-radius: 999px;
	color: var(--on-surface-variant);
	background: var(--surface-container-low);
	border: 1px solid var(--outline-variant);
}

.lifewiki-confirm-actions {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
}

.lifewiki-confirm-action {
	border: 1px solid var(--outline-variant);
	background: var(--surface-container-lowest);
	color: var(--on-surface);
	border-radius: 6px;
	padding: 5px 8px;
	font-size: 12px;
	cursor: pointer;
}

.lifewiki-confirm-action.primary {
	background: var(--primary);
	border-color: var(--primary);
	color: var(--on-primary);
}

.lifewiki-confirm-action:hover {
	border-color: var(--primary);
}

/* Hidden class for header elements */
.lifewiki-ai-header-actions .hidden {
	display: none;
}

/* Chat mode active state */
.chat-mode .lifewiki-ai-panel {
}

@media (max-width: 400px) {
	.lifewiki-chat-msg {
		max-width: 92%;
	}
}
		`,this.containerEl.appendChild(e)}showEmptyState(){this.emptyStateEl?.addClass("visible"),this.chatMessagesEl?.removeClass("visible"),this.blockInsightsEl?.removeClass("visible"),this.entityIndexEl?.removeClass("visible"),this.updateInputVisibility()}showChatState(){this.emptyStateEl?.removeClass("visible"),this.applyAnalysisTabVisibility(),this.updateInputVisibility()}updateInputVisibility(){this.inputAreaEl&&(this.mode==="analysis"&&this.analysisTab==="insight"?this.inputAreaEl.style.display="none":this.inputAreaEl.style.removeProperty("display"))}renderModeToggleButton(){if(!this.modeToggleBtnEl)return;this.modeToggleBtnEl.empty(),this.modeToggleBtnEl.removeClass("analysis"),this.modeToggleBtnEl.removeClass("chat");let e=this.mode==="chat";this.modeToggleBtnEl.addClass(e?"chat":"analysis"),this.modeToggleBtnEl.setAttr("title",e?"\u5207\u6362\u4E3A\u5206\u6790\u6A21\u5F0F":"\u5207\u6362\u4E3A\u804A\u5929\u6A21\u5F0F"),(0,we.setIcon)(this.modeToggleBtnEl,e?"sparkles":"messages-square"),this.modeToggleBtnEl.createEl("span",{text:e?"\u5207\u6362\u4E3A\u5206\u6790\u6A21\u5F0F":"\u5207\u6362\u4E3A\u804A\u5929\u6A21\u5F0F"})}setEmptyStateText(e){let n=this.emptyStateEl?.querySelector(".lifewiki-empty-state-title");n&&(n.textContent=e)}renderAnalysisTabs(){if(!this.analysisTabsEl)return;if(this.analysisTabsEl.empty(),this.mode!=="analysis"){this.analysisTabsEl.removeClass("visible"),this.headerTitleEl&&(this.headerTitleEl.style.display="");return}this.analysisTabsEl.addClass("visible"),this.headerTitleEl&&(this.headerTitleEl.style.display="none");let e=[{id:"block",label:"\u5F53\u524D\u65E5\u8BB0"},{id:"insight",label:"\u4ECA\u65E5\u6D1E\u5BDF"}];for(let n of e)this.analysisTabsEl.createEl("button",{cls:`lifewiki-analysis-tab ${this.analysisTab===n.id?"active":""}`,text:n.label,attr:{type:"button"}}).addEventListener("click",()=>{this.analysisTab=n.id,this.renderAnalysisTabs(),this.applyAnalysisTabVisibility(),n.id==="insight"&&this.loadOrGenerateInsight()})}applyAnalysisTabVisibility(){if(this.mode!=="analysis"){this.analysisTabsEl?.removeClass("visible"),this.headerTitleEl&&(this.headerTitleEl.style.display=""),this.entityIndexEl?.removeClass("visible"),this.blockInsightsEl?.removeClass("visible"),this.chatMessagesEl?.addClass("visible"),this.updateInputVisibility();return}if(this.renderAnalysisTabs(),this.analysisTab==="insight")this.emptyStateEl?.removeClass("visible"),this.chatMessagesEl?.removeClass("visible"),this.entityIndexEl?.removeClass("visible"),this.blockInsightsEl?.addClass("visible");else{if(this.entityIndexEl?.removeClass("visible"),this.blockInsightsEl?.removeClass("visible"),!this.activeBlockId){this.emptyStateEl?.addClass("visible"),this.chatMessagesEl?.removeClass("visible"),this.updateInputVisibility();return}this.emptyStateEl?.removeClass("visible"),this.chatMessagesEl?.addClass("visible")}this.updateInputVisibility()}clearConversation(){this.chatMessagesEl?.empty(),this.activeBlockId=null,this.showEmptyState()}switchToChatMode(){this.mode="chat",this.agentSelectEl&&(this.agentSelectEl.style.display=""),this.activeBlockId=null,this.activeParentId=null,this.clarificationPhase="summary",this.clarificationQueue=[],this.knownEntities=[],this.allSessionEntities=[],this.irrelevantKnownEntityNames.clear(),this.skippedEntityNames.clear(),this.currentEntityIndex=0,this.entityIndexEl?.removeClass("visible"),this.analysisTabsEl?.removeClass("visible"),this.blockInsightsEl?.removeClass("visible"),this.renderModeToggleButton(),this.setEmptyStateText("\u53EF\u4EE5\u68C0\u7D22\u3001\u603B\u7ED3\u6216\u66F4\u65B0\u4F60\u7684 vault"),this.headerTitleEl&&(this.headerTitleEl.textContent="AI \u804A\u5929",this.headerTitleEl.style.display=""),this.chatModeClearBtnEl&&this.chatModeClearBtnEl.removeClass("hidden"),this.inputTextarea&&(this.inputTextarea.placeholder="\u95EE\u95EE\u4F60\u7684 vault\uFF0C\u4F8B\u5982\uFF1A\u603B\u7ED3\u672C\u5468\u65E5\u8BB0\u3001\u67E5\u627E\u67D0\u4E2A\u9879\u76EE\u3001\u66F4\u65B0\u67D0\u4E2A\u4EBA\u7684\u80CC\u666F..."),this.containerEl.querySelector(".lifewiki-ai-panel")?.addClass("chat-mode"),this.updateInputVisibility();let n=this.plugin.getSessionManager().getChatSession();if(n&&n.messages.length>0){this.showChatState(),this.chatMessagesEl?.empty();for(let i of n.messages)i.role!=="system"&&this.addChatMessage(i.role,i.content)}else this.showEmptyState()}switchToAnalysisMode(){this.mode="analysis",this.agentSelectEl&&(this.agentSelectEl.style.display="none"),this.analysisTab=this.analysisTab||"block",this.renderModeToggleButton(),this.setEmptyStateText("\u9009\u62E9\u6216\u8F93\u5165\u4E00\u6761\u65E5\u8BB0"),this.headerTitleEl&&(this.headerTitleEl.textContent="AI\u6D1E\u5BDF",this.headerTitleEl.style.display="none"),this.chatModeClearBtnEl&&this.chatModeClearBtnEl.addClass("hidden"),this.inputTextarea&&(this.inputTextarea.placeholder="\u56DE\u7B54\u6F84\u6E05\u95EE\u9898\u6216\u8865\u5145\u80CC\u666F..."),this.containerEl.querySelector(".lifewiki-ai-panel")?.removeClass("chat-mode"),this.updateInputVisibility(),this.applyAnalysisTabVisibility()}clearChatSession(){this.plugin.getSessionManager().clearChatSession(),this.chatMessagesEl?.empty(),this.showEmptyState()}setMode(e){e==="chat"?this.switchToChatMode():this.switchToAnalysisMode()}getMode(){return this.mode}async loadOrGenerateInsight(){if(this.mode!=="analysis"||this.analysisTab!=="insight"||this.isLoading)return;let e=this.getActiveInsightDate(),n=new Date,i=`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`,a=e===i,r=await this.plugin.getCachedInsight(e);if(!a){r?this.renderInsightContent(r.content):this.showInsightEmptyState("\u8BE5\u65E5\u671F\u6CA1\u6709\u6D1E\u5BDF\u62A5\u544A");return}if(!await this.plugin.hasMinimumBlocks(e)){this.showInsightEmptyState("\u4ECA\u65E5\u65E5\u8BB0\u8F83\u5C11\uFF0C\u591A\u5199\u51E0\u6761\u518D\u6765\u770B\u6D1E\u5BDF");return}let o=await this.plugin.readDailyDiary(e),l=await this.plugin.readYesterdayDiary(e),c=await Il(o||"",l);if(r&&r.contentHash===c){this.renderInsightContent(r.content);return}this.isLoading=!0,this.showInsightGenerating();let u={onDelta:d=>this.appendInsightChunk(d),onDone:d=>{this.isLoading=!1,this.insightBuffer&&(this.renderInsightContent(this.insightBuffer),this.insightBuffer="")},onError:d=>{this.isLoading=!1,this.showInsightError(d.message)}};try{await this.plugin.generateDailyInsight(e,u)}catch(d){this.isLoading=!1,this.showInsightError(d.message)}}insightBuffer="";getActiveInsightDate(){let e=this.plugin.getBlockEditorDate();if(e)return e;let n=new Date,i=n.getFullYear(),a=String(n.getMonth()+1).padStart(2,"0"),r=String(n.getDate()).padStart(2,"0");return`${i}-${a}-${r}`}showInsightEmptyState(e){if(!this.blockInsightsEl)return;this.blockInsightsEl.empty(),this.blockInsightsEl.addClass("visible"),this.blockInsightsEl.createEl("div",{cls:"lifewiki-insight-empty"}).createEl("p",{text:e})}showInsightGenerating(){if(!this.blockInsightsEl)return;this.blockInsightsEl.empty(),this.blockInsightsEl.addClass("visible"),this.insightBuffer="";let n=this.blockInsightsEl.createEl("div",{cls:"lifewiki-insight-body"}).createEl("div",{cls:"lifewiki-insight-generating"});n.createEl("span",{text:"\u6B63\u5728\u751F\u6210\u4ECA\u65E5\u6D1E\u5BDF"});let i=n.createEl("span",{cls:"lifewiki-thinking-dots"});i.createEl("span",{cls:"lifewiki-thinking-dot"}),i.createEl("span",{cls:"lifewiki-thinking-dot"}),i.createEl("span",{cls:"lifewiki-thinking-dot"})}appendInsightChunk(e){if(!this.blockInsightsEl)return;this.insightBuffer+=e,this.blockInsightsEl.empty(),this.blockInsightsEl.addClass("visible"),this.blockInsightsEl.createEl("div",{cls:"lifewiki-insight-body"}).createEl("pre",{text:this.insightBuffer,cls:"lifewiki-insight-streaming"}),this.scrollInsightToBottom()}renderInsightContent(e){if(!this.blockInsightsEl)return;this.blockInsightsEl.empty(),this.blockInsightsEl.addClass("visible");let n=this.blockInsightsEl.createEl("div",{cls:"lifewiki-insight-body"});we.MarkdownRenderer.render(this.app,e,n,"",this)}showInsightError(e){if(!this.blockInsightsEl)return;this.blockInsightsEl.empty(),this.blockInsightsEl.addClass("visible");let n=this.blockInsightsEl.createEl("div",{cls:"lifewiki-insight-error"});n.createEl("p",{text:`\u751F\u6210\u6D1E\u5BDF\u5931\u8D25: ${e}`}),n.createEl("button",{text:"\u91CD\u8BD5",attr:{type:"button"}}).addEventListener("click",()=>{this.loadOrGenerateInsight()})}scrollInsightToBottom(){this.blockInsightsEl&&(this.blockInsightsEl.scrollTop=this.blockInsightsEl.scrollHeight)}showThinkingIndicator(){if(!this.chatMessagesEl||!this.isLoading)return;this.thinkingEl=this.chatMessagesEl.createEl("div",{cls:"lifewiki-thinking"});let e=this.thinkingEl.createEl("div",{cls:"lifewiki-thinking-dots"});e.createEl("span",{cls:"lifewiki-thinking-dot"}),e.createEl("span",{cls:"lifewiki-thinking-dot"}),e.createEl("span",{cls:"lifewiki-thinking-dot"}),this.scrollToBottom()}hideThinkingIndicator(){this.thinkingEl&&(this.thinkingEl.remove(),this.thinkingEl=null)}scrollToBottom(){let e=this.containerEl.querySelector(".lifewiki-ai-scroll");e&&(e.scrollTop=e.scrollHeight)}setActiveBlock(e,n,i){this.switchToAnalysisMode(),this.activeBlockId=e,this.activeParentId=i||null;let r=this.plugin.getSessionManager().getOrCreateSession(e,i||null);this.showChatState(),this.renderSession(r)}startNewSession(e,n,i,a=null){this.switchToAnalysisMode(),this.activeBlockId=e,this.activeParentId=a,this.showChatState(),this.chatMessagesEl?.empty();let r=this.plugin.getSessionManager(),s=r.getOrCreateSession(e,a);r.setContent(e,n,a),this.renderBlockInsightCards(s)}showAgentSession(e,n,i,a=null){console.log("[TraceMind] showAgentSession called: blockId=",e,"hasAnalysisResult=",!!i.analysisResult),this.switchToAnalysisMode(),this.activeBlockId=e,this.activeParentId=a;let s=this.plugin.getSessionManager().setSession(e,{...i,content:i.content||n,messages:[]},a);this.renderAnalysisStart(s)}async renderAnalysisStart(e){if(!this.chatMessagesEl)return;this.chatMessagesEl.empty();let n=e.analysisResult;if(!n){this.showEmptyState();return}let i=this.flattenEntityPreviews(n),a=i.filter(c=>!c.isArchived),r=i.filter(c=>c.isArchived);this.clarificationQueue=[...a].sort((c,u)=>(u.priorityScore??0)-(c.priorityScore??0)),this.knownEntities=[...r],this.allSessionEntities=[...a,...r],this.irrelevantKnownEntityNames.clear(),this.skippedEntityNames.clear(),this.currentEntityIndex=0,this.clarificationPhase="summary",this.showChatState();let s=a.map(c=>"**"+c.name+"**"),o=r.map(c=>"**"+c.name+"**"),l;if(i.length===0){await this.streamChatMessage("\u8FD9\u6761\u65E5\u8BB0\u6682\u65F6\u6CA1\u6709\u9700\u8981\u786E\u8BA4\u5F52\u6863\u7684\u5185\u5BB9\u3002"),this.clarificationPhase="complete",await this.offerPotentialTasksAfterAnalysis();return}if(s.length>0&&o.length>0?l="\u8FD9\u6761\u65E5\u8BB0\u4E2D\u63D0\u5230\u7684 "+s.join("\u3001")+" \u6211\u4E0D\u592A\u719F\u6089\uFF0C\u9700\u8981\u4F60\u5E2E\u6211\u8865\u5145\u4E00\u4E9B\u4FE1\u606F\u3002"+o.join("\u3001")+" \u6211\u4E86\u89E3\u3002":s.length>0?l="\u8FD9\u6761\u65E5\u8BB0\u4E2D\u63D0\u5230\u7684 "+s.join("\u3001")+" \u6211\u4E0D\u592A\u719F\u6089\uFF0C\u9700\u8981\u4F60\u5E2E\u6211\u8865\u5145\u4E00\u4E9B\u4FE1\u606F\u3002":l="\u8FD9\u6761\u65E5\u8BB0\u4E2D\u63D0\u5230\u7684 "+o.join("\u3001")+" \u6211\u90FD\u4E86\u89E3\u3002",await this.streamChatMessage(l),this.clarificationQueue.length>0){let c="**"+this.clarificationQueue[0].name+"**";await this.streamChatMessage("\u5148\u4ECE "+c+" \u5F00\u59CB\u5427\u3002"),setTimeout(async()=>{await this.beginCurrentEntityStep()},500)}else await this.finishClarification();this.scrollToBottom()}async askCurrentEntityQuestion(){if(this.currentEntityIndex>=this.clarificationQueue.length){await this.finishClarification();return}this.clarificationPhase="clarifying",this.saveClarificationState();let e=this.clarificationQueue[this.currentEntityIndex],n=e.clarificationQuestions?.[0]??"\u80FD\u544A\u8BC9\u6211\u5173\u4E8E\u300C"+e.name+"\u300D\u7684\u66F4\u591A\u4FE1\u606F\u5417\uFF1F";await this.streamChatMessage(n),this.scrollToBottom(),this.inputTextarea&&(this.inputTextarea.placeholder="\u56DE\u590D\u5173\u4E8E\u300C"+e.name+"\u300D\u7684\u95EE\u9898\uFF0C\u6216\u8BF4\u201C\u8DF3\u8FC7\u201D",this.inputTextarea.focus())}async beginCurrentEntityStep(){if(this.currentEntityIndex>=this.clarificationQueue.length){await this.finishClarification();return}let e=this.clarificationQueue[this.currentEntityIndex],n=e.similarCandidates?.[0];if(n&&!e.isArchived){this.clarificationPhase="confirm_similar",this.saveClarificationState(),await this.streamChatMessage("\u6211\u627E\u5230\u4E00\u4E2A\u76F8\u4F3C\u7684\u5DF2\u5F52\u6863\u6863\u6848\uFF1A**"+n.name+"**\u3002\u8FD9\u91CC\u7684 **"+e.name+"** \u662F\u6307\u5B83\u5417\uFF1F\u5982\u679C\u662F\u540C\u4E00\u4E2A\uFF0C\u6211\u4F1A\u628A\u300C"+e.name+"\u300D\u8BB0\u4E3A\u5B83\u7684\u522B\u540D\uFF1B\u5982\u679C\u4E0D\u662F\uFF0C\u6211\u4F1A\u6309\u65B0\u5B9E\u4F53\u5904\u7406\u3002"),this.scrollToBottom(),this.inputTextarea&&(this.inputTextarea.placeholder="\u56DE\u590D\u201C\u662F\u201D / \u201C\u4E0D\u662F\u201D\uFF0C\u6216\u76F4\u63A5\u8BF4\u660E...",this.inputTextarea.focus());return}await this.askCurrentEntityQuestion()}async skipCurrentEntity(){let e=this.clarificationQueue[this.currentEntityIndex].name;if(this.skippedEntityNames.add(e),await this.streamChatMessage("\u597D\u7684\uFF0C\u5148\u8DF3\u8FC7 **"+e+"**\u3002"),this.currentEntityIndex++,this.saveClarificationState(),this.currentEntityIndex>=this.clarificationQueue.length)await this.finishClarification();else{let n=this.clarificationQueue[this.currentEntityIndex].name;await this.streamChatMessage("\u518D\u6765\u770B\u770B **"+n+"**\u3002"),await this.beginCurrentEntityStep()}}async advanceAfterCurrentEntity(){if(this.currentEntityIndex++,this.saveClarificationState(),this.currentEntityIndex>=this.clarificationQueue.length){await this.finishClarification();return}let e=this.clarificationQueue[this.currentEntityIndex];await this.streamChatMessage("\u597D\u7684\uFF0C\u518D\u6765\u770B\u770B **"+e.name+"**\u3002"),await this.beginCurrentEntityStep()}async finishClarification(){if(this.knownEntities.length>0&&this.clarificationPhase!=="review_known"){this.clarificationPhase="review_known";let i=this.knownEntities.map(function(a){return"**"+a.name+"**"}).join("\u3001");await this.streamChatMessage("\u5BF9\u4E86\uFF0C"+i+" \u4F60\u8FD8\u6709\u65B0\u7684\u4FE1\u606F\u8981\u8865\u5145\u5417\uFF1F\u6CA1\u6709\u7684\u8BDD\u8BF4\u201C\u6CA1\u6709\u4E86\u201D\u5C31\u597D\u3002\u5982\u679C\u548C\u8FD9\u6761\u65E5\u8BB0\u4E0D\u76F8\u5173\uFF0C\u4E5F\u8BF7\u660E\u786E\u8BF4\u660E\u3002"),this.scrollToBottom(),this.inputTextarea&&(this.inputTextarea.placeholder="\u8F93\u5165\u8865\u5145\u4FE1\u606F\uFF0C\u6216\u8BF4\u201C\u6CA1\u6709\u4E86\u201D / \u201C\u4E0D\u76F8\u5173\u201D\u2026",this.inputTextarea.focus());return}this.clarificationPhase="complete";let e=this.allSessionEntities.filter(i=>!this.irrelevantKnownEntityNames.has(i.name)&&!this.skippedEntityNames.has(i.name)),n=this.currentSessionContent();if(n){let i=this.plugin.getEntityManager();for(let a of e)if(a.isArchived){let r=i.findEntity(a.name);r&&await i.addInteraction(r.id,{timestamp:new Date().toISOString(),type:"diary_mention",content:n})}}if(e.length>=1){let i=this.plugin.getEntityManager();for(let a of e){let r=i.findEntity(a.name);r&&await i.refreshWikilinks(r.id)}}if(e.length>0){let i=e.map(function(a){return"**"+a.name+"**"}).join("\u3001");await this.streamChatMessage("\u597D\u4E86\uFF0C\u8FD9\u6B21\u5148\u5230\u8FD9\u91CC\u3002"+i+" \u5DF2\u66F4\u65B0\u3002\u53EF\u4EE5\u5728\u5DE6\u4FA7\u6587\u4EF6\u5217\u8868\u4E2D\u67E5\u770B\u3002\u6709\u7A7A\u518D\u7EE7\u7EED\u8865\u5145\u3002")}else await this.streamChatMessage("\u597D\u4E86\uFF0C\u8FD9\u6B21\u5148\u5230\u8FD9\u91CC\u3002\u53EF\u4EE5\u5728\u5DE6\u4FA7\u6587\u4EF6\u5217\u8868\u4E2D\u67E5\u770B\u3002\u6709\u7A7A\u518D\u7EE7\u7EED\u8865\u5145\u3002");await this.offerPotentialTasksAfterAnalysis(),this.scrollToBottom(),this.inputTextarea&&(this.inputTextarea.placeholder="\u56DE\u7B54\u6F84\u6E05\u95EE\u9898\u6216\u8865\u5145\u80CC\u666F...")}renderSession(e){if(e.messages&&e.messages.length>0){if(this.replayingHistory=!0,this.chatMessagesEl){this.chatMessagesEl.empty();for(let n of e.messages)(n.role==="user"||n.role==="assistant")&&this.addChatMessage(n.role,n.content)}this.replayingHistory=!1,this.showChatState(),this.restoreAnalysisState(e);return}this.renderAnalysisStart(e)}restoreAnalysisState(e){let n=e.analysisResult;if(!n||!n.entities)return;let i=this.flattenEntityPreviews(n);if(i.length===0)return;let a=i.filter(l=>!l.isArchived),r=i.filter(l=>l.isArchived);if(a.length===0){this.clarificationPhase="complete";return}this.clarificationQueue=[...a].sort((l,c)=>(c.priorityScore??0)-(l.priorityScore??0)),this.knownEntities=[...r],this.allSessionEntities=[...a,...r],this.irrelevantKnownEntityNames.clear(),this.skippedEntityNames=new Set(Array.isArray(e.skippedEntityNames)?e.skippedEntityNames:[]);let s=e.clarificationPhase,o=e.clarificationIndex;s==="confirm_similar"||s==="clarifying"||s==="review_known"?(this.clarificationPhase=s,this.currentEntityIndex=typeof o=="number"?Math.min(o,this.clarificationQueue.length-1):0):(this.currentEntityIndex=0,this.clarificationPhase="clarifying")}saveClarificationState(){if(!this.activeBlockId)return;let e=this.plugin.getSessionManager(),n=e.getSession(this.activeBlockId,this.activeParentId);n&&(n.clarificationPhase=this.clarificationPhase,n.clarificationIndex=this.currentEntityIndex,n.skippedEntityNames=Array.from(this.skippedEntityNames),e.setSession(this.activeBlockId,n,this.activeParentId))}updateAnalysis(e){if(console.log("[TraceMind] updateAnalysis called: blockId=",e.blockId),!this.activeBlockId&&e.blockId&&(this.activeBlockId=e.blockId,this.activeParentId=null),!this.activeBlockId)return;let n=this.plugin.getSessionManager();n.setAnalysisResult(this.activeBlockId,e,this.activeParentId),this.switchToAnalysisMode();let i=n.getSession(this.activeBlockId,this.activeParentId);i&&this.renderAnalysisStart(i),this.refreshEntityIndexAttention()}renderBlockInsightCards(e){if(!this.blockInsightsEl){console.log("[TraceMind] renderBlockInsight: blockInsightsEl is null");return}if(this.blockInsightsEl.empty(),console.log("[TraceMind] renderBlockInsight: mode=",this.mode,"hasSession=",!!e,"analysisResult=",e?.analysisResult?"present":"null"),!e||this.mode!=="analysis"){this.blockInsightsEl.removeClass("visible"),console.log("[TraceMind] renderBlockInsight: early return - no session or not analysis mode");return}let n=this.flattenEntityPreviews(e.analysisResult);console.log("[TraceMind] renderBlockInsight: flattened entities count:",n.length,n);let i=0;i+=this.renderEntityCards(this.blockInsightsEl,n,e),i+=this.renderRelationCards(this.blockInsightsEl,n,e),i===0&&this.createInsightSection(this.blockInsightsEl,"\u5F85\u786E\u8BA4").createEl("div",{cls:"lifewiki-memory-empty",text:"\u8FD9\u6761\u65E5\u8BB0\u6682\u65F6\u6CA1\u6709\u9700\u8981\u786E\u8BA4\u5F52\u6863\u7684\u5185\u5BB9\u3002"}),this.applyAnalysisTabVisibility()}flattenEntityPreviews(e){return e?[...e.entities.people,...e.entities.objects,...e.entities.dimensions]:[]}renderEntityCards(e,n,i){if(n.length===0)return 0;let a=n.slice(0,6).filter(o=>!this.isReviewCardDone(i,this.entityCardId(o)));if(a.length===0)return 0;let r=this.createInsightSection(e,"\u5B9E\u4F53\u4E0E\u80CC\u666F"),s=0;for(let o of a){let l=this.entityCardId(o);s++;let c=o.isArchived||!!this.plugin.getEntityManager()?.findEntity(o.name),u=this.getReviewSupplement(i,l),d=o.maturity?this.maturityLabel(o.maturity):"",p=[this.getEntityTypeLabel(o.type),c?"\u5DF2\u6709\u6863\u6848":"\u5F85\u5F52\u6863",`\u7F6E\u4FE1\u5EA6 ${Math.round(o.confidence*100)}%`,...d?[d]:[]],f=this.createConfirmCard(r,{title:`${c?"\u5DF2\u8BC6\u522B":"\u65B0"}${this.getEntityTypeLabel(o.type)}\uFF1A${o.name}`,body:o.context||"AI \u4ECE\u8FD9\u6761\u65E5\u8BB0\u4E2D\u8BC6\u522B\u5230\u8FD9\u4E2A\u5B9E\u4F53\uFF0C\u4F46\u8FD8\u7F3A\u5C11\u80CC\u666F\u8BF4\u660E\u3002",chips:p,supplement:u});if(!c&&o.similarCandidates&&o.similarCandidates.length>0){let x=o.similarCandidates[0],E=f.createEl("div",{cls:"lifewiki-confirm-card-supplement"});E.createEl("div",{cls:"lifewiki-confirm-card-supplement-label",text:"\u7591\u4F3C\u5DF2\u6709\u6863\u6848"}),E.createEl("div",{text:`${x.name}\uFF08${Math.round(x.score*100)}%\uFF0C${x.reason}\uFF09`})}if(o.clarificationQuestions&&o.clarificationQuestions.length>0){let x=f.createEl("div",{cls:"lifewiki-confirm-card-supplement"});x.createEl("div",{cls:"lifewiki-confirm-card-supplement-label",text:"\u5F85\u6F84\u6E05"}),x.createEl("div",{text:o.clarificationQuestions[0]})}let y=!o.maturity||o.maturity==="L0"||o.maturity==="L1";c&&!y?this.addConfirmAction(f,"\u8BB0\u5F55\u4E92\u52A8","primary",async()=>{await this.recordEntityInteraction(o.name,this.mergeSupplement(`\u65E5\u8BB0\u63D0\u5230\uFF1A${this.currentSessionContent()}`,u)),this.markReviewCard(l,"confirmed",u),this.replaceCardWithStatus(f,`\u5DF2\u628A\u8FD9\u6B21\u4E92\u52A8\u8BB0\u5F55\u5230\u300C${o.name}\u300D\u6863\u6848\u3002`)}):c||this.addConfirmAction(f,y?"\u786E\u8BA4\u5E76\u8865\u5145":"\u786E\u8BA4","primary",async()=>{await this.archiveEntityPreview(o,u),this.markReviewCard(l,"confirmed",u),this.replaceCardWithStatus(f,`\u5DF2\u5F52\u6863\u300C${o.name}\u300D\u3002`)}),this.addConfirmAction(f,"\u8865\u5145\u80CC\u666F","",()=>{this.showSupplementEditor(f,l,`\u8865\u5145\u300C${o.name}\u300D\u7684\u80CC\u666F`,u)}),this.addConfirmAction(f,"\u8DF3\u8FC7","",()=>{this.markReviewCard(l,"skipped",u),f.remove()})}return s}renderRelationCards(e,n,i){let a=n.filter(f=>this.plugin.getEntityManager()?.findEntity(f.name)),r=a.length>=2?a.slice(0,2):n.slice(0,2);if(r.length<2)return 0;let[s,o]=r,l=this.relationCardId(s,o);if(this.isReviewCardDone(i,l))return 0;let c=this.createInsightSection(e,"\u5173\u7CFB\u7EBF\u7D22"),u=a.length>=2,d=this.getReviewSupplement(i,l),p=this.createConfirmCard(c,{title:`${s.name} \u548C ${o.name} \u7684\u5173\u7CFB`,body:"\u8FD9\u6761\u65E5\u8BB0\u540C\u65F6\u63D0\u5230\u4E86\u5B83\u4EEC\u3002\u5173\u7CFB\u7C7B\u578B\u6700\u597D\u7531\u4F60\u786E\u8BA4\u540E\u518D\u5F52\u6863\u3002",chips:["\u5173\u7CFB",u?"\u53EF\u5F52\u6863":"\u9700\u5148\u5F52\u6863\u5B9E\u4F53"],supplement:d});return u&&this.addConfirmAction(p,"\u8BB0\u5F55\u4E3A\u76F8\u5173","primary",async()=>{await this.handleRelations([{from:s.name,to:o.name,relation:"related_to",context:d}]),this.markReviewCard(l,"confirmed",d),this.replaceCardWithStatus(p,`\u5DF2\u8BB0\u5F55\u300C${s.name}\u300D\u548C\u300C${o.name}\u300D\u7684\u76F8\u5173\u5173\u7CFB\u3002`)}),this.addConfirmAction(p,"\u8BF4\u660E\u5173\u7CFB",u?"":"primary",()=>{this.showSupplementEditor(p,l,`\u8BF4\u660E\u300C${s.name}\u300D\u548C\u300C${o.name}\u300D\u7684\u5173\u7CFB`,d)}),this.addConfirmAction(p,"\u8DF3\u8FC7","",()=>{this.markReviewCard(l,"skipped",d),p.remove()}),1}createInsightSection(e,n){let i=e.createEl("div",{cls:"lifewiki-insight-section"});return i.createEl("div",{cls:"lifewiki-insight-section-title",text:n}),i}createConfirmCard(e,n){let i=e.createEl("div",{cls:"lifewiki-confirm-card"});if(i.createEl("div",{cls:"lifewiki-confirm-card-title",text:n.title}),i.createEl("div",{cls:"lifewiki-confirm-card-body",text:n.body}),n.supplement){let r=i.createEl("div",{cls:"lifewiki-confirm-card-supplement"});r.createEl("div",{cls:"lifewiki-confirm-card-supplement-label",text:"\u4F60\u7684\u8865\u5145"}),r.createEl("div",{text:n.supplement})}let a=i.createEl("div",{cls:"lifewiki-confirm-card-meta"});for(let r of n.chips.filter(Boolean))a.createEl("span",{cls:"lifewiki-confirm-chip",text:r});return i.createEl("div",{cls:"lifewiki-confirm-actions"}),i}addConfirmAction(e,n,i,a){let r=e.querySelector(".lifewiki-confirm-actions");if(!r)return;let s=r.createEl("button",{cls:`lifewiki-confirm-action ${i}`,text:n,attr:{type:"button"}});s.addEventListener("click",async o=>{o.stopPropagation(),s.setAttribute("disabled","true");try{await a()}catch(l){console.error("[AIAnalysisPanel] confirm action failed:",l),this.replaceCardWithStatus(e,`\u64CD\u4F5C\u5931\u8D25\uFF1A${l.message}`)}finally{s.removeAttribute("disabled")}})}replaceCardWithStatus(e,n){e.empty(),e.createEl("div",{cls:"lifewiki-confirm-card-body",text:n})}entityCardId(e){return`entity:${e.type}:${e.name}`}relationCardId(e,n){return`relation:${e.name}:${n.name}`}isReviewCardDone(e,n){let i=e.reviewCards?.[n]?.status;return i==="confirmed"||i==="skipped"}getReviewSupplement(e,n){return e.reviewCards?.[n]?.supplement||""}markReviewCard(e,n,i){this.activeBlockId&&this.plugin.getSessionManager().updateReviewCard(this.activeBlockId,e,{status:n,supplement:i},this.activeParentId)}showSupplementEditor(e,n,i,a=""){e.querySelector(".lifewiki-confirm-card-editor")?.remove();let r=e.querySelector(".lifewiki-confirm-actions"),s=e.createEl("div",{cls:"lifewiki-confirm-card-editor"});r&&e.insertBefore(s,r),s.createEl("div",{cls:"lifewiki-confirm-card-supplement-label",text:i});let o=s.createEl("textarea",{cls:"lifewiki-confirm-card-textarea",attr:{rows:"3"}});o.value=a,s.createEl("button",{cls:"lifewiki-confirm-action primary",text:"\u4FDD\u5B58\u8865\u5145",attr:{type:"button"}}).addEventListener("click",()=>{let c=o.value.trim();this.markReviewCard(n,"pending",c),this.renderBlockInsightCards(this.activeBlockId?this.plugin.getSessionManager().getSession(this.activeBlockId,this.activeParentId):null)}),o.focus()}mergeSupplement(e,n){let i=n?.trim();return i?`${e}
\u8865\u5145\uFF1A${i}`:e}isIrrelevantReply(e){let n=e.toLowerCase().trim();return["\u4E0D\u76F8\u5173","\u65E0\u5173","\u6CA1\u5173\u7CFB","\u6CA1\u6709\u5173\u7CFB","\u4E0D\u662F\u8FD9\u4E2A","\u4E0D\u662F\u8FD9\u4E2A\u5B9E\u4F53","irrelevant","not related","unrelated"].some(i=>n.includes(i))}resolveIrrelevantKnownEntities(e){if(!this.isIrrelevantReply(e))return[];if(this.knownEntities.length<=1)return[...this.knownEntities];let n=e.toLowerCase();return n.includes("\u90FD\u4E0D\u76F8\u5173")||n.includes("\u5168\u90E8\u4E0D\u76F8\u5173")||n.includes("all unrelated")?[...this.knownEntities]:this.knownEntities.filter(i=>n.includes(i.name.toLowerCase()))}currentSessionContent(){return this.activeBlockId&&this.plugin.getSessionManager().getSession(this.activeBlockId,this.activeParentId)?.content||""}prefillInput(e){this.inputTextarea&&(this.analysisTab="block",this.applyAnalysisTabVisibility(),this.inputTextarea.value=e,this.inputTextarea.focus(),this.autoResizeTextarea(),this.updateSendBtnState())}isAffirmativeReply(e){let n=e.toLowerCase().trim();return["\u662F","\u662F\u7684","\u5BF9","\u5BF9\u7684","\u540C\u4E00\u4E2A","\u5C31\u662F","yes","y"].includes(n)||n.includes("\u662F\u540C\u4E00\u4E2A")||n.includes("\u5C31\u662F\u5B83")}isNegativeReply(e){let n=e.toLowerCase().trim();return["\u4E0D\u662F","\u4E0D\u662F\u7684","\u4E0D\u5BF9","\u4E0D\u662F\u540C\u4E00\u4E2A","\u65B0\u5B9E\u4F53","no","n"].includes(n)||n.includes("\u4E0D\u662F\u540C\u4E00\u4E2A")||n.includes("\u5355\u72EC\u7684\u5B9E\u4F53")}async confirmSimilarEntity(e){let n=e.similarCandidates?.[0];if(!n)return;let i=this.plugin.getEntityManager(),a=i.getEntity(n.id);if(!a)return;let r=new Set(a.aliases||[]);e.name!==a.name&&r.add(e.name),await i.updateEntity(a.id,{aliases:[...r],lastUpdated:new Date().toISOString()}),e.isArchived=!0,e.newEntity=!1,e.maturity=a.maturity,e.similarCandidates=[]}async archiveEntityPreview(e,n=""){let i=this.plugin.getEntityManager();if(!i)return;if(i.findEntity(e.name)){await this.recordEntityInteraction(e.name,this.mergeSupplement(e.context||`\u65E5\u8BB0\u63D0\u5230\uFF1A${this.currentSessionContent()}`,n));return}let r=e.context||"\u4ECE\u65E5\u8BB0\u4E2D\u5F52\u6863",s=this.mergeSupplement(`\u5F52\u6863\uFF1A${r||"\u4ECE\u65E5\u8BB0\u4E2D\u53D1\u73B0"}`,n);try{await i.createEntity({type:e.type,title:e.name,titleRaw:e.name,aliases:[],tags:[],summary:r,confidence:e.confidence||.8,verificationStatus:"verified",createdAt:new Date().toISOString(),createdBy:"ai",lastUpdated:new Date().toISOString(),relatedEntities:[],interactions:[{timestamp:new Date().toISOString(),type:"ai_analysis",content:s,sourceBlockId:this.activeBlockId||void 0}],metadata:{status:"active",source:"diary",...e.type==="person"?{person_kind:this.inferPersonKind(e)}:{}}})}catch(o){if(!i.findEntity(e.name))throw o;await this.recordEntityInteraction(e.name,this.mergeSupplement(e.context||`\u65E5\u8BB0\u63D0\u5230\uFF1A${this.currentSessionContent()}`,n))}}async recordEntityInteraction(e,n){let i=this.plugin.getEntityManager(),a=i?.findEntity(e);a&&await i.addInteraction(a.id,{timestamp:new Date().toISOString(),type:"diary_mention",content:n,sourceBlockId:this.activeBlockId||void 0})}inferPersonKind(e){let n=`${e.name} ${e.context||""}`;return/公司|智能|科技|集团|有限|实验室|研究院|研究所|管委会|委员会|部门|团队|机构|中心|银行|移动|电信|联通|大学|学院|医院|政府|协会|基金|资本|投资|园区/i.test(n)?"\u7EC4\u7EC7":"\u4E2A\u4EBA"}async renderEntityIndex(){if(!this.entityIndexEl||this.mode!=="analysis")return;if(this.analysisTab!=="insight"){this.entityIndexEl.removeClass("visible");return}this.entityIndexEl.empty(),this.entityIndexEl.addClass("visible");let e=this.plugin.entityIndex;if(!e||e.entries.length===0){this.entityIndexEl.createEl("div",{cls:"lifewiki-entity-index-empty",text:"\u8FD8\u6CA1\u6709\u5B9E\u4F53\u6863\u6848\u3002\u5206\u6790\u65E5\u8BB0\u540E\u4F1A\u9010\u6B65\u5EFA\u7ACB\u3002"});return}let n=new Map;for(let i of e.entries){let a=i.cardType;n.has(a)||n.set(a,[]),n.get(a).push(i)}for(let[i,a]of this.sortedTypeGroups(n)){let r=this.getEntityTypeLabel(i);this.renderEntityIndexSection(r,a)}}sortedTypeGroups(e){let n=["person","object","theme"],i=[];for(let a of n){let r=e.get(a);r&&r.length>0&&i.push([a,r])}return i}renderEntityIndexSection(e,n){if(!this.entityIndexEl)return;let i=this.entityIndexEl.createEl("div",{cls:"lifewiki-entity-index-section"}),a=i.createEl("div",{cls:"lifewiki-entity-index-header"});a.createEl("span",{text:e}),a.createEl("span",{cls:"lifewiki-entity-index-count",text:String(n.length)});let r=[...n].sort((s,o)=>{let l=new Date(o.lastUpdated).getTime(),c=new Date(s.lastUpdated).getTime();return l-c}).slice(0,20);for(let s of r){let o=i.createEl("div",{cls:"lifewiki-entity-index-item"});o.createEl("div",{cls:"lifewiki-entity-index-item-title",text:s.name});let l=o.createEl("div",{cls:"lifewiki-entity-index-meta"}),c=[];s.maturity&&c.push(this.maturityLabel(s.maturity)),c.push(`\u7F6E\u4FE1\u5EA6 ${Math.round((s.confidence||0)*100)}%`),s.relationCount>0&&c.push(`\u5173\u8054 ${s.relationCount}`),s.subtype&&c.push(Qs(s.cardType,s.subtype)||s.subtype);for(let u of c){let d=u.startsWith("L");l.createEl("span",{cls:`lifewiki-entity-index-chip${d?" maturity":""}`,text:u})}}}async refreshEntityIndexAttention(){this.hasTodayInsightAttention=!0,this.mode==="analysis"&&this.analysisTab==="insight"&&this.renderAnalysisTabs()}addChatMessage(e,n){if(!this.chatMessagesEl)return null;this.showChatState();let i=this.chatMessagesEl.createEl("div",{cls:`lifewiki-chat-msg ${e}`});return e==="assistant"&&(i.setAttr("title","\u70B9\u51FB\u590D\u5236"),i.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(i.innerText.replace(/已复制$/,"").trim()||n);let a=i.createEl("span",{cls:"lifewiki-chat-msg-copy-hint",text:"\u5DF2\u590D\u5236"});setTimeout(()=>a.remove(),1500)}catch(a){console.error("Failed to copy:",a)}})),e==="assistant"&&n?this.renderMessageMarkdown(i,n):this.renderMessageContent(i,n),this.scrollToBottom(),!this.replayingHistory&&this.mode==="analysis"&&this.activeBlockId&&n&&this.plugin.getSessionManager().addMessage(this.activeBlockId,{role:e,content:n},this.activeParentId),i}renderMessageContent(e,n){e.empty();let i=n.split(/\*\*(.+?)\*\*/g);for(let a=0;a<i.length;a++)a%2===1?e.createEl("strong",{text:i[a]}):e.createEl("span",{text:i[a]})}async renderMessageMarkdown(e,n){e.empty(),await we.MarkdownRenderer.render(this.app,n,e,"",this)}async streamChatMessage(e){let n=this.stripThinking(e),i=this.addChatMessage("assistant","");if(!i)return null;let a="",r=n.length>220?3:1;for(let s=0;s<n.length;s+=r)a+=n.slice(s,s+r),this.renderMessageContent(i,a),this.scrollToBottom(),await new Promise(o=>setTimeout(o,8));return await this.renderMessageMarkdown(i,n),!this.replayingHistory&&this.mode==="analysis"&&this.activeBlockId&&this.plugin.getSessionManager().addMessage(this.activeBlockId,{role:"assistant",content:n},this.activeParentId),i}async sendMessage(){if(!this.inputTextarea||this.isLoading)return;let e=this.inputTextarea.value.trim();if(!e)return;if(this.mode==="chat"){await this.sendChatMessage(e);return}if(!this.activeBlockId)return;let n=e.toLowerCase().trim();if(this.isTaskDraftIntent(n)){await this.generateTaskDraftsFromActiveBlock(e);return}if(this.clarificationPhase==="review_known"&&(n==="\u6CA1\u6709"||n==="\u6CA1\u6709\u4E86"||n==="\u4E0D\u7528\u4E86"||n==="no"||n==="\u7ED3\u675F")){this.isLoading=!0,this.inputTextarea.value="",this.autoResizeTextarea(),this.updateSendBtnState(),this.addChatMessage("user",e),await this.streamChatMessage("\u597D\u7684\uFF0C\u90A3\u5C31\u5230\u8FD9\u91CC\u3002"),this.knownEntities=[],await this.finishClarification(),this.isLoading=!1,this.updateSendBtnState();return}if(this.clarificationPhase==="clarifying"){if(n==="\u8DF3\u8FC7"||n==="skip"||n==="\u4E0B\u4E00\u4E2A"||n==="next"){this.isLoading=!0,this.inputTextarea.value="",this.autoResizeTextarea(),this.updateSendBtnState(),this.addChatMessage("user",e),await this.skipCurrentEntity(),this.isLoading=!1,this.updateSendBtnState();return}if(n==="\u7ED3\u675F"||n==="\u4E0D\u7528\u4E86"||n==="finish"||n==="stop"){this.isLoading=!0,this.inputTextarea.value="",this.autoResizeTextarea(),this.updateSendBtnState(),this.addChatMessage("user",e),await this.finishClarification(),this.isLoading=!1,this.updateSendBtnState();return}}if(this.clarificationPhase==="confirm_similar"&&(n==="\u8DF3\u8FC7"||n==="skip"||n==="\u4E0B\u4E00\u4E2A"||n==="next")){this.isLoading=!0,this.inputTextarea.value="",this.autoResizeTextarea(),this.updateSendBtnState(),this.addChatMessage("user",e),await this.skipCurrentEntity(),this.isLoading=!1,this.updateSendBtnState();return}this.isLoading=!0,this.inputTextarea.value="",this.autoResizeTextarea(),this.updateSendBtnState(),this.addChatMessage("user",e),this.showThinkingIndicator();try{if(this.clarificationPhase==="confirm_similar"){let i=this.clarificationQueue[this.currentEntityIndex];if(this.hideThinkingIndicator(),this.isAffirmativeReply(e)){let a=i.similarCandidates?.[0]?.name||"";await this.confirmSimilarEntity(i),await this.streamChatMessage("\u597D\u7684\uFF0C\u6211\u4F1A\u628A **"+i.name+"** \u89C6\u4E3A **"+a+"** \u7684\u53E6\u4E00\u79CD\u53EB\u6CD5\uFF0C\u5E76\u8BB0\u5230\u5B83\u7684\u6863\u6848\u91CC\u3002"),await this.advanceAfterCurrentEntity()}else this.isNegativeReply(e)?(i.similarCandidates=[],await this.archiveEntityPreview(i),i.isArchived=!0,i.newEntity=!1,await this.streamChatMessage("\u660E\u767D\uFF0C\u6211\u5DF2\u628A **"+i.name+"** \u4F5C\u4E3A\u65B0\u5B9E\u4F53\u5F52\u6863\u3002"),await this.advanceAfterCurrentEntity()):await this.streamChatMessage("\u6211\u9700\u8981\u5148\u786E\u8BA4\u4E00\u4E0B\uFF1A\u8FD9\u91CC\u7684 **"+i.name+"** \u662F\u4E0D\u662F\u6307 **"+(i.similarCandidates?.[0]?.name||"")+"**\uFF1F\u53EF\u4EE5\u56DE\u590D\u201C\u662F\u201D\u6216\u201C\u4E0D\u662F\u201D\u3002")}else if(this.clarificationPhase==="clarifying"){let i=this.clarificationQueue[this.currentEntityIndex];this.hideThinkingIndicator();let a=await this.parseClarificationResponse(e,i);if(await this.streamChatMessage(a.acknowledgment),await this.updateEntityFromClarification(i,a.attributes,e),this.currentEntityIndex++,this.saveClarificationState(),this.currentEntityIndex>=this.clarificationQueue.length)await this.finishClarification();else{let r=this.clarificationQueue[this.currentEntityIndex];await this.streamChatMessage("\u597D\u7684\uFF0C\u518D\u6765\u770B\u770B **"+r.name+"**\u3002"),setTimeout(async()=>{await this.beginCurrentEntityStep()},300)}}else if(this.clarificationPhase==="review_known"){this.hideThinkingIndicator();let i=e.toLowerCase().trim(),a=this.resolveIrrelevantKnownEntities(e);if(a.length>0){for(let s of a)this.irrelevantKnownEntityNames.add(s.name);let r=a.map(s=>"**"+s.name+"**").join("\u3001");if(this.knownEntities=this.knownEntities.filter(s=>!this.irrelevantKnownEntityNames.has(s.name)),await this.streamChatMessage("\u660E\u767D\uFF0C"+r+" \u548C\u8FD9\u6761\u65E5\u8BB0\u4E0D\u76F8\u5173\uFF0C\u6211\u4E0D\u4F1A\u66F4\u65B0\u5BF9\u5E94\u6863\u6848\u3002"),this.knownEntities.length>0){let s=this.knownEntities.map(o=>"**"+o.name+"**").join("\u3001");await this.streamChatMessage("\u90A3 "+s+" \u8FD8\u6709\u65B0\u7684\u4FE1\u606F\u8981\u8865\u5145\u5417\uFF1F\u6CA1\u6709\u7684\u8BDD\u8BF4\u201C\u6CA1\u6709\u4E86\u201D\u5C31\u597D\u3002")}else await this.finishClarification()}else if(this.isIrrelevantReply(e)&&this.knownEntities.length>1)await this.streamChatMessage("\u4F60\u8BF4\u7684\u4E0D\u76F8\u5173\u662F\u6307\u54EA\u4E2A\u5B9E\u4F53\uFF1F\u53EF\u4EE5\u76F4\u63A5\u8BF4\u201Cxxx \u4E0D\u76F8\u5173\u201D\uFF0C\u6216\u8005\u8BF4\u201C\u90FD\u4E0D\u76F8\u5173\u201D\u3002");else if(i==="\u6CA1\u6709"||i==="\u6CA1\u6709\u4E86"||i==="\u4E0D\u7528\u4E86"||i==="no"||i==="nope"||i==="\u7ED3\u675F"||i==="\u7ED3\u675F\u4E86")this.knownEntities=[],await this.finishClarification();else{if(this.knownEntities.length===1){let r=await this.parseClarificationResponse(e,this.knownEntities[0]);await this.updateEntityFromClarification(this.knownEntities[0],r.attributes||{},e)}else{let r=await this.parseMultiEntityResponse(e,this.knownEntities);for(let s of this.knownEntities){let o=r[s.name]||{};await this.updateEntityFromClarification(s,o,e)}}await this.streamChatMessage("\u5DF2\u66F4\u65B0 "+this.knownEntities.length+" \u4E2A\u76F8\u5173\u6863\u6848\u4FE1\u606F\u3002"),this.knownEntities=[],await this.finishClarification()}}}catch(i){console.error("AI chat error:",i),this.hideThinkingIndicator(),this.addChatMessage("assistant","\u62B1\u6B49\uFF0CAI \u54CD\u5E94\u5931\u8D25: "+i.message)}this.isLoading=!1,this.updateSendBtnState()}async parseMultiEntityResponse(e,n){let i=this.plugin.getAIProvider(),r=`\u7528\u6237\u5BF9\u4EE5\u4E0B\u5B9E\u4F53\u505A\u4E86\u8865\u5145\uFF1A
`+n.map(s=>"- "+s.name+" ["+s.type+"]").join(`
`)+`

\u7528\u6237\u56DE\u7B54\uFF1A`+e+`

\u8BF7\u4E3A\u6BCF\u4E2A\u5B9E\u4F53\u63D0\u53D6\u5C5E\u6027\uFF0C\u4F8B\u5982\u7528\u6237\u8BF4\u201C\u5F20\u4E09\u5728\u5B57\u8282\u505APM\uFF0C\u5C0F\u674E\u662F\u5356\u65B9\u201D\uFF0C\u5219\u8FD4\u56DE\uFF1A{"\u5F20\u4E09":{"company":"\u5B57\u8282","role":"PM"},"\u5C0F\u674E":{"relationship_to_user":"\u5356\u65B9"}}
\u53EA\u8FD4\u56DE\u5408\u6CD5 JSON\u3002`;try{let s=await i.chat([{role:"user",content:r}],"analysis"),o=this.extractJSON(s.content);return JSON.parse(o)}catch{return{}}}async parseClarificationResponse(e,n){let i=this.plugin.getAIProvider(),a=this.plugin.getUserProfileContext(),r=n.subtype?Qs(n.type,n.subtype)||n.subtype:"",s=r?`${n.type} / ${n.subtype}\uFF08${r}\uFF09`:n.type,o=["\u7528\u6237\u56DE\u7B54\u4E86\u5173\u4E8E\u300C"+n.name+"\u300D\uFF08\u7C7B\u578B\uFF1A"+s+"\uFF09\u7684\u6F84\u6E05\u95EE\u9898\u3002"];a&&(o.push(""),o.push(a),o.push(""),o.push("\u6839\u636E\u4E0A\u8FF0\u7528\u6237\u6863\u6848\uFF0C\u8BF7\u505A\u5408\u7406\u63A8\u65AD\u3002\u4F8B\u5982\uFF1A\u7528\u6237\u56DE\u7B54\u201C\u662F\u540C\u4E8B\u201D\uFF0C\u5219\u516C\u53F8\u5E94\u4E0E\u7528\u6237\u6863\u6848\u4E2D\u7684\u516C\u53F8\u76F8\u540C\u3002\u7528\u6237\u56DE\u7B54\u201C\u662F\u670B\u53CB\u201D\uFF0C\u5219\u5173\u7CFB\u4E3A friend\u3002")),o.push(""),o.push("\u7528\u6237\u56DE\u7B54\uFF1A"+e);let l=o.concat(["\u8BF7\u4ECE\u7528\u6237\u56DE\u7B54\u4E2D\u63D0\u53D6\u5173\u952E\u5C5E\u6027\u4FE1\u606F\u3002","","\u5F53\u524D\u5B9E\u4F53\u7C7B\u578B\u662F "+s+"\uFF0C\u53EF\u7528\u7684\u5C5E\u6027\u540D\u4E3A\uFF1A",cg(n.type,n.subtype),"","=== \u91CD\u8981\uFF1Aattributes \u5FC5\u987B\u662F\u5E73\u94FA\u7684 key-value\uFF0C\u4E0D\u8981\u5D4C\u5957===",'\u9519\u8BEF\u793A\u4F8B\uFF1A{ "person": { "company": "xxx" } }','\u6B63\u786E\u793A\u4F8B\uFF1A{ "company": "xxx", "role": "xxx" }',"","\u8FD4\u56DE\u4E00\u4E2A JSON \u5BF9\u8C61\uFF0C\u4F8B\u5982\u7528\u6237\u8BF4\u201C\u5F20\u4E09\u662F\u5B57\u8282\u8DF3\u52A8\u7684\u4EA7\u54C1\u7ECF\u7406\uFF0C\u662F\u6211\u540C\u4E8B\uFF0C\u53EB\u4ED6\u4E09\u54E5\u201D\uFF0C\u5219\u8FD4\u56DE\uFF1A","{",'  "acknowledgment": "\u660E\u767D\u4E86\uFF0C\u5F20\u4E09\u5728\u5B57\u8282\u8DF3\u52A8\u505A\u4EA7\u54C1\u7ECF\u7406\uFF0C\u662F\u4F60\u540C\u4E8B\u3002",','  "attributes": { "company": "\u5B57\u8282\u8DF3\u52A8", "role": "\u4EA7\u54C1\u7ECF\u7406", "relationship_to_user": "\u540C\u4E8B", "aliases": "\u4E09\u54E5" }',"}","","\u53EA\u8FD4\u56DE\u5408\u6CD5 JSON\uFF0C\u4E0D\u8981 markdown\u3002"]).join(`
`);try{let c=await i.chat([{role:"user",content:l}],"analysis"),u=this.extractJSON(c.content),d=JSON.parse(u);return{acknowledgment:d.acknowledgment||`\u660E\u767D\u4E86\uFF0C\u5173\u4E8E\u300C${n.name}\u300D\u7684\u4FE1\u606F\u5DF2\u8BB0\u5F55\u3002`,attributes:d.attributes||{}}}catch{return{acknowledgment:`\u6536\u5230\uFF0C\u5173\u4E8E\u300C${n.name}\u300D\u7684\u4FE1\u606F\u5DF2\u8BB0\u5F55\u3002`,attributes:{}}}}extractJSON(e){let n=e.indexOf("{");if(n<0)return"{}";let i=0;for(let a=n;a<e.length;a++)if(e[a]==="{")i++;else if(e[a]==="}"&&(i--,i===0))return e.slice(n,a+1);return"{}"}flattenAttributes(e){let n={},i=["person","object","theme"];for(let[a,r]of Object.entries(e))i.includes(a)&&typeof r=="object"&&r!==null?Object.assign(n,r):n[a]=r;return n}normalizeAttributes(e,n){let i={},a={title:"role",position:"role",job:"role",relationship:"relationship_to_user",relation:"relationship_to_user",company_name:"company",organization:"company",type:"subtype",state:"status",due_date:"deadline",due:"deadline",count:"occurrenceCount",frequency:"occurrenceCount"};for(let[r,s]of Object.entries(e)){let o=a[r]||r;i[o]=s}return i}async updateEntityFromClarification(e,n,i){let a=this.flattenAttributes(n),r=this.normalizeAttributes(a,e.type),s=r.aliases;delete r.aliases;let o=[];typeof s=="string"?o.push(...s.split(/[,，、]/).map(u=>u.trim()).filter(Boolean)):Array.isArray(s)&&o.push(...s.map(String));let l=this.plugin.getEntityManager(),c=l.findEntity(e.name);if(c){let d=l.getEntity(c.id)?.aliases||[],p=[...new Set([...d,...o])];await l.updateEntity(c.id,{...r,aliases:p,lastUpdated:new Date().toISOString()})}else{let u=this.currentSessionContent();await l.createEntity({title:e.name,type:e.type,aliases:o,metadata:r,interactions:[{timestamp:new Date().toISOString(),type:"diary_mention",content:u||e.context||e.name}]})}if(i){let u=l.findEntity(e.name);u&&await l.addInteraction(u.id,{timestamp:new Date().toISOString(),type:"user_feedback",content:i})}}async continueBlockConversation(e){if(!this.activeBlockId)throw new Error("No active block");let n=this.plugin.getSessionManager().getSession(this.activeBlockId,this.activeParentId),i=n?.content||this.currentSessionContent(),a=this.plugin.getUserProfileContext(),r=this.plugin.getAIProvider(),s=n?.messages||[],o="\u4F60\u662F TraceMind \u7684\u65E5\u8BB0\u5206\u6790\u52A9\u624B\u3002\u56F4\u7ED5\u5F53\u524D\u8FD9\u6761\u65E5\u8BB0\uFF0C\u7528\u81EA\u7136\u4E2D\u6587\u5E2E\u52A9\u7528\u6237\u8865\u5145\u5B9E\u4F53\u80CC\u666F\u3001\u4E8B\u5B9E\u3001\u5173\u7CFB\u548C\u4E92\u52A8\u8BB0\u5F55\u3002\u4E00\u6B21\u53EA\u95EE\u4E00\u4E2A\u5173\u952E\u95EE\u9898\uFF0C\u907F\u514D\u8F93\u51FA\u4EE3\u7801\u6216 JSON\u3002";a&&(o+=`

`+a+`

\u8BF7\u6839\u636E\u7528\u6237\u6863\u6848\u505A\u5408\u7406\u63A8\u65AD\u3002\u4F8B\u5982\u7528\u6237\u56DE\u7B54"\u662F\u540C\u4E8B"\uFF0C\u5219\u516C\u53F8\u5E94\u4E0E\u7528\u6237\u76F8\u540C\u3002`);let l=await r.chat([{role:"system",content:o},{role:"user",content:"\u5F53\u524D\u65E5\u8BB0\uFF1A"+(i||"\u65E0")},...s.length>0?s.slice(-8):[{role:"user",content:e}]],"analysis");return{aiResponse:this.stripThinking(l.content)}}async executeChatActions(e){let n=[],i=this.plugin.getEntityManager();for(let a of e)try{switch(a.action){case"search_entity":{let r=i.findEntity(a.name||"");if(r){let s=["\u627E\u5230\u5B9E\u4F53\uFF1A"+r.name];s.push("\u7C7B\u578B\uFF1A"+r.cardType),r.subtype&&s.push("\u5B50\u7C7B\u578B\uFF1A"+r.subtype),r.maturity&&s.push("\u6210\u719F\u5EA6\uFF1A"+r.maturity),n.push(s.join("\uFF0C"))}else n.push("\u672A\u627E\u5230\u5B9E\u4F53\uFF1A"+(a.name||""));break}case"get_entity":{let r=i.findEntity(a.name||"");if(!r){n.push("\u672A\u627E\u5230\u5B9E\u4F53\uFF1A"+(a.name||""));break}try{let s=await this.plugin.app.vault.adapter.read(r.filePath),o=s.match(/^---\n([\s\S]*?)\n---/),l=[];if(o)for(let u of o[1].split(`
`)){let d=u.indexOf(":");if(d>0){let p=u.slice(0,d).trim(),f=u.slice(d+1).trim();p&&f&&p!=="id"&&p!=="name"&&l.push(p+": "+f)}}let c="=== "+r.name+` \u6863\u6848\u6458\u8981 ===
\u7C7B\u578B\uFF1A`+r.cardType+`
\u5C5E\u6027\uFF1A`+(l.length>0?l.join("\uFF0C"):"\u65E0")+`

--- \u5B8C\u6574\u5185\u5BB9 ---
`+s;n.push(c)}catch{let s=[r.name+" ["+r.cardType+"]"];r.maturity&&s.push("\u6210\u719F\u5EA6\uFF1A"+r.maturity),r.subtype&&s.push("\u5B50\u7C7B\u578B\uFF1A"+r.subtype),n.push(s.join("\uFF0C"))}break}case"create_entity":{if(!a.name||!a.type){n.push("\u521B\u5EFA\u5931\u8D25\uFF1A\u7F3A\u5C11 name \u6216 type");break}let r=i.findEntity(a.name);if(r){n.push("\u5B9E\u4F53\u5DF2\u5B58\u5728\uFF1A"+a.name+" ("+r.cardType+")\uFF0C\u8BF7\u7528 update_entity \u4FEE\u6539");break}await i.createEntity({title:a.name,type:a.type,metadata:a.attributes||{}}),n.push("\u5DF2\u521B\u5EFA "+a.type+" \u5B9E\u4F53\uFF1A"+a.name);break}case"update_entity":{if(!a.name){n.push("\u66F4\u65B0\u5931\u8D25\uFF1A\u7F3A\u5C11 name");break}let r=i.findEntity(a.name);if(!r){n.push("\u672A\u627E\u5230\u5B9E\u4F53\uFF1A"+a.name);break}await i.updateEntity(r.id,a.attributes||{}),n.push("\u5DF2\u66F4\u65B0 "+a.name);break}case"list_diary":{try{let s=(await this.plugin.app.vault.adapter.list("Daily/")).files.filter(c=>c.endsWith(".md")).sort().reverse(),o=new Date().toISOString().split("T")[0],l=s.slice(0,7);if(n.push("Daily/ \u76EE\u5F55\u5171 "+s.length+" \u7BC7\u65E5\u8BB0\u3002\u6700\u8FD1\uFF1A"+l.map(c=>c.replace("Daily/","").replace(".md","")).join("\u3001")),a.dateRange==="today"||!a.dateRange){let c="Daily/"+o+".md";s.includes(c)&&n.push("\u4ECA\u5929\u7684\u65E5\u8BB0\uFF1A"+c)}}catch(r){n.push("\u8BFB\u53D6\u65E5\u8BB0\u5217\u8868\u5931\u8D25\uFF1A"+r.message)}break}case"get_diary":{try{let r=a.date||new Date().toISOString().split("T")[0],s="Daily/"+r+".md",o=await this.plugin.app.vault.adapter.read(s);n.push("\u65E5\u8BB0 "+r+` \u7684\u5185\u5BB9\uFF1A
`+o)}catch(r){n.push("\u8BFB\u53D6\u65E5\u8BB0\u5931\u8D25\uFF1A"+r.message)}break}case"create_task_drafts":{let r=this.buildTaskDraftSource(),s=Ad(a,r);if(s.length===0){n.push("\u672A\u751F\u6210\u6709\u6548\u4EFB\u52A1\u8349\u7A3F\uFF1A\u8BF7\u63D0\u4F9B title \u548C description\u3002");break}this.renderTaskDraftCards(s),n.push(`\u5DF2\u751F\u6210 ${s.length} \u4E2A\u4EFB\u52A1\u8349\u7A3F\uFF0C\u7B49\u5F85\u7528\u6237\u786E\u8BA4\u52A0\u5165\u884C\u52A8\u770B\u677F\u3002`);break}default:n.push("\u672A\u77E5\u64CD\u4F5C\uFF1A"+a.action)}}catch(r){n.push("\u64CD\u4F5C\u5931\u8D25 "+a.action+": "+r.message)}return n}buildChatSystemPrompt(){let e=[];e.push("\u4F60\u662F TraceMind \u7684 Vault \u7BA1\u5BB6\u52A9\u624B\u3002\u4F60\u53EF\u4EE5\u901A\u8FC7\u5D4C\u5165 [TRACEMIND_ACTION] \u5757\u6765\u6267\u884C\u64CD\u4F5C\u3002"),e.push("\u4E0D\u8981\u8F93\u51FA\u601D\u8003\u8FC7\u7A0B\u3001\u5185\u5FC3\u72EC\u767D\u6216\u81EA\u95EE\u81EA\u7B54\u3002\u76F4\u63A5\u6267\u884C\u64CD\u4F5C\u5E76\u7ED9\u51FA\u7ED3\u679C\u3002");let n=new Date;e.push("\u4ECA\u5929\u662F "+n.getFullYear()+"\u5E74"+(n.getMonth()+1)+"\u6708"+n.getDate()+"\u65E5\u3002"),e.push(""),e.push("\u53EF\u7528\u64CD\u4F5C\uFF1A"),e.push('- search_entity: {"action":"search_entity","name":"\u5B9E\u4F53\u540D"}'),e.push('- get_entity: {"action":"get_entity","type":"person","name":"\u5B9E\u4F53\u540D"}'),e.push('- get_diary: {"action":"get_diary","date":"YYYY-MM-DD"}'),e.push('- create_entity: {"action":"create_entity","type":"person|object|theme","name":"\u540D\u79F0","attributes":{"key":"value"}}'),e.push('- update_entity: {"action":"update_entity","type":"person|object|theme","name":"\u540D\u79F0","attributes":{"key":"value"}}'),e.push(gg()),e.push(""),e.push("\u4F60\u7684\u80FD\u529B\uFF1A"),e.push("- \u641C\u7D22\u3001\u67E5\u8BE2\u3001\u521B\u5EFA\u3001\u4FEE\u6539 Person/Object/Theme \u6863\u6848"),e.push("- \u67E5\u770B\u4EFB\u610F\u65E5\u671F\u65E5\u8BB0\uFF08\u4F7F\u7528 get_diary \u64CD\u4F5C\uFF09"),e.push("- \u603B\u7ED3\u3001\u5206\u6790\u65E5\u8BB0\uFF08Daily/ \u76EE\u5F55\uFF09"),e.push("- \u64B0\u5199\u5468\u62A5\u3001\u6708\u62A5"),e.push("- \u5206\u6790\u5B9E\u4F53\u5173\u7CFB\u548C\u4E92\u52A8\u6A21\u5F0F"),e.push(""),e.push("\u91CD\u8981\u89C4\u5219\uFF1A"),e.push("- \u5F53\u7528\u6237\u63D0\u53CA\u67D0\u4E2A\u5B9E\u4F53\u65F6\uFF0C\u4F18\u5148\u4F7F\u7528 get_entity \u67E5\u8BE2\u5176\u6863\u6848\uFF0C\u6863\u6848\u4E2D\u5DF2\u5305\u542B\u4E0E\u8BE5\u5B9E\u4F53\u76F8\u5173\u7684\u65E5\u8BB0\u4E92\u52A8\u8BB0\u5F55\u3002\u53EA\u6709\u5728\u6863\u6848\u4FE1\u606F\u4E0D\u8DB3\u65F6\u624D\u7528 get_diary \u8865\u5145\u67E5\u8BE2\u3002"),e.push("- \u5F53\u7528\u6237\u8981\u6C42\u5468\u62A5\u3001\u6708\u62A5\u6216\u8DE8\u65E5\u671F\u603B\u7ED3\u65F6\uFF0C\u5148\u4E00\u6B21\u6027\u8F93\u51FA\u6240\u9700\u65E5\u671F\u7684\u591A\u4E2A get_diary \u64CD\u4F5C\u5757\uFF0C\u6BCF\u4E2A\u65E5\u671F\u4E00\u4E2A action\uFF1B\u4E0D\u8981\u4E00\u6761\u4E00\u6761\u5730\u8BF7\u6C42\u3002"),e.push("- \u521B\u5EFA\u65B0\u5B9E\u4F53\u524D\uFF0C\u5FC5\u987B\u5148\u7528 search_entity \u786E\u8BA4\u4E0D\u5B58\u5728\uFF0C\u907F\u514D\u91CD\u590D\u521B\u5EFA\u3002"),e.push("- \u4FEE\u6539\u5B9E\u4F53\u524D\uFF0C\u5FC5\u987B\u5148\u7528 get_entity \u786E\u8BA4\u5B58\u5728\u5E76\u67E5\u770B\u5F53\u524D\u5C5E\u6027\u3002"),e.push(""),e.push(Sd());let i=this.plugin.entityIndex?.entries||[];if(i.length>0){let r=i.filter(l=>l.cardType==="person"||l.type==="person"),s=i.filter(l=>l.cardType==="object"||l.type==="project"),o=i.filter(l=>l.cardType==="theme"||l.type==="theme");e.push(""),e.push("\u5F53\u524D Vault: "+r.length+"\u4EBA\u7269, "+s.length+"\u5BA2\u4F53, "+o.length+"\u4E3B\u9898"),r.length>0&&e.push("\u4EBA\u7269: "+r.map(l=>l.name).join("\u3001")),s.length>0&&e.push("\u5BA2\u4F53: "+s.map(l=>l.name).join("\u3001")),o.length>0&&e.push("\u4E3B\u9898: "+o.map(l=>l.name).join("\u3001"))}let a=this.plugin.getUserProfileContext();return a&&(e.push(""),e.push(a)),e.push(""),e.push("\u5F53\u9700\u8981\u6267\u884C\u64CD\u4F5C\u65F6\uFF0C\u5FC5\u987B\u4F7F\u7528\u4EE5\u4E0B\u5B8C\u6574\u683C\u5F0F\uFF08\u5F00\u59CB\u6807\u7B7E\u548C\u7ED3\u675F\u6807\u7B7E\u90FD\u4E0D\u80FD\u7701\u7565\uFF09\uFF1A"),e.push("[TRACEMIND_ACTION]"),e.push('{"action":"get_diary","date":"2026-05-05"}'),e.push("[/TRACEMIND_ACTION]"),e.push("\u5982\u679C\u662F\u521B\u5EFA\u4EFB\u52A1\u8349\u7A3F\uFF0C\u793A\u4F8B\uFF1A"),e.push("[TRACEMIND_ACTION]"),e.push('{"action":"create_task_drafts","tasks":[{"title":"\u6574\u7406\u5468\u62A5","description":"\u57FA\u4E8E\u672C\u5468\u65E5\u8BB0\u8F93\u51FA\u4E00\u4EFD Markdown \u5DE5\u4F5C\u5468\u62A5\uFF0C\u4EA4\u4ED8\u7269\u4FDD\u5B58\u5230 outputs \u76EE\u5F55"}]}'),e.push("[/TRACEMIND_ACTION]"),e.push(""),e.push("\u7136\u540E\u7EE7\u7EED\u7528\u53CB\u597D\u7684\u4E2D\u6587\u56DE\u7B54\u3002\u64CD\u4F5C\u5757\u4E4B\u5916\u4E0D\u8981\u51FA\u73B0\u4EFB\u4F55 JSON\u3002"),e.join(`
`)}buildTaskDraftSource(){let e=this.currentSessionContent();if(this.activeBlockId&&e){let n=this.plugin.getBlockEditorDate();return{kind:"diary",path:n?`Daily/${n}.md`:void 0,blockId:this.activeBlockId,excerpt:e.slice(0,240)}}return{kind:"chat"}}isTaskDraftIntent(e){return["\u751F\u6210\u4EFB\u52A1","\u521B\u5EFA\u4EFB\u52A1","\u62C6\u6210\u4EFB\u52A1","\u8F6C\u6210\u4EFB\u52A1","\u884C\u52A8\u4EFB\u52A1","\u884C\u52A8\u770B\u677F","\u52A0\u5165\u770B\u677F","\u5F85\u529E","task","todo"].some(n=>e.includes(n))}async offerPotentialTasksAfterAnalysis(){let e=this.currentSessionContent();if(!e.trim())return;let n=this.buildTaskDraftSource();this.showThinkingIndicator();try{let i=hg({sourceContent:e,sourceTitle:n.path||n.title||"\u5F53\u524D\u65E5\u8BB0 block"}),a=await this.plugin.getAIProvider().chat([{role:"user",content:i}],"analysis"),r=Td(this.stripThinking(a.content),n);if(this.hideThinkingIndicator(),r.length===0)return;await this.streamChatMessage(`\u6211\u8FD8\u53D1\u73B0 ${r.length} \u4E2A\u53EF\u80FD\u53EF\u4EE5\u63A8\u8FDB\u7684\u884C\u52A8\u4EFB\u52A1\uFF0C\u4F60\u53EF\u4EE5\u786E\u8BA4\u662F\u5426\u52A0\u5165\u884C\u52A8\u770B\u677F\u3002`),this.renderTaskDraftCards(r)}catch(i){this.hideThinkingIndicator(),console.warn("[TraceMind] potential task detection failed:",i)}}async generateTaskDraftsFromActiveBlock(e){if(this.inputTextarea){this.isLoading=!0,this.inputTextarea.value="",this.autoResizeTextarea(),this.updateSendBtnState(),this.addChatMessage("user",e),this.showThinkingIndicator();try{let n=this.buildTaskDraftSource(),i=this.currentSessionContent();if(!i.trim()){this.hideThinkingIndicator(),await this.streamChatMessage("\u5F53\u524D\u6CA1\u6709\u9009\u4E2D\u7684\u65E5\u8BB0\u5185\u5BB9\uFF0C\u5148\u5728\u65E5\u8BB0\u4E3B\u89C6\u56FE\u91CC\u70B9\u9009\u4E00\u6761\u65E5\u8BB0 block\uFF0C\u518D\u8BA9\u6211\u751F\u6210\u4EFB\u52A1\u3002");return}let a=fg({userRequest:e,sourceContent:i,sourceTitle:n.path||n.title||"\u5F53\u524D\u65E5\u8BB0 block"}),r=await this.plugin.getAIProvider().chat([{role:"user",content:a}],"analysis"),s=Td(this.stripThinking(r.content),n);if(this.hideThinkingIndicator(),s.length===0){await this.streamChatMessage("\u6211\u6CA1\u6709\u4ECE\u8FD9\u6761\u65E5\u8BB0\u91CC\u8BC6\u522B\u51FA\u9002\u5408\u8FDB\u5165\u884C\u52A8\u770B\u677F\u7684\u660E\u786E\u4EFB\u52A1\u3002\u53EF\u4EE5\u8865\u5145\u76EE\u6807\u3001\u4EA4\u4ED8\u7269\u6216\u5E0C\u671B agent \u505A\u4EC0\u4E48\u3002");return}this.addChatMessage("assistant",`\u6211\u4ECE\u5F53\u524D\u65E5\u8BB0\u6574\u7406\u51FA ${s.length} \u4E2A\u4EFB\u52A1\u8349\u7A3F\uFF0C\u4F60\u53EF\u4EE5\u9009\u62E9\u52A0\u5165\u884C\u52A8\u770B\u677F\u3002`),this.renderTaskDraftCards(s)}catch(n){this.hideThinkingIndicator(),this.addChatMessage("assistant","\u751F\u6210\u4EFB\u52A1\u8349\u7A3F\u5931\u8D25\uFF1A"+n.message)}finally{this.isLoading=!1,this.updateSendBtnState()}}}renderTaskDraftCards(e){if(!this.chatMessagesEl)return;this.showChatState();let n=this.chatMessagesEl.createEl("div",{cls:"lifewiki-chat-task-drafts"});n.createEl("div",{cls:"lifewiki-chat-task-drafts-title",text:"\u53EF\u52A0\u5165\u884C\u52A8\u770B\u677F\u7684\u4EFB\u52A1\u8349\u7A3F"});for(let i of e){let a=n.createEl("div",{cls:"lifewiki-chat-task-draft-card"});a.createEl("h4",{text:i.title}),a.createEl("p",{text:i.description});let r=a.createEl("div",{cls:"lifewiki-chat-task-draft-actions"}),s=r.createEl("button",{cls:"primary",text:"\u52A0\u5165\u884C\u52A8\u770B\u677F"}),o=r.createEl("button",{text:"\u5FFD\u7565"});s.addEventListener("click",async l=>{l.stopPropagation();try{let c=await this.plugin.getTaskStore().createTask(i),u=i.source?.kind==="diary"?i.source.blockId:void 0;u&&this.plugin.getBlockEditorView()?.appendActionTaskChildBlock(u,c.title).catch(console.error),s.setText("\u5DF2\u52A0\u5165"),s.setAttr("disabled","true"),a.addClass("is-added"),this.plugin.taskBoardView?.refresh().catch(console.error),new we.Notice(`\u5DF2\u52A0\u5165\u884C\u52A8\u770B\u677F\uFF1A${c.title}`)}catch(c){new we.Notice("\u4EFB\u52A1\u4FDD\u5B58\u5931\u8D25\uFF1A"+c.message)}}),o.addEventListener("click",l=>{l.stopPropagation(),a.remove()})}this.scrollToBottom()}async detectLocalAgents(){this.detectedLocalAgents=[],this.rebuildAgentSelector()}rebuildAgentSelector(){if(!this.agentSelectEl)return;let e=this.agentSelectEl.value||this.currentAgentKey;this.agentSelectEl.empty();let n=this.plugin.settings.providers||[];for(let i of n)this.agentSelectEl.createEl("option",{value:i.id,text:i.name||i.model||i.id});n.length===0&&this.agentSelectEl.createEl("option",{value:"",text:"\u4E91\u7AEF API"}),e&&this.agentSelectEl.querySelector(`option[value="${e}"]`)&&(this.agentSelectEl.value=e),this.currentAgentKey=this.agentSelectEl.value}buildLocalAgentPrompt(e){let n=new Date,i=this.app.vault.adapter.basePath||"vault",a=[];a.push(`\u4F60\u662F TraceMind \u77E5\u8BC6\u5E93\u7684 AI \u52A9\u624B\u3002\u4ECA\u5929\u662F ${n.getFullYear()}\u5E74${n.getMonth()+1}\u6708${n.getDate()}\u65E5\u3002`),a.push(""),a.push("## Vault \u4F4D\u7F6E"),a.push(`\u4F60\u7684\u5DE5\u4F5C\u76EE\u5F55\u5C31\u662F Obsidian Vault: ${i}`),a.push("\u4F60\u53EF\u4EE5\u7528\u6587\u4EF6\u5DE5\u5177\u76F4\u63A5\u8BFB Person/Object/Theme/Daily \u76EE\u5F55\u4E0B\u7684 Markdown \u6587\u4EF6\u3002"),a.push(""),a.push(Sd()),a.push(""),a.push("## \u89C4\u5219"),a.push("- \u7528\u6237\u63D0\u5230\u67D0\u4E2A\u5B9E\u4F53\u65F6\uFF0C\u5148\u8BFB\u5176\u6863\u6848\uFF08Person/Object/Theme \u76EE\u5F55\u4E0B\u540C\u540D .md \u6587\u4EF6\uFF09"),a.push("- \u6863\u6848\u4E2D\u5DF2\u6709\u4E92\u52A8\u8BB0\u5F55\u5173\u8054\u5230\u76F8\u5173\u65E5\u8BB0"),a.push("- \u4E0D\u8981\u7F16\u9020\u4E0D\u5B58\u5728\u7684\u4FE1\u606F"),a.push("- \u7B80\u77ED\u3001\u6709\u7528\u5730\u56DE\u7B54");let r=this.plugin.entityIndex?.entries||[];if(r.length>0){let o=r.filter(u=>u.cardType==="person"||u.type==="person"),l=r.filter(u=>u.cardType==="object"||u.type==="project"),c=r.filter(u=>u.cardType==="theme"||u.type==="theme");a.push(""),a.push(`\u5F53\u524D Vault: ${o.length}\u4EBA\u7269, ${l.length}\u5BA2\u4F53, ${c.length}\u4E3B\u9898`),o.length>0&&a.push("\u4EBA\u7269: "+o.map(u=>u.name).join("\u3001")),l.length>0&&a.push("\u5BA2\u4F53: "+l.map(u=>u.name).join("\u3001")),c.length>0&&a.push("\u4E3B\u9898: "+c.map(u=>u.name).join("\u3001"))}let s=this.plugin.getUserProfileContext();return s&&(a.push(""),a.push(s)),a.push(""),a.push("---"),a.push(""),a.push("\u7528\u6237\u6D88\u606F\uFF1A"+e),a.join(`
`)}async sendChatViaLocalAgent(e,n,i){let a=this.plugin.getSessionManager();try{let r=this.currentAgentKey,s;if(r==="hermes"){let{hermesProvider:d}=await Promise.resolve().then(()=>(ld(),_h));s=d}else{let{claudeCodeProvider:d}=await Promise.resolve().then(()=>(sd(),Sh));s=d}let o=this.buildLocalAgentPrompt(e),l=s.execute(o),c=!0,u="";l.onMessage=d=>{d.type==="text"&&d.content?(c&&(this.hideThinkingIndicator(),this.addChatMessage("assistant",""),c=!1),u+=d.content,this.updateLastAssistantMessage(u),this.scrollToBottom()):d.type},l.onDone=async d=>{if(d.status==="completed"&&d.output){let p=this.stripThinking(d.output),f=Rl(p);if(f.actions.length>0){f.text&&this.updateLastAssistantMessage(f.text),await this.finalizeLastAssistantMessage();let y=await this.executeChatActions(f.actions);y.length>0&&(a.addChatMessage({role:"assistant",content:f.text||p}),a.addChatMessage({role:"system",content:`\u64CD\u4F5C\u7ED3\u679C\uFF1A
`+y.join(`
`)}))}else f.text?(this.updateLastAssistantMessage(f.text),a.addChatMessage({role:"assistant",content:f.text})):a.addChatMessage({role:"assistant",content:p}),await this.finalizeLastAssistantMessage()}else c?(this.hideThinkingIndicator(),this.addChatMessage("assistant","\u672C\u5730 Agent \u8FD4\u56DE\u7A7A\u5185\u5BB9\u6216\u6267\u884C\u5931\u8D25\uFF1A"+(d.error||"\u672A\u77E5\u9519\u8BEF"))):await this.finalizeLastAssistantMessage();this.isLoading=!1,this.updateSendBtnState()},l.onError=d=>{this.hideThinkingIndicator(),this.addChatMessage("assistant","\u672C\u5730 Agent \u8C03\u7528\u5931\u8D25: "+d.message),this.isLoading=!1,this.updateSendBtnState()}}catch(r){this.hideThinkingIndicator(),this.addChatMessage("assistant","\u672C\u5730 Agent \u542F\u52A8\u5931\u8D25: "+r.message),this.isLoading=!1,this.updateSendBtnState()}}stripThinking(e){let n=e.replace(/<[Tt]hinking>[\s\S]*?<\/[Tt]hinking>/gi,"").replace(/<[Tt]hink>[\s\S]*?<\/[Tt]hink>/gi,"").replace(/<\/?[Tt]hink>/g,"").replace(/<\/?[Tt]hinking>/g,""),i=n.split(/\n\n+/);if(i.length>2){let a=i[i.length-1];if(a.length<300||/\[TRACEMIND_ACTION\]|^已|^✅|^好的/.test(a.trim()))for(let r=i.length-1;r>=0;r--){let s=i[r].trim();if(s.length>0&&!/^(不过|但是|可能|也许|可以|需要|如果|那么|因为|所以|让我|我想|我判断|当前|查找|搜索|创建|更新|首先|然后|接着|另外|实际|根据|注意|重要)/.test(s)){n=s;break}}}return n.trim()}async sendChatMessage(e){if(!this.inputTextarea)return;this.isLoading=!0,this.inputTextarea.value="",this.autoResizeTextarea(),this.updateSendBtnState(),this.addChatMessage("user",e),this.showThinkingIndicator();let n=this.plugin.getSessionManager();n.addChatMessage({role:"user",content:e});let i=this.plugin.getAIProvider(),r=n.getChatSession()?.messages||[],s={role:"system",content:this.buildChatSystemPrompt()};try{let o="",l=!0;await i.streamChat([s,...r],{onDelta:c=>{l&&(this.hideThinkingIndicator(),this.addChatMessage("assistant",""),l=!1),o+=c,this.updateLastAssistantMessage(o),this.scrollToBottom()},onDone:async()=>{if(!o){this.hideThinkingIndicator(),this.addChatMessage("assistant","\u62B1\u6B49\uFF0CAI \u8FD4\u56DE\u4E86\u7A7A\u5185\u5BB9\u3002"),this.isLoading=!1,this.updateSendBtnState();return}let c=this.stripThinking(o),u=Rl(c);if(u.actions.length>0){u.text&&this.updateLastAssistantMessage(u.text),await this.finalizeLastAssistantMessage();let d=await this.executeChatActions(u.actions);if(d.length>0){n.addChatMessage({role:"assistant",content:u.text||c}),n.addChatMessage({role:"system",content:`\u64CD\u4F5C\u7ED3\u679C\uFF1A
`+d.join(`
`)});let p=n.getChatSession().messages,f={role:"system",content:this.buildChatSystemPrompt()},y="";await i.streamChat([f,...p],{onDelta:x=>{y+=x;let E=this.getLastAssistantContent()||"";this.updateLastAssistantMessage(E+x),this.scrollToBottom()},onDone:async()=>{y&&n.addChatMessage({role:"assistant",content:y}),await this.finalizeLastAssistantMessage()},onError:x=>{console.error("Follow-up AI stream error:",x)}},"chat")}}else u.text?(this.updateLastAssistantMessage(u.text),n.addChatMessage({role:"assistant",content:u.text})):n.addChatMessage({role:"assistant",content:c}),await this.finalizeLastAssistantMessage();this.isLoading=!1,this.updateSendBtnState()},onError:c=>{console.error("AI chat error:",c),this.hideThinkingIndicator(),this.addChatMessage("assistant","\u62B1\u6B49\uFF0CAI \u54CD\u5E94\u5931\u8D25: "+c.message),this.isLoading=!1,this.updateSendBtnState()}},"chat")}catch(o){console.error("AI chat error:",o),this.hideThinkingIndicator(),this.addChatMessage("assistant","\u62B1\u6B49\uFF0CAI \u54CD\u5E94\u5931\u8D25: "+o.message),this.isLoading=!1,this.updateSendBtnState()}}updateLastAssistantMessage(e){if(!this.chatMessagesEl)return;let n=this.chatMessagesEl.querySelectorAll(".lifewiki-chat-msg.assistant"),i=n[n.length-1];if(i){i.empty();let a=eg(e.replace(/\[TRACEMIND_ACTION\][\s\S]*?\[\/TRACEMIND_ACTION\]/g,"").replace(/\[TRACEMIND_ACTION\][\s\S]*$/,"").replace(/\[\/TRACEMIND_ACTION\]/g,"").replace(/\[TRACEMIND_ACTION\]/g,""));i.createEl("pre",{cls:"lifewiki-chat-streaming",text:a||"..."})}}getLastAssistantContent(){if(!this.chatMessagesEl)return"";let e=this.chatMessagesEl.querySelectorAll(".lifewiki-chat-msg.assistant");return e[e.length-1]?.textContent||""}async finalizeLastAssistantMessage(){if(!this.chatMessagesEl)return;let e=this.chatMessagesEl.querySelectorAll(".lifewiki-chat-msg.assistant"),n=e[e.length-1];if(n){let i=n.textContent||"";i&&await this.renderMessageMarkdown(n,i)}}async handleEntityArchiving(e){let n=this.plugin.getEntityManager();if(n)for(let i of e)try{let a={status:"active",source:"diary"};i.type==="person"?(a.person_kind=/公司|组织|机构|团队/.test(i.smallType||i.context)?"\u7EC4\u7EC7":"\u4E2A\u4EBA",/同事|朋友|客户|供应商|合作伙伴|合作方/.test(i.smallType)&&(a.relationship_to_user=i.smallType)):i.type==="object"?(a.subtype=i.smallType||"other",i.context&&(a.description=i.context)):i.type==="theme"&&(a.subtype=i.smallType||"friction");let r=i.context||`\u4ECE\u65E5\u8BB0\u4E2D\u5F52\u6863\u7684${i.type}`;await n.createEntity({type:i.type,title:i.name,titleRaw:i.name,aliases:[],tags:[],summary:r,confidence:.8,verificationStatus:"verified",createdAt:new Date().toISOString(),createdBy:"ai",lastUpdated:new Date().toISOString(),relatedEntities:[],interactions:[{timestamp:new Date().toISOString(),type:"ai_analysis",content:`\u5F52\u6863\u4E3A${i.smallType}\uFF1A${i.context||"\u65E0"}`,sourceBlockId:this.activeBlockId||void 0}],metadata:a})}catch(a){console.error(`[AIAnalysisPanel] Failed to create entity ${i.name}:`,a)}}async handleEntityUpdate(e){let n=this.plugin.getEntityManager();if(n)for(let i of e)try{let a=n.getEntity(i.entityId);if(!a)continue;let r={lastUpdated:new Date().toISOString()},s=[...a.interactions??[]];for(let o of i.updates)if(o.field.startsWith("metadata.")){let l=o.field.replace("metadata.","");r.metadata={...a.metadata,[l]:o.value}}else o.field==="interactions"?(s.push({timestamp:new Date().toISOString(),type:"ai_analysis",content:o.value,sourceBlockId:this.activeBlockId||void 0}),r.interactions=s):o.field==="summary"&&(r.summary=o.value);await n.updateEntity(i.entityId,r)}catch(a){console.error(`[AIAnalysisPanel] Failed to update entity ${i.name}:`,a)}}async handleRelations(e){let n=this.plugin.getEntityManager();if(n)for(let i of e)try{let a=n.findEntity(i.from),r=n.findEntity(i.to);if(!a||!r)continue;let s=a.relatedEntities||[],o={entityId:r.id,relation:i.relation,context:i.context||`\u901A\u8FC7\u65E5\u8BB0\u5206\u6790\u5EFA\u7ACB\u5173\u7CFB\uFF1A${i.from}\u662F${i.to}\u7684${i.relation}`};s.some(c=>c.entityId===r.id&&c.relation===o.relation)||await n.updateEntity(a.id,{relatedEntities:[...s,o],lastUpdated:new Date().toISOString()})}catch(a){console.error("[AIAnalysisPanel] Failed to create relation:",a)}}async updateBlockCategory(e,n){try{let i=this.app.workspace.getLeavesOfType(Yn);if(i.length===0)return;let a=i[0].view;if(!a)return;let r=a.getBlockById(e);if(!r)return;(r.category==="\u5F85\u5206\u6790"||r.category!==n)&&(r.category=n,await a.saveBlockToFile(r),console.log(`[AIAnalysisPanel] Updated block ${e} category to ${n}`))}catch(i){console.error("[AIAnalysisPanel] Failed to update block category:",i)}}async showEntityConfirmationDialog(e){if(this.chatMessagesEl)for(let n of e){let i=this.chatMessagesEl.createEl("div",{cls:"lifewiki-entity-confirm"});i.createEl("div",{cls:"lifewiki-entity-confirm-title",text:`\u8BC6\u522B\u5230\u65B0${this.getEntityTypeLabel(n.inferredType)}: **${n.name}**`}),i.createEl("div",{cls:"lifewiki-entity-confirm-reason",text:n.reason||"\u4ECE\u65E5\u8BB0\u4E2D\u53D1\u73B0"});let a=i.createEl("div",{cls:"lifewiki-entity-confirm-buttons"}),r=a.createEl("button",{cls:"lifewiki-entity-confirm-btn archive",text:"\u5F52\u6863",attr:{type:"button"}}),s=a.createEl("button",{cls:"lifewiki-entity-confirm-btn skip",text:"\u8DF3\u8FC7",attr:{type:"button"}});r.addEventListener("click",async()=>{await this.archiveEntity(n),i.remove()}),s.addEventListener("click",()=>{i.remove()})}}getEntityTypeLabel(e){return{person:"\u4EBA\u8109",object:"\u5BA2\u4F53",theme:"\u4E3B\u9898"}[e]||"\u5B9E\u4F53"}maturityLabel(e){return e}async archiveEntity(e){let n=this.plugin.getEntityManager();if(!n)return;let a={person:"person",object:"object",theme:"theme"}[e.inferredType]||"person";try{await n.createEntity({type:a,title:e.name,titleRaw:e.name,aliases:[],tags:[],summary:e.reason||"\u4ECE\u65E5\u8BB0\u4E2D\u5F52\u6863",confidence:.8,verificationStatus:"verified",createdAt:new Date().toISOString(),createdBy:"ai",lastUpdated:new Date().toISOString(),relatedEntities:[],interactions:[{timestamp:new Date().toISOString(),type:"ai_analysis",content:`\u5F52\u6863\uFF1A${e.reason||"\u4ECE\u65E5\u8BB0\u4E2D\u53D1\u73B0"}`,sourceBlockId:this.activeBlockId||void 0}],metadata:{status:"active",source:"diary"}}),this.addChatMessage("assistant",`\u5DF2\u5F52\u6863 **${e.name}**`)}catch(r){console.error("[AIAnalysisPanel] Failed to archive entity:",r),this.addChatMessage("assistant","\u5F52\u6863\u5931\u8D25")}}async onClose(){}};var kg=require("obsidian");function Ol(t){let e=t.getFullYear(),n=String(t.getMonth()+1).padStart(2,"0"),i=String(t.getDate()).padStart(2,"0");return`${e}-${n}-${i}`}function mg(t,e){let n=new Date(t,e,1),i=new Date(t,e+1,0),a=[],r=n.getDay();for(let o=r-1;o>=0;o--)a.push(new Date(t,e,-o));for(let o=1;o<=i.getDate();o++)a.push(new Date(t,e,o));let s=42-a.length;for(let o=1;o<=s;o++)a.push(new Date(t,e+1,o));return a}function yg(t,e){return e===11?{year:t+1,month:0}:{year:t,month:e+1}}function xg(t,e){return e===0?{year:t-1,month:11}:{year:t,month:e-1}}function vg(t,e){let n=new Set;for(let i of t){let a=Ol(i);e(a)&&n.add(a)}return n}function bg(t,e){let i=[Ol(t)];return e.isToday&&i.push("\u4ECA\u5929"),i.push(e.hasDiary?"\u6709\u65E5\u8BB0":"\u65E0\u65E5\u8BB0"),e.isCurrentMonth||i.push("\u975E\u5F53\u524D\u6708"),i.join(" \xB7 ")}var Js="tracemind-calendar",zl=class extends kg.ItemView{plugin;currentYear;currentMonth;onDateClickCallback=null;constructor(e,n){super(e),this.plugin=n;let i=new Date;this.currentYear=i.getFullYear(),this.currentMonth=i.getMonth()}getViewType(){return Js}getDisplayText(){return"\u65E5\u5386"}getIcon(){return"calendar"}async onOpen(){this.renderCalendar()}setOnDateClick(e){this.onDateClickCallback=e}handleDateClick(e){this.onDateClickCallback&&this.onDateClickCallback(e)}isToday(e){let n=new Date;return e.getFullYear()===n.getFullYear()&&e.getMonth()===n.getMonth()&&e.getDate()===n.getDate()}isCurrentMonth(e){return e.getFullYear()===this.currentYear&&e.getMonth()===this.currentMonth}diaryExists(e){try{return this.app.vault.getAbstractFileByPath(`Daily/${e}.md`)!=null}catch{return!1}}goNext(){let e=yg(this.currentYear,this.currentMonth);this.currentYear=e.year,this.currentMonth=e.month,this.renderCalendar()}goPrev(){let e=xg(this.currentYear,this.currentMonth);this.currentYear=e.year,this.currentMonth=e.month,this.renderCalendar()}goToday(){let e=new Date;this.currentYear=e.getFullYear(),this.currentMonth=e.getMonth(),this.renderCalendar()}async renderCalendar(){let e=this.containerEl;e.empty(),this.addStyles();let n=e.createEl("div",{cls:"tracemind-calendar"});this.renderHeader(n),this.renderWeekdays(n),await this.renderDays(n)}renderHeader(e){let n=e.createEl("div",{cls:"lifewiki-calendar-header"}),i=n.createEl("button",{cls:"lifewiki-calendar-nav-btn",text:"\u2039"});i.setAttr("title","\u4E0A\u4E2A\u6708"),i.setAttr("aria-label","\u4E0A\u4E2A\u6708"),i.addEventListener("click",()=>this.goPrev());let a=n.createEl("span",{cls:"lifewiki-calendar-title",text:this.monthTitle()});a.setAttr("title","\u56DE\u5230\u4ECA\u5929"),a.setAttr("aria-label","\u56DE\u5230\u4ECA\u5929"),a.addEventListener("click",()=>this.goToday());let r=n.createEl("button",{cls:"lifewiki-calendar-nav-btn",text:"\u203A"});r.setAttr("title","\u4E0B\u4E2A\u6708"),r.setAttr("aria-label","\u4E0B\u4E2A\u6708"),r.addEventListener("click",()=>this.goNext())}renderWeekdays(e){let n=e.createEl("div",{cls:"lifewiki-calendar-weekdays"});for(let i of["\u65E5","\u4E00","\u4E8C","\u4E09","\u56DB","\u4E94","\u516D"])n.createEl("div",{cls:"lifewiki-calendar-weekday",text:i})}async renderDays(e){let n=mg(this.currentYear,this.currentMonth),i=vg(n,r=>this.diaryExists(r)),a=e.createEl("div",{cls:"lifewiki-calendar-grid"});for(let r of n){let s=Ol(r),o=i.has(s),l=this.isCurrentMonth(r),c=this.isToday(r),u=a.createEl("div",{cls:"lifewiki-calendar-day"});l||u.addClass("lifewiki-calendar-day-other-month"),c&&u.addClass("lifewiki-calendar-day-today"),o&&u.addClass("lifewiki-calendar-day-has-diary");let d=bg(r,{isToday:c,hasDiary:o,isCurrentMonth:l});u.setAttr("role","button"),u.setAttr("tabindex","0"),u.setAttr("title",d),u.setAttr("aria-label",d),u.createEl("span",{cls:"lifewiki-calendar-day-num",text:String(r.getDate())});let p=()=>this.handleDateClick(r);u.addEventListener("click",p),u.addEventListener("keydown",f=>{(f.key==="Enter"||f.key===" ")&&(f.preventDefault(),p())})}}monthTitle(){let e=["\u4E00\u6708","\u4E8C\u6708","\u4E09\u6708","\u56DB\u6708","\u4E94\u6708","\u516D\u6708","\u4E03\u6708","\u516B\u6708","\u4E5D\u6708","\u5341\u6708","\u5341\u4E00\u6708","\u5341\u4E8C\u6708"];return`${this.currentYear}\u5E74 ${e[this.currentMonth]}`}addStyles(){if(document.getElementById("lifewiki-calendar-styles"))return;let e=document.createElement("style");e.id="lifewiki-calendar-styles",e.textContent=`
.tracemind-calendar{padding:12px;height:100%;display:flex;flex-direction:column;background:var(--background-primary)}
.lifewiki-calendar-header{display:flex;justify-content:space-between;align-items:center;padding:8px 0;margin-bottom:8px}
.lifewiki-calendar-title{font-size:16px;font-weight:600;cursor:pointer}
.lifewiki-calendar-nav-btn{background:none;border:none;font-size:20px;cursor:pointer;padding:4px 12px;color:var(--text-muted);border-radius:4px}
.lifewiki-calendar-nav-btn:hover{background:var(--background-secondary);color:var(--text-normal)}
.lifewiki-calendar-weekdays{display:grid;grid-template-columns:repeat(7,1fr);text-align:center;margin-bottom:4px}
.lifewiki-calendar-weekday{font-size:12px;color:var(--text-muted);padding:4px}
.lifewiki-calendar-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:.5px;max-height:33vh;overflow:auto}
.lifewiki-calendar-day{display:flex;align-items:center;justify-content:center;cursor:pointer;border-radius:4px;min-height:24px;padding:2px;position:relative}
.lifewiki-calendar-day:hover{background:var(--background-secondary)}
.lifewiki-calendar-day-num{font-size:11px}
.lifewiki-calendar-day-today .lifewiki-calendar-day-num{background:var(--interactive-accent);color:var(--text-on-accent);width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:600}
.lifewiki-calendar-day-has-diary::after{content:'';position:absolute;bottom:4px;width:4px;height:4px;border-radius:50%;background:var(--interactive-accent)}
.lifewiki-calendar-day-other-month{opacity:.3}
`,document.head.appendChild(e)}};var V4=require("obsidian");vd();var N4=Le(xa()),P4=Le(d5());var A=Le(xa());qs();var yb=0;function xb(){return`edge-${Date.now()}-${++yb}`}function dt(t){return{id:t.id||xb(),from:t.from,to:t.to,type:t.type,label:t.label,agentRunId:t.agentRunId}}var vb=/https?:\/\/[^\s\]\)）"'，。；;]+/g,bb=/!?\[\[([^\]]+)\]\]/g,kb=/(?:~|\/Users\/|\/Volumes\/|\/tmp\/)[^\n\r，。；;]+?(?:\.(?:md|pdf|docx?|xlsx?|pptx?|png|jpe?g|gif|webp|svg|txt|csv|json|html?))(?:#[^\s，。；;]+)?/gi,Eb=/(?:TraceMind|Daily|Person|Object|Theme|Attachments|attachments|outputs|explorations|files|Files|assets|Assets)\/[^\s\]\)）"'，。；;]+(?:\.(?:md|pdf|docx?|xlsx?|pptx?|png|jpe?g|gif|webp|svg|txt|csv|json|html?))?(?:#[^\s，。；;]+)?/gi;function wb(t){let e=t.data??{},n=typeof e.materialUrl=="string"?e.materialUrl:"",i=typeof e.materialPath=="string"?e.materialPath:"";return[t.title,t.summary,t.detail,n,i].filter(Boolean).join(`
`)}function Cb(t){return t.replace(/^!/,"").split("|")[0].split("#")[0].trim()}function Sb(t){return t.trim().replace(/[.,，。；;]+$/,"")}function Ab(t){return t.startsWith("/")||t.startsWith("~")?"local_path":"vault_path"}function ps(t,e,n,i,a){let r=Sb(a);if(!r)return;let s=`${i}:${r}`;e.has(s)||(e.add(s),t.push({kind:i,value:r,sourceBlockId:n.id,sourceTitle:n.title}))}function Tb(t){let e=[],n=new Set;return t.forEach(i=>{let a=i.data??{},r=typeof a.materialUrl=="string"?a.materialUrl:"",s=typeof a.materialPath=="string"?a.materialPath:"";r&&ps(e,n,i,"web_url",r),s&&ps(e,n,i,Ab(s),s);let o=wb(i);for(let l of o.matchAll(vb))ps(e,n,i,"web_url",l[0]);for(let l of o.matchAll(bb))ps(e,n,i,"obsidian_link",Cb(l[1]??""));for(let l of o.matchAll(kb))ps(e,n,i,"local_path",l[0]);for(let l of o.matchAll(Eb))ps(e,n,i,"vault_path",l[0])}),e}function Mb(t){switch(t){case"web_url":return"\u7F51\u9875\u94FE\u63A5";case"obsidian_link":return"Obsidian \u94FE\u63A5";case"vault_path":return"Vault \u6587\u4EF6";case"local_path":return"\u672C\u5730\u6587\u4EF6"}}function de(t){let e=Tb(t);return e.length===0?"":["\u5916\u90E8\u6750\u6599\u5904\u7406\u8981\u6C42\uFF1A",...e.map(i=>`- [${Mb(i.kind)}] ${i.value}\uFF08\u6765\u81EA\uFF1A${i.sourceTitle} / ${i.sourceBlockId}\uFF09`),"\u5982\u679C\u4F60\u7684\u8FD0\u884C\u73AF\u5883\u53EF\u4EE5\u8BBF\u95EE\u8FD9\u4E9B\u7F51\u9875\u94FE\u63A5\u3001Obsidian \u94FE\u63A5\u3001Vault \u6587\u4EF6\u6216\u672C\u5730\u6587\u4EF6\uFF0C\u8BF7\u4E3B\u52A8\u8BFB\u53D6/\u89E3\u6790\u5176\u5185\u5BB9\uFF0C\u5E76\u628A\u53EF\u9760\u5185\u5BB9\u4F5C\u4E3A\u672C\u6B21\u601D\u8003\u4E0A\u4E0B\u6587\u3002","\u5982\u679C\u6750\u6599\u662F PDF\u3001Office \u6587\u6863\u3001\u56FE\u7247\u3001\u7F51\u9875\u5FEB\u7167\u6216\u5176\u4ED6\u9644\u4EF6\uFF0C\u8BF7\u4F7F\u7528\u4F60\u53EF\u7528\u7684\u672C\u5730\u5DE5\u5177\u6216 skill \u63D0\u53D6\u6587\u5B57\u3001\u6458\u8981\u6216\u5173\u952E\u4FE1\u606F\u3002","\u5982\u679C\u67D0\u4E2A\u6750\u6599\u65E0\u6CD5\u8BBF\u95EE\u3001\u89E3\u6790\u5931\u8D25\u3001\u8DEF\u5F84\u4E0D\u5B58\u5728\u6216\u6743\u9650\u4E0D\u8DB3\uFF0C\u8BF7\u7EE7\u7EED\u57FA\u4E8E\u5DF2\u7ED9\u51FA\u7684 block \u5185\u5BB9\u5B8C\u6210\u4EFB\u52A1\uFF0C\u4F46\u5FC5\u987B\u5728\u76F8\u5173 block \u7684 detail \u4E2D\u7B80\u77ED\u8BF4\u660E\u300C\u6750\u6599\u672A\u80FD\u8BFB\u53D6\uFF1A\u539F\u56E0\u300D\uFF0C\u5E76\u964D\u4F4E\u7ED3\u8BBA\u786E\u5B9A\u6027\u3002","\u4E0D\u8981\u81C6\u9020\u65E0\u6CD5\u8BFB\u53D6\u7684\u6750\u6599\u5185\u5BB9\uFF1B\u65E0\u6CD5\u786E\u8BA4\u65F6\u660E\u786E\u5199\u6210\u5047\u8BBE\u6216\u5F85\u9A8C\u8BC1\u70B9\u3002"].join(`
`)}function p5(t){let e=t.selectedBlocks.some(a=>a.data?.memoryRetrievalEnabled===!0),n=de(t.selectedBlocks),i=t.selectedBlocks.map(a=>{let r=typeof a.data?.promptHint=="string"?a.data.promptHint.trim():"";return[`### ${a.title}`,a.summary||"",a.detail||"",r?`
\u8865\u5145\u63D0\u793A\u8BCD\uFF1A${r}`:"",a.data?.materialUrl?`materialUrl: ${String(a.data.materialUrl)}`:"",a.data?.materialPath?`materialPath: ${String(a.data.materialPath)}`:""].filter(Boolean).join(`
`).trim()}).join(`

`);return["\u4F60\u662F TraceMind \u601D\u8003\u63A2\u7D22\u4E2D\u7684\u300C\u7834\u9898\u62F7\u95EE\u300D\u601D\u8003\u4EE3\u7406\u3002","\u4F60\u7684\u4EFB\u52A1\u4E0D\u662F\u5B89\u6170\u7528\u6237\uFF0C\u4E5F\u4E0D\u662F\u9A6C\u4E0A\u7ED9\u89E3\u51B3\u65B9\u6848\uFF0C\u800C\u662F\u7528\u82CF\u683C\u62C9\u5E95\u6CD5\u63D0\u51FA\u5C11\u91CF\u6839\u672C\u95EE\u9898\uFF0C\u5E2E\u52A9\u7528\u6237\u770B\u6E05\u771F\u6B63\u503C\u5F97\u8FFD\u95EE\u7684\u65B9\u5411\u3002",`\u62F7\u95EE\u5F3A\u5EA6\uFF1A${t.intensity||"standard"}`,t.userInstruction?`\u7528\u6237\u8865\u5145\u8981\u6C42\uFF1A${t.userInstruction}`:"",e?"\u8BB0\u5FC6\u68C0\u7D22\u8981\u6C42\uFF1ATraceMind \u5DF2\u5728\u8F93\u5165\u6750\u6599\u4E2D\u9644\u52A0\u300C\u76F8\u5173\u8BB0\u5FC6\u4E0A\u4E0B\u6587\u300D\u3002\u8BF7\u4F18\u5148\u4F7F\u7528\u8FD9\u4E9B\u76F8\u5173\u65E5\u8BB0\u3001Person/Object/Theme \u5B9E\u4F53\u6863\u6848\u7EBF\u7D22\u6765\u63D0\u51FA\u95EE\u9898\uFF1B\u5982\u679C\u76F8\u5173\u8BB0\u5FC6\u4E0D\u8DB3\uFF0C\u518D\u56DE\u5230\u539F\u59CB\u8F93\u5165\u6750\u6599\uFF0C\u4E0D\u8981\u6CDB\u6CDB\u53D1\u6325\u3002":"",n,"","\u8BF7\u4E25\u683C\u751F\u6210 JSON\uFF0C\u4E0D\u8981\u8F93\u51FA Markdown\uFF0C\u4E0D\u8981\u89E3\u91CA JSON \u5916\u7684\u5185\u5BB9\u3002","\u8F93\u51FA\u5FC5\u987B\u7B26\u5408\uFF1Amethod=frame_problem\uFF0Clayout.mode=radial\uFF0Cblocks \u5FC5\u987B\u6070\u597D 5 \u4E2A\u3002","","\u6BCF\u4E2A block \u90FD\u662F\u4E00\u4E2A\u4E00\u53E5\u8BDD\u95EE\u9898\uFF0C\u5FC5\u987B\u4ECE\u4EE5\u4E0B\u4E94\u4E2A\u62F7\u95EE\u7EF4\u5EA6\u51FA\u53D1\uFF1A","1. \u62F7\u95EE\u672C\u8D28 \u2014 \u8FD9\u4E2A\u95EE\u9898\u7684\u6838\u5FC3\u5230\u5E95\u662F\u4EC0\u4E48\uFF1F\u5265\u5F00\u8868\u9762\u770B\u672C\u8D28\u3002","2. \u62F7\u95EE\u52A8\u673A \u2014 \u4E3A\u4EC0\u4E48\u8FD9\u4E2A\u95EE\u9898\u73B0\u5728\u503C\u5F97\u8FFD\u95EE\uFF1F\u9A71\u52A8\u529B\u662F\u4EC0\u4E48\uFF1F","3. \u62F7\u95EE\u5047\u8BBE \u2014 \u4F60\u9ED8\u8BA4\u6210\u7ACB\u4F46\u4ECE\u672A\u68C0\u9A8C\u7684\u524D\u63D0\u662F\u4EC0\u4E48\uFF1F","4. \u62F7\u95EE\u53CD\u9762 \u2014 \u5982\u679C\u53CD\u8FC7\u6765\u6210\u7ACB\u4F1A\u600E\u6837\uFF1F\u8003\u8651\u5BF9\u7ACB\u9762\u3002","5. \u62F7\u95EE\u884C\u52A8 \u2014 \u6700\u5C0F\u53EF\u9A8C\u8BC1\u7684\u4E00\u6B65\u884C\u52A8\u662F\u4EC0\u4E48\uFF1F","","\u6BCF\u4E2A block\uFF1A",'- category \u5FC5\u987B\u662F "thinking"','- type \u5FC5\u987B\u662F "frame_question"',"- title \u5FC5\u987B\u56FA\u5B9A\u4E3A\uFF1A`\u7834\u9898\u62F7\u95EE 1`\u3001`\u7834\u9898\u62F7\u95EE 2`\u3001`\u7834\u9898\u62F7\u95EE 3`\u3001`\u7834\u9898\u62F7\u95EE 4`\u3001`\u7834\u9898\u62F7\u95EE 5`","- summary \u586B\u4E00\u53E5\u8BDD\u95EE\u9898\uFF0C\u4E0D\u542B\u201C\u62F7\u95EE\u672C\u8D28/\u52A8\u673A/\u5047\u8BBE/\u53CD\u9762/\u884C\u52A8\u201D\u7B49\u524D\u7F00","- data.dimension \u5FC5\u987B\u4F9D\u6B21\u4E3A\uFF1Aessence\u3001motive\u3001assumption\u3001opposite\u3001action","- \u4E0D\u8981\u5199 bullets","- \u4E0D\u8981\u5199\u5206\u6790\u3001\u89E3\u91CA\u3001\u5EFA\u8BAE\u3001\u7ED3\u8BBA","","Block type \u53EA\u80FD\u4F7F\u7528: frame_question","\u4E0D\u8981\u8FD4\u56DE suggested next actions\uFF0C\u4E0B\u4E00\u6B65\u7531\u7528\u6237\u81EA\u4E3B\u9009\u62E9\u3002","\u6BCF\u4E2A\u95EE\u9898\u5FC5\u987B\u7B80\u77ED\u3001\u5C16\u9510\u3001\u80FD\u63A8\u52A8\u7528\u6237\u53CD\u601D\uFF0C\u95EE\u9898\u5185\u5BB9\u4E0D\u8D85\u8FC7 15 \u5B57\u3002","\u4E94\u4E2A\u7EF4\u5EA6\u7F3A\u4E00\u4E0D\u53EF\uFF0C\u6BCF\u4E2A\u7EF4\u5EA6\u5FC5\u987B\u5BF9\u5E94\u4E00\u4E2A block\u3002",'JSON \u5B57\u7B26\u4E32\u5185\u4E0D\u5F97\u51FA\u73B0 ASCII \u53CC\u5F15\u53F7 "\uFF0C\u8BF7\u7528\u4E2D\u6587\u5F15\u53F7 "" \u6216 \u300C\u300D \u66FF\u4EE3\uFF0C\u5426\u5219 JSON \u4F1A\u89E3\u6790\u5931\u8D25\u3002',"","\u8F93\u5165\u6750\u6599\uFF1A",i].filter(Boolean).join(`
`)}function f5(t){let e=t.selectedBlocks.some(a=>a.data?.memoryRetrievalEnabled===!0),n=de(t.selectedBlocks),i=t.selectedBlocks.map(a=>{let r=typeof a.data?.promptHint=="string"?a.data.promptHint.trim():"";return[`### ${a.title}`,`type: ${a.type}`,a.summary||"",a.detail||"",r?`\u8865\u5145\u63D0\u793A\u8BCD\uFF1A${r}`:"",a.data?.materialUrl?`materialUrl: ${String(a.data.materialUrl)}`:"",a.data?.materialPath?`materialPath: ${String(a.data.materialPath)}`:""].filter(Boolean).join(`
`)}).join(`

---

`);return["\u4F60\u662F TraceMind \u601D\u8003\u63A2\u7D22\u4E2D\u7684\u300C\u5934\u8111\u98CE\u66B4\u300D\u601D\u8003\u4EE3\u7406\u3002","\u4F60\u7684\u4EFB\u52A1\u662F\u56F4\u7ED5\u7528\u6237\u9009\u4E2D\u7684 block \u548C\u6750\u6599\u505A\u53D7\u63A7\u53D1\u6563\uFF0C\u751F\u6210\u5C11\u91CF\u8D34\u8FD1\u539F\u4E3B\u9898\u7684\u65B0\u65B9\u5411\uFF0C\u4E0D\u8981\u505A\u957F\u7BC7\u5206\u6790\u3002",t.userInstruction?`\u7528\u6237\u8865\u5145\u8981\u6C42\uFF1A${t.userInstruction}`:"",e?"\u8BB0\u5FC6\u68C0\u7D22\u8981\u6C42\uFF1ATraceMind \u5DF2\u5728\u8F93\u5165\u6750\u6599\u4E2D\u9644\u52A0\u300C\u76F8\u5173\u8BB0\u5FC6\u4E0A\u4E0B\u6587\u300D\u3002\u8BF7\u4F18\u5148\u57FA\u4E8E\u8FD9\u4E9B\u76F8\u5173\u65E5\u8BB0\u3001Person/Object/Theme \u5B9E\u4F53\u6863\u6848\u7EBF\u7D22\u505A\u53D7\u63A7\u53D1\u6563\uFF1B\u5982\u679C\u76F8\u5173\u8BB0\u5FC6\u4E0D\u8DB3\uFF0C\u5C31\u56DE\u5230\u8F93\u5165\u6750\u6599\u672C\u8EAB\uFF0C\u4E0D\u8981\u7F16\u9020\u80CC\u666F\u3002":"",n,"","\u8BF7\u4E25\u683C\u751F\u6210 JSON\uFF0C\u4E0D\u8981\u8F93\u51FA Markdown\uFF0C\u4E0D\u8981\u89E3\u91CA JSON \u5916\u7684\u5185\u5BB9\u3002","\u8F93\u51FA\u5FC5\u987B\u7B26\u5408\uFF1Amethod=brainstorming\uFF0Clayout.mode=cluster\uFF0Cblocks \u751F\u6210 5 \u4E2A\u4EE5\u5185\u3002","","\u6838\u5FC3\u7EA6\u675F\uFF1A","- \u6BCF\u4E2A\u60F3\u6CD5\u90FD\u5FC5\u987B\u76F4\u63A5\u56DE\u5E94\u8F93\u5165\u6750\u6599\u4E2D\u7684\u4E00\u4E2A\u5177\u4F53\u7EBF\u7D22\u3001\u5173\u952E\u8BCD\u3001\u95EE\u9898\u6216\u51B2\u7A81\u3002","- \u4E0D\u8981\u8DF3\u5230\u8F93\u5165\u6750\u6599\u6CA1\u6709\u51FA\u73B0\u7684\u65B0\u884C\u4E1A\u3001\u65B0\u4EBA\u7FA4\u3001\u65B0\u5546\u4E1A\u6A21\u5F0F\u6216\u65B0\u6280\u672F\u3002","- \u53EF\u4EE5\u6362\u89D2\u5EA6\uFF0C\u4F46\u5FC5\u987B\u80FD\u7528\u4E00\u53E5\u8BDD\u8BF4\u660E\u5B83\u548C\u539F\u4E3B\u9898\u7684\u5173\u7CFB\u3002","- \u5982\u679C\u6750\u6599\u4FE1\u606F\u4E0D\u8DB3\uFF0C\u4F18\u5148\u63D0\u51FA\u66F4\u8D34\u8FD1\u539F\u6587\u7684\u89C2\u5BDF\u6216\u9A8C\u8BC1\u52A8\u4F5C\uFF0C\u4E0D\u8981\u7F16\u9020\u80CC\u666F\u3002","- detail \u7B2C\u4E00\u77ED\u53E5\u5FC5\u987B\u5199\u660E\u300C\u5173\u8054\u7EBF\u7D22\uFF1A...\u300D\uFF0C\u6307\u51FA\u5B83\u6765\u81EA\u8F93\u5165\u6750\u6599\u7684\u54EA\u4E2A\u5177\u4F53\u70B9\u3002","","\u5934\u8111\u98CE\u66B4\u65B9\u5411\u5EFA\u8BAE\u8986\u76D6\uFF1A","1. \u53EF\u80FD\u65B9\u5411 \u2014 \u4E00\u4E2A\u65B0\u7684\u5207\u5165\u89D2\u5EA6\u3002","2. \u65B0\u7EC4\u5408 \u2014 \u628A\u5DF2\u6709\u6750\u6599\u6216\u60F3\u6CD5\u91CD\u65B0\u7EC4\u5408\u3002","3. \u53CD\u5E38\u8BC6\u60F3\u6CD5 \u2014 \u770B\u8D77\u6765\u4E0D\u5E38\u89C4\u4F46\u503C\u5F97\u60F3\u4E00\u4E0B\u3002","4. \u6700\u5C0F\u884C\u52A8 \u2014 \u53EF\u4EE5\u7ACB\u523B\u8BD5\u7684\u5C0F\u52A8\u4F5C\u3002","5. \u547D\u540D\u8868\u8FBE \u2014 \u66F4\u6E05\u695A\u7684\u8868\u8FBE\u3001\u6807\u9898\u6216\u6982\u5FF5\u547D\u540D\u3002","","\u6BCF\u4E2A block\uFF1A",'- category \u5FC5\u987B\u662F "thinking"','- type \u4F7F\u7528 "insight" \u6216 "experiment"',"- title \u4E0D\u8D85\u8FC7 18 \u4E2A\u4E2D\u6587\u5B57","- summary \u7528\u4E00\u53E5\u8BDD\u8BF4\u660E\u8FD9\u4E2A\u60F3\u6CD5","- detail \u63A7\u5236\u5728 140 \u4E2A\u4E2D\u6587\u5B57\u4EE5\u5185\uFF0C\u7B2C\u4E00\u77ED\u53E5\u5FC5\u987B\u4EE5\u300C\u5173\u8054\u7EBF\u7D22\uFF1A\u300D\u5F00\u5934","- data.dimension \u53EF\u4F7F\u7528 direction\u3001combination\u3001contrarian\u3001action\u3001naming","- data.anchor \u586B\u5199\u8F93\u5165\u6750\u6599\u4E2D\u7684\u5173\u952E\u8BCD\u6216\u77ED\u53E5","- \u4E0D\u8981\u8FD4\u56DE suggested next actions\uFF0C\u4E0B\u4E00\u6B65\u7531\u7528\u6237\u81EA\u4E3B\u9009\u62E9","",'JSON \u5B57\u7B26\u4E32\u5185\u4E0D\u5F97\u51FA\u73B0 ASCII \u53CC\u5F15\u53F7 "\uFF0C\u8BF7\u7528\u4E2D\u6587\u5F15\u53F7 "" \u6216 \u300C\u300D \u4EE3\u66FF\uFF0C\u5426\u5219 JSON \u4F1A\u89E3\u6790\u5931\u8D25\u3002',"","\u8F93\u5165\u6750\u6599\uFF1A",i||"\uFF08\u65E0\uFF09"].filter(Boolean).join(`
`)}function h5(t){let e=t.selectedBlocks.some(a=>a.data?.memoryRetrievalEnabled===!0),n=de(t.selectedBlocks),i=t.selectedBlocks.map(a=>{let r=typeof a.data?.promptHint=="string"?a.data.promptHint.trim():"";return[`### ${a.title}`,`type: ${a.type}`,a.summary||"",a.detail||"",r?`\u8865\u5145\u63D0\u793A\u8BCD\uFF1A${r}`:"",a.data?.materialUrl?`materialUrl: ${String(a.data.materialUrl)}`:"",a.data?.materialPath?`materialPath: ${String(a.data.materialPath)}`:""].filter(Boolean).join(`
`)}).join(`

---

`);return["\u4F60\u662F TraceMind \u601D\u8003\u63A2\u7D22\u4E2D\u7684\u300C\u601D\u7EF4\u5BFC\u56FE\u300D\u601D\u8003\u4EE3\u7406\u3002","\u4F60\u7684\u4EFB\u52A1\u662F\u56F4\u7ED5\u7528\u6237\u9009\u4E2D\u7684 block \u548C\u6750\u6599\uFF0C\u628A\u4E3B\u9898\u62C6\u89E3\u6210\u6E05\u6670\u7684\u4E24\u5C42\u7ED3\u6784\uFF0C\u5E2E\u52A9\u7528\u6237\u770B\u6E05\u4E3B\u9898\u7531\u54EA\u4E9B\u5173\u952E\u5206\u652F\u548C\u8981\u70B9\u7EC4\u6210\u3002",t.userInstruction?`\u7528\u6237\u8865\u5145\u8981\u6C42\uFF1A${t.userInstruction}`:"",e?"\u8BB0\u5FC6\u68C0\u7D22\u8981\u6C42\uFF1ATraceMind \u5DF2\u5728\u8F93\u5165\u6750\u6599\u4E2D\u9644\u52A0\u300C\u76F8\u5173\u8BB0\u5FC6\u4E0A\u4E0B\u6587\u300D\u3002\u8BF7\u4F18\u5148\u57FA\u4E8E\u8FD9\u4E9B\u76F8\u5173\u65E5\u8BB0\u3001Person/Object/Theme \u5B9E\u4F53\u6863\u6848\u7EBF\u7D22\u62C6\u89E3\u4E3B\u9898\uFF1B\u5982\u679C\u76F8\u5173\u8BB0\u5FC6\u4E0D\u8DB3\uFF0C\u5C31\u56DE\u5230\u8F93\u5165\u6750\u6599\u672C\u8EAB\uFF0C\u4E0D\u8981\u7F16\u9020\u80CC\u666F\u3002":"",n,"","\u8BF7\u4E25\u683C\u751F\u6210 JSON\uFF0C\u4E0D\u8981\u8F93\u51FA Markdown\uFF0C\u4E0D\u8981\u89E3\u91CA JSON \u5916\u7684\u5185\u5BB9\u3002","\u8F93\u51FA\u5FC5\u987B\u7B26\u5408\uFF1Amethod=mind_map\uFF0Clayout.mode=mind_map\u3002","","\u89C4\u6A21\u89C4\u5219\uFF1A","- \u9ED8\u8BA4\u751F\u6210 6-10 \u4E2A\u4E00\u7EA7\u5206\u652F\uFF1B\u5982\u679C\u7528\u6237\u8865\u5145\u63D0\u793A\u8BCD\u8981\u6C42\u5B8C\u6574\u62C6\u89E3\u3001\u5C3D\u91CF\u5C55\u5F00\u3001\u751F\u6210\u66F4\u591A\u5206\u652F\uFF0C\u53EF\u4EE5\u751F\u6210 10-20 \u4E2A\u4E00\u7EA7\u5206\u652F\u3002","- \u6BCF\u4E2A\u4E00\u7EA7\u5206\u652F\u9ED8\u8BA4\u751F\u6210 2-5 \u4E2A\u4E8C\u7EA7\u8282\u70B9\uFF0C\u6700\u591A 10 \u4E2A\u3002","- \u7B2C\u4E00\u7248\u4E0D\u8981\u751F\u6210\u4E09\u7EA7\u8282\u70B9\u3002","- \u603B block \u6570\u6700\u591A 220 \u4E2A\uFF0C\u4F46\u4E0D\u8981\u673A\u68B0\u8FFD\u6EE1\u4E0A\u9650\u3002","","\u7ED3\u6784\u89C4\u5219\uFF1A","- source block \u662F\u4E2D\u5FC3\u4E3B\u9898\uFF0C\u4E0D\u8981\u989D\u5916\u751F\u6210\u4E2D\u5FC3 block\u3002",'- \u4E00\u7EA7\u5206\u652F block\uFF1Adata.level=1\uFF0Cdata.role="branch"\u3002','- \u4E8C\u7EA7\u8282\u70B9 block\uFF1Adata.level=2\uFF0Cdata.role="leaf"\uFF0Cdata.parentId \u5FC5\u987B\u586B\u5199\u6240\u5C5E\u4E00\u7EA7\u5206\u652F\u7684 id\u3002',"- \u6BCF\u4E2A\u4E8C\u7EA7\u8282\u70B9\u53EA\u80FD\u5F52\u5C5E\u4E8E\u4E00\u4E2A\u4E00\u7EA7\u5206\u652F\u3002","- \u4E00\u7EA7\u5206\u652F\u4E4B\u95F4\u5FC5\u987B\u4E92\u76F8\u533A\u5206\uFF0C\u4E0D\u8981\u91CD\u590D\u6362\u8BCD\u3002","- \u4E8C\u7EA7\u8282\u70B9\u5FC5\u987B\u5177\u4F53\u8BF4\u660E\u8BE5\u5206\u652F\u4E0B\u7684\u5173\u952E\u8981\u70B9\uFF0C\u4E0D\u8981\u5199\u7A7A\u6CDB\u6982\u5FF5\u3002","","Block \u89C4\u5219\uFF1A",'- category \u5FC5\u987B\u662F "thinking"','- type \u4F7F\u7528 "insight" \u6216 "task"',"- title \u4E0D\u8D85\u8FC7 16 \u4E2A\u4E2D\u6587\u5B57\uFF0C\u5EFA\u8BAE\u4F7F\u7528\u77ED\u6807\u9898","- summary \u7528\u4E00\u53E5\u8BDD\u8868\u8FBE\u8282\u70B9\u5185\u5BB9","- detail \u63A7\u5236\u5728 160 \u4E2A\u4E2D\u6587\u5B57\u4EE5\u5185\uFF0C\u53EF\u4EE5\u5199\u62C6\u89E3\u4F9D\u636E\u6216\u8FB9\u754C\u8BF4\u660E","- data.anchor \u586B\u5199\u8F93\u5165\u6750\u6599\u4E2D\u7684\u5173\u952E\u8BCD\u6216\u77ED\u53E5","","Edge \u89C4\u5219\uFF1A","- edges \u53EA\u9700\u8981\u8FD4\u56DE\u4E00\u7EA7\u5206\u652F\u5230\u4E8C\u7EA7\u8282\u70B9\u7684\u8FDE\u7EBF\uFF0Ctype \u4F7F\u7528 leads_to\u3002","- \u4E0D\u8981\u8FD4\u56DE source block \u5230\u4E00\u7EA7\u5206\u652F\u7684\u8FDE\u7EBF\uFF0CTraceMind \u4F1A\u81EA\u52A8\u8865\u5145\u3002","- \u6BCF\u6761 edge \u9876\u5C42\u5FC5\u987B\u5305\u542B from\u3001to\u3001type\u3002","- edges \u5FC5\u987B\u4F7F\u7528 from/to \u5B57\u6BB5\uFF0C\u4E0D\u8981\u4F7F\u7528 source/target \u5B57\u6BB5\u3002","- \u4E0D\u8981\u8FD4\u56DE suggested next actions\uFF0C\u4E0B\u4E00\u6B65\u7531\u7528\u6237\u81EA\u4E3B\u9009\u62E9\u3002","",'JSON \u5B57\u7B26\u4E32\u5185\u4E0D\u5F97\u51FA\u73B0 ASCII \u53CC\u5F15\u53F7 "\uFF0C\u8BF7\u7528\u4E2D\u6587\u5F15\u53F7 "" \u6216 \u300C\u300D \u4EE3\u66FF\uFF0C\u5426\u5219 JSON \u4F1A\u89E3\u6790\u5931\u8D25\u3002',"","\u8F93\u5165\u6750\u6599\uFF1A",i||"\uFF08\u65E0\uFF09"].filter(Boolean).join(`
`)}function g5(t){let e=t.selectedBlocks.some(a=>a.data?.memoryRetrievalEnabled===!0),n=de(t.selectedBlocks),i=t.selectedBlocks.map(a=>{let r=typeof a.data?.promptHint=="string"?a.data.promptHint.trim():"";return[`### ${a.title}`,`type: ${a.type}`,a.summary||"",a.detail||"",r?`\u8865\u5145\u63D0\u793A\u8BCD\uFF1A${r}`:"",a.data?.materialUrl?`materialUrl: ${String(a.data.materialUrl)}`:"",a.data?.materialPath?`materialPath: ${String(a.data.materialPath)}`:""].filter(Boolean).join(`
`)}).join(`

---

`);return["\u4F60\u662F TraceMind \u601D\u8003\u63A2\u7D22\u4E2D\u7684\u300C\u51B3\u7B56\u6811\u300D\u6218\u7565\u5206\u6790\u4EE3\u7406\u3002","\u4F60\u7684\u4EFB\u52A1\u662F\u628A\u7528\u6237\u9009\u4E2D\u7684\u6750\u6599\u6574\u7406\u6210\u4E00\u4E2A\u53EF\u89C6\u5316\u51B3\u7B56\u6811\uFF0C\u5E2E\u52A9\u7528\u6237\u770B\u6E05\u6218\u7565\u9009\u62E9\u3001\u4EA7\u54C1\u53D6\u820D\u6216\u5173\u952E\u5224\u65AD\u3002",t.userInstruction?`\u7528\u6237\u8865\u5145\u8981\u6C42\uFF1A${t.userInstruction}`:"",e?"\u8BB0\u5FC6\u68C0\u7D22\u8981\u6C42\uFF1ATraceMind \u5DF2\u5728\u8F93\u5165\u6750\u6599\u4E2D\u9644\u52A0\u300C\u76F8\u5173\u8BB0\u5FC6\u4E0A\u4E0B\u6587\u300D\u3002\u8BF7\u4F18\u5148\u57FA\u4E8E\u8FD9\u4E9B\u76F8\u5173\u65E5\u8BB0\u3001Person/Object/Theme \u5B9E\u4F53\u6863\u6848\u7EBF\u7D22\u505A\u5224\u65AD\uFF1B\u5982\u679C\u76F8\u5173\u8BB0\u5FC6\u4E0D\u8DB3\uFF0C\u5C31\u56DE\u5230\u8F93\u5165\u6750\u6599\u672C\u8EAB\uFF0C\u4E0D\u8981\u7F16\u9020\u80CC\u666F\u3002":"",n,"","\u8BF7\u4E25\u683C\u751F\u6210 JSON\uFF0C\u4E0D\u8981\u8F93\u51FA Markdown\uFF0C\u4E0D\u8981\u89E3\u91CA JSON \u5916\u7684\u5185\u5BB9\u3002","\u8F93\u51FA\u5FC5\u987B\u7B26\u5408\uFF1Amethod=decision_tree\uFF0Clayout.mode=decision_tree\uFF0Cblocks \u751F\u6210 5-8 \u4E2A\u3002","","\u51B3\u7B56\u6811\u5FC5\u987B\u5305\u542B\uFF1A","1. \u51B3\u7B56\u95EE\u9898\uFF1A\u7528\u6237\u5F53\u524D\u771F\u6B63\u8981\u5224\u65AD\u7684\u9009\u62E9\u3002","2. \u65B9\u6848\uFF1A2-3 \u4E2A\u53EF\u6BD4\u8F83\u7684\u9009\u9879\u3002","3. \u5173\u952E\u5047\u8BBE\u6216\u98CE\u9669\uFF1A\u6BCF\u4E2A\u91CD\u8981\u65B9\u6848\u81F3\u5C11\u4E00\u4E2A\u5224\u65AD\u70B9\u3002","4. \u6700\u5C0F\u9A8C\u8BC1\uFF1A\u80FD\u591F\u63A8\u52A8\u4E0B\u4E00\u6B65\u5224\u65AD\u7684\u5C0F\u5B9E\u9A8C\u6216\u884C\u52A8\u3002","","\u6838\u5FC3\u7EA6\u675F\uFF1A","- \u4E0D\u8981\u66FF\u7528\u6237\u505A\u6700\u7EC8\u51B3\u5B9A\uFF1B\u53EA\u628A\u9009\u62E9\u7ED3\u6784\u5316\u3002","- \u65B9\u6848\u5FC5\u987B\u6765\u81EA\u8F93\u5165\u6750\u6599\uFF0C\u4E0D\u8981\u53D1\u6563\u5230\u65E0\u5173\u6218\u7565\u3002","- \u6BCF\u4E2A block \u53EA\u8868\u8FBE\u4E00\u4E2A\u5224\u65AD\u70B9\u3002","- \u6BCF\u4E2A block \u9876\u5C42\u5FC5\u987B\u5305\u542B title\u3001summary\u3001detail\uFF0C\u4E0D\u8981\u628A summary/detail \u653E\u8FDB data\u3002","- summary \u7528\u4E00\u53E5\u8BDD\uFF0Cdetail \u63A7\u5236\u5728 160 \u4E2A\u4E2D\u6587\u5B57\u4EE5\u5185\u3002","- detail \u7B2C\u4E00\u77ED\u53E5\u5EFA\u8BAE\u5199\u300C\u5224\u65AD\u4F9D\u636E\uFF1A...\u300D\uFF0C\u8BF4\u660E\u6765\u81EA\u8F93\u5165\u6750\u6599\u7684\u7EBF\u7D22\u3002","","Block type \u53EA\u80FD\u4F7F\u7528\uFF1A","- decision\uFF1A\u51B3\u7B56\u95EE\u9898\u3001\u65B9\u6848\u6216\u5224\u65AD\u8282\u70B9","- risk\uFF1A\u98CE\u9669\u3001\u4EE3\u4EF7\u3001\u53CD\u9762\u6761\u4EF6","- assumption\uFF1A\u5173\u952E\u5047\u8BBE","- experiment\uFF1A\u6700\u5C0F\u9A8C\u8BC1\u52A8\u4F5C","","data.role \u53EF\u4F7F\u7528\uFF1Adecision_question\u3001option\u3001assumption\u3001risk\u3001validation\u3002","\u6BCF\u6761 edge \u9876\u5C42\u5FC5\u987B\u5305\u542B from\u3001to\u3001type\u3002","edges \u5FC5\u987B\u4F7F\u7528 from/to \u5B57\u6BB5\uFF0C\u4E0D\u8981\u4F7F\u7528 source/target \u5B57\u6BB5\u3002","edges \u7528 leads_to \u8868\u793A\u51B3\u7B56\u5C55\u5F00\uFF0C\u7528 challenges \u8868\u793A\u98CE\u9669\u6311\u6218\uFF0C\u7528 supports \u8868\u793A\u5047\u8BBE\u652F\u6301\uFF0C\u7528 next_step \u8868\u793A\u9A8C\u8BC1\u52A8\u4F5C\u3002","\u4E0D\u8981\u8FD4\u56DE suggested next actions\uFF0C\u4E0B\u4E00\u6B65\u7531\u7528\u6237\u81EA\u4E3B\u9009\u62E9\u3002","",'JSON \u5B57\u7B26\u4E32\u5185\u4E0D\u5F97\u51FA\u73B0 ASCII \u53CC\u5F15\u53F7 "\uFF0C\u8BF7\u7528\u4E2D\u6587\u5F15\u53F7 "" \u6216 \u300C\u300D \u4EE3\u66FF\uFF0C\u5426\u5219 JSON \u4F1A\u89E3\u6790\u5931\u8D25\u3002',"","\u8F93\u5165\u6750\u6599\uFF1A",i||"\uFF08\u65E0\uFF09"].filter(Boolean).join(`
`)}function m5(t){let e=t.selectedBlocks.some(a=>a.data?.memoryRetrievalEnabled===!0),n=de(t.selectedBlocks),i=t.selectedBlocks.map(a=>{let r=typeof a.data?.promptHint=="string"?a.data.promptHint.trim():"";return[`### ${a.title}`,`type: ${a.type}`,a.summary||"",a.detail||"",r?`\u8865\u5145\u63D0\u793A\u8BCD\uFF1A${r}`:"",a.data?.materialUrl?`materialUrl: ${String(a.data.materialUrl)}`:"",a.data?.materialPath?`materialPath: ${String(a.data.materialPath)}`:""].filter(Boolean).join(`
`)}).join(`

---

`);return["\u4F60\u662F TraceMind \u601D\u8003\u63A2\u7D22\u4E2D\u7684\u300C\u7528\u6237\u5730\u56FE\u300D\u4EA7\u54C1\u5206\u6790\u4EE3\u7406\u3002","\u4F60\u7684\u4EFB\u52A1\u662F\u57FA\u4E8E\u7528\u6237\u9009\u4E2D\u7684\u65E5\u8BB0\u3001\u6863\u6848\u3001\u6750\u6599\u6216\u5206\u7EC4\uFF0C\u6BD4\u8F83\u591A\u7C7B\u5019\u9009\u76EE\u6807\u7528\u6237\uFF0C\u5E2E\u52A9\u7528\u6237\u5224\u65AD\u4EA7\u54C1/\u529F\u80FD/\u65B9\u6848\u6700\u5148\u5E94\u8BE5\u670D\u52A1\u8C01\u3002",t.userInstruction?`\u7528\u6237\u8865\u5145\u8981\u6C42\uFF1A${t.userInstruction}`:"",e?"\u8BB0\u5FC6\u68C0\u7D22\u8981\u6C42\uFF1ATraceMind \u5DF2\u5728\u8F93\u5165\u6750\u6599\u4E2D\u9644\u52A0\u300C\u76F8\u5173\u8BB0\u5FC6\u4E0A\u4E0B\u6587\u300D\u3002\u8BF7\u4F18\u5148\u57FA\u4E8E\u8FD9\u4E9B\u76F8\u5173\u65E5\u8BB0\u3001Person/Object/Theme \u5B9E\u4F53\u6863\u6848\u7EBF\u7D22\u5206\u6790\u7528\u6237\uFF1B\u5982\u679C\u76F8\u5173\u8BB0\u5FC6\u4E0D\u8DB3\uFF0C\u5C31\u56DE\u5230\u8F93\u5165\u6750\u6599\u672C\u8EAB\uFF0C\u4E0D\u8981\u7F16\u9020\u80CC\u666F\u3002":"",n,"","\u8BF7\u4E25\u683C\u751F\u6210 JSON\uFF0C\u4E0D\u8981\u8F93\u51FA Markdown\uFF0C\u4E0D\u8981\u89E3\u91CA JSON \u5916\u7684\u5185\u5BB9\u3002","\u8F93\u51FA\u5FC5\u987B\u7B26\u5408\uFF1Amethod=user_map\uFF0Clayout.mode=user_map\uFF0Cblocks \u5FC5\u987B\u751F\u6210 15 \u4E2A\u3002","","\u7528\u6237\u5730\u56FE\u5FC5\u987B\u91C7\u7528 3 \u884C \xD7 5 \u5217\u77E9\u9635\uFF1A","1. \u9009\u62E9 3 \u7C7B\u5019\u9009\u76EE\u6807\u7528\u6237\u3002","2. \u6BCF\u7C7B\u7528\u6237\u751F\u6210 5 \u4E2A block\uFF1Atarget_user\u3001scenario\u3001job\u3001pain\u3001value\u3002","3. target_user \u8BF4\u660E\u8FD9\u7C7B\u7528\u6237\u662F\u8C01\uFF0C\u4EE5\u53CA\u4E3A\u4EC0\u4E48\u53EF\u80FD\u503C\u5F97\u4F18\u5148\u670D\u52A1\u3002","4. scenario \u8BF4\u660E\u8FD9\u7C7B\u7528\u6237\u5728\u4EC0\u4E48\u60C5\u5883\u4E0B\u89E6\u53D1\u9700\u6C42\u3002","5. job \u8BF4\u660E\u8FD9\u7C7B\u7528\u6237\u771F\u6B63\u60F3\u5B8C\u6210\u7684\u4EFB\u52A1\u3002","6. pain \u8BF4\u660E\u8FD9\u7C7B\u7528\u6237\u5F53\u524D\u7684\u75DB\u70B9\u548C\u963B\u788D\u3002","7. value \u8BF4\u660E\u4EA7\u54C1\u673A\u4F1A\u548C\u6700\u5C0F\u9A8C\u8BC1\u95EE\u9898\u3002","8. \u6BCF\u4E00\u884C\u662F\u4E00\u7C7B\u7528\u6237\uFF1A\u76EE\u6807\u7528\u6237 -> \u573A\u666F -> \u4EFB\u52A1 -> \u75DB\u70B9 -> \u4EF7\u503C\u673A\u4F1A\u3002","","\u6838\u5FC3\u7EA6\u675F\uFF1A","- \u4E0D\u8981\u751F\u6210\u6CDB\u6CDB persona\uFF0C\u4E0D\u8981\u7F16\u9020\u5E74\u9F84\u3001\u804C\u4E1A\u3001\u6536\u5165\u7B49\u6CA1\u6709\u4F9D\u636E\u7684\u4EBA\u53E3\u7EDF\u8BA1\u4FE1\u606F\u3002","- \u6BCF\u4E2A\u5224\u65AD\u90FD\u5FC5\u987B\u76F4\u63A5\u56DE\u5E94\u8F93\u5165\u6750\u6599\u4E2D\u7684\u4E00\u4E2A\u5177\u4F53\u7EBF\u7D22\u3001\u5173\u952E\u8BCD\u3001\u95EE\u9898\u6216\u51B2\u7A81\u3002","- \u5982\u679C\u6750\u6599\u4E0D\u8DB3\uFF0C\u5E94\u628A\u7ED3\u8BBA\u5199\u6210\u5F85\u9A8C\u8BC1\u5047\u8BBE\uFF0C\u4E0D\u8981\u5199\u6210\u5DF2\u7ECF\u88AB\u8C03\u7814\u8BC1\u660E\u7684\u4E8B\u5B9E\u3002","- \u4E0D\u8981\u53EA\u5206\u6790\u5355\u4E00\u76EE\u6807\u7528\u6237\uFF1B\u5FC5\u987B\u6BD4\u8F83 3 \u7C7B\u4E0D\u540C\u5019\u9009\u7528\u6237\u3002","- \u6BCF\u4E00\u884C\u5FC5\u987B\u4F7F\u7528\u540C\u4E00\u4E2A data.userSegment\u3002","- \u6BCF\u4E2A block \u53EA\u670D\u52A1\u540C\u4E00\u884C\u7684\u5019\u9009\u7528\u6237\u3002","- \u6BCF\u4E2A block \u9876\u5C42\u5FC5\u987B\u5305\u542B title\u3001summary\u3001detail\uFF0C\u4E0D\u8981\u628A summary/detail \u653E\u8FDB data\u3002","- \u6BCF\u4E2A block \u9876\u5C42\u5FC5\u987B\u5305\u542B type\uFF0C\u4E0D\u8981\u628A type \u653E\u8FDB data\u3002","- title \u5FC5\u987B\u4F7F\u7528\u56FA\u5B9A\u77ED\u6807\u9898\uFF0C\u4E0D\u8981\u52A0\u5165\u7528\u6237\u540D\u79F0\u6216\u8BF4\u660E\uFF1A\u7B2C 1 \u884C\u4F7F\u7528\u300C\u76EE\u6807\u7528\u6237 A\u300D\u300C\u573A\u666F A\u300D\u300C\u4EFB\u52A1 A\u300D\u300C\u75DB\u70B9 A\u300D\u300C\u4EF7\u503C A\u300D\uFF1B\u7B2C 2 \u884C\u4F7F\u7528 B\uFF1B\u7B2C 3 \u884C\u4F7F\u7528 C\u3002","- summary \u7528\u4E00\u53E5\u8BDD\uFF0Cdetail \u63A7\u5236\u5728 220 \u4E2A\u4E2D\u6587\u5B57\u4EE5\u5185\u3002","- detail \u7B2C\u4E00\u77ED\u53E5\u5EFA\u8BAE\u5199\u300C\u4F9D\u636E\uFF1A...\u300D\uFF0C\u8BF4\u660E\u6765\u81EA\u8F93\u5165\u6750\u6599\u7684\u7EBF\u7D22\u3002","","Block type \u53EA\u80FD\u4F7F\u7528\uFF1A","- insight\uFF1A\u76EE\u6807\u7528\u6237\u3001\u4F7F\u7528\u573A\u666F\u3001\u4EF7\u503C\u673A\u4F1A","- task\uFF1A\u6838\u5FC3\u4EFB\u52A1","- risk\uFF1A\u75DB\u70B9\u963B\u788D","","data.role \u53EA\u80FD\u4F7F\u7528\uFF1Atarget_user\u3001scenario\u3001job\u3001pain\u3001value\u3002","data.userSegment \u586B\u5199\u8BE5\u884C\u5019\u9009\u7528\u6237\u540D\u79F0\u3002","data.anchor \u586B\u5199\u8F93\u5165\u6750\u6599\u4E2D\u7684\u5173\u952E\u8BCD\u6216\u77ED\u53E5\u3002","\u6BCF\u6761 edge \u9876\u5C42\u5FC5\u987B\u5305\u542B from\u3001to\u3001type\u3002","edges \u5FC5\u987B\u4F7F\u7528 from/to \u5B57\u6BB5\uFF0C\u4E0D\u8981\u4F7F\u7528 source/target \u5B57\u6BB5\u3002","edges \u7528 leads_to \u8868\u793A\u540C\u4E00\u884C\u6A2A\u5411\u5C55\u5F00\uFF0C\u7528 challenges \u8868\u793A\u75DB\u70B9\u963B\u788D\uFF0C\u7528 next_step \u8868\u793A\u4EF7\u503C\u673A\u4F1A\u4E2D\u7684\u9A8C\u8BC1\u95EE\u9898\u3002","edges \u53EA\u9700\u8981\u8FDE\u63A5\u540C\u4E00\u884C\u76F8\u90BB block\uFF1B\u4E0D\u8981\u8FD4\u56DE\u8DE8\u884C\u8FDE\u7EBF\u548C\u91CD\u590D\u8FDE\u7EBF\u3002","\u4E0D\u8981\u8FD4\u56DE suggested next actions\uFF0C\u4E0B\u4E00\u6B65\u7531\u7528\u6237\u81EA\u4E3B\u9009\u62E9\u3002","",'JSON \u5B57\u7B26\u4E32\u5185\u4E0D\u5F97\u51FA\u73B0 ASCII \u53CC\u5F15\u53F7 "\uFF0C\u8BF7\u7528\u4E2D\u6587\u5F15\u53F7 "" \u6216 \u300C\u300D \u4EE3\u66FF\uFF0C\u5426\u5219 JSON \u4F1A\u89E3\u6790\u5931\u8D25\u3002',"","\u8F93\u5165\u6750\u6599\uFF1A",i||"\uFF08\u65E0\uFF09"].filter(Boolean).join(`
`)}var h1=["reality","insight","strategy","execution"];function g1(t){let e=h1.indexOf(t);return e>=0&&e<h1.length-1?h1[e+1]:null}function m1(t){switch(t){case"reality":return"Reality";case"insight":return"Insight";case"strategy":return"Strategy";case"execution":return"Execution"}}function fu(t){let e=typeof t.data?.promptHint=="string"?t.data.promptHint.trim():"";return[`### ${t.title}`,`id: ${t.id}`,`type: ${t.type}`,t.summary?`summary: ${t.summary}`:"",t.detail&&t.detail!==t.summary?`detail: ${t.detail}`:"",e?`\u8865\u5145\u63D0\u793A\u8BCD\uFF1A${e}`:"",t.data?.materialUrl?`materialUrl: ${String(t.data.materialUrl)}`:"",t.data?.materialPath?`materialPath: ${String(t.data.materialPath)}`:""].filter(Boolean).join(`
`)}function y5(t){let e=t.useMemoryRetrieval??t.selectedBlocks.some(a=>a.data?.memoryRetrievalEnabled===!0),n=de(t.selectedBlocks),i=t.selectedBlocks.map(fu).join(`

---

`);return["\u4F60\u662F TraceMind \u601D\u8003\u63A2\u7D22\u4E2D\u7684\u300CRISE \u6218\u7565\u5206\u6790\u300D\u4EE3\u7406\u3002","RISE \u662F\u4E00\u4E2A\u5206\u9636\u6BB5\u63A8\u8FDB\u7684\u6218\u7565\u601D\u8003\u6846\u67B6\uFF1AReality -> Insight -> Strategy -> Execution\u3002","\u5F53\u524D\u53EA\u751F\u6210\u7B2C\u4E00\u9636\u6BB5 Reality\uFF0C\u7528\u6765\u6821\u51C6\u73B0\u5B9E\u5904\u5883\u3001\u8D44\u6E90\u3001\u7EA6\u675F\u548C\u4E0D\u786E\u5B9A\u6027\u3002",e?"\u8BB0\u5FC6\u68C0\u7D22\u8981\u6C42\uFF1ATraceMind \u5DF2\u9644\u52A0\u76F8\u5173\u8BB0\u5FC6\u4E0A\u4E0B\u6587\uFF0C\u8BF7\u4F18\u5148\u4F7F\u7528\u8FD9\u4E9B\u7EBF\u7D22\uFF0C\u4E0D\u8981\u7F16\u9020\u4E8B\u5B9E\u3002":"",n,"","\u8F93\u51FA\u5FC5\u987B\u662F\u4E25\u683C JSON\uFF0C\u4E0D\u8981 Markdown\uFF0C\u4E0D\u8981\u89E3\u91CA\u3002","\u8F93\u51FA\u5FC5\u987B\u7B26\u5408\uFF1Amethod=rise\uFF0Clayout.mode=rise\uFF0Cblocks \u751F\u6210 3-5 \u4E2A\u3002","Reality \u9636\u6BB5\u7528\u4E8E\u6253\u5F00\u95EE\u9898\u548C\u62D3\u5C55\u89C6\u89D2\uFF0C\u8BF7\u7ED9\u51FA\u8DB3\u591F\u591A\u4F46\u4E0D\u91CD\u590D\u7684\u73B0\u5B9E\u5224\u65AD\u3001\u7EA6\u675F\u548C\u4E0D\u786E\u5B9A\u6027\u3002","","Reality block \u8981\u6C42\uFF1A","- data.stage \u5FC5\u987B\u662F reality","- title \u4F7F\u7528 `Reality 1\uFF5C\u73B0\u5B9E\u5224\u65AD`\u3001`Reality 2\uFF5C\u73B0\u5B9E\u7EA6\u675F`\u3001`Reality 3\uFF5C\u5173\u952E\u4E0D\u786E\u5B9A\u6027` \u8FD9\u79CD\u683C\u5F0F","- summary \u662F\u4E00\u53E5\u8BDD\u95EE\u9898\u6216\u5224\u65AD\uFF0C\u5E2E\u52A9\u7528\u6237\u56DE\u590D","- detail \u63A7\u5236\u5728 200 \u4E2A\u4E2D\u6587\u5B57\u4EE5\u5185\uFF0C\u8BF4\u660E\u4E3A\u4EC0\u4E48\u8981\u95EE\u8FD9\u4E2A\u95EE\u9898","","JSON \u6A21\u677F\uFF1A",JSON.stringify({method:"rise",layout:{mode:"rise"},blocks:[{id:"r1",type:"insight",title:"Reality 1\uFF5C\u73B0\u5B9E\u5224\u65AD",summary:"\u5F53\u524D\u6700\u786E\u5B9A\u7684\u4E8B\u5B9E\u662F\u4EC0\u4E48\uFF1F",detail:"\u5148\u628A\u4E8B\u5B9E\u548C\u731C\u6D4B\u5206\u5F00\u3002",data:{stage:"reality"}},{id:"r2",type:"risk",title:"Reality 2\uFF5C\u73B0\u5B9E\u7EA6\u675F",summary:"\u54EA\u4E9B\u7EA6\u675F\u4E0D\u80FD\u5047\u88C5\u4E0D\u5B58\u5728\uFF1F",detail:"\u8BC6\u522B\u8D44\u6E90\u3001\u65F6\u95F4\u3001\u80FD\u529B\u6216\u73AF\u5883\u8FB9\u754C\u3002",data:{stage:"reality"}},{id:"r3",type:"insight",title:"Reality 3\uFF5C\u5173\u952E\u4E0D\u786E\u5B9A\u6027",summary:"\u54EA\u4E2A\u4E0D\u786E\u5B9A\u6027\u6700\u5F71\u54CD\u5224\u65AD\uFF1F",detail:"\u627E\u51FA\u6700\u9700\u8981\u88AB\u9A8C\u8BC1\u7684\u73B0\u5B9E\u53D8\u91CF\u3002",data:{stage:"reality"}}],edges:[]},null,2),"","\u8F93\u5165\u6750\u6599\uFF1A",i||"\uFF08\u65E0\uFF09"].filter(Boolean).join(`
`)}function x5(t){let e=m1(t.nextStage),n=[...t.sourceBlocks,t.currentBlock,t.userReplyBlock],i=t.useMemoryRetrieval??n.some(s=>s.data?.memoryRetrievalEnabled===!0),a=de(n),r=t.sourceBlocks.map(fu).join(`

---

`);return["\u4F60\u662F TraceMind \u601D\u8003\u63A2\u7D22\u4E2D\u7684\u300CRISE \u6218\u7565\u5206\u6790\u300D\u4EE3\u7406\u3002",`\u7528\u6237\u521A\u521A\u56DE\u590D\u4E86\u4E00\u4E2A RISE block\u3002\u8BF7\u57FA\u4E8E\u8FD9\u6761\u56DE\u590D\uFF0C\u628A\u601D\u8003\u63A8\u8FDB\u5230\u4E0B\u4E00\u9636\u6BB5 ${e}\u3002`,`nextStage=${t.nextStage}`,i?"\u8BB0\u5FC6\u68C0\u7D22\u8981\u6C42\uFF1ATraceMind \u5DF2\u9644\u52A0\u76F8\u5173\u8BB0\u5FC6\u4E0A\u4E0B\u6587\uFF0C\u8BF7\u4F18\u5148\u4F7F\u7528\u8FD9\u4E9B\u7EBF\u7D22\uFF0C\u4E0D\u8981\u7F16\u9020\u4E8B\u5B9E\u3002":"",a,"","\u8F93\u51FA\u5FC5\u987B\u662F\u4E25\u683C JSON\uFF0C\u4E0D\u8981 Markdown\uFF0C\u4E0D\u8981\u89E3\u91CA\u3002","\u8F93\u51FA\u5FC5\u987B\u7B26\u5408\uFF1Amethod=rise\uFF0Clayout.mode=rise\uFF0Cblocks \u751F\u6210 1-3 \u4E2A\uFF0C\u5C3D\u91CF\u5C11\u3002","\u4E0D\u8981\u4E3A\u4E86\u51D1\u6570\u91CF\u751F\u6210 block\uFF1B\u5982\u679C\u4E00\u4E2A\u9AD8\u8D28\u91CF block \u8DB3\u4EE5\u63A8\u8FDB\u601D\u8003\uFF0C\u53EA\u8F93\u51FA 1 \u4E2A\u3002",`\u6BCF\u4E2A block \u7684 data.stage \u5FC5\u987B\u662F ${t.nextStage}\u3002`,"","\u9636\u6BB5\u542B\u4E49\uFF1A","- Insight\uFF1A\u4ECE\u7528\u6237\u56DE\u590D\u4E2D\u63D0\u70BC\u771F\u95EE\u9898\u3001\u5173\u952E\u77DB\u76FE\u3001\u4F4E\u4F30\u673A\u4F1A\u6216\u5371\u9669\u5047\u8BBE\u3002","- Strategy\uFF1A\u5F62\u6210\u6218\u7565\u9009\u62E9\u3001\u805A\u7126\u3001\u53D6\u820D\u548C\u65B9\u5411\u5224\u65AD\u3002","- Execution\uFF1A\u6536\u675F\u6210\u6700\u5C0F\u9A8C\u8BC1\u3001\u9636\u6BB5\u884C\u52A8\u3001\u6307\u6807\u6216\u98CE\u9669\u9884\u6848\u3002","","\u5F53\u524D RISE block\uFF1A",fu(t.currentBlock),"","\u7528\u6237\u56DE\u590D\uFF1A",fu(t.userReplyBlock),"","\u539F\u59CB\u4E0A\u4E0B\u6587\uFF1A",r||"\uFF08\u65E0\uFF09"].filter(Boolean).join(`
`)}var mt={};wi(mt,{BRAND:()=>tk,DIRTY:()=>Pa,EMPTY_PATH:()=>Db,INVALID:()=>H,NEVER:()=>Nk,OK:()=>pe,ParseStatus:()=>se,Schema:()=>et,ZodAny:()=>na,ZodArray:()=>mi,ZodBigInt:()=>$a,ZodBoolean:()=>Ua,ZodBranded:()=>nl,ZodCatch:()=>Wa,ZodDate:()=>Ha,ZodDefault:()=>Ja,ZodDiscriminatedUnion:()=>mu,ZodEffects:()=>pn,ZodEnum:()=>Za,ZodError:()=>Re,ZodFirstPartyTypeKind:()=>Y,ZodFunction:()=>xu,ZodIntersection:()=>qa,ZodIssueCode:()=>R,ZodLazy:()=>Xa,ZodLiteral:()=>Ka,ZodMap:()=>xs,ZodNaN:()=>bs,ZodNativeEnum:()=>Qa,ZodNever:()=>kn,ZodNull:()=>Va,ZodNullable:()=>Ln,ZodNumber:()=>ja,ZodObject:()=>De,ZodOptional:()=>un,ZodParsedType:()=>N,ZodPipeline:()=>il,ZodPromise:()=>ia,ZodReadonly:()=>tr,ZodRecord:()=>yu,ZodSchema:()=>et,ZodSet:()=>vs,ZodString:()=>ea,ZodSymbol:()=>ms,ZodTransformer:()=>pn,ZodTuple:()=>zn,ZodType:()=>et,ZodUndefined:()=>Ya,ZodUnion:()=>Ga,ZodUnknown:()=>gi,ZodVoid:()=>ys,addIssueToContext:()=>z,any:()=>ck,array:()=>fk,bigint:()=>ak,boolean:()=>_5,coerce:()=>Lk,custom:()=>A5,date:()=>rk,datetimeRegex:()=>C5,defaultErrorMap:()=>fi,discriminatedUnion:()=>yk,effect:()=>_k,enum:()=>Ak,function:()=>wk,getErrorMap:()=>fs,getParsedType:()=>On,instanceof:()=>nk,intersection:()=>xk,isAborted:()=>hu,isAsync:()=>hs,isDirty:()=>gu,isValid:()=>ta,late:()=>ek,lazy:()=>Ck,literal:()=>Sk,makeIssue:()=>el,map:()=>kk,nan:()=>ik,nativeEnum:()=>Tk,never:()=>dk,null:()=>lk,nullable:()=>Rk,number:()=>M5,object:()=>hk,objectUtil:()=>y1,oboolean:()=>zk,onumber:()=>Ok,optional:()=>Bk,ostring:()=>Fk,pipeline:()=>Ik,preprocess:()=>Dk,promise:()=>Mk,quotelessJson:()=>_b,record:()=>bk,set:()=>Ek,setErrorMap:()=>Rb,strictObject:()=>gk,string:()=>T5,symbol:()=>sk,transformer:()=>_k,tuple:()=>vk,undefined:()=>ok,union:()=>mk,unknown:()=>uk,util:()=>rt,void:()=>pk});var rt;(function(t){t.assertEqual=a=>{};function e(a){}t.assertIs=e;function n(a){throw new Error}t.assertNever=n,t.arrayToEnum=a=>{let r={};for(let s of a)r[s]=s;return r},t.getValidEnumValues=a=>{let r=t.objectKeys(a).filter(o=>typeof a[a[o]]!="number"),s={};for(let o of r)s[o]=a[o];return t.objectValues(s)},t.objectValues=a=>t.objectKeys(a).map(function(r){return a[r]}),t.objectKeys=typeof Object.keys=="function"?a=>Object.keys(a):a=>{let r=[];for(let s in a)Object.prototype.hasOwnProperty.call(a,s)&&r.push(s);return r},t.find=(a,r)=>{for(let s of a)if(r(s))return s},t.isInteger=typeof Number.isInteger=="function"?a=>Number.isInteger(a):a=>typeof a=="number"&&Number.isFinite(a)&&Math.floor(a)===a;function i(a,r=" | "){return a.map(s=>typeof s=="string"?`'${s}'`:s).join(r)}t.joinValues=i,t.jsonStringifyReplacer=(a,r)=>typeof r=="bigint"?r.toString():r})(rt||(rt={}));var y1;(function(t){t.mergeShapes=(e,n)=>({...e,...n})})(y1||(y1={}));var N=rt.arrayToEnum(["string","nan","number","integer","float","boolean","date","bigint","symbol","function","undefined","null","array","object","unknown","promise","void","never","map","set"]),On=t=>{switch(typeof t){case"undefined":return N.undefined;case"string":return N.string;case"number":return Number.isNaN(t)?N.nan:N.number;case"boolean":return N.boolean;case"function":return N.function;case"bigint":return N.bigint;case"symbol":return N.symbol;case"object":return Array.isArray(t)?N.array:t===null?N.null:t.then&&typeof t.then=="function"&&t.catch&&typeof t.catch=="function"?N.promise:typeof Map<"u"&&t instanceof Map?N.map:typeof Set<"u"&&t instanceof Set?N.set:typeof Date<"u"&&t instanceof Date?N.date:N.object;default:return N.unknown}};var R=rt.arrayToEnum(["invalid_type","invalid_literal","custom","invalid_union","invalid_union_discriminator","invalid_enum_value","unrecognized_keys","invalid_arguments","invalid_return_type","invalid_date","invalid_string","too_small","too_big","invalid_intersection_types","not_multiple_of","not_finite"]),_b=t=>JSON.stringify(t,null,2).replace(/"([^"]+)":/g,"$1:"),Re=class t extends Error{get errors(){return this.issues}constructor(e){super(),this.issues=[],this.addIssue=i=>{this.issues=[...this.issues,i]},this.addIssues=(i=[])=>{this.issues=[...this.issues,...i]};let n=new.target.prototype;Object.setPrototypeOf?Object.setPrototypeOf(this,n):this.__proto__=n,this.name="ZodError",this.issues=e}format(e){let n=e||function(r){return r.message},i={_errors:[]},a=r=>{for(let s of r.issues)if(s.code==="invalid_union")s.unionErrors.map(a);else if(s.code==="invalid_return_type")a(s.returnTypeError);else if(s.code==="invalid_arguments")a(s.argumentsError);else if(s.path.length===0)i._errors.push(n(s));else{let o=i,l=0;for(;l<s.path.length;){let c=s.path[l];l===s.path.length-1?(o[c]=o[c]||{_errors:[]},o[c]._errors.push(n(s))):o[c]=o[c]||{_errors:[]},o=o[c],l++}}};return a(this),i}static assert(e){if(!(e instanceof t))throw new Error(`Not a ZodError: ${e}`)}toString(){return this.message}get message(){return JSON.stringify(this.issues,rt.jsonStringifyReplacer,2)}get isEmpty(){return this.issues.length===0}flatten(e=n=>n.message){let n={},i=[];for(let a of this.issues)if(a.path.length>0){let r=a.path[0];n[r]=n[r]||[],n[r].push(e(a))}else i.push(e(a));return{formErrors:i,fieldErrors:n}}get formErrors(){return this.flatten()}};Re.create=t=>new Re(t);var Bb=(t,e)=>{let n;switch(t.code){case R.invalid_type:t.received===N.undefined?n="Required":n=`Expected ${t.expected}, received ${t.received}`;break;case R.invalid_literal:n=`Invalid literal value, expected ${JSON.stringify(t.expected,rt.jsonStringifyReplacer)}`;break;case R.unrecognized_keys:n=`Unrecognized key(s) in object: ${rt.joinValues(t.keys,", ")}`;break;case R.invalid_union:n="Invalid input";break;case R.invalid_union_discriminator:n=`Invalid discriminator value. Expected ${rt.joinValues(t.options)}`;break;case R.invalid_enum_value:n=`Invalid enum value. Expected ${rt.joinValues(t.options)}, received '${t.received}'`;break;case R.invalid_arguments:n="Invalid function arguments";break;case R.invalid_return_type:n="Invalid function return type";break;case R.invalid_date:n="Invalid date";break;case R.invalid_string:typeof t.validation=="object"?"includes"in t.validation?(n=`Invalid input: must include "${t.validation.includes}"`,typeof t.validation.position=="number"&&(n=`${n} at one or more positions greater than or equal to ${t.validation.position}`)):"startsWith"in t.validation?n=`Invalid input: must start with "${t.validation.startsWith}"`:"endsWith"in t.validation?n=`Invalid input: must end with "${t.validation.endsWith}"`:rt.assertNever(t.validation):t.validation!=="regex"?n=`Invalid ${t.validation}`:n="Invalid";break;case R.too_small:t.type==="array"?n=`Array must contain ${t.exact?"exactly":t.inclusive?"at least":"more than"} ${t.minimum} element(s)`:t.type==="string"?n=`String must contain ${t.exact?"exactly":t.inclusive?"at least":"over"} ${t.minimum} character(s)`:t.type==="number"?n=`Number must be ${t.exact?"exactly equal to ":t.inclusive?"greater than or equal to ":"greater than "}${t.minimum}`:t.type==="bigint"?n=`Number must be ${t.exact?"exactly equal to ":t.inclusive?"greater than or equal to ":"greater than "}${t.minimum}`:t.type==="date"?n=`Date must be ${t.exact?"exactly equal to ":t.inclusive?"greater than or equal to ":"greater than "}${new Date(Number(t.minimum))}`:n="Invalid input";break;case R.too_big:t.type==="array"?n=`Array must contain ${t.exact?"exactly":t.inclusive?"at most":"less than"} ${t.maximum} element(s)`:t.type==="string"?n=`String must contain ${t.exact?"exactly":t.inclusive?"at most":"under"} ${t.maximum} character(s)`:t.type==="number"?n=`Number must be ${t.exact?"exactly":t.inclusive?"less than or equal to":"less than"} ${t.maximum}`:t.type==="bigint"?n=`BigInt must be ${t.exact?"exactly":t.inclusive?"less than or equal to":"less than"} ${t.maximum}`:t.type==="date"?n=`Date must be ${t.exact?"exactly":t.inclusive?"smaller than or equal to":"smaller than"} ${new Date(Number(t.maximum))}`:n="Invalid input";break;case R.custom:n="Invalid input";break;case R.invalid_intersection_types:n="Intersection results could not be merged";break;case R.not_multiple_of:n=`Number must be a multiple of ${t.multipleOf}`;break;case R.not_finite:n="Number must be finite";break;default:n=e.defaultError,rt.assertNever(t)}return{message:n}},fi=Bb;var v5=fi;function Rb(t){v5=t}function fs(){return v5}var el=t=>{let{data:e,path:n,errorMaps:i,issueData:a}=t,r=[...n,...a.path||[]],s={...a,path:r};if(a.message!==void 0)return{...a,path:r,message:a.message};let o="",l=i.filter(c=>!!c).slice().reverse();for(let c of l)o=c(s,{data:e,defaultError:o}).message;return{...a,path:r,message:o}},Db=[];function z(t,e){let n=fs(),i=el({issueData:e,data:t.data,path:t.path,errorMaps:[t.common.contextualErrorMap,t.schemaErrorMap,n,n===fi?void 0:fi].filter(a=>!!a)});t.common.issues.push(i)}var se=class t{constructor(){this.value="valid"}dirty(){this.value==="valid"&&(this.value="dirty")}abort(){this.value!=="aborted"&&(this.value="aborted")}static mergeArray(e,n){let i=[];for(let a of n){if(a.status==="aborted")return H;a.status==="dirty"&&e.dirty(),i.push(a.value)}return{status:e.value,value:i}}static async mergeObjectAsync(e,n){let i=[];for(let a of n){let r=await a.key,s=await a.value;i.push({key:r,value:s})}return t.mergeObjectSync(e,i)}static mergeObjectSync(e,n){let i={};for(let a of n){let{key:r,value:s}=a;if(r.status==="aborted"||s.status==="aborted")return H;r.status==="dirty"&&e.dirty(),s.status==="dirty"&&e.dirty(),r.value!=="__proto__"&&(typeof s.value<"u"||a.alwaysSet)&&(i[r.value]=s.value)}return{status:e.value,value:i}}},H=Object.freeze({status:"aborted"}),Pa=t=>({status:"dirty",value:t}),pe=t=>({status:"valid",value:t}),hu=t=>t.status==="aborted",gu=t=>t.status==="dirty",ta=t=>t.status==="valid",hs=t=>typeof Promise<"u"&&t instanceof Promise;var $;(function(t){t.errToObj=e=>typeof e=="string"?{message:e}:e||{},t.toString=e=>typeof e=="string"?e:e?.message})($||($={}));var dn=class{constructor(e,n,i,a){this._cachedPath=[],this.parent=e,this.data=n,this._path=i,this._key=a}get path(){return this._cachedPath.length||(Array.isArray(this._key)?this._cachedPath.push(...this._path,...this._key):this._cachedPath.push(...this._path,this._key)),this._cachedPath}},b5=(t,e)=>{if(ta(e))return{success:!0,data:e.value};if(!t.common.issues.length)throw new Error("Validation failed but no issues detected.");return{success:!1,get error(){if(this._error)return this._error;let n=new Re(t.common.issues);return this._error=n,this._error}}};function J(t){if(!t)return{};let{errorMap:e,invalid_type_error:n,required_error:i,description:a}=t;if(e&&(n||i))throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);return e?{errorMap:e,description:a}:{errorMap:(s,o)=>{let{message:l}=t;return s.code==="invalid_enum_value"?{message:l??o.defaultError}:typeof o.data>"u"?{message:l??i??o.defaultError}:s.code!=="invalid_type"?{message:o.defaultError}:{message:l??n??o.defaultError}},description:a}}var et=class{get description(){return this._def.description}_getType(e){return On(e.data)}_getOrReturnCtx(e,n){return n||{common:e.parent.common,data:e.data,parsedType:On(e.data),schemaErrorMap:this._def.errorMap,path:e.path,parent:e.parent}}_processInputParams(e){return{status:new se,ctx:{common:e.parent.common,data:e.data,parsedType:On(e.data),schemaErrorMap:this._def.errorMap,path:e.path,parent:e.parent}}}_parseSync(e){let n=this._parse(e);if(hs(n))throw new Error("Synchronous parse encountered promise.");return n}_parseAsync(e){let n=this._parse(e);return Promise.resolve(n)}parse(e,n){let i=this.safeParse(e,n);if(i.success)return i.data;throw i.error}safeParse(e,n){let i={common:{issues:[],async:n?.async??!1,contextualErrorMap:n?.errorMap},path:n?.path||[],schemaErrorMap:this._def.errorMap,parent:null,data:e,parsedType:On(e)},a=this._parseSync({data:e,path:i.path,parent:i});return b5(i,a)}"~validate"(e){let n={common:{issues:[],async:!!this["~standard"].async},path:[],schemaErrorMap:this._def.errorMap,parent:null,data:e,parsedType:On(e)};if(!this["~standard"].async)try{let i=this._parseSync({data:e,path:[],parent:n});return ta(i)?{value:i.value}:{issues:n.common.issues}}catch(i){i?.message?.toLowerCase()?.includes("encountered")&&(this["~standard"].async=!0),n.common={issues:[],async:!0}}return this._parseAsync({data:e,path:[],parent:n}).then(i=>ta(i)?{value:i.value}:{issues:n.common.issues})}async parseAsync(e,n){let i=await this.safeParseAsync(e,n);if(i.success)return i.data;throw i.error}async safeParseAsync(e,n){let i={common:{issues:[],contextualErrorMap:n?.errorMap,async:!0},path:n?.path||[],schemaErrorMap:this._def.errorMap,parent:null,data:e,parsedType:On(e)},a=this._parse({data:e,path:i.path,parent:i}),r=await(hs(a)?a:Promise.resolve(a));return b5(i,r)}refine(e,n){let i=a=>typeof n=="string"||typeof n>"u"?{message:n}:typeof n=="function"?n(a):n;return this._refinement((a,r)=>{let s=e(a),o=()=>r.addIssue({code:R.custom,...i(a)});return typeof Promise<"u"&&s instanceof Promise?s.then(l=>l?!0:(o(),!1)):s?!0:(o(),!1)})}refinement(e,n){return this._refinement((i,a)=>e(i)?!0:(a.addIssue(typeof n=="function"?n(i,a):n),!1))}_refinement(e){return new pn({schema:this,typeName:Y.ZodEffects,effect:{type:"refinement",refinement:e}})}superRefine(e){return this._refinement(e)}constructor(e){this.spa=this.safeParseAsync,this._def=e,this.parse=this.parse.bind(this),this.safeParse=this.safeParse.bind(this),this.parseAsync=this.parseAsync.bind(this),this.safeParseAsync=this.safeParseAsync.bind(this),this.spa=this.spa.bind(this),this.refine=this.refine.bind(this),this.refinement=this.refinement.bind(this),this.superRefine=this.superRefine.bind(this),this.optional=this.optional.bind(this),this.nullable=this.nullable.bind(this),this.nullish=this.nullish.bind(this),this.array=this.array.bind(this),this.promise=this.promise.bind(this),this.or=this.or.bind(this),this.and=this.and.bind(this),this.transform=this.transform.bind(this),this.brand=this.brand.bind(this),this.default=this.default.bind(this),this.catch=this.catch.bind(this),this.describe=this.describe.bind(this),this.pipe=this.pipe.bind(this),this.readonly=this.readonly.bind(this),this.isNullable=this.isNullable.bind(this),this.isOptional=this.isOptional.bind(this),this["~standard"]={version:1,vendor:"zod",validate:n=>this["~validate"](n)}}optional(){return un.create(this,this._def)}nullable(){return Ln.create(this,this._def)}nullish(){return this.nullable().optional()}array(){return mi.create(this)}promise(){return ia.create(this,this._def)}or(e){return Ga.create([this,e],this._def)}and(e){return qa.create(this,e,this._def)}transform(e){return new pn({...J(this._def),schema:this,typeName:Y.ZodEffects,effect:{type:"transform",transform:e}})}default(e){let n=typeof e=="function"?e:()=>e;return new Ja({...J(this._def),innerType:this,defaultValue:n,typeName:Y.ZodDefault})}brand(){return new nl({typeName:Y.ZodBranded,type:this,...J(this._def)})}catch(e){let n=typeof e=="function"?e:()=>e;return new Wa({...J(this._def),innerType:this,catchValue:n,typeName:Y.ZodCatch})}describe(e){let n=this.constructor;return new n({...this._def,description:e})}pipe(e){return il.create(this,e)}readonly(){return tr.create(this)}isOptional(){return this.safeParse(void 0).success}isNullable(){return this.safeParse(null).success}},Ib=/^c[^\s-]{8,}$/i,Fb=/^[0-9a-z]+$/,Ob=/^[0-9A-HJKMNP-TV-Z]{26}$/i,zb=/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i,Lb=/^[a-z0-9_-]{21}$/i,Nb=/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/,Pb=/^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/,jb=/^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i,$b="^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$",x1,Ub=/^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,Hb=/^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/,Yb=/^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/,Vb=/^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,Gb=/^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/,qb=/^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/,E5="((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))",Xb=new RegExp(`^${E5}$`);function w5(t){let e="[0-5]\\d";t.precision?e=`${e}\\.\\d{${t.precision}}`:t.precision==null&&(e=`${e}(\\.\\d+)?`);let n=t.precision?"+":"?";return`([01]\\d|2[0-3]):[0-5]\\d(:${e})${n}`}function Kb(t){return new RegExp(`^${w5(t)}$`)}function C5(t){let e=`${E5}T${w5(t)}`,n=[];return n.push(t.local?"Z?":"Z"),t.offset&&n.push("([+-]\\d{2}:?\\d{2})"),e=`${e}(${n.join("|")})`,new RegExp(`^${e}$`)}function Zb(t,e){return!!((e==="v4"||!e)&&Ub.test(t)||(e==="v6"||!e)&&Yb.test(t))}function Qb(t,e){if(!Nb.test(t))return!1;try{let[n]=t.split(".");if(!n)return!1;let i=n.replace(/-/g,"+").replace(/_/g,"/").padEnd(n.length+(4-n.length%4)%4,"="),a=JSON.parse(atob(i));return!(typeof a!="object"||a===null||"typ"in a&&a?.typ!=="JWT"||!a.alg||e&&a.alg!==e)}catch{return!1}}function Jb(t,e){return!!((e==="v4"||!e)&&Hb.test(t)||(e==="v6"||!e)&&Vb.test(t))}var ea=class t extends et{_parse(e){if(this._def.coerce&&(e.data=String(e.data)),this._getType(e)!==N.string){let r=this._getOrReturnCtx(e);return z(r,{code:R.invalid_type,expected:N.string,received:r.parsedType}),H}let i=new se,a;for(let r of this._def.checks)if(r.kind==="min")e.data.length<r.value&&(a=this._getOrReturnCtx(e,a),z(a,{code:R.too_small,minimum:r.value,type:"string",inclusive:!0,exact:!1,message:r.message}),i.dirty());else if(r.kind==="max")e.data.length>r.value&&(a=this._getOrReturnCtx(e,a),z(a,{code:R.too_big,maximum:r.value,type:"string",inclusive:!0,exact:!1,message:r.message}),i.dirty());else if(r.kind==="length"){let s=e.data.length>r.value,o=e.data.length<r.value;(s||o)&&(a=this._getOrReturnCtx(e,a),s?z(a,{code:R.too_big,maximum:r.value,type:"string",inclusive:!0,exact:!0,message:r.message}):o&&z(a,{code:R.too_small,minimum:r.value,type:"string",inclusive:!0,exact:!0,message:r.message}),i.dirty())}else if(r.kind==="email")jb.test(e.data)||(a=this._getOrReturnCtx(e,a),z(a,{validation:"email",code:R.invalid_string,message:r.message}),i.dirty());else if(r.kind==="emoji")x1||(x1=new RegExp($b,"u")),x1.test(e.data)||(a=this._getOrReturnCtx(e,a),z(a,{validation:"emoji",code:R.invalid_string,message:r.message}),i.dirty());else if(r.kind==="uuid")zb.test(e.data)||(a=this._getOrReturnCtx(e,a),z(a,{validation:"uuid",code:R.invalid_string,message:r.message}),i.dirty());else if(r.kind==="nanoid")Lb.test(e.data)||(a=this._getOrReturnCtx(e,a),z(a,{validation:"nanoid",code:R.invalid_string,message:r.message}),i.dirty());else if(r.kind==="cuid")Ib.test(e.data)||(a=this._getOrReturnCtx(e,a),z(a,{validation:"cuid",code:R.invalid_string,message:r.message}),i.dirty());else if(r.kind==="cuid2")Fb.test(e.data)||(a=this._getOrReturnCtx(e,a),z(a,{validation:"cuid2",code:R.invalid_string,message:r.message}),i.dirty());else if(r.kind==="ulid")Ob.test(e.data)||(a=this._getOrReturnCtx(e,a),z(a,{validation:"ulid",code:R.invalid_string,message:r.message}),i.dirty());else if(r.kind==="url")try{new URL(e.data)}catch{a=this._getOrReturnCtx(e,a),z(a,{validation:"url",code:R.invalid_string,message:r.message}),i.dirty()}else r.kind==="regex"?(r.regex.lastIndex=0,r.regex.test(e.data)||(a=this._getOrReturnCtx(e,a),z(a,{validation:"regex",code:R.invalid_string,message:r.message}),i.dirty())):r.kind==="trim"?e.data=e.data.trim():r.kind==="includes"?e.data.includes(r.value,r.position)||(a=this._getOrReturnCtx(e,a),z(a,{code:R.invalid_string,validation:{includes:r.value,position:r.position},message:r.message}),i.dirty()):r.kind==="toLowerCase"?e.data=e.data.toLowerCase():r.kind==="toUpperCase"?e.data=e.data.toUpperCase():r.kind==="startsWith"?e.data.startsWith(r.value)||(a=this._getOrReturnCtx(e,a),z(a,{code:R.invalid_string,validation:{startsWith:r.value},message:r.message}),i.dirty()):r.kind==="endsWith"?e.data.endsWith(r.value)||(a=this._getOrReturnCtx(e,a),z(a,{code:R.invalid_string,validation:{endsWith:r.value},message:r.message}),i.dirty()):r.kind==="datetime"?C5(r).test(e.data)||(a=this._getOrReturnCtx(e,a),z(a,{code:R.invalid_string,validation:"datetime",message:r.message}),i.dirty()):r.kind==="date"?Xb.test(e.data)||(a=this._getOrReturnCtx(e,a),z(a,{code:R.invalid_string,validation:"date",message:r.message}),i.dirty()):r.kind==="time"?Kb(r).test(e.data)||(a=this._getOrReturnCtx(e,a),z(a,{code:R.invalid_string,validation:"time",message:r.message}),i.dirty()):r.kind==="duration"?Pb.test(e.data)||(a=this._getOrReturnCtx(e,a),z(a,{validation:"duration",code:R.invalid_string,message:r.message}),i.dirty()):r.kind==="ip"?Zb(e.data,r.version)||(a=this._getOrReturnCtx(e,a),z(a,{validation:"ip",code:R.invalid_string,message:r.message}),i.dirty()):r.kind==="jwt"?Qb(e.data,r.alg)||(a=this._getOrReturnCtx(e,a),z(a,{validation:"jwt",code:R.invalid_string,message:r.message}),i.dirty()):r.kind==="cidr"?Jb(e.data,r.version)||(a=this._getOrReturnCtx(e,a),z(a,{validation:"cidr",code:R.invalid_string,message:r.message}),i.dirty()):r.kind==="base64"?Gb.test(e.data)||(a=this._getOrReturnCtx(e,a),z(a,{validation:"base64",code:R.invalid_string,message:r.message}),i.dirty()):r.kind==="base64url"?qb.test(e.data)||(a=this._getOrReturnCtx(e,a),z(a,{validation:"base64url",code:R.invalid_string,message:r.message}),i.dirty()):rt.assertNever(r);return{status:i.value,value:e.data}}_regex(e,n,i){return this.refinement(a=>e.test(a),{validation:n,code:R.invalid_string,...$.errToObj(i)})}_addCheck(e){return new t({...this._def,checks:[...this._def.checks,e]})}email(e){return this._addCheck({kind:"email",...$.errToObj(e)})}url(e){return this._addCheck({kind:"url",...$.errToObj(e)})}emoji(e){return this._addCheck({kind:"emoji",...$.errToObj(e)})}uuid(e){return this._addCheck({kind:"uuid",...$.errToObj(e)})}nanoid(e){return this._addCheck({kind:"nanoid",...$.errToObj(e)})}cuid(e){return this._addCheck({kind:"cuid",...$.errToObj(e)})}cuid2(e){return this._addCheck({kind:"cuid2",...$.errToObj(e)})}ulid(e){return this._addCheck({kind:"ulid",...$.errToObj(e)})}base64(e){return this._addCheck({kind:"base64",...$.errToObj(e)})}base64url(e){return this._addCheck({kind:"base64url",...$.errToObj(e)})}jwt(e){return this._addCheck({kind:"jwt",...$.errToObj(e)})}ip(e){return this._addCheck({kind:"ip",...$.errToObj(e)})}cidr(e){return this._addCheck({kind:"cidr",...$.errToObj(e)})}datetime(e){return typeof e=="string"?this._addCheck({kind:"datetime",precision:null,offset:!1,local:!1,message:e}):this._addCheck({kind:"datetime",precision:typeof e?.precision>"u"?null:e?.precision,offset:e?.offset??!1,local:e?.local??!1,...$.errToObj(e?.message)})}date(e){return this._addCheck({kind:"date",message:e})}time(e){return typeof e=="string"?this._addCheck({kind:"time",precision:null,message:e}):this._addCheck({kind:"time",precision:typeof e?.precision>"u"?null:e?.precision,...$.errToObj(e?.message)})}duration(e){return this._addCheck({kind:"duration",...$.errToObj(e)})}regex(e,n){return this._addCheck({kind:"regex",regex:e,...$.errToObj(n)})}includes(e,n){return this._addCheck({kind:"includes",value:e,position:n?.position,...$.errToObj(n?.message)})}startsWith(e,n){return this._addCheck({kind:"startsWith",value:e,...$.errToObj(n)})}endsWith(e,n){return this._addCheck({kind:"endsWith",value:e,...$.errToObj(n)})}min(e,n){return this._addCheck({kind:"min",value:e,...$.errToObj(n)})}max(e,n){return this._addCheck({kind:"max",value:e,...$.errToObj(n)})}length(e,n){return this._addCheck({kind:"length",value:e,...$.errToObj(n)})}nonempty(e){return this.min(1,$.errToObj(e))}trim(){return new t({...this._def,checks:[...this._def.checks,{kind:"trim"}]})}toLowerCase(){return new t({...this._def,checks:[...this._def.checks,{kind:"toLowerCase"}]})}toUpperCase(){return new t({...this._def,checks:[...this._def.checks,{kind:"toUpperCase"}]})}get isDatetime(){return!!this._def.checks.find(e=>e.kind==="datetime")}get isDate(){return!!this._def.checks.find(e=>e.kind==="date")}get isTime(){return!!this._def.checks.find(e=>e.kind==="time")}get isDuration(){return!!this._def.checks.find(e=>e.kind==="duration")}get isEmail(){return!!this._def.checks.find(e=>e.kind==="email")}get isURL(){return!!this._def.checks.find(e=>e.kind==="url")}get isEmoji(){return!!this._def.checks.find(e=>e.kind==="emoji")}get isUUID(){return!!this._def.checks.find(e=>e.kind==="uuid")}get isNANOID(){return!!this._def.checks.find(e=>e.kind==="nanoid")}get isCUID(){return!!this._def.checks.find(e=>e.kind==="cuid")}get isCUID2(){return!!this._def.checks.find(e=>e.kind==="cuid2")}get isULID(){return!!this._def.checks.find(e=>e.kind==="ulid")}get isIP(){return!!this._def.checks.find(e=>e.kind==="ip")}get isCIDR(){return!!this._def.checks.find(e=>e.kind==="cidr")}get isBase64(){return!!this._def.checks.find(e=>e.kind==="base64")}get isBase64url(){return!!this._def.checks.find(e=>e.kind==="base64url")}get minLength(){let e=null;for(let n of this._def.checks)n.kind==="min"&&(e===null||n.value>e)&&(e=n.value);return e}get maxLength(){let e=null;for(let n of this._def.checks)n.kind==="max"&&(e===null||n.value<e)&&(e=n.value);return e}};ea.create=t=>new ea({checks:[],typeName:Y.ZodString,coerce:t?.coerce??!1,...J(t)});function Wb(t,e){let n=(t.toString().split(".")[1]||"").length,i=(e.toString().split(".")[1]||"").length,a=n>i?n:i,r=Number.parseInt(t.toFixed(a).replace(".","")),s=Number.parseInt(e.toFixed(a).replace(".",""));return r%s/10**a}var ja=class t extends et{constructor(){super(...arguments),this.min=this.gte,this.max=this.lte,this.step=this.multipleOf}_parse(e){if(this._def.coerce&&(e.data=Number(e.data)),this._getType(e)!==N.number){let r=this._getOrReturnCtx(e);return z(r,{code:R.invalid_type,expected:N.number,received:r.parsedType}),H}let i,a=new se;for(let r of this._def.checks)r.kind==="int"?rt.isInteger(e.data)||(i=this._getOrReturnCtx(e,i),z(i,{code:R.invalid_type,expected:"integer",received:"float",message:r.message}),a.dirty()):r.kind==="min"?(r.inclusive?e.data<r.value:e.data<=r.value)&&(i=this._getOrReturnCtx(e,i),z(i,{code:R.too_small,minimum:r.value,type:"number",inclusive:r.inclusive,exact:!1,message:r.message}),a.dirty()):r.kind==="max"?(r.inclusive?e.data>r.value:e.data>=r.value)&&(i=this._getOrReturnCtx(e,i),z(i,{code:R.too_big,maximum:r.value,type:"number",inclusive:r.inclusive,exact:!1,message:r.message}),a.dirty()):r.kind==="multipleOf"?Wb(e.data,r.value)!==0&&(i=this._getOrReturnCtx(e,i),z(i,{code:R.not_multiple_of,multipleOf:r.value,message:r.message}),a.dirty()):r.kind==="finite"?Number.isFinite(e.data)||(i=this._getOrReturnCtx(e,i),z(i,{code:R.not_finite,message:r.message}),a.dirty()):rt.assertNever(r);return{status:a.value,value:e.data}}gte(e,n){return this.setLimit("min",e,!0,$.toString(n))}gt(e,n){return this.setLimit("min",e,!1,$.toString(n))}lte(e,n){return this.setLimit("max",e,!0,$.toString(n))}lt(e,n){return this.setLimit("max",e,!1,$.toString(n))}setLimit(e,n,i,a){return new t({...this._def,checks:[...this._def.checks,{kind:e,value:n,inclusive:i,message:$.toString(a)}]})}_addCheck(e){return new t({...this._def,checks:[...this._def.checks,e]})}int(e){return this._addCheck({kind:"int",message:$.toString(e)})}positive(e){return this._addCheck({kind:"min",value:0,inclusive:!1,message:$.toString(e)})}negative(e){return this._addCheck({kind:"max",value:0,inclusive:!1,message:$.toString(e)})}nonpositive(e){return this._addCheck({kind:"max",value:0,inclusive:!0,message:$.toString(e)})}nonnegative(e){return this._addCheck({kind:"min",value:0,inclusive:!0,message:$.toString(e)})}multipleOf(e,n){return this._addCheck({kind:"multipleOf",value:e,message:$.toString(n)})}finite(e){return this._addCheck({kind:"finite",message:$.toString(e)})}safe(e){return this._addCheck({kind:"min",inclusive:!0,value:Number.MIN_SAFE_INTEGER,message:$.toString(e)})._addCheck({kind:"max",inclusive:!0,value:Number.MAX_SAFE_INTEGER,message:$.toString(e)})}get minValue(){let e=null;for(let n of this._def.checks)n.kind==="min"&&(e===null||n.value>e)&&(e=n.value);return e}get maxValue(){let e=null;for(let n of this._def.checks)n.kind==="max"&&(e===null||n.value<e)&&(e=n.value);return e}get isInt(){return!!this._def.checks.find(e=>e.kind==="int"||e.kind==="multipleOf"&&rt.isInteger(e.value))}get isFinite(){let e=null,n=null;for(let i of this._def.checks){if(i.kind==="finite"||i.kind==="int"||i.kind==="multipleOf")return!0;i.kind==="min"?(n===null||i.value>n)&&(n=i.value):i.kind==="max"&&(e===null||i.value<e)&&(e=i.value)}return Number.isFinite(n)&&Number.isFinite(e)}};ja.create=t=>new ja({checks:[],typeName:Y.ZodNumber,coerce:t?.coerce||!1,...J(t)});var $a=class t extends et{constructor(){super(...arguments),this.min=this.gte,this.max=this.lte}_parse(e){if(this._def.coerce)try{e.data=BigInt(e.data)}catch{return this._getInvalidInput(e)}if(this._getType(e)!==N.bigint)return this._getInvalidInput(e);let i,a=new se;for(let r of this._def.checks)r.kind==="min"?(r.inclusive?e.data<r.value:e.data<=r.value)&&(i=this._getOrReturnCtx(e,i),z(i,{code:R.too_small,type:"bigint",minimum:r.value,inclusive:r.inclusive,message:r.message}),a.dirty()):r.kind==="max"?(r.inclusive?e.data>r.value:e.data>=r.value)&&(i=this._getOrReturnCtx(e,i),z(i,{code:R.too_big,type:"bigint",maximum:r.value,inclusive:r.inclusive,message:r.message}),a.dirty()):r.kind==="multipleOf"?e.data%r.value!==BigInt(0)&&(i=this._getOrReturnCtx(e,i),z(i,{code:R.not_multiple_of,multipleOf:r.value,message:r.message}),a.dirty()):rt.assertNever(r);return{status:a.value,value:e.data}}_getInvalidInput(e){let n=this._getOrReturnCtx(e);return z(n,{code:R.invalid_type,expected:N.bigint,received:n.parsedType}),H}gte(e,n){return this.setLimit("min",e,!0,$.toString(n))}gt(e,n){return this.setLimit("min",e,!1,$.toString(n))}lte(e,n){return this.setLimit("max",e,!0,$.toString(n))}lt(e,n){return this.setLimit("max",e,!1,$.toString(n))}setLimit(e,n,i,a){return new t({...this._def,checks:[...this._def.checks,{kind:e,value:n,inclusive:i,message:$.toString(a)}]})}_addCheck(e){return new t({...this._def,checks:[...this._def.checks,e]})}positive(e){return this._addCheck({kind:"min",value:BigInt(0),inclusive:!1,message:$.toString(e)})}negative(e){return this._addCheck({kind:"max",value:BigInt(0),inclusive:!1,message:$.toString(e)})}nonpositive(e){return this._addCheck({kind:"max",value:BigInt(0),inclusive:!0,message:$.toString(e)})}nonnegative(e){return this._addCheck({kind:"min",value:BigInt(0),inclusive:!0,message:$.toString(e)})}multipleOf(e,n){return this._addCheck({kind:"multipleOf",value:e,message:$.toString(n)})}get minValue(){let e=null;for(let n of this._def.checks)n.kind==="min"&&(e===null||n.value>e)&&(e=n.value);return e}get maxValue(){let e=null;for(let n of this._def.checks)n.kind==="max"&&(e===null||n.value<e)&&(e=n.value);return e}};$a.create=t=>new $a({checks:[],typeName:Y.ZodBigInt,coerce:t?.coerce??!1,...J(t)});var Ua=class extends et{_parse(e){if(this._def.coerce&&(e.data=!!e.data),this._getType(e)!==N.boolean){let i=this._getOrReturnCtx(e);return z(i,{code:R.invalid_type,expected:N.boolean,received:i.parsedType}),H}return pe(e.data)}};Ua.create=t=>new Ua({typeName:Y.ZodBoolean,coerce:t?.coerce||!1,...J(t)});var Ha=class t extends et{_parse(e){if(this._def.coerce&&(e.data=new Date(e.data)),this._getType(e)!==N.date){let r=this._getOrReturnCtx(e);return z(r,{code:R.invalid_type,expected:N.date,received:r.parsedType}),H}if(Number.isNaN(e.data.getTime())){let r=this._getOrReturnCtx(e);return z(r,{code:R.invalid_date}),H}let i=new se,a;for(let r of this._def.checks)r.kind==="min"?e.data.getTime()<r.value&&(a=this._getOrReturnCtx(e,a),z(a,{code:R.too_small,message:r.message,inclusive:!0,exact:!1,minimum:r.value,type:"date"}),i.dirty()):r.kind==="max"?e.data.getTime()>r.value&&(a=this._getOrReturnCtx(e,a),z(a,{code:R.too_big,message:r.message,inclusive:!0,exact:!1,maximum:r.value,type:"date"}),i.dirty()):rt.assertNever(r);return{status:i.value,value:new Date(e.data.getTime())}}_addCheck(e){return new t({...this._def,checks:[...this._def.checks,e]})}min(e,n){return this._addCheck({kind:"min",value:e.getTime(),message:$.toString(n)})}max(e,n){return this._addCheck({kind:"max",value:e.getTime(),message:$.toString(n)})}get minDate(){let e=null;for(let n of this._def.checks)n.kind==="min"&&(e===null||n.value>e)&&(e=n.value);return e!=null?new Date(e):null}get maxDate(){let e=null;for(let n of this._def.checks)n.kind==="max"&&(e===null||n.value<e)&&(e=n.value);return e!=null?new Date(e):null}};Ha.create=t=>new Ha({checks:[],coerce:t?.coerce||!1,typeName:Y.ZodDate,...J(t)});var ms=class extends et{_parse(e){if(this._getType(e)!==N.symbol){let i=this._getOrReturnCtx(e);return z(i,{code:R.invalid_type,expected:N.symbol,received:i.parsedType}),H}return pe(e.data)}};ms.create=t=>new ms({typeName:Y.ZodSymbol,...J(t)});var Ya=class extends et{_parse(e){if(this._getType(e)!==N.undefined){let i=this._getOrReturnCtx(e);return z(i,{code:R.invalid_type,expected:N.undefined,received:i.parsedType}),H}return pe(e.data)}};Ya.create=t=>new Ya({typeName:Y.ZodUndefined,...J(t)});var Va=class extends et{_parse(e){if(this._getType(e)!==N.null){let i=this._getOrReturnCtx(e);return z(i,{code:R.invalid_type,expected:N.null,received:i.parsedType}),H}return pe(e.data)}};Va.create=t=>new Va({typeName:Y.ZodNull,...J(t)});var na=class extends et{constructor(){super(...arguments),this._any=!0}_parse(e){return pe(e.data)}};na.create=t=>new na({typeName:Y.ZodAny,...J(t)});var gi=class extends et{constructor(){super(...arguments),this._unknown=!0}_parse(e){return pe(e.data)}};gi.create=t=>new gi({typeName:Y.ZodUnknown,...J(t)});var kn=class extends et{_parse(e){let n=this._getOrReturnCtx(e);return z(n,{code:R.invalid_type,expected:N.never,received:n.parsedType}),H}};kn.create=t=>new kn({typeName:Y.ZodNever,...J(t)});var ys=class extends et{_parse(e){if(this._getType(e)!==N.undefined){let i=this._getOrReturnCtx(e);return z(i,{code:R.invalid_type,expected:N.void,received:i.parsedType}),H}return pe(e.data)}};ys.create=t=>new ys({typeName:Y.ZodVoid,...J(t)});var mi=class t extends et{_parse(e){let{ctx:n,status:i}=this._processInputParams(e),a=this._def;if(n.parsedType!==N.array)return z(n,{code:R.invalid_type,expected:N.array,received:n.parsedType}),H;if(a.exactLength!==null){let s=n.data.length>a.exactLength.value,o=n.data.length<a.exactLength.value;(s||o)&&(z(n,{code:s?R.too_big:R.too_small,minimum:o?a.exactLength.value:void 0,maximum:s?a.exactLength.value:void 0,type:"array",inclusive:!0,exact:!0,message:a.exactLength.message}),i.dirty())}if(a.minLength!==null&&n.data.length<a.minLength.value&&(z(n,{code:R.too_small,minimum:a.minLength.value,type:"array",inclusive:!0,exact:!1,message:a.minLength.message}),i.dirty()),a.maxLength!==null&&n.data.length>a.maxLength.value&&(z(n,{code:R.too_big,maximum:a.maxLength.value,type:"array",inclusive:!0,exact:!1,message:a.maxLength.message}),i.dirty()),n.common.async)return Promise.all([...n.data].map((s,o)=>a.type._parseAsync(new dn(n,s,n.path,o)))).then(s=>se.mergeArray(i,s));let r=[...n.data].map((s,o)=>a.type._parseSync(new dn(n,s,n.path,o)));return se.mergeArray(i,r)}get element(){return this._def.type}min(e,n){return new t({...this._def,minLength:{value:e,message:$.toString(n)}})}max(e,n){return new t({...this._def,maxLength:{value:e,message:$.toString(n)}})}length(e,n){return new t({...this._def,exactLength:{value:e,message:$.toString(n)}})}nonempty(e){return this.min(1,e)}};mi.create=(t,e)=>new mi({type:t,minLength:null,maxLength:null,exactLength:null,typeName:Y.ZodArray,...J(e)});function gs(t){if(t instanceof De){let e={};for(let n in t.shape){let i=t.shape[n];e[n]=un.create(gs(i))}return new De({...t._def,shape:()=>e})}else return t instanceof mi?new mi({...t._def,type:gs(t.element)}):t instanceof un?un.create(gs(t.unwrap())):t instanceof Ln?Ln.create(gs(t.unwrap())):t instanceof zn?zn.create(t.items.map(e=>gs(e))):t}var De=class t extends et{constructor(){super(...arguments),this._cached=null,this.nonstrict=this.passthrough,this.augment=this.extend}_getCached(){if(this._cached!==null)return this._cached;let e=this._def.shape(),n=rt.objectKeys(e);return this._cached={shape:e,keys:n},this._cached}_parse(e){if(this._getType(e)!==N.object){let c=this._getOrReturnCtx(e);return z(c,{code:R.invalid_type,expected:N.object,received:c.parsedType}),H}let{status:i,ctx:a}=this._processInputParams(e),{shape:r,keys:s}=this._getCached(),o=[];if(!(this._def.catchall instanceof kn&&this._def.unknownKeys==="strip"))for(let c in a.data)s.includes(c)||o.push(c);let l=[];for(let c of s){let u=r[c],d=a.data[c];l.push({key:{status:"valid",value:c},value:u._parse(new dn(a,d,a.path,c)),alwaysSet:c in a.data})}if(this._def.catchall instanceof kn){let c=this._def.unknownKeys;if(c==="passthrough")for(let u of o)l.push({key:{status:"valid",value:u},value:{status:"valid",value:a.data[u]}});else if(c==="strict")o.length>0&&(z(a,{code:R.unrecognized_keys,keys:o}),i.dirty());else if(c!=="strip")throw new Error("Internal ZodObject error: invalid unknownKeys value.")}else{let c=this._def.catchall;for(let u of o){let d=a.data[u];l.push({key:{status:"valid",value:u},value:c._parse(new dn(a,d,a.path,u)),alwaysSet:u in a.data})}}return a.common.async?Promise.resolve().then(async()=>{let c=[];for(let u of l){let d=await u.key,p=await u.value;c.push({key:d,value:p,alwaysSet:u.alwaysSet})}return c}).then(c=>se.mergeObjectSync(i,c)):se.mergeObjectSync(i,l)}get shape(){return this._def.shape()}strict(e){return $.errToObj,new t({...this._def,unknownKeys:"strict",...e!==void 0?{errorMap:(n,i)=>{let a=this._def.errorMap?.(n,i).message??i.defaultError;return n.code==="unrecognized_keys"?{message:$.errToObj(e).message??a}:{message:a}}}:{}})}strip(){return new t({...this._def,unknownKeys:"strip"})}passthrough(){return new t({...this._def,unknownKeys:"passthrough"})}extend(e){return new t({...this._def,shape:()=>({...this._def.shape(),...e})})}merge(e){return new t({unknownKeys:e._def.unknownKeys,catchall:e._def.catchall,shape:()=>({...this._def.shape(),...e._def.shape()}),typeName:Y.ZodObject})}setKey(e,n){return this.augment({[e]:n})}catchall(e){return new t({...this._def,catchall:e})}pick(e){let n={};for(let i of rt.objectKeys(e))e[i]&&this.shape[i]&&(n[i]=this.shape[i]);return new t({...this._def,shape:()=>n})}omit(e){let n={};for(let i of rt.objectKeys(this.shape))e[i]||(n[i]=this.shape[i]);return new t({...this._def,shape:()=>n})}deepPartial(){return gs(this)}partial(e){let n={};for(let i of rt.objectKeys(this.shape)){let a=this.shape[i];e&&!e[i]?n[i]=a:n[i]=a.optional()}return new t({...this._def,shape:()=>n})}required(e){let n={};for(let i of rt.objectKeys(this.shape))if(e&&!e[i])n[i]=this.shape[i];else{let r=this.shape[i];for(;r instanceof un;)r=r._def.innerType;n[i]=r}return new t({...this._def,shape:()=>n})}keyof(){return S5(rt.objectKeys(this.shape))}};De.create=(t,e)=>new De({shape:()=>t,unknownKeys:"strip",catchall:kn.create(),typeName:Y.ZodObject,...J(e)});De.strictCreate=(t,e)=>new De({shape:()=>t,unknownKeys:"strict",catchall:kn.create(),typeName:Y.ZodObject,...J(e)});De.lazycreate=(t,e)=>new De({shape:t,unknownKeys:"strip",catchall:kn.create(),typeName:Y.ZodObject,...J(e)});var Ga=class extends et{_parse(e){let{ctx:n}=this._processInputParams(e),i=this._def.options;function a(r){for(let o of r)if(o.result.status==="valid")return o.result;for(let o of r)if(o.result.status==="dirty")return n.common.issues.push(...o.ctx.common.issues),o.result;let s=r.map(o=>new Re(o.ctx.common.issues));return z(n,{code:R.invalid_union,unionErrors:s}),H}if(n.common.async)return Promise.all(i.map(async r=>{let s={...n,common:{...n.common,issues:[]},parent:null};return{result:await r._parseAsync({data:n.data,path:n.path,parent:s}),ctx:s}})).then(a);{let r,s=[];for(let l of i){let c={...n,common:{...n.common,issues:[]},parent:null},u=l._parseSync({data:n.data,path:n.path,parent:c});if(u.status==="valid")return u;u.status==="dirty"&&!r&&(r={result:u,ctx:c}),c.common.issues.length&&s.push(c.common.issues)}if(r)return n.common.issues.push(...r.ctx.common.issues),r.result;let o=s.map(l=>new Re(l));return z(n,{code:R.invalid_union,unionErrors:o}),H}}get options(){return this._def.options}};Ga.create=(t,e)=>new Ga({options:t,typeName:Y.ZodUnion,...J(e)});var hi=t=>t instanceof Xa?hi(t.schema):t instanceof pn?hi(t.innerType()):t instanceof Ka?[t.value]:t instanceof Za?t.options:t instanceof Qa?rt.objectValues(t.enum):t instanceof Ja?hi(t._def.innerType):t instanceof Ya?[void 0]:t instanceof Va?[null]:t instanceof un?[void 0,...hi(t.unwrap())]:t instanceof Ln?[null,...hi(t.unwrap())]:t instanceof nl||t instanceof tr?hi(t.unwrap()):t instanceof Wa?hi(t._def.innerType):[],mu=class t extends et{_parse(e){let{ctx:n}=this._processInputParams(e);if(n.parsedType!==N.object)return z(n,{code:R.invalid_type,expected:N.object,received:n.parsedType}),H;let i=this.discriminator,a=n.data[i],r=this.optionsMap.get(a);return r?n.common.async?r._parseAsync({data:n.data,path:n.path,parent:n}):r._parseSync({data:n.data,path:n.path,parent:n}):(z(n,{code:R.invalid_union_discriminator,options:Array.from(this.optionsMap.keys()),path:[i]}),H)}get discriminator(){return this._def.discriminator}get options(){return this._def.options}get optionsMap(){return this._def.optionsMap}static create(e,n,i){let a=new Map;for(let r of n){let s=hi(r.shape[e]);if(!s.length)throw new Error(`A discriminator value for key \`${e}\` could not be extracted from all schema options`);for(let o of s){if(a.has(o))throw new Error(`Discriminator property ${String(e)} has duplicate value ${String(o)}`);a.set(o,r)}}return new t({typeName:Y.ZodDiscriminatedUnion,discriminator:e,options:n,optionsMap:a,...J(i)})}};function v1(t,e){let n=On(t),i=On(e);if(t===e)return{valid:!0,data:t};if(n===N.object&&i===N.object){let a=rt.objectKeys(e),r=rt.objectKeys(t).filter(o=>a.indexOf(o)!==-1),s={...t,...e};for(let o of r){let l=v1(t[o],e[o]);if(!l.valid)return{valid:!1};s[o]=l.data}return{valid:!0,data:s}}else if(n===N.array&&i===N.array){if(t.length!==e.length)return{valid:!1};let a=[];for(let r=0;r<t.length;r++){let s=t[r],o=e[r],l=v1(s,o);if(!l.valid)return{valid:!1};a.push(l.data)}return{valid:!0,data:a}}else return n===N.date&&i===N.date&&+t==+e?{valid:!0,data:t}:{valid:!1}}var qa=class extends et{_parse(e){let{status:n,ctx:i}=this._processInputParams(e),a=(r,s)=>{if(hu(r)||hu(s))return H;let o=v1(r.value,s.value);return o.valid?((gu(r)||gu(s))&&n.dirty(),{status:n.value,value:o.data}):(z(i,{code:R.invalid_intersection_types}),H)};return i.common.async?Promise.all([this._def.left._parseAsync({data:i.data,path:i.path,parent:i}),this._def.right._parseAsync({data:i.data,path:i.path,parent:i})]).then(([r,s])=>a(r,s)):a(this._def.left._parseSync({data:i.data,path:i.path,parent:i}),this._def.right._parseSync({data:i.data,path:i.path,parent:i}))}};qa.create=(t,e,n)=>new qa({left:t,right:e,typeName:Y.ZodIntersection,...J(n)});var zn=class t extends et{_parse(e){let{status:n,ctx:i}=this._processInputParams(e);if(i.parsedType!==N.array)return z(i,{code:R.invalid_type,expected:N.array,received:i.parsedType}),H;if(i.data.length<this._def.items.length)return z(i,{code:R.too_small,minimum:this._def.items.length,inclusive:!0,exact:!1,type:"array"}),H;!this._def.rest&&i.data.length>this._def.items.length&&(z(i,{code:R.too_big,maximum:this._def.items.length,inclusive:!0,exact:!1,type:"array"}),n.dirty());let r=[...i.data].map((s,o)=>{let l=this._def.items[o]||this._def.rest;return l?l._parse(new dn(i,s,i.path,o)):null}).filter(s=>!!s);return i.common.async?Promise.all(r).then(s=>se.mergeArray(n,s)):se.mergeArray(n,r)}get items(){return this._def.items}rest(e){return new t({...this._def,rest:e})}};zn.create=(t,e)=>{if(!Array.isArray(t))throw new Error("You must pass an array of schemas to z.tuple([ ... ])");return new zn({items:t,typeName:Y.ZodTuple,rest:null,...J(e)})};var yu=class t extends et{get keySchema(){return this._def.keyType}get valueSchema(){return this._def.valueType}_parse(e){let{status:n,ctx:i}=this._processInputParams(e);if(i.parsedType!==N.object)return z(i,{code:R.invalid_type,expected:N.object,received:i.parsedType}),H;let a=[],r=this._def.keyType,s=this._def.valueType;for(let o in i.data)a.push({key:r._parse(new dn(i,o,i.path,o)),value:s._parse(new dn(i,i.data[o],i.path,o)),alwaysSet:o in i.data});return i.common.async?se.mergeObjectAsync(n,a):se.mergeObjectSync(n,a)}get element(){return this._def.valueType}static create(e,n,i){return n instanceof et?new t({keyType:e,valueType:n,typeName:Y.ZodRecord,...J(i)}):new t({keyType:ea.create(),valueType:e,typeName:Y.ZodRecord,...J(n)})}},xs=class extends et{get keySchema(){return this._def.keyType}get valueSchema(){return this._def.valueType}_parse(e){let{status:n,ctx:i}=this._processInputParams(e);if(i.parsedType!==N.map)return z(i,{code:R.invalid_type,expected:N.map,received:i.parsedType}),H;let a=this._def.keyType,r=this._def.valueType,s=[...i.data.entries()].map(([o,l],c)=>({key:a._parse(new dn(i,o,i.path,[c,"key"])),value:r._parse(new dn(i,l,i.path,[c,"value"]))}));if(i.common.async){let o=new Map;return Promise.resolve().then(async()=>{for(let l of s){let c=await l.key,u=await l.value;if(c.status==="aborted"||u.status==="aborted")return H;(c.status==="dirty"||u.status==="dirty")&&n.dirty(),o.set(c.value,u.value)}return{status:n.value,value:o}})}else{let o=new Map;for(let l of s){let c=l.key,u=l.value;if(c.status==="aborted"||u.status==="aborted")return H;(c.status==="dirty"||u.status==="dirty")&&n.dirty(),o.set(c.value,u.value)}return{status:n.value,value:o}}}};xs.create=(t,e,n)=>new xs({valueType:e,keyType:t,typeName:Y.ZodMap,...J(n)});var vs=class t extends et{_parse(e){let{status:n,ctx:i}=this._processInputParams(e);if(i.parsedType!==N.set)return z(i,{code:R.invalid_type,expected:N.set,received:i.parsedType}),H;let a=this._def;a.minSize!==null&&i.data.size<a.minSize.value&&(z(i,{code:R.too_small,minimum:a.minSize.value,type:"set",inclusive:!0,exact:!1,message:a.minSize.message}),n.dirty()),a.maxSize!==null&&i.data.size>a.maxSize.value&&(z(i,{code:R.too_big,maximum:a.maxSize.value,type:"set",inclusive:!0,exact:!1,message:a.maxSize.message}),n.dirty());let r=this._def.valueType;function s(l){let c=new Set;for(let u of l){if(u.status==="aborted")return H;u.status==="dirty"&&n.dirty(),c.add(u.value)}return{status:n.value,value:c}}let o=[...i.data.values()].map((l,c)=>r._parse(new dn(i,l,i.path,c)));return i.common.async?Promise.all(o).then(l=>s(l)):s(o)}min(e,n){return new t({...this._def,minSize:{value:e,message:$.toString(n)}})}max(e,n){return new t({...this._def,maxSize:{value:e,message:$.toString(n)}})}size(e,n){return this.min(e,n).max(e,n)}nonempty(e){return this.min(1,e)}};vs.create=(t,e)=>new vs({valueType:t,minSize:null,maxSize:null,typeName:Y.ZodSet,...J(e)});var xu=class t extends et{constructor(){super(...arguments),this.validate=this.implement}_parse(e){let{ctx:n}=this._processInputParams(e);if(n.parsedType!==N.function)return z(n,{code:R.invalid_type,expected:N.function,received:n.parsedType}),H;function i(o,l){return el({data:o,path:n.path,errorMaps:[n.common.contextualErrorMap,n.schemaErrorMap,fs(),fi].filter(c=>!!c),issueData:{code:R.invalid_arguments,argumentsError:l}})}function a(o,l){return el({data:o,path:n.path,errorMaps:[n.common.contextualErrorMap,n.schemaErrorMap,fs(),fi].filter(c=>!!c),issueData:{code:R.invalid_return_type,returnTypeError:l}})}let r={errorMap:n.common.contextualErrorMap},s=n.data;if(this._def.returns instanceof ia){let o=this;return pe(async function(...l){let c=new Re([]),u=await o._def.args.parseAsync(l,r).catch(f=>{throw c.addIssue(i(l,f)),c}),d=await Reflect.apply(s,this,u);return await o._def.returns._def.type.parseAsync(d,r).catch(f=>{throw c.addIssue(a(d,f)),c})})}else{let o=this;return pe(function(...l){let c=o._def.args.safeParse(l,r);if(!c.success)throw new Re([i(l,c.error)]);let u=Reflect.apply(s,this,c.data),d=o._def.returns.safeParse(u,r);if(!d.success)throw new Re([a(u,d.error)]);return d.data})}}parameters(){return this._def.args}returnType(){return this._def.returns}args(...e){return new t({...this._def,args:zn.create(e).rest(gi.create())})}returns(e){return new t({...this._def,returns:e})}implement(e){return this.parse(e)}strictImplement(e){return this.parse(e)}static create(e,n,i){return new t({args:e||zn.create([]).rest(gi.create()),returns:n||gi.create(),typeName:Y.ZodFunction,...J(i)})}},Xa=class extends et{get schema(){return this._def.getter()}_parse(e){let{ctx:n}=this._processInputParams(e);return this._def.getter()._parse({data:n.data,path:n.path,parent:n})}};Xa.create=(t,e)=>new Xa({getter:t,typeName:Y.ZodLazy,...J(e)});var Ka=class extends et{_parse(e){if(e.data!==this._def.value){let n=this._getOrReturnCtx(e);return z(n,{received:n.data,code:R.invalid_literal,expected:this._def.value}),H}return{status:"valid",value:e.data}}get value(){return this._def.value}};Ka.create=(t,e)=>new Ka({value:t,typeName:Y.ZodLiteral,...J(e)});function S5(t,e){return new Za({values:t,typeName:Y.ZodEnum,...J(e)})}var Za=class t extends et{_parse(e){if(typeof e.data!="string"){let n=this._getOrReturnCtx(e),i=this._def.values;return z(n,{expected:rt.joinValues(i),received:n.parsedType,code:R.invalid_type}),H}if(this._cache||(this._cache=new Set(this._def.values)),!this._cache.has(e.data)){let n=this._getOrReturnCtx(e),i=this._def.values;return z(n,{received:n.data,code:R.invalid_enum_value,options:i}),H}return pe(e.data)}get options(){return this._def.values}get enum(){let e={};for(let n of this._def.values)e[n]=n;return e}get Values(){let e={};for(let n of this._def.values)e[n]=n;return e}get Enum(){let e={};for(let n of this._def.values)e[n]=n;return e}extract(e,n=this._def){return t.create(e,{...this._def,...n})}exclude(e,n=this._def){return t.create(this.options.filter(i=>!e.includes(i)),{...this._def,...n})}};Za.create=S5;var Qa=class extends et{_parse(e){let n=rt.getValidEnumValues(this._def.values),i=this._getOrReturnCtx(e);if(i.parsedType!==N.string&&i.parsedType!==N.number){let a=rt.objectValues(n);return z(i,{expected:rt.joinValues(a),received:i.parsedType,code:R.invalid_type}),H}if(this._cache||(this._cache=new Set(rt.getValidEnumValues(this._def.values))),!this._cache.has(e.data)){let a=rt.objectValues(n);return z(i,{received:i.data,code:R.invalid_enum_value,options:a}),H}return pe(e.data)}get enum(){return this._def.values}};Qa.create=(t,e)=>new Qa({values:t,typeName:Y.ZodNativeEnum,...J(e)});var ia=class extends et{unwrap(){return this._def.type}_parse(e){let{ctx:n}=this._processInputParams(e);if(n.parsedType!==N.promise&&n.common.async===!1)return z(n,{code:R.invalid_type,expected:N.promise,received:n.parsedType}),H;let i=n.parsedType===N.promise?n.data:Promise.resolve(n.data);return pe(i.then(a=>this._def.type.parseAsync(a,{path:n.path,errorMap:n.common.contextualErrorMap})))}};ia.create=(t,e)=>new ia({type:t,typeName:Y.ZodPromise,...J(e)});var pn=class extends et{innerType(){return this._def.schema}sourceType(){return this._def.schema._def.typeName===Y.ZodEffects?this._def.schema.sourceType():this._def.schema}_parse(e){let{status:n,ctx:i}=this._processInputParams(e),a=this._def.effect||null,r={addIssue:s=>{z(i,s),s.fatal?n.abort():n.dirty()},get path(){return i.path}};if(r.addIssue=r.addIssue.bind(r),a.type==="preprocess"){let s=a.transform(i.data,r);if(i.common.async)return Promise.resolve(s).then(async o=>{if(n.value==="aborted")return H;let l=await this._def.schema._parseAsync({data:o,path:i.path,parent:i});return l.status==="aborted"?H:l.status==="dirty"?Pa(l.value):n.value==="dirty"?Pa(l.value):l});{if(n.value==="aborted")return H;let o=this._def.schema._parseSync({data:s,path:i.path,parent:i});return o.status==="aborted"?H:o.status==="dirty"?Pa(o.value):n.value==="dirty"?Pa(o.value):o}}if(a.type==="refinement"){let s=o=>{let l=a.refinement(o,r);if(i.common.async)return Promise.resolve(l);if(l instanceof Promise)throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");return o};if(i.common.async===!1){let o=this._def.schema._parseSync({data:i.data,path:i.path,parent:i});return o.status==="aborted"?H:(o.status==="dirty"&&n.dirty(),s(o.value),{status:n.value,value:o.value})}else return this._def.schema._parseAsync({data:i.data,path:i.path,parent:i}).then(o=>o.status==="aborted"?H:(o.status==="dirty"&&n.dirty(),s(o.value).then(()=>({status:n.value,value:o.value}))))}if(a.type==="transform")if(i.common.async===!1){let s=this._def.schema._parseSync({data:i.data,path:i.path,parent:i});if(!ta(s))return H;let o=a.transform(s.value,r);if(o instanceof Promise)throw new Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");return{status:n.value,value:o}}else return this._def.schema._parseAsync({data:i.data,path:i.path,parent:i}).then(s=>ta(s)?Promise.resolve(a.transform(s.value,r)).then(o=>({status:n.value,value:o})):H);rt.assertNever(a)}};pn.create=(t,e,n)=>new pn({schema:t,typeName:Y.ZodEffects,effect:e,...J(n)});pn.createWithPreprocess=(t,e,n)=>new pn({schema:e,effect:{type:"preprocess",transform:t},typeName:Y.ZodEffects,...J(n)});var un=class extends et{_parse(e){return this._getType(e)===N.undefined?pe(void 0):this._def.innerType._parse(e)}unwrap(){return this._def.innerType}};un.create=(t,e)=>new un({innerType:t,typeName:Y.ZodOptional,...J(e)});var Ln=class extends et{_parse(e){return this._getType(e)===N.null?pe(null):this._def.innerType._parse(e)}unwrap(){return this._def.innerType}};Ln.create=(t,e)=>new Ln({innerType:t,typeName:Y.ZodNullable,...J(e)});var Ja=class extends et{_parse(e){let{ctx:n}=this._processInputParams(e),i=n.data;return n.parsedType===N.undefined&&(i=this._def.defaultValue()),this._def.innerType._parse({data:i,path:n.path,parent:n})}removeDefault(){return this._def.innerType}};Ja.create=(t,e)=>new Ja({innerType:t,typeName:Y.ZodDefault,defaultValue:typeof e.default=="function"?e.default:()=>e.default,...J(e)});var Wa=class extends et{_parse(e){let{ctx:n}=this._processInputParams(e),i={...n,common:{...n.common,issues:[]}},a=this._def.innerType._parse({data:i.data,path:i.path,parent:{...i}});return hs(a)?a.then(r=>({status:"valid",value:r.status==="valid"?r.value:this._def.catchValue({get error(){return new Re(i.common.issues)},input:i.data})})):{status:"valid",value:a.status==="valid"?a.value:this._def.catchValue({get error(){return new Re(i.common.issues)},input:i.data})}}removeCatch(){return this._def.innerType}};Wa.create=(t,e)=>new Wa({innerType:t,typeName:Y.ZodCatch,catchValue:typeof e.catch=="function"?e.catch:()=>e.catch,...J(e)});var bs=class extends et{_parse(e){if(this._getType(e)!==N.nan){let i=this._getOrReturnCtx(e);return z(i,{code:R.invalid_type,expected:N.nan,received:i.parsedType}),H}return{status:"valid",value:e.data}}};bs.create=t=>new bs({typeName:Y.ZodNaN,...J(t)});var tk=Symbol("zod_brand"),nl=class extends et{_parse(e){let{ctx:n}=this._processInputParams(e),i=n.data;return this._def.type._parse({data:i,path:n.path,parent:n})}unwrap(){return this._def.type}},il=class t extends et{_parse(e){let{status:n,ctx:i}=this._processInputParams(e);if(i.common.async)return(async()=>{let r=await this._def.in._parseAsync({data:i.data,path:i.path,parent:i});return r.status==="aborted"?H:r.status==="dirty"?(n.dirty(),Pa(r.value)):this._def.out._parseAsync({data:r.value,path:i.path,parent:i})})();{let a=this._def.in._parseSync({data:i.data,path:i.path,parent:i});return a.status==="aborted"?H:a.status==="dirty"?(n.dirty(),{status:"dirty",value:a.value}):this._def.out._parseSync({data:a.value,path:i.path,parent:i})}}static create(e,n){return new t({in:e,out:n,typeName:Y.ZodPipeline})}},tr=class extends et{_parse(e){let n=this._def.innerType._parse(e),i=a=>(ta(a)&&(a.value=Object.freeze(a.value)),a);return hs(n)?n.then(a=>i(a)):i(n)}unwrap(){return this._def.innerType}};tr.create=(t,e)=>new tr({innerType:t,typeName:Y.ZodReadonly,...J(e)});function k5(t,e){let n=typeof t=="function"?t(e):typeof t=="string"?{message:t}:t;return typeof n=="string"?{message:n}:n}function A5(t,e={},n){return t?na.create().superRefine((i,a)=>{let r=t(i);if(r instanceof Promise)return r.then(s=>{if(!s){let o=k5(e,i),l=o.fatal??n??!0;a.addIssue({code:"custom",...o,fatal:l})}});if(!r){let s=k5(e,i),o=s.fatal??n??!0;a.addIssue({code:"custom",...s,fatal:o})}}):na.create()}var ek={object:De.lazycreate},Y;(function(t){t.ZodString="ZodString",t.ZodNumber="ZodNumber",t.ZodNaN="ZodNaN",t.ZodBigInt="ZodBigInt",t.ZodBoolean="ZodBoolean",t.ZodDate="ZodDate",t.ZodSymbol="ZodSymbol",t.ZodUndefined="ZodUndefined",t.ZodNull="ZodNull",t.ZodAny="ZodAny",t.ZodUnknown="ZodUnknown",t.ZodNever="ZodNever",t.ZodVoid="ZodVoid",t.ZodArray="ZodArray",t.ZodObject="ZodObject",t.ZodUnion="ZodUnion",t.ZodDiscriminatedUnion="ZodDiscriminatedUnion",t.ZodIntersection="ZodIntersection",t.ZodTuple="ZodTuple",t.ZodRecord="ZodRecord",t.ZodMap="ZodMap",t.ZodSet="ZodSet",t.ZodFunction="ZodFunction",t.ZodLazy="ZodLazy",t.ZodLiteral="ZodLiteral",t.ZodEnum="ZodEnum",t.ZodEffects="ZodEffects",t.ZodNativeEnum="ZodNativeEnum",t.ZodOptional="ZodOptional",t.ZodNullable="ZodNullable",t.ZodDefault="ZodDefault",t.ZodCatch="ZodCatch",t.ZodPromise="ZodPromise",t.ZodBranded="ZodBranded",t.ZodPipeline="ZodPipeline",t.ZodReadonly="ZodReadonly"})(Y||(Y={}));var nk=(t,e={message:`Input not instance of ${t.name}`})=>A5(n=>n instanceof t,e),T5=ea.create,M5=ja.create,ik=bs.create,ak=$a.create,_5=Ua.create,rk=Ha.create,sk=ms.create,ok=Ya.create,lk=Va.create,ck=na.create,uk=gi.create,dk=kn.create,pk=ys.create,fk=mi.create,hk=De.create,gk=De.strictCreate,mk=Ga.create,yk=mu.create,xk=qa.create,vk=zn.create,bk=yu.create,kk=xs.create,Ek=vs.create,wk=xu.create,Ck=Xa.create,Sk=Ka.create,Ak=Za.create,Tk=Qa.create,Mk=ia.create,_k=pn.create,Bk=un.create,Rk=Ln.create,Dk=pn.createWithPreprocess,Ik=il.create,Fk=()=>T5().optional(),Ok=()=>M5().optional(),zk=()=>_5().optional(),Lk={string:(t=>ea.create({...t,coerce:!0})),number:(t=>ja.create({...t,coerce:!0})),boolean:(t=>Ua.create({...t,coerce:!0})),bigint:(t=>$a.create({...t,coerce:!0})),date:(t=>Ha.create({...t,coerce:!0}))};var Nk=H;var Pk=mt.object({id:mt.string().optional(),category:mt.enum(["source","thinking","response","output","system"]).optional(),type:mt.enum(["question","frame_question","assumption","insight","risk","experiment","task","decision","memory","output"]),title:mt.string().min(1).max(50),summary:mt.string().max(120).optional(),bullets:mt.array(mt.string().max(30)).max(3).optional(),detail:mt.string().max(2e3).optional(),sourceRefs:mt.array(mt.string()).optional(),confidence:mt.number().min(0).max(1).optional(),data:mt.record(mt.unknown()).optional()}),jk=mt.object({from:mt.string().min(1),to:mt.string().min(1),type:mt.enum(["derived_from","supports","challenges","answers","causes","leads_to","same_pattern_as","next_step"]),label:mt.string().max(20).optional()}),$k=mt.object({method:mt.enum(["frame_problem","brainstorming","mind_map","decision_tree","user_map","rise","devils_review","actionize","memory_echo"]),summary:mt.string().max(200).optional(),blocks:mt.array(Pk).max(240),edges:mt.array(jk).max(240).optional(),layout:mt.object({mode:mt.enum(["radial","cluster","mind_map","timeline","task_tree","decision_tree","user_map","rise","evidence_graph"]),centerBlockId:mt.string().optional()})});function Uk(t){if(!t||typeof t!="object")return t;let e=t,n=typeof e.nextStage=="string"?e.nextStage:void 0,i=Array.isArray(e.blocks)&&e.blocks.some(Hk),a=Array.isArray(e.blocks)?e.blocks.map((u,d)=>Vk(u,d,n)):e.blocks,r=Yk(a),s=Array.isArray(e.edges)?e.edges.map(u=>Kk(u,r)):e.edges,o=e.layout&&typeof e.layout=="object"?e.layout:{},l=typeof e.method=="string"?e.method:o.mode==="rise"||typeof e.nextStage=="string"||i?"rise":e.method,c=e.layout||(l==="rise"?{mode:"rise"}:e.layout);return{...e,method:l,layout:c,blocks:a,edges:s}}function Hk(t){if(!t||typeof t!="object")return!1;let e=t,n=e.data&&typeof e.data=="object"?e.data:{},i=typeof e.stage=="string"?e.stage:typeof n.stage=="string"?n.stage:"";return i==="reality"||i==="insight"||i==="strategy"||i==="execution"}function Yk(t){let e={byId:new Map,byZeroBasedIndex:new Map,byOneBasedIndex:new Map};return Array.isArray(t)&&t.forEach((n,i)=>{if(!n||typeof n!="object")return;let a=n;typeof a.id=="string"&&e.byId.set(a.id,a),e.byZeroBasedIndex.set(i,a),e.byOneBasedIndex.set(i+1,a)}),e}function Vk(t,e,n){if(!t||typeof t!="object")return t;let i=t,a=i.data&&typeof i.data=="object"?i.data:{},r=typeof i.stage=="string"?i.stage:void 0,s={...a};typeof s.stage!="string"&&(r?s.stage=r:n&&(s.stage=n));let o=typeof s.role=="string"?s.role:"",l=typeof i.type=="string"?i.type:typeof s.type=="string"?s.type:"",c=Gk(l,s),u=typeof i.detail=="string"?i.detail:typeof s.detail=="string"?s.detail:typeof i.details=="string"?i.details:typeof s.details=="string"?s.details:void 0,d=typeof i.title=="string"&&i.title.trim()?i.title:qk(o,l||c,e,s),p=typeof i.summary=="string"?i.summary:typeof s.summary=="string"?s.summary:Xk(s,u,d),f={...s};return delete f.summary,delete f.detail,delete f.details,delete f.type,delete f.id,{...i,id:typeof i.id=="string"&&i.id.trim()?i.id:typeof s.id=="string"&&s.id.trim()?s.id:`b${e+1}`,type:c,title:d,summary:p,detail:u,data:f}}function Gk(t,e){switch(t){case"reality":return"insight";case"strategy":return"decision";case"execution":return"experiment";case"pain":return"risk";case"job":return"task";case"validation":return"experiment";case"warning":return"risk";case"milestone":return"experiment";case"branch":return"insight";case"leaf":return"task";default:break}let n=typeof e.stage=="string"?e.stage:"";if(n==="reality"||n==="insight")return"insight";if(n==="strategy")return"decision";if(n==="execution")return"experiment";let i=typeof e.role=="string"?e.role:"";return(i==="branch"||e.level===1)&&!t?"insight":(i==="leaf"||e.level===2)&&!t?"task":i==="risk"||i==="pain"?"risk":i==="job"?"task":i==="validation"?"experiment":i==="option"||i==="decision_question"?"decision":t}function qk(t,e,n,i={}){let a=typeof i.stage=="string"?i.stage:"";return a==="reality"?`Reality ${n+1}\uFF5C\u73B0\u5B9E\u5224\u65AD`:a==="insight"?`Insight ${n+1}\uFF5C\u5173\u952E\u6D1E\u5BDF`:a==="strategy"?`Strategy ${n+1}\uFF5C\u6218\u7565\u9009\u62E9`:a==="execution"?`Execution ${n+1}\uFF5C\u6700\u5C0F\u9A8C\u8BC1`:t==="decision_question"?"\u51B3\u7B56\u95EE\u9898":t==="option"?`\u65B9\u6848 ${n+1}`:t==="assumption"?"\u5173\u952E\u5047\u8BBE":t==="risk"?"\u5173\u952E\u98CE\u9669":t==="validation"?"\u6700\u5C0F\u9A8C\u8BC1":t==="branch"||i.level===1?`\u5206\u652F ${n+1}`:t==="leaf"||i.level===2?`\u8981\u70B9 ${n+1}`:e==="decision"?`\u51B3\u7B56\u8282\u70B9 ${n+1}`:e==="risk"?"\u5173\u952E\u98CE\u9669":e==="assumption"?"\u5173\u952E\u5047\u8BBE":e==="experiment"?"\u6700\u5C0F\u9A8C\u8BC1":e==="reality"?`Reality ${n+1}\uFF5C\u73B0\u5B9E\u5224\u65AD`:e==="strategy"?`Strategy ${n+1}\uFF5C\u6218\u7565\u9009\u62E9`:e==="execution"?`Execution ${n+1}\uFF5C\u6700\u5C0F\u9A8C\u8BC1`:`\u601D\u8003\u8282\u70B9 ${n+1}`}function Xk(t,e,n){let i=typeof t.role=="string"?t.role:"";if(i==="branch"||i==="leaf"||t.level===1||t.level===2)return typeof t.anchor=="string"&&t.anchor.trim()?t.anchor.trim().slice(0,120):e?.trim()?e.trim().slice(0,120):n?.trim()?n.trim().slice(0,120):"\u601D\u7EF4\u5BFC\u56FE\u8282\u70B9"}function Kk(t,e){if(!t||typeof t!="object")return t;let n=t,i=n.from??n.source??n.sourceId,a=n.to??n.target??n.targetId,r=B5(i,e),s=B5(a,e),o=typeof n.type=="string"?n.type:Zk(s,e);return{...n,from:r,to:s,type:o}}function B5(t,e){if(typeof t=="string"||typeof t!="number"||!Number.isInteger(t))return t;let n=e.byZeroBasedIndex.get(t)||e.byOneBasedIndex.get(t);return typeof n?.id=="string"?n.id:String(t)}function Zk(t,e){if(typeof t!="string")return"leads_to";let n=e.byId.get(t);if(!n)return"leads_to";let i=n.data&&typeof n.data=="object"?n.data:{},a=typeof i.role=="string"?i.role:"",r=typeof n.type=="string"?n.type:"";return a==="risk"||r==="risk"?"challenges":a==="assumption"||r==="assumption"?"supports":a==="validation"||r==="experiment"?"next_step":"leads_to"}function Qk(t){let e=b1(t);if(e!==null)return e;let n=Jk(t),i=b1(n);if(i!==null)return i;let a=t.replace(/[「]/g,'"').replace(/[」]/g,'"').replace(/[\u201c]/g,'"').replace(/[\u201d]/g,'"');return b1(a)}function Jk(t){let e=Wk(t.replace(/\u3000/g," "));return eE(tE(nE(e)))}function Wk(t){let e="",n=!1;for(let i=0;i<t.length;i++){let a=t[i];if(a==="\u300C"&&!n){n=!0,e+='"';continue}if(a==="\u300D"&&n){let s=t.slice(i+1).match(/\S/)?.[0]||"";!s||/[,，}\]]/.test(s)?(n=!1,e+='"'):e+="\u300D";continue}if(a==='"'&&n){e+="\u201C";continue}e+=a}return e}function tE(t){return t.replace(/([{\[,]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:/g,'$1"$2":')}function eE(t){return t.replace(/:\s*([A-Za-z_][A-Za-z0-9_]*)(\s*[,}\]])/g,': "$1"$2')}function nE(t){let e="",n=!1;for(let i=0;i<t.length;i++){let a=t[i],r=t[i-1];if(a==='"'&&r!=="\\"){n=!n,e+=a;continue}!n&&a==="\uFF1A"?e+=":":!n&&a==="\uFF0C"?e+=",":e+=a}return e}function vu(t){try{return JSON.parse(t)}catch{return null}}function b1(t){let e=t.trim(),n=vu(e);if(n!==null)return n;let i=e.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);if(i){let c=vu(i[1].trim());if(c!==null)return c}let a=e.indexOf("{");if(a===-1)return null;let r=0,s=-1;for(let c=a;c<e.length;c++)if(e[c]==="{"&&r++,e[c]==="}"&&r--,r===0){s=c;break}if(s===-1)return null;let o=e.slice(a,s+1),l=vu(o);return l!==null?l:vu(iE(o))}function iE(t){let e=/[一-鿿㐀-䶿豈-﫿]/,n="",i=!1,a=0;for(;a<t.length;){let r=t[a];if(r==='"'&&(a===0||t[a-1]!=="\\"))if(!i)i=!0,n+=r;else{let s=t[a+1],o=t[a-1],l=!s||/[\s,\:\]\}]/.test(s),c=s&&e.test(s),u=o&&e.test(o);!l&&(c||u)?n+="\u201C":(i=!1,n+=r)}else n+=r;a++}return n}function aa(t){let e=Qk(t);if(e===null)return{success:!1,error:"Agent \u8F93\u51FA\u4E2D\u672A\u627E\u5230\u6709\u6548 JSON",rawOutput:t};let n=$k.safeParse(Uk(e));if(n.success){if(n.data.method!=="user_map"&&n.data.method!=="mind_map"&&n.data.blocks.length>8)return{success:!1,error:`${n.data.method} \u6700\u591A\u8FD4\u56DE 8 \u4E2A block\uFF0C\u5B9E\u9645\u8FD4\u56DE ${n.data.blocks.length} \u4E2A`,rawOutput:t};if(n.data.method!=="user_map"&&n.data.method!=="mind_map"&&(n.data.edges?.length||0)>16)return{success:!1,error:`${n.data.method} \u6700\u591A\u8FD4\u56DE 16 \u6761 edge\uFF0C\u5B9E\u9645\u8FD4\u56DE ${n.data.edges?.length||0} \u6761`,rawOutput:t};if(n.data.method==="frame_problem"&&n.data.blocks.length!==5)return{success:!1,error:`frame_problem \u5FC5\u987B\u8FD4\u56DE 5 \u4E2A block\uFF0C\u5B9E\u9645\u8FD4\u56DE ${n.data.blocks.length} \u4E2A`,rawOutput:t};if(n.data.method==="brainstorming"&&n.data.blocks.length<1)return{success:!1,error:"brainstorming \u81F3\u5C11\u9700\u8981\u8FD4\u56DE 1 \u4E2A block",rawOutput:t};if(n.data.method==="mind_map"){if(n.data.blocks.length<1)return{success:!1,error:"mind_map \u81F3\u5C11\u9700\u8981\u8FD4\u56DE 1 \u4E2A block",rawOutput:t};if(n.data.blocks.length>220)return{success:!1,error:`mind_map \u6700\u591A\u8FD4\u56DE 220 \u4E2A block\uFF0C\u5B9E\u9645\u8FD4\u56DE ${n.data.blocks.length} \u4E2A`,rawOutput:t};if((n.data.edges?.length||0)>240)return{success:!1,error:`mind_map \u6700\u591A\u8FD4\u56DE 240 \u6761 edge\uFF0C\u5B9E\u9645\u8FD4\u56DE ${n.data.edges?.length||0} \u6761`,rawOutput:t}}if(n.data.method==="decision_tree"&&n.data.blocks.length<5)return{success:!1,error:"decision_tree \u81F3\u5C11\u9700\u8981\u8FD4\u56DE 5 \u4E2A block",rawOutput:t};if(n.data.method==="user_map"&&n.data.blocks.length!==15)return{success:!1,error:`user_map \u5FC5\u987B\u8FD4\u56DE 15 \u4E2A block\uFF0C\u5B9E\u9645\u8FD4\u56DE ${n.data.blocks.length} \u4E2A`,rawOutput:t};if(n.data.method==="rise"&&n.data.blocks.length<1)return{success:!1,error:"rise \u81F3\u5C11\u9700\u8981\u8FD4\u56DE 1 \u4E2A block",rawOutput:t};if(n.data.method==="rise"){let a=n.data.blocks.map(o=>typeof o.data?.stage=="string"?o.data.stage:"").filter(Boolean),s=a.length>0&&a.every(o=>o==="reality")?5:3;if(n.data.blocks.length>s)return{success:!1,error:`rise \u6700\u591A\u8FD4\u56DE ${s} \u4E2A block\uFF0C\u5B9E\u9645\u8FD4\u56DE ${n.data.blocks.length} \u4E2A`,rawOutput:t}}return{success:!0,data:n.data}}return{success:!1,error:n.error.issues.map(a=>`${a.path.join(".")}: ${a.message}`).join("; "),rawOutput:t}}function Ie(t){let e=Fh(t.providerKey),n=`run-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;return e?new Promise(i=>{let a=e.execute(t.prompt,{cwd:t.cwd,systemPrompt:t.systemPrompt,model:t.model,timeoutMs:t.timeoutMs,env:t.env});a.onMessage=t.onMessage||null,a.onError=r=>{i({status:"failed",output:"",error:r.message,durationMs:0,providerKey:t.providerKey,runId:n})},a.onDone=r=>{i({status:r.status,output:r.output,error:r.error,durationMs:r.durationMs,providerKey:t.providerKey,runId:n})}}):Promise.resolve({status:"failed",output:"",error:`Unknown exploration agent provider: ${t.providerKey}`,durationMs:0,providerKey:t.providerKey,runId:n})}function aE(t){return(t.detail||t.summary||t.title).trim()}function O5(t){if(t.data?.method==="rise"&&t.type==="experiment")return"execution";let e=typeof t.data?.stage=="string"?t.data.stage:"";if(e==="reality"||e==="insight"||e==="strategy"||e==="execution")return e;if(/^Reality\b/i.test(t.title))return"reality";if(/^Insight\b/i.test(t.title))return"insight";if(/^Strategy\b/i.test(t.title))return"strategy";if(/^Execution\b/i.test(t.title))return"execution"}function rE(t){return[`## ${t.title}`,`- id: ${t.id}`,`- type: ${t.type}`,t.summary?`
${t.summary}`:"",t.detail&&t.detail!==t.summary?`
${t.detail}`:""].filter(Boolean).join(`
`)}function ra(t,e,n){let i=new Set(t.map(s=>s.id)),a=new Map(e.map(s=>[s.id,s])),r=new Set;return n.forEach(s=>{let o=i.has(s.from),l=i.has(s.to);if(!o&&!l)return;let c=o?s.to:s.from,u=a.get(c);u&&(u.type==="material_source"||u.type==="entity_source")&&r.add(c)}),[...t,...e.filter(s=>r.has(s.id)&&!i.has(s.id))]}var sE=160,bu=24,R5=80;function nr(t){if(t.length===0)return{minX:0,minY:0,maxX:0,maxY:0,centerY:0};let e=Math.min(...t.map(a=>a.position.x)),n=Math.min(...t.map(a=>a.position.y)),i=Math.max(...t.map(a=>a.position.y+a.size.height));return{minX:e,minY:n,maxX:Math.max(...t.map(a=>a.position.x+a.size.width)),maxY:i,centerY:n+(i-n)/2}}function z5(t){return t.length===0?null:nr(t)}function E1(t,e){return e.x===0&&e.y===0?t:t.map(n=>({...n,position:{x:n.position.x+e.x,y:n.position.y+e.y}}))}function D5(t,e,n){return t.position.x<e.position.x+e.size.width+n&&t.position.x+t.size.width+n>e.position.x&&t.position.y<e.position.y+e.size.height+n&&t.position.y+t.size.height+n>e.position.y}function oE(t,e){return t.filter(n=>!n.agentRunId||n.data?.transient?!1:(n.sourceRefs||[]).some(i=>e.has(i)))}function lE(t,e){let n=t;for(let i=0;i<20;i++){let a=n.find(o=>e.some(l=>D5(o,l,bu)));if(!a)return n;let r=e.find(o=>D5(a,o,bu));if(!r)return n;let s=r.position.y+r.size.height+bu-a.position.y;n=E1(n,{x:0,y:Math.max(bu,s)})}return n}function I5(t){let e=z5(t);return!e||e.minY>=R5?t:E1(t,{x:0,y:R5-e.minY})}function ks(t,e,n=[]){let i=z5(t);if(!i)return t;if(n.length===0)return I5(t);let a=new Set(e.map(o=>o.id)),r=oE(n,a),s=t;if(r.length>0){let l=nr(r).maxY+sE;i.minY<l&&(s=E1(s,{x:0,y:l-i.minY}))}return I5(lE(s,n))}function w1(t,e){let n=t.length>0?{maxX:Math.max(...t.map(r=>r.position.x+r.size.width)),minY:Math.min(...t.map(r=>r.position.y))}:{maxX:0,minY:0},i=t.map(r=>r.id),a=ce({category:"output",type:"output",title:`\u6210\u679C\u603B\u7ED3 ${e+1}`,summary:"\u7B49\u5F85\u751F\u6210\u603B\u7ED3",detail:"\u8FDE\u63A5\u591A\u4E2Ablock\uFF0C\u53EF\u6C47\u603B\u751F\u6210\u603B\u7ED3\u3002",sourceRefs:i,position:{x:n.maxX+180,y:n.minY},size:{width:Ee.width*2,height:Ee.height*3},data:{outputStatus:"draft",inputBlockIds:i}});return{block:a,edges:t.map(r=>dt({from:r.id,to:a.id,type:"leads_to"}))}}function L5(t,e,n,i=[]){let a=new Map(e.map(l=>[l.id,l])),r=new Map(i.map(l=>[l.id,l])),s=new Set([t.id]),o=n.filter(l=>l.to===t.id).map(l=>l.from);for(let l=0;l<o.length;l++){let c=o[l];if(s.has(c))continue;s.add(c);let u=r.get(c);if(u){u.blockIds.forEach(d=>{s.has(d)||o.push(d)});continue}n.filter(d=>d.to===c).forEach(d=>{s.has(d.from)||o.push(d.from)})}return e.filter(l=>s.has(l.id)&&l.id!==t.id&&a.has(l.id))}function cE(t){let e=t.map(rE).join(`

---

`);return["\u4F60\u662F TraceMind \u601D\u8003\u63A2\u7D22\u7684\u6210\u679C\u603B\u7ED3\u4EE3\u7406\u3002","\u8BF7\u57FA\u4E8E\u7528\u6237\u660E\u786E\u8FDE\u63A5\u5230 output block \u7684\u4E0A\u6E38\u601D\u8003\u94FE\u8DEF\uFF0C\u8F93\u51FA Markdown \u683C\u5F0F\u7684\u601D\u8003\u6210\u679C\u603B\u7ED3\u3002",de(t),"","\u8981\u6C42\uFF1A","- \u8F93\u51FA Markdown","- \u7B2C\u4E00\u884C\u4F7F\u7528\u4E00\u4E2A\u6839\u636E\u5185\u5BB9\u81EA\u62DF\u7684\u4E00\u7EA7\u6807\u9898","- \u4E0D\u8981\u4F7F\u7528\u300CTraceMind \u601D\u8003\u63A2\u7D22\u6210\u679C\u603B\u7ED3\u300D\u300C\u601D\u8003\u6210\u679C\u603B\u7ED3\u300D\u300C\u6210\u679C\u603B\u7ED3\u300D\u8FD9\u7C7B\u6A21\u677F\u5316\u6807\u9898","- \u4FDD\u7559\u539F\u59CB\u6765\u6E90\u3001\u5173\u952E\u95EE\u9898\u3001\u7528\u6237\u56DE\u590D\u548C agent \u56DE\u5E94\u4E2D\u7684\u91CD\u8981\u4FE1\u606F","- \u4E0D\u8981\u628A\u6CA1\u6709\u6839\u636E\u7684\u65B0\u4FE1\u606F\u5199\u6210\u4E8B\u5B9E","- \u7528\u7B80\u6D01\u7ED3\u6784\u5448\u73B0\uFF1A\u6838\u5FC3\u7ED3\u8BBA\u3001\u5173\u952E\u4F9D\u636E\u3001\u5F85\u9A8C\u8BC1\u95EE\u9898\u3001\u4E0B\u4E00\u6B65\u5EFA\u8BAE","- \u63A7\u5236\u5728 800 \u4E2A\u4E2D\u6587\u5B57\u4EE5\u5185","","\u4E0A\u6E38 block\uFF1A",e||"\uFF08\u65E0\uFF09"].join(`
`)}function N5(t){return t.replace(/^#+\s+/gm,"").replace(/[-*]\s+/g,"").replace(/\s+/g," ").trim().slice(0,120)||"\u5DF2\u751F\u6210\u601D\u8003\u6210\u679C\u603B\u7ED3"}function uE(t){let e=t.replace(/\s+/g," ").replace(/^#+\s*/,"").trim();return e.length>28?`${e.slice(0,27)}\u2026`:e||"\u8FD9\u6B21\u63A2\u7D22\u7684\u6838\u5FC3\u5224\u65AD"}async function P5(t,e){let i=e.map(r=>r.summary||r.detail||r.title).filter(Boolean).slice(0,2).join("\uFF1B")||t.title,a=[`# ${uE(i)}`,"",`\u6838\u5FC3\u7ED3\u8BBA\uFF1A\u8FD9\u6B21\u63A2\u7D22\u56F4\u7ED5\u300C${i}\u300D\u5F62\u6210\u4E86\u4E00\u4E2A\u53EF\u7EE7\u7EED\u63A8\u8FDB\u7684\u5224\u65AD\u3002`,"","## \u4E0B\u4E00\u6B65","","- \u4FDD\u7559\u5173\u952E\u95EE\u9898","- \u660E\u786E\u6700\u5C0F\u9A8C\u8BC1\u884C\u52A8"].join(`
`);return{...t,summary:N5(a),detail:a,data:{...t.data||{},outputStatus:"ready",generatedFromBlockIds:e.map(r=>r.id),generatedAt:new Date().toISOString(),providerKey:"codex"}}}async function j5(t,e,n,i){let a=await Ie({providerKey:n,prompt:cE(e),cwd:i,timeoutMs:3e5}),r=a.status==="completed"?(a.output.trim()||"Agent \u6CA1\u6709\u8FD4\u56DE\u6709\u6548\u603B\u7ED3\u3002").slice(0,4e3):`\u751F\u6210\u603B\u7ED3\u5931\u8D25\uFF1A${a.error||a.status}

${a.output}`;return{...t,summary:N5(r),detail:r,agentRunId:a.runId,data:{...t.data||{},outputStatus:a.status==="completed"?"ready":"error",generatedFromBlockIds:e.map(s=>s.id),generatedAt:new Date().toISOString(),providerKey:n,error:a.status==="completed"?void 0:a.error}}}function dE(t){return{method:"frame_problem",summary:"\u751F\u6210\u7834\u9898\u62F7\u95EE\u95EE\u9898",blocks:[{id:wt(),category:"thinking",type:"frame_question",title:"\u7834\u9898\u62F7\u95EE 1",summary:"\u4F60\u771F\u6B63\u60F3\u89E3\u51B3\u7684\u662F\u4EC0\u4E48\uFF1F",data:{dimension:"essence"}},{id:wt(),category:"thinking",type:"frame_question",title:"\u7834\u9898\u62F7\u95EE 2",summary:"\u8FD9\u4E2A\u95EE\u9898\u4E3A\u4EC0\u4E48\u73B0\u5728\u91CD\u8981\uFF1F",data:{dimension:"motive"}},{id:wt(),category:"thinking",type:"frame_question",title:"\u7834\u9898\u62F7\u95EE 3",summary:"\u4F60\u9ED8\u8BA4\u6210\u7ACB\u7684\u524D\u63D0\u662F\u4EC0\u4E48\uFF1F",data:{dimension:"assumption"}},{id:wt(),category:"thinking",type:"frame_question",title:"\u7834\u9898\u62F7\u95EE 4",summary:"\u5982\u679C\u53CD\u8FC7\u6765\u770B\u4F1A\u600E\u6837\uFF1F",data:{dimension:"opposite"}},{id:wt(),category:"thinking",type:"frame_question",title:"\u7834\u9898\u62F7\u95EE 5",summary:"\u6700\u5C0F\u53EF\u9A8C\u8BC1\u7684\u4E00\u6B65\u662F\u4EC0\u4E48\uFF1F",data:{dimension:"action"}}],edges:[],layout:{mode:"radial"}}}function pE(t){let e=t.map(i=>i.summary||i.detail||i.title).filter(Boolean).slice(0,2).join("\uFF1B"),n=ir(e||t[0]?.title||"\u5F53\u524D\u4E3B\u9898",18);return{method:"brainstorming",summary:"\u751F\u6210\u5934\u8111\u98CE\u66B4\u65B9\u5411",blocks:[{id:wt(),category:"thinking",type:"insight",title:"\u6362\u4E2A\u5207\u53E3",summary:`\u56F4\u7ED5\u300C${n}\u300D\u627E\u4E00\u4E2A\u66F4\u5C0F\u7684\u5207\u5165\u70B9\u3002`,detail:`\u5173\u8054\u7EBF\u7D22\uFF1A${n}\u3002\u5148\u627E\u4E00\u4E2A\u771F\u5B9E\u3001\u5177\u4F53\u3001\u53EF\u89C2\u5BDF\u7684\u5C0F\u573A\u666F\uFF0C\u4E0D\u6025\u7740\u6269\u6210\u5B8C\u6574\u65B9\u6848\u3002`,data:{dimension:"direction",anchor:n}},{id:wt(),category:"thinking",type:"insight",title:"\u91CD\u65B0\u7EC4\u5408",summary:`\u628A\u300C${n}\u300D\u548C\u5DF2\u51FA\u73B0\u6750\u6599\u7EC4\u5408\u6210\u66F4\u5C0F\u5B9E\u9A8C\u3002`,detail:`\u5173\u8054\u7EBF\u7D22\uFF1A${n}\u3002\u4F18\u5148\u91CD\u7EC4\u8F93\u5165\u91CC\u5DF2\u7ECF\u51FA\u73B0\u7684\u7EBF\u7D22\uFF0C\u4E0D\u5F15\u5165\u65E0\u4F9D\u636E\u7684\u65B0\u4E3B\u9898\u3002`,data:{dimension:"combination",anchor:n}},{id:wt(),category:"thinking",type:"risk",title:"\u53CD\u5E38\u8BC6\u5047\u8BBE",summary:`\u53CD\u8FC7\u6765\u68C0\u67E5\u300C${n}\u300D\u662F\u5426\u88AB\u8FC7\u5EA6\u590D\u6742\u5316\u3002`,detail:`\u5173\u8054\u7EBF\u7D22\uFF1A${n}\u3002\u5C1D\u8BD5\u7528\u66F4\u7B80\u5355\u7684\u89E3\u91CA\u770B\u5F85\u539F\u95EE\u9898\uFF0C\u907F\u514D\u628A\u53D1\u6563\u53D8\u6210\u8DD1\u9898\u3002`,data:{dimension:"contrarian",anchor:n}},{id:wt(),category:"thinking",type:"experiment",title:"\u4E00\u5929\u5185\u9A8C\u8BC1",summary:`\u56F4\u7ED5\u300C${n}\u300D\u8BBE\u8BA1\u4E00\u4E2A\u4E00\u5929\u5185\u53EF\u5B8C\u6210\u7684\u5C0F\u9A8C\u8BC1\u3002`,detail:`\u5173\u8054\u7EBF\u7D22\uFF1A${n}\u3002\u76EE\u6807\u4E0D\u662F\u8BC1\u660E\u5B8C\u6574\u65B9\u6848\uFF0C\u800C\u662F\u62FF\u5230\u4E00\u4E2A\u80FD\u63A8\u52A8\u4E0B\u4E00\u6B65\u5224\u65AD\u7684\u5C0F\u8BC1\u636E\u3002`,data:{dimension:"action",anchor:n}},{id:wt(),category:"thinking",type:"insight",title:"\u6362\u4E2A\u8BF4\u6CD5",summary:`\u7ED9\u300C${n}\u300D\u6362\u6210\u4E00\u53E5\u66F4\u5BB9\u6613\u7406\u89E3\u7684\u8868\u8FBE\u3002`,detail:`\u5173\u8054\u7EBF\u7D22\uFF1A${n}\u3002\u5982\u679C\u8981\u8BB2\u7ED9\u522B\u4EBA\u542C\uFF0C\u5148\u7528\u4E00\u53E5\u666E\u901A\u4EBA\u80FD\u61C2\u7684\u8BDD\u8BF4\u6E05\u695A\u3002`,data:{dimension:"naming",anchor:n}}],edges:[],layout:{mode:"cluster"}}}function fE(t){let e=t.map(r=>r.summary||r.detail||r.title).filter(Boolean).slice(0,2).join("\uFF1B"),n=ir(e||t[0]?.title||"\u5F53\u524D\u4E3B\u9898",18),i=[{id:"branch-a",title:"\u5206\u652F A",summary:"\u5148\u62C6\u6E05\u695A\u6838\u5FC3\u95EE\u9898\u548C\u8FB9\u754C\u3002",leaves:["\u771F\u6B63\u8981\u89E3\u51B3\u7684\u95EE\u9898","\u4E0D\u9700\u8981\u89E3\u51B3\u7684\u8FB9\u754C","\u5F53\u524D\u5DF2\u6709\u7EBF\u7D22"]},{id:"branch-b",title:"\u5206\u652F B",summary:"\u518D\u62C6\u76F8\u5173\u7528\u6237\u548C\u4F7F\u7528\u573A\u666F\u3002",leaves:["\u76EE\u6807\u7528\u6237\u662F\u8C01","\u89E6\u53D1\u9700\u6C42\u7684\u65F6\u523B","\u5F53\u524D\u66FF\u4EE3\u65B9\u6848"]},{id:"branch-c",title:"\u5206\u652F C",summary:"\u7EE7\u7EED\u62C6\u53EF\u7528\u8D44\u6E90\u548C\u7EA6\u675F\u3002",leaves:["\u5DF2\u6709\u8D44\u6E90","\u5173\u952E\u9650\u5236","\u4E0D\u53EF\u63A7\u56E0\u7D20"]},{id:"branch-d",title:"\u5206\u652F D",summary:"\u6700\u540E\u62C6\u4E0B\u4E00\u6B65\u9A8C\u8BC1\u52A8\u4F5C\u3002",leaves:["\u6700\u5C0F\u5B9E\u9A8C","\u89C2\u5BDF\u6307\u6807","\u590D\u76D8\u8282\u70B9"]}];return{method:"mind_map",summary:"\u751F\u6210\u601D\u7EF4\u5BFC\u56FE",blocks:i.flatMap((r,s)=>[{id:r.id,category:"thinking",type:"insight",title:r.title,summary:r.summary,detail:`\u56F4\u7ED5\u300C${n}\u300D\u5EFA\u7ACB\u4E00\u7EA7\u5206\u652F\uFF0C\u5148\u628A\u8FD9\u4E00\u7C7B\u95EE\u9898\u5355\u72EC\u62C6\u5F00\u3002`,data:{level:1,role:"branch",anchor:n}},...r.leaves.map((o,l)=>({id:`${r.id}-leaf-${l+1}`,category:"thinking",type:"task",title:`\u8981\u70B9 ${String.fromCharCode(65+s)}${l+1}`,summary:o,detail:`\u56F4\u7ED5\u300C${n}\u300D\u5728\u300C${r.title}\u300D\u4E0B\u7EE7\u7EED\u62C6\u89E3\uFF1A${o}\u3002`,data:{level:2,role:"leaf",parentId:r.id,anchor:n}}))]),edges:i.flatMap(r=>r.leaves.map((s,o)=>({from:r.id,to:`${r.id}-leaf-${o+1}`,type:"leads_to"}))),layout:{mode:"mind_map"}}}function hE(t){let e=t.map(i=>i.summary||i.detail||i.title).filter(Boolean).slice(0,2).join("\uFF1B"),n=ir(e||t[0]?.title||"\u5F53\u524D\u9009\u62E9",18);return{method:"decision_tree",summary:"\u751F\u6210\u51B3\u7B56\u6811",blocks:[{id:wt(),category:"thinking",type:"decision",title:"\u51B3\u7B56\u95EE\u9898",summary:`\u5982\u4F55\u5224\u65AD\u300C${n}\u300D\u7684\u4E0B\u4E00\u6B65\uFF1F`,detail:`\u5224\u65AD\u4F9D\u636E\uFF1A${n}\u3002\u5148\u628A\u95EE\u9898\u6536\u655B\u6210\u4E00\u4E2A\u9700\u8981\u9009\u62E9\u7684\u5224\u65AD\u3002`,data:{role:"decision_question"}},{id:wt(),category:"thinking",type:"decision",title:"\u65B9\u6848 A",summary:"\u5C3D\u5FEB\u63A8\u8FDB\uFF0C\u628A\u5B83\u4F5C\u4E3A\u4E3B\u8DEF\u5F84\u9A8C\u8BC1\u3002",detail:`\u5224\u65AD\u4F9D\u636E\uFF1A${n}\u3002\u9002\u5408\u5728\u673A\u4F1A\u7A97\u53E3\u660E\u786E\u3001\u8D44\u6E90\u8DB3\u591F\u65F6\u4F18\u5148\u63A8\u8FDB\u3002`,data:{role:"option"}},{id:wt(),category:"thinking",type:"decision",title:"\u65B9\u6848 B",summary:"\u5148\u5C0F\u8303\u56F4\u8BD5\u70B9\uFF0C\u518D\u51B3\u5B9A\u662F\u5426\u6269\u5927\u3002",detail:`\u5224\u65AD\u4F9D\u636E\uFF1A${n}\u3002\u9002\u5408\u5728\u4EF7\u503C\u65B9\u5411\u770B\u8D77\u6765\u6210\u7ACB\u3001\u4F46\u8BC1\u636E\u8FD8\u4E0D\u591F\u65F6\u4F7F\u7528\u3002`,data:{role:"option"}},{id:wt(),category:"thinking",type:"risk",title:"\u5173\u952E\u98CE\u9669",summary:"\u8FC7\u65E9\u6295\u5165\u53EF\u80FD\u653E\u5927\u9519\u8BEF\u5224\u65AD\u3002",detail:"\u5224\u65AD\u4F9D\u636E\uFF1A\u5F53\u524D\u6750\u6599\u8FD8\u6CA1\u6709\u5F62\u6210\u8DB3\u591F\u5F3A\u7684\u9A8C\u8BC1\u8BC1\u636E\uFF0C\u98CE\u9669\u5728\u4E8E\u628A\u5047\u8BBE\u5F53\u6210\u7ED3\u8BBA\u3002",data:{role:"risk"}},{id:wt(),category:"thinking",type:"assumption",title:"\u5173\u952E\u5047\u8BBE",summary:"\u76EE\u6807\u7528\u6237\u786E\u5B9E\u613F\u610F\u4E3A\u8BE5\u80FD\u529B\u4ED8\u51FA\u6210\u672C\u3002",detail:"\u5224\u65AD\u4F9D\u636E\uFF1A\u5982\u679C\u7528\u6237\u53EA\u662F\u89C9\u5F97\u6709\u8DA3\u800C\u4E0D\u662F\u9AD8\u9891\u9700\u8981\uFF0C\u6218\u7565\u4EF7\u503C\u4F1A\u660E\u663E\u4E0B\u964D\u3002",data:{role:"assumption"}},{id:wt(),category:"thinking",type:"experiment",title:"\u6700\u5C0F\u9A8C\u8BC1",summary:"\u627E 3-5 \u4E2A\u771F\u5B9E\u7528\u6237\u505A\u4E00\u6B21\u4ED8\u8D39\u6216\u627F\u8BFA\u6D4B\u8BD5\u3002",detail:"\u5224\u65AD\u4F9D\u636E\uFF1A\u7528\u6700\u5C0F\u6210\u672C\u9A8C\u8BC1\u771F\u5B9E\u610F\u613F\uFF0C\u800C\u4E0D\u662F\u7EE7\u7EED\u505C\u7559\u5728\u6982\u5FF5\u8BA8\u8BBA\u3002",data:{role:"validation"}}],edges:[],layout:{mode:"decision_tree"}}}function gE(t){let e=t.map(a=>a.summary||a.detail||a.title).filter(Boolean).slice(0,2).join("\uFF1B"),n=ir(e||t[0]?.title||"\u5F53\u524D\u4EA7\u54C1\u4E3B\u9898",18),i=(a,r,s,o,l,c,u)=>[{id:wt(),category:"thinking",type:"insight",title:`\u76EE\u6807\u7528\u6237 ${s}`,summary:`${r}\u53EF\u80FD\u662F\u300C${n}\u300D\u7684\u5019\u9009\u76EE\u6807\u7528\u6237\u3002`,detail:`\u4F9D\u636E\uFF1A${n}\u3002\u8FD9\u7C7B\u7528\u6237\u6709\u660E\u786E\u573A\u666F\u548C\u5224\u65AD\u538B\u529B\uFF0C\u503C\u5F97\u4F5C\u4E3A\u5019\u9009\u4EBA\u7FA4\u6BD4\u8F83\u3002`,data:{role:"target_user",userSegment:r,anchor:n,row:a}},{id:wt(),category:"thinking",type:"insight",title:`\u573A\u666F ${s}`,summary:o,detail:`\u4F9D\u636E\uFF1A${n}\u3002\u5148\u786E\u8BA4\u8FD9\u7C7B\u7528\u6237\u5728\u4EC0\u4E48\u60C5\u5883\u4E0B\u4F1A\u4E3B\u52A8\u5BFB\u627E\u89E3\u51B3\u65B9\u6848\u3002`,data:{role:"scenario",userSegment:r,anchor:n,row:a}},{id:wt(),category:"thinking",type:"task",title:`\u4EFB\u52A1 ${s}`,summary:l,detail:`\u4F9D\u636E\uFF1A${n}\u3002\u6838\u5FC3\u4EFB\u52A1\u8981\u8868\u8FBE\u7528\u6237\u60F3\u5B8C\u6210\u7684\u8FDB\u5C55\uFF0C\u800C\u4E0D\u662F\u4EA7\u54C1\u529F\u80FD\u6E05\u5355\u3002`,data:{role:"job",userSegment:r,anchor:n,row:a}},{id:wt(),category:"thinking",type:"risk",title:`\u75DB\u70B9 ${s}`,summary:c,detail:`\u4F9D\u636E\uFF1A${n}\u3002\u75DB\u70B9\u8D8A\u5F3A\uFF0C\u8D8A\u53EF\u80FD\u5F62\u6210\u4F18\u5148\u670D\u52A1\u548C\u4ED8\u8D39\u9A8C\u8BC1\u7684\u7406\u7531\u3002`,data:{role:"pain",userSegment:r,anchor:n,row:a}},{id:wt(),category:"thinking",type:"insight",title:`\u4EF7\u503C ${s}`,summary:u,detail:`\u4F9D\u636E\uFF1A${n}\u3002\u6700\u5C0F\u9A8C\u8BC1\uFF1A\u627E 3 \u4F4D${r}\u7528\u771F\u5B9E\u95EE\u9898\u6D4B\u8BD5\u4ED6\u4EEC\u662F\u5426\u613F\u610F\u6301\u7EED\u4F7F\u7528\u601D\u8003\u63A2\u7D22\u767D\u677F\u3002`,data:{role:"value",userSegment:r,anchor:n,row:a}}];return{method:"user_map",summary:"\u751F\u6210\u7528\u6237\u5730\u56FE",blocks:[...i(1,"\u72EC\u7ACB\u5F00\u53D1\u8005","A","\u505A\u4EA7\u54C1\u53D6\u820D\u548C\u5546\u4E1A\u6A21\u5F0F\u5224\u65AD\u65F6\u89E6\u53D1\u9700\u6C42\u3002","\u628A\u96F6\u6563\u60F3\u6CD5\u8F6C\u6210\u4E0B\u4E00\u6B65\u53EF\u6267\u884C\u9009\u62E9\u3002","\u666E\u901A AI \u804A\u5929\u5BB9\u6613\u6563\uFF0C\u4E2A\u4EBA\u5224\u65AD\u94FE\u8DEF\u96BE\u4EE5\u6C89\u6DC0\u3002","\u7528\u767D\u677F\u627F\u63A5\u65E5\u8BB0\u3001\u6750\u6599\u548C agent \u5206\u6790\uFF0C\u5F62\u6210\u53EF\u590D\u7528\u5224\u65AD\u3002"),...i(2,"\u4EA7\u54C1\u7ECF\u7406","B","\u9700\u6C42\u8BC4\u5BA1\u3001\u7ADE\u54C1\u5206\u6790\u548C\u8DEF\u7EBF\u89C4\u5212\u524D\u89E6\u53D1\u9700\u6C42\u3002","\u628A\u7528\u6237\u53CD\u9988\u3001\u6750\u6599\u548C\u529F\u80FD\u4F18\u5148\u7EA7\u6574\u7406\u6210\u56E2\u961F\u53EF\u8BA8\u8BBA\u7ED3\u6784\u3002","\u4FE1\u606F\u5206\u6563\u5728\u7B14\u8BB0\u3001\u804A\u5929\u548C\u6587\u6863\u91CC\uFF0C\u96BE\u4EE5\u8FFD\u8E2A\u63A8\u7406\u8FC7\u7A0B\u3002","\u628A\u5206\u6790\u8FC7\u7A0B\u53D8\u6210\u53EF\u5171\u4EAB\u7684\u7ED3\u6784\u5316\u767D\u677F\u3002"),...i(3,"\u521B\u4E1A\u8005","C","\u6218\u7565\u9009\u62E9\u3001\u5546\u4E1A\u6A21\u5F0F\u548C\u65E9\u671F\u7528\u6237\u5224\u65AD\u65F6\u89E6\u53D1\u9700\u6C42\u3002","\u964D\u4F4E\u9AD8\u4E0D\u786E\u5B9A\u6027\uFF0C\u628A\u60F3\u6CD5\u548C\u8BC1\u636E\u6536\u675F\u6210\u9636\u6BB5\u6027\u5224\u65AD\u3002","\u60F3\u6CD5\u591A\u4F46\u5224\u65AD\u4F9D\u636E\u4E0D\u7A33\u5B9A\uFF0C\u5BB9\u6613\u5728\u53CD\u590D\u8BA8\u8BBA\u4E2D\u4E22\u5931\u7EBF\u7D22\u3002","\u7528\u601D\u8003\u63A2\u7D22\u6301\u7EED\u6C89\u6DC0\u6218\u7565\u5224\u65AD\u548C\u9A8C\u8BC1\u95EE\u9898\u3002")].flat(),edges:[],layout:{mode:"user_map"}}}function mE(t){let e=t.map(i=>i.summary||i.detail||i.title).filter(Boolean).slice(0,2).join("\uFF1B"),n=ir(e||t[0]?.title||"\u5F53\u524D\u6218\u7565\u4E3B\u9898",18);return{method:"rise",summary:"\u751F\u6210 RISE Reality \u9636\u6BB5",blocks:[{id:wt(),category:"thinking",type:"insight",title:"Reality 1\uFF5C\u73B0\u5B9E\u5224\u65AD",summary:`\u56F4\u7ED5\u300C${n}\u300D\uFF0C\u5F53\u524D\u6700\u786E\u5B9A\u7684\u4E8B\u5B9E\u662F\u4EC0\u4E48\uFF1F`,detail:"\u5148\u628A\u4E8B\u5B9E\u3001\u731C\u6D4B\u548C\u613F\u671B\u5206\u5F00\uFF0C\u907F\u514D\u540E\u7EED\u6218\u7565\u5224\u65AD\u5EFA\u7ACB\u5728\u6A21\u7CCA\u524D\u63D0\u4E0A\u3002",data:{stage:"reality"}},{id:wt(),category:"thinking",type:"risk",title:"Reality 2\uFF5C\u73B0\u5B9E\u7EA6\u675F",summary:"\u54EA\u4E9B\u8D44\u6E90\u3001\u65F6\u95F4\u6216\u80FD\u529B\u7EA6\u675F\u4E0D\u80FD\u5047\u88C5\u4E0D\u5B58\u5728\uFF1F",detail:"\u6218\u7565\u4E0D\u662F\u613F\u671B\u6E05\u5355\uFF0C\u9700\u8981\u5148\u770B\u6E05\u771F\u5B9E\u8FB9\u754C\u3002",data:{stage:"reality"}},{id:wt(),category:"thinking",type:"insight",title:"Reality 3\uFF5C\u5173\u952E\u4E0D\u786E\u5B9A\u6027",summary:"\u54EA\u4E2A\u4E0D\u786E\u5B9A\u6027\u6700\u5F71\u54CD\u4F60\u4E0B\u4E00\u6B65\u5224\u65AD\uFF1F",detail:"\u627E\u51FA\u6700\u9700\u8981\u88AB\u9A8C\u8BC1\u7684\u53D8\u91CF\uFF0C\u540E\u7EED\u6D1E\u5BDF\u624D\u6709\u6293\u624B\u3002",data:{stage:"reality"}}],edges:[],layout:{mode:"rise"}}}function yE(t,e){let n=m1(t),i=e.trim()||"\u8FD9\u6761\u56DE\u590D",r={reality:{type:"insight",title:"Reality 1\uFF5C\u73B0\u5B9E\u5224\u65AD",summary:"\u7EE7\u7EED\u6821\u51C6\u73B0\u5B9E\u3002",detail:"\u8865\u5145\u66F4\u591A\u4E8B\u5B9E\u4E0E\u7EA6\u675F\u3002"},insight:{type:"insight",title:`${n} 1\uFF5C\u5173\u952E\u6D1E\u5BDF`,summary:`\u4ECE\u300C${ir(i,18)}\u300D\u770B\uFF0C\u771F\u6B63\u7684\u95EE\u9898\u53EF\u80FD\u4E0D\u5728\u8868\u5C42\u3002`,detail:"\u8FD9\u6761\u56DE\u590D\u63D0\u793A\u9700\u8981\u628A\u6CE8\u610F\u529B\u4ECE\u8868\u9762\u9009\u62E9\u8F6C\u5411\u5E95\u5C42\u74F6\u9888\u3001\u771F\u5B9E\u9700\u6C42\u6216\u5173\u952E\u5047\u8BBE\u3002"},strategy:{type:"decision",title:`${n} 1\uFF5C\u6218\u7565\u9009\u62E9`,summary:"\u57FA\u4E8E\u8FD9\u6761\u6D1E\u5BDF\uFF0C\u4F18\u5148\u9009\u62E9\u4E00\u4E2A\u66F4\u805A\u7126\u7684\u6218\u7565\u65B9\u5411\u3002",detail:"\u6218\u7565\u9009\u62E9\u5E94\u8BF4\u660E\u805A\u7126\u4EC0\u4E48\u3001\u653E\u5F03\u4EC0\u4E48\uFF0C\u4EE5\u53CA\u4E3A\u4EC0\u4E48\u5B83\u7B26\u5408\u5F53\u524D\u8D44\u6E90\u7EA6\u675F\u3002"},execution:{type:"experiment",title:`${n} 1\uFF5C\u6700\u5C0F\u9A8C\u8BC1`,summary:"\u628A\u6218\u7565\u9009\u62E9\u8F6C\u6210\u4E00\u4E2A 1-2 \u5468\u5185\u53EF\u9A8C\u8BC1\u7684\u884C\u52A8\u3002",detail:"\u5EFA\u8BAE\u5B9A\u4E49\u6700\u5C0F\u5B9E\u9A8C\u3001\u89C2\u5BDF\u6307\u6807\u548C\u5931\u8D25\u540E\u7684\u8C03\u6574\u65B9\u5F0F\u3002"}}[t];return{method:"rise",summary:`\u63A8\u8FDB\u5230 ${n}`,blocks:[{id:wt(),category:"thinking",type:r.type,title:r.title,summary:r.summary,detail:r.detail,data:{stage:t}}],edges:[],layout:{mode:"rise"}}}function ir(t,e){let n=t.trim();return n.length<=e?n:n.slice(0,e)+"\u2026"}function xE(t){let e=(t.summary||t.detail||"").trim();return e||t.title.replace(/^拷问(本质|动机|假设|反面|行动)[：:]\s*/,"").trim()}var vE=["essence","motive","assumption","opposite","action"];function C1(t,e){return typeof t.id=="string"&&t.id.trim()?t.id.trim():`b${e+1}`}function $5(t,e,n){let i=C1(t,e);return`${n}-${i.replace(/[^A-Za-z0-9_-]/g,"-")}`}function hn(t,e){let n=new Map;return t.forEach((i,a)=>{let r=C1(i,a),s=`b${a+1}`,o=$5(i,a,e);n.set(r,o),n.set(s,o),n.set(String(a),o),n.set(String(a+1),o)}),n}function Es(t,e,n,i){return n.get(C1(t,e))||$5(t,e,i)}function ws(t=[],e){return t.map(n=>({...n,from:e.get(String(n.from))||n.from,to:e.get(String(n.to))||n.to}))}function bE(t){if(t.includes("\u672C\u8D28"))return"essence";if(t.includes("\u52A8\u673A"))return"motive";if(t.includes("\u5047\u8BBE"))return"assumption";if(t.includes("\u53CD\u9762"))return"opposite";if(t.includes("\u884C\u52A8"))return"action"}function U5(t,e,n,i=[]){let r=le.height,s=hn(t.blocks,n),o=t.blocks.map((l,c)=>{let u=t.blocks.length,f={x:460,y:-(u*r+(u-1)*56)/2+r/2+c*(r+56)},y=t.method==="frame_problem"||l.type==="question"||l.type==="frame_question",x=y?xE(l):l.summary||l.detail||l.title,E=typeof l.data?.dimension=="string"?l.data.dimension:bE(l.title)||vE[c];return ce({id:Es(l,c,s,n),category:y?"thinking":void 0,type:y?"frame_question":l.type,title:y?`\u7834\u9898\u62F7\u95EE ${c+1}`:l.title.slice(0,30),summary:y?x.slice(0,120):l.summary?.slice(0,120),bullets:void 0,detail:x.slice(0,2e3),sourceRefs:[e.id],agentRunId:n,position:{x:e.position.x+f.x,y:e.position.y+f.y},size:{...le},data:{...l.data||{},...y?{dimension:E}:{},originalAgentBlockId:l.id}})});return ks(o,[e],i)}function H5(t,e,n,i=[],a=e){let r=le.height,s=48,o=nr(a.length>0?a:e),l=e.map(y=>y.id),c=t.blocks.length,u=c*r+Math.max(0,c-1)*s,d=o.centerY-u/2,p=hn(t.blocks,n),f=t.blocks.map((y,x)=>ce({id:Es(y,x,p,n),category:"thinking",type:y.type,title:y.title.slice(0,30),summary:(y.summary||y.detail||y.title).slice(0,120),bullets:y.bullets,detail:(y.detail||y.summary||y.title).slice(0,2e3),sourceRefs:l,agentRunId:n,position:{x:o.maxX+180,y:d+x*(r+s)},size:{...le},data:{...y.data||{},method:"brainstorming",originalAgentBlockId:y.id}}));return ks(f,a,i)}function al(t,e){return typeof t.id=="string"&&t.id.trim()?t.id.trim():`b${e+1}`}function k1(t){let e=t.data?.parentId;return typeof e=="string"&&e.trim()?e.trim():void 0}function F5(t){return t.data?.role==="branch"||t.data?.level===1||!k1(t)}function Y5(t,e,n,i=[],a=e){let r=le.width,s=le.height,o=180,l=150,c=34,u=64,d=nr(a.length>0?a:e),p=hn(t.blocks,n),f=e.map(T=>T.id),y=t.blocks.filter(F5),x=new Set(y.map((T,P)=>al(T,t.blocks.indexOf(T)>=0?t.blocks.indexOf(T):P))),E=y.length>0?y:t.blocks.slice(0,1),v=new Map;t.blocks.forEach((T,P)=>{let D=k1(T);!D||x.has(al(T,P))||v.set(D,[...v.get(D)||[],{block:T,index:P}])});let h=E.map((T,P)=>{let D=t.blocks.indexOf(T),I=D>=0?D:P,q=al(T,I),Et=v.get(q)||[],te=Et.length>0?Et.length*s+(Et.length-1)*c:s;return{branch:T,index:I,rawId:q,leaves:Et,height:Math.max(s,te)}}),b=h.reduce((T,P)=>T+P.height,0)+Math.max(0,h.length-1)*u,w=d.centerY-b/2,B=new Map;h.forEach(T=>{let P=w;B.set(T.rawId,{x:d.maxX+o,y:P+T.height/2-s/2});let D=T.leaves.length>0?T.leaves.length*s+(T.leaves.length-1)*c:0,I=P+T.height/2-D/2;T.leaves.forEach(q=>{B.set(al(q.block,q.index),{x:d.maxX+o+r+l,y:I}),I+=s+c}),w+=T.height+u});let j=t.blocks.map((T,P)=>{let D=al(T,P),I=k1(T),q=I?p.get(I):void 0,Et=F5(T)?1:2;return ce({id:Es(T,P,p,n),category:"thinking",type:T.type,title:T.title.slice(0,30),summary:(T.summary||T.detail||T.title).slice(0,120),bullets:T.bullets,detail:(T.detail||T.summary||T.title).slice(0,2e3),sourceRefs:f,agentRunId:n,position:B.get(D)||{x:d.maxX+o,y:d.centerY+P*(s+c)},size:{...le},data:{...T.data||{},method:"mind_map",level:Et,role:Et===1?"branch":"leaf",parentId:q,originalAgentBlockId:T.id}})});return ks(j,a,i)}function ku(t){let e=String(t.data?.role||"");return e||(t.type==="risk"?"risk":t.type==="assumption"?"assumption":t.type==="experiment"?"validation":"option")}function er(t,e){return t.id||`index-${e}`}function kE(t,e){let n=le.width,i=le.height,a=170,s=i+220,l=e.maxX+180,c=l+n+a,u=c+n+a,d=u+n+a,p=new Map,f=t.blocks,y=Math.max(0,f.findIndex(D=>ku(D)==="decision_question")),x=f[y]||f[0],E=x?er(x,y):void 0,v=f.map((D,I)=>({block:D,index:I,role:ku(D)})).filter(D=>D.index!==y&&(D.role==="option"||D.block.type==="decision"&&D.role!=="decision_question")),h=v.length>0?v:f.map((D,I)=>({block:D,index:I,role:ku(D)})).filter(D=>D.index!==y).slice(0,2),b=h.map(D=>er(D.block,D.index)),w=new Map(b.map((D,I)=>[D,I])),B=Math.max(1,h.length),j=e.centerY-(B-1)*s/2;E&&p.set(E,{x:l,y:e.centerY-i/2}),h.forEach((D,I)=>{p.set(er(D.block,D.index),{x:c,y:j+I*s-i/2})});let T=new Map,P=[];return f.forEach((D,I)=>{let q=er(D,I),Et=ku(D);if(I===y||w.has(q))return;let te=t.edges?.find(L=>L.to===q&&w.has(L.from)),ze=te?w.get(te.from):void 0,$t={block:D,index:I,role:Et};typeof ze=="number"?T.set(ze,[...T.get(ze)||[],$t]):P.push($t)}),P.forEach((D,I)=>{let q=h.length>0?I%h.length:0;T.set(q,[...T.get(q)||[],D])}),T.forEach((D,I)=>{let q=j+I*s,Et=D.filter($t=>$t.role!=="validation"),te=D.filter($t=>$t.role==="validation"),ze=q-(Et.length-1)*(i+28)/2;Et.forEach(($t,L)=>{p.set(er($t.block,$t.index),{x:u,y:ze+L*(i+28)-i/2})}),te.forEach(($t,L)=>{p.set(er($t.block,$t.index),{x:d,y:q+L*(i+28)-i/2})})}),f.forEach((D,I)=>{let q=er(D,I);p.has(q)||p.set(q,{x:u,y:j+I*(i+28)-i/2})}),p}function V5(t,e,n,i=[],a=e){let r=nr(a.length>0?a:e),s=e.map(u=>u.id),o=kE(t,r),l=hn(t.blocks,n),c=t.blocks.map((u,d)=>ce({id:Es(u,d,l,n),category:"thinking",type:u.type,title:u.title.slice(0,30),summary:(u.summary||u.detail||u.title).slice(0,120),bullets:u.bullets,detail:(u.detail||u.summary||u.title).slice(0,2e3),sourceRefs:s,agentRunId:n,position:o.get(u.id||`index-${d}`)||o.get(`index-${d}`)||{x:r.maxX+180+340*(d%4),y:r.centerY+210*Math.floor(d/4)},size:{...le},data:{...u.data||{},method:"decision_tree",originalAgentBlockId:u.id}}));return ks(c,a,i)}function G5(t,e,n,i=[],a=e){let r=nr(a.length>0?a:e),s=e.map(v=>v.id),o=r.maxX+180,l=r.centerY,c=178,u=300,d=q5(t.blocks),p=hn(t.blocks,n),f=new Map,y=new Map;d.forEach((v,h)=>{fn.forEach((b,w)=>{let B=v[b];f.set(B?.id,h),y.set(B?.id,w)})});let x=l-(d.length-1)*c/2,E=t.blocks.map((v,h)=>{let b=f.get(v.id)??Math.floor(h/fn.length),w=y.get(v.id)??h%fn.length,B=X5(v.data?.role)||fn[w];return ce({id:Es(v,h,p,n),category:"thinking",type:v.type,title:EE(B,b).slice(0,30),summary:(v.summary||v.detail||v.title).slice(0,120),bullets:v.bullets,detail:(v.detail||v.summary||v.title).slice(0,2e3),sourceRefs:s,agentRunId:n,position:{x:o+w*u,y:x+b*c},size:{...le},data:{...v.data||{},method:"user_map",row:b+1,originalAgentBlockId:v.id}})});return ks(E,a,i)}function Eu(t,e,n,i=[],a=e,r){let s=le.height,o=48,l=nr(a.length>0?a:e),c=e.map(E=>E.id),u=t.blocks.length,d=u*s+Math.max(0,u-1)*o,p=r?r.position.x+r.size.width+150:l.maxX+180,f=(r?.position.y??l.centerY)-d/2+s/2,y=hn(t.blocks,n),x=t.blocks.map((E,v)=>{let h=typeof E.data?.stage=="string"?E.data.stage:"reality";return ce({id:Es(E,v,y,n),category:"thinking",type:E.type,title:E.title.slice(0,30),summary:(E.summary||E.detail||E.title).slice(0,120),bullets:E.bullets,detail:(E.detail||E.summary||E.title).slice(0,2e3),sourceRefs:c,agentRunId:n,position:{x:p,y:f+v*(s+o)},size:{...le},data:{...E.data||{},method:"rise",stage:h,originalAgentBlockId:E.id}})});return ks(x,a,i)}function q5(t){let e=new Map,n=[];t.forEach((a,r)=>{let s=X5(a.data?.role),o=String(a.data?.userSegment||a.data?.row||Math.floor(r/fn.length)+1);e.has(o)||e.set(o,{});let l=e.get(o);if(s)l[s]=a;else{let c=Math.floor(r/fn.length),u=n[c]||{};u[fn[r%fn.length]]=a,n[c]=u}});let i=[...e.values()].filter(a=>fn.some(r=>a[r]));return i.length>0?i:n}var fn=["target_user","scenario","job","pain","value"];function X5(t){return t==="opportunity"?"value":fn.includes(t)?t:void 0}function EE(t,e){let n=["A","B","C"][e]||String(e+1);return`${{target_user:"\u76EE\u6807\u7528\u6237",scenario:"\u573A\u666F",job:"\u4EFB\u52A1",pain:"\u75DB\u70B9",value:"\u4EF7\u503C"}[t]} ${n}`}function ve(t,e,n,i,a){return ce({type:"error",title:"Agent \u8F93\u51FA\u89E3\u6790\u5931\u8D25",summary:e.slice(0,120),detail:`\u9519\u8BEF\uFF1A${e}

\u539F\u59CB\u8F93\u51FA\uFF1A
${t.slice(0,1500)}`,sourceRefs:[n.id],agentRunId:i,position:{x:n.position.x+400,y:n.position.y},size:{width:Ee.width,height:140},data:{providerKey:a,error:e,rawOutput:t.slice(0,2e3)}})}async function S1(t,e=[]){let n=dE(t),i=`run-${Date.now()}`,a=U5(n,t,i,e),r=a.map(s=>dt({from:t.id,to:s.id,type:"derived_from",agentRunId:i}));return{blocks:a,edges:r,sourceBlockId:t.id,runId:i,providerKey:"codex"}}async function A1(t,e,n,i=[t],a=[]){let r=p5({selectedBlocks:i,intensity:"standard"}),s=await Ie({providerKey:e,prompt:r,cwd:n,timeoutMs:300*1e3}),o=s.runId;if(s.status!=="completed")return{blocks:[ve(s.output,s.error||`Agent \u6267\u884C\u72B6\u6001: ${s.status}`,t,o,e)],edges:[],sourceBlockId:t.id,runId:o,providerKey:e};let l=aa(s.output);if(!l.success)return{blocks:[ve(s.output,l.error,t,o,e)],edges:[],sourceBlockId:t.id,runId:o,providerKey:e};let c=U5(l.data,t,o,a),u=hn(l.data.blocks,o),d=ws(l.data.edges||[],u),p=[...c.map(f=>dt({from:t.id,to:f.id,type:"derived_from",agentRunId:o})),...d.map(f=>dt({from:f.from,to:f.to,type:f.type,label:f.label,agentRunId:o}))];return{blocks:c,edges:p,sourceBlockId:t.id,runId:o,providerKey:e}}async function T1(t,e=t,n=[]){let i=t.length>0?t:[],a=pE(e),r=`run-${Date.now()}`,s=H5(a,e,r,n,i),o=i.flatMap(l=>s.map(c=>dt({from:l.id,to:c.id,type:"derived_from",agentRunId:r})));return{blocks:s,edges:o,sourceBlockId:i[0]?.id||"",runId:r,providerKey:"codex"}}async function M1(t,e,n,i=t,a=[]){if(t.length===0){let x=`run-${Date.now()}`;return{blocks:[],edges:[],sourceBlockId:"",runId:x,providerKey:e}}let r=f5({selectedBlocks:i}),s=await Ie({providerKey:e,prompt:r,cwd:n,timeoutMs:300*1e3}),o=s.runId,l=t[0];if(s.status!=="completed")return{blocks:[ve(s.output,s.error||`Agent \u6267\u884C\u72B6\u6001: ${s.status}`,l,o,e)],edges:[],sourceBlockId:l.id,runId:o,providerKey:e};let c=aa(s.output);if(!c.success)return{blocks:[ve(s.output,c.error,l,o,e)],edges:[],sourceBlockId:l.id,runId:o,providerKey:e};let u=H5(c.data,i,o,a,t),d=hn(c.data.blocks,o),p=ws(c.data.edges||[],d),f=t.map(x=>x.id),y=[...t.flatMap(x=>u.map(E=>dt({from:x.id,to:E.id,type:"derived_from",agentRunId:o}))),...p.filter(x=>f.includes(x.from)||u.some(E=>E.id===x.from||E.id===x.to)).map(x=>dt({from:x.from,to:x.to,type:x.type,label:x.label,agentRunId:o}))];return{blocks:u,edges:y,sourceBlockId:t[0].id,runId:o,providerKey:e}}function wE(t){return t.filter(e=>e.data?.method==="mind_map"&&e.data?.role==="branch")}function K5(t,e,n,i=[]){let a=wE(e),r=t.flatMap(u=>a.map(d=>dt({from:u.id,to:d.id,type:"derived_from",agentRunId:n}))),s=new Set(e.map(u=>u.id)),o=i.filter(u=>s.has(u.from)&&s.has(u.to)).map(u=>dt({from:u.from,to:u.to,type:u.type,label:u.label,agentRunId:n})),l=new Set(o.map(u=>`${u.from}->${u.to}`)),c=e.filter(u=>u.data?.method==="mind_map"&&u.data?.role==="leaf"&&typeof u.data?.parentId=="string").filter(u=>s.has(String(u.data?.parentId))).filter(u=>!l.has(`${String(u.data?.parentId)}->${u.id}`)).map(u=>dt({from:String(u.data?.parentId),to:u.id,type:"leads_to",agentRunId:n}));return[...r,...o,...c]}async function _1(t,e=t,n=[]){let i=t.length>0?t:[],a=fE(e),r=`run-${Date.now()}`,s=Y5(a,e,r,n,i),o=hn(a.blocks,r),l=K5(i,s,r,ws(a.edges||[],o));return{blocks:s,edges:l,sourceBlockId:i[0]?.id||"",runId:r,providerKey:"codex"}}async function B1(t,e,n,i=t,a=[]){if(t.length===0){let f=`run-${Date.now()}`;return{blocks:[],edges:[],sourceBlockId:"",runId:f,providerKey:e}}let r=h5({selectedBlocks:i}),s=await Ie({providerKey:e,prompt:r,cwd:n,timeoutMs:300*1e3}),o=s.runId,l=t[0];if(s.status!=="completed")return{blocks:[ve(s.output,s.error||`Agent \u6267\u884C\u72B6\u6001: ${s.status}`,l,o,e)],edges:[],sourceBlockId:l.id,runId:o,providerKey:e};let c=aa(s.output);if(!c.success)return{blocks:[ve(s.output,c.error,l,o,e)],edges:[],sourceBlockId:l.id,runId:o,providerKey:e};let u=Y5(c.data,i,o,a,t),d=hn(c.data.blocks,o),p=K5(t,u,o,ws(c.data.edges||[],d));return{blocks:u,edges:p,sourceBlockId:t[0].id,runId:o,providerKey:e}}function Z5(t,e,n,i=[]){let a=t.map(u=>dt({from:u.id,to:e[0]?.id||u.id,type:"derived_from",agentRunId:n})),r=new Set(e.map(u=>u.id)),s=i.filter(u=>r.has(u.from)&&r.has(u.to)).map(u=>dt({from:u.from,to:u.to,type:u.type,label:u.label,agentRunId:n})),o=SE(e,n,s);if(s.length>0)return[...a,...s,...o];let l=[],c=Q5(e);if(!c)return a;for(let u of e.slice(1)){if(u.id===c.id)continue;let d=String(u.data?.role||""),p=d==="validation"&&e.length>3?e[Math.max(1,e.length-3)].id:c.id;l.push(dt({from:p,to:u.id,type:d==="validation"?"next_step":d==="risk"?"challenges":"leads_to",agentRunId:n}))}return[...a,...l]}function Q5(t){return t.find(e=>e.data?.role==="decision_question")||t[0]}function CE(t,e){return t.filter(n=>{if(n.id===e)return!1;let i=String(n.data?.role||"");return i==="option"||n.type==="decision"&&i!=="decision_question"})}function SE(t,e,n){let i=Q5(t);return i?CE(t,i.id).filter(r=>!n.some(s=>s.from===i.id&&s.to===r.id)).map(r=>dt({from:i.id,to:r.id,type:"leads_to",agentRunId:e})):[]}function J5(t,e,n,i=[]){let a=e.filter(d=>d.data?.role==="target_user"),r=a.length>0?a:e.slice(0,1),s=t.flatMap(d=>r.map(p=>dt({from:d.id,to:p.id,type:"derived_from",agentRunId:n}))),o=new Set(e.map(d=>d.id)),l=i.filter(d=>o.has(d.from)&&o.has(d.to)).map(d=>dt({from:d.from,to:d.to,type:d.type,label:d.label,agentRunId:n}));if(l.length>0)return[...s,...l];let c=[],u=q5(e);for(let d of u){let p=fn.map(f=>d[f]).filter(f=>typeof f?.id=="string");for(let f=0;f<p.length-1;f++){let y=fn[f+1];c.push(dt({from:p[f].id,to:p[f+1].id,type:y==="pain"?"challenges":y==="value"?"next_step":"leads_to",agentRunId:n}))}}return[...s,...c]}async function R1(t,e=t,n=[]){let i=t.length>0?t:[],a=hE(e),r=`run-${Date.now()}`,s=V5(a,e,r,n,i),o=Z5(i,s,r);return{blocks:s,edges:o,sourceBlockId:i[0]?.id||"",runId:r,providerKey:"codex"}}async function D1(t,e,n,i=t,a=[]){if(t.length===0){let f=`run-${Date.now()}`;return{blocks:[],edges:[],sourceBlockId:"",runId:f,providerKey:e}}let r=g5({selectedBlocks:i}),s=await Ie({providerKey:e,prompt:r,cwd:n,timeoutMs:300*1e3}),o=s.runId,l=t[0];if(s.status!=="completed")return{blocks:[ve(s.output,s.error||`Agent \u6267\u884C\u72B6\u6001: ${s.status}`,l,o,e)],edges:[],sourceBlockId:l.id,runId:o,providerKey:e};let c=aa(s.output);if(!c.success)return{blocks:[ve(s.output,c.error,l,o,e)],edges:[],sourceBlockId:l.id,runId:o,providerKey:e};let u=V5(c.data,i,o,a,t),d=hn(c.data.blocks,o),p=Z5(t,u,o,ws(c.data.edges||[],d));return{blocks:u,edges:p,sourceBlockId:t[0].id,runId:o,providerKey:e}}async function I1(t,e=t,n=[]){let i=t.length>0?t:[],a=gE(e),r=`run-${Date.now()}`,s=G5(a,e,r,n,i),o=J5(i,s,r);return{blocks:s,edges:o,sourceBlockId:i[0]?.id||"",runId:r,providerKey:"codex"}}async function F1(t,e,n,i=t,a=[]){if(t.length===0){let f=`run-${Date.now()}`;return{blocks:[],edges:[],sourceBlockId:"",runId:f,providerKey:e}}let r=m5({selectedBlocks:i}),s=await Ie({providerKey:e,prompt:r,cwd:n,timeoutMs:300*1e3}),o=s.runId,l=t[0];if(s.status!=="completed")return{blocks:[ve(s.output,s.error||`Agent \u6267\u884C\u72B6\u6001: ${s.status}`,l,o,e)],edges:[],sourceBlockId:l.id,runId:o,providerKey:e};let c=aa(s.output);if(!c.success)return{blocks:[ve(s.output,c.error,l,o,e)],edges:[],sourceBlockId:l.id,runId:o,providerKey:e};let u=G5(c.data,i,o,a,t),d=hn(c.data.blocks,o),p=J5(t,u,o,ws(c.data.edges||[],d));return{blocks:u,edges:p,sourceBlockId:t[0].id,runId:o,providerKey:e}}async function O1(t,e=t,n=[]){let i=t.length>0?t:[],a=mE(e),r=`run-${Date.now()}`,s=Eu(a,e,r,n,i),o=i.flatMap(l=>s.map(c=>dt({from:l.id,to:c.id,type:"derived_from",agentRunId:r})));return{blocks:s,edges:o,sourceBlockId:i[0]?.id||"",runId:r,providerKey:"codex"}}async function z1(t,e,n,i=t,a=[]){if(t.length===0){let p=`run-${Date.now()}`;return{blocks:[],edges:[],sourceBlockId:"",runId:p,providerKey:e}}let r=y5({selectedBlocks:i}),s=await Ie({providerKey:e,prompt:r,cwd:n,timeoutMs:300*1e3}),o=s.runId,l=t[0];if(s.status!=="completed")return{blocks:[ve(s.output,s.error||`Agent \u6267\u884C\u72B6\u6001: ${s.status}`,l,o,e)],edges:[],sourceBlockId:l.id,runId:o,providerKey:e};let c=aa(s.output);if(!c.success)return{blocks:[ve(s.output,c.error,l,o,e)],edges:[],sourceBlockId:l.id,runId:o,providerKey:e};let u=Eu(c.data,i,o,a,t),d=t.flatMap(p=>u.map(f=>dt({from:p.id,to:f.id,type:"derived_from",agentRunId:o})));return{blocks:u,edges:d,sourceBlockId:t[0].id,runId:o,providerKey:e}}function W5(t,e){let n=new Set((t.sourceRefs||[]).filter(a=>a!==t.id)),i=e.filter(a=>n.has(a.id));return i.length>0?i:[t]}async function L1(t,e,n=[]){let i=O5(t),a=i?g1(i):null,r=`run-${Date.now()}`;if(!a)return{blocks:[],edges:[],sourceBlockId:t.id,runId:r,providerKey:"codex"};let s=W5(t,n),o=yE(a,e.detail||e.summary||e.title),l=Eu(o,[...s,t,e],r,n,[t],e).map(u=>({...u,data:{...u.data||{},parentRiseBlockId:t.id,userReplyBlockId:e.id}})),c=l.map(u=>dt({from:e.id,to:u.id,type:"leads_to",agentRunId:r}));return{blocks:l,edges:c,sourceBlockId:t.id,runId:r,providerKey:"codex"}}async function N1(t,e,n,i,a=[]){let r=O5(t),s=r?g1(r):null,o=`run-${Date.now()}`;if(!s)return{blocks:[],edges:[],sourceBlockId:t.id,runId:o,providerKey:n};let l=W5(t,a),c=await Ie({providerKey:n,prompt:x5({sourceBlocks:l,currentBlock:t,userReplyBlock:e,nextStage:s}),cwd:i,timeoutMs:300*1e3}),u=c.runId;if(c.status!=="completed"){let y=ve(c.output,c.error||`Agent \u6267\u884C\u72B6\u6001: ${c.status}`,t,u,n);return{blocks:[y],edges:[dt({from:e.id,to:y.id,type:"leads_to",agentRunId:u})],sourceBlockId:t.id,runId:u,providerKey:n}}let d=aa(c.output);if(!d.success){let y=ve(c.output,d.error,t,u,n);return{blocks:[y],edges:[dt({from:e.id,to:y.id,type:"leads_to",agentRunId:u})],sourceBlockId:t.id,runId:u,providerKey:n}}let p=Eu(d.data,[...l,t,e],u,a,[t],e).map(y=>({...y,data:{...y.data||{},method:"rise",stage:y.data?.stage||s,parentRiseBlockId:t.id,userReplyBlockId:e.id}})),f=p.map(y=>dt({from:e.id,to:y.id,type:"leads_to",agentRunId:u}));return{blocks:p,edges:f,sourceBlockId:t.id,runId:u,providerKey:n}}function AE(t,e){return["\u4F60\u662F TraceMind \u601D\u8003\u63A2\u7D22\u4E2D\u7684\u601D\u8003\u56DE\u5E94\u4EE3\u7406\u3002","\u7528\u6237\u6B63\u5728\u56F4\u7ED5\u4E00\u4E2A\u767D\u677F block \u6301\u7EED\u601D\u8003\u3002\u8BF7\u57FA\u4E8E block \u5185\u5BB9\u548C\u7528\u6237\u56DE\u590D\uFF0C\u7ED9\u51FA\u7B80\u6D01\u3001\u6709\u63A8\u8FDB\u611F\u7684\u56DE\u5E94\u3002",de([t]),"","\u8981\u6C42\uFF1A","- \u53EA\u8F93\u51FA\u56DE\u5E94\u6B63\u6587\uFF0C\u4E0D\u8981 JSON\uFF0C\u4E0D\u8981 Markdown \u6807\u9898\u3002","- \u4E0D\u8981\u590D\u8FF0\u539F\u95EE\u9898\uFF0C\u4E0D\u8981\u957F\u7BC7\u5206\u6790\u3002","- \u63A7\u5236\u5728 120 \u4E2A\u4E2D\u6587\u5B57\u4EE5\u5185\u3002","- \u56DE\u5E94\u5E94\u5E2E\u52A9\u7528\u6237\u770B\u6E05\u4E0B\u4E00\u5C42\u95EE\u9898\u3001\u5173\u952E\u5047\u8BBE\u6216\u66F4\u6E05\u6670\u7684\u5224\u65AD\u3002","","Block \u6807\u9898\uFF1A",t.title,"","Block \u5185\u5BB9\uFF1A",aE(t),"","\u7528\u6237\u56DE\u590D\uFF1A",e].join(`
`)}function TE(t,e){return(t.replace(/^```[a-zA-Z]*\s*/g,"").replace(/```$/g,"").trim()||e).slice(0,240)}function t4(t){return ce({category:"response",type:"user_reply",title:`\u7528\u6237\u56DE\u590D ${t.replyIndex}`,summary:t.replyText.slice(0,120),detail:t.replyText.slice(0,2e3),sourceRefs:[t.sourceBlock.id],agentRunId:t.runId,position:{x:t.sourceBlock.position.x+t.sourceBlock.size.width+140,y:t.sourceBlock.position.y-60},size:{...le},data:{replyToBlockId:t.sourceBlock.id,replyIndex:t.replyIndex}})}function e4(t){return ce({category:"response",type:"agent_reply",title:`\u56DE\u5E94\uFF1A${ir(t.replyText,12)}`,summary:t.responseText.slice(0,120),detail:t.responseText.slice(0,2e3),sourceRefs:[t.sourceBlock.id,t.userReplyBlock.id],agentRunId:t.runId,position:{x:t.userReplyBlock.position.x+t.userReplyBlock.size.width+140,y:t.userReplyBlock.position.y+40},size:{...le},data:{replyToBlockId:t.sourceBlock.id,userReplyBlockId:t.userReplyBlock.id,providerKey:t.providerKey}})}async function P1(t,e,n){let i=`run-${Date.now()}`,a="\u8FD9\u4E2A\u56DE\u7B54\u5DF2\u7ECF\u66B4\u9732\u51FA\u4E00\u4E2A\u66F4\u6838\u5FC3\u7684\u5224\u65AD\uFF1A\u5148\u786E\u8BA4\u5B83\u662F\u5426\u771F\u91CD\u8981\uFF0C\u518D\u51B3\u5B9A\u8981\u4E0D\u8981\u6295\u5165\u66F4\u591A\u884C\u52A8\u3002",r=typeof n?.data?.replyIndex=="number"?n.data.replyIndex:1,s=n||t4({sourceBlock:t,replyText:e,runId:i,replyIndex:r}),o=e4({userReplyBlock:s,sourceBlock:t,replyText:e,responseText:a,runId:i,providerKey:"codex"}),l=[...n?[]:[dt({from:t.id,to:s.id,type:"answers",agentRunId:i})],dt({from:s.id,to:o.id,type:"leads_to",agentRunId:i})];return{blocks:n?[o]:[s,o],edges:l,sourceBlockId:t.id,runId:i,providerKey:"codex"}}async function j1(t,e,n,i,a,r){let s=await Ie({providerKey:n,prompt:AE(t,e),cwd:i,timeoutMs:3e5}),o=s.runId,l=typeof r?.data?.replyIndex=="number"?r.data.replyIndex:(a||[]).filter(f=>f.type==="user_reply"||f.title.startsWith("\u7528\u6237\u56DE\u590D")).length+1,c=r||t4({sourceBlock:t,replyText:e,runId:o,replyIndex:l});if(s.status!=="completed"){let f=ve(s.output,s.error||`Agent \u6267\u884C\u72B6\u6001: ${s.status}`,t,o,n),y=[...r?[]:[dt({from:t.id,to:c.id,type:"answers",agentRunId:o})],dt({from:c.id,to:f.id,type:"leads_to",agentRunId:o})];return{blocks:r?[f]:[c,f],edges:y,sourceBlockId:t.id,runId:o,providerKey:n}}let u=TE(s.output,"\u6211\u5DF2\u7ECF\u6536\u5230\u4F60\u7684\u56DE\u590D\uFF0C\u4F46 agent \u6CA1\u6709\u8FD4\u56DE\u6709\u6548\u5185\u5BB9\u3002"),d=e4({userReplyBlock:c,sourceBlock:t,replyText:e,responseText:u,runId:o,providerKey:n}),p=[...r?[]:[dt({from:t.id,to:c.id,type:"answers",agentRunId:o})],dt({from:c.id,to:d.id,type:"leads_to",agentRunId:o})];return{blocks:r?[d]:[c,d],edges:p,sourceBlockId:t.id,runId:o,providerKey:n}}qs();qs();var sa=Le(xa());Ml();var W=Le(yi()),BE={diary_source:"\u65E5\u8BB0\u6765\u6E90",entity_source:"\u5B9E\u4F53\u6765\u6E90",material_source:"\u7D20\u6750\u6765\u6E90",user_note:"\u7528\u6237\u7B14\u8BB0",frame_question:"\u7834\u9898\u62F7\u95EE",user_reply:"\u7528\u6237\u56DE\u590D",agent_reply:"Agent \u56DE\u5E94",question:"\u95EE\u9898",assumption:"\u5047\u8BBE",insight:"\u6D1E\u5BDF",risk:"\u98CE\u9669",experiment:"\u5B9E\u9A8C",task:"\u4EFB\u52A1",decision:"\u51B3\u7B56",memory:"\u8BB0\u5FC6",output:"\u8F93\u51FA",error:"\u9519\u8BEF",warning:"\u63D0\u793A"};function RE(t){navigator.clipboard.writeText(t).catch(()=>{})}function r4(t){return t.detail||t.summary||""}function $1(t){return typeof t.data?.promptHint=="string"?t.data.promptHint:""}function U1(t){return t.data?.memoryRetrievalEnabled===!0}function s4({block:t,onUpdate:e,onDelete:n,onClose:i}){let[a,r]=(0,sa.useState)(t.title),[s,o]=(0,sa.useState)(r4(t)),[l,c]=(0,sa.useState)($1(t)),[u,d]=(0,sa.useState)(U1(t)),[p,f]=(0,sa.useState)(!1);(0,sa.useEffect)(()=>{r(t.title),o(r4(t)),c($1(t)),d(U1(t)),f(!1)},[t.id,t.title,t.summary,t.detail,t.data?.promptHint,t.data?.memoryRetrievalEnabled]);let y=()=>{let v=s.slice(0,2e3),h=l.slice(0,1e3).trim(),b={...t.data||{},promptHint:h||void 0,memoryRetrievalEnabled:u||void 0};e({...t,title:a.slice(0,30),summary:v.slice(0,120)||void 0,bullets:void 0,detail:v||void 0,data:b,edited:!0}),f(!0),setTimeout(()=>f(!1),1500)},x=()=>{let v={...t,title:a.slice(0,30),summary:s.slice(0,120)||void 0,bullets:void 0,detail:s.slice(0,2e3)||void 0};RE(md(v))},E=()=>{t.type==="diary_source"&&!confirm("\u5220\u9664\u65E5\u8BB0\u6765\u6E90 Block \u4E0D\u4F1A\u5F71\u54CD\u539F\u59CB\u65E5\u8BB0\u6587\u4EF6\u3002\u786E\u8BA4\u5220\u9664\uFF1F")||n()};return(0,W.jsxs)("div",{style:{width:304,height:"100%",overflow:"auto",background:"var(--background-primary)",borderLeft:"1px solid rgba(204, 195, 214, 0.45)",padding:18,display:"flex",flexDirection:"column",gap:14,fontSize:13,boxShadow:"-18px 0 42px -36px rgba(26, 28, 28, 0.45)"},children:[(0,W.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10},children:[(0,W.jsxs)("div",{style:{minWidth:0},children:[(0,W.jsx)("div",{style:{color:"var(--text-muted)",fontSize:11,fontWeight:700,letterSpacing:.4,marginBottom:4},children:"BLOCK NOTE"}),(0,W.jsx)("div",{style:{fontWeight:700,fontSize:16,color:"var(--text-normal)"},children:"\u601D\u8003\u672D\u8BB0"})]}),(0,W.jsx)("button",{onClick:i,style:{width:28,height:28,borderRadius:999,background:"var(--background-secondary)",border:"1px solid rgba(204, 195, 214, 0.55)",cursor:"pointer",fontSize:16,color:"var(--text-muted)",lineHeight:1},children:"\xD7"})]}),(0,W.jsxs)("div",{style:{display:"flex",gap:6,flexWrap:"wrap"},children:[(0,W.jsx)("span",{style:{padding:"4px 9px",borderRadius:999,fontSize:11,background:"rgba(124, 58, 237, 0.09)",color:"var(--interactive-accent)",fontWeight:650},children:BE[t.type]||t.type}),t.edited&&(0,W.jsx)("span",{style:{padding:"4px 9px",borderRadius:999,fontSize:11,background:"rgba(199, 106, 25, 0.12)",color:"#a65f17",fontWeight:650},children:"\u5DF2\u7F16\u8F91"}),$1(t)&&(0,W.jsx)("span",{style:{padding:"4px 9px",borderRadius:999,fontSize:11,background:"rgba(124, 58, 237, 0.1)",color:"var(--interactive-accent)",fontWeight:650},children:"\u6709\u8865\u5145\u63D0\u793A\u8BCD"}),U1(t)&&(0,W.jsx)("span",{style:{padding:"4px 9px",borderRadius:999,fontSize:11,background:"rgba(47, 47, 54, 0.1)",color:"var(--text-normal)",fontWeight:650},children:"\u68C0\u7D22\u8BB0\u5FC6"}),t.agentRunId&&!t.edited&&(0,W.jsx)("span",{style:{padding:"4px 9px",borderRadius:999,fontSize:11,background:"var(--background-secondary)",color:"var(--text-muted)",fontWeight:650},children:"Agent \u751F\u6210"})]}),(0,W.jsxs)("label",{style:{display:"flex",flexDirection:"column",gap:7},children:[(0,W.jsx)("span",{style:{fontWeight:650,fontSize:12,color:"var(--text-muted)"},children:"\u6807\u9898"}),(0,W.jsx)("input",{value:a,onChange:v=>r(v.target.value),maxLength:30,style:{padding:"9px 10px",borderRadius:10,border:"1px solid rgba(204, 195, 214, 0.65)",background:"var(--background-primary)",color:"var(--text-normal)",fontSize:14,fontWeight:650,outline:"none"}})]}),(0,W.jsxs)("label",{style:{display:"flex",flexDirection:"column",gap:7},children:[(0,W.jsx)("span",{style:{fontWeight:650,fontSize:12,color:"var(--text-muted)"},children:"\u8865\u5145\u63D0\u793A\u8BCD"}),(0,W.jsx)("textarea",{value:l,onChange:v=>c(v.target.value),maxLength:1e3,rows:5,placeholder:"\u4F8B\u5982\uFF1A\u66F4\u5173\u6CE8\u5546\u4E1A\u5316\u8DEF\u5F84\uFF1B\u4E0D\u8981\u53D1\u6563\u5230\u4F01\u4E1A\u77E5\u8BC6\u7BA1\u7406\uFF1B\u7ED3\u5408\u9644\u4EF6\u91CC\u7684\u7ADE\u54C1\u4FE1\u606F\u3002",style:{minHeight:92,padding:"10px 11px",borderRadius:12,border:"1px solid rgba(124, 58, 237, 0.28)",background:"rgba(124, 58, 237, 0.045)",color:"var(--text-normal)",fontSize:13,lineHeight:1.55,resize:"vertical",outline:"none"}}),(0,W.jsx)("span",{style:{fontSize:11,color:"var(--text-muted)",lineHeight:1.45},children:"\u4F1A\u4F5C\u4E3A\u7834\u9898\u62F7\u95EE\u3001\u5934\u8111\u98CE\u66B4\u7B49\u601D\u8003\u65B9\u6CD5\u7684\u8865\u5145\u8F93\u5165\u3002"})]}),(0,W.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,padding:"10px 11px",borderRadius:12,border:"1px solid rgba(204, 195, 214, 0.55)",background:"var(--background-secondary)"},children:[(0,W.jsxs)("div",{style:{minWidth:0},children:[(0,W.jsx)("div",{style:{fontWeight:650,fontSize:12,color:"var(--text-normal)",marginBottom:3},children:"\u68C0\u7D22\u8BB0\u5FC6"}),(0,W.jsx)("div",{style:{fontSize:11,color:"var(--text-muted)",lineHeight:1.45},children:"\u6267\u884C\u601D\u8003\u65B9\u6CD5\u65F6\uFF0C\u8BA9\u672C\u5730 agent \u5148\u68C0\u7D22 vault \u4E2D\u76F8\u5173\u65E5\u8BB0\u548C\u5B9E\u4F53\u6863\u6848\u3002"})]}),(0,W.jsx)("button",{type:"button",role:"switch","aria-checked":u,onClick:()=>d(v=>!v),style:{flex:"0 0 auto",width:44,height:24,borderRadius:999,border:"none",padding:2,background:u?"var(--interactive-accent)":"var(--background-modifier-border)",cursor:"pointer",transition:"background 120ms ease"},children:(0,W.jsx)("span",{style:{display:"block",width:20,height:20,borderRadius:999,background:"var(--background-primary)",transform:u?"translateX(20px)":"translateX(0)",transition:"transform 120ms ease",boxShadow:"0 1px 3px rgba(0,0,0,.22)"}})})]}),(0,W.jsxs)("label",{style:{display:"flex",flexDirection:"column",gap:7,flex:"1 1 auto",minHeight:220},children:[(0,W.jsx)("span",{style:{fontWeight:650,fontSize:12,color:"var(--text-muted)"},children:"\u5185\u5BB9"}),(0,W.jsx)("textarea",{value:s,onChange:v=>o(v.target.value),maxLength:2e3,rows:12,style:{flex:"1 1 auto",minHeight:180,padding:"10px 11px",borderRadius:12,border:"1px solid rgba(204, 195, 214, 0.65)",background:"var(--background-primary)",color:"var(--text-normal)",fontSize:13,lineHeight:1.55,resize:"vertical",outline:"none"}})]}),t.sourceRefs&&t.sourceRefs.length>0&&(0,W.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:6},children:[(0,W.jsx)("span",{style:{fontWeight:650,fontSize:12,color:"var(--text-muted)"},children:"\u6765\u6E90"}),(0,W.jsx)("div",{style:{display:"grid",gap:5},children:t.sourceRefs.map(v=>(0,W.jsx)("code",{style:{padding:"5px 7px",borderRadius:7,fontSize:11,background:"var(--background-secondary)",wordBreak:"break-all",color:"var(--text-muted)"},children:v},v))})]}),t.agentRunId&&(0,W.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:6},children:[(0,W.jsx)("span",{style:{fontWeight:650,fontSize:12,color:"var(--text-muted)"},children:"Agent \u8BB0\u5F55"}),(0,W.jsx)("code",{style:{padding:"5px 7px",borderRadius:7,fontSize:11,background:"var(--background-secondary)",color:"var(--text-muted)",wordBreak:"break-all"},children:t.agentRunId})]}),(0,W.jsxs)("div",{style:{display:"grid",gap:8,marginTop:4},children:[(0,W.jsx)("button",{onClick:y,style:{height:34,borderRadius:999,border:"none",background:p?"var(--color-green)":"var(--interactive-accent)",color:"var(--text-on-accent)",cursor:"pointer",fontSize:13,fontWeight:700},children:p?"\u5DF2\u4FDD\u5B58":"\u4FDD\u5B58\u4FEE\u6539"}),(0,W.jsx)("button",{onClick:x,style:{height:34,borderRadius:999,border:"1px solid rgba(204, 195, 214, 0.6)",background:"var(--background-primary)",color:"var(--text-normal)",cursor:"pointer",fontSize:13,fontWeight:650},children:"\u590D\u5236 Markdown"}),(0,W.jsx)("button",{disabled:!0,title:"\u540E\u7EED\u9636\u6BB5\u5B9E\u73B0",style:{height:34,borderRadius:999,border:"1px solid rgba(204, 195, 214, 0.45)",background:"var(--background-secondary)",color:"var(--text-muted)",cursor:"not-allowed",fontSize:13},children:"\u91CD\u65B0\u751F\u6210"}),(0,W.jsx)("button",{onClick:E,style:{height:34,borderRadius:999,border:"none",background:"var(--color-red)",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700},children:"\u5220\u9664 Block"})]})]})}var oa=Le(xa());function o4(t){let e=t.blocks.find(i=>i.id===t.targetBlockId);if(!e)return[];let n=new Set([e.id]);for(let i of t.edges)i.from===e.id&&n.add(i.to),i.to===e.id&&n.add(i.from);if(e.agentRunId)for(let i of t.blocks)i.agentRunId===e.agentRunId&&n.add(i.id);return t.blocks.filter(i=>n.has(i.id))}function l4(t){if(t.scope==="single_block"){let i=t.blocks.find(a=>a.id===t.targetBlockId);return i?[i]:[]}if(t.scope==="related_blocks")return o4({targetBlockId:t.targetBlockId,blocks:t.blocks,edges:t.edges});let e=t.blocks.find(i=>i.id===t.targetBlockId),n=e?.agentRunId;return n?t.blocks.filter(i=>i.agentRunId===n):e?[e]:[]}function DE(t){let e=[];return e.push(`## ${t.title}`),t.summary&&e.push("",t.summary),t.bullets?.length&&e.push("",...t.bullets.filter(Boolean).map(n=>`- ${n}`)),t.detail&&e.push("",t.detail),e.join(`
`)}function c4(t,e,n){let i=t.map(DE).join(`

---

`),a=e.filter(r=>t.some(s=>s.id===r.from||s.id===r.to)).map(r=>`- ${r.from} \u2192 ${r.to} (${r.type}${r.label?": "+r.label:""})`);return["\u4F60\u662F TraceMind \u601D\u8003\u63A2\u7D22\u7684\u5BFC\u51FA\u4EE3\u7406\u3002","\u8BF7\u6839\u636E\u4EE5\u4E0B\u601D\u8003\u63A2\u7D22\u767D\u677F\u4E2D\u7684\u5757\u5185\u5BB9\uFF0C\u751F\u6210\u4E00\u7BC7\u8FDE\u8D2F\u7684 Markdown \u5BFC\u51FA\u6587\u6863\u3002","","\u8981\u6C42\uFF1A","- \u4F7F\u7528\u6E05\u6670\u7684\u6807\u9898\u5C42\u7EA7","- \u4FDD\u7559\u539F\u59CB\u5757\u7684\u5173\u952E\u4FE1\u606F\uFF08\u95EE\u9898\u3001\u6D1E\u5BDF\u3001\u51B3\u7B56\u7B49\uFF09","- \u5728\u5408\u9002\u7684\u5730\u65B9\u6CE8\u660E\u5757\u4E4B\u95F4\u7684\u5173\u8054\u5173\u7CFB","- \u4E0D\u8981\u6DFB\u52A0\u539F\u59CB\u5757\u4E2D\u6CA1\u6709\u7684\u65B0\u5185\u5BB9",n?`\u7528\u6237\u8865\u5145\u8981\u6C42\uFF1A${n}`:"","","\u5757\u4E4B\u95F4\u7684\u5173\u8054\u5173\u7CFB\uFF1A",...a.length>0?a:["\uFF08\u65E0\uFF09"],"","\u5757\u5185\u5BB9\uFF1A",i].filter(Boolean).join(`
`)}async function u4(t,e,n){let i=await Ie({providerKey:t,prompt:n,cwd:e,timeoutMs:3e5});return{output:i.output,error:i.error,runId:i.runId}}var gt=Le(yi());function d4({targetBlock:t,blocks:e,edges:n,providerKey:i,cwd:a,existingExportPaths:r,onSave:s,onClose:o}){let[l,c]=(0,oa.useState)("single_block"),[u,d]=(0,oa.useState)(""),[p,f]=(0,oa.useState)(null),[y,x]=(0,oa.useState)(""),[E,v]=(0,oa.useState)(!1),[h,b]=(0,oa.useState)(""),[w,B]=(0,oa.useState)(""),j=l4({scope:l,targetBlockId:t.id,blocks:e,edges:n}),T=async()=>{if(!i||!a){b("\u5BFC\u51FA\u9700\u8981\u914D\u7F6E\u672C\u5730 Agent");return}v(!0),b("");try{let I=c4(j,n,u||void 0),q=await u4(i,a,I);f(q.output),x(q.runId),q.error&&b(q.error);let Et=j[0]?.title||"export",te=`outputs/${new Date().toISOString().slice(0,10)}-${Et.replace(/[\\/:*?"<>|]/g,"-").replace(/\s+/g,"-").slice(0,50)}.md`;B(te)}catch(I){b(I.message)}finally{v(!1)}},P=()=>{if(!p)return;let I=D();s(I,p,j.map(q=>q.id),y)},D=()=>{let q=(j[0]?.title||"export").replace(/[\\/:*?"<>|]/g,"-").replace(/\s+/g,"-").slice(0,50),Et=new Date().toISOString().slice(0,10),te=`${Et}-${q}`,ze=1;for(;r.includes(`outputs/${te}.md`);)ze++,te=`${Et}-${q}-${ze}`;return`outputs/${te}.md`};return(0,gt.jsxs)("div",{style:{width:300,height:"100%",overflow:"auto",background:"var(--background-primary)",borderLeft:"1px solid var(--divider-color)",padding:16,display:"flex",flexDirection:"column",gap:12,fontSize:13},children:[(0,gt.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:[(0,gt.jsx)("span",{style:{fontWeight:600,fontSize:15},children:"\u5BFC\u51FA Markdown"}),(0,gt.jsx)("button",{onClick:o,style:{background:"none",border:"none",cursor:"pointer",fontSize:16,padding:"2px 6px",color:"var(--text-muted)"},children:"\xD7"})]}),(0,gt.jsxs)("label",{style:{display:"flex",flexDirection:"column",gap:4},children:[(0,gt.jsx)("span",{style:{fontWeight:600,fontSize:12,color:"var(--text-muted)"},children:"\u5BFC\u51FA\u8303\u56F4"}),(0,gt.jsxs)("select",{value:l,onChange:I=>c(I.target.value),style:{padding:"6px 8px",borderRadius:4,border:"1px solid var(--divider-color)",background:"var(--background-primary)",color:"var(--text-normal)",fontSize:13},children:[(0,gt.jsx)("option",{value:"single_block",children:"\u4EC5\u5F53\u524D\u5757"}),(0,gt.jsx)("option",{value:"related_blocks",children:"\u5173\u8054\u5757\uFF08\u4E00\u8DF3 + \u540C\u6279\u6B21\uFF09"}),(0,gt.jsx)("option",{value:"group",children:"\u540C\u6279\u6B21\u6240\u6709\u5757"})]})]}),(0,gt.jsxs)("div",{style:{fontSize:12,color:"var(--text-muted)"},children:["\u5C06\u5BFC\u51FA ",(0,gt.jsx)("strong",{children:j.length})," \u4E2A\u5757"]}),(0,gt.jsxs)("label",{style:{display:"flex",flexDirection:"column",gap:4},children:[(0,gt.jsx)("span",{style:{fontWeight:600,fontSize:12,color:"var(--text-muted)"},children:"\u5BFC\u51FA\u8BF4\u660E\uFF08\u53EF\u9009\uFF09"}),(0,gt.jsx)("textarea",{value:u,onChange:I=>d(I.target.value),rows:2,placeholder:"\u4F8B\u5982\uFF1A\u5F3A\u8C03\u5176\u4E2D\u7684\u6280\u672F\u51B3\u7B56\u90E8\u5206",style:{padding:"6px 8px",borderRadius:4,border:"1px solid var(--divider-color)",background:"var(--background-primary)",color:"var(--text-normal)",fontSize:13,resize:"vertical"}})]}),(0,gt.jsx)("button",{onClick:T,disabled:E||!i,style:{padding:"8px 0",borderRadius:6,border:"none",background:E?"var(--background-modifier-hover)":"var(--interactive-accent)",color:E?"var(--text-muted)":"#fff",cursor:E?"not-allowed":"pointer",fontSize:13,fontWeight:600},children:E?"\u751F\u6210\u4E2D...":i?"\u751F\u6210\u8349\u7A3F":"\u9700\u8981\u914D\u7F6E Agent"}),h&&(0,gt.jsx)("div",{style:{padding:8,borderRadius:4,fontSize:12,background:"var(--background-modifier-error)",color:"var(--text-error)"},children:h}),p!==null&&(0,gt.jsxs)(gt.Fragment,{children:[(0,gt.jsx)("div",{style:{fontWeight:600,fontSize:13},children:"\u9884\u89C8"}),(0,gt.jsx)("textarea",{value:p,onChange:I=>f(I.target.value),rows:12,style:{padding:"8px",borderRadius:4,border:"1px solid var(--divider-color)",background:"var(--background-primary)",color:"var(--text-normal)",fontSize:12,resize:"vertical",fontFamily:"var(--font-monospace)"}}),(0,gt.jsxs)("div",{style:{fontSize:11,color:"var(--text-muted)"},children:["\u4FDD\u5B58\u8DEF\u5F84: ",D()]}),(0,gt.jsx)("button",{onClick:P,style:{padding:"8px 0",borderRadius:6,border:"none",background:"var(--color-green)",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:600},children:"\u786E\u8BA4\u4FDD\u5B58"})]}),(0,gt.jsxs)("details",{style:{fontSize:12},children:[(0,gt.jsx)("summary",{style:{cursor:"pointer",fontWeight:600,color:"var(--text-muted)"},children:"\u5BFC\u51FA\u5757\u5217\u8868"}),(0,gt.jsx)("ul",{style:{margin:"8px 0",paddingLeft:18},children:j.map(I=>(0,gt.jsxs)("li",{style:{marginBottom:4},children:[(0,gt.jsx)("span",{style:{display:"inline-block",padding:"1px 4px",borderRadius:3,background:"var(--background-modifier-hover)",fontSize:10},children:I.type})," ",I.title]},I.id))})]})]})}function p4(t,e,n=30){return[...t,e].slice(-n)}function f4(t){return t.length===0?{snapshot:null,history:t}:{snapshot:t[t.length-1],history:t.slice(0,-1)}}var Cs={x:520,y:520};function h4(t,e){return e==="select"?"crosshair":e==="pan"?"grabbing":t==="select"?"default":"grab"}function H1(t,e,n=4){let i=e.x-t.x,a=e.y-t.y;return i*i+a*a>=n*n}function g4(t,e){return t.filter(n=>{let i={x:n.position.x+Cs.x,y:n.position.y+Cs.y,width:n.size.width,height:n.size.height};return IE(e,i)}).map(n=>n.id)}function m4(t,e,n){if(n){let i=new Set(t);return i.has(e)?i.delete(e):i.add(e),[...i]}return t.length>1&&t.includes(e)?t:[e]}function Y1(t,e,n){let i=new Set(e);return t.map(a=>i.has(a.id)?{...a,position:{x:a.position.x+n.x,y:a.position.y+n.y}}:a)}function y4(t,e,n,i){let a=e.find(r=>r.id===n);return a?{blocks:Y1(t,a.blockIds,i),groups:e.map(r=>r.id===n?{...r,position:{x:r.position.x+i.x,y:r.position.y+i.y}}:r)}:{blocks:t,groups:e}}function x4(t,e){let n=t.filter(o=>e.includes(o.id));if(n.length===0)return null;let i=Math.min(...n.map(o=>o.position.x+Cs.x)),a=Math.min(...n.map(o=>o.position.y+Cs.y)),r=Math.max(...n.map(o=>o.position.x+Cs.x+o.size.width)),s=Math.max(...n.map(o=>o.position.y+Cs.y+o.size.height));return{x:i,y:a,width:r-i,height:s-a}}function IE(t,e){return t.x<=e.x+e.width&&t.x+t.width>=e.x&&t.y<=e.y+e.height&&t.y+t.height>=e.y}function v4(t,e){switch(e){case"top":return{x:t.position.x+t.size.width/2,y:t.position.y,side:"top"};case"right":return{x:t.position.x+t.size.width,y:t.position.y+t.size.height/2,side:"right"};case"bottom":return{x:t.position.x+t.size.width/2,y:t.position.y+t.size.height,side:"bottom"};case"left":return{x:t.position.x,y:t.position.y+t.size.height/2,side:"left"}}}function V1(t,e,n){let i=[{x:t.position.x+t.size.width/2,y:t.position.y,side:"top"},{x:t.position.x+t.size.width,y:t.position.y+t.size.height/2,side:"right"},{x:t.position.x+t.size.width/2,y:t.position.y+t.size.height,side:"bottom"},{x:t.position.x,y:t.position.y+t.size.height/2,side:"left"}];for(let a of i)if(Math.hypot(e.x-a.x,e.y-a.y)<=n)return a;return null}function b4(t,e,n,i){return{id:`edge-${Date.now()}-${Math.random().toString(16).slice(2,8)}`,from:t.id,to:n.id,type:i}}var C=Le(yi()),k4={width:4200,height:2800},nt={x:520,y:520},E4=900,FE=.35,OE=1.8,Cu=24,w4=10;var Su=80,C4={width:Ee.width*1.5,height:Ee.height*1.5},S4={width:1200,height:1e3};function G1(t){return new Promise(e=>setTimeout(e,t))}function q1(t){return Math.min(OE,Math.max(FE,t))}function zE(t){switch(t){case"derived_from":return"\u6765\u6E90";case"supports":return"\u652F\u6301";case"challenges":return"\u6311\u6218";case"answers":return"\u56DE\u7B54";case"leads_to":return"\u5F15\u5411";case"references":return"\u5F15\u7528";case"exported_to":return"\u5BFC\u51FA";default:return t}}function A4(t){return`${t}-${Date.now()}-${Math.random().toString(16).slice(2,8)}`}function LE(t){if(t.data?.method==="rise"&&t.type==="experiment")return"execution";let e=typeof t.data?.stage=="string"?t.data.stage:"";if(e==="reality"||e==="insight"||e==="strategy"||e==="execution")return e;if(/^Reality\b/i.test(t.title))return"reality";if(/^Insight\b/i.test(t.title))return"insight";if(/^Strategy\b/i.test(t.title))return"strategy";if(/^Execution\b/i.test(t.title))return"execution"}function T4(t){if(t.data?.method!=="rise")return!1;let e=LE(t);return e==="reality"||e==="insight"||e==="strategy"}function M4(t,e){let n=Math.min(t.x,e.x),i=Math.min(t.y,e.y);return{x:n,y:i,width:Math.abs(e.x-t.x),height:Math.abs(e.y-t.y)}}function NE(t){let e=Math.min(...t.map(s=>s.position.x)),n=Math.min(...t.map(s=>s.position.y)),i=Math.max(...t.map(s=>s.position.x+s.size.width)),a=Math.max(...t.map(s=>s.position.y+s.size.height)),r=34;return{x:e-r,y:n-r,width:i-e+r*2,height:a-n+r*2}}function PE(t){let e=t.blocks.length>0?Math.max(...t.blocks.map(r=>r.position.x+r.size.width)):0,n=t.blocks.length>0?Math.max(...t.blocks.map(r=>r.position.y+r.size.height)):0,i=(t.groups||[]).length>0?Math.max(...(t.groups||[]).map(r=>r.position.x+r.size.width)):0,a=(t.groups||[]).length>0?Math.max(...(t.groups||[]).map(r=>r.position.y+r.size.height)):0;return{width:Math.max(k4.width,Math.ceil(Math.max(e,i)+nt.x+E4)),height:Math.max(k4.height,Math.ceil(Math.max(n,a)+nt.y+E4))}}function jE(t){switch(t){case"claude-code":return"Claude Code";case"hermes":return"Hermes";case"opencode":return"OpenCode";case"pi":return"Pi Agent";case"codex":return"Codex";default:return"TraceMind"}}function F4(t){switch(t.type){case"diary_source":return"SOURCE";case"entity_source":return"ENTITY";case"material_source":return"MATERIAL";case"frame_question":return"\u7834\u9898\u62F7\u95EE";case"question":return"QUESTION";case"user_reply":return"REPLY";case"agent_reply":return"AGENT";case"assumption":return"ASSUMPTION";case"risk":return"RISK";case"decision":return"DECISION";case"experiment":return"EXPERIMENT";case"insight":return"INSIGHT";case"user_note":return t.data?.replyToBlockId?"REPLY":"NOTE";case"output":return"OUTPUT";case"error":return"ERROR";case"warning":return"WARNING";default:return t.type.toUpperCase()}}function X1(t,e){return t?t.length>e?`${t.slice(0,e-1)}\u2026`:t:""}function $E(t){return t.type==="output"?t.data?.outputStatus==="draft"?"\u8FDE\u63A5\u591A\u4E2Ablock\uFF0C\u53EF\u6C47\u603B\u751F\u6210\u603B\u7ED3\u3002":t.detail||t.summary||"":t.type==="agent_reply"?t.detail||t.summary||"":t.summary||t.detail||""}function UE(t){return t.detail||t.summary||""}function _4(t,e){let n=(t.detail||"").trim(),i=(t.summary||"").trim();return e||n&&n!==i&&n.length>i.length+24?!0:["agent_reply","output","insight","decision","experiment","risk"].includes(t.type)&&n.length>120}function Au(t){return t.split(/(\*\*[^*]+\*\*)/g).map((n,i)=>n.startsWith("**")&&n.endsWith("**")&&n.length>4?(0,C.jsx)("strong",{children:n.slice(2,-2)},i):n)}function O4({markdown:t}){let e=(0,A.useMemo)(()=>{let n=t.split(/\r?\n/),i=[],a=[],r=null,s=()=>{if(!r||a.length===0)return;let o=a,l=`list-${i.length}`;i.push(r==="ol"?(0,C.jsx)("ol",{children:o.map((c,u)=>(0,C.jsx)("li",{children:Au(c)},u))},l):(0,C.jsx)("ul",{children:o.map((c,u)=>(0,C.jsx)("li",{children:Au(c)},u))},l)),a=[],r=null};return n.forEach((o,l)=>{let c=o.trim();if(!c){s();return}let u=c.match(/^(#{1,3})\s+(.+)$/);if(u){s(),i.push((0,C.jsx)("div",{className:`tracemind-output-md-heading tracemind-output-md-heading-${u[1].length}`,children:Au(u[2])},`h-${l}`));return}let d=c.match(/^[-*]\s+(.+)$/);if(d){r!=="ul"&&s(),r="ul",a.push(d[1]);return}let p=c.match(/^\d+[.)]\s+(.+)$/);if(p){r!=="ol"&&s(),r="ol",a.push(p[1]);return}s(),i.push((0,C.jsx)("p",{children:Au(c)},`p-${l}`))}),s(),i},[t]);return(0,C.jsx)("div",{className:"tracemind-output-md",children:e})}function z4(t){switch(t.type){case"diary_source":return{accent:"#4f7cff",background:"#f4f7ff"};case"entity_source":return{accent:"#0f766e",background:"#effcf9"};case"material_source":return{accent:"#db2777",background:"#fff1f7"};case"question":case"frame_question":return{accent:"#7c3aed",background:"#f7f2ff"};case"assumption":return{accent:"#c76a19",background:"#fff6ed"};case"risk":case"warning":case"error":return{accent:"#c2410c",background:"#fff4f0"};case"decision":return{accent:"#2563eb",background:"#eff6ff"};case"experiment":return{accent:"#7c3aed",background:"#f7f2ff"};case"insight":return{accent:"#16845d",background:"#effaf5"};case"user_reply":return{accent:"#9a6b00",background:"#fff9df"};case"agent_reply":return{accent:"#16845d",background:"#effaf5"};case"user_note":return{accent:"#9a6b00",background:"#fff9df"};case"output":return{accent:"#343434",background:"#f5f5f5"};default:return{accent:"#6f6a78",background:"#f7f6f8"}}}function K1(t){return{x:t.position.x+t.size.width/2,y:t.position.y+t.size.height/2}}function Nn(t,e){let n=e.filter(i=>t.blockIds.includes(i.id)).map(i=>i.title).slice(0,6).join("\uFF1B");return{id:t.id,category:"source",type:"user_note",title:`\u5206\u7EC4\uFF1A${t.title}`,summary:`${t.blockIds.length} \u4E2A block`,detail:n,sourceRefs:t.blockIds,position:t.position,size:t.size,data:{groupId:t.id,virtualType:"group_context"}}}function B4(t,e){let n=K1(t),i=e.x-n.x,a=e.y-n.y;return Math.abs(i)>=Math.abs(a)?{x:i>=0?t.position.x+t.size.width:t.position.x,y:n.y}:{x:n.x,y:a>=0?t.position.y+t.size.height:t.position.y}}function Z1(t,e){let n=e.x-t.x,i=e.y-t.y,a=Math.abs(n)>=Math.abs(i);if(a&&Math.abs(i)<2||!a&&Math.abs(n)<2)return`M ${t.x} ${t.y} L ${e.x} ${e.y}`;if(a){let c=Math.min(120,Math.max(56,Math.abs(n)*.48)),u=n>=0?1:-1,d={x:t.x+c*u,y:t.y},p={x:e.x-c*u,y:e.y};return`M ${t.x} ${t.y} C ${d.x} ${d.y} ${p.x} ${p.y} ${e.x} ${e.y}`}let r=Math.min(120,Math.max(56,Math.abs(i)*.48)),s=i>=0?1:-1,o={x:t.x,y:t.y+r*s},l={x:e.x,y:e.y-r*s};return`M ${t.x} ${t.y} C ${o.x} ${o.y} ${l.x} ${l.y} ${e.x} ${e.y}`}function R4(t,e,n){return t.position.x<e.position.x+e.size.width+n&&t.position.x+t.size.width+n>e.position.x&&t.position.y<e.position.y+e.size.height+n&&t.position.y+t.size.height+n>e.position.y}function D4(t,e){if(e.length===0)return{blocks:t,delta:{x:0,y:0}};let n=new Set(e),i=t,a={x:0,y:0};for(let r=0;r<20;r++){let s=i.filter(d=>n.has(d.id)),o=i.filter(d=>!n.has(d.id)),l=s.find(d=>o.some(p=>R4(d,p,Cu)));if(!l)return{blocks:i,delta:a};let c=o.find(d=>R4(l,d,Cu));if(!c)return{blocks:i,delta:a};let u=Math.max(Cu,c.position.y+c.size.height+Cu-l.position.y);i=Y1(i,e,{x:0,y:u}),a={x:a.x,y:a.y+u}}return{blocks:i,delta:a}}var HE=(0,A.memo)(function({blocks:e,groups:n,edges:i,workspaceSize:a,selectedEdgeId:r,onSelectEdge:s}){let o=(0,A.useMemo)(()=>{let l=[...e,...n.map(c=>Nn(c,e))];return new Map(l.map(c=>[c.id,c]))},[e,n]);return(0,C.jsxs)("svg",{width:a.width,height:a.height,style:{position:"absolute",inset:0,overflow:"visible",pointerEvents:"none"},children:[(0,C.jsx)("defs",{children:(0,C.jsx)("marker",{id:"tracemind-affine-arrow",viewBox:"0 0 10 10",refX:"9",refY:"5",markerWidth:"7",markerHeight:"7",orient:"auto-start-reverse",children:(0,C.jsx)("path",{d:"M 0 0 L 10 5 L 0 10 z",fill:"#8e8e8e"})})}),i.map(l=>{let c=o.get(l.from),u=o.get(l.to);if(!c||!u)return null;let d=K1(c),p=K1(u),f=B4(c,p),y=B4(u,d),x=l.type==="challenges"?"#b96a64":l.type==="supports"?"#5f9779":"#8e8e8e";return(0,C.jsxs)("g",{children:[(0,C.jsx)("path",{d:Z1({x:f.x+nt.x,y:f.y+nt.y},{x:y.x+nt.x,y:y.y+nt.y}),fill:"none",stroke:"transparent",strokeWidth:14,strokeLinecap:"round",style:{cursor:"pointer",pointerEvents:"stroke"},onPointerDown:E=>{E.stopPropagation(),s(l.id)}}),(0,C.jsx)("path",{d:Z1({x:f.x+nt.x,y:f.y+nt.y},{x:y.x+nt.x,y:y.y+nt.y}),fill:"none",stroke:l.id===r?"#7c3aed":x,strokeWidth:l.id===r?2.4:1.35,strokeLinecap:"round",strokeLinejoin:"round",markerEnd:"url(#tracemind-affine-arrow)",opacity:l.id===r?.96:.76,pointerEvents:"none"})]},l.id)})]})}),YE=(0,A.memo)(function({groups:e,viewportScale:n,selectedGroupId:i,onSelectGroup:a,onMoveGroup:r,onMoveGroupEnd:s,onStartConnection:o}){let l=(0,A.useRef)(null),c=(u,d,p)=>{let f=l.current;p&&f?.groupId===d&&f.dragging&&s(d),l.current=null,u.currentTarget.hasPointerCapture(u.pointerId)&&u.currentTarget.releasePointerCapture(u.pointerId)};return(0,C.jsx)(C.Fragment,{children:e.map(u=>(0,C.jsxs)("div",{onPointerDown:d=>{d.stopPropagation(),a(u.id,u.blockIds),l.current={groupId:u.id,pointerId:d.pointerId,startX:d.clientX,startY:d.clientY,lastX:d.clientX,lastY:d.clientY,dragging:!1},d.currentTarget.setPointerCapture(d.pointerId)},onPointerMove:d=>{let p=l.current;if(!p||p.groupId!==u.id||p.pointerId!==d.pointerId)return;let f={x:d.clientX,y:d.clientY};if(!p.dragging&&!H1({x:p.startX,y:p.startY},f))return;let y={x:(d.clientX-p.lastX)/n,y:(d.clientY-p.lastY)/n};y.x===0&&y.y===0||(l.current={...p,lastX:d.clientX,lastY:d.clientY,dragging:!0},r(u.id,y))},onPointerUp:d=>c(d,u.id,!0),onPointerCancel:d=>c(d,u.id,!0),onLostPointerCapture:()=>{let d=l.current;d?.groupId===u.id&&d.dragging&&s(u.id),l.current=null},style:{position:"absolute",left:u.position.x+nt.x,top:u.position.y+nt.y,width:u.size.width,height:u.size.height,borderRadius:18,border:i===u.id?"1.8px solid rgba(124, 58, 237, 0.72)":"1.5px dashed rgba(124, 58, 237, 0.42)",background:i===u.id?"rgba(124, 58, 237, 0.075)":"rgba(124, 58, 237, 0.045)",boxSizing:"border-box",cursor:"move",zIndex:2,boxShadow:i===u.id?"0 0 0 3px rgba(124,58,237,.08)":void 0},children:[(0,C.jsx)("div",{style:{position:"absolute",left:14,top:-12,padding:"2px 9px",borderRadius:999,background:"rgba(255,255,255,.9)",border:"1px solid rgba(124, 58, 237, 0.18)",color:"var(--interactive-accent)",fontSize:11,fontWeight:700,boxShadow:"0 8px 18px -14px rgba(26,28,28,.45)"},children:u.title}),i===u.id&&[{side:"top",left:u.size.width/2,top:0},{side:"right",left:u.size.width,top:u.size.height/2},{side:"bottom",left:u.size.width/2,top:u.size.height},{side:"left",left:0,top:u.size.height/2}].map(d=>(0,C.jsx)("div",{onPointerDown:p=>{p.stopPropagation(),p.preventDefault(),o(u.id,d.side)},style:{position:"absolute",left:d.left-6,top:d.top-6,width:12,height:12,borderRadius:"50%",background:"var(--interactive-accent)",border:"2px solid white",cursor:"crosshair",zIndex:32,boxShadow:"0 2px 8px rgba(124, 58, 237, .35)"}},d.side))]},u.id))})},(t,e)=>t.groups===e.groups&&t.viewportScale===e.viewportScale&&t.selectedGroupId===e.selectedGroupId),VE=(0,A.memo)(function({block:e,selected:n,onSelect:i,onMove:a,onMoveEnd:r,onResize:s,viewportScale:o,connectionTarget:l,onStartConnection:c,onHover:u}){let d=z4(e),p=(0,A.useRef)(null),f=(0,A.useRef)(null),y=(0,A.useRef)(null),[x,E]=(0,A.useState)(null),v=(e.bullets||[]).slice(0,2),[h,b]=(0,A.useState)(!1),w=e.type==="output",B=w||e.type==="agent_reply",j=$E(e);(0,A.useEffect)(()=>{let L=y.current;L&&b(L.scrollHeight>L.clientHeight)},[e.summary,e.detail,e.data?.outputStatus,e.type,v.length]);let T=[{side:"top",left:e.size.width/2,top:0},{side:"right",left:e.size.width,top:e.size.height/2},{side:"bottom",left:e.size.width/2,top:e.size.height},{side:"left",left:0,top:e.size.height/2}],P=L=>{i(L),p.current={pointerId:L.pointerId,startX:L.clientX,startY:L.clientY,blockX:e.position.x,blockY:e.position.y,dragging:!1},L.currentTarget.setPointerCapture(L.pointerId)},D=L=>{let St=p.current;if(!St||St.pointerId!==L.pointerId)return;let $n={x:L.clientX,y:L.clientY};!St.dragging&&!H1({x:St.startX,y:St.startY},$n)||(St.dragging=!0,a({x:St.blockX+(L.clientX-St.startX)/o,y:St.blockY+(L.clientY-St.startY)/o}))},I=(L,St)=>{let $n=p.current;St&&$n?.dragging&&r(e.id),p.current=null,L.currentTarget.hasPointerCapture(L.pointerId)&&L.currentTarget.releasePointerCapture(L.pointerId)},q=L=>{L.stopPropagation(),L.preventDefault(),i(L),f.current={startX:L.clientX,startY:L.clientY,width:e.size.width,height:e.size.height},L.currentTarget.setPointerCapture(L.pointerId)},Et=L=>{let St=f.current;if(!St)return;L.stopPropagation();let $n=Math.min(S4.width,Math.max(C4.width,St.width+(L.clientX-St.startX)/o)),pt=Math.min(S4.height,Math.max(C4.height,St.height+(L.clientY-St.startY)/o));s({width:Math.round($n),height:Math.round(pt)})},te=L=>{L.stopPropagation(),f.current=null,L.currentTarget.hasPointerCapture(L.pointerId)&&L.currentTarget.releasePointerCapture(L.pointerId)},ze=e.position.x+nt.x,$t=e.position.y+nt.y;return(0,C.jsxs)(C.Fragment,{children:[(0,C.jsxs)("div",{onPointerDown:P,onPointerMove:D,onPointerUp:L=>I(L,!0),onPointerCancel:L=>I(L,!0),onLostPointerCapture:()=>{p.current?.dragging&&r(e.id),p.current=null},onMouseEnter:()=>{_4(e,h)&&u(e.id)},onMouseLeave:()=>{_4(e,h)&&u(null)},style:{position:"absolute",left:ze,top:$t,width:e.size.width,height:e.size.height,boxSizing:"border-box",borderRadius:14,cursor:"grab",userSelect:"none",border:n?`1.5px solid ${d.accent}`:l?"1.5px solid var(--interactive-accent)":`1px solid ${d.accent}33`,background:d.background,boxShadow:n?"0 16px 36px -22px rgba(50, 36, 88, 0.55), 0 0 0 3px rgba(124, 58, 237, 0.08)":l?"0 0 0 2px rgba(124, 58, 237, 0.2), 0 10px 28px -20px rgba(26, 28, 28, 0.45)":"0 10px 28px -20px rgba(26, 28, 28, 0.45)",overflow:"hidden",fontFamily:"var(--font-body)",color:"var(--text-normal)",display:"flex",flexDirection:"column"},children:[(0,C.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:6,padding:"9px 11px 5px",borderBottom:"1px solid rgba(0, 0, 0, 0.06)",minHeight:34,boxSizing:"border-box"},children:[(0,C.jsx)("span",{style:{width:7,height:7,borderRadius:999,background:d.accent,flex:"0 0 auto"}}),(0,C.jsxs)("div",{style:{minWidth:0,flex:1},children:[(0,C.jsx)("div",{style:{fontSize:13,fontWeight:650,lineHeight:1.2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"},children:X1(e.title,24)||"\u672A\u547D\u540D"}),(0,C.jsx)("div",{style:{marginTop:2,fontSize:9,fontWeight:700,letterSpacing:.5,color:d.accent,opacity:.85},children:F4(e)})]})]}),(0,C.jsxs)("div",{style:{padding:w?"11px 14px 13px":"7px 11px 9px",fontSize:13,lineHeight:1.35,color:"var(--text-muted)",overflow:w?"auto":"hidden",flex:1,minHeight:0},children:[j&&(B?(0,C.jsx)("div",{ref:y,style:{maxHeight:"100%",overflow:w?"visible":"hidden"},children:(0,C.jsx)(O4,{markdown:j})}):(0,C.jsx)("div",{ref:y,style:{display:"-webkit-box",WebkitLineClamp:v.length>0?2:3,WebkitBoxOrient:"vertical",overflow:"hidden"},children:j})),v.length>0&&(0,C.jsx)("div",{style:{marginTop:j?5:0,display:"grid",gap:2},children:v.map((L,St)=>(0,C.jsxs)("div",{style:{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"},children:[(0,C.jsx)("span",{style:{color:d.accent,fontWeight:700},children:"\u2022 "}),X1(L,28)]},`${e.id}-${St}`))})]}),w&&n&&(0,C.jsx)("div",{"aria-label":"\u8C03\u6574\u6210\u679C block \u5927\u5C0F",title:"\u62D6\u62FD\u8C03\u6574\u5927\u5C0F",onPointerDown:q,onPointerMove:Et,onPointerUp:te,onPointerCancel:te,style:{position:"absolute",right:5,bottom:5,width:16,height:16,borderRadius:5,cursor:"nwse-resize",background:"rgba(255,255,255,.86)",border:`1px solid ${d.accent}55`,boxShadow:"0 6px 14px -10px rgba(26,28,28,.65)",zIndex:40},children:(0,C.jsx)("span",{style:{position:"absolute",right:3,bottom:3,width:7,height:7,borderRight:`1.5px solid ${d.accent}`,borderBottom:`1.5px solid ${d.accent}`}})})]}),(n||l)&&T.map(L=>(0,C.jsx)("div",{onPointerDown:St=>{St.stopPropagation(),St.preventDefault(),c(e.id,L.side)},onMouseEnter:()=>E(L.side),onMouseLeave:()=>E(null),style:{position:"absolute",left:ze+L.left-(x===L.side?8:6),top:$t+L.top-(x===L.side?8:6),width:x===L.side?16:12,height:x===L.side?16:12,borderRadius:"50%",background:"var(--interactive-accent)",border:"2px solid white",cursor:"crosshair",zIndex:30,boxShadow:"0 2px 8px rgba(124, 58, 237, .35)",transition:"left 80ms, top 80ms, width 80ms, height 80ms"}},L.side))]})},(t,e)=>t.block===e.block&&t.selected===e.selected&&t.viewportScale===e.viewportScale&&t.connectionTarget===e.connectionTarget);function GE({block:t,cardX:e,cardY:n,cardWidth:i,viewportScale:a,onMouseEnter:r,onMouseLeave:s}){let o=UE(t);if(!o)return null;let l=t.title||"\u672A\u547D\u540D",c=F4(t),u=z4(t),d=420;return(0,C.jsxs)("div",{style:{position:"absolute",left:e+i+12,top:n,zIndex:50,pointerEvents:"auto",width:d,maxWidth:d,maxHeight:"60vh",overflow:"auto",background:"var(--background-primary)",border:`1.5px solid ${u.accent}44`,borderRadius:12,padding:"12px 14px 14px",boxShadow:"0 12px 32px -16px rgba(26,28,28,.4), 0 0 0 1px rgba(0,0,0,.04)",fontFamily:"var(--font-body)",color:"var(--text-normal)",transform:`scale(${1/a})`,transformOrigin:"left top",wordBreak:"break-word"},onMouseEnter:r,onMouseLeave:s,children:[(0,C.jsx)("div",{style:{fontSize:11,fontWeight:700,letterSpacing:.5,color:u.accent,marginBottom:4},children:c}),(0,C.jsx)("div",{style:{fontSize:14,fontWeight:650,lineHeight:1.3,marginBottom:o&&l!==o?6:0},children:l}),o&&l!==o&&(0,C.jsx)(O4,{markdown:o})]})}function I4({availability:t,visibleQuickActions:e,onRunAction:n,onCreateOutput:i,outputActionLabel:a="\u6C89\u6DC0\u6210\u679C",onExport:r,showExportAction:s=!0}){let[o,l]=(0,A.useState)("\u53D1\u6563\u601D\u8003"),c=new Set(e),d=[...QE.map(x=>({...x,kind:"thinking"})),{title:"\u8F93\u51FA",kind:"output"}].filter(x=>x.kind==="output"?s||!!i:!!x.actions?.some(E=>t[E])),p=d.find(x=>x.title===o)||d[0],f={width:"100%",minHeight:30,display:"flex",alignItems:"center",justifyContent:"space-between",border:"none",borderRadius:9,background:"transparent",color:"var(--text-normal)",cursor:"pointer",fontSize:13,padding:"0 9px",textAlign:"left"},y=x=>({...f,height:32,background:x?"rgba(124,58,237,.09)":"transparent",color:x?"var(--interactive-accent)":"var(--text-normal)",fontWeight:x?700:650});return(0,C.jsxs)("div",{style:{position:"relative",width:152,padding:6,borderRadius:13,background:"rgba(255,255,255,.97)",border:"1px solid rgba(204,195,214,.42)",boxShadow:"0 18px 42px -26px rgba(26,28,28,.46), 0 4px 14px -12px rgba(26,28,28,.32)",backdropFilter:"blur(14px)",display:"grid",gap:2},children:[d.map(x=>{let E=p?.title===x.title;return(0,C.jsxs)("button",{onMouseEnter:()=>l(x.title),onFocus:()=>l(x.title),style:y(E),children:[(0,C.jsx)("span",{children:x.title}),(0,C.jsx)("span",{style:{color:E?"var(--interactive-accent)":"var(--text-muted)",fontSize:14,lineHeight:1},children:"\u203A"})]},x.title)}),p&&(0,C.jsxs)("div",{style:{position:"absolute",left:"calc(100% + 8px)",top:0,minWidth:176,padding:6,borderRadius:13,background:"rgba(255,255,255,.98)",border:"1px solid rgba(204,195,214,.42)",boxShadow:"0 18px 42px -26px rgba(26,28,28,.46), 0 4px 14px -12px rgba(26,28,28,.32)",backdropFilter:"blur(14px)",display:"grid",gap:2},children:[p.kind==="thinking"&&p.actions?.filter(x=>t[x]).map(x=>(0,C.jsxs)("button",{onClick:()=>n(x),style:f,children:[(0,C.jsx)("span",{children:J1[x]}),c.has(x)&&(0,C.jsx)("span",{style:{color:"var(--text-muted)",fontSize:11},children:"\u5FEB\u6377\u680F"})]},x)),p.kind==="output"&&(0,C.jsxs)(C.Fragment,{children:[(0,C.jsx)("button",{onClick:i,style:f,children:a}),s&&(0,C.jsx)("button",{onClick:r,style:f,children:"\u5BFC\u51FA"})]})]})]})}function qE({agentName:t,phase:e}){let n=e==="agent"?`${t} agent \u6B63\u5728\u601D\u8003\u4E2D`:"\u6B63\u5728\u6574\u7406\u95EE\u9898\u5361\u7247";return(0,C.jsxs)("div",{style:{position:"fixed",left:"50%",top:44,transform:"translateX(-50%)",zIndex:1e5,display:"flex",alignItems:"center",gap:10,height:38,padding:"0 15px 0 13px",borderRadius:999,background:"rgba(255, 255, 255, 0.9)",border:"1px solid rgba(124, 58, 237, 0.18)",boxShadow:"0 16px 42px -22px rgba(50, 36, 88, 0.55), 0 6px 18px -12px rgba(50, 36, 88, 0.35)",backdropFilter:"blur(14px)",color:"var(--text-normal)",pointerEvents:"none"},children:[(0,C.jsx)("style",{children:"@keyframes tracemindThinkingDot{0%,80%,100%{transform:translateY(0);opacity:.38}40%{transform:translateY(-4px);opacity:1}}"}),(0,C.jsx)("span",{style:{width:18,height:18,borderRadius:999,background:"linear-gradient(135deg, rgba(124,58,237,0.22), rgba(124,58,237,0.08))",display:"inline-flex",alignItems:"center",justifyContent:"center",flex:"0 0 auto"},children:[0,1,2].map(i=>(0,C.jsx)("span",{style:{width:3,height:3,margin:"0 1px",borderRadius:999,background:"var(--interactive-accent)",animation:`tracemindThinkingDot 1.15s ease-in-out ${i*.14}s infinite`}},i))}),(0,C.jsx)("span",{style:{fontSize:13,fontWeight:650,whiteSpace:"nowrap"},children:n})]})}function XE({zoom:t,pointerMode:e,selectedCount:n,selectedEdge:i,selectedGroupCount:a,onZoomIn:r,onZoomOut:s,onReset:o,onFit:l,onDeleteSelected:c,onSetPointerMode:u,onCreateGroup:d,onDissolveGroup:p,onCreateOutput:f,onAddMaterial:y,onCreateEdge:x,onDeleteEdge:E,onEdgeTypeChange:v}){let h={width:32,height:30,borderRadius:10,border:"1px solid rgba(204,195,214,.55)",background:"rgba(255,255,255,.92)",color:"var(--text-normal)",cursor:"pointer",fontSize:13,fontWeight:700};return(0,C.jsxs)("div",{style:{position:"absolute",left:18,bottom:18,zIndex:30,display:"flex",alignItems:"center",gap:6,padding:6,borderRadius:16,border:"1px solid rgba(204,195,214,.52)",background:"rgba(255,255,255,.88)",boxShadow:"0 18px 46px -24px rgba(26,28,28,.5), 0 6px 18px -12px rgba(26,28,28,.32)",backdropFilter:"blur(14px)",fontFamily:"var(--font-body)"},onPointerDown:b=>b.stopPropagation(),children:[(0,C.jsx)("button",{title:"\u9009\u62E9\u6A21\u5F0F",onClick:()=>u("select"),style:{...h,width:32,background:e==="select"?"rgba(124,58,237,.12)":h.background,color:e==="select"?"var(--interactive-accent)":h.color,fontSize:16,lineHeight:1},children:"\u2191"}),(0,C.jsx)("button",{title:"\u5E73\u79FB\u6A21\u5F0F",onClick:()=>u("pan"),style:{...h,width:32,background:e==="pan"?"rgba(124,58,237,.12)":h.background,color:e==="pan"?"var(--interactive-accent)":h.color,fontSize:14,lineHeight:1},children:"\u270B"}),(0,C.jsx)("div",{style:{width:1,height:20,background:"rgba(204,195,214,.65)",margin:"0 2px"}}),(0,C.jsx)("button",{title:"\u7F29\u5C0F",onClick:s,style:h,children:"-"}),(0,C.jsxs)("div",{title:"\u5F53\u524D\u7F29\u653E\u6BD4\u4F8B",style:{minWidth:54,textAlign:"center",fontSize:12,fontWeight:700,color:"var(--text-muted)"},children:[Math.round(t*100),"%"]}),(0,C.jsx)("button",{title:"\u653E\u5927",onClick:r,style:h,children:"+"}),(0,C.jsx)("button",{title:"\u9002\u5E94\u5185\u5BB9",onClick:l,style:{...h,width:46},children:"\u9002\u5E94"}),(0,C.jsx)("button",{title:"\u91CD\u7F6E\u89C6\u56FE",onClick:o,style:{...h,width:46},children:"\u91CD\u7F6E"}),(0,C.jsx)("div",{style:{width:1,height:20,background:"rgba(204,195,214,.65)",margin:"0 2px"}}),(0,C.jsx)("button",{title:"\u6DFB\u52A0\u6750\u6599",onClick:y,style:{...h,width:70},children:"\u6DFB\u52A0\u6750\u6599"}),n>1&&(0,C.jsxs)(C.Fragment,{children:[(0,C.jsx)("div",{style:{width:1,height:20,background:"rgba(204,195,214,.65)",margin:"0 2px"}}),(0,C.jsxs)("div",{style:{fontSize:12,fontWeight:700,color:"var(--interactive-accent)",padding:"0 4px"},children:["\u5DF2\u9009 ",n]}),(0,C.jsx)("button",{title:"\u8FDE\u63A5\u9009\u4E2D\u7684\u4E24\u4E2A block",onClick:x,disabled:n!==2,style:{...h,width:46,opacity:n===2?1:.48},children:"\u8FDE\u7EBF"}),(0,C.jsx)("button",{title:"\u5C06\u9009\u4E2D block \u6C89\u6DC0\u4E3A\u6210\u679C\u8282\u70B9",onClick:f,style:{...h,width:70},children:"\u6C89\u6DC0\u6210\u679C"}),(0,C.jsx)("button",{title:"\u5C06\u9009\u4E2D block \u5EFA\u7ACB\u5206\u7EC4",onClick:d,style:{...h,width:46},children:"\u5206\u7EC4"}),a>0&&(0,C.jsx)("button",{title:"\u89E3\u6563\u5206\u7EC4",onClick:p,style:{...h,width:46,color:"#b42318"},children:"\u89E3\u6563"}),(0,C.jsx)("button",{title:"\u5220\u9664\u9009\u4E2D block",onClick:c,style:{...h,width:46,color:"#b42318"},children:"\u5220\u9664"})]}),i&&(0,C.jsxs)(C.Fragment,{children:[(0,C.jsx)("div",{style:{width:1,height:20,background:"rgba(204,195,214,.65)",margin:"0 2px"}}),(0,C.jsx)("select",{title:"\u8FDE\u7EBF\u7C7B\u578B",value:i.type,onChange:b=>v(b.target.value),style:{height:30,borderRadius:10,border:"1px solid rgba(204,195,214,.55)",background:"rgba(255,255,255,.92)",color:"var(--text-normal)",fontSize:12,fontWeight:650,padding:"0 8px"},children:["references","supports","challenges","answers","leads_to","derived_from","exported_to"].map(b=>(0,C.jsx)("option",{value:b,children:zE(b)},b))}),(0,C.jsx)("button",{title:"\u5220\u9664\u8FDE\u7EBF",onClick:E,style:{...h,width:46,color:"#b42318"},children:"\u5220\u7EBF"})]})]})}function Q1(t){switch(t){case"web_link":return"\u7F51\u9875\u94FE\u63A5";case"vault_file":return"Vault \u6587\u4EF6";case"local_file":return"\u672C\u5730\u9644\u4EF6";default:return"\u81EA\u7531\u6587\u672C"}}function KE({kind:t,title:e,body:n,note:i,onKindChange:a,onTitleChange:r,onBodyChange:s,onNoteChange:o,onClose:l,onSubmit:c}){let u=t==="text"?"\u6750\u6599\u5185\u5BB9":t==="web_link"?"\u7F51\u9875 URL":"\u6587\u4EF6\u8DEF\u5F84",d=t==="text"?"\u7C98\u8D34\u4E00\u6BB5\u6750\u6599\u3001\u6458\u5F55\u6216\u60F3\u6CD5":t==="web_link"?"https://example.com/article":t==="vault_file"?"TraceMind/index/person/xxx.md":"/Users/.../file.pdf",p=n.trim().length>0;return(0,C.jsx)("div",{style:{position:"absolute",inset:0,zIndex:80,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(20,20,24,.16)",backdropFilter:"blur(3px)"},children:(0,C.jsxs)("div",{style:{width:440,padding:16,borderRadius:18,background:"rgba(255,255,255,.96)",border:"1px solid rgba(204,195,214,.58)",boxShadow:"0 24px 70px -28px rgba(26,28,28,.55)",fontFamily:"var(--font-body)"},children:[(0,C.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12},children:[(0,C.jsx)("div",{style:{fontSize:16,fontWeight:750,color:"var(--text-normal)"},children:"\u6DFB\u52A0\u6750\u6599"}),(0,C.jsx)("button",{onClick:l,style:{width:30,height:30,borderRadius:999,border:"1px solid rgba(204,195,214,.55)",background:"var(--background-secondary)",cursor:"pointer"},children:"\xD7"})]}),(0,C.jsxs)("div",{style:{display:"grid",gap:10},children:[(0,C.jsx)("div",{style:{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:6},children:["text","web_link","vault_file","local_file"].map(f=>(0,C.jsx)("button",{onClick:()=>a(f),style:{height:32,borderRadius:999,border:"1px solid rgba(204,195,214,.55)",background:t===f?"rgba(124,58,237,.12)":"var(--background-secondary)",color:t===f?"var(--interactive-accent)":"var(--text-normal)",cursor:"pointer",fontSize:12,fontWeight:700},children:Q1(f)},f))}),(0,C.jsx)("input",{value:e,onChange:f=>r(f.target.value),placeholder:"\u6750\u6599\u6807\u9898\uFF08\u53EF\u9009\uFF09",style:{height:36,borderRadius:10,border:"1px solid rgba(204,195,214,.6)",background:"var(--background-primary)",color:"var(--text-normal)",padding:"0 10px",outline:"none"}}),(0,C.jsxs)("label",{style:{display:"grid",gap:5,color:"var(--text-muted)",fontSize:12,fontWeight:650},children:[u,(0,C.jsx)("textarea",{value:n,onChange:f=>s(f.target.value),rows:t==="text"?6:2,maxLength:4e3,placeholder:d,style:{width:"100%",boxSizing:"border-box",padding:"9px 10px",borderRadius:10,border:"1px solid rgba(204,195,214,.6)",background:"var(--background-primary)",color:"var(--text-normal)",fontSize:13,lineHeight:1.45,resize:"vertical",outline:"none"}})]}),(0,C.jsx)("textarea",{value:i,onChange:f=>o(f.target.value),rows:2,maxLength:500,placeholder:"\u8865\u5145\u8BF4\u660E\uFF08\u53EF\u9009\uFF09\uFF1A\u5E0C\u671B agent \u5982\u4F55\u4F7F\u7528\u8FD9\u4EFD\u6750\u6599\uFF1F",style:{width:"100%",boxSizing:"border-box",padding:"9px 10px",borderRadius:10,border:"1px solid rgba(204,195,214,.6)",background:"var(--background-primary)",color:"var(--text-normal)",fontSize:13,lineHeight:1.45,resize:"vertical",outline:"none"}}),(0,C.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:[(0,C.jsx)("span",{style:{color:"var(--text-muted)",fontSize:11},children:"TraceMind \u53EA\u4FDD\u5B58\u5F15\u7528\u548C\u8BF4\u660E\uFF0C\u5177\u4F53\u5206\u6790\u4EA4\u7ED9 agent\u3002"}),(0,C.jsx)("button",{onClick:c,disabled:!p,style:{height:32,padding:"0 15px",borderRadius:999,border:"none",background:p?"var(--interactive-accent)":"var(--background-modifier-hover)",color:p?"var(--text-on-accent)":"var(--text-muted)",cursor:p?"pointer":"not-allowed",fontSize:13,fontWeight:700},children:"\u6DFB\u52A0\u5230\u767D\u677F"})]})]})]})})}var ZE=["frame_problem","brainstorming"],J1={frame_problem:"\u7834\u9898\u62F7\u95EE",brainstorming:"\u5934\u8111\u98CE\u66B4",mind_map:"\u601D\u7EF4\u5BFC\u56FE",decision_tree:"\u51B3\u7B56\u6811",rise:"RISE",user_map:"\u7528\u6237\u5730\u56FE"},QE=[{title:"\u53D1\u6563\u601D\u8003",actions:["frame_problem","brainstorming","mind_map"]},{title:"\u6218\u7565\u5206\u6790",actions:["rise","decision_tree"]},{title:"\u4EA7\u54C1\u5206\u6790",actions:["user_map"]}];function L4({session:t,onSessionChange:e,onExportFile:n,onRetrieveMemory:i,providerKey:a,cwd:r}){let[s,o]=(0,A.useState)(t),[l,c]=(0,A.useState)({}),[u,d]=(0,A.useState)(t.blocks[0]?.id||null),[p,f]=(0,A.useState)(()=>new Set(t.blocks[0]?.id?[t.blocks[0].id]:[])),[y,x]=(0,A.useState)(null),[E,v]=(0,A.useState)(null),[h,b]=(0,A.useState)(null),[w,B]=(0,A.useState)(null),[j,T]=(0,A.useState)(null),[P,D]=(0,A.useState)(null),[I,q]=(0,A.useState)(null),[Et,te]=(0,A.useState)("pan"),[ze,$t]=(0,A.useState)(null),[L,St]=(0,A.useState)({x:0,y:0,scale:1}),[$n,pt]=(0,A.useState)(!1),[B3,yt]=(0,A.useState)("agent"),[B0,fl]=(0,A.useState)(!1),[vi,wn]=(0,A.useState)(null),[R0,R3]=(0,A.useState)(ZE),[Nu,pr]=(0,A.useState)(!1),[hl,gl]=(0,A.useState)("new"),[D0,ml]=(0,A.useState)(null),[I0,Pu]=(0,A.useState)(null),[bi,ju]=(0,A.useState)(""),[D3,$u]=(0,A.useState)(!1),[Cn,F0]=(0,A.useState)("text"),[Uu,O0]=(0,A.useState)(""),[Hu,z0]=(0,A.useState)(""),[Ds,L0]=(0,A.useState)(""),Sn=(0,A.useRef)(null),N0=(0,A.useRef)(null),fr=(0,A.useRef)(null),Yu=(0,A.useRef)(Et),Vu=(0,A.useRef)(null),Un=(0,A.useRef)(null),X=(0,A.useRef)(t),Ze=(0,A.useRef)(L),Is=(0,A.useRef)(null),Fs=(0,A.useRef)({}),Os=(0,A.useRef)([]),Gu=(0,A.useCallback)(g=>{Ze.current=g;let m=N0.current;m&&(m.style.transform=`translate(${g.x}px, ${g.y}px) scale(${g.scale})`)},[]),ki=(0,A.useCallback)(g=>{Ze.current=g,St(g)},[]),P0=(0,A.useCallback)(g=>{Gu(g),Is.current===null&&(Is.current=window.requestAnimationFrame(()=>{Is.current=null,St(Ze.current)}))},[Gu]),qu=(0,A.useCallback)(g=>{g.preventDefault();let m=Sn.current?.getBoundingClientRect(),k=g.clientX-(m?.left||0),M=g.clientY-(m?.top||0),S=g.deltaY<0?1.08:1/1.08,O=Ze.current,F=q1(O.scale*S),tt=(k-O.x)/O.scale,Tt=(M-O.y)/O.scale;P0({x:k-tt*F,y:M-Tt*F,scale:F})},[P0]);(0,A.useEffect)(()=>{X.current=s},[s]),(0,A.useEffect)(()=>{Ze.current=L},[L]),(0,A.useEffect)(()=>{Yu.current=Et},[Et]),(0,A.useEffect)(()=>{Os.current=[]},[t.id]),(0,A.useEffect)(()=>()=>{Un.current!==null&&window.clearTimeout(Un.current),Is.current!==null&&window.cancelAnimationFrame(Is.current)},[]),(0,A.useEffect)(()=>{let g=Sn.current;if(g)return g.addEventListener("wheel",qu,{passive:!1}),()=>g.removeEventListener("wheel",qu)},[qu]);let I3=y&&s.edges.find(g=>g.id===y)||null,gn=E&&(s.groups||[]).find(g=>g.id===E)||null,zs=(0,A.useMemo)(()=>PE(s),[s]),Ei=(0,A.useMemo)(()=>{let g=l;return Object.keys(g).length===0?s.blocks:s.blocks.map(m=>g[m.id]?{...m,position:g[m.id]}:m)},[s.blocks,l]),st=u&&Ei.find(g=>g.id===u)||null,hr=p.size,Ls=(0,A.useCallback)(()=>{Un.current!==null&&(window.clearTimeout(Un.current),Un.current=null)},[]),j0=(0,A.useCallback)(g=>{Ls(),Un.current=window.setTimeout(()=>{Pu(g),Un.current=null},300)},[Ls]),Xu=(0,A.useCallback)(()=>{Ls(),Un.current=window.setTimeout(()=>{Pu(null),Un.current=null},160)},[Ls]),F3=(0,A.useCallback)(g=>{g?j0(g):Xu()},[Xu,j0]),yl=(0,A.useCallback)(g=>{R3(m=>[g,...m.filter(k=>k!==g)].slice(0,5))},[]),O3=(s.groups||[]).filter(g=>[...p].some(m=>g.blockIds.includes(m))).length,G=(0,A.useCallback)(g=>{X.current=g,o(g),e(g)},[e]),$0=(0,A.useCallback)(g=>{Fs.current=g,c(g)},[]),U0=(0,A.useCallback)(()=>{Fs.current={},c({})},[]),H0=(0,A.useCallback)(g=>{let m=Fs.current;return Object.keys(m).length===0?g:{...g,blocks:g.blocks.map(k=>m[k.id]?{...k,position:m[k.id]}:k)}},[]),gr=(0,A.useCallback)(g=>{Os.current=p4(Os.current,g)},[]),Y0=(0,A.useCallback)(()=>{let g=f4(Os.current);g.snapshot&&(Os.current=g.history,G(g.snapshot),d(null),f(new Set),x(null),v(null),pr(!1),wn(null))},[G]),Nt=(0,A.useCallback)(g=>{d(g),f(g?new Set([g]):new Set),x(null),v(null)},[]),z3=(0,A.useCallback)((g,m)=>{pr(!1),wn(null),x(null),v(null),f(k=>{let M=m4([...k],g,m),S=new Set(M);return d(S.has(g)?g:M[0]||null),S})},[]),xl=(0,A.useCallback)((g,m)=>{let k=Sn.current?.getBoundingClientRect(),M=Ze.current;return{x:(g-(k?.left||0)-M.x)/M.scale,y:(m-(k?.top||0)-M.y)/M.scale}},[]),V0=(0,A.useCallback)(()=>{let g=Sn.current?.getBoundingClientRect(),m=Ze.current;return{x:((g?.width||0)/2-m.x)/m.scale-nt.x,y:((g?.height||0)/2-m.y)/m.scale-nt.y}},[]),L3=(0,A.useCallback)((g,m)=>{let k=X.current,M=k.blocks.find(Zt=>Zt.id===g);if(!M)return;let S=p.has(g)?p:new Set([g]),O=Fs.current[g]||M.position,F=m.x-O.x,tt=m.y-O.y;if(F===0&&tt===0)return;let Tt={...Fs.current};for(let Zt of S){let ke=k.blocks.find(kl=>kl.id===Zt);if(!ke)continue;let Z=Tt[Zt]||ke.position;Tt[Zt]={x:Z.x+F,y:Z.y+tt}}$0(Tt)},[p,$0]),N3=(0,A.useCallback)(g=>{let m=H0(X.current),k=p.has(g)?[...p]:[g],M=D4(m.blocks,k);U0(),G({...m,blocks:M.blocks})},[H0,U0,G,p]),P3=(0,A.useCallback)(g=>{let m=X.current,k=(m.groups||[]).find(S=>S.id===g);if(!k)return;let M=D4(m.blocks,k.blockIds);M.delta.x===0&&M.delta.y===0||G({...m,blocks:M.blocks,groups:(m.groups||[]).map(S=>S.id===g?{...S,position:{x:S.position.x+M.delta.x,y:S.position.y+M.delta.y}}:S)})},[G]),j3=(0,A.useCallback)((g,m)=>{let k=X.current,M=k.blocks.find(S=>S.id===g);!M||M.type!=="output"||G({...k,blocks:k.blocks.map(S=>S.id===g?{...S,size:m}:S)})},[G]),Ku=(0,A.useCallback)(()=>{let g=X.current;p.size!==0&&(gr(g),G({...g,blocks:g.blocks.filter(m=>!p.has(m.id)),edges:g.edges.filter(m=>!p.has(m.from)&&!p.has(m.to)),groups:(g.groups||[]).map(m=>({...m,blockIds:m.blockIds.filter(k=>!p.has(k))})).filter(m=>m.blockIds.length>0)}),Nt(null))},[G,gr,Nt,p]),$3=(0,A.useCallback)(()=>{let g=[...p];if(g.length!==2)return;let m=X.current;if(m.edges.some(S=>S.from===g[0]&&S.to===g[1]||S.from===g[1]&&S.to===g[0]))return;let M={id:A4("edge"),from:g[0],to:g[1],type:"references"};G({...m,edges:[...m.edges,M]}),x(M.id),v(null)},[G,p]),Zu=(0,A.useCallback)(()=>{if(!y)return;let g=X.current;gr(g),G({...g,edges:g.edges.filter(m=>m.id!==y)}),x(null)},[G,gr,y]),U3=(0,A.useCallback)(g=>{if(!y)return;let m=X.current;G({...m,edges:m.edges.map(k=>k.id===y?{...k,type:g}:k)})},[G,y]),H3=(0,A.useCallback)(()=>{let g=X.current,m=g.blocks.filter(S=>p.has(S.id));if(m.length<2)return;let k=NE(m),M={id:A4("group"),title:`\u5206\u7EC4 ${(g.groups||[]).length+1}`,blockIds:m.map(S=>S.id),position:{x:k.x,y:k.y},size:{width:k.width,height:k.height},createdAt:new Date().toISOString()};G({...g,groups:[...g.groups||[],M]}),v(M.id),d(null)},[G,p]),Qu=(0,A.useCallback)(g=>{let m=X.current,k=g||[...p],M=m.blocks.filter(F=>k.includes(F.id));if(M.length===0)return;let S=m.blocks.filter(F=>F.type==="output").length,O=w1(M,S);G({...m,blocks:[...m.blocks,O.block],edges:[...m.edges,...O.edges]}),Nt(O.block.id)},[G,Nt,p]),G0=(0,A.useCallback)(g=>{let m=X.current,k=m.blocks.filter(tt=>g.blockIds.includes(tt.id));if(k.length===0)return;let M=m.blocks.filter(tt=>tt.type==="output").length,S=w1(k,M),O={...S.block,sourceRefs:g.blockIds,data:{...S.block.data||{},groupId:g.id,inputBlockIds:g.blockIds}},F=dt({from:g.id,to:O.id,type:"leads_to"});G({...m,blocks:[...m.blocks,O],edges:[...m.edges,F]}),Nt(O.id)},[G,Nt]),Y3=(0,A.useCallback)((g,m)=>{let k=X.current,M=y4(k.blocks,k.groups||[],g,m);G({...k,blocks:M.blocks,groups:M.groups})},[G]),q0=(0,A.useCallback)(()=>{let g=X.current,m=g.groups||[],k=m.find(M=>p.size>0&&[...p].every(S=>M.blockIds.includes(S)));k&&(G({...g,groups:m.filter(M=>M.id!==k.id)}),v(null))},[G,p]),X0=(0,A.useCallback)(async g=>{let m=X.current,k=L5(g,m.blocks,m.edges,m.groups||[]);if(k.length===0)return;let M={...g,summary:"\u6B63\u5728\u751F\u6210\u603B\u7ED3",detail:g.detail,data:{...g.data||{},outputStatus:"generating"}};G({...m,blocks:m.blocks.map(S=>S.id===g.id?M:S)}),pt(!0),yt("agent");try{let O=a&&r?await j5(M,k,a,r):await P5(M,k),F=X.current;G({...F,blocks:F.blocks.map(tt=>tt.id===O.id?O:tt)}),Nt(O.id)}finally{pt(!1)}},[G,r,a,Nt]),Ju=(0,A.useCallback)(()=>{F0("text"),O0(""),z0(""),L0("")},[]),V3=(0,A.useCallback)(()=>{let g=Hu.trim();if(!g)return;let m=Uu.trim()||`${Q1(Cn)}\u6750\u6599`,k=V0(),M=ce({category:"source",type:"material_source",title:`\u6750\u6599\uFF1A${X1(m,24)}`,summary:g.slice(0,120),detail:[Cn==="text"?g:`${Q1(Cn)}\uFF1A${g}`,Ds.trim()?`
\u8BF4\u660E\uFF1A${Ds.trim()}`:""].filter(Boolean).join(`
`),position:{x:k.x-Ee.width/2,y:k.y-Ee.height/2},size:{...Ee},data:{materialKind:Cn,materialUrl:Cn==="web_link"?g:void 0,materialPath:Cn==="vault_file"||Cn==="local_file"?g:void 0,note:Ds.trim()||void 0}}),S=X.current;G({...S,blocks:[...S.blocks,M]}),Nt(M.id),$u(!1),Ju()},[G,Hu,Cn,Ds,Uu,Ju,Nt,V0]),Ns=(0,A.useCallback)(g=>{let m=Sn.current,k=Ze.current,M=q1(k.scale*g),S=m?.getBoundingClientRect(),O=S?S.width/2:0,F=S?S.height/2:0,tt=(O-k.x)/k.scale,Tt=(F-k.y)/k.scale;ki({x:O-tt*M,y:F-Tt*M,scale:M})},[ki]),Ps=(0,A.useCallback)(()=>{ki({x:0,y:0,scale:1})},[ki]),js=(0,A.useCallback)(()=>{let g=Sn.current,m=X.current.blocks;if(!g||m.length===0){Ps();return}let k=Math.min(...m.map(Z=>Z.position.x+nt.x)),M=Math.min(...m.map(Z=>Z.position.y+nt.y)),S=Math.max(...m.map(Z=>Z.position.x+nt.x+Z.size.width)),O=Math.max(...m.map(Z=>Z.position.y+nt.y+Z.size.height)),F=g.getBoundingClientRect();if(F.width<Su||F.height<Su)return;let tt=96,Tt=Math.max(1,S-k),Zt=Math.max(1,O-M),ke=q1(Math.min((F.width-tt*2)/Tt,(F.height-tt*2)/Zt,1.15));ki({x:F.width/2-(k+Tt/2)*ke,y:F.height/2-(M+Zt/2)*ke,scale:ke})},[ki,Ps]);(0,A.useEffect)(()=>{let g=0,m=0,k=null,M=()=>{let S=Sn.current?.getBoundingClientRect();if(S&&S.width>=Su&&S.height>=Su){js(),k?.disconnect();return}m<12&&(m+=1,g=requestAnimationFrame(M))};return typeof ResizeObserver<"u"&&Sn.current&&(k=new ResizeObserver(()=>M()),k.observe(Sn.current)),g=requestAnimationFrame(M),()=>{cancelAnimationFrame(g),k?.disconnect()}},[js]);let Dt=(0,A.useCallback)(async(g,m)=>{let k=X.current,M=new Set(k.blocks.map(F=>F.id)),S=new Set(k.edges.map(F=>F.id));for(let F of g){await G1(140),M.add(F.id);let tt=m.filter(Tt=>!S.has(Tt.id)&&M.has(Tt.from)&&M.has(Tt.to));tt.forEach(Tt=>S.add(Tt.id)),k={...k,blocks:[...k.blocks,F],edges:[...k.edges,...tt]},G(k),Nt(F.id)}let O=m.filter(F=>!S.has(F.id));O.length>0&&G({...k,edges:[...k.edges,...O]})},[G,Nt]),It=(0,A.useCallback)(async(g,m)=>{if(![...g,...m].some(O=>O.data?.memoryRetrievalEnabled===!0)||!i)return m;let M=await i(g,m),S={id:`memory-context-${Date.now()}`,category:"source",type:"memory",title:M.items.length>0?`\u76F8\u5173\u8BB0\u5FC6\u4E0A\u4E0B\u6587\uFF08${M.items.length}\uFF09`:"\u76F8\u5173\u8BB0\u5FC6\u4E0A\u4E0B\u6587",summary:M.items.length>0?`TraceMind \u5DF2\u68C0\u7D22\u5230 ${M.items.length} \u6761\u76F8\u5173\u8BB0\u5FC6\u3002`:"TraceMind \u672A\u68C0\u7D22\u5230\u5F3A\u76F8\u5173\u8BB0\u5FC6\u3002",detail:M.contextText,position:{x:0,y:0},size:{width:1,height:1},data:{transient:!0,memoryRetrieved:!0,memoryItems:M.items.map(O=>({type:O.type,title:O.title,path:O.path,score:O.score,reason:O.reason}))}};return[...m,S]},[i]),K0=(0,A.useCallback)(async g=>{let m=X.current,k=ra([g],m.blocks,m.edges);pt(!0),yt("agent");try{let M=await It([g],k),O=a&&r?await A1(g,a,r,M,m.blocks):await S1(g,m.blocks);yt("rendering"),await Dt(O.blocks,O.edges)}finally{pt(!1)}},[r,Dt,a,It]),Z0=(0,A.useCallback)(async g=>{let m=X.current,k=g||m.blocks.filter(S=>p.has(S.id)&&S.type!=="output");if(k.length===0)return;let M=ra(k,m.blocks,m.edges);pt(!0),yt("agent");try{let S=await It(k,M),F=a&&r?await M1(k,a,r,S,m.blocks):await T1(k,S,m.blocks);yt("rendering"),await Dt(F.blocks,F.edges)}finally{pt(!1)}},[r,Dt,a,p,It]),Q0=(0,A.useCallback)(async g=>{let m=X.current,k=g||m.blocks.filter(S=>p.has(S.id)&&S.type!=="output");if(k.length===0)return;let M=ra(k,m.blocks,m.edges);pt(!0),yt("agent");try{let S=await It(k,M),F=a&&r?await D1(k,a,r,S,m.blocks):await R1(k,S,m.blocks);yt("rendering"),await Dt(F.blocks,F.edges)}finally{pt(!1)}},[r,Dt,a,p,It]),J0=(0,A.useCallback)(async g=>{let m=X.current,k=g||m.blocks.filter(S=>p.has(S.id)&&S.type!=="output");if(k.length===0)return;let M=ra(k,m.blocks,m.edges);pt(!0),yt("agent");try{let S=await It(k,M),F=a&&r?await B1(k,a,r,S,m.blocks):await _1(k,S,m.blocks);yt("rendering"),await Dt(F.blocks,F.edges)}finally{pt(!1)}},[r,Dt,a,p,It]),W0=(0,A.useCallback)(async g=>{let m=X.current,k=g||m.blocks.filter(S=>p.has(S.id)&&S.type!=="output");if(k.length===0)return;let M=ra(k,m.blocks,m.edges);pt(!0),yt("agent");try{let S=await It(k,M),F=a&&r?await F1(k,a,r,S,m.blocks):await I1(k,S,m.blocks);yt("rendering"),await Dt(F.blocks,F.edges)}finally{pt(!1)}},[r,Dt,a,p,It]),th=(0,A.useCallback)(async g=>{let m=X.current,k=g||m.blocks.filter(S=>p.has(S.id)&&S.type!=="output");if(k.length===0)return;let M=ra(k,m.blocks,m.edges);pt(!0),yt("agent");try{let S=await It(k,M),F=a&&r?await z1(k,a,r,S,m.blocks):await O1(k,S,m.blocks);yt("rendering"),await Dt(F.blocks,F.edges)}finally{pt(!1)}},[r,Dt,a,p,It]),eh=(0,A.useCallback)(async g=>{let m=X.current,k=m.blocks.filter(S=>g.blockIds.includes(S.id));if(k.length===0)return;let M=Nn(g,m.blocks);pt(!0),yt("agent");try{let S=await It(k,k),F=a&&r?await A1(M,a,r,S,m.blocks):await S1(M,m.blocks);yt("rendering"),await Dt(F.blocks,F.edges)}finally{pt(!1)}},[r,Dt,a,It]),nh=(0,A.useCallback)(async g=>{let m=X.current,k=m.blocks.filter(S=>g.blockIds.includes(S.id));if(k.length===0)return;let M=Nn(g,m.blocks);pt(!0),yt("agent");try{let S=await It(k,k),F=a&&r?await M1([M],a,r,S,m.blocks):await T1([M],S,m.blocks);yt("rendering"),await Dt(F.blocks,F.edges)}finally{pt(!1)}},[r,Dt,a,It]),ih=(0,A.useCallback)(async g=>{let m=X.current,k=m.blocks.filter(S=>g.blockIds.includes(S.id));if(k.length===0)return;let M=Nn(g,m.blocks);pt(!0),yt("agent");try{let S=await It(k,k),F=a&&r?await D1([M],a,r,S,m.blocks):await R1([M],S,m.blocks);yt("rendering"),await Dt(F.blocks,F.edges)}finally{pt(!1)}},[r,Dt,a,It]),ah=(0,A.useCallback)(async g=>{let m=X.current,k=m.blocks.filter(O=>g.blockIds.includes(O.id));if(k.length===0)return;let M=Nn(g,m.blocks),S=ra(k,m.blocks,m.edges);pt(!0),yt("agent");try{let O=await It(k,S),tt=a&&r?await B1([M],a,r,O,m.blocks):await _1([M],O,m.blocks);yt("rendering"),await Dt(tt.blocks,tt.edges)}finally{pt(!1)}},[r,Dt,a,It]),rh=(0,A.useCallback)(async g=>{let m=X.current,k=m.blocks.filter(S=>g.blockIds.includes(S.id));if(k.length===0)return;let M=Nn(g,m.blocks);pt(!0),yt("agent");try{let S=await It(k,k),F=a&&r?await F1([M],a,r,S,m.blocks):await I1([M],S,m.blocks);yt("rendering"),await Dt(F.blocks,F.edges)}finally{pt(!1)}},[r,Dt,a,It]),sh=(0,A.useCallback)(async g=>{let m=X.current,k=m.blocks.filter(S=>g.blockIds.includes(S.id));if(k.length===0)return;let M=Nn(g,m.blocks);pt(!0),yt("agent");try{let S=await It(k,k),F=a&&r?await z1([M],a,r,S,m.blocks):await O1([M],S,m.blocks);yt("rendering"),await Dt(F.blocks,F.edges)}finally{pt(!1)}},[r,Dt,a,It]),oh=(0,A.useCallback)((g,m)=>(yl(g),wn(null),g==="frame_problem"?K0(m):g==="brainstorming"?Z0([m]):g==="mind_map"?J0([m]):g==="decision_tree"?Q0([m]):g==="rise"?th([m]):W0([m])),[yl,K0,Z0,Q0,J0,th,W0]),lh=(0,A.useCallback)((g,m)=>(yl(g),wn(null),g==="frame_problem"?eh(m):g==="brainstorming"?nh(m):g==="mind_map"?ah(m):g==="decision_tree"?ih(m):g==="rise"?sh(m):rh(m)),[yl,nh,ih,eh,ah,sh,rh]),G3=(0,A.useCallback)(g=>{let m=g.type==="user_reply"?"edit":"new";gl(m),ml(g.id),ju(m==="edit"&&(g.detail||g.summary)||""),pr(!0)},[]),q3=(0,A.useCallback)(async()=>{let g=bi.trim();if(!g)return;pr(!1),ju("");let m=X.current,k=m.blocks.find(tt=>tt.id===D0);if(!k){ml(null),gl("new");return}if(hl==="edit"&&k.type==="user_reply"){let tt=typeof k.data?.replyToBlockId=="string"?k.data.replyToBlockId:k.sourceRefs?.[0],Tt=m.blocks.find(Z=>Z.id===tt)||k,Zt={...k,summary:g.slice(0,120),detail:g.slice(0,2e3),edited:!0},ke=new Set(m.blocks.filter(Z=>Z.type==="agent_reply"&&Z.data?.userReplyBlockId===k.id||Z.data?.method==="rise"&&Z.data?.userReplyBlockId===k.id).map(Z=>Z.id));m={...m,blocks:m.blocks.filter(Z=>!ke.has(Z.id)).map(Z=>Z.id===k.id?Zt:Z),edges:m.edges.filter(Z=>!ke.has(Z.from)&&!ke.has(Z.to)&&!(Z.from===k.id&&ke.has(Z.to)))},G(m),Nt(Zt.id),pt(!0),yt("agent");try{let Z=a&&r,kl=T4(Tt)?Z?await N1(Tt,Zt,a,r,m.blocks):await L1(Tt,Zt,m.blocks):Z?await j1(Tt,g,a,r,m.blocks,Zt):await P1(Tt,g,Zt);yt("rendering");for(let ha of kl.blocks)await G1(140),m=X.current,G({...m,blocks:[...m.blocks,ha],edges:[...m.edges]}),Nt(ha.id);let hh=new Set(X.current.blocks.map(ha=>ha.id)),gh=kl.edges.filter(ha=>hh.has(ha.from)&&hh.has(ha.to));gh.length>0&&(m=X.current,G({...m,edges:[...m.edges,...gh]}))}finally{pt(!1),gl("new"),ml(null)}return}gl("new");let M=m.blocks.filter(tt=>tt.type==="user_reply"&&tt.data?.replyToBlockId===k.id),S=m.blocks.filter(tt=>tt.type==="user_reply"||tt.title.startsWith("\u7528\u6237\u56DE\u590D")).length+1,O=ce({category:"response",type:"user_reply",title:`\u7528\u6237\u56DE\u590D ${S}`,summary:g.slice(0,120),detail:g.slice(0,2e3),sourceRefs:[k.id],position:{x:k.position.x+k.size.width+140,y:k.position.y-60+M.length*160},size:{...Ee},data:{replyToBlockId:k.id,replyIndex:S}}),F=dt({from:k.id,to:O.id,type:"answers"});m={...m,blocks:[...m.blocks,O],edges:[...m.edges,F]},G(m),Nt(O.id),pt(!0),yt("agent");try{let tt=a&&r,Tt=T4(k)?tt?await N1(k,O,a,r,m.blocks):await L1(k,O,m.blocks):tt?await j1(k,g,a,r,m.blocks,O):await P1(k,g,O);yt("rendering");for(let Z of Tt.blocks)await G1(140),m=X.current,G({...m,blocks:[...m.blocks,Z],edges:[...m.edges]}),Nt(Z.id);let Zt=new Set(X.current.blocks.map(Z=>Z.id)),ke=Tt.edges.filter(Z=>Zt.has(Z.from)&&Zt.has(Z.to));ke.length>0&&(m=X.current,G({...m,edges:[...m.edges,...ke]}))}finally{pt(!1),ml(null)}},[G,r,a,hl,bi,D0,Nt]),X3=(0,A.useCallback)(g=>{let m=X.current;G({...m,blocks:m.blocks.map(k=>k.id===g.id?g:k)})},[G]),K3=(0,A.useCallback)(g=>{let m=X.current;gr(m),G({...m,blocks:m.blocks.filter(k=>k.id!==g.id),edges:m.edges.filter(k=>k.from!==g.id&&k.to!==g.id),groups:(m.groups||[]).map(k=>({...k,blockIds:k.blockIds.filter(M=>M!==g.id)})).filter(k=>k.blockIds.length>0)}),Nt(null)},[G,gr,Nt]),Z3=(0,A.useCallback)(async(g,m,k,M)=>{await n(g,m),fl(!1)},[n]);(0,A.useEffect)(()=>{let g=m=>{if(!m.target.matches('input, textarea, [contenteditable="true"]')){if((m.metaKey||m.ctrlKey)&&m.key.toLowerCase()==="z"&&!m.shiftKey){m.preventDefault(),Y0();return}if((m.metaKey||m.ctrlKey)&&(m.key==="="||m.key==="+")){m.preventDefault(),Ns(1.12);return}if((m.metaKey||m.ctrlKey)&&m.key==="-"){m.preventDefault(),Ns(.8928571428571428);return}if(m.key==="0"){m.preventDefault(),Ps();return}if(m.key==="1"){m.preventDefault(),js();return}if((m.key==="Delete"||m.key==="Backspace")&&y){m.preventDefault(),Zu();return}(m.key==="Delete"||m.key==="Backspace")&&p.size>0&&(m.preventDefault(),Ku())}};return window.addEventListener("keydown",g),()=>window.removeEventListener("keydown",g)},[Ku,Zu,js,Ps,p.size,y,Y0,Ns]);let Wu=(0,A.useMemo)(()=>!st||hr!==1?null:{left:st.position.x+nt.x+st.size.width/2,top:st.position.y+nt.y+st.size.height+12},[st,hr]),td=(0,A.useMemo)(()=>gn?{left:gn.position.x+nt.x+gn.size.width/2,top:gn.position.y+nt.y+gn.size.height+12}:null,[gn]),$s=(0,A.useMemo)(()=>E||hr<2?null:x4(Ei,[...p]),[Ei,p,hr,E]),vl=(0,A.useCallback)(()=>{q(null),fr.current=null,$t(null),ki(Ze.current)},[ki]),Q3=(0,A.useCallback)(g=>{Yu.current=g,te(g),q(null),fr.current=null,$t(null)},[]),J3=(0,A.useCallback)(g=>{let m=g.target;return g.target===g.currentTarget||m?.dataset.tracemindCanvasSurface==="true"},[]),ch=h4(Et,ze),W3=s.exportHistory.map(g=>g.filePath),mn=st?.type==="output",t8=st?.type==="user_reply",e8=st?.type==="user_reply"||st?.type==="agent_reply",n8=st?.type==="diary_source"||st?.type==="entity_source"||st?.type==="material_source",fa=st?.type==="error"||st?.type==="warning",i8=st&&!e8&&!fa&&!mn,a8=st&&!fa&&!mn,r8=st&&!fa&&!mn,s8=st&&!fa&&!mn,o8=st&&!fa&&!mn,l8=st&&!fa&&!mn,bl=st&&!n8&&!fa&&!mn,uh={frame_problem:!!i8,brainstorming:!!a8,mind_map:!!r8,decision_tree:!!s8,rise:!!o8,user_map:!!l8},dh=R0.filter(g=>uh[g]).slice(0,2),ph=R0.slice(0,2),fh=st?.data?.outputStatus==="ready"?"\u91CD\u65B0\u751F\u6210":"\u751F\u6210\u603B\u7ED3",c8=t8?"\u4FEE\u6539\u56DE\u590D":"\u56DE\u590D",u8=hl==="edit"?"\u4FEE\u6539\u4F60\u7684\u56DE\u590D\uFF0Cagent \u4F1A\u81EA\u52A8\u91CD\u65B0\u56DE\u5E94":"\u5199\u4E0B\u4F60\u7684\u56DE\u5E94\uFF0Cagent \u4F1A\u81EA\u52A8\u63A5\u7740\u56DE\u5E94",d8=hl==="edit"?"\u4FDD\u5B58\u5E76\u91CD\u65B0\u56DE\u5E94":"\u53D1\u9001\u56DE\u590D";return(0,C.jsxs)("div",{style:{width:"100%",height:"100%",display:"flex",position:"relative"},children:[(0,C.jsxs)("div",{ref:Sn,onContextMenu:g=>{g.preventDefault(),vl()},onPointerDown:g=>{if(!J3(g))return;if(Yu.current==="select"||g.shiftKey){let k=xl(g.clientX,g.clientY),M=Ze.current;fr.current={startX:g.clientX,startY:g.clientY,originX:M.x,originY:M.y,isSelecting:!0,selectStart:k},$t("select"),g.currentTarget.setPointerCapture(g.pointerId);return}Nt(null);let m=Ze.current;fr.current={startX:g.clientX,startY:g.clientY,originX:m.x,originY:m.y},$t("pan"),g.currentTarget.setPointerCapture(g.pointerId)},onPointerMove:g=>{if(h){let k=xl(g.clientX,g.clientY);B(k);let M=[...s.blocks,...(s.groups||[]).map(O=>Nn(O,s.blocks))],S=s.blocks.find(O=>O.id===h.blockId?!1:V1(O,{x:k.x-nt.x,y:k.y-nt.y},w4)!==null);if(S){T(S.id);let O=V1(S,{x:k.x-nt.x,y:k.y-nt.y},w4);D({x:O.x+nt.x,y:O.y+nt.y})}else{let O=s.blocks.find(F=>F.id===h.blockId||!M.some(tt=>tt.id===h.blockId)?!1:k.x>=F.position.x+nt.x&&k.x<=F.position.x+nt.x+F.size.width&&k.y>=F.position.y+nt.y&&k.y<=F.position.y+nt.y+F.size.height);T(O?O.id:null),D(O?{x:k.x,y:k.y}:null)}return}if(g.target!==g.currentTarget&&!g.currentTarget.hasPointerCapture(g.pointerId))return;let m=fr.current;if(m){if("isSelecting"in m&&m.isSelecting&&m.selectStart){let k=xl(g.clientX,g.clientY);q(M4(m.selectStart,k));return}Gu({...Ze.current,x:m.originX+g.clientX-m.startX,y:m.originY+g.clientY-m.startY})}},onPointerUp:g=>{if(h){if(j){let k=[...s.blocks,...(s.groups||[]).map(S=>Nn(S,s.blocks))].find(S=>S.id===h.blockId),M=s.blocks.find(S=>S.id===j);if(k&&M){let S=b4(k,h.side,M,"references");G({...X.current,edges:[...X.current.edges,S]}),x(S.id)}}b(null),B(null),Vu.current=null,T(null),D(null);return}if(g.target!==g.currentTarget&&!g.currentTarget.hasPointerCapture(g.pointerId))return;let m=fr.current;if(m&&"isSelecting"in m&&m.isSelecting&&m.selectStart){let k=m.selectStart,M=xl(g.clientX,g.clientY),S=M.x-k.x,O=M.y-k.y;if(S*S+O*O>100){let F=M4(k,M),tt=g4(X.current.blocks,F);f(new Set(tt)),d(tt[0]||null),x(null),v(null)}else Nt(null)}vl(),g.currentTarget.hasPointerCapture(g.pointerId)&&g.currentTarget.releasePointerCapture(g.pointerId)},onPointerCancel:g=>{vl(),g.currentTarget.hasPointerCapture(g.pointerId)&&g.currentTarget.releasePointerCapture(g.pointerId)},onLostPointerCapture:vl,style:{flex:1,height:"100%",position:"relative",overflow:"hidden",background:"#fbfbfc",cursor:ch},children:[(0,C.jsxs)("div",{ref:N0,"data-tracemind-canvas-surface":"true",style:{position:"relative",width:zs.width,height:zs.height,backgroundImage:"radial-gradient(rgba(120, 120, 120, 0.18) 1px, transparent 1px)",backgroundSize:"18px 18px",transform:`translate(${L.x}px, ${L.y}px) scale(${L.scale})`,transformOrigin:"0 0",cursor:ch},children:[(0,C.jsx)(HE,{blocks:Ei,groups:s.groups||[],edges:s.edges,workspaceSize:zs,selectedEdgeId:y,onSelectEdge:g=>{x(g),f(new Set),d(null),wn(null),pr(!1)}}),(0,C.jsx)(YE,{groups:s.groups||[],viewportScale:L.scale,selectedGroupId:E,onMoveGroup:Y3,onMoveGroupEnd:P3,onStartConnection:(g,m)=>{b({blockId:g,side:m}),Vu.current={blockId:g,side:m},B(null)},onSelectGroup:(g,m)=>{f(new Set(m)),d(null),x(null),v(g),wn(null),pr(!1)}}),I&&(0,C.jsx)("div",{style:{position:"absolute",left:I.x,top:I.y,width:I.width,height:I.height,border:"1.5px solid rgba(124,58,237,.72)",background:"rgba(124,58,237,.08)",borderRadius:10,pointerEvents:"none",zIndex:18}}),$s&&(0,C.jsx)("div",{style:{position:"absolute",left:$s.x-12,top:$s.y-12,width:$s.width+24,height:$s.height+24,border:"1.5px solid rgba(124,58,237,.42)",background:"rgba(124,58,237,.035)",borderRadius:18,pointerEvents:"none",zIndex:8,boxShadow:"0 16px 42px -30px rgba(50,36,88,.42)"},children:(0,C.jsxs)("div",{style:{position:"absolute",left:12,top:-24,height:20,padding:"0 8px",borderRadius:999,display:"flex",alignItems:"center",background:"rgba(255,255,255,.92)",border:"1px solid rgba(124,58,237,.18)",color:"var(--interactive-accent)",fontSize:11,fontWeight:700,boxShadow:"0 8px 18px -14px rgba(26,28,28,.45)"},children:["\u5DF2\u9009\u62E9 ",hr," \u4E2A block"]})}),Ei.map(g=>(0,C.jsx)(VE,{block:g,selected:p.has(g.id),connectionTarget:j===g.id,viewportScale:L.scale,onSelect:m=>z3(g.id,m.shiftKey),onMove:m=>L3(g.id,m),onMoveEnd:N3,onResize:m=>j3(g.id,m),onStartConnection:(m,k)=>{b({blockId:m,side:k}),Vu.current={blockId:m,side:k},B(null)},onHover:F3},g.id)),I0&&(()=>{let g=Ei.find(m=>m.id===I0);return g?(0,C.jsx)(GE,{block:g,cardX:g.position.x+nt.x,cardY:g.position.y+nt.y,cardWidth:g.size.width,viewportScale:L.scale,onMouseEnter:()=>{Ls(),Pu(g.id)},onMouseLeave:Xu}):null})(),h&&(()=>{let g=[...Ei,...(s.groups||[]).map(F=>Nn(F,Ei))].find(F=>F.id===h.blockId);if(!g)return null;let m=v4(g,h.side),k=m.x+nt.x,M=m.y+nt.y,S=P?.x??w?.x??k,O=P?.y??w?.y??M;return(0,C.jsxs)("svg",{width:zs.width,height:zs.height,style:{position:"absolute",inset:0,overflow:"visible",pointerEvents:"none",zIndex:25},children:[(0,C.jsx)("path",{d:Z1({x:k,y:M},{x:S,y:O}),fill:"none",stroke:"var(--interactive-accent)",strokeWidth:2,strokeLinecap:"round",opacity:.85}),(0,C.jsx)("circle",{cx:k,cy:M,r:4,fill:"var(--interactive-accent)"}),P&&(0,C.jsx)("circle",{cx:P.x,cy:P.y,r:6,fill:"var(--interactive-accent)",opacity:.6})]})})(),st&&Wu&&!$n&&(0,C.jsxs)("div",{style:{position:"absolute",left:Wu.left,top:Wu.top,transform:"translateX(-50%)",zIndex:20,display:"flex",flexDirection:"column",alignItems:"center",gap:8},children:[(0,C.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:5,height:36,padding:"4px 6px",borderRadius:999,background:"rgba(255,255,255,.94)",border:"1px solid rgba(204,195,214,.38)",boxShadow:"0 14px 34px -22px rgba(26,28,28,.42), 0 3px 10px -8px rgba(26,28,28,.28)",backdropFilter:"blur(12px)"},children:[(0,C.jsx)("span",{title:"\u601D\u8003\u64CD\u4F5C",style:{width:26,height:26,borderRadius:999,display:"inline-flex",alignItems:"center",justifyContent:"center",color:"var(--interactive-accent)",background:"rgba(124,58,237,.1)",border:"1px solid rgba(124,58,237,.16)",fontSize:15,fontWeight:700},children:"\u2726"}),bl&&(0,C.jsx)("button",{onClick:()=>G3(st),style:{height:28,padding:"0 12px",borderRadius:999,border:"1px solid rgba(204,195,214,.32)",background:Nu?"rgba(124,58,237,.1)":"rgba(246,244,248,.9)",color:Nu?"var(--interactive-accent)":"var(--text-normal)",cursor:"pointer",fontSize:13,fontWeight:650},children:c8}),dh.map((g,m)=>(0,C.jsx)("button",{onClick:()=>oh(g,st),style:{height:28,padding:"0 13px",borderRadius:999,border:m===0&&!bl?"1px solid transparent":"1px solid rgba(204,195,214,.32)",background:m===0&&!bl?"var(--interactive-accent)":"rgba(246,244,248,.9)",color:m===0&&!bl?"var(--text-on-accent)":"var(--text-normal)",cursor:"pointer",fontSize:13,fontWeight:650},children:J1[g]},g)),!mn&&(0,C.jsx)("button",{onClick:()=>Qu([st.id]),style:{height:28,padding:"0 12px",borderRadius:999,border:"1px solid rgba(204,195,214,.32)",background:"rgba(246,244,248,.9)",color:"var(--text-normal)",cursor:"pointer",fontSize:13,fontWeight:650},children:"\u6C89\u6DC0\u6210\u679C"}),mn&&(0,C.jsx)("button",{onClick:()=>X0(st),style:{height:28,padding:"0 13px",borderRadius:999,border:"1px solid transparent",background:"var(--interactive-accent)",color:"var(--text-on-accent)",cursor:"pointer",fontSize:13,fontWeight:650},children:fh}),(0,C.jsx)("button",{onClick:()=>wn(vi==="block"?null:"block"),style:{width:30,height:28,padding:0,borderRadius:999,border:"1px solid rgba(204,195,214,.32)",background:vi==="block"?"rgba(124,58,237,.1)":"rgba(246,244,248,.9)",color:vi==="block"?"var(--interactive-accent)":"var(--text-normal)",cursor:"pointer",fontSize:18,lineHeight:1},children:"\u22EF"})]}),vi==="block"&&(0,C.jsx)(I4,{availability:uh,visibleQuickActions:dh,onRunAction:g=>oh(g,st),onCreateOutput:()=>mn?X0(st):Qu([st.id]),outputActionLabel:mn?fh:"\u6C89\u6DC0\u6210\u679C",onExport:()=>{wn(null),fl(!0)}}),Nu&&(0,C.jsxs)("div",{style:{width:360,padding:10,borderRadius:14,background:"rgba(255,255,255,.94)",border:"1px solid rgba(204,195,214,.5)",boxShadow:"0 18px 46px -24px rgba(26,28,28,.5)",backdropFilter:"blur(14px)",display:"flex",flexDirection:"column",gap:8},children:[(0,C.jsx)("textarea",{value:bi,onChange:g=>ju(g.target.value),rows:3,maxLength:1e3,placeholder:u8,style:{width:"100%",boxSizing:"border-box",padding:"9px 10px",borderRadius:10,border:"1px solid rgba(204,195,214,.6)",background:"var(--background-primary)",color:"var(--text-normal)",fontSize:13,lineHeight:1.45,resize:"vertical",outline:"none"}}),(0,C.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:[(0,C.jsxs)("span",{style:{color:"var(--text-muted)",fontSize:11},children:[bi.length,"/1000"]}),(0,C.jsx)("button",{onClick:()=>q3(),disabled:!bi.trim(),style:{height:30,padding:"0 14px",borderRadius:999,border:"none",background:bi.trim()?"var(--interactive-accent)":"var(--background-modifier-hover)",color:bi.trim()?"var(--text-on-accent)":"var(--text-muted)",cursor:bi.trim()?"pointer":"not-allowed",fontSize:13,fontWeight:650},children:d8})]})]})]}),gn&&td&&!$n&&(0,C.jsxs)("div",{style:{position:"absolute",left:td.left,top:td.top,transform:"translateX(-50%)",zIndex:21,display:"flex",flexDirection:"column",alignItems:"center",gap:8},children:[(0,C.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:5,height:36,padding:"4px 6px",borderRadius:999,background:"rgba(255,255,255,.94)",border:"1px solid rgba(204,195,214,.38)",boxShadow:"0 14px 34px -22px rgba(26,28,28,.42), 0 3px 10px -8px rgba(26,28,28,.28)",backdropFilter:"blur(12px)"},children:[(0,C.jsx)("span",{title:"\u5206\u7EC4\u64CD\u4F5C",style:{width:26,height:26,borderRadius:999,display:"inline-flex",alignItems:"center",justifyContent:"center",color:"var(--interactive-accent)",background:"rgba(124,58,237,.1)",border:"1px solid rgba(124,58,237,.16)",fontSize:14,fontWeight:700},children:"\u25A6"}),ph.map((g,m)=>(0,C.jsx)("button",{onClick:()=>lh(g,gn),style:{height:28,padding:"0 13px",borderRadius:999,border:m===0?"1px solid transparent":"1px solid rgba(204,195,214,.32)",background:m===0?"var(--interactive-accent)":"rgba(246,244,248,.9)",color:m===0?"var(--text-on-accent)":"var(--text-normal)",cursor:"pointer",fontSize:13,fontWeight:650},children:J1[g]},g)),(0,C.jsx)("button",{onClick:()=>G0(gn),style:{height:28,padding:"0 12px",borderRadius:999,border:"1px solid rgba(204,195,214,.32)",background:"rgba(246,244,248,.9)",color:"var(--text-normal)",cursor:"pointer",fontSize:13,fontWeight:650},children:"\u6C89\u6DC0\u6210\u679C"}),(0,C.jsx)("button",{onClick:()=>wn(vi==="group"?null:"group"),style:{width:30,height:28,padding:0,borderRadius:999,border:"1px solid rgba(204,195,214,.32)",background:vi==="group"?"rgba(124,58,237,.1)":"rgba(246,244,248,.9)",color:vi==="group"?"var(--interactive-accent)":"var(--text-normal)",cursor:"pointer",fontSize:18,lineHeight:1},children:"\u22EF"}),(0,C.jsx)("button",{onClick:q0,style:{height:28,padding:"0 12px",borderRadius:999,border:"1px solid rgba(204,195,214,.32)",background:"rgba(246,244,248,.9)",color:"#b42318",cursor:"pointer",fontSize:13,fontWeight:650},children:"\u89E3\u6563\u5206\u7EC4"})]}),vi==="group"&&(0,C.jsx)(I4,{availability:{frame_problem:!0,brainstorming:!0,mind_map:!0,decision_tree:!0,rise:!0,user_map:!0},visibleQuickActions:ph,onRunAction:g=>lh(g,gn),onCreateOutput:()=>G0(gn),onExport:()=>{wn(null),fl(!0)},showExportAction:!1})]})]}),(0,C.jsx)(XE,{zoom:L.scale,pointerMode:Et,selectedCount:hr,selectedEdge:I3,onZoomIn:()=>Ns(1.12),onZoomOut:()=>Ns(1/1.12),onReset:Ps,onFit:js,onDeleteSelected:Ku,selectedGroupCount:O3,onSetPointerMode:Q3,onCreateGroup:H3,onDissolveGroup:q0,onCreateOutput:()=>Qu(),onAddMaterial:()=>$u(!0),onCreateEdge:$3,onDeleteEdge:Zu,onEdgeTypeChange:U3}),D3&&(0,C.jsx)(KE,{kind:Cn,title:Uu,body:Hu,note:Ds,onKindChange:F0,onTitleChange:O0,onBodyChange:z0,onNoteChange:L0,onClose:()=>{$u(!1),Ju()},onSubmit:V3}),$n&&(0,C.jsx)(qE,{agentName:jE(a),phase:B3})]}),st&&B0&&(0,C.jsx)(d4,{targetBlock:st,blocks:s.blocks,edges:s.edges,providerKey:a,cwd:r,existingExportPaths:W3,onSave:Z3,onClose:()=>fl(!1)}),st&&!B0&&(0,C.jsx)(s4,{block:st,onUpdate:X3,onDelete:()=>K3(st),onClose:()=>d(null)})]})}var Pn=Le(yi()),W1=class extends N4.Component{constructor(e){super(e),this.state={error:null}}static getDerivedStateFromError(e){return{error:e}}componentDidCatch(e,n){console.error("[TraceMind] ExplorationCanvas render error:",e.message,e.stack,n.componentStack)}render(){return this.state.error?(0,Pn.jsxs)("div",{style:{padding:20,color:"var(--text-error)",background:"var(--background-primary)",height:"100%",overflow:"auto",fontFamily:"monospace",fontSize:13},children:[(0,Pn.jsx)("h2",{children:"TraceMind: Exploration Whiteboard Error"}),(0,Pn.jsx)("pre",{style:{whiteSpace:"pre-wrap",wordBreak:"break-word"},children:this.state.error.message}),(0,Pn.jsxs)("details",{children:[(0,Pn.jsx)("summary",{children:"Stack Trace"}),(0,Pn.jsx)("pre",{style:{whiteSpace:"pre-wrap",wordBreak:"break-word",fontSize:11},children:this.state.error.stack})]})]}):this.props.children}};function j4(t,e,n,i,a,r,s){let o=(0,P4.createRoot)(t);return o.render((0,Pn.jsx)(W1,{children:(0,Pn.jsx)(L4,{session:e,onSessionChange:n,onExportFile:i,onRetrieveMemory:a,providerKey:r,cwd:s})})),{root:o}}Hn();function JE(t){return[t.title,t.summary,t.detail,typeof t.data?.promptHint=="string"?t.data.promptHint:""].filter(Boolean).join(`
`)}function WE(t){let e=new Set,n=t.replace(/[^\p{Script=Han}\p{Letter}\p{Number}]+/gu," ");for(let i of n.split(/\s+/)){let a=i.trim();if(a)if(/^[\p{Script=Han}]+$/u.test(a))for(let r=0;r<a.length-1;r++)e.add(a.slice(r,Math.min(a.length,r+4)));else a.length>=3&&e.add(a.toLowerCase())}return[...e].filter(i=>i.length>=2).slice(0,80)}function $4(t,e){let n=t.toLowerCase();return e.reduce((i,a)=>i+(n.includes(a.toLowerCase())?1:0),0)}function U4(t,e,n=320){let i=t.replace(/\s+/g," ").trim();if(i.length<=n)return i;let a=i.toLowerCase(),r=e.map(o=>a.indexOf(o.toLowerCase())).filter(o=>o>=0).sort((o,l)=>o-l)[0]??0,s=Math.max(0,r-Math.floor(n/3));return`${s>0?"...":""}${i.slice(s,s+n)}${s+n<i.length?"...":""}`}function H4(t){return[t.name,...t.aliases||[],t.summary,t.subtype,...Object.values(t.metadata||{}).map(e=>String(e))].filter(Boolean).join(" ")}async function tw(t,e){let n=t.vault.getFileByPath(e);return n?t.vault.read(n):t.vault.adapter.read(e)}function ew(t){return t.extension==="md"&&t.path.startsWith("Daily/")}async function Y4(t,e){let n=[...e.sourceBlocks,...e.contextBlocks].map(JE).join(`

`),i=WE(n);if(i.length===0)return{items:[],contextText:""};let a=e.entityIndex.entries.map(c=>{let u=H4(c),d=n.includes(c.name)||c.aliases?.some(f=>f&&n.includes(f)),p=$4(u,i)+(d?8:0);return{entry:c,score:p,directNameHit:d}}).filter(c=>c.score>0).sort((c,u)=>u.score-c.score).slice(0,5),r=[];for(let c of a)try{let u=await tw(t,c.entry.filePath);r.push({id:c.entry.id,type:"entity",title:c.entry.name,path:c.entry.filePath,excerpt:U4(u,i),score:c.score,reason:c.directNameHit?"\u5B9E\u4F53\u540D\u79F0\u547D\u4E2D":"\u5B9E\u4F53\u7D22\u5F15\u5173\u952E\u8BCD\u547D\u4E2D"})}catch{r.push({id:c.entry.id,type:"entity",title:c.entry.name,path:c.entry.filePath,excerpt:c.entry.summary||H4(c.entry).slice(0,300),score:c.score,reason:c.directNameHit?"\u5B9E\u4F53\u540D\u79F0\u547D\u4E2D":"\u5B9E\u4F53\u7D22\u5F15\u5173\u952E\u8BCD\u547D\u4E2D"})}let s=[];for(let c of t.vault.getMarkdownFiles().filter(ew))try{let u=await t.vault.read(c),d=$4(`${c.basename}
${u}`,i);if(d<=0)continue;s.push({id:c.path,type:"diary",title:c.basename,path:c.path,excerpt:U4(u,i),score:d,reason:"\u65E5\u8BB0\u5173\u952E\u8BCD\u547D\u4E2D"})}catch{}let o=[...r,...s.sort((c,u)=>u.score-c.score).slice(0,5)].sort((c,u)=>u.score-c.score).slice(0,8),l=o.length>0?o.map((c,u)=>[`### \u76F8\u5173\u8BB0\u5FC6 ${u+1}: ${c.title}`,`type: ${c.type}`,`path: ${c.path}`,`reason: ${c.reason}`,c.excerpt].join(`
`)).join(`

---

`):"\u672A\u4ECE\u5B9E\u4F53\u7D22\u5F15\u6216 Daily \u65E5\u8BB0\u4E2D\u68C0\u7D22\u5230\u5F3A\u76F8\u5173\u8BB0\u5FC6\u3002";return{items:o,contextText:l}}var ar="tracemind-exploration-canvas",la=class extends V4.ItemView{plugin;session=null;reactRoot=null;constructor(e,n){super(e),this.plugin=n}getViewType(){return ar}getDisplayText(){return this.session?.title||"\u601D\u8003\u63A2\u7D22\u767D\u677F"}getIcon(){return"compass"}async onOpen(){this.app.workspace.rightSplit.collapse();let e=this.leaf.getViewState().state||{},n=typeof e.canvasPath=="string"?e.canvasPath:"";console.log("[TraceMind] ExplorationCanvasView.onOpen, canvasPath from state:",n),n&&await this.loadSession(n)}async loadSession(e){let n=await xd(this.app,e);return n?(console.log("[TraceMind] loadSession success, blocks:",n.blocks.length,"edges:",n.edges.length),n.canvasPath=e,this.session=n,this.renderReact(),n):(console.warn("[TraceMind] loadSession returned null for:",e),null)}renderReact(){this.reactRoot?.unmount(),this.containerEl.empty();let e=this.containerEl.createEl("div",{attr:{style:"width:100%;height:100%;"}}),n=this.plugin.settings,i=n.exploration.enabled&&n.exploration.defaultAgent||void 0,a=this.app.vault.adapter.basePath||void 0,r=async(o,l)=>{await Ne(this.app,o);let c=this.app.vault.getFileByPath(o);c?await this.app.vault.modify(c,l):await this.app.vault.create(o,l)},{root:s}=j4(e,this.session,o=>{this.session=o,yd(this.app,o).catch(console.error)},r,async(o,l)=>Y4(this.app,{sourceBlocks:o,contextBlocks:l,entityIndex:this.plugin.entityIndex}),i,a);this.reactRoot=s}async onClose(){this.reactRoot?.unmount(),this.reactRoot=null,this.session=null}};var Fe=require("obsidian");function nw(t){let e=[];t.source?.path&&e.push(`- \u6765\u6E90\u6587\u4EF6\uFF1A${t.source.path}`),t.source?.blockId&&e.push(`- \u6765\u6E90 block\uFF1A${t.source.blockId}`),t.source?.excerpt&&e.push(`- \u6765\u6E90\u6458\u8981\uFF1A${t.source.excerpt}`);let n=(t.materials||[]).map((i,a)=>{let r=i.label?`${i.label}\uFF1A`:"";return`${a+1}. [${i.kind}] ${r}${i.path}`});return["\u4F60\u662F TraceMind \u884C\u52A8\u770B\u677F\u8C03\u7528\u7684\u672C\u5730\u6267\u884C Agent\u3002","\u8BF7\u6839\u636E\u4EFB\u52A1\u8981\u6C42\u5B8C\u6210\u5B9E\u9645\u5904\u7406\uFF0C\u5E76\u76F4\u63A5\u8F93\u51FA\u53EF\u6C89\u6DC0\u4E3A Markdown \u6587\u6863\u7684\u7ED3\u679C\u3002","","\u8981\u6C42\uFF1A","- \u5982\u679C\u4EFB\u52A1\u6D89\u53CA\u7F51\u9875\u94FE\u63A5\u3001\u9644\u4EF6\u3001\u672C\u5730\u6587\u4EF6\u8DEF\u5F84\uFF0C\u8BF7\u4E3B\u52A8\u8BFB\u53D6\u548C\u89E3\u6790\u6750\u6599\uFF1B\u5982\u679C\u5931\u8D25\uFF0C\u8BF7\u8BF4\u660E\u5931\u8D25\u539F\u56E0\u548C\u672A\u5904\u7406\u6750\u6599\u3002","- \u8F93\u51FA\u8981\u7ED3\u6784\u6E05\u6670\u3001\u53EF\u6267\u884C\uFF0C\u4E0D\u8981\u53EA\u8BF4\u201C\u5DF2\u5B8C\u6210\u201D\u3002","- \u4E0D\u8981\u628A\u7ED3\u679C\u4FDD\u5B58\u5230\u6587\u4EF6\uFF0CTraceMind \u4F1A\u8D1F\u8D23\u5199\u5165 outputs \u76EE\u5F55\u3002","",`\u4EFB\u52A1\u6807\u9898\uFF1A${t.title}`,`\u4EFB\u52A1\u8BF4\u660E\uFF1A${t.description}`,t.executionPrompt?`
\u8865\u5145\u6267\u884C\u63D0\u793A\u8BCD\uFF1A
${t.executionPrompt}`:"",n.length>0?`
\u9644\u4EF6\u6750\u6599\uFF1A
${n.join(`
`)}`:"","","\u4EFB\u52A1\u6765\u6E90\uFF1A",e.length>0?e.join(`
`):"- \u624B\u52A8\u6216\u804A\u5929\u521B\u5EFA"].filter(Boolean).join(`
`)}async function G4(t,e,n,i=Ie,a){let r=nw(e),s=t.vault.adapter.basePath||process.cwd();return{...await i({providerKey:n,prompt:r,cwd:s,onMessage:a}),prompt:r}}function iw(t){return(t.trim().replace(/[\\/:*?"<>|#^[\]]+/g,"-").replace(/\s+/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"")||"task-output").slice(0,48)}function aw(){return new Date().toISOString().slice(0,10)}async function q4(t,e){let n=t.vault.adapter;if(typeof n.exists=="function")return n.exists(e);try{return await t.vault.adapter.stat(e),!0}catch{return!1}}async function X4(t,e,n){await q4(t,"outputs")||await t.vault.adapter.mkdir("outputs");let i=`outputs/${aw()}-${iw(e.title)}`,a=`${i}.md`,r=1;for(;await q4(t,a);)a=`${i}-${r}.md`,r++;let s=[`# ${e.title}`,"",`> \u6765\u6E90\uFF1A${e.source?.path||e.source?.title||e.source?.kind||"\u884C\u52A8\u770B\u677F"}`,`> \u751F\u6210\u65F6\u95F4\uFF1A${new Date().toISOString()}`,"",n.trim()||"\uFF08Agent \u672A\u8FD4\u56DE\u5185\u5BB9\uFF09",""].join(`
`);return await t.vault.adapter.write(a,s),a}var rl="tracemind-task-board",t0=[{status:"todo",title:"\u5F85\u5904\u7406",hint:"\u5DF2\u786E\u8BA4\uFF0C\u7B49\u5F85\u5904\u7406"},{status:"running",title:"\u6267\u884C\u4E2D",hint:"\u672C\u5730 Agent \u6216\u7528\u6237\u6B63\u5728\u63A8\u8FDB"},{status:"review",title:"\u5F85\u786E\u8BA4",hint:"\u6709\u7ED3\u679C\uFF0C\u7B49\u5F85\u9A8C\u6536"},{status:"done",title:"\u5DF2\u5B8C\u6210",hint:"\u5DF2\u9A8C\u6536\uFF0C\u53EF\u5F52\u6863"}],Ss=class extends Fe.ItemView{plugin;store;tasks=[];selectedTaskId=null;draggingTaskId=null;activeDetailPanel=null;constructor(e,n){super(e),this.plugin=n,this.store=n.getTaskStore()}getViewType(){return rl}getDisplayText(){return"\u884C\u52A8\u770B\u677F"}getIcon(){return"list-checks"}async onOpen(){this.app.workspace.rightSplit.collapse(),await this.refresh()}async refresh(){this.tasks=await this.store.listTasks(),this.render()}render(){this.containerEl.empty(),this.addStyles();let e=this.containerEl.createEl("div",{cls:"tracemind-task-board"}),n=e.createEl("div",{cls:"tracemind-task-board-header"}),i=n.createEl("div");i.createEl("div",{cls:"tracemind-task-board-eyebrow",text:"TraceMind"}),i.createEl("h1",{text:"\u884C\u52A8\u770B\u677F"}),i.createEl("p",{text:"\u628A\u65E5\u8BB0\u91CC\u7684\u60F3\u6CD5\u6574\u7406\u6210\u53EF\u6267\u884C\u4EFB\u52A1\uFF0C\u5FC5\u8981\u65F6\u4EA4\u7ED9\u672C\u5730 Agent \u7EE7\u7EED\u63A8\u8FDB\u3002"});let a=n.createEl("div",{cls:"tracemind-task-header-actions"}),r=this.tasks.filter(l=>l.status==="done").length;r>0&&a.createEl("button",{cls:"tracemind-task-secondary-btn",text:`\u5F52\u6863\u5DF2\u5B8C\u6210 ${r}`}).addEventListener("click",()=>this.archiveDoneTasks()),a.createEl("button",{cls:"tracemind-task-primary-btn",text:"\u65B0\u5EFA\u4EFB\u52A1"}).addEventListener("click",()=>this.createManualTask());let o=e.createEl("div",{cls:"tracemind-task-columns"});for(let l of t0)this.renderColumn(o,l)}renderColumn(e,n){let i=e.createEl("section",{cls:"tracemind-task-column",attr:{"data-status":n.status}}),a=i.createEl("div",{cls:"tracemind-task-column-header"});a.createEl("div",{cls:"tracemind-task-column-title",text:n.title});let r=this.tasks.filter(o=>o.status===n.status);a.createEl("span",{cls:"tracemind-task-count",text:String(r.length)}),i.createEl("div",{cls:"tracemind-task-column-hint",text:n.hint});let s=i.createEl("div",{cls:"tracemind-task-list",attr:{"data-status":n.status}});if(this.bindColumnDrop(s,n.status),r.length===0){s.createEl("div",{cls:"tracemind-task-empty",text:"\u6682\u65E0\u4EFB\u52A1"});return}for(let o of r)this.renderTaskCard(s,o)}renderTaskCard(e,n){let i=e.createEl("div",{cls:`tracemind-task-card${this.selectedTaskId===n.id?" is-selected":""}`,attr:{role:"button",tabindex:"0",draggable:"true","data-task-id":n.id}}),a=i.createEl("div",{cls:"tracemind-task-card-header"});a.createEl("div",{cls:"tracemind-task-card-title",text:n.title}),n.outputPath&&a.createEl("span",{cls:"tracemind-task-card-chip",text:"\u6210\u679C"}),i.createEl("div",{cls:"tracemind-task-card-desc",text:n.description||"\u6682\u65E0\u8BF4\u660E"}),i.createEl("div",{cls:"tracemind-task-card-footer"}).createEl("span",{cls:"tracemind-task-card-source",text:this.formatSource(n)}).setAttr("title",this.formatSource(n)),i.addEventListener("click",o=>{this.draggingTaskId||(o.stopPropagation(),this.selectedTaskId=n.id,this.renderDetail(n))}),i.addEventListener("keydown",o=>{o.key!=="Enter"&&o.key!==" "||(o.preventDefault(),this.selectedTaskId=n.id,this.renderDetail(n))}),i.addEventListener("dragstart",o=>{this.draggingTaskId=n.id,i.addClass("is-dragging"),o.dataTransfer?.setData("text/plain",n.id),o.dataTransfer&&(o.dataTransfer.effectAllowed="move")}),i.addEventListener("dragend",()=>{this.draggingTaskId=null,i.removeClass("is-dragging"),this.clearDragOver()})}bindColumnDrop(e,n){e.addEventListener("dragover",i=>{this.draggingTaskId&&(i.preventDefault(),i.dataTransfer&&(i.dataTransfer.dropEffect="move"),e.addClass("is-drag-over"))}),e.addEventListener("dragleave",i=>{let a=i.relatedTarget;(!a||!e.contains(a))&&e.removeClass("is-drag-over")}),e.addEventListener("drop",async i=>{i.preventDefault(),e.removeClass("is-drag-over");let a=i.dataTransfer?.getData("text/plain")||this.draggingTaskId;a&&await this.moveTaskToStatus(a,n)})}async moveTaskToStatus(e,n){let i=this.tasks.find(r=>r.id===e);if(!i||i.status===n){this.draggingTaskId=null;return}let a=t0.find(r=>r.status===n);await this.store.updateTask(e,{status:n}),this.selectedTaskId=e,this.draggingTaskId=null,new Fe.Notice(`\u4EFB\u52A1\u5DF2\u79FB\u52A8\u5230\uFF1A${a?.title||n}`),await this.refresh()}clearDragOver(){this.containerEl.querySelectorAll(".is-drag-over").forEach(e=>e.removeClass("is-drag-over"))}async archiveDoneTasks(){let e=this.tasks.filter(i=>i.status==="done");if(!(e.length===0||!window.confirm(`\u786E\u5B9A\u5F52\u6863 ${e.length} \u4E2A\u5DF2\u5B8C\u6210\u4EFB\u52A1\u5417\uFF1F\u5F52\u6863\u540E\u9ED8\u8BA4\u770B\u677F\u4E0D\u518D\u663E\u793A\u3002`))){for(let i of e)await this.store.updateTask(i.id,{status:"archived"});new Fe.Notice(`\u5DF2\u5F52\u6863 ${e.length} \u4E2A\u5B8C\u6210\u4EFB\u52A1`),this.selectedTaskId&&e.some(i=>i.id===this.selectedTaskId)&&(this.selectedTaskId=null,this.closeDetail()),await this.refresh()}}renderDetail(e){this.containerEl.querySelector(".tracemind-task-detail")?.remove(),this.containerEl.querySelector(".tracemind-task-detail-backdrop")?.remove();let i=this.containerEl.createEl("div",{cls:"tracemind-task-detail-backdrop"}),a=this.containerEl.createEl("aside",{cls:"tracemind-task-detail"});this.activeDetailPanel=a,i.addEventListener("click",()=>this.closeDetail()),a.createEl("button",{cls:"tracemind-task-detail-close",text:"\u5173\u95ED"}).addEventListener("click",()=>this.closeDetail()),a.createEl("div",{cls:"tracemind-task-detail-kicker",text:"\u4EFB\u52A1\u8BE6\u60C5"}),a.createEl("h2",{text:e.title}),a.createEl("p",{cls:"tracemind-task-detail-desc",text:e.description||"\u6682\u65E0\u8BF4\u660E"});let s=a.createEl("div",{cls:"tracemind-task-detail-field"});s.createEl("span",{text:"\u6765\u6E90"}),s.createEl("strong",{text:this.formatSource(e)});let o=a.createEl("div",{cls:"tracemind-task-status-row"});for(let l of t0)o.createEl("button",{text:l.title,cls:e.status===l.status?"is-active":""}).addEventListener("click",async()=>{await this.store.updateTask(e.id,{status:l.status}),new Fe.Notice(`\u4EFB\u52A1\u5DF2\u79FB\u52A8\u5230\uFF1A${l.title}`),await this.refresh()});if(e.outputPath&&a.createEl("button",{cls:"tracemind-task-output-link",text:`\u6253\u5F00\u6210\u679C\uFF1A${e.outputPath}`}).addEventListener("click",async()=>{let c=this.app.vault.getFileByPath(e.outputPath);c&&await this.app.workspace.getLeaf("tab").openFile(c)}),e.status==="review"){let l=a.createEl("div",{cls:"tracemind-task-review-box"});l.createEl("div",{cls:"tracemind-task-agent-title",text:"\u9A8C\u6536\u7ED3\u679C"}),l.createEl("p",{text:"Agent \u5DF2\u8FD4\u56DE\u7ED3\u679C\u3002\u786E\u8BA4\u65E0\u8BEF\u540E\u53EF\u5B8C\u6210\u4EFB\u52A1\uFF1B\u5982\u679C\u7ED3\u679C\u4E0D\u6EE1\u610F\uFF0C\u53EF\u4EE5\u7528\u4E0A\u6B21\u7684 Agent \u91CD\u65B0\u6267\u884C\u3002"});let c=l.createEl("div",{cls:"tracemind-task-review-actions"});c.createEl("button",{cls:"tracemind-task-confirm-done-btn",text:"\u786E\u8BA4\u5B8C\u6210"}).addEventListener("click",async()=>{await this.store.updateTask(e.id,{status:"done"}),await this.appendProgress(e.id,"system","\u7528\u6237\u5DF2\u786E\u8BA4\u4EFB\u52A1\u5B8C\u6210\u3002"),new Fe.Notice("\u4EFB\u52A1\u5DF2\u786E\u8BA4\u5B8C\u6210"),await this.refresh()});let d=c.createEl("button",{cls:"tracemind-task-rerun-btn",text:"\u91CD\u65B0\u6267\u884C"});d.addEventListener("click",async()=>{let p=e.agent?.providerKey;if(!p){new Fe.Notice("\u8BE5\u4EFB\u52A1\u6CA1\u6709\u4E0A\u6B21\u6267\u884C\u7684 Agent\uFF0C\u8BF7\u5728\u4E0B\u65B9\u9009\u62E9 Agent \u540E\u6267\u884C\u3002");return}await this.executeTask(e,p,d)})}if(e.status==="done"){let l=a.createEl("div",{cls:"tracemind-task-archive-box"});l.createEl("div",{cls:"tracemind-task-agent-title",text:"\u5B8C\u6210\u4EFB\u52A1\u6574\u7406"}),l.createEl("p",{text:"\u5F52\u6863\u540E\u4EFB\u52A1\u4F1A\u4ECE\u9ED8\u8BA4\u770B\u677F\u4E2D\u9690\u85CF\uFF0C\u4EFB\u52A1\u6570\u636E\u4ECD\u4FDD\u7559\u5728 TraceMind/tasks/tasks.json\u3002"}),l.createEl("button",{cls:"tracemind-task-archive-btn",text:"\u5F52\u6863\u4EFB\u52A1"}).addEventListener("click",async()=>{await this.store.updateTask(e.id,{status:"archived"}),await this.appendProgress(e.id,"system","\u4EFB\u52A1\u5DF2\u5F52\u6863\u3002"),new Fe.Notice("\u4EFB\u52A1\u5DF2\u5F52\u6863"),this.closeDetail(),await this.refresh()})}this.renderAgentExecution(a,e),this.renderProgressPanel(a,e)}closeDetail(){this.containerEl.querySelector(".tracemind-task-detail")?.remove(),this.containerEl.querySelector(".tracemind-task-detail-backdrop")?.remove(),this.activeDetailPanel=null}renderAgentExecution(e,n){let i=e.createEl("div",{cls:"tracemind-task-agent-box"});i.createEl("div",{cls:"tracemind-task-agent-title",text:"\u672C\u5730 Agent \u6267\u884C"}),i.createEl("label",{cls:"tracemind-task-form-label",text:"\u8865\u5145\u63D0\u793A\u8BCD"});let a=i.createEl("textarea",{cls:"tracemind-task-textarea",text:n.executionPrompt||"",attr:{placeholder:"\u4F8B\u5982\uFF1A\u91CD\u70B9\u5206\u6790\u98CE\u9669\uFF0C\u8F93\u51FA\u65F6\u6309\u201C\u7ED3\u8BBA / \u4F9D\u636E / \u4E0B\u4E00\u6B65\u201D\u7ED3\u6784\u7EC4\u7EC7\u3002"}});a.addEventListener("change",async()=>{await this.store.updateTask(n.id,{executionPrompt:a.value.trim()}),await this.reloadDetail(n.id)}),this.renderMaterialsEditor(i,n);let r=this.getAvailableAgents();if(r.length===0){i.createEl("p",{text:"\u8BF7\u5148\u5728\u8BBE\u7F6E\u4E2D\u68C0\u6D4B\u5E76\u914D\u7F6E\u672C\u5730 Agent\u3002"});return}let s=i.createEl("div",{cls:"tracemind-task-agent-row"}),o=s.createEl("select"),l=n.agent?.providerKey||this.plugin.settings.actionBoard?.defaultAgent||this.plugin.settings.exploration.defaultAgent||r[0];for(let u of r)o.createEl("option",{value:u,text:this.agentLabel(u)});o.value=r.includes(l)?l:r[0];let c=s.createEl("button",{text:n.status==="running"?"\u6267\u884C\u4E2D...":"\u6267\u884C\u4EFB\u52A1"});n.status==="running"&&c.setAttr("disabled","true"),c.addEventListener("click",()=>this.executeTask(n,o.value,c))}renderMaterialsEditor(e,n){let i=e.createEl("div",{cls:"tracemind-task-materials"});i.createEl("div",{cls:"tracemind-task-agent-title",text:"\u9644\u4EF6\u6750\u6599"});let a=i.createEl("div",{cls:"tracemind-task-material-list"}),r=n.materials||[];if(r.length===0)a.createEl("div",{cls:"tracemind-task-muted",text:"\u6682\u65E0\u6750\u6599\u3002\u53EF\u6DFB\u52A0 vault \u76F8\u5BF9\u8DEF\u5F84\u3001\u672C\u5730\u6587\u4EF6\u8DEF\u5F84\u6216\u7F51\u9875\u94FE\u63A5\u3002"});else for(let c of r){let u=a.createEl("div",{cls:"tracemind-task-material-item"});u.createEl("span",{text:`${c.label||c.kind}: ${c.path}`}),u.createEl("button",{text:"\u5220\u9664"}).addEventListener("click",async()=>{await this.store.updateTask(n.id,{materials:r.filter(p=>p.id!==c.id)}),await this.reloadDetail(n.id)})}let s=i.createEl("div",{cls:"tracemind-task-material-add"}),o=s.createEl("input",{type:"text",attr:{placeholder:"\u7C98\u8D34\u94FE\u63A5\u3001vault \u76F8\u5BF9\u8DEF\u5F84\u6216\u672C\u5730\u6587\u4EF6\u8DEF\u5F84"}});s.createEl("button",{text:"\u6DFB\u52A0"}).addEventListener("click",async()=>{let c=o.value.trim();if(!c)return;let u={id:`mat-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,path:c,kind:this.inferMaterialKind(c)};await this.store.updateTask(n.id,{materials:[...r,u]}),await this.reloadDetail(n.id)})}inferMaterialKind(e){return/^https?:\/\//i.test(e)?"web_url":/^\[\[.+\]\]$/.test(e)?"obsidian_link":e.startsWith("/")||/^[A-Za-z]:[\\/]/.test(e)?"local_path":"vault_path"}renderProgressPanel(e,n){let i=e.createEl("div",{cls:"tracemind-task-progress-box"});i.createEl("div",{cls:"tracemind-task-agent-title",text:"\u4EFB\u52A1\u8FDB\u5C55"});let a=n.progress||[],r=i.createEl("div",{cls:"tracemind-task-progress-list"});if(a.length===0)r.createEl("div",{cls:"tracemind-task-muted",text:"\u6682\u65E0\u8FDB\u5C55\u3002\u53EF\u4EE5\u624B\u5DE5\u8BB0\u5F55\uFF0C\u4E5F\u4F1A\u663E\u793A\u672C\u5730 Agent \u6267\u884C\u8FDB\u5C55\u3002"});else for(let u of a.slice().reverse()){let d=r.createEl("div",{cls:`tracemind-task-progress-entry ${u.author}`}),p=d.createEl("div",{cls:"tracemind-task-progress-meta"});p.createEl("span",{text:this.progressAuthorLabel(u.author)}),p.createEl("span",{text:this.formatProgressTime(u.timestamp)}),d.createEl("div",{cls:"tracemind-task-progress-content",text:u.content})}let s=i.createEl("textarea",{cls:"tracemind-task-textarea",attr:{placeholder:"\u624B\u5DE5\u8BB0\u5F55\u5F53\u524D\u8FDB\u5C55\u3001\u963B\u585E\u70B9\u6216\u4E0B\u4E00\u6B65..."}}),o=i.createEl("div",{cls:"tracemind-task-progress-actions"});o.createEl("button",{cls:"tracemind-task-progress-add",text:"\u8BB0\u5F55\u8FDB\u5C55"}).addEventListener("click",async()=>{let u=s.value.trim();u&&(await this.appendProgress(n.id,"user",u),await this.reloadDetail(n.id))}),o.createEl("button",{cls:"tracemind-task-delete-btn",text:"\u5220\u9664\u4EFB\u52A1"}).addEventListener("click",async()=>{window.confirm(`\u786E\u5B9A\u5220\u9664\u4EFB\u52A1\u201C${n.title}\u201D\u5417\uFF1F\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\u3002`)&&(await this.store.deleteTask(n.id),new Fe.Notice("\u4EFB\u52A1\u5DF2\u5220\u9664"),this.selectedTaskId=null,this.closeDetail(),await this.refresh())})}progressAuthorLabel(e){return e==="agent"?"Agent":e==="system"?"\u7CFB\u7EDF":"\u624B\u5DE5"}formatProgressTime(e){let n=new Date(e);return Number.isNaN(n.getTime())?e:`${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")} ${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")}`}async appendProgress(e,n,i){let a=await this.store.getTask(e);if(!a)return null;let r={id:`progress-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,timestamp:new Date().toISOString(),author:n,content:i};return this.store.updateTask(e,{progress:[...a.progress||[],r]})}async reloadDetail(e){this.tasks=await this.store.listTasks();let n=this.tasks.find(i=>i.id===e);n&&this.renderDetail(n)}async executeTask(e,n,i){i.setText("\u6267\u884C\u4E2D..."),i.setAttr("disabled","true");let a=await this.store.updateTask(e.id,{status:"running",agent:{providerKey:n}});await this.appendProgress(e.id,"system",`${this.agentLabel(n)} \u5F00\u59CB\u6267\u884C\u4EFB\u52A1\u3002`),await this.refresh();try{let r=await G4(this.app,a,n);if(await this.store.saveRun(a.id,{id:r.runId,taskId:a.id,providerKey:n,status:r.status,prompt:r.prompt,output:r.output,error:r.error,startedAt:new Date(Date.now()-r.durationMs).toISOString(),finishedAt:new Date().toISOString(),durationMs:r.durationMs}),r.status==="completed"){let s=await X4(this.app,a,r.output);a=await this.store.updateTask(a.id,{status:"review",outputPath:s}),await this.appendProgress(a.id,"system",`\u6267\u884C\u5B8C\u6210\uFF0C\u6210\u679C\u5DF2\u4FDD\u5B58\u5230 ${s}`),new Fe.Notice(`\u4EFB\u52A1\u6267\u884C\u5B8C\u6210\uFF0C\u6210\u679C\u5DF2\u4FDD\u5B58\uFF1A${s}`)}else a=await this.store.updateTask(a.id,{status:"todo"}),await this.appendProgress(a.id,"system",`\u6267\u884C\u5931\u8D25\uFF1A${r.error||r.status}`),new Fe.Notice("\u4EFB\u52A1\u6267\u884C\u5931\u8D25\uFF1A"+(r.error||r.status));this.selectedTaskId=a.id,await this.refresh()}catch(r){await this.store.updateTask(e.id,{status:"todo"}),await this.appendProgress(e.id,"system",`\u6267\u884C\u5931\u8D25\uFF1A${r.message}`),new Fe.Notice("\u4EFB\u52A1\u6267\u884C\u5931\u8D25\uFF1A"+r.message),await this.refresh()}}getAvailableAgents(){let e=this.plugin.settings,n=new Set;e.actionBoard?.defaultAgent&&n.add(e.actionBoard.defaultAgent),e.exploration.defaultAgent&&n.add(e.exploration.defaultAgent);for(let i of e.exploration.availableAgents||[])n.add(i);return Array.from(n)}agentLabel(e){return{codex:"Codex","claude-code":"Claude Code",hermes:"Hermes",opencode:"OpenCode",pi:"Pi Agent"}[e]||e}async createManualTask(){let e=await this.store.createTask({title:"\u65B0\u4EFB\u52A1",description:"\u4ECE\u884C\u52A8\u770B\u677F\u624B\u52A8\u521B\u5EFA\uFF0C\u8BF7\u5728\u540E\u7EED\u7248\u672C\u4E2D\u7F16\u8F91\u5B8C\u5584\u3002",source:{kind:"manual"}});new Fe.Notice("\u5DF2\u521B\u5EFA\u4EFB\u52A1"),this.selectedTaskId=e.id,await this.refresh()}formatSource(e){return e.source?e.source.kind==="diary"?e.source.path||"\u65E5\u8BB0":e.source.kind==="chat"?"AI \u5BF9\u8BDD":e.source.kind==="exploration"?e.source.path||"\u601D\u8003\u63A2\u7D22":e.source.kind==="entity"?e.source.path||"\u5B9E\u4F53\u6863\u6848":e.source.title||"\u624B\u52A8\u521B\u5EFA":"\u624B\u52A8\u521B\u5EFA"}addStyles(){document.getElementById("tracemind-task-board-styles")?.remove();let e=document.createElement("style");e.id="tracemind-task-board-styles",e.textContent=`
      .tracemind-task-board {
        height: 100%;
        display: flex;
        flex-direction: column;
        gap: 18px;
        padding: 24px;
        background: var(--background-primary);
        color: var(--text-normal);
        overflow: hidden;
      }
      .tracemind-task-board-header {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: flex-start;
      }
      .tracemind-task-header-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 0 0 auto;
      }
      .tracemind-task-board-eyebrow {
        color: var(--text-accent);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0;
      }
      .tracemind-task-board h1 {
        margin: 2px 0 4px;
        font-size: 24px;
        line-height: 1.2;
      }
      .tracemind-task-board p {
        margin: 0;
        color: var(--text-muted);
        font-size: 13px;
      }
      .tracemind-task-primary-btn {
        border: 1px solid transparent;
        border-radius: 999px;
        background: var(--interactive-accent);
        color: var(--text-on-accent);
        padding: 8px 14px;
        font-weight: 700;
        cursor: pointer;
      }
      .tracemind-task-secondary-btn {
        border: 1px solid var(--background-modifier-border);
        border-radius: 999px;
        background: var(--background-secondary);
        color: var(--text-muted);
        padding: 8px 12px;
        font-weight: 700;
        cursor: pointer;
      }
      .tracemind-task-secondary-btn:hover {
        border-color: var(--interactive-accent);
        color: var(--text-accent);
      }
      .tracemind-task-columns {
        flex: 1;
        display: grid;
        grid-template-columns: repeat(4, minmax(240px, 1fr));
        gap: 12px;
        min-height: 0;
        overflow-x: auto;
      }
      .tracemind-task-column {
        min-width: 220px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        border: 1px solid var(--background-modifier-border);
        border-radius: 12px;
        background: var(--background-secondary);
        padding: 12px;
        min-height: 0;
      }
      .tracemind-task-column-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .tracemind-task-column-title {
        font-size: 14px;
        font-weight: 800;
      }
      .tracemind-task-count {
        min-width: 22px;
        height: 22px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        background: var(--background-primary);
        color: var(--text-muted);
        font-size: 12px;
      }
      .tracemind-task-column-hint {
        color: var(--text-faint);
        font-size: 12px;
      }
      .tracemind-task-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        overflow-y: auto;
        min-height: 0;
        flex: 1;
        padding: 2px;
        border-radius: 10px;
        transition: background 0.14s ease, outline-color 0.14s ease;
        outline: 1px solid transparent;
        outline-offset: -1px;
      }
      .tracemind-task-list.is-drag-over {
        background: color-mix(in srgb, var(--interactive-accent) 9%, transparent);
        outline-color: color-mix(in srgb, var(--interactive-accent) 36%, transparent);
      }
      .tracemind-task-empty {
        padding: 18px 8px;
        text-align: center;
        color: var(--text-faint);
        border: 1px dashed var(--background-modifier-border);
        border-radius: 10px;
        font-size: 12px;
      }
      .tracemind-task-card {
        width: 100%;
        text-align: left;
        border: 1px solid var(--background-modifier-border);
        border-radius: 10px;
        background: var(--background-primary);
        color: var(--text-normal);
        padding: 12px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 9px;
        min-height: 126px;
        box-shadow: 0 1px 0 rgba(0,0,0,0.02);
        transition: border-color 0.14s ease, box-shadow 0.14s ease, transform 0.14s ease, opacity 0.14s ease;
      }
      .tracemind-task-card:hover,
      .tracemind-task-card.is-selected {
        border-color: var(--interactive-accent);
        box-shadow: 0 10px 24px -20px rgba(0,0,0,0.35);
      }
      .tracemind-task-card:hover {
        transform: translateY(-1px);
      }
      .tracemind-task-card.is-dragging {
        opacity: 0.55;
        transform: rotate(0.5deg) scale(0.99);
      }
      .tracemind-task-card-header {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 8px;
        align-items: start;
      }
      .tracemind-task-card-title {
        min-width: 0;
        font-size: 14px;
        font-weight: 800;
        line-height: 1.38;
        color: var(--text-normal);
        word-break: break-word;
      }
      .tracemind-task-card-chip {
        height: 20px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        padding: 0 7px;
        background: color-mix(in srgb, var(--interactive-accent) 12%, var(--background-secondary));
        color: var(--text-accent);
        font-size: 11px;
        font-weight: 750;
        white-space: nowrap;
      }
      .tracemind-task-card-desc {
        color: var(--text-muted);
        font-size: 12px;
        line-height: 1.52;
        display: -webkit-box;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
        overflow: hidden;
        flex: 1;
      }
      .tracemind-task-card-footer {
        margin-top: auto;
        display: flex;
        align-items: center;
        min-width: 0;
      }
      .tracemind-task-card-source {
        max-width: 100%;
        display: inline-flex;
        align-items: center;
        min-width: 0;
        height: 22px;
        border-radius: 999px;
        padding: 0 8px;
        background: var(--background-secondary);
        color: var(--text-faint);
        font-size: 11px;
        font-weight: 650;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .tracemind-task-card-source::before {
        content: '';
        width: 5px;
        height: 5px;
        border-radius: 999px;
        margin-right: 6px;
        background: var(--text-accent);
        flex: 0 0 auto;
      }
      .tracemind-task-detail {
        position: absolute;
        top: 0;
        right: 0;
        width: min(420px, 42vw);
        height: 100%;
        padding: 22px;
        border-left: 1px solid var(--background-modifier-border);
        background: var(--background-primary);
        box-shadow: -16px 0 40px -28px rgba(0,0,0,0.45);
        overflow-y: auto;
        z-index: 12;
      }
      .tracemind-task-detail-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.04);
        z-index: 11;
      }
      .tracemind-task-detail-close {
        float: right;
        border: 1px solid var(--background-modifier-border);
        border-radius: 999px;
        background: var(--background-secondary);
        color: var(--text-muted);
        padding: 5px 10px;
        cursor: pointer;
      }
      .tracemind-task-detail-kicker {
        color: var(--text-accent);
        font-size: 12px;
        font-weight: 800;
      }
      .tracemind-task-detail h2 {
        margin: 6px 0 10px;
        font-size: 20px;
        line-height: 1.3;
      }
      .tracemind-task-detail-desc {
        color: var(--text-normal) !important;
        line-height: 1.6;
      }
      .tracemind-task-delete-btn {
        border: 1px solid color-mix(in srgb, #ef4444 36%, var(--background-modifier-border));
        border-radius: 999px;
        background: color-mix(in srgb, #ef4444 8%, var(--background-primary));
        color: #ef4444;
        padding: 6px 10px;
        font-size: 12px;
        font-weight: 750;
        cursor: pointer;
      }
      .tracemind-task-delete-btn:hover {
        background: #ef4444;
        color: white;
      }
      .tracemind-task-detail-field {
        margin-top: 16px;
        display: flex;
        justify-content: space-between;
        gap: 12px;
        color: var(--text-muted);
        font-size: 13px;
      }
      .tracemind-task-status-row {
        margin-top: 18px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .tracemind-task-status-row button,
      .tracemind-task-output-link {
        border: 1px solid var(--background-modifier-border);
        border-radius: 999px;
        background: var(--background-secondary);
        color: var(--text-normal);
        padding: 7px 10px;
        cursor: pointer;
      }
      .tracemind-task-status-row button.is-active {
        border-color: transparent;
        background: var(--interactive-accent);
        color: var(--text-on-accent);
      }
      .tracemind-task-output-link {
        margin-top: 18px;
        width: 100%;
        text-align: left;
        border-radius: 10px;
      }
      .tracemind-task-agent-box {
        margin-top: 20px;
        padding: 14px;
        border: 1px solid var(--background-modifier-border);
        border-radius: 12px;
        background: var(--background-secondary);
      }
      .tracemind-task-review-box {
        margin-top: 18px;
        padding: 14px;
        border: 1px solid color-mix(in srgb, var(--interactive-accent) 28%, var(--background-modifier-border));
        border-radius: 12px;
        background: color-mix(in srgb, var(--interactive-accent) 7%, var(--background-secondary));
      }
      .tracemind-task-archive-box {
        margin-top: 18px;
        padding: 14px;
        border: 1px solid var(--background-modifier-border);
        border-radius: 12px;
        background: var(--background-secondary);
      }
      .tracemind-task-archive-box p {
        margin: 0 0 12px;
        color: var(--text-muted);
        font-size: 12px;
        line-height: 1.55;
      }
      .tracemind-task-review-box p {
        margin: 0 0 12px;
        color: var(--text-muted);
        font-size: 12px;
        line-height: 1.55;
      }
      .tracemind-task-review-actions {
        display: flex;
        gap: 8px;
        align-items: center;
        flex-wrap: wrap;
      }
      .tracemind-task-confirm-done-btn {
        border: 1px solid transparent;
        border-radius: 999px;
        background: var(--interactive-accent);
        color: var(--text-on-accent);
        padding: 7px 12px;
        font-size: 12px;
        font-weight: 750;
        cursor: pointer;
      }
      .tracemind-task-rerun-btn {
        border: 1px solid var(--background-modifier-border);
        border-radius: 999px;
        background: var(--background-primary);
        color: var(--text-normal);
        padding: 7px 12px;
        font-size: 12px;
        font-weight: 750;
        cursor: pointer;
      }
      .tracemind-task-rerun-btn:hover {
        border-color: var(--interactive-accent);
        color: var(--text-accent);
      }
      .tracemind-task-archive-btn {
        border: 1px solid var(--background-modifier-border);
        border-radius: 999px;
        background: var(--background-primary);
        color: var(--text-normal);
        padding: 7px 12px;
        font-size: 12px;
        font-weight: 750;
        cursor: pointer;
      }
      .tracemind-task-archive-btn:hover {
        border-color: var(--interactive-accent);
        color: var(--text-accent);
      }
      .tracemind-task-agent-title {
        font-size: 13px;
        font-weight: 800;
        margin-bottom: 10px;
      }
      .tracemind-task-form-label {
        display: block;
        margin: 12px 0 6px;
        color: var(--text-muted);
        font-size: 12px;
        font-weight: 750;
      }
      .tracemind-task-textarea {
        width: 100%;
        min-height: 74px;
        resize: vertical;
        border: 1px solid var(--background-modifier-border);
        border-radius: 10px;
        background: var(--background-primary);
        color: var(--text-normal);
        padding: 9px 10px;
        font-size: 12px;
        line-height: 1.55;
      }
      .tracemind-task-agent-box p {
        font-size: 12px;
        color: var(--text-muted);
      }
      .tracemind-task-agent-row {
        display: flex;
        gap: 8px;
        margin-top: 18px;
        padding-top: 14px;
        border-top: 1px solid var(--background-modifier-border);
      }
      .tracemind-task-agent-row select {
        flex: 1;
      }
      .tracemind-task-agent-row button {
        border: 1px solid transparent;
        border-radius: 999px;
        background: var(--interactive-accent);
        color: var(--text-on-accent);
        padding: 7px 12px;
        font-weight: 700;
        cursor: pointer;
      }
      .tracemind-task-agent-row button:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }
      .tracemind-task-materials,
      .tracemind-task-progress-box {
        margin-top: 16px;
        padding: 14px;
        border: 1px solid var(--background-modifier-border);
        border-radius: 12px;
        background: var(--background-secondary);
      }
      .tracemind-task-material-list,
      .tracemind-task-progress-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 10px;
      }
      .tracemind-task-muted {
        color: var(--text-faint);
        font-size: 12px;
        line-height: 1.5;
      }
      .tracemind-task-material-item {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        align-items: center;
        padding: 8px 9px;
        border-radius: 9px;
        background: var(--background-primary);
        color: var(--text-muted);
        font-size: 12px;
      }
      .tracemind-task-material-item span {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .tracemind-task-material-item button,
      .tracemind-task-material-add button,
      .tracemind-task-progress-add {
        border: 1px solid var(--background-modifier-border);
        border-radius: 999px;
        background: var(--background-primary);
        color: var(--text-normal);
        padding: 6px 10px;
        font-size: 12px;
        font-weight: 650;
        cursor: pointer;
      }
      .tracemind-task-material-add {
        display: flex;
        gap: 8px;
      }
      .tracemind-task-material-add input {
        flex: 1;
        min-width: 0;
        border: 1px solid var(--background-modifier-border);
        border-radius: 999px;
        background: var(--background-primary);
        color: var(--text-normal);
        padding: 7px 10px;
        font-size: 12px;
      }
      .tracemind-task-progress-entry {
        padding: 9px 10px;
        border-radius: 10px;
        background: var(--background-primary);
        border-left: 3px solid var(--background-modifier-border);
      }
      .tracemind-task-progress-entry.agent {
        border-left-color: var(--interactive-accent);
      }
      .tracemind-task-progress-entry.system {
        border-left-color: var(--text-accent);
      }
      .tracemind-task-progress-meta {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        color: var(--text-faint);
        font-size: 11px;
        font-weight: 700;
        margin-bottom: 5px;
      }
      .tracemind-task-progress-content {
        color: var(--text-normal);
        font-size: 12px;
        line-height: 1.55;
        white-space: pre-wrap;
        word-break: break-word;
      }
      .tracemind-task-progress-actions {
        margin-top: 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }
      .tracemind-task-progress-add {
        background: var(--interactive-accent);
        border-color: transparent;
        color: var(--text-on-accent);
      }
    `,document.head.appendChild(e)}};Ml();Hn();var W4="TraceMind/tasks",K4="TraceMind/tasks/runs",Tu=`${W4}/tasks.json`;function Z4(){return new Date().toISOString()}function rw(){return`task-${Date.now()}-${Math.random().toString(36).slice(2,8)}`}function Q4(t){return JSON.stringify({version:1,tasks:t},null,2)}function J4(t){return t==="inbox"?"todo":t==="todo"||t==="running"||t==="review"||t==="done"||t==="archived"?t:"todo"}var Mu=class{constructor(e){this.app=e}app;async initialize(){await this.ensureFolder(W4),await this.ensureFolder(K4),await this.exists(Tu)||await this.writeFile(Tu,Q4([]))}async listTasks(){return await this.initialize(),this.readTasks()}async getTask(e){return(await this.listTasks()).find(i=>i.id===e)??null}async createTask(e){let n=await this.listTasks(),i=Z4(),a={id:rw(),title:e.title.trim(),description:e.description.trim(),status:J4(e.status),source:e.source,agent:e.agent,createdAt:i,updatedAt:i};return n.unshift(a),await this.writeTasks(n),a}async updateTask(e,n){let i=await this.listTasks(),a=i.findIndex(s=>s.id===e);if(a<0)throw new Error(`Task not found: ${e}`);let r={...i[a],...n,updatedAt:Z4()};return r.status==="done"&&!r.completedAt&&(r.completedAt=r.updatedAt),r.status!=="done"&&r.completedAt&&n.status&&delete r.completedAt,i[a]=r,await this.writeTasks(i),r}async deleteTask(e){let n=await this.listTasks(),i=n.filter(a=>a.id!==e);if(i.length===n.length)throw new Error(`Task not found: ${e}`);await this.writeTasks(i)}async saveRun(e,n){await this.initialize(),await this.writeFile(`${K4}/${e}-${n.id}.json`,JSON.stringify(n,null,2))}async readTasks(){try{let e=await this.readFile(Tu),n=JSON.parse(e);return Array.isArray(n.tasks)?n.tasks.map(i=>({...i,status:J4(i.status)})):[]}catch{return[]}}async writeTasks(e){await this.writeFile(Tu,Q4(e))}async ensureFolder(e){await this.exists(e)||await this.app.vault.adapter.mkdir(e)}async exists(e){let n=this.app.vault.adapter;if(typeof n.exists=="function")return n.exists(e);try{return await this.app.vault.adapter.stat(e),!0}catch{return!1}}readFile(e){return this.app.vault.adapter.read(e)}writeFile(e,n){return this.app.vault.adapter.write(e,n)}};function gx(t){return typeof t>"u"||t===null}function sw(t){return typeof t=="object"&&t!==null}function ow(t){return Array.isArray(t)?t:gx(t)?[]:[t]}function lw(t,e){var n,i,a,r;if(e)for(r=Object.keys(e),n=0,i=r.length;n<i;n+=1)a=r[n],t[a]=e[a];return t}function cw(t,e){var n="",i;for(i=0;i<e;i+=1)n+=t;return n}function uw(t){return t===0&&Number.NEGATIVE_INFINITY===1/t}var dw=gx,pw=sw,fw=ow,hw=cw,gw=uw,mw=lw,Kt={isNothing:dw,isObject:pw,toArray:fw,repeat:hw,isNegativeZero:gw,extend:mw};function mx(t,e){var n="",i=t.reason||"(unknown reason)";return t.mark?(t.mark.name&&(n+='in "'+t.mark.name+'" '),n+="("+(t.mark.line+1)+":"+(t.mark.column+1)+")",!e&&t.mark.snippet&&(n+=`

`+t.mark.snippet),i+" "+n):i}function ol(t,e){Error.call(this),this.name="YAMLException",this.reason=t,this.mark=e,this.message=mx(this,!1),Error.captureStackTrace?Error.captureStackTrace(this,this.constructor):this.stack=new Error().stack||""}ol.prototype=Object.create(Error.prototype);ol.prototype.constructor=ol;ol.prototype.toString=function(e){return this.name+": "+mx(this,e)};var be=ol;function e0(t,e,n,i,a){var r="",s="",o=Math.floor(a/2)-1;return i-e>o&&(r=" ... ",e=i-o+r.length),n-i>o&&(s=" ...",n=i+o-s.length),{str:r+t.slice(e,n).replace(/\t/g,"\u2192")+s,pos:i-e+r.length}}function n0(t,e){return Kt.repeat(" ",e-t.length)+t}function yw(t,e){if(e=Object.create(e||null),!t.buffer)return null;e.maxLength||(e.maxLength=79),typeof e.indent!="number"&&(e.indent=1),typeof e.linesBefore!="number"&&(e.linesBefore=3),typeof e.linesAfter!="number"&&(e.linesAfter=2);for(var n=/\r?\n|\r|\0/g,i=[0],a=[],r,s=-1;r=n.exec(t.buffer);)a.push(r.index),i.push(r.index+r[0].length),t.position<=r.index&&s<0&&(s=i.length-2);s<0&&(s=i.length-1);var o="",l,c,u=Math.min(t.line+e.linesAfter,a.length).toString().length,d=e.maxLength-(e.indent+u+3);for(l=1;l<=e.linesBefore&&!(s-l<0);l++)c=e0(t.buffer,i[s-l],a[s-l],t.position-(i[s]-i[s-l]),d),o=Kt.repeat(" ",e.indent)+n0((t.line-l+1).toString(),u)+" | "+c.str+`
`+o;for(c=e0(t.buffer,i[s],a[s],t.position,d),o+=Kt.repeat(" ",e.indent)+n0((t.line+1).toString(),u)+" | "+c.str+`
`,o+=Kt.repeat("-",e.indent+u+3+c.pos)+`^
`,l=1;l<=e.linesAfter&&!(s+l>=a.length);l++)c=e0(t.buffer,i[s+l],a[s+l],t.position-(i[s]-i[s+l]),d),o+=Kt.repeat(" ",e.indent)+n0((t.line+l+1).toString(),u)+" | "+c.str+`
`;return o.replace(/\n$/,"")}var xw=yw,vw=["kind","multi","resolve","construct","instanceOf","predicate","represent","representName","defaultStyle","styleAliases"],bw=["scalar","sequence","mapping"];function kw(t){var e={};return t!==null&&Object.keys(t).forEach(function(n){t[n].forEach(function(i){e[String(i)]=n})}),e}function Ew(t,e){if(e=e||{},Object.keys(e).forEach(function(n){if(vw.indexOf(n)===-1)throw new be('Unknown option "'+n+'" is met in definition of "'+t+'" YAML type.')}),this.options=e,this.tag=t,this.kind=e.kind||null,this.resolve=e.resolve||function(){return!0},this.construct=e.construct||function(n){return n},this.instanceOf=e.instanceOf||null,this.predicate=e.predicate||null,this.represent=e.represent||null,this.representName=e.representName||null,this.defaultStyle=e.defaultStyle||null,this.multi=e.multi||!1,this.styleAliases=kw(e.styleAliases||null),bw.indexOf(this.kind)===-1)throw new be('Unknown kind "'+this.kind+'" is specified for "'+t+'" YAML type.')}var oe=Ew;function tx(t,e){var n=[];return t[e].forEach(function(i){var a=n.length;n.forEach(function(r,s){r.tag===i.tag&&r.kind===i.kind&&r.multi===i.multi&&(a=s)}),n[a]=i}),n}function ww(){var t={scalar:{},sequence:{},mapping:{},fallback:{},multi:{scalar:[],sequence:[],mapping:[],fallback:[]}},e,n;function i(a){a.multi?(t.multi[a.kind].push(a),t.multi.fallback.push(a)):t[a.kind][a.tag]=t.fallback[a.tag]=a}for(e=0,n=arguments.length;e<n;e+=1)arguments[e].forEach(i);return t}function a0(t){return this.extend(t)}a0.prototype.extend=function(e){var n=[],i=[];if(e instanceof oe)i.push(e);else if(Array.isArray(e))i=i.concat(e);else if(e&&(Array.isArray(e.implicit)||Array.isArray(e.explicit)))e.implicit&&(n=n.concat(e.implicit)),e.explicit&&(i=i.concat(e.explicit));else throw new be("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");n.forEach(function(r){if(!(r instanceof oe))throw new be("Specified list of YAML types (or a single Type object) contains a non-Type object.");if(r.loadKind&&r.loadKind!=="scalar")throw new be("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");if(r.multi)throw new be("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.")}),i.forEach(function(r){if(!(r instanceof oe))throw new be("Specified list of YAML types (or a single Type object) contains a non-Type object.")});var a=Object.create(a0.prototype);return a.implicit=(this.implicit||[]).concat(n),a.explicit=(this.explicit||[]).concat(i),a.compiledImplicit=tx(a,"implicit"),a.compiledExplicit=tx(a,"explicit"),a.compiledTypeMap=ww(a.compiledImplicit,a.compiledExplicit),a};var yx=a0,xx=new oe("tag:yaml.org,2002:str",{kind:"scalar",construct:function(t){return t!==null?t:""}}),vx=new oe("tag:yaml.org,2002:seq",{kind:"sequence",construct:function(t){return t!==null?t:[]}}),bx=new oe("tag:yaml.org,2002:map",{kind:"mapping",construct:function(t){return t!==null?t:{}}}),kx=new yx({explicit:[xx,vx,bx]});function Cw(t){if(t===null)return!0;var e=t.length;return e===1&&t==="~"||e===4&&(t==="null"||t==="Null"||t==="NULL")}function Sw(){return null}function Aw(t){return t===null}var Ex=new oe("tag:yaml.org,2002:null",{kind:"scalar",resolve:Cw,construct:Sw,predicate:Aw,represent:{canonical:function(){return"~"},lowercase:function(){return"null"},uppercase:function(){return"NULL"},camelcase:function(){return"Null"},empty:function(){return""}},defaultStyle:"lowercase"});function Tw(t){if(t===null)return!1;var e=t.length;return e===4&&(t==="true"||t==="True"||t==="TRUE")||e===5&&(t==="false"||t==="False"||t==="FALSE")}function Mw(t){return t==="true"||t==="True"||t==="TRUE"}function _w(t){return Object.prototype.toString.call(t)==="[object Boolean]"}var wx=new oe("tag:yaml.org,2002:bool",{kind:"scalar",resolve:Tw,construct:Mw,predicate:_w,represent:{lowercase:function(t){return t?"true":"false"},uppercase:function(t){return t?"TRUE":"FALSE"},camelcase:function(t){return t?"True":"False"}},defaultStyle:"lowercase"});function Bw(t){return 48<=t&&t<=57||65<=t&&t<=70||97<=t&&t<=102}function Rw(t){return 48<=t&&t<=55}function Dw(t){return 48<=t&&t<=57}function Iw(t){if(t===null)return!1;var e=t.length,n=0,i=!1,a;if(!e)return!1;if(a=t[n],(a==="-"||a==="+")&&(a=t[++n]),a==="0"){if(n+1===e)return!0;if(a=t[++n],a==="b"){for(n++;n<e;n++)if(a=t[n],a!=="_"){if(a!=="0"&&a!=="1")return!1;i=!0}return i&&a!=="_"}if(a==="x"){for(n++;n<e;n++)if(a=t[n],a!=="_"){if(!Bw(t.charCodeAt(n)))return!1;i=!0}return i&&a!=="_"}if(a==="o"){for(n++;n<e;n++)if(a=t[n],a!=="_"){if(!Rw(t.charCodeAt(n)))return!1;i=!0}return i&&a!=="_"}}if(a==="_")return!1;for(;n<e;n++)if(a=t[n],a!=="_"){if(!Dw(t.charCodeAt(n)))return!1;i=!0}return!(!i||a==="_")}function Fw(t){var e=t,n=1,i;if(e.indexOf("_")!==-1&&(e=e.replace(/_/g,"")),i=e[0],(i==="-"||i==="+")&&(i==="-"&&(n=-1),e=e.slice(1),i=e[0]),e==="0")return 0;if(i==="0"){if(e[1]==="b")return n*parseInt(e.slice(2),2);if(e[1]==="x")return n*parseInt(e.slice(2),16);if(e[1]==="o")return n*parseInt(e.slice(2),8)}return n*parseInt(e,10)}function Ow(t){return Object.prototype.toString.call(t)==="[object Number]"&&t%1===0&&!Kt.isNegativeZero(t)}var Cx=new oe("tag:yaml.org,2002:int",{kind:"scalar",resolve:Iw,construct:Fw,predicate:Ow,represent:{binary:function(t){return t>=0?"0b"+t.toString(2):"-0b"+t.toString(2).slice(1)},octal:function(t){return t>=0?"0o"+t.toString(8):"-0o"+t.toString(8).slice(1)},decimal:function(t){return t.toString(10)},hexadecimal:function(t){return t>=0?"0x"+t.toString(16).toUpperCase():"-0x"+t.toString(16).toUpperCase().slice(1)}},defaultStyle:"decimal",styleAliases:{binary:[2,"bin"],octal:[8,"oct"],decimal:[10,"dec"],hexadecimal:[16,"hex"]}}),zw=new RegExp("^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$");function Lw(t){return!(t===null||!zw.test(t)||t[t.length-1]==="_")}function Nw(t){var e,n;return e=t.replace(/_/g,"").toLowerCase(),n=e[0]==="-"?-1:1,"+-".indexOf(e[0])>=0&&(e=e.slice(1)),e===".inf"?n===1?Number.POSITIVE_INFINITY:Number.NEGATIVE_INFINITY:e===".nan"?NaN:n*parseFloat(e,10)}var Pw=/^[-+]?[0-9]+e/;function jw(t,e){var n;if(isNaN(t))switch(e){case"lowercase":return".nan";case"uppercase":return".NAN";case"camelcase":return".NaN"}else if(Number.POSITIVE_INFINITY===t)switch(e){case"lowercase":return".inf";case"uppercase":return".INF";case"camelcase":return".Inf"}else if(Number.NEGATIVE_INFINITY===t)switch(e){case"lowercase":return"-.inf";case"uppercase":return"-.INF";case"camelcase":return"-.Inf"}else if(Kt.isNegativeZero(t))return"-0.0";return n=t.toString(10),Pw.test(n)?n.replace("e",".e"):n}function $w(t){return Object.prototype.toString.call(t)==="[object Number]"&&(t%1!==0||Kt.isNegativeZero(t))}var Sx=new oe("tag:yaml.org,2002:float",{kind:"scalar",resolve:Lw,construct:Nw,predicate:$w,represent:jw,defaultStyle:"lowercase"}),Ax=kx.extend({implicit:[Ex,wx,Cx,Sx]}),Tx=Ax,Mx=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"),_x=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$");function Uw(t){return t===null?!1:Mx.exec(t)!==null||_x.exec(t)!==null}function Hw(t){var e,n,i,a,r,s,o,l=0,c=null,u,d,p;if(e=Mx.exec(t),e===null&&(e=_x.exec(t)),e===null)throw new Error("Date resolve error");if(n=+e[1],i=+e[2]-1,a=+e[3],!e[4])return new Date(Date.UTC(n,i,a));if(r=+e[4],s=+e[5],o=+e[6],e[7]){for(l=e[7].slice(0,3);l.length<3;)l+="0";l=+l}return e[9]&&(u=+e[10],d=+(e[11]||0),c=(u*60+d)*6e4,e[9]==="-"&&(c=-c)),p=new Date(Date.UTC(n,i,a,r,s,o,l)),c&&p.setTime(p.getTime()-c),p}function Yw(t){return t.toISOString()}var Bx=new oe("tag:yaml.org,2002:timestamp",{kind:"scalar",resolve:Uw,construct:Hw,instanceOf:Date,represent:Yw});function Vw(t){return t==="<<"||t===null}var Rx=new oe("tag:yaml.org,2002:merge",{kind:"scalar",resolve:Vw}),c0=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;function Gw(t){if(t===null)return!1;var e,n,i=0,a=t.length,r=c0;for(n=0;n<a;n++)if(e=r.indexOf(t.charAt(n)),!(e>64)){if(e<0)return!1;i+=6}return i%8===0}function qw(t){var e,n,i=t.replace(/[\r\n=]/g,""),a=i.length,r=c0,s=0,o=[];for(e=0;e<a;e++)e%4===0&&e&&(o.push(s>>16&255),o.push(s>>8&255),o.push(s&255)),s=s<<6|r.indexOf(i.charAt(e));return n=a%4*6,n===0?(o.push(s>>16&255),o.push(s>>8&255),o.push(s&255)):n===18?(o.push(s>>10&255),o.push(s>>2&255)):n===12&&o.push(s>>4&255),new Uint8Array(o)}function Xw(t){var e="",n=0,i,a,r=t.length,s=c0;for(i=0;i<r;i++)i%3===0&&i&&(e+=s[n>>18&63],e+=s[n>>12&63],e+=s[n>>6&63],e+=s[n&63]),n=(n<<8)+t[i];return a=r%3,a===0?(e+=s[n>>18&63],e+=s[n>>12&63],e+=s[n>>6&63],e+=s[n&63]):a===2?(e+=s[n>>10&63],e+=s[n>>4&63],e+=s[n<<2&63],e+=s[64]):a===1&&(e+=s[n>>2&63],e+=s[n<<4&63],e+=s[64],e+=s[64]),e}function Kw(t){return Object.prototype.toString.call(t)==="[object Uint8Array]"}var Dx=new oe("tag:yaml.org,2002:binary",{kind:"scalar",resolve:Gw,construct:qw,predicate:Kw,represent:Xw}),Zw=Object.prototype.hasOwnProperty,Qw=Object.prototype.toString;function Jw(t){if(t===null)return!0;var e=[],n,i,a,r,s,o=t;for(n=0,i=o.length;n<i;n+=1){if(a=o[n],s=!1,Qw.call(a)!=="[object Object]")return!1;for(r in a)if(Zw.call(a,r))if(!s)s=!0;else return!1;if(!s)return!1;if(e.indexOf(r)===-1)e.push(r);else return!1}return!0}function Ww(t){return t!==null?t:[]}var Ix=new oe("tag:yaml.org,2002:omap",{kind:"sequence",resolve:Jw,construct:Ww}),tC=Object.prototype.toString;function eC(t){if(t===null)return!0;var e,n,i,a,r,s=t;for(r=new Array(s.length),e=0,n=s.length;e<n;e+=1){if(i=s[e],tC.call(i)!=="[object Object]"||(a=Object.keys(i),a.length!==1))return!1;r[e]=[a[0],i[a[0]]]}return!0}function nC(t){if(t===null)return[];var e,n,i,a,r,s=t;for(r=new Array(s.length),e=0,n=s.length;e<n;e+=1)i=s[e],a=Object.keys(i),r[e]=[a[0],i[a[0]]];return r}var Fx=new oe("tag:yaml.org,2002:pairs",{kind:"sequence",resolve:eC,construct:nC}),iC=Object.prototype.hasOwnProperty;function aC(t){if(t===null)return!0;var e,n=t;for(e in n)if(iC.call(n,e)&&n[e]!==null)return!1;return!0}function rC(t){return t!==null?t:{}}var Ox=new oe("tag:yaml.org,2002:set",{kind:"mapping",resolve:aC,construct:rC}),u0=Tx.extend({implicit:[Bx,Rx],explicit:[Dx,Ix,Fx,Ox]}),ua=Object.prototype.hasOwnProperty,_u=1,zx=2,Lx=3,Bu=4,i0=1,sC=2,ex=3,oC=/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,lC=/[\x85\u2028\u2029]/,cC=/[,\[\]\{\}]/,Nx=/^(?:!|!!|![a-z\-]+!)$/i,Px=/^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;function nx(t){return Object.prototype.toString.call(t)}function jn(t){return t===10||t===13}function sr(t){return t===9||t===32}function Oe(t){return t===9||t===32||t===10||t===13}function Ts(t){return t===44||t===91||t===93||t===123||t===125}function uC(t){var e;return 48<=t&&t<=57?t-48:(e=t|32,97<=e&&e<=102?e-97+10:-1)}function dC(t){return t===120?2:t===117?4:t===85?8:0}function pC(t){return 48<=t&&t<=57?t-48:-1}function ix(t){return t===48?"\0":t===97?"\x07":t===98?"\b":t===116||t===9?"	":t===110?`
`:t===118?"\v":t===102?"\f":t===114?"\r":t===101?"\x1B":t===32?" ":t===34?'"':t===47?"/":t===92?"\\":t===78?"\x85":t===95?"\xA0":t===76?"\u2028":t===80?"\u2029":""}function fC(t){return t<=65535?String.fromCharCode(t):String.fromCharCode((t-65536>>10)+55296,(t-65536&1023)+56320)}function jx(t,e,n){e==="__proto__"?Object.defineProperty(t,e,{configurable:!0,enumerable:!0,writable:!0,value:n}):t[e]=n}var $x=new Array(256),Ux=new Array(256);for(rr=0;rr<256;rr++)$x[rr]=ix(rr)?1:0,Ux[rr]=ix(rr);var rr;function hC(t,e){this.input=t,this.filename=e.filename||null,this.schema=e.schema||u0,this.onWarning=e.onWarning||null,this.legacy=e.legacy||!1,this.json=e.json||!1,this.listener=e.listener||null,this.implicitTypes=this.schema.compiledImplicit,this.typeMap=this.schema.compiledTypeMap,this.length=t.length,this.position=0,this.line=0,this.lineStart=0,this.lineIndent=0,this.firstTabInLine=-1,this.documents=[]}function Hx(t,e){var n={name:t.filename,buffer:t.input.slice(0,-1),position:t.position,line:t.line,column:t.position-t.lineStart};return n.snippet=xw(n),new be(e,n)}function U(t,e){throw Hx(t,e)}function Ru(t,e){t.onWarning&&t.onWarning.call(null,Hx(t,e))}var ax={YAML:function(e,n,i){var a,r,s;e.version!==null&&U(e,"duplication of %YAML directive"),i.length!==1&&U(e,"YAML directive accepts exactly one argument"),a=/^([0-9]+)\.([0-9]+)$/.exec(i[0]),a===null&&U(e,"ill-formed argument of the YAML directive"),r=parseInt(a[1],10),s=parseInt(a[2],10),r!==1&&U(e,"unacceptable YAML version of the document"),e.version=i[0],e.checkLineBreaks=s<2,s!==1&&s!==2&&Ru(e,"unsupported YAML version of the document")},TAG:function(e,n,i){var a,r;i.length!==2&&U(e,"TAG directive accepts exactly two arguments"),a=i[0],r=i[1],Nx.test(a)||U(e,"ill-formed tag handle (first argument) of the TAG directive"),ua.call(e.tagMap,a)&&U(e,'there is a previously declared suffix for "'+a+'" tag handle'),Px.test(r)||U(e,"ill-formed tag prefix (second argument) of the TAG directive");try{r=decodeURIComponent(r)}catch{U(e,"tag prefix is malformed: "+r)}e.tagMap[a]=r}};function ca(t,e,n,i){var a,r,s,o;if(e<n){if(o=t.input.slice(e,n),i)for(a=0,r=o.length;a<r;a+=1)s=o.charCodeAt(a),s===9||32<=s&&s<=1114111||U(t,"expected valid JSON character");else oC.test(o)&&U(t,"the stream contains non-printable characters");t.result+=o}}function rx(t,e,n,i){var a,r,s,o;for(Kt.isObject(n)||U(t,"cannot merge mappings; the provided source object is unacceptable"),a=Object.keys(n),s=0,o=a.length;s<o;s+=1)r=a[s],ua.call(e,r)||(jx(e,r,n[r]),i[r]=!0)}function Ms(t,e,n,i,a,r,s,o,l){var c,u;if(Array.isArray(a))for(a=Array.prototype.slice.call(a),c=0,u=a.length;c<u;c+=1)Array.isArray(a[c])&&U(t,"nested arrays are not supported inside keys"),typeof a=="object"&&nx(a[c])==="[object Object]"&&(a[c]="[object Object]");if(typeof a=="object"&&nx(a)==="[object Object]"&&(a="[object Object]"),a=String(a),e===null&&(e={}),i==="tag:yaml.org,2002:merge")if(Array.isArray(r))for(c=0,u=r.length;c<u;c+=1)rx(t,e,r[c],n);else rx(t,e,r,n);else!t.json&&!ua.call(n,a)&&ua.call(e,a)&&(t.line=s||t.line,t.lineStart=o||t.lineStart,t.position=l||t.position,U(t,"duplicated mapping key")),jx(e,a,r),delete n[a];return e}function d0(t){var e;e=t.input.charCodeAt(t.position),e===10?t.position++:e===13?(t.position++,t.input.charCodeAt(t.position)===10&&t.position++):U(t,"a line break is expected"),t.line+=1,t.lineStart=t.position,t.firstTabInLine=-1}function Gt(t,e,n){for(var i=0,a=t.input.charCodeAt(t.position);a!==0;){for(;sr(a);)a===9&&t.firstTabInLine===-1&&(t.firstTabInLine=t.position),a=t.input.charCodeAt(++t.position);if(e&&a===35)do a=t.input.charCodeAt(++t.position);while(a!==10&&a!==13&&a!==0);if(jn(a))for(d0(t),a=t.input.charCodeAt(t.position),i++,t.lineIndent=0;a===32;)t.lineIndent++,a=t.input.charCodeAt(++t.position);else break}return n!==-1&&i!==0&&t.lineIndent<n&&Ru(t,"deficient indentation"),i}function Fu(t){var e=t.position,n;return n=t.input.charCodeAt(e),!!((n===45||n===46)&&n===t.input.charCodeAt(e+1)&&n===t.input.charCodeAt(e+2)&&(e+=3,n=t.input.charCodeAt(e),n===0||Oe(n)))}function p0(t,e){e===1?t.result+=" ":e>1&&(t.result+=Kt.repeat(`
`,e-1))}function gC(t,e,n){var i,a,r,s,o,l,c,u,d=t.kind,p=t.result,f;if(f=t.input.charCodeAt(t.position),Oe(f)||Ts(f)||f===35||f===38||f===42||f===33||f===124||f===62||f===39||f===34||f===37||f===64||f===96||(f===63||f===45)&&(a=t.input.charCodeAt(t.position+1),Oe(a)||n&&Ts(a)))return!1;for(t.kind="scalar",t.result="",r=s=t.position,o=!1;f!==0;){if(f===58){if(a=t.input.charCodeAt(t.position+1),Oe(a)||n&&Ts(a))break}else if(f===35){if(i=t.input.charCodeAt(t.position-1),Oe(i))break}else{if(t.position===t.lineStart&&Fu(t)||n&&Ts(f))break;if(jn(f))if(l=t.line,c=t.lineStart,u=t.lineIndent,Gt(t,!1,-1),t.lineIndent>=e){o=!0,f=t.input.charCodeAt(t.position);continue}else{t.position=s,t.line=l,t.lineStart=c,t.lineIndent=u;break}}o&&(ca(t,r,s,!1),p0(t,t.line-l),r=s=t.position,o=!1),sr(f)||(s=t.position+1),f=t.input.charCodeAt(++t.position)}return ca(t,r,s,!1),t.result?!0:(t.kind=d,t.result=p,!1)}function mC(t,e){var n,i,a;if(n=t.input.charCodeAt(t.position),n!==39)return!1;for(t.kind="scalar",t.result="",t.position++,i=a=t.position;(n=t.input.charCodeAt(t.position))!==0;)if(n===39)if(ca(t,i,t.position,!0),n=t.input.charCodeAt(++t.position),n===39)i=t.position,t.position++,a=t.position;else return!0;else jn(n)?(ca(t,i,a,!0),p0(t,Gt(t,!1,e)),i=a=t.position):t.position===t.lineStart&&Fu(t)?U(t,"unexpected end of the document within a single quoted scalar"):(t.position++,a=t.position);U(t,"unexpected end of the stream within a single quoted scalar")}function yC(t,e){var n,i,a,r,s,o;if(o=t.input.charCodeAt(t.position),o!==34)return!1;for(t.kind="scalar",t.result="",t.position++,n=i=t.position;(o=t.input.charCodeAt(t.position))!==0;){if(o===34)return ca(t,n,t.position,!0),t.position++,!0;if(o===92){if(ca(t,n,t.position,!0),o=t.input.charCodeAt(++t.position),jn(o))Gt(t,!1,e);else if(o<256&&$x[o])t.result+=Ux[o],t.position++;else if((s=dC(o))>0){for(a=s,r=0;a>0;a--)o=t.input.charCodeAt(++t.position),(s=uC(o))>=0?r=(r<<4)+s:U(t,"expected hexadecimal character");t.result+=fC(r),t.position++}else U(t,"unknown escape sequence");n=i=t.position}else jn(o)?(ca(t,n,i,!0),p0(t,Gt(t,!1,e)),n=i=t.position):t.position===t.lineStart&&Fu(t)?U(t,"unexpected end of the document within a double quoted scalar"):(t.position++,i=t.position)}U(t,"unexpected end of the stream within a double quoted scalar")}function xC(t,e){var n=!0,i,a,r,s=t.tag,o,l=t.anchor,c,u,d,p,f,y=Object.create(null),x,E,v,h;if(h=t.input.charCodeAt(t.position),h===91)u=93,f=!1,o=[];else if(h===123)u=125,f=!0,o={};else return!1;for(t.anchor!==null&&(t.anchorMap[t.anchor]=o),h=t.input.charCodeAt(++t.position);h!==0;){if(Gt(t,!0,e),h=t.input.charCodeAt(t.position),h===u)return t.position++,t.tag=s,t.anchor=l,t.kind=f?"mapping":"sequence",t.result=o,!0;n?h===44&&U(t,"expected the node content, but found ','"):U(t,"missed comma between flow collection entries"),E=x=v=null,d=p=!1,h===63&&(c=t.input.charCodeAt(t.position+1),Oe(c)&&(d=p=!0,t.position++,Gt(t,!0,e))),i=t.line,a=t.lineStart,r=t.position,_s(t,e,_u,!1,!0),E=t.tag,x=t.result,Gt(t,!0,e),h=t.input.charCodeAt(t.position),(p||t.line===i)&&h===58&&(d=!0,h=t.input.charCodeAt(++t.position),Gt(t,!0,e),_s(t,e,_u,!1,!0),v=t.result),f?Ms(t,o,y,E,x,v,i,a,r):d?o.push(Ms(t,null,y,E,x,v,i,a,r)):o.push(x),Gt(t,!0,e),h=t.input.charCodeAt(t.position),h===44?(n=!0,h=t.input.charCodeAt(++t.position)):n=!1}U(t,"unexpected end of the stream within a flow collection")}function vC(t,e){var n,i,a=i0,r=!1,s=!1,o=e,l=0,c=!1,u,d;if(d=t.input.charCodeAt(t.position),d===124)i=!1;else if(d===62)i=!0;else return!1;for(t.kind="scalar",t.result="";d!==0;)if(d=t.input.charCodeAt(++t.position),d===43||d===45)i0===a?a=d===43?ex:sC:U(t,"repeat of a chomping mode identifier");else if((u=pC(d))>=0)u===0?U(t,"bad explicit indentation width of a block scalar; it cannot be less than one"):s?U(t,"repeat of an indentation width identifier"):(o=e+u-1,s=!0);else break;if(sr(d)){do d=t.input.charCodeAt(++t.position);while(sr(d));if(d===35)do d=t.input.charCodeAt(++t.position);while(!jn(d)&&d!==0)}for(;d!==0;){for(d0(t),t.lineIndent=0,d=t.input.charCodeAt(t.position);(!s||t.lineIndent<o)&&d===32;)t.lineIndent++,d=t.input.charCodeAt(++t.position);if(!s&&t.lineIndent>o&&(o=t.lineIndent),jn(d)){l++;continue}if(t.lineIndent<o){a===ex?t.result+=Kt.repeat(`
`,r?1+l:l):a===i0&&r&&(t.result+=`
`);break}for(i?sr(d)?(c=!0,t.result+=Kt.repeat(`
`,r?1+l:l)):c?(c=!1,t.result+=Kt.repeat(`
`,l+1)):l===0?r&&(t.result+=" "):t.result+=Kt.repeat(`
`,l):t.result+=Kt.repeat(`
`,r?1+l:l),r=!0,s=!0,l=0,n=t.position;!jn(d)&&d!==0;)d=t.input.charCodeAt(++t.position);ca(t,n,t.position,!1)}return!0}function sx(t,e){var n,i=t.tag,a=t.anchor,r=[],s,o=!1,l;if(t.firstTabInLine!==-1)return!1;for(t.anchor!==null&&(t.anchorMap[t.anchor]=r),l=t.input.charCodeAt(t.position);l!==0&&(t.firstTabInLine!==-1&&(t.position=t.firstTabInLine,U(t,"tab characters must not be used in indentation")),!(l!==45||(s=t.input.charCodeAt(t.position+1),!Oe(s))));){if(o=!0,t.position++,Gt(t,!0,-1)&&t.lineIndent<=e){r.push(null),l=t.input.charCodeAt(t.position);continue}if(n=t.line,_s(t,e,Lx,!1,!0),r.push(t.result),Gt(t,!0,-1),l=t.input.charCodeAt(t.position),(t.line===n||t.lineIndent>e)&&l!==0)U(t,"bad indentation of a sequence entry");else if(t.lineIndent<e)break}return o?(t.tag=i,t.anchor=a,t.kind="sequence",t.result=r,!0):!1}function bC(t,e,n){var i,a,r,s,o,l,c=t.tag,u=t.anchor,d={},p=Object.create(null),f=null,y=null,x=null,E=!1,v=!1,h;if(t.firstTabInLine!==-1)return!1;for(t.anchor!==null&&(t.anchorMap[t.anchor]=d),h=t.input.charCodeAt(t.position);h!==0;){if(!E&&t.firstTabInLine!==-1&&(t.position=t.firstTabInLine,U(t,"tab characters must not be used in indentation")),i=t.input.charCodeAt(t.position+1),r=t.line,(h===63||h===58)&&Oe(i))h===63?(E&&(Ms(t,d,p,f,y,null,s,o,l),f=y=x=null),v=!0,E=!0,a=!0):E?(E=!1,a=!0):U(t,"incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"),t.position+=1,h=i;else{if(s=t.line,o=t.lineStart,l=t.position,!_s(t,n,zx,!1,!0))break;if(t.line===r){for(h=t.input.charCodeAt(t.position);sr(h);)h=t.input.charCodeAt(++t.position);if(h===58)h=t.input.charCodeAt(++t.position),Oe(h)||U(t,"a whitespace character is expected after the key-value separator within a block mapping"),E&&(Ms(t,d,p,f,y,null,s,o,l),f=y=x=null),v=!0,E=!1,a=!1,f=t.tag,y=t.result;else if(v)U(t,"can not read an implicit mapping pair; a colon is missed");else return t.tag=c,t.anchor=u,!0}else if(v)U(t,"can not read a block mapping entry; a multiline key may not be an implicit key");else return t.tag=c,t.anchor=u,!0}if((t.line===r||t.lineIndent>e)&&(E&&(s=t.line,o=t.lineStart,l=t.position),_s(t,e,Bu,!0,a)&&(E?y=t.result:x=t.result),E||(Ms(t,d,p,f,y,x,s,o,l),f=y=x=null),Gt(t,!0,-1),h=t.input.charCodeAt(t.position)),(t.line===r||t.lineIndent>e)&&h!==0)U(t,"bad indentation of a mapping entry");else if(t.lineIndent<e)break}return E&&Ms(t,d,p,f,y,null,s,o,l),v&&(t.tag=c,t.anchor=u,t.kind="mapping",t.result=d),v}function kC(t){var e,n=!1,i=!1,a,r,s;if(s=t.input.charCodeAt(t.position),s!==33)return!1;if(t.tag!==null&&U(t,"duplication of a tag property"),s=t.input.charCodeAt(++t.position),s===60?(n=!0,s=t.input.charCodeAt(++t.position)):s===33?(i=!0,a="!!",s=t.input.charCodeAt(++t.position)):a="!",e=t.position,n){do s=t.input.charCodeAt(++t.position);while(s!==0&&s!==62);t.position<t.length?(r=t.input.slice(e,t.position),s=t.input.charCodeAt(++t.position)):U(t,"unexpected end of the stream within a verbatim tag")}else{for(;s!==0&&!Oe(s);)s===33&&(i?U(t,"tag suffix cannot contain exclamation marks"):(a=t.input.slice(e-1,t.position+1),Nx.test(a)||U(t,"named tag handle cannot contain such characters"),i=!0,e=t.position+1)),s=t.input.charCodeAt(++t.position);r=t.input.slice(e,t.position),cC.test(r)&&U(t,"tag suffix cannot contain flow indicator characters")}r&&!Px.test(r)&&U(t,"tag name cannot contain such characters: "+r);try{r=decodeURIComponent(r)}catch{U(t,"tag name is malformed: "+r)}return n?t.tag=r:ua.call(t.tagMap,a)?t.tag=t.tagMap[a]+r:a==="!"?t.tag="!"+r:a==="!!"?t.tag="tag:yaml.org,2002:"+r:U(t,'undeclared tag handle "'+a+'"'),!0}function EC(t){var e,n;if(n=t.input.charCodeAt(t.position),n!==38)return!1;for(t.anchor!==null&&U(t,"duplication of an anchor property"),n=t.input.charCodeAt(++t.position),e=t.position;n!==0&&!Oe(n)&&!Ts(n);)n=t.input.charCodeAt(++t.position);return t.position===e&&U(t,"name of an anchor node must contain at least one character"),t.anchor=t.input.slice(e,t.position),!0}function wC(t){var e,n,i;if(i=t.input.charCodeAt(t.position),i!==42)return!1;for(i=t.input.charCodeAt(++t.position),e=t.position;i!==0&&!Oe(i)&&!Ts(i);)i=t.input.charCodeAt(++t.position);return t.position===e&&U(t,"name of an alias node must contain at least one character"),n=t.input.slice(e,t.position),ua.call(t.anchorMap,n)||U(t,'unidentified alias "'+n+'"'),t.result=t.anchorMap[n],Gt(t,!0,-1),!0}function _s(t,e,n,i,a){var r,s,o,l=1,c=!1,u=!1,d,p,f,y,x,E;if(t.listener!==null&&t.listener("open",t),t.tag=null,t.anchor=null,t.kind=null,t.result=null,r=s=o=Bu===n||Lx===n,i&&Gt(t,!0,-1)&&(c=!0,t.lineIndent>e?l=1:t.lineIndent===e?l=0:t.lineIndent<e&&(l=-1)),l===1)for(;kC(t)||EC(t);)Gt(t,!0,-1)?(c=!0,o=r,t.lineIndent>e?l=1:t.lineIndent===e?l=0:t.lineIndent<e&&(l=-1)):o=!1;if(o&&(o=c||a),(l===1||Bu===n)&&(_u===n||zx===n?x=e:x=e+1,E=t.position-t.lineStart,l===1?o&&(sx(t,E)||bC(t,E,x))||xC(t,x)?u=!0:(s&&vC(t,x)||mC(t,x)||yC(t,x)?u=!0:wC(t)?(u=!0,(t.tag!==null||t.anchor!==null)&&U(t,"alias node should not have any properties")):gC(t,x,_u===n)&&(u=!0,t.tag===null&&(t.tag="?")),t.anchor!==null&&(t.anchorMap[t.anchor]=t.result)):l===0&&(u=o&&sx(t,E))),t.tag===null)t.anchor!==null&&(t.anchorMap[t.anchor]=t.result);else if(t.tag==="?"){for(t.result!==null&&t.kind!=="scalar"&&U(t,'unacceptable node kind for !<?> tag; it should be "scalar", not "'+t.kind+'"'),d=0,p=t.implicitTypes.length;d<p;d+=1)if(y=t.implicitTypes[d],y.resolve(t.result)){t.result=y.construct(t.result),t.tag=y.tag,t.anchor!==null&&(t.anchorMap[t.anchor]=t.result);break}}else if(t.tag!=="!"){if(ua.call(t.typeMap[t.kind||"fallback"],t.tag))y=t.typeMap[t.kind||"fallback"][t.tag];else for(y=null,f=t.typeMap.multi[t.kind||"fallback"],d=0,p=f.length;d<p;d+=1)if(t.tag.slice(0,f[d].tag.length)===f[d].tag){y=f[d];break}y||U(t,"unknown tag !<"+t.tag+">"),t.result!==null&&y.kind!==t.kind&&U(t,"unacceptable node kind for !<"+t.tag+'> tag; it should be "'+y.kind+'", not "'+t.kind+'"'),y.resolve(t.result,t.tag)?(t.result=y.construct(t.result,t.tag),t.anchor!==null&&(t.anchorMap[t.anchor]=t.result)):U(t,"cannot resolve a node with !<"+t.tag+"> explicit tag")}return t.listener!==null&&t.listener("close",t),t.tag!==null||t.anchor!==null||u}function CC(t){var e=t.position,n,i,a,r=!1,s;for(t.version=null,t.checkLineBreaks=t.legacy,t.tagMap=Object.create(null),t.anchorMap=Object.create(null);(s=t.input.charCodeAt(t.position))!==0&&(Gt(t,!0,-1),s=t.input.charCodeAt(t.position),!(t.lineIndent>0||s!==37));){for(r=!0,s=t.input.charCodeAt(++t.position),n=t.position;s!==0&&!Oe(s);)s=t.input.charCodeAt(++t.position);for(i=t.input.slice(n,t.position),a=[],i.length<1&&U(t,"directive name must not be less than one character in length");s!==0;){for(;sr(s);)s=t.input.charCodeAt(++t.position);if(s===35){do s=t.input.charCodeAt(++t.position);while(s!==0&&!jn(s));break}if(jn(s))break;for(n=t.position;s!==0&&!Oe(s);)s=t.input.charCodeAt(++t.position);a.push(t.input.slice(n,t.position))}s!==0&&d0(t),ua.call(ax,i)?ax[i](t,i,a):Ru(t,'unknown document directive "'+i+'"')}if(Gt(t,!0,-1),t.lineIndent===0&&t.input.charCodeAt(t.position)===45&&t.input.charCodeAt(t.position+1)===45&&t.input.charCodeAt(t.position+2)===45?(t.position+=3,Gt(t,!0,-1)):r&&U(t,"directives end mark is expected"),_s(t,t.lineIndent-1,Bu,!1,!0),Gt(t,!0,-1),t.checkLineBreaks&&lC.test(t.input.slice(e,t.position))&&Ru(t,"non-ASCII line breaks are interpreted as content"),t.documents.push(t.result),t.position===t.lineStart&&Fu(t)){t.input.charCodeAt(t.position)===46&&(t.position+=3,Gt(t,!0,-1));return}if(t.position<t.length-1)U(t,"end of the stream or a document separator is expected");else return}function Yx(t,e){t=String(t),e=e||{},t.length!==0&&(t.charCodeAt(t.length-1)!==10&&t.charCodeAt(t.length-1)!==13&&(t+=`
`),t.charCodeAt(0)===65279&&(t=t.slice(1)));var n=new hC(t,e),i=t.indexOf("\0");for(i!==-1&&(n.position=i,U(n,"null byte is not allowed in input")),n.input+="\0";n.input.charCodeAt(n.position)===32;)n.lineIndent+=1,n.position+=1;for(;n.position<n.length-1;)CC(n);return n.documents}function SC(t,e,n){e!==null&&typeof e=="object"&&typeof n>"u"&&(n=e,e=null);var i=Yx(t,n);if(typeof e!="function")return i;for(var a=0,r=i.length;a<r;a+=1)e(i[a])}function AC(t,e){var n=Yx(t,e);if(n.length!==0){if(n.length===1)return n[0];throw new be("expected a single document in the stream, but found more")}}var TC=SC,MC=AC,Vx={loadAll:TC,load:MC},Gx=Object.prototype.toString,qx=Object.prototype.hasOwnProperty,f0=65279,_C=9,ll=10,BC=13,RC=32,DC=33,IC=34,r0=35,FC=37,OC=38,zC=39,LC=42,Xx=44,NC=45,Du=58,PC=61,jC=62,$C=63,UC=64,Kx=91,Zx=93,HC=96,Qx=123,YC=124,Jx=125,fe={};fe[0]="\\0";fe[7]="\\a";fe[8]="\\b";fe[9]="\\t";fe[10]="\\n";fe[11]="\\v";fe[12]="\\f";fe[13]="\\r";fe[27]="\\e";fe[34]='\\"';fe[92]="\\\\";fe[133]="\\N";fe[160]="\\_";fe[8232]="\\L";fe[8233]="\\P";var VC=["y","Y","yes","Yes","YES","on","On","ON","n","N","no","No","NO","off","Off","OFF"],GC=/^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;function qC(t,e){var n,i,a,r,s,o,l;if(e===null)return{};for(n={},i=Object.keys(e),a=0,r=i.length;a<r;a+=1)s=i[a],o=String(e[s]),s.slice(0,2)==="!!"&&(s="tag:yaml.org,2002:"+s.slice(2)),l=t.compiledTypeMap.fallback[s],l&&qx.call(l.styleAliases,o)&&(o=l.styleAliases[o]),n[s]=o;return n}function XC(t){var e,n,i;if(e=t.toString(16).toUpperCase(),t<=255)n="x",i=2;else if(t<=65535)n="u",i=4;else if(t<=4294967295)n="U",i=8;else throw new be("code point within a string may not be greater than 0xFFFFFFFF");return"\\"+n+Kt.repeat("0",i-e.length)+e}var KC=1,cl=2;function ZC(t){this.schema=t.schema||u0,this.indent=Math.max(1,t.indent||2),this.noArrayIndent=t.noArrayIndent||!1,this.skipInvalid=t.skipInvalid||!1,this.flowLevel=Kt.isNothing(t.flowLevel)?-1:t.flowLevel,this.styleMap=qC(this.schema,t.styles||null),this.sortKeys=t.sortKeys||!1,this.lineWidth=t.lineWidth||80,this.noRefs=t.noRefs||!1,this.noCompatMode=t.noCompatMode||!1,this.condenseFlow=t.condenseFlow||!1,this.quotingType=t.quotingType==='"'?cl:KC,this.forceQuotes=t.forceQuotes||!1,this.replacer=typeof t.replacer=="function"?t.replacer:null,this.implicitTypes=this.schema.compiledImplicit,this.explicitTypes=this.schema.compiledExplicit,this.tag=null,this.result="",this.duplicates=[],this.usedDuplicates=null}function ox(t,e){for(var n=Kt.repeat(" ",e),i=0,a=-1,r="",s,o=t.length;i<o;)a=t.indexOf(`
`,i),a===-1?(s=t.slice(i),i=o):(s=t.slice(i,a+1),i=a+1),s.length&&s!==`
`&&(r+=n),r+=s;return r}function s0(t,e){return`
`+Kt.repeat(" ",t.indent*e)}function QC(t,e){var n,i,a;for(n=0,i=t.implicitTypes.length;n<i;n+=1)if(a=t.implicitTypes[n],a.resolve(e))return!0;return!1}function Iu(t){return t===RC||t===_C}function ul(t){return 32<=t&&t<=126||161<=t&&t<=55295&&t!==8232&&t!==8233||57344<=t&&t<=65533&&t!==f0||65536<=t&&t<=1114111}function lx(t){return ul(t)&&t!==f0&&t!==BC&&t!==ll}function cx(t,e,n){var i=lx(t),a=i&&!Iu(t);return(n?i:i&&t!==Xx&&t!==Kx&&t!==Zx&&t!==Qx&&t!==Jx)&&t!==r0&&!(e===Du&&!a)||lx(e)&&!Iu(e)&&t===r0||e===Du&&a}function JC(t){return ul(t)&&t!==f0&&!Iu(t)&&t!==NC&&t!==$C&&t!==Du&&t!==Xx&&t!==Kx&&t!==Zx&&t!==Qx&&t!==Jx&&t!==r0&&t!==OC&&t!==LC&&t!==DC&&t!==YC&&t!==PC&&t!==jC&&t!==zC&&t!==IC&&t!==FC&&t!==UC&&t!==HC}function WC(t){return!Iu(t)&&t!==Du}function sl(t,e){var n=t.charCodeAt(e),i;return n>=55296&&n<=56319&&e+1<t.length&&(i=t.charCodeAt(e+1),i>=56320&&i<=57343)?(n-55296)*1024+i-56320+65536:n}function Wx(t){var e=/^\n* /;return e.test(t)}var t3=1,o0=2,e3=3,n3=4,As=5;function tS(t,e,n,i,a,r,s,o){var l,c=0,u=null,d=!1,p=!1,f=i!==-1,y=-1,x=JC(sl(t,0))&&WC(sl(t,t.length-1));if(e||s)for(l=0;l<t.length;c>=65536?l+=2:l++){if(c=sl(t,l),!ul(c))return As;x=x&&cx(c,u,o),u=c}else{for(l=0;l<t.length;c>=65536?l+=2:l++){if(c=sl(t,l),c===ll)d=!0,f&&(p=p||l-y-1>i&&t[y+1]!==" ",y=l);else if(!ul(c))return As;x=x&&cx(c,u,o),u=c}p=p||f&&l-y-1>i&&t[y+1]!==" "}return!d&&!p?x&&!s&&!a(t)?t3:r===cl?As:o0:n>9&&Wx(t)?As:s?r===cl?As:o0:p?n3:e3}function eS(t,e,n,i,a){t.dump=(function(){if(e.length===0)return t.quotingType===cl?'""':"''";if(!t.noCompatMode&&(VC.indexOf(e)!==-1||GC.test(e)))return t.quotingType===cl?'"'+e+'"':"'"+e+"'";var r=t.indent*Math.max(1,n),s=t.lineWidth===-1?-1:Math.max(Math.min(t.lineWidth,40),t.lineWidth-r),o=i||t.flowLevel>-1&&n>=t.flowLevel;function l(c){return QC(t,c)}switch(tS(e,o,t.indent,s,l,t.quotingType,t.forceQuotes&&!i,a)){case t3:return e;case o0:return"'"+e.replace(/'/g,"''")+"'";case e3:return"|"+ux(e,t.indent)+dx(ox(e,r));case n3:return">"+ux(e,t.indent)+dx(ox(nS(e,s),r));case As:return'"'+iS(e)+'"';default:throw new be("impossible error: invalid scalar style")}})()}function ux(t,e){var n=Wx(t)?String(e):"",i=t[t.length-1]===`
`,a=i&&(t[t.length-2]===`
`||t===`
`),r=a?"+":i?"":"-";return n+r+`
`}function dx(t){return t[t.length-1]===`
`?t.slice(0,-1):t}function nS(t,e){for(var n=/(\n+)([^\n]*)/g,i=(function(){var c=t.indexOf(`
`);return c=c!==-1?c:t.length,n.lastIndex=c,px(t.slice(0,c),e)})(),a=t[0]===`
`||t[0]===" ",r,s;s=n.exec(t);){var o=s[1],l=s[2];r=l[0]===" ",i+=o+(!a&&!r&&l!==""?`
`:"")+px(l,e),a=r}return i}function px(t,e){if(t===""||t[0]===" ")return t;for(var n=/ [^ ]/g,i,a=0,r,s=0,o=0,l="";i=n.exec(t);)o=i.index,o-a>e&&(r=s>a?s:o,l+=`
`+t.slice(a,r),a=r+1),s=o;return l+=`
`,t.length-a>e&&s>a?l+=t.slice(a,s)+`
`+t.slice(s+1):l+=t.slice(a),l.slice(1)}function iS(t){for(var e="",n=0,i,a=0;a<t.length;n>=65536?a+=2:a++)n=sl(t,a),i=fe[n],!i&&ul(n)?(e+=t[a],n>=65536&&(e+=t[a+1])):e+=i||XC(n);return e}function aS(t,e,n){var i="",a=t.tag,r,s,o;for(r=0,s=n.length;r<s;r+=1)o=n[r],t.replacer&&(o=t.replacer.call(n,String(r),o)),(xi(t,e,o,!1,!1)||typeof o>"u"&&xi(t,e,null,!1,!1))&&(i!==""&&(i+=","+(t.condenseFlow?"":" ")),i+=t.dump);t.tag=a,t.dump="["+i+"]"}function fx(t,e,n,i){var a="",r=t.tag,s,o,l;for(s=0,o=n.length;s<o;s+=1)l=n[s],t.replacer&&(l=t.replacer.call(n,String(s),l)),(xi(t,e+1,l,!0,!0,!1,!0)||typeof l>"u"&&xi(t,e+1,null,!0,!0,!1,!0))&&((!i||a!=="")&&(a+=s0(t,e)),t.dump&&ll===t.dump.charCodeAt(0)?a+="-":a+="- ",a+=t.dump);t.tag=r,t.dump=a||"[]"}function rS(t,e,n){var i="",a=t.tag,r=Object.keys(n),s,o,l,c,u;for(s=0,o=r.length;s<o;s+=1)u="",i!==""&&(u+=", "),t.condenseFlow&&(u+='"'),l=r[s],c=n[l],t.replacer&&(c=t.replacer.call(n,l,c)),xi(t,e,l,!1,!1)&&(t.dump.length>1024&&(u+="? "),u+=t.dump+(t.condenseFlow?'"':"")+":"+(t.condenseFlow?"":" "),xi(t,e,c,!1,!1)&&(u+=t.dump,i+=u));t.tag=a,t.dump="{"+i+"}"}function sS(t,e,n,i){var a="",r=t.tag,s=Object.keys(n),o,l,c,u,d,p;if(t.sortKeys===!0)s.sort();else if(typeof t.sortKeys=="function")s.sort(t.sortKeys);else if(t.sortKeys)throw new be("sortKeys must be a boolean or a function");for(o=0,l=s.length;o<l;o+=1)p="",(!i||a!=="")&&(p+=s0(t,e)),c=s[o],u=n[c],t.replacer&&(u=t.replacer.call(n,c,u)),xi(t,e+1,c,!0,!0,!0)&&(d=t.tag!==null&&t.tag!=="?"||t.dump&&t.dump.length>1024,d&&(t.dump&&ll===t.dump.charCodeAt(0)?p+="?":p+="? "),p+=t.dump,d&&(p+=s0(t,e)),xi(t,e+1,u,!0,d)&&(t.dump&&ll===t.dump.charCodeAt(0)?p+=":":p+=": ",p+=t.dump,a+=p));t.tag=r,t.dump=a||"{}"}function hx(t,e,n){var i,a,r,s,o,l;for(a=n?t.explicitTypes:t.implicitTypes,r=0,s=a.length;r<s;r+=1)if(o=a[r],(o.instanceOf||o.predicate)&&(!o.instanceOf||typeof e=="object"&&e instanceof o.instanceOf)&&(!o.predicate||o.predicate(e))){if(n?o.multi&&o.representName?t.tag=o.representName(e):t.tag=o.tag:t.tag="?",o.represent){if(l=t.styleMap[o.tag]||o.defaultStyle,Gx.call(o.represent)==="[object Function]")i=o.represent(e,l);else if(qx.call(o.represent,l))i=o.represent[l](e,l);else throw new be("!<"+o.tag+'> tag resolver accepts not "'+l+'" style');t.dump=i}return!0}return!1}function xi(t,e,n,i,a,r,s){t.tag=null,t.dump=n,hx(t,n,!1)||hx(t,n,!0);var o=Gx.call(t.dump),l=i,c;i&&(i=t.flowLevel<0||t.flowLevel>e);var u=o==="[object Object]"||o==="[object Array]",d,p;if(u&&(d=t.duplicates.indexOf(n),p=d!==-1),(t.tag!==null&&t.tag!=="?"||p||t.indent!==2&&e>0)&&(a=!1),p&&t.usedDuplicates[d])t.dump="*ref_"+d;else{if(u&&p&&!t.usedDuplicates[d]&&(t.usedDuplicates[d]=!0),o==="[object Object]")i&&Object.keys(t.dump).length!==0?(sS(t,e,t.dump,a),p&&(t.dump="&ref_"+d+t.dump)):(rS(t,e,t.dump),p&&(t.dump="&ref_"+d+" "+t.dump));else if(o==="[object Array]")i&&t.dump.length!==0?(t.noArrayIndent&&!s&&e>0?fx(t,e-1,t.dump,a):fx(t,e,t.dump,a),p&&(t.dump="&ref_"+d+t.dump)):(aS(t,e,t.dump),p&&(t.dump="&ref_"+d+" "+t.dump));else if(o==="[object String]")t.tag!=="?"&&eS(t,t.dump,e,r,l);else{if(o==="[object Undefined]")return!1;if(t.skipInvalid)return!1;throw new be("unacceptable kind of an object to dump "+o)}t.tag!==null&&t.tag!=="?"&&(c=encodeURI(t.tag[0]==="!"?t.tag.slice(1):t.tag).replace(/!/g,"%21"),t.tag[0]==="!"?c="!"+c:c.slice(0,18)==="tag:yaml.org,2002:"?c="!!"+c.slice(18):c="!<"+c+">",t.dump=c+" "+t.dump)}return!0}function oS(t,e){var n=[],i=[],a,r;for(l0(t,n,i),a=0,r=i.length;a<r;a+=1)e.duplicates.push(n[i[a]]);e.usedDuplicates=new Array(r)}function l0(t,e,n){var i,a,r;if(t!==null&&typeof t=="object")if(a=e.indexOf(t),a!==-1)n.indexOf(a)===-1&&n.push(a);else if(e.push(t),Array.isArray(t))for(a=0,r=t.length;a<r;a+=1)l0(t[a],e,n);else for(i=Object.keys(t),a=0,r=i.length;a<r;a+=1)l0(t[i[a]],e,n)}function lS(t,e){e=e||{};var n=new ZC(e);n.noRefs||oS(t,n);var i=t;return n.replacer&&(i=n.replacer.call({"":i},"",i)),xi(n,0,i,!0,!0)?n.dump+`
`:""}var cS=lS,uS={dump:cS};function h0(t,e){return function(){throw new Error("Function yaml."+t+" is removed in js-yaml 4. Use yaml."+e+" instead, which is now safe by default.")}}var dS=oe,pS=yx,fS=kx,hS=Ax,gS=Tx,mS=u0,yS=Vx.load,xS=Vx.loadAll,vS=uS.dump,bS=be,kS={binary:Dx,float:Sx,map:bx,null:Ex,pairs:Fx,set:Ox,timestamp:Bx,bool:wx,int:Cx,merge:Rx,omap:Ix,seq:vx,str:xx},ES=h0("safeLoad","load"),wS=h0("safeLoadAll","loadAll"),CS=h0("safeDump","dump"),or={Type:dS,Schema:pS,FAILSAFE_SCHEMA:fS,JSON_SCHEMA:hS,CORE_SCHEMA:gS,DEFAULT_SCHEMA:mS,load:yS,loadAll:xS,dump:vS,YAMLException:bS,types:kS,safeLoad:ES,safeLoadAll:wS,safeDump:CS};function dl(t){let e=0;for(let n=0;n<t.length;n++){let i=t.charCodeAt(n);e=(e<<5)-e+i,e=e&e}return Math.abs(e).toString(16).padStart(8,"0").slice(0,8)}var g0={P0:1.5,P1:1,P2:.5};function m0(t,e){let n=typeof e.subtype=="string"?e.subtype:void 0,i=Gn(t,n,e),a=Vn(t,n),r=a.p0.length===0||a.p0.every(l=>Qe(i,l)),s=a.p1.some(l=>Qe(i,l)),o=a.p2.some(l=>Qe(i,l));return r&&s&&o?"L3":r&&s?"L2":r?"L1":"L0"}function i3(t,e,n,i=1){let a=typeof e.subtype=="string"?e.subtype:void 0,r=Gn(t,a,e),s=Vn(t,a);if(![...s.p0,...s.p1,...s.p2].some(c=>Qe(r,c)))return 0;let l=0;if(s.p0.length>0){let c=s.p0.filter(u=>Qe(r,u)).length;l+=c/s.p0.length*g0.P0}if(s.p1.length>0){let c=s.p1.filter(u=>Qe(r,u)).length;l+=c/s.p1.length*g0.P1}if(s.p2.length>0){let c=s.p2.filter(u=>Qe(r,u)).length;l+=c/s.p2.length*g0.P2}return l*i*(1+Math.log1p(n))}var y0={create(t){let e=new Date().toISOString();return{id:dl(t.name),userId:t.userId||"",cardType:t.cardType,name:t.name,aliases:t.aliases||[],attributes:t.attributes||{},relatedPeople:[],relatedObjects:[],relatedThemes:[],evidenceEntryIds:[],confidence:.5,maturity:m0(t.cardType,t.attributes||{}),status:"needs_confirmation",lifecycle:"candidate",importance:0,createdAt:e,lastUpdated:e}}};var SS=or.dump,AS=or.load,Ou="---";function lr(t){let e={id:t.id,name:t.name,type:t.cardType,maturity:t.maturity,confidence:t.confidence,status:t.status,aliases:t.aliases,createdAt:t.createdAt,lastUpdated:t.lastUpdated};for(let[s,o]of Object.entries(t.attributes))o!=null&&(e[s]=o);let n=[`# ${t.name}`,""],i=RS(t);i.length>0&&(n.push("## \u57FA\u672C\u4FE1\u606F"),n.push(...i),n.push(""));let a=t.attributes.interactions||[];if(a.length>0){n.push("## \u4E92\u52A8\u8BB0\u5F55");for(let s of a.slice(-5)){let o=s.timestamp?new Date(s.timestamp).toISOString().split("T")[0]:"";n.push("- "+o+" "+s.content)}n.push("")}else t.attributes.interactions;let r=SS(e).trim();return`${Ou}
${r}
${Ou}

${n.join(`
`)}`}var TS=new Set(["L0","L1","L2","L3"]);function MS(t){return typeof t=="string"&&TS.has(t)}function Bs(t){let n=_S(t).frontmatter,i=n.type,a=Array.isArray(n.aliases)?n.aliases:[],r=new Set(["needs_confirmation","observing","active","archived"]),s=new Set(["id","name","type","maturity","confidence","aliases","createdAt","lastUpdated","lifecycle","importance","userId","relatedPeople","relatedObjects","relatedThemes","evidenceEntryIds"]),o=n.status,l=o!=null&&r.has(o),c={};for(let[p,f]of Object.entries(n))f!=null&&(s.has(p)||p==="status"&&l||(c[p]=f));let u=typeof c.subtype=="string"?c.subtype:void 0;Dl(i,u,n,c);let d=Gn(i,u,c);return{id:n.id||dl(n.name),userId:"",cardType:i,name:n.name,aliases:a,attributes:d,relatedPeople:[],relatedObjects:[],relatedThemes:[],evidenceEntryIds:[],confidence:typeof n.confidence=="number"?n.confidence:.5,maturity:MS(n.maturity)?n.maturity:"L0",status:l?o:"needs_confirmation",lifecycle:"candidate",importance:0,createdAt:n.createdAt||new Date().toISOString(),lastUpdated:n.lastUpdated||new Date().toISOString()}}function _S(t){let e=t.trim();if(!e.startsWith(Ou))return{frontmatter:{},body:e};let n=e.indexOf(Ou,3);if(n===-1)return{frontmatter:{},body:e};let i=e.slice(3,n).trim(),a=e.slice(n+3).trim();return{frontmatter:AS(i)||{},body:a}}function BS(t,e){let n=new Map,i=Tn(t);for(let a of i.commonAttributes)n.set(a.key,a.label);if(e&&i.subtypes?.[e])for(let a of i.subtypes[e].attributes)n.has(a.key)||n.set(a.key,a.label);return n}function a3(t,e){if(t[e.key]!=null&&t[e.key]!=="")return t[e.key];if(e.aliases){for(let n of e.aliases)if(t[n]!=null&&t[n]!=="")return t[n]}}function x0(t){if(Array.isArray(t))return t.map(String).join(", ");if(typeof t=="object"&&t!==null)try{return JSON.stringify(t)}catch{return""}return String(t)}function RS(t){let e=[],n=t.attributes,i=typeof n.subtype=="string"?n.subtype:void 0,a=Vn(t.cardType,i),r=BS(t.cardType,i),s=Tn(t.cardType),o=new Map;for(let d of s.commonAttributes)o.set(d.key,d);if(i&&s.subtypes?.[i])for(let d of s.subtypes[i].attributes)o.has(d.key)||o.set(d.key,d);if((t.cardType==="object"||t.cardType==="theme")&&n.subtype){let d=Qs(t.cardType,n.subtype)||n.subtype;e.push("- \u7C7B\u578B\uFF1A"+d)}let l=new Set(["subtype"]),c=[...a.p0,...a.p1];for(let d of c){if(l.has(d))continue;let p=o.get(d);if(!p)continue;let f=a3(n,p);if(f!==void 0){let y=r.get(d)||d;e.push(`- ${y}\uFF1A${x0(f)}`),l.add(d)}}for(let d of a.p2){if(l.has(d))continue;let p=o.get(d);if(!p)continue;let f=a3(n,p);if(f!==void 0){let y=r.get(d)||d;e.push(`- ${y}\uFF1A${x0(f)}`),l.add(d)}}let u=new Set(o.keys());for(let d of o.values())if(d.aliases)for(let p of d.aliases)u.add(p);for(let[d,p]of Object.entries(n))l.has(d)||u.has(d)||d==="interactions"||d==="relatedEntities"||p!=null&&p!==""&&(e.push(`- ${d}\uFF1A${x0(p)}`),l.add(d));return e}Hn();function DS(t){switch(t){case"person":return"Person/";case"object":return"Object/";case"theme":return"Theme/";default:return""}}function IS(t){return t.replace(/[\\/<>:"|?*]/g,"_").trim()}function r3(t,e){return`${DS(e)}${IS(t)||"unnamed"}.md`}function s3(t){let e=FS(t.type);return{path:r3(t.title,e),cardType:e,sanitizedName:t.title}}function FS(t){return t==="person"?"person":t==="object"?"object":t==="theme"?"theme":t==="project"||t==="thing"?"object":t==="idea"||t==="knowledge"?"theme":"object"}var cr={name:"",occupation:"",company:"",city:"",skills:[],roles:[],relationships:[],goals:[],focusAreas:[],lastUpdated:new Date().toISOString().split("T")[0]};function o3(t){let e={...cr},n=t.match(/^---\n([\s\S]*?)\n---/);if(n)try{let i=or.load(n[1]);i&&(typeof i.name=="string"&&(e.name=i.name),typeof i.occupation=="string"&&(e.occupation=i.occupation),typeof i.company=="string"&&(e.company=i.company),typeof i.city=="string"&&(e.city=i.city),Array.isArray(i.skills)&&(e.skills=i.skills.map(String)),Array.isArray(i.roles)&&(e.roles=i.roles.map(String)),Array.isArray(i.relationships)&&(e.relationships=i.relationships.map(String)),Array.isArray(i.goals)&&(e.goals=i.goals.map(String)),Array.isArray(i.focusAreas)&&(e.focusAreas=i.focusAreas.map(String)))}catch{}return!e.name&&!e.company?OS(t):e}function OS(t){let e={...cr},n=t.split(`
`),i="";for(let a of n){let r=a.trim();if(r.startsWith("## ")){i=r.slice(3);continue}if(i==="\u57FA\u672C\u4FE1\u606F"&&r.startsWith("- ")){let s=r.slice(2),[o,...l]=s.split("\uFF1A"),c=l.join("\uFF1A");o==="\u59D3\u540D"&&(e.name=c),(o==="\u804C\u4E1A"||o==="\u804C\u4F4D")&&(e.occupation=c),(o==="\u516C\u53F8/\u7EC4\u7EC7"||o==="\u516C\u53F8")&&(e.company=c),o==="\u57CE\u5E02"&&(e.city=c)}if(r.startsWith("- ")&&!r.includes("\uFF1A")){let s=r.slice(2);if(s==="_\u6682\u65E0_")continue;i==="\u6280\u80FD\u4E0E\u4E13\u4E1A"&&e.skills.push(s),i==="\u89D2\u8272\u4E0E\u5173\u7CFB"&&e.roles.push(s),i==="\u76EE\u6807\u4E0E\u8BA1\u5212"&&e.goals.push(s),i==="\u5173\u6CE8\u9886\u57DF"&&e.focusAreas.push(s)}if(r.startsWith("- \u5173\u7CFB\uFF1A")&&i==="\u89D2\u8272\u4E0E\u5173\u7CFB"){let s=r.slice(5);s!=="_\u6682\u65E0_"&&e.relationships.push(s)}}return e}var zS="TraceMind/PROFILE.md";async function l3(t){let e=t.vault.getFileByPath(zS);if(!e)return{...cr};try{let n=await t.vault.read(e);return o3(n)}catch{return{...cr}}}Ci();function LS(t,e,n){let i="\u4F60\u662F\u4E00\u4E2A\u7CBE\u51C6\u7684\u5B9E\u4F53\u63D0\u53D6\u548C\u65E5\u8BB0\u5206\u7C7B\u4E13\u5BB6\u3002\u8BF7\u5BF9\u4EE5\u4E0B\u65E5\u8BB0\u6587\u672C\u8FDB\u884C\u5206\u6790\u3002";return n&&(i+=`

${n}`),i+=`

## \u4EFB\u52A1 1\uFF1A\u9886\u57DF\u5206\u7C7B

\u5224\u65AD\u8FD9\u6761\u65E5\u8BB0\u5C5E\u4E8E\u54EA\u4E2A\u9886\u57DF\u3002"domain" \u5FC5\u987B\u662F\u4EE5\u4E0B\u4E4B\u4E00\uFF1A
- "\u5DE5\u4F5C"\uFF1A\u4E0E\u804C\u4E1A\u3001\u516C\u53F8\u3001\u9879\u76EE\u3001\u4E1A\u52A1\u76F8\u5173\u7684\u5185\u5BB9
- "\u751F\u6D3B"\uFF1A\u4E0E\u4E2A\u4EBA\u751F\u6D3B\u3001\u5BB6\u5EAD\u3001\u793E\u4EA4\u3001\u65E5\u5E38\u4E8B\u52A1\u76F8\u5173\u7684\u5185\u5BB9
- "\u5B66\u4E60"\uFF1A\u4E0E\u5B66\u4E60\u65B0\u77E5\u8BC6\u3001\u6280\u80FD\u63D0\u5347\u3001\u9605\u8BFB\u3001\u57F9\u8BAD\u76F8\u5173\u7684\u5185\u5BB9
- "\u8FD0\u52A8"\uFF1A\u4E0E\u4F53\u80B2\u953B\u70BC\u3001\u5065\u8EAB\u3001\u6237\u5916\u6D3B\u52A8\u76F8\u5173\u7684\u5185\u5BB9
- "\u5176\u4ED6"\uFF1A\u65E0\u6CD5\u5F52\u5165\u4EE5\u4E0A\u7C7B\u522B\u7684\u5185\u5BB9

\u5206\u7C7B\u65F6\u8BF7\u7ED3\u5408\u7528\u6237\u80CC\u666F\u4FE1\u606F\u3002\u5982\u679C\u63D0\u4F9B\u4E86\u7528\u6237\u80CC\u666F\uFF08\u804C\u4E1A\u3001\u516C\u53F8\u3001\u5173\u6CE8\u9886\u57DF\u7B49\uFF09\uFF0C\u8BF7\u53C2\u8003\uFF1A
- \u4E0E\u7528\u6237\u804C\u4E1A/\u516C\u53F8\u76F8\u5173\u7684\u8BDD\u9898 \u2192 "\u5DE5\u4F5C"
- \u4E0E\u7528\u6237\u5173\u6CE8\u9886\u57DF\u76F8\u5173\u4F46\u504F\u4E2A\u4EBA\u6210\u957F\u7684\u5185\u5BB9 \u2192 "\u5B66\u4E60"
- \u7EAF\u4E2A\u4EBA\u3001\u5BB6\u5EAD\u3001\u670B\u53CB\u805A\u4F1A \u2192 "\u751F\u6D3B"
- \u953B\u70BC\u3001\u8DD1\u6B65\u3001\u5065\u8EAB \u2192 "\u8FD0\u52A8"

## \u4EFB\u52A1 2\uFF1A\u5B9E\u4F53\u63D0\u53D6

\u4ECE\u65E5\u8BB0\u4E2D\u63D0\u53D6\u547D\u540D\u5B9E\u4F53\u3002

\u4EC0\u4E48\u662F\u547D\u540D\u5B9E\u4F53\uFF08\u5FC5\u987B\u540C\u65F6\u6EE1\u8DB3\uFF09\uFF1A
1. \u6709\u660E\u786E\u7684\u4E13\u6709\u540D\u79F0\uFF1A\u5982\u4EBA\u540D"\u5362\u664F"\u3001\u4EA7\u54C1\u578B\u53F7"H200"\u3001\u9879\u76EE\u540D"\u4E34\u6E2F\u5B9E\u9A8C\u5BA4\u7B97\u529B\u79DF\u8D41\u9879\u76EE"
2. \u662F\u4E00\u4E2A\u5177\u4F53\u7684\u4E8B\u7269\u6216\u4EBA\uFF0C\u4E0D\u662F\u62BD\u8C61\u6982\u5FF5\u6216\u6CDB\u6CDB\u7684\u63CF\u8FF0
3. \u8131\u79BB\u5F53\u524D\u4E0A\u4E0B\u6587\u4E5F\u80FD\u72EC\u7ACB\u5B58\u5728\u4E3A\u4E00\u4E2A\u77E5\u8BC6\u6761\u76EE

\u4EC0\u4E48\u4E0D\u662F\u547D\u540D\u5B9E\u4F53\uFF08\u7981\u6B62\u63D0\u53D6\uFF09\uFF1A
- \u62BD\u8C61\u6982\u5FF5\uFF1A\u5907\u4EFD\u65B9\u6848\u3001\u89E3\u51B3\u65B9\u6848\u3001\u8BA1\u5212\u3001\u8BA8\u8BBA\u3001\u610F\u89C1\u7B49
- \u6CDB\u6CDB\u7684\u540D\u8BCD\uFF1A\u516C\u53F8\u3001\u9879\u76EE\u3001\u7535\u8111\u3001\u6587\u6863\u7B49\uFF08\u6CA1\u6709\u5177\u4F53\u540D\u79F0\u7684\uFF09
- \u52A8\u8BCD\u6216\u52A8\u4F5C\uFF1A\u8BA8\u8BBA\u3001\u5F00\u4F1A\u3001\u5199\u4E86\u7B49
- \u4E2A\u4EBA\u60F3\u6CD5\u6216\u63A8\u6D4B\u4E2D\u672A\u547D\u540D\u7684\u4E1C\u897F
- \u65E5\u8BB0\u4E2D\u4EC5\u4EC5\u63D0\u53CA\u4F46\u6CA1\u6709\u4EFB\u4F55\u5177\u4F53\u4FE1\u606F\u7684\u8BCD\u8BED

\u91CD\u8981\u89C4\u5219\uFF1A
- **\u5B81\u7F3A\u6BCB\u6EE5**\uFF1A\u5982\u679C\u62FF\u4E0D\u51C6\uFF0C\u5C31\u4E0D\u8981\u63D0\u53D6\u3002confidence \u4F4E\u4E8E 0.6 \u7684\u4E0D\u8981\u52A0\u5165\u3002
- **\u6700\u591A\u63D0\u53D6 5 \u4E2A\u5B9E\u4F53**\uFF1A\u4F18\u5148\u63D0\u53D6\u6700\u5177\u4F53\u3001\u6700\u91CD\u8981\u7684\u3002
- **\u6309\u539F\u6587\u5B8C\u6574\u63D0\u53CA\u62BD\u53D6**\uFF1A\u5B9E\u4F53\u540D\u79F0\u5FC5\u987B\u5BF9\u5E94\u65E5\u8BB0\u4E2D\u7684\u5B8C\u6574\u63D0\u53CA\uFF0C\u4E0D\u8981\u628A\u4E00\u4E2A\u5B8C\u6574\u540D\u79F0\u62C6\u6210\u591A\u4E2A\u5B9E\u4F53\u3002\u4F8B\u5982\u201C\u4E0A\u6D77\u7535\u4FE1\u4FE1\u7F51\u90E8\u201D\u53EA\u63D0\u53D6\u201C\u4E0A\u6D77\u7535\u4FE1\u4FE1\u7F51\u90E8\u201D\uFF0C\u4E0D\u8981\u540C\u65F6\u63D0\u53D6\u201C\u4E0A\u6D77\u7535\u4FE1\u201D\u3002
- **\u957F\u5B9E\u4F53\u4F18\u5148**\uFF1A\u5982\u679C\u77ED\u540D\u79F0\u53EA\u662F\u957F\u540D\u79F0\u7684\u4E00\u90E8\u5206\uFF0C\u77ED\u540D\u79F0\u4E0D\u80FD\u4F5C\u4E3A\u672C\u6761\u65E5\u8BB0\u7684\u76F4\u63A5\u63D0\u53CA\uFF0C\u9664\u975E\u65E5\u8BB0\u4E2D\u53E6\u6709\u72EC\u7ACB\u53E5\u5B50\u660E\u786E\u63D0\u5230\u5B83\u3002
- **theme \u8C28\u614E\u4F46\u4E0D\u8981\u9057\u6F0F**\uFF1A\u547D\u540D\u8981\u50CF\u4E00\u4E2A"\u4E3B\u9898\u6807\u7B7E"\u800C\u975E\u4E8B\u4EF6\u63CF\u8FF0\uFF1A\u5982"H200\u4F9B\u8D27\u7D27\u5F20" \u2705
- **object \u5FC5\u987B\u6709\u5177\u4F53\u540D\u79F0**\uFF1A\u5982\u4EA7\u54C1\u578B\u53F7\u3001\u9879\u76EE\u540D\u79F0\u3001\u6587\u6863\u6807\u9898\u7B49

\u6BCF\u4E2A\u5B9E\u4F53\u5FC5\u987B\u6709\uFF1A
- "name": \u5B9E\u4F53\u540D\u79F0\uFF08\u5B57\u7B26\u4E32\uFF0C\u5FC5\u586B\uFF09
- "type": \u4EE5\u4E0B\u4E4B\u4E00\uFF1A"person"\uFF08\u4EBA\u7269\uFF09\u3001"object"\uFF08\u5BA2\u4F53\uFF09\u3001"theme"\uFF08\u4E3B\u9898\uFF09\uFF08\u5FC5\u586B\uFF09
- "subtype": \u5BA2\u4F53\u548C\u4E3B\u9898\u7684\u7EC6\u5206\u7C7B\u578B\uFF08\u53EF\u9009\uFF0C\u89C1\u4E0B\u65B9\u89C4\u5219\uFF09
- "confidence": 0.0 \u5230 1.0 \u4E4B\u95F4\u7684\u6570\u5B57\uFF08\u53EF\u9009\uFF0C\u9ED8\u8BA4 0.5\uFF09

${lg()}`,e&&(i+=`

`+e),i+=`

## \u8F93\u51FA\u683C\u5F0F

\u8FD4\u56DE\u4E00\u4E2A JSON \u5BF9\u8C61\uFF0C\u5305\u542B "domain"\uFF08\u5B57\u7B26\u4E32\uFF09\u548C "entities"\uFF08\u6570\u7EC4\uFF09\uFF1A
{
  "domain": "\u5DE5\u4F5C",
  "entities": [
    { "name": "\u5F20\u4E09", "type": "person", "confidence": 0.9 },
    { "name": "Q2\u8BA1\u5212", "type": "object", "subtype": "project", "confidence": 0.8 },
    { "name": "\u65B9\u5411\u53CD\u590D\u53D8\u5316", "type": "theme", "subtype": "friction", "confidence": 0.65 }
  ]
}

\u53EA\u8FD4\u56DE\u5408\u6CD5\u7684 JSON\u3002\u4E0D\u8981 markdown\uFF0C\u4E0D\u8981\u89E3\u91CA\uFF0C\u4E0D\u8981\u601D\u8003\u8FC7\u7A0B\u3002

\u65E5\u8BB0\u6587\u672C\uFF1A
${t}`,i}function NS(t){let e=["person","object","theme"];try{let n=t.trim(),i=n.indexOf('{"entities"');if(i>=0){let l=0,c=i;for(let u=i;u<n.length;u++)if(n[u]==="{")l++;else if(n[u]==="}"&&(l--,l===0)){c=u+1;break}n=n.slice(i,c),console.log('[TraceMind] parseLLM: extracted JSON via {"entities"} pattern:',n.substring(0,200))}else{let l=n.lastIndexOf(">");if(l>=0&&l>n.length*.3){let u=n.slice(l+1).trim();u.startsWith("{")&&(n=u)}console.log("[TraceMind] parseLLM: after tag removal (first 200):",n.substring(0,200));let c=n.match(/```(?:json)?\s*\n?([\s\S]*?)```/);if(c&&(n=c[1].trim()),!n.startsWith("{")){let u=n.indexOf("{"),d=n.lastIndexOf("}");u!==-1&&d!==-1&&(n=n.slice(u,d+1))}console.log("[TraceMind] parseLLM: final JSON (first 200):",n.substring(0,200))}let a=JSON.parse(n);if(console.log("[TraceMind] parseLLM: parsed JSON:",JSON.stringify(a).substring(0,200)),!a.entities||!Array.isArray(a.entities))return{entities:[]};let r=["\u5DE5\u4F5C","\u751F\u6D3B","\u5B66\u4E60","\u8FD0\u52A8","\u5176\u4ED6"],s=typeof a.domain=="string"&&r.includes(a.domain)?a.domain:void 0,o=[];for(let l of a.entities)!l.name||typeof l.name!="string"||l.name.trim()===""||e.includes(l.type)&&o.push({name:l.name.trim(),type:l.type,subtype:l.type==="object"&&l.subtype==="task"?"matter":l.subtype,confidence:typeof l.confidence=="number"?l.confidence:.5});return{domain:s,entities:o}}catch{return{entities:[]}}}async function c3(t,e){let n=e.provider||"openai",i={provider:n,apiKey:e.apiKey,model:e.model,baseUrl:e.baseUrl,enableThinking:e.enableThinking,reasoningEffort:e.reasoningEffort},a=ga(i);if(!a.valid)throw new Error(a.error);console.log("[TraceMind] LLM extract called, provider:",n,"baseUrl:",e.baseUrl,"model:",e.model);let r=LS(t,e.profileContext,e.extraContext);console.log("[TraceMind] LLM prompt:",r.substring(0,200));let s=Hs(i,[{role:"user",content:r}]);console.log("[TraceMind] LLM URL:",s.url);let o=await fetch(s.url,{method:s.method||"POST",headers:s.headers,body:s.body});if(console.log("[TraceMind] LLM response status:",o.status),!o.ok)throw await Us(o);let l=await o.json(),c=Sl(n,l);console.log("[TraceMind] LLM raw response:",c.content);let u=NS(c.content);return console.log("[TraceMind] LLM parsed: domain=",u.domain,"entities=",u.entities.length,u.entities),u}Ci();var PS={L0:30,L1:20,L2:10,L3:10},jS={P0:10,P1:5,P2:2};function $S(t){let e=PS[t.maturityLevel]??10;return t.attributePriority&&(e+=jS[t.attributePriority]??2),t.type==="new_entity"&&(e+=10),e}function v0(t,e,n,i){let a=[],r=typeof n.subtype=="string"?n.subtype:void 0,s=Gn(t,r,n),o=Vn(t,r);for(let l of o.p0)Qe(s,l)||a.push({type:"missing_attribute",entityName:"",entityType:t,maturityLevel:e,attributePriority:"P0",missingAttribute:l,score:0,description:`Missing P0 attribute: ${l}`});for(let l of o.p1)Qe(s,l)||a.push({type:"missing_attribute",entityName:"",entityType:t,maturityLevel:e,attributePriority:"P1",missingAttribute:l,score:0,description:`Missing P1 attribute: ${l}`});for(let l of o.p2)Qe(s,l)||a.push({type:"missing_attribute",entityName:"",entityType:t,maturityLevel:e,attributePriority:"P2",missingAttribute:l,score:0,description:`Missing P2 attribute: ${l}`});e!=="L0"&&i.length===0&&a.push({type:"missing_relation",entityName:"",entityType:t,maturityLevel:e,attributePriority:"P1",score:0,description:"No relations established"});for(let l of a)l.score=$S(l);return a.sort((l,c)=>c.score-l.score)}var US=5,u3={company:"\u8FD9\u4E2A**\u516C\u53F8/\u7EC4\u7EC7**\u80FD\u4ECB\u7ECD\u4E00\u4E0B\u5417\uFF1F\u6BD4\u5982\u4E1A\u52A1\u9886\u57DF\u3001\u5408\u4F5C\u5173\u7CFB\u3001\u76F8\u5173\u80CC\u666F\u7B49\u3002",project:"\u8FD9\u4E2A**\u9879\u76EE**\u80FD\u4ECB\u7ECD\u4E00\u4E0B\u5417\uFF1F\u6BD4\u5982\u5F53\u524D\u72B6\u6001\u3001\u65F6\u95F4\u8282\u70B9\u3001\u76F8\u5173\u80CC\u666F\u7B49\u3002",matter:"\u8FD9\u4E2A**\u4E8B\u9879**\u80FD\u4ECB\u7ECD\u4E00\u4E0B\u5417\uFF1F\u6BD4\u5982\u5F53\u524D\u72B6\u6001\u3001\u4E0B\u4E00\u6B65\u3001\u6240\u5C5E\u9879\u76EE\u3001\u76F8\u5173\u80CC\u666F\u7B49\u3002",task:"\u8FD9\u4E2A**\u4E8B\u9879**\u80FD\u4ECB\u7ECD\u4E00\u4E0B\u5417\uFF1F\u6BD4\u5982\u5F53\u524D\u72B6\u6001\u3001\u4E0B\u4E00\u6B65\u3001\u6240\u5C5E\u9879\u76EE\u3001\u76F8\u5173\u80CC\u666F\u7B49\u3002",product:"\u8FD9\u4E2A**\u4EA7\u54C1**\u80FD\u4ECB\u7ECD\u4E00\u4E0B\u5417\uFF1F\u6BD4\u5982\u5F53\u524D\u72B6\u6001\u3001\u5173\u952E\u7279\u6027\u3001\u76F8\u5173\u80CC\u666F\u7B49\u3002",technology:"\u8FD9\u4E2A**\u6280\u672F**\u80FD\u4ECB\u7ECD\u4E00\u4E0B\u5417\uFF1F\u6BD4\u5982\u5F53\u524D\u72B6\u6001\u3001\u4E3B\u8981\u7528\u9014\u3001\u76F8\u5173\u80CC\u666F\u7B49\u3002",document:"\u8FD9\u4E2A**\u6587\u6863**\u80FD\u4ECB\u7ECD\u4E00\u4E0B\u5417\uFF1F\u6BD4\u5982\u5F53\u524D\u72B6\u6001\u3001\u4E3B\u8981\u7528\u9014\u3001\u76F8\u5173\u80CC\u666F\u7B49\u3002",location:"\u8FD9\u4E2A**\u5730\u70B9**\u80FD\u4ECB\u7ECD\u4E00\u4E0B\u5417\uFF1F\u6BD4\u5982\u5728\u54EA\u91CC\u3001\u6709\u4EC0\u4E48\u7279\u522B\u4E4B\u5904\u7B49\u3002"},d3={friction:"\u8FD9\u4E2A**\u6469\u64E6**\u80FD\u804A\u804A\u5417\uFF1F\u6BD4\u5982\u662F\u4EC0\u4E48\u5BFC\u81F4\u7684\u3001\u6301\u7EED\u591A\u4E45\u4E86\u3001\u5F71\u54CD\u6709\u591A\u5927\uFF1F",goal:"\u8FD9\u4E2A**\u76EE\u6807**\u80FD\u804A\u804A\u5417\uFF1F\u6BD4\u5982\u76EE\u524D\u8FDB\u5C55\u3001\u4E0B\u4E00\u6B65\u8BA1\u5212\u3001\u6709\u4EC0\u4E48\u963B\u7887\uFF1F",judgment:"\u8FD9\u4E2A**\u5224\u65AD**\u80FD\u804A\u804A\u5417\uFF1F\u6BD4\u5982\u57FA\u4E8E\u4EC0\u4E48\u5F62\u6210\u7684\u3001\u6709\u591A\u5927\u628A\u63E1\uFF1F",idea:"\u8FD9\u4E2A**\u60F3\u6CD5**\u80FD\u804A\u804A\u5417\uFF1F\u6BD4\u5982\u600E\u4E48\u4EA7\u751F\u7684\u3001\u6709\u6CA1\u6709\u66F4\u5177\u4F53\u7684\u601D\u8003\uFF1F"};function p3(t,e){return t.type==="new_entity"?t.entityType==="object"&&e&&u3[e]?`${t.entityName} ${u3[e]}`:t.entityType==="object"?`${t.entityName} \u80FD\u4ECB\u7ECD\u4E00\u4E0B\u5417\uFF1F\u6BD4\u5982\u5F53\u524D\u72B6\u6001\u3001\u65F6\u95F4\u8282\u70B9\u3001\u76F8\u5173\u80CC\u666F\u7B49\u3002`:t.entityType==="theme"&&e&&d3[e]?`${t.entityName} ${d3[e]}`:t.entityType==="theme"?`${t.entityName} \u80FD\u804A\u804A\u5417\uFF1F\u6BD4\u5982\u8FD9\u4E2A\u60C5\u51B5\u5F71\u54CD\u6709\u591A\u5927\u3001\u6301\u7EED\u591A\u4E45\u4E86\uFF1F`:t.entityType==="person"?`${t.entityName} \u662F\u8C01\uFF1F\u80FD\u4ECB\u7ECD\u4E00\u4E0B\u5417\uFF1F\u6BD4\u5982\u5728\u54EA\u5BB6\u516C\u53F8\u3001\u4EC0\u4E48\u804C\u4F4D\u3001\u548C\u4F60\u7684\u5173\u7CFB\u7B49\u3002`:`${t.entityName} \u662F\u4EC0\u4E48\uFF1F`:t.type==="missing_attribute"&&t.missingAttribute?{company:t.entityName+" \u5728\u54EA\u4E2A\u516C\u53F8\u6216\u7EC4\u7EC7\u5DE5\u4F5C\uFF1F",role:t.entityName+" \u7684\u804C\u4F4D\u6216\u89D2\u8272\u662F\u4EC0\u4E48\uFF1F",relationship_to_user:"\u4F60\u548C "+t.entityName+" \u662F\u4EC0\u4E48\u5173\u7CFB\uFF1F",responsibility:t.entityName+" \u8D1F\u8D23\u4EC0\u4E48\u5DE5\u4F5C\uFF1F",workingStyle:t.entityName+" \u7684\u534F\u4F5C\u98CE\u683C\u662F\u600E\u6837\u7684\uFF1F",subtype:t.entityName+" \u662F\u4EC0\u4E48\u7C7B\u578B\uFF1F\u6BD4\u5982\u9879\u76EE\u3001\u4E8B\u9879\u3001\u4EA7\u54C1\u7B49\uFF1F",stage:t.entityName+" \u5F53\u524D\u5904\u4E8E\u4EC0\u4E48\u9636\u6BB5\uFF1F",owner:t.entityName+" \u7684\u8D1F\u8D23\u4EBA\u662F\u8C01\uFF1F",taskStatus:t.entityName+" \u5F53\u524D\u7684\u72B6\u6001\u662F\u4EC0\u4E48\uFF1F",nextAction:t.entityName+" \u7684\u4E0B\u4E00\u6B65\u884C\u52A8\u662F\u4EC0\u4E48\uFF1F",dueDate:t.entityName+" \u6709\u622A\u6B62\u65E5\u671F\u5417\uFF1F",assignee:t.entityName+" \u7531\u8C01\u8D1F\u8D23\uFF1F",parentProject:t.entityName+" \u5C5E\u4E8E\u54EA\u4E2A\u9879\u76EE\uFF1F",useCase:t.entityName+" \u7684\u4E3B\u8981\u7528\u9014\u662F\u4EC0\u4E48\uFF1F",adoptionStatus:t.entityName+" \u5F53\u524D\u91C7\u7528\u72B6\u6001\u5982\u4F55\uFF1F",description:"\u5173\u4E8E "+t.entityName+" \u6709\u4EC0\u4E48\u8865\u5145\u4FE1\u606F\uFF1F",trigger:t.entityName+" \u7684\u89E6\u53D1\u6761\u4EF6\u662F\u4EC0\u4E48\uFF1F",impact:t.entityName+" \u6709\u4EC0\u4E48\u5F71\u54CD\uFF1F",frequency:t.entityName+" \u51FA\u73B0\u7684\u9891\u7387\u5982\u4F55\uFF1F",possibleCause:t.entityName+" \u53EF\u80FD\u7684\u539F\u56E0\u662F\u4EC0\u4E48\uFF1F",claim:t.entityName+" \u7684\u5177\u4F53\u4E3B\u5F20\u662F\u4EC0\u4E48\uFF1F",judgmentConfidence:"\u4F60\u5BF9 "+t.entityName+" \u7684\u786E\u4FE1\u5EA6\u5982\u4F55\uFF1F",evidence:t.entityName+" \u6709\u4EC0\u4E48\u8BC1\u636E\u652F\u6301\uFF1F",counterEvidence:t.entityName+" \u6709\u53CD\u9762\u7684\u8BC1\u636E\u5417\uFF1F",desiredOutcome:t.entityName+" \u671F\u671B\u7684\u7ED3\u679C\u662F\u4EC0\u4E48\uFF1F",currentState:t.entityName+" \u5F53\u524D\u8FDB\u5C55\u5982\u4F55\uFF1F",coreIdea:t.entityName+" \u7684\u6838\u5FC3\u60F3\u6CD5\u662F\u4EC0\u4E48\uFF1F"}[t.missingAttribute]||`\u5173\u4E8E ${t.entityName} \u7684 ${t.missingAttribute} \u4FE1\u606F\u662F\u4EC0\u4E48\uFF1F`:t.type==="missing_relation"?`${t.entityName} \u548C\u4EC0\u4E48\u5176\u4ED6\u5B9E\u4F53\u6709\u5173\u8054\uFF1F`:t.type==="recurring_pattern"?`${t.entityName} \u5DF2\u7ECF\u591A\u6B21\u51FA\u73B0\uFF0C\u5B83\u4EE3\u8868\u4EC0\u4E48\uFF1F`:`\u8BF7\u63D0\u4F9B\u66F4\u591A\u5173\u4E8E ${t.entityName} \u7684\u4FE1\u606F\u3002`}function HS(t,e){for(let[n,i]of e)if(i.cardType===t.type&&i.name===t.name)return{cardId:n,maturity:i.maturity};return null}function da(t){return t.trim().toLowerCase()}function YS(t,e){if(!t||!e)return 0;let n=Array.from({length:t.length+1},()=>Array(e.length+1).fill(0)),i=0;for(let a=1;a<=t.length;a++)for(let r=1;r<=e.length;r++)t[a-1]===e[r-1]&&(n[a][r]=n[a-1][r-1]+1,i=Math.max(i,n[a][r]));return i}function VS(t,e=[],n=3){let i=da(t.name);if(!i)return[];let a=[];for(let r of e){if(r.cardType!==t.type)continue;let s=[r.name,...r.aliases||[]].map(da).filter(Boolean);if(s.some(c=>c===i))continue;let o=0,l="";for(let c of s){if(i.length>=3&&c.includes(i)){let p=i.length/Math.max(i.length,c.length);o=Math.max(o,.82+p*.1),l="\u5F53\u524D\u63D0\u53CA\u662F\u5DF2\u6709\u6863\u6848\u540D\u79F0\u7684\u4E00\u90E8\u5206";continue}if(c.length>=3&&i.includes(c)){let p=c.length/Math.max(i.length,c.length),f=c.length<=4&&i.length>c.length?p:.7+p*.1;o=Math.max(o,f),l="\u5DF2\u6709\u6863\u6848\u540D\u79F0\u662F\u5F53\u524D\u63D0\u53CA\u7684\u4E00\u90E8\u5206";continue}let u=YS(i,c),d=u>=4?u/Math.min(i.length,c.length)*.75+u/Math.max(i.length,c.length)*.2:0;d>o&&(o=d,l="\u540D\u79F0\u6709\u8F83\u957F\u91CD\u53E0\u7247\u6BB5")}o>=.45&&a.push({id:r.id,name:r.name,type:r.cardType,filePath:r.filePath,score:Number(o.toFixed(2)),reason:l})}return a.sort((r,s)=>s.score-r.score||r.name.length-s.name.length).slice(0,n)}function GS(t,e=[]){let n=da(t.name);if(!n)return null;for(let i of e)if(i.cardType===t.type&&da(i.name)===n)return i;for(let i of e)if(i.cardType===t.type&&(i.aliases||[]).some(a=>da(a)===n))return i;return null}function qS(t,e=[]){let n=[],i=new Map;for(let a of t){let r=GS(a,e),s=r?{...a,name:r.name,type:r.cardType,subtype:a.subtype||r.subtype}:a,o=`${s.type}:${da(s.name)}`,l=i.get(o);if(l===void 0){i.set(o,n.length),n.push(s);continue}let c=n[l];n[l]={...c,confidence:Math.max(c.confidence??.5,s.confidence??.5),subtype:c.subtype||s.subtype}}return n}function XS(t,e){let n=da(t);return n?e.filter(i=>{let a=da(i.name);return!!a&&n.includes(a)}):[]}function KS(t){return t.replace(/!?\[\[([^\]\|#]+(?:\.(?:md|pdf|docx?|xlsx?|pptx?|png|jpe?g|gif|webp|svg|txt|csv|json|html?))(?:#[^\]\|]+)?)(?:\|[^\]]*)?\]\]/gi," ").replace(/\[[^\]]+\]\((?:https?:\/\/|file:\/\/|\/|~\/|[A-Za-z]:\\|(?:TraceMind|Daily|Person|Object|Theme|Attachments|attachments|outputs|explorations|files|Files|assets|Assets)\/)[^)]+\)/gi," ").replace(/\bhttps?:\/\/[^\s\]\)）"'，。；;]+/gi," ").replace(/\bfile:\/\/[^\s\]\)）"'，。；;]+/gi," ").replace(/(?:^|[\s（(:：])(?:~\/|\/Users\/|\/Volumes\/|\/private\/|\/tmp\/)[^\s\]\)）"'，。；;]+/gi," ").replace(/\b[A-Za-z]:\\[^\s\]\)）"'，。；;]+/g," ").replace(/\b(?:TraceMind|Daily|Person|Object|Theme|Attachments|attachments|outputs|explorations|files|Files|assets|Assets)\/[^\s\]\)）"'，。；;]+(?:\.(?:md|pdf|docx?|xlsx?|pptx?|png|jpe?g|gif|webp|svg|txt|csv|json|html?))(?:#[^\s\]\)）"'，。；;]+)?/gi," ").replace(/[ \t]{2,}/g," ").replace(/\n{3,}/g,`

`).trim()}var pl=class{static analyzeBlock(e,n){return console.warn("[TraceMind] analyzeBlock (sync) is deprecated, use analyzeBlockAsync for LLM extraction"),{entities:[],newEntities:[],existingEntities:[],hasClarifications:!1,gapCount:0}}static async analyzeBlockAsync(e,n,i,a,r){let s=[],o;if(i&&ga({provider:i.provider||"openai",apiKey:i.apiKey,model:i.model,baseUrl:i.baseUrl}).valid){console.log("[TraceMind] LLM config:",{baseUrl:i.baseUrl,model:i.model,hasApiKey:!!i.apiKey});try{let u={...i,extraContext:r,profileContext:i.profileContext},d=KS(e),p=await c3(d,u);console.log("[TraceMind] LLM extracted:",p.entities.length,p.entities,"domain:",p.domain);let f=XS(d,p.entities.map(y=>({...y})));f.length!==p.entities.length&&console.log("[TraceMind] LLM extracted entities filtered by source mentions:",{before:p.entities.map(y=>y.name),after:f.map(y=>y.name)}),s=qS(f,a),o=p.domain}catch(u){console.warn("[TraceMind] LLM extraction failed:",u.message)}}else console.log("[TraceMind] No LLM config provided, skipping extraction");let c=ZS(s,n,a);return c.domainCategory=o,c}static summarizeResult(e){if(e.entities.length===0)return"\u672A\u68C0\u6D4B\u5230\u9700\u8981\u5173\u6CE8\u7684\u5B9E\u4F53\u3002";let n=[];if(e.newEntities.length>0){let i=e.newEntities.map(a=>a.name).join("\u3001");n.push(`\u53D1\u73B0 ${e.newEntities.length} \u4E2A\u65B0\u5B9E\u4F53\uFF1A${i}`)}if(e.existingEntities.length>0){let i=e.existingEntities.map(a=>a.name).join("\u3001");n.push(`\u63D0\u53CA ${e.existingEntities.length} \u4E2A\u5DF2\u6709\u5B9E\u4F53\uFF1A${i}`)}return e.hasClarifications&&n.push("\u9700\u8981\u8FDB\u4E00\u6B65\u6F84\u6E05\u4FE1\u606F\u3002"),n.join(`
`)}};function ZS(t,e,n=[]){let i=[];for(let o of t){let l=HS(o,e),c=o.subtype?{subtype:o.subtype}:{},u=l?.maturity??m0(o.type,c),d=i3(o.type,c,0),p=[];if(l){let x=v0(o.type,u,c,[]);p.push(...x)}else{p.push({type:"new_entity",entityName:o.name,entityType:o.type,maturityLevel:"L0",attributePriority:"P0",score:40,description:`New entity: ${o.name}`});let x=v0(o.type,"L0",c,[]);p.push(...x)}let f=p.slice(0,2).map(x=>p3(x,o.subtype)),y={...o,isNew:!l,existingCardId:l?.cardId,maturity:u,priorityScore:d,clarificationQuestions:f,knowledgeGaps:p,similarCandidates:l?[]:VS(o,n)};i.push(y)}i.sort((o,l)=>o.isNew!==l.isNew?o.isNew?-1:1:l.priorityScore-o.priorityScore);let a=i.slice(0,US),r=a.flatMap(o=>o.knowledgeGaps??[]),s=r.sort((o,l)=>l.score-o.score)[0];return{entities:a,newEntities:a.filter(o=>o.isNew),existingEntities:a.filter(o=>!o.isNew),hasClarifications:a.some(o=>o.isNew),gapCount:r.length,firstQuestion:s?p3(s):void 0}}var QS=or.load,JS=new Set(["L0","L1","L2","L3"]),b0=new Set(["id","name","type","subtype","maturity","confidence","aliases","createdAt","lastUpdated","lifecycle","importance","userId","relatedPeople","relatedObjects","relatedThemes","evidenceEntryIds","interactions","filePath","relationCount","summary"]);function pa(t,e){let n=WS(t),i=n?.name;i||(i=e.split("/").pop()?.replace(".md","")||"");let a=n?.type||"person",r=n?.maturity,s=r&&JS.has(r)?r:"L0",o=typeof n?.confidence=="number"?n.confidence:.5,l=Array.isArray(n?.aliases)?n.aliases:[],c=n?.summary,u=n?.subtype,d={};if(n)for(let[x,E]of Object.entries(n))!b0.has(x)&&E!=null&&(d[x]=E);Dl(a,u,n||{},d);let p=Gn(a,u,d),f=c||p.summary||d.context||void 0,y={};for(let[x,E]of Object.entries(p))!b0.has(x)&&E!=null&&(y[x]=E);for(let[x,E]of Object.entries(d))!b0.has(x)&&E!=null&&(!(x in p)||p[x]==null)&&(y[x]=E);return{id:n?.id||dl(i),name:i,cardType:a,type:tA(a),subtype:u,summary:f,maturity:s,confidence:o,filePath:e,aliases:l,relationCount:0,lastUpdated:n?.lastUpdated||new Date().toISOString(),metadata:Object.keys(y).length>0?y:void 0}}function f3(t){let e=[];for(let n of t)if(n.content.trim())try{let i=pa(n.content,n.path);e.push(i)}catch{}return{entries:e,lastRebuild:new Date().toISOString()}}function WS(t){let e=t.trim();if(!e.startsWith("---"))return null;let n=e.indexOf("---",3);if(n===-1)return null;let i=e.slice(3,n).trim();return QS(i)||null}function tA(t){switch(t){case"person":return"person";case"object":return"thing";case"theme":return"idea";default:return"thing"}}function h3(t,e){let n=e.trim().toLowerCase();return n&&t.entries.find(i=>i.name.toLowerCase()===n||i.aliases.some(a=>a.toLowerCase()===n))||null}function ur(t,e){let n=t.entries.findIndex(a=>a.id===e.id),i=[...t.entries];return n>=0?i[n]=e:i.push(e),{entries:i,lastRebuild:t.lastRebuild}}function g3(t){return JSON.stringify(t,null,2)}function m3(t){let e=JSON.parse(t);return{entries:e.entries||[],lastRebuild:e.lastRebuild||new Date().toISOString()}}Hn();var Rs="TraceMind/index/entity-index.json";async function y3(t,e){await Ne(t,Rs);let n=g3(e),i=t.vault.getFileByPath(Rs);if(i)await t.vault.modify(i,n);else try{await t.vault.create(Rs,n)}catch(a){let r=t.vault.getFileByPath(Rs);if(r){await t.vault.modify(r,n);return}if(a.message.includes("File already exists")){await t.vault.adapter.write(Rs,n);return}throw a}}async function x3(t){let e=t.vault.getFileByPath(Rs);if(!e)return null;try{return m3(await t.vault.read(e))}catch{return null}}function v3(t){let e=JSON.parse(t);return{blockId:e.blockId,content:e.content,messages:e.messages||[],analysisResult:e.analysisResult,clarificationPhase:e.clarificationPhase,clarificationIndex:e.clarificationIndex,skippedEntityNames:Array.isArray(e.skippedEntityNames)?e.skippedEntityNames:[],createdAt:e.createdAt,updatedAt:e.updatedAt,currentPhase:e.currentPhase||"analysis"}}var eA="TraceMind/sessions";function k0(t){return`${eA}/${t}.json`}function b3(t){return v3(t)}var En=require("obsidian");Hn();var dr=["Daily","Person","Object","Theme","TraceMind","TraceMind/sessions","TraceMind/index","TraceMind/insights","TraceMind/tasks","TraceMind/tasks/runs"],he="TraceMind/PROFILE.md";function k3(t){let e=[];for(let n of dr)t.exists(n)||e.push(`\u76EE\u5F55: ${n}`);return t.exists(he)||e.push(`\u6863\u6848: ${he}`),e}function E0(t){let e=[];for(let i of dr){let a=t.getType(i);a===null?e.push({type:"missing_dir",path:i,expected:"folder",actual:"unknown",label:`\u76EE\u5F55\u7F3A\u5931: ${i}`,repairable:!0}):a!=="folder"&&e.push({type:"wrong_type",path:i,expected:"folder",actual:a,label:`\u8DEF\u5F84\u7C7B\u578B\u9519\u8BEF: ${i}\uFF08\u5E94\u4E3A\u76EE\u5F55\uFF0C\u5B9E\u9645\u4E3A${a==="file"?"\u6587\u4EF6":"\u672A\u77E5"}\uFF09`,repairable:!1})}let n=t.getType(he);return n===null?e.push({type:"missing_file",path:he,expected:"file",actual:"unknown",label:`\u6863\u6848\u7F3A\u5931: ${he}`,repairable:!0}):n!=="file"&&e.push({type:"wrong_type",path:he,expected:"file",actual:n,label:`\u8DEF\u5F84\u7C7B\u578B\u9519\u8BEF: ${he}\uFF08\u5E94\u4E3A\u6587\u4EF6\uFF0C\u5B9E\u9645\u4E3A${n==="folder"?"\u76EE\u5F55":"\u672A\u77E5"}\uFF09`,repairable:!1}),e}async function w0(t){try{return await t.stat(he)===null}catch{return!0}}function E3(t,e){new C0(t,e).open()}var nA=`---
name: ""
occupation: ""
company: ""
city: ""
skills: []
roles: []
relationships: []
goals: []
focusAreas: []
---

# \u7528\u6237\u6863\u6848

## \u57FA\u672C\u4FE1\u606F
- \u59D3\u540D\uFF1A
- \u516C\u53F8/\u7EC4\u7EC7\uFF1A
- \u804C\u4F4D/\u804C\u4E1A\uFF1A
- \u57CE\u5E02\uFF1A

## \u6280\u80FD\u4E0E\u4E13\u4E1A
- _\u6682\u65E0_

## \u89D2\u8272\u4E0E\u5173\u7CFB
- _\u6682\u65E0_

## \u76EE\u6807\u4E0E\u8BA1\u5212
- _\u6682\u65E0_

## \u5173\u6CE8\u9886\u57DF
- _\u6682\u65E0_
`,C0=class extends En.Modal{onComplete;dirsCreated=!1;profileCreated=!1;statusEl=null;constructor(e,n){super(e),this.onComplete=n}onOpen(){let{contentEl:e}=this;e.createEl("h2",{text:"\u6B22\u8FCE\u4F7F\u7528 TraceMind"}),e.createEl("p",{text:"TraceMind \u5C06\u5E2E\u52A9\u4F60\u4ECE\u65E5\u8BB0\u4E2D\u81EA\u52A8\u8BC6\u522B\u548C\u6574\u7406\u77E5\u8BC6\u5B9E\u4F53\u3002\u8BF7\u5148\u5B8C\u6210\u521D\u59CB\u8BBE\u7F6E\u3002"}),this.statusEl=e.createEl("div",{cls:"tracemind-first-start-status",attr:{style:"color: #e74c3c; min-height: 1.5em; margin: 8px 0;"}}),e.createEl("h3",{text:"\u521D\u59CB\u5316 Vault \u7ED3\u6784"}),new En.Setting(e).setName("\u521B\u5EFA\u77E5\u8BC6\u76EE\u5F55\u548C\u7528\u6237\u6863\u6848").setDesc("\u521B\u5EFA Daily\u3001Person\u3001Object\u3001Theme\u3001TraceMind \u7B49\u76EE\u5F55\uFF0C\u4EE5\u53CA\u7528\u6237\u6863\u6848\u6587\u4EF6\u3002").addButton(n=>{n.setButtonText("\u521D\u59CB\u5316"),n.onClick(async()=>{await this.initializeAll(),n.setButtonText("\u5DF2\u5B8C\u6210"),n.setDisabled(!0),this.clearStatus(),new En.Notice("Vault \u7ED3\u6784\u521D\u59CB\u5316\u5B8C\u6210")})}),e.createEl("h3",{text:"\u5B8C\u6210\u8BBE\u7F6E"}),new En.Setting(e).setName("\u786E\u8BA4\u5B8C\u6210").setDesc("\u6240\u6709\u76EE\u5F55\u548C\u6863\u6848\u521B\u5EFA\u5B8C\u6210\u540E\uFF0C\u70B9\u51FB\u5B8C\u6210\u5F00\u59CB\u4F7F\u7528 TraceMind").addButton(n=>{n.setButtonText("\u5B8C\u6210"),n.setCta(),n.onClick(async()=>{let i=this.validateStructure();if(i.length>0){this.showStatus(`\u4EE5\u4E0B\u9879\u76EE\u7F3A\u5931\uFF0C\u8BF7\u5148\u70B9\u51FB"\u521D\u59CB\u5316"\uFF1A
`+i.map(a=>`  - ${a}`).join(`
`));return}this.close(),await this.onComplete()})})}async initializeAll(){for(let n of dr)await xr(this.app,n);this.dirsCreated=!0,this.app.vault.getAbstractFileByPath(he)?this.profileCreated=!0:(await this.app.vault.create(he,nA),this.profileCreated=!0)}validateStructure(){return k3({exists:e=>this.app.vault.getAbstractFileByPath(e)!==null})}showStatus(e){this.statusEl&&(this.statusEl.style.whiteSpace="pre-line",this.statusEl.setText(e))}clearStatus(){this.statusEl&&this.statusEl.setText("")}onClose(){let{contentEl:e}=this;e.empty()}};function w3(t,e,n,i,a){new S0(t,e,n,i,a).open()}var S0=class extends En.Modal{issues;onRepair;onSkip;onComplete;listEl=null;constructor(e,n,i,a,r){super(e),this.issues=n,this.onRepair=i,this.onSkip=a,this.onComplete=r}onOpen(){let{contentEl:e}=this;e.createEl("h2",{text:"TraceMind Vault \u7ED3\u6784\u9700\u8981\u4FEE\u6B63"}),e.createEl("p",{text:"\u68C0\u6D4B\u5230\u5FC5\u8981\u76EE\u5F55\u6216\u6863\u6848\u7F3A\u5931/\u5F02\u5E38\uFF1A"}),this.listEl=e.createEl("ul"),this.renderIssues(),new En.Setting(e).addButton(n=>{n.setButtonText("\u4FEE\u6B63").setCta().onClick(async()=>{this.issues=await this.onRepair(),this.issues.length===0?(new En.Notice("TraceMind Vault \u7ED3\u6784\u5DF2\u4FEE\u6B63"),this.close(),await this.onComplete()):this.renderIssues()})}).addButton(n=>{n.setButtonText("\u6682\u4E0D\u4FEE\u6B63").onClick(()=>{new En.Notice("\u7ED3\u6784\u672A\u4FEE\u6B63\uFF0C\u90E8\u5206\u529F\u80FD\u53EF\u80FD\u4E0D\u53EF\u7528"),this.close(),this.onSkip()})})}renderIssues(){if(this.listEl){this.listEl.empty();for(let e of this.issues){let n=this.listEl.createEl("li",{text:e.label});e.repairable||n.createEl("span",{text:"\uFF08\u9700\u624B\u52A8\u5904\u7406\uFF09",cls:"tracemind-repair-warning",attr:{style:"color: #e74c3c"}})}}}onClose(){this.contentEl.empty()}};var iA=/^---\n([\s\S]*?)\n---\n?/;function C3(t){let e=t.match(iA);if(!e)return null;let n=e[1],i=t.slice(e[0].length),a={};for(let c of n.split(`
`)){let u=c.indexOf(":");if(u===-1)continue;let d=c.slice(0,u).trim(),p=c.slice(u+1).trim();d&&p&&(a[d]=p)}let r=a.date,s=a.contentHash,o=a.generatedAt,l=parseInt(a.blockCount||"0",10);return!r||!s||!o||!i.trim()?null:{date:r,content:i.trim(),contentHash:s,generatedAt:o,blockCount:l}}function S3(t){return`${["---",`date: ${t.date}`,`generatedAt: ${t.generatedAt}`,`contentHash: ${t.contentHash}`,`blockCount: ${t.blockCount}`,"---"].join(`
`)}

${t.content}
`}function zu(t){return`TraceMind/insights/${t}.md`}Hn();async function A3(t,e){let n=zu(e.date);await Ne(t,n);let i=S3(e),a=t.vault.getFileByPath(n);return a?await t.vault.modify(a,i):await t.vault.create(n,i),n}Ci();var T3=/^###\s+(\d{2}:\d{2})\s+(.+)$/m,aA=/<!--\s*TM:([a-z0-9]+)\s*-->/;function rA(){return Math.random().toString(16).slice(2,10).padStart(8,"0")}function A0(t){let e=[],n=t.split(`
`),i=0;for(;i<n.length;){let r=n[i].match(T3);if(r){let s=r[1],l=r[2].trim().split(/\s+/).filter(d=>d.startsWith("#")).map(d=>d.slice(1));i++;let c=[],u=[];for(;i<n.length;){let d=n[i];if(d.match(T3))break;if(!d.trim()){i++;continue}let p=d.match(aA);if(p){let f=p[1];e.push({timestamp:s,content:c.join(`
`).trim(),tags:l,blockId:f,children:u}),i++;break}d.startsWith("- ")||d.startsWith("* ")?u.push(d.replace(/^[-*]\s+/,"")):c.push(d),i++}if(c.length>0||u.length>0){let d=e[e.length-1];(!d||d.timestamp!==s)&&e.push({timestamp:s,content:c.join(`
`).trim(),tags:l,blockId:rA(),children:u})}}else i++}return e}function M3(t,e){if(t.length<=1)return[];let n=e&&t.includes(e)?e:t[0];return t.filter(i=>i!==n)}var sA=dr,Lu=class extends Ke.Plugin{settings;userProfile={...cr};analysisService=pl;entityIndex={entries:[],lastRebuild:""};entityManager;sessionManager;aiProvider;taskStore;aiAnalysisView;blockEditorView;calendarView;explorationCanvasView;taskBoardView;async onload(){console.log("TraceMind: loading...");try{await this.loadSettings(),this.userProfile=await l3(this.app),sg(),this.entityManager=new T0(this.app,this),this.sessionManager=new M0(this.app),this.aiProvider=new _0(this),this.taskStore=new Mu(this.app),await this.sessionManager.initialize(),await this.taskStore.initialize(),this.registerView(Yn,e=>(this.blockEditorView=new Ks(e,this),this.blockEditorView)),this.registerView(vr,e=>(this.aiAnalysisView=new Fl(e,this),this.aiAnalysisView)),this.registerView(Js,e=>(this.calendarView=new zl(e,this),this.calendarView.setOnDateClick(n=>this.navigateToDate(n)),this.calendarView)),this.registerView(ar,e=>(this.explorationCanvasView=new la(e,this),this.explorationCanvasView)),this.registerView(rl,e=>(this.taskBoardView=new Ss(e,this),this.taskBoardView)),this.addSettingTab(new Al(this.app,this)),(0,Ke.addIcon)(ma,jh),this.addRibbonIcon(ma,"\u6253\u5F00 TraceMind",()=>{this.openTracemindView()}),this.addRibbonIcon("calendar","\u6253\u5F00\u65E5\u5386",()=>{this.openCalendarView()}),this.addCommand({id:"open-tracemind",name:"\u6253\u5F00 TraceMind \u89C6\u56FE",callback:()=>this.openTracemindView()}),this.addCommand({id:"open-calendar",name:"\u6253\u5F00\u65E5\u5386",callback:()=>this.openCalendarView()}),this.addCommand({id:"open-exploration-canvas",name:"TraceMind: \u6253\u5F00\u601D\u8003\u63A2\u7D22\u767D\u677F",callback:()=>this.openExplorationCanvas()}),this.addCommand({id:"open-action-board",name:"TraceMind: \u6253\u5F00\u884C\u52A8\u770B\u677F",callback:()=>this.openActionBoard()}),this.addCommand({id:"analyze-block",name:"\u5206\u6790\u5F53\u524D\u65E5\u8BB0\u5757",callback:()=>this.analyzeCurrentBlock()}),this.addCommand({id:"rebuild-index",name:"\u91CD\u5EFA\u5B9E\u4F53\u7D22\u5F15",callback:()=>this.rebuildEntityIndexCommand()}),this.registerEvent(this.app.workspace.on("editor-change",()=>{this.onEditorChange()})),this.registerEvent(this.app.workspace.on("file-open",e=>{this.maybeOpenTraceMindCanvas(e)})),this.registerEvent(this.app.workspace.on("active-leaf-change",()=>{this.syncTraceMindSidebars().catch(console.error)})),console.log("TraceMind: loaded successfully"),await w0(this.app.vault.adapter)?E3(this.app,async()=>{await this.ensureVaultStructure(),await this.rebuildEntityIndex()}):(await this.ensureVaultStructure(),await this.initializeEntityIndex()),this.scheduleVaultStructureCheck(),this.app.workspace.onLayoutReady(()=>{this.pruneDuplicateAIAnalysisPanels().then(()=>this.syncTraceMindSidebars()).catch(console.error)})}catch(e){console.error("TraceMind: Failed to load",e),new Ke.Notice("TraceMind \u52A0\u8F7D\u5931\u8D25: "+e.message)}}onunload(){console.log("TraceMind: unloading...")}async loadSettings(){let e=await this.loadData();this.settings={...yh,...e};for(let n of this.settings.providers)n.providerType||(n.baseUrl?.includes("anthropic.com")?n.providerType="anthropic":n.baseUrl?.includes("localhost:11434")||n.baseUrl?.includes("127.0.0.1:11434")?n.providerType="ollama":n.providerType="openai")}async saveSettings(){await this.saveData(this.settings)}async ensureVaultStructure(){for(let e of sA)await xr(this.app,e);console.log("TraceMind: vault structure ensured")}autoAnalysisTimer=null;onEditorChange(){this.autoAnalysisTimer&&clearTimeout(this.autoAnalysisTimer),this.autoAnalysisTimer=setTimeout(()=>{this.autoAnalysisTimer=null},2e3)}async rebuildEntityIndexCommand(){await this.rebuildEntityIndex(),new Ke.Notice(`\u5B9E\u4F53\u7D22\u5F15\u5DF2\u91CD\u5EFA: ${this.entityIndex.entries.length} \u4E2A\u5B9E\u4F53`)}async initializeEntityIndex(){let e=await x3(this.app);if(e&&e.entries.length>0){this.entityIndex=e,console.log(`TraceMind: loaded entity index with ${e.entries.length} entries from file`);return}await this.rebuildEntityIndex({persist:!0})}async rebuildEntityIndex(e={persist:!0}){let n=["Person","Object","Theme"],i=[];for(let a of n)try{let r=await this.app.vault.adapter.list(a+"/");for(let s of r.files)if(s.endsWith(".md")){let o=await this.app.vault.adapter.read(s);i.push({path:s,content:o})}}catch{}this.entityIndex=f3(i),console.log(`TraceMind: entity index rebuilt with ${this.entityIndex.entries.length} entries`),e.persist&&await this.persistEntityIndex()}scheduleVaultStructureCheck(){setTimeout(()=>{let e=E0({getType:n=>{let i=this.app.vault.getAbstractFileByPath(n);return i?i.children!==void 0?"folder":"file":null}});e.length!==0&&w3(this.app,e,async()=>{for(let n of e)n.repairable&&(n.type==="missing_dir"?await xr(this.app,n.path):n.type==="missing_file"&&n.path===he&&(this.app.vault.getAbstractFileByPath(he)||await this.app.vault.create(he,`---
name: ""
occupation: ""
company: ""
city: ""
skills: []
roles: []
relationships: []
goals: []
focusAreas: []
---

# \u7528\u6237\u6863\u6848

## \u57FA\u672C\u4FE1\u606F
- \u59D3\u540D\uFF1A
- \u516C\u53F8/\u7EC4\u7EC7\uFF1A
- \u804C\u4F4D/\u804C\u4E1A\uFF1A
- \u57CE\u5E02\uFF1A

## \u6280\u80FD\u4E0E\u4E13\u4E1A
- _\u6682\u65E0_

## \u89D2\u8272\u4E0E\u5173\u7CFB
- _\u6682\u65E0_

## \u76EE\u6807\u4E0E\u8BA1\u5212
- _\u6682\u65E0_

## \u5173\u6CE8\u9886\u57DF
- _\u6682\u65E0_
`)));return E0({getType:n=>{let i=this.app.vault.getAbstractFileByPath(n);return i?i.children!==void 0?"folder":"file":null}})},()=>{},async()=>{})},2e3)}async persistEntityIndex(){try{await y3(this.app,this.entityIndex)}catch(e){console.error("TraceMind: failed to persist entity index",e),new Ke.Notice("\u5B9E\u4F53\u7D22\u5F15\u4FDD\u5B58\u5931\u8D25: "+e.message)}}async navigateToDate(e){this.app.workspace.getLeavesOfType(Yn).length===0&&await this.openTracemindView();let i=this.app.workspace.getLeavesOfType(Yn);for(let a of i){let r=a.view;typeof r.setCurrentDate=="function"&&await r.setCurrentDate(e)}}async openCalendarView(){let{workspace:e}=this.app,n=e.getLeavesOfType(Js);if(n.length>0)e.revealLeaf(n[0]);else{let i=e.getRightLeaf(!1);i&&(await i.setViewState({type:Js,active:!0}),e.revealLeaf(i))}}async openActionBoard(){let{workspace:e}=this.app;e.rightSplit?.collapse?.();let n=e.getLeavesOfType(rl);if(n.length>0){e.revealLeaf(n[0]),n[0].view instanceof Ss&&await n[0].view.refresh();return}let i=e.getLeaf("tab");i&&(await i.setViewState({type:rl,active:!0}),e.revealLeaf(i))}async openTracemindView(){let{workspace:e}=this.app,n=e.getLeavesOfType(Yn);if(n.length>0)e.revealLeaf(n[0]);else{let i=e.getLeaf(!1);i&&(await i.setViewState({type:Yn,active:!0}),e.revealLeaf(i))}await this.ensureAIAnalysisPanelVisible()}async openBlockEditor(){return this.openTracemindView()}async ensureAIAnalysisPanelVisible(){let{workspace:e}=this.app;e.rightSplit?.expand?.();let n=e.getLeavesOfType(vr);if(n.length>0){let a=n[0];await this.pruneDuplicateAIAnalysisPanels(a),e.revealLeaf(a);return}let i=e.getRightLeaf(!1);i&&(await i.setViewState({type:vr,active:!0}),e.revealLeaf(i))}async pruneDuplicateAIAnalysisPanels(e){let n=this.app.workspace.getLeavesOfType(vr),i=M3(n,e);if(i.length!==0){for(let a of i)try{await a.detach()}catch(r){console.warn("TraceMind: failed to detach duplicate AI analysis panel",r)}console.log(`TraceMind: removed ${i.length} duplicate AI analysis panel(s)`)}}async syncTraceMindSidebars(){if(this.app.workspace.getActiveViewOfType(Ks)){await this.ensureAIAnalysisPanelVisible();return}if(this.app.workspace.getActiveViewOfType(la)){this.app.workspace.rightSplit?.collapse?.();return}this.app.workspace.getActiveViewOfType(Ss)&&this.app.workspace.rightSplit?.collapse?.()}async openExplorationCanvas(e,n=!1){let{workspace:i}=this.app,a=i.getLeavesOfType(ar),r=e?{canvasPath:e}:{};if(n&&e){let s=i.activeLeaf||i.getLeaf(!1);if(s){await s.setViewState({type:ar,active:!0,state:r});let o=s.view;o instanceof la?await o.loadSession(e):await this.explorationCanvasView?.loadSession(e),i.revealLeaf(s)}}else if(a.length>0){if(e){await a[0].setViewState({type:ar,active:!0,state:r});let s=a[0].view;s instanceof la?await s.loadSession(e):await this.explorationCanvasView?.loadSession(e)}i.revealLeaf(a[0])}else{if(!e){new Ke.Notice("\u8BF7\u5148\u4ECE\u65E5\u8BB0 block \u521B\u5EFA\u601D\u8003\u63A2\u7D22\u767D\u677F\uFF0C\u6216\u6253\u5F00 explorations \u76EE\u5F55\u4E0B\u7684\u601D\u8003\u63A2\u7D22\u8BB0\u5F55");return}let s=n?i.getLeaf(!1):i.getLeaf("tab");if(s){await s.setViewState({type:ar,active:!0,state:r});let o=s.view;o instanceof la?await o.loadSession(e):await this.explorationCanvasView?.loadSession(e),i.revealLeaf(s)}}}async maybeOpenTraceMindCanvas(e){if(!(!e||e.extension!=="canvas"||!e.path.startsWith("explorations/")))try{let n=await this.app.vault.read(e),i=JSON.parse(n);if(!Xs(i)){console.log("[TraceMind] canvas file is not TraceMind format:",e.path);return}console.log("[TraceMind] opening exploration canvas:",e.path,"nodes:",i.nodes?.length,"edges:",i.edges?.length),await this.openExplorationCanvas(e.path,!0)}catch(n){console.warn("TraceMind: failed to inspect exploration canvas",n)}}async analyzeCurrentBlock(){let e=this.app.workspace.getActiveFile();if(!e){new Ke.Notice("\u8BF7\u5148\u6253\u5F00\u4E00\u4E2A\u65E5\u8BB0\u6587\u4EF6");return}let n=await this.app.vault.read(e),i=e.basename;console.log("[TraceMind] analyzeCurrentBlock file:",e.path,"content length:",n.length),console.log("[TraceMind] analyzeCurrentBlock content preview:",n.substring(0,300));try{let a=await this.aiProvider.analyzeBlock(n,i);new Ke.Notice(`\u5206\u6790\u5B8C\u6210: \u68C0\u6D4B\u5230 ${a.entities.length} \u4E2A\u5B9E\u4F53`),console.log("[TraceMind] analyzeCurrentBlock: tmResult:",a),this.updateAIAnalysis(a)}catch(a){new Ke.Notice("\u5206\u6790\u5931\u8D25: "+a.message),console.error("TraceMind: analysis error",a)}}getAIAnalysisView(){return this.aiAnalysisView}getBlockEditorView(){return this.blockEditorView}getCalendarView(){return this.calendarView}getEntityManager(){return this.entityManager}getSessionManager(){return this.sessionManager}getAIProvider(){return this.aiProvider}getTaskStore(){return this.taskStore}getUserProfile(){return this.userProfile}getUserProfileContext(){let e=this.userProfile,n=[];return e.name&&n.push("\u59D3\u540D\uFF1A"+e.name),e.occupation&&n.push("\u804C\u4E1A\uFF1A"+e.occupation),e.company&&n.push("\u516C\u53F8/\u7EC4\u7EC7\uFF1A"+e.company),e.city&&n.push("\u57CE\u5E02\uFF1A"+e.city),e.skills.length>0&&n.push("\u6280\u80FD\uFF1A"+e.skills.join("\u3001")),e.relationships.length>0&&n.push("\u5173\u7CFB\uFF1A"+e.relationships.join("\u3001")),e.goals.length>0&&n.push("\u76EE\u6807\uFF1A"+e.goals.join("\u3001")),e.focusAreas.length>0&&n.push("\u5173\u6CE8\u9886\u57DF\uFF1A"+e.focusAreas.join("\u3001")),n.length===0?"":`\u7528\u6237\u6863\u6848\uFF1A
`+n.map(function(i){return"- "+i}).join(`
`)}buildAnalysisResult(e,n,i){return _3(e,n,i)}updateAIAnalysis(e){this.aiAnalysisView&&this.aiAnalysisView.updateAnalysis(e)}getBlockEditorDate(){if(this.blockEditorView&&this.blockEditorView.currentDate){let e=this.blockEditorView.currentDate;if(e instanceof Date&&!isNaN(e.getTime())){let n=e.getFullYear(),i=String(e.getMonth()+1).padStart(2,"0"),a=String(e.getDate()).padStart(2,"0");return`${n}-${i}-${a}`}if(typeof e=="string"&&e.match(/^\d{4}-\d{2}-\d{2}$/))return e}return null}async getCachedInsight(e){try{let n=zu(e),i=this.app.vault.getFileByPath(n);if(!i)return null;let a=await this.app.vault.read(i);return C3(a)}catch{return null}}async readDailyDiary(e){try{let n=`Daily/${e}.md`,i=this.app.vault.getFileByPath(n);if(!i){let a=this.app.vault.getFileByPath(`${e}.md`);return a?await this.app.vault.read(a):null}return await this.app.vault.read(i)}catch{return null}}async readYesterdayDiary(e){let n=new Date(e);for(let i=1;i<=7;i++){let a=new Date(n);a.setDate(a.getDate()-i);let r=a.getFullYear(),s=String(a.getMonth()+1).padStart(2,"0"),o=String(a.getDate()).padStart(2,"0"),l=`${r}-${s}-${o}`,c=await this.readDailyDiary(l);if(c)return c}return""}async hasMinimumBlocks(e){let n=await this.readDailyDiary(e);return n?A0(n).length>=5:!1}async generateDailyInsight(e,n){let i=await this.readDailyDiary(e);if(!i)throw new Error("\u627E\u4E0D\u5230\u4ECA\u5929\u7684\u65E5\u8BB0\u6587\u4EF6");let a=await this.readYesterdayDiary(e),r=this.getUserProfileContext(),s=dg(this.entityIndex.entries),o=ug({todayBlocks:i,yesterdayBlocks:a,profileContext:r,entityIndexSummary:s}),l=this.getAIProvider().getProviderForContext("analysis");if(!l)throw new Error("\u8BF7\u5148\u5728\u8BBE\u7F6E\u4E2D\u914D\u7F6E AI Provider");let c={provider:l.providerType||"openai",apiKey:l.apiKey,model:l.model,baseUrl:l.baseUrl,enableThinking:l.enableThinking,reasoningEffort:l.reasoningEffort},u="",d=null;if(await nd(o,c,{onDelta:x=>{u+=x,n.onDelta(x)},onDone:x=>{},onError:x=>{d=x,n.onError(x)}}),d)throw d;if(!u)throw new Error("LLM \u8FD4\u56DE\u4E86\u7A7A\u5185\u5BB9");let p=await Il(i,a),f=A0(i),y={date:e,content:u,contentHash:p,generatedAt:new Date().toISOString(),blockCount:f.length};return await A3(this.app,y),n.onDone(u),y}};function _3(t,e,n,i){let a=[],r=[],s=[],o={people:a,objects:r,dimensions:s},l={person:"people",object:"objects",theme:"dimensions"},c=[];for(let u of t){let d=l[u.type],p=n.indexOf(u.name),f=u.name;if(p>=0){let y=Math.max(0,p-20),x=Math.min(n.length,p+u.name.length+30),E=n.slice(y,x);y>0&&(E="..."+E),x<n.length&&(E+="..."),f=E}o[d].push({type:u.type,name:u.name,confidence:u.confidence??.5,context:f,isArchived:!!u.existingCardId,newEntity:u.isNew,maturity:u.maturity,priorityScore:u.priorityScore,clarificationQuestions:u.clarificationQuestions,similarCandidates:u.similarCandidates||[]}),u.isNew&&c.push(u.name)}return{blockId:e,timestamp:new Date().toISOString(),category:c.length>0?"\u5F85\u786E\u8BA4":i||"\u5DE5\u4F5C",areas:i?[i]:[],entities:{people:a,objects:r,dimensions:s},needsConfirmation:c,aiResponse:oA(t)}}function oA(t){let e=[];for(let n of t)n.clarificationQuestions.length>0&&e.push(`\u5173\u4E8E ${n.name}\uFF1A${n.clarificationQuestions[0]}`);return e.length===0?`\u68C0\u6D4B\u5230\u4EE5\u4E0B\u5B9E\u4F53\uFF1A${t.map(i=>i.name).join("\u3001")}\u3002`:e.join(`
`)}var T0=class{constructor(e,n){this.app=e;this.plugin=n}app;plugin;findEntity(e){return h3(this.plugin.entityIndex,e)}getEntity(e){return this.plugin.entityIndex.entries.find(n=>n.id===e)||null}async createEntity(e){let n=lA(e.type),i=e.aliases||[],a=y0.create({name:e.title,cardType:n,attributes:e.metadata||{},aliases:i});e.interactions&&Array.isArray(e.interactions)&&(a.attributes.interactions=e.interactions);let{path:r}=s3({title:e.title,type:e.type});await Ne(this.app,r);let s=this.app.vault.getFileByPath(r);if(s){let c=await this.app.vault.read(s),u=pa(c,r);return this.plugin.entityIndex=ur(this.plugin.entityIndex,u),await this.plugin.persistEntityIndex(),{...e,id:u.id}}let o=lr(a);await this.app.vault.create(r,o);let l=pa(o,r);return this.plugin.entityIndex=ur(this.plugin.entityIndex,l),await this.plugin.persistEntityIndex(),{...e,id:l.id}}async updateEntity(e,n){let i=this.getEntity(e);if(!i)return;let a=this.app.vault.getFileByPath(i.filePath);if(!a)return;let r=await this.app.vault.read(a),s=Bs(r);for(let[c,u]of Object.entries(n))c==="lastUpdated"?s.lastUpdated=u:c==="interactions"?s.attributes.interactions=u:c==="aliases"&&Array.isArray(u)?s.aliases=u:s.attributes[c]=u;s.lastUpdated=n.lastUpdated||new Date().toISOString();let o=lr(s);await this.app.vault.modify(a,o);let l=pa(o,i.filePath);this.plugin.entityIndex=ur(this.plugin.entityIndex,l),await this.plugin.persistEntityIndex()}wikifyContent(e){let n=e;n=n.replace(/\[\[(Person|Object|Theme)\/(?:\[\[(?:Person|Object|Theme)\/[^\]]+\]\])\|([^\]]+)\]\]/g,"[[$1/$2|$2]]");let a=[...this.plugin.entityIndex.entries].sort((s,o)=>o.name.length-s.name.length),r=[];for(let s of a){let o=s.cardType==="person"?"Person":s.cardType==="object"?"Object":"Theme";s.name.length>=2&&r.push({term:s.name,name:s.name,folder:o});for(let l of s.aliases||[])l.length>=2&&r.push({term:l,name:s.name,folder:o})}r.sort((s,o)=>o.term.length-s.term.length);for(let s of r){let o=s.term.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");if(!new RegExp("(?<!\\[\\[)"+o+"(?!\\]\\|)").test(n))continue;let l="[["+s.folder+"/"+s.name+"|"+s.term+"]]",c=new RegExp("(?<!\\[\\[)"+o+"(?!\\]\\|)","g");n=n.replace(c,l)}return n}async refreshWikilinks(e){let n=this.getEntity(e);if(!n)return;let i=this.app.vault.getFileByPath(n.filePath);if(!i)return;let a=await this.app.vault.read(i),r=Bs(a),s=r.attributes.interactions||[],o=!1;for(let l of s)if(l.content&&typeof l.content=="string"){let c=this.wikifyContent(l.content);c!==l.content&&(l.content=c,o=!0)}if(o){r.attributes.interactions=s;let l=lr(r);await this.app.vault.modify(i,l);let c=pa(l,n.filePath);this.plugin.entityIndex=ur(this.plugin.entityIndex,c),await this.plugin.persistEntityIndex()}}async addInteraction(e,n){let i=this.getEntity(e);if(!i)return;let a=this.app.vault.getFileByPath(i.filePath);if(!a)return;let r=await this.app.vault.read(a),s=Bs(r),o=s.attributes.interactions||[];o.push(n),s.attributes.interactions=o,s.lastUpdated=new Date().toISOString();let l=lr(s);await this.app.vault.modify(a,l);let c=pa(l,i.filePath);this.plugin.entityIndex=ur(this.plugin.entityIndex,c),await this.plugin.persistEntityIndex()}async linkRelatedEntities(e){if(!(e.length<2)){for(let n of e){let i=this.findEntity(n.name);if(!i)continue;let a=this.app.vault.getFileByPath(i.filePath);if(!a)continue;let r=await this.app.vault.read(a),s=Bs(r);for(let c of e)c.name!==n.name&&(c.type==="person"?s.relatedPeople.includes(c.name)||s.relatedPeople.push(c.name):c.type==="object"?s.relatedObjects.includes(c.name)||s.relatedObjects.push(c.name):c.type==="theme"&&(s.relatedThemes.includes(c.name)||s.relatedThemes.push(c.name)));let o=lr(s);await this.app.vault.modify(a,o);let l=pa(o,i.filePath);this.plugin.entityIndex=ur(this.plugin.entityIndex,l)}await this.plugin.persistEntityIndex()}}async enrichEntity(e,n){return n}buildEntityIndex(){let e=new Map;for(let n of this.plugin.entityIndex.entries)e.set(n.id,new Set([n.name,...n.aliases]));return e}},M0=class{constructor(e){this.app=e}app;cache=new Map;chatSession={blockId:"chat:global",messages:[],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};async initialize(){try{let e=await this.app.vault.adapter.list("TraceMind/sessions/");for(let n of e.files)if(n.endsWith(".json")){let i=await this.app.vault.adapter.read(n),a=b3(i);this.cache.set(a.blockId,this.toViewSession(a))}}catch{}}getSession(e,n){return this.cache.get(e)||null}getOrCreateSession(e,n){let i=this.cache.get(e);if(i)return i;let a={blockId:e,content:"",messages:[],analysisResult:null,reviewCards:{},createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),currentPhase:"detection"};return this.cache.set(e,a),a}setContent(e,n,i){let a=this.getOrCreateSession(e,i);a.content=n,a.updatedAt=new Date().toISOString(),this.writeSession(e,a)}setSession(e,n,i){let a=this.getOrCreateSession(e,i),r={...a,...n,blockId:e,updatedAt:new Date().toISOString(),analysisResult:n.analysisResult??a.analysisResult};return this.cache.set(e,r),this.writeSession(e,r),r}setAnalysisResult(e,n,i){let a=this.getOrCreateSession(e,i);a.analysisResult=n,a.updatedAt=new Date().toISOString(),a.currentPhase="complete",this.cache.set(e,a),this.writeSession(e,a)}addMessage(e,n,i){let a=this.getOrCreateSession(e,i);a.messages.push(n),a.updatedAt=new Date().toISOString(),this.cache.set(e,a),this.writeSession(e,a)}addChatMessage(e){this.chatSession.messages.push(e),this.chatSession.updatedAt=new Date().toISOString()}getChatSession(){return this.chatSession}clearChatSession(){this.chatSession={blockId:"chat:global",messages:[],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}}async clearSession(e){this.cache.delete(e);try{let n=this.app.vault.getFileByPath(k0(e));n&&await this.app.vault.delete(n)}catch{}}updateReviewCard(e,n,i,a){let r=this.getOrCreateSession(e,a);r.reviewCards||(r.reviewCards={}),r.reviewCards[n]={status:i.status||"pending",supplement:i.supplement,updatedAt:new Date().toISOString()},r.updatedAt=new Date().toISOString(),this.cache.set(e,r),this.writeSession(e,r)}writeSession(e,n){try{let i=k0(e),a={blockId:n.blockId,content:n.content,messages:n.messages,createdAt:n.createdAt,updatedAt:n.updatedAt,currentPhase:n.currentPhase};n.analysisResult&&(a.analysisResult=n.analysisResult),n.clarificationPhase&&(a.clarificationPhase=n.clarificationPhase),n.clarificationIndex!=null&&(a.clarificationIndex=n.clarificationIndex),Array.isArray(n.skippedEntityNames)&&(a.skippedEntityNames=n.skippedEntityNames);let r=JSON.stringify(a,null,2),s=this.app.vault.getFileByPath(i);s?this.app.vault.modify(s,r):this.app.vault.create(i,r)}catch(i){console.error("TraceMind: failed to write session",i)}}toViewSession(e){return{blockId:e.blockId,content:e.content,messages:e.messages,analysisResult:e.analysisResult??null,reviewCards:e.reviewCards??{},skippedEntityNames:Array.isArray(e.skippedEntityNames)?e.skippedEntityNames:[],createdAt:e.createdAt,updatedAt:e.updatedAt,currentPhase:e.currentPhase||"detection"}}},_0=class{constructor(e){this.plugin=e}plugin;isReady(){let{settings:e}=this.plugin;if(!e.defaultProviderId)return!1;let n=e.providers.find(i=>i.id===e.defaultProviderId);return!!n&&!!n.apiKey&&!!n.baseUrl}async chat(e,n){let i=this.getProviderForContext(n??"chat");if(!i)throw new Error("No AI provider configured");let{chat:a}=await Promise.resolve().then(()=>(Ci(),id));return{content:(await a(e.map(s=>({role:s.role,content:s.content})),{provider:i.providerType||"openai",apiKey:i.apiKey,model:i.model,baseUrl:i.baseUrl,enableThinking:i.enableThinking,reasoningEffort:i.reasoningEffort})).content,usage:{promptTokens:0,completionTokens:0,totalTokens:0}}}async streamChat(e,n,i){let a=this.getProviderForContext(i??"chat");if(!a){n.onError(new Error("No AI provider configured"));return}let{streamChat:r}=await Promise.resolve().then(()=>(Ci(),id));await r(e.map(s=>({role:s.role,content:s.content})),{provider:a.providerType||"openai",apiKey:a.apiKey,model:a.model,baseUrl:a.baseUrl,enableThinking:a.enableThinking,reasoningEffort:a.reasoningEffort},n)}async analyzeBlock(e,n="",i){let a=new Map;for(let c of this.plugin.entityIndex.entries)a.set(c.id,{name:c.name,cardType:c.cardType,maturity:c.maturity||"L0"});console.log("[TraceMind] analyzeBlock: loaded",a.size,"existing cards from index");let r=this.getProviderForContext("analysis");if(!r)return console.warn("[TraceMind] analyzeBlock: no AI provider configured, cannot extract entities"),new Ke.Notice("\u8BF7\u5148\u5728\u8BBE\u7F6E\u4E2D\u914D\u7F6E AI Provider"),{entities:[],newEntities:[],existingEntities:[],hasClarifications:!1,gapCount:0};console.log("[TraceMind] analyzeBlock: using LLM extraction, provider:",r.name);let s=this.plugin.getUserProfileContext(),o=await pl.analyzeBlockAsync(e,a,{apiKey:r.apiKey||"",model:r.model||"gpt-4",baseUrl:r.baseUrl||"",provider:r.providerType,enableThinking:r.enableThinking,reasoningEffort:r.reasoningEffort,profileContext:s||void 0},this.plugin.entityIndex.entries,i);console.log("[TraceMind] analyzeBlock result entities:",o.entities.length,o);let l=_3(o.entities,n,e,o.domainCategory);return{...l,analysisResult:l}}getProviderForContext(e){let{settings:n}=this.plugin,i=n.agentProviderMapping,a=e==="analysis"?i.analysis:i.chat;if(a){let r=n.providers.find(s=>s.id===a);if(r)return r}return this.getDefaultProvider()}getDefaultProvider(){let{settings:e}=this.plugin;return e.defaultProviderId&&e.providers.find(n=>n.id===e.defaultProviderId)||null}};function lA(t){return t==="person"?"person":t==="object"?"object":t==="theme"?"theme":t==="project"||t==="thing"?"object":t==="idea"||t==="knowledge"?"theme":"object"}var cA=Lu;
/*! Bundled license information:

react/cjs/react.production.js:
  (**
   * @license React
   * react.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

scheduler/cjs/scheduler.production.js:
  (**
   * @license React
   * scheduler.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-dom/cjs/react-dom.production.js:
  (**
   * @license React
   * react-dom.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-dom/cjs/react-dom-client.production.js:
  (**
   * @license React
   * react-dom-client.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react-jsx-runtime.production.js:
  (**
   * @license React
   * react-jsx-runtime.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

js-yaml/dist/js-yaml.mjs:
  (*! js-yaml 4.1.1 https://github.com/nodeca/js-yaml @license MIT *)
*/
