package com.isitbusythere.reporter;

import java.util.ArrayList;
import java.util.List;

import android.app.ProgressDialog;
import android.content.SharedPreferences;
import android.content.res.Configuration;
import android.os.AsyncTask;
import android.os.Bundle;
import android.util.SparseBooleanArray;
import android.view.Gravity;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.ListView;
import android.widget.TextView;

import com.isitbusythere.reporter.app.FoursquareProvider;
import com.isitbusythere.reporter.app.QuestionProvider;
import com.isitbusythere.reporter.data.QuestionsAdapter;
import com.isitbusythere.reporter.model.FoursquareVenue;
import com.isitbusythere.reporter.model.Question;
import com.isitbusythere.reporter.model.UserReport;


public class QuestionsActivity extends ActivityBase {
	protected SharedPreferences settings;
	private QuestionsAdapter adapter;
	private ListView lv;
	private int userReportId;
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		
		super.onCreate(savedInstanceState);
		setContentView(R.layout.questions_activity);
		
		TextView lblType = (TextView) findViewById(R.id.lblType);
		lv = (ListView) findViewById(android.R.id.list);
		lv.setChoiceMode(ListView.CHOICE_MODE_MULTIPLE);
		
		Bundle extras = getIntent().getExtras();
		if (extras != null && extras.containsKey("report")){
			UserReport userReport = (UserReport) extras.getParcelable("report");
			userReportId = userReport.getId();
			
			lblType.setText(userReport.getPlace().getCategories().get(0).getName());
			
			//Get type questions
			new LoadQuestions().execute(userReport.getPlace());
		}
		
		Button btnContinue = new Button(QuestionsActivity.this, null, R.style.HomeButton);
		btnContinue.setLayoutParams(new ListView.LayoutParams(ListView.LayoutParams.MATCH_PARENT, ListView.LayoutParams.WRAP_CONTENT));
		btnContinue.setGravity(Gravity.CENTER);
		btnContinue.setPadding(0, 15, 0, 15);
		btnContinue.setText(R.string.Continue);btnContinue.setOnClickListener(new OnClickListener(){

			@Override
			public void onClick(View v) {
				List<String> questionIds = new ArrayList<String>();
				SparseBooleanArray checked = lv.getCheckedItemPositions();
				int size = checked.size(); // number of name-value pairs in the array
				for (int i = 0; i < size; i++) {
				    int key = checked.keyAt(i);
				    boolean value = checked.get(key);
				    if (value){
				    	Question q = (Question) lv.getItemAtPosition(key);
				    	questionIds.add(String.valueOf(q.getQuestionId()));
				    }  
				}
				
				// Submit questions for the report
				new AnswerQuestions().execute(questionIds);
			}
			
		});
		
		lv.addFooterView(btnContinue);
		
		lv.setOnItemClickListener(new OnItemClickListener(){
			@Override
			public void onItemClick(AdapterView<?> parent, View view, int position,
					long id) {
				CheckBox box = (CheckBox) view.findViewById(R.id.chkQuestion);
				box.setChecked(!box.isChecked());
			}
			
		});
		
	}
	
	private class LoadQuestions extends AsyncTask<FoursquareVenue,Void,List<Question>>{
		private ProgressDialog dialogAdapter = new ProgressDialog(QuestionsActivity.this);
	    @Override
	    protected void onPreExecute() {
	        dialogAdapter.setMessage(getString(R.string.Loading));
	        dialogAdapter.setCancelable(true);
	        dialogAdapter.show();
	    	
	    }
		@Override
		protected List<Question> doInBackground(FoursquareVenue... params) {
			FoursquareVenue venue = params[0];
			
			venue = FoursquareProvider.Instance().populateParentCategoryId(QuestionsActivity.this, venue);
			
			return QuestionProvider.Instance().getQuestionsForCategory(venue.getCategories().get(0).getId(), venue.getCategories().get(0).getParentCategoryId());

		}

		@Override
		protected void onPostExecute(List<Question> questionsList) {

			dialogAdapter.dismiss();
			
			if (questionsList == null || questionsList.size() == 0){
				return;
			}
			
			adapter = new QuestionsAdapter(QuestionsActivity.this, R.layout.question_item, questionsList);
			lv.setAdapter(adapter);
		}
		
	}
	
	private class AnswerQuestions extends AsyncTask<List<String>,Void,Void>{
		private ProgressDialog dialogAdapter = new ProgressDialog(QuestionsActivity.this);
	    @Override
	    protected void onPreExecute() {
	        dialogAdapter.setMessage(getString(R.string.Submitting));
	        dialogAdapter.setCancelable(true);
	        dialogAdapter.show();
	    	
	    }
		@Override
		protected Void doInBackground(List<String>... params) {
			List<String> questions = params[0];
			QuestionProvider.Instance().AddQuestionsToReport(currentUser.getUserId(), userReportId, questions);
			return null;
		}
		@Override
		protected void onPostExecute(Void result) {
			dialogAdapter.dismiss();
			
			finish();
		}

		
	}
	
	@Override
	public void onConfigurationChanged(Configuration newConfig) {
		super.onConfigurationChanged(newConfig);
	}

	
}
