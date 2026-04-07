export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string; role: 'user'|'service'|'admin'; full_name: string|null
          phone: string|null; avatar_url: string|null; city: string|null
          county: string|null; created_at: string; updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'|'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      cars: {
        Row: {
          id: string; user_id: string; brand: string; model: string
          year: number|null; fuel_type: 'benzina'|'diesel'|'hybrid'|'electric'|'gpl'|null
          engine_cc: string|null; horsepower: number|null; plate_number: string|null
          vin: string|null; color: string|null; current_km: number|null
          talon_url: string|null; is_default: boolean; created_at: string
        }
        Insert: Omit<Database['public']['Tables']['cars']['Row'], 'id'|'created_at'|'is_default'>
        Update: Partial<Database['public']['Tables']['cars']['Insert']>
      }
      services: {
        Row: {
          id: string; owner_id: string; name: string; slug: string|null
          description: string|null; phone: string|null; email: string|null
          website: string|null; facebook_url: string|null; address: string|null
          city: string|null; county: string|null; cover_image_url: string|null
          logo_url: string|null; brands_accepted: string[]|null; brands_excluded: string[]|null
          fuel_types: string[]|null; min_year_accepted: number|null
          is_authorized_rar: boolean; has_itp: boolean; warranty_months: number
          plan: 'free'|'basic'|'pro'|'enterprise'; plan_expires_at: string|null
          is_verified: boolean; is_active: boolean
          rating_avg: number; rating_count: number; created_at: string; updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['services']['Row'], 'id'|'created_at'|'updated_at'|'rating_avg'|'rating_count'>
        Update: Partial<Database['public']['Tables']['services']['Insert']>
      }
      quote_requests: {
        Row: {
          id: string; user_id: string|null; car_id: string|null
          car_brand: string|null; car_model: string|null; car_year: number|null
          car_fuel: string|null; car_km: number|null; car_plate: string|null
          city: string|null; county: string|null; services: string[]|null
          description: string|null; preferred_brand: string|null
          urgency: 'flexibil'|'saptamana'|'urgent'
          preferred_date: string|null; preferred_time: string|null
          contact_name: string|null; contact_phone: string|null
          status: 'activa'|'in_progres'|'finalizata'|'anulata'
          offers_count: number; expires_at: string; created_at: string
        }
        Insert: Omit<Database['public']['Tables']['quote_requests']['Row'], 'id'|'created_at'|'offers_count'|'expires_at'>
        Update: Partial<Database['public']['Tables']['quote_requests']['Insert']>
      }
      offers: {
        Row: {
          id: string; request_id: string; service_id: string
          price_total: number|null; price_parts: number|null; price_labor: number|null
          currency: string; description: string|null; warranty_months: number
          available_date: string|null; available_time: string|null; file_url: string|null
          status: 'trimisa'|'acceptata'|'refuzata'|'expirata'
          expires_at: string; created_at: string
        }
        Insert: Omit<Database['public']['Tables']['offers']['Row'], 'id'|'created_at'|'expires_at'>
        Update: Partial<Database['public']['Tables']['offers']['Insert']>
      }
      appointments: {
        Row: {
          id: string; user_id: string; service_id: string; offer_id: string|null
          car_id: string|null; scheduled_date: string; scheduled_time: string
          duration_min: number; status: 'confirmata'|'in_asteptare'|'in_lucru'|'finalizata'|'anulata'
          notes: string|null; reminder_sent: boolean; created_at: string; updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['appointments']['Row'], 'id'|'created_at'|'updated_at'|'reminder_sent'>
        Update: Partial<Database['public']['Tables']['appointments']['Insert']>
      }
      reviews: {
        Row: {
          id: string; user_id: string; service_id: string; appointment_id: string|null
          rating: number; title: string|null; comment: string|null
          rating_quality: number|null; rating_price: number|null; rating_speed: number|null
          reply_text: string|null; reply_at: string|null
          is_verified: boolean; is_visible: boolean; created_at: string
        }
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id'|'created_at'|'is_verified'|'is_visible'>
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>
      }
      notifications: {
        Row: {
          id: string; user_id: string; type: string; title: string
          body: string|null; data: Json|null; is_read: boolean; created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id'|'created_at'|'is_read'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
      listings: {
        Row: {
          id: string; user_id: string; title: string; description: string|null
          price: number|null; currency: string; category: string|null
          condition: 'nou'|'folosit'|'reconditionat'|null
          compatible_brands: string[]|null; compatible_models: string[]|null
          city: string|null; county: string|null
          is_promoted: boolean; promoted_until: string|null
          promotion_type: 'top'|'urgent'|'highlighted'|null
          status: 'activ'|'vandut'|'expirat'|'suspendat'
          views_count: number; expires_at: string; created_at: string
        }
        Insert: Omit<Database['public']['Tables']['listings']['Row'], 'id'|'created_at'|'views_count'|'expires_at'>
        Update: Partial<Database['public']['Tables']['listings']['Insert']>
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Car = Database['public']['Tables']['cars']['Row']
export type Service = Database['public']['Tables']['services']['Row']
export type QuoteRequest = Database['public']['Tables']['quote_requests']['Row']
export type Offer = Database['public']['Tables']['offers']['Row']
export type Appointment = Database['public']['Tables']['appointments']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type Listing = Database['public']['Tables']['listings']['Row']
