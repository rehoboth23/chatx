import React from "react";
const date_handler = require("../../dateHandler")

function Incoming(props){
    const data = props.props
    const picurl = `http://localhost:8000/${data['pic_url']}`
    // const picurl = `${data['pic_url']}`
    return(
        <div className="row incoming msg-holder mb-2">
            <div className="msg-toon-holder">
                <img src={picurl} alt="toon-img" className="msg-toon rounded-circle"/>
            </div>
            <div className="text-holder">
                <p className="rounded-lg">{data['memo']}
                    <br/><span className="message-time">{date_handler(data.date)}</span>
                </p>
            </div>
        </div>
    )
}
export default Incoming
