type LoadingProps = {
  fullScreen?: boolean;
  message?: string;
};

export default function Loading({
  fullScreen = true,
  message = "Getting things ready...",
}: LoadingProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        flex flex-col items-center justify-center
        gap-6 bg-white text-gray-700
        dark:bg-gray-900 dark:text-gray-300
        ${fullScreen ? "min-h-screen w-full" : "min-h-64 w-full rounded-2xl"}
      `}
    >
      {/* Logo and radial glow */}
      <div className="relative flex h-24 w-24 items-center justify-center">
        <div
          aria-hidden="true"
          className="
            absolute inset-0 rounded-full
            bg-brand-500/20 blur-2xl
            animate-pulse
          "
        />

        {/* Rotating gradient ring */}
        <div
          aria-hidden="true"
          className="
            absolute inset-1 rounded-full
            border-2 border-transparent
            border-t-brand-500 border-r-brand-300
            animate-spin
          "
        />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );
}
