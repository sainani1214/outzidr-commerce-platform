export default function OrderItems() {
  return (
    <ul className="mt-8 space-y-5">
      <li className="flex justify-between items-start">
        <div>
          <p className="font-medium text-base">
            MacBook Pro 14-inch
          </p>
          <p className="text-sm text-[#6E6E73]">
            Space Black · 16GB · 512GB
          </p>
        </div>
        <p className="font-medium">
          ₹29,999
        </p>
      </li>

      <li className="flex justify-between items-start">
        <div>
          <p className="font-medium text-base">
            USB-C Power Adapter
          </p>
          <p className="text-sm text-[#6E6E73]">
            96W
          </p>
        </div>
        <p className="font-medium">
          ₹2,500
        </p>
      </li>
    </ul>
  );
}