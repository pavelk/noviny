require File.dirname(__FILE__) + '/../test_helper'
require 'question_votes_controller'

# Re-raise errors caught by the controller.
class QuestionVotesController; def rescue_action(e) raise e end; end

class QuestionVotesControllerTest < Test::Unit::TestCase
  fixtures :question_votes

  def setup
    @controller = QuestionVotesController.new
    @request    = ActionController::TestRequest.new
    @response   = ActionController::TestResponse.new
  end

  def test_should_get_index
    get :index
    assert_response :success
    assert assigns(:question_votes)
  end

  def test_should_get_new
    get :new
    assert_response :success
  end
  
  def test_should_create_question_vote
    old_count = QuestionVote.count
    post :create, :question_vote => { }
    assert_equal old_count+1, QuestionVote.count
    
    assert_redirected_to question_vote_path(assigns(:question_vote))
  end

  def test_should_show_question_vote
    get :show, :id => 1
    assert_response :success
  end

  def test_should_get_edit
    get :edit, :id => 1
    assert_response :success
  end
  
  def test_should_update_question_vote
    put :update, :id => 1, :question_vote => { }
    assert_redirected_to question_vote_path(assigns(:question_vote))
  end
  
  def test_should_destroy_question_vote
    old_count = QuestionVote.count
    delete :destroy, :id => 1
    assert_equal old_count-1, QuestionVote.count
    
    assert_redirected_to question_votes_path
  end
end
