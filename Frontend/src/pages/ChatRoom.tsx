import { LogoutIcon, SendIcon, ShareIcon } from "../assets/icons"
import bg from '../assets/diamond-sunset.png'
import { useEffect, useRef, useState, Dispatch, SetStateAction, MutableRefObject } from "react"
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
const apiUrl = import.meta.env.VITE_BASE_URL;
interface Messages{
    type?:string
    message:string
    userId:string
    name:string
}
export default function ChatRoom() {
    const [name,setName] = useState('Anonymous');
    const [isConnected, setIsConnected] = useState(false);
    const [messages,setMessages] = useState<Messages[]>([
        {
            message: "Welcome to the VibeLine 👋!",
            userId: "system",
            name: "System",
          },
    ]);
    const [userId] = useState<string>(
        "user_" + Date.now() + "_" + Math.floor(Math.random() * 10000)
    );
    const msgRef = useRef<HTMLInputElement | null>(null)
    const {roomId} = useParams();
    const navigate = useNavigate();
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const wsRef = useRef<WebSocket>();
    const [reconnect,setReconnect] = useState(false);
    function leave(){
        navigate('/')
    }
    const share = async () => {
        const url = `${window.location.origin}/chat/${roomId}`;
        try {
          await navigator.clipboard.writeText(url);
          toast.success("Room link copied!",
            {
                style:{
                    width:"auto"
                }
            }
          );
        } catch (err) {
          toast.error("Oops! Couldn't copy the link");
        }
    };
    const handleNameSubmit = () => {
        if (!name.trim()) {
          toast.error("Please enter a name to join the room.");
          return;
        }
        setIsConnected(true);
      };
      
    function sendMessage(message: string) {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: "chat",
                payload: {
                    roomId,
                    userId,
                    message,
                    name
                }
            }));
        } else {
            toast.error("Server is not listening. Attempting to reconnect...")
            setReconnect(!reconnect);
        }
    }
    useEffect(() => {
        // Scroll to the bottom when a new message is added
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);
    useEffect(()=>{
        if (!isConnected) return;
        wsRef.current = new WebSocket(apiUrl);
        wsRef.current.onopen = () => {
            if (wsRef.current) {
                wsRef.current.send(
                  JSON.stringify({
                    type: "join",
                    payload: {
                      roomId,
                      userId,
                      name
                    },
                  })
                );
            }
          };
          wsRef.current.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              if(data.status=="error"){
                toast.error(data.payload.message);
                navigate('/')
              }
              if(data.status=="success" && data.payload.type=="greeting" && data.payload.name!==""){
                if (messages.find((msg) => msg.userId=== data.payload.userId)) return;
                setMessages((prev)=>[...prev,data.payload])
              }
              if(data.status=="success" && data.type=="chat"){
                setMessages((prev) => [...prev, data.payload]);
              }
            } catch (error) {
              alert("Error parsing WebSocket message:");
            }
          };
        //   wsRef.current.onclose = () =>console.log("WebSocket connection closed");
          wsRef.current.onerror = () => {
            // console.error("WebSocket error:", error);
            setTimeout(() => {
              wsRef.current = new WebSocket(apiUrl); // Reconnect after 2 seconds
            }, 2000);
          };
          return () => {
            if (wsRef.current) {
              wsRef.current.close();
            }
          };

    },[roomId,isConnected,reconnect]);
  return isConnected ? (
    <div className="w-screen h-screen flex flex-col overflow-hidden">
      <Topbar name={name} roomId={roomId} setName={setName} leave={leave} share={share}/>
      <div className="flex-1 w-full p-4 bg-cover bg-center overflow-y-auto flex flex-col gap-4" style={{backgroundImage:`url(${bg})`}}>
        {
            messages.map((msg, index) => (
                <div key={index}  className={`flex ${
                    msg.type === "greeting"
                      ? "justify-center"
                      : msg.userId === userId
                      ? "justify-end"
                      : "justify-start"
                  }`}>
                    <Bubble greeting={msg.type==="greeting"} color={msg.userId===userId} text={msg.message} name={msg.name} />
                </div>
            ))
        }
        <div ref={messagesEndRef} />
      </div>
      <Bottombar msgRef={msgRef} sendMessage={sendMessage}/>
    </div>
  ):(
    
    <div className="w-screen h-screen flex items-center text-anta justify-center bg-custom-gradient overflow-hidden">
      <div className="text-anta flex justify-center flex-col gap-10 sm:flex sm:flex-row text-center p-10">
        <input
          type="text"
          placeholder="Enter your name"
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>)=>{
            if (event.key === "Enter") {
                handleNameSubmit();
              }
          }}
          className="text-white text-center text-lg p-2 rounded-xl h-16 outline-none bg-[#312143]"
        />
        <button
          onClick={handleNameSubmit}
          className="px-4 py-2 bg-[#5D409C] h-16 text-white rounded-xl"
        >
          Join Room
        </button>
      </div>
    </div>
  );

}
interface TopbarProps{
    setName:Dispatch<SetStateAction<string>>
    name:string
    leave:()=>void
    share:()=>void
    roomId:string | undefined
}
function Topbar(props: TopbarProps){
    return <div className="border-b border-black sticky top-0 z-10 bg-[#1D142E] w-screen h-20 sm:h-24 font-anta text-white">
        <div className="w-[90%] mx-auto py-2 sm:py-4 flex justify-between items-center"> 
            <div>
                <div className="text-sm sm:text-2xl">Room Id: {props.roomId}</div>
                <div className="sm:flex sm:gap-2">
                    <div className="text-xs sm:text-lg"> Chatting as</div>
                    <span>
                        <input
                        value={props.name}
                        onChange={(e)=>{
                            props.setName(e.target.value.trim());
                        }} 
                        type="text"
                        placeholder="Anonymous"
                        className="max-w-28 py-1 px-1 text-left text-xs sm:text-base sm:text-center bg-[#271e3f] rounded-sm sm:rounded-lg" >
                        </input>
                    </span>
                </div>
            </div>
            <div className="flex gap-2 sm:gap-5">
                <span 
                onClick={props.leave}
                className="flex items-center gap-2 text-xs sm:text-base bg-[#5D409C] py-2 px-2 sm:px-4 rounded-lg hover:bg-[#461f98] cursor-pointer">
                    <LogoutIcon/>
                    Leave
                </span>
                <span 
                onClick={props.share}
                className="flex items-center gap-2 text-xs sm:text-base bg-[#8A70BF] py-2 px-4 rounded-lg hover:bg-[#6637c3] cursor-pointer">
                    <ShareIcon/>
                    Share
                </span>
            </div>
        </div>

    </div>
}
interface Bottomprops{
    msgRef : MutableRefObject<HTMLInputElement | null>
    sendMessage: (message: string) => void
}
function Bottombar(props: Bottomprops) {
    const handleSendMessage = () => {
      if (props.msgRef.current && props.msgRef.current.value.trim() !== "") {
        props.sendMessage(props.msgRef.current.value.trim());
        props.msgRef.current.value = ""; // Clear the input box after sending
      }
    };
  
    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        handleSendMessage();
      }
    };
  
    return (
      <div className="w-full h-20 border-t border-black bg-[#1D142E] flex text-white items-center">
        <input
          ref={props.msgRef}
          placeholder="Type a message"
          className="px-4 py-2 text-left border-none bg-[#1D142E] outline-none w-full h-12 sm:h-16 text-base sm:text-lg"
          onKeyDown={handleKeyPress} // Trigger send message on Enter
        />
        <div
          onClick={handleSendMessage} // Send message on button click
          className="h-10 p-2 px-4 rounded-lg cursor-pointer bg-[#5D409C] flex gap-3 items-center mr-6"
        >
          <span className="font-medium font-anta">Send</span>
          <SendIcon />
        </div>
      </div>
    );
  }
  
interface BubbleProps{
    text:string
    name:string
    greeting?:Boolean
    color:Boolean
}
function Bubble(text:BubbleProps){
    if(text.greeting){
        return <div className="bg-gray-600 p-2 rounded-xl text-white w-fit font-anta text-sm sm:text-base">{text.name} joined</div>
    }
    return <div className={`${text.color?"bg-violet-300":"bg-white"} flex flex-col gap-1 sm:gap-3 px-3 sm:px-6 py-2 h-fit text-sm sm:text-xl max-w-[50%] rounded-2xl shadow-md`} >
        <div className="text-gray-600 font-anta text-sm sm:text-base flex flex-wrap">{text.name}</div>
        <div className="font-serif break-words">{text.text}</div>
      
    </div>
  }