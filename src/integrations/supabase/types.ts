export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      community_posts: {
        Row: {
          comments_count: number
          content: string
          created_at: string
          id: string
          image_url: string | null
          impact_description: string | null
          is_verified: boolean
          likes_count: number
          post_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          impact_description?: string | null
          is_verified?: boolean
          likes_count?: number
          post_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          impact_description?: string | null
          is_verified?: boolean
          likes_count?: number
          post_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city_name: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          latitude: number | null
          location_updated_at: string | null
          longitude: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          city_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          latitude?: number | null
          location_updated_at?: string | null
          longitude?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          city_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          latitude?: number | null
          location_updated_at?: string | null
          longitude?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_description: string | null
          achievement_icon: string | null
          achievement_id: string
          achievement_name: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_description?: string | null
          achievement_icon?: string | null
          achievement_id: string
          achievement_name: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_description?: string | null
          achievement_icon?: string | null
          achievement_id?: string
          achievement_name?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_actions: {
        Row: {
          action_description: string | null
          action_type: string
          coins_earned: number | null
          created_at: string
          id: string
          metadata: Json | null
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          action_description?: string | null
          action_type: string
          coins_earned?: number | null
          created_at?: string
          id?: string
          metadata?: Json | null
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          action_description?: string | null
          action_type?: string
          coins_earned?: number | null
          created_at?: string
          id?: string
          metadata?: Json | null
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: []
      }
      user_daily_tasks: {
        Row: {
          coin_reward: number
          completed_at: string | null
          id: string
          is_completed: boolean
          task_date: string
          task_description: string | null
          task_id: string
          task_name: string
          user_id: string
          xp_reward: number
        }
        Insert: {
          coin_reward?: number
          completed_at?: string | null
          id?: string
          is_completed?: boolean
          task_date?: string
          task_description?: string | null
          task_id: string
          task_name: string
          user_id: string
          xp_reward?: number
        }
        Update: {
          coin_reward?: number
          completed_at?: string | null
          id?: string
          is_completed?: boolean
          task_date?: string
          task_description?: string | null
          task_id?: string
          task_name?: string
          user_id?: string
          xp_reward?: number
        }
        Relationships: []
      }
      user_environment_data: {
        Row: {
          aqi_category: string | null
          city_name: string | null
          current_aqi: number | null
          humidity: number | null
          id: string
          latitude: number
          longitude: number
          pressure: number | null
          temperature: number | null
          updated_at: string
          user_id: string
          uv_index: number | null
          visibility: number | null
          weather_description: string | null
          weather_icon: string | null
          wind_speed: number | null
        }
        Insert: {
          aqi_category?: string | null
          city_name?: string | null
          current_aqi?: number | null
          humidity?: number | null
          id?: string
          latitude: number
          longitude: number
          pressure?: number | null
          temperature?: number | null
          updated_at?: string
          user_id: string
          uv_index?: number | null
          visibility?: number | null
          weather_description?: string | null
          weather_icon?: string | null
          wind_speed?: number | null
        }
        Update: {
          aqi_category?: string | null
          city_name?: string | null
          current_aqi?: number | null
          humidity?: number | null
          id?: string
          latitude?: number
          longitude?: number
          pressure?: number | null
          temperature?: number | null
          updated_at?: string
          user_id?: string
          uv_index?: number | null
          visibility?: number | null
          weather_description?: string | null
          weather_icon?: string | null
          wind_speed?: number | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          created_at: string
          eco_coins: number
          id: string
          last_activity_date: string | null
          level: number
          streak_days: number
          total_coins_earned: number
          total_xp_earned: number
          updated_at: string
          user_id: string
          xp: number
          xp_to_next_level: number
        }
        Insert: {
          created_at?: string
          eco_coins?: number
          id?: string
          last_activity_date?: string | null
          level?: number
          streak_days?: number
          total_coins_earned?: number
          total_xp_earned?: number
          updated_at?: string
          user_id: string
          xp?: number
          xp_to_next_level?: number
        }
        Update: {
          created_at?: string
          eco_coins?: number
          id?: string
          last_activity_date?: string | null
          level?: number
          streak_days?: number
          total_coins_earned?: number
          total_xp_earned?: number
          updated_at?: string
          user_id?: string
          xp?: number
          xp_to_next_level?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          device_info: string | null
          id: string
          ip_address: string | null
          is_active: boolean
          last_active_at: string
          session_token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean
          last_active_at?: string
          session_token: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean
          last_active_at?: string
          session_token?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_user_xp: {
        Args: {
          _action_type?: string
          _coins?: number
          _description?: string
          _user_id: string
          _xp: number
        }
        Returns: {
          leveled_up: boolean
          new_coins: number
          new_level: number
          new_xp: number
        }[]
      }
      get_current_user_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      invalidate_all_sessions: {
        Args: { _user_id: string }
        Returns: undefined
      }
      update_user_streak: { Args: { _user_id: string }; Returns: number }
      upsert_user_environment: {
        Args: {
          _aqi_category?: string
          _city_name?: string
          _current_aqi?: number
          _humidity?: number
          _latitude: number
          _longitude: number
          _pressure?: number
          _temperature?: number
          _user_id: string
          _uv_index?: number
          _visibility?: number
          _weather_description?: string
          _weather_icon?: string
          _wind_speed?: number
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
