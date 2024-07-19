new VConsole()

// const signalingServerUrl = 'ws://localhost:8666/webrtc/ws';
const signalingServerUrl = 'wss://api.haokur.com/webrtc/ws';
const ws = new WebSocket(signalingServerUrl);

// 当 WebSocket 连接打开时
ws.onopen = () => {
    console.log('WebSocket 连接已建立');
    initAll();
};

let peerConnection = new RTCPeerConnection();
let localStream;
document.getElementById("startCall").addEventListener('click', async () => {
    // peerConnection.addStream(localStream)

    // 生成offer
    const offer = await peerConnection.createOffer({
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 1,
    });

    // 在本地设置offer
    await peerConnection.setLocalDescription(offer);

    // 发送 offer 给信令服务器
    ws.send(JSON.stringify({ type: 'offer', offer: peerConnection.localDescription }));
});


// 当收到消息时
ws.onmessage = async (event) => {
    const message = JSON.parse(event.data);
    switch (message.type) {
        case 'offer':
            // await handleOffer(message.offer);
            break;
        case 'answer':
            // await handleAnswer(message.answer);
            // peerConnection.setRemoteDescription(new RTCSessionDescription(message.sdp));
            await peerConnection.setRemoteDescription(new RTCSessionDescription(message.answer));
            break;
        case 'candidate':
            await handleCandidate(message.candidate);
            break;
        default:
            console.warn('未知消息类型:', message.type);
    }
};

// 处理 ICE 候选
const handleCandidate = async (candidate) => {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
};

// 创建 RTCPeerConnection 实例和 getUserMedia
function initAll() {
    // 获取用户媒体设备
    navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
            const localVideo = document.getElementById('local-video');
            if (localVideo) {
                localVideo.srcObject = stream;
            }
            // localStream = stream

            stream.getTracks().forEach(track => {
                console.log(track, "recorder.js::51行");
                peerConnection.addTrack(track, stream);
            });
        })
        .catch((error) => {
            console.error('getUserMedia error:', error);
        });
}
