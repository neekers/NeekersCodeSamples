package com.isitbusythere.reporter;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.SortedSet;
import java.util.TimeZone;
import java.util.TreeSet;

import twitter4j.GeoLocation;
import twitter4j.StatusUpdate;
import twitter4j.TwitterException;
import twitter4j.User;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.app.ProgressDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.text.util.Linkify;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.Window;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.Button;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.ImageView.ScaleType;
import android.widget.LinearLayout;
import android.widget.ListView;
import android.widget.RelativeLayout;
import android.widget.TableLayout;
import android.widget.TextView;
import android.widget.Toast;

import com.isitbusythere.reporter.app.AppEnvironment;
import com.isitbusythere.reporter.app.CurrentEnvironment;
import com.isitbusythere.reporter.app.FoursquareProvider;
import com.isitbusythere.reporter.app.ReporterProvider;
import com.isitbusythere.reporter.data.StatusesAdapter;
import com.isitbusythere.reporter.helpers.AnalyticsUtils;
import com.isitbusythere.reporter.helpers.ImageManager;
import com.isitbusythere.reporter.helpers.Utils;
import com.isitbusythere.reporter.model.BusyStatusType;
import com.isitbusythere.reporter.model.FoursquareVenue;
import com.isitbusythere.reporter.model.FoursquareVenueSmall;
import com.isitbusythere.reporter.model.ImageSize;
import com.isitbusythere.reporter.model.Question;
import com.isitbusythere.reporter.model.UserReport;
import com.isitbusythere.reporter.model.VenueReport;

public class ReportInActivity extends ActivityBase {
	
	private GetReportAsync getReportTask;
	private VenueReport currentVenueReport = null;
	private UserReport currentUserReport = null;
	private StatusesAdapter adapter;
	private LayoutInflater inflater;
	
	private FrameLayout frameBusy;
	private FrameLayout frameNotBusy;
	TextView lblPlaceName;
	TextView lblPlaceAddress;
	TextView lblBusyCount;
	TextView lblNotBusyCount;
	TextView lblBusyIndicator;
	ImageButton btnPostToFacebook;
	ImageButton btnPostToFoursquare;
	ImageButton btnPostToTwitter;
	ImageButton imgPlaceIcon;
	private ListView lv;
	private ImageManager imageManager;
	private LinearLayout layoutPeople;
	private TableLayout layoutAnswers;
	private TextView lblPeopleCount;
	private Button btnTweetOwner;
	private RelativeLayout layoutOwner;
	private EditText txtTextUpdate;
	
	private Boolean postToFacebook = true;
	private Boolean postToFoursquare = true;
	private Boolean postToTwitter = true;
	private ProgressDialog progressDialog;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		setContentView(R.layout.checkins_activity);
		
		if (currentUser.getUserId() == -1){
			return;
		}
		
		getActionBar().setDisplayHomeAsUpEnabled(true);
		progressDialog = new ProgressDialog(ReportInActivity.this);
		
		lblBusyIndicator = (TextView) findViewById(R.id.lblBusyIndicator);
		lblPlaceName = (TextView) findViewById(R.id.lblPlaceName);
		lblPlaceAddress = (TextView) findViewById(R.id.lblPlaceAddress);
		lblBusyCount = (TextView) findViewById(R.id.lblBusyCount);
		lblNotBusyCount = (TextView) findViewById(R.id.lblNotBusyCount);
		btnPostToFacebook = (ImageButton) findViewById(R.id.btnPostToFacebook);
		btnPostToFoursquare = (ImageButton) findViewById(R.id.btnPostToFoursquare);
		btnPostToTwitter = (ImageButton) findViewById(R.id.btnPostToTwitter);
		lv = (ListView) findViewById(android.R.id.list);
		layoutPeople = (LinearLayout) findViewById(R.id.layoutPeople);
		layoutAnswers = (TableLayout) findViewById(R.id.layoutAnswers);
		lblPeopleCount = (TextView) findViewById(R.id.lblPeopleCount);
		btnTweetOwner = (Button) findViewById(R.id.btnTweetOwner);
		imgPlaceIcon = (ImageButton) findViewById(R.id.imgPlaceIcon);
		layoutOwner = (RelativeLayout) findViewById(R.id.layoutOwner);
		txtTextUpdate = (EditText) findViewById(R.id.txtTextUpdate);
		btnTweetOwner.setOnClickListener(new TweetOwnerClickListener());
		
