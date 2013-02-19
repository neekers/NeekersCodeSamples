package com.isitbusythere.reporter.app;

import java.lang.ref.WeakReference;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONTokener;

import android.content.Context;
import android.util.Log;

import com.facebook.Request;
import com.facebook.Response;
import com.facebook.Session;
import com.facebook.android.Facebook;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.isitbusythere.reporter.helpers.HttpHelper;
import com.isitbusythere.reporter.model.FoursquareVenue;
import com.isitbusythere.reporter.model.ImageSize;
import com.isitbusythere.reporter.model.Question;
import com.isitbusythere.reporter.model.User;
import com.isitbusythere.reporter.model.UserReport;
import com.isitbusythere.reporter.model.VenueReport;

public class ReporterProvider {
	public static final int WAIT_TIMEOUT = 5 * 1000;

	private ReporterProvider() {
		// no code req'd
	}

	public static ReporterProvider Instance() {
		if (ref == null)
			// it's ok, we can call this constructor
			ref = new ReporterProvider();
		return ref;
	}

	@Override
	public Object clone() throws CloneNotSupportedException {
		throw new CloneNotSupportedException();
		// that'll teach 'em
	}

	private static ReporterProvider ref;

	public VenueReport reportIn(UserReport userReport, String friendsList) {

		VenueReport report = new VenueReport();
		
		// Create a new HttpClient and Post Header
		HttpClient httpclient = new DefaultHttpClient();
		HttpPost httppost = new HttpPost(
				HttpHelper.GetBaseUrl() +  "/data/reportIn");

		try {

			// Add your data
			List<NameValuePair> nameValuePairs = new ArrayList<NameValuePair>();

			nameValuePairs.add(new BasicNameValuePair("id", String
					.valueOf(userReport.getId())));
			nameValuePairs.add(new BasicNameValuePair("userId", String
					.valueOf(userReport.getUserId())));
			nameValuePairs.add(new BasicNameValuePair("placeId", String
					.valueOf(userReport.getPlace().getId())));
			nameValuePairs.add(new BasicNameValuePair("status", userReport
					.getStatus()));
			nameValuePairs.add(new BasicNameValuePair("busy", userReport
					.getIsItBusy().getStatus()));
			nameValuePairs.add(new BasicNameValuePair("icon_url", userReport.getIconUrl(ImageSize.WIDTH_64)));
			nameValuePairs.add(new BasicNameValuePair("venue_name",
					String.format("%s - %s, %s", userReport.getPlace().getName(), 
							userReport.getPlace().getLocation().getAddress(),
							userReport.getPlace().getLocation().getCity())));
			nameValuePairs.add(new BasicNameValuePair("fbFriends",
					friendsList != null ? friendsList : ""));

			nameValuePairs.add(new BasicNameValuePair("time", "true"));
			

			httppost.setEntity(new UrlEncodedFormEntity(nameValuePairs));

			Log.i("reportin", nameValuePairs.toString());

			// Execute HTTP Post Request
			HttpResponse response = httpclient.execute(httppost);
			String responseString = HttpHelper.request(response);

			Log.i("reportin", responseString);

			// Parse the current busy/not busy count into the report object
			JSONArray resultsArr = new JSONArray();
			JSONArray statuses = new JSONArray();
			String status = "";
			try {
				JSONObject responseObj = (JSONObject) new JSONTokener(
						responseString).nextValue();
				resultsArr = responseObj.getJSONArray("results");
				status = responseObj.getString("status");

				if (!status.equalsIgnoreCase("OK")) {
					// Why not?
					Log.d("reportin", "Bad report in call - " + status);
					return null;
				}
				report.setBusyCount(((JSONObject) resultsArr.get(0))
						.getInt("busyCount"));
				report.setNotBusyCount(((JSONObject) resultsArr.get(0))
						.getInt("notBusyCount"));
				report.setLastReportInTime(System.currentTimeMillis());
				report.RecalculateBusyness();

				if (!((JSONObject) resultsArr.get(0)).isNull("statuses")) {
					Gson gson = new Gson();

					statuses = ((JSONObject) resultsArr.get(0))
							.getJSONArray("statuses");
					Type collectionType = new TypeToken<ArrayList<UserReport>>() {
					}.getType();
					ArrayList<UserReport> s = gson.fromJson(
							statuses.toString(), collectionType);

					if (s != null) {
						report.setStatuses(s);
					}
				}

			} catch (JSONException e) {
				Log.e("reportin", "bad report in response json parse", e);
				return null;
			}

		} catch (Exception e) {
			Log.e("reportin", "Bad Report in call", e);
			return null;
		}

		return report;
	}

