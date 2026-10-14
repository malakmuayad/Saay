import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "~/context/AuthContext";
import { getAIReply } from "~/services/api/ai";
import Badge from "../ui/Badge";
import ReactMarkdown from "react-markdown";
import { getLanguage } from "~/services/localStorage/languages";
import type { Message } from "~/types/ai/Message";

type AIChatbotProps = {
  onClose: () => void;
};

interface MessageUI {
  id: number;
  text: string;
  sender: "user" | "ai";
}

export default function AIChatbot({ onClose }: AIChatbotProps) {
  const currentUserId = useAuth()?.currentUserId;
  const language = getLanguage();
  const { t } = useTranslation();

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState<MessageUI[]>([
    {
      id: 1,
      sender: "ai",
      text: t("aiChatbot.welcome"),
    },
  ]);

  const [sentMessages, setSentMessages] = useState<Message[]>([]);

  const handleSend = async (text?: string) => {
    const trimmedMessage = (text ?? message).trim();

    if (!trimmedMessage || isLoading) return;

    if (currentUserId === null || currentUserId === undefined) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "user",
        text: trimmedMessage,
      },
    ]);

    const updatedSentMessages = [
      ...sentMessages,
      {
        role: "user",
        content: trimmedMessage,
      },
    ];
    setSentMessages(updatedSentMessages);

    setMessage("");
    setIsLoading(true);

    try {
      const response = await getAIReply(updatedSentMessages);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: response,
        },
      ]);
    } catch (error) {
      console.error("AI message error:", error);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: t("aiChatbot.error"),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/20 p-4 backdrop-blur-[2px]">
      <div className="flex h-[600px] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-brand-500 px-5 py-4 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white">
              ✨
            </div>

            <div>
              <h3 className="font-semibold text-white">
                {t("aiChatbot.title")}
              </h3>

              <p className="text-xs text-white/80">{t("aiChatbot.subtitle")}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t("aiChatbot.close")}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <span className="text-xl leading-none">×</span>
          </button>
        </div>

        {/* Messages */}
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  msg.sender === "user"
                    ? "rounded-br-md bg-brand-500 text-white"
                    : "rounded-bl-md bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                }`}
              >
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          ))}

          {/* AI Loading State */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-gray-100 px-4 py-3 dark:bg-gray-800">
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
              </div>
            </div>
          )}
        </div>

        {/* Suggested prompts */}
        <div className="m-2 flex flex-wrap gap-2">
          <Badge
            className="cursor-pointer"
            onClick={() =>
              handleSend(
                language === "en"
                  ? "Help me build a habit"
                  : "ساعدني في بناء عادة",
              )
            }
          >
            {t("aiChatbot.suggestions.habits")}
          </Badge>

          <Badge
            className="cursor-pointer"
            onClick={() =>
              handleSend(
                language === "en"
                  ? "Help me achieve my goals"
                  : "ساعدني في تحقيق أهدافي",
              )
            }
          >
            {t("aiChatbot.suggestions.goals")}
          </Badge>

          <Badge
            className="cursor-pointer"
            onClick={() =>
              handleSend(
                language === "en"
                  ? "Help me prioritize my tasks"
                  : "ساعدني في تحديد أولويات مهامي",
              )
            }
          >
            {t("aiChatbot.suggestions.tasks")}
          </Badge>

          <Badge
            className="cursor-pointer"
            onClick={() =>
              handleSend(
                language === "en"
                  ? "Help me plan my day"
                  : "ساعدني في تخطيط يومي",
              )
            }
          >
            {t("aiChatbot.suggestions.plan")}
          </Badge>
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-gray-200 p-3 dark:border-gray-800">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("aiChatbot.placeholder")}
              disabled={isLoading}
              className="min-w-0 flex-1 bg-transparent px-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-60 dark:text-white"
            />

            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!message.trim() || isLoading}
              aria-label={t("aiChatbot.send")}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ↑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
