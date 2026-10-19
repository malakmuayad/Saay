import { t } from "i18next";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import Alert from "~/components/ui/Alert";
import { useAuth } from "~/context/AuthContext";
import { resendConfirmationEmail } from "~/services/api/emails";
import { getUserConfirmationStatus, getUserEmail } from "~/services/api/users";

export const meta = () => [{ title: t("routes.notConfirmed") }];

const NotConfirmed: React.FC = () => {
  const { t } = useTranslation();
  const currentUserId = useAuth()?.currentUserId;
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;

    async function loadUserConfirmationStatus() {
      if (currentUserId == null) return;

      try {
        const result = await getUserConfirmationStatus(currentUserId);

        if (ignore) return;

        if (result === true) {
          navigate("/", { replace: true });
        }
      } catch {
        if (!ignore) {
          setError(t("notConfirmed.errors.statusCheckFailed"));
        }
      }
    }

    void loadUserConfirmationStatus();

    return () => {
      ignore = true;
    };
  }, [currentUserId, navigate, t]);

  async function handleResendEmail() {
    setLoading(true);
    setSuccess(false);
    setError("");

    try {
      if (currentUserId === null || currentUserId === undefined) {
        setError("Session Expired. Sign in again.");
        return;
      }
      const email = await getUserEmail(currentUserId);
      if (email === null) {
        setError("User not found. Please sign in again.");
        return;
      }
      const response = await resendConfirmationEmail(email);

      if (response === true) {
        setSuccess(true);
      } else {
        setError(
          typeof response === "string"
            ? response
            : t("notConfirmed.errors.resendFailed"),
        );
      }
    } catch {
      setError(t("notConfirmed.errors.resendFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <div className="w-full max-w-lg space-y-4">
        <Alert
          variant="warning"
          title={t("notConfirmed.title")}
          message={t("notConfirmed.description")}
        />

        {success && (
          <Alert
            variant="success"
            title={t("notConfirmed.successTitle")}
            message={t("notConfirmed.successMessage")}
          />
        )}

        {error && (
          <Alert
            variant="error"
            title={t("notConfirmed.errorTitle")}
            message={error}
          />
        )}

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          {t("notConfirmed.resendPrompt")}{" "}
          <button
            type="button"
            onClick={handleResendEmail}
            disabled={loading}
            className="font-medium text-brand-500 underline underline-offset-4 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? t("notConfirmed.sending") : t("notConfirmed.resendLink")}
          </button>
        </p>
      </div>
    </main>
  );
};

export default NotConfirmed;
