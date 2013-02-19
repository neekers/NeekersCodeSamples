package com.isitbusythere.reporter;

import java.util.ArrayList;

import android.content.Intent;
import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ListView;
import android.widget.TextView;

import com.crittercism.app.Crittercism;
import com.facebook.Session;
import com.facebook.SessionState;
import com.isitbusythere.reporter.app.FoursquareProvider;
import com.isitbusythere.reporter.app.ReporterProvider;
import com.isitbusythere.reporter.data.StatusesAdapter;
import com.isitbusythere.reporter.model.UserReport;

public class CurrentActivity extends ActivityBase {
	
	private final static String TAG = "CurrentActivity";

	private ListView lv;
	private StatusesAdapter adapter;
	private LinearLayout layoutLoader;
	private TextView lblLoading;
	private TextView lblEmpty;
	private Button btnShareApp;
	private GetCurrentReports getCurrentReports;
	//private UiLifecycleHelper uiHelper;

	@Override
	protected void onCreate(Bundle savedInstanceState) {

		super.onCreate(savedInstanceState);

    	//uiHelper = new UiLifecycleHelper(this, callback);
    	//uiHelper.onCreate(savedInstanceState);
    	
		Log.i(TAG, "start activity");

		if (!BuildConfig.DEBUG) {
			Crittercism.init(getApplicationContext(),
					"4f5560d4b093153599000090");
		}

		if (currentUser.getUserId() == -1 || currentUser.getPhotoUrl().length() == 0) {
			return;
		}

		setContentView(R.layout.current_activity);

		layoutLoader = (LinearLayout) findViewById(R.id.layoutLoader);
		lv = (ListView) findViewById(R.id.lvReports);
		lblLoading = (TextView) findViewById(R.id.lblLoading);
		lblEmpty = (TextView) findViewById(R.id.lblEmpty);

    	//LoginButton authButton = (LoginButton) this.findViewById(R.id.fbLogin);
    	//authButton.setPublishPermissions(Arrays.asList("publish_stream"));
    	//authButton.setReadPermissions(Arrays.asList("email", "user_checkins", "friends_checkins"));
    	//Settings.publishInstallAsync(getApplicationContext(), getString(R.string.FACEBOOK_APP_ID));
    	

		btnShareApp = (Button) findViewById(R.id.btnShareApp);
		btnShareApp.setOnClickListener(new OnClickListener() {

			@Override
			public void onClick(View v) {
				// Show the share dialog activity
				Intent shareIntent = new Intent(
						android.content.Intent.ACTION_SEND);
				shareIntent.setType("text/plain");
				shareIntent.putExtra(android.content.Intent.EXTRA_SUBJECT,
						getString(R.string.ShareSubject));
				shareIntent.putExtra(android.content.Intent.EXTRA_TEXT,
						getString(R.string.ShareMessage));

				startActivity(Intent.createChooser(shareIntent,
						"Spread the Love"));
			}

		});

		// Show welcome and ask to link Foursquare
		/*
		if (!settings.contains("welcome") || settings.contains("welcome")
				&& settings.getBoolean("welcome", true)) {

			AlertDialog.Builder builder = new AlertDialog.Builder(this);
			builder.setMessage(R.string.LinkFoursquare)
					.setCancelable(false)
					.setPositiveButton(R.string.OK,
							new DialogInterface.OnClickListener() {
								public void onClick(DialogInterface dialog,
										int id) {
									foursquare
											.authorize(
													CurrentActivity.this,
													new FoursquareAuthenDialogListener());
									settings.edit()
											.putBoolean("welcome", false)
											.commit();
								}
							});
			AlertDialog alert = builder.create();
			alert.show();
		}
		*/

		// Always get this because we want something to show on the home page
		getCurrentReports = new GetCurrentReports();
		getCurrentReports.execute();
		

    	new GetFoursquareCategoriesAsync().execute();
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		MenuInflater menuInflater = getMenuInflater();
		menuInflater.inflate(R.menu.current_menu, menu);

		// Calling super after populating the menu is necessary here to ensure
		// that the
		// action bar helpers have a chance to handle this event.
		return super.onCreateOptionsMenu(menu);
	}

	@Override
	public boolean onPrepareOptionsMenu(Menu menu) {

		//TODO: need to figure out if fb account is linked or not
		/*
		if (foursquareLinked) {
			menu.findItem(R.id.menu_facebook_link).setVisible(false);
		}
		*/
		if (this.twitterRestored) {
			menu.findItem(R.id.menu_twitter_link).setVisible(false);
		}
		
		return true;
	}

