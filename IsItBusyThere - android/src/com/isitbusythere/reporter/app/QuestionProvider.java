package com.isitbusythere.reporter.app;

import java.lang.reflect.Type;
import java.util.ArrayList;
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

import android.util.Log;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.isitbusythere.reporter.helpers.HttpHelper;
import com.isitbusythere.reporter.model.Question;

public class QuestionProvider {
	public static final int WAIT_TIMEOUT = 5 * 1000;

	private QuestionProvider() {
		// no code req'd
	}

	public static QuestionProvider Instance() {
		if (ref == null)
			// it's ok, we can call this constructor
			ref = new QuestionProvider();
		return ref;
	}

	@Override
	public Object clone() throws CloneNotSupportedException {
		throw new CloneNotSupportedException();
		// that'll teach 'em
	}

	private static QuestionProvider ref;

	public List<Question> getQuestionsForCategory(String categoryId, String parentCategoryId) {
		List<Question> questions = new ArrayList<Question>();
		
		// Add your data
		List<NameValuePair> params = new ArrayList<NameValuePair>();

		params.add(new BasicNameValuePair("categoryId", categoryId));
		params.add(new BasicNameValuePair("parentCategoryId", parentCategoryId));

		String response = "";
		try {
			response = HttpHelper
					.GetUrl("/data/get_questions_for_category", params);

			Log.i("reports", "getQuestionsForCategory response - " + response);
		} catch (Exception e) {
			Log.e("reports", "bad get reports call - ", e);
			return null;
		}

		JSONObject resultsObj = new JSONObject();
		try {
			JSONObject responseObj = (JSONObject) new JSONTokener(response)
					.nextValue();
			resultsObj = responseObj.getJSONObject("results");
			
				Gson gson = new Gson();

				JSONArray questionsArray = resultsObj.getJSONArray("questions");
				Type collectionType = new TypeToken<ArrayList<Question>>() {
				}.getType();
				questions = gson.fromJson(questionsArray.toString(), collectionType);			

		} catch (JSONException e) {
			Log.e("reports", "bad getQuestionsForCategory json parse", e);
		}

		// return top entry or if none exists return empty place.
		return questions;
	}
	
	public Long AddQuestionsToReport(Long userId, int reportId, List<String> questions) {
		
		// Create a new HttpClient and Post Header
		HttpClient httpclient = new DefaultHttpClient();
		HttpPost httppost = new HttpPost(
				HttpHelper.GetBaseUrl() + "/data/add_questions_to_report");

		try {

			// Add your data
			List<NameValuePair> params = new ArrayList<NameValuePair>();

			params.add(new BasicNameValuePair("userId", String.valueOf(userId)));
			params.add(new BasicNameValuePair("reportId", String.valueOf(reportId)));
			
			for (String q : questions){
				params.add(new BasicNameValuePair("questionId[]", q));
			}

			httppost.setEntity(new UrlEncodedFormEntity(params));

			Log.i("login",
					"AddQuestionsToReport params - "
							+ params.toString());

			// Execute HTTP Post Request
			HttpResponse response = httpclient.execute(httppost);
			String responseString = HttpHelper.request(response);

			Log.i("login", "AddQuestionsToReport reponse - " + responseString);

			// Parse the current busy/not busy count into the report object
			JSONObject responseObj = (JSONObject) new JSONTokener(responseString).nextValue();
			String status = responseObj.getString("status");

			if (!status.equalsIgnoreCase("OK")) {
				// Why not?
				Log.d("login", "Bad user AddQuestionsToReport call - " + status);
			}

		} catch (Exception e) {
			Log.e("login", "Bad AddQuestionsToReport call", e);
			return -1l;
		}

		return userId;
	}
	
}
