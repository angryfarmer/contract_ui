export function getABIConstructor(abi){
	for (var i = abi.length - 1; i >= 0; i--) {
		if(abi[i].type == "constructor"){
			return(abi[i])
		}
	}
}

export function getABIConstructorParameters(abi){
	for (var i = abi.length - 1; i >= 0; i--) {
		if(abi[i].type == "constructor"){
			return(abi[i])
		}
	}
	return(null);
}

