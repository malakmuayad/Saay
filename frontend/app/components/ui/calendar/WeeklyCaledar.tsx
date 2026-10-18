import { useLanguage } from "~/context/LanguageContext";
import { useTheme } from "~/context/ThemeContext";
import { useAuth } from "~/context/AuthContext";
import { useModal } from "~/hooks/useModal";

import type {
  CalendarRef,
  DateClickInfo,
  DayHeaderInfo,
  EventDisplayInfo,
  ToolbarSectionInfo,
} from "@fullcalendar/react";

import FullCalendar from "@fullcalendar/react";
import { plugins as bundledPlugins } from "@fullcalendar/react/all";
import "@fullcalendar/react/skeleton.css";
import themePlugin from "@fullcalendar/react/themes/classic";
import "@fullcalendar/react/themes/classic/palette.css";
import "@fullcalendar/react/themes/classic/theme.css";

import React, { useEffect, useRef, useState } from "react";

import CalendarEventItem from "./CalendarEventItem";
import { AddTaskModal } from "../../tasks/AddTaskModal";

import { CloseIcon } from "~/assets/icons";

import { getUserTasksForWeek } from "~/services/api/tasks";
import type { TaskDto } from "~/types/tasks/TaskDto";

const WeeklyCalendar: React.FC = () => {
  const currentUserId = useAuth()?.currentUserId;

  const { language: locale, dir } = useLanguage();
  const isRtlLayout = dir === "rtl";

  const { theme } = useTheme();

  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [portalNode, setPortalNode] = useState<Element | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const calendarRef = useRef<CalendarRef>(null);
  const calendarContainerRef = useRef<HTMLDivElement>(null);

  const { isOpen, openModal, closeModal } = useModal();

  const calendarLocale = locale === "ar" ? "ar-SA" : "en-US";

  const loadTasks = async () => {
    if (currentUserId == null) return;

    const result = await getUserTasksForWeek(currentUserId, 1, 100);

    if (typeof result === "string") {
      console.error(result);
      return;
    }

    setTasks(result);
  };

  useEffect(() => {
    loadTasks();
  }, [currentUserId]);

  const handleDateClick = (info: DateClickInfo) => {
    setSelectedDate(info.dateStr);
    openModal();
  };

  const calendarTasks = tasks.map((task) => ({
    id: task.taskId.toString(),
    title: task.title,
    start: task.dueTime ? `${task.dueDate}T${task.dueTime}` : task.dueDate,
    allDay: !task.dueTime,
    extendedProps: {
      task,
    },
  }));

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    const frameId = requestAnimationFrame(() => {
      const el = calendarContainerRef.current?.querySelector(
        ".ta-toolbar-section:last-child",
      );

      if (el) {
        setPortalNode(el);
      }
    });

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", checkMobile);
    };
  }, [isRtlLayout]);

  return (
    <div
      className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3"
      data-color-scheme={theme}
    >
      <div
        className="custom-calendar relative"
        data-color-scheme={theme}
        ref={calendarContainerRef}
      >
        <FullCalendar
          key={`${calendarLocale}-${isRtlLayout ? "rtl" : "ltr"}-weekly`}
          ref={calendarRef}
          className="gap-0!"
          plugins={[...bundledPlugins, themePlugin]}
          initialView="dayGridWeek"

          locale={calendarLocale}
          direction={isRtlLayout ? "rtl" : "ltr"}

          headerToolbar={{
            center: "title",
          }}
          headerToolbarClass="sticky top-0! z-20! bg-white dark:bg-gray-900 flex-wrap! flex-row! items-center justify-between gap-3 sm:gap-4 [padding-inline:16px]! sm:[padding-inline:24px]! pt-4 sm:pt-6 pb-3 sm:pb-4"
          toolbarTitleClass="text-base! sm:text-lg! font-semibold! text-gray-800 dark:text-white/90"
          toolbarSectionClass={(info: ToolbarSectionInfo) => {
            if (info.name === "start") {
              return "ta-toolbar-section ta-toolbar-start order-2 flex w-full items-center justify-between sm:order-1 sm:w-auto sm:justify-start gap-2";
            }

            if (info.name === "center") {
              return "ta-toolbar-section ta-toolbar-center order-1 flex items-center justify-start sm:order-2 sm:justify-center";
            }

            if (info.name === "end") {
              return "ta-toolbar-section ta-toolbar-end order-1 flex items-center justify-end sm:order-3 sm:justify-end";
            }

            return "ta-toolbar-section";
          }}
          buttonGroupClass="gap-2"

          titleFormat={{
            month: "long",
            year: "numeric",
          }}
          views={{
            dayGridWeek: {
              dayMaxEvents: isMobile ? 0 : undefined,

              dayHeaderContent: (arg: DayHeaderInfo) => {
                const weekday = new Intl.DateTimeFormat(calendarLocale, {
                  weekday: "short",
                })
                  .format(arg.date)
                  .toUpperCase();

                const day = new Intl.DateTimeFormat(calendarLocale, {
                  day: "numeric",
                }).format(arg.date);

                const shortArabicDays = ["أ", "ن", "ث", "ر", "خ", "ج", "س"];
                const shortEnglishDays = ["S", "M", "T", "W", "T", "F", "S"];

                const shortWeekday =
                  locale === "ar"
                    ? shortArabicDays[arg.date.getDay()]
                    : shortEnglishDays[arg.date.getDay()];

                return (
                  <>
                    <span className="sm:hidden">
                      {shortWeekday} - {day}
                    </span>

                    <span className="hidden sm:inline">
                      {weekday} - {day}
                    </span>
                  </>
                );
              },
              dayHeaderClass: (data: DayHeaderInfo) =>
                `border-0! bg-gray-50! dark:bg-gray-900! ${
                  data.isToday ? "bg-gray-100/70! dark:bg-gray-800/60!" : ""
                }`,

              dayHeaderInnerClass: (data: DayHeaderInfo) =>
                `px-2! sm:pdayHeax-3! py-3! sm:py-3.5! text-center! text-[11px]! sm:text-xs! font-medium! text-gray-500! uppercase! dark:text-gray-400! ${
                  data.isToday
                    ? "font-semibold! text-brand-500! dark:text-brand-400!"
                    : ""
                }`,
            },
          }}

          /*
           * Body configuration
           */
          height="auto"
          borderless={true}
          viewClass="border-t! border-b-0! border-x-0! border-gray-200! bg-transparent! dark:border-gray-800! dark:bg-transparent!"
          tableHeaderClass="border-0! bg-gray-50! dark:bg-gray-900!"
          dayHeaderDividerClass="border-b! border-t-0! border-x-0! border-gray-200! p-0! bg-transparent! dark:border-gray-800!"
          slotMinHeight={56}
          slotHeaderDividerClass="border-e! border-s-0! border-y-0! border-gray-200! dark:border-gray-800!"
          allDayDividerClass="border-b! border-t-0! border-x-0! border-gray-200! p-0! bg-transparent! dark:border-gray-800!"
          eventClass="focus:shadow-none"
          nowIndicator={false}
          columnEventClass="bg-transparent! border-0! p-1! shadow-none! hover:shadow-none! focus:outline-none"
          columnEventInnerClass="p-0! border-0! bg-transparent! h-full"
          tableHeaderSticky={true}
          tableClass="overflow-hidden bg-transparent!"
          rowEventClass="bg-transparent! border-0! px-1! py-0.5! shadow-none! hover:shadow-none! focus:outline-none"
          rowEventInnerClass="p-0! border-0! bg-transparent!"

          /*
           * Event popover date formatting
           */
          popoverFormat={{
            month: "short",
            day: "numeric",
            year: "numeric",
          }}
          popoverClass="z-99999! w-72 max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl border! border-gray-200! bg-white! shadow-theme-lg dark:border-gray-800! dark:bg-gray-900!"
          popoverCloseClass="absolute end-3 top-2.5 flex size-7 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
          popoverCloseContent={() => <CloseIcon className="size-4" />}

          /*
           * Keep the portal target updated whenever
           * FullCalendar changes its displayed dates.
           */
          datesSet={() => {
            requestAnimationFrame(() => {
              const chunk = calendarContainerRef.current?.querySelector(
                ".ta-toolbar-section:last-child",
              );

              if (chunk) {
                setPortalNode(chunk);
              }
            });
          }}

          events={calendarTasks}
          dateClick={handleDateClick}
          eventContent={(eventInfo: EventDisplayInfo) => (
            <CalendarEventItem eventInfo={eventInfo} />
          )}
        />
      </div>

      <AddTaskModal
        isOpen={isOpen}
        onClose={closeModal}
        onTaskAdded={loadTasks}
        dueDate={selectedDate}
      />
    </div>
  );
};

export default WeeklyCalendar;
