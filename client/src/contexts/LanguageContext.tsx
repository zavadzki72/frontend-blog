import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Language = "pt" | "en";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const translations = {
  pt: {
    // Navigation
    "nav.home": "Home",
    "nav.posts": "Posts",
    "nav.categories": "Categorias",
    "nav.about": "Sobre",
    "nav.login": "Entrar",
    "nav.logout": "Sair",
    "nav.profile": "Perfil",
    "nav.admin": "Admin",
    "nav.back_to_site": "Voltar ao Site",
    
    // Homepage
    "home.featured": "Post em Destaque",
    "home.recent_posts": "Posts Recentes",
    "home.recent_posts_subtitle": "Descubra os últimos artigos sobre tecnologia e desenvolvimento",
    "home.categories": "Categorias",
    "home.categories_subtitle": "Explore nossos artigos organizados por área de interesse",
    "home.newsletter": "Mantenha-se Atualizado",
    "home.newsletter_subtitle": "Receba os melhores artigos sobre tecnologia diretamente no seu email",
    "home.newsletter_placeholder": "Seu melhor email",
    "home.newsletter_button": "Inscrever-se",
    "home.newsletter_disclaimer": "Sem spam. Cancele quando quiser.",
    
    // Posts
    "posts.subtitle": "Explore todos os artigos e tutoriais sobre tecnologia",
    "posts.read_more": "Ler Post Completo",
    "posts.views": "visualizações",
    "posts.upvotes": "curtidas",
    "posts.share": "Compartilhar",
    "posts.similar": "Posts Similares",
    "posts.tags": "Tags",
    "posts.category": "Categoria",
    "posts.author": "Autor",
    "posts.published": "Publicado em",
    "posts.found": "posts encontrados",
    "posts.not_found": "Nenhum post encontrado",
    
    // Filters
    "filters.sort": "Ordenar por",
    "filters.sort_recent": "Mais Recentes",
    "filters.sort_views": "Mais Visualizados",
    "filters.sort_votes": "Mais Votados",
    "filters.toggle": "Filtros",
    "filters.filter": "Filtros",
    "filters.active": "Filtros ativos",
    "filters.date_range": "Data de Publicação",
    "filters.search_title": "Buscar no Título",
    "filters.categories": "Categorias",
    "filters.tags": "Tags",
    "filters.authors": "Autores",
    "filters.clear": "Limpar",
    "filters.apply": "Aplicar Filtros",
    "filters.not_found": "Tente ajustar os filtros ou explore outras categorias.",
    
    // Pagination
    "pagination.previous": "Anterior",
    "pagination.next": "Próximo",
    
    // Auth
    "auth.login": "Fazer Login",
    "auth.login_subtitle": "Acesse sua conta para gerenciar conteúdo",
    "auth.email": "Email",
    "auth.password": "Senha",
    "auth.remember_me": "Lembrar-me",
    "auth.forgot_password": "Esqueceu a senha?",
    "auth.no_account": "Não tem uma conta?",
    "auth.register": "Registre-se",
    "auth.login_success": "Login realizado com sucesso!",
    "auth.login_error": "Email ou senha incorretos",
    "auth.logout_success": "Logout realizado com sucesso!",
    
    // Profile
    "profile.title": "Meu Perfil",
    "profile.name": "Nome",
    "profile.description": "Descrição",
    "profile.site_url": "Site/URL",
    "profile.picture": "Foto de Perfil",
    "profile.save": "Salvar Alterações",
    "profile.updated": "Perfil atualizado com sucesso!",
    
    // Admin
    "admin.forbiden": "Acesso Negado",
    "admin.forbidenDescription": "Você precisa estar logado para acessar esta página.",
    "admin.categories": "Gerenciar Categorias",
    "admin.categories_description": "Gerencie as categorias do blog",
    "admin.posts": "Gerenciar Posts",
    "admin.posts_description": "Gerencie todos os posts do blog",
    "admin.create_post": "Criar Post",
    "admin.edit_post": "Editar Post",
    "admin.create_category": "Criar Categoria",
    "admin.edit_category": "Editar Categoria",
    "admin.create_category_description": "Crie uma nova categoria para organizar os posts",
    "admin.edit_category_description": "Altere as informações da categoria",
    "admin.category_name": "Nome da Categoria",
    "admin.category_placeholder": "Ex: Programação, Design...",
    "admin.post_title": "Título do Post",
    "admin.post_subtitle": "Subtítulo",
    "admin.post_content": "Conteúdo",
    "admin.post_cover": "Imagem de Capa",
    "admin.post_categories": "Categorias do Post",
    "admin.post_tags": "Tags do Post",
    "admin.author": "Autor",
    "admin.date": "Data",
    "admin.created_date": "Data de Criação",
    "admin.views": "Visualizações",
    "admin.likes": "Curtidas",
    "admin.status": "Status",
    "admin.actions": "Ações",
    "admin.active": "Ativo",
    "admin.search_posts": "Buscar posts...",
    "admin.save": "Salvar",
    "admin.cancel": "Cancelar",
    "admin.delete": "Excluir",
    "admin.archive": "Arquivar",
    "admin.reactivate": "Reativar",
    "admin.preview": "Visualizar",
    "admin.creating": "Criando...",
    "admin.saving": "Salvando...",
    "admin.confirm_delete": "Confirmar Exclusão",
    "admin.delete_category_confirm": "Tem certeza que deseja excluir a categoria",
    "admin.delete_post_confirm": "Tem certeza que deseja excluir o post",
    "admin.action_irreversible": "Esta ação não pode ser desfeita.",
    "admin.no_categories": "Nenhuma categoria encontrada",
    "admin.create_first_category": "Crie sua primeira categoria para começar a organizar os posts.",
    "admin.archived": "Arquivado",
    
    // Messages
    "messages.loading": "Carregando...",
    "messages.error": "Erro ao carregar dados",
    "messages.no_posts": "Nenhum post encontrado",
    "messages.no_categories": "Nenhuma categoria encontrada",
    "messages.adjust_filters": "Tente ajustar os filtros de busca.",
    "messages.create_first_post": "Crie seu primeiro post para começar.",
    "messages.post_upvoted": "Post curtido com sucesso!",
    "messages.already_upvoted": "Você já curtiu este post",
    "messages.category_created": "Categoria criada com sucesso!",
    "messages.category_updated": "Categoria atualizada com sucesso!",
    "messages.category_deleted": "Categoria excluída com sucesso!",
    "messages.post_created": "Post criado com sucesso!",
    "messages.post_updated": "Post atualizado com sucesso!",
    "messages.post_deleted": "Post excluído com sucesso!",
    "messages.post_archived": "Post arquivado com sucesso!",
    "messages.post_reactivated": "Post reativado com sucesso!",

    // Categories Page
    "categories.not_found": "No Categories avaliable",
    "categories.not_found_description": "No Categories avaliable",
    "categories.title": "Categorias",
    "categories.subtitle": "Explore nossos tópicos e encontre conteúdo específico sobre tecnologia",
    "categories.available": "Categorias Disponíveis",
    "categories.published_posts": "Posts Publicados",
    "categories.posts_per_category": "Posts por Categoria",
    "categories.most_popular": "Categorias Mais Populares",
    "categories.post_singular": "post",
    "categories.post_plural": "posts",
    
    // Footer
    "footer.description": "Compartilhando conhecimento e experiências em tecnologia para desenvolvedores e entusiastas.",
    "footer.navigation": "Navegação",
    "footer.categories": "Categorias",
    "footer.privacy": "Privacidade",
    "footer.terms": "Termos",
    "footer.contact": "Contato",
    "footer.copyright": "© 2025 Zava's Tech. Todos os direitos reservados.",
    
    // Common
    "common.search": "Buscar",
    "common.back": "Voltar",
    "common.close": "Fechar",
    "common.confirm": "Confirmar",
    "common.yes": "Sim",
    "common.no": "Não",
    "common.edit": "Editar",
    "common.delete": "Excluir",
    "common.create": "Criar",
    "common.update": "Atualizar",
    "common.view": "Visualizar",
  },
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.posts": "Posts",
    "nav.categories": "Categories",
    "nav.about": "About",
    "nav.login": "Login",
    "nav.logout": "Logout",
    "nav.profile": "Profile",
    "nav.admin": "Admin",
    "nav.back_to_site": "Back to Site",
    
    // Homepage
    "home.featured": "Featured Post",
    "home.recent_posts": "Recent Posts",
    "home.recent_posts_subtitle": "Discover the latest articles about technology and development",
    "home.categories": "Categories",
    "home.categories_subtitle": "Explore our articles organized by area of interest",
    "home.newsletter": "Stay Updated",
    "home.newsletter_subtitle": "Get the best tech articles delivered directly to your inbox",
    "home.newsletter_placeholder": "Your best email",
    "home.newsletter_button": "Subscribe",
    "home.newsletter_disclaimer": "No spam. Cancel anytime.",
    
    // Posts
    "posts.subtitle": "Explore all articles and tutorials about technology",
    "posts.read_more": "Read Full Post",
    "posts.views": "views",
    "posts.upvotes": "likes",
    "posts.share": "Share",
    "posts.similar": "Similar Posts",
    "posts.tags": "Tags",
    "posts.category": "Category",
    "posts.author": "Author",
    "posts.published": "Published on",
    "posts.found": "posts found",
    "posts.not_found": "no posts found",
    
    // Filters
    "filters.sort": "Sort by",
    "filters.sort_recent": "Most Recent",
    "filters.sort_views": "Most Viewed",
    "filters.sort_votes": "Most Voted",
    "filters.toggle": "Filters",
    "filters.filter": "Filters",
    "filters.active": "Active filters",
    "filters.date_range": "Publication Date",
    "filters.search_title": "Search in Title",
    "filters.categories": "Categories",
    "filters.tags": "Tags",
    "filters.authors": "Authors",
    "filters.clear": "Clear",
    "filters.apply": "Apply Filters",
    "filters.not_found": "Try adjusts filters",
    
    // Pagination
    "pagination.previous": "Previous",
    "pagination.next": "Next",
    
    // Auth
    "auth.login": "Login",
    "auth.login_subtitle": "Access your account to manage content",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.remember_me": "Remember me",
    "auth.forgot_password": "Forgot password?",
    "auth.no_account": "Don't have an account?",
    "auth.register": "Sign up",
    "auth.login_success": "Login successful!",
    "auth.login_error": "Invalid email or password",
    "auth.logout_success": "Logout successful!",
    
    // Profile
    "profile.title": "My Profile",
    "profile.name": "Name",
    "profile.description": "Description",
    "profile.site_url": "Website/URL",
    "profile.picture": "Profile Picture",
    "profile.save": "Save Changes",
    "profile.updated": "Profile updated successfully!",
    
    // Admin
    "admin.forbiden": "Forbiden Access",
    "admin.forbidenDescription": "You dont have access to see this page.",
    "admin.categories": "Manage Categories",
    "admin.categories_description": "Manage blog categories",
    "admin.posts": "Manage Posts",
    "admin.posts_description": "Manage all blog posts",
    "admin.create_post": "Create Post",
    "admin.edit_post": "Edit Post",
    "admin.create_category": "Create Category",
    "admin.edit_category": "Edit Category",
    "admin.create_category_description": "Create a new category to organize posts",
    "admin.edit_category_description": "Change category information",
    "admin.category_name": "Category Name",
    "admin.category_placeholder": "Ex: Programming, Design...",
    "admin.post_title": "Post Title",
    "admin.post_subtitle": "Subtitle",
    "admin.post_content": "Content",
    "admin.post_cover": "Cover Image",
    "admin.post_categories": "Post Categories",
    "admin.post_tags": "Post Tags",
    "admin.author": "Author",
    "admin.date": "Date",
    "admin.created_date": "Created Date",
    "admin.views": "Views",
    "admin.likes": "Likes",
    "admin.status": "Status",
    "admin.actions": "Actions",
    "admin.active": "Active",
    "admin.search_posts": "Search posts...",
    "admin.save": "Save",
    "admin.cancel": "Cancel",
    "admin.delete": "Delete",
    "admin.archive": "Archive",
    "admin.reactivate": "Reactivate",
    "admin.preview": "Preview",
    "admin.creating": "Creating...",
    "admin.saving": "Saving...",
    "admin.confirm_delete": "Confirm Deletion",
    "admin.delete_category_confirm": "Are you sure you want to delete the category",
    "admin.delete_post_confirm": "Are you sure you want to delete the post",
    "admin.action_irreversible": "This action cannot be undone.",
    "admin.no_categories": "No categories found",
    "admin.create_first_category": "Create your first category to start organizing posts.",
    "admin.archived": "Archived",
    
    // Messages
    "messages.loading": "Loading...",
    "messages.error": "Error loading data",
    "messages.no_posts": "No posts found",
    "messages.no_categories": "No categories found",
    "messages.adjust_filters": "Try adjusting the search filters.",
    "messages.create_first_post": "Create your first post to get started.",
    "messages.post_upvoted": "Post liked successfully!",
    "messages.already_upvoted": "You already liked this post",
    "messages.category_created": "Category created successfully!",
    "messages.category_updated": "Category updated successfully!",
    "messages.category_deleted": "Category deleted successfully!",
    "messages.post_created": "Post created successfully!",
    "messages.post_updated": "Post updated successfully!",
    "messages.post_deleted": "Post deleted successfully!",
    "messages.post_archived": "Post archived successfully!",
    "messages.post_reactivated": "Post reactivated successfully!",

    // Categories Page
    "categories.not_found": "No Categories avaliable",
    "categories.not_found_description": "No Categories avaliable",
    "categories.title": "Categories",
    "categories.subtitle": "Explore our topics and find specific content about technology",
    "categories.available": "Available Categories",
    "categories.published_posts": "Published Posts",
    "categories.posts_per_category": "Posts per Category",
    "categories.most_popular": "Most Popular Categories",
    "categories.post_singular": "post",
    "categories.post_plural": "posts",
    
    // Footer
    "footer.description": "Sharing knowledge and experiences in technology for developers and enthusiasts.",
    "footer.navigation": "Navigation",
    "footer.categories": "Categories",
    "footer.privacy": "Privacy",
    "footer.terms": "Terms",
    "footer.contact": "Contact",
    "footer.copyright": "© 2025 Zava's Tech. All rights reserved.",
    
    // Common
    "common.search": "Search",
    "common.back": "Back",
    "common.close": "Close",
    "common.confirm": "Confirm",
    "common.yes": "Yes",
    "common.no": "No",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.create": "Create",
    "common.update": "Update",
    "common.view": "View",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("language") as Language) || "pt";
    }
    return "pt";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguageState(prevLang => prevLang === "pt" ? "en" : "pt");
  };

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
