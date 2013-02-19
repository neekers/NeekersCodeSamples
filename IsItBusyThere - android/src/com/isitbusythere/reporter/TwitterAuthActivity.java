package com.isitbusythere.reporter;

import twitter4j.Twitter;
import twitter4j.TwitterException;
import twitter4j.TwitterFactory;
import twitter4j.auth.AccessToken;
import twitter4j.auth.RequestToken;
import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

import com.isitbusythere.reporter.helpers.AnalyticsUtils;

public class TwitterAuthActivity extends Activity {

	private Twitter twitter;
	private RequestToken requestToken = null;
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		
		super.onCreate(savedInstanceState);
		
        AnalyticsUtils.getInstance(getApplicationContext()).trackPageView("TwitterAuthActivity");

        twitter = new TwitterFactory().getInstance();
		twitter.setOAuthConsumer(getString(R.string.TWITTER_APP_KEY), getString(R.string.TWITTER_APP_SECRET));
	    
		Bundle extras = getIntent().getExtras();
		if (extras != null && extras.containsKey("auth")){
			new GetTwitterToken().execute();
		}
	}
	
	class GetTwitterToken extends AsyncTask<Void,Void,RequestToken>{

		@Override
		protected RequestToken doInBackground(Void... params) {
			RequestToken token = null;
			try {
				token = twitter.getOAuthRequestToken("isitbusythere://twitter_connect");
			} catch (TwitterException e1) {
				Log.e("twitter", "bad call getOAuthRequestToken", e1);
			}
		  
			return token;
		}

		@Override
		protected void onPostExecute(RequestToken token) {
			Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(token.getAuthorizationURL()));
			browserIntent.setFlags(Intent.FLAG_ACTIVITY_NO_HISTORY);
		    startActivity(browserIntent);
			requestToken = token;
		}
		
	}

	/**
     * As soon as the user successfully authorized the app, we are notified
     * here. Now we need to get the verifier from the callback URL, retrieve
     * token and token_secret and feed them to twitter4j (as well as
     * consumer key and secret).
     */
    @Override
    protected void onNewIntent(Intent intent) {

        super.onNewIntent(intent);
        
        if (twitter == null){
    		twitter = new TwitterFactory().getInstance();	
    		twitter.setOAuthConsumer(getString(R.string.TWITTER_APP_KEY), getString(R.string.TWITTER_APP_SECRET));
    	}
	    
        new GetUserToken().execute();
    }
    
    class GetUserToken extends AsyncTask<Void,Void,Void>{

		@Override
		protected Void doInBackground(Void... params) {
			AccessToken accessToken = null;
			   
		      try{
		         accessToken = twitter.getOAuthAccessToken(requestToken);
		           
		         //persist to the accessToken for future reference.
				 Log.i("twitter", "accessToken - " + accessToken.getUserId());
				 Log.i("twitter", "accessToken - " + accessToken.getScreenName());
				    
				 TwitterSessionStore.save(accessToken, TwitterAuthActivity.this);
				 
		      }
		      catch(Exception e){
		    	  Log.e("twitter", "bad twitter", e);

		    	  Toast.makeText(TwitterAuthActivity.this, R.string.AProblemHasOccurred, Toast.LENGTH_LONG).show();
		      }
		      
			return null;
		}

		@Override
		protected void onPostExecute(Void result) {
			 Toast.makeText(TwitterAuthActivity.this, R.string.TwitterAccountLinkedSuccessfully, Toast.LENGTH_LONG).show();
		      
		      Intent showReportIn = new Intent(TwitterAuthActivity.this, CurrentActivity.class);
		      showReportIn.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
		      startActivity(showReportIn);
		}
    	
    }
	
}
