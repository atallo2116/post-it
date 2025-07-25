import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const postSchema = z.object({
  username: z
    .string()
    .min(2, "Username is too short")
    .regex(/^[A-Za-z]+$/, "Username must contain only letters"),
  postText: z.string().min(1, "Post cannot be empty"),
});

type PostFormValues = z.infer<typeof postSchema>;

interface PostFormProps {
  onSubmit: (data: PostFormValues) => void;
  isLoading?: boolean;
}

const PostForm: React.FC<PostFormProps> = ({ onSubmit, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    mode: "onChange",
  });

  const submitHandler = (data: PostFormValues) => {
    onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="post-form">
      <div>
        <input
          {...register("username")}
          placeholder="Username"
          autoComplete="off"
        />
        {errors.username && (
          <span className="error">{errors.username.message}</span>
        )}
      </div>
      <div>
        <textarea
          {...register("postText")}
          placeholder="What's on your mind?"
          rows={3}
        />
        {errors.postText && (
          <span className="error">{errors.postText.message}</span>
        )}
      </div>
      <button type="submit" disabled={isLoading} style={{ marginTop: 8 }}>
        {isLoading ? "Posting..." : "Post"}
      </button>
    </form>
  );
};

export default PostForm;
