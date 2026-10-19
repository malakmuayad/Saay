import DangerZone from "~/components/settings/DangerZone";
import Security from "~/components/settings/Security";
import UserMetaCard from "~/components/settings/UserMetaCard";
import ComponentCard from "~/components/ui/cards/ComponentCard";
import { getCurrentUser } from "~/services/localStorage/users";
import { getUser } from "~/services/api/users";
import { useLoaderData } from "react-router";
import { useState } from "react";
import type { UserDto } from "~/types/users/UserDto";
import { t } from "i18next";

export const meta = () => [{ title: t("routes.settings") }];

export async function clientLoader() {
  const userId = Number(getCurrentUser());

  if (Number.isNaN(userId) || userId <= 0) {
    return {
      userId: 0,
      user: null,
    };
  }

  const response = await getUser(userId);

  if (typeof response === "string") {
    return {
      userId,
      user: null,
    };
  }

  return {
    userId,
    user: response,
  };
}

export default function Settings() {
  const { userId, user } = useLoaderData<typeof clientLoader>();
  const [userState, setUserState] = useState<UserDto | null>(user);

  async function handleDataUpdate() {
    if (userId === 0) return;

    const response = await getUser(userId);

    if (typeof response !== "string") setUserState(response);
  }

  return (
    <div className="min-h-screen rounded-2xl border border-gray-200 bg-white p-2 xl:py-3 dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto w-full">
        <ComponentCard title="profile">
          <div className="space-y-6">
            <UserMetaCard
              userId={userId}
              firstName={userState?.firstName ?? ""}
              lastName={userState?.lastName ?? ""}
              email={userState?.email ?? ""}
              profilePictureUrl={userState?.profilePictureUrl}
              onDataUpdated={handleDataUpdate}
            />
            <Security />
            <DangerZone />
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
