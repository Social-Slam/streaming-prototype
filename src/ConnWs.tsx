export const Connection = () => {
  const ws = new WebSocket(`ws://${location.host}:4000`)


  ws.onopen = () => {
    ws.send(JSON.stringify({streamId: '1', token: '12345'}))
  }

  ws.onmessage = (msg) => {
    const message = JSON.parse(msg.data)

    console.log(message)
  }

  // @ts-ignore
  ws.onclose = (code, msg) => {
    console.log(code,msg)
  }
}


