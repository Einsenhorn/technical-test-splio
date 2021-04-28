import express from "express";

import Gbfs from "./gbfs";
import bootstrap from "./bootstrap";
import ssrRoutes from "./routes/ssr-routes";
import routes from "./routes/systems-routes";

import NABSASystemsCSVRow from "./types/NABSASystemsCSVRow";

const app = express();
const port = 3000;

bootstrap(
    (row) => row["Country Code"] === "FR" && row.Location === "Paris, FR",
    async (err, systems) => {
        if (err) {
            return console.error(err);
        }

        const gbfs = new Gbfs(systems as NABSASystemsCSVRow[]);

        try {
            await gbfs.ensureSystemsExists();
            await gbfs.warmUpCache();
            // console.log(await gbfs.getStationsStatus("Lime Paris"));
        } catch (error) {
            console.error(error);
            process.exit(1);
        }

        app.set("gbfs", gbfs);

        // This is a ugly hack.
        app.use(express.static("node_modules"));

        app.use(ssrRoutes);
        app.use(routes);

        app.listen(port, () =>
            console.log(`Example app listening at http://localhost:${port}`)
        );
    }
);
