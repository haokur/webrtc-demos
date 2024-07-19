### 基本流程

1. 连接socket
2. 录制方 getUserMedia 获取媒体设备，视频 stream
3. 使用 stream 设置录制者视频预览
4. RTCPeerConnection 实例化，addTrack 添加视频流获取到的 tracks
5. 点击发起按钮，开始与watcher发生链接（在watcher已加载的前提下）
6. peerConnection.createOffer 生成一个 offer，且本地设置存储 offer，然后通过 websocket 转发给 watcher
7. watcher 收到 offer，设置远程offer描述（setRemoteDescription）
8. watcher 生成一个 answer，且本地设置 answer（setLocalDescription），然后通过 websocket 发送给 recorder
9. recorder 收到 answer 信息，设置远程描述信息 peerConnection.setRemoteDescription(new RTCSessionDescription(message.answer));
10. watcher 监听 onicecandidate，在触发时，向 websocket 发送消息，websocket转发给 recorder，recorder 触发 peerConnection.addIceCandidate 调用
11. watcher 监听 ontrack 事件，拿到数据，设置 video 的 srcObject，开始播放

### 测试体验

打开 github 预览地址，一个打开 recorder.html, 一个打开 watcher.html

### TODO

- [ ] 交互优化完善
- [ ] coturn 支持

