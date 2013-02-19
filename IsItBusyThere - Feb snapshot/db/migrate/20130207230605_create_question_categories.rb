class CreateQuestionCategories < ActiveRecord::Migration
  def self.up
    create_table :question_categories do |t|
      t.integer :question_id
      t.string :category_id

      t.timestamps
    end
  end

  def self.down
    drop_table :question_categories
  end
end
