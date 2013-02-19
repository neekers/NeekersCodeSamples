package com.isitbusythere.reporter.helpers;

import java.lang.ref.SoftReference;
import java.util.HashMap;

import android.app.Activity;
import android.widget.ImageView;
import android.widget.TextView;

import com.isitbusythere.reporter.app.FoursquareProvider;
import com.isitbusythere.reporter.foursquare.Foursquare;
import com.isitbusythere.reporter.model.FoursquareVenue;
import com.isitbusythere.reporter.model.ImageSize;


public class AsyncPlaceLoader{

	private Foursquare foursquare;
	private Activity context;
	private ImageManager imageManager;
	private Thread placeLoaderThread;
	private HashMap<String, SoftReference<FoursquareVenue>> placesCache = new HashMap<String, SoftReference<FoursquareVenue>>();
	
	public AsyncPlaceLoader(Foursquare foursquare, Activity context, ImageManager imageManager){
		this.foursquare = foursquare;
		this.context = context;
		this.imageManager = imageManager;
	}
	
	public void GetPlace(ImageView imgPlaceIcon, TextView lblPlaceName, String reference){

		if (placesCache.containsKey(reference)){
			FoursquareVenue place = placesCache.get(reference).get();
			lblPlaceName.setText(place.getName());
			lblPlaceName.setTag(place);
			imgPlaceIcon.setTag(place.getCategories().get(0).getIcon().getFullUrl(ImageSize.WIDTH_44));
			imageManager.displayImage(place.getCategories().get(0).getIcon().getFullUrl(ImageSize.WIDTH_44), context, imgPlaceIcon);
			return;
		}
		this.placeLoaderThread = new Thread(new PlaceLoader(foursquare, imgPlaceIcon, lblPlaceName, reference));
		
		// Make background thread low priority, to avoid affecting UI performance
		placeLoaderThread.setPriority(Thread.NORM_PRIORITY-1);
		
		// Start thread if it's not started yet
		if(placeLoaderThread.getState() == Thread.State.NEW)
			placeLoaderThread.start();
	}
	
	private class PlaceLoader implements Runnable {
		private ImageView imgPlaceIcon;
		private TextView lblPlaceName;
		private String reference;
		private Foursquare foursquare;
		
		public PlaceLoader(Foursquare foursquare, ImageView imgPlaceIcon, TextView lblPlaceName, String reference){
			this.foursquare = foursquare;
			this.imgPlaceIcon = imgPlaceIcon;
			this.lblPlaceName = lblPlaceName;
			this.reference = reference;
		}
		
		@Override
		public void run() {
			
			FoursquareVenue place = FoursquareProvider.Instance().getFoursquareVenueById(foursquare, reference);
			
			if (place != null){
				LoadInfoIntoUI loader = new LoadInfoIntoUI(place, imgPlaceIcon, lblPlaceName);
				Activity a = (Activity)imgPlaceIcon.getContext();
				a.runOnUiThread(loader);	
			}	
			
		}
	}
	
	private class LoadInfoIntoUI implements Runnable{
		private FoursquareVenue place;
		private ImageView imgPlaceIcon;
		private TextView lblPlaceName;
		
		public LoadInfoIntoUI(FoursquareVenue place, ImageView imgPlaceIcon, TextView lblPlaceName){
			this.imgPlaceIcon = imgPlaceIcon;
			this.lblPlaceName = lblPlaceName;
			this.place = place;
		}

		@Override
		public void run() {
			imgPlaceIcon.setTag(place.getCategories().get(0).getIcon().getFullUrl(ImageSize.WIDTH_44));
			imageManager.displayImage(place.getCategories().get(0).getIcon().getFullUrl(ImageSize.WIDTH_44), context, imgPlaceIcon);
			lblPlaceName.setText(place.getName() + " - " + place.getLocation().getAddress() + ", " + place.getLocation().getCity());
			lblPlaceName.setTag(place);
			placesCache.put(place.getId(), new SoftReference<FoursquareVenue>(place));
		}
	}

}

