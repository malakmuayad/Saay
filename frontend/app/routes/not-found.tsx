import { cn } from "~/utils";
import { Link } from "react-router";

export const meta = () => [{ title: "Saay" }];

export default function NotFound() {
  return (
    <div className="relative z-1 flex min-h-screen flex-col items-center justify-center overflow-hidden p-6 bg-white dark:bg-gray-900">
      {/* <GridShape /> */}
      <div className="mx-auto w-full max-w-60.5 text-center sm:max-w-118">
        <h1 className="mb-8 text-title-md font-bold text-gray-800 xl:text-title-2xl dark:text-white/90">
          ERROR
        </h1>

        <p className="mt-10 mb-6 text-base text-gray-700 sm:text-lg dark:text-gray-400">
          We can’t seem to find the page you are looking for!
        </p>

        <Link
          to="/"
          className={cn(
            "inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3 dark:hover:text-gray-200",
          )}
        >
          Back to Home Page
        </Link>
      </div>
      {/* <!-- Footer --> */}
      <p
        className={cn(
          "absolute inset-s-1/2 bottom-6 -translate-x-1/2 text-center text-sm text-gray-500 rtl:translate-x-1/2 dark:text-gray-400",
        )}
      >
        &copy; 2026 - Saay | سعي
      </p>
    </div>
  );
}
