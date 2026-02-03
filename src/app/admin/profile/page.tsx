"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        title: "",
        bio: "",
        avatar: "",
        social: {
            github: "",
            linkedin: "",
            email: "",
        },
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profileDoc = await getDoc(doc(db, "portfolios", "default", "profile", "main"));
                if (profileDoc.exists()) {
                    setFormData(profileDoc.data() as any);
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");

        try {
            await setDoc(doc(db, "portfolios", "default", "profile", "main"), formData);
            setMessage("✅ Profil başarıyla kaydedildi!");
            setTimeout(() => setMessage(""), 3000);
        } catch (error: any) {
            setMessage("❌ Hata: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white shadow-sm">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-900">Profil Düzenle</h1>
                        <button
                            onClick={() => router.push("/admin")}
                            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            ← Geri Dön
                        </button>
                    </div>
                </header>

                {/* Form */}
                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-8 space-y-6">
                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                İsim Soyisim *
                            </label>
                            <input
                                id="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Ahmet Furkan"
                            />
                        </div>

                        {/* Title */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                Ünvan *
                            </label>
                            <input
                                id="title"
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Full-Stack Developer"
                            />
                        </div>

                        {/* Bio */}
                        <div>
                            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                                Kısa Bio *
                            </label>
                            <textarea
                                id="bio"
                                required
                                rows={4}
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Kendimi tanıtan kısa bir metin..."
                            />
                        </div>

                        {/* Avatar URL */}
                        <div>
                            <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-2">
                                Profil Fotoğrafı URL (opsiyonel)
                            </label>
                            <input
                                id="avatar"
                                type="url"
                                value={formData.avatar}
                                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="https://example.com/avatar.jpg"
                            />
                            {formData.avatar && (
                                <img
                                    src={formData.avatar}
                                    alt="Preview"
                                    className="mt-3 w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                                />
                            )}
                        </div>

                        {/* Social Links */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sosyal Medya</h3>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="github" className="block text-sm font-medium text-gray-700 mb-2">
                                        GitHub URL
                                    </label>
                                    <input
                                        id="github"
                                        type="url"
                                        value={formData.social.github}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            social: { ...formData.social, github: e.target.value }
                                        })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="https://github.com/kullaniciadi"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-2">
                                        LinkedIn URL
                                    </label>
                                    <input
                                        id="linkedin"
                                        type="url"
                                        value={formData.social.linkedin}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            social: { ...formData.social, linkedin: e.target.value }
                                        })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="https://linkedin.com/in/kullaniciadi"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        E-posta
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={formData.social.email}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            social: { ...formData.social, email: e.target.value }
                                        })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="ornek@email.com"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Message */}
                        {message && (
                            <div className={`p-4 rounded-lg ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {message}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? "Kaydediliyor..." : "Kaydet"}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push("/")}
                                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Önizle
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </ProtectedRoute>
    );
}
