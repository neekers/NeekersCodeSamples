package com.isitbusythere.reporter.data;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;

import android.app.Activity;
import android.content.Intent;
import android.text.Spannable;
import android.text.SpannableStringBuilder;
import android.text.method.LinkMovementMethod;
import android.text.style.ClickableSpan;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.TextView;

import com.google.gson.Gson;
import com.isitbusythere.reporter.AdditionalPeopleActivity;
import com.isitbusythere.reporter.ProfileActivity;
import com.isitbusythere.reporter.R;
import com.isitbusythere.reporter.ReportInActivity;
import com.isitbusythere.reporter.helpers.ImageManager;
import com.isitbusythere.reporter.helpers.Utils;
import com.isitbusythere.reporter.model.FoursquareVenue;
import com.isitbusythere.reporter.model.ImageSize;
import com.isitbusythere.reporter.model.UserReport;

public class StatusesAdapter extends ArrayAdapter<UserReport> {

	private ArrayList<UserReport> statuses = new ArrayList<UserReport>();
	private final LayoutInflater mInflater;
	private Activity context;
	private final int textViewResourceId;
	private ImageManager imageManager;
	private Boolean showPlaceName = false;

	public ArrayList<UserReport> getStatuses(){
		return this.statuses;
	}

	public StatusesAdapter(Activity context, int textViewResourceId, ArrayList<UserReport> items) {
		 super(context, textViewResourceId, items);

		 this.mInflater = LayoutInflater.from(context);

		 this.context = context;
		 if (items != null) this.statuses = items;
		 this.textViewResourceId = textViewResourceId;
		 imageManager = new ImageManager(context);
	}
	
	public StatusesAdapter(Activity context, int textViewResourceId, ArrayList<UserReport> items, Boolean showPlaceName) {
		 super(context, textViewResourceId, items);

		 this.mInflater = LayoutInflater.from(context);

		 this.context = context;
		 if (items != null) this.statuses = items;
		 this.textViewResourceId = textViewResourceId;
		 imageManager = new ImageManager(context);
		 this.showPlaceName = showPlaceName;
		 
		 //TODO: this needs to change since we're just doing FSq now.
		 /*
		 if (showPlaceName){
			 placeLoader = new AsyncPlaceLoader(this.context, this.imageManager);
		 }
		 */
	}
	
	public void setItems(ArrayList<UserReport> statuses){
		this.statuses = statuses;
		this.notifyDataSetChanged();
	}

    @Override
    public UserReport getItem(int position) {
        return this.statuses.get(position);
    }
    

    @Override
	public void addAll(Collection<? extends UserReport> collection) {
    	if (collection.size() > 0){
    		for (UserReport s : collection){
    			if (!this.statuses.contains(s)){
    				this.statuses.add(s);
    			}
    		}
    	}
	}

