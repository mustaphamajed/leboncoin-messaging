import { cn, formatTime, toIsoString } from '@/lib'
import type { DeliveryStatus } from "../types";

interface MessageBubbleProps {
  body: string;
  timestamp: number;
  authorName: string;
  isOwn: boolean;
  showAuthor: boolean;
  status?: DeliveryStatus;
  onRetry?: () => void;
  onDiscard?: () => void;
}

const statusConfig: Record<
  DeliveryStatus,
  { bubbleClassName?: string; label?: string }
> = {
  sent: {},
  sending: { bubbleClassName: "opacity-70", label: "Sending…" },
  waiting: { bubbleClassName: "opacity-70", label: "Waiting for connection…" },
  failed: { bubbleClassName: "ring-2 ring-red-600 ring-offset-1" },
};

const actionClassName =
  "font-medium underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700";

export function MessageBubble({
  body,
  timestamp,
  authorName,
  isOwn,
  showAuthor,
  status = "sent",
  onRetry,
  onDiscard,
}: MessageBubbleProps) {
  const { bubbleClassName, label } = statusConfig[status];

  return (
    <li
      className={cn(
        "flex max-w-[80%] flex-col md:max-w-[65%]",
        isOwn ? "items-end self-end" : "items-start self-start",
      )}
    >
      {showAuthor && (
        <span aria-hidden="true" className="mb-1 px-3 text-xs text-gray-600">
          {authorName}
        </span>
      )}
      <p
        className={cn(
          "rounded-2xl px-4 py-2 wrap-break-word whitespace-pre-wrap",
          isOwn
            ? "rounded-br-sm bg-bubble-own text-white"
            : "rounded-bl-sm bg-bubble-other text-gray-900",
          bubbleClassName,
        )}
      >
        <span className="sr-only">{isOwn ? "You" : authorName}: </span>
        {body}
      </p>

      {status === "sent" && (
        <time
          dateTime={toIsoString(timestamp)}
          className="mt-1 px-1 text-xs text-gray-500"
        >
          {formatTime(timestamp)}
        </time>
      )}
      {label && (
        <span className="mt-1 px-1 text-xs text-gray-500">{label}</span>
      )}
      {status === "failed" && (
        <span className="mt-1 flex gap-3 px-1 text-xs text-red-700">
          <span>Not sent.</span>
          <button type="button" onClick={onRetry} className={actionClassName}>
            Retry
          </button>
          <button type="button" onClick={onDiscard} className={actionClassName}>
            Delete
          </button>
        </span>
      )}
    </li>
  );
}
