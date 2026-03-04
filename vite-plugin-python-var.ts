import { Plugin } from "vite";
import { spawn } from "child_process";
import path from "path";

/**
 * Plugin Vite qui intercepte POST /api/var
 * et exécute le script Python var_calculator.py localement.
 */
export default function pythonVarPlugin(): Plugin {
    return {
        name: "python-var",
        configureServer(server) {
            server.middlewares.use("/api/var", (req, res, next) => {
                if (req.method !== "POST") {
                    return next();
                }

                let body = "";
                req.on("data", (chunk: Buffer) => {
                    body += chunk.toString();
                });

                req.on("end", () => {
                    const scriptPath = path.resolve(__dirname, "var_calculator.py");

                    // Try 'python' first, fall back to 'python3'
                    const tryRun = (command: string, fallback?: string) => {
                        const proc = spawn(command, [scriptPath], {
                            cwd: path.resolve(__dirname),
                            stdio: ["pipe", "pipe", "pipe"],
                        });

                        let stdout = "";
                        let stderr = "";

                        proc.stdout.on("data", (data: Buffer) => {
                            stdout += data.toString();
                        });

                        proc.stderr.on("data", (data: Buffer) => {
                            stderr += data.toString();
                        });

                        proc.stdin.write(body);
                        proc.stdin.end();

                        proc.on("error", (err: NodeJS.ErrnoException) => {
                            if (err.code === "ENOENT" && fallback) {
                                // Command not found, try fallback
                                tryRun(fallback);
                            } else {
                                res.writeHead(500, { "Content-Type": "application/json" });
                                res.end(
                                    JSON.stringify({
                                        error: `Impossible de lancer Python. Vérifiez que Python 3 est installé et dans le PATH. (${err.message})`,
                                    })
                                );
                            }
                        });

                        proc.on("close", (code) => {
                            res.writeHead(code === 0 && stdout ? 200 : 500, {
                                "Content-Type": "application/json",
                            });

                            if (code === 0 && stdout) {
                                // Try to extract only the last line of stdout (the JSON result)
                                // yfinance may print progress to stdout despite progress=False
                                const lines = stdout.trim().split("\n");
                                const jsonLine = lines[lines.length - 1];
                                res.end(jsonLine);
                            } else {
                                res.end(
                                    JSON.stringify({
                                        error:
                                            stderr ||
                                            stdout ||
                                            "Le script Python a échoué sans message d'erreur.",
                                    })
                                );
                            }
                        });
                    };

                    tryRun("python", "python3");
                });
            });
        },
    };
}
