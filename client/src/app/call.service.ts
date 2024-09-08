import { ElementRef, Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CallService {
  localVideo: ElementRef;
  webSocket: WebSocket;
  peerConnection: RTCPeerConnection;

  constructor() {}

  async connectToWS(roomId: string) {
    this.webSocket = new WebSocket(`ws://${environment.apiUrl}/ws`);

    this.webSocket.onopen = () => {
      const message = {
        type: 'INIT_CONN',
        roomId: roomId,
      };

      this.webSocket.send(JSON.stringify(message));
    };

    this.webSocket.onmessage = (message) => console.log(message);

    this.initPeerConnection();
  }

  async initPeerConnection() {
    const configuration: RTCConfiguration = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    };

    this.peerConnection = new RTCPeerConnection(configuration);

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    this.webSocket.send(JSON.stringify({ type: 'OFFER', offer: offer }));
  }

  async initLocalVideo(localVideo: ElementRef) {
    this.localVideo = localVideo;
    const videoElement = localVideo.nativeElement as HTMLVideoElement;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      videoElement.srcObject = stream;
      videoElement.play();
    } catch (error) {
      console.error(error);
    }
  }
}
