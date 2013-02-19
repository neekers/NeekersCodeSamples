package com.isitbusythere.reporter;

import java.util.ArrayList;
import java.util.List;

import android.app.SearchManager;
import android.content.Context;
import android.content.Intent;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;
import android.view.MenuItem;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.isitbusythere.reporter.app.FoursquareProvider;
import com.isitbusythere.reporter.data.FoursquareVenuesAdapter;
import com.isitbusythere.reporter.helpers.AnalyticsUtils;
import com.isitbusythere.reporter.model.FoursquareVenue;

public class PlaceSearchActivity extends PlaceActivityBase {
	protected GetNearbyPlacesAsync placesTask;
	private String query;
	private TextView txtNoPlacesFound;
	private double distance = 2;
	private final static double METERS_CONVERSION = 1609.344;
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		
		super.onCreate(savedInstanceState);
		
		this.setTitle(R.string.Search);
		
		LinearLayout searchLayout = (LinearLayout) findViewById(R.id.searchLayout);
		txtNoPlacesFound = (TextView) findViewById(R.id.txtNoPlacesFound);
		
		searchLayout.setVisibility(View.GONE);
		
		if (Intent.ACTION_SEARCH.equals(getIntent().getAction())) {
	    	handleIntent(getIntent());
	    }
		
		AnalyticsUtils.getInstance(PlaceSearchActivity.this).trackPageView("PlaceSearchActivity");
	}
	
	@Override
	protected void onNewIntent(Intent intent) {
	    setIntent(intent);
	    handleIntent(intent);
	}
	
	private void handleIntent(Intent intent){
		query = intent.getStringExtra(SearchManager.QUERY);
    	Log.i("search", "search query - " + query);
    	
    	if (intent.getExtras().containsKey("distance")){
    		distance = intent.getExtras().getDouble("distance");
    	}
    	
    	AnalyticsUtils.getInstance(PlaceSearchActivity.this).trackEvent("Android", "Search", query.toString(), 1);
    	
    	Bundle extras = intent.getExtras();
    	if (extras.containsKey("lat") && extras.containsKey("lng")){
    		Location locPassed = new Location(LocationManager.GPS_PROVIDER);
    		locPassed.setLatitude(extras.getDouble("lat"));
    		locPassed.setLongitude(extras.getDouble("lng"));
    		placesTask = new GetNearbyPlacesAsync();
	    	  placesTask.execute(locPassed);
    	}
    	else{
    	
	    	locationManager = (LocationManager) this.getSystemService(Context.LOCATION_SERVICE);
			startLocationDetection();
    	}
	}

	protected void startLocationDetection(){
		
		// Define a listener that responds to location updates
		locationListener = new LocationListener() {
		    public void onLocationChanged(Location location) {
		      // Called when a new location is found by the network location provider.
		      //Log.i("reportin", "location lat - " + location.getLatitude());
		      //Log.i("reportin", "location long - " + location.getLongitude());
		      
		      txtLat.setText(String.valueOf(location.getLatitude()));
		      txtLong.setText(String.valueOf(location.getLongitude()));
	      		
		      //Call async task if it's not in progress since the location thing gets called a few times
		      //callCount prevents this call from happening too many time for now
		      if (callCount > 0){
		    	  placesTask = new GetNearbyPlacesAsync();
		    	  placesTask.execute(location);
		    	  locationManager.removeUpdates(locationListener);
		      }
		      callCount++;
		    }

		    public void onStatusChanged(String provider, int status, Bundle extras) {}

		    public void onProviderEnabled(String provider) {}

		    public void onProviderDisabled(String provider) {}
		  };

		// Register the listener with the Location Manager to receive location updates
		locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 0, 0, locationListener);
	}
	
	class GetNearbyPlacesAsync extends AsyncTask<Location,Void,List<FoursquareVenue>>{


		@Override	
		protected List<FoursquareVenue> doInBackground(Location... arg0) {
			Location location = arg0[0];
			
			int distanceSubmit = (int) ((int)distance*METERS_CONVERSION);

			Log.i("search", "distance search - " + distance);
			Log.i("search", "distanceSubmit search - " + distanceSubmit);
			
			//TODO: switch to do multiple
			List<FoursquareVenue> venues = new ArrayList<FoursquareVenue>(1);
			venues = FoursquareProvider.Instance().getFoursquareVenuesByName(PlaceSearchActivity.this, 
					foursquare,
					location.getLatitude(), 
					location.getLongitude(),
					distanceSubmit,
					query);
			
			return venues;
		}

		@Override
		protected void onPostExecute(List<FoursquareVenue> places) {
			
			if (places == null){
				places = new ArrayList<FoursquareVenue>();
			}
			Log.i("search", "Got google places - " + places.size());
			
			adapter = new FoursquareVenuesAdapter(PlaceSearchActivity.this, R.layout.place_item, places);
			lv.setAdapter(adapter);
			
			layoutLoading.setVisibility(View.GONE);
			if (places.size() > 0){
				lv.setVisibility(View.VISIBLE);
				txtNoPlacesFound.setVisibility(View.GONE);
			}
			else{
				txtNoPlacesFound.setVisibility(View.VISIBLE);
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
}
