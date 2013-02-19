package com.isitbusythere.reporter.model;

import java.util.ArrayList;
import java.util.List;

import android.os.Parcel;
import android.os.Parcelable;

public class UserReport implements Parcelable {
	private int id = -1; //System Id
	private Long userId = -1l; //System userId
	private String foursquareUserId = ""; 
	private String status = "";
	private String firstName;
	private String lastName = "";
	private String userHomeCity = "";
	private String photoUrl = "";
	private String profileLink = "";
	private int busy;
	private String createdAt;
	private String venueId;
	private FoursquareVenue place;
	private StatusType statusType = StatusType.IsItBusyThere;
	private int additionalPeopleCount;
	private ArrayList<User> additionalPeople = new ArrayList<User>();
	private String venueName;
	private String iconUrl = "";
	private List<String> questions = new ArrayList<String>();
	
	public int getId() {
		return id;
	}
	public void setId(int id) {
		this.id = id;
	}
	public Long getUserId() {
		return userId;
	}
	public void setUserId(Long userId) {
		this.userId = userId;
	}
	public String getFoursquareUserId() {
		return foursquareUserId;
	}
	public void setFoursquareUserId(String foursquareUserId) {
		this.foursquareUserId = foursquareUserId;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public String getFirstName() {
		return firstName;
	}
	public void setFirstName(String first_name) {
		this.firstName = first_name;
	}
	public String getLastName() {
		return lastName;
	}
	public void setLastName(String last_name) {
		this.lastName = last_name;
	}
	public String getUserHomeCity() {
		return userHomeCity;
	}
	public void setUserHomeCity(String userHomeCity) {
		this.userHomeCity = userHomeCity;
	}
	public String getPhotoUrl() {
		return photoUrl;
	}
	public void setPhotoUrl(String photoUrl) {
		this.photoUrl = photoUrl;
	}
	public String getProfileLink() {
		return profileLink;
	}
	public void setProfileLink(String profileLink) {
		this.profileLink = profileLink;
	}
	public BusyStatusType getIsItBusy() {
		return BusyStatusType.values()[busy];
	}
	public void setIsItBusy(int isItBusy) {
		this.busy = isItBusy;
	}
	public void setIsItBusy(BusyStatusType isItBusy) {
		this.busy = isItBusy.ordinal();
	}
	public String getCreatedAt() {
		return createdAt;
	}
	public void setCreatedAt(String createdAt) {
		this.createdAt = createdAt;
	}
	public String getVenueId() {
		if (venueId == null && place != null){
			return place.getName();
		}
		return venueId;
	}
	public void setVenueId(String venueId) {
		this.venueId = venueId;
	}
	public FoursquareVenue getPlace() {
		return place;
	}
	public void setPlace(FoursquareVenue place) {
		this.place = place;
	}
	public StatusType getStatusType() {
		return statusType;
	}
	public void setStatusType(StatusType statusType) {
		this.statusType = statusType;
	}
	public int getAdditionalPeopleCount() {
		return additionalPeopleCount;
	}
	public void setAdditionalPeopleCount(int additionalPeopleCount) {
		this.additionalPeopleCount = additionalPeopleCount;
	}
	public ArrayList<User> getAdditionalPeople() {
		return additionalPeople;
	}
	public void setAdditionalPeople(ArrayList<User> additionalPeople) {
		this.additionalPeople = additionalPeople;
	}
	public String getVenueName() {
		return venueName;
	}
	public void setVenueName(String venueName) {
		this.venueName = venueName;
	}
	public void setIconUrl(String iconUrl){
		this.iconUrl = iconUrl;
	}
	public String getIconUrl(ImageSize imageSize){
		if (iconUrl.length() > 0){
			return iconUrl;
		}
		return this.place.getIconUrl(imageSize);
	}
	public List<String> getQuestions() {
		return questions;
	}
	public void setQuestions(List<String> questions) {
		this.questions = questions;
	}
	public UserReport() {}
	
	 public UserReport(Long userId, String foursquareUserId, FoursquareVenue venue) {
		this.userId = userId;
		this.foursquareUserId = foursquareUserId;
		this.place = venue;
	}
	 
	 public UserReport(int id, Long userId, String foursquareUserId,
				String status, int busy) {
			this.id = id;
			this.userId = userId;
			this.foursquareUserId = foursquareUserId;
			this.status = status;
			this.busy = busy;
		}
	/**
    *
    * Constructor to use when re-constructing object
    * from a parcel
    *
    * @param in a parcel from which to read this object
    */
   public UserReport(Parcel in) {
       readFromParcel(in);
   }

   @SuppressWarnings("rawtypes")
   public static final Parcelable.Creator CREATOR =
       new Parcelable.Creator() {
           @Override
           public UserReport createFromParcel(Parcel in) {
               return new UserReport(in);
           }

           @Override
           public UserReport[] newArray(int size) {
               return new UserReport[size];
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
	   dest.writeInt(id);
	   dest.writeLong(userId);
	   dest.writeString(foursquareUserId);
	   dest.writeString(status);
	   dest.writeString(firstName);
	   dest.writeString(lastName);
	   dest.writeString(userHomeCity);
	   dest.writeString(photoUrl);
	   dest.writeString(profileLink);
	   dest.writeInt(busy);
	   dest.writeString(createdAt);
	   dest.writeString(venueId);
	   dest.writeParcelable(place, Parcelable.PARCELABLE_WRITE_RETURN_VALUE);
	   dest.writeInt(statusType.ordinal());
	   dest.writeInt(additionalPeopleCount);
	   dest.writeArray(additionalPeople.toArray());
	   dest.writeString(venueName);
	   dest.writeArray(questions.toArray());
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
	   id = in.readInt();
	   userId = in.readLong();
	   foursquareUserId = in.readString();
	   status = in.readString();
	   firstName = in.readString();
	   lastName = in.readString();
	   userHomeCity = in.readString();
	   photoUrl = in.readString();
	   profileLink = in.readString();
	   busy = in.readInt();
	   createdAt = in.readString();
	   venueId = in.readString();
	 
	   place = in.readParcelable(FoursquareVenue.class.getClassLoader());
	   statusType = StatusType.values()[in.readInt()];
	   additionalPeopleCount = in.readInt();
	   
	   Object[] people = in.readArray(User.class.getClassLoader());
	   additionalPeople = new ArrayList<User>();
	   for (int i=0; i<people.length; i++){
		   additionalPeople.add((User)people[i]);
	   }
	   venueName = in.readString();
	   questions = in.readArrayList(ArrayList.class.getClassLoader());
   }
}
