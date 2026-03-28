import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import PostDetailPage from "./pages/PostDetailPage";
import NewPostPage from "./pages/NewPostPage";
import EditPostPage from "./pages/EditPostPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboard from "./pages/AdminDashboard";
import CentroAcademicoPage from "./pages/CentroAcademicoPage";
import AtleticaPage from "./pages/AtleticaPage";
import BibliotecaPage from "./pages/BibliotecaPage";
import DisciplinaPage from "./pages/DisciplinaPage";
import DisciplinaSlugPage from "./pages/DisciplinaSlugPage";
import CalendarioPage from "./pages/CalendarioPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/biblioteca" element={<BibliotecaPage />} />
              <Route path="/biblioteca/:slug" element={<DisciplinaSlugPage />} />
              <Route path="/disciplina/:id" element={<DisciplinaPage />} />
              <Route path="/calendario" element={<CalendarioPage />} />
              <Route path="/centro-academico" element={<CentroAcademicoPage />} />
              <Route path="/atletica" element={<AtleticaPage />} />
              <Route path="/post/:id" element={<PostDetailPage />} />
              <Route path="/nova-postagem" element={<NewPostPage />} />
              <Route path="/editar-postagem/:id" element={<EditPostPage />} />
              <Route path="/perfil" element={<ProfilePage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/cadastro" element={<SignupPage />} />
              <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
              <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
