class IsItBusy < ActiveRecord::Base
  belongs_to :user
  belongs_to :StatusResponse
  has_many :is_it_busy_questions
end
