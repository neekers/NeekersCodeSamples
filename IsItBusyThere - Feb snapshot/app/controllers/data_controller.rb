class DataController < ApplicationController
  skip_before_filter :verify_authenticity_token
  def index
  end
  def registerOrUpdateUser
    firstName = params[:firstName]
    lastName = params[:lastName]
    userId = params[:userId]
    photoUrl = params[:photoUrl]

    u = User.find_or_create_by_user_id(:user_id=>userId)
    u.firstname = firstName
    u.lastname = lastName
    u.user_id = userId
    u.photo_url = photoUrl
    u.save
    results = []
    results.push(u)
    responseObject = {:status=>'ok', :results => results}
    render :json=>responseObject, :status =>200
  end

  def getReportInLastHour
    #gets date from one hour ago
    converted_time = Time.now.utc - 1.hour
    busies = IsItBusy.where("updated_at > ? ", converted_time.strftime("%Y-%m-%d %H:%M:%S"))
    statuses = [];
    results = [];
    @YesCounts= IsItBusy.find(:all, :select => 'isitbusy', :conditions => ['isitbusy = ? and updated_at > ?', '1',converted_time.strftime("%Y-%m-%d %H:%M:%S") ])
    @NoCounts= IsItBusy.find(:all, :select => 'isitbusy', :conditions => ['isitbusy = ? and updated_at > ?', '0',converted_time.strftime("%Y-%m-%d %H:%M:%S") ])
    if !busies.nil?
      busies.each do |b|
        #if(!b.status.empty?)
        #u = User.find_by_user_id(b.user_id)
        statuses.push({'venueId'=> b.placeid,'userId'=>b.user.id,'foursquareUserId'=>b.user.user_id,'venueName'=>b.venue_name,'iconUrl'=>b.icon_url,'status'=>b.status,'busy'=>b.isitbusy,
                       'firstName'=>b.user.firstname, 'lastName'=>b.user.lastname, 'photoUrl'=> b.user.photo_url,
                       'createdAt'=>b.updated_at})
        #end
      end
    end
    results.push({"busyCount"=>@YesCounts.count, "notBusyCount"=>@NoCounts.count, "statuses"=>statuses})
    responseObject = {:status=>'ok', :results => results}
    #puts responseObject.to_json
    render :json=>responseObject ,:status =>200

  end

  def getBusyPlaces
    isBusy = params[:isBusy]
    places = params[:googlePlaceId]
    converted_time = Time.now.utc - 1.hour

    busies = IsItBusy.where("updated_at > ? and isitbusy = ? and placeId in (?)", converted_time.strftime("%Y-%m-%d %H:%M:%S"), isBusy != nil ? 1 : 0, places)

    responseObject = {:status=>'ok', :results => busies}
    render :json=>responseObject ,:status =>200
    #Not Busy places from a list of places. This would take an array of placeIds or whatever we use to
    #ID in the db placeref I think and return only those Not Busy or Busy depending on a flag.  We could use this for a number of things.
    ##Like seeing what's busy in an area using a google query first then this would cross ref our info.

  end


  def getBusyInLastHour
    #gets date from one hour ago
    isBusy = params[:isBusy]
    converted_time = Time.now.utc - 1.hour
    statuses = [];
    results = [];
    @YesCounts= IsItBusy.find(:all, :select => 'isitbusy', :conditions => ['isitbusy = ? and updated_at > ?', '1',converted_time.strftime("%Y-%m-%d %H:%M:%S") ])
    @NoCounts= IsItBusy.find(:all, :select => 'isitbusy', :conditions => ['isitbusy = ? and updated_at > ?', '0',converted_time.strftime("%Y-%m-%d %H:%M:%S") ])
    busies = IsItBusy.where("updated_at > ? and isitbusy = ?", converted_time.strftime("%Y-%m-%d %H:%M:%S"), isBusy != nil ? 1 : 0)
    if !busies.nil?
      busies.each do |b|
        #if(!b.status.empty?)
        #u = User.find_by_user_id(b.user_id)
        statuses.push({'placeid'=> b.placeid, 'userId'=>b.user.id,'facebookUserId'=>b.user.user_id, 'status'=>b.status,'busy'=>b.isitbusy, 'firstName'=>b.user.firstname, 'lastName'=>b.user.lastname, 'createdAt'=>b.updated_at})
        #end
      end
    end
    results.push({"busyCount"=>@YesCounts.count, "notBusyCount"=>@NoCounts.count, "statuses"=>statuses})
    responseObject = {:status=>'ok', :results => results}
    render :json=>responseObject ,:status =>200
  end


  def getReportInForPlace(venueId = nil)
    if venueId.nil?
      venueId = params[:venueId]
    end

    fbFriendList = params[:fbFriends]
    time = params[:time]
    @Reports =[]
    if(venueId.to_s != "")
      @YesCounts= IsItBusy.where('isitbusy = ? and placeid = ? and updated_at > ?', '1', venueId,formatTimeForDB(time))
      @NoCounts= IsItBusy.where('isitbusy = ? and placeid = ? and updated_at > ?', '0', venueId,formatTimeForDB(time))
      results = []
      statuses = []
      questions = []
      #users = User.find(:all,:select => 'id', :conditions =>{:user_id => fbFriendList.split(',').map(&:to_i)})
      #busies = IsItBusy.where('placeid = ? and user_id in (?) and updated_at > ?',venueId, users,formatTimeForDB(time)).limit(5).order('updated_at desc')

      #if(busies.size < 3)
        busies = IsItBusy.where('placeid = ? and updated_at > ?',venueId, formatTimeForDB(time)).limit(5).order('updated_at desc')
      #end

      if !busies.nil?
        busies.each do |b|
          #if(!b.status.empty?)
          #u = User.find_by_user_id(b.user_id)
          statuses.push({'id'=>b.id,'venueId'=> b.placeid,'userId'=>b.user.id,'foursquareUserId'=>b.user.user_id, 'status'=>b.status,'busy'=>b.isitbusy,
                         'firstName'=>b.user.firstname, 'lastName'=>b.user.lastname, 'photoUrl'=>b.user.photo_url,
                         'createdAt'=>b.updated_at})
          #end
        end
      end
      questionsReturn = IsItBusyQuestion.joins(:question).where(:is_it_busy_id=>busies).count(:group=>"question_id, questions.question")
      questionsReturn.each do |q,q_count|
        questions.push({:question=>q.gsub("?",""),:count=>q_count})
      end

      results.push({"busyCount"=>@YesCounts.count, "notBusyCount"=>@NoCounts.count, "statuses"=>statuses, "questions"=>questions})
      responseObject = {:status=>'ok', :results => results}
      #puts responseObject.to_json
      render :json=>responseObject ,:status =>200
    end

  end

  def formatTimeForDB time
    if(time != nil)
      converted_time = Time.now.utc - 1.hour
    else
      converted_time = Time.now.utc - 1.year
    end
    converted_time.strftime("%Y-%m-%d %H:%M:%S")
  end

  def getReportInForUser
    #gets date from one hour ago
    user_id = params[:userId]
    time = params[:time]
    u = find_by_user_id(user_id)
    if(user_id.to_s != "0")
      if(time != nil)
        converted_time = Time.now.utc - 1.hour
      else
        converted_time = Time.now.utc - 1.year
      end
      busies = IsItBusy.where("user_id = ? and updated_at > ? ",u.id, converted_time.strftime("%Y-%m-%d %H:%M:%S"))

      render :json=>@report, :status=>200
    end

  end
  def reportIn
    id = params[:id]
    user_id = params[:userId]
    status = params[:status]
    is_it_busy = params[:busy]
    time = params[:time]
    placeId = params[:placeId]
    fbFriendList = params[:fbFriends]
    venue_name = params[:venue_name]
    icon_url = params[:icon_url]
    u =User.find_by_id(user_id)
    if u == nil
      u = User.find_by_user_id(user_id)
    end
    #firstname = u.firstname
    #lastname = u.lastname
    if(user_id.to_s != "0")
      @IsItBusy = IsItBusy.find_or_create_by_id(:id=>id)
      if @IsItBusy.user_id == nil
        @IsItBusy.user_id = u.id
        @IsItBusy.placeid = placeId
        @IsItBusy.venue_name = venue_name
        @IsItBusy.icon_url = icon_url
      end
      @IsItBusy.isitbusy = is_it_busy
      @IsItBusy.status = status
      @IsItBusy.save

      if(placeId.to_s != "0")
        getReportInForPlace(placeId)
      end
    end

  end


  def delete_question
    destroyedItem = Question.find(params[:id]).destroy

    results = {"success"=>true, "item"=>destroyedItem}
    responseObject = {:status=>'ok', :results => results}
    render :json=>responseObject, :status =>200
  end

  def add_question_category
    item = QuestionCategory.create(:question_id=>params[:questionId],
                                   :category_name=>params[:categoryName],
                                   :category_id=>params[:categoryId],
                                   :parent_category_name=>params[:parentCategoryName],
                                   :parent_category_id=>params[:parentCategoryId])

    results = {"success"=>true, "item"=>item}
    responseObject = {:status=>'ok', :results => results}
    render :json=>responseObject, :status =>200
  end

  def get_questions_for_category
    categoryId = params[:categoryId]
    parentCategoryId = params[:parentCategoryId]
    questionsForCategory = QuestionCategory.where(:category_id => categoryId)

    results = []
    if !questionsForCategory.empty?
      questionsForCategory.each do |qc|
        results.push({:questionId=>qc.question_id,:"question"=> qc.question.question})
      end
    else
      questionsForCategory = QuestionCategory.where(:category_id => parentCategoryId)

      if !questionsForCategory.empty?
        questionsForCategory.each do |qc|
          results.push({:questionId=>qc.question_id,:"question"=> qc.question.question})
        end
      end
    end

    responseObject = {:status=>"ok", :results=>{ :questions => results }}
    render :json=>responseObject, :status=>201

  end

  def add_questions_to_report
    userId = params[:userId]
    reportId = params[:reportId]
    questionIds = params[:questionId]

    results = []
    #insert to the table
    if (!questionIds.nil?)
      questionIds.each do |q|
        item = IsItBusyQuestion.create(:is_it_busy_id=>reportId, :question_id=>q)
        results.push(item)
      end
    end

    puts(questionIds)
    responseObject = {:status=>"ok", :results=>{ :success=>true, :items=>results}}
    render :json=>responseObject, :status=>201
  end
##login service

end
