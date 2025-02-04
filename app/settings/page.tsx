"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Settings, Search, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";

const aiProviders = [
  {
    id: "deepseek",
    name: "DeepSeek", 
    description: "Use DeepSeek's language models deepseek-chat and deepseek-reasoner with reasoning",
    disabled: false
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "Coming soon - o1 and o1-mini reasoning mode not available",
    disabled: true
  },
  {
    id: "openrouter", 
    name: "OpenRouter",
    description: "Coming soon - Access multiple AI models through OpenRouter",
    disabled: true
  }
];

const searchProviders = [
  {
    id: "serper",
    name: "Serper.dev",
    description: "Google Search API via Serper.dev",
    disabled: false
  },
  {
    id: "tavily",
    name: "Tavily", 
    description: "Coming soon",
    disabled: true
  },
  {
    id: "searxng",
    name: "SearXNG",
    description: "Coming soon",
    disabled: true
  }
];

export default function SettingsPage() {
  const [selectedAIProvider, setSelectedAIProvider] = useState("deepseek");
  const [selectedSearchProvider, setSelectedSearchProvider] = useState("serper");
  const [autoExpandSections, setAutoExpandSections] = useState(true);
  const [enableQueryRefinement, setEnableQueryRefinement] = useState(true);
  // Load saved settings on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("rSearch_settings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setSelectedAIProvider(settings.aiProvider);
      setSelectedSearchProvider(settings.searchProvider);
      setAutoExpandSections(settings.autoExpandSections ?? true);
      setEnableQueryRefinement(settings.enableQueryRefinement ?? true);
    }
  }, []);

  // Save settings whenever they change
  useEffect(() => {
    const settings = {
      aiProvider: selectedAIProvider,
      searchProvider: selectedSearchProvider,
      autoExpandSections,
      enableQueryRefinement
    };
    localStorage.setItem("rSearch_settings", JSON.stringify(settings));
  }, [selectedAIProvider, selectedSearchProvider, autoExpandSections, enableQueryRefinement]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl  font-bold text-orange-600">Settings</h1>
          <p className="text-orange-500/60 mt-2 ">Configure your search preferences</p>
        </header>

        <div className="space-y-6">
          <Card className="hover:shadow-lg transition-shadow border-orange-500 hover:border-orange-600">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-orange-500">
                <ChevronDown className="h-4 w-4" />
                <CardTitle className=" text-lg">Display Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-expand" className="text-orange-600">
                  Auto-expand result sections
                  <p className="text-sm text-orange-500/80">
                    Automatically expand refined query, sources, thinking and results sections
                  </p>
                </Label>
                <Switch
                  id="auto-expand"
                  checked={autoExpandSections}
                  onCheckedChange={setAutoExpandSections}
                  className="data-[state=checked]:bg-orange-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="query-refinement" className="text-orange-600">
                  Enable query refinement
                  <p className="text-sm text-orange-500/80">
                    Allow AI to improve your search queries for better results
                  </p>
                </Label>
                <Switch
                  id="query-refinement"
                  checked={enableQueryRefinement}
                  onCheckedChange={setEnableQueryRefinement}
                  className="data-[state=checked]:bg-orange-500"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-orange-500 hover:border-orange-600">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-orange-500">
                <Settings className="h-4 w-4" />
                <CardTitle className=" text-lg">AI Provider</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={selectedAIProvider} 
                onValueChange={setSelectedAIProvider}
                className="space-y-4"
              >
                {aiProviders.map((provider) => (
                  <div key={provider.id} className={`flex items-start space-x-3 p-2 rounded-lg transition-colors ${provider.disabled ? 'opacity-50' : 'hover:bg-orange-50'}`}>
                    <RadioGroupItem 
                      value={provider.id} 
                      id={`ai-${provider.id}`}
                      disabled={provider.disabled}
                      className="mt-1 border-orange-500 text-orange-600 focus:ring-orange-500 data-[state=checked]:bg-orange-500"
                    />
                    <Label 
                      htmlFor={`ai-${provider.id}`}
                      className="grid gap-1.5 leading-none cursor-pointer"
                    >
                      <div className="text-orange-600 font-medium ">
                        {provider.name}
                      </div>
                      <div className="text-sm text-orange-500/80">
                        {provider.description}
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-orange-500 hover:border-orange-600">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-orange-500">
                <Search className="h-4 w-4" />
                <CardTitle className=" text-lg">Search Provider</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={selectedSearchProvider}
                onValueChange={setSelectedSearchProvider}
                className="space-y-4"
              >
                {searchProviders.map((provider) => (
                  <div key={provider.id} className={`flex items-start space-x-3 p-2 rounded-lg transition-colors ${provider.disabled ? 'opacity-50' : 'hover:bg-orange-50'}`}>
                    <RadioGroupItem 
                      value={provider.id} 
                      id={`search-${provider.id}`}
                      disabled={provider.disabled}
                      className="mt-1 border-orange-500 text-orange-600 focus:ring-orange-500 data-[state=checked]:bg-orange-500"
                    />
                    <Label 
                      htmlFor={`search-${provider.id}`}
                      className="grid gap-1.5 leading-none cursor-pointer"
                    >
                      <div className="text-orange-600 font-medium ">
                        {provider.name}
                      </div>
                      <div className="text-sm text-orange-500/80">
                        {provider.description}
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
