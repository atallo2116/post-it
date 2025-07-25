import { API_BASE_URL } from "../constants/apiURL";
import type { Post } from "../types";

// Fetch all posts
export const fetchPosts = async (): Promise<Post[]> => {
  const res = await fetch(`${API_BASE_URL}/posts`);
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
};

// Create a new post
export const createPost = async (data: {
  username: string;
  postText: string;
}): Promise<Post> => {
  const res = await fetch(`${API_BASE_URL}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create post");
  return res.json();
};
