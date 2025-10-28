"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Heart,
  Star,
  Lock,
  Bell,
  LogOut,
  Edit2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/pengguna/ui/button";
import { Badge } from "@/components/pengguna/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/pengguna/ui/avatar";

export default function UserProfilePage() {
  const [user] = useState({
    name: "Sarah Anderson",
    bio: "Coffee enthusiast & explorer of local cafés. Always on the hunt for the perfect espresso!",
    email: "sarah.anderson@email.com",
    phone: "+1 (555) 123-4567",
    location: "Portland, OR",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  });

  const [favorites] = useState([
    {
      id: 1,
      name: "Renjana Coffee",
      image:
        "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop",
      rating: 4.8,
    },
    {
      id: 2,
      name: "Terikat Coffee",
      image:
        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop",
      rating: 4.6,
    },
  ]);

  const [reviews] = useState([
    {
      id: 1,
      shopName: "The Roasted Bean",
      rating: 5,
      comment:
        "Amazing atmosphere and the best cappuccino I've had in Portland!",
      date: "2 days ago",
    },
  ]);

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-[#271F01] text-[#271F01]"
              : "fill-gray-200 text-gray-300"
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-[#271F01]">
      <Navbar />

      <main className="container mx-auto px-8 py-8 max-w-6xl pt-28 space-y-8">
        {/* Profile Header */}
        <div className="bg-white p-5 rounded-xl border border-gray-300/40 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
          <div className="relative flex flex-col md:flex-row items-center md:items-end gap-4">
            <Avatar className="h-32 w-32 p-5 rounded-xl border border-gray-300/40 shadow-md hover:shadow-lg transition-all duration-300">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-2xl bg-[#271F01] text-white">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left mb-4 md:mb-0">
              <h2 className="text-3xl font-bold">{user.name}</h2>
              <p className="mt-2 max-w-2xl text-gray-600">{user.bio}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border border-gray-400/40 text-[#271F01]"
            >
              <Edit2 className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* Account Info */}
            <div className="bg-white p-5 rounded-xl border border-gray-300/40 shadow-md hover:shadow-lg transition-all duration-300">
              <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <Mail className="h-5 w-5 text-[#271F01]" />
                Account Information
              </h3>
              <InfoItem
                icon={<Mail className="h-4 w-4" />}
                label="Email"
                value={user.email}
              />
              <InfoItem
                icon={<Phone className="h-4 w-4" />}
                label="Phone"
                value={user.phone}
              />
              <InfoItem
                icon={<MapPin className="h-4 w-4" />}
                label="Location"
                value={user.location}
              />
            </div>

            {/* Settings */}
            <div className="bg-white p-5 rounded-xl border border-gray-300/40 shadow-md hover:shadow-lg transition-all duration-300">
              <h3 className="text-xl font-semibold mb-4">Settings</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 border border-gray-400/40 text-[#271F01]"
                >
                  <Lock className="h-4 w-4" />
                  Change Password
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 border border-gray-400/40 text-[#271F01]"
                >
                  <Bell className="h-4 w-4" />
                  Notification Preferences
                </Button>
                <Button
                  variant="destructive"
                  className="w-full justify-start gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="md:col-span-2 space-y-8">
            {/* Favorite Coffee Shops */}
            <div className="bg-white p-5 rounded-xl border border-gray-300/40 shadow-md hover:shadow-lg transition-all duration-300">
              <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <Heart className="h-5 w-5 text-[#271F01] fill-[#271F01]" />
                Favorite Coffee Shops
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {favorites.map((shop) => (
                  <div
                    key={shop.id}
                    className="bg-white rounded-xl border border-gray-300/40 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={shop.image}
                        alt={shop.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-2">{shop.name}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {renderStars(Math.round(shop.rating))}
                          <span className="text-sm text-gray-500 ml-1">
                            {shop.rating}
                          </span>
                        </div>
                        <Button size="sm" variant="secondary">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-white p-5 rounded-xl border border-gray-300/40 shadow-md hover:shadow-lg transition-all duration-300">
              <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <Star className="h-5 w-5 text-[#271F01]" />
                Recent Reviews
              </h3>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white border border-gray-300/40 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{review.shopName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          {renderStars(review.rating)}
                          <Badge variant="secondary" className="text-xs">
                            {review.date}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Subcomponent InfoItem
function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-1 mb-2">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <p className="text-[#271F01] pl-6">{value}</p>
    </div>
  );
}
