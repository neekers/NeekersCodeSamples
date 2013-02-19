package com.isitbusythere.reporter.model;

public enum BusyStatusType {
	NotBusy(0),
	Busy(1),
	Facebook(2),
	Foursquare(3);
	
	private int status;
	public String getStatus(){
		return String.valueOf(this.status);
	}
	
	private BusyStatusType(int status) {
        this.status = status;
	}
}
