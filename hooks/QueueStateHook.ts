import React, { useEffect, useState, useRef } from 'react'
import song from "../interfaces/songInterface"

const useQueueState = (initialState: song[]|[]) => {
    const [queue, setQueue] = useState<song[]>(initialState)
    var refQueue = useRef(queue)
    useEffect(() => {
        debugger
        refQueue.current = queue
    }, [queue])

    return [refQueue.current,setQueue]
}

export default useQueueState;
