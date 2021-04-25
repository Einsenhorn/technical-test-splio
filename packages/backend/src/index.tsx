import path from "path";
import fs from "fs";

import React from "react";

import express from "express";
import ReactDOMServer from "react-dom/server";
import bootstrap from "./bootstrap";

import { Counter } from "frontend";

const app = express();
const port = 3000;

bootstrap();

app.use(express.static("node_modules"));

app.get("/", (req, res) => {
    const app = ReactDOMServer.renderToString(
        (
            <div>
                <h1>counter at: 0</h1>
                <button>button</button>
            </div>
        )
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

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
