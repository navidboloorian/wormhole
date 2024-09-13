import { ElementRef, Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CallService {
  localVideo: ElementRef;
  remoteVideo: ElementRef;
  webSocket: WebSocket;
  peerConnection: RTCPeerConnection;
  polite: boolean;
  makingOffer: boolean;

  constructor() {}

  public async init(localVideo: ElementRef, remoteVideo: ElementRef) {
    this.localVideo = localVideo;
    this.remoteVideo = remoteVideo;
    this.polite = false;
    this.makingOffer = false;

    this._initConnection();
    this._initLocalVideo();
    this._registerListeners();
  }

  private _initConnection() {
    this.webSocket = new WebSocket(`ws://${environment.apiUrl}/ws`);
    const configuration: RTCConfiguration = {
      iceServers: [
        {
          urls: [
            'stun:stun.l.google.com:19302',
            'stun:stun1.l.google.com:19302',
          ],
        },
      ],
    };

    this.peerConnection = new RTCPeerConnection(configuration);
  }

  private _registerListeners = () => {
    this.peerConnection.ontrack = ({ track, streams }) => {
      const remoteVideo = this.remoteVideo.nativeElement as HTMLVideoElement;

      track.onmute = () => {
        if (remoteVideo.srcObject) return;
      };

      remoteVideo.srcObject = streams[0];
      remoteVideo.play();
    };

    this.peerConnection.onconnectionstatechange = () => {
      console.log(this.peerConnection.connectionState);
    };

    this.peerConnection.onicecandidate = ({ candidate }) => {
      this.webSocket.send(JSON.stringify({ candidate }));
    };

    this.peerConnection.onnegotiationneeded = async () => {
      try {
        this.makingOffer = true;

        await this.peerConnection.setLocalDescription();
        this.webSocket.send(
          JSON.stringify({ description: this.peerConnection.localDescription })
        );
      } catch (err) {
        this.makingOffer = false;
      } finally {
        this.makingOffer = false;
      }
    };

    this.webSocket.onmessage = async (message) => {
      const { polite, description, candidate } = JSON.parse(message.data);
      let ignoreOffer = false;

      if (polite !== undefined) this.polite = polite;

      try {
        if (description) {
          const offerCollision =
            description.type === 'offer' &&
            (this.makingOffer ||
              this.peerConnection.signalingState !== 'stable');

          ignoreOffer = !this.polite && offerCollision;

          console.log(description.type);

          if (ignoreOffer) return;

          await this.peerConnection.setRemoteDescription(description);

          if (description.type === 'offer') {
            await this.peerConnection.setLocalDescription();

            console.log(this.peerConnection.localDescription);
            this.webSocket.send(
              JSON.stringify({
                description: this.peerConnection.localDescription,
              })
            );
          }
        } else if (candidate) {
          try {
            await this.peerConnection.addIceCandidate(candidate);
          } catch (err) {
            console.error(err);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
  };

  private _initLocalVideo = async () => {
    try {
      const localVideo = this.localVideo.nativeElement as HTMLVideoElement;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      for (const track of stream.getTracks()) {
        this.peerConnection.addTrack(track, stream);
      }

      localVideo.srcObject = stream;
      localVideo.play();
    } catch (err) {
      console.error(err);
    }
  };
}
