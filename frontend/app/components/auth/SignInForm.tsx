import Label from "~/components/form/Label";
import Input from "~/components/form/input/InputField";
import Button from "../ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "~/assets/icons";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router";
import { login } from "~/services/api/auth";
import Alert from "../ui/Alert";
import { setCurrentUser } from "~/services/localStorage/users";
import { AuthContext } from "~/context/AuthContext";
import type { LoginResponseDto } from "~/types/auth/loginResponseDto";
import { setRefreshToken } from "~/services/localStorage/auth";
import { setAccessToken } from "~/services/sessionStorage/auth";
import { t } from "i18next";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [emailValid, setEmailValid] = useState<boolean>(true);

  const [password, setPassword] = useState<string>("");
  const [passwordValid, setPasswordValid] = useState<boolean>(true);

  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState<boolean>(false);

  const navigator = useNavigate();

  const setCurrentUserId = useContext(AuthContext)?.setCurrentUserId;

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

    setCurrentUser(result.userId); // store in local storage
    setAccessToken(result.accessToken);
    setRefreshToken(result.refreshToken);
    setCurrentUserId?.(result.userId); // store in AuthContext

    navigator("/dashboard");
  }

  return (
    <div className="dark:bg-gray-900 flex min-h-screen w-full items-center justify-center overflow-y-auto px-4 py-8 sm:px-6">
      <div className="w-full max-w-md">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 mt-4 text-title-sm font-semibold text-gray-800 sm:text-title-md dark:text-white/90">
              {t("signin.title")}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("signin.description")}
            </p>
          </div>
          <div>
            {error && <Alert variant="error" title="Error" message={error} />}
            <form onSubmit={handleSignIn}>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="email">
                    {t("signin.fields.email")}{" "}
                    <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    id="email"
                    placeholder="info@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    hint={!emailValid ? "Email is required" : undefined}
                    error={!emailValid}
                    onBlur={() => setEmailValid(email !== "")}
                  />
                </div>
                <div>
                  <Label htmlFor="password">
                    {t("signin.fields.password")}{" "}
                    <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={t("signin.fields.passwordPlaceholder")}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      hint={!passwordValid ? "Password is required" : undefined}
                      error={!passwordValid}
                      onBlur={() => setPasswordValid(password !== "")}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-e-4 top-1/2 z-30 -translate-y-1/2 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeIcon
                          className={`size-5 fill-gray-500 dark:fill-gray-400 ${!passwordValid && "-translate-y-1/2"}`}
                        />
                      ) : (
                        <EyeCloseIcon
                          className={`size-5 fill-gray-500 dark:fill-gray-400 ${!passwordValid && "-translate-y-1/2"}`}
                        />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Link
                    to="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    {t("signin.forgotPassword")}
                  </Link>
                </div>
                <div>
                  <Button className="w-full" size="sm" disabled={signingIn}>
                    {signingIn ? t("signin.signingIn") : t("signin.title")}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-center text-sm font-normal text-gray-700 sm:text-start dark:text-gray-400">
                {t("signin.noAccount")} {""}
                <Link
                  to="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  {t("signup")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
