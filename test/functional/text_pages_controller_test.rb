require File.dirname(__FILE__) + '/../test_helper'
require 'text_pages_controller'

# Re-raise errors caught by the controller.
class TextPagesController; def rescue_action(e) raise e end; end

class TextPagesControllerTest < Test::Unit::TestCase
  fixtures :text_pages

  def setup
    @controller = TextPagesController.new
    @request    = ActionController::TestRequest.new
    @response   = ActionController::TestResponse.new
  end

  def test_should_get_index
    get :index
    assert_response :success
    assert assigns(:text_pages)
  end

  def test_should_get_new
    get :new
    assert_response :success
  end
  
  def test_should_create_text_page
    old_count = TextPage.count
    post :create, :text_page => { }
    assert_equal old_count+1, TextPage.count
    
    assert_redirected_to text_page_path(assigns(:text_page))
  end

  def test_should_show_text_page
    get :show, :id => 1
    assert_response :success
  end

  def test_should_get_edit
    get :edit, :id => 1
    assert_response :success
  end
  
  def test_should_update_text_page
    put :update, :id => 1, :text_page => { }
    assert_redirected_to text_page_path(assigns(:text_page))
  end
  
  def test_should_destroy_text_page
    old_count = TextPage.count
    delete :destroy, :id => 1
    assert_equal old_count-1, TextPage.count
    
    assert_redirected_to text_pages_path
  end
end
