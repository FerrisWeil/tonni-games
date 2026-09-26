import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/components/auth-context";
import { ThemeProvider } from "@/components/theme-provider";
import { AccountPage } from "@/pages/account";
import { ConnectionsPage } from "@/pages/connections";
import { HomePage } from "@/pages/home";
import { ThemesPage } from "@/pages/themes";
import { WordlePage } from "@/pages/wordle";
import { WordleBuilderPage } from "@/pages/wordle-builder";
import { WordleCustomPlayPage } from "@/pages/wordle-custom-play";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/sign-in" element={<Navigate to="/account" replace />} />
            <Route path="/themes" element={<ThemesPage />} />
            <Route path="/wordle" element={<WordlePage />} />
            <Route path="/wordle/builder" element={<WordleBuilderPage />} />
            <Route path="/w/:code" element={<WordleCustomPlayPage />} />
            <Route path="/connections" element={<ConnectionsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
