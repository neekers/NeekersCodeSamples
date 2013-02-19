package com.isitbusythere.reporter.helpers;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.text.ParsePosition;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.TimeZone;

import android.content.Context;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Matrix;
import android.net.Uri;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Log;
import android.widget.Toast;

public class Utils {
    public static boolean shinyNewAPIsSupported = android.os.Build.VERSION.SDK_INT > 10;

	public static enum AssetType{
		Photo,
		Video,
		Audio
	}
	public static String INTENT_DOWNLOAD = "com.ourhistree.viewer.download_histree";

	public static Bitmap decodeFile(File f){
	    Bitmap b = null;
	    try {
	        //Decode with inSampleSize
	        BitmapFactory.Options o2 = new BitmapFactory.Options();
	        o2.inSampleSize = 2;
	        b = BitmapFactory.decodeStream(new FileInputStream(f), null, o2);
	    } catch (FileNotFoundException e) {
	    	Log.e("bitmap", "decode failed", e);
	    }
	    return b;
	}

	public static Bitmap decodeFileSmall(File f){
	    Bitmap b = null;
	    try {
	        //Decode with inSampleSize
	        BitmapFactory.Options o2 = new BitmapFactory.Options();
	        o2.inSampleSize = 8;
	        b = BitmapFactory.decodeStream(new FileInputStream(f), null, o2);
	    } catch (FileNotFoundException e) {
	    	//Log.e("bitmap", "decode failed", e);
	    }
	    return b;
	}

	public static Bitmap decodeFile(File f, Integer maxSize){
	    Bitmap b = null;
	    try {
	        //Decode image size
	        BitmapFactory.Options o = new BitmapFactory.Options();
	        o.inJustDecodeBounds = true;

	        FileInputStream fis = new FileInputStream(f);
	        BitmapFactory.decodeStream(fis, null, o);
	        fis.close();

	        int scale = 1;
	        if (o.outHeight > maxSize || o.outWidth > maxSize) {
	            scale = (int) Math.pow(2, (int) Math.round(Math.log(maxSize / (double) Math.max(o.outHeight, o.outWidth)) / Math.log(0.5)));
	        }

	        //Decode with inSampleSize
	        BitmapFactory.Options o2 = new BitmapFactory.Options();
	        o2.inSampleSize = scale;
	        fis = new FileInputStream(f);
	        b = BitmapFactory.decodeStream(fis, null, o2);
	        fis.close();
	    } catch (FileNotFoundException e) {
			e.printStackTrace();
	    } catch (IOException e) {
			e.printStackTrace();
		}
	    return b;
	}

	/**
	 * This method reads simple text file
	 * @param inputStream
	 * @return data from file
	 */
	public static String ReadTextFile(InputStream inputStream) {
		ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
		byte buf[] = new byte[1024];
		int len;
		try {
			while ((len = inputStream.read(buf)) != -1) {
				outputStream.write(buf, 0, len);
			}
			outputStream.close();
			inputStream.close();
		} catch (IOException e) {
		}
		return outputStream.toString();
	}

	public static String convertToLocalFile(int histreeId, String url){

		Uri assetUri = Uri.parse(url);

		String filePath = Environment.getExternalStorageDirectory() + "/ourhistree/histrees/" + histreeId + "/" + assetUri.getLastPathSegment();

		return filePath;
	}

