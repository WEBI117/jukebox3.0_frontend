import axios from 'axios'

interface song {
    name: string,
    uri: string
    duration: number
}

// class to handle outgoing http requests
class httphelper {

    // SERVER REQUESTS
    // -----
    static async getTokenFromServerRequest() {
        var tokenRequest = await axios({
            method: 'get',
            url: "http://localhost:3000/token",
            responseType: "text"
        })

        if(tokenRequest.status === 200){
            var token = tokenRequest.data
            console.log(`Token recieved from server: ${token}`)
            return token
        }
        else{
            console.error(`Token request to backend failed with status ${tokenRequest.status}`)
            return null
        }
    }

    // SPOTIFY PLAYER REQUESTS
    // -----
    static async changePlaybackDeviceToBrowser(deviceid: string, accesstoken: string) {
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
    }

    static async playSongRequest(song: song, deviceid: string, accesstoken: string) {
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
            return
        }
    }
}

export default httphelper
