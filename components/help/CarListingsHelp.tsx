'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Car } from 'lucide-react';

interface CarListingsHelpProps {
  language: 'en' | 'hi';
}

export default function CarListingsHelp({ language }: CarListingsHelpProps) {
  // Translation helper function
  const t = (en: string, hi: string) => language === 'en' ? en : hi;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Car className="h-6 w-6" />
        {t('Car Listings', 'कार सूचियां')}
      </h2>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('Adding New Cars', 'नई कारें जोड़ना')}</CardTitle>
            <CardDescription>
              {t('How to create and manage car listings', 'कार सूचियां कैसे बनाएं और प्रबंधित करें')}
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
                    {t('Access Dashboard:', 'डैशबोर्ड तक पहुंच:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Go to Admin Dashboard → Add Car' 
                    : ' एडमिन डैशबोर्ड पर जाएं → कार जोड़ें'}
                </li>
                <li>
                  <strong>
                    {t('Basic Information:', 'मूल जानकारी:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Fill in car title, brand, model, and manufacturing year' 
                    : ' कार का शीर्षक, ब्रांड, मॉडल और निर्माण वर्ष भरें'}
                </li>
                <li>
                  <strong>
                    {t('Technical Specifications:', 'तकनीकी विनिर्देश:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Enter mileage, fuel type, transmission, and ownership history' 
                    : ' माइलेज, ईंधन प्रकार, ट्रांसमिशन और स्वामित्व इतिहास दर्ज करें'}
                </li>
                <li>
                  <strong>
                    {t('Pricing Details:', 'मूल्य विवरण:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Set the asking price and any special pricing information' 
                    : ' पूछे जाने वाली कीमत और कोई विशेष मूल्य जानकारी सेट करें'}
                </li>
                <li>
                  <strong>
                    {t('Visual Content:', 'दृश्य सामग्री:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Upload high-quality images from multiple angles' 
                    : ' कई कोणों से उच्च गुणवत्ता वाली छवियां अपलोड करें'}
                </li>
                <li>
                  <strong>
                    {t('Location Assignment:', 'स्थान असाइनमेंट:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Select the room where the car will be listed' 
                    : ' उस कमरे का चयन करें जहां कार सूचीबद्ध की जाएगी'}
                </li>
                <li>
                  <strong>
                    {t('Availability Status:', 'उपलब्धता स्थिति:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Set status as Available, Pending, or Sold' 
                    : ' स्थिति को उपलब्ध, लंबित या बेचा गया के रूप में सेट करें'}
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">
                {t('Required Car Information:', 'आवश्यक कार जानकारी:')}
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>
                  <strong>
                    {t('Identification:', 'पहचान:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Title, brand, model, year of manufacture' 
                    : ' शीर्षक, ब्रांड, मॉडल, निर्माण का वर्ष'}
                </li>
                <li>
                  <strong>
                    {t('Technical Specs:', 'तकनीकी विनिर्देश:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Mileage, fuel type, transmission, engine details' 
                    : ' माइलेज, ईंधन प्रकार, ट्रांसमिशन, इंजन विवरण'}
                </li>
                <li>
                  <strong>
                    {t('Condition & History:', 'स्थिति और इतिहास:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Overall condition, ownership history, accident records' 
                    : ' समग्र स्थिति, स्वामित्व इतिहास, दुर्घटना रिकॉर्ड'}
                </li>
                <li>
                  <strong>
                    {t('Financial Info:', 'वित्तीय जानकारी:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Asking price, financing options, trade-in acceptance' 
                    : ' पूछे जाने वाली कीमत, वित्त पर्याप्तता विकल्प, ट्रेड-इन स्वीकृति'}
                </li>
                <li>
                  <strong>
                    {t('Visual Documentation:', 'दृश्य दस्तावेज़ीकरण:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Multiple high-resolution images (exterior, interior, engine)' 
                    : ' कई उच्च-रिज़ॉल्यूशन छवियां (बाहरी, आंतरिक, इंजन)'}
                </li>
                <li>
                  <strong>
                    {t('Detailed Description:', 'विस्तृत विवरण:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Features, options, maintenance history, special notes' 
                    : ' सुविधाएं, विकल्प, रखरखाव इतिहास, विशेष नोट्स'}
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {t('Car Listing Features', 'कार सूची सुविधाएं')}
            </CardTitle>
            <CardDescription>
              {t('Advanced tools for car management', 'कार प्रबंधन के लिए उन्नत उपकरण')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">
                {t('Listing Management:', 'सूची प्रबंधन:')}
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>
                  <strong>
                    {t('Image Gallery:', 'छवि गैलरी:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Upload multiple images with zoom functionality' 
                    : ' ज़ूम कार्यक्षमता के साथ कई छवियां अपलोड करें'}
                </li>
                <li>
                  <strong>
                    {t('Specification Editor:', 'विनिर्देश संपादक:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Add detailed technical specifications' 
                    : ' विस्तृत तकनीकी विनिर्देश जोड़ें'}
                </li>
                <li>
                  <strong>
                    {t('Price Adjustments:', 'मूल्य समायोजन:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Update pricing with historical tracking' 
                    : ' ऐतिहासिक ट्रैकिंग के साथ मूल्य अपडेट करें'}
                </li>
                <li>
                  <strong>
                    {t('Availability Control:', 'उपलब्धता नियंत्रण:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Mark as available, reserved, or sold' 
                    : ' उपलब्ध, आरक्षित या बेचा गया के रूप में चिह्नित करें'}
                </li>
                <li>
                  <strong>
                    {t('Feature Highlighting:', 'सुविधा हाइलाइटिंग:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Emphasize special features or deals' 
                    : ' विशेष सुविधाओं या सौदों पर ज़ोर दें'}
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">
                {t('Integration Features:', 'एकीकरण सुविधाएं:')}
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>
                  <strong>
                    {t('Room Association:', 'कमरा संबंध:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Link cars to specific rooms for targeted visibility' 
                    : ' लक्षित दृश्यता के लिए कारों को विशिष्ट कमरों से जोड़ें'}
                </li>
                <li>
                  <strong>
                    {t('Chat Integration:', 'चैट एकीकरण:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Enable users to request details directly from listings' 
                    : ' उपयोगकर्ताओं को सूचियों से सीधे विवरण का अनुरोध करने की अनुमति दें'}
                </li>
                <li>
                  <strong>
                    {t('Booking Connection:', 'बुकिंग कनेक्शन:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Allow direct booking from car listings' 
                    : ' कार सूचियों से सीधी बुकिंग की अनुमति दें'}
                </li>
                <li>
                  <strong>
                    {t('Analytics Tracking:', 'विश्लेषिकी ट्रैकिंग:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Monitor views, inquiries, and interest levels' 
                    : ' दृश्य, पूछताछ और रुचि स्तरों की निगरानी करें'}
                </li>
                <li>
                  <strong>
                    {t('Search Optimization:', 'खोज अनुकूलन:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Make listings discoverable through filters' 
                    : ' फ़िल्टर के माध्यम से सूचियों को खोजने योग्य बनाएं'}
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
              {t('Maximize your car listing effectiveness', 'अपनी कार सूची की प्रभावशीलता अधिकतम करें')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">
                {t('Listing Optimization Tips:', 'सूची अनुकूलन युक्तियां:')}
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>
                  <strong>
                    {t('High-Quality Photography:', 'उच्च गुणवत्ता वाला फ़ोटोग्राफी:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Use well-lit, high-resolution images from multiple angles' 
                    : ' कई कोणों से अच्छी तरह से रोशनी वाली, उच्च-रिज़ॉल्यूशन छवियों का उपयोग करें'}
                </li>
                <li>
                  <strong>
                    {t('Detailed Descriptions:', 'विस्तृत विवरण:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Include all relevant information about the car\'s condition' 
                    : ' कार की स्थिति के बारे में सभी प्रासंगिक जानकारी शामिल करें'}
                </li>
                <li>
                  <strong>
                    {t('Accurate Specifications:', 'सटीक विनिर्देश:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Ensure all technical details are correct and complete' 
                    : ' सुनिश्चित करें कि सभी तकनीकी विवरण सही और पूर्ण हैं'}
                </li>
                <li>
                  <strong>
                    {t('Competitive Pricing:', 'प्रतिस्पर्धात्मक मूल्य निर्धारण:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Research market values for similar vehicles' 
                    : ' समान वाहनों के लिए बाजार मूल्यों का अध्ययन करें'}
                </li>
                <li>
                  <strong>
                    {t('Regular Updates:', 'नियमित अपडेट:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Keep listings current and mark sold cars immediately' 
                    : ' सूचियों को वर्तमान रखें और बेची गई कारों को तुरंत चिह्नित करें'}
                </li>
                <li>
                  <strong>
                    {t('Honest Representation:', 'ईमानदार प्रतिनिधित्व:')}
                  </strong> 
                  {language === 'en' 
                    ? ' Be transparent about any issues or needed repairs' 
                    : ' किसी भी समस्या या आवश्यक मरम्मत के बारे में पारदर्शी रहें'}
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
                    ? 'Using low-quality or misleading photos' 
                    : 'निम्न गुणवत्ता या भ्रामक फ़ोटो का उपयोग करना'}
                </li>
                <li>
                  {language === 'en' 
                    ? 'Omitting important details about the car\'s condition' 
                    : 'कार की स्थिति के बारे में महत्वपूर्ण विवरण छोड़ना'}
                </li>
                <li>
                  {language === 'en' 
                    ? 'Setting unrealistic prices that don\'t match market value' 
                    : 'बाजार मूल्य से मेल न रखने वाली अवास्तविक कीमतें निर्धारित करना'}
                </li>
                <li>
                  {language === 'en' 
                    ? 'Failing to update availability status when a car is sold' 
                    : 'कार बेचे जाने पर उपलब्धता स्थिति अपडेट करने में विफल'}
                </li>
                <li>
                  {language === 'en' 
                    ? 'Providing incomplete or inaccurate technical specifications' 
                    : 'अपूर्ण या असटीक तकनीकी विनिर्देश प्रदान करना'}
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}