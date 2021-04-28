import path from "path";
import fs from "fs";

import express from "express";

import React from "react";
import ReactDOMServer from "react-dom/server";

const router = express.Router();

export default router.get("/", (req, res) => {
    // This is an ugly hack
    const app = ReactDOMServer.renderToString(
        <div>
            <h1>counter at: 0</h1>
            <button>button</button>
        </div>
    );

    const indexFile = path.resolve("./index.html");
    fs.readFile(indexFile, "utf8", (err, data) => {
        if (err) {
            console.error("Something went wrong:", err);
            return res.status(500).send("Oops, better luck next time!");
        }

        return res.send(
            data.replace('<div id="root"></div>', `<div id="root">${app}</div>`)
        );
    });
});
