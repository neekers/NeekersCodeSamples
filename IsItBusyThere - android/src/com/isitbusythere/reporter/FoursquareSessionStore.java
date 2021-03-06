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

import android.content.Context;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;
import android.util.Log;

import com.isitbusythere.reporter.foursquare.Foursquare;

public class FoursquareSessionStore {
    
    private static final String TOKEN = "foursquare_token";
    private static final String KEY = "foursquare-session";
    
    public static boolean save(String accessToken, Context context){
    	Log.i("foursq", "saved token - " + accessToken);

        Editor editor =
            context.getSharedPreferences(KEY, Context.MODE_PRIVATE).edit();
        editor.putString(TOKEN, accessToken);
        return editor.commit();
    }

    public static boolean restore(Foursquare session, Context context) {
        SharedPreferences savedSession =
            context.getSharedPreferences(KEY, Context.MODE_PRIVATE);
        
        String userToken = savedSession.getString(TOKEN, null);
        
        if (userToken == null){
        	session = null;
        	return false;
        }

		try {
	        session.setAccessToken(userToken);
	        
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
