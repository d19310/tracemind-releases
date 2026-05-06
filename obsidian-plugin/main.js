"use strict";var an=Object.create;var pe=Object.defineProperty;var sn=Object.getOwnPropertyDescriptor;var on=Object.getOwnPropertyNames;var ln=Object.getPrototypeOf,cn=Object.prototype.hasOwnProperty;var he=(e,t)=>()=>(e&&(t=e(e=0)),t);var J=(e,t)=>{for(var i in t)pe(e,i,{get:t[i],enumerable:!0})},xt=(e,t,i,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of on(t))!cn.call(e,r)&&r!==i&&pe(e,r,{get:()=>t[r],enumerable:!(n=sn(t,r))||n.enumerable});return e};var un=(e,t,i)=>(i=e!=null?an(ln(e)):{},xt(t||!e||!e.__esModule?pe(i,"default",{value:e,enumerable:!0}):i,e)),dn=e=>xt(pe({},"__esModule",{value:!0}),e);var Oe={};J(Oe,{buildRequest:()=>_e,chat:()=>fe,extractStreamDelta:()=>Le,parseResponse:()=>vt,streamChat:()=>Re,validateConfig:()=>pn});function pn(e){return e.provider?!e.apiKey||e.apiKey.trim()===""?{valid:!1,error:"apiKey is required"}:!e.model||e.model.trim()===""?{valid:!1,error:"model is required"}:{valid:!0}:{valid:!1,error:"provider is required"}}function _e(e,t){let i=t.find(r=>r.role==="system"),n=t.filter(r=>r.role!=="system");switch(e.provider){case"openai":{let r=(e.baseUrl||"https://api.openai.com").replace(/\/+$/,""),s=r.endsWith("/v1")?"/chat/completions":"/v1/chat/completions";return{url:`${r}${s}`,method:"POST",headers:{Authorization:`Bearer ${e.apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({model:e.model,messages:t})}}case"anthropic":return{url:e.baseUrl||"https://api.anthropic.com/v1/messages",method:"POST",headers:{"x-api-key":e.apiKey,"anthropic-version":"2023-06-01","Content-Type":"application/json"},body:JSON.stringify({model:e.model,system:i?.content,messages:n.map(r=>({role:r.role,content:r.content}))})};default:{let s=(e.baseUrl||(e.provider==="ollama"?"http://localhost:11434":"")).replace(/\/+$/,""),a=s.endsWith("/v1")?"/chat/completions":"/v1/chat/completions";return{url:`${s}${a}`,method:"POST",headers:{"Content-Type":"application/json",...e.apiKey?{Authorization:`Bearer ${e.apiKey}`}:{}},body:JSON.stringify({model:e.model,messages:t})}}}}async function fe(e,t){let i=_e(t,e),n=await fetch(i.url,{method:i.method||"POST",headers:i.headers,body:i.body});if(!n.ok){let a=await n.text();throw new Error(`HTTP ${n.status}: ${a}`)}let r=await n.json();return{content:vt(t.provider,r).content}}function Le(e,t){if(!t.startsWith("data: "))return"";let i=t.slice(6).trim();if(!i||i==="[DONE]")return"";try{let n=JSON.parse(i);if(e==="anthropic")return n.type==="content_block_delta"&&n.delta?.text?n.delta.text:"";let r=n.choices;return r&&r.length>0&&r[0].delta?.content?r[0].delta.content:""}catch{return""}}async function Re(e,t,i){try{let n=_e(t,e),r=JSON.parse(n.body||"{}");r.stream=!0;let s={...n.headers,Accept:"text/event-stream"},a=await fetch(n.url,{method:n.method||"POST",headers:s,body:JSON.stringify(r)});if(!a.ok){let d=await a.text();throw new Error(`HTTP ${a.status}: ${d}`)}if(!a.body)throw new Error("Response body is null \u2014 streaming not supported");let o=a.body.getReader(),l=new TextDecoder,c="",u="";for(;;){let{done:d,value:h}=await o.read();if(d)break;u+=l.decode(h,{stream:!0});let p=u.split(`
`);u=p.pop()||"";for(let f of p){let g=f.trim();if(!g)continue;let m=Le(t.provider,g);m&&(c+=m,i.onDelta(m))}}if(u.trim()){let d=Le(t.provider,u.trim());d&&(c+=d,i.onDelta(d))}i.onDone(c)}catch(n){i.onError(n)}}function vt(e,t){switch(e){case"openai":{let i=t.choices;if(!i||i.length===0)throw new Error("Empty response from OpenAI");return{role:"assistant",content:i[0].message.content}}case"anthropic":{let i=t.content;if(!i||i.length===0)throw new Error("Empty response from Anthropic");return{role:"assistant",content:i[0].text}}default:{let i=t.choices;if(!i||i.length===0)throw new Error("Empty response from AI provider");return{role:"assistant",content:i[0].message.content}}}}var V=he(()=>{"use strict"});var Ne={};J(Ne,{resolveExecutable:()=>N});async function N(e){let{execSync:t}=require("child_process"),{homedir:i}=require("os"),n=i(),r=[`${n}/.local/bin/${e}`,`${n}/.npm-global/bin/${e}`,`/usr/local/bin/${e}`,`/opt/homebrew/bin/${e}`,e];for(let s of r)try{return t(`"${s}" --version 2>&1`,{encoding:"utf-8",timeout:5e3}),s}catch{continue}return null}var X=he(()=>{"use strict"});var It={};J(It,{hermesProvider:()=>wn});var vn,En,Mt,bn,wn,Bt=he(()=>{"use strict";X();({spawn:vn}=require("child_process")),En=require("readline"),Mt="hermes",bn=600*1e3,wn={name:"Hermes",description:"\u5F00\u6E90 AI agent \u6846\u67B6\uFF0C\u652F\u6301\u591A provider\uFF0C\u901A\u8FC7 hermes CLI \u8C03\u7528",async detect(){let e=await N(Mt);if(!e)return!1;try{let{execSync:t}=require("child_process"),i=t(`${e} --version 2>&1`,{encoding:"utf-8",timeout:1e4});return/Hermes Agent/i.test(i)}catch{return!1}},execute(e,t){let i=null,n=!1,r=null,s=null,a=null,o=Date.now();return(async()=>{try{let c=await N(Mt);if(!c){let m=new Error("\u627E\u4E0D\u5230 hermes CLI\uFF0C\u8BF7\u786E\u8BA4\u5DF2\u5B89\u88C5 Hermes Agent");a?.(m),s?.({status:"failed",output:"",error:m.message,durationMs:Date.now()-o});return}let u=["-z",e];t?.model&&u.unshift("-m",t.model);let d={...process.env,...t?.env};if(i=vn(c,u,{env:d,cwd:t?.cwd||process.cwd(),stdio:["ignore","pipe","pipe"]}),n){i.kill();return}i.on("error",m=>{a?.(m),s?.({status:"failed",output:"",error:m.message,durationMs:Date.now()-o})});let h=setTimeout(()=>{i&&!i.killed&&(i.kill(),s?.({status:"timeout",output:"",error:"\u6267\u884C\u8D85\u65F6",durationMs:Date.now()-o}))},t?.timeoutMs||bn),p="",f=En.createInterface({input:i.stdout,crlfDelay:1/0});f.on("line",m=>{p+=m+`
`,r?.({type:"text",content:m+`
`})}),f.on("close",()=>{clearTimeout(h),s?.({status:"completed",output:p.trim(),durationMs:Date.now()-o})});let g="";i.stderr&&i.stderr.on("data",m=>{g+=m.toString()}),i.on("close",m=>{clearTimeout(h),m!==0&&p===""&&s?.({status:"failed",output:"",error:`hermes \u9000\u51FA\u7801 ${m}: ${g.slice(0,500)}`,durationMs:Date.now()-o})})}catch(c){a?.(c),s?.({status:"failed",output:"",error:c.message,durationMs:Date.now()-o})}})(),{set onMessage(c){r=c},get onMessage(){return r},set onDone(c){s=c},get onDone(){return s},set onError(c){a=c},get onError(){return a},abort(){n=!0,i&&!i.killed&&i.kill()}}}}});var Pt={};J(Pt,{claudeCodeProvider:()=>Tn});var kn,Cn,Dt,An,Tn,Lt=he(()=>{"use strict";X();({spawn:kn}=require("child_process")),Cn=require("readline"),Dt="claude",An=600*1e3,Tn={name:"Claude Code",description:"Anthropic \u51FA\u54C1\u7684\u672C\u5730 AI \u7F16\u7A0B agent\uFF0C\u901A\u8FC7 claude CLI \u8C03\u7528",async detect(){let e=await N(Dt);if(!e)return!1;try{let{execSync:t}=await import("node:child_process"),i=t(`${e} --version 2>&1`,{encoding:"utf-8",timeout:1e4});return/[Cc]laude|[0-9]+\.[0-9]+\.[0-9]+/.test(i)}catch{return!1}},execute(e,t){let i=null,n=!1,r=null,s=null,a=null,o=Date.now(),l=t?.timeoutMs||An;return(async()=>{try{let u=await N(Dt);if(!u){let x=new Error("\u627E\u4E0D\u5230 claude CLI\uFF0C\u8BF7\u786E\u8BA4\u5DF2\u5B89\u88C5 Claude Code");a?.(x),s?.({status:"failed",output:"",error:x.message,durationMs:Date.now()-o});return}let d=["-p","--output-format","stream-json","--input-format","stream-json","--verbose"];t?.model&&d.push("--model",t.model);let h={...process.env};if(t?.env&&Object.assign(h,t.env),i=kn(u,d,{env:h,cwd:t?.cwd||process.cwd(),stdio:["pipe","pipe","pipe"]}),n){i.kill();return}i.on("error",x=>{a?.(x),s?.({status:"failed",output:"",error:x.message,durationMs:Date.now()-o})});let p=setTimeout(()=>{i&&!i.killed&&(i.kill(),s?.({status:"timeout",output:"",error:"\u6267\u884C\u8D85\u65F6",durationMs:Date.now()-o}))},l),f=Cn.createInterface({input:i.stdout,crlfDelay:1/0}),g="",m="";f.on("line",x=>{if(x.trim())try{let M=JSON.parse(x);switch(M.type){case"system":M.session_id&&(g=M.session_id),M.subtype==="init"&&r?.({type:"status",content:"running",sessionId:g});break;case"assistant":{let Pe=M.message?.content||[];for(let S of Pe)S.type==="text"&&S.text?(m+=S.text,r?.({type:"text",content:S.text})):S.type==="tool_use"&&r?.({type:"tool-use",toolName:S.name,toolInput:S.input});break}case"user":{let Pe=M.message?.content||[];for(let S of Pe)S.type==="tool_use"&&S.name&&r?.({type:"tool-result",toolName:S.name});break}case"result":clearTimeout(p);let yt=M.is_error||M.subtype==="error_during_execution",rn=M.output||m;s?.({status:yt?"failed":"completed",output:rn,error:yt?M.output||"\u672A\u77E5\u9519\u8BEF":void 0,durationMs:Date.now()-o});break}}catch{}}),f.on("close",()=>{clearTimeout(p),n||s?.({status:"completed",output:m,durationMs:Date.now()-o})});let v=JSON.stringify({type:"user",message:{role:"user",content:e}});i.stdin.write(v+`
`),i.stdin.end()}catch(u){a?.(u),s?.({status:"failed",output:"",error:u.message,durationMs:Date.now()-o})}})(),{set onMessage(u){r=u},get onMessage(){return r},set onDone(u){s=u},get onDone(){return s},set onError(u){a=u},get onError(){return a},abort(){n=!0,i&&!i.killed&&i.kill()}}}}});var Is={};J(Is,{TraceMindPlugin:()=>De,default:()=>Ms});module.exports=dn(Is);var B=require("obsidian");var b=require("obsidian");V();V();var ge=class extends b.PluginSettingTab{plugin;constructor(t,i){super(t,i),this.plugin=i}display(){let{containerEl:t}=this;t.empty(),t.createEl("h2",{text:"TraceMind \u8BBE\u7F6E"}),t.createEl("h3",{text:"AI Provider"});let i="",n="",r="",s="",a=!1,o="";new b.Setting(t).setName("\u540D\u79F0").setDesc("Provider \u663E\u793A\u540D\u79F0").addText(h=>{h.setPlaceholder("My GPT-4").onChange(p=>{i=p})}),new b.Setting(t).setName("\u6A21\u578B").setDesc("\u6A21\u578B\u540D\u79F0\uFF0C\u5982 gpt-4\u3001qwen-plus").addText(h=>{h.setPlaceholder("gpt-4").onChange(p=>{n=p})}),new b.Setting(t).setName("Base URL").setDesc("OpenAI \u517C\u5BB9 API \u5730\u5740").addText(h=>{h.setPlaceholder("https://api.openai.com/v1").onChange(p=>{r=p})}),new b.Setting(t).setName("API Key").setDesc("API \u5BC6\u94A5").addText(h=>{h.setPlaceholder("").onChange(p=>{s=p}),h.inputEl.type="password"}),new b.Setting(t).setName("\u601D\u8003\u6A21\u5F0F").setDesc('\u5F00\u542F\u540E\u8BF7\u6C42\u4F53\u5E26\u4E0A {"thinking":{"type":"enabled"}}').addToggle(h=>{h.setValue(a).onChange(p=>{a=p})}),new b.Setting(t).setName("Reasoning Effort").setDesc("\u90E8\u5206\u6A21\u578B\u652F\u6301 high \u6216 max").addDropdown(h=>{h.addOption("","\u9ED8\u8BA4").addOption("high","high").addOption("max","max").setValue(o).onChange(p=>{o=p})}),new b.Setting(t).addButton(h=>{h.setButtonText("\u6DFB\u52A0 Provider"),h.setCta(),h.onClick(async()=>{if(!i||!n||!r){new b.Notice("\u8BF7\u586B\u5199\u540D\u79F0\u3001\u6A21\u578B\u548C Base URL");return}let p=`provider-${Date.now()}`;this.plugin.settings.providers.push({id:p,name:i,model:n,baseUrl:r,apiKey:s,enableThinking:a,reasoningEffort:o}),await this.plugin.saveSettings(),this.display(),new b.Notice("Provider \u5DF2\u6DFB\u52A0")})});for(let h=0;h<this.plugin.settings.providers.length;h++){let p=this.plugin.settings.providers[h],f=this.plugin.settings.defaultProviderId===p.id,g=new b.Setting(t).setName(`${p.name}${f?" (\u9ED8\u8BA4)":""}`).setDesc(`${p.baseUrl} / ${p.model}${p.enableThinking?" / thinking:on":""}${p.reasoningEffort?` / reasoning:${p.reasoningEffort}`:""}`);g.addToggle(m=>{m.setTooltip("\u8BBE\u4E3A\u9ED8\u8BA4").setValue(f).onChange(async v=>{v&&(this.plugin.settings.defaultProviderId=p.id),await this.plugin.saveSettings(),this.display()})}),g.addToggle(m=>{m.setTooltip("\u601D\u8003\u6A21\u5F0F").setValue(p.enableThinking??!1).onChange(async v=>{p.enableThinking=v,await this.plugin.saveSettings()})}),g.addDropdown(m=>{m.addOption("","\u9ED8\u8BA4").addOption("high","high").addOption("max","max").setValue(p.reasoningEffort||"").onChange(async v=>{p.reasoningEffort=v,await this.plugin.saveSettings()})}),g.addButton(m=>{m.setButtonText("\u6D4B\u8BD5"),m.onClick(async()=>{new b.Notice("\u6B63\u5728\u6D4B\u8BD5...");try{let v=await fe([{role:"user",content:"\u4F60\u597D"}],{provider:p.baseUrl?.includes("anthropic.com")?"anthropic":"openai",apiKey:p.apiKey,model:p.model,baseUrl:p.baseUrl});new b.Notice("\u8FDE\u63A5\u6210\u529F: "+v.content.substring(0,50))}catch(v){new b.Notice("\u8FDE\u63A5\u5931\u8D25: "+v.message)}})}),g.addButton(m=>{m.setButtonText("\u5220\u9664"),m.onClick(async()=>{this.plugin.settings.providers.splice(h,1),this.plugin.settings.defaultProviderId===p.id&&(this.plugin.settings.defaultProviderId=this.plugin.settings.providers[0]?.id||"");let v=this.plugin.settings.agentProviderMapping;v.analysis===p.id&&(v.analysis=""),v.chat===p.id&&(v.chat=""),await this.plugin.saveSettings(),this.display()})})}this.plugin.settings.providers.length===0&&t.createEl("p",{text:"\u6682\u65E0 Provider\uFF0C\u8BF7\u6DFB\u52A0\u4E00\u4E2A",cls:"lifewiki-no-providers"}),t.createEl("h3",{text:"Agent \u914D\u7F6E"});let l=this.plugin.settings.agentProviderMapping,c={};for(let h of this.plugin.settings.providers)c[h.id]=h.name;new b.Setting(t).setName("AI \u5206\u6790").setDesc("\u65E5\u8BB0\u5206\u6790\u4F7F\u7528\u7684 AI Provider").addDropdown(h=>{h.addOption("","\u4F7F\u7528\u9ED8\u8BA4 Provider");for(let[p,f]of Object.entries(c))h.addOption(p,f);h.setValue(l.analysis).onChange(async p=>{this.plugin.settings.agentProviderMapping.analysis=p,await this.plugin.saveSettings()})}),new b.Setting(t).setName("AI \u804A\u5929").setDesc("\u804A\u5929\u4F7F\u7528\u7684 AI Provider").addDropdown(h=>{h.addOption("","\u4F7F\u7528\u9ED8\u8BA4 Provider");for(let[p,f]of Object.entries(c))h.addOption(p,f);h.setValue(l.chat).onChange(async p=>{this.plugin.settings.agentProviderMapping.chat=p,await this.plugin.saveSettings()})}),t.createEl("h3",{text:"\u672C\u5730 Agent"}),t.createEl("p",{text:"\u542F\u7528\u540E\uFF0C\u5728\u804A\u5929\u6A21\u5F0F\u7684\u8F93\u5165\u6846\u5DE6\u4FA7\u53EF\u9009\u62E9\u672C\u5730\u5B89\u88C5\u7684 AI agent CLI\uFF08Claude Code\u3001Hermes \u7B49\uFF09\u3002",cls:"setting-item-description"});let u=t.createEl("div",{cls:"tracemind-agent-status"});new b.Setting(t).setName("\u542F\u7528\u672C\u5730 Agent").setDesc("\u5F00\u542F\u540E\u7CFB\u7EDF\u5C06\u68C0\u6D4B\u672C\u673A\u5B89\u88C5\u7684 agent CLI\uFF0C\u5E76\u5728\u804A\u5929\u8F93\u5165\u6846\u5DE6\u4FA7\u63D0\u4F9B\u9009\u62E9\u5668").addToggle(h=>{h.setValue(this.plugin.settings.localAgentEnabled).onChange(async p=>{this.plugin.settings.localAgentEnabled=p,await this.plugin.saveSettings(),p?this.detectAndShowAgents(u):u.empty()})}),this.plugin.settings.localAgentEnabled&&this.detectAndShowAgents(u);let d=document.createElement("style");d.textContent=`
			.tracemind-agent-status { margin: 0 0 16px 0; display: flex; flex-direction: column; gap: 6px; }
			.tracemind-agent-row { display: flex; align-items: center; gap: 8px; font-size: 13px; }
			.tracemind-agent-dot { font-size: 12px; }
			.tracemind-agent-label { color: var(--text-muted); }
			.tracemind-agent-dot.available + .tracemind-agent-label { color: var(--text-normal); }
		`,t.appendChild(d)}async detectAndShowAgents(t){t.empty();let{resolveExecutable:i}=await Promise.resolve().then(()=>(X(),Ne)),n=[{key:"claude-code",name:"Claude Code",binary:"claude"},{key:"hermes",name:"Hermes",binary:"hermes"}];for(let r of n){let s=t.createEl("div",{cls:"tracemind-agent-row"}),o=!!await i(r.binary);s.createEl("span",{cls:`tracemind-agent-dot ${o?"available":"unavailable"}`}).setText(o?"\u{1F7E2}":"\u{1F534}"),s.createEl("span",{text:`${r.name} ${o?"\u2014 \u5DF2\u68C0\u6D4B\u5230":"\u2014 \u672A\u68C0\u6D4B\u5230\uFF0C\u8BF7\u786E\u8BA4\u5DF2\u5B89\u88C5"}`,cls:"tracemind-agent-label"})}}};var Et={providers:[],defaultProviderId:"",agentProviderMapping:{analysis:"",chat:""},localAgentEnabled:!1};var E=require("obsidian");var $e=require("obsidian"),hn=".lifewiki/templates";async function fn(e,t){let i=`templates/${t}`,n=e.getAbstractFileByPath(i);if(n instanceof $e.TFile)return await e.read(n);let r=`${hn}/${t}`;return n=e.getAbstractFileByPath(r),n instanceof $e.TFile?await e.read(n):null}function Z(e,t){return t.split(".").reduce((i,n)=>i?.[n],e)}function gn(e,t){let i=e,n=/\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;i=i.replace(n,(s,a,o)=>{if(!Z(t,a.trim())){let u=o.split(/\{\{else\}\}/);return u.length>1?u[1].trim():""}return o.split(/\{\{else\}\}/)[0].trim()});let r=/\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g;return i=i.replace(r,(s,a,o)=>{let l=Z(t,a.trim());return!Array.isArray(l)||l.length===0?"":l.map(c=>{let u=o;return u=u.replace(/\{\{this\.([^}]+)\}\}/g,(d,h)=>Z(c,h.trim())??""),u=u.replace(/\{\{([^#\/][^}]*?)\}\}/g,(d,h)=>{let p=h.trim();return p==="this"?String(c):Z(c,p)??""}),(typeof c=="string"||typeof c=="number")&&(u=u.replace(/\{\{this\}\}/g,String(c))),u}).join("")}),i}function mn(e,t){let i=e,n=/\{\{([^#\/][^}]*?)\}\}/g;return i=i.replace(n,(r,s)=>{let a=s.trim(),o=Z(t,a);return o==null?"":typeof o=="object"?JSON.stringify(o):String(o)}),i}async function bt(e,t,i){let n=await fn(e,t);n===null&&(console.warn(`[TemplateLoader] Template not found: ${t}, falling back to default`),n=yn(t,i));let r=gn(n,i);return r=mn(r,i),r}function yn(e,t){switch(e.replace("-template.md","")){case"journal":return`# ${t.date||"Untitled"}

> [!NOTE] \u65E5\u8BB0\u662FAI\u65F6\u4EE3\u4EBA\u751F\u6700\u5927\u7684\u590D\u5229

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
`;default:return"{{content}}"}}var D="tracemind-block-editor",ee="Daily";function je(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,e=>{let t=Math.random()*16|0;return(e==="x"?t:t&3|8).toString(16)})}function He(e){let t=0;for(let n=0;n<e.length;n++){let r=e.charCodeAt(n);t=(t<<5)-t+r,t=t&t}let i=Math.abs(t).toString(16).padStart(8,"0");return`${i.substring(0,8)}-${i.substring(0,4)}-4${i.substring(0,3)}-${i.substring(0,4)}-${i.substring(0,12)}`}function ye(e){let t=Array.isArray(e)?e.join(" "):e||"";return Array.from(new Set(t.split(/[\s,，#]+/).map(i=>i.trim()).filter(Boolean))).slice(0,6)}function Ue(e){return ye(e).join(" ")||"\u5F85\u5206\u6790"}function me(e){return ye(e).map(t=>`#${t}`).join(" ")||"#\u5F85\u5206\u6790"}var xe=class extends E.ItemView{plugin;blocks=[];selectedBlockId=null;currentDate;inputValue="";isLoading=!1;contentContainer=null;childInputEl=null;selectedBlockContent=null;inputAreaEl=null;inputTextarea=null;inputHintEl=null;inputAppendFooterEl=null;appendModeActionsEl=null;appendSubmitBtn=null;isAppendMode=!1;appendModeBlockId=null;isEditMode=!1;editModeBlockId=null;flowLineEl=null;constructor(t,i){super(t),this.plugin=i,this.currentDate=this.formatDate(new Date)}getBlockById(t){return this.blocks.find(i=>i.id===t)}focusBlockById(t){if(this.blocks.find(n=>n.id===t))return this.selectedBlockId=t,this.isAppendMode=!1,this.appendModeBlockId=null,this.isEditMode=!1,this.editModeBlockId=null,this.renderBlocks(),this.scrollBlockIntoView(t),!0;for(let n of this.blocks)if(n.children.find(s=>s.id===t))return this.selectedBlockId=t,this.isAppendMode=!1,this.appendModeBlockId=null,this.isEditMode=!1,this.editModeBlockId=null,this.renderBlocks(),this.scrollBlockIntoView(t,!0),!0;return!1}startAppendForBlock(t,i){let n=t;if(!this.blocks.find(s=>s.id===t)){let s=this.blocks.find(a=>a.children.some(o=>o.id===t));if(!s)return!1;n=s.id}return this.selectBlock(n),this.scrollBlockIntoView(n),i&&this.inputTextarea&&(this.inputTextarea.placeholder=i,this.inputHintEl&&(this.inputHintEl.textContent=i,this.inputHintEl.removeAttribute("style")),setTimeout(()=>this.inputTextarea?.focus(),0)),!0}getViewType(){return D}getDisplayText(){return"TraceMind \u8FF9\u5FC6"}async setCurrentDate(t){this.currentDate=this.formatDate(t),await this.renderView()}async renderView(){let t=this.containerEl;t.empty();let i=t.createEl("div",{cls:"lifewiki-diary-container",attr:{style:"display: flex; flex-direction: column; height: 100%;"}});this.addStyles();let n=i.createEl("div",{cls:"lifewiki-diary-header"}),r=n.createEl("h1",{cls:"lifewiki-diary-date"});r.createEl("span",{text:"\u{1F4C5}",cls:"lifewiki-diary-date-icon"}),r.createEl("span",{text:this.currentDate}),n.createEl("span",{text:"\u8BB0\u5F55\uFF0C\u662FAI\u65F6\u4EE3\u7684\u4EBA\u751F\u590D\u5229\u3002",cls:"lifewiki-diary-tagline"}),i.createEl("h2",{text:"Flow of Today\uFF1A",cls:"lifewiki-diary-section-title"}),this.contentContainer=i.createEl("div",{cls:"lifewiki-diary-content",attr:{style:"flex: 1; overflow-y: auto;"}}),await this.loadBlocks(),this.createInputArea(i),this.contentContainer?.addEventListener("click",s=>{let a=s.target,o=a.closest(".lifewiki-block.editing, .lifewiki-block-group.editing, .lifewiki-block-child.editing"),l=a.closest(".lifewiki-block, .lifewiki-block-group, .lifewiki-block-child"),c=a.closest(".lifewiki-input-area");this.isEditMode&&!o&&this.exitEditMode(),this.isAppendMode&&!l&&!c&&this.cancelAppendMode(),!this.isAppendMode&&!this.isEditMode&&!l&&(this.selectedBlockId=null,this.plugin.getAIAnalysisView()?.clearConversation())})}async onOpen(){await this.renderView()}addStyles(){let t=document.createElement("style");t.textContent=`
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
		`,this.containerEl.appendChild(t)}createInputArea(t){this.inputAreaEl=t.createEl("div",{cls:"lifewiki-input-area"});let i=this.inputAreaEl.createEl("div",{cls:"lifewiki-input-inner"});this.inputTextarea=i.createEl("textarea",{cls:"lifewiki-input-box",attr:{placeholder:"\u8BB0\u5F55\u4ECA\u5929\u7684\u751F\u6D3B..."}});let n=i.createEl("div",{cls:"lifewiki-input-bottom"});this.inputHintEl=n.createEl("span",{cls:"lifewiki-input-hint",text:"Enter \u53D1\u9001"}),this.appendModeActionsEl=n.createEl("div",{cls:"lifewiki-append-mode-actions"}),this.appendSubmitBtn=this.appendModeActionsEl.createEl("button",{cls:"lifewiki-append-submit-btn",text:"\u5C06\u5728 HH:mm \u8FD9\u6761\u65E5\u8BB0\u4E0B\u8FFD\u52A0"}),this.appendSubmitBtn.addEventListener("click",()=>{this.submitAppend()}),this.appendModeActionsEl.createEl("button",{cls:"lifewiki-append-cancel-btn",text:"\xD7"}).addEventListener("click",()=>{this.cancelAppendMode()});let s=n.createEl("button",{cls:"lifewiki-diary-send-btn",attr:{type:"button",title:"\u53D1\u9001\u65E5\u8BB0"}});(0,E.setIcon)(s,"arrow-up"),s.addEventListener("click",a=>{a.preventDefault(),a.stopPropagation(),this.isAppendMode?this.submitAppend():this.inputTextarea&&this.submitBlock(this.inputTextarea)}),this.inputTextarea.addEventListener("focus",()=>{this.plugin.getAIAnalysisView()?.setMode("analysis"),this.isAppendMode||this.scrollToLastBlock()}),this.inputTextarea.addEventListener("input",()=>{if(!this.inputTextarea)return;this.inputValue=this.inputTextarea.value;let a=this.inputTextarea.value.length;this.inputHintEl.textContent=`${a}/250 \xB7 Enter \u53D1\u9001`}),this.inputTextarea.addEventListener("keydown",a=>{a.key==="Enter"&&(this.isAppendMode?a.shiftKey||(a.preventDefault(),this.submitAppend()):a.shiftKey||(a.preventDefault(),this.submitBlock(this.inputTextarea)))}),this.textarea=this.inputTextarea}async loadBlocks(){let t=`Daily/${this.currentDate}.md`,i=this.app.vault.getAbstractFileByPath(t);if((!i||!(i instanceof E.TFile))&&(i=this.app.vault.getAbstractFileByPath(`${this.currentDate}.md`)),(!i||!(i instanceof E.TFile))&&(i=this.app.vault.getAbstractFileByPath(`${ee}/${this.currentDate}.md`)),!i||!(i instanceof E.TFile)){this.renderEmptyState();return}let n=await this.app.vault.read(i);this.parseBlocksFromContent(n),this.renderBlocks()}renderEmptyState(){this.contentContainer&&(this.contentContainer.empty(),this.contentContainer.createEl("div",{cls:"lifewiki-empty-state",text:`\u4ECA\u5929\u7684\u65E5\u8BB0\u8FD8\u6CA1\u6709\u5F00\u59CB\u3002
\u5728\u4E0B\u65B9\u8F93\u5165\u6846\u8BB0\u5F55\u4F60\u7684\u751F\u6D3B\u5427\u3002`}))}parseBlocksFromContent(t){this.blocks=[];let i=t.split(`
`),n=null,r=[],s=[],a=null;for(let o of i){let l=o.match(/^### (\d{2}:\d{2}) \[([^\]]+)\]\s+(.+)$/);if(l&&(n&&(a&&(n.id=a),n.content=r.join(`
`).trim(),n.children=[...s],this.blocks.push(n),a=null),n={id:He(l[0]),timestamp:l[1],source:l[2],category:Ue(ye(l[3])),content:"",children:[],parentId:null},r=[],s=[]),n&&!a){let c=o.trim(),u=c.match(/^<!-- ([a-f0-9-]+) -->$/);if(u){a=u[1];continue}let d=c.match(/^<sub[^>]*>([a-f0-9-]+)<\/sub>$/i);if(d){a=d[1];continue}}if(o.startsWith("- ")&&n){let c=o.match(/^- (\d{2}:\d{2})?\s+(.+?)\s*(?:<!-- ([a-f0-9-]+) -->)?$/);if(c){let u=c[1]||"",d=(c[2]||"").replace(/<!--[\s\S]*?-->/g,"").replace(/<sub[^>]*>[\s\S]*?<\/sub>/gi,"").trim(),h=c[3]||He(o);if(d){s.push({id:h,timestamp:u,content:d,parentId:n.id});continue}}else{let u=o.substring(2).replace(/<!--[\s\S]*?-->/g,"").replace(/<sub[^>]*>[\s\S]*?<\/sub>/gi,"").trim();u&&s.push({id:He(o),timestamp:"",content:u,parentId:n.id});continue}}if(o.trim()&&n&&!o.startsWith("#")&&!o.startsWith(">")){let c=o.trim().replace(/<!--[\s\S]*?-->/g,"").replace(/<sub[^>]*>[\s\S]*?<\/sub>/gi,"").trim();c&&r.push(c)}}n&&(a&&(n.id=a),n.content=r.join(`
`).trim(),n.children=s,this.blocks.push(n))}renderBlocks(){if(this.contentContainer){if(this.contentContainer.empty(),this.flowLineEl=this.contentContainer.createEl("div",{cls:"flow-line"}),this.blocks.length===0){this.renderEmptyState();return}for(let t of this.blocks)this.renderBlock(t);this.extendFlowLine(),this.isAppendMode||setTimeout(()=>{this.scrollToLastBlock()},100)}}extendFlowLine(){!this.flowLineEl||!this.contentContainer||setTimeout(()=>{if(!this.flowLineEl||!this.contentContainer)return;let t=Array.from(this.contentContainer.querySelectorAll(".lifewiki-block, .lifewiki-block-group"));if(t.length===0)return;let i=0;for(let n of t){let r=n.offsetTop+n.offsetHeight;r>i&&(i=r)}this.flowLineEl.style.height=`${i+30}px`},50)}scrollToLastBlock(){this.contentContainer&&(this.contentContainer.scrollTop=this.contentContainer.scrollHeight)}scrollBlockIntoView(t,i=!1){setTimeout(()=>{let n=i?`[data-child-id="${t}"]`:`[data-block-id="${t}"]`;this.contentContainer?.querySelector(n)?.scrollIntoView({block:"center",behavior:"smooth"})},50)}renderBlock(t){if(!this.contentContainer)return;let i=t.id===this.selectedBlockId,n=t.id===this.editModeBlockId,r=t.children.length>0,s=r?"lifewiki-block-group":"lifewiki-block";i&&(s+=" selected"),n&&(s+=" editing");let a=this.contentContainer.createEl("div",{cls:s,attr:{"data-block-id":t.id}}),o=a.createEl("div",{cls:"lifewiki-block-card"});if(n){let l=o.createEl("div",{cls:"lifewiki-main-wrapper"});l.createEl("span",{text:t.timestamp,cls:"lifewiki-block-timestamp"});let c=l.createEl("textarea",{cls:"lifewiki-edit-textarea",attr:{placeholder:"\u8F93\u5165\u5185\u5BB9..."}});c.value=t.content,c.dataset.field="content";let u=l.createEl("input",{cls:"lifewiki-edit-input",attr:{value:t.category,placeholder:"#\u6807\u7B7E"}});u.dataset.field="category",this.editTagInput=u,this.editContentTextarea=c}else if(t.content){let l=o.createEl("span",{cls:"lifewiki-main-wrapper"});l.createEl("span",{text:t.timestamp,cls:"lifewiki-block-timestamp"}),l.createEl("span",{text:t.content,cls:"lifewiki-block-content"});let c=l.createEl("div",{cls:"lifewiki-block-tags"});for(let u of ye(t.category))c.createEl("a",{text:`#${u}`,cls:"tag lifewiki-block-tag",attr:{href:`#${u}`,"data-tag":u}})}if(r){let l=a.createEl("div",{cls:"lifewiki-block-children"});for(let c of t.children){let u=c.id===this.selectedBlockId,d=this.editingChildId===c.id,h=l.createEl("div",{cls:"lifewiki-block-child"+(u?" selected":"")+(d?" editing":""),attr:{"data-child-id":c.id}}),p=h.createEl("div",{cls:"lifewiki-block-child-card"});c.timestamp&&p.createEl("span",{text:c.timestamp,cls:"lifewiki-block-child-timestamp"});let f=p.createEl("div",{cls:"lifewiki-block-child-body"});if(d){let g=f.createEl("textarea",{cls:"lifewiki-edit-textarea",attr:{placeholder:"\u8F93\u5165\u5185\u5BB9..."}});g.value=c.content,this.editContentTextarea=g}else f.createEl("div",{text:c.content,cls:"lifewiki-block-child-content"});h.addEventListener("click",g=>{g.stopPropagation(),this.isEditMode||this.selectChildBlock(c.id,t.id)}),p.addEventListener("dblclick",g=>{g.stopPropagation(),this.startChildEditMode(c.id,t.id)}),h.addEventListener("contextmenu",g=>{g.preventDefault(),g.stopPropagation(),this.selectChildBlock(c.id,t.id),this.showContextMenu(c.id,t.id,!0,g.clientX,g.clientY)})}}i&&this.selectedBlockId===t.id&&this.childInputEl&&a.appendChild(this.childInputEl),o.addEventListener("click",()=>{this.isEditMode||this.selectBlock(t.id)}),o.addEventListener("dblclick",()=>{this.startEditMode(t.id)}),o.addEventListener("contextmenu",l=>{l.preventDefault(),l.stopPropagation(),this.selectBlock(t.id),this.showContextMenu(t.id,null,!1,l.clientX,l.clientY)})}async selectBlock(t){this.childInputEl=null,this.isEditMode=!1,this.editModeBlockId=null,this.selectedBlockId=t,this.isAppendMode=!0,this.appendModeBlockId=t,this.updateInputAreaForAppendMode(),this.renderBlocks();let i=this.blocks.find(n=>n.id===t);if(i){this.selectedBlockContent=i.content;let n=this.plugin.getAIAnalysisView();n&&(n.setMode("analysis"),i.category==="\u5F85\u5206\u6790"?await this.startAIAnalysis(i):n.setActiveBlock(t,i.content))}}selectChildBlock(t,i){this.childInputEl=null,this.isEditMode=!1,this.editModeBlockId=null,this.selectedBlockId=t,this.isAppendMode=!1,this.appendModeBlockId=null,this.renderBlocks();let n=this.blocks.find(r=>r.id===i);if(n){this.selectedBlockContent=n.content;let r=this.plugin.getAIAnalysisView();r&&(r.setMode("analysis"),r.setActiveBlock(t,n.content,i))}}showContextMenu(t,i,n,r,s){let a=document.querySelector(".lifewiki-context-menu");a&&a.remove();let o=document.createElement("div");o.className="lifewiki-context-menu",o.style.left=`${r}px`,o.style.top=`${s}px`;let l=this.plugin.getSessionManager(),c=i||t,u=l.getSession(c,i)!==null,d="";if(n){let f=this.blocks.find(g=>g.id===i);if(f){let g=f.children.length;d=g>1?` (\u5171 ${g} \u4E2A\u5B50Block)`:""}}else{let f=this.blocks.find(g=>g.id===t);f&&f.children.length>0&&(d=` (\u542B ${f.children.length} \u4E2A\u5B50Block)`)}let h=document.createElement("div");if(h.className="lifewiki-context-menu-item danger",h.textContent=n?"\u5220\u9664\u6B64\u5B50Block":`\u5220\u9664\u65E5\u8BB0Block${d}`,h.addEventListener("click",()=>{o.remove(),this.confirmAndDeleteBlock(t,i,n,!1)}),o.appendChild(h),u&&!n){let f=document.createElement("div");f.className="lifewiki-context-menu-item danger",f.textContent=`\u5220\u9664Block\u53CA\u4F1A\u8BDD\u8BB0\u5F55${d}`,f.addEventListener("click",()=>{o.remove(),this.confirmAndDeleteBlock(t,i,n,!0)}),o.appendChild(f)}document.body.appendChild(o);let p=f=>{o.contains(f.target)||(o.remove(),document.removeEventListener("click",p))};setTimeout(()=>document.addEventListener("click",p),0)}async confirmAndDeleteBlock(t,i,n,r){let s="",a=0;if(n){let l=this.blocks.find(c=>c.id===i);l&&(a=l.children.length),s="\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u5B50Block\u5417\uFF1F",a>1&&(s+=`

\u6CE8\u610F\uFF1A\u7236Block\u8FD8\u6709 ${a-1} \u4E2A\u5B50Block\u3002`)}else{let l=this.blocks.find(c=>c.id===t);l&&(a=l.children.length),r?s="\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u65E5\u8BB0Block\u53CA\u5176\u4F1A\u8BDD\u8BB0\u5F55\u5417\uFF1F":s="\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u65E5\u8BB0Block\u5417\uFF1F",a>0&&(s+=`

\u6CE8\u610F\uFF1A\u8FD9\u5C06\u540C\u65F6\u5220\u9664\u6240\u6709 ${a} \u4E2A\u5B50Block\u3002`),r&&(s+=`

\u4F1A\u8BDD\u8BB0\u5F55\u5C06\u88AB\u6C38\u4E45\u5220\u9664\u3002`)}confirm(s)&&await this.deleteBlock(t,i,n,r)}async deleteBlock(t,i,n,r){try{if(n&&i?await this.deleteChildBlockFromFile(t,i):await this.deleteParentBlockFromFile(t,r),r){let a=this.plugin.getSessionManager(),o=i||t;await a.clearSession(o)}await this.loadBlocks(),this.renderBlocks(),this.selectedBlockId=null,this.selectedBlockContent=null;let s=this.plugin.getAIAnalysisView();s&&s.setActiveBlock(null,null)}catch(s){console.error("[LifeWiki] Error deleting block:",s),alert("\u5220\u9664\u5931\u8D25: "+(s instanceof Error?s.message:"\u672A\u77E5\u9519\u8BEF"))}}async deleteChildBlockFromFile(t,i){let n=`Daily/${this.currentDate}.md`,r=this.app.vault.getAbstractFileByPath(n);if((!r||!(r instanceof E.TFile))&&(r=this.app.vault.getAbstractFileByPath(`${this.currentDate}.md`)),(!r||!(r instanceof E.TFile))&&(r=this.app.vault.getAbstractFileByPath(`${ee}/${this.currentDate}.md`)),!(r instanceof E.TFile))return;let a=(await this.app.vault.read(r)).split(`
`),o=new RegExp(`^- \\d{2}:\\d{2}\\s.+<!-- ${t} -->`),l=a.filter(u=>!u.match(o));await this.app.vault.modify(r,l.join(`
`));let c=this.blocks.find(u=>u.id===i);c&&(c.children=c.children.filter(u=>u.id!==t))}async deleteParentBlockFromFile(t,i){let n=`Daily/${this.currentDate}.md`,r=this.app.vault.getAbstractFileByPath(n);if((!r||!(r instanceof E.TFile))&&(r=this.app.vault.getAbstractFileByPath(`${this.currentDate}.md`)),(!r||!(r instanceof E.TFile))&&(r=this.app.vault.getAbstractFileByPath(`${ee}/${this.currentDate}.md`)),!(r instanceof E.TFile))return;let a=(await this.app.vault.read(r)).split(`
`),o=-1,l=new RegExp("^### \\d{2}:\\d{2} \\[([^\\]]+)\\] #(\\S+)");for(let u=0;u<a.length;u++)if(a[u].match(l)){let d=this.blocks.find(h=>h.id===t);if(d&&a[u].includes(d.timestamp)){for(let h=u+1;h<Math.min(u+5,a.length);h++)if(a[h].includes(`<!-- ${t} -->`)){o=u;break}if(o!==-1)break}}if(o===-1)return;let c=a.length;for(let u=o+1;u<a.length;u++)if(a[u].match(l)){c=u;break}a.splice(o,c-o),await this.app.vault.modify(r,a.join(`
`)),this.blocks=this.blocks.filter(u=>u.id!==t)}startChildEditMode(t,i){this.isAppendMode=!1,this.appendModeBlockId=null,this.selectedBlockId=null,this.updateInputAreaForAppendMode(),this.editModeBlockId=t,this.isEditMode=!0,this.editingChildId=t,this.editingParentId=i,this.renderBlocks(),setTimeout(()=>{let n=this.contentContainer?.querySelector(".lifewiki-edit-textarea");n&&(n.focus(),n.addEventListener("keydown",this.handleChildEditKeydown.bind(this)))},0)}handleChildEditKeydown(t){t.key==="Enter"&&!t.shiftKey?(t.preventDefault(),this.saveChildEditMode()):t.key==="Escape"&&this.cancelChildEditMode()}cancelChildEditMode(){this.isEditMode=!1,this.editModeBlockId=null,this.editingChildId=null,this.editingParentId=null,this.renderBlocks()}async saveChildEditMode(){let t=this.editingChildId,i=this.editingParentId;if(!t||!i)return;let n=this.blocks.find(o=>o.id===i);if(!n)return;let r=n.children.findIndex(o=>o.id===t);if(r===-1)return;let a=this.contentContainer?.querySelector(".lifewiki-edit-textarea")?.value.trim()||"";n.children[r].content=a,await this.saveBlockToFile(n),this.isEditMode=!1,this.editModeBlockId=null,this.editingChildId=null,this.editingParentId=null,this.renderBlocks()}updateInputAreaForAppendMode(){if(!this.inputTextarea||!this.inputHintEl||!this.appendModeActionsEl||!this.appendSubmitBtn)return;let t=this.blocks.find(i=>i.id===this.appendModeBlockId);this.isAppendMode&&t?(this.inputTextarea.addClass("append-mode"),this.inputTextarea.placeholder="\u8FFD\u52A0\u8BB0\u5F55...",this.inputHintEl.textContent=`\u5C06\u5728 ${t.timestamp} \u8BE5\u6761\u65E5\u8BB0\u4E0B\u8FFD\u52A0\u8BB0\u5F55`,this.inputHintEl.setAttribute("style","display: none;"),this.appendSubmitBtn.textContent=`\u5C06\u5728 ${t.timestamp} \u8FD9\u6761\u65E5\u8BB0\u4E0B\u8FFD\u52A0`,this.appendModeActionsEl.classList.add("visible"),this.inputTextarea.value="",this.inputValue="",setTimeout(()=>this.inputTextarea?.focus(),0)):(this.inputTextarea.removeClass("append-mode"),this.inputTextarea.placeholder="\u8BB0\u5F55\u4ECA\u5929\u7684\u751F\u6D3B...",this.inputHintEl.textContent="Enter \u53D1\u9001 \xB7 \u6700\u591A 250 \u5B57",this.inputHintEl.removeAttribute("style"),this.appendModeActionsEl.classList.remove("visible"))}cancelAppendMode(){this.isAppendMode=!1,this.appendModeBlockId=null,this.selectedBlockId=null,this.updateInputAreaForAppendMode(),this.renderBlocks()}async submitAppend(){if(!this.isAppendMode||!this.appendModeBlockId)return;let t=this.inputTextarea?.value.trim();if(!t)return;let i=this.blocks.find(r=>r.id===this.appendModeBlockId);if(!i)return;let n=await this.appendChildToBlock(i,t);n&&(i.children.push(n),this.inputTextarea.value="",this.inputValue="",this.isAppendMode=!1,this.appendModeBlockId=null,this.selectedBlockId=null,this.updateInputAreaForAppendMode(),this.renderBlocks(),await this.startAIAnalysis(n))}startEditMode(t){this.isAppendMode=!1,this.appendModeBlockId=null,this.selectedBlockId=null,this.updateInputAreaForAppendMode(),this.editModeBlockId=t,this.isEditMode=!0,this.renderBlocks(),setTimeout(()=>{let i=this.contentContainer?.querySelector(".lifewiki-edit-textarea");i&&(i.focus(),i.addEventListener("keydown",this.handleEditKeydown.bind(this)))},0)}handleEditKeydown(t){t.key==="Enter"&&!t.shiftKey?(t.preventDefault(),this.saveEditMode()):t.key==="Escape"&&this.cancelEditMode()}async saveEditMode(){if(!this.editModeBlockId)return;let t=this.blocks.find(a=>a.id===this.editModeBlockId);if(!t)return;let i=this.contentContainer?.querySelector(".lifewiki-edit-textarea"),n=this.contentContainer?.querySelector(".lifewiki-edit-input"),r=i?.value.trim()||"",s=n?.value.trim()||t.category;t.content=r,t.category=s,this.isEditMode=!1,this.editModeBlockId=null,this.renderBlocks(),await this.saveBlockToFile(t)}cancelEditMode(){this.isEditMode=!1,this.editModeBlockId=null,this.renderBlocks()}exitEditMode(){this.isEditMode&&this.saveEditMode()}async appendChildToBlock(t,i){let n=`Daily/${this.currentDate}.md`,r=this.app.vault.getAbstractFileByPath(n);if((!r||!(r instanceof E.TFile))&&(r=this.app.vault.getAbstractFileByPath(`${this.currentDate}.md`)),(!r||!(r instanceof E.TFile))&&(r=this.app.vault.getAbstractFileByPath(`${ee}/${this.currentDate}.md`)),!(r instanceof E.TFile))return null;let a=(await this.app.vault.read(r)).split(`
`),o=`### ${t.timestamp} [${t.source}] ${me(t.category)}`,l=-1;for(let f=0;f<a.length;f++)if(a[f].includes(o)){l=f;break}if(l===-1)return null;let c=a.length;for(let f=l+1;f<a.length;f++)if(a[f].startsWith("### ")){c=f;break}let u=new Date,d=`${u.getHours().toString().padStart(2,"0")}:${u.getMinutes().toString().padStart(2,"0")}`,h=je(),p=`- ${d} ${i} <!-- ${h} -->`;return a.splice(c,0,p),await this.app.vault.modify(r,a.join(`
`)),{id:h,timestamp:d,content:i,parentId:t.id}}async saveBlockToFile(t){let i=`Daily/${this.currentDate}.md`,n=this.app.vault.getAbstractFileByPath(i);if((!n||!(n instanceof E.TFile))&&(n=this.app.vault.getAbstractFileByPath(`${this.currentDate}.md`)),(!n||!(n instanceof E.TFile))&&(n=this.app.vault.getAbstractFileByPath(`${ee}/${this.currentDate}.md`)),!(n instanceof E.TFile))return;let s=(await this.app.vault.read(n)).split(`
`),a=-1,o=new RegExp(`^### ${t.timestamp} \\[([^\\]]+)\\]\\s+(.+)`);for(let p=0;p<s.length;p++)if(s[p].match(o)){a=p;break}if(a===-1)return;let l=`### ${t.timestamp} [${t.source}] ${me(t.category)}`;s[a]=l;let c=a+1;for(;c<s.length&&!(s[c].startsWith("### ")||s[c].startsWith("- ")&&s[c].match(/^- \d{2}:\d{2}\s/));){if(s[c].trim()&&!s[c].startsWith("#")){s[c]=t.content;break}c++}(c>=s.length||s[c].trim()==="")&&s.splice(a+1,0,t.content);let u=`<!-- ${t.id} -->`,d=-1;for(let p=a+1;p<s.length;p++)if(s[p].startsWith("### ")||s[p].startsWith("- ")&&s[p].match(/^- \d{2}:\d{2}\s/)){d=p;break}d===-1&&(d=s.length);let h=!1;for(let p=a+1;p<d;p++)if(s[p].trim().match(/^<!-- [a-f0-9-]+ -->$/)){s[p]=u,h=!0;break}h||s.splice(d,0,u),await this.app.vault.modify(n,s.join(`
`))}async submitBlock(t){let i=t.value.trim();if(!i||this.isLoading)return;this.isLoading=!0;let n=new Date,r=`${n.getHours().toString().padStart(2,"0")}:${n.getMinutes().toString().padStart(2,"0")}`,s={id:je(),timestamp:r,source:"TraceMind",category:"\u5F85\u5206\u6790",content:i,children:[],parentId:null};this.blocks.push(s),t.value="",this.inputValue="",this.renderBlocks(),await this.appendBlockToFile(s),await this.startAIAnalysis(s),this.isLoading=!1}async appendBlockToFile(t){let i=`Daily/${this.currentDate}.md`,n=this.app.vault.getAbstractFileByPath(i);if(n instanceof E.TFile||this.app.vault.getAbstractFileByPath("Daily")instanceof E.TFolder||await this.app.vault.createFolder("Daily"),(!n||!(n instanceof E.TFile))&&(n=this.app.vault.getAbstractFileByPath(`${this.currentDate}.md`)),!(n instanceof E.TFile)){let o=await bt(this.app.vault,"journal-template.md",{date:this.currentDate})+`
### ${t.timestamp} [${t.source}] ${me(t.category)}
${t.content}
<!-- ${t.id} -->
`;await this.app.vault.create(i,o);return}let r=`
### ${t.timestamp} [${t.source}] ${me(t.category)}
${t.content}
<!-- ${t.id} -->
`,s=await this.app.vault.read(n);await this.app.vault.modify(n,s+r)}async startAIAnalysis(t){if(!t.id){let l=je();console.warn(`[TraceMind] block-editor: block "${t.content.substring(0,30)}..." has no ID, generated ${l}`),t.id=l}let i=this.plugin.getSessionManager(),n=this.plugin.getAIAnalysisView(),r=t.parentId||null,s=t.category==="\u5F85\u5206\u6790";if(!r&&!s){let l=i.getSession(t.id,r);if(l&&l.messages&&l.messages.length>0){this.selectedBlockId=t.id,this.isAppendMode=!0,this.appendModeBlockId=t.id,this.selectedBlockContent=t.content,this.updateInputAreaForAppendMode(),this.renderBlocks(),n&&(n.setMode("analysis"),n.setActiveBlock(t.id,t.content));return}}i.getOrCreateSession(t.id,r);let a,o=[];if(r){let l=this.blocks.find(c=>c.id===r);if(l)for(let c of l.children)c.id!==t.id&&o.push({id:c.id,content:c.content})}try{a=await this.plugin.getAIProvider().analyzeBlock(t.content,t.id),console.log("[TraceMind] block-editor: analyzeBlock result:",a),console.log("[TraceMind] block-editor: aiView exists:",!!n);let c=i.setSession(t.id,a,r);if(console.log("[TraceMind] block-editor: persistedSession:",c),n){let u=t.content;console.log("[TraceMind] block-editor: calling showAgentSession"),c?n.showAgentSession(t.id,u,c,r):(console.log("[TraceMind] block-editor: no persistedSession, calling startNewSession"),n.startNewSession(t.id,u,a.aiResponse||"",r))}else console.warn("[TraceMind] block-editor: aiView is null");if(!r&&t.category==="\u5F85\u5206\u6790"&&a.areas&&a.areas.length>0){let u=Ue(a.areas);t.category=u,await this.saveBlockToFile(t),this.renderBlocks()}}catch(l){if(n){let c=r&&this.blocks.find(u=>u.id===r)?.content||t.content;n.startNewSession(t.id,c,`\u9519\u8BEF: ${l.message}`)}}}async updateBlockCategory(t){try{let n=await this.plugin.getAIProvider().analyzeBlock(t.content,t.id);if(n.areas&&n.areas.length>0){let r=Ue(n.areas);t.category=r,await this.saveBlockToFile(t)}}catch{}}formatDate(t){let i=t.getFullYear(),n=String(t.getMonth()+1).padStart(2,"0"),r=String(t.getDate()).padStart(2,"0");return`${i}-${n}-${r}`}async onClose(){}};var P=require("obsidian");function ze(e){let t=[],i=/\[TRACEMIND_ACTION\]\s*\n?([\s\S]*?)\n?\s*\[\/TRACEMIND_ACTION\]/g,n=e,r;for(;(r=i.exec(e))!==null;)try{let s=r[1].trim(),a=JSON.parse(s);t.push(a),n=n.replace(r[0],"")}catch{}return n=n.replace(/\[\/TRACEMIND_ACTION\]/g,""),n=n.replace(/\[TRACEMIND_ACTION\]/g,""),n=n.replace(/\n?\s*\{\s*"action"\s*:\s*"[^"]+"[\s\S]*?\}\s*$/g,""),{text:n.trim(),actions:t}}var wt={entityTypes:{person:{label:"\u4EBA\u7269",p0:["company","role","relationship_to_user"],p1:["responsibility","communicationStyle"],p2:["personality","preferences","skills"]},object:{label:"\u5BA2\u4F53",subtypes:{company:{priority:"P0",label:"\u516C\u53F8/\u7EC4\u7EC7",hints:["\u516C\u53F8\u3001\u5BA2\u6237\u3001\u4F9B\u5E94\u5546\u3001\u5408\u4F5C\u4F19\u4F34\u3001\u673A\u6784\u7B49\u6709\u4E13\u6709\u540D\u79F0\u7684\u7EC4\u7EC7","\u5982\uFF1A\u7A79\u5F7B\u667A\u80FD\u3001\u5B57\u8282\u8DF3\u52A8\u3001\u67D0\u4F9B\u5E94\u5546"]},project:{priority:"P0",label:"\u9879\u76EE"},task:{priority:"P0",label:"\u4EFB\u52A1",hints:["\u5F85\u529E\u4E8B\u9879\u3001\u4EA4\u4ED8\u7269\u3001\u6709\u660E\u786E\u622A\u6B62\u65E5\u671F\u7684\u884C\u52A8\u9879",'"XX\u5206\u6790"\u3001"XX\u62A5\u544A"\u3001"XX\u65B9\u6848"\u3001"XX\u8BC4\u4F30" \u90FD\u662F task','\u547D\u540D\u5EFA\u8BAE\uFF1A\u5F52\u5C5E\u9879\u76EE\u540D+\u4EFB\u52A1\u63CF\u8FF0\uFF08\u5982"910C\u9879\u76EE\u6295\u8D44\u5206\u6790"\uFF09']},product:{priority:"P1",label:"\u4EA7\u54C1"},technology:{priority:"P1",label:"\u6280\u672F"},document:{priority:"P2",label:"\u6587\u6863"},location:{priority:"P2",label:"\u5730\u70B9"},other:{priority:"P2",label:"\u5176\u4ED6"}},p0:["subtype","status"],p1:["deadline","description"],p2:["priority","goals"]},theme:{label:"\u4E3B\u9898",subtypes:{friction:{priority:"P0",label:"\u6469\u64E6",hints:["\u53CD\u590D\u9047\u5230\u7684\u963B\u529B\u3001\u5361\u70B9\u3001\u8FD4\u5DE5\u3001\u4F4E\u6548\u3001\u51B2\u7A81","\u5982\uFF1A\u65B9\u5411\u53CD\u590D\u53D8\u5316\u3001\u9700\u6C42\u8FB9\u754C\u4E0D\u6E05\u3001\u4F1A\u8BAE\u6CA1\u6709\u7ED3\u8BBA"]},goal:{priority:"P0",label:"\u76EE\u6807",hints:["\u6301\u7EED\u60F3\u63A8\u8FDB\u3001\u8FBE\u6210\u3001\u6539\u5584\u6216\u5EFA\u7ACB\u7684\u65B9\u5411","\u5982\uFF1A\u63D0\u5347\u8868\u8FBE\u80FD\u529B\u3001\u51CF\u5C11\u65E0\u6548\u4F1A\u8BAE\u3001\u5EFA\u7ACB\u4E2A\u4EBA\u8BB0\u5FC6\u7CFB\u7EDF"]},judgment:{priority:"P0",label:"\u5224\u65AD",hints:["\u5BF9\u4EBA\u6216\u4E8B\u5F62\u6210\u7684\u770B\u6CD5\u3001\u8BC4\u4EF7\u3001\u7ACB\u573A","\u5982\uFF1A\u5F53\u524D\u9879\u76EE\u4EF7\u503C\u4E0D\u6E05\u6670\u3001Markdown-first \u66F4\u9002\u5408 MVP"]},idea:{priority:"P0",label:"\u60F3\u6CD5",hints:["\u7075\u611F\u3001\u5174\u8DA3\u3001\u63A2\u7D22\u6B32\u3001\u53CD\u590D\u601D\u8003\u7684\u95EE\u9898","\u5982\uFF1AAI\u8BB0\u5FC6\u7CFB\u7EDF\u8BBE\u8BA1\u3001\u5982\u4F55\u8BA9\u788E\u7247\u8BB0\u5F55\u83B7\u5F97\u6D1E\u5BDF"]}},p0:["subtype"],p1:["occurrenceCount","context"],p2:["context"]}},attributeLabels:{company:"\u516C\u53F8/\u7EC4\u7EC7",role:"\u804C\u4F4D/\u89D2\u8272",relationship_to_user:"\u4E0E\u4F60\u7684\u5173\u7CFB",responsibility:"\u804C\u8D23",communicationStyle:"\u6C9F\u901A\u98CE\u683C",personality:"\u6027\u683C",preferences:"\u504F\u597D",skills:"\u6280\u80FD",subtype:"\u7C7B\u578B",status:"\u72B6\u6001",deadline:"\u622A\u6B62\u65E5\u671F",description:"\u63CF\u8FF0",priority:"\u4F18\u5148\u7EA7",goals:"\u76EE\u6807",occurrenceCount:"\u51FA\u73B0\u6B21\u6570",context:"\u80CC\u666F"}},kt={...wt};function Ct(){kt={...wt},console.log("[TraceMind] Loaded entity type config")}function ve(){return kt}function te(e,t){return t&&ve().entityTypes[e]?.subtypes?.[t]?.label||""}function At(){let e=ve().entityTypes,t=["\u5B9E\u4F53\u7C7B\u578B\u89C4\u5219\uFF1A"];t.push('- "person": '+e.person.label+"\uFF08\u5982 \u5F20\u4E09\u3001John Smith\uFF09");let i=e.object.subtypes||{},n=Object.keys(i).join("\u3001");t.push('- "object": '+e.object.label+"\uFF0C\u53EF\u7528 subtype\uFF1A"+n);for(let[a,o]of Object.entries(i))o.hints&&o.hints.length>0&&t.push("  - "+a+" \u8BC6\u522B\uFF1A"+o.hints.join("\uFF1B"));let r=e.theme.subtypes||{},s=Object.keys(r).join("\u3001");t.push('- "theme": '+e.theme.label+"\uFF0C\u53EF\u7528 subtype\uFF1A"+s);for(let[a,o]of Object.entries(r))o.hints&&o.hints.length>0&&t.push("  - "+a+" \u8BC6\u522B\uFF1A"+o.hints.join("\uFF1B"));return t.join(`
`)}function Tt(e){let t=ve().entityTypes,i=ve().attributeLabels,n=t[e];if(!n)return"";let r=[];for(let a of n.p0)r.push({key:a,label:i[a]||a});for(let a of n.p1)r.push({key:a,label:i[a]||a});let s=[];if(s.push("\u53EF\u7528\u5C5E\u6027\uFF1A"+r.map(a=>a.key+"\uFF08"+a.label+"\uFF09").join("\u3001")),n.subtypes){let a=Object.entries(n.subtypes).map(([o,l])=>o+":"+l.label).join("/");s.push("- subtype \u53EF\u9009\u503C\uFF1A"+a)}return s.join(`
`)}var xn=`\u4F60\u662F\u4E00\u4F4D\u6D1E\u5BDF\u529B\u654F\u9510\u7684\u65E5\u8BB0\u5206\u6790\u4E13\u5BB6\u3002\u7528\u6237\u6BCF\u5929\u8BB0\u5F55\u751F\u6D3B\u548C\u5DE5\u4F5C\u65E5\u8BB0\uFF0C\u4F60\u9700\u8981\u6839\u636E\u5F53\u5929\u7684\u65E5\u8BB0\u5185\u5BB9\uFF0C\u751F\u6210\u4E00\u4EFD\u7ED3\u6784\u5316\u7684"\u4ECA\u65E5\u6D1E\u5BDF"\u62A5\u544A\u3002

## \u62A5\u544A\u683C\u5F0F\u8981\u6C42

\u4E25\u683C\u6309\u7167\u4EE5\u4E0B 6 \u4E2A\u7AE0\u8282\u8F93\u51FA Markdown\uFF0C\u4E0D\u8981\u9057\u6F0F\u4EFB\u4F55\u7AE0\u8282\uFF1A

### ## \u4ECA\u65E5\u6982\u89C8

\u7528\u4E00\u53E5\u8BDD\u6982\u62EC\u4ECA\u5929\u7684\u6574\u4F53\u57FA\u8C03\u3002\u4F8B\u5982\uFF1A"\u4ECA\u5929\u662F\u5DE5\u4F5C\u9A71\u52A8\u7684\u4E00\u5929\uFF0C\u4E3B\u8981\u56F4\u7ED5 Q2 \u9879\u76EE\u63A8\u8FDB\u5C55\u5F00\u3002"

### ## \u6CE8\u610F\u529B\u5206\u5E03

\u5217\u51FA\u4ECA\u5929\u5404\u9886\u57DF\u7684\u6CE8\u610F\u529B\u5360\u6BD4\uFF08\u4EE5\u767E\u5206\u6BD4\u5448\u73B0\uFF09\uFF0C\u5E76\u5728\u5360\u6BD4\u6700\u9AD8\u7684\u9886\u57DF\u4E0B\u65B9\u52A0\u4E00\u884C\u7B80\u77ED\u7684\u6295\u5165\u65B9\u5411\u6982\u62EC\u3002\u4F8B\u5982\uFF1A
- **\u5DE5\u4F5C** 60% \u2014 \u4E3B\u8981\u96C6\u4E2D\u5728\u4F9B\u5E94\u5546\u8C08\u5224\u548C\u56E2\u961F\u7BA1\u7406
- **\u751F\u6D3B** 25%
- **\u5B66\u4E60** 15%

### ## \u4E3B\u7EBF\u4E0E\u53D1\u6563

\u5206\u6790\u4ECA\u5929\u7684\u8BB0\u5F55\u662F\u56F4\u7ED5\u4E00\u4E2A\u6838\u5FC3\u65B9\u5411\u5C55\u5F00\uFF0C\u8FD8\u662F\u5185\u5BB9\u6BD4\u8F83\u53D1\u6563\u3002\u5982\u679C\u56F4\u7ED5\u4E3B\u7EBF\uFF0C\u6307\u51FA\u4E3B\u7EBF\u662F\u4EC0\u4E48\u3002\u5982\u679C\u662F\u53D1\u6563\u7684\uFF0C\u8BF4\u660E\u53D1\u6563\u7684\u7279\u70B9\u3002

### ## \u53D8\u5316\u4E0E\u6469\u64E6

\u63D0\u53D6\u4ECA\u5929\u51FA\u73B0\u7684\u91CD\u8981\u53D8\u5316\uFF08\u65B0\u4EBA\u3001\u65B0\u9879\u76EE\u3001\u65B0\u60C5\u51B5\uFF09\u3001\u963B\u529B\u6216\u6469\u64E6\uFF08\u56F0\u96BE\u3001\u51B2\u7A81\u3001\u5EF6\u8FDF\uFF09\uFF0C\u4EE5\u53CA\u5B83\u4EEC\u53EF\u80FD\u5E26\u6765\u7684\u5F71\u54CD\u3002\u5982\u679C\u6CA1\u6709\u660E\u663E\u53D8\u5316\u6216\u6469\u64E6\uFF0C\u4E5F\u8981\u5982\u5B9E\u8BF4\u660E\u3002

### ## \u4E3B\u9898\u52A8\u6001

\u7ED3\u5408\u5DF2\u6709\u7684\u5B9E\u4F53\u6863\u6848\uFF08\u7279\u522B\u662F Theme \u7C7B\u578B\u7684\u5361\u7247\uFF09\uFF0C\u5206\u6790\u4ECA\u5929\u7684\u65E5\u8BB0\u4E2D\uFF1A
- **\u65B0\u589E\u4E3B\u9898**\uFF1A\u4ECA\u5929\u65B0\u51FA\u73B0\u7684\u4E3B\u9898\uFF0C\u6309 subtype \u5206\u7C7B\u5217\u51FA\uFF08\u6469\u64E6/\u76EE\u6807/\u5224\u65AD/\u60F3\u6CD5\uFF09\u3002\u547D\u540D\u8981\u5177\u4F53\uFF0C\u4E0D\u8981\u7528\u6CDB\u8BCD
- **\u5F3A\u5316\u4E3B\u9898**\uFF1A\u4E0E\u5DF2\u6709 Theme \u5361\u7247\u547C\u5E94\u3001\u88AB\u65B0\u8BC1\u636E\u5F3A\u5316\u7684\u4E3B\u9898
- **\u6D88\u9000\u4E3B\u9898**\uFF1A\u4E4B\u524D\u6D3B\u8DC3\u4F46\u6700\u8FD1\u672A\u518D\u51FA\u73B0\u7684\u4E3B\u9898

\u6BCF\u4E2A\u4E3B\u9898\u6807\u6CE8 subtype \u4E2D\u6587\u540D\uFF08\u5982"\u6469\u64E6\uFF1A\u65B9\u5411\u53CD\u590D\u53D8\u5316"\u3001"\u76EE\u6807\uFF1A\u63D0\u5347\u8868\u8FBE\u80FD\u529B"\uFF09\u3002

### ## \u4E0E\u524D\u65E5\u5BF9\u6BD4

\u5BF9\u6BD4\u4ECA\u5929\u548C\u524D\u4E00\u5929\u7684\u65E5\u8BB0\uFF0C\u5206\u6790\u5728\u6CE8\u610F\u529B\u65B9\u5411\u3001\u5185\u5BB9\u4E3B\u9898\u3001\u60C5\u7EEA\u57FA\u8C03\u7B49\u65B9\u9762\u7684\u53D8\u5316\u3002\u5982\u679C\u524D\u4E00\u5929\u6CA1\u6709\u65E5\u8BB0\u6216\u6570\u636E\u4E0D\u8DB3\uFF0C\u8BF4\u660E\u5373\u53EF\u3002

## \u8F93\u51FA\u89C4\u5219

- \u53EA\u8F93\u51FA\u4E0A\u8FF0 6 \u4E2A\u7AE0\u8282\u7684 Markdown\uFF0C\u4E0D\u8981\u6DFB\u52A0\u5176\u4ED6\u5185\u5BB9
- \u6BCF\u4E2A\u7AE0\u8282\u5FC5\u987B\u6709\u5B9E\u8D28\u5185\u5BB9\uFF0C\u4E0D\u80FD\u53EA\u5199"\u65E0"
- \u57FA\u4E8E\u63D0\u4F9B\u7684\u65E5\u8BB0\u5185\u5BB9\u8FDB\u884C\u5206\u6790\uFF0C\u4E0D\u8981\u7F16\u9020
- \u4F7F\u7528\u4E2D\u6587`;function Ft(e){let t=[];return t.push("## \u7528\u6237\u80CC\u666F"),t.push(e.profileContext||"\u6682\u65E0\u7528\u6237\u80CC\u666F\u4FE1\u606F"),t.push(""),t.push("## \u5B9E\u4F53\u6863\u6848\u6458\u8981"),t.push(e.entityIndexSummary||"\u6682\u65E0\u5B9E\u4F53\u6863\u6848"),t.push(""),t.push("## \u4ECA\u5929\u7684\u65E5\u8BB0"),t.push(e.todayBlocks||"(\u4ECA\u5929\u8FD8\u6CA1\u6709\u5199\u65E5\u8BB0)"),t.push(""),t.push("## \u524D\u4E00\u5929\u7684\u65E5\u8BB0"),t.push(e.yesterdayBlocks||"(\u524D\u4E00\u5929\u6CA1\u6709\u65E5\u8BB0)"),[{role:"system",content:xn},{role:"user",content:t.join(`
`)}]}async function Ee(e,t){let i=e+"|||"+t,r=new TextEncoder().encode(i),s=await crypto.subtle.digest("SHA-256",r);return Array.from(new Uint8Array(s)).map(o=>o.toString(16).padStart(2,"0")).join("")}function St(e){if(e.length===0)return"\u6682\u65E0\u5B9E\u4F53\u6863\u6848";let t=new Map;for(let s of e){let a=s.cardType||s.type||"unknown";t.has(a)||t.set(a,[]),t.get(a).push(s)}let i={person:"\u4EBA\u7269",object:"\u5BA2\u4F53",theme:"\u4E3B\u9898"},n=[],r=["person","object","theme"];for(let s of r){let a=t.get(s);if(!a||a.length===0)continue;let o=[...a].sort((u,d)=>new Date(d.lastUpdated).getTime()-new Date(u.lastUpdated).getTime()).slice(0,20),l=i[s]||s,c=o.map(u=>`${u.name}(${u.maturity||"L0"})`).join(", ");n.push(`${l}(${o.length}): ${c}`)}return n.join("; ")||"\u6682\u65E0\u5B9E\u4F53\u6863\u6848"}var ie="tracemind-ai-analysis",be=class extends P.ItemView{plugin;activeBlockId=null;activeParentId=null;mode="analysis";chatMessagesEl=null;inputAreaEl=null;inputTextarea=null;agentSelectEl=null;currentAgentKey="";detectedLocalAgents=[];sendBtnEl=null;chatModeClearBtnEl=null;modeToggleBtnEl=null;headerTitleEl=null;modeSelectEl=null;isLoading=!1;emptyStateEl=null;analysisTabsEl=null;blockInsightsEl=null;entityIndexEl=null;analysisTab="block";thinkingEl=null;hasTodayInsightAttention=!1;clarificationPhase="summary";clarificationQueue=[];knownEntities=[];currentEntityIndex=0;allSessionEntities=[];replayingHistory=!1;constructor(t,i){super(t),this.plugin=i}getViewType(){return ie}getDisplayText(){return this.mode==="chat"?"AI\u804A\u5929":"AI\u6D1E\u5BDF"}async onOpen(){this.plugin.aiAnalysisView=this;let t=this.containerEl;t.empty(),this.addStyles();let i=t.createEl("div",{cls:"lifewiki-ai-panel"}),n=i.createEl("div",{cls:"lifewiki-ai-header"}),r=n.createEl("div",{cls:"lifewiki-ai-header-title"});this.headerTitleEl=r.createEl("span",{text:"AI \u6D1E\u5BDF"}),this.analysisTabsEl=r.createEl("div",{cls:"lifewiki-analysis-tabs"});let s=n.createEl("div",{cls:"lifewiki-ai-header-actions"});this.modeToggleBtnEl=s.createEl("button",{cls:"lifewiki-mode-toggle-btn analysis",attr:{type:"button",title:"\u5207\u6362\u4E3A\u804A\u5929\u6A21\u5F0F"}}),this.renderModeToggleButton(),this.modeToggleBtnEl.addEventListener("click",()=>{this.mode==="analysis"?this.switchToChatMode():this.switchToAnalysisMode()}),this.chatModeClearBtnEl=s.createEl("button",{cls:"lifewiki-ai-clear-btn",attr:{title:"\u6E05\u7A7A\u804A\u5929"}}),(0,P.setIcon)(this.chatModeClearBtnEl,"trash-2");let a=this.chatModeClearBtnEl.querySelector("svg");a&&(a.setAttribute("width","20"),a.setAttribute("height","20")),this.chatModeClearBtnEl.addClass("hidden"),this.chatModeClearBtnEl.addEventListener("click",()=>{this.clearChatSession()});let o=i.createEl("div",{cls:"lifewiki-ai-scroll"});this.emptyStateEl=o.createEl("div",{cls:"lifewiki-empty-state"}),this.emptyStateEl.createEl("span",{cls:"lifewiki-empty-state-title",text:"\u9009\u62E9\u6216\u8F93\u5165\u4E00\u6761\u65E5\u8BB0"}),this.entityIndexEl=o.createEl("div",{cls:"lifewiki-entity-index"}),this.chatMessagesEl=o.createEl("div",{cls:"lifewiki-chat-messages"}),this.blockInsightsEl=o.createEl("div",{cls:"lifewiki-block-insights"});let l=i.createEl("div",{cls:"lifewiki-ai-input-area"});this.inputAreaEl=l;let c=l.createEl("div",{cls:"lifewiki-chat-input-wrapper"}),u=c.createEl("div",{cls:"lifewiki-input-row"});this.inputTextarea=u.createEl("textarea",{cls:"lifewiki-input-textarea",attr:{placeholder:"\u56DE\u7B54\u6F84\u6E05\u95EE\u9898\u6216\u8865\u5145\u80CC\u666F...",rows:"1"}}),this.inputTextarea.addEventListener("input",()=>{this.autoResizeTextarea(),this.updateSendBtnState()}),this.inputTextarea.addEventListener("keydown",h=>{h.key==="Enter"&&!h.shiftKey&&(h.preventDefault(),this.sendMessage())});let d=c.createEl("div",{cls:"lifewiki-mode-row"});this.modeSelectEl=d.createEl("select",{cls:"lifewiki-mode-select"}),this.modeSelectEl.createEl("option",{value:"analysis",text:"\u5F53\u524D\u65E5\u8BB0"}),this.modeSelectEl.createEl("option",{value:"chat",text:"\u5168\u5C40\u804A\u5929"}),this.modeSelectEl.addEventListener("change",()=>{this.modeSelectEl?.value==="chat"?this.switchToChatMode():this.switchToAnalysisMode()}),this.agentSelectEl=d.createEl("select",{cls:"lifewiki-agent-select",attr:{style:"display:none"}}),this.agentSelectEl.addEventListener("change",()=>{this.currentAgentKey=this.agentSelectEl?.value||""}),this.sendBtnEl=d.createEl("button",{cls:"lifewiki-send-btn",attr:{title:"\u53D1\u9001"}}),(0,P.setIcon)(this.sendBtnEl,"arrow-up"),this.sendBtnEl.addEventListener("click",()=>{this.inputTextarea?.value.trim()&&!this.isLoading&&this.sendMessage()}),this.detectLocalAgents(),this.showEmptyState(),this.renderAnalysisTabs(),this.updateSendBtnState()}autoResizeTextarea(){if(!this.inputTextarea)return;let t=66,i=120,n=this.inputTextarea.scrollHeight;this.inputTextarea.style.height=Math.min(Math.max(n,t),i)+"px"}updateSendBtnState(){if(!this.sendBtnEl||!this.inputTextarea)return;let t=this.inputTextarea.value.trim().length>0&&!this.isLoading;this.sendBtnEl.classList.toggle("active",t)}addStyles(){let t=document.createElement("style");t.textContent=`
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
		`,this.containerEl.appendChild(t)}showEmptyState(){this.emptyStateEl?.addClass("visible"),this.chatMessagesEl?.removeClass("visible"),this.blockInsightsEl?.removeClass("visible"),this.entityIndexEl?.removeClass("visible"),this.updateInputVisibility()}showChatState(){this.emptyStateEl?.removeClass("visible"),this.applyAnalysisTabVisibility(),this.updateInputVisibility()}updateInputVisibility(){this.inputAreaEl&&(this.mode==="analysis"&&this.analysisTab==="insight"?this.inputAreaEl.style.display="none":this.inputAreaEl.style.removeProperty("display"))}renderModeToggleButton(){if(!this.modeToggleBtnEl)return;this.modeToggleBtnEl.empty(),this.modeToggleBtnEl.removeClass("analysis"),this.modeToggleBtnEl.removeClass("chat");let t=this.mode==="chat";this.modeToggleBtnEl.addClass(t?"chat":"analysis"),this.modeToggleBtnEl.setAttr("title",t?"\u5207\u6362\u4E3A\u5206\u6790\u6A21\u5F0F":"\u5207\u6362\u4E3A\u804A\u5929\u6A21\u5F0F"),(0,P.setIcon)(this.modeToggleBtnEl,t?"sparkles":"messages-square"),this.modeToggleBtnEl.createEl("span",{text:t?"\u5207\u6362\u4E3A\u5206\u6790\u6A21\u5F0F":"\u5207\u6362\u4E3A\u804A\u5929\u6A21\u5F0F"})}setEmptyStateText(t){let i=this.emptyStateEl?.querySelector(".lifewiki-empty-state-title");i&&(i.textContent=t)}renderAnalysisTabs(){if(!this.analysisTabsEl)return;if(this.analysisTabsEl.empty(),this.mode!=="analysis"){this.analysisTabsEl.removeClass("visible"),this.headerTitleEl&&(this.headerTitleEl.style.display="");return}this.analysisTabsEl.addClass("visible"),this.headerTitleEl&&(this.headerTitleEl.style.display="none");let t=[{id:"block",label:"\u5F53\u524D\u65E5\u8BB0"},{id:"insight",label:"\u4ECA\u65E5\u6D1E\u5BDF"}];for(let i of t)this.analysisTabsEl.createEl("button",{cls:`lifewiki-analysis-tab ${this.analysisTab===i.id?"active":""}`,text:i.label,attr:{type:"button"}}).addEventListener("click",()=>{this.analysisTab=i.id,this.renderAnalysisTabs(),this.applyAnalysisTabVisibility(),i.id==="insight"&&this.loadOrGenerateInsight()})}applyAnalysisTabVisibility(){if(this.mode!=="analysis"){this.analysisTabsEl?.removeClass("visible"),this.headerTitleEl&&(this.headerTitleEl.style.display=""),this.entityIndexEl?.removeClass("visible"),this.blockInsightsEl?.removeClass("visible"),this.chatMessagesEl?.addClass("visible"),this.updateInputVisibility();return}if(this.renderAnalysisTabs(),this.analysisTab==="insight")this.emptyStateEl?.removeClass("visible"),this.chatMessagesEl?.removeClass("visible"),this.entityIndexEl?.removeClass("visible"),this.blockInsightsEl?.addClass("visible");else{if(this.entityIndexEl?.removeClass("visible"),this.blockInsightsEl?.removeClass("visible"),!this.activeBlockId){this.emptyStateEl?.addClass("visible"),this.chatMessagesEl?.removeClass("visible"),this.updateInputVisibility();return}this.emptyStateEl?.removeClass("visible"),this.chatMessagesEl?.addClass("visible")}this.updateInputVisibility()}clearConversation(){this.chatMessagesEl?.empty(),this.activeBlockId=null,this.showEmptyState()}switchToChatMode(){this.mode="chat",this.agentSelectEl&&(this.agentSelectEl.style.display=""),this.activeBlockId=null,this.activeParentId=null,this.clarificationPhase="summary",this.clarificationQueue=[],this.knownEntities=[],this.allSessionEntities=[],this.currentEntityIndex=0,this.entityIndexEl?.removeClass("visible"),this.analysisTabsEl?.removeClass("visible"),this.blockInsightsEl?.removeClass("visible"),this.renderModeToggleButton(),this.setEmptyStateText("\u53EF\u4EE5\u68C0\u7D22\u3001\u603B\u7ED3\u6216\u66F4\u65B0\u4F60\u7684 vault"),this.headerTitleEl&&(this.headerTitleEl.textContent="AI \u804A\u5929",this.headerTitleEl.style.display=""),this.modeSelectEl&&(this.modeSelectEl.value="chat"),this.chatModeClearBtnEl&&this.chatModeClearBtnEl.removeClass("hidden"),this.inputTextarea&&(this.inputTextarea.placeholder="\u95EE\u95EE\u4F60\u7684 vault\uFF0C\u4F8B\u5982\uFF1A\u603B\u7ED3\u672C\u5468\u65E5\u8BB0\u3001\u67E5\u627E\u67D0\u4E2A\u9879\u76EE\u3001\u66F4\u65B0\u67D0\u4E2A\u4EBA\u7684\u80CC\u666F..."),this.containerEl.querySelector(".lifewiki-ai-panel")?.addClass("chat-mode"),this.updateInputVisibility();let i=this.plugin.getSessionManager().getChatSession();if(i&&i.messages.length>0){this.showChatState(),this.chatMessagesEl?.empty();for(let n of i.messages)n.role!=="system"&&this.addChatMessage(n.role,n.content)}else this.showEmptyState()}switchToAnalysisMode(){this.mode="analysis",this.agentSelectEl&&(this.agentSelectEl.style.display="none"),this.analysisTab=this.analysisTab||"block",this.renderModeToggleButton(),this.setEmptyStateText("\u9009\u62E9\u6216\u8F93\u5165\u4E00\u6761\u65E5\u8BB0"),this.headerTitleEl&&(this.headerTitleEl.textContent="AI\u6D1E\u5BDF",this.headerTitleEl.style.display="none"),this.modeSelectEl&&(this.modeSelectEl.value="analysis"),this.chatModeClearBtnEl&&this.chatModeClearBtnEl.addClass("hidden"),this.inputTextarea&&(this.inputTextarea.placeholder="\u56DE\u7B54\u6F84\u6E05\u95EE\u9898\u6216\u8865\u5145\u80CC\u666F..."),this.containerEl.querySelector(".lifewiki-ai-panel")?.removeClass("chat-mode"),this.updateInputVisibility(),this.applyAnalysisTabVisibility()}clearChatSession(){this.plugin.getSessionManager().clearChatSession(),this.chatMessagesEl?.empty(),this.showEmptyState()}setMode(t){t==="chat"?this.switchToChatMode():this.switchToAnalysisMode()}getMode(){return this.mode}async loadOrGenerateInsight(){if(this.mode!=="analysis"||this.analysisTab!=="insight"||this.isLoading)return;let t=this.getActiveInsightDate(),i=new Date,n=`${i.getFullYear()}-${String(i.getMonth()+1).padStart(2,"0")}-${String(i.getDate()).padStart(2,"0")}`,r=t===n,s=await this.plugin.getCachedInsight(t);if(!r){s?this.renderInsightContent(s.content):this.showInsightEmptyState("\u8BE5\u65E5\u671F\u6CA1\u6709\u6D1E\u5BDF\u62A5\u544A");return}if(!await this.plugin.hasMinimumBlocks(t)){this.showInsightEmptyState("\u4ECA\u65E5\u65E5\u8BB0\u8F83\u5C11\uFF0C\u591A\u5199\u51E0\u6761\u518D\u6765\u770B\u6D1E\u5BDF");return}let o=await this.plugin.readDailyDiary(t),l=await this.plugin.readYesterdayDiary(t),c=await Ee(o||"",l);if(s&&s.contentHash===c){this.renderInsightContent(s.content);return}this.isLoading=!0,this.showInsightGenerating();let u={onDelta:d=>this.appendInsightChunk(d),onDone:d=>{this.isLoading=!1,this.insightBuffer&&(this.renderInsightContent(this.insightBuffer),this.insightBuffer="")},onError:d=>{this.isLoading=!1,this.showInsightError(d.message)}};try{await this.plugin.generateDailyInsight(t,u)}catch(d){this.isLoading=!1,this.showInsightError(d.message)}}insightBuffer="";getActiveInsightDate(){let t=this.plugin.getBlockEditorDate();if(t)return t;let i=new Date,n=i.getFullYear(),r=String(i.getMonth()+1).padStart(2,"0"),s=String(i.getDate()).padStart(2,"0");return`${n}-${r}-${s}`}showInsightEmptyState(t){if(!this.blockInsightsEl)return;this.blockInsightsEl.empty(),this.blockInsightsEl.addClass("visible"),this.blockInsightsEl.createEl("div",{cls:"lifewiki-insight-empty"}).createEl("p",{text:t})}showInsightGenerating(){if(!this.blockInsightsEl)return;this.blockInsightsEl.empty(),this.blockInsightsEl.addClass("visible"),this.insightBuffer="";let i=this.blockInsightsEl.createEl("div",{cls:"lifewiki-insight-body"}).createEl("div",{cls:"lifewiki-insight-generating"});i.createEl("span",{text:"\u6B63\u5728\u751F\u6210\u4ECA\u65E5\u6D1E\u5BDF"});let n=i.createEl("span",{cls:"lifewiki-thinking-dots"});n.createEl("span",{cls:"lifewiki-thinking-dot"}),n.createEl("span",{cls:"lifewiki-thinking-dot"}),n.createEl("span",{cls:"lifewiki-thinking-dot"})}appendInsightChunk(t){if(!this.blockInsightsEl)return;this.insightBuffer+=t,this.blockInsightsEl.empty(),this.blockInsightsEl.addClass("visible"),this.blockInsightsEl.createEl("div",{cls:"lifewiki-insight-body"}).createEl("pre",{text:this.insightBuffer,cls:"lifewiki-insight-streaming"}),this.scrollInsightToBottom()}renderInsightContent(t){if(!this.blockInsightsEl)return;this.blockInsightsEl.empty(),this.blockInsightsEl.addClass("visible");let i=this.blockInsightsEl.createEl("div",{cls:"lifewiki-insight-body"});P.MarkdownRenderer.render(this.app,t,i,"",this)}showInsightError(t){if(!this.blockInsightsEl)return;this.blockInsightsEl.empty(),this.blockInsightsEl.addClass("visible");let i=this.blockInsightsEl.createEl("div",{cls:"lifewiki-insight-error"});i.createEl("p",{text:`\u751F\u6210\u6D1E\u5BDF\u5931\u8D25: ${t}`}),i.createEl("button",{text:"\u91CD\u8BD5",attr:{type:"button"}}).addEventListener("click",()=>{this.loadOrGenerateInsight()})}scrollInsightToBottom(){this.blockInsightsEl&&(this.blockInsightsEl.scrollTop=this.blockInsightsEl.scrollHeight)}showThinkingIndicator(){if(!this.chatMessagesEl||!this.isLoading)return;this.thinkingEl=this.chatMessagesEl.createEl("div",{cls:"lifewiki-thinking"});let t=this.thinkingEl.createEl("div",{cls:"lifewiki-thinking-dots"});t.createEl("span",{cls:"lifewiki-thinking-dot"}),t.createEl("span",{cls:"lifewiki-thinking-dot"}),t.createEl("span",{cls:"lifewiki-thinking-dot"}),this.scrollToBottom()}hideThinkingIndicator(){this.thinkingEl&&(this.thinkingEl.remove(),this.thinkingEl=null)}scrollToBottom(){let t=this.containerEl.querySelector(".lifewiki-ai-scroll");t&&(t.scrollTop=t.scrollHeight)}setActiveBlock(t,i,n){this.switchToAnalysisMode(),this.activeBlockId=t,this.activeParentId=n||null;let s=this.plugin.getSessionManager().getOrCreateSession(t,n||null);this.showChatState(),this.renderSession(s)}startNewSession(t,i,n,r=null){this.switchToAnalysisMode(),this.activeBlockId=t,this.activeParentId=r,this.showChatState(),this.chatMessagesEl?.empty();let s=this.plugin.getSessionManager(),a=s.getOrCreateSession(t,r);s.setContent(t,i,r),this.renderBlockInsightCards(a)}showAgentSession(t,i,n,r=null){console.log("[TraceMind] showAgentSession called: blockId=",t,"hasAnalysisResult=",!!n.analysisResult),this.switchToAnalysisMode(),this.activeBlockId=t,this.activeParentId=r;let a=this.plugin.getSessionManager().setSession(t,{...n,content:n.content||i,messages:[]},r);this.renderAnalysisStart(a)}async renderAnalysisStart(t){if(!this.chatMessagesEl)return;this.chatMessagesEl.empty();let i=t.analysisResult;if(!i){this.showEmptyState();return}let n=this.flattenEntityPreviews(i),r=n.filter(c=>!c.isArchived),s=n.filter(c=>c.isArchived);this.clarificationQueue=[...r].sort((c,u)=>(u.priorityScore??0)-(c.priorityScore??0)),this.knownEntities=[...s],this.allSessionEntities=[...r,...s],this.currentEntityIndex=0,this.clarificationPhase="summary",this.showChatState();let a=r.map(c=>"**"+c.name+"**"),o=s.map(c=>"**"+c.name+"**"),l="";if(n.length===0){await this.streamChatMessage("\u8FD9\u6761\u65E5\u8BB0\u6682\u65F6\u6CA1\u6709\u9700\u8981\u786E\u8BA4\u5F52\u6863\u7684\u5185\u5BB9\u3002"),this.clarificationPhase="complete";return}if(a.length>0&&o.length>0?l="\u8FD9\u6761\u65E5\u8BB0\u4E2D\u63D0\u5230\u7684 "+a.join("\u3001")+" \u6211\u4E0D\u592A\u719F\u6089\uFF0C\u9700\u8981\u4F60\u5E2E\u6211\u8865\u5145\u4E00\u4E9B\u4FE1\u606F\u3002"+o.join("\u3001")+" \u6211\u4E86\u89E3\u3002":a.length>0?l="\u8FD9\u6761\u65E5\u8BB0\u4E2D\u63D0\u5230\u7684 "+a.join("\u3001")+" \u6211\u4E0D\u592A\u719F\u6089\uFF0C\u9700\u8981\u4F60\u5E2E\u6211\u8865\u5145\u4E00\u4E9B\u4FE1\u606F\u3002":l="\u8FD9\u6761\u65E5\u8BB0\u4E2D\u63D0\u5230\u7684 "+o.join("\u3001")+" \u6211\u90FD\u4E86\u89E3\u3002",await this.streamChatMessage(l),this.clarificationQueue.length>0){this.clarificationPhase="clarifying";let c="**"+this.clarificationQueue[0].name+"**";await this.streamChatMessage("\u5148\u4ECE "+c+" \u5F00\u59CB\u5427\u3002"),setTimeout(async()=>{await this.askCurrentEntityQuestion()},500)}else await this.finishClarification();this.scrollToBottom()}async askCurrentEntityQuestion(){if(this.currentEntityIndex>=this.clarificationQueue.length){await this.finishClarification();return}let t=this.clarificationQueue[this.currentEntityIndex],i=t.clarificationQuestions?.[0]??"\u80FD\u544A\u8BC9\u6211\u5173\u4E8E\u300C"+t.name+"\u300D\u7684\u66F4\u591A\u4FE1\u606F\u5417\uFF1F";await this.streamChatMessage(i),this.scrollToBottom(),this.inputTextarea&&(this.inputTextarea.placeholder="\u56DE\u590D\u5173\u4E8E\u300C"+t.name+"\u300D\u7684\u95EE\u9898\uFF0C\u6216\u8BF4\u201C\u8DF3\u8FC7\u201D",this.inputTextarea.focus())}async skipCurrentEntity(){let t=this.clarificationQueue[this.currentEntityIndex].name;if(await this.streamChatMessage("\u597D\u7684\uFF0C\u5148\u8DF3\u8FC7 **"+t+"**\u3002"),this.currentEntityIndex++,this.clarificationPhase="clarifying",this.currentEntityIndex>=this.clarificationQueue.length)await this.finishClarification();else{let i=this.clarificationQueue[this.currentEntityIndex].name;await this.streamChatMessage("\u518D\u6765\u770B\u770B **"+i+"**\u3002"),await this.askCurrentEntityQuestion()}}async finishClarification(){if(this.knownEntities.length>0&&this.clarificationPhase!=="review_known"){this.clarificationPhase="review_known";let i=this.knownEntities.map(function(n){return"**"+n.name+"**"}).join("\u3001");await this.streamChatMessage("\u5BF9\u4E86\uFF0C"+i+" \u4F60\u8FD8\u6709\u65B0\u7684\u4FE1\u606F\u8981\u8865\u5145\u5417\uFF1F\u6CA1\u6709\u7684\u8BDD\u8BF4\u201C\u6CA1\u6709\u4E86\u201D\u5C31\u597D\u3002"),this.scrollToBottom(),this.inputTextarea&&(this.inputTextarea.placeholder="\u8F93\u5165\u8865\u5145\u4FE1\u606F\uFF0C\u6216\u8BF4\u201C\u6CA1\u6709\u4E86\u201D\u2026",this.inputTextarea.focus());return}this.clarificationPhase="complete";let t=this.currentSessionContent();if(t){let i=this.plugin.getEntityManager();for(let n of this.allSessionEntities)if(n.isArchived){let r=i.findEntity(n.name);r&&await i.addInteraction(r.id,{timestamp:new Date().toISOString(),type:"diary_mention",content:t})}}if(this.allSessionEntities.length>=1){let i=this.plugin.getEntityManager();for(let n of this.allSessionEntities){let r=i.findEntity(n.name);r&&await i.refreshWikilinks(r.id)}}if(this.allSessionEntities.length>0){let i=this.allSessionEntities.map(function(n){return"**"+n.name+"**"}).join("\u3001");await this.streamChatMessage("\u597D\u4E86\uFF0C\u8FD9\u6B21\u5148\u5230\u8FD9\u91CC\u3002"+i+" \u5DF2\u66F4\u65B0\u3002\u53EF\u4EE5\u5728\u5DE6\u4FA7\u6587\u4EF6\u5217\u8868\u4E2D\u67E5\u770B\u3002\u6709\u7A7A\u518D\u7EE7\u7EED\u8865\u5145\u3002")}else await this.streamChatMessage("\u597D\u4E86\uFF0C\u8FD9\u6B21\u5148\u5230\u8FD9\u91CC\u3002\u53EF\u4EE5\u5728\u5DE6\u4FA7\u6587\u4EF6\u5217\u8868\u4E2D\u67E5\u770B\u3002\u6709\u7A7A\u518D\u7EE7\u7EED\u8865\u5145\u3002");this.scrollToBottom(),this.inputTextarea&&(this.inputTextarea.placeholder="\u56DE\u7B54\u6F84\u6E05\u95EE\u9898\u6216\u8865\u5145\u80CC\u666F...")}renderSession(t){if(t.messages&&t.messages.length>0){if(this.replayingHistory=!0,this.chatMessagesEl){this.chatMessagesEl.empty();for(let i of t.messages)(i.role==="user"||i.role==="assistant")&&this.addChatMessage(i.role,i.content)}this.replayingHistory=!1,this.showChatState();return}this.renderAnalysisStart(t)}updateAnalysis(t){if(console.log("[TraceMind] updateAnalysis called: blockId=",t.blockId),!this.activeBlockId&&t.blockId&&(this.activeBlockId=t.blockId,this.activeParentId=null),!this.activeBlockId)return;let i=this.plugin.getSessionManager();i.setAnalysisResult(this.activeBlockId,t,this.activeParentId),this.switchToAnalysisMode();let n=i.getSession(this.activeBlockId,this.activeParentId);n&&this.renderAnalysisStart(n),this.refreshEntityIndexAttention()}renderBlockInsightCards(t){if(!this.blockInsightsEl){console.log("[TraceMind] renderBlockInsight: blockInsightsEl is null");return}if(this.blockInsightsEl.empty(),console.log("[TraceMind] renderBlockInsight: mode=",this.mode,"hasSession=",!!t,"analysisResult=",t?.analysisResult?"present":"null"),!t||this.mode!=="analysis"){this.blockInsightsEl.removeClass("visible"),console.log("[TraceMind] renderBlockInsight: early return - no session or not analysis mode");return}let i=this.flattenEntityPreviews(t.analysisResult);console.log("[TraceMind] renderBlockInsight: flattened entities count:",i.length,i);let n=0;n+=this.renderEntityCards(this.blockInsightsEl,i,t),n+=this.renderRelationCards(this.blockInsightsEl,i,t),n===0&&this.createInsightSection(this.blockInsightsEl,"\u5F85\u786E\u8BA4").createEl("div",{cls:"lifewiki-memory-empty",text:"\u8FD9\u6761\u65E5\u8BB0\u6682\u65F6\u6CA1\u6709\u9700\u8981\u786E\u8BA4\u5F52\u6863\u7684\u5185\u5BB9\u3002"}),this.applyAnalysisTabVisibility()}flattenEntityPreviews(t){return t?[...t.entities.people,...t.entities.objects,...t.entities.dimensions]:[]}renderEntityCards(t,i,n){if(i.length===0)return 0;let r=i.slice(0,6).filter(o=>!this.isReviewCardDone(n,this.entityCardId(o)));if(r.length===0)return 0;let s=this.createInsightSection(t,"\u5B9E\u4F53\u4E0E\u80CC\u666F"),a=0;for(let o of r){let l=this.entityCardId(o);a++;let c=o.isArchived||!!this.plugin.getEntityManager()?.findEntity(o.name),u=this.getReviewSupplement(n,l),d=o.maturity?this.maturityLabel(o.maturity):"",h=[this.getEntityTypeLabel(o.type),c?"\u5DF2\u6709\u6863\u6848":"\u5F85\u5F52\u6863",`\u7F6E\u4FE1\u5EA6 ${Math.round(o.confidence*100)}%`,...d?[d]:[]],p=this.createConfirmCard(s,{title:`${c?"\u5DF2\u8BC6\u522B":"\u65B0"}${this.getEntityTypeLabel(o.type)}\uFF1A${o.name}`,body:o.context||"AI \u4ECE\u8FD9\u6761\u65E5\u8BB0\u4E2D\u8BC6\u522B\u5230\u8FD9\u4E2A\u5B9E\u4F53\uFF0C\u4F46\u8FD8\u7F3A\u5C11\u80CC\u666F\u8BF4\u660E\u3002",chips:h,supplement:u});if(o.clarificationQuestions&&o.clarificationQuestions.length>0){let g=p.createEl("div",{cls:"lifewiki-confirm-card-supplement"});g.createEl("div",{cls:"lifewiki-confirm-card-supplement-label",text:"\u5F85\u6F84\u6E05"}),g.createEl("div",{text:o.clarificationQuestions[0]})}let f=!o.maturity||o.maturity==="L0"||o.maturity==="L1";c&&!f?this.addConfirmAction(p,"\u8BB0\u5F55\u4E92\u52A8","primary",async()=>{await this.recordEntityInteraction(o.name,this.mergeSupplement(`\u65E5\u8BB0\u63D0\u5230\uFF1A${this.currentSessionContent()}`,u)),this.markReviewCard(l,"confirmed",u),this.replaceCardWithStatus(p,`\u5DF2\u628A\u8FD9\u6B21\u4E92\u52A8\u8BB0\u5F55\u5230\u300C${o.name}\u300D\u6863\u6848\u3002`)}):c||this.addConfirmAction(p,f?"\u786E\u8BA4\u5E76\u8865\u5145":"\u786E\u8BA4","primary",async()=>{await this.archiveEntityPreview(o,u),this.markReviewCard(l,"confirmed",u),this.replaceCardWithStatus(p,`\u5DF2\u5F52\u6863\u300C${o.name}\u300D\u3002`)}),this.addConfirmAction(p,"\u8865\u5145\u80CC\u666F","",()=>{this.showSupplementEditor(p,l,`\u8865\u5145\u300C${o.name}\u300D\u7684\u80CC\u666F`,u)}),this.addConfirmAction(p,"\u8DF3\u8FC7","",()=>{this.markReviewCard(l,"skipped",u),p.remove()})}return a}renderRelationCards(t,i,n){let r=i.filter(p=>this.plugin.getEntityManager()?.findEntity(p.name)),s=r.length>=2?r.slice(0,2):i.slice(0,2);if(s.length<2)return 0;let[a,o]=s,l=this.relationCardId(a,o);if(this.isReviewCardDone(n,l))return 0;let c=this.createInsightSection(t,"\u5173\u7CFB\u7EBF\u7D22"),u=r.length>=2,d=this.getReviewSupplement(n,l),h=this.createConfirmCard(c,{title:`${a.name} \u548C ${o.name} \u7684\u5173\u7CFB`,body:"\u8FD9\u6761\u65E5\u8BB0\u540C\u65F6\u63D0\u5230\u4E86\u5B83\u4EEC\u3002\u5173\u7CFB\u7C7B\u578B\u6700\u597D\u7531\u4F60\u786E\u8BA4\u540E\u518D\u5F52\u6863\u3002",chips:["\u5173\u7CFB",u?"\u53EF\u5F52\u6863":"\u9700\u5148\u5F52\u6863\u5B9E\u4F53"],supplement:d});return u&&this.addConfirmAction(h,"\u8BB0\u5F55\u4E3A\u76F8\u5173","primary",async()=>{await this.handleRelations([{from:a.name,to:o.name,relation:"related_to",context:d}]),this.markReviewCard(l,"confirmed",d),this.replaceCardWithStatus(h,`\u5DF2\u8BB0\u5F55\u300C${a.name}\u300D\u548C\u300C${o.name}\u300D\u7684\u76F8\u5173\u5173\u7CFB\u3002`)}),this.addConfirmAction(h,"\u8BF4\u660E\u5173\u7CFB",u?"":"primary",()=>{this.showSupplementEditor(h,l,`\u8BF4\u660E\u300C${a.name}\u300D\u548C\u300C${o.name}\u300D\u7684\u5173\u7CFB`,d)}),this.addConfirmAction(h,"\u8DF3\u8FC7","",()=>{this.markReviewCard(l,"skipped",d),h.remove()}),1}createInsightSection(t,i){let n=t.createEl("div",{cls:"lifewiki-insight-section"});return n.createEl("div",{cls:"lifewiki-insight-section-title",text:i}),n}createConfirmCard(t,i){let n=t.createEl("div",{cls:"lifewiki-confirm-card"});if(n.createEl("div",{cls:"lifewiki-confirm-card-title",text:i.title}),n.createEl("div",{cls:"lifewiki-confirm-card-body",text:i.body}),i.supplement){let s=n.createEl("div",{cls:"lifewiki-confirm-card-supplement"});s.createEl("div",{cls:"lifewiki-confirm-card-supplement-label",text:"\u4F60\u7684\u8865\u5145"}),s.createEl("div",{text:i.supplement})}let r=n.createEl("div",{cls:"lifewiki-confirm-card-meta"});for(let s of i.chips.filter(Boolean))r.createEl("span",{cls:"lifewiki-confirm-chip",text:s});return n.createEl("div",{cls:"lifewiki-confirm-actions"}),n}addConfirmAction(t,i,n,r){let s=t.querySelector(".lifewiki-confirm-actions");if(!s)return;let a=s.createEl("button",{cls:`lifewiki-confirm-action ${n}`,text:i,attr:{type:"button"}});a.addEventListener("click",async o=>{o.stopPropagation(),a.setAttribute("disabled","true");try{await r()}catch(l){console.error("[AIAnalysisPanel] confirm action failed:",l),this.replaceCardWithStatus(t,`\u64CD\u4F5C\u5931\u8D25\uFF1A${l.message}`)}finally{a.removeAttribute("disabled")}})}replaceCardWithStatus(t,i){t.empty(),t.createEl("div",{cls:"lifewiki-confirm-card-body",text:i})}entityCardId(t){return`entity:${t.type}:${t.name}`}relationCardId(t,i){return`relation:${t.name}:${i.name}`}isReviewCardDone(t,i){let n=t.reviewCards?.[i]?.status;return n==="confirmed"||n==="skipped"}getReviewSupplement(t,i){return t.reviewCards?.[i]?.supplement||""}markReviewCard(t,i,n){this.activeBlockId&&this.plugin.getSessionManager().updateReviewCard(this.activeBlockId,t,{status:i,supplement:n},this.activeParentId)}showSupplementEditor(t,i,n,r=""){t.querySelector(".lifewiki-confirm-card-editor")?.remove();let s=t.querySelector(".lifewiki-confirm-actions"),a=t.createEl("div",{cls:"lifewiki-confirm-card-editor"});s&&t.insertBefore(a,s),a.createEl("div",{cls:"lifewiki-confirm-card-supplement-label",text:n});let o=a.createEl("textarea",{cls:"lifewiki-confirm-card-textarea",attr:{rows:"3"}});o.value=r,a.createEl("button",{cls:"lifewiki-confirm-action primary",text:"\u4FDD\u5B58\u8865\u5145",attr:{type:"button"}}).addEventListener("click",()=>{let c=o.value.trim();this.markReviewCard(i,"pending",c),this.renderBlockInsightCards(this.activeBlockId?this.plugin.getSessionManager().getSession(this.activeBlockId,this.activeParentId):null)}),o.focus()}mergeSupplement(t,i){let n=i?.trim();return n?`${t}
\u8865\u5145\uFF1A${n}`:t}currentSessionContent(){return this.activeBlockId&&this.plugin.getSessionManager().getSession(this.activeBlockId,this.activeParentId)?.content||""}prefillInput(t){this.inputTextarea&&(this.analysisTab="block",this.applyAnalysisTabVisibility(),this.inputTextarea.value=t,this.inputTextarea.focus(),this.autoResizeTextarea(),this.updateSendBtnState())}async archiveEntityPreview(t,i=""){let n=this.plugin.getEntityManager();if(!n)return;if(n.findEntity(t.name)){await this.recordEntityInteraction(t.name,this.mergeSupplement(t.context||`\u65E5\u8BB0\u63D0\u5230\uFF1A${this.currentSessionContent()}`,i));return}let s=t.context||"\u4ECE\u65E5\u8BB0\u4E2D\u5F52\u6863",a=this.mergeSupplement(`\u5F52\u6863\uFF1A${s||"\u4ECE\u65E5\u8BB0\u4E2D\u53D1\u73B0"}`,i);try{await n.createEntity({type:t.type,title:t.name,titleRaw:t.name,aliases:[],tags:[],summary:s,confidence:t.confidence||.8,verificationStatus:"verified",createdAt:new Date().toISOString(),createdBy:"ai",lastUpdated:new Date().toISOString(),relatedEntities:[],interactions:[{timestamp:new Date().toISOString(),type:"ai_analysis",content:a,sourceBlockId:this.activeBlockId||void 0}],metadata:{status:"active",source:"diary",...t.type==="person"?{person_kind:this.inferPersonKind(t)}:{}}})}catch(o){if(!n.findEntity(t.name))throw o;await this.recordEntityInteraction(t.name,this.mergeSupplement(t.context||`\u65E5\u8BB0\u63D0\u5230\uFF1A${this.currentSessionContent()}`,i))}}async recordEntityInteraction(t,i){let n=this.plugin.getEntityManager(),r=n?.findEntity(t);r&&await n.addInteraction(r.id,{timestamp:new Date().toISOString(),type:"diary_mention",content:i,sourceBlockId:this.activeBlockId||void 0})}inferPersonKind(t){let i=`${t.name} ${t.context||""}`;return/公司|智能|科技|集团|有限|实验室|研究院|研究所|管委会|委员会|部门|团队|机构|中心|银行|移动|电信|联通|大学|学院|医院|政府|协会|基金|资本|投资|园区/i.test(i)?"\u7EC4\u7EC7":"\u4E2A\u4EBA"}async renderEntityIndex(){if(!this.entityIndexEl||this.mode!=="analysis")return;if(this.analysisTab!=="insight"){this.entityIndexEl.removeClass("visible");return}this.entityIndexEl.empty(),this.entityIndexEl.addClass("visible");let t=this.plugin.entityIndex;if(!t||t.entries.length===0){this.entityIndexEl.createEl("div",{cls:"lifewiki-entity-index-empty",text:"\u8FD8\u6CA1\u6709\u5B9E\u4F53\u6863\u6848\u3002\u5206\u6790\u65E5\u8BB0\u540E\u4F1A\u9010\u6B65\u5EFA\u7ACB\u3002"});return}let i=new Map;for(let n of t.entries){let r=n.cardType;i.has(r)||i.set(r,[]),i.get(r).push(n)}for(let[n,r]of this.sortedTypeGroups(i)){let s=this.getEntityTypeLabel(n);this.renderEntityIndexSection(s,r)}}sortedTypeGroups(t){let i=["person","object","theme"],n=[];for(let r of i){let s=t.get(r);s&&s.length>0&&n.push([r,s])}return n}renderEntityIndexSection(t,i){if(!this.entityIndexEl)return;let n=this.entityIndexEl.createEl("div",{cls:"lifewiki-entity-index-section"}),r=n.createEl("div",{cls:"lifewiki-entity-index-header"});r.createEl("span",{text:t}),r.createEl("span",{cls:"lifewiki-entity-index-count",text:String(i.length)});let s=[...i].sort((a,o)=>{let l=new Date(o.lastUpdated).getTime(),c=new Date(a.lastUpdated).getTime();return l-c}).slice(0,20);for(let a of s){let o=n.createEl("div",{cls:"lifewiki-entity-index-item"});o.createEl("div",{cls:"lifewiki-entity-index-item-title",text:a.name});let l=o.createEl("div",{cls:"lifewiki-entity-index-meta"}),c=[];a.maturity&&c.push(this.maturityLabel(a.maturity)),c.push(`\u7F6E\u4FE1\u5EA6 ${Math.round((a.confidence||0)*100)}%`),a.relationCount>0&&c.push(`\u5173\u8054 ${a.relationCount}`),a.subtype&&c.push(te(a.cardType,a.subtype)||a.subtype);for(let u of c){let d=u.startsWith("L");l.createEl("span",{cls:`lifewiki-entity-index-chip${d?" maturity":""}`,text:u})}}}async refreshEntityIndexAttention(){this.hasTodayInsightAttention=!0,this.mode==="analysis"&&this.analysisTab==="insight"&&this.renderAnalysisTabs()}addChatMessage(t,i){if(!this.chatMessagesEl)return null;this.showChatState();let n=this.chatMessagesEl.createEl("div",{cls:`lifewiki-chat-msg ${t}`});return t==="assistant"&&(n.setAttr("title","\u70B9\u51FB\u590D\u5236"),n.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(n.innerText.replace(/已复制$/,"").trim()||i);let r=n.createEl("span",{cls:"lifewiki-chat-msg-copy-hint",text:"\u5DF2\u590D\u5236"});setTimeout(()=>r.remove(),1500)}catch(r){console.error("Failed to copy:",r)}})),t==="assistant"&&i?this.renderMessageMarkdown(n,i):this.renderMessageContent(n,i),this.scrollToBottom(),!this.replayingHistory&&this.mode==="analysis"&&this.activeBlockId&&i&&this.plugin.getSessionManager().addMessage(this.activeBlockId,{role:t,content:i},this.activeParentId),n}renderMessageContent(t,i){t.empty();let n=i.split(/\*\*(.+?)\*\*/g);for(let r=0;r<n.length;r++)r%2===1?t.createEl("strong",{text:n[r]}):t.createEl("span",{text:n[r]})}async renderMessageMarkdown(t,i){t.empty(),await P.MarkdownRenderer.render(this.app,i,t,"",this)}async streamChatMessage(t){let i=this.stripThinking(t),n=this.addChatMessage("assistant","");if(!n)return null;let r="",s=i.length>220?3:1;for(let a=0;a<i.length;a+=s)r+=i.slice(a,a+s),this.renderMessageContent(n,r),this.scrollToBottom(),await new Promise(o=>setTimeout(o,8));return await this.renderMessageMarkdown(n,i),!this.replayingHistory&&this.mode==="analysis"&&this.activeBlockId&&this.plugin.getSessionManager().addMessage(this.activeBlockId,{role:"assistant",content:i},this.activeParentId),n}async sendMessage(){if(!this.inputTextarea||this.isLoading)return;let t=this.inputTextarea.value.trim();if(!t)return;if(this.mode==="chat"){await this.sendChatMessage(t);return}if(!this.activeBlockId)return;let i=t.toLowerCase().trim();if(this.clarificationPhase==="review_known"&&(i==="\u6CA1\u6709"||i==="\u6CA1\u6709\u4E86"||i==="\u4E0D\u7528\u4E86"||i==="no"||i==="\u7ED3\u675F")){this.isLoading=!0,this.inputTextarea.value="",this.autoResizeTextarea(),this.updateSendBtnState(),this.addChatMessage("user",t),await this.streamChatMessage("\u597D\u7684\uFF0C\u90A3\u5C31\u5230\u8FD9\u91CC\u3002"),this.knownEntities=[],await this.finishClarification(),this.isLoading=!1,this.updateSendBtnState();return}if(this.clarificationPhase==="clarifying"){if(i==="\u8DF3\u8FC7"||i==="skip"||i==="\u4E0B\u4E00\u4E2A"||i==="next"){this.isLoading=!0,this.inputTextarea.value="",this.autoResizeTextarea(),this.updateSendBtnState(),this.addChatMessage("user",t),await this.skipCurrentEntity(),this.isLoading=!1,this.updateSendBtnState();return}if(i==="\u7ED3\u675F"||i==="\u4E0D\u7528\u4E86"||i==="finish"||i==="stop"){this.isLoading=!0,this.inputTextarea.value="",this.autoResizeTextarea(),this.updateSendBtnState(),this.addChatMessage("user",t),await this.finishClarification(),this.isLoading=!1,this.updateSendBtnState();return}}this.isLoading=!0,this.inputTextarea.value="",this.autoResizeTextarea(),this.updateSendBtnState(),this.addChatMessage("user",t),this.showThinkingIndicator();try{if(this.clarificationPhase==="clarifying"){let n=this.clarificationQueue[this.currentEntityIndex];this.hideThinkingIndicator();let r=await this.parseClarificationResponse(t,n);if(await this.streamChatMessage(r.acknowledgment),await this.updateEntityFromClarification(n,r.attributes,t),this.currentEntityIndex++,this.currentEntityIndex>=this.clarificationQueue.length)await this.finishClarification();else{let s=this.clarificationQueue[this.currentEntityIndex];await this.streamChatMessage("\u597D\u7684\uFF0C\u518D\u6765\u770B\u770B **"+s.name+"**\u3002"),setTimeout(async()=>{await this.askCurrentEntityQuestion()},300)}}else if(this.clarificationPhase==="review_known"){this.hideThinkingIndicator();let n=t.toLowerCase().trim();if(n==="\u6CA1\u6709"||n==="\u6CA1\u6709\u4E86"||n==="\u4E0D\u7528\u4E86"||n==="no"||n==="nope"||n==="\u7ED3\u675F"||n==="\u7ED3\u675F\u4E86")this.knownEntities=[],await this.finishClarification();else{if(this.knownEntities.length===1){let r=await this.parseClarificationResponse(t,this.knownEntities[0]);await this.updateEntityFromClarification(this.knownEntities[0],r.attributes||{},t)}else{let r=await this.parseMultiEntityResponse(t,this.knownEntities);for(let s of this.knownEntities){let a=r[s.name]||{};await this.updateEntityFromClarification(s,a,t)}}await this.streamChatMessage("\u5DF2\u66F4\u65B0\u4E86 "+this.knownEntities.length+" \u4E2A\u5B9E\u4F53\u7684\u4FE1\u606F\u3002"),this.knownEntities=[],await this.finishClarification()}}}catch(n){console.error("AI chat error:",n),this.hideThinkingIndicator(),this.addChatMessage("assistant","\u62B1\u6B49\uFF0CAI \u54CD\u5E94\u5931\u8D25: "+n.message)}this.isLoading=!1,this.updateSendBtnState()}async parseMultiEntityResponse(t,i){let n=this.plugin.getAIProvider(),s=`\u7528\u6237\u5BF9\u4EE5\u4E0B\u5B9E\u4F53\u505A\u4E86\u8865\u5145\uFF1A
`+i.map(a=>"- "+a.name+" ["+a.type+"]").join(`
`)+`

\u7528\u6237\u56DE\u7B54\uFF1A`+t+`

\u8BF7\u4E3A\u6BCF\u4E2A\u5B9E\u4F53\u63D0\u53D6\u5C5E\u6027\uFF0C\u4F8B\u5982\u7528\u6237\u8BF4\u201C\u5F20\u4E09\u5728\u5B57\u8282\u505APM\uFF0C\u5C0F\u674E\u662F\u5356\u65B9\u201D\uFF0C\u5219\u8FD4\u56DE\uFF1A{"\u5F20\u4E09":{"company":"\u5B57\u8282","role":"PM"},"\u5C0F\u674E":{"relationship_to_user":"\u5356\u65B9"}}
\u53EA\u8FD4\u56DE\u5408\u6CD5 JSON\u3002`;try{let a=await n.chat([{role:"user",content:s}],"analysis"),o=this.extractJSON(a.content);return JSON.parse(o)}catch{return{}}}async parseClarificationResponse(t,i){let n=this.plugin.getAIProvider(),r=this.plugin.getUserProfileContext(),s=["\u7528\u6237\u56DE\u7B54\u4E86\u5173\u4E8E\u300C"+i.name+"\u300D\uFF08\u7C7B\u578B\uFF1A"+this.getEntityTypeLabel(i.type)+"\uFF09\u7684\u6F84\u6E05\u95EE\u9898\u3002"];r&&(s.push(""),s.push(r),s.push(""),s.push("\u6839\u636E\u4E0A\u8FF0\u7528\u6237\u6863\u6848\uFF0C\u8BF7\u505A\u5408\u7406\u63A8\u65AD\u3002\u4F8B\u5982\uFF1A\u7528\u6237\u56DE\u7B54\u201C\u662F\u540C\u4E8B\u201D\uFF0C\u5219\u516C\u53F8\u5E94\u4E0E\u7528\u6237\u6863\u6848\u4E2D\u7684\u516C\u53F8\u76F8\u540C\u3002\u7528\u6237\u56DE\u7B54\u201C\u662F\u670B\u53CB\u201D\uFF0C\u5219\u5173\u7CFB\u4E3A friend\u3002")),s.push(""),s.push("\u7528\u6237\u56DE\u7B54\uFF1A"+t);let a=s.concat(["\u8BF7\u4ECE\u7528\u6237\u56DE\u7B54\u4E2D\u63D0\u53D6\u5173\u952E\u5C5E\u6027\u4FE1\u606F\u3002","","\u5F53\u524D\u5B9E\u4F53\u7C7B\u578B\u662F "+i.type+"\uFF0C\u53EF\u7528\u7684\u5C5E\u6027\u540D\u4E3A\uFF1A",Tt(i.type),"","=== \u91CD\u8981\uFF1Aattributes \u5FC5\u987B\u662F\u5E73\u94FA\u7684 key-value\uFF0C\u4E0D\u8981\u5D4C\u5957===",'\u9519\u8BEF\u793A\u4F8B\uFF1A{ "person": { "company": "xxx" } }','\u6B63\u786E\u793A\u4F8B\uFF1A{ "company": "xxx", "role": "xxx" }',"","\u8FD4\u56DE\u4E00\u4E2A JSON \u5BF9\u8C61\uFF0C\u4F8B\u5982\u7528\u6237\u8BF4\u201C\u5F20\u4E09\u662F\u5B57\u8282\u8DF3\u52A8\u7684\u4EA7\u54C1\u7ECF\u7406\uFF0C\u662F\u6211\u540C\u4E8B\uFF0C\u53EB\u4ED6\u4E09\u54E5\u201D\uFF0C\u5219\u8FD4\u56DE\uFF1A","{",'  "acknowledgment": "\u660E\u767D\u4E86\uFF0C\u5F20\u4E09\u5728\u5B57\u8282\u8DF3\u52A8\u505A\u4EA7\u54C1\u7ECF\u7406\uFF0C\u662F\u4F60\u540C\u4E8B\u3002",','  "attributes": { "company": "\u5B57\u8282\u8DF3\u52A8", "role": "\u4EA7\u54C1\u7ECF\u7406", "relationship_to_user": "\u540C\u4E8B", "aliases": "\u4E09\u54E5" }',"}","","\u53EA\u8FD4\u56DE\u5408\u6CD5 JSON\uFF0C\u4E0D\u8981 markdown\u3002"]).join(`
`);try{let o=await n.chat([{role:"user",content:a}],"analysis"),l=this.extractJSON(o.content),c=JSON.parse(l);return{acknowledgment:c.acknowledgment||`\u660E\u767D\u4E86\uFF0C\u5173\u4E8E\u300C${i.name}\u300D\u7684\u4FE1\u606F\u5DF2\u8BB0\u5F55\u3002`,attributes:c.attributes||{}}}catch{return{acknowledgment:`\u6536\u5230\uFF0C\u5173\u4E8E\u300C${i.name}\u300D\u7684\u4FE1\u606F\u5DF2\u8BB0\u5F55\u3002`,attributes:{}}}}extractJSON(t){let i=t.indexOf("{");if(i<0)return"{}";let n=0;for(let r=i;r<t.length;r++)if(t[r]==="{")n++;else if(t[r]==="}"&&(n--,n===0))return t.slice(i,r+1);return"{}"}flattenAttributes(t){let i={},n=["person","object","theme"];for(let[r,s]of Object.entries(t))n.includes(r)&&typeof s=="object"&&s!==null?Object.assign(i,s):i[r]=s;return i}normalizeAttributes(t,i){let n={},r={title:"role",position:"role",job:"role",relationship:"relationship_to_user",relation:"relationship_to_user",company_name:"company",organization:"company",type:"subtype",state:"status",due_date:"deadline",due:"deadline",count:"occurrenceCount",frequency:"occurrenceCount"};for(let[s,a]of Object.entries(t)){let o=r[s]||s;n[o]=a}return n}async updateEntityFromClarification(t,i,n){let r=this.flattenAttributes(i),s=this.normalizeAttributes(r,t.type),a=s.aliases;delete s.aliases;let o=[];typeof a=="string"?o.push(...a.split(/[,，、]/).map(u=>u.trim()).filter(Boolean)):Array.isArray(a)&&o.push(...a.map(String));let l=this.plugin.getEntityManager(),c=l.findEntity(t.name);if(c){let d=l.getEntity(c.id)?.aliases||[],h=[...new Set([...d,...o])];await l.updateEntity(c.id,{...s,aliases:h,lastUpdated:new Date().toISOString()})}else{let u=this.currentSessionContent();await l.createEntity({title:t.name,type:t.type,aliases:o,metadata:s,interactions:[{timestamp:new Date().toISOString(),type:"diary_mention",content:u||t.context||t.name}]})}if(n){let u=l.findEntity(t.name);u&&await l.addInteraction(u.id,{timestamp:new Date().toISOString(),type:"user_feedback",content:n})}}async continueBlockConversation(t){if(!this.activeBlockId)throw new Error("No active block");let i=this.plugin.getSessionManager().getSession(this.activeBlockId,this.activeParentId),n=i?.content||this.currentSessionContent(),r=this.plugin.getUserProfileContext(),s=this.plugin.getAIProvider(),a=i?.messages||[],o="\u4F60\u662F TraceMind \u7684\u65E5\u8BB0\u5206\u6790\u52A9\u624B\u3002\u56F4\u7ED5\u5F53\u524D\u8FD9\u6761\u65E5\u8BB0\uFF0C\u7528\u81EA\u7136\u4E2D\u6587\u5E2E\u52A9\u7528\u6237\u8865\u5145\u5B9E\u4F53\u80CC\u666F\u3001\u4E8B\u5B9E\u3001\u5173\u7CFB\u548C\u4E92\u52A8\u8BB0\u5F55\u3002\u4E00\u6B21\u53EA\u95EE\u4E00\u4E2A\u5173\u952E\u95EE\u9898\uFF0C\u907F\u514D\u8F93\u51FA\u4EE3\u7801\u6216 JSON\u3002";r&&(o+=`

`+r+`

\u8BF7\u6839\u636E\u7528\u6237\u6863\u6848\u505A\u5408\u7406\u63A8\u65AD\u3002\u4F8B\u5982\u7528\u6237\u56DE\u7B54"\u662F\u540C\u4E8B"\uFF0C\u5219\u516C\u53F8\u5E94\u4E0E\u7528\u6237\u76F8\u540C\u3002`);let l=await s.chat([{role:"system",content:o},{role:"user",content:"\u5F53\u524D\u65E5\u8BB0\uFF1A"+(n||"\u65E0")},...a.length>0?a.slice(-8):[{role:"user",content:t}]],"analysis");return{aiResponse:this.stripThinking(l.content)}}async executeChatActions(t){let i=[],n=this.plugin.getEntityManager();for(let r of t)try{switch(r.action){case"search_entity":{let s=n.findEntity(r.name||"");if(s){let a=["\u627E\u5230\u5B9E\u4F53\uFF1A"+s.name];a.push("\u7C7B\u578B\uFF1A"+s.cardType),s.subtype&&a.push("\u5B50\u7C7B\u578B\uFF1A"+s.subtype),s.maturity&&a.push("\u6210\u719F\u5EA6\uFF1A"+s.maturity),i.push(a.join("\uFF0C"))}else i.push("\u672A\u627E\u5230\u5B9E\u4F53\uFF1A"+(r.name||""));break}case"get_entity":{let s=n.findEntity(r.name||"");if(!s){i.push("\u672A\u627E\u5230\u5B9E\u4F53\uFF1A"+(r.name||""));break}try{let a=await this.plugin.app.vault.adapter.read(s.filePath),o=a.match(/^---\n([\s\S]*?)\n---/),l=[];if(o)for(let d of o[1].split(`
`)){let h=d.indexOf(":");if(h>0){let p=d.slice(0,h).trim(),f=d.slice(h+1).trim();p&&f&&p!=="id"&&p!=="name"&&l.push(p+": "+f)}}let c=a.replace(/^---\n[\s\S]*?\n---\n?/,"").trim(),u="=== "+s.name+` \u6863\u6848\u6458\u8981 ===
\u7C7B\u578B\uFF1A`+s.cardType+`
\u5C5E\u6027\uFF1A`+(l.length>0?l.join("\uFF0C"):"\u65E0")+`

--- \u5B8C\u6574\u5185\u5BB9 ---
`+a;i.push(u)}catch{let a=[s.name+" ["+s.cardType+"]"];s.maturity&&a.push("\u6210\u719F\u5EA6\uFF1A"+s.maturity),s.subtype&&a.push("\u5B50\u7C7B\u578B\uFF1A"+s.subtype),i.push(a.join("\uFF0C"))}break}case"create_entity":{if(!r.name||!r.type){i.push("\u521B\u5EFA\u5931\u8D25\uFF1A\u7F3A\u5C11 name \u6216 type");break}let s=n.findEntity(r.name);if(s){i.push("\u5B9E\u4F53\u5DF2\u5B58\u5728\uFF1A"+r.name+" ("+s.cardType+")\uFF0C\u8BF7\u7528 update_entity \u4FEE\u6539");break}await n.createEntity({title:r.name,type:r.type,metadata:r.attributes||{}}),i.push("\u5DF2\u521B\u5EFA "+r.type+" \u5B9E\u4F53\uFF1A"+r.name);break}case"update_entity":{if(!r.name){i.push("\u66F4\u65B0\u5931\u8D25\uFF1A\u7F3A\u5C11 name");break}let s=n.findEntity(r.name);if(!s){i.push("\u672A\u627E\u5230\u5B9E\u4F53\uFF1A"+r.name);break}await n.updateEntity(s.id,r.attributes||{}),i.push("\u5DF2\u66F4\u65B0 "+r.name);break}case"list_diary":{try{let a=(await this.plugin.app.vault.adapter.list("Daily/")).files.filter(c=>c.endsWith(".md")).sort().reverse(),o=new Date().toISOString().split("T")[0],l=a.slice(0,7);if(i.push("Daily/ \u76EE\u5F55\u5171 "+a.length+" \u7BC7\u65E5\u8BB0\u3002\u6700\u8FD1\uFF1A"+l.map(c=>c.replace("Daily/","").replace(".md","")).join("\u3001")),r.dateRange==="today"||!r.dateRange){let c="Daily/"+o+".md";a.includes(c)&&i.push("\u4ECA\u5929\u7684\u65E5\u8BB0\uFF1A"+c)}}catch(s){i.push("\u8BFB\u53D6\u65E5\u8BB0\u5217\u8868\u5931\u8D25\uFF1A"+s.message)}break}case"get_diary":{try{let s=r.date||new Date().toISOString().split("T")[0],a="Daily/"+s+".md",o=await this.plugin.app.vault.adapter.read(a);i.push("\u65E5\u8BB0 "+s+` \u7684\u5185\u5BB9\uFF1A
`+o)}catch(s){i.push("\u8BFB\u53D6\u65E5\u8BB0\u5931\u8D25\uFF1A"+s.message)}break}default:i.push("\u672A\u77E5\u64CD\u4F5C\uFF1A"+r.action)}}catch(s){i.push("\u64CD\u4F5C\u5931\u8D25 "+r.action+": "+s.message)}return i}buildChatSystemPrompt(){let t=[];t.push("\u4F60\u662F TraceMind \u7684 Vault \u7BA1\u5BB6\u52A9\u624B\u3002\u4F60\u53EF\u4EE5\u901A\u8FC7\u5D4C\u5165 [TRACEMIND_ACTION] \u5757\u6765\u6267\u884C\u64CD\u4F5C\u3002"),t.push("\u4E0D\u8981\u8F93\u51FA\u601D\u8003\u8FC7\u7A0B\u3001\u5185\u5FC3\u72EC\u767D\u6216\u81EA\u95EE\u81EA\u7B54\u3002\u76F4\u63A5\u6267\u884C\u64CD\u4F5C\u5E76\u7ED9\u51FA\u7ED3\u679C\u3002");let i=new Date;t.push("\u4ECA\u5929\u662F "+i.getFullYear()+"\u5E74"+(i.getMonth()+1)+"\u6708"+i.getDate()+"\u65E5\u3002"),t.push(""),t.push("\u53EF\u7528\u64CD\u4F5C\uFF1A"),t.push('- search_entity: {"action":"search_entity","name":"\u5B9E\u4F53\u540D"}'),t.push('- get_entity: {"action":"get_entity","type":"person","name":"\u5B9E\u4F53\u540D"}'),t.push('- get_diary: {"action":"get_diary","date":"YYYY-MM-DD"}'),t.push('- create_entity: {"action":"create_entity","type":"person|object|theme","name":"\u540D\u79F0","attributes":{"key":"value"}}'),t.push('- update_entity: {"action":"update_entity","type":"person|object|theme","name":"\u540D\u79F0","attributes":{"key":"value"}}'),t.push(""),t.push("\u4F60\u7684\u80FD\u529B\uFF1A"),t.push("- \u641C\u7D22\u3001\u67E5\u8BE2\u3001\u521B\u5EFA\u3001\u4FEE\u6539 Person/Object/Theme \u6863\u6848"),t.push("- \u67E5\u770B\u4EFB\u610F\u65E5\u671F\u65E5\u8BB0\uFF08\u4F7F\u7528 get_diary \u64CD\u4F5C\uFF09"),t.push("- \u603B\u7ED3\u3001\u5206\u6790\u65E5\u8BB0\uFF08Daily/ \u76EE\u5F55\uFF09"),t.push("- \u64B0\u5199\u5468\u62A5\u3001\u6708\u62A5"),t.push("- \u5206\u6790\u5B9E\u4F53\u5173\u7CFB\u548C\u4E92\u52A8\u6A21\u5F0F"),t.push(""),t.push("\u91CD\u8981\u89C4\u5219\uFF1A"),t.push("- \u5F53\u7528\u6237\u63D0\u53CA\u67D0\u4E2A\u5B9E\u4F53\u65F6\uFF0C\u4F18\u5148\u4F7F\u7528 get_entity \u67E5\u8BE2\u5176\u6863\u6848\uFF0C\u6863\u6848\u4E2D\u5DF2\u5305\u542B\u4E0E\u8BE5\u5B9E\u4F53\u76F8\u5173\u7684\u65E5\u8BB0\u4E92\u52A8\u8BB0\u5F55\u3002\u53EA\u6709\u5728\u6863\u6848\u4FE1\u606F\u4E0D\u8DB3\u65F6\u624D\u7528 get_diary \u8865\u5145\u67E5\u8BE2\u3002"),t.push("- \u521B\u5EFA\u65B0\u5B9E\u4F53\u524D\uFF0C\u5FC5\u987B\u5148\u7528 search_entity \u786E\u8BA4\u4E0D\u5B58\u5728\uFF0C\u907F\u514D\u91CD\u590D\u521B\u5EFA\u3002"),t.push("- \u4FEE\u6539\u5B9E\u4F53\u524D\uFF0C\u5FC5\u987B\u5148\u7528 get_entity \u786E\u8BA4\u5B58\u5728\u5E76\u67E5\u770B\u5F53\u524D\u5C5E\u6027\u3002"),t.push(""),t.push("Vault \u7ED3\u6784\uFF1A"),t.push("- Person/{name}.md \u2014 \u5C5E\u6027: company, role, relationship_to_user, aliases"),t.push("- Object/{name}.md \u2014 \u5C5E\u6027: subtype (company/\u516C\u53F8 project/\u9879\u76EE task/\u4EFB\u52A1 product/\u4EA7\u54C1 technology/\u6280\u672F document/\u6587\u6863 location/\u5730\u70B9 other/\u5176\u4ED6), status, deadline"),t.push("- Theme/{name}.md \u2014 \u5C5E\u6027: subtype (friction/\u6469\u64E6 goal/\u76EE\u6807 judgment/\u5224\u65AD idea/\u60F3\u6CD5)"),t.push("- Daily/YYYY-MM-DD.md \u2014 \u65E5\u8BB0");let n=this.plugin.entityIndex?.entries||[];if(n.length>0){let s=n.filter(l=>l.cardType==="person"||l.type==="person"),a=n.filter(l=>l.cardType==="object"||l.type==="project"),o=n.filter(l=>l.cardType==="theme"||l.type==="theme");t.push(""),t.push("\u5F53\u524D Vault: "+s.length+"\u4EBA\u7269, "+a.length+"\u5BA2\u4F53, "+o.length+"\u4E3B\u9898"),s.length>0&&t.push("\u4EBA\u7269: "+s.map(l=>l.name).join("\u3001")),a.length>0&&t.push("\u5BA2\u4F53: "+a.map(l=>l.name).join("\u3001")),o.length>0&&t.push("\u4E3B\u9898: "+o.map(l=>l.name).join("\u3001"))}let r=this.plugin.getUserProfileContext();return r&&(t.push(""),t.push(r)),t.push(""),t.push("\u5F53\u9700\u8981\u6267\u884C\u64CD\u4F5C\u65F6\uFF0C\u5FC5\u987B\u4F7F\u7528\u4EE5\u4E0B\u5B8C\u6574\u683C\u5F0F\uFF08\u5F00\u59CB\u6807\u7B7E\u548C\u7ED3\u675F\u6807\u7B7E\u90FD\u4E0D\u80FD\u7701\u7565\uFF09\uFF1A"),t.push("[TRACEMIND_ACTION]"),t.push('{"action":"get_diary","date":"2026-05-05"}'),t.push("[/TRACEMIND_ACTION]"),t.push(""),t.push("\u7136\u540E\u7EE7\u7EED\u7528\u53CB\u597D\u7684\u4E2D\u6587\u56DE\u7B54\u3002\u64CD\u4F5C\u5757\u4E4B\u5916\u4E0D\u8981\u51FA\u73B0\u4EFB\u4F55 JSON\u3002"),t.join(`
`)}async detectLocalAgents(){if(this.plugin.settings.localAgentEnabled&&this.agentSelectEl){try{let{resolveExecutable:t}=await Promise.resolve().then(()=>(X(),Ne)),i=[{key:"claude-code",name:"Claude Code",binary:"claude"},{key:"hermes",name:"Hermes",binary:"hermes"}];this.detectedLocalAgents=[];for(let n of i)await t(n.binary)&&this.detectedLocalAgents.push(n.key)}catch{}this.rebuildAgentSelector()}}rebuildAgentSelector(){if(!this.agentSelectEl)return;let t=this.agentSelectEl.value||this.currentAgentKey;this.agentSelectEl.empty();let i=this.plugin.settings.providers||[];for(let n of i)this.agentSelectEl.createEl("option",{value:n.id,text:n.name||n.model||n.id});if(i.length===0&&this.agentSelectEl.createEl("option",{value:"",text:"\u4E91\u7AEF API"}),this.plugin.settings.localAgentEnabled){let n={"claude-code":"Claude Code",hermes:"Hermes"};for(let r of this.detectedLocalAgents)this.agentSelectEl.createEl("option",{value:r,text:n[r]||r})}t&&this.agentSelectEl.querySelector(`option[value="${t}"]`)&&(this.agentSelectEl.value=t),this.currentAgentKey=this.agentSelectEl.value}buildLocalAgentPrompt(t){let i=new Date,n=this.app.vault.adapter.basePath||"vault",r=[];r.push(`\u4F60\u662F TraceMind \u77E5\u8BC6\u5E93\u7684 AI \u52A9\u624B\u3002\u4ECA\u5929\u662F ${i.getFullYear()}\u5E74${i.getMonth()+1}\u6708${i.getDate()}\u65E5\u3002`),r.push(""),r.push("## Vault \u4F4D\u7F6E"),r.push(`\u4F60\u7684\u5DE5\u4F5C\u76EE\u5F55\u5C31\u662F Obsidian Vault: ${n}`),r.push("\u4F60\u53EF\u4EE5\u7528\u6587\u4EF6\u5DE5\u5177\u76F4\u63A5\u8BFB Person/Object/Theme/Daily \u76EE\u5F55\u4E0B\u7684 Markdown \u6587\u4EF6\u3002"),r.push(""),r.push("## Vault \u7ED3\u6784"),r.push("- Person/{name}.md \u2014 \u4EBA\u7269\u6863\u6848\uFF08\u5C5E\u6027: company, role, relationship_to_user\uFF09"),r.push("- Object/{name}.md \u2014 \u5BA2\u4F53\u6863\u6848\uFF08\u5C5E\u6027: subtype=company/\u9879\u76EE project/\u4EFB\u52A1 task/\u4EA7\u54C1 product/\u6280\u672F technology/\u6587\u6863 document/\u5730\u70B9 location/\u5176\u4ED6 other, status, deadline\uFF09"),r.push("- Theme/{name}.md \u2014 \u4E3B\u9898\u6863\u6848\uFF08\u5C5E\u6027: subtype=friction/\u6469\u64E6 goal/\u76EE\u6807 judgment/\u5224\u65AD idea/\u60F3\u6CD5\uFF09"),r.push("- Daily/YYYY-MM-DD.md \u2014 \u6BCF\u65E5\u65E5\u8BB0"),r.push(""),r.push("## \u89C4\u5219"),r.push("- \u7528\u6237\u63D0\u5230\u67D0\u4E2A\u5B9E\u4F53\u65F6\uFF0C\u5148\u8BFB\u5176\u6863\u6848\uFF08Person/Object/Theme \u76EE\u5F55\u4E0B\u540C\u540D .md \u6587\u4EF6\uFF09"),r.push("- \u6863\u6848\u4E2D\u5DF2\u6709\u4E92\u52A8\u8BB0\u5F55\u5173\u8054\u5230\u76F8\u5173\u65E5\u8BB0"),r.push("- \u4E0D\u8981\u7F16\u9020\u4E0D\u5B58\u5728\u7684\u4FE1\u606F"),r.push("- \u7B80\u77ED\u3001\u6709\u7528\u5730\u56DE\u7B54");let s=this.plugin.entityIndex?.entries||[];if(s.length>0){let o=s.filter(u=>u.cardType==="person"||u.type==="person"),l=s.filter(u=>u.cardType==="object"||u.type==="project"),c=s.filter(u=>u.cardType==="theme"||u.type==="theme");r.push(""),r.push(`\u5F53\u524D Vault: ${o.length}\u4EBA\u7269, ${l.length}\u5BA2\u4F53, ${c.length}\u4E3B\u9898`),o.length>0&&r.push("\u4EBA\u7269: "+o.map(u=>u.name).join("\u3001")),l.length>0&&r.push("\u5BA2\u4F53: "+l.map(u=>u.name).join("\u3001")),c.length>0&&r.push("\u4E3B\u9898: "+c.map(u=>u.name).join("\u3001"))}let a=this.plugin.getUserProfileContext();return a&&(r.push(""),r.push(a)),r.push(""),r.push("---"),r.push(""),r.push("\u7528\u6237\u6D88\u606F\uFF1A"+t),r.join(`
`)}async sendChatViaLocalAgent(t,i,n){let r=this.plugin.getSessionManager();try{let s=this.currentAgentKey,a;if(s==="hermes"){let{hermesProvider:d}=await Promise.resolve().then(()=>(Bt(),It));a=d}else{let{claudeCodeProvider:d}=await Promise.resolve().then(()=>(Lt(),Pt));a=d}let o=this.buildLocalAgentPrompt(t),l=a.execute(o),c=!0,u="";l.onMessage=d=>{d.type==="text"&&d.content?(c&&(this.hideThinkingIndicator(),this.addChatMessage("assistant",""),c=!1),u+=d.content,this.updateLastAssistantMessage(u),this.scrollToBottom()):d.type},l.onDone=async d=>{if(d.status==="completed"&&d.output){let h=this.stripThinking(d.output),p=ze(h);if(p.actions.length>0){p.text&&this.updateLastAssistantMessage(p.text),await this.finalizeLastAssistantMessage();let f=await this.executeChatActions(p.actions);f.length>0&&(r.addChatMessage({role:"assistant",content:p.text||h}),r.addChatMessage({role:"system",content:`\u64CD\u4F5C\u7ED3\u679C\uFF1A
`+f.join(`
`)}))}else p.text?(this.updateLastAssistantMessage(p.text),r.addChatMessage({role:"assistant",content:p.text})):r.addChatMessage({role:"assistant",content:h}),await this.finalizeLastAssistantMessage()}else c?(this.hideThinkingIndicator(),this.addChatMessage("assistant","\u672C\u5730 Agent \u8FD4\u56DE\u7A7A\u5185\u5BB9\u6216\u6267\u884C\u5931\u8D25\uFF1A"+(d.error||"\u672A\u77E5\u9519\u8BEF"))):await this.finalizeLastAssistantMessage();this.isLoading=!1,this.updateSendBtnState()},l.onError=d=>{this.hideThinkingIndicator(),this.addChatMessage("assistant","\u672C\u5730 Agent \u8C03\u7528\u5931\u8D25: "+d.message),this.isLoading=!1,this.updateSendBtnState()}}catch(s){this.hideThinkingIndicator(),this.addChatMessage("assistant","\u672C\u5730 Agent \u542F\u52A8\u5931\u8D25: "+s.message),this.isLoading=!1,this.updateSendBtnState()}}stripThinking(t){let i=t.replace(/<[Tt]hinking>[\s\S]*?<\/[Tt]hinking>/gi,"").replace(/<[Tt]hink>[\s\S]*?<\/[Tt]hink>/gi,"").replace(/<\/?[Tt]hink>/g,"").replace(/<\/?[Tt]hinking>/g,""),n=i.split(/\n\n+/);if(n.length>2){let r=n[n.length-1];if(r.length<300||/\[TRACEMIND_ACTION\]|^已|^✅|^好的/.test(r.trim()))for(let s=n.length-1;s>=0;s--){let a=n[s].trim();if(a.length>0&&!/^(不过|但是|可能|也许|可以|需要|如果|那么|因为|所以|让我|我想|我判断|当前|查找|搜索|创建|更新|首先|然后|接着|另外|实际|根据|注意|重要)/.test(a)){i=a;break}}}return i.trim()}async sendChatMessage(t){if(!this.inputTextarea)return;this.isLoading=!0,this.inputTextarea.value="",this.autoResizeTextarea(),this.updateSendBtnState(),this.addChatMessage("user",t),this.showThinkingIndicator();let i=this.plugin.getSessionManager();i.addChatMessage({role:"user",content:t});let n=this.plugin.getAIProvider(),s=i.getChatSession()?.messages||[],a={role:"system",content:this.buildChatSystemPrompt()};if(this.detectedLocalAgents.includes(this.currentAgentKey)){await this.sendChatViaLocalAgent(t,a,s);return}try{let l="",c=!0;await n.streamChat([a,...s],{onDelta:u=>{c&&(this.hideThinkingIndicator(),this.addChatMessage("assistant",""),c=!1),l+=u,this.updateLastAssistantMessage(l),this.scrollToBottom()},onDone:async()=>{if(!l){this.hideThinkingIndicator(),this.addChatMessage("assistant","\u62B1\u6B49\uFF0CAI \u8FD4\u56DE\u4E86\u7A7A\u5185\u5BB9\u3002"),this.isLoading=!1,this.updateSendBtnState();return}let u=this.stripThinking(l),d=ze(u);if(d.actions.length>0){d.text&&this.updateLastAssistantMessage(d.text),await this.finalizeLastAssistantMessage();let h=await this.executeChatActions(d.actions);if(h.length>0){i.addChatMessage({role:"assistant",content:d.text||u}),i.addChatMessage({role:"system",content:`\u64CD\u4F5C\u7ED3\u679C\uFF1A
`+h.join(`
`)});let p=i.getChatSession().messages,f={role:"system",content:this.buildChatSystemPrompt()},g="";await n.streamChat([f,...p],{onDelta:m=>{g+=m;let v=this.getLastAssistantContent()||"";this.updateLastAssistantMessage(v+m),this.scrollToBottom()},onDone:async()=>{g&&i.addChatMessage({role:"assistant",content:g}),await this.finalizeLastAssistantMessage()},onError:m=>{console.error("Follow-up AI stream error:",m)}},"chat")}}else d.text?(this.updateLastAssistantMessage(d.text),i.addChatMessage({role:"assistant",content:d.text})):i.addChatMessage({role:"assistant",content:u}),await this.finalizeLastAssistantMessage();this.isLoading=!1,this.updateSendBtnState()},onError:u=>{console.error("AI chat error:",u),this.hideThinkingIndicator(),this.addChatMessage("assistant","\u62B1\u6B49\uFF0CAI \u54CD\u5E94\u5931\u8D25: "+u.message),this.isLoading=!1,this.updateSendBtnState()}},"chat")}catch(l){console.error("AI chat error:",l),this.hideThinkingIndicator(),this.addChatMessage("assistant","\u62B1\u6B49\uFF0CAI \u54CD\u5E94\u5931\u8D25: "+l.message),this.isLoading=!1,this.updateSendBtnState()}}updateLastAssistantMessage(t){if(!this.chatMessagesEl)return;let i=this.chatMessagesEl.querySelectorAll(".lifewiki-chat-msg.assistant"),n=i[i.length-1];if(n){n.empty();let r=t.replace(/\[TRACEMIND_ACTION\][\s\S]*?\[\/TRACEMIND_ACTION\]/g,"").replace(/\[TRACEMIND_ACTION\][\s\S]*$/,"").replace(/\[\/TRACEMIND_ACTION\]/g,"").replace(/\[TRACEMIND_ACTION\]/g,"");n.createEl("pre",{cls:"lifewiki-chat-streaming",text:r||"..."})}}getLastAssistantContent(){if(!this.chatMessagesEl)return"";let t=this.chatMessagesEl.querySelectorAll(".lifewiki-chat-msg.assistant");return t[t.length-1]?.textContent||""}async finalizeLastAssistantMessage(){if(!this.chatMessagesEl)return;let t=this.chatMessagesEl.querySelectorAll(".lifewiki-chat-msg.assistant"),i=t[t.length-1];if(i){let n=i.textContent||"";n&&await this.renderMessageMarkdown(i,n)}}async handleEntityArchiving(t){let i=this.plugin.getEntityManager();if(i)for(let n of t)try{let r={status:"active",source:"diary"};n.type==="person"?(r.person_kind=/公司|组织|机构|团队/.test(n.smallType||n.context)?"\u7EC4\u7EC7":"\u4E2A\u4EBA",/同事|朋友|客户|供应商|合作伙伴|合作方/.test(n.smallType)&&(r.relationship_to_user=n.smallType)):n.type==="object"?(r.subtype=n.smallType||"other",n.context&&(r.description=n.context)):n.type==="theme"&&(r.subtype=n.smallType||"friction");let s=n.context||`\u4ECE\u65E5\u8BB0\u4E2D\u5F52\u6863\u7684${n.type}`;await i.createEntity({type:n.type,title:n.name,titleRaw:n.name,aliases:[],tags:[],summary:s,confidence:.8,verificationStatus:"verified",createdAt:new Date().toISOString(),createdBy:"ai",lastUpdated:new Date().toISOString(),relatedEntities:[],interactions:[{timestamp:new Date().toISOString(),type:"ai_analysis",content:`\u5F52\u6863\u4E3A${n.smallType}\uFF1A${n.context||"\u65E0"}`,sourceBlockId:this.activeBlockId||void 0}],metadata:r})}catch(r){console.error(`[AIAnalysisPanel] Failed to create entity ${n.name}:`,r)}}async handleEntityUpdate(t){let i=this.plugin.getEntityManager();if(i)for(let n of t)try{let r=i.getEntity(n.entityId);if(!r)continue;let s={lastUpdated:new Date().toISOString()},a=[...r.interactions??[]];for(let o of n.updates)if(o.field.startsWith("metadata.")){let l=o.field.replace("metadata.","");s.metadata={...r.metadata,[l]:o.value}}else o.field==="interactions"?(a.push({timestamp:new Date().toISOString(),type:"ai_analysis",content:o.value,sourceBlockId:this.activeBlockId||void 0}),s.interactions=a):o.field==="summary"&&(s.summary=o.value);await i.updateEntity(n.entityId,s)}catch(r){console.error(`[AIAnalysisPanel] Failed to update entity ${n.name}:`,r)}}async handleRelations(t){let i=this.plugin.getEntityManager();if(i)for(let n of t)try{let r=i.findEntity(n.from),s=i.findEntity(n.to);if(!r||!s)continue;let a=r.relatedEntities||[],o={entityId:s.id,relation:n.relation,context:n.context||`\u901A\u8FC7\u65E5\u8BB0\u5206\u6790\u5EFA\u7ACB\u5173\u7CFB\uFF1A${n.from}\u662F${n.to}\u7684${n.relation}`};a.some(c=>c.entityId===s.id&&c.relation===o.relation)||await i.updateEntity(r.id,{relatedEntities:[...a,o],lastUpdated:new Date().toISOString()})}catch(r){console.error("[AIAnalysisPanel] Failed to create relation:",r)}}async updateBlockCategory(t,i){try{let n=this.app.workspace.getLeavesOfType(D);if(n.length===0)return;let r=n[0].view;if(!r)return;let s=r.getBlockById(t);if(!s)return;(s.category==="\u5F85\u5206\u6790"||s.category!==i)&&(s.category=i,await r.saveBlockToFile(s),console.log(`[AIAnalysisPanel] Updated block ${t} category to ${i}`))}catch(n){console.error("[AIAnalysisPanel] Failed to update block category:",n)}}async showEntityConfirmationDialog(t){if(this.chatMessagesEl)for(let i of t){let n=this.chatMessagesEl.createEl("div",{cls:"lifewiki-entity-confirm"});n.createEl("div",{cls:"lifewiki-entity-confirm-title",text:`\u8BC6\u522B\u5230\u65B0${this.getEntityTypeLabel(i.inferredType)}: **${i.name}**`}),n.createEl("div",{cls:"lifewiki-entity-confirm-reason",text:i.reason||"\u4ECE\u65E5\u8BB0\u4E2D\u53D1\u73B0"});let r=n.createEl("div",{cls:"lifewiki-entity-confirm-buttons"}),s=r.createEl("button",{cls:"lifewiki-entity-confirm-btn archive",text:"\u5F52\u6863",attr:{type:"button"}}),a=r.createEl("button",{cls:"lifewiki-entity-confirm-btn skip",text:"\u8DF3\u8FC7",attr:{type:"button"}});s.addEventListener("click",async()=>{await this.archiveEntity(i),n.remove()}),a.addEventListener("click",()=>{n.remove()})}}getEntityTypeLabel(t){return{person:"\u4EBA\u8109",object:"\u5BA2\u4F53",theme:"\u4E3B\u9898"}[t]||"\u5B9E\u4F53"}maturityLabel(t){return t}async archiveEntity(t){let i=this.plugin.getEntityManager();if(!i)return;let r={person:"person",object:"object",theme:"theme"}[t.inferredType]||"person";try{await i.createEntity({type:r,title:t.name,titleRaw:t.name,aliases:[],tags:[],summary:t.reason||"\u4ECE\u65E5\u8BB0\u4E2D\u5F52\u6863",confidence:.8,verificationStatus:"verified",createdAt:new Date().toISOString(),createdBy:"ai",lastUpdated:new Date().toISOString(),relatedEntities:[],interactions:[{timestamp:new Date().toISOString(),type:"ai_analysis",content:`\u5F52\u6863\uFF1A${t.reason||"\u4ECE\u65E5\u8BB0\u4E2D\u53D1\u73B0"}`,sourceBlockId:this.activeBlockId||void 0}],metadata:{status:"active",source:"diary"}}),this.addChatMessage("assistant",`\u5DF2\u5F52\u6863 **${t.name}**`)}catch(s){console.error("[AIAnalysisPanel] Failed to archive entity:",s),this.addChatMessage("assistant","\u5F52\u6863\u5931\u8D25")}}async onClose(){}};var _t=require("obsidian"),ne="tracemind-calendar",we=class extends _t.ItemView{plugin;currentMonth;onDateClickCallback=null;constructor(t,i){super(t),this.plugin=i,this.currentMonth={year:new Date().getFullYear(),month:new Date().getMonth()}}getViewType(){return ne}getDisplayText(){return"\u65E5\u5386"}getIcon(){return"calendar"}async onOpen(){this.renderCalendar()}async onClose(){}setOnDateClick(t){this.onDateClickCallback=t}async handleDateClick(t){this.onDateClickCallback&&this.onDateClickCallback(t)}getMonthDays(t,i){let n=new Date(t,i,1),r=new Date(t,i+1,0),s=[],a=n.getDay();for(let l=a-1;l>=0;l--){let c=new Date(t,i,-l);s.push(c)}for(let l=1;l<=r.getDate();l++)s.push(new Date(t,i,l));let o=42-s.length;for(let l=1;l<=o;l++)s.push(new Date(t,i+1,l));return s}isToday(t){let i=new Date;return t.getFullYear()===i.getFullYear()&&t.getMonth()===i.getMonth()&&t.getDate()===i.getDate()}isCurrentMonth(t){return t.getFullYear()===this.currentMonth.year&&t.getMonth()===this.currentMonth.month}getNextMonth(t,i){return i===11?{year:t+1,month:0}:{year:t,month:i+1}}getPrevMonth(t,i){return i===0?{year:t-1,month:11}:{year:t,month:i-1}}async diaryExistsForDate(t){try{let i=`Daily/${t}.md`,n=this.app.vault.getAbstractFileByPath(i);return n!=null}catch{return!1}}async goToNextMonth(){this.currentMonth=this.getNextMonth(this.currentMonth.year,this.currentMonth.month),this.renderCalendar()}async goToPrevMonth(){this.currentMonth=this.getPrevMonth(this.currentMonth.year,this.currentMonth.month),this.renderCalendar()}async goToToday(){let t=new Date;this.currentMonth={year:t.getFullYear(),month:t.getMonth()},this.renderCalendar()}async renderCalendar(){let t=this.containerEl;t.empty(),this.addStyles();let i=t.createEl("div",{cls:"tracemind-calendar"});this.renderHeader(i),this.renderWeekdayHeader(i),await this.renderDays(i)}renderHeader(t){let i=t.createEl("div",{cls:"lifewiki-calendar-header"});i.createEl("button",{cls:"lifewiki-calendar-nav-btn",text:"\u2039"}).addEventListener("click",()=>this.goToPrevMonth()),i.createEl("span",{cls:"lifewiki-calendar-title",text:this.getMonthTitle()}).addEventListener("click",()=>this.goToToday()),i.createEl("button",{cls:"lifewiki-calendar-nav-btn",text:"\u203A"}).addEventListener("click",()=>this.goToNextMonth())}renderWeekdayHeader(t){let i=["\u65E5","\u4E00","\u4E8C","\u4E09","\u56DB","\u4E94","\u516D"],n=t.createEl("div",{cls:"lifewiki-calendar-weekdays"});for(let r of i)n.createEl("div",{cls:"lifewiki-calendar-weekday",text:r})}async renderDays(t){let i=this.getMonthDays(this.currentMonth.year,this.currentMonth.month),n=t.createEl("div",{cls:"lifewiki-calendar-grid"});for(let r of i){let s=await this.createDayElement(r,n);n.appendChild(s)}}async createDayElement(t,i){let n=i.createEl("div",{cls:"lifewiki-calendar-day"}),r=this.isCurrentMonth(t),s=this.isToday(t);r||n.addClass("lifewiki-calendar-day-other-month"),s&&n.addClass("lifewiki-calendar-day-today");let a=this.formatDate(t);await this.diaryExistsForDate(a)&&n.addClass("lifewiki-calendar-day-has-diary");let l=n.createEl("span",{cls:"lifewiki-calendar-day-num",text:String(t.getDate())});return n.addEventListener("click",()=>{this.handleDateClick(t)}),n}getMonthTitle(){let t=["\u4E00\u6708","\u4E8C\u6708","\u4E09\u6708","\u56DB\u6708","\u4E94\u6708","\u516D\u6708","\u4E03\u6708","\u516B\u6708","\u4E5D\u6708","\u5341\u6708","\u5341\u4E00\u6708","\u5341\u4E8C\u6708"];return`${this.currentMonth.year}\u5E74 ${t[this.currentMonth.month]}`}formatDate(t){let i=t.getFullYear(),n=String(t.getMonth()+1).padStart(2,"0"),r=String(t.getDate()).padStart(2,"0");return`${i}-${n}-${r}`}addStyles(){let t="lifewiki-calendar-styles";if(document.getElementById(t))return;let i=document.createElement("style");i.id=t,i.textContent=`
			.lifewiki-calendar {
				padding: 12px;
				height: 100%;
				display: flex;
				flex-direction: column;
				background: var(--background-primary);
			}

			.lifewiki-calendar-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 8px 0;
				margin-bottom: 8px;
			}

			.lifewiki-calendar-title {
				font-size: 16px;
				font-weight: 600;
				cursor: pointer;
			}

			.lifewiki-calendar-nav-btn {
				background: none;
				border: none;
				font-size: 20px;
				cursor: pointer;
				padding: 4px 12px;
				color: var(--text-muted);
				border-radius: 4px;
			}

			.lifewiki-calendar-nav-btn:hover {
				background: var(--background-secondary);
				color: var(--text-normal);
			}

			.lifewiki-calendar-weekdays {
				display: grid;
				grid-template-columns: repeat(7, 1fr);
				text-align: center;
				margin-bottom: 4px;
			}

			.lifewiki-calendar-weekday {
				font-size: 12px;
				color: var(--text-muted);
				padding: 4px;
			}

			.lifewiki-calendar-grid {
				display: grid;
				grid-template-columns: repeat(7, 1fr);
				gap: 0.5px;
				max-height: 33vh;
				overflow: hidden;
			}

			.lifewiki-calendar-day {
				display: flex;
				align-items: center;
				justify-content: center;
				cursor: pointer;
				border-radius: 4px;
				min-height: 24px;
				padding: 2px;
				position: relative;
			}

			.lifewiki-calendar-day:hover {
				background: var(--background-secondary);
			}

			.lifewiki-calendar-day-num {
				font-size: 11px;
			}

			.lifewiki-calendar-day-today .lifewiki-calendar-day-num {
				background: var(--interactive-accent);
				color: var(--text-on-accent);
				width: 28px;
				height: 28px;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				font-weight: 600;
			}

			.lifewiki-calendar-day-has-diary::after {
				content: '';
				position: absolute;
				bottom: 4px;
				width: 4px;
				height: 4px;
				border-radius: 50%;
				background: var(--interactive-accent);
			}

			.lifewiki-calendar-day-other-month {
				opacity: 0.3;
			}
		`,document.head.appendChild(i)}};async function ke(e,t){if(!e.vault.getAbstractFileByPath(t))try{await e.vault.createFolder(t)}catch(n){if(!n.message?.includes("already exists"))throw n}}function Jt(e){return typeof e>"u"||e===null}function Fn(e){return typeof e=="object"&&e!==null}function Sn(e){return Array.isArray(e)?e:Jt(e)?[]:[e]}function Mn(e,t){var i,n,r,s;if(t)for(s=Object.keys(t),i=0,n=s.length;i<n;i+=1)r=s[i],e[r]=t[r];return e}function In(e,t){var i="",n;for(n=0;n<t;n+=1)i+=e;return i}function Bn(e){return e===0&&Number.NEGATIVE_INFINITY===1/e}var Dn=Jt,Pn=Fn,Ln=Sn,_n=In,Rn=Bn,On=Mn,k={isNothing:Dn,isObject:Pn,toArray:Ln,repeat:_n,isNegativeZero:Rn,extend:On};function Xt(e,t){var i="",n=e.reason||"(unknown reason)";return e.mark?(e.mark.name&&(i+='in "'+e.mark.name+'" '),i+="("+(e.mark.line+1)+":"+(e.mark.column+1)+")",!t&&e.mark.snippet&&(i+=`

`+e.mark.snippet),n+" "+i):n}function ae(e,t){Error.call(this),this.name="YAMLException",this.reason=e,this.mark=t,this.message=Xt(this,!1),Error.captureStackTrace?Error.captureStackTrace(this,this.constructor):this.stack=new Error().stack||""}ae.prototype=Object.create(Error.prototype);ae.prototype.constructor=ae;ae.prototype.toString=function(t){return this.name+": "+Xt(this,t)};var T=ae;function Ve(e,t,i,n,r){var s="",a="",o=Math.floor(r/2)-1;return n-t>o&&(s=" ... ",t=n-o+s.length),i-n>o&&(a=" ...",i=n+o-a.length),{str:s+e.slice(t,i).replace(/\t/g,"\u2192")+a,pos:n-t+s.length}}function Ye(e,t){return k.repeat(" ",t-e.length)+e}function Nn(e,t){if(t=Object.create(t||null),!e.buffer)return null;t.maxLength||(t.maxLength=79),typeof t.indent!="number"&&(t.indent=1),typeof t.linesBefore!="number"&&(t.linesBefore=3),typeof t.linesAfter!="number"&&(t.linesAfter=2);for(var i=/\r?\n|\r|\0/g,n=[0],r=[],s,a=-1;s=i.exec(e.buffer);)r.push(s.index),n.push(s.index+s[0].length),e.position<=s.index&&a<0&&(a=n.length-2);a<0&&(a=n.length-1);var o="",l,c,u=Math.min(e.line+t.linesAfter,r.length).toString().length,d=t.maxLength-(t.indent+u+3);for(l=1;l<=t.linesBefore&&!(a-l<0);l++)c=Ve(e.buffer,n[a-l],r[a-l],e.position-(n[a]-n[a-l]),d),o=k.repeat(" ",t.indent)+Ye((e.line-l+1).toString(),u)+" | "+c.str+`
`+o;for(c=Ve(e.buffer,n[a],r[a],e.position,d),o+=k.repeat(" ",t.indent)+Ye((e.line+1).toString(),u)+" | "+c.str+`
`,o+=k.repeat("-",t.indent+u+3+c.pos)+`^
`,l=1;l<=t.linesAfter&&!(a+l>=r.length);l++)c=Ve(e.buffer,n[a+l],r[a+l],e.position-(n[a]-n[a+l]),d),o+=k.repeat(" ",t.indent)+Ye((e.line+l+1).toString(),u)+" | "+c.str+`
`;return o.replace(/\n$/,"")}var $n=Nn,jn=["kind","multi","resolve","construct","instanceOf","predicate","represent","representName","defaultStyle","styleAliases"],Hn=["scalar","sequence","mapping"];function Un(e){var t={};return e!==null&&Object.keys(e).forEach(function(i){e[i].forEach(function(n){t[String(n)]=i})}),t}function zn(e,t){if(t=t||{},Object.keys(t).forEach(function(i){if(jn.indexOf(i)===-1)throw new T('Unknown option "'+i+'" is met in definition of "'+e+'" YAML type.')}),this.options=t,this.tag=e,this.kind=t.kind||null,this.resolve=t.resolve||function(){return!0},this.construct=t.construct||function(i){return i},this.instanceOf=t.instanceOf||null,this.predicate=t.predicate||null,this.represent=t.represent||null,this.representName=t.representName||null,this.defaultStyle=t.defaultStyle||null,this.multi=t.multi||!1,this.styleAliases=Un(t.styleAliases||null),Hn.indexOf(this.kind)===-1)throw new T('Unknown kind "'+this.kind+'" is specified for "'+e+'" YAML type.')}var C=zn;function Rt(e,t){var i=[];return e[t].forEach(function(n){var r=i.length;i.forEach(function(s,a){s.tag===n.tag&&s.kind===n.kind&&s.multi===n.multi&&(r=a)}),i[r]=n}),i}function Vn(){var e={scalar:{},sequence:{},mapping:{},fallback:{},multi:{scalar:[],sequence:[],mapping:[],fallback:[]}},t,i;function n(r){r.multi?(e.multi[r.kind].push(r),e.multi.fallback.push(r)):e[r.kind][r.tag]=e.fallback[r.tag]=r}for(t=0,i=arguments.length;t<i;t+=1)arguments[t].forEach(n);return e}function We(e){return this.extend(e)}We.prototype.extend=function(t){var i=[],n=[];if(t instanceof C)n.push(t);else if(Array.isArray(t))n=n.concat(t);else if(t&&(Array.isArray(t.implicit)||Array.isArray(t.explicit)))t.implicit&&(i=i.concat(t.implicit)),t.explicit&&(n=n.concat(t.explicit));else throw new T("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");i.forEach(function(s){if(!(s instanceof C))throw new T("Specified list of YAML types (or a single Type object) contains a non-Type object.");if(s.loadKind&&s.loadKind!=="scalar")throw new T("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");if(s.multi)throw new T("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.")}),n.forEach(function(s){if(!(s instanceof C))throw new T("Specified list of YAML types (or a single Type object) contains a non-Type object.")});var r=Object.create(We.prototype);return r.implicit=(this.implicit||[]).concat(i),r.explicit=(this.explicit||[]).concat(n),r.compiledImplicit=Rt(r,"implicit"),r.compiledExplicit=Rt(r,"explicit"),r.compiledTypeMap=Vn(r.compiledImplicit,r.compiledExplicit),r};var Zt=We,ei=new C("tag:yaml.org,2002:str",{kind:"scalar",construct:function(e){return e!==null?e:""}}),ti=new C("tag:yaml.org,2002:seq",{kind:"sequence",construct:function(e){return e!==null?e:[]}}),ii=new C("tag:yaml.org,2002:map",{kind:"mapping",construct:function(e){return e!==null?e:{}}}),ni=new Zt({explicit:[ei,ti,ii]});function Yn(e){if(e===null)return!0;var t=e.length;return t===1&&e==="~"||t===4&&(e==="null"||e==="Null"||e==="NULL")}function Kn(){return null}function Wn(e){return e===null}var ri=new C("tag:yaml.org,2002:null",{kind:"scalar",resolve:Yn,construct:Kn,predicate:Wn,represent:{canonical:function(){return"~"},lowercase:function(){return"null"},uppercase:function(){return"NULL"},camelcase:function(){return"Null"},empty:function(){return""}},defaultStyle:"lowercase"});function qn(e){if(e===null)return!1;var t=e.length;return t===4&&(e==="true"||e==="True"||e==="TRUE")||t===5&&(e==="false"||e==="False"||e==="FALSE")}function Gn(e){return e==="true"||e==="True"||e==="TRUE"}function Qn(e){return Object.prototype.toString.call(e)==="[object Boolean]"}var ai=new C("tag:yaml.org,2002:bool",{kind:"scalar",resolve:qn,construct:Gn,predicate:Qn,represent:{lowercase:function(e){return e?"true":"false"},uppercase:function(e){return e?"TRUE":"FALSE"},camelcase:function(e){return e?"True":"False"}},defaultStyle:"lowercase"});function Jn(e){return 48<=e&&e<=57||65<=e&&e<=70||97<=e&&e<=102}function Xn(e){return 48<=e&&e<=55}function Zn(e){return 48<=e&&e<=57}function er(e){if(e===null)return!1;var t=e.length,i=0,n=!1,r;if(!t)return!1;if(r=e[i],(r==="-"||r==="+")&&(r=e[++i]),r==="0"){if(i+1===t)return!0;if(r=e[++i],r==="b"){for(i++;i<t;i++)if(r=e[i],r!=="_"){if(r!=="0"&&r!=="1")return!1;n=!0}return n&&r!=="_"}if(r==="x"){for(i++;i<t;i++)if(r=e[i],r!=="_"){if(!Jn(e.charCodeAt(i)))return!1;n=!0}return n&&r!=="_"}if(r==="o"){for(i++;i<t;i++)if(r=e[i],r!=="_"){if(!Xn(e.charCodeAt(i)))return!1;n=!0}return n&&r!=="_"}}if(r==="_")return!1;for(;i<t;i++)if(r=e[i],r!=="_"){if(!Zn(e.charCodeAt(i)))return!1;n=!0}return!(!n||r==="_")}function tr(e){var t=e,i=1,n;if(t.indexOf("_")!==-1&&(t=t.replace(/_/g,"")),n=t[0],(n==="-"||n==="+")&&(n==="-"&&(i=-1),t=t.slice(1),n=t[0]),t==="0")return 0;if(n==="0"){if(t[1]==="b")return i*parseInt(t.slice(2),2);if(t[1]==="x")return i*parseInt(t.slice(2),16);if(t[1]==="o")return i*parseInt(t.slice(2),8)}return i*parseInt(t,10)}function ir(e){return Object.prototype.toString.call(e)==="[object Number]"&&e%1===0&&!k.isNegativeZero(e)}var si=new C("tag:yaml.org,2002:int",{kind:"scalar",resolve:er,construct:tr,predicate:ir,represent:{binary:function(e){return e>=0?"0b"+e.toString(2):"-0b"+e.toString(2).slice(1)},octal:function(e){return e>=0?"0o"+e.toString(8):"-0o"+e.toString(8).slice(1)},decimal:function(e){return e.toString(10)},hexadecimal:function(e){return e>=0?"0x"+e.toString(16).toUpperCase():"-0x"+e.toString(16).toUpperCase().slice(1)}},defaultStyle:"decimal",styleAliases:{binary:[2,"bin"],octal:[8,"oct"],decimal:[10,"dec"],hexadecimal:[16,"hex"]}}),nr=new RegExp("^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$");function rr(e){return!(e===null||!nr.test(e)||e[e.length-1]==="_")}function ar(e){var t,i;return t=e.replace(/_/g,"").toLowerCase(),i=t[0]==="-"?-1:1,"+-".indexOf(t[0])>=0&&(t=t.slice(1)),t===".inf"?i===1?Number.POSITIVE_INFINITY:Number.NEGATIVE_INFINITY:t===".nan"?NaN:i*parseFloat(t,10)}var sr=/^[-+]?[0-9]+e/;function or(e,t){var i;if(isNaN(e))switch(t){case"lowercase":return".nan";case"uppercase":return".NAN";case"camelcase":return".NaN"}else if(Number.POSITIVE_INFINITY===e)switch(t){case"lowercase":return".inf";case"uppercase":return".INF";case"camelcase":return".Inf"}else if(Number.NEGATIVE_INFINITY===e)switch(t){case"lowercase":return"-.inf";case"uppercase":return"-.INF";case"camelcase":return"-.Inf"}else if(k.isNegativeZero(e))return"-0.0";return i=e.toString(10),sr.test(i)?i.replace("e",".e"):i}function lr(e){return Object.prototype.toString.call(e)==="[object Number]"&&(e%1!==0||k.isNegativeZero(e))}var oi=new C("tag:yaml.org,2002:float",{kind:"scalar",resolve:rr,construct:ar,predicate:lr,represent:or,defaultStyle:"lowercase"}),li=ni.extend({implicit:[ri,ai,si,oi]}),ci=li,ui=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"),di=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$");function cr(e){return e===null?!1:ui.exec(e)!==null||di.exec(e)!==null}function ur(e){var t,i,n,r,s,a,o,l=0,c=null,u,d,h;if(t=ui.exec(e),t===null&&(t=di.exec(e)),t===null)throw new Error("Date resolve error");if(i=+t[1],n=+t[2]-1,r=+t[3],!t[4])return new Date(Date.UTC(i,n,r));if(s=+t[4],a=+t[5],o=+t[6],t[7]){for(l=t[7].slice(0,3);l.length<3;)l+="0";l=+l}return t[9]&&(u=+t[10],d=+(t[11]||0),c=(u*60+d)*6e4,t[9]==="-"&&(c=-c)),h=new Date(Date.UTC(i,n,r,s,a,o,l)),c&&h.setTime(h.getTime()-c),h}function dr(e){return e.toISOString()}var pi=new C("tag:yaml.org,2002:timestamp",{kind:"scalar",resolve:cr,construct:ur,instanceOf:Date,represent:dr});function pr(e){return e==="<<"||e===null}var hi=new C("tag:yaml.org,2002:merge",{kind:"scalar",resolve:pr}),Xe=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;function hr(e){if(e===null)return!1;var t,i,n=0,r=e.length,s=Xe;for(i=0;i<r;i++)if(t=s.indexOf(e.charAt(i)),!(t>64)){if(t<0)return!1;n+=6}return n%8===0}function fr(e){var t,i,n=e.replace(/[\r\n=]/g,""),r=n.length,s=Xe,a=0,o=[];for(t=0;t<r;t++)t%4===0&&t&&(o.push(a>>16&255),o.push(a>>8&255),o.push(a&255)),a=a<<6|s.indexOf(n.charAt(t));return i=r%4*6,i===0?(o.push(a>>16&255),o.push(a>>8&255),o.push(a&255)):i===18?(o.push(a>>10&255),o.push(a>>2&255)):i===12&&o.push(a>>4&255),new Uint8Array(o)}function gr(e){var t="",i=0,n,r,s=e.length,a=Xe;for(n=0;n<s;n++)n%3===0&&n&&(t+=a[i>>18&63],t+=a[i>>12&63],t+=a[i>>6&63],t+=a[i&63]),i=(i<<8)+e[n];return r=s%3,r===0?(t+=a[i>>18&63],t+=a[i>>12&63],t+=a[i>>6&63],t+=a[i&63]):r===2?(t+=a[i>>10&63],t+=a[i>>4&63],t+=a[i<<2&63],t+=a[64]):r===1&&(t+=a[i>>2&63],t+=a[i<<4&63],t+=a[64],t+=a[64]),t}function mr(e){return Object.prototype.toString.call(e)==="[object Uint8Array]"}var fi=new C("tag:yaml.org,2002:binary",{kind:"scalar",resolve:hr,construct:fr,predicate:mr,represent:gr}),yr=Object.prototype.hasOwnProperty,xr=Object.prototype.toString;function vr(e){if(e===null)return!0;var t=[],i,n,r,s,a,o=e;for(i=0,n=o.length;i<n;i+=1){if(r=o[i],a=!1,xr.call(r)!=="[object Object]")return!1;for(s in r)if(yr.call(r,s))if(!a)a=!0;else return!1;if(!a)return!1;if(t.indexOf(s)===-1)t.push(s);else return!1}return!0}function Er(e){return e!==null?e:[]}var gi=new C("tag:yaml.org,2002:omap",{kind:"sequence",resolve:vr,construct:Er}),br=Object.prototype.toString;function wr(e){if(e===null)return!0;var t,i,n,r,s,a=e;for(s=new Array(a.length),t=0,i=a.length;t<i;t+=1){if(n=a[t],br.call(n)!=="[object Object]"||(r=Object.keys(n),r.length!==1))return!1;s[t]=[r[0],n[r[0]]]}return!0}function kr(e){if(e===null)return[];var t,i,n,r,s,a=e;for(s=new Array(a.length),t=0,i=a.length;t<i;t+=1)n=a[t],r=Object.keys(n),s[t]=[r[0],n[r[0]]];return s}var mi=new C("tag:yaml.org,2002:pairs",{kind:"sequence",resolve:wr,construct:kr}),Cr=Object.prototype.hasOwnProperty;function Ar(e){if(e===null)return!0;var t,i=e;for(t in i)if(Cr.call(i,t)&&i[t]!==null)return!1;return!0}function Tr(e){return e!==null?e:{}}var yi=new C("tag:yaml.org,2002:set",{kind:"mapping",resolve:Ar,construct:Tr}),Ze=ci.extend({implicit:[pi,hi],explicit:[fi,gi,mi,yi]}),O=Object.prototype.hasOwnProperty,Ce=1,xi=2,vi=3,Ae=4,Ke=1,Fr=2,Ot=3,Sr=/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,Mr=/[\x85\u2028\u2029]/,Ir=/[,\[\]\{\}]/,Ei=/^(?:!|!!|![a-z\-]+!)$/i,bi=/^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;function Nt(e){return Object.prototype.toString.call(e)}function I(e){return e===10||e===13}function j(e){return e===9||e===32}function F(e){return e===9||e===32||e===10||e===13}function K(e){return e===44||e===91||e===93||e===123||e===125}function Br(e){var t;return 48<=e&&e<=57?e-48:(t=e|32,97<=t&&t<=102?t-97+10:-1)}function Dr(e){return e===120?2:e===117?4:e===85?8:0}function Pr(e){return 48<=e&&e<=57?e-48:-1}function $t(e){return e===48?"\0":e===97?"\x07":e===98?"\b":e===116||e===9?"	":e===110?`
`:e===118?"\v":e===102?"\f":e===114?"\r":e===101?"\x1B":e===32?" ":e===34?'"':e===47?"/":e===92?"\\":e===78?"\x85":e===95?"\xA0":e===76?"\u2028":e===80?"\u2029":""}function Lr(e){return e<=65535?String.fromCharCode(e):String.fromCharCode((e-65536>>10)+55296,(e-65536&1023)+56320)}function wi(e,t,i){t==="__proto__"?Object.defineProperty(e,t,{configurable:!0,enumerable:!0,writable:!0,value:i}):e[t]=i}var ki=new Array(256),Ci=new Array(256);for($=0;$<256;$++)ki[$]=$t($)?1:0,Ci[$]=$t($);var $;function _r(e,t){this.input=e,this.filename=t.filename||null,this.schema=t.schema||Ze,this.onWarning=t.onWarning||null,this.legacy=t.legacy||!1,this.json=t.json||!1,this.listener=t.listener||null,this.implicitTypes=this.schema.compiledImplicit,this.typeMap=this.schema.compiledTypeMap,this.length=e.length,this.position=0,this.line=0,this.lineStart=0,this.lineIndent=0,this.firstTabInLine=-1,this.documents=[]}function Ai(e,t){var i={name:e.filename,buffer:e.input.slice(0,-1),position:e.position,line:e.line,column:e.position-e.lineStart};return i.snippet=$n(i),new T(t,i)}function y(e,t){throw Ai(e,t)}function Te(e,t){e.onWarning&&e.onWarning.call(null,Ai(e,t))}var jt={YAML:function(t,i,n){var r,s,a;t.version!==null&&y(t,"duplication of %YAML directive"),n.length!==1&&y(t,"YAML directive accepts exactly one argument"),r=/^([0-9]+)\.([0-9]+)$/.exec(n[0]),r===null&&y(t,"ill-formed argument of the YAML directive"),s=parseInt(r[1],10),a=parseInt(r[2],10),s!==1&&y(t,"unacceptable YAML version of the document"),t.version=n[0],t.checkLineBreaks=a<2,a!==1&&a!==2&&Te(t,"unsupported YAML version of the document")},TAG:function(t,i,n){var r,s;n.length!==2&&y(t,"TAG directive accepts exactly two arguments"),r=n[0],s=n[1],Ei.test(r)||y(t,"ill-formed tag handle (first argument) of the TAG directive"),O.call(t.tagMap,r)&&y(t,'there is a previously declared suffix for "'+r+'" tag handle'),bi.test(s)||y(t,"ill-formed tag prefix (second argument) of the TAG directive");try{s=decodeURIComponent(s)}catch{y(t,"tag prefix is malformed: "+s)}t.tagMap[r]=s}};function R(e,t,i,n){var r,s,a,o;if(t<i){if(o=e.input.slice(t,i),n)for(r=0,s=o.length;r<s;r+=1)a=o.charCodeAt(r),a===9||32<=a&&a<=1114111||y(e,"expected valid JSON character");else Sr.test(o)&&y(e,"the stream contains non-printable characters");e.result+=o}}function Ht(e,t,i,n){var r,s,a,o;for(k.isObject(i)||y(e,"cannot merge mappings; the provided source object is unacceptable"),r=Object.keys(i),a=0,o=r.length;a<o;a+=1)s=r[a],O.call(t,s)||(wi(t,s,i[s]),n[s]=!0)}function W(e,t,i,n,r,s,a,o,l){var c,u;if(Array.isArray(r))for(r=Array.prototype.slice.call(r),c=0,u=r.length;c<u;c+=1)Array.isArray(r[c])&&y(e,"nested arrays are not supported inside keys"),typeof r=="object"&&Nt(r[c])==="[object Object]"&&(r[c]="[object Object]");if(typeof r=="object"&&Nt(r)==="[object Object]"&&(r="[object Object]"),r=String(r),t===null&&(t={}),n==="tag:yaml.org,2002:merge")if(Array.isArray(s))for(c=0,u=s.length;c<u;c+=1)Ht(e,t,s[c],i);else Ht(e,t,s,i);else!e.json&&!O.call(i,r)&&O.call(t,r)&&(e.line=a||e.line,e.lineStart=o||e.lineStart,e.position=l||e.position,y(e,"duplicated mapping key")),wi(t,r,s),delete i[r];return t}function et(e){var t;t=e.input.charCodeAt(e.position),t===10?e.position++:t===13?(e.position++,e.input.charCodeAt(e.position)===10&&e.position++):y(e,"a line break is expected"),e.line+=1,e.lineStart=e.position,e.firstTabInLine=-1}function w(e,t,i){for(var n=0,r=e.input.charCodeAt(e.position);r!==0;){for(;j(r);)r===9&&e.firstTabInLine===-1&&(e.firstTabInLine=e.position),r=e.input.charCodeAt(++e.position);if(t&&r===35)do r=e.input.charCodeAt(++e.position);while(r!==10&&r!==13&&r!==0);if(I(r))for(et(e),r=e.input.charCodeAt(e.position),n++,e.lineIndent=0;r===32;)e.lineIndent++,r=e.input.charCodeAt(++e.position);else break}return i!==-1&&n!==0&&e.lineIndent<i&&Te(e,"deficient indentation"),n}function Me(e){var t=e.position,i;return i=e.input.charCodeAt(t),!!((i===45||i===46)&&i===e.input.charCodeAt(t+1)&&i===e.input.charCodeAt(t+2)&&(t+=3,i=e.input.charCodeAt(t),i===0||F(i)))}function tt(e,t){t===1?e.result+=" ":t>1&&(e.result+=k.repeat(`
`,t-1))}function Rr(e,t,i){var n,r,s,a,o,l,c,u,d=e.kind,h=e.result,p;if(p=e.input.charCodeAt(e.position),F(p)||K(p)||p===35||p===38||p===42||p===33||p===124||p===62||p===39||p===34||p===37||p===64||p===96||(p===63||p===45)&&(r=e.input.charCodeAt(e.position+1),F(r)||i&&K(r)))return!1;for(e.kind="scalar",e.result="",s=a=e.position,o=!1;p!==0;){if(p===58){if(r=e.input.charCodeAt(e.position+1),F(r)||i&&K(r))break}else if(p===35){if(n=e.input.charCodeAt(e.position-1),F(n))break}else{if(e.position===e.lineStart&&Me(e)||i&&K(p))break;if(I(p))if(l=e.line,c=e.lineStart,u=e.lineIndent,w(e,!1,-1),e.lineIndent>=t){o=!0,p=e.input.charCodeAt(e.position);continue}else{e.position=a,e.line=l,e.lineStart=c,e.lineIndent=u;break}}o&&(R(e,s,a,!1),tt(e,e.line-l),s=a=e.position,o=!1),j(p)||(a=e.position+1),p=e.input.charCodeAt(++e.position)}return R(e,s,a,!1),e.result?!0:(e.kind=d,e.result=h,!1)}function Or(e,t){var i,n,r;if(i=e.input.charCodeAt(e.position),i!==39)return!1;for(e.kind="scalar",e.result="",e.position++,n=r=e.position;(i=e.input.charCodeAt(e.position))!==0;)if(i===39)if(R(e,n,e.position,!0),i=e.input.charCodeAt(++e.position),i===39)n=e.position,e.position++,r=e.position;else return!0;else I(i)?(R(e,n,r,!0),tt(e,w(e,!1,t)),n=r=e.position):e.position===e.lineStart&&Me(e)?y(e,"unexpected end of the document within a single quoted scalar"):(e.position++,r=e.position);y(e,"unexpected end of the stream within a single quoted scalar")}function Nr(e,t){var i,n,r,s,a,o;if(o=e.input.charCodeAt(e.position),o!==34)return!1;for(e.kind="scalar",e.result="",e.position++,i=n=e.position;(o=e.input.charCodeAt(e.position))!==0;){if(o===34)return R(e,i,e.position,!0),e.position++,!0;if(o===92){if(R(e,i,e.position,!0),o=e.input.charCodeAt(++e.position),I(o))w(e,!1,t);else if(o<256&&ki[o])e.result+=Ci[o],e.position++;else if((a=Dr(o))>0){for(r=a,s=0;r>0;r--)o=e.input.charCodeAt(++e.position),(a=Br(o))>=0?s=(s<<4)+a:y(e,"expected hexadecimal character");e.result+=Lr(s),e.position++}else y(e,"unknown escape sequence");i=n=e.position}else I(o)?(R(e,i,n,!0),tt(e,w(e,!1,t)),i=n=e.position):e.position===e.lineStart&&Me(e)?y(e,"unexpected end of the document within a double quoted scalar"):(e.position++,n=e.position)}y(e,"unexpected end of the stream within a double quoted scalar")}function $r(e,t){var i=!0,n,r,s,a=e.tag,o,l=e.anchor,c,u,d,h,p,f=Object.create(null),g,m,v,x;if(x=e.input.charCodeAt(e.position),x===91)u=93,p=!1,o=[];else if(x===123)u=125,p=!0,o={};else return!1;for(e.anchor!==null&&(e.anchorMap[e.anchor]=o),x=e.input.charCodeAt(++e.position);x!==0;){if(w(e,!0,t),x=e.input.charCodeAt(e.position),x===u)return e.position++,e.tag=a,e.anchor=l,e.kind=p?"mapping":"sequence",e.result=o,!0;i?x===44&&y(e,"expected the node content, but found ','"):y(e,"missed comma between flow collection entries"),m=g=v=null,d=h=!1,x===63&&(c=e.input.charCodeAt(e.position+1),F(c)&&(d=h=!0,e.position++,w(e,!0,t))),n=e.line,r=e.lineStart,s=e.position,q(e,t,Ce,!1,!0),m=e.tag,g=e.result,w(e,!0,t),x=e.input.charCodeAt(e.position),(h||e.line===n)&&x===58&&(d=!0,x=e.input.charCodeAt(++e.position),w(e,!0,t),q(e,t,Ce,!1,!0),v=e.result),p?W(e,o,f,m,g,v,n,r,s):d?o.push(W(e,null,f,m,g,v,n,r,s)):o.push(g),w(e,!0,t),x=e.input.charCodeAt(e.position),x===44?(i=!0,x=e.input.charCodeAt(++e.position)):i=!1}y(e,"unexpected end of the stream within a flow collection")}function jr(e,t){var i,n,r=Ke,s=!1,a=!1,o=t,l=0,c=!1,u,d;if(d=e.input.charCodeAt(e.position),d===124)n=!1;else if(d===62)n=!0;else return!1;for(e.kind="scalar",e.result="";d!==0;)if(d=e.input.charCodeAt(++e.position),d===43||d===45)Ke===r?r=d===43?Ot:Fr:y(e,"repeat of a chomping mode identifier");else if((u=Pr(d))>=0)u===0?y(e,"bad explicit indentation width of a block scalar; it cannot be less than one"):a?y(e,"repeat of an indentation width identifier"):(o=t+u-1,a=!0);else break;if(j(d)){do d=e.input.charCodeAt(++e.position);while(j(d));if(d===35)do d=e.input.charCodeAt(++e.position);while(!I(d)&&d!==0)}for(;d!==0;){for(et(e),e.lineIndent=0,d=e.input.charCodeAt(e.position);(!a||e.lineIndent<o)&&d===32;)e.lineIndent++,d=e.input.charCodeAt(++e.position);if(!a&&e.lineIndent>o&&(o=e.lineIndent),I(d)){l++;continue}if(e.lineIndent<o){r===Ot?e.result+=k.repeat(`
`,s?1+l:l):r===Ke&&s&&(e.result+=`
`);break}for(n?j(d)?(c=!0,e.result+=k.repeat(`
`,s?1+l:l)):c?(c=!1,e.result+=k.repeat(`
`,l+1)):l===0?s&&(e.result+=" "):e.result+=k.repeat(`
`,l):e.result+=k.repeat(`
`,s?1+l:l),s=!0,a=!0,l=0,i=e.position;!I(d)&&d!==0;)d=e.input.charCodeAt(++e.position);R(e,i,e.position,!1)}return!0}function Ut(e,t){var i,n=e.tag,r=e.anchor,s=[],a,o=!1,l;if(e.firstTabInLine!==-1)return!1;for(e.anchor!==null&&(e.anchorMap[e.anchor]=s),l=e.input.charCodeAt(e.position);l!==0&&(e.firstTabInLine!==-1&&(e.position=e.firstTabInLine,y(e,"tab characters must not be used in indentation")),!(l!==45||(a=e.input.charCodeAt(e.position+1),!F(a))));){if(o=!0,e.position++,w(e,!0,-1)&&e.lineIndent<=t){s.push(null),l=e.input.charCodeAt(e.position);continue}if(i=e.line,q(e,t,vi,!1,!0),s.push(e.result),w(e,!0,-1),l=e.input.charCodeAt(e.position),(e.line===i||e.lineIndent>t)&&l!==0)y(e,"bad indentation of a sequence entry");else if(e.lineIndent<t)break}return o?(e.tag=n,e.anchor=r,e.kind="sequence",e.result=s,!0):!1}function Hr(e,t,i){var n,r,s,a,o,l,c=e.tag,u=e.anchor,d={},h=Object.create(null),p=null,f=null,g=null,m=!1,v=!1,x;if(e.firstTabInLine!==-1)return!1;for(e.anchor!==null&&(e.anchorMap[e.anchor]=d),x=e.input.charCodeAt(e.position);x!==0;){if(!m&&e.firstTabInLine!==-1&&(e.position=e.firstTabInLine,y(e,"tab characters must not be used in indentation")),n=e.input.charCodeAt(e.position+1),s=e.line,(x===63||x===58)&&F(n))x===63?(m&&(W(e,d,h,p,f,null,a,o,l),p=f=g=null),v=!0,m=!0,r=!0):m?(m=!1,r=!0):y(e,"incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"),e.position+=1,x=n;else{if(a=e.line,o=e.lineStart,l=e.position,!q(e,i,xi,!1,!0))break;if(e.line===s){for(x=e.input.charCodeAt(e.position);j(x);)x=e.input.charCodeAt(++e.position);if(x===58)x=e.input.charCodeAt(++e.position),F(x)||y(e,"a whitespace character is expected after the key-value separator within a block mapping"),m&&(W(e,d,h,p,f,null,a,o,l),p=f=g=null),v=!0,m=!1,r=!1,p=e.tag,f=e.result;else if(v)y(e,"can not read an implicit mapping pair; a colon is missed");else return e.tag=c,e.anchor=u,!0}else if(v)y(e,"can not read a block mapping entry; a multiline key may not be an implicit key");else return e.tag=c,e.anchor=u,!0}if((e.line===s||e.lineIndent>t)&&(m&&(a=e.line,o=e.lineStart,l=e.position),q(e,t,Ae,!0,r)&&(m?f=e.result:g=e.result),m||(W(e,d,h,p,f,g,a,o,l),p=f=g=null),w(e,!0,-1),x=e.input.charCodeAt(e.position)),(e.line===s||e.lineIndent>t)&&x!==0)y(e,"bad indentation of a mapping entry");else if(e.lineIndent<t)break}return m&&W(e,d,h,p,f,null,a,o,l),v&&(e.tag=c,e.anchor=u,e.kind="mapping",e.result=d),v}function Ur(e){var t,i=!1,n=!1,r,s,a;if(a=e.input.charCodeAt(e.position),a!==33)return!1;if(e.tag!==null&&y(e,"duplication of a tag property"),a=e.input.charCodeAt(++e.position),a===60?(i=!0,a=e.input.charCodeAt(++e.position)):a===33?(n=!0,r="!!",a=e.input.charCodeAt(++e.position)):r="!",t=e.position,i){do a=e.input.charCodeAt(++e.position);while(a!==0&&a!==62);e.position<e.length?(s=e.input.slice(t,e.position),a=e.input.charCodeAt(++e.position)):y(e,"unexpected end of the stream within a verbatim tag")}else{for(;a!==0&&!F(a);)a===33&&(n?y(e,"tag suffix cannot contain exclamation marks"):(r=e.input.slice(t-1,e.position+1),Ei.test(r)||y(e,"named tag handle cannot contain such characters"),n=!0,t=e.position+1)),a=e.input.charCodeAt(++e.position);s=e.input.slice(t,e.position),Ir.test(s)&&y(e,"tag suffix cannot contain flow indicator characters")}s&&!bi.test(s)&&y(e,"tag name cannot contain such characters: "+s);try{s=decodeURIComponent(s)}catch{y(e,"tag name is malformed: "+s)}return i?e.tag=s:O.call(e.tagMap,r)?e.tag=e.tagMap[r]+s:r==="!"?e.tag="!"+s:r==="!!"?e.tag="tag:yaml.org,2002:"+s:y(e,'undeclared tag handle "'+r+'"'),!0}function zr(e){var t,i;if(i=e.input.charCodeAt(e.position),i!==38)return!1;for(e.anchor!==null&&y(e,"duplication of an anchor property"),i=e.input.charCodeAt(++e.position),t=e.position;i!==0&&!F(i)&&!K(i);)i=e.input.charCodeAt(++e.position);return e.position===t&&y(e,"name of an anchor node must contain at least one character"),e.anchor=e.input.slice(t,e.position),!0}function Vr(e){var t,i,n;if(n=e.input.charCodeAt(e.position),n!==42)return!1;for(n=e.input.charCodeAt(++e.position),t=e.position;n!==0&&!F(n)&&!K(n);)n=e.input.charCodeAt(++e.position);return e.position===t&&y(e,"name of an alias node must contain at least one character"),i=e.input.slice(t,e.position),O.call(e.anchorMap,i)||y(e,'unidentified alias "'+i+'"'),e.result=e.anchorMap[i],w(e,!0,-1),!0}function q(e,t,i,n,r){var s,a,o,l=1,c=!1,u=!1,d,h,p,f,g,m;if(e.listener!==null&&e.listener("open",e),e.tag=null,e.anchor=null,e.kind=null,e.result=null,s=a=o=Ae===i||vi===i,n&&w(e,!0,-1)&&(c=!0,e.lineIndent>t?l=1:e.lineIndent===t?l=0:e.lineIndent<t&&(l=-1)),l===1)for(;Ur(e)||zr(e);)w(e,!0,-1)?(c=!0,o=s,e.lineIndent>t?l=1:e.lineIndent===t?l=0:e.lineIndent<t&&(l=-1)):o=!1;if(o&&(o=c||r),(l===1||Ae===i)&&(Ce===i||xi===i?g=t:g=t+1,m=e.position-e.lineStart,l===1?o&&(Ut(e,m)||Hr(e,m,g))||$r(e,g)?u=!0:(a&&jr(e,g)||Or(e,g)||Nr(e,g)?u=!0:Vr(e)?(u=!0,(e.tag!==null||e.anchor!==null)&&y(e,"alias node should not have any properties")):Rr(e,g,Ce===i)&&(u=!0,e.tag===null&&(e.tag="?")),e.anchor!==null&&(e.anchorMap[e.anchor]=e.result)):l===0&&(u=o&&Ut(e,m))),e.tag===null)e.anchor!==null&&(e.anchorMap[e.anchor]=e.result);else if(e.tag==="?"){for(e.result!==null&&e.kind!=="scalar"&&y(e,'unacceptable node kind for !<?> tag; it should be "scalar", not "'+e.kind+'"'),d=0,h=e.implicitTypes.length;d<h;d+=1)if(f=e.implicitTypes[d],f.resolve(e.result)){e.result=f.construct(e.result),e.tag=f.tag,e.anchor!==null&&(e.anchorMap[e.anchor]=e.result);break}}else if(e.tag!=="!"){if(O.call(e.typeMap[e.kind||"fallback"],e.tag))f=e.typeMap[e.kind||"fallback"][e.tag];else for(f=null,p=e.typeMap.multi[e.kind||"fallback"],d=0,h=p.length;d<h;d+=1)if(e.tag.slice(0,p[d].tag.length)===p[d].tag){f=p[d];break}f||y(e,"unknown tag !<"+e.tag+">"),e.result!==null&&f.kind!==e.kind&&y(e,"unacceptable node kind for !<"+e.tag+'> tag; it should be "'+f.kind+'", not "'+e.kind+'"'),f.resolve(e.result,e.tag)?(e.result=f.construct(e.result,e.tag),e.anchor!==null&&(e.anchorMap[e.anchor]=e.result)):y(e,"cannot resolve a node with !<"+e.tag+"> explicit tag")}return e.listener!==null&&e.listener("close",e),e.tag!==null||e.anchor!==null||u}function Yr(e){var t=e.position,i,n,r,s=!1,a;for(e.version=null,e.checkLineBreaks=e.legacy,e.tagMap=Object.create(null),e.anchorMap=Object.create(null);(a=e.input.charCodeAt(e.position))!==0&&(w(e,!0,-1),a=e.input.charCodeAt(e.position),!(e.lineIndent>0||a!==37));){for(s=!0,a=e.input.charCodeAt(++e.position),i=e.position;a!==0&&!F(a);)a=e.input.charCodeAt(++e.position);for(n=e.input.slice(i,e.position),r=[],n.length<1&&y(e,"directive name must not be less than one character in length");a!==0;){for(;j(a);)a=e.input.charCodeAt(++e.position);if(a===35){do a=e.input.charCodeAt(++e.position);while(a!==0&&!I(a));break}if(I(a))break;for(i=e.position;a!==0&&!F(a);)a=e.input.charCodeAt(++e.position);r.push(e.input.slice(i,e.position))}a!==0&&et(e),O.call(jt,n)?jt[n](e,n,r):Te(e,'unknown document directive "'+n+'"')}if(w(e,!0,-1),e.lineIndent===0&&e.input.charCodeAt(e.position)===45&&e.input.charCodeAt(e.position+1)===45&&e.input.charCodeAt(e.position+2)===45?(e.position+=3,w(e,!0,-1)):s&&y(e,"directives end mark is expected"),q(e,e.lineIndent-1,Ae,!1,!0),w(e,!0,-1),e.checkLineBreaks&&Mr.test(e.input.slice(t,e.position))&&Te(e,"non-ASCII line breaks are interpreted as content"),e.documents.push(e.result),e.position===e.lineStart&&Me(e)){e.input.charCodeAt(e.position)===46&&(e.position+=3,w(e,!0,-1));return}if(e.position<e.length-1)y(e,"end of the stream or a document separator is expected");else return}function Ti(e,t){e=String(e),t=t||{},e.length!==0&&(e.charCodeAt(e.length-1)!==10&&e.charCodeAt(e.length-1)!==13&&(e+=`
`),e.charCodeAt(0)===65279&&(e=e.slice(1)));var i=new _r(e,t),n=e.indexOf("\0");for(n!==-1&&(i.position=n,y(i,"null byte is not allowed in input")),i.input+="\0";i.input.charCodeAt(i.position)===32;)i.lineIndent+=1,i.position+=1;for(;i.position<i.length-1;)Yr(i);return i.documents}function Kr(e,t,i){t!==null&&typeof t=="object"&&typeof i>"u"&&(i=t,t=null);var n=Ti(e,i);if(typeof t!="function")return n;for(var r=0,s=n.length;r<s;r+=1)t(n[r])}function Wr(e,t){var i=Ti(e,t);if(i.length!==0){if(i.length===1)return i[0];throw new T("expected a single document in the stream, but found more")}}var qr=Kr,Gr=Wr,Fi={loadAll:qr,load:Gr},Si=Object.prototype.toString,Mi=Object.prototype.hasOwnProperty,it=65279,Qr=9,se=10,Jr=13,Xr=32,Zr=33,ea=34,qe=35,ta=37,ia=38,na=39,ra=42,Ii=44,aa=45,Fe=58,sa=61,oa=62,la=63,ca=64,Bi=91,Di=93,ua=96,Pi=123,da=124,Li=125,A={};A[0]="\\0";A[7]="\\a";A[8]="\\b";A[9]="\\t";A[10]="\\n";A[11]="\\v";A[12]="\\f";A[13]="\\r";A[27]="\\e";A[34]='\\"';A[92]="\\\\";A[133]="\\N";A[160]="\\_";A[8232]="\\L";A[8233]="\\P";var pa=["y","Y","yes","Yes","YES","on","On","ON","n","N","no","No","NO","off","Off","OFF"],ha=/^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;function fa(e,t){var i,n,r,s,a,o,l;if(t===null)return{};for(i={},n=Object.keys(t),r=0,s=n.length;r<s;r+=1)a=n[r],o=String(t[a]),a.slice(0,2)==="!!"&&(a="tag:yaml.org,2002:"+a.slice(2)),l=e.compiledTypeMap.fallback[a],l&&Mi.call(l.styleAliases,o)&&(o=l.styleAliases[o]),i[a]=o;return i}function ga(e){var t,i,n;if(t=e.toString(16).toUpperCase(),e<=255)i="x",n=2;else if(e<=65535)i="u",n=4;else if(e<=4294967295)i="U",n=8;else throw new T("code point within a string may not be greater than 0xFFFFFFFF");return"\\"+i+k.repeat("0",n-t.length)+t}var ma=1,oe=2;function ya(e){this.schema=e.schema||Ze,this.indent=Math.max(1,e.indent||2),this.noArrayIndent=e.noArrayIndent||!1,this.skipInvalid=e.skipInvalid||!1,this.flowLevel=k.isNothing(e.flowLevel)?-1:e.flowLevel,this.styleMap=fa(this.schema,e.styles||null),this.sortKeys=e.sortKeys||!1,this.lineWidth=e.lineWidth||80,this.noRefs=e.noRefs||!1,this.noCompatMode=e.noCompatMode||!1,this.condenseFlow=e.condenseFlow||!1,this.quotingType=e.quotingType==='"'?oe:ma,this.forceQuotes=e.forceQuotes||!1,this.replacer=typeof e.replacer=="function"?e.replacer:null,this.implicitTypes=this.schema.compiledImplicit,this.explicitTypes=this.schema.compiledExplicit,this.tag=null,this.result="",this.duplicates=[],this.usedDuplicates=null}function zt(e,t){for(var i=k.repeat(" ",t),n=0,r=-1,s="",a,o=e.length;n<o;)r=e.indexOf(`
`,n),r===-1?(a=e.slice(n),n=o):(a=e.slice(n,r+1),n=r+1),a.length&&a!==`
`&&(s+=i),s+=a;return s}function Ge(e,t){return`
`+k.repeat(" ",e.indent*t)}function xa(e,t){var i,n,r;for(i=0,n=e.implicitTypes.length;i<n;i+=1)if(r=e.implicitTypes[i],r.resolve(t))return!0;return!1}function Se(e){return e===Xr||e===Qr}function le(e){return 32<=e&&e<=126||161<=e&&e<=55295&&e!==8232&&e!==8233||57344<=e&&e<=65533&&e!==it||65536<=e&&e<=1114111}function Vt(e){return le(e)&&e!==it&&e!==Jr&&e!==se}function Yt(e,t,i){var n=Vt(e),r=n&&!Se(e);return(i?n:n&&e!==Ii&&e!==Bi&&e!==Di&&e!==Pi&&e!==Li)&&e!==qe&&!(t===Fe&&!r)||Vt(t)&&!Se(t)&&e===qe||t===Fe&&r}function va(e){return le(e)&&e!==it&&!Se(e)&&e!==aa&&e!==la&&e!==Fe&&e!==Ii&&e!==Bi&&e!==Di&&e!==Pi&&e!==Li&&e!==qe&&e!==ia&&e!==ra&&e!==Zr&&e!==da&&e!==sa&&e!==oa&&e!==na&&e!==ea&&e!==ta&&e!==ca&&e!==ua}function Ea(e){return!Se(e)&&e!==Fe}function re(e,t){var i=e.charCodeAt(t),n;return i>=55296&&i<=56319&&t+1<e.length&&(n=e.charCodeAt(t+1),n>=56320&&n<=57343)?(i-55296)*1024+n-56320+65536:i}function _i(e){var t=/^\n* /;return t.test(e)}var Ri=1,Qe=2,Oi=3,Ni=4,Y=5;function ba(e,t,i,n,r,s,a,o){var l,c=0,u=null,d=!1,h=!1,p=n!==-1,f=-1,g=va(re(e,0))&&Ea(re(e,e.length-1));if(t||a)for(l=0;l<e.length;c>=65536?l+=2:l++){if(c=re(e,l),!le(c))return Y;g=g&&Yt(c,u,o),u=c}else{for(l=0;l<e.length;c>=65536?l+=2:l++){if(c=re(e,l),c===se)d=!0,p&&(h=h||l-f-1>n&&e[f+1]!==" ",f=l);else if(!le(c))return Y;g=g&&Yt(c,u,o),u=c}h=h||p&&l-f-1>n&&e[f+1]!==" "}return!d&&!h?g&&!a&&!r(e)?Ri:s===oe?Y:Qe:i>9&&_i(e)?Y:a?s===oe?Y:Qe:h?Ni:Oi}function wa(e,t,i,n,r){e.dump=(function(){if(t.length===0)return e.quotingType===oe?'""':"''";if(!e.noCompatMode&&(pa.indexOf(t)!==-1||ha.test(t)))return e.quotingType===oe?'"'+t+'"':"'"+t+"'";var s=e.indent*Math.max(1,i),a=e.lineWidth===-1?-1:Math.max(Math.min(e.lineWidth,40),e.lineWidth-s),o=n||e.flowLevel>-1&&i>=e.flowLevel;function l(c){return xa(e,c)}switch(ba(t,o,e.indent,a,l,e.quotingType,e.forceQuotes&&!n,r)){case Ri:return t;case Qe:return"'"+t.replace(/'/g,"''")+"'";case Oi:return"|"+Kt(t,e.indent)+Wt(zt(t,s));case Ni:return">"+Kt(t,e.indent)+Wt(zt(ka(t,a),s));case Y:return'"'+Ca(t)+'"';default:throw new T("impossible error: invalid scalar style")}})()}function Kt(e,t){var i=_i(e)?String(t):"",n=e[e.length-1]===`
`,r=n&&(e[e.length-2]===`
`||e===`
`),s=r?"+":n?"":"-";return i+s+`
`}function Wt(e){return e[e.length-1]===`
`?e.slice(0,-1):e}function ka(e,t){for(var i=/(\n+)([^\n]*)/g,n=(function(){var c=e.indexOf(`
`);return c=c!==-1?c:e.length,i.lastIndex=c,qt(e.slice(0,c),t)})(),r=e[0]===`
`||e[0]===" ",s,a;a=i.exec(e);){var o=a[1],l=a[2];s=l[0]===" ",n+=o+(!r&&!s&&l!==""?`
`:"")+qt(l,t),r=s}return n}function qt(e,t){if(e===""||e[0]===" ")return e;for(var i=/ [^ ]/g,n,r=0,s,a=0,o=0,l="";n=i.exec(e);)o=n.index,o-r>t&&(s=a>r?a:o,l+=`
`+e.slice(r,s),r=s+1),a=o;return l+=`
`,e.length-r>t&&a>r?l+=e.slice(r,a)+`
`+e.slice(a+1):l+=e.slice(r),l.slice(1)}function Ca(e){for(var t="",i=0,n,r=0;r<e.length;i>=65536?r+=2:r++)i=re(e,r),n=A[i],!n&&le(i)?(t+=e[r],i>=65536&&(t+=e[r+1])):t+=n||ga(i);return t}function Aa(e,t,i){var n="",r=e.tag,s,a,o;for(s=0,a=i.length;s<a;s+=1)o=i[s],e.replacer&&(o=e.replacer.call(i,String(s),o)),(L(e,t,o,!1,!1)||typeof o>"u"&&L(e,t,null,!1,!1))&&(n!==""&&(n+=","+(e.condenseFlow?"":" ")),n+=e.dump);e.tag=r,e.dump="["+n+"]"}function Gt(e,t,i,n){var r="",s=e.tag,a,o,l;for(a=0,o=i.length;a<o;a+=1)l=i[a],e.replacer&&(l=e.replacer.call(i,String(a),l)),(L(e,t+1,l,!0,!0,!1,!0)||typeof l>"u"&&L(e,t+1,null,!0,!0,!1,!0))&&((!n||r!=="")&&(r+=Ge(e,t)),e.dump&&se===e.dump.charCodeAt(0)?r+="-":r+="- ",r+=e.dump);e.tag=s,e.dump=r||"[]"}function Ta(e,t,i){var n="",r=e.tag,s=Object.keys(i),a,o,l,c,u;for(a=0,o=s.length;a<o;a+=1)u="",n!==""&&(u+=", "),e.condenseFlow&&(u+='"'),l=s[a],c=i[l],e.replacer&&(c=e.replacer.call(i,l,c)),L(e,t,l,!1,!1)&&(e.dump.length>1024&&(u+="? "),u+=e.dump+(e.condenseFlow?'"':"")+":"+(e.condenseFlow?"":" "),L(e,t,c,!1,!1)&&(u+=e.dump,n+=u));e.tag=r,e.dump="{"+n+"}"}function Fa(e,t,i,n){var r="",s=e.tag,a=Object.keys(i),o,l,c,u,d,h;if(e.sortKeys===!0)a.sort();else if(typeof e.sortKeys=="function")a.sort(e.sortKeys);else if(e.sortKeys)throw new T("sortKeys must be a boolean or a function");for(o=0,l=a.length;o<l;o+=1)h="",(!n||r!=="")&&(h+=Ge(e,t)),c=a[o],u=i[c],e.replacer&&(u=e.replacer.call(i,c,u)),L(e,t+1,c,!0,!0,!0)&&(d=e.tag!==null&&e.tag!=="?"||e.dump&&e.dump.length>1024,d&&(e.dump&&se===e.dump.charCodeAt(0)?h+="?":h+="? "),h+=e.dump,d&&(h+=Ge(e,t)),L(e,t+1,u,!0,d)&&(e.dump&&se===e.dump.charCodeAt(0)?h+=":":h+=": ",h+=e.dump,r+=h));e.tag=s,e.dump=r||"{}"}function Qt(e,t,i){var n,r,s,a,o,l;for(r=i?e.explicitTypes:e.implicitTypes,s=0,a=r.length;s<a;s+=1)if(o=r[s],(o.instanceOf||o.predicate)&&(!o.instanceOf||typeof t=="object"&&t instanceof o.instanceOf)&&(!o.predicate||o.predicate(t))){if(i?o.multi&&o.representName?e.tag=o.representName(t):e.tag=o.tag:e.tag="?",o.represent){if(l=e.styleMap[o.tag]||o.defaultStyle,Si.call(o.represent)==="[object Function]")n=o.represent(t,l);else if(Mi.call(o.represent,l))n=o.represent[l](t,l);else throw new T("!<"+o.tag+'> tag resolver accepts not "'+l+'" style');e.dump=n}return!0}return!1}function L(e,t,i,n,r,s,a){e.tag=null,e.dump=i,Qt(e,i,!1)||Qt(e,i,!0);var o=Si.call(e.dump),l=n,c;n&&(n=e.flowLevel<0||e.flowLevel>t);var u=o==="[object Object]"||o==="[object Array]",d,h;if(u&&(d=e.duplicates.indexOf(i),h=d!==-1),(e.tag!==null&&e.tag!=="?"||h||e.indent!==2&&t>0)&&(r=!1),h&&e.usedDuplicates[d])e.dump="*ref_"+d;else{if(u&&h&&!e.usedDuplicates[d]&&(e.usedDuplicates[d]=!0),o==="[object Object]")n&&Object.keys(e.dump).length!==0?(Fa(e,t,e.dump,r),h&&(e.dump="&ref_"+d+e.dump)):(Ta(e,t,e.dump),h&&(e.dump="&ref_"+d+" "+e.dump));else if(o==="[object Array]")n&&e.dump.length!==0?(e.noArrayIndent&&!a&&t>0?Gt(e,t-1,e.dump,r):Gt(e,t,e.dump,r),h&&(e.dump="&ref_"+d+e.dump)):(Aa(e,t,e.dump),h&&(e.dump="&ref_"+d+" "+e.dump));else if(o==="[object String]")e.tag!=="?"&&wa(e,e.dump,t,s,l);else{if(o==="[object Undefined]")return!1;if(e.skipInvalid)return!1;throw new T("unacceptable kind of an object to dump "+o)}e.tag!==null&&e.tag!=="?"&&(c=encodeURI(e.tag[0]==="!"?e.tag.slice(1):e.tag).replace(/!/g,"%21"),e.tag[0]==="!"?c="!"+c:c.slice(0,18)==="tag:yaml.org,2002:"?c="!!"+c.slice(18):c="!<"+c+">",e.dump=c+" "+e.dump)}return!0}function Sa(e,t){var i=[],n=[],r,s;for(Je(e,i,n),r=0,s=n.length;r<s;r+=1)t.duplicates.push(i[n[r]]);t.usedDuplicates=new Array(s)}function Je(e,t,i){var n,r,s;if(e!==null&&typeof e=="object")if(r=t.indexOf(e),r!==-1)i.indexOf(r)===-1&&i.push(r);else if(t.push(e),Array.isArray(e))for(r=0,s=e.length;r<s;r+=1)Je(e[r],t,i);else for(n=Object.keys(e),r=0,s=n.length;r<s;r+=1)Je(e[n[r]],t,i)}function Ma(e,t){t=t||{};var i=new ya(t);i.noRefs||Sa(e,i);var n=e;return i.replacer&&(n=i.replacer.call({"":n},"",n)),L(i,0,n,!0,!0)?i.dump+`
`:""}var Ia=Ma,Ba={dump:Ia};function nt(e,t){return function(){throw new Error("Function yaml."+e+" is removed in js-yaml 4. Use yaml."+t+" instead, which is now safe by default.")}}var Da=C,Pa=Zt,La=ni,_a=li,Ra=ci,Oa=Ze,Na=Fi.load,$a=Fi.loadAll,ja=Ba.dump,Ha=T,Ua={binary:fi,float:oi,map:ii,null:ri,pairs:mi,set:yi,timestamp:pi,bool:ai,int:si,merge:hi,omap:gi,seq:ti,str:ei},za=nt("safeLoad","load"),Va=nt("safeLoadAll","loadAll"),Ya=nt("safeDump","dump"),H={Type:Da,Schema:Pa,FAILSAFE_SCHEMA:La,JSON_SCHEMA:_a,CORE_SCHEMA:Ra,DEFAULT_SCHEMA:Oa,load:Na,loadAll:$a,dump:ja,YAMLException:Ha,types:Ua,safeLoad:za,safeLoadAll:Va,safeDump:Ya};var U={name:"",occupation:"",company:"",city:"",skills:[],roles:[],relationships:[],goals:[],focusAreas:[],lastUpdated:new Date().toISOString().split("T")[0]};function $i(e){let t={...U},i=e.match(/^---\n([\s\S]*?)\n---/);if(i)try{let n=H.load(i[1]);n&&(typeof n.name=="string"&&(t.name=n.name),typeof n.occupation=="string"&&(t.occupation=n.occupation),typeof n.company=="string"&&(t.company=n.company),typeof n.city=="string"&&(t.city=n.city),Array.isArray(n.skills)&&(t.skills=n.skills.map(String)),Array.isArray(n.roles)&&(t.roles=n.roles.map(String)),Array.isArray(n.relationships)&&(t.relationships=n.relationships.map(String)),Array.isArray(n.goals)&&(t.goals=n.goals.map(String)),Array.isArray(n.focusAreas)&&(t.focusAreas=n.focusAreas.map(String)))}catch{}return!t.name&&!t.company?Ka(e):t}function Ka(e){let t={...U},i=e.split(`
`),n="";for(let r of i){let s=r.trim();if(s.startsWith("## ")){n=s.slice(3);continue}if(n==="\u57FA\u672C\u4FE1\u606F"&&s.startsWith("- ")){let a=s.slice(2),[o,...l]=a.split("\uFF1A"),c=l.join("\uFF1A");o==="\u59D3\u540D"&&(t.name=c),(o==="\u804C\u4E1A"||o==="\u804C\u4F4D")&&(t.occupation=c),(o==="\u516C\u53F8/\u7EC4\u7EC7"||o==="\u516C\u53F8")&&(t.company=c),o==="\u57CE\u5E02"&&(t.city=c)}if(s.startsWith("- ")&&!s.includes("\uFF1A")){let a=s.slice(2);if(a==="_\u6682\u65E0_")continue;n==="\u6280\u80FD\u4E0E\u4E13\u4E1A"&&t.skills.push(a),n==="\u89D2\u8272\u4E0E\u5173\u7CFB"&&t.roles.push(a),n==="\u76EE\u6807\u4E0E\u8BA1\u5212"&&t.goals.push(a),n==="\u5173\u6CE8\u9886\u57DF"&&t.focusAreas.push(a)}if(s.startsWith("- \u5173\u7CFB\uFF1A")&&n==="\u89D2\u8272\u4E0E\u5173\u7CFB"){let a=s.slice(5);a!=="_\u6682\u65E0_"&&t.relationships.push(a)}}return t}var Wa="TraceMind/PROFILE.md";async function ji(e){let t=e.vault.getFileByPath(Wa);if(!t)return{...U};try{let i=await e.vault.read(t);return $i(i)}catch{return{...U}}}function ce(e){let t=0;for(let i=0;i<e.length;i++){let n=e.charCodeAt(i);t=(t<<5)-t+n,t=t&t}return Math.abs(t).toString(16).padStart(8,"0").slice(0,8)}var qa=["company","role","relationship_to_user"],Ga=["responsibility","communicationStyle"],Qa=["personality","preferences","skills"],Ja=["subtype","status"],Xa=["deadline","description"],Za=["priority","goals"],es=["subtype"],ts=["occurrenceCount","context"],is=["context"],ns={company:"P0",project:"P0",task:"P0",product:"P1",technology:"P1",document:"P2",location:"P2",other:"P2"},ho=Object.keys(ns);var rt={P0:1.5,P1:1,P2:.5},Ie={person:{p0:qa,p1:Ga,p2:Qa},object:{p0:Ja,p1:Xa,p2:Za},theme:{p0:es,p1:ts,p2:is}};function at(e,t){let i=Ie[e],n=i.p0.length===0||i.p0.every(a=>t[a]!=null),r=i.p1.some(a=>t[a]!=null),s=i.p2.some(a=>t[a]!=null);return n&&r&&s?"L3":n&&r?"L2":n?"L1":"L0"}function Hi(e,t,i,n=1){let r=Ie[e];if(r.p0.length+r.p1.length+r.p2.length===0)return 0;let s=0,a=r.p0.filter(c=>t[c]!=null).length,o=a/Math.max(r.p0.length,1),l=a===0&&r.p0.length>0?r.p0.length/3*.5:o;if(s+=l*rt.P0,r.p1.length>0){let c=r.p1.filter(u=>t[u]!=null).length;s+=c/r.p1.length*rt.P1}if(r.p2.length>0){let c=r.p2.filter(u=>t[u]!=null).length;s+=c/r.p2.length*rt.P2}return s*n*(1+Math.log1p(i))}var st={create(e){let t=new Date().toISOString();return{id:ce(e.name),userId:e.userId||"",cardType:e.cardType,name:e.name,aliases:e.aliases||[],attributes:e.attributes||{},relatedPeople:[],relatedObjects:[],relatedThemes:[],evidenceEntryIds:[],confidence:.5,maturity:at(e.cardType,e.attributes||{}),status:"needs_confirmation",lifecycle:"candidate",importance:0,createdAt:t,lastUpdated:t}}};var rs=H.dump,as=H.load,Be="---";function G(e){let t={id:e.id,name:e.name,type:e.cardType,maturity:e.maturity,confidence:e.confidence,status:e.status,aliases:e.aliases,createdAt:e.createdAt,lastUpdated:e.lastUpdated};for(let[a,o]of Object.entries(e.attributes))o!=null&&(t[a]=o);let i=[`# ${e.name}`,""],n=os(e);n.length>0&&(i.push("## \u57FA\u672C\u4FE1\u606F"),i.push(...n),i.push(""));let r=e.attributes.interactions||[];if(r.length>0){i.push("## \u4E92\u52A8\u8BB0\u5F55");for(let a of r.slice(-5)){let o=a.timestamp?new Date(a.timestamp).toISOString().split("T")[0]:"";i.push("- "+o+" "+a.content)}i.push("")}else e.attributes.interactions;let s=rs(t).trim();return`${Be}
${s}
${Be}

${i.join(`
`)}`}function ue(e){let t=ss(e),i=t.frontmatter,n=t.body,r=i.type,s=Array.isArray(i.aliases)?i.aliases:[],a=new Set(["id","name","type","maturity","confidence","status","aliases","createdAt","lastUpdated","lifecycle","importance","userId","relatedPeople","relatedObjects","relatedThemes","evidenceEntryIds"]),o={};for(let[l,c]of Object.entries(i))!a.has(l)&&c!=null&&(o[l]=c);return{id:i.id||ce(i.name),userId:"",cardType:r,name:i.name,aliases:s,attributes:o,relatedPeople:[],relatedObjects:[],relatedThemes:[],evidenceEntryIds:[],confidence:i.confidence??.5,maturity:i.maturity??"L0",status:i.status??"needs_confirmation",lifecycle:"candidate",importance:0,createdAt:i.createdAt||new Date().toISOString(),lastUpdated:i.lastUpdated||new Date().toISOString()}}function ss(e){let t=e.trim();if(!t.startsWith(Be))return{frontmatter:{},body:t};let i=t.indexOf(Be,3);if(i===-1)return{frontmatter:{},body:t};let n=t.slice(3,i).trim(),r=t.slice(i+3).trim();return{frontmatter:as(n)||{},body:r}}function os(e){let t=[];return e.cardType==="person"&&(e.attributes.company&&t.push("- \u516C\u53F8\uFF1A"+e.attributes.company),e.attributes.role&&t.push("- \u804C\u4F4D\uFF1A"+e.attributes.role),e.attributes.relationship_to_user&&t.push("- \u5173\u7CFB\uFF1A"+e.attributes.relationship_to_user),e.attributes.responsibility&&t.push("- \u804C\u8D23\uFF1A"+e.attributes.responsibility)),e.cardType==="object"&&(e.attributes.subtype&&t.push("- \u7C7B\u578B\uFF1A"+(te(e.cardType,e.attributes.subtype)||e.attributes.subtype)),e.attributes.status&&t.push("- \u72B6\u6001\uFF1A"+e.attributes.status),e.attributes.deadline&&t.push("- \u622A\u6B62\u65E5\u671F\uFF1A"+e.attributes.deadline)),e.cardType==="theme"&&(e.attributes.subtype&&t.push("- \u7C7B\u578B\uFF1A"+(te(e.cardType,e.attributes.subtype)||e.attributes.subtype)),e.attributes.occurrenceCount&&t.push("- \u51FA\u73B0\u6B21\u6570\uFF1A"+e.attributes.occurrenceCount)),t}function ls(e,t){let i=`\u4F60\u662F\u4E00\u4E2A\u7CBE\u51C6\u7684\u5B9E\u4F53\u63D0\u53D6\u548C\u65E5\u8BB0\u5206\u7C7B\u4E13\u5BB6\u3002\u8BF7\u5BF9\u4EE5\u4E0B\u65E5\u8BB0\u6587\u672C\u8FDB\u884C\u5206\u6790\u3002

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

${At()}`;if(t){let n=t.includes("\u5DF2\u77E5\u5B9E\u4F53");i+=`

`+t,n&&(i+=`

\u6CE8\u610F\uFF1A\u5DF2\u77E5\u5B9E\u4F53\u5DF2\u5EFA\u6863\uFF0C\u4E0D\u8981\u91CD\u590D\u63D0\u53D6\uFF0C\u53EA\u63D0\u53D6\u65B0\u51FA\u73B0\u7684\u5B9E\u4F53\u3002`)}return i+=`

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
${e}`,i}function cs(e){let t=["person","object","theme"];try{let i=e.trim(),n=i.indexOf('{"entities"');if(n>=0){let l=0,c=n;for(let u=n;u<i.length;u++)if(i[u]==="{")l++;else if(i[u]==="}"&&(l--,l===0)){c=u+1;break}i=i.slice(n,c),console.log('[TraceMind] parseLLM: extracted JSON via {"entities"} pattern:',i.substring(0,200))}else{let l=i.lastIndexOf(">");if(l>=0&&l>i.length*.3){let u=i.slice(l+1).trim();u.startsWith("{")&&(i=u)}console.log("[TraceMind] parseLLM: after tag removal (first 200):",i.substring(0,200));let c=i.match(/```(?:json)?\s*\n?([\s\S]*?)```/);if(c&&(i=c[1].trim()),!i.startsWith("{")){let u=i.indexOf("{"),d=i.lastIndexOf("}");u!==-1&&d!==-1&&(i=i.slice(u,d+1))}console.log("[TraceMind] parseLLM: final JSON (first 200):",i.substring(0,200))}let r=JSON.parse(i);if(console.log("[TraceMind] parseLLM: parsed JSON:",JSON.stringify(r).substring(0,200)),!r.entities||!Array.isArray(r.entities))return{entities:[]};let s=["\u5DE5\u4F5C","\u751F\u6D3B","\u5B66\u4E60","\u8FD0\u52A8","\u5176\u4ED6"],a=typeof r.domain=="string"&&s.includes(r.domain)?r.domain:void 0,o=[];for(let l of r.entities)!l.name||typeof l.name!="string"||l.name.trim()===""||t.includes(l.type)&&o.push({name:l.name.trim(),type:l.type,subtype:l.subtype,confidence:typeof l.confidence=="number"?l.confidence:.5});return{domain:a,entities:o}}catch{return{entities:[]}}}async function Ui(e,t){console.log("[TraceMind] LLM extract called, baseUrl:",t.baseUrl,"model:",t.model);let i=ls(e,t.profileContext),n=t.baseUrl.replace(/\/+$/,""),r=n.endsWith("/v1")||n.endsWith("/chat/completions")?n.endsWith("/chat/completions")?n:`${n}/chat/completions`:`${n}/v1/chat/completions`;console.log("[TraceMind] LLM URL:",r),console.log("[TraceMind] LLM prompt:",i.substring(0,200));let s=await fetch(r,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t.apiKey}`},body:JSON.stringify({model:t.model,messages:[{role:"user",content:i}],temperature:0,max_tokens:2e3})});if(console.log("[TraceMind] LLM response status:",s.status),!s.ok){let u=await s.text();throw new Error(`LLM extraction failed: HTTP ${s.status} - ${u}`)}let l=(await s.json()).choices?.[0]?.message?.content??"";console.log("[TraceMind] LLM raw response:",l);let c=cs(l);return console.log("[TraceMind] LLM parsed: domain=",c.domain,"entities=",c.entities.length,c.entities),c}var us={L0:30,L1:20,L2:10,L3:10},ds={P0:10,P1:5,P2:2};function ps(e){let t=us[e.maturityLevel]??10;return e.attributePriority&&(t+=ds[e.attributePriority]??2),e.type==="new_entity"&&(t+=10),t}function ot(e,t,i,n){let r=[],s=Ie[e];for(let a of s.p0)i[a]==null&&r.push({type:"missing_attribute",entityName:"",entityType:e,maturityLevel:t,attributePriority:"P0",missingAttribute:a,score:0,description:`Missing P0 attribute: ${a}`});for(let a of s.p1)i[a]==null&&r.push({type:"missing_attribute",entityName:"",entityType:e,maturityLevel:t,attributePriority:"P1",missingAttribute:a,score:0,description:`Missing P1 attribute: ${a}`});for(let a of s.p2)i[a]==null&&r.push({type:"missing_attribute",entityName:"",entityType:e,maturityLevel:t,attributePriority:"P2",missingAttribute:a,score:0,description:`Missing P2 attribute: ${a}`});t!=="L0"&&n.length===0&&r.push({type:"missing_relation",entityName:"",entityType:e,maturityLevel:t,attributePriority:"P1",score:0,description:"No relations established"});for(let a of r)a.score=ps(a);return r.sort((a,o)=>o.score-a.score)}function hs(e){let t={children:new Map,fail:null,output:[]};for(let n of e){let r=t;for(let s of n.text){let a=r.children.get(s);a||(a={children:new Map,fail:null,output:[]},r.children.set(s,a)),r=a}r.output.push({entityName:n.entityName,entityId:n.entityId,matchType:n.matchType,patternLen:n.text.length})}let i=[];for(let n of t.children.values())n.fail=t,i.push(n);for(;i.length>0;){let n=i.shift();for(let[r,s]of n.children){i.push(s);let a=n.fail;for(;a!==null&&!a.children.has(r);)a=a.fail;s.fail=a&&a.children.get(r)||t,s.fail&&s.output.push(...s.fail.output)}}return t}function fs(e,t){let i=[],n=new Set,r=e;for(let s=0;s<t.length;s++){let a=t[s];for(;r!==e&&!r.children.has(a);)r=r.fail;let o=r.children.get(a);o?r=o:r=e;for(let l of r.output){let c=l.entityId+":"+l.matchType;n.has(c)||(n.add(c),i.push({matchedText:t.slice(s-l.patternLen+1,s+1),entityName:l.entityName,entityId:l.entityId,matchType:l.matchType,position:s-l.patternLen+1}))}}return i}function zi(e,t){if(t.length===0)return[];let i=[];for(let r of t){r.name.length>=2&&i.push({text:r.name,entityName:r.name,entityId:r.id,matchType:"exact"});for(let s of r.aliases||[])s.length>=2&&i.push({text:s,entityName:r.name,entityId:r.id,matchType:"alias"});if(r.name.length>=2){let s=r.name.slice(0,Math.min(3,r.name.length));i.filter(o=>o.entityId===r.id&&o.text===s).length===0&&s.length>=2&&i.push({text:s,entityName:r.name,entityId:r.id,matchType:"prefix"})}}i.sort((r,s)=>s.text.length-r.text.length);let n=hs(i);return fs(n,e)}var gs=5,Vi={company:"\u8FD9\u4E2A**\u516C\u53F8/\u7EC4\u7EC7**\u80FD\u4ECB\u7ECD\u4E00\u4E0B\u5417\uFF1F\u6BD4\u5982\u4E1A\u52A1\u9886\u57DF\u3001\u5408\u4F5C\u5173\u7CFB\u3001\u76F8\u5173\u80CC\u666F\u7B49\u3002",project:"\u8FD9\u4E2A**\u9879\u76EE**\u80FD\u4ECB\u7ECD\u4E00\u4E0B\u5417\uFF1F\u6BD4\u5982\u5F53\u524D\u72B6\u6001\u3001\u65F6\u95F4\u8282\u70B9\u3001\u76F8\u5173\u80CC\u666F\u7B49\u3002",task:"\u8FD9\u4E2A**\u4EFB\u52A1**\u80FD\u4ECB\u7ECD\u4E00\u4E0B\u5417\uFF1F\u6BD4\u5982\u5F53\u524D\u72B6\u6001\u3001\u65F6\u95F4\u8282\u70B9\u3001\u76F8\u5173\u80CC\u666F\u7B49\u3002",product:"\u8FD9\u4E2A**\u4EA7\u54C1**\u80FD\u4ECB\u7ECD\u4E00\u4E0B\u5417\uFF1F\u6BD4\u5982\u5F53\u524D\u72B6\u6001\u3001\u5173\u952E\u7279\u6027\u3001\u76F8\u5173\u80CC\u666F\u7B49\u3002",technology:"\u8FD9\u4E2A**\u6280\u672F**\u80FD\u4ECB\u7ECD\u4E00\u4E0B\u5417\uFF1F\u6BD4\u5982\u5F53\u524D\u72B6\u6001\u3001\u4E3B\u8981\u7528\u9014\u3001\u76F8\u5173\u80CC\u666F\u7B49\u3002",document:"\u8FD9\u4E2A**\u6587\u6863**\u80FD\u4ECB\u7ECD\u4E00\u4E0B\u5417\uFF1F\u6BD4\u5982\u5F53\u524D\u72B6\u6001\u3001\u4E3B\u8981\u7528\u9014\u3001\u76F8\u5173\u80CC\u666F\u7B49\u3002",location:"\u8FD9\u4E2A**\u5730\u70B9**\u80FD\u4ECB\u7ECD\u4E00\u4E0B\u5417\uFF1F\u6BD4\u5982\u5728\u54EA\u91CC\u3001\u6709\u4EC0\u4E48\u7279\u522B\u4E4B\u5904\u7B49\u3002"},Yi={friction:"\u8FD9\u4E2A**\u6469\u64E6**\u80FD\u804A\u804A\u5417\uFF1F\u6BD4\u5982\u662F\u4EC0\u4E48\u5BFC\u81F4\u7684\u3001\u6301\u7EED\u591A\u4E45\u4E86\u3001\u5F71\u54CD\u6709\u591A\u5927\uFF1F",goal:"\u8FD9\u4E2A**\u76EE\u6807**\u80FD\u804A\u804A\u5417\uFF1F\u6BD4\u5982\u76EE\u524D\u8FDB\u5C55\u3001\u4E0B\u4E00\u6B65\u8BA1\u5212\u3001\u6709\u4EC0\u4E48\u963B\u7887\uFF1F",judgment:"\u8FD9\u4E2A**\u5224\u65AD**\u80FD\u804A\u804A\u5417\uFF1F\u6BD4\u5982\u57FA\u4E8E\u4EC0\u4E48\u5F62\u6210\u7684\u3001\u6709\u591A\u5927\u628A\u63E1\uFF1F",idea:"\u8FD9\u4E2A**\u60F3\u6CD5**\u80FD\u804A\u804A\u5417\uFF1F\u6BD4\u5982\u600E\u4E48\u4EA7\u751F\u7684\u3001\u6709\u6CA1\u6709\u66F4\u5177\u4F53\u7684\u601D\u8003\uFF1F"};function Ki(e,t){return e.type==="new_entity"?e.entityType==="object"&&t&&Vi[t]?`${e.entityName} ${Vi[t]}`:e.entityType==="object"?`${e.entityName} \u80FD\u4ECB\u7ECD\u4E00\u4E0B\u5417\uFF1F\u6BD4\u5982\u5F53\u524D\u72B6\u6001\u3001\u65F6\u95F4\u8282\u70B9\u3001\u76F8\u5173\u80CC\u666F\u7B49\u3002`:e.entityType==="theme"&&t&&Yi[t]?`${e.entityName} ${Yi[t]}`:e.entityType==="theme"?`${e.entityName} \u80FD\u804A\u804A\u5417\uFF1F\u6BD4\u5982\u8FD9\u4E2A\u60C5\u51B5\u5F71\u54CD\u6709\u591A\u5927\u3001\u6301\u7EED\u591A\u4E45\u4E86\uFF1F`:e.entityType==="person"?`${e.entityName} \u662F\u8C01\uFF1F\u80FD\u4ECB\u7ECD\u4E00\u4E0B\u5417\uFF1F\u6BD4\u5982\u5728\u54EA\u5BB6\u516C\u53F8\u3001\u4EC0\u4E48\u804C\u4F4D\u3001\u548C\u4F60\u7684\u5173\u7CFB\u7B49\u3002`:`${e.entityName} \u662F\u4EC0\u4E48\uFF1F`:e.type==="missing_attribute"&&e.missingAttribute?{company:e.entityName+" \u5728\u54EA\u4E2A\u516C\u53F8\u6216\u7EC4\u7EC7\u5DE5\u4F5C\uFF1F",role:e.entityName+" \u7684\u804C\u4F4D\u6216\u89D2\u8272\u662F\u4EC0\u4E48\uFF1F",relationship_to_user:"\u4F60\u548C "+e.entityName+" \u662F\u4EC0\u4E48\u5173\u7CFB\uFF1F",responsibility:e.entityName+" \u8D1F\u8D23\u4EC0\u4E48\u5DE5\u4F5C\uFF1F",subtype:e.entityName+" \u662F\u4EC0\u4E48\u7C7B\u578B\uFF1F\u6BD4\u5982\u9879\u76EE\u3001\u4EFB\u52A1\u3001\u4EA7\u54C1\u7B49\uFF1F",status:e.entityName+" \u5F53\u524D\u7684\u72B6\u6001\u662F\u4EC0\u4E48\uFF1F",deadline:e.entityName+" \u6709\u622A\u6B62\u65E5\u671F\u6216\u65F6\u95F4\u8282\u70B9\u5417\uFF1F"}[e.missingAttribute]||`\u5173\u4E8E ${e.entityName} \u7684 ${e.missingAttribute} \u4FE1\u606F\u662F\u4EC0\u4E48\uFF1F`:e.type==="missing_relation"?`${e.entityName} \u548C\u4EC0\u4E48\u5176\u4ED6\u5B9E\u4F53\u6709\u5173\u8054\uFF1F`:e.type==="recurring_pattern"?`${e.entityName} \u5DF2\u7ECF\u591A\u6B21\u51FA\u73B0\uFF0C\u5B83\u4EE3\u8868\u4EC0\u4E48\uFF1F`:`\u8BF7\u63D0\u4F9B\u66F4\u591A\u5173\u4E8E ${e.entityName} \u7684\u4FE1\u606F\u3002`}function ms(e,t){for(let[i,n]of t)if(n.name===e.name)return{cardId:i,maturity:n.maturity};return null}var de=class{static analyzeBlock(t,i){return console.warn("[TraceMind] analyzeBlock (sync) is deprecated, use analyzeBlockAsync for LLM extraction"),{entities:[],newEntities:[],existingEntities:[],hasClarifications:!1,gapCount:0}}static async analyzeBlockAsync(t,i,n,r){let s=r&&r.length>0?zi(t,r):[],a=[...new Set(s.map(g=>g.entityName))],o=new Set(s.map(g=>g.entityId)),l=r&&r.length>0?r.filter(g=>{if(o.has(g.id))return!0;for(let m=0;m<=g.name.length-2;m++)if(t.includes(g.name.slice(m,m+2)))return!0;for(let m of g.aliases||[])for(let v=0;v<=m.length-2;v++)if(t.includes(m.slice(v,v+2)))return!0;return!1}).slice(0,10):[],c=l.length>0?l.map(g=>{let m=g.aliases&&g.aliases.length>0?"\uFF08\u522B\u540D\uFF1A"+g.aliases.join("\u3001")+"\uFF09":"";return g.name+m+" ["+g.cardType+"]"}).join("\u3001"):"";console.log("[TraceMind] AC scan found",s.length,"matches,",l.length,"candidates for LLM:",c);let u=[],d;if(n&&n.apiKey&&n.baseUrl&&n.model){console.log("[TraceMind] LLM config:",{baseUrl:n.baseUrl,model:n.model,hasApiKey:!!n.apiKey});try{let g={...n,profileContext:n.profileContext?n.profileContext+(c?`

\u5DF2\u77E5\u5B9E\u4F53\uFF08\u5DF2\u5EFA\u6863\uFF0C\u4E0D\u8981\u91CD\u590D\u63D0\u53D6\uFF0C\u6CE8\u610F\u76F8\u4F3C\u540D\u79F0\uFF09\uFF1A`+c:""):c?`

\u5DF2\u77E5\u5B9E\u4F53\uFF08\u5DF2\u5EFA\u6863\uFF0C\u4E0D\u8981\u91CD\u590D\u63D0\u53D6\uFF0C\u6CE8\u610F\u76F8\u4F3C\u540D\u79F0\uFF09\uFF1A`+c:""},m=await Ui(t,g);console.log("[TraceMind] LLM extracted:",m.entities.length,m.entities,"domain:",m.domain),u=m.entities.map(v=>({...v})),d=m.domain}catch(g){console.warn("[TraceMind] LLM extraction failed:",g.message)}}else console.log("[TraceMind] No LLM config provided, skipping extraction");let h=new Set(u.map(g=>g.name)),p=new Set;for(let g of s)if(!p.has(g.entityName)&&(p.add(g.entityName),!h.has(g.entityName))){let m=r?.find(v=>v.name===g.entityName);m&&u.push({name:g.entityName,type:m.cardType,confidence:.9})}let f=ys(u,i);return f.domainCategory=d,f}static summarizeResult(t){if(t.entities.length===0)return"\u672A\u68C0\u6D4B\u5230\u9700\u8981\u5173\u6CE8\u7684\u5B9E\u4F53\u3002";let i=[];if(t.newEntities.length>0){let n=t.newEntities.map(r=>r.name).join("\u3001");i.push(`\u53D1\u73B0 ${t.newEntities.length} \u4E2A\u65B0\u5B9E\u4F53\uFF1A${n}`)}if(t.existingEntities.length>0){let n=t.existingEntities.map(r=>r.name).join("\u3001");i.push(`\u63D0\u53CA ${t.existingEntities.length} \u4E2A\u5DF2\u6709\u5B9E\u4F53\uFF1A${n}`)}return t.hasClarifications&&i.push("\u9700\u8981\u8FDB\u4E00\u6B65\u6F84\u6E05\u4FE1\u606F\u3002"),i.join(`
`)}};function ys(e,t){let i=[];for(let a of e){let o=ms(a,t),l=a.subtype?{subtype:a.subtype}:{},c=o?.maturity??at(a.type,l),u=Hi(a.type,l,0),d=[];if(o){let f=ot(a.type,c,l,[]);d.push(...f)}else{d.push({type:"new_entity",entityName:a.name,entityType:a.type,maturityLevel:"L0",attributePriority:"P0",score:40,description:`New entity: ${a.name}`});let f=ot(a.type,"L0",l,[]);d.push(...f)}let h=d.slice(0,2).map(f=>Ki(f,a.subtype)),p={...a,isNew:!o,existingCardId:o?.cardId,maturity:c,priorityScore:u,clarificationQuestions:h,knowledgeGaps:d};i.push(p)}i.sort((a,o)=>a.isNew!==o.isNew?a.isNew?-1:1:o.priorityScore-a.priorityScore);let n=i.slice(0,gs),r=n.flatMap(a=>a.knowledgeGaps??[]),s=r.sort((a,o)=>o.score-a.score)[0];return{entities:n,newEntities:n.filter(a=>a.isNew),existingEntities:n.filter(a=>!a.isNew),hasClarifications:n.some(a=>a.isNew),gapCount:r.length,firstQuestion:s?Ki(s):void 0}}var xs=H.load;function z(e,t){let i=vs(e),n=i?.name;n||(n=t.split("/").pop()?.replace(".md","")||"");let r=i?.type||"person",s=i?.maturity||"L0",a=i?.confidence??.5,o=Array.isArray(i?.aliases)?i.aliases:[];return{id:i?.id||ce(n),name:n,cardType:r,type:Es(r),subtype:i?.subtype,maturity:s,confidence:a,filePath:t,aliases:o,relationCount:0,lastUpdated:i?.lastUpdated||new Date().toISOString()}}function Wi(e){let t=[];for(let i of e)if(i.content.trim())try{let n=z(i.content,i.path);t.push(n)}catch{}return{entries:t,lastRebuild:new Date().toISOString()}}function vs(e){let t=e.trim();if(!t.startsWith("---"))return null;let i=t.indexOf("---",3);if(i===-1)return null;let n=t.slice(3,i).trim();return xs(n)||null}function Es(e){switch(e){case"person":return"person";case"object":return"thing";case"theme":return"idea";default:return"thing"}}function qi(e,t){let i=t.toLowerCase();return e.entries.filter(n=>n.name.toLowerCase().includes(i)||n.aliases.some(r=>r.toLowerCase().includes(i)))}function Q(e,t){let i=e.entries.findIndex(r=>r.id===t.id),n=[...e.entries];return i>=0?n[i]=t:n.push(t),{entries:n,lastRebuild:e.lastRebuild}}function Gi(e){let t=JSON.parse(e);return{blockId:t.blockId,content:t.content,messages:t.messages||[],analysisResult:t.analysisResult,createdAt:t.createdAt,updatedAt:t.updatedAt,currentPhase:t.currentPhase||"analysis"}}var bs="TraceMind/sessions";function lt(e){return`${bs}/${e}.json`}function Qi(e){return Gi(e)}var _=require("obsidian");var ct=["Daily","Person","Object","Theme","TraceMind"],Ji="TraceMind/PROFILE.md";async function ut(e){try{return await e.stat(Ji)===null}catch{return!0}}function Xi(e,t){new dt(e,t).open()}var dt=class extends _.Modal{onComplete;constructor(t,i){super(t),this.onComplete=i}onOpen(){let{contentEl:t}=this;t.createEl("h2",{text:"\u6B22\u8FCE\u4F7F\u7528 TraceMind"}),t.createEl("p",{text:"TraceMind \u5C06\u5E2E\u52A9\u4F60\u4ECE\u65E5\u8BB0\u4E2D\u81EA\u52A8\u8BC6\u522B\u548C\u6574\u7406\u77E5\u8BC6\u5B9E\u4F53\u3002\u8BF7\u5148\u5B8C\u6210\u521D\u59CB\u8BBE\u7F6E\u3002"});let i=t.createEl("div",{cls:"tracemind-steps"});t.createEl("h3",{text:"\u6B65\u9AA4 1\uFF1A\u521B\u5EFA\u76EE\u5F55\u7ED3\u6784"}),new _.Setting(t).setName("\u521B\u5EFA\u77E5\u8BC6\u76EE\u5F55").setDesc("\u521B\u5EFA Daily\u3001Person\u3001Object\u3001Theme \u76EE\u5F55").addButton(n=>{n.setButtonText("\u521B\u5EFA\u76EE\u5F55"),n.onClick(async()=>{for(let r of ct)await ke(this.app,r);n.setButtonText("\u5DF2\u5B8C\u6210"),n.setDisabled(!0),new _.Notice("\u76EE\u5F55\u521B\u5EFA\u5B8C\u6210")})}),t.createEl("h3",{text:"\u6B65\u9AA4 2\uFF1A\u521B\u5EFA\u7528\u6237\u6863\u6848"}),new _.Setting(t).setName("\u521D\u59CB\u5316 PROFILE.md").setDesc("\u5728 TraceMind \u76EE\u5F55\u4E0B\u521B\u5EFA\u7528\u6237\u6863\u6848\u6587\u4EF6").addButton(n=>{n.setButtonText("\u521B\u5EFA\u6863\u6848"),n.onClick(async()=>{await this.app.vault.create("TraceMind/PROFILE.md",`---
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
`),n.setButtonText("\u5DF2\u5B8C\u6210"),n.setDisabled(!0),new _.Notice("\u6863\u6848\u521B\u5EFA\u5B8C\u6210")})}),t.createEl("h3",{text:"\u6B65\u9AA4 3\uFF1A\u5F00\u59CB\u4F7F\u7528"}),new _.Setting(t).setName("\u5B8C\u6210\u8BBE\u7F6E").setDesc("\u8BBE\u7F6E\u5B8C\u6210\u540E\uFF0C\u4F60\u53EF\u4EE5\u5F00\u59CB\u4F7F\u7528 TraceMind \u4E86").addButton(n=>{n.setButtonText("\u5B8C\u6210"),n.setCta(),n.onClick(async()=>{this.close(),await this.onComplete()})})}onClose(){let{contentEl:t}=this;t.empty()}};var ws=/^---\n([\s\S]*?)\n---\n?/;function Zi(e){let t=e.match(ws);if(!t)return null;let i=t[1],n=e.slice(t[0].length),r={};for(let c of i.split(`
`)){let u=c.indexOf(":");if(u===-1)continue;let d=c.slice(0,u).trim(),h=c.slice(u+1).trim();d&&h&&(r[d]=h)}let s=r.date,a=r.contentHash,o=r.generatedAt,l=parseInt(r.blockCount||"0",10);return!s||!a||!o||!n.trim()?null:{date:s,content:n.trim(),contentHash:a,generatedAt:o,blockCount:l}}function en(e){return`${["---",`date: ${e.date}`,`generatedAt: ${e.generatedAt}`,`contentHash: ${e.contentHash}`,`blockCount: ${e.blockCount}`,"---"].join(`
`)}

${e.content}
`}function pt(e){return`TraceMind/insights/${e}.md`}V();var tn=/^###\s+(\d{2}:\d{2})\s+(.+)$/m,ks=/<!--\s*TM:([a-z0-9]+)\s*-->/;function Cs(){return Math.random().toString(16).slice(2,10).padStart(8,"0")}function ht(e){let t=[],i=e.split(`
`),n=0;for(;n<i.length;){let s=i[n].match(tn);if(s){let a=s[1],l=s[2].trim().split(/\s+/).filter(d=>d.startsWith("#")).map(d=>d.slice(1));n++;let c=[],u=[];for(;n<i.length;){let d=i[n];if(d.match(tn))break;if(!d.trim()){n++;continue}let h=d.match(ks);if(h){let p=h[1];t.push({timestamp:a,content:c.join(`
`).trim(),tags:l,blockId:p,children:u}),n++;break}d.startsWith("- ")||d.startsWith("* ")?u.push(d.replace(/^[-*]\s+/,"")):c.push(d),n++}if(c.length>0||u.length>0){let d=t[t.length-1];(!d||d.timestamp!==a)&&t.push({timestamp:a,content:c.join(`
`).trim(),tags:l,blockId:Cs(),children:u})}}else n++}return t}var As=["Daily","Person","Object","Theme","TraceMind/sessions","TraceMind/index","TraceMind/insights"],De=class extends B.Plugin{settings;userProfile={...U};analysisService=de;entityIndex={entries:[],lastRebuild:""};entityManager;sessionManager;aiProvider;aiAnalysisView;blockEditorView;calendarView;async onload(){console.log("TraceMind: loading...");try{await this.loadSettings(),await this.ensureVaultStructure(),await this.rebuildEntityIndex(),this.userProfile=await ji(this.app),Ct(),this.entityManager=new ft(this.app,this),this.sessionManager=new gt(this.app),this.aiProvider=new mt(this),await this.sessionManager.initialize(),this.registerView(D,t=>(this.blockEditorView=new xe(t,this),this.blockEditorView)),this.registerView(ie,t=>(this.aiAnalysisView=new be(t,this),this.aiAnalysisView)),this.registerView(ne,t=>(this.calendarView=new we(t,this),this.calendarView.setOnDateClick(i=>this.navigateToDate(i)),this.calendarView)),this.addSettingTab(new ge(this.app,this)),this.addRibbonIcon("brain","\u6253\u5F00 TraceMind",()=>{this.openTracemindView()}),this.addRibbonIcon("calendar","\u6253\u5F00\u65E5\u5386",()=>{this.openCalendarView()}),this.addCommand({id:"open-tracemind",name:"\u6253\u5F00 TraceMind \u89C6\u56FE",callback:()=>this.openTracemindView()}),this.addCommand({id:"open-calendar",name:"\u6253\u5F00\u65E5\u5386",callback:()=>this.openCalendarView()}),this.addCommand({id:"analyze-block",name:"\u5206\u6790\u5F53\u524D\u65E5\u8BB0\u5757",callback:()=>this.analyzeCurrentBlock()}),this.addCommand({id:"rebuild-index",name:"\u91CD\u5EFA\u5B9E\u4F53\u7D22\u5F15",callback:()=>this.rebuildEntityIndexCommand()}),this.registerEvent(this.app.workspace.on("editor-change",()=>{this.onEditorChange()})),new B.Notice("TraceMind \u5DF2\u52A0\u8F7D"),console.log("TraceMind: loaded successfully"),await ut(this.app.vault.adapter)&&Xi(this.app,async()=>{await this.ensureVaultStructure()})}catch(t){console.error("TraceMind: Failed to load",t),new B.Notice("TraceMind \u52A0\u8F7D\u5931\u8D25: "+t.message)}}onunload(){console.log("TraceMind: unloading...")}async loadSettings(){let t=await this.loadData();this.settings={...Et,...t}}async saveSettings(){await this.saveData(this.settings)}async ensureVaultStructure(){for(let t of As)await ke(this.app,t);console.log("TraceMind: vault structure ensured")}autoAnalysisTimer=null;onEditorChange(){this.autoAnalysisTimer&&clearTimeout(this.autoAnalysisTimer),this.autoAnalysisTimer=setTimeout(()=>{this.autoAnalysisTimer=null},2e3)}async rebuildEntityIndexCommand(){await this.rebuildEntityIndex(),new B.Notice(`\u5B9E\u4F53\u7D22\u5F15\u5DF2\u91CD\u5EFA: ${this.entityIndex.entries.length} \u4E2A\u5B9E\u4F53`)}async rebuildEntityIndex(){let t=["Person","Object","Theme"],i=[];for(let n of t)try{let r=await this.app.vault.adapter.list(n+"/");for(let s of r.files)if(s.endsWith(".md")){let a=await this.app.vault.adapter.read(s);i.push({path:s,content:a})}}catch{}this.entityIndex=Wi(i),console.log(`TraceMind: entity index rebuilt with ${this.entityIndex.entries.length} entries`)}async navigateToDate(t){this.app.workspace.getLeavesOfType(D).length===0&&await this.openTracemindView();let n=this.app.workspace.getLeavesOfType(D);for(let r of n){let s=r.view;typeof s.setCurrentDate=="function"&&await s.setCurrentDate(t)}}async openCalendarView(){let{workspace:t}=this.app,i=t.getLeavesOfType(ne);if(i.length>0)t.revealLeaf(i[0]);else{let n=t.getRightLeaf(!1);n&&(await n.setViewState({type:ne,active:!0}),t.revealLeaf(n))}}async openTracemindView(){let{workspace:t}=this.app,i=t.getLeavesOfType(D);if(i.length>0)t.revealLeaf(i[0]);else{let r=t.getLeaf(!1);r&&(await r.setViewState({type:D,active:!0}),t.revealLeaf(r))}if(t.getLeavesOfType(ie).length===0){let r=t.getRightLeaf(!1);r&&(await r.setViewState({type:ie,active:!0}),t.revealLeaf(r))}}async openBlockEditor(){return this.openTracemindView()}async analyzeCurrentBlock(){let t=this.app.workspace.getActiveFile();if(!t){new B.Notice("\u8BF7\u5148\u6253\u5F00\u4E00\u4E2A\u65E5\u8BB0\u6587\u4EF6");return}let i=await this.app.vault.read(t),n=t.basename;console.log("[TraceMind] analyzeCurrentBlock file:",t.path,"content length:",i.length),console.log("[TraceMind] analyzeCurrentBlock content preview:",i.substring(0,300));try{let r=await this.aiProvider.analyzeBlock(i,n);new B.Notice(`\u5206\u6790\u5B8C\u6210: \u68C0\u6D4B\u5230 ${r.entities.length} \u4E2A\u5B9E\u4F53`),console.log("[TraceMind] analyzeCurrentBlock: tmResult:",r),this.updateAIAnalysis(r)}catch(r){new B.Notice("\u5206\u6790\u5931\u8D25: "+r.message),console.error("TraceMind: analysis error",r)}}getAIAnalysisView(){return this.aiAnalysisView}getBlockEditorView(){return this.blockEditorView}getCalendarView(){return this.calendarView}getEntityManager(){return this.entityManager}getSessionManager(){return this.sessionManager}getAIProvider(){return this.aiProvider}getUserProfile(){return this.userProfile}getUserProfileContext(){let t=this.userProfile,i=[];return t.name&&i.push("\u59D3\u540D\uFF1A"+t.name),t.occupation&&i.push("\u804C\u4E1A\uFF1A"+t.occupation),t.company&&i.push("\u516C\u53F8/\u7EC4\u7EC7\uFF1A"+t.company),t.city&&i.push("\u57CE\u5E02\uFF1A"+t.city),t.skills.length>0&&i.push("\u6280\u80FD\uFF1A"+t.skills.join("\u3001")),t.relationships.length>0&&i.push("\u5173\u7CFB\uFF1A"+t.relationships.join("\u3001")),t.goals.length>0&&i.push("\u76EE\u6807\uFF1A"+t.goals.join("\u3001")),t.focusAreas.length>0&&i.push("\u5173\u6CE8\u9886\u57DF\uFF1A"+t.focusAreas.join("\u3001")),i.length===0?"":`\u7528\u6237\u6863\u6848\uFF1A
`+i.map(function(n){return"- "+n}).join(`
`)}buildAnalysisResult(t,i,n){return nn(t,i,n)}updateAIAnalysis(t){this.aiAnalysisView&&this.aiAnalysisView.updateAnalysis(t)}getBlockEditorDate(){if(this.blockEditorView&&this.blockEditorView.currentDate){let t=this.blockEditorView.currentDate;if(t instanceof Date&&!isNaN(t.getTime())){let i=t.getFullYear(),n=String(t.getMonth()+1).padStart(2,"0"),r=String(t.getDate()).padStart(2,"0");return`${i}-${n}-${r}`}if(typeof t=="string"&&t.match(/^\d{4}-\d{2}-\d{2}$/))return t}return null}async getCachedInsight(t){try{let i=pt(t),n=this.app.vault.getFileByPath(i);if(!n)return null;let r=await this.app.vault.read(n);return Zi(r)}catch{return null}}async readDailyDiary(t){try{let i=`Daily/${t}.md`,n=this.app.vault.getFileByPath(i);if(!n){let r=this.app.vault.getFileByPath(`${t}.md`);return r?await this.app.vault.read(r):null}return await this.app.vault.read(n)}catch{return null}}async readYesterdayDiary(t){let i=new Date(t);for(let n=1;n<=7;n++){let r=new Date(i);r.setDate(r.getDate()-n);let s=r.getFullYear(),a=String(r.getMonth()+1).padStart(2,"0"),o=String(r.getDate()).padStart(2,"0"),l=`${s}-${a}-${o}`,c=await this.readDailyDiary(l);if(c)return c}return""}async hasMinimumBlocks(t){let i=await this.readDailyDiary(t);return i?ht(i).length>=5:!1}async generateDailyInsight(t,i){let n=await this.readDailyDiary(t);if(!n)throw new Error("\u627E\u4E0D\u5230\u4ECA\u5929\u7684\u65E5\u8BB0\u6587\u4EF6");let r=await this.readYesterdayDiary(t),s=this.getUserProfileContext(),a=St(this.entityIndex.entries),o=Ft({todayBlocks:n,yesterdayBlocks:r,profileContext:s,entityIndexSummary:a}),l=this.getAIProvider().getProviderForContext("analysis");if(!l||!l.apiKey)throw new Error("\u8BF7\u5148\u5728\u8BBE\u7F6E\u4E2D\u914D\u7F6E AI Provider");let c={provider:"openai",apiKey:l.apiKey,model:l.model,baseUrl:l.baseUrl},u="",d=null;if(await Re(o,c,{onDelta:x=>{u+=x,i.onDelta(x)},onDone:x=>{},onError:x=>{d=x,i.onError(x)}}),d)throw d;if(!u)throw new Error("LLM \u8FD4\u56DE\u4E86\u7A7A\u5185\u5BB9");let h=await Ee(n,r),p=ht(n),f={date:t,content:u,contentHash:h,generatedAt:new Date().toISOString(),blockCount:p.length},g=pt(t),m=en(f),v=this.app.vault.getFileByPath(g);return v?await this.app.vault.modify(v,m):await this.app.vault.create(g,m),i.onDone(u),f}};function nn(e,t,i,n){let r=[],s=[],a=[],o={people:r,objects:s,dimensions:a},l={person:"people",object:"objects",theme:"dimensions"},c=[];for(let u of e){let d=l[u.type],h=i.indexOf(u.name),p=u.name;if(h>=0){let f=Math.max(0,h-20),g=Math.min(i.length,h+u.name.length+30),m=i.slice(f,g);f>0&&(m="..."+m),g<i.length&&(m+="..."),p=m}o[d].push({type:u.type,name:u.name,confidence:u.confidence??.5,context:p,isArchived:!!u.existingCardId,newEntity:u.isNew,maturity:u.maturity,priorityScore:u.priorityScore,clarificationQuestions:u.clarificationQuestions}),u.isNew&&c.push(u.name)}return{blockId:t,timestamp:new Date().toISOString(),category:c.length>0?"\u5F85\u786E\u8BA4":n||"\u5DE5\u4F5C",areas:n?[n]:[],entities:{people:r,objects:s,dimensions:a},needsConfirmation:c,aiResponse:Ts(e)}}function Ts(e){let t=[];for(let i of e)i.clarificationQuestions.length>0&&t.push(`\u5173\u4E8E ${i.name}\uFF1A${i.clarificationQuestions[0]}`);return t.length===0?`\u68C0\u6D4B\u5230\u4EE5\u4E0B\u5B9E\u4F53\uFF1A${e.map(n=>n.name).join("\u3001")}\u3002`:t.join(`
`)}var ft=class{constructor(t,i){this.app=t;this.plugin=i}app;plugin;findEntity(t){let i=qi(this.plugin.entityIndex,t);return i.find(r=>r.name.toLowerCase()===t.toLowerCase())||i[0]||null}getEntity(t){return this.plugin.entityIndex.entries.find(i=>i.id===t)||null}async createEntity(t){let i=Fs(t.type),n=t.aliases||[],r=st.create({name:t.title,cardType:i,attributes:t.metadata||{},aliases:n});t.interactions&&Array.isArray(t.interactions)&&(r.attributes.interactions=t.interactions);let s=G(r),o=`${Ss(i)}${t.title}.md`;this.app.vault.getFileByPath(o)||await this.app.vault.create(o,s);let c=z(s,o);return this.plugin.entityIndex=Q(this.plugin.entityIndex,c),{...t,id:c.id}}async updateEntity(t,i){let n=this.getEntity(t);if(!n)return;let r=this.app.vault.getFileByPath(n.filePath);if(!r)return;let s=await this.app.vault.read(r),a=ue(s);for(let[c,u]of Object.entries(i))c==="lastUpdated"?a.lastUpdated=u:c==="interactions"?a.attributes.interactions=u:c==="aliases"&&Array.isArray(u)?a.aliases=u:a.attributes[c]=u;a.lastUpdated=i.lastUpdated||new Date().toISOString();let o=G(a);await this.app.vault.modify(r,o);let l=z(o,n.filePath);this.plugin.entityIndex=Q(this.plugin.entityIndex,l)}wikifyContent(t){let i=t;i=i.replace(/\[\[(Person|Object|Theme)\/(?:\[\[(?:Person|Object|Theme)\/[^\]]+\]\])\|([^\]]+)\]\]/g,"[[$1/$2|$2]]");let r=[...this.plugin.entityIndex.entries].sort((a,o)=>o.name.length-a.name.length),s=[];for(let a of r){let o=a.cardType==="person"?"Person":a.cardType==="object"?"Object":"Theme";a.name.length>=2&&s.push({term:a.name,name:a.name,folder:o});for(let l of a.aliases||[])l.length>=2&&s.push({term:l,name:a.name,folder:o})}s.sort((a,o)=>o.term.length-a.term.length);for(let a of s){let o=a.term.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");if(!new RegExp("(?<!\\[\\[)"+o+"(?!\\]\\|)").test(i))continue;let l="[["+a.folder+"/"+a.name+"|"+a.term+"]]",c=new RegExp("(?<!\\[\\[)"+o+"(?!\\]\\|)","g");i=i.replace(c,l)}return i}async refreshWikilinks(t){let i=this.getEntity(t);if(!i)return;let n=this.app.vault.getFileByPath(i.filePath);if(!n)return;let r=await this.app.vault.read(n),s=ue(r),a=s.attributes.interactions||[],o=!1;for(let l of a)if(l.content&&typeof l.content=="string"){let c=this.wikifyContent(l.content);c!==l.content&&(l.content=c,o=!0)}if(o){s.attributes.interactions=a;let l=G(s);await this.app.vault.modify(n,l);let c=z(l,i.filePath);this.plugin.entityIndex=Q(this.plugin.entityIndex,c)}}async addInteraction(t,i){let n=this.getEntity(t);if(!n)return;let r=this.app.vault.getFileByPath(n.filePath);if(!r)return;let s=await this.app.vault.read(r),a=ue(s),o=a.attributes.interactions||[];o.push(i),a.attributes.interactions=o,a.lastUpdated=new Date().toISOString();let l=G(a);await this.app.vault.modify(r,l);let c=z(l,n.filePath);this.plugin.entityIndex=Q(this.plugin.entityIndex,c)}async linkRelatedEntities(t){if(!(t.length<2))for(let i of t){let n=this.findEntity(i.name);if(!n)continue;let r=this.app.vault.getFileByPath(n.filePath);if(!r)continue;let s=await this.app.vault.read(r),a=ue(s);for(let c of t)c.name!==i.name&&(c.type==="person"?a.relatedPeople.includes(c.name)||a.relatedPeople.push(c.name):c.type==="object"?a.relatedObjects.includes(c.name)||a.relatedObjects.push(c.name):c.type==="theme"&&(a.relatedThemes.includes(c.name)||a.relatedThemes.push(c.name)));let o=G(a);await this.app.vault.modify(r,o);let l=z(o,n.filePath);this.plugin.entityIndex=Q(this.plugin.entityIndex,l)}}async enrichEntity(t,i){return i}buildEntityIndex(){let t=new Map;for(let i of this.plugin.entityIndex.entries)t.set(i.id,new Set([i.name,...i.aliases]));return t}},gt=class{constructor(t){this.app=t}app;cache=new Map;chatSession={blockId:"chat:global",messages:[],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};async initialize(){try{let t=await this.app.vault.adapter.list("TraceMind/sessions/");for(let i of t.files)if(i.endsWith(".json")){let n=await this.app.vault.adapter.read(i),r=Qi(n);this.cache.set(r.blockId,this.toViewSession(r))}}catch{}}getSession(t,i){return this.cache.get(t)||null}getOrCreateSession(t,i){let n=this.cache.get(t);if(n)return n;let r={blockId:t,content:"",messages:[],analysisResult:null,reviewCards:{},createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),currentPhase:"detection"};return this.cache.set(t,r),r}setContent(t,i,n){let r=this.getOrCreateSession(t,n);r.content=i,r.updatedAt=new Date().toISOString(),this.writeSession(t,r)}setSession(t,i,n){let r=this.getOrCreateSession(t,n),s={...r,...i,blockId:t,updatedAt:new Date().toISOString(),analysisResult:i.analysisResult??r.analysisResult};return this.cache.set(t,s),this.writeSession(t,s),s}setAnalysisResult(t,i,n){let r=this.getOrCreateSession(t,n);r.analysisResult=i,r.updatedAt=new Date().toISOString(),r.currentPhase="complete",this.cache.set(t,r),this.writeSession(t,r)}addMessage(t,i,n){let r=this.getOrCreateSession(t,n);r.messages.push(i),r.updatedAt=new Date().toISOString(),this.cache.set(t,r),this.writeSession(t,r)}addChatMessage(t){this.chatSession.messages.push(t),this.chatSession.updatedAt=new Date().toISOString()}getChatSession(){return this.chatSession}clearChatSession(){this.chatSession={blockId:"chat:global",messages:[],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}}async clearSession(t){this.cache.delete(t);try{let i=this.app.vault.getFileByPath(lt(t));i&&await this.app.vault.delete(i)}catch{}}updateReviewCard(t,i,n,r){let s=this.getOrCreateSession(t,r);s.reviewCards||(s.reviewCards={}),s.reviewCards[i]={status:n.status||"pending",supplement:n.supplement,updatedAt:new Date().toISOString()},s.updatedAt=new Date().toISOString(),this.cache.set(t,s),this.writeSession(t,s)}writeSession(t,i){try{let n=lt(t),r={blockId:i.blockId,content:i.content,messages:i.messages,createdAt:i.createdAt,updatedAt:i.updatedAt,currentPhase:i.currentPhase};i.analysisResult&&(r.analysisResult=i.analysisResult);let s=JSON.stringify(r,null,2),a=this.app.vault.getFileByPath(n);a?this.app.vault.modify(a,s):this.app.vault.create(n,s)}catch(n){console.error("TraceMind: failed to write session",n)}}toViewSession(t){return{blockId:t.blockId,content:t.content,messages:t.messages,analysisResult:t.analysisResult??null,reviewCards:t.reviewCards??{},createdAt:t.createdAt,updatedAt:t.updatedAt,currentPhase:t.currentPhase||"detection"}}},mt=class{constructor(t){this.plugin=t}plugin;isReady(){let{settings:t}=this.plugin;if(!t.defaultProviderId)return!1;let i=t.providers.find(n=>n.id===t.defaultProviderId);return!!i&&!!i.apiKey&&!!i.baseUrl}async chat(t,i){let n=this.getProviderForContext(i??"chat");if(!n)throw new Error("No AI provider configured");let{chat:r}=await Promise.resolve().then(()=>(V(),Oe));return{content:(await r(t.map(a=>({role:a.role,content:a.content})),{provider:"openai",apiKey:n.apiKey,model:n.model,baseUrl:n.baseUrl})).content,usage:{promptTokens:0,completionTokens:0,totalTokens:0}}}async streamChat(t,i,n){let r=this.getProviderForContext(n??"chat");if(!r){i.onError(new Error("No AI provider configured"));return}let{streamChat:s}=await Promise.resolve().then(()=>(V(),Oe));await s(t.map(a=>({role:a.role,content:a.content})),{provider:"openai",apiKey:r.apiKey,model:r.model,baseUrl:r.baseUrl},i)}async analyzeBlock(t,i=""){let n=new Map;for(let l of this.plugin.entityIndex.entries)n.set(l.id,{name:l.name,cardType:l.type,maturity:l.maturity||"L0"});console.log("[TraceMind] analyzeBlock: loaded",n.size,"existing cards from index");let r=this.getProviderForContext("analysis");if(!r)return console.warn("[TraceMind] analyzeBlock: no AI provider configured, cannot extract entities"),new B.Notice("\u8BF7\u5148\u5728\u8BBE\u7F6E\u4E2D\u914D\u7F6E AI Provider"),{entities:[],newEntities:[],existingEntities:[],hasClarifications:!1,gapCount:0};console.log("[TraceMind] analyzeBlock: using LLM extraction, provider:",r.name);let s=this.plugin.getUserProfileContext(),a=await de.analyzeBlockAsync(t,n,{apiKey:r.apiKey||"",model:r.model||"gpt-4",baseUrl:r.baseUrl||"",profileContext:s||void 0},this.plugin.entityIndex.entries);console.log("[TraceMind] analyzeBlock result entities:",a.entities.length,a);let o=nn(a.entities,i,t,a.domainCategory);return{...o,analysisResult:o}}getProviderForContext(t){let{settings:i}=this.plugin,n=i.agentProviderMapping,r=t==="analysis"?n.analysis:n.chat;if(r){let s=i.providers.find(a=>a.id===r);if(s)return s}return this.getDefaultProvider()}getDefaultProvider(){let{settings:t}=this.plugin;return t.defaultProviderId&&t.providers.find(i=>i.id===t.defaultProviderId)||null}};function Fs(e){return e==="person"?"person":e==="object"?"object":e==="theme"?"theme":e==="project"||e==="thing"?"object":e==="idea"||e==="knowledge"?"theme":"object"}function Ss(e){return{person:"Person/",object:"Object/",theme:"Theme/"}[e]||""}var Ms=De;0&&(module.exports={TraceMindPlugin});
/*! Bundled license information:

js-yaml/dist/js-yaml.mjs:
  (*! js-yaml 4.1.1 https://github.com/nodeca/js-yaml @license MIT *)
*/
