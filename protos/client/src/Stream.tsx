import React, { useEffect, useRef, useState, FC } from 'react'

import { Box } from 'rebass'
import VideoCard from './VideoCard'
import { SocketConnection, createStream } from './Connection'
import { useParams } from 'react-router-dom'
import { SocketConnectionProps, peerT } from '../../lib/types.ts'

export const Stream = () => {
	const socketRef = useRef<SocketIOClient.Socket>()
	const peersRef = useRef<peerT[]>([])
	const streamRef = useRef()
	const [peers, setPeers] = useState([])
	const { streamId, token } = useParams()

	const socketOptions: SocketConnectionProps = {
		url: 'localhost:4000',
		token,
		// token:
		// 	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbHBoYSIsImlhdCI6MTUxNjIzOTAyMn0.ok55AeE5LVEUYuWU4eLyBjdomKRBNtMoxuA3tkBMRuY',
		// token:
		// 	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJicmF2byIsImlhdCI6MTUxNjIzOTAyMn0.n-Fsy8Jx6q9IubgaNZUgooNcsUG_58OVgE9MUTLkMVs',
		streamId,
		peers,
		streamRef,
		setPeers,
		socketRef,
		peersRef,
	}

	useEffect(() => {
		SocketConnection(socketOptions)
	}, [])

	return <Box>
		<button onClick={async () => streamRef.current.srcObject = await createStream()}>Click me</button>
		{streamRef && <VideoCard options={streamRef} />}
		{peers.map(el => <VideoCard event={{
			host: {
				first_name: "Name"
			},
			video: el,
			title: "Title",
			datetime: "2020-05-19 14:30:00"
		}} />)}
	</Box>
}

export default Stream
