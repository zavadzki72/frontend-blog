import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ApiPost } from "@/types/api";
import { formatDateShort, formatNumber, getInitials, createPostUrl } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";

interface PostCardProps {
  post: ApiPost;
  onUpvote?: () => void;
}

export function PostCard({ post, onUpvote }: PostCardProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();

  // Use English content when language is "en" and English fields are available
  const getPostTitle = () => {
    return language === 'en' && post.titleEnglish ? post.titleEnglish : post.title;
  };

  const getPostSubTitle = () => {
    return language === 'en' && post.subTitleEnglish ? post.subTitleEnglish : post.subTitle;
  };

  const { data: coverImageUrl } = useQuery({
    queryKey: ['image', post.coverImageUrl],
    queryFn: () => post.coverImageUrl ? api.getImageUrl(post.coverImageUrl) : null,
    enabled: !!post.coverImageUrl,
  });

  const { data: userImageUrl } = useQuery({
    queryKey: ['image', post.user.pictureUrl],
    queryFn: () => post.user.pictureUrl ? api.getImageUrl(post.user.pictureUrl) : null,
    enabled: !!post.user.pictureUrl,
  });

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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
      
      onUpvote?.();
    } catch (error) {
      toast({
        title: "Erro ao curtir post",
        variant: "destructive",
      });
    }
  };

  const handleView = async () => {
    try {
      await api.viewPost(post.id);
    } catch (error) {
      // Silent fail for view tracking
    }
  };

  const categories = Object.values(post.categories);
  const primaryCategory = categories[0];

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg">
      <Link href={createPostUrl(post.id, post.title)} onClick={handleView}>
        <div className="relative aspect-[1200/628] overflow-hidden">
          {coverImageUrl ? (
            <img
              src={coverImageUrl}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <i className="fas fa-image text-4xl text-muted-foreground"></i>
            </div>
          )}
          {primaryCategory && (
            <Badge className="absolute left-4 top-4" variant="secondary">
              {primaryCategory}
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-6">
        <div className="mb-3 flex flex-wrap gap-2">
          {categories.map((category, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {category}
            </Badge>
          ))}
        </div>

        <Link href={createPostUrl(post.id, getPostTitle())} onClick={handleView}>
          <h3 className="mb-2 text-xl font-semibold transition-colors group-hover:text-primary line-clamp-2">
            {getPostTitle()}
          </h3>
        </Link>

        <p className="mb-4 text-muted-foreground line-clamp-3">
          {getPostSubTitle()}
        </p>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={userImageUrl || undefined} alt={post.user.name} />
              <AvatarFallback className="text-xs">
                {getInitials(post.user.name)}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{post.user.name}</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>{formatDateShort(post.createdAt)}</span>
            <div className="flex items-center space-x-3">
              <span className="flex items-center space-x-1">
                <i className="fas fa-eye text-xs"></i>
                <span>{formatNumber(post.views)}</span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUpvote}
                className="h-auto p-0 text-muted-foreground hover:text-destructive"
              >
                <i className="fas fa-heart mr-1 text-xs"></i>
                <span>{formatNumber(post.upVotes)}</span>
              </Button>
            </div>
          </div>
        </div>

        {post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1">
            {post.tags.slice(0, 4).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
