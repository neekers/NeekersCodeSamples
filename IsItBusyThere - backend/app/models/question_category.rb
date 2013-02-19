class QuestionCategory < ActiveRecord::Base

  belongs_to :question

  validates :question_id, :presence => true
  validates :category_id, :presence => true
end