	@Override
	public boolean onOptionsItemSelected(MenuItem item) {
		switch (item.getItemId()) {
		
		case R.id.menu_findPlace:
			Intent searchPlaces = new Intent(CurrentActivity.this,
					PlacesListingActivity.class);
			startActivity(searchPlaces);
			break;

		case R.id.menu_refresh:
			new GetCurrentReports().execute();
			break;

		case R.id.menu_facebook_link:
			//TODO: link fb up
			break;
			
		case R.id.menu_twitter_link:
			
			Intent twitterAuth = new Intent(CurrentActivity.this, TwitterAuthActivity.class);
			twitterAuth.putExtra("auth", true);
			startActivity(twitterAuth);
			break;

		case R.id.menu_logout:
			//new FacebookLogout().execute();
			settings.edit().putLong("userId", -1).commit();
			Intent signin = new Intent(CurrentActivity.this, SigninActivity.class);
			signin.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
			startActivity(signin);
			finish();
			break;
		}
		return super.onOptionsItemSelected(item);
	}

	private class GetCurrentReports extends
			AsyncTask<Void, Void, ArrayList<UserReport>> {

		@Override
		protected void onPreExecute() {
			lblLoading.setText(R.string.GettingReports);
			layoutLoader.setVisibility(View.VISIBLE);
		}

		@Override
		protected ArrayList<UserReport> doInBackground(Void... params) {
			return ReporterProvider.Instance().getReportsInLastHour();
		}

		@Override
		protected void onPostExecute(ArrayList<UserReport> statuses) {
			if (statuses != null) {
				adapter = new StatusesAdapter(CurrentActivity.this,
						R.layout.status_item, statuses, true);
				lv.setAdapter(adapter);
				lv.setVisibility(View.VISIBLE);
				lblEmpty.setVisibility(View.GONE);
				btnShareApp.setVisibility(View.GONE);
			}

			//lblLoading.setText(R.string.GettingFacebookCheckins);
			//GetCurrentFBReports();
			lblLoading.setText(R.string.GettingFoursquareCheckins);
			new GetCurrentFSqReports().execute();
		}

	}
	
	private void onSessionStateChange(Session session, SessionState state, Exception exception) {
        if (state.isOpened()) {
            Log.i(TAG, "Logged in...");
            
            //TODO: maybe refresh with the latest fb checkins?
            
        } else if (state.isClosed()) {
            Log.i(TAG, "Logged out...");
        }
        else{
        	Log.e(TAG, "Exception on session state", exception);
        }
    }
    
    private Session.StatusCallback callback = new Session.StatusCallback() {
        @Override
        public void call(Session session, SessionState state, Exception exception) {
        	Log.i(TAG, "StatusCallback");
            onSessionStateChange(session, state, exception);
        }
    };
	
