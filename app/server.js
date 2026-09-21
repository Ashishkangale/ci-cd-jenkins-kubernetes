const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;
const APP_VERSION = process.env.APP_VERSION || "development";

app.get("/", (req, res) => {
    res.json({
        application: "CI/CD Demo",
        status: "running",
        version: APP_VERSION
    });
});

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "healthy"
    });
});

app.listen(PORT, () => {
    console.log(`Application running on port ${PORT}`);
});
