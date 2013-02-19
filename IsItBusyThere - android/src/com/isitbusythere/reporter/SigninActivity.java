package com.isitbusythere.reporter;

import java.io.IOException;
import java.net.MalformedURLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONTokener;

import twitter4j.auth.RequestToken;
import android.app.Activity;
import android.app.ProgressDialog;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;

import com.facebook.Request;
import com.facebook.Response;
import com.facebook.Session;
import com.facebook.SessionState;
import com.facebook.Settings;
import com.facebook.UiLifecycleHelper;
import com.facebook.model.GraphUser;
import com.facebook.widget.LoginButton;
import com.isitbusythere.reporter.app.ReporterProvider;
import com.isitbusythere.reporter.foursquare.FSqDialogError;
import com.isitbusythere.reporter.foursquare.Foursquare;
import com.isitbusythere.reporter.foursquare.Foursquare.FSqDialogListener;
import com.isitbusythere.reporter.foursquare.FoursquareError;
import com.isitbusythere.reporter.helpers.AnalyticsUtils;
import com.isitbusythere.reporter.helpers.Utils;
import com.isitbusythere.reporter.model.ImageSize;
import com.isitbusythere.reporter.model.User;

public class SigninActivity extends Activity {
	
	private static final String TAG = "SignInActivity";

	private Foursquare foursquare;
	private SharedPreferences settings;
	private Long userId;
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        
    	super.onCreate(savedInstanceState);
        
    	setContentView(R.layout.main);
    	
    	settings = getSharedPreferences(getString(R.string.PREFS_NAME), 0);
		userId = settings.getLong("userId", -1);
        
		foursquare = new Foursquare(
				getString(R.string.FOURSQUARE_CLIENT_ID),
				getString(R.string.FOURSQUARE_CLIENT_SECRET),
				"http://foursq_callback");
	    
        AnalyticsUtils.getInstance(getApplicationContext()).trackPageView("SigninActivity");

        Button btnFoursquareLogin = (Button) findViewById(R.id.btnFoursquareLogin);
        btnFoursquareLogin.setOnClickListener(new OnClickListener(){

			@Override
			public void onClick(View v) {
				foursquare.authorize(SigninActivity.this, new FoursquareAuthenDialogListener());
			}
        	
        });
       
    }
    
    private class FoursquareAuthenDialogListener implements FSqDialogListener {

		@Override
		public void onComplete(Bundle values) {
			new GetFoursquareUserInfo().execute();
		}

		@Override
		public void onFoursquareError(FoursquareError e) {
			// TODO Auto-generated method stub
			Log.i("foursq", "Foursq error", e);
		}

		@Override
		public void onError(FSqDialogError e) {
			// TODO Auto-generated method stub
			Log.i("foursq", "Foursq error", e);
		}

		@Override
		public void onCancel() {
			// TODO Auto-generated method stub

		}

	}
    


	class GetFoursquareUserInfo extends AsyncTask<Void, Void, User> {

		@Override
		protected User doInBackground(Void... params) {
			String response = null;
			User user = new User();
			try {
				response = foursquare.request("users/self");
				Log.d("foursq", response);
				// store user id
				JSONObject resultsObj = (JSONObject) new JSONTokener(response)
						.nextValue();
				JSONObject userObj = resultsObj
						.getJSONObject("response").getJSONObject("user");
				settings.edit()
						.putString("foursquareId", userObj.getString("id"))
						.commit();
				JSONObject photoObj = userObj.getJSONObject("photo");
				user.setFirstName(userObj.getString("firstName"));
				user.setLastName(userObj.getString("lastName"));
				user.setFoursquareUserId(userObj.getString("id"));
				user.setPhotoUrl(photoObj.getString("prefix") + "300x300" + photoObj.getString("suffix"));
				settings.edit().putString("photoUrl", photoObj.getString("prefix") + "300x300" + photoObj.getString("suffix")).commit();
				
			} catch (MalformedURLException e) {
				Log.e("foursq", "MalformedURLException", e);
			} catch (IOException e) {
				Log.e("foursq", "IOException", e);
			} catch (JSONException e) {
				Log.e("foursq", "JSONException", e);
			}

			return user;
		}

		@Override
		protected void onPostExecute(User user) {
			new UpdateUserAsync().execute(user);
		}

	}
    
    
	/*
    private void updateFBFriends(final User busyUser){
    	Request.newMyFriendsRequest(Session.getActiveSession(), new Request.GraphUserListCallback() {
			
			@Override
			public void onCompleted(List<GraphUser> friends, Response response) {
				Log.i(TAG, "newMyFriendsRequest completed");
	        	
	        	List<String> friendIds = new ArrayList<String>(friends.size());
				
				for (GraphUser gu : friends){
					friendIds.add(gu.getId());
				}
				String[] ids = friendIds.toArray(new String[friendIds.size()]);
				String fbFriendsString = Utils.join(ids, ",");
				
				settings.edit().putString("fbFriends", fbFriendsString).commit();
				
				redirectOut(busyUser);
			}
		}).executeAsync();
    }
    
    private void redirectOut(User busyUser){
    	new UpdateUserAsync().execute(busyUser);
    }
    */
	
    private class UpdateUserAsync extends AsyncTask<User,Void,Void>{
    	
    	private ProgressDialog progressDialog = new ProgressDialog(SigninActivity.this);
		
		@Override
		protected void onPreExecute() {
			progressDialog.setMessage(getString(R.string.LoggingIn));
			progressDialog.setCancelable(false);
			progressDialog.show();
		}

		@Override
		protected Void doInBackground(User... params) {
			Long id = ReporterProvider.Instance().registerOrUpdateUser(SigninActivity.this, params[0]);
			
			Log.i(TAG, "store id - " + id);
			settings.edit().putLong("userId", id).commit();
			userId = id;
			return null;
		}

		@Override
		protected void onPostExecute(Void result) {		
			progressDialog.dismiss();
			
			AnalyticsUtils.getInstance(getApplicationContext()).trackEvent("Android", "FBLogin", "Main", 1);
			
			Intent goLastCheckin = new Intent(SigninActivity.this, CurrentActivity.class);
			startActivity(goLastCheckin);
			
			finish();
		}
		
		
		
    }
	
}