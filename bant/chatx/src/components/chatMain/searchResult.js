import React from "react";

function SearchResult(props){
    const data = props.props
    const selectResult = (event) =>{
        event.preventDefault()
        const {id} = event.target
        data.select(id)
    }
    return(
        <>
            <a href={data['email']} className="row conversation" id={data['email']} onClick={selectResult}>
                <div className="toon-holder">
                    {/*<img src={data['pic_url']} alt="toon-img" className="toon rounded-circle"/>*/}
                    <img src={`https://test-mykc-bucket.s3.us-east-2.amazonaws.com/static/${data['pic_url']}`} alt="toon-img" className="toon rounded-circle"/>
                </div>
                <div className="message-info-holder">
                    <p className="message-info">
                        <span className="row">
                            <b className="col-8">{data['contact']}</b>
                            <span className="row">
                                <span className="col">{data['email']}</span>
                            </span>
                        </span>
                    </p>
                </div>
            </a><hr/>
        </>
    )
}
export default SearchResult
