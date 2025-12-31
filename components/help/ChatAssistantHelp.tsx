'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, User, Shield, Car, Users, FileText, Clock, CheckCircle, Eye, Send, FileImage, Search, Archive, Bell, Circle, FileCheck, EyeOff, Lock, ArchiveX, MessageSquare, FileScan } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatAssistantHelpProps {
  language: 'en' | 'hi';
}

export default function ChatAssistantHelp({ language }: ChatAssistantHelpProps) {
  // Translation helper function
  const t = (en: string, hi: string) => language === 'en' ? en : hi;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3"
      >
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
          <MessageCircle className="h-6 w-6 text-white" />
        </div>
        <div>
          <CardTitle className="text-2xl">{t('Chat Assistant', 'चैट सहायक')}</CardTitle>
          <CardDescription>{t('Learn how to use the chat system effectively', 'चैट सिस्टम को प्रभावी ढंग से उपयोग करने के बारे में जानें')}</CardDescription>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <CardTitle>{t('Getting Started', 'शुरू करना')}</CardTitle>
            </div>
            <CardDescription>
              {t('How to use the chat system', 'चैट सिस्टम का उपयोग कैसे करें')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <User className="h-4 w-4 text-blue-500" />
                {t('For Users:', 'उपयोगकर्ताओं के लिए:')}
              </h3>
              <ul className="space-y-3">
                <motion.li
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <div className="mt-1 bg-blue-100 dark:bg-blue-900/50 p-1 rounded-full">
                    <Send className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <strong>
                      {t('Joining Rooms:', 'कमरे ज्वाइन करना:')}
                    </strong>
                    {language === 'en'
                      ? ' Browse available rooms and join one to start chatting with the admin'
                      : ' उपलब्ध कमरों को ब्राउज़ करें और एडमिन के साथ चैटिंग शुरू करने के लिए एक में शामिल हों'}
                  </div>
                </motion.li>
                <motion.li
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <div className="mt-1 bg-blue-100 dark:bg-blue-900/50 p-1 rounded-full">
                    <Send className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <strong>
                      {t('Asking Questions:', 'प्रश्न पूछना:')}
                    </strong>
                    {language === 'en'
                      ? ' Type your questions about cars, pricing, availability, or any other details in the chat'
                      : ' चैट में कारों, मूल्य, उपलब्धता या किसी अन्य विवरण के बारे में अपने प्रश्न टाइप करें'}
                  </div>
                </motion.li>
                <motion.li
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <div className="mt-1 bg-blue-100 dark:bg-blue-900/50 p-1 rounded-full">
                    <Car className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <strong>
                      {t('Car Details:', 'कार का विवरण:')}
                    </strong>
                    {language === 'en'
                      ? ' Request specific car information by mentioning the car name or asking for details'
                      : ' कार का नाम उल्लेख करके या विवरण के लिए पूछकर विशिष्ट कार जानकारी का अनुरोध करें'}
                  </div>
                </motion.li>
                <motion.li
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <div className="mt-1 bg-blue-100 dark:bg-blue-900/50 p-1 rounded-full">
                    <FileImage className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <strong>
                      {t('File Sharing:', 'फ़ाइल साझा करना:')}
                    </strong>
                    {language === 'en'
                      ? ' Send images or documents to the admin if needed for your inquiry'
                      : ' अपनी पूछताछ के लिए आवश्यकता पड़ने पर एडमिन को छवियां या दस्तावेज़ भेजें'}
                  </div>
                </motion.li>
                <motion.li
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <div className="mt-1 bg-blue-100 dark:bg-blue-900/50 p-1 rounded-full">
                    <Clock className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <strong>
                      {t('Real-time Communication:', 'रीयल-टाइम संचार:')}
                    </strong>
                    {language === 'en'
                      ? ' Get instant responses from admins during their active hours'
                      : ' उनके सक्रिय घंटों के दौरान एडमिन से त्वरित प्रतिक्रिया प्राप्त करें'}
                  </div>
                </motion.li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                {t('For Admins:', 'एडमिन के लिए:')}
              </h3>
              <ul className="space-y-3">
                <motion.li
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                >
                  <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                    <Users className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <strong>
                      {t('Manage Conversations:', 'बातचीत प्रबंधित करें:')}
                    </strong>
                    {language === 'en'
                      ? ' View all active chats in your rooms and respond to user inquiries'
                      : ' अपने कमरों में सभी सक्रिय चैट देखें और उपयोगकर्ता की पूछताछ का उत्तर दें'}
                  </div>
                </motion.li>
                <motion.li
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.7 }}
                >
                  <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                    <Car className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <strong>
                      {t('Share Car Information:', 'कार की जानकारी साझा करें:')}
                    </strong>
                    {language === 'en'
                      ? ' Send detailed car information, specifications, and images directly in chat'
                      : ' विस्तृत कार जानकारी, विनिर्देश और छवियां सीधे चैट में भेजें'}
                  </div>
                </motion.li>
                <motion.li
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.8 }}
                >
                  <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                    <FileScan className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <strong>
                      {t('Document Verification:', 'दस्तावेज़ सत्यापन:')}
                    </strong>
                    {language === 'en'
                      ? ' Use the scanner feature to verify documents shared by users'
                      : ' उपयोगकर्ताओं द्वारा साझा किए गए दस्तावेज़ों को सत्यापित करने के लिए स्कैनर सुविधा का उपयोग करें'}
                  </div>
                </motion.li>
                <motion.li
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.9 }}
                >
                  <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                    <Eye className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <strong>
                      {t('Track Interactions:', 'बातचीतों को ट्रैक करें:')}
                    </strong>
                    {language === 'en'
                      ? ' Monitor user engagement and frequently asked questions'
                      : ' उपयोगकर्ता की भागीदारी और अक्सर पूछे जाने वाले प्रश्नों की निगरानी करें'}
                  </div>
                </motion.li>
                <motion.li
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 1.0 }}
                >
                  <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                    <Users className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <strong>
                      {t('Multi-room Management:', 'बहु-कमरा प्रबंधन:')}
                    </strong>
                    {language === 'en'
                      ? ' Handle conversations across multiple rooms simultaneously'
                      : ' एक साथ कई कमरों में बातचीत संभालें'}
                  </div>
                </motion.li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <CardTitle>{t('Features & Capabilities', 'सुविधाएं और क्षमताएं')}</CardTitle>
            </div>
            <CardDescription>
              {t('Detailed functionality breakdown', 'विस्तृत कार्यक्षमता विभाजन')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                {t('Real-time Communication:', 'रीयल-टाइम संचार:')}
              </h3>
              <ul className="space-y-3">
                <motion.li
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <div className="mt-1 bg-blue-100 dark:bg-blue-900/50 p-1 rounded-full">
                    <Circle className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <strong>
                      {t('Typing Indicators:', 'टाइपिंग संकेतक:')}
                    </strong>
                    {language === 'en'
                      ? ' See when the other person is typing a message'
                      : ' देखें कि दूसरा व्यक्ति कब संदेश टाइप कर रहा है'}
                  </div>
                </motion.li>
                <motion.li
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <div className="mt-1 bg-blue-100 dark:bg-blue-900/50 p-1 rounded-full">
                    <Eye className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <strong>
                      {t('Read Receipts:', 'पढ़े जाने की पुष्टि:')}
                    </strong>
                    {language === 'en'
                      ? ' Know when your messages have been read'
                      : ' जानें कि आपके संदेश पढ़े जा चुके हैं'}
                  </div>
                </motion.li>
                <motion.li
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <div className="mt-1 bg-blue-100 dark:bg-blue-900/50 p-1 rounded-full">
                    <Circle className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <strong>
                      {t('Online Status:', 'ऑनलाइन स्थिति:')}
                    </strong>
                    {language === 'en'
                      ? ' Check if admins/users are currently online'
                      : ' जांचें कि क्या एडमिन/उपयोगकर्ता वर्तमान में ऑनलाइन हैं'}
                  </div>
                </motion.li>
                <motion.li
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <div className="mt-1 bg-blue-100 dark:bg-blue-900/50 p-1 rounded-full">
                    <Bell className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <strong>
                      {t('Notifications:', 'सूचनाएं:')}
                    </strong>
                    {language === 'en'
                      ? ' Get alerts for new messages when you\'re away'
                      : ' जब आप दूर हों तो नए संदेशों के लिए अलर्ट प्राप्त करें'}
                  </div>
                </motion.li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FileImage className="h-4 w-4 text-green-500" />
                {t('File & Media Sharing:', 'फ़ाइल और मीडिया साझाकरण:')}
              </h3>
              <ul className="space-y-3">
                <motion.li
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                    <FileImage className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <strong>
                      {t('Image Sharing:', 'छवि साझाकरण:')}
                    </strong>
                    {language === 'en'
                      ? ' Send and receive car photos and documents'
                      : ' कार की तस्वीरें और दस्तावेज़ भेजें और प्राप्त करें'}
                  </div>
                </motion.li>
                <motion.li
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                >
                  <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                    <FileText className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <strong>
                      {t('Document Upload:', 'दस्तावेज़ अपलोड:')}
                    </strong>
                    {language === 'en'
                      ? ' Share PDFs, contracts, or other important files'
                      : ' पीडीएफ़, अनुबंध या अन्य महत्वपूर्ण फ़ाइलें साझा करें'}
                  </div>
                </motion.li>
                <motion.li
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.7 }}
                >
                  <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                    <Eye className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <strong>
                      {t('File Previews:', 'फ़ाइल पूर्वावलोकन:')}
                    </strong>
                    {language === 'en'
                      ? ' View shared content without downloading'
                      : ' डाउनलोड किए बिना साझा की गई सामग्री देखें'}
                  </div>
                </motion.li>
                <motion.li
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.8 }}
                >
                  <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                    <Lock className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <strong>
                      {t('Secure Transfer:', 'सुरक्षित स्थानांतरण:')}
                    </strong>
                    {language === 'en'
                      ? ' All files are securely transmitted and stored'
                      : ' सभी फ़ाइलें सुरक्षित रूप से प्रेषित और संग्रहीत की जाती हैं'}
                  </div>
                </motion.li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Archive className="h-4 w-4 text-purple-500" />
                {t('Conversation Management:', 'बातचीत प्रबंधन:')}
              </h3>
              <ul className="space-y-3">
                <motion.li
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.9 }}
                >
                  <div className="mt-1 bg-purple-100 dark:bg-purple-900/50 p-1 rounded-full">
                    <MessageCircle className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <strong>
                      {t('Message History:', 'संदेश इतिहास:')}
                    </strong>
                    {language === 'en'
                      ? ' Access all previous conversations with users'
                      : ' उपयोगकर्ताओं के साथ सभी पिछली बातचीत तक पहुंच प्राप्त करें'}
                  </div>
                </motion.li>
                <motion.li
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 1.0 }}
                >
                  <div className="mt-1 bg-purple-100 dark:bg-purple-900/50 p-1 rounded-full">
                    <Search className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <strong>
                      {t('Search Functionality:', 'खोज कार्यक्षमता:')}
                    </strong>
                    {language === 'en'
                      ? ' Find specific messages or conversations'
                      : ' विशिष्ट संदेश या बातचीत ढूढें'}
                  </div>
                </motion.li>
                <motion.li
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 1.1 }}
                >
                  <div className="mt-1 bg-purple-100 dark:bg-purple-900/50 p-1 rounded-full">
                    <ArchiveX className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <strong>
                      {t('Conversation Archiving:', 'बातचीत संग्रह:')}
                    </strong>
                    {language === 'en'
                      ? ' Organize and store completed conversations'
                      : ' पूर्ण बातचीत को व्यवस्थित और संग्रहीत करें'}
                  </div>
                </motion.li>
                <motion.li
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 1.2 }}
                >
                  <div className="mt-1 bg-purple-100 dark:bg-purple-900/50 p-1 rounded-full">
                    <MessageSquare className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <strong>
                      {t('Quick Responses:', 'त्वरित प्रतिक्रियाएं:')}
                    </strong>
                    {language === 'en'
                      ? ' Use saved templates for common questions'
                      : ' सामान्य प्रश्नों के लिए सहेजे गए टेम्पलेट का उपयोग करें'}
                  </div>
                </motion.li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-orange-50 dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <CardTitle>{t('Troubleshooting & Best Practices', 'समस्या निवारण और सर्वोत्तम प्रथाएं')}</CardTitle>
            </div>
            <CardDescription>
              {t('Common issues and optimization tips', 'सामान्य समस्याएं और अनुकूलन युक्तियां')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <User className="h-4 w-4 text-blue-500" />
                {t('Best Practices for Users:', 'उपयोगकर्ताओं के लिए सर्वोत्तम प्रथाएं:')}
              </h3>
              <ul className="space-y-3">
                <motion.li
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <div className="mt-1 bg-blue-100 dark:bg-blue-900/50 p-1 rounded-full">
                    <CheckCircle className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    {language === 'en'
                      ? 'Be specific about the car you\'re interested in'
                      : 'उस कार के बारे में विशिष्ट रहें जिसमें आपकी रुचि है'}
                  </div>
                </motion.li>
                <motion.li
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <div className="mt-1 bg-blue-100 dark:bg-blue-900/50 p-1 rounded-full">
                    <CheckCircle className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    {language === 'en'
                      ? 'Ask about pricing, condition, and availability upfront'
                      : 'मूल्य, स्थिति और उपलब्धता के बारे में पहले से पूछें'}
                  </div>
                </motion.li>
                <motion.li
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <div className="mt-1 bg-blue-100 dark:bg-blue-900/50 p-1 rounded-full">
                    <FileText className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    {language === 'en'
                      ? 'Share relevant documents if you need financing assistance'
                      : 'यदि आपको वित्तीय सहायता की आवश्यकता है तो संबंधित दस्तावेज़ साझा करें'}
                  </div>
                </motion.li>
                <motion.li
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <div className="mt-1 bg-blue-100 dark:bg-blue-900/50 p-1 rounded-full">
                    <CheckCircle className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    {language === 'en'
                      ? 'Be respectful and patient with admin response times'
                      : 'एडमिन प्रतिक्रिया समय के साथ सम्मानजनक और धैर्य रखें'}
                  </div>
                </motion.li>
                <motion.li
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <div className="mt-1 bg-blue-100 dark:bg-blue-900/50 p-1 rounded-full">
                    <MessageCircle className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    {language === 'en'
                      ? 'Use the chat to clarify any doubts before booking'
                      : 'बुकिंग से पहले कोई भी संदेह स्पष्ट करने के लिए चैट का उपयोग करें'}
                  </div>
                </motion.li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                {t('Best Practices for Admins:', 'एडमिन के लिए सर्वोत्तम प्रथाएं:')}
              </h3>
              <ul className="space-y-3">
                <motion.li
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                >
                  <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                    <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    {language === 'en'
                      ? 'Respond promptly to user inquiries to maintain engagement'
                      : 'संलग्नता बनाए रखने के लिए उपयोगकर्ता की पूछताछ का त्वरित उत्तर दें'}
                  </div>
                </motion.li>
                <motion.li
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.7 }}
                >
                  <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                    <Car className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    {language === 'en'
                      ? 'Provide detailed and accurate information about cars'
                      : 'कारों के बारे में विस्तृत और सटीक जानकारी प्रदान करें'}
                  </div>
                </motion.li>
                <motion.li
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.8 }}
                >
                  <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                    <Car className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    {language === 'en'
                      ? 'Use car cards and images to make conversations more visual'
                      : 'बातचीत को अधिक दृश्य बनाने के लिए कार कार्ड और छवियों का उपयोग करें'}
                  </div>
                </motion.li>
                <motion.li
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.9 }}
                >
                  <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                    <Eye className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    {language === 'en'
                      ? 'Keep track of frequently asked questions to improve service'
                      : 'सेवा में सुधार करने के लिए अक्सर पूछे जाने वाले प्रश्नों पर नज़र रखें'}
                  </div>
                </motion.li>
                <motion.li
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 1.0 }}
                >
                  <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                    <FileScan className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    {language === 'en'
                      ? 'Verify all documents shared by users through the scanner feature'
                      : 'स्कैनर सुविधा के माध्यम से उपयोगकर्ताओं द्वारा साझा किए गए सभी दस्तावेज़ों को सत्यापित करें'}
                  </div>
                </motion.li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}