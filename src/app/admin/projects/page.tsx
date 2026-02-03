"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { useRouter } from "next/navigation";

interface Project {
    id: string;
    title: string;
    description: string;
    image?: string;
    tags: string[];
    link?: string;
    order: number;
}

export default function ProjectsPage() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [message, setMessage] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        image: "",
        tags: "",
        link: "",
    });

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const projectsQuery = query(
                collection(db, "portfolios", "default", "projects"),
                orderBy("order", "asc")
            );
            const snapshot = await getDocs(projectsQuery);
            const projectsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Project[];
            setProjects(projectsData);
        } catch (error) {
            console.error("Error fetching projects:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");

        const projectData = {
            title: formData.title,
            description: formData.description,
            image: formData.image || "",
            tags: formData.tags.split(",").map(t => t.trim()).filter(t => t),
            link: formData.link || "",
            order: editingId ? projects.find(p => p.id === editingId)?.order || 0 : projects.length,
        };

        try {
            if (editingId) {
                await updateDoc(doc(db, "portfolios", "default", "projects", editingId), projectData);
                setMessage("✅ Proje güncellendi!");
            } else {
                await addDoc(collection(db, "portfolios", "default", "projects"), projectData);
                setMessage("✅ Proje eklendi!");
            }

            resetForm();
            fetchProjects();
            setTimeout(() => setMessage(""), 3000);
        } catch (error: any) {
            setMessage("❌ Hata: " + error.message);
        }
    };

    const handleEdit = (project: Project) => {
        setFormData({
            title: project.title,
            description: project.description,
            image: project.image || "",
            tags: project.tags.join(", "),
            link: project.link || "",
        });
        setEditingId(project.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bu projeyi silmek istediğinizden emin misiniz?")) return;

        try {
            await deleteDoc(doc(db, "portfolios", "default", "projects", id));
            setMessage("✅ Proje silindi!");
            fetchProjects();
            setTimeout(() => setMessage(""), 3000);
        } catch (error: any) {
            setMessage("❌ Hata: " + error.message);
        }
    };

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            image: "",
            tags: "",
            link: "",
        });
        setEditingId(null);
        setShowForm(false);
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
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-900">Proje Yönetimi</h1>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowForm(!showForm)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
                            >
                                {showForm ? "İptal" : "+ Yeni Proje"}
                            </button>
                            <button
                                onClick={() => router.push("/admin")}
                                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                ← Geri Dön
                            </button>
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Message */}
                    {message && (
                        <div className={`mb-6 p-4 rounded-lg ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {message}
                        </div>
                    )}

                    {/* Form */}
                    {showForm && (
                        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-8 mb-8 space-y-6">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingId ? "Proje Düzenle" : "Yeni Proje Ekle"}
                            </h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Proje Başlığı *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="E-ticaret Sitesi"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Açıklama *
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Proje hakkında kısa açıklama..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Görsel URL (opsiyonel)
                                </label>
                                <input
                                    type="url"
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="https://example.com/project.jpg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Teknolojiler (virgülle ayırın)
                                </label>
                                <input
                                    type="text"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="React, Next.js, Firebase"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Proje Linki (opsiyonel)
                                </label>
                                <input
                                    type="url"
                                    value={formData.link}
                                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="https://project-demo.com"
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                                >
                                    {editingId ? "Güncelle" : "Ekle"}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    İptal
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Projects List */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-900">Mevcut Projeler ({projects.length})</h2>

                        {projects.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-md p-12 text-center">
                                <p className="text-gray-600 mb-4">Henüz proje eklenmedi.</p>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                >
                                    İlk Projenizi Ekleyin
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {projects.map((project) => (
                                    <div key={project.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                                        {project.image && (
                                            <img src={project.image} alt={project.title} className="w-full h-48 object-cover" />
                                        )}
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
                                            <p className="text-gray-600 mb-4 line-clamp-3">{project.description}</p>

                                            {project.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {project.tags.map((tag, i) => (
                                                        <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(project)}
                                                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                                                >
                                                    Düzenle
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(project.id)}
                                                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors font-medium"
                                                >
                                                    Sil
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
