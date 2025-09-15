export const validateApiConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE || '/api'}/health`);
    return response.ok;
  } catch {
    return false;
  }
};

export const validateWebSocketConnection = (): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      const wsUrl = import.meta.env.VITE_WS_BASE || location.origin.replace(/^http/, 'ws');
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        ws.close();
        resolve(true);
      };
      ws.onerror = () => resolve(false);
      ws.onclose = () => resolve(false);
      
      setTimeout(() => {
        ws.close();
        resolve(false);
      }, 5000);
    } catch {
      resolve(false);
    }
  });
};

export const testRTLLayout = (): boolean => {
  return document.documentElement.dir === 'rtl';
};

export const testPersianFonts = (): boolean => {
  const testElement = document.createElement('span');
  testElement.style.fontFamily = 'Vazirmatn';
  testElement.textContent = 'تست';
  document.body.appendChild(testElement);
  
  const computedFont = window.getComputedStyle(testElement).fontFamily;
  document.body.removeChild(testElement);
  
  return computedFont.includes('Vazirmatn');
};