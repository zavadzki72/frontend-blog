import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { api } from "@/lib/api";
import { createCategoryUrl } from "@/lib/utils";
import logoWhite from '../assets/images/logo.png';
import logoBlack from '../assets/images/logo_black.png';
import { useTheme } from "@/contexts/ThemeContext";

export function Footer() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  const currentLogo = theme === 'light' ? logoBlack : logoWhite;

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: () => api.getCategories(),
  });

  const navigation = [
    { name: t("nav.home"), href: "/" },
    { name: t("nav.posts"), href: "/posts" },
    { name: t("nav.categories"), href: "/categories" },
  ];

  const socialLinks = [
    { name: "GitHub", icon: "fab fa-github", href: "#" },
    { name: "LinkedIn", icon: "fab fa-linkedin", href: "#" },
  ];

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img src={currentLogo} width="70" height="50" alt="LOGO" className="logo" />
              <h3 className="text-xl font-bold">Zava's Tech</h3>
            </div>
            <p className="mb-6 max-w-md text-muted-foreground">
              {t("footer.description")}
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-muted-foreground transition-colors hover:text-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className={`${link.icon} text-xl`}></i>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">{t("footer.navigation")}</h4>
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">{t("footer.categories")}</h4>
            <ul className="space-y-2">
              {categories.slice(0, 5).map((category) => (
                <li key={category.id}>
                  <Link
                    href={createCategoryUrl(category.id, category.name)}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
              {categories.length > 5 && (
                <li>
                  <Link
                    href="/categories"
                    className="text-muted-foreground transition-colors hover:text-primary font-medium"
                  >
                    {t("footer.viewAll")}
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 flex flex-col items-center justify-center md:flex-row">
          <p className="text-sm text-muted-foreground">
            {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
