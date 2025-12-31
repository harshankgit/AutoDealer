import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Shield, Key, CreditCard, Home, Settings, Eye, Bell, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProfileHelpProps {
  language: 'en' | 'hi';
}

const ProfileHelp: React.FC<ProfileHelpProps> = ({ language }) => {
  const translations = {
    en: {
      title: 'Profile & Security',
      description: 'Manage your personal information and account security',
      profileManagement: 'Profile Management',
      profileFeatures: [
        'Update personal information',
        'Change profile picture',
        'Manage contact details',
        'Set preferences',
        'View booking history',
        'Manage favorites'
      ],
      security: 'Account Security',
      securityFeatures: [
        'Password management',
        'Two-factor authentication',
        'Login activity monitoring',
        'Session management',
        'Privacy settings',
        'Data encryption'
      ],
      privacy: 'Privacy Settings',
      privacyOptions: [
        'Profile visibility',
        'Contact information sharing',
        'Notification preferences',
        'Data usage permissions'
      ]
    },
    hi: {
      title: 'प्रोफ़ाइल और सुरक्षा',
      description: 'अपनी व्यक्तिगत जानकारी और खाता सुरक्षा प्रबंधित करें',
      profileManagement: 'प्रोफ़ाइल प्रबंधन',
      profileFeatures: [
        'व्यक्तिगत जानकारी अपडेट करें',
        'प्रोफ़ाइल चित्र बदलें',
        'संपर्क विवरण प्रबंधित करें',
        'पसंद सेट करें',
        'बुकिंग इतिहास देखें',
        'पसंदीदा प्रबंधित करें'
      ],
      security: 'खाता सुरक्षा',
      securityFeatures: [
        'पासवर्ड प्रबंधन',
        'दो-कारक प्रमाणीकरण',
        'लॉगिन गतिविधि मॉनिटरिंग',
        'सत्र प्रबंधन',
        'गोपनीयता सेटिंग्स',
        'डेटा एन्क्रिप्शन'
      ],
      privacy: 'गोपनीयता सेटिंग्स',
      privacyOptions: [
        'प्रोफ़ाइल दृश्यता',
        'संपर्क जानकारी साझाकरण',
        'सूचना प्राथमिकताएं',
        'डेटा उपयोग अनुमतियां'
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
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-3 rounded-xl shadow-lg">
          <User className="h-6 w-6 text-white" />
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
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-yellow-50 dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <CardTitle>{t.profileManagement}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {t.profileFeatures.map((feature, index) => (
                <motion.li
                  key={index}
                  className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <User className="h-4 w-4 text-yellow-500" />
                  <span>{feature}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
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
                  <Lock className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
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
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-indigo-50 dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <CardTitle>{t.privacy}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {t.privacyOptions.map((option, index) => (
                <motion.li
                  key={index}
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <Bell className="h-5 w-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <span>{option}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ProfileHelp;