	/*
	private void GetCurrentFBReports(){
		Log.i(TAG, "GetCurrentFBReports");
		String graphPath = "/search";
		Bundle params = new Bundle();
		params.putString("type", "checkin");
		//params.putString("since", "-1 hour");
		
		new Request(Session.openActiveSessionFromCache(CurrentActivity.this), graphPath, params, HttpMethod.GET, new Request.Callback() {
			
			@Override
			public void onCompleted(Response response) {
				Log.i(TAG, "GetCurrentFBReports complete");
				
				if (response == null) {
					return;
				}
				List<ReportStatus> checkins = new ArrayList<ReportStatus>();
				
				JSONArray resultsArr;
				try {
					resultsArr = (JSONArray) response.getGraphObject().getInnerJSONObject().getJSONArray("data");
					
					if (resultsArr.length() == 0){
						return;
					}
					
					for (int i = 0; i < resultsArr.length(); i++) {
						JSONObject obj = resultsArr.getJSONObject(i);
	
						// From Name
						JSONObject fromObj = (JSONObject) obj.getJSONObject("from");
						ReportStatus status = new ReportStatus();
						status.setStatusType(StatusType.Facebook);
						status.setIsItBusy(BusyStatusType.Facebook);
						status.setFacebookUserId(fromObj.getString("id"));
						String fullName = fromObj.getString("name");
						status.setFirstName(fullName.substring(0, fullName.indexOf(" ")));
						status.setLastName(fullName.substring(fullName.lastIndexOf(" ") + 1));
						if (!obj.isNull("message")) {
							status.setStatus(obj.getString("message"));
						}
	
						// Place details
						JSONObject placeObj = obj.getJSONObject("place");
						JSONObject locationObj = placeObj.getJSONObject("location");
	
						// Not good because it causes the UI to do this same query to
						// the places API
						GooglePlace place = ReporterProvider.Instance()
								.GetGooglePlaceByName(CurrentActivity.this,
										locationObj.getDouble("latitude"),
										locationObj.getDouble("longitude"), 152,
										placeObj.getString("name"));
	
						// Bad lookup
						if (place == null) {
							Log.i("facebook",
									"No google place match up - "
											+ placeObj.getString("name"));
							continue;
						}
						place.setFacebookPlaceId(placeObj.getString("id"));
						
						// Anyone tagged?
						if (!obj.isNull("tags")) {
							JSONObject tags = obj.getJSONObject("tags");
							JSONArray tagsArray = tags.getJSONArray("data");
	
							status.setAdditionalPeopleCount(tagsArray.length());
							ArrayList<User> additionalPeople = new ArrayList<User>();
							for (int k = 0; k < tagsArray.length(); k++) {
								JSONObject tag = (JSONObject) tagsArray.get(k);
								User tagged = new User();
								tagged.setFacebookUserId(tag.getString("id"));
								String fullname = tag.getString("name");
								tagged.setFirstName(fullname.substring(0,
										fullname.indexOf(" ")));
								tagged.setLastName(fullname.substring(
										fullname.lastIndexOf(" ") + 1).substring(0, 1)
										+ ".");
	
								additionalPeople.add(tagged);
							}
	
							status.setAdditionalPeople(additionalPeople);
						}
	
						String createdDate = obj.getString("created_time");
						// 2012-02-07T03:27:59+0000 fb uses this
						// 2012-02-08T06:29:27Z needs this format
	
						status.setCreatedAt(createdDate.replace("+0000", "Z"));
	
						// Check the type of the checkin. We don't want out of the
						// ordinary stuff coming in here like transit stations on fb
						if (!ReporterProvider.Instance().isValidPlaceType(CurrentActivity.this,
								place)) {
							continue;
						}
						
						status.setPlace(place);
						
						checkins.add(status);
					}
					
				} catch (JSONException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				
				if (checkins.size() > 0) {
					if (Utils.shinyNewAPIsSupported) {
						adapter.addAll(checkins);
					} else {
						for (ReportStatus checkin : checkins) {
							adapter.add(checkin);
						}
					}
					adapter.sortByDate();
					lblEmpty.setVisibility(View.GONE);
					btnShareApp.setVisibility(View.GONE);
				} else if (!foursquareLinked
						&& (adapter.getStatuses().size() == 0 || adapter == null)) {
					lblEmpty.setVisibility(View.VISIBLE);
					btnShareApp.setVisibility(View.VISIBLE);
				}

				if (foursquareLinked) {
					lblLoading.setText(R.string.GettingFoursquareCheckins);
					new GetCurrentFSqReports().execute();
				} else {
					layoutLoader.setVisibility(View.GONE);
				}
					
				
			}
		}).executeAsync();
	}
	*/

	private class GetCurrentFSqReports extends
			AsyncTask<Void, Void, ArrayList<UserReport>> {

		@Override
		protected ArrayList<UserReport> doInBackground(Void... arg0) {

			return FoursquareProvider.Instance().getFoursquareRecentCheckins(
					CurrentActivity.this, foursquare);
		}

		@Override
		protected void onPostExecute(ArrayList<UserReport> statuses) {
			layoutLoader.setVisibility(View.INVISIBLE);
			
			if (statuses != null && statuses.size() > 0) {
				
				if (adapter == null) {
					adapter = new StatusesAdapter(CurrentActivity.this,
							R.layout.status_item, statuses, true);
				} else {
					adapter.addAll(statuses);
				}
				adapter.sortByDate();
				lblEmpty.setVisibility(View.GONE);
				btnShareApp.setVisibility(View.GONE);

			} else if (adapter == null || adapter.getStatuses().size() == 0) {
				lblEmpty.setVisibility(View.VISIBLE);
				btnShareApp.setVisibility(View.VISIBLE);
			}
		}
	}
	
	private class GetFoursquareCategoriesAsync extends AsyncTask<Void, Void, Void> {

		@Override
		protected Void doInBackground(Void... arg0) {
		
			FoursquareProvider.Instance().getFoursquareCategories(CurrentActivity.this, settings, foursquare);
			
			return null;
		}
		
		
	}
	
/*
	@Override
	public void onResume() {
		super.onResume();
	    uiHelper.onResume();
	}

	@Override
	public void onActivityResult(int requestCode, int resultCode, Intent data) {
	    super.onActivityResult(requestCode, resultCode, data);
	    uiHelper.onActivityResult(requestCode, resultCode, data);
	}

	@Override
	public void onPause() {
	    super.onPause();
	    uiHelper.onPause();
	}

	@Override
	public void onDestroy() {
	    super.onDestroy();
	    uiHelper.onDestroy();
	}

	@Override
	public void onSaveInstanceState(Bundle outState) {
	    super.onSaveInstanceState(outState);
	    uiHelper.onSaveInstanceState(outState);
	}
*/
	
}
