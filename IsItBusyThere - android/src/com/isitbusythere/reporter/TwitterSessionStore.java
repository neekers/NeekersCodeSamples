/*
 * Copyright 2010 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.isitbusythere.reporter;

import twitter4j.Twitter;
import twitter4j.auth.AccessToken;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;
import android.util.Log;

public class TwitterSessionStore {
    
    private static final String TOKEN = "twitter_token";
    private static final String SECRET = "twitter_tokensecret";
    private static final String KEY = "twitter-session";
    
    public static boolean save(AccessToken accessToken, Context context){
    	Log.i("twitter", "saved token - " + accessToken.getToken());
    	Log.i("twitter", "saved token secret - " + accessToken.getTokenSecret());
        Editor editor =
            context.getSharedPreferences(KEY, Context.MODE_PRIVATE).edit();
        editor.putString(TOKEN, accessToken.getToken());
        editor.putString(SECRET, accessToken.getTokenSecret());
        return editor.commit();
    }

    public static boolean restore(Twitter session, Context context) {
        SharedPreferences savedSession =
            context.getSharedPreferences(KEY, Context.MODE_PRIVATE);
        
        session.setOAuthConsumer(context.getString(R.string.TWITTER_APP_KEY), context.getString(R.string.TWITTER_APP_SECRET));
        
        String userToken = savedSession.getString(TOKEN, null);
        
        if (userToken == null){
        	session = null;
        	return false;
        }

		try {
	        session.setOAuthAccessToken(new AccessToken(userToken, savedSession.getString(SECRET, null)));
	        
		} catch (IllegalStateException e) {
			//I don't care
		}
        
        return true;
    }
    
    public static void clear(Context context) {
        Editor editor = 
            context.getSharedPreferences(KEY, Context.MODE_PRIVATE).edit();
        editor.clear();
        editor.commit();
    }
    
}
