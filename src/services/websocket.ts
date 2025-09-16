// Re-export from the new wsClient for compatibility
export { wsClient as default } from './wsClient'
export type { WSEventType as WebSocketEventType } from './wsClient'
export type { WSEvent as WebSocketMessage, WSEventListener as EventHandler } from './wsClient'

// Legacy compatibility wrapper
import { wsClient, WSEventType, WSEventListener } from './wsClient'

export class WebSocketService {
  connect() {
    return wsClient.connect()
  }

  disconnect() {
    wsClient.disconnect()
  }

  on(eventType: WSEventType, handler: WSEventListener) {
    wsClient.on(eventType, handler)
  }

  off(eventType: WSEventType, handler: WSEventListener) {
    wsClient.off(eventType, handler)
  }

  get isConnected() {
    return wsClient.isConnected
  }
}

export const websocketService = new WebSocketService()