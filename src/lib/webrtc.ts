export class WebRTCConnection {
  private peerConnection: RTCPeerConnection;
  private dataChannel: RTCDataChannel | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;

  constructor(
    private onMessage: (data: any) => void,
    private onStream: (stream: MediaStream) => void,
    private onConnectionStateChange: (state: RTCPeerConnectionState) => void
  ) {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    this.setupPeerConnection();
  }

  private setupPeerConnection() {
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Share this candidate with the peer
        console.log('New ICE candidate:', event.candidate);
      }
    };

    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      this.onStream(this.remoteStream);
    };

    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupDataChannel();
    };

    this.peerConnection.onconnectionstatechange = () => {
      this.onConnectionStateChange(this.peerConnection.connectionState);
    };
  }

  private setupDataChannel() {
    if (!this.dataChannel) return;

    this.dataChannel.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.onMessage(data);
    };
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    this.dataChannel = this.peerConnection.createDataChannel('chat');
    this.setupDataChannel();

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  async handleAnswer(answer: RTCSessionDescriptionInit) {
    await this.peerConnection.setRemoteDescription(answer);
  }

  async handleOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    await this.peerConnection.setRemoteDescription(offer);
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    return answer;
  }

  async addIceCandidate(candidate: RTCIceCandidateInit) {
    await this.peerConnection.addIceCandidate(candidate);
  }

  async startLocalStream() {
    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    this.localStream.getTracks().forEach((track) => {
      if (this.localStream) {
        this.peerConnection.addTrack(track, this.localStream);
      }
    });

    return this.localStream;
  }

  stopLocalStream() {
    this.localStream?.getTracks().forEach((track) => track.stop());
    this.localStream = null;
  }

  sendMessage(data: any) {
    if (this.dataChannel?.readyState === 'open') {
      this.dataChannel.send(JSON.stringify(data));
    }
  }

  async sendFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      this.sendMessage({
        type: 'file',
        name: file.name,
        data: reader.result,
      });
    };
    reader.readAsDataURL(file);
  }

  close() {
    this.stopLocalStream();
    this.dataChannel?.close();
    this.peerConnection.close();
  }
}