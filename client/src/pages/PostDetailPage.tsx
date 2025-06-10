import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { PostCard } from "@/components/PostCard";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { api } from "@/lib/api";
import { formatDate, formatNumber, getInitials } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";

import { useEffect } from "react";

export function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const getPostTitle = (post: any) => {
    return language === 'en' && post?.titleEnglish ? post.titleEnglish : post?.title;
  };

  const getPostSubTitle = (post: any) => {
    return language === 'en' && post?.subTitleEnglish ? post.subTitleEnglish : post?.subTitle;
  };

  const getPostContent = (post: any) => {
    return language === 'en' && post?.contentEnglish ? post.contentEnglish : post?.content;
  };

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['post', id],
    queryFn: () => api.getPost(id!),
    enabled: !!id,
  });

  const { data: coverImageUrl } = useQuery({
    queryKey: ['image', post?.coverImageUrl],
    queryFn: () => post?.coverImageUrl ? api.getImageUrl(post.coverImageUrl) : null,
    enabled: !!post?.coverImageUrl,
  });

  const { data: userImageUrl } = useQuery({
    queryKey: ['image', post?.user.pictureUrl],
    queryFn: () => post?.user.pictureUrl ? api.getImageUrl(post.user.pictureUrl) : null,
    enabled: !!post?.user.pictureUrl,
  });

  const { data: similarPosts } = useQuery({
    queryKey: ['similar-posts', post?.id],
    queryFn: async () => {
      if (!post) return { data: [] };
      
      const categoryIds = Object.keys(post.categories);
      if (categoryIds.length === 0) return { data: [] };
      
      const data = await api.getPosts({
        Page: 1,
        Size: 4,
        Categories: [categoryIds[0]],
        OrderType: 1,
      });
      
      return {
        ...data,
        data: data.data.filter(p => p.id !== post.id).slice(0, 3),
      };
    },
    enabled: !!post,
  });

  useEffect(() => {
    if (post) {
      api.viewPost(post.id).catch(() => {
      });
    }
  }, [post]);

  const handleUpvote = async () => {
    if (!post) return;

    const upvotedPosts = JSON.parse(localStorage.getItem('upvotedPosts') || '[]');
    
    if (upvotedPosts.includes(post.id)) {
      toast({
        title: t("messages.already_upvoted"),
        variant: "destructive",
      });
      return;
    }

    try {
      await api.upvotePost(post.id);
      upvotedPosts.push(post.id);
      localStorage.setItem('upvotedPosts', JSON.stringify(upvotedPosts));
      
      toast({
        title: t("messages.post_upvoted"),
      });
    } catch (error) {
      toast({
        title: "Erro ao curtir post",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const title = post?.title || "TechBlog";
    
    let shareUrl = "";
    
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "copy":
        try {
          await navigator.clipboard.writeText(url);
          toast({
            title: "Link copiado!",
            description: "O link foi copiado para a área de transferência",
          });
          return;
        } catch (error) {
          toast({
            title: "Erro ao copiar",
            description: "Não foi possível copiar o link",
            variant: "destructive",
          });
          return;
        }
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
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

  if (error || !post) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-4xl text-destructive mb-4"></i>
          <h1 className="text-2xl font-bold mb-2">Post não encontrado</h1>
          <p className="text-muted-foreground mb-4">
            O post que você está procurando não existe ou foi removido.
          </p>
          <Button asChild>
            <Link href="/">{t("common.back")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const categories = Object.values(post.categories);

  return (
    <article className="min-h-screen">
      {/* Cover Image Section */}
      {coverImageUrl && (
        <section className="relative">
          <div className="aspect-[16/9] overflow-hidden bg-muted flex items-center justify-center">
            <img
              src={coverImageUrl}
              alt={post.title}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        </section>
      )}

      {/* Post Header Section */}
      <section className="py-8">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            {categories.map((category, index) => (
              <Badge key={index} variant="default">
                {category}
              </Badge>
            ))}
            <span className="text-sm text-muted-foreground">
              {formatDate(post.createdAt)}
            </span>
          </div>
          
          <h1 className="text-4xl font-bold leading-tight md:text-5xl mb-6">
            {getPostTitle(post)}
          </h1>
          
          {getPostSubTitle(post) && (
            <p className="text-xl leading-relaxed text-muted-foreground">
              {getPostSubTitle(post)}
            </p>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Author Info & Actions */}
          <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={userImageUrl || undefined} alt={post.user.name} />
                <AvatarFallback className="text-lg">
                  {getInitials(post.user.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{post.user.name}</h3>
                {post.user.description && (
                  <p className="text-muted-foreground">{post.user.description}</p>
                )}
                {post.user.siteUrl && (
                  <a
                    href={post.user.siteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {post.user.siteUrl}
                  </a>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <i className="fas fa-eye"></i>
                  {formatNumber(post.views)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleUpvote}
                  className="flex items-center gap-1 text-muted-foreground hover:text-destructive"
                >
                  <i className="fas fa-heart"></i>
                  {formatNumber(post.upVotes)}
                </Button>
              </div>
              
              {/* Share Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare("twitter")}
                >
                  <i className="fab fa-twitter"></i>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare("linkedin")}
                >
                  <i className="fab fa-linkedin"></i>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare("facebook")}
                >
                  <i className="fab fa-facebook"></i>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare("copy")}
                >
                  <i className="fas fa-link"></i>
                </Button>
              </div>
            </div>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Post Content */}
          <div className="prose prose-lg max-w-none dark:prose-invert mb-12">
            <MarkdownRenderer content={getPostContent(post)} />
          </div>

          <Separator className="my-12" />

          {/* Similar Posts */}
          {similarPosts?.data && similarPosts.data.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-8">{t("posts.similar")}</h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {similarPosts.data.map((similarPost) => (
                  <PostCard key={similarPost.id} post={similarPost} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </article>
  );
}
