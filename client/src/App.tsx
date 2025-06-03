import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import { HomePage } from "@/pages/HomePage";
import { PostsPage } from "@/pages/PostsPage";
import { CategoriesPage } from "@/pages/CategoriesPage";
import { PostDetailPage } from "@/pages/PostDetailPage";
import { CategoryPage } from "@/pages/CategoryPage";
import { LoginPage } from "@/pages/LoginPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { AdminCategoriesPage } from "@/pages/AdminCategoriesPage";
import { AdminPostsPage } from "@/pages/AdminPostsPage";
import { CreatePostPage } from "@/pages/CreatePostPage";
import { EditPostPage } from "@/pages/EditPostPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        {/* Public Routes */}
        <Route path="/" component={HomePage} />
        <Route path="/posts" component={PostsPage} />
        <Route path="/categories" component={CategoriesPage} />
        <Route path="/post/:id/:slug?" component={PostDetailPage} />
        <Route path="/category/:id/:slug?" component={CategoryPage} />
        <Route path="/login" component={LoginPage} />
        
        {/* Protected Routes */}
        <Route path="/profile" component={ProfilePage} />
        
        {/* Admin Routes */}
        <Route path="/admin/categories" component={AdminCategoriesPage} />
        <Route path="/admin/posts" component={AdminPostsPage} />
        <Route path="/admin/posts/create" component={CreatePostPage} />
        <Route path="/admin/posts/edit/:id" component={EditPostPage} />
        
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
