class Admin::HolidayDefinitionsController < Admin::AdminController
  
  create.after :set_values
  update.after :set_values
  
  def index
    #debugger
    if(params[:search_holidays_days])
      @holiday_definitions = HolidayDefinition.search params[:search_holidays_days], :page => params[:page], :per_page => 10, :order => 'updated_at DESC'
    else
      @holiday_definitions = HolidayDefinition.all( :order => 'updated_at DESC' ).paginate( :per_page => 10, :page => params[:page] )
    end 
    render 'shared/admin/index.js.erb'
  end
  
  show.response do |wants|
    wants.js
  end 

  new_action.response do |wants|
    wants.js
  end

  create.response do |wants|
    wants.js
  end

  edit.response do |wants|
    wants.js
  end

  update.response do |wants|
    wants.js
  end
  
  private
  
  def set_values
     #debugger   
     @holiday_definition.update_attributes( :date_start => params[:date_start].split('/').reverse.join('-'))
     @holiday_definition.update_attributes( :date_end => params[:date_end].split('/').reverse.join('-'))
     @holiday_definition.save 
   end
  
  
end
