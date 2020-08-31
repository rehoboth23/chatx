import React, {Component} from 'react'
import "../../profile.css"
import {Redirect, withRouter} from "react-router";
import {connect} from 'react-redux'
import $ from "jquery"

class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loggedin:null,
            view: "read",
            profilePicUrl: "",
            coverUrl: `url(${require("../../images/default.jpeg")})`,
            name: "",
            email: "",
            phone: "",
            age: "",
            gender: "",
            address: "",
            profilePicUpload: null,
            profilePicExtension: "",
            backup: {},
            changing: false,

        }
        // this.user_url= 'http://localhost:8000/authenticate/'
        this.user_url = `/authenticate/`
        this._isMounted = false
        this.setView = this.setView.bind(this)
        this.onChange = this.onChange.bind(this)
        this.back = this.back.bind(this)
        this.save = this.save.bind(this)
        this.fetchUser = this.fetchUser.bind(this)
        this.handleErr = this.handleErr.bind(this)
        this.profilPicUpload = this.profilPicUpload.bind(this)
        this.getFile = this.getFile.bind(this)
        this.socketSend = this.socketSend.bind(this)
        this.ensureProfilePic = this.ensureProfilePic.bind(this)
    }

    componentDidMount() {
        this._isMounted = true
        if(this._isMounted) {
            this.fetchUser()
        }
    }
    componentWillUnmount() {
        this._isMounted = false
    }

    handleErr(res) {
        if (res.status === 400){
            this.setState({loggedin: false})
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
               if(this._isMounted) {

                   this.setState({
                       profilePicUrl: `http://localhost:8000${data['profile_pic']}`,
                       coverUrl: `url(http://localhost:8000${data['cover_pic']})`,
                       name: data['name'],
                       email: data['email'],
                       age: data['age']?data['age']:"",
                       gender: data['gender']?data['gender']: "",
                       phone: data['phone']?data['phone']: "",
                       address: data['address']?data['address']: ""
                   })
               }
           }).catch(err => console.log(err))
    }

    back(event) {
        if(this.state.view === "edit") {
            event.preventDefault()
            this.setState(this.state.backup)
            this.setState({view: 'read'})
        }
    }

    setView(event){
        event.preventDefault()
        if(this.state.view === "read") {
            this.setState({view: 'edit'})
        }else {
            this.save()
            this.setState({view: 'read'})
        }
        this.setState({changing: false})
    }

    onChange(event) {
        if(!this.state.changing){
            this.setState({backup: this.state, changing: true})
        }
        const {name, value} = event.target
        this.setState({[name]: value})
    }
    ensureProfilePic() {
        if (!this.state.profilePicUpload) {
                setTimeout(() => {
                    this.socketSend()
            }, 500)
        }else {
            return true
        }
    }
    save() {
        this.socketSend()
    }

    socketSend() {
        const signal = this.ensureProfilePic()
        if (signal){
            this.props.socket.send(JSON.stringify({
                'type': 'profile',
                'user': this.state.user,
                'data': this.state,
                'token': localStorage.getItem("token"),
                'picUpload': this.state.profilePicUpload.result
            }))
            this.setState({profilePicUpload: null, profilePicExtension: ""})
        }
    }

    getFile() {
        this.setState({backup: this.state})
        // fileInput is an HTMLInputElement: <input type="file" id="myfileinput" multiple>
        let fileInput = document.getElementById("profileUpload");

        // files is a FileList object (similar to NodeList)
        let files = fileInput.files;

        // object for allowed media types
        let accept = {
        binary : ["image/png", "image/jpeg", "image/jpg"],
        text   : ["text/plain", "text/css", "application/xml", "text/html"]
        };

        let file;
        for (let i = 0; i < files.length; i++) {
            file = files[i];
            // if file type could be detected
            if (file !== null) {
                this.setState({profilePicExtension: /[.]/.exec(file.name)[0] ? /[^.]+$/.exec(file.name)[0] : undefined})
                const tempPic = URL.createObjectURL(file)
                this.setState({profilePicUrl: tempPic})
                const fileReader = new FileReader()
                if (accept.binary.indexOf(file.type) > -1) {
                    // file is a binary, which we accept
                    fileReader.readAsDataURL(file)
                    this.setState({profilePicUpload: fileReader})
                } else if (accept.text.indexOf(file.type) > -1) {
                    // file is of type text, which we accept
                    fileReader.readAsArrayBuffer(file)
                    this.setState({profilePicUpload: fileReader})
                }else {
                    this.setState({profilePicUpload: "nothing"})
                }
            }
        }
    }
    profilPicUpload(event) {
        $("#profileUpload").click()
    }

    render() {
        const fileInput = () => {
            this.getFile()
        }
        const redirectAuth = () => {
            return <Redirect push to={"/auth"} />
        }
        this.props.socket.onmessage = e => {
            const data = JSON.parse(e.data)
            const custom_type = data["custom_type"]
            if (custom_type === "profile"){
                this.fetchUser()
            }

        }
        return(
            <span id="profile">
                {this.state.loggedin === false? redirectAuth(): null}
                <main>
                <div id="chat-box" className="container .rounded">
                    <div className="row" id="NavBar">
                        <nav className="navbar navbar-expand-lg navbar-light bg-light col-12">

                            <a className="navbar-brand" href=".">
                                <img src={require("../../images/chatx.png")} alt="logo" id="logo"/>
                                ChatX
                            </a>
                            <button className="navbar-toggler" type="button" data-toggle="collapse"
                                    data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                                    aria-expanded="false" aria-label="Toggle navigation">
                                <span className="navbar-toggler-icon"/>
                            </button>
                            <div className="collapse navbar-collapse" id="navbarSupportedContent">
                                <ul className="navbar-nav ml-auto">
                                    <li className="nav-item" onClick={this.back}>
                                        <a className="nav-link btn btn-primary" href="/chat" style={{"color": "yellow"}}>Back</a>
                                    </li>
                                    <li className="nav-item" onClick={this.setView}>
                                        <a className="nav-link btn btn-primary" href="view" style={{"color": "yellow"}}>{
                                            this.state.view === "read"
                                                ?
                                            "Edit"
                                                :
                                            "Save"
                                        }</a>
                                    </li>
                                </ul>
                            </div>
                        </nav>
                    </div>
                    <div className="row" style={{"height": "100%", "backgroundColor": "#d4e4ec", "overflow": "scroll"}}>
                        <div className="col">
                            <div>
                            <div id="cover" className="row justify-content-center" style={{"backgroundColor": "red", "backgroundImage": this.state.coverUrl}}>
                                <div className="imgHolder" id="profileImg">
                                    <img src={this.state.profilePicUrl} alt="profile pic" className="rounded-circle" />
                                    {
                                        this.state.view === "read"
                                            ?
                                        null
                                            :
                                        <>
                                            <button type='file' className="rounded-circle" onClick={this.profilPicUpload}>
                                                <i className="fa fa-camera fa-2x"/>
                                            </button>
                                            <input id="profileUpload" type='file' hidden onChange={fileInput}/>
                                        </>
                                    }

                                </div>
                            </div>
                            </div>
                            <div id="infoHolder" className="row mt-4 mb-1 ml-auto">
                                <div className="col info-holder">
                                    {
                                        this.state.view === "read"
                                            ?
                                        <div className={"input-group col"} style={{"width": "auto"}}>
                                            <div className={"input-group-prepend"}>
                                                <b id="namelbl" className="input-group-text">Name:</b>
                                            </div>
                                            <input
                                                readOnly
                                                onChange={this.onChange}
                                                type="text"
                                                aria-describedby={"namelbl"}
                                                value={this.state.name}
                                                name="name"
                                                className={"form-control"}/>
                                        </div>
                                            :
                                        <div className={"input-group col"} style={{"width": "auto"}}>
                                            <div className={"input-group-prepend"}>
                                                <b id="namelbl" className="input-group-text">Name:</b>
                                            </div>
                                            <input
                                                type="text"
                                                aria-describedby={"namelbl"}
                                                onChange={this.onChange}
                                                placeholder={"Name"}
                                                name="name"
                                                value={this.state.name}
                                            />
                                        </div>
                                    }

                                </div>
                                <div className="col info-holder">
                                    {
                                        this.state.view === "read"
                                            ?
                                        <div className={"input-group col"} style={{"width": "auto"}}>
                                            <div className={"input-group-prepend"}>
                                                <b id="emaillbl" className="input-group-text">Email:</b>
                                            </div>
                                            <input
                                                readOnly
                                                onChange={this.onChange}
                                                type="text"
                                                aria-describedby={"emaillbl"}
                                                value={this.state.email}
                                                name="email"
                                                className={"form-control"}/>
                                        </div>
                                            :
                                        <div className={"input-group col"} style={{"width": "auto"}}>
                                            <div className={"input-group-prepend"}>
                                                <b id="emaillbl" className="input-group-text">Email:</b>
                                            </div>
                                            <input
                                                onChange={this.onChange}
                                                type="text"
                                                placeholder={"example@mail.com"}
                                                aria-describedby={"emaillbl"}
                                                value={this.state.email}
                                                name="email"/>
                                        </div>
                                    }
                                </div>
                            </div>
                            <div className="row mt-4 mb-1 ml-auto">
                                <div className="col info-holder">
                                    {
                                        this.state.view === "read"
                                            ?
                                        <div className={"input-group col"} style={{"width": "auto"}}>
                                            <div className={"input-group-prepend"}>
                                                <b id="agelbl" className="input-group-text">Age:</b>
                                            </div>
                                            <input
                                                readOnly
                                                onChange={this.onChange}
                                                type="text"
                                                aria-describedby={"agelbl"}
                                                value={this.state.age}
                                                name="age"
                                                className={"form-control"}/>
                                        </div>
                                            :
                                        <div className={"input-group col"} style={{"width": "auto"}}>
                                            <div className={"input-group-prepend"}>
                                                <b id="agelbl" className="input-group-text">Age:</b>
                                            </div>
                                            <input
                                                type="text"
                                                aria-describedby={"agelbl"}
                                                onChange={this.onChange}
                                                placeholder={"XXX"}
                                                name="age"
                                                value={this.state.age}/>
                                        </div>
                                    }
                                </div>
                                <div className="col">
                                    {
                                        this.state.view === "read"
                                            ?
                                        <div className={"input-group col"} style={{"width": "auto"}}>
                                            <div className={"input-group-prepend"}>
                                                <b id="genderlbl" className="input-group-text">Gender:</b>
                                            </div>
                                            <input
                                                readOnly
                                                onChange={this.onChange}
                                                type="text"
                                                aria-describedby={"genderlbl"}
                                                value={this.state.gender}
                                                name="gender"
                                                className={"form-control"}/>
                                        </div>
                                            :
                                        <div className={"input-group col"} style={{"width": "auto"}}>
                                            <div className={"input-group-prepend"}>
                                                <b id="genderlbl" className="input-group-text">Gender:</b>
                                            </div>
                                            <input
                                                type="text"
                                                aria-describedby={"genderlbl"}
                                                onChange={this.onChange}
                                                placeholder={"???"}
                                                name="gender"
                                                value={this.state.gender}/>
                                        </div>
                                    }
                                </div>
                            </div>
                            <div className="row mt-4 mb-1 ml-auto">
                                <div className="col info-holder">
                                    {
                                        this.state.view === "read"
                                            ?
                                            <div className={"input-group col-5"} style={{"width": "auto"}}>
                                                <div className={"input-group-prepend"}>
                                                    <b id="phonelbl" className="input-group-text">Phone No:</b>
                                                </div>
                                                <input
                                                    readOnly
                                                    onChange={this.onChange}
                                                    type="text"
                                                    aria-describedby={"phonelbl"}
                                                    value={this.state.phone}
                                                    name="phone"
                                                    className={"form-control"}/>
                                            </div>
                                            :
                                            <div className={"input-group col"} style={{"width": "auto"}}>
                                                <div className={"input-group-prepend"}>
                                                    <b id="phonelbl" className="input-group-text">Phone No:</b>
                                                </div>
                                                <input
                                                    type="text"
                                                    aria-describedby={"phonelbl"}
                                                    onChange={this.onChange}
                                                    placeholder={"(XXX)-XXX-XXXX"}
                                                    name="phone"
                                                    value={this.state.phone}/>
                                            </div>
                                    }
                                </div>
                            </div>
                            <div className="row mt-4 mb-1 ml-auto" >
                                {
                                        this.state.view === "read"
                                            ?
                                        <div className={"input-group col-12"}>
                                            <div className={"input-group-prepend"}>
                                                <b id="addresslbl" className="input-group-text">Address:</b>
                                            </div>
                                            <textarea
                                                readOnly
                                                onChange={this.onChange}
                                                aria-describedby={"addresslbl"}
                                                value={this.state.address}
                                                style={{"width": "80%"}}
                                                name="address"
                                                className={"form-control"}/>
                                        </div>
                                            :
                                        <div className={"input-group col-12"}>
                                            <div className={"input-group-prepend"}>
                                                <b id="addresslbl" className="input-group-text">Address:</b>
                                            </div>
                                            <textarea
                                                aria-describedby={"addresslbl"}
                                                onChange={this.onChange}
                                                placeholder={"Some address somewhere in the world that I don't know. I also don't really want to know and don't care to know"}
                                                style={{"width": "80%"}}
                                                name="address"
                                                value={this.state.address}/>
                                        </div>
                                    }

                            </div>
                        </div>
                    </div>
                </div>
            </main>
            </span>
        )
    }
}

const mapStateToProps = state => {
    return {

    }
}

const mapDispatchToProps = dispatch => {
    return {
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Profile))