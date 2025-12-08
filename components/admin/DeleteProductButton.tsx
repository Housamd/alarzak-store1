'use client'

export default function DeleteProductButton({ id }: { id: string }) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!confirm('Delete this product?')) {
      e.preventDefault()
    }
  }

  return (
    <form action={`/api/admin/products/${id}/delete`} method="POST">
      <button className="btn btn-outline" type="submit" onClick={handleClick}>
        Delete
      </button>
    </form>
  )
}