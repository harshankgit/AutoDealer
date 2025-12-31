'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Shield, ChevronRight, ArrowLeft } from 'lucide-react';
import { useUser } from '@/context/user-context';

interface MainHelpSectionProps {
  language: 'en' | 'hi';
  filteredHelpSections: {
    id: string;
    title: string;
    description: string;
    icon: any;
    color: string;
    roles: string[];
  }[];
  setSelectedSection: (section: string) => void;
  user: any;
}

export default function MainHelpSection({ language, filteredHelpSections, setSelectedSection, user }: MainHelpSectionProps) {
  // Translation helper function
  const t = (en: string, hi: string) => language === 'en' ? en : hi;

  return (
    <div className="space-y-8">

      {/* User Role Information Card - Only show if user is logged in */}
      {user && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              {t('Your Account Information', 'आपकी खाता जानकारी')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('Account Details', 'खाता विवरण')}
                </h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t('Username:', 'उपयोगकर्ता नाम:')}
                    </span>
                    <span className="font-medium">{user.username}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t('Email:', 'ईमेल:')}
                    </span>
                    <span className="font-medium">{user.email}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t('Role:', 'भूमिका:')}
                    </span>
                    <span className="font-medium capitalize">{user.role}</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('Available Features', 'उपलब्ध सुविधाएं')}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t(
                    `Based on your role, you have access to ${filteredHelpSections.length} help topics.`,
                    `आपकी भूमिका के आधार पर, आपके पास ${filteredHelpSections.length} सहायता विषयों तक पहुंच है।`
                  )}
                </p>
                {user.role === 'superadmin' && (
                  <div className="mt-2 p-2 bg-orange-100 dark:bg-orange-900/30 rounded text-sm text-orange-800 dark:text-orange-200">
                    <Shield className="h-4 w-4 inline mr-1" />
                    {t(
                      'You have superadmin privileges with full platform access',
                      'आपके पास पूर्ण प्लेटफॉर्म एक्सेस के साथ सुपरएडमिन अधिकार हैं'
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHelpSections.map((section) => {
          const IconComponent = section.icon;
          return (
            <Card
              key={section.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedSection(section.id)}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${section.color}`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                <CardTitle className="flex items-center justify-between">
                  {section.title}
                  <ChevronRight className="h-4 w-4" />
                </CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {language === 'en'
                    ? `Available for: ${section.roles.join(', ')}`
                    : `इसके लिए उपलब्ध: ${section.roles.join(', ')}`}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}