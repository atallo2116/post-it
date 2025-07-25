import React from "react";
import type { Post } from "../types";

interface PostItemProps {
  post: Post;
}

const PostItem: React.FC<PostItemProps> = ({ post }) => (
  <div className="post-item">
    <span className="username-text">{post.username}</span>
    <span className="post-text">{post.postText}</span>
  </div>
);

export default PostItem;
