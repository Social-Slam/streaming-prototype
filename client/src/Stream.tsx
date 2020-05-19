import React, { useEffect, useRef, useState, FC } from 'react'

import { Box } from 'rebass'
import VideoCard from './VideoCard'
import { SocketConnection, createStream } from './Connection'
import { useParams } from 'react-router-dom'
import { SocketConnectionProps, peerT } from '../../lib/index'

export const Stream: FC = async (props) => {
	const socketRef = useRef<SocketIOClient.Socket>()
	const peersRef = useRef<peerT[]>([])
	const [peers, setPeers] = useState([])
	const [streamers, setStreamers] = useState([])
	const { streamId } = useParams()

	const socketOptions: SocketConnectionProps = {
		url: 'localhost:4000',
		token:
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbHBoYSIsImlhdCI6MTUxNjIzOTAyMn0.ok55AeE5LVEUYuWU4eLyBjdomKRBNtMoxuA3tkBMRuY',
		// token:
		// 	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJicmF2byIsImlhdCI6MTUxNjIzOTAyMn0.n-Fsy8Jx6q9IubgaNZUgooNcsUG_58OVgE9MUTLkMVs',
		createStream: true,
		streamId,
		peers,
		setPeers,
		socketRef: socketRef.current,
		peersRef,
	}

	useEffect(() => {
		SocketConnection(socketOptions)
	}, [])

	return streamers.map(el => <VideoCard event={{
		host: {
			first_name: "Name"
		},
		video: el,
		title: "Title",
		datetime: "2020-05-19 14:30:00"
	}} />)
}

export default Stream
