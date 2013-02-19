package com.isitbusythere.reporter.app;

public class XhrResponse {

	private String response = "";
	private Boolean isError = false;
	
	public String getResponse(){
		return this.response;
	}

	public void setResponse(String value){
		this.response = value;
	}
	
	public Boolean getIsError(){
		return this.isError;
	}
	
	public void setIsError(Boolean value){
		this.isError = value;
	}
	
	public XhrResponse(){}
	
	public XhrResponse(String response, Boolean isError){
		this.response = response;
		this.isError = isError;
	}
}
