import { supabase } from '@/lib/supabase/client';

interface ChatbotQA {
  id: string;
  question_en: string;
  question_hi: string;
  answer_en: string;
  answer_hi: string;
  category?: string;
  is_active: boolean;
  priority: number;
}

interface ChatbotGreeting {
  id: string;
  greeting_type: string;
  text_en: string;
  text_hi: string;
  is_active: boolean;
}

export const chatbotService = {
  /**
   * Fetch all active greetings based on selected language
   */
  async getGreetings(language: 'en' | 'hi'): Promise<ChatbotGreeting[]> {
    try {
      const { data, error } = await supabase
        .from('chatbot_greetings')
        .select('*')
        .eq('is_active', true)
        .order('id');

      if (error) {
        console.error('Error fetching greetings:', error);
        throw new Error(error.message);
      }

      return data || [];
    } catch (error: any) {
      console.error('Error in getGreetings:', error);
      throw error;
    }
  },

  /**
   * Fetch all active questions based on selected language
   */
  async getQuestions(language: 'en' | 'hi'): Promise<ChatbotQA[]> {
    try {
      const { data, error } = await supabase
        .from('chatbot_questions_answers')
        .select('*')
        .eq('is_active', true)
        .order('priority')
        .order('created_at');

      if (error) {
        console.error('Error fetching questions:', error);
        throw new Error(error.message);
      }

      return data || [];
    } catch (error: any) {
      console.error('Error in getQuestions:', error);
      throw error;
    }
  },

  /**
   * Get a specific answer based on question ID and language
   */
  async getAnswer(questionId: string, language: 'en' | 'hi'): Promise<ChatbotQA | null> {
    try {
      const { data, error } = await supabase
        .from('chatbot_questions_answers')
        .select('*')
        .eq('id', questionId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching answer:', error);
        if (error.code === 'PGRST116') {
          // Record not found
          return null;
        }
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      console.error('Error in getAnswer:', error);
      throw error;
    }
  },

  /**
   * Admin function: Add a new Q&A pair
   */
  async addQAPair(
    qaData: Omit<ChatbotQA, 'id' | 'created_at' | 'updated_at' | 'is_active'>
  ): Promise<ChatbotQA | null> {
    try {
      const { data, error } = await supabase
        .from('chatbot_questions_answers')
        .insert([{ ...qaData, is_active: true }])
        .select()
        .single();

      if (error) {
        console.error('Error adding Q&A pair:', error);
        throw new Error(error.message);
      }

      return data || null;
    } catch (error: any) {
      console.error('Error in addQAPair:', error);
      throw error;
    }
  },

  /**
   * Admin function: Update an existing Q&A pair
   */
  async updateQAPair(
    id: string,
    qaData: Partial<Omit<ChatbotQA, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<ChatbotQA | null> {
    try {
      const { data, error } = await supabase
        .from('chatbot_questions_answers')
        .update(qaData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating Q&A pair:', error);
        throw new Error(error.message);
      }

      return data || null;
    } catch (error: any) {
      console.error('Error in updateQAPair:', error);
      throw error;
    }
  },

  /**
   * Admin function: Toggle Q&A pair active status
   */
  async toggleQAStatus(id: string, isActive: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chatbot_questions_answers')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) {
        console.error('Error toggling Q&A status:', error);
        throw new Error(error.message);
      }

      return true;
    } catch (error: any) {
      console.error('Error in toggleQAStatus:', error);
      throw error;
    }
  },

  /**
   * Admin function: Add a new greeting
   */
  async addGreeting(
    greetingData: Omit<ChatbotGreeting, 'id' | 'created_at' | 'updated_at' | 'is_active'>
  ): Promise<ChatbotGreeting | null> {
    try {
      const { data, error } = await supabase
        .from('chatbot_greetings')
        .insert([{ ...greetingData, is_active: true }])
        .select()
        .single();

      if (error) {
        console.error('Error adding greeting:', error);
        throw new Error(error.message);
      }

      return data || null;
    } catch (error: any) {
      console.error('Error in addGreeting:', error);
      throw error;
    }
  },

  /**
   * Admin function: Update an existing greeting
   */
  async updateGreeting(
    id: string,
    greetingData: Partial<Omit<ChatbotGreeting, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<ChatbotGreeting | null> {
    try {
      const { data, error } = await supabase
        .from('chatbot_greetings')
        .update(greetingData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating greeting:', error);
        throw new Error(error.message);
      }

      return data || null;
    } catch (error: any) {
      console.error('Error in updateGreeting:', error);
      throw error;
    }
  },
};