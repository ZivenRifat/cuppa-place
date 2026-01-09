"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { MapPin, Star, Bookmark, ArrowLeft, ChevronLeft, ChevronRight, X, Send, MessageCircle, Clock, Camera } from "lucide-react";
import Navbar from "@/components/Navbar";
import {
  apiCafeDetail,
  apiCafeMenu,
  apiCreateReview,
  apiUploadTempImage,
  apiCreateLiveComment,
  apiGetLiveComments,
  apiCafeReviews,
  apiAddFavorite,
  apiRemoveFavorite,
  apiMyFavorites,
} from "@/lib/api";
import type { Cafe, MenuItem, Review } from "@/types/domain";
import { useAuth } from "@/lib/auth";
import SlideShow from "@/components/SlideShow";

// Interface for Live Comment
interface LiveComment {
  id: number;
  user_id: number;
  user_name: string;
  user_avatar?: string;
  text: string;
  image_url?: string | null;
  created_at: string;
}

export default function CafeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const cafeId = params?.id ? Number(params.id) : 0;
  const { user, loading: authLoading } = useAuth();

  // Add loading state for initial params
  const [paramsLoaded, setParamsLoaded] = useState(false);

  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Live Comment state
  const [liveComments, setLiveComments] = useState<LiveComment[]>([]);
  const [newLiveComment, setNewLiveComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [showLiveComment, setShowLiveComment] = useState(true);
  const [selectedCommentImage, setSelectedCommentImage] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [newRating, setNewRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [newText, setNewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Favorite state
  const [isFavorite, setIsFavorite] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);

  // Auto-slide gallery
  const slideIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startSlide = () => {
    stopSlide();
    slideIntervalRef.current = setInterval(() => {
      setActiveGalleryIndex((prev) => (prev + 1) % galleryPhotos.length);
    }, 4000);
  };

  const stopSlide = () => {
    if (slideIntervalRef.current) {
      clearInterval(slideIntervalRef.current);
      slideIntervalRef.current = null;
    }
  };

  const handlePrevGallery = () => {
    setActiveGalleryIndex((prev) => (prev - 1 + galleryPhotos.length) % galleryPhotos.length);
  };

  const handleNextGallery = () => {
    setActiveGalleryIndex((prev) => (prev + 1) % galleryPhotos.length);
  };

  useEffect(() => {
    // Wait for params to be loaded
    if (!cafeId) {
      // Check if params is a Promise (Next.js 15)
      if (params && typeof params === 'object' && 'then' in params) {
        // Handle Promise params - cast to unknown first
        (params as unknown as Promise<{ id: string }>).then(resolvedParams => {
          if (resolvedParams?.id) {
            setParamsLoaded(true);
          }
        }).catch(() => {
          setError("Invalid cafe ID");
          setLoading(false);
        });
      } else {
        setParamsLoaded(true);
      }
      return;
    }

    let active = true;
    (async () => {
      try {
        setLoading(true);
        const [cafeRes, menuRes, reviewsRes] = await Promise.all([
          apiCafeDetail(cafeId),
          apiCafeMenu(cafeId),
          apiCafeReviews(cafeId, { limit: 20, status: "published" }),
        ]);
        if (!active) return;
        const cafeData = cafeRes as Cafe;
        setCafe(cafeData);
        setMenus(Array.isArray(menuRes) ? menuRes : (menuRes as any)?.data ?? []);
        setReviews((reviewsRes as any)?.data ?? []);

        // Get gallery photos from cafe data
        const gallery = cafeData.gallery_urls || [];
        setGalleryPhotos(gallery);
        if (gallery.length > 0) {
          startSlide();
        }
      } catch (e) {
        setError("Gagal memuat data coffeeshop.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
      stopSlide();
    };
  }, [cafeId, params]);

  // Live Comment polling - fetch new comments every 5 seconds
  useEffect(() => {
    if (!cafeId || !showLiveComment) return;

    const fetchLiveComments = async () => {
      try {
        // Fetch live comments specifically (not reviews/ratings)
        const res = await apiGetLiveComments(cafeId, { limit: 10 }) as any;
        const commentsData = res?.data || [];

        // Convert to LiveComment format
        const comments: LiveComment[] = commentsData
          .slice(0, 10)
          .map((r: any) => ({
            id: r.id,
            user_id: r.user_id || 0,
            user_name: r.user?.name || "Anonim",
            user_avatar: r.user?.avatar_url,
            text: r.comment || r.text || "",
            image_url: r.image_url || null,
            created_at: r.created_at,
          }));

        setLiveComments(comments);
      } catch (e) {
        console.error("Error fetching live comments:", e);
      }
    };

    // Initial fetch
    fetchLiveComments();

    // Poll every 5 seconds
    const interval = setInterval(fetchLiveComments, 5000);

    return () => clearInterval(interval);
  }, [cafeId, showLiveComment]);

  // Handle image selection for comment
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('File harus berupa gambar');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran gambar maksimal 5MB');
        return;
      }
      setSelectedCommentImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Remove selected image
  const removeSelectedImage = () => {
    setSelectedCommentImage(null);
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
      setPreviewImage(null);
    }
  };

  // Send live comment with optional image
  const handleSendLiveComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Silakan login terlebih dahulu untuk mengirim komentar.");
      return;
    }
    if (!newLiveComment.trim() && !selectedCommentImage) {
      alert("Tulis komentar atau pilih gambar terlebih dahulu.");
      return;
    }

    try {
      setSendingComment(true);
      let imageUrl: string | undefined;

      // Upload image if selected
      if (selectedCommentImage) {
        setUploadingImage(true);
        const uploadResult = await apiUploadTempImage(selectedCommentImage) as { url: string };
        imageUrl = uploadResult.url;
        setUploadingImage(false);
      }

      // Post as a live comment (NOT as a review with rating)
      await apiCreateLiveComment(cafeId, {
        text: newLiveComment.trim(),
        ...(imageUrl && { image_url: imageUrl }),
      });

      setNewLiveComment("");
      removeSelectedImage();

      // Refresh comments immediately
      const res = await apiGetLiveComments(cafeId, { limit: 10 }) as any;
      const commentsData = res?.data || [];
      const comments: LiveComment[] = commentsData.slice(0, 10).map((r: any) => ({
        id: r.id,
        user_id: r.user_id || 0,
        user_name: r.user?.name || "Anonim",
        user_avatar: r.user?.avatar_url,
        text: r.comment || r.text || "",
        image_url: r.image_url || null,
        created_at: r.created_at,
      }));
      setLiveComments(comments);
    } catch (error) {
      console.error("Error sending comment:", error);
      alert("Gagal mengirim komentar.");
    } finally {
      setSendingComment(false);
      setUploadingImage(false);
    }
  };

  // Helper function to format opening_hours - shows current day real-time from database
  const formatOpeningHours = (openingHours: Record<string, any> | null | undefined): string => {
    if (!openingHours) return "Senin-Minggu, Jam 07:00-22:00";

    // Get current day in Indonesian
    const tz = "Asia/Jakarta";
    const f = new Intl.DateTimeFormat("id-ID", {
      timeZone: tz,
      weekday: "long",
    });
    const currentDayName = f.format(new Date()); // Senin, Selasa, etc.

    const dayMap: Record<string, string> = {
      Mon: "mon",
      Tue: "tue",
      Wed: "wed",
      Thu: "thu",
      Fri: "fri",
      Sat: "sat",
      Sun: "sun",
    };

    const fShort = new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "short" });
    const wd = fShort.format(new Date());
    const dayKey = dayMap[wd] || "mon";
    const dayData = openingHours[dayKey];

    if (!dayData || !dayData.open) {
      return `${currentDayName}: Tutup`;
    }

    if (dayData.allDay) {
      return `${currentDayName}: Buka 24 Jam`;
    }

    const ranges = dayData.ranges || [];
    if (ranges.length === 0) {
      return `${currentDayName}: Tutup`;
    }

    // Format time ranges
    const timeRanges = ranges.map((r: { start: string; end: string }) =>
      `${r.start}-${r.end}`
    ).join(", ");

    return `${currentDayName}, Jam ${timeRanges}`;
  };

  // Helper function to check if cafe is currently open
  const checkIsOpenNow = (openingHours: Record<string, any> | null | undefined): { open: boolean; message: string } => {
    if (!openingHours) {
      return { open: false, message: "Tutup" };
    }

    const tz = "Asia/Jakarta";
    const now = new Date();
    const f = new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      weekday: "short",
    });
    const parts = Object.fromEntries(f.formatToParts(now).map(p => [p.type, p.value]));
    const hh = parseInt(parts.hour ?? "0", 10);
    const mm = parseInt(parts.minute ?? "0", 10);
    const minutes = hh * 60 + mm;
    const wd = (parts.weekday ?? "Mon").slice(0, 3);
    const dayMap: Record<string, string> = {
      Mon: "mon", Tue: "tue", Wed: "wed", Thu: "thu", Fri: "fri", Sat: "sat", Sun: "sun",
    };
    const dayKey = dayMap[wd] || "mon";
    const day = openingHours[dayKey];

    if (!day || !day.open) {
      return { open: false, message: "Tutup" };
    }

    if (day.allDay) {
      return { open: true, message: "Buka 24 Jam" };
    }

    const ranges = day.ranges || [];
    for (const range of ranges) {
      const startStr = range.start || "";
      const endStr = range.end || "";
      const [startH, startM] = startStr.split(":").map((x: string) => parseInt(x, 10) || 0);
      const [endH, endM] = endStr.split(":").map((x: string) => parseInt(x, 10) || 0);
      const start = startH * 60 + startM;
      const end = endH * 60 + endM;

      if (minutes >= start && minutes < end) {
        // Calculate closing time
        const closeH = Math.floor(end / 60);
        const closeM = end % 60;
        const closeStr = `${closeH.toString().padStart(2, '0')}:${closeM.toString().padStart(2, '0')}`;
        return { open: true, message: `Buka - Tutup ${closeStr}` };
      }
    }

    return { open: false, message: "Tutup" };
  };

  // State for force re-render to update open status
  const [, setForceUpdate] = useState(0);

  // Get open/closed status
  const openStatus = useMemo(() => checkIsOpenNow(cafe?.opening_hours), [cafe?.opening_hours]);

  // Update open status every minute for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to update open status
      setForceUpdate(prev => prev + 1);
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Format time helper
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins}m lalu`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}j lalu`;
    return date.toLocaleDateString("id-ID");
  };

  // Helper function to resolve image URLs
  const resolveImageUrl = (url: string | null | undefined): string => {
    if (!url) return "/img/home/bg-section.jpg";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return url;
  };

  // Helper function to convert lat/lng to number
  const toNum = (v: number | string | null | undefined): number | null => {
    if (v === null || v === undefined) return null;
    if (typeof v === "number") return Number.isFinite(v) ? v : null;
    const n = parseFloat(v as string);
    return Number.isFinite(n) ? n : null;
  };

  // Helper function to get Google Maps link with coordinates
  const getMapsLink = (cafe: Cafe | null): string => {
    if (!cafe) return "https://www.google.com/maps";

    const lat = toNum(cafe.lat as string | number | null | undefined);
    const lng = toNum(cafe.lng as string | number | null | undefined);

    if (lat !== null && lng !== null) {
      return `https://www.google.com/maps?q=${lat},${lng}`;
    }

    // Fallback to address search if coordinates not available
    const q = [cafe.name, cafe.address].filter(Boolean).join(" ");
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  };

  // Mengelompokkan menu berdasarkan kategori (seperti di gambar)
  const menuCategories = useMemo(() => {
    const groups: Record<string, MenuItem[]> = {};
    menus.forEach((item) => {
      const cat = item.category || "Lainnya";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [menus]);

  const avgRating = useMemo(() => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((s, r) => s + Number(r.rating || 0), 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }, [reviews]);

  // Fetch user's favorites on load
  useEffect(() => {
    if (!user) {
      setFavorites([]);
      setIsFavorite(false);
      return;
    }
    const fetchFavorites = async () => {
      try {
        const res = await apiMyFavorites() as any;
        const favIds = res.data?.map((f: any) => f.id || f.cafe_id) || [];
        setFavorites(favIds);
        setIsFavorite(favIds.includes(cafeId));
      } catch (e) {
        console.error("Error fetching favorites:", e);
      }
    };
    fetchFavorites();
  }, [user, cafeId]);

  // Toggle favorite
  const handleToggleFavorite = async () => {
    if (!user) {
      alert("Silakan login terlebih dahulu untuk menyimpan cafe.");
      return;
    }
    try {
      if (isFavorite) {
        await apiRemoveFavorite(cafeId);
        setFavorites(prev => prev.filter(id => id !== cafeId));
        setIsFavorite(false);
      } else {
        await apiAddFavorite(cafeId);
        setFavorites(prev => [...prev, cafeId]);
        setIsFavorite(true);
      }
    } catch (e) {
      console.error("Error toggling favorite:", e);
      alert("Gagal menyimpan cafe.");
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Silakan login terlebih dahulu.");
    try {
      setSubmitting(true);
      const created = await apiCreateReview(cafeId, { rating: newRating, text: newText.trim() }) as any;
      // Transform response to ensure consistent format with Review type
      const reviewWithAuthor: Review = {
        id: created.id,
        author: created.author || created.user?.name || "Anonim",
        rating: created.rating,
        comment: created.comment || created.text || "",
        text: created.text || created.comment || "",
        image_url: created.image_url || null,
        created_at: created.created_at || new Date().toISOString(),
        updated_at: created.updated_at || new Date().toISOString(),
        user: created.user,
        cafe_id: created.cafe_id
      };
      setReviews((prev) => [reviewWithAuthor, ...prev]);
      setNewText("");
      // Show success message
      alert("Ulasan berhasil dikirim!");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Gagal mengirim ulasan. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading while params are loading or data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <p className="pt-32 text-center text-sm">Memuat...</p>
      </div>
    );
  }

  // Show error state if cafeId is invalid
  if (!cafeId) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <p className="pt-32 text-center text-sm text-red-500">
          {error || "ID cafe tidak valid"}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#271F01] pb-20">
      <Navbar />

      <main className="container mx-auto px-4 md:px-12 pt-24 space-y-6">
        {/* Tombol Back */}
        <button onClick={() => router.back()} className="flex items-center gap-1 text-2xl font-bold ">
          <ArrowLeft size={40} /> Back
        </button>

        {/* TOP SECTION: Gallery & Review Form */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Gallery - 8 columns */}
          <div className="lg:col-span-8 relative rounded-2xl overflow-hidden bg-gray-100">
            {galleryPhotos.length > 0 ? (
              <>
                {/* Main Image Slider */}
                <div
                  className="w-full h-[580px] relative"
                  onMouseEnter={stopSlide}
                  onMouseLeave={startSlide}
                >
                  <Image
                    src={resolveImageUrl(galleryPhotos[activeGalleryIndex])}
                    alt={`Gallery ${activeGalleryIndex + 1}`}
                    fill
                    className="object-cover"
                    priority
                  />

                  {/* Navigation arrows */}
                  {galleryPhotos.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevGallery}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition z-10"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button
                        onClick={handleNextGallery}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition z-10"
                      >
                        <ChevronRight size={24} />
                      </button>
                    </>
                  )}
                </div>

                {/* Dots indicator - positioned below image */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-4 py-2 bg-black/60 rounded-full z-20 backdrop-blur-sm">
                  {galleryPhotos.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveGalleryIndex(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === activeGalleryIndex ? "bg-white scale-125 shadow-lg" : "bg-white/50 hover:bg-white/80"}`}
                    />
                  ))}
                </div>
              </>
            ) : (
              /* Fallback when no gallery photos */
              <div className="w-full h-[450px] relative overflow-hidden">
                <Image
                  src={resolveImageUrl(cafe?.cover_url || cafe?.photo_url)}
                  alt={cafe?.name || "Cafe"}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
          </div>

          {/* Sidebar Review - 4 columns */}
          <div className="lg:col-span-4 space-y-4">
            <div className="border rounded-2xl p-6 bg-white shadow-sm">
              <h3 className="font-bold text-lg mb-3">Tulis ulasan</h3>
              {/* Show loading while checking auth status */}
              {authLoading ? (
                <div className="text-center py-4 text-gray-400">
                  <p className="text-sm">Memuat...</p>
                </div>
              ) : user?.role === "mitra" ? (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">Mitra tidak dapat mengirim ulasan.</p>
                </div>
              ) : !user ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 mb-2">Silakan login untuk mengirim ulasan.</p>
                  <button
                    onClick={() => router.push("/login")}
                    className="bg-[#271F01] text-white px-4 py-2 rounded-lg font-bold text-sm"
                  >
                    Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-400">Rating</label>
                    <div className="flex gap-1 py-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="transition-transform hover:scale-110 focus:outline-none"
                        >
                          <Star
                            size={24}
                            className={
                              newRating > 0 && star <= (hoverRating || newRating)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }
                          />
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {newRating > 0 ? `${newRating} Bintang` : "Pilih rating"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Ulasan</label>
                    <textarea
                      value={newText}
                      onChange={(e) => setNewText(e.target.value)}
                      className="w-full border rounded-lg p-2 text-sm h-24 bg-gray-50"
                      placeholder="Tulis ulasan menarik anda mengenai cafe ini..."
                    />
                  </div>
                  <button className="w-full bg-[#271F01] hover:bg-[#3D2E00] text-white py-2 rounded-lg font-bold text-sm">
                    Kirim Ulasan
                  </button>
                </form>
              )}
            </div>

            <div className="border rounded-2xl p-5 bg-white shadow-sm h-[205px] overflow-y-auto">
              <h3 className="font-bold text-sm mb-3">Ulasan Pengunjung</h3>
              {reviews.map((r, i) => (
                <div key={i} className="mb-3 border-b pb-2 last:border-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-xs">{r.user?.name || "Anonim"}</span>
                  </div>
                  <p className="text-[10px] text-gray-600 leading-tight">{r.comment || r.text}</p>
                  <div className="flex justify-between items-center mt-1">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={10}
                          className={star <= (r.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                        />
                      ))}
                    </div>
                    {r.created_at && (
                      <span className="text-[8px] text-gray-400">
                        {new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* INFO SECTION */}
        <section className="relative  mx-auto max-w-7xl">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row justify-between items-center gap-4">

            <div className="space-y-2 w-full md:w-auto">
              {/* Baris 1: Nama dan Rating */}
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#271F01] tracking-tight">
                  {cafe?.name}
                </h2>
                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-md text-yellow-400 font-bold text-sm">
                  <Star size={12} fill="currentColor" /> {avgRating}
                  <span className="text-gray-400 font-normal ml-1 text-xs">({reviews.length})</span>
                </div>
              </div>

              {/* Baris 2: Alamat */}
              <div className="flex items-center gap-1 text-gray-500">
                <MapPin size={14} className="text-red-500" />
                <p className="text-xs font-medium">{cafe?.address}</p>
              </div>
            </div>

            {/* Jam Operasional & Action */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${openStatus.open
                    ? 'bg-green-100 text-green-600'
                    : 'bg-red-100 text-red-600'
                    }`}>
                    {openStatus.open ? 'BUKA' : 'TUTUP'}
                  </span>
                  <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">
                    Jam Operasional
                  </span>
                </div>
                <span className="text-xs font-bold text-[#271F01] uppercase">
                  {formatOpeningHours(cafe?.opening_hours)}
                </span>
              </div>

              <div className="h-8 w-[1px] bg-gray-200 hidden md:block"></div>

              <button
                onClick={handleToggleFavorite}
                className={`p-2 rounded-xl transition-all group ${isFavorite ? 'bg-yellow-100 text-yellow-400' : 'bg-[#F7F5F2] hover:bg-gray-200 text-[#271F01]'}`}
              >
                <Bookmark size={20} className={isFavorite ? "fill-current" : ""} />
              </button>
            </div>

          </div>
        </section>

        {/* LIVE COMMENT / GALLERY SECTION */}
        <section className="pt-10">
          <h3 className="text-xl font-bold mb-6">Galeri</h3>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {galleryPhotos.length > 0 ? (
              galleryPhotos.map((photo, idx) => (
                <div
                  key={idx}
                  className="min-w-[180px] aspect-[3/4] relative rounded-xl overflow-hidden border cursor-pointer hover:opacity-90 transition"
                  onClick={() => {
                    setLightboxIndex(idx);
                    setLightboxOpen(true);
                  }}
                >
                  <Image
                    src={resolveImageUrl(photo)}
                    alt={`Gallery ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))
            ) : (
              // Fallback placeholder jika tidak ada foto
              <div className="min-w-[180px] aspect-[3/4] relative rounded-xl overflow-hidden border bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-sm">Belum ada foto</span>
              </div>
            )}
          </div>
        </section>

        {/* MENU SECTION */}
        <section className="space-y-10 pt-4">
          {Object.entries(menuCategories).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-xl font-bold mb-6 border-b pb-2">{category}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                {items.map((item) => (
                  <div key={item.id} className="group cursor-pointer">
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3 border">
                      <Image src={item.photo_url || "/drink.png"} alt={item.name} fill className="object-cover" />
                      <div className="absolute top-2 right-2 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                        {Math.round(item.price / 1000)}K
                      </div>
                    </div>
                    <h4 className="font-bold text-center text-sm group-hover:underline">{item.name}</h4>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* LIVE COMMENT SECTION */}
        <section className="pt-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <MessageCircle size={20} />
              Live Comment
            </h3>
            <button
              onClick={() => setShowLiveComment(!showLiveComment)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              {showLiveComment ? "Sembunyikan" : "Tampilkan"}
            </button>
          </div>

          {showLiveComment && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Live Comments Feed */}
              <div className="lg:col-span-2 bg-gray-50 rounded-2xl p-4 h-[400px] overflow-y-auto">
                <div className="space-y-4">
                  {liveComments.length > 0 ? (
                    liveComments.map((comment) => (
                      <div key={comment.id} className="flex gap-3 bg-white p-3 rounded-xl shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {comment.user_avatar ? (
                            <Image
                              src={comment.user_avatar}
                              alt={comment.user_name}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            comment.user_name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm">{comment.user_name}</span>
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <Clock size={12} />
                              {formatTime(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{comment.text}</p>
                          {comment.image_url && (
                            <div className="mt-2 relative rounded-lg overflow-hidden max-w-[200px]">
                              <Image
                                src={resolveImageUrl(comment.image_url)}
                                alt="Comment image"
                                width={200}
                                height={150}
                                className="object-cover"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-gray-400">
                      <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
                      <p>Belum ada komentar</p>
                      <p className="text-sm">Jadilah yang pertama berkomentar!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Comment Input */}
              <div className="lg:col-span-1">
                <form onSubmit={handleSendLiveComment} className="bg-white rounded-2xl p-4 shadow-sm sticky top-4">
                  <h4 className="font-bold text-sm mb-3">Tulis Komentar</h4>
                  <div className="space-y-3">
                    <textarea
                      value={newLiveComment}
                      onChange={(e) => setNewLiveComment(e.target.value)}
                      placeholder="Bagikan pengalaman Anda di cafe ini..."
                      className="w-full border rounded-xl p-3 text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      disabled={sendingComment}
                    />


                    {/* Image Preview */}
                    {previewImage && (
                      <div className="relative">
                        <Image
                          src={previewImage}
                          alt="Preview"
                          width={200}
                          height={150}
                          className="rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={removeSelectedImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}

                    {/* Image Upload */}
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="comment-image"
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer hover:bg-gray-50 transition ${selectedCommentImage ? 'border-green-500 bg-green-50' : ''}`}
                      >
                        <Camera size={18} className={selectedCommentImage ? 'text-green-600' : 'text-gray-500'} />
                        <span className="text-sm text-gray-600">
                          {selectedCommentImage ? 'Ganti Foto' : 'Tambah Foto'}
                        </span>
                      </label>
                      <input
                        type="file"
                        id="comment-image"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        disabled={sendingComment}
                      />
                      {selectedCommentImage && (
                        <span className="text-xs text-green-600">✓ Foto dipilih</span>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={sendingComment || (!newLiveComment.trim() && !selectedCommentImage) || uploadingImage}
                      className="w-full bg-[#271F01] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#3d3420] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingComment || uploadingImage ? (
                        <span className="animate-pulse">
                          {uploadingImage ? 'Mengunggah foto...' : 'Mengirim...'}
                        </span>
                      ) : (
                        <>
                          <Send size={16} />
                          Kirim Komentar
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

            </div>
          )}
        </section>

        {/* MAPS SECTION */}
        <section className="pt-6 flex flex-col md:flex-row gap-6 items-center">
          <button
            onClick={() => window.open(getMapsLink(cafe))}
            className="w-full md:w-64 bg-[#271F01] hover:bg-[#3D2E00] text-white py-4 rounded-xl flex items-center justify-center gap-2 font-bold"
          >
            <MapPin size={18} /> Buka di Google Maps
          </button>
        </section>

        {/* Lightbox Modal */}

        {lightboxOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition"
            >
              <X size={32} />
            </button>

            {/* Previous button */}
            {galleryPhotos.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev - 1 + galleryPhotos.length) % galleryPhotos.length);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition p-2"
              >
                <ChevronLeft size={48} />
              </button>
            )}

            {/* Main image */}
            <div className="relative w-full max-w-4xl h-[80vh] p-4" onClick={() => setLightboxOpen(false)}>
              <Image
                src={resolveImageUrl(galleryPhotos[lightboxIndex])}
                alt={`Gallery ${lightboxIndex + 1}`}
                fill
                className="object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Next button */}
            {galleryPhotos.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev + 1) % galleryPhotos.length);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition p-2"
              >
                <ChevronRight size={48} />
              </button>
            )}

            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
              {lightboxIndex + 1} / {galleryPhotos.length}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
