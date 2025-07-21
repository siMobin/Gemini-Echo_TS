import { useState, useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ModelSelector } from "./ModelSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Trash2, MessageSquare, AlertTriangle, Sun } from "lucide-react";
import { ChatMessage as ChatMessageType, ChatSession, ChatError, ChatFile } from "@/types/chat";
import { getGeminiModel } from "@/lib/gemini";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";
import { GEMINI_MODELS, IMAGE_GENERATION_MODEL, isImageGenerationRequest } from "@/lib/models";
import { useToast } from "@/hooks/use-toast";
import { SettingsDialog } from "./SettingsDialog";
import { useMemorization } from "@/hooks/useMemorization";
import logo from "../../images/couple-min.svg";

interface ChatInterfaceProps {
  onLogout: () => void;
}

export function ChatInterface({ onLogout }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ChatError | null>(null);
  const [selectedModel, setSelectedModel] = useState(GEMINI_MODELS[0]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { addMemory, getMemoryContext } = useMemorization();

  // Load sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem("gemini-chat-sessions");
    if (savedSessions) {
      const parsedSessions = JSON.parse(savedSessions).map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }));
      setSessions(parsedSessions);

      if (parsedSessions.length > 0) {
        setCurrentSession(parsedSessions[0].id);
        setMessages(parsedSessions[0].messages);
      }
    }
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem("gemini-chat-sessions", JSON.stringify(sessions));
    }
  }, [sessions]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Math.random().toString(36).substr(2, 9),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setSessions(prev => [newSession, ...prev]);
    setCurrentSession(newSession.id);
    setMessages([]);
    setError(null);
  };

  const switchSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(sessionId);
      setMessages(session.messages);
      setError(null);
    }
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSession === sessionId) {
      const remainingSessions = sessions.filter(s => s.id !== sessionId);
      if (remainingSessions.length > 0) {
        setCurrentSession(remainingSessions[0].id);
        setMessages(remainingSessions[0].messages);
      } else {
        setCurrentSession(null);
        setMessages([]);
      }
    }
  };

  const clearAllSessions = () => {
    setSessions([]);
    setCurrentSession(null);
    setMessages([]);
    localStorage.removeItem("gemini-chat-sessions");
  };

  const updateSession = (sessionId: string, newMessages: ChatMessageType[]) => {
    setSessions(prev =>
      prev.map(session =>
        session.id === sessionId
          ? {
              ...session,
              messages: newMessages,
              updatedAt: new Date(),
              title: newMessages.length > 0 ? newMessages[0].content.slice(0, 30) + (newMessages[0].content.length > 30 ? "..." : "") : "New Chat",
            }
          : session
      )
    );
  };

  const processFileForGemini = (file: ChatFile) => {
    // Convert base64 data to proper format for Gemini
    const base64Data = file.data.split(",")[1]; // Remove data:type;base64, prefix

    return {
      inlineData: {
        data: base64Data,
        mimeType: file.mimeType,
      },
    };
  };

  const sendMessage = async (content: string, files?: ChatFile[]) => {
    if (!currentSession && sessions.length === 0) {
      createNewSession();
      return;
    }

    const userMessage: ChatMessageType = {
      id: Math.random().toString(36).substr(2, 9),
      content,
      role: "user",
      timestamp: new Date(),
      files,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);
    setError(null);

    try {
      // Detect if this is an image generation request
      const shouldGenerateImage = isImageGenerationRequest(content);
      const modelToUse = shouldGenerateImage ? IMAGE_GENERATION_MODEL : selectedModel;

      console.log("Image generation check:", {
        content,
        shouldGenerateImage,
        modelToUse,
        IMAGE_GENERATION_MODEL,
      });

      const { genAI, model, config } = getGeminiModel(modelToUse);

      // Prepare the conversation history
      const history = newMessages.slice(0, -1).map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

      // Prepare message parts
      const parts: any[] = [{ text: content }];

      // Add files if present
      if (files && files.length > 0) {
        files.forEach(file => {
          parts.push(processFileForGemini(file));
        });
      }

      // Create streaming assistant message
      const assistantMessage: ChatMessageType = {
        id: Math.random().toString(36).substr(2, 9),
        content: "",
        role: "assistant",
        timestamp: new Date(),
        isStreaming: true,
      };

      const messagesWithStreaming = [...newMessages, assistantMessage];
      setMessages(messagesWithStreaming);

      // Get memory context for enhanced responses
      const memoryContext = getMemoryContext();
      const enhancedSystemPrompt = SYSTEM_PROMPT + memoryContext;

      // Prepare contents for the new API
      const contents = [{ role: "user", parts: [{ text: enhancedSystemPrompt }] }, { role: "model", parts: [{ text: "Hello there! I'm Gemini, and I'm so excited for you! What brings you to visit today?" }] }, ...history, { role: "user", parts }];

      // Generate content stream using new API
      const response = await genAI.models.generateContentStream({
        model,
        config,
        contents,
      });

      let fullResponse = "";
      let generatedImageUrl = "";

      for await (const chunk of response) {
        // Handle image generation
        if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
          const inlineData = chunk.candidates[0].content.parts[0].inlineData;
          if (inlineData.data && inlineData.mimeType) {
            // Convert base64 to blob URL for display
            const byteCharacters = atob(inlineData.data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: inlineData.mimeType });
            generatedImageUrl = URL.createObjectURL(blob);

            // Update message with image
            setMessages(prev => prev.map(msg => (msg.id === assistantMessage.id ? { ...msg, content: "I generated an image for you!", imageUrl: generatedImageUrl } : msg)));
          }
        }
        // Handle text response
        else {
          const chunkText = chunk.text;
          if (chunkText) {
            fullResponse += chunkText;

            setMessages(prev => prev.map(msg => (msg.id === assistantMessage.id ? { ...msg, content: fullResponse } : msg)));
          }
        }
      }

      // Finalize the message
      const finalContent = shouldGenerateImage && generatedImageUrl ? "I generated an image for you!" : fullResponse;
      const finalMessages = messagesWithStreaming.map(msg =>
        msg.id === assistantMessage.id
          ? {
              ...msg,
              content: finalContent,
              isStreaming: false,
              imageUrl: generatedImageUrl || undefined,
            }
          : msg
      );

      setMessages(finalMessages);

      // Extract and store important information for memory
      if (fullResponse) {
        // Simple heuristic to identify important information
        const userMessageLower = content.toLowerCase();
        const botResponseLower = fullResponse.toLowerCase();

        // Check for personal information, preferences, or important facts
        if (userMessageLower.includes("my name is") || userMessageLower.includes("i am") || userMessageLower.includes("i like") || userMessageLower.includes("i prefer") || userMessageLower.includes("remember") || userMessageLower.includes("important")) {
          addMemory({
            content: `User mentioned: ${content}`,
            type: "preference",
            importance: 7,
            tags: ["user-info", "preference"],
          });
        }

        // Store interesting facts or context from bot responses
        if (botResponseLower.includes("remember") || botResponseLower.includes("important") || fullResponse.length > 200) {
          addMemory({
            content: `Context: ${fullResponse.slice(0, 150)}...`,
            type: "context",
            importance: 5,
            tags: ["conversation", "context"],
          });
        }
      }

      // Update session
      if (currentSession) {
        updateSession(currentSession, finalMessages);
      }
    } catch (err: any) {
      const errorMessage: ChatError = {
        message: err.message || "Failed to send message",
        type: "api",
        timestamp: new Date(),
      };
      setError(errorMessage);

      toast({
        title: "Error",
        description: errorMessage.message,
        variant: "destructive",
      });

      // Remove the streaming message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-background flex">
      {/* Sidebar */}
      <div className="w-80 bg-card border-r border-border flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center gap-2">
            <div className="size-8 overflow-hidden bg-gradient-accent rounded-full flex items-center justify-center">
              <img src={logo} alt="Couple Icon" className="size-20 text-primary invert dark:invert-0" />
            </div>
            Gemini
          </CardTitle>
          <div className="flex gap-2">
            <Button onClick={createNewSession} className="flex-1 bg-gradient-primary hover:opacity-90" size="sm">
              <MessageSquare className="w-4 h-4 mr-2" />
              New Chat
            </Button>
            <SettingsDialog onLogout={onLogout} />
          </div>
        </CardHeader>

        <Separator />

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {sessions.map(session => (
              <Card key={session.id} className={`cursor-pointer transition-colors hover:bg-accent/50 ${currentSession === session.id ? "bg-accent" : ""}`} onClick={() => switchSession(session.id)}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{session.title}</h4>
                      <p className="text-xs text-muted-foreground">{session.updatedAt.toLocaleDateString()}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      onClick={e => {
                        e.stopPropagation();
                        deleteSession(session.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {sessions.length > 0 && (
          <>
            <Separator />
            <div className="p-4">
              <Button variant="outline" size="sm" onClick={clearAllSessions} className="w-full text-destructive hover:bg-destructive hover:text-destructive-foreground">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Chats
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-card border-b border-border p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 overflow-hidden bg-gradient-accent rounded-full flex items-center justify-center">
                <img src={logo} alt="Couple Icon" className="size-30 text-primary invert dark:invert-0" />
              </div>
              <div>
                <h2 className="font-semibold">Gemini😍</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Sun className="w-3 h-3" />
                  The Virtual partner!
                </p>
              </div>
            </div>
            <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <Card className="text-center p-8 max-w-md">
                <div className="size-20 overflow-hidden bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <img src={logo} alt="Couple Icon" className="size-30 text-primary invert dark:invert-0" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Hay!</h3>
                {/* TODO: Add a description */}
                <p className="text-muted-foreground mb-4">Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque ab quia deserunt magnam blanditiis dolorem, consectetur quo iusto minus asperiores molestiae, quibusdam quisquam nobis nisi impedit, quas vero sint incidunt!</p>
                <p className="text-sm text-muted-foreground">You can even share images, videos, or documents with me!</p>
              </Card>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map(message => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Error Display */}
        {error && (
          <div className="px-4 py-2">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 flex-shrink-0">
          <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
