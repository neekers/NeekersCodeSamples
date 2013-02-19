package com.isitbusythere.reporter.helpers;


import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.database.sqlite.SQLiteStatement;
import android.util.Log;

public class DataHelper {

   private static final String DATABASE_NAME = "ourhistree.db";
   private static final int DATABASE_VERSION = 9;
   private static final String TABLE_NAME = "histree";

   private final Context context;
   private final SQLiteDatabase db;
   private OpenHelper openHelper = null;

   private final SQLiteStatement insertStmt;
   private static final String INSERT = "insert into "
      + TABLE_NAME + "(histreeid, name, thumbnailUrl, privacy, linkToken, lastUpdated, accountId, views, fname, lname, ownerthumb, quickwatch) values (?,?,?,?,?,?,?,?,?,?,?,?)";


    public DataHelper(Context context){
		this.context = context;
		this.openHelper = new OpenHelper(this.context);
		this.db = this.openHelper.getWritableDatabase();
		this.insertStmt = this.db.compileStatement(INSERT);
	}


   //Only downloaded histrees are stored local
    /*
    public long insert(Histree histree) {

	   //Don't insert the histree two times
	   if(histreeExists(histree.getHistreeId())){
		   return -1;
	   }

	   this.insertStmt.bindDouble(1, histree.getHistreeId());
	   this.insertStmt.bindString(2, histree.getName());
	   this.insertStmt.bindString(3, histree.getThumbnail());
	   this.insertStmt.bindString(4, histree.getPrivacyLevel());
	   if (histree.getLinkToken() != null){
		   this.insertStmt.bindString(5, histree.getLinkToken());
	   }
	   this.insertStmt.bindString(6, histree.getLastupdated());
	   this.insertStmt.bindDouble(7, histree.getAccountId());
	   this.insertStmt.bindDouble(8, histree.getViews());
	   this.insertStmt.bindString(9, histree.getFriendfname());
	   this.insertStmt.bindString(10, histree.getFriendlname());
	   this.insertStmt.bindString(11, histree.getFriendthumb());
       this.insertStmt.bindDouble(12, histree.getQuickWatch() ? 1 : 0);

	   long rowId = this.insertStmt.executeInsert();

	   Log.d("Database", "insert histree - " + histree.getAccountId() + "/" + rowId);

	   return rowId;
   }
	
   public Boolean deleteHistree(int histreeId) {
       Log.i("Database", "histree exists? " + histreeExists(histreeId));

      int rows = this.db.delete(TABLE_NAME, "histreeId = ?", new String[]{ String.valueOf(histreeId) });
      Log.i("Database", "rows deleted - " + rows);

      return rows > 0;
   }
*/
   public int deleteAll() {
	      int rows = this.db.delete(TABLE_NAME, null, null);
	      //Log.i("db", "rows deleted - " + rows);

	      return rows;
	   }

   public Boolean histreeExists(int histreeId){

	   Cursor cursor = this.db.query(TABLE_NAME, new String[] { "histreeId" },
			   "histreeId = " + histreeId, null, null, null, "name");

	   Boolean exists = cursor.moveToFirst();

	   return exists;
   }

   public Integer getDownloadedHistreesCount(){

	   Cursor cursor = this.db.query(TABLE_NAME, new String[] { "histreeId" },
			   null, null, null, null, "name");

	   return cursor.getCount();
   }
   
   /*
   public Histree selectHistree(int histreeId) {
	   Histree histree = null;
	   Cursor cursor = this.db.query(TABLE_NAME, new String[] { "histreeId", "name", "quickWatch" },
			    "histreeid = " + histreeId, null, null, null, null);


	   if (cursor.moveToFirst()) {
		   histree = new Histree();
		   histree.setHistreeId(cursor.getInt(0));
		   histree.setName(cursor.getString(1));
		   histree.setIsDownloaded(true);
		   histree.setQuickWatch(cursor.getInt(2) == 1 ? true : false);
	  }

	  cursor.close();

      return histree;
   }
   */
   
   public boolean updateHistree(int histreeId, String name, String thumbnail, String privacy){
	   Log.i("Database", "updateHistreeNameThumbnail - " + histreeId);
	   ContentValues args = new ContentValues();
       args.put("name", name);
       args.put("thumbnailurl", thumbnail);
       args.put("privacy", privacy);

       boolean ret = this.db.update(TABLE_NAME, args,
                        "histreeId =" + histreeId, null) > 0;

       return ret;
   }


   public void close() {
	    // NOTE: openHelper must now be a member of CallDataHelper;
	    // you currently have it as a local in your constructor
	    if (this.openHelper != null) {
	        this.openHelper.close();
	    }
	}

   private static class OpenHelper extends SQLiteOpenHelper {

      OpenHelper(Context context) {
         super(context, DATABASE_NAME, null, DATABASE_VERSION);
      }

      @Override
      public void onCreate(SQLiteDatabase db) {
         db.execSQL("CREATE TABLE " + TABLE_NAME + "(histreeid INTEGER PRIMARY KEY, name TEXT, thumbnailurl TEXT, privacy TEXT, linkToken TEXT, lastUpdated TEXT, accountId INTEGER, views INTEGER, fname TEXT, lname TEXT, ownerthumb TEXT, quickWatch INTEGER)");
      }

      @Override
      public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
         db.execSQL("DROP TABLE IF EXISTS " + TABLE_NAME);
         onCreate(db);
      }
   }
}
