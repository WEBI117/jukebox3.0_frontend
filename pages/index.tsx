import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

interface track {
    name: string,
    uri: string
}
export default function Home() {
    // Hook to initialize player
    const [accesstoken, setAccesstoken] = useState<string>("")
    const [queue, setQueue] = useState<[track]>([])
    const [deviceid, setDeviceid] = useState<string>("")

    useEffect(() => {
        const script = document.createElement('script')
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;


        (async () => {
            var token = await getToken()
            setAccesstoken(token)
            console.log(token)
            //for testing only
            //------
            await axios({
                method: 'get',
                url: 'http://localhost:3000/genqueue',
            })
            //------

            document.body.appendChild(script);
            window.onSpotifyWebPlaybackSDKReady = () => {
                const player: any = new window.Spotify.Player({
                    name: 'Web Playback SDK',
                    getOAuthToken: cb => { cb(token) },
                    volume: 0.5
                });

                //setPlayer(player);

                // Ready
                player.on('ready', ({ device_id }) => {
                    console.log('Ready with Device ID', device_id);
                    setDeviceid(device_id)
                });

                // Not Ready
                player.on('not_ready', ({ device_id }) => {
                    console.log('Device ID has gone offline', device_id);
                });

                player.on('initialization_error', ({ message }) => {
                    console.error(message);
                });

                player.on('authentication_error', ({ message }) => {
                    console.error(message);
                });

                player.on('account_error', ({ message }) => {
                    console.error(message);
                });

                console.log("connecting player")
                player.connect()
            }

        })()

    }, [])
    const getToken = async () => {
        console.log("getting token")
        var token = await axios({
            method: 'get',
            url: "http://localhost:3000/token",
            responseType: "text"
        })
        if (token.status === 200) {
            console.log(token.data)
            return token.data
        }
        else {
            console.log("Error getting token")
        }
        return ""
    }
    const playQueue = async () => {
        if(accesstoken != ""){
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
        else{
            console.log("unable to change playback device as access token is null")
        }
        playsong(queue[0])
    }
    const playsong = async (song: track) => {
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
            debugger
        }
        else {
            console.log("device id not set....player may not be available.")
        }
    }
    const getQueue = async () => {
        var resp = await axios({
            method: 'get',
            url: 'http://localhost:3000/getqueue'
        })
        debugger
        setQueue(resp.data.queue)
    }

    return (
        <div>
            {queue.map((track) => <li>{track.name}</li>)}
            <div className="flex">
                <div>
                    <button onClick={() => { getQueue() }}>update queue</button>
                </div>
                <div>
                    <button onClick={() => { playQueue() }}>play queue</button>
                </div>
            </div>
        </div>
    )
}
