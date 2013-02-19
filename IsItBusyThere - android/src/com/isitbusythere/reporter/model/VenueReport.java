package com.isitbusythere.reporter.model;

import java.util.ArrayList;

import android.os.Parcel;
import android.os.Parcelable;


public class VenueReport implements Parcelable {
	private Long userId;
	private String facebookPlaceId = "";
	private FoursquareVenue place;
	private Boolean isItBusy = false;
	private String status = "";
	private int busyCount;
	private int notBusyCount;
	private String createdTime;
	private String updatedTime;
	private Long lastReportInTime;
	private int totalPeopleCount;
	private ArrayList<UserReport> userReports = new ArrayList<UserReport>();
	private ArrayList<Question> questions = new ArrayList<Question>();
	private String iconUrl;
	
	public Long getUserId() {
		return userId;
	}
	public void setUserId(Long userId) {
		this.userId = userId;
	}
	public String getFacebookPlaceId() {
		return facebookPlaceId;
	}
	public void setFacebookPlaceId(String facebookPlaceId) {
		this.facebookPlaceId = facebookPlaceId;
	}
	public FoursquareVenue getPlace(){
		return place;
	}
	public void setPlace(FoursquareVenue place){
		this.place = place;
	}
	public Boolean getIsItBusy() {
		return isItBusy;
	}
	public void setIsItBusy(Boolean isItBusy) {
		this.isItBusy = isItBusy;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public int getBusyCount() {
		return busyCount;
	}
	public void setBusyCount(int busyCount) {
		this.busyCount = busyCount;
	}
	public int getNotBusyCount() {
		return notBusyCount;
	}
	public void setNotBusyCount(int notBusyCount) {
		this.notBusyCount = notBusyCount;
	}
	public String getCreatedTime() {
		return createdTime;
	}
	public void setCreatedTime(String createdTime) {
		this.createdTime = createdTime;
	}
	public String getUpdatedTime() {
		return updatedTime;
	}
	public void setUpdatedTime(String updatedTime) {
		this.updatedTime = updatedTime;
	}
	public Long getLastReportInTime() {
		return lastReportInTime;
	}
	public void setLastReportInTime(Long lastReportInTime) {
		this.lastReportInTime = lastReportInTime;
	}
	public int getTotalPeopleCount() {
		return totalPeopleCount;
	}
	public void setTotalPeopleCount(int totalPeopleCount) {
		this.totalPeopleCount = totalPeopleCount;
	}
	public ArrayList<UserReport> getStatuses() {
		if (userReports == null){
			userReports = new ArrayList<UserReport>();
		}
		return userReports;
	}
	public void setStatuses(ArrayList<UserReport> statuses) {
		this.userReports = statuses;
	}
	public ArrayList<Question> getQuestions() {
		return questions;
	}
	public void setQuestions(ArrayList<Question> questions) {
		this.questions = questions;
	}
	public String getIconUrl() {
		return iconUrl;
	}
	public void setIconUrl(String iconUrl) {
		this.iconUrl = iconUrl;
	}
	public VenueReport() {	}
	
	public void RecalculateBusyness(){
		this.isItBusy = (busyCount > notBusyCount);
	}
	 /**
    *
    * Constructor to use when re-constructing object
    * from a parcel
    *
    * @param in a parcel from which to read this object
    */
   public VenueReport(Parcel in) {
       readFromParcel(in);
   }

   @SuppressWarnings("rawtypes")
   public static final Parcelable.Creator CREATOR =
       new Parcelable.Creator() {
           @Override
           public VenueReport createFromParcel(Parcel in) {
               return new VenueReport(in);
           }

           @Override
           public VenueReport[] newArray(int size) {
               return new VenueReport[size];
           }
       };

   @Override
   public int describeContents() {
       return 0;
   }

   //@Override
   @Override
   public void writeToParcel(Parcel dest, int flags) {

       	// We just need to write each field into the
       	// parcel. When we read from parcel, they
       	// will come back in the same order
       	dest.writeLong(userId);
       	dest.writeString(facebookPlaceId);
       	dest.writeInt(isItBusy ? 1 : 0);
       	dest.writeString(status);
       	//not serializing statuses or questions
       	dest.writeInt(busyCount);
       	dest.writeInt(notBusyCount);
	   	dest.writeString(createdTime);
	   	dest.writeString(updatedTime);
	   	dest.writeInt(totalPeopleCount);
	   	dest.writeString(iconUrl);
	   	dest.writeParcelable(place, FoursquareVenue.PARCELABLE_WRITE_RETURN_VALUE);
   }

   /**
    *
    * Called from the constructor to create this
    * object from a parcel.
    *
    * @param in parcel from which to re-create object
    */
   private void readFromParcel(Parcel in) {

       // We just need to read back each
       // field in the order that it was
       // written to the parcel
       this.userId = in.readLong();
	   this.facebookPlaceId = in.readString();
	   this.isItBusy = in.readInt() == 1 ? true : false;
	   this.status = in.readString();
      	//not deserializing statuses or questions
	   this.busyCount = in.readInt();
	   this.notBusyCount = in.readInt();
	   this.createdTime = in.readString();
	   this.updatedTime = in.readString();
	   this.totalPeopleCount = in.readInt();
	   this.iconUrl = in.readString();
	   this.place = in.readParcelable(FoursquareVenue.class.getClassLoader());
   }
	
	
}
