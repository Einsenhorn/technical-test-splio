import GbfsClient from "gbfs-client";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const httpClient = require("gbfs-client/lib/http");

export { SystemInfo, StationInfo, StationStatus } from "gbfs-client/lib/types";

export interface GbfsFeedInfo {
    name: string;
    url: string;
}

export interface GbfsInfo {
    language: string;
    feeds: GbfsFeedInfo[];
}

export default class SplioGbfsClient extends GbfsClient {
    feeds: GbfsFeedInfo[];

    constructor(url: string) {
        super(url);

        this.feeds = [];
    }

    gbfs(): Promise<GbfsInfo> {
        return httpClient
            .get(this["urls"].base + "gbfs.json")
            .then((data: string) => {
                const response = JSON.parse(data).data;

                this.feeds = response.en.feeds;

                return response;
            });
    }
}
