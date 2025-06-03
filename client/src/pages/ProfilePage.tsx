import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageUpload } from "@/components/ImageUpload";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { getInitials } from "@/lib/utils";
import { UpdateUserRequest } from "@/types/api";

const profileSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  siteUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  pictureUrl: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [currentImageKey, setCurrentImageKey] = useState<string>("");

  const { data: currentImageUrl } = useQuery({
    queryKey: ['image', currentImageKey || user?.pictureUrl],
    queryFn: () => {
      const key = currentImageKey || user?.pictureUrl;
      return key ? api.getImageUrl(key) : null;
    },
    enabled: !!(currentImageKey || user?.pictureUrl),
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      description: user?.description || "",
      siteUrl: user?.siteUrl || "",
      pictureUrl: user?.pictureUrl || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      if (!user) throw new Error("User not found");
      
      const updateData = {
        ...data,
        pictureUrl: currentImageKey || user.pictureUrl || "",
      };
      
      await api.updateUser(user.id, updateData as UpdateUserRequest);
    },
    onSuccess: () => {
      toast({
        title: t("profile.updated"),
      });
      refreshUser();
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const handleImageUploaded = (imageKey: string) => {
    setCurrentImageKey(imageKey);
  };

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
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t("profile.title")}</h1>
          <p className="text-lg text-muted-foreground">
            Gerencie suas informações pessoais e preferências
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Picture Section */}
          <Card className="lg:col-span-1 h-fit">
            <CardHeader className="text-center pb-6">
              <div className="relative mx-auto mb-4">
                <Avatar className="h-32 w-32 ring-4 ring-primary/10 ring-offset-4 ring-offset-background">
                  <AvatarImage src={currentImageUrl || undefined} alt={user.name} />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-primary/20 to-primary/40">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <i className="fas fa-camera text-primary-foreground text-sm"></i>
                </div>
              </div>
              <CardTitle className="text-xl font-semibold">{user.name}</CardTitle>
              <CardDescription className="text-sm">
                {user.description || "Adicione uma descrição sobre você"}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-muted-foreground">{t("profile.picture")}</Label>
                <ImageUpload
                  onImageUploaded={handleImageUploaded}
                  currentImage={currentImageUrl || undefined}
                  type="user"
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Profile Information Section */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <i className="fas fa-user-edit mr-3 text-primary"></i>
                Informações Pessoais
              </CardTitle>
              <CardDescription>
                Atualize suas informações básicas de perfil
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Name */}
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-sm font-medium flex items-center">
                      <i className="fas fa-user mr-2 text-muted-foreground"></i>
                      {t("profile.name")}
                    </Label>
                    <Input
                      id="name"
                      placeholder="Seu nome completo"
                      className="h-11"
                      {...form.register("name")}
                      disabled={updateProfileMutation.isPending}
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-destructive flex items-center">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Site URL */}
                  <div className="space-y-3">
                    <Label htmlFor="siteUrl" className="text-sm font-medium flex items-center">
                      <i className="fas fa-link mr-2 text-muted-foreground"></i>
                      {t("profile.site_url")}
                    </Label>
                    <Input
                      id="siteUrl"
                      type="url"
                      placeholder="https://seusite.com"
                      className="h-11"
                      {...form.register("siteUrl")}
                      disabled={updateProfileMutation.isPending}
                    />
                    {form.formState.errors.siteUrl && (
                      <p className="text-sm text-destructive flex items-center">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        {form.formState.errors.siteUrl.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <Label htmlFor="description" className="text-sm font-medium flex items-center">
                    <i className="fas fa-align-left mr-2 text-muted-foreground"></i>
                    {t("profile.description")}
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Conte um pouco sobre você, suas experiências e interesses..."
                    rows={4}
                    className="resize-none"
                    {...form.register("description")}
                    disabled={updateProfileMutation.isPending}
                  />
                  <p className="text-xs text-muted-foreground">
                    Esta descrição aparecerá em seus posts e no seu perfil público
                  </p>
                  {form.formState.errors.description && (
                    <p className="text-sm text-destructive flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {form.formState.errors.description.message}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                  <Button 
                    type="submit" 
                    className="flex-1 h-11"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save mr-2"></i>
                        {t("profile.save")}
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    className="sm:w-auto h-11"
                    onClick={() => form.reset()}
                    disabled={updateProfileMutation.isPending}
                  >
                    <i className="fas fa-undo mr-2"></i>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
