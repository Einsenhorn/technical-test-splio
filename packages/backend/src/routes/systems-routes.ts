import express from "express";

import Gbfs from "../gbfs";

const router = express.Router();

export default router
    .get("/systems", (req, res) =>
        res.send((req.app.get("gbfs") as Gbfs).systems)
    )
    .get("/systems/:name", (req, res) => {
        const name = req.params.name;
        const gbfs: Gbfs = req.app.get("gbfs");

        const result = gbfs.systems.filter(
            (system) => system.Name?.toLowerCase() === name.toLowerCase()
        );

        if (result.length === 1) {
            res.send(result[0]);
        } else {
            res.sendStatus(404);
        }
    })
    .get("/systems/:name/stations-info", async (req, res) => {
        const name = req.params.name;
        const gbfs: Gbfs = req.app.get("gbfs");

        return res.send(await gbfs.getStationsInfo(name));
    })
    .get("/systems/:name/stations-info/:station_id", async (req, res) => {
        const name = req.params.name;
        const stationId = req.params.station_id;
        const gbfs: Gbfs = req.app.get("gbfs");

        return res.send(await gbfs.getStationInfo(name, stationId));
    })
    .get("/systems/:name/stations-status", async (req, res) => {
        const name = req.params.name;
        const gbfs: Gbfs = req.app.get("gbfs");

        return res.send(await gbfs.getStationsStatus(name));
    })
    .get("/systems/:name/stations-status/:station_id", async (req, res) => {
        const name = req.params.name;
        const stationId = req.params.station_id;
        const gbfs: Gbfs = req.app.get("gbfs");

        return res.send(await gbfs.getStationStatus(name, stationId));
    });
