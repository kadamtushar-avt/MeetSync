import React, { useEffect, useRef, useState } from "react";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { io } from "socket.io-client";
import styles from "../styles/videoComponent.module.css"
import { Badge, IconButton } from "@mui/material";
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import { useNavigate } from "react-router-dom";
import PeopleIcon from '@mui/icons-material/People';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import server from "../environment";


const server_url = server;

let connections = {};

const peerConfigConnections = {
    'iceServers':[
        {"urls":"stun:stun.l.google.com:19302"}
    ]
}

export default function VideoMeet(){
    const socketRef = useRef(); //for which socket
    let socketIdRef = useRef();//it is our socketId
    let routeTo = useNavigate();

    let localVideoRef = useRef();// we can see our videos here for others video we will define array
    
    let [videoAvailable,setVideoAvailable] = useState(true) //first we will check permission from harware video is available or not
    let [audioAvailable,setAudioAvailable] = useState(true)

    let [video,setVideo] = useState(false); //video icon on frontend is off then we will show blank video for that
    
    let[audio,setAudio] = useState();

    let [screen,setScreen] = useState(); //for screen sharing

    let [showModal,setModal] = useState(false); //for popup options
    

    let[screenAvailable,setScreenAvailable] = useState();//check screen sharing is available or not

    const [message, setMessage] = useState("");
    let[messages,setMessages] = useState([]) //handle the state of all messages

    let[newMessages,setNewMessages] = useState(0);

    let [askedForUsername,setAskedForUsername] = useState(true)//when someone is login from guest

    let[username,setUsername] = useState("")

    const videoRef = useRef([])

    let[videos,setVideos] = useState([])


    //todo
    // if(isChrome() === false){

    // }

    const getPermissions = async()=>{
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({video:true})//asking for video permission

            if(videoPermission){
                setVideoAvailable(true)
            }else{
                setVideoAvailable(false)
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({audio:true})//asking for video permission

            if(audioPermission){
                setAudioAvailable(true)
            }else{
                setAudioAvailable(false)
            }

            if(navigator.mediaDevices.getDisplayMedia){ //screen sharing
                setScreenAvailable(true)
            }else{
                setScreenAvailable(false)
            }


            if(videoAvailable || audioAvailable){
                const userMediaStream = await navigator.mediaDevices.getUserMedia({video:videoAvailable,audio:audioAvailable}) //this is the actual stream which we are going to share everyehere through webrtc
                
                if(userMediaStream){ //first we have taken userMediaStream now we setting it to local media stream
                    window.localStream = userMediaStream; 
                    if(localVideoRef.current){
                        localVideoRef.current.srcObject = userMediaStream;//here we are going to initialize streams here
                    }
                }
            }

        } catch (error) {
            console.log(error)
        }
    }

    useEffect(()=>{
        getPermissions();
    },[])



    let getUserMediaSuccess = (stream) =>{ // if video is off then this function will send only audio stream or if i have muted then it will send only video stream
        try {
            
            window.localStream.getTracks().forEach(track =>track.stop())


        } catch (error) {
            console.log(error)
        }
        window.localStream = stream;
        localVideoRef.current.srcObject = stream;

        for(let id in connections){
            if(id === socketIdRef.current) continue;

            connections[id].addStream(window.localStream);

            connections[id].createOffer().then((description)=>{
                connections[id].setLocalDescription(description)
                .then(()=>{
                    socketRef.current.emit("signal",id,JSON.stringify({"sdp":connections[id].localDescription}))
                }).catch(e=>console.log(e))
            })


        }

        stream.getTracks().forEach(track=>track.onended = ()=>{
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoRef.current.srcObject.getTracks()
                tracks.forEach(track=>track.stop())
            } catch (error) {
                console.log(error)
            }

            //todo BlackSilence

            let blackSilence = (...args)=> new MediaStream([black(...args),silence()])
            window.localStream = blackSilence();
            localVideoRef.current.srcObject = window.localStream;

            for(let id in connections){
                connections[id].addStream(window.localStream)
                connections[id].createOffer().then((description)=>{
                    connections[id].setLocalDescription(description)
                    .then(()=>{
                        socketRef.current.emit("signal",id,JSON.stringify({"sdp":connections[id].localDescription}))
                    })
                })
            }

        })

    }

    let silence = ()=>{
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator() //oscillator generates a constant tone;

        let dst = oscillator.connect(ctx.createMediaStreamDestination());

        oscillator.start();
        ctx.resume()

        return Object.assign(dst.stream.getAudioTracks()[0],{enabled:false})


    }

    let black = ({width=640,height=400} = {})=>{
        let canvas = Object.assign(document.createElement("canvas"),{width,height});

        canvas.getContext("2d").fillRect(0,0,width,height);
        let stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0],{enabled:false})
    }  


    let getUserMedia = ()=>{
        if(video && videoAvailable || audio && audioAvailable){
            navigator.mediaDevices.getUserMedia({video:video,audio:audio})
            .then(getUserMediaSuccess) //todo getuser media success
            .then((stream)=>{})
            .catch((error)=>{console.log(error)})
        }else{
            try {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track=>track.stop())
            } catch (error) {
                
            }
        }
    }

    useEffect(()=>{ //when it will change the automatically getUserMedia() run
        if(video !== undefined && audio !== undefined){
           getUserMedia() 
        }
    },[audio,video])

    //todo
    let gotMessageFromServer = (fromId,message)=>{
        let signal = JSON.parse(message)

        if(fromId !== socketIdRef.current.id){
            if(signal.sdp){
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(()=>{

                    if(signal.sdp.type === 'offer'){
                        connections[fromId].createAnswer().then((description)=>{
                            connections[fromId].setLocalDescription(description).then(()=>{
                                socketRef.current.emit("signal",fromId,JSON.stringify({"sdp":connections[fromId].localDescription}))
                            }).catch(e=>console.log(e))
                        }).catch(e=>console.log(e))
                    }
                }).catch(e=>console.log(e))

            }

            if(signal.ice){
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e=>console.log(e))
            }
        }
    }

    //todo
    let addMessage = (data,sender,socketIdSender)=>{
         setMessages((prevMessages)=>[
            ...prevMessages,{
                sender:sender,data:data
            }
         ])

         if(socketIdSender !== socketIdRef.current){
            setNewMessages((prevMessages)=>prevMessages+1)
         }
    }

    let connectToSocketServer = ()=>{
        socketRef.current = io.connect(server_url,{secure:false})
        
        socketRef.current.on("signal",gotMessageFromServer) //in backend the signal was emiiting and here it is connecting

        socketRef.current.on("connect",()=>{
            socketRef.current.emit("join-call",window.location.href)

            socketIdRef.current = socketRef.current.id

            socketRef.current.on("chat-message",addMessage)

            socketRef.current.on("user-left",(id)=>{
                setVideos((videos)=>videos.filter((video => video.socketId !== id))) //get all the videos except that particular id
            })

            socketRef.current.on("user-joined",(id,clients)=>{
                clients.forEach((socketListId)=>{

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections) //here we are creating a peer connection and passing stun server

                    connections[socketListId].onicecandidate = (event)=>{ // ice is an protocol(interactive connectivity establishment) this code is used to establish direct connection
                        if(event.candidate != null){
                            socketRef.current.emit("signal",socketListId,JSON.stringify({'ice':event.candidate}))
                        }
                    }

                    connections[socketListId].onaddstream = (event)=>{
                        let videoExists = videoRef.current.find(video => video.socketId === socketListId)

                        if(videoExists){
                            setVideos(videos=>{
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? {...video,stream:event.stream}:video //if socket id and listid matches then we want the new stream 
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            })
                        }else{
                            let newVideo = {
                                socketId:socketListId,
                                stream:event.stream,
                                autoPlay:true,
                                playsinline:true
                            }

                            setVideos(videos=>{
                                const updatedVideos = [...videos,newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;

                            })
                        }
                    };

                    if(window.localStream !== undefined&& window.localStream !== null){
                        connections[socketListId].addStream(window.localStream)
                    }else{
                        //when we turn off video then this black silence will come
                        //todo
                        let blackSilence = (...args)=> new MediaStream([black(...args),silence()])
                        window.localStream = blackSilence();
                        connections[socketListId].addStream(window.localStream);
                    }

                })

                if(id === socketIdRef.current){
                    for(let id2 in connections){
                        if(id2 === socketIdRef.current)continue

                        try {
                            connections[id2].addStream(window.localStream)
                        } catch (error) {
                            
                        }
                        connections[id2].createOffer().then((description)=>{
                            connections[id2].setLocalDescription(description)
                            .then(()=>{
                                socketRef.current.emit("signal",id2,JSON.stringify({"sdp":connections[id2].localDescription})) //sdp :-session description and the letter generated here is going there and when this things gets exchanges then the connection will be established
                            })
                            .catch(e=>console.log(e))
                        })
                    }
                }

            })

        })
    }


    let getMedia = ()=>{
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    }
    let connect = ()=>{
        setAskedForUsername(false)
        getMedia();
    }

    let handleVideo = ()=>{
        setVideo(!video);
    }

    let handleAudio = ()=>{
        setAudio(!audio)
    }

    let handleEndCall = ()=>{
        try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach(track=>track.stop())
        } catch (error) {
            
        }
        routeTo("/home")
    }




    let getDisplayMediaSuccess = (stream)=>{

        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (error) {
            console.log(error)
        }

        window.localStream = stream;
        localVideoRef.current.srcObject = stream;

        for(let id in connections){
            if(id === socketIdRef.current) continue;

            connections[id].addStream(window.localStream)
            connections[id].createOffer().then((description)=>{
                connections[id].setLocalDescription(description)
                .then(()=>{
                    socketRef.current.emit("signal",id,JSON.stringify({"sdp":connections[id].localDescription}))
                })
                .catch(e =>console.log(e))
            })
        }

        stream.getTracks().forEach(track=>track.onended = ()=>{
            setScreen(false)

            try {
                let tracks = localVideoRef.current.srcObject.getTracks()
                tracks.forEach(track=>track.stop())
            } catch (error) {
                console.log(error)
            }

            //todo BlackSilence

            let blackSilence = (...args)=> new MediaStream([black(...args),silence()])
            window.localStream = blackSilence();
            localVideoRef.current.srcObject = window.localStream;

            getUserMedia();

        })

    }

    let getDisplayMedia = ()=>{
        if(screen){
            if(navigator.mediaDevices.getDisplayMedia){
                navigator.mediaDevices.getDisplayMedia({video:true,audio:true})
                .then(getDisplayMediaSuccess)
                .then((stream)=>{})
                .catch(e=>console.log(e))

            }
        }
    }

    useEffect(()=>{
        if(screen !== undefined){
            getDisplayMedia();
        }
    },[screen])

    let handleScreen = ()=>{
        setScreen(!screen)
    }

    let handleChat = ()=>{
        setModal(!showModal)
    }


    let sendMessage = ()=>{
        socketRef.current.emit("chat-message",message,username);
        setMessage("")
    }


    return(
        <div>
            {askedForUsername === true ?
               <div className={styles.lobbyContainer}>

                    <div className={styles.lobbyCard}>

                        <div className={styles.previewSection}>

                            <video
                                ref={localVideoRef}
                                autoPlay
                                muted
                                className={styles.previewVideo}
                            />

                        </div>

                        <div className={styles.joinSection}>

                            <h2>Ready to join?</h2>

                            <p>
                                Enter your name before joining the meeting.
                            </p>

                            <TextField
                                fullWidth
                                label="Your Name"
                                variant="outlined"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />

                            <Button
                                variant="contained"
                                className={styles.joinMeetingBtn}
                                onClick={connect}
                            >
                                Join Meeting
                            </Button>

                        </div>

                    </div>

                </div>:

                <div className={styles.meetVideoContainers}>

                    {showModal ? <div className={styles.chatRoom}>
                            <div className={styles.chatContainer}>
                                <h1>Chat</h1>

                                <div className={styles.chattingDisplay}>

                                    { messages.length > 0 ? messages.map((item,index)=>{
                                        return(
                                            <div key={index} style={{marginBottom:"20px"}}>
                                                <p style={{fontWeight:"bold"}}>{item.sender}</p>
                                                <p> {item.data}</p>
                                            </div>
                                        )
                                    }):<p>No messages yet</p>}

                                </div>

                                <div className={styles.chattingArea}>
                                    
                                    <TextField value={message} onChange={e=> setMessage(e.target.value)} id="outlined-basic" label="Enter your Chat" variant="outlined" />
                                    <Button variant="contained" onClick={sendMessage}>Send</Button>
                                </div>
                                
                            </div>

                    </div>:<></>}

                    

                    <div className={styles.buttonContainer}>

                        <IconButton onClick={handleVideo} style={{color:"white"}}>
                            {(video===true) ? <VideocamIcon/>: <VideocamOffIcon/>}
                        </IconButton>


                        <IconButton onClick={handleEndCall}  style={{color:"red"}}>
                            <CallEndIcon/>
                        </IconButton>

                        <IconButton onClick={handleAudio} style={{color:"white"}}>
                            {audio === true ? <MicIcon/>:<MicOffIcon/>}
                        </IconButton>

                        {screenAvailable === true ? 
                            <IconButton onClick={handleScreen} style={{color:"white"}}>
                                {screen === true ? <ScreenShareIcon/> : <StopScreenShareIcon/> }
                            </IconButton> : <></>
                        }

                        <Badge badgeContent={newMessages} max={999} color="secondary">
                            <IconButton onClick={handleChat} style={{color:"white"}}>
                               <ChatIcon/>
                            </IconButton>
                        </Badge>
                    </div>

                    <video className={styles.meetUserVideo} ref={localVideoRef} autoPlay muted></video>

                    <div className={styles.conferenceView}>

                            {videos.map((video)=>(
                                <div  key={video.socketId}>
                                
                                        <video 
                                            data-socket={video.socketId}
                                            ref={ref=>{
                                                if(ref && video.stream){
                                                    ref.srcObject = video.stream;
                                                }
                                            }}
                                            autoPlay
                                        >
                                        
                                        </video>
                                </div>
                            ))} 

                    </div>  

                </div>             
                
            }
        </div>
    )
}
