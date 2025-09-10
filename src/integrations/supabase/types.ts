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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      daily_questions: {
        Row: {
          checkin_type: string | null
          created_at: string
          date: string
          id: string
          questions_answered: Json | null
          questions_shown: string[] | null
          user_id: string
        }
        Insert: {
          checkin_type?: string | null
          created_at?: string
          date?: string
          id?: string
          questions_answered?: Json | null
          questions_shown?: string[] | null
          user_id: string
        }
        Update: {
          checkin_type?: string | null
          created_at?: string
          date?: string
          id?: string
          questions_answered?: Json | null
          questions_shown?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      emergency_checkins: {
        Row: {
          ai_assessment: string | null
          created_at: string | null
          getting_worse: boolean | null
          id: string
          medication_taken: string | null
          severity_level: string
          symptom_description: string
          symptom_start_time: string | null
          urgency_score: number | null
          user_id: string
          wants_doctor_connection: boolean | null
        }
        Insert: {
          ai_assessment?: string | null
          created_at?: string | null
          getting_worse?: boolean | null
          id?: string
          medication_taken?: string | null
          severity_level: string
          symptom_description: string
          symptom_start_time?: string | null
          urgency_score?: number | null
          user_id: string
          wants_doctor_connection?: boolean | null
        }
        Update: {
          ai_assessment?: string | null
          created_at?: string | null
          getting_worse?: boolean | null
          id?: string
          medication_taken?: string | null
          severity_level?: string
          symptom_description?: string
          symptom_start_time?: string | null
          urgency_score?: number | null
          user_id?: string
          wants_doctor_connection?: boolean | null
        }
        Relationships: []
      }
      health_tracking: {
        Row: {
          appetite: string | null
          bowel_movement: string | null
          created_at: string
          date: string
          exercise_done: boolean | null
          exercise_intensity: string | null
          id: string
          medications_taken: boolean | null
          menstrual_period_date: string | null
          mood: string | null
          new_symptoms: string[] | null
          pain_experienced: boolean | null
          pain_location: string | null
          sleep_hours: number | null
          stress_level: string | null
          updated_at: string
          urine_changes: string | null
          user_id: string
          water_intake_cups: number | null
        }
        Insert: {
          appetite?: string | null
          bowel_movement?: string | null
          created_at?: string
          date?: string
          exercise_done?: boolean | null
          exercise_intensity?: string | null
          id?: string
          medications_taken?: boolean | null
          menstrual_period_date?: string | null
          mood?: string | null
          new_symptoms?: string[] | null
          pain_experienced?: boolean | null
          pain_location?: string | null
          sleep_hours?: number | null
          stress_level?: string | null
          updated_at?: string
          urine_changes?: string | null
          user_id: string
          water_intake_cups?: number | null
        }
        Update: {
          appetite?: string | null
          bowel_movement?: string | null
          created_at?: string
          date?: string
          exercise_done?: boolean | null
          exercise_intensity?: string | null
          id?: string
          medications_taken?: boolean | null
          menstrual_period_date?: string | null
          mood?: string | null
          new_symptoms?: string[] | null
          pain_experienced?: boolean | null
          pain_location?: string | null
          sleep_hours?: number | null
          stress_level?: string | null
          updated_at?: string
          urine_changes?: string | null
          user_id?: string
          water_intake_cups?: number | null
        }
        Relationships: []
      }
      medications: {
        Row: {
          created_at: string
          dosage: string | null
          end_date: string | null
          frequency: string | null
          id: string
          is_prescribed: boolean | null
          medication_name: string
          notes: string | null
          start_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          is_prescribed?: boolean | null
          medication_name: string
          notes?: string | null
          start_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          is_prescribed?: boolean | null
          medication_name?: string
          notes?: string | null
          start_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mental_health_assessments: {
        Row: {
          created_at: string
          feeling_today: string | null
          has_support_person: boolean | null
          hopelessness_explanation: string | null
          hopelessness_loss_interest: boolean | null
          id: string
          is_flagged_urgent: boolean | null
          mood_score: number | null
          self_harm_thoughts: boolean | null
          sleep_changes: string | null
          stress_anxiety_details: string | null
          stress_anxiety_overwhelm: boolean | null
          thought_heaviness_scale: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feeling_today?: string | null
          has_support_person?: boolean | null
          hopelessness_explanation?: string | null
          hopelessness_loss_interest?: boolean | null
          id?: string
          is_flagged_urgent?: boolean | null
          mood_score?: number | null
          self_harm_thoughts?: boolean | null
          sleep_changes?: string | null
          stress_anxiety_details?: string | null
          stress_anxiety_overwhelm?: boolean | null
          thought_heaviness_scale?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          feeling_today?: string | null
          has_support_person?: boolean | null
          hopelessness_explanation?: string | null
          hopelessness_loss_interest?: boolean | null
          id?: string
          is_flagged_urgent?: boolean | null
          mood_score?: number | null
          self_harm_thoughts?: boolean | null
          sleep_changes?: string | null
          stress_anxiety_details?: string | null
          stress_anxiety_overwhelm?: boolean | null
          thought_heaviness_scale?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding: {
        Row: {
          alcohol_drinker: boolean | null
          blood_group: string | null
          chronic_conditions: string[] | null
          completed_at: string | null
          created_at: string | null
          date_of_birth: string | null
          family_history: string[] | null
          full_name: string | null
          gender: string | null
          height_cm: number | null
          id: string
          location: string | null
          long_term_medications: string[] | null
          smoker: boolean | null
          updated_at: string | null
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          alcohol_drinker?: boolean | null
          blood_group?: string | null
          chronic_conditions?: string[] | null
          completed_at?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          family_history?: string[] | null
          full_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          location?: string | null
          long_term_medications?: string[] | null
          smoker?: boolean | null
          updated_at?: string | null
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          alcohol_drinker?: boolean | null
          blood_group?: string | null
          chronic_conditions?: string[] | null
          completed_at?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          family_history?: string[] | null
          full_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          location?: string | null
          long_term_medications?: string[] | null
          smoker?: boolean | null
          updated_at?: string | null
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          baseline_established: boolean | null
          blood_group: string | null
          bmi: number | null
          created_at: string | null
          email: string | null
          full_name: string | null
          gender: string | null
          genotype: string | null
          height_cm: number | null
          id: string
          onboarding_completed: boolean | null
          updated_at: string | null
          weight_kg: number | null
        }
        Insert: {
          age?: number | null
          baseline_established?: boolean | null
          blood_group?: string | null
          bmi?: number | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          genotype?: string | null
          height_cm?: number | null
          id: string
          onboarding_completed?: boolean | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Update: {
          age?: number | null
          baseline_established?: boolean | null
          blood_group?: string | null
          bmi?: number | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          genotype?: string | null
          height_cm?: number | null
          id?: string
          onboarding_completed?: boolean | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      symptom_assessments: {
        Row: {
          ai_diagnosis: string
          confidence_score: number | null
          created_at: string
          doctor_reviewed: boolean | null
          id: string
          recommendations: string[] | null
          suspected_conditions: string[] | null
          symptoms: string
          urgency_level: string | null
          user_id: string
        }
        Insert: {
          ai_diagnosis: string
          confidence_score?: number | null
          created_at?: string
          doctor_reviewed?: boolean | null
          id?: string
          recommendations?: string[] | null
          suspected_conditions?: string[] | null
          symptoms: string
          urgency_level?: string | null
          user_id: string
        }
        Update: {
          ai_diagnosis?: string
          confidence_score?: number | null
          created_at?: string
          doctor_reviewed?: boolean | null
          id?: string
          recommendations?: string[] | null
          suspected_conditions?: string[] | null
          symptoms?: string
          urgency_level?: string | null
          user_id?: string
        }
        Relationships: []
      }
      weekly_checkins: {
        Row: {
          average_sleep_hours: number | null
          completed_at: string | null
          created_at: string | null
          exercise_frequency_per_week: number | null
          family_history_updates: string[] | null
          fruit_vegetable_frequency: string | null
          id: string
          lifestyle_changes: string | null
          smoking_drinking_frequency: boolean | null
          stress_level: string | null
          user_id: string
          week_start_date: string
        }
        Insert: {
          average_sleep_hours?: number | null
          completed_at?: string | null
          created_at?: string | null
          exercise_frequency_per_week?: number | null
          family_history_updates?: string[] | null
          fruit_vegetable_frequency?: string | null
          id?: string
          lifestyle_changes?: string | null
          smoking_drinking_frequency?: boolean | null
          stress_level?: string | null
          user_id: string
          week_start_date: string
        }
        Update: {
          average_sleep_hours?: number | null
          completed_at?: string | null
          created_at?: string | null
          exercise_frequency_per_week?: number | null
          family_history_updates?: string[] | null
          fruit_vegetable_frequency?: string | null
          id?: string
          lifestyle_changes?: string | null
          smoking_drinking_frequency?: boolean | null
          stress_level?: string | null
          user_id?: string
          week_start_date?: string
        }
        Relationships: []
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
    Enums: {},
  },
} as const
