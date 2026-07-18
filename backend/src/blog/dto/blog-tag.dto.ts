export type CreateBlogTagDto = {
  name: string;
  slug?: string;
  description?: string;
  color?: string;
  isActive?: boolean;
};

export type UpdateBlogTagDto = Partial<CreateBlogTagDto>;
