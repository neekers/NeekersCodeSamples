package com.isitbusythere.reporter;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.MenuItem;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.ImageView;
import android.widget.ListView;
import android.widget.TextView;

import com.isitbusythere.reporter.data.AdditionalPeopleAdapter;
import com.isitbusythere.reporter.helpers.ImageManager;
import com.isitbusythere.reporter.model.UserReport;

// Fix this up so the status object has the correct userID references
// THIS IS FOR FACEBOOK ONLY WHEN CHECKING IN WITH MULTIPLE PEOPLE
public class AdditionalPeopleActivity extends ActivityBase {

	private ImageManager imageManager;
	
	private ImageView imgUserIcon;
	private TextView lblUserName;
	private TextView lblStatus;
	private ListView lvPeople;
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		
		super.onCreate(savedInstanceState);
		
		setContentView(R.layout.additionalpeople_activitiy);
		
		Intent i = getIntent();
		Bundle extras = i.getExtras();
		getActionBar().setDisplayHomeAsUpEnabled(true);
		
		imageManager = new ImageManager(this);
		
		if (extras != null && extras.containsKey("status")){
			final UserReport status = extras.getParcelable("status");
			
			Log.d("additionalpeople", "status - " + status.getStatus());
			
			this.setTitle(status.getPlace().getName());
			
			imgUserIcon = (ImageView) findViewById(R.id.imgUserIcon);
			lblUserName = (TextView) findViewById(R.id.lblUserName);
			lblStatus = (TextView) findViewById(R.id.lblStatus);
			lvPeople = (ListView) findViewById(R.id.lvPeople);
			
			//imgUserIcon.setTag("http://graph.facebook.com/"+status.getExternalUserId()+"/picture");
			//imageManager.displayImage("http://graph.facebook.com/"+status.getExternalUserId()+"/picture", this, imgUserIcon);
			
			lblUserName.setText(status.getFirstName() + " " + status.getLastName());
			lblStatus.setText(status.getStatus());
			
			lvPeople.setAdapter(new AdditionalPeopleAdapter(this, R.layout.user_item, status.getAdditionalPeople()));
			
			imgUserIcon.setOnClickListener(new OnClickListener(){
				@Override
				public void onClick(View v) {
					Intent viewProfile = new Intent(AdditionalPeopleActivity.this, ProfileActivity.class);
					//viewProfile.putExtra("externalUserId", status.getExternalUserId());
					startActivity(viewProfile);	
				}
			});
			
			lblUserName.setOnClickListener(new OnClickListener(){
				@Override
				public void onClick(View v) {
					Intent viewProfile = new Intent(AdditionalPeopleActivity.this, ProfileActivity.class);
					//viewProfile.putExtra("externalUserId", status.getExternalUserId());
					startActivity(viewProfile);	
				}
			});
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
