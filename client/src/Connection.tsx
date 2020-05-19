import io from 'socket.io-client'

const socketConnection = ({ url, token, streamId }) => {
  const socketRef = io(url)

  socketRef.emit('connect_to_room', {
    streamId,
    token,
  })

  // artists: Set<string>, sockets: Set<string>
  socketRef.on('connections', (payload) => {
    const { artists, sockets } = payload
    const peers = []

    sockets.forEach((socketId) => {
      const peer = createPeer(socketId, socketRef.id)
      peers.push(peer)
      if (artists.contains(socketId)) {
        peersRef.push({
          socketId,
          peer,
        })
      }
    })

    setViewerCount(peers.length)
    setPeers(peers)
  })

  socketRef.on('message', (payload) => {
    if (payload.error) {
      console.error(payload)
    } else {
      console.info(payload)
    }
  })

  socketRef.on('new_connection', (payload) => {
    const peer = addPeer(payload.signal, payload.callerId)
    peers.push(peer)
    //         peersRef.push({
    //     socketId: payload.callerId,
    //     peer,
    //   })
  })

  socketRef.on('confirming_connection', (payload) => {
    const connection = peersRef.find((p) => p.socketId === payload.socketId)
    connection.peer.signal(payload.signal)
  })

  return socketRef
}

const createPeer = (socketId, callerId) => {
  const peer = new Peer({ initiator: true, trickle: false })

  peer.on('signal', (signal) => {
    socketRef.current.emit('send_signal', {
      socketId,
      callerId,
      signal,
    })
  })

  return peer
}

const addPeer = (incomingSignal, callerId) => {
  const peer = new Peer({
    initiator: false,
    trickle: false,
  })

  peer.on('signal', (signal) => {
    socketRef.current.emit('receive_signal', { signal, callerId })
  })

  peer.on('data', (newMsg) => {
    chatLog.push(newMsg)
    setChatLog(chatLog)
  })

  peer.signal(incomingSignal)

  return peer
}

const messagePeers = (newMsg) => {
  peers.forEach((peer) => {
    peer.send(newMsg)
  })
}
