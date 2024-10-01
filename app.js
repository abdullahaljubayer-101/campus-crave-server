import express from "express";
import { getAllUser, getUser, createUser } from "./auth.js";

const app = express();

app.use(express.json());

app.get("/user", async (req, res) => {
  const users = await getAllUser();
  res.send(users);
});

app.get("/user/:id", async (req, res) => {
  const id = req.params.id;
  const user = await getUser(id);
  res.send(user);
});

app.post("/user", async (req, res) => {
  const { email, contents } = req.body;
  const note = await createUser(title, contents);
  res.status(201).send(note);
});

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
