import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/components/auth-context";
import { ThemeProvider } from "@/components/theme-provider";
import { AccountPage } from "@/pages/account";
import { ConnectionsPage } from "@/pages/connections";
import { HomePage } from "@/pages/home";
import { ThemesPage } from "@/pages/themes";
import { WordlePage } from "@/pages/wordle";

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
            <Route path="/connections" element={<ConnectionsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
