import { cn } from "~/utils";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { t } from "i18next";

export const meta = () => [{ title: t("routes.notFound") }];

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="relative z-1 flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white p-6 dark:bg-gray-900">
      <div className="mx-auto w-full max-w-60.5 text-center sm:max-w-118">
        <h1 className="mb-8 text-title-md font-bold text-gray-800 xl:text-title-2xl dark:text-white/90">
          404
        </h1>

        <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
          {t("notFound.title")}
        </h2>

        <p className="mt-4 mb-6 text-base text-gray-700 sm:text-lg dark:text-gray-400">
          {t("notFound.message")}
        </p>

        <Link
          to="/dashboard"
          className={cn(
            "inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3 dark:hover:text-gray-200",
          )}
        >
          {t("notFound.backHome")}
        </Link>
      </div>

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
