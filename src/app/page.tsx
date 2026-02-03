"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, query, orderBy } from "firebase/firestore";
import Link from "next/link";

interface Profile {
  name: string;
  title: string;
  bio: string;
  avatar?: string;
  social?: {
    github?: string;
    linkedin?: string;
    email?: string;
  };
}

interface Project {
  id: string;
  title: string;
  description: string;
  image?: string;
  tags: string[];
  link?: string;
  order: number;
}

export default function PortfolioPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch profile
        const profileDoc = await getDoc(doc(db, "portfolios", "default", "profile", "main"));
        if (profileDoc.exists()) {
          setProfile(profileDoc.data() as Profile);
        }

        // Fetch projects
        const projectsQuery = query(
          collection(db, "portfolios", "default", "projects"),
          orderBy("order", "asc")
        );
        const projectsSnapshot = await getDocs(projectsQuery);
        const projectsData = projectsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Project[];
        setProjects(projectsData);
      } catch (error) {
        console.error("Error fetching portfolio data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Portföy yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            {profile?.avatar && (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-32 h-32 rounded-full mx-auto mb-6 border-4 border-white shadow-xl"
              />
            )}
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              {profile?.name || "Portföy Sahibi"}
            </h1>
            <p className="text-2xl md:text-3xl text-blue-100 mb-6">
              {profile?.title || "Geliştirici"}
            </p>
            <p className="text-lg md:text-xl text-blue-50 max-w-2xl mx-auto mb-8">
              {profile?.bio || "Henüz profil bilgisi eklenmedi. Admin panelinden profilinizi oluşturun."}
            </p>

            {/* Social Links */}
            {profile?.social && (
              <div className="flex justify-center gap-4">
                {profile.social.github && (
                  <a
                    href={profile.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                  >
                    GitHub
                  </a>
                )}
                {profile.social.linkedin && (
                  <a
                    href={profile.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                  >
                    LinkedIn
                  </a>
                )}
                {profile.social.email && (
                  <a
                    href={`mailto:${profile.social.email}`}
                    className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                  >
                    İletişim
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Projelerim</h2>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">Henüz proje eklenmedi.</p>
            <Link
              href="/admin/projects"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              İlk Projenizi Ekleyin
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {project.image && (
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{project.title}</h3>
                  <p className="text-gray-600 mb-4">{project.description}</p>

                  {/* Tags */}
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Link */}
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Projeyi Görüntüle →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Admin Link (Fixed bottom-right) */}
      <Link
        href="/admin"
        className="fixed bottom-6 right-6 px-6 py-3 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors font-semibold"
      >
        Admin Paneli →
      </Link>
    </div>
  );
}
