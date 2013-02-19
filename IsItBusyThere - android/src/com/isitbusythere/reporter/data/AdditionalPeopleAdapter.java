package com.isitbusythere.reporter.data;

import java.util.ArrayList;

import android.app.Activity;
import android.content.Intent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.TextView;

import com.isitbusythere.reporter.ProfileActivity;
import com.isitbusythere.reporter.R;
import com.isitbusythere.reporter.helpers.ImageManager;
import com.isitbusythere.reporter.model.User;

public class AdditionalPeopleAdapter extends ArrayAdapter<User> {

	private ArrayList<User> users = new ArrayList<User>();
	private final LayoutInflater mInflater;
	private Activity context;
	private final int textViewResourceId;
	private ImageManager imageManager;

	public ArrayList<User> getStatuses(){
		return this.users;
	}

	public AdditionalPeopleAdapter(Activity context, int textViewResourceId, ArrayList<User> items) {
		 super(context, textViewResourceId, items);

		 this.mInflater = LayoutInflater.from(context);

		 this.context = context;
		 this.users = items;
		 this.textViewResourceId = textViewResourceId;
		 imageManager = new ImageManager(context);
	}
	
    @Override
    public User getItem(int position) {
        return this.users.get(position);
    }

	@Override
	public View getView(final int position, View convertView, ViewGroup parent)
	{

		ViewHolder holder;

		//Get the current alert object
		final User user = getItem(position);

		//Inflate the view
		if(convertView==null){
			convertView = this.mInflater.inflate(this.textViewResourceId, parent, false);
			holder = new ViewHolder();
			holder.lblUserName = (TextView)convertView.findViewById(R.id.lblUserName);
			holder.imgUserPhoto = (ImageView)convertView.findViewById(R.id.imgUserPhoto);
			
			convertView.setTag(holder);
		}
		else{
			holder = (ViewHolder)convertView.getTag();
		}

		//Assign the appropriate data from our alert object above
		holder.lblUserName.setText(user.getFirstName() + " " + user.getLastName());
		
		holder.imgUserPhoto.setTag("http://graph.facebook.com/"+user.getFoursquareUserId()+"/picture?type=large");
		imageManager.displayImage("http://graph.facebook.com/"+user.getFoursquareUserId()+"/picture?type=large", context, holder.imgUserPhoto);
		holder.imgUserPhoto.setOnClickListener(new OnClickListener(){

			@Override
			public void onClick(View v) {
				Intent viewProfile = new Intent(context, ProfileActivity.class);
				viewProfile.putExtra("externalUserId", user.getFoursquareUserId());
				context.startActivity(viewProfile);	
			}
			
		});
		
		return convertView;
	}

	private final static class ViewHolder {
		TextView lblUserName;
		ImageView imgUserPhoto;
	}
}
