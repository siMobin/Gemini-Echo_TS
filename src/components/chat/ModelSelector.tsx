import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { GEMINI_MODELS, IMAGE_GENERATION_MODEL } from "@/lib/models";

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  isImageGeneration: boolean;
  onImageGenerationChange: (enabled: boolean) => void;
}

export function ModelSelector({ selectedModel, onModelChange, isImageGeneration, onImageGenerationChange }: ModelSelectorProps) {
  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline text-accent-foreground font-semibold">Model:</span>
        <Select value={selectedModel} onValueChange={onModelChange} disabled={isImageGeneration}>
          <SelectTrigger className="w-[140px] sm:w-[200px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {GEMINI_MODELS.filter(model => model !== IMAGE_GENERATION_MODEL).map(model => (
              <SelectItem key={model} value={model}>
                {model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="image-generation" checked={isImageGeneration} onCheckedChange={onImageGenerationChange} />
        <Label htmlFor="image-generation" className="hidden sm:block">
          Image Generation
        </Label>
      </div>
    </div>
  );
}
