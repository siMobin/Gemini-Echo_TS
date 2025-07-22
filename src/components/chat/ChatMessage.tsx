import { ChatMessage as ChatMessageType } from "@/types/chat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { User, Wheat } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3 mb-4", isUser ? "flex-row-reverse" : "flex-row")}>
      <Avatar className="w-8 h-8 mt-1">
        {isUser ? (
          <>
            <AvatarFallback className="bg-chat-user-bg text-chat-user-fg">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </>
        ) : (
          <>
            <AvatarFallback className="bg-accent">
              <Wheat className="w-4 h-4" />
            </AvatarFallback>
          </>
        )}
      </Avatar>

      <Card className={cn("max-w-[80%] px-4 py-3 shadow-chat-bubble transition-all duration-200", isUser ? "bg-chat-user-bg  ml-auto" : "bg-chat-bot-bg")}>
        {message.content || message.isStreaming ? (
          <div className={cn("prose prose-sm dark:prose-invert max-w-none break-words", isUser ? "text-chat-user-fg" : "text-chat-bot-fg")}>
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>{message.content}</ReactMarkdown>
            {message.isStreaming && <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse rounded-sm" />}
          </div>
        ) : null}

        {/* Display generated image */}
        {message.imageUrl && (
          <div className="mt-3">
            <img src={message.imageUrl} alt="Generated image" className="max-w-full h-auto rounded-lg border border-border shadow-lg" style={{ maxHeight: "400px" }} />
          </div>
        )}

        {message.files && message.files.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.files.map(file => (
              <div key={file.id} className="p-2 bg-muted rounded border">
                <div className="text-sm font-medium">{file.name}</div>
                <div className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB • {file.type}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* <div className="text-xs text-gray-500 mt-2">{message.timestamp.toLocaleTimeString()}</div> */}
      </Card>
    </div>
  );
}
