import React, {Component} from "react";
import Auth from "./components/auth/auth";
import ChatBox from "./components/chatMain/chatBox";
import Profile from "./components/profile/profile"
import {connect} from 'react-redux'
import ReconnectingWebSocket from 'reconnecting-websocket'
import {Route, Switch,} from "react-router";
import {BrowserRouter as Router} from "react-router-dom";


class MyRouter extends Component {
    render() {
        const socket = this.props.socket
        socket.onopen = e => {
            console.log('socket open')
        }
        socket.onclose = e => {
            console.log('socket close')
        }
        socket.onerror = e => {
            console.log(e)
        }
        return(
            <Router>
                <Switch>
                    <Route exact path={'/chat'}><ChatBox {...this.props}/></Route>
                    <Route exact path={'/auth'}><Auth {...this.props}/></Route>
                    <Route exact path={'/profile'}><Profile {...this.props}/></Route>
                </Switch>
            </Router>
        )
    }
}

const mapStateToProps = state => {
    const loc = window.location
    let endpoint = `wss://thechatx.net/ws/`
    // let endpoint = `${proc}//localhost/ws/`
    let socket = new ReconnectingWebSocket(endpoint)
    return {
        socket: socket
    }
}

export default connect(mapStateToProps, null)(MyRouter)
