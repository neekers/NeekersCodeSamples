package com.isitbusythere.reporter;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import android.app.SearchManager;
import android.app.SearchManager.OnDismissListener;
import android.content.Context;
import android.content.Intent;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.View.OnFocusChangeListener;
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.SearchView;
import android.widget.Spinner;

import com.isitbusythere.reporter.app.FoursquareProvider;
import com.isitbusythere.reporter.data.FoursquareVenuesAdapter;
import com.isitbusythere.reporter.helpers.AnalyticsUtils;
import com.isitbusythere.reporter.helpers.Utils;
import com.isitbusythere.reporter.model.FoursquareVenue;

public class PlacesListingActivity extends PlaceActivityBase {

	protected GetNearbyPlacesAsync placesTask;
	private SearchView searchView;
	private EditText txtSearch;
	private LinearLayout searchLayout;
	private LinearLayout spinnerLayout;
	private Double lat;
	private Double lng;
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {

		super.onCreate(savedInstanceState);
		
		//activates the search dialog when the user starts typing on the keyboard
		setDefaultKeyMode(DEFAULT_KEYS_SEARCH_LOCAL);
		
		txtSearch = (EditText) findViewById(R.id.txtSearch);
		searchLayout = (LinearLayout) findViewById(R.id.searchLayout);
		spinnerLayout = (LinearLayout)findViewById(R.id.spinnerLayout);
		txtSearch.setOnFocusChangeListener(new OnFocusChangeListener(){

			@Override
			public void onFocusChange(View v, boolean hasFocus) {
				if (hasFocus){
					//add in range searching add a spinner to UI 
					//2, 10,25,50,100 miles range			
					spinnerLayout.setVisibility(View.VISIBLE);
				}
				else{
					spinnerLayout.setVisibility(View.GONE);
				}
			}
			
		});		
		final Spinner rangeSpinner = (Spinner)findViewById(R.id.spinnerRange);
		
		SearchManager searchManager = (SearchManager) getSystemService(Context.SEARCH_SERVICE);
		searchManager.setOnDismissListener(new OnDismissListener(){

			@Override
			public void onDismiss() {
				searchLayout.setVisibility(View.VISIBLE);
			}
			
		});
		
		Button btnSearch = (Button)findViewById(R.id.btnSearchLocations);
		btnSearch.setOnClickListener(new OnClickListener() {
			
			@Override
			public void onClick(View v) {
				Intent searchIntent = new Intent(PlacesListingActivity.this, PlaceSearchActivity.class);
				Double distance = 2d;
				if (rangeSpinner.getSelectedItem().toString().contains("mi")){
					distance = Double.valueOf(rangeSpinner.getSelectedItem().toString().replace("mi.","").trim());
				}
				else{
					distance = Double.valueOf(rangeSpinner.getSelectedItem().toString().replace("ft.","").trim())/5280;
				}
				Log.i("search", "distance from search bar - " + distance);
				searchIntent.putExtra("distance", distance);			     
				searchIntent.putExtra(SearchManager.QUERY, txtSearch.getText().toString());
				searchIntent.setAction(Intent.ACTION_SEARCH);
				if (lat != null && lng != null){
					searchIntent.putExtra("lat", lat);
					searchIntent.putExtra("lng", lng);
				}
				startActivity(searchIntent);
			}
		});
		
		Button btnSeeMorePlaces = new Button(PlacesListingActivity.this);
		btnSeeMorePlaces.setText(R.string.SeeMorePlaces);
		btnSeeMorePlaces.setOnClickListener(new OnClickListener(){

			@Override
			public void onClick(View v) {
				callCount = 0;
				showAllTypes = true;
				
				startLocationDetection();
				lv.removeFooterView(v);

            	layoutLoading.setVisibility(View.VISIBLE);
            	lv.setVisibility(View.GONE);
			}
			
		});
		lv.addFooterView(btnSeeMorePlaces);
		Location lastKnownLocation = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);
		
		if (lastKnownLocation != null){
			new GetNearbyPlacesAsync().execute(lastKnownLocation);
		}
		
		startLocationDetection();
		
		Intent i = getIntent();
		Bundle extras = i.getExtras();
		InputMethodManager inputMethodManager=(InputMethodManager)getSystemService(Context.INPUT_METHOD_SERVICE);

		txtSearch.clearFocus();
		if (inputMethodManager != null){
	    	inputMethodManager.hideSoftInputFromWindow(txtSearch.getWindowToken(),0);
        }
		this.setTitle(R.string.NearbyPlaces);
		
