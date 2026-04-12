'use client'

export default function OfflinePage() {
  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#eaf3ff 0%,#f8fbff 100%)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'DM Sans',sans-serif",padding:24}}>
      <div style={{textAlign:'center',maxWidth:400}}>
        <div style={{fontSize:80,marginBottom:20}}>🔌</div>
        <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:28,color:'#0a1f44',marginBottom:10}}>Ești offline</h1>
        <p style={{fontSize:16,color:'#6b7280',lineHeight:1.7,marginBottom:28}}>Nu există conexiune la internet. Verifică conexiunea și încearcă din nou.</p>
        <button onClick={()=>window.location.reload()}
          style={{padding:'13px 32px',background:'#1a56db',color:'#fff',border:'none',borderRadius:50,fontSize:15,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 16px rgba(26,86,219,0.25)'}}>
          🔄 Încearcă din nou
        </button>
      </div>
    </div>
  )
}
