import { useEffect, useState, useRef } from 'react'
import { wsClient } from '../lib/websocket'

export function useWebSocket() {
  const [connected, setConnected] = useState(false)
  const subs = useRef<(() => void)[]>([])

  useEffect(() => {
    wsClient.connect().then(()=>setConnected(true)).catch(()=>setConnected(false))
    const iv = setInterval(()=>setConnected(wsClient.connected), 1000)
    return () => { clearInterval(iv); subs.current.forEach(u=>u()); subs.current=[] }
  }, [])

  const subscribe = (type: string, cb: (data:any)=>void) => {
    const u = wsClient.on(type, cb)
    subs.current.push(u)
    return u
  }

  return { connected, subscribe, send: wsClient.send.bind(wsClient) }
}