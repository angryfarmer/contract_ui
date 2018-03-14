import React from 'react';
import ReactDOM from 'react-dom';
import './App.css'
import axios from 'axios'
import * as abiReader from './abiReader.js'

class Contractbox extends React.Component {
  constructor(props){
    super(props)
    this.state = {
                  contracts: [],
                  currentContract: null,
                  currentAddress: '',
                  currentContractMethods: []
    }
    var thisObject = this;

    axios.post('/web3/getContracts',{address:'0x97b63269B066ECCE2549A386ae7FcFe11412Cb74'}).then(function(res){
        thisObject.setState({contracts:res.data})
    })
  }

  listContracts(){
    return (this.state.contracts.map((contract,index) => 
        (
          <div className ='contract-name-button' onClick = {() => this.setStateContract(contract.contractType,contract.address)}>
            {contract.address + contract.contractType}
          </div>
        )
      )
    )
  }

  setStateContract(contractType,address){
    this.setState({address:address})
    for (var i = this.props.blankContracts.length - 1; i >= 0; i--) {
      if(this.props.blankContracts[i].type == contractType){
        // console.log(this.props.blankContracts[i])
        this.setState({currentContract:this.props.blankContracts[i]});
        this.setState({currentContractMethods:this.props.blankContracts[i].abi})
      }
    }
    // console.log(this.state.currentContractMethods);
  }

  setContractMethod(method){
      this.props.clickContractMethod(this.state.currentContract,this.state.address,method)
  }

  listContractMethods(){
    return (
      this.state.currentContractMethods.map((method,index) =>
        (
          <div className = 'contract-name-button' onClick = {() => this.setContractMethod(method)}>
              {method.name}
          </div>
        )
      )
    )
  }

  render(){
    return(
      <div>
        {"User Contracts"}
        <br/>
          {this.listContracts()}
        <br/>
          {this.listContractMethods()}
      </div>
    )
  }

}


class Passwordfield extends React.Component {
  constructor(props){
    super(props)
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event){
    this.props.handlePasswordChange(event.target.value);
  }

  render(){
    return(
      <div>
        <textarea value = {this.props.value} onChange = {this.handleChange} />
      </div>
    )
  }
}

class Paramfield extends React.Component {
  constructor(props){
    super(props);
    this.state = {value:this.props.value}
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event){
    this.props.handleChange(event.target.value);
    this.setState({value:event.target.value});
  }

  render(){
    return(
      <div>
        {this.props.param.name}
        <textarea value = {this.state.value} onChange = {this.handleChange} />
      </div>
    )
  }
}
//Input field
class Contractexecution extends React.Component {
  constructor(props){
    super(props);
    this.state = {
                    password: ''
                  }
    this.password = ''
    this.methodParams = [];
  }

  contractDisplay(){
    if(this.props.currentContractAddress == ''){
      return(
        <div>
          {"Create: "+ (this.props.currentContract?this.props.currentContract.type:null)}
        </div>
      )
    } else {
      return(
        <div>
          {"Method: " + this.props.currentContract.type + this.props.currentContractAddress}
        </div>
      )
    }
  }

  executeContract(){
      if(this.props.methodABI == null){

      } else {
        if(this.props.methodABI.type == "constructor"){
          axios.post('/web3/createContract',{ 
                                type: this.props.currentContract.type,
                                args: this.methodParams,
                                pubKey: this.props.currentUser,
                                password: this.state.password
                              })
        }
        if(this.props.methodABI.stateMutability == "view"){
          axios.post('/web3/callContractMethod',{ 
                                type: this.props.currentContract.type,
                                contractAddress: this.props.currentContractAddress,
                                method: this.props.methodABI.name,
                                args: this.methodParams,
                                pubKey: this.props.currentUser,
                              }).then(console.log)
        } else {
          axios.post('/web3/sendContractMethod',{ 
                      type: this.props.currentContract.type,
                      contractAddress: this.props.currentContractAddress,
                      method: this.props.methodABI.name,
                      args: this.methodParams,
                      pubKey: this.props.currentUser,
                      password: this.state.password
                    }).then(console.log)
          //contract send
        }
      }

      
      this.setState({password:''})
      this.methodParams = [];
      this.props.reset()

  }

  handleParamChange(index,update){
    this.methodParams[index] = update;
  }

  handlePasswordChange(update){
    this.setState({password:update});
  }

  renderParamBox(index,param){
    return(
        <Paramfield handleChange = {this.handleParamChange.bind(this,index)} param = {param} /> 
    )
  }

  renderParamBoxes(){
    if(this.props.currentContract == null){

    } else {
      
      return(
          this.props.methodABI.inputs.map((param,index) => this.renderParamBox(index,param))
      )        
    }
  }

