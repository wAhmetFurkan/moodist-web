"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRouter } from "next/navigation";

interface CommandResult {
    success: boolean;
    action?: string;
    sectionType?: string;
    explanation?: string;
    error?: string;
}

export default function AIBuilderPage() {
    const router = useRouter();
    const [command, setCommand] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<CommandResult | null>(null);
    const [history, setHistory] = useState<Array<{ command: string; result: CommandResult }>>([]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!command.trim()) return;

        setLoading(true);
        setResult(null);

        try {
            const response = await fetch("/api/ai/command", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ command }),
            });

            const data = await response.json();

            setResult(data);
            setHistory([{ command, result: data }, ...history]);

            if (data.success) {
                setCommand("");
            }
        } catch (error: any) {
            setResult({
                success: false,
                error: error.message || "Network error occurred",
            });
        } finally {
            setLoading(false);
        }
    };

    const exampleCommands = [
        "Siteye bir yetenekler bölümü ekle, React, Next.js ve Firebase göster",
        "Referanslar bölümü ekle, müşteri yorumları için",
        "Hakkımda bölümünü daha detaylı yap",
        "İletişim formu ekle",
        "Eğitim geçmişimi gösteren bir bölüm ekle",
    ];

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
                {/* Header */}
                <header className="bg-white shadow-sm border-b-2 border-purple-200">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="text-3xl">🤖</span>
                                AI Komut Merkezi
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">Doğal dille sitenizi güncelleyin</p>
                        </div>
                        <button
                            onClick={() => router.push("/admin")}
                            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            ← Geri Dön
                        </button>
                    </div>
                </header>

                <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Command Input */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-purple-100">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-lg font-semibold text-gray-900 mb-3">
                                    Ne yapmak istersiniz?
                                </label>
                                <textarea
                                    value={command}
                                    onChange={(e) => setCommand(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                                    placeholder="Örnek: Siteye bir yetenekler bölümü ekle, React, TypeScript ve Firebase göster"
                                    disabled={loading}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !command.trim()}
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        AI İşliyor...
                                    </span>
                                ) : (
                                    "✨ Komutu Çalıştır"
                                )}
                            </button>
                        </form>

                        {/* Result */}
                        {result && (
                            <div className={`mt-6 p-6 rounded-xl border-2 ${result.success
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-red-50 border-red-200'
                                }`}>
                                {result.success ? (
                                    <div>
                                        <div className="flex items-start gap-3 mb-3">
                                            <span className="text-3xl">✅</span>
                                            <div>
                                                <h3 className="text-lg font-bold text-green-900">Başarılı!</h3>
                                                <p className="text-green-700 mt-1">{result.explanation}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex gap-3">
                                            <button
                                                onClick={() => window.open("/", "_blank")}
                                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                                            >
                                                Önizle →
                                            </button>
                                            <button
                                                onClick={() => setResult(null)}
                                                className="px-4 py-2 bg-white border border-green-300 text-green-700 rounded-lg font-semibold hover:bg-green-50 transition-colors"
                                            >
                                                Yeni Komut
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-3">
                                        <span className="text-3xl">❌</span>
                                        <div>
                                            <h3 className="text-lg font-bold text-red-900">Hata Oluştu</h3>
                                            <p className="text-red-700 mt-1">{result.error}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Example Commands */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span>💡</span>
                            Örnek Komutlar
                        </h2>
                        <div className="space-y-3">
                            {exampleCommands.map((example, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCommand(example)}
                                    className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200"
                                >
                                    <span className="text-purple-700 font-medium">{example}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Command History */}
                    {history.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span>📜</span>
                                Komut Geçmişi
                            </h2>
                            <div className="space-y-4">
                                {history.map((item, index) => (
                                    <div key={index} className="border-l-4 border-purple-300 pl-4 py-2">
                                        <p className="font-semibold text-gray-900">{item.command}</p>
                                        <p className={`text-sm mt-1 ${item.result.success ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {item.result.success ? `✓ ${item.result.explanation}` : `✗ ${item.result.error}`}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Info Box */}
                    <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-blue-900 mb-3">ℹ️ Nasıl Çalışır?</h3>
                        <ul className="space-y-2 text-blue-800">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-1">•</span>
                                <span>Doğal dille ne istediğinizi yazın</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-1">•</span>
                                <span>AI komutu analiz edip otomatik olarak bölüm oluşturur</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-1">•</span>
                                <span>Değişiklikler anında sitenize yansır</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-1">•</span>
                                <span>Türkçe veya İngilizce komut verebilirsiniz</span>
                            </li>
                        </ul>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
