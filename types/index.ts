import type { Database } from '~/types/supabase'

export interface Document {
  id: string
  title: string
  file_path: string
  file_url: string
  deadline: string
  upload_date: string
  user_id: string
  created_at: string | null
  category: string
  tags: string[]
  description: string | null
  metadata: Record<string, any>
  folder_id?: string
  is_important?: boolean
  is_archived?: boolean
}

export type InsertDocument = Database['public']['Tables']['documents']['Insert']

export type Tables = Database['public']['Tables']
export type UpdateDocument = Tables['documents']['Update']

export type DbDocument = Database['public']['Tables']['documents']['Row']
export type DbInsertDocument = Database['public']['Tables']['documents']['Insert']

export type NewDocument = DbInsertDocument 