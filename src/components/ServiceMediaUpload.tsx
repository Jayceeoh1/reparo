// @ts-nocheck
// Componentă de upload poze pentru dashboard service
// Se adaugă în tab-ul "Profil public" din dashboard_service_page.tsx

'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const S = {
  navy:'#0a1f44',blue:'#1a56db',bg:'#f0f6ff',white:'#fff',
  muted:'#6b7280',border:'#e5e7eb',red:'#dc2626',
}

export default function ServiceMediaUpload({ serviceId, onUpdate }) {
  const [uploading, setUploading] = useState(false)
  const [uploadType, setUploadType] = useState('cover') // cover | logo | gallery
  const [galleryUrls, setGalleryUrls] = useState([])
  const supabase = createClient()

  async function uploadFile(file, type) {
    const ext = file.name.split('.').pop()
    const path = `${serviceId}/${type}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('service-media').upload(path, file, { upsert: true })
    if (error) throw error
    const { data: { publicUrl } } = supabase.storage.from('service-media').getPublicUrl(path)
    return publicUrl
  }

  async function handleCoverUpload(e) {
    const file = e.target.files?.[0]
    if (!file || !serviceId) return
    setUploading(true)
    try {
      const url = await uploadFile(file, 'cover')
      await supabase.from('services').update({ cover_image_url: url }).eq('id', serviceId)
      onUpdate?.({ cover_image_url: url })
    } catch (err) { console.error(err) }
    setUploading(false)
  }

  async function handleLogoUpload(e) {
    const file = e.target.files?.[0]
    if (!file || !serviceId) return
    setUploading(true)
    try {
      const url = await uploadFile(file, 'logo')
      await supabase.from('services').update({ logo_url: url }).eq('id', serviceId)
      onUpdate?.({ logo_url: url })
    } catch (err) { console.error(err) }
    setUploading(false)
  }

  async function handleGalleryUpload(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length || !serviceId) return
    setUploading(true)
    const urls = []
    for (const file of files) {
      try {
        const url = await uploadFile(file, `gallery-${Date.now()}`)
        urls.push(url)
        await supabase.from('service_gallery').insert({ service_id: serviceId, url, sort_order: galleryUrls.length + urls.length })
      } catch (err) { console.error(err) }
    }
    setGalleryUrls(prev => [...prev, ...urls])
    setUploading(false)
  }

  const uploadZone = (label, inputId, onChange, accept='image/*', multiple=false) => (
    <div>
      <label htmlFor={inputId}
        style={{display:'block',border:`2px dashed ${S.border}`,borderRadius:12,padding:'20px',textAlign:'center',cursor:'pointer',transition:'border-color .15s'}}
        onMouseEnter={e=>e.currentTarget.style.borderColor=S.blue}
        onMouseLeave={e=>e.currentTarget.style.borderColor=S.border}>
        <div style={{fontSize:28,marginBottom:6}}>📷</div>
        <div style={{fontSize:13,color:S.muted}}>{uploading ? 'Se încarcă...' : label}</div>
        <div style={{fontSize:11,color:S.muted,marginTop:2}}>JPG, PNG, WebP · max 10MB</div>
        <input id={inputId} type="file" accept={accept} multiple={multiple} style={{display:'none'}} onChange={onChange}/>
      </label>
    </div>
  )

  return (
    <div style={{background:S.white,borderRadius:16,border:`1px solid ${S.border}`,padding:20,marginBottom:16}}>
      <h3 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy,marginBottom:16}}>📸 Poze service</h3>
      
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
        <div>
          <div style={{fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:6,fontFamily:"'Sora',sans-serif"}}>Poză cover (banner)</div>
          {uploadZone('Click pentru cover principal', 'cover-upload', handleCoverUpload)}
        </div>
        <div>
          <div style={{fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:6,fontFamily:"'Sora',sans-serif"}}>Logo service</div>
          {uploadZone('Click pentru logo', 'logo-upload', handleLogoUpload)}
        </div>
      </div>

      <div>
        <div style={{fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:6,fontFamily:"'Sora',sans-serif"}}>Galerie lucrări (multiple poze)</div>
        {uploadZone('Click pentru a adăuga poze din galerie', 'gallery-upload', handleGalleryUpload, 'image/*', true)}
        {galleryUrls.length > 0 && (
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:10}}>
            {galleryUrls.map((url, i) => (
              <img key={i} src={url} alt="" style={{width:64,height:64,objectFit:'cover',borderRadius:8,border:`1px solid ${S.border}`}}/>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
