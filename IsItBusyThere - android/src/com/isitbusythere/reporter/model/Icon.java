package com.isitbusythere.reporter.model;

import android.os.Parcel;
import android.os.Parcelable;
import android.util.Log;


public class Icon implements Parcelable{
	private String prefix;
	private String suffix;
	
	public String getPrefix() {
		return prefix;
	}
	public void setPrefix(String prefix) {
		this.prefix = prefix;
	}
	public String getSuffix() {
		return this.suffix;
	}
	public void setSuffix(String suffix) {
		this.suffix = suffix;
	}
	public String getFullUrl(ImageSize size){
		return String.format("%sbg_%s%s", this.getPrefix(), size.getSize(), this.getSuffix());
	}
	
	protected Icon(Parcel in) {
        prefix = in.readString();
        suffix = in.readString();
    }

    public int describeContents() {
        return 0;
    }

    public void writeToParcel(Parcel dest, int flags) {
        dest.writeString(prefix);
        dest.writeString(suffix);
    }

    public static final Parcelable.Creator<Icon> CREATOR = new Parcelable.Creator<Icon>() {
        public Icon createFromParcel(Parcel in) {
            return new Icon(in);
        }

        public Icon[] newArray(int size) {
            return new Icon[size];
        }
    };
}
