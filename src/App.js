import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'
import axios from 'axios'


let postData = new FormData();
postData.set("test",'test')
console.log(postData.entries().next());
axios.post('/web3/getAccount',{test:'test'}).then(console.log)

// axios({
//   method: 'post',
//   url: '/web3/getAccount',
//   data: {
//     firstName: 'Fred',
//     lastName: 'Flintstone'
//   }
// })

class User extends React.Component {
      constructor(props){
        super(props);
      }

      render(){
        console.log(this.props)
        return(
          <div>
          </div>
        )
      }
}

class Contract extends React.Component {
      constructor(props){
        super(props);
      }

      render(){
        console.log(this.props);
        return(
          <div>
            {this.props.data.type}
          </div>
        )
      }
}

class Contractapp extends React.Component {
    constructor(props){
      super(props);
      this.state = {
                    contracts: []
                    }
      var UIObj = this;
      axios.get('/web3/contractTypeList').then(res => UIObj.setState({contracts: res.data}))
    }


    renderContract(contractData){
      return(
        <Contract data = {contractData} />
      )
    }

    renderContracts(){
      return(
          this.state.contracts.map(
            (contractData,contractIndex) => (
                this.renderContract(contractData)
            )
          )
      )
    }

    renderAccount(account){
      return(
        <User data = {account}/>
      )
    }

    render() {
        // console.log(this.state.currentAsset)
        return (
          <div>
            <div>
              {"Accounts"}
            </div>
            <div>
              {"Contract Types"}
              {this.renderContracts()}
            </div>
          </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Contractapp />,
    document.getElementById('root')
);
