// @ts-nocheck
'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const S = {
  navy:'#0a1f44',blue:'#1a56db',bg:'#f0f6ff',white:'#fff',
  text:'#111827',muted:'#6b7280',border:'#e5e7eb',green:'#16a34a',
  yellow:'#f59e0b',red:'#dc2626',
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
        setActiveConv(convs[0])
        await loadMessages(convs[0].id, user.id)
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
    setActiveConv(conv); setTypingUsers({})
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

  const otherName = (conv) => profile?.role === 'service' ? conv.client?.full_name || 'Client' : conv.services?.name || 'Service'
  const isOtherTyping = Object.keys(typingUsers).length > 0

  function renderMessage(msg) {
    const isMine = msg.sender_id === user?.id
    const bubble = {
      maxWidth:'75%', padding:'10px 14px',
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
        <div style={{maxWidth:'65%'}}><img src={msg.attachment_url} alt="" style={{width:'100%',borderRadius:14,cursor:'pointer'}} onClick={()=>window.open(msg.attachment_url,'_blank')}/>{timeRow}</div>
      </div>
    )
    if (msg.attachment_type === 'pdf') return (
      <div style={{display:'flex',justifyContent:isMine?'flex-end':'flex-start'}}>
        <a href={msg.attachment_url} target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center',gap:10,padding:'12px 16px',background:isMine?S.blue:'#fff',border:`1px solid ${S.border}`,borderRadius:14,textDecoration:'none',maxWidth:'70%'}}>
          <span style={{fontSize:28}}>📄</span>
          <div><div style={{fontWeight:600,fontSize:13,color:isMine?'#fff':S.navy}}>{msg.content}</div><div style={{fontSize:11,color:isMine?'rgba(255,255,255,0.65)':S.muted}}>PDF · Deschide</div></div>
        </a>
      </div>
    )
    if (msg.attachment_type === 'video') return (
      <div style={{display:'flex',justifyContent:isMine?'flex-end':'flex-start'}}>
        <div style={{maxWidth:'65%'}}><video src={msg.attachment_url} controls style={{width:'100%',borderRadius:14}}/>{timeRow}</div>
      </div>
    )
    return (
      <div style={{display:'flex',justifyContent:isMine?'flex-end':'flex-start'}}>
        <div style={bubble}>{msg.content}{timeRow}</div>
      </div>
    )
  }

  if (loading) return (
    <div style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:36,height:36,border:`3px solid ${S.blue}`,borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{height:'calc(100vh - 120px)',display:'flex',fontFamily:"'DM Sans',sans-serif",background:S.bg}}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
        .msg-hover:hover{background:#f0f6ff!important}
        @media(max-width:768px){
          .messages-sidebar{width:100%!important;height:160px!important;border-right:none!important;border-bottom:1px solid #e5e7eb!important}
          .messages-chat{min-height:60vh!important}
        }
      `}</style>
      <input ref={fileRef} type="file" accept="image/*,application/pdf,video/*" style={{display:'none'}} onChange={e=>{if(e.target.files?.[0])uploadFile(e.target.files[0]);e.target.value=''}}/>

      {/* Sidebar */}
      <div className="messages-sidebar" style={{width:300,flexShrink:0,background:S.white,borderRight:`1px solid ${S.border}`,display:'flex',flexDirection:'column',borderRadius:'16px 0 0 16px',overflow:'hidden'}}>
        <div style={{padding:16,borderBottom:`1px solid ${S.border}`}}>
          <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:16,color:S.navy,margin:0}}>Mesaje</h2>
        </div>
        <div style={{flex:1,overflowY:'auto'}}>
          {conversations.length===0 ? (
            <div style={{padding:32,textAlign:'center',color:S.muted}}><div style={{fontSize:40,marginBottom:10}}>💬</div><div style={{fontSize:13}}>Nicio conversație</div></div>
          ) : conversations.map(conv=>{
            const isActive=activeConv?.id===conv.id, unread=unreadCounts[conv.id]||0
            return (
              <div key={conv.id} onClick={()=>selectConv(conv)} className="msg-hover"
                style={{padding:'14px 16px',cursor:'pointer',background:isActive?'#eaf3ff':'transparent',borderBottom:`1px solid ${S.border}`,transition:'background .15s'}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:42,height:42,background:'#eaf3ff',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0,overflow:'hidden'}}>
                    {profile?.role!=='service'&&conv.services?.logo_url?<img src={conv.services.logo_url} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>:profile?.role==='service'?'👤':'🔧'}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:2}}>
                      <div style={{fontWeight:unread>0?800:700,fontSize:13,color:S.navy,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{otherName(conv)}</div>
                      <div style={{fontSize:11,color:S.muted,flexShrink:0,marginLeft:4}}>{formatTime(conv.last_message_at||conv.created_at)}</div>
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div style={{fontSize:12,color:unread>0?S.navy:S.muted,fontWeight:unread>0?600:400,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1}}>{conv.last_message||'Niciun mesaj'}</div>
                      {unread>0&&<div style={{background:S.blue,color:'#fff',borderRadius:'50%',width:18,height:18,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:800,flexShrink:0,marginLeft:6}}>{unread>9?'9+':unread}</div>}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Chat */}
      {activeConv ? (
        <div className="messages-chat" style={{flex:1,display:'flex',flexDirection:'column',background:S.white,borderRadius:'0 16px 16px 0',overflow:'hidden'}}>
          <div style={{padding:'12px 20px',borderBottom:`1px solid ${S.border}`,display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:40,height:40,background:'#eaf3ff',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,overflow:'hidden'}}>
              {profile?.role!=='service'&&activeConv.services?.logo_url?<img src={activeConv.services.logo_url} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>:profile?.role==='service'?'👤':'🔧'}
            </div>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy}}>{otherName(activeConv)}</div>
              <div style={{fontSize:12,display:'flex',alignItems:'center',gap:4,color:isOtherTyping?S.blue:S.green}}>
                {isOtherTyping?(
                  <><span style={{display:'flex',gap:3}}>{[0,1,2].map(i=><span key={i} style={{width:5,height:5,borderRadius:'50%',background:S.blue,display:'inline-block',animation:`bounce 1.2s ${i*0.2}s infinite`}}/>)}</span>scrie...</>
                ):(
                  <><span style={{width:6,height:6,borderRadius:'50%',background:S.green,display:'inline-block'}}/>Online</>
                )}
              </div>
            </div>
          </div>

          <div style={{flex:1,overflowY:'auto',padding:'16px 20px',display:'flex',flexDirection:'column',gap:10}}>
            {messages.length===0?(
              <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:S.muted,padding:'40px 0'}}>
                <div style={{fontSize:48,marginBottom:10}}>👋</div>
                <div style={{fontWeight:600,marginBottom:4}}>Începe conversația</div>
                <div style={{fontSize:13}}>Trimite primul mesaj!</div>
              </div>
            ):messages.map(msg=><div key={msg.id}>{renderMessage(msg)}</div>)}
            {uploading&&<div style={{display:'flex',justifyContent:'flex-end'}}><div style={{padding:'10px 16px',background:'#eaf3ff',borderRadius:14,fontSize:13,color:S.muted,display:'flex',alignItems:'center',gap:8}}><div style={{width:16,height:16,border:`2px solid ${S.blue}`,borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>Se încarcă...</div></div>}
            {isOtherTyping&&(
              <div style={{display:'flex',justifyContent:'flex-start'}}>
                <div style={{padding:'12px 16px',background:'#f0f6ff',borderRadius:'18px 18px 18px 4px',display:'flex',gap:4,alignItems:'center'}}>
                  {[0,1,2].map(i=><span key={i} style={{width:7,height:7,borderRadius:'50%',background:S.muted,display:'inline-block',animation:`bounce 1.2s ${i*0.2}s infinite`}}/>)}
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          <div style={{padding:'12px 16px',borderTop:`1px solid ${S.border}`,background:'#fff'}}>
            {showAttachMenu&&(
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
              <button type="button" onClick={()=>setShowAttachMenu(o=>!o)} style={{width:40,height:40,borderRadius:'50%',background:showAttachMenu?'#eaf3ff':'#f8faff',border:`1.5px solid ${showAttachMenu?S.blue:S.border}`,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>📎</button>
              <input value={newMsg} onChange={handleTyping} placeholder="Scrie un mesaj..." style={{flex:1,padding:'11px 16px',border:`1.5px solid ${S.border}`,borderRadius:50,fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:'none',background:'#f8faff'}}/>
              <button type="submit" disabled={!newMsg.trim()||sending} style={{width:44,height:44,borderRadius:'50%',background:newMsg.trim()?S.blue:'#e5e7eb',border:'none',cursor:newMsg.trim()?'pointer':'not-allowed',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 9L16 2L10 16L8 10L2 9Z" fill="#fff"/></svg>
              </button>
            </form>
          </div>
        </div>
      ):(
        <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',color:S.muted,background:S.white,borderRadius:'0 16px 16px 0'}}>
          <div style={{fontSize:56,marginBottom:14}}>💬</div>
          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:18,color:S.navy,marginBottom:6}}>Mesajele tale</div>
          <div style={{fontSize:14}}>Selectează o conversație</div>
        </div>
      )}
    </div>
  )
}
