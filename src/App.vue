<template>
  <div>
    <div style=""></div>
    <vue-advanced-chat
      height="100vh"
      width="auto"
      :current-user-id="currentUserId"
      :rooms="JSON.stringify(rooms)"
      :rooms-loaded="roomsLoaded"
      :messages="JSON.stringify(messages)"
      :messages-loaded="messagesLoaded"
      @send-message="sendMessage($event.detail[0])"
      @fetch-messages="fetchMessages($event.detail[0])"
    />
    <button class="btn btn-danger btn-xl mt-2" @click="closeChat()">Fechar Chat</button>
    <LoadModal v-if="loadVisible" text="Por favor, aguarde"/>
  </div>
</template>

<script>
import io from "socket.io-client"; //importing the socket.io we installed

import { register } from "vue-advanced-chat";
register();
import LoadModal from "@/components/LoadModal.vue";

export default {
  name: "Chat",
  components: {
    LoadModal,
  },
  data() {
    return {
      socket: {},
      chatid: "",
      username: "",
      userId: "",
      chatActive: false,
      loadVisible: false,
      currentUserId: '1234',
      rooms: [
      ],
      messages: [],
      roomsLoaded: false,
      messagesLoaded: false
    };
  },
  created() {
  },
  mounted() {
    let userid = this.$cookies.get("userID");
    console.log("cookies geted successfuly:"+userid);
    console.log("get old chats");
    this.loadVisible = true;
    this.chatid = userid;
    this.$http
    .get(
      "http://89.117.62.138:8088/api/v1/roomsbyeuser/"
        + this.chatid
    )
    .then(
      (result) => {
        console.log(result);
        if(result.data.responseType=="OK"){
          let rooms = [];
          if(result.data)
          result.data.forEach(room => {
            // let username = ;
            // let userId = result.data.userId;
            // this.userId = userId;
            // this.username = use;rname;

            rooms.push(
              {
                roomId: room.id,
                roomName: room.name,
                // avatar: 'https://66.media.tumblr.com/avatar_c6a8eae4303e_512.pnj',
                users: room.users
                // [
                //   { _id: userId, username: username },
                // ]
              }
            );
            this.roomsLoaded = true;
            let messages = [];
            if(room.messages) {
              room.messages.forEach(msg => {
                console.log(msg);
                if(msg.send){
                  messages.push(
                    {
                      _id: messages.length,
                      content: msg.message,
                      senderId: this.currentUserId,
                      timestamp: new Date(msg.createdAt).toString().substring(16, 21),
                      date: new Date(msg.createdAt).toDateString()
                    }
                  );
                } else {
                  messages.push(
                    {
                      _id: messages.length,
                      content: msg.message,
                      // senderId: msg.,
                      username: username,
                      timestamp: new Date(msg.createdAt).toString().substring(16, 21),
                      date: new Date(msg.createdAt).toDateString(),
                    }
                  ) ;
                }                 
              });
            }
            this.messages = messages;            
          });

          this.rooms = rooms;
          this.loadVisible = false;
        } else {
          this.$router.push({ name: "ChatResult", params: {rs: result.data.responseType} });
        }
      },
      (error) =>{
        console.log("error");
        console.log(error);
        this.roomsLoaded = true;
        this.loadVisible = false;
      }
    );

    this.socket = io("http://localhost:3000");
    //this.socket = io("https://premiummali.mali-tech.co.za:4040", { secure: true, autoConnect: false , reconnection: false});
    this.socket.on("position", (data) => {
    });
    const chatID = this.chatid;
    this.socket.auth = { chatID };
    this.socket.connect();
    this.socket.on("connect", () => {
      this.chatActive = true;
      console.log("connected........");
    });
    this.socket.on("server_to_browser", (res) => {
      if(res.msg=="chat-fechar"){
        this.socket.disconnect();
        this.chatActive = false;
        this.addMessage("== Chat fechado pelo cliente! ==");
      } else {
        console.log("res_server_to_browser");
        this.addMessage(res.msg);
        console.log(res);
      }

      this.socketResponse = res;
    })
    this.socket.on("close_app", (data) => {
      this.socket.disconnect();
    })
  },
  unmounted(){
    this.socket.disconnect();
  },
  methods: {
    fetchMessages({ options = {} }) {
      console.log("fetchMessages");
      // console.log(options);
      this.messagesLoaded = true
    },
    addMessage(msg) {
      console.log("some pushed");
      let message = {};
      if(msg) {
        message = {
          _id: this.messages.length +1,
          content: msg,
          senderId: '4321',
          username: 'John Doe',
          timestamp: new Date().toString().substring(16, 21),
          date: new Date().toDateString(),
        };
      }
      this.messages = [
        ...this.messages,
        message
      ];
    },
    sendMessage(message) {
      if(!this.chatActive){
        return;
      }
      console.log("sendMessages");
      this.messages = [
        ...this.messages,
        {
          _id: this.messages.length,
          content: message.content,
          senderId: this.currentUserId,
          timestamp: new Date().toString().substring(16, 21),
          date: new Date().toDateString()
        }
      ];
      console.log("browser_to_server");
      console.log(message.content);
      this.socket.emit("browser_to_server", {
        msg: message.content,
        to: "server"
      });
    },
    closeChat(){
      this.addMessage("== Chat fechado com sucesso! ==");
      // close_to_server
      this.socket.emit("close_to_server", {some:"some"});
      this.chatActive = false;
    },
  },
};
</script>

<style scoped></style>
