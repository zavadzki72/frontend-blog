import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PostCard } from "@/components/PostCard";
import { CategoryCard } from "@/components/CategoryCard";
import { FilterPanel } from "@/components/FilterPanel";
import { PaginationControls } from "@/components/PaginationControls";
import { api } from "@/lib/api";
import { PostFilters } from "@/types/api";
import { formatDateShort, formatNumber, getInitials, createPostUrl } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";

export function HomePage() {
  const { t, language } = useLanguage();

  const getPostTitle = (post: any) => {
    return language === 'en' && post?.titleEnglish ? post.titleEnglish : post?.title;
  };

  const getPostSubTitle = (post: any) => {
    return language === 'en' && post?.subTitleEnglish ? post.subTitleEnglish : post?.subTitle;
  };
  const [filters, setFilters] = useState<PostFilters>({
    Page: 1,
    Size: 6,
    Statuses: [1],
    OrderType: 1,
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data: postsData, isLoading: postsLoading, refetch: refetchPosts } = useQuery({
    queryKey: ['posts', filters],
    queryFn: () => api.getPosts(filters),
  });

  const { data: featuredPost, isLoading: featuredLoading } = useQuery({
    queryKey: ['featured-post'],
    queryFn: async () => {
      const data = await api.getPosts({ Page: 1, Size: 1, OrderType: 1 });
      return data.data[0];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: api.getCategories,
  });

  const { data: featuredCoverUrl } = useQuery({
    queryKey: ['image', featuredPost?.coverImageUrl],
    queryFn: () => featuredPost?.coverImageUrl ? api.getImageUrl(featuredPost.coverImageUrl) : null,
    enabled: !!featuredPost?.coverImageUrl,
  });

  const { data: featuredUserImageUrl } = useQuery({
    queryKey: ['image', featuredPost?.user.pictureUrl],
    queryFn: () => featuredPost?.user.pictureUrl ? api.getImageUrl(featuredPost.user.pictureUrl) : null,
    enabled: !!featuredPost?.user.pictureUrl,
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

  if (featuredLoading || postsLoading) {
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
    <div className="min-h-screen">
      {featuredPost && (
        <section className="relative bg-gradient-to-br from-primary/10 to-blue-500/10 py-16">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              <div className="space-y-6">
                <Badge variant="secondary" className="mb-4">
                  {t("home.featured")}
                </Badge>
                
                {Object.values(featuredPost.categories).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {Object.values(featuredPost.categories).map((category, index) => (
                      <Badge key={index} variant="outline">
                        {category}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                  {getPostTitle(featuredPost)}
                </h1>
                
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {getPostSubTitle(featuredPost)}
                </p>

                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={featuredUserImageUrl || undefined} alt={featuredPost.user.name} />
                      <AvatarFallback className="text-xs">
                        {getInitials(featuredPost.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{featuredPost.user.name}</span>
                  </div>
                  <span>•</span>
                  <span>{formatDateShort(featuredPost.createdAt)}</span>
                  <span>•</span>
                  <span>{formatNumber(featuredPost.views)} {t("posts.views")}</span>
                </div>

                {featuredPost.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {featuredPost.tags.slice(0, 4).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <Button asChild size="lg">
                  <Link href={createPostUrl(featuredPost.id, getPostTitle(featuredPost))}>
                    {t("posts.read_more")}
                    <i className="fas fa-arrow-right ml-2"></i>
                  </Link>
                </Button>
              </div>

              <div className="relative">
                {featuredCoverUrl ? (
                  <img
                    src={featuredCoverUrl}
                    alt={featuredPost.title}
                    className="w-full h-auto rounded-xl shadow-2xl"
                  />
                ) : (
                  <div className="flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-muted shadow-2xl">
                    <i className="fas fa-image text-6xl text-muted-foreground"></i>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-xl"></div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col items-start justify-between md:flex-row md:items-center">
            <div>
              <h2 className="text-3xl font-bold mb-2">{t("home.recent_posts")}</h2>
              <p className="text-muted-foreground">{t("home.recent_posts_subtitle")}</p>
            </div>
            
            <div className="mt-6 flex flex-col gap-4 sm:flex-row md:mt-0">
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
                    onUpvote={refetchPosts}
                  />
                ))}
              </div>

              <PaginationControls
                currentPage={postsData.currentPage}
                totalPages={postsData.totalPages}
                totalItems={postsData.totalItems}
                itemsPerPage={postsData.sizePage}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <div className="text-center py-12">
              <i className="fas fa-search text-4xl text-muted-foreground mb-4"></i>
              <p className="text-muted-foreground">{t("messages.no_posts")}</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold mb-4">{t("home.categories")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("home.categories_subtitle")}
            </p>
          </div>

          {categories.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  postCount={category.postQuantity}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <i className="fas fa-folder-open text-4xl text-muted-foreground mb-4"></i>
              <p className="text-muted-foreground">{t("messages.no_categories")}</p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
