import React, {Component} from "react";
import "../../styles.css"
import Nav from "./nav";
import Incoming from "./incoming";
import Outgoing from "./outgoing";
import Conversation from "./conversation";
import SearchResult from "./searchResult";
import {Redirect, withRouter} from "react-router";
import * as actions from "../../store/actions/auth"
import {connect} from "react-redux";
import $ from "jquery"

class ChatBox extends Component {
    constructor() {
        super();
        this.state = {
            user: "",
            profilePicUrl: "",
            roomNames: [],
            rooms:{},
            activeRoom: "",
            memo:"",
            typing: false,
            chats: [],
            search: [],
            searchItem: "",
            sub: true,
        }
        const loc = window.location
        // this.rooms_url= 'http://localhost:8000/rooms/'
        // this.chats_url = `http://localhost:8000/chats/`
        // this.user_url= 'http://localhost:8000/authenticate/'
        this.user_url = `/authenticate/`
        this.rooms_url = `/rooms/`
        this.chats_url = `/chats/`
        this._isMounted = false
        this.logout = this.logout.bind(this)
        this.clear = this.clear.bind(this)
        this.search = this.search.bind(this)
        this.fetchUser = this.fetchUser.bind(this)
        this.fetchConversations = this.fetchConversations.bind(this)
        this.makeConversation = this.makeConversation.bind(this)
        this.selectConversation = this.selectConversation.bind(this)
        this.selectSearchItem = this.selectSearchItem.bind(this)
        this.makeChat = this.makeChat.bind(this)
        this.fetchChats = this.fetchChats.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.addChat = this.addChat.bind(this)
    }
    componentWillUnmount() {
        this._isMounted = false
        const unmount_time = new Date()
        localStorage.setItem("unmount_time", unmount_time)
    }

