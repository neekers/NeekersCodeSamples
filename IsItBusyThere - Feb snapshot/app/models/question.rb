class Question < ActiveRecord::Base
  belongs_to :StatusResponse
  belongs_to :is_it_busy_questions

  validates :question, :presence => true
end
