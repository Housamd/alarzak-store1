// app/account/profile/page.tsx
"use client";

import { useEffect, useState } from "react";

type MeResponse = {
  id: string;
  name: string | null;
  email: string | null;
  lastOrder?: {
    customerName?: string | null;
    businessName?: string | null;
    street?: string | null;
    city?: string | null;
    postcode?: string | null;
    phone?: string | null;
  };
};

type Profile = {
  id: string;
  name: string | null;
  email: string | null;
  businessName: string | null;
  street: string | null;
  city: string | null;
  postcode: string | null;
  phone: string | null;
};

export default function AccountProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  // حقول قابلة للتعديل
  const [businessName, setBusinessName] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [phone, setPhone] = useState("");

  // تحميل البيانات عند الدخول للصفحة
  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        setLoading(true);
        setError(null);

        // نستخدم /api/account/me التي نعرف أنها تعمل
        const res = await fetch("/api/account/me", {
          method: "GET",
          credentials: "include",
        });

        if (res.status === 401) {
          if (!cancelled) {
            setError("Please log in to view your account.");
          }
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to load profile.");
        }

        const data: MeResponse = await res.json();
        if (cancelled) return;

        const last = data.lastOrder || {};

        const initialProfile: Profile = {
          id: data.id,
          name: data.name ?? "",
          email: data.email ?? "",
          businessName: last.businessName ?? "",
          street: last.street ?? "",
          city: last.city ?? "",
          postcode: last.postcode ?? "",
          phone: last.phone ?? "",
        };

        setProfile(initialProfile);
        setBusinessName(initialProfile.businessName || "");
        setStreet(initialProfile.street || "");
        setCity(initialProfile.city || "");
        setPostcode(initialProfile.postcode || "");
        setPhone(initialProfile.phone || "");
      } catch (err: any) {
        console.error(err);
        if (!cancelled) {
          setError(err?.message || "Failed to load profile.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave() {
    if (!profile) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // نستخدم PATCH على /api/account/profile لتحديث Customer
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessName: businessName.trim() || null,
          street: street.trim() || null,
          city: city.trim() || null,
          postcode: postcode.trim() || null,
          phone: phone.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to update profile.");
      }

      const data = await res.json();
      const updated = data.customer as Profile;

      setProfile(updated);
      setBusinessName(updated.businessName || "");
      setStreet(updated.street || "");
      setCity(updated.city || "");
      setPostcode(updated.postcode || "");
      setPhone(updated.phone || "");
      setEditMode(false);
      setSuccess("Details updated successfully.");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    if (!profile) return;
    setBusinessName(profile.businessName || "");
    setStreet(profile.street || "");
    setCity(profile.city || "");
    setPostcode(profile.postcode || "");
    setPhone(profile.phone || "");
    setEditMode(false);
    setError(null);
    setSuccess(null);
  }

  if (loading) {
    return (
      <main className="max-w-xl mx-auto py-10 px-4">
        <h1 className="text-xl font-semibold mb-4">My account</h1>
        <p className="text-sm text-gray-600">Loading your details...</p>
      </main>
    );
  }

  if (error && !profile) {
    return (
      <main className="max-w-xl mx-auto py-10 px-4">
        <h1 className="text-xl font-semibold mb-4">My account</h1>
        <p className="text-sm text-red-600">{error}</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="max-w-xl mx-auto py-10 px-4">
        <h1 className="text-xl font-semibold mb-4">My account</h1>
        <p className="text-sm text-gray-600">No profile found.</p>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto py-10 px-4 space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">My account</h1>
        <p className="text-xs text-gray-500">
          View your registered details and update your delivery information.
        </p>
      </header>

      {error && (
        <div className="border border-red-200 bg-red-50 text-xs text-red-700 rounded p-3">
          {error}
        </div>
      )}
      {success && (
        <div className="border border-green-200 bg-green-50 text-xs text-green-700 rounded p-3">
          {success}
        </div>
      )}

      {/* بيانات أساسية (غير قابلة للتعديل) */}
      <section className="border rounded-lg bg-white p-4 text-sm space-y-3">
        <h2 className="text-sm font-semibold">Account details</h2>
        <div className="grid gap-3 text-xs">
          <div className="space-y-1">
            <label className="block text-gray-600">Full name</label>
            <input
              type="text"
              value={profile.name || ""}
              disabled
              className="w-full border rounded px-2 py-1 text-xs bg-gray-50 text-gray-700"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-gray-600">Email</label>
            <input
              type="email"
              value={profile.email || ""}
              disabled
              className="w-full border rounded px-2 py-1 text-xs bg-gray-50 text-gray-700"
            />
          </div>
        </div>
        <p className="text-[11px] text-gray-500 mt-1">
          If you need to change your name or email, please contact our team.
        </p>
      </section>

      {/* بيانات الشحن (قابلة للتعديل بعد ضغط زر Edit) */}
      <section className="border rounded-lg bg-white p-4 text-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Delivery &amp; contact details</h2>
          {!editMode ? (
            <button
              type="button"
              onClick={() => {
                setEditMode(true);
                setSuccess(null);
                setError(null);
              }}
              className="text-[11px] px-3 py-1 border rounded hover:bg-gray-50"
            >
              Edit details
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="text-[11px] px-3 py-1 border rounded hover:bg-gray-50"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="text-[11px] px-3 py-1 rounded bg-black text-white hover:bg-gray-900 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          )}
        </div>

        <div className="grid gap-3 text-xs">
          <div className="space-y-1">
            <label className="block">Business / shop name</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              disabled={!editMode}
              className="w-full border rounded px-2 py-1 text-xs disabled:bg-gray-50"
              placeholder="Restaurant, shop or business name"
            />
          </div>

          <div className="space-y-1">
            <label className="block">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={!editMode}
              className="w-full border rounded px-2 py-1 text-xs disabled:bg-gray-50"
            />
          </div>

          <div className="space-y-1">
            <label className="block">Street address</label>
            <input
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              disabled={!editMode}
              className="w-full border rounded px-2 py-1 text-xs disabled:bg-gray-50"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block">City / town</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={!editMode}
                className="w-full border rounded px-2 py-1 text-xs disabled:bg-gray-50"
              />
            </div>

            <div className="space-y-1">
              <label className="block">Postcode</label>
              <input
                type="text"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                disabled={!editMode}
                className="w-full border rounded px-2 py-1 text-xs disabled:bg-gray-50"
              />
            </div>
          </div>
        </div>

        <p className="text-[11px] text-gray-500 mt-1">
          These details are used as defaults for your future orders. You can still
          adjust them during checkout if needed.
        </p>
      </section>
    </main>
  );
}
