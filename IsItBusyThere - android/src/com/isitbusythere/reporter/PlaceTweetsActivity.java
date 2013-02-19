package com.isitbusythere.reporter;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.TimeZone;

import twitter4j.GeoLocation;
import twitter4j.Query;
import twitter4j.QueryResult;
import twitter4j.Tweet;
import twitter4j.Twitter;
import twitter4j.TwitterException;
import twitter4j.TwitterFactory;
import twitter4j.User;
import android.app.Activity;
import android.app.ProgressDialog;
import android.content.Intent;
import android.location.LocationListener;
import android.location.LocationManager;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Bundle;
import android.text.util.Linkify;
import android.util.Log;
import android.view.MenuItem;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.ImageButton;
import android.widget.ListView;
import android.widget.RelativeLayout;
import android.widget.TextView;

import com.isitbusythere.reporter.data.TweetsAdapter;
import com.isitbusythere.reporter.helpers.ImageManager;
import com.isitbusythere.reporter.helpers.Utils;
import com.isitbusythere.reporter.model.FoursquareVenueSmall;

public class PlaceTweetsActivity extends ActivityBase {
	protected LocationManager locationManager;
	protected LocationListener locationListener;
	private ListView lv;
	protected Twitter twitter;
	private ImageManager imageManager;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		
		super.onCreate(savedInstanceState);
	
		setContentView(R.layout.placetweets_activity);
	
		imageManager = new ImageManager(PlaceTweetsActivity.this);
		twitter = new TwitterFactory().getInstance();
		getActionBar().setDisplayHomeAsUpEnabled(true);

		RelativeLayout layoutOwner = (RelativeLayout) findViewById(R.id.layoutOwner);
		
		Bundle extras = getIntent().getExtras();
		if (extras != null && extras.containsKey("venuSmall")){
			FoursquareVenueSmall venueSmall = (FoursquareVenueSmall) extras.get("venuSmall");
			
			setTitle(R.string.TweetsWithinTheHour);
			
			//Get tweets from near me
			new GetOwnersLastTweet().execute(venueSmall.getTwitter());
			if (venueSmall.getTwitter() != null){
				new GetTweets().execute(venueSmall);

				layoutOwner.setVisibility(View.VISIBLE);
			}
			else{
				layoutOwner.setVisibility(View.GONE);
			}
		}

		
		
		lv = (ListView) findViewById(android.R.id.list);
	}
	
	
	private class GetOwnersLastTweet extends AsyncTask<String,Void,User>{
		TextView lblLastTweetFrom;

		@Override
		protected void onPreExecute() {
			lblLastTweetFrom = (TextView) findViewById(R.id.lblLastTweetFrom);
			lblLastTweetFrom.setText(R.string.Loading);
		}

		@Override
		protected User doInBackground(String... params) {
			String twitterName = params[0];
			User user = null;
			
			try {
				user = twitter.showUser(twitterName);
			} catch (TwitterException e) {
				Log.i("twitter", "Bad GetOwnersTwitter call", e);
			}
			
			
			return user;
		}

		@Override
		protected void onPostExecute(final User user) {
			if (user != null){
				Log.i("twitter", "last tweet from owner: " + user.getStatus().getText());
				
				ImageButton imgTwitterOwner = (ImageButton) findViewById(R.id.imgTwitterOwner);
				TextView lblLastTweet = (TextView) findViewById(R.id.lblLastTweet);
			
				lblLastTweetFrom.setText(String.format(getString(R.string.LastTweetFrom), user.getName()));
				imgTwitterOwner.setTag(user.getProfileImageURL().toExternalForm());
				imageManager.displayImage(user.getProfileImageURL().toExternalForm(), (Activity)PlaceTweetsActivity.this, imgTwitterOwner);
				imgTwitterOwner.setVisibility(View.VISIBLE);
				imgTwitterOwner.setOnClickListener(new OnClickListener(){

					@Override
					public void onClick(View v) {
						Intent viewTwitter = new Intent(Intent.ACTION_VIEW, Uri.parse("http://mobile.twitter.com/"+user.getScreenName()));
						startActivity(viewTwitter);
					}
					
				});
				
				Calendar cal = Calendar.getInstance();
				cal.setTime(user.getStatus().getCreatedAt());
				Calendar rightZone = Utils.convertCalendar(cal, TimeZone.getTimeZone("GMT"));
				lblLastTweet.setText(Utils.formatDateShort(Utils.getDateFormat().format(rightZone.getTime())) + " - " 
						+ user.getStatus().getText());
				lblLastTweet.setVisibility(View.VISIBLE);
				Linkify.addLinks(lblLastTweet, Linkify.ALL);
				
				
			}
		}
		
	}
	
	private class GetTweets extends AsyncTask<FoursquareVenueSmall,Void,ArrayList<Tweet>>{
		private ProgressDialog dialog = new ProgressDialog(PlaceTweetsActivity.this);
		
		@Override
		protected void onPreExecute() {
			dialog.setMessage(getString(R.string.LoadingTweets));
			dialog.show();
		}
		
		@Override
		protected ArrayList<Tweet> doInBackground(FoursquareVenueSmall... arg0) {
			FoursquareVenueSmall venue = arg0[0];
			ArrayList<Tweet> tweets = null;
			Calendar calHourAgo = Calendar.getInstance();
			calHourAgo.set(Calendar.HOUR, calHourAgo.get(Calendar.HOUR)-1);
			
			Query q = new Query();
			q.setGeoCode(new GeoLocation(venue.getLat(), venue.getLng()), 0.5, "mi");
			q.setQuery(venue.getName());
			q.setResultType("recent");
			q.setRpp(20);
			
			Log.i("twitter", "search twitter: " + venue.getName());
			Log.i("twitter", "search tweet: " + q.getGeocode());
			
			try {
				QueryResult response = twitter.search(q);
				
				Log.i("twitter", "search tweets count - " + String.valueOf(response.getTweets().size()));
				
				if (response.getTweets().size() > 0){
					tweets = new ArrayList<Tweet>();
					for (Tweet tweet : response.getTweets()){
						Log.i("twitter", "recent tweet: " + tweet.getText());
						Log.i("twitter", "recent created at: " + Utils.getDateFormat().format(tweet.getCreatedAt()));
						
						if (tweet.getCreatedAt().after(calHourAgo.getTime())){
							tweets.add(tweet);
						}
					}
				}
				
			} catch (TwitterException e) {
				Log.e("twitter", "Bad call to get recent tweets", e);
			}
			
			return tweets;
		}

		@Override
		protected void onPostExecute(ArrayList<Tweet> tweets) {
			dialog.dismiss();
			
			if (tweets != null && tweets.size() > 0){
				lv.setAdapter(new TweetsAdapter(PlaceTweetsActivity.this, R.layout.tweet_item, tweets));
			}
			else{
				TextView lblNoTweets = (TextView) findViewById(R.id.lblNoTweets);
				lblNoTweets.setVisibility(View.VISIBLE);
				lv.setVisibility(View.GONE);
			}
		}

		
		
	}
	

	@Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
            	
            case android.R.id.home:
                finish();
                return true;
            
        }
        return super.onOptionsItemSelected(item);
    }
	
	@Override
	protected void onDestroy() {
		if (locationManager != null && locationListener != null){
			locationManager.removeUpdates(locationListener);
		}
		
		super.onDestroy();
	}

}
