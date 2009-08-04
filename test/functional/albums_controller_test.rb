require File.dirname(__FILE__) + '/../test_helper'
require 'albums_controller'

# Re-raise errors caught by the controller.
class AlbumsController; def rescue_action(e) raise e end; end

class AlbumsControllerTest < Test::Unit::TestCase
  fixtures :albums

  def setup
    @controller = AlbumsController.new
    @request    = ActionController::TestRequest.new
    @response   = ActionController::TestResponse.new
  end

  def test_should_get_index
    get :index
    assert_response :success
    assert assigns(:albums)
  end

  def test_should_get_new
    get :new
    assert_response :success
  end
  
  def test_should_create_album
    old_count = Album.count
    post :create, :album => { }
    assert_equal old_count+1, Album.count
    
    assert_redirected_to album_path(assigns(:album))
  end

  def test_should_show_album
    get :show, :id => 1
    assert_response :success
  end

  def test_should_get_edit
    get :edit, :id => 1
    assert_response :success
  end
  
  def test_should_update_album
    put :update, :id => 1, :album => { }
    assert_redirected_to album_path(assigns(:album))
  end
  
  def test_should_destroy_album
    old_count = Album.count
    delete :destroy, :id => 1
    assert_equal old_count-1, Album.count
    
    assert_redirected_to albums_path
  end
end
