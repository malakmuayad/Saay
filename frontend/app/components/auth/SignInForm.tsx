import Label from "~/components/form/Label";
import Input from "~/components/form/input/InputField";
import Button from "../ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "~/assets/icons";
import { useContext, useState } from "react";
import { Link, useNavigate, useNavigation } from "react-router";
import { login } from "~/services/api/auth";
import Alert from "../ui/Alert";
import { setCurrentUser } from "~/services/localStorage/users";
import { AuthContext } from "~/context/AuthContext";
import type { LoginResponseDto } from "~/types/auth/loginResponseDto";
import { setRefreshToken } from "~/services/localStorage/auth";
import { setAccessToken } from "~/services/sessionStorage/auth";
import { t } from "i18next";
import { useTheme } from "~/context/ThemeContext";
import Loading from "../ui/Loading";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [emailValid, setEmailValid] = useState<boolean>(true);

  const [password, setPassword] = useState<string>("");
  const [passwordValid, setPasswordValid] = useState<boolean>(true);

  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState<boolean>(false);

  const navigator = useNavigate();
  const navigation = useNavigation();
  const setCurrentUserId = useContext(AuthContext)?.setCurrentUserId;
  const theme = useTheme().theme;

  function validateFields() {
    return password !== "" && email !== "";
  }

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!validateFields()) {
      setEmailValid(email !== "");
      setPasswordValid(password !== "");
      setSigningIn(false);
      return;
    }

    setError(null);
    setSigningIn(true);

    const result: string | LoginResponseDto = await login(email, password);

    if (typeof result === "string") {
      setError(result);
      setSigningIn(false);
      return;
    }

    setEmail("");
    setPassword("");

    setEmailValid(true);
    setPasswordValid(true);

    setError(null);
    setSigningIn(false);

    setCurrentUser(result.userId);
    setAccessToken(result.accessToken);
    setRefreshToken(result.refreshToken);
    setCurrentUserId?.(result.userId);

    navigator("/dashboard");
  }

  return (
    <>
      {navigation.state === "loading" && <Loading />}
      <div className="grid min-h-screen w-full grid-cols-1 dark:bg-gray-900 md:grid-cols-2">
        {/* Left section — Sign-in form */}
        <section className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-12">
          <div className="w-full max-w-md">
            {/* Heading */}
            <div className="mb-5 sm:mb-8">
              <h1 className="mb-2 text-title-sm font-semibold text-gray-800 sm:text-title-md dark:text-white/90">
                {t("signin.title")}
              </h1>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("signin.description")}
              </p>
            </div>

            {/* Error alert */}
            {error && (
              <div className="mb-5">
                <Alert
                  variant="error"
                  title={t("signin.error")}
                  message={error}
                />
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSignIn}>
              <div className="space-y-5">
                {/* Email */}
                <div>
                  <Label htmlFor="email">
                    {t("signin.fields.email")}{" "}
                    <span className="text-error-500">*</span>
                  </Label>

                  <Input
                    id="email"
                    placeholder="info@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    hint={
                      !emailValid
                        ? t("signin.validation.emailRequired")
                        : undefined
                    }
                    error={!emailValid}
                    onBlur={() => setEmailValid(email !== "")}
                  />
                </div>

                {/* Password */}
                <div>
                  <Label htmlFor="password">
                    {t("signin.fields.password")}{" "}
                    <span className="text-error-500">*</span>
                  </Label>

                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={t("signin.fields.passwordPlaceholder")}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      hint={
                        !passwordValid
                          ? t("signin.validation.passwordRequired")
                          : undefined
                      }
                      error={!passwordValid}
                      onBlur={() => setPasswordValid(password !== "")}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword
                          ? t("signin.passwordVisibility.hide")
                          : t("signin.passwordVisibility.show")
                      }
                      className="absolute inset-e-4 top-1/2 z-30 -translate-y-1/2 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Forgot password */}
                <div className="flex items-center justify-between">
                  <Link
                    to="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    {t("signin.forgotPassword")}
                  </Link>
                </div>

                {/* Submit button */}
                <div>
                  <Button className="w-full" size="md" disabled={signingIn}>
                    {signingIn ? t("signin.signingIn") : t("signin.title")}
                  </Button>
                </div>
              </div>
            </form>

            {/* Sign-up link */}
            <div className="mt-5">
              <p className="text-center text-sm font-normal text-gray-700 sm:text-start dark:text-gray-400">
                {t("signin.noAccount")}{" "}
                <Link
                  to="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  {t("signUp.title")}
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* Right section — Branding */}
        <section className="relative flex min-h-64 flex-col items-center justify-center gap-8 overflow-hidden bg-[radial-gradient(ellipse_at_center,_#bfdbfe_0%,_#dbeafe_35%,_#ffffff_75%)] px-8 py-12 dark:bg-[radial-gradient(ellipse_at_center,_#263b68_0%,_#1f2937_45%,_#111827_100%)] md:min-h-screen lg:px-16">
          <img
            src={
              theme === "dark" ? "/assets/logo-dark.png" : "/assets/logo.png"
            }
            alt="Saay logo"
            className="h-auto w-40 object-contain sm:w-48"
            loading="eager"
          />

          <div className="max-w-md text-center">
            <h2 className="text-2xl font-semibold text-gray-800 sm:text-3xl dark:text-white">
              {t("auth.branding.title")}
            </h2>

            <p className="mt-4 text-sm leading-6 text-gray-600 sm:text-base dark:text-gray-300">
              {t("auth.branding.description")}
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
