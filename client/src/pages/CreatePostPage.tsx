import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUpload } from "@/components/ImageUpload";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const postSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  subTitle: z.string().optional(),
  content: z.string().min(1, "Conteúdo é obrigatório"),
  titleEnglish: z.string().optional(),
  subTitleEnglish: z.string().optional(),
  contentEnglish: z.string().optional(),
  categories: z.array(z.string()).min(1, "Selecione pelo menos uma categoria"),
  tags: z.string().optional(),
  coverImageUrl: z.string().optional(),
});

type PostFormData = z.infer<typeof postSchema>;

export function CreatePostPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentImageKey, setCurrentImageKey] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const tempPostId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: () => api.getCategories(),
  });

  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      subTitle: "",
      content: "",
      titleEnglish: "",
      subTitleEnglish: "",
      contentEnglish: "",
      categories: [],
      tags: "",
      coverImageUrl: "",
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: PostFormData) => {
      const postData = {
        title: data.title,
        subTitle: data.subTitle || "",
        content: data.content,
        titleEnglish: data.titleEnglish || undefined,
        subTitleEnglish: data.subTitleEnglish || undefined,
        contentEnglish: data.contentEnglish || undefined,
        categories: data.categories,
        tags: data.tags ? data.tags.split(",").map(tag => tag.trim()).filter(Boolean) : [],
      };
      
      const postId = await api.createPost(postData);
      console.log("Post created with ID:", postId);
      
      if (uploadedFile && postId) {
        console.log("Uploading image for post:", postId);
        const imageKey = await api.uploadPostImage(uploadedFile, postId);
        console.log("Image uploaded with key:", imageKey);
        
        await api.updatePost(postId, {
          ...postData,
          coverImageUrl: imageKey,
        });
        console.log("Post updated with image");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      
      toast({
        title: t("messages.post_created"),
      });
      setLocation("/admin/posts");
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PostFormData) => {
    createPostMutation.mutate(data);
  };

  const handleImageUploaded = (imageKey: string) => {
    setCurrentImageKey(imageKey);
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const currentCategories = form.getValues("categories");
    if (checked) {
      form.setValue("categories", [...currentCategories, categoryId]);
    } else {
      form.setValue("categories", currentCategories.filter(id => id !== categoryId));
    }
  };

  const watchedContent = form.watch("content");
  const watchedContentEnglish = form.watch("contentEnglish");
  const watchedCategories = form.watch("categories");

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <i className="fas fa-user-slash text-4xl text-muted-foreground mb-4"></i>
          <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
          <p className="text-muted-foreground">
            Você precisa estar logado para acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-12">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3 flex items-center justify-center">
            <i className="fas fa-plus-circle mr-4 text-primary"></i>
            {t("admin.create_post")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Crie conteúdo incrível para compartilhar com sua audiência. Use Markdown para formatação rica.
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <Card className="xl:col-span-1 border-2 border-primary/10 h-fit">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <i className="fas fa-info-circle mr-3 text-primary"></i>
                  Informações Básicas
                </CardTitle>
                <CardDescription>
                  Dados essenciais do seu post
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="title" className="flex items-center text-sm font-medium">
                    <i className="fas fa-heading mr-2 text-muted-foreground"></i>
                    {t("admin.post_title")}
                  </Label>
                  <Input
                    id="title"
                    placeholder="Digite o título do post..."
                    className="h-11"
                    {...form.register("title")}
                    disabled={createPostMutation.isPending}
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-destructive flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="subTitle" className="flex items-center text-sm font-medium">
                    <i className="fas fa-text-width mr-2 text-muted-foreground"></i>
                    {t("admin.post_subtitle")}
                  </Label>
                  <Input
                    id="subTitle"
                    placeholder="Subtítulo ou descrição curta..."
                    className="h-11"
                    {...form.register("subTitle")}
                    disabled={createPostMutation.isPending}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="titleEnglish" className="flex items-center text-sm font-medium">
                    <div className="w-4 h-3 rounded-sm overflow-hidden mr-2">
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
                      </svg>
                    </div>
                    Título em Inglês
                  </Label>
                  <Input
                    id="titleEnglish"
                    placeholder="English title..."
                    className="h-11"
                    {...form.register("titleEnglish")}
                    disabled={createPostMutation.isPending}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="subTitleEnglish" className="flex items-center text-sm font-medium">
                    <div className="w-4 h-3 rounded-sm overflow-hidden mr-2">
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
                      </svg>
                    </div>
                    Subtítulo em Inglês
                  </Label>
                  <Input
                    id="subTitleEnglish"
                    placeholder="English subtitle..."
                    className="h-11"
                    {...form.register("subTitleEnglish")}
                    disabled={createPostMutation.isPending}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center text-sm font-medium">
                    <i className="fas fa-tags mr-2 text-muted-foreground"></i>
                    {t("admin.post_categories")}
                  </Label>
                  <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto p-3 border rounded-lg bg-muted/20">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-3">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={watchedCategories.includes(category.id)}
                          onCheckedChange={(checked) => 
                            handleCategoryChange(category.id, checked as boolean)
                          }
                        />
                        <Label 
                          htmlFor={`category-${category.id}`}
                          className="text-sm font-normal cursor-pointer flex-1"
                        >
                          {category.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {form.formState.errors.categories && (
                    <p className="text-sm text-destructive flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {form.formState.errors.categories.message}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="tags" className="flex items-center text-sm font-medium">
                    <i className="fas fa-hashtag mr-2 text-muted-foreground"></i>
                    {t("admin.post_tags")}
                  </Label>
                  <Input
                    id="tags"
                    placeholder="react, javascript, tutorial (separadas por vírgula)"
                    className="h-11"
                    {...form.register("tags")}
                    disabled={createPostMutation.isPending}
                  />
                  <p className="text-xs text-muted-foreground">
                    Separe as tags com vírgulas
                  </p>
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center text-sm font-medium">
                    <i className="fas fa-image mr-2 text-muted-foreground"></i>
                    {t("admin.post_cover")}
                  </Label>
                  <ImageUpload
                    onImageUploaded={handleImageUploaded}
                    onFileSelected={setUploadedFile}
                    type="post"
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="xl:col-span-2 space-y-6">
              <Card className="border-2 border-green-200 dark:border-green-800">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg">
                    <div className="w-4 h-3 rounded-sm overflow-hidden mr-3">
                      <svg viewBox="0 0 20 14" className="w-full h-full">
                        <rect width="20" height="14" fill="#009B3A"/>
                        <polygon points="10,2 18,7 10,12 2,7" fill="#FEDF00"/>
                        <circle cx="10" cy="7" r="2.5" fill="#002776"/>
                        <path d="M8,6.5 Q10,5.5 12,6.5" stroke="white" strokeWidth="0.3" fill="none"/>
                      </svg>
                    </div>
                    Conteúdo em Português
                  </CardTitle>
                  <CardDescription>
                    Escreva o conteúdo principal do post usando Markdown
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Tabs defaultValue="write" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="write">
                        <i className="fas fa-edit mr-2"></i>
                        Escrever
                      </TabsTrigger>
                      <TabsTrigger value="preview">
                        <i className="fas fa-eye mr-2"></i>
                        {t("admin.preview")}
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="write" className="mt-4">
                      <Textarea
                        id="content"
                        placeholder="Digite o conteúdo do post em Markdown..."
                        rows={20}
                        {...form.register("content")}
                        disabled={createPostMutation.isPending}
                        className="font-mono resize-none"
                      />
                    </TabsContent>
                    
                    <TabsContent value="preview" className="mt-4">
                      <div className="border rounded-lg p-4 min-h-[500px] bg-muted/30">
                        {watchedContent ? (
                          <MarkdownRenderer content={watchedContent} />
                        ) : (
                          <p className="text-muted-foreground italic">
                            Digite o conteúdo na aba "Escrever" para ver a prévia aqui.
                          </p>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                  {form.formState.errors.content && (
                    <p className="text-sm text-destructive flex items-center mt-2">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {form.formState.errors.content.message}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg">
                    <div className="w-4 h-3 rounded-sm overflow-hidden mr-3">
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
                      </svg>
                    </div>
                    Conteúdo em Inglês
                  </CardTitle>
                  <CardDescription>
                    Traduza ou escreva uma versão em inglês (opcional)
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Tabs defaultValue="write-en" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="write-en">
                        <i className="fas fa-edit mr-2"></i>
                        Write
                      </TabsTrigger>
                      <TabsTrigger value="preview-en">
                        <i className="fas fa-eye mr-2"></i>
                        Preview
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="write-en" className="mt-4">
                      <Textarea
                        id="contentEnglish"
                        placeholder="Enter the post content in English using Markdown..."
                        rows={15}
                        {...form.register("contentEnglish")}
                        disabled={createPostMutation.isPending}
                        className="font-mono resize-none"
                      />
                    </TabsContent>
                    
                    <TabsContent value="preview-en" className="mt-4">
                      <div className="border rounded-lg p-4 min-h-[375px] bg-muted/30">
                        {watchedContentEnglish ? (
                          <MarkdownRenderer content={watchedContentEnglish} />
                        ) : (
                          <p className="text-muted-foreground italic">
                            Enter content in the "Write" tab to see preview here.
                          </p>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>

          {watchedCategories.length > 0 && (
            <Card className="border border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Label className="flex items-center text-sm font-medium">
                    <i className="fas fa-check-circle mr-2 text-primary"></i>
                    Categorias Selecionadas:
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {watchedCategories.map((categoryId) => {
                      const category = categories.find(c => c.id === categoryId);
                      return category ? (
                        <Badge key={categoryId} variant="secondary" className="text-sm">
                          <i className="fas fa-tag mr-1"></i>
                          {category.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-2 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/admin/posts")}
                  className="w-full sm:w-auto"
                  disabled={createPostMutation.isPending}
                >
                  <i className="fas fa-times mr-2"></i>
                  {t("admin.cancel")}
                </Button>
                <Button 
                  type="submit"
                  className="w-full sm:w-auto min-w-[150px]"
                  disabled={createPostMutation.isPending}
                >
                  {createPostMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Criando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      {t("admin.save")}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}