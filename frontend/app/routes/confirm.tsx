import { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "~/context/AuthContext";
import { confirm } from "~/services/api/auth";

export default function ConfirmEmail() {
  const currentUserId = useAuth()?.currentUserId;
  const [isConfirmed, setIsConfirmed] = useState(false);

  async function confirmEmail() {
    if (currentUserId === null || currentUserId === undefined) return;

    const result = await confirm(currentUserId);

    if (typeof result === "string") return;

    setIsConfirmed(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm sm:p-10">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50">
          {isConfirmed ? (
            <svg
              className="h-10 w-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="h-10 w-10 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.7}
                d="M3 7l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          )}
        </div>

        {/* Heading */}
        <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900">
          {isConfirmed ? "Email confirmed!" : "Confirm your email"}
        </h1>

        {/* Description */}
        <p className="mb-8 text-base leading-7 text-gray-500">
          {isConfirmed
            ? "Your Saay account is ready! You can now sign in and start organizing your goals, tasks, and habits."
            : "You're one step away from getting started with Saay. Confirm your email address to activate your account."}
        </p>

        {/* Action */}
        {!isConfirmed ? (
          <button
            type="button"
            onClick={confirmEmail}
            className="w-full rounded-xl bg-indigo-600 px-6 py-3.5 font-semibold text-white shadow-sm transition duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-[0.98]"
          >
            Confirm my account
          </button>
        ) : (
          <Link
            to="/"
            className="block w-full rounded-xl bg-indigo-600 px-6 py-3.5 font-semibold text-white shadow-sm transition duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Go to home page
          </Link>
        )}

        {/* Footer */}
        <p className="mt-6 text-sm text-gray-400">
          If you didn't create a Saay account, you can safely ignore this page.
        </p>

        <div className="mt-8 border-t border-gray-100 pt-5">
          <span className="text-lg font-bold tracking-tight text-indigo-600">
            Saay
          </span>
          <p className="mt-1 text-xs text-gray-400">Make every day count.</p>
        </div>
      </section>
    </main>
  );
}
