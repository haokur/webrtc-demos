new VConsole()

// 信令服务器的地址
// const signalingServerUrl = 'ws://localhost:8666/webrtc/ws';
const signalingServerUrl = 'wss://api.haokur.com/webrtc/ws';
const ws = new WebSocket(signalingServerUrl);


// 当 WebSocket 连接打开时
ws.onopen = () => {
    console.log('WebSocket 连接已建立');
};

// 当收到消息时
ws.onmessage = async (event) => {
    const message = JSON.parse(event.data);

    switch (message.type) {
        case 'offer':
            await handleOffer(message.offer);
            break;
        case 'answer':
            await handleAnswer(message.answer);
            break;
        case 'candidate':
            await handleCandidate(message.candidate);
            break;
        default:
            console.warn('未知消息类型:', message.type);
    }
};

document.getElementById("play-btn").addEventListener("click", () => {
    const remoteVideo = document.getElementById('remote-video');
    console.log(remoteVideo,"watcher.js::32行");
    remoteVideo.play();
})

let peerConnection;
// 创建 RTCPeerConnection 并处理 ICE 候选
const createPeerConnection = () => {
    console.log('createPeerConnection://');
    peerConnection = new RTCPeerConnection();

    // 监听 ICE 候选并发送到信令服务器
    peerConnection.onicecandidate = (event) => {
        console.log('onicecandidate://', event);
        if (event.candidate) {
            ws.send(JSON.stringify({ type: 'candidate', candidate: event.candidate }));
        }
    };

    // 监听远程流并将其添加到本地 video 元素中
    peerConnection.ontrack = (event) => {
        const remoteVideo = document.getElementById('remote-video');
        console.log('ontrack://', remoteVideo, event);
        if (remoteVideo) {
            remoteVideo.srcObject = event.streams[0];
            console.log(remoteVideo, event.streams[0], "watcher.js::50行");
        }
    };

    console.log(peerConnection, "watcher.js::54行");

    // peerConnection.onaddstream = (event) => {
    //     document.querySelector('#remote-video').srcObject = event.stream;
    //     console.log(event, "watcher.js::55行");
    // }
};

// 处理 SDP offer
const handleOffer = async (offer) => {
    console.log('handleOffer://', offer);
    createPeerConnection();
    await peerConnection.setRemoteDescription(offer);

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    // 发送 SDP answer 到信令服务器
    ws.send(JSON.stringify({ type: 'answer', answer: peerConnection.localDescription }));
    console.log('handleOffer-end://');
};

// 处理 SDP answer
const handleAnswer = async (answer) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
};

// 处理 ICE 候选
const handleCandidate = async (candidate) => {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
};