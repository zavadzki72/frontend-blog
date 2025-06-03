import { useState } from "react";
import { Link } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PaginationControls } from "@/components/PaginationControls";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { PostFilters } from "@/types/api";
import { formatDate, formatNumber, createPostUrl } from "@/lib/utils";

export function AdminPostsPage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const getPostTitle = (post: any) => {
    return language === 'en' && post?.titleEnglish ? post.titleEnglish : post?.title;
  };

  const getPostSubTitle = (post: any) => {
    return language === 'en' && post?.subTitleEnglish ? post.subTitleEnglish : post?.subTitle;
  };
  const [filters, setFilters] = useState<PostFilters>({
    Page: 1,
    Size: 20,
    Statuses: [1, 2],
    OrderType: 1,
  });
  const [searchTerm, setSearchTerm] = useState("");

  const { data: postsData, isLoading } = useQuery({
    queryKey: ['admin-posts', filters],
    queryFn: () => api.getPosts(filters),
  });

  const archivePostMutation = useMutation({
    mutationFn: api.archivePost,
    onSuccess: () => {
      toast({
        title: t("messages.post_archived"),
      });
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao arquivar post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const reactivatePostMutation = useMutation({
    mutationFn: api.reactivatePost,
    onSuccess: () => {
      toast({
        title: t("messages.post_reactivated"),
      });
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao reativar post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: api.deletePost,
    onSuccess: () => {
      toast({
        title: t("messages.post_deleted"),
      });
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSortChange = (value: string) => {
    setFilters(prev => ({ ...prev, OrderType: parseInt(value) as 1 | 2 | 3, Page: 1 }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({
      ...prev,
      Titles: searchTerm ? [searchTerm] : undefined,
      Page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, Page: newPage }));
  };

  const handleArchive = (postId: string) => {
    archivePostMutation.mutate(postId);
  };

  const handleReactivate = (postId: string) => {
    reactivatePostMutation.mutate(postId);
  };

  const handleDelete = (postId: string) => {
    deletePostMutation.mutate(postId);
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <i className="fas fa-user-slash text-4xl text-muted-foreground mb-4"></i>
          <h1 className="text-2xl font-bold mb-2">{t("admin.forbiden")}</h1>
          <p className="text-muted-foreground">
            {t("admin.forbidenDescription")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">
                  {t("admin.posts")}
                </CardTitle>
                <CardDescription>
                  {t("admin.posts_description")}
                </CardDescription>
              </div>
              
              <Button asChild>
                <Link href="/admin/posts/create">
                  <i className="fas fa-plus mr-2"></i>
                  {t("admin.create_post")}
                </Link>
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <Input
                  placeholder={t("admin.search_posts")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <Button type="submit" variant="outline">
                  <i className="fas fa-search"></i>
                </Button>
              </form>
              
              <div className="flex gap-2">
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
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <i className="fas fa-spinner fa-spin text-2xl text-primary"></i>
              </div>
            ) : postsData?.data && postsData.data.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("admin.post_title")}</TableHead>
                      <TableHead>{t("admin.author")}</TableHead>
                      <TableHead>{t("admin.categories")}</TableHead>
                      <TableHead>{t("admin.date")}</TableHead>
                      <TableHead>{t("admin.views")}</TableHead>
                      <TableHead>{t("admin.likes")}</TableHead>
                      <TableHead>{t("admin.status")}</TableHead>
                      <TableHead className="text-right">{t("admin.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {postsData.data.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium max-w-xs">
                          <div className="truncate">
                            <Link
                              href={createPostUrl(post.id, getPostTitle(post))}
                              className="hover:text-primary transition-colors"
                            >
                              {getPostTitle(post)}
                            </Link>
                          </div>
                          {getPostSubTitle(post) && (
                            <p className="text-sm text-muted-foreground truncate">
                              {getPostSubTitle(post)}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          {post.user.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {Object.values(post.categories).slice(0, 2).map((category, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {category}
                              </Badge>
                            ))}
                            {Object.values(post.categories).length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{Object.values(post.categories).length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDate(post.createdAt)}
                        </TableCell>
                        <TableCell>
                          {formatNumber(post.views)}
                        </TableCell>
                        <TableCell>
                          {formatNumber(post.upVotes)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={post.isArchived ? "secondary" : "default"}>
                            {post.isArchived ? t("admin.archived") : t("admin.active")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <Link href={`/admin/posts/edit/${post.id}`}>
                                <i className="fas fa-edit mr-1"></i>
                                {t("common.edit")}
                              </Link>
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => post.isArchived ? handleReactivate(post.id) : handleArchive(post.id)}
                              disabled={archivePostMutation.isPending || reactivatePostMutation.isPending}
                            >
                              <i className={`fas ${post.isArchived ? 'fa-undo' : 'fa-archive'} mr-1`}></i>
                              {post.isArchived ? t("admin.reactivate") : t("admin.archive")}
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <i className="fas fa-trash mr-1"></i>
                                  {t("common.delete")}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t("admin.confirm_delete")}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t("admin.delete_post_confirm")} "{post.title}"? 
                                    {t("admin.action_irreversible")}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{t("admin.cancel")}</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(post.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    {t("common.delete")}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <PaginationControls
                  currentPage={postsData.currentPage}
                  totalPages={postsData.totalPages}
                  totalItems={postsData.totalItems}
                  itemsPerPage={postsData.sizePage}
                  onPageChange={handlePageChange}
                  className="mt-6"
                />
              </>
            ) : (
              <div className="text-center py-12">
                <i className="fas fa-file-alt text-4xl text-muted-foreground mb-4"></i>
                <h3 className="text-lg font-medium mb-2">{t("messages.no_posts")}</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? t("messages.adjust_filters") : t("messages.create_first_post")}
                </p>
                <Button asChild>
                  <Link href="/admin/posts/create">
                    <i className="fas fa-plus mr-2"></i>
                    {t("admin.create_post")}
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
