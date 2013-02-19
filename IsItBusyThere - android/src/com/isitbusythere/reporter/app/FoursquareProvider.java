package com.isitbusythere.reporter.app;

import java.io.IOException;
import java.lang.reflect.Type;
import java.net.MalformedURLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.List;
import java.util.TimeZone;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONTokener;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.isitbusythere.reporter.R;
import com.isitbusythere.reporter.foursquare.Foursquare;
import com.isitbusythere.reporter.helpers.Utils;
import com.isitbusythere.reporter.model.BusyStatusType;
import com.isitbusythere.reporter.model.Category;
import com.isitbusythere.reporter.model.FoursquareVenue;
import com.isitbusythere.reporter.model.FoursquareVenueSmall;
import com.isitbusythere.reporter.model.StatusType;
import com.isitbusythere.reporter.model.UserReport;

public class FoursquareProvider {
	public static final int WAIT_TIMEOUT = 5 * 1000;

	private FoursquareProvider() {
		// no code req'd
	}

	public static FoursquareProvider Instance() {
		if (ref == null)
			// it's ok, we can call this constructor
			ref = new FoursquareProvider();
		return ref;
	}

	@Override
	public Object clone() throws CloneNotSupportedException {
		throw new CloneNotSupportedException();
		// that'll teach 'em
	}

	private static FoursquareProvider ref;


