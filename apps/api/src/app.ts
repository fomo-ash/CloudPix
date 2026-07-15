import express from "express"
import swaggerUi from "swagger-ui-express"

import healthrouter from "./routes/health.route"
import uploadRouter from "./routes/upload.route"
import assetRouter from "./routes/asset.route"
import { swaggerSpec } from "./swagger"

const app = express();

app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/health', healthrouter);
app.use('/api/upload', uploadRouter)
app.use('/api/asset', assetRouter);

export default app;