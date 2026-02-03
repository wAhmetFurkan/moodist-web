"use client";

import { useTheme } from "@/context/ThemeProvider";
import { useState } from "react";

export default function Home() {
  const { tokens, isLoading } = useTheme();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState("");

  const generateTheme = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setMessage("Dreaming up your theme... ✨");

    try {
      const res = await fetch("/api/theme/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage(`Theme "${data.themeName}" created! Watch it apply live...`);
        setPrompt("");
      } else if (data.debugInfo) {
        // Pretty print debug info
        console.log("Debug Info:", data.debugInfo);
        const models = data.debugInfo.models ? data.debugInfo.models.map((m: any) => m.name).join(", ") : "No models found";
        setMessage(`DEBUG: Available Models: ${models}`);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage("Something went wrong.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen p-8 sm:p-20 font-sans gap-16 transition-colors duration-500">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start max-w-4xl mx-auto">

        <header className="mb-8 w-full">
          <h1 className="text-4xl font-bold mb-4 font-heading text-foreground">
            Moodist Architecture
          </h1>
          <div className="flex justify-between items-center">
            <p className="text-muted text-lg">
              Theme Name: <span className="font-mono font-bold text-primary">{tokens.themeName}</span>
            </p>
            {isLoading && <span className="text-xs animate-pulse text-muted">Thinking...</span>}
          </div>
        </header>

        <section className="w-full p-6 border border-border rounded-lg bg-card shadow-sm">
          <h2 className="text-2xl font-bold mb-4">AI Theme Generator</h2>
          <p className="mb-4 text-muted">Describe a mood, place, or style, and Gemini will paint it for you.</p>
          <div className="flex gap-4 flex-col sm:flex-row">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'A rainy cyberpunk alleyway at midnight'"
              className="flex-1 p-3 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isGenerating}
              onKeyDown={(e) => e.key === "Enter" && generateTheme()}
            />
            <button
              onClick={generateTheme}
              disabled={isGenerating || !prompt}
              className="px-6 py-3 rounded-md bg-accent text-accent-foreground font-bold hover:opacity-90 disabled:opacity-50 transition-all whitespace-nowrap"
            >
              {isGenerating ? "Generating..." : "Generate Theme"}
            </button>
          </div>
          {message && <p className="mt-3 text-sm font-medium text-primary">{message}</p>}
        </section>

        <section className="w-full">
          <h2 className="text-2xl font-bold mb-6 border-b border-border pb-2">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            <ColorCard name="Background" variable="bg-background" text="text-foreground" border="border-border" />
            <ColorCard name="Foreground" variable="bg-foreground" text="text-background" />

            <ColorCard name="Primary" variable="bg-primary" text="text-primary-foreground" />
            <ColorCard name="Secondary" variable="bg-secondary" text="text-secondary-foreground" />

            <ColorCard name="Accent" variable="bg-accent" text="text-accent-foreground" />
            <ColorCard name="Muted" variable="bg-muted" text="text-white" />

          </div>
        </section>

        <section className="w-full">
          <h2 className="text-2xl font-bold mb-6 border-b border-border pb-2">Typography & Spacing</h2>
          <div className="space-y-4 p-6 border border-border rounded-lg bg-card">
            <h1 className="text-4xl font-heading">Heading 1</h1>
            <h2 className="text-3xl font-heading">Heading 2</h2>
            <h3 className="text-2xl font-heading">Heading 3</h3>
            <p className="font-sans leading-relaxed">
              This is a paragraph using the body font. The spacing between elements is controlled by the design tokens.
              Theme agnosticism allows us to change the entire feel of the application without touching the markup.
            </p>
          </div>
        </section>

      </main>
    </div>
  );
}

function ColorCard({ name, variable, text, border = "border-transparent" }: { name: string, variable: string, text: string, border?: string }) {
  return (
    <div className={`p-6 rounded-lg shadow-sm border ${border} ${variable} ${text} flex flex-col justify-between aspect-square transition-colors duration-500`}>
      <span className="font-bold">{name}</span>
      <span className="text-xs opacity-80">{variable}</span>
    </div>
  );
}