	public VenueReport getReport(Long userId, Context context, FoursquareVenue venue,
			String friendsList) {
		
		String response;
		
		VenueReport report = new VenueReport();
		report.setPlace(venue);

		try {
			// Add your data
			List<NameValuePair> nameValuePairs = new ArrayList<NameValuePair>();
			nameValuePairs.add(new BasicNameValuePair("venueId",
					venue.getId()));
			nameValuePairs.add(new BasicNameValuePair("fbFriends",
					friendsList != null ? friendsList : ""));

			if (CurrentEnvironment.environment == AppEnvironment.Production) {
				nameValuePairs.add(new BasicNameValuePair("time", "true"));
			}

			response = HttpHelper.GetUrl("/data/getReportInForPlace", nameValuePairs);
			Log.i("reportin", response);

			// Parse the current busy/not busy count into the report object
			JSONArray resultsArr = new JSONArray();
			JSONArray statuses = new JSONArray();
			JSONArray questions = new JSONArray();
			Gson gsonTmp = new Gson();
			WeakReference<Gson> gsonWeak = new WeakReference<Gson>(gsonTmp);
			Gson gson = gsonWeak.get();
			try {
				JSONObject responseObj = (JSONObject) new JSONTokener(
						response).nextValue();
				resultsArr = responseObj.getJSONArray("results");
				JSONObject result = (JSONObject) resultsArr.get(0);

				report.setBusyCount(result.getInt("busyCount"));
				report.setNotBusyCount(result.getInt("notBusyCount"));
				report.RecalculateBusyness();

				if (!result.isNull("statuses")) {
					statuses = result.getJSONArray("statuses");
					// Log.i("reportin", "found statuses: " +
					// statuses.toString());
					Type collectionType = new TypeToken<ArrayList<UserReport>>() {
					}.getType();
					ArrayList<UserReport> s = gson.fromJson(
							statuses.toString(), collectionType);

					if (s != null) {
						report.setStatuses(s);
					}
				}
				
				if (!result.isNull("questions")) {
					questions = result.getJSONArray("questions");
					Type collectionType = new TypeToken<ArrayList<Question>>() {
					}.getType();
					ArrayList<Question> qs = gson.fromJson(
							questions.toString(), collectionType);

					if (qs != null) {
						report.setQuestions(qs);
					}
				}

			} catch (JSONException e) {
				Log.e("reportin", "bad report in response json parse", e);
			}

		} catch (Exception e) {
			Log.e("reportin", "Bad getReportInForPlace in call", e);
		}
		return report;
	}

	public Long registerOrUpdateUser(Context context, User user) {
		Long userId = -1l;

		// Create a new HttpClient and Post Header
		HttpClient httpclient = new DefaultHttpClient();
		HttpPost httppost = new HttpPost(
				HttpHelper.GetBaseUrl() + "/data/registerOrUpdateUser");

		try {

			// Add your data
			List<NameValuePair> nameValuePairs = new ArrayList<NameValuePair>();

			nameValuePairs.add(new BasicNameValuePair("userId", String
					.valueOf(user.getFoursquareUserId())));
			nameValuePairs.add(new BasicNameValuePair("firstName", user
					.getFirstName()));
			nameValuePairs.add(new BasicNameValuePair("lastName", user
					.getLastName()));
			nameValuePairs.add(new BasicNameValuePair("photoUrl", user
					.getPhotoUrl()));

			httppost.setEntity(new UrlEncodedFormEntity(nameValuePairs));

			Log.i("login",
					"registerOrUpdateUser params - "
							+ nameValuePairs.toString());

			// Execute HTTP Post Request
			HttpResponse response = httpclient.execute(httppost);
			String responseString = HttpHelper.request(response);

			Log.i("login", "registerOrUpdateUser reponse - " + responseString);

			// Parse the current busy/not busy count into the report object
			String status = "";
			try {
				JSONObject responseObj = (JSONObject) new JSONTokener(
						responseString).nextValue();
				status = responseObj.getString("status");

				if (!status.equalsIgnoreCase("OK")) {
					// Why not?
					Log.d("login", "Bad user registerOrUpdateUser call - "
							+ status);
				}

				JSONArray resultsArr = responseObj.getJSONArray("results");
				JSONObject userObj = ((JSONObject) resultsArr.get(0))
						.getJSONObject("user");
				userId = userObj.getLong("id");
				Log.i("login", "userid is logged in:" + userId);

			} catch (JSONException e) {
				Log.e("login",
						"bad registerOrUpdateUser in response json parse", e);
			}

		} catch (Exception e) {
			Log.e("login", "Bad registration call", e);
			return -1l;
		}

		return userId;
	}

