import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PostCard } from "@/components/PostCard";
import { FilterPanel } from "@/components/FilterPanel";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { PostFilters } from "@/types/api";
import { useLanguage } from "@/hooks/use-language";

export function CategoryPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const [filters, setFilters] = useState<PostFilters>({
    Page: 1,
    Size: 12,
    OrderType: 1,
    Categories: id ? [id] : undefined,
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data: category } = useQuery({
    queryKey: ['category', id],
    queryFn: async () => {
      const categories = await api.getCategories();
      return categories.find(cat => cat.id === id);
    },
    enabled: !!id,
  });

  const { data: postsData, isLoading, refetch } = useQuery({
    queryKey: ['category-posts', filters],
    queryFn: () => api.getPosts(filters),
  });

  const handleSortChange = (value: string) => {
    setFilters(prev => ({ ...prev, OrderType: parseInt(value) as 1 | 2 | 3, Page: 1 }));
  };

  const handleFiltersChange = (newFilters: PostFilters) => {
    setFilters({ ...newFilters, Categories: [id!] });
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, Page: newPage }));
  };

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
            {category?.name || "Categoria"}
          </h1>
        </div>

        <div className="mb-8 flex flex-col items-start justify-between md:flex-row md:items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-muted-foreground">
              {postsData?.totalItems || 0} {t("posts.found")}
            </p>
          </div>
          
          <div className="flex flex-col gap-4 sm:flex-row">
            <Select value={filters.OrderType?.toString()} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("filters.sort")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">{t("filters.sort_recent")}</SelectItem>
                <SelectItem value="2">{t("filters.sort_views")}</SelectItem>
                <SelectItem value="3">{t("filters.sort_votes")}</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <i className="fas fa-filter mr-2"></i>
              {t("filters.toggle")}
            </Button>
          </div>
        </div>

        <FilterPanel
          filters={filters}
          onFiltersChange={handleFiltersChange}
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
        />

        {postsData?.data && postsData.data.length > 0 ? (
          <>
            <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {postsData.data.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onUpvote={refetch}
                />
              ))}
            </div>

            {postsData.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(postsData.currentPage - 1)}
                  disabled={postsData.currentPage <= 1}
                >
                  <i className="fas fa-chevron-left mr-2"></i>
                  {t("pagination.previous")}
                </Button>
                
                <div className="flex space-x-2">
                  {Array.from({ length: Math.min(5, postsData.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={page === postsData.currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(postsData.currentPage + 1)}
                  disabled={postsData.currentPage >= postsData.totalPages}
                >
                  {t("pagination.next")}
                  <i className="fas fa-chevron-right ml-2"></i>
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <i className="fas fa-search text-4xl text-muted-foreground mb-4"></i>
            <p className="text-muted-foreground">{t("messages.no_posts")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
