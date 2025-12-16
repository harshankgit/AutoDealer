'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Bot, Send, User, X, MessageCircle, Globe } from 'lucide-react';
import { chatbotService } from '@/lib/supabase/services/chatbotService';

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
}

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

const ChatbotComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en'); // Default English
  const [messages, setMessages] = useState<Message[]>([]);
  const [questions, setQuestions] = useState<ChatbotQA[]>([]);
  const [inputValue, setInputValue] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [askedQuestionIds, setAskedQuestionIds] = useState<string[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<ChatbotQA | null>(null);

  // Load questions
  useEffect(() => {
    if (language && isOpen) {
      loadQuestions();
    }
  }, [language, isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      const questionsData = await chatbotService.getQuestions(language);
      setQuestions(questionsData);
    } catch (error) {
      console.error('Error loading questions:', error);
      // Add error message to chat
      setMessages(prev => [
        ...prev,
        {
          id: 'error-' + Date.now(),
          type: 'bot',
          text: language === 'en'
            ? 'Sorry, I could not load the questions. Please try again later.'
            : 'क्षमा करें, प्रश्न लोड नहीं किए जा सके। बाद में पुनः प्रयास करें।'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const startChat = (lang: 'en' | 'hi') => {
    setLanguage(lang);
    setMessages([]);
    setAskedQuestionIds([]); // Reset all question states when switching language

    // Add initial greeting
    setMessages([
      {
        id: 'initial-' + Date.now(),
        type: 'bot',
        text: lang === 'en'
          ? 'Hello! How can I assist you today?'
          : 'नमस्ते! आज मैं आपकी कैसे सहायता कर सकता हूँ?'
      }
    ]);

    // Load questions for selected language
    loadQuestions();
  };

  const onQuestionSelect = (q: ChatbotQA) => {
    // Add user message
    setMessages(prev => [
      ...prev,
      {
        id: 'u-' + q.id,
        type: 'user',
        text: language === 'en' ? q.question_en : q.question_hi
      }
    ]);

    // Add bot response after delay
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: 'a-' + q.id,
          type: 'bot',
          text: language === 'en' ? q.answer_en : q.answer_hi
        }
      ]);
    }, 400);

    // Mark question as asked
    setAskedQuestionIds(prev => [...prev, q.id]);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    setMessages(prev => [
      ...prev,
      {
        id: 'usr-' + Date.now(),
        type: 'user',
        text: inputValue
      }
    ]);

    // Add bot response
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: 'bot-' + Date.now(),
          type: 'bot',
          text: language === 'en'
            ? 'I am a chatbot and can only respond to predefined questions. Please select a question from the list below.'
            : 'मैं एक चैटबॉट हूं और केवल पूर्वनिर्धारित प्रश्नों का ही उत्तर दे सकता हूं। कृपया नीचे दी गई सूची से एक प्रश्न का चयन करें।'
        }
      ]);
    }, 400);

    setInputValue('');
  };

  const handleRestart = () => {
    startChat(language);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Initialize chat when opening
      if (messages.length === 0) {
        startChat(language);
      }
    }
  };

  return (
    <>
      {/* Floating Chat Icon */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={toggleChat}
          className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center bg-primary hover:bg-primary/90"
          aria-label={isOpen ? "Close chat" : "Open chat"}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>

      {/* Chat Window - Only render when open */}
      {isOpen && (
        <div
          className="
            fixed z-50
            inset-x-2 bottom-20
            sm:right-6 sm:left-auto
            w-[calc(100%-1rem)] sm:w-[380px]
            h-[85vh] sm:h-[60vh]
            flex flex-col
          "
        >
          {/* Chat Header */}
          <Card className="flex-1 flex flex-col border rounded-lg shadow-xl overflow-hidden h-full">
            <CardHeader className="p-4 bg-muted text-foreground flex flex-row items-center justify-between sticky top-0 z-10">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="h-5 w-5" />
                {language === 'en' ? 'Support Assistant' : 'सहायता सहायक'}
              </CardTitle>
              <div className="flex items-center gap-1">
                {/* Language Toggle */}
                <Button
                  size="sm"
                  variant={language === 'en' ? 'default' : 'secondary'}
                  onClick={() => startChat('en')}
                  className="h-8 px-2 text-xs"
                >
                  EN
                </Button>

                <Button
                  size="sm"
                  variant={language === 'hi' ? 'default' : 'secondary'}
                  onClick={() => startChat('hi')}
                  className="h-8 px-2 text-xs"
                >
                  HI
                </Button>

                {/* Restart */}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleRestart}
                  className="h-8 w-8 p-0"
                  aria-label="Restart chat"
                >
                  <Globe className="h-4 w-4" />
                </Button>

                {/* Close */}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={toggleChat}
                  className="h-8 w-8 p-0"
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0 flex-1 flex flex-col h-[calc(100%-60px)]">
              {/* Messages Area */}
              <ScrollArea className="flex-1 px-3 py-2">
                <div className="space-y-4">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[90%] sm:max-w-[80%] rounded-lg p-3 ${
                          m.type === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-none'
                            : 'bg-muted text-foreground rounded-bl-none'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {m.type === 'bot' && (
                            <Avatar className="h-6 w-6 flex-shrink-0">
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                <Bot className="h-3 w-3" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div>{m.text}</div>
                          {m.type === 'user' && (
                            <Avatar className="h-6 w-6 flex-shrink-0">
                              <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                                <User className="h-3 w-3" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-lg p-3 bg-muted text-foreground rounded-bl-none">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6 flex-shrink-0">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              <Bot className="h-3 w-3" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex space-x-1">
                            <div className="h-2 w-2 bg-foreground rounded-full animate-bounce"></div>
                            <div className="h-2 w-2 bg-foreground rounded-full animate-bounce delay-75"></div>
                            <div className="h-2 w-2 bg-foreground rounded-full animate-bounce delay-150"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={bottomRef} />
              </ScrollArea>

              {/* Question buttons */}
              <div className="p-3 border-t bg-background flex flex-wrap gap-2 max-h-40 sm:max-h-32 overflow-y-auto">
                <TooltipProvider>
                  {questions.map((q) => (
                    <Tooltip key={q.id}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (!askedQuestionIds.includes(q.id)) {
                              onQuestionSelect(q);
                            }
                          }}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            if (!askedQuestionIds.includes(q.id)) {
                              setSelectedQuestion(q);
                            }
                          }}
                          disabled={askedQuestionIds.includes(q.id)}
                          className={`w-full sm:w-[48%] text-left h-auto py-3 ${askedQuestionIds.includes(q.id) ? 'opacity-50' : ''}`}
                        >
                          <div className="truncate w-full">
                            {language === 'en' ? q.question_en : q.question_hi}
                          </div>
                          {q.category && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {q.category}
                            </Badge>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs text-sm bg-gray-800 text-white">
                        {language === 'en' ? q.question_en : q.question_hi}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>

              {/* Input Area - Hide text input for cleaner bot-only experience */}
              {false && (
                <div className="p-3 border-t bg-background flex gap-2 sticky bottom-0">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={
                      language === 'en'
                        ? 'Ask a question...'
                        : 'एक प्रश्न पूछें...'
                    }
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 text-base"
                  />
                  <Button onClick={handleSendMessage} disabled={!inputValue.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Question Detail Modal for Mobile */}
          <Dialog open={!!selectedQuestion} onOpenChange={() => setSelectedQuestion(null)}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg">
                  {language === 'en' ? 'Question' : 'प्रश्न'}
                </DialogTitle>
              </DialogHeader>
              <div className="py-2">
                <p className="text-base">
                  {selectedQuestion && (language === 'en' ? selectedQuestion.question_en : selectedQuestion.question_hi)}
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedQuestion(null)}
                >
                  {language === 'en' ? 'Cancel' : 'रद्द करें'}
                </Button>
                <Button
                  onClick={() => {
                    if (selectedQuestion) {
                      onQuestionSelect(selectedQuestion);
                      setSelectedQuestion(null);
                    }
                  }}
                >
                  {language === 'en' ? 'Select' : 'चुनें'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </>
  );
};

export default ChatbotComponent;