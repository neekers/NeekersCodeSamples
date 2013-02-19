package com.isitbusythere.reporter;

import android.app.Activity;
import android.os.Bundle;
import android.widget.ImageView;

import com.isitbusythere.reporter.helpers.ImageManager;

public class ProfileImageActivity extends Activity {
	private ImageManager imageManager;
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		
		super.onCreate(savedInstanceState);
		
		setContentView(R.layout.profileimage_activity);
		
		ImageView imgPhoto = (ImageView) findViewById(R.id.imgPhoto);
		imageManager = new ImageManager(ProfileImageActivity.this);
		
		Bundle extras = getIntent().getExtras();
		if (extras == null){
			finish();
		}
		
		if (extras.containsKey("photoUrl")){
			String photoUrl = extras.getString("photoUrl");
			imgPhoto.setTag(photoUrl);
			imageManager.displayImage(photoUrl, ProfileImageActivity.this, imgPhoto);
		}
		
	}

	
}
