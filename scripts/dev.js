const { spawn } = require("child_process");
const path = require("path");

const root = path.resolve(__dirname, "..");
const isWindows = process.platform === "win32";

const processes = [];

function start(command, args, cwd, name) {
    const child = spawn(command, args, {
        cwd,
        stdio: "inherit",
        shell: isWindows
    });

    processes.push(child);

    child.on("error", (error) => {
        console.error(`[${name}] ${error.message}`);
    });

    child.on("exit", (code) => {
        if (code !== 0 && code !== null) {
            console.error(`[${name}] exited with code ${code}`);
        }
    });
}

start(
    "npm",
    ["run", "dev"],
    path.join(root, "dokimon-team-builder-frontend"),
    "Frontend"
);

start(
    isWindows ? "mvn.cmd" : "mvn",
    ["spring-boot:run"],
    path.join(root, "dokimon-team-builder-backend"),
    "Backend"
);

function shutdown() {
    for (const child of processes) {
        if (child.exitCode === null) {
            child.kill();
        }
    }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);