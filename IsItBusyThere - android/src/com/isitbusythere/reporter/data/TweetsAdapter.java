package com.isitbusythere.reporter.data;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.TimeZone;

import twitter4j.Tweet;
import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.text.util.Linkify;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.TextView;

import com.isitbusythere.reporter.R;
import com.isitbusythere.reporter.helpers.ImageManager;
import com.isitbusythere.reporter.helpers.Utils;

public class TweetsAdapter extends ArrayAdapter<Tweet> {

	private ArrayList<Tweet> tweets = new ArrayList<Tweet>();
	private final LayoutInflater mInflater;
	private Activity context;
	private final int textViewResourceId;
	private ImageManager imageManager;

	public ArrayList<Tweet> getTweets(){
		return this.tweets;
	}

	public TweetsAdapter(Activity context, int textViewResourceId, ArrayList<Tweet> items) {
		 super(context, textViewResourceId, items);

		 this.mInflater = LayoutInflater.from(context);

		 this.context = context;
		 this.tweets = items;
		 this.textViewResourceId = textViewResourceId;
		 imageManager = new ImageManager(context);
		 
	}
	
	public void setItems(ArrayList<Tweet> tweets){
		this.tweets = tweets;
		this.notifyDataSetChanged();
	}

    @Override
    public Tweet getItem(int position) {
        return this.tweets.get(position);
    }

    @Override
	public View getView(final int position, View convertView, ViewGroup parent)
	{

		ViewHolder holder;

		//Get the current alert object
		final Tweet tweet = getItem(position);

		//Inflate the view
		if(convertView==null){
			convertView = this.mInflater.inflate(this.textViewResourceId, parent, false);
			holder = new ViewHolder();
			holder.layoutOwner = (RelativeLayout)convertView.findViewById(R.id.layoutOwner);
			holder.imgTwitterOwner = (ImageView)convertView.findViewById(R.id.imgTwitterOwner);
			holder.lblLastTweetFrom = (TextView)convertView.findViewById(R.id.lblLastTweetFrom);
			holder.lblLastTweet = (TextView)convertView.findViewById(R.id.lblLastTweet);
			
			convertView.setTag(holder);
		}
		else{
			holder = (ViewHolder)convertView.getTag();
		}


		//Assign the appropriate data from our alert object above
		holder.layoutOwner.setVisibility(View.VISIBLE);
		holder.layoutOwner.setPadding(8, 8, 8, 8);
		holder.imgTwitterOwner.setTag(tweet.getProfileImageUrl());
		imageManager.displayImage(tweet.getProfileImageUrl(), (Activity)context, holder.imgTwitterOwner);
		holder.imgTwitterOwner.setVisibility(View.VISIBLE);
		holder.imgTwitterOwner.setOnClickListener(new OnClickListener(){

			@Override
			public void onClick(View v) {
				Intent viewTwitter = new Intent(Intent.ACTION_VIEW, Uri.parse("http://mobile.twitter.com/"+tweet.getFromUser()));
				context.startActivity(viewTwitter);
			}
			
		});
		Calendar cal = Calendar.getInstance();
		cal.setTime(tweet.getCreatedAt());
		Calendar rightZone = Utils.convertCalendar(cal, TimeZone.getTimeZone("GMT"));
		holder.lblLastTweetFrom.setText(tweet.getFromUser());
		holder.lblLastTweet.setText(Utils.formatDateShort(Utils.getDateFormat().format(rightZone.getTime())) + " - " 
				+ tweet.getText());

		Linkify.addLinks(holder.lblLastTweet, Linkify.ALL);
		
		return convertView;
	}

	private final static class ViewHolder {
		RelativeLayout layoutOwner;
		ImageView imgTwitterOwner;
		TextView lblLastTweetFrom;
		TextView lblLastTweet;
	}
}
