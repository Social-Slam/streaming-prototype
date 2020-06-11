export interface LoginWebSocketMessage {
  channel: "login";
  name: string;
}

export interface StartCallWebSocketMessage {
  channel: "start_call";
  otherPerson: string;
}

export interface WebRTCIceCandidateWebSocketMessage {
  channel: "webrtc_ice_candidate";
  candidate: RTCIceCandidate;
  otherPerson: string;
}

export interface WebRTCOfferWebSocketMessage {
  channel: "webrtc_offer";
  offer: RTCSessionDescription;
  otherPerson: string;
}

export interface WebRTCAnswerWebSocketMessage {
  channel: "webrtc_answer";
  answer: RTCSessionDescription;
  otherPerson: string;
}

export type WebSocketCallMessage =
  StartCallWebSocketMessage
  | WebRTCIceCandidateWebSocketMessage
  | WebRTCOfferWebSocketMessage
  | WebRTCAnswerWebSocketMessage;

export type WebSocketMessage = LoginWebSocketMessage | WebSocketCallMessage;
