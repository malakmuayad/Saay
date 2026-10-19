import { t } from "i18next";
import SignUpForm from "~/components/auth/SignUpForm";

export const meta = () => [{ title: t("routes.signup") }];

export default function SignUp() {
  return <SignUpForm />;
}
