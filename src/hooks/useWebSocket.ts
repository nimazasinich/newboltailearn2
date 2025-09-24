import { useEffect, useState, useRef, useCallback } from 'react'
import { wsClient } from '../lib/websocket'
import { WSEventType, WSEventHandler, WSConnectionStatus } from '../lib/ws-events'

export function useWebSocket() {
  const [connected, setConnected] = useState(false)
  const [status, setStatus] = useState<WSConnectionStatus>('disconnected')
  const subs = useRef<(() => void)[]>([])

  useEffect(() => {
    wsClient.connect()
      .then(() => {
        setConnected(true)
        setStatus('connected')
      })
      .catch(() => {
        setConnected(false)
        setStatus('error')
      })
    
    const iv = setInterval(() => {
      setConnected(wsClient.connected)
      setStatus(wsClient.connectionStatus)
    }, 1000)
    
    return () => { 
      clearInterval(iv)
      subs.current.forEach(u => u())
      subs.current = []
    }
  }, [])

  const subscribe = useCallback((type: WSEventType, cb: WSEventHandler) => {
    const unsubscribe = wsClient.on(type, cb)
    subs.current.push(unsubscribe)
    return unsubscribe
  }, [])

  const send = useCallback((type: WSEventType, data: any) => {
    wsClient.send(type, data)
  }, [])

  return { 
    connected, 
    status,
    subscribe, 
    send 
  }
}