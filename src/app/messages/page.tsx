// @ts-nocheck
'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isServiceRole } from '@/lib/roles'

const S = {
  navy:'#0a1f44',blue:'#1a56db',bg:'#f0f6ff',white:'#fff',
  text:'#111827',muted:'#6b7280',border:'#e5e7eb',green:'#16a34a',
}
const ALLOWED_TYPES = ['image/jpeg','image/png','image/gif','image/webp','application/pdf','video/mp4','video/quicktime']

export default function MessagesPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMsg, setNewMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [typingUsers, setTypingUsers] = useState({})
  const [unreadCounts, setUnreadCounts] = useState({})
  const [isTyping, setIsTyping] = useState(false)
  const [mobileView, setMobileView] = useState('list') // 'list' | 'chat'
  const bottomRef = useRef(null)
  const fileRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const msgChannelRef = useRef(null)
  const typingChannelRef = useRef(null)
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
        .select('*, services(id,name,city,logo_url), client:profiles!conversations_client_id_fkey(id,full_name)')
        .or(`client_id.eq.${user.id},service_owner_id.eq.${user.id}`)
        .order('updated_at', { ascending: false })
      setConversations(convs || [])
      if (convs?.length > 0) {
        const counts = {}
        for (const conv of convs) {
          const { count } = await supabase.from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id).eq('is_read', false).neq('sender_id', user.id)
          counts[conv.id] = count || 0
        }
        setUnreadCounts(counts)
        // Pe desktop selectează prima conversație automat
        if (window.innerWidth > 768) {
          setActiveConv(convs[0])
          await loadMessages(convs[0].id, user.id)
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (!activeConv?.id || !user?.id) return
    if (msgChannelRef.current) supabase.removeChannel(msgChannelRef.current)
    if (typingChannelRef.current) supabase.removeChannel(typingChannelRef.current)
    const msgCh = supabase.channel(`msg:${activeConv.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeConv.id}` },
        async (p) => {
          if (p.new.sender_id !== user.id) {
            setMessages(prev => prev.find(m => m.id === p.new.id) ? prev : [...prev, p.new])
            await supabase.from('messages').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', p.new.id)
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
          }
        })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeConv.id}` },
        (p) => setMessages(prev => prev.map(m => m.id === p.new.id ? { ...m, ...p.new } : m)))
      .subscribe()
    msgChannelRef.current = msgCh
    const typCh = supabase.channel(`typing:${activeConv.id}`)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.user_id === user.id) return
        setTypingUsers(prev => ({ ...prev, [payload.user_id]: Date.now() }))
        setTimeout(() => setTypingUsers(prev => {
          const u = { ...prev }
          if (u[payload.user_id] && Date.now() - u[payload.user_id] > 2500) delete u[payload.user_id]
          return u
        }), 3000)
      })
      .on('broadcast', { event: 'stop_typing' }, ({ payload }) => {
        if (payload.user_id === user.id) return
        setTypingUsers(prev => { const u = { ...prev }; delete u[payload.user_id]; return u })
      })
      .subscribe()
    typingChannelRef.current = typCh
    return () => { supabase.removeChannel(msgCh); supabase.removeChannel(typCh) }
  }, [activeConv?.id, user?.id])

  useEffect(() => {
    if (!user?.id) return
    const ch = supabase.channel(`convlist:${user.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'conversations' }, (p) => {
        setConversations(prev => prev.map(c => c.id === p.new.id ? { ...c, ...p.new } : c)
          .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)))
      }).subscribe()
    return () => supabase.removeChannel(ch)
  }, [user?.id])

  async function loadMessages(convId, userId) {
    const { data } = await supabase.from('messages').select('*').eq('conversation_id', convId).order('created_at', { ascending: true })
    setMessages(data || [])
    await supabase.from('messages').update({ is_read: true, read_at: new Date().toISOString() })
      .eq('conversation_id', convId).neq('sender_id', userId).eq('is_read', false)
    setUnreadCounts(prev => ({ ...prev, [convId]: 0 }))
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  async function selectConv(conv) {
    setActiveConv(conv)
    setTypingUsers({})
    setMobileView('chat')
    await loadMessages(conv.id, user.id)
  }

  function handleTyping(e) {
    setNewMsg(e.target.value)
    if (!typingChannelRef.current || !user?.id) return
    if (!isTyping) {
      setIsTyping(true)
      typingChannelRef.current.send({ type: 'broadcast', event: 'typing', payload: { user_id: user.id } })
    }
    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      typingChannelRef.current?.send({ type: 'broadcast', event: 'stop_typing', payload: { user_id: user.id } })
    }, 2000)
  }

  async function sendMessage(e) {
    e.preventDefault()
    if (!newMsg.trim() || !activeConv || sending) return
    setSending(true)
    setIsTyping(false)
    clearTimeout(typingTimeoutRef.current)
    typingChannelRef.current?.send({ type: 'broadcast', event: 'stop_typing', payload: { user_id: user.id } })
    const { data } = await supabase.from('messages').insert({
      conversation_id: activeConv.id, sender_id: user.id, content: newMsg.trim(), is_read: false,
    }).select().single()
    if (data) {
      setMessages(prev => [...prev, data]); setNewMsg('')
      await supabase.from('conversations').update({ last_message: newMsg.trim(), last_message_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', activeConv.id)
    }
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    setSending(false)
  }

  async function uploadFile(file) {
    if (!file || !activeConv) return
    if (!ALLOWED_TYPES.includes(file.type)) { alert('Tip de fișier nepermis.'); return }
    if (file.size > 50 * 1024 * 1024) { alert('Max 50MB.'); return }
    setUploading(true); setShowAttachMenu(false)
    const ext = file.name.split('.').pop()
    const path = `messages/${activeConv.id}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('message-attachments').upload(path, file)
    if (error) { alert('Eroare: ' + error.message); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('message-attachments').getPublicUrl(path)
    const msgType = file.type.startsWith('image/') ? 'image' : file.type === 'application/pdf' ? 'pdf' : 'video'
    const { data } = await supabase.from('messages').insert({
      conversation_id: activeConv.id, sender_id: user.id, content: file.name,
      attachment_url: publicUrl, attachment_type: msgType, is_read: false,
    }).select().single()
    if (data) {
      setMessages(prev => [...prev, data])
      await supabase.from('conversations').update({ last_message: `📎 ${file.name}`, last_message_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', activeConv.id)
    }
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    setUploading(false)
  }

  function formatTime(ts) {
    if (!ts) return ''
    const d = new Date(ts), now = new Date()
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })
  }

  const otherName = (conv) => isServiceRole(profile?.role) ? conv.client?.full_name || 'Client' : conv.services?.name || 'Service'
  const isOtherTyping = Object.keys(typingUsers).length > 0

  function renderMessage(msg) {
    const isMine = msg.sender_id === user?.id
    const bubble = {
      maxWidth:'78%', padding:'10px 14px',
      borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
      background: isMine ? S.blue : '#f0f6ff', color: isMine ? '#fff' : S.text,
      fontSize:14, lineHeight:1.5, boxShadow:'0 1px 4px rgba(10,31,68,0.08)'
    }
    const timeRow = (
      <div style={{fontSize:10,color:isMine?'rgba(255,255,255,0.6)':S.muted,marginTop:4,textAlign:'right',display:'flex',alignItems:'center',justifyContent:'flex-end',gap:3}}>
        {formatTime(msg.created_at)}
        {isMine && <span style={{fontSize:11,color:msg.is_read?'#93c5fd':'rgba(255,255,255,0.5)'}}>{msg.is_read?'✓✓':'✓'}</span>}
      </div>
    )
    if (msg.attachment_type === 'image') return (
      <div style={{display:'flex',justifyContent:isMine?'flex-end':'flex-start'}}>
        <div style={{maxWidth:'70%'}}><img src={msg.attachment_url} alt="" style={{width:'100%',borderRadius:14,cursor:'pointer'}} onClick={()=>window.open(msg.attachment_url,'_blank')}/>{timeRow}</div>
      </div>
    )
    if (msg.attachment_type === 'pdf') return (
      <div style={{display:'flex',justifyContent:isMine?'flex-end':'flex-start'}}>
        <a href={msg.attachment_url} target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center',gap:10,padding:'12px 16px',background:isMine?S.blue:'#fff',border:`1px solid ${S.border}`,borderRadius:14,textDecoration:'none',maxWidth:'75%'}}>
          <span style={{fontSize:28}}>📄</span>
          <div><div style={{fontWeight:600,fontSize:13,color:isMine?'#fff':S.navy}}>{msg.content}</div><div style={{fontSize:11,color:isMine?'rgba(255,255,255,0.65)':S.muted}}>PDF · Deschide</div></div>
        </a>
      </div>
    )
    if (msg.attachment_type === 'video') return (
      <div style={{display:'flex',justifyContent:isMine?'flex-end':'flex-start'}}>
        <div style={{maxWidth:'70%'}}><video src={msg.attachment_url} controls style={{width:'100%',borderRadius:14}}/>{timeRow}</div>
      </div>
    )
    return (
      <div style={{display:'flex',justifyContent:isMine?'flex-end':'flex-start'}}>
        <div style={bubble}>{msg.content}{timeRow}</div>
      </div>
    )
  }

  // ── Conversation List ────────────────────────────────────────────────────
  const ConvList = () => (
    <div style={{display:'flex',flexDirection:'column',height:'100%',background:S.white}}>
      <div style={{padding:'16px',borderBottom:`1px solid ${S.border}`,flexShrink:0}}>
        <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:18,color:S.navy,margin:0}}>💬 Mesaje</h2>
      </div>
      <div style={{flex:1,overflowY:'auto'}}>
        {conversations.length === 0 ? (
          <div style={{padding:'60px 20px',textAlign:'center',color:S.muted}}>
            <div style={{fontSize:48,marginBottom:12}}>💬</div>
            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:S.navy,marginBottom:6}}>Nicio conversație</div>
            <div style={{fontSize:13}}>Conversațiile cu service-urile apar aici</div>
          </div>
        ) : conversations.map(conv => {
          const isActive = activeConv?.id === conv.id
          const unread = unreadCounts[conv.id] || 0
          return (
            <div key={conv.id} onClick={() => selectConv(conv)}
              style={{padding:'14px 16px',cursor:'pointer',background:isActive?'#eaf3ff':'transparent',borderBottom:`1px solid ${S.border}`,transition:'background .15s',display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:48,height:48,background:'#eaf3ff',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0,overflow:'hidden',position:'relative'}}>
                {!isServiceRole(profile?.role)&&conv.services?.logo_url ? <img src={conv.services.logo_url} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/> : isServiceRole(profile?.role)?'👤':'🔧'}
                {unread > 0 && <div style={{position:'absolute',top:-2,right:-2,width:18,height:18,background:S.blue,color:'#fff',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:800,border:'2px solid #fff'}}>{unread > 9 ? '9+' : unread}</div>}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:3}}>
                  <div style={{fontFamily:"'Sora',sans-serif",fontWeight:unread>0?800:700,fontSize:14,color:S.navy,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{otherName(conv)}</div>
                  <div style={{fontSize:11,color:S.muted,flexShrink:0,marginLeft:8}}>{formatTime(conv.last_message_at||conv.created_at)}</div>
                </div>
                <div style={{fontSize:13,color:unread>0?S.navy:S.muted,fontWeight:unread>0?600:400,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{conv.last_message||'Niciun mesaj'}</div>
              </div>
              <div style={{color:S.muted,fontSize:18,flexShrink:0}}>›</div>
            </div>
          )
        })}
      </div>
    </div>
  )

  // ── Chat View ────────────────────────────────────────────────────────────
  const ChatView = () => (
    <div style={{display:'flex',flexDirection:'column',height:'100%',background:S.white}}>
      {/* Header */}
      <div style={{padding:'12px 16px',borderBottom:`1px solid ${S.border}`,display:'flex',alignItems:'center',gap:12,flexShrink:0}}>
        <button onClick={()=>setMobileView('list')} className="back-btn"
          style={{width:36,height:36,borderRadius:'50%',background:S.bg,border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>
          ‹
        </button>
        <div style={{width:40,height:40,background:'#eaf3ff',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,overflow:'hidden',flexShrink:0}}>
          {!isServiceRole(profile?.role)&&activeConv?.services?.logo_url ? <img src={activeConv.services.logo_url} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/> : isServiceRole(profile?.role)?'👤':'🔧'}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{activeConv ? otherName(activeConv) : ''}</div>
          <div style={{fontSize:11,display:'flex',alignItems:'center',gap:4,color:isOtherTyping?S.blue:S.green}}>
            {isOtherTyping ? (
              <><span style={{display:'flex',gap:2}}>{[0,1,2].map(i=><span key={i} style={{width:4,height:4,borderRadius:'50%',background:S.blue,display:'inline-block',animation:`bounce 1.2s ${i*0.2}s infinite`}}/>)}</span>scrie...</>
            ) : (
              <><span style={{width:6,height:6,borderRadius:'50%',background:S.green,display:'inline-block'}}/>Online</>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{flex:1,overflowY:'auto',padding:'14px 14px',display:'flex',flexDirection:'column',gap:10}}>
        {messages.length === 0 ? (
          <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:S.muted,padding:'40px 0'}}>
            <div style={{fontSize:48,marginBottom:10}}>👋</div>
            <div style={{fontWeight:600,marginBottom:4,color:S.navy}}>Începe conversația</div>
            <div style={{fontSize:13}}>Trimite primul mesaj!</div>
          </div>
        ) : messages.map(msg => <div key={msg.id}>{renderMessage(msg)}</div>)}
        {uploading && <div style={{display:'flex',justifyContent:'flex-end'}}><div style={{padding:'10px 16px',background:'#eaf3ff',borderRadius:14,fontSize:13,color:S.muted,display:'flex',alignItems:'center',gap:8}}><div style={{width:14,height:14,border:`2px solid ${S.blue}`,borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>Se încarcă...</div></div>}
        {isOtherTyping && (
          <div style={{display:'flex',justifyContent:'flex-start'}}>
            <div style={{padding:'12px 16px',background:'#f0f6ff',borderRadius:'18px 18px 18px 4px',display:'flex',gap:4,alignItems:'center'}}>
              {[0,1,2].map(i=><span key={i} style={{width:7,height:7,borderRadius:'50%',background:S.muted,display:'inline-block',animation:`bounce 1.2s ${i*0.2}s infinite`}}/>)}
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{padding:'10px 12px',borderTop:`1px solid ${S.border}`,background:'#fff',flexShrink:0}}>
        {showAttachMenu && (
          <div style={{background:'#fff',border:`1px solid ${S.border}`,borderRadius:14,padding:8,marginBottom:8,display:'flex',gap:6,boxShadow:'0 4px 16px rgba(10,31,68,0.1)'}}>
            {[{icon:'🖼️',label:'Imagine',accept:'image/*'},{icon:'📄',label:'PDF',accept:'application/pdf'},{icon:'🎥',label:'Video',accept:'video/*'}].map(t=>(
              <button key={t.label} onClick={()=>{fileRef.current.accept=t.accept;fileRef.current.click();setShowAttachMenu(false)}}
                style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4,padding:'10px 6px',background:'#f8faff',border:`1px solid ${S.border}`,borderRadius:10,cursor:'pointer',fontSize:11,color:S.navy,fontWeight:600}}>
                <span style={{fontSize:22}}>{t.icon}</span>{t.label}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={sendMessage} style={{display:'flex',gap:8,alignItems:'center'}}>
          <button type="button" onClick={()=>setShowAttachMenu(o=>!o)}
            style={{width:40,height:40,borderRadius:'50%',background:showAttachMenu?'#eaf3ff':'#f8faff',border:`1.5px solid ${showAttachMenu?S.blue:S.border}`,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>
            📎
          </button>
          <input value={newMsg} onChange={handleTyping} placeholder="Scrie un mesaj..."
            style={{flex:1,padding:'11px 16px',border:`1.5px solid ${S.border}`,borderRadius:50,fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:'none',background:'#f8faff'}}/>
          <button type="submit" disabled={!newMsg.trim()||sending}
            style={{width:44,height:44,borderRadius:'50%',background:newMsg.trim()?S.blue:'#e5e7eb',border:'none',cursor:newMsg.trim()?'pointer':'not-allowed',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 9L16 2L10 16L8 10L2 9Z" fill="#fff"/></svg>
          </button>
        </form>
      </div>
    </div>
  )

  if (loading) return (
    <div style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:36,height:36,border:`3px solid ${S.blue}`,borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:S.bg}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}

        /* DESKTOP */
        .msg-desktop{display:flex;height:calc(100vh - 130px);border-radius:16px;overflow:hidden;box-shadow:0 2px 20px rgba(10,31,68,0.08);border:1px solid #e5e7eb}
        .msg-desktop-sidebar{width:300px;flex-shrink:0;border-right:1px solid #e5e7eb}
        .msg-desktop-chat{flex:1;min-width:0}
        .msg-mobile{display:none}
        .back-btn{display:none}

        /* MOBILE */
        @media(max-width:768px){
          .msg-desktop{display:none!important}
          .msg-mobile{display:block!important;height:calc(100vh - 140px)}
          .back-btn{display:flex!important}
        }
      `}</style>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'16px'}}>

        {/* ── DESKTOP layout ── */}
        <div className="msg-desktop">
          <div className="msg-desktop-sidebar" style={{background:S.white}}>
            <ConvList/>
          </div>
          <div className="msg-desktop-chat" style={{background:S.white}}>
            {activeConv ? <ChatView/> : (
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',color:S.muted}}>
                <div style={{fontSize:56,marginBottom:14}}>💬</div>
                <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:18,color:S.navy,marginBottom:6}}>Mesajele tale</div>
                <div style={{fontSize:14}}>Selectează o conversație din stânga</div>
              </div>
            )}
          </div>
        </div>

        {/* ── MOBILE layout ── */}
        <div className="msg-mobile">
          {mobileView === 'list' ? <ConvList/> : <ChatView/>}
        </div>
      </div>
    </div>
  )
}
