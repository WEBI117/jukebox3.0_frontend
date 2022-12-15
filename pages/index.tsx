import React, { useEffect, useState, useRef } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import initializeplayer from 'utils/initializeplayer'
import { io } from "socket.io-client";
import httphelper from "../utils/httphelper"
import song from "../interfaces/songInterface"

//import useQueueState from '../hooks/QueueStateHook'

export default function Home() {

    // TODO: set state for current song being played and display it on the main page.
    // TODO: get a refreshed access token from backend once the old token has expired.

    //const [currentlyplayingsong, setcurrentlyplayingsong] = useState<song>()
    //const [queue,setQueue] = useQueueState([])

    const [accesstoken, setAccesstoken] = useState<string>("")
    const [deviceid, setDeviceid] = useState<string>("")
    const [socket, setSocket] = useState<any>()

    // Queue State Management Hooks
    // ------
    // TODO: Extract into custom hook
    // Usage: Simply use refQueue.current wherever you need queue.
    const [queue, setQueue] = useState<song[]>([])
    var refQueue = useRef(queue)
    useEffect(() => {
        refQueue.current = queue
    }, [queue])
    // ------

    // socket initialization
    useEffect(() => {
        var sock = io('http://localhost:3002')
        sock.on('connect', () => {
            console.log("Socket connected to server")
        })
        sock.on('queueupdated', async () => {
            var newqueue = await httphelper.getQueueFromServer() as song[]
            setQueue([...newqueue])
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
        if (refQueue.current.length != 0) {
            var prom = new Promise((res, rej) => {
                try {
                    setTimeout(() => {
                        console.log(refQueue.current)
                        socket.emit("songplayed", () => {
                            console.log("emitted song played event.")
                        })
                        res(refQueue.current)
                    }, 5000)
                }
                catch (err) {
                    rej(err)
                }
            })
            await prom
            beginplayback()
        }
        else {
            // TODO: Add logic to play random song instead.
            console.log('empty queue')
        }
    }

    return (
        <div>
            {queue.map((song: song) => <li>{song.name}</li>)}
            <div className="flex">
                <div>
                    <button onClick={async () => {
                        var result = (await httphelper.getQueueFromServer())
                        setQueue([...result])
                    }}>update queue</button>
                </div>
                <div>
                    <button onClick={() => { beginplayback() }}>play queue</button>
                </div>
            </div>
        </div>
    )
}
