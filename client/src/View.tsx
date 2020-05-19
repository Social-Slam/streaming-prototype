
import React, { Fragment, useEffect, useRef, useState } from 'react'
import io from 'socket.io-client'
import Peer from 'simple-peer'
import { v5 as uuid } from 'uuid'
import { Box, Text, Flex,Button} from 'rebass'
import { Textarea} from '@rebass/forms'


const VideoContainer = (props) => {
  return (
    <Box
      id="video-container"
      sx={{
        display: 'grid',
        gridGap: 4,
        gridTemplateColumns: 'repeat(auto-fit, minmax(128px, 1fr))',
      }}
    >
      {props.streams.map((el, i) => {
        return <video
		key={i}
		autoPlay
		ref={el}
		style={{
		  width:  '100%',
		  height:  '100%',
		  objectFit: 'cover',
		}}
	  />
      })}
    </Box>
  )
}

const ChatContainer = (props) => {
  const [chatText, setChatText] = useState([])
  const { values, onSend } = props

  return (
    <Box>
      <Box py={2} px={3} overflowY="scroll" className="chat-log-container">
        {values.map((el, i) => (
          <Text key={i}>
            <b>{el.user}: </b>
            {el.text}
          </Text>
        ))}
      </Box>
      <Flex ml={2} height={70} className="chat-input-container">
        <Box as="form" onSubmit={(e) => e.preventDefault()} py={3} width={1}>
          <Flex mx={-2} mb={0}>
            <Box width={4 / 5} px={2}>
              <Textarea
                className={`chat-input ${
                  chatText.length > 0 ? 'color-grey' : 'color-lightgrey'
                }`}
                style={{ resize: 'none' }}
                value={chatText}
                onChange={(e) => {
                  if (e.target.value.length <= 200) {
                    setChatText(e.target.value)
                  }
                }}
              />
            </Box>
            <Box width={1 / 5} px={2}>
              
			                <Button onClick={() => {
                  onSend({ text: chatText })
                  setChatText('')
                }}>send</Button>

            </Box>
          </Flex>
          <Box width={1}>
            <Text
              className="chat-input-counter"
              color={chatText.length > 0 ? 'grey' : 'lightgrey'}
            >
              {chatText.length}/200
            </Text>
          </Box>
        </Box>
      </Flex>
    </Box>
  )
}

export const View = (props) => {
  const socketRef = useRef()
  const peersRef = useRef([])
  const [peers, setPeers] = useState([])
  const [viewerCount, setViewerCount] = useState(0)
  const [chatLog, setChatLog] = useState([])

  const streamId = props.match.params.streamId
  const username = 'John'

  useEffect(() => {
    socketRef.current = io('localhost:4000')

    socketRef.current.emit('connect_to_room', {
      streamId,
      //   token:
      //     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbHBoYSIsImlhdCI6MTUxNjIzOTAyMn0.ok55AeE5LVEUYuWU4eLyBjdomKRBNtMoxuA3tkBMRuY',
      token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJicmF2byIsImlhdCI6MTUxNjIzOTAyMn0.n-Fsy8Jx6q9IubgaNZUgooNcsUG_58OVgE9MUTLkMVs',
    })

    // artists: Set<string>, sockets: Set<string>
    socketRef.current.on('connections', (payload) => {
      const { artists, sockets } = payload
      const peers = []

      sockets.forEach((socketId) => {
        const peer = createPeer(socketId, socketRef.current.id)
        peers.push(peer)
        if (artists.contains(socketId)) {
          peersRef.current.push({
            socketId,
            peer,
          })
        }
      })

      setViewerCount(peers.length)
      setPeers(peers)
    })

    socketRef.current.on('message', (payload) => {
      if (payload.error) {
        console.error(payload)
      } else {
        console.info(payload)
      }
    })

    socketRef.current.on('new_connection', (payload) => {
      const peer = addPeer(payload.signal, payload.callerId)
      peers.push(peer)
      //         peersRef.current.push({
      //     socketId: payload.callerId,
      //     peer,
      //   })
    })

    socketRef.current.on('confirming_connection', (payload) => {
      const connection = peersRef.current.find(
        (p) => p.socketId === payload.socketId
      )
      connection.peer.signal(payload.signal)
    })
  }, [])

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

  return (
      <Flex flexWrap="wrap" mx={-2}>
        <Box
          width={9 / 12}
          px={2}
          py={2}
          style={{ borderRight: 'lightgrey 2px solid' }}
        >
          <Box m={2} style={{ border: 'grey 1px solid' }}>
            <VideoContainer streams={peersRef} />
          </Box>
        </Box>
        <Box width={3 / 12} px={2} py={2}>
          {/* TODO: Replace the chat with a 3rd party module? */}
          <ChatContainer
            username
            values={chatLog}
            onSend={(newMsg) => {
              newMsg.user = username
              chatLog.push(newMsg)
              setChatLog(chatLog)
              messagePeers(newMsg)
            }}
          />
        </Box>
      </Flex>
  )
}

export default View