	public ArrayList<UserReport> getReportsInLastHour() {
		ArrayList<UserReport> reports = new ArrayList<UserReport>();

		String response = "";
		try {
			response = HttpHelper
					.GetUrl("/data/getReportInLastHour");

			Log.i("reports", "GetReportsInLastHour response - " + response);
		} catch (Exception e) {
			Log.e("reports", "bad get reports call - ", e);
			return null;
		}

		JSONArray resultsArr = new JSONArray();
		try {
			JSONObject responseObj = (JSONObject) new JSONTokener(response)
					.nextValue();
			resultsArr = responseObj.getJSONArray("results");

			if (!((JSONObject) resultsArr.get(0)).isNull("statuses")) {
				Gson gson = new Gson();

				JSONArray statuses = ((JSONObject) resultsArr.get(0))
						.getJSONArray("statuses");
				Type collectionType = new TypeToken<ArrayList<UserReport>>() {
				}.getType();
				reports = gson.fromJson(statuses.toString(), collectionType);
				Collections.reverse(reports);
			}

		} catch (JSONException e) {
			Log.e("reports", "bad GetReportsInLastHour json parse", e);
		}

		// return top entry or if none exists return empty place.
		return reports != null ? reports : new ArrayList<UserReport>();
	}
	
	

	public ArrayList<UserReport> getFacebookRecentCheckins(final Context context,
			Facebook facebook) {
		ArrayList<UserReport> checkins = new ArrayList<UserReport>();
		
		String graphPath = "/search?type=checkin&since=-1 hour";
		Request.newGraphPathRequest(Session.getActiveSession(), graphPath, new Request.Callback() {
			
			@Override
			public void onCompleted(Response response) {
				
			}
		}).executeAsync();
		
		/*

		if (response.length() == 0) {
			return checkins;
		}

		JSONObject resultsObj = new JSONObject();
		JSONArray resultsArr = new JSONArray();
		try {
			resultsObj = (JSONObject) new JSONTokener(response).nextValue();
			if (resultsObj.isNull("data")) {
				return checkins;
			}
			resultsArr = (JSONArray) resultsObj.getJSONArray("data");

			for (int i = 0; i < resultsArr.length(); i++) {
				JSONObject obj = resultsArr.getJSONObject(i);

				// From Name
				JSONObject fromObj = (JSONObject) obj.getJSONObject("from");
				ReportStatus status = new ReportStatus();
				status.setStatusType(StatusType.Facebook);
				status.setIsItBusy(BusyStatusType.Facebook);
				status.setFacebookUserId(fromObj.getString("id"));
				String fullName = fromObj.getString("name");
				status.setFirstName(fullName.substring(0, fullName.indexOf(" ")));
				status.setLastName(fullName.substring(fullName.lastIndexOf(" ") + 1));
				if (!obj.isNull("message")) {
					status.setStatus(obj.getString("message"));
				}

				// Place details
				JSONObject placeObj = obj.getJSONObject("place");
				JSONObject locationObj = placeObj.getJSONObject("location");

				// Not good because it causes the UI to do this same query to
				// the places API
				GooglePlace place = ReporterProvider.Instance()
						.GetGooglePlaceByName(context,
								locationObj.getDouble("latitude"),
								locationObj.getDouble("longitude"), 152,
								placeObj.getString("name"));

				// Bad lookup
				if (place == null) {
					Log.i("facebook",
							"No google place match up - "
									+ placeObj.getString("name"));
					continue;
				}
				place.setFacebookPlaceId(placeObj.getString("id"));

				// Check the type of the checkin. We don't want out of the
				// ordinary stuff coming in here like transit stations on fb
				if (!ReporterProvider.Instance().isValidPlaceType(context,
						place)) {
					continue;
				}

				status.setPlace(place);

				// Anyone tagged?
				if (!obj.isNull("tags")) {
					JSONObject tags = obj.getJSONObject("tags");
					JSONArray tagsArray = tags.getJSONArray("data");

					status.setAdditionalPeopleCount(tagsArray.length());
					ArrayList<User> additionalPeople = new ArrayList<User>();
					for (int k = 0; k < tagsArray.length(); k++) {
						JSONObject tag = (JSONObject) tagsArray.get(k);
						User tagged = new User();
						tagged.setFacebookUserId(tag.getString("id"));
						String fullname = tag.getString("name");
						tagged.setFirstName(fullname.substring(0,
								fullname.indexOf(" ")));
						tagged.setLastName(fullname.substring(
								fullname.lastIndexOf(" ") + 1).substring(0, 1)
								+ ".");

						additionalPeople.add(tagged);
					}

					status.setAdditionalPeople(additionalPeople);
				}

				String createdDate = obj.getString("created_time");
				// 2012-02-07T03:27:59+0000 fb uses this
				// 2012-02-08T06:29:27Z needs this format

				status.setCreatedAt(createdDate.replace("+0000", "Z"));
				checkins.add(status);
			}
		} catch (JSONException e) {
			Log.e("place", "bad facebook checkins json parse", e);
		}

		 */
		Log.i("facebook", "GetFacebookRecentCheckins " + checkins.size());

		return checkins;
	}

}
