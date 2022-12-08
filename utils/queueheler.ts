import axios from 'axios'
import song from '../interfaces/songInterface'

const playsong = async (song: song, deviceid: string, accesstoken: string) => {
    if (deviceid != "") {
        var resp = await axios({
            method: 'put',
            url: `https://api.spotify.com/v1/me/player/play?device_id=${deviceid}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accesstoken}`
            },
            data: {
                uris: [song.uri]
            }
        })
        return resp.status
    }
    else {
        console.log("device id not set....player may not be available.")
        return 0
    }
}
export default {
    playQueue: async (queue: song[], deviceid: string, accesstoken: string) => {
        if (accesstoken != "") {
            await axios({
                method: 'put',
                url: 'https://api.spotify.com/v1/me/player',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accesstoken}`
                },
                data: {
                    device_ids: [`${deviceid}`]
                }
            })
        }
        else {
            console.log("unable to change playback device as access token is null")
        }
        playsong(queue[0], deviceid, accesstoken)
    },


    getQueue: async () => {
        var resp = await axios({
            method: 'get',
            url: 'http://localhost:3000/queue'
        })
        return resp.data.queue
    }
}

class songqueue {
    queue: song[]
    constructor() {
        this.queue = []
    }
    getSongQueue() {
        var temp = this.queue
        return temp
    }
    async playSongQueue(deviceid: string, accesstoken: string) {
        // change playback device if not already changed
        if (accesstoken != "") {
            await axios({
                method: 'put',
                url: 'https://api.spotify.com/v1/me/player',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accesstoken}`
                },
                data: {
                    device_ids: [`${deviceid}`]
                }
            })
        }
        else {
            console.log("unable to change playback device as access token is null")
        }
        this._playsong(this.queue[0], deviceid, accesstoken)

    }
    _playsong = async (song: song, deviceid: string, accesstoken: string) => {
        debugger
        if (deviceid != "") {
            var resp = await axios({
                method: 'put',
                url: `https://api.spotify.com/v1/me/player/play?device_id=${deviceid}`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accesstoken}`
                },
                data: {
                    uris: [song.uri]
                }
            })
            return resp.status
        }
        else {
            console.log("device id not set....player may not be available.")
            return 0
        }
    }
}
