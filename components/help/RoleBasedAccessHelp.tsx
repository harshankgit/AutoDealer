import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Settings, MessageCircle, Home, User, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

interface RoleBasedAccessHelpProps {
  language: 'en' | 'hi';
}

const RoleBasedAccessHelp: React.FC<RoleBasedAccessHelpProps> = ({ language }) => {
  const translations = {
    en: {
      title: 'Role-Based Access Control',
      description: 'Learn about how different user roles have different access levels in the system',
      overview: 'Overview',
      overviewText: 'Our platform implements a role-based access control system to ensure users only see and access features relevant to their role. This improves security and user experience by showing only applicable options.',
      roles: 'User Roles',
      userRole: 'User Role',
      userFeatures: [
        'Browse cars and showrooms',
        'Access chat system',
        'View favorites and bookings',
        'Manage personal profile',
        'View notifications'
      ],
      adminRole: 'Admin Role',
      adminFeatures: [
        'Manage your showroom',
        'Add and edit cars',
        'Manage bookings',
        'Access chat system',
        'View dashboard analytics',
        'Manage room settings'
      ],
      superadminRole: 'Super Admin Role',
      superadminFeatures: [
        'Full platform access',
        'Manage all users',
        'Manage all showrooms',
        'Manage all cars',
        'View all bookings and payments',
        'Access system settings',
        'API logging and monitoring',
        'Manage all chats'
      ],
      navigation: 'Navigation Access',
      navigationText: 'The navigation menu dynamically shows/hides items based on your role:',
      navigationFeatures: [
        'Services dropdown: Only shows items you have access to',
        'Super Admin panel: Only visible to superadmin users',
        'Manage Showroom: Only visible to admin and superadmin users',
        'Chat System: Available to admin and superadmin users',
        'User-specific items: Available based on role permissions'
      ],
      security: 'Security Benefits',
      securityText: 'Role-based access control provides several security benefits:',
      securityFeatures: [
        'Prevents unauthorized access to sensitive features',
        'Reduces risk of accidental data modification',
        'Maintains clear separation of responsibilities',
        'Improves overall system security posture',
        'Ensures users only see relevant options'
      ],
      testing: 'Testing Access',
      testingText: 'You can test the role-based access control by logging in with different user accounts to see how the interface changes based on your role.'
    },
    hi: {
      title: 'भूमिका-आधारित पहुंच नियंत्रण',
      description: 'जानें कि विभिन्न उपयोगकर्ता भूमिकाओं के सिस्टम में अलग-अलग पहुंच स्तर कैसे होते हैं',
      overview: 'अवलोकन',
      overviewText: 'हमारा प्लेटफॉर्म भूमिका-आधारित पहुंच नियंत्रण प्रणाली को लागू करता है ताकि उपयोगकर्ता केवल उन्हीं सुविधाओं को देखें और उनका उपयोग करें जो उनकी भूमिका से संबंधित हों। यह केवल लागू विकल्प दिखाकर सुरक्षा और उपयोगकर्ता अनुभव में सुधार करता है।',
      roles: 'उपयोगकर्ता भूमिकाएं',
      userRole: 'उपयोगकर्ता भूमिका',
      userFeatures: [
        'कारों और शोरूम ब्राउज़ करें',
        'चैट सिस्टम तक पहुंच',
        'पसंदीदा और बुकिंग देखें',
        'व्यक्तिगत प्रोफ़ाइल प्रबंधित करें',
        'सूचनाएं देखें'
      ],
      adminRole: 'एडमिन भूमिका',
      adminFeatures: [
        'अपने शोरूम का प्रबंधन करें',
        'कारें जोड़ें और संपादित करें',
        'बुकिंग प्रबंधित करें',
        'चैट सिस्टम तक पहुंच',
        'डैशबोर्ड विश्लेषिकी देखें',
        'कमरा सेटिंग्स प्रबंधित करें'
      ],
      superadminRole: 'सुपर एडमिन भूमिका',
      superadminFeatures: [
        'पूर्ण प्लेटफॉर्म एक्सेस',
        'सभी उपयोगकर्ताओं का प्रबंधन',
        'सभी शोरूम का प्रबंधन',
        'सभी कारों का प्रबंधन',
        'सभी बुकिंग और भुगतान देखें',
        'सिस्टम सेटिंग्स तक पहुंच',
        'एपीआई लॉगिंग और निगरानी',
        'सभी चैट प्रबंधित करें'
      ],
      navigation: 'नेविगेशन पहुंच',
      navigationText: 'नेविगेशन मेनू आपकी भूमिका के आधार पर गतिशील रूप से आइटम दिखाता/छिपाता है:',
      navigationFeatures: [
        'सेवाएं ड्रॉपडाउन: केवल उन आइटम को दिखाता है जिनका आपके पास पहुंच है',
        'सुपर एडमिन पैनल: केवल सुपरएडमिन उपयोगकर्ताओं के लिए दृश्यमान',
        'शोरूम प्रबंधित करें: केवल एडमिन और सुपरएडमिन उपयोगकर्ताओं के लिए दृश्यमान',
        'चैट सिस्टम: एडमिन और सुपरएडमिन उपयोगकर्ताओं के लिए उपलब्ध',
        'उपयोगकर्ता-विशिष्ट आइटम: भूमिका अनुमतियों के आधार पर उपलब्ध'
      ],
      security: 'सुरक्षा लाभ',
      securityText: 'भूमिका-आधारित पहुंच नियंत्रण कई सुरक्षा लाभ प्रदान करता है:',
      securityFeatures: [
        'संवेदनशील सुविधाओं तक अनधिकृत पहुंच को रोकता है',
        'गलती से डेटा संशोधन के जोखिम को कम करता है',
        'जिम्मेदारियों का स्पष्ट अलगाव बनाए रखता है',
        'समग्र सिस्टम सुरक्षा स्थिति में सुधार करता है',
        'सुनिश्चित करता है कि उपयोगकर्ता केवल प्रासंगिक विकल्प देखें'
      ],
      testing: 'पहुंच का परीक्षण',
      testingText: 'आप अपनी भूमिका के आधार पर इंटरफेस कैसे बदलता है यह देखने के लिए विभिन्न उपयोगकर्ता खातों के साथ लॉगिन करके भूमिका-आधारित पहुंच नियंत्रण का परीक्षण कर सकते हैं।'
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
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <CardTitle>{t.overview}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">{t.overviewText}</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <CardTitle>{t.roles}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-500" />
                  {t.userRole}
                </h4>
                <ul className="space-y-2">
                  {t.userFeatures.map((feature, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                    >
                      <Eye className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-green-500" />
                  {t.adminRole}
                </h4>
                <ul className="space-y-2">
                  {t.adminFeatures.map((feature, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                    >
                      <Eye className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-orange-500" />
                  {t.superadminRole}
                </h4>
                <ul className="space-y-2">
                  {t.superadminFeatures.map((feature, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                    >
                      <Eye className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
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
              <Home className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <CardTitle>{t.navigation}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{t.navigationText}</p>
            <ul className="space-y-2">
              {t.navigationFeatures.map((feature, index) => (
                <motion.li
                  key={index}
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <Settings className="h-5 w-5 text-indigo-500 mt-0.5 flex-shrink-0" />
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
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-red-50 dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
              <CardTitle>{t.security}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{t.securityText}</p>
            <ul className="space-y-2">
              {t.securityFeatures.map((feature, index) => (
                <motion.li
                  key={index}
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <Shield className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
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
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-yellow-50 dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <CardTitle>{t.testing}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">{t.testingText}</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default RoleBasedAccessHelp;