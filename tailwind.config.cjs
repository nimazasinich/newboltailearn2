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
        'persian': ['Vazirmatn', 'IRANSans', 'Tahoma', 'sans-serif'],
        display: ["IRANSans","Vazirmatn","Tahoma","sans-serif"],
        body:    ["IRANSans","Vazirmatn","Tahoma","sans-serif"]
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'gradient-shift': 'gradientShift 15s ease infinite',
        'shimmer': 'shimmer 2s infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
        'scale-in': 'scaleIn 0.3s ease-out forwards'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' }
        },
        gradientShift: {
          '0%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
          '100%': { 'background-position': '0% 50%' }
        },
        shimmer: {
          '0%': { left: '-100%' },
          '100%': { left: '100%' }
        },
        glowPulse: {
          'from': { 'box-shadow': '0 0 20px rgba(59, 130, 246, 0.5)' },
          'to': { 'box-shadow': '0 0 30px rgba(59, 130, 246, 0.8)' }
        },
        scaleIn: {
          'from': {
            transform: 'scale(0.8)',
            opacity: '0'
          },
          'to': {
            transform: 'scale(1)',
            opacity: '1'
          }
        }
      }
    } 
  },
  plugins: [],
};