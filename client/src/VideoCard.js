import React from 'react'

export class VideoCard extends React.Component {
  render() {
    // let event = this.props.event

    // let host_full_name =
    //   event.host.last_name !== undefined
    //     ? event.host.first_name + ' ' + event.host.last_name
    //     : event.host.first_name

    return (
      <div className="video-card">
        <video width="320" height="240" muted autoPlay playsInline ref={this.props.options} />
        {/* <h3>{event.title}</h3>
        <div className="host-span">
          <span>{host_full_name}</span>
          <span>{event.datetime}</span>
        </div> */}
      </div>
    )
  }
}

export default VideoCard
