class CreateIsItBusyQuestions < ActiveRecord::Migration
  def self.up
    create_table :is_it_busy_questions do |t|
      t.integer :is_it_busy_id
      t.integer :question_id

      t.timestamps
    end
  end

  def self.down
    drop_table :is_it_busy_questions
  end
end
