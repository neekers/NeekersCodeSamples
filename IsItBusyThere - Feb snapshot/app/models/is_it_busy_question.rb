class IsItBusyQuestion < ActiveRecord::Base
  belongs_to :is_it_busy
  belongs_to :question

  validates :is_it_busy_id, :presence => true
  validates :question_id, :presence => true
end
