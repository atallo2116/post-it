import React from "react";
import type { Post } from "../types";
import PostItem from "./PostItem";

interface PostListProps {
  posts: Post[];
}

const PostList: React.FC<PostListProps> = ({ posts }) => (
  <div className="post-list">
    {posts.map((post) => (
      <PostItem key={post.id} post={post} />
    ))}
  </div>
);

export default PostList;
