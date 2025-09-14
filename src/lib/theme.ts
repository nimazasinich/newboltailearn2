export function initTheme(): void {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;
  
  document.documentElement.classList.toggle('dark', isDark);
}

export function toggleTheme(): void {
  const currentlyDark = document.documentElement.classList.contains('dark');
  const newTheme = !currentlyDark;
  
  document.documentElement.classList.toggle('dark', newTheme);
  localStorage.setItem('theme', newTheme ? 'dark' : 'light');
}

export function getCurrentTheme(): 'dark' | 'light' {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}