  renderButton(){
      if(this.props.methodABI == null){

      } else {
        if(this.props.methodABI.type == "constructor"){
          return(
            <button className = 'standard-button' onClick = {() => this.executeContract()} >
                {'Create Contract'}
            </button>
          )

        } else if(this.props.methodABI.stateMutability == "view"){
          return(
            <button className = 'standard-button' onClick = {() => this.executeContract()} >
                {'Call Contract Method'}
            </button>
          )

        } else {
          return(
            <button className = 'standard-button' onClick = {() => this.executeContract()} >
                {'Create Contract'}
            </button>
          )
        }
      }
  }

  renderPasswordField(){
    if(this.props.methodABI == null){
      //do nothing
    } else {
      if(this.props.methodABI.stateMutability == "view"){
        //do nothing
      } else {
        return(
          <div>
            {"Password: "}
            <Passwordfield value = {this.state.password} handlePasswordChange = {this.handlePasswordChange.bind(this)} />
          </div>
        )
      }
    }
  }

  render(){
    return(
      <div>
          {"Current User: "+this.props.currentUser}
          {this.contractDisplay()}
          {this.renderPasswordField()}
          {this.renderParamBoxes()}
          {this.renderButton()}
      </div>
    )
  }
}

// Singular User Button
class User extends React.Component {
      constructor(props){
        super(props);
      }

      render(){

        return(
          <div className = 'user-acc-button' onClick = {() => this.props.handleClick(this.props.data)}>
            {this.props.data}
          </div>
        )
      }
}
// UI for List of Users
class Userlist extends React.Component {
      constructor(props){
        super(props)
      }

      renderUser(user){
        return(
            <User data = {user} handleClick = {this.props.setUser} />
        )
      }

      renderUsers(){
        return(
            this.props.users.map(
              (user,userIndex) => (
                  this.renderUser(user)
              )
            )
        )
      }

      render(){
        return(
          <div>
            {this.renderUsers()}
          </div>
        )
      }

}

//Singular Contract Button
class Contract extends React.Component {
      constructor(props){
        super(props);
      }

      render(){
        return(
          <div className ='contract-name-button' onClick = {() => this.props.handleClick(this.props.data)}>
            {this.props.data.type}
          </div>
        )
      }
}
//UI for contract list
class Blankcontractdisplay extends React.Component {
  constructor(props){
    super(props);
  }

  renderContract(contractData){
    return(
      <Contract data = {contractData} handleClick = {this.props.setContract}/>
    )
  }

  renderContracts(){
    return(
        this.props.blankContracts.map(
          (contractData,contractIndex) => (
              this.renderContract(contractData)
          )
        )
    )
  }

  render(){
    return(
      <div>
        {this.renderContracts()}
      </div>
    )
  }
}

export default class Contractapp extends React.Component {
    constructor(props){
      super(props);
      this.state = {
                    contracts: [],
                    currentContract: null,
                    users: [],
                    currentUser: null,
                    password: '',
                    contractAddress: '',
                    params: [],
                    methodABI: null
                    }
      this.methodParams = [];
      var UIObj = this;
      axios.get('/web3/contractTypeList').then(res => UIObj.setState({contracts: res.data}))
      axios.get('/web3/getAccounts').then(res => UIObj.setState({users: res.data}))
      // axios.get('/web3/getAccounts').then(console.log)
    }

    clickContractMethod(contract,contractAddress,method){
        this.setState({
                        currentContract:contract,
                        contractAddress: contractAddress,
                        methodABI: method
                      })
    }

    resetContractUI(){
      this.setState({
                      currentContract: null,
                      contractAddress: '',
                      methodABI: null
                    })
    }

    setBlankContract(contract){
        var contractConstructor = abiReader.getABIConstructorParameters(contract.abi)
        this.setState({currentContract:contract,methodABI:contractConstructor})
    }

    setUser(user){
        this.setState({currentUser:user})
    }

    render() {
        // console.log(this.state.currentAsset)
        return (
          <div>
            <Contractexecution 
                    currentContract = {this.state.currentContract} 
                    currentContractAddress = {this.state.contractAddress} 
                    methodABI = {this.state.methodABI} 
                    currentUser = {this.state.currentUser} 
                    reset = {this.resetContractUI.bind(this)}
            />
            <Userlist 
                    users = {this.state.users} 
                    setUser = {this.setUser.bind(this)} 
            />
            <Blankcontractdisplay 
                    blankContracts = {this.state.contracts} 
                    setContract = {this.setBlankContract.bind(this)} 
            />
            <Contractbox 
                    blankContracts = {this.state.contracts} 
                    clickContractMethod = {this.clickContractMethod.bind(this)} 
            />
          </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Contractapp />,
    document.getElementById('root')
);
