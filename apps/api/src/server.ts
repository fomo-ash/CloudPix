import app from "./app";
import { env } from "@cloudpix/env";

app.listen(env.PORT, () => {
    console.log(`API running on Port ${env.PORT}`);
});