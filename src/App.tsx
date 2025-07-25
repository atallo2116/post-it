import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import PostForm from "./components/PostForm";
import PostList from "./components/PostList";
import SearchForm from "./components/SearchForm";
import type { Post } from "./types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPosts, createPost } from "./api/fetchPosts";
import {
  loadUSE,
  embedTexts,
  embedText,
  cosineSimilarity,
} from "./utils/aiSearch";

const App: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("q") || "";
  const [postEmbeddings, setPostEmbeddings] = useState<number[][]>([]);
  const [modelReady, setModelReady] = useState(false);
  const [aiResults, setAiResults] = useState<Post[]>([]);

  const {
    data: posts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  // Load model and compute embeddings for posts
  useEffect(() => {
    let active = true;
    async function computeEmbeddings() {
      if (posts) {
        setModelReady(false);
        await loadUSE();
        const texts = posts.map((post) => `${post.username}: ${post.postText}`);
        const emb = await embedTexts(texts);
        if (active) {
          setPostEmbeddings(emb);
          setModelReady(true);
        }
      }
    }
    computeEmbeddings();
    return () => {
      active = false;
    };
  }, [posts]);

  // Semantic search effect (AI)
  useEffect(() => {
    let active = true;
    const runSearch = async () => {
      if (posts && modelReady && search.trim()) {
        const searchEmbedding = await embedText(search);
        const similarities = postEmbeddings.map((postEmb) =>
          cosineSimilarity(searchEmbedding, postEmb),
        );
        const topPosts = posts
          .map((post, i) => ({ post, score: similarities[i] }))
          .sort((a, b) => b.score - a.score)
          .filter((item) => item.score > 0.8)
          .map((item) => item.post);
        if (active) setAiResults(topPosts);
      } else if (posts) {
        // fallback to plain text search or show all if empty
        const filtered = search
          ? posts.filter(
              (post) =>
                post.username.toLowerCase().includes(search.toLowerCase()) ||
                post.postText.toLowerCase().includes(search.toLowerCase()),
            )
          : posts;
        if (active) setAiResults(filtered);
      }
    };
    runSearch();
    return () => {
      active = false;
    };
  }, [search, posts, modelReady, postEmbeddings]);

  const handleSubmit = (data: { username: string; postText: string }) => {
    mutation.mutate(data);
  };

  const handleSearchChange = (value: string) => {
    setSearchParams(value ? { q: value } : {});
  };

  return (
    <div className="app-container">
      <h1>Post It 📝</h1>
      <PostForm onSubmit={handleSubmit} isLoading={mutation.isPending} />
      <SearchForm value={search} onChange={handleSearchChange} />
      {!modelReady && search && <p>Loading AI search...</p>}
      {isLoading && <p>Loading...</p>}
      {error && <p className="error">Error: {(error as Error).message}</p>}
      {posts && <PostList posts={aiResults} />}
    </div>
  );
};

export default App;
