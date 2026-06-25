export function SkeletonLoader({ lines = 3 }: { lines?: number }) {
  return (
    <div className="skeleton-stack">
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="skeleton skeleton-line" />
      ))}
    </div>
  );
}
