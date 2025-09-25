"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface PickHistory {
  item: string;
  timestamp: Date;
}


// Sample movie star data
const sampleMovieStars = [
  "Tom Hanks",
  "Meryl Streep",
  "Leonardo DiCaprio",
  "Jennifer Lawrence",
  "Denzel Washington",
  "Scarlett Johansson",
  "Brad Pitt",
  "Robert Downey Jr.",
  "Cate Blanchett",
  "Will Smith",
  "Emma Stone",
  "Nicole Kidman",
  "Ryan Gosling",
  "Joaquin Phoenix",
  "Tom Cruise",
];

export default function Home() {
  const [items, setItems] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [history, setHistory] = useState<PickHistory[]>([]);
  const [displayedItem, setDisplayedItem] = useState<string | null>(null);
  const [pickedItems, setPickedItems] = useState<Set<string>>(new Set());

  const loadSampleData = useCallback(() => {
    setItems(sampleMovieStars.join("\n"));
    setSelectedItem(null);
    setDisplayedItem(null);
    setPickedItems(new Set());
    setHistory([]);
  }, []);

  const resetAll = useCallback(() => {
    setItems("");
    setSelectedItem(null);
    setDisplayedItem(null);
    setHistory([]);
    setPickedItems(new Set());
  }, []);

  // Get all items from textarea
  const allItemList = useMemo(() => {
    return items
      .split("\n")
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }, [items]);

  // Get available items (excluding already picked ones)
  const availableItems = useMemo(() => {
    return allItemList.filter(item => !pickedItems.has(item));
  }, [allItemList, pickedItems]);

  const handleRandomPick = useCallback(() => {
    if (allItemList.length === 0) {
      setSelectedItem("Please enter some items first!");
      return;
    }

    if (availableItems.length === 0) {
      setSelectedItem("All items have been picked! Reset to start over.");
      return;
    }

    // Pre-select the final item from available items only
    const finalIndex = Math.floor(Math.random() * availableItems.length);
    const finalItem = availableItems[finalIndex];

    // Start animation
    setIsAnimating(true);

    // Animation parameters
    const accelerationDuration = 500;
    const steadyDuration = 800;
    const decelerationDuration = 1200;
    const totalDuration = accelerationDuration + steadyDuration + decelerationDuration;

    const startTime = Date.now();
    let lastIndex = -1;

    const animate = () => {
      const elapsed = Date.now() - startTime;

      if (elapsed >= totalDuration) {
        // Animation complete
        setDisplayedItem(finalItem);
        setSelectedItem(finalItem);
        setIsAnimating(false);

        // Add to picked items set
        setPickedItems(prev => new Set([...prev, finalItem]));

        // Add to history
        setHistory(prev => [
          { item: finalItem, timestamp: new Date() },
          ...prev
        ]);
        return;
      }

      // Calculate speed based on phase
      let speed: number;
      if (elapsed < accelerationDuration) {
        // Accelerating
        speed = 50 + (elapsed / accelerationDuration) * 30;
      } else if (elapsed < accelerationDuration + steadyDuration) {
        // Steady fast speed
        speed = 80;
      } else {
        // Decelerating
        const decelProgress = (elapsed - accelerationDuration - steadyDuration) / decelerationDuration;
        speed = 80 * (1 - decelProgress * 0.95);
      }

      // Change displayed item based on speed (show all items during animation)
      if (Math.random() * 100 < speed) {
        let newIndex;
        do {
          newIndex = Math.floor(Math.random() * allItemList.length);
        } while (newIndex === lastIndex && allItemList.length > 1);

        lastIndex = newIndex;
        setDisplayedItem(allItemList[newIndex]);
      }

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [allItemList, availableItems]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !isAnimating) {
        e.preventDefault();
        handleRandomPick();
      } else if (e.key === 'Escape' && !isAnimating) {
        e.preventDefault();
        resetAll();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleRandomPick, resetAll, isAnimating]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-b from-background to-muted/50">
      <div className="w-full max-w-2xl">

        <Card className="w-full shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-center gap-3 mb-2">
              <Image
                src="/randompick-logo.svg"
                alt="Random Picker Logo"
                width={40}
                height={40}
                className="dark:filter dark:invert-[0.8]"
              />
              <CardTitle className="text-2xl md:text-3xl">Random Picker</CardTitle>
            </div>
            <CardDescription className="text-center">Enter items (one per line) and click the button to randomly pick one</CardDescription>
            <p className="text-xs text-center text-muted-foreground mt-1">Your data stays private - nothing is saved or tracked</p>
          </CardHeader>

          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter items here, one per line"
              className="min-h-[200px] font-mono"
              value={items}
              onChange={(e) => setItems(e.target.value)}
            />

            {(selectedItem || displayedItem) && (
              <Card className="mt-4 overflow-hidden">
                <CardContent className="p-4">
                  <h3 className="text-center text-lg font-semibold mb-2">
                    {isAnimating ? 'Picking...' : 'Selected Item:'}
                  </h3>
                  <div className={`bg-muted p-4 rounded-md text-center font-medium text-xl break-words shadow-inner transition-all duration-150 ${
                    isAnimating ? 'text-muted-foreground' : 'text-foreground'
                  }`}>
                    {displayedItem || selectedItem}
                  </div>
                </CardContent>
              </Card>
            )}

            {history.length > 0 && !isAnimating && (
              <Card className="mt-4">
                <CardContent className="p-3">
                  <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Pick History (Won&apos;t be picked again):</h3>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {history.map((pick, index) => (
                      <div key={index} className="text-sm flex justify-between items-center py-1 px-2 rounded hover:bg-muted transition-colors">
                        <span className="truncate flex-1">{pick.item}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          #{history.length - index}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button
              onClick={handleRandomPick}
              className="w-full transition-all"
              size="lg"
              disabled={isAnimating || allItemList.length === 0 || availableItems.length === 0}
              title={allItemList.length === 0 ? "Enter items first" : availableItems.length === 0 ? "All items picked! Reset to start over." : "Keyboard shortcut: Ctrl/Cmd + Enter"}
            >
              {isAnimating ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Picking...
                </span>
              ) : allItemList.length === 0 ? (
                <span className="flex items-center gap-2">
                  Pick Random Item
                  <kbd className="hidden sm:inline-flex items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    <span className="text-xs">⌘</span>↵
                  </kbd>
                </span>
              ) : availableItems.length === 0 ? (
                "All Items Picked! 🎉"
              ) : (
                <span className="flex items-center gap-2">
                  Pick Random Item
                  <kbd className="hidden sm:inline-flex items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    <span className="text-xs">⌘</span>↵
                  </kbd>
                </span>
              )}
            </Button>

            <div className="flex gap-3 w-full">
              <Button
                onClick={loadSampleData}
                className="flex-1"
                variant="outline"
                disabled={isAnimating}
              >
                Load Samples
              </Button>

              <Button
                onClick={resetAll}
                className="flex-1"
                variant="outline"
                disabled={isAnimating}
                title="Keyboard shortcut: Escape"
              >
                <span className="flex items-center gap-1">
                  Reset All
                  <kbd className="hidden sm:inline-flex items-center rounded border bg-muted px-1 font-mono text-[9px] font-medium text-muted-foreground">
                    Esc
                  </kbd>
                </span>
              </Button>
            </div>

            <div className="text-xs text-center text-muted-foreground space-y-1">
              <p>💡 Tip: Use <kbd className="px-1 py-0.5 text-[10px] bg-muted rounded">Ctrl/Cmd + Enter</kbd> to pick • <kbd className="px-1 py-0.5 text-[10px] bg-muted rounded">Esc</kbd> to reset</p>
              {allItemList.length > 0 && (
                <p>
                  {availableItems.length} of {allItemList.length} item{allItemList.length !== 1 ? 's' : ''} remaining
                  {pickedItems.size > 0 && ` (${pickedItems.size} picked)`}
                </p>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-6 mb-2 flex items-center gap-1">
        <a
          href="https://github.com/harrywang/randompicker"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center p-1 rounded-full hover:bg-muted transition-colors"
          aria-label="View source on GitHub"
        >
          <Image src="/github.svg" alt="GitHub" width={24} height={24} className="dark:invert" />
        </a>
        <div className="text-sm text-muted-foreground">
          Made by <a
            href="https://harrywang.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors underline underline-offset-2"
          >
            Harry Wang
          </a>
        </div>
      </div>
    </div>
  );
}