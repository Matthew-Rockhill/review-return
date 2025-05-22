// src/types/database.types.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          company_name: string | null
          logo_url: string | null
          phone: string | null
          google_review_link: string | null
          role: 'business' | 'admin'
          subscription_tier: string
          subscription_status: string
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          company_name?: string | null
          logo_url?: string | null
          phone?: string | null
          google_review_link?: string | null
          role?: 'business' | 'admin'
          subscription_tier?: string
          subscription_status?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          company_name?: string | null
          logo_url?: string | null
          phone?: string | null
          google_review_link?: string | null
          role?: 'business' | 'admin'
          subscription_tier?: string
          subscription_status?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          profile_id: string
          name: string
          description: string | null
          status: 'draft' | 'active' | 'paused' | 'completed'
          review_threshold: number
          max_review_score: number
          qr_code_url: string | null
          share_link: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          profile_id: string
          name: string
          description?: string | null
          status?: 'draft' | 'active' | 'paused' | 'completed'
          review_threshold?: number
          max_review_score?: number
          qr_code_url?: string | null
          share_link?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          profile_id?: string
          name?: string
          description?: string | null
          status?: 'draft' | 'active' | 'paused' | 'completed'
          review_threshold?: number
          max_review_score?: number
          qr_code_url?: string | null
          share_link?: string | null
        }
      }
      surveys: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          campaign_id: string
          title: string
          description: string | null
          thank_you_message: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          campaign_id: string
          title: string
          description?: string | null
          thank_you_message?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          campaign_id?: string
          title?: string
          description?: string | null
          thank_you_message?: string | null
        }
      }
      questions: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          survey_id: string
          text: string
          type: 'text' | 'textarea' | 'rating' | 'multiple_choice' | 'checkbox' | 'dropdown'
          options: Json | null
          required: boolean
          order_index: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          survey_id: string
          text: string
          type: 'text' | 'textarea' | 'rating' | 'multiple_choice' | 'checkbox' | 'dropdown'
          options?: Json | null
          required?: boolean
          order_index: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          survey_id?: string
          text?: string
          type?: 'text' | 'textarea' | 'rating' | 'multiple_choice' | 'checkbox' | 'dropdown'
          options?: Json | null
          required?: boolean
          order_index?: number
        }
      }
      promotions: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          campaign_id: string
          name: string
          description: string | null
          code: string
          is_unique: boolean
          expiry_date: string | null
          max_uses: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          campaign_id: string
          name: string
          description?: string | null
          code: string
          is_unique?: boolean
          expiry_date?: string | null
          max_uses?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          campaign_id?: string
          name?: string
          description?: string | null
          code?: string
          is_unique?: boolean
          expiry_date?: string | null
          max_uses?: number | null
        }
      }
      survey_responses: {
        Row: {
          id: string
          created_at: string
          survey_id: string
          answers: Json
          score: number | null
          ip_address: string | null
          prompted_review: boolean
          submitted_review: boolean
          promotion_claimed: boolean
          promotion_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          survey_id: string
          answers: Json
          score?: number | null
          ip_address?: string | null
          prompted_review?: boolean
          submitted_review?: boolean
          promotion_claimed?: boolean
          promotion_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          survey_id?: string
          answers?: Json
          score?: number | null
          ip_address?: string | null
          prompted_review?: boolean
          submitted_review?: boolean
          promotion_claimed?: boolean
          promotion_id?: string | null
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
      user_role: 'business' | 'admin'
      campaign_status: 'draft' | 'active' | 'paused' | 'completed'
      question_type: 'text' | 'textarea' | 'rating' | 'multiple_choice' | 'checkbox' | 'dropdown'
    }
  }
}