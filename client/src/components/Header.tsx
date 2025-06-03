import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "@/hooks/use-theme";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { getInitials } from "@/lib/utils";
import { api } from "@/lib/api";
import logoWhite from '../assets/images/logo.png';
import logoBlack from '../assets/images/logo_black.png';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Header() {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, setLanguage, t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);

  const currentLogo = theme === 'light' ? logoBlack : logoWhite;

  const { data: userImageUrl } = useQuery({
    queryKey: ['user-image', user?.pictureUrl],
    queryFn: () => user?.pictureUrl ? api.getImageUrl(user.pictureUrl) : null,
    enabled: !!user?.pictureUrl,
  });

  const navigation = [
    { name: t("nav.home"), href: "/" },
    { name: t("nav.posts"), href: "/posts" },
    { name: t("nav.categories"), href: "/categories" },
  ];

  const adminNavigation = isAuthenticated ? [
    { name: t("admin.posts"), href: "/admin/posts" },
    { name: t("admin.categories"), href: "/admin/categories" },
  ] : [];

  const isActiveLink = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-3 cursor-pointer group transition-transform duration-200 hover:scale-105">
          <img src={currentLogo} width="70" height="50" alt="LOGO" className="logo" />
          <span className="text-xl font-bold transition-colors duration-200 group-hover:text-primary">Zava's Tech</span>
        </Link>

        <nav className="hidden items-center space-x-8 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`cursor-pointer transition-all duration-200 hover:scale-105 relative group ${
                isActiveLink(item.href)
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground dark:hover:text-white"
              }`}
            >
              <span className="relative z-10">{item.name}</span>
              <span className={`absolute left-0 -bottom-1 h-0.5 bg-primary transform transition-all duration-300 origin-left ${
                isActiveLink(item.href) ? "w-full scale-x-100" : "w-0 group-hover:w-full"
              }`}></span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-3">
          <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open('https://marccusz.com', '_self')}
                    className="h-9 w-9 p-0 cursor-pointer group transition-all duration-300 hover:bg-primary/10 hover:scale-105"
                  >
                    <i className="fas fa-globe text-sm text-muted-foreground group-hover:text-primary transition-colors duration-200"></i>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("nav.back_to_site")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

          <DropdownMenu onOpenChange={setLanguageDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-3 cursor-pointer group transition-all duration-300 hover:bg-primary/10 hover:scale-105"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-3 rounded-sm flex-shrink-0 overflow-hidden transition-transform duration-200 group-hover:scale-110">
                    {language === "pt" ? (
                      <svg viewBox="0 0 20 14" className="w-full h-full">
                        <rect width="20" height="14" fill="#009B3A"/>
                        <polygon points="10,2 18,7 10,12 2,7" fill="#FEDF00"/>
                        <circle cx="10" cy="7" r="2.5" fill="#002776"/>
                        <path d="M8,6.5 Q10,5.5 12,6.5" stroke="white" strokeWidth="0.3" fill="none"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 20 14" className="w-full h-full">
                        <rect width="20" height="14" fill="#B22234"/>
                        <rect width="20" height="1" y="1" fill="white"/>
                        <rect width="20" height="1" y="3" fill="white"/>
                        <rect width="20" height="1" y="5" fill="white"/>
                        <rect width="20" height="1" y="7" fill="white"/>
                        <rect width="20" height="1" y="9" fill="white"/>
                        <rect width="20" height="1" y="11" fill="white"/>
                        <rect width="20" height="1" y="13" fill="white"/>
                        <rect width="8" height="7" fill="#3C3B6E"/>
                        <g fill="white">
                          <circle cx="1.5" cy="1" r="0.15"/>
                          <circle cx="3" cy="1" r="0.15"/>
                          <circle cx="4.5" cy="1" r="0.15"/>
                          <circle cx="6" cy="1" r="0.15"/>
                          <circle cx="2.25" cy="2" r="0.15"/>
                          <circle cx="3.75" cy="2" r="0.15"/>
                          <circle cx="5.25" cy="2" r="0.15"/>
                        </g>
                      </svg>
                    )}
                  </div>
                  <span className="text-sm font-medium">{language.toUpperCase()}</span>
                  <i className={`fas fa-chevron-down text-xs transition-transform duration-200 ${languageDropdownOpen ? 'rotate-180' : 'rotate-0'}`}></i>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem 
                onClick={() => setLanguage("pt")}
                className="cursor-pointer flex items-center transition-all duration-200 hover:bg-primary/5 hover:scale-[1.02]"
              >
                <div className="w-5 h-3 rounded-sm mr-2 flex-shrink-0 overflow-hidden">
                  <svg viewBox="0 0 20 14" className="w-full h-full">
                    <rect width="20" height="14" fill="#009B3A"/>
                    <polygon points="10,2 18,7 10,12 2,7" fill="#FEDF00"/>
                    <circle cx="10" cy="7" r="2.5" fill="#002776"/>
                    <path d="M8,6.5 Q10,5.5 12,6.5" stroke="white" strokeWidth="0.3" fill="none"/>
                  </svg>
                </div>
                <span>Português</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setLanguage("en")}
                className="cursor-pointer flex items-center transition-all duration-200 hover:bg-primary/5 hover:scale-[1.02]"
              >
                <div className="w-5 h-3 rounded-sm mr-2 flex-shrink-0 overflow-hidden">
                  <svg viewBox="0 0 20 14" className="w-full h-full">
                    <rect width="20" height="14" fill="#B22234"/>
                    <rect width="20" height="1" y="1" fill="white"/>
                    <rect width="20" height="1" y="3" fill="white"/>
                    <rect width="20" height="1" y="5" fill="white"/>
                    <rect width="20" height="1" y="7" fill="white"/>
                    <rect width="20" height="1" y="9" fill="white"/>
                    <rect width="20" height="1" y="11" fill="white"/>
                    <rect width="20" height="1" y="13" fill="white"/>
                    <rect width="8" height="7" fill="#3C3B6E"/>
                    <g fill="white">
                      <circle cx="1.5" cy="1" r="0.15"/>
                      <circle cx="3" cy="1" r="0.15"/>
                      <circle cx="4.5" cy="1" r="0.15"/>
                      <circle cx="6" cy="1" r="0.15"/>
                      <circle cx="2.25" cy="2" r="0.15"/>
                      <circle cx="3.75" cy="2" r="0.15"/>
                      <circle cx="5.25" cy="2" r="0.15"/>
                    </g>
                  </svg>
                </div>
                <span>English</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-9 w-9 p-0 cursor-pointer group transition-all duration-200 hover:bg-primary/10"
          >
            {theme === "dark" ? (
              <i className="fas fa-sun text-sm transition-all duration-300 group-hover:rotate-180 group-hover:text-yellow-500"></i>
            ) : (
              <i className="fas fa-moon text-sm transition-all duration-300 group-hover:rotate-12 group-hover:text-blue-600"></i>
            )}
          </Button>

          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full cursor-pointer group transition-all duration-200 hover:scale-105 hover:shadow-lg">
                  <Avatar className="h-9 w-9 transition-all duration-200 group-hover:ring-2 group-hover:ring-primary group-hover:ring-offset-2">
                    <AvatarImage src={userImageUrl || undefined} alt={user?.name} />
                    <AvatarFallback className="transition-colors duration-200 group-hover:bg-primary/10">
                      {user?.name ? getInitials(user.name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user?.name && <p className="font-medium">{user.name}</p>}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer transition-colors duration-200 hover:bg-primary/10">
                    <i className="fas fa-user mr-2 h-4 w-4"></i>
                    {t("nav.profile")}
                  </Link>
                </DropdownMenuItem>
                {adminNavigation.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href} className="cursor-pointer transition-colors duration-200 hover:bg-primary/10">
                      <i className="fas fa-cog mr-2 h-4 w-4"></i>
                      {item.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer transition-colors duration-200 hover:bg-destructive/10 hover:text-destructive">
                  <i className="fas fa-sign-out-alt mr-2 h-4 w-4"></i>
                  {t("nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="h-10 w-10 p-0 md:hidden cursor-pointer group transition-all duration-200 hover:bg-primary/10 hover:scale-105">
                <i className="fas fa-bars transition-transform duration-200 group-hover:rotate-90"></i>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="mt-6 flex flex-col space-y-4">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-3 py-2 text-base font-medium cursor-pointer transition-all duration-200 hover:text-primary hover:translate-x-2 hover:bg-primary/5 rounded-md ${
                      isActiveLink(item.href)
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                
                {isAuthenticated && (
                  <>
                    <div className="border-t pt-4">
                      <p className="px-3 text-sm font-medium text-muted-foreground">
                        {t("nav.admin")}
                      </p>
                      {adminNavigation.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className="mt-2 block px-3 py-2 text-base font-medium text-muted-foreground cursor-pointer transition-all duration-200 hover:text-primary hover:translate-x-2 hover:bg-primary/5 rounded-md"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
