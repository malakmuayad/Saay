import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import Label from "~/components/form/Label";
import Input from "~/components/form/input/InputField";
import { EyeCloseIcon, EyeIcon } from "~/assets/icons";

import { sendPasswordResetEmail } from "~/services/api/emails";
import { verifyCode, resetPassword } from "~/services/api/users";
import { PASSWORD_REGEX } from "~/validation";

type Step = "email" | "verify" | "reset" | "success";

export default function ForgotPassword() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("email");

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordValid, setPasswordValid] = useState(true);
  const [confirmPasswordValid, setConfirmPasswordValid] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const isArabic = i18n.language.startsWith("ar");

  async function handleRequestCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const result = await sendPasswordResetEmail(email.trim());

      if (result !== true) {
        setError(
          typeof result === "string"
            ? result
            : t("forgotPassword.errors.requestFailed"),
        );
        return;
      }

      setStep("verify");
      setMessage(t("forgotPassword.codeSent"));
    } catch {
      setError(t("forgotPassword.errors.requestFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const result = await verifyCode(email.trim(), code.trim());

      if (result !== true) {
        setError(
          typeof result === "string"
            ? result
            : t("forgotPassword.errors.invalidCode"),
        );
        return;
      }

      setStep("reset");
    } catch {
      setError(t("forgotPassword.errors.verifyFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setMessage("");

    const isPasswordValid = PASSWORD_REGEX.test(newPassword);
    const doPasswordsMatch =
      confirmPassword !== "" && confirmPassword === newPassword;

    setPasswordValid(isPasswordValid);
    setConfirmPasswordValid(doPasswordsMatch);

    if (!isPasswordValid || !doPasswordsMatch) {
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(email.trim(), newPassword);

      if (result !== true) {
        setError(
          typeof result === "string"
            ? result
            : t("forgotPassword.errors.resetFailed"),
        );
        return;
      }

      setNewPassword("");
      setConfirmPassword("");
      setPasswordValid(true);
      setConfirmPasswordValid(true);
      setShowPassword(false);

      setStep("success");
    } catch {
      setError(t("forgotPassword.errors.resetFailed"));
    } finally {
      setLoading(false);
    }
  }

  const titles: Record<Step, string> = {
    email: t("forgotPassword.steps.emailTitle"),
    verify: t("forgotPassword.steps.verifyTitle"),
    reset: t("forgotPassword.steps.resetTitle"),
    success: t("forgotPassword.steps.successTitle"),
  };

  return (
    <main
      dir={isArabic ? "rtl" : "ltr"}
      className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10 dark:bg-gray-950"
    >
      <section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link to="/" className="text-2xl font-bold text-brand-600">
            {t("common.saay")}
          </Link>

          <h1 className="mt-6 text-2xl font-semibold text-gray-900 dark:text-white">
            {titles[step]}
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
            {t(`forgotPassword.steps.${step}Description`)}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
          >
            {error}
          </div>
        )}

        {/* Success / Information */}
        {message && (
          <div
            role="status"
            className="mb-5 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300"
          >
            {message}
          </div>
        )}

        {/* Step 1: Request reset code */}
        {step === "email" && (
          <form onSubmit={handleRequestCode} className="space-y-5">
            <div>
              <Label htmlFor="email">
                {t("forgotPassword.email")}
                <span className="text-error-500">*</span>
              </Label>

              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={255}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("forgotPassword.emailPlaceholder")}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? t("forgotPassword.sending")
                : t("forgotPassword.sendCode")}
            </button>
          </form>
        )}

        {/* Step 2: Verify code */}
        {step === "verify" && (
          <form onSubmit={handleVerifyCode} className="space-y-5">
            <div>
              <Label htmlFor="code">
                {t("forgotPassword.verificationCode")}
                <span className="text-error-500">*</span>
              </Label>

              <Input
                id="code"
                name="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                minLength={6}
                maxLength={6}
                required
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="flex w-full items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? t("forgotPassword.verifying")
                : t("forgotPassword.verifyCode")}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setError("");
                setMessage("");
                setStep("email");
              }}
              className="w-full text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-60 dark:text-gray-400 dark:hover:text-white"
            >
              {t("forgotPassword.changeEmail")}
            </button>
          </form>
        )}

        {/* Step 3: Reset password */}
        {step === "reset" && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            {/* New Password */}
            <div>
              <Label htmlFor="newPassword">
                {t("forgotPassword.newPassword")}
                <span className="text-error-500">*</span>
              </Label>

              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Enter your new password"
                  value={newPassword}
                  hint={
                    !passwordValid
                      ? "Password must be at least 8 characters, contain a small, capital, special, and numeric characters."
                      : undefined
                  }
                  error={!passwordValid}
                  onChange={(e) => {
                    const value = e.target.value;

                    setNewPassword(value);

                    if (!passwordValid) {
                      setPasswordValid(PASSWORD_REGEX.test(value));
                    }

                    if (confirmPassword !== "") {
                      setConfirmPasswordValid(confirmPassword === value);
                    }
                  }}
                  onBlur={() =>
                    setPasswordValid(PASSWORD_REGEX.test(newPassword))
                  }
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-e-4 top-1/2 z-30 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                  ) : (
                    <EyeCloseIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword">
                {t("forgotPassword.confirmPassword")}
                <span className="text-error-500">*</span>
              </Label>

              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  hint={
                    !confirmPasswordValid ? "Passwords must match" : undefined
                  }
                  error={!confirmPasswordValid}
                  onChange={(e) => {
                    const value = e.target.value;

                    setConfirmPassword(value);

                    setConfirmPasswordValid(
                      value !== "" && value === newPassword,
                    );
                  }}
                  onBlur={() =>
                    setConfirmPasswordValid(
                      confirmPassword !== "" && confirmPassword === newPassword,
                    )
                  }
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-e-4 top-1/2 z-30 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                  ) : (
                    <EyeCloseIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? t("forgotPassword.resetting")
                : t("forgotPassword.resetPassword")}
            </button>
          </form>
        )}

        {/* Step 4: Success */}
        {step === "success" && (
          <div className="space-y-5 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700 dark:bg-green-900/40 dark:text-green-300">
              ✓
            </div>

            <p className="text-sm leading-6 text-gray-600 dark:text-gray-400">
              {t("forgotPassword.successMessage")}
            </p>

            <button
              type="button"
              onClick={() => navigate("/", { replace: true })}
              className="w-full rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-600"
            >
              {t("forgotPassword.backToSignIn")}
            </button>
          </div>
        )}

        {/* Sign-in link */}
        {step !== "success" && (
          <p className="mt-7 text-center text-sm text-gray-500 dark:text-gray-400">
            {t("forgotPassword.rememberPassword")}{" "}
            <Link
              to="/"
              className="font-semibold text-brand-500 hover:text-brand-600 dark:text-brand-400"
            >
              {t("forgotPassword.signIn")}
            </Link>
          </p>
        )}
      </section>
    </main>
  );
}
