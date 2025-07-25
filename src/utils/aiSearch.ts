import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import * as use from "@tensorflow-models/universal-sentence-encoder";

// Typed model instance
let model: use.UniversalSentenceEncoder | null = null;
let backendReady = false;

// Ensure WebGL backend is ready
async function ensureBackend(): Promise<void> {
  if (!backendReady) {
    await tf.setBackend("webgl");
    await tf.ready();
    backendReady = true;
  }
}

// Load and cache the USE model
export async function loadUSE(): Promise<use.UniversalSentenceEncoder> {
  await ensureBackend();
  if (!model) {
    model = await use.load();
  }
  return model;
}

// Embed multiple texts, returning an array of vectors
export async function embedTexts(texts: string[]): Promise<number[][]> {
  const model = await loadUSE();
  const embeddings = await model.embed(texts);
  return embeddings.arraySync() as number[][];
}

// Embed a single text, returning a single vector
export async function embedText(text: string): Promise<number[]> {
  const [embedding] = await embedTexts([text]);
  return embedding;
}

// Calculate cosine similarity between two vectors
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0,
    aNorm = 0,
    bNorm = 0;
  for (let i = 0; i < a.length; ++i) {
    dot += a[i] * b[i];
    aNorm += a[i] * a[i];
    bNorm += b[i] * b[i];
  }
  return dot / (Math.sqrt(aNorm) * Math.sqrt(bNorm));
}

/**
 * Embed query supporting 'or' operator: "pizza or pasta"
 * Returns an array of query embeddings, one per term
 */
export async function embedQuery(query: string): Promise<number[][]> {
  // Split by "or", trim whitespace
  const terms = query
    .toLowerCase()
    .split(/\s+or\s+/)
    .map((term) => term.trim())
    .filter(Boolean);
  return embedTexts(terms);
}

/**
 * Given posts and a search query, return sorted results by best semantic match
 * Supports 'or' in the query for multi-term search
 */
export async function semanticSearch(
  posts: string[],
  query: string,
  threshold: number = 0.75,
): Promise<{ post: string; score: number }[]> {
  const queryEmbeddings = await embedQuery(query);
  const postEmbeddings = await embedTexts(posts);

  // For each post, get its best similarity to any of the query terms
  const results = posts.map((post, i) => {
    const scores = queryEmbeddings.map((qEmb) =>
      cosineSimilarity(qEmb, postEmbeddings[i]),
    );
    return { post, score: Math.max(...scores) };
  });

  // Filter and sort results
  return results
    .filter((r) => r.score >= threshold)
    .sort((a, b) => b.score - a.score);
}

// greetings:
// Hello, world! | Greetings from Berlin! | Good morning everyone!

// sunny:
// What a sunny day! | Loving this sunny weather. | This weather is perfect for a picnic.

// weather:
// How's the weather today? | What a sunny day! | Loving this sunny weather.

// pizza:
// Does anyone like pizza? | Do you like deep dish pizza? | Made homemade pizza for dinner!

// book:
// Is anyone interested in starting a book club? | Finished reading a fantastic novel last night. | What are your favorite movies?

// reading:
// Finished reading a fantastic novel last night. | Is anyone interested in starting a book club? | What are your favorite movies?

// new:
// Hi everyone, I'm new here! | I'm new, nice to meet everyone! | Greetings from Berlin!

// neighbor:
// I just said hi to a neighbor. | Hi everyone, I'm new here! | Greetings from Berlin!

// hi:
// Hi everyone, I'm new here! | Hello, world! | I just said hi to a neighbor.

// restaurant:
// Can anyone recommend a good restaurant nearby? | Made homemade pizza for dinner! | Does anyone like pizza?

// picnic:
// Planning a picnic at the park. | This weather is perfect for a picnic. | Loving this sunny weather.

// beach:
// Went to the beach yesterday—so relaxing! | Planning a picnic at the park. | Loving this sunny weather.

// happy:
// I'm feeling happy this morning! | Good morning everyone! | Loving this sunny weather.

// guitar:
// Started learning how to play guitar. | Finished reading a fantastic novel last night. | Just got back from a long bike ride.

// music:
// Started learning how to play guitar. | Finished reading a fantastic novel last night. | What are your favorite movies?

// bike:
// Just got back from a long bike ride. | Started learning how to play guitar. | Does anyone want to go hiking this weekend?

// movie:
// What are your favorite movies? | Finished reading a fantastic novel last night. | Is anyone interested in starting a book club?

// coffee:
// Had a great cup of coffee today. | Good morning everyone! | I'm feeling happy this morning!

// hiking:
// Does anyone want to go hiking this weekend? | Just got back from a long bike ride. | Planning a picnic at the park.
