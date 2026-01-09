// frontend/src/app/pengguna/profil/page.tsx
"use client";

import type { ReactNode, ChangeEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Heart,
  Star,
  LogOut,
  Edit2,
  Trash2,
  X,
  Check,
  Loader2,
  User as UserIcon,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/pengguna/ui/button";
import { useAuth } from "@/lib/auth";
import { apiMyFavorites, apiRemoveFavorite, apiUpdateProfile } from "@/lib/api";
import type { Cafe, User as UserType } from "@/types/domain";
import { useRouter } from "next/navigation";
import { apiMe } from "@/lib/api";

type FavoriteRow = {
  id: number;
  cafe: Cafe;
};

export default function UserProfilePage() {
  const [profileUser, setProfileUser] = useState<UserType | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "" });
  const [editSaving, setEditSaving] = useState(false);
  const { user, logout, refreshMe } = useAuth();
  const router = useRouter();

  // Simple token check - if token exists, show page
  useEffect(() => {
    const token = window.localStorage.getItem("cuppa_token") ||
      document.cookie.split("; ").find(row => row.startsWith("cuppa_token="))?.split("=")[1];

    if (!token) {
      router.replace("/login?next=/pengguna/profil");
      return;
    }

    (async () => {
      try {
        const me = await apiMe();
        setProfileUser(me.user ?? me);
        setEditForm({
          name: (me.user ?? me).name || "",
          phone: (me.user ?? me).phone || "",
        });
      } catch (error) {
        console.error("Failed to load profile:", error);
        if (user) {
          setProfileUser(user);
          setEditForm({ name: user.name || "", phone: user.phone || "" });
        }
      } finally {
        setProfileLoading(false);
      }
    })();
  }, [user, router]);

  // ====== Favorites ======
  const [favorites, setFavorites] = useState<FavoriteRow[]>([]);
  const [favErr, setFavErr] = useState<string | null>(null);
  const [favLoading, setFavLoading] = useState<boolean>(false);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const loadFavorites = async () => {
    if (!profileUser) return;
    setFavLoading(true);
    setFavErr(null);
    try {
      const rows = (await apiMyFavorites()) as FavoriteRow[];
      setFavorites(Array.isArray(rows) ? rows : []);
    } catch (e: unknown) {
      setFavErr(e instanceof Error ? e.message : "Gagal memuat favorit");
    } finally {
      setFavLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [user, profileUser]);

  const handleRemoveFavorite = async (favId: number) => {
    setRemovingId(favId);
    try {
      await apiRemoveFavorite(favId);
      setFavorites(prev => prev.filter(f => f.id !== favId));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menghapus favorit");
    } finally {
      setRemovingId(null);
    }
  };

  // ====== Edit Profile ======
  const handleEditClick = () => {
    if (profileUser) {
      setEditForm({
        name: profileUser.name || "",
        phone: profileUser.phone || "",
      });
    }
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    setEditSaving(true);
    try {
      const result = await apiUpdateProfile({
        name: editForm.name,
        phone: editForm.phone,
      });

      if (result.user) {
        setProfileUser(result.user);
        // Update auth context
        await refreshMe();
      }
      setIsEditing(false);
      alert("Profil berhasil diperbarui!");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal memperbarui profil");
    } finally {
      setEditSaving(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  // ====== Profile Data ======
  const profile = useMemo(() => {
    const u = (profileUser ?? {}) as Partial<UserType>;
    return {
      name: u.name ?? "User",
      bio: "Coffee enthusiast & explorer of local cafés. Always on the hunt for the perfect espresso!",
      email: u.email ?? "-",
      phone: u.phone ?? "-",
      location: "-",
    };
  }, [user, profileUser]);

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= rating
            ? "fill-[#271F01] text-[#271F01]"
            : "fill-gray-200 text-gray-300"
            }`}
        />
      ))}
    </div>
  );

  const onLogout = () => {
    logout();
    router.replace("/");
  };

  // Loading skeleton
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-white text-[#271F01]">
        <Navbar />
        <main className="container mx-auto px-8 py-8 max-w-6xl pt-28 space-y-8">
          <div className="h-40 rounded-xl border border-gray-300/40 animate-pulse bg-gray-100" />
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-6">
              <div className="h-60 rounded-xl border border-gray-300/40 animate-pulse bg-gray-100" />
              <div className="h-52 rounded-xl border border-gray-300/40 animate-pulse bg-gray-100" />
            </div>
            <div className="md:col-span-2 space-y-8">
              <div className="h-72 rounded-xl border border-gray-300/40 animate-pulse bg-gray-100" />
              <div className="h-72 rounded-xl border border-gray-300/40 animate-pulse bg-gray-100" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#271F01]">
      <Navbar />

      <main className="container mx-auto px-8 py-8 max-w-6xl pt-28 space-y-8">
        {/* Profile Header */}
        <div className="bg-white p-5 rounded-xl border border-gray-300/40 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
          <div className="relative flex flex-col md:flex-row items-center md:items-end gap-4">
            {/* Avatar Icon */}
            <div className="h-32 w-32 rounded-xl border border-gray-300/40 shadow-md bg-[#271F01] flex items-center justify-center">
              <UserIcon className="h-16 w-16 text-white" />
            </div>
            <div className="flex-1 text-center md:text-left mb-4 md:mb-0">
              <h2 className="text-3xl font-bold">{profile.name}</h2>
              <p className="mt-2 max-w-2xl text-gray-600">{profile.bio}</p>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border border-gray-400/40 text-[#271F01]"
                    onClick={handleCancelEdit}
                    disabled={editSaving}
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="gap-2 bg-[#271F01] text-white hover:bg-[#3d3118]"
                    onClick={handleSaveEdit}
                    disabled={editSaving}
                  >
                    {editSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Save
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border border-gray-400/40 text-[#271F01]"
                    onClick={handleEditClick}
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit Profile
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-2"
                    onClick={onLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </>
              )}
            </div>
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

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Nama
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#271F01]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={editForm.phone}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#271F01]"
                      placeholder="Masukkan nomor telepon"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <InfoItem
                    icon={<Mail className="h-4 w-4" />}
                    label="Email"
                    value={profile.email}
                  />
                  <InfoItem
                    icon={<Phone className="h-4 w-4" />}
                    label="Phone"
                    value={profile.phone}
                  />
                  <InfoItem
                    icon={<MapPin className="h-4 w-4" />}
                    label="Location"
                    value={profile.location}
                  />
                </>
              )}
            </div>


          </div>

          {/* RIGHT COLUMN */}
          <div className="md:col-span-2 space-y-8">
            {/* Favorite Coffee Shops */}
            <div className="bg-white p-8 rounded-xl border border-gray-300/40 shadow-md hover:shadow-lg transition-all duration-300">
              <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <Heart className="h-5 w-5 text-[#271F01] fill-[#271F01]" />
                Favorite Coffeeshop ({favorites.length})
              </h3>

              {favErr && (
                <div className="text-sm text-red-600 mb-2">{favErr}</div>
              )}

              {favLoading ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="h-40 rounded-xl border border-gray-300/40 animate-pulse bg-gray-100" />
                  <div className="h-40 rounded-xl border border-gray-300/40 animate-pulse bg-gray-100" />
                </div>
              ) : favorites.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Belum ada coffeeshop favorit.</p>
                  <Button
                    onClick={() => router.push("/pengguna/listCoffeeShop")}
                    className="bg-[#271F01] text-white hover:bg-[#3d3118]"
                  >
                    Jelajahi Coffee Shop
                  </Button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {favorites.map((row) => {
                    const cafe = row.cafe;
                    const isRemoving = removingId === row.id;
                    // Use uploaded images - try cover_url first, then logo_url, then use placeholder
                    const logoUrl = cafe.logo_url;
                    // Use cover_url if available, otherwise try logo_url as fallback, otherwise placeholder
                    const coverUrl = cafe.cover_url ?? cafe.logo_url ?? "/images/placeholder-coffee-shop.jpg";

                    return (
                      <div
                        key={row.id}
                        className="bg-white rounded-xl border border-gray-300/40 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group"
                      >
                        <div className="aspect-video overflow-hidden relative">
                          <img
                            src={coverUrl}
                            alt={cafe.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />

                          {/* Logo overlay - displayed as circular badge on top-left */}
                          {logoUrl && (
                            <div className="absolute top-3 left-3">
                              <div className="w-14 h-14 rounded-xl border-2 border-white shadow-lg overflow-hidden bg-white">
                                <img
                                  src={logoUrl}
                                  alt={`${cafe.name} logo`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const el = e.currentTarget;
                                    el.style.display = "none";
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Remove button overlay */}
                          <button
                            onClick={() => handleRemoveFavorite(row.id)}
                            disabled={isRemoving}
                            className="absolute top-2 right-2 p-2 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                            title="Hapus dari favorit"
                          >
                            {isRemoving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold mb-2">{cafe.name}</h3>
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                              {renderStars(5)}
                              <span className="text-sm text-gray-500 truncate max-w-[150px]">
                                {cafe.address ?? "—"}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() =>
                                router.push(`/pengguna/coffeeshop/${cafe.id}`)
                              }
                            >
                              Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Reviews */}
            <div className="bg-white p-5 rounded-xl border border-gray-300/40 shadow-md hover:shadow-lg transition-all duration-300">
              <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <Star className="h-5 w-5 text-[#271F01]" />
                Recent Reviews
              </h3>
              <p className="text-sm text-gray-500">
                Belum ada riwayat ulasan. Fitur ini akan aktif ketika endpoint
                riwayat ulasan pengguna tersedia di backend.
              </p>
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
  icon: ReactNode;
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

