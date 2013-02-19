package com.isitbusythere.reporter.model;

import java.util.ArrayList;
import java.util.List;

import android.os.Parcel;
import android.os.Parcelable;

public class FoursquareVenue implements Parcelable {

	private String id;
	private String name = "";
	private String url = "";
	private Contact contact = new Contact();
	private Location location = new Location();
	private HereNow hereNow;
	private List<UserReport> statuses = new ArrayList<UserReport>();
	private List<Category> categories = new ArrayList<Category>();
	private Boolean verified;
	private String iconUrl = "";
	
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getUrl() {
		return url;
	}
	public void setUrl(String url) {
		this.url = url;
	}
	public Contact getContact() {
		return contact;
	}
	public void setContact(Contact contact) {
		this.contact = contact;
	}
	public Location getLocation() {
		return location;
	}
	public void setLocation(Location location) {
		this.location = location;
	}
	public HereNow getHereNow() {
		return hereNow;
	}
	public void setHereNow(HereNow hereNow) {
		this.hereNow = hereNow;
	}
	public List<UserReport> getStatuses() {
		return statuses;
	}
	public void setStatuses(ArrayList<UserReport> statuses) {
		this.statuses = statuses;
	}
	public List<Category> getCategories() {
		return categories;
	}
	public void setCategories(ArrayList<Category> categories) {
		this.categories = categories;
	}
	public Boolean getVerified() {
		return verified;
	}
	public void setVerified(Boolean verified) {
		this.verified = verified;
	}
	public void setIconUrl(String iconUrl) {
		this.iconUrl = iconUrl;
	}
	public String getIconUrl(ImageSize imageSize){
		if (iconUrl.length() > 0){
			return iconUrl;
		}
		
		for (Category c : categories){
			if (c.getPrimary()){
				iconUrl = c.getIcon().getFullUrl(imageSize);
				break;
			}
		}
		
		return iconUrl;
	}
	
	public FoursquareVenue(){
		
	}
	
	protected FoursquareVenue(Parcel in) {
        id = in.readString();
        name = in.readString();
        url = in.readString();
        contact = in.readParcelable(Contact.class.getClassLoader());
        location = in.readParcelable(Location.class.getClassLoader());
        hereNow = in.readParcelable(HereNow.class.getClassLoader());
        statuses = in.readArrayList(UserReport.class.getClassLoader());
        categories = in.readArrayList(Category.class.getClassLoader());
        verified = in.readByte() != 0x00;
        iconUrl = in.readString();
    }

    public int describeContents() {
        return 0;
    }

    public void writeToParcel(Parcel dest, int flags) {
        dest.writeString(id);
        dest.writeString(name);
        dest.writeString(url);
        dest.writeParcelable(contact, Parcelable.PARCELABLE_WRITE_RETURN_VALUE);
        dest.writeParcelable(location, Parcelable.PARCELABLE_WRITE_RETURN_VALUE);
        dest.writeParcelable(hereNow, Parcelable.PARCELABLE_WRITE_RETURN_VALUE);
        dest.writeArray(statuses.toArray());
        dest.writeArray(categories.toArray());
        dest.writeByte((byte) (verified ? 0x01 : 0x00));
        dest.writeString(iconUrl);
    }

    public static final Parcelable.Creator<FoursquareVenue> CREATOR = new Parcelable.Creator<FoursquareVenue>() {
        public FoursquareVenue createFromParcel(Parcel in) {
            return new FoursquareVenue(in);
        }

        public FoursquareVenue[] newArray(int size) {
            return new FoursquareVenue[size];
        }
    };
}
