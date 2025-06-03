export interface ApiPost {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  subTitle: string;
  content: string;
  titleEnglish?: string;
  subTitleEnglish?: string;
  contentEnglish?: string;
  user: ApiUser;
  coverImageUrl: string;
  categories: Record<string, string>;
  tags: string[];
  views: number;
  upVotes: number;
  isArchived: boolean;
}

export interface ApiUser {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string;
  siteUrl: string;
  pictureUrl: string;
}

export interface ApiCategory {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  postQuantity: number;
}

export interface ApiPostsResponse {
  data: ApiPost[];
  totalItems: number;
  currentPage: number;
  sizePage: number;
  totalPages: number;
  totalItemsPage: number;
}

export interface ApiResponse<T> {
  data: T;
}

export interface PostFilters {
  Page?: number;
  Size?: number;
  MinCreatedAt?: string;
  MaxCreatedAt?: string;
  Titles?: string[];
  UsersId?: string[];
  Categories?: string[];
  Tags?: string[];
  Statuses?: number[];
  OrderType?: 1 | 2 | 3; // 1 = Recents, 2 = MostViews, 3 = MostVoteds
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreatePostRequest {
  title: string;
  subTitle: string;
  content: string;
  titleEnglish?: string;
  subTitleEnglish?: string;
  contentEnglish?: string;
  coverImageUrl?: string;
  categories: string[];
  tags: string[];
}

export interface UpdateUserRequest {
  name: string;
  description: string;
  siteUrl: string;
  pictureUrl?: string;
}

export interface CreateCategoryRequest {
  Name: string;
}

export interface UpdateCategoryRequest {
  Name: string;
}
