export default function ProductSpecs() {
  return (
    <div>
      <h2 className="text-3xl font-semibold mb-12">
        Designed for performance
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 text-zinc-400">
        <div>
          <h3 className="text-white text-lg mb-3">Audio</h3>
          <p>
            Precision-tuned drivers deliver balanced sound across
            all frequencies with low distortion.
          </p>
        </div>

        <div>
          <h3 className="text-white text-lg mb-3">Build</h3>
          <p>
            Aerospace-grade materials ensure durability
            without adding unnecessary weight.
          </p>
        </div>

        <div>
          <h3 className="text-white text-lg mb-3">Battery</h3>
          <p>
            Up to 30 hours of listening time on a single charge,
            optimized for long sessions.
          </p>
        </div>

        <div>
          <h3 className="text-white text-lg mb-3">Compatibility</h3>
          <p>
            Works seamlessly across modern devices with
            low-latency wireless connectivity.
          </p>
        </div>
      </div>
    </div>
  );
}
