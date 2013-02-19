package com.isitbusythere.reporter.data;

import java.util.ArrayList;
import java.util.List;

import android.app.Activity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.CheckBox;
import android.widget.TextView;

import com.isitbusythere.reporter.R;
import com.isitbusythere.reporter.model.Question;



public class QuestionsAdapter extends ArrayAdapter<Question> {

	private List<Question> questions = new ArrayList<Question>();
	private final LayoutInflater mInflater;
	private Activity context;
	private final int textViewResourceId;

	public List<Question> getQuestions(){
		return this.questions;
	}

	public QuestionsAdapter(Activity context, int textViewResourceId, List<Question> items) {
		 super(context, textViewResourceId, items);

		 this.mInflater = LayoutInflater.from(context);

		 this.context = context;
		 this.questions = items;
		 this.textViewResourceId = textViewResourceId;
		 
	}
	
    @Override
    public Question getItem(int position) {
        return this.questions.get(position);
    }

    @Override
	public View getView(final int position, View convertView, ViewGroup parent)
	{

		ViewHolder holder;

		//Get the current alert object
		final Question question = getItem(position);

		//Inflate the view
		if(convertView==null){
			convertView = this.mInflater.inflate(this.textViewResourceId, parent, false);
			holder = new ViewHolder();
			holder.txtQuestion = (TextView) convertView.findViewById(R.id.txtQuestion);
			holder.chkQuestion = (CheckBox) convertView.findViewById(R.id.chkQuestion);
			
			convertView.setTag(holder);
		}
		else{
			holder = (ViewHolder)convertView.getTag();
		}


		//Assign the appropriate data from our alert object above
		holder.txtQuestion.setText(question.getQuestion());
		holder.chkQuestion.setTag(question.getQuestionId());
		
		return convertView;
	}

	private final static class ViewHolder {
		TextView txtQuestion;
		CheckBox chkQuestion;
	}
}


