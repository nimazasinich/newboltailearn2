import{j as e}from"./index-CWY8UKKK.js";function c({value:r,max:t=100,variant:o="default",size:a="md",showValue:n=!1,animated:s=!0,organic:l=!1,className:i=""}){const d=Math.min(100,Math.max(0,r/t*100)),m={default:"from-slate-400 to-slate-600",success:"from-emerald-400 via-emerald-500 to-emerald-600",warning:"from-amber-400 via-amber-500 to-orange-500",error:"from-rose-400 via-rose-500 to-red-600",info:"from-sky-400 via-blue-500 to-indigo-600",gradient:"from-violet-400 via-purple-500 to-indigo-600"},u={sm:"h-1.5",md:"h-3",lg:"h-4"},f={sm:"h-1.5",md:"h-3",lg:"h-4"};return e.jsxs("div",{className:`relative ${i}`,children:[e.jsx("div",{className:`
        w-full bg-slate-100 dark:bg-slate-800 
        ${f[a]} 
        ${l?"rounded-full":"rounded-lg"}
        overflow-hidden
        ${s?"transition-all duration-300":""}
      `,children:e.jsx("div",{className:`
            ${u[a]} 
            bg-gradient-to-r ${m[o]}
            ${l?"rounded-full":"rounded-lg"}
            ${s?"transition-all duration-700 ease-out":""}
            relative overflow-hidden
          `,style:{width:`${d}%`},children:s&&e.jsx("div",{className:"absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"})})}),n&&e.jsxs("div",{className:"absolute right-0 top-0 transform translate-y-full mt-1 text-xs font-medium text-slate-600 dark:text-slate-400",children:[r,t===100?"%":` / ${t}`]})]})}export{c as Z};
//# sourceMappingURL=ZenProgress-BwPUPUuV.js.map
