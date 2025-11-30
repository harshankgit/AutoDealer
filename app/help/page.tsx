"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  Car,
  Shield,
  MessageCircle,
  Settings,
  Users,
  Building2,
  CarFront,
  HelpCircle,
  Info,
} from "lucide-react";
import { useUser } from "@/context/user-context";

export default function HelpPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<
    "overview" | "user" | "admin" | "superadmin"
  >("overview");

  // Update the active tab based on user role when user changes
  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        setActiveTab("admin");
      } else if (user.role === "superadmin") {
        setActiveTab("superadmin");
      } else if (user.role === "user") {
        setActiveTab("user");
      } else {
        setActiveTab("overview");
      }
    }
  }, [user]);

  // Define role-based content
  const roleContents = {
    overview: {
      title: "Website Overview",
      icon: <Car className="h-8 w-8 text-blue-500" />,
      description:
        "Discover the features and functionalities of our car selling platform",
      sections: [
        {
          title: "Multi-Showroom Experience",
          description:
            "Browse cars from multiple dealerships in dedicated virtual showrooms",
          icon: <Building2 className="h-6 w-6 text-blue-500" />,
        },
        {
          title: "Direct Dealer Chat",
          description:
            "Connect directly with car dealers for specific inquiries about vehicles",
          icon: <MessageCircle className="h-6 w-6 text-green-500" />,
        },
        {
          title: "Secure Platform",
          description:
            "Protected user data and verified dealers ensuring safe transactions",
          icon: <Shield className="h-6 w-6 text-red-500" />,
        },
        {
          title: "Advanced Search",
          description:
            "Filter cars by brand, price, fuel type, and more to find exactly what you need",
          icon: <CarFront className="h-6 w-6 text-purple-500" />,
        },
      ],
    },
    user: {
      title: "User Features",
      icon: <User className="h-8 w-8 text-blue-500" />,
      description: "Features available to regular users looking to buy cars",
      sections: [
        {
          title: "Browse Showrooms",
          description:
            "Explore multiple car selling centers and browse their inventories",
          icon: <Building2 className="h-6 w-6 text-blue-500" />,
        },
        {
          title: "Direct Chat",
          description:
            "Message dealers directly about specific cars you're interested in",
          icon: <MessageCircle className="h-6 w-6 text-green-500" />,
        },
        {
          title: "Favorites List",
          description: "Save your favorite cars and compare them later",
          icon: <Car className="h-6 w-6 text-yellow-500" />,
        },
        {
          title: "Bookings",
          description:
            "Schedule test drives and book the car you want to purchase",
          icon: <Settings className="h-6 w-6 text-purple-500" />,
        },
      ],
    },
    admin: {
      title: "Admin Features",
      icon: <Shield className="h-8 w-8 text-green-500" />,
      description:
        "Tools and features for administrators managing their showrooms",
      sections: [
        {
          title: "Showroom Management",
          description: "Create and manage your own car selling center",
          icon: <Building2 className="h-6 w-6 text-green-500" />,
        },
        {
          title: "Car Inventory",
          description: "Add, edit, and manage your car listings",
          icon: <Car className="h-6 w-6 text-blue-500" />,
        },
        {
          title: "Customer Chat",
          description: "Communicate with potential buyers",
          icon: <MessageCircle className="h-6 w-6 text-purple-500" />,
        },
        {
          title: "Analytics Dashboard",
          description:
            "Track your showroom performance and customer interactions",
          icon: <Settings className="h-6 w-6 text-yellow-500" />,
        },
      ],
    },
    superadmin: {
      title: "Super Admin Features",
      icon: <Users className="h-8 w-8 text-red-500" />,
      description: "Platform-wide administration and oversight tools",
      sections: [
        {
          title: "User Management",
          description: "Monitor and manage all platform users",
          icon: <Users className="h-6 w-6 text-red-500" />,
        },
        {
          title: "Platform Analytics",
          description: "View comprehensive statistics and performance metrics",
          icon: <Settings className="h-6 w-6 text-purple-500" />,
        },
        {
          title: "System Monitoring",
          description: "Oversee all showrooms and their activities",
          icon: <Shield className="h-6 w-6 text-blue-500" />,
        },
        {
          title: "Content Moderation",
          description: "Review and manage all listings and communications",
          icon: <Car className="h-6 w-6 text-yellow-500" />,
        },
      ],
    },
  };

  // Get the appropriate content based on user role
  const getUserRoleTab = () => {
    if (!user) return "overview";
    return user.role === "admin"
      ? "admin"
      : user.role === "superadmin"
      ? "superadmin"
      : user.role === "user"
      ? "user"
      : "overview";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            How to Use CarSelling
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Learn about the features and functionalities of our car selling
            platform
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {(["overview", "user", "admin", "superadmin"] as const).map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "outline"}
              onClick={() => setActiveTab(tab)}
              className={`
        flex flex-col items-center justify-center
        w-[150px] h-[110px]   /* Fixed width & height */
        rounded-xl transition-all duration-200
        ${
          activeTab === tab
            ? "bg-blue-600 text-white shadow-lg scale-105"
            : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:shadow-md"
        }
      `}
            >
              <div className="mb-2 text-2xl">{roleContents[tab].icon}</div>
              <span className="capitalize font-medium">{tab}</span>
            </Button>
          ))}
        </div>

        {/* Current Role Highlight */}
        {user && (
          <div className="text-center mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-lg text-blue-700 dark:text-blue-300">
              You are logged in as a{" "}
              <span className="font-semibold capitalize">{user.role}</span>.
              View {user.role}-specific features below.
            </p>
          </div>
        )}

        {/* Content Section */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg border-0">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              {roleContents[activeTab].icon}
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
              {roleContents[activeTab].title}
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              {roleContents[activeTab].description}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {roleContents[activeTab].sections.map((section, index) => (
                <Card
                  key={index}
                  className="border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="mt-1">{section.icon}</div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          {section.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          {section.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Additional Help Section */}
            <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Need More Help?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <MessageCircle className="h-10 w-10 text-blue-500 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Live Chat
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Connect with our support team for instant help
                  </p>
                </div>
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <Car className="h-10 w-10 text-green-500 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Video Tutorials
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Watch step-by-step guides on using our platform
                  </p>
                </div>
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <User className="h-10 w-10 text-purple-500 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Community
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Join our community forum for tips and tricks
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Comparison Table for All Roles */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Feature Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-white dark:bg-gray-800 rounded-lg shadow">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="py-4 px-6 text-left text-gray-900 dark:text-white">
                    Feature
                  </th>
                  <th className="py-4 px-6 text-center text-gray-900 dark:text-white">
                    User
                  </th>
                  <th className="py-4 px-6 text-center text-gray-900 dark:text-white">
                    Admin
                  </th>
                  <th className="py-4 px-6 text-center text-gray-900 dark:text-white">
                    Super Admin
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-4 px-6 text-gray-700 dark:text-gray-300">
                    Browse Showrooms
                  </td>
                  <td className="py-4 px-6 text-center text-green-600 dark:text-green-400">
                    ✓
                  </td>
                  <td className="py-4 px-6 text-center text-gray-500 dark:text-gray-400">
                    ✓
                  </td>
                  <td className="py-4 px-6 text-center text-green-600 dark:text-green-400">
                    ✓
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-4 px-6 text-gray-700 dark:text-gray-300">
                    Direct Chat with Dealers
                  </td>
                  <td className="py-4 px-6 text-center text-green-600 dark:text-green-400">
                    ✓
                  </td>
                  <td className="py-4 px-6 text-center text-gray-500 dark:text-gray-400">
                    -
                  </td>
                  <td className="py-4 px-6 text-center text-green-600 dark:text-green-400">
                    ✓
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-4 px-6 text-gray-700 dark:text-gray-300">
                    Create Showroom
                  </td>
                  <td className="py-4 px-6 text-center text-gray-500 dark:text-gray-400">
                    -
                  </td>
                  <td className="py-4 px-6 text-center text-green-600 dark:text-green-400">
                    ✓
                  </td>
                  <td className="py-4 px-6 text-center text-green-600 dark:text-green-400">
                    ✓
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-4 px-6 text-gray-700 dark:text-gray-300">
                    Manage Cars
                  </td>
                  <td className="py-4 px-6 text-center text-gray-500 dark:text-gray-400">
                    -
                  </td>
                  <td className="py-4 px-6 text-center text-green-600 dark:text-green-400">
                    ✓
                  </td>
                  <td className="py-4 px-6 text-center text-green-600 dark:text-green-400">
                    ✓
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-4 px-6 text-gray-700 dark:text-gray-300">
                    Analytics Dashboard
                  </td>
                  <td className="py-4 px-6 text-center text-gray-500 dark:text-gray-400">
                    -
                  </td>
                  <td className="py-4 px-6 text-center text-green-600 dark:text-green-400">
                    ✓
                  </td>
                  <td className="py-4 px-6 text-center text-green-600 dark:text-green-400">
                    ✓
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-4 px-6 text-gray-700 dark:text-gray-300">
                    User Management
                  </td>
                  <td className="py-4 px-6 text-center text-gray-500 dark:text-gray-400">
                    -
                  </td>
                  <td className="py-4 px-6 text-center text-gray-500 dark:text-gray-400">
                    -
                  </td>
                  <td className="py-4 px-6 text-center text-green-600 dark:text-green-400">
                    ✓
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
