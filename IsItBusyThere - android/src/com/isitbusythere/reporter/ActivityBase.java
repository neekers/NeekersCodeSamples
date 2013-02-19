package com.isitbusythere.reporter;

import twitter4j.Twitter;
import twitter4j.TwitterFactory;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.ProgressDialog;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.Configuration;
import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;

import com.isitbusythere.reporter.foursquare.Foursquare;
import com.isitbusythere.reporter.model.User;

@SuppressLint("Registered")
public class ActivityBase extends Activity{
	protected Twitter twitter;
	protected Boolean twitterRestored = false;
	protected Boolean foursquareLinked = false;
	protected Foursquare foursquare;
	protected String facebookId;
	protected SharedPreferences settings;
	protected User currentUser;
	
	protected static final int RADIUS = 152;

	@Override
	protected void onCreate(Bundle savedInstanceState) {

		settings = getSharedPreferences(getString(R.string.PREFS_NAME), 0);
		currentUser = new User();
		currentUser.setUserId(settings.getLong("userId", -1));
		currentUser.setPhotoUrl(settings.getString("photoUrl", ""));
		
		super.onCreate(savedInstanceState);
		
		foursquare = new Foursquare(
				getString(R.string.FOURSQUARE_CLIENT_ID),
				getString(R.string.FOURSQUARE_CLIENT_SECRET),
				"http://foursq_callback");
		
		foursquareLinked = FoursquareSessionStore.restore(foursquare, this);
		String foursquareId = settings.getString("foursquareId", "-1");
		if (foursquareLinked){
			Log.i("foursq", "foursquareLinked = true - " + foursquareId);
			currentUser.setFoursquareUserId(foursquareId);
		}

		if (foursquareId.equalsIgnoreCase("-1") || currentUser.getUserId() == -1 || currentUser.getPhotoUrl().length() == 0){
			Intent signin = new Intent(ActivityBase.this, SigninActivity.class);
			signin.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
			startActivity(signin);
			finish();
			return;
		}
		
		//setup social networks
		twitter = new TwitterFactory().getInstance();
		twitterRestored = TwitterSessionStore.restore(twitter, ActivityBase.this);
		
		
	}

	@Override
	public void onConfigurationChanged(Configuration newConfig) {
		super.onConfigurationChanged(newConfig);
	}
	
	protected class FacebookLogout extends AsyncTask<Void,Void,String>{
    	private ProgressDialog progressDialog = new ProgressDialog(ActivityBase.this);
    	
		@Override
		protected void onPreExecute() {
			try{
				progressDialog.setMessage(getString(R.string.LoggingOut));
				progressDialog.show();
			}
			catch(Exception e){
				
			}
		}

		@Override
		protected String doInBackground(Void... arg0) {
			String logoutResult = "";
			
			
			return logoutResult;
		}

		@Override
		protected void onPostExecute(String logoutResult) {
			progressDialog.dismiss();
			
			settings.edit().clear().commit();
			FacebookSessionStore.clear(ActivityBase.this);
			TwitterSessionStore.clear(ActivityBase.this);
			FoursquareSessionStore.clear(ActivityBase.this);
			Intent signIn = new Intent(ActivityBase.this, SigninActivity.class);
			signIn.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
			startActivity(signIn);
			
			finish();
		}
    }
	
}