    componentDidMount() {
        const diff = new Date().getTime() - new Date(localStorage.getItem("unmount_time")).getTime()
        if(diff > 18000000) this.logout()
        this._isMounted = true
        if(this._isMounted){
            this.fetchConversations()
            this.fetchUser()
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const messages = $("#messageSpace")
        messages.animate({
            scrollTop: messages.get(0).scrollHeight
        }, 10);
    }

    logout(){
        this.props.socket.send(JSON.stringify({
            'type': 'auth',
            'user':this.state.user,
            'room_names': this.state.roomNames
        }))
        this.props.onLogout()
    }
    clear(){
        this.setState({activeRoom: ""})
        this.setState({chats: []})
        this.setState({memo: ""})
        this.setState({search: []})
        this.setState({searchItem: ""})
    }
    search(value){
        this.clear()
        this.props.socket.send(JSON.stringify({
            "type": "search",
            "user": this.state.user,
            "key": value
        }))
    }

    profile(event) {
        event.preventDefault()
    }

    handelError(response){
        if (!response.ok){
            throw Error(response.statusText)
        }
        return response.json()
    }

    fetchConversations() {
        fetch(this.rooms_url, {
            headers: {
                Authorization: `Token ${localStorage.getItem("token")}`
            }
        }
        ).then(res => res.json())
            .then(data => {
                const rooms = data.rooms
                const newNames = []
                const newRooms = {}
                for (let room in rooms) {
                    const rm = rooms[room]
                    const name = rm['roomName1']
                    newNames.push(name)
                    newRooms[name] = rm
                }
                if(this._isMounted) {
                    this.setState({user: data.user})
                    this.setState({roomNames: newNames})
                    this.setState({rooms: newRooms})
                    this.props.socket.send(JSON.stringify({
                        'type': 'sub',
                        'room_names': newNames,
                        'email': data.user
                    }))
                }
            }).catch(error => {
            console.log(error)
        })
    }
    handleErr(res) {
            if (res.status === 400){
                throw Error(res.statusText)
            }
            return res.json()
        }
    fetchUser() {
        fetch(this.user_url, {
            headers: {
                Authorization: `Token ${localStorage.getItem("token")}`
            }
        }).then(this.handleErr)
            .then(data => {
                if (this._isMounted) {
                    this.setState({
                        profilePicUrl: data['profile_pic'],
                         // profilePicUrl: `http://localhost:8000${data['profile_pic']}`,
                        email: data['email'],
                    })
                }
            }).catch(err => console.log(err))
    }
    fetchChats(roomName){
        fetch(this.chats_url + `${roomName}/`, {
            headers:{
                Authorization: `Token ${localStorage.getItem("token")}`
            }
        })
            .then(res => res.json())
            .then(data =>{
                const chats = data
                const newChats = []
                for (let chat in chats) {
                    newChats.push(chats[chat])
                }
                if(this._isMounted){
                    this.setState({chats: newChats})
                }
            }).catch(error => {
            console.log(error)
        })
    }

    makeConversation(name) {
        const room = this.state.rooms[name]
        if(room) {
            const date = new Date(room.date)
            const props = {
                "name": name,
                "email": room.other_email,
                "contact": room.other_name,
                "status": room.other_status,
                "pic_url": room.other_profilepic,
                "select": this.selectConversation,
                "date": date
            }
            return <span key={name}><Conversation props={props}/></span>
        }
    }
    selectConversation(name){
        this.fetchChats(name)
        this.setState({activeRoom: name})
    }
    makeChat(chat){
        const date = new Date(chat.date)
        let pic_url = null
        try {
            pic_url = this.state.rooms[this.state.activeRoom][`other_profilepic`]
        }catch (e){
            console.log(e)
        }
        if(chat.User === this.state.user){
            const props = {
                'memo': chat.memo,
                'date': date,
                'pic_url': this.state.profilePicUrl
            }
            return <span key={chat.id}><Outgoing props={props}/></span>
        }else {
            const props = {
                'memo': chat.memo,
                'date': date,
                'pic_url': pic_url
            }
            return <span key={chat.id}><Incoming props={props}/></span>
        }
    }
    makeSearchItem(item){
        const props = {
                'email': item['email'],
                'contact': item['name'],
                'pic_url': item['pic_url'],

                "select": this.selectSearchItem,
            }
        return <span key={item['email']}><SearchResult props={props}/></span>
    }
    selectSearchItem(item){
        for(let room in this.state.rooms){
            if(this.state.rooms[room]['other_email'] === item){
                this.fetchChats(room)
                this.setState({activeRoom: room})
            }
        }
        this.setState({searchItem: item})
    }

    handleChange(event){
        const {name, value} = event.target
        this.setState({[name]: value})
    }
    handleSubmit(event){
        event.preventDefault()
        if (this.state.memo.length > 0) {
            const checkName = () => {
                return this.state.activeRoom && this.state.activeRoom in this.state.rooms
            }
            const receiver = checkName()?
                            this.state.rooms[this.state.activeRoom]['other_email']
                            : this.state.searchItem
            const room_name = this.state.activeRoom || this.state.searchItem
            const data = {
                "type": "message",
                "User": this.state.user,
                "Receiver": receiver,
                "room_name": room_name,
                "memo": this.state.memo,
                "new": !this.activeRoom? true: ""
            }
            this.props.socket.send(JSON.stringify(data))
            this.setState({memo: ""})
        }
        this.setState({search: []})
        this.setState({searchItem: ""})
    }
    addChat(chat) {
        const chats = this.state.chats
        chats.push(chat)
        this.setState({chats: chats})
        const messages = $("#messageSpace")
    }
    sub(){
        this.props.socket.send(JSON.stringify({
            'type': 'sub',
            'room_names': this.state.roomNames,
            'email': this.state.user
        }))
    }

    render(){
        if(this.state.sub){
            this.sub()
            this.setState({sub: false})
        }

        this.props.socket.onmessage = e => {
            const data = JSON.parse(e.data)
            const custom_type = data["custom_type"]
            if (custom_type === "message"){
                const room_name = data["residentRoom"]
                if (room_name in this.state.rooms){
                    this.addChat(data)
                    this.setState({activeRoom: room_name})
                }
                else {
                    if(data['User'] === this.state.user){
                        this.fetchChats(room_name)
                        this.setState({activeRoom: room_name})
                    }
                }
            }else if (custom_type === "search"){
                const matches = data['matches']
                this.setState({search: matches})
            }
            this.fetchConversations()
            this.sub()
        }

        return(
            <div className="chat-body" id="chatBody">
                {
                    !this.props.isAuthenticated ? <Redirect push to={"/auth"} /> : null
                }
                <main className="main" id="main">
                    <div id="chat-box" className="container .rounded">
                        <Nav
                            logout={this.logout}
                            clear={this.clear}
                            search={this.search}
                            serachKey={this.state.searchKey}
                        />
                        <div className="row" style={{"height": "100%"}}>
                            <div id="chatList" className="col-3 hidden-md">
                                <div className="row mb-3 mt-2">
                                    <h3 className="m-auto">
                                        {
                                            !(this.state.activeRoom in this.state.rooms)
                                                ?
                                            "Messages"
                                                :
                                            this.state.rooms[this.state.activeRoom]['other_email']
                                        }
                                    </h3>
                                </div>
                                {
                                    this.state.roomNames.length > 0 || this.state.search.length > 0
                                        ?
                                    !this.state.search.length > 0
                                                ?
                                        this.state.roomNames.map(name => this.makeConversation(name))
                                                :
                                        this.state.search.map(item => this.makeSearchItem(item))
                                        :
                                    null
                                }
                            </div>
                            <div id="currentChat" className="col-9">

                                <div id="messageSpace">
                                    {
                                        this.state.activeRoom
                                            ?
                                        this.state.chats.map(chat => this.makeChat(chat))
                                            :
                                        null
                                    }
                                </div>

                                {
                                    this.state.activeRoom.length > 0 || this.state.searchItem.length > 0
                                        ?
                                    <div className="row" id="formHolder">
                                        <form className="form-inline" id="messageForm" onSubmit={this.handleSubmit}>
                                            <textarea
                                                className="form-control"
                                                placeholder="New Message..."
                                                id="memo"
                                                name="memo"
                                                cols="52"
                                                rows="1"
                                                aria-label="New Message"
                                                value={this.state.memo}
                                                onChange={this.handleChange}
                                            />
                                            <button
                                                type="submit"
                                                className="btn btn-success"
                                                id="msgBtn">
                                                <span><i className="fa fa-paper-plane fa-2x" aria-hidden="true" ></i></span>
                                            </button>
                                        </form>
                                    </div>
                                        :
                                    null
                                }
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onLogout: () => dispatch(actions.logout()),
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ChatBox))