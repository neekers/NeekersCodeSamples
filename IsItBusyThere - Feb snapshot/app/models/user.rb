class User < ActiveRecord::Base  
  has_many :IsItBusies
  has_many :ExternalServices
  belongs_to :StatusResponse
end
