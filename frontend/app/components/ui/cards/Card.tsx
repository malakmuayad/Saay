import type { ElementType } from "react";

export type CardProps = {
  title: string;
  statNum: number;
  Icon?: ElementType;
  cardClassName?: string;
};

export default function Card({
  title,
  statNum,
  Icon,
  cardClassName,
}: CardProps) {
  return (
    <div
      className={`${cardClassName ?? ""} rounded-2xl border border-gray-200 bg-white p-2 md:p-3 dark:border-gray-800 dark:bg-white/3`}
    >
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700">
          {Icon && <Icon className="size-6 text-gray-800 dark:text-white/90" />}
        </div>
      </div>

      <div className="mt-5">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {title}
        </span>

        <p className="mt-2 text-title-sm font-bold text-gray-800 dark:text-white/90">
          {statNum}
        </p>
      </div>
    </div>
  );
}
