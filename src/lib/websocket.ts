import { WS_PATH } from './config'
import { WSEvent, WSEventType, WSEventHandler, WSEventSubscription, WSConnectionStatus, WSConfig } from './ws-events'

// NodeJS types for setTimeout
declare global {
  namespace NodeJS {
    interface Timeout {
      ref(): NodeJS.Timeout;
      unref(): NodeJS.Timeout;
    }
  }
}

const isNode = typeof process !== 'undefined' && process.platform;

export type WSMessage = WSEvent

export class WSClient {
  ws: WebSocket | null = null
  listeners = new Map<WSEventType, Set<WSEventHandler>>()
  attempts = 0
  max = 5
  status: WSConnectionStatus = 'disconnected'
  config: WSConfig = {
    url: '',
    reconnectInterval: 1000,
    maxReconnectAttempts: 5,
    heartbeatInterval: 30000
  }
  heartbeatTimer: ReturnType<typeof setTimeout> | null = null

  url(): string {
    const base = WS_PATH.startsWith('/') ? `${location.protocol==='https:'?'wss:':'ws:'}//${location.host}${WS_PATH}` : WS_PATH
    return base
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.status = 'connecting'
        this.ws = new WebSocket(this.url())
        
        this.ws.onopen = () => { 
          this.attempts = 0
          this.status = 'connected'
          this.startHeartbeat()
          resolve() 
        }
        
        this.ws.onmessage = ev => { 
          try { 
            const m = JSON.parse(ev.data) as WSMessage
            this.emit(m) 
          } catch(e){ 
            console.warn('Failed to parse WebSocket message:', e)
          } 
        }
        
        this.ws.onclose = () => { 
          this.status = 'disconnected'
          this.stopHeartbeat()
          this.reconnect() 
        }
        
        this.ws.onerror = err => { 
          this.status = 'error'
          reject(err) 
        }
      } catch (e) { 
        this.status = 'error'
        reject(e) 
      }
    })
  }

  reconnect() {
    if (this.attempts >= this.max) {
      this.status = 'error'
      return
    }
    this.attempts++
    setTimeout(() => this.connect().catch(()=>{}), this.attempts * this.config.reconnectInterval)
  }

  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.connected) {
        this.send('health_check', { timestamp: Date.now() })
      }
    }, this.config.heartbeatInterval)
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  on(type: WSEventType, cb: WSEventHandler): WSEventSubscription {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set())
    this.listeners.get(type)!.add(cb)
    return () => this.listeners.get(type)!.delete(cb)
  }

  emit(m: WSMessage) {
    const set = this.listeners.get(m.type)
    if (set) set.forEach(cb => cb(m.data))
  }

  send(type: WSEventType, data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ 
        type, 
        data, 
        timestamp: Date.now(),
        id: Math.random().toString(36).substr(2, 9)
      }))
    }
  }

  get connected() { return this.ws?.readyState === WebSocket.OPEN }
  get connectionStatus() { return this.status }
}

export const wsClient = new WSClient()