		lblPlaceName.setOnClickListener(new PlacePageOnClickListener());
		lblPlaceAddress.setOnClickListener(new PlacePageOnClickListener());
		btnPostToFacebook.setImageResource(R.drawable.social_facebook);
		btnPostToTwitter.setImageResource(R.drawable.social_twitter);
		btnPostToFoursquare.setImageResource(R.drawable.social_foursquare);
		btnPostToFacebook.setOnClickListener(new OnClickListener(){

			@Override
			public void onClick(View arg0) {
				postToFacebook = !postToFacebook;
				btnPostToFacebook.setImageResource(postToFacebook ? R.drawable.social_facebook : R.drawable.social_facebook_off);
			}
			
		});
		
		final Button btnNotBusy = (Button) findViewById(R.id.btnNotBusy);
		final Button btnBusy = (Button) findViewById(R.id.btnBusy);
		frameBusy = (FrameLayout) findViewById(R.id.frameBusy);
		frameNotBusy = (FrameLayout) findViewById(R.id.frameNotBusy);
		
		if (!twitterRestored){
			btnPostToTwitter.setImageResource(R.drawable.social_twitter_off);
			postToTwitter = false;
		}
		
		btnPostToTwitter.setOnClickListener(new OnClickListener(){

			@Override
			public void onClick(View v) {
				if (!twitterRestored){
					
					AlertDialog.Builder builder = new AlertDialog.Builder(ReportInActivity.this);
					builder.setMessage(R.string.DoYouWantToLinkYourTwitterAccount)
					       .setCancelable(false)
					       .setPositiveButton("Yes", new DialogInterface.OnClickListener() {
					           public void onClick(DialogInterface dialog, int id) {
									Intent twitterAuth = new Intent(ReportInActivity.this, TwitterAuthActivity.class);
									twitterAuth.putExtra("auth", true);
									startActivity(twitterAuth);
					           }
					       })
					       .setNegativeButton("No", new DialogInterface.OnClickListener() {
					           public void onClick(DialogInterface dialog, int id) {
					        	   btnPostToTwitter.setImageResource(R.drawable.social_twitter_off);
					        	   postToTwitter = false;
					        	   dialog.cancel();
					           }
					       });
					AlertDialog alert = builder.create();
					alert.show();
				}
				else{
					postToTwitter = !postToTwitter;
					btnPostToTwitter.setImageResource(postToTwitter ? R.drawable.social_twitter : R.drawable.social_twitter_off);
				}
			}
        	
        });
		
		btnPostToFoursquare.setOnClickListener(new OnClickListener(){

			@Override
			public void onClick(View v) {
				postToFoursquare = !postToFoursquare;
				btnPostToFoursquare.setImageResource(postToFoursquare ? R.drawable.social_foursquare : R.drawable.social_foursquare_off);
			}
        	
        });
		
		inflater = this.getLayoutInflater();
		imageManager = new ImageManager(ReportInActivity.this);
		getReportTask = new GetReportAsync();
		
		//Set the UI for a user selected Place from search
		Intent i = getIntent();
		Bundle bdl = i.getExtras();
		if (bdl != null && bdl.containsKey("place")){
			FoursquareVenue v = (FoursquareVenue) bdl.getParcelable("place");
			Log.i("checkins", "Place selected from search - " + v.getName());
			
			new GetFoursquareVenueAsync().execute(v.getId());
		}
		else if (bdl != null && bdl.containsKey("venueId")){
			new GetFoursquareVenueAsync().execute(bdl.getString("venueId"));
		}
		
		btnNotBusy.setOnClickListener(new ReportInClickListener(BusyStatusType.NotBusy));
		btnBusy.setOnClickListener(new ReportInClickListener(BusyStatusType.Busy));
		
		lv.setOnItemClickListener(new OnItemClickListener(){

			@Override
			public void onItemClick(AdapterView<?> parent, View view, int position,
					long id) {
				UserReport selectedStatus = (UserReport) parent.getItemAtPosition(position);
				
				Log.i("reportin", "selectedStatus - " + selectedStatus.getPlace().getName());
				
				//send to home to report in
				Intent viewProfile = new Intent(ReportInActivity.this, ProfileActivity.class);
				viewProfile.putExtra("status", selectedStatus);
				startActivity(viewProfile);
			}
			
		});
		
