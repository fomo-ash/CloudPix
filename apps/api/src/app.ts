import express from "express"

import healthrouter from "./routes/health.route"
import uploadRouter from "./routes/upload.route"

const app = express();

app.use(express.json());

app.use('/health', healthrouter);
app.use('/api/upload', uploadRouter)

export default app;