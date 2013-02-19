package com.isitbusythere.reporter.model;

import android.os.Parcel;
import android.os.Parcelable;


public class FoursquareVenueSmall implements Parcelable {

	private String venueId;
	private String name = "";
	private String address;
	private Double lat;
	private Double lng;
	private String categoryId;
	private String categoryName;
	private String icon;
	private String twitter;

	
	public String getVenueId() {
		return venueId;
	}
	public void setVenueId(String venueId) {
		this.venueId = venueId;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getAddress() {
		return address;
	}
	public void setAddress(String address) {
		this.address = address;
	}
	public Double getLat() {
		return lat;
	}
	public void setLat(Double lat) {
		this.lat = lat;
	}
	public Double getLng() {
		return lng;
	}
	public void setLng(Double lng) {
		this.lng = lng;
	}
	public String getCategoryId() {
		return categoryId;
	}
	public void setCategoryId(String categoryId) {
		this.categoryId = categoryId;
	}
	public String getCategoryName() {
		return categoryName;
	}
	public void setCategoryName(String categoryName) {
		this.categoryName = categoryName;
	}
	public String getIcon() {
		return icon;
	}
	public void setIcon(String icon) {
		this.icon = icon;
	}
	public String getTwitter() {
		return twitter;
	}
	public void setTwitter(String twitter) {
		this.twitter = twitter;
	}
	public FoursquareVenueSmall(FoursquareVenue venue) {
		this.venueId = venue.getId();
		this.name = venue.getName();
		this.address = venue.getLocation().getAddress();
		this.lat = venue.getLocation().getLat();
		this.lng = venue.getLocation().getLng();
		this.categoryId = venue.getCategories().get(0).getId();
		this.categoryName = venue.getCategories().get(0).getName();
		
		Icon icon = venue.getCategories().get(0).getIcon();
		this.icon = icon.getSuffix();
		this.twitter = venue.getContact().getTwitter();
	}
	/**
	   *
	   * Constructor to use when re-constructing object
	   * from a parcel
	   *
	   * @param in a parcel from which to read this object
	   */
	  public FoursquareVenueSmall(Parcel in) {
	      readFromParcel(in);
	  }

	  @SuppressWarnings("rawtypes")
	  public static final Parcelable.Creator CREATOR =
	      new Parcelable.Creator() {
	          @Override
	          public FoursquareVenueSmall createFromParcel(Parcel in) {
	              return new FoursquareVenueSmall(in);
	          }

	          @Override
	          public FoursquareVenueSmall[] newArray(int size) {
	              return new FoursquareVenueSmall[size];
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
		  	dest.writeString(venueId);
	      	dest.writeString(name);
		   	dest.writeString(address);
		   	dest.writeDouble(lat);
		   	dest.writeDouble(lng);
		   	dest.writeString(categoryId);
			dest.writeString(categoryName);
			dest.writeString(icon);
			dest.writeString(twitter);
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
	  	  this.venueId = in.readString();
		  this.name = in.readString();
		  this.address = in.readString();
		  this.lat = in.readDouble();
		  this.lng = in.readDouble();
		  this.categoryId = in.readString();
		  this.categoryName = in.readString();
		  this.icon = in.readString();
		  this.twitter = in.readString();
	  }

}