		AnalyticsUtils.getInstance(ReportInActivity.this).trackPageView("HomeActivity");
	}
	
	private class ReportInClickListener implements OnClickListener{
		private BusyStatusType busyStatusType;
		
		public ReportInClickListener(BusyStatusType busyStatusType){
			this.busyStatusType = busyStatusType;
		}
		
		@Override
		public void onClick(View v) {
			if (currentUserReport == null){
				currentUserReport = new UserReport(currentUser.getUserId(), currentUser.getFoursquareUserId(), currentVenueReport.getPlace());
			}
			currentUserReport.setIsItBusy(this.busyStatusType);
			currentUserReport.setStatus(txtTextUpdate.getText().toString());
			txtTextUpdate.setText("");
			txtTextUpdate.clearFocus();
			
			new ReportInAsync().execute(currentUserReport);
		}
	}
	
	private class GetReportAsync extends AsyncTask<FoursquareVenue,Void,VenueReport>{
		
		@Override
		protected void onPreExecute() {
			progressDialog.setMessage(getString(R.string.GettingReports));
		}

		@Override
		protected VenueReport doInBackground(FoursquareVenue... params) {
			currentVenueReport = ReporterProvider.Instance().getReport(currentUser.getUserId(), ReportInActivity.this, params[0], null); 
			
			//Map current user report
			Log.i("reportIn", "currentUser.getFoursquareUserId() - " + currentUser.getFoursquareUserId());
			for (UserReport userReport : currentVenueReport.getStatuses()){
				Log.i("reportIn", "report fsq - " + userReport.getFoursquareUserId());
				if (userReport.getFoursquareUserId().equalsIgnoreCase(currentUser.getFoursquareUserId())){
					Log.i("reportIn", "found user report - " + userReport.getId());
					currentUserReport = userReport;
					currentUserReport.setPlace(currentVenueReport.getPlace());
					invalidateOptionsMenu();
					break;
				}
			}
			
			return currentVenueReport;
		}

		@Override
		protected void onPostExecute(VenueReport venueReport) {
			
			lblPlaceName.setText(venueReport.getPlace().getName().length() > 35 ? venueReport.getPlace().getName().substring(0, 35) : venueReport.getPlace().getName());
			lblPlaceAddress.setText(venueReport.getPlace().getLocation().getAddress());
			
			setIsBusyUI();
			
			progressDialog.dismiss();
		}
		
		
	}
	
	private void setIsBusyUI(){
		
		lblBusyIndicator.setText(currentVenueReport.getIsItBusy() ? getString(R.string.Busy).toUpperCase() : "");
		lblBusyIndicator.setTextColor(Color.parseColor(getString(currentVenueReport.getIsItBusy() ? R.color.Busy : R.color.navy)));
		
		lblBusyCount.setText(String.format(getString(R.string.BusyCount), currentVenueReport.getBusyCount()));
		lblNotBusyCount.setText(String.format(getString(R.string.NotBusyCount), currentVenueReport.getNotBusyCount()));
		
		//Filter out Busy users from Foursquare statuses
		SortedSet<String> userIds = new TreeSet<String>();
		for (UserReport ur : currentVenueReport.getStatuses()){
			userIds.add(ur.getFoursquareUserId());
		}
		ArrayList<UserReport> lessBusyUsers = new ArrayList<UserReport>();
		for (UserReport ur : currentVenueReport.getPlace().getStatuses()){
			if (!userIds.contains(ur.getFoursquareUserId())){
				lessBusyUsers.add(ur);
			}
		}
		currentVenueReport.getPlace().setStatuses(lessBusyUsers);
		lblPeopleCount.setText(String.format(getString(R.string.PeopleCountHere), currentVenueReport.getPlace().getHereNow().count + currentVenueReport.getStatuses().size()));
		
		//Update the total number of people from both sources
		currentVenueReport.setTotalPeopleCount(currentVenueReport.getStatuses().size() + currentVenueReport.getPlace().getHereNow().getCount());
		
		//Show the button to Tweet the owner and ask what's up there
		if (lv.getVisibility() != View.VISIBLE && 
				twitterRestored && 
				currentVenueReport.getPlace().getContact().getTwitter() != null && 
				currentVenueReport.getPlace().getContact().getTwitter().length() > 0){
			//Owner has a twitter
			btnTweetOwner.setText(String.format(getString(R.string.TweetPlaceOwnerForStatus), currentVenueReport.getPlace().getContact().getTwitter()));
			btnTweetOwner.setVisibility(View.VISIBLE);
		}
		else{
			btnTweetOwner.setVisibility(View.GONE);
		}
		
		//Get the last tweet to show
		if (currentVenueReport.getPlace().getContact().getTwitter() != null && currentVenueReport.getPlace().getContact().getTwitter().length() > 0){
			new GetVenueLastTweetAsync().execute(currentVenueReport.getPlace().getContact().getTwitter());
			
			this.invalidateOptionsMenu();
		}
		
		//Hide the "within the hour" header since there are no statuses
		if (currentVenueReport.getStatuses().size() == 0){
			TextView lblStatuses = (TextView) findViewById(R.id.lblStatuses);
			lblStatuses.setVisibility(View.GONE);
		}
		
		//set icon
		currentVenueReport.setIconUrl(currentVenueReport.getPlace().getIconUrl(ImageSize.WIDTH_44));
		imgPlaceIcon.setTag(currentVenueReport.getIconUrl());
		imageManager.displayImage(currentVenueReport.getIconUrl(), (Activity)ReportInActivity.this, imgPlaceIcon);
		imgPlaceIcon.setOnClickListener(new OnClickListener(){

			@Override
			public void onClick(View v) {
        		Log.i("foursq", "View Similar venues");
            	FoursquareVenueSmall venueSmall = new FoursquareVenueSmall(currentVenueReport.getPlace());
				Intent viewSimilar = new Intent(ReportInActivity.this, ViewSimilarActivity.class);
				viewSimilar.putExtra("venueSmall", venueSmall);
				startActivity(viewSimilar);
			}
			
		});
		

		ArrayList<UserReport> withStatus = new ArrayList<UserReport>();
		ArrayList<UserReport> allStatuses = new ArrayList<UserReport>();
		allStatuses.addAll(currentVenueReport.getStatuses());
		allStatuses.addAll(currentVenueReport.getPlace().getStatuses());
		
		if (allStatuses.size() > 0){
			//sort statuses first
			Collections.sort(allStatuses, new Comparator<UserReport>(){

				@Override
	            public int compare(UserReport o1, UserReport o2) {
					return o1.getStatus().length() > o2.getStatus().length() ? 1 : o1.getStatus().length() < o2.getStatus().length() ? -1 : 0;
				}

			});
			
			//Separate non-updated statuses from those with updates
			layoutPeople.removeAllViews();
			Log.i("statuses", "statuses count - " + allStatuses.size());
			for (UserReport status : allStatuses){

				if (status.getStatus().length() > 0){
					Log.i("statuses", "with status");
					withStatus.add(status);
				}
				else{
					Log.i("statuses", "without status");
					showPersonNoStatus(status);
				}
			}
		}
		
		//Hide the face container if none
		if (layoutPeople.getChildCount() == 0){
			layoutPeople.setVisibility(View.GONE);
		}
		else{
			layoutPeople.setVisibility(View.VISIBLE);
		}	
		
		//Questions answered
		showAnswers(currentVenueReport.getQuestions());
		
		//List adapter for statuses
		adapter = new StatusesAdapter(ReportInActivity.this, R.layout.status_item, sortByLastUpdated(withStatus));
		lv.setAdapter(adapter);		
	
		if (currentVenueReport.getIsItBusy()){
			frameBusy.setBackgroundColor(Color.parseColor(getString(R.color.Busy)));
			frameNotBusy.setBackgroundColor(Color.TRANSPARENT);
		}
		else{
			frameBusy.setBackgroundColor(Color.TRANSPARENT);
			frameNotBusy.setBackgroundColor(Color.parseColor(getString(R.color.NotBusy)));
		}
	}
	
	private class GetFoursquareVenueAsync extends AsyncTask<String,Void,FoursquareVenue>{

		@Override
		protected void onPreExecute() {
			progressDialog.setMessage(getString(R.string.LoadingPlace));
			progressDialog.show();
		}
		
		@Override
		protected FoursquareVenue doInBackground(String... params) {
			
			return FoursquareProvider.Instance().getFoursquareVenueById(foursquare, params[0]);
		}

		@Override
		protected void onPostExecute(FoursquareVenue venue) {
			if (venue == null) return;
			
			getReportTask.execute(venue);
		}
	}
	
	private class ReportInAsync extends AsyncTask<UserReport,Void,VenueReport>{
		
		@Override
		protected void onPreExecute() {
			progressDialog.setMessage(getString(R.string.ReportingIn));
			progressDialog.show();
			
		}

		@Override
		protected VenueReport doInBackground(UserReport... arg) {
			//post to reportInServer
			VenueReport reportReturn = ReporterProvider.Instance().reportIn(arg[0], null);
			
			return reportReturn;
		}

		@Override
		protected void onPostExecute(VenueReport report) {
			progressDialog.dismiss();
			
			if (report == null){
				Toast.makeText(ReportInActivity.this, R.string.ProblemReportingIn, Toast.LENGTH_LONG).show();
				return;
			}
			
			new PostToSocialNetworksAsync().execute(report);
			
			report.setPlace(currentVenueReport.getPlace());
			currentVenueReport = report;
			
			//Map current user report
			for (UserReport userReport : currentVenueReport.getStatuses()){
				if (userReport.getFoursquareUserId() == currentUser.getFoursquareUserId()){
					currentUserReport = userReport;
					break;
				}
			}
			
			if (txtTextUpdate.getText().toString().length() > 0){
				AnalyticsUtils.getInstance(ReportInActivity.this).trackEvent("Android", "ReportIn", "WithStatus", 1);
			}
			else{
				AnalyticsUtils.getInstance(ReportInActivity.this).trackEvent("Android", "ReportIn", "NoStatus", 1);
			}
			

			//add the current user status and update the UI
			setIsBusyUI();
			
			Toast.makeText(ReportInActivity.this, R.string.ReportedIn, Toast.LENGTH_LONG).show();
			
			invalidateOptionsMenu();
			
			//Show round 2
			Intent showRound2 = new Intent(ReportInActivity.this, QuestionsActivity.class);
			showRound2.putExtra("report", currentUserReport);
		 	startActivity(showRound2);
		}
		
	}
	
	private void showPersonNoStatus(final UserReport userReport){
		
		
		if (layoutPeople.getChildCount() > 8){
			return;
		}
		
		View layoutUser = inflater.inflate(R.layout.userphoto_item, null);
		ImageButton imgUserPhoto = (ImageButton) layoutUser.findViewById(R.id.imgUserPhoto);
		if (userReport.getPhotoUrl().length() > 0){
			imgUserPhoto.setTag(userReport.getPhotoUrl());
			imageManager.displayImage(userReport.getPhotoUrl(), ReportInActivity.this, imgUserPhoto);	
		}
		
		imgUserPhoto.setScaleType(ScaleType.FIT_CENTER);
		imgUserPhoto.setOnClickListener(new OnClickListener(){
			@Override
			public void onClick(View v) {
				Intent viewProfile = new Intent(ReportInActivity.this, ProfileActivity.class);
				/*
				 * No Facebook right now
				if (status.getStatusType() == StatusType.Facebook){
					viewProfile.putExtra("externalUserId", status.getExternalUserId());
				}
				else 
				*/
				viewProfile.putExtra("status", userReport);	
				startActivity(viewProfile);
			}
		});
		
		ImageView imgBusyStatus = (ImageView) layoutUser.findViewById(R.id.imgBusyStatus);
		int busyIcon = R.drawable.dot_notbusy;
		switch(userReport.getIsItBusy()){
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
		imgBusyStatus.setImageResource(busyIcon);
		
		LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(60, 60);
		layoutUser.setLayoutParams(params);
		layoutPeople.addView(layoutUser);
	}
	
	private void showAnswers(ArrayList<Question> questions){
		
		layoutAnswers.removeAllViews();
		
		if (questions == null || questions.size() == 0){
			layoutAnswers.setVisibility(View.INVISIBLE);
		}
		else{
			layoutAnswers.setVisibility(View.VISIBLE);
			for (Question q : questions){
				View layoutAnswer = inflater.inflate(R.layout.question_answer_item, null);
				TextView txtQuestion = (TextView) layoutAnswer.findViewById(R.id.txtQuestion);
				TextView txtCount = (TextView) layoutAnswer.findViewById(R.id.txtCount);
				
				txtQuestion.setText(q.getQuestion());
				txtCount.setText(String.format("%d reported", q.getCount()));
	
				layoutAnswers.addView(layoutAnswer);
			}
		}
	}
	

	@Override
	protected void onResume() {
		
		/*
		if (twitter == null){
			twitter = new TwitterFactory().getInstance();
		}
		Boolean twitterRestored = TwitterSessionStore.restore(twitter, HomeActivity.this);
		if (twitterRestored){
			btnPostToTwitter.setImageResource(R.drawable.social_twitter);
			postToTwitter = true;
		}
		else{
			twitter = null;
			btnPostToTwitter.setImageResource(R.drawable.social_twitter_off);
			postToTwitter = false;
		}
		
		if (currentReport == null && restoreTask.getStatus() != AsyncTask.Status.RUNNING && getReportTask.getStatus() != AsyncTask.Status.RUNNING){
			
			if (restoreTask.getStatus() == AsyncTask.Status.FINISHED){
				restoreTask = new RestoreFromSharedPrefsTask();
			}
			restoreTask.execute();
		}
		*/
		
		super.onResume();
	}
	
	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		MenuInflater menuInflater = getMenuInflater();
		menuInflater.inflate(R.menu.reportin_menu, menu);

		// Calling super after populating the menu is necessary here to ensure that the
		// action bar helpers have a chance to handle this event.
		return super.onCreateOptionsMenu(menu);
	}
	
	@Override
	public boolean onPrepareOptionsMenu(Menu menu) {

		if (currentVenueReport == null) return true;
		
		String twitterName = currentVenueReport.getPlace().getContact().getTwitter();
		if (!this.twitterRestored && (twitterName == null || twitterName.length() == 0)) {
			menu.findItem(R.id.menu_viewtweets).setVisible(false);
		}
		
		return true;
	}
	
	
    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
            	
            case android.R.id.home:
                // app icon in Action Bar clicked; go home
                Intent intent = new Intent(this, CurrentActivity.class);
                intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(intent);
                return true;
                
            case R.id.menu_viewtweets:
            	Intent showTweets = new Intent(ReportInActivity.this, PlaceTweetsActivity.class);
            	showTweets.putExtra("venuSmall", new FoursquareVenueSmall(currentVenueReport.getPlace()));
            	startActivity(showTweets);
            	return true;
            	
            case R.id.menu_similar:
        		Log.i("foursq", "View Similar venues");
            	FoursquareVenueSmall venueSmall = new FoursquareVenueSmall(currentVenueReport.getPlace());
				Intent viewSimilar = new Intent(ReportInActivity.this, ViewSimilarActivity.class);
				viewSimilar.putExtra("venueSmall", venueSmall);
				startActivity(viewSimilar);
				return true;
            
        }
        return super.onOptionsItemSelected(item);
    }
    
    private class PlacePageOnClickListener implements OnClickListener{
		@Override
		public void onClick(View v) {
			Intent openPlacePage = new Intent(Intent.ACTION_VIEW, Uri.parse(currentVenueReport.getPlace().getUrl()));
			startActivity(openPlacePage);
			
			//This is to show a page with an interactive map, but I think it's stupid for now
			/*
			Intent placePage = new Intent(ReportInActivity.this, PlaceActivity.class);
			placePage.putExtra("currentReport", currentReport);
			startActivity(placePage);
			*/
		}
    }
    
    
	private class PostToSocialNetworksAsync extends AsyncTask<VenueReport,Void,Void>{

		@Override
		protected Void doInBackground(VenueReport... params) {
			VenueReport reportReturn = params[0];
			
			String response = "";
			String message = reportReturn.getPlace().getName() + " - " + reportReturn.getPlace().getLocation().getCity() + " is " + 
			(reportReturn.getIsItBusy() ? getString(R.string.Busy).toUpperCase() : getString(R.string.NotBusy).toUpperCase());
			String postPhoto = reportReturn.getIsItBusy() ? "https://lh3.googleusercontent.com/-ySFxpd2tpmQ/UOLVEMw0tHI/AAAAAAAATOI/59sHyr4WwPA/s912/2012-12-31%2023.57.42.jpg" :
				"http://farm1.staticflickr.com/10/15161361_7dea14791c_b.jpg";
			
			/*
			if (CurrentEnvironment.environment == AppEnvironment.Production && postToFacebook){
				//post to facebook
				Bundle params2 = new Bundle();
				params2.putString("name", message);
				params2.putString("picture", postPhoto);
				params2.putString("message", reportReturn.getStatus());
				if (reportReturn.getFacebookPlaceId() != null && reportReturn.getFacebookPlaceId().length() > 0){
					params2.putString("place", reportReturn.getFacebookPlaceId());
				}
				params2.putString("link", reportReturn.getPlace().getUrl());
				
				try {
					response = facebook.request("me/feed", params2, "POST");
					Log.i("checkins", "fb post response - " + response);
				} catch (MalformedURLException e) {
					Log.e("facebook", "bad feed post", e);
				} catch (IOException e) {
					Log.e("facebook", "bad feed post", e);
				}
			}
			*/
			
			//Twitter post
			if (twitterRestored && CurrentEnvironment.environment == AppEnvironment.Production && postToTwitter){
				//add hashtags
				message = reportReturn.getPlace().getName() + " - " + reportReturn.getPlace().getLocation().getCity() + " is #" + 
				(reportReturn.getIsItBusy() ? getString(R.string.Busy).toUpperCase() : getString(R.string.NotBusyNoSpaces).toUpperCase()) + " #isitbusythere?";
				
				if (reportReturn.getPlace().getUrl().length() > 0){
					message += " - " + reportReturn.getStatus() + " " + reportReturn.getPlace().getUrl();
				}
				else if (reportReturn.getStatus().length() > 0){
					message += " - " + reportReturn.getStatus();
				}
				
				StatusUpdate update = new StatusUpdate(message);
				update.setLocation(new GeoLocation(reportReturn.getPlace().getLocation().getLat() , reportReturn.getPlace().getLocation().getLng()));
				update.setDisplayCoordinates(true);
				
				try {
					twitter4j.Status newStatus = twitter.updateStatus(update);
					
					Log.i("twitter", "newStatus - " + newStatus.getId());
				} catch (TwitterException e) {
					Log.e("twitter", "bad twitter post", e);
				}
			}
			
			//Foursquare Check-in
			if (foursquareLinked && CurrentEnvironment.environment == AppEnvironment.Production && postToFoursquare){
				//add hashtags
				message =  (reportReturn.getIsItBusy() ? getString(R.string.Busy).toUpperCase() : getString(R.string.NotBusyNoSpaces).toUpperCase()) + " using Busy There? for Android";
				
				if (reportReturn.getPlace().getUrl().length() > 0){
					message += " - " + currentUserReport.getStatus() + " " + reportReturn.getPlace().getUrl();
				}
				else if (currentUserReport.getStatus().length() > 0){
					message += " - " + currentUserReport.getStatus();
				}
				
				FoursquareProvider.Instance().foursquareCheckin(foursquare, currentVenueReport.getPlace().getId(), message);
			}
			
			return null;
		}
		
	}
	
	public ArrayList<UserReport> sortByLastUpdated(ArrayList<UserReport> statuses){

		//sort by lastupdated
		Collections.sort(statuses, new Comparator<UserReport>(){

			@Override
            public int compare(UserReport object1, UserReport object2) {
				//Log.d("histrees", "sort by date - " + object1.getLastupdated());
				
				//"2011-07-21 01:27:10"
				SimpleDateFormat df = Utils.getDateFormat();
				Date dt = null;
				Date dt2 = null;
				try {
					dt = df.parse(object1.getCreatedAt());
					dt2 = df.parse(object2.getCreatedAt());
				} catch (ParseException e) {
					Log.e("histrees", "bad date parse", e);
				}

				return dt.compareTo(dt2);
			}

		});

		Collections.reverse(statuses);
		
		return statuses;
	}
	
	
	class GetVenueLastTweetAsync extends AsyncTask<String,Void,User>{
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
				
				imgTwitterOwner.setTag(user.getProfileImageURL().toExternalForm());
				imageManager.displayImage(user.getProfileImageURL().toExternalForm(), (Activity)ReportInActivity.this, imgTwitterOwner);
				imgTwitterOwner.setVisibility(View.VISIBLE);
				imgTwitterOwner.setOnClickListener(new OnClickListener(){

					@Override
					public void onClick(View v) {
						Intent viewTwitter = new Intent(Intent.ACTION_VIEW, Uri.parse("http://mobile.twitter.com/"+user.getScreenName()));
						startActivity(viewTwitter);
					}
					
				});
				
				lblLastTweetFrom.setText(String.format(getString(R.string.LastTweetFrom), user.getScreenName()));
				
				Calendar cal = Calendar.getInstance();
				cal.setTime(user.getStatus().getCreatedAt());
				Calendar rightZone = Utils.convertCalendar(cal, TimeZone.getTimeZone("GMT"));
				lblLastTweet.setText(Utils.formatDateShort(Utils.getDateFormat().format(rightZone.getTime())) + " - " 
						+ user.getStatus().getText());
				lblLastTweet.setVisibility(View.VISIBLE);
				Linkify.addLinks(lblLastTweet, Linkify.ALL);
				layoutOwner.setVisibility(View.VISIBLE);
				
				Log.d("twitter", "owner tweeted at: " + Utils.getDateFormat().format(user.getStatus().getCreatedAt()));
				Log.d("twitter", "owner tweeted at adjusted: " + Utils.getDateFormat().format(rightZone.getTime()));
			}
		}
		
	}
	
	private class TweetOwnerClickListener implements OnClickListener{
		private EditText txtTweetContent;
		private Dialog dialog;
		
		@Override
		public void onClick(View v) {
			dialog = new Dialog(ReportInActivity.this);
			dialog.requestWindowFeature(Window.FEATURE_NO_TITLE);
			dialog.setContentView(R.layout.tweet_dialog);
			
			txtTweetContent = (EditText) dialog.findViewById(R.id.txtTweetContent);
			txtTweetContent.setText(String.format(getString(R.string.OwnerTweet), currentVenueReport.getPlace().getContact().getTwitter(), currentVenueReport.getPlace().getLocation().getCity()));

			int tweetLength = 140-txtTweetContent.getText().toString().length();
			final TextView lblCharCount = (TextView) dialog.findViewById(R.id.lblCharCount);
			lblCharCount.setText(String.valueOf(tweetLength));
			txtTweetContent.addTextChangedListener(new TextWatcher() {
		        public void beforeTextChanged(CharSequence s, int start, int count, int after) {
		        }
		
		        public void onTextChanged(CharSequence s, int start, int before, int count) {
					int tweetLength = 140-txtTweetContent.getText().toString().length();
					lblCharCount.setText(String.valueOf(tweetLength));
					if (tweetLength < 0){
						lblCharCount.setTextColor(Color.RED);
					}
					else{
						lblCharCount.setTextColor(Color.WHITE);
					}
		        }
		
		        public void afterTextChanged(Editable s) {
		        }
			});
			
			Button btnSendTweet = (Button) dialog.findViewById(R.id.btnSendTweet);
			btnSendTweet.setOnClickListener(new OnClickListener(){

				@Override
				public void onClick(View v) {
					if (txtTweetContent.getText().toString().length() > 140){
						return;
					}
					
					new SendOwnerTweet().execute(btnTweetOwner);
				}
				
			});
			
			dialog.show();
		}
		
		
		class SendOwnerTweet extends AsyncTask<View,Void,View>{
			private ProgressDialog progressDialog = new ProgressDialog(ReportInActivity.this);
			
			@Override
			protected void onPreExecute() {
				progressDialog.setMessage(getString(R.string.Sending));
				progressDialog.show();
			}
			
			@Override
			protected View doInBackground(View... params) {
				StatusUpdate update = new StatusUpdate(txtTweetContent.getText().toString());
				
				try {
					twitter4j.Status newStatus = twitter.updateStatus(update);
					
					Log.i("twitter", "newStatus - " + newStatus.getId());
				} catch (TwitterException e) {
					Log.e("twitter", "bad twitter post", e);
				}
				
				
				return params[0];
			}

			@Override
			protected void onPostExecute(View v) {
				progressDialog.dismiss();
				Toast.makeText(ReportInActivity.this, R.string.TweetSent, Toast.LENGTH_SHORT).show();
				dialog.dismiss();
				
				v.setVisibility(View.GONE);
			}
			
			
			
		}
		
		
	}
	
}
