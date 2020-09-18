import React from "react";
const date_handler = require("../../dateHandler")

function Conversation(props){
    const data = props.props
    // const picurl = `http://localhost:8000/${data['pic_url']}`
    const picurl = `${data['pic_url']}`
    const statusStyle = status => {
        if(!status){
            return( {"backgroundColor" : "red"})
        }else{
            return( {"backgroundColor" : "#0dcd36"})
        }
    }
    const selectConversation = (event) =>{
        event.preventDefault()
        const {id} = event.target
        data.select(id)
    }
    return(
        <>
            <a href={data['name']} className="row conversation" id={data['name']} onClick={selectConversation}>
                <div className="toon-holder">
                    <img src={picurl} alt="toon-img" className="toon rounded-circle"/>
                    <div className="status-icon rounded-circle" style={statusStyle(data['status'])} />
                </div>
                <div className="message-info-holder">
                    <p className="message-info">
                        <span className="row"><b className="col-8">{data['email']}</b></span>
                        <span className="row"><span className="col">{date_handler(data.date)}</span></span>
                    </p>
                </div>
            </a><hr/>
        </>
    )
}
export default Conversation