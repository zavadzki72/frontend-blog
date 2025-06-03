import { queryClient } from "./queryClient";
import { 
  ApiPost, 
  ApiUser, 
  ApiCategory, 
  ApiPostsResponse, 
  ApiResponse, 
  PostFilters,
  LoginRequest,
  CreatePostRequest,
  UpdateUserRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest
} from "@/types/api";

const API_BASE = "https://backend-blog-8uqk.onrender.com/api";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("authToken");
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(response.status, errorText || response.statusText);
  }

  return response;
}

export const api = {
  // Posts
  async getPosts(filters: PostFilters = {}): Promise<ApiPostsResponse> {
    const params = new URLSearchParams();
    
    if (filters.Page) params.append("Page", filters.Page.toString());
    if (filters.Size) params.append("Size", filters.Size.toString());
    if (filters.Statuses) filters.Statuses.forEach(status => params.append("Statuses", status.toString()));
    if (filters.MinCreatedAt) params.append("MinCreatedAt", filters.MinCreatedAt);
    if (filters.MaxCreatedAt) params.append("MaxCreatedAt", filters.MaxCreatedAt);
    if (filters.Titles) filters.Titles.forEach(title => params.append("Titles", title));
    if (filters.UsersId) filters.UsersId.forEach(id => params.append("UsersId", id));
    if (filters.Categories) filters.Categories.forEach(cat => params.append("Categories", cat));
    if (filters.Tags) filters.Tags.forEach(tag => params.append("Tags", tag));
    if (filters.OrderType) params.append("OrderType", filters.OrderType.toString());

    const url = `${API_BASE}/Post${params.toString() ? `?${params}` : ""}`;
    const response = await fetchWithAuth(url);
    const data: ApiResponse<ApiPostsResponse> = await response.json();
    return data.data;
  },

  async getPost(id: string): Promise<ApiPost> {
    const response = await fetchWithAuth(`${API_BASE}/Post/${id}`);
    const data: ApiResponse<ApiPost> = await response.json();
    return data.data;
  },

  async createPost(post: CreatePostRequest): Promise<string> {
    const response = await fetchWithAuth(`${API_BASE}/Post`, {
      method: "POST",
      body: JSON.stringify(post),
    });
    
    const responseText = await response.text();
    console.log("Create post response:", responseText);
    
    try {
      const data = JSON.parse(responseText);
      console.log("Parsed response:", data);
      
      // Tentar diferentes formatos de resposta
      if (data.Data) {
        return data.Data;
      } else if (data.data) {
        return data.data;
      } else if (typeof data === 'string') {
        return data;
      } else if (data.id) {
        return data.id;
      }
      
      throw new Error("ID not found in response");
    } catch (error) {
      console.error("Failed to parse response:", responseText);
      throw new ApiError(response.status, "Invalid response format");
    }
  },

  async updatePost(id: string, post: CreatePostRequest): Promise<void> {
    await fetchWithAuth(`${API_BASE}/Post/${id}`, {
      method: "PUT",
      body: JSON.stringify(post),
    });
  },

  async archivePost(id: string): Promise<void> {
    await fetchWithAuth(`${API_BASE}/Post/archive?id=${id}`, {
      method: "PATCH",
    });
  },

  async reactivatePost(id: string): Promise<void> {
    await fetchWithAuth(`${API_BASE}/Post/reactivate?id=${id}`, {
      method: "PATCH",
    });
  },

  async deletePost(id: string): Promise<void> {
    await fetchWithAuth(`${API_BASE}/Post/${id}`, {
      method: "DELETE",
    });
  },

  async upvotePost(id: string): Promise<void> {
    await fetchWithAuth(`${API_BASE}/Post/up-vote?id=${id}`, {
      method: "PATCH",
    });
  },

  async viewPost(id: string): Promise<void> {
    await fetchWithAuth(`${API_BASE}/Post/view?id=${id}`, {
      method: "PATCH",
    });
  },

  // Categories
  async getCategories(): Promise<ApiCategory[]> {
    const response = await fetchWithAuth(`${API_BASE}/Category`);
    const data: ApiResponse<ApiCategory[]> = await response.json();
    return data.data;
  },

  async createCategory(category: CreateCategoryRequest): Promise<void> {
    await fetchWithAuth(`${API_BASE}/Category`, {
      method: "POST",
      body: JSON.stringify(category),
    });
  },

  async updateCategory(id: string, category: UpdateCategoryRequest): Promise<void> {
    await fetchWithAuth(`${API_BASE}/Category/${id}`, {
      method: "PUT",
      body: JSON.stringify(category),
    });
  },

  async deleteCategory(id: string): Promise<void> {
    await fetchWithAuth(`${API_BASE}/Category/${id}`, {
      method: "DELETE",
    });
  },

  // Auth
  async login(credentials: LoginRequest): Promise<string> {
    const response = await fetch(`${API_BASE}/User/get-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new ApiError(response.status, "Invalid credentials");
    }

    const data: ApiResponse<string> = await response.json();
    return data.data;
  },

  async getUser(): Promise<ApiUser> {
    const response = await fetchWithAuth(`${API_BASE}/User`);
    const data: ApiResponse<ApiUser[]> = await response.json();
    return data.data[0]; // A API retorna um array, pegamos o primeiro elemento
  },

  async updateUser(id: string, user: UpdateUserRequest): Promise<void> {
    await fetchWithAuth(`${API_BASE}/User/${id}`, {
      method: "PUT",
      body: JSON.stringify(user),
    });
  },

  // Files
  async getImageUrl(key: string): Promise<string> {
    const response = await fetchWithAuth(`${API_BASE}/File/access-url?key=${key}`);
    const data: ApiResponse<string> = await response.json();
    return data.data;
  },

  async uploadUserImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("authToken");
    const response = await fetch(`${API_BASE}/File/upload/user-files`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new ApiError(response.status, "Failed to upload user image");
    }

    const data: ApiResponse<string> = await response.json();
    return data.data;
  },

  async uploadPostImage(file: File, postId: string): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("PostId", postId); // Mudança: usar "PostId" com P maiúsculo

    const token = localStorage.getItem("authToken");
    const response = await fetch(`${API_BASE}/File/upload/post-files`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Upload error response:", errorText);
      throw new ApiError(response.status, errorText || "Failed to upload post image");
    }

    const data: ApiResponse<string> = await response.json();
    return data.data;
  },
};

export { ApiError };