import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Settings, Car, MessageCircle, Home, User, BarChart4 } from 'lucide-react';
import { motion } from 'framer-motion';

interface AdminHelpProps {
  language: 'en' | 'hi';
  userRole?: string;
}

const AdminHelp: React.FC<AdminHelpProps> = ({ language, userRole = 'admin' }) => {
  const translations = {
    en: {
      title: 'Admin Features',
      description: 'Advanced tools and features for platform administrators',
      roomManagement: 'Room Management',
      roomFeatures: [
        'Create and customize rooms',
        'Manage room settings and permissions',
        'Add and remove room content',
        'Monitor room activity',
        'Configure room-specific features',
        'Set room access policies'
      ],
      carManagement: 'Car Management',
      carFeatures: [
        'Add new car listings',
        'Update car details and specifications',
        'Manage car availability',
        'Upload car images and documents',
        'Set pricing and rental terms',
        'Archive old car listings'
      ],
      userManagement: 'User Management',
      userFeatures: [
        'View user profiles and activity',
        'Monitor user interactions',
        'Handle user support requests',
        'Manage user permissions',
        'Resolve user disputes',
        'Send notifications to users'
      ],
      systemTools: 'System Tools',
      systemFeatures: [
        'Access admin dashboard',
        'View system analytics',
        'Generate reports',
        'Manage system settings',
        'Monitor system performance',
        'Configure integrations',
        'Scanner management and verification',
        'Payment verification through scanner'
      ],
      superadminOnly: 'Superadmin Only',
      superadminFeatures: [
        'Full platform access',
        'User management across all admins',
        'System configuration',
        'Database management',
        'Security monitoring',
        'API management',
        'Scanner system oversight',
        'Advanced scanner configuration'
      ]
    },
    hi: {
      title: 'एडमिन सुविधाएं',
      description: 'प्लेटफॉर्म व्यवस्थापकों के लिए उन्नत उपकरण और सुविधाएं',
      roomManagement: 'कमरा प्रबंधन',
      roomFeatures: [
        'कमरे बनाएं और कस्टमाइज़ करें',
        'कमरा सेटिंग्स और अनुमतियां प्रबंधित करें',
        'कमरा सामग्री जोड़ें और हटाएं',
        'कमरा गतिविधि की निगरानी करें',
        'कमरा-विशिष्ट सुविधाएं कॉन्फ़िगर करें',
        'कमरा पहुंच नीतियां सेट करें'
      ],
      carManagement: 'कार प्रबंधन',
      carFeatures: [
        'नई कार सूचियां जोड़ें',
        'कार विवरण और विनिर्देश अपडेट करें',
        'कार उपलब्धता प्रबंधित करें',
        'कार छवियां और दस्तावेज़ अपलोड करें',
        'मूल्य निर्धारण और किराया शर्तें सेट करें',
        'पुरानी कार सूचियां संग्रहित करें'
      ],
      userManagement: 'उपयोगकर्ता प्रबंधन',
      userFeatures: [
        'उपयोगकर्ता प्रोफ़ाइल और गतिविधि देखें',
        'उपयोगकर्ता बातचीत की निगरानी करें',
        'उपयोगकर्ता समर्थन अनुरोधों को संभालें',
        'उपयोगकर्ता अनुमतियां प्रबंधित करें',
        'उपयोगकर्ता विवादों को हल करें',
        'उपयोगकर्ताओं को सूचनाएं भेजें'
      ],
      systemTools: 'सिस्टम उपकरण',
      systemFeatures: [
        'एडमिन डैशबोर्ड तक पहुंचें',
        'सिस्टम विश्लेषिकी देखें',
        'रिपोर्ट जनरेट करें',
        'सिस्टम सेटिंग्स प्रबंधित करें',
        'सिस्टम प्रदर्शन की निगरानी करें',
        'एकीकरण कॉन्फ़िगर करें',
        'स्कैनर प्रबंधन और सत्यापन',
        'स्कैनर के माध्यम से भुगतान सत्यापन'
      ],
      superadminOnly: 'केवल सुपरएडमिन',
      superadminFeatures: [
        'पूर्ण प्लेटफॉर्म एक्सेस',
        'सभी एडमिन्स के लिए उपयोगकर्ता प्रबंधन',
        'सिस्टम कॉन्फ़िगरेशन',
        'डेटाबेस प्रबंधन',
        'सुरक्षा निगरानी',
        'एपीआई प्रबंधन',
        'स्कैनर सिस्टम सुपरविजन',
        'उन्नत स्कैनर कॉन्फ़िगरेशन'
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
        <div className="bg-gradient-to-br from-orange-500 to-red-600 p-3 rounded-xl shadow-lg">
          <Shield className="h-6 w-6 text-white" />
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
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <CardTitle>{t.roomManagement}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {t.roomFeatures.map((feature, index) => (
                <motion.li
                  key={index}
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <Home className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
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
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-red-50 dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Car className="h-5 w-5 text-red-600 dark:text-red-400" />
              <CardTitle>{t.carManagement}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {t.carFeatures.map((feature, index) => (
                <motion.li
                  key={index}
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <Car className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
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
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
              <CardTitle>{t.userManagement}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {t.userFeatures.map((feature, index) => (
                <motion.li
                  key={index}
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <User className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
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
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <CardTitle>{t.systemTools}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {t.systemFeatures.map((feature, index) => (
                <motion.li
                  key={index}
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <BarChart4 className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* Superadmin-specific section - only show if user is superadmin */}
      {userRole === 'superadmin' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30 border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <CardTitle className="text-orange-700 dark:text-orange-300">{t.superadminOnly}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {t.superadminFeatures.map((feature, index) => (
                  <motion.li
                    key={index}
                    className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-2 border-orange-500"
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
      )}
    </div>
  );
};

export default AdminHelp;