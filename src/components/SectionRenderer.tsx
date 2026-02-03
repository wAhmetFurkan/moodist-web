"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";

interface Section {
    id: string;
    type: string;
    content: any;
    visible: boolean;
    order: number;
}

export default function SectionRenderer() {
    const [sections, setSections] = useState<Section[]>([]);

    useEffect(() => {
        const fetchSections = async () => {
            try {
                const sectionsQuery = query(
                    collection(db, "portfolios", "default", "sections"),
                    where("visible", "==", true),
                    orderBy("order", "asc")
                );
                const snapshot = await getDocs(sectionsQuery);
                const sectionsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Section[];
                setSections(sectionsData);
            } catch (error) {
                console.error("Error fetching sections:", error);
            }
        };

        fetchSections();
    }, []);

    const renderSection = (section: Section) => {
        switch (section.type) {
            case "skills":
                return <SkillsSection key={section.id} data={section.content} />;
            case "testimonials":
                return <TestimonialsSection key={section.id} data={section.content} />;
            case "about":
                return <AboutSection key={section.id} data={section.content} />;
            case "contact":
                return <ContactSection key={section.id} data={section.content} />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-16">
            {sections.map(section => renderSection(section))}
        </div>
    );
}

// Skills Section Component
function SkillsSection({ data }: { data: any }) {
    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
                {data.title || "My Skills"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {data.skills?.map((skill: any, index: number) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow"
                    >
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{skill.name}</h3>
                        {skill.level && (
                            <p className="text-sm text-blue-600 font-medium">{skill.level}</p>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}

// Testimonials Section Component
function TestimonialsSection({ data }: { data: any }) {
    return (
        <section className="bg-gray-50 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
                    {data.title || "Testimonials"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {data.testimonials?.map((testimonial: any, index: number) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl shadow-md p-6"
                        >
                            <p className="text-gray-700 italic mb-4">"{testimonial.text}"</p>
                            <div className="flex items-center gap-3">
                                {testimonial.avatar && (
                                    <img
                                        src={testimonial.avatar}
                                        alt={testimonial.name}
                                        className="w-12 h-12 rounded-full"
                                    />
                                )}
                                <div>
                                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// About Section Component
function AboutSection({ data }: { data: any }) {
    return (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">
                {data.title || "About Me"}
            </h2>
            <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 text-lg leading-relaxed">{data.content}</p>
            </div>
        </section>
    );
}

// Contact Section Component
function ContactSection({ data }: { data: any }) {
    return (
        <section className="bg-blue-600 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-4xl font-bold mb-4">
                    {data.title || "Get In Touch"}
                </h2>
                <p className="text-xl text-blue-100 mb-8">{data.subtitle}</p>
                <a
                    href={`mailto:${data.email}`}
                    className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-blue-50 transition-colors"
                >
                    {data.buttonText || "Contact Me"}
                </a>
            </div>
        </section>
    );
}
