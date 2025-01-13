import logo from '../assets/logo.png'
import bg from '../assets/Desktop - 1.png'
import { generateRoom } from '../util/generate'
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, MutableRefObject } from 'react';
import { toast } from 'react-toastify';
const apiUrl = import.meta.env.VITE_BASE_URL;
export default function Landing() {
  const wsRef = useRef<WebSocket>();
  const roomId = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  useEffect(()=>{
    wsRef.current = new WebSocket(apiUrl);

    wsRef.current.onopen = () => {
      // console.log("WebSocket connection established");
    };
    wsRef.current.onclose = () => {
      // console.log("WebSocket connection closed");
    };
    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  },[])
  const handleCreate=()=>{
    const room = generateRoom();
    if(wsRef.current && wsRef.current.readyState===WebSocket.OPEN){
      const createRequest = {
        "type":"create",
        "payload":{
          "roomId":room
        }
      }
      wsRef.current.send(JSON.stringify(createRequest));
      // console.log("Req send successfully");
      wsRef.current.onmessage = (e)=>{
        const response = JSON.parse(e.data);
        if(response.status=="error"){
          toast.error(response.message);
        }
        else if(response.status=="success"){
          toast.success(response.message);
          navigate(`/chat/${room}`);
        }
      }
    }
    else{
      toast.error("Server is not listening. Attempting to reconnect...")
      wsRef.current = new WebSocket(apiUrl);
    }
  }
    
  const handleJoin = ()=>{
    if(wsRef.current && wsRef.current.readyState===WebSocket.OPEN){
      if(!roomId.current || roomId.current.value === ""){
        toast.warn('Please enter room id');
        return;
      }
      const joinRequest = {
        "type":"join",
        "payload":{
          "roomId":roomId.current.value.trim()
        }
      }
      wsRef.current.send(JSON.stringify(joinRequest));
      wsRef.current.onmessage = (e)=>{
        const response = JSON.parse(e.data);
        if(response.status=="error"){
          toast.error(response.payload.message);
          return;
        }
        if (roomId.current) {
          navigate(`/chat/${roomId.current.value.trim()}`);
        }
      }
      
    }
    else{
      toast.error("Server is not listening. Attempting to reconnect...")
      wsRef.current = new WebSocket(apiUrl);
    }
  }
  return (
    <div className="h-screen w-screen flex items-center justify-center font-anta text-white overflow-hidden bg-cover bg-center" style={{backgroundImage:`url(${bg})`}}>
      <div className='relative py-20 px-4 sm:px-10 flex flex-col gap-20 items-center justify-center'>
    <div className="absolute rounded-2xl inset-0 bg-black opacity-10 border"></div> {/* Translucent background */}
    <div className="relative z-10 flex flex-col gap-20 items-center justify-center"> {/* Keep Banner and Menu above the translucent background */}
      <Banner />
      <Menu roomId={roomId} handleCreate={handleCreate} handleJoin={handleJoin} />
    </div>
  </div>
    </div>
  )
}
export const Banner = ()=>{
  return <div className='flex flex-col gap-3 sm:gap-6 items-center'>
    <div className='flex items-center gap-4 sm:gap-8'>
      <img className='size-16 sm:size-20' src={logo}/>
      <span className='text-6xl sm:text-7xl'>VibeLine</span>
    </div>
    <span className='text-xl sm:text-2xl'>Chat Smarter, Vibe Together</span>
  </div>
}
interface MenuProps{
  handleJoin:()=>void;
  handleCreate:()=>void;
  roomId:MutableRefObject<HTMLInputElement | null>
}
export const Menu = (props:MenuProps)=>{
  return <div className='w-[300px] sm:w-[400px] flex flex-col gap-16'>
    <input ref={props.roomId} placeholder='Enter Room Id' className='bg-[#312143] rounded-2xl h-16 text-lg sm:text-2xl outline-none w-full text-center py-2 px-3'>
    </input>
    <div>
      <div onClick={props.handleJoin} className='py-2 px-3 text-center rounded-2xl text-lg sm:text-2xl border border-blue-500  cursor-pointer hover:bg-black hover:border-white'>
        Join Room
      </div>
      <div onClick={props.handleCreate} className='mt-4 bg-[#433656] py-2 px-3 text-center rounded-2xl text-lg sm:text-2xl cursor-pointer hover:bg-black hover:border'>
        Create Room
      </div>
    </div>
  </div>
}