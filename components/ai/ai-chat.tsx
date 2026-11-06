"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import {
  ArrowUp,
  BarChart3,
  Bot,
  Check,
  Copy,
  Lightbulb,
  Loader2,
  PackageSearch,
  Plus,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
};

const suggestions = [
  {
    title: "Sales overview",
    description: "Check your total revenue",
    question: "What is our total revenue?",
    icon: BarChart3,
  },
  {
    title: "Inventory insights",
    description: "Find products running low",
    question: "Which products are low on stock?",
    icon: PackageSearch,
  },
  {
    title: "Register a sale",
    description: "Learn how to record sales",
    question: "How do I register a sale?",
    icon: ReceiptText,
  },
  {
    title: "Business advice",
    description: "Explore ways to grow",
    question: "How can we improve our sales?",
    icon: Lightbulb,
  },
];

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<
    string | null
  >(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeRequestRef = useRef<AbortController | null>(
    null
  );

  const copyTimeoutRef = useRef<
    ReturnType<typeof setTimeout> | undefined
  >(undefined);

  useEffect(() => {
    return () => {
      activeRequestRef.current?.abort();

      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0 || loading) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages, loading]);

  function createMessage(
    role: Message["role"],
    content: string,
    isError = false
  ): Message {
    return {
      id: crypto.randomUUID(),
      role,
      content,
      isError,
    };
  }

  function handleSuggestion(question: string) {
    setInput(question);
    textareaRef.current?.focus();
  }

  function handleNewChat() {
    // Prevent an old request from updating the new chat.
    activeRequestRef.current?.abort();
    activeRequestRef.current = null;

    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }

    setMessages([]);
    setInput("");
    setLoading(false);
    setCopiedMessageId(null);

    textareaRef.current?.focus();
  }

  async function handleCopyMessage(message: Message) {
    try {
      await navigator.clipboard.writeText(message.content);

      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }

      setCopiedMessageId(message.id);

      copyTimeoutRef.current = setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000);
    } catch (error) {
      console.error("Unable to copy AI response:", error);
    }
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();

      if (!loading && input.trim()) {
        void sendMessage();
      }
    }
  }

  async function sendMessage(event?: FormEvent) {
    event?.preventDefault();

    const question = input.trim();

    if (!question || loading || activeRequestRef.current) {
      return;
    }

    const controller = new AbortController();

    activeRequestRef.current = controller;

    setMessages((previous) => [
      ...previous,
      createMessage("user", question),
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: question,
        }),
        signal: controller.signal,
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          const retryAfter = response.headers.get(
            "Retry-After"
          );

          const seconds = retryAfter
            ? Number(retryAfter)
            : null;

          const waitMessage =
            seconds !== null &&
            Number.isFinite(seconds) &&
            seconds > 0
              ? `Please try again in ${Math.ceil(
                  seconds
                )} seconds.`
              : "Please try again later.";

          throw new Error(
            `You've reached your AI request limit. ${waitMessage}`
          );
        }

        const errorMessage =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof data.error === "string"
            ? data.error
            : "Unable to process your request.";

        throw new Error(errorMessage);
      }

      const answer =
        typeof data === "object" &&
        data !== null &&
        "answer" in data &&
        typeof data.answer === "string"
          ? data.answer
          : null;

      if (answer === null) {
        throw new Error("Invalid AI response.");
      }

      // Ignore results from a cancelled conversation.
      if (activeRequestRef.current !== controller) {
        return;
      }

      setMessages((previous) => [
        ...previous,
        createMessage("assistant", answer),
      ]);
    } catch (error) {
      if (
        controller.signal.aborted ||
        activeRequestRef.current !== controller
      ) {
        return;
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";

      setMessages((previous) => [
        ...previous,
        createMessage("assistant", errorMessage, true),
      ]);
    } finally {
      if (activeRequestRef.current === controller) {
        activeRequestRef.current = null;
        setLoading(false);
        textareaRef.current?.focus();
      }
    }
  }

  return (
    <div className="flex h-[min(75vh,760px)] min-h-125 flex-col bg-white">
      {/* Chat header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-600 to-blue-600 shadow-sm">
            <Bot className="size-6 text-white" />
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-slate-950 sm:text-base">
              ALIF AI
            </h2>

            <p className="text-xs text-slate-500">
              Business intelligence assistant
            </p>
          </div>
        </div>

        {/* New Chat button */}
        <button
          type="button"
          onClick={handleNewChat}
          aria-label="Start a new chat"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          <Plus className="size-4" />

          <span className="hidden sm:inline">New Chat</span>
        </button>
      </div>

      {/* Messages area */}
      <div
        className="min-h-0 flex-1 overflow-y-auto bg-linear-to-b from-slate-50/70 via-white to-white px-4 py-6 sm:px-8"
        aria-label="Chat messages"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.length === 0 ? (
          <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center py-6">
            {/* Welcome icon */}
            <div className="relative mb-5">
              <div className="absolute inset-0 rounded-3xl bg-indigo-200/60 blur-2xl" />

              <div className="relative flex size-16 items-center justify-center rounded-3xl bg-linear-to-br from-indigo-600 to-blue-600 shadow-lg shadow-indigo-200">
                <Sparkles className="size-8 text-white" />
              </div>
            </div>

            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              <Sparkles className="size-3.5" />
              Your AI business companion
            </div>

            <h3 className="mt-3 text-center text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              How can I help you today?
            </h3>

            <p className="mt-3 max-w-md text-center text-sm leading-6 text-slate-500">
              Ask questions about your sales, inventory,
              business performance, or how to use ALIF.
            </p>

            {/* Suggested questions */}
            <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
              {suggestions.map((suggestion) => {
                const Icon = suggestion.icon;

                return (
                  <button
                    key={suggestion.title}
                    type="button"
                    onClick={() =>
                      handleSuggestion(suggestion.question)
                    }
                    disabled={loading}
                    className="group flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100">
                      <Icon className="size-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        {suggestion.title}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {suggestion.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-6">
            {messages.map((message) => {
              const isUser = message.role === "user";
              const isCopied =
                copiedMessageId === message.id;

              return (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    isUser ? "flex-row-reverse" : ""
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
                      isUser
                        ? "bg-slate-200 text-slate-700"
                        : "bg-indigo-600 text-white"
                    }`}
                  >
                    {isUser ? (
                      <UserRound className="size-4.5" />
                    ) : (
                      <Bot className="size-4.5" />
                    )}
                  </div>

                  {/* Message content */}
                  <div
                    className={`min-w-0 max-w-[85%] ${
                      isUser ? "text-right" : ""
                    }`}
                  >
                    <p className="mb-1.5 px-1 text-xs font-semibold text-slate-500">
                      {isUser ? "You" : "ALIF AI"}
                    </p>

                    <div
                      className={`whitespace-pre-wrap wrap-break-word rounded-2xl px-4 py-3 text-left text-sm leading-7 shadow-sm ${
                        isUser
                          ? "rounded-tr-md bg-indigo-600 text-white"
                          : message.isError
                            ? "rounded-tl-md border border-red-200 bg-red-50 text-red-700"
                            : "rounded-tl-md border border-slate-200 bg-white text-slate-800"
                      }`}
                    >
                      {message.content}
                    </div>

                    {/* Copy response */}
                    {!isUser && !message.isError && (
                      <div className="mt-2 flex justify-start">
                        <button
                          type="button"
                          onClick={() =>
                            void handleCopyMessage(message)
                          }
                          aria-label={
                            isCopied
                              ? "Response copied"
                              : "Copy AI response"
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                          {isCopied ? (
                            <>
                              <Check className="size-3.5 text-emerald-600" />
                              <span className="text-emerald-600">
                                Copied
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy className="size-3.5" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Loading indicator */}
            {loading && (
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
                  <Bot className="size-4.5" />
                </div>

                <div>
                  <p className="mb-1.5 px-1 text-xs font-semibold text-slate-500">
                    ALIF AI
                  </p>

                  <div className="flex items-center gap-3 rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <Loader2 className="size-4 animate-spin text-indigo-600" />

                    <span className="text-sm text-slate-500">
                      Thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message composer */}
      <div className="border-t border-slate-100 bg-white px-3 py-3 sm:px-6 sm:py-4">
        <form
          onSubmit={sendMessage}
          className="mx-auto max-w-3xl"
        >
          <div className="flex items-end gap-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm transition-colors focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) =>
                setInput(event.target.value)
              }
              onKeyDown={handleKeyDown}
              maxLength={2000}
              rows={1}
              placeholder="Ask ALIF AI anything..."
              aria-label="Message to ALIF AI"
              className="max-h-32 min-h-10 min-w-0 flex-1 resize-none bg-transparent px-3 py-2 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400"
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
            >
              {loading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <ArrowUp className="size-5" />
              )}
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between gap-3 px-1">
            <p className="text-[11px] text-slate-400">
              Enter to send · Shift + Enter for new line
            </p>

            <span className="shrink-0 text-[11px] text-slate-400">
              {input.length}/2000
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}