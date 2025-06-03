import { useQuery } from "@tanstack/react-query";
import { CategoryCard } from "@/components/CategoryCard";
import { api } from "@/lib/api";
import { useLanguage } from "@/hooks/use-language";

export function CategoriesPage() {
  const { t } = useLanguage();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: api.getCategories,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
          <p className="text-muted-foreground">{t("messages.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">
            {t("categories.title")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("categories.subtitle")}
          </p>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                postCount={category.postQuantity}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <i className="fas fa-folder-open text-6xl text-muted-foreground mb-6"></i>
            <h3 className="text-2xl font-semibold mb-4">{t("categories.not_found")}</h3>
            <p className="text-muted-foreground">
              {t("categories.not_found_description")}
            </p>
          </div>
        )}

        {categories.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8 text-center">{t("categories.most_popular")}</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categories
                .sort((a, b) => b.postQuantity - a.postQuantity)
                .slice(0, 6)
                .map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 bg-card border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div>
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {category.postQuantity} {category.postQuantity === 1 ? t("categories.post_singular") : t("categories.post_plural")}
                      </p>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <i className="fas fa-tag text-primary text-sm"></i>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}