package com.isitbusythere.reporter.model;


/*
@Deprecated
public class GooglePlace implements Parcelable{

	private String icon;
	private String id;
	private String name;
	private Geometry geometry;
	private ArrayList<String> types = new ArrayList<String>();
	private String vicinity;
	private String reference;
	private String url = "";
	private String website;
	private String twitter = "";
	private String foursquareVenueId = "";
	private String facebookPlaceId = "";
	
	public String getIcon() {
		return icon;
	}
	public void setIcon(String icon) {
		this.icon = icon;
	}
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
	public void setGeometry(Geometry geometry) {
		this.geometry = geometry;
	}
	public Geometry getGeometry() {
		return geometry;
	}
	public ArrayList<String> getTypes() {
		return types;
	}
	public void setTypes(ArrayList<String> types) {
		this.types = types;
	}
	public String getVicinity() {
		return vicinity;
	}
	public void setVicinity(String vicinity) {
		this.vicinity = vicinity;
	}
	public String getReference() {
		return reference;
	}
	public void setReference(String reference) {
		this.reference = reference;
	}
	public String getUrl() {
		return url;
	}
	public void setUrl(String url) {
		this.url = url;
	}
	public String getWebsite() {
		return website;
	}
	public void setWebsite(String website) {
		this.website = website;
	}
	public String getTwitter() {
		if (twitter == null || twitter.length() == 0){
			return "";
		}
		if (!twitter.startsWith("@")){
			twitter = "@"+twitter;
		}
		return twitter;
	}
	public void setTwitter(String twitter) {
		this.twitter = twitter;
	}
	public String getFoursquareVenueId() {
		return foursquareVenueId;
	}
	public void setFoursquareVenueId(String foursquareVenueId) {
		this.foursquareVenueId = foursquareVenueId;
	}
	public String getFacebookPlaceId() {
		return facebookPlaceId;
	}
	public void setFacebookPlaceId(String facebookPlaceId) {
		this.facebookPlaceId = facebookPlaceId;
	}
	public GooglePlace() {}
	 /**
   *
   * Constructor to use when re-constructing object
   * from a parcel
   *
   * @param in a parcel from which to read this object
   */

/*
  public GooglePlace(Parcel in) {
      readFromParcel(in);
  }

  @SuppressWarnings("rawtypes")
  public static final Parcelable.Creator CREATOR =
      new Parcelable.Creator() {
          @Override
          public GooglePlace createFromParcel(Parcel in) {
              return new GooglePlace(in);
          }

          @Override
          public GooglePlace[] newArray(int size) {
              return new GooglePlace[size];
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
      	dest.writeString(icon);
	   	dest.writeString(id);
	   	dest.writeString(name);
	   	dest.writeDouble(geometry.location.lat);
	   	dest.writeDouble(geometry.location.lng);
		dest.writeArray(types.toArray());
		dest.writeString(vicinity);
		dest.writeString(reference);
		dest.writeString(url);
		dest.writeString(website);
		dest.writeString(twitter);
		dest.writeString(foursquareVenueId);
		dest.writeString(facebookPlaceId);
  }

  /**
   *
   * Called from the constructor to create this
   * object from a parcel.
   *
   * @param in parcel from which to re-create object
   */
/*
  	private void readFromParcel(Parcel in) {

      // We just need to read back each
      // field in the order that it was
      // written to the parcel
	   this.icon = in.readString();
	   this.id = in.readString();
	   this.name = in.readString();
	   geometry = new Geometry();
	   geometry.location.lat = in.readDouble();
	   geometry.location.lng = in.readDouble();
	   this.types = in.readArrayList(ArrayList.class.getClassLoader());
	   this.vicinity = in.readString();
	   this.reference = in.readString();
	   this.url = in.readString();
	   this.website = in.readString();
	   this.twitter = in.readString();
	   this.foursquareVenueId = in.readString();
	   this.facebookPlaceId = in.readString();
  }
  	
  	public class Geometry{
  		public Location location = new Location();
  		
  		public Geometry(){}
  		
  		public class Location{
  			public Double lat = 0d;
  			public Double lng = 0d;
  			
  			public Location(){}
  		}
  	}
  	
}
*/