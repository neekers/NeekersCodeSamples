package com.isitbusythere.reporter.model;

public enum ImageSize {
	WIDTH_32(32),
	WIDTH_44(44),
	WIDTH_64(64),
	WIDTH_88(88);
	
	private int size;
	public int getSize(){
		return this.size;
	}
	
	private ImageSize(int size) {
        this.size = size;
	}
	
}
