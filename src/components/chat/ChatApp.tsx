import { useState, useEffect } from "react";
import { ApiKeySetup } from "./ApiKeySetup";
import { ChatInterface } from "./ChatInterface";
import { initializeGemini, isGeminiInitialized } from "@/lib/gemini";
import { useToast } from "@/hooks/use-toast";

export function ChatApp() {
  const [isSetup, setIsSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if API key is already stored
    const savedApiKey = localStorage.getItem("gemini-api-key");
    if (savedApiKey) {
      initializeGemini(savedApiKey);
      setIsSetup(true);
    }
  }, []);

  const handleApiKeySubmit = async (apiKey: string) => {
    setIsLoading(true);

    try {
      // Test the API key by initializing Gemini
      initializeGemini(apiKey);

      // Store the API key
      localStorage.setItem("gemini-api-key", apiKey);

      setIsSetup(true);
      toast({
        title: "Success!",
        description: "Connected to Gemini AI. ...& is ready to chat!",
      });
    } catch (error: any) {
      toast({
        title: "Invalid API Key",
        description: "Please check your API key and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("gemini-api-key");
    localStorage.removeItem("gemini-chat-sessions");
    setIsSetup(false);
    toast({
      title: "Logged out",
      description: "Your API key has been removed from this device.",
    });
  };

  if (!isSetup) {
    return <ApiKeySetup onApiKeySubmit={handleApiKeySubmit} isLoading={isLoading} />;
  }

  return <ChatInterface onLogout={handleLogout} />;
}
