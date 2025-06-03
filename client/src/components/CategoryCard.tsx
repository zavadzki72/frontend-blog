import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ApiCategory } from "@/types/api";
import { createCategoryUrl } from "@/lib/utils";

interface CategoryCardProps {
  category: ApiCategory;
  postCount?: number;
}

const categoryIcons: Record<string, string> = {
  "developing": "fas fa-code",
  "programming": "fas fa-code",
  "frontend": "fas fa-laptop-code",
  "backend": "fas fa-server",
  "mobile": "fas fa-mobile-alt",
  "ai": "fas fa-brain",
  "inteligência artificial": "fas fa-brain",
  "machine learning": "fas fa-robot",
  "devops": "fas fa-tools",
  "security": "fas fa-shield-alt",
  "cybersecurity": "fas fa-shield-alt",
  "design": "fas fa-palette",
  "ui/ux": "fas fa-paint-brush",
  "database": "fas fa-database",
  "cloud": "fas fa-cloud",
  "default": "fas fa-folder",
};

const categoryColors: Record<string, string> = {
  "developing": "bg-purple-500/10 text-purple-700 dark:text-purple-300",
  "programming": "bg-purple-500/10 text-purple-700 dark:text-purple-300",
  "frontend": "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  "backend": "bg-green-500/10 text-green-700 dark:text-green-300",
  "mobile": "bg-pink-500/10 text-pink-700 dark:text-pink-300",
  "ai": "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
  "inteligência artificial": "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
  "machine learning": "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  "devops": "bg-red-500/10 text-red-700 dark:text-red-300",
  "security": "bg-red-500/10 text-red-700 dark:text-red-300",
  "cybersecurity": "bg-red-500/10 text-red-700 dark:text-red-300",
  "design": "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  "ui/ux": "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  "database": "bg-teal-500/10 text-teal-700 dark:text-teal-300",
  "cloud": "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  "default": "bg-gray-500/10 text-gray-700 dark:text-gray-300",
};

export function CategoryCard({ category, postCount = 0 }: CategoryCardProps) {
  const categoryKey = category.name.toLowerCase();
  const icon = categoryIcons[categoryKey] || categoryIcons.default;
  const colorClass = categoryColors[categoryKey] || categoryColors.default;

  return (
    <Link href={createCategoryUrl(category.id, category.name)}>
      <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <CardContent className={`p-6 ${colorClass} border border-current/20`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-current/10`}>
              <i className={`${icon} text-2xl`}></i>
            </div>
            <Badge variant="secondary" className="text-xs">
              {postCount} posts
            </Badge>
          </div>
          
          <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
            {category.name}
          </h3>
        </CardContent>
      </Card>
    </Link>
  );
}
