import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import initializeplayer from 'utils/initializeplayer'
import queuehelper from 'utils/queueheler'
import { io } from "socket.io-client";
import httphelper from "../utils/httphelper"
import song from "../interfaces/songInterface"

export default function Home() {

    // TODO: set state for current song being played and display it on the main page.
    // TODO: get a refreshed access token from backend once the old token has expired.
    
    //const [currentlyplayingsong, setcurrentlyplayingsong] = useState<song>()

    const [accesstoken, setAccesstoken] = useState<string>("")
    const [queue, setQueue] = useState<song[]>([])
    const [deviceid, setDeviceid] = useState<string>("")
    const [socket, setSocket] = useState<any>()

    // socket initialization
    useEffect(() => {
        var sock = io('http://localhost:3002')
        sock.on('connect', () => {
            console.log("Socket connected to server")
        })
        sock.on('queueupdated', async () => {
            var newqueue = await queuehelper.getQueue()
            setQueue(newqueue)
        })
        setSocket(sock)
    }, [])

    // player setup
    useEffect(() => {
        const script = document.createElement('script')
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;


        (async () => {
            var token = await httphelper.getTokenFromServerRequest()
            setAccesstoken(token)
            console.log(token)

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

    const beginplayback = async () => {
        if (queue.length === 0) {
            console.log("queue empty")
            return
        }
        var queuecopy = [...queue]
        var song = queuecopy.shift()
        if (song != undefined) {

            // TODO: Handle request failed logic....
            await httphelper.playSongRequest(song, deviceid, accesstoken)

            // tell backend to remove the last song in queue
            socket.emit("songplayed", () => {
                console.log("emitted song played event.")
            })
            setTimeout(async () => {
                beginplayback()
            }, song.duration + 5000)
        }
        else {
            // TODO: remove the setQueue call since the queue will only be set on socket events.
            console.log("Song was undefinded...playing next")
            setQueue(queuecopy)
            beginplayback()
        }

    }

    return (
        <div>
            {queue.map((songInterface) => <li>{songInterface.name}</li>)}
            <div className="flex">
                <div>
                    <button onClick={async () => { setQueue(await queuehelper.getQueue()) }}>update queue</button>
                </div>
                <div>
                    <button onClick={() => { beginplayback() }}>play queue</button>
                </div>
            </div>
        </div>
    )
}
