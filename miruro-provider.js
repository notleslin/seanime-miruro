/// <reference path="../goja_onlinestream_test/onlinestream-provider.d.ts" />
/// <reference path="../goja_plugin_types/core.d.ts" />

class Provider {

    api = "https://api.miruro.tv"

    getSettings() {
        return {
            episodeServers: [
                "Miruro"
            ],
            supportsDub: true,
        }
    }

    async search(opts) {

        const req = await fetch(
            `${this.api}/search?query=${encodeURIComponent(opts.query)}`
        )

        if (!req.ok) return []

        const data = await req.json()

        if (!data || !Array.isArray(data)) return []

        return data.map((anime) => ({
            subOrDub: "sub",
            id: String(anime.id),
            title:
                anime.title ||
                anime.romaji ||
                anime.english ||
                "Unknown",
            url: "",
        }))
    }

    async findEpisodes(id) {

        const req = await fetch(
            `${this.api}/anime/${id}/episodes`
        )

        if (!req.ok) {
            throw new Error("Failed to fetch episodes.")
        }

        const data = await req.json()

        if (!data || !Array.isArray(data)) {
            throw new Error("No episodes found.")
        }

        return data.map((ep, index) => ({
            id: String(ep.id),
            number: ep.number || (index + 1),
            title:
                ep.title ||
                ("Episode " + (ep.number || (index + 1))),
            url: "",
        }))
    }

    async findEpisodeServer(episode, server) {

        const req = await fetch(
            `${this.api}/episodes/${episode.id}/sources`
        )

        if (!req.ok) {
            throw new Error("Failed to fetch sources.")
        }

        const data = await req.json()

        if (!data || !data.streams) {
            throw new Error("No streams found.")
        }

        const videoSources = []

        for (const stream of data.streams) {

            if (!stream.url) continue

            videoSources.push({
                url: stream.url,
                type: "m3u8",
                quality: stream.quality || "auto",
                subtitles: [],
                headers: {},
            })
        }

        if (videoSources.length === 0) {
            throw new Error("No valid video sources.")
        }

        return {
            videoSources,
            headers: {},
            server: "Miruro",
        }
    }
}
