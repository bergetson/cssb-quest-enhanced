import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import { GameProvider } from "./contexts/GameContext";
import GameShell from "./pages/GameShell";

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <GameProvider>
        <TooltipProvider>
          <Toaster richColors position="top-center" />
          <GameShell />
        </TooltipProvider>
      </GameProvider>
    </ThemeProvider>
  );
}

export default App;
