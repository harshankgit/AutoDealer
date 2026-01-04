import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, CreditCard, User, Shield, CheckCircle, Clock, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface BookingsHelpProps {
  language: 'en' | 'hi';
}

const BookingsHelp: React.FC<BookingsHelpProps> = ({ language }) => {
  const translations = {
    en: {
      title: 'Bookings & Payments',
      description: 'Learn how to manage your car bookings and payments',
      bookingProcess: 'Booking Process',
      bookingSteps: [
        'Browse available cars in rooms',
        'Select your preferred car',
        'Choose booking dates',
        'Complete payment securely',
        'Verify payment using scanner (if required)',
        'Receive booking confirmation',
        'Manage your bookings in profile'
      ],
      paymentMethods: 'Payment Methods',
      paymentOptions: [
        'Credit/Debit Cards',
        'Net Banking',
        'UPI Payments',
        'Digital Wallets',
        'Scanner Payment Verification'
      ],
      security: 'Security & Privacy',
      securityFeatures: [
        'Encrypted payment processing',
        'PCI DSS compliance',
        'Secure data storage',
        'Two-factor authentication',
        'Scanner verification for payments',
        'Real-time fraud detection'
      ]
    },
    hi: {
      title: 'बुकिंग और भुगतान',
      description: 'अपनी कार बुकिंग और भुगतान प्रबंधित करने के बारे में जानें',
      bookingProcess: 'बुकिंग प्रक्रिया',
      bookingSteps: [
        'कमरों में उपलब्ध कारों को ब्राउज़ करें',
        'अपनी पसंदीदा कार का चयन करें',
        'बुकिंग तिथियां चुनें',
        'सुरक्षित रूप से भुगतान पूरा करें',
        'भुगतान को स्कैनर का उपयोग करके सत्यापित करें (यदि आवश्यक हो)',
        'बुकिंग पुष्टिकरण प्राप्त करें',
        'प्रोफ़ाइल में अपनी बुकिंग प्रबंधित करें'
      ],
      paymentMethods: 'भुगतान के तरीके',
      paymentOptions: [
        'क्रेडिट/डेबिट कार्ड',
        'नेट बैंकिंग',
        'यूपीआई भुगतान',
        'डिजिटल वॉलेट',
        'स्कैनर भुगतान सत्यापन'
      ],
      security: 'सुरक्षा और गोपनीयता',
      securityFeatures: [
        'एन्क्रिप्टेड भुगतान प्रसंस्करण',
        'पीसीआई डीएसएस अनुपालन',
        'सुरक्षित डेटा संग्रहण',
        'दो-कारक प्रमाणीकरण',
        'भुगतान के लिए स्कैनर सत्यापन',
        'वास्तविक समय धोखाधड़ी का पता लगाना'
      ]
    }
  };

  const t = translations[language];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3"
      >
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-xl shadow-lg">
          <Calendar className="h-6 w-6 text-white" />
        </div>
        <div>
          <CardTitle className="text-2xl">{t.title}</CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <CardTitle>{t.bookingProcess}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {t.bookingSteps.map((step, index) => (
                <motion.li
                  key={index}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className="bg-purple-100 dark:bg-purple-900/50 w-6 h-6 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-purple-700 dark:text-purple-300">{index + 1}</span>
                    </div>
                  </div>
                  <span className="pt-1">{step}</span>
                </motion.li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CardTitle>{t.paymentMethods}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {t.paymentOptions.map((option, index) => (
                <motion.li
                  key={index}
                  className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{option}</span>
                </motion.li>
              ))}
            </ul>
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
              <Lock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <CardTitle>{t.security}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {t.securityFeatures.map((feature, index) => (
                <motion.li
                  key={index}
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <Shield className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default BookingsHelp;