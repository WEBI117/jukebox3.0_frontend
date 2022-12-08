import { io } from "socket.io-client";
import queuehelper from './queueheler'

class sockethelper {
    socket: any
    constructor() {
        const socket = io('http://localhost:3002')
        socket.on('connect', () => {
            console.log("Socket connected to server")
        })
        socket.on('queueupdated', async () => {
            debugger
            var newqueue = await queuehelper.getQueue()
            //setQueue(newqueue)
        })
    }
}




