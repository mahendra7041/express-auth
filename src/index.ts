import dotenv from "dotenv";
dotenv.config({ path: __dirname + "/.env" });
import { Server } from "./server";
import AuthController from "./controller/auth/auth.controller";

const app = new Server({
  controllers: [AuthController],
});

app.listen((port) => {
  console.log(`Server is listening on http://localhost:${port}`);
});
