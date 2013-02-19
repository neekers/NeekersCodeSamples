package com.isitbusythere.reporter.model;

import android.os.Parcel;
import android.os.Parcelable;

public class User implements Parcelable{
	Long userId = -1l;
	String firstName;
	String lastName;
	String foursquareUserId;
	String photoUrl = "";
	
	public Long getUserId() {
		return userId;
	}
	public void setUserId(Long userId) {
		this.userId = userId;
	}
	public String getFirstName() {
		return firstName;
	}
	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}
	public String getLastName() {
		return lastName;
	}
	public void setLastName(String lastName) {
		this.lastName = lastName;
	}
	public String getFoursquareUserId() {
		return foursquareUserId;
	}
	public void setFoursquareUserId(String facebookUserId) {
		this.foursquareUserId = facebookUserId;
	}
	public String getPhotoUrl() {
		return photoUrl;
	}
	public void setPhotoUrl(String photoUrl) {
		this.photoUrl = photoUrl;
	}
	public User(Long userId) {
		this.userId = userId;
	}
	public User(Long userId, String firstName, String lastName, String photoUrl) {
		this.userId = userId;
		this.firstName = firstName;
		this.lastName = lastName;
		this.photoUrl = photoUrl;
	}
	public User(Long userId, String firstName, String lastName) {
		this.userId = userId;
		this.firstName = firstName;
		this.lastName = lastName;
	}
	public User() {}
	
	 /**
   *
   * Constructor to use when re-constructing object
   * from a parcel
   *
   * @param in a parcel from which to read this object
   */
  public User(Parcel in) {
      readFromParcel(in);
  }

  @SuppressWarnings("rawtypes")
  public static final Parcelable.Creator CREATOR =
      new Parcelable.Creator() {
          @Override
          public User createFromParcel(Parcel in) {
              return new User(in);
          }

          @Override
          public User[] newArray(int size) {
              return new User[size];
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
	   dest.writeString(firstName);
	   dest.writeString(lastName);
	   dest.writeString(foursquareUserId);
	   dest.writeString(photoUrl);
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
	  userId = in.readLong();
	  firstName = in.readString();
	  lastName = in.readString();
	  foursquareUserId = in.readString();
	  photoUrl = in.readString();
  }
	
	
}
