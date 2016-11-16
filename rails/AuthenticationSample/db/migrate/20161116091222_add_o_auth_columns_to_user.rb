class AddOAuthColumnsToUser < ActiveRecord::Migration[5.0]
  def change
    add_column :users, :name, :string
    add_column :users, :token, :string
  end
end
