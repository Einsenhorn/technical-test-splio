import SplioGbfsClient, {
    StationInfo,
    StationStatus,
    GbfsInfo,
} from "./splio-gbfs-client";

import NABSASystemsCSVRow from "./types/NABSASystemsCSVRow";

interface Cache<T> {
    timestamp: number;
    data: T[];
}

export default class Gbfs {
    clients: Record<string, SplioGbfsClient>;
    systems: NABSASystemsCSVRow[];
    stationsInfoCache: Record<string, Cache<StationInfo>>;
    stationsStatusCache: Record<string, Cache<StationStatus>>;

    constructor(systems: NABSASystemsCSVRow[]) {
        this.systems = systems;
        this.clients = {};
        this.stationsInfoCache = {};
        this.stationsStatusCache = {};
    }

    async ensureSystemsExists(): Promise<void> {
        await Promise.all(
            this.systems?.map(async (system) => {
                const name = system.Name;
                const client = new SplioGbfsClient(
                    system["Auto-Discovery URL"].replace(
                        /(.*)(gbfs.json)$/,
                        "$1"
                    )
                );

                console.log(`System \`${name}\` loading.`);
                await client.system();
                console.log(`System \`${name}\` loaded.`);

                this.clients[name] = client;
            })
        );
    }

    async warmUpCache(): Promise<void> {
        const startDate = new Date();
        console.log(`Starting cache warm up -- ${startDate}`);

        await Promise.all(
            Object.keys(this.clients).map(async (name) => {
                await this.getGbfsInfo(name);
            })
        );

        const promises: Promise<StationInfo[] | StationStatus[]>[] = [];
        Object.keys(this.clients).map(async (name) => {
            if (
                this.clients[name].feeds.filter(
                    (feed) => feed.name === "station_information"
                ).length === 1
            ) {
                promises.push(this.getStationsInfo(name));
            }

            if (
                this.clients[name].feeds.filter(
                    (feed) => feed.name === "station_status"
                ).length === 1
            ) {
                promises.push(this.getStationsStatus(name));
            }
        });

        await Promise.all(promises);
        const endDate = new Date();
        console.log(`Cache warm up done -- ${endDate}`);
        console.log(
            `It took ${
                (endDate.getTime() - startDate.getTime()) / 1000
            } seconds.`
        );
    }

    async getGbfsInfo(systemName: string): Promise<GbfsInfo> {
        if (typeof this.clients[systemName] === "undefined") {
            throw new Error(`Unknown system \`${systemName}\`.`);
        }

        return await this.clients[systemName].gbfs();
    }

    //#region Station Info

    async getStationsInfo(systemName: string): Promise<StationInfo[]> {
        if (typeof this.clients[systemName] === "undefined") {
            throw new Error(`Unknown system \`${systemName}\`.`);
        }

        if (typeof this.stationsInfoCache[systemName] === "undefined") {
            this.stationsInfoCache[systemName] = { timestamp: 0, data: [] };
        }

        const now = new Date();
        if (this.stationsInfoCache[systemName].timestamp < now.getTime()) {
            const stations = await this.clients[systemName].stationInfo();

            console.log(`station info cache refreshed for ${systemName}.`);

            this.stationsInfoCache[systemName].data = stations;
            this.stationsInfoCache[systemName].timestamp = new Date(
                now.getTime() + 60000
            ).getTime();
        }

        return this.stationsInfoCache[systemName].data;
    }

    async getStationInfo(
        systemName: string,
        stationId: string
    ): Promise<StationInfo | null> {
        const result = (await this.getStationsInfo(systemName)).filter(
            (info) => info.station_id === stationId
        );

        return result.length === 1 ? result[0] : null;
    }

    //#endregion Station Info

    //#region Station Status

    async getStationsStatus(systemName: string): Promise<StationStatus[]> {
        if (typeof this.clients[systemName] === "undefined") {
            throw new Error(`Unknown system \`${systemName}\`.`);
        }

        if (typeof this.stationsStatusCache[systemName] === "undefined") {
            this.stationsStatusCache[systemName] = { timestamp: 0, data: [] };
        }

        const now = new Date();
        if (this.stationsStatusCache[systemName].timestamp < now.getTime()) {
            const stations = await this.clients[systemName].stationStatus();

            console.log(`station status cache refreshed for ${systemName}.`);

            this.stationsStatusCache[systemName].data = stations;
            this.stationsStatusCache[systemName].timestamp = new Date(
                now.getTime() + 60000
            ).getTime();
        }

        return this.stationsStatusCache[systemName].data;
    }

    async getStationStatus(
        systemName: string,
        stationId: string
    ): Promise<StationStatus | null> {
        const result = (await this.getStationsStatus(systemName)).filter(
            (info) => info.station_id === stationId
        );

        return result.length === 1 ? result[0] : null;
    }

    //#endregion
}