	public static ImageInfo convertUriToFileName(Context context, Uri imageUri)  {
		ImageInfo info = new ImageInfo();
		Cursor cursor = null;
		int file_ColumnIndex = 0;
		int orientation_ColumnIndex = 2;
		int orientation = 0;

		AssetType assetType = null;
		if (imageUri.toString().contains("images")){
			assetType = AssetType.Photo;
	    }
	    else if (imageUri.toString().contains("video")){
	    	assetType = AssetType.Video;
	    }

		try {

			switch(assetType){
				case Photo:
					String [] proj={MediaStore.Images.Media.DATA, MediaStore.Images.Media.ORIENTATION};
				    cursor = context.getContentResolver().query( imageUri,
				            proj, // Which columns to return
				            null,       // WHERE clause; which rows to return (all rows)
				            null,       // WHERE clause selection arguments (none)
				            null); // Order-by clause (ascending by name)

				    file_ColumnIndex = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DATA);
				    orientation_ColumnIndex = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.ORIENTATION);

				    if (cursor.moveToFirst()){
				    	orientation = cursor.getInt(orientation_ColumnIndex);
				    	//Log.i("upload", "orienatation - " + orientation);

				    	info.info = cursor.getString(file_ColumnIndex);
				    	info.rotateAngle = orientation;
				    	return info;
				    }
					break;

				case Video:
					String [] proj2={MediaStore.Video.Media.DATA};
				    cursor = context.getContentResolver().query( imageUri,
				            proj2, // Which columns to return
				            null,       // WHERE clause; which rows to return (all rows)
				            null,       // WHERE clause selection arguments (none)
				            null); // Order-by clause (ascending by name)

				    file_ColumnIndex = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.DATA);
					break;


			}

		    if (cursor.moveToFirst()) {
		    	info.info = cursor.getString(file_ColumnIndex);
		    	return info;
		    }
		    return null;
		} finally {
		    if (cursor != null) {
		        cursor.close();
		    }
		}
	}

	public static class ImageInfo{
		public String info;
		public int rotateAngle;
	}

	public static String CapFirstLetter(String s){
		if (s.length() == 0) return s;
		return s.substring(0, 1).toUpperCase() + s.substring(1).toLowerCase();
	}

	public static Bitmap CreateRotatedBitmap(Bitmap oBitmap, float rotateAngle){
		// create a matrix for the manipulation
		Matrix matrix = new Matrix();

		// rotate the Bitmap
		matrix.postRotate(rotateAngle);


		// recreate the new Bitmap
		Bitmap resizedBitmap = Bitmap.createBitmap(oBitmap, 0, 0,
				oBitmap.getWidth(), oBitmap.getHeight(), matrix, true);
		oBitmap.recycle();

		return resizedBitmap;
	}

	public static void errorHandler(Context context, String errorMessage){
		 Toast.makeText(context, errorMessage, Toast.LENGTH_SHORT).show();
	}

	public static boolean deleteDirectory(File path) {
        if( path.exists() ) {
          File[] files = path.listFiles();
          if (files == null) {
              return true;
          }
          for(int i=0; i<files.length; i++) {
             if(files[i].isDirectory()) {
               deleteDirectory(files[i]);
             }
             else {
               files[i].delete();
             }
          }
        }
        return( path.delete() );
  }
	
	public static String join(String[] s, String glue)
	{
	  int k=s.length;
	  if (k==0)
	    return null;
	  StringBuilder out=new StringBuilder();
	  out.append(s[0]);
	  for (int x=1;x<k;++x)
	    out.append(glue).append(s[x]);
	  return out.toString();
	}
	
	/**
	 * Adapt calendar to client time zone.
	 * @param calendar - adapting calendar
	 * @param timeZone - client time zone
	 * @return adapt calendar to client time zone
	 */
	public static Calendar convertCalendar(final Calendar calendar, final TimeZone timeZone) {
	    Calendar ret = new GregorianCalendar(timeZone);
	    ret.setTimeInMillis(calendar.getTimeInMillis() +
	            timeZone.getOffset(calendar.getTimeInMillis()) -
	            TimeZone.getDefault().getOffset(calendar.getTimeInMillis()));
	    ret.getTime();
	    return ret;
	}
	
	public static String formatDate(String dateStr){
		
        SimpleDateFormat formatter = getDateFormat();
        formatter.setTimeZone(TimeZone.getTimeZone("GMT"));
        ParsePosition pos = new ParsePosition(0);
        long then  = formatter.parse(dateStr, pos).getTime();
        long now = new Date().getTime();

        long seconds = (now - then)/1000;
        long minutes = seconds/60;
        long hours = minutes/60;
        long days = hours/24;

        String friendly = null;
        long num = 0;
        if (days > 0) {
            num = days;
            friendly = days + " day";
        } else if (hours > 0) {
            num = hours;
            friendly = hours + " hr";
        } else if (minutes > 0) {
            num = minutes;
            friendly = minutes + " min";
        } else {
            num = seconds;
            friendly = seconds + " sec";
        }
        if (num > 1) {
            friendly += "s";
        }
        return friendly + " ago";
	}
	
	public static String formatDateShort(String dateStr){
		
        SimpleDateFormat formatter = getDateFormat();
        formatter.setTimeZone(TimeZone.getTimeZone("GMT"));
        ParsePosition pos = new ParsePosition(0);
        long then  = formatter.parse(dateStr, pos).getTime();
        long now = new Date().getTime();

        long seconds = (now - then)/1000;
        long minutes = seconds/60;
        long hours = minutes/60;
        long days = hours/24;

        String friendly = null;
        if (days > 0) {
            friendly = days + "d";
        } else if (hours > 0) {
            friendly = hours + "h";
        } else if (minutes > 0) {
            friendly = minutes + "m";
        } else {
            friendly = seconds + "s";
        }
        return friendly + " ago";
	}
	
	/**
     * Returns a SimpleDateFormat object we use for
     * parsing and rendering timestamps.
     * 
     * @return
     */
    public static SimpleDateFormat getDateFormat() {
        return new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
    }
}
