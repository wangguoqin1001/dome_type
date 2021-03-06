class School < ApplicationRecord
  has_many :user_profiles
  has_many :course_user_ships
  has_many :activity_user_ships
  belongs_to :district
  has_many :teams
  has_many :team_user_ships
  has_many :user_roles
  validates :name, presence: true
  validates :district_id, presence: true
  # validates :school_type, presence: true
end
