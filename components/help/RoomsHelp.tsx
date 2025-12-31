'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home } from 'lucide-react';

interface RoomsHelpProps {
  language: 'en' | 'hi';
}

export default function RoomsHelp({ language }: RoomsHelpProps) {
  // Translation helper function
  const t = (en: string, hi: string) => language === 'en' ? en : hi;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Home className="h-6 w-6" />
        {t('Rooms Management', 'कमरा प्रबंधन')}
      </h2>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('Creating Rooms', 'कमरे बनाना')}</CardTitle>
            <CardDescription>
              {t('How to create and manage your rooms', 'अपने कमरे कैसे बनाएं और प्रबंधित करें')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">
                {t('For Admins:', 'एडमिन के लिए:')}
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>
                  <strong>
                    {t('Navigate to Dashboard:', 'डैशबोर्ड पर जाएं:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Go to Admin Dashboard → Create Room' 
                    : ' एडमिन डैशबोर्ड पर जाएं → कमरा बनाएं'}
                </li>
                <li>
                  <strong>
                    {t('Basic Information:', 'मूल जानकारी:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Fill in room name, description, and location' 
                    : ' कमरे का नाम, विवरण और स्थान भरें'}
                </li>
                <li>
                  <strong>
                    {t('Contact Details:', 'संपर्क विवरण:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Add phone, email, or other contact information for users' 
                    : ' उपयोगकर्ताओं के लिए फोन, ईमेल या अन्य संपर्क जानकारी जोड़ें'}
                </li>
                <li>
                  <strong>
                    {t('Visual Appeal:', 'दृश्य आकर्षण:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Upload a high-quality room image to attract users' 
                    : ' उपयोगकर्ताओं को आकर्षित करने के लिए उच्च गुणवत्ता वाली कमरे की छवि अपलोड करें'}
                </li>
                <li>
                  <strong>
                    {t('Activation:', 'सक्रियण:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Save the room to make it active and visible to users' 
                    : ' उपयोगकर्ताओं के लिए सक्रिय और दृश्यमान बनाने के लिए कमरा सहेजें'}
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">
                {t('Room Settings & Configuration:', 'कमरा सेटिंग्स और विन्यास:')}
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>
                  <strong>
                    {t('Activation Control:', 'सक्रियण नियंत्रण:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Enable/disable room access for users' 
                    : ' उपयोगकर्ताओं के लिए कमरा एक्सेस सक्षम/अक्षम करें'}
                </li>
                <li>
                  <strong>
                    {t('Information Updates:', 'जानकारी अपडेट:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Modify room details anytime after creation' 
                    : ' निर्माण के बाद कभी भी कमरे के विवरण संशोधित करें'}
                </li>
                <li>
                  <strong>
                    {t('Activity Monitoring:', 'गतिविधि निगरानी:')}
                  </strong> 
                  {language === 'en' 
                    ? ' View room statistics and user engagement' 
                    : ' कमरे के आंकड़े और उपयोगकर्ता संलग्नता देखें'}
                </li>
                <li>
                  <strong>
                    {t('Access Management:', 'एक्सेस प्रबंधन:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Control user permissions and access levels' 
                    : ' उपयोगकर्ता अनुमतियां और एक्सेस स्तर नियंत्रित करें'}
                </li>
                <li>
                  <strong>
                    {t('Customization:', 'अनुकूलन:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Add custom instructions or guidelines for users' 
                    : ' उपयोगकर्ताओं के लिए कस्टम निर्देश या दिशानिर्देश जोड़ें'}
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {t('Room Management Features', 'कमरा प्रबंधन सुविधाएं')}
            </CardTitle>
            <CardDescription>
              {t('Advanced tools for room administration', 'कमरा प्रशासन के लिए उन्नत उपकरण')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">
                {t('Room Analytics:', 'कमरा विश्लेषिकी:')}
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>
                  <strong>
                    {t('Visitor Tracking:', 'आगंतुक ट्रैकिंग:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Monitor how many users visit your room' 
                    : ' निगरानी करें कि कितने उपयोगकर्ता आपके कमरे में आते हैं'}
                </li>
                <li>
                  <strong>
                    {t('Engagement Metrics:', 'संलग्नता मेट्रिक्स:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Track chat interactions and user activity' 
                    : ' चैट बातचीत और उपयोगकर्ता गतिविधि ट्रैक करें'}
                </li>
                <li>
                  <strong>
                    {t('Performance Insights:', 'प्रदर्शन अंतर्दृष्टि:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Analyze which cars generate most interest' 
                    : ' विश्लेषण करें कि कौन सी कारें सबसे अधिक रुचि उत्पन्न करती हैं'}
                </li>
                <li>
                  <strong>
                    {t('Time-based Reports:', 'समय-आधारित रिपोर्ट:')}
                  </strong> 
                  {language === 'en' 
                    ? ' View activity patterns and peak times' 
                    : ' गतिविधि पैटर्न और चरम समय देखें'}
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">
                {t('Content Management:', 'सामग्री प्रबंधन:')}
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>
                  <strong>
                    {t('Car Integration:', 'कार एकीकरण:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Link car listings directly to your room' 
                    : ' कार सूचियों को सीधे आपके कमरे से लिंक करें'}
                </li>
                <li>
                  <strong>
                    {t('Announcement System:', 'घोषणा प्रणाली:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Post important updates or promotions' 
                    : ' महत्वपूर्ण अपडेट या प्रचार पोस्ट करें'}
                </li>
                <li>
                  <strong>
                    {t('FAQ Section:', 'पूछे जाने वाले प्रश्न अनुभाग:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Add common questions and answers for users' 
                    : ' उपयोगकर्ताओं के लिए सामान्य प्रश्न और उत्तर जोड़ें'}
                </li>
                <li>
                  <strong>
                    {t('Document Repository:', 'दस्तावेज़ भंडार:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Share important documents with visitors' 
                    : ' आगंतुकों के साथ महत्वपूर्ण दस्तावेज़ साझा करें'}
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {t('Best Practices & Optimization', 'सर्वोत्तम प्रथाएं और अनुकूलन')}
            </CardTitle>
            <CardDescription>
              {t('Maximize your room\'s effectiveness', 'अपने कमरे की प्रभावशीलता अधिकतम करें')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">
                {t('Optimization Tips:', 'अनुकूलन युक्तियां:')}
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>
                  <strong>
                    {t('Compelling Titles:', 'आकर्षक शीर्षक:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Create room names that clearly indicate your specialty' 
                    : ' कमरे के नाम बनाएं जो स्पष्ट रूप से आपकी विशेषज्ञता को इंगित करते हों'}
                </li>
                <li>
                  <strong>
                    {t('Detailed Descriptions:', 'विस्तृत विवरण:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Explain what makes your inventory special' 
                    : ' स्पष्ट करें कि आपका सूची क्यों विशेष है'}
                </li>
                <li>
                  <strong>
                    {t('High-Quality Images:', 'उच्च गुणवत्ता वाली छवियां:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Use professional photos that showcase your space' 
                    : ' अपनी जगह को दिखाने वाली पेशेवर तस्वीरों का उपयोग करें'}
                </li>
                <li>
                  <strong>
                    {t('Regular Updates:', 'नियमित अपडेट:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Keep room information current with new inventory' 
                    : ' नई सूची के साथ कमरे की जानकारी अद्यतन रखें'}
                </li>
                <li>
                  <strong>
                    {t('Active Presence:', 'सक्रिय उपस्थिति:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Respond promptly to user inquiries to maintain engagement' 
                    : ' संलग्नता बनाए रखने के लिए उपयोगकर्ता की पूछताछ का त्वरित उत्तर दें'}
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">
                {t('Common Mistakes to Avoid:', 'बचने के लिए सामान्य गलतियां:')}
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>
                  {language === 'en' 
                    ? 'Leaving room information outdated' 
                    : 'कमरे की जानकारी पुरानी छोड़ना'}
                </li>
                <li>
                  {language === 'en' 
                    ? 'Not responding to user messages in a timely manner' 
                    : 'उपयोगकर्ता संदेशों का समय पर उत्तर न देना'}
                </li>
                <li>
                  {language === 'en' 
                    ? 'Using low-quality or misleading images' 
                    : 'निम्न गुणवत्ता या भ्रामक छवियों का उपयोग करना'}
                </li>
                <li>
                  {language === 'en' 
                    ? 'Having inconsistent car inventory information' 
                    : 'असंगत कार सूची जानकारी होना'}
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}