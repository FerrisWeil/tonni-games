import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { ConnectionsPage } from "@/pages/connections";
import { HomePage } from "@/pages/home";
import { ThemesPage } from "@/pages/themes";
import { WordlePage } from "@/pages/wordle";
import { WordleBuilderPage } from "@/pages/wordle-builder";
import { WordleCustomPlayPage } from "@/pages/wordle-custom-play";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/themes" element={<ThemesPage />} />
          <Route path="/wordle" element={<WordlePage />} />
          <Route path="/wordle/builder" element={<WordleBuilderPage />} />
          <Route path="/w/:code" element={<WordleCustomPlayPage />} />
          <Route path="/connections" element={<ConnectionsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
