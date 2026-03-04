import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Servir les fichiers statiques du build React
app.use(express.static(path.join(__dirname, "dist")));

// API Endpoint pour le calcul VAR via Python
app.post("/api/var", (req, res) => {
    const scriptPath = path.resolve(__dirname, "var_calculator.py");
    const body = JSON.stringify(req.body);

    const tryRun = (command, fallback) => {
        const proc = spawn(command, [scriptPath], {
            cwd: __dirname,
            stdio: ["pipe", "pipe", "pipe"],
        });

        let stdout = "";
        let stderr = "";

        proc.stdout.on("data", (data) => {
            stdout += data.toString();
        });

        proc.stderr.on("data", (data) => {
            stderr += data.toString();
        });

        proc.stdin.write(body);
        proc.stdin.end();

        proc.on("error", (err) => {
            if (err.code === "ENOENT" && fallback) {
                tryRun(fallback);
            } else {
                res.status(500).json({
                    error: `Impossible de lancer Python (${err.message})`,
                });
            }
        });

        proc.on("close", (code) => {
            if (code === 0 && stdout) {
                const lines = stdout.trim().split("\n");
                const jsonLine = lines[lines.length - 1];
                try {
                    res.json(JSON.parse(jsonLine));
                } catch (e) {
                    res.status(500).json({ error: "Erreur de parsing JSON Python", details: stdout });
                }
            } else {
                res.status(500).json({
                    error: stderr || stdout || "Le script Python a échoué.",
                });
            }
        });
    };

    tryRun("python3", "python");
});

// Pour toutes les autres routes, servir index.html (React Router)
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
