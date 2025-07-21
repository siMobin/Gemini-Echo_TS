import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { KeyRound, ExternalLink, Info } from "lucide-react";

interface ApiKeySetupProps {
  onApiKeySubmit: (apiKey: string) => void;
  isLoading: boolean;
}

export function ApiKeySetup({ onApiKeySubmit, isLoading }: ApiKeySetupProps) {
  const [apiKey, setApiKey] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onApiKeySubmit(apiKey.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center mb-4">
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

            <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90" disabled={!apiKey.trim() || isLoading}>
              {isLoading ? "Connecting..." : "Start Chatting..."}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <span>Don't have an API key?</span>
            <a href="https://ai.google.dev/gemini-api/docs#javascript" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
              Get one here <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-center text-xs">The API key is stored securely in your browser's local storage.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
