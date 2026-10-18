import { t } from "i18next";
import { useEffect, useState } from "react";
import { SparklesIcon, TotalIcon } from "~/assets/icons";
import Button from "../button/Button";
import Input from "~/components/form/input/InputField";
import { updateMission } from "~/services/api/users";

export type MissionCardProps = {
  userId: number;
  readOnly?: boolean;
  initialMission: string;
  cardClassName?: string;
  onMissionUpdated: () => void;
};

export default function MissionCard({
  userId,
  readOnly = false,
  initialMission,
  cardClassName,
  onMissionUpdated,
}: MissionCardProps) {
  const [displayInput, setDisplayInput] = useState(false);
  const [mission, setMission] = useState(initialMission);

  useEffect(() => {
    setMission(initialMission);
  }, [initialMission]);

  function handleEditClick() {
    if (readOnly) return;

    setMission(initialMission);
    setDisplayInput((prev) => !prev);
  }

  async function handleSave() {
    if (readOnly || mission.trim() === "") return;

    const response = await updateMission(userId, mission.trim());

    if (typeof response === "string" || response === false) return;

    setDisplayInput(false);
    onMissionUpdated();
  }

  return (
    <div
      className={`${cardClassName ?? ""} rounded-2xl border border-gray-200 bg-white p-2 md:p-3 dark:border-gray-800 dark:bg-white/3`}
    >
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700">
          <SparklesIcon className="size-6 text-gray-700 dark:text-white/90" />
        </div>

        {!readOnly && (
          <Button variant="outline" onClick={handleEditClick}>
            <TotalIcon />
          </Button>
        )}
      </div>

      <div className="mt-5">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {displayInput && !readOnly ? (
            <div className="flex w-full items-center gap-2">
              <div className="min-w-0 flex-1">
                <Input
                  value={mission}
                  placeholder={t("goals.missionPlaceholder")}
                  onChange={(e) => setMission(e.target.value)}
                />
              </div>

              <Button
                className="shrink-0 whitespace-nowrap"
                size="sm"
                onClick={handleSave}
              >
                {t("common.save")}
              </Button>
            </div>
          ) : (
            t("goals.myMission")
          )}
        </span>

        {!displayInput && (
          <p className="mt-2 text-sm font-bold text-gray-800 dark:text-white/90">
            {initialMission}
          </p>
        )}
      </div>
    </div>
  );
}
