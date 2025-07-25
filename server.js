import jsonServer from "json-server";

const server = jsonServer.create();
const router = jsonServer.router("scr/db.json");
const middlewares = jsonServer.defaults();

server.use(middlewares);

server.use(jsonServer.bodyParser);

server.get("/list", (req, res) => {
  const posts = router.db.get("posts").value();
  res.json(posts);
});

server.post("/create", (req, res, next) => {
  req.url = "/posts";
  next();
});

server.use(router);

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`);
});
