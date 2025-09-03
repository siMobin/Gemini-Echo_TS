import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { KeyRound, ExternalLink, Info, Upload } from "lucide-react";

interface ApiKeySetupProps {
  onApiKeySubmit: (apiKey: string) => void;
  isLoading: boolean;
}

export function ApiKeySetup({ onApiKeySubmit, isLoading }: ApiKeySetupProps) {
  // Ref for hidden file input
  const importInputRef = useRef<HTMLInputElement>(null);
  // Import all user data from JSON file
  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (imported && typeof imported === "object") {
          // Sessions
          if (Array.isArray(imported.sessions)) {
            localStorage.setItem("gemini-chat-sessions", JSON.stringify(imported.sessions));
          }
          // API Key
          if (typeof imported.apiKey === "string") {
            localStorage.setItem("gemini-api-key", imported.apiKey);
            setApiKey(imported.apiKey);
          }
          // Theme
          if (typeof imported.theme === "string") {
            localStorage.setItem("gemini-theme", imported.theme);
          }
          // Memories
          if (typeof imported.memories === "string") {
            localStorage.setItem("gemini-memories", imported.memories);
          }
          // alert("Import successful! Your data has been restored.");
        } else {
          throw new Error("Invalid data format");
        }
      } catch (err: any) {
        alert("Import failed: " + (err.message || "Could not import data."));
      }
    };
    reader.readAsText(file);
  };
  const [apiKey, setApiKey] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onApiKeySubmit(apiKey.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-300/5 ">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-accent rounded-full flex items-center justify-center mb-4">
            <KeyRound className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to the virtual life!</CardTitle>
          <CardDescription>To start chatting, you'll need to provide your Google Gemini API key.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>Your API key is stored locally in your browser and never sent to our servers.</AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input type="password" placeholder="Enter your Gemini API key..." value={apiKey} onChange={e => setApiKey(e.target.value)} className="w-full" disabled={isLoading} />
            </div>

            <Button type="submit" className="w-full !bg-primary-background hover:opacity-90 dark:text-white" disabled={!apiKey.trim() || isLoading}>
              {isLoading ? "Connecting..." : "Start Chatting..."}
            </Button>
          </form>
          <p className=" my-4 text-center w-full italic">or</p>

          <div className="flex flex-col gap-2">
            {/* <label className="block text-sm font-medium mb-1">Or import all your data:</label> */}
            <div className="w-full">
              <Button type="button" className="w-full flex items-center gap-2 !bg-primary-background text-white hover:opacity-90" size="sm" onClick={() => importInputRef.current?.click()}>
                <Upload className="w-4 h-4" />
                Import Data
              </Button>
              <Input
                ref={importInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleImportData(file);
                  // Reset input value so same file can be selected again
                  if (e.target) e.target.value = "";
                }}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <span>Don't have an API key?</span>
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
              Get one here <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-center text-xs">The API key is stored securely in your browser's local storage.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
