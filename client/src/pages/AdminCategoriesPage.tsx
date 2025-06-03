import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { ApiCategory } from "@/types/api";
import { formatDate } from "@/lib/utils";

const categorySchema = z.object({
  Name: z.string().min(1, "Category name is required"),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export function AdminCategoriesPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [editingCategory, setEditingCategory] = useState<ApiCategory | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: api.getCategories,
  });

  const createForm = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      Name: "",
    },
  });

  const editForm = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      Name: "",
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: api.createCategory,
    onSuccess: () => {
      toast({
        title: t("messages.category_created"),
      });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setIsCreateDialogOpen(false);
      createForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar categoria",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryFormData }) =>
      api.updateCategory(id, data),
    onSuccess: () => {
      toast({
        title: t("messages.category_updated"),
      });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setIsEditDialogOpen(false);
      setEditingCategory(null);
      editForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar categoria",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: api.deleteCategory,
    onSuccess: () => {
      toast({
        title: t("messages.category_deleted"),
      });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir categoria",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onCreateSubmit = (data: CategoryFormData) => {
    createCategoryMutation.mutate(data);
  };

  const onEditSubmit = (data: CategoryFormData) => {
    if (!editingCategory) return;
    updateCategoryMutation.mutate({ id: editingCategory.id, data });
  };

  const handleEdit = (category: ApiCategory) => {
    setEditingCategory(category);
    editForm.setValue("Name", category.name);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (categoryId: string) => {
    deleteCategoryMutation.mutate(categoryId);
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
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">
                  {t("admin.categories")}
                </CardTitle>
                <CardDescription>
                  {t("admin.categories_description")}
                </CardDescription>
              </div>
              
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <i className="fas fa-plus mr-2"></i>
                    {t("admin.create_category")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("admin.create_category")}</DialogTitle>
                    <DialogDescription>
                      {t("admin.create_category_description")}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={createForm.handleSubmit(onCreateSubmit)}>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="create-name">{t("admin.category_name")}</Label>
                        <Input
                          id="create-name"
                          placeholder={t("admin.category_placeholder")}
                          {...createForm.register("Name")}
                          disabled={createCategoryMutation.isPending}
                        />
                        {createForm.formState.errors.Name && (
                          <p className="text-sm text-destructive">
                            {createForm.formState.errors.Name.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        {t("admin.cancel")}
                      </Button>
                      <Button 
                        type="submit"
                        disabled={createCategoryMutation.isPending}
                      >
                        {createCategoryMutation.isPending ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            {t("admin.creating")}
                          </>
                        ) : (
                          t("admin.save")
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <i className="fas fa-spinner fa-spin text-2xl text-primary"></i>
              </div>
            ) : categories.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("admin.category_name")}</TableHead>
                    <TableHead>{t("admin.created_date")}</TableHead>
                    <TableHead className="text-right">{t("admin.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        {category.name}
                      </TableCell>
                      <TableCell>
                        {formatDate(category.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(category)}
                          >
                            <i className="fas fa-edit mr-1"></i>
                            {t("common.edit")}
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
                                  {t("admin.delete_category_confirm")} "{category.name}"? 
                                  {t("admin.action_irreversible")}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t("admin.cancel")}</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(category.id)}
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
            ) : (
              <div className="text-center py-12">
                <i className="fas fa-folder-open text-4xl text-muted-foreground mb-4"></i>
                <h3 className="text-lg font-medium mb-2">{t("admin.no_categories")}</h3>
                <p className="text-muted-foreground mb-4">
                  {t("admin.create_first_category")}
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <i className="fas fa-plus mr-2"></i>
                  {t("admin.create_category")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("admin.edit_category")}</DialogTitle>
              <DialogDescription>
                {t("admin.edit_category_description")}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={editForm.handleSubmit(onEditSubmit)}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">{t("admin.category_name")}</Label>
                  <Input
                    id="edit-name"
                    placeholder={t("admin.category_placeholder")}
                    {...editForm.register("Name")}
                    disabled={updateCategoryMutation.isPending}
                  />
                  {editForm.formState.errors.Name && (
                    <p className="text-sm text-destructive">
                      {editForm.formState.errors.Name.message}
                    </p>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  {t("admin.cancel")}
                </Button>
                <Button 
                  type="submit"
                  disabled={updateCategoryMutation.isPending}
                >
                  {updateCategoryMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      {t("admin.saving")}
                    </>
                  ) : (
                    t("admin.save")
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
