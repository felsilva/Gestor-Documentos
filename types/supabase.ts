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
      documents: {
        Row: {
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
          metadata: {
            fileType: string
            fileSize: number
            lastModified: string
          }
        }
        Insert: {
          title: string
          file_path: string
          file_url: string
          deadline: string
          user_id: string
          category?: string
          tags?: string[]
          description?: string
          metadata?: {
            fileType: string
            fileSize: number
            lastModified: string
          }
        }
        Update: {
          title?: string
          file_path?: string
          file_url?: string
          deadline?: string
          user_id?: string
          category?: string
          tags?: string[]
          description?: string
          metadata?: {
            fileType: string
            fileSize: number
            lastModified: string
          }
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          name: string
          description?: string
        }
        Update: {
          name?: string
          description?: string
        }
      }
      notifications: {
        Row: {
          id: string
          document_id: string
          user_id: string
          type: 'deadline' | 'renewal' | 'review'
          message: string
          read: boolean
          created_at: string
          scheduled_for: string
        }
        Insert: {
          document_id: string
          user_id: string
          type: 'deadline' | 'renewal' | 'review'
          message: string
          read?: boolean
          scheduled_for: string
        }
        Update: {
          read?: boolean
        }
      }
    }
  }
} 