		if (extras != null && extras.containsKey("search") && extras.getBoolean("search")){
			this.setTitle(R.string.FindPlace);
			txtSearch.performClick();
			txtSearch.requestFocus();
		    if (inputMethodManager != null){
		    	inputMethodManager.toggleSoftInput(InputMethodManager.SHOW_FORCED,0);
	        } 
		}
		
		
		AnalyticsUtils.getInstance(getApplicationContext()).trackPageView("PlaceListingActivity");
	}
	
	
	@Override
	protected void onResume() {

		if (Utils.shinyNewAPIsSupported && this.searchView != null){
			this.searchView.setQuery("", false);
		    this.searchView.clearFocus();
		}

		super.onResume();
	}
	
	
	@Override
	public boolean onSearchRequested() {
		locationManager.removeUpdates(locationListener);
		
		//hide the other search form
		searchLayout.setVisibility(View.GONE);
		spinnerLayout.setVisibility(View.GONE);
		
		return super.onSearchRequested();
	}

	

	@Override
    public boolean onCreateOptionsMenu(Menu menu) {
        MenuInflater menuInflater = getMenuInflater();
        menuInflater.inflate(R.menu.placelisting_menu, menu);
        
        if (Utils.shinyNewAPIsSupported){
	        SearchManager searchManager = (SearchManager) getSystemService(Context.SEARCH_SERVICE);
		    this.searchView = (SearchView) menu.findItem(R.id.menu_search).getActionView();
		    this.searchView.setSearchableInfo(searchManager.getSearchableInfo(getComponentName()));
		    this.searchView.setSubmitButtonEnabled(true);
        }
        else{
        	menu.getItem(0).setVisible(false);
        }
        
        // Calling super after populating the menu is necessary here to ensure that the
        // action bar helpers have a chance to handle this event.
        return super.onCreateOptionsMenu(menu);
    }
	
    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
            case R.id.menu_refresh:
            	layoutLoading.setVisibility(View.VISIBLE);
            	lv.setVisibility(View.GONE);
            	callCount = 0;
				startLocationDetection();
                break;  
              
            case R.id.menu_search:
            	onSearchRequested();
            	break;
            	
            case android.R.id.home:
                finish();
                return true;
            
        }
        return super.onOptionsItemSelected(item);
    }
    
    protected void startLocationDetection(){
		
		// Define a listener that responds to location updates
		locationListener = new LocationListener() {
		    public void onLocationChanged(Location location) {
		      // Called when a new location is found by the network location provider.
		      //Log.i("reportin", "location lat - " + location.getLatitude());
		      //Log.i("reportin", "location long - " + location.getLongitude());
		    	lat = location.getLatitude();
		    	lng = location.getLongitude();
		      
		      txtLat.setText(String.valueOf(location.getLatitude()));
		      txtLong.setText(String.valueOf(location.getLongitude()));
	      		
		      //Call async task if it's not in progress since the location thing gets called a few times
		      //callCount prevents this call from happening too many time for now
		      if (callCount > 0){
		    	  placesTask = new GetNearbyPlacesAsync();
		    	  placesTask.execute(location);
		    	  callCount++;
		      }
		    }

		    public void onStatusChanged(String provider, int status, Bundle extras) {}

		    public void onProviderEnabled(String provider) {}

		    public void onProviderDisabled(String provider) {}
		  };

		// Register the listener with the Location Manager to receive location updates
		locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 0, 0, locationListener);
	}
	
	class GetNearbyPlacesAsync extends AsyncTask<Location,Void,ArrayList<FoursquareVenue>>{

		private boolean inProgress = false;
				
		public boolean isInProgress() {
			return inProgress;
		}

		@Override
		protected ArrayList<FoursquareVenue> doInBackground(Location... arg0) {
			inProgress = true;
			Location location = arg0[0];
			
			ArrayList<FoursquareVenue> places = new ArrayList<FoursquareVenue>();
			
			String subCats = settings.getString("subcategories", "");
			List<String> categories = Arrays.asList(subCats.split(","));
			List<String> splitCategories = new ArrayList<String>();
			for (String cat : categories){
				splitCategories.add(cat.split(":")[1]);
			}
			String splitCats = Utils.join(splitCategories.toArray(new String[splitCategories.size()]), ",");
			
			places  = FoursquareProvider.Instance().getFoursquarePlacesNearby(foursquare, location.getLatitude(), 
																location.getLongitude(),
																RADIUS,
																!showAllTypes ? splitCats :
																	null);
		
			return places;
		}

		@Override
		protected void onPostExecute(ArrayList<FoursquareVenue> places) {
			inProgress = false;
			
			//Log.i("reportin", "Got google places - " + places.size());
			
			//Remove the listener after we do enough GPS location calls
			if (callCount > 0 || callCount > 10){
		    	 locationManager.removeUpdates(locationListener);
			}
			
			if (places.size() > 0){
				adapter = new FoursquareVenuesAdapter(PlacesListingActivity.this, R.layout.place_item, places);
				lv.setAdapter(adapter);
			
				layoutLoading.setVisibility(View.GONE);
				lv.setVisibility(View.VISIBLE);
			}
		}
	}
}
