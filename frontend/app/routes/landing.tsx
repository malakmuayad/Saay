import { Link, redirect } from "react-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "~/context/ThemeContext";
import { useLanguage } from "~/context/LanguageContext";
import { getCurrentUser } from "~/services/localStorage/users";

import {
  SunIcon,
  MoonIcon,
  ArrowRightIcon,
  DoneIcon,
  GoalIcon,
  CalendarIcon,
  SparklesIcon,
  MenuIcon,
  CloseIcon,
} from "~/assets/icons";
import { useState } from "react";
import { t } from "i18next";

export async function clientLoader() {
  const currentUserId = getCurrentUser();

  if (currentUserId) {
    throw redirect("/dashboard");
  }

  return null;
}

export const meta = () => [{ title: t("routes.landing") }];

export default function LandingPage() {
  const { t } = useTranslation();
  const { dir } = useLanguage();
  const language = useLanguage().currentLanguage.code;
  const setLanguage = useLanguage().setLanguage;
  const { theme, toggleTheme } = useTheme();

  const [menuOpen, setMenuOpen] = useState(false);

  const dark = theme === "dark";

  const page = dark ? "bg-[#0b1020] text-white" : "bg-[#fcfcff] text-slate-900";

  const muted = dark ? "text-slate-400" : "text-slate-600";
  const border = dark ? "border-white/10" : "border-slate-200/80";
  const surface = dark ? "bg-[#11182b]" : "bg-white";

  const primaryButton =
    "inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-brand-700";

  const navLink =
    "text-sm font-medium transition hover:text-brand-500 dark:hover:text-brand-300";

  const features = [
    {
      icon: CalendarIcon,
      number: "01",
      title: t("landing.features.tasks.title"),
      description: t("landing.features.tasks.description"),
    },
    {
      icon: GoalIcon,
      number: "02",
      title: t("landing.features.goals.title"),
      description: t("landing.features.goals.description"),
    },
    {
      icon: DoneIcon,
      number: "03",
      title: t("landing.features.habits.title"),
      description: t("landing.features.habits.description"),
    },
    {
      icon: SparklesIcon,
      number: "04",
      title: t("landing.features.ai.title"),
      description: t("landing.features.ai.description"),
    },
  ];

  const previewTasks = [
    {
      title: t("landing.preview.tasks.planWeek"),
      category: t("landing.preview.categories.personal"),
      done: true,
    },
    {
      title: t("landing.preview.tasks.importantTask"),
      category: t("landing.preview.categories.work"),
      done: true,
    },
    {
      title: t("landing.preview.tasks.learn"),
      category: t("landing.preview.categories.growth"),
      done: true,
    },
    {
      title: t("landing.preview.tasks.review"),
      category: t("landing.preview.categories.personal"),
      done: false,
    },
  ];

  const steps = [
    {
      number: "01",
      title: t("landing.steps.capture.title"),
      description: t("landing.steps.capture.description"),
    },
    {
      number: "02",
      title: t("landing.steps.choose.title"),
      description: t("landing.steps.choose.description"),
    },
    {
      number: "03",
      title: t("landing.steps.progress.title"),
      description: t("landing.steps.progress.description"),
    },
  ];

  return (
    <main
      dir={dir}
      data-color-scheme={dark ? "dark" : "light"}
      className={`relative min-h-screen overflow-hidden transition-colors duration-300 ${page}`}
    >
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[650px]"
        style={{
          background: dark
            ? "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,.17), transparent 65%)"
            : "radial-gradient(ellipse at 50% 0%, rgba(129,140,248,.19), transparent 65%)",
        }}
      />

      {/* Header */}
      <header className={`relative z-20 border-b ${border}`}>
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link
            to="/"
            aria-label={t("landing.header.home")}
            className="flex items-center gap-2.5"
          >
            <img
              src={dark ? "/assets/logo-dark.png" : "/assets/logo.png"}
              width={100}
              height={100}
              loading="eager"
              alt="Saay"
            />
          </Link>

          <nav
            aria-label={t("landing.header.mainNavigation")}
            className="hidden items-center gap-8 md:flex"
          >
            <a href="#features" className={navLink}>
              {t("landing.header.features")}
            </a>
            <a href="#how-it-works" className={navLink}>
              {t("landing.header.howItWorks")}
            </a>
            <a href="#ai-assistant" className={navLink}>
              {t("landing.header.aiAssistant")}
            </a>
          </nav>
          <div
            role="radiogroup"
            aria-label={t("language.label")}
            className="inline-flex items-center gap-1 rounded-xl border border-border bg-background/80 p-1 shadow-sm backdrop-blur-sm"
          >
            <button
              type="button"
              role="radio"
              aria-checked={language === "en"}
              title="English"
              onClick={() => setLanguage("en")}
              className={`focus-ring flex h-8 min-w-8 items-center justify-center rounded-xl px-3 text-xs font-semibold transition-all duration-200 ${
                language === "en"
                  ? "bg-brand-500 text-white shadow-sm"
                  : "hover:text-brand-500 dark:hover:text-brand-300"
              }`}
            >
              EN
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={language === "ar"}
              title="العربية"
              onClick={() => setLanguage("ar")}
              className={`focus-ring flex h-8 min-w-8 items-center justify-center rounded-xl px-3 text-xs font-semibold transition-all duration-200 ${
                language === "ar"
                  ? "bg-brand-500 text-white shadow-sm"
                  : "hover:bg-muted hover:text-brand-500 dark:hover:text-brand-300"
              }`}
            >
              ع
            </button>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={t(
                dark
                  ? "landing.header.switchToLight"
                  : "landing.header.switchToDark",
              )}
              title={t(
                dark
                  ? "landing.header.switchToLight"
                  : "landing.header.switchToDark",
              )}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${border} ${
                dark
                  ? "bg-white/5 hover:bg-white/10"
                  : "bg-white hover:bg-slate-100"
              }`}
            >
              {dark ? (
                <SunIcon width="19" height="19" />
              ) : (
                <MoonIcon width="19" height="19" />
              )}
            </button>

            <Link to="/signin" className={`${navLink} hidden sm:inline-flex`}>
              {t("landing.header.signIn")}
            </Link>

            <Link
              to="/signup"
              className={`${primaryButton} !hidden md:!inline-flex !rounded-xl !px-4 !py-2.5`}
            >
              {t("landing.header.getStarted")}
              <span className="hidden sm:inline">
                {t("landing.header.free")}
              </span>
            </Link>

            <button
              type="button"
              aria-label={t(
                menuOpen
                  ? "landing.header.closeMenu"
                  : "landing.header.openMenu",
              )}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border md:hidden ${border}`}
            >
              {menuOpen ? (
                <CloseIcon width="24" height="24" />
              ) : (
                <MenuIcon width="24" height="24" />
              )}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav
            aria-label={t("landing.header.mobileNavigation")}
            className={`border-t px-5 py-5 md:hidden ${border}`}
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-4">
              <a
                href="#features"
                onClick={() => setMenuOpen(false)}
                className={navLink}
              >
                {t("landing.header.features")}
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMenuOpen(false)}
                className={navLink}
              >
                {t("landing.header.howItWorks")}
              </a>
              <a
                href="#ai-assistant"
                onClick={() => setMenuOpen(false)}
                className={navLink}
              >
                {t("landing.header.aiAssistant")}
              </a>
              <Link
                to="/signin"
                className={navLink}
                onClick={() => setMenuOpen(false)}
              >
                {t("landing.header.signIn")}
              </Link>
            </div>
          </nav>
        )}
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-16 pt-20 text-center sm:px-8 sm:pt-28 lg:px-12 lg:pt-32">
        <div
          className={`mx-auto inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium sm:text-sm ${border} ${surface}`}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          {t("landing.hero.eyebrow")}
          <span className="text-brand-500 dark:text-brand-300">
            <SparklesIcon width="16" height="16" />
          </span>
        </div>

        <h1 className="mx-auto mt-7 max-w-4xl text-4xl font-bold leading-[1.13] tracking-tight sm:text-6xl lg:text-7xl">
          {t("landing.hero.titleFirst")}
          <br />
          <span className="bg-gradient-to-r from-[#527bd2] via-blue-500 to-[#85a5e6] bg-clip-text text-transparent">
            {t("landing.hero.titleHighlight")}
          </span>
        </h1>

        <p
          className={`mx-auto mt-6 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8 ${muted}`}
        >
          {t("landing.hero.description")}
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/signup" className={primaryButton}>
            {t("landing.hero.primaryCta")}
            <ArrowRightIcon width="18" height="18" />
          </Link>

          <a
            href="#features"
            className={`inline-flex items-center justify-center rounded-xl border px-5 py-3 text-sm font-semibold transition ${border} ${
              dark ? "hover:bg-white/5" : "hover:bg-slate-50"
            }`}
          >
            {t("landing.hero.secondaryCta")}
          </a>
        </div>

        <p className={`mt-4 text-xs ${muted}`}>{t("landing.hero.tagline")}</p>

        {/* Product preview */}
        <div className="mx-auto mt-16 max-w-5xl text-start sm:mt-20">
          <div
            className={`overflow-hidden rounded-2xl border p-2 shadow-2xl sm:rounded-3xl sm:p-3 ${border} ${
              dark
                ? "bg-white/[0.03] shadow-black/30"
                : "bg-white/70 shadow-indigo-900/10"
            }`}
          >
            <div
              className={`overflow-hidden rounded-xl border sm:rounded-2xl ${border} ${surface}`}
            >
              {/* Preview top bar */}
              <div
                className={`flex items-center justify-between border-b px-4 py-4 sm:px-6 ${border}`}
              >
                <div>
                  <p className="text-sm font-semibold">
                    {t("landing.preview.workspace")}
                  </p>
                  <p className={`text-xs ${muted}`}>
                    {t("landing.preview.subtitle")}
                  </p>
                </div>

                <span
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                    dark
                      ? "bg-brand-400/10 text-brand-300"
                      : "bg-brand-50 text-brand-700"
                  }`}
                >
                  {t("landing.preview.dashboard")}
                </span>
              </div>

              <div className="grid gap-0 md:grid-cols-[1fr_0.8fr]">
                {/* Task preview */}
                <div className={`p-5 sm:p-7 ${border} md:border-e`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold">
                        {t("landing.preview.todayFocus")}
                      </h2>
                      <p className={`mt-1 text-xs ${muted}`}>
                        {t("landing.preview.focusDescription")}
                      </p>
                    </div>

                    <span
                      className={`rounded-lg px-2.5 py-1.5 text-xs ${
                        dark ? "bg-white/5" : "bg-slate-100"
                      }`}
                    >
                      {t("landing.preview.taskCount")}
                    </span>
                  </div>

                  <div className="mt-6 space-y-3">
                    {previewTasks.map((task) => (
                      <div
                        key={task.title}
                        className={`flex items-center gap-3 rounded-xl border p-3.5 ${border}`}
                      >
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                            task.done
                              ? "border-brand-600 bg-brand-600 text-white"
                              : border
                          }`}
                        >
                          {task.done && <DoneIcon width="13" height="13" />}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p
                            className={`truncate text-sm font-medium ${
                              task.done ? `line-through ${muted}` : ""
                            }`}
                          >
                            {task.title}
                          </p>
                          <p className={`mt-1 text-xs ${muted}`}>
                            {task.category}
                          </p>
                        </div>

                        <span
                          className={`h-2 w-2 rounded-full ${
                            task.done ? "bg-emerald-500" : "bg-amber-400"
                          }`}
                        />
                      </div>
                    ))}
                  </div>

                  <div
                    className={`mt-5 flex items-center justify-between rounded-xl p-4 ${
                      dark ? "bg-indigo-400/[0.07]" : "bg-indigo-50/80"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        {t("landing.preview.momentumTitle")}
                      </p>
                      <p className={`mt-1 text-xs ${muted}`}>
                        {t("landing.preview.momentumDescription")}
                      </p>
                    </div>
                    <ArrowRightIcon width="18" height="18" />
                  </div>
                </div>

                {/* Goals, habits and AI preview */}
                <div className="space-y-5 p-5 sm:p-7">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">
                        {t("landing.preview.goalProgress")}
                      </h3>
                      <span className="text-xs text-brand-400 dark:text-brand-300">
                        {t("landing.preview.thisMonth")}
                      </span>
                    </div>

                    <div className={`mt-3 rounded-xl border p-4 ${border}`}>
                      <div className="flex items-center gap-4">
                        <div
                          className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full"
                          style={{
                            background: `conic-gradient(#6366f1 0% 72%, ${
                              dark ? "#293147" : "#e8eaf7"
                            } 72% 100%)`,
                          }}
                        >
                          <div
                            className={`absolute inset-1.5 flex items-center justify-center rounded-full ${surface}`}
                          >
                            <span className="text-sm font-bold">72%</span>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-semibold">
                            {t("landing.preview.personalGrowth")}
                          </p>
                          <p className={`mt-1 text-xs ${muted}`}>
                            {t("landing.preview.progressMessage")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold">
                      {t("landing.preview.dailyHabits")}
                    </h3>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className={`rounded-xl border p-3.5 ${border}`}>
                        <span className="text-lg">📚</span>
                        <p className="mt-2 text-sm font-medium">
                          {t("landing.preview.readDaily")}
                        </p>
                        <p className={`mt-1 text-xs ${muted}`}>
                          {t("landing.preview.readStreak")}
                        </p>
                      </div>

                      <div className={`rounded-xl border p-3.5 ${border}`}>
                        <span className="text-lg">💧</span>
                        <p className="mt-2 text-sm font-medium">
                          {t("landing.preview.stayHydrated")}
                        </p>
                        <p className={`mt-1 text-xs ${muted}`}>
                          {t("landing.preview.waterStreak")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    id="ai-assistant"
                    className={`rounded-xl border p-4 ${
                      dark
                        ? "border-indigo-400/20 bg-indigo-400/[0.06]"
                        : "border-indigo-100 bg-indigo-50/60"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                        <SparklesIcon width="17" height="17" />
                      </span>

                      <div>
                        <p className="text-sm font-semibold">
                          {t("landing.preview.aiName")}
                        </p>
                        <p className={`text-xs ${muted}`}>
                          {t("landing.preview.aiSubtitle")}
                        </p>
                      </div>
                    </div>

                    <p className={`mt-3 text-xs leading-5 ${muted}`}>
                      {t("landing.preview.aiMessage")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className={`mt-4 text-center text-xs ${muted}`}>
            {t("landing.preview.closingLine")}
          </p>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className={`relative z-10 border-t py-20 sm:py-28 ${border}`}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold tracking-wide text-brand-500 dark:text-brand-400">
              {t("landing.features.eyebrow")}
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
              {t("landing.features.heading")}
            </h2>

            <p className={`mt-5 text-base leading-7 ${muted}`}>
              {t("landing.features.intro")}
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
            {features.map((feature) => {
              const FeatureIcon = feature.icon;

              return (
                <article
                  key={feature.number}
                  className={`group rounded-2xl border p-6 transition duration-300 hover:-translate-y-1 ${border} ${surface} ${
                    dark
                      ? "hover:border-indigo-400/40"
                      : "hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-900/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
                      <FeatureIcon width="23" height="23" />
                    </span>
                    <span className={`text-xs ${muted}`}>{feature.number}</span>
                  </div>

                  <h3 className="mt-6 text-lg font-semibold">
                    {feature.title}
                  </h3>

                  <p className={`mt-3 text-sm leading-6 ${muted}`}>
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className={`border-t py-20 sm:py-24 ${border}`}
      >
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center lg:px-12">
          <div>
            <p className="text-sm font-semibold tracking-wide text-brand-500 dark:text-brand-300">
              {t("landing.steps.eyebrow")}
            </p>

            <h2 className="mt-4 max-w-xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
              {t("landing.steps.heading")}
            </h2>

            <p className={`mt-5 max-w-xl leading-7 ${muted}`}>
              {t("landing.steps.intro")}
            </p>

            <Link to="/signup" className={`${primaryButton} mt-8`}>
              {t("landing.steps.cta")}
              <ArrowRightIcon width="18" height="18" />
            </Link>
          </div>

          <div className="space-y-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`flex gap-4 rounded-2xl border p-5 sm:p-6 ${border} ${surface}`}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-sm font-bold text-brand-500 dark:text-brand-300">
                  {step.number}
                </span>

                <div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className={`mt-2 text-sm leading-6 ${muted}`}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-5 py-16 sm:px-8 sm:py-24">
        <div
          className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl
          bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800
          px-6 py-14 text-center text-white sm:px-12 sm:py-20"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full border border-white/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-40 -left-16 h-80 w-80 rounded-full border border-white/10"
          />

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium">
              <SparklesIcon width="15" height="15" />
              {t("landing.cta.eyebrow")}
            </span>

            <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
              {t("landing.cta.heading")}
            </h2>

            <p className="mx-auto mt-5 max-w-xl leading-7 text-indigo-100">
              {t("landing.cta.description")}
            </p>

            <Link
              to="/signup"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
            >
              {t("landing.cta.button")}
              <ArrowRightIcon width="18" height="18" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t ${border}`}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-5 py-8 sm:px-8 md:flex-row lg:px-12">
          <Link
            to="/"
            aria-label={t("landing.header.home")}
            className="flex items-center gap-2 font-bold"
          >
            <img
              src={dark ? "/assets/logo-dark.png" : "/assets/logo.png"}
              width={100}
              height={100}
              loading="lazy"
              alt="Saay"
            />
          </Link>

          <p className={`text-center text-xs ${muted}`}>
            {t("landing.footer.tagline")}
          </p>

          <div className="flex items-center gap-5">
            <Link to="/signin" className={navLink}>
              {t("landing.header.signIn")}
            </Link>
            <Link to="/signup" className={navLink}>
              {t("landing.footer.signUp")}
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
