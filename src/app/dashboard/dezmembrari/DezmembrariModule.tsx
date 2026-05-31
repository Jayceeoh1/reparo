// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const S = {
  navy:'#0a1f44',blue:'#1a56db',yellow:'#f59e0b',amber:'#d97706',amberBg:'#fef3c7',
  bg:'#f0f6ff',white:'#fff',text:'#111827',muted:'#6b7280',border:'#e5e7eb',
  green:'#16a34a',greenBg:'#dcfce7',red:'#dc2626',redBg:'#fee2e2',
  purple:'#7c3aed',purpleBg:'#ede9fe',
}
const card = (e={}) => ({background:S.white,borderRadius:16,border:`1px solid ${S.border}`,boxShadow:'0 2px 12px rgba(10,31,68,0.06)',padding:20,...e})
const btn = (v='primary') => ({display:'inline-flex',alignItems:'center',justifyContent:'center',gap:6,padding:'9px 18px',borderRadius:50,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:"'Sora',sans-serif",border:'none',transition:'all .15s',
  ...(v==='primary'?{background:S.blue,color:'#fff',boxShadow:'0 2px 8px rgba(26,86,219,0.2)'}
    :v==='yellow'?{background:S.yellow,color:'#fff'}
    :v==='red'?{background:S.redBg,color:S.red}
    :{background:S.bg,color:S.navy,border:`1px solid ${S.border}`})
})
const inp = {width:'100%',padding:'10px 14px',border:`1.5px solid ${S.border}`,borderRadius:10,fontSize:14,outline:'none',fontFamily:"'DM Sans',sans-serif",background:'#fff',boxSizing:'border-box',transition:'border-color .2s'}
const lbl = {display:'block',fontSize:11,fontWeight:700,color:S.muted,textTransform:'uppercase',letterSpacing:.8,marginBottom:5,fontFamily:"'Sora',sans-serif"}

const CAR_PARTS_CATEGORIES = [
  {cat:'Motor & transmisie', parts:['Motor complet','Cutie viteze','Ambreiaj','Arbore cotit','Chiuloasă','Bloc motor','Turbosuflantă','Radiator','Pompă apă','Alternator','Starter','Compresor AC']},
  {cat:'Caroserie', parts:['Capotă','Portbagaj','Ușă față stânga','Ușă față dreapta','Ușă spate stânga','Ușă spate dreapta','Aripă față stânga','Aripă față dreapta','Bară față','Bară spate','Prag stânga','Prag dreapta']},
  {cat:'Suspensie & direcție', parts:['Amortizor față stânga','Amortizor față dreapta','Amortizor spate stânga','Amortizor spate dreapta','Arc față','Arc spate','Fuzetă','Planetară','Pivot','Levier','Bară direcție','Coloană direcție']},
  {cat:'Frâne', parts:['Disc frână față','Disc frână spate','Etrier față','Etrier spate','Pompă frână','Servofână']},
  {cat:'Electrică & electronice', parts:['Calculator motor (ECU)','Calculator ABS','Calculator airbag','Tablou bord','Alternator','Far față stânga','Far față dreapta','Stop spate stânga','Stop spate dreapta','Geam electric față','Geam electric spate']},
  {cat:'Interior', parts:['Scaun față stânga','Scaun față dreapta','Banchetă spate','Volan','Airbag volan','Airbag pasager','Tapițerie ușă','Covor interior','Hayon interior']},
  {cat:'Combustibil & evacuare', parts:['Rezervor combustibil','Pompă combustibil','Filtru combustibil','Injector','Tobă evacuare','Catalizator','Sondă lambda']},
]

const CONDITION_LABELS = {excelenta:'⭐ Excelentă',buna:'✅ Bună',acceptabila:'⚠️ Acceptabilă'}
const FUEL_LABELS = {benzina:'Benzină',diesel:'Diesel',hybrid:'Hybrid',electric:'Electric',gpl:'GPL'}

