// components/admin/PrintButton.tsx
"use client";

export default function PrintButton() {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="inline-block px-4 py-2 bg-black text-white rounded text-sm"
    >
      Print
    </button>
  );
}
