export function createWS(path: string = '/ws'): WebSocket {
  const wsProtocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${wsProtocol}//${location.host}${path}`;
  return new WebSocket(wsUrl);
}