import React, {Component} from 'react';
import MyRouter from "./router";
import {connect} from 'react-redux'
import * as actions from './store/actions/auth';

class App extends Component{
    componentDidMount() {
        this.props.onTryAutoSignup()
    }

    render() {
        return (
            <div className="App">
              <MyRouter {...this.props}/>
            </div>
        );
    }
}

const mapStateToProps = state => {
  return {
    isAuthenticated: state.token !== null
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onTryAutoSignup: () => dispatch(actions.authCheckState())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