	public ArrayList<UserReport> getFoursquareRecentCheckins(Context context,
			Foursquare foursquare) {
		ArrayList<UserReport> recentStatuses = new ArrayList<UserReport>();

		Calendar calHourAgo = Calendar.getInstance();
		calHourAgo.set(Calendar.HOUR, calHourAgo.get(Calendar.HOUR) - 1);

		// Get the Foursquare places that are busy nearby
		try {

			Bundle params = new Bundle();
			// params.putString("ll", lat+","+lng);
			params.putString("limit", "50"); // Can go up to 100
			params.putString("afterTimestamp",
					String.valueOf(calHourAgo.getTimeInMillis() / 1000));

			String response = foursquare.request("checkins/recent", params);
			Log.i("foursq", "recent checkins response - " + response);

			JSONArray resultsArr = new JSONArray();
			JSONObject resultsObj = (JSONObject) new JSONTokener(response)
					.nextValue();

			JSONObject metaObj = resultsObj.getJSONObject("meta");
			if (metaObj.getInt("code") != 200) {
				Log.e("foursq", "bad GetFoursquareRecentCheckins request - "
						+ metaObj.getInt("code"));
				return null;
			}

			JSONObject responseObj = resultsObj.getJSONObject("response");
			resultsArr = responseObj.getJSONArray("recent");
			if (resultsArr.length() > 0) {

				Calendar cal = Calendar.getInstance();
				for (int i = 0; i < resultsArr.length(); i++) {
					JSONObject recent = (JSONObject) resultsArr.get(i);
					
					//Skip if it's from our app
					String source = recent.getJSONObject("source").getString("name");
					if (source.equalsIgnoreCase("Busy There?")){
						continue;
					}
					
					UserReport status = new UserReport();
					status.setIsItBusy(BusyStatusType.Foursquare);
					status.setStatusType(StatusType.Foursquare);

					cal.setTimeInMillis(recent.getLong("createdAt") * 1000);

					Calendar rightZone = Utils.convertCalendar(cal,
							TimeZone.getTimeZone("GMT"));
					status.setCreatedAt(Utils.getDateFormat().format(
							rightZone.getTime()));

					// Map user now
					JSONObject userObj = recent.getJSONObject("user");
					status.setFoursquareUserId(userObj.getString("id"));
					status.setFirstName(userObj.getString("firstName"));
					if (!userObj.isNull("lastName")) {
						status.setLastName(userObj.getString("lastName"));
					}
					status.setPhotoUrl(String.format("%s/300x300/%s", userObj
							.getJSONObject("photo").getString("prefix"),
							userObj.getJSONObject("photo").getString("suffix")));
					// Profile link no longer in the response
					status.setProfileLink(String.format(
							"http://m.foursquare.com/user?uid=%s",
							userObj.getString("id")));
					if (!recent.isNull("shout")) {
						status.setStatus(recent.getString("shout"));
					}

					// Venue info
					JSONObject venueObj = recent.getJSONObject("venue");
					
					FoursquareVenue venue = new FoursquareVenue();
					
					Gson gson = new Gson();
					Type collectionType = new TypeToken<FoursquareVenue>() {
					}.getType();
					venue = gson.fromJson(venueObj.toString(),
							collectionType);
					if (!FoursquareProvider.Instance().isValidPlaceType(context, venue)) {
						continue;
					}

					status.setPlace(venue);

					recentStatuses.add(status);
				}
			}
		} catch (MalformedURLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return recentStatuses;
	}

	public FoursquareVenue getFoursquareVenueByName(Context context,
			Foursquare foursquare, Double latitude, Double longitude,
			int radius, String name) {
		FoursquareVenue venue = null;

		Gson gson = new Gson();

		Bundle params = new Bundle();
		params.putString("ll", latitude + "," + longitude);
		params.putString("limit", "10"); // Can go up to 100
		params.putString("query", name);
		params.putString("intent", "match");

		String response = "";
		try {
			response = foursquare.request("venues/search", params);
			Log.i("foursq", "venue match response - " + response);
		} catch (MalformedURLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		JSONObject resultsObj;
		try {
			resultsObj = (JSONObject) new JSONTokener(response).nextValue();

			JSONObject metaObj = resultsObj.getJSONObject("meta");
			if (metaObj.getInt("code") != 200) {
				Log.e("foursq", "bad GetFoursquareRecentCheckins request - "
						+ metaObj.getInt("code"));
				return null;
			}

			JSONObject responseObj = resultsObj.getJSONObject("response");
			JSONArray searchVenuesObj = responseObj.getJSONArray("venues");

			// Map venues over
			Type collectionType = new TypeToken<ArrayList<FoursquareVenue>>() {
			}.getType();
			ArrayList<FoursquareVenue> v = gson.fromJson(
					searchVenuesObj.toString(), collectionType);

			if (v.size() > 0) {
				if (v.size() == 1) {
					venue = v.get(0);
				} else {
					for (FoursquareVenue ven : v) {
						Log.i("foursq", "venue search - " + ven.getName());
						Log.i("foursq",
								"venue search verified - " + ven.getVerified());
						if (isValidPlaceType(context, ven)) {
							venue = ven;
							break;
						}
					}
					/*
					 * //Just in case there is no verified places and valid
					 * places this is a failsafe if (venue.getName().length() ==
					 * 0){ venue = v.get(0); }
					 */
				}
			}

			if (venue == null) {
				return null;
			}

			// get REAL here now information because the venue info doesn't have
			// what we need yet
			Calendar calHourAgo = Calendar.getInstance();
			calHourAgo.set(Calendar.HOUR, calHourAgo.get(Calendar.HOUR) - 1);

			Bundle hereParams = new Bundle();
			hereParams.putString("afterTimestamp",
					String.valueOf(calHourAgo.getTimeInMillis() / 1000));
			String hereNowResponse = foursquare.request(
					"venues/" + venue.getId() + "/herenow", hereParams);

			Log.i("foursq", "herenow reponse - "
					+ hereNowResponse);

			JSONObject hereNowResultsObj = (JSONObject) new JSONTokener(
					hereNowResponse).nextValue();
			JSONObject hereResponseObj = hereNowResultsObj.getJSONObject(
					"response").getJSONObject("hereNow");
			venue.getHereNow().setCount(hereResponseObj.getInt("count"));

			// Can also return the people here now
			venue = FoursquareProvider.Instance().mapHereNowToVenue(venue,
					hereResponseObj);
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (MalformedURLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		Log.i("foursq", "venue parsed - " + gson.toJson(venue).toString());

		return venue;
	}
	
	public FoursquareVenue getFoursquareVenueById(Foursquare foursquare, String venueId) {
		FoursquareVenue venue = null;

		Gson gson = new Gson();

		String response = "";
		try {
			response = foursquare.request("venues/" + venueId);
			Log.i("foursq", "venue match response - " + response);
		} catch (MalformedURLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		JSONObject resultsObj;
		try {
			resultsObj = (JSONObject) new JSONTokener(response).nextValue();

			JSONObject metaObj = resultsObj.getJSONObject("meta");
			if (metaObj.getInt("code") != 200) {
				Log.e("foursq", "bad GetFoursquareRecentCheckins request - "
						+ metaObj.getInt("code"));
				return null;
			}

			JSONObject responseObj = resultsObj.getJSONObject("response").getJSONObject("venue");

			// Map venues over
			Type collectionType = new TypeToken<FoursquareVenue>() {
			}.getType();
			venue = gson.fromJson(
					responseObj.toString(), collectionType);

			
			// get REAL here now information because the venue info doesn't have
			// what we need yet
			Calendar calHourAgo = Calendar.getInstance();
			calHourAgo.set(Calendar.HOUR, calHourAgo.get(Calendar.HOUR) - 1);

			Bundle hereParams = new Bundle();
			hereParams.putString("afterTimestamp",
					String.valueOf(calHourAgo.getTimeInMillis() / 1000));
			String hereNowResponse = foursquare.request(
					"venues/" + venue.getId() + "/herenow", hereParams);

			Log.i("foursq", "herenow reponse - "
					+ hereNowResponse);

			JSONObject hereNowResultsObj = (JSONObject) new JSONTokener(
					hereNowResponse).nextValue();
			JSONObject hereResponseObj = hereNowResultsObj.getJSONObject(
					"response").getJSONObject("hereNow");
			venue.getHereNow().setCount(hereResponseObj.getInt("count"));

			// Can also return the people here now
			venue = FoursquareProvider.Instance().mapHereNowToVenue(venue,
					hereResponseObj);
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (MalformedURLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		Log.i("foursq", "venue parsed - " + gson.toJson(venue).toString());

		return venue;
	}
	
	public List<FoursquareVenue> getFoursquareVenuesByName(Context context,
			Foursquare foursquare, Double latitude, Double longitude,
			int radius, String name) {
		List<FoursquareVenue> venues = new ArrayList<FoursquareVenue>();

		Gson gson = new Gson();

		Bundle params = new Bundle();
		params.putString("ll", latitude + "," + longitude);
		params.putString("limit", "10"); // Can go up to 100
		params.putString("query", name);
		params.putString("intent", "browse");
		params.putString("radius", String.valueOf(radius));

		String response = "";
		try {
			response = foursquare.request("venues/search", params);
			Log.i("foursq", "venue match response - " + response);
		} catch (MalformedURLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		JSONObject resultsObj;
		try {
			resultsObj = (JSONObject) new JSONTokener(response).nextValue();

			JSONObject metaObj = resultsObj.getJSONObject("meta");
			if (metaObj.getInt("code") != 200) {
				Log.e("foursq", "bad GetFoursquareRecentCheckins request - "
						+ metaObj.getInt("code"));
				return null;
			}

			JSONObject responseObj = resultsObj.getJSONObject("response");
			JSONArray searchVenuesObj = responseObj.getJSONArray("venues");

			// Map venues over
			Type collectionType = new TypeToken<ArrayList<FoursquareVenue>>() {
			}.getType();
			ArrayList<FoursquareVenue> v = gson.fromJson(
					searchVenuesObj.toString(), collectionType);

			if (v.size() > 0) {
			
				for (FoursquareVenue ven : v) {
					Log.i("foursq", "venue search - " + ven.getName());
					Log.i("foursq",
							"venue search verified - " + ven.getVerified());
					if (isValidPlaceType(context, ven)) {
						venues.add(ven);
						break;
					}
				}
			
			}
			
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} 

		return venues;
	}
	
	public ArrayList<FoursquareVenue> getFoursquarePlacesNearby(Foursquare foursquare, Double latitude, Double longitude, int radius, String categories) {
		
		List<FoursquareVenue> venuesTemp = new ArrayList<FoursquareVenue>();
		ArrayList<FoursquareVenue> venues = new ArrayList<FoursquareVenue>();
		
		Bundle bundle = new Bundle();
		bundle.putString("radius", String.valueOf(radius));
		bundle.putString("ll", latitude + "," + longitude);
		if (categories != null){
			bundle.putString("categoryId", categories);
		}
		
		try {
			String response = foursquare.request("venues/search", bundle);

			Log.i("foursq", "GetFoursquarePlacesNearby reponse - " + response);

			JSONObject resultsObj = (JSONObject) new JSONTokener(response)
					.nextValue();

			JSONObject metaObj = resultsObj.getJSONObject("meta");
			if (metaObj.getInt("code") != 200) {
				Log.e("foursq", "bad GetFoursquarePlacesNearby request - "
						+ metaObj.getInt("code"));
				return null;
			}

			JSONObject responseObj = resultsObj.getJSONObject("response");
			JSONArray searchVenuesObj = responseObj.getJSONArray("venues");

			Gson gson = new Gson();

			// Map venues over
			Type collectionType = new TypeToken<ArrayList<FoursquareVenue>>() {
			}.getType();
			venuesTemp = gson.fromJson(searchVenuesObj.toString(), collectionType);
		} catch (MalformedURLException e) {
			Log.e("foursq", "GetFoursquarePlacesNearby", e);
		} catch (IOException e) {
			Log.e("foursq", "GetFoursquarePlacesNearby", e);
		} catch (JSONException e) {
			Log.e("foursq", "GetFoursquarePlacesNearby", e);
		}
		
		for (FoursquareVenue v : venuesTemp){
			//boolean isValid = ReporterProvider.Instance().isValidPlaceType(context, v);
			//if (isValid){ 
				venues.add(v);
			//}
		}

		return venues;
	}

	public ArrayList<FoursquareVenue> getSimilarFoursquarePlacesNearby(
			Foursquare foursquare, FoursquareVenueSmall venue) {

		ArrayList<FoursquareVenue> venues = new ArrayList<FoursquareVenue>();
		Bundle bundle = new Bundle();
		bundle.putString("categoryId", venue.getCategoryId());
		bundle.putString("radius", "1500");
		bundle.putString("ll", venue.getLat() + "," + venue.getLng());

		try {
			String response = foursquare.request("venues/search", bundle);

			Log.i("i", "GetSimilarFoursquarePlacesNearby reponse - " + response);

			JSONObject resultsObj = (JSONObject) new JSONTokener(response)
					.nextValue();

			JSONObject metaObj = resultsObj.getJSONObject("meta");
			if (metaObj.getInt("code") != 200) {
				Log.e("foursq", "bad GetSimilarFoursquarePlaces request - "
						+ metaObj.getInt("code"));
				return null;
			}

			JSONObject responseObj = resultsObj.getJSONObject("response");
			JSONArray searchVenuesObj = responseObj.getJSONArray("venues");

			Gson gson = new Gson();

			// Map venues over
			Type collectionType = new TypeToken<ArrayList<FoursquareVenue>>() {
			}.getType();
			venues = gson.fromJson(searchVenuesObj.toString(), collectionType);
		} catch (MalformedURLException e) {
			Log.e("foursq", "GetSimilarFoursquarePlaces", e);
		} catch (IOException e) {
			Log.e("foursq", "GetSimilarFoursquarePlaces", e);
		} catch (JSONException e) {
			Log.e("foursq", "GetSimilarFoursquarePlaces", e);
		}
		

		return venues;
	}

	public void getFoursquareCategories(Context context, SharedPreferences settings, Foursquare foursquare) {
		Long lastUpdated = settings.getLong("subcategories_updated", 0);
		Calendar lastUpdatedCal = Calendar.getInstance();
		lastUpdatedCal.setTimeInMillis(lastUpdated);
		Calendar lastWeek = Calendar.getInstance();
		lastWeek.set(Calendar.DAY_OF_YEAR, lastWeek.get(Calendar.DAY_OF_YEAR) - 7);
		
		if (!lastUpdatedCal.before(lastWeek)){
			return;
		}
		
		List<Category> categories = new ArrayList<Category>();

		Gson gson = new Gson();

		try {
			String venueResponse = foursquare.request("venues/categories");
			Log.i("foursq", "GetFoursquareCategories response - "
					+ venueResponse);

			JSONObject responseObj = (JSONObject) new JSONTokener(venueResponse)
					.nextValue();
			JSONObject metaObj = responseObj.getJSONObject("meta");
			if (metaObj.getInt("code") != 200) {
				Log.e("foursq", "bad GetFoursquareCategories request - "
						+ metaObj.getInt("code"));
				return;
			}

			JSONArray venueResponseObject = responseObj.getJSONObject("response").getJSONArray("categories");

			Type collectionType = new TypeToken<ArrayList<Category>>() {
			}.getType();
			categories = gson.fromJson(venueResponseObject.toString(),
					collectionType);

			String[] types = context.getResources().getStringArray(
					R.array.FoursquareCategories);
			ArrayList<String> typesList = new ArrayList<String>(
					Arrays.asList(types));
			List<String> goodTypes = new ArrayList<String>();
			List<String> goodCategories = new ArrayList<String>();
			
			for (Category c : categories){
	
				if (typesList.contains(c.getName().toLowerCase())) {
					Log.i("category", "valid category - " + c.getName());
					goodTypes.add(c.getId());
					
					if (c.getSubCategories() != null && c.getSubCategories().size() > 0){
						for (Category sc : c.getSubCategories()){
							Log.i("category", "sub category - " + c.getId() + ":" + sc.getName());
							goodCategories.add(c.getId() + ":" + sc.getId());
						}
					}
				}
			}
			
			settings.edit().putString("categories", Utils.join(goodTypes.toArray(new String[goodTypes.size()]), ",")).commit();
			String subCats = Utils.join(goodCategories.toArray(new String[goodCategories.size()]), ",");
			settings.edit().putString("subcategories", subCats).commit();
			settings.edit().putLong("subcategories_updated", Calendar.getInstance().getTimeInMillis()).commit();
			
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (MalformedURLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}

	private FoursquareVenue mapHereNowToVenue(FoursquareVenue venue,
			JSONObject hereResponseObj) throws JSONException {
		// Can also return the people here now
		if (venue.getHereNow().getCount() > 0) {
			Calendar cal = Calendar.getInstance();
			ArrayList<UserReport> statuses = new ArrayList<UserReport>(
					venue.getHereNow().getCount());
			int hereNowResponseCount = hereResponseObj.getJSONArray("items")
					.length();
			for (int i = 0; i < hereNowResponseCount; i++) {
				JSONObject item = (JSONObject) hereResponseObj.getJSONArray(
						"items").get(i);
				JSONObject person = (JSONObject) item.getJSONObject("user");

				UserReport status = new UserReport();
				status.setFoursquareUserId(person.getString("id"));
				status.setIsItBusy(BusyStatusType.Foursquare);
				status.setStatusType(StatusType.Foursquare);
				status.setFirstName(person.getString("firstName"));
				if (!person.isNull("lastName")) {
					status.setLastName(person.getString("lastName"));
				}
				status.setPhotoUrl(String.format("%s/300x300/%s", person
						.getJSONObject("photo").getString("prefix"), person
						.getJSONObject("photo").getString("suffix")));
				status.setProfileLink(String.format(
						"http://m.foursquare.com/user?uid=%s",
						person.getString("id")));
				cal.setTimeInMillis(item.getLong("createdAt") * 1000);
				Calendar rightZone = Utils.convertCalendar(cal,
						TimeZone.getTimeZone("GMT"));
				status.setCreatedAt(Utils.getDateFormat().format(
						rightZone.getTime()));

				statuses.add(status);
			}

			venue.setStatuses(statuses);
		}

		return venue;
	}

	public void foursquareCheckin(Foursquare foursquare, String venueId,
			String message) {

		try {

			Bundle params = new Bundle();
			params.putString("venueId", venueId);
			params.putString("shout", message);
			params.putString("broadcast", "public");

			String response = foursquare
					.request("checkins/add", params, "POST");

			Log.i("foursquare", params.toString());
			Log.i("foursquare", response);

			// Parse the current busy/not busy count into the report object
			try {
				JSONObject responseObj = (JSONObject) new JSONTokener(response)
						.nextValue();
				JSONObject metaObj = responseObj.getJSONObject("meta");
				if (metaObj.getInt("code") != 200) {
					Log.e("foursq",
							"bad GetFoursquareRecentCheckins request - "
									+ metaObj.getInt("code"));
				}

			} catch (JSONException e) {
				Log.e("foursquare", "bad checkin response json parse", e);
			}

		} catch (Exception e) {
			Log.e("foursquare", "Bad checkin call", e);
		}

	}

	public FoursquareVenue populateParentCategoryId(Context context, FoursquareVenue venue) {
		SharedPreferences settings = context.getSharedPreferences(context.getString(R.string.PREFS_NAME), 0);
		if (venue.getCategories().size() == 0) {
			return venue;
		}

		String subcategoriesString = settings.getString("subcategories", "");
		List<String> goodCategories = Arrays.asList(subcategoriesString.split(","));
		
		for (String cat : goodCategories){
			String[] cats = cat.split(":");
			String parentId = cats[0];
			String catId = cats[1];
			
			if (catId.equalsIgnoreCase(venue.getCategories().get(0).getId())){
				venue.getCategories().get(0).setParentCategoryId(parentId);
				break;
			}
		}
	
		return venue;
	}
	
	private Boolean isValidPlaceType(Context context, FoursquareVenue venue) {
		SharedPreferences settings = context.getSharedPreferences(context.getString(R.string.PREFS_NAME), 0);
		if (venue.getCategories().size() == 0) {
			return false;
		}

		Boolean validType = false;
		String subcategoriesString = settings.getString("subcategories", "");
		List<String> goodCategories = Arrays.asList(subcategoriesString.split(","));
		
		for (String cat : goodCategories){
			String[] cats = cat.split(":");
			String catId = cats[1];
			
			if (catId == venue.getCategories().get(0).getId()){
				validType = true;
			}
		}
		
		if (!validType) {
			Log.i("foursq", String.format("Not a valid place type to show - %s : %s ", venue.getCategories().get(0).getName(),
					venue.getCategories().get(0).getId()));
			return false;
		}
		return validType;
	}
}
