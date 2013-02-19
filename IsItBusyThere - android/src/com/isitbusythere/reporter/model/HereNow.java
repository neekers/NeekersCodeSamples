package com.isitbusythere.reporter.model;

import android.os.Parcel;
import android.os.Parcelable;

public class HereNow implements Parcelable{
	public int count;
	
	public int getCount() {
		return count;
	}
	public void setCount(int count) {
		this.count = count;
	}
	
	public HereNow() {
	
	}
	
	protected HereNow(Parcel in) {
        count = in.readInt();
    }
	
    public int describeContents() {
        return 0;
    }

    public void writeToParcel(Parcel dest, int flags) {
        dest.writeInt(count);
    }

    public static final Parcelable.Creator<HereNow> CREATOR = new Parcelable.Creator<HereNow>() {
        public HereNow createFromParcel(Parcel in) {
            return new HereNow(in);
        }

        public HereNow[] newArray(int size) {
            return new HereNow[size];
        }
    };
    

}
