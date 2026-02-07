export default function ProductFilters() {
  return (
    <aside className="space-y-10">
      <div>
        <h3 className="text-sm font-medium text-zinc-300 mb-4">
          Category
        </h3>
        <ul className="space-y-3 text-zinc-400">
          <li className="hover:text-white cursor-pointer">All</li>
          <li className="hover:text-white cursor-pointer">Electronics</li>
          <li className="hover:text-white cursor-pointer">Accessories</li>
          <li className="hover:text-white cursor-pointer">Wearables</li>
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-medium text-zinc-300 mb-4">
          Availability
        </h3>
        <ul className="space-y-3 text-zinc-400">
          <li className="hover:text-white cursor-pointer">In stock</li>
          <li className="hover:text-white cursor-pointer">Out of stock</li>
        </ul>
      </div>
    </aside>
  );
}
