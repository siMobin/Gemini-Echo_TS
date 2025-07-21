import { useState } from "react";
import { Settings, Sun, Moon, Monitor, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface SettingsDialogProps {
  onLogout: () => void;
}

type ThemeMode = "light" | "dark" | "system";

export function SettingsDialog({ onLogout }: SettingsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("gemini-theme");
    return (saved as ThemeMode) || "system";
  });
  const { toast } = useToast();

  const applyTheme = (theme: ThemeMode) => {
    const root = document.documentElement;

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.toggle("dark", systemTheme === "dark");
    } else {
      root.classList.toggle("dark", theme === "dark");
    }

    localStorage.setItem("gemini-theme", theme);
    setCurrentTheme(theme);
  };

  const handleApiKeyUpdate = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem("gemini-api-key", apiKey);
    setApiKey("");
    toast({
      title: "Success",
      description: "API key updated successfully",
    });
    setIsOpen(false);
  };

  const getThemeIcon = (theme: ThemeMode) => {
    switch (theme) {
      case "light":
        return <Sun className="w-4 h-4" />;
      case "dark":
        return <Moon className="w-4 h-4" />;
      case "system":
        return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings
          </DialogTitle>
          <DialogDescription>Manage your chat preferences and account settings.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* API Key Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Key className="w-4 h-4" />
                API Key
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">Gemini API Key</Label>
                <Input id="api-key" type="password" placeholder="Enter your Gemini API key" value={apiKey} onChange={e => setApiKey(e.target.value)} />
              </div>
              <Button onClick={handleApiKeyUpdate} className="w-full">
                Update API Key
              </Button>
            </CardContent>
          </Card>

          {/* Theme Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                {getThemeIcon(currentTheme)}
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={currentTheme} onValueChange={applyTheme}>
                  <SelectTrigger id="theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4" />
                        Dark
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        System
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Account Actions */}
          <div className="space-y-2">
            <Button variant="destructive" onClick={onLogout} className="w-full">
              Logout & Clear Data
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
