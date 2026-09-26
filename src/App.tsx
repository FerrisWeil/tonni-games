import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { ConnectionsPage } from "@/pages/connections";
import { HomePage } from "@/pages/home";
import { WordlePage } from "@/pages/wordle";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/wordle" element={<WordlePage />} />
          <Route path="/connections" element={<ConnectionsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
