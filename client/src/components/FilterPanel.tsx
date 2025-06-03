import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PostFilters } from "@/types/api";
import { useLanguage } from "@/hooks/use-language";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

interface FilterPanelProps {
  filters: PostFilters;
  onFiltersChange: (filters: PostFilters) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function FilterPanel({ filters, onFiltersChange, isOpen, onClose }: FilterPanelProps) {
  const { t } = useLanguage();
  const [localFilters, setLocalFilters] = useState<PostFilters>(filters);
  const [startDate, setStartDate] = useState<Date | undefined>(
    filters.MinCreatedAt ? new Date(filters.MinCreatedAt) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    filters.MaxCreatedAt ? new Date(filters.MaxCreatedAt) : undefined
  );

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: api.getCategories,
  });

  if (!isOpen) return null;

  const handleInputChange = (key: keyof PostFilters, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters: PostFilters = {
      Page: 1,
      Size: 6,
      OrderType: 1,
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    onClose();
  };

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Date Range Filter */}
          <div className="space-y-2">
            <Label>{t("filters.date_range")}</Label>
            <div className="space-y-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <i className="fas fa-calendar mr-2"></i>
                    {startDate ? formatDate(startDate.toISOString()) : "Data inicial"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      handleInputChange("MinCreatedAt", date?.toISOString().split('T')[0]);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <i className="fas fa-calendar mr-2"></i>
                    {endDate ? formatDate(endDate.toISOString()) : "Data final"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      setEndDate(date);
                      handleInputChange("MaxCreatedAt", date?.toISOString().split('T')[0]);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Title Search */}
          <div className="space-y-2">
            <Label>{t("filters.search_title")}</Label>
            <Input
              placeholder="Digite palavras-chave..."
              value={localFilters.Titles?.join(", ") || ""}
              onChange={(e) => {
                const titles = e.target.value.split(",").map(t => t.trim()).filter(Boolean);
                handleInputChange("Titles", titles.length > 0 ? titles : undefined);
              }}
            />
          </div>

          {/* Categories Filter */}
          <div className="space-y-2">
            <Label>{t("filters.categories")}</Label>
            <Select
              value={localFilters.Categories?.[0] || ""}
              onValueChange={(value) => handleInputChange("Categories", value ? [value] : undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags Filter */}
          <div className="space-y-2">
            <Label>{t("filters.tags")}</Label>
            <Input
              placeholder="react, javascript, python..."
              value={localFilters.Tags?.join(", ") || ""}
              onChange={(e) => {
                const tags = e.target.value.split(",").map(t => t.trim()).filter(Boolean);
                handleInputChange("Tags", tags.length > 0 ? tags : undefined);
              }}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <Button variant="outline" onClick={handleClearFilters}>
            {t("filters.clear")}
          </Button>
          <Button onClick={handleApplyFilters}>
            {t("filters.apply")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
