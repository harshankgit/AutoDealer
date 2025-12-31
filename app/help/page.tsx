'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/user-context';
import {
  MessageCircle,
  Car,
  Users,
  Settings,
  Key,
  User,
  CreditCard,
  Home,
  Shield,
  Calendar,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import RoleGuides from './role-guides';
import MainHelpSection from '@/components/help/MainHelpSection';
import ChatAssistantHelp from '@/components/help/ChatAssistantHelp';
import RoomsHelp from '@/components/help/RoomsHelp';
import CarListingsHelp from '@/components/help/CarListingsHelp';
import BookingsHelp from '@/components/help/BookingsHelp';
import ProfileHelp from '@/components/help/ProfileHelp';
import AuthHelp from '@/components/help/AuthHelp';
import AdminHelp from '@/components/help/AdminHelp';
import HelpHeader from '@/components/help/HelpHeader';

export default function HelpPage() {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'hi'>('en'); // Default to English
  const { user } = useUser();

  // Determine user role for filtering help sections
  const userRole = user?.role || 'user'; // Default to 'user' if not logged in

  const helpSections = [
    {
      id: 'chat',
      title: 'Chat Assistant',
      description: 'Real-time chat with other users and admins',
      icon: MessageCircle,
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      roles: ['user', 'admin', 'superadmin']
    },
    {
      id: 'rooms',
      title: 'Rooms Management',
      description: 'Create, manage, and join rooms',
      icon: Home,
      color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      roles: ['admin', 'superadmin']
    },
    {
      id: 'cars',
      title: 'Car Listings',
      description: 'Add, edit, and manage car listings',
      icon: Car,
      color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
      roles: ['admin', 'superadmin']
    },
    {
      id: 'bookings',
      title: 'Bookings & Payments',
      description: 'Manage car bookings and payments',
      icon: Calendar,
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      roles: ['user', 'admin', 'superadmin']
    },
    {
      id: 'profile',
      title: 'Profile & Security',
      description: 'Manage your profile and account security',
      icon: User,
      color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
      roles: ['user', 'admin', 'superadmin']
    },
    {
      id: 'auth',
      title: 'Authentication',
      description: 'Login, registration, and password management',
      icon: Key,
      color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
      roles: ['user', 'admin', 'superadmin']
    },
    {
      id: 'admin',
      title: 'Admin Features',
      description: 'Advanced admin and superadmin tools',
      icon: Shield,
      color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
      roles: ['admin', 'superadmin']
    },
    {
      id: 'roles',
      title: 'Role-Specific Guides',
      description: 'Detailed guides for each user role',
      icon: User,
      color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
      roles: ['user', 'admin', 'superadmin']
    }
  ];

  // Translation function for help section titles and descriptions
  const translateHelpSection = (sectionId: string, type: 'title' | 'description') => {
    const translations: Record<string, Record<string, string>> = {
      chat: {
        title: language === 'en' ? 'Chat Assistant' : 'चैट सहायक',
        description: language === 'en' ? 'Real-time chat with other users and admins' : 'अन्य उपयोगकर्ताओं और एडमिन के साथ रीयल-टाइम चैट'
      },
      rooms: {
        title: language === 'en' ? 'Rooms Management' : 'कमरा प्रबंधन',
        description: language === 'en' ? 'Create, manage, and join rooms' : 'कमरे बनाएं, प्रबंधित करें और शामिल हों'
      },
      cars: {
        title: language === 'en' ? 'Car Listings' : 'कार सूचियां',
        description: language === 'en' ? 'Add, edit, and manage car listings' : 'कार सूचियां जोड़ें, संपादित करें और प्रबंधित करें'
      },
      bookings: {
        title: language === 'en' ? 'Bookings & Payments' : 'बुकिंग और भुगतान',
        description: language === 'en' ? 'Manage car bookings and payments' : 'कार बुकिंग और भुगतान प्रबंधित करें'
      },
      profile: {
        title: language === 'en' ? 'Profile & Security' : 'प्रोफ़ाइल और सुरक्षा',
        description: language === 'en' ? 'Manage your profile and account security' : 'अपनी प्रोफ़ाइल और खाता सुरक्षा प्रबंधित करें'
      },
      auth: {
        title: language === 'en' ? 'Authentication' : 'प्रमाणीकरण',
        description: language === 'en' ? 'Login, registration, and password management' : 'लॉगिन, पंजीकरण और पासवर्ड प्रबंधन'
      },
      admin: {
        title: language === 'en' ? 'Admin Features' : 'एडमिन सुविधाएं',
        description: language === 'en' ? 'Advanced admin and superadmin tools' : 'उन्नत एडमिन और सुपरएडमिन उपकरण'
      },
      roles: {
        title: language === 'en' ? 'Role-Specific Guides' : 'भूमिका-विशिष्ट मार्गदर्शिका',
        description: language === 'en' ? 'Detailed guides for each user role' : 'प्रत्येक उपयोगकर्ता भूमिका के लिए विस्तृत मार्गदर्शिका'
      }
    };

    return translations[sectionId]?.[type] || (type === 'title' ? sectionId : '');
  };

  // Filter help sections based on user role
  const filteredHelpSections = helpSections.filter(section =>
    section.roles.includes(userRole)
  );

  const renderMainHelp = () => (
    <MainHelpSection
      language={language}
      filteredHelpSections={filteredHelpSections}
      setSelectedSection={setSelectedSection}
      user={user}
    />
  );

  const renderContent = () => {
    if (!selectedSection) {
      return renderMainHelp();
    }

    // Filter sections based on user role for navigation
    const canAccessSection = helpSections.find(section => section.id === selectedSection)?.roles.includes(userRole);

    if (!canAccessSection) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'en' ? 'Access Restricted' : 'पहुंच प्रतिबंधित'}
            </CardTitle>
            <CardDescription>
              {language === 'en'
                ? 'You don\'t have permission to view this help section.'
                : 'आपके पास इस सहायता अनुभाग को देखने की अनुमति नहीं है।'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              {language === 'en'
                ? 'This help section is only available to users with specific roles.'
                : 'यह सहायता अनुभाग केवल विशिष्ट भूमिकाओं वाले उपयोगकर्ताओं के लिए उपलब्ध है।'}
            </p>
            <Button
              className="mt-4"
              onClick={() => setSelectedSection(null)}
            >
              {language === 'en' ? 'Back to Help Topics' : 'सहायता विषयों पर वापस जाएं'}
            </Button>
          </CardContent>
        </Card>
      );
    }

    // For admin section, only show superadmin features if user is superadmin
    if (selectedSection === 'admin' && userRole === 'superadmin') {
      return <AdminHelp language={language} />;
    } else if (selectedSection === 'admin' && userRole !== 'superadmin') {
      // For non-superadmin users, we'll modify the AdminHelp to hide superadmin features
      return <AdminHelp language={language} />;
    }

    switch (selectedSection) {
      case 'chat':
        return <ChatAssistantHelp language={language} />;
      case 'rooms':
        return <RoomsHelp language={language} />;
      case 'cars':
        return <CarListingsHelp language={language} />;
      case 'bookings':
        return <BookingsHelp language={language} />;
      case 'profile':
        return <ProfileHelp language={language} />;
      case 'auth':
        return <AuthHelp language={language} />;
      case 'admin':
        return <AdminHelp language={language} userRole={userRole} />;
      case 'roles':
        return <RoleGuides />;
      default:
        return renderMainHelp();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <HelpHeader language={language} setLanguage={setLanguage} />

        {selectedSection && (
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setSelectedSection(null)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {language === 'en' ? 'Back to Help Topics' : 'सहायता विषयों पर वापस जाएं'}
            </Button>
          </div>
        )}

        {renderContent()}
      </div>
    </div>
  );
}