export type CreateBlogCategoryDto = {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string | null;
  icon?: string;
  color?: string;
  isActive?: boolean;
};

export type UpdateBlogCategoryDto = Partial<CreateBlogCategoryDto>;
