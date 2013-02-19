class QuestionsController < ApplicationController
  before_filter :require_user, :only=>["index", "categories"]

  #private
  def require_user
    if params[:id] == nil
      redirect_to("/home", :notice => "Not gonna be able to edit me, SUCKA!")
      return
    end

    begin
      @user = User.find(params[:id])
      redirect_to "/home" unless @user.id == 2

    rescue  Exception=>e
      redirect_to "/home"
    end

  end

  def index
    @Questions = Question.all
  end

  def categories
    @Questions = Question.all
    @QuestionCategories = QuestionCategory.all

    client = Foursquare2::Client.new(:client_id => 'VYMGNP2EEX0XJM3HURYU0NA0RGXKAI13XNXWPZW4LJ4LSI3U',
                                     :client_secret => 'EQLDONEHUCB21U3WSJZEHJ1QXFJHA5FLL5CUDQ43K05VZQDR')
    @FoursquareCategories = client.venue_categories()
  end

  def create
    #Add question mark
    question = params[:question]
    if question[question.size-1] != "?"
      question += "?"
    end

    item = Question.create(:question=>question)

    results = {"success"=>true, "item"=>item}
    responseObject = {:status=>'ok', :results => results}
    render :json=>responseObject, :status =>200
  end

  def destroy
    puts "you're going to delete me"
  end

  private
  def current_user
    @current_user ||= FoursquareUser.find(session[:user_id])
  end


end
