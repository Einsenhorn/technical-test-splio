import url from "url";
import fs from "fs";

import "isomorphic-fetch";
import csv from "csv-parser";

import NABSASystemsCSVRow from "./types/NABSASystemsCSVRow";

const streamToCSV = async (
    stream: fs.ReadStream
): Promise<NABSASystemsCSVRow[]> =>
    new Promise((resolve, reject) => {
        const rows: NABSASystemsCSVRow[] = [];

        stream
            .pipe(csv())
            .on("data", (data) => rows.push(data))
            .on("end", () => resolve(rows))
            .on("error", (error) => reject(error));

        return rows;
    });

export default async (
    filters: (
        value: NABSASystemsCSVRow,
        index: number,
        array: NABSASystemsCSVRow[]
    ) => boolean,
    next: (err: Error | null, rows: NABSASystemsCSVRow[] | null) => void
): Promise<void> => {
    const nabsaSystemsList = new url.URL(
        "https://raw.githubusercontent.com/NABSA/gbfs/master/systems.csv"
    );

    try {
        const response = await fetch(nabsaSystemsList.href);

        if (response.body) {
            const results = await streamToCSV(
                (response.body as unknown) as fs.ReadStream
            );

            next(null, results.filter(filters));
        } else {
            next(new Error("No body in the response"), null);
        }
    } catch (error) {
        next(error, null);
    }
};
