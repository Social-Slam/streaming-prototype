
import React, { Fragment, useEffect, useRef, useState } from 'react'
import io from 'socket.io-client'
import Peer from 'simple-peer'
import { v5 as uuid } from 'uuid'
import { Box, Text, Flex, Button } from 'rebass'
import { Textarea } from '@rebass/forms'
import VideoCard from './VideoCard'
import { SocketConnection, messagePeers } from './Connection'
import { SocketConnectionProps, peerT } from '../../lib/types.ts'
import { useParams } from 'react-router-dom'


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
				return <VideoCard event={{
					host: {
						first_name: "Name"
					},
					video: el,
					title: "Title",
					datetime: "2020-05-19 14:30:00"
				}} />
			})}
		</Box>
	)
}

// const ChatContainer = (props) => {
// 	const [chatText, setChatText] = useState<string>()
// 	const { values, onSend } = props

// 	return (
// 		<Box>
// 			<Box py={2} px={3} overflowY="scroll" className="chat-log-container">
// 				{values.map((el, i) => (
// 					<Text key={i}>
// 						<b>{el.user}: </b>
// 						{el.text}
// 					</Text>
// 				))}
// 			</Box>
// 			<Flex ml={2} height={70} className="chat-input-container">
// 				<Box as="form" onSubmit={(e) => e.preventDefault()} py={3} width={1}>
// 					<Flex mx={-2} mb={0}>
// 						<Box width={4 / 5} px={2}>
// 							<Textarea
// 								className={`chat-input ${
// 									chatText.length > 0 ? 'color-grey' : 'color-lightgrey'
// 									}`}
// 								style={{ resize: 'none' }}
// 								value={chatText}
// 								onChange={(e) => {
// 									if (e.target.value.length <= 200) {
// 										setChatText(e.target.value)
// 									}
// 								}}
// 							/>
// 						</Box>
// 						<Box width={1 / 5} px={2}>

// 							<Button onClick={() => {
// 								onSend({ text: chatText })
// 								setChatText('')
// 							}}>send</Button>

// 						</Box>
// 					</Flex>
// 					<Box width={1}>
// 						<Text
// 							className="chat-input-counter"
// 							color={chatText.length > 0 ? 'grey' : 'lightgrey'}
// 						>
// 							{chatText.length}/200
//             </Text>
// 					</Box>
// 				</Box>
// 			</Flex>
// 		</Box>
// 	)
// }

export const View = (props) => {
	const socketRef = useRef<SocketIOClient.Socket>()
	const peersRef = useRef<peerT[]>([])
	const [peers, setPeers] = useState([])
	const { streamId } = useParams()
	const [chatLog, setChatLog] = useState([])

	const username = 'John'

	const socketOptions: SocketConnectionProps = {
		url: 'localhost:4000',
		// token:
		// 	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbHBoYSIsImlhdCI6MTUxNjIzOTAyMn0.ok55AeE5LVEUYuWU4eLyBjdomKRBNtMoxuA3tkBMRuY',
		token:
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJicmF2byIsImlhdCI6MTUxNjIzOTAyMn0.n-Fsy8Jx6q9IubgaNZUgooNcsUG_58OVgE9MUTLkMVs',
		streamId,
		peers,
		setPeers,
		socketRef: socketRef,
		peersRef,
	}

	useEffect(() => {
		SocketConnection(socketOptions)
	}, [])

	return (
		<Flex flexWrap="wrap" mx={-2}>
			<Box
				width={9 / 12}
				px={2}
				py={2}
				style={{ borderRight: 'lightgrey 2px solid' }}
			>
				<Box m={2} style={{ border: 'grey 1px solid' }}>
					<VideoContainer streams={peers} />
				</Box>
			</Box>
			<Box width={3 / 12} px={2} py={2}>
				{/* TODO: Replace the chat with a 3rd party module? */}
				{/* <ChatContainer
					username
					values={chatLog}
					onSend={(newMsg) => {
						newMsg.user = username
						chatLog.push(newMsg)
						setChatLog(chatLog)
						messagePeers(peers, newMsg)
					}}
				/> */}
			</Box>
		</Flex>
	)
}

export default View
