"use strict";var qn=Object.create;var Ce=Object.defineProperty;var Qn=Object.getOwnPropertyDescriptor;var Jn=Object.getOwnPropertyNames;var Xn=Object.getPrototypeOf,Zn=Object.prototype.hasOwnProperty;var Ae=(e,t)=>()=>(e&&(t=e(e=0)),t);var le=(e,t)=>{for(var i in t)Ce(e,i,{get:t[i],enumerable:!0})},$t=(e,t,i,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of Jn(t))!Zn.call(e,r)&&r!==i&&Ce(e,r,{get:()=>t[r],enumerable:!(n=Qn(t,r))||n.enumerable});return e};var er=(e,t,i)=>(i=e!=null?qn(Xn(e)):{},$t(t||!e||!e.__esModule?Ce(i,"default",{value:e,enumerable:!0}):i,e)),tr=e=>$t(Ce({},"__esModule",{value:!0}),e);var Qe={};le(Qe,{buildRequest:()=>ue,chat:()=>Te,createProviderHttpError:()=>ce,extractStreamDelta:()=>Ge,parseResponse:()=>Se,streamChat:()=>qe,summarizeProviderErrorBody:()=>Nt,validateConfig:()=>K});function K(e){return e.provider?e.provider!=="ollama"&&(!e.apiKey||e.apiKey.trim()==="")?{valid:!1,error:"AI Provider API Key \u672A\u914D\u7F6E"}:!e.model||e.model.trim()===""?{valid:!1,error:"AI Provider \u6A21\u578B\u672A\u914D\u7F6E"}:{valid:!0}:{valid:!1,error:"AI Provider \u7C7B\u578B\u7F3A\u5931"}}function nr(e){return e.replace(/sk-[a-zA-Z0-9_-]{20,}/g,"sk-***").replace(/Bearer\s+[a-zA-Z0-9._\-+=]+/gi,"Bearer ***").replace(/x-api-key:\s*\S+/gi,"x-api-key: ***")}function Nt(e){let t;try{let r=JSON.parse(e);t=r.error?.message||r.message||""}catch{t=e}let n=String(t).trim().replace(/\n/g," ").slice(0,ir);return n?nr(n):"(empty response)"}async function ce(e){let t=await e.text().catch(()=>""),i=Nt(t);return new Error(`AI Provider \u8BF7\u6C42\u5931\u8D25 (HTTP ${e.status}): ${i}`)}function ue(e,t){let i=t.find(r=>r.role==="system"),n=t.filter(r=>r.role!=="system");switch(e.provider){case"openai":{let r=(e.baseUrl||"https://api.openai.com").replace(/\/+$/,""),a=r.endsWith("/v1")?"/chat/completions":"/v1/chat/completions",s=e.reasoningEffort||(e.enableThinking?"high":void 0),o={model:e.model,messages:t};return s&&(o.reasoning_effort=s),{url:`${r}${a}`,method:"POST",headers:{Authorization:`Bearer ${e.apiKey}`,"Content-Type":"application/json"},body:JSON.stringify(o)}}case"anthropic":{let r={model:e.model,system:i?.content,messages:n.map(a=>({role:a.role,content:a.content}))};return(e.enableThinking||e.reasoningEffort)&&(r.thinking={type:"adaptive",effort:e.reasoningEffort||"high"}),{url:e.baseUrl||"https://api.anthropic.com/v1/messages",method:"POST",headers:{"x-api-key":e.apiKey,"anthropic-version":"2023-06-01","Content-Type":"application/json"},body:JSON.stringify(r)}}default:{let a=(e.baseUrl||(e.provider==="ollama"?"http://localhost:11434":"")).replace(/\/+$/,""),s=a.endsWith("/v1")?"/chat/completions":"/v1/chat/completions",o=e.reasoningEffort||(e.enableThinking?"high":void 0),l={model:e.model,messages:t};return o&&(l.reasoning_effort=o),{url:`${a}${s}`,method:"POST",headers:{"Content-Type":"application/json",...e.apiKey?{Authorization:`Bearer ${e.apiKey}`}:{}},body:JSON.stringify(l)}}}}async function Te(e,t){let i=K(t);if(!i.valid)throw new Error(i.error);let n=ue(t,e),r=await fetch(n.url,{method:n.method||"POST",headers:n.headers,body:n.body});if(!r.ok)throw await ce(r);let a=await r.json();return{content:Se(t.provider,a).content}}function Ge(e,t){if(!t.startsWith("data: "))return"";let i=t.slice(6).trim();if(!i||i==="[DONE]")return"";try{let n=JSON.parse(i);if(e==="anthropic")return n.type==="content_block_delta"&&n.delta?.text?n.delta.text:"";let r=n.choices;return r&&r.length>0&&r[0].delta?.content?r[0].delta.content:""}catch{return""}}async function qe(e,t,i){let n=K(t);if(!n.valid){i.onError(new Error(n.error));return}try{let r=ue(t,e),a=JSON.parse(r.body||"{}");a.stream=!0;let s={...r.headers,Accept:"text/event-stream"},o=await fetch(r.url,{method:r.method||"POST",headers:s,body:JSON.stringify(a)});if(!o.ok)throw await ce(o);if(!o.body)throw new Error("Response body is null \u2014 streaming not supported");let l=o.body.getReader(),c=new TextDecoder,u="",d="";for(;;){let{done:f,value:p}=await l.read();if(f)break;d+=c.decode(p,{stream:!0});let h=d.split(`
`);d=h.pop()||"";for(let g of h){let y=g.trim();if(!y)continue;let x=Ge(t.provider,y);x&&(u+=x,i.onDelta(x))}}if(d.trim()){let f=Ge(t.provider,d.trim());f&&(u+=f,i.onDelta(f))}i.onDone(u)}catch(r){i.onError(r)}}function Se(e,t){switch(e){case"openai":{let i=t.choices;if(!i||i.length===0)throw new Error("Empty response from OpenAI");return{role:"assistant",content:i[0].message.content}}case"anthropic":{let i=t.content;if(!i||i.length===0)throw new Error("Empty response from Anthropic");return{role:"assistant",content:i[0].text}}default:{let i=t.choices;if(!i||i.length===0)throw new Error("Empty response from AI provider");return{role:"assistant",content:i[0].message.content}}}}var ir,H=Ae(()=>{"use strict";ir=200});var Je={};le(Je,{resolveExecutable:()=>W});async function W(e){let{execSync:t}=require("child_process"),{homedir:i}=require("os"),n=i(),r=[`${n}/.local/bin/${e}`,`${n}/.npm-global/bin/${e}`,`/usr/local/bin/${e}`,`/opt/homebrew/bin/${e}`,e];for(let a of r)try{return t(`"${a}" --version 2>&1`,{encoding:"utf-8",timeout:5e3}),a}catch{continue}return null}var de=Ae(()=>{"use strict"});var si={};le(si,{hermesProvider:()=>Cr});var Er,wr,ai,kr,Cr,oi=Ae(()=>{"use strict";de();({spawn:Er}=require("child_process")),wr=require("readline"),ai="hermes",kr=600*1e3,Cr={name:"Hermes",description:"\u5F00\u6E90 AI agent \u6846\u67B6\uFF0C\u652F\u6301\u591A provider\uFF0C\u901A\u8FC7 hermes CLI \u8C03\u7528",async detect(){let e=await W(ai);if(!e)return!1;try{let{execSync:t}=require("child_process"),i=t(`${e} --version 2>&1`,{encoding:"utf-8",timeout:1e4});return/Hermes Agent/i.test(i)}catch{return!1}},execute(e,t){let i=null,n=!1,r=null,a=null,s=null,o=Date.now();return(async()=>{try{let c=await W(ai);if(!c){let y=new Error("\u627E\u4E0D\u5230 hermes CLI\uFF0C\u8BF7\u786E\u8BA4\u5DF2\u5B89\u88C5 Hermes Agent");s?.(y),a?.({status:"failed",output:"",error:y.message,durationMs:Date.now()-o});return}let u=["-z",e];t?.model&&u.unshift("-m",t.model);let d={...process.env,...t?.env};if(i=Er(c,u,{env:d,cwd:t?.cwd||process.cwd(),stdio:["ignore","pipe","pipe"]}),n){i.kill();return}i.on("error",y=>{s?.(y),a?.({status:"failed",output:"",error:y.message,durationMs:Date.now()-o})});let f=setTimeout(()=>{i&&!i.killed&&(i.kill(),a?.({status:"timeout",output:"",error:"\u6267\u884C\u8D85\u65F6",durationMs:Date.now()-o}))},t?.timeoutMs||kr),p="",h=wr.createInterface({input:i.stdout,crlfDelay:1/0});h.on("line",y=>{p+=y+`
`,r?.({type:"text",content:y+`
`})}),h.on("close",()=>{clearTimeout(f),a?.({status:"completed",output:p.trim(),durationMs:Date.now()-o})});let g="";i.stderr&&i.stderr.on("data",y=>{g+=y.toString()}),i.on("close",y=>{clearTimeout(f),y!==0&&p===""&&a?.({status:"failed",output:"",error:`hermes \u9000\u51FA\u7801 ${y}: ${g.slice(0,500)}`,durationMs:Date.now()-o})})}catch(c){s?.(c),a?.({status:"failed",output:"",error:c.message,durationMs:Date.now()-o})}})(),{set onMessage(c){r=c},get onMessage(){return r},set onDone(c){a=c},get onDone(){return a},set onError(c){s=c},get onError(){return s},abort(){n=!0,i&&!i.killed&&i.kill()}}}}});var ci={};le(ci,{claudeCodeProvider:()=>Ir});var Ar,Tr,li,Sr,Ir,ui=Ae(()=>{"use strict";de();({spawn:Ar}=require("child_process")),Tr=require("readline"),li="claude",Sr=600*1e3,Ir={name:"Claude Code",description:"Anthropic \u51FA\u54C1\u7684\u672C\u5730 AI \u7F16\u7A0B agent\uFF0C\u901A\u8FC7 claude CLI \u8C03\u7528",async detect(){let e=await W(li);if(!e)return!1;try{let{execSync:t}=await import("node:child_process"),i=t(`${e} --version 2>&1`,{encoding:"utf-8",timeout:1e4});return/[Cc]laude|[0-9]+\.[0-9]+\.[0-9]+/.test(i)}catch{return!1}},execute(e,t){let i=null,n=!1,r=null,a=null,s=null,o=Date.now(),l=t?.timeoutMs||Sr;return(async()=>{try{let u=await W(li);if(!u){let b=new Error("\u627E\u4E0D\u5230 claude CLI\uFF0C\u8BF7\u786E\u8BA4\u5DF2\u5B89\u88C5 Claude Code");s?.(b),a?.({status:"failed",output:"",error:b.message,durationMs:Date.now()-o});return}let d=["-p","--output-format","stream-json","--input-format","stream-json","--verbose"];t?.model&&d.push("--model",t.model);let f={...process.env};if(t?.env&&Object.assign(f,t.env),i=Ar(u,d,{env:f,cwd:t?.cwd||process.cwd(),stdio:["pipe","pipe","pipe"]}),n){i.kill();return}i.on("error",b=>{s?.(b),a?.({status:"failed",output:"",error:b.message,durationMs:Date.now()-o})});let p=setTimeout(()=>{i&&!i.killed&&(i.kill(),a?.({status:"timeout",output:"",error:"\u6267\u884C\u8D85\u65F6",durationMs:Date.now()-o}))},l),h=Tr.createInterface({input:i.stdout,crlfDelay:1/0}),g="",y="";h.on("line",b=>{if(b.trim())try{let D=JSON.parse(b);switch(D.type){case"system":D.session_id&&(g=D.session_id),D.subtype==="init"&&r?.({type:"status",content:"running",sessionId:g});break;case"assistant":{let We=D.message?.content||[];for(let F of We)F.type==="text"&&F.text?(y+=F.text,r?.({type:"text",content:F.text})):F.type==="tool_use"&&r?.({type:"tool-use",toolName:F.name,toolInput:F.input});break}case"user":{let We=D.message?.content||[];for(let F of We)F.type==="tool_use"&&F.name&&r?.({type:"tool-result",toolName:F.name});break}case"result":clearTimeout(p);let Ot=D.is_error||D.subtype==="error_during_execution",Gn=D.output||y;a?.({status:Ot?"failed":"completed",output:Gn,error:Ot?D.output||"\u672A\u77E5\u9519\u8BEF":void 0,durationMs:Date.now()-o});break}}catch{}}),h.on("close",()=>{clearTimeout(p),n||a?.({status:"completed",output:y,durationMs:Date.now()-o})});let x=JSON.stringify({type:"user",message:{role:"user",content:e}});i.stdin.write(x+`
`),i.stdin.end()}catch(u){s?.(u),a?.({status:"failed",output:"",error:u.message,durationMs:Date.now()-o})}})(),{set onMessage(u){r=u},get onMessage(){return r},set onDone(u){a=u},get onDone(){return a},set onError(u){s=u},get onError(){return s},abort(){n=!0,i&&!i.killed&&i.kill()}}}}});var Fo={};le(Fo,{TraceMindPlugin:()=>Ke,default:()=>Mo});module.exports=tr(Fo);var R=require("obsidian");var E=require("obsidian");H();var rr=[{test:e=>e.includes("API Key")||e.includes("Invalid API key")||e.includes("invalid x-api-key")||e.includes("Incorrect API key"),prefix:"API Key \u65E0\u6548\u6216\u672A\u914D\u7F6E\uFF0C\u8BF7\u68C0\u67E5 API Key \u662F\u5426\u6B63\u786E"},{test:e=>e.includes("401"),prefix:"\u8BA4\u8BC1\u5931\u8D25 (HTTP 401)\uFF0C\u8BF7\u68C0\u67E5 API Key \u548C\u6743\u9650"},{test:e=>e.includes("403"),prefix:"\u6743\u9650\u4E0D\u8DB3 (HTTP 403)\uFF0C\u8BF7\u68C0\u67E5 API Key \u662F\u5426\u6709\u8BBF\u95EE\u6743\u9650"},{test:e=>e.includes("429"),prefix:"\u8BF7\u6C42\u9891\u7387\u8D85\u9650 (HTTP 429)\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u6216\u68C0\u67E5 API \u989D\u5EA6"},{test:e=>e.includes("model")&&(e.includes("not found")||e.includes("does not exist")||e.includes("\u6A21\u578B")),prefix:"\u6A21\u578B\u540D\u79F0\u65E0\u6548\u6216\u4E0D\u53EF\u7528\uFF0C\u8BF7\u68C0\u67E5\u6A21\u578B\u540D\u79F0\u662F\u5426\u6B63\u786E"},{test:e=>(e.includes("fetch failed")||e.includes("Failed to fetch")||e.includes("ENOTFOUND")||e.includes("ECONNREFUSED"))&&(e.includes("localhost:11434")||e.includes("127.0.0.1:11434")),prefix:"\u65E0\u6CD5\u8FDE\u63A5 Ollama\uFF0C\u8BF7\u786E\u8BA4 Ollama \u5DF2\u542F\u52A8 (localhost:11434)"},{test:e=>e.includes("fetch failed")||e.includes("Failed to fetch")||e.includes("ENOTFOUND")||e.includes("ECONNREFUSED"),prefix:"\u7F51\u7EDC\u8FDE\u63A5\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5 Base URL \u548C\u7F51\u7EDC\u8FDE\u63A5"},{test:e=>e.includes("timeout")||e.includes("ETIMEDOUT"),prefix:"\u8FDE\u63A5\u8D85\u65F6\uFF0C\u8BF7\u68C0\u67E5\u7F51\u7EDC\u6216 Base URL \u662F\u5426\u6B63\u786E"}];function jt(e){let t=e instanceof Error?e.message:String(e);for(let i of rr)if(i.test(t))return`${i.prefix}
(${t.slice(0,150)})`;return`\u8FDE\u63A5\u5931\u8D25: ${t.slice(0,200)}`}function Vt(e,t,i){let n=e.providers.map(r=>r.id===t?{...r,...i,id:t}:r);return{...e,providers:n}}function Ht(e,t){let i=e.providers.filter(a=>a.id!==t),n=e.defaultProviderId;n===t&&(n=i[0]?.id||"");let r={...e.agentProviderMapping};return r.analysis===t&&(r.analysis=""),r.chat===t&&(r.chat=""),{...e,providers:i,defaultProviderId:n,agentProviderMapping:r}}H();var Ie=class extends E.PluginSettingTab{plugin;constructor(t,i){super(t,i),this.plugin=i}display(){let{containerEl:t}=this;t.empty(),t.createEl("h2",{text:"TraceMind \u8BBE\u7F6E"}),t.createEl("h3",{text:"AI Provider"});let i="",n="",r="",a="",s=!1,o="",l="openai";new E.Setting(t).setName("Provider \u7C7B\u578B").setDesc("\u9009\u62E9 API \u683C\u5F0F").addDropdown(p=>{p.addOption("openai","OpenAI-compatible").addOption("anthropic","Anthropic").addOption("ollama","Ollama").addOption("custom","Custom").setValue("openai").onChange(h=>{l=h})}),new E.Setting(t).setName("\u540D\u79F0").setDesc("Provider \u663E\u793A\u540D\u79F0").addText(p=>{p.setPlaceholder("My GPT-4").onChange(h=>{i=h})}),new E.Setting(t).setName("\u6A21\u578B").setDesc("\u6A21\u578B\u540D\u79F0\uFF0C\u5982 gpt-4\u3001qwen-plus").addText(p=>{p.setPlaceholder("gpt-4").onChange(h=>{n=h})}),new E.Setting(t).setName("Base URL").setDesc("OpenAI \u517C\u5BB9 API \u5730\u5740").addText(p=>{p.setPlaceholder("https://api.openai.com/v1").onChange(h=>{r=h})}),new E.Setting(t).setName("API Key").setDesc("API \u5BC6\u94A5").addText(p=>{p.setPlaceholder("").onChange(h=>{a=h}),p.inputEl.type="password"}),new E.Setting(t).setName("\u601D\u8003\u6A21\u5F0F").setDesc("\u5F00\u542F\u540E\u4F1A\u6309\u5F53\u524D Provider \u7C7B\u578B\u9644\u52A0\u601D\u8003/\u63A8\u7406\u53C2\u6570\uFF1B\u4EC5\u90E8\u5206\u6A21\u578B\u652F\u6301").addToggle(p=>{p.setValue(s).onChange(h=>{s=h})}),new E.Setting(t).setName("Reasoning Effort").setDesc("\u90E8\u5206\u6A21\u578B\u652F\u6301 high \u6216 max").addDropdown(p=>{p.addOption("","\u9ED8\u8BA4").addOption("high","high").addOption("max","max").setValue(o).onChange(h=>{o=h})}),new E.Setting(t).addButton(p=>{p.setButtonText("\u6DFB\u52A0 Provider"),p.setCta(),p.onClick(async()=>{if(!i||!n||!r){new E.Notice("\u8BF7\u586B\u5199\u540D\u79F0\u3001\u6A21\u578B\u548C Base URL");return}let h=`provider-${Date.now()}`;this.plugin.settings.providers.push({id:h,name:i,providerType:l,model:n,baseUrl:r,apiKey:a,enableThinking:s,reasoningEffort:o}),await this.plugin.saveSettings(),this.display(),new E.Notice("Provider \u5DF2\u6DFB\u52A0")})});for(let p=0;p<this.plugin.settings.providers.length;p++){let h=this.plugin.settings.providers[p],g=this.plugin.settings.defaultProviderId===h.id;this.renderProviderRow(t,h,g)}this.plugin.settings.providers.length===0&&t.createEl("p",{text:"\u6682\u65E0 Provider\uFF0C\u8BF7\u6DFB\u52A0\u4E00\u4E2A",cls:"lifewiki-no-providers"}),t.createEl("h3",{text:"Agent \u914D\u7F6E"});let c=this.plugin.settings.agentProviderMapping,u={};for(let p of this.plugin.settings.providers)u[p.id]=p.name;new E.Setting(t).setName("AI \u5206\u6790").setDesc("\u65E5\u8BB0\u5206\u6790\u4F7F\u7528\u7684 AI Provider").addDropdown(p=>{p.addOption("","\u4F7F\u7528\u9ED8\u8BA4 Provider");for(let[h,g]of Object.entries(u))p.addOption(h,g);p.setValue(c.analysis).onChange(async h=>{this.plugin.settings.agentProviderMapping.analysis=h,await this.plugin.saveSettings()})}),new E.Setting(t).setName("AI \u804A\u5929").setDesc("\u804A\u5929\u4F7F\u7528\u7684 AI Provider").addDropdown(p=>{p.addOption("","\u4F7F\u7528\u9ED8\u8BA4 Provider");for(let[h,g]of Object.entries(u))p.addOption(h,g);p.setValue(c.chat).onChange(async h=>{this.plugin.settings.agentProviderMapping.chat=h,await this.plugin.saveSettings()})}),t.createEl("h3",{text:"\u672C\u5730 Agent"}),t.createEl("p",{text:"\u542F\u7528\u540E\uFF0C\u5728\u804A\u5929\u6A21\u5F0F\u7684\u8F93\u5165\u6846\u5DE6\u4FA7\u53EF\u9009\u62E9\u672C\u5730\u5B89\u88C5\u7684 AI agent CLI\uFF08Claude Code\u3001Hermes \u7B49\uFF09\u3002",cls:"setting-item-description"});let d=t.createEl("div",{cls:"tracemind-agent-status"});new E.Setting(t).setName("\u542F\u7528\u672C\u5730 Agent").setDesc("\u5F00\u542F\u540E\u7CFB\u7EDF\u5C06\u68C0\u6D4B\u672C\u673A\u5B89\u88C5\u7684 agent CLI\uFF0C\u5E76\u5728\u804A\u5929\u8F93\u5165\u6846\u5DE6\u4FA7\u63D0\u4F9B\u9009\u62E9\u5668").addToggle(p=>{p.setValue(this.plugin.settings.localAgentEnabled).onChange(async h=>{this.plugin.settings.localAgentEnabled=h,await this.plugin.saveSettings(),h?this.detectAndShowAgents(d):d.empty()})}),this.plugin.settings.localAgentEnabled&&this.detectAndShowAgents(d);let f=document.createElement("style");f.textContent=`
			.tracemind-agent-status { margin: 0 0 16px 0; display: flex; flex-direction: column; gap: 6px; }
			.tracemind-agent-row { display: flex; align-items: center; gap: 8px; font-size: 13px; }
			.tracemind-agent-dot { font-size: 12px; }
			.tracemind-agent-label { color: var(--text-muted); }
			.tracemind-agent-dot.available + .tracemind-agent-label { color: var(--text-normal); }
		`,t.appendChild(f)}editingProviderId=null;editDraft=null;renderProviderRow(t,i,n){let r=this.editingProviderId===i.id,a=r?this.editDraft:i,s=new E.Setting(t).setName(`${a.name}${n?" (\u9ED8\u8BA4)":""}`).setDesc(`[${a.providerType||"openai"}] ${a.baseUrl} / ${a.model}${a.enableThinking?" / thinking:on":""}${a.reasoningEffort?` / reasoning:${a.reasoningEffort}`:""}`);if(s.addToggle(o=>{o.setTooltip("\u8BBE\u4E3A\u9ED8\u8BA4").setValue(n).onChange(async l=>{l&&(this.plugin.settings.defaultProviderId=i.id),await this.plugin.saveSettings(),this.display()})}),r){new E.Setting(t).setName("\u540D\u79F0").addText(l=>l.setValue(a.name).onChange(c=>{this.editDraft.name=c})),new E.Setting(t).setName("Provider \u7C7B\u578B").addDropdown(l=>{l.addOption("openai","OpenAI-compatible").addOption("anthropic","Anthropic").addOption("ollama","Ollama").addOption("custom","Custom").setValue(a.providerType).onChange(c=>{this.editDraft.providerType=c})}),new E.Setting(t).setName("\u6A21\u578B").addText(l=>l.setValue(a.model).onChange(c=>{this.editDraft.model=c})),new E.Setting(t).setName("Base URL").addText(l=>l.setValue(a.baseUrl).onChange(c=>{this.editDraft.baseUrl=c})),new E.Setting(t).setName("API Key").addText(l=>{l.setValue(a.apiKey).onChange(c=>{this.editDraft.apiKey=c}),l.inputEl.type="password"}),new E.Setting(t).setName("\u601D\u8003\u6A21\u5F0F").addToggle(l=>l.setValue(a.enableThinking??!1).onChange(c=>{this.editDraft.enableThinking=c})),new E.Setting(t).setName("Reasoning Effort").addDropdown(l=>{l.addOption("","\u9ED8\u8BA4").addOption("high","high").addOption("max","max").setValue(a.reasoningEffort||"").onChange(c=>{this.editDraft.reasoningEffort=c})});let o=new E.Setting(t);o.addButton(l=>{l.setButtonText("\u4FDD\u5B58").setCta().onClick(async()=>{let c=this.editDraft;if(!c.name.trim()||!c.model.trim()||!c.baseUrl.trim()){new E.Notice("\u540D\u79F0\u3001\u6A21\u578B\u548C Base URL \u4E0D\u80FD\u4E3A\u7A7A");return}this.plugin.settings=Vt(this.plugin.settings,i.id,c),await this.plugin.saveSettings(),this.editingProviderId=null,this.editDraft=null,this.display(),new E.Notice("Provider \u5DF2\u66F4\u65B0")})}),o.addButton(l=>{l.setButtonText("\u53D6\u6D88").onClick(()=>{this.editingProviderId=null,this.editDraft=null,this.display()})})}else s.addButton(o=>{o.setButtonText("\u7F16\u8F91").onClick(()=>{this.editingProviderId=i.id,this.editDraft={...i},this.display()})}),s.addButton(o=>{o.setButtonText("\u6D4B\u8BD5").onClick(async()=>{new E.Notice("\u6B63\u5728\u6D4B\u8BD5...");try{let l=await Te([{role:"user",content:"\u4F60\u597D"}],{provider:i.providerType||"openai",apiKey:i.apiKey,model:i.model,baseUrl:i.baseUrl,enableThinking:i.enableThinking,reasoningEffort:i.reasoningEffort});new E.Notice("\u8FDE\u63A5\u6210\u529F: "+l.content.substring(0,50))}catch(l){new E.Notice(jt(l))}})}),s.addButton(o=>{o.setButtonText("\u5220\u9664").onClick(async()=>{this.plugin.settings=Ht(this.plugin.settings,i.id),await this.plugin.saveSettings(),this.display()})})}async detectAndShowAgents(t){t.empty();let{resolveExecutable:i}=await Promise.resolve().then(()=>(de(),Je)),n=[{key:"claude-code",name:"Claude Code",binary:"claude"},{key:"hermes",name:"Hermes",binary:"hermes"}];for(let r of n){let a=t.createEl("div",{cls:"tracemind-agent-row"}),o=!!await i(r.binary);a.createEl("span",{cls:`tracemind-agent-dot ${o?"available":"unavailable"}`}).setText(o?"\u{1F7E2}":"\u{1F534}"),a.createEl("span",{text:`${r.name} ${o?"\u2014 \u5DF2\u68C0\u6D4B\u5230":"\u2014 \u672A\u68C0\u6D4B\u5230\uFF0C\u8BF7\u786E\u8BA4\u5DF2\u5B89\u88C5"}`,cls:"tracemind-agent-label"})}}};var Ut={providers:[],defaultProviderId:"",agentProviderMapping:{analysis:"",chat:""},localAgentEnabled:!1};var v=require("obsidian");var Xe=require("obsidian"),ar=".lifewiki/templates";async function sr(e,t){let i=`templates/${t}`,n=e.getAbstractFileByPath(i);if(n instanceof Xe.TFile)return await e.read(n);let r=`${ar}/${t}`;return n=e.getAbstractFileByPath(r),n instanceof Xe.TFile?await e.read(n):null}function pe(e,t){return t.split(".").reduce((i,n)=>i?.[n],e)}function or(e,t){let i=e,n=/\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;i=i.replace(n,(a,s,o)=>{if(!pe(t,s.trim())){let u=o.split(/\{\{else\}\}/);return u.length>1?u[1].trim():""}return o.split(/\{\{else\}\}/)[0].trim()});let r=/\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g;return i=i.replace(r,(a,s,o)=>{let l=pe(t,s.trim());return!Array.isArray(l)||l.length===0?"":l.map(c=>{let u=o;return u=u.replace(/\{\{this\.([^}]+)\}\}/g,(d,f)=>pe(c,f.trim())??""),u=u.replace(/\{\{([^#/][^}]*?)\}\}/g,(d,f)=>{let p=f.trim();return p==="this"?String(c):pe(c,p)??""}),(typeof c=="string"||typeof c=="number")&&(u=u.replace(/\{\{this\}\}/g,String(c))),u}).join("")}),i}function lr(e,t){let i=e,n=/\{\{([^#/][^}]*?)\}\}/g;return i=i.replace(n,(r,a)=>{let s=a.trim(),o=pe(t,s);return o==null?"":typeof o=="object"?JSON.stringify(o):String(o)}),i}async function zt(e,t,i){let n=await sr(e,t);n===null&&(console.warn(`[TemplateLoader] Template not found: ${t}, falling back to default`),n=cr(t,i));let r=or(n,i);return r=lr(r,i),r}function cr(e,t){switch(e.replace("-template.md","")){case"journal":return`# ${t.date||"Untitled"}

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
`;default:return"{{content}}"}}async function te(e,t){if(!e.vault.getAbstractFileByPath(t))try{await e.vault.createFolder(t)}catch(n){if(!n.message?.includes("already exists"))throw n}}async function O(e,t){let i=t.split("/");if(i.length<2)return;let n=i.slice(0,-1),r="";for(let a of n)r=r?`${r}/${a}`:a,await te(e,r)}var Ze="Daily/attachments";function et(e){return e.replace(/[\\/:*?"<>|]/g,"_").split("").filter(i=>i.charCodeAt(0)>31&&i.charCodeAt(0)!==127).join("").trim()||"attachment"}function Yt(e,t){let i=et(e),n=i.lastIndexOf("."),r=n>0?i.slice(0,n):i,a=n>0?i.slice(n):"",s=`${Ze}/${r}${a}`;if(!t(s))return s;for(let o=1;o<100;o++)if(s=`${Ze}/${r}-${o}${a}`,!t(s))return s;return`${Ze}/${r}-${Date.now()}${a}`}function Kt(e){return`![[${e}]]`}function Wt(e,t,i,n){let r=e.slice(0,i),a=e.slice(n),s=r.length>0&&r[r.length-1]!==`
`?`
`:"",o=a.length>0&&a[0]!==`
`?`
`:"",l=r+s+t+o+a,c=r.length+s.length+t.length;return{value:l,cursor:c}}var $="tracemind-block-editor",ie="Daily",Gt="\u8BB0\u5F55\uFF0C\u662FAI\u65F6\u4EE3\u7684\u4EBA\u751F\u590D\u5229\u3002";function tt(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,e=>{let t=Math.random()*16|0;return(e==="x"?t:t&3|8).toString(16)})}function it(e){let t=0;for(let n=0;n<e.length;n++){let r=e.charCodeAt(n);t=(t<<5)-t+r,t=t&t}let i=Math.abs(t).toString(16).padStart(8,"0");return`${i.substring(0,8)}-${i.substring(0,4)}-4${i.substring(0,3)}-${i.substring(0,4)}-${i.substring(0,12)}`}function Fe(e){let t=Array.isArray(e)?e.join(" "):e||"";return Array.from(new Set(t.split(/[\s,，#]+/).map(i=>i.trim()).filter(Boolean))).slice(0,6)}function nt(e){return Fe(e).join(" ")||"\u5F85\u5206\u6790"}function Me(e){return Fe(e).map(t=>`#${t}`).join(" ")||"#\u5F85\u5206\u6790"}var Be=class extends v.ItemView{plugin;blocks=[];selectedBlockId=null;currentDate;inputValue="";isLoading=!1;contentContainer=null;childInputEl=null;selectedBlockContent=null;inputAreaEl=null;inputTextarea=null;inputHintEl=null;inputAppendFooterEl=null;appendModeActionsEl=null;appendSubmitBtn=null;isAppendMode=!1;appendModeBlockId=null;isEditMode=!1;editModeBlockId=null;flowLineEl=null;constructor(t,i){super(t),this.plugin=i,this.currentDate=this.formatDate(new Date)}getBlockById(t){return this.blocks.find(i=>i.id===t)}focusBlockById(t){if(this.blocks.find(n=>n.id===t))return this.selectedBlockId=t,this.isAppendMode=!1,this.appendModeBlockId=null,this.isEditMode=!1,this.editModeBlockId=null,this.renderBlocks(),this.scrollBlockIntoView(t),!0;for(let n of this.blocks)if(n.children.find(a=>a.id===t))return this.selectedBlockId=t,this.isAppendMode=!1,this.appendModeBlockId=null,this.isEditMode=!1,this.editModeBlockId=null,this.renderBlocks(),this.scrollBlockIntoView(t,!0),!0;return!1}startAppendForBlock(t,i){let n=t;if(!this.blocks.find(a=>a.id===t)){let a=this.blocks.find(s=>s.children.some(o=>o.id===t));if(!a)return!1;n=a.id}return this.selectBlock(n),this.scrollBlockIntoView(n),i&&this.inputTextarea&&(this.inputTextarea.placeholder=i,this.inputHintEl&&(this.inputHintEl.textContent=i,this.inputHintEl.removeAttribute("style")),setTimeout(()=>this.inputTextarea?.focus(),0)),!0}getViewType(){return $}getDisplayText(){return"TraceMind \u8FF9\u5FC6"}getIcon(){return"brain"}async setCurrentDate(t){this.currentDate=this.formatDate(t),await this.renderView()}async renderView(){let t=this.containerEl;t.empty();let i=t.createEl("div",{cls:"lifewiki-diary-container",attr:{style:"display: flex; flex-direction: column; height: 100%;"}});this.addStyles();let n=i.createEl("div",{cls:"lifewiki-diary-header"}),r=n.createEl("h1",{cls:"lifewiki-diary-date"});r.createEl("span",{text:"\u{1F4C5}",cls:"lifewiki-diary-date-icon"}),r.createEl("span",{text:this.currentDate});let a=await this.loadSlogan();n.createEl("span",{text:a,cls:"lifewiki-diary-tagline"}),i.createEl("h2",{text:"Flow of Today\uFF1A",cls:"lifewiki-diary-section-title"}),this.contentContainer=i.createEl("div",{cls:"lifewiki-diary-content",attr:{style:"flex: 1; overflow-y: auto;"}}),await this.loadBlocks(),this.createInputArea(i),this.contentContainer?.addEventListener("click",s=>{let o=s.target,l=o.closest(".lifewiki-block.editing, .lifewiki-block-group.editing, .lifewiki-block-child.editing"),c=o.closest(".lifewiki-block, .lifewiki-block-group, .lifewiki-block-child"),u=o.closest(".lifewiki-input-area");this.isEditMode&&!l&&this.exitEditMode(),this.isAppendMode&&!c&&!u&&this.cancelAppendMode(),!this.isAppendMode&&!this.isEditMode&&!c&&(this.selectedBlockId=null,this.plugin.getAIAnalysisView()?.clearConversation())})}async onOpen(){await this.renderView()}addStyles(){let t=document.createElement("style");t.textContent=`
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
			}

			.lifewiki-block:hover .lifewiki-block-card {
				box-shadow: 0 14px 50px -10px rgba(26, 28, 28, 0.08);
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
		`,this.containerEl.appendChild(t)}createInputArea(t){this.inputAreaEl=t.createEl("div",{cls:"lifewiki-input-area"});let i=this.inputAreaEl.createEl("div",{cls:"lifewiki-input-inner"});this.inputTextarea=i.createEl("textarea",{cls:"lifewiki-input-box",attr:{placeholder:"\u8BB0\u5F55\u4ECA\u5929\u7684\u751F\u6D3B..."}});let n=i.createEl("div",{cls:"lifewiki-input-bottom"}),r=n.createEl("div",{cls:"lifewiki-input-left-actions"}),a=n.createEl("input",{attr:{type:"file",style:"display:none"}});a.addEventListener("change",()=>{this.handleAttachmentSelect(a)}),r.createEl("button",{cls:"lifewiki-attachment-btn",attr:{type:"button",title:"\u6DFB\u52A0\u9644\u4EF6"},text:"+"}).addEventListener("click",()=>{a.click()}),this.inputHintEl=r.createEl("span",{cls:"lifewiki-input-hint",text:"Enter \u53D1\u9001"});let o=n.createEl("div",{cls:"lifewiki-input-right-actions"});this.appendModeActionsEl=o.createEl("div",{cls:"lifewiki-append-mode-actions"}),this.appendSubmitBtn=this.appendModeActionsEl.createEl("button",{cls:"lifewiki-append-submit-btn",text:"\u5C06\u5728 HH:mm \u8FD9\u6761\u65E5\u8BB0\u4E0B\u8FFD\u52A0"}),this.appendSubmitBtn.addEventListener("click",()=>{this.submitAppend()}),this.appendModeActionsEl.createEl("button",{cls:"lifewiki-append-cancel-btn",text:"\xD7"}).addEventListener("click",()=>{this.cancelAppendMode()});let c=o.createEl("button",{cls:"lifewiki-diary-send-btn",attr:{type:"button",title:"\u53D1\u9001\u65E5\u8BB0"}});(0,v.setIcon)(c,"arrow-up"),c.addEventListener("click",u=>{u.preventDefault(),u.stopPropagation(),this.isAppendMode?this.submitAppend():this.inputTextarea&&this.submitBlock(this.inputTextarea)}),this.inputTextarea.addEventListener("focus",()=>{this.plugin.getAIAnalysisView()?.setMode("analysis"),this.isAppendMode||this.scrollToLastBlock()}),this.inputTextarea.addEventListener("input",()=>{if(!this.inputTextarea)return;this.inputValue=this.inputTextarea.value;let u=this.inputTextarea.value.length;this.inputHintEl.textContent=`${u}/250 \xB7 Enter \u53D1\u9001`}),this.inputTextarea.addEventListener("keydown",u=>{u.key==="Enter"&&(this.isAppendMode?u.shiftKey||(u.preventDefault(),this.submitAppend()):u.shiftKey||(u.preventDefault(),this.submitBlock(this.inputTextarea)))}),this.textarea=this.inputTextarea}async loadBlocks(){let t=`Daily/${this.currentDate}.md`,i=this.app.vault.getAbstractFileByPath(t);if((!i||!(i instanceof v.TFile))&&(i=this.app.vault.getAbstractFileByPath(`${this.currentDate}.md`)),(!i||!(i instanceof v.TFile))&&(i=this.app.vault.getAbstractFileByPath(`${ie}/${this.currentDate}.md`)),!i||!(i instanceof v.TFile)){this.renderEmptyState();return}let n=await this.app.vault.read(i);this.parseBlocksFromContent(n),this.renderBlocks()}async loadSlogan(){let t=`Daily/${this.currentDate}.md`,i=this.app.vault.getAbstractFileByPath(t);if((!i||!(i instanceof v.TFile))&&(i=this.app.vault.getAbstractFileByPath(`${this.currentDate}.md`)),(!i||!(i instanceof v.TFile))&&(i=this.app.vault.getAbstractFileByPath(`${ie}/${this.currentDate}.md`)),!i||!(i instanceof v.TFile))return Gt;let r=(await this.app.vault.read(i)).match(/>\s*\[!NOTE\]\s*(.+)/);return r&&r[1]?r[1].trim():Gt}renderEmptyState(){this.contentContainer&&(this.contentContainer.empty(),this.contentContainer.createEl("div",{cls:"lifewiki-empty-state",text:`\u4ECA\u5929\u7684\u65E5\u8BB0\u8FD8\u6CA1\u6709\u5F00\u59CB\u3002
\u5728\u4E0B\u65B9\u8F93\u5165\u6846\u8BB0\u5F55\u4F60\u7684\u751F\u6D3B\u5427\u3002`}))}parseBlocksFromContent(t){this.blocks=[];let i=t.split(`
`),n=null,r=[],a=[],s=null;for(let o of i){let l=o.match(/^### (\d{2}:\d{2}) \[([^\]]+)\]\s+(.+)$/);if(l&&(n&&(s&&(n.id=s),n.content=r.join(`
`).trim(),n.children=[...a],this.blocks.push(n),s=null),n={id:it(l[0]),timestamp:l[1],source:l[2],category:nt(Fe(l[3])),content:"",children:[],parentId:null},r=[],a=[]),n&&!s){let c=o.trim(),u=c.match(/^<!-- ([a-f0-9-]+) -->$/);if(u){s=u[1];continue}let d=c.match(/^<sub[^>]*>([a-f0-9-]+)<\/sub>$/i);if(d){s=d[1];continue}}if(o.startsWith("- ")&&n){let c=o.match(/^- (\d{2}:\d{2})?\s+(.+?)\s*(?:<!-- ([a-f0-9-]+) -->)?$/);if(c){let u=c[1]||"",d=(c[2]||"").replace(/<!--[\s\S]*?-->/g,"").replace(/<sub[^>]*>[\s\S]*?<\/sub>/gi,"").trim(),f=c[3]||it(o);if(d){a.push({id:f,timestamp:u,content:d,parentId:n.id});continue}}else{let u=o.substring(2).replace(/<!--[\s\S]*?-->/g,"").replace(/<sub[^>]*>[\s\S]*?<\/sub>/gi,"").trim();u&&a.push({id:it(o),timestamp:"",content:u,parentId:n.id});continue}}if(o.trim()&&n&&!o.startsWith("#")&&!o.startsWith(">")){let c=o.trim().replace(/<!--[\s\S]*?-->/g,"").replace(/<sub[^>]*>[\s\S]*?<\/sub>/gi,"").trim();c&&r.push(c)}}n&&(s&&(n.id=s),n.content=r.join(`
`).trim(),n.children=a,this.blocks.push(n))}renderBlocks(){if(this.contentContainer){if(this.contentContainer.empty(),this.flowLineEl=this.contentContainer.createEl("div",{cls:"flow-line"}),this.blocks.length===0){this.renderEmptyState();return}for(let t of this.blocks)this.renderBlock(t);this.extendFlowLine(),this.isAppendMode||setTimeout(()=>{this.scrollToLastBlock()},100)}}extendFlowLine(){!this.flowLineEl||!this.contentContainer||setTimeout(()=>{if(!this.flowLineEl||!this.contentContainer)return;let t=Array.from(this.contentContainer.querySelectorAll(".lifewiki-block, .lifewiki-block-group"));if(t.length===0)return;let i=0;for(let n of t){let r=n.offsetTop+n.offsetHeight;r>i&&(i=r)}this.flowLineEl.style.height=`${i+30}px`},50)}scrollToLastBlock(){this.contentContainer&&(this.contentContainer.scrollTop=this.contentContainer.scrollHeight)}scrollBlockIntoView(t,i=!1){setTimeout(()=>{let n=i?`[data-child-id="${t}"]`:`[data-block-id="${t}"]`;this.contentContainer?.querySelector(n)?.scrollIntoView({block:"center",behavior:"smooth"})},50)}renderBlock(t){if(!this.contentContainer)return;let i=t.id===this.selectedBlockId,n=t.id===this.editModeBlockId,r=t.children.length>0,a=r?"lifewiki-block-group":"lifewiki-block";i&&(a+=" selected"),n&&(a+=" editing");let s=this.contentContainer.createEl("div",{cls:a,attr:{"data-block-id":t.id}}),o=s.createEl("div",{cls:"lifewiki-block-card"});if(n){let l=o.createEl("div",{cls:"lifewiki-main-wrapper"});l.createEl("span",{text:t.timestamp,cls:"lifewiki-block-timestamp"});let c=l.createEl("textarea",{cls:"lifewiki-edit-textarea",attr:{placeholder:"\u8F93\u5165\u5185\u5BB9..."}});c.value=t.content,c.dataset.field="content";let u=l.createEl("input",{cls:"lifewiki-edit-input",attr:{value:t.category,placeholder:"#\u6807\u7B7E"}});u.dataset.field="category",this.editTagInput=u,this.editContentTextarea=c}else if(t.content){let l=o.createEl("span",{cls:"lifewiki-main-wrapper"});l.createEl("span",{text:t.timestamp,cls:"lifewiki-block-timestamp"});let c=l.createEl("span",{cls:"lifewiki-block-content"});v.MarkdownRenderer.render(this.app,t.content,c,`Daily/${this.currentDate}.md`,this);let u=l.createEl("div",{cls:"lifewiki-block-tags"});for(let d of Fe(t.category))u.createEl("a",{text:`#${d}`,cls:"tag lifewiki-block-tag",attr:{href:`#${d}`,"data-tag":d}})}if(r){let l=s.createEl("div",{cls:"lifewiki-block-children"});for(let c of t.children){let u=c.id===this.selectedBlockId,d=this.editingChildId===c.id,f=l.createEl("div",{cls:"lifewiki-block-child"+(u?" selected":"")+(d?" editing":""),attr:{"data-child-id":c.id}}),p=f.createEl("div",{cls:"lifewiki-block-child-card"});c.timestamp&&p.createEl("span",{text:c.timestamp,cls:"lifewiki-block-child-timestamp"});let h=p.createEl("div",{cls:"lifewiki-block-child-body"});if(d){let g=h.createEl("textarea",{cls:"lifewiki-edit-textarea",attr:{placeholder:"\u8F93\u5165\u5185\u5BB9..."}});g.value=c.content,this.editContentTextarea=g}else{let g=h.createEl("div",{cls:"lifewiki-block-child-content"});v.MarkdownRenderer.render(this.app,c.content,g,`Daily/${this.currentDate}.md`,this)}f.addEventListener("click",g=>{g.stopPropagation(),this.isEditMode||this.selectChildBlock(c.id,t.id)}),p.addEventListener("dblclick",g=>{g.stopPropagation(),this.startChildEditMode(c.id,t.id)}),f.addEventListener("contextmenu",g=>{g.preventDefault(),g.stopPropagation(),this.selectChildBlock(c.id,t.id),this.showContextMenu(c.id,t.id,!0,g.clientX,g.clientY)})}}i&&this.selectedBlockId===t.id&&this.childInputEl&&s.appendChild(this.childInputEl),o.addEventListener("click",()=>{this.isEditMode||this.selectBlock(t.id)}),o.addEventListener("dblclick",()=>{this.startEditMode(t.id)}),o.addEventListener("contextmenu",l=>{l.preventDefault(),l.stopPropagation(),this.selectBlock(t.id),this.showContextMenu(t.id,null,!1,l.clientX,l.clientY)})}async selectBlock(t){this.childInputEl=null,this.isEditMode=!1,this.editModeBlockId=null,this.selectedBlockId=t,this.isAppendMode=!0,this.appendModeBlockId=t,this.updateInputAreaForAppendMode(),this.renderBlocks();let i=this.blocks.find(n=>n.id===t);if(i){this.selectedBlockContent=i.content;let n=this.plugin.getAIAnalysisView();if(n)if(n.setMode("analysis"),i.category==="\u5F85\u5206\u6790"){let a=this.plugin.getSessionManager().getSession(i.id,null);a&&a.messages&&a.messages.length>0?n.setActiveBlock(t,i.content):await this.startAIAnalysis(i)}else n.setActiveBlock(t,i.content)}}selectChildBlock(t,i){this.childInputEl=null,this.isEditMode=!1,this.editModeBlockId=null,this.selectedBlockId=t,this.isAppendMode=!1,this.appendModeBlockId=null,this.renderBlocks();let n=this.blocks.find(r=>r.id===i);if(n){this.selectedBlockContent=n.content;let r=this.plugin.getAIAnalysisView();r&&(r.setMode("analysis"),r.setActiveBlock(t,n.content,i))}}showContextMenu(t,i,n,r,a){let s=document.querySelector(".lifewiki-context-menu");s&&s.remove();let o=document.createElement("div");o.className="lifewiki-context-menu",o.style.left=`${r}px`,o.style.top=`${a}px`;let l=this.plugin.getSessionManager(),c=i||t,u=l.getSession(c,i)!==null,d="";if(n){let h=this.blocks.find(g=>g.id===i);if(h){let g=h.children.length;d=g>1?` (\u5171 ${g} \u4E2A\u5B50Block)`:""}}else{let h=this.blocks.find(g=>g.id===t);h&&h.children.length>0&&(d=` (\u542B ${h.children.length} \u4E2A\u5B50Block)`)}let f=document.createElement("div");if(f.className="lifewiki-context-menu-item danger",f.textContent=n?"\u5220\u9664\u6B64\u5B50Block":`\u5220\u9664\u65E5\u8BB0Block${d}`,f.addEventListener("click",()=>{o.remove(),this.confirmAndDeleteBlock(t,i,n,!1)}),o.appendChild(f),u&&!n){let h=document.createElement("div");h.className="lifewiki-context-menu-item danger",h.textContent=`\u5220\u9664Block\u53CA\u4F1A\u8BDD\u8BB0\u5F55${d}`,h.addEventListener("click",()=>{o.remove(),this.confirmAndDeleteBlock(t,i,n,!0)}),o.appendChild(h)}document.body.appendChild(o);let p=h=>{o.contains(h.target)||(o.remove(),document.removeEventListener("click",p))};setTimeout(()=>document.addEventListener("click",p),0)}async confirmAndDeleteBlock(t,i,n,r){let a,s=0;if(n){let l=this.blocks.find(c=>c.id===i);l&&(s=l.children.length),a="\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u5B50Block\u5417\uFF1F",s>1&&(a+=`

\u6CE8\u610F\uFF1A\u7236Block\u8FD8\u6709 ${s-1} \u4E2A\u5B50Block\u3002`)}else{let l=this.blocks.find(c=>c.id===t);l&&(s=l.children.length),r?a="\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u65E5\u8BB0Block\u53CA\u5176\u4F1A\u8BDD\u8BB0\u5F55\u5417\uFF1F":a="\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u65E5\u8BB0Block\u5417\uFF1F",s>0&&(a+=`

\u6CE8\u610F\uFF1A\u8FD9\u5C06\u540C\u65F6\u5220\u9664\u6240\u6709 ${s} \u4E2A\u5B50Block\u3002`),r&&(a+=`

\u4F1A\u8BDD\u8BB0\u5F55\u5C06\u88AB\u6C38\u4E45\u5220\u9664\u3002`)}confirm(a)&&await this.deleteBlock(t,i,n,r)}async deleteBlock(t,i,n,r){try{if(n&&i?await this.deleteChildBlockFromFile(t,i):await this.deleteParentBlockFromFile(t,r),r){let s=this.plugin.getSessionManager(),o=i||t;await s.clearSession(o)}await this.loadBlocks(),this.renderBlocks(),this.selectedBlockId=null,this.selectedBlockContent=null;let a=this.plugin.getAIAnalysisView();a&&a.setActiveBlock(null,null)}catch(a){console.error("[LifeWiki] Error deleting block:",a),alert("\u5220\u9664\u5931\u8D25: "+(a instanceof Error?a.message:"\u672A\u77E5\u9519\u8BEF"))}}async deleteChildBlockFromFile(t,i){let n=`Daily/${this.currentDate}.md`,r=this.app.vault.getAbstractFileByPath(n);if((!r||!(r instanceof v.TFile))&&(r=this.app.vault.getAbstractFileByPath(`${this.currentDate}.md`)),(!r||!(r instanceof v.TFile))&&(r=this.app.vault.getAbstractFileByPath(`${ie}/${this.currentDate}.md`)),!(r instanceof v.TFile))return;let s=(await this.app.vault.read(r)).split(`
`),o=new RegExp(`^- \\d{2}:\\d{2}\\s.+<!-- ${t} -->`),l=s.filter(u=>!u.match(o));await this.app.vault.modify(r,l.join(`
`));let c=this.blocks.find(u=>u.id===i);c&&(c.children=c.children.filter(u=>u.id!==t))}async deleteParentBlockFromFile(t,i){let n=`Daily/${this.currentDate}.md`,r=this.app.vault.getAbstractFileByPath(n);if((!r||!(r instanceof v.TFile))&&(r=this.app.vault.getAbstractFileByPath(`${this.currentDate}.md`)),(!r||!(r instanceof v.TFile))&&(r=this.app.vault.getAbstractFileByPath(`${ie}/${this.currentDate}.md`)),!(r instanceof v.TFile))return;let s=(await this.app.vault.read(r)).split(`
`),o=-1,l=new RegExp("^### \\d{2}:\\d{2} \\[([^\\]]+)\\] #(\\S+)");for(let u=0;u<s.length;u++)if(s[u].match(l)){let d=this.blocks.find(f=>f.id===t);if(d&&s[u].includes(d.timestamp)){for(let f=u+1;f<Math.min(u+5,s.length);f++)if(s[f].includes(`<!-- ${t} -->`)){o=u;break}if(o!==-1)break}}if(o===-1)return;let c=s.length;for(let u=o+1;u<s.length;u++)if(s[u].match(l)){c=u;break}s.splice(o,c-o),await this.app.vault.modify(r,s.join(`
`)),this.blocks=this.blocks.filter(u=>u.id!==t)}startChildEditMode(t,i){this.isAppendMode=!1,this.appendModeBlockId=null,this.selectedBlockId=null,this.updateInputAreaForAppendMode(),this.editModeBlockId=t,this.isEditMode=!0,this.editingChildId=t,this.editingParentId=i,this.renderBlocks(),setTimeout(()=>{let n=this.contentContainer?.querySelector(".lifewiki-edit-textarea");n&&(n.focus(),n.addEventListener("keydown",this.handleChildEditKeydown.bind(this)))},0)}handleChildEditKeydown(t){t.key==="Enter"&&!t.shiftKey?(t.preventDefault(),this.saveChildEditMode()):t.key==="Escape"&&this.cancelChildEditMode()}cancelChildEditMode(){this.isEditMode=!1,this.editModeBlockId=null,this.editingChildId=null,this.editingParentId=null,this.renderBlocks()}async saveChildEditMode(){let t=this.editingChildId,i=this.editingParentId;if(!t||!i)return;let n=this.blocks.find(o=>o.id===i);if(!n)return;let r=n.children.findIndex(o=>o.id===t);if(r===-1)return;let s=this.contentContainer?.querySelector(".lifewiki-edit-textarea")?.value.trim()||"";n.children[r].content=s,await this.saveBlockToFile(n),this.isEditMode=!1,this.editModeBlockId=null,this.editingChildId=null,this.editingParentId=null,this.renderBlocks()}async handleAttachmentSelect(t){let i=t.files;if(!(!i||i.length===0)&&this.inputTextarea)try{for(let n of Array.from(i)){let r=et(n.name),a=Yt(r,c=>this.app.vault.getAbstractFileByPath(c)!==null);await O(this.app,a);let s=await n.arrayBuffer();await this.app.vault.createBinary(a,s);let o=Kt(a),l=Wt(this.inputTextarea.value,o,this.inputTextarea.selectionStart,this.inputTextarea.selectionEnd);this.inputTextarea.value=l.value,this.inputTextarea.selectionStart=l.cursor,this.inputTextarea.selectionEnd=l.cursor,this.inputValue=this.inputTextarea.value,this.isAppendMode||(this.inputHintEl.textContent=`${this.inputTextarea.value.length}/250 \xB7 Enter \u53D1\u9001`)}}catch(n){new v.Notice("\u9644\u4EF6\u4FDD\u5B58\u5931\u8D25: "+n.message)}finally{t.value=""}}updateInputAreaForAppendMode(){if(!this.inputTextarea||!this.inputHintEl||!this.appendModeActionsEl||!this.appendSubmitBtn)return;let t=this.blocks.find(i=>i.id===this.appendModeBlockId);this.isAppendMode&&t?(this.inputTextarea.addClass("append-mode"),this.inputTextarea.placeholder="\u8FFD\u52A0\u8BB0\u5F55...",this.inputHintEl.textContent=`\u5C06\u5728 ${t.timestamp} \u8BE5\u6761\u65E5\u8BB0\u4E0B\u8FFD\u52A0\u8BB0\u5F55`,this.inputHintEl.setAttribute("style","display: none;"),this.appendSubmitBtn.textContent=`\u5C06\u5728 ${t.timestamp} \u8FD9\u6761\u65E5\u8BB0\u4E0B\u8FFD\u52A0`,this.appendModeActionsEl.classList.add("visible"),this.inputTextarea.value="",this.inputValue="",setTimeout(()=>this.inputTextarea?.focus(),0)):(this.inputTextarea.removeClass("append-mode"),this.inputTextarea.placeholder="\u8BB0\u5F55\u4ECA\u5929\u7684\u751F\u6D3B...",this.inputHintEl.textContent="Enter \u53D1\u9001 \xB7 \u6700\u591A 250 \u5B57",this.inputHintEl.removeAttribute("style"),this.appendModeActionsEl.classList.remove("visible"))}cancelAppendMode(){this.isAppendMode=!1,this.appendModeBlockId=null,this.selectedBlockId=null,this.updateInputAreaForAppendMode(),this.renderBlocks()}async submitAppend(){if(!this.isAppendMode||!this.appendModeBlockId)return;let t=this.inputTextarea?.value.trim();if(!t)return;let i=this.blocks.find(r=>r.id===this.appendModeBlockId);if(!i)return;let n=await this.appendChildToBlock(i,t);n&&(i.children.push(n),this.inputTextarea.value="",this.inputValue="",this.isAppendMode=!1,this.appendModeBlockId=null,this.selectedBlockId=null,this.updateInputAreaForAppendMode(),this.renderBlocks(),await this.startAIAnalysis(n))}startEditMode(t){this.isAppendMode=!1,this.appendModeBlockId=null,this.selectedBlockId=null,this.updateInputAreaForAppendMode(),this.editModeBlockId=t,this.isEditMode=!0,this.renderBlocks(),setTimeout(()=>{let i=this.contentContainer?.querySelector(".lifewiki-edit-textarea");i&&(i.focus(),i.addEventListener("keydown",this.handleEditKeydown.bind(this)))},0)}handleEditKeydown(t){t.key==="Enter"&&!t.shiftKey?(t.preventDefault(),this.saveEditMode()):t.key==="Escape"&&this.cancelEditMode()}async saveEditMode(){if(!this.editModeBlockId)return;let t=this.blocks.find(s=>s.id===this.editModeBlockId);if(!t)return;let i=this.contentContainer?.querySelector(".lifewiki-edit-textarea"),n=this.contentContainer?.querySelector(".lifewiki-edit-input"),r=i?.value.trim()||"",a=n?.value.trim()||t.category;t.content=r,t.category=a,this.isEditMode=!1,this.editModeBlockId=null,this.renderBlocks(),await this.saveBlockToFile(t)}cancelEditMode(){this.isEditMode=!1,this.editModeBlockId=null,this.renderBlocks()}exitEditMode(){this.isEditMode&&this.saveEditMode()}async appendChildToBlock(t,i){let n=`Daily/${this.currentDate}.md`,r=this.app.vault.getAbstractFileByPath(n);if((!r||!(r instanceof v.TFile))&&(r=this.app.vault.getAbstractFileByPath(`${this.currentDate}.md`)),(!r||!(r instanceof v.TFile))&&(r=this.app.vault.getAbstractFileByPath(`${ie}/${this.currentDate}.md`)),!(r instanceof v.TFile))return null;let s=(await this.app.vault.read(r)).split(`
`),o=`### ${t.timestamp} [${t.source}] ${Me(t.category)}`,l=-1;for(let h=0;h<s.length;h++)if(s[h].includes(o)){l=h;break}if(l===-1)return null;let c=s.length;for(let h=l+1;h<s.length;h++)if(s[h].startsWith("### ")){c=h;break}let u=new Date,d=`${u.getHours().toString().padStart(2,"0")}:${u.getMinutes().toString().padStart(2,"0")}`,f=tt(),p=`- ${d} ${i} <!-- ${f} -->`;return s.splice(c,0,p),await this.app.vault.modify(r,s.join(`
`)),{id:f,timestamp:d,content:i,parentId:t.id}}async saveBlockToFile(t){let i=`Daily/${this.currentDate}.md`,n=this.app.vault.getAbstractFileByPath(i);if((!n||!(n instanceof v.TFile))&&(n=this.app.vault.getAbstractFileByPath(`${this.currentDate}.md`)),(!n||!(n instanceof v.TFile))&&(n=this.app.vault.getAbstractFileByPath(`${ie}/${this.currentDate}.md`)),!(n instanceof v.TFile))return;let a=(await this.app.vault.read(n)).split(`
`),s=-1,o=new RegExp(`^### ${t.timestamp} \\[([^\\]]+)\\]\\s+(.+)`);for(let p=0;p<a.length;p++)if(a[p].match(o)){s=p;break}if(s===-1)return;let l=`### ${t.timestamp} [${t.source}] ${Me(t.category)}`;a[s]=l;let c=s+1;for(;c<a.length&&!(a[c].startsWith("### ")||a[c].startsWith("- ")&&a[c].match(/^- \d{2}:\d{2}\s/));){if(a[c].trim()&&!a[c].startsWith("#")){a[c]=t.content;break}c++}(c>=a.length||a[c].trim()==="")&&a.splice(s+1,0,t.content);let u=`<!-- ${t.id} -->`,d=-1;for(let p=s+1;p<a.length;p++)if(a[p].startsWith("### ")||a[p].startsWith("- ")&&a[p].match(/^- \d{2}:\d{2}\s/)){d=p;break}d===-1&&(d=a.length);let f=!1;for(let p=s+1;p<d;p++)if(a[p].trim().match(/^<!-- [a-f0-9-]+ -->$/)){a[p]=u,f=!0;break}f||a.splice(d,0,u),await this.app.vault.modify(n,a.join(`
`))}async submitBlock(t){let i=t.value.trim();if(!i||this.isLoading)return;this.isLoading=!0;let n=new Date,r=`${n.getHours().toString().padStart(2,"0")}:${n.getMinutes().toString().padStart(2,"0")}`,a={id:tt(),timestamp:r,source:"TraceMind",category:"\u5F85\u5206\u6790",content:i,children:[],parentId:null};this.blocks.push(a),t.value="",this.inputValue="",this.renderBlocks(),await this.appendBlockToFile(a),await this.startAIAnalysis(a),this.isLoading=!1}async appendBlockToFile(t){let i=`Daily/${this.currentDate}.md`,n=this.app.vault.getAbstractFileByPath(i);if(n instanceof v.TFile||this.app.vault.getAbstractFileByPath("Daily")instanceof v.TFolder||await this.app.vault.createFolder("Daily"),(!n||!(n instanceof v.TFile))&&(n=this.app.vault.getAbstractFileByPath(`${this.currentDate}.md`)),!(n instanceof v.TFile)){let o=await zt(this.app.vault,"journal-template.md",{date:this.currentDate})+`
### ${t.timestamp} [${t.source}] ${Me(t.category)}
${t.content}
<!-- ${t.id} -->
`;await this.app.vault.create(i,o);return}let r=`
### ${t.timestamp} [${t.source}] ${Me(t.category)}
${t.content}
<!-- ${t.id} -->
`,a=await this.app.vault.read(n);await this.app.vault.modify(n,a+r)}async startAIAnalysis(t){if(!t.id){let o=tt();console.warn(`[TraceMind] block-editor: block "${t.content.substring(0,30)}..." has no ID, generated ${o}`),t.id=o}let i=this.plugin.getSessionManager(),n=this.plugin.getAIAnalysisView(),r=t.parentId||null;if(!r){let o=i.getSession(t.id,r);if(o&&o.messages&&o.messages.length>0){this.selectedBlockId=t.id,this.isAppendMode=!0,this.appendModeBlockId=t.id,this.selectedBlockContent=t.content,this.updateInputAreaForAppendMode(),this.renderBlocks(),n&&(n.setMode("analysis"),n.setActiveBlock(t.id,t.content));return}}i.getOrCreateSession(t.id,r);let a,s=[];if(r){let o=this.blocks.find(l=>l.id===r);if(o)for(let l of o.children)l.id!==t.id&&s.push({id:l.id,content:l.content})}try{a=await this.plugin.getAIProvider().analyzeBlock(t.content,t.id),console.log("[TraceMind] block-editor: analyzeBlock result:",a),console.log("[TraceMind] block-editor: aiView exists:",!!n);let l=i.setSession(t.id,a,r);if(console.log("[TraceMind] block-editor: persistedSession:",l),n){let c=t.content;console.log("[TraceMind] block-editor: calling showAgentSession"),l?n.showAgentSession(t.id,c,l,r):(console.log("[TraceMind] block-editor: no persistedSession, calling startNewSession"),n.startNewSession(t.id,c,a.aiResponse||"",r))}else console.warn("[TraceMind] block-editor: aiView is null");if(!r&&t.category==="\u5F85\u5206\u6790"&&a.areas&&a.areas.length>0){let c=nt(a.areas);t.category=c,await this.saveBlockToFile(t),this.renderBlocks()}}catch(o){if(n){let l=r&&this.blocks.find(c=>c.id===r)?.content||t.content;n.startNewSession(t.id,l,`\u9519\u8BEF: ${o.message}`)}}}async updateBlockCategory(t){try{let n=await this.plugin.getAIProvider().analyzeBlock(t.content,t.id);if(n.areas&&n.areas.length>0){let r=nt(n.areas);t.category=r,await this.saveBlockToFile(t)}}catch{}}formatDate(t){let i=t.getFullYear(),n=String(t.getMonth()+1).padStart(2,"0"),r=String(t.getDate()).padStart(2,"0");return`${i}-${n}-${r}`}async onClose(){}};var B=require("obsidian");function rt(e){let t=[],i=/\[TRACEMIND_ACTION\]\s*\n?([\s\S]*?)\n?\s*\[\/TRACEMIND_ACTION\]/g,n=e,r;for(;(r=i.exec(e))!==null;)try{let a=r[1].trim(),s=JSON.parse(a);t.push(s),n=n.replace(r[0],"")}catch{}return n=n.replace(/\[\/TRACEMIND_ACTION\]/g,""),n=n.replace(/\[TRACEMIND_ACTION\]/g,""),n=n.replace(/\n?\s*\{\s*"action"\s*:\s*"[^"]+"[\s\S]*?\}\s*$/g,""),{text:n.trim(),actions:t}}var ur={type:"person",label:"\u4EBA\u7269",commonAttributes:[{key:"company",label:"\u516C\u53F8/\u7EC4\u7EC7",priority:"P0"},{key:"role",label:"\u804C\u4F4D/\u89D2\u8272",priority:"P0"},{key:"relationship_to_user",label:"\u4E0E\u4F60\u7684\u5173\u7CFB",priority:"P0"},{key:"responsibility",label:"\u804C\u8D23",priority:"P1"},{key:"workingStyle",label:"\u534F\u4F5C\u98CE\u683C",priority:"P1",aliases:["communicationStyle"],description:"\u6BD4 communicationStyle \u66F4\u8D34\u8FD1\u65E5\u8BB0\u6D1E\u5BDF"},{key:"personality",label:"\u6027\u683C",priority:"P2"},{key:"preferences",label:"\u504F\u597D",priority:"P2"},{key:"skills",label:"\u6280\u80FD",priority:"P2"}]},at={company:{key:"company",label:"\u516C\u53F8/\u7EC4\u7EC7",priority:"P0",hints:["\u516C\u53F8\u3001\u5BA2\u6237\u3001\u4F9B\u5E94\u5546\u3001\u5408\u4F5C\u4F19\u4F34\u3001\u673A\u6784\u7B49\u6709\u4E13\u6709\u540D\u79F0\u7684\u7EC4\u7EC7","\u5982\uFF1A\u7A79\u5F7B\u667A\u80FD\u3001\u5B57\u8282\u8DF3\u52A8\u3001\u67D0\u4F9B\u5E94\u5546"],attributes:[{key:"relationship",label:"\u4E0E\u6211\u7684\u5173\u7CFB",priority:"P0"},{key:"roleInContext",label:"\u76F8\u5173\u89D2\u8272",priority:"P0"},{key:"industry",label:"\u884C\u4E1A",priority:"P1"},{key:"contactPeople",label:"\u8054\u7CFB\u4EBA",priority:"P1"},{key:"currentStatus",label:"\u5F53\u524D\u72B6\u6001",priority:"P1"},{key:"notes",label:"\u5907\u6CE8",priority:"P2"}]},project:{key:"project",label:"\u9879\u76EE",priority:"P0",attributes:[{key:"stage",label:"\u9636\u6BB5",priority:"P0"},{key:"owner",label:"\u8D1F\u8D23\u4EBA",priority:"P0"},{key:"deadline",label:"\u622A\u6B62\u65E5\u671F",priority:"P1"},{key:"stakeholders",label:"\u5229\u76CA\u76F8\u5173\u8005",priority:"P1"},{key:"blockers",label:"\u963B\u788D",priority:"P1"},{key:"successCriteria",label:"\u6210\u529F\u6807\u51C6",priority:"P1"},{key:"priority",label:"\u4F18\u5148\u7EA7",priority:"P2"},{key:"budget",label:"\u9884\u7B97",priority:"P2"}]},task:{key:"task",label:"\u4EFB\u52A1",priority:"P0",hints:["\u5F85\u529E\u4E8B\u9879\u3001\u4EA4\u4ED8\u7269\u3001\u6709\u660E\u786E\u622A\u6B62\u65E5\u671F\u7684\u884C\u52A8\u9879",'"XX\u5206\u6790"\u3001"XX\u62A5\u544A"\u3001"XX\u65B9\u6848"\u3001"XX\u8BC4\u4F30" \u90FD\u662F task','\u547D\u540D\u5EFA\u8BAE\uFF1A\u5F52\u5C5E\u9879\u76EE\u540D+\u4EFB\u52A1\u63CF\u8FF0\uFF08\u5982"910C\u9879\u76EE\u6295\u8D44\u5206\u6790"\uFF09'],attributes:[{key:"taskStatus",label:"\u72B6\u6001",priority:"P0",aliases:["status"]},{key:"nextAction",label:"\u4E0B\u4E00\u6B65",priority:"P0"},{key:"dueDate",label:"\u622A\u6B62\u65E5\u671F",priority:"P1",aliases:["deadline"]},{key:"assignee",label:"\u7ECF\u529E\u4EBA",priority:"P1"},{key:"parentProject",label:"\u6240\u5C5E\u9879\u76EE",priority:"P1"},{key:"priority",label:"\u4F18\u5148\u7EA7",priority:"P2"},{key:"effort",label:"\u5DE5\u4F5C\u91CF",priority:"P2"}]},product:{key:"product",label:"\u4EA7\u54C1",priority:"P1",attributes:[{key:"purpose",label:"\u7528\u9014",priority:"P0"},{key:"productStatus",label:"\u72B6\u6001",priority:"P0",aliases:["status"]},{key:"users",label:"\u7528\u6237",priority:"P1"},{key:"keyFeatures",label:"\u5173\u952E\u529F\u80FD",priority:"P1"},{key:"relatedProjects",label:"\u76F8\u5173\u9879\u76EE",priority:"P1"},{key:"metrics",label:"\u6307\u6807",priority:"P2"}]},technology:{key:"technology",label:"\u6280\u672F",priority:"P1",attributes:[{key:"useCase",label:"\u7528\u9014",priority:"P0"},{key:"adoptionStatus",label:"\u91C7\u7528\u72B6\u6001",priority:"P0"},{key:"techMaturity",label:"\u6210\u719F\u5EA6",priority:"P1",aliases:["maturity"]},{key:"risks",label:"\u98CE\u9669",priority:"P1"},{key:"relatedProjects",label:"\u76F8\u5173\u9879\u76EE",priority:"P1"},{key:"alternatives",label:"\u66FF\u4EE3\u65B9\u6848",priority:"P2"}]},document:{key:"document",label:"\u6587\u6863",priority:"P2",attributes:[{key:"purpose",label:"\u7528\u9014",priority:"P0"},{key:"documentStatus",label:"\u72B6\u6001",priority:"P0",aliases:["status"]},{key:"source",label:"\u6765\u6E90",priority:"P1"},{key:"linkedProject",label:"\u5173\u8054\u9879\u76EE",priority:"P1"},{key:"latestVersion",label:"\u6700\u65B0\u7248\u672C",priority:"P1"},{key:"owner",label:"\u8D1F\u8D23\u4EBA",priority:"P2"}]},location:{key:"location",label:"\u5730\u70B9",priority:"P2",attributes:[{key:"where",label:"\u5730\u70B9",priority:"P0"},{key:"whyRelevant",label:"\u4E3A\u4F55\u5173\u6CE8",priority:"P0"},{key:"associatedPeople",label:"\u5173\u8054\u4EBA\u7269",priority:"P1"},{key:"associatedEvents",label:"\u5173\u8054\u4E8B\u4EF6",priority:"P1"},{key:"notes",label:"\u5907\u6CE8",priority:"P2"}]},other:{key:"other",label:"\u5176\u4ED6",priority:"P2",attributes:[{key:"description",label:"\u63CF\u8FF0",priority:"P0"},{key:"objectStatus",label:"\u72B6\u6001",priority:"P1",aliases:["status"]},{key:"notes",label:"\u5907\u6CE8",priority:"P2"}]}},dr={type:"object",label:"\u5BA2\u4F53",commonAttributes:[{key:"subtype",label:"\u7C7B\u578B",priority:"P0"},{key:"summary",label:"\u6458\u8981",priority:"P1"},{key:"tags",label:"\u6807\u7B7E",priority:"P2"}],subtypes:at,defaultSubtype:"other"},qt={friction:{key:"friction",label:"\u6469\u64E6",priority:"P0",hints:["\u53CD\u590D\u9047\u5230\u7684\u963B\u529B\u3001\u5361\u70B9\u3001\u8FD4\u5DE5\u3001\u4F4E\u6548\u3001\u51B2\u7A81","\u5982\uFF1A\u65B9\u5411\u53CD\u590D\u53D8\u5316\u3001\u9700\u6C42\u8FB9\u754C\u4E0D\u6E05\u3001\u4F1A\u8BAE\u6CA1\u6709\u7ED3\u8BBA"],attributes:[{key:"trigger",label:"\u89E6\u53D1\u6761\u4EF6",priority:"P0"},{key:"impact",label:"\u5F71\u54CD",priority:"P0"},{key:"frequency",label:"\u9891\u7387",priority:"P1"},{key:"possibleCause",label:"\u53EF\u80FD\u539F\u56E0",priority:"P1"},{key:"relatedEntities",label:"\u76F8\u5173\u5B9E\u4F53",priority:"P1"},{key:"candidateResolution",label:"\u5019\u9009\u89E3\u51B3\u65B9\u6848",priority:"P2"}]},goal:{key:"goal",label:"\u76EE\u6807",priority:"P0",hints:["\u6301\u7EED\u60F3\u63A8\u8FDB\u3001\u8FBE\u6210\u3001\u6539\u5584\u6216\u5EFA\u7ACB\u7684\u65B9\u5411","\u5982\uFF1A\u63D0\u5347\u8868\u8FBE\u80FD\u529B\u3001\u51CF\u5C11\u65E0\u6548\u4F1A\u8BAE\u3001\u5EFA\u7ACB\u4E2A\u4EBA\u8BB0\u5FC6\u7CFB\u7EDF"],attributes:[{key:"desiredOutcome",label:"\u671F\u671B\u7ED3\u679C",priority:"P0"},{key:"currentState",label:"\u5F53\u524D\u72B6\u6001",priority:"P0"},{key:"nextStep",label:"\u4E0B\u4E00\u6B65",priority:"P1"},{key:"blockers",label:"\u963B\u788D",priority:"P1"},{key:"deadline",label:"\u622A\u6B62\u65E5\u671F",priority:"P1"},{key:"successMetric",label:"\u6210\u529F\u6307\u6807",priority:"P2"}]},judgment:{key:"judgment",label:"\u5224\u65AD",priority:"P0",hints:["\u5BF9\u4EBA\u6216\u4E8B\u5F62\u6210\u7684\u770B\u6CD5\u3001\u8BC4\u4EF7\u3001\u7ACB\u573A","\u5982\uFF1A\u5F53\u524D\u9879\u76EE\u4EF7\u503C\u4E0D\u6E05\u6670\u3001Markdown-first \u66F4\u9002\u5408 MVP"],attributes:[{key:"claim",label:"\u4E3B\u5F20",priority:"P0"},{key:"judgmentConfidence",label:"\u786E\u4FE1\u5EA6",priority:"P0",aliases:["confidence"]},{key:"evidence",label:"\u8BC1\u636E",priority:"P1"},{key:"counterEvidence",label:"\u53CD\u8BC1",priority:"P1"},{key:"updatedAt",label:"\u66F4\u65B0\u65F6\u95F4",priority:"P2"}]},idea:{key:"idea",label:"\u60F3\u6CD5",priority:"P0",hints:["\u7075\u611F\u3001\u5174\u8DA3\u3001\u63A2\u7D22\u6B32\u3001\u53CD\u590D\u601D\u8003\u7684\u95EE\u9898","\u5982\uFF1AAI\u8BB0\u5FC6\u7CFB\u7EDF\u8BBE\u8BA1\u3001\u5982\u4F55\u8BA9\u788E\u7247\u8BB0\u5F55\u83B7\u5F97\u6D1E\u5BDF"],attributes:[{key:"coreIdea",label:"\u6838\u5FC3\u60F3\u6CD5",priority:"P0"},{key:"useCase",label:"\u5E94\u7528\u573A\u666F",priority:"P0"},{key:"nextExperiment",label:"\u4E0B\u4E00\u6B65\u5B9E\u9A8C",priority:"P1"},{key:"linkedObjects",label:"\u76F8\u5173\u5BF9\u8C61",priority:"P1"},{key:"openQuestions",label:"\u5F00\u653E\u95EE\u9898",priority:"P2"}]}},pr={type:"theme",label:"\u4E3B\u9898",commonAttributes:[{key:"subtype",label:"\u7C7B\u578B",priority:"P0"},{key:"summary",label:"\u6458\u8981",priority:"P1",aliases:["context"]},{key:"relatedEntities",label:"\u76F8\u5173\u5B9E\u4F53",priority:"P1"},{key:"trend",label:"\u8D8B\u52BF",priority:"P2"}],subtypes:qt,defaultSubtype:"friction"},fe={person:ur,object:dr,theme:pr};function fr(){let e=new Map,t=new Map,i=["person","object","theme"];for(let n of i){let r=fe[n],a=[...r.commonAttributes];if(r.subtypes)for(let s of Object.values(r.subtypes))a.push(...s.attributes);for(let s of a)if(s.aliases&&s.aliases.length>0){e.set(s.key,s.aliases);for(let o of s.aliases)t.set(o,s.key)}}return{canonicalToAliases:e,aliasToCanonical:t}}var{canonicalToAliases:hr,aliasToCanonical:gr}=fr();function L(e){return fe[e]}function N(e,t){let i=fe[e],n=t;i.subtypes&&(!n||!i.subtypes[n])&&(n=i.defaultSubtype);let r=new Set,a=[],s=[],o=[];for(let l of i.commonAttributes)r.add(l.key),l.priority==="P0"?a.push(l.key):l.priority==="P1"?s.push(l.key):o.push(l.key);if(n&&i.subtypes?.[n])for(let l of i.subtypes[n].attributes)r.has(l.key)||(r.add(l.key),l.priority==="P0"?a.push(l.key):l.priority==="P1"?s.push(l.key):o.push(l.key));return{p0:a,p1:s,p2:o}}function M(e,t){if(e[t]!=null)return!0;let i=hr.get(t);if(i){for(let n of i)if(e[n]!=null)return!0}return!1}function yr(e,t,i){let n=gr.get(i);if(!n)return!1;let r=fe[e],a=t;r.subtypes&&(!a||!r.subtypes[a])&&(a=r.defaultSubtype);for(let s of r.commonAttributes)if(s.key===n)return!0;if(a&&r.subtypes?.[a]){for(let s of r.subtypes[a].attributes)if(s.key===n)return!0}return!1}function Pe(e,t,i,n){for(let r of["maturity","confidence"]){let a=i[r];a!=null&&(r in n||yr(e,t,r)&&(n[r]=a))}}function j(e,t,i,n){let r=n?.preserveAliases!==!1,a={...i},s=fe[e],o=t;s.subtypes&&(!o||!s.subtypes[o])&&(o=s.defaultSubtype);let l=new Map;for(let c of s.commonAttributes)l.set(c.key,c);if(o&&s.subtypes?.[o])for(let c of s.subtypes[o].attributes)l.has(c.key)||l.set(c.key,c);for(let[,c]of l){if(!c.aliases||c.aliases.length===0)continue;let u=a[c.key],d=u!=null&&u!=="";for(let f of c.aliases){let p=a[f],h=p!=null&&p!=="";!d&&h&&(a[c.key]=p),r||delete a[f]}}return a}var mr=Object.keys(at),br=Object.keys(qt),Qt={};for(let[e,t]of Object.entries(at))Qt[e]=t.priority;var st={person:{p0:["company","role","relationship_to_user"],p1:["responsibility","communicationStyle"],p2:["personality","preferences","skills"]},object:{p0:["subtype","status"],p1:["deadline","description"],p2:["priority","goals"]},theme:{p0:["subtype"],p1:["occurrenceCount","context"],p2:["context"]}};function xr(){let e={},t={},i=["person","object","theme"];for(let n of i){let r=L(n),a=st[n],s={label:r.label,p0:a.p0,p1:a.p1,p2:a.p2};if(r.subtypes){s.subtypes={};for(let[o,l]of Object.entries(r.subtypes))s.subtypes[o]={priority:l.priority,label:l.label,hints:l.hints}}e[n]=s}for(let n of i){let r=L(n);for(let a of r.commonAttributes)t[a.key]=a.label;if(r.subtypes)for(let a of Object.values(r.subtypes))for(let s of a.attributes)t[s.key]||(t[s.key]=s.label)}return t.communicationStyle="\u6C9F\u901A\u98CE\u683C",t.occurrenceCount="\u51FA\u73B0\u6B21\u6570",t.context="\u80CC\u666F",t.deadline="\u622A\u6B62\u65E5\u671F",t.description="\u63CF\u8FF0",t.status="\u72B6\u6001",t.goals="\u76EE\u6807",t.priority="\u4F18\u5148\u7EA7",{entityTypes:e,attributeLabels:t}}var Jt=xr(),Xt={...Jt};function Zt(){Xt={...Jt},console.log("[TraceMind] Loaded entity type config")}function ei(){return Xt}function he(e,t){return t&&ei().entityTypes[e]?.subtypes?.[t]?.label||""}function ti(){let e=ei().entityTypes,t=["\u5B9E\u4F53\u7C7B\u578B\u89C4\u5219\uFF1A"];t.push('- "person": '+e.person.label+"\uFF08\u5982 \u5F20\u4E09\u3001John Smith\uFF09");let i=e.object.subtypes||{},n=Object.keys(i).join("\u3001");t.push('- "object": '+e.object.label+"\uFF0C\u53EF\u7528 subtype\uFF1A"+n);for(let[s,o]of Object.entries(i))o.hints&&o.hints.length>0&&t.push("  - "+s+" \u8BC6\u522B\uFF1A"+o.hints.join("\uFF1B"));let r=e.theme.subtypes||{},a=Object.keys(r).join("\u3001");t.push('- "theme": '+e.theme.label+"\uFF0C\u53EF\u7528 subtype\uFF1A"+a);for(let[s,o]of Object.entries(r))o.hints&&o.hints.length>0&&t.push("  - "+s+" \u8BC6\u522B\uFF1A"+o.hints.join("\uFF1B"));return t.join(`
`)}function ii(e,t){let i=L(e);if(!i)return"";let n=N(e,t),r=[...n.p0,...n.p1],a={};for(let o of i.commonAttributes)a[o.key]=o.label;if(t&&i.subtypes?.[t])for(let o of i.subtypes[t].attributes)a[o.key]||(a[o.key]=o.label);let s=[];if(s.push("\u53EF\u7528\u5C5E\u6027\uFF1A"+r.map(o=>{let l=a[o]||o;return o+"\uFF08"+l+"\uFF09"}).join("\u3001")),i.subtypes){let o=Object.entries(i.subtypes).map(([l,c])=>l+":"+c.label).join("/");s.push("- subtype \u53EF\u9009\u503C\uFF1A"+o)}return s.join(`
`)}function ot(){let e=[];e.push("Vault \u7ED3\u6784\uFF1A");let i=L("person").commonAttributes.filter(c=>c.priority!=="P2").map(c=>c.key);e.push(`- Person/{name}.md \u2014 \u4EBA\u7269\u6863\u6848\uFF08\u5C5E\u6027: ${i.join(", ")}\uFF09`);let n=L("object"),r=n.subtypes?Object.keys(n.subtypes).join("/"):"",a=[];if(n.subtypes){if(n.subtypes.project){let c=n.subtypes.project.attributes.filter(u=>u.priority!=="P2").map(u=>u.key);a.push(`project: ${c.join(", ")}`)}if(n.subtypes.task){let c=n.subtypes.task.attributes.filter(u=>u.priority!=="P2").map(u=>u.key);a.push(`task: ${c.join(", ")}`)}if(n.subtypes.technology){let c=n.subtypes.technology.attributes.filter(u=>u.priority!=="P2").map(u=>u.key);a.push(`technology: ${c.join(", ")}`)}}e.push(`- Object/{name}.md \u2014 \u5BA2\u4F53\u6863\u6848\uFF08\u5C5E\u6027: subtype=${r}\uFF09`),a.length>0&&e.push(`  subtype \u793A\u4F8B: ${a.join("\uFF1B")}`);let s=L("theme"),o=s.subtypes?Object.keys(s.subtypes).join("/"):"",l=[];if(s.subtypes){if(s.subtypes.friction){let c=s.subtypes.friction.attributes.filter(u=>u.priority!=="P2").map(u=>u.key);l.push(`friction: ${c.join(", ")}`)}if(s.subtypes.judgment){let c=s.subtypes.judgment.attributes.filter(u=>u.priority!=="P2").map(u=>u.key);l.push(`judgment: ${c.join(", ")}`)}}return e.push(`- Theme/{name}.md \u2014 \u4E3B\u9898\u6863\u6848\uFF08\u5C5E\u6027: subtype=${o}\uFF09`),l.length>0&&e.push(`  subtype \u793A\u4F8B: ${l.join("\uFF1B")}`),e.push("- Daily/YYYY-MM-DD.md \u2014 \u65E5\u8BB0"),e.join(`
`)}var vr=`\u4F60\u662F\u4E00\u4F4D\u6D1E\u5BDF\u529B\u654F\u9510\u7684\u65E5\u8BB0\u5206\u6790\u4E13\u5BB6\u3002\u7528\u6237\u6BCF\u5929\u8BB0\u5F55\u751F\u6D3B\u548C\u5DE5\u4F5C\u65E5\u8BB0\uFF0C\u4F60\u9700\u8981\u6839\u636E\u5F53\u5929\u7684\u65E5\u8BB0\u5185\u5BB9\uFF0C\u751F\u6210\u4E00\u4EFD\u7ED3\u6784\u5316\u7684"\u4ECA\u65E5\u6D1E\u5BDF"\u62A5\u544A\u3002

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
- \u4F7F\u7528\u4E2D\u6587`;function ni(e){let t=[];return t.push("## \u7528\u6237\u80CC\u666F"),t.push(e.profileContext||"\u6682\u65E0\u7528\u6237\u80CC\u666F\u4FE1\u606F"),t.push(""),t.push("## \u5B9E\u4F53\u6863\u6848\u6458\u8981"),t.push(e.entityIndexSummary||"\u6682\u65E0\u5B9E\u4F53\u6863\u6848"),t.push(""),t.push("## \u4ECA\u5929\u7684\u65E5\u8BB0"),t.push(e.todayBlocks||"(\u4ECA\u5929\u8FD8\u6CA1\u6709\u5199\u65E5\u8BB0)"),t.push(""),t.push("## \u524D\u4E00\u5929\u7684\u65E5\u8BB0"),t.push(e.yesterdayBlocks||"(\u524D\u4E00\u5929\u6CA1\u6709\u65E5\u8BB0)"),[{role:"system",content:vr},{role:"user",content:t.join(`
`)}]}async function De(e,t){let i=e+"|||"+t,r=new TextEncoder().encode(i),a=await crypto.subtle.digest("SHA-256",r);return Array.from(new Uint8Array(a)).map(o=>o.toString(16).padStart(2,"0")).join("")}function ri(e){if(e.length===0)return"\u6682\u65E0\u5B9E\u4F53\u6863\u6848";let t=new Map;for(let a of e){let s=a.cardType||a.type||"unknown";t.has(s)||t.set(s,[]),t.get(s).push(a)}let i={person:"\u4EBA\u7269",object:"\u5BA2\u4F53",theme:"\u4E3B\u9898"},n=[],r=["person","object","theme"];for(let a of r){let s=t.get(a);if(!s||s.length===0)continue;let o=[...s].sort((u,d)=>new Date(d.lastUpdated).getTime()-new Date(u.lastUpdated).getTime()).slice(0,20),l=i[a]||a,c=o.map(u=>`${u.name}(${u.maturity||"L0"})`).join(", ");n.push(`${l}(${o.length}): ${c}`)}return n.join("; ")||"\u6682\u65E0\u5B9E\u4F53\u6863\u6848"}var ge="tracemind-ai-analysis",Le=class extends B.ItemView{plugin;activeBlockId=null;activeParentId=null;mode="analysis";chatMessagesEl=null;inputAreaEl=null;inputTextarea=null;agentSelectEl=null;currentAgentKey="";detectedLocalAgents=[];sendBtnEl=null;chatModeClearBtnEl=null;modeToggleBtnEl=null;headerTitleEl=null;isLoading=!1;emptyStateEl=null;analysisTabsEl=null;blockInsightsEl=null;entityIndexEl=null;analysisTab="block";thinkingEl=null;hasTodayInsightAttention=!1;clarificationPhase="summary";clarificationQueue=[];knownEntities=[];currentEntityIndex=0;allSessionEntities=[];replayingHistory=!1;constructor(t,i){super(t),this.plugin=i}getViewType(){return ge}getDisplayText(){return this.mode==="chat"?"AI\u804A\u5929":"AI\u6D1E\u5BDF"}getIcon(){return"brain"}async onOpen(){this.plugin.aiAnalysisView=this;let t=this.containerEl;t.empty(),this.addStyles();let i=t.createEl("div",{cls:"lifewiki-ai-panel"}),n=i.createEl("div",{cls:"lifewiki-ai-header"}),r=n.createEl("div",{cls:"lifewiki-ai-header-title"});this.headerTitleEl=r.createEl("span",{text:"AI \u6D1E\u5BDF"}),this.analysisTabsEl=r.createEl("div",{cls:"lifewiki-analysis-tabs"});let a=n.createEl("div",{cls:"lifewiki-ai-header-actions"});this.modeToggleBtnEl=a.createEl("button",{cls:"lifewiki-mode-toggle-btn analysis",attr:{type:"button",title:"\u5207\u6362\u4E3A\u804A\u5929\u6A21\u5F0F"}}),this.renderModeToggleButton(),this.modeToggleBtnEl.addEventListener("click",()=>{this.mode==="analysis"?this.switchToChatMode():this.switchToAnalysisMode()}),this.chatModeClearBtnEl=a.createEl("button",{cls:"lifewiki-ai-clear-btn",attr:{title:"\u6E05\u7A7A\u804A\u5929"}}),(0,B.setIcon)(this.chatModeClearBtnEl,"trash-2");let s=this.chatModeClearBtnEl.querySelector("svg");s&&(s.setAttribute("width","20"),s.setAttribute("height","20")),this.chatModeClearBtnEl.addClass("hidden"),this.chatModeClearBtnEl.addEventListener("click",()=>{this.clearChatSession()});let o=i.createEl("div",{cls:"lifewiki-ai-scroll"});this.emptyStateEl=o.createEl("div",{cls:"lifewiki-empty-state"}),this.emptyStateEl.createEl("span",{cls:"lifewiki-empty-state-title",text:"\u9009\u62E9\u6216\u8F93\u5165\u4E00\u6761\u65E5\u8BB0"}),this.entityIndexEl=o.createEl("div",{cls:"lifewiki-entity-index"}),this.chatMessagesEl=o.createEl("div",{cls:"lifewiki-chat-messages"}),this.blockInsightsEl=o.createEl("div",{cls:"lifewiki-block-insights"});let l=i.createEl("div",{cls:"lifewiki-ai-input-area"});this.inputAreaEl=l;let c=l.createEl("div",{cls:"lifewiki-chat-input-wrapper"}),u=c.createEl("div",{cls:"lifewiki-input-row"});this.inputTextarea=u.createEl("textarea",{cls:"lifewiki-input-textarea",attr:{placeholder:"\u56DE\u7B54\u6F84\u6E05\u95EE\u9898\u6216\u8865\u5145\u80CC\u666F...",rows:"1"}}),this.inputTextarea.addEventListener("input",()=>{this.autoResizeTextarea(),this.updateSendBtnState()}),this.inputTextarea.addEventListener("keydown",f=>{f.key==="Enter"&&!f.shiftKey&&(f.preventDefault(),this.sendMessage())});let d=c.createEl("div",{cls:"lifewiki-mode-row"});this.agentSelectEl=d.createEl("select",{cls:"lifewiki-agent-select",attr:{style:"display:none"}}),this.agentSelectEl.addEventListener("change",()=>{this.currentAgentKey=this.agentSelectEl?.value||""}),this.sendBtnEl=d.createEl("button",{cls:"lifewiki-send-btn",attr:{title:"\u53D1\u9001"}}),(0,B.setIcon)(this.sendBtnEl,"arrow-up"),this.sendBtnEl.addEventListener("click",()=>{this.inputTextarea?.value.trim()&&!this.isLoading&&this.sendMessage()}),this.detectLocalAgents(),this.showEmptyState(),this.renderAnalysisTabs(),this.updateSendBtnState()}autoResizeTextarea(){if(!this.inputTextarea)return;let t=66,i=120,n=this.inputTextarea.scrollHeight;this.inputTextarea.style.height=Math.min(Math.max(n,t),i)+"px"}updateSendBtnState(){if(!this.sendBtnEl||!this.inputTextarea)return;let t=this.inputTextarea.value.trim().length>0&&!this.isLoading;this.sendBtnEl.classList.toggle("active",t),this.isLoading?(this.sendBtnEl.setAttr("disabled","true"),this.sendBtnEl.setAttr("title","\u5904\u7406\u4E2D..."),(0,B.setIcon)(this.sendBtnEl,"loader-2")):(this.sendBtnEl.removeAttribute("disabled"),this.sendBtnEl.setAttr("title","\u53D1\u9001"),(0,B.setIcon)(this.sendBtnEl,"arrow-up"))}addStyles(){let t=document.createElement("style");t.textContent=`
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
		`,this.containerEl.appendChild(t)}showEmptyState(){this.emptyStateEl?.addClass("visible"),this.chatMessagesEl?.removeClass("visible"),this.blockInsightsEl?.removeClass("visible"),this.entityIndexEl?.removeClass("visible"),this.updateInputVisibility()}showChatState(){this.emptyStateEl?.removeClass("visible"),this.applyAnalysisTabVisibility(),this.updateInputVisibility()}updateInputVisibility(){this.inputAreaEl&&(this.mode==="analysis"&&this.analysisTab==="insight"?this.inputAreaEl.style.display="none":this.inputAreaEl.style.removeProperty("display"))}renderModeToggleButton(){if(!this.modeToggleBtnEl)return;this.modeToggleBtnEl.empty(),this.modeToggleBtnEl.removeClass("analysis"),this.modeToggleBtnEl.removeClass("chat");let t=this.mode==="chat";this.modeToggleBtnEl.addClass(t?"chat":"analysis"),this.modeToggleBtnEl.setAttr("title",t?"\u5207\u6362\u4E3A\u5206\u6790\u6A21\u5F0F":"\u5207\u6362\u4E3A\u804A\u5929\u6A21\u5F0F"),(0,B.setIcon)(this.modeToggleBtnEl,t?"sparkles":"messages-square"),this.modeToggleBtnEl.createEl("span",{text:t?"\u5207\u6362\u4E3A\u5206\u6790\u6A21\u5F0F":"\u5207\u6362\u4E3A\u804A\u5929\u6A21\u5F0F"})}setEmptyStateText(t){let i=this.emptyStateEl?.querySelector(".lifewiki-empty-state-title");i&&(i.textContent=t)}renderAnalysisTabs(){if(!this.analysisTabsEl)return;if(this.analysisTabsEl.empty(),this.mode!=="analysis"){this.analysisTabsEl.removeClass("visible"),this.headerTitleEl&&(this.headerTitleEl.style.display="");return}this.analysisTabsEl.addClass("visible"),this.headerTitleEl&&(this.headerTitleEl.style.display="none");let t=[{id:"block",label:"\u5F53\u524D\u65E5\u8BB0"},{id:"insight",label:"\u4ECA\u65E5\u6D1E\u5BDF"}];for(let i of t)this.analysisTabsEl.createEl("button",{cls:`lifewiki-analysis-tab ${this.analysisTab===i.id?"active":""}`,text:i.label,attr:{type:"button"}}).addEventListener("click",()=>{this.analysisTab=i.id,this.renderAnalysisTabs(),this.applyAnalysisTabVisibility(),i.id==="insight"&&this.loadOrGenerateInsight()})}applyAnalysisTabVisibility(){if(this.mode!=="analysis"){this.analysisTabsEl?.removeClass("visible"),this.headerTitleEl&&(this.headerTitleEl.style.display=""),this.entityIndexEl?.removeClass("visible"),this.blockInsightsEl?.removeClass("visible"),this.chatMessagesEl?.addClass("visible"),this.updateInputVisibility();return}if(this.renderAnalysisTabs(),this.analysisTab==="insight")this.emptyStateEl?.removeClass("visible"),this.chatMessagesEl?.removeClass("visible"),this.entityIndexEl?.removeClass("visible"),this.blockInsightsEl?.addClass("visible");else{if(this.entityIndexEl?.removeClass("visible"),this.blockInsightsEl?.removeClass("visible"),!this.activeBlockId){this.emptyStateEl?.addClass("visible"),this.chatMessagesEl?.removeClass("visible"),this.updateInputVisibility();return}this.emptyStateEl?.removeClass("visible"),this.chatMessagesEl?.addClass("visible")}this.updateInputVisibility()}clearConversation(){this.chatMessagesEl?.empty(),this.activeBlockId=null,this.showEmptyState()}switchToChatMode(){this.mode="chat",this.agentSelectEl&&(this.agentSelectEl.style.display=""),this.activeBlockId=null,this.activeParentId=null,this.clarificationPhase="summary",this.clarificationQueue=[],this.knownEntities=[],this.allSessionEntities=[],this.currentEntityIndex=0,this.entityIndexEl?.removeClass("visible"),this.analysisTabsEl?.removeClass("visible"),this.blockInsightsEl?.removeClass("visible"),this.renderModeToggleButton(),this.setEmptyStateText("\u53EF\u4EE5\u68C0\u7D22\u3001\u603B\u7ED3\u6216\u66F4\u65B0\u4F60\u7684 vault"),this.headerTitleEl&&(this.headerTitleEl.textContent="AI \u804A\u5929",this.headerTitleEl.style.display=""),this.chatModeClearBtnEl&&this.chatModeClearBtnEl.removeClass("hidden"),this.inputTextarea&&(this.inputTextarea.placeholder="\u95EE\u95EE\u4F60\u7684 vault\uFF0C\u4F8B\u5982\uFF1A\u603B\u7ED3\u672C\u5468\u65E5\u8BB0\u3001\u67E5\u627E\u67D0\u4E2A\u9879\u76EE\u3001\u66F4\u65B0\u67D0\u4E2A\u4EBA\u7684\u80CC\u666F..."),this.containerEl.querySelector(".lifewiki-ai-panel")?.addClass("chat-mode"),this.updateInputVisibility();let i=this.plugin.getSessionManager().getChatSession();if(i&&i.messages.length>0){this.showChatState(),this.chatMessagesEl?.empty();for(let n of i.messages)n.role!=="system"&&this.addChatMessage(n.role,n.content)}else this.showEmptyState()}switchToAnalysisMode(){this.mode="analysis",this.agentSelectEl&&(this.agentSelectEl.style.display="none"),this.analysisTab=this.analysisTab||"block",this.renderModeToggleButton(),this.setEmptyStateText("\u9009\u62E9\u6216\u8F93\u5165\u4E00\u6761\u65E5\u8BB0"),this.headerTitleEl&&(this.headerTitleEl.textContent="AI\u6D1E\u5BDF",this.headerTitleEl.style.display="none"),this.chatModeClearBtnEl&&this.chatModeClearBtnEl.addClass("hidden"),this.inputTextarea&&(this.inputTextarea.placeholder="\u56DE\u7B54\u6F84\u6E05\u95EE\u9898\u6216\u8865\u5145\u80CC\u666F..."),this.containerEl.querySelector(".lifewiki-ai-panel")?.removeClass("chat-mode"),this.updateInputVisibility(),this.applyAnalysisTabVisibility()}clearChatSession(){this.plugin.getSessionManager().clearChatSession(),this.chatMessagesEl?.empty(),this.showEmptyState()}setMode(t){t==="chat"?this.switchToChatMode():this.switchToAnalysisMode()}getMode(){return this.mode}async loadOrGenerateInsight(){if(this.mode!=="analysis"||this.analysisTab!=="insight"||this.isLoading)return;let t=this.getActiveInsightDate(),i=new Date,n=`${i.getFullYear()}-${String(i.getMonth()+1).padStart(2,"0")}-${String(i.getDate()).padStart(2,"0")}`,r=t===n,a=await this.plugin.getCachedInsight(t);if(!r){a?this.renderInsightContent(a.content):this.showInsightEmptyState("\u8BE5\u65E5\u671F\u6CA1\u6709\u6D1E\u5BDF\u62A5\u544A");return}if(!await this.plugin.hasMinimumBlocks(t)){this.showInsightEmptyState("\u4ECA\u65E5\u65E5\u8BB0\u8F83\u5C11\uFF0C\u591A\u5199\u51E0\u6761\u518D\u6765\u770B\u6D1E\u5BDF");return}let o=await this.plugin.readDailyDiary(t),l=await this.plugin.readYesterdayDiary(t),c=await De(o||"",l);if(a&&a.contentHash===c){this.renderInsightContent(a.content);return}this.isLoading=!0,this.showInsightGenerating();let u={onDelta:d=>this.appendInsightChunk(d),onDone:d=>{this.isLoading=!1,this.insightBuffer&&(this.renderInsightContent(this.insightBuffer),this.insightBuffer="")},onError:d=>{this.isLoading=!1,this.showInsightError(d.message)}};try{await this.plugin.generateDailyInsight(t,u)}catch(d){this.isLoading=!1,this.showInsightError(d.message)}}insightBuffer="";getActiveInsightDate(){let t=this.plugin.getBlockEditorDate();if(t)return t;let i=new Date,n=i.getFullYear(),r=String(i.getMonth()+1).padStart(2,"0"),a=String(i.getDate()).padStart(2,"0");return`${n}-${r}-${a}`}showInsightEmptyState(t){if(!this.blockInsightsEl)return;this.blockInsightsEl.empty(),this.blockInsightsEl.addClass("visible"),this.blockInsightsEl.createEl("div",{cls:"lifewiki-insight-empty"}).createEl("p",{text:t})}showInsightGenerating(){if(!this.blockInsightsEl)return;this.blockInsightsEl.empty(),this.blockInsightsEl.addClass("visible"),this.insightBuffer="";let i=this.blockInsightsEl.createEl("div",{cls:"lifewiki-insight-body"}).createEl("div",{cls:"lifewiki-insight-generating"});i.createEl("span",{text:"\u6B63\u5728\u751F\u6210\u4ECA\u65E5\u6D1E\u5BDF"});let n=i.createEl("span",{cls:"lifewiki-thinking-dots"});n.createEl("span",{cls:"lifewiki-thinking-dot"}),n.createEl("span",{cls:"lifewiki-thinking-dot"}),n.createEl("span",{cls:"lifewiki-thinking-dot"})}appendInsightChunk(t){if(!this.blockInsightsEl)return;this.insightBuffer+=t,this.blockInsightsEl.empty(),this.blockInsightsEl.addClass("visible"),this.blockInsightsEl.createEl("div",{cls:"lifewiki-insight-body"}).createEl("pre",{text:this.insightBuffer,cls:"lifewiki-insight-streaming"}),this.scrollInsightToBottom()}renderInsightContent(t){if(!this.blockInsightsEl)return;this.blockInsightsEl.empty(),this.blockInsightsEl.addClass("visible");let i=this.blockInsightsEl.createEl("div",{cls:"lifewiki-insight-body"});B.MarkdownRenderer.render(this.app,t,i,"",this)}showInsightError(t){if(!this.blockInsightsEl)return;this.blockInsightsEl.empty(),this.blockInsightsEl.addClass("visible");let i=this.blockInsightsEl.createEl("div",{cls:"lifewiki-insight-error"});i.createEl("p",{text:`\u751F\u6210\u6D1E\u5BDF\u5931\u8D25: ${t}`}),i.createEl("button",{text:"\u91CD\u8BD5",attr:{type:"button"}}).addEventListener("click",()=>{this.loadOrGenerateInsight()})}scrollInsightToBottom(){this.blockInsightsEl&&(this.blockInsightsEl.scrollTop=this.blockInsightsEl.scrollHeight)}showThinkingIndicator(){if(!this.chatMessagesEl||!this.isLoading)return;this.thinkingEl=this.chatMessagesEl.createEl("div",{cls:"lifewiki-thinking"});let t=this.thinkingEl.createEl("div",{cls:"lifewiki-thinking-dots"});t.createEl("span",{cls:"lifewiki-thinking-dot"}),t.createEl("span",{cls:"lifewiki-thinking-dot"}),t.createEl("span",{cls:"lifewiki-thinking-dot"}),this.scrollToBottom()}hideThinkingIndicator(){this.thinkingEl&&(this.thinkingEl.remove(),this.thinkingEl=null)}scrollToBottom(){let t=this.containerEl.querySelector(".lifewiki-ai-scroll");t&&(t.scrollTop=t.scrollHeight)}setActiveBlock(t,i,n){this.switchToAnalysisMode(),this.activeBlockId=t,this.activeParentId=n||null;let a=this.plugin.getSessionManager().getOrCreateSession(t,n||null);this.showChatState(),this.renderSession(a)}startNewSession(t,i,n,r=null){this.switchToAnalysisMode(),this.activeBlockId=t,this.activeParentId=r,this.showChatState(),this.chatMessagesEl?.empty();let a=this.plugin.getSessionManager(),s=a.getOrCreateSession(t,r);a.setContent(t,i,r),this.renderBlockInsightCards(s)}showAgentSession(t,i,n,r=null){console.log("[TraceMind] showAgentSession called: blockId=",t,"hasAnalysisResult=",!!n.analysisResult),this.switchToAnalysisMode(),this.activeBlockId=t,this.activeParentId=r;let s=this.plugin.getSessionManager().setSession(t,{...n,content:n.content||i,messages:[]},r);this.renderAnalysisStart(s)}async renderAnalysisStart(t){if(!this.chatMessagesEl)return;this.chatMessagesEl.empty();let i=t.analysisResult;if(!i){this.showEmptyState();return}let n=this.flattenEntityPreviews(i),r=n.filter(c=>!c.isArchived),a=n.filter(c=>c.isArchived);this.clarificationQueue=[...r].sort((c,u)=>(u.priorityScore??0)-(c.priorityScore??0)),this.knownEntities=[...a],this.allSessionEntities=[...r,...a],this.currentEntityIndex=0,this.clarificationPhase="summary",this.showChatState();let s=r.map(c=>"**"+c.name+"**"),o=a.map(c=>"**"+c.name+"**"),l;if(n.length===0){await this.streamChatMessage("\u8FD9\u6761\u65E5\u8BB0\u6682\u65F6\u6CA1\u6709\u9700\u8981\u786E\u8BA4\u5F52\u6863\u7684\u5185\u5BB9\u3002"),this.clarificationPhase="complete";return}if(s.length>0&&o.length>0?l="\u8FD9\u6761\u65E5\u8BB0\u4E2D\u63D0\u5230\u7684 "+s.join("\u3001")+" \u6211\u4E0D\u592A\u719F\u6089\uFF0C\u9700\u8981\u4F60\u5E2E\u6211\u8865\u5145\u4E00\u4E9B\u4FE1\u606F\u3002"+o.join("\u3001")+" \u6211\u4E86\u89E3\u3002":s.length>0?l="\u8FD9\u6761\u65E5\u8BB0\u4E2D\u63D0\u5230\u7684 "+s.join("\u3001")+" \u6211\u4E0D\u592A\u719F\u6089\uFF0C\u9700\u8981\u4F60\u5E2E\u6211\u8865\u5145\u4E00\u4E9B\u4FE1\u606F\u3002":l="\u8FD9\u6761\u65E5\u8BB0\u4E2D\u63D0\u5230\u7684 "+o.join("\u3001")+" \u6211\u90FD\u4E86\u89E3\u3002",await this.streamChatMessage(l),this.clarificationQueue.length>0){this.clarificationPhase="clarifying";let c="**"+this.clarificationQueue[0].name+"**";await this.streamChatMessage("\u5148\u4ECE "+c+" \u5F00\u59CB\u5427\u3002"),setTimeout(async()=>{await this.askCurrentEntityQuestion()},500)}else await this.finishClarification();this.scrollToBottom()}async askCurrentEntityQuestion(){if(this.currentEntityIndex>=this.clarificationQueue.length){await this.finishClarification();return}let t=this.clarificationQueue[this.currentEntityIndex],i=t.clarificationQuestions?.[0]??"\u80FD\u544A\u8BC9\u6211\u5173\u4E8E\u300C"+t.name+"\u300D\u7684\u66F4\u591A\u4FE1\u606F\u5417\uFF1F";await this.streamChatMessage(i),this.scrollToBottom(),this.inputTextarea&&(this.inputTextarea.placeholder="\u56DE\u590D\u5173\u4E8E\u300C"+t.name+"\u300D\u7684\u95EE\u9898\uFF0C\u6216\u8BF4\u201C\u8DF3\u8FC7\u201D",this.inputTextarea.focus())}async skipCurrentEntity(){let t=this.clarificationQueue[this.currentEntityIndex].name;if(await this.streamChatMessage("\u597D\u7684\uFF0C\u5148\u8DF3\u8FC7 **"+t+"**\u3002"),this.currentEntityIndex++,this.clarificationPhase="clarifying",this.currentEntityIndex>=this.clarificationQueue.length)await this.finishClarification();else{let i=this.clarificationQueue[this.currentEntityIndex].name;await this.streamChatMessage("\u518D\u6765\u770B\u770B **"+i+"**\u3002"),await this.askCurrentEntityQuestion()}}async finishClarification(){if(this.knownEntities.length>0&&this.clarificationPhase!=="review_known"){this.clarificationPhase="review_known";let i=this.knownEntities.map(function(n){return"**"+n.name+"**"}).join("\u3001");await this.streamChatMessage("\u5BF9\u4E86\uFF0C"+i+" \u4F60\u8FD8\u6709\u65B0\u7684\u4FE1\u606F\u8981\u8865\u5145\u5417\uFF1F\u6CA1\u6709\u7684\u8BDD\u8BF4\u201C\u6CA1\u6709\u4E86\u201D\u5C31\u597D\u3002"),this.scrollToBottom(),this.inputTextarea&&(this.inputTextarea.placeholder="\u8F93\u5165\u8865\u5145\u4FE1\u606F\uFF0C\u6216\u8BF4\u201C\u6CA1\u6709\u4E86\u201D\u2026",this.inputTextarea.focus());return}this.clarificationPhase="complete";let t=this.currentSessionContent();if(t){let i=this.plugin.getEntityManager();for(let n of this.allSessionEntities)if(n.isArchived){let r=i.findEntity(n.name);r&&await i.addInteraction(r.id,{timestamp:new Date().toISOString(),type:"diary_mention",content:t})}}if(this.allSessionEntities.length>=1){let i=this.plugin.getEntityManager();for(let n of this.allSessionEntities){let r=i.findEntity(n.name);r&&await i.refreshWikilinks(r.id)}}if(this.allSessionEntities.length>0){let i=this.allSessionEntities.map(function(n){return"**"+n.name+"**"}).join("\u3001");await this.streamChatMessage("\u597D\u4E86\uFF0C\u8FD9\u6B21\u5148\u5230\u8FD9\u91CC\u3002"+i+" \u5DF2\u66F4\u65B0\u3002\u53EF\u4EE5\u5728\u5DE6\u4FA7\u6587\u4EF6\u5217\u8868\u4E2D\u67E5\u770B\u3002\u6709\u7A7A\u518D\u7EE7\u7EED\u8865\u5145\u3002")}else await this.streamChatMessage("\u597D\u4E86\uFF0C\u8FD9\u6B21\u5148\u5230\u8FD9\u91CC\u3002\u53EF\u4EE5\u5728\u5DE6\u4FA7\u6587\u4EF6\u5217\u8868\u4E2D\u67E5\u770B\u3002\u6709\u7A7A\u518D\u7EE7\u7EED\u8865\u5145\u3002");this.scrollToBottom(),this.inputTextarea&&(this.inputTextarea.placeholder="\u56DE\u7B54\u6F84\u6E05\u95EE\u9898\u6216\u8865\u5145\u80CC\u666F...")}renderSession(t){if(t.messages&&t.messages.length>0){if(this.replayingHistory=!0,this.chatMessagesEl){this.chatMessagesEl.empty();for(let i of t.messages)(i.role==="user"||i.role==="assistant")&&this.addChatMessage(i.role,i.content)}this.replayingHistory=!1,this.showChatState(),this.restoreAnalysisState(t);return}this.renderAnalysisStart(t)}restoreAnalysisState(t){let i=t.analysisResult;if(!i||!i.entities)return;let n=this.flattenEntityPreviews(i);if(n.length===0)return;let r=n.filter(s=>!s.isArchived),a=n.filter(s=>s.isArchived);if(r.length===0){this.clarificationPhase="complete";return}this.clarificationQueue=[...r].sort((s,o)=>(o.priorityScore??0)-(s.priorityScore??0)),this.knownEntities=[...a],this.allSessionEntities=[...r,...a],this.currentEntityIndex=0,this.clarificationPhase="clarifying"}updateAnalysis(t){if(console.log("[TraceMind] updateAnalysis called: blockId=",t.blockId),!this.activeBlockId&&t.blockId&&(this.activeBlockId=t.blockId,this.activeParentId=null),!this.activeBlockId)return;let i=this.plugin.getSessionManager();i.setAnalysisResult(this.activeBlockId,t,this.activeParentId),this.switchToAnalysisMode();let n=i.getSession(this.activeBlockId,this.activeParentId);n&&this.renderAnalysisStart(n),this.refreshEntityIndexAttention()}renderBlockInsightCards(t){if(!this.blockInsightsEl){console.log("[TraceMind] renderBlockInsight: blockInsightsEl is null");return}if(this.blockInsightsEl.empty(),console.log("[TraceMind] renderBlockInsight: mode=",this.mode,"hasSession=",!!t,"analysisResult=",t?.analysisResult?"present":"null"),!t||this.mode!=="analysis"){this.blockInsightsEl.removeClass("visible"),console.log("[TraceMind] renderBlockInsight: early return - no session or not analysis mode");return}let i=this.flattenEntityPreviews(t.analysisResult);console.log("[TraceMind] renderBlockInsight: flattened entities count:",i.length,i);let n=0;n+=this.renderEntityCards(this.blockInsightsEl,i,t),n+=this.renderRelationCards(this.blockInsightsEl,i,t),n===0&&this.createInsightSection(this.blockInsightsEl,"\u5F85\u786E\u8BA4").createEl("div",{cls:"lifewiki-memory-empty",text:"\u8FD9\u6761\u65E5\u8BB0\u6682\u65F6\u6CA1\u6709\u9700\u8981\u786E\u8BA4\u5F52\u6863\u7684\u5185\u5BB9\u3002"}),this.applyAnalysisTabVisibility()}flattenEntityPreviews(t){return t?[...t.entities.people,...t.entities.objects,...t.entities.dimensions]:[]}renderEntityCards(t,i,n){if(i.length===0)return 0;let r=i.slice(0,6).filter(o=>!this.isReviewCardDone(n,this.entityCardId(o)));if(r.length===0)return 0;let a=this.createInsightSection(t,"\u5B9E\u4F53\u4E0E\u80CC\u666F"),s=0;for(let o of r){let l=this.entityCardId(o);s++;let c=o.isArchived||!!this.plugin.getEntityManager()?.findEntity(o.name),u=this.getReviewSupplement(n,l),d=o.maturity?this.maturityLabel(o.maturity):"",f=[this.getEntityTypeLabel(o.type),c?"\u5DF2\u6709\u6863\u6848":"\u5F85\u5F52\u6863",`\u7F6E\u4FE1\u5EA6 ${Math.round(o.confidence*100)}%`,...d?[d]:[]],p=this.createConfirmCard(a,{title:`${c?"\u5DF2\u8BC6\u522B":"\u65B0"}${this.getEntityTypeLabel(o.type)}\uFF1A${o.name}`,body:o.context||"AI \u4ECE\u8FD9\u6761\u65E5\u8BB0\u4E2D\u8BC6\u522B\u5230\u8FD9\u4E2A\u5B9E\u4F53\uFF0C\u4F46\u8FD8\u7F3A\u5C11\u80CC\u666F\u8BF4\u660E\u3002",chips:f,supplement:u});if(o.clarificationQuestions&&o.clarificationQuestions.length>0){let g=p.createEl("div",{cls:"lifewiki-confirm-card-supplement"});g.createEl("div",{cls:"lifewiki-confirm-card-supplement-label",text:"\u5F85\u6F84\u6E05"}),g.createEl("div",{text:o.clarificationQuestions[0]})}let h=!o.maturity||o.maturity==="L0"||o.maturity==="L1";c&&!h?this.addConfirmAction(p,"\u8BB0\u5F55\u4E92\u52A8","primary",async()=>{await this.recordEntityInteraction(o.name,this.mergeSupplement(`\u65E5\u8BB0\u63D0\u5230\uFF1A${this.currentSessionContent()}`,u)),this.markReviewCard(l,"confirmed",u),this.replaceCardWithStatus(p,`\u5DF2\u628A\u8FD9\u6B21\u4E92\u52A8\u8BB0\u5F55\u5230\u300C${o.name}\u300D\u6863\u6848\u3002`)}):c||this.addConfirmAction(p,h?"\u786E\u8BA4\u5E76\u8865\u5145":"\u786E\u8BA4","primary",async()=>{await this.archiveEntityPreview(o,u),this.markReviewCard(l,"confirmed",u),this.replaceCardWithStatus(p,`\u5DF2\u5F52\u6863\u300C${o.name}\u300D\u3002`)}),this.addConfirmAction(p,"\u8865\u5145\u80CC\u666F","",()=>{this.showSupplementEditor(p,l,`\u8865\u5145\u300C${o.name}\u300D\u7684\u80CC\u666F`,u)}),this.addConfirmAction(p,"\u8DF3\u8FC7","",()=>{this.markReviewCard(l,"skipped",u),p.remove()})}return s}renderRelationCards(t,i,n){let r=i.filter(p=>this.plugin.getEntityManager()?.findEntity(p.name)),a=r.length>=2?r.slice(0,2):i.slice(0,2);if(a.length<2)return 0;let[s,o]=a,l=this.relationCardId(s,o);if(this.isReviewCardDone(n,l))return 0;let c=this.createInsightSection(t,"\u5173\u7CFB\u7EBF\u7D22"),u=r.length>=2,d=this.getReviewSupplement(n,l),f=this.createConfirmCard(c,{title:`${s.name} \u548C ${o.name} \u7684\u5173\u7CFB`,body:"\u8FD9\u6761\u65E5\u8BB0\u540C\u65F6\u63D0\u5230\u4E86\u5B83\u4EEC\u3002\u5173\u7CFB\u7C7B\u578B\u6700\u597D\u7531\u4F60\u786E\u8BA4\u540E\u518D\u5F52\u6863\u3002",chips:["\u5173\u7CFB",u?"\u53EF\u5F52\u6863":"\u9700\u5148\u5F52\u6863\u5B9E\u4F53"],supplement:d});return u&&this.addConfirmAction(f,"\u8BB0\u5F55\u4E3A\u76F8\u5173","primary",async()=>{await this.handleRelations([{from:s.name,to:o.name,relation:"related_to",context:d}]),this.markReviewCard(l,"confirmed",d),this.replaceCardWithStatus(f,`\u5DF2\u8BB0\u5F55\u300C${s.name}\u300D\u548C\u300C${o.name}\u300D\u7684\u76F8\u5173\u5173\u7CFB\u3002`)}),this.addConfirmAction(f,"\u8BF4\u660E\u5173\u7CFB",u?"":"primary",()=>{this.showSupplementEditor(f,l,`\u8BF4\u660E\u300C${s.name}\u300D\u548C\u300C${o.name}\u300D\u7684\u5173\u7CFB`,d)}),this.addConfirmAction(f,"\u8DF3\u8FC7","",()=>{this.markReviewCard(l,"skipped",d),f.remove()}),1}createInsightSection(t,i){let n=t.createEl("div",{cls:"lifewiki-insight-section"});return n.createEl("div",{cls:"lifewiki-insight-section-title",text:i}),n}createConfirmCard(t,i){let n=t.createEl("div",{cls:"lifewiki-confirm-card"});if(n.createEl("div",{cls:"lifewiki-confirm-card-title",text:i.title}),n.createEl("div",{cls:"lifewiki-confirm-card-body",text:i.body}),i.supplement){let a=n.createEl("div",{cls:"lifewiki-confirm-card-supplement"});a.createEl("div",{cls:"lifewiki-confirm-card-supplement-label",text:"\u4F60\u7684\u8865\u5145"}),a.createEl("div",{text:i.supplement})}let r=n.createEl("div",{cls:"lifewiki-confirm-card-meta"});for(let a of i.chips.filter(Boolean))r.createEl("span",{cls:"lifewiki-confirm-chip",text:a});return n.createEl("div",{cls:"lifewiki-confirm-actions"}),n}addConfirmAction(t,i,n,r){let a=t.querySelector(".lifewiki-confirm-actions");if(!a)return;let s=a.createEl("button",{cls:`lifewiki-confirm-action ${n}`,text:i,attr:{type:"button"}});s.addEventListener("click",async o=>{o.stopPropagation(),s.setAttribute("disabled","true");try{await r()}catch(l){console.error("[AIAnalysisPanel] confirm action failed:",l),this.replaceCardWithStatus(t,`\u64CD\u4F5C\u5931\u8D25\uFF1A${l.message}`)}finally{s.removeAttribute("disabled")}})}replaceCardWithStatus(t,i){t.empty(),t.createEl("div",{cls:"lifewiki-confirm-card-body",text:i})}entityCardId(t){return`entity:${t.type}:${t.name}`}relationCardId(t,i){return`relation:${t.name}:${i.name}`}isReviewCardDone(t,i){let n=t.reviewCards?.[i]?.status;return n==="confirmed"||n==="skipped"}getReviewSupplement(t,i){return t.reviewCards?.[i]?.supplement||""}markReviewCard(t,i,n){this.activeBlockId&&this.plugin.getSessionManager().updateReviewCard(this.activeBlockId,t,{status:i,supplement:n},this.activeParentId)}showSupplementEditor(t,i,n,r=""){t.querySelector(".lifewiki-confirm-card-editor")?.remove();let a=t.querySelector(".lifewiki-confirm-actions"),s=t.createEl("div",{cls:"lifewiki-confirm-card-editor"});a&&t.insertBefore(s,a),s.createEl("div",{cls:"lifewiki-confirm-card-supplement-label",text:n});let o=s.createEl("textarea",{cls:"lifewiki-confirm-card-textarea",attr:{rows:"3"}});o.value=r,s.createEl("button",{cls:"lifewiki-confirm-action primary",text:"\u4FDD\u5B58\u8865\u5145",attr:{type:"button"}}).addEventListener("click",()=>{let c=o.value.trim();this.markReviewCard(i,"pending",c),this.renderBlockInsightCards(this.activeBlockId?this.plugin.getSessionManager().getSession(this.activeBlockId,this.activeParentId):null)}),o.focus()}mergeSupplement(t,i){let n=i?.trim();return n?`${t}
\u8865\u5145\uFF1A${n}`:t}currentSessionContent(){return this.activeBlockId&&this.plugin.getSessionManager().getSession(this.activeBlockId,this.activeParentId)?.content||""}prefillInput(t){this.inputTextarea&&(this.analysisTab="block",this.applyAnalysisTabVisibility(),this.inputTextarea.value=t,this.inputTextarea.focus(),this.autoResizeTextarea(),this.updateSendBtnState())}async archiveEntityPreview(t,i=""){let n=this.plugin.getEntityManager();if(!n)return;if(n.findEntity(t.name)){await this.recordEntityInteraction(t.name,this.mergeSupplement(t.context||`\u65E5\u8BB0\u63D0\u5230\uFF1A${this.currentSessionContent()}`,i));return}let a=t.context||"\u4ECE\u65E5\u8BB0\u4E2D\u5F52\u6863",s=this.mergeSupplement(`\u5F52\u6863\uFF1A${a||"\u4ECE\u65E5\u8BB0\u4E2D\u53D1\u73B0"}`,i);try{await n.createEntity({type:t.type,title:t.name,titleRaw:t.name,aliases:[],tags:[],summary:a,confidence:t.confidence||.8,verificationStatus:"verified",createdAt:new Date().toISOString(),createdBy:"ai",lastUpdated:new Date().toISOString(),relatedEntities:[],interactions:[{timestamp:new Date().toISOString(),type:"ai_analysis",content:s,sourceBlockId:this.activeBlockId||void 0}],metadata:{status:"active",source:"diary",...t.type==="person"?{person_kind:this.inferPersonKind(t)}:{}}})}catch(o){if(!n.findEntity(t.name))throw o;await this.recordEntityInteraction(t.name,this.mergeSupplement(t.context||`\u65E5\u8BB0\u63D0\u5230\uFF1A${this.currentSessionContent()}`,i))}}async recordEntityInteraction(t,i){let n=this.plugin.getEntityManager(),r=n?.findEntity(t);r&&await n.addInteraction(r.id,{timestamp:new Date().toISOString(),type:"diary_mention",content:i,sourceBlockId:this.activeBlockId||void 0})}inferPersonKind(t){let i=`${t.name} ${t.context||""}`;return/公司|智能|科技|集团|有限|实验室|研究院|研究所|管委会|委员会|部门|团队|机构|中心|银行|移动|电信|联通|大学|学院|医院|政府|协会|基金|资本|投资|园区/i.test(i)?"\u7EC4\u7EC7":"\u4E2A\u4EBA"}async renderEntityIndex(){if(!this.entityIndexEl||this.mode!=="analysis")return;if(this.analysisTab!=="insight"){this.entityIndexEl.removeClass("visible");return}this.entityIndexEl.empty(),this.entityIndexEl.addClass("visible");let t=this.plugin.entityIndex;if(!t||t.entries.length===0){this.entityIndexEl.createEl("div",{cls:"lifewiki-entity-index-empty",text:"\u8FD8\u6CA1\u6709\u5B9E\u4F53\u6863\u6848\u3002\u5206\u6790\u65E5\u8BB0\u540E\u4F1A\u9010\u6B65\u5EFA\u7ACB\u3002"});return}let i=new Map;for(let n of t.entries){let r=n.cardType;i.has(r)||i.set(r,[]),i.get(r).push(n)}for(let[n,r]of this.sortedTypeGroups(i)){let a=this.getEntityTypeLabel(n);this.renderEntityIndexSection(a,r)}}sortedTypeGroups(t){let i=["person","object","theme"],n=[];for(let r of i){let a=t.get(r);a&&a.length>0&&n.push([r,a])}return n}renderEntityIndexSection(t,i){if(!this.entityIndexEl)return;let n=this.entityIndexEl.createEl("div",{cls:"lifewiki-entity-index-section"}),r=n.createEl("div",{cls:"lifewiki-entity-index-header"});r.createEl("span",{text:t}),r.createEl("span",{cls:"lifewiki-entity-index-count",text:String(i.length)});let a=[...i].sort((s,o)=>{let l=new Date(o.lastUpdated).getTime(),c=new Date(s.lastUpdated).getTime();return l-c}).slice(0,20);for(let s of a){let o=n.createEl("div",{cls:"lifewiki-entity-index-item"});o.createEl("div",{cls:"lifewiki-entity-index-item-title",text:s.name});let l=o.createEl("div",{cls:"lifewiki-entity-index-meta"}),c=[];s.maturity&&c.push(this.maturityLabel(s.maturity)),c.push(`\u7F6E\u4FE1\u5EA6 ${Math.round((s.confidence||0)*100)}%`),s.relationCount>0&&c.push(`\u5173\u8054 ${s.relationCount}`),s.subtype&&c.push(he(s.cardType,s.subtype)||s.subtype);for(let u of c){let d=u.startsWith("L");l.createEl("span",{cls:`lifewiki-entity-index-chip${d?" maturity":""}`,text:u})}}}async refreshEntityIndexAttention(){this.hasTodayInsightAttention=!0,this.mode==="analysis"&&this.analysisTab==="insight"&&this.renderAnalysisTabs()}addChatMessage(t,i){if(!this.chatMessagesEl)return null;this.showChatState();let n=this.chatMessagesEl.createEl("div",{cls:`lifewiki-chat-msg ${t}`});return t==="assistant"&&(n.setAttr("title","\u70B9\u51FB\u590D\u5236"),n.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(n.innerText.replace(/已复制$/,"").trim()||i);let r=n.createEl("span",{cls:"lifewiki-chat-msg-copy-hint",text:"\u5DF2\u590D\u5236"});setTimeout(()=>r.remove(),1500)}catch(r){console.error("Failed to copy:",r)}})),t==="assistant"&&i?this.renderMessageMarkdown(n,i):this.renderMessageContent(n,i),this.scrollToBottom(),!this.replayingHistory&&this.mode==="analysis"&&this.activeBlockId&&i&&this.plugin.getSessionManager().addMessage(this.activeBlockId,{role:t,content:i},this.activeParentId),n}renderMessageContent(t,i){t.empty();let n=i.split(/\*\*(.+?)\*\*/g);for(let r=0;r<n.length;r++)r%2===1?t.createEl("strong",{text:n[r]}):t.createEl("span",{text:n[r]})}async renderMessageMarkdown(t,i){t.empty(),await B.MarkdownRenderer.render(this.app,i,t,"",this)}async streamChatMessage(t){let i=this.stripThinking(t),n=this.addChatMessage("assistant","");if(!n)return null;let r="",a=i.length>220?3:1;for(let s=0;s<i.length;s+=a)r+=i.slice(s,s+a),this.renderMessageContent(n,r),this.scrollToBottom(),await new Promise(o=>setTimeout(o,8));return await this.renderMessageMarkdown(n,i),!this.replayingHistory&&this.mode==="analysis"&&this.activeBlockId&&this.plugin.getSessionManager().addMessage(this.activeBlockId,{role:"assistant",content:i},this.activeParentId),n}async sendMessage(){if(!this.inputTextarea||this.isLoading)return;let t=this.inputTextarea.value.trim();if(!t)return;if(this.mode==="chat"){await this.sendChatMessage(t);return}if(!this.activeBlockId)return;let i=t.toLowerCase().trim();if(this.clarificationPhase==="review_known"&&(i==="\u6CA1\u6709"||i==="\u6CA1\u6709\u4E86"||i==="\u4E0D\u7528\u4E86"||i==="no"||i==="\u7ED3\u675F")){this.isLoading=!0,this.inputTextarea.value="",this.autoResizeTextarea(),this.updateSendBtnState(),this.addChatMessage("user",t),await this.streamChatMessage("\u597D\u7684\uFF0C\u90A3\u5C31\u5230\u8FD9\u91CC\u3002"),this.knownEntities=[],await this.finishClarification(),this.isLoading=!1,this.updateSendBtnState();return}if(this.clarificationPhase==="clarifying"){if(i==="\u8DF3\u8FC7"||i==="skip"||i==="\u4E0B\u4E00\u4E2A"||i==="next"){this.isLoading=!0,this.inputTextarea.value="",this.autoResizeTextarea(),this.updateSendBtnState(),this.addChatMessage("user",t),await this.skipCurrentEntity(),this.isLoading=!1,this.updateSendBtnState();return}if(i==="\u7ED3\u675F"||i==="\u4E0D\u7528\u4E86"||i==="finish"||i==="stop"){this.isLoading=!0,this.inputTextarea.value="",this.autoResizeTextarea(),this.updateSendBtnState(),this.addChatMessage("user",t),await this.finishClarification(),this.isLoading=!1,this.updateSendBtnState();return}}this.isLoading=!0,this.inputTextarea.value="",this.autoResizeTextarea(),this.updateSendBtnState(),this.addChatMessage("user",t),this.showThinkingIndicator();try{if(this.clarificationPhase==="clarifying"){let n=this.clarificationQueue[this.currentEntityIndex];this.hideThinkingIndicator();let r=await this.parseClarificationResponse(t,n);if(await this.streamChatMessage(r.acknowledgment),await this.updateEntityFromClarification(n,r.attributes,t),this.currentEntityIndex++,this.currentEntityIndex>=this.clarificationQueue.length)await this.finishClarification();else{let a=this.clarificationQueue[this.currentEntityIndex];await this.streamChatMessage("\u597D\u7684\uFF0C\u518D\u6765\u770B\u770B **"+a.name+"**\u3002"),setTimeout(async()=>{await this.askCurrentEntityQuestion()},300)}}else if(this.clarificationPhase==="review_known"){this.hideThinkingIndicator();let n=t.toLowerCase().trim();if(n==="\u6CA1\u6709"||n==="\u6CA1\u6709\u4E86"||n==="\u4E0D\u7528\u4E86"||n==="no"||n==="nope"||n==="\u7ED3\u675F"||n==="\u7ED3\u675F\u4E86")this.knownEntities=[],await this.finishClarification();else{if(this.knownEntities.length===1){let r=await this.parseClarificationResponse(t,this.knownEntities[0]);await this.updateEntityFromClarification(this.knownEntities[0],r.attributes||{},t)}else{let r=await this.parseMultiEntityResponse(t,this.knownEntities);for(let a of this.knownEntities){let s=r[a.name]||{};await this.updateEntityFromClarification(a,s,t)}}await this.streamChatMessage("\u5DF2\u66F4\u65B0 "+this.knownEntities.length+" \u4E2A\u76F8\u5173\u6863\u6848\u4FE1\u606F\u3002"),this.knownEntities=[],await this.finishClarification()}}}catch(n){console.error("AI chat error:",n),this.hideThinkingIndicator(),this.addChatMessage("assistant","\u62B1\u6B49\uFF0CAI \u54CD\u5E94\u5931\u8D25: "+n.message)}this.isLoading=!1,this.updateSendBtnState()}async parseMultiEntityResponse(t,i){let n=this.plugin.getAIProvider(),a=`\u7528\u6237\u5BF9\u4EE5\u4E0B\u5B9E\u4F53\u505A\u4E86\u8865\u5145\uFF1A
`+i.map(s=>"- "+s.name+" ["+s.type+"]").join(`
`)+`

\u7528\u6237\u56DE\u7B54\uFF1A`+t+`

\u8BF7\u4E3A\u6BCF\u4E2A\u5B9E\u4F53\u63D0\u53D6\u5C5E\u6027\uFF0C\u4F8B\u5982\u7528\u6237\u8BF4\u201C\u5F20\u4E09\u5728\u5B57\u8282\u505APM\uFF0C\u5C0F\u674E\u662F\u5356\u65B9\u201D\uFF0C\u5219\u8FD4\u56DE\uFF1A{"\u5F20\u4E09":{"company":"\u5B57\u8282","role":"PM"},"\u5C0F\u674E":{"relationship_to_user":"\u5356\u65B9"}}
\u53EA\u8FD4\u56DE\u5408\u6CD5 JSON\u3002`;try{let s=await n.chat([{role:"user",content:a}],"analysis"),o=this.extractJSON(s.content);return JSON.parse(o)}catch{return{}}}async parseClarificationResponse(t,i){let n=this.plugin.getAIProvider(),r=this.plugin.getUserProfileContext(),a=i.subtype?he(i.type,i.subtype)||i.subtype:"",s=a?`${i.type} / ${i.subtype}\uFF08${a}\uFF09`:i.type,o=["\u7528\u6237\u56DE\u7B54\u4E86\u5173\u4E8E\u300C"+i.name+"\u300D\uFF08\u7C7B\u578B\uFF1A"+s+"\uFF09\u7684\u6F84\u6E05\u95EE\u9898\u3002"];r&&(o.push(""),o.push(r),o.push(""),o.push("\u6839\u636E\u4E0A\u8FF0\u7528\u6237\u6863\u6848\uFF0C\u8BF7\u505A\u5408\u7406\u63A8\u65AD\u3002\u4F8B\u5982\uFF1A\u7528\u6237\u56DE\u7B54\u201C\u662F\u540C\u4E8B\u201D\uFF0C\u5219\u516C\u53F8\u5E94\u4E0E\u7528\u6237\u6863\u6848\u4E2D\u7684\u516C\u53F8\u76F8\u540C\u3002\u7528\u6237\u56DE\u7B54\u201C\u662F\u670B\u53CB\u201D\uFF0C\u5219\u5173\u7CFB\u4E3A friend\u3002")),o.push(""),o.push("\u7528\u6237\u56DE\u7B54\uFF1A"+t);let l=o.concat(["\u8BF7\u4ECE\u7528\u6237\u56DE\u7B54\u4E2D\u63D0\u53D6\u5173\u952E\u5C5E\u6027\u4FE1\u606F\u3002","","\u5F53\u524D\u5B9E\u4F53\u7C7B\u578B\u662F "+s+"\uFF0C\u53EF\u7528\u7684\u5C5E\u6027\u540D\u4E3A\uFF1A",ii(i.type,i.subtype),"","=== \u91CD\u8981\uFF1Aattributes \u5FC5\u987B\u662F\u5E73\u94FA\u7684 key-value\uFF0C\u4E0D\u8981\u5D4C\u5957===",'\u9519\u8BEF\u793A\u4F8B\uFF1A{ "person": { "company": "xxx" } }','\u6B63\u786E\u793A\u4F8B\uFF1A{ "company": "xxx", "role": "xxx" }',"","\u8FD4\u56DE\u4E00\u4E2A JSON \u5BF9\u8C61\uFF0C\u4F8B\u5982\u7528\u6237\u8BF4\u201C\u5F20\u4E09\u662F\u5B57\u8282\u8DF3\u52A8\u7684\u4EA7\u54C1\u7ECF\u7406\uFF0C\u662F\u6211\u540C\u4E8B\uFF0C\u53EB\u4ED6\u4E09\u54E5\u201D\uFF0C\u5219\u8FD4\u56DE\uFF1A","{",'  "acknowledgment": "\u660E\u767D\u4E86\uFF0C\u5F20\u4E09\u5728\u5B57\u8282\u8DF3\u52A8\u505A\u4EA7\u54C1\u7ECF\u7406\uFF0C\u662F\u4F60\u540C\u4E8B\u3002",','  "attributes": { "company": "\u5B57\u8282\u8DF3\u52A8", "role": "\u4EA7\u54C1\u7ECF\u7406", "relationship_to_user": "\u540C\u4E8B", "aliases": "\u4E09\u54E5" }',"}","","\u53EA\u8FD4\u56DE\u5408\u6CD5 JSON\uFF0C\u4E0D\u8981 markdown\u3002"]).join(`
`);try{let c=await n.chat([{role:"user",content:l}],"analysis"),u=this.extractJSON(c.content),d=JSON.parse(u);return{acknowledgment:d.acknowledgment||`\u660E\u767D\u4E86\uFF0C\u5173\u4E8E\u300C${i.name}\u300D\u7684\u4FE1\u606F\u5DF2\u8BB0\u5F55\u3002`,attributes:d.attributes||{}}}catch{return{acknowledgment:`\u6536\u5230\uFF0C\u5173\u4E8E\u300C${i.name}\u300D\u7684\u4FE1\u606F\u5DF2\u8BB0\u5F55\u3002`,attributes:{}}}}extractJSON(t){let i=t.indexOf("{");if(i<0)return"{}";let n=0;for(let r=i;r<t.length;r++)if(t[r]==="{")n++;else if(t[r]==="}"&&(n--,n===0))return t.slice(i,r+1);return"{}"}flattenAttributes(t){let i={},n=["person","object","theme"];for(let[r,a]of Object.entries(t))n.includes(r)&&typeof a=="object"&&a!==null?Object.assign(i,a):i[r]=a;return i}normalizeAttributes(t,i){let n={},r={title:"role",position:"role",job:"role",relationship:"relationship_to_user",relation:"relationship_to_user",company_name:"company",organization:"company",type:"subtype",state:"status",due_date:"deadline",due:"deadline",count:"occurrenceCount",frequency:"occurrenceCount"};for(let[a,s]of Object.entries(t)){let o=r[a]||a;n[o]=s}return n}async updateEntityFromClarification(t,i,n){let r=this.flattenAttributes(i),a=this.normalizeAttributes(r,t.type),s=a.aliases;delete a.aliases;let o=[];typeof s=="string"?o.push(...s.split(/[,，、]/).map(u=>u.trim()).filter(Boolean)):Array.isArray(s)&&o.push(...s.map(String));let l=this.plugin.getEntityManager(),c=l.findEntity(t.name);if(c){let d=l.getEntity(c.id)?.aliases||[],f=[...new Set([...d,...o])];await l.updateEntity(c.id,{...a,aliases:f,lastUpdated:new Date().toISOString()})}else{let u=this.currentSessionContent();await l.createEntity({title:t.name,type:t.type,aliases:o,metadata:a,interactions:[{timestamp:new Date().toISOString(),type:"diary_mention",content:u||t.context||t.name}]})}if(n){let u=l.findEntity(t.name);u&&await l.addInteraction(u.id,{timestamp:new Date().toISOString(),type:"user_feedback",content:n})}}async continueBlockConversation(t){if(!this.activeBlockId)throw new Error("No active block");let i=this.plugin.getSessionManager().getSession(this.activeBlockId,this.activeParentId),n=i?.content||this.currentSessionContent(),r=this.plugin.getUserProfileContext(),a=this.plugin.getAIProvider(),s=i?.messages||[],o="\u4F60\u662F TraceMind \u7684\u65E5\u8BB0\u5206\u6790\u52A9\u624B\u3002\u56F4\u7ED5\u5F53\u524D\u8FD9\u6761\u65E5\u8BB0\uFF0C\u7528\u81EA\u7136\u4E2D\u6587\u5E2E\u52A9\u7528\u6237\u8865\u5145\u5B9E\u4F53\u80CC\u666F\u3001\u4E8B\u5B9E\u3001\u5173\u7CFB\u548C\u4E92\u52A8\u8BB0\u5F55\u3002\u4E00\u6B21\u53EA\u95EE\u4E00\u4E2A\u5173\u952E\u95EE\u9898\uFF0C\u907F\u514D\u8F93\u51FA\u4EE3\u7801\u6216 JSON\u3002";r&&(o+=`

`+r+`

\u8BF7\u6839\u636E\u7528\u6237\u6863\u6848\u505A\u5408\u7406\u63A8\u65AD\u3002\u4F8B\u5982\u7528\u6237\u56DE\u7B54"\u662F\u540C\u4E8B"\uFF0C\u5219\u516C\u53F8\u5E94\u4E0E\u7528\u6237\u76F8\u540C\u3002`);let l=await a.chat([{role:"system",content:o},{role:"user",content:"\u5F53\u524D\u65E5\u8BB0\uFF1A"+(n||"\u65E0")},...s.length>0?s.slice(-8):[{role:"user",content:t}]],"analysis");return{aiResponse:this.stripThinking(l.content)}}async executeChatActions(t){let i=[],n=this.plugin.getEntityManager();for(let r of t)try{switch(r.action){case"search_entity":{let a=n.findEntity(r.name||"");if(a){let s=["\u627E\u5230\u5B9E\u4F53\uFF1A"+a.name];s.push("\u7C7B\u578B\uFF1A"+a.cardType),a.subtype&&s.push("\u5B50\u7C7B\u578B\uFF1A"+a.subtype),a.maturity&&s.push("\u6210\u719F\u5EA6\uFF1A"+a.maturity),i.push(s.join("\uFF0C"))}else i.push("\u672A\u627E\u5230\u5B9E\u4F53\uFF1A"+(r.name||""));break}case"get_entity":{let a=n.findEntity(r.name||"");if(!a){i.push("\u672A\u627E\u5230\u5B9E\u4F53\uFF1A"+(r.name||""));break}try{let s=await this.plugin.app.vault.adapter.read(a.filePath),o=s.match(/^---\n([\s\S]*?)\n---/),l=[];if(o)for(let u of o[1].split(`
`)){let d=u.indexOf(":");if(d>0){let f=u.slice(0,d).trim(),p=u.slice(d+1).trim();f&&p&&f!=="id"&&f!=="name"&&l.push(f+": "+p)}}let c="=== "+a.name+` \u6863\u6848\u6458\u8981 ===
\u7C7B\u578B\uFF1A`+a.cardType+`
\u5C5E\u6027\uFF1A`+(l.length>0?l.join("\uFF0C"):"\u65E0")+`

--- \u5B8C\u6574\u5185\u5BB9 ---
`+s;i.push(c)}catch{let s=[a.name+" ["+a.cardType+"]"];a.maturity&&s.push("\u6210\u719F\u5EA6\uFF1A"+a.maturity),a.subtype&&s.push("\u5B50\u7C7B\u578B\uFF1A"+a.subtype),i.push(s.join("\uFF0C"))}break}case"create_entity":{if(!r.name||!r.type){i.push("\u521B\u5EFA\u5931\u8D25\uFF1A\u7F3A\u5C11 name \u6216 type");break}let a=n.findEntity(r.name);if(a){i.push("\u5B9E\u4F53\u5DF2\u5B58\u5728\uFF1A"+r.name+" ("+a.cardType+")\uFF0C\u8BF7\u7528 update_entity \u4FEE\u6539");break}await n.createEntity({title:r.name,type:r.type,metadata:r.attributes||{}}),i.push("\u5DF2\u521B\u5EFA "+r.type+" \u5B9E\u4F53\uFF1A"+r.name);break}case"update_entity":{if(!r.name){i.push("\u66F4\u65B0\u5931\u8D25\uFF1A\u7F3A\u5C11 name");break}let a=n.findEntity(r.name);if(!a){i.push("\u672A\u627E\u5230\u5B9E\u4F53\uFF1A"+r.name);break}await n.updateEntity(a.id,r.attributes||{}),i.push("\u5DF2\u66F4\u65B0 "+r.name);break}case"list_diary":{try{let s=(await this.plugin.app.vault.adapter.list("Daily/")).files.filter(c=>c.endsWith(".md")).sort().reverse(),o=new Date().toISOString().split("T")[0],l=s.slice(0,7);if(i.push("Daily/ \u76EE\u5F55\u5171 "+s.length+" \u7BC7\u65E5\u8BB0\u3002\u6700\u8FD1\uFF1A"+l.map(c=>c.replace("Daily/","").replace(".md","")).join("\u3001")),r.dateRange==="today"||!r.dateRange){let c="Daily/"+o+".md";s.includes(c)&&i.push("\u4ECA\u5929\u7684\u65E5\u8BB0\uFF1A"+c)}}catch(a){i.push("\u8BFB\u53D6\u65E5\u8BB0\u5217\u8868\u5931\u8D25\uFF1A"+a.message)}break}case"get_diary":{try{let a=r.date||new Date().toISOString().split("T")[0],s="Daily/"+a+".md",o=await this.plugin.app.vault.adapter.read(s);i.push("\u65E5\u8BB0 "+a+` \u7684\u5185\u5BB9\uFF1A
`+o)}catch(a){i.push("\u8BFB\u53D6\u65E5\u8BB0\u5931\u8D25\uFF1A"+a.message)}break}default:i.push("\u672A\u77E5\u64CD\u4F5C\uFF1A"+r.action)}}catch(a){i.push("\u64CD\u4F5C\u5931\u8D25 "+r.action+": "+a.message)}return i}buildChatSystemPrompt(){let t=[];t.push("\u4F60\u662F TraceMind \u7684 Vault \u7BA1\u5BB6\u52A9\u624B\u3002\u4F60\u53EF\u4EE5\u901A\u8FC7\u5D4C\u5165 [TRACEMIND_ACTION] \u5757\u6765\u6267\u884C\u64CD\u4F5C\u3002"),t.push("\u4E0D\u8981\u8F93\u51FA\u601D\u8003\u8FC7\u7A0B\u3001\u5185\u5FC3\u72EC\u767D\u6216\u81EA\u95EE\u81EA\u7B54\u3002\u76F4\u63A5\u6267\u884C\u64CD\u4F5C\u5E76\u7ED9\u51FA\u7ED3\u679C\u3002");let i=new Date;t.push("\u4ECA\u5929\u662F "+i.getFullYear()+"\u5E74"+(i.getMonth()+1)+"\u6708"+i.getDate()+"\u65E5\u3002"),t.push(""),t.push("\u53EF\u7528\u64CD\u4F5C\uFF1A"),t.push('- search_entity: {"action":"search_entity","name":"\u5B9E\u4F53\u540D"}'),t.push('- get_entity: {"action":"get_entity","type":"person","name":"\u5B9E\u4F53\u540D"}'),t.push('- get_diary: {"action":"get_diary","date":"YYYY-MM-DD"}'),t.push('- create_entity: {"action":"create_entity","type":"person|object|theme","name":"\u540D\u79F0","attributes":{"key":"value"}}'),t.push('- update_entity: {"action":"update_entity","type":"person|object|theme","name":"\u540D\u79F0","attributes":{"key":"value"}}'),t.push(""),t.push("\u4F60\u7684\u80FD\u529B\uFF1A"),t.push("- \u641C\u7D22\u3001\u67E5\u8BE2\u3001\u521B\u5EFA\u3001\u4FEE\u6539 Person/Object/Theme \u6863\u6848"),t.push("- \u67E5\u770B\u4EFB\u610F\u65E5\u671F\u65E5\u8BB0\uFF08\u4F7F\u7528 get_diary \u64CD\u4F5C\uFF09"),t.push("- \u603B\u7ED3\u3001\u5206\u6790\u65E5\u8BB0\uFF08Daily/ \u76EE\u5F55\uFF09"),t.push("- \u64B0\u5199\u5468\u62A5\u3001\u6708\u62A5"),t.push("- \u5206\u6790\u5B9E\u4F53\u5173\u7CFB\u548C\u4E92\u52A8\u6A21\u5F0F"),t.push(""),t.push("\u91CD\u8981\u89C4\u5219\uFF1A"),t.push("- \u5F53\u7528\u6237\u63D0\u53CA\u67D0\u4E2A\u5B9E\u4F53\u65F6\uFF0C\u4F18\u5148\u4F7F\u7528 get_entity \u67E5\u8BE2\u5176\u6863\u6848\uFF0C\u6863\u6848\u4E2D\u5DF2\u5305\u542B\u4E0E\u8BE5\u5B9E\u4F53\u76F8\u5173\u7684\u65E5\u8BB0\u4E92\u52A8\u8BB0\u5F55\u3002\u53EA\u6709\u5728\u6863\u6848\u4FE1\u606F\u4E0D\u8DB3\u65F6\u624D\u7528 get_diary \u8865\u5145\u67E5\u8BE2\u3002"),t.push("- \u521B\u5EFA\u65B0\u5B9E\u4F53\u524D\uFF0C\u5FC5\u987B\u5148\u7528 search_entity \u786E\u8BA4\u4E0D\u5B58\u5728\uFF0C\u907F\u514D\u91CD\u590D\u521B\u5EFA\u3002"),t.push("- \u4FEE\u6539\u5B9E\u4F53\u524D\uFF0C\u5FC5\u987B\u5148\u7528 get_entity \u786E\u8BA4\u5B58\u5728\u5E76\u67E5\u770B\u5F53\u524D\u5C5E\u6027\u3002"),t.push(""),t.push(ot());let n=this.plugin.entityIndex?.entries||[];if(n.length>0){let a=n.filter(l=>l.cardType==="person"||l.type==="person"),s=n.filter(l=>l.cardType==="object"||l.type==="project"),o=n.filter(l=>l.cardType==="theme"||l.type==="theme");t.push(""),t.push("\u5F53\u524D Vault: "+a.length+"\u4EBA\u7269, "+s.length+"\u5BA2\u4F53, "+o.length+"\u4E3B\u9898"),a.length>0&&t.push("\u4EBA\u7269: "+a.map(l=>l.name).join("\u3001")),s.length>0&&t.push("\u5BA2\u4F53: "+s.map(l=>l.name).join("\u3001")),o.length>0&&t.push("\u4E3B\u9898: "+o.map(l=>l.name).join("\u3001"))}let r=this.plugin.getUserProfileContext();return r&&(t.push(""),t.push(r)),t.push(""),t.push("\u5F53\u9700\u8981\u6267\u884C\u64CD\u4F5C\u65F6\uFF0C\u5FC5\u987B\u4F7F\u7528\u4EE5\u4E0B\u5B8C\u6574\u683C\u5F0F\uFF08\u5F00\u59CB\u6807\u7B7E\u548C\u7ED3\u675F\u6807\u7B7E\u90FD\u4E0D\u80FD\u7701\u7565\uFF09\uFF1A"),t.push("[TRACEMIND_ACTION]"),t.push('{"action":"get_diary","date":"2026-05-05"}'),t.push("[/TRACEMIND_ACTION]"),t.push(""),t.push("\u7136\u540E\u7EE7\u7EED\u7528\u53CB\u597D\u7684\u4E2D\u6587\u56DE\u7B54\u3002\u64CD\u4F5C\u5757\u4E4B\u5916\u4E0D\u8981\u51FA\u73B0\u4EFB\u4F55 JSON\u3002"),t.join(`
`)}async detectLocalAgents(){if(this.plugin.settings.localAgentEnabled&&this.agentSelectEl){try{let{resolveExecutable:t}=await Promise.resolve().then(()=>(de(),Je)),i=[{key:"claude-code",name:"Claude Code",binary:"claude"},{key:"hermes",name:"Hermes",binary:"hermes"}];this.detectedLocalAgents=[];for(let n of i)await t(n.binary)&&this.detectedLocalAgents.push(n.key)}catch{}this.rebuildAgentSelector()}}rebuildAgentSelector(){if(!this.agentSelectEl)return;let t=this.agentSelectEl.value||this.currentAgentKey;this.agentSelectEl.empty();let i=this.plugin.settings.providers||[];for(let n of i)this.agentSelectEl.createEl("option",{value:n.id,text:n.name||n.model||n.id});if(i.length===0&&this.agentSelectEl.createEl("option",{value:"",text:"\u4E91\u7AEF API"}),this.plugin.settings.localAgentEnabled){let n={"claude-code":"Claude Code",hermes:"Hermes"};for(let r of this.detectedLocalAgents)this.agentSelectEl.createEl("option",{value:r,text:n[r]||r})}t&&this.agentSelectEl.querySelector(`option[value="${t}"]`)&&(this.agentSelectEl.value=t),this.currentAgentKey=this.agentSelectEl.value}buildLocalAgentPrompt(t){let i=new Date,n=this.app.vault.adapter.basePath||"vault",r=[];r.push(`\u4F60\u662F TraceMind \u77E5\u8BC6\u5E93\u7684 AI \u52A9\u624B\u3002\u4ECA\u5929\u662F ${i.getFullYear()}\u5E74${i.getMonth()+1}\u6708${i.getDate()}\u65E5\u3002`),r.push(""),r.push("## Vault \u4F4D\u7F6E"),r.push(`\u4F60\u7684\u5DE5\u4F5C\u76EE\u5F55\u5C31\u662F Obsidian Vault: ${n}`),r.push("\u4F60\u53EF\u4EE5\u7528\u6587\u4EF6\u5DE5\u5177\u76F4\u63A5\u8BFB Person/Object/Theme/Daily \u76EE\u5F55\u4E0B\u7684 Markdown \u6587\u4EF6\u3002"),r.push(""),r.push(ot()),r.push(""),r.push("## \u89C4\u5219"),r.push("- \u7528\u6237\u63D0\u5230\u67D0\u4E2A\u5B9E\u4F53\u65F6\uFF0C\u5148\u8BFB\u5176\u6863\u6848\uFF08Person/Object/Theme \u76EE\u5F55\u4E0B\u540C\u540D .md \u6587\u4EF6\uFF09"),r.push("- \u6863\u6848\u4E2D\u5DF2\u6709\u4E92\u52A8\u8BB0\u5F55\u5173\u8054\u5230\u76F8\u5173\u65E5\u8BB0"),r.push("- \u4E0D\u8981\u7F16\u9020\u4E0D\u5B58\u5728\u7684\u4FE1\u606F"),r.push("- \u7B80\u77ED\u3001\u6709\u7528\u5730\u56DE\u7B54");let a=this.plugin.entityIndex?.entries||[];if(a.length>0){let o=a.filter(u=>u.cardType==="person"||u.type==="person"),l=a.filter(u=>u.cardType==="object"||u.type==="project"),c=a.filter(u=>u.cardType==="theme"||u.type==="theme");r.push(""),r.push(`\u5F53\u524D Vault: ${o.length}\u4EBA\u7269, ${l.length}\u5BA2\u4F53, ${c.length}\u4E3B\u9898`),o.length>0&&r.push("\u4EBA\u7269: "+o.map(u=>u.name).join("\u3001")),l.length>0&&r.push("\u5BA2\u4F53: "+l.map(u=>u.name).join("\u3001")),c.length>0&&r.push("\u4E3B\u9898: "+c.map(u=>u.name).join("\u3001"))}let s=this.plugin.getUserProfileContext();return s&&(r.push(""),r.push(s)),r.push(""),r.push("---"),r.push(""),r.push("\u7528\u6237\u6D88\u606F\uFF1A"+t),r.join(`
`)}async sendChatViaLocalAgent(t,i,n){let r=this.plugin.getSessionManager();try{let a=this.currentAgentKey,s;if(a==="hermes"){let{hermesProvider:d}=await Promise.resolve().then(()=>(oi(),si));s=d}else{let{claudeCodeProvider:d}=await Promise.resolve().then(()=>(ui(),ci));s=d}let o=this.buildLocalAgentPrompt(t),l=s.execute(o),c=!0,u="";l.onMessage=d=>{d.type==="text"&&d.content?(c&&(this.hideThinkingIndicator(),this.addChatMessage("assistant",""),c=!1),u+=d.content,this.updateLastAssistantMessage(u),this.scrollToBottom()):d.type},l.onDone=async d=>{if(d.status==="completed"&&d.output){let f=this.stripThinking(d.output),p=rt(f);if(p.actions.length>0){p.text&&this.updateLastAssistantMessage(p.text),await this.finalizeLastAssistantMessage();let h=await this.executeChatActions(p.actions);h.length>0&&(r.addChatMessage({role:"assistant",content:p.text||f}),r.addChatMessage({role:"system",content:`\u64CD\u4F5C\u7ED3\u679C\uFF1A
`+h.join(`
`)}))}else p.text?(this.updateLastAssistantMessage(p.text),r.addChatMessage({role:"assistant",content:p.text})):r.addChatMessage({role:"assistant",content:f}),await this.finalizeLastAssistantMessage()}else c?(this.hideThinkingIndicator(),this.addChatMessage("assistant","\u672C\u5730 Agent \u8FD4\u56DE\u7A7A\u5185\u5BB9\u6216\u6267\u884C\u5931\u8D25\uFF1A"+(d.error||"\u672A\u77E5\u9519\u8BEF"))):await this.finalizeLastAssistantMessage();this.isLoading=!1,this.updateSendBtnState()},l.onError=d=>{this.hideThinkingIndicator(),this.addChatMessage("assistant","\u672C\u5730 Agent \u8C03\u7528\u5931\u8D25: "+d.message),this.isLoading=!1,this.updateSendBtnState()}}catch(a){this.hideThinkingIndicator(),this.addChatMessage("assistant","\u672C\u5730 Agent \u542F\u52A8\u5931\u8D25: "+a.message),this.isLoading=!1,this.updateSendBtnState()}}stripThinking(t){let i=t.replace(/<[Tt]hinking>[\s\S]*?<\/[Tt]hinking>/gi,"").replace(/<[Tt]hink>[\s\S]*?<\/[Tt]hink>/gi,"").replace(/<\/?[Tt]hink>/g,"").replace(/<\/?[Tt]hinking>/g,""),n=i.split(/\n\n+/);if(n.length>2){let r=n[n.length-1];if(r.length<300||/\[TRACEMIND_ACTION\]|^已|^✅|^好的/.test(r.trim()))for(let a=n.length-1;a>=0;a--){let s=n[a].trim();if(s.length>0&&!/^(不过|但是|可能|也许|可以|需要|如果|那么|因为|所以|让我|我想|我判断|当前|查找|搜索|创建|更新|首先|然后|接着|另外|实际|根据|注意|重要)/.test(s)){i=s;break}}}return i.trim()}async sendChatMessage(t){if(!this.inputTextarea)return;this.isLoading=!0,this.inputTextarea.value="",this.autoResizeTextarea(),this.updateSendBtnState(),this.addChatMessage("user",t),this.showThinkingIndicator();let i=this.plugin.getSessionManager();i.addChatMessage({role:"user",content:t});let n=this.plugin.getAIProvider(),a=i.getChatSession()?.messages||[],s={role:"system",content:this.buildChatSystemPrompt()};if(this.detectedLocalAgents.includes(this.currentAgentKey)){await this.sendChatViaLocalAgent(t,s,a);return}try{let l="",c=!0;await n.streamChat([s,...a],{onDelta:u=>{c&&(this.hideThinkingIndicator(),this.addChatMessage("assistant",""),c=!1),l+=u,this.updateLastAssistantMessage(l),this.scrollToBottom()},onDone:async()=>{if(!l){this.hideThinkingIndicator(),this.addChatMessage("assistant","\u62B1\u6B49\uFF0CAI \u8FD4\u56DE\u4E86\u7A7A\u5185\u5BB9\u3002"),this.isLoading=!1,this.updateSendBtnState();return}let u=this.stripThinking(l),d=rt(u);if(d.actions.length>0){d.text&&this.updateLastAssistantMessage(d.text),await this.finalizeLastAssistantMessage();let f=await this.executeChatActions(d.actions);if(f.length>0){i.addChatMessage({role:"assistant",content:d.text||u}),i.addChatMessage({role:"system",content:`\u64CD\u4F5C\u7ED3\u679C\uFF1A
`+f.join(`
`)});let p=i.getChatSession().messages,h={role:"system",content:this.buildChatSystemPrompt()},g="";await n.streamChat([h,...p],{onDelta:y=>{g+=y;let x=this.getLastAssistantContent()||"";this.updateLastAssistantMessage(x+y),this.scrollToBottom()},onDone:async()=>{g&&i.addChatMessage({role:"assistant",content:g}),await this.finalizeLastAssistantMessage()},onError:y=>{console.error("Follow-up AI stream error:",y)}},"chat")}}else d.text?(this.updateLastAssistantMessage(d.text),i.addChatMessage({role:"assistant",content:d.text})):i.addChatMessage({role:"assistant",content:u}),await this.finalizeLastAssistantMessage();this.isLoading=!1,this.updateSendBtnState()},onError:u=>{console.error("AI chat error:",u),this.hideThinkingIndicator(),this.addChatMessage("assistant","\u62B1\u6B49\uFF0CAI \u54CD\u5E94\u5931\u8D25: "+u.message),this.isLoading=!1,this.updateSendBtnState()}},"chat")}catch(l){console.error("AI chat error:",l),this.hideThinkingIndicator(),this.addChatMessage("assistant","\u62B1\u6B49\uFF0CAI \u54CD\u5E94\u5931\u8D25: "+l.message),this.isLoading=!1,this.updateSendBtnState()}}updateLastAssistantMessage(t){if(!this.chatMessagesEl)return;let i=this.chatMessagesEl.querySelectorAll(".lifewiki-chat-msg.assistant"),n=i[i.length-1];if(n){n.empty();let r=t.replace(/\[TRACEMIND_ACTION\][\s\S]*?\[\/TRACEMIND_ACTION\]/g,"").replace(/\[TRACEMIND_ACTION\][\s\S]*$/,"").replace(/\[\/TRACEMIND_ACTION\]/g,"").replace(/\[TRACEMIND_ACTION\]/g,"");n.createEl("pre",{cls:"lifewiki-chat-streaming",text:r||"..."})}}getLastAssistantContent(){if(!this.chatMessagesEl)return"";let t=this.chatMessagesEl.querySelectorAll(".lifewiki-chat-msg.assistant");return t[t.length-1]?.textContent||""}async finalizeLastAssistantMessage(){if(!this.chatMessagesEl)return;let t=this.chatMessagesEl.querySelectorAll(".lifewiki-chat-msg.assistant"),i=t[t.length-1];if(i){let n=i.textContent||"";n&&await this.renderMessageMarkdown(i,n)}}async handleEntityArchiving(t){let i=this.plugin.getEntityManager();if(i)for(let n of t)try{let r={status:"active",source:"diary"};n.type==="person"?(r.person_kind=/公司|组织|机构|团队/.test(n.smallType||n.context)?"\u7EC4\u7EC7":"\u4E2A\u4EBA",/同事|朋友|客户|供应商|合作伙伴|合作方/.test(n.smallType)&&(r.relationship_to_user=n.smallType)):n.type==="object"?(r.subtype=n.smallType||"other",n.context&&(r.description=n.context)):n.type==="theme"&&(r.subtype=n.smallType||"friction");let a=n.context||`\u4ECE\u65E5\u8BB0\u4E2D\u5F52\u6863\u7684${n.type}`;await i.createEntity({type:n.type,title:n.name,titleRaw:n.name,aliases:[],tags:[],summary:a,confidence:.8,verificationStatus:"verified",createdAt:new Date().toISOString(),createdBy:"ai",lastUpdated:new Date().toISOString(),relatedEntities:[],interactions:[{timestamp:new Date().toISOString(),type:"ai_analysis",content:`\u5F52\u6863\u4E3A${n.smallType}\uFF1A${n.context||"\u65E0"}`,sourceBlockId:this.activeBlockId||void 0}],metadata:r})}catch(r){console.error(`[AIAnalysisPanel] Failed to create entity ${n.name}:`,r)}}async handleEntityUpdate(t){let i=this.plugin.getEntityManager();if(i)for(let n of t)try{let r=i.getEntity(n.entityId);if(!r)continue;let a={lastUpdated:new Date().toISOString()},s=[...r.interactions??[]];for(let o of n.updates)if(o.field.startsWith("metadata.")){let l=o.field.replace("metadata.","");a.metadata={...r.metadata,[l]:o.value}}else o.field==="interactions"?(s.push({timestamp:new Date().toISOString(),type:"ai_analysis",content:o.value,sourceBlockId:this.activeBlockId||void 0}),a.interactions=s):o.field==="summary"&&(a.summary=o.value);await i.updateEntity(n.entityId,a)}catch(r){console.error(`[AIAnalysisPanel] Failed to update entity ${n.name}:`,r)}}async handleRelations(t){let i=this.plugin.getEntityManager();if(i)for(let n of t)try{let r=i.findEntity(n.from),a=i.findEntity(n.to);if(!r||!a)continue;let s=r.relatedEntities||[],o={entityId:a.id,relation:n.relation,context:n.context||`\u901A\u8FC7\u65E5\u8BB0\u5206\u6790\u5EFA\u7ACB\u5173\u7CFB\uFF1A${n.from}\u662F${n.to}\u7684${n.relation}`};s.some(c=>c.entityId===a.id&&c.relation===o.relation)||await i.updateEntity(r.id,{relatedEntities:[...s,o],lastUpdated:new Date().toISOString()})}catch(r){console.error("[AIAnalysisPanel] Failed to create relation:",r)}}async updateBlockCategory(t,i){try{let n=this.app.workspace.getLeavesOfType($);if(n.length===0)return;let r=n[0].view;if(!r)return;let a=r.getBlockById(t);if(!a)return;(a.category==="\u5F85\u5206\u6790"||a.category!==i)&&(a.category=i,await r.saveBlockToFile(a),console.log(`[AIAnalysisPanel] Updated block ${t} category to ${i}`))}catch(n){console.error("[AIAnalysisPanel] Failed to update block category:",n)}}async showEntityConfirmationDialog(t){if(this.chatMessagesEl)for(let i of t){let n=this.chatMessagesEl.createEl("div",{cls:"lifewiki-entity-confirm"});n.createEl("div",{cls:"lifewiki-entity-confirm-title",text:`\u8BC6\u522B\u5230\u65B0${this.getEntityTypeLabel(i.inferredType)}: **${i.name}**`}),n.createEl("div",{cls:"lifewiki-entity-confirm-reason",text:i.reason||"\u4ECE\u65E5\u8BB0\u4E2D\u53D1\u73B0"});let r=n.createEl("div",{cls:"lifewiki-entity-confirm-buttons"}),a=r.createEl("button",{cls:"lifewiki-entity-confirm-btn archive",text:"\u5F52\u6863",attr:{type:"button"}}),s=r.createEl("button",{cls:"lifewiki-entity-confirm-btn skip",text:"\u8DF3\u8FC7",attr:{type:"button"}});a.addEventListener("click",async()=>{await this.archiveEntity(i),n.remove()}),s.addEventListener("click",()=>{n.remove()})}}getEntityTypeLabel(t){return{person:"\u4EBA\u8109",object:"\u5BA2\u4F53",theme:"\u4E3B\u9898"}[t]||"\u5B9E\u4F53"}maturityLabel(t){return t}async archiveEntity(t){let i=this.plugin.getEntityManager();if(!i)return;let r={person:"person",object:"object",theme:"theme"}[t.inferredType]||"person";try{await i.createEntity({type:r,title:t.name,titleRaw:t.name,aliases:[],tags:[],summary:t.reason||"\u4ECE\u65E5\u8BB0\u4E2D\u5F52\u6863",confidence:.8,verificationStatus:"verified",createdAt:new Date().toISOString(),createdBy:"ai",lastUpdated:new Date().toISOString(),relatedEntities:[],interactions:[{timestamp:new Date().toISOString(),type:"ai_analysis",content:`\u5F52\u6863\uFF1A${t.reason||"\u4ECE\u65E5\u8BB0\u4E2D\u53D1\u73B0"}`,sourceBlockId:this.activeBlockId||void 0}],metadata:{status:"active",source:"diary"}}),this.addChatMessage("assistant",`\u5DF2\u5F52\u6863 **${t.name}**`)}catch(a){console.error("[AIAnalysisPanel] Failed to archive entity:",a),this.addChatMessage("assistant","\u5F52\u6863\u5931\u8D25")}}async onClose(){}};var yi=require("obsidian");function _e(e){let t=e.getFullYear(),i=String(e.getMonth()+1).padStart(2,"0"),n=String(e.getDate()).padStart(2,"0");return`${t}-${i}-${n}`}function di(e,t){let i=new Date(e,t,1),n=new Date(e,t+1,0),r=[],a=i.getDay();for(let o=a-1;o>=0;o--)r.push(new Date(e,t,-o));for(let o=1;o<=n.getDate();o++)r.push(new Date(e,t,o));let s=42-r.length;for(let o=1;o<=s;o++)r.push(new Date(e,t+1,o));return r}function pi(e,t){return t===11?{year:e+1,month:0}:{year:e,month:t+1}}function fi(e,t){return t===0?{year:e-1,month:11}:{year:e,month:t-1}}function hi(e,t){let i=new Set;for(let n of e){let r=_e(n);t(r)&&i.add(r)}return i}function gi(e,t){let n=[_e(e)];return t.isToday&&n.push("\u4ECA\u5929"),n.push(t.hasDiary?"\u6709\u65E5\u8BB0":"\u65E0\u65E5\u8BB0"),t.isCurrentMonth||n.push("\u975E\u5F53\u524D\u6708"),n.join(" \xB7 ")}var ye="tracemind-calendar",Re=class extends yi.ItemView{plugin;currentYear;currentMonth;onDateClickCallback=null;constructor(t,i){super(t),this.plugin=i;let n=new Date;this.currentYear=n.getFullYear(),this.currentMonth=n.getMonth()}getViewType(){return ye}getDisplayText(){return"\u65E5\u5386"}getIcon(){return"calendar"}async onOpen(){this.renderCalendar()}setOnDateClick(t){this.onDateClickCallback=t}handleDateClick(t){this.onDateClickCallback&&this.onDateClickCallback(t)}isToday(t){let i=new Date;return t.getFullYear()===i.getFullYear()&&t.getMonth()===i.getMonth()&&t.getDate()===i.getDate()}isCurrentMonth(t){return t.getFullYear()===this.currentYear&&t.getMonth()===this.currentMonth}diaryExists(t){try{return this.app.vault.getAbstractFileByPath(`Daily/${t}.md`)!=null}catch{return!1}}goNext(){let t=pi(this.currentYear,this.currentMonth);this.currentYear=t.year,this.currentMonth=t.month,this.renderCalendar()}goPrev(){let t=fi(this.currentYear,this.currentMonth);this.currentYear=t.year,this.currentMonth=t.month,this.renderCalendar()}goToday(){let t=new Date;this.currentYear=t.getFullYear(),this.currentMonth=t.getMonth(),this.renderCalendar()}async renderCalendar(){let t=this.containerEl;t.empty(),this.addStyles();let i=t.createEl("div",{cls:"tracemind-calendar"});this.renderHeader(i),this.renderWeekdays(i),await this.renderDays(i)}renderHeader(t){let i=t.createEl("div",{cls:"lifewiki-calendar-header"}),n=i.createEl("button",{cls:"lifewiki-calendar-nav-btn",text:"\u2039"});n.setAttr("title","\u4E0A\u4E2A\u6708"),n.setAttr("aria-label","\u4E0A\u4E2A\u6708"),n.addEventListener("click",()=>this.goPrev());let r=i.createEl("span",{cls:"lifewiki-calendar-title",text:this.monthTitle()});r.setAttr("title","\u56DE\u5230\u4ECA\u5929"),r.setAttr("aria-label","\u56DE\u5230\u4ECA\u5929"),r.addEventListener("click",()=>this.goToday());let a=i.createEl("button",{cls:"lifewiki-calendar-nav-btn",text:"\u203A"});a.setAttr("title","\u4E0B\u4E2A\u6708"),a.setAttr("aria-label","\u4E0B\u4E2A\u6708"),a.addEventListener("click",()=>this.goNext())}renderWeekdays(t){let i=t.createEl("div",{cls:"lifewiki-calendar-weekdays"});for(let n of["\u65E5","\u4E00","\u4E8C","\u4E09","\u56DB","\u4E94","\u516D"])i.createEl("div",{cls:"lifewiki-calendar-weekday",text:n})}async renderDays(t){let i=di(this.currentYear,this.currentMonth),n=hi(i,a=>this.diaryExists(a)),r=t.createEl("div",{cls:"lifewiki-calendar-grid"});for(let a of i){let s=_e(a),o=n.has(s),l=this.isCurrentMonth(a),c=this.isToday(a),u=r.createEl("div",{cls:"lifewiki-calendar-day"});l||u.addClass("lifewiki-calendar-day-other-month"),c&&u.addClass("lifewiki-calendar-day-today"),o&&u.addClass("lifewiki-calendar-day-has-diary");let d=gi(a,{isToday:c,hasDiary:o,isCurrentMonth:l});u.setAttr("role","button"),u.setAttr("tabindex","0"),u.setAttr("title",d),u.setAttr("aria-label",d),u.createEl("span",{cls:"lifewiki-calendar-day-num",text:String(a.getDate())});let f=()=>this.handleDateClick(a);u.addEventListener("click",f),u.addEventListener("keydown",p=>{(p.key==="Enter"||p.key===" ")&&(p.preventDefault(),f())})}}monthTitle(){let t=["\u4E00\u6708","\u4E8C\u6708","\u4E09\u6708","\u56DB\u6708","\u4E94\u6708","\u516D\u6708","\u4E03\u6708","\u516B\u6708","\u4E5D\u6708","\u5341\u6708","\u5341\u4E00\u6708","\u5341\u4E8C\u6708"];return`${this.currentYear}\u5E74 ${t[this.currentMonth]}`}addStyles(){if(document.getElementById("lifewiki-calendar-styles"))return;let t=document.createElement("style");t.id="lifewiki-calendar-styles",t.textContent=`
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
`,document.head.appendChild(t)}};function Pi(e){return typeof e>"u"||e===null}function Mr(e){return typeof e=="object"&&e!==null}function Fr(e){return Array.isArray(e)?e:Pi(e)?[]:[e]}function Br(e,t){var i,n,r,a;if(t)for(a=Object.keys(t),i=0,n=a.length;i<n;i+=1)r=a[i],e[r]=t[r];return e}function Pr(e,t){var i="",n;for(n=0;n<t;n+=1)i+=e;return i}function Dr(e){return e===0&&Number.NEGATIVE_INFINITY===1/e}var Lr=Pi,_r=Mr,Rr=Fr,Or=Pr,$r=Dr,Nr=Br,k={isNothing:Lr,isObject:_r,toArray:Rr,repeat:Or,isNegativeZero:$r,extend:Nr};function Di(e,t){var i="",n=e.reason||"(unknown reason)";return e.mark?(e.mark.name&&(i+='in "'+e.mark.name+'" '),i+="("+(e.mark.line+1)+":"+(e.mark.column+1)+")",!t&&e.mark.snippet&&(i+=`

`+e.mark.snippet),n+" "+i):n}function be(e,t){Error.call(this),this.name="YAMLException",this.reason=e,this.mark=t,this.message=Di(this,!1),Error.captureStackTrace?Error.captureStackTrace(this,this.constructor):this.stack=new Error().stack||""}be.prototype=Object.create(Error.prototype);be.prototype.constructor=be;be.prototype.toString=function(t){return this.name+": "+Di(this,t)};var S=be;function lt(e,t,i,n,r){var a="",s="",o=Math.floor(r/2)-1;return n-t>o&&(a=" ... ",t=n-o+a.length),i-n>o&&(s=" ...",i=n+o-s.length),{str:a+e.slice(t,i).replace(/\t/g,"\u2192")+s,pos:n-t+a.length}}function ct(e,t){return k.repeat(" ",t-e.length)+e}function jr(e,t){if(t=Object.create(t||null),!e.buffer)return null;t.maxLength||(t.maxLength=79),typeof t.indent!="number"&&(t.indent=1),typeof t.linesBefore!="number"&&(t.linesBefore=3),typeof t.linesAfter!="number"&&(t.linesAfter=2);for(var i=/\r?\n|\r|\0/g,n=[0],r=[],a,s=-1;a=i.exec(e.buffer);)r.push(a.index),n.push(a.index+a[0].length),e.position<=a.index&&s<0&&(s=n.length-2);s<0&&(s=n.length-1);var o="",l,c,u=Math.min(e.line+t.linesAfter,r.length).toString().length,d=t.maxLength-(t.indent+u+3);for(l=1;l<=t.linesBefore&&!(s-l<0);l++)c=lt(e.buffer,n[s-l],r[s-l],e.position-(n[s]-n[s-l]),d),o=k.repeat(" ",t.indent)+ct((e.line-l+1).toString(),u)+" | "+c.str+`
`+o;for(c=lt(e.buffer,n[s],r[s],e.position,d),o+=k.repeat(" ",t.indent)+ct((e.line+1).toString(),u)+" | "+c.str+`
`,o+=k.repeat("-",t.indent+u+3+c.pos)+`^
`,l=1;l<=t.linesAfter&&!(s+l>=r.length);l++)c=lt(e.buffer,n[s+l],r[s+l],e.position-(n[s]-n[s+l]),d),o+=k.repeat(" ",t.indent)+ct((e.line+l+1).toString(),u)+" | "+c.str+`
`;return o.replace(/\n$/,"")}var Vr=jr,Hr=["kind","multi","resolve","construct","instanceOf","predicate","represent","representName","defaultStyle","styleAliases"],Ur=["scalar","sequence","mapping"];function zr(e){var t={};return e!==null&&Object.keys(e).forEach(function(i){e[i].forEach(function(n){t[String(n)]=i})}),t}function Yr(e,t){if(t=t||{},Object.keys(t).forEach(function(i){if(Hr.indexOf(i)===-1)throw new S('Unknown option "'+i+'" is met in definition of "'+e+'" YAML type.')}),this.options=t,this.tag=e,this.kind=t.kind||null,this.resolve=t.resolve||function(){return!0},this.construct=t.construct||function(i){return i},this.instanceOf=t.instanceOf||null,this.predicate=t.predicate||null,this.represent=t.represent||null,this.representName=t.representName||null,this.defaultStyle=t.defaultStyle||null,this.multi=t.multi||!1,this.styleAliases=zr(t.styleAliases||null),Ur.indexOf(this.kind)===-1)throw new S('Unknown kind "'+this.kind+'" is specified for "'+e+'" YAML type.')}var C=Yr;function mi(e,t){var i=[];return e[t].forEach(function(n){var r=i.length;i.forEach(function(a,s){a.tag===n.tag&&a.kind===n.kind&&a.multi===n.multi&&(r=s)}),i[r]=n}),i}function Kr(){var e={scalar:{},sequence:{},mapping:{},fallback:{},multi:{scalar:[],sequence:[],mapping:[],fallback:[]}},t,i;function n(r){r.multi?(e.multi[r.kind].push(r),e.multi.fallback.push(r)):e[r.kind][r.tag]=e.fallback[r.tag]=r}for(t=0,i=arguments.length;t<i;t+=1)arguments[t].forEach(n);return e}function dt(e){return this.extend(e)}dt.prototype.extend=function(t){var i=[],n=[];if(t instanceof C)n.push(t);else if(Array.isArray(t))n=n.concat(t);else if(t&&(Array.isArray(t.implicit)||Array.isArray(t.explicit)))t.implicit&&(i=i.concat(t.implicit)),t.explicit&&(n=n.concat(t.explicit));else throw new S("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");i.forEach(function(a){if(!(a instanceof C))throw new S("Specified list of YAML types (or a single Type object) contains a non-Type object.");if(a.loadKind&&a.loadKind!=="scalar")throw new S("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");if(a.multi)throw new S("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.")}),n.forEach(function(a){if(!(a instanceof C))throw new S("Specified list of YAML types (or a single Type object) contains a non-Type object.")});var r=Object.create(dt.prototype);return r.implicit=(this.implicit||[]).concat(i),r.explicit=(this.explicit||[]).concat(n),r.compiledImplicit=mi(r,"implicit"),r.compiledExplicit=mi(r,"explicit"),r.compiledTypeMap=Kr(r.compiledImplicit,r.compiledExplicit),r};var Li=dt,_i=new C("tag:yaml.org,2002:str",{kind:"scalar",construct:function(e){return e!==null?e:""}}),Ri=new C("tag:yaml.org,2002:seq",{kind:"sequence",construct:function(e){return e!==null?e:[]}}),Oi=new C("tag:yaml.org,2002:map",{kind:"mapping",construct:function(e){return e!==null?e:{}}}),$i=new Li({explicit:[_i,Ri,Oi]});function Wr(e){if(e===null)return!0;var t=e.length;return t===1&&e==="~"||t===4&&(e==="null"||e==="Null"||e==="NULL")}function Gr(){return null}function qr(e){return e===null}var Ni=new C("tag:yaml.org,2002:null",{kind:"scalar",resolve:Wr,construct:Gr,predicate:qr,represent:{canonical:function(){return"~"},lowercase:function(){return"null"},uppercase:function(){return"NULL"},camelcase:function(){return"Null"},empty:function(){return""}},defaultStyle:"lowercase"});function Qr(e){if(e===null)return!1;var t=e.length;return t===4&&(e==="true"||e==="True"||e==="TRUE")||t===5&&(e==="false"||e==="False"||e==="FALSE")}function Jr(e){return e==="true"||e==="True"||e==="TRUE"}function Xr(e){return Object.prototype.toString.call(e)==="[object Boolean]"}var ji=new C("tag:yaml.org,2002:bool",{kind:"scalar",resolve:Qr,construct:Jr,predicate:Xr,represent:{lowercase:function(e){return e?"true":"false"},uppercase:function(e){return e?"TRUE":"FALSE"},camelcase:function(e){return e?"True":"False"}},defaultStyle:"lowercase"});function Zr(e){return 48<=e&&e<=57||65<=e&&e<=70||97<=e&&e<=102}function ea(e){return 48<=e&&e<=55}function ta(e){return 48<=e&&e<=57}function ia(e){if(e===null)return!1;var t=e.length,i=0,n=!1,r;if(!t)return!1;if(r=e[i],(r==="-"||r==="+")&&(r=e[++i]),r==="0"){if(i+1===t)return!0;if(r=e[++i],r==="b"){for(i++;i<t;i++)if(r=e[i],r!=="_"){if(r!=="0"&&r!=="1")return!1;n=!0}return n&&r!=="_"}if(r==="x"){for(i++;i<t;i++)if(r=e[i],r!=="_"){if(!Zr(e.charCodeAt(i)))return!1;n=!0}return n&&r!=="_"}if(r==="o"){for(i++;i<t;i++)if(r=e[i],r!=="_"){if(!ea(e.charCodeAt(i)))return!1;n=!0}return n&&r!=="_"}}if(r==="_")return!1;for(;i<t;i++)if(r=e[i],r!=="_"){if(!ta(e.charCodeAt(i)))return!1;n=!0}return!(!n||r==="_")}function na(e){var t=e,i=1,n;if(t.indexOf("_")!==-1&&(t=t.replace(/_/g,"")),n=t[0],(n==="-"||n==="+")&&(n==="-"&&(i=-1),t=t.slice(1),n=t[0]),t==="0")return 0;if(n==="0"){if(t[1]==="b")return i*parseInt(t.slice(2),2);if(t[1]==="x")return i*parseInt(t.slice(2),16);if(t[1]==="o")return i*parseInt(t.slice(2),8)}return i*parseInt(t,10)}function ra(e){return Object.prototype.toString.call(e)==="[object Number]"&&e%1===0&&!k.isNegativeZero(e)}var Vi=new C("tag:yaml.org,2002:int",{kind:"scalar",resolve:ia,construct:na,predicate:ra,represent:{binary:function(e){return e>=0?"0b"+e.toString(2):"-0b"+e.toString(2).slice(1)},octal:function(e){return e>=0?"0o"+e.toString(8):"-0o"+e.toString(8).slice(1)},decimal:function(e){return e.toString(10)},hexadecimal:function(e){return e>=0?"0x"+e.toString(16).toUpperCase():"-0x"+e.toString(16).toUpperCase().slice(1)}},defaultStyle:"decimal",styleAliases:{binary:[2,"bin"],octal:[8,"oct"],decimal:[10,"dec"],hexadecimal:[16,"hex"]}}),aa=new RegExp("^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$");function sa(e){return!(e===null||!aa.test(e)||e[e.length-1]==="_")}function oa(e){var t,i;return t=e.replace(/_/g,"").toLowerCase(),i=t[0]==="-"?-1:1,"+-".indexOf(t[0])>=0&&(t=t.slice(1)),t===".inf"?i===1?Number.POSITIVE_INFINITY:Number.NEGATIVE_INFINITY:t===".nan"?NaN:i*parseFloat(t,10)}var la=/^[-+]?[0-9]+e/;function ca(e,t){var i;if(isNaN(e))switch(t){case"lowercase":return".nan";case"uppercase":return".NAN";case"camelcase":return".NaN"}else if(Number.POSITIVE_INFINITY===e)switch(t){case"lowercase":return".inf";case"uppercase":return".INF";case"camelcase":return".Inf"}else if(Number.NEGATIVE_INFINITY===e)switch(t){case"lowercase":return"-.inf";case"uppercase":return"-.INF";case"camelcase":return"-.Inf"}else if(k.isNegativeZero(e))return"-0.0";return i=e.toString(10),la.test(i)?i.replace("e",".e"):i}function ua(e){return Object.prototype.toString.call(e)==="[object Number]"&&(e%1!==0||k.isNegativeZero(e))}var Hi=new C("tag:yaml.org,2002:float",{kind:"scalar",resolve:sa,construct:oa,predicate:ua,represent:ca,defaultStyle:"lowercase"}),Ui=$i.extend({implicit:[Ni,ji,Vi,Hi]}),zi=Ui,Yi=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"),Ki=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$");function da(e){return e===null?!1:Yi.exec(e)!==null||Ki.exec(e)!==null}function pa(e){var t,i,n,r,a,s,o,l=0,c=null,u,d,f;if(t=Yi.exec(e),t===null&&(t=Ki.exec(e)),t===null)throw new Error("Date resolve error");if(i=+t[1],n=+t[2]-1,r=+t[3],!t[4])return new Date(Date.UTC(i,n,r));if(a=+t[4],s=+t[5],o=+t[6],t[7]){for(l=t[7].slice(0,3);l.length<3;)l+="0";l=+l}return t[9]&&(u=+t[10],d=+(t[11]||0),c=(u*60+d)*6e4,t[9]==="-"&&(c=-c)),f=new Date(Date.UTC(i,n,r,a,s,o,l)),c&&f.setTime(f.getTime()-c),f}function fa(e){return e.toISOString()}var Wi=new C("tag:yaml.org,2002:timestamp",{kind:"scalar",resolve:da,construct:pa,instanceOf:Date,represent:fa});function ha(e){return e==="<<"||e===null}var Gi=new C("tag:yaml.org,2002:merge",{kind:"scalar",resolve:ha}),yt=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;function ga(e){if(e===null)return!1;var t,i,n=0,r=e.length,a=yt;for(i=0;i<r;i++)if(t=a.indexOf(e.charAt(i)),!(t>64)){if(t<0)return!1;n+=6}return n%8===0}function ya(e){var t,i,n=e.replace(/[\r\n=]/g,""),r=n.length,a=yt,s=0,o=[];for(t=0;t<r;t++)t%4===0&&t&&(o.push(s>>16&255),o.push(s>>8&255),o.push(s&255)),s=s<<6|a.indexOf(n.charAt(t));return i=r%4*6,i===0?(o.push(s>>16&255),o.push(s>>8&255),o.push(s&255)):i===18?(o.push(s>>10&255),o.push(s>>2&255)):i===12&&o.push(s>>4&255),new Uint8Array(o)}function ma(e){var t="",i=0,n,r,a=e.length,s=yt;for(n=0;n<a;n++)n%3===0&&n&&(t+=s[i>>18&63],t+=s[i>>12&63],t+=s[i>>6&63],t+=s[i&63]),i=(i<<8)+e[n];return r=a%3,r===0?(t+=s[i>>18&63],t+=s[i>>12&63],t+=s[i>>6&63],t+=s[i&63]):r===2?(t+=s[i>>10&63],t+=s[i>>4&63],t+=s[i<<2&63],t+=s[64]):r===1&&(t+=s[i>>2&63],t+=s[i<<4&63],t+=s[64],t+=s[64]),t}function ba(e){return Object.prototype.toString.call(e)==="[object Uint8Array]"}var qi=new C("tag:yaml.org,2002:binary",{kind:"scalar",resolve:ga,construct:ya,predicate:ba,represent:ma}),xa=Object.prototype.hasOwnProperty,va=Object.prototype.toString;function Ea(e){if(e===null)return!0;var t=[],i,n,r,a,s,o=e;for(i=0,n=o.length;i<n;i+=1){if(r=o[i],s=!1,va.call(r)!=="[object Object]")return!1;for(a in r)if(xa.call(r,a))if(!s)s=!0;else return!1;if(!s)return!1;if(t.indexOf(a)===-1)t.push(a);else return!1}return!0}function wa(e){return e!==null?e:[]}var Qi=new C("tag:yaml.org,2002:omap",{kind:"sequence",resolve:Ea,construct:wa}),ka=Object.prototype.toString;function Ca(e){if(e===null)return!0;var t,i,n,r,a,s=e;for(a=new Array(s.length),t=0,i=s.length;t<i;t+=1){if(n=s[t],ka.call(n)!=="[object Object]"||(r=Object.keys(n),r.length!==1))return!1;a[t]=[r[0],n[r[0]]]}return!0}function Aa(e){if(e===null)return[];var t,i,n,r,a,s=e;for(a=new Array(s.length),t=0,i=s.length;t<i;t+=1)n=s[t],r=Object.keys(n),a[t]=[r[0],n[r[0]]];return a}var Ji=new C("tag:yaml.org,2002:pairs",{kind:"sequence",resolve:Ca,construct:Aa}),Ta=Object.prototype.hasOwnProperty;function Sa(e){if(e===null)return!0;var t,i=e;for(t in i)if(Ta.call(i,t)&&i[t]!==null)return!1;return!0}function Ia(e){return e!==null?e:{}}var Xi=new C("tag:yaml.org,2002:set",{kind:"mapping",resolve:Sa,construct:Ia}),mt=zi.extend({implicit:[Wi,Gi],explicit:[qi,Qi,Ji,Xi]}),z=Object.prototype.hasOwnProperty,Oe=1,Zi=2,en=3,$e=4,ut=1,Ma=2,bi=3,Fa=/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,Ba=/[\x85\u2028\u2029]/,Pa=/[,\[\]\{\}]/,tn=/^(?:!|!!|![a-z\-]+!)$/i,nn=/^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;function xi(e){return Object.prototype.toString.call(e)}function _(e){return e===10||e===13}function q(e){return e===9||e===32}function I(e){return e===9||e===32||e===10||e===13}function re(e){return e===44||e===91||e===93||e===123||e===125}function Da(e){var t;return 48<=e&&e<=57?e-48:(t=e|32,97<=t&&t<=102?t-97+10:-1)}function La(e){return e===120?2:e===117?4:e===85?8:0}function _a(e){return 48<=e&&e<=57?e-48:-1}function vi(e){return e===48?"\0":e===97?"\x07":e===98?"\b":e===116||e===9?"	":e===110?`
`:e===118?"\v":e===102?"\f":e===114?"\r":e===101?"\x1B":e===32?" ":e===34?'"':e===47?"/":e===92?"\\":e===78?"\x85":e===95?"\xA0":e===76?"\u2028":e===80?"\u2029":""}function Ra(e){return e<=65535?String.fromCharCode(e):String.fromCharCode((e-65536>>10)+55296,(e-65536&1023)+56320)}function rn(e,t,i){t==="__proto__"?Object.defineProperty(e,t,{configurable:!0,enumerable:!0,writable:!0,value:i}):e[t]=i}var an=new Array(256),sn=new Array(256);for(G=0;G<256;G++)an[G]=vi(G)?1:0,sn[G]=vi(G);var G;function Oa(e,t){this.input=e,this.filename=t.filename||null,this.schema=t.schema||mt,this.onWarning=t.onWarning||null,this.legacy=t.legacy||!1,this.json=t.json||!1,this.listener=t.listener||null,this.implicitTypes=this.schema.compiledImplicit,this.typeMap=this.schema.compiledTypeMap,this.length=e.length,this.position=0,this.line=0,this.lineStart=0,this.lineIndent=0,this.firstTabInLine=-1,this.documents=[]}function on(e,t){var i={name:e.filename,buffer:e.input.slice(0,-1),position:e.position,line:e.line,column:e.position-e.lineStart};return i.snippet=Vr(i),new S(t,i)}function m(e,t){throw on(e,t)}function Ne(e,t){e.onWarning&&e.onWarning.call(null,on(e,t))}var Ei={YAML:function(t,i,n){var r,a,s;t.version!==null&&m(t,"duplication of %YAML directive"),n.length!==1&&m(t,"YAML directive accepts exactly one argument"),r=/^([0-9]+)\.([0-9]+)$/.exec(n[0]),r===null&&m(t,"ill-formed argument of the YAML directive"),a=parseInt(r[1],10),s=parseInt(r[2],10),a!==1&&m(t,"unacceptable YAML version of the document"),t.version=n[0],t.checkLineBreaks=s<2,s!==1&&s!==2&&Ne(t,"unsupported YAML version of the document")},TAG:function(t,i,n){var r,a;n.length!==2&&m(t,"TAG directive accepts exactly two arguments"),r=n[0],a=n[1],tn.test(r)||m(t,"ill-formed tag handle (first argument) of the TAG directive"),z.call(t.tagMap,r)&&m(t,'there is a previously declared suffix for "'+r+'" tag handle'),nn.test(a)||m(t,"ill-formed tag prefix (second argument) of the TAG directive");try{a=decodeURIComponent(a)}catch{m(t,"tag prefix is malformed: "+a)}t.tagMap[r]=a}};function U(e,t,i,n){var r,a,s,o;if(t<i){if(o=e.input.slice(t,i),n)for(r=0,a=o.length;r<a;r+=1)s=o.charCodeAt(r),s===9||32<=s&&s<=1114111||m(e,"expected valid JSON character");else Fa.test(o)&&m(e,"the stream contains non-printable characters");e.result+=o}}function wi(e,t,i,n){var r,a,s,o;for(k.isObject(i)||m(e,"cannot merge mappings; the provided source object is unacceptable"),r=Object.keys(i),s=0,o=r.length;s<o;s+=1)a=r[s],z.call(t,a)||(rn(t,a,i[a]),n[a]=!0)}function ae(e,t,i,n,r,a,s,o,l){var c,u;if(Array.isArray(r))for(r=Array.prototype.slice.call(r),c=0,u=r.length;c<u;c+=1)Array.isArray(r[c])&&m(e,"nested arrays are not supported inside keys"),typeof r=="object"&&xi(r[c])==="[object Object]"&&(r[c]="[object Object]");if(typeof r=="object"&&xi(r)==="[object Object]"&&(r="[object Object]"),r=String(r),t===null&&(t={}),n==="tag:yaml.org,2002:merge")if(Array.isArray(a))for(c=0,u=a.length;c<u;c+=1)wi(e,t,a[c],i);else wi(e,t,a,i);else!e.json&&!z.call(i,r)&&z.call(t,r)&&(e.line=s||e.line,e.lineStart=o||e.lineStart,e.position=l||e.position,m(e,"duplicated mapping key")),rn(t,r,a),delete i[r];return t}function bt(e){var t;t=e.input.charCodeAt(e.position),t===10?e.position++:t===13?(e.position++,e.input.charCodeAt(e.position)===10&&e.position++):m(e,"a line break is expected"),e.line+=1,e.lineStart=e.position,e.firstTabInLine=-1}function w(e,t,i){for(var n=0,r=e.input.charCodeAt(e.position);r!==0;){for(;q(r);)r===9&&e.firstTabInLine===-1&&(e.firstTabInLine=e.position),r=e.input.charCodeAt(++e.position);if(t&&r===35)do r=e.input.charCodeAt(++e.position);while(r!==10&&r!==13&&r!==0);if(_(r))for(bt(e),r=e.input.charCodeAt(e.position),n++,e.lineIndent=0;r===32;)e.lineIndent++,r=e.input.charCodeAt(++e.position);else break}return i!==-1&&n!==0&&e.lineIndent<i&&Ne(e,"deficient indentation"),n}function He(e){var t=e.position,i;return i=e.input.charCodeAt(t),!!((i===45||i===46)&&i===e.input.charCodeAt(t+1)&&i===e.input.charCodeAt(t+2)&&(t+=3,i=e.input.charCodeAt(t),i===0||I(i)))}function xt(e,t){t===1?e.result+=" ":t>1&&(e.result+=k.repeat(`
`,t-1))}function $a(e,t,i){var n,r,a,s,o,l,c,u,d=e.kind,f=e.result,p;if(p=e.input.charCodeAt(e.position),I(p)||re(p)||p===35||p===38||p===42||p===33||p===124||p===62||p===39||p===34||p===37||p===64||p===96||(p===63||p===45)&&(r=e.input.charCodeAt(e.position+1),I(r)||i&&re(r)))return!1;for(e.kind="scalar",e.result="",a=s=e.position,o=!1;p!==0;){if(p===58){if(r=e.input.charCodeAt(e.position+1),I(r)||i&&re(r))break}else if(p===35){if(n=e.input.charCodeAt(e.position-1),I(n))break}else{if(e.position===e.lineStart&&He(e)||i&&re(p))break;if(_(p))if(l=e.line,c=e.lineStart,u=e.lineIndent,w(e,!1,-1),e.lineIndent>=t){o=!0,p=e.input.charCodeAt(e.position);continue}else{e.position=s,e.line=l,e.lineStart=c,e.lineIndent=u;break}}o&&(U(e,a,s,!1),xt(e,e.line-l),a=s=e.position,o=!1),q(p)||(s=e.position+1),p=e.input.charCodeAt(++e.position)}return U(e,a,s,!1),e.result?!0:(e.kind=d,e.result=f,!1)}function Na(e,t){var i,n,r;if(i=e.input.charCodeAt(e.position),i!==39)return!1;for(e.kind="scalar",e.result="",e.position++,n=r=e.position;(i=e.input.charCodeAt(e.position))!==0;)if(i===39)if(U(e,n,e.position,!0),i=e.input.charCodeAt(++e.position),i===39)n=e.position,e.position++,r=e.position;else return!0;else _(i)?(U(e,n,r,!0),xt(e,w(e,!1,t)),n=r=e.position):e.position===e.lineStart&&He(e)?m(e,"unexpected end of the document within a single quoted scalar"):(e.position++,r=e.position);m(e,"unexpected end of the stream within a single quoted scalar")}function ja(e,t){var i,n,r,a,s,o;if(o=e.input.charCodeAt(e.position),o!==34)return!1;for(e.kind="scalar",e.result="",e.position++,i=n=e.position;(o=e.input.charCodeAt(e.position))!==0;){if(o===34)return U(e,i,e.position,!0),e.position++,!0;if(o===92){if(U(e,i,e.position,!0),o=e.input.charCodeAt(++e.position),_(o))w(e,!1,t);else if(o<256&&an[o])e.result+=sn[o],e.position++;else if((s=La(o))>0){for(r=s,a=0;r>0;r--)o=e.input.charCodeAt(++e.position),(s=Da(o))>=0?a=(a<<4)+s:m(e,"expected hexadecimal character");e.result+=Ra(a),e.position++}else m(e,"unknown escape sequence");i=n=e.position}else _(o)?(U(e,i,n,!0),xt(e,w(e,!1,t)),i=n=e.position):e.position===e.lineStart&&He(e)?m(e,"unexpected end of the document within a double quoted scalar"):(e.position++,n=e.position)}m(e,"unexpected end of the stream within a double quoted scalar")}function Va(e,t){var i=!0,n,r,a,s=e.tag,o,l=e.anchor,c,u,d,f,p,h=Object.create(null),g,y,x,b;if(b=e.input.charCodeAt(e.position),b===91)u=93,p=!1,o=[];else if(b===123)u=125,p=!0,o={};else return!1;for(e.anchor!==null&&(e.anchorMap[e.anchor]=o),b=e.input.charCodeAt(++e.position);b!==0;){if(w(e,!0,t),b=e.input.charCodeAt(e.position),b===u)return e.position++,e.tag=s,e.anchor=l,e.kind=p?"mapping":"sequence",e.result=o,!0;i?b===44&&m(e,"expected the node content, but found ','"):m(e,"missed comma between flow collection entries"),y=g=x=null,d=f=!1,b===63&&(c=e.input.charCodeAt(e.position+1),I(c)&&(d=f=!0,e.position++,w(e,!0,t))),n=e.line,r=e.lineStart,a=e.position,se(e,t,Oe,!1,!0),y=e.tag,g=e.result,w(e,!0,t),b=e.input.charCodeAt(e.position),(f||e.line===n)&&b===58&&(d=!0,b=e.input.charCodeAt(++e.position),w(e,!0,t),se(e,t,Oe,!1,!0),x=e.result),p?ae(e,o,h,y,g,x,n,r,a):d?o.push(ae(e,null,h,y,g,x,n,r,a)):o.push(g),w(e,!0,t),b=e.input.charCodeAt(e.position),b===44?(i=!0,b=e.input.charCodeAt(++e.position)):i=!1}m(e,"unexpected end of the stream within a flow collection")}function Ha(e,t){var i,n,r=ut,a=!1,s=!1,o=t,l=0,c=!1,u,d;if(d=e.input.charCodeAt(e.position),d===124)n=!1;else if(d===62)n=!0;else return!1;for(e.kind="scalar",e.result="";d!==0;)if(d=e.input.charCodeAt(++e.position),d===43||d===45)ut===r?r=d===43?bi:Ma:m(e,"repeat of a chomping mode identifier");else if((u=_a(d))>=0)u===0?m(e,"bad explicit indentation width of a block scalar; it cannot be less than one"):s?m(e,"repeat of an indentation width identifier"):(o=t+u-1,s=!0);else break;if(q(d)){do d=e.input.charCodeAt(++e.position);while(q(d));if(d===35)do d=e.input.charCodeAt(++e.position);while(!_(d)&&d!==0)}for(;d!==0;){for(bt(e),e.lineIndent=0,d=e.input.charCodeAt(e.position);(!s||e.lineIndent<o)&&d===32;)e.lineIndent++,d=e.input.charCodeAt(++e.position);if(!s&&e.lineIndent>o&&(o=e.lineIndent),_(d)){l++;continue}if(e.lineIndent<o){r===bi?e.result+=k.repeat(`
`,a?1+l:l):r===ut&&a&&(e.result+=`
`);break}for(n?q(d)?(c=!0,e.result+=k.repeat(`
`,a?1+l:l)):c?(c=!1,e.result+=k.repeat(`
`,l+1)):l===0?a&&(e.result+=" "):e.result+=k.repeat(`
`,l):e.result+=k.repeat(`
`,a?1+l:l),a=!0,s=!0,l=0,i=e.position;!_(d)&&d!==0;)d=e.input.charCodeAt(++e.position);U(e,i,e.position,!1)}return!0}function ki(e,t){var i,n=e.tag,r=e.anchor,a=[],s,o=!1,l;if(e.firstTabInLine!==-1)return!1;for(e.anchor!==null&&(e.anchorMap[e.anchor]=a),l=e.input.charCodeAt(e.position);l!==0&&(e.firstTabInLine!==-1&&(e.position=e.firstTabInLine,m(e,"tab characters must not be used in indentation")),!(l!==45||(s=e.input.charCodeAt(e.position+1),!I(s))));){if(o=!0,e.position++,w(e,!0,-1)&&e.lineIndent<=t){a.push(null),l=e.input.charCodeAt(e.position);continue}if(i=e.line,se(e,t,en,!1,!0),a.push(e.result),w(e,!0,-1),l=e.input.charCodeAt(e.position),(e.line===i||e.lineIndent>t)&&l!==0)m(e,"bad indentation of a sequence entry");else if(e.lineIndent<t)break}return o?(e.tag=n,e.anchor=r,e.kind="sequence",e.result=a,!0):!1}function Ua(e,t,i){var n,r,a,s,o,l,c=e.tag,u=e.anchor,d={},f=Object.create(null),p=null,h=null,g=null,y=!1,x=!1,b;if(e.firstTabInLine!==-1)return!1;for(e.anchor!==null&&(e.anchorMap[e.anchor]=d),b=e.input.charCodeAt(e.position);b!==0;){if(!y&&e.firstTabInLine!==-1&&(e.position=e.firstTabInLine,m(e,"tab characters must not be used in indentation")),n=e.input.charCodeAt(e.position+1),a=e.line,(b===63||b===58)&&I(n))b===63?(y&&(ae(e,d,f,p,h,null,s,o,l),p=h=g=null),x=!0,y=!0,r=!0):y?(y=!1,r=!0):m(e,"incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"),e.position+=1,b=n;else{if(s=e.line,o=e.lineStart,l=e.position,!se(e,i,Zi,!1,!0))break;if(e.line===a){for(b=e.input.charCodeAt(e.position);q(b);)b=e.input.charCodeAt(++e.position);if(b===58)b=e.input.charCodeAt(++e.position),I(b)||m(e,"a whitespace character is expected after the key-value separator within a block mapping"),y&&(ae(e,d,f,p,h,null,s,o,l),p=h=g=null),x=!0,y=!1,r=!1,p=e.tag,h=e.result;else if(x)m(e,"can not read an implicit mapping pair; a colon is missed");else return e.tag=c,e.anchor=u,!0}else if(x)m(e,"can not read a block mapping entry; a multiline key may not be an implicit key");else return e.tag=c,e.anchor=u,!0}if((e.line===a||e.lineIndent>t)&&(y&&(s=e.line,o=e.lineStart,l=e.position),se(e,t,$e,!0,r)&&(y?h=e.result:g=e.result),y||(ae(e,d,f,p,h,g,s,o,l),p=h=g=null),w(e,!0,-1),b=e.input.charCodeAt(e.position)),(e.line===a||e.lineIndent>t)&&b!==0)m(e,"bad indentation of a mapping entry");else if(e.lineIndent<t)break}return y&&ae(e,d,f,p,h,null,s,o,l),x&&(e.tag=c,e.anchor=u,e.kind="mapping",e.result=d),x}function za(e){var t,i=!1,n=!1,r,a,s;if(s=e.input.charCodeAt(e.position),s!==33)return!1;if(e.tag!==null&&m(e,"duplication of a tag property"),s=e.input.charCodeAt(++e.position),s===60?(i=!0,s=e.input.charCodeAt(++e.position)):s===33?(n=!0,r="!!",s=e.input.charCodeAt(++e.position)):r="!",t=e.position,i){do s=e.input.charCodeAt(++e.position);while(s!==0&&s!==62);e.position<e.length?(a=e.input.slice(t,e.position),s=e.input.charCodeAt(++e.position)):m(e,"unexpected end of the stream within a verbatim tag")}else{for(;s!==0&&!I(s);)s===33&&(n?m(e,"tag suffix cannot contain exclamation marks"):(r=e.input.slice(t-1,e.position+1),tn.test(r)||m(e,"named tag handle cannot contain such characters"),n=!0,t=e.position+1)),s=e.input.charCodeAt(++e.position);a=e.input.slice(t,e.position),Pa.test(a)&&m(e,"tag suffix cannot contain flow indicator characters")}a&&!nn.test(a)&&m(e,"tag name cannot contain such characters: "+a);try{a=decodeURIComponent(a)}catch{m(e,"tag name is malformed: "+a)}return i?e.tag=a:z.call(e.tagMap,r)?e.tag=e.tagMap[r]+a:r==="!"?e.tag="!"+a:r==="!!"?e.tag="tag:yaml.org,2002:"+a:m(e,'undeclared tag handle "'+r+'"'),!0}function Ya(e){var t,i;if(i=e.input.charCodeAt(e.position),i!==38)return!1;for(e.anchor!==null&&m(e,"duplication of an anchor property"),i=e.input.charCodeAt(++e.position),t=e.position;i!==0&&!I(i)&&!re(i);)i=e.input.charCodeAt(++e.position);return e.position===t&&m(e,"name of an anchor node must contain at least one character"),e.anchor=e.input.slice(t,e.position),!0}function Ka(e){var t,i,n;if(n=e.input.charCodeAt(e.position),n!==42)return!1;for(n=e.input.charCodeAt(++e.position),t=e.position;n!==0&&!I(n)&&!re(n);)n=e.input.charCodeAt(++e.position);return e.position===t&&m(e,"name of an alias node must contain at least one character"),i=e.input.slice(t,e.position),z.call(e.anchorMap,i)||m(e,'unidentified alias "'+i+'"'),e.result=e.anchorMap[i],w(e,!0,-1),!0}function se(e,t,i,n,r){var a,s,o,l=1,c=!1,u=!1,d,f,p,h,g,y;if(e.listener!==null&&e.listener("open",e),e.tag=null,e.anchor=null,e.kind=null,e.result=null,a=s=o=$e===i||en===i,n&&w(e,!0,-1)&&(c=!0,e.lineIndent>t?l=1:e.lineIndent===t?l=0:e.lineIndent<t&&(l=-1)),l===1)for(;za(e)||Ya(e);)w(e,!0,-1)?(c=!0,o=a,e.lineIndent>t?l=1:e.lineIndent===t?l=0:e.lineIndent<t&&(l=-1)):o=!1;if(o&&(o=c||r),(l===1||$e===i)&&(Oe===i||Zi===i?g=t:g=t+1,y=e.position-e.lineStart,l===1?o&&(ki(e,y)||Ua(e,y,g))||Va(e,g)?u=!0:(s&&Ha(e,g)||Na(e,g)||ja(e,g)?u=!0:Ka(e)?(u=!0,(e.tag!==null||e.anchor!==null)&&m(e,"alias node should not have any properties")):$a(e,g,Oe===i)&&(u=!0,e.tag===null&&(e.tag="?")),e.anchor!==null&&(e.anchorMap[e.anchor]=e.result)):l===0&&(u=o&&ki(e,y))),e.tag===null)e.anchor!==null&&(e.anchorMap[e.anchor]=e.result);else if(e.tag==="?"){for(e.result!==null&&e.kind!=="scalar"&&m(e,'unacceptable node kind for !<?> tag; it should be "scalar", not "'+e.kind+'"'),d=0,f=e.implicitTypes.length;d<f;d+=1)if(h=e.implicitTypes[d],h.resolve(e.result)){e.result=h.construct(e.result),e.tag=h.tag,e.anchor!==null&&(e.anchorMap[e.anchor]=e.result);break}}else if(e.tag!=="!"){if(z.call(e.typeMap[e.kind||"fallback"],e.tag))h=e.typeMap[e.kind||"fallback"][e.tag];else for(h=null,p=e.typeMap.multi[e.kind||"fallback"],d=0,f=p.length;d<f;d+=1)if(e.tag.slice(0,p[d].tag.length)===p[d].tag){h=p[d];break}h||m(e,"unknown tag !<"+e.tag+">"),e.result!==null&&h.kind!==e.kind&&m(e,"unacceptable node kind for !<"+e.tag+'> tag; it should be "'+h.kind+'", not "'+e.kind+'"'),h.resolve(e.result,e.tag)?(e.result=h.construct(e.result,e.tag),e.anchor!==null&&(e.anchorMap[e.anchor]=e.result)):m(e,"cannot resolve a node with !<"+e.tag+"> explicit tag")}return e.listener!==null&&e.listener("close",e),e.tag!==null||e.anchor!==null||u}function Wa(e){var t=e.position,i,n,r,a=!1,s;for(e.version=null,e.checkLineBreaks=e.legacy,e.tagMap=Object.create(null),e.anchorMap=Object.create(null);(s=e.input.charCodeAt(e.position))!==0&&(w(e,!0,-1),s=e.input.charCodeAt(e.position),!(e.lineIndent>0||s!==37));){for(a=!0,s=e.input.charCodeAt(++e.position),i=e.position;s!==0&&!I(s);)s=e.input.charCodeAt(++e.position);for(n=e.input.slice(i,e.position),r=[],n.length<1&&m(e,"directive name must not be less than one character in length");s!==0;){for(;q(s);)s=e.input.charCodeAt(++e.position);if(s===35){do s=e.input.charCodeAt(++e.position);while(s!==0&&!_(s));break}if(_(s))break;for(i=e.position;s!==0&&!I(s);)s=e.input.charCodeAt(++e.position);r.push(e.input.slice(i,e.position))}s!==0&&bt(e),z.call(Ei,n)?Ei[n](e,n,r):Ne(e,'unknown document directive "'+n+'"')}if(w(e,!0,-1),e.lineIndent===0&&e.input.charCodeAt(e.position)===45&&e.input.charCodeAt(e.position+1)===45&&e.input.charCodeAt(e.position+2)===45?(e.position+=3,w(e,!0,-1)):a&&m(e,"directives end mark is expected"),se(e,e.lineIndent-1,$e,!1,!0),w(e,!0,-1),e.checkLineBreaks&&Ba.test(e.input.slice(t,e.position))&&Ne(e,"non-ASCII line breaks are interpreted as content"),e.documents.push(e.result),e.position===e.lineStart&&He(e)){e.input.charCodeAt(e.position)===46&&(e.position+=3,w(e,!0,-1));return}if(e.position<e.length-1)m(e,"end of the stream or a document separator is expected");else return}function ln(e,t){e=String(e),t=t||{},e.length!==0&&(e.charCodeAt(e.length-1)!==10&&e.charCodeAt(e.length-1)!==13&&(e+=`
`),e.charCodeAt(0)===65279&&(e=e.slice(1)));var i=new Oa(e,t),n=e.indexOf("\0");for(n!==-1&&(i.position=n,m(i,"null byte is not allowed in input")),i.input+="\0";i.input.charCodeAt(i.position)===32;)i.lineIndent+=1,i.position+=1;for(;i.position<i.length-1;)Wa(i);return i.documents}function Ga(e,t,i){t!==null&&typeof t=="object"&&typeof i>"u"&&(i=t,t=null);var n=ln(e,i);if(typeof t!="function")return n;for(var r=0,a=n.length;r<a;r+=1)t(n[r])}function qa(e,t){var i=ln(e,t);if(i.length!==0){if(i.length===1)return i[0];throw new S("expected a single document in the stream, but found more")}}var Qa=Ga,Ja=qa,cn={loadAll:Qa,load:Ja},un=Object.prototype.toString,dn=Object.prototype.hasOwnProperty,vt=65279,Xa=9,xe=10,Za=13,es=32,ts=33,is=34,pt=35,ns=37,rs=38,as=39,ss=42,pn=44,os=45,je=58,ls=61,cs=62,us=63,ds=64,fn=91,hn=93,ps=96,gn=123,fs=124,yn=125,A={};A[0]="\\0";A[7]="\\a";A[8]="\\b";A[9]="\\t";A[10]="\\n";A[11]="\\v";A[12]="\\f";A[13]="\\r";A[27]="\\e";A[34]='\\"';A[92]="\\\\";A[133]="\\N";A[160]="\\_";A[8232]="\\L";A[8233]="\\P";var hs=["y","Y","yes","Yes","YES","on","On","ON","n","N","no","No","NO","off","Off","OFF"],gs=/^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;function ys(e,t){var i,n,r,a,s,o,l;if(t===null)return{};for(i={},n=Object.keys(t),r=0,a=n.length;r<a;r+=1)s=n[r],o=String(t[s]),s.slice(0,2)==="!!"&&(s="tag:yaml.org,2002:"+s.slice(2)),l=e.compiledTypeMap.fallback[s],l&&dn.call(l.styleAliases,o)&&(o=l.styleAliases[o]),i[s]=o;return i}function ms(e){var t,i,n;if(t=e.toString(16).toUpperCase(),e<=255)i="x",n=2;else if(e<=65535)i="u",n=4;else if(e<=4294967295)i="U",n=8;else throw new S("code point within a string may not be greater than 0xFFFFFFFF");return"\\"+i+k.repeat("0",n-t.length)+t}var bs=1,ve=2;function xs(e){this.schema=e.schema||mt,this.indent=Math.max(1,e.indent||2),this.noArrayIndent=e.noArrayIndent||!1,this.skipInvalid=e.skipInvalid||!1,this.flowLevel=k.isNothing(e.flowLevel)?-1:e.flowLevel,this.styleMap=ys(this.schema,e.styles||null),this.sortKeys=e.sortKeys||!1,this.lineWidth=e.lineWidth||80,this.noRefs=e.noRefs||!1,this.noCompatMode=e.noCompatMode||!1,this.condenseFlow=e.condenseFlow||!1,this.quotingType=e.quotingType==='"'?ve:bs,this.forceQuotes=e.forceQuotes||!1,this.replacer=typeof e.replacer=="function"?e.replacer:null,this.implicitTypes=this.schema.compiledImplicit,this.explicitTypes=this.schema.compiledExplicit,this.tag=null,this.result="",this.duplicates=[],this.usedDuplicates=null}function Ci(e,t){for(var i=k.repeat(" ",t),n=0,r=-1,a="",s,o=e.length;n<o;)r=e.indexOf(`
`,n),r===-1?(s=e.slice(n),n=o):(s=e.slice(n,r+1),n=r+1),s.length&&s!==`
`&&(a+=i),a+=s;return a}function ft(e,t){return`
`+k.repeat(" ",e.indent*t)}function vs(e,t){var i,n,r;for(i=0,n=e.implicitTypes.length;i<n;i+=1)if(r=e.implicitTypes[i],r.resolve(t))return!0;return!1}function Ve(e){return e===es||e===Xa}function Ee(e){return 32<=e&&e<=126||161<=e&&e<=55295&&e!==8232&&e!==8233||57344<=e&&e<=65533&&e!==vt||65536<=e&&e<=1114111}function Ai(e){return Ee(e)&&e!==vt&&e!==Za&&e!==xe}function Ti(e,t,i){var n=Ai(e),r=n&&!Ve(e);return(i?n:n&&e!==pn&&e!==fn&&e!==hn&&e!==gn&&e!==yn)&&e!==pt&&!(t===je&&!r)||Ai(t)&&!Ve(t)&&e===pt||t===je&&r}function Es(e){return Ee(e)&&e!==vt&&!Ve(e)&&e!==os&&e!==us&&e!==je&&e!==pn&&e!==fn&&e!==hn&&e!==gn&&e!==yn&&e!==pt&&e!==rs&&e!==ss&&e!==ts&&e!==fs&&e!==ls&&e!==cs&&e!==as&&e!==is&&e!==ns&&e!==ds&&e!==ps}function ws(e){return!Ve(e)&&e!==je}function me(e,t){var i=e.charCodeAt(t),n;return i>=55296&&i<=56319&&t+1<e.length&&(n=e.charCodeAt(t+1),n>=56320&&n<=57343)?(i-55296)*1024+n-56320+65536:i}function mn(e){var t=/^\n* /;return t.test(e)}var bn=1,ht=2,xn=3,vn=4,ne=5;function ks(e,t,i,n,r,a,s,o){var l,c=0,u=null,d=!1,f=!1,p=n!==-1,h=-1,g=Es(me(e,0))&&ws(me(e,e.length-1));if(t||s)for(l=0;l<e.length;c>=65536?l+=2:l++){if(c=me(e,l),!Ee(c))return ne;g=g&&Ti(c,u,o),u=c}else{for(l=0;l<e.length;c>=65536?l+=2:l++){if(c=me(e,l),c===xe)d=!0,p&&(f=f||l-h-1>n&&e[h+1]!==" ",h=l);else if(!Ee(c))return ne;g=g&&Ti(c,u,o),u=c}f=f||p&&l-h-1>n&&e[h+1]!==" "}return!d&&!f?g&&!s&&!r(e)?bn:a===ve?ne:ht:i>9&&mn(e)?ne:s?a===ve?ne:ht:f?vn:xn}function Cs(e,t,i,n,r){e.dump=(function(){if(t.length===0)return e.quotingType===ve?'""':"''";if(!e.noCompatMode&&(hs.indexOf(t)!==-1||gs.test(t)))return e.quotingType===ve?'"'+t+'"':"'"+t+"'";var a=e.indent*Math.max(1,i),s=e.lineWidth===-1?-1:Math.max(Math.min(e.lineWidth,40),e.lineWidth-a),o=n||e.flowLevel>-1&&i>=e.flowLevel;function l(c){return vs(e,c)}switch(ks(t,o,e.indent,s,l,e.quotingType,e.forceQuotes&&!n,r)){case bn:return t;case ht:return"'"+t.replace(/'/g,"''")+"'";case xn:return"|"+Si(t,e.indent)+Ii(Ci(t,a));case vn:return">"+Si(t,e.indent)+Ii(Ci(As(t,s),a));case ne:return'"'+Ts(t)+'"';default:throw new S("impossible error: invalid scalar style")}})()}function Si(e,t){var i=mn(e)?String(t):"",n=e[e.length-1]===`
`,r=n&&(e[e.length-2]===`
`||e===`
`),a=r?"+":n?"":"-";return i+a+`
`}function Ii(e){return e[e.length-1]===`
`?e.slice(0,-1):e}function As(e,t){for(var i=/(\n+)([^\n]*)/g,n=(function(){var c=e.indexOf(`
`);return c=c!==-1?c:e.length,i.lastIndex=c,Mi(e.slice(0,c),t)})(),r=e[0]===`
`||e[0]===" ",a,s;s=i.exec(e);){var o=s[1],l=s[2];a=l[0]===" ",n+=o+(!r&&!a&&l!==""?`
`:"")+Mi(l,t),r=a}return n}function Mi(e,t){if(e===""||e[0]===" ")return e;for(var i=/ [^ ]/g,n,r=0,a,s=0,o=0,l="";n=i.exec(e);)o=n.index,o-r>t&&(a=s>r?s:o,l+=`
`+e.slice(r,a),r=a+1),s=o;return l+=`
`,e.length-r>t&&s>r?l+=e.slice(r,s)+`
`+e.slice(s+1):l+=e.slice(r),l.slice(1)}function Ts(e){for(var t="",i=0,n,r=0;r<e.length;i>=65536?r+=2:r++)i=me(e,r),n=A[i],!n&&Ee(i)?(t+=e[r],i>=65536&&(t+=e[r+1])):t+=n||ms(i);return t}function Ss(e,t,i){var n="",r=e.tag,a,s,o;for(a=0,s=i.length;a<s;a+=1)o=i[a],e.replacer&&(o=e.replacer.call(i,String(a),o)),(V(e,t,o,!1,!1)||typeof o>"u"&&V(e,t,null,!1,!1))&&(n!==""&&(n+=","+(e.condenseFlow?"":" ")),n+=e.dump);e.tag=r,e.dump="["+n+"]"}function Fi(e,t,i,n){var r="",a=e.tag,s,o,l;for(s=0,o=i.length;s<o;s+=1)l=i[s],e.replacer&&(l=e.replacer.call(i,String(s),l)),(V(e,t+1,l,!0,!0,!1,!0)||typeof l>"u"&&V(e,t+1,null,!0,!0,!1,!0))&&((!n||r!=="")&&(r+=ft(e,t)),e.dump&&xe===e.dump.charCodeAt(0)?r+="-":r+="- ",r+=e.dump);e.tag=a,e.dump=r||"[]"}function Is(e,t,i){var n="",r=e.tag,a=Object.keys(i),s,o,l,c,u;for(s=0,o=a.length;s<o;s+=1)u="",n!==""&&(u+=", "),e.condenseFlow&&(u+='"'),l=a[s],c=i[l],e.replacer&&(c=e.replacer.call(i,l,c)),V(e,t,l,!1,!1)&&(e.dump.length>1024&&(u+="? "),u+=e.dump+(e.condenseFlow?'"':"")+":"+(e.condenseFlow?"":" "),V(e,t,c,!1,!1)&&(u+=e.dump,n+=u));e.tag=r,e.dump="{"+n+"}"}function Ms(e,t,i,n){var r="",a=e.tag,s=Object.keys(i),o,l,c,u,d,f;if(e.sortKeys===!0)s.sort();else if(typeof e.sortKeys=="function")s.sort(e.sortKeys);else if(e.sortKeys)throw new S("sortKeys must be a boolean or a function");for(o=0,l=s.length;o<l;o+=1)f="",(!n||r!=="")&&(f+=ft(e,t)),c=s[o],u=i[c],e.replacer&&(u=e.replacer.call(i,c,u)),V(e,t+1,c,!0,!0,!0)&&(d=e.tag!==null&&e.tag!=="?"||e.dump&&e.dump.length>1024,d&&(e.dump&&xe===e.dump.charCodeAt(0)?f+="?":f+="? "),f+=e.dump,d&&(f+=ft(e,t)),V(e,t+1,u,!0,d)&&(e.dump&&xe===e.dump.charCodeAt(0)?f+=":":f+=": ",f+=e.dump,r+=f));e.tag=a,e.dump=r||"{}"}function Bi(e,t,i){var n,r,a,s,o,l;for(r=i?e.explicitTypes:e.implicitTypes,a=0,s=r.length;a<s;a+=1)if(o=r[a],(o.instanceOf||o.predicate)&&(!o.instanceOf||typeof t=="object"&&t instanceof o.instanceOf)&&(!o.predicate||o.predicate(t))){if(i?o.multi&&o.representName?e.tag=o.representName(t):e.tag=o.tag:e.tag="?",o.represent){if(l=e.styleMap[o.tag]||o.defaultStyle,un.call(o.represent)==="[object Function]")n=o.represent(t,l);else if(dn.call(o.represent,l))n=o.represent[l](t,l);else throw new S("!<"+o.tag+'> tag resolver accepts not "'+l+'" style');e.dump=n}return!0}return!1}function V(e,t,i,n,r,a,s){e.tag=null,e.dump=i,Bi(e,i,!1)||Bi(e,i,!0);var o=un.call(e.dump),l=n,c;n&&(n=e.flowLevel<0||e.flowLevel>t);var u=o==="[object Object]"||o==="[object Array]",d,f;if(u&&(d=e.duplicates.indexOf(i),f=d!==-1),(e.tag!==null&&e.tag!=="?"||f||e.indent!==2&&t>0)&&(r=!1),f&&e.usedDuplicates[d])e.dump="*ref_"+d;else{if(u&&f&&!e.usedDuplicates[d]&&(e.usedDuplicates[d]=!0),o==="[object Object]")n&&Object.keys(e.dump).length!==0?(Ms(e,t,e.dump,r),f&&(e.dump="&ref_"+d+e.dump)):(Is(e,t,e.dump),f&&(e.dump="&ref_"+d+" "+e.dump));else if(o==="[object Array]")n&&e.dump.length!==0?(e.noArrayIndent&&!s&&t>0?Fi(e,t-1,e.dump,r):Fi(e,t,e.dump,r),f&&(e.dump="&ref_"+d+e.dump)):(Ss(e,t,e.dump),f&&(e.dump="&ref_"+d+" "+e.dump));else if(o==="[object String]")e.tag!=="?"&&Cs(e,e.dump,t,a,l);else{if(o==="[object Undefined]")return!1;if(e.skipInvalid)return!1;throw new S("unacceptable kind of an object to dump "+o)}e.tag!==null&&e.tag!=="?"&&(c=encodeURI(e.tag[0]==="!"?e.tag.slice(1):e.tag).replace(/!/g,"%21"),e.tag[0]==="!"?c="!"+c:c.slice(0,18)==="tag:yaml.org,2002:"?c="!!"+c.slice(18):c="!<"+c+">",e.dump=c+" "+e.dump)}return!0}function Fs(e,t){var i=[],n=[],r,a;for(gt(e,i,n),r=0,a=n.length;r<a;r+=1)t.duplicates.push(i[n[r]]);t.usedDuplicates=new Array(a)}function gt(e,t,i){var n,r,a;if(e!==null&&typeof e=="object")if(r=t.indexOf(e),r!==-1)i.indexOf(r)===-1&&i.push(r);else if(t.push(e),Array.isArray(e))for(r=0,a=e.length;r<a;r+=1)gt(e[r],t,i);else for(n=Object.keys(e),r=0,a=n.length;r<a;r+=1)gt(e[n[r]],t,i)}function Bs(e,t){t=t||{};var i=new xs(t);i.noRefs||Fs(e,i);var n=e;return i.replacer&&(n=i.replacer.call({"":n},"",n)),V(i,0,n,!0,!0)?i.dump+`
`:""}var Ps=Bs,Ds={dump:Ps};function Et(e,t){return function(){throw new Error("Function yaml."+e+" is removed in js-yaml 4. Use yaml."+t+" instead, which is now safe by default.")}}var Ls=C,_s=Li,Rs=$i,Os=Ui,$s=zi,Ns=mt,js=cn.load,Vs=cn.loadAll,Hs=Ds.dump,Us=S,zs={binary:qi,float:Hi,map:Oi,null:Ni,pairs:Ji,set:Xi,timestamp:Wi,bool:ji,int:Vi,merge:Gi,omap:Qi,seq:Ri,str:_i},Ys=Et("safeLoad","load"),Ks=Et("safeLoadAll","loadAll"),Ws=Et("safeDump","dump"),Q={Type:Ls,Schema:_s,FAILSAFE_SCHEMA:Rs,JSON_SCHEMA:Os,CORE_SCHEMA:$s,DEFAULT_SCHEMA:Ns,load:js,loadAll:Vs,dump:Hs,YAMLException:Us,types:zs,safeLoad:Ys,safeLoadAll:Ks,safeDump:Ws};function we(e){let t=0;for(let i=0;i<e.length;i++){let n=e.charCodeAt(i);t=(t<<5)-t+n,t=t&t}return Math.abs(t).toString(16).padStart(8,"0").slice(0,8)}var wt={P0:1.5,P1:1,P2:.5};function kt(e,t){let i=typeof t.subtype=="string"?t.subtype:void 0,n=j(e,i,t),r=N(e,i),a=r.p0.length===0||r.p0.every(l=>M(n,l)),s=r.p1.some(l=>M(n,l)),o=r.p2.some(l=>M(n,l));return a&&s&&o?"L3":a&&s?"L2":a?"L1":"L0"}function En(e,t,i,n=1){let r=typeof t.subtype=="string"?t.subtype:void 0,a=j(e,r,t),s=N(e,r);if(![...s.p0,...s.p1,...s.p2].some(c=>M(a,c)))return 0;let l=0;if(s.p0.length>0){let c=s.p0.filter(u=>M(a,u)).length;l+=c/s.p0.length*wt.P0}if(s.p1.length>0){let c=s.p1.filter(u=>M(a,u)).length;l+=c/s.p1.length*wt.P1}if(s.p2.length>0){let c=s.p2.filter(u=>M(a,u)).length;l+=c/s.p2.length*wt.P2}return l*n*(1+Math.log1p(i))}var Ct={create(e){let t=new Date().toISOString();return{id:we(e.name),userId:e.userId||"",cardType:e.cardType,name:e.name,aliases:e.aliases||[],attributes:e.attributes||{},relatedPeople:[],relatedObjects:[],relatedThemes:[],evidenceEntryIds:[],confidence:.5,maturity:kt(e.cardType,e.attributes||{}),status:"needs_confirmation",lifecycle:"candidate",importance:0,createdAt:t,lastUpdated:t}}};var Gs=Q.dump,qs=Q.load,Ue="---";function J(e){let t={id:e.id,name:e.name,type:e.cardType,maturity:e.maturity,confidence:e.confidence,status:e.status,aliases:e.aliases,createdAt:e.createdAt,lastUpdated:e.lastUpdated};for(let[s,o]of Object.entries(e.attributes))o!=null&&(t[s]=o);let i=[`# ${e.name}`,""],n=eo(e);n.length>0&&(i.push("## \u57FA\u672C\u4FE1\u606F"),i.push(...n),i.push(""));let r=e.attributes.interactions||[];if(r.length>0){i.push("## \u4E92\u52A8\u8BB0\u5F55");for(let s of r.slice(-5)){let o=s.timestamp?new Date(s.timestamp).toISOString().split("T")[0]:"";i.push("- "+o+" "+s.content)}i.push("")}else e.attributes.interactions;let a=Gs(t).trim();return`${Ue}
${a}
${Ue}

${i.join(`
`)}`}var Qs=new Set(["L0","L1","L2","L3"]);function Js(e){return typeof e=="string"&&Qs.has(e)}function oe(e){let i=Xs(e).frontmatter,n=i.type,r=Array.isArray(i.aliases)?i.aliases:[],a=new Set(["needs_confirmation","observing","active","archived"]),s=new Set(["id","name","type","maturity","confidence","aliases","createdAt","lastUpdated","lifecycle","importance","userId","relatedPeople","relatedObjects","relatedThemes","evidenceEntryIds"]),o=i.status,l=o!=null&&a.has(o),c={};for(let[f,p]of Object.entries(i))p!=null&&(s.has(f)||f==="status"&&l||(c[f]=p));let u=typeof c.subtype=="string"?c.subtype:void 0;Pe(n,u,i,c);let d=j(n,u,c);return{id:i.id||we(i.name),userId:"",cardType:n,name:i.name,aliases:r,attributes:d,relatedPeople:[],relatedObjects:[],relatedThemes:[],evidenceEntryIds:[],confidence:typeof i.confidence=="number"?i.confidence:.5,maturity:Js(i.maturity)?i.maturity:"L0",status:l?o:"needs_confirmation",lifecycle:"candidate",importance:0,createdAt:i.createdAt||new Date().toISOString(),lastUpdated:i.lastUpdated||new Date().toISOString()}}function Xs(e){let t=e.trim();if(!t.startsWith(Ue))return{frontmatter:{},body:t};let i=t.indexOf(Ue,3);if(i===-1)return{frontmatter:{},body:t};let n=t.slice(3,i).trim(),r=t.slice(i+3).trim();return{frontmatter:qs(n)||{},body:r}}function Zs(e,t){let i=new Map,n=L(e);for(let r of n.commonAttributes)i.set(r.key,r.label);if(t&&n.subtypes?.[t])for(let r of n.subtypes[t].attributes)i.has(r.key)||i.set(r.key,r.label);return i}function wn(e,t){if(e[t.key]!=null&&e[t.key]!=="")return e[t.key];if(t.aliases){for(let i of t.aliases)if(e[i]!=null&&e[i]!=="")return e[i]}}function At(e){if(Array.isArray(e))return e.map(String).join(", ");if(typeof e=="object"&&e!==null)try{return JSON.stringify(e)}catch{return""}return String(e)}function eo(e){let t=[],i=e.attributes,n=typeof i.subtype=="string"?i.subtype:void 0,r=N(e.cardType,n),a=Zs(e.cardType,n),s=L(e.cardType),o=new Map;for(let d of s.commonAttributes)o.set(d.key,d);if(n&&s.subtypes?.[n])for(let d of s.subtypes[n].attributes)o.has(d.key)||o.set(d.key,d);if((e.cardType==="object"||e.cardType==="theme")&&i.subtype){let d=he(e.cardType,i.subtype)||i.subtype;t.push("- \u7C7B\u578B\uFF1A"+d)}let l=new Set(["subtype"]),c=[...r.p0,...r.p1];for(let d of c){if(l.has(d))continue;let f=o.get(d);if(!f)continue;let p=wn(i,f);if(p!==void 0){let h=a.get(d)||d;t.push(`- ${h}\uFF1A${At(p)}`),l.add(d)}}for(let d of r.p2){if(l.has(d))continue;let f=o.get(d);if(!f)continue;let p=wn(i,f);if(p!==void 0){let h=a.get(d)||d;t.push(`- ${h}\uFF1A${At(p)}`),l.add(d)}}let u=new Set(o.keys());for(let d of o.values())if(d.aliases)for(let f of d.aliases)u.add(f);for(let[d,f]of Object.entries(i))l.has(d)||u.has(d)||d==="interactions"||d==="relatedEntities"||f!=null&&f!==""&&(t.push(`- ${d}\uFF1A${At(f)}`),l.add(d));return t}function to(e){switch(e){case"person":return"Person/";case"object":return"Object/";case"theme":return"Theme/";default:return""}}function io(e){return e.replace(/[\\/<>:"|?*]/g,"_").trim()}function kn(e,t){return`${to(t)}${io(e)||"unnamed"}.md`}function Cn(e){let t=no(e.type);return{path:kn(e.title,t),cardType:t,sanitizedName:e.title}}function no(e){return e==="person"?"person":e==="object"?"object":e==="theme"?"theme":e==="project"||e==="thing"?"object":e==="idea"||e==="knowledge"?"theme":"object"}var X={name:"",occupation:"",company:"",city:"",skills:[],roles:[],relationships:[],goals:[],focusAreas:[],lastUpdated:new Date().toISOString().split("T")[0]};function An(e){let t={...X},i=e.match(/^---\n([\s\S]*?)\n---/);if(i)try{let n=Q.load(i[1]);n&&(typeof n.name=="string"&&(t.name=n.name),typeof n.occupation=="string"&&(t.occupation=n.occupation),typeof n.company=="string"&&(t.company=n.company),typeof n.city=="string"&&(t.city=n.city),Array.isArray(n.skills)&&(t.skills=n.skills.map(String)),Array.isArray(n.roles)&&(t.roles=n.roles.map(String)),Array.isArray(n.relationships)&&(t.relationships=n.relationships.map(String)),Array.isArray(n.goals)&&(t.goals=n.goals.map(String)),Array.isArray(n.focusAreas)&&(t.focusAreas=n.focusAreas.map(String)))}catch{}return!t.name&&!t.company?ro(e):t}function ro(e){let t={...X},i=e.split(`
`),n="";for(let r of i){let a=r.trim();if(a.startsWith("## ")){n=a.slice(3);continue}if(n==="\u57FA\u672C\u4FE1\u606F"&&a.startsWith("- ")){let s=a.slice(2),[o,...l]=s.split("\uFF1A"),c=l.join("\uFF1A");o==="\u59D3\u540D"&&(t.name=c),(o==="\u804C\u4E1A"||o==="\u804C\u4F4D")&&(t.occupation=c),(o==="\u516C\u53F8/\u7EC4\u7EC7"||o==="\u516C\u53F8")&&(t.company=c),o==="\u57CE\u5E02"&&(t.city=c)}if(a.startsWith("- ")&&!a.includes("\uFF1A")){let s=a.slice(2);if(s==="_\u6682\u65E0_")continue;n==="\u6280\u80FD\u4E0E\u4E13\u4E1A"&&t.skills.push(s),n==="\u89D2\u8272\u4E0E\u5173\u7CFB"&&t.roles.push(s),n==="\u76EE\u6807\u4E0E\u8BA1\u5212"&&t.goals.push(s),n==="\u5173\u6CE8\u9886\u57DF"&&t.focusAreas.push(s)}if(a.startsWith("- \u5173\u7CFB\uFF1A")&&n==="\u89D2\u8272\u4E0E\u5173\u7CFB"){let s=a.slice(5);s!=="_\u6682\u65E0_"&&t.relationships.push(s)}}return t}var ao="TraceMind/PROFILE.md";async function Tn(e){let t=e.vault.getFileByPath(ao);if(!t)return{...X};try{let i=await e.vault.read(t);return An(i)}catch{return{...X}}}H();function so(e,t,i){let n="\u4F60\u662F\u4E00\u4E2A\u7CBE\u51C6\u7684\u5B9E\u4F53\u63D0\u53D6\u548C\u65E5\u8BB0\u5206\u7C7B\u4E13\u5BB6\u3002\u8BF7\u5BF9\u4EE5\u4E0B\u65E5\u8BB0\u6587\u672C\u8FDB\u884C\u5206\u6790\u3002";if(i&&(n+=`

${i}`),n+=`

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
- **theme \u8C28\u614E\u4F46\u4E0D\u8981\u9057\u6F0F**\uFF1A\u547D\u540D\u8981\u50CF\u4E00\u4E2A"\u4E3B\u9898\u6807\u7B7E"\u800C\u975E\u4E8B\u4EF6\u63CF\u8FF0\uFF1A\u5982"H200\u4F9B\u8D27\u7D27\u5F20" \u2705
- **object \u5FC5\u987B\u6709\u5177\u4F53\u540D\u79F0**\uFF1A\u5982\u4EA7\u54C1\u578B\u53F7\u3001\u9879\u76EE\u540D\u79F0\u3001\u6587\u6863\u6807\u9898\u7B49

\u6BCF\u4E2A\u5B9E\u4F53\u5FC5\u987B\u6709\uFF1A
- "name": \u5B9E\u4F53\u540D\u79F0\uFF08\u5B57\u7B26\u4E32\uFF0C\u5FC5\u586B\uFF09
- "type": \u4EE5\u4E0B\u4E4B\u4E00\uFF1A"person"\uFF08\u4EBA\u7269\uFF09\u3001"object"\uFF08\u5BA2\u4F53\uFF09\u3001"theme"\uFF08\u4E3B\u9898\uFF09\uFF08\u5FC5\u586B\uFF09
- "subtype": \u5BA2\u4F53\u548C\u4E3B\u9898\u7684\u7EC6\u5206\u7C7B\u578B\uFF08\u53EF\u9009\uFF0C\u89C1\u4E0B\u65B9\u89C4\u5219\uFF09
- "confidence": 0.0 \u5230 1.0 \u4E4B\u95F4\u7684\u6570\u5B57\uFF08\u53EF\u9009\uFF0C\u9ED8\u8BA4 0.5\uFF09

${ti()}`,t){let r=t.includes("\u5DF2\u77E5\u5B9E\u4F53");n+=`

`+t,r&&(n+=`

\u6CE8\u610F\uFF1A\u5DF2\u77E5\u5B9E\u4F53\u5DF2\u5EFA\u6863\uFF0C\u4E0D\u8981\u91CD\u590D\u63D0\u53D6\uFF0C\u53EA\u63D0\u53D6\u65B0\u51FA\u73B0\u7684\u5B9E\u4F53\u3002`)}return n+=`

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
${e}`,n}function oo(e){let t=["person","object","theme"];try{let i=e.trim(),n=i.indexOf('{"entities"');if(n>=0){let l=0,c=n;for(let u=n;u<i.length;u++)if(i[u]==="{")l++;else if(i[u]==="}"&&(l--,l===0)){c=u+1;break}i=i.slice(n,c),console.log('[TraceMind] parseLLM: extracted JSON via {"entities"} pattern:',i.substring(0,200))}else{let l=i.lastIndexOf(">");if(l>=0&&l>i.length*.3){let u=i.slice(l+1).trim();u.startsWith("{")&&(i=u)}console.log("[TraceMind] parseLLM: after tag removal (first 200):",i.substring(0,200));let c=i.match(/```(?:json)?\s*\n?([\s\S]*?)```/);if(c&&(i=c[1].trim()),!i.startsWith("{")){let u=i.indexOf("{"),d=i.lastIndexOf("}");u!==-1&&d!==-1&&(i=i.slice(u,d+1))}console.log("[TraceMind] parseLLM: final JSON (first 200):",i.substring(0,200))}let r=JSON.parse(i);if(console.log("[TraceMind] parseLLM: parsed JSON:",JSON.stringify(r).substring(0,200)),!r.entities||!Array.isArray(r.entities))return{entities:[]};let a=["\u5DE5\u4F5C","\u751F\u6D3B","\u5B66\u4E60","\u8FD0\u52A8","\u5176\u4ED6"],s=typeof r.domain=="string"&&a.includes(r.domain)?r.domain:void 0,o=[];for(let l of r.entities)!l.name||typeof l.name!="string"||l.name.trim()===""||t.includes(l.type)&&o.push({name:l.name.trim(),type:l.type,subtype:l.subtype,confidence:typeof l.confidence=="number"?l.confidence:.5});return{domain:s,entities:o}}catch{return{entities:[]}}}async function Sn(e,t){let i=t.provider||"openai",n={provider:i,apiKey:t.apiKey,model:t.model,baseUrl:t.baseUrl,enableThinking:t.enableThinking,reasoningEffort:t.reasoningEffort},r=K(n);if(!r.valid)throw new Error(r.error);console.log("[TraceMind] LLM extract called, provider:",i,"baseUrl:",t.baseUrl,"model:",t.model);let a=so(e,t.profileContext,t.extraContext);console.log("[TraceMind] LLM prompt:",a.substring(0,200));let s=ue(n,[{role:"user",content:a}]);console.log("[TraceMind] LLM URL:",s.url);let o=await fetch(s.url,{method:s.method||"POST",headers:s.headers,body:s.body});if(console.log("[TraceMind] LLM response status:",o.status),!o.ok)throw await ce(o);let l=await o.json(),c=Se(i,l);console.log("[TraceMind] LLM raw response:",c.content);let u=oo(c.content);return console.log("[TraceMind] LLM parsed: domain=",u.domain,"entities=",u.entities.length,u.entities),u}H();var lo={L0:30,L1:20,L2:10,L3:10},co={P0:10,P1:5,P2:2};function uo(e){let t=lo[e.maturityLevel]??10;return e.attributePriority&&(t+=co[e.attributePriority]??2),e.type==="new_entity"&&(t+=10),t}function Tt(e,t,i,n){let r=[],a=typeof i.subtype=="string"?i.subtype:void 0,s=j(e,a,i),o=N(e,a);for(let l of o.p0)M(s,l)||r.push({type:"missing_attribute",entityName:"",entityType:e,maturityLevel:t,attributePriority:"P0",missingAttribute:l,score:0,description:`Missing P0 attribute: ${l}`});for(let l of o.p1)M(s,l)||r.push({type:"missing_attribute",entityName:"",entityType:e,maturityLevel:t,attributePriority:"P1",missingAttribute:l,score:0,description:`Missing P1 attribute: ${l}`});for(let l of o.p2)M(s,l)||r.push({type:"missing_attribute",entityName:"",entityType:e,maturityLevel:t,attributePriority:"P2",missingAttribute:l,score:0,description:`Missing P2 attribute: ${l}`});t!=="L0"&&n.length===0&&r.push({type:"missing_relation",entityName:"",entityType:e,maturityLevel:t,attributePriority:"P1",score:0,description:"No relations established"});for(let l of r)l.score=uo(l);return r.sort((l,c)=>c.score-l.score)}function po(e){let t={children:new Map,fail:null,output:[]};for(let n of e){let r=t;for(let a of n.text){let s=r.children.get(a);s||(s={children:new Map,fail:null,output:[]},r.children.set(a,s)),r=s}r.output.push({entityName:n.entityName,entityId:n.entityId,matchType:n.matchType,patternLen:n.text.length})}let i=[];for(let n of t.children.values())n.fail=t,i.push(n);for(;i.length>0;){let n=i.shift();for(let[r,a]of n.children){i.push(a);let s=n.fail;for(;s!==null&&!s.children.has(r);)s=s.fail;a.fail=s&&s.children.get(r)||t,a.fail&&a.output.push(...a.fail.output)}}return t}function fo(e,t){let i=[],n=new Set,r=e;for(let a=0;a<t.length;a++){let s=t[a];for(;r!==e&&!r.children.has(s);)r=r.fail;let o=r.children.get(s);o?r=o:r=e;for(let l of r.output){let c=l.entityId+":"+l.matchType;n.has(c)||(n.add(c),i.push({matchedText:t.slice(a-l.patternLen+1,a+1),entityName:l.entityName,entityId:l.entityId,matchType:l.matchType,position:a-l.patternLen+1}))}}return i}function In(e,t){if(t.length===0)return[];let i=[];for(let r of t){r.name.length>=2&&i.push({text:r.name,entityName:r.name,entityId:r.id,matchType:"exact"});for(let a of r.aliases||[])a.length>=2&&i.push({text:a,entityName:r.name,entityId:r.id,matchType:"alias"});if(r.name.length>=2){let a=r.name.slice(0,Math.min(3,r.name.length));i.filter(o=>o.entityId===r.id&&o.text===a).length===0&&a.length>=2&&i.push({text:a,entityName:r.name,entityId:r.id,matchType:"prefix"})}}i.sort((r,a)=>a.text.length-r.text.length);let n=po(i);return fo(n,e)}var ho=5,Mn={company:"\u8FD9\u4E2A**\u516C\u53F8/\u7EC4\u7EC7**\u80FD\u4ECB\u7ECD\u4E00\u4E0B\u5417\uFF1F\u6BD4\u5982\u4E1A\u52A1\u9886\u57DF\u3001\u5408\u4F5C\u5173\u7CFB\u3001\u76F8\u5173\u80CC\u666F\u7B49\u3002",project:"\u8FD9\u4E2A**\u9879\u76EE**\u80FD\u4ECB\u7ECD\u4E00\u4E0B\u5417\uFF1F\u6BD4\u5982\u5F53\u524D\u72B6\u6001\u3001\u65F6\u95F4\u8282\u70B9\u3001\u76F8\u5173\u80CC\u666F\u7B49\u3002",task:"\u8FD9\u4E2A**\u4EFB\u52A1**\u80FD\u4ECB\u7ECD\u4E00\u4E0B\u5417\uFF1F\u6BD4\u5982\u5F53\u524D\u72B6\u6001\u3001\u65F6\u95F4\u8282\u70B9\u3001\u76F8\u5173\u80CC\u666F\u7B49\u3002",product:"\u8FD9\u4E2A**\u4EA7\u54C1**\u80FD\u4ECB\u7ECD\u4E00\u4E0B\u5417\uFF1F\u6BD4\u5982\u5F53\u524D\u72B6\u6001\u3001\u5173\u952E\u7279\u6027\u3001\u76F8\u5173\u80CC\u666F\u7B49\u3002",technology:"\u8FD9\u4E2A**\u6280\u672F**\u80FD\u4ECB\u7ECD\u4E00\u4E0B\u5417\uFF1F\u6BD4\u5982\u5F53\u524D\u72B6\u6001\u3001\u4E3B\u8981\u7528\u9014\u3001\u76F8\u5173\u80CC\u666F\u7B49\u3002",document:"\u8FD9\u4E2A**\u6587\u6863**\u80FD\u4ECB\u7ECD\u4E00\u4E0B\u5417\uFF1F\u6BD4\u5982\u5F53\u524D\u72B6\u6001\u3001\u4E3B\u8981\u7528\u9014\u3001\u76F8\u5173\u80CC\u666F\u7B49\u3002",location:"\u8FD9\u4E2A**\u5730\u70B9**\u80FD\u4ECB\u7ECD\u4E00\u4E0B\u5417\uFF1F\u6BD4\u5982\u5728\u54EA\u91CC\u3001\u6709\u4EC0\u4E48\u7279\u522B\u4E4B\u5904\u7B49\u3002"},Fn={friction:"\u8FD9\u4E2A**\u6469\u64E6**\u80FD\u804A\u804A\u5417\uFF1F\u6BD4\u5982\u662F\u4EC0\u4E48\u5BFC\u81F4\u7684\u3001\u6301\u7EED\u591A\u4E45\u4E86\u3001\u5F71\u54CD\u6709\u591A\u5927\uFF1F",goal:"\u8FD9\u4E2A**\u76EE\u6807**\u80FD\u804A\u804A\u5417\uFF1F\u6BD4\u5982\u76EE\u524D\u8FDB\u5C55\u3001\u4E0B\u4E00\u6B65\u8BA1\u5212\u3001\u6709\u4EC0\u4E48\u963B\u7887\uFF1F",judgment:"\u8FD9\u4E2A**\u5224\u65AD**\u80FD\u804A\u804A\u5417\uFF1F\u6BD4\u5982\u57FA\u4E8E\u4EC0\u4E48\u5F62\u6210\u7684\u3001\u6709\u591A\u5927\u628A\u63E1\uFF1F",idea:"\u8FD9\u4E2A**\u60F3\u6CD5**\u80FD\u804A\u804A\u5417\uFF1F\u6BD4\u5982\u600E\u4E48\u4EA7\u751F\u7684\u3001\u6709\u6CA1\u6709\u66F4\u5177\u4F53\u7684\u601D\u8003\uFF1F"};function Bn(e,t){return e.type==="new_entity"?e.entityType==="object"&&t&&Mn[t]?`${e.entityName} ${Mn[t]}`:e.entityType==="object"?`${e.entityName} \u80FD\u4ECB\u7ECD\u4E00\u4E0B\u5417\uFF1F\u6BD4\u5982\u5F53\u524D\u72B6\u6001\u3001\u65F6\u95F4\u8282\u70B9\u3001\u76F8\u5173\u80CC\u666F\u7B49\u3002`:e.entityType==="theme"&&t&&Fn[t]?`${e.entityName} ${Fn[t]}`:e.entityType==="theme"?`${e.entityName} \u80FD\u804A\u804A\u5417\uFF1F\u6BD4\u5982\u8FD9\u4E2A\u60C5\u51B5\u5F71\u54CD\u6709\u591A\u5927\u3001\u6301\u7EED\u591A\u4E45\u4E86\uFF1F`:e.entityType==="person"?`${e.entityName} \u662F\u8C01\uFF1F\u80FD\u4ECB\u7ECD\u4E00\u4E0B\u5417\uFF1F\u6BD4\u5982\u5728\u54EA\u5BB6\u516C\u53F8\u3001\u4EC0\u4E48\u804C\u4F4D\u3001\u548C\u4F60\u7684\u5173\u7CFB\u7B49\u3002`:`${e.entityName} \u662F\u4EC0\u4E48\uFF1F`:e.type==="missing_attribute"&&e.missingAttribute?{company:e.entityName+" \u5728\u54EA\u4E2A\u516C\u53F8\u6216\u7EC4\u7EC7\u5DE5\u4F5C\uFF1F",role:e.entityName+" \u7684\u804C\u4F4D\u6216\u89D2\u8272\u662F\u4EC0\u4E48\uFF1F",relationship_to_user:"\u4F60\u548C "+e.entityName+" \u662F\u4EC0\u4E48\u5173\u7CFB\uFF1F",responsibility:e.entityName+" \u8D1F\u8D23\u4EC0\u4E48\u5DE5\u4F5C\uFF1F",workingStyle:e.entityName+" \u7684\u534F\u4F5C\u98CE\u683C\u662F\u600E\u6837\u7684\uFF1F",subtype:e.entityName+" \u662F\u4EC0\u4E48\u7C7B\u578B\uFF1F\u6BD4\u5982\u9879\u76EE\u3001\u4EFB\u52A1\u3001\u4EA7\u54C1\u7B49\uFF1F",stage:e.entityName+" \u5F53\u524D\u5904\u4E8E\u4EC0\u4E48\u9636\u6BB5\uFF1F",owner:e.entityName+" \u7684\u8D1F\u8D23\u4EBA\u662F\u8C01\uFF1F",taskStatus:e.entityName+" \u5F53\u524D\u7684\u72B6\u6001\u662F\u4EC0\u4E48\uFF1F",nextAction:e.entityName+" \u7684\u4E0B\u4E00\u6B65\u884C\u52A8\u662F\u4EC0\u4E48\uFF1F",dueDate:e.entityName+" \u6709\u622A\u6B62\u65E5\u671F\u5417\uFF1F",assignee:e.entityName+" \u7531\u8C01\u8D1F\u8D23\uFF1F",parentProject:e.entityName+" \u5C5E\u4E8E\u54EA\u4E2A\u9879\u76EE\uFF1F",useCase:e.entityName+" \u7684\u4E3B\u8981\u7528\u9014\u662F\u4EC0\u4E48\uFF1F",adoptionStatus:e.entityName+" \u5F53\u524D\u91C7\u7528\u72B6\u6001\u5982\u4F55\uFF1F",description:"\u5173\u4E8E "+e.entityName+" \u6709\u4EC0\u4E48\u8865\u5145\u4FE1\u606F\uFF1F",trigger:e.entityName+" \u7684\u89E6\u53D1\u6761\u4EF6\u662F\u4EC0\u4E48\uFF1F",impact:e.entityName+" \u6709\u4EC0\u4E48\u5F71\u54CD\uFF1F",frequency:e.entityName+" \u51FA\u73B0\u7684\u9891\u7387\u5982\u4F55\uFF1F",possibleCause:e.entityName+" \u53EF\u80FD\u7684\u539F\u56E0\u662F\u4EC0\u4E48\uFF1F",claim:e.entityName+" \u7684\u5177\u4F53\u4E3B\u5F20\u662F\u4EC0\u4E48\uFF1F",judgmentConfidence:"\u4F60\u5BF9 "+e.entityName+" \u7684\u786E\u4FE1\u5EA6\u5982\u4F55\uFF1F",evidence:e.entityName+" \u6709\u4EC0\u4E48\u8BC1\u636E\u652F\u6301\uFF1F",counterEvidence:e.entityName+" \u6709\u53CD\u9762\u7684\u8BC1\u636E\u5417\uFF1F",desiredOutcome:e.entityName+" \u671F\u671B\u7684\u7ED3\u679C\u662F\u4EC0\u4E48\uFF1F",currentState:e.entityName+" \u5F53\u524D\u8FDB\u5C55\u5982\u4F55\uFF1F",coreIdea:e.entityName+" \u7684\u6838\u5FC3\u60F3\u6CD5\u662F\u4EC0\u4E48\uFF1F"}[e.missingAttribute]||`\u5173\u4E8E ${e.entityName} \u7684 ${e.missingAttribute} \u4FE1\u606F\u662F\u4EC0\u4E48\uFF1F`:e.type==="missing_relation"?`${e.entityName} \u548C\u4EC0\u4E48\u5176\u4ED6\u5B9E\u4F53\u6709\u5173\u8054\uFF1F`:e.type==="recurring_pattern"?`${e.entityName} \u5DF2\u7ECF\u591A\u6B21\u51FA\u73B0\uFF0C\u5B83\u4EE3\u8868\u4EC0\u4E48\uFF1F`:`\u8BF7\u63D0\u4F9B\u66F4\u591A\u5173\u4E8E ${e.entityName} \u7684\u4FE1\u606F\u3002`}function go(e,t){for(let[i,n]of t)if(n.name===e.name)return{cardId:i,maturity:n.maturity};return null}var ke=class{static analyzeBlock(t,i){return console.warn("[TraceMind] analyzeBlock (sync) is deprecated, use analyzeBlockAsync for LLM extraction"),{entities:[],newEntities:[],existingEntities:[],hasClarifications:!1,gapCount:0}}static async analyzeBlockAsync(t,i,n,r,a){let s=r&&r.length>0?In(t,r):[],o=new Set(s.map(y=>y.entityId)),l=r&&r.length>0?r.filter(y=>{if(o.has(y.id))return!0;for(let x=0;x<=y.name.length-2;x++)if(t.includes(y.name.slice(x,x+2)))return!0;for(let x of y.aliases||[])for(let b=0;b<=x.length-2;b++)if(t.includes(x.slice(b,b+2)))return!0;return!1}).slice(0,10):[],c=l.length>0?l.map(y=>{let x=y.aliases&&y.aliases.length>0?"\uFF08\u522B\u540D\uFF1A"+y.aliases.join("\u3001")+"\uFF09":"";return y.name+x+" ["+y.cardType+"]"}).join("\u3001"):"";console.log("[TraceMind] AC scan found",s.length,"matches,",l.length,"candidates for LLM:",c);let u=[],d;if(n&&K({provider:n.provider||"openai",apiKey:n.apiKey,model:n.model,baseUrl:n.baseUrl}).valid){console.log("[TraceMind] LLM config:",{baseUrl:n.baseUrl,model:n.model,hasApiKey:!!n.apiKey});try{let y={...n,extraContext:a,profileContext:n.profileContext?n.profileContext+(c?`

\u5DF2\u77E5\u5B9E\u4F53\uFF08\u5DF2\u5EFA\u6863\uFF0C\u4E0D\u8981\u91CD\u590D\u63D0\u53D6\uFF0C\u6CE8\u610F\u76F8\u4F3C\u540D\u79F0\uFF09\uFF1A`+c:""):c?`

\u5DF2\u77E5\u5B9E\u4F53\uFF08\u5DF2\u5EFA\u6863\uFF0C\u4E0D\u8981\u91CD\u590D\u63D0\u53D6\uFF0C\u6CE8\u610F\u76F8\u4F3C\u540D\u79F0\uFF09\uFF1A`+c:""},x=await Sn(t,y);console.log("[TraceMind] LLM extracted:",x.entities.length,x.entities,"domain:",x.domain),u=x.entities.map(b=>({...b})),d=x.domain}catch(y){console.warn("[TraceMind] LLM extraction failed:",y.message)}}else console.log("[TraceMind] No LLM config provided, skipping extraction");let p=new Set(u.map(y=>y.name)),h=new Set;for(let y of s)if(!h.has(y.entityName)&&(h.add(y.entityName),!p.has(y.entityName))){let x=r?.find(b=>b.name===y.entityName);x&&u.push({name:y.entityName,type:x.cardType,confidence:.9})}let g=yo(u,i);return g.domainCategory=d,g}static summarizeResult(t){if(t.entities.length===0)return"\u672A\u68C0\u6D4B\u5230\u9700\u8981\u5173\u6CE8\u7684\u5B9E\u4F53\u3002";let i=[];if(t.newEntities.length>0){let n=t.newEntities.map(r=>r.name).join("\u3001");i.push(`\u53D1\u73B0 ${t.newEntities.length} \u4E2A\u65B0\u5B9E\u4F53\uFF1A${n}`)}if(t.existingEntities.length>0){let n=t.existingEntities.map(r=>r.name).join("\u3001");i.push(`\u63D0\u53CA ${t.existingEntities.length} \u4E2A\u5DF2\u6709\u5B9E\u4F53\uFF1A${n}`)}return t.hasClarifications&&i.push("\u9700\u8981\u8FDB\u4E00\u6B65\u6F84\u6E05\u4FE1\u606F\u3002"),i.join(`
`)}};function yo(e,t){let i=[];for(let s of e){let o=go(s,t),l=s.subtype?{subtype:s.subtype}:{},c=o?.maturity??kt(s.type,l),u=En(s.type,l,0),d=[];if(o){let h=Tt(s.type,c,l,[]);d.push(...h)}else{d.push({type:"new_entity",entityName:s.name,entityType:s.type,maturityLevel:"L0",attributePriority:"P0",score:40,description:`New entity: ${s.name}`});let h=Tt(s.type,"L0",l,[]);d.push(...h)}let f=d.slice(0,2).map(h=>Bn(h,s.subtype)),p={...s,isNew:!o,existingCardId:o?.cardId,maturity:c,priorityScore:u,clarificationQuestions:f,knowledgeGaps:d};i.push(p)}i.sort((s,o)=>s.isNew!==o.isNew?s.isNew?-1:1:o.priorityScore-s.priorityScore);let n=i.slice(0,ho),r=n.flatMap(s=>s.knowledgeGaps??[]),a=r.sort((s,o)=>o.score-s.score)[0];return{entities:n,newEntities:n.filter(s=>s.isNew),existingEntities:n.filter(s=>!s.isNew),hasClarifications:n.some(s=>s.isNew),gapCount:r.length,firstQuestion:a?Bn(a):void 0}}var mo=Q.load,bo=new Set(["L0","L1","L2","L3"]),St=new Set(["id","name","type","subtype","maturity","confidence","aliases","createdAt","lastUpdated","lifecycle","importance","userId","relatedPeople","relatedObjects","relatedThemes","evidenceEntryIds","interactions","filePath","relationCount","summary"]);function Y(e,t){let i=xo(e),n=i?.name;n||(n=t.split("/").pop()?.replace(".md","")||"");let r=i?.type||"person",a=i?.maturity,s=a&&bo.has(a)?a:"L0",o=typeof i?.confidence=="number"?i.confidence:.5,l=Array.isArray(i?.aliases)?i.aliases:[],c=i?.summary,u=i?.subtype,d={};if(i)for(let[g,y]of Object.entries(i))!St.has(g)&&y!=null&&(d[g]=y);Pe(r,u,i||{},d);let f=j(r,u,d),p=c||f.summary||d.context||void 0,h={};for(let[g,y]of Object.entries(f))!St.has(g)&&y!=null&&(h[g]=y);for(let[g,y]of Object.entries(d))!St.has(g)&&y!=null&&(!(g in f)||f[g]==null)&&(h[g]=y);return{id:i?.id||we(n),name:n,cardType:r,type:vo(r),subtype:u,summary:p,maturity:s,confidence:o,filePath:t,aliases:l,relationCount:0,lastUpdated:i?.lastUpdated||new Date().toISOString(),metadata:Object.keys(h).length>0?h:void 0}}function Pn(e){let t=[];for(let i of e)if(i.content.trim())try{let n=Y(i.content,i.path);t.push(n)}catch{}return{entries:t,lastRebuild:new Date().toISOString()}}function xo(e){let t=e.trim();if(!t.startsWith("---"))return null;let i=t.indexOf("---",3);if(i===-1)return null;let n=t.slice(3,i).trim();return mo(n)||null}function vo(e){switch(e){case"person":return"person";case"object":return"thing";case"theme":return"idea";default:return"thing"}}function Dn(e,t){let i=t.toLowerCase();return e.entries.filter(n=>n.name.toLowerCase().includes(i)||n.aliases.some(r=>r.toLowerCase().includes(i)))}function Z(e,t){let i=e.entries.findIndex(r=>r.id===t.id),n=[...e.entries];return i>=0?n[i]=t:n.push(t),{entries:n,lastRebuild:e.lastRebuild}}function Ln(e){return JSON.stringify(e,null,2)}function _n(e){let t=JSON.parse(e);return{entries:t.entries||[],lastRebuild:t.lastRebuild||new Date().toISOString()}}var ze="TraceMind/index/entity-index.json";async function Rn(e,t){await O(e,ze);let i=Ln(t),n=e.vault.getFileByPath(ze);n?await e.vault.modify(n,i):await e.vault.create(ze,i)}async function On(e){let t=e.vault.getFileByPath(ze);if(!t)return null;try{return _n(await e.vault.read(t))}catch{return null}}function $n(e){let t=JSON.parse(e);return{blockId:t.blockId,content:t.content,messages:t.messages||[],analysisResult:t.analysisResult,createdAt:t.createdAt,updatedAt:t.updatedAt,currentPhase:t.currentPhase||"analysis"}}var Eo="TraceMind/sessions";function It(e){return`${Eo}/${e}.json`}function Nn(e){return $n(e)}var P=require("obsidian");var ee=["Daily","Person","Object","Theme","TraceMind","TraceMind/sessions","TraceMind/index","TraceMind/insights"],T="TraceMind/PROFILE.md";function jn(e){let t=[];for(let i of ee)e.exists(i)||t.push(`\u76EE\u5F55: ${i}`);return e.exists(T)||t.push(`\u6863\u6848: ${T}`),t}function Mt(e){let t=[];for(let n of ee){let r=e.getType(n);r===null?t.push({type:"missing_dir",path:n,expected:"folder",actual:"unknown",label:`\u76EE\u5F55\u7F3A\u5931: ${n}`,repairable:!0}):r!=="folder"&&t.push({type:"wrong_type",path:n,expected:"folder",actual:r,label:`\u8DEF\u5F84\u7C7B\u578B\u9519\u8BEF: ${n}\uFF08\u5E94\u4E3A\u76EE\u5F55\uFF0C\u5B9E\u9645\u4E3A${r==="file"?"\u6587\u4EF6":"\u672A\u77E5"}\uFF09`,repairable:!1})}let i=e.getType(T);return i===null?t.push({type:"missing_file",path:T,expected:"file",actual:"unknown",label:`\u6863\u6848\u7F3A\u5931: ${T}`,repairable:!0}):i!=="file"&&t.push({type:"wrong_type",path:T,expected:"file",actual:i,label:`\u8DEF\u5F84\u7C7B\u578B\u9519\u8BEF: ${T}\uFF08\u5E94\u4E3A\u6587\u4EF6\uFF0C\u5B9E\u9645\u4E3A${i==="folder"?"\u76EE\u5F55":"\u672A\u77E5"}\uFF09`,repairable:!1}),t}async function Ft(e){try{return await e.stat(T)===null}catch{return!0}}function Vn(e,t){new Bt(e,t).open()}var wo=`---
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
`,Bt=class extends P.Modal{onComplete;dirsCreated=!1;profileCreated=!1;statusEl=null;constructor(t,i){super(t),this.onComplete=i}onOpen(){let{contentEl:t}=this;t.createEl("h2",{text:"\u6B22\u8FCE\u4F7F\u7528 TraceMind"}),t.createEl("p",{text:"TraceMind \u5C06\u5E2E\u52A9\u4F60\u4ECE\u65E5\u8BB0\u4E2D\u81EA\u52A8\u8BC6\u522B\u548C\u6574\u7406\u77E5\u8BC6\u5B9E\u4F53\u3002\u8BF7\u5148\u5B8C\u6210\u521D\u59CB\u8BBE\u7F6E\u3002"}),this.statusEl=t.createEl("div",{cls:"tracemind-first-start-status",attr:{style:"color: #e74c3c; min-height: 1.5em; margin: 8px 0;"}}),t.createEl("h3",{text:"\u521D\u59CB\u5316 Vault \u7ED3\u6784"}),new P.Setting(t).setName("\u521B\u5EFA\u77E5\u8BC6\u76EE\u5F55\u548C\u7528\u6237\u6863\u6848").setDesc("\u521B\u5EFA Daily\u3001Person\u3001Object\u3001Theme\u3001TraceMind \u7B49\u76EE\u5F55\uFF0C\u4EE5\u53CA\u7528\u6237\u6863\u6848\u6587\u4EF6\u3002").addButton(i=>{i.setButtonText("\u521D\u59CB\u5316"),i.onClick(async()=>{await this.initializeAll(),i.setButtonText("\u5DF2\u5B8C\u6210"),i.setDisabled(!0),this.clearStatus(),new P.Notice("Vault \u7ED3\u6784\u521D\u59CB\u5316\u5B8C\u6210")})}),t.createEl("h3",{text:"\u5B8C\u6210\u8BBE\u7F6E"}),new P.Setting(t).setName("\u786E\u8BA4\u5B8C\u6210").setDesc("\u6240\u6709\u76EE\u5F55\u548C\u6863\u6848\u521B\u5EFA\u5B8C\u6210\u540E\uFF0C\u70B9\u51FB\u5B8C\u6210\u5F00\u59CB\u4F7F\u7528 TraceMind").addButton(i=>{i.setButtonText("\u5B8C\u6210"),i.setCta(),i.onClick(async()=>{let n=this.validateStructure();if(n.length>0){this.showStatus(`\u4EE5\u4E0B\u9879\u76EE\u7F3A\u5931\uFF0C\u8BF7\u5148\u70B9\u51FB"\u521D\u59CB\u5316"\uFF1A
`+n.map(r=>`  - ${r}`).join(`
`));return}this.close(),await this.onComplete()})})}async initializeAll(){for(let i of ee)await te(this.app,i);this.dirsCreated=!0,this.app.vault.getAbstractFileByPath(T)?this.profileCreated=!0:(await this.app.vault.create(T,wo),this.profileCreated=!0)}validateStructure(){return jn({exists:t=>this.app.vault.getAbstractFileByPath(t)!==null})}showStatus(t){this.statusEl&&(this.statusEl.style.whiteSpace="pre-line",this.statusEl.setText(t))}clearStatus(){this.statusEl&&this.statusEl.setText("")}onClose(){let{contentEl:t}=this;t.empty()}};function Hn(e,t,i,n,r){new Pt(e,t,i,n,r).open()}var Pt=class extends P.Modal{issues;onRepair;onSkip;onComplete;listEl=null;constructor(t,i,n,r,a){super(t),this.issues=i,this.onRepair=n,this.onSkip=r,this.onComplete=a}onOpen(){let{contentEl:t}=this;t.createEl("h2",{text:"TraceMind Vault \u7ED3\u6784\u9700\u8981\u4FEE\u6B63"}),t.createEl("p",{text:"\u68C0\u6D4B\u5230\u5FC5\u8981\u76EE\u5F55\u6216\u6863\u6848\u7F3A\u5931/\u5F02\u5E38\uFF1A"}),this.listEl=t.createEl("ul"),this.renderIssues(),new P.Setting(t).addButton(i=>{i.setButtonText("\u4FEE\u6B63").setCta().onClick(async()=>{this.issues=await this.onRepair(),this.issues.length===0?(new P.Notice("TraceMind Vault \u7ED3\u6784\u5DF2\u4FEE\u6B63"),this.close(),await this.onComplete()):this.renderIssues()})}).addButton(i=>{i.setButtonText("\u6682\u4E0D\u4FEE\u6B63").onClick(()=>{new P.Notice("\u7ED3\u6784\u672A\u4FEE\u6B63\uFF0C\u90E8\u5206\u529F\u80FD\u53EF\u80FD\u4E0D\u53EF\u7528"),this.close(),this.onSkip()})})}renderIssues(){if(this.listEl){this.listEl.empty();for(let t of this.issues){let i=this.listEl.createEl("li",{text:t.label});t.repairable||i.createEl("span",{text:"\uFF08\u9700\u624B\u52A8\u5904\u7406\uFF09",cls:"tracemind-repair-warning",attr:{style:"color: #e74c3c"}})}}}onClose(){this.contentEl.empty()}};var ko=/^---\n([\s\S]*?)\n---\n?/;function Un(e){let t=e.match(ko);if(!t)return null;let i=t[1],n=e.slice(t[0].length),r={};for(let c of i.split(`
`)){let u=c.indexOf(":");if(u===-1)continue;let d=c.slice(0,u).trim(),f=c.slice(u+1).trim();d&&f&&(r[d]=f)}let a=r.date,s=r.contentHash,o=r.generatedAt,l=parseInt(r.blockCount||"0",10);return!a||!s||!o||!n.trim()?null:{date:a,content:n.trim(),contentHash:s,generatedAt:o,blockCount:l}}function zn(e){return`${["---",`date: ${e.date}`,`generatedAt: ${e.generatedAt}`,`contentHash: ${e.contentHash}`,`blockCount: ${e.blockCount}`,"---"].join(`
`)}

${e.content}
`}function Ye(e){return`TraceMind/insights/${e}.md`}async function Yn(e,t){let i=Ye(t.date);await O(e,i);let n=zn(t),r=e.vault.getFileByPath(i);return r?await e.vault.modify(r,n):await e.vault.create(i,n),i}H();var Kn=/^###\s+(\d{2}:\d{2})\s+(.+)$/m,Co=/<!--\s*TM:([a-z0-9]+)\s*-->/;function Ao(){return Math.random().toString(16).slice(2,10).padStart(8,"0")}function Dt(e){let t=[],i=e.split(`
`),n=0;for(;n<i.length;){let a=i[n].match(Kn);if(a){let s=a[1],l=a[2].trim().split(/\s+/).filter(d=>d.startsWith("#")).map(d=>d.slice(1));n++;let c=[],u=[];for(;n<i.length;){let d=i[n];if(d.match(Kn))break;if(!d.trim()){n++;continue}let f=d.match(Co);if(f){let p=f[1];t.push({timestamp:s,content:c.join(`
`).trim(),tags:l,blockId:p,children:u}),n++;break}d.startsWith("- ")||d.startsWith("* ")?u.push(d.replace(/^[-*]\s+/,"")):c.push(d),n++}if(c.length>0||u.length>0){let d=t[t.length-1];(!d||d.timestamp!==s)&&t.push({timestamp:s,content:c.join(`
`).trim(),tags:l,blockId:Ao(),children:u})}}else n++}return t}var To=ee,Ke=class extends R.Plugin{settings;userProfile={...X};analysisService=ke;entityIndex={entries:[],lastRebuild:""};entityManager;sessionManager;aiProvider;aiAnalysisView;blockEditorView;calendarView;async onload(){console.log("TraceMind: loading...");try{await this.loadSettings(),this.userProfile=await Tn(this.app),Zt(),this.entityManager=new Lt(this.app,this),this.sessionManager=new _t(this.app),this.aiProvider=new Rt(this),await this.sessionManager.initialize(),this.registerView($,t=>(this.blockEditorView=new Be(t,this),this.blockEditorView)),this.registerView(ge,t=>(this.aiAnalysisView=new Le(t,this),this.aiAnalysisView)),this.registerView(ye,t=>(this.calendarView=new Re(t,this),this.calendarView.setOnDateClick(i=>this.navigateToDate(i)),this.calendarView)),this.addSettingTab(new Ie(this.app,this)),this.addRibbonIcon("brain","\u6253\u5F00 TraceMind",()=>{this.openTracemindView()}),this.addRibbonIcon("calendar","\u6253\u5F00\u65E5\u5386",()=>{this.openCalendarView()}),this.addCommand({id:"open-tracemind",name:"\u6253\u5F00 TraceMind \u89C6\u56FE",callback:()=>this.openTracemindView()}),this.addCommand({id:"open-calendar",name:"\u6253\u5F00\u65E5\u5386",callback:()=>this.openCalendarView()}),this.addCommand({id:"analyze-block",name:"\u5206\u6790\u5F53\u524D\u65E5\u8BB0\u5757",callback:()=>this.analyzeCurrentBlock()}),this.addCommand({id:"rebuild-index",name:"\u91CD\u5EFA\u5B9E\u4F53\u7D22\u5F15",callback:()=>this.rebuildEntityIndexCommand()}),this.registerEvent(this.app.workspace.on("editor-change",()=>{this.onEditorChange()})),console.log("TraceMind: loaded successfully"),await Ft(this.app.vault.adapter)?Vn(this.app,async()=>{await this.ensureVaultStructure(),await this.rebuildEntityIndex()}):(await this.ensureVaultStructure(),await this.initializeEntityIndex()),this.scheduleVaultStructureCheck()}catch(t){console.error("TraceMind: Failed to load",t),new R.Notice("TraceMind \u52A0\u8F7D\u5931\u8D25: "+t.message)}}onunload(){console.log("TraceMind: unloading...")}async loadSettings(){let t=await this.loadData();this.settings={...Ut,...t};for(let i of this.settings.providers)i.providerType||(i.baseUrl?.includes("anthropic.com")?i.providerType="anthropic":i.baseUrl?.includes("localhost:11434")||i.baseUrl?.includes("127.0.0.1:11434")?i.providerType="ollama":i.providerType="openai")}async saveSettings(){await this.saveData(this.settings)}async ensureVaultStructure(){for(let t of To)await te(this.app,t);console.log("TraceMind: vault structure ensured")}autoAnalysisTimer=null;onEditorChange(){this.autoAnalysisTimer&&clearTimeout(this.autoAnalysisTimer),this.autoAnalysisTimer=setTimeout(()=>{this.autoAnalysisTimer=null},2e3)}async rebuildEntityIndexCommand(){await this.rebuildEntityIndex(),new R.Notice(`\u5B9E\u4F53\u7D22\u5F15\u5DF2\u91CD\u5EFA: ${this.entityIndex.entries.length} \u4E2A\u5B9E\u4F53`)}async initializeEntityIndex(){let t=await On(this.app);if(t&&t.entries.length>0){this.entityIndex=t,console.log(`TraceMind: loaded entity index with ${t.entries.length} entries from file`);return}await this.rebuildEntityIndex({persist:!0})}async rebuildEntityIndex(t={persist:!0}){let i=["Person","Object","Theme"],n=[];for(let r of i)try{let a=await this.app.vault.adapter.list(r+"/");for(let s of a.files)if(s.endsWith(".md")){let o=await this.app.vault.adapter.read(s);n.push({path:s,content:o})}}catch{}this.entityIndex=Pn(n),console.log(`TraceMind: entity index rebuilt with ${this.entityIndex.entries.length} entries`),t.persist&&await this.persistEntityIndex()}scheduleVaultStructureCheck(){setTimeout(()=>{let t=Mt({getType:i=>{let n=this.app.vault.getAbstractFileByPath(i);return n?n.children!==void 0?"folder":"file":null}});t.length!==0&&Hn(this.app,t,async()=>{for(let i of t)i.repairable&&(i.type==="missing_dir"?await te(this.app,i.path):i.type==="missing_file"&&i.path===T&&(this.app.vault.getAbstractFileByPath(T)||await this.app.vault.create(T,`---
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
`)));return Mt({getType:i=>{let n=this.app.vault.getAbstractFileByPath(i);return n?n.children!==void 0?"folder":"file":null}})},()=>{},async()=>{})},2e3)}async persistEntityIndex(){try{await Rn(this.app,this.entityIndex)}catch(t){console.error("TraceMind: failed to persist entity index",t),new R.Notice("\u5B9E\u4F53\u7D22\u5F15\u4FDD\u5B58\u5931\u8D25: "+t.message)}}async navigateToDate(t){this.app.workspace.getLeavesOfType($).length===0&&await this.openTracemindView();let n=this.app.workspace.getLeavesOfType($);for(let r of n){let a=r.view;typeof a.setCurrentDate=="function"&&await a.setCurrentDate(t)}}async openCalendarView(){let{workspace:t}=this.app,i=t.getLeavesOfType(ye);if(i.length>0)t.revealLeaf(i[0]);else{let n=t.getRightLeaf(!1);n&&(await n.setViewState({type:ye,active:!0}),t.revealLeaf(n))}}async openTracemindView(){let{workspace:t}=this.app,i=t.getLeavesOfType($);if(i.length>0)t.revealLeaf(i[0]);else{let r=t.getLeaf(!1);r&&(await r.setViewState({type:$,active:!0}),t.revealLeaf(r))}if(t.getLeavesOfType(ge).length===0){let r=t.getRightLeaf(!1);r&&(await r.setViewState({type:ge,active:!0}),t.revealLeaf(r))}}async openBlockEditor(){return this.openTracemindView()}async analyzeCurrentBlock(){let t=this.app.workspace.getActiveFile();if(!t){new R.Notice("\u8BF7\u5148\u6253\u5F00\u4E00\u4E2A\u65E5\u8BB0\u6587\u4EF6");return}let i=await this.app.vault.read(t),n=t.basename;console.log("[TraceMind] analyzeCurrentBlock file:",t.path,"content length:",i.length),console.log("[TraceMind] analyzeCurrentBlock content preview:",i.substring(0,300));try{let r=await this.aiProvider.analyzeBlock(i,n);new R.Notice(`\u5206\u6790\u5B8C\u6210: \u68C0\u6D4B\u5230 ${r.entities.length} \u4E2A\u5B9E\u4F53`),console.log("[TraceMind] analyzeCurrentBlock: tmResult:",r),this.updateAIAnalysis(r)}catch(r){new R.Notice("\u5206\u6790\u5931\u8D25: "+r.message),console.error("TraceMind: analysis error",r)}}getAIAnalysisView(){return this.aiAnalysisView}getBlockEditorView(){return this.blockEditorView}getCalendarView(){return this.calendarView}getEntityManager(){return this.entityManager}getSessionManager(){return this.sessionManager}getAIProvider(){return this.aiProvider}getUserProfile(){return this.userProfile}getUserProfileContext(){let t=this.userProfile,i=[];return t.name&&i.push("\u59D3\u540D\uFF1A"+t.name),t.occupation&&i.push("\u804C\u4E1A\uFF1A"+t.occupation),t.company&&i.push("\u516C\u53F8/\u7EC4\u7EC7\uFF1A"+t.company),t.city&&i.push("\u57CE\u5E02\uFF1A"+t.city),t.skills.length>0&&i.push("\u6280\u80FD\uFF1A"+t.skills.join("\u3001")),t.relationships.length>0&&i.push("\u5173\u7CFB\uFF1A"+t.relationships.join("\u3001")),t.goals.length>0&&i.push("\u76EE\u6807\uFF1A"+t.goals.join("\u3001")),t.focusAreas.length>0&&i.push("\u5173\u6CE8\u9886\u57DF\uFF1A"+t.focusAreas.join("\u3001")),i.length===0?"":`\u7528\u6237\u6863\u6848\uFF1A
`+i.map(function(n){return"- "+n}).join(`
`)}buildAnalysisResult(t,i,n){return Wn(t,i,n)}updateAIAnalysis(t){this.aiAnalysisView&&this.aiAnalysisView.updateAnalysis(t)}getBlockEditorDate(){if(this.blockEditorView&&this.blockEditorView.currentDate){let t=this.blockEditorView.currentDate;if(t instanceof Date&&!isNaN(t.getTime())){let i=t.getFullYear(),n=String(t.getMonth()+1).padStart(2,"0"),r=String(t.getDate()).padStart(2,"0");return`${i}-${n}-${r}`}if(typeof t=="string"&&t.match(/^\d{4}-\d{2}-\d{2}$/))return t}return null}async getCachedInsight(t){try{let i=Ye(t),n=this.app.vault.getFileByPath(i);if(!n)return null;let r=await this.app.vault.read(n);return Un(r)}catch{return null}}async readDailyDiary(t){try{let i=`Daily/${t}.md`,n=this.app.vault.getFileByPath(i);if(!n){let r=this.app.vault.getFileByPath(`${t}.md`);return r?await this.app.vault.read(r):null}return await this.app.vault.read(n)}catch{return null}}async readYesterdayDiary(t){let i=new Date(t);for(let n=1;n<=7;n++){let r=new Date(i);r.setDate(r.getDate()-n);let a=r.getFullYear(),s=String(r.getMonth()+1).padStart(2,"0"),o=String(r.getDate()).padStart(2,"0"),l=`${a}-${s}-${o}`,c=await this.readDailyDiary(l);if(c)return c}return""}async hasMinimumBlocks(t){let i=await this.readDailyDiary(t);return i?Dt(i).length>=5:!1}async generateDailyInsight(t,i){let n=await this.readDailyDiary(t);if(!n)throw new Error("\u627E\u4E0D\u5230\u4ECA\u5929\u7684\u65E5\u8BB0\u6587\u4EF6");let r=await this.readYesterdayDiary(t),a=this.getUserProfileContext(),s=ri(this.entityIndex.entries),o=ni({todayBlocks:n,yesterdayBlocks:r,profileContext:a,entityIndexSummary:s}),l=this.getAIProvider().getProviderForContext("analysis");if(!l)throw new Error("\u8BF7\u5148\u5728\u8BBE\u7F6E\u4E2D\u914D\u7F6E AI Provider");let c={provider:l.providerType||"openai",apiKey:l.apiKey,model:l.model,baseUrl:l.baseUrl,enableThinking:l.enableThinking,reasoningEffort:l.reasoningEffort},u="",d=null;if(await qe(o,c,{onDelta:g=>{u+=g,i.onDelta(g)},onDone:g=>{},onError:g=>{d=g,i.onError(g)}}),d)throw d;if(!u)throw new Error("LLM \u8FD4\u56DE\u4E86\u7A7A\u5185\u5BB9");let f=await De(n,r),p=Dt(n),h={date:t,content:u,contentHash:f,generatedAt:new Date().toISOString(),blockCount:p.length};return await Yn(this.app,h),i.onDone(u),h}};function Wn(e,t,i,n){let r=[],a=[],s=[],o={people:r,objects:a,dimensions:s},l={person:"people",object:"objects",theme:"dimensions"},c=[];for(let u of e){let d=l[u.type],f=i.indexOf(u.name),p=u.name;if(f>=0){let h=Math.max(0,f-20),g=Math.min(i.length,f+u.name.length+30),y=i.slice(h,g);h>0&&(y="..."+y),g<i.length&&(y+="..."),p=y}o[d].push({type:u.type,name:u.name,confidence:u.confidence??.5,context:p,isArchived:!!u.existingCardId,newEntity:u.isNew,maturity:u.maturity,priorityScore:u.priorityScore,clarificationQuestions:u.clarificationQuestions}),u.isNew&&c.push(u.name)}return{blockId:t,timestamp:new Date().toISOString(),category:c.length>0?"\u5F85\u786E\u8BA4":n||"\u5DE5\u4F5C",areas:n?[n]:[],entities:{people:r,objects:a,dimensions:s},needsConfirmation:c,aiResponse:So(e)}}function So(e){let t=[];for(let i of e)i.clarificationQuestions.length>0&&t.push(`\u5173\u4E8E ${i.name}\uFF1A${i.clarificationQuestions[0]}`);return t.length===0?`\u68C0\u6D4B\u5230\u4EE5\u4E0B\u5B9E\u4F53\uFF1A${e.map(n=>n.name).join("\u3001")}\u3002`:t.join(`
`)}var Lt=class{constructor(t,i){this.app=t;this.plugin=i}app;plugin;findEntity(t){let i=Dn(this.plugin.entityIndex,t);return i.find(r=>r.name.toLowerCase()===t.toLowerCase())||i[0]||null}getEntity(t){return this.plugin.entityIndex.entries.find(i=>i.id===t)||null}async createEntity(t){let i=Io(t.type),n=t.aliases||[],r=Ct.create({name:t.title,cardType:i,attributes:t.metadata||{},aliases:n});t.interactions&&Array.isArray(t.interactions)&&(r.attributes.interactions=t.interactions);let{path:a}=Cn({title:t.title,type:t.type});await O(this.app,a);let s=this.app.vault.getFileByPath(a);if(s){let c=await this.app.vault.read(s),u=Y(c,a);return this.plugin.entityIndex=Z(this.plugin.entityIndex,u),await this.plugin.persistEntityIndex(),{...t,id:u.id}}let o=J(r);await this.app.vault.create(a,o);let l=Y(o,a);return this.plugin.entityIndex=Z(this.plugin.entityIndex,l),await this.plugin.persistEntityIndex(),{...t,id:l.id}}async updateEntity(t,i){let n=this.getEntity(t);if(!n)return;let r=this.app.vault.getFileByPath(n.filePath);if(!r)return;let a=await this.app.vault.read(r),s=oe(a);for(let[c,u]of Object.entries(i))c==="lastUpdated"?s.lastUpdated=u:c==="interactions"?s.attributes.interactions=u:c==="aliases"&&Array.isArray(u)?s.aliases=u:s.attributes[c]=u;s.lastUpdated=i.lastUpdated||new Date().toISOString();let o=J(s);await this.app.vault.modify(r,o);let l=Y(o,n.filePath);this.plugin.entityIndex=Z(this.plugin.entityIndex,l),await this.plugin.persistEntityIndex()}wikifyContent(t){let i=t;i=i.replace(/\[\[(Person|Object|Theme)\/(?:\[\[(?:Person|Object|Theme)\/[^\]]+\]\])\|([^\]]+)\]\]/g,"[[$1/$2|$2]]");let r=[...this.plugin.entityIndex.entries].sort((s,o)=>o.name.length-s.name.length),a=[];for(let s of r){let o=s.cardType==="person"?"Person":s.cardType==="object"?"Object":"Theme";s.name.length>=2&&a.push({term:s.name,name:s.name,folder:o});for(let l of s.aliases||[])l.length>=2&&a.push({term:l,name:s.name,folder:o})}a.sort((s,o)=>o.term.length-s.term.length);for(let s of a){let o=s.term.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");if(!new RegExp("(?<!\\[\\[)"+o+"(?!\\]\\|)").test(i))continue;let l="[["+s.folder+"/"+s.name+"|"+s.term+"]]",c=new RegExp("(?<!\\[\\[)"+o+"(?!\\]\\|)","g");i=i.replace(c,l)}return i}async refreshWikilinks(t){let i=this.getEntity(t);if(!i)return;let n=this.app.vault.getFileByPath(i.filePath);if(!n)return;let r=await this.app.vault.read(n),a=oe(r),s=a.attributes.interactions||[],o=!1;for(let l of s)if(l.content&&typeof l.content=="string"){let c=this.wikifyContent(l.content);c!==l.content&&(l.content=c,o=!0)}if(o){a.attributes.interactions=s;let l=J(a);await this.app.vault.modify(n,l);let c=Y(l,i.filePath);this.plugin.entityIndex=Z(this.plugin.entityIndex,c),await this.plugin.persistEntityIndex()}}async addInteraction(t,i){let n=this.getEntity(t);if(!n)return;let r=this.app.vault.getFileByPath(n.filePath);if(!r)return;let a=await this.app.vault.read(r),s=oe(a),o=s.attributes.interactions||[];o.push(i),s.attributes.interactions=o,s.lastUpdated=new Date().toISOString();let l=J(s);await this.app.vault.modify(r,l);let c=Y(l,n.filePath);this.plugin.entityIndex=Z(this.plugin.entityIndex,c),await this.plugin.persistEntityIndex()}async linkRelatedEntities(t){if(!(t.length<2)){for(let i of t){let n=this.findEntity(i.name);if(!n)continue;let r=this.app.vault.getFileByPath(n.filePath);if(!r)continue;let a=await this.app.vault.read(r),s=oe(a);for(let c of t)c.name!==i.name&&(c.type==="person"?s.relatedPeople.includes(c.name)||s.relatedPeople.push(c.name):c.type==="object"?s.relatedObjects.includes(c.name)||s.relatedObjects.push(c.name):c.type==="theme"&&(s.relatedThemes.includes(c.name)||s.relatedThemes.push(c.name)));let o=J(s);await this.app.vault.modify(r,o);let l=Y(o,n.filePath);this.plugin.entityIndex=Z(this.plugin.entityIndex,l)}await this.plugin.persistEntityIndex()}}async enrichEntity(t,i){return i}buildEntityIndex(){let t=new Map;for(let i of this.plugin.entityIndex.entries)t.set(i.id,new Set([i.name,...i.aliases]));return t}},_t=class{constructor(t){this.app=t}app;cache=new Map;chatSession={blockId:"chat:global",messages:[],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};async initialize(){try{let t=await this.app.vault.adapter.list("TraceMind/sessions/");for(let i of t.files)if(i.endsWith(".json")){let n=await this.app.vault.adapter.read(i),r=Nn(n);this.cache.set(r.blockId,this.toViewSession(r))}}catch{}}getSession(t,i){return this.cache.get(t)||null}getOrCreateSession(t,i){let n=this.cache.get(t);if(n)return n;let r={blockId:t,content:"",messages:[],analysisResult:null,reviewCards:{},createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),currentPhase:"detection"};return this.cache.set(t,r),r}setContent(t,i,n){let r=this.getOrCreateSession(t,n);r.content=i,r.updatedAt=new Date().toISOString(),this.writeSession(t,r)}setSession(t,i,n){let r=this.getOrCreateSession(t,n),a={...r,...i,blockId:t,updatedAt:new Date().toISOString(),analysisResult:i.analysisResult??r.analysisResult};return this.cache.set(t,a),this.writeSession(t,a),a}setAnalysisResult(t,i,n){let r=this.getOrCreateSession(t,n);r.analysisResult=i,r.updatedAt=new Date().toISOString(),r.currentPhase="complete",this.cache.set(t,r),this.writeSession(t,r)}addMessage(t,i,n){let r=this.getOrCreateSession(t,n);r.messages.push(i),r.updatedAt=new Date().toISOString(),this.cache.set(t,r),this.writeSession(t,r)}addChatMessage(t){this.chatSession.messages.push(t),this.chatSession.updatedAt=new Date().toISOString()}getChatSession(){return this.chatSession}clearChatSession(){this.chatSession={blockId:"chat:global",messages:[],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}}async clearSession(t){this.cache.delete(t);try{let i=this.app.vault.getFileByPath(It(t));i&&await this.app.vault.delete(i)}catch{}}updateReviewCard(t,i,n,r){let a=this.getOrCreateSession(t,r);a.reviewCards||(a.reviewCards={}),a.reviewCards[i]={status:n.status||"pending",supplement:n.supplement,updatedAt:new Date().toISOString()},a.updatedAt=new Date().toISOString(),this.cache.set(t,a),this.writeSession(t,a)}writeSession(t,i){try{let n=It(t),r={blockId:i.blockId,content:i.content,messages:i.messages,createdAt:i.createdAt,updatedAt:i.updatedAt,currentPhase:i.currentPhase};i.analysisResult&&(r.analysisResult=i.analysisResult);let a=JSON.stringify(r,null,2),s=this.app.vault.getFileByPath(n);s?this.app.vault.modify(s,a):this.app.vault.create(n,a)}catch(n){console.error("TraceMind: failed to write session",n)}}toViewSession(t){return{blockId:t.blockId,content:t.content,messages:t.messages,analysisResult:t.analysisResult??null,reviewCards:t.reviewCards??{},createdAt:t.createdAt,updatedAt:t.updatedAt,currentPhase:t.currentPhase||"detection"}}},Rt=class{constructor(t){this.plugin=t}plugin;isReady(){let{settings:t}=this.plugin;if(!t.defaultProviderId)return!1;let i=t.providers.find(n=>n.id===t.defaultProviderId);return!!i&&!!i.apiKey&&!!i.baseUrl}async chat(t,i){let n=this.getProviderForContext(i??"chat");if(!n)throw new Error("No AI provider configured");let{chat:r}=await Promise.resolve().then(()=>(H(),Qe));return{content:(await r(t.map(s=>({role:s.role,content:s.content})),{provider:n.providerType||"openai",apiKey:n.apiKey,model:n.model,baseUrl:n.baseUrl,enableThinking:n.enableThinking,reasoningEffort:n.reasoningEffort})).content,usage:{promptTokens:0,completionTokens:0,totalTokens:0}}}async streamChat(t,i,n){let r=this.getProviderForContext(n??"chat");if(!r){i.onError(new Error("No AI provider configured"));return}let{streamChat:a}=await Promise.resolve().then(()=>(H(),Qe));await a(t.map(s=>({role:s.role,content:s.content})),{provider:r.providerType||"openai",apiKey:r.apiKey,model:r.model,baseUrl:r.baseUrl,enableThinking:r.enableThinking,reasoningEffort:r.reasoningEffort},i)}async analyzeBlock(t,i="",n){let r=new Map;for(let c of this.plugin.entityIndex.entries)r.set(c.id,{name:c.name,cardType:c.type,maturity:c.maturity||"L0"});console.log("[TraceMind] analyzeBlock: loaded",r.size,"existing cards from index");let a=this.getProviderForContext("analysis");if(!a)return console.warn("[TraceMind] analyzeBlock: no AI provider configured, cannot extract entities"),new R.Notice("\u8BF7\u5148\u5728\u8BBE\u7F6E\u4E2D\u914D\u7F6E AI Provider"),{entities:[],newEntities:[],existingEntities:[],hasClarifications:!1,gapCount:0};console.log("[TraceMind] analyzeBlock: using LLM extraction, provider:",a.name);let s=this.plugin.getUserProfileContext(),o=await ke.analyzeBlockAsync(t,r,{apiKey:a.apiKey||"",model:a.model||"gpt-4",baseUrl:a.baseUrl||"",provider:a.providerType,enableThinking:a.enableThinking,reasoningEffort:a.reasoningEffort,profileContext:s||void 0},this.plugin.entityIndex.entries,n);console.log("[TraceMind] analyzeBlock result entities:",o.entities.length,o);let l=Wn(o.entities,i,t,o.domainCategory);return{...l,analysisResult:l}}getProviderForContext(t){let{settings:i}=this.plugin,n=i.agentProviderMapping,r=t==="analysis"?n.analysis:n.chat;if(r){let a=i.providers.find(s=>s.id===r);if(a)return a}return this.getDefaultProvider()}getDefaultProvider(){let{settings:t}=this.plugin;return t.defaultProviderId&&t.providers.find(i=>i.id===t.defaultProviderId)||null}};function Io(e){return e==="person"?"person":e==="object"?"object":e==="theme"?"theme":e==="project"||e==="thing"?"object":e==="idea"||e==="knowledge"?"theme":"object"}var Mo=Ke;0&&(module.exports={TraceMindPlugin});
/*! Bundled license information:

js-yaml/dist/js-yaml.mjs:
  (*! js-yaml 4.1.1 https://github.com/nodeca/js-yaml @license MIT *)
*/
