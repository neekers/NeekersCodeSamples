package com.isitbusythere.reporter.model;

import android.os.Parcel;
import android.os.Parcelable;

public class Contact implements Parcelable{
	private String twitter;

	public String getTwitter() {
		return twitter;
	}
	public void setTwitter(String twitter) {
		this.twitter = twitter;
	}
	
	public Contact(){}
	
	 protected Contact(Parcel in) {
        twitter = in.readString();
    }

    public int describeContents() {
        return 0;
    }

    public void writeToParcel(Parcel dest, int flags) {
        dest.writeString(twitter);
    }

    public static final Parcelable.Creator<Contact> CREATOR = new Parcelable.Creator<Contact>() {
        public Contact createFromParcel(Parcel in) {
            return new Contact(in);
        }

        public Contact[] newArray(int size) {
            return new Contact[size];
        }
    };
    

}
