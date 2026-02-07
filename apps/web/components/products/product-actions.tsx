export default function ProductActions() {
  return (
    <div className="mt-12 flex flex-col gap-4 max-w-sm">
      <button className="w-full py-4 rounded-full bg-[#0A84FF] hover:bg-[#409CFF] transition">
        Add to Cart
      </button>

      <button className="w-full py-4 rounded-full border border-zinc-700 hover:border-zinc-500 transition">
        Save for later
      </button>

      <p className="text-xs text-zinc-500 text-center mt-2">
        Free delivery · Secure checkout
      </p>
    </div>
  );
}
