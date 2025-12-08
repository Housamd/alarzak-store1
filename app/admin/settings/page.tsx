"use client";

import { useEffect, useState } from "react";

type FormState = {
  siteName: string;
  tagline: string;

  primaryColor: string;
  accentColor: string;

  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  heroHeight: string;
  heroContentAlign: string;

  productImageHeight: number;
  productImageFit: string;

  logoUrl: string;
};

export default function AdminSettingsPage() {
  const [form, setForm] = useState<FormState>({
    siteName: "",
    tagline: "",
    primaryColor: "#111827",
    accentColor: "#16a34a",
    heroTitle: "",
    heroSubtitle: "",
    heroImageUrl: "",
    heroHeight: "LARGE",
    heroContentAlign: "LEFT",
    productImageHeight: 220,
    productImageFit: "contain",
    logoUrl: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [uploadingField, setUploadingField] = useState<
    "heroImageUrl" | "logoUrl" | null
  >(null);

  const setValue = (key: keyof FormState, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        const res = await fetch("/api/admin/settings", {
          cache: "no-store",
        });
        const data = await res.json();

        if (!cancelled) {
          setForm({
            siteName: data.siteName,
            tagline: data.tagline,
            primaryColor: data.primaryColor,
            accentColor: data.accentColor,
            heroTitle: data.heroTitle || "",
            heroSubtitle: data.heroSubtitle || "",
            heroImageUrl: data.heroImageUrl || "",
            heroHeight: data.heroHeight || "LARGE",
            heroContentAlign:
              data.heroContentAlign || "LEFT",
            productImageHeight:
              data.productImageHeight || 220,
            productImageFit:
              data.productImageFit || "contain",
            logoUrl: data.logoUrl || "",
          });
        }
      } catch {
        setError("Failed to load settings.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSettings();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();
      setMessage("Settings saved successfully.");
    } catch {
      setError("Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  async function handleFileUpload(
    field: "heroImageUrl" | "logoUrl",
    file: File | null
  ) {
    if (!file) return;
    setUploadingField(field);
    setError(null);
    setMessage(null);

    try {
      const data = new FormData();
      data.append("file", file);

      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: data,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const json = await res.json();
      if (!json.url) {
        throw new Error("Invalid response.");
      }

      setValue(field, json.url);
      setMessage("Image uploaded successfully.");
    } catch (err) {
      console.error(err);
      setError("Could not upload image.");
    } finally {
      setUploadingField(null);
    }
  }

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto py-8 px-4">
        <p className="text-sm text-gray-500">
          Loading settings...
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <h1 className="text-2xl font-semibold">
        Site design & content
      </h1>

      <form
        onSubmit={handleSubmit}
        className="border rounded-lg bg-white p-4 space-y-6 text-sm"
      >
        {/* Site identity */}
        <section className="space-y-3">
          <h2 className="font-semibold text-sm">
            Site identity
          </h2>

          <div className="space-y-1">
            <label className="text-xs font-medium">
              Site name
            </label>
            <input
              type="text"
              value={form.siteName}
              onChange={(e) =>
                setValue("siteName", e.target.value)
              }
              className="w-full border rounded px-2 py-1.5"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">
              Tagline
            </label>
            <input
              type="text"
              value={form.tagline}
              onChange={(e) =>
                setValue("tagline", e.target.value)
              }
              className="w-full border rounded px-2 py-1.5"
            />
          </div>

          {/* Logo upload */}
          <div className="space-y-1">
            <label className="text-xs font-medium">
              Logo image
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleFileUpload(
                    "logoUrl",
                    e.target.files?.[0] || null
                  )
                }
                className="text-[11px]"
              />
              {uploadingField === "logoUrl" && (
                <span className="text-[11px] text-gray-500">
                  Uploading...
                </span>
              )}
            </div>
            {form.logoUrl && (
              <p className="text-[11px] text-gray-500 break-all">
                Current: {form.logoUrl}
              </p>
            )}
          </div>
        </section>

        {/* Colors */}
        <section className="space-y-3">
          <h2 className="font-semibold text-sm">
            Theme colors
          </h2>

          <div className="flex items-center gap-3">
            <div className="space-y-1 flex-1">
              <label className="text-xs font-medium">
                Primary color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.primaryColor}
                  onChange={(e) =>
                    setValue(
                      "primaryColor",
                      e.target.value
                    )
                  }
                />
                <input
                  type="text"
                  value={form.primaryColor}
                  onChange={(e) =>
                    setValue(
                      "primaryColor",
                      e.target.value
                    )
                  }
                  className="border rounded px-2 py-1.5 text-sm flex-1"
                />
              </div>
            </div>

            <div className="space-y-1 flex-1">
              <label className="text-xs font-medium">
                Accent color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.accentColor}
                  onChange={(e) =>
                    setValue(
                      "accentColor",
                      e.target.value
                    )
                  }
                />
                <input
                  type="text"
                  value={form.accentColor}
                  onChange={(e) =>
                    setValue(
                      "accentColor",
                      e.target.value
                    )
                  }
                  className="border rounded px-2 py-1.5 text-sm flex-1"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Hero */}
        <section className="space-y-3">
          <h2 className="font-semibold text-sm">
            Homepage hero
          </h2>

          {/* Hero image upload */}
          <div className="space-y-1">
            <label className="text-xs font-medium">
              Hero image
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleFileUpload(
                    "heroImageUrl",
                    e.target.files?.[0] || null
                  )
                }
                className="text-[11px]"
              />
              {uploadingField === "heroImageUrl" && (
                <span className="text-[11px] text-gray-500">
                  Uploading...
                </span>
              )}
            </div>
            {form.heroImageUrl && (
              <p className="text-[11px] text-gray-500 break-all">
                Current: {form.heroImageUrl}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">
              Hero title
            </label>
            <input
              type="text"
              value={form.heroTitle}
              onChange={(e) =>
                setValue("heroTitle", e.target.value)
              }
              className="w-full border rounded px-2 py-1.5"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">
              Hero subtitle
            </label>
            <textarea
              value={form.heroSubtitle}
              onChange={(e) =>
                setValue("heroSubtitle", e.target.value)
              }
              className="w-full border rounded px-2 py-1.5 min-h-[60px]"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">
                Hero height
              </label>
              <select
                value={form.heroHeight}
                onChange={(e) =>
                  setValue("heroHeight", e.target.value)
                }
                className="border rounded px-2 py-1.5 w-full"
              >
                <option value="SMALL">Small</option>
                <option value="MEDIUM">Medium</option>
                <option value="LARGE">Large</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">
                Content alignment
              </label>
              <select
                value={form.heroContentAlign}
                onChange={(e) =>
                  setValue(
                    "heroContentAlign",
                    e.target.value
                  )
                }
                className="border rounded px-2 py-1.5 w-full"
              >
                <option value="LEFT">Left</option>
                <option value="CENTER">Center</option>
                <option value="RIGHT">Right</option>
              </select>
            </div>
          </div>
        </section>

        {/* Product cards */}
        <section className="space-y-3">
          <h2 className="font-semibold text-sm">
            Product cards
          </h2>
          <div className="space-y-1">
            <label className="text-xs font-medium">
              Product image height (px)
            </label>
            <input
              type="number"
              value={form.productImageHeight}
              onChange={(e) =>
                setValue(
                  "productImageHeight",
                  Number(e.target.value)
                )
              }
              className="w-full border rounded px-2 py-1.5"
              min={120}
              max={400}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">
              Image fit
            </label>
            <select
              value={form.productImageFit}
              onChange={(e) =>
                setValue("productImageFit", e.target.value)
              }
              className="border rounded px-2 py-1.5 w-full"
            >
              <option value="contain">Contain</option>
              <option value="cover">Cover</option>
            </select>
          </div>
        </section>

        {message && (
          <p className="text-[11px] text-green-600">
            {message}
          </p>
        )}
        {error && (
          <p className="text-[11px] text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded bg-black text-white text-xs font-medium hover:bg-gray-900 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </main>
  );
}
