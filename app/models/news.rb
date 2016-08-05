class News < ApplicationRecord
  belongs_to :admin
  validates :name, presence: true, uniqueness: true, length: {maximum: 60}
  validates :news_type, presence: true
  validates :content, presence: true
  validates :admin_id, presence: true
  validates :desc, presence: true
  validates :cover, presence: true
  mount_uploader :cover, CoverUploader
end