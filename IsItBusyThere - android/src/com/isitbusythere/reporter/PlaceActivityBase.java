package com.isitbusythere.reporter;

import android.content.Context;
import android.content.Intent;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.LinearLayout;
import android.widget.ListView;
import android.widget.TextView;

import com.isitbusythere.reporter.app.AppEnvironment;
import com.isitbusythere.reporter.app.CurrentEnvironment;
import com.isitbusythere.reporter.data.FoursquareVenuesAdapter;
import com.isitbusythere.reporter.model.FoursquareVenue;

public class PlaceActivityBase extends ActivityBase {
	protected LocationManager locationManager;
	protected LocationListener locationListener;
	protected int callCount;
	protected ListView lv;
	protected LinearLayout layoutLoading;
	protected Boolean showAllTypes = false;

	TextView txtLat;
	TextView txtLong;
	
	protected FoursquareVenuesAdapter adapter;
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		
		super.onCreate(savedInstanceState);
		
		setContentView(R.layout.placeslisting_activity);

		getActionBar().setDisplayHomeAsUpEnabled(true);
		layoutLoading = (LinearLayout) findViewById(R.id.layoutLoading);
		lv = (ListView) findViewById(android.R.id.list);
		lv.setOnItemClickListener(new OnItemClickListener(){

			@Override
			public void onItemClick(AdapterView<?> parent, View view, int position,
					long id) {
				FoursquareVenue selectedPlace = (FoursquareVenue) parent.getItemAtPosition(position);
				
				Log.i("reportin", "selectedPlace from list - " + selectedPlace.getName());
				
				//send to home to report in
				Intent reportHome = new Intent(PlaceActivityBase.this, ReportInActivity.class);
				reportHome.putExtra("place", selectedPlace);
				startActivity(reportHome);
			}
			
		});

		callCount = 0;
		
		txtLat = (TextView) findViewById(R.id.txtLat);
	    txtLong = (TextView) findViewById(R.id.txtLong);
	    
	    if (CurrentEnvironment.environment == AppEnvironment.Production){
	    	txtLat.setVisibility(View.GONE);
	      	txtLong.setVisibility(View.GONE);
	    }
	    
    	locationManager = (LocationManager) this.getSystemService(Context.LOCATION_SERVICE);
	    
	}
	
	
	@Override
	protected void onPause() {
		if (locationManager != null && locationListener != null){
			locationManager.removeUpdates(locationListener);
		}

		super.onPause();
	}




	@Override
	public void onBackPressed() {
		if (locationManager != null && locationListener != null){
			locationManager.removeUpdates(locationListener);
		}

		finish();
		
		super.onBackPressed();
	}

	
}
