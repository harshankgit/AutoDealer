import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Key, User, Shield, Mail, Lock, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuthHelpProps {
  language: 'en' | 'hi';
}

const AuthHelp: React.FC<AuthHelpProps> = ({ language }) => {
  const translations = {
    en: {
      title: 'Authentication',
      description: 'Learn about login, registration, and account management',
      loginProcess: 'Login Process',
      loginSteps: [
        'Enter your registered email address',
        'Enter your password',
        'Click on the login button',
        'Complete two-factor authentication if enabled',
        'Access your account dashboard'
      ],
      registration: 'Registration Process',
      registrationSteps: [
        'Click on the "Sign Up" button',
        'Enter your personal information',
        'Verify your email address',
        'Set a strong password',
        'Complete profile setup',
        'Start using the platform'
      ],
      password: 'Password Management',
      passwordTips: [
        'Use at least 8 characters',
        'Include uppercase and lowercase letters',
        'Add numbers and special characters',
        'Avoid common words or phrases',
        'Change passwords regularly',
        'Use unique passwords for different accounts'
      ],
      security: 'Account Security',
      securityFeatures: [
        'Two-factor authentication',
        'Email verification',
        'Password strength requirements',
        'Suspicious login detection',
        'Account lockout protection',
        'Secure session management'
      ]
    },
    hi: {
      title: 'प्रमाणीकरण',
      description: 'लॉगिन, पंजीकरण और खाता प्रबंधन के बारे में जानें',
      loginProcess: 'लॉगिन प्रक्रिया',
      loginSteps: [
        'अपना पंजीकृत ईमेल पता दर्ज करें',
        'अपना पासवर्ड दर्ज करें',
        'लॉगिन बटन पर क्लिक करें',
        'यदि सक्षम हो तो दो-कारक प्रमाणीकरण पूरा करें',
        'अपने खाता डैशबोर्ड तक पहुंचें'
      ],
      registration: 'पंजीकरण प्रक्रिया',
      registrationSteps: [
        '"साइन अप" बटन पर क्लिक करें',
        'अपनी व्यक्तिगत जानकारी दर्ज करें',
        'अपना ईमेल पता सत्यापित करें',
        'एक मजबूत पासवर्ड सेट करें',
        'प्रोफ़ाइल सेटअप पूरा करें',
        'प्लेटफॉर्म का उपयोग शुरू करें'
      ],
      password: 'पासवर्ड प्रबंधन',
      passwordTips: [
        'कम से कम 8 वर्णों का उपयोग करें',
        'अपरकेस और लोअरकेस अक्षर शामिल करें',
        'संख्याएं और विशेष वर्ण जोड़ें',
        'सामान्य शब्दों या वाक्यांशों से बचें',
        'नियमित रूप से पासवर्ड बदलें',
        'अलग-अलग खातों के लिए अद्वितीय पासवर्ड का उपयोग करें'
      ],
      security: 'खाता सुरक्षा',
      securityFeatures: [
        'दो-कारक प्रमाणीकरण',
        'ईमेल सत्यापन',
        'पासवर्ड शक्ति आवश्यकताएं',
        'संदिग्ध लॉगिन का पता लगाना',
        'खाता लॉकआउट सुरक्षा',
        'सुरक्षित सत्र प्रबंधन'
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
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl shadow-lg">
          <Key className="h-6 w-6 text-white" />
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
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-indigo-50 dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <LogIn className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <CardTitle>{t.loginProcess}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {t.loginSteps.map((step, index) => (
                <motion.li
                  key={index}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className="bg-indigo-100 dark:bg-indigo-900/50 w-6 h-6 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">{index + 1}</span>
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
              <UserPlus className="h-5 w-5 text-green-600 dark:text-green-400" />
              <CardTitle>{t.registration}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {t.registrationSteps.map((step, index) => (
                <motion.li
                  key={index}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className="bg-green-100 dark:bg-green-900/50 w-6 h-6 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-green-700 dark:text-green-300">{index + 1}</span>
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
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-red-50 dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-600 dark:text-red-400" />
              <CardTitle>{t.password}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {t.passwordTips.map((tip, index) => (
                <motion.li
                  key={index}
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>{tip}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-orange-50 dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-600 dark:text-orange-400" />
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

export default AuthHelp;