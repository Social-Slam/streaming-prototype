import React, { useEffect, useRef, useState } from 'react'

import { Box } from 'rebass'

export const Stream = (props) => {
  const socketRef = useRef()
  const [peers, setPeers] = useState([])

  const streamId = props.match.params.streamId

  const socketOptions = {
    url: 'localhost:4000',
    streamId,
    //   token:
    //     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbHBoYSIsImlhdCI6MTUxNjIzOTAyMn0.ok55AeE5LVEUYuWU4eLyBjdomKRBNtMoxuA3tkBMRuY',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJicmF2byIsImlhdCI6MTUxNjIzOTAyMn0.n-Fsy8Jx6q9IubgaNZUgooNcsUG_58OVgE9MUTLkMVs',
    setPeers,
    setViewerCount,
  }

  useEffect(() => {
    socketRef.current = socketConnection(socketOptions)
  }, [])

  return <Layout skipHeader={true} skipMenu={true}></Layout>
}

export default Stream
