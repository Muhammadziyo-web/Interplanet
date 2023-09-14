import "../db/mongo.js";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import path from "path";
import indexRouter from "../routes/index.routes.js";
import errorMiddleware from "../middleware/errorHandler.js";
import fileUpload from "express-fileupload";
const app: Application = express();
const PORT: number = Number(process.env.PORT) || 5000;
app.use(cors());

app.use(express.json());
app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));
app.use("/api", indexRouter);
 
app.get("/api", async (req: Request, res: Response) => {
    try {
        res.status(200).json({
            success: true,
            message: "Welcome to the Jop API."
        });
    } catch (error: unknown) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
});

app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log("Server listening on port " + PORT);
});
