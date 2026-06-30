import express from "express"

import healthrouter from "./routes/health.route"

const app = express();

app.use(express.json());

app.use('/', healthrouter);

export default app;