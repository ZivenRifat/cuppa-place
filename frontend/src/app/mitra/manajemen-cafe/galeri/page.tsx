// src/app/mitra/manajemen-cafe/galeri/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import {
    apiMyCafes,
    apiUploadGallery,
    apiDeleteGalleryPhoto,
    apiArchiveGalleryPhoto,
    apiUnarchiveGalleryPhoto,
    apiGetAllGalleryPhotos,
    GalleryPhoto,
    GalleryPhotosResp,
    API_BASE
} from "@/lib/api";
import type { Cafe } from "@/types/domain";
import {
    Upload,
    Trash2,
    Archive,
    RotateCcw,
    Image as ImageIcon,
    Loader2,
    X,
    Eye,
    EyeOff
} from "lucide-react";

export default function GaleriPage() {
    const [cafe, setCafe] = useState<Cafe | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadCafe();
    }, []);

    const loadCafe = async () => {
        try {
            const res = await apiMyCafes();
            const cafes = res.data || [];
            if (cafes.length > 0) {
                setCafe(cafes[0]);
            }
        } catch (err) {
            console.error("Failed to load cafe:", err);
        } finally {
            setLoading(false);
        }
    };

    const loadPhotos = async () => {
        if (!cafe) return;
        try {
            const resp = await apiGetAllGalleryPhotos(cafe.id);
            setPhotos(resp.data);
            setTotalCount(resp.active_count);
        } catch (err) {
            console.error("Failed to load photos:", err);
        }
    };

    useEffect(() => {
        if (cafe) {
            loadPhotos();
        }
    }, [cafe]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedFiles(files);

        // Create preview URLs
        const urls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(urls);
    };

    const handleUpload = async () => {
        if (!cafe || selectedFiles.length === 0) return;

        setUploading(true);
        try {
            await apiUploadGallery(cafe.id, selectedFiles);
            alert("Foto suasana berhasil diupload!");
            setSelectedFiles([]);
            setPreviewUrls([]);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            loadPhotos();
        } catch (err: any) {
            console.error("Upload failed:", err);
            alert(err.message || "Gagal upload foto");
        } finally {
            setUploading(false);
        }
    };

    const handleArchive = async (photoId: number) => {
        if (!cafe || !confirm("Arsipkan foto ini? Foto akan disembunyikan dari galeri.")) return;

        setActionLoading(photoId);
        try {
            await apiArchiveGalleryPhoto(cafe.id, photoId);
            loadPhotos();
        } catch (err: any) {
            console.error("Archive failed:", err);
            alert(err.message || "Gagal arsipkan foto");
        } finally {
            setActionLoading(null);
        }
    };

    const handleUnarchive = async (photoId: number) => {
        if (!cafe || !confirm("Pulihkan foto dari arsip?")) return;

        setActionLoading(photoId);
        try {
            await apiUnarchiveGalleryPhoto(cafe.id, photoId);
            loadPhotos();
        } catch (err: any) {
            console.error("Unarchive failed:", err);
            alert(err.message || "Gagal pulihkan foto");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (photoId: number) => {
        if (!cafe || !confirm("Yakin hapus foto ini secara permanen? Tindakan ini tidak dapat dibatalkan.")) return;

        setActionLoading(photoId);
        try {
            await apiDeleteGalleryPhoto(cafe.id, photoId);
            loadPhotos();
        } catch (err: any) {
            console.error("Delete failed:", err);
            alert(err.message || "Gagal hapus foto");
        } finally {
            setActionLoading(null);
        }
    };

    const resolveUrl = (url: string | null | undefined): string => {
        if (!url) return "";
        if (url.startsWith("http://") || url.startsWith("https://")) return url;

        const base = API_BASE?.replace(/\/+$/, "") || "";
        const path = url.startsWith("/") ? url : `/${url}`;
        return `${base}${path}`;
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-[#2b210a]" />
            </div>
        );
    }

    if (!cafe) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
                    Anda belum memiliki cafe. Silakan daftar sebagai mitra terlebih dahulu.
                </div>
            </div>
        );
    }

    const activePhotos = photos.filter(p => !p.is_archived);
    const archivedPhotos = photos.filter(p => p.is_archived);
    const filteredPhotos = activeTab === "active" ? activePhotos : archivedPhotos;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#2b210a]">Galeri Foto Suasana</h1>
                <p className="text-gray-600">Kelola foto suasana cafe Anda</p>
            </div>

            {/* Stats */}
            <div className="flex gap-4 mb-6">
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                    <span className="text-gray-600">Total Foto: </span>
                    <span className="font-semibold text-[#2b210a]">{totalCount}</span>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                    <span className="text-gray-600">Diarsipkan: </span>
                    <span className="font-semibold text-gray-500">{archivedPhotos.length}</span>
                </div>
            </div>

            {/* Upload Section */}
            <div className="bg-white p-6 rounded-lg border border-gray-300/40 shadow-md mb-8">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Upload Foto Baru
                </h2>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#2b210a]/50 transition-colors">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        id="photo-upload"
                    />
                    <label
                        htmlFor="photo-upload"
                        className="cursor-pointer inline-flex flex-col items-center justify-center"
                    >
                        <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                        <span className="text-gray-600">Klik untuk memilih foto</span>
                        <span className="text-sm text-gray-500 mt-1">
                            Format JPG/PNG, jumlah foto tidak terbatas
                        </span>
                    </label>
                </div>

                {/* Previews */}
                {previewUrls.length > 0 && (
                    <div className="mt-4">
                        <h3 className="text-sm font-medium mb-2">Preview ({previewUrls.length} foto)</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {previewUrls.map((url, idx) => (
                                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                                    <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => {
                                            const newFiles = selectedFiles.filter((_, i) => i !== idx);
                                            const newPreviews = previewUrls.filter((_, i) => i !== idx);
                                            setSelectedFiles(newFiles);
                                            setPreviewUrls(newPreviews);
                                        }}
                                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={handleUpload}
                                disabled={uploading || selectedFiles.length === 0}
                                className="bg-[#2b210a] text-white px-6 py-2 rounded-md disabled:opacity-50 flex items-center gap-2"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Mengupload...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4" />
                                        Upload {selectedFiles.length} Foto
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedFiles([]);
                                    setPreviewUrls([]);
                                    if (fileInputRef.current) fileInputRef.current.value = "";
                                }}
                                className="bg-gray-200 px-6 py-2 rounded-md flex items-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                Batal
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg border border-gray-300/40 shadow-md overflow-hidden">
                {/* Tab Headers */}
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab("active")}
                        className={`flex-1 px-6 py-3 text-center font-medium flex items-center justify-center gap-2 ${activeTab === "active"
                            ? "bg-white text-[#2b210a] border-b-2 border-[#2b210a]"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                            }`}
                    >
                        <Eye className="w-4 h-4" />
                        Foto Aktif
                        {activePhotos.length > 0 && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                                {activePhotos.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("archived")}
                        className={`flex-1 px-6 py-3 text-center font-medium flex items-center justify-center gap-2 ${activeTab === "archived"
                            ? "bg-white text-[#2b210a] border-b-2 border-[#2b210a]"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                            }`}
                    >
                        <EyeOff className="w-4 h-4" />
                        Diarsipkan
                        {archivedPhotos.length > 0 && (
                            <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                                {archivedPhotos.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {filteredPhotos.length === 0 ? (
                        <div className="text-center py-12">
                            <ImageIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">
                                {activeTab === "active"
                                    ? "Belum ada foto suasana. Upload foto pertama Anda!"
                                    : "Tidak ada foto diarsipkan."}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {filteredPhotos.map((photo) => (
                                <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                                    <img
                                        src={resolveUrl(photo.url)}
                                        alt={`Foto suasana`}
                                        className="w-full h-full object-cover"
                                    />

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                        {activeTab === "active" ? (
                                            <>
                                                <button
                                                    onClick={() => handleArchive(photo.id)}
                                                    disabled={actionLoading === photo.id}
                                                    className="bg-yellow-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-yellow-600 flex items-center gap-1"
                                                >
                                                    {actionLoading === photo.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Archive className="w-4 h-4" />
                                                    )}
                                                    Arsipkan
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(photo.id)}
                                                    disabled={actionLoading === photo.id}
                                                    className="bg-red-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-red-700 flex items-center gap-1"
                                                >
                                                    {actionLoading === photo.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                    Hapus
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleUnarchive(photo.id)}
                                                    disabled={actionLoading === photo.id}
                                                    className="bg-green-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-green-700 flex items-center gap-1"
                                                >
                                                    {actionLoading === photo.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <RotateCcw className="w-4 h-4" />
                                                    )}
                                                    Pulihkan
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(photo.id)}
                                                    disabled={actionLoading === photo.id}
                                                    className="bg-red-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-red-700 flex items-center gap-1"
                                                >
                                                    {actionLoading === photo.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                    Hapus Permanen
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {/* Archived badge */}
                                    {photo.is_archived && (
                                        <div className="absolute top-2 left-2 bg-gray-800/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                            <Archive className="w-3 h-3" />
                                            Diarsipkan
                                        </div>
                                    )}

                                    {/* Date */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                                        <p className="text-white text-xs">{formatDate(photo.created_at)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Info Box */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-2">Tips:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Arsipkan foto jika ingin menyembunyikannya sementara dari galeri publik</li>
                    <li>• Foto diarsipkan tidak terbatas dan tidak dihitung ke batas (jika ada)</li>
                    <li>• Anda dapat memulihkan foto dari arsip kapan saja</li>
                    <li>• Foto yang dihapus secara permanen tidak dapat dikembalikan</li>
                </ul>
            </div>
        </div>
    );
}

