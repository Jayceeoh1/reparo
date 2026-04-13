// @ts-nocheck
'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const S = {
  navy:'#0a1f44',blue:'#1a56db',bg:'#f0f6ff',white:'#fff',
  text:'#111827',muted:'#6b7280',border:'#e5e7eb',green:'#16a34a',
}

export default function MessagesPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMsg, setNewMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth/login'; return }
      setUser(user)
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(prof)

      const { data: convs } = await supabase
        .from('conversations')
        .select('*, services(id,name,city), client:profiles!conversations_client_id_fkey(id,full_name)')
        .or(`client_id.eq.${user.id},service_owner_id.eq.${user.id}`)
        .order('updated_at', { ascending: false })
      setConversations(convs || [])
      if (convs?.length > 0) { setActiveConv(convs[0]); loadMessages(convs[0].id, user.id) }
      setLoading(false)
    }
    load()
  }, [])

  async function loadMessages(convId, userId) {
    const { data } = await supabase.from('messages').select('*').eq('conversation_id', convId).order('created_at', { ascending: true })
    setMessages(data || [])
    await supabase.from('messages').update({ is_read: true }).eq('conversation_id', convId).neq('sender_id', userId)
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  async function selectConv(conv) {
    setActiveConv(conv)
    await loadMessages(conv.id, user.id)
  }

  async function sendMessage(e) {
    e.preventDefault()
    if (!newMsg.trim() || !activeConv || sending) return
    setSending(true)
    const { data } = await supabase.from('messages').insert({
      conversation_id: activeConv.id, sender_id: user.id,
      content: newMsg.trim(), is_read: false,
    }).select().single()
    if (data) { setMessages(prev => [...prev, data]); setNewMsg('') }
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    setSending(false)
  }

  useEffect(() => {
    if (!activeConv?.id || !user?.id) return
    const channel = supabase.channel(`conv-${activeConv.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeConv.id}` },
        payload => {
          if (payload.new.sender_id !== user.id) {
            setMessages(prev => [...prev, payload.new])
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
          }
        }).subscribe()
    return () => supabase.removeChannel(channel)
  }, [activeConv?.id, user?.id])

  function formatTime(ts) {
    const d = new Date(ts)
    const now = new Date()
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })
  }

  const otherName = (conv) => profile?.role === 'service' ? conv.client?.full_name || 'Client' : conv.services?.name || 'Service'

  if (loading) return (
    <div style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center',background:S.bg}}>
      <div style={{width:36,height:36,border:`3px solid ${S.blue}`,borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{height:'calc(100vh - 120px)',display:'flex',fontFamily:"'DM Sans',sans-serif",background:S.bg}}>
      <style>{`
        .msg-hover:hover{background:#f0f6ff!important}
        @media(max-width:768px){
          .messages-layout{flex-direction:column!important;height:auto!important}
          .messages-sidebar{width:100%!important;height:180px!important;flex-shrink:0!important;border-right:none!important;border-bottom:1px solid #e5e7eb!important;overflow-y:auto!important}
          .messages-chat{min-height:60vh!important;display:flex!important;flex-direction:column!important}
        }
      `}</style>

      {/* Sidebar */}
      <div style={{width:300,flexShrink:0,background:S.white,borderRight:`1px solid ${S.border}`,display:'flex',flexDirection:'column',borderRadius:'16px 0 0 16px',overflow:'hidden'}}>
        <div style={{padding:'20px 16px',borderBottom:`1px solid ${S.border}`}}>
          <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:16,color:S.navy,margin:0}}>Mesaje</h2>
        </div>
        <div style={{flex:1,overflowY:'auto'}}>
          {conversations.length === 0 ? (
            <div style={{padding:32,textAlign:'center',color:S.muted}}>
              <div style={{fontSize:40,marginBottom:10}}>💬</div>
              <div style={{fontSize:13}}>Nicio conversație</div>
            </div>
          ) : conversations.map(conv => {
            const unread = 0
            const isActive = activeConv?.id === conv.id
            return (
              <div key={conv.id} onClick={() => selectConv(conv)} className="msg-hover"
                style={{padding:'14px 16px',cursor:'pointer',background:isActive?'#eaf3ff':'transparent',borderBottom:`1px solid ${S.border}`,transition:'background .15s'}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:42,height:42,background:'#eaf3ff',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>
                    {profile?.role === 'service' ? '👤' : '🔧'}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:2}}>
                      <div style={{fontWeight:700,fontSize:13,color:S.navy,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{otherName(conv)}</div>
                      <div style={{fontSize:11,color:S.muted,flexShrink:0,marginLeft:4}}>{formatTime(conv.last_message_at||conv.created_at)}</div>
                    </div>
                    <div style={{fontSize:12,color:S.muted,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{conv.last_message||'Niciun mesaj'}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Chat */}
      {activeConv ? (
        <div style={{flex:1,display:'flex',flexDirection:'column',background:S.white,borderRadius:'0 16px 16px 0',overflow:'hidden'}}>
          <div style={{padding:'14px 20px',borderBottom:`1px solid ${S.border}`,display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:40,height:40,background:'#eaf3ff',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>
              {profile?.role === 'service' ? '👤' : '🔧'}
            </div>
            <div>
              <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy}}>{otherName(activeConv)}</div>
              <div style={{fontSize:12,color:S.green,display:'flex',alignItems:'center',gap:4}}>
                <span style={{width:6,height:6,borderRadius:'50%',background:S.green,display:'inline-block'}}/>Online
              </div>
            </div>
          </div>
          <div style={{flex:1,overflowY:'auto',padding:'16px 20px',display:'flex',flexDirection:'column',gap:8}}>
            {messages.length === 0 ? (
              <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:S.muted}}>
                <div style={{fontSize:48,marginBottom:10}}>👋</div>
                <div style={{fontWeight:600,marginBottom:4}}>Începe conversația</div>
                <div style={{fontSize:13}}>Trimite primul mesaj!</div>
              </div>
            ) : messages.map(msg => {
              const isMine = msg.sender_id === user?.id
              return (
                <div key={msg.id} style={{display:'flex',justifyContent:isMine?'flex-end':'flex-start'}}>
                  <div style={{maxWidth:'70%',padding:'10px 14px',borderRadius:isMine?'18px 18px 4px 18px':'18px 18px 18px 4px',background:isMine?S.blue:'#f0f6ff',color:isMine?'#fff':S.text,fontSize:14,lineHeight:1.5,boxShadow:'0 1px 4px rgba(10,31,68,0.08)'}}>
                    <div>{msg.content}</div>
                    <div style={{fontSize:10,color:isMine?'rgba(255,255,255,0.6)':S.muted,marginTop:4,textAlign:'right'}}>{formatTime(msg.created_at)}</div>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef}/>
          </div>
          <div style={{padding:'12px 16px',borderTop:`1px solid ${S.border}`}}>
            <form onSubmit={sendMessage} style={{display:'flex',gap:10,alignItems:'center'}}>
              <input value={newMsg} onChange={e=>setNewMsg(e.target.value)}
                placeholder="Scrie un mesaj..."
                style={{flex:1,padding:'11px 16px',border:`1.5px solid ${S.border}`,borderRadius:50,fontSize:14,fontFamily:"'DM Sans',sans-serif",color:S.text,outline:'none',background:'#f8faff'}}/>
              <button type="submit" disabled={!newMsg.trim()||sending}
                style={{width:44,height:44,borderRadius:'50%',background:newMsg.trim()?S.blue:'#e5e7eb',border:'none',cursor:newMsg.trim()?'pointer':'not-allowed',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'background .2s'}}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 9L16 2L10 16L8 10L2 9Z" fill="#fff"/></svg>
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',color:S.muted,background:S.white,borderRadius:'0 16px 16px 0'}}>
          <div style={{fontSize:56,marginBottom:14}}>💬</div>
          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:18,color:S.navy,marginBottom:6}}>Mesajele tale</div>
          <div style={{fontSize:14}}>Selectează o conversație</div>
        </div>
      )}
    </div>
  )
}