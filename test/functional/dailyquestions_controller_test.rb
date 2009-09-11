require File.dirname(__FILE__) + '/../test_helper'
require 'dailyquestions_controller'

# Re-raise errors caught by the controller.
class DailyquestionsController; def rescue_action(e) raise e end; end

class DailyquestionsControllerTest < Test::Unit::TestCase
  fixtures :dailyquestions

  def setup
    @controller = DailyquestionsController.new
    @request    = ActionController::TestRequest.new
    @response   = ActionController::TestResponse.new
  end

  def test_should_get_index
    get :index
    assert_response :success
    assert assigns(:dailyquestions)
  end

  def test_should_get_new
    get :new
    assert_response :success
  end
  
  def test_should_create_dailyquestion
    old_count = Dailyquestion.count
    post :create, :dailyquestion => { }
    assert_equal old_count+1, Dailyquestion.count
    
    assert_redirected_to dailyquestion_path(assigns(:dailyquestion))
  end

  def test_should_show_dailyquestion
    get :show, :id => 1
    assert_response :success
  end

  def test_should_get_edit
    get :edit, :id => 1
    assert_response :success
  end
  
  def test_should_update_dailyquestion
    put :update, :id => 1, :dailyquestion => { }
    assert_redirected_to dailyquestion_path(assigns(:dailyquestion))
  end
  
  def test_should_destroy_dailyquestion
    old_count = Dailyquestion.count
    delete :destroy, :id => 1
    assert_equal old_count-1, Dailyquestion.count
    
    assert_redirected_to dailyquestions_path
  end
end
