import { Modal } from "~/components/ui/modal/Modal";
import Label from "~/components/form/Label";
import Input from "~/components/form/input/InputField";
import Select from "~/components/form/input/Select";
import { useState, useEffect } from "react";
import Button from "~/components/ui/button/Button";
import DatePicker from "~/components/form/input/date-picker";
import { addGoal, getCategories, updateGoal } from "~/services/api/goals";
import { useAuth } from "~/context/AuthContext";
import Alert from "~/components/ui/Alert";
import type { Goal } from "~/types/goals/Goal";
import type { GoalCategoryDto } from "~/types/goals/GoalCategoryDto";
import Checkbox from "~/components/form/input/Checkbox";

type AddEditGoalModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onGoalChanged: () => void;
  goal: Goal | null;
};

export function AddEditGoalModal({
  isOpen,
  onClose,
  onGoalChanged,
  goal,
}: AddEditGoalModalProps) {
  const currentUserId = useAuth()?.currentUserId;

  // A non-null goal means edit mode.
  const isEdit = goal !== null;

  const [goalTitle, setGoalTitle] = useState("");
  const [goalTitleValid, setGoalTitleValid] = useState(true);

  const [goalCategoryId, setGoalCategoryId] = useState("");
  const [goalCategoryValid, setGoalCategoryValid] = useState(true);

  const [timeFrame, setTimeFrame] = useState("");
  const [timeFrameValid, setTimeFrameValid] = useState(true);

  const [deadline, setDeadline] = useState(getTodayDate());
  const [deadlineValid, setDeadlineValid] = useState(true);

  const [isDone, setIsDone] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [categories, setCategories] = useState<GoalCategoryDto[]>([]);

  /*
   * Load goal categories.
   */
  useEffect(() => {
    let ignore = false;

    async function loadCategories() {
      const result = await getCategories();

      if (!ignore && typeof result !== "string") {
        setCategories(result);
      }
    }

    loadCategories();

    return () => {
      ignore = true;
    };
  }, []);

  const timeFrameMap: Record<string, string> = {
    Monthly: "0",
    Quarterly: "1",
    Biannual: "2",
    Annually: "3",
  };

  // Populate the form when editing.
  useEffect(() => {
    if (!isOpen) return;

    if (goal) {
      setGoalTitle(goal.title.trim());

      const category = categories.find(
        (category) => category.title === goal.categoryTitle,
      );

      setGoalCategoryId(category ? String(category.categoryId) : "");

      setTimeFrame(timeFrameMap[goal.timeFrame] ?? "");

      setDeadline(new Date(goal.deadline).toISOString().slice(0, 10));
      setIsDone(goal.isDone);

      setGoalTitleValid(true);
      setGoalCategoryValid(!!category);
      setTimeFrameValid(true);
      setDeadlineValid(true);
    } else {
      resetForm();
    }

    setError(null);
    setSuccess(false);
  }, [isOpen, goal, categories]);

  const categoryOptions = categories.map((category) => ({
    value: String(category.categoryId),
    label: category.title,
  }));

  const timeFrameOptions = [
    { value: "0", label: "Monthly" },
    { value: "1", label: "Quarterly" },
    { value: "2", label: "Biannual" },
    { value: "3", label: "Annually" },
  ];

  function getTodayDate(): string {
    const today = new Date();

    return [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");
  }

  function resetForm() {
    setGoalTitle("");
    setGoalCategoryId("");
    setTimeFrame("");
    setDeadline(getTodayDate());
    setIsDone(false);

    setGoalTitleValid(true);
    setGoalCategoryValid(true);
    setTimeFrameValid(true);
    setDeadlineValid(true);
  }

  function validateFields() {
    return (
      goalTitle !== "" &&
      goalCategoryId !== "" &&
      timeFrame !== "" &&
      deadline !== ""
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!validateFields()) {
      setGoalTitleValid(goalTitle !== "");
      setGoalCategoryValid(goalCategoryId !== "");
      setTimeFrameValid(timeFrame !== "");
      setDeadlineValid(deadline !== "");
      return;
    }

    if (currentUserId == null) {
      return;
    }

    setSaving(true);
    setError(null);

    let result;

    if (goal) {
      result = await updateGoal({
        goalId: goal.goalId,
        goalCategoryId: Number(goalCategoryId),
        title: goalTitle,
        timeFrame: Number(timeFrame),
        deadline,
        isDone,
      });
    } else {
      result = await addGoal({
        userId: currentUserId,
        goalCategoryId: Number(goalCategoryId),
        title: goalTitle,
        timeFrame: Number(timeFrame),
        deadline,
      });
    }

    if (typeof result === "string") {
      setError(result);
      setSaving(false);
      return;
    }

    setSaving(false);
    setSuccess(true);

    onGoalChanged();

    setTimeout(() => {
      resetForm();
      onClose();
      setSuccess(false);
    }, 1500);
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="w-[calc(100%-2rem)] max-w-[500px] sm:w-[500px]"
    >
      <div className="p-6">
        {/* Alert */}
        {error && (
          <div className="mt-6 mb-4">
            <Alert variant="error" title="Error" message={error} />
          </div>
        )}

        {success && (
          <div className="mt-6 mb-4">
            <Alert
              variant="success"
              title="Success"
              message={
                isEdit
                  ? "Goal is updated successfully!"
                  : "Goal is added successfully!"
              }
            />
          </div>
        )}

        <h3 className="mb-6 text-lg font-semibold dark:text-white">
          {isEdit ? "Edit Goal" : "Add New Goal"}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Goal Title */}
            <div>
              <Label htmlFor="goalTitle">Goal Title</Label>

              <Input
                id="goalTitle"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                hint={!goalTitleValid ? "This field is required" : undefined}
                onBlur={() => setGoalTitleValid(goalTitle !== "")}
                error={!goalTitleValid}
              />
            </div>

            {/* Goal Category */}
            <div>
              <Label>Goal Category</Label>

              <Select
                options={categoryOptions}
                value={goalCategoryId}
                placeholder="Select a category"
                onChange={(value) => {
                  setGoalCategoryId(value);
                  setGoalCategoryValid(value !== "");
                }}
              />

              {!goalCategoryValid && (
                <p className="mt-1.5 text-sm text-error-500">
                  This field is required
                </p>
              )}
            </div>

            {/* Time Frame */}
            <div>
              <Label>Time Frame</Label>

              <Select
                options={timeFrameOptions}
                value={timeFrame}
                placeholder="Select a time frame"
                onChange={(value) => {
                  setTimeFrame(value);
                  setTimeFrameValid(value !== "");
                }}
              />

              {!timeFrameValid && (
                <p className="mt-1.5 text-sm text-error-500">
                  This field is required
                </p>
              )}
            </div>

            {/* Deadline */}
            <div>
              <Label htmlFor="deadline">Deadline</Label>

              <DatePicker
                id="deadline"
                minDate={isEdit ? undefined : new Date()}
                defaultDate={deadline}
                onChange={(selectedDates) => {
                  if (selectedDates.length > 0) {
                    const date = selectedDates[0];

                    const formattedDate = [
                      date.getFullYear(),
                      String(date.getMonth() + 1).padStart(2, "0"),
                      String(date.getDate()).padStart(2, "0"),
                    ].join("-");

                    setDeadline(formattedDate);
                    setDeadlineValid(true);
                  }
                }}
              />

              {!deadlineValid && (
                <p className="mt-1.5 text-sm text-error-500">
                  This field is required
                </p>
              )}
            </div>

            {/* Is Done */}
            <Checkbox
              label="Mark as completed"
              checked={isDone}
              onChange={setIsDone}
            />
          </div>

          <Button className="mt-6 w-full" size="md" disabled={saving}>
            {saving
              ? isEdit
                ? "Updating..."
                : "Adding..."
              : isEdit
                ? "Update Goal"
                : "Add Goal"}
          </Button>
        </form>
      </div>
    </Modal>
  );
}
