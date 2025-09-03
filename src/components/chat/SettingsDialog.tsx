import { useState, useEffect, useRef } from "react";
import { Settings, Sun, Moon, Monitor, Key, FolderInput } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface SettingsDialogProps {
  onLogout: () => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
}

type ThemeMode = "light" | "dark" | "system";

export function SettingsDialog({ onLogout, onExportData, onImportData }: SettingsDialogProps) {
  // Ref for hidden file input
  const importInputRef = useRef<HTMLInputElement>(null);
  // For import file input
  const [importing, setImporting] = useState(false);
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
        <Button variant="outline" size="sm" className="text-black hover:text-black dark:text-white dark:hover:text-white">
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[50vw] sm:w-[40vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings
          </DialogTitle>
          <DialogDescription>Manage your chat preferences and account settings.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* API Key Section */}
          <Card className="bg-accent">
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
              <Button onClick={handleApiKeyUpdate} className="w-full !bg-primary-background text-white hover:opacity-90" size="sm">
                Update API Key
              </Button>
            </CardContent>
          </Card>

          {/* Theme Section */}
          <Card className="bg-accent">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                {getThemeIcon(currentTheme)}
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={currentTheme} onValueChange={value => applyTheme(value as ThemeMode)}>
                  <SelectTrigger id="theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
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

          {/* <Separator /> */}

          {/* Data Export/Import Section */}
          <Card className="bg-accent">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex gap-2 items-center">
                <FolderInput className="w-4 h-4" />
                Import/Export
              </CardTitle>
            </CardHeader>
            <CardContent className="space- flex justify-center items-start gap-4">
              <div className="w-full space-y-2">
                <Label htmlFor="export-data">Export Data</Label>
                <Button onClick={onExportData} className="w-full !bg-primary-background text-white hover:opacity-90" size="sm">
                  Export All Data
                </Button>
              </div>
              <div className="w-full space-y-2">
                <Label htmlFor="import-data" className="">
                  Import Data
                </Label>
                <div className="w-full">
                  <Button type="button" className="w-full flex items-center gap-2 !bg-primary-background text-white hover:opacity-90" size="sm" disabled={importing} onClick={() => importInputRef.current?.click()}>
                    <Upload className="w-4 h-4" />
                    {importing ? "Importing..." : "Import All Data"}
                  </Button>
                  <Input
                    ref={importInputRef}
                    id="import-data"
                    type="file"
                    accept="application/json"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImporting(true);
                        onImportData(file);
                        setTimeout(() => setImporting(false), 1000);
                        // Reset input value so same file can be selected again
                        e.target.value = "";
                      }
                    }}
                    disabled={importing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Account Actions */}
          <div className="space-y-2">
            <Button size="sm" variant="destructive" onClick={onLogout} className="w-full">
              Logout & Clear Data
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
