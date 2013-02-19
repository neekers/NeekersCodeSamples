package com.isitbusythere.reporter;

import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONTokener;

import android.app.ProgressDialog;
import android.content.Intent;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;
import android.view.MenuItem;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import com.isitbusythere.reporter.foursquare.Foursquare;
import com.isitbusythere.reporter.helpers.ImageManager;
import com.isitbusythere.reporter.model.StatusType;
import com.isitbusythere.reporter.model.UserReport;

public class ProfileActivity extends ActivityBase {
	private String externalUserId;
	private StatusType statusType = StatusType.IsItBusyThere;
	private ImageManager imageManager;
	private TextView lblName;
	private TextView lblLocation;
	private Button btnViewFacebookProfile;
	private TextView lblSexRelationship;
	private Foursquare foursquare;
	private String profileLink;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		
		super.onCreate(savedInstanceState);
		
		setContentView(R.layout.profile_activity);

		getActionBar().setDisplayHomeAsUpEnabled(true);
		imageManager = new ImageManager(ProfileActivity.this);
		lblName = (TextView) findViewById(R.id.lblName);
		lblLocation = (TextView) findViewById(R.id.lblLocation);
		btnViewFacebookProfile = (Button) findViewById(R.id.btnViewFacebookProfile);
		lblSexRelationship = (TextView) findViewById(R.id.lblSexRelationship);
		
		String photo = "";
		Bundle extras = getIntent().getExtras();
		if (extras != null && extras.containsKey("status")){
			UserReport status = (UserReport)extras.getParcelable("status");
			statusType = status.getStatusType();
			profileLink = status.getProfileLink();
			lblName.setText(status.getFirstName() + " " + status.getLastName());
			lblLocation.setText(status.getUserHomeCity());
			photo = status.getPhotoUrl();
		}
		else{
			Toast.makeText(this, R.string.NoProfileFound, Toast.LENGTH_SHORT).show();
			finish();
			return;
		}
		
		ImageView imgProfilePhoto = (ImageView) findViewById(R.id.imgProfilePhoto);
		
		
		imgProfilePhoto.setTag(photo);
		imageManager.displayImage(photo, ProfileActivity.this, imgProfilePhoto);
		
		
		imgProfilePhoto.setOnClickListener(new OnClickListener(){
			@Override
			public void onClick(View v) {
				String photoUrl = (String)v.getTag();
				Intent profileImage = new Intent(ProfileActivity.this, ProfileImageActivity.class);
				profileImage.putExtra("photoUrl", photoUrl);
				startActivity(profileImage);
			}
		});
		
		if (profileLink.length() > 0){
			btnViewFacebookProfile.setText(R.string.FoursquareProfile);
			btnViewFacebookProfile.setOnClickListener(new FoursquareProfileClick());
		}
		else{
			btnViewFacebookProfile.setVisibility(View.GONE);
		}
		
	}
	
	private class FacebookProfileClick implements OnClickListener{
		@Override
		public void onClick(View v) {
			Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("http://touch.facebook.com/profile.php?id="+externalUserId));
		    startActivity(browserIntent);
		}
	}
	
	private class FoursquareProfileClick implements OnClickListener{
		@Override
		public void onClick(View v) {
			Log.i("profile", "Foursq profile click - " + profileLink);
			Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(profileLink));
		    startActivity(browserIntent);
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
	
	private class GetFacebookProfile extends AsyncTask<String,Void,String>{
		private ProgressDialog progressDialog = new ProgressDialog(ProfileActivity.this);
		
		@Override
		protected void onPreExecute() {
			progressDialog.setMessage(getString(R.string.LoadingProfile));
			progressDialog.show();
		}
		
		@Override
		protected String doInBackground(String... params) {
			String fbUser = null;
			/*
			try {
				fbUser = facebook.request(params[0]);
				Log.i("profile", "fbUser response - " + fbUser);
				
			} catch (MalformedURLException e) {
				Log.e("profile", "facebook get profile", e);
			} catch (IOException e) {
				Log.e("profile", "facebook get profile", e);
			}
			*/
			
			return fbUser;
		}

		@Override
		protected void onPostExecute(String response) {
			progressDialog.dismiss();
			
			if (response != null){
				JSONObject meObj;
				try {
					meObj = (JSONObject) new JSONTokener(response).nextValue();
					
					lblName.setText(meObj.getString("first_name") + " " + meObj.getString("last_name"));
					if (!meObj.isNull("location")){
						JSONObject locationObj = meObj.getJSONObject("location");
						lblLocation.setText(locationObj.getString("name"));
					}
					
					/*
					String birthday = "";
					if (!meObj.isNull("birthday")){
						birthday = meObj.getString("birthday");
						if (birthday.length() < 6){
							birthday = null;
						}
					}
					if (birthday != null && !meObj.isNull("relationship_status")){
						lblSexRelationship.setText(meObj.getString("birthday") + " / " + meObj.getString("relationship_status"));
					}
					else if (birthday != null){
						lblSexRelationship.setText(meObj.getString("birthday"));
					}
					else{
						lblSexRelationship.setVisibility(View.GONE);
					}
					*/
					
				} catch (JSONException e) {
					Log.e("profile", "Bad profile facebook parse", e);
				}
			}
		}
		
	}
	
}
