package com.isitbusythere.reporter.helpers;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;

import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.impl.client.DefaultHttpClient;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONTokener;

import android.util.Log;

import com.google.android.apps.analytics.GoogleAnalyticsTracker;
import com.isitbusythere.reporter.app.AppEnvironment;
import com.isitbusythere.reporter.app.CurrentEnvironment;
import com.isitbusythere.reporter.app.XhrResponse;

import de.mastacode.http.Http;

public class HttpHelper {
	protected static String MOBILE_SECRET = "rd8d5hEh";
	GoogleAnalyticsTracker tracker;
	
	public static String GetUrl(String url) throws Exception{
		return GetUrl(url, null);
	}
	
	public static String GetBaseUrl(){
		return (CurrentEnvironment.environment == AppEnvironment.Production ? "http://isitbusythere.heroku.com" : "http://10.0.1.91:3000");
	}
	
	public static String GetUrl(String url, List<NameValuePair> params) throws Exception{
		// create a new HttpClient
		final HttpClient client = new DefaultHttpClient();  
		//final String fullUrl = "http://www.isitbusythere.com" + url;
		final String fullUrl = GetBaseUrl() + url;
		
		//append params to the URL
		String queryString = "?test=1";//accountid="+accountId + "&token="+HttpHelper.generateCSRFTokenForMobile(accountId);
		if (params != null && params.size() > 0){
			for (NameValuePair param : params){
				if (param.getName() != "accountid" && param.getName() != "token"){
					queryString += "&" + param.getName()+"="+param.getValue();
				}
			}		
		}
		if (CurrentEnvironment.environment == AppEnvironment.Development){
			Log.i("JSON", fullUrl+queryString);
		}
		
		
		// execute a GET-request and get the response as a String
		final String response = 
		    Http.get(fullUrl+queryString)
		        .use(client)                // use this HttpClient (required)
		        .charset("UTF-8")           // set the encoding... (optional)
		        .followRedirects(true)      // ...follow redirects (optional)
		        .asString();                // execute request
		
		//parse error and response
		//XhrResponse parsed = parseOhJsonResponse(response);		
		
		// see http://code.google.com/p/httpclient-fluent-builder/
		return response;
	}
	
	public static XhrResponse parseOhJsonResponse(String responseJSON){
        
		//Log.i("JSON", responseJSON);
		
		String responseString = null;
		Boolean isError = false;
        JSONObject object;
		try {
			object = (JSONObject) new JSONTokener(responseJSON).nextValue();
			
			if (object.isNull("r")){
				String errorResponse = object.getString("e");
				responseString = errorResponse;
				isError = true;
			}
			else{
			
				try{
					JSONObject responseObj = object.getJSONObject("r");
					responseString = responseObj.toString();
				}
				catch(JSONException e){
					JSONArray responseObj = object.getJSONArray("r");
					responseString = responseObj.toString();
				}
			}
			
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		XhrResponse response = new XhrResponse(responseString, isError);
        
		return response;
	}
    
    public static String request(HttpResponse response){
        String result = "";
        try{
            InputStream in = response.getEntity().getContent();
            BufferedReader reader = new BufferedReader(new InputStreamReader(in));
            StringBuilder str = new StringBuilder();
            String line = null;
            while((line = reader.readLine()) != null){
                str.append(line + "\n");
            }
            in.close();
            result = str.toString();
        }catch(Exception ex){
            result = "Error";
        }
        return result;
    }
    
    public static String generateCSRFTokenForMobile(int accountid) throws Exception
    {
        // Generate a CSRF token that does not rely on shared data 
        // (but does assume roughly consistent server clocks)
    	String token = "";
    	
    	long epoch = System.currentTimeMillis()/1000;
    	String requestHash = accountid + MOBILE_SECRET + epoch;
    	
    	//Log.i("login", "accountid = "+ accountid + ", secret = "+ MOBILE_SECRET + ", time = " + epoch);
    	
    	try {
			token = HttpHelper.sha1(requestHash);
		} catch (NoSuchAlgorithmException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IllegalStateException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (UnsupportedEncodingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		//Log.i("JSON", "original token - " + epoch+token);
		//Log.i("JSON", "original token length - " + (epoch+token).length());
		String tokenNew = String.format("%50s", epoch+token).replace(' ', '0');
		//Log.i("JSON", "new token - " + tokenNew.length());
		
		if ((epoch+token).length() != 50){
			//Log.e("JSON", "bad token - " + token);
			//throw new Exception("Bad token generated");
			//generateCSRFTokenForMobile(accountid);
			 return tokenNew;
		}
		
        //final token will be 10 digits of time then 40 characters of hex hash
		return epoch+token;
    }
    
    public static String sha1(String s) throws NoSuchAlgorithmException, UnsupportedEncodingException {
    	
    	MessageDigest cript = MessageDigest.getInstance("SHA-1");
        cript.reset();
        cript.update(s.getBytes("utf-8"));
        s = new BigInteger(1, cript.digest()).toString(16);
        
        return s;

    }
    
}