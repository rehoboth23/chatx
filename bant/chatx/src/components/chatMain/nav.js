import React, {Component} from "react";
import {Redirect, withRouter} from "react-router";

class Nav extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchKey: "",
        }
        this.handleLogout = this.handleLogout.bind(this)
        this.handleClear = this.handleClear.bind(this)
        this.handleSearch = this.handleSearch.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleLogout(event) {
        event.preventDefault()
        this.props.logout()
    }
    handleClear(event) {
        event.preventDefault()
        this.props.clear()
    }
    handleSearch(event){
        const {value} = event.target
        this.setState({searchKey: value})
        this.props.search(value)
    }
    handleSubmit(event){
        event.preventDefault()
        this.props.search(this.state.searchKey)
    }
    profile() {
        return <Redirect push to={"/chat"} />
    }
    render() {

        return(
            <div className="row" id="NavBar">
                <nav className="navbar navbar-expand-lg navbar-light bg-light col-12">

                    <a className="navbar-brand" href="logo">
                        <img src={require(process.env.PUBLIC_URL + "../../images/chatx.png")} alt="logo" id="logo" />
                        ChatX
                    </a>
                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"/>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarSupportedContent">

                        <form className="form-inline my-2 my-lg-0" onSubmit={this.handleSubmit}>
                            <input
                                className="form-control mr-sm-2"
                                type="search"
                                placeholder="Search"
                                aria-label="Search"
                                value={this.state.searchKey}
                                onChange={this.handleSearch}
                            />
                            <button className="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
                        </form>
                        <ul className="navbar-nav ml-auto">
                            <li className="nav-item">
                                <a className="nav-link btn btn-primary" href="clear" onClick={this.handleClear} style={{"color": "yellow"}}>Clear</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link btn btn-light" href="logout" onClick={this.handleLogout}>Logout</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link btn btn-primary" href="profile" style={{"color": "yellow"}}>Profile</a>
                            </li>
                        </ul>
                    </div>
                </nav>
            </div>
        )
    }
}

export default withRouter(Nav)