	@Override
	public View getView(final int position, View convertView, ViewGroup parent)
	{

		ViewHolder holder;

		//Get the current alert object
		final UserReport status = getItem(position);

		//Inflate the view
		if(convertView==null){
			convertView = this.mInflater.inflate(this.textViewResourceId, parent, false);
			holder = new ViewHolder();
			holder.lblUserName = (TextView)convertView.findViewById(R.id.lblUserName);
			holder.lblStatus = (TextView)convertView.findViewById(R.id.lblStatus);
			holder.imgUserPhoto = (ImageView)convertView.findViewById(R.id.imgUserPhoto);
			holder.lblTimeAgo = (TextView)convertView.findViewById(R.id.lblTimeAgo);
			holder.imgPlaceIcon = (ImageView)convertView.findViewById(R.id.imgPlaceIcon);
			holder.lblPlaceName = (TextView)convertView.findViewById(R.id.lblPlaceName);
			
			convertView.setTag(holder);
		}
		else{
			holder = (ViewHolder)convertView.getTag();
		}

		//Assign the appropriate data from our alert object above
		String userName = status.getFirstName() + " " + status.getLastName();
		if (status.getAdditionalPeopleCount() == 0){
			holder.lblUserName.setText(userName);
		}
		else{
			
			Spannable spans = SpannableStringBuilder.valueOf(userName + " +" + status.getAdditionalPeopleCount() + " others ");
			holder.lblUserName.setMovementMethod(LinkMovementMethod.getInstance());
			ClickableSpan clickSpan = new ClickableSpan() {
	
			     @Override
			     public void onClick(View v)
			     {
			        Intent viewAdditionalPeople = new Intent(context, AdditionalPeopleActivity.class);
			        viewAdditionalPeople.putExtra("status", status);
			        context.startActivity(viewAdditionalPeople);
			     }
			  };
			spans.setSpan(clickSpan, 0, spans.length(), Spannable.SPAN_EXCLUSIVE_EXCLUSIVE);
			holder.lblUserName.setText(spans);
		}
		
		holder.lblStatus.setText(status.getStatus());
		holder.lblTimeAgo.setText(Utils.formatDate(status.getCreatedAt()));
		
		if (status.getPhotoUrl().length() > 0){
			holder.imgUserPhoto.setTag(status.getPhotoUrl());
			imageManager.displayImage(status.getPhotoUrl(), context, holder.imgUserPhoto);
		}
		
		int busyIcon = R.drawable.dot_notbusy;
		switch(status.getIsItBusy()){
		
			case NotBusy: 
				busyIcon = R.drawable.dot_notbusy;
				break;
				
			case Busy:
				busyIcon = R.drawable.dot_busy;
				break;
				
			case Facebook:
				busyIcon = R.drawable.social_facebook_small;
				break;
				
			case Foursquare:
				busyIcon = R.drawable.foursquare;
				break;
		}
		
		holder.lblUserName.setCompoundDrawablesWithIntrinsicBounds(busyIcon, 0,0,0);
		
		//holder.imgIcon.setOnClickListener();
		
		if (showPlaceName){
			holder.lblPlaceName.setVisibility(View.VISIBLE);
			holder.imgPlaceIcon.setVisibility(View.VISIBLE);
			
			//Facebook checkins already have a place
			//TODO: look over this
			if (status.getPlace() != null){

				holder.lblPlaceName.setTag(status.getPlace());
				holder.lblPlaceName.setText(status.getPlace().getName() + " - " + status.getPlace().getLocation().getAddress() + ", " + status.getPlace().getLocation().getCity());
				holder.imgPlaceIcon.setTag(status.getIconUrl(ImageSize.WIDTH_44));
				imageManager.displayImage(status.getIconUrl(ImageSize.WIDTH_44), context, holder.imgPlaceIcon);
				
				holder.imgPlaceIcon.setOnClickListener(new VenueClickListener(status.getPlace()));
				holder.lblPlaceName.setOnClickListener(new VenueClickListener(status.getPlace()));
			}
			else if (status.getVenueName() != null){
				holder.lblPlaceName.setText(status.getVenueName());
				holder.imgPlaceIcon.setTag(status.getIconUrl(ImageSize.WIDTH_44));
				imageManager.displayImage(status.getIconUrl(ImageSize.WIDTH_44), context, holder.imgPlaceIcon);
				
				holder.lblPlaceName.setTag(status.getVenueId());
				holder.lblPlaceName.setOnClickListener(new OnClickListener(){

					@Override
					public void onClick(View v) {
						Intent seeReports = new Intent(context, ReportInActivity.class);
						seeReports.putExtra("venueId", (String)v.getTag());
						context.startActivity(seeReports);
					}
					
				});
			}
			
			holder.imgUserPhoto.setOnClickListener(new OnClickListener(){

				@Override
				public void onClick(View v) {
					Gson g = new Gson();
					Log.i("profile", "image click - " + g.toJson(status).toString());
					
					Intent viewProfile = new Intent(context, ProfileActivity.class);
					viewProfile.putExtra("status", status);
					context.startActivity(viewProfile);	
				}
				
			});
		}
		else{
			holder.lblPlaceName.setVisibility(View.GONE);
			holder.imgPlaceIcon.setVisibility(View.GONE);
		}
		
		return convertView;
	}
	
	private class VenueClickListener implements OnClickListener{
		private FoursquareVenue venue;
		
		public VenueClickListener(FoursquareVenue venue){
			this.venue = venue;
		}
		
		@Override
		public void onClick(View v) {
			Intent seeReports = new Intent(context, ReportInActivity.class);
			seeReports.putExtra("place", venue);
			context.startActivity(seeReports);
		}
	}
	
	public void sortByDate(){

		//sort by lastupdated
		Collections.sort(this.statuses, new Comparator<UserReport>(){

			@Override
            public int compare(UserReport object1, UserReport object2) {
				//Log.d("histrees", "sort by date - " + object1.getLastupdated());

				//"2011-07-21 01:27:10.314041"
				SimpleDateFormat df = Utils.getDateFormat();
				Date dt = null;
				Date dt2 = null;
				try {
					dt = df.parse(object1.getCreatedAt());
					dt2 = df.parse(object2.getCreatedAt());
				} catch (ParseException e) {
					Log.e("statuses", "bad date parse", e);
				}

				return dt.compareTo(dt2);
			}

		});

		Collections.reverse(this.statuses);

		notifyDataSetChanged();
	}

	private final static class ViewHolder {
		ImageView imgPlaceIcon;
		TextView lblPlaceName;
		TextView lblUserName;
		TextView lblStatus;
		ImageView imgUserPhoto;
		TextView lblTimeAgo;
	}
}
