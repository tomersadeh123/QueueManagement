export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string
          name: string
          phone: string
          address: string | null
          settings: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
          address?: string | null
          settings?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          address?: string | null
          settings?: Json | null
          created_at?: string
        }
      }
      staff: {
        Row: {
          id: string
          business_id: string
          user_id: string | null
          name: string
          phone: string | null
          working_hours: Json | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          user_id?: string | null
          name: string
          phone?: string | null
          working_hours?: Json | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          user_id?: string | null
          name?: string
          phone?: string | null
          working_hours?: Json | null
          is_active?: boolean
          created_at?: string
        }
      }
      services: {
        Row: {
          id: string
          business_id: string
          name: string
          duration_minutes: number
          price: number | null
          description: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          name: string
          duration_minutes: number
          price?: number | null
          description?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          name?: string
          duration_minutes?: number
          price?: number | null
          description?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      staff_services: {
        Row: {
          staff_id: string
          service_id: string
        }
        Insert: {
          staff_id: string
          service_id: string
        }
        Update: {
          staff_id?: string
          service_id?: string
        }
      }
      appointments: {
        Row: {
          id: string
          business_id: string
          customer_name: string
          customer_phone: string
          service_id: string
          staff_id: string
          appointment_time: string
          status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          customer_name: string
          customer_phone: string
          service_id: string
          staff_id: string
          appointment_time: string
          status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          customer_name?: string
          customer_phone?: string
          service_id?: string
          staff_id?: string
          appointment_time?: string
          status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
          notes?: string | null
          created_at?: string
        }
      }
      queue_entries: {
        Row: {
          id: string
          business_id: string
          customer_name: string
          customer_phone: string
          service_id: string
          queue_number: number
          status: 'waiting' | 'called' | 'in_progress' | 'completed' | 'cancelled'
          estimated_wait_minutes: number | null
          notified_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          customer_name: string
          customer_phone: string
          service_id: string
          queue_number: number
          status?: 'waiting' | 'called' | 'in_progress' | 'completed' | 'cancelled'
          estimated_wait_minutes?: number | null
          notified_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          customer_name?: string
          customer_phone?: string
          service_id?: string
          queue_number?: number
          status?: 'waiting' | 'called' | 'in_progress' | 'completed' | 'cancelled'
          estimated_wait_minutes?: number | null
          notified_at?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
