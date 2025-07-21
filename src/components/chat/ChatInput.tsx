import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send, Paperclip, X } from "lucide-react";
import { ChatFile } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";

interface ChatInputProps {
  onSendMessage: (content: string, files?: ChatFile[]) => void;
  isLoading: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<ChatFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!input.trim() && files.length === 0) return;

    onSendMessage(input.trim(), files);
    setInput("");
    setFiles([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    selectedFiles.forEach(file => {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB`,
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result as string;
        const newFile: ChatFile = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          data: base64Data,
          mimeType: file.type,
        };

        setFiles(prev => [...prev, newFile]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  return (
    <Card className="p-4 bg-chat-input-bg border-border">
      {files.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {files.map(file => (
            <div key={file.id} className="flex items-center gap-2 bg-secondary px-3 py-1 rounded-md text-sm">
              <span className="truncate max-w-32">{file.name}</span>
              <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground" onClick={() => removeFile(file.id)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Textarea value={input} onChange={e => setInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="Try something extraordinary!" className="min-h-[60px] max-h-32 resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0" disabled={isLoading} />
        </div>

        <div className="flex gap-1">
          <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt" className="hidden" />

          <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="h-10 w-10 p-0">
            <Paperclip className="h-4 w-4" />
          </Button>

          <Button onClick={handleSubmit} disabled={isLoading || (!input.trim() && files.length === 0)} className="h-10 w-10 p-0 bg-gradient-primary hover:opacity-90">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
