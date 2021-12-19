import React from "react";
const date_handler = require("../../dateHandler")

function Outgoing(props){
    const data = props.props
    const picurl = `${data['pic_url']}`
    // const picurl = `${data['pic_url']}`
    return(
        <div className="row outgoing msg-holder mb-2 justify-content-end ml-auto">
            <div className="text-holder">
                <p className="rounded-left">{data['memo']}
                <br/><span className="message-time">{date_handler(data.date)}</span>
                </p>
            </div>
            <div className="msg-toon-holder">
                <img src={picurl} alt="toon-img" className="msg-toon rounded-circle"/>
            </div>
        </div>
    )
}
export default Outgoing
