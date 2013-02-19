package com.isitbusythere.reporter;

import java.util.ArrayList;

import android.app.ProgressDialog;
import android.content.Intent;
import android.os.AsyncTask;
import android.os.Bundle;
import android.view.MenuItem;
import android.view.View;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.ListView;

import com.isitbusythere.reporter.app.FoursquareProvider;
import com.isitbusythere.reporter.data.FoursquareVenuesAdapter;
import com.isitbusythere.reporter.model.FoursquareVenue;
import com.isitbusythere.reporter.model.FoursquareVenueSmall;

public class ViewSimilarActivity extends ActivityBase {

	private ListView lv;
	private FoursquareVenuesAdapter adapter;
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		
		super.onCreate(savedInstanceState);

		setContentView(R.layout.viewsimilar_activity);
		
		lv = (ListView) findViewById(android.R.id.list);
		getActionBar().setDisplayHomeAsUpEnabled(true);
		
		Bundle extras = getIntent().getExtras();
		if (extras != null && extras.containsKey("venueSmall")){
			FoursquareVenueSmall venue = (FoursquareVenueSmall) extras.getParcelable("venueSmall");
			setTitle(String.format(getString(R.string.OtherNearby), venue.getCategoryName()+"s"));
		
			new GetSimilarFoursquarePlaces().execute(venue);
		}
		else{
			finish();
		}
		
		lv.setOnItemClickListener(new OnItemClickListener(){

			@Override
			public void onItemClick(AdapterView<?> parent, View view, int position,
					long id) {
				
				FoursquareVenue venue = adapter.getItem(position);
				
				Intent viewPlace = new Intent(ViewSimilarActivity.this, ReportInActivity.class);
				viewPlace.putExtra("place", venue);
				startActivity(viewPlace);
			}
			
		});
		
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

	
	private class GetSimilarFoursquarePlaces extends AsyncTask<FoursquareVenueSmall,Void,ArrayList<FoursquareVenue>>{
		private ProgressDialog dialog = new ProgressDialog(ViewSimilarActivity.this);
		
		@Override
		protected void onPreExecute() {
			dialog.setMessage(getString(R.string.FindingSimilarPlacesNearby));
			dialog.show();
		}
		
		@Override
		protected ArrayList<FoursquareVenue> doInBackground(FoursquareVenueSmall... params) {
			return FoursquareProvider.Instance().getSimilarFoursquarePlacesNearby(foursquare, params[0]);
		}

		@Override
		protected void onPostExecute(ArrayList<FoursquareVenue> venues) {
			dialog.dismiss();
			
			if (venues != null && venues.size() > 0){
				adapter = new FoursquareVenuesAdapter(ViewSimilarActivity.this, R.layout.place_item, venues);
				lv.setAdapter(adapter);
			}
		}

		
		
	}

}
