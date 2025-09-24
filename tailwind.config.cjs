module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: { 
    extend: {
      colors: {
        primary: { 50:"#eff6ff",100:"#dbeafe",500:"#3b82f6",600:"#2563eb",700:"#1d4ed8" },
        accent:  { 50:"#fffbeb",100:"#fef3c7",500:"#f59e0b",600:"#d97706" },
        slate:   { 50:"#f8fafc",100:"#f1f5f9",200:"#e2e8f0",300:"#cbd5e1",400:"#94a3b8",500:"#64748b",600:"#475569",700:"#334155",800:"#1e293b",900:"#0f172a" },
        emerald: { 50:"#ecfdf5",500:"#10b981" },
        red:     { 50:"#fef2f2",500:"#ef4444" }
      },
      fontFamily: {
        'vazir': ['Vazirmatn', 'sans-serif'],
        display: ["IRANSans","Vazirmatn","Tahoma","sans-serif"],
        body:    ["IRANSans","Vazirmatn","Tahoma","sans-serif"]
      }
    } 
  },
  plugins: [],
};