class HomeController < ApplicationController
  skip_before_filter :verify_authenticity_token
  def index

    @IsItBusy = IsItBusy.last(25).reverse

    @User = User.last
  end

end
