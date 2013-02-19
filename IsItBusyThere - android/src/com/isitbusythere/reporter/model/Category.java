package com.isitbusythere.reporter.model;

import java.util.ArrayList;
import java.util.List;

import android.os.Parcel;
import android.os.Parcelable;


public class Category implements Parcelable{
	private String id;
	private String name;
	private String shortName;
	private Icon icon;
	private Boolean primary = false;
	private String parentCategoryId;
	private List<Category> categories = new ArrayList<Category>();
	
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
	public String getShortName() {
		return shortName;
	}
	public void setShortName(String shortName) {
		this.shortName = shortName;
	}
	public Icon getIcon() {
		return icon;
	}
	public void setIcon(Icon icon) {
		this.icon = icon;
	}
	public Boolean getPrimary() {
		return primary;
	}
	public void setPrimary(Boolean primary) {
		this.primary = primary;
	}
	public String getParentCategoryId() {
		return parentCategoryId;
	}
	public void setParentCategoryId(String parentCategoryId) {
		this.parentCategoryId = parentCategoryId;
	}
	public List<Category> getSubCategories() {
		return categories;
	}
	public void setSubCategories(List<Category> categories) {
		this.categories = categories;
	}
	protected Category(Parcel in) {
        name = in.readString();
        id = in.readString();
        shortName = in.readString();
        primary = in.readInt() == 1 ? true : false;
        icon = in.readParcelable(Icon.class.getClassLoader());
        parentCategoryId = in.readString();
        categories = in.readArrayList(Category.class.getClassLoader());
    }

    public int describeContents() {
        return 0;
    }

    public void writeToParcel(Parcel dest, int flags) {
        dest.writeString(name);
        dest.writeString(id);
        dest.writeString(shortName);
        if (primary == null){
        	primary = false;
        }
        dest.writeInt(primary ? 1 : 0);
        dest.writeParcelable(icon, PARCELABLE_WRITE_RETURN_VALUE);
        dest.writeString(parentCategoryId);
        dest.writeArray(categories != null ? categories.toArray() : new ArrayList<Category>().toArray());
    }

    public static final Parcelable.Creator<Category> CREATOR = new Parcelable.Creator<Category>() {
        public Category createFromParcel(Parcel in) {
            return new Category(in);
        }

        public Category[] newArray(int size) {
            return new Category[size];
        }
    };

}
