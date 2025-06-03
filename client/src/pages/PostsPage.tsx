import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PostCard } from "@/components/PostCard";
import { FilterPanel } from "@/components/FilterPanel";
import { PaginationControls } from "@/components/PaginationControls";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { PostFilters } from "@/types/api";
import { useLanguage } from "@/hooks/use-language";

export function PostsPage() {
  const { t } = useLanguage();
  const [filters, setFilters] = useState<PostFilters>({
    Page: 1,
    Size: 6,
    Statuses: [1],
    OrderType: 1,
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data: postsData, isLoading, refetch } = useQuery({
    queryKey: ['posts', filters],
    queryFn: () => api.getPosts(filters),
  });

  const handleSortChange = (value: string) => {
    setFilters(prev => ({ ...prev, OrderType: parseInt(value) as 1 | 2 | 3, Page: 1 }));
  };

  const handleFiltersChange = (newFilters: PostFilters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, Page: newPage }));
  };

  const handleUpvote = async (postId: string) => {
    try {
      await api.upvotePost(postId);
      refetch();
    } catch (error) {
      console.error('Erro ao votar no post:', error);
    }
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
            {t("nav.posts")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("posts.subtitle")}
          </p>
        </div>

        <div className="mb-8 flex flex-col items-start justify-between md:flex-row md:items-center">
          <div className="mb-4 md:mb-0 flex items-center gap-4">
            <p className="text-muted-foreground">
              {postsData?.totalItems || 0} {t("posts.found")}
            </p>
            {(filters.Categories || filters.Tags || filters.Titles || filters.MinCreatedAt || filters.MaxCreatedAt) && (
              <Badge variant="secondary">
                {t("filters.active")}
              </Badge>
            )}
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
              onClick={() => setIsFilterOpen(true)}
              className="gap-2"
            >
              <i className="fas fa-filter"></i>
              {t("filters.filter")}
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
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {postsData.data.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onUpvote={() => handleUpvote(post.id)}
                />
              ))}
            </div>

            <PaginationControls
              currentPage={postsData.currentPage}
              totalPages={postsData.totalPages}
              totalItems={postsData.totalItems}
              itemsPerPage={postsData.sizePage}
              onPageChange={handlePageChange}
              className="mt-12"
            />
          </div>
        ) : (
          <div className="text-center py-16">
            <i className="fas fa-search text-6xl text-muted-foreground mb-6"></i>
            <h3 className="text-2xl font-semibold mb-4">{t("posts.not_found")}</h3>
            <p className="text-muted-foreground mb-8">
              {t("filters.not_found")}
            </p>
            <Button onClick={() => setFilters({ Page: 1, Size: 12, OrderType: 1 })}>
              {t("filters.clear")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}