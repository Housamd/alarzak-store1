"use client";

type Props = { id: string | number };

export default function DeleteButton({ id }: Props) {
  const href = `/admin/products/${String(id)}/delete`;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!window.confirm("⚠️ هل أنت متأكد أنك تريد حذف هذا المنتج؟")) {
      e.preventDefault();
      return;
    }
  };

  return (
    <form method="post" action={href} className="inline">
      <button
        type="submit"
        onClick={handleClick}
        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
      >
        🗑️ Delete
      </button>
    </form>
  );
}