export default function DezmembrariModule({ serviceId }) {
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list') // 'list' | 'add-car' | 'car-detail' | 'add-part'
  const [selectedCar, setSelectedCar] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploadingImg, setUploadingImg] = useState(false)
  const supabase = createClient()

  // Forms
  const [carForm, setCarForm] = useState({brand:'',model:'',year:'',fuel_type:'',engine_cc:'',color:'',vin:'',km:'',condition:'partial',description:'',images:[]})
  const [partForm, setPartForm] = useState({name:'',category:'',price:'',condition:'buna',quantity:'1',part_number:'',images:[]})
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => { loadCars() }, [serviceId])

  async function loadCars() {
    setLoading(true)
    const { data } = await supabase
      .from('dezmembrari_cars')
      .select('*, dezmembrari_parts(id, name, is_available)')
      .eq('service_id', serviceId)
      .order('created_at', { ascending: false })
    setCars(data || [])
    setLoading(false)
  }

  async function loadCarParts(carId) {
    const { data } = await supabase
      .from('dezmembrari_parts')
      .select('*')
      .eq('car_id', carId)
      .order('category')
    return data || []
  }

  async function saveCar() {
    if (!carForm.brand || !carForm.model) return
    setSaving(true)
    const { data, error } = await supabase.from('dezmembrari_cars').insert({
      service_id: serviceId,
      brand: carForm.brand, model: carForm.model,
      year: carForm.year ? parseInt(carForm.year) : null,
      fuel_type: carForm.fuel_type || null, engine_cc: carForm.engine_cc || null,
      color: carForm.color || null, vin: carForm.vin || null,
      km: carForm.km ? parseInt(carForm.km) : null,
      condition: carForm.condition, description: carForm.description || null,
      images: carForm.images,
    }).select().single()
    setSaving(false)
    if (!error && data) {
      await loadCars()
      setCarForm({brand:'',model:'',year:'',fuel_type:'',engine_cc:'',color:'',vin:'',km:'',condition:'partial',description:'',images:[]})
      setSelectedCar(data)
      setView('car-detail')
    }
  }

  async function savePart() {
    if (!partForm.name || !selectedCar) return
    setSaving(true)
    await supabase.from('dezmembrari_parts').insert({
      car_id: selectedCar.id, service_id: serviceId,
      name: partForm.name, category: partForm.category || selectedCategory,
      price: partForm.price ? parseFloat(partForm.price) : null,
      condition: partForm.condition,
      quantity: partForm.quantity ? parseInt(partForm.quantity) : 1,
      part_number: partForm.part_number || null,
      images: partForm.images,
    })
    setSaving(false)
    setPartForm({name:'',category:'',price:'',condition:'buna',quantity:'1',part_number:'',images:[]})
    setSelectedCategory('')
    // Refresh car parts
    const parts = await loadCarParts(selectedCar.id)
    setSelectedCar(prev => ({...prev, dezmembrari_parts: parts}))
    setView('car-detail')
  }

  async function toggleCarActive(carId, current) {
    await supabase.from('dezmembrari_cars').update({is_active: !current}).eq('id', carId)
    setCars(prev => prev.map(c => c.id === carId ? {...c, is_active: !current} : c))
  }

  async function togglePartAvailable(partId, current, carId) {
    await supabase.from('dezmembrari_parts').update({is_available: !current}).eq('id', partId)
    const parts = await loadCarParts(carId)
    setSelectedCar(prev => ({...prev, dezmembrari_parts: parts}))
  }

  async function deletePart(partId, carId) {
    if (!confirm('Ștergi această piesă?')) return
    await supabase.from('dezmembrari_parts').delete().eq('id', partId)
    const parts = await loadCarParts(carId)
    setSelectedCar(prev => ({...prev, dezmembrari_parts: parts}))
  }

  async function uploadImage(file, type) {
    if (!file) return
    setUploadingImg(true)
    const ext = file.name.split('.').pop()
    const path = `dezmembrari/${serviceId}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('service-media').upload(path, file)
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('service-media').getPublicUrl(path)
      if (type === 'car') setCarForm(p => ({...p, images:[...p.images, publicUrl]}))
      else setPartForm(p => ({...p, images:[...p.images, publicUrl]}))
    }
    setUploadingImg(false)
  }

  // ── LIST VIEW ──────────────────────────────────────────────────────────────
  if (view === 'list') return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .dez-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}
        .dez-card{background:#fff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden;transition:all .15s;cursor:pointer}
        .dez-card:hover{box-shadow:0 4px 20px rgba(10,31,68,0.1);border-color:#1a56db;transform:translateY(-2px)}
        @media(max-width:600px){.dez-grid{grid-template-columns:1fr!important}}
      `}</style>

      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:10}}>
        <div>
          <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color:S.navy,marginBottom:4}}>🚗 Mașini dezmembrate</h1>
          <p style={{fontSize:14,color:S.muted}}>{cars.length} mașini în parc · {cars.reduce((s,c)=>s+(c.dezmembrari_parts?.length||0),0)} piese totale</p>
        </div>
        <button onClick={()=>setView('add-car')} style={btn('primary')}>+ Adaugă mașină</button>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:24}} className="dez-stats">
        {[
          {icon:'🚗',label:'Mașini active',value:cars.filter(c=>c.is_active).length,color:S.blue,bg:'#eaf3ff'},
          {icon:'📦',label:'Piese disponibile',value:cars.reduce((s,c)=>s+(c.dezmembrari_parts?.filter(p=>p.is_available)?.length||0),0),color:S.green,bg:S.greenBg},
          {icon:'⚠️',label:'Piese vândute',value:cars.reduce((s,c)=>s+(c.dezmembrari_parts?.filter(p=>!p.is_available)?.length||0),0),color:S.amber,bg:S.amberBg},
          {icon:'🔴',label:'Mașini inactive',value:cars.filter(c=>!c.is_active).length,color:S.red,bg:S.redBg},
        ].map(({icon,label,value,color,bg})=>(
          <div key={label} style={{...card(),textAlign:'center',border:'none',background:bg}}>
            <div style={{fontSize:24,marginBottom:6}}>{icon}</div>
            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color}}>{value}</div>
            <div style={{fontSize:11,color,opacity:.8,marginTop:2}}>{label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{textAlign:'center',padding:40}}><div style={{width:32,height:32,border:`3px solid ${S.blue}`,borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto'}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
      ) : cars.length === 0 ? (
        <div style={{...card(),textAlign:'center',padding:'80px 20px'}}>
          <div style={{fontSize:72,marginBottom:16}}>🚗</div>
          <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color:S.navy,marginBottom:8}}>Nicio mașină adăugată</h2>
          <p style={{fontSize:14,color:S.muted,marginBottom:24,maxWidth:400,margin:'0 auto 24px'}}>Adaugă prima mașină din parcul tău și listează piesele disponibile pentru clienți.</p>
          <button onClick={()=>setView('add-car')} style={btn('primary')}>+ Adaugă prima mașină</button>
        </div>
      ) : (
        <div className="dez-grid">
          {cars.map(car => {
            const partsTotal = car.dezmembrari_parts?.length || 0
            const partsAvail = car.dezmembrari_parts?.filter(p=>p.is_available)?.length || 0
            return (
              <div key={car.id} className="dez-card" onClick={async()=>{ const parts = await loadCarParts(car.id); setSelectedCar({...car,dezmembrari_parts:parts}); setView('car-detail') }}>
                {/* Car image */}
                <div style={{height:160,background:'#f0f6ff',position:'relative',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {car.images?.[0]
                    ? <img src={car.images[0]} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                    : <span style={{fontSize:56}}>🚗</span>
                  }
                  {!car.is_active && <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{background:'#dc2626',color:'#fff',padding:'4px 12px',borderRadius:50,fontSize:12,fontWeight:700}}>INACTIV</span></div>}
                  <div style={{position:'absolute',top:8,right:8,background:'rgba(255,255,255,0.9)',borderRadius:8,padding:'3px 8px',fontSize:11,fontWeight:700,color:S.navy}}>{car.year || '—'}</div>
                </div>
                <div style={{padding:14}}>
                  <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:S.navy,marginBottom:4}}>{car.brand} {car.model}</div>
                  <div style={{fontSize:12,color:S.muted,marginBottom:10,display:'flex',gap:8,flexWrap:'wrap'}}>
                    {car.fuel_type && <span>{FUEL_LABELS[car.fuel_type]||car.fuel_type}</span>}
                    {car.engine_cc && <span>· {car.engine_cc}cc</span>}
                    {car.km && <span>· {car.km.toLocaleString()} km</span>}
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div style={{display:'flex',gap:6}}>
                      <span style={{background:S.greenBg,color:S.green,fontSize:11,fontWeight:700,padding:'3px 8px',borderRadius:50}}>{partsAvail} piese</span>
                      {partsTotal > partsAvail && <span style={{background:S.bg,color:S.muted,fontSize:11,padding:'3px 8px',borderRadius:50}}>{partsTotal-partsAvail} vândute</span>}
                    </div>
                    <button onClick={e=>{e.stopPropagation();toggleCarActive(car.id,car.is_active)}}
                      style={{...btn(car.is_active?'ghost':'primary'),padding:'4px 10px',fontSize:11}}>
                      {car.is_active?'Dezactivează':'Activează'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )

  // ── ADD CAR VIEW ─────────────────────────────────────────────────────────
  if (view === 'add-car') return (
    <div style={{maxWidth:700,margin:'0 auto'}}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <button onClick={()=>setView('list')} style={{...btn('ghost'),padding:'8px 14px'}}>← Înapoi</button>
        <div>
          <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:22,color:S.navy,margin:0}}>Adaugă mașină dezmembrată</h1>
          <p style={{fontSize:13,color:S.muted,margin:0}}>Completează datele mașinii — după salvare adaugi piesele</p>
        </div>
      </div>

      <div style={card()}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
          <div>
            <label style={lbl}>Marcă *</label>
            <input style={inp} value={carForm.brand} onChange={e=>setCarForm(p=>({...p,brand:e.target.value}))} placeholder="Ex: Volkswagen, BMW, Dacia"/>
          </div>
          <div>
            <label style={lbl}>Model *</label>
            <input style={inp} value={carForm.model} onChange={e=>setCarForm(p=>({...p,model:e.target.value}))} placeholder="Ex: Golf, Seria 3, Logan"/>
          </div>
          <div>
            <label style={lbl}>An fabricație</label>
            <input style={inp} type="number" min="1970" max="2025" value={carForm.year} onChange={e=>setCarForm(p=>({...p,year:e.target.value}))} placeholder="Ex: 2015"/>
          </div>
          <div>
            <label style={lbl}>Combustibil</label>
            <select style={{...inp,background:'#fff'}} value={carForm.fuel_type} onChange={e=>setCarForm(p=>({...p,fuel_type:e.target.value}))}>
              <option value="">Selectează</option>
              {Object.entries(FUEL_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Motor (cc)</label>
            <input style={inp} value={carForm.engine_cc} onChange={e=>setCarForm(p=>({...p,engine_cc:e.target.value}))} placeholder="Ex: 1600, 2000"/>
          </div>
          <div>
            <label style={lbl}>Culoare</label>
            <input style={inp} value={carForm.color} onChange={e=>setCarForm(p=>({...p,color:e.target.value}))} placeholder="Ex: Negru, Argintiu"/>
          </div>
          <div>
            <label style={lbl}>Kilometraj</label>
            <input style={inp} type="number" value={carForm.km} onChange={e=>setCarForm(p=>({...p,km:e.target.value}))} placeholder="Ex: 180000"/>
          </div>
          <div>
            <label style={lbl}>VIN (opțional)</label>
            <input style={inp} value={carForm.vin} onChange={e=>setCarForm(p=>({...p,vin:e.target.value}))} placeholder="Număr identificare vehicul"/>
          </div>
          <div style={{gridColumn:'1/-1'}}>
            <label style={lbl}>Tip dezmembrare</label>
            <div style={{display:'flex',gap:10}}>
              {[{k:'partial',l:'Parțial',d:'Unele piese disponibile',icon:'⚙️'},{k:'total',l:'Total',d:'Toate piesele disponibile',icon:'🔧'}].map(({k,l,d,icon})=>(
                <button key={k} onClick={()=>setCarForm(p=>({...p,condition:k}))}
                  style={{flex:1,padding:'12px',borderRadius:12,border:`2px solid ${carForm.condition===k?S.blue:S.border}`,background:carForm.condition===k?'#eaf3ff':'#fff',cursor:'pointer',textAlign:'left',transition:'all .15s'}}>
                  <div style={{fontSize:20,marginBottom:4}}>{icon}</div>
                  <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy}}>{l}</div>
                  <div style={{fontSize:11,color:S.muted}}>{d}</div>
                </button>
              ))}
            </div>
          </div>
          <div style={{gridColumn:'1/-1'}}>
            <label style={lbl}>Descriere / observații</label>
            <textarea style={{...inp,resize:'vertical'}} rows={3} value={carForm.description} onChange={e=>setCarForm(p=>({...p,description:e.target.value}))} placeholder="Ex: Mașina a fost accidentată frontal. Motor și cutie în stare bună..."/>
          </div>
          <div style={{gridColumn:'1/-1'}}>
            <label style={lbl}>Fotografii mașină</label>
            <div style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'flex-start'}}>
              {carForm.images.map((img,i)=>(
                <div key={i} style={{position:'relative',width:80,height:80,borderRadius:10,overflow:'hidden'}}>
                  <img src={img} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>
                  <button onClick={()=>setCarForm(p=>({...p,images:p.images.filter((_,idx)=>idx!==i)}))}
                    style={{position:'absolute',top:2,right:2,width:18,height:18,borderRadius:'50%',background:'rgba(220,38,38,0.9)',border:'none',color:'#fff',cursor:'pointer',fontSize:10,display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
                </div>
              ))}
              <label style={{width:80,height:80,borderRadius:10,border:`2px dashed ${S.border}`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',cursor:'pointer',background:S.bg,fontSize:10,color:S.muted,gap:4}}>
                {uploadingImg?'⏳':'📷'}
                <span>Adaugă</span>
                <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>uploadImage(e.target.files[0],'car')}/>
              </label>
            </div>
          </div>
        </div>

        <div style={{display:'flex',gap:10,paddingTop:14,borderTop:`1px solid ${S.border}`}}>
          <button onClick={()=>setView('list')} style={{...btn('ghost'),flex:'0 0 auto'}}>Anulează</button>
          <button onClick={saveCar} disabled={!carForm.brand||!carForm.model||saving}
            style={{...btn('primary'),flex:1,opacity:(!carForm.brand||!carForm.model||saving)?.6:1}}>
            {saving?'Se salvează...':'✅ Salvează mașina → Adaugă piese'}
          </button>
        </div>
      </div>
    </div>
  )

  // ── CAR DETAIL VIEW ──────────────────────────────────────────────────────
  if (view === 'car-detail' && selectedCar) {
    const parts = selectedCar.dezmembrari_parts || []
    const partsByCategory = parts.reduce((acc,p)=>{if(!acc[p.category])acc[p.category]=[];acc[p.category].push(p);return acc},{})

    return (
      <div>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20,flexWrap:'wrap'}}>
          <button onClick={()=>setView('list')} style={{...btn('ghost'),padding:'8px 14px'}}>← Înapoi</button>
          <div style={{flex:1}}>
            <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:20,color:S.navy,margin:0}}>{selectedCar.brand} {selectedCar.model} {selectedCar.year?`(${selectedCar.year})`:''}</h1>
            <div style={{fontSize:12,color:S.muted,display:'flex',gap:8,marginTop:2,flexWrap:'wrap'}}>
              {selectedCar.fuel_type&&<span>{FUEL_LABELS[selectedCar.fuel_type]}</span>}
              {selectedCar.engine_cc&&<span>· {selectedCar.engine_cc}cc</span>}
              {selectedCar.km&&<span>· {selectedCar.km.toLocaleString()} km</span>}
              {selectedCar.color&&<span>· {selectedCar.color}</span>}
            </div>
          </div>
          <button onClick={()=>setView('add-part')} style={btn('yellow')}>+ Adaugă piesă</button>
        </div>

        {/* Car info card */}
        {selectedCar.description&&(
          <div style={{...card(),marginBottom:16,background:'#fffbeb',border:`1px solid ${S.yellow}30`}}>
            <div style={{fontSize:11,fontWeight:700,color:S.amber,marginBottom:4}}>NOTE MAȘINĂ</div>
            <p style={{fontSize:13,color:S.amber,margin:0}}>{selectedCar.description}</p>
          </div>
        )}

        {/* Parts stats */}
        <div style={{display:'flex',gap:10,marginBottom:20,flexWrap:'wrap'}}>
          {[
            {label:'Total piese',value:parts.length,color:S.navy,bg:S.bg},
            {label:'Disponibile',value:parts.filter(p=>p.is_available).length,color:S.green,bg:S.greenBg},
            {label:'Vândute',value:parts.filter(p=>!p.is_available).length,color:S.red,bg:S.redBg},
          ].map(({label,value,color,bg})=>(
            <div key={label} style={{padding:'10px 16px',borderRadius:12,background:bg,textAlign:'center',minWidth:90}}>
              <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:20,color}}>{value}</div>
              <div style={{fontSize:11,color,opacity:.8}}>{label}</div>
            </div>
          ))}
        </div>

        {parts.length===0?(
          <div style={{...card(),textAlign:'center',padding:'60px 20px'}}>
            <div style={{fontSize:56,marginBottom:12}}>📦</div>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:18,color:S.navy,marginBottom:8}}>Nicio piesă adăugată</h2>
            <p style={{fontSize:14,color:S.muted,marginBottom:20}}>Adaugă piesele disponibile din această mașină.</p>
            <button onClick={()=>setView('add-part')} style={btn('primary')}>+ Adaugă prima piesă</button>
          </div>
        ):(
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {Object.entries(partsByCategory).map(([category, catParts])=>(
              <div key={category} style={card()}>
                <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,color:S.navy,marginBottom:12,paddingBottom:8,borderBottom:`1px solid ${S.border}`}}>
                  {category} <span style={{fontSize:12,color:S.muted,fontWeight:400}}>({catParts.length} piese)</span>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {catParts.map(p=>(
                    <div key={p.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 12px',background:p.is_available?S.bg:S.redBg,borderRadius:10,gap:10,flexWrap:'wrap'}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:600,fontSize:13,color:p.is_available?S.navy:'#991b1b',display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}>
                          {p.name}
                          <span style={{fontSize:10,background:p.condition==='excelenta'?S.greenBg:p.condition==='buna'?'#eaf3ff':S.amberBg,color:p.condition==='excelenta'?S.green:p.condition==='buna'?S.blue:S.amber,padding:'2px 7px',borderRadius:50,fontWeight:700}}>
                            {CONDITION_LABELS[p.condition]}
                          </span>
                          {!p.is_available&&<span style={{fontSize:10,background:S.redBg,color:S.red,padding:'2px 7px',borderRadius:50,fontWeight:700}}>VÂNDUT</span>}
                        </div>
                        {p.part_number&&<div style={{fontSize:11,color:S.muted,marginTop:2}}>Nr. piesă: {p.part_number}</div>}
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                        {p.price&&<div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:15,color:S.navy}}>{p.price} RON</div>}
                        <button onClick={()=>togglePartAvailable(p.id,p.is_available,selectedCar.id)}
                          style={{...btn(p.is_available?'ghost':'primary'),padding:'5px 10px',fontSize:11}}>
                          {p.is_available?'Marchează vândut':'Disponibil din nou'}
                        </button>
                        <button onClick={()=>deletePart(p.id,selectedCar.id)}
                          style={{...btn('red'),padding:'5px 10px',fontSize:11}}>🗑</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── ADD PART VIEW ────────────────────────────────────────────────────────
  if (view === 'add-part' && selectedCar) return (
    <div style={{maxWidth:600,margin:'0 auto'}}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <button onClick={()=>setView('car-detail')} style={{...btn('ghost'),padding:'8px 14px'}}>← Înapoi</button>
        <div>
          <h1 style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:20,color:S.navy,margin:0}}>Adaugă piesă</h1>
          <p style={{fontSize:13,color:S.muted,margin:0}}>pentru {selectedCar.brand} {selectedCar.model} {selectedCar.year?`(${selectedCar.year})`:''}</p>
        </div>
      </div>

      <div style={card()}>
        {/* Category selector */}
        <label style={lbl}>Categorie piesă *</label>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:8,marginBottom:16}}>
          {CAR_PARTS_CATEGORIES.map(({cat})=>(
            <button key={cat} onClick={()=>{setSelectedCategory(cat);setPartForm(p=>({...p,category:cat,name:''}))}}
              style={{padding:'8px 10px',borderRadius:10,border:`1.5px solid ${selectedCategory===cat?S.blue:S.border}`,background:selectedCategory===cat?'#eaf3ff':'#fff',cursor:'pointer',fontSize:11,fontWeight:600,color:selectedCategory===cat?S.blue:S.navy,textAlign:'left',transition:'all .15s'}}>
              {cat}
            </button>
          ))}
        </div>

        {/* Part name from category */}
        {selectedCategory && (
          <>
            <label style={lbl}>Piesă *</label>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:16}}>
              {CAR_PARTS_CATEGORIES.find(c=>c.cat===selectedCategory)?.parts.map(part=>(
                <button key={part} onClick={()=>setPartForm(p=>({...p,name:part}))}
                  style={{padding:'6px 12px',borderRadius:50,border:`1.5px solid ${partForm.name===part?S.blue:S.border}`,background:partForm.name===part?'#eaf3ff':'#fff',cursor:'pointer',fontSize:12,fontWeight:partForm.name===part?700:400,color:partForm.name===part?S.blue:S.navy,transition:'all .15s'}}>
                  {part}
                </button>
              ))}
              {/* Custom name */}
              <input style={{...inp,width:'auto',flex:'1 1 150px'}} value={!CAR_PARTS_CATEGORIES.find(c=>c.cat===selectedCategory)?.parts.includes(partForm.name)?partForm.name:''} onChange={e=>setPartForm(p=>({...p,name:e.target.value}))} placeholder="Sau scrie manual..."/>
            </div>
          </>
        )}

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
          <div>
            <label style={lbl}>Preț (RON)</label>
            <input style={inp} type="number" min="0" value={partForm.price} onChange={e=>setPartForm(p=>({...p,price:e.target.value}))} placeholder="Ex: 250"/>
          </div>
          <div>
            <label style={lbl}>Cantitate</label>
            <input style={inp} type="number" min="1" value={partForm.quantity} onChange={e=>setPartForm(p=>({...p,quantity:e.target.value}))} placeholder="1"/>
          </div>
          <div style={{gridColumn:'1/-1'}}>
            <label style={lbl}>Stare piesă</label>
            <div style={{display:'flex',gap:8}}>
              {Object.entries(CONDITION_LABELS).map(([k,v])=>(
                <button key={k} onClick={()=>setPartForm(p=>({...p,condition:k}))}
                  style={{flex:1,padding:'8px',borderRadius:10,border:`1.5px solid ${partForm.condition===k?S.blue:S.border}`,background:partForm.condition===k?'#eaf3ff':'#fff',cursor:'pointer',fontSize:12,fontWeight:partForm.condition===k?700:400,color:partForm.condition===k?S.blue:S.navy,transition:'all .15s'}}>
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div style={{gridColumn:'1/-1'}}>
            <label style={lbl}>Număr piesă OEM (opțional)</label>
            <input style={inp} value={partForm.part_number} onChange={e=>setPartForm(p=>({...p,part_number:e.target.value}))} placeholder="Ex: 06A103601P"/>
          </div>
          <div style={{gridColumn:'1/-1'}}>
            <label style={lbl}>Fotografii piesă</label>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {partForm.images.map((img,i)=>(
                <div key={i} style={{position:'relative',width:70,height:70,borderRadius:8,overflow:'hidden'}}>
                  <img src={img} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>
                  <button onClick={()=>setPartForm(p=>({...p,images:p.images.filter((_,idx)=>idx!==i)}))}
                    style={{position:'absolute',top:2,right:2,width:16,height:16,borderRadius:'50%',background:'rgba(220,38,38,0.9)',border:'none',color:'#fff',cursor:'pointer',fontSize:9,display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
                </div>
              ))}
              <label style={{width:70,height:70,borderRadius:8,border:`2px dashed ${S.border}`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',cursor:'pointer',background:S.bg,fontSize:10,color:S.muted,gap:3}}>
                {uploadingImg?'⏳':'📷'}<span>Foto</span>
                <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>uploadImage(e.target.files[0],'part')}/>
              </label>
            </div>
          </div>
        </div>

        <div style={{display:'flex',gap:10,paddingTop:14,borderTop:`1px solid ${S.border}`}}>
          <button onClick={()=>setView('car-detail')} style={{...btn('ghost'),flex:'0 0 auto'}}>Anulează</button>
          <button onClick={savePart} disabled={!partForm.name||!selectedCategory||saving}
            style={{...btn('primary'),flex:1,opacity:(!partForm.name||!selectedCategory||saving)?.6:1}}>
            {saving?'Se salvează...':'✅ Adaugă piesa'}
          </button>
        </div>
      </div>
    </div>
  )

  return null
}
