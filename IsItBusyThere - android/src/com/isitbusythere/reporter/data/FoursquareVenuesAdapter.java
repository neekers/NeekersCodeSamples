package com.isitbusythere.reporter.data;

import java.util.ArrayList;
import java.util.List;

import android.app.Activity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.TextView;

import com.isitbusythere.reporter.R;
import com.isitbusythere.reporter.helpers.ImageManager;
import com.isitbusythere.reporter.model.FoursquareVenue;
import com.isitbusythere.reporter.model.Icon;
import com.isitbusythere.reporter.model.ImageSize;

public class FoursquareVenuesAdapter extends ArrayAdapter<FoursquareVenue> {

	private List<FoursquareVenue> venues = new ArrayList<FoursquareVenue>();
	private final LayoutInflater mInflater;
	private Activity context;
	private final int textViewResourceId;
	private ImageManager imageManager;

	public List<FoursquareVenue> getPlaces(){
		return this.venues;
	}

	public FoursquareVenuesAdapter(Activity context, int textViewResourceId, List<FoursquareVenue> items) {
		 super(context, textViewResourceId, items);

		 this.mInflater = LayoutInflater.from(context);

		 this.context = context;
		 this.venues = items;
		 this.textViewResourceId = textViewResourceId;
		 imageManager = new ImageManager(context);
		 
	}
	
	public void setItems(ArrayList<FoursquareVenue> venues){
		this.venues = venues;
		this.notifyDataSetChanged();
	}

    @Override
    public FoursquareVenue getItem(int position) {
        return this.venues.get(position);
    }

    @Override
	public View getView(final int position, View convertView, ViewGroup parent)
	{

		ViewHolder holder;

		//Get the current alert object
		final FoursquareVenue venue = getItem(position);

		//Inflate the view
		if(convertView==null){
			convertView = this.mInflater.inflate(this.textViewResourceId, parent, false);
			holder = new ViewHolder();
			holder.txtPlaceName = (TextView)convertView.findViewById(R.id.txtPlaceName);
			holder.txtDetails = (TextView)convertView.findViewById(R.id.txtDetails);
			holder.imgIcon = (ImageView)convertView.findViewById(R.id.imgIcon);
			
			convertView.setTag(holder);
		}
		else{
			holder = (ViewHolder)convertView.getTag();
		}


		//Assign the appropriate data from our alert object above
		holder.txtPlaceName.setText(venue.getName());
		holder.txtDetails.setText(String.format(context.getString(venue.getHereNow().getCount() != 1 ? 
					R.string.PeopleCountHere : R.string.PersonCountHere), venue.getHereNow().getCount()));
		
		if (venue.getCategories().size() > 0){
			Icon icon = venue.getCategories().get(0).getIcon();
			holder.imgIcon.setTag(icon.getFullUrl(ImageSize.WIDTH_64));
			imageManager.displayImage(icon.getFullUrl(ImageSize.WIDTH_64), context, holder.imgIcon);
		}
		
		return convertView;
	}

	private final static class ViewHolder {
		TextView txtPlaceName;
		TextView txtDetails;
		ImageView imgIcon;
